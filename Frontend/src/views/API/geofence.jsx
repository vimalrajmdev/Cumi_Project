import React, { useRef, useState, useMemo, useEffect } from 'react'
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { AgGridReact } from 'ag-grid-react';
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import axios from 'axios';
import { BallTriangle } from 'react-loader-spinner';
import PropTypes from 'prop-types';
import { getConfig } from 'src/config';
import { CButton, CModal, CModalBody, CModalFooter, CModalTitle } from '@coreui/react';
import defaultlogo from '../../assets/images/apple-logo.png'; // no curly braces!
import Logo from '../../assets/images/Base64/Apple_base64';
import logo from 'src/assets/images/Base64/Apple_base64'; // Can also be base64 string
import Swal from 'sweetalert2';

import ExcelJS from "exceljs";
import autoTable from 'jspdf-autotable';
import { saveAs } from "file-saver";
import { BsGeo } from 'react-icons/bs';
import { Card, CardBody, CardHeader } from 'react-bootstrap';

const geofence = ({ auth }) => {
    const API_URL = getConfig().REACT_APP_API_URL;
    const componentRef = useRef(null);
    const [filteredRowDef, setFilteredRowDef] = useState([]);
    const [show, setShow] = useState(false);
    const [rowdef, setRowdef] = useState([])
    const [selectedOption, setSelectedOption] = useState('All'); // State to manage selected option
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const [loading, setLoading] = useState(false); // Loader state


    // Download Excel
    const gridRef = useRef(null);
    const downloadExcel = async () => {
        const columnDefs = [
            { header: "Device ID", key: "Deviceid" },
            { header: "Device IMEI", key: "device_imei" },
            {
                header: "Latitude", key: "latitude",
            },
            {
                header: "Longitude", key: "longitude",
            },
            {
                header: "Location", key: "Location",
            },
            {
                header: "Time Stamp", key: "timestamp",
            },
            { header: "Battery Percentage", key: "device_battery_percentage" },

        ];

        const rowData = [];
        gridRef.current.api.forEachNode((node) => rowData.push(node.data));

        // Helper — Format date to DD-MM-YYYY
        const formatDate = (d) => {
            if (!d) return "";
            const date = new Date(d);
            if (isNaN(date)) return d; // in case it's already formatted
            return `${String(date.getDate()).padStart(2, "0")}-${String(
                date.getMonth() + 1
            ).padStart(2, "0")}-${date.getFullYear()}`;
        };

        // Create Excel file
        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet("Geo Fence");

        sheet.views = [{ showGridLines: false }];

        const now = new Date();
        const formattedDate = now.toLocaleDateString("en-IN");

        // ⭐ TITLE
        sheet.mergeCells(1, 1, 1, columnDefs.length);
        const titleCell = sheet.getCell("A1");
        titleCell.value = `GEO FENCE - ${formattedDate}`;
        titleCell.font = { bold: true, size: 16 };
        titleCell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "D9D9D9" },
        };
        titleCell.border = {
            top: { style: "thin" },
            left: { style: "thin" },
            bottom: { style: "thin" },
            right: { style: "thin" },
        };
        titleCell.alignment = { vertical: "middle", horizontal: "left" };

        // ⭐ HEADER (ROW 2)
        const headerRow = sheet.getRow(2);
        columnDefs.forEach((col, i) => {
            const cell = headerRow.getCell(i + 1);
            cell.value = col.header;
            cell.font = { bold: true };
            cell.fill = {
                type: "pattern",
                pattern: "solid",
                fgColor: { argb: "D9D9D9" },
            };
            cell.alignment = { horizontal: "center", vertical: "center" };
            cell.border = {
                top: { style: "thin" },
                left: { style: "thin" },
                bottom: { style: "thin" },
                right: { style: "thin" },
            };
        });
        headerRow.commit();

        // ⭐ DATA ROWS
        rowData.forEach((row) => {
            const rowValues = columnDefs.map((c) => {
                let v = row[c.key];

                // Format DOB & DOJ
                if (c.key === "DateOfBirth" || c.key === "DateOfJoining") {
                    return formatDate(v);
                }

                // Remove time from ISO date if exists (2025-11-10T00:00:00)
                // if (typeof v === "string" && v.includes("T")) {
                //     v = v.split("T")[0];
                // }

                return v ?? "";
            });

            const dataRow = sheet.addRow(rowValues);

            dataRow.eachCell((cell) => {
                cell.alignment = { horizontal: "center", vertical: "center" };
                cell.border = {
                    top: { style: "thin" },
                    left: { style: "thin" },
                    bottom: { style: "thin" },
                    right: { style: "thin" },
                };
            });
        });

        // ⭐ AUTO COLUMN WIDTH
        sheet.columns.forEach((column) => {
            let maxLength = 0;
            column.eachCell({ includeEmpty: true }, (cell) => {
                const colValue = cell.value ? cell.value.toString() : "";
                maxLength = Math.max(maxLength, colValue.length);
            });
            column.width = maxLength < 10 ? 10 : maxLength + 5;
        });

        // Save Excel file
        const buffer = await workbook.xlsx.writeBuffer();
        saveAs(new Blob([buffer]), "Geo Fence.xlsx");
    };

    //pdf
    const hanglepdf = async (selectedDate) => {
        setLoading(true);
        await new Promise(resolve => setTimeout(resolve, 0));

        const filteredData = gridRef.current.api.getModel().rowsToDisplay.map(rowNode => rowNode.data);

        const doc = new jsPDF({ orientation: "portrait", format: 'a2' });
        const title = 'Geo Fence';

        // ✅ Format selectedDate properly
        let reportDate;
        try {
            const rawDate = selectedDate?.$d || selectedDate;
            const parsedDate = new Date(rawDate);
            if (isNaN(parsedDate)) throw new Error("Invalid date");
            reportDate = parsedDate.toLocaleDateString('en-GB', {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
            });
        } catch {
            reportDate = new Date().toLocaleDateString('en-GB', {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
            });
        }

        const imgData = logo;

        // ✅ Header columns
        const headers = [
            'Device ID',
            'Device IMEI',
            'Latitude',
            'Longitude',
            'Location',
            'Time Stamp',
            'Battery Percentage',

        ];

        // ✅ Match field names from API / grid (case-sensitive!)
        const bodyData = filteredData.map(item => [
            item.Deviceid || "-",
            item.device_imei || "-",
            item.latitude || "-",
            item.longitude || "-",
            item.Location || "-",
            item.timestamp || "-",
            item.device_battery_percentage || "-",
        ]);

        if (bodyData.length > 0) {
            autoTable(doc, {
                head: [headers],
                body: bodyData,
                margin: { top: 40, right: 15, left: 10, bottom: 20 },

                // ✅ Increase body text size
                styles: {
                    halign: "center",
                    valign: "middle",
                    fontSize: 10,       // <= Bigger data text
                    font: "times",
                    cellPadding: 3,
                    textColor: [0, 0, 0],
                    lineColor: [0, 0, 0],
                    lineWidth: 0.2,
                },

                // ✅ Increase header text size
                headStyles: {
                    fillColor: [0, 0, 0, 0.9],
                    textColor: [255, 255, 255],
                    fontSize: 11,       // <= Bigger header text
                    halign: 'center',
                    fontStyle: 'bold',
                },

                didDrawPage: (data) => {
                    const pageWidth = doc.internal.pageSize.width;
                    const pageHeight = doc.internal.pageSize.height;

                    // ✅ Logo
                    doc.addImage(imgData, 'PNG', 10, 5, 30, 12);

                    // ✅ Title
                    doc.setFontSize(20);
                    doc.setFont("times", "bold");
                    doc.text(`${title} - ${reportDate}`, pageWidth / 2, 22, { align: 'center' });

                    // ✅ Page Number
                    doc.setFontSize(8);
                    doc.text(`Page ${doc.internal.getCurrentPageInfo().pageNumber}`, pageWidth - 10, 10, { align: 'right' });

                    // ✅ Footer (center aligned)
                    doc.setFontSize(8);

                    const footerText = `Printed By: ${auth.employeename} | Printed On: ${new Date().toLocaleDateString()} | Time: ${new Date().toLocaleTimeString()}`;
                    const footerNote = `Note: This document has been generated electronically and is valid without signature.`;

                    // both lines centered
                    doc.text(footerText, pageWidth / 2, pageHeight - 15, { align: 'center' });
                    doc.text(footerNote, pageWidth / 2, pageHeight - 8, { align: 'center' });

                }
            });

            doc.save("Geo Fence.pdf");
        } else {
            Swal.fire("No data available to export", "", "warning");
        }
        setLoading(false);
    };
    //end pdf
    // Table for All Asset
    const pagination = true;
    const paginationPageSize = 10;
    const paginationPageSizeSelector = [10, 20, 50];


    const fetchdata = async () => {
        try {
            const response = await axios.get(`${API_URL}/GETRFIDJiofriends`);
            setRowdef(response.data.send);
            console.log('====================================');
            console.log('response.data.send', response.data.send);
            console.log('====================================');
            if (response.status === 200) {
                setLoading(false)
            }
        } catch (err) {
            setLoading(false)

            console.log(err)
        }
    }

    useEffect(() => {
        setLoading(true)

        fetchdata();
        const interval = setInterval(() => {
            fetchdata();
        }, 60000);

        // Clean up interval on component unmount
        return () => clearInterval(interval);

    }, [])
    const [modalImage, setModalImage] = useState(null); // State for modal image URL
    const [Imagevisible, setImagevisible] = useState(false)

    const handleImageClick = (imageUrl) => {
        // const fullImageUrl = `${API_URL}/${imageUrl}`;
        // console.log(fullImageUrl);
        setModalImage(imageUrl);
        setImagevisible(true)
    };


    const columndef = [

        { headerCheckboxSelection: true, checkboxSelection: true, width: 60 },
        { headerName: "Device ID", headerClass: 'agheader', field: "Deviceid", filter: true, floatingFilter: true },
        { headerName: "Device IMEI", headerClass: 'agheader', field: "device_imei", filter: true, floatingFilter: true },
        { headerName: "Latitude", headerClass: 'agheader', field: "latitude", filter: true, floatingFilter: true },
        { headerName: "Longitude", headerClass: 'agheader', field: "longitude", filter: true, floatingFilter: true },
        { headerName: "Location", headerClass: 'agheader', field: "Location", filter: true, floatingFilter: true },
        { headerName: "Time Stamp", headerClass: 'agheader', field: "timestamp", filter: true, floatingFilter: true },
        { headerName: "Battery Percentage", headerClass: 'agheader', field: "device_battery_percentage", filter: true, floatingFilter: true }

    ]
    const autoGroupColumnDef = useMemo(() => {
        return {
            headerCheckboxSelection: true,
            field: "id",
            flex: 1,
            minWidth: 240,
            cellRendererParams: {
                checkbox: true,
            },
        };
    }, []);


    const handleSelectChange = (event) => {
        setSelectedOption(event.target.value);
        setShow(event.target.value === 'Customdate');
    };


    useEffect(() => {
        // Filter data based on selected option
        const filterData = () => {
            let filteredData = [...rowdef];
            console.log(rowdef)
            switch (selectedOption) {
                case 'Today': {
                    filteredData = rowdef.filter(item => new Date(item.PDate).toDateString() === new Date().toDateString());
                    break;
                }
                case 'week': {
                    const today = new Date();
                    // Calculate the start of the week (Sunday)
                    const weekStart = new Date(today);
                    weekStart.setDate(today.getDate() - today.getDay()); // Set to the previous Sunday
                    weekStart.setHours(0, 0, 0, 0); // Normalize to start of the day

                    // Calculate the end of the week (Saturday)
                    const weekEnd = new Date(today);
                    weekEnd.setDate(today.getDate() + (6 - today.getDay())); // Set to the next Saturday
                    weekEnd.setHours(23, 59, 59, 999); // Normalize to end of the day

                    filteredData = rowdef.filter(item => {
                        const itemDate = new Date(item.PDate);
                        return itemDate >= weekStart && itemDate <= weekEnd;
                    });
                    break;
                }
                case 'month': {
                    const now = new Date();

                    // Calculate the start of the month
                    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
                    monthStart.setHours(0, 0, 0, 0); // Normalize to start of the day

                    // Calculate the end of the month
                    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0); // Last day of the current month
                    monthEnd.setHours(23, 59, 59, 999); // Normalize to end of the day

                    filteredData = rowdef.filter(item => {
                        const itemDate = new Date(item.PDate);
                        return itemDate >= monthStart && itemDate <= monthEnd;
                    });
                    break;
                }
                case 'Customdate': {
                    if (fromDate && toDate) {
                        filteredData = rowdef.filter(item => {
                            const itemDate = new Date(item.PDate);
                            return itemDate >= new Date(fromDate) && itemDate <= new Date(toDate);
                        });
                    }
                    break;
                }
                default:
                    break;
            }

            setFilteredRowDef(filteredData);
        };

        filterData();
    }, [selectedOption, rowdef, fromDate, toDate]);



    return (
        <>

            {loading && (
                <div className="loading-overlay">
                    <div className="loading-spinner">

                        (<BallTriangle
                            height={100}
                            width={100}
                            radius={5}
                            color="#4fa94d"
                            ariaLabel="ball-triangle-loading"
                            wrapperStyle={{}}
                            wrapperClass=""
                            visible={true}
                        />)

                    </div>
                </div>
            )}
            <Card>
                <div className="card-header pro-header p-1">
                    <div className="d-flex justify-content-center align-items-center">
                        {/* Center Title */}
                        <div className="text-center" >
                            <h3 className='text-white'><BsGeo className="fs-3 text-white me-1 mt-1" /> Geo Fence</h3>
                        </div>
                    </div>
                </div>

                <CardBody>
                    {/* Modal for Download Format */}
                    <div className="modal fade" id="exampleModal" tabIndex="-1" aria-labelledby="exampleModalLabel" >
                        <div className="modal-dialog modal-dialog-centered">
                            <div className="modal-content">
                                <div className="modal-header p-2 pro-header">
                                    <h1 className="modal-title fs-5 text-white" id="exampleModalLabel">Download Format</h1>
                                    <button type="button" className="btn-close btn-close-white me-2" data-bs-dismiss="modal"></button>
                                </div>
                                <div className="modal-body">
                                    <div className="d-flex justify-content-evenly">
                                        <div className="btn btn-success" onClick={downloadExcel}>
                                            <i className="bi bi-file-earmark-spreadsheet fs-1"></i>
                                        </div>
                                        <div className="btn btn-danger" onClick={hanglepdf}>
                                            <i className="bi bi-filetype-pdf fs-1"></i>
                                        </div>
                                    </div>
                                    <div className="d-flex justify-content-evenly mt-2">
                                        <span className="text-muted">Download Excel Format</span>
                                        <span className="text-muted">Download PDF Format</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="d-flex justify-content-end">
                        <div className='text-end  col-lg-4'>
                            <button className="btn btn-outline-success mt-3"
                                data-bs-toggle="modal" data-bs-target="#exampleModal"
                            // onClick={downloadExcel}
                            >
                                <i className="bi bi-cloud-upload me-1"></i>Export
                            </button>
                        </div>
                    </div>

                    <div className='mt-3  card  '>
                        <div style={{ height: "500px" }} className='ag-theme-quartz'>
                            <AgGridReact ref={gridRef} rowData={filteredRowDef} columnDefs={columndef} rowSelection={"multiple"} autoGroupColumnDef={autoGroupColumnDef} pagination={pagination} paginationPageSize={paginationPageSize} paginationPageSizeSelector={paginationPageSizeSelector} getRowHeight={() => 65} />
                        </div>
                    </div>
                </CardBody>
            </Card>
        </>
    )
}

geofence.propTypes = {
    auth: PropTypes.any.isRequired,
};
export default geofence
