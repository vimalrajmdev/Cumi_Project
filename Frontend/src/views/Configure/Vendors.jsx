import React, { useMemo, useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AgGridReact } from 'ag-grid-react';
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import axios from 'axios';
import Swal from 'sweetalert2';
import PropTypes from 'prop-types';
import { getConfig } from 'src/config';
import { FaEdit } from 'react-icons/fa';
import { CButton } from '@coreui/react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import logo from 'src/assets/images/Base64/Apple_base64';
import autoTable from 'jspdf-autotable';
import { BallTriangle } from 'react-loader-spinner';

const Vendors = ({ auth }) => {
    const location = useLocation();
    const { permission } = location.state || {};
    const navigate = useNavigate();
    const gridRef = useRef(null);

    const [Uploadvisible, setUploadvisible] = useState(false);
    const [uploadxl, setuploadxl] = useState(null);
    const [loading, setLoading] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isEditModalVisible, setIsEditModalVisible] = useState(false);

    const API_URL = getConfig().REACT_APP_API_URL;

    const [register, setRegister] = useState({
        VendorID: '', VendorName: '', ContactPerson: '', PhoneNumber: '', Email: '', GSTNumber: '',
        Address: '', City: '', State: '', Country: '', PostalCode: '', BankAccountNo: '', IFSC: '', PAN: ''
    });

    const [VendorData, setVendorData] = useState([]);

    // Reset form
    const resetForm = () => {
        setRegister({
            VendorID: '', VendorName: '', ContactPerson: '', PhoneNumber: '', Email: '', GSTNumber: '',
            Address: '', City: '', State: '', Country: '', PostalCode: '', BankAccountNo: '', IFSC: '', PAN: ''
        });
    };

    // Fetch Vendors
    const fetchData = async () => {
        try {
            const payload = { branchid: auth.branchid, mode: 'S', BranchAccess: auth.BranchAccess };
            const response = await axios.post(`${API_URL}/FetchVendors`, payload);
            setVendorData(response.data.send || []);
        } catch (error) {
            console.error('Error fetching vendors:', error);
        }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 60000);
        return () => clearInterval(interval);
    }, []);

    // Handle Input Change
    const handleChange = (e) => {
        const { name, value } = e.target;
        setRegister(prev => ({ ...prev, [name]: value }));
    };

    // Add Vendor
    const handleSave = async () => {
        if (!register.VendorName.trim()) {
            Swal.fire({ icon: 'error', title: 'Please Enter Vendor Name' });
            return;
        }
        if (!register.PhoneNumber.trim()) {
            Swal.fire({ icon: 'error', title: 'Please Enter Phone Number' });
            return;
        }

        const isDuplicate = VendorData.some(item =>
            item.PhoneNumber?.trim() === register.PhoneNumber.trim()
        );

        if (isDuplicate) {
            Swal.fire({ title: 'Phone Number Already Exists', icon: 'error' });
            return;
        }

        try {
            const payload = { ...register, Createdby: auth.empid, branchid: auth.branchid, mode: 'I' };
            const response = await axios.post(`${API_URL}/SaveVendors`, payload);

            if (response.status === 200) {
                fetchData();
                resetForm();
                Swal.fire({ title: 'Saved Successfully', icon: 'success' }).then(() => {
                    setIsModalVisible(false);
                });
            }
        } catch (err) {
            console.error(err);
            Swal.fire('Save Failed', '', 'error');
        }
    };

    // Edit Vendor Fetch
    const handleEditRenderer = async (VendorID) => {
        if (auth.branchid === "0" || auth.branchid === 0) {
            Swal.fire({ icon: 'warning', title: 'Invalid Selection', text: "Please select a specific branch." });
            return;
        }

        try {
            const response = await axios.post(`${API_URL}/FetchGivenVendors`, {
                VendorID,
                mode: 'SI',
                branchid: auth.branchid
            });

            if (response.status === 200 && response.data.send.length > 0) {
                setRegister(response.data.send[0]);
                setIsEditModalVisible(true);
            }
        } catch (err) {
            console.error(err);
        }
    };

    // Update Vendor - Phone number not editable & no duplicate check
    const handleUpdate = async () => {
        if (!register.VendorName.trim()) {
            Swal.fire({ icon: 'error', title: 'Please Enter Vendor Name' });
            return;
        }

        try {
            const payload = { ...register, Updatedby: auth.empid, branchid: auth.branchid, mode: 'U' };
            const response = await axios.post(`${API_URL}/UpdateVendors`, payload);

            if (response.status === 200) {
                fetchData();
                resetForm();
                Swal.fire({ title: 'Updated Successfully', icon: 'success' }).then(() => {
                    setIsEditModalVisible(false);
                });
            }
        } catch (err) {
            console.error(err);
            Swal.fire('Update Failed', '', 'error');
        }
    };

    // Excel Export
    const downloadExcel = async () => {
        const columnDefs = [
            { header: "S.No", key: "S.No" },
            { header: "Vendor Name", key: "VendorName" },
            { header: "Contact Person", key: "ContactPerson" },
            { header: "Phone Number", key: "PhoneNumber" },
            { header: "Email", key: "Email" },
            { header: "GST Number", key: "GSTNumber" },
            { header: "Address", key: "Address" },
            { header: "City", key: "City" },
            { header: "State", key: "State" },
            { header: "Country", key: "Country" },
            { header: "Postal Code", key: "PostalCode" },
            { header: "Bank AccountNo", key: "BankAccountNo" },
            { header: "IFSC", key: "IFSC" },
            { header: "PAN", key: "PAN" },
            { header: "Created By", key: "Createdby" },
            { header: "Created Date", key: "Createddate" },
            { header: "Last Modified By", key: "updatedby" },
            { header: "Last Modified Date", key: "updateddate" },
        ];

        const rowData = [];
        gridRef.current.api.forEachNode(node => rowData.push(node.data));

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
        const sheet = workbook.addWorksheet("Vendor Master");
        sheet.views = [{ showGridLines: false }];

        const now = new Date();
        const formattedDate = now.toLocaleDateString("en-IN");

        sheet.mergeCells(1, 1, 1, columnDefs.length);
        const titleCell = sheet.getCell("A1");
        titleCell.value = `VENDOR MASTER - ${formattedDate}`;
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

        rowData.forEach((row, index) => {
            const rowValues = columnDefs.map(c => {
                if (c.header === "S.No") return index + 1;
                let v = row[c.key];
                if (c.key === "Createddate" || c.key === "updateddate") return formatDate(v);
                return v ?? "-";
            });
            const dataRow = sheet.addRow(rowValues);
            dataRow.eachCell(cell => {
                cell.alignment = { horizontal: "center", vertical: "center" };
                cell.border = { top: { style: "thin" }, left: { style: "thin" }, bottom: { style: "thin" }, right: { style: "thin" } };
            });
        });

        sheet.columns.forEach(column => {
            let maxLength = 0;
            column.eachCell({ includeEmpty: true }, cell => {
                const colValue = cell.value ? cell.value.toString() : "";
                maxLength = Math.max(maxLength, colValue.length);
            });
            column.width = maxLength < 10 ? 10 : maxLength + 5;
        });

        const buffer = await workbook.xlsx.writeBuffer();
        saveAs(new Blob([buffer]), "Vendor Master.xlsx");
    };

    // PDF Export
    const handlepdf = async () => {
        setLoading(true);
        const filteredData = gridRef.current.api.getModel().rowsToDisplay.map(rowNode => rowNode.data);

        const doc = new jsPDF({ orientation: "landscape", format: 'a4' });
        const title = 'Vendor Master';
        const reportDate = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
        const imgData = logo;

        const headers = [
            'S.No', 'Vendor Name', 'Contact Person', 'Phone Number', 'Email', 'GSTNumber',
            'Address', 'City', 'State', 'Country', 'Postal Code', 'BankAccountNo', 'IFSC', 'PAN',
            'Created By', 'Created Date', 'Last Modified By', 'Last Modified Date'
        ];

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
            item.VendorName || "-",
            item.ContactPerson || "-",
            item.PhoneNumber || "-",
            item.Email || "-",
            item.GSTNumber || "-",
            item.Address || "-",
            item.City || "-",
            item.State || "-",
            item.Country || "-",
            item.PostalCode || "-",
            item.BankAccountNo || "-",
            item.IFSC || "-",
            item.PAN || "-",
            item.Createdby || "-",
            formatDate(item.Createddate) || "-",
            item.updatedby || "-",
            formatDate(item.updateddate) || "-"
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
            doc.save("Vendor Master.pdf");
        } else {
            Swal.fire("No data available to export", "", "warning");
        }
        setLoading(false);
    };

    // Edit Renderer
    const EditRenderer = (params) => {
        if (!permission || permission.EditStatus === 'i') return null;

        return (
            <button
                className="border-0 rounded-circle d-flex justify-content-center align-items-center"
                style={{
                    width: "40px",
                    height: "40px",
                    background: "rgba(25,135,84,0.15)",
                    border: "1px solid rgba(25,135,84,0.3)",
                    color: "#198754"
                }}
                onClick={() => handleEditRenderer(params.data.VendorID)}
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
        { headerName: "S.No", valueGetter: "node.rowIndex + 1", width: 90, },
        { headerName: "Vendor Name", field: "VendorName", filter: true, floatingFilter: true },
        { headerName: "Phone Number", field: "PhoneNumber", filter: true, floatingFilter: true },
        { headerName: "Contact Person", field: "ContactPerson", filter: true, floatingFilter: true },
        { headerName: "Email", field: "Email" },
        { headerName: "GST Number", field: "GSTNumber" },
        { headerName: "Address", field: "Address" },
        { headerName: "City", field: "City" },
        { headerName: "State", field: "State" },
        { headerName: "Country", field: "Country" },
        { headerName: "Postal Code", field: "PostalCode" },
        { headerName: "Bank Account No", field: "BankAccountNo" },
        { headerName: "IFSC", field: "IFSC" },
        { headerName: "PAN", field: "PAN" },
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
        { headerName: "Edit", cellRenderer: EditRenderer, width: 100 , pinned:"right" }
    ];

    const handleAddvendorsClick = () => {
        if (auth.branchid === "0" || auth.branchid === 0) {
            Swal.fire({ icon: 'warning', title: 'Invalid Selection', text: "Please select a specific branch. 'ALL' is not allowed." });
            return;
        }
        resetForm();
        setIsModalVisible(true);
    };

    // Import Handling
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
        if (!uploadxl) {
            Swal.fire('No File Selected', 'Please select a file to upload.', 'warning');
            return;
        }

        const confirm = await Swal.fire({
            title: "Confirm Upload?",
            text: "This will import vendor data.",
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

            const response = await axios.post(`${API_URL}/VendorUploadData`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            const { uploadcount, unuploadedFilePath } = response.data;

            if (unuploadedFilePath) {
                Swal.fire({
                    title: `Partial Upload: ${uploadcount} records processed`,
                    text: "Download error file?",
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonText: 'Download'
                }).then(result => {
                    if (result.isConfirmed) {
                        const link = document.createElement('a');
                        link.href = `${API_URL}${unuploadedFilePath}`;
                        link.download = 'unuploadedVendordata.xlsx';
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

    return (
        <div>
            {loading && (
                <div className="loading-overlay">
                    <div className="loading-spinner">
                        <BallTriangle height={100} width={100} color="#4fa94d" visible={true} />
                    </div>
                </div>
            )}

            {/* Add Vendor Modal */}
            <div className={`modal fade ${isModalVisible ? "show" : ""}`} style={{ display: isModalVisible ? "block" : "none" }} data-bs-backdrop="static">
                <div className="modal-dialog modal-dialog-centered modal-xl">
                    <div className="modal-content shadow-lg border-0 rounded-3">
                        <div className="modal-header p-2 pro-header text-white">
                            <h5 className="modal-title fw-bold">Add Vendor</h5>
                            <button type="button" className="btn-close btn-close-white" onClick={() => { resetForm(); setIsModalVisible(false); }}></button>
                        </div>
                        <div className="modal-body">
                            <div className="row g-3">
                                <div className="col-md-3">
                                    <label className="form-label">Vendor Name <span className="text-danger">*</span></label>
                                    <input type="text" name="VendorName" className="form-control" value={register.VendorName} onChange={handleChange} placeholder="Enter Vendor Name" />
                                </div>
                                <div className="col-md-3">
                                    <label className="form-label">Contact Person</label>
                                    <input type="text" name="ContactPerson" className="form-control" value={register.ContactPerson} onChange={handleChange} placeholder="Enter Contact Person" />
                                </div>
                                <div className="col-md-3">
                                    <label className="form-label">Phone Number <span className="text-danger">*</span></label>
                                    <input type="text" name="PhoneNumber" maxLength="10" className="form-control" value={register.PhoneNumber} onChange={handleChange} placeholder="Enter Phone Number" />
                                </div>
                                <div className="col-md-3">
                                    <label className="form-label">Email</label>
                                    <input type="email" name="Email" className="form-control" value={register.Email} onChange={handleChange} placeholder="Enter Email ID" />
                                </div>
                                <div className="col-md-3">
                                    <label className="form-label">GST Number</label>
                                    <input type="text" name="GSTNumber" className="form-control" value={register.GSTNumber} onChange={handleChange} placeholder="Enter GST Number" />
                                </div>
                                <div className="col-md-3">
                                    <label className="form-label">Address</label>
                                    <input name="Address" className="form-control" value={register.Address} onChange={handleChange} placeholder="Enter Address"/>
                                </div>
                                <div className="col-md-3">
                                    <label className="form-label">City</label>
                                    <input type="text" name="City" className="form-control" value={register.City} onChange={handleChange} placeholder="Enter City" />
                                </div>
                                <div className="col-md-3">
                                    <label className="form-label">State</label>
                                    <input type="text" name="State" className="form-control" value={register.State} onChange={handleChange} placeholder="Enter State" />
                                </div>
                                <div className="col-md-3">
                                    <label className="form-label">Country</label>
                                    <input type="text" name="Country" className="form-control" value={register.Country} onChange={handleChange} placeholder="Enter Country" />
                                </div>
                                <div className="col-md-3">
                                    <label className="form-label">Postal Code</label>
                                    <input type="text" name="PostalCode" className="form-control" value={register.PostalCode} onChange={handleChange} placeholder="Enter Postal Code" />
                                </div>
                                <div className="col-md-3">
                                    <label className="form-label">Bank Account No</label>
                                    <input type="text" name="BankAccountNo" className="form-control" value={register.BankAccountNo} onChange={handleChange} placeholder="Enter Account No" />
                                </div>
                                <div className="col-md-3">
                                    <label className="form-label">IFSC Code</label>
                                    <input type="text" name="IFSC" className="form-control" value={register.IFSC} onChange={handleChange} placeholder="Enter IFSC Code" />
                                </div>
                                <div className="col-md-3">
                                    <label className="form-label">PAN</label>
                                    <input type="text" name="PAN" className="form-control" value={register.PAN} onChange={handleChange} placeholder="Enter PAN" />
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-danger" onClick={() => { resetForm() }}>Clear</button>
                            <button className="btn btn-success px-4" onClick={handleSave}>Save Vendor</button>
                        </div>
                    </div>
                </div>
            </div>

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

            {/* Edit Vendor Modal - Phone Number READ-ONLY */}
            <div className={`modal fade ${isEditModalVisible ? "show" : ""}`} style={{ display: isEditModalVisible ? "block" : "none" }} data-bs-backdrop="static">
                <div className="modal-dialog modal-dialog-centered modal-xl">
                    <div className="modal-content shadow-lg border-0 rounded-3">
                        <div className="modal-header p-2 pro-header text-white">
                            <h5 className="modal-title fw-bold text-light">Edit Vendor</h5>
                            <button type="button" className="btn-close btn-close-white" onClick={() => { resetForm(); setIsEditModalVisible(false); }}></button>
                        </div>
                        <div className="modal-body">
                            <div className="row g-3">
                                <div className="col-md-3">
                                    <label className="form-label">Vendor Name <span className="text-danger">*</span></label>
                                    <input type="text" name="VendorName" className="form-control" value={register.VendorName} onChange={handleChange} placeholder="Enter Vendor Name" />
                                </div>
                                <div className="col-md-3">
                                    <label className="form-label">Contact Person</label>
                                    <input type="text" name="ContactPerson" className="form-control" value={register.ContactPerson} onChange={handleChange} placeholder="Enter Contact Person" />
                                </div>
                                <div className="col-md-3">
                                    <label className="form-label">Phone Number <span className="text-danger">*</span></label>
                                    <input
                                        type="text"
                                        name="PhoneNumber"
                                        maxLength="10"
                                        className="form-control"
                                        value={register.PhoneNumber}
                                        readOnly
                                        style={{ backgroundColor: '#e9ecef', cursor: 'not-allowed' }}
                                    />
                                </div>
                                <div className="col-md-3">
                                    <label className="form-label">Email</label>
                                    <input type="email" name="Email" className="form-control" value={register.Email} onChange={handleChange} placeholder="Enter Email ID" />
                                </div>
                                <div className="col-md-3">
                                    <label className="form-label">GST Number</label>
                                    <input type="text" name="GSTNumber" className="form-control" value={register.GSTNumber} onChange={handleChange} placeholder="Enter GST Number" />
                                </div>
                                <div className="col-md-3">
                                    <label className="form-label">Address</label>
                                    <input name="Address"  className="form-control" value={register.Address} onChange={handleChange} placeholder="Enter Address"/>
                                </div>
                                <div className="col-md-3">
                                    <label className="form-label">City</label>
                                    <input type="text" name="City" className="form-control" value={register.City} onChange={handleChange} placeholder="Enter City" />
                                </div>
                                <div className="col-md-3">
                                    <label className="form-label">State</label>
                                    <input type="text" name="State" className="form-control" value={register.State} onChange={handleChange} placeholder="Enter State" />
                                </div>
                                <div className="col-md-3">
                                    <label className="form-label">Country</label>
                                    <input type="text" name="Country" className="form-control" value={register.Country} onChange={handleChange} placeholder="Enter Country" />
                                </div>
                                <div className="col-md-3">
                                    <label className="form-label">Postal Code</label>
                                    <input type="text" name="PostalCode" className="form-control" value={register.PostalCode} onChange={handleChange} placeholder="Enter Postal Code" />
                                </div>
                                <div className="col-md-3">
                                    <label className="form-label">Bank Account No</label>
                                    <input type="text" name="BankAccountNo" className="form-control" value={register.BankAccountNo} onChange={handleChange} placeholder="Enter Account No" />
                                </div>
                                <div className="col-md-3">
                                    <label className="form-label">IFSC Code</label>
                                    <input type="text" name="IFSC" className="form-control" value={register.IFSC} onChange={handleChange} placeholder="Enter IFSC Code" />
                                </div>
                                <div className="col-md-3">
                                    <label className="form-label">PAN</label>
                                    <input type="text" name="PAN" className="form-control" value={register.PAN} onChange={handleChange} placeholder="Enter PAN" />
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-danger" onClick={() => { resetForm();}}>Clear</button>
                            <button className="btn btn-success px-4" onClick={handleUpdate}>Save Changes</button>
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
                                <h5 className="modal-title">Import Vendors</h5>
                                <button type="button" className="btn-close" onClick={() => { setUploadvisible(false); setuploadxl(null); }}></button>
                            </div>
                            <div className="modal-body">
                                <input type="file" className="form-control" accept=".csv,.xls,.xlsx" onChange={handleUploadExcelSheet} />
                                <div className="text-center mt-3 text-danger small">
                                    <strong>Important:</strong> Use the correct template format.
                                    <br />
                                    <a href="/VendorTemp.xlsx" download className="text-primary">Download Template</a>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button className="btn btn-danger" onClick={() => { setUploadvisible(false); setuploadxl(null); }}>Cancel</button>
                                <button className="btn btn-success" onClick={handleUploadData} disabled={!uploadxl}>Upload</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Grid Section */}
            <div className='card pb-5'>
                <div className="card-header pro-header p-1">
                    <div className="d-flex align-items-center">
                        <div style={{ width: "33%" }}></div>
                        <div className="text-center" style={{ width: "34%" }}>
                            <h3 className="text-white m-0">
                                <i className="bi bi-person-lines-fill fs-4"></i> Vendors Details
                            </h3>
                        </div>
                        <div className="text-end" style={{ width: "33%" }}>
                            <button className="btn-close fs-4 me-2 btn-close-white border border-danger" style={{ cursor: 'pointer' }} onClick={() => navigate("/Settings/Configure")}></button>
                        </div>
                    </div>
                </div>

                <div className='d-flex justify-content-end flex-wrap mt-2 mx-5 gap-2'>
                    {permission?.EditStatus !== 'i' && (
                        <CButton color="primary" variant="outline" onClick={() => setUploadvisible(true)}>
                            <i className="bi bi-cloud-download me-1"></i>Import
                        </CButton>
                    )}
                    <CButton color="danger" variant="outline" data-bs-toggle="modal" data-bs-target="#exampleModal2">
                        <i className="bi bi-cloud-upload me-1"></i>Export
                    </CButton>
                    {permission?.EditStatus !== 'i' && (
                        <CButton color="success" variant="outline" onClick={handleAddvendorsClick}>
                            <i className="bi bi-plus-lg"></i>Add Vendor
                        </CButton>
                    )}
                </div>

                <div className='ag-theme-quartz mx-5 mt-3' style={{ height: "500px" }}>
                    <AgGridReact
                        ref={gridRef}
                        rowData={VendorData}
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

Vendors.propTypes = {
    auth: PropTypes.object.isRequired,
};

export default Vendors;