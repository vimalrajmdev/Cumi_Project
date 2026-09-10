import React, { useState, useMemo, useEffect, useRef } from 'react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import axios from 'axios';
import Swal from 'sweetalert2';
import { BallTriangle } from 'react-loader-spinner';
import PropTypes from 'prop-types';
import { getConfig } from 'src/config';
import { CButton } from '@coreui/react';
import { FaEdit, FaLayerGroup } from 'react-icons/fa';
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import logo from 'src/assets/images/Base64/Apple_base64';
import autoTable from 'jspdf-autotable';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AgGridReact } from 'ag-grid-react';
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";

const AssetGroup = ({ auth }) => {
    const location = useLocation();
    const { permission, screenId } = location.state || {};
    const navigate = useNavigate();
    const gridRef = useRef(null);

    const [Uploadvisible, setUploadvisible] = useState(false);
    const [uploadxl, setuploadxl] = useState(null);
    const [loading, setLoading] = useState(false);

    const API_URL = getConfig().REACT_APP_API_URL;

    const [Register, setRegister] = useState({
        GroupName: '',
        GroupId: ''
    });

    const [AssetGroupData, setAssetGroupData] = useState([]);

    // Reset form
    const resetForm = () => {
        setRegister({
            GroupName: '',
            GroupId: ''
        });
    };

    // Fetch Data
    const fetchData = async () => {
        try {
            const alldata = { mode: 'S', branchid: auth.branchid, BranchAccess: auth.BranchAccess, GroupId: '' };
            const response = await axios.post(`${API_URL}/AssetGroupConfig`, alldata);
            setAssetGroupData(response.data);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Handle Save (Add New)
    const handleSave = async () => {
        if (!Register.GroupName.trim()) {
            Swal.fire({
                icon: 'warning',
                title: 'Please Enter Group Name'
            });
            return;
        }

        const isDuplicate = AssetGroupData.some(item =>
            item.GroupName?.toString().trim().toLowerCase() === Register.GroupName.trim().toLowerCase()
        );

        if (isDuplicate) {
            Swal.fire({
                title: 'Group Name Already Exists',
                icon: 'error',
                confirmButtonText: 'OK'
            });
            return;
        }

        try {
            const payload = { ...Register, mode: 'I', branchid: auth.branchid, Createdby: auth.empid };
            const response = await axios.post(`${API_URL}/AssetGroupConfig`, payload);

            if (response.status === 200) {
                resetForm();
                fetchData();
                Swal.fire({
                    title: 'Saved Successfully',
                    icon: 'success',
                    confirmButtonText: 'OK'
                });
                const modal = bootstrap.Modal.getInstance(document.getElementById('exampleModal3'));
                modal?.hide();
            }
        } catch (err) {
            console.error(err);
            Swal.fire('Error saving data', '', 'error');
        }
    };

    // Handle Edit Fetch
    const handleEditAssetGroup = async (GroupId) => {
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

            const payload = { GroupId, mode: 'SD', branchid: auth.branchid };
            const response = await axios.post(`${API_URL}/AssetGroupConfig`, payload);

            if (response.status === 200 && response.data.length > 0) {
                setRegister(response.data[0]);
            }
        } catch (err) {
            console.error(err);
        }
    };

    // Handle Update
    const handleEdit = async () => {
        if (!Register.GroupName.trim()) {
            Swal.fire({
                icon: 'warning',
                title: 'Please Enter Group Name'
            });
            return;
        }

        const isDuplicate = AssetGroupData.some(item =>
            item.GroupId !== Register.GroupId &&
            item.GroupName?.toString().trim().toLowerCase() === Register.GroupName.trim().toLowerCase()
        );

        if (isDuplicate) {
            Swal.fire({
                title: 'Group Name Already Exists',
                icon: 'error',
                confirmButtonText: 'OK'
            });
            return;
        }

        try {
            const payload = { ...Register, mode: 'U', Updatedby: auth.empid, branchid: auth.branchid };
            const response = await axios.post(`${API_URL}/AssetGroupConfig`, payload);

            if (response.status === 200) {
                fetchData();
                resetForm();
                Swal.fire({
                    title: 'Updated Successfully',
                    icon: 'success',
                    confirmButtonText: 'OK'
                });
                const modal = bootstrap.Modal.getInstance(document.getElementById('exampleModalEDIT'));
                modal?.hide();
            }
        } catch (err) {
            console.error(err);
        }
    };

    // Excel Download
    const downloadExcel = async () => {
        const columnDefs = [
            { header: "S.No", key: "S.No" },
            { header: "Group Name", key: "GroupName" },
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
        const sheet = workbook.addWorksheet("Asset Group Master");
        sheet.views = [{ showGridLines: false }];

        const now = new Date();
        const formattedDate = now.toLocaleDateString("en-IN");

        sheet.mergeCells(1, 1, 1, columnDefs.length);
        const titleCell = sheet.getCell("A1");
        titleCell.value = `ASSET GROUP MASTER - ${formattedDate}`;
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
        saveAs(new Blob([buffer]), "Asset Group Master.xlsx");
    };

    // PDF Export
    const handlepdf = async () => {
        setLoading(true);
        const filteredData = gridRef.current.api.getModel().rowsToDisplay.map(rowNode => rowNode.data);

        const doc = new jsPDF({ orientation: "landscape", format: 'a4' });
        const title = 'Asset Group Master';
        const reportDate = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
        const imgData = logo;

        const headers = ['S.No', 'Group Name', 'Created By', 'Created Date', 'Last Modified By', 'Last Modified Date'];

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
            item.GroupName || "",
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
            doc.save("Asset Group Master.pdf");
        } else {
            Swal.fire("No data available to export", "", "warning");
        }
        setLoading(false);
    };

    // Upload Handling
    const handleUploadExcelSheet = (e) => {
        const file = e.target.files[0];
        if (file) {
            const ext = file.name.split('.').pop().toLowerCase();
            if (['csv', 'xls', 'xlsx'].includes(ext)) {
                setuploadxl(file);
            } else {
                Swal.fire('Invalid File Format', 'Please select a valid CSV or Excel file.', 'warning');
                setuploadxl(null);
                e.target.value = null;
            }
        }
    };

    const handleUploadData = async () => {
        if (auth.branchid === "0" || auth.branchid === 0) {
            Swal.fire('Invalid Branch', "Please select a specific branch.", 'warning');
            return;
        }
        if (!uploadxl) {
            Swal.fire('No File Selected', 'Please select a file to upload.', 'warning');
            return;
        }

        const confirm = await Swal.fire({
            title: "Confirm Upload?",
            text: "This will import asset group data.",
            icon: "question",
            showCancelButton: true,
            confirmButtonText: "Upload",
            cancelButtonText: "Cancel"
        });

        if (!confirm.isConfirmed) return;

        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('file', uploadxl);
            formData.append('branchid', auth.branchid);
            formData.append('Createdby', auth.empid);

            const response = await axios.post(`${API_URL}/AssetGroupUploadData`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            const { message, uploadcount, unuploadedFilePath } = response.data;

            if (unuploadedFilePath) {
                Swal.fire({
                    title: `Partial Upload: ${uploadcount} failed`,
                    text: "Download error file?",
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonText: 'Download'
                }).then(result => {
                    if (result.isConfirmed) {
                        const link = document.createElement('a');
                        link.href = `${API_URL}${unuploadedFilePath}`;
                        link.download = 'unuploaded_AssetGroup_data.xlsx';
                        link.click();
                    }
                });
            } else {
                Swal.fire('Success', `Uploaded ${uploadcount} records`, 'success');
                fetchData();
            }
        } catch (err) {
            Swal.fire('Upload Failed', 'Server error', 'error');
        } finally {
            setLoading(false);
            setUploadvisible(false);
            setuploadxl(null);
        }
    };

    // Edit Renderer
    const EditRenderer = (params) => {
        if (!permission || permission.EditStatus === 'i') return null;

        return (
            <button
                className="border-0 mt-1 rounded-circle d-flex justify-content-center align-items-center"
                style={{
                    width: "40px", height: "40px", background: "rgba(25, 135, 84, 0.15)",
                    border: "1px solid rgba(25, 135, 84, 0.3)", color: "#198754", boxShadow: "0 2px 6px rgba(0,0,0,0.1)"
                }}
                onClick={() => handleEditAssetGroup(params.data.GroupId)}
                onMouseEnter={e => {
                    e.currentTarget.style.background = "rgba(25,135,84,0.25)";
                    e.currentTarget.style.transform = "scale(1.1)";
                }}
                onMouseLeave={e => {
                    e.currentTarget.style.background = "rgba(25,135,84,0.15)";
                    e.currentTarget.style.transform = "scale(1)";
                }}
            >
                <FaEdit className="fs-5" />
            </button>
        );
    };

    const columndef = [
        { headerName: "S.No", valueGetter: "node.rowIndex + 1", width: 90, pinned: 'left' },
        { headerName: "Asset Group", field: 'GroupName', filter: true, floatingFilter: true },
        { headerName: "Created By", field: "Createdby", valueGetter: p => p.data?.Createdby || "-" },
        { headerName: "Created Date", field: "Createddate", valueGetter: p => {
            const d = p.data?.Createddate;
            if (!d) return '-';
            const date = new Date(d);
            return `${String(date.getUTCDate()).padStart(2,'0')}-${String(date.getUTCMonth()+1).padStart(2,'0')}-${date.getUTCFullYear()} ${String(date.getUTCHours()).padStart(2,'0')}:${String(date.getUTCMinutes()).padStart(2,'0')}:${String(date.getUTCSeconds()).padStart(2,'0')}`;
        }},
        { headerName: "Last Modified By", field: "updatedby", valueGetter: p => p.data?.updatedby || "-" },
        { headerName: "Last Modified Date", field: "updateddate", valueGetter: p => {
            const d = p.data?.updateddate;
            if (!d) return '-';
            const date = new Date(d);
            return `${String(date.getUTCDate()).padStart(2,'0')}-${String(date.getUTCMonth()+1).padStart(2,'0')}-${date.getUTCFullYear()} ${String(date.getUTCHours()).padStart(2,'0')}:${String(date.getUTCMinutes()).padStart(2,'0')}:${String(date.getUTCSeconds()).padStart(2,'0')}`;
        }},
        { headerName: "Edit", cellRenderer: EditRenderer, width: 150 }
    ];

    return (
        <div>
            {loading && (
                <div className="loading-overlay">
                    <div className="loading-spinner">
                        <BallTriangle height={100} width={100} color="#4fa94d" visible={true} />
                    </div>
                </div>
            )}

            {/* Export Modal */}
            <div className="modal fade" id="exampleModal2" tabIndex="-1">
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content">
                        <div className="modal-header p-2 pro-header">
                            <h1 className="modal-title fs-5 text-white">Download Format</h1>
                            <button className="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                        </div>
                        <div className="modal-body text-center">
                            <div className="d-flex justify-content-center gap-5">
                                <button className="btn btn-success btn-lg" onClick={downloadExcel}>
                                    <i className="bi bi-file-earmark-spreadsheet fs-1"></i><br />Excel
                                </button>
                                <button className="btn btn-danger btn-lg" onClick={handlepdf}>
                                    <i className="bi bi-filetype-pdf fs-1"></i><br />PDF
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Add Modal - Simple Input */}
            <div className="modal fade" id="exampleModal3" tabIndex="-1" data-bs-backdrop="static">
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content">
                        <div className="modal-header p-2 pro-header">
                            <h1 className="modal-title fs-5 text-white">Add Asset Group</h1>
                            <button type="button" className="btn-close btn-close-white" data-bs-dismiss="modal" onClick={resetForm}></button>
                        </div>
                        <div className="modal-body">
                            <label className="form-label">Asset Group Name <span className="text-danger">*</span></label>
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Enter Asset Group Name"
                                value={Register.GroupName}
                                onChange={(e) => setRegister({ ...Register, GroupName: e.target.value })}
                            />

                            <div className="mt-4 d-flex justify-content-end gap-2">
                                <button className="btn btn-danger"  onClick={resetForm}>
                                    Clear
                                </button>
                                <button className="btn btn-success" onClick={handleSave}>
                                    Save
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Edit Modal - Simple Input */}
            <div className="modal fade" id="exampleModalEDIT" tabIndex="-1" data-bs-backdrop="static">
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content">
                        <div className="modal-header p-2 pro-header">
                            <h1 className="modal-title fs-5 text-white">Edit Asset Group</h1>
                            <button type="button" className="btn-close btn-close-white" data-bs-dismiss="modal" onClick={resetForm}></button>
                        </div>
                        <div className="modal-body">
                            <label className="form-label">Asset Group Name <span className="text-danger">*</span></label>
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Edit Asset Group Name"
                                value={Register.GroupName}
                                onChange={(e) => setRegister({ ...Register, GroupName: e.target.value })}
                            />

                            <div className="mt-4 d-flex justify-content-end gap-2">
                                <button className="btn btn-danger" onClick={resetForm}>
                                    Clear
                                </button>
                                <button className="btn btn-success" onClick={handleEdit}>
                                    Update
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Import Modal */}
            {Uploadvisible && (
                <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-dialog-centered modal-lg">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Import Asset Groups</h5>
                                <button type="button" className="btn-close" onClick={() => { setUploadvisible(false); setuploadxl(null); }}></button>
                            </div>
                            <div className="modal-body">
                                <input type="file" className="form-control" accept=".csv,.xls,.xlsx" onChange={handleUploadExcelSheet} />
                                <div className="text-center mt-3 text-danger small">
                                    <strong>Important:</strong> Use the correct template format.
                                    <br />
                                    <a href="/AssetGroupTemp.xlsx" download className="text-primary">Download Template</a>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button className="btn btn-secondary" onClick={() => { setUploadvisible(false); setuploadxl(null); }}>
                                    Cancel
                                </button>
                                <button className="btn btn-success" onClick={handleUploadData} disabled={!uploadxl}>
                                    Upload
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className='card pb-5'>
                <div className="card-header pro-header p-1">
                    <div className="d-flex align-items-center">
                        <div style={{ width: "33%" }}></div>
                        <div className="text-center" style={{ width: "34%" }}>
                            <h3 className="text-white m-0">
                                <FaLayerGroup className='fs-4 mb-1 me-1' /> Asset Group Details
                            </h3>
                        </div>
                        <div className="text-end" style={{ width: "33%" }}>
                            <button className="btn-close btn-close-white me-2" onClick={() => navigate("/Settings/Configure")}></button>
                        </div>
                    </div>
                </div>

                <div className="d-flex justify-content-end flex-wrap mt-2 mx-5 gap-2">
                    {permission?.EditStatus !== 'i' && (
                        <CButton color="primary" variant="outline" onClick={() => setUploadvisible(true)}>
                            <i className="bi bi-cloud-download me-1"></i>Import
                        </CButton>
                    )}
                    <CButton color="danger" variant="outline" data-bs-toggle="modal" data-bs-target="#exampleModal2">
                        <i className="bi bi-cloud-upload me-1"></i>Export
                    </CButton>
                    {permission?.EditStatus !== 'i' && (
                        <CButton color="success" variant="outline" onClick={() => {
                            resetForm();
                            new bootstrap.Modal(document.getElementById('exampleModal3')).show();
                        }}>
                            <i className="bi bi-plus-lg"></i>Add
                        </CButton>
                    )}
                </div>

                <div className='ag-theme-quartz mx-5 mt-3' style={{ height: "500px" }}>
                    <AgGridReact
                        ref={gridRef}
                        rowData={AssetGroupData}
                        columnDefs={columndef}
                        pagination={true}
                        paginationPageSize={10}
                        paginationPageSizeSelector={[10, 20, 50]}
                        getRowHeight={() => 55}
                    />
                </div>
            </div>
        </div>
    );
};

AssetGroup.propTypes = {
    auth: PropTypes.object.isRequired,
};

export default AssetGroup;