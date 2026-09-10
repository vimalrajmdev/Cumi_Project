import React, { useMemo, useState, useEffect, useRef } from 'react'
import { AgGridReact } from 'ag-grid-react';
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import axios from 'axios';
import Swal from 'sweetalert2';
import swal from 'sweetalert';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import PropTypes from 'prop-types';
import { BallTriangle } from 'react-loader-spinner';
import { useLocation, useNavigate } from "react-router-dom";
import { CButton } from '@coreui/react';
import logo from '../../assets/images/Cumi_logofull-Nobg.png';
import { FaEdit, FaEye, FaUsers } from 'react-icons/fa';
import { getConfig } from 'src/config';
import CIcon from '@coreui/icons-react';
import { cilCloudDownload, cilPlus, cilTrash, cilX } from '@coreui/icons';

const MouldPartMaster = ({ auth }) => {
    const API_URL = getConfig().REACT_APP_API_URL;
    const navigate = useNavigate();
    const location = useLocation();
    const gridRef = useRef(null);
    const [Uploadvisible, setUploadvisible] = useState(false);
    const [uploadxl, setuploadxl] = useState(null);
    const [loading, setLoading] = useState(false);
    const [rowData, setRowData] = useState([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [locationOptions, setLocationOptions] = useState([]);
    const [mouldTypeOptions, setMouldTypeOptions] = useState([]);

    // =====================
    // PERMISSIONS (from Configure.jsx: state={{ permission, screenId }})
    // =====================
    let permission = location.state?.permission;
    console.log("🚀 ~ MouldPartMaster ~ permission:", auth)
    if (permission) {
        localStorage.setItem('mouldPartMasterPermission', JSON.stringify(permission));
    } else {
        const stored = localStorage.getItem('mouldPartMasterPermission');
        permission = stored ? JSON.parse(stored) : {};
    }

    const canAdd = auth.UserStatus === 'SA' || permission?.AddStatus === 'a';
    const canEdit = auth.UserStatus === 'SA' || permission?.EditStatus === 'a';
    const canDelete = auth.UserStatus === 'SA' || permission?.DeleteStatus === 'a';

    const [Register, setRegister] = useState({
        RFID: '',
        ItemCode: '',
        MetricSize: '',
        MouldTypeId: '',   // ← FK id
        MouldType: '',     // ← display name
        LifecycleCount: '',
        AlertCount: '',
        UtilizedCount: '',
        Location: '',
        Description: ''
    });

    const handleClear = () => {
        setRegister({
            RFID: '',
            ItemCode: '',
            MetricSize: '',
            MouldTypeId: '',
            MouldType: '',
            LifecycleCount: '',
            AlertCount: '',
            UtilizedCount: '',
            Location: '',
            Description: ''
        });
    };

    const handleUploadExcelSheet = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            const ext = selectedFile.name.split('.').pop().toLowerCase();
            if (['csv', 'xls', 'xlsx'].includes(ext)) {
                setuploadxl(selectedFile);
            } else {
                Swal.fire({ title: 'Invalid File Format', text: 'Please select CSV or Excel file.', icon: 'warning' });
                setuploadxl(null);
                e.target.value = null;
            }
        }
    };

    const fetchMouldTypes = async () => {
        try {
            const response = await axios.post(`${API_URL}/MouldTypeMaster`, { mode: 'S' });
            setMouldTypeOptions(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            console.error('Error fetching Mould Types:', error);
        }
    };

    useEffect(() => {
        fetchData();
        fetchMouldTypes();
        axios.post(`${API_URL}/LocationConfig`, { mode: 'FetchLocation' }).then(res => {
            setLocationOptions(res.data);
        });
    }, []);

    const handleUploadData = async () => {
        if (!uploadxl) {
            Swal.fire({ text: 'Please Select Upload File', icon: 'warning' });
            return;
        }

        const result = await Swal.fire({
            title: 'Are you sure?',
            text: 'Once uploaded, data will be imported!',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Upload',
            cancelButtonText: 'Cancel'
        });

        if (!result.isConfirmed) return;

        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('file', uploadxl);
            formData.append('CreatedBy', auth.employeename);
            formData.append('branchid', auth.branchid);

            const response = await axios.post(`${API_URL}/MouldPartUploadData`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            const { uploadcount, unuploadedFilePath } = response.data;

            fetchData();

            if (unuploadedFilePath) {
                swal({
                    title: `Uploaded: ${uploadcount}`,
                    text: 'Some records failed. Download file to see errors.',
                    icon: 'warning',
                    buttons: { cancel: 'OK', download: { text: 'Download File', value: 'download' } }
                }).then((value) => {
                    if (value === 'download') {
                        const link = document.createElement('a');
                        link.href = `${API_URL}${unuploadedFilePath}`;
                        link.setAttribute('download', 'unuploaded_MouldPart_data.xlsx');
                        document.body.appendChild(link);
                        link.click();
                        link.parentNode.removeChild(link);
                    }
                });
            } else {
                Swal.fire({ title: `Uploaded: ${uploadcount}`, text: 'All data uploaded successfully', icon: 'success' });
            }
        } catch (err) {
            console.error(err);
            Swal.fire({ title: 'Please Upload Valid File', icon: 'error' });
        } finally {
            setUploadvisible(false);
            setuploadxl(null);
            setLoading(false);
        }
    };

    // =====================
    // FETCH ALL (branch-scoped)
    // =====================
    const fetchData = async () => {
        setLoading(true);
        try {
            const response = await axios.post(`${API_URL}/MouldPartMaster`, {
                mode: 'A',
                branchid: auth.branchid,
                BranchAccess: auth.UserStatus === 'SA' ? null : auth.BranchAccess
            });
            setRowData(response.data);
        } catch (error) {
            console.error('Error fetching mould part:', error);
        } finally {
            setLoading(false);
        }
    };

    // =====================
    // INSERT
    // =====================
    const handlecheck = async () => {
        if (!Register.RFID || !Register.ItemCode) {
            Swal.fire({ title: 'Please enter RFID and Item Code', icon: 'warning' });
            return;
        }

        try {
            const alldata = {
                ...Register,
                MouldType: Register.MouldTypeId,   // ← send ID to SP
                CreatedBy: auth.employeename,
                branchid: auth.branchid,
                mode: 'I'
            };
            const response = await axios.post(`${API_URL}/MouldPartMaster`, alldata);
            if (response.status === 200) {
                const result = response.data[0];
                if (result?.StatusCode === 0) {
                    Swal.fire({ title: result.Message, icon: 'warning' });
                    return;
                }
                Swal.fire({ title: 'Saved Successfully', icon: 'success', confirmButtonText: 'Done' })
                    .then(() => {
                        setIsModalVisible(false);
                        handleClear();
                        fetchData();
                    });
            }
        } catch (err) {
            console.error(err);
            Swal.fire({ title: 'Error', text: 'Unable to save mould part details', icon: 'error' });
        }
    };

    // =====================
    // LOAD FOR EDIT
    // =====================
    const handleEdit = (data) => {
        setRegister({
            MP_ID: data.MP_ID,
            RFID: data.RFID,
            ItemCode: data.ItemCode,
            MetricSize: data.MetricSize,
            MouldTypeId: data.MouldType,     // ← INT id from DB
            MouldType: data.MouldTypeName,   // ← name from JOIN
            LifecycleCount: data.LifeCount,
            AlertCount: data.AlertCount,
            UtilizedCount: data.UtilizedCount,
            Location: data.Location,
            Description: data.Description
        });
    };

    // =====================
    // UPDATE
    // =====================
    const handlechange = async () => {
        try {
            const alldata = {
                ...Register,
                MouldType: Register.MouldTypeId,   // ← send ID to SP
                UpdatedBy: auth.employeename,
                mode: 'U'
            };
            const response = await axios.post(`${API_URL}/MouldPartMaster`, alldata);
            if (response.status === 200) {
                const result = response.data[0];
                if (result?.StatusCode === 0) {
                    Swal.fire({ title: result.Message, icon: 'warning' });
                    return;
                }
                Swal.fire({ title: 'Updated Successfully', icon: 'success', confirmButtonText: 'Done' })
                    .then(() => {
                        handleClear();
                        fetchData();
                    });
            }
        } catch (err) {
            console.error(err);
            Swal.fire({ title: 'Error', text: 'Unable to update mould part details', icon: 'error' });
        }
    };

    // =====================
    // DELETE
    // =====================
    const handleDelete = async (data) => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: 'Once deleted, you will not be able to recover the data!',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Delete',
            cancelButtonText: 'Cancel'
        });
        if (!result.isConfirmed) return;

        setLoading(true);
        try {
            const alldata = { MP_ID: data.MP_ID, UpdatedBy: auth.employeename, mode: 'D' };
            const response = await axios.post(`${API_URL}/MouldPartMaster`, alldata);
            if (response.status === 200) {
                Swal.fire({ title: 'Deleted Successfully', icon: 'success', confirmButtonText: 'Done' });
                fetchData();
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    // =====================
    // EXPORT
    // =====================
    const formatDate = (date) => {
        if (!date) return '';
        return new Date(date).toISOString().split('T')[0];
    };

    const generatePDF = () => {
        setLoading(true);
        try {
            const filteredData = gridRef.current.api.getModel().rowsToDisplay
                .map(r => ({ ...r.data, CreatedDate: formatDate(r.data.CreatedDate) }));

            if (!filteredData.length) { alert('No data available'); setLoading(false); return; }

            const doc = new jsPDF({ format: 'a3', orientation: 'landscape' });
            const pageWidth = doc.internal.pageSize.width;

            const columnMapping = [
                { header: 'RFID', key: 'RFID' },
                { header: 'Item Code', key: 'ItemCode' },
                { header: 'Metric Size', key: 'MetricSize' },
                { header: 'Mould Type', key: 'MouldTypeName' },
                { header: 'Lifecycle Count', key: 'LifeCount' },
                { header: 'Alert Count', key: 'AlertCount' },
                { header: 'Utilized Count', key: 'UtilizedCount' },
                { header: 'Location', key: 'Location' },
                { header: 'Description', key: 'Description' },
                { header: 'Created Date', key: 'CreatedDate' }
            ];

            doc.autoTable({
                head: [columnMapping.map(c => c.header)],
                body: filteredData.map(row => columnMapping.map(c => row[c.key] ?? '')),
                margin: { top: 30, right: 10, left: 10, bottom: 20 },
                theme: 'grid',
                styles: { fontSize: 8, halign: 'center', valign: 'middle' },
                headStyles: { fillColor: [63, 119, 210], textColor: [255, 255, 255] },
                didDrawPage: (data) => {
                    doc.addImage(logo, 'PNG', 10, 10, 15, 15);
                    doc.setFontSize(14);
                    doc.text('Mould Part Master', pageWidth / 2, 15, { align: 'center' });
                    doc.setFontSize(10);
                    doc.text(`Page ${data.pageNumber}`, pageWidth / 2, doc.internal.pageSize.height - 10, { align: 'center' });
                }
            });
            doc.save('Mould_Part_Master.pdf');
        } catch (error) {
            console.error(error);
            alert('Failed to generate PDF');
        } finally {
            setLoading(false);
        }
    };

    const onExportClick = () => {
        gridRef.current.api.exportDataAsCsv({
            fileName: 'Mould_Part_Details.csv',
            columnKeys: ['RFID', 'ItemCode', 'MetricSize', 'MouldType', 'LifeCount', 'AlertCount', 'UtilizedCount', 'Location', 'Description', 'CreatedDate']
        });
    };

    // =====================
    // RENDERERS
    // =====================
    const ViewRenderer = (params) => (
        <button className="btn btn-hover-effect" data-bs-toggle="modal" data-bs-target="#exampleModalView"
            onClick={() => setRegister({ ...params.data, LifecycleCount: params.data.LifeCount })}>
            <FaEye className="text-primary cursor-pointer fs-3" title="View" />
        </button>
    );

    // =========================================================
    // EDIT RENDERER
    // =========================================================
    const EditRenderer = (params) => {
        if (!canEdit) return null;

        return (
            <div>
                <button
                    onClick={() => handleEdit(params.data)}
                    className='mt-1 ms-2'
                    style={{
                        background: 'linear-gradient(135deg, #007bff, #00b4d8)',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '50%',
                        padding: '7px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        boxShadow: '0 4px 12px rgba(0, 123, 255, 0.35)',
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
    };

    // =========================================================
    // DELETE RENDERER
    // =========================================================
    const DeleteRenderer = (params) => {
        if (!canDelete) return null;

        return (
            <div>
                <button
                    className='mt-1 ms-1'
                    onClick={() => handleDelete(params.data)}
                    style={{
                        background: 'linear-gradient(135deg, #ff4d4d, #ff1a1a)',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '50%',
                        padding: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        boxShadow: '0 4px 12px rgba(255, 0, 0, 0.35)',
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
    };

    const pagination = true;
    const paginationPageSize = 100;
    const paginationPageSizeSelector = [10, 50, 100];

    const columdef = [
        { headerCheckboxSelection: true, checkboxSelection: true, width: 60 },
        { headerName: 'RFID', field: 'RFID', filter: true, headerClass: 'agheader', floatingFilter: true, flex: 1, minWidth: 130 },
        { headerName: 'Item Code', field: 'ItemCode', filter: true, headerClass: 'agheader', floatingFilter: true, flex: 1, minWidth: 140 },
        { headerName: 'Metric Size', field: 'MetricSize', filter: true, headerClass: 'agheader', floatingFilter: true, flex: 1, minWidth: 140 },
        { headerName: 'Mould Type', field: 'MouldTypeName', filter: true, headerClass: 'agheader', floatingFilter: true, flex: 1, minWidth: 140 },
        { headerName: 'Lifecycle Count', field: 'LifeCount', filter: true, headerClass: 'agheader', floatingFilter: true, flex: 1, minWidth: 160 },
        { headerName: 'Utilized', field: 'UtilizedCount', filter: true, headerClass: 'agheader', floatingFilter: true, flex: 1, minWidth: 110 },
        { headerName: 'Alert At', field: 'AlertCount', filter: true, headerClass: 'agheader', floatingFilter: true, flex: 1, minWidth: 110 },
        {
            headerName: 'Status', field: 'IsAlert', headerClass: 'agheader', flex: 1, minWidth: 140,
            cellRenderer: (params) => params.value
                ? <span className="badge bg-danger">Needs Attention</span>
                : <span className="badge bg-success">OK</span>
        },
        {
            headerName: 'Location', field: 'Location', filter: true,
            headerClass: 'agheader', floatingFilter: true, flex: 1, minWidth: 140,
            valueFormatter: (params) => {
                const loc = locationOptions.find(l => l.LocationID == params.value);
                return loc ? loc.LocationName : params.value;
            }
        },
        { headerName: 'Description', field: 'Description', filter: true, headerClass: 'agheader', floatingFilter: true, flex: 2, minWidth: 180 },
        {
            headerName: 'Created Date', field: 'CreatedDate', filter: true, headerClass: 'agheader', floatingFilter: true, flex: 1, minWidth: 160,
            valueGetter: (params) => {
                const date = params.data?.CreatedDate;
                if (!date) return '-';
                const d = new Date(date);
                return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`;
            }
        },
        { headerName: 'View', field: 'View', headerClass: 'agheader', cellRenderer: ViewRenderer, width: 80, pinned: 'right' },
        { headerName: 'Edit', field: 'Edit', headerClass: 'agheader', cellRenderer: EditRenderer, width: 80, pinned: 'right' },
        { headerName: 'Delete', field: 'Delete', headerClass: 'agheader', cellRenderer: DeleteRenderer, width: 90, pinned: 'right' },
    ];

    const autoGroupColumnDef = useMemo(() => ({
        headerCheckboxSelection: true, field: 'id', flex: 1, minWidth: 240,
        cellRendererParams: { checkbox: true }
    }), []);

    // =====================
    // FORM FIELDS (reused in Add/Edit/View modals)
    // =====================
    const renderFields = (disabled = false) => (
        <div className="row">
            {[
                { label: 'RFID', key: 'RFID' },
                { label: 'Item Code', key: 'ItemCode' },
                { label: 'Metric Size', key: 'MetricSize' },
                { label: 'Lifecycle Count', key: 'LifecycleCount', type: 'number' },
                { label: 'Alert Count', key: 'AlertCount', type: 'number' },
            ].map(({ label, key, type }) => (
                <div className="col-lg-3 col-md-6 col-12 mt-3" key={key}>
                    <label>{label}</label>
                    <input
                        type={type || 'text'}
                        className="form-control"
                        value={Register[key] || ''}
                        disabled={disabled}
                        placeholder={disabled ? '' : `Enter ${label}`}
                        onChange={(e) => !disabled && setRegister({ ...Register, [key]: e.target.value })}
                    />
                </div>
            ))}

            {/* Utilized Count — system-tracked, always read-only */}
            <div className="col-lg-3 col-md-6 col-12 mt-3">
                <label>Utilized Count</label>
                <input
                    type="number"
                    className="form-control"
                    value={Register.UtilizedCount || 0}
                    disabled
                />
            </div>

            {/* Mould Type Dropdown */}
            <div className="col-lg-3 col-md-6 col-12 mt-3">
                <label>Mould Type</label>
                <select
                    className="form-select"
                    value={Register.MouldTypeId || ''}
                    disabled={disabled}
                    onChange={(e) => {
                        const selected = mouldTypeOptions.find(
                            m => m.MouldTypeId === parseInt(e.target.value)
                        );
                        setRegister({
                            ...Register,
                            MouldTypeId: e.target.value,
                            MouldType: selected?.MouldTypeName || ''
                        });
                    }}
                >
                    <option value="">-- Select Mould Type --</option>
                    {mouldTypeOptions.map(m => (
                        <option key={m.MouldTypeId} value={m.MouldTypeId}>
                            {m.MouldTypeName}
                        </option>
                    ))}
                </select>
            </div>

            {/* Location Dropdown */}
            <div className="col-lg-3 col-md-6 col-12 mt-3">
                <label>Location</label>
                <select
                    className="form-select"
                    value={Register.Location || ''}
                    disabled={disabled}
                    onChange={(e) => !disabled && setRegister({ ...Register, Location: e.target.value })}
                >
                    <option value="">-- Select Location --</option>
                    {locationOptions.map((loc) => (
                        <option key={loc.LocationId} value={loc.LocationId}>
                            {loc.LocationName}
                        </option>
                    ))}
                </select>
            </div>

            <div className="col-lg-3 col-md-6 col-12 mt-3">
                <label>Description</label>
                <textarea className="form-control" rows="1"
                    value={Register.Description || ''}
                    disabled={disabled}
                    placeholder={disabled ? '' : 'Enter Description'}
                    onChange={(e) => !disabled && setRegister({ ...Register, Description: e.target.value })}
                />
            </div>
        </div>
    );

    return (
        <>
            {loading && (
                <div className="loading-overlay">
                    <div className="loading-spinner">
                        <BallTriangle height={100} width={100} radius={5} color="#4fa94d" ariaLabel="ball-triangle-loading" visible={true} />
                    </div>
                </div>
            )}

            <div>
                {/* Import Modal */}
                {Uploadvisible && (
                    <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
                        <div className="modal-dialog modal-dialog-centered modal-lg">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title">Import Mould Part Data</h5>
                                    <button type="button" className="btn-close" onClick={() => setUploadvisible(false)}></button>
                                </div>
                                <div className="modal-body">
                                    <label className="form-label">Import Data</label>
                                    <input
                                        type="file"
                                        className="form-control"
                                        accept=".csv, .xls, .xlsx"
                                        onChange={handleUploadExcelSheet}
                                    />
                                    <hr className="mt-2" />
                                    <div className="text-center">
                                        <p>Important ⚠</p>
                                        <span className="text-danger">
                                            Download the template, fill data in the same column format, then upload here.
                                        </span>
                                        <br />
                                        <a href="/MouldPartMasterTemp.xlsx" className="nav-link text-decoration-underline" download>
                                            Click to Download Template
                                        </a>
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button className="btn btn-danger btn-hover-effect" onClick={() => setUploadvisible(false)}>
                                        Cancel
                                    </button>
                                    <button className="btn btn-success btn-hover-effect" onClick={handleUploadData}>
                                        Upload Data
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Export Modal */}
                <div className="modal fade" id="exampleModal" tabIndex="-1" aria-hidden="true">
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h1 className="modal-title fs-5">Download Format</h1>
                                <button type="button" className="btn-close btn-hover-effect" data-bs-dismiss="modal"></button>
                            </div>
                            <div className="modal-body">
                                <div className="d-flex justify-content-evenly">
                                    <div className="btn btn-success btn-hover-effect" onClick={onExportClick}>
                                        <i className="bi bi-file-earmark-spreadsheet fs-1"></i>
                                    </div>
                                    <div className="btn btn-danger btn-hover-effect" onClick={generatePDF}>
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

                {/* View Modal */}
                <div className="modal fade" id="exampleModalView" aria-hidden="true">
                    <div className="modal-dialog modal-xl modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header p-2" style={{ background: '#3f77d2' }}>
                                <h1 className="modal-title fs-5 text-white">View Mould Part Details</h1>
                                <button type="button" className="btn-close btn-close-white me-2" data-bs-dismiss="modal" onClick={handleClear}></button>
                            </div>
                            <div className="modal-body">{renderFields(true)}</div>
                        </div>
                    </div>
                </div>

                {/* Edit Modal */}
                <div className="modal fade" id="exampleModalEdit" data-bs-backdrop="static" aria-hidden="true">
                    <div className="modal-dialog modal-xl modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header p-2" style={{ background: '#3f77d2' }}>
                                <h1 className="modal-title fs-5 text-white">Edit Mould Part Details</h1>
                                <button type="button" className="btn-close btn-close-white me-2" data-bs-dismiss="modal" onClick={handleClear}></button>
                            </div>
                            <div className="modal-body">{renderFields(false)}</div>
                            <div className="modal-footer">
                                <CButton data-bs-dismiss="modal" onClick={handleClear}
                                    style={{ background: 'linear-gradient(135deg, #616161, #616161)', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 600, padding: '10px 18px' }}>
                                    <CIcon icon={cilX} /> Close
                                </CButton>
                                <button type="button" data-bs-dismiss="modal" onClick={handlechange}
                                    style={{
                                        background: 'linear-gradient(135deg, #00c853, #009624)',
                                        color: '#fff',
                                        border: 'none',
                                        borderRadius: '12px',
                                        fontWeight: 600,
                                        padding: '10px 22px',
                                        boxShadow: '0 4px 15px rgba(0, 200, 83, 0.35)',
                                        transition: 'all 0.3s ease',
                                        cursor: 'pointer',
                                    }}>
                                    <i className="bi bi-arrow-repeat"></i> Update
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Add Modal */}
                {isModalVisible && (
                    <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
                        <div className="modal-dialog modal-xl modal-dialog-centered">
                            <div className="modal-content">
                                <div className="modal-header p-2" style={{ background: '#3f77d2' }}>
                                    <h1 className="modal-title fs-5 text-white">Add Mould Part Details</h1>
                                    <button type="button" className="btn-close btn-close-white me-2"
                                        onClick={() => { handleClear(); setIsModalVisible(false); }}></button>
                                </div>
                                <div className="modal-body">{renderFields(false)}</div>
                                <div className="modal-footer">
                                    <CButton onClick={() => { handleClear(); setIsModalVisible(false); }}
                                        style={{ background: 'linear-gradient(135deg, #616161, #616161)', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 600, padding: '10px 18px' }}>
                                        <CIcon icon={cilX} /> Close
                                    </CButton>
                                    <button type="button" onClick={handlecheck}
                                        style={{ background: 'linear-gradient(135deg, #00c853, #009624)', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 600, padding: '10px 22px' }}>
                                        <i className="bi bi-check2-circle"></i> Save
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* ==================== MAIN CARD ==================== */}
                <div className='card'>
                    <div className='card-header d-flex justify-content-between align-items-center p-3 '
                        style={{ background: '#106FB2' }}>
                        <h4 className="mb-0 text-white d-flex align-items-center gap-2">
                            <FaUsers className="fs-4" /> Mould Part Master
                        </h4>
                        <button className="btn-close btn-close-white"
                            onClick={() => navigate("/Settings/Configure")}></button>
                    </div>

                    <div className="d-flex justify-content-end mt-2 gap-2 px-5">
                        {canAdd && (
                            <CButton type="button" color="primary"
                                className="d-flex align-items-center gap-2"
                                onClick={() => setUploadvisible(true)}
                                style={{
                                    background: 'linear-gradient(135deg, #007bff, #00b4d8)',
                                    color: '#fff', border: 'none', borderRadius: '12px',
                                    fontWeight: 600, padding: '10px 18px',
                                    boxShadow: '0 4px 15px rgba(0, 123, 255, 0.35)'
                                }}>
                                <CIcon icon={cilCloudDownload} /> Import
                            </CButton>
                        )}

                        <button className="d-flex align-items-center gap-2"
                            data-bs-toggle="modal" data-bs-target="#exampleModal"
                            style={{
                                background: 'linear-gradient(135deg, #ff4b2b, #ff0000)',
                                color: '#fff', border: 'none', borderRadius: '12px',
                                fontWeight: 600, padding: '10px 18px',
                                boxShadow: '0 4px 15px rgba(255, 0, 0, 0.35)', cursor: 'pointer'
                            }}>
                            <i className="bi bi-cloud-download"></i> Export
                        </button>

                        {canAdd && (
                            <CButton type="button" color="success"
                                className="d-flex align-items-center gap-2"
                                onClick={() => { handleClear(); setIsModalVisible(true); }}
                                style={{
                                    background: 'linear-gradient(135deg, #00c853, #009624)',
                                    color: '#fff', border: 'none', borderRadius: '12px',
                                    fontWeight: 600, padding: '10px 18px',
                                    boxShadow: '0 4px 15px rgba(0, 200, 83, 0.35)'
                                }}>
                                <CIcon icon={cilPlus} /> Add
                            </CButton>
                        )}
                    </div>

                    <div className='card-body py-3 px-5 mb-4'>
                        <div className="ag-theme-quartz mt-2" style={{ height: "450px" }}>
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
        </>
    );
};

MouldPartMaster.propTypes = { auth: PropTypes.any.isRequired };
export default MouldPartMaster;