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
import Logo from '../../assets/images/Base64/Apple_base64';
import { getConfig } from 'src/config';
import { CButton } from '@coreui/react';
import { Card, CardBody, CardHeader } from 'react-bootstrap';
import Swal from 'sweetalert2'

import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import logo from 'src/assets/images/Base64/Apple_base64'; // Can also be base64 string
import autoTable from 'jspdf-autotable';
const PaymentHistoryReport = ({ auth }) => {
    const componentRef = useRef(null);
    const API_URL = getConfig().REACT_APP_API_URL;
    const gridRef = useRef(null);
    const [rowdef, setRowdef] = useState([])
    const [show, setShow] = useState(false);
    const [selectedOption, setSelectedOption] = useState('All'); // State to manage selected option
    const [filteredRowDef, setFilteredRowDef] = useState([]);
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const [loading, setLoading] = useState(false); // Loader state


    // const downloadExcel = () => {
    //     const params = {
    //         fileName: 'TransferedLocation.csv',
    //         columnKeys: ['RFIDnumber', 'AssetID', 'OldBranch', 'OldPhysicalLocation', 'NewBranch', 'NewPhysicalLocation',
    //             'Date', 'TransferedBy', 'Description']
    //     };
    //     gridRef.current.api.exportDataAsCsv(params);
    // };
    const downloadExcel = async () => {
        const columndef = [
            { header: "Asset ID", key: "AssetID" },
            {
                header: "Transfer BranchName", key: "TransferBranchName",
            },
            {
                header: "Received BranchName", key: "ReceivedBranchName",
            },
            {
                header: "DC No", key: "DCNo",
            },
            {
                header: "Asset Cost", key: "AssetCost",
            }, {
                header: "Paid Amount", key: "PaidAmount",
            }, {
                header: "Balance Amount", key: "BalanceAmount",
            },
            {
                header: "Remarks", key: "Remarks",
            },
        ];
        const rowData = gridRef.current.api.getRenderedNodes().map(n => n.data);
        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet("Payment History Report");
        // TURN OFF GRIDLINES
        sheet.views = [{ showGridLines: false }];
        const now = new Date();
        const formattedDate = now.toLocaleDateString("en-IN");
        // TITLE
        sheet.mergeCells(1, 1, 1, columndef.length);
        const titleCell = sheet.getCell("A1");
        titleCell.value = `PAYMENT HISTORY REPORT - ${formattedDate}`;
        titleCell.font = { bold: true, size: 16 };
        titleCell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "D9D9D9" }
        };
        titleCell.border = {
            top: { style: "thin" },
            left: { style: "thin" },
            bottom: { style: "thin" },
            right: { style: "thin" },
        };
        titleCell.alignment = { vertical: "middle", horizontal: "left" };

        // HEADER (ROW 2)
        const headerRow = sheet.getRow(2);
        columndef.forEach((col, i) => {
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

        // DATA ROWS
        rowData.forEach((row) => {
            const rowValues = columndef.map(c => row[c.key] ?? "");  // ensure empty string, not undefined
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

        // AUTO RESIZE COLUMNS BASED ON CONTENT
        sheet.columns.forEach((column) => {
            let maxLength = 0;
            column.eachCell({ includeEmpty: true }, (cell) => {
                const colValue = cell.value ? cell.value.toString() : "";
                maxLength = Math.max(maxLength, colValue.length);
            });

            // minimum width 10, otherwise add padding
            column.width = maxLength < 10 ? 10 : maxLength + 5;
        });


        const buffer = await workbook.xlsx.writeBuffer();
        saveAs(new Blob([buffer]), "Payment History Report.xlsx");
    };
    //pdf
    const handlepdf = async (selectedDate) => {
        setLoading(true);
        await new Promise(resolve => setTimeout(resolve, 0));

        const filteredData = gridRef.current.api.getModel().rowsToDisplay.map(rowNode => rowNode.data);

        const doc = new jsPDF({ orientation: "portrait", format: 'a4' });
        const title = 'Payment History Report';

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
            'Asset ID', 'Transferred BranchName', 'Received BranchName', 'DC No', 'Asset Cost', 'Paid Amount', 'Balance Amount', 'Remarks'
        ];

        // ✅ Match field names from API / grid (case-sensitive!)
        const bodyData = filteredData.map(item => [
            item.AssetID || "",
            item.TransferBranchName || "",
            item.ReceivedBranchName || "-",
            item.DCNo || "-",
            item.AssetCost || "-",
            item.PaidAmount || "-",
            item.BalanceAmount || "-",
            item.Remarks || "-",
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

            doc.save("Payment History Report.pdf");
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
        setLoading(true)

        try {
            const alldata = { branchid: auth.branchid, BranchAccess: auth.BranchAccess, Transferredbranchid: '', Receivedbranchid: '', TransferredBy: '', departmentname: auth.departmentname, mode: 'PaymentReport' }
            const response = await axios.post(`${API_URL}/PaymentHistory`, alldata);
            setRowdef(response.data)
            if (response.status === 200) {
                setLoading(false)
            }
        } catch (err) {
            setLoading(false)

            console.log(err)
        }
    }

    useEffect(() => {

        fetchdata();
        const interval = setInterval(() => {
            fetchdata();
        }, 60000);

        // Clean up interval on component unmount
        return () => clearInterval(interval);

    }, [])



    const columndef = [

        { headerCheckboxSelection: true, checkboxSelection: true, width: 60 },
        { headerName: "Asset ID", headerClass: 'agheader',field: "AssetID", filter: true, floatingFilter: true },
        { headerName: "Transferred BranchName",headerClass: 'agheader', field: "TransferBranchName", filter: true, floatingFilter: true },
        { headerName: "Received BranchName", headerClass: 'agheader',field: "ReceivedBranchName", filter: true, floatingFilter: true },
        { headerName: "DC No",headerClass: 'agheader', field: "DCNo", filter: true, floatingFilter: true },
        { headerName: "Asset Cost", headerClass: 'agheader',field: "AssetCost", filter: true, floatingFilter: true },
        { headerName: "Paid Amount",headerClass: 'agheader', field: "PaidAmount", filter: true, floatingFilter: true },
        { headerName: "Balance Amount", headerClass: 'agheader',field: "BalanceAmount", filter: true, floatingFilter: true },
        { headerName: "Remarks", headerClass: 'agheader',field: "Remarks", filter: true, floatingFilter: true },


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

            switch (selectedOption) {
                case 'Today': {
                    const today = new Date();
                    filteredData = rowdef.filter(item => new Date(item.CreatedDate).toDateString() === today.toDateString());
                    break;
                }
                case 'week': {
                    const today = new Date();
                    const weekStart = new Date(today.setDate(today.getDate() - today.getDay()));
                    filteredData = rowdef.filter(item => new Date(item.CreatedDate) >= weekStart);
                    break;
                }
                case 'month': {
                    const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
                    filteredData = rowdef.filter(item => new Date(item.CreatedDate) >= monthStart);
                    break;
                }
                case 'Customdate': {
                    if (fromDate && toDate) {
                        filteredData = rowdef.filter(item => {
                            const itemDate = new Date(item.CreatedDate);
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
        <div className=''>
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
                                <div className="btn btn-danger" onClick={handlepdf}>
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

            <Card className="mx-auto mt-2" id='box-shadow' style={{ maxWidth: "700px" }}>
                <CardHeader className="p-1 pro-header">
                    <div className='d-flex justify-content-center mt-1'>
                        {/* <BsFiles className=" text-white fs-3 me-2" /> */}
                        <h3 className="text-white ">Payment History Report</h3>
                    </div>
                </CardHeader>
                <CardBody>
                    {/* search Mode */}
                    <div className="row mt-3 justify-content-center">
                        <div className="col-lg-6 col-md-8 col-sm-10 col-12">
                            <label className="fw-semibold">Select Search Mode</label>
                            <select
                                id="mySelect"
                                onChange={handleSelectChange}
                                value={selectedOption}
                                className="form-select"
                            >
                                <option value="All">All</option>
                                <option value="Today">Today</option>
                                <option value="week">Week</option>
                                <option value="month">Month</option>
                                <option value="Customdate">Custom Date</option>
                            </select>
                        </div>
                    </div>

                    {/* Date Pickers */}
                    {show && (
                        <div className="row mt-3 justify-content-center">
                            <div className="col-lg-6 col-md-8 col-sm-10 col-12">
                                <label className="fw-semibold">From Date</label>
                                <input
                                    type="date"
                                    className="form-control"
                                    value={fromDate}
                                    onChange={(e) => setFromDate(e.target.value)}
                                />
                            </div>
                        </div>
                    )}

                    {show && (
                        <div className="row mt-3 justify-content-center">
                            <div className="col-lg-6 col-md-8 col-sm-10 col-12">
                                <label className="fw-semibold">To Date</label>
                                <input
                                    type="date"
                                    className="form-control"
                                    value={toDate}
                                    onChange={(e) => setToDate(e.target.value)}
                                />
                            </div>
                        </div>
                    )}
                </CardBody>
            </Card>
            <div className='text-end'>
                <CButton className="mb-2" variant='outline' color='danger'
                    data-bs-toggle="modal" data-bs-target="#exampleModal"
                // onClick={downloadExcel}
                >
                    <i className="bi bi-cloud-upload me-1"></i>Export
                </CButton>
            </div>
            <div className='mt-3 card'>
                <div style={{ height: "500px" }} className='ag-theme-quartz'>
                    <AgGridReact ref={gridRef} rowData={filteredRowDef} columnDefs={columndef} rowSelection={"multiple"} autoGroupColumnDef={autoGroupColumnDef} pagination={pagination} paginationPageSize={paginationPageSize} paginationPageSizeSelector={paginationPageSizeSelector} />
                </div>
            </div>
        </div>
    )
}
PaymentHistoryReport.propTypes = {
    auth: PropTypes.any.isRequired,
};
export default PaymentHistoryReport
