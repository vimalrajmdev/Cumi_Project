import React from 'react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { useRef, useMemo, useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AgGridReact } from 'ag-grid-react';
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import axios from 'axios';
import { BallTriangle } from 'react-loader-spinner';
import PropTypes from 'prop-types';
import { getConfig } from 'src/config';
import { CButton } from '@coreui/react';
import ExcelJS from "exceljs";
import { FaEdit } from 'react-icons/fa';
import swal from 'sweetalert';
import Swal from 'sweetalert2';
import { saveAs } from "file-saver";
import logo from 'src/assets/images/Base64/Apple_base64';
import autoTable from 'jspdf-autotable';

const ReminderTypes = ({ auth }) => {
    const [rowdata, setRowdata] = useState([]);
    const [Register, setRegister] = useState({
        ReminderType: '',
        ReminderTypeID: '' // Optional: to track ID during edit
    });

    const navigate = useNavigate();
    const API_URL = getConfig().REACT_APP_API_URL;
    const location = useLocation();
    const { permission, screenId } = location.state || {};
    const [Uploadvisible, setUploadvisible] = useState(false);
    const [uploadxl, setuploadxl] = useState(false);
    const [loading, setLoading] = useState(false);

    const gridRef = useRef(null);

    // Download Excel
    const downloadExcel = async () => {
        const columnDefs = [
            { header: "S.No", key: "S.No" },
            { header: "Reminder Type", key: "ReminderType" },
            { header: "Created By", key: "Createdby" },
            { header: "Created Date", key: "Createddate" },
            { header: "Last Modified By", key: "updatedby" },
            { header: "Last Modified Date", key: "updateddate" },
        ];

        const rowData = [];
        gridRef.current.api.forEachNode((node) => rowData.push(node.data));

        const formatDate = (d) => {
            if (!d) return "-";
            const date = new Date(d);
            if (isNaN(date)) return d;
            const year = date.getUTCFullYear();
            const month = String(date.getUTCMonth() + 1).padStart(2, "0");
            const day = String(date.getUTCDate()).padStart(2, "0");
            const hh = String(date.getUTCHours()).padStart(2, "0");
            const mi = String(date.getUTCMinutes()).padStart(2, "0");
            const ss = String(date.getUTCSeconds()).padStart(2, "0");
            return `${day}-${month}-${year} ${hh}:${mi}:${ss}`;
        };

        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet("Reminder Type Master");
        sheet.views = [{ showGridLines: false }];

        const now = new Date();
        const formattedDate = now.toLocaleDateString("en-IN");

        sheet.mergeCells(1, 1, 1, columnDefs.length);
        const titleCell = sheet.getCell("A1");
        titleCell.value = `Reminder Type Master - ${formattedDate}`;
        titleCell.font = { bold: true, size: 16 };
        titleCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "D9D9D9" } };
        titleCell.border = { top: { style: "thin" }, left: { style: "thin" }, bottom: { style: "thin" }, right: { style: "thin" } };
        titleCell.alignment = { vertical: "middle", horizontal: "left" };

        const headerRow = sheet.getRow(2);
        columnDefs.forEach((col, i) => {
            const cell = headerRow.getCell(i + 1);
            cell.value = col.header;
            cell.font = { bold: true };
            cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "D9D9D9" } };
            cell.alignment = { horizontal: "center", vertical: "center" };
            cell.border = { top: { style: "thin" }, left: { style: "thin" }, bottom: { style: "thin" }, right: { style: "thin" } };
        });
        headerRow.commit();

        rowData.forEach((row, index) => {
            const rowValues = columnDefs.map((c) => {
                if (c.header === "S.No") return index + 1;
                let v = row[c.key];
                if (c.key === "Createddate" || c.key === "updateddate") return formatDate(v);
                return v ?? "-";
            });
            const dataRow = sheet.addRow(rowValues);
            dataRow.eachCell((cell) => {
                cell.alignment = { horizontal: "center", vertical: "center" };
                cell.border = { top: { style: "thin" }, left: { style: "thin" }, bottom: { style: "thin" }, right: { style: "thin" } };
            });
        });

        sheet.columns.forEach((column) => {
            let maxLength = 0;
            column.eachCell({ includeEmpty: true }, (cell) => {
                const colValue = cell.value ? cell.value.toString() : "";
                maxLength = Math.max(maxLength, colValue.length);
            });
            column.width = maxLength < 10 ? 10 : maxLength + 5;
        });

        const buffer = await workbook.xlsx.writeBuffer();
        saveAs(new Blob([buffer]), "Reminder_Type_Master.xlsx");
    };

    // Download PDF
    const handlepdf = async () => {
        setLoading(true);
        const filteredData = gridRef.current.api.getModel().rowsToDisplay.map(rowNode => rowNode.data);

        const doc = new jsPDF({ orientation: "landscape", format: 'a4' });
        const title = 'Reminder Type Master';
        const reportDate = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
        const imgData = logo;

        const headers = ['S.No', 'Reminder Type', 'Created By', 'Created Date', 'Last Modified By', 'Last Modified Date'];
        const formatDate = (d) => {
            if (!d) return "-";
            const date = new Date(d);
            if (isNaN(date)) return d;
            const year = date.getUTCFullYear();
            const month = String(date.getUTCMonth() + 1).padStart(2, "0");
            const day = String(date.getUTCDate()).padStart(2, "0");
            const hh = String(date.getUTCHours()).padStart(2, "0");
            const mi = String(date.getUTCMinutes()).padStart(2, "0");
            const ss = String(date.getUTCSeconds()).padStart(2, "0");
            return `${day}-${month}-${year} ${hh}:${mi}:${ss}`;
        };

        const bodyData = filteredData.map((item, index) => [
            index + 1,
            item.ReminderType || "",
            item.Createdby || "-",
            formatDate(item.Createddate) || "-",
            item.updatedby || "-",
            formatDate(item.updateddate) || "-",
        ]);

        if (bodyData.length > 0) {
            autoTable(doc, {
                head: [headers],
                body: bodyData,
                margin: { top: 40, right: 15, left: 10, bottom: 20 },
                styles: { halign: "center", valign: "middle", fontSize: 10, font: "times", cellPadding: 3 },
                headStyles: { fillColor: [0, 0, 0], textColor: [255, 255, 255], fontSize: 11, halign: 'center', fontStyle: 'bold' },
                didDrawPage: (data) => {
                    const pageWidth = doc.internal.pageSize.width;
                    const pageHeight = doc.internal.pageSize.height;
                    doc.addImage(imgData, 'PNG', 10, 5, 30, 12);
                    doc.setFontSize(20);
                    doc.setFont("times", "bold");
                    doc.text(`${title} - ${reportDate}`, pageWidth / 2, 22, { align: 'center' });
                    doc.setFontSize(8);
                    doc.text(`Page ${doc.internal.getCurrentPageInfo().pageNumber}`, pageWidth - 10, 10, { align: 'right' });
                    const footerText = `Printed By: ${auth.employeename} | Printed On: ${new Date().toLocaleDateString()} | Time: ${new Date().toLocaleTimeString()}`;
                    const footerNote = `Note: This document has been generated electronically and is valid without signature.`;
                    doc.text(footerText, pageWidth / 2, pageHeight - 15, { align: 'center' });
                    doc.text(footerNote, pageWidth / 2, pageHeight - 8, { align: 'center' });
                }
            });
            doc.save("Reminder Type Master.pdf");
        } else {
            swal("No data available to export", "", "warning");
        }
        setLoading(false);
    };

    // Edit Renderer
    const EditRenderer = (params) => {
        // Uncomment below if you want to hide edit button based on permission
        // if (permission.EditStatus === null || permission.EditStatus === 'i') {
        //     return null;
        // }

        return (
            <div>
                <button
                    className="border-0 mt-1 rounded-circle d-flex justify-content-center align-items-center"
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
                    onClick={() => handlefetch(params.data.ReminderTypeID)}
                >
                    <FaEdit className="fs-5" />
                </button>
            </div>
        );
    };

    const pagination = true;
    const paginationPageSize = 50;
    const paginationPageSizeSelector = [10, 20, 50];

    const columndef = [
        { headerName: "S.No", valueGetter: "node.rowIndex + 1", width: 80, pinned: 'left' },
        { headerName: "Reminder Type", field: 'ReminderType', filter: true, floatingFilter: true },
        { headerName: "Created By", field: "Createdby", valueGetter: (p) => p.data?.Createdby || "-" },
        {
            headerName: "Created Date",
            field: "Createddate",
            valueGetter: (p) => {
                const date = p.data?.Createddate;
                if (!date) return '-';
                const d = new Date(date);
                const yyyy = d.getUTCFullYear();
                const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
                const dd = String(d.getUTCDate()).padStart(2, '0');
                const hh = String(d.getUTCHours()).padStart(2, '0');
                const mi = String(d.getUTCMinutes()).padStart(2, '0');
                const ss = String(d.getUTCSeconds()).padStart(2, '0');
                return `${dd}-${mm}-${yyyy} ${hh}:${mi}:${ss}`;
            },
        },
        { headerName: "Last Modified By", field: "updatedby", valueGetter: (p) => p.data?.updatedby || "-" },
        {
            headerName: "Last Modified Date",
            field: "updateddate",
            valueGetter: (p) => {
                const date = p.data?.updateddate;
                if (!date) return '-';
                const d = new Date(date);
                const yyyy = d.getUTCFullYear();
                const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
                const dd = String(d.getUTCDate()).padStart(2, '0');
                const hh = String(d.getUTCHours()).padStart(2, '0');
                const mi = String(d.getUTCMinutes()).padStart(2, '0');
                const ss = String(d.getUTCSeconds()).padStart(2, '0');
                return `${dd}-${mm}-${yyyy} ${hh}:${mi}:${ss}`;
            },
        },
        { headerName: "Make Changes", field: 'Edit', cellRenderer: EditRenderer, width: 150 },
    ];

    const fetchData = async () => {
        try {
            const data = { mode: 'S', branchid: auth.branchid, BranchAccess: auth.BranchAccess };
            const response = await axios.post(`${API_URL}/ReminderTypeAPI`, data);
            setRowdata(response.data.send || []);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const autoGroupColumnDef = useMemo(() => ({
        headerCheckboxSelection: true,
        field: "id",
        flex: 1,
        minWidth: 240,
        cellRendererParams: { checkbox: true },
    }), []);

    // Save New Reminder Type
    const handleSave = async () => {
        if (!Register.ReminderType.trim()) {
            swal({ icon: 'warning', title: 'Please Enter Reminder Type' });
            return;
        }
        if (rowdata.some(item => item.ReminderType.trim().toLowerCase() === Register.ReminderType.trim().toLowerCase())) {
            swal({ title: 'Reminder Type Already Exists', icon: 'error' });
            return;
        }
        try {
            const alldata = { ...Register, mode: 'I', Createdby: auth.empid, branchid: auth.branchid };
            const response = await axios.post(`${API_URL}/ReminderTypeAPI`, alldata);
            if (response.status === 200) {
                swal({ title: 'Saved Successfully', icon: 'success' }).then(() => {
                    fetchData();
                    setRegister({ ReminderType: '', ReminderTypeID: '' });
                });
            }
        } catch (err) {
            console.log(err);
        }
    };

    // Fetch for Edit
    const handlefetch = async (ReminderTypeID) => {
        if (auth.branchid === "0" || auth.branchid === 0) {
            swal({ icon: 'warning', title: 'Invalid Selection', text: "Please select a specific branch. 'ALL' is not allowed." });
            return;
        }
        try {
            const modal = new bootstrap.Modal(document.getElementById('exampleModalEdit'));
            modal.show();

            const data = { ReminderTypeID, mode: 'SI', branchid: auth.branchid };
            const response = await axios.post(`${API_URL}/ReminderTypeAPI`, data);

            if (response.status === 200 && response.data.send.length > 0) {
                const { ReminderType } = response.data.send[0];
                setRegister({ ReminderType, ReminderTypeID });
            }
        } catch (err) {
            console.log(err);
            swal({ title: 'Error loading data', icon: 'error' });
        }
    };

    // Update Existing
    const handleEdit = async () => {
        if (!Register.ReminderType.trim()) {
            swal({ icon: 'warning', title: 'Please Enter Reminder Type' });
            return;
        }
        // Optional: prevent duplicate (excluding current record)
        if (rowdata.some(item => item.ReminderType.trim().toLowerCase() === Register.ReminderType.trim().toLowerCase() && item.ReminderTypeID !== Register.ReminderTypeID)) {
            swal({ title: 'Reminder Type Already Exists', icon: 'error' });
            return;
        }
        try {
            const data = { ...Register, mode: 'U', Updatedby: auth.empid, branchid: auth.branchid };
            const response = await axios.post(`${API_URL}/ReminderTypeAPI`, data);
            if (response.status === 200) {
                fetchData();
                swal({ title: 'Updated Successfully', icon: 'success' });
                setRegister({ ReminderType: '', ReminderTypeID: '' });
            }
        } catch (err) {
            console.log(err);
        }
    };

    // Upload handlers...
    const handleUploadExcelSheet = (e) => {
        const file = e.target.files[0];
        if (file) {
            const ext = file.name.split('.').pop().toLowerCase();
            if (['csv', 'xls', 'xlsx'].includes(ext)) {
                setuploadxl(file);
            } else {
                swal({ title: 'Invalid File Format', text: 'Please select a valid CSV or Excel file.', icon: 'warning' });
                setuploadxl(null);
                e.target.value = null;
            }
        }
    };

    const handleUploadData = async () => {
        if (!uploadxl) {
            swal({ text: 'Please Select Upload File', icon: 'warning' });
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
                setLoading(true);

                const formData = new FormData();
                formData.append('file', uploadxl);
                formData.append('branchid', auth.branchid);
                formData.append('Createdby', auth.empid);

                const response = await axios.post(`${API_URL}/ReminderTypeUploadData`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });

                const { uploadcount, unuploadedFilePath } = response.data;
                if (unuploadedFilePath) {
                    Swal.fire({
                               title: `Total Uploaded File Count: ${uploadcount}`,
                               text: "Some data could not be uploaded. Please download the file to see the errors.",
                               icon: 'warning',
                               showCancelButton: true,
                               cancelButtonText: 'OK',
                               confirmButtonText: 'Download File',
                             }).then((result) => {
                               if (result.isConfirmed) {
                                 const link = document.createElement('a');
                                 link.href = `${API_URL}${unuploadedFilePath}`;
                                 link.setAttribute('download', 'UnuploadedReminderType.xlsx');
                                 document.body.appendChild(link);
                                 link.click();
                                 link.remove();
                               }
                             });
                } else {
                    swal({ title: `All ${uploadcount} records uploaded successfully`, icon: 'success' });
                    fetchData();
                }
            } catch (err) {
                swal({ title: 'Upload Failed', icon: 'error' });
            } finally {
                setUploadvisible(false);
                setLoading(false);
            }
        }
    };

    const handleAddReminderTypeClick = () => {
        if (auth.branchid === "0" || auth.branchid === 0) {
            swal({ icon: 'warning', title: 'Invalid Selection', text: "Please select a specific branch. 'ALL' is not allowed." });
            return;
        }
        setRegister({ ReminderType: '', ReminderTypeID: '' });
        const modal = new bootstrap.Modal(document.getElementById('exampleModal'));
        modal.show();
    };

    return (
        <div>
            {loading && (
                <div className="loading-overlay">
                    <div className="loading-spinner">
                        <BallTriangle height={100} width={100} radius={5} color="#4fa94d" visible={true} />
                    </div>
                </div>
            )}

            {/* Add Modal */}
            <div className="modal fade" id="exampleModal" tabIndex="-1" aria-labelledby="exampleModalLabel">
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content">
                        <div className="modal-header pro-header">
                            <h1 className="modal-title fs-5 text-white">Add Reminder Type</h1>
                            <button
                                type="button"
                                className="btn-close btn-close-white border border-danger"
                                data-bs-dismiss="modal"
                                onClick={() => setRegister({ ReminderType: '', ReminderTypeID: '' })}
                            />
                        </div>
                        <div className="modal-body">
                            <div>
                                <label className="form-label">
                                    Reminder Type <span className="text-danger">*</span>
                                </label>
                                <input
                                    className="form-control"
                                    placeholder="Enter Reminder Type"
                                    value={Register.ReminderType}
                                    onChange={(e) => setRegister({ ...Register, ReminderType: e.target.value })}
                                />
                            </div>
                            <div className="mt-4 text-center d-flex justify-content-end">
                                <button type="button" className="btn btn-danger mx-1" onClick={() => setRegister({ ...Register, ReminderType: '' })}>
                                    Clear
                                </button>
                                {/* <button type="button" className="btn btn-secondary px-4" data-bs-dismiss="modal" onClick={() => setRegister({ ...Register, ReminderType: '' })}>
                                    Cancel
                                </button> */}
                                <button className="btn btn-success" onClick={handleSave} data-bs-dismiss="modal">
                                    Save
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Edit Modal */}
            <div className="modal fade" id="exampleModalEdit" tabIndex="-1" data-bs-backdrop="static">
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content">
                        <div className="modal-header pro-header">
                            <h1 className="modal-title fs-5 text-white">Edit Reminder Type</h1>
                            <button
                                type="button"
                                className="btn-close btn-close-white border border-danger"
                                data-bs-dismiss="modal"
                                onClick={() => setRegister({ ReminderType: '', ReminderTypeID: '' })}
                            />
                        </div>
                        <div className="modal-body">
                            <div>
                                <label className="form-label">
                                    Reminder Type <span className="text-danger">*</span>
                                </label>
                                <input
                                    className="form-control"
                                    placeholder="Enter Reminder Type"
                                    value={Register.ReminderType || ''}
                                    onChange={(e) => setRegister({ ...Register, ReminderType: e.target.value })}
                                />
                            </div>
                            <div className="mt-4 text-center d-flex justify-content-end">
                                <button type="button" className="btn btn-danger mx-1" onClick={() => setRegister({ ...Register, ReminderType: '' })}>
                                    Clear
                                </button>
                                {/* <button type="button" className="btn btn-secondary px-4" data-bs-dismiss="modal" onClick={() => setRegister({ ...Register, ReminderType: '', ReminderTypeID: '' })}>
                                    Cancel
                                </button> */}
                                <button className="btn btn-success" onClick={handleEdit} data-bs-dismiss="modal">
                                    Update
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Export Modal */}
            <div className="modal fade" id="exampleModal2" tabIndex="-1">
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content">
                        <div className="modal-header pro-header">
                            <h1 className="modal-title fs-5 text-white">Download Format</h1>
                            <button type="button" className="btn-close btn-close-white border border-danger" data-bs-dismiss="modal" />
                        </div>
                        <div className="modal-body">
                            <div className="d-flex justify-content-evenly">
                                <div className="btn btn-success" onClick={downloadExcel}><i className="bi bi-file-earmark-spreadsheet fs-1"></i></div>
                                <div className="btn btn-danger" onClick={handlepdf}><i className="bi bi-filetype-pdf fs-1"></i></div>
                            </div>
                            <div className="d-flex justify-content-evenly mt-2">
                                <span className="text-muted">Download Excel Format</span>
                                <span className="text-muted">Download PDF Format</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Import Modal */}
            {Uploadvisible && (
                <div className="modal fade show" style={{ display: 'block' }}>
                    <div className="modal-dialog modal-dialog-centered modal-lg">
                        <div className="modal-content card">
                            <div className="modal-header">
                                <button type="button" className="btn-close" onClick={() => setUploadvisible(false)} />
                            </div>
                            <div className="modal-body">
                                <div className="import-input">
                                    <label className="form-label">Import Data</label>
                                    <input type="file" className="form-control" accept=".csv, .xls, .xlsx" onChange={handleUploadExcelSheet} />
                                </div>
                                <hr />
                                <div className="text-center">
                                    <p>Important ⚠</p>
                                    <span className="text-danger">Download template and fill data accordingly before uploading</span><br />
                                    <a href="/ReminderTypeTemp.xlsx" className="nav-link text-decoration-underline" download>Click to Download Template</a>
                                </div>
                                <div className="text-center mt-3">
                                    <button className="btn btn-danger mx-2" onClick={() => setUploadvisible(false)}>Cancel</button>
                                    <button className="btn btn-success mx-2" onClick={handleUploadData}>Upload Data</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="card pb-5">
                <div className="card-header pro-header p-1">
                    <div className="d-flex align-items-center">
                        <div style={{ width: "33%" }}></div>
                        <div className="text-center" style={{ width: "34%" }}>
                            <h3 className="text-white m-0 text-nowrap">
                                <i className="bi bi-ui-radios-grid fs-4"></i> Reminder Type Details
                            </h3>
                        </div>
                        <div className="text-end" style={{ width: "33%" }}>
                            <button
                                className="btn-close fs-4 me-2 btn-close-white border border-danger"
                                style={{ cursor: "pointer" }}
                                onClick={() => navigate("/Settings/Configure")}
                            />
                        </div>
                    </div>
                </div>

                <div className="d-flex justify-content-end my-2 flex-wrap mx-5">
                    {permission.EditStatus !== null && permission.EditStatus !== 'i' && (
                        <CButton color="primary" variant="outline" className="me-2 btn-hover-effect" onClick={() => setUploadvisible(true)}>
                            <i className="bi bi-cloud-download me-1"></i>Import
                        </CButton>
                    )}
                    <CButton color="danger" variant="outline" className="me-2 btn-hover-effect" data-bs-toggle="modal" data-bs-target="#exampleModal2">
                        <i className="bi bi-cloud-upload me-1"></i>Export
                    </CButton>
                    {permission.EditStatus !== null && permission.EditStatus !== 'i' && (
                        <CButton color="success" variant="outline" className="me-2 btn-hover-effect" onClick={handleAddReminderTypeClick}>
                            <i className="bi bi-plus-lg"></i>Add
                        </CButton>
                    )}
                </div>

                <div className="ag-theme-quartz mx-5 mt-2" style={{ height: "500px" }}>
                    <AgGridReact
                        ref={gridRef}
                        rowData={rowdata}
                        columnDefs={columndef}
                        rowSelection="multiple"
                        autoGroupColumnDef={autoGroupColumnDef}
                        pagination={pagination}
                        paginationPageSize={paginationPageSize}
                        paginationPageSizeSelector={paginationPageSizeSelector}
                    />
                </div>
            </div>
        </div>
    );
};

ReminderTypes.propTypes = {
    auth: PropTypes.any.isRequired,
};

export default ReminderTypes;