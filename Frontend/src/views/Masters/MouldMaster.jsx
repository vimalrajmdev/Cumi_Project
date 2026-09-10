// import React, { useMemo, useState, useEffect, useRef, useCallback } from 'react'
// import { AgGridReact } from 'ag-grid-react';
// import "ag-grid-community/styles/ag-grid.css";
// import "ag-grid-community/styles/ag-theme-alpine.css";
// import axios from 'axios';
// import Swal from 'sweetalert2';
// import swal from 'sweetalert';
// import jsPDF from 'jspdf';
// import 'jspdf-autotable';
// import { useNavigate, useLocation } from 'react-router-dom';
// import PropTypes from 'prop-types';
// import { BallTriangle } from 'react-loader-spinner';
// import { FaEdit, FaEye } from 'react-icons/fa';
// import { getConfig } from 'src/config';
// import { cilCloudDownload, cilPlus, cilTrash } from '@coreui/icons';
// import CIcon from '@coreui/icons-react';
// import { CButton } from '@coreui/react';

// const FGMaster = ({ auth }) => {
//     const API_URL = getConfig().REACT_APP_API_URL;
//     const [Uploadvisible, setUploadvisible] = useState(false);
//     const [uploadxl, setuploadxl] = useState(null);
//     const [loading, setLoading] = useState(false);
//     const navigate = useNavigate();
//     const gridRef = useRef(null);

//     // ======================== SEARCH & FILTER ========================
//     const [searchText, setSearchText] = useState('');
//     const [selectedLocation, setSelectedLocation] = useState('');

//     // ======================== REGISTER STATE ========================
//     const resetRegister = useCallback(() => ({
//         PlantCode: '',
//         LocationCode: '',
//         ItemCode: '',
//         WheelSize: '',
//         MouldSize: '',
//         Grade: '',
//         id: ''
//     }), []);

//     const [Register, setRegister] = useState(resetRegister);
//     const [isModalVisible, setIsModalVisible] = useState(false);

//     // ======================== PAGE DATA ========================
//     const location = useLocation();
//     let pageData = location.state?.pageData;
//     if (!pageData) {
//         const storedData = localStorage.getItem('pageData');
//         pageData = storedData ? JSON.parse(storedData) : {};
//     }

//     // ======================== PAGINATION ========================
//     const pagination = true;
//     const paginationPageSize = 100;
//     const paginationPageSizeSelector = [10, 50, 100];

//     // ======================== LOCATION DATA ========================
//     const [LocationData, setLocationData] = useState([]);

//     const fetchLocationData = useCallback(async () => {
//         try {
//             const response = await axios.post(`${API_URL}/LocationConfig`, {
//                 mode: 'FetchLocation',
//                 PlantCode: auth.PlantCode,
//                 LocationCode: '', LocationName: '', LocationType: '',
//                 Zone: '', Row: '', Rack: '', Bin: '',
//                 Status: '', Remark: '', CreatedBy: ''
//             });
//             setLocationData(Array.isArray(response.data) ? response.data : []);
//         } catch (error) {
//             console.error('Error fetching location details:', error);
//         }
//     }, [API_URL, auth.PlantCode]);

//     // ======================== LOCATION FILTER ========================
//     const handleLocationFilter = (value) => {
//         setSelectedLocation(value);
//         if (gridRef.current && gridRef.current.api) {
//             const filterModel = value
//                 ? { LocationCode: { filterType: 'text', type: 'equals', filter: value } }
//                 : {};
//             gridRef.current.api.setFilterModel(filterModel);
//         }
//     };

//     // ======================== ROW DATA ========================
//     const [rowData, setRowData] = useState([]);

//     const fetchData = useCallback(async () => {
//         setLoading(true);
//         try {
//             const response = await axios.post(`${API_URL}/FGConfig`, {
//                 mode: 'FetchFG',
//                 PlantCode: auth.PlantCode,
//                 LocationCode: '', ItemCode: '',
//                 WheelSize: '', MouldSize: '',
//                 Grade: '', id: ''
//             });
//             if (response.status === 200) {
//                 setRowData(Array.isArray(response.data) ? response.data : []);
//             }
//         } catch (error) {
//             console.error('Error fetching FG details:', error);
//         } finally {
//             setLoading(false);
//         }
//     }, [API_URL, auth.PlantCode]);

//     // ======================== CLOSE MODAL HELPER ========================
//     const closeModal = (modalId) => {
//         try {
//             const modalEl = document.getElementById(modalId);
//             if (modalEl) {
//                 const modal = window.bootstrap.Modal.getInstance(modalEl);
//                 if (modal) modal.hide();
//             }
//         } catch (err) {
//             console.log('Modal close error:', err);
//         }
//     };

//     // ======================== CLEAR ========================
//     const handleClear = useCallback(() => {
//         setRegister(resetRegister());
//     }, [resetRegister]);

//     // ======================== VIEW HANDLER ========================
//     const handleView = useCallback(async (data) => {
//         try {
//             const response = await axios.post(`${API_URL}/FGConfig`, {
//                 mode: 'E', id: data.Id
//             });
//             if (Array.isArray(response.data) && response.data.length > 0) {
//                 const r = response.data[0];
//                 setRegister({
//                     PlantCode:    r.PlantCode    || '',
//                     LocationCode: r.LocationCode || '',
//                     ItemCode:     r.ItemCode     || '',
//                     WheelSize:    r.WheelSize    || '',
//                     MouldSize:    r.MouldSize    || '',
//                     Grade:        r.Grade        || '',
//                     id:           r.Id           || ''
//                 });
//             }
//         } catch (error) {
//             console.log(error);
//         }
//     }, [API_URL]);

//     // ======================== EDIT HANDLER ========================
//     const handleEdit = useCallback(async (data) => {
//         try {
//             const response = await axios.post(`${API_URL}/FGConfig`, {
//                 mode: 'E', id: data.Id
//             });
//             if (Array.isArray(response.data) && response.data.length > 0) {
//                 const r = response.data[0];
//                 setRegister({
//                     PlantCode:    r.PlantCode    || '',
//                     LocationCode: r.LocationCode || '',
//                     ItemCode:     r.ItemCode     || '',
//                     WheelSize:    r.WheelSize    || '',
//                     MouldSize:    r.MouldSize    || '',
//                     Grade:        r.Grade        || '',
//                     id:           r.Id           || ''
//                 });
//             }
//         } catch (error) {
//             console.error('ERROR EDITING RECORD:', error);
//         }
//     }, [API_URL]);

//     // ======================== DELETE HANDLER ========================
//     const handleDelete = useCallback(async (data) => {
//         const result = await Swal.fire({
//             title: "Are you sure?",
//             text: "Once deleted, you will not be able to recover the data!",
//             icon: "warning", showCancelButton: true,
//             cancelButtonText: 'Cancel', confirmButtonText: 'Delete',
//         });
//         if (result.isConfirmed) {
//             setLoading(true);
//             try {
//                 await axios.post(`${API_URL}/FGConfig`, {
//                     mode: 'D', id: data.Id
//                 });
//                 await fetchData();
//                 Swal.fire({
//                     title: 'Deleted',
//                     text: 'Deleted Successfully',
//                     icon: 'success',
//                     confirmButtonText: 'Done'
//                 });
//             } catch (error) {
//                 console.error('ERROR DELETING RECORD:', error);
//                 Swal.fire({ title: 'Error', text: 'Failed to delete.', icon: 'error' });
//             } finally {
//                 setLoading(false);
//             }
//         }
//     }, [API_URL, fetchData]);

//     // ======================== UPDATE ========================
//     const handlechange = async () => {
//         setLoading(true);
//         try {
//             const alldata = { ...Register, CreatedBy: auth.employeename, mode: 'U' };
//             await axios.post(`${API_URL}/FGConfig`, alldata);
//             closeModal('exampleModalEdit');
//             handleClear();
//             await fetchData();
//             Swal.fire({
//                 title: 'Updated Successfully',
//                 text: 'Mould record has been updated.',
//                 icon: 'success', confirmButtonText: 'Done'
//             });
//         } catch (err) {
//             console.log(err);
//             Swal.fire({ title: 'Error', text: 'Failed to update.', icon: 'error' });
//         } finally {
//             setLoading(false);
//         }
//     };

//     // ======================== RENDERERS ========================
//     const ViewRenderer = useCallback((params) => {
//         if ((pageData.viewstatus === null || pageData.viewstatus === 'i') && auth.UserStatus === 'A') return null;
//         return (
//             <div>
//                 <button
//                     className="btn btn-hover-effect"
//                     onClick={() => handleView(params.data)}
//                     data-bs-toggle="modal"
//                     data-bs-target="#exampleModalView"
//                 >
//                     <FaEye className="text-primary cursor-pointer fs-3" title="View" />
//                 </button>
//             </div>
//         );
//     }, [handleView, pageData, auth.UserStatus]);

//     const EditRenderer = useCallback((params) => {
//         if ((pageData.editstatus === null || pageData.editstatus === 'i') && auth.UserStatus === 'A') return null;
//         return (
//             <div>
//                 <button
//                     className='btn btn-hover-effect mt-1'
//                     onClick={() => handleEdit(params.data)}
//                     data-bs-toggle="modal"
//                     data-bs-target="#exampleModalEdit"
//                     style={{
//                         background: 'linear-gradient(135deg, #007bff, #00b4d8)',
//                         color: '#fff', border: 'none', borderRadius: '50%', padding: '7px',
//                         display: 'flex', alignItems: 'center', justifyContent: 'center',
//                         cursor: 'pointer', boxShadow: '0 4px 12px rgba(0, 123, 255, 0.35)',
//                         transition: 'all 0.3s ease',
//                     }}
//                     onMouseEnter={(e) => {
//                         e.currentTarget.style.background = 'linear-gradient(135deg, #3399ff, #33ccff)';
//                         e.currentTarget.style.transform = 'translateY(-2px)';
//                     }}
//                     onMouseLeave={(e) => {
//                         e.currentTarget.style.background = 'linear-gradient(135deg, #007bff, #00b4d8)';
//                         e.currentTarget.style.transform = 'translateY(0)';
//                     }}
//                 >
//                     <FaEdit className="fs-5" title="Edit" />
//                 </button>
//             </div>
//         );
//     }, [handleEdit, pageData, auth.UserStatus]);

//     const DeleteRenderer = useCallback((params) => {
//         if ((pageData.deletestatus === null || pageData.deletestatus === 'i') && auth.UserStatus === 'A') return null;
//         return (
//             <div>
//                 <button
//                     className='mt-1 ms-1'
//                     onClick={() => handleDelete(params.data)}
//                     style={{
//                         background: 'linear-gradient(135deg, #ff4d4d, #ff1a1a)',
//                         color: '#fff', border: 'none', borderRadius: '50%', padding: '4px',
//                         display: 'flex', alignItems: 'center', justifyContent: 'center',
//                         cursor: 'pointer', boxShadow: '0 4px 12px rgba(255, 0, 0, 0.35)',
//                         transition: 'all 0.3s ease',
//                     }}
//                     onMouseEnter={(e) => {
//                         e.currentTarget.style.background = 'linear-gradient(135deg, #ff6666, #ff3333)';
//                         e.currentTarget.style.transform = 'translateY(-2px)';
//                     }}
//                     onMouseLeave={(e) => {
//                         e.currentTarget.style.background = 'linear-gradient(135deg, #ff4d4d, #ff1a1a)';
//                         e.currentTarget.style.transform = 'translateY(0)';
//                     }}
//                 >
//                     <CIcon icon={cilTrash} size="xl" />
//                 </button>
//             </div>
//         );
//     }, [handleDelete, pageData, auth.UserStatus]);

//     // ======================== COLUMN DEFINITIONS ========================
//     const columdef = useMemo(() => [
//         { headerCheckboxSelection: true, checkboxSelection: true, width: 60 },
//         // { headerName: "Plant Code",    field: "PlantCode",    filter: true, headerClass: 'agheader', floatingFilter: true },
//         // { headerName: "Location Code", field: "LocationCode", filter: true, headerClass: 'agheader', floatingFilter: true },
//         { headerName: "Item Code",     field: "ItemCode",     filter: true, headerClass: 'agheader', floatingFilter: true },
//         { headerName: "Wheel Size",    field: "WheelSize",    filter: true, headerClass: 'agheader', floatingFilter: true },
//         { headerName: "Module Size",   field: "MouldSize",    filter: true, headerClass: 'agheader', floatingFilter: true },
//         { headerName: "Grade",         field: "Grade",        filter: true, headerClass: 'agheader', floatingFilter: true },
//         { headerName: "Created Date",  field: "CreatedDate",  filter: true, headerClass: 'agheader', floatingFilter: true },
//         { headerName: "Created By",    field: "CreatedBy",    filter: true, headerClass: 'agheader', floatingFilter: true },
//         {
//             headerName: "View", field: "View", pinned: 'right',
//             headerClass: 'agheader', cellRenderer: ViewRenderer,
//             width: 80, filter: false, floatingFilter: false
//         },
//         {
//             headerName: 'Edit', field: "Edit", pinned: 'right',
//             cellRenderer: EditRenderer, headerClass: 'agheader',
//             width: 80, filter: false, floatingFilter: false
//         },
//         {
//             headerName: "Delete", field: "Delete", headerClass: 'agheader',
//             cellRenderer: DeleteRenderer, pinned: 'right',
//             width: 90, filter: false, floatingFilter: false
//         },
//     ], [ViewRenderer, EditRenderer, DeleteRenderer]);

//     const autoGroupColumnDef = useMemo(() => ({
//         headerCheckboxSelection: true,
//         field: "id", flex: 1, minWidth: 240,
//         cellRendererParams: { checkbox: true },
//     }), []);

//     // ======================== USE EFFECT ========================
//     useEffect(() => {
//         fetchData();
//         fetchLocationData();
//         const interval = setInterval(() => { fetchData(); }, 60000);
//         return () => clearInterval(interval);
//     }, [fetchData, fetchLocationData]);

//     // ======================== SEARCH ========================
//     const handleSearchChange = (e) => {
//         setSearchText(e.target.value);
//         if (gridRef.current && gridRef.current.api) {
//             gridRef.current.api.setQuickFilter(e.target.value);
//         }
//     };

//     // ======================== VALIDATION ========================
//     const validateFields = () => {
//         const fieldsToCheck = [
//             { key: 'PlantCode',    message: 'Please Enter Plant Code' },
//             { key: 'LocationCode', message: 'Please Select Location Code' },
//             { key: 'ItemCode',     message: 'Please Enter Item Code' },
//             { key: 'WheelSize',    message: 'Please Enter Wheel Size' },
//             { key: 'MouldSize',    message: 'Please Enter Module Size' },
//             { key: 'Grade',        message: 'Please Enter Grade' }
//         ];
//         for (const field of fieldsToCheck) {
//             if (!Register[field.key] || Register[field.key].toString().trim() === '') {
//                 Swal.fire({ title: field.message, icon: 'warning', confirmButtonText: 'Done' });
//                 return false;
//             }
//         }
//         return true;
//     };

//     // ======================== INSERT ========================
//     const handlecheck = async () => {
//         if (!validateFields()) return;

//         const isDuplicate = rowData.some(
//             (item) => item.ItemCode?.toLowerCase() === Register.ItemCode?.toLowerCase()
//                    && item.PlantCode?.toLowerCase() === Register.PlantCode?.toLowerCase()
//         );
//         if (isDuplicate) {
//             swal({ text: "This Item Code already exists for this Plant.", icon: "warning" });
//             return;
//         }

//         setLoading(true);
//         try {
//             const alldata = { ...Register, CreatedBy: auth.employeename, mode: 'I' };
//             await axios.post(`${API_URL}/FGConfig`, alldata);
//             setIsModalVisible(false);
//             handleClear();
//             await fetchData();
//             Swal.fire({
//                 title: 'Saved Successfully',
//                 text: 'Mould record has been added.',
//                 icon: 'success', confirmButtonText: 'Done'
//             });
//         } catch (err) {
//             console.log(err);
//             Swal.fire({ title: 'Error', text: 'Failed to save. Please try again.', icon: 'error' });
//         } finally {
//             setLoading(false);
//         }
//     };

//     // ======================== IMPORT ========================
//     const handleUploadExcelSheet = (e) => {
//         const selectedFile = e.target.files[0];
//         if (selectedFile) {
//             const fileExtension = selectedFile.name.split('.').pop().toLowerCase();
//             if (['csv', 'xls', 'xlsx'].includes(fileExtension)) {
//                 setuploadxl(selectedFile);
//             } else {
//                 Swal.fire({ title: 'Invalid File Format', text: 'Please select a valid CSV or Excel file format.', icon: 'warning' });
//                 setuploadxl(null);
//                 e.target.value = null;
//             }
//         }
//     };

//     const handleUploadData = async () => {
//         if (!uploadxl) {
//             Swal.fire({ text: 'Please Select Upload File', icon: 'warning' });
//             return;
//         }
//         const result = await Swal.fire({
//             title: "Are you sure?",
//             text: "Once uploaded, you will not be able to check the Mould list immediately!",
//             icon: "warning", showCancelButton: true,
//             cancelButtonText: 'Cancel', confirmButtonText: 'Upload',
//         });
//         if (result.isConfirmed) {
//             setLoading(true);
//             try {
//                 const formData = new FormData();
//                 formData.append('file', uploadxl);
//                 formData.append('CreatedBy', auth.employeename);
//                 const response = await axios.post(`${API_URL}/FGMasterUploadData`, formData, {
//                     headers: { 'Content-Type': 'multipart/form-data' },
//                 });
//                 const { uploadcount, unuploadedFilePath } = response.data;
//                 await fetchData();
//                 if (unuploadedFilePath) {
//                     swal({
//                         title: `Total Uploaded Count: ${uploadcount}`,
//                         text: "Some data could not be uploaded. Please download the file to see the errors.",
//                         icon: 'warning',
//                         buttons: { cancel: "OK", download: { text: "Download File", value: "download" } },
//                     }).then((value) => {
//                         if (value === "download") {
//                             const link = document.createElement('a');
//                             link.href = `${API_URL}${unuploadedFilePath}`;
//                             link.setAttribute('download', 'unuploaded_FG_data.xlsx');
//                             document.body.appendChild(link);
//                             link.click();
//                             link.remove();
//                         }
//                     });
//                 } else {
//                     Swal.fire({
//                         title: `Total Uploaded Count: ${uploadcount}`,
//                         text: 'All data uploaded successfully', icon: 'success'
//                     });
//                 }
//             } catch (err) {
//                 console.error(err);
//                 Swal.fire({ title: 'Please Upload Valid File', icon: 'error' });
//             } finally {
//                 setUploadvisible(false);
//                 setLoading(false);
//             }
//         }
//     };

//     // ======================== PDF EXPORT ========================
//     const generatePDF = async () => {
//         setLoading(true);
//         try {
//             const filteredData = gridRef.current.api.getModel().rowsToDisplay.map(rowNode => rowNode.data);
//             const doc = new jsPDF({ format: 'a4' });
//             const title = 'Mould Master';
//             const currentUser = auth.employeename || 'Unknown User';
//             const currentDateTime = new Date().toLocaleString();
//             const pageWidth = doc.internal.pageSize.width;

//             doc.setFontSize(14);
//             doc.setFont("helvetica", "bold");
//             doc.text(title, pageWidth / 2, 15, { align: 'center' });

//             if (filteredData.length > 0) {
//                 const columnMapping = [
//                     { header: "Plant Code",    key: "PlantCode" },
//                     { header: "Location Code", key: "LocationCode" },
//                     { header: "Item Code",     key: "ItemCode" },
//                     { header: "Wheel Size",    key: "WheelSize" },
//                     { header: "Module Size",   key: "MouldSize" },
//                     { header: "Grade",         key: "Grade" },
//                     { header: "Created Date",  key: "CreatedDate" },
//                     { header: "Created By",    key: "CreatedBy" },
//                 ];
//                 const columnHeaders = columnMapping.map(col => col.header);
//                 const data = filteredData.map(obj => columnMapping.map(col => obj[col.key] || ''));

//                 doc.autoTable({
//                     head: [columnHeaders], body: data,
//                     margin: { top: 30, right: 10, left: 10, bottom: 20 },
//                     theme: 'grid',
//                     styles: { fontSize: 9, halign: "center", valign: "middle", overflow: 'linebreak', lineColor: [0, 0, 0], lineWidth: 0.1 },
//                     headStyles: { fillColor: [63, 119, 210], textColor: [255, 255, 255], lineColor: [0, 0, 0], lineWidth: 0.1, fontStyle: 'bold' },
//                     bodyStyles: { fillColor: [245, 245, 245], textColor: [0, 0, 0], lineColor: [0, 0, 0], lineWidth: 0.1 },
//                     didDrawPage: (data) => {
//                         const pw = doc.internal.pageSize.width;
//                         const ph = doc.internal.pageSize.height;
//                         doc.setFontSize(10);
//                         doc.text(`User: ${currentUser}`, pw - 10, 12, { align: 'right' });
//                         doc.text(`Date: ${currentDateTime}`, pw - 10, 18, { align: 'right' });
//                         doc.setFontSize(14);
//                         doc.setFont("helvetica", "bold");
//                         doc.text(title, pw / 2, 15, { align: 'center' });
//                         doc.setFontSize(10);
//                         doc.text(`Page ${data.pageNumber}`, pw / 2, ph - 10, { align: 'center' });
//                     }
//                 });
//                 doc.save('FG_Master.pdf');
//             } else {
//                 Swal.fire({ title: 'No data available to export', icon: 'warning' });
//             }
//         } catch (error) {
//             Swal.fire({ title: 'Failed to generate PDF', icon: 'error' });
//         } finally {
//             setLoading(false);
//         }
//     };

//     // ======================== CSV EXPORT ========================
//     const onExportClick = () => {
//         gridRef.current.api.exportDataAsCsv({
//             fileName: 'FG_Details.csv',
//             columnKeys: ['PlantCode', 'LocationCode', 'ItemCode', 'WheelSize', 'MouldSize', 'Grade', 'CreatedDate', 'CreatedBy'],
//         });
//     };

//     // ======================== LOCATION DROPDOWN ========================
//     const LocationOptions = () => (
//         <>
//             <option value="">Select Location</option>
//             {LocationData.map((loc, idx) => (
//                 <option key={idx} value={loc.LocationCode}>
//                     {loc.LocationCode} - {loc.LocationName}
//                 </option>
//             ))}
//         </>
//     );

//     // ======================== BUTTON STYLES ========================
//     const btnGreen = {
//         background: 'linear-gradient(135deg, #00c853, #009624)', color: '#fff', border: 'none',
//         borderRadius: '12px', fontWeight: 600, padding: '10px 22px',
//         boxShadow: '0 4px 15px rgba(0, 200, 83, 0.35)', transition: 'all 0.3s ease', cursor: 'pointer',
//     };
//     const btnPurple = {
//         background: 'linear-gradient(135deg, #8e2de2, #4a00e0)', color: '#fff', border: 'none',
//         borderRadius: '12px', fontWeight: 600, padding: '10px 18px',
//         boxShadow: '0 4px 15px rgba(142, 45, 226, 0.35)', transition: 'all 0.3s ease', cursor: 'pointer',
//     };
//     const btnBlue = {
//         background: 'linear-gradient(135deg, #007bff, #00b4d8)', color: '#fff', border: 'none',
//         borderRadius: '12px', fontWeight: 600, padding: '10px 18px',
//         boxShadow: '0 4px 15px rgba(0, 123, 255, 0.35)', transition: 'all 0.3s ease', cursor: 'pointer',
//     };
//     const btnRed = {
//         background: 'linear-gradient(135deg, #ff4b2b, #ff0000)', color: '#fff', border: 'none',
//         borderRadius: '12px', fontWeight: 600, padding: '10px 18px',
//         boxShadow: '0 4px 15px rgba(255, 0, 0, 0.35)', transition: 'all 0.3s ease', cursor: 'pointer',
//     };

//     // FIX 2: Orange Clear button style
//     const btnOrange = {
//         background: 'linear-gradient(135deg, #ff9800, #e65100)', color: '#fff', border: 'none',
//         borderRadius: '12px', fontWeight: 600, padding: '10px 18px',
//         boxShadow: '0 4px 15px rgba(255, 152, 0, 0.35)', transition: 'all 0.3s ease', cursor: 'pointer',
//     };

//     // ======================== RETURN JSX ========================
//     return (
//         <>
//             {loading && (
//                 <div className="loading-overlay">
//                     <div className="loading-spinner">
//                         <BallTriangle height={100} width={100} radius={5} color="#4fa94d"
//                             ariaLabel="ball-triangle-loading" visible={true} />
//                     </div>
//                 </div>
//             )}

//             <div className='mt-4'>

//                 {/* ==================== DOWNLOAD MODAL ==================== */}
//                 <div className="modal fade" id="exampleModal" tabIndex="-1" aria-hidden="true" data-bs-backdrop="static">
//                     <div className="modal-dialog modal-dialog-centered">
//                         <div className="modal-content">
//                             <div className="modal-header p-2" style={{ background: '#3f77d2' }}>
//                                 <h5 className="modal-title text-white">Download Format</h5>
//                                 <button type="button" className="btn-close btn-close-white" data-bs-dismiss="modal"></button>
//                             </div>
//                             <div className="modal-body">
//                                 <div className="d-flex justify-content-evenly">
//                                     <div className="btn btn-success" onClick={onExportClick}>
//                                         <i className="bi bi-file-earmark-spreadsheet fs-1"></i>
//                                     </div>
//                                     <div className="btn btn-danger" onClick={generatePDF}>
//                                         <i className="bi bi-filetype-pdf fs-1"></i>
//                                     </div>
//                                 </div>
//                                 <div className="d-flex justify-content-evenly mt-2">
//                                     <span className="text-muted">Download Excel</span>
//                                     <span className="text-muted">Download PDF</span>
//                                 </div>
//                             </div>
//                         </div>
//                     </div>
//                 </div>

//                 {/* ==================== VIEW MODAL ==================== */}
//                 <div className="modal fade" id="exampleModalView" tabIndex="-1" aria-hidden="true" data-bs-backdrop="static">
//                     <div className="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
//                         <div className="modal-content">
//                             <div className="modal-header p-2" style={{ background: 'linear-gradient(135deg, #28a745, #5cb85c)' }}>
//                                 <h5 className="modal-title text-white fw-bold">
//                                     <i className="fas fa-eye me-2"></i> View Mould Details
//                                 </h5>
//                                 <button type="button" className="btn-close btn-close-white"
//                                     data-bs-dismiss="modal" onClick={handleClear}></button>
//                             </div>
//                             <div className="modal-body">
//                                 <div className="row g-3">
//                                     {/* <div className="col-lg-3 col-md-6 col-12">
//                                         <label className="form-label text-muted">Plant Code</label>
//                                         <p className="fw-semibold">{Register.PlantCode || '-'}</p>
//                                     </div>
//                                     <div className="col-lg-3 col-md-6 col-12">
//                                         <label className="form-label text-muted">Location Code</label>
//                                         <p className="fw-semibold">{Register.LocationCode || '-'}</p>
//                                     </div> */}
//                                     <div className="col-lg-3 col-md-6 col-12">
//                                         <label className="form-label text-muted">Item Code</label>
//                                         <p className="fw-semibold">{Register.ItemCode || '-'}</p>
//                                     </div>
//                                     <div className="col-lg-3 col-md-6 col-12">
//                                         <label className="form-label text-muted">Wheel Size</label>
//                                         <p className="fw-semibold">{Register.WheelSize || '-'}</p>
//                                     </div>
//                                     <div className="col-lg-3 col-md-6 col-12">
//                                         <label className="form-label text-muted">Module Size</label>
//                                         <p className="fw-semibold">{Register.MouldSize || '-'}</p>
//                                     </div>
//                                     <div className="col-lg-3 col-md-6 col-12">
//                                         <label className="form-label text-muted">Grade</label>
//                                         <p className="fw-semibold">{Register.Grade || '-'}</p>
//                                     </div>
//                                 </div>
//                             </div>
//                             <div className="modal-footer">
//                                 <button type="button" className="btn btn-secondary"
//                                     data-bs-dismiss="modal" onClick={handleClear}
//                                     style={{ borderRadius: '10px' }}>
//                                     <i className="fas fa-times me-1"></i> Close
//                                 </button>
//                             </div>
//                         </div>
//                     </div>
//                 </div>

//                 {/* ==================== EDIT MODAL ==================== */}
//                 <div className="modal fade" id="exampleModalEdit" tabIndex="-1" aria-hidden="true" data-bs-backdrop="static">
//                     <div className="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
//                         <div className="modal-content">
//                             <div className="modal-header p-2" style={{ background: '#3f77d2' }}>
//                                 <h5 className="modal-title text-white fw-bold">
//                                     <i className="fas fa-edit me-2"></i> Edit Mould Details
//                                 </h5>
//                                 <button type="button" className="btn-close btn-close-white"
//                                     data-bs-dismiss="modal" onClick={handleClear}></button>
//                             </div>
//                             <div className="modal-body">
//                                 <div className="row g-3">

//                                     {/* FIX 1: PlantCode as editable input */}
//                                     {/* <div className="col-lg-3 col-md-6 col-12">
//                                         <label className="fw-semibold">
//                                             Plant Code <span className="text-danger">*</span>
//                                         </label>
//                                         <input
//                                             className="form-control mt-1"
//                                             placeholder="Enter Plant Code"
//                                             value={Register.PlantCode}
//                                             onChange={(e) => setRegister(prev => ({ ...prev, PlantCode: e.target.value }))}
//                                         />
//                                     </div>

//                                     <div className="col-lg-3 col-md-6 col-12">
//                                         <label className="fw-semibold">
//                                             Location Code <span className="text-danger">*</span>
//                                         </label>
//                                         <select className="form-select mt-1"
//                                             value={Register.LocationCode}
//                                             onChange={(e) => setRegister(prev => ({ ...prev, LocationCode: e.target.value }))}>
//                                             <LocationOptions />
//                                         </select>
//                                     </div> */}

//                                     <div className="col-lg-3 col-md-6 col-12">
//                                         <label className="fw-semibold">
//                                             Item Code <span className="text-danger">*</span>
//                                         </label>
//                                         <input className="form-control mt-1"
//                                             onChange={(e) => setRegister(prev => ({ ...prev, ItemCode: e.target.value }))}
//                                             value={Register.ItemCode} placeholder="Enter Item Code" />
//                                     </div>

//                                     <div className="col-lg-3 col-md-6 col-12">
//                                         <label className="fw-semibold">
//                                             Wheel Size <span className="text-danger">*</span>
//                                         </label>
//                                         <input className="form-control mt-1"
//                                             onChange={(e) => setRegister(prev => ({ ...prev, WheelSize: e.target.value }))}
//                                             value={Register.WheelSize} placeholder="Enter Wheel Size" />
//                                     </div>

//                                     <div className="col-lg-3 col-md-6 col-12">
//                                         <label className="fw-semibold">
//                                             Module Size <span className="text-danger">*</span>
//                                         </label>
//                                         <input className="form-control mt-1"
//                                             onChange={(e) => setRegister(prev => ({ ...prev, MouldSize: e.target.value }))}
//                                             value={Register.MouldSize} placeholder="Enter Module Size" />
//                                     </div>

//                                     <div className="col-lg-3 col-md-6 col-12">
//                                         <label className="fw-semibold">
//                                             Grade <span className="text-danger">*</span>
//                                         </label>
//                                         <input className="form-control mt-1"
//                                             onChange={(e) => setRegister(prev => ({ ...prev, Grade: e.target.value }))}
//                                             value={Register.Grade} placeholder="Enter Grade" />
//                                     </div>
//                                 </div>
//                             </div>
//                             <div className="modal-footer">
//                                 {/* FIX 2: Clear button */}
//                                 <button type="button"
//                                     className="btn d-flex align-items-center gap-2"
//                                     onClick={handleClear}
//                                     style={btnOrange}>
//                                     <i className="bi bi-eraser"></i> Clear
//                                 </button>
//                                 <button type="button"
//                                     className="btn d-flex align-items-center gap-2"
//                                     onClick={handlechange}
//                                     disabled={loading}
//                                     style={{ ...btnPurple, cursor: loading ? 'not-allowed' : 'pointer' }}>
//                                     {loading
//                                         ? <><span className="spinner-border spinner-border-sm me-1"></span> Updating...</>
//                                         : <><i className="bi bi-arrow-repeat"></i> Update</>
//                                     }
//                                 </button>
//                             </div>
//                         </div>
//                     </div>
//                 </div>

//                 {/* ==================== ADD MODAL ==================== */}
//                 {isModalVisible && (
//                     <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
//                         <div className="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
//                             <div className="modal-content">
//                                 <div className="modal-header p-2" style={{ background: '#3f77d2' }}>
//                                     <h5 className="modal-title text-white fw-bold">
//                                         <i className="fas fa-plus-circle me-2"></i> Add Mould Details
//                                     </h5>
//                                     <button type="button" className="btn-close btn-close-white"
//                                         onClick={() => { handleClear(); setIsModalVisible(false); }}></button>
//                                 </div>
//                                 <div className="modal-body">
//                                     <div className="row g-3">

//                                         {/* FIX 1: PlantCode as editable input */}
//                                         {/* <div className="col-lg-3 col-md-6 col-12">
//                                             <label className="fw-semibold">
//                                                 Plant Code <span className="text-danger">*</span>
//                                             </label>
//                                             <input
//                                                 className="form-control mt-1"
//                                                 placeholder="Enter Plant Code"
//                                                 value={Register.PlantCode}
//                                                 onChange={(e) => setRegister(prev => ({ ...prev, PlantCode: e.target.value }))}
//                                             />
//                                         </div>

//                                         <div className="col-lg-3 col-md-6 col-12">
//                                             <label className="fw-semibold">
//                                                 Location Code <span className="text-danger">*</span>
//                                             </label>
//                                             <select className="form-select mt-1"
//                                                 value={Register.LocationCode}
//                                                 onChange={(e) => setRegister(prev => ({ ...prev, LocationCode: e.target.value }))}>
//                                                 <LocationOptions />
//                                             </select>
//                                         </div> */}

//                                         <div className="col-lg-3 col-md-6 col-12">
//                                             <label className="fw-semibold">
//                                                 Item Code <span className="text-danger">*</span>
//                                             </label>
//                                             <input className="form-control mt-1"
//                                                 onChange={(e) => setRegister(prev => ({ ...prev, ItemCode: e.target.value }))}
//                                                 value={Register.ItemCode} placeholder="Enter Item Code" />
//                                         </div>

//                                         <div className="col-lg-3 col-md-6 col-12">
//                                             <label className="fw-semibold">
//                                                 Wheel Size <span className="text-danger">*</span>
//                                             </label>
//                                             <input className="form-control mt-1"
//                                                 onChange={(e) => setRegister(prev => ({ ...prev, WheelSize: e.target.value }))}
//                                                 value={Register.WheelSize} placeholder="Enter Wheel Size" />
//                                         </div>

//                                         <div className="col-lg-3 col-md-6 col-12">
//                                             <label className="fw-semibold">
//                                                 Module Size <span className="text-danger">*</span>
//                                             </label>
//                                             <input className="form-control mt-1"
//                                                 onChange={(e) => setRegister(prev => ({ ...prev, MouldSize: e.target.value }))}
//                                                 value={Register.MouldSize} placeholder="Enter Module Size" />
//                                         </div>

//                                         <div className="col-lg-3 col-md-6 col-12">
//                                             <label className="fw-semibold">
//                                                 Grade <span className="text-danger">*</span>
//                                             </label>
//                                             <input className="form-control mt-1"
//                                                 onChange={(e) => setRegister(prev => ({ ...prev, Grade: e.target.value }))}
//                                                 value={Register.Grade} placeholder="Enter Grade" />
//                                         </div>
//                                     </div>
//                                 </div>
//                                 <div className="modal-footer">
//                                     {/* FIX 2: Clear button */}
//                                     <button type="button"
//                                         className="btn d-flex align-items-center gap-2"
//                                         onClick={handleClear}
//                                         style={btnOrange}>
//                                         <i className="bi bi-eraser"></i> Clear
//                                     </button>
//                                     <button type="button"
//                                         className="btn d-flex align-items-center gap-2"
//                                         onClick={handlecheck}
//                                         disabled={loading}
//                                         style={{ ...btnGreen, cursor: loading ? 'not-allowed' : 'pointer' }}>
//                                         {loading
//                                             ? <><span className="spinner-border spinner-border-sm me-1"></span> Saving...</>
//                                             : <><i className="bi bi-check2-circle"></i> Save</>
//                                         }
//                                     </button>
//                                 </div>
//                             </div>
//                         </div>
//                     </div>
//                 )}

//                 {/* ==================== UPLOAD MODAL ==================== */}
//                 {Uploadvisible && (
//                     <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
//                         <div className="modal-dialog modal-dialog-centered modal-lg modal-dialog-scrollable">
//                             <div className="modal-content card">
//                                 <div className="modal-header">
//                                     <h5 className="modal-title">Import Mould Data</h5>
//                                     <button type="button" className="btn-close"
//                                         onClick={() => setUploadvisible(false)}></button>
//                                 </div>
//                                 <div className="modal-body">
//                                     <div className="import-input">
//                                         <label className="form-label fw-semibold">Select File</label>
//                                         <input type="file" className="form-control"
//                                             accept=".csv, .xls, .xlsx"
//                                             onChange={handleUploadExcelSheet} />
//                                     </div>
//                                     <hr className="mt-2" />
//                                     <div className="download-sample-template text-center">
//                                         <p className="fw-semibold">Important ⚠</p>
//                                         <span className='text-danger'>
//                                             Download the template below. Enter data based on column names then upload here.
//                                         </span>
//                                         <a href="/FGMasterTemp.xlsx" className="nav-link text-decoration-underline mt-2" download>
//                                             Click to Download
//                                         </a>
//                                     </div>
//                                     <div className="text-center mt-3">
//                                         <button className="btn btn-danger mx-2"
//                                             onClick={() => setUploadvisible(false)}>Cancel</button>
//                                         <button className="btn btn-success mx-2"
//                                             onClick={handleUploadData}>Upload Data</button>
//                                     </div>
//                                 </div>
//                             </div>
//                         </div>
//                     </div>
//                 )}

//                 {/* ==================== MAIN CARD ==================== */}
//                 <div className='card'>
//                     <div className='card-header d-flex justify-content-between align-items-center'
//                         style={{ background: '#106FB2' }}>
//                         <h4 className='mb-0 text-white d-flex align-items-center gap-2'>
//                             <i className="bi bi-list-ul me-2"></i> Mould Master
//                         </h4>
//                         <i className="bi bi-x-lg text-white fs-4 me-2"
//                             style={{ cursor: 'pointer' }}
//                             onClick={() => navigate(-1)} />
//                     </div>

//                     <div className='card-body py-3'>

//                         {/* TOOLBAR */}
//                         <div className='d-flex justify-content-end align-items-center flex-wrap mb-3 gap-2'>

//                             {/* LEFT: Location filter + Search */}
//                             {/* <div className="d-flex align-items-center gap-2 flex-wrap">
//                                 <select
//                                     className="form-select"
//                                     style={{ maxWidth: '220px' }}
//                                     value={selectedLocation}
//                                     onChange={(e) => handleLocationFilter(e.target.value)}
//                                 >
//                                     <option value="">All Locations</option>
//                                     {LocationData.map((loc, idx) => (
//                                         <option key={idx} value={loc.LocationCode}>
//                                             {loc.LocationCode} - {loc.LocationName}
//                                         </option>
//                                     ))}
//                                 </select>

//                                 <div className="input-group" style={{ maxWidth: '220px' }}>
//                                     <span className="input-group-text bg-light border-end-0">
//                                         <i className="bi bi-search text-primary"></i>
//                                     </span>
//                                     <input
//                                         type="text"
//                                         className="form-control border-start-0"
//                                         placeholder="Search FG..."
//                                         value={searchText}
//                                         onChange={handleSearchChange}
//                                     />
//                                 </div>
//                             </div> */}

//                             {/* RIGHT: Action buttons */}
//                             <div className="d-flex flex-wrap gap-2">
//                                 {!((pageData.addstatus === null || pageData.addstatus === 'i') && auth.UserStatus === 'A') && (
//                                     <CButton color="primary"
//                                         className="d-flex align-items-center gap-2"
//                                         onClick={() => setUploadvisible(true)}
//                                         style={btnBlue}>
//                                         <CIcon icon={cilCloudDownload} /> Import
//                                     </CButton>
//                                 )}

//                                 <button
//                                     className="btn d-flex align-items-center gap-2"
//                                     data-bs-toggle="modal"
//                                     data-bs-target="#exampleModal"
//                                     style={btnRed}>
//                                     <i className="bi bi-cloud-download"></i> Export
//                                 </button>

//                                 {!((pageData.addstatus === null || pageData.addstatus === 'i') && auth.UserStatus === 'A') && (
//                                     <button
//                                         className="btn d-flex align-items-center gap-2"
//                                         onClick={() => { handleClear(); setIsModalVisible(true); }}
//                                         style={btnGreen}>
//                                         <CIcon icon={cilPlus} /> Add
//                                     </button>
//                                 )}
//                             </div>
//                         </div>

//                         {/* AG GRID */}
//                         <div style={{ height: "450px" }} className='ag-theme-quartz'>
//                             <AgGridReact
//                                 ref={gridRef}
//                                 rowData={rowData}
//                                 columnDefs={columdef}
//                                 defaultColDef={{ sortable: true, filter: true, resizable: true }}
//                                 rowSelection="multiple"
//                                 autoGroupColumnDef={autoGroupColumnDef}
//                                 pagination={pagination}
//                                 paginationPageSize={paginationPageSize}
//                                 paginationPageSizeSelector={paginationPageSizeSelector}
//                                 suppressRowClickSelection={true}
//                                 animateRows={true}
//                                 getRowHeight={() => 50}
//                             />
//                         </div>
//                     </div>
//                 </div>
//             </div>
//         </>
//     );
// };

// FGMaster.propTypes = {
//     auth: PropTypes.any.isRequired,
// };

// export default FGMaster;


import React, { useMemo, useState, useEffect, useRef } from 'react'
import { AgGridReact } from 'ag-grid-react';
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import axios from 'axios';
import Swal from 'sweetalert2';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import PropTypes from 'prop-types';
import { BallTriangle } from 'react-loader-spinner';
import { useLocation, useNavigate } from "react-router-dom";
import { CButton } from '@coreui/react';
import logo from '../../assets/images/Cumi_logofull-Nobg.png';
import { FaEdit, FaEye } from 'react-icons/fa';
import { getConfig } from 'src/config';
import CIcon from '@coreui/icons-react';
import { cilPlus, cilTrash, cilBrush } from '@coreui/icons';

const MouldMaster = ({ auth }) => {
    const API_URL = getConfig().REACT_APP_API_URL;
    const navigate = useNavigate();
    const location = useLocation();
    const gridRef = useRef(null);

    const [loading, setLoading] = useState(false);
    const [rowData, setRowData] = useState([]);
    const [isModalVisible, setIsModalVisible] = useState(false);

    // ======================== PERMISSIONS (from Configure.jsx: state={{ permission, screenId: 'AC006' }}) ========================
    let permission = location.state?.permission;
    if (permission) {
        localStorage.setItem('mouldMasterPermission', JSON.stringify(permission));
    } else {
        const stored = localStorage.getItem('mouldMasterPermission');
        permission = stored ? JSON.parse(stored) : {};
    }

    const canAdd = auth.UserStatus === 'SA' || permission?.AddStatus === 'a';
    const canEdit = auth.UserStatus === 'SA' || permission?.EditStatus === 'a';
    const canDelete = auth.UserStatus === 'SA' || permission?.DeleteStatus === 'a';

    // ======================== REGISTER — only the 4 fields on the form ========================
    const initialRegister = {
        Id: '',
        ItemCode: '',
        WheelSize: '',
        ModuleSize: '',
        Grade: ''
    };

    const [Register, setRegister] = useState(initialRegister);

    const handleClear = () => {
        setRegister(initialRegister);
    };

    // ======================== FETCH ALL (branch-scoped) ========================
    const fetchData = async () => {
        setLoading(true);
        try {
            const response = await axios.post(`${API_URL}/MouldMaster`, {
                mode: 'A',
                branchid: auth.branchid,
                BranchAccess: auth.UserStatus === 'SA' ? null : auth.BranchAccess
            });
            setRowData(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            console.error('Error fetching Mould details:', error);
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
            { key: 'ItemCode', message: 'Please Enter Item Code' },
            { key: 'WheelSize', message: 'Please Enter Wheel Size' },
            { key: 'ModuleSize', message: 'Please Enter Module Size' },
            { key: 'Grade', message: 'Please Enter Grade' },
        ];

        for (const field of fieldsToCheck) {
            if (!String(Register[field.key] || '').trim()) {
                Swal.fire({ title: field.message, icon: 'warning', confirmButtonText: 'Done' });
                return false;
            }
        }
        return true;
    };

    // ======================== INSERT ========================
    const handlecheck = async () => {
        if (!validateFields()) return;

        try {
            const alldata = {
                ...Register,
                CreatedBy: auth.employeename,
                branchid: auth.branchid,
                mode: 'I'
            };
            const response = await axios.post(`${API_URL}/MouldMaster`, alldata);
            console.log("🚀 ~ handlecheck ~ response:", response)
            const result = response.data?.[0];
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
        } catch (err) {
            console.error(err);
            Swal.fire({
                title: 'Error',
                text: err.response?.data?.message || err.response?.data?.error || err.message || 'Unable to save Mould details',
                icon: 'error'
            });
        }
};

// ======================== LOAD FOR EDIT / VIEW ========================
// Grid already returns the full record, so no extra fetch needed.
const handleEdit = (data) => {
    setRegister({
        Id: data.Id,
        ItemCode: data.ItemCode,
        WheelSize: data.WheelSize,
        ModuleSize: data.ModuleSize,
        Grade: data.Grade
    });
};

// ======================== UPDATE ========================
const handlechange = async () => {
    if (!validateFields()) return;

    try {
        const alldata = {
            ...Register,
            UpdatedBy: auth.employeename,
            mode: 'U'
        };
        const response = await axios.post(`${API_URL}/MouldMaster`, alldata);
        const result = response.data?.[0];
        if (result?.StatusCode === 0) {
            Swal.fire({ title: result.Message, icon: 'warning' });
            return;
        }
        Swal.fire({ title: 'Updated Successfully', icon: 'success', confirmButtonText: 'Done' })
            .then(() => {
                handleClear();
                fetchData();
            });
    } catch (err) {
        console.error(err);
        Swal.fire({ title: 'Error', text: 'Unable to update Mould details', icon: 'error' });
    }
};

// ======================== DELETE ========================
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
        const alldata = { Id: data.Id, UpdatedBy: auth.employeename, mode: 'D' };
        const response = await axios.post(`${API_URL}/MouldMaster`, alldata);
        if (response.status === 200) {
            Swal.fire({ title: 'Deleted Successfully', icon: 'success', confirmButtonText: 'Done' });
            fetchData();
        }
    } catch (error) {
        console.error(error);
        Swal.fire({ title: 'Error', text: 'Unable to delete Mould', icon: 'error' });
    } finally {
        setLoading(false);
    }
};

// ======================== EXPORT ========================
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

        const doc = new jsPDF({ format: 'a4', orientation: 'landscape' });
        const pageWidth = doc.internal.pageSize.width;

        const columnMapping = [
            { header: 'Item Code', key: 'ItemCode' },
            { header: 'Wheel Size', key: 'WheelSize' },
            { header: 'Module Size', key: 'ModuleSize' },
            { header: 'Grade', key: 'Grade' },
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
                doc.text('Mould Master', pageWidth / 2, 15, { align: 'center' });
                doc.setFontSize(10);
                doc.text(`Page ${data.pageNumber}`, pageWidth / 2, doc.internal.pageSize.height - 10, { align: 'center' });
            }
        });
        doc.save('Mould_Master.pdf');
    } catch (error) {
        console.error(error);
        alert('Failed to generate PDF');
    } finally {
        setLoading(false);
    }
};

const onExportClick = () => {
    gridRef.current.api.exportDataAsCsv({
        fileName: 'Mould_Details.csv',
        columnKeys: ['ItemCode', 'WheelSize', 'ModuleSize', 'Grade', 'CreatedDate']
    });
};

// ======================== RENDERERS ========================
const ViewRenderer = (params) => (
    <button className="btn btn-hover-effect" data-bs-toggle="modal" data-bs-target="#exampleModalView"
        onClick={() => setRegister(params.data)}>
        <FaEye className="text-primary cursor-pointer fs-3" title="View" />
    </button>
);

const EditRenderer = (params) => {
    if (!canEdit) return null;
    return (
        <div>
            <button
                onClick={() => handleEdit(params.data)}
                data-bs-toggle="modal" data-bs-target="#exampleModalEdit"
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
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'linear-gradient(135deg, #007bff, #00b4d8)';
                    e.currentTarget.style.transform = 'translateY(0)';
                }}
            >
                <FaEdit className="fs-5" title="Edit" />
            </button>
        </div>
    );
};

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
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'linear-gradient(135deg, #ff4d4d, #ff1a1a)';
                    e.currentTarget.style.transform = 'translateY(0)';
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
    { headerName: 'Item Code', field: 'ItemCode', filter: true, headerClass: 'agheader', floatingFilter: true, flex: 1, minWidth: 140 },
    { headerName: 'Wheel Size', field: 'WheelSize', filter: true, headerClass: 'agheader', floatingFilter: true, flex: 1, minWidth: 120 },
    { headerName: 'Module Size', field: 'ModuleSize', filter: true, headerClass: 'agheader', floatingFilter: true, flex: 1, minWidth: 130 },
    { headerName: 'Grade', field: 'Grade', filter: true, headerClass: 'agheader', floatingFilter: true, flex: 1, minWidth: 100 },
    {
        headerName: 'Created Date', field: 'CreatedDate', filter: true, headerClass: 'agheader', floatingFilter: true, flex: 1, minWidth: 160,
        valueGetter: (params) => {
            const date = params.data?.CreatedDate;
            if (!date) return '-';
            const d = new Date(date);
            return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`;
        }
    },
    { headerName: 'Created By', field: 'CreatedBy', filter: true, headerClass: 'agheader', floatingFilter: true, flex: 1, minWidth: 120 },
    { headerName: 'View', field: 'View', headerClass: 'agheader', cellRenderer: ViewRenderer, width: 80, pinned: 'right' },
    { headerName: 'Edit', field: 'Edit', headerClass: 'agheader', cellRenderer: EditRenderer, width: 80, pinned: 'right' },
    { headerName: 'Delete', field: 'Delete', headerClass: 'agheader', cellRenderer: DeleteRenderer, width: 90, pinned: 'right' },
];

const autoGroupColumnDef = useMemo(() => ({
    headerCheckboxSelection: true, field: 'Id', flex: 1, minWidth: 240,
    cellRendererParams: { checkbox: true }
}), []);

// ======================== FORM FIELDS (shared by Add/Edit/View) ========================
const renderFields = (disabled = false) => (
    <div className="row">
        {[
            { label: 'Item Code', key: 'ItemCode' },
            { label: 'Wheel Size', key: 'WheelSize' },
            { label: 'Module Size', key: 'ModuleSize' },
            { label: 'Grade', key: 'Grade' },
        ].map(({ label, key }) => (
            <div className="col-lg-3 col-md-6 col-12 mt-3" key={key}>
                <label>
                    {label} {!disabled && <span className="text-danger">*</span>}
                </label>
                <input
                    type="text"
                    className="form-control"
                    value={Register[key] || ''}
                    disabled={disabled}
                    placeholder={disabled ? '' : `Enter ${label}`}
                    onChange={(e) => !disabled && setRegister({ ...Register, [key]: e.target.value })}
                />
            </div>
        ))}
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
                            <h1 className="modal-title fs-5 text-white">View Mould Details</h1>
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
                            <h1 className="modal-title fs-5 text-white">Edit Mould Details</h1>
                            <button type="button" className="btn-close btn-close-white me-2" data-bs-dismiss="modal" onClick={handleClear}></button>
                        </div>
                        <div className="modal-body">{renderFields(false)}</div>
                        <div className="modal-footer">
                            <CButton data-bs-dismiss="modal" onClick={handleClear}
                                style={{ background: 'linear-gradient(135deg, #616161, #616161)', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 600, padding: '10px 18px' }}>
                                <CIcon icon={cilBrush} /> Clear
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

            {/* Add Modal — matches the screenshot: X to close, Clear + Save in footer (no separate Cancel) */}
            {isModalVisible && (
                <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-xl modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header p-2" style={{ background: '#3f77d2' }}>
                                <h1 className="modal-title fs-5 text-white">Add Mould Details</h1>
                                <button type="button" className="btn-close btn-close-white me-2"
                                    onClick={() => { handleClear(); setIsModalVisible(false); }}></button>
                            </div>
                            <div className="modal-body">{renderFields(false)}</div>
                            <div className="modal-footer">
                                <button type="button" onClick={handleClear}
                                    style={{
                                        background: 'linear-gradient(135deg, #ff9800, #f57c00)',
                                        color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 600,
                                        padding: '10px 18px', display: 'flex', alignItems: 'center', gap: '6px'
                                    }}>
                                    <CIcon icon={cilBrush} /> Clear
                                </button>
                                <button type="button" onClick={handlecheck}
                                    style={{
                                        background: 'linear-gradient(135deg, #00c853, #009624)', color: '#fff',
                                        border: 'none', borderRadius: '12px', fontWeight: 600, padding: '10px 22px',
                                        display: 'flex', alignItems: 'center', gap: '6px'
                                    }}>
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
                        <i className="fas fa-cog fs-4"></i> Mould Master
                    </h4>
                    <button className="btn-close btn-close-white"
                        onClick={() => navigate("/Settings/Configure")}></button>
                </div>

                <div className="d-flex justify-content-end mt-2 gap-2 px-5">
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

MouldMaster.propTypes = { auth: PropTypes.any.isRequired };
export default MouldMaster;