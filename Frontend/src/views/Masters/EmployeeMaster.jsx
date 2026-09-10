// import React, { useMemo, useState, useEffect, useRef, useCallback } from 'react';
// import { AgGridReact } from 'ag-grid-react';
// import "ag-grid-community/styles/ag-grid.css";
// import "ag-grid-community/styles/ag-theme-alpine.css";
// import axios from 'axios';
// import Swal from 'sweetalert2';
// import swal from 'sweetalert';
// import jsPDF from 'jspdf';
// import 'jspdf-autotable';
// import PropTypes from 'prop-types';
// import { BallTriangle } from 'react-loader-spinner';
// import { Link, useLocation, useNavigate } from "react-router-dom";
// import { Typeahead } from 'react-bootstrap-typeahead';
// import { CButton, CModal, CModalBody, CModalFooter, CModalTitle } from '@coreui/react';
// import logo from '../../assets/images/Cumi_logofull-Nobg.png';
// import { FaEdit, FaEye, FaUsers } from 'react-icons/fa';
// import Maleimg from '../../assets/images/avatars/man.png';
// import femaleimg from '../../assets/images/avatars/woman.png';
// import { getConfig } from 'src/config';
// import CIcon from '@coreui/icons-react';
// import { cilCloudDownload, cilPlus, cilTrash, cilX } from '@coreui/icons';
// import { CiSquarePlus } from 'react-icons/ci';

// const EmployeeMaster = ({ auth }) => {
//     const API_URL = getConfig().REACT_APP_API_URL;
//     const navigate = useNavigate();
//     const gridRef = useRef(null);
//     const fileInput = useRef(null);

//     // ======================== STATES ========================
//     const [loading, setLoading] = useState(false);
//     const [Uploadvisible, setUploadvisible] = useState(false);
//     const [uploadxl, setuploadxl] = useState(null);
//     const [image, setImage] = useState({ src: '', alt: '' });
//     const [Imagevisible, setImagevisible] = useState(false);
//     const [modalImage, setModalImage] = useState(null);
//     const [isModalVisible, setIsModalVisible] = useState(false);
//     const [rowData, setRowData] = useState([]);
//     const [message, setMessage] = useState('');
//     const [emailMessage, setEmailMessage] = useState('');
//     const [DepartmentDropDownData, SetDepartmentDropDownData] = useState([]);
//     const [DesignationDropDownData, SetDesignationDropDownData] = useState([]);

//     const defaultImage = "/uploads/New/Cubic.png";

//     const [Register, setRegister] = useState({
//         Id: '', CompanyCode: '', PlantCode: auth.PlantCode,
//         Empid: '', FirstName: '', LastName: '',
//         DOJ: '', DOB: '', Department: '', Division: '',
//         Section: '', email: '', Designation: '',
//         Contact: '', Status: '', Type: '',
//         Gender: '', Photo: '', Location: '',
//         CreatedBy: '', ID: ''
//     });

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

//     // ======================== FORMATTERS ========================
//     const formatDate = (date) => {
//         if (!date) return '';
//         const d = new Date(date);
//         if (isNaN(d.getTime())) return '';
//         return d.toISOString().split('T')[0];
//     };

//     // ======================== CLOSE MODAL ========================
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
//         setRegister({
//             Id: '', CompanyCode: '', PlantCode: auth.PlantCode,
//             Empid: '', FirstName: '', LastName: '',
//             DOJ: '', DOB: '', Department: '', Division: '',
//             Section: '', email: '', Designation: '',
//             Contact: '', Status: '', Type: '',
//             Gender: '', Photo: '', Location: '',
//             CreatedBy: '', ID: ''
//         });
//         setMessage('');
//         setEmailMessage('');
//         setImage({ src: '', alt: '' });
//     }, [auth.PlantCode]);

//     // ======================== FETCH DATA ========================
//     const fetchData = useCallback(async () => {
//         setLoading(true);
//         try {
//             const response = await axios.post(`${API_URL}/EmployeeConfig`, {
//                 mode: 'FetchEmployee',
//                 PlantCode: auth.PlantCode,
//                 Id: '', CompanyCode: '', Empid: '',
//                 FirstName: '', LastName: '', DOJ: '', DOB: '',
//                 Department: '', Division: '', Section: '',
//                 email: '', Designation: '', Contact: '',
//                 Status: '', Type: '', Gender: '',
//                 Photo: '', Location: '', CreatedBy: '', ID: ''
//             });
//             if (response.status === 200) {
//                 setRowData(Array.isArray(response.data) ? response.data : []);
//             }
//         } catch (error) {
//             console.error('Error fetching employee details:', error);
//         } finally {
//             setLoading(false);
//         }
//     }, [API_URL, auth.PlantCode]);

//     // ======================== DROPDOWN FETCHES ========================
//     const FetchDepartmentDropdown = useCallback(async () => {
//         try {
//             const response = await axios.post(`${API_URL}/EmployeeConfig`, {
//                 mode: 'GetDepartment', Id: ''
//             });
//             if (response.status === 200) SetDepartmentDropDownData(response.data || []);
//         } catch (err) { console.log(err); }
//     }, [API_URL, auth.PlantCode]);

//     const FetchDesignationDropdown = useCallback(async () => {
//         try {
//             const response = await axios.post(`${API_URL}/EmployeeConfig`, {
//                 mode: 'GetDesignation', Id: ''
//             });
//             if (response.status === 200) SetDesignationDropDownData(response.data || []);
//         } catch (err) { console.log(err); }
//     }, [API_URL, auth.PlantCode]);

//     // ======================== USE EFFECT ========================
//     useEffect(() => {
//         fetchData();
//         FetchDepartmentDropdown();
//         FetchDesignationDropdown();
//         const interval = setInterval(() => { fetchData(); }, 60000);
//         return () => clearInterval(interval);
//     }, [fetchData, FetchDepartmentDropdown, FetchDesignationDropdown]);

//     // ======================== IMAGE HANDLER ========================
//     const handleImg = (event) => {
//         const file = event.target.files[0];
//         if (file && file.size <= 2 * 1024 * 1024) {
//             const reader = new FileReader();
//             reader.onloadend = () => {
//                 setRegister(prev => ({ ...prev, Photo: reader.result }));
//                 setImage({ src: URL.createObjectURL(file), alt: file.name });
//             };
//             reader.readAsDataURL(file);
//         } else {
//             alert('File size should be less than or equal to 2MB');
//         }
//     };

//     const handleImageClick = (imageUrl) => {
//         setModalImage(imageUrl);
//         setImagevisible(true);
//     };

//     // ======================== IMAGE UPLOAD HELPER ========================
//     const uploadImage = async () => {
//         const file = fileInput.current?.files?.[0];
//         if (!file) return '';
//         const formData = new FormData();
//         formData.append('image', file);
//         try {
//             const res = await axios.post(`${API_URL}/api/upload`, formData, {
//                 headers: { 'Content-Type': 'multipart/form-data' }
//             });
//             return res.data.success ? res.data.file.path : '';
//         } catch (err) {
//             console.error('Image upload error:', err);
//             return '';
//         }
//     };

//     // ======================== VIEW HANDLER ========================
//     const handleView = useCallback(async (data) => {
//         try {
//             const response = await axios.post(`${API_URL}/EmployeeConfig`, {
//                 mode: 'E', Id: data.Id
//             });
//             if (Array.isArray(response.data) && response.data.length > 0) {
//                 setRegister(prev => ({ ...prev, ...response.data[0] }));
//             }
//         } catch (error) {
//             console.log(error);
//         }
//     }, [API_URL]);

//     // ======================== EDIT HANDLER ========================
//     const handleEdit = useCallback(async (data) => {
//         try {
//             const response = await axios.post(`${API_URL}/EmployeeConfig`, {
//                 mode: 'E', Id: data.Id
//             });
//             if (Array.isArray(response.data) && response.data.length > 0) {
//                 setRegister(prev => ({ ...prev, ...response.data[0] }));
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
//             icon: "warning",
//             showCancelButton: true,
//             cancelButtonText: 'Cancel',
//             confirmButtonText: 'Delete',
//         });
//         if (result.isConfirmed) {
//             setLoading(true);
//             try {
//                 await axios.post(`${API_URL}/EmployeeConfig`, {
//                     mode: 'D', Id: data.Id
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

//     // ======================== RENDERERS ========================
//     const ViewRenderer = useCallback((params) => {
//         if ((pageData.viewstatus === null || pageData.viewstatus === 'i') && auth.UserStatus === 'A') {
//             return null;
//         }
//         return (
//             <div>
//                 <button className="btn btn-hover-effect"
//                     onClick={() => handleView(params.data)}
//                     data-bs-toggle="modal"
//                     data-bs-target="#exampleModalView">
//                     <FaEye className="text-primary cursor-pointer fs-3" title="View" />
//                 </button>
//             </div>
//         );
//     }, [handleView, pageData, auth.UserStatus]);

//     const EditRenderer = useCallback((params) => {
//         if ((pageData.editstatus === null || pageData.editstatus === 'i') && auth.UserStatus === 'A') {
//             return null;
//         }
//         return (
//             <div>
//                 <button
//                     onClick={() => handleEdit(params.data)}
//                     data-bs-toggle="modal"
//                     data-bs-target="#exampleModalEdit"
//                     className='mt-1 ms-2'
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
//                     }}>
//                     <FaEdit className="fs-5" title="Edit" />
//                 </button>
//             </div>
//         );
//     }, [handleEdit, pageData, auth.UserStatus]);

//     const DeleteRenderer = useCallback((params) => {
//         if ((pageData.deletestatus === null || pageData.deletestatus === 'i') && auth.UserStatus === 'A') {
//             return null;
//         }
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
//                     }}>
//                     <CIcon icon={cilTrash} size="xl" />
//                 </button>
//             </div>
//         );
//     }, [handleDelete, pageData, auth.UserStatus]);

//     // ======================== PHOTO CELL RENDERER ========================
//     const PhotoRenderer = useCallback((params) => {
//         const gender = params.data.Gender;
//         const iconSrc = gender?.toLowerCase() === "male" ? Maleimg : femaleimg;
//         const isEmpty = !params.value || params.value === 'NULL' || params.value === 'undefined' || params.value === '';

//         const src = isEmpty ? iconSrc : `${API_URL}/${params.value}`;
//         const alt = isEmpty ? (gender?.toLowerCase() === "male" ? "Male" : "Female") : "Employee Photo";

//         return (
//             <img src={src} alt={alt}
//                 className="border border-dark"
//                 style={{ width: "50px", height: "50px", borderRadius: "50%", objectFit: "cover", display: "block", cursor: 'pointer' }}
//                 onClick={() => handleImageClick(src)}
//                 onError={(e) => { e.target.src = iconSrc; }}
//             />
//         );
//     }, [API_URL]);

//     // ======================== COLUMN DEFINITIONS ========================
//     const columdef = useMemo(() => [
//         { headerCheckboxSelection: true, checkboxSelection: true, width: 60 },
//         {
//             headerName: "Photo", field: "Photo",
//             filter: false, sortable: false, floatingFilter: false, editable: false,
//             cellRenderer: PhotoRenderer, width: 80
//         },
//         { headerName: "Employee ID", field: "ID", filter: true, headerClass: 'agheader', floatingFilter: true },
//         { headerName: "First Name", field: "FirstName", filter: true, headerClass: 'agheader', floatingFilter: true },
//         { headerName: "Last Name", field: "LastName", filter: true, headerClass: 'agheader', floatingFilter: true },
//         { headerName: "Department", field: "Department", filter: true, headerClass: 'agheader', floatingFilter: true },
//         // { headerName: "Division", field: "Division", filter: true, headerClass: 'agheader', floatingFilter: true },
//         // { headerName: "Section", field: "Section", filter: true, headerClass: 'agheader', floatingFilter: true },
//         { headerName: "Email", field: "email", filter: true, headerClass: 'agheader', floatingFilter: true },
//         { headerName: "Designation", field: "Designation", filter: true, headerClass: 'agheader', floatingFilter: true },
//         { headerName: "Contact", field: "Contact", filter: true, headerClass: 'agheader', floatingFilter: true },
//         { headerName: "DOJ", field: "DOJ", filter: true, headerClass: 'agheader', floatingFilter: true },
//         { headerName: "DOB", field: "DOB", filter: true, headerClass: 'agheader', floatingFilter: true },
//         { headerName: "Gender", field: "Gender", filter: true, headerClass: 'agheader', floatingFilter: true },
//         { headerName: "Created Date", field: "CreatedDate", filter: true, headerClass: 'agheader', floatingFilter: true },
//         { headerName: "View", pinned: 'right', field: "View", headerClass: 'agheader', cellRenderer: ViewRenderer, width: 80, filter: false, floatingFilter: false },
//         { headerName: 'Edit', pinned: 'right', field: "Edit", headerClass: 'agheader', cellRenderer: EditRenderer, width: 80, filter: false, floatingFilter: false },
//         { headerName: "Delete", pinned: 'right', field: "Delete", headerClass: 'agheader', cellRenderer: DeleteRenderer, width: 90, filter: false, floatingFilter: false },
//     ], [ViewRenderer, EditRenderer, DeleteRenderer, PhotoRenderer]);

//     const autoGroupColumnDef = useMemo(() => ({
//         headerCheckboxSelection: true,
//         field: "id", flex: 1, minWidth: 240,
//         cellRendererParams: { checkbox: true },
//     }), []);

//     // ======================== VALIDATION ========================
//     const handleInputChange = (event) => {
//         const value = event?.target?.value ?? '';
//         if (/^\d*$/.test(value)) {
//             if (value.length === 10) setMessage('Mobile number is valid.');
//             else if (value.length === 0) setMessage('');
//             else setMessage('Mobile number must be exactly 10 digits.');
//         } else {
//             setMessage('Only digits are allowed.');
//         }
//     };

//     const handleEmailChange = (event) => {
//         const value = event?.target?.value ?? '';
//         setRegister(prev => ({ ...prev, email: value }));
//         const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//         if (emailRegex.test(value)) setEmailMessage("Email address is valid.");
//         else if (value.length === 0) setEmailMessage('');
//         else setEmailMessage("Invalid email address.");
//     };

//     // ======================== SAVE INSERT ========================
//     const handlecheck = async () => {
//         if (!Register.FirstName) {
//             Swal.fire({ title: 'Please Enter First Name', icon: 'warning' });
//             return;
//         }

//         const isDuplicate = rowData.some((item) => {
//             const itemEmpid = item.Empid?.toLowerCase() ?? '';
//             const itemID = item.ID?.toLowerCase() ?? '';
//             const regEmpid = Register.Empid?.toLowerCase() ?? '';
//             const regID = Register.ID?.toLowerCase() ?? '';
//             return itemEmpid === regEmpid || (regID && itemID === regID);
//         });

//         if (isDuplicate) {
//             swal({ text: "This Employee ID or ID is Already Existing", icon: "warning" });
//             return;
//         }

//         setLoading(true);
//         try {
//             const imagePath = await uploadImage();
//             const alldata = {
//                 ...Register,
//                 CreatedBy: auth.employeename,
//                 mode: 'I',
//                 Photo: imagePath
//             };
//             await axios.post(`${API_URL}/EmployeeConfig`, alldata);
//             setIsModalVisible(false);
//             handleClear();
//             await fetchData();
//             Swal.fire({
//                 title: 'Saved Successfully',
//                 text: 'Employee has been added.',
//                 icon: 'success',
//                 confirmButtonText: 'Done'
//             });
//         } catch (err) {
//             console.error('Save error:', err);
//             Swal.fire({ title: 'Error', text: 'Failed to save. Please try again.', icon: 'error' });
//         } finally {
//             setLoading(false);
//         }
//     };

//     // ======================== UPDATE ========================
//     const handlechange = async () => {
//         setLoading(true);
//         try {
//             const imagePath = await uploadImage();
//             const alldata = {
//                 ...Register,
//                 CreatedBy: auth.EmployeeName,
//                 mode: 'U',
//                 Photo: imagePath
//             };
//             await axios.post(`${API_URL}/EmployeeConfig`, alldata);
//             closeModal('exampleModalEdit');
//             handleClear();
//             await fetchData();
//             Swal.fire({
//                 title: 'Updated Successfully',
//                 text: 'Employee has been updated.',
//                 icon: 'success',
//                 confirmButtonText: 'Done'
//             });
//         } catch (err) {
//             console.error('Update error:', err);
//             Swal.fire({ title: 'Error', text: 'Failed to update. Please try again.', icon: 'error' });
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
//                 Swal.fire({ title: 'Invalid File Format', text: 'Please select a valid CSV or Excel file.', icon: 'warning' });
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
//             text: "Once uploaded, you will not be able to check the Employee list immediately!",
//             icon: "warning",
//             showCancelButton: true,
//             cancelButtonText: 'Cancel',
//             confirmButtonText: 'Upload',
//         });
//         if (result.isConfirmed) {
//             setLoading(true);
//             try {
//                 const formData = new FormData();
//                 formData.append('file', uploadxl);
//                 formData.append('CreatedBy', auth.employeename);
//                 const response = await axios.post(`${API_URL}/EmployeeUploadData`, formData, {
//                     headers: { 'Content-Type': 'multipart/form-data' },
//                 });
//                 const { uploadcount, unuploadedFilePath } = response.data;
//                 await fetchData();
//                 if (unuploadedFilePath) {
//                     swal({
//                         title: `Total Uploaded: ${uploadcount}`,
//                         text: "Some records could not be uploaded. Download the error file.",
//                         icon: 'warning',
//                         buttons: { cancel: "OK", download: { text: "Download File", value: "download" } },
//                     }).then((value) => {
//                         if (value === "download") {
//                             const link = document.createElement('a');
//                             link.href = `${API_URL}${unuploadedFilePath}`;
//                             link.setAttribute('download', 'unuploaded_Employee_data.xlsx');
//                             document.body.appendChild(link);
//                             link.click();
//                             link.remove();
//                         }
//                     });
//                 } else {
//                     Swal.fire({
//                         title: `Total Uploaded: ${uploadcount}`,
//                         text: 'All data uploaded successfully',
//                         icon: 'success'
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
//             const doc = new jsPDF({ format: 'a3', orientation: 'landscape' });
//             const title = 'Employee Master';
//             const currentUser = auth.employeename || 'Unknown User';
//             const currentDateTime = new Date().toLocaleString();
//             const pageWidth = doc.internal.pageSize.width;

//             doc.addImage(logo, 'PNG', 10, 10, 15, 15);
//             doc.setFontSize(14);
//             doc.setFont("helvetica", "bold");
//             doc.text(title, pageWidth / 2, 15, { align: 'center' });

//             if (filteredData.length > 0) {
//                 const columnMapping = [
//                     { header: "Employee ID", key: "ID" },

//                     { header: "First Name", key: "FirstName" },
//                     { header: "Last Name", key: "LastName" },
//                     { header: "Department", key: "Department" },
//                     { header: "Division", key: "Division" },
//                     { header: "Section", key: "Section" },
//                     { header: "Email", key: "email" },
//                     { header: "Designation", key: "Designation" },
//                     { header: "Contact", key: "Contact" },
//                     { header: "DOJ", key: "DOJ" },
//                     { header: "DOB", key: "DOB" },
//                     { header: "Gender", key: "Gender" },
//                     { header: "Created Date", key: "CreatedDate" },
//                 ];
//                 const columnHeaders = columnMapping.map(col => col.header);
//                 const data = filteredData.map(obj => columnMapping.map(col => obj[col.key] || ''));
//                 doc.autoTable({
//                     head: [columnHeaders],
//                     body: data,
//                     margin: { top: 30, right: 10, left: 10, bottom: 20 },
//                     theme: 'grid',
//                     styles: { fontSize: 7, halign: "center", valign: "middle", overflow: 'linebreak', lineColor: [0, 0, 0], lineWidth: 0.1 },
//                     headStyles: { fillColor: [63, 119, 210], textColor: [255, 255, 255], lineColor: [0, 0, 0], lineWidth: 0.1, fontStyle: 'bold' },
//                     bodyStyles: { fillColor: [245, 245, 245], textColor: [0, 0, 0], lineColor: [0, 0, 0], lineWidth: 0.1 },
//                     didDrawPage: (data) => {
//                         const pw = doc.internal.pageSize.width;
//                         const ph = doc.internal.pageSize.height;
//                         doc.addImage(logo, 'PNG', 10, 10, 15, 15);
//                         doc.setFontSize(10);
//                         doc.text(`User: ${currentUser}`, pw - 10, 12, { align: 'right' });
//                         doc.text(`Date: ${currentDateTime}`, pw - 10, 18, { align: 'right' });
//                         doc.setFontSize(14);
//                         doc.setFont("helvetica", "bold");
//                         doc.text(title, pw / 2, 15, { align: 'center' });
//                         doc.setFontSize(10);
//                         doc.text(`Page ${data.pageNumber}`, pw / 2, ph - 10, { align: 'center' });
//                         doc.setFontSize(8);
//                         doc.text(`Printed By: ${currentUser} | Printed On: ${new Date().toLocaleDateString()} | Time: ${new Date().toLocaleTimeString()}`, pw / 2, ph - 15, { align: 'center' });
//                         doc.text(`Note: This document has been generated electronically and is valid without signature.`, pw / 2, ph - 8, { align: 'center' });
//                     }
//                 });
//                 doc.save('Employee_Master.pdf');
//             } else {
//                 Swal.fire({ title: 'No data available to export', icon: 'warning' });
//             }
//         } catch (error) {
//             console.error("Error generating PDF:", error);
//             Swal.fire({ title: 'Failed to generate PDF', icon: 'error' });
//         } finally {
//             setLoading(false);
//         }
//     };

//     // ======================== CSV EXPORT ========================
//     const onExportClick = () => {
//         gridRef.current.api.exportDataAsCsv({
//             fileName: 'Employees_Details.csv',
//             columnKeys: ['ID', 'FirstName', 'LastName', 'Department', 'Division', 'Section', 'email', 'Designation', 'Contact', 'DOJ', 'DOB', 'Gender', 'CreatedDate'],
//         });
//     };

//     // ======================== RETURN JSX ========================
//     return (
//         <>
//             {loading && (
//                 <div className="loading-overlay">
//                     <div className="loading-spinner">
//                         <BallTriangle height={100} width={100} radius={5} color="#4fa94d"
//                             ariaLabel="ball-triangle-loading" wrapperStyle={{ justifyContent: 'center' }} visible={true} />
//                     </div>
//                 </div>
//             )}

//             {/* ==================== EXPORT MODAL ==================== */}
//             <div className="modal fade" id="exampleModal" tabIndex="-1" aria-hidden="true">
//                 <div className="modal-dialog modal-dialog-centered">
//                     <div className="modal-content">
//                         <div className="modal-header">
//                             <h5 className="modal-title">Download Format</h5>
//                             <button type="button" className="btn-close" data-bs-dismiss="modal"></button>
//                         </div>
//                         <div className="modal-body">
//                             <div className="d-flex justify-content-evenly">
//                                 <div className="btn btn-success" onClick={onExportClick}>
//                                     <i className="bi bi-file-earmark-spreadsheet fs-1"></i>
//                                 </div>
//                                 <div className="btn btn-danger" onClick={generatePDF}>
//                                     <i className="bi bi-filetype-pdf fs-1"></i>
//                                 </div>
//                             </div>
//                             <div className="d-flex justify-content-evenly mt-2">
//                                 <span className="text-muted">Download Excel</span>
//                                 <span className="text-muted">Download PDF</span>
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//             </div>

//             {/* ==================== VIEW MODAL ==================== */}
//             <div className="modal fade" id="exampleModalView" tabIndex="-1" aria-hidden="true">
//                 <div className="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
//                     <div className="modal-content">
//                         <div className="modal-header p-2" style={{ background: 'linear-gradient(135deg, #28a745, #5cb85c)' }}>
//                             <h5 className="modal-title text-white">Employee Information</h5>
//                             <button type="button" className="btn-close btn-close-white" data-bs-dismiss="modal"></button>
//                         </div>
//                         <div className="modal-body">
//                             <div className="row g-3">
//                                 <div className="col-12">
//                                     <img
//                                         src={
//                                             (Register.Photo && Register.Photo !== 'undefined' && Register.Photo !== 'NULL' && Register.Photo !== null && Register.Photo !== '')
//                                                 ? `${API_URL}/${Register.Photo}`
//                                                 : Register.Gender === 'Male' ? Maleimg : femaleimg
//                                         }
//                                         alt='Employee'
//                                         className="border border-dark"
//                                         style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover' }}
//                                     />
//                                 </div>

//                                 <div className="col-lg-3"><label className="form-label text-muted">Employee ID</label><p className="fw-semibold">{Register.ID || '-'}</p></div>
//                                 <div className="col-lg-3"><label className="form-label text-muted">First Name</label><p className="fw-semibold">{Register.FirstName || '-'}</p></div>
//                                 <div className="col-lg-3"><label className="form-label text-muted">Last Name</label><p className="fw-semibold">{Register.LastName || '-'}</p></div>
//                                 <div className="col-lg-3"><label className="form-label text-muted">Department</label><p className="fw-semibold">{Register.Department || '-'}</p></div>
//                                 {/* <div className="col-lg-3"><label className="form-label text-muted">Division</label><p className="fw-semibold">{Register.Division || '-'}</p></div> */}
//                                 <div className="col-lg-3"><label className="form-label text-muted">Designation</label><p className="fw-semibold">{Register.Designation || '-'}</p></div>
//                                 <div className="col-lg-3"><label className="form-label text-muted">Contact</label><p className="fw-semibold">{Register.Contact || '-'}</p></div>
//                                 {/* <div className="col-lg-3"><label className="form-label text-muted">Section</label><p className="fw-semibold">{Register.Section || '-'}</p></div> */}
//                                 <div className="col-lg-3"><label className="form-label text-muted">Gender</label><p className="fw-semibold">{Register.Gender || '-'}</p></div>
//                                 <div className="col-lg-3"><label className="form-label text-muted">Email</label><p className="fw-semibold text-break">{Register.email || '-'}</p></div>
//                                 <div className="col-lg-3"><label className="form-label text-muted">DOJ</label><p className="fw-semibold">{Register.DOJ || '-'}</p></div>
//                                 <div className="col-lg-3"><label className="form-label text-muted">DOB</label><p className="fw-semibold">{Register.DOB || '-'}</p></div>
//                                 <div className="col-lg-3"><label className="form-label text-muted">Created By</label><p className="fw-semibold">{Register.CreatedBy || '-'}</p></div>
//                                 <div className="col-lg-3"><label className="form-label text-muted">Created Date</label><p className="fw-semibold">{Register.CreatedDate || '-'}</p></div>
//                             </div>
//                         </div>
//                         <div className="modal-footer">
//                             <button type="button" className="btn btn-secondary" data-bs-dismiss="modal"
//                                 style={{ borderRadius: '10px' }}>
//                                 <i className="fas fa-times me-1"></i> Close
//                             </button>
//                         </div>
//                     </div>
//                 </div>
//             </div>

//             {/* ==================== EDIT MODAL ==================== */}
//             <div className="modal fade" id="exampleModalEdit" tabIndex="-1"
//                 data-bs-backdrop="static" data-bs-keyboard="false" aria-hidden="true">
//                 <div className="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
//                     <div className="modal-content">
//                         <div className="modal-header p-2" style={{ background: '#3f77d2' }}>
//                             <h5 className="modal-title text-white">Edit Employee Details</h5>
//                             <button type="button" className="btn-close btn-close-white"
//                                 data-bs-dismiss="modal" onClick={handleClear}></button>
//                         </div>
//                         <div className="modal-body">
//                             <div className="row g-3">
//                                 <div className="col-12">
//                                     <h6>Employee Image</h6>
//                                     <img
//                                         onClick={() => fileInput.current.click()}
//                                         src={
//                                             (Register.Photo && Register.Photo !== 'undefined' && Register.Photo !== 'NULL' && Register.Photo !== null && Register.Photo !== '')
//                                                 ? `${API_URL}/${Register.Photo}`
//                                                 : Register.Gender === 'Male' ? Maleimg : femaleimg
//                                         }
//                                         alt='Employee'
//                                         className="border border-dark"
//                                         style={{ width: '70px', height: '70px', borderRadius: '50%', objectFit: 'cover', cursor: 'pointer' }}
//                                     />
//                                     <input ref={fileInput} type="file" accept=".png, .jpg, .jpeg"
//                                         className="border d-none" onChange={handleImg} />
//                                 </div>

//                                 <div className="col-lg-3">
//                                     <label>Employee ID</label>
//                                     <input className="form-control"
//                                         onChange={(e) => setRegister(prev => ({ ...prev, ID: e.target.value }))}
//                                         value={Register.ID}
//                                         onKeyDown={(e) => {
//                                             if (/[^A-Za-z0-9 ]/.test(e.key) && !['Tab', 'Enter', 'Backspace'].includes(e.key)) e.preventDefault();
//                                         }}
//                                     />
//                                 </div>

//                                 <div className="col-lg-3">
//                                     <label>First Name</label>
//                                     <input className="form-control"
//                                         onChange={(e) => setRegister(prev => ({ ...prev, FirstName: e.target.value }))}
//                                         value={Register.FirstName}
//                                         onKeyDown={(e) => {
//                                             if (/[^A-Za-z. ]/.test(e.key) && !['Tab', 'Enter', 'Backspace'].includes(e.key)) e.preventDefault();
//                                         }}
//                                     />
//                                 </div>
//                                 <div className="col-lg-3">
//                                     <label>Last Name</label>
//                                     <input className="form-control"
//                                         onChange={(e) => setRegister(prev => ({ ...prev, LastName: e.target.value }))}
//                                         value={Register.LastName}
//                                         onKeyDown={(e) => {
//                                             if (/[^A-Za-z. ]/.test(e.key) && !['Tab', 'Enter', 'Backspace'].includes(e.key)) e.preventDefault();
//                                         }}
//                                     />
//                                 </div>
//                                 <div className="col-lg-3">
//                                     <label>Department</label>
//                                     <Typeahead id="dept-edit" labelKey="Department"
//                                         onChange={(selected) => setRegister(prev => ({ ...prev, Department: selected[0]?.Department || '' }))}
//                                         options={DepartmentDropDownData} placeholder="Select Department"
//                                         selected={Register.Department ? [{ Department: Register.Department }] : []}
//                                     />
//                                 </div>
//                                 {/* <div className="col-lg-3">
//                                     <label>Division</label>
//                                     <input className="form-control"
//                                         onChange={(e) => setRegister(prev => ({ ...prev, Division: e.target.value }))}
//                                         value={Register.Division} />
//                                 </div> */}
//                                 <div className="col-lg-3">
//                                     <label>Designation</label>
//                                     <Typeahead id="desig-edit" labelKey="Designation"
//                                         onChange={(selected) => setRegister(prev => ({ ...prev, Designation: selected[0]?.Designation || '' }))}
//                                         options={DesignationDropDownData} placeholder="Select Designation"
//                                         selected={Register.Designation ? [{ Designation: Register.Designation }] : []}
//                                     />
//                                 </div>
//                                 <div className="col-lg-3">
//                                     <label>Contact</label>
//                                     <input className="form-control"
//                                         onChange={(e) => setRegister(prev => ({ ...prev, Contact: e.target.value }))}
//                                         value={Register.Contact} maxLength={10} />
//                                 </div>
//                                 {/* <div className="col-lg-3">
//                                     <label>Section</label>
//                                     <input className="form-control"
//                                         onChange={(e) => setRegister(prev => ({ ...prev, Section: e.target.value }))}
//                                         value={Register.Section} />
//                                 </div> */}
//                                 <div className="col-lg-3">
//                                     <label>Gender</label>
//                                     <select className="form-select border border-2"
//                                         onChange={(e) => setRegister(prev => ({ ...prev, Gender: e.target.value }))}
//                                         value={Register.Gender}>
//                                         <option value="">Select Gender</option>
//                                         <option value='Male'>Male</option>
//                                         <option value='Female'>Female</option>
//                                         <option value='Others'>Others</option>
//                                     </select>
//                                 </div>
//                                 <div className="col-lg-3">
//                                     <label>Email</label>
//                                     <input className="form-control"
//                                         onChange={(e) => setRegister(prev => ({ ...prev, email: e.target.value }))}
//                                         value={Register.email} />
//                                 </div>
//                                 <div className="col-lg-3">
//                                     <label>DOJ</label>
//                                     <input type="date" className="form-control"
//                                         onChange={(e) => setRegister(prev => ({ ...prev, DOJ: e.target.value }))}
//                                         value={Register.DOJ || ''} />
//                                 </div>
//                                 <div className="col-lg-3">
//                                     <label>DOB</label>
//                                     <input type="date" className="form-control"
//                                         onChange={(e) => setRegister(prev => ({ ...prev, DOB: e.target.value }))}
//                                         value={Register.DOB || ''} />
//                                 </div>
//                             </div>
//                         </div>
//                         <div className="modal-footer">
//                             <button type="button" className="btn btn-secondary"
//                                 data-bs-dismiss="modal" onClick={handleClear}
//                                 style={{ borderRadius: '10px', padding: '9px 18px' }}>
//                                 <CIcon icon={cilX} /> Close
//                             </button>
//                             <button type="button"
//                                 className="btn d-flex align-items-center gap-2"
//                                 onClick={handlechange} disabled={loading}
//                                 style={{
//                                     background: 'linear-gradient(135deg, #8e2de2, #4a00e0)',
//                                     color: '#fff', border: 'none', borderRadius: '12px',
//                                     fontWeight: 600, padding: '10px 18px',
//                                     cursor: loading ? 'not-allowed' : 'pointer'
//                                 }}>
//                                 {loading
//                                     ? <><span className="spinner-border spinner-border-sm me-1"></span> Updating...</>
//                                     : <><i className="bi bi-arrow-repeat"></i> Update</>
//                                 }
//                             </button>
//                         </div>
//                     </div>
//                 </div>
//             </div>

//             {/* ==================== ADD MODAL ==================== */}
//             {isModalVisible && (
//                 <div className="modal fade show" style={{ display: 'block' }}>
//                     <div className="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
//                         <div className="modal-content">
//                             <div className="modal-header p-2" style={{ background: '#3f77d2' }}>
//                                 <h5 className="modal-title text-white">Add Employee</h5>
//                                 <button type="button" className="btn-close btn-close-white"
//                                     onClick={() => { setIsModalVisible(false); handleClear(); }}></button>
//                             </div>
//                             <div className="modal-body">
//                                 <div className="row g-3">
//                                     <div className="col-12">
//                                         <h6>Employee Image</h6>
//                                         <img
//                                             onClick={() => fileInput.current.click()}
//                                             src={image.src || defaultImage}
//                                             alt="Preview"
//                                             className="border border-dark"
//                                             style={{ width: '70px', height: '70px', borderRadius: '50%', objectFit: 'cover', cursor: 'pointer' }}
//                                         />
//                                         <input ref={fileInput} type="file" accept=".png, .jpg, .jpeg"
//                                             className="border d-none" onChange={handleImg} />
//                                     </div>

//                                     <div className="col-lg-3">
//                                         <label>Employee ID</label>
//                                         <input className="form-control"
//                                             onChange={(e) => setRegister(prev => ({ ...prev, ID: e.target.value }))}
//                                             value={Register.ID} placeholder='Enter ID'
//                                             onKeyDown={(e) => {
//                                                 if (/[^A-Za-z0-9 ]/.test(e.key) && !['Tab', 'Enter', 'Backspace'].includes(e.key)) e.preventDefault();
//                                             }}
//                                         />
//                                     </div>

//                                     <div className="col-lg-3">
//                                         <label>First Name <span className="text-danger">*</span></label>
//                                         <input className="form-control"
//                                             onChange={(e) => setRegister(prev => ({ ...prev, FirstName: e.target.value }))}
//                                             value={Register.FirstName} placeholder='Enter First Name'
//                                             onKeyDown={(e) => {
//                                                 if (/[^A-Za-z. ]/.test(e.key) && !['Tab', 'Enter', 'Backspace'].includes(e.key)) e.preventDefault();
//                                             }}
//                                         />
//                                     </div>
//                                     <div className="col-lg-3">
//                                         <label>Last Name</label>
//                                         <input className="form-control"
//                                             onChange={(e) => setRegister(prev => ({ ...prev, LastName: e.target.value }))}
//                                             value={Register.LastName} placeholder='Enter Last Name'
//                                             onKeyDown={(e) => {
//                                                 if (/[^A-Za-z]/.test(e.key) && !['Tab', 'Enter', 'Backspace'].includes(e.key)) e.preventDefault();
//                                             }}
//                                         />
//                                     </div>
//                                     <div className="col-lg-3">
//                                         <label>Department</label>
//                                         <div className='d-flex'>
//                                             <Typeahead id="dept-add" labelKey="Department"
//                                                 onChange={(selected) => setRegister(prev => ({ ...prev, Department: selected[0]?.Department || '' }))}
//                                                 options={DepartmentDropDownData} placeholder="Select Department" />
//                                             <Link to='/usercreation/config/department' className="add-btn-pulse">
//                                                 <CiSquarePlus className="fs-3" />
//                                             </Link>
//                                         </div>
//                                     </div>
//                                     {/* <div className="col-lg-3">
//                                         <label>Division</label>
//                                         <input className="form-control"
//                                             onChange={(e) => setRegister(prev => ({ ...prev, Division: e.target.value }))}
//                                             value={Register.Division} placeholder='Enter Division' />
//                                     </div> */}
//                                     <div className="col-lg-3">
//                                         <label>Designation</label>
//                                         <div className='d-flex'>
//                                             <Typeahead id="desig-add" labelKey="Designation"
//                                                 onChange={(selected) => setRegister(prev => ({ ...prev, Designation: selected[0]?.Designation || '' }))}
//                                                 options={DesignationDropDownData} placeholder="Select Designation" />
//                                             <Link to='/Masters/DesignationMaster' className="add-btn-pulse">
//                                                 <CiSquarePlus className="fs-3" />
//                                             </Link>
//                                         </div>
//                                     </div>
//                                     <div className="col-lg-3">
//                                         <label>Contact</label>
//                                         <input className="form-control" placeholder='Enter Contact'
//                                             onChange={(e) => {
//                                                 handleInputChange(e);
//                                                 setRegister(prev => ({ ...prev, Contact: e.target.value }));
//                                             }}
//                                             onKeyDown={(e) => {
//                                                 if (/[^0-9]/.test(e.key) && !['Tab', 'Enter', 'Backspace'].includes(e.key)) e.preventDefault();
//                                             }}
//                                             maxLength={10} value={Register.Contact} />
//                                         {message && (
//                                             <small style={{ color: message.includes('valid') ? 'green' : 'red' }}>
//                                                 {message}
//                                             </small>
//                                         )}
//                                     </div>
//                                     {/* <div className="col-lg-3">
//                                         <label>Section</label>
//                                         <input className="form-control"
//                                             onChange={(e) => setRegister(prev => ({ ...prev, Section: e.target.value }))}
//                                             value={Register.Section} placeholder='Enter Section' />
//                                     </div> */}
//                                     <div className="col-lg-3">
//                                         <label>Gender</label>
//                                         <select className="form-select border border-2"
//                                             onChange={(e) => setRegister(prev => ({ ...prev, Gender: e.target.value }))}
//                                             value={Register.Gender}>
//                                             <option value="">Select Gender</option>
//                                             <option value='Male'>Male</option>
//                                             <option value='Female'>Female</option>
//                                             <option value='Others'>Others</option>
//                                         </select>
//                                     </div>
//                                     <div className="col-lg-3">
//                                         <label>Email</label>
//                                         <input className="form-control"
//                                             value={Register.email} onChange={handleEmailChange}
//                                             placeholder='Email Id' />
//                                         {emailMessage && (
//                                             <small style={{ color: emailMessage.includes('valid') ? 'green' : 'red' }}>
//                                                 {emailMessage}
//                                             </small>
//                                         )}
//                                     </div>
//                                     <div className="col-lg-3">
//                                         <label>DOJ</label>
//                                         <input type='date' className="form-control"
//                                             onChange={(e) => setRegister(prev => ({ ...prev, DOJ: e.target.value }))}
//                                             value={Register.DOJ} />
//                                     </div>
//                                     <div className="col-lg-3">
//                                         <label>DOB</label>
//                                         <input type='date' className="form-control"
//                                             onChange={(e) => setRegister(prev => ({ ...prev, DOB: e.target.value }))}
//                                             value={Register.DOB} />
//                                     </div>
//                                 </div>
//                             </div>
//                             <div className="modal-footer">
//                                 <button type="button" className="btn btn-secondary"
//                                     onClick={() => { setIsModalVisible(false); handleClear(); }}
//                                     style={{ borderRadius: '12px', padding: '10px 18px' }}>
//                                     <CIcon icon={cilX} /> Close
//                                 </button>
//                                 <button type="button"
//                                     className="btn d-flex align-items-center gap-2"
//                                     onClick={handlecheck} disabled={loading}
//                                     style={{
//                                         background: 'linear-gradient(135deg, #00c853, #009624)',
//                                         color: '#fff', border: 'none', borderRadius: '12px',
//                                         fontWeight: 600, padding: '10px 22px',
//                                         cursor: loading ? 'not-allowed' : 'pointer'
//                                     }}>
//                                     {loading
//                                         ? <><span className="spinner-border spinner-border-sm me-1"></span> Saving...</>
//                                         : <><i className="bi bi-check2-circle"></i> Save</>
//                                     }
//                                 </button>
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//             )}

//             {/* ==================== IMPORT MODAL ==================== */}
//             {Uploadvisible && (
//                 <div className="modal fade show" style={{ display: 'block' }}>
//                     <div className="modal-dialog modal-dialog-centered modal-lg modal-dialog-scrollable">
//                         <div className="modal-content card">
//                             <div className="modal-header">
//                                 <h5 className="modal-title">Import Employee Data</h5>
//                                 <button type="button" className="btn-close"
//                                     onClick={() => setUploadvisible(false)}></button>
//                             </div>
//                             <div className="modal-body">
//                                 <div className="import-input">
//                                     <label className="form-label">Import Data</label>
//                                     <input type="file" className="form-control"
//                                         accept=".csv, .xls, .xlsx"
//                                         onChange={handleUploadExcelSheet} />
//                                 </div>
//                                 <hr className="mt-2" />
//                                 <div className="download-sample-template text-center">
//                                     <p>Important ⚠</p>
//                                     <span className='text-danger'>
//                                         Download the template below, fill in data based on column names, then upload here.
//                                     </span>
//                                     <div>
//                                         <a href="/EmployeeMasterTemp.xlsx" className="nav-link text-decoration-underline" download>
//                                             Click to Download Template
//                                         </a>
//                                     </div>
//                                 </div>
//                                 <div className="text-center mt-3">
//                                     <button className="btn btn-danger mx-2"
//                                         onClick={() => setUploadvisible(false)}>CANCEL</button>
//                                     <button className="btn btn-success mx-2"
//                                         onClick={handleUploadData}>Upload Data</button>
//                                 </div>
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//             )}

//             {/* ==================== IMAGE MODAL ==================== */}
//             <CModal alignment="center" visible={Imagevisible}
//                 onClose={() => setImagevisible(false)}>
//                 <CModalTitle>
//                     <h5 className='text-center mt-2'>Employee Photo</h5>
//                 </CModalTitle>
//                 <CModalBody>
//                     <img src={modalImage} alt="Larger View"
//                         style={{ width: '100%', maxHeight: '400px', objectFit: 'contain', border: '1px solid' }} />
//                 </CModalBody>
//                 <CModalFooter>
//                     <CButton color="danger" onClick={() => setImagevisible(false)}>CLOSE</CButton>
//                 </CModalFooter>
//             </CModal>

//             {/* ==================== MAIN CARD ==================== */}
//             <div className='card'>
//                 <div className='card-header d-flex justify-content-between align-items-center p-3'
//                     style={{ background: '#106FB2' }}>
//                     <h4 className="mb-0 text-white d-flex align-items-center gap-2 ">
//                         <FaUsers className="fs-4" /> Employee Master
//                     </h4>
//                     <button className="btn-close btn-close-white"
//                         onClick={() => navigate("/Settings/Configure")}></button>
//                 </div>

//                 <div className="d-flex justify-content-end mt-2 gap-2 px-4">
//                     {!((pageData.addstatus === null || pageData.addstatus === 'i') && auth.UserStatus === 'A') && (
//                         <CButton type="button" color="primary"
//                             className="d-flex align-items-center gap-2"
//                             onClick={() => setUploadvisible(true)}
//                             style={{
//                                 background: 'linear-gradient(135deg, #007bff, #00b4d8)',
//                                 color: '#fff', border: 'none', borderRadius: '12px',
//                                 fontWeight: 600, padding: '10px 18px',
//                                 boxShadow: '0 4px 15px rgba(0, 123, 255, 0.35)'
//                             }}>
//                             <CIcon icon={cilCloudDownload} /> Import
//                         </CButton>
//                     )}

//                     <button className="d-flex align-items-center gap-2"
//                         data-bs-toggle="modal" data-bs-target="#exampleModal"
//                         style={{
//                             background: 'linear-gradient(135deg, #ff4b2b, #ff0000)',
//                             color: '#fff', border: 'none', borderRadius: '12px',
//                             fontWeight: 600, padding: '10px 18px',
//                             boxShadow: '0 4px 15px rgba(255, 0, 0, 0.35)', cursor: 'pointer'
//                         }}>
//                         <i className="bi bi-cloud-download"></i> Export
//                     </button>

//                     {!((pageData.addstatus === null || pageData.addstatus === 'i') && auth.UserStatus === 'A') && (
//                         <CButton type="button" color="success"
//                             className="d-flex align-items-center gap-2"
//                             onClick={() => { handleClear(); setIsModalVisible(true); }}
//                             style={{
//                                 background: 'linear-gradient(135deg, #00c853, #009624)',
//                                 color: '#fff', border: 'none', borderRadius: '12px',
//                                 fontWeight: 600, padding: '10px 18px',
//                                 boxShadow: '0 4px 15px rgba(0, 200, 83, 0.35)'
//                             }}>
//                             <CIcon icon={cilPlus} /> Add
//                         </CButton>
//                     )}
//                 </div>

//                 <div className='card-body py-3 px-5 mb-4'>
//                     <div className="ag-theme-quartz mt-2" style={{ height: "450px" }}>
//                         <AgGridReact
//                             ref={gridRef}
//                             rowData={rowData}
//                             columnDefs={columdef}
//                             defaultColDef={{ sortable: true, filter: true, resizable: true }}
//                             autoGroupColumnDef={autoGroupColumnDef}
//                             pagination={pagination}
//                             paginationPageSize={paginationPageSize}
//                             paginationPageSizeSelector={paginationPageSizeSelector}
//                             rowSelection="multiple"
//                             suppressRowClickSelection={true}
//                             animateRows={true}
//                             getRowHeight={() => 55}
//                         />
//                     </div>
//                 </div>
//             </div>
//         </>
//     );
// };

// EmployeeMaster.propTypes = {
//     auth: PropTypes.any.isRequired,
// };

// export default EmployeeMaster;



import React, { useMemo, useState, useEffect, useRef, useCallback } from 'react';
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
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Typeahead } from 'react-bootstrap-typeahead';
import { CButton, CModal, CModalBody, CModalFooter, CModalTitle } from '@coreui/react';
import logo from '../../assets/images/Cumi_logofull-Nobg.png';
import { FaEdit, FaEye, FaUsers } from 'react-icons/fa';
import Maleimg from '../../assets/images/avatars/man.png';
import femaleimg from '../../assets/images/avatars/woman.png';
import { getConfig } from 'src/config';
import CIcon from '@coreui/icons-react';
import { cilCloudDownload, cilPlus, cilTrash, cilX } from '@coreui/icons';
import { CiSquarePlus } from 'react-icons/ci';

const EmployeeMaster = ({ auth }) => {
    const API_URL = getConfig().REACT_APP_API_URL;
    const navigate = useNavigate();
    const gridRef = useRef(null);
    const fileInput = useRef(null);

    // ======================== STATES ========================
    const [loading, setLoading] = useState(false);
    const [Uploadvisible, setUploadvisible] = useState(false);
    const [uploadxl, setuploadxl] = useState(null);
    const [image, setImage] = useState({ src: '', alt: '' });
    const [Imagevisible, setImagevisible] = useState(false);
    const [modalImage, setModalImage] = useState(null);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [rowData, setRowData] = useState([]);
    const [message, setMessage] = useState('');
    const [emailMessage, setEmailMessage] = useState('');
    const [DepartmentDropDownData, SetDepartmentDropDownData] = useState([]);

    const defaultImage = "/uploads/New/Cubic.png";

    const initialRegister = {
        Id: '',
        Empid: '', FirstName: '', LastName: '',
        DOJ: '', DOB: '', Department: '',
        email: '', Contact: '', Status: '',
        Gender: '', Photo: '',
        CreatedBy: '', ID: ''
    };
    const [Register, setRegister] = useState(initialRegister);

    // ======================== PERMISSIONS (from Configure.jsx: state={{ permission, screenId: 'AC003' }}) ========================
    const location = useLocation();
    let permission = location.state?.permission;
    if (permission) {
        localStorage.setItem('employeeMasterPermission', JSON.stringify(permission));
    } else {
        const stored = localStorage.getItem('employeeMasterPermission');
        permission = stored ? JSON.parse(stored) : {};
    }

    const canAdd = auth.UserStatus === 'SA' || permission?.AddStatus === 'a';
    const canEdit = auth.UserStatus === 'SA' || permission?.EditStatus === 'a';
    const canDelete = auth.UserStatus === 'SA' || permission?.DeleteStatus === 'a';

    // ======================== PAGINATION ========================
    const pagination = true;
    const paginationPageSize = 100;
    const paginationPageSizeSelector = [10, 50, 100];

    // ======================== CLOSE MODAL ========================
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
        setRegister(initialRegister);
        setMessage('');
        setEmailMessage('');
        setImage({ src: '', alt: '' });
    }, []);

    // ======================== FETCH DATA (branch-scoped) ========================
    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const response = await axios.post(`${API_URL}/EmployeeConfig`, {
                mode: 'FetchEmployee',
                branchid: auth.branchid,
                BranchAccess: auth.UserStatus === 'SA' ? null : auth.BranchAccess,
                Id: '', CompanyCode: '', Empid: '',
                FirstName: '', LastName: '', DOJ: '', DOB: '',
                Department: '', email: '', Contact: '',
                Status: '', Gender: '', Photo: '', Location: '', CreatedBy: '', ID: ''
            });
            if (response.status === 200) {
                setRowData(Array.isArray(response.data) ? response.data : []);
            }
        } catch (error) {
            console.error('Error fetching employee details:', error);
        } finally {
            setLoading(false);
        }
    }, [API_URL, auth.branchid, auth.BranchAccess, auth.UserStatus]);

    // ======================== DEPARTMENT DROPDOWN ========================
    // NEW — SA (branchid 0) gets every branch in their BranchAccess list;
    // everyone else is scoped to their own branchid, per DepartmentMasterInfo's own logic
    const FetchDepartmentDropdown = useCallback(async () => {
        try {
            const response = await axios.post(`${API_URL}/fetchDeparmentData`, {
                mode: 'S',
                branchid: auth.UserStatus === 'SA' ? 0 : auth.branchid,
                BranchAccess: auth.BranchAccess
            });
            SetDepartmentDropDownData(response.data?.send || []);
        } catch (err) { console.log(err); }
    }, [API_URL, auth.branchid, auth.BranchAccess, auth.UserStatus]);

    // ======================== USE EFFECT ========================
    useEffect(() => {
        fetchData();
        FetchDepartmentDropdown();

    }, [fetchData, FetchDepartmentDropdown]);
    // ======================== IMAGE HANDLER ========================
    const handleImg = (event) => {
        const file = event.target.files[0];
        if (file && file.size <= 2 * 1024 * 1024) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setRegister(prev => ({ ...prev, Photo: reader.result }));
                setImage({ src: URL.createObjectURL(file), alt: file.name });
            };
            reader.readAsDataURL(file);
        } else {
            alert('File size should be less than or equal to 2MB');
        }
    };

    const handleImageClick = (imageUrl) => {
        setModalImage(imageUrl);
        setImagevisible(true);
    };

    // ======================== IMAGE UPLOAD HELPER ========================
    const uploadImage = async () => {
        const file = fileInput.current?.files?.[0];
        if (!file) return '';
        const formData = new FormData();
        formData.append('image', file);
        try {
            const res = await axios.post(`${API_URL}/api/upload`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            return res.data.success ? res.data.file.path : '';
        } catch (err) {
            console.error('Image upload error:', err);
            return '';
        }
    };

    // ======================== VIEW HANDLER ========================
    const handleView = useCallback(async (data) => {
        try {
            const response = await axios.post(`${API_URL}/EmployeeConfig`, {
                mode: 'E', Id: data.Id
            });
            if (Array.isArray(response.data) && response.data.length > 0) {
                setRegister(prev => ({ ...prev, ...response.data[0] }));
            }
        } catch (error) {
            console.log(error);
        }
    }, [API_URL]);

    // ======================== EDIT HANDLER ========================
    const handleEdit = useCallback(async (data) => {
        try {
            const response = await axios.post(`${API_URL}/EmployeeConfig`, {
                mode: 'E', Id: data.Id
            });
            if (Array.isArray(response.data) && response.data.length > 0) {
                setRegister(prev => ({ ...prev, ...response.data[0] }));
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
                await axios.post(`${API_URL}/EmployeeConfig`, {
                    mode: 'D', Id: data.Id
                });
                await fetchData();
                Swal.fire({
                    title: 'Deleted',
                    text: 'Deleted Successfully',
                    icon: 'success',
                    confirmButtonText: 'Done'
                });
            } catch (error) {
                console.error('ERROR DELETING RECORD:', error);
                Swal.fire({ title: 'Error', text: 'Failed to delete.', icon: 'error' });
            } finally {
                setLoading(false);
            }
        }
    }, [API_URL, fetchData]);

    // ======================== RENDERERS ========================
    const ViewRenderer = useCallback((params) => (
        <div>
            <button className="btn btn-hover-effect"
                onClick={() => handleView(params.data)}
                data-bs-toggle="modal"
                data-bs-target="#exampleModalView">
                <FaEye className="text-primary cursor-pointer fs-3" title="View" />
            </button>
        </div>
    ), [handleView]);

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
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'linear-gradient(135deg, #007bff, #00b4d8)';
                        e.currentTarget.style.transform = 'translateY(0)';
                    }}>
                    <FaEdit className="fs-5" title="Edit" />
                </button>
            </div>
        );
    }, [handleEdit, canEdit]);

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
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'linear-gradient(135deg, #ff4d4d, #ff1a1a)';
                        e.currentTarget.style.transform = 'translateY(0)';
                    }}>
                    <CIcon icon={cilTrash} size="xl" />
                </button>
            </div>
        );
    }, [handleDelete, canDelete]);

    // ======================== PHOTO CELL RENDERER ========================
    const PhotoRenderer = useCallback((params) => {
        const gender = params.data.Gender;
        const iconSrc = gender?.toLowerCase() === "male" ? Maleimg : femaleimg;
        const isEmpty = !params.value || params.value === 'NULL' || params.value === 'undefined' || params.value === '';

        const src = isEmpty ? iconSrc : `${API_URL}/${params.value}`;
        const alt = isEmpty ? (gender?.toLowerCase() === "male" ? "Male" : "Female") : "Employee Photo";

        return (
            <img src={src} alt={alt}
                className="border border-dark"
                style={{ width: "50px", height: "50px", borderRadius: "50%", objectFit: "cover", display: "block", cursor: 'pointer' }}
                onClick={() => handleImageClick(src)}
                onError={(e) => { e.target.src = iconSrc; }}
            />
        );
    }, [API_URL]);

    // ======================== COLUMN DEFINITIONS (no Designation column) ========================
    const columdef = useMemo(() => [
        { headerCheckboxSelection: true, checkboxSelection: true, width: 60 },
        {
            headerName: "Photo", field: "Photo",
            filter: false, sortable: false, floatingFilter: false, editable: false,
            cellRenderer: PhotoRenderer, width: 80
        },
        { headerName: "Employee ID", field: "ID", filter: true, headerClass: 'agheader', floatingFilter: true },
        { headerName: "First Name", field: "FirstName", filter: true, headerClass: 'agheader', floatingFilter: true },
        { headerName: "Last Name", field: "LastName", filter: true, headerClass: 'agheader', floatingFilter: true },
        { headerName: "Department", field: "Department", filter: true, headerClass: 'agheader', floatingFilter: true },
        { headerName: "Email", field: "email", filter: true, headerClass: 'agheader', floatingFilter: true },
        { headerName: "Contact", field: "Contact", filter: true, headerClass: 'agheader', floatingFilter: true },
        { headerName: "DOJ", field: "DOJ", filter: true, headerClass: 'agheader', floatingFilter: true },
        { headerName: "DOB", field: "DOB", filter: true, headerClass: 'agheader', floatingFilter: true },
        { headerName: "Gender", field: "Gender", filter: true, headerClass: 'agheader', floatingFilter: true },
        { headerName: "Created Date", field: "CreatedDate", filter: true, headerClass: 'agheader', floatingFilter: true },
        { headerName: "View", pinned: 'right', field: "View", headerClass: 'agheader', cellRenderer: ViewRenderer, width: 80, filter: false, floatingFilter: false },
        { headerName: 'Edit', pinned: 'right', field: "Edit", headerClass: 'agheader', cellRenderer: EditRenderer, width: 80, filter: false, floatingFilter: false },
        { headerName: "Delete", pinned: 'right', field: "Delete", headerClass: 'agheader', cellRenderer: DeleteRenderer, width: 90, filter: false, floatingFilter: false },
    ], [ViewRenderer, EditRenderer, DeleteRenderer, PhotoRenderer]);

    const autoGroupColumnDef = useMemo(() => ({
        headerCheckboxSelection: true,
        field: "id", flex: 1, minWidth: 240,
        cellRendererParams: { checkbox: true },
    }), []);

    // ======================== VALIDATION ========================
    const handleInputChange = (event) => {
        const value = event?.target?.value ?? '';
        if (/^\d*$/.test(value)) {
            if (value.length === 10) setMessage('Mobile number is valid.');
            else if (value.length === 0) setMessage('');
            else setMessage('Mobile number must be exactly 10 digits.');
        } else {
            setMessage('Only digits are allowed.');
        }
    };

    const handleEmailChange = (event) => {
        const value = event?.target?.value ?? '';
        setRegister(prev => ({ ...prev, email: value }));
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (emailRegex.test(value)) setEmailMessage("Email address is valid.");
        else if (value.length === 0) setEmailMessage('');
        else setEmailMessage("Invalid email address.");
    };

    // First Name, Last Name, and Department are now all required
    const validateRequired = () => {
        if (!Register.FirstName?.trim()) {
            Swal.fire({ title: 'Please Enter First Name', icon: 'warning' });
            return false;
        }
        if (!Register.LastName?.trim()) {
            Swal.fire({ title: 'Please Enter Last Name', icon: 'warning' });
            return false;
        }
        if (!Register.Department?.trim()) {
            Swal.fire({ title: 'Please Select Department', icon: 'warning' });
            return false;
        }
        return true;
    };

    // ======================== SAVE INSERT ========================
    const handlecheck = async () => {
        if (!validateRequired()) return;

        // NEW — only checks the ID field you actually collect, and only when it's non-empty
        const regID = Register.ID?.trim().toLowerCase() ?? '';
        const isDuplicate = regID
            ? rowData.some((item) => (item.ID?.trim().toLowerCase() ?? '') === regID)
            : false;

        if (isDuplicate) {
            swal({ text: "This Employee ID is Already Existing", icon: "warning" });
            return;
        }
        console.log("🚀 ~ handlecheck ~ Register:", Register)

        console.log("🚀 ~ handlecheck ~ rowData:", rowData)

        if (isDuplicate) {
            swal({ text: "This Employee ID or ID is Already Existing", icon: "warning" });
            return;
        }

        setLoading(true);
        try {
            const imagePath = await uploadImage();
            const alldata = {
                ...Register,
                CreatedBy: auth.employeename,
                branchid: auth.branchid,
                mode: 'I',
                Photo: imagePath
            };
            await axios.post(`${API_URL}/EmployeeConfig`, alldata);
            setIsModalVisible(false);
            handleClear();
            await fetchData();
            Swal.fire({
                title: 'Saved Successfully',
                text: 'Employee has been added.',
                icon: 'success',
                confirmButtonText: 'Done'
            });
        } catch (err) {
            console.error('Save error:', err);
            Swal.fire({ title: 'Error', text: 'Failed to save. Please try again.', icon: 'error' });
        } finally {
            setLoading(false);
        }
    };

    // ======================== UPDATE ========================
    const handlechange = async () => {
        if (!validateRequired()) return;

        setLoading(true);
        try {
            const imagePath = await uploadImage();
            const alldata = {
                ...Register,
                CreatedBy: auth.employeename,
                mode: 'U',
                Photo: imagePath
            };
            await axios.post(`${API_URL}/EmployeeConfig`, alldata);
            closeModal('exampleModalEdit');
            handleClear();
            await fetchData();
            Swal.fire({
                title: 'Updated Successfully',
                text: 'Employee has been updated.',
                icon: 'success',
                confirmButtonText: 'Done'
            });
        } catch (err) {
            console.error('Update error:', err);
            Swal.fire({ title: 'Error', text: 'Failed to update. Please try again.', icon: 'error' });
        } finally {
            setLoading(false);
        }
    };

    // ======================== IMPORT ========================
    const handleUploadExcelSheet = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            const fileExtension = selectedFile.name.split('.').pop().toLowerCase();
            if (['csv', 'xls', 'xlsx'].includes(fileExtension)) {
                setuploadxl(selectedFile);
            } else {
                Swal.fire({ title: 'Invalid File Format', text: 'Please select a valid CSV or Excel file.', icon: 'warning' });
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
            text: "Once uploaded, you will not be able to check the Employee list immediately!",
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
                formData.append('CreatedBy', auth.employeename);
                formData.append('branchid', auth.branchid);
                const response = await axios.post(`${API_URL}/EmployeeUploadData`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
                const { uploadcount, unuploadedFilePath } = response.data;
                await fetchData();
                if (unuploadedFilePath) {
                    swal({
                        title: `Total Uploaded: ${uploadcount}`,
                        text: "Some records could not be uploaded. Download the error file.",
                        icon: 'warning',
                        buttons: { cancel: "OK", download: { text: "Download File", value: "download" } },
                    }).then((value) => {
                        if (value === "download") {
                            const link = document.createElement('a');
                            link.href = `${API_URL}${unuploadedFilePath}`;
                            link.setAttribute('download', 'unuploaded_Employee_data.xlsx');
                            document.body.appendChild(link);
                            link.click();
                            link.remove();
                        }
                    });
                } else {
                    Swal.fire({
                        title: `Total Uploaded: ${uploadcount}`,
                        text: 'All data uploaded successfully',
                        icon: 'success'
                    });
                }
            } catch (err) {
                console.error(err);
                Swal.fire({ title: 'Please Upload Valid File', icon: 'error' });
            } finally {
                setUploadvisible(false);
                setLoading(false);
            }
        }
    };

    // ======================== PDF EXPORT (no Designation column) ========================
    const generatePDF = async () => {
        setLoading(true);
        try {
            const filteredData = gridRef.current.api.getModel().rowsToDisplay.map(rowNode => rowNode.data);
            const doc = new jsPDF({ format: 'a3', orientation: 'landscape' });
            const title = 'Employee Master';
            const currentUser = auth.employeename || 'Unknown User';
            const currentDateTime = new Date().toLocaleString();
            const pageWidth = doc.internal.pageSize.width;

            doc.addImage(logo, 'PNG', 10, 10, 15, 15);
            doc.setFontSize(14);
            doc.setFont("helvetica", "bold");
            doc.text(title, pageWidth / 2, 15, { align: 'center' });

            if (filteredData.length > 0) {
                const columnMapping = [
                    { header: "Employee ID", key: "ID" },
                    { header: "First Name", key: "FirstName" },
                    { header: "Last Name", key: "LastName" },
                    { header: "Department", key: "Department" },
                    { header: "Email", key: "email" },
                    { header: "Contact", key: "Contact" },
                    { header: "DOJ", key: "DOJ" },
                    { header: "DOB", key: "DOB" },
                    { header: "Gender", key: "Gender" },
                    { header: "Created Date", key: "CreatedDate" },
                ];
                const columnHeaders = columnMapping.map(col => col.header);
                const data = filteredData.map(obj => columnMapping.map(col => obj[col.key] || ''));
                doc.autoTable({
                    head: [columnHeaders],
                    body: data,
                    margin: { top: 30, right: 10, left: 10, bottom: 20 },
                    theme: 'grid',
                    styles: { fontSize: 7, halign: "center", valign: "middle", overflow: 'linebreak', lineColor: [0, 0, 0], lineWidth: 0.1 },
                    headStyles: { fillColor: [63, 119, 210], textColor: [255, 255, 255], lineColor: [0, 0, 0], lineWidth: 0.1, fontStyle: 'bold' },
                    bodyStyles: { fillColor: [245, 245, 245], textColor: [0, 0, 0], lineColor: [0, 0, 0], lineWidth: 0.1 },
                    didDrawPage: (data) => {
                        const pw = doc.internal.pageSize.width;
                        const ph = doc.internal.pageSize.height;
                        doc.addImage(logo, 'PNG', 10, 10, 15, 15);
                        doc.setFontSize(10);
                        doc.text(`User: ${currentUser}`, pw - 10, 12, { align: 'right' });
                        doc.text(`Date: ${currentDateTime}`, pw - 10, 18, { align: 'right' });
                        doc.setFontSize(14);
                        doc.setFont("helvetica", "bold");
                        doc.text(title, pw / 2, 15, { align: 'center' });
                        doc.setFontSize(10);
                        doc.text(`Page ${data.pageNumber}`, pw / 2, ph - 10, { align: 'center' });
                        doc.setFontSize(8);
                        doc.text(`Printed By: ${currentUser} | Printed On: ${new Date().toLocaleDateString()} | Time: ${new Date().toLocaleTimeString()}`, pw / 2, ph - 15, { align: 'center' });
                        doc.text(`Note: This document has been generated electronically and is valid without signature.`, pw / 2, ph - 8, { align: 'center' });
                    }
                });
                doc.save('Employee_Master.pdf');
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

    // ======================== CSV EXPORT (no Designation column) ========================
    const onExportClick = () => {
        gridRef.current.api.exportDataAsCsv({
            fileName: 'Employees_Details.csv',
            columnKeys: ['ID', 'FirstName', 'LastName', 'Department', 'email', 'Contact', 'DOJ', 'DOB', 'Gender', 'CreatedDate'],
        });
    };

    // ======================== RETURN JSX ========================
    return (
        <>
            {loading && (
                <div className="loading-overlay">
                    <div className="loading-spinner">
                        <BallTriangle height={100} width={100} radius={5} color="#4fa94d"
                            ariaLabel="ball-triangle-loading" wrapperStyle={{ justifyContent: 'center' }} visible={true} />
                    </div>
                </div>
            )}

            {/* ==================== EXPORT MODAL ==================== */}
            <div className="modal fade" id="exampleModal" tabIndex="-1" aria-hidden="true">
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">Download Format</h5>
                            <button type="button" className="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div className="modal-body">
                            <div className="d-flex justify-content-evenly">
                                <div className="btn btn-success" onClick={onExportClick}>
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

            {/* ==================== VIEW MODAL (no Designation) ==================== */}
            <div className="modal fade" id="exampleModalView" tabIndex="-1" aria-hidden="true">
                <div className="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
                    <div className="modal-content">
                        <div className="modal-header p-2" style={{ background: 'linear-gradient(135deg, #28a745, #5cb85c)' }}>
                            <h5 className="modal-title text-white">Employee Information</h5>
                            <button type="button" className="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                        </div>
                        <div className="modal-body">
                            <div className="row g-3">
                                <div className="col-12">
                                    <img
                                        src={
                                            (Register.Photo && Register.Photo !== 'undefined' && Register.Photo !== 'NULL' && Register.Photo !== null && Register.Photo !== '')
                                                ? `${API_URL}/${Register.Photo}`
                                                : Register.Gender === 'Male' ? Maleimg : femaleimg
                                        }
                                        alt='Employee'
                                        className="border border-dark"
                                        style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover' }}
                                    />
                                </div>

                                <div className="col-lg-3"><label className="form-label text-muted">Employee ID</label><p className="fw-semibold">{Register.ID || '-'}</p></div>
                                <div className="col-lg-3"><label className="form-label text-muted">First Name</label><p className="fw-semibold">{Register.FirstName || '-'}</p></div>
                                <div className="col-lg-3"><label className="form-label text-muted">Last Name</label><p className="fw-semibold">{Register.LastName || '-'}</p></div>
                                <div className="col-lg-3"><label className="form-label text-muted">Department</label><p className="fw-semibold">{Register.Department || '-'}</p></div>
                                <div className="col-lg-3"><label className="form-label text-muted">Contact</label><p className="fw-semibold">{Register.Contact || '-'}</p></div>
                                <div className="col-lg-3"><label className="form-label text-muted">Gender</label><p className="fw-semibold">{Register.Gender || '-'}</p></div>
                                <div className="col-lg-3"><label className="form-label text-muted">Email</label><p className="fw-semibold text-break">{Register.email || '-'}</p></div>
                                <div className="col-lg-3"><label className="form-label text-muted">DOJ</label><p className="fw-semibold">{Register.DOJ || '-'}</p></div>
                                <div className="col-lg-3"><label className="form-label text-muted">DOB</label><p className="fw-semibold">{Register.DOB || '-'}</p></div>
                                <div className="col-lg-3"><label className="form-label text-muted">Created By</label><p className="fw-semibold">{Register.CreatedBy || '-'}</p></div>
                                <div className="col-lg-3"><label className="form-label text-muted">Created Date</label><p className="fw-semibold">{Register.CreatedDate || '-'}</p></div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" data-bs-dismiss="modal"
                                style={{ borderRadius: '10px' }}>
                                <i className="fas fa-times me-1"></i> Close
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* ==================== EDIT MODAL (no Designation) ==================== */}
            <div className="modal fade" id="exampleModalEdit" tabIndex="-1"
                data-bs-backdrop="static" data-bs-keyboard="false" aria-hidden="true">
                <div className="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
                    <div className="modal-content">
                        <div className="modal-header p-2" style={{ background: '#3f77d2' }}>
                            <h5 className="modal-title text-white">Edit Employee Details</h5>
                            <button type="button" className="btn-close btn-close-white"
                                data-bs-dismiss="modal" onClick={handleClear}></button>
                        </div>
                        <div className="modal-body">
                            <div className="row g-3">
                                <div className="col-12">
                                    <h6>Employee Image</h6>
                                    <img
                                        onClick={() => fileInput.current.click()}
                                        src={
                                            (Register.Photo && Register.Photo !== 'undefined' && Register.Photo !== 'NULL' && Register.Photo !== null && Register.Photo !== '')
                                                ? `${API_URL}/${Register.Photo}`
                                                : Register.Gender === 'Male' ? Maleimg : femaleimg
                                        }
                                        alt='Employee'
                                        className="border border-dark"
                                        style={{ width: '70px', height: '70px', borderRadius: '50%', objectFit: 'cover', cursor: 'pointer' }}
                                    />
                                    <input ref={fileInput} type="file" accept=".png, .jpg, .jpeg"
                                        className="border d-none" onChange={handleImg} />
                                </div>

                                <div className="col-lg-3">
                                    <label>Employee ID</label>
                                    <input className="form-control"
                                        onChange={(e) => setRegister(prev => ({ ...prev, ID: e.target.value }))}
                                        value={Register.ID}
                                        onKeyDown={(e) => {
                                            if (/[^A-Za-z0-9 ]/.test(e.key) && !['Tab', 'Enter', 'Backspace'].includes(e.key)) e.preventDefault();
                                        }}
                                    />
                                </div>

                                <div className="col-lg-3">
                                    <label>First Name <span className="text-danger">*</span></label>
                                    <input className="form-control"
                                        onChange={(e) => setRegister(prev => ({ ...prev, FirstName: e.target.value }))}
                                        value={Register.FirstName}
                                        onKeyDown={(e) => {
                                            if (/[^A-Za-z. ]/.test(e.key) && !['Tab', 'Enter', 'Backspace'].includes(e.key)) e.preventDefault();
                                        }}
                                    />
                                </div>
                                <div className="col-lg-3">
                                    <label>Last Name <span className="text-danger">*</span></label>
                                    <input className="form-control"
                                        onChange={(e) => setRegister(prev => ({ ...prev, LastName: e.target.value }))}
                                        value={Register.LastName}
                                        onKeyDown={(e) => {
                                            if (/[^A-Za-z. ]/.test(e.key) && !['Tab', 'Enter', 'Backspace'].includes(e.key)) e.preventDefault();
                                        }}
                                    />
                                </div>
                                <div className="col-lg-3">
                                    <label>Department <span className="text-danger">*</span></label>
                                    <Typeahead id="dept-edit" labelKey="Department"
                                        onChange={(selected) => setRegister(prev => ({ ...prev, Department: selected[0]?.Department || '' }))}
                                        options={DepartmentDropDownData} placeholder="Select Department"
                                        selected={Register.Department ? [{ Department: Register.Department }] : []}
                                    />
                                </div>
                                <div className="col-lg-3">
                                    <label>Contact</label>
                                    <input className="form-control"
                                        onChange={(e) => setRegister(prev => ({ ...prev, Contact: e.target.value }))}
                                        value={Register.Contact} maxLength={10} />
                                </div>
                                <div className="col-lg-3">
                                    <label>Gender</label>
                                    <select className="form-select border border-2"
                                        onChange={(e) => setRegister(prev => ({ ...prev, Gender: e.target.value }))}
                                        value={Register.Gender}>
                                        <option value="">Select Gender</option>
                                        <option value='Male'>Male</option>
                                        <option value='Female'>Female</option>
                                        <option value='Others'>Others</option>
                                    </select>
                                </div>
                                <div className="col-lg-3">
                                    <label>Email</label>
                                    <input className="form-control"
                                        onChange={(e) => setRegister(prev => ({ ...prev, email: e.target.value }))}
                                        value={Register.email} />
                                </div>
                                <div className="col-lg-3">
                                    <label>DOJ</label>
                                    <input type="date" className="form-control"
                                        onChange={(e) => setRegister(prev => ({ ...prev, DOJ: e.target.value }))}
                                        value={Register.DOJ || ''} />
                                </div>
                                <div className="col-lg-3">
                                    <label>DOB</label>
                                    <input type="date" className="form-control"
                                        onChange={(e) => setRegister(prev => ({ ...prev, DOB: e.target.value }))}
                                        value={Register.DOB || ''} />
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary"
                                data-bs-dismiss="modal" onClick={handleClear}
                                style={{ borderRadius: '10px', padding: '9px 18px' }}>
                                <CIcon icon={cilX} /> Close
                            </button>
                            <button type="button"
                                className="btn d-flex align-items-center gap-2"
                                onClick={handlechange} disabled={loading}
                                style={{
                                    background: 'linear-gradient(135deg, #8e2de2, #4a00e0)',
                                    color: '#fff', border: 'none', borderRadius: '12px',
                                    fontWeight: 600, padding: '10px 18px',
                                    cursor: loading ? 'not-allowed' : 'pointer'
                                }}>
                                {loading
                                    ? <><span className="spinner-border spinner-border-sm me-1"></span> Updating...</>
                                    : <><i className="bi bi-arrow-repeat"></i> Update</>
                                }
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* ==================== ADD MODAL (no Designation, required asterisks) ==================== */}
            {isModalVisible && (
                <div className="modal fade show" style={{ display: 'block' }}>
                    <div className="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
                        <div className="modal-content">
                            <div className="modal-header p-2" style={{ background: '#3f77d2' }}>
                                <h5 className="modal-title text-white">Add Employee</h5>
                                <button type="button" className="btn-close btn-close-white"
                                    onClick={() => { setIsModalVisible(false); handleClear(); }}></button>
                            </div>
                            <div className="modal-body">
                                <div className="row g-3">
                                    <div className="col-12">
                                        <h6>Employee Image</h6>
                                        <img
                                            onClick={() => fileInput.current.click()}
                                            src={image.src || defaultImage}
                                            alt="Preview"
                                            className="border border-dark"
                                            style={{ width: '70px', height: '70px', borderRadius: '50%', objectFit: 'cover', cursor: 'pointer' }}
                                        />
                                        <input ref={fileInput} type="file" accept=".png, .jpg, .jpeg"
                                            className="border d-none" onChange={handleImg} />
                                    </div>

                                    <div className="col-lg-3">
                                        <label>Employee ID</label>
                                        <input className="form-control"
                                            onChange={(e) => setRegister(prev => ({ ...prev, ID: e.target.value }))}
                                            value={Register.ID} placeholder='Enter ID'
                                            onKeyDown={(e) => {
                                                if (/[^A-Za-z0-9 ]/.test(e.key) && !['Tab', 'Enter', 'Backspace'].includes(e.key)) e.preventDefault();
                                            }}
                                        />
                                    </div>

                                    <div className="col-lg-3">
                                        <label>First Name <span className="text-danger">*</span></label>
                                        <input className="form-control"
                                            onChange={(e) => setRegister(prev => ({ ...prev, FirstName: e.target.value }))}
                                            value={Register.FirstName} placeholder='Enter First Name'
                                            onKeyDown={(e) => {
                                                if (/[^A-Za-z. ]/.test(e.key) && !['Tab', 'Enter', 'Backspace'].includes(e.key)) e.preventDefault();
                                            }}
                                        />
                                    </div>
                                    <div className="col-lg-3">
                                        <label>Last Name <span className="text-danger">*</span></label>
                                        <input className="form-control"
                                            onChange={(e) => setRegister(prev => ({ ...prev, LastName: e.target.value }))}
                                            value={Register.LastName} placeholder='Enter Last Name'
                                            onKeyDown={(e) => {
                                                if (/[^A-Za-z]/.test(e.key) && !['Tab', 'Enter', 'Backspace'].includes(e.key)) e.preventDefault();
                                            }}
                                        />
                                    </div>
                                    <div className="col-lg-3">
                                        <label>Department <span className="text-danger">*</span></label>
                                        <div className='d-flex'>
                                            <Typeahead id="dept-add" labelKey="Department"
                                                onChange={(selected) => setRegister(prev => ({ ...prev, Department: selected[0]?.Department || '' }))}
                                                options={DepartmentDropDownData} placeholder="Select Department"
                                                selected={Register.Department ? [{ Department: Register.Department }] : []}
                                            />
                                            <Link to='/usercreation/config/department' className="add-btn-pulse">
                                                <CiSquarePlus className="fs-3" />
                                            </Link>
                                        </div>
                                    </div>
                                    <div className="col-lg-3">
                                        <label>Contact</label>
                                        <input className="form-control" placeholder='Enter Contact'
                                            onChange={(e) => {
                                                handleInputChange(e);
                                                setRegister(prev => ({ ...prev, Contact: e.target.value }));
                                            }}
                                            onKeyDown={(e) => {
                                                if (/[^0-9]/.test(e.key) && !['Tab', 'Enter', 'Backspace'].includes(e.key)) e.preventDefault();
                                            }}
                                            maxLength={10} value={Register.Contact} />
                                        {message && (
                                            <small style={{ color: message.includes('valid') ? 'green' : 'red' }}>
                                                {message}
                                            </small>
                                        )}
                                    </div>
                                    <div className="col-lg-3">
                                        <label>Gender</label>
                                        <select className="form-select border border-2"
                                            onChange={(e) => setRegister(prev => ({ ...prev, Gender: e.target.value }))}
                                            value={Register.Gender}>
                                            <option value="">Select Gender</option>
                                            <option value='Male'>Male</option>
                                            <option value='Female'>Female</option>
                                            <option value='Others'>Others</option>
                                        </select>
                                    </div>
                                    <div className="col-lg-3">
                                        <label>Email</label>
                                        <input className="form-control"
                                            value={Register.email} onChange={handleEmailChange}
                                            placeholder='Email Id' />
                                        {emailMessage && (
                                            <small style={{ color: emailMessage.includes('valid') ? 'green' : 'red' }}>
                                                {emailMessage}
                                            </small>
                                        )}
                                    </div>
                                    <div className="col-lg-3">
                                        <label>DOJ</label>
                                        <input type='date' className="form-control"
                                            onChange={(e) => setRegister(prev => ({ ...prev, DOJ: e.target.value }))}
                                            value={Register.DOJ} />
                                    </div>
                                    <div className="col-lg-3">
                                        <label>DOB</label>
                                        <input type='date' className="form-control"
                                            onChange={(e) => setRegister(prev => ({ ...prev, DOB: e.target.value }))}
                                            value={Register.DOB} />
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary"
                                    onClick={() => { setIsModalVisible(false); handleClear(); }}
                                    style={{ borderRadius: '12px', padding: '10px 18px' }}>
                                    <CIcon icon={cilX} /> Close
                                </button>
                                <button type="button"
                                    className="btn d-flex align-items-center gap-2"
                                    onClick={handlecheck} disabled={loading}
                                    style={{
                                        background: 'linear-gradient(135deg, #00c853, #009624)',
                                        color: '#fff', border: 'none', borderRadius: '12px',
                                        fontWeight: 600, padding: '10px 22px',
                                        cursor: loading ? 'not-allowed' : 'pointer'
                                    }}>
                                    {loading
                                        ? <><span className="spinner-border spinner-border-sm me-1"></span> Saving...</>
                                        : <><i className="bi bi-check2-circle"></i> Save</>
                                    }
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ==================== IMPORT MODAL ==================== */}
            {Uploadvisible && (
                <div className="modal fade show" style={{ display: 'block' }}>
                    <div className="modal-dialog modal-dialog-centered modal-lg modal-dialog-scrollable">
                        <div className="modal-content card">
                            <div className="modal-header">
                                <h5 className="modal-title">Import Employee Data</h5>
                                <button type="button" className="btn-close"
                                    onClick={() => setUploadvisible(false)}></button>
                            </div>
                            <div className="modal-body">
                                <div className="import-input">
                                    <label className="form-label">Import Data</label>
                                    <input type="file" className="form-control"
                                        accept=".csv, .xls, .xlsx"
                                        onChange={handleUploadExcelSheet} />
                                </div>
                                <hr className="mt-2" />
                                <div className="download-sample-template text-center">
                                    <p>Important ⚠</p>
                                    <span className='text-danger'>
                                        Download the template below, fill in data based on column names, then upload here.
                                    </span>
                                    <div>
                                        <a href="/EmployeeMasterTemp.xlsx" className="nav-link text-decoration-underline" download>
                                            Click to Download Template
                                        </a>
                                    </div>
                                </div>
                                <div className="text-center mt-3">
                                    <button className="btn btn-danger mx-2"
                                        onClick={() => setUploadvisible(false)}>CANCEL</button>
                                    <button className="btn btn-success mx-2"
                                        onClick={handleUploadData}>Upload Data</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ==================== IMAGE MODAL ==================== */}
            <CModal alignment="center" visible={Imagevisible}
                onClose={() => setImagevisible(false)}>
                <CModalTitle>
                    <h5 className='text-center mt-2'>Employee Photo</h5>
                </CModalTitle>
                <CModalBody>
                    <img src={modalImage} alt="Larger View"
                        style={{ width: '100%', maxHeight: '400px', objectFit: 'contain', border: '1px solid' }} />
                </CModalBody>
                <CModalFooter>
                    <CButton color="danger" onClick={() => setImagevisible(false)}>CLOSE</CButton>
                </CModalFooter>
            </CModal>

            {/* ==================== MAIN CARD ==================== */}
            <div className='card'>
                <div className='card-header d-flex justify-content-between align-items-center p-3'
                    style={{ background: '#106FB2' }}>
                    <h4 className="mb-0 text-white d-flex align-items-center gap-2 ">
                        <FaUsers className="fs-4" /> Employee Master
                    </h4>
                    <button className="btn-close btn-close-white"
                        onClick={() => navigate("/Settings/Configure")}></button>
                </div>

                <div className="d-flex justify-content-end mt-2 gap-2 px-4">
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
        </>
    );
};

EmployeeMaster.propTypes = {
    auth: PropTypes.any.isRequired,
};

export default EmployeeMaster;