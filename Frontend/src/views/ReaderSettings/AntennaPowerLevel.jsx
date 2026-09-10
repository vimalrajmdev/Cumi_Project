import React, { useMemo, useState, useEffect, useRef, useContext } from 'react'
import { AgGridReact } from 'ag-grid-react';
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import axios from 'axios';
import Swal from 'sweetalert2';
import swal from 'sweetalert';
import { Row, Col, Card, CardHeader, CardBody } from 'react-bootstrap';
// import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { Link } from 'react-router-dom';
// import { Modal } from 'bootstrap';
// import secureLocalStorage from "react-secure-storage";
import PropTypes from 'prop-types';
import { BallTriangle } from 'react-loader-spinner';
import { useLocation } from "react-router-dom";
// import logo from '../../assets/images/Base64/NashLogo'; // Can also be base64 string
import { getConfig } from 'src/config';
import ExcelJS from "exceljs";
import autoTable from 'jspdf-autotable';
import { saveAs } from "file-saver";
import logo from 'src/assets/images/Base64/Apple_base64'; // Can also be base64 string
import { CButton } from '@coreui/react';
import { IoEye } from 'react-icons/io5';
import { FaEdit, FaTrash } from 'react-icons/fa';
import { right } from '@popperjs/core';
import { TbAntenna } from 'react-icons/tb';

const RegisterAssetTable = ({ auth }) => {
    const [Uploadvisible, setUploadvisible] = useState(false)
    const [AddModalVisible, setAddModalVisible] = useState(false);
    const [EditModalVisible, setEditModalVisible] = useState(false);
    const [ViewModalVisible, setViewModalVisible] = useState(false);
    const API_URL = getConfig().REACT_APP_API_URL;
    const [uploadxl, setuploadxl] = useState(false)
    const [loading, setLoading] = useState(false); // Loader state
    const [Register, setRegister] = useState(
        {
            ReaderIP: ''
            , AntennaID: ''
            , TransmitPower: ''
            , ReceiveSensitivityIndex: ''
            , TransmitFrequencyIndex: ''
        }
    )
    const [isModalVisible, setIsModalVisible] = useState(false);
    const location = useLocation();
    let pageData = location.state?.pageData;
    if (!pageData) {
        // Fallback to local storage if available
        const storedData = secureLocalStorage.getItem('pageData');
        pageData = storedData || {};
    }
    const pagination = true;
    const paginationPageSize = 10;
    const paginationPageSizeSelector = [10, 50, 100];

    const [view, setview] = useState([]);
    const handleView = async (data) => {
        try {
            const alldata = {
                mode: 'E', ...data
            }
            console.log(alldata)
            const response = await axios.post(`${API_URL}/AntennaConfig`, alldata);
            console.log(response.data)
            setRegister(...response.data)


        }
        catch (error) {
            console.log(error)
        }
    }
    const ViewRenderer = (params) => {
        if ((pageData.viewstatus === null || pageData.viewstatus === 'i') && auth.UserStatus === 'A') {
            return null; // Hide the button by returning null
        }
        return (
            <div>
                <button
                    className="border-0 mt-1 rounded-circle d-flex justify-content-center align-items-center"
                    style={{
                        width: "40px",
                        height: "40px",
                        backdropFilter: "blur(6px)",
                        // background: "rgba(0, 0, 0, 0.33)",
                        border: "1px solid rgba(0, 0, 0, 0.33)",
                        color: "rgba(0, 0, 0, 0.33)",
                        transition: "all 0.3s ease",
                        boxShadow: "0 2px 6px rgba(0, 0, 0, 0.15)",
                    }}
                    onClick={() => handleView(params.data)}
                    data-bs-toggle="modal"
                    data-bs-target="#exampleModalView"
                    title="View Details"
                    onMouseEnter={(e) => {
                        // e.currentTarget.style.background = " rgba(0, 0, 0, 0.71)";
                        // e.currentTarget.style.transform = "scale(1.1)";
                        // e.currentTarget.style.boxShadow = "0 0 15pxr rgba(0, 0, 0, 0.71)";
                    }}
                    onMouseLeave={(e) => {
                        // e.currentTarget.style.background = "rgba(13,110,253,0.15)";
                        // e.currentTarget.style.transform = "scale(1)";
                        // e.currentTarget.style.boxShadow = "0 2px 6px rgba(0, 0, 0, 0.72)";
                    }}
                >
                    <IoEye className="fs-5 text-dark" />
                </button>
            </div>
        );
    };

    const handleEdit = async (data) => {
        try {
            const alldata = {
                mode: 'E', ...data
            }
            console.log(alldata)
            const response = await axios.post(`${API_URL}/AntennaConfig`, alldata);
            console.log(response.data)
            setRegister(...response.data)

        } catch (error) {
            console.error('ERROR EDITING RECORD:', error);
            throw error;
        }
    }
    const EditRenderer = (params) => {
        if ((pageData.editstatus === null || pageData.editstatus === 'i') && auth.UserStatus === 'A') {
            return null; // Hide the button by returning null
        }
        return <div>
            <button
                className="border-0 mt-1 rounded-circle d-flex justify-content-center align-items-center"
                style={{
                    width: "40px",
                    height: "40px",
                    backdropFilter: "blur(6px)",
                    background: "rgba(25, 135, 84, 0.15)",
                    border: "1px solid rgba(25, 135, 84, 0.3)",
                    color: "#198754",
                    transition: "all 0.3s ease",
                    boxShadow: "0 2px 6px rgba(0, 0, 0, 0.1)",
                }}
                onClick={() => handleEdit(params.data)}
                data-bs-toggle="modal"
                data-bs-target="#exampleModalEdit"
                title="Edit"
                onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(25,135,84,0.25)";
                    e.currentTarget.style.transform = "scale(1.1)";
                    e.currentTarget.style.boxShadow = "0 4px 12px rgba(25,135,84,0.3)";
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.background = "rgba(25,135,84,0.15)";
                    e.currentTarget.style.transform = "scale(1)";
                    e.currentTarget.style.boxShadow = "0 2px 6px rgba(0, 0, 0, 0.1)";
                }}
            >
                <FaEdit className="fs-5" />
            </button>
        </div>

    }

    // Update Details
    //   Submit Updated Details
    const handlechange = async (e) => {
        if (Register.TransmitPower > 200) {
            Swal.fire({
                title: 'Transmit Power Index Should be less than 200',
                icon: 'warning',
                confirmButtonText: 'Done'
            });
            return;
        }
        try {
            const alldata = { ...Register, AllowDoorLock: '', LockDoor: '', Alarm: '', LastSeqNumber: '', Active: '', UpdatedBy: auth.empid, mode: 'U' }
            console.log(alldata)
            setLoading(true)

            const response = await axios.post(`${API_URL}/AntennaConfig`, alldata)
            if (response.status === 200) {
                setLoading(false)
                fetchData();
                Swal.fire({
                    title: 'Updated',
                    text: 'Updated Successfully',
                    icon: 'success',
                    confirmButtonText: 'Done'
                })
                handleClear();
                return
            }
        }
        catch (err) {
            console.log(err)
        }
    }
    // Edit End
    const [rowData, setRowData] = useState([]);
    const fetchData = async () => {
        setLoading(true)
        const alldata = {
            mode: 'FetchAntenna', ReaderIP: '', AntennaID: '', TransmitPower: '', ReceiveSensitivityIndex: '', TransmitFrequencyIndex: ''
        }
        try {
            const response = await axios.post(`${API_URL}/AntennaConfig`, alldata);
            setRowData(response.data);
            console.log(response.data)
            if (response.status === 200) {
                setLoading(false)
            }
        } catch (error) {
            setLoading(false)
            console.error('Error fetching user details:', error);
        }
    };
    const DeleteRenderer = (params) => {
        if ((pageData.deletestatus === null || pageData.deletestatus === 'i') && auth.UserStatus === 'A') {
            return null; // Hide the button by returning null
        }
        return <div>
            <button
                className="border-0 mt-1 rounded-circle d-flex justify-content-center align-items-center"
                style={{
                    width: "40px",
                    height: "40px",
                    backdropFilter: "blur(6px)",
                    background: "rgba(220, 53, 69, 0.15)", // red glass look
                    border: "1px solid rgba(220, 53, 69, 0.3)",
                    color: "#dc3545",
                    transition: "all 0.3s ease",
                    boxShadow: "0 2px 6px rgba(0, 0, 0, 0.1)",
                }}
                onClick={() => handleDelete(params.data)}
                title="Delete"
                onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(220,53,69,0.25)";
                    e.currentTarget.style.transform = "scale(1.1)";
                    e.currentTarget.style.boxShadow = "0 4px 12px rgba(220,53,69,0.3)";
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.background = "rgba(220,53,69,0.15)";
                    e.currentTarget.style.transform = "scale(1)";
                    e.currentTarget.style.boxShadow = "0 2px 6px rgba(0, 0, 0, 0.1)";
                }}
            >
                <FaTrash className="fs-5" />
            </button>

        </div>

    }

    const handleDelete = async (data) => {
        const result = await Swal.fire({
            title: "Are you sure?",
            text: "Once deleted, you will not be able to recover the data!",
            icon: "warning",
            showCancelButton: true,
            cancelButtonText: 'Cancel',
            confirmButtonText: 'Delete',
        });
        if (result.isConfirmed) {
            setLoading(true)
            try {
                const alldata = { ...data, mode: 'D' }
                console.log(alldata)
                const response = await axios.post(`${API_URL}/AntennaConfig`, alldata)
                if (response.status === 200) {
                    fetchData();
                    setLoading(false)
                    Swal.fire({
                        title: 'Deleted',
                        text: 'Deleted Successfully',
                        icon: 'success',
                        confirmButtonText: 'Done'
                    })
                    return
                }
            } catch (error) {
                console.error('ERROR DELETING RECORD:', error);
                throw error;
            }
        }
    }
    const columdef = [
        { headerCheckboxSelection: true, checkboxSelection: true, width: 50 },
        { headerName: "Reader IP", headerClass: 'agheader', field: "ReaderIP", filter: true, floatingFilter: true, editable: true, editable: true,width:350},
        { headerName: "Antenna ID", headerClass: 'agheader', field: "AntennaID", filter: true, floatingFilter: true, editable: true,width:350 },
        { headerName: "Transmit Power", headerClass: 'agheader', field: "TransmitPower", filter: true, floatingFilter: true, editable: true,width:350 },
        // {
        //     headerName: "Created Date", headerClass: 'agheader', field: "Createddate",
        //     valueGetter: (params) => {
        //         const date = params.data.Createddate;
        //         if (!date) return '-';
        //         const d = new Date(date);
        //         const yyyy = d.getUTCFullYear();
        //         const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
        //         const dd = String(d.getUTCDate()).padStart(2, '0');
        //         const hh = String(d.getUTCHours()).padStart(2, '0');
        //         const mi = String(d.getUTCMinutes()).padStart(2, '0');
        //         const ss = String(d.getUTCSeconds()).padStart(2, '0');
        //         const ms = String(d.getUTCMilliseconds()).padStart(3, '0');
        //         return `${dd}-${mm}-${yyyy}`;
        //         // return `${dd}-${mm}-${yyyy} ${hh}:${mi}:${ss}`;
        //     },
        // },
        // {
        //     headerName: "Created By", headerClass: 'agheader', field: "Createdby",
        //     valueGetter: (params) => {
        //         const value = params.data?.Createdby;
        //         return value || "-";
        //     }
        // },
        // {
        //     headerName: "Last Modified Date", headerClass: 'agheader', field: "Updateddate",
        //     valueGetter: (params) => {
        //         const date = params.data.Updateddate;
        //         if (!date) return '-';
        //         const d = new Date(date);
        //         const yyyy = d.getUTCFullYear();
        //         const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
        //         const dd = String(d.getUTCDate()).padStart(2, '0');
        //         const hh = String(d.getUTCHours()).padStart(2, '0');
        //         const mi = String(d.getUTCMinutes()).padStart(2, '0');
        //         const ss = String(d.getUTCSeconds()).padStart(2, '0');
        //         const ms = String(d.getUTCMilliseconds()).padStart(3, '0');
        //         return `${dd}-${mm}-${yyyy}`;
        //         // return `${dd}-${mm}-${yyyy} ${hh}:${mi}:${ss}`;
        //     },
        // },
        // {
        //     headerName: "Last Modified By", headerClass: 'agheader', field: "updateby",
        //     valueGetter: (params) => {
        //         const value = params.data?.updateby;
        //         return value || "-";
        //     }
        // },
        // { headerName: "Receive Sensitivity Index", field: "ReceiveSensitivityIndex", filter: true, floatingFilter: true, editable: true },
        // { headerName: "Transmit Frequency Index", field: "TransmitFrequencyIndex", filter: true, floatingFilter: true, editable: true },
        { headerName: "View", pinned: right, headerClass: 'agheader', field: "View", cellRenderer: ViewRenderer, width: 80 },
        { headerName: pageData.editstatus === null || pageData.editstatus === 'i' ? '' : 'Edit', pinned: right, headerClass: 'agheader', field: "Edit", cellRenderer: EditRenderer, width: 80 },
        { headerName: "Delete", field: "Delete", pinned: right, headerClass: 'agheader', cellRenderer: DeleteRenderer, width: 90 },
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

    //pdf
    const handlepdf = async (selectedDate) => {
        setLoading(true);
        await new Promise(resolve => setTimeout(resolve, 0));

        const filteredData = gridRef.current.api.getModel().rowsToDisplay.map(rowNode => rowNode.data);

        const doc = new jsPDF({ orientation: "portrait", format: 'a4' });
        const title = 'Antenna Power Level';

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
            'Reader IP', 'Antenna ID', 'Transmit Power', 'Created Date', 'Created By', 'Updated Date', 'Update By'
        ];

        // ✅ Match field names from API / grid (case-sensitive!)
        const bodyData = filteredData.map(item => [
            item.ReaderIP || "-",
            item.AntennaID || "-",
            item.TransmitPower || "-",
            item.Createddate ? item.Createddate.split("T")[0] : "-",
            item.Createdby || "-",
            item.Updateddate ? item.Updateddate.split("T")[0] : "-", item.Updateddate || "-",
            item.updateby || "-",
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

            doc.save("Antenna Power Level.pdf");
        } else {
            Swal.fire("No data available to export", "", "warning");
        }
        setLoading(false);
    };
    //end pdf

    const gridRef = useRef(null);

    const downloadExcel = async () => {
        const columnDefs = [
            { header: "Reader IP", key: "ReaderIP" },
            { header: "Antenna ID", key: "AntennaID" },
            { header: "Transmit Power", key: "TransmitPower" },
            { header: "Created Date", key: "Createddate", },
            { header: "Created By", key: "Createdby", },
            {
                header: "Last Modified Date", key: "Updateddate",
            },
            {
                header: "Last Modified By", key: "updateby",
            },
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
        const sheet = workbook.addWorksheet("Antenna Power Level");

        sheet.views = [{ showGridLines: false }];

        const now = new Date();
        const formattedDate = now.toLocaleDateString("en-IN");

        // ⭐ TITLE
        sheet.mergeCells(1, 1, 1, columnDefs.length);
        const titleCell = sheet.getCell("A1");
        titleCell.value = `Antenna Power Level - ${formattedDate}`;
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
        titleCell.alignment = { vertical: "middle", horizon3al: "center" };

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
        saveAs(new Blob([buffer]), "Antenna Power Level.xlsx");
    };

    useEffect(() => {
        if (isModalVisible && inputRef.current) {
            inputRef.current.focus();
        }
        fetchData();

    }, [isModalVisible])
    // Handle Import
    const handleUploadExcelSheet = (e) => {
        const selectedFile = e.target.files[0];

        if (selectedFile) {
            const fileName = selectedFile.name;
            const fileExtension = fileName.split('.').pop().toLowerCase();

            if (fileExtension === 'csv' || fileExtension === 'xls' || fileExtension === 'xlsx') {
                setuploadxl(selectedFile);
            } else {
                Swal.fire({
                    title: 'Invalid File Format',
                    text: 'Please select a valid CSV or Excel file format.',
                    icon: 'warning'
                });
                setuploadxl(null);
                e.target.value = null; // Clear the file input field
            }
        }
    };
    const handleUploadData = async () => {
        if (!uploadxl) {
            Swal.fire({
                text: 'Please Select Upload File',
                icon: 'warning',
            });
            return;
        }

        const result = await Swal.fire({
            title: "Are you sure?",
            text: "Please ensure the Antenna Power Level is below 200!",
            icon: "warning",
            showCancelButton: true,
            cancelButtonText: 'Cancel',
            confirmButtonText: 'Upload',
        });



        if (result.isConfirmed) {
            setLoading(true);

            try {
                const formData = new FormData();
                formData.append('file', uploadxl);
                formData.append('CreatedBy', auth.empid)
                const response = await axios.post(`${API_URL}/AntennaPowerLevelUpload`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });

                const { message, uploadcount, unuploadedFilePath } = response.data;
                // console.log(response.data)
                if (unuploadedFilePath) {

                    fetchData();
                    setLoading(false)
                    swal({
                        heightAuto: true,
                        title: `Total Uploaded File Count: ${uploadcount}`,
                        text: "Some data could not be uploaded. Please download the file to see the errors.",
                        icon: 'warning',
                        buttons: {
                            cancel: "OK",
                            download: {
                                text: "Download File",
                                value: "download",
                            },
                        },
                    }).then((value) => {
                        if (value === "download") {
                            const link = document.createElement('a');
                            link.href = `${API_URL}${unuploadedFilePath}`;
                            link.setAttribute('download', 'unuploaded_Antenna_data.xlsx');
                            document.body.appendChild(link);
                            link.click();
                            link.parentNode.removeChild(link);
                        }
                    });
                } else {

                    fetchData();

                    Swal.fire({
                        title: `Total Uploaded File Count: ${uploadcount}`,
                        text: 'All data uploaded successfully',
                        icon: 'success',
                    });
                }
            } catch (err) {
                console.error(err);
                setLoading(false);
                Swal.fire({
                    title: 'Please Upload Valid File',
                    icon: 'error',
                });
            } finally {
                setUploadvisible(false);
                setLoading(false);
            }
        }
    };
    const validateFields = () => {
        const fieldsToCheck = [
            { key: 'ReaderIP', message: 'Please Enter Reader IP' },
            { key: 'AntennaID', message: 'Please Enter Antenna ID' },
            { key: 'TransmitPower', message: 'Please Enter Transmit Power Index' },

        ];

        for (const field of fieldsToCheck) {
            if (Register[field.key] === '') {
                Swal.fire({
                    title: field.message,
                    icon: 'warning',
                    confirmButtonText: 'Done'
                });
                return false;
            }
        }

        return true;
    };
    //   Submit Details
    const handlecheck = async (e) => {
        if (validateFields()) {
            try {
                const alldata = { ...Register, CreatedBy: auth.empid, mode: 'I' }
                console.log(alldata)
                const response = await axios.post(`${API_URL}/AntennaConfig`, alldata)
                if (response.status === 200) {
                    Swal.fire({
                        title: 'Saved Successfully',
                        text: '',
                        icon: 'success',
                        confirmButtonText: 'Done'
                    }).then(() => {
                        setAddModalVisible(false);
                        handleClear();
                        fetchData();
                    });
                    return;
                }

            }
            catch (err) {
                console.log(err)
            }
        }
    }


    const handleClear = () => {
        setRegister({
            ReaderIP: ''
            , AntennaID: ''
            , TransmitPower: ''
            , ReceiveSensitivityIndex: ''
            , TransmitFrequencyIndex: ''
        })
    }
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
                            wrapperclassName=""
                            visible={true}
                        />)
                    </div>
                </div>
            )}
            <div>
                {/* Modal for Download Format Register Asset*/}
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
                                    <div className="btn btn-danger" onClick={handlepdf} >
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

                {/* <!-- Modal for View Asset --> */}
                <div className="modal fade" id="exampleModalView" aria-labelledby="exampleModalLabel" >
                    <div className="modal-dialog modal-xl">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h1 className="modal-title fs-5" id="exampleModalLabel">Antenna Information</h1>
                                <button type="button" className="btn-close" data-bs-dismiss="modal"
                                    onClick={() => handleClear()}
                                ></button>
                            </div>
                            <div className="modal-body">

                                <div className=" row ">
                                    <div className="col-lg-3 mt-3">
                                        <label>Reader IP</label>
                                        <input className='form-control' onChange={(e) => setRegister({ ...Register, ReaderIP: e.target.value })} value={Register.ReaderIP} disabled />
                                    </div>
                                    <div className="col-lg-3 mt-3">
                                        <label>Antenna ID</label>
                                        <input className='form-control' onChange={(e) => setRegister({ ...Register, AntennaID: e.target.value })} value={Register.AntennaID} disabled />
                                    </div>
                                    <div className="col-lg-3 mt-3">
                                        <label>Transmit Power Index</label>
                                        <input className='form-control' onChange={(e) => setRegister({ ...Register, TransmitPower: e.target.value })} value={Register.TransmitPower} disabled />
                                    </div>


                                </div>

                            </div>

                        </div>
                    </div>
                </div>

                {/* Modal For Edit Asset */}
                <div className="modal fade" id="exampleModalEdit" data-bs-backdrop="false"
                    aria-labelledby="exampleModalLabel" >
                    <div className="modal-dialog modal-dialog-centered modal-lg">
                        <div className="modal-content">
                            <div className="modal-header p-2 pro-header">
                                <h1 className="modal-title fs-5 text-white" id="exampleModalLabel">Edit Antenna Details</h1>
                                <button type="button" className="btn-close btn-close-white me-2" data-bs-dismiss="modal" onClick={() => handleClear()}></button>
                            </div>
                            <div className="modal-body">
                                <div className=" row ">
                                    <div className="col-lg-4 mt-1">
                                        <label>Reader IP</label>
                                        <input className='form-control' onChange={(e) => setRegister({ ...Register, ReaderIP: e.target.value })} value={Register.ReaderIP} disabled />
                                    </div>
                                    <div className="col-lg-4 mt-1">
                                        <label>Antenna ID</label>
                                        <input className='form-control' onChange={(e) => setRegister({ ...Register, AntennaID: e.target.value })} value={Register.AntennaID} disabled />
                                    </div>


                                    <div className="col-lg-4 mt-1">
                                        <label>Transmit Power Index</label>
                                        <input className='form-control' onChange={(e) => setRegister({ ...Register, TransmitPower: e.target.value })} value={Register.TransmitPower} type='number' max={200} />
                                    </div>
                                </div>

                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-danger" data-bs-dismiss="modal" onClick={() => handleClear()}>Close</button>
                                <button type="button" className="btn btn-success" onClick={() => handlechange()} data-bs-dismiss="modal" >Update</button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Modal For Add Antenna*/}
                <div className="modal fade" data-bs-backdrop="false"
                    id="exampleModalAdd" aria-labelledby="exampleModalLabel" style={{ display: AddModalVisible ? 'block' : 'none' }}>
                    <div className="modal-dialog modal-lg modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header p-2 pro-header">
                                <h1 className="modal-title fs-5 text-white" id="exampleModalLabel">Add Antenna</h1>
                                <button type="button" className="btn-close btn-close-white me-2" data-bs-dismiss="modal"></button>
                            </div>
                            <div className="modal-body">
                                <div className=" row ">
                                    <div className="col-lg-4 mt-1">
                                        <label>Reader IP</label>
                                        <input className='form-control' placeholder='Enter Reader IP' onChange={(e) => setRegister({ ...Register, ReaderIP: e.target.value })} value={Register.ReaderIP} />
                                    </div>
                                    <div className="col-lg-4 mt-1">
                                        <label>Antenna ID</label>
                                        <input className='form-control' placeholder='Antenna ID' onChange={(e) => setRegister({ ...Register, AntennaID: e.target.value })} value={Register.AntennaID} />
                                    </div>
                                    <div className="col-lg-4 mt-1">
                                        <label>Transmit Power </label>
                                        <input className='form-control' placeholder='Transmit Power' onChange={(e) => setRegister({ ...Register, TransmitPower: e.target.value })} value={Register.TransmitPower} />
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-danger" data-bs-dismiss="modal">Close</button>
                                <button type="button" className="btn btn-success" onClick={() => handlecheck()} data-bs-dismiss="modal" >Save</button>
                            </div>
                        </div>
                    </div>
                </div>



                {Uploadvisible && (
                    <div className={`modal fade ${Uploadvisible ? 'show' : ''}`} style={{ display: Uploadvisible ? 'block' : 'none' }}>
                        <div className="modal-dialog modal-dialog-centered modal-lg modal-dialog-scrollable">
                            <div className="modal-content card">
                                <div className="modal-header">
                                    <button type="button" className="btn-close" onClick={() => setUploadvisible(false)}></button>
                                </div>
                                <div className="modal-body">
                                    <div className="import-input">
                                        <label htmlFor="importdata" className="form-label">Import Data</label>
                                        <input
                                            type="file"
                                            className="form-control"
                                            accept=".csv, .xls, .xlsx"
                                            onChange={handleUploadExcelSheet}
                                        />
                                    </div>
                                    <hr className="mt-2" />

                                    <div className="download-sample-template text-center">
                                        <p>Important ⚠</p>
                                        <span className='text-danger'>Download The Below The Template That Colum Name Based Enter The Data Then Upload here</span>

                                        <a href="/AntennaPowerLevelTemp.xlsx" className="nav-link text-decoration-underline" download>
                                            Click to Download
                                        </a>
                                    </div>
                                    <div className="text-center mt-3">
                                        <button className="btn btn-danger mx-2" onClick={() => setUploadvisible(false)}>
                                            CANCEL
                                        </button>
                                        <button className="btn btn-success mx-2" onClick={handleUploadData}>
                                            Upload Data
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                <Card className='mt-4'>
                    <CardHeader className='pro-header'>
                        <div className='d-flex justify-content-center p-0'>
                            <TbAntenna className="ms-2 fs-3 text-white" /> <h3 className='text-white'>Antenna Power Level</h3>
                        </div>
                    </CardHeader>
                    <CardBody>
                        <div className='d-flex justify-content-end flex-wrap mt-2 col-lg-12 col-md-12 col-sm-12'>
                            <div className='d-flex flex-wrap'>
                                {/* {
                                    (pageData.addstatus === null || pageData.addstatus === 'i') && auth.UserStatus === 'A'
                                        ? '' :
                                        <CButton className="ms-2 mb-2 " color='success' variant='outline' onClick={() => setUploadvisible(true)}>
                                            <i className="bi bi-cloud-download me-1"></i>
                                            Import
                                        </CButton>
                                } */}
                                <CButton className=" ms-2 mb-2" color='danger' variant='outline'
                                    data-bs-toggle="modal" data-bs-target="#exampleModal"
                                >
                                    <i className="bi bi-cloud-upload me-1"></i>
                                    Export
                                </CButton>
                                {
                                    (pageData.addstatus === null || pageData.addstatus === 'i') && auth.UserStatus === 'A'
                                        ? '' :
                                        <CButton
                                            className=" ms-2 mb-2" color='primary' variant='outline' data-bs-toggle="modal"
                                            data-bs-target="#exampleModalAdd" onClick={() => setAddModalVisible(true)} >
                                            <i className="bi bi-plus-lg me-1"></i>
                                            New
                                        </CButton>


                                }

                            </div>
                        </div>
                        <div style={{ height: "500px" }} className='ag-theme-quartz'>
                            <AgGridReact ref={gridRef} rowData={rowData} columnDefs={columdef} rowSelection={"multiple"}
                                autoGroupColumnDef={autoGroupColumnDef} pagination={pagination} paginationPageSize={paginationPageSize} paginationPageSizeSelector={paginationPageSizeSelector}
                                getRowHeight={() => 55}
                            />
                        </div>
                    </CardBody>
                </Card>

            </div>

        </>
    )
}

RegisterAssetTable.propTypes = {
    auth: PropTypes.any.isRequired,
};

export default RegisterAssetTable
