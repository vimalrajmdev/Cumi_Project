import React, { useMemo, useState, useEffect, useRef } from 'react';
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
import { useLocation, useNavigate } from 'react-router-dom';
import { CButton, CModal, CModalBody, CModalFooter, CModalHeader, CModalTitle } from '@coreui/react';
import { FaCog, FaEdit, FaEye } from 'react-icons/fa';
import { getConfig } from 'src/config';
import { cilCloudDownload, cilPlus, cilTrash, cilX } from '@coreui/icons';
import CIcon from '@coreui/icons-react';

const LocationMasterConfig = ({ auth }) => {

    const API_URL = getConfig().REACT_APP_API_URL;
    const navigate = useNavigate();
    const location = useLocation();
    const gridRef = useRef(null);

    let pageData = location.state?.pageData;
    if (!pageData) {
        const storedData = localStorage.getItem('pageData');
        pageData = storedData ? JSON.parse(storedData) : {};
    }

    const [loading, setLoading] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [viewModalVisible, setViewModalVisible] = useState(false);
    const [deletevisible, setDeletevisible] = useState(false);
    const [Uploadvisible, setUploadvisible] = useState(false);
    const [Editid, SetEditid] = useState(null);
    const [uploadxl, setuploadxl] = useState(null);

    const initialRegister = { LocationId: '', LocationCode: '', LocationName: '', CreatedBy: '' };
    const [Register, setRegister] = useState(initialRegister);
    const [rowData, setRowData] = useState([]);

    const pagination = true;
    const paginationPageSize = 100;
    const paginationPageSizeSelector = [10, 50, 100];

    const handleClear = () => setRegister(initialRegister);
    const clearRegister = () => setRegister(initialRegister);

    // =========================================================
    // FETCH
    // =========================================================

    const fetchData = async () => {
        setLoading(true);
        try {
            const response = await axios.post(`${API_URL}/LocationMaster`, {
                mode: 'S', LocationId: '', LocationCode: '', LocationName: '', CreatedBy: ''
            });
            setRowData(response.data || []);
        } catch (error) {
            console.error('Error fetching Location details:', error);
            Swal.fire({ title: 'Error', text: 'Unable to fetch Location details', icon: 'error' });
        } finally {
            setLoading(false);
        }
    };

    // =========================================================
    // LOAD FOR VIEW / EDIT
    // =========================================================

    const loadLocation = async (data) => {
        try {
            setLoading(true);
            const response = await axios.post(`${API_URL}/LocationMaster`, { mode: 'E', LocationId: data.LocationId });
            const item = Array.isArray(response.data) ? response.data[0] : response.data;
            setRegister({
                LocationId: item?.LocationId || data.LocationId || '',
                LocationCode: item?.LocationCode || '',
                LocationName: item?.LocationName || '',
                CreatedBy: item?.CreatedBy || ''
            });
        } catch (error) {
            console.error('Error loading Location details:', error);
            Swal.fire({ title: 'Error', text: 'Unable to load Location details', icon: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleView = async (data) => { await loadLocation(data); setViewModalVisible(true); };
    const handleEdit = async (data) => { await loadLocation(data); setEditModalVisible(true); };

    // =========================================================
    // RENDERERS
    // =========================================================

    const ViewRenderer = (params) => {
        if ((pageData.viewstatus === null || pageData.viewstatus === 'i') && auth.UserStatus === 'A') return null;
        return (
            <div>
                <button className="btn btn-hover-effect" onClick={() => handleView(params.data)}>
                    <FaEye className="text-primary cursor-pointer fs-3" title="View" />
                </button>
            </div>
        );
    };

    const EditRenderer = (params) => {
        if ((pageData.editstatus === null || pageData.editstatus === 'i') && auth.UserStatus === 'A') return null;
        return (
            <div>
                <button onClick={() => handleEdit(params.data)} className='mt-1 ms-2'
                    style={{ background: 'linear-gradient(135deg, #007bff, #00b4d8)', color: '#fff', border: 'none', borderRadius: '50%', padding: '7px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 4px 12px rgba(0, 123, 255, 0.35)', transition: 'all 0.3s ease' }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = 'linear-gradient(135deg, #3399ff, #33ccff)'; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 18px rgba(51, 204, 255, 0.45)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'linear-gradient(135deg, #007bff, #00b4d8)'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 123, 255, 0.35)'; }}>
                    <FaEdit className="fs-5" title="Edit" />
                </button>
            </div>
        );
    };

    const DeleteRenderer = (params) => {
        if ((pageData.deletestatus === null || pageData.deletestatus === 'i') && auth.UserStatus === 'A') return null;
        return (
            <div>
                <button className='mt-1 ms-1' onClick={() => handleDelete(params.data.LocationId)}
                    style={{ background: 'linear-gradient(135deg, #ff4d4d, #ff1a1a)', color: '#fff', border: 'none', borderRadius: '50%', padding: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 4px 12px rgba(255, 0, 0, 0.35)', transition: 'all 0.3s ease' }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = 'linear-gradient(135deg, #ff6666, #ff3333)'; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 18px rgba(255, 80, 80, 0.45)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'linear-gradient(135deg, #ff4d4d, #ff1a1a)'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(255, 0, 0, 0.35)'; }}>
                    <CIcon icon={cilTrash} size="xl" />
                </button>
            </div>
        );
    };

    // =========================================================
    // DELETE
    // =========================================================

    const handleDelete = (Id) => {
        try { setDeletevisible(true); SetEditid(Id); } catch (err) { console.log(err); }
    };

    const handleconfirmDelete = async () => {
        try {
            setLoading(true);
            const response = await axios.post(`${API_URL}/LocationMaster`, {
                mode: 'D', LocationId: Editid, LocationCode: '', LocationName: '', CreatedBy: ''
            });
            if (response.status === 200) {
                setDeletevisible(false);
                SetEditid(null);
                await fetchData();
                swal({ text: 'Deleted Successfully', icon: 'success' });
            }
        } catch (err) {
            console.error(err);
            Swal.fire({ title: 'Error', text: 'Unable to delete Location', icon: 'error' });
        } finally {
            setLoading(false);
        }
    };

    // =========================================================
    // VALIDATION
    // =========================================================

    const validateFields = () => {
        const fieldsToCheck = [
            { key: 'LocationCode', message: 'Please Enter Location Code' },
            { key: 'LocationName', message: 'Please Enter Location Name' },
        ];
        for (const field of fieldsToCheck) {
            if (!Register[field.key]?.trim()) {
                Swal.fire({ title: field.message, icon: 'warning', confirmButtonText: 'Done' });
                return false;
            }
        }
        return true;
    };

    // =========================================================
    // ADD
    // =========================================================

    const handlecheck = async () => {
        if (!validateFields()) return;

        const isExisting = rowData.some(
            (item) => item.LocationCode?.trim().toLowerCase() === Register.LocationCode?.trim().toLowerCase()
        );
        if (isExisting) {
            Swal.fire({ text: "This Location Code Already Exists", icon: "warning" });
            return;
        }

        try {
            setLoading(true);
            const response = await axios.post(`${API_URL}/LocationMaster`, {
                
                mode: 'I',
                LocationCode: Register.LocationCode.trim(),
                LocationName: Register.LocationName.trim(),
                CreatedBy: auth.empId
            });
            if (response.status === 200) {
                setIsModalVisible(false);
                clearRegister();
                await fetchData();
                Swal.fire({ title: 'Saved Successfully', icon: 'success', confirmButtonText: 'Done' });
            }
        } catch (err) {
            console.error(err);
            Swal.fire({ title: 'Error', text: 'Unable to save Location details', icon: 'error' });
        } finally {
            setLoading(false);
        }
    };

    // =========================================================
    // UPDATE
    // =========================================================

    const handlechange = async () => {
        if (!validateFields()) return;
        try {
            setLoading(true);
            const response = await axios.post(`${API_URL}/LocationMaster`, {
                mode: 'U',
                LocationId: Register.LocationId,
                LocationCode: Register.LocationCode.trim(),
                LocationName: Register.LocationName.trim(),
                CreatedBy: auth.empId
            });
            if (response.status === 200) {
                setEditModalVisible(false);
                clearRegister();
                await fetchData();
                Swal.fire({ title: 'Updated', text: 'Updated Successfully', icon: 'success', confirmButtonText: 'Done' });
            }
        } catch (err) {
            console.error(err);
            Swal.fire({ title: 'Error', text: 'Unable to update Location details', icon: 'error' });
        } finally {
            setLoading(false);
        }
    };

    // =========================================================
    // GRID COLUMNS
    // =========================================================

    const columdef = [
        { headerName: "Location Code", field: "LocationCode", filter: true, floatingFilter: true, headerClass: 'agheader', width: 180 },
        { headerName: "Location Name", field: "LocationName", filter: true, floatingFilter: true, headerClass: 'agheader', width: 250 },
        { headerName: "View", field: "View", headerClass: 'agheader', cellRenderer: ViewRenderer, width: 80, pinned: 'right' },
        { headerName: pageData.editstatus === null || pageData.editstatus === "i" ? "" : "Edit", field: "Edit", cellRenderer: EditRenderer, width: 80, pinned: 'right', headerClass: 'agheader' },
        { headerName: "Delete", field: "Delete", headerClass: 'agheader', pinned: 'right', cellRenderer: DeleteRenderer, width: 90 },
    ];

    const autoGroupColumnDef = useMemo(() => ({
        headerCheckboxSelection: true, field: "LocationId", flex: 1, minWidth: 240,
        cellRendererParams: { checkbox: true }
    }), []);

    // =========================================================
    // PDF EXPORT
    // =========================================================

    const generatePDF = async () => {
        setLoading(true);
        try {
            const filteredData = gridRef.current.api.getModel().rowsToDisplay.map(r => r.data);
            const doc = new jsPDF({ format: 'a2' });
            const title = 'Location Master';
            const currentUser = auth.employeename || 'Unknown User';
            const currentDateTime = new Date().toLocaleString();
            const pageWidth = doc.internal.pageSize.width;

            doc.setFontSize(14); doc.setFont("helvetica", "bold");
            doc.text(title, pageWidth / 2, 15, { align: 'center' });

            if (filteredData.length > 0) {
                const columnMapping = [
                    { header: "Location Code", key: "LocationCode" },
                    { header: "Location Name", key: "LocationName" },
                ];
                doc.autoTable({
                    head: [columnMapping.map(c => c.header)],
                    body: filteredData.map(obj => columnMapping.map(c => obj[c.key] || '')),
                    margin: { top: 30, right: 10, left: 10, bottom: 20 },
                    theme: 'grid',
                    styles: { fontSize: 10, halign: "center", valign: "middle", overflow: 'linebreak', cellWidth: 'auto', lineColor: [0, 0, 0], lineWidth: 0.1 },
                    headStyles: { fillColor: [63, 119, 210], textColor: [255, 255, 255], lineColor: [0, 0, 0], lineWidth: 0.1, fontStyle: 'bold' },
                    bodyStyles: { fillColor: [245, 245, 245], textColor: [0, 0, 0], lineColor: [0, 0, 0], lineWidth: 0.1 },
                    didDrawPage: (data) => {
                        const pw = doc.internal.pageSize.width, ph = doc.internal.pageSize.height;
                        doc.setFontSize(10);
                        doc.text(`User: ${currentUser}`, pw - 11, 12, { align: 'right' });
                        doc.text(`Date: ${currentDateTime}`, pw - 11, 18, { align: 'right' });
                        doc.setFontSize(14); doc.setFont("helvetica", "bold");
                        doc.text(title, pw / 2, 15, { align: 'center' });
                        doc.setFontSize(10);
                        doc.text(`Page ${data.pageNumber}`, pw / 2, ph - 10, { align: 'center' });
                    }
                });
                doc.save('Location_Master.pdf');
            } else {
                Swal.fire({ title: 'No Data', text: 'No data available to export', icon: 'warning' });
            }
        } catch (error) {
            console.error("Error generating PDF:", error);
            Swal.fire({ title: 'Error', text: 'Failed to generate PDF. Please try again.', icon: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const onExportClick = () => {
        if (!gridRef.current?.api) return;
        gridRef.current.api.exportDataAsCsv({
            fileName: 'Location_Details.csv',
            columnKeys: ['LocationCode', 'LocationName']
        });
    };

    // =========================================================
    // IMPORT
    // =========================================================

    const handleUploadExcelSheet = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            const fileExtension = selectedFile.name.split('.').pop().toLowerCase();
            if (['csv', 'xls', 'xlsx'].includes(fileExtension)) {
                setuploadxl(selectedFile);
            } else {
                Swal.fire({ title: 'Invalid File Format', text: 'Please select a valid CSV or Excel file format.', icon: 'warning' });
                setuploadxl(null); e.target.value = null;
            }
        }
    };

    const handleUploadData = async () => {
        if (!uploadxl) { Swal.fire({ text: 'Please Select Upload File', icon: 'warning' }); return; }
        const result = await Swal.fire({
            title: "Are you sure?", text: "Once uploaded, you will not be able to check the Location list immediately!",
            icon: "warning", showCancelButton: true, cancelButtonText: 'Cancel', confirmButtonText: 'Upload'
        });
        if (!result.isConfirmed) return;
        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('file', uploadxl);
            formData.append('CreatedBy', auth.employeename);
            formData.append('branchid', auth.branchid);
            const response = await axios.post(`${API_URL}/LocationUploadData`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
            const { uploadcount, unuploadedFilePath } = response.data;
            if (unuploadedFilePath) {
                await fetchData();
                swal({
                    heightAuto: true, title: `Total Uploaded Count: ${uploadcount}`,
                    text: "Some Location data could not be uploaded. Please download the file to see the errors.",
                    icon: 'warning', buttons: { cancel: "OK", download: { text: "Download File", value: "download" } }
                }).then((value) => {
                    if (value === "download") {
                        const link = document.createElement('a');
                        link.href = `${API_URL}${unuploadedFilePath}`;
                        link.setAttribute('download', 'unuploaded_Location_data.xlsx');
                        document.body.appendChild(link); link.click(); link.parentNode.removeChild(link);
                    }
                });
            } else {
                await fetchData();
                Swal.fire({ title: `Total Uploaded Count: ${uploadcount}`, text: 'All data uploaded successfully', icon: 'success' });
            }
        } catch (err) {
            console.error(err);
            Swal.fire({ title: 'Please Upload Valid File', icon: 'error' });
        } finally {
            setUploadvisible(false); setuploadxl(null); setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    // =========================================================
    // FORM FIELDS
    // =========================================================

    const formFields = (disabled = false) => (
        <div className="row">
            <div className="col-lg-6 col-md-6 col-sm-12 mt-3">
                <label className="form-label">Location Code {!disabled && <span className="text-danger">*</span>}</label>
                <input type="text" className="form-control" placeholder="Enter Location Code"
                    value={Register.LocationCode} disabled={disabled}
                    onChange={(e) => setRegister({ ...Register, LocationCode: e.target.value })} />
            </div>
            <div className="col-lg-6 col-md-6 col-sm-12 mt-3">
                <label className="form-label">Location Name {!disabled && <span className="text-danger">*</span>}</label>
                <input type="text" className="form-control" placeholder="Enter Location Name"
                    value={Register.LocationName} disabled={disabled}
                    onChange={(e) => setRegister({ ...Register, LocationName: e.target.value })} />
            </div>
        </div>
    );

    const modalFooterClose = (closeFn) => (
        <CButton className="mx-2" type="button" disabled={loading} onClick={closeFn}
            style={{ background: 'linear-gradient(135deg, #616161, #616161)', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 600, padding: '10px 18px', display: 'flex', alignItems: 'center', gap: '3px', boxShadow: '0 4px 15px rgba(100, 100, 100, 0.93)', cursor: loading ? 'not-allowed' : 'pointer', transition: 'all 0.3s ease' }}>
            <CIcon icon={cilX} /> Close
        </CButton>
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

            {/* DELETE MODAL */}
            <CModal size='sm' alignment="center" visible={deletevisible} onClose={() => setDeletevisible(false)} aria-labelledby="VerticallyCenteredExample" backdrop='static'>
                <CModalTitle id="VerticallyCenteredExample" className='ms-3'>Are you sure?</CModalTitle>
                <CModalBody><p>This operation can&apos;t be reverted</p></CModalBody>
                <CModalFooter>
                    <CButton color="secondary" className='btn-hover-effect' onClick={() => setDeletevisible(false)}>CANCEL</CButton>
                    <CButton color="primary" className='btn-hover-effect' onClick={handleconfirmDelete}>CONFIRM</CButton>
                </CModalFooter>
            </CModal>

            <div>
                {/* EXPORT MODAL */}
                <div className="modal fade" id="exampleModalLocation" tabIndex="-1" aria-hidden="true">
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header p-2" style={{ background: '#3f77d2' }}>
                                <h1 className="modal-title fs-5 text-white">Download Format</h1>
                                <button type="button" className="btn-close btn-hover-effect me-2" data-bs-dismiss="modal" aria-label="Close" style={{ backgroundColor: 'white', color: 'black', border: '1px solid #ccc' }} />
                            </div>
                            <div className="modal-body">
                                <div className="d-flex justify-content-evenly">
                                    <div className="btn btn-success" onClick={onExportClick}><i className="bi bi-file-earmark-spreadsheet fs-1"></i></div>
                                    <div className="btn btn-danger" onClick={generatePDF}><i className="bi bi-filetype-pdf fs-1"></i></div>
                                </div>
                                <div className="d-flex justify-content-evenly mt-2">
                                    <span className="text-muted">Download Excel Format</span>
                                    <span className="text-muted">Download PDF Format</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* VIEW MODAL */}
                <CModal size="xl" alignment="center" visible={viewModalVisible} onClose={() => { setViewModalVisible(false); handleClear(); }} backdrop="static">
                    <CModalHeader style={{ background: '#3f77d2' }}>
                        <CModalTitle className="text-white">Location Information</CModalTitle>
                    </CModalHeader>
                    <CModalBody>{formFields(true)}</CModalBody>
                </CModal>

                {/* EDIT MODAL */}
                <CModal size="xl" alignment="center" visible={editModalVisible} onClose={() => { setEditModalVisible(false); handleClear(); }} backdrop="static">
                    <CModalHeader style={{ background: '#3f77d2' }}>
                        <CModalTitle className="text-white">Edit Location</CModalTitle>
                    </CModalHeader>
                    <CModalBody>{formFields(false)}</CModalBody>
                    <CModalFooter>
                        {modalFooterClose(() => { setEditModalVisible(false); handleClear(); })}
                        <button type="button" className="btn btn-hover-effect d-flex align-items-center gap-2" onClick={handlechange}
                            style={{ background: 'linear-gradient(135deg, #00c853, #009624)', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 600, padding: '10px 22px', boxShadow: '0 4px 15px rgba(0, 200, 83, 0.35)', transition: 'all 0.3s ease', cursor: 'pointer' }}>
                            <i className="bi bi-check2-circle"></i> Update
                        </button>
                    </CModalFooter>
                </CModal>

                {/* ADD MODAL */}
                <CModal visible={isModalVisible} onClose={() => { setIsModalVisible(false); handleClear(); }} backdrop='static' size="xl" alignment="center">
                    <CModalHeader style={{ background: '#3f77d2' }}>
                        <CModalTitle className="text-white">Add Location</CModalTitle>
                    </CModalHeader>
                    <CModalBody>{formFields(false)}</CModalBody>
                    <CModalFooter>
                        {modalFooterClose(() => { setIsModalVisible(false); handleClear(); })}
                        <button type="button" className="btn btn-hover-effect d-flex align-items-center gap-2" onClick={handlecheck}
                            style={{ background: 'linear-gradient(135deg, #00c853, #009624)', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 600, padding: '10px 22px', boxShadow: '0 4px 15px rgba(0, 200, 83, 0.35)', transition: 'all 0.3s ease', cursor: 'pointer' }}>
                            <i className="bi bi-check2-circle"></i> Save
                        </button>
                    </CModalFooter>
                </CModal>

                {/* IMPORT MODAL */}
                {Uploadvisible && (
                    <div className={`modal fade ${Uploadvisible ? 'show' : ''}`} style={{ display: Uploadvisible ? 'block' : 'none' }}>
                        <div className="modal-dialog modal-dialog-centered modal-lg modal-dialog-scrollable">
                            <div className="modal-content card">
                                <div className="modal-header">
                                    <h1 className="modal-title fs-5">Import Format</h1>
                                    <button type="button" className="btn-close btn-hover-effect" onClick={() => { setUploadvisible(false); setuploadxl(null); }} style={{ backgroundColor: 'white', color: 'black', border: '1px solid #ccc' }} />
                                </div>
                                <div className="modal-body">
                                    <div className="import-input">
                                        <label htmlFor="importdata" className="form-label">Import Data</label>
                                        <input type="file" className="form-control" accept=".csv, .xls, .xlsx" onChange={handleUploadExcelSheet} />
                                    </div>
                                    <hr className="mt-2" />
                                    <div className="download-sample-template text-center">
                                        <p>Important ⚠</p>
                                        <span className='text-danger'>Download The Below The Template That Colum Name Based Enter The Data Then Upload here</span>
                                        <a href="/LocationMasterTemp.xlsx" className="nav-link text-decoration-underline" download>Click to Download</a>
                                    </div>
                                    <div className="text-center mt-3">
                                        <button className="btn btn-danger mx-2 btn-hover-effect" onClick={() => { setUploadvisible(false); setuploadxl(null); }}>CANCEL</button>
                                        <button className="btn btn-success mx-2 btn-hover-effect" onClick={handleUploadData}>Upload Data</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* MAIN CARD */}
                <div className='card'>
                    <div className='card-header d-flex justify-content-between align-items-center p-3' style={{ background: '#106FB2' }}>
                        <h4 className="mb-0 text-white d-flex align-items-center gap-2">
                            <FaCog className="fs-4" /> Location Master
                        </h4>
                        <button className="btn-close btn-close-white" onClick={() => navigate("/Settings/Configure")}></button>
                    </div>

                    <div className="d-flex justify-content-end mt-2 gap-2 px-3">
                        {!((pageData.addstatus === null || pageData.addstatus === 'i') && auth.UserStatus === 'A') && (
                            <CButton type="button" color="primary" className="d-flex align-items-center gap-2" onClick={() => setUploadvisible(true)}
                                style={{ background: 'linear-gradient(135deg, #007bff, #00b4d8)', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 600, padding: '10px 18px', boxShadow: '0 4px 15px rgba(0, 123, 255, 0.35)' }}>
                                <CIcon icon={cilCloudDownload} /> Import
                            </CButton>
                        )}

                        <button className="d-flex align-items-center gap-2" data-bs-toggle="modal" data-bs-target="#exampleModalLocation"
                            style={{ background: 'linear-gradient(135deg, #ff4b2b, #ff0000)', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 600, padding: '10px 18px', boxShadow: '0 4px 15px rgba(255, 0, 0, 0.35)', cursor: 'pointer' }}>
                            <i className="bi bi-cloud-download"></i> Export
                        </button>

                        {!((pageData.addstatus === null || pageData.addstatus === 'i') && auth.UserStatus === 'A') && (
                            <CButton type="button" color="success" className="me-3 d-flex align-items-center gap-2" onClick={() => { handleClear(); setIsModalVisible(true); }}
                                style={{ background: 'linear-gradient(135deg, #00c853, #009624)', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 600, padding: '10px 18px', boxShadow: '0 4px 15px rgba(0, 200, 83, 0.35)' }}>
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

LocationMasterConfig.propTypes = { auth: PropTypes.any.isRequired };

export default LocationMasterConfig;