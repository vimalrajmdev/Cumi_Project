import React, { useState, useMemo, useEffect } from 'react'
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AgGridReact } from 'ag-grid-react';
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import axios from 'axios';
import Swal from 'sweetalert2'
import { BallTriangle } from 'react-loader-spinner';
import PropTypes from 'prop-types';
import { getConfig } from 'src/config';
import { CButton } from '@coreui/react';
import { FaEdit } from 'react-icons/fa';
import { right } from '@popperjs/core';

import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import logo from 'src/assets/images/Base64/Apple_base64'; // Can also be base64 string
import autoTable from 'jspdf-autotable';
import { BsGraphDownArrow } from 'react-icons/bs';
const Depreciation = ({ auth }) => {

   const location = useLocation();
         const { permission, screenId } = location.state || {};


    const [Uploadvisible, setUploadvisible] = useState(false)
    const [uploadxl, setuploadxl] = useState(false)
    const [loading, setLoading] = useState(false); // Loader state
    const API_URL = getConfig().REACT_APP_API_URL;
    //pdf
    const handlepdf = async (selectedDate) => {
        setLoading(true);
        await new Promise(resolve => setTimeout(resolve, 0));

        const filteredData = gridRef.current.api.getModel().rowsToDisplay.map(rowNode => rowNode.data);

        const doc = new jsPDF({ orientation: "portrait", format: 'a4' });
        const title = 'Depreciation Master';

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
            'Depreciation', 'UseLife', 'Salvage Value', 'Created Date', 'Created By', 'Last Modified Date', 'Last Modified By',
        ];

        // ✅ Match field names from API / grid (case-sensitive!)
        const bodyData = filteredData.map(item => [
            item.Depreciation || "",
            item.useLife || "",
            item.salvageValue || "",

            item.Createddate ? item.Createddate.split("T")[0] : "-", item.Createdby || "-",
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

            doc.save("Depreciation Master.pdf");
        } else {
            Swal.fire("No data available to export", "", "warning");
        }
        setLoading(false);
    };
    //end pdf
    const navigate = useNavigate();


    // Download Excel
    const gridRef = useRef(null);
    const downloadExcel = async () => {
        const columnDefs = [
            { header: "Depreciation", key: "Depreciation" },
            { header: "Use Life", key: "useLife" },
            { header: "Salvage Value", key: "salvageValue" },

            {
                header: "Created Date", key: "Createddate",
            },
            {
                header: "Created By", key: "Createdby",
            },
            {
                header: "Last Modified Date", key: "Updateddate",

            },
            {
                header: "Last Modified By", key: "updateby",

            },
        ];
        const rowData = gridRef.current.api.getRenderedNodes().map(n => n.data);
        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet("Depreciation Master");
        // TURN OFF GRIDLINES
        sheet.views = [{ showGridLines: false }];
        const now = new Date();
        const formattedDate = now.toLocaleDateString("en-IN");
        // TITLE
        sheet.mergeCells(1, 1, 1, columnDefs.length);
        const titleCell = sheet.getCell("A1");
        titleCell.value = `DEPRECIATION MASTER - ${formattedDate}`;
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

        // DATA ROWS
        rowData.forEach((row) => {
            const rowValues = columnDefs.map(c => row[c.key] ?? "");  // ensure empty string, not undefined
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
        saveAs(new Blob([buffer]), "Depreciation Master.xlsx");
    };

    const [Register, setRegister] = useState({
        Depreciation: '', useLife: '', salvageValue: ''
    })

    // Handle Save Data
    const handleSave = async (e) => {

        if (Register.Depreciation === '') {
            Swal.fire({
                icon: 'warning',
                title: 'Please Enter Depreciation'
            })
            return
        }
        if (Register.salvageValue === '') {
            Swal.fire({
                icon: 'warning',
                title: 'Please Enter Sub Depreciation'
            })
            return
        }
        if (Register.useLife === '') {
            Swal.fire({
                icon: 'warning',
                title: 'Please Enter Sub Depreciation'
            })
            return
        }

        try {

            const alldata = { ...Register, mode: 'I', branchid: auth.branchid, Createdby: auth.empid, DepreciationId: '' }
            // console.log(alldata)
            const response = await axios.post(`${API_URL}/DepreciationConfig`, alldata)
            if (response.status === 200) {

                fetchData();
                Swal.fire({
                    title: 'Saved Successfully',
                    icon: 'success',
                    confirmButtonText: 'Done'
                })
            }
        } catch (err) {
            console.log(err)
        }
    }


    // Table 
    const pagination = true;
    const paginationPageSize = 10;
    const paginationPageSizeSelector = [10, 20, 50];

    const EditRenderer = (params) => {

        if (permission.EditStatus === null || permission.EditStatus === 'i') {
            return null; // Hide the button by returning null
        }

        return <div>
            <button className="border-0 mt-1 rounded-circle d-flex justify-content-center align-items-center"
                style={{
                    width: "40px",
                    height: "40px",
                    cursor: 'pointer',
                    background: "rgba(25, 135, 84, 0.15)",
                    border: "1px solid rgba(25, 135, 84, 0.3)",
                    color: "#198754",
                    transition: "all 0.3s ease",
                    boxShadow: "0 2px 6px rgba(0, 0, 0, 0.1)",
                }}
                // onClick={() => handlefetch(params.data.BuildingId)}

                onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(25,135,84,0.25)";
                    e.currentTarget.style.transform = "scale(1.1)";
                    e.currentTarget.style.boxShadow = "0 4px 12px rgba(25,135,84,0.3)";
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.background = "rgba(25,135,84,0.15)";
                    e.currentTarget.style.transform = "scale(1)";
                    e.currentTarget.style.boxShadow = "0 2px 6px rgba(0, 0, 0, 0.1)";
                }} onClick={() => handleEditDepreciation(params.data.DepreciationId)} >
                <FaEdit className="fs-5" />
            </button>
        </div>

    }
    // Handle Edit Depreciation
    const handleEditDepreciation = async (DepreciationId) => {

        if (auth.branchid === "0" || auth.branchid === 0) {
            Swal.fire({
                icon: 'warning',
                title: 'Invalid Selection',
                text: "Please select a specific branch. 'ALL' is not allowed.",
            });
            return;
        }
        try {

            const modal = new bootstrap.Modal(document.getElementById('exampleModalEDIT'));
            modal.show();
            const alldata = { DepreciationId, mode: 'SD', branchid: auth.branchid }
            console.log(alldata)
            const response = await axios.post(`${API_URL}/DepreciationConfig`, alldata)
            if (response.status === 200) {
                console.log('response.data.send', response.data)
                setRegister(...response.data)
            }

        } catch (err) {
            console.log(err)
        }
    }
    // Handle Edit Updated Data
    const handleEdit = async () => {
        try {
            const alldata = { ...Register, mode: 'U', Updatedby: auth.empid, branchid: auth.branchid }
            const response = await axios.post(`${API_URL}/DepreciationConfig`, alldata)
            if (response.status === 200) {

                fetchData();
                Swal.fire({
                    title: 'Edit Depreciation Successfully',
                    icon: 'success',
                    confirmButtonText: 'Done'
                })

                setRegister({
                    ...Register,
                    Depreciation: '', salvageValue: '', useLife: ''
                })

            }

        } catch (err) {
            console.log(err)
        }
    }
    // const DeleteRenderer = (params) => {

    //   return <div><i class="bi bi-trash3 fs-5"></i></div>

    // }
    const columndef = [
        { headerCheckboxSelection: true, checkboxSelection: true, width: 60 },
        { headerName: "Depreciation", headerClass: 'agheader', field: 'Depreciation', filter: true, floatingFilter: true, editable: true },
        { headerName: "Salavage Value", headerClass: 'agheader', field: 'salvageValue', filter: true, floatingFilter: true, editable: true },
        { headerName: "use Life", headerClass: 'agheader', field: 'useLife', filter: true, floatingFilter: true, editable: true },
        {
            headerName: "Created Date", headerClass: 'agheader', field: "Createddate",
            valueGetter: (params) => {
                const date = params.data.Createddate;
                if (!date) return '-';
                const d = new Date(date);
                const yyyy = d.getUTCFullYear();
                const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
                const dd = String(d.getUTCDate()).padStart(2, '0');
                const hh = String(d.getUTCHours()).padStart(2, '0');
                const mi = String(d.getUTCMinutes()).padStart(2, '0');
                const ss = String(d.getUTCSeconds()).padStart(2, '0');
                const ms = String(d.getUTCMilliseconds()).padStart(3, '0');
                return `${dd}-${mm}-${yyyy}`;
                // return `${dd}-${mm}-${yyyy} ${hh}:${mi}:${ss}`;
            },
        },
        {
            headerName: "Created By", headerClass: 'agheader', field: "Createdby",
            valueGetter: (params) => {
                const value = params.data?.Createdby;
                return value || "-";
            }
        },
        {
            headerName: "Last Modified Date", headerClass: 'agheader', field: "Updateddate",
            valueGetter: (params) => {
                const date = params.data.Updateddate;
                if (!date) return '-';
                const d = new Date(date);
                const yyyy = d.getUTCFullYear();
                const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
                const dd = String(d.getUTCDate()).padStart(2, '0');
                const hh = String(d.getUTCHours()).padStart(2, '0');
                const mi = String(d.getUTCMinutes()).padStart(2, '0');
                const ss = String(d.getUTCSeconds()).padStart(2, '0');
                const ms = String(d.getUTCMilliseconds()).padStart(3, '0');
                return `${dd}-${mm}-${yyyy}`;
                // return `${dd}-${mm}-${yyyy} ${hh}:${mi}:${ss}`;
            },
        },
        {
            headerName: "Last Modified By", headerClass: 'agheader', field: "updateby",
            valueGetter: (params) => {
                const value = params.data?.updateby;
                return value || "-";
            }
        },
        { headerName: "Edit", headerClass: 'agheader', field: 'Edit', cellRenderer: EditRenderer, width: 100, pinned: right },
        // { headerName: "Delete", field: 'Delete', cellRenderer: DeleteRenderer, }
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
    const [DepreciationData, setDepreciationData] = useState([])

    const fetchData = async () => {
        try {
            const alldata = { mode: 'S', branchid: auth.branchid, BranchAccess: auth.BranchAccess, DepreciationId: '' }
            const response = await axios.post(`${API_URL}/DepreciationConfig`, alldata);
            setDepreciationData(response.data);
        } catch (error) {
            console.error('Error fetching user details:', error);
        }
    };
    useEffect(() => {

        fetchData();

    }, [])


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
        if (auth.branchid === "0" || auth.branchid === 0) {
            Swal.fire({
                icon: 'warning',
                title: 'Invalid Selection',
                text: "Please select a specific branch. 'ALL' is not allowed.",
            });
            return;
        }
        if (!uploadxl) {
            Swal.fire({
                text: 'Please Select Upload File',
                icon: 'warning',
            });
            return;
        }

        const result = await Swal.fire({
            title: "Are you sure?",
            text: "Once uploaded, you will not be able to check the user list immediately!",
            icon: "warning",
            showCancelButton: true,
            cancelButtonText: 'Cancel',
            confirmButtonText: 'Upload',
        });

        setLoading(true);


        if (result.isConfirmed) {

            try {
                const formData = new FormData();
                formData.append('file', uploadxl);
                formData.append('branchid', auth.branchid);
                formData.append('Createdby', auth.empid);

                const response = await axios.post(`${API_URL}/DepreciationUploadData`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });

                const { message, uploadcount, unuploadedFilePath } = response.data;
                console.log(response.data)
                if (unuploadedFilePath) {
                    Swal.fire({
                        title: `Total Un-Uploaded File Count: ${uploadcount}`,
                        text: "Some data could not be uploaded. Please download the file to see the errors.",
                        icon: 'warning',
                        showCancelButton: true,
                        cancelButtonText: 'OK',
                        confirmButtonText: 'Download File',
                    }).then((result) => {
                        if (result.isConfirmed) {
                            const link = document.createElement('a');
                            link.href = `${API_URL}${unuploadedFilePath}`;
                            link.setAttribute('download', 'unuploaded_Depreciation_data.xlsx');
                            document.body.appendChild(link);
                            link.click();
                            link.remove();
                        }
                    });
                } else {


                    fetchData();
                    setLoading(false)
                    Swal.fire({
                        title: `Total Uploaded File Count: ${uploadcount}`,
                        text: 'All data uploaded successfully',
                        icon: 'success',
                    });
                }
            } catch (err) {
                console.error(err);
                Swal.fire({
                    title: 'Internal Server Error',
                    icon: 'error',
                });
            } finally {
                setUploadvisible(false);
                setLoading(false);
            }
        }
    };

    const handleAddDepreciationClick = () => {
        if (auth.branchid === "0" || auth.branchid === 0) {
            Swal.fire({
                icon: 'warning',
                title: 'Invalid Selection',
                text: "Please select a specific branch. 'ALL' is not allowed.",
            });
            return;
        }

        // Open Bootstrap modal programmatically
        const modal = new bootstrap.Modal(document.getElementById('exampleModal3'));
        modal.show();
    };
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
            {/* Modal2 for Download Format */}
            <div className="modal fade" id="exampleModal2" tabIndex="-1" aria-labelledby="exampleModalLabel2" data-bs-backdrop="false" >
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content">
                        <div className="modal-header p-2 pro-header">
                            <h1 className="modal-title fs-5 text-white" id="exampleModalLabel2">Download Format</h1>
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

            {/* Modal3 for Add Depreciation */}
            <div className="modal fade" id="exampleModal3" tabIndex="-1" aria-labelledby="exampleModalLabel3" data-bs-backdrop="false" >
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content">
                        <div className="modal-header p-2 pro-header">
                            <h1 className="modal-title fs-5 text-white" id="exampleModalLabel3">Add Depreciation</h1>
                            <button type="button" className="btn-close btn-close-white me-2" data-bs-dismiss="modal"></button>
                        </div>
                        <div className="modal-body">
                            <div className=''>
                                <label>Depreciation</label>
                                <input className='form-control mt-2' onChange={(e) => setRegister({ ...Register, Depreciation: e.target.value })} value={Register.Depreciation}
                                    placeholder='Enter Depreciation'
                                />
                            </div>

                            <div className='mt-3'>
                                <label>Salavage Value</label>
                                <input className='form-control mt-2' onChange={(e) => setRegister({ ...Register, salvageValue: e.target.value })} value={Register.salvageValue}
                                    placeholder='Enter Salavage Value'
                                />
                            </div>
                            <div className='mt-3'>
                                <label>Use Life</label>
                                <input className='form-control mt-2' onChange={(e) => setRegister({ ...Register, useLife: e.target.value })} value={Register.useLife}
                                    placeholder='Enter use Life'
                                />
                            </div>


                            <div className='mt-3 text-center'>
                                <button className='btn btn-success   col-lg-3' onClick={handleSave} data-bs-dismiss="modal">Save</button>
                            </div>

                        </div>
                    </div>
                </div>
            </div>

            {/* Modal3 for Edit Add Depreciation */}
            <div className="modal fade" id="exampleModalEDIT" tabIndex="-1" aria-labelledby="exampleModalLabel3" data-bs-backdrop="false" >
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content">
                        <div className="modal-header p-2 pro-header">
                            <h1 className="modal-title fs-5 text-white" id="exampleModalLabel3">Edit Depreciation</h1>
                            <button type="button" className="btn-close btn-close-white me-2" data-bs-dismiss="modal" onClick={(e) => setRegister({
                                Depreciation: '', salvageValue: '', useLife: ''
                            })}></button>
                        </div>
                        <div className="modal-body">
                            <div className=''>
                                <label>Depreciation</label>
                                <input className='form-control mt-2' value={Register.Depreciation} onChange={(e) => setRegister({ ...Register, Depreciation: e.target.value })}
                                    placeholder='Enter Depreciation'
                                />
                            </div>

                            <div className='mt-3'>
                                <label>SalvageValue</label>
                                <input className='form-control mt-2' value={Register.salvageValue} onChange={(e) => setRegister({ ...Register, salvageValue: e.target.value })}
                                    placeholder='Enter salvageValue'
                                />
                            </div>
                            <div className='mt-3'>
                                <label>UseLife</label>
                                <input className='form-control mt-2' value={Register.useLife} onChange={(e) => setRegister({ ...Register, useLife: e.target.value })}
                                    placeholder='Enter useLife'
                                />
                            </div>

                            <div className='mt-3 text-center'>
                                <button className='btn btn-success   col-lg-3' onClick={handleEdit} data-bs-dismiss="modal">Save</button>
                            </div>

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
                                    <div>
                                        <a href="/DepreciationTemp.xlsx" className=' nav-link text-decoration-underline ' download>Click to Download</a>
                                    </div>
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

            <div className=' pb-5 card'>
                {/* Action Buttons */}
                {/* <div className='card-header d-flex justify-content-between p-2 pro-header' >
                    <h3 className='text-white'> <BsGraphDownArrow className='fs-4 mb-2' style={{marginLeft:'550px'}} /> Depreciation Details </h3>
                    <i
                        className="bi bi-x-lg text-white fs-4 me-2"
                        style={{ cursor: 'pointer' }}
                        onClick={() => navigate('/Settings/Configure')}
                    />
                </div> */}
                <div className="card-header pro-header p-1">
                    <div className="d-flex align-items-center">

                        {/* Left Space (empty) */}
                        <div style={{ width: "33%" }}></div>

                        {/* Center Title */}
                        <div className="text-center" style={{ width: "34%" }}>
                            <h3 className="text-white m-0">
                                <BsGraphDownArrow className='fs-4 mb-2' /> Depreciation Details
                            </h3>
                        </div>

                        {/* Right Icon */}
                        <div
                            className="text-end"
                            style={{ width: "33%" }}
                        >
                            <i
                                className="bi bi-x-lg text-white fs-4 me-2"
                                style={{ cursor: "pointer" }}
                                onClick={() => navigate("/Settings/Configure")}
                            />
                        </div>

                    </div>
                </div>
                <div className="d-flex justify-content-end mt-2 flex-wrap mx-5">

                    {
                        permission.EditStatus === null || permission.EditStatus === 'i' ? '' :
                            <CButton type="submit" color="primary" variant="outline" className='me-2 btn-hover-effect' onClick={() => setUploadvisible(true)}>
                                <i className="bi bi-cloud-download me-1 "></i>Import
                            </CButton>
                    }
                    <CButton type="submit" color="danger" variant="outline" className='me-2 btn-hover-effect'
                        data-bs-toggle="modal" data-bs-target="#exampleModal2"
                    >

                        <i className="bi bi-cloud-upload me-1"></i>Export
                    </CButton>
                    {
                        permission.EditStatus === null || permission.EditStatus === 'i' ? '' :
                            <CButton type="submit" color="success" variant="outline" className='me-2 btn-hover-effect'
                                onClick={handleAddDepreciationClick}
                            >
                                <i className="bi bi-plus-lg "></i>Add
                            </CButton>
                    }
                </div>
                <div className='ag-theme-quartz mx-5 mt-2' style={{ height: "500px" }}>
                    <AgGridReact ref={gridRef} rowData={DepreciationData} columnDefs={columndef} rowSelection={"multiple"} autoGroupColumnDef={autoGroupColumnDef} pagination={pagination} paginationPageSize={paginationPageSize} paginationPageSizeSelector={paginationPageSizeSelector} getRowHeight={() => 55} />
                </div>

            </div>


        </div>

    )
}

Depreciation.propTypes = {
    auth: PropTypes.any.isRequired,
};

export default Depreciation
