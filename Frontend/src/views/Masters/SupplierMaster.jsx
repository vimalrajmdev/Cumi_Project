import React, { useMemo, useState, useEffect, useRef, useCallback } from 'react';
import { AgGridReact } from 'ag-grid-react';
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import axios from 'axios';
import Swal from 'sweetalert2';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { BallTriangle } from 'react-loader-spinner';
import { useLocation, useNavigate } from "react-router-dom";
import { getConfig } from 'src/config';
import CIcon from '@coreui/icons-react';
import { cilPlus, cilTrash } from '@coreui/icons';
import { FaEdit, FaEye } from 'react-icons/fa';
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

const SupplierMaster = ({ auth }) => {
    const API_URL = getConfig().REACT_APP_API_URL;
    const [loading, setLoading] = useState(false);
    const gridRef = useRef(null);
    const navigate = useNavigate();

    // ======================== STATE ========================
    const initialSupplier = {
        Id: '',
        SupplierCode: '',
        SupplierName: '',
        ContactPerson: '',
        ContactNumber: '',
        Email: '',
        Address: '',
        City: '',
        State: '',
        Country: '',
        Pincode: '',
        GSTNumber: '',
        PANNumber: '',
        PaymentTerms: '',
        BankName: '',
        AccountNumber: '',
        IFSCCode: '',
        Status: 'Active',
        Type: '',
        Remark: '',
        CreatedBy: ''
    };

    const [Supplier, setSupplier] = useState(initialSupplier);

    // ======================== PERMISSIONS (from Configure.jsx: state={{ permission, screenId: 'AC004' }}) ========================
    const location = useLocation();
    let permission = location.state?.permission;
    if (permission) {
        localStorage.setItem('supplierMasterPermission', JSON.stringify(permission));
    } else {
        const stored = localStorage.getItem('supplierMasterPermission');
        permission = stored ? JSON.parse(stored) : {};
    }

    const canAdd = auth.UserStatus === 'SA' || permission?.AddStatus === 'a';
    const canEdit = auth.UserStatus === 'SA' || permission?.EditStatus === 'a';
    const canDelete = auth.UserStatus === 'SA' || permission?.DeleteStatus === 'a';

    // ======================== ROW DATA ========================
    const [rowData, setRowData] = useState([]);

    // ======================== VALIDATION STATE ========================
    const [mobileMessage, setMobileMessage] = useState('');
    const [emailMessage, setEmailMessage] = useState('');

    // ======================== PAGINATION ========================
    const pagination = true;
    const paginationPageSize = 100;
    const paginationPageSizeSelector = [10, 50, 100];

    // ======================== FORMATTERS ========================
    const formatDate = (date) => {
        if (!date) return '';
        const d = new Date(date);
        return d.toISOString().split('T')[0];
    };

    // ======================== CLOSE MODAL HELPER ========================
    const closeModal = (modalId) => {
        try {
            const modalEl = document.getElementById(modalId);
            if (modalEl) {
                const modal = window.bootstrap.Modal.getInstance(modalEl);
                if (modal) modal.hide();
            }
        } catch (err) {
            console.log('Modal close error:', err);
        }
    };

    // ======================== CLEAR ========================
    const handleClear = useCallback(() => {
        setSupplier(initialSupplier);
        setMobileMessage('');
        setEmailMessage('');
    }, []);

    // ======================== FETCH DATA (branch-scoped) ========================
    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const alldata = {
                mode: 'FetchSupplier',
                branchid: auth.branchid,
                BranchAccess: auth.UserStatus === 'SA' ? null : auth.BranchAccess,
                Id: '',
                SupplierCode: '', SupplierName: '',
                ContactPerson: '', ContactNumber: '',
                Email: '', Address: '',
                City: '', State: '', Country: '', Pincode: '',
                GSTNumber: '', PANNumber: '', PaymentTerms: '',
                BankName: '', AccountNumber: '', IFSCCode: '',
                Status: '', Type: '', Remark: '', CreatedBy: ''
            };
            const response = await axios.post(`${API_URL}/SupplierConfig`, alldata);
            if (response.status === 200) {
                setRowData(Array.isArray(response.data) ? response.data : []);
            }
        } catch (error) {
            console.error('Error fetching supplier details:', error);
        } finally {
            setLoading(false);
        }
    }, [API_URL, auth.branchid, auth.BranchAccess, auth.UserStatus]);

    // ======================== VIEW HANDLER ========================
    const handleView = useCallback(async (data) => {
        try {
            const alldata = { mode: 'E', Id: data.Id };
            const response = await axios.post(`${API_URL}/SupplierConfig`, alldata);
            if (Array.isArray(response.data) && response.data.length > 0) {
                setSupplier(prev => ({ ...prev, ...response.data[0] }));
            }
        } catch (error) {
            console.log(error);
        }
    }, [API_URL]);

    // ======================== EDIT HANDLER ========================
    const handleEdit = useCallback(async (data) => {
        try {
            const alldata = { mode: 'E', Id: data.Id };
            const response = await axios.post(`${API_URL}/SupplierConfig`, alldata);
            if (Array.isArray(response.data) && response.data.length > 0) {
                setSupplier(prev => ({ ...prev, ...response.data[0] }));
            }
        } catch (error) {
            console.error('ERROR EDITING RECORD:', error);
        }
    }, [API_URL]);

    // ======================== DELETE HANDLER ========================
    const handleDelete = useCallback(async (data) => {
        const result = await Swal.fire({
            title: "Are you sure?",
            text: "Once deleted, you will not be able to recover the data!",
            icon: "warning",
            showCancelButton: true,
            cancelButtonText: 'Cancel',
            confirmButtonText: 'Delete',
        });
        if (result.isConfirmed) {
            setLoading(true);
            try {
                const alldata = { mode: 'D', Id: data.Id };
                await axios.post(`${API_URL}/SupplierConfig`, alldata);
                await fetchData();
                Swal.fire({
                    title: 'Deleted',
                    text: 'Deleted Successfully',
                    icon: 'success',
                    confirmButtonText: 'Done'
                });
            } catch (error) {
                console.error('ERROR DELETING RECORD:', error);
                Swal.fire({
                    title: 'Error',
                    text: 'Failed to delete. Please try again.',
                    icon: 'error'
                });
            } finally {
                setLoading(false);
            }
        }
    }, [API_URL, fetchData]);

    // ======================== VIEW RENDERER ========================
    const ViewRenderer = useCallback((params) => (
        <div>
            <button
                className="btn btn-hover-effect"
                onClick={() => handleView(params.data)}
                data-bs-toggle="modal"
                data-bs-target="#exampleModalView"
            >
                <FaEye className="text-primary cursor-pointer fs-3" title="View" />
            </button>
        </div>
    ), [handleView]);

    // ======================== EDIT RENDERER ========================
    const EditRenderer = useCallback((params) => {
        if (!canEdit) return null;
        return (
            <div>
                <button
                    onClick={() => handleEdit(params.data)}
                    data-bs-toggle="modal"
                    data-bs-target="#exampleModalEdit"
                    className='mt-1 ms-2'
                    style={{
                        background: 'linear-gradient(135deg, #007bff, #00b4d8)',
                        color: '#fff', border: 'none', borderRadius: '50%', padding: '7px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer', boxShadow: '0 4px 12px rgba(0, 123, 255, 0.35)',
                        transition: 'all 0.3s ease',
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'linear-gradient(135deg, #3399ff, #33ccff)';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 6px 18px rgba(51, 204, 255, 0.45)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'linear-gradient(135deg, #007bff, #00b4d8)';
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 123, 255, 0.35)';
                    }}
                >
                    <FaEdit className="fs-5" title="Edit" />
                </button>
            </div>
        );
    }, [handleEdit, canEdit]);

    // ======================== DELETE RENDERER ========================
    const DeleteRenderer = useCallback((params) => {
        if (!canDelete) return null;
        return (
            <div>
                <button
                    className='mt-1 ms-1'
                    onClick={() => handleDelete(params.data)}
                    style={{
                        background: 'linear-gradient(135deg, #ff4d4d, #ff1a1a)',
                        color: '#fff', border: 'none', borderRadius: '50%', padding: '4px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer', boxShadow: '0 4px 12px rgba(255, 0, 0, 0.35)',
                        transition: 'all 0.3s ease',
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'linear-gradient(135deg, #ff6666, #ff3333)';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 6px 18px rgba(255, 80, 80, 0.45)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'linear-gradient(135deg, #ff4d4d, #ff1a1a)';
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(255, 0, 0, 0.35)';
                    }}
                >
                    <CIcon icon={cilTrash} size="xl" />
                </button>
            </div>
        );
    }, [handleDelete, canDelete]);

    // ======================== COLUMN DEFINITIONS ========================
    const columdef = useMemo(() => [
        { headerCheckboxSelection: true, checkboxSelection: true, width: 60 },
        { headerName: "Supplier Code", field: "SupplierCode", filter: true, headerClass: 'agheader', floatingFilter: true },
        { headerName: "Supplier Name", field: "SupplierName", filter: true, headerClass: 'agheader', floatingFilter: true },
        { headerName: "Contact Person", field: "ContactPerson", filter: true, headerClass: 'agheader', floatingFilter: true },
        { headerName: "Contact Number", field: "ContactNumber", filter: true, headerClass: 'agheader', floatingFilter: true },
        { headerName: "Email", field: "Email", filter: true, headerClass: 'agheader', floatingFilter: true },
        { headerName: "City", field: "City", filter: true, headerClass: 'agheader', floatingFilter: true },
        { headerName: "State", field: "State", filter: true, headerClass: 'agheader', floatingFilter: true },
        { headerName: "Country", field: "Country", filter: true, headerClass: 'agheader', floatingFilter: true },
        { headerName: "GST Number", field: "GSTNumber", filter: true, headerClass: 'agheader', floatingFilter: true },
        { headerName: "Payment Terms", field: "PaymentTerms", filter: true, headerClass: 'agheader', floatingFilter: true },
        { headerName: "Bank Name", field: "BankName", filter: true, headerClass: 'agheader', floatingFilter: true },
        {
            headerName: "Status", field: "Status", filter: true, headerClass: 'agheader', floatingFilter: true,
            cellStyle: (params) => {
                if (params.value === 'Active') return { color: 'green', fontWeight: 'bold' };
                if (params.value === 'Inactive') return { color: 'red', fontWeight: 'bold' };
                return null;
            }
        },
        {
            headerName: "Created Date", headerClass: 'agheader',
            field: "CreatedDate", filter: true, floatingFilter: true,
            valueGetter: (params) => {
                const date = params.data.CreatedDate;
                if (!date) return '-';
                const d = new Date(date);
                return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')} ${String(d.getUTCHours()).padStart(2, '0')}:${String(d.getUTCMinutes()).padStart(2, '00')}:${String(d.getUTCSeconds()).padStart(2, '0')}`;
            },
        },
        { headerName: "Created By", field: "CreatedBy", filter: true, headerClass: 'agheader', floatingFilter: true },
        {
            headerName: "View", pinned: 'right', field: "View", headerClass: 'agheader',
            cellRenderer: ViewRenderer, width: 80, filter: false, floatingFilter: false
        },
        {
            headerName: 'Edit', pinned: 'right', field: "Edit", headerClass: 'agheader',
            cellRenderer: EditRenderer, width: 80, filter: false, floatingFilter: false
        },
        {
            headerName: "Delete", pinned: 'right', field: "Delete", headerClass: 'agheader',
            cellRenderer: DeleteRenderer, width: 90, filter: false, floatingFilter: false
        },
    ], [ViewRenderer, EditRenderer, DeleteRenderer]);

    const autoGroupColumnDef = useMemo(() => ({
        headerCheckboxSelection: true,
        field: "id", flex: 1, minWidth: 240,
        cellRendererParams: { checkbox: true },
    }), []);

    // ======================== USE EFFECT ========================
    useEffect(() => {
        fetchData();
        const interval = setInterval(() => { fetchData(); }, 60000);
        return () => clearInterval(interval);
    }, [fetchData]);

    // ======================== VALIDATION ========================
    const validateFields = () => {
        const fieldsToCheck = [
            { key: 'SupplierCode', message: 'Please Enter Supplier Code' },
            { key: 'SupplierName', message: 'Please Enter Supplier Name' },
            { key: 'ContactPerson', message: 'Please Enter Contact Person' },
            { key: 'ContactNumber', message: 'Please Enter Contact Number' },
            { key: 'Email', message: 'Please Enter Email' },
            { key: 'Address', message: 'Please Enter Address' },
            { key: 'City', message: 'Please Enter City' },
            { key: 'State', message: 'Please Enter State' },
            { key: 'Country', message: 'Please Enter Country' },
            { key: 'Pincode', message: 'Please Enter Pincode' },
            { key: 'GSTNumber', message: 'Please Enter GST Number' },
        ];
        for (const field of fieldsToCheck) {
            if (!Supplier[field.key] || Supplier[field.key].toString().trim() === '') {
                Swal.fire({ title: field.message, icon: 'warning', confirmButtonText: 'OK' });
                return false;
            }
        }
        return true;
    };

    // ======================== SUBMIT INSERT ========================
    const handleSubmit = async () => {
        if (!validateFields()) return;

        const regCode = Supplier.SupplierCode?.trim().toLowerCase() ?? '';
        const isDuplicate = rowData.some((item) => (item.SupplierCode?.trim().toLowerCase() ?? '') === regCode);

        if (isDuplicate) {
            Swal.fire({
                title: 'Duplicate',
                text: 'This Supplier Code already exists.',
                icon: 'warning',
                confirmButtonText: 'OK'
            });
            return;
        }

        setLoading(true);
        try {
            const alldata = {
                ...Supplier,
                CreatedBy: auth.employeename,
                branchid: auth.branchid,
                mode: 'I'
            };
            const response = await axios.post(`${API_URL}/SupplierConfig`, alldata);
            const result = response.data?.[0];
            if (result?.StatusCode === 0) {
                Swal.fire({ title: result.Message, icon: 'warning' });
                return;
            }
            closeModal('exampleModalAdd');
            handleClear();
            await fetchData();
            Swal.fire({
                title: 'Saved Successfully',
                text: 'Supplier has been added.',
                icon: 'success',
                confirmButtonText: 'Done'
            });
        } catch (err) {
            console.error('Insert error:', err);
            Swal.fire({
                title: 'Error',
                text: 'Failed to save. Please try again.',
                icon: 'error'
            });
        } finally {
            setLoading(false);
        }
    };

    // ======================== UPDATE ========================
    const handleUpdate = async () => {
        if (!validateFields()) return;

        setLoading(true);
        try {
            const alldata = {
                ...Supplier,
                CreatedBy: auth.employeename,
                mode: 'U'
            };
            const response = await axios.post(`${API_URL}/SupplierConfig`, alldata);
            const result = response.data?.[0];
            if (result?.StatusCode === 0) {
                Swal.fire({ title: result.Message, icon: 'warning' });
                return;
            }
            closeModal('exampleModalEdit');
            handleClear();
            await fetchData();
            Swal.fire({
                title: 'Updated Successfully',
                text: 'Supplier has been updated.',
                icon: 'success',
                confirmButtonText: 'Done'
            });
        } catch (err) {
            console.error('Update error:', err);
            Swal.fire({
                title: 'Error',
                text: 'Failed to update. Please try again.',
                icon: 'error'
            });
        } finally {
            setLoading(false);
        }
    };

    // ======================== INPUT HANDLERS ========================
    const handleSupplierChange = (e) => {
        const { name, value } = e.target;
        setSupplier(prev => ({ ...prev, [name]: value }));
    };

    const handleMobileChange = (e) => {
        const value = e.target.value;
        const name = e.target.name;
        if (/^\d*$/.test(value)) {
            setSupplier(prev => ({ ...prev, [name]: value }));
            if (value.length === 10) setMobileMessage('Mobile number is valid.');
            else if (value.length === 0) setMobileMessage('');
            else setMobileMessage('Mobile number must be exactly 10 digits.');
        } else {
            setMobileMessage('Only digits are allowed.');
        }
    };

    const handleEmailChange = (e) => {
        const value = e.target.value;
        setSupplier(prev => ({ ...prev, Email: value }));
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (emailRegex.test(value)) setEmailMessage("Email address is valid.");
        else if (value.length === 0) setEmailMessage('');
        else setEmailMessage("Invalid email address.");
    };

    const handleGSTChange = (e) => {
        const value = e.target.value.toUpperCase();
        setSupplier(prev => ({ ...prev, GSTNumber: value }));
    };

    // ======================== PDF DOWNLOAD ========================
    const generatePDF = async () => {
        setLoading(true);
        try {
            const filteredData = gridRef.current.api.getModel().rowsToDisplay.map(rowNode => ({
                ...rowNode.data,
                CreatedDate: formatDate(rowNode.data.CreatedDate),
            }));
            const doc = new jsPDF({ format: 'a3', orientation: 'landscape' });
            const title = 'Supplier Master';
            const currentUser = auth.employeename || 'Unknown User';
            const currentDateTime = new Date().toLocaleString();
            const pageWidth = doc.internal.pageSize.width;

            doc.setFontSize(14);
            doc.setFont("helvetica", "bold");
            doc.text(title, pageWidth / 2, 15, { align: 'center' });

            if (filteredData.length > 0) {
                const columnMapping = [
                    { header: "Supplier Code", key: "SupplierCode" },
                    { header: "Supplier Name", key: "SupplierName" },
                    { header: "Contact Person", key: "ContactPerson" },
                    { header: "Contact Number", key: "ContactNumber" },
                    { header: "Email", key: "Email" },
                    { header: "Address", key: "Address" },
                    { header: "City", key: "City" },
                    { header: "State", key: "State" },
                    { header: "Country", key: "Country" },
                    { header: "Pincode", key: "Pincode" },
                    { header: "GST Number", key: "GSTNumber" },
                    { header: "PAN Number", key: "PANNumber" },
                    { header: "Payment Terms", key: "PaymentTerms" },
                    { header: "Bank Name", key: "BankName" },
                    { header: "Account Number", key: "AccountNumber" },
                    { header: "IFSC Code", key: "IFSCCode" },
                    { header: "Status", key: "Status" },
                    { header: "Created Date", key: "CreatedDate" },
                    { header: "Created By", key: "CreatedBy" },
                ];
                const columnHeaders = columnMapping.map(col => col.header);
                const data = filteredData.map(obj =>
                    columnMapping.map(col => obj[col.key] || '')
                );
                doc.autoTable({
                    head: [columnHeaders],
                    body: data,
                    margin: { top: 30, right: 10, left: 10, bottom: 20 },
                    theme: 'grid',
                    styles: {
                        fontSize: 7, halign: "center", valign: "middle",
                        overflow: 'linebreak', lineColor: [0, 0, 0], lineWidth: 0.1,
                    },
                    headStyles: {
                        fillColor: [63, 119, 210], textColor: [255, 255, 255],
                        lineColor: [0, 0, 0], lineWidth: 0.1, fontStyle: 'bold'
                    },
                    bodyStyles: {
                        fillColor: [245, 245, 245], textColor: [0, 0, 0],
                        lineColor: [0, 0, 0], lineWidth: 0.1,
                    },
                    didDrawPage: (data) => {
                        const pw = doc.internal.pageSize.width;
                        const ph = doc.internal.pageSize.height;
                        doc.setFontSize(10);
                        doc.text(`User: ${currentUser}`, pw - 10, 12, { align: 'right' });
                        doc.text(`Date: ${currentDateTime}`, pw - 10, 18, { align: 'right' });
                        doc.setFontSize(14);
                        doc.setFont("helvetica", "bold");
                        doc.text(title, pw / 2, 15, { align: 'center' });
                        doc.setFontSize(10);
                        doc.text(`Page ${data.pageNumber}`, pw / 2, ph - 10, { align: 'center' });
                        doc.setFontSize(8);
                        doc.text(
                            `Printed By: ${currentUser} | Printed On: ${new Date().toLocaleDateString()} | Time: ${new Date().toLocaleTimeString()}`,
                            pw / 2, ph - 15, { align: 'center' }
                        );
                        doc.text(
                            `Note: This document has been generated electronically and is valid without signature.`,
                            pw / 2, ph - 8, { align: 'center' }
                        );
                    }
                });
                doc.save('Supplier_Master.pdf');
            } else {
                Swal.fire({ title: 'No data available to export', icon: 'warning' });
            }
        } catch (error) {
            console.error("Error generating PDF:", error);
            Swal.fire({ title: 'Failed to generate PDF', icon: 'error' });
        } finally {
            setLoading(false);
        }
    };

    // ======================== EXCEL DOWNLOAD ========================
    const downloadExcel = async () => {
        const columnDefs = [
            { header: "Supplier Code", key: "SupplierCode" },
            { header: "Supplier Name", key: "SupplierName" },
            { header: "Contact Person", key: "ContactPerson" },
            { header: "Contact Number", key: "ContactNumber" },
            { header: "Email", key: "Email" },
            { header: "Address", key: "Address" },
            { header: "City", key: "City" },
            { header: "State", key: "State" },
            { header: "Country", key: "Country" },
            { header: "Pincode", key: "Pincode" },
            { header: "GST Number", key: "GSTNumber" },
            { header: "PAN Number", key: "PANNumber" },
            { header: "Payment Terms", key: "PaymentTerms" },
            { header: "Bank Name", key: "BankName" },
            { header: "Account Number", key: "AccountNumber" },
            { header: "IFSC Code", key: "IFSCCode" },
            { header: "Status", key: "Status" },
            { header: "Created Date", key: "CreatedDate" },
            { header: "Created By", key: "CreatedBy" },
        ];

        const rowExportData = [];
        gridRef.current.api.forEachNodeAfterFilterAndSort((node) =>
            rowExportData.push(node.data)
        );

        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet("Supplier Master");
        sheet.views = [{ showGridLines: false }];

        const formattedDate = new Date().toLocaleDateString("en-IN");

        sheet.mergeCells(1, 1, 1, columnDefs.length);
        const titleCell = sheet.getCell("A1");
        titleCell.value = `SUPPLIER MASTER - ${formattedDate}`;
        titleCell.font = { bold: true, size: 16 };
        titleCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "D9D9D9" } };
        titleCell.border = {
            top: { style: "thin" }, left: { style: "thin" },
            bottom: { style: "thin" }, right: { style: "thin" }
        };
        titleCell.alignment = { vertical: "middle", horizontal: "left" };

        const headerRow = sheet.getRow(2);
        columnDefs.forEach((col, i) => {
            const cell = headerRow.getCell(i + 1);
            cell.value = col.header;
            cell.font = { bold: true };
            cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "D9D9D9" } };
            cell.alignment = { horizontal: "center", vertical: "center" };
            cell.border = {
                top: { style: "thin" }, left: { style: "thin" },
                bottom: { style: "thin" }, right: { style: "thin" }
            };
        });
        headerRow.commit();

        rowExportData.forEach((row) => {
            const rowValues = columnDefs.map((c) => {
                let v = row[c.key];
                if (c.key === "CreatedDate") return formatDate(v) || "-";
                return v ?? "-";
            });
            const dataRow = sheet.addRow(rowValues);
            dataRow.eachCell((cell) => {
                cell.alignment = { horizontal: "center", vertical: "center" };
                cell.border = {
                    top: { style: "thin" }, left: { style: "thin" },
                    bottom: { style: "thin" }, right: { style: "thin" }
                };
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
        saveAs(new Blob([buffer]), "Supplier_Master.xlsx");
    };

    // ======================== SHARED FORM FIELDS ========================
    const renderFormFields = (readOnlyCode = false) => (
        <div className="row g-3">

            <div className="col-12">
                <h6 className="fw-bold text-primary">
                    <i className="fas fa-info-circle me-2"></i> Basic Information
                </h6>
                <hr />
            </div>

            <div className="col-12 col-md-6 col-lg-4">
                <label className="form-label fw-semibold">Supplier Code <span className="text-danger">*</span></label>
                <input type="text" className="form-control" name="SupplierCode"
                    value={Supplier.SupplierCode} onChange={handleSupplierChange}
                    placeholder="Enter Supplier Code" readOnly={readOnlyCode}
                />
            </div>

            <div className="col-12 col-md-6 col-lg-4">
                <label className="form-label fw-semibold">Supplier Name <span className="text-danger">*</span></label>
                <input type="text" className="form-control" name="SupplierName"
                    value={Supplier.SupplierName} onChange={handleSupplierChange}
                    placeholder="Enter Supplier Name"
                />
            </div>

            <div className="col-12 col-md-6 col-lg-4">
                <label className="form-label fw-semibold">Contact Person <span className="text-danger">*</span></label>
                <input type="text" className="form-control" name="ContactPerson"
                    value={Supplier.ContactPerson} onChange={handleSupplierChange}
                    placeholder="Enter Contact Person"
                />
            </div>

            <div className="col-12 col-md-6 col-lg-4">
                <label className="form-label fw-semibold">Contact Number <span className="text-danger">*</span></label>
                <input type="text" className="form-control" name="ContactNumber"
                    value={Supplier.ContactNumber} onChange={handleMobileChange}
                    maxLength={10} placeholder="Enter 10 Digit Number"
                />
                {mobileMessage && (
                    <small className={mobileMessage.includes('valid') ? 'text-success' : 'text-danger'}>
                        {mobileMessage}
                    </small>
                )}
            </div>

            <div className="col-12 col-md-6 col-lg-4">
                <label className="form-label fw-semibold">Email <span className="text-danger">*</span></label>
                <input type="email" className="form-control" name="Email"
                    value={Supplier.Email} onChange={handleEmailChange}
                    placeholder="Enter Email Address"
                />
                {emailMessage && (
                    <small className={emailMessage.includes('valid') ? 'text-success' : 'text-danger'}>
                        {emailMessage}
                    </small>
                )}
            </div>

            <div className="col-12 col-md-6 col-lg-4">
                <label className="form-label fw-semibold">Status</label>
                <select className="form-select" name="Status"
                    value={Supplier.Status} onChange={handleSupplierChange}
                >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                </select>
            </div>

            <div className="col-12">
                <label className="form-label fw-semibold">Address <span className="text-danger">*</span></label>
                <textarea className="form-control" name="Address" rows="2"
                    value={Supplier.Address} onChange={handleSupplierChange}
                    placeholder="Enter Full Address"
                />
            </div>

            <div className="col-12">
                <h6 className="fw-bold text-primary mt-2">
                    <i className="fas fa-map-marker-alt me-2"></i> Address Details
                </h6>
                <hr />
            </div>

            <div className="col-12 col-md-6 col-lg-3">
                <label className="form-label fw-semibold">City <span className="text-danger">*</span></label>
                <input type="text" className="form-control" name="City"
                    value={Supplier.City} onChange={handleSupplierChange} placeholder="Enter City"
                />
            </div>

            <div className="col-12 col-md-6 col-lg-3">
                <label className="form-label fw-semibold">State <span className="text-danger">*</span></label>
                <input type="text" className="form-control" name="State"
                    value={Supplier.State} onChange={handleSupplierChange} placeholder="Enter State"
                />
            </div>

            <div className="col-12 col-md-6 col-lg-3">
                <label className="form-label fw-semibold">Country <span className="text-danger">*</span></label>
                <input type="text" className="form-control" name="Country"
                    value={Supplier.Country} onChange={handleSupplierChange} placeholder="Enter Country"
                />
            </div>

            <div className="col-12 col-md-6 col-lg-3">
                <label className="form-label fw-semibold">Pincode <span className="text-danger">*</span></label>
                <input type="text" className="form-control" name="Pincode"
                    value={Supplier.Pincode} onChange={handleSupplierChange} placeholder="Enter Pincode"
                />
            </div>

            <div className="col-12">
                <h6 className="fw-bold text-primary mt-2">
                    <i className="fas fa-file-invoice-dollar me-2"></i> Tax Details
                </h6>
                <hr />
            </div>

            <div className="col-12 col-md-6 col-lg-4">
                <label className="form-label fw-semibold">GST Number <span className="text-danger">*</span></label>
                <input type="text" className="form-control" name="GSTNumber"
                    value={Supplier.GSTNumber} onChange={handleGSTChange}
                    placeholder="22AAAAA0000A1Z5" style={{ textTransform: 'uppercase' }}
                />
            </div>

            <div className="col-12 col-md-6 col-lg-4">
                <label className="form-label fw-semibold">PAN Number</label>
                <input type="text" className="form-control" name="PANNumber"
                    value={Supplier.PANNumber} onChange={handleSupplierChange}
                    placeholder="AAAAA0000A" style={{ textTransform: 'uppercase' }}
                />
            </div>

            <div className="col-12 col-md-6 col-lg-4">
                <label className="form-label fw-semibold">Payment Terms</label>
                <select className="form-select" name="PaymentTerms"
                    value={Supplier.PaymentTerms} onChange={handleSupplierChange}
                >
                    <option value="">-- Select --</option>
                    <option value="Immediate">Immediate</option>
                    <option value="15 Days">15 Days</option>
                    <option value="30 Days">30 Days</option>
                    <option value="45 Days">45 Days</option>
                    <option value="60 Days">60 Days</option>
                    <option value="90 Days">90 Days</option>
                </select>
            </div>

            <div className="col-12">
                <h6 className="fw-bold text-primary mt-2">
                    <i className="fas fa-university me-2"></i> Bank Details
                </h6>
                <hr />
            </div>

            <div className="col-12 col-md-6 col-lg-4">
                <label className="form-label fw-semibold">Bank Name</label>
                <input type="text" className="form-control" name="BankName"
                    value={Supplier.BankName} onChange={handleSupplierChange}
                    placeholder="Enter Bank Name"
                />
            </div>

            <div className="col-12 col-md-6 col-lg-4">
                <label className="form-label fw-semibold">Account Number</label>
                <input type="text" className="form-control" name="AccountNumber"
                    value={Supplier.AccountNumber} onChange={handleSupplierChange}
                    placeholder="Enter Account Number"
                />
            </div>

            <div className="col-12 col-md-6 col-lg-4">
                <label className="form-label fw-semibold">IFSC Code</label>
                <input type="text" className="form-control" name="IFSCCode"
                    value={Supplier.IFSCCode} onChange={handleSupplierChange}
                    placeholder="SBIN0001234" style={{ textTransform: 'uppercase' }}
                />
            </div>

            <div className="col-12">
                <label className="form-label fw-semibold">Remark</label>
                <textarea className="form-control" name="Remark" rows="2"
                    value={Supplier.Remark} onChange={handleSupplierChange}
                    placeholder="Enter any remarks..."
                />
            </div>
        </div>
    );

    // ======================== RETURN JSX ========================
    return (
        <>
            {loading && (
                <div className="loading-overlay">
                    <div className="loading-spinner">
                        <BallTriangle height={100} width={100} radius={5} color="#4fa94d"
                            ariaLabel="ball-triangle-loading" wrapperStyle={{ justifyContent: 'center' }} />
                    </div>
                </div>
            )}

            <div className="card">
                <div className='card-header d-flex justify-content-between align-items-center p-3'
                    style={{ background: '#106FB2' }}>

                    <h4 className="mb-0 text-white d-flex align-items-center gap-2 mt-2">
                        <i className="fas fa-truck me-2 "></i>
                      Supplier Master
                    </h4>
                    <button className="btn-close btn-close-white"
                        onClick={() => navigate("/Settings/Configure")}></button>
                </div>
                <div className="d-flex justify-content-end mt-3 gap-2 px-3 px-4">
                    {canAdd && (
                        <button type="button" className="btn d-flex align-items-center gap-2"
                            onClick={handleClear}
                            data-bs-toggle="modal" data-bs-target="#exampleModalAdd"
                            style={{
                                background: 'linear-gradient(135deg, #00c853, #009624)',
                                color: '#fff', border: 'none', borderRadius: '12px',
                                fontWeight: 600, padding: '10px 18px',
                                transition: 'all 0.3s ease'
                            }}
                        >
                            <CIcon icon={cilPlus} /> Add Supplier
                        </button>
                    )}

                    <button type="button" className="btn d-flex align-items-center gap-2"
                        data-bs-toggle="modal" data-bs-target="#exampleModal"
                        style={{
                            background: 'linear-gradient(135deg, #ff4b2b, #ff0000)',
                            color: '#fff', border: 'none', borderRadius: '12px',
                            fontWeight: 600, padding: '10px 18px',
                            transition: 'all 0.3s ease'
                        }}
                    >
                        <i className="bi bi-cloud-download"></i> Export
                    </button>
                </div>

                <div className="card border-0 shadow-sm">
                    <div className="card-body py-3 px-3 px-md-4">
                        <div className="ag-theme-quartz mt-2" style={{ height: "450px", width: "100%" }}>
                            <AgGridReact
                                ref={gridRef}
                                rowData={rowData}
                                columnDefs={columdef}
                                defaultColDef={{ sortable: true, filter: true, resizable: true }}
                                autoGroupColumnDef={autoGroupColumnDef}
                                pagination={pagination}
                                paginationPageSize={paginationPageSize}
                                paginationPageSizeSelector={paginationPageSizeSelector}
                                rowSelection="multiple"
                                suppressRowClickSelection={true}
                                animateRows={true}
                                getRowHeight={() => 55}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* ==================== EXPORT MODAL ==================== */}
            <div className="modal fade" id="exampleModal" tabIndex="-1" aria-hidden="true">
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content">
                        <div className="modal-header p-2" style={{ background: '#3f77d2' }}>
                            <h5 className="modal-title text-white fw-bold">Download Format</h5>
                            <button type="button" className="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                        </div>
                        <div className="modal-body">
                            <div className="d-flex justify-content-evenly">
                                <div className="btn btn-success" onClick={downloadExcel}>
                                    <i className="bi bi-file-earmark-spreadsheet fs-1"></i>
                                </div>
                                <div className="btn btn-danger" onClick={generatePDF}>
                                    <i className="bi bi-filetype-pdf fs-1"></i>
                                </div>
                            </div>
                            <div className="d-flex justify-content-evenly mt-2">
                                <span className="text-muted">Download Excel</span>
                                <span className="text-muted">Download PDF</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ==================== ADD MODAL ==================== */}
            <div className="modal fade" id="exampleModalAdd" tabIndex="-1" aria-hidden="true"
                data-bs-backdrop="static" data-bs-keyboard="false">
                <div className="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
                    <div className="modal-content" style={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 40px rgba(0,0,0,0.15)' }}>
                        <div className="modal-header p-3" style={{ background: '#3f77d2', borderRadius: '16px 16px 0 0' }}>
                            <h5 className="modal-title text-white fw-bold">
                                <i className="fas fa-plus-circle me-2"></i> Add Supplier
                            </h5>
                            <button type="button" className="btn-close btn-close-white"
                                data-bs-dismiss="modal" onClick={handleClear}></button>
                        </div>
                        <div className="modal-body p-3 p-md-4">
                            {renderFormFields(false)}
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary d-flex align-items-center gap-2"
                                data-bs-dismiss="modal" onClick={handleClear}
                                style={{ borderRadius: '10px', padding: '9px 18px' }}
                            >
                                <i className="fas fa-times"></i> Cancel
                            </button>
                            <button type="button"
                                className="btn text-white fw-semibold d-flex align-items-center gap-2"
                                onClick={handleSubmit} disabled={loading}
                                style={{
                                    background: 'linear-gradient(135deg, #00c853, #009624)',
                                    border: 'none', borderRadius: '10px', padding: '9px 22px',
                                    cursor: loading ? 'not-allowed' : 'pointer'
                                }}
                            >
                                {loading
                                    ? <><span className="spinner-border spinner-border-sm me-1"></span> Saving...</>
                                    : <><i className="fas fa-save"></i> Save</>
                                }
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* ==================== VIEW MODAL ==================== */}
            <div className="modal fade" id="exampleModalView" tabIndex="-1" aria-hidden="true">
                <div className="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
                    <div className="modal-content" style={{ borderRadius: '16px', border: 'none' }}>
                        <div className="modal-header p-3"
                            style={{ background: 'linear-gradient(135deg, #28a745, #5cb85c)', borderRadius: '16px 16px 0 0' }}>
                            <h5 className="modal-title text-white fw-bold">
                                <i className="fas fa-eye me-2"></i> View Supplier Details
                            </h5>
                            <button type="button" className="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                        </div>
                        <div className="modal-body p-3 p-md-4">
                            <div className="row g-3">
                                <div className="col-12"><h6 className="fw-bold text-primary"><i className="fas fa-info-circle me-2"></i> Basic Information</h6><hr /></div>
                                <div className="col-12 col-md-6 col-lg-4"><label className="form-label text-muted">Supplier Code</label><p className="fw-semibold">{Supplier.SupplierCode || '-'}</p></div>
                                <div className="col-12 col-md-6 col-lg-4"><label className="form-label text-muted">Supplier Name</label><p className="fw-semibold">{Supplier.SupplierName || '-'}</p></div>
                                <div className="col-12 col-md-6 col-lg-4"><label className="form-label text-muted">Status</label><p><span className={`badge ${Supplier.Status === 'Active' ? 'bg-success' : 'bg-danger'}`}>{Supplier.Status || '-'}</span></p></div>
                                <div className="col-12 col-md-6 col-lg-4"><label className="form-label text-muted">Contact Person</label><p className="fw-semibold">{Supplier.ContactPerson || '-'}</p></div>
                                <div className="col-12 col-md-6 col-lg-4"><label className="form-label text-muted">Contact Number</label><p className="fw-semibold">{Supplier.ContactNumber || '-'}</p></div>
                                <div className="col-12 col-md-6 col-lg-4"><label className="form-label text-muted">Email</label><p className="fw-semibold text-break">{Supplier.Email || '-'}</p></div>

                                <div className="col-12"><h6 className="fw-bold text-primary mt-2"><i className="fas fa-map-marker-alt me-2"></i> Address Details</h6><hr /></div>
                                <div className="col-12"><label className="form-label text-muted">Address</label><p className="fw-semibold">{Supplier.Address || '-'}</p></div>
                                <div className="col-12 col-md-6 col-lg-3"><label className="form-label text-muted">City</label><p className="fw-semibold">{Supplier.City || '-'}</p></div>
                                <div className="col-12 col-md-6 col-lg-3"><label className="form-label text-muted">State</label><p className="fw-semibold">{Supplier.State || '-'}</p></div>
                                <div className="col-12 col-md-6 col-lg-3"><label className="form-label text-muted">Country</label><p className="fw-semibold">{Supplier.Country || '-'}</p></div>
                                <div className="col-12 col-md-6 col-lg-3"><label className="form-label text-muted">Pincode</label><p className="fw-semibold">{Supplier.Pincode || '-'}</p></div>

                                <div className="col-12"><h6 className="fw-bold text-primary mt-2"><i className="fas fa-file-invoice-dollar me-2"></i> Tax Details</h6><hr /></div>
                                <div className="col-12 col-md-6 col-lg-4"><label className="form-label text-muted">GST Number</label><p className="fw-semibold">{Supplier.GSTNumber || '-'}</p></div>
                                <div className="col-12 col-md-6 col-lg-4"><label className="form-label text-muted">PAN Number</label><p className="fw-semibold">{Supplier.PANNumber || '-'}</p></div>
                                <div className="col-12 col-md-6 col-lg-4"><label className="form-label text-muted">Payment Terms</label><p className="fw-semibold">{Supplier.PaymentTerms || '-'}</p></div>

                                <div className="col-12"><h6 className="fw-bold text-primary mt-2"><i className="fas fa-university me-2"></i> Bank Details</h6><hr /></div>
                                <div className="col-12 col-md-6 col-lg-4"><label className="form-label text-muted">Bank Name</label><p className="fw-semibold">{Supplier.BankName || '-'}</p></div>
                                <div className="col-12 col-md-6 col-lg-4"><label className="form-label text-muted">Account Number</label><p className="fw-semibold">{Supplier.AccountNumber || '-'}</p></div>
                                <div className="col-12 col-md-6 col-lg-4"><label className="form-label text-muted">IFSC Code</label><p className="fw-semibold">{Supplier.IFSCCode || '-'}</p></div>

                                <div className="col-12"><h6 className="fw-bold text-primary mt-2"><i className="fas fa-history me-2"></i> Other Information</h6><hr /></div>
                                <div className="col-12"><label className="form-label text-muted">Remark</label><p className="fw-semibold">{Supplier.Remark || '-'}</p></div>
                                <div className="col-12 col-md-6 col-lg-4"><label className="form-label text-muted">Created By</label><p className="fw-semibold">{Supplier.CreatedBy || '-'}</p></div>
                                <div className="col-12 col-md-6 col-lg-4"><label className="form-label text-muted">Created Date</label><p className="fw-semibold">{formatDate(Supplier.CreatedDate) || '-'}</p></div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary"
                                data-bs-dismiss="modal" style={{ borderRadius: '10px' }}>
                                <i className="fas fa-times me-1"></i> Close
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* ==================== EDIT MODAL ==================== */}
            <div className="modal fade" id="exampleModalEdit" tabIndex="-1" aria-hidden="true"
                data-bs-backdrop="static" data-bs-keyboard="false">
                <div className="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
                    <div className="modal-content" style={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 40px rgba(0,0,0,0.15)' }}>
                        <div className="modal-header p-3" style={{ background: '#3f77d2', borderRadius: '16px 16px 0 0' }}>
                            <h5 className="modal-title text-white fw-bold">
                                <i className="fas fa-edit me-2"></i> Edit Supplier
                            </h5>
                            <button type="button" className="btn-close btn-close-white"
                                data-bs-dismiss="modal" onClick={handleClear}></button>
                        </div>
                        <div className="modal-body p-3 p-md-4">
                            {renderFormFields(true)}
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary d-flex align-items-center gap-2"
                                data-bs-dismiss="modal" onClick={handleClear}
                                style={{ borderRadius: '10px', padding: '9px 18px' }}
                            >
                                <i className="fas fa-times"></i> Cancel
                            </button>
                            <button type="button"
                                className="btn text-white fw-semibold d-flex align-items-center gap-2"
                                onClick={handleUpdate} disabled={loading}
                                style={{
                                    background: 'linear-gradient(135deg, #00c853, #009624)',
                                    border: 'none', borderRadius: '10px', padding: '9px 22px',
                                    cursor: loading ? 'not-allowed' : 'pointer'
                                }}
                            >
                                {loading
                                    ? <><span className="spinner-border spinner-border-sm me-1"></span> Updating...</>
                                    : <><i className="fas fa-save"></i> Update</>
                                }
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default SupplierMaster;