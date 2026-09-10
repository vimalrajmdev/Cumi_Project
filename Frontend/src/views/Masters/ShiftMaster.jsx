import React, { useState, useMemo, useEffect, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom';
import { AgGridReact } from 'ag-grid-react';
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import axios from 'axios';
import Swal from 'sweetalert2';
import { BallTriangle } from 'react-loader-spinner';
import PropTypes from 'prop-types';
import { FaEdit, FaUsers,FaClock, } from 'react-icons/fa';
import { getConfig } from 'src/config';
import { CButton } from '@coreui/react';
import { cilCloudDownload, cilTrash } from '@coreui/icons';
import CIcon from '@coreui/icons-react';

const ShiftMaster = ({ auth }) => {
    const API_URL = getConfig().REACT_APP_API_URL;
    const [loading, setLoading] = useState(false);
    const [Uploadvisible, setUploadvisible] = useState(false);
    const [uploadxl, setuploadxl] = useState(null);
    const gridRef = useRef(null);
    const navigate = useNavigate();

    // ======================== PAGE DATA ========================
    const location = useLocation();
    let pageData = location.state?.pageData;
    if (!pageData) {
        const storedData = localStorage.getItem('pageData');
        pageData = storedData ? JSON.parse(storedData) : {};
    }

    // ======================== PAGINATION ========================
    const pagination = true;
    const paginationPageSize = 100;
    const paginationPageSizeSelector = [10, 50, 100];

    // ======================== STATE ========================
    const [Register, setRegister] = useState({
        id: '',
        ShiftCode: '',
        ShiftType: '',
        ShiftStartTime: '',
        ShiftEndTime: '',
        CreatedBy: ''
    });

    const [CategoryData, setCategoryData] = useState([]);

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
    const handleClear = () => {
        setRegister({
            id: '',
            ShiftCode: '',
            ShiftType: '',
            ShiftStartTime: '',
            ShiftEndTime: '',
            CreatedBy: ''
        });
    };

    // ======================== FETCH DATA ========================
    const fetchData = async () => {
        setLoading(true);
        try {
            const alldata = {
                mode: 'FetchShift',
                ShiftType: '', ShiftCode: '',
                id: '', CreatedBy: '',
                ShiftStartTime: '', ShiftEndTime: ''
            };
            const response = await axios.post(`${API_URL}/DropdownShiftMaster`, alldata);
            if (response.status === 200) {
                setCategoryData(Array.isArray(response.data) ? response.data : []);
            }
        } catch (error) {
            console.error('Error fetching shift details:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // ======================== VALIDATION ========================
    const validateFields = () => {
        const fieldsToCheck = [
            { key: 'ShiftCode', message: 'Please Enter Shift Code' },
            { key: 'ShiftType', message: 'Please Enter Shift Type' },
            { key: 'ShiftStartTime', message: 'Please Enter Shift Start Time' },
            { key: 'ShiftEndTime', message: 'Please Enter Shift End Time' },
        ];
        for (const field of fieldsToCheck) {
            if (!Register[field.key] || Register[field.key].toString().trim() === '') {
                Swal.fire({ title: field.message, icon: 'warning', confirmButtonText: 'OK' });
                return false;
            }
        }
        return true;
    };

    // ======================== SAVE (INSERT) ========================
    const handleSave = async () => {
        if (!validateFields()) return;

        const isDuplicate = CategoryData.some((item) =>
            item.ShiftCode?.toLowerCase() === Register.ShiftCode?.toLowerCase()
        );

        if (isDuplicate) {
            Swal.fire({
                title: 'Duplicate',
                text: 'This Shift Code already exists.',
                icon: 'warning',
                confirmButtonText: 'OK'
            });
            return;
        }

        setLoading(true);
        try {
            const alldata = { ...Register, mode: 'I', CreatedBy: auth.employeename };
            await axios.post(`${API_URL}/DropdownShiftMaster`, alldata);

            closeModal('exampleModal3');
            handleClear();
            await fetchData();

            Swal.fire({
                title: 'Saved Successfully',
                text: 'Shift has been added.',
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

    // ======================== EDIT FETCH ========================
    const handleEditCategory = async (data) => {
        try {
            const alldata = { ...data, mode: 'E' };
            const response = await axios.post(`${API_URL}/DropdownShiftMaster`, alldata);
            if (response.status === 200 && Array.isArray(response.data) && response.data.length > 0) {
                setRegister(response.data[0]);
            }
        } catch (err) {
            console.error('Edit fetch error:', err);
        }
    };

    // ======================== UPDATE ========================
    const handleEdit = async () => {
        if (!validateFields()) return;

        setLoading(true);
        try {
            const alldata = { ...Register, mode: 'U', CreatedBy: auth.employeename };
            await axios.post(`${API_URL}/DropdownShiftMaster`, alldata);

            closeModal('exampleModalEDIT');
            handleClear();
            await fetchData();

            Swal.fire({
                title: 'Updated Successfully',
                text: 'Shift has been updated.',
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

    // ======================== DELETE ========================
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
            setLoading(true);
            try {
                const alldata = { ...data, mode: 'D' };
                await axios.post(`${API_URL}/DropdownShiftMaster`, alldata);
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
    };

    // ======================== EXPORT CSV ========================
    const downloadExcel = () => {
        const params = {
            fileName: 'ShiftType.csv',
            columnKeys: ['ShiftCode', 'ShiftType', 'ShiftStartTime', 'ShiftEndTime'],
        };
        gridRef.current.api.exportDataAsCsv(params);
    };

    // ======================== IMPORT ========================
    const handleUploadExcelSheet = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            const fileExtension = selectedFile.name.split('.').pop().toLowerCase();
            if (['csv', 'xls', 'xlsx'].includes(fileExtension)) {
                setuploadxl(selectedFile);
            } else {
                Swal.fire({
                    title: 'Invalid File Format',
                    text: 'Please select a valid CSV or Excel file format.',
                    icon: 'warning'
                });
                setuploadxl(null);
                e.target.value = null;
            }
        }
    };

    const handleUploadData = async () => {
        if (!uploadxl) {
            Swal.fire({ text: 'Please Select Upload File', icon: 'warning' });
            return;
        }

        const result = await Swal.fire({
            title: "Are you sure?",
            text: "Once uploaded, you will not be able to check the Shift list immediately!",
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
                const response = await axios.post(`${API_URL}/ShiftUploadData`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });

                const { message, uploadcount, unuploadedFilePath } = response.data;

                if (unuploadedFilePath) {
                    await fetchData();
                    Swal.fire({
                        title: `Total Uploaded Count: ${uploadcount}`,
                        text: `${message}`,
                        icon: 'warning',
                        showCancelButton: true,
                        cancelButtonText: 'OK',
                        confirmButtonText: 'Download File',
                    }).then((result) => {
                        if (result.isConfirmed) {
                            const link = document.createElement('a');
                            link.href = `${API_URL}${unuploadedFilePath}`;
                            link.setAttribute('download', 'unuploaded_Shift_data.xlsx');
                            document.body.appendChild(link);
                            link.click();
                            link.remove();
                        }
                    });
                } else {
                    await fetchData();
                    Swal.fire({
                        title: `Total Uploaded Count: ${uploadcount}`,
                        text: 'All data uploaded successfully',
                        icon: 'success',
                    });
                }
            } catch (err) {
                console.error(err);
                Swal.fire({ title: 'Internal Server Error', icon: 'error' });
            } finally {
                setUploadvisible(false);
                setLoading(false);
            }
        }
    };

    // ======================== RENDERERS ========================
    const EditRenderer = (params) => {
        if ((pageData.editstatus === null || pageData.editstatus === 'i') && auth.UserStatus === 'A') {
            return null;
        }
        return (
            <div>
                <button
                    className='mt-1 ms-2'
                    data-bs-toggle="modal"
                    data-bs-target="#exampleModalEDIT"
                    onClick={() => handleEditCategory(params.data)}
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
    };

    const DeleteRenderer = (params) => {
        if ((pageData.deletestatus === null || pageData.deletestatus === 'i') && auth.UserStatus === 'A') {
            return null;
        }
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
    };

    // ======================== COLUMN DEFINITIONS ========================
    const columndef = [
        { headerCheckboxSelection: true, checkboxSelection: true, headerClass: 'agheader', width: 50 },
        {
            headerName: "Shift Code", field: 'ShiftCode',
            filter: true, floatingFilter: true, headerClass: 'agheader', width: 250
        },
        {
            headerName: "Shift Type", field: 'ShiftType',
            filter: true, floatingFilter: true, headerClass: 'agheader', width: 250
        },
        {
            headerName: "Shift Start Time", field: 'ShiftStartTime',
            filter: true, floatingFilter: true, headerClass: 'agheader', width: 250
        },
        {
            headerName: "Shift End Time", field: 'ShiftEndTime',
            filter: true, floatingFilter: true, headerClass: 'agheader', width: 250
        },
        {
            headerName: "Edit", field: 'Edit',
            cellRenderer: EditRenderer, headerClass: 'agheader',
            width: 100, filter: false, floatingFilter: false
        },
        {
            headerName: "Delete", field: 'Delete',
            cellRenderer: DeleteRenderer, headerClass: 'agheader',
            width: 100, filter: false, floatingFilter: false
        }
    ];

    const autoGroupColumnDef = useMemo(() => {
        return {
            headerCheckboxSelection: true,
            field: "id", flex: 1, minWidth: 240,
            cellRendererParams: { checkbox: true },
        };
    }, []);

    // ======================== RETURN JSX ========================
    return (
        <div className='mt-4'>
            {loading && (
                <div className="loading-overlay">
                    <div className="loading-spinner">
                        <BallTriangle
                            height={100} width={100} radius={5}
                            color="#4fa94d" ariaLabel="ball-triangle-loading"
                            wrapperStyle={{ justifyContent: 'center' }}
                            visible={true}
                        />
                    </div>
                </div>
            )}

            {/* ==================== EXPORT MODAL ==================== */}
            <div className="modal fade" id="exampleModal2" tabIndex="-1" aria-hidden="true" data-bs-backdrop="static">
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content">
                        <div className="modal-header p-2" style={{ background: '#3f77d2' }}>
                            <h1 className="modal-title fs-5 text-white">Download Format</h1>
                            <button type="button" className="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                        </div>
                        <div className="modal-body">
                            <div className="d-flex justify-content-evenly">
                                <div className="btn btn-success" onClick={downloadExcel}>
                                    <i className="bi bi-file-earmark-spreadsheet fs-1"></i>
                                </div>
                            </div>
                            <div className="d-flex justify-content-evenly mt-2">
                                <span className="text-muted">Download Excel Format</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ==================== ADD MODAL ==================== */}
            <div className="modal fade" id="exampleModal3" tabIndex="-1" aria-hidden="true" data-bs-backdrop="static">
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content">
                        <div className="modal-header text-white rounded-top-3 p-2" style={{ background: "#3f77d2" }}>
                            <h5 className="modal-title text-white">Add Shift</h5>
                            <button
                                type="button"
                                className="btn-close btn-close-white"
                                data-bs-dismiss="modal"
                                onClick={handleClear}
                            ></button>
                        </div>
                        <div className="modal-body p-4">
                            <div className='mb-3'>
                                <label className='form-label'>Shift Code <span className="text-danger">*</span></label>
                                <input
                                    className='form-control mt-2'
                                    onChange={(e) => setRegister({ ...Register, ShiftCode: e.target.value })}
                                    value={Register.ShiftCode}
                                    placeholder='Enter Shift Code'
                                />
                            </div>
                            <div className='mb-3'>
                                <label className='form-label'>Shift Type <span className="text-danger">*</span></label>
                                <input
                                    className='form-control mt-2'
                                    onChange={(e) => setRegister({ ...Register, ShiftType: e.target.value })}
                                    value={Register.ShiftType}
                                    placeholder='Enter Shift Type'
                                />
                            </div>
                            <div className='mb-3'>
                                <label className='form-label'>Shift Start Time <span className="text-danger">*</span></label>
                                <input
                                    className='form-control mt-2'
                                    type='time'
                                    step="1"
                                    onChange={(e) => setRegister({ ...Register, ShiftStartTime: e.target.value })}
                                    value={Register.ShiftStartTime}
                                />
                            </div>
                            <div className='mb-3'>
                                <label className='form-label'>Shift End Time <span className="text-danger">*</span></label>
                                <input
                                    className='form-control mt-2'
                                    type='time'
                                    step="1"
                                    onChange={(e) => setRegister({ ...Register, ShiftEndTime: e.target.value })}
                                    value={Register.ShiftEndTime}
                                />
                            </div>
                        </div>
                        <div className="modal-footer justify-content-center">
                            <button
                                type="button"
                                className="btn btn-secondary me-2"
                                data-bs-dismiss="modal"
                                onClick={handleClear}
                                style={{ borderRadius: '10px', padding: '9px 18px' }}
                            >
                                <i className="fas fa-times me-1"></i> Cancel
                            </button>
                            <button
                                type="button"
                                className="btn d-flex align-items-center gap-2"
                                onClick={handleSave}
                                disabled={loading}
                                style={{
                                    background: 'linear-gradient(135deg, #00c853, #009624)',
                                    color: '#fff', border: 'none', borderRadius: '12px',
                                    fontWeight: 600, padding: '10px 22px',
                                    boxShadow: '0 4px 15px rgba(0, 200, 83, 0.35)',
                                    transition: 'all 0.3s ease',
                                    cursor: loading ? 'not-allowed' : 'pointer',
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.background = 'linear-gradient(135deg, #00e676, #00c853)';
                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                    e.currentTarget.style.boxShadow = '0 6px 20px rgba(0, 200, 83, 0.45)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.background = 'linear-gradient(135deg, #00c853, #009624)';
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = '0 4px 15px rgba(0, 200, 83, 0.35)';
                                }}
                            >
                                {loading
                                    ? <><span className="spinner-border spinner-border-sm me-1"></span> Saving...</>
                                    : <><i className="bi bi-check2-circle"></i> Save</>
                                }
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* ==================== EDIT MODAL ==================== */}
            <div className="modal fade" id="exampleModalEDIT" tabIndex="-1" aria-hidden="true" data-bs-backdrop="static">
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content">
                        <div className="modal-header text-white rounded-top-3 p-2" style={{ background: '#3f77d2' }}>
                            <h5 className="modal-title text-white">Edit Shift</h5>
                            <button
                                type="button"
                                className="btn-close btn-close-white"
                                data-bs-dismiss="modal"
                                onClick={handleClear}
                            ></button>
                        </div>
                        <div className="modal-body p-4">
                            <div className='mb-3'>
                                <label className='form-label'>Shift Code <span className="text-danger">*</span></label>
                                <input
                                    className='form-control mt-2'
                                    onChange={(e) => setRegister({ ...Register, ShiftCode: e.target.value })}
                                    value={Register.ShiftCode}
                                    placeholder='Enter Shift Code'
                                    readOnly
                                />
                            </div>
                            <div className='mb-3'>
                                <label className='form-label'>Shift Type <span className="text-danger">*</span></label>
                                <input
                                    className='form-control mt-2'
                                    onChange={(e) => setRegister({ ...Register, ShiftType: e.target.value })}
                                    value={Register.ShiftType}
                                    placeholder='Enter Shift Type'
                                />
                            </div>
                            <div className='mb-3'>
                                <label className='form-label'>Shift Start Time <span className="text-danger">*</span></label>
                                <input
                                    className='form-control mt-2'
                                    type='time'
                                    step="1"
                                    onChange={(e) => setRegister({ ...Register, ShiftStartTime: e.target.value })}
                                    value={Register.ShiftStartTime}
                                />
                            </div>
                            <div className='mb-3'>
                                <label className='form-label'>Shift End Time <span className="text-danger">*</span></label>
                                <input
                                    className='form-control mt-2'
                                    type='time'
                                    step="1"
                                    onChange={(e) => setRegister({ ...Register, ShiftEndTime: e.target.value })}
                                    value={Register.ShiftEndTime}
                                />
                            </div>
                        </div>
                        <div className="modal-footer justify-content-center">
                            <button
                                type="button"
                                className="btn btn-secondary me-2"
                                data-bs-dismiss="modal"
                                onClick={handleClear}
                                style={{ borderRadius: '10px', padding: '9px 18px' }}
                            >
                                <i className="fas fa-times me-1"></i> Cancel
                            </button>
                            <button
                                type="button"
                                className="btn d-flex align-items-center gap-2"
                                onClick={handleEdit}
                                disabled={loading}
                                style={{
                                    background: 'linear-gradient(135deg, #8e2de2, #4a00e0)',
                                    color: '#fff', border: 'none', borderRadius: '12px',
                                    fontWeight: 600, padding: '10px 18px',
                                    boxShadow: '0 4px 15px rgba(142, 45, 226, 0.35)',
                                    transition: 'all 0.3s ease',
                                    cursor: loading ? 'not-allowed' : 'pointer',
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.background = 'linear-gradient(135deg, #a043ff, #5c25ff)';
                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                    e.currentTarget.style.boxShadow = '0 6px 20px rgba(142, 45, 226, 0.45)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.background = 'linear-gradient(135deg, #8e2de2, #4a00e0)';
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = '0 4px 15px rgba(142, 45, 226, 0.35)';
                                }}
                            >
                                {loading
                                    ? <><span className="spinner-border spinner-border-sm me-1"></span> Updating...</>
                                    : <><i className="bi bi-arrow-repeat"></i> Update</>
                                }
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* ==================== IMPORT MODAL ==================== */}
            {Uploadvisible && (
                <div className="modal fade show" style={{ display: 'block' }}>
                    <div className="modal-dialog modal-dialog-centered modal-lg modal-dialog-scrollable">
                        <div className="modal-content card">
                            <div className="modal-header">
                                <h5 className="modal-title">Import Shift Data</h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={() => setUploadvisible(false)}
                                ></button>
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
                                    <span className='text-danger'>
                                        Download the template below, fill in data based on column names, then upload here.
                                    </span>
                                    <div>
                                        <a href="/Shift_Dropdown_MasterTemp.xlsx" className='nav-link text-decoration-underline' download>
                                            Click to Download Template
                                        </a>
                                    </div>
                                </div>
                                <div className="text-center mt-3">
                                    <button
                                        className="btn btn-danger btn-hover-effect mx-2"
                                        onClick={() => setUploadvisible(false)}
                                    >
                                        CANCEL
                                    </button>
                                    <button
                                        className="btn btn-success btn-hover-effect mx-2"
                                        onClick={handleUploadData}
                                    >
                                        Upload Data
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ==================== MAIN CARD ==================== */}
            <div className='card'>
                <div className='card-header d-flex justify-content-between align-items-center p-3'
                    style={{ background: '#106FB2' }}>

                    <h4 className="mb-0 text-white d-flex align-items-center gap-2 ">
                       <FaClock className="fs-4" />
                        Shift Type
                    </h4>
                    <button className="btn-close btn-close-white"
                        onClick={() => navigate("/Settings/Configure")}></button>
                </div>


                <div className="d-flex justify-content-end mt-3 gap-2 px-3 px-4">

                    {/* IMPORT BUTTON */}
                    {!((pageData.addstatus === null || pageData.addstatus === 'i') && auth.UserStatus === 'A') && (
                        <CButton
                            type="button"
                            color="primary"
                            className="btn-hover-effect d-flex align-items-center gap-2"
                            onClick={() => setUploadvisible(true)}
                            style={{
                                background: 'linear-gradient(135deg, #007bff, #00b4d8)',
                                color: '#fff', border: 'none', borderRadius: '12px',
                                fontWeight: 600, padding: '10px 18px',
                                boxShadow: '0 4px 15px rgba(0, 123, 255, 0.35)',
                                transition: 'all 0.3s ease', cursor: 'pointer',
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = 'linear-gradient(135deg, #3399ff, #33ccff)';
                                e.currentTarget.style.transform = 'translateY(-2px)';
                                e.currentTarget.style.boxShadow = '0 6px 20px rgba(51, 204, 255, 0.45)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'linear-gradient(135deg, #007bff, #00b4d8)';
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '0 4px 15px rgba(0, 123, 255, 0.35)';
                            }}
                        >
                            <CIcon icon={cilCloudDownload} /> Import
                        </CButton>
                    )}

                    {/* EXPORT BUTTON */}
                    <button
                        className="d-flex align-items-center gap-2"
                        data-bs-toggle="modal"
                        data-bs-target="#exampleModal2"
                        style={{
                            background: 'linear-gradient(135deg, #ff4b2b, #ff0000)',
                            color: '#fff', border: 'none', borderRadius: '12px',
                            fontWeight: 600, padding: '10px 18px',
                            boxShadow: '0 4px 15px rgba(255, 0, 0, 0.35)',
                            transition: 'all 0.3s ease', cursor: 'pointer',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'linear-gradient(135deg, #ff6b4b, #ff1a1a)';
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.boxShadow = '0 6px 20px rgba(255, 0, 0, 0.45)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'linear-gradient(135deg, #ff4b2b, #ff0000)';
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 4px 15px rgba(255, 0, 0, 0.35)';
                        }}
                    >
                        <i className="bi bi-cloud-download"></i> Export
                    </button>

                    {/* ADD BUTTON */}
                    {!((pageData.addstatus === null || pageData.addstatus === 'i') && auth.UserStatus === 'A') && (
                        <button
                            className="btn btn-success px-4 d-flex align-items-center gap-2 btn-hover-effect"
                            data-bs-toggle="modal"
                            data-bs-target="#exampleModal3"
                            onClick={handleClear}
                            style={{
                                background: 'linear-gradient(135deg, #00c853, #009624)',
                                color: '#fff', border: 'none', borderRadius: '12px',
                                fontWeight: 600, padding: '10px 18px',
                                boxShadow: '0 4px 15px rgba(0, 200, 83, 0.35)',
                                transition: 'all 0.3s ease', cursor: 'pointer',
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = 'linear-gradient(135deg, #00e676, #00c853)';
                                e.currentTarget.style.transform = 'translateY(-2px)';
                                e.currentTarget.style.boxShadow = '0 6px 20px rgba(0, 200, 83, 0.45)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'linear-gradient(135deg, #00c853, #009624)';
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '0 4px 15px rgba(0, 200, 83, 0.35)';
                            }}
                        >
                            <i className="bi bi-plus-lg me-1"></i> Add
                        </button>
                    )}
                </div>

                {/* GRID */}

                <div className='card-body py-3 px-3 px-md-4'>
                    <div className='ag-theme-quartz' style={{ height: "400px" }}>
                        <AgGridReact
                            ref={gridRef}
                            rowData={CategoryData}
                            columnDefs={columndef}
                            defaultColDef={{
                                sortable: true,
                                filter: true,
                                resizable: true,
                            }}
                            autoGroupColumnDef={autoGroupColumnDef}
                            pagination={pagination}
                            paginationPageSize={paginationPageSize}
                            paginationPageSizeSelector={paginationPageSizeSelector}
                            rowSelection="multiple"
                            suppressRowClickSelection={true}
                            animateRows={true}
                            getRowHeight={() => 50}
                        />
                    </div>
                </div>

            </div>
        </div>

    );
};

ShiftMaster.propTypes = {
    auth: PropTypes.any.isRequired,
};

export default ShiftMaster;