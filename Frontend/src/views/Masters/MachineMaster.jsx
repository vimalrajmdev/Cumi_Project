// // import React, { useMemo, useState, useEffect, useRef, useContext } from 'react'
// // import { AgGridReact } from 'ag-grid-react';
// // import "ag-grid-community/styles/ag-grid.css";
// // import "ag-grid-community/styles/ag-theme-alpine.css";
// // import axios from 'axios';
// // import Swal from 'sweetalert2';
// // import swal from 'sweetalert';
// // import { Row, Col } from 'react-bootstrap';
// // import jsPDF from 'jspdf';
// // import 'jspdf-autotable';
// // import { Link } from 'react-router-dom';
// // import PropTypes from 'prop-types';
// // import { BallTriangle } from 'react-loader-spinner';
// // import { useLocation } from "react-router-dom";
// // import { Typeahead } from 'react-bootstrap-typeahead';
// // import { BsMarkdown } from 'react-icons/bs';
// // import { CButton, CModal, CModalBody, CModalFooter, CModalHeader, CModalTitle } from '@coreui/react';
// // // import logo from '../../../assets/images/Cumi/Cumi_logo.jpg'; // Can also be base64 string
// // import { FaEdit, FaEye, FaTrash, FaUsers } from 'react-icons/fa';
// // import { getConfig } from 'src/config';
// // import { cilCloudDownload, cilPlus, cilTrash, cilX } from '@coreui/icons';
// // import CIcon from '@coreui/icons-react';
// // import { useNavigate } from 'react-router-dom';
// // import { CiSquarePlus } from "react-icons/ci";

// // const MachineMaster = ({ auth }) => {
// //     const API_URL = getConfig().REACT_APP_API_URL;
// //     const [Uploadvisible, setUploadvisible] = useState(false)
// //     const [uploadxl, setuploadxl] = useState(false)
// //     const [loading, setLoading] = useState(false); // Loader state
// //     const navigate = useNavigate()
// //     const CompanyRef = useRef(null);
// //     const location = useLocation();
// //     let pageData = location.state?.pageData;
// //     if (!pageData) {
// //         // Fallback to local storage if available
// //         const storedData = localStorage.getItem('pageData');
// //         pageData = storedData ? JSON.parse(storedData) : {};
// //     }
// //     const PlantRef = useRef(null);
// //     const [Editid, SetEditid] = useState(null);
// //     const [deletevisible, setDeletevisible] = useState(false);

// //     const [Register, setRegister] = useState(
// //         {
// //             MachineRFID: '',
// //             Itemcode: '',
// //             Location: '',
// //             Description: '',
// //             Id: '',
// //             CreatedBy: '',
// //         }
// //     )
// //     const [isModalVisible, setIsModalVisible] = useState(false);

// //     const pagination = true;
// //     const paginationPageSize = 100;
// //     const paginationPageSizeSelector = [10, 50, 100];

// //     const [view, setview] = useState([]);
// //     const handleView = async (data) => {
// //         try {
// //             const alldata = {
// //                 mode: 'E', ...data, Id: ''
// //             }
// //             // console.log(alldata)
// //             const response = await axios.post(`${API_URL}/MachineConfig`, alldata);
// //             // console.log(response.data)
// //             setRegister(...response.data)
// //             // const { CompanyCode, branchid, UniqueID, Area, Supervisor, Category } = response.data[0]
// //             // setRegister({
// //             //     ...Register,
// //             //     CompanyCode: CompanyCode,
// //             //     branchid: branchid,
// //             //     AreaID: UniqueID,
// //             //     Area: Area,
// //             //     Supervisor: Supervisor,
// //             //     Category: Category
// //             // })


// //         }
// //         catch (error) {
// //             console.log(error)
// //         }
// //     }


// //     const ViewRenderer = (params) => {


// //         if ((pageData.viewstatus === null || pageData.viewstatus === 'i') && auth.UserStatus === 'A') {
// //             return null; // Hide the button by returning null
// //         }
// //         return (
// //             <div>
// //                 <button
// //                     className="btn btn-hover-effect"
// //                     onClick={() => handleView(params.data)}
// //                     data-bs-toggle="modal"
// //                     data-bs-target="#exampleModalView"
// //                 >
// //                     <FaEye className="text-primary cursor-pointer fs-3" title="View" />
// //                     {/* <i className="bi bi-eye-fill fs-5"></i> */}
// //                 </button>
// //             </div>
// //         );
// //     };
// //     const handleEdit = async (data) => {
// //         try {
// //             const alldata = {
// //                 mode: 'E', ...data, Id: ''
// //             }
// //             // console.log(alldata)
// //             const response = await axios.post(`${API_URL}/MachineConfig`, alldata);
// //             // console.log(response.data)
// //             setRegister(...response.data)

// //             // const { CompanyCode, branchid, UniqueId, Area, Supervisor, Category } = response.data[0]
// //             // setRegister({
// //             //     ...Register,
// //             //     CompanyCode: CompanyCode,
// //             //     branchid: branchid,
// //             //     AreaID: UniqueID,
// //             //     Area: Area,
// //             //     Supervisor: Supervisor,
// //             //     Category: Category
// //             // })

// //         } catch (error) {
// //             console.error('ERROR EDITING RECORD:', error);
// //             throw error;
// //         }




// //     }
// //     const EditRenderer = (params) => {
// //         // console.log(pageData.editstatus)

// //         if ((pageData.editstatus === null || pageData.editstatus === 'i') && auth.UserStatus === 'A') {
// //             return null; // Hide the button by returning null
// //         }

// //         return <div>
// //             <button
// //                 onClick={() => handleEdit(params.data)} data-bs-toggle="modal" data-bs-target="#exampleModalEdit"
// //                 className='mt-1 ms-2'
// //                 style={{
// //                     background: 'linear-gradient(135deg, #007bff, #00b4d8)', // blue gradient
// //                     color: '#fff',
// //                     border: 'none',
// //                     borderRadius: '50%', // circular button
// //                     padding: '7px',
// //                     display: 'flex',
// //                     alignItems: 'center',
// //                     justifyContent: 'center',
// //                     cursor: 'pointer',
// //                     boxShadow: '0 4px 12px rgba(0, 123, 255, 0.35)',
// //                     transition: 'all 0.3s ease',
// //                 }}
// //                 onMouseEnter={(e) => {
// //                     e.currentTarget.style.background = 'linear-gradient(135deg, #3399ff, #33ccff)';
// //                     e.currentTarget.style.transform = 'translateY(-2px)';
// //                     e.currentTarget.style.boxShadow = '0 6px 18px rgba(51, 204, 255, 0.45)';
// //                 }}
// //                 onMouseLeave={(e) => {
// //                     e.currentTarget.style.background = 'linear-gradient(135deg, #007bff, #00b4d8)';
// //                     e.currentTarget.style.transform = 'translateY(0)';
// //                     e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 123, 255, 0.35)';
// //                 }}
// //             >
// //                 <FaEdit className="fs-5" title="Edit" />
// //             </button>
// //         </div>

// //     }
// //     const DeleteRenderer = (params) => {
// //         if ((pageData.deletestatus === null || pageData.deletestatus === 'i') && auth.UserStatus === 'A') {
// //             return null; // Hide the button by returning null
// //         }

// //         return (
// //             <div>
// //                 <button
// //                     className='mt-1 ms-1'
// //                     onClick={() => handleDelete(params.data.Id)}
// //                     style={{
// //                         background: 'linear-gradient(135deg, #ff4d4d, #ff1a1a)', // red gradient
// //                         color: '#fff',
// //                         border: 'none',
// //                         borderRadius: '50%',
// //                         padding: '4px',
// //                         display: 'flex',
// //                         alignItems: 'center',
// //                         justifyContent: 'center',
// //                         cursor: 'pointer',
// //                         boxShadow: '0 4px 12px rgba(255, 0, 0, 0.35)',
// //                         transition: 'all 0.3s ease',
// //                     }}
// //                     onMouseEnter={(e) => {
// //                         e.currentTarget.style.background = 'linear-gradient(135deg, #ff6666, #ff3333)';
// //                         e.currentTarget.style.transform = 'translateY(-2px)';
// //                         e.currentTarget.style.boxShadow = '0 6px 18px rgba(255, 80, 80, 0.45)';
// //                     }}
// //                     onMouseLeave={(e) => {
// //                         e.currentTarget.style.background = 'linear-gradient(135deg, #ff4d4d, #ff1a1a)';
// //                         e.currentTarget.style.transform = 'translateY(0)';
// //                         e.currentTarget.style.boxShadow = '0 4px 12px rgba(255, 0, 0, 0.35)';
// //                     }}
// //                 >
// //                     <CIcon icon={cilTrash} size="xl" />
// //                 </button>
// //             </div>
// //         );
// //     }
// //     const handleDelete = (Id) => {
// //         try {
// //             setDeletevisible(true)
// //             SetEditid(Id)
// //         } catch (err) {
// //             console.log(err);
// //         }
// //     }
// //     const handleconfirmDelete = async () => {

// //     try {

// //         setLoading(true);

// //         const alldata = {
// //             mode: 'D',
// //             Id: Editid,
// //             MachineRFID: '',
// //             Itemcode: '',
// //             Location: '',
// //             Description: '',
// //             CreatedBy: ''
// //         };

// //         const response = await axios.post(
// //             `${API_URL}/MachineConfig`,
// //             alldata
// //         );

// //         if (response.status === 200) {

// //             setDeletevisible(false);

// //             await fetchData();

// //             swal({
// //                 text: 'Deleted Successfully',
// //                 icon: 'success'
// //             });
// //         }

// //     } catch (err) {

// //         console.error(err);

// //     } finally {

// //         setLoading(false);
// //     }
// // };

// //     // Update Details
// //     //   Submit Updated Details
// //    const handlechange = async () => {

// //     if (!validateFields()) {
// //         return;
// //     }

// //     try {

// //         setLoading(true);

// //         const alldata = {
// //             Id: Register.Id,
// //             MachineRFID: Register.MachineRFID,
// //             Itemcode: Register.Itemcode,
// //             Location: Register.Location,
// //             Description: Register.Description,
// //             CreatedBy: auth.employeename,
// //             mode: 'U'
// //         };

// //         const response = await axios.post(
// //             `${API_URL}/MachineConfig`,
// //             alldata
// //         );

// //         if (response.status === 200) {

// //             Swal.fire({
// //                 title: 'Updated',
// //                 text: 'Updated Successfully',
// //                 icon: 'success',
// //                 confirmButtonText: 'Done'
// //             });

// //             fetchData();
// //             clearRegister();
// //         }

// //     } catch (err) {

// //         console.error(err);

// //     } finally {

// //         setLoading(false);
// //     }
// // };
// //     // Edit End
// //     const [rowData, setRowData] = useState([]);
// //     const fetchData = async () => {

// //         setLoading(true);

// //         try {

// //             const alldata = {
// //                 mode: 'FetchMachine',
// //                 MachineRFID: '',
// //                 Itemcode: '',
// //                 Location: '',
// //                 Description: '',
// //                 Id: '',
// //                 CreatedBy: ''
// //             };

// //             const response = await axios.post(
// //                 `${API_URL}/MachineConfig`,
// //                 alldata
// //             );

// //             setRowData(response.data);

// //         } catch (error) {

// //             console.error(
// //                 'Error fetching Machine details:',
// //                 error
// //             );

// //         } finally {

// //             setLoading(false);
// //         }
// //     };

// //     const [PlantData, setPlantData] = useState([]);
// //     const fetchPlantData = async () => {
// //         setLoading(true)
// //         const alldata = {
// //             mode: 'GetPlant', branchid: auth.branchid
// //             , MachineNo: ''
// //             , Area: ''
// //             , Id: ''
// //             , WorkCenter: ''
// //             , MachineDescription: ''
// //             , MachineCapacity: ''
// //             , MachineCapacityUOM: ''
// //             , MachineMake: ''
// //             , MachineCycle_Time: ''
// //             , Category: ''
// //             , UOMType: ''
// //             , Status: ''
// //             , CreatedBy: ''
// //             , RFID: ''
// //         }
// //         try {
// //             const response = await axios.post(`${API_URL}/MachineConfig`, alldata);
// //             setPlantData(response.data);
// //             if (response.status === 200) {
// //                 setLoading(false)
// //             }
// //         } catch (error) {
// //             setLoading(false)
// //             console.error('Error fetching user details:', error);
// //         }
// //     };

// //     const [AreaData, setAreaData] = useState([]);
// //     const fetchAreaDataData = async () => {
// //         setLoading(true)
// //         const alldata = {
// //             mode: 'GetArea', branchid: auth.branchid
// //             , MachineNo: ''
// //             , Area: ''
// //             , Id: ''
// //             , WorkCenter: ''
// //             , MachineDescription: ''
// //             , MachineCapacity: ''
// //             , MachineCapacityUOM: ''
// //             , MachineMake: ''
// //             , MachineCycle_Time: ''
// //             , Category: ''
// //             , UOMType: ''
// //             , Status: ''
// //             , CreatedBy: ''
// //             , RFID: ''
// //         }
// //         try {
// //             const response = await axios.post(`${API_URL}/MachineConfig`, alldata);
// //             setAreaData(response.data);
// //             if (response.status === 200) {
// //                 setLoading(false)
// //             }
// //         } catch (error) {
// //             setLoading(false)
// //             console.error('Error fetching user details:', error);
// //         }
// //     };

// //     const columdef = [
// //         {
// //             headerName: "Machine RFID",
// //             field: "MachineRFID",
// //             filter: true,
// //             floatingFilter: true,
// //             headerClass: 'agheader',
// //             width: 150,
// //         },
// //         {
// //             headerName: "Item Code",
// //             field: "Itemcode",
// //             filter: true,
// //             floatingFilter: true,
// //             headerClass: 'agheader',
// //             width: 150,
// //         },
// //         {
// //             headerName: "Location",
// //             field: "Location",
// //             filter: true,
// //             floatingFilter: true,
// //             headerClass: 'agheader',
// //             width: 180,
// //         },
// //         {
// //             headerName: "Description",
// //             field: "Description",
// //             filter: true,
// //             floatingFilter: true,
// //             headerClass: 'agheader',
// //             width: 250,
// //         },
// //         {
// //             headerName: "View",
// //             field: "View",
// //             headerClass: 'agheader',
// //             cellRenderer: ViewRenderer,
// //             width: 80,
// //             pinned: 'right',
// //         },
// //         {
// //             headerName:
// //                 pageData.editstatus === null || pageData.editstatus === "i"
// //                     ? ""
// //                     : "Edit",
// //             field: "Edit",
// //             cellRenderer: EditRenderer,
// //             width: 80,
// //             pinned: 'right',
// //             headerClass: 'agheader',
// //         },
// //         {
// //             headerName: "Delete",
// //             field: "Delete",
// //             headerClass: 'agheader',
// //             pinned: 'right',
// //             cellRenderer: DeleteRenderer,
// //             width: 90,
// //         },
// //     ];

// //     const autoGroupColumnDef = useMemo(() => {
// //         return {
// //             headerCheckboxSelection: true,
// //             field: "Id",
// //             flex: 1,
// //             minWidth: 240,
// //             cellRendererParams: {
// //                 checkbox: true,
// //             },
// //         };
// //     }, []);


// //     // Download PDF Format Start
// //     const generatePDF = async () => {
// //         setLoading(true);

// //         try {
// //             const filteredData = gridRef.current.api.getModel().rowsToDisplay.map(rowNode => rowNode.data);
// //             const doc = new jsPDF({ format: 'a2' });

// //             const title = 'Machine Master';
// //             const currentUser = auth.employeename || 'Unknown User';
// //             const currentDateTime = new Date().toLocaleString();

// //             const pageWidth = doc.internal.pageSize.width;
// //             const titleY = 15;

// //             const logoWidth = 15;
// //             const logoHeight = 15;
// //             doc.addImage(logo, 'PNG', 10, 10, logoWidth, logoHeight);

// //             doc.setFontSize(14);
// //             doc.setFont("helvetica", "bold");
// //             doc.text(title, pageWidth / 2, titleY, { align: 'center' });

// //             if (filteredData.length > 0) {
// //                 const columnMapping = [
// //                     { header: "RFID", key: "RFID" },
// //                     { header: "Plant Code", key: "branchid" },
// //                     { header: "Area", key: "Area" },
// //                     { header: "Machine No", key: "MachineNo" },
// //                     { header: "Machine Description", key: "MachineDescription" },
// //                     { header: "Machine Capacity", key: "MachineCapacity" },
// //                     { header: "Make", key: "MachineMake" },
// //                     { header: "Work Center", key: "WorkCenter" },
// //                     { header: "SPM", key: "MachineCycle_Time" },
// //                     { header: "Category", key: "Category" },
// //                     { header: "Machine UOM", key: "UOMType" },
// //                     { header: "Machine Capacity UOM", key: "MachineCapacityUOM" },
// //                     { header: "Created Date", key: "CreatedDate" },
// //                 ];

// //                 const columnHeaders = columnMapping.map(col => col.header);
// //                 const data = filteredData.map(obj => columnMapping.map(col => obj[col.key] || ''));

// //                 doc.autoTable({
// //                     head: [columnHeaders],
// //                     body: data,
// //                     margin: { top: 30, right: 10, left: 10, bottom: 20 },
// //                     theme: 'grid',
// //                     styles: {
// //                         fontSize: 10,
// //                         halign: "center",
// //                         valign: "middle",
// //                         overflow: 'linebreak',
// //                         cellWidth: 'auto',
// //                         lineColor: [0, 0, 0],
// //                         lineWidth: 0.1,
// //                     },
// //                     headStyles: {
// //                         fillColor: ['#3f77d2'],
// //                         textColor: [255, 255, 255],
// //                         lineColor: [0, 0, 0],
// //                         lineWidth: 0.1,
// //                         fontStyle: 'bold'
// //                     },
// //                     bodyStyles: {
// //                         fillColor: [245, 245, 245],
// //                         textColor: [0, 0, 0],
// //                         lineColor: [0, 0, 0],
// //                         lineWidth: 0.1,
// //                     },
// //                     didDrawPage: function (data) {
// //                         const pageWidth = doc.internal.pageSize.width;
// //                         const pageHeight = doc.internal.pageSize.height;

// //                         doc.addImage(logo, 'PNG', 10, 10, 30, 10);
// //                         doc.setFontSize(10);
// //                         doc.text(`User: ${currentUser}`, pageWidth - 11, 12, { align: 'right' });
// //                         doc.text(`Date: ${currentDateTime}`, pageWidth - 11, 18, { align: 'right' });

// //                         doc.setFontSize(14);
// //                         doc.setFont("helvetica", "bold");
// //                         doc.text(title, pageWidth / 2, 15, { align: 'center' });

// //                         doc.setFontSize(10);
// //                         doc.text(`Page ${data.pageNumber}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
// //                     }
// //                 });


// //                 doc.save('Machine_Master.pdf');
// //                 setLoading(false);
// //             } else {
// //                 alert('No data available to export');
// //                 setLoading(false);
// //             }
// //         } catch (error) {
// //             console.error("Error generating PDF:", error);
// //             alert('Failed to generate PDF. Please try again.');
// //             setLoading(false);
// //         }
// //     };
// //     // Download PDF Format END

// //     const gridRef = useRef(null);
// //     const onExportClick = () => {
// //         const params = {
// //             fileName: 'Machines_Details.csv',
// //             columnKeys: ['RFID', 'branchid', 'Area', 'MachineNo', 'MachineDescription', 'MachineCapacity', 'MachineMake', 'WorkCenter', 'MachineCycle_Time', 'Category', 'UOMType', 'MachineCapacityUOM', 'CreatedDate'],
// //         };
// //         gridRef.current.api.exportDataAsCsv(params);
// //     };

// //     useEffect(() => {
// //         fetchData();
// //         FetchCategoryDropdown();
// //         fetchPlantData();
// //         fetchAreaDataData();
// //         fetchWorkCenterData();
// //         fetchUOMData();
// //     }, [])
// //     // Handle Import
// //     const handleUploadExcelSheet = (e) => {
// //         const selectedFile = e.target.files[0];

// //         if (selectedFile) {
// //             const fileName = selectedFile.name;
// //             const fileExtension = fileName.split('.').pop().toLowerCase();

// //             if (fileExtension === 'csv' || fileExtension === 'xls' || fileExtension === 'xlsx') {
// //                 setuploadxl(selectedFile);
// //             } else {
// //                 Swal.fire({
// //                     title: 'Invalid File Format',
// //                     text: 'Please select a valid CSV or Excel file format.',
// //                     icon: 'warning'
// //                 });
// //                 setuploadxl(null);
// //                 e.target.value = null; // Clear the file input field
// //             }
// //         }
// //     };
// //     const handleUploadData = async () => {
// //         if (!uploadxl) {
// //             Swal.fire({
// //                 text: 'Please Select Upload File',
// //                 icon: 'warning',
// //             });
// //             return;
// //         }

// //         const result = await Swal.fire({
// //             title: "Are you sure?",
// //             text: "Once uploaded, you will not be able to check the Machine list immediately!",
// //             icon: "warning",
// //             showCancelButton: true,
// //             cancelButtonText: 'Cancel',
// //             confirmButtonText: 'Upload',
// //         });

// //         setLoading(true);

// //         if (result.isConfirmed) {
// //             try {
// //                 const formData = new FormData();
// //                 formData.append('file', uploadxl);
// //                 formData.append('CreatedBy', auth.employeename)
// //                 formData.append('branchid', auth.branchid)
// //                 const response = await axios.post(`${API_URL}/MachineUploadData`, formData, {
// //                     headers: { 'Content-Type': 'multipart/form-data' },
// //                 });

// //                 const { message, uploadcount, unuploadedFilePath } = response.data;
// //                 if (unuploadedFilePath) {
// //                     fetchData();

// //                     swal({
// //                         heightAuto: true,
// //                         title: `Total Uploaded Count: ${uploadcount}`,
// //                         text: "Some Machine data could not be uploaded. Please download the file to see the errors.",
// //                         icon: 'warning',
// //                         buttons: {
// //                             cancel: "OK",
// //                             download: {
// //                                 text: "Download File",
// //                                 value: "download",
// //                             },
// //                         },
// //                     }).then((value) => {
// //                         if (value === "download") {
// //                             const link = document.createElement('a');
// //                             link.href = `${API_URL}${unuploadedFilePath}`;
// //                             link.setAttribute('download', 'unuploaded_Machine_data.xlsx');
// //                             document.body.appendChild(link);
// //                             link.click();
// //                             link.parentNode.removeChild(link);
// //                         }
// //                     });
// //                 } else {
// //                     fetchData()

// //                     Swal.fire({
// //                         title: `Total Uploaded Count: ${uploadcount}`,
// //                         text: 'All data uploaded successfully',
// //                         icon: 'success',
// //                     });
// //                 }
// //             } catch (err) {
// //                 console.error(err);
// //                 setLoading(false);
// //                 Swal.fire({
// //                     title: 'Please Upload Valid File',
// //                     icon: 'error',
// //                 });
// //             } finally {
// //                 setUploadvisible(false);
// //                 setLoading(false);
// //             }
// //         }
// //     };
// //     const validateFields = () => {

// //         const fieldsToCheck = [
// //             {
// //                 key: 'MachineRFID',
// //                 message: 'Please Enter Machine RFID'
// //             },
// //             {
// //                 key: 'Itemcode',
// //                 message: 'Please Enter Item Code'
// //             },
// //             {
// //                 key: 'Location',
// //                 message: 'Please Enter Location'
// //             },
// //             {
// //                 key: 'Description',
// //                 message: 'Please Enter Description'
// //             },
// //         ];

// //         for (const field of fieldsToCheck) {

// //             if (!Register[field.key]?.trim()) {

// //                 Swal.fire({
// //                     title: field.message,
// //                     icon: 'warning',
// //                     confirmButtonText: 'Done'
// //                 });

// //                 return false;
// //             }
// //         }

// //         return true;
// //     };


// //     //   Submit Details
// //     const handlecheck = async () => {

// //         if (!validateFields()) {
// //             return;
// //         }

// //         const isExisting = rowData.some((item) =>
// //             item.MachineRFID?.toLowerCase() ===
// //             Register.MachineRFID?.toLowerCase()
// //         );

// //         if (isExisting) {

// //             Swal.fire({
// //                 text: "This Machine RFID Already Exists",
// //                 icon: "warning"
// //             });

// //             return;
// //         }

// //         try {

// //             setLoading(true);

// //             const alldata = {
// //                 MachineRFID: Register.MachineRFID,
// //                 Itemcode: Register.Itemcode,
// //                 Location: Register.Location,
// //                 Description: Register.Description,
// //                 CreatedBy: auth.employeename,
// //                 mode: 'I'
// //             };

// //             console.log("Save Data:", alldata);

// //             const response = await axios.post(
// //                 `${API_URL}/MachineConfig`,
// //                 alldata
// //             );

// //             if (response.status === 200) {

// //                 Swal.fire({
// //                     title: 'Saved Successfully',
// //                     icon: 'success',
// //                     confirmButtonText: 'Done'
// //                 }).then(() => {

// //                     setIsModalVisible(false);

// //                     fetchData();

// //                     clearRegister();
// //                 });
// //             }

// //         } catch (err) {

// //             console.error(err);

// //             Swal.fire({
// //                 title: 'Error',
// //                 text: 'Unable to save Machine details',
// //                 icon: 'error'
// //             });

// //         } finally {

// //             setLoading(false);
// //         }
// //     };
// //     const [CategoryDropDownData, SetCategoryDropDownData] = useState([])

// //     const FetchCategoryDropdown = async () => {
// //         try {
// //             const alldata = { mode: 'FetchCategory', branchid: auth.branchid, MachineNo: '', Area: '', Id: '', WorkCenter: '', MachineDescription: '', MachineCapacity: '', MachineCapacityUOM: '', MachineMake: '', MachineCycle_Time: '', Category: '', UOMType: '', Status: '', CreatedBy: '', RFID: '' };
// //             const response = await axios.post(`${API_URL}/MachineConfig`, alldata);
// //             if (response.status === 200) {
// //                 SetCategoryDropDownData(response.data);
// //             }
// //         } catch (err) {
// //             console.log(err);
// //         }
// //     };

// //     // const handleClear = () => {
// //     //     setRegister({
// //     //         ...Register, branchid: auth.branchid, MachineNo: '', Area: '', AreaId: '', Id: '', WorkCenter: '', WorkCenterId: '', MachineDescription: '', MachineCapacity: '', MachineCapacityUOM: '', MachineMake: '', MachineCycle_Time: '', Category: '', CategoryId: '', UOMType: '', UOMTypeId: '', Status: '', CreatedBy: '', RFID: ''
// //     //     })
// //     // }

// //     const clearRegister = () => {

// //         setRegister({
// //             MachineRFID: '',
// //             Itemcode: '',
// //             Location: '',
// //             Description: '',
// //             Id: '',
// //             CreatedBy: '',
// //         });
// //     };


// //     const [WorkCenterData, setWorkCenterData] = useState([]);
// //     const fetchWorkCenterData = async () => {
// //         setLoading(true)
// //         const alldata = {
// //             mode: 'GetWorkCenter', branchid: auth.branchid
// //             , MachineNo: ''
// //             , Area: ''
// //             , Id: ''
// //             , WorkCenter: ''
// //             , MachineDescription: ''
// //             , MachineCapacity: ''
// //             , MachineCapacityUOM: ''
// //             , MachineMake: ''
// //             , MachineCycle_Time: ''
// //             , Category: ''
// //             , UOMType: ''
// //             , Status: ''
// //             , CreatedBy: ''
// //             , RFID: ''
// //         }
// //         try {
// //             const response = await axios.post(`${API_URL}/MachineConfig`, alldata);
// //             setWorkCenterData(response.data);
// //             if (response.status === 200) {
// //                 setLoading(false)
// //             }
// //         } catch (error) {
// //             setLoading(false)
// //             console.error('Error fetching user details:', error);
// //         }
// //     };

// //     const [UOMData, setUOMData] = useState([]);
// //     const fetchUOMData = async () => {
// //         setLoading(true)
// //         const alldata = {
// //             mode: 'GetUOM', branchid: auth.branchid
// //             , MachineNo: ''
// //             , Area: ''
// //             , Id: ''
// //             , WorkCenter: ''
// //             , MachineDescription: ''
// //             , MachineCapacity: ''
// //             , MachineCapacityUOM: ''
// //             , MachineMake: ''
// //             , MachineCycle_Time: ''
// //             , Category: ''
// //             , UOMType: ''
// //             , Status: ''
// //             , CreatedBy: ''
// //             , RFID: ''
// //         }
// //         try {
// //             const response = await axios.post(`${API_URL}/MachineConfig`, alldata);
// //             setUOMData(response.data);
// //             if (response.status === 200) {
// //                 setLoading(false)
// //             }
// //         } catch (error) {
// //             setLoading(false)
// //             console.error('Error fetching user details:', error);
// //         }
// //     };

// //     return (
// //         <>

// //             {loading && (
// //                 <div className="loading-overlay">
// //                     <div className="loading-spinner">

// //                         (<BallTriangle
// //                             height={100}
// //                             width={100}
// //                             radius={5}
// //                             color="#4fa94d"
// //                             ariaLabel="ball-triangle-loading"
// //                             wrapperStyle={{}}
// //                             wrapperclassName=""
// //                             visible={true}
// //                         />)

// //                     </div>
// //                 </div>
// //             )}

// //             {/* Delete */}
// //             <CModal
// //                 size='sm'
// //                 alignment="center"
// //                 visible={deletevisible}
// //                 onClose={() => setDeletevisible(false)}
// //                 aria-labelledby="VerticallyCenteredExample"
// //                 backdrop='static'
// //             >
// //                 <CModalTitle id="VerticallyCenteredExample" className='ms-3'>Are you sure?</CModalTitle>
// //                 <CModalBody>
// //                     <p>This operation can&apos;t be reverted</p>
// //                 </CModalBody>
// //                 <CModalFooter>
// //                     <CButton color="secondary" className='btn-hover-effect' onClick={() => setDeletevisible(false)}>
// //                         CANCEL
// //                     </CButton>
// //                     <CButton color="primary" className='btn-hover-effect' onClick={() => handleconfirmDelete()} >CONFIRM</CButton>
// //                 </CModalFooter>
// //             </CModal>
// //             <div >


// //                 {/* Modal for Download Format Register Asset*/}
// //                 <div className="modal fade" id="exampleModal" tabIndex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
// //                     <div className="modal-dialog modal-dialog-centered">
// //                         <div className="modal-content">
// //                             <div className="modal-header p-2" style={{ background: '#3f77d2' }}>
// //                                 <h1 className="modal-title fs-5 text-white" id="exampleModalLabel ">Download Format</h1>
// //                                 <button type="button" className="btn-close btn-hover-effect me-2" data-bs-dismiss="modal" aria-label="Close" style={{
// //                                     backgroundColor: 'white',
// //                                     color: 'black',
// //                                     border: '1px solid #ccc',
// //                                 }}></button>
// //                             </div>
// //                             <div className="modal-body">
// //                                 <div className="d-flex justify-content-evenly">
// //                                     <div className="btn btn-success" onClick={onExportClick}>
// //                                         <i className="bi bi-file-earmark-spreadsheet fs-1"></i>
// //                                     </div>
// //                                     <div className="btn btn-danger" onClick={generatePDF} >
// //                                         <i className="bi bi-filetype-pdf fs-1"></i>
// //                                     </div>
// //                                 </div>
// //                                 <div className="d-flex justify-content-evenly mt-2">
// //                                     <span className="text-muted">Download Excel Format</span>
// //                                     <span className="text-muted">Download PDF Format</span>
// //                                 </div>
// //                             </div>
// //                         </div>
// //                     </div>
// //                 </div>

// //                 {/* <!-- Modal for View Asset --> */}
// //                 <div className="modal fade" id="exampleModalView" aria-labelledby="exampleModalLabel" aria-hidden="true">
// //                     <div className="modal-dialog modal-xl">
// //                         <div className="modal-content">
// //                             <div className="modal-header" style={{ background: '#3f77d2' }}>
// //                                 <h1 className="modal-title fs-5 text-white" id="exampleModalLabel">Machine Information</h1>
// //                                 <button type="button" className="btn-close btn-hover-effect" data-bs-dismiss="modal" aria-label="Close" style={{
// //                                     backgroundColor: 'white',
// //                                     color: 'black',
// //                                     border: '1px solid #ccc',
// //                                 }} onClick={handleClear}></button>
// //                             </div>
// //                             <div className="modal-body">

// //                                 <div className="row">
// //                                     <div className="col-lg-3 mt-3">
// //                                         <label>RFID</label>
// //                                         <input
// //                                             className="form-control"
// //                                             onChange={(e) => setRegister({ ...Register, RFID: e.target.value })}
// //                                             value={Register.RFID}
// //                                             disabled
// //                                         />
// //                                     </div>
// //                                     <div className="col-lg-3 mt-3">
// //                                         <label>Plant Code</label>
// //                                         <input
// //                                             className="form-control"
// //                                             onChange={(e) => setRegister({ ...Register, branchid: e.target.value })}
// //                                             value={Register.branchid}
// //                                             disabled
// //                                         />
// //                                     </div>

// //                                     <div className="col-lg-3 mt-3">
// //                                         <label>Area</label>
// //                                         <input
// //                                             className="form-control"
// //                                             onChange={(e) => setRegister({ ...Register, Area: e.target.value })}
// //                                             value={Register.Area}
// //                                             disabled
// //                                         />
// //                                     </div>

// //                                     <div className="col-lg-3 mt-3">
// //                                         <label>Machine No</label>
// //                                         <input
// //                                             className="form-control"
// //                                             onChange={(e) => setRegister({ ...Register, MachineNo: e.target.value })}
// //                                             value={Register.MachineNo} disabled
// //                                         />
// //                                     </div>

// //                                     <div className="col-lg-3 mt-3">
// //                                         <label>Machine Description</label>
// //                                         <input
// //                                             className="form-control"
// //                                             onChange={(e) => setRegister({ ...Register, MachineDescription: e.target.value })}
// //                                             value={Register.MachineDescription} disabled
// //                                         />
// //                                     </div>
// //                                     <div className="col-lg-3 mt-3">
// //                                         <label> Make</label>
// //                                         <input
// //                                             className="form-control"
// //                                             onChange={(e) => setRegister({ ...Register, MachineMake: e.target.value })}
// //                                             value={Register.MachineMake} disabled
// //                                         />
// //                                     </div>
// //                                     <div className="col-lg-3 mt-3">
// //                                         <label>Capacity</label>
// //                                         <input
// //                                             className="form-control"
// //                                             onChange={(e) => setRegister({ ...Register, MachineCapacity: e.target.value })}
// //                                             value={Register.MachineCapacity} disabled
// //                                         />
// //                                     </div>
// //                                     <div className="col-lg-3 mt-3">
// //                                         <label>SPM</label>
// //                                         <input
// //                                             className="form-control"
// //                                             onChange={(e) => setRegister({ ...Register, MachineCycle_Time: e.target.value })}
// //                                             value={Register.MachineCycle_Time} disabled
// //                                         />
// //                                     </div>
// //                                     <div className="col-lg-3 mt-3">
// //                                         <label>Category</label>
// //                                         <input
// //                                             className="form-control"
// //                                             onChange={(e) => setRegister({ ...Register, Category: e.target.value })}
// //                                             value={Register.Category} disabled
// //                                         />
// //                                     </div>
// //                                     <div className="col-lg-3 mt-3">
// //                                         <label>Work Center</label>
// //                                         <input
// //                                             className="form-control"
// //                                             onChange={(e) => setRegister({ ...Register, WorkCenter: e.target.value })}
// //                                             value={Register.WorkCenter} disabled
// //                                         />
// //                                     </div>
// //                                 </div>
// //                                 <div className='row'>
// //                                     <h6>Machine UOM Details</h6>
// //                                     <div className="col-lg-3 mt-3">
// //                                         <label>Machine UOM</label>
// //                                         <input
// //                                             className="form-control"
// //                                             onChange={(e) => setRegister({ ...Register, UOMType: e.target.value })}
// //                                             value={Register.UOMType} disabled
// //                                         />
// //                                     </div>
// //                                     <div className="col-lg-3 mt-3">
// //                                         <label>Machine UOM Capacity</label>
// //                                         <input
// //                                             className="form-control"
// //                                             onChange={(e) => setRegister({ ...Register, MachineCapacityUOM: e.target.value })}
// //                                             value={Register.MachineCapacityUOM} disabled
// //                                         />
// //                                     </div>
// //                                 </div>
// //                             </div>

// //                         </div>
// //                     </div>
// //                 </div>

// //                 {/* Modal For Edit Asset */}
// //                 <div className="row">

// //                     <div className="col-lg-6 col-md-6 col-sm-12 mt-3">
// //                         <label className="form-label">
// //                             Machine RFID <span className="text-danger">*</span>
// //                         </label>

// //                         <input
// //                             className="form-control"
// //                             value={Register.MachineRFID}
// //                             onChange={(e) =>
// //                                 setRegister({
// //                                     ...Register,
// //                                     MachineRFID: e.target.value
// //                                 })
// //                             }
// //                         />
// //                     </div>

// //                     <div className="col-lg-6 col-md-6 col-sm-12 mt-3">
// //                         <label className="form-label">
// //                             Item Code <span className="text-danger">*</span>
// //                         </label>

// //                         <input
// //                             className="form-control"
// //                             value={Register.Itemcode}
// //                             onChange={(e) =>
// //                                 setRegister({
// //                                     ...Register,
// //                                     Itemcode: e.target.value
// //                                 })
// //                             }
// //                         />
// //                     </div>

// //                     <div className="col-lg-6 col-md-6 col-sm-12 mt-3">
// //                         <label className="form-label">
// //                             Location <span className="text-danger">*</span>
// //                         </label>

// //                         <input
// //                             className="form-control"
// //                             value={Register.Location}
// //                             onChange={(e) =>
// //                                 setRegister({
// //                                     ...Register,
// //                                     Location: e.target.value
// //                                 })
// //                             }
// //                         />
// //                     </div>

// //                     <div className="col-lg-6 col-md-6 col-sm-12 mt-3">
// //                         <label className="form-label">
// //                             Description <span className="text-danger">*</span>
// //                         </label>

// //                         <textarea
// //                             className="form-control"
// //                             rows="2"
// //                             value={Register.Description}
// //                             onChange={(e) =>
// //                                 setRegister({
// //                                     ...Register,
// //                                     Description: e.target.value
// //                                 })
// //                             }
// //                         />
// //                     </div>

// //                 </div>

// //                 {/* Modal For Add Machine*/}
// //                 <CModal
// //                     visible={isModalVisible}
// //                     onClose={() => setIsModalVisible(false)}
// //                     backdrop='static'
// //                     size="xl"
// //                     alignment="center"
// //                 >
// //                     <CModalHeader style={{ background: '#3f77d2' }}

// //                     >
// //                         <CModalTitle className="text-white"  >Add Machine</CModalTitle>
// //                     </CModalHeader>
// //                     <CModalBody>
// //                         <div className="row">

// //                             {/* Machine RFID */}
// //                             <div className="col-lg-6 col-md-6 col-sm-12 mt-3">
// //                                 <label className="form-label">
// //                                     Machine RFID <span className="text-danger">*</span>
// //                                 </label>

// //                                 <input
// //                                     type="text"
// //                                     className="form-control"
// //                                     placeholder="Enter Machine RFID"
// //                                     value={Register.MachineRFID}
// //                                     onChange={(e) =>
// //                                         setRegister({
// //                                             ...Register,
// //                                             MachineRFID: e.target.value,
// //                                         })
// //                                     }
// //                                 />
// //                             </div>

// //                             {/* Item Code */}
// //                             <div className="col-lg-6 col-md-6 col-sm-12 mt-3">
// //                                 <label className="form-label">
// //                                     Item Code <span className="text-danger">*</span>
// //                                 </label>

// //                                 <input
// //                                     type="text"
// //                                     className="form-control"
// //                                     placeholder="Enter Item Code"
// //                                     value={Register.Itemcode}
// //                                     onChange={(e) =>
// //                                         setRegister({
// //                                             ...Register,
// //                                             Itemcode: e.target.value,
// //                                         })
// //                                     }
// //                                 />
// //                             </div>

// //                             {/* Location */}
// //                             <div className="col-lg-6 col-md-6 col-sm-12 mt-3">
// //                                 <label className="form-label">
// //                                     Location <span className="text-danger">*</span>
// //                                 </label>

// //                                 <input
// //                                     type="text"
// //                                     className="form-control"
// //                                     placeholder="Enter Location"
// //                                     value={Register.Location}
// //                                     onChange={(e) =>
// //                                         setRegister({
// //                                             ...Register,
// //                                             Location: e.target.value,
// //                                         })
// //                                     }
// //                                 />
// //                             </div>

// //                             {/* Description */}
// //                             <div className="col-lg-6 col-md-6 col-sm-12 mt-3">
// //                                 <label className="form-label">
// //                                     Description <span className="text-danger">*</span>
// //                                 </label>

// //                                 <textarea
// //                                     className="form-control"
// //                                     rows="2"
// //                                     placeholder="Enter Description"
// //                                     value={Register.Description}
// //                                     onChange={(e) =>
// //                                         setRegister({
// //                                             ...Register,
// //                                             Description: e.target.value,
// //                                         })
// //                                     }
// //                                 />
// //                             </div>

// //                         </div>
// //                     </CModalBody>
// //                     <CModalFooter>
// //                         <CButton
// //                             className="mx-2"
// //                             type="button"
// //                             disabled={loading}
// //                             onClick={() => setIsModalVisible(false)} style={{
// //                                 background: 'linear-gradient(135deg, #616161, #616161)',
// //                                 color: '#fff',
// //                                 border: 'none',
// //                                 borderRadius: '12px',
// //                                 fontWeight: 600,
// //                                 padding: '10px 18px',
// //                                 display: 'flex',
// //                                 alignItems: 'center',
// //                                 gap: '3px',
// //                                 boxShadow: '0 4px 15px rgba(100, 100, 100, 0.93)',
// //                                 cursor: loading ? 'not-allowed' : 'pointer',
// //                                 transition: 'all 0.3s ease',
// //                             }}
// //                             onMouseEnter={(e) => {
// //                                 e.currentTarget.style.background = 'linear-gradient(135deg, #616161, #616161)';
// //                                 e.currentTarget.style.transform = 'translateY(-2px)';
// //                                 e.currentTarget.style.boxShadow = '0 6px 20px rgba(117, 117, 117, 0.45)';
// //                             }}
// //                             onMouseLeave={(e) => {
// //                                 e.currentTarget.style.background = 'linear-gradient(135deg, #616161, #616161)';
// //                                 e.currentTarget.style.transform = 'translateY(0)';
// //                                 e.currentTarget.style.boxShadow = '0 4px 15px rgba(100, 100, 100, 0.93)';
// //                             }}
// //                         >
// //                             <CIcon icon={cilX} /> Close
// //                         </CButton>
// //                         <button
// //                             type="button"
// //                             className="btn btn-hover-effect d-flex align-items-center gap-2"
// //                             onClick={handlecheck}
// //                             style={{
// //                                 background: 'linear-gradient(135deg, #00c853, #009624)',
// //                                 color: '#fff',
// //                                 border: 'none',
// //                                 borderRadius: '12px',
// //                                 fontWeight: 600,
// //                                 padding: '10px 22px',
// //                                 boxShadow: '0 4px 15px rgba(0, 200, 83, 0.35)',
// //                                 transition: 'all 0.3s ease',
// //                                 cursor: 'pointer',
// //                             }}
// //                             onMouseEnter={(e) => {
// //                                 e.currentTarget.style.background = 'linear-gradient(135deg, #00e676, #00c853)';
// //                                 e.currentTarget.style.transform = 'translateY(-2px)';
// //                                 e.currentTarget.style.boxShadow = '0 6px 20px rgba(0, 200, 83, 0.45)';
// //                             }}
// //                             onMouseLeave={(e) => {
// //                                 e.currentTarget.style.background = 'linear-gradient(135deg, #00c853, #009624)';
// //                                 e.currentTarget.style.transform = 'translateY(0)';
// //                                 e.currentTarget.style.boxShadow = '0 4px 15px rgba(0, 200, 83, 0.35)';
// //                             }}
// //                         >
// //                             <i className="bi bi-check2-circle"></i> Save
// //                         </button>
// //                     </CModalFooter>

// //                 </CModal>


// //                 {Uploadvisible && (
// //                     <div className={`modal fade ${Uploadvisible ? 'show' : ''}`} style={{ display: Uploadvisible ? 'block' : 'none' }}>
// //                         <div className="modal-dialog modal-dialog-centered modal-lg modal-dialog-scrollable">
// //                             <div className="modal-content card">
// //                                 <div className="modal-header">
// //                                     <h1 className="modal-title fs-5 " id="exampleModalLabel">Import Format</h1>

// //                                     <button type="button" className="btn-close btn-hover-effect" onClick={() => setUploadvisible(false)} style={{
// //                                         backgroundColor: 'white',
// //                                         color: 'black',
// //                                         border: '1px solid #ccc',
// //                                     }}></button>

// //                                 </div>
// //                                 <div className="modal-body">
// //                                     <div className="import-input">
// //                                         <label htmlFor="importdata" className="form-label">Import Data</label>
// //                                         <input
// //                                             type="file"
// //                                             className="form-control"
// //                                             accept=".csv, .xls, .xlsx"
// //                                             onChange={handleUploadExcelSheet}
// //                                         />
// //                                     </div>
// //                                     <hr className="mt-2" />

// //                                     <div className="download-sample-template text-center">
// //                                         <p>Important ⚠</p>
// //                                         <span className='text-danger'>Download The Below The Template That Colum Name Based Enter The Data Then Upload here</span>

// //                                         <a href="/MachineMasterTemp.xlsx" className="nav-link text-decoration-underline" download>
// //                                             Click to Download
// //                                         </a>

// //                                     </div>
// //                                     <div className="text-center mt-3">
// //                                         <button className="btn btn-danger mx-2 btn-hover-effect" onClick={() => setUploadvisible(false)}>
// //                                             CANCEL
// //                                         </button>
// //                                         <button className="btn btn-success mx-2 btn-hover-effect" onClick={handleUploadData}>
// //                                             Upload Data
// //                                         </button>
// //                                     </div>
// //                                 </div>
// //                             </div>
// //                         </div>
// //                     </div>
// //                 )}
// //                 <div className='border header p-3 mx-5' style={{
// //                     background:
// //                         '#025ff3',
// //                 }}>
// //                     <h4 className="mb-0 d-flex justify-content-center">
// //                         <FaUsers className="me-2 text-primary fs-4" />
// //                         <span style={{ color: 'rgb(255, 255, 255)', }}>  Machine Master</span>
// //                     </h4>
// //                     {/* <small className="text-muted">Manage employee records and details</small> */}
// //                     <div className="text-end" style={{ width: "33%" }}>
// //                         <button className="btn-close btn-close-white me-2" onClick={() => navigate("/Settings/Configure")}></button>
// //                     </div>
// //                 </div>



// //                 <div className="d-flex justify-content-end mt-2 gap-2">
// //                     {/* Import */}
// //                     {(pageData.addstatus === null || pageData.addstatus === 'i') && auth.UserStatus === 'A' ? null : (
// //                         <CButton
// //                             type="submit"
// //                             color="primary"
// //                             className="btn-hover-effect  d-flex align-items-center gap-2 ms-2"
// //                             onClick={() => setUploadvisible(true)}
// //                             style={{
// //                                 background: 'linear-gradient(135deg, #007bff, #00b4d8)',
// //                                 color: '#fff',
// //                                 border: 'none',
// //                                 borderRadius: '12px',
// //                                 fontWeight: 600,
// //                                 padding: '10px 18px',
// //                                 boxShadow: '0 4px 15px rgba(0, 123, 255, 0.35)',
// //                                 transition: 'all 0.3s ease',
// //                                 cursor: 'pointer',
// //                             }}
// //                             onMouseEnter={(e) => {
// //                                 e.currentTarget.style.background = 'linear-gradient(135deg, #3399ff, #33ccff)';
// //                                 e.currentTarget.style.transform = 'translateY(-2px)';
// //                                 e.currentTarget.style.boxShadow = '0 6px 20px rgba(51, 204, 255, 0.45)';
// //                             }}
// //                             onMouseLeave={(e) => {
// //                                 e.currentTarget.style.background = 'linear-gradient(135deg, #007bff, #00b4d8)';
// //                                 e.currentTarget.style.transform = 'translateY(0)';
// //                                 e.currentTarget.style.boxShadow = '0 4px 15px rgba(0, 123, 255, 0.35)';
// //                             }}
// //                         >
// //                             <CIcon icon={cilCloudDownload} /> Import
// //                         </CButton>
// //                     )}

// //                     {/* Export */}
// //                     <button
// //                         className="d-flex align-items-center gap-2"
// //                         data-bs-toggle="modal"
// //                         data-bs-target="#exampleModal"
// //                         title="Download Excel"
// //                         style={{
// //                             background: 'linear-gradient(135deg, #ff4b2b, #ff0000)',
// //                             color: '#fff',
// //                             border: 'none',
// //                             borderRadius: '12px',
// //                             fontWeight: 600,
// //                             padding: '10px 18px',
// //                             boxShadow: '0 4px 15px rgba(255, 0, 0, 0.35)',
// //                             transition: 'all 0.3s ease',
// //                             cursor: 'pointer',
// //                         }}
// //                         onMouseEnter={(e) => {
// //                             e.currentTarget.style.background = 'linear-gradient(135deg, #ff6b4b, #ff1a1a)';
// //                             e.currentTarget.style.transform = 'translateY(-2px)';
// //                             e.currentTarget.style.boxShadow = '0 6px 20px rgba(255, 0, 0, 0.45)';
// //                         }}
// //                         onMouseLeave={(e) => {
// //                             e.currentTarget.style.background = 'linear-gradient(135deg, #ff4b2b, #ff0000)';
// //                             e.currentTarget.style.transform = 'translateY(0)';
// //                             e.currentTarget.style.boxShadow = '0 4px 15px rgba(255, 0, 0, 0.35)';
// //                         }}
// //                     >
// //                         <i className="bi bi-cloud-download"></i>
// //                         Export
// //                     </button>

// //                     {/* New */}
// //                     {(pageData.addstatus === null || pageData.addstatus === 'i') && auth.UserStatus === 'A' ? null : (
// //                         <CButton
// //                             type="submit"
// //                             color="success"
// //                             className="me-5 btn-hover-effect  d-flex align-items-center gap-2"
// //                             onClick={() => setIsModalVisible(true)}
// //                             style={{
// //                                 background: 'linear-gradient(135deg, #00c853, #009624)',
// //                                 color: '#fff',
// //                                 border: 'none',
// //                                 borderRadius: '12px',
// //                                 fontWeight: 600,
// //                                 padding: '10px 18px',
// //                                 boxShadow: '0 4px 15px rgba(0, 200, 83, 0.35)',
// //                                 transition: 'all 0.3s ease',
// //                                 cursor: 'pointer',
// //                             }}
// //                             onMouseEnter={(e) => {
// //                                 e.currentTarget.style.background = 'linear-gradient(135deg, #00e676, #00c853)';
// //                                 e.currentTarget.style.transform = 'translateY(-2px)';
// //                                 e.currentTarget.style.boxShadow = '0 6px 20px rgba(0, 200, 83, 0.45)';
// //                             }}
// //                             onMouseLeave={(e) => {
// //                                 e.currentTarget.style.background = 'linear-gradient(135deg, #00c853, #009624)';
// //                                 e.currentTarget.style.transform = 'translateY(0)';
// //                                 e.currentTarget.style.boxShadow = '0 4px 15px rgba(0, 200, 83, 0.35)';
// //                             }}
// //                         >
// //                             <CIcon icon={cilPlus} /> Add
// //                         </CButton>
// //                     )}
// //                 </div>


// //                 {/* Body */}
// //                 <div className="card-body px-5 py-2">
// //                     <div style={{ height: 550, width: '100%', }} className="ag-theme-quartz mt-3" >
// //                         <AgGridReact
// //                             ref={gridRef}
// //                             rowData={rowData}
// //                             columnDefs={columdef}
// //                             rowSelection={"multiple"}
// //                             autoGroupColumnDef={autoGroupColumnDef}
// //                             pagination={pagination}
// //                             paginationPageSize={paginationPageSize}
// //                             paginationPageSizeSelector={paginationPageSizeSelector}
// //                             getRowHeight={() => 45}
// //                         />
// //                     </div>
// //                 </div>
// //             </div >

// //         </>
// //     )
// // }

// // MachineMaster.propTypes = {
// //     auth: PropTypes.any.isRequired,
// // };

// // export default MachineMaster


// import React, { useMemo, useState, useEffect, useRef } from 'react';
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
// import { useLocation, useNavigate } from 'react-router-dom';

// import {
//     CButton,
//     CModal,
//     CModalBody,
//     CModalFooter,
//     CModalHeader,
//     CModalTitle
// } from '@coreui/react';

// import { FaCog, FaEdit, FaEye, FaUsers } from 'react-icons/fa';
// import { getConfig } from 'src/config';

// import {
//     cilCloudDownload,
//     cilPlus,
//     cilTrash,
//     cilX
// } from '@coreui/icons';

// import CIcon from '@coreui/icons-react';


// const MachineMaster = ({ auth }) => {

//     const API_URL = getConfig().REACT_APP_API_URL;

//     const navigate = useNavigate();
//     const location = useLocation();
//     const gridRef = useRef(null);

//     // =========================================================
//     // PAGE DATA
//     // =========================================================

//     let pageData = location.state?.pageData;

//     if (!pageData) {
//         const storedData = localStorage.getItem('pageData');
//         pageData = storedData ? JSON.parse(storedData) : {};
//     }


//     // =========================================================
//     // LOADING
//     // =========================================================

//     const [loading, setLoading] = useState(false);


//     // =========================================================
//     // MODALS
//     // =========================================================

//     const [isModalVisible, setIsModalVisible] = useState(false);
//     const [editModalVisible, setEditModalVisible] = useState(false);
//     const [viewModalVisible, setViewModalVisible] = useState(false);
//     const [deletevisible, setDeletevisible] = useState(false);
//     const [Uploadvisible, setUploadvisible] = useState(false);


//     // =========================================================
//     // DELETE ID
//     // =========================================================

//     const [Editid, SetEditid] = useState(null);


//     // =========================================================
//     // UPLOAD
//     // =========================================================

//     const [uploadxl, setuploadxl] = useState(null);


//     // =========================================================
//     // INITIAL REGISTER DATA
//     // ONLY 4 BUSINESS FIELDS
//     // =========================================================
//     const initialRegister = {
//         MachineId: '',      // ← was Id
//         MachineRFID: '',
//         Itemcode: '',
//         Location: '',
//         Description: '',
//         Createdby: ''       // ← was CreatedBy
//     };

//     const [Register, setRegister] = useState(initialRegister);


//     // =========================================================
//     // CLEAR FORM
//     // =========================================================

//     const handleClear = () => {
//         setRegister(initialRegister);
//     };


//     const clearRegister = () => {
//         setRegister(initialRegister);
//     };


//     // =========================================================
//     // GRID DATA
//     // =========================================================

//     const [rowData, setRowData] = useState([]);

//     const pagination = true;
//     const paginationPageSize = 100;
//     const paginationPageSizeSelector = [10, 50, 100];


//     // =========================================================
//     // FETCH MACHINE DATA
//     // =========================================================

//     const fetchData = async () => {
//         setLoading(true);
//         try {
//             const alldata = {
//                 mode: 'S',
//                 MachineId: '',
//                 MachineRFID: '',
//                 Itemcode: '',
//                 Location: '',
//                 Description: '',
//                 Createdby: '',
//                 updatedby: '',
//                 branchid: auth.branchid || 0,
//                 BranchAccess: auth.BranchAccess || ''
//             };
//             const response = await axios.post(`${API_URL}/MachineConfig`, alldata);
//             setRowData(response.data || []);
//         } catch (error) {
//             console.error('Error fetching Machine details:', error);
//             Swal.fire({ title: 'Error', text: 'Unable to fetch Machine details', icon: 'error' });
//         } finally {
//             setLoading(false);
//         }
//     };

//     // =========================================================
//     // LOAD MACHINE FOR VIEW / EDIT
//     // =========================================================
//     const loadMachine = async (data) => {
//         try {
//             setLoading(true);
//             const alldata = {
//                 mode: 'SD',              // ← was 'E', SP uses 'SD'
//                 MachineId: data.MachineId,
//                 MachineRFID: '',
//                 Itemcode: '',
//                 Location: '',
//                 Description: '',
//                 Createdby: '',
//                 updatedby: '',
//                 branchid: auth.branchid || 0,
//                 BranchAccess: auth.BranchAccess || ''
//             };
//             const response = await axios.post(`${API_URL}/MachineConfig`, alldata);
//             const item = Array.isArray(response.data) ? response.data[0] : response.data;
//             setRegister({
//                 MachineId: item?.MachineId || data.MachineId || '',
//                 MachineRFID: item?.MachineRFID || '',
//                 Itemcode: item?.Itemcode || '',
//                 Location: item?.Location || '',
//                 Description: item?.Description || '',
//                 Createdby: item?.Createdby || ''
//             });
//         } catch (error) {
//             console.error('Error loading Machine details:', error);
//             Swal.fire({ title: 'Error', text: 'Unable to load Machine details', icon: 'error' });
//         } finally {
//             setLoading(false);
//         }
//     };


//     // =========================================================
//     // VIEW
//     // =========================================================

//     const handleView = async (data) => {

//         await loadMachine(data);

//         setViewModalVisible(true);
//     };


//     // =========================================================
//     // VIEW RENDERER
//     // =========================================================

//     const ViewRenderer = (params) => {

//         if (
//             (pageData.viewstatus === null ||
//                 pageData.viewstatus === 'i') &&
//             auth.UserStatus === 'A'
//         ) {
//             return null;
//         }

//         return (
//             <div>

//                 <button
//                     className="btn btn-hover-effect"
//                     onClick={() => handleView(params.data)}
//                 >

//                     <FaEye
//                         className="text-primary cursor-pointer fs-3"
//                         title="View"
//                     />

//                 </button>

//             </div>
//         );
//     };


//     // =========================================================
//     // EDIT
//     // =========================================================

//     const handleEdit = async (data) => {

//         await loadMachine(data);

//         setEditModalVisible(true);
//     };


//     // =========================================================
//     // EDIT RENDERER
//     // =========================================================

//     const EditRenderer = (params) => {

//         if (
//             (pageData.editstatus === null ||
//                 pageData.editstatus === 'i') &&
//             auth.UserStatus === 'A'
//         ) {
//             return null;
//         }

//         return (
//             <div>

//                 <button
//                     onClick={() => handleEdit(params.data)}
//                     className='mt-1 ms-2'
//                     style={{
//                         background:
//                             'linear-gradient(135deg, #007bff, #00b4d8)',
//                         color: '#fff',
//                         border: 'none',
//                         borderRadius: '50%',
//                         padding: '7px',
//                         display: 'flex',
//                         alignItems: 'center',
//                         justifyContent: 'center',
//                         cursor: 'pointer',
//                         boxShadow:
//                             '0 4px 12px rgba(0, 123, 255, 0.35)',
//                         transition: 'all 0.3s ease',
//                     }}

//                     onMouseEnter={(e) => {

//                         e.currentTarget.style.background =
//                             'linear-gradient(135deg, #3399ff, #33ccff)';

//                         e.currentTarget.style.transform =
//                             'translateY(-2px)';

//                         e.currentTarget.style.boxShadow =
//                             '0 6px 18px rgba(51, 204, 255, 0.45)';
//                     }}

//                     onMouseLeave={(e) => {

//                         e.currentTarget.style.background =
//                             'linear-gradient(135deg, #007bff, #00b4d8)';

//                         e.currentTarget.style.transform =
//                             'translateY(0)';

//                         e.currentTarget.style.boxShadow =
//                             '0 4px 12px rgba(0, 123, 255, 0.35)';
//                     }}
//                 >

//                     <FaEdit
//                         className="fs-5"
//                         title="Edit"
//                     />

//                 </button>

//             </div>
//         );
//     };


//     // =========================================================
//     // DELETE RENDERER
//     // =========================================================
//     const DeleteRenderer = (params) => {
//         if ((pageData.deletestatus === null || pageData.deletestatus === 'i') && auth.UserStatus === 'A') return null;
//         return (
//             <div>
//                 <button
//                     className='mt-1 ms-1'
//                     onClick={() => handleDelete(params.data.MachineId)}
//                     style={{
//                         background: 'linear-gradient(135deg, #ff4d4d, #ff1a1a)',
//                         color: '#fff', border: 'none', borderRadius: '50%', padding: '4px',
//                         display: 'flex', alignItems: 'center', justifyContent: 'center',
//                         cursor: 'pointer', boxShadow: '0 4px 12px rgba(255, 0, 0, 0.35)',
//                         transition: 'all 0.3s ease',
//                     }}
//                     onMouseEnter={(e) => { e.currentTarget.style.background = 'linear-gradient(135deg, #ff6666, #ff3333)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
//                     onMouseLeave={(e) => { e.currentTarget.style.background = 'linear-gradient(135deg, #ff4d4d, #ff1a1a)'; e.currentTarget.style.transform = 'translateY(0)'; }}
//                 >
//                     <CIcon icon={cilTrash} size="xl" />
//                 </button>
//             </div>
//         );
//     };

//     // =========================================================
//     // DELETE
//     // =========================================================
//     const handleDelete = (Id) => {
//         try {
//             console.log('Delete clicked, MachineId:', Id);
//             setDeletevisible(true);
//             SetEditid(Id);
//         } catch (err) {
//             console.log(err);
//         }
//     };


//     // =========================================================
//     // CONFIRM DELETE
//     // =========================================================

//     const handleconfirmDelete = async () => {
//         try {
//             setLoading(true);

//             const alldata = {
//                 mode: 'D',
//                 MachineId: Editid,
//                 MachineRFID: '',
//                 Itemcode: '',
//                 Location: '',
//                 Description: '',
//                 Createdby: auth.empid,
//                 updatedby: auth.empid,
//                 branchid: auth.branchid || 0,
//                 BranchAccess: auth.BranchAccess || ''
//             };

//             const response = await axios.post(`${API_URL}/MachineConfig`, alldata);

//             if (response.status === 200) {
//                 setDeletevisible(false);
//                 SetEditid(null);
//                 await fetchData();
//                 swal({ text: 'Deleted Successfully', icon: 'success' });
//             }

//         } catch (err) {
//             console.error(err);
//             Swal.fire({ title: 'Error', text: 'Unable to delete Machine', icon: 'error' });
//         } finally {
//             setLoading(false);
//         }
//     };


//     // =========================================================
//     // VALIDATION
//     // =========================================================

//     const validateFields = () => {

//         const fieldsToCheck = [

//             {
//                 key: 'MachineRFID',
//                 message: 'Please Enter Machine RFID'
//             },

//             {
//                 key: 'Itemcode',
//                 message: 'Please Enter Item Code'
//             },

//             {
//                 key: 'Location',
//                 message: 'Please Enter Location'
//             },

//             {
//                 key: 'Description',
//                 message: 'Please Enter Description'
//             }

//         ];


//         for (const field of fieldsToCheck) {

//             if (!Register[field.key]?.trim()) {

//                 Swal.fire({
//                     title: field.message,
//                     icon: 'warning',
//                     confirmButtonText: 'Done'
//                 });

//                 return false;
//             }
//         }

//         return true;
//     };


//     // =========================================================
//     // ADD MACHINE
//     // =========================================================

//     const handlecheck = async () => {

//         if (!validateFields()) {
//             return;
//         }


//         const isExisting = rowData.some(
//             (item) =>
//                 item.MachineRFID?.trim().toLowerCase() ===
//                 Register.MachineRFID?.trim().toLowerCase()
//         );


//         if (isExisting) {

//             Swal.fire({
//                 text: "This Machine RFID Already Exists",
//                 icon: "warning"
//             });

//             return;
//         }


//         try {

//             setLoading(true);

//             const alldata = {
//                 MachineRFID: Register.MachineRFID.trim(),
//                 Itemcode: Register.Itemcode.trim(),
//                 Location: Register.Location.trim(),
//                 Description: Register.Description.trim(),
//                 Createdby: auth.empid,      // ← was CreatedBy
//                 updatedby: '',
//                 branchid: auth.branchid || 0,      // ← missing
//                 BranchAccess: auth.BranchAccess || '', // ← missing
//                 mode: 'I'
//             };

//             console.log("Save Data:", alldata);


//             const response = await axios.post(
//                 `${API_URL}/MachineConfig`,
//                 alldata
//             );

//             if (response.status === 200) {

//                 setIsModalVisible(false);

//                 clearRegister();

//                 fetchData();


//                 Swal.fire({
//                     title: 'Saved Successfully',
//                     icon: 'success',
//                     confirmButtonText: 'Done'
//                 });
//             }


//         } catch (err) {

//             console.error(err);


//             Swal.fire({
//                 title: 'Error',
//                 text: 'Unable to save Machine details',
//                 icon: 'error'
//             });

//         } finally {

//             setLoading(false);
//         }
//     };


//     // =========================================================
//     // UPDATE MACHINE
//     // =========================================================

//     const handlechange = async () => {

//         if (!validateFields()) {
//             return;
//         }


//         try {

//             setLoading(true);


//             const alldata = {
//                 MachineId: Register.MachineId,
//                 MachineRFID: Register.MachineRFID.trim(),
//                 Itemcode: Register.Itemcode.trim(),
//                 Location: Register.Location.trim(),
//                 Description: Register.Description.trim(),
//                 Createdby: auth.employeename,
//                 updatedby: auth.employeename,
//                 branchid: auth.branchid || 0,
//                 BranchAccess: auth.BranchAccess || '',
//                 mode: 'U'
//             };


//             const response = await axios.post(
//                 `${API_URL}/MachineConfig`,
//                 alldata
//             );


//             if (response.status === 200) {

//                 setEditModalVisible(false);

//                 clearRegister();

//                 await fetchData();


//                 Swal.fire({
//                     title: 'Updated',
//                     text: 'Updated Successfully',
//                     icon: 'success',
//                     confirmButtonText: 'Done'
//                 });
//             }


//         } catch (err) {

//             console.error(err);


//             Swal.fire({
//                 title: 'Error',
//                 text: 'Unable to update Machine details',
//                 icon: 'error'
//             });

//         } finally {

//             setLoading(false);
//         }
//     };


//     // =========================================================
//     // GRID COLUMNS
//     // ONLY 4 FIELDS
//     // =========================================================

//     const columdef = [

//         {
//             headerName: "Machine RFID",
//             field: "MachineRFID",
//             filter: true,
//             floatingFilter: true,
//             headerClass: 'agheader',
//             width: 150,
//         },

//         {
//             headerName: "Item Code",
//             field: "Itemcode",
//             filter: true,
//             floatingFilter: true,
//             headerClass: 'agheader',
//             width: 150,
//         },

//         {
//             headerName: "Location",
//             field: "Location",
//             filter: true,
//             floatingFilter: true,
//             headerClass: 'agheader',
//             width: 180,
//         },

//         {
//             headerName: "Description",
//             field: "Description",
//             filter: true,
//             floatingFilter: true,
//             headerClass: 'agheader',
//             width: 250,
//         },

//         {
//             headerName: "View",
//             field: "View",
//             headerClass: 'agheader',
//             cellRenderer: ViewRenderer,
//             width: 80,
//             pinned: 'right',
//         },

//         {
//             headerName:
//                 pageData.editstatus === null ||
//                     pageData.editstatus === "i"
//                     ? ""
//                     : "Edit",

//             field: "Edit",
//             cellRenderer: EditRenderer,
//             width: 80,
//             pinned: 'right',
//             headerClass: 'agheader',
//         },

//         {
//             headerName: "Delete",
//             field: "Delete",
//             headerClass: 'agheader',
//             pinned: 'right',
//             cellRenderer: DeleteRenderer,
//             width: 90,
//         }

//     ];


//     // =========================================================
//     // AUTO GROUP
//     // =========================================================

//     const autoGroupColumnDef = useMemo(() => {

//         return {

//             headerCheckboxSelection: true,

//             field: "Id",

//             flex: 1,

//             minWidth: 240,

//             cellRendererParams: {
//                 checkbox: true,
//             },

//         };

//     }, []);


//     // =========================================================
//     // PDF EXPORT
//     // ONLY 4 FIELDS
//     // =========================================================

//     const generatePDF = async () => {

//         setLoading(true);

//         try {

//             const filteredData =
//                 gridRef.current.api
//                     .getModel()
//                     .rowsToDisplay
//                     .map(rowNode => rowNode.data);


//             const doc = new jsPDF({
//                 format: 'a2'
//             });


//             const title = 'Machine Master';

//             const currentUser =
//                 auth.employeename || 'Unknown User';

//             const currentDateTime =
//                 new Date().toLocaleString();


//             const pageWidth =
//                 doc.internal.pageSize.width;


//             doc.setFontSize(14);

//             doc.setFont(
//                 "helvetica",
//                 "bold"
//             );


//             doc.text(
//                 title,
//                 pageWidth / 2,
//                 15,
//                 {
//                     align: 'center'
//                 }
//             );


//             if (filteredData.length > 0) {

//                 const columnMapping = [

//                     {
//                         header: "Machine RFID",
//                         key: "MachineRFID"
//                     },

//                     {
//                         header: "Item Code",
//                         key: "Itemcode"
//                     },

//                     {
//                         header: "Location",
//                         key: "Location"
//                     },

//                     {
//                         header: "Description",
//                         key: "Description"
//                     }

//                 ];


//                 const columnHeaders =
//                     columnMapping.map(
//                         col => col.header
//                     );


//                 const data =
//                     filteredData.map(
//                         obj =>
//                             columnMapping.map(
//                                 col =>
//                                     obj[col.key] || ''
//                             )
//                     );


//                 doc.autoTable({

//                     head: [columnHeaders],

//                     body: data,

//                     margin: {
//                         top: 30,
//                         right: 10,
//                         left: 10,
//                         bottom: 20
//                     },

//                     theme: 'grid',

//                     styles: {
//                         fontSize: 10,
//                         halign: "center",
//                         valign: "middle",
//                         overflow: 'linebreak',
//                         cellWidth: 'auto',
//                         lineColor: [0, 0, 0],
//                         lineWidth: 0.1,
//                     },

//                     headStyles: {
//                         fillColor: [63, 119, 210],
//                         textColor: [255, 255, 255],
//                         lineColor: [0, 0, 0],
//                         lineWidth: 0.1,
//                         fontStyle: 'bold'
//                     },

//                     bodyStyles: {
//                         fillColor: [245, 245, 245],
//                         textColor: [0, 0, 0],
//                         lineColor: [0, 0, 0],
//                         lineWidth: 0.1,
//                     },

//                     didDrawPage: function (data) {

//                         const pageWidth =
//                             doc.internal.pageSize.width;

//                         const pageHeight =
//                             doc.internal.pageSize.height;


//                         doc.setFontSize(10);

//                         doc.text(
//                             `User: ${currentUser}`,
//                             pageWidth - 11,
//                             12,
//                             {
//                                 align: 'right'
//                             }
//                         );


//                         doc.text(
//                             `Date: ${currentDateTime}`,
//                             pageWidth - 11,
//                             18,
//                             {
//                                 align: 'right'
//                             }
//                         );


//                         doc.setFontSize(14);

//                         doc.setFont(
//                             "helvetica",
//                             "bold"
//                         );


//                         doc.text(
//                             title,
//                             pageWidth / 2,
//                             15,
//                             {
//                                 align: 'center'
//                             }
//                         );


//                         doc.setFontSize(10);


//                         doc.text(
//                             `Page ${data.pageNumber}`,
//                             pageWidth / 2,
//                             pageHeight - 10,
//                             {
//                                 align: 'center'
//                             }
//                         );

//                     }

//                 });


//                 doc.save(
//                     'Machine_Master.pdf'
//                 );

//             } else {

//                 Swal.fire({
//                     title: 'No Data',
//                     text: 'No data available to export',
//                     icon: 'warning'
//                 });

//             }

//         } catch (error) {

//             console.error(
//                 "Error generating PDF:",
//                 error
//             );

//             Swal.fire({
//                 title: 'Error',
//                 text: 'Failed to generate PDF. Please try again.',
//                 icon: 'error'
//             });

//         } finally {

//             setLoading(false);
//         }
//     };


//     // =========================================================
//     // CSV EXPORT
//     // ONLY 4 FIELDS
//     // =========================================================

//     const onExportClick = () => {

//         if (!gridRef.current?.api) {
//             return;
//         }


//         const params = {

//             fileName:
//                 'Machines_Details.csv',

//             columnKeys: [

//                 'MachineRFID',

//                 'Itemcode',

//                 'Location',

//                 'Description'

//             ]

//         };


//         gridRef.current.api.exportDataAsCsv(
//             params
//         );
//     };


//     // =========================================================
//     // IMPORT FILE
//     // =========================================================

//     const handleUploadExcelSheet = (e) => {

//         const selectedFile =
//             e.target.files[0];


//         if (selectedFile) {

//             const fileName =
//                 selectedFile.name;


//             const fileExtension =
//                 fileName
//                     .split('.')
//                     .pop()
//                     .toLowerCase();


//             if (
//                 fileExtension === 'csv' ||
//                 fileExtension === 'xls' ||
//                 fileExtension === 'xlsx'
//             ) {

//                 setuploadxl(selectedFile);

//             } else {

//                 Swal.fire({

//                     title:
//                         'Invalid File Format',

//                     text:
//                         'Please select a valid CSV or Excel file format.',

//                     icon:
//                         'warning'

//                 });


//                 setuploadxl(null);

//                 e.target.value = null;
//             }
//         }
//     };


//     // =========================================================
//     // UPLOAD DATA
//     // =========================================================

//     const handleUploadData = async () => {

//         if (!uploadxl) {

//             Swal.fire({

//                 text:
//                     'Please Select Upload File',

//                 icon:
//                     'warning',

//             });

//             return;
//         }


//         const result =
//             await Swal.fire({

//                 title:
//                     "Are you sure?",

//                 text:
//                     "Once uploaded, you will not be able to check the Machine list immediately!",

//                 icon:
//                     "warning",

//                 showCancelButton:
//                     true,

//                 cancelButtonText:
//                     'Cancel',

//                 confirmButtonText:
//                     'Upload',

//             });


//         if (!result.isConfirmed) {
//             return;
//         }


//         setLoading(true);


//         try {

//             const formData =
//                 new FormData();


//             formData.append(
//                 'file',
//                 uploadxl
//             );


//             formData.append(
//                 'CreatedBy',
//                 auth.employeename
//             );


//             formData.append(
//                 'branchid',
//                 auth.branchid
//             );


//             const response =
//                 await axios.post(
//                     `${API_URL}/MachineUploadData`,
//                     formData,
//                     {
//                         headers: {
//                             'Content-Type':
//                                 'multipart/form-data'
//                         },
//                     }
//                 );


//             const {
//                 uploadcount,
//                 unuploadedFilePath
//             } = response.data;


//             if (unuploadedFilePath) {

//                 await fetchData();


//                 swal({

//                     heightAuto:
//                         true,

//                     title:
//                         `Total Uploaded Count: ${uploadcount}`,

//                     text:
//                         "Some Machine data could not be uploaded. Please download the file to see the errors.",

//                     icon:
//                         'warning',

//                     buttons: {

//                         cancel:
//                             "OK",

//                         download: {

//                             text:
//                                 "Download File",

//                             value:
//                                 "download",

//                         },

//                     },

//                 }).then((value) => {

//                     if (value === "download") {

//                         const link =
//                             document.createElement('a');


//                         link.href =
//                             `${API_URL}${unuploadedFilePath}`;


//                         link.setAttribute(
//                             'download',
//                             'unuploaded_Machine_data.xlsx'
//                         );


//                         document.body.appendChild(
//                             link
//                         );


//                         link.click();


//                         link.parentNode.removeChild(
//                             link
//                         );
//                     }

//                 });

//             } else {

//                 await fetchData();


//                 Swal.fire({

//                     title:
//                         `Total Uploaded Count: ${uploadcount}`,

//                     text:
//                         'All data uploaded successfully',

//                     icon:
//                         'success',

//                 });

//             }


//         } catch (err) {

//             console.error(err);


//             Swal.fire({

//                 title:
//                     'Please Upload Valid File',

//                 icon:
//                     'error',

//             });

//         } finally {

//             setUploadvisible(false);

//             setuploadxl(null);

//             setLoading(false);
//         }
//     };


//     // =========================================================
//     // INITIAL LOAD
//     // =========================================================

//     useEffect(() => {

//         fetchData();

//     }, []);


//     // =========================================================
//     // RETURN
//     // =========================================================

//     return (

//         <>

//             {/* =====================================================
//                 LOADER
//             ====================================================== */}

//             {loading && (

//                 <div className="loading-overlay">

//                     <div className="loading-spinner">

//                         <BallTriangle
//                             height={100}
//                             width={100}
//                             radius={5}
//                             color="#4fa94d"
//                             ariaLabel="ball-triangle-loading"
//                             visible={true}
//                         />

//                     </div>

//                 </div>
//             )}


//             {/* =====================================================
//                 DELETE MODAL
//             ====================================================== */}

//             <CModal
//                 size='sm'
//                 alignment="center"
//                 visible={deletevisible}
//                 onClose={() =>
//                     setDeletevisible(false)
//                 }
//                 aria-labelledby="VerticallyCenteredExample"
//                 backdrop='static'
//             >

//                 <CModalTitle
//                     id="VerticallyCenteredExample"
//                     className='ms-3'
//                 >
//                     Are you sure?
//                 </CModalTitle>


//                 <CModalBody>

//                     <p>
//                         This operation can&apos;t be reverted
//                     </p>

//                 </CModalBody>


//                 <CModalFooter>

//                     <CButton
//                         color="secondary"
//                         className='btn-hover-effect'
//                         onClick={() =>
//                             setDeletevisible(false)
//                         }
//                     >
//                         CANCEL
//                     </CButton>


//                     <CButton
//                         color="primary"
//                         className='btn-hover-effect'
//                         onClick={handleconfirmDelete}
//                     >
//                         CONFIRM
//                     </CButton>

//                 </CModalFooter>

//             </CModal>


//             <div>


//                 {/* =================================================
//                     EXPORT MODAL
//                 ================================================== */}

//                 <div
//                     className="modal fade"
//                     id="exampleModal"
//                     tabIndex="-1"
//                     aria-labelledby="exampleModalLabel"
//                     aria-hidden="true"
//                 >

//                     <div className="modal-dialog modal-dialog-centered">

//                         <div className="modal-content">

//                             <div
//                                 className="modal-header p-2"
//                                 style={{
//                                     background: '#3f77d2'
//                                 }}
//                             >

//                                 <h1
//                                     className="modal-title fs-5 text-white"
//                                     id="exampleModalLabel"
//                                 >
//                                     Download Format
//                                 </h1>


//                                 <button
//                                     type="button"
//                                     className="btn-close btn-hover-effect me-2"
//                                     data-bs-dismiss="modal"
//                                     aria-label="Close"
//                                     style={{
//                                         backgroundColor: 'white',
//                                         color: 'black',
//                                         border: '1px solid #ccc',
//                                     }}
//                                 />

//                             </div>


//                             <div className="modal-body">

//                                 <div className="d-flex justify-content-evenly">

//                                     <div
//                                         className="btn btn-success"
//                                         onClick={onExportClick}
//                                     >
//                                         <i className="bi bi-file-earmark-spreadsheet fs-1"></i>
//                                     </div>


//                                     <div
//                                         className="btn btn-danger"
//                                         onClick={generatePDF}
//                                     >
//                                         <i className="bi bi-filetype-pdf fs-1"></i>
//                                     </div>

//                                 </div>


//                                 <div className="d-flex justify-content-evenly mt-2">

//                                     <span className="text-muted">
//                                         Download Excel Format
//                                     </span>

//                                     <span className="text-muted">
//                                         Download PDF Format
//                                     </span>

//                                 </div>

//                             </div>

//                         </div>

//                     </div>

//                 </div>


//                 {/* =================================================
//                     VIEW MODAL
//                 ================================================== */}

//                 <CModal
//                     size="xl"
//                     alignment="center"
//                     visible={viewModalVisible}
//                     onClose={() => {
//                         setViewModalVisible(false);
//                         handleClear();
//                     }}
//                     backdrop="static"
//                 >

//                     <CModalHeader
//                         style={{
//                             background: '#3f77d2'
//                         }}
//                     >

//                         <CModalTitle className="text-white">
//                             Machine Information
//                         </CModalTitle>

//                     </CModalHeader>


//                     <CModalBody>

//                         <div className="row">

//                             {/* Machine RFID */}

//                             <div className="col-lg-3 mt-3">

//                                 <label>
//                                     Machine RFID
//                                 </label>

//                                 <input
//                                     className="form-control"
//                                     value={
//                                         Register.MachineRFID
//                                     }
//                                     disabled
//                                 />

//                             </div>


//                             {/* Item Code */}

//                             <div className="col-lg-3 mt-3">

//                                 <label>
//                                     Item Code
//                                 </label>

//                                 <input
//                                     className="form-control"
//                                     value={
//                                         Register.Itemcode
//                                     }
//                                     disabled
//                                 />

//                             </div>


//                             {/* Location */}

//                             <div className="col-lg-3 mt-3">

//                                 <label>
//                                     Location
//                                 </label>

//                                 <input
//                                     className="form-control"
//                                     value={
//                                         Register.Location
//                                     }
//                                     disabled
//                                 />

//                             </div>


//                             {/* Description */}

//                             <div className="col-lg-3 mt-3">

//                                 <label>
//                                     Description
//                                 </label>

//                                 <textarea
//                                     className="form-control"
//                                     rows="2"
//                                     value={
//                                         Register.Description
//                                     }
//                                     disabled
//                                 />

//                             </div>

//                         </div>

//                     </CModalBody>

//                 </CModal>


//                 {/* =================================================
//                     EDIT MODAL
//                 ================================================== */}

//                 <CModal
//                     size="xl"
//                     alignment="center"
//                     visible={editModalVisible}
//                     onClose={() => {
//                         setEditModalVisible(false);
//                         handleClear();
//                     }}
//                     backdrop="static"
//                 >

//                     <CModalHeader
//                         style={{
//                             background: '#3f77d2'
//                         }}
//                     >

//                         <CModalTitle className="text-white">
//                             Edit Machine
//                         </CModalTitle>

//                     </CModalHeader>


//                     <CModalBody>

//                         <div className="row">

//                             {/* Machine RFID */}

//                             <div className="col-lg-6 col-md-6 col-sm-12 mt-3">

//                                 <label className="form-label">

//                                     Machine RFID

//                                     <span className="text-danger">
//                                         *
//                                     </span>

//                                 </label>


//                                 <input
//                                     type="text"
//                                     className="form-control"
//                                     placeholder="Enter Machine RFID"
//                                     value={
//                                         Register.MachineRFID
//                                     }
//                                     onChange={(e) =>
//                                         setRegister({
//                                             ...Register,
//                                             MachineRFID:
//                                                 e.target.value
//                                         })
//                                     }
//                                 />

//                             </div>


//                             {/* Item Code */}

//                             <div className="col-lg-6 col-md-6 col-sm-12 mt-3">

//                                 <label className="form-label">

//                                     Item Code

//                                     <span className="text-danger">
//                                         *
//                                     </span>

//                                 </label>


//                                 <input
//                                     type="text"
//                                     className="form-control"
//                                     placeholder="Enter Item Code"
//                                     value={
//                                         Register.Itemcode
//                                     }
//                                     onChange={(e) =>
//                                         setRegister({
//                                             ...Register,
//                                             Itemcode:
//                                                 e.target.value
//                                         })
//                                     }
//                                 />

//                             </div>


//                             {/* Location */}

//                             <div className="col-lg-6 col-md-6 col-sm-12 mt-3">

//                                 <label className="form-label">

//                                     Location

//                                     <span className="text-danger">
//                                         *
//                                     </span>

//                                 </label>


//                                 <input
//                                     type="text"
//                                     className="form-control"
//                                     placeholder="Enter Location"
//                                     value={
//                                         Register.Location
//                                     }
//                                     onChange={(e) =>
//                                         setRegister({
//                                             ...Register,
//                                             Location:
//                                                 e.target.value
//                                         })
//                                     }
//                                 />

//                             </div>


//                             {/* Description */}

//                             <div className="col-lg-6 col-md-6 col-sm-12 mt-3">

//                                 <label className="form-label">

//                                     Description

//                                     <span className="text-danger">
//                                         *
//                                     </span>

//                                 </label>


//                                 <textarea
//                                     className="form-control"
//                                     rows="2"
//                                     placeholder="Enter Description"
//                                     value={
//                                         Register.Description
//                                     }
//                                     onChange={(e) =>
//                                         setRegister({
//                                             ...Register,
//                                             Description:
//                                                 e.target.value
//                                         })
//                                     }
//                                 />

//                             </div>

//                         </div>

//                     </CModalBody>


//                     <CModalFooter>

//                         <CButton
//                             className="mx-2"
//                             type="button"
//                             disabled={loading}
//                             onClick={() => {
//                                 setEditModalVisible(false);
//                                 handleClear();
//                             }}
//                             style={{
//                                 background:
//                                     'linear-gradient(135deg, #616161, #616161)',
//                                 color: '#fff',
//                                 border: 'none',
//                                 borderRadius: '12px',
//                                 fontWeight: 600,
//                                 padding: '10px 18px',
//                                 display: 'flex',
//                                 alignItems: 'center',
//                                 gap: '3px',
//                                 boxShadow:
//                                     '0 4px 15px rgba(100, 100, 100, 0.93)',
//                                 cursor:
//                                     loading
//                                         ? 'not-allowed'
//                                         : 'pointer',
//                                 transition:
//                                     'all 0.3s ease',
//                             }}
//                         >

//                             <CIcon icon={cilX} />

//                             Close

//                         </CButton>


//                         <button
//                             type="button"
//                             className="btn btn-hover-effect d-flex align-items-center gap-2"
//                             onClick={handlechange}
//                             style={{
//                                 background:
//                                     'linear-gradient(135deg, #00c853, #009624)',
//                                 color: '#fff',
//                                 border: 'none',
//                                 borderRadius: '12px',
//                                 fontWeight: 600,
//                                 padding: '10px 22px',
//                                 boxShadow:
//                                     '0 4px 15px rgba(0, 200, 83, 0.35)',
//                                 transition:
//                                     'all 0.3s ease',
//                                 cursor:
//                                     'pointer',
//                             }}
//                         >

//                             <i className="bi bi-check2-circle"></i>

//                             Update

//                         </button>

//                     </CModalFooter>

//                 </CModal>


//                 {/* =================================================
//                     ADD MACHINE MODAL
//                 ================================================== */}

//                 <CModal
//                     visible={isModalVisible}
//                     onClose={() => {
//                         setIsModalVisible(false);
//                         handleClear();
//                     }}
//                     backdrop='static'
//                     size="xl"
//                     alignment="center"
//                 >

//                     <CModalHeader
//                         style={{
//                             background: '#3f77d2'
//                         }}
//                     >

//                         <CModalTitle className="text-white">
//                             Add Machine
//                         </CModalTitle>

//                     </CModalHeader>


//                     <CModalBody>

//                         <div className="row">

//                             {/* Machine RFID */}

//                             <div className="col-lg-6 col-md-6 col-sm-12 mt-3">

//                                 <label className="form-label">

//                                     Machine RFID

//                                     <span className="text-danger">
//                                         *
//                                     </span>

//                                 </label>


//                                 <input
//                                     type="text"
//                                     className="form-control"
//                                     placeholder="Enter Machine RFID"
//                                     value={
//                                         Register.MachineRFID
//                                     }
//                                     onChange={(e) =>
//                                         setRegister({
//                                             ...Register,
//                                             MachineRFID:
//                                                 e.target.value
//                                         })
//                                     }
//                                 />

//                             </div>


//                             {/* Item Code */}

//                             <div className="col-lg-6 col-md-6 col-sm-12 mt-3">

//                                 <label className="form-label">

//                                     Item Code

//                                     <span className="text-danger">
//                                         *
//                                     </span>

//                                 </label>


//                                 <input
//                                     type="text"
//                                     className="form-control"
//                                     placeholder="Enter Item Code"
//                                     value={
//                                         Register.Itemcode
//                                     }
//                                     onChange={(e) =>
//                                         setRegister({
//                                             ...Register,
//                                             Itemcode:
//                                                 e.target.value
//                                         })
//                                     }
//                                 />

//                             </div>


//                             {/* Location */}

//                             <div className="col-lg-6 col-md-6 col-sm-12 mt-3">

//                                 <label className="form-label">

//                                     Location

//                                     <span className="text-danger">
//                                         *
//                                     </span>

//                                 </label>


//                                 <input
//                                     type="text"
//                                     className="form-control"
//                                     placeholder="Enter Location"
//                                     value={
//                                         Register.Location
//                                     }
//                                     onChange={(e) =>
//                                         setRegister({
//                                             ...Register,
//                                             Location:
//                                                 e.target.value
//                                         })
//                                     }
//                                 />

//                             </div>


//                             {/* Description */}

//                             <div className="col-lg-6 col-md-6 col-sm-12 mt-3">

//                                 <label className="form-label">

//                                     Description

//                                     <span className="text-danger">
//                                         *
//                                     </span>

//                                 </label>


//                                 <textarea
//                                     className="form-control"
//                                     rows="2"
//                                     placeholder="Enter Description"
//                                     value={
//                                         Register.Description
//                                     }
//                                     onChange={(e) =>
//                                         setRegister({
//                                             ...Register,
//                                             Description:
//                                                 e.target.value
//                                         })
//                                     }
//                                 />

//                             </div>

//                         </div>

//                     </CModalBody>


//                     <CModalFooter>

//                         <CButton
//                             className="mx-2"
//                             type="button"
//                             disabled={loading}
//                             onClick={() => {
//                                 setIsModalVisible(false);
//                                 handleClear();
//                             }}
//                             style={{
//                                 background:
//                                     'linear-gradient(135deg, #616161, #616161)',
//                                 color: '#fff',
//                                 border: 'none',
//                                 borderRadius: '12px',
//                                 fontWeight: 600,
//                                 padding: '10px 18px',
//                                 display: 'flex',
//                                 alignItems: 'center',
//                                 gap: '3px',
//                                 boxShadow:
//                                     '0 4px 15px rgba(100, 100, 100, 0.93)',
//                                 cursor:
//                                     loading
//                                         ? 'not-allowed'
//                                         : 'pointer',
//                                 transition:
//                                     'all 0.3s ease',
//                             }}
//                         >

//                             <CIcon icon={cilX} />

//                             Close

//                         </CButton>


//                         <button
//                             type="button"
//                             className="btn btn-hover-effect d-flex align-items-center gap-2"
//                             onClick={handlecheck}
//                             style={{
//                                 background:
//                                     'linear-gradient(135deg, #00c853, #009624)',
//                                 color: '#fff',
//                                 border: 'none',
//                                 borderRadius: '12px',
//                                 fontWeight: 600,
//                                 padding: '10px 22px',
//                                 boxShadow:
//                                     '0 4px 15px rgba(0, 200, 83, 0.35)',
//                                 transition:
//                                     'all 0.3s ease',
//                                 cursor:
//                                     'pointer',
//                             }}
//                         >

//                             <i className="bi bi-check2-circle"></i>

//                             Save

//                         </button>

//                     </CModalFooter>

//                 </CModal>


//                 {/* =================================================
//                     IMPORT MODAL
//                 ================================================== */}

//                 {Uploadvisible && (

//                     <div
//                         className={`modal fade ${Uploadvisible ? 'show' : ''}`}
//                         style={{
//                             display:
//                                 Uploadvisible
//                                     ? 'block'
//                                     : 'none'
//                         }}
//                     >

//                         <div className="modal-dialog modal-dialog-centered modal-lg modal-dialog-scrollable">

//                             <div className="modal-content card">

//                                 <div className="modal-header">

//                                     <h1
//                                         className="modal-title fs-5"
//                                         id="exampleModalLabel"
//                                     >
//                                         Import Format
//                                     </h1>


//                                     <button
//                                         type="button"
//                                         className="btn-close btn-hover-effect"
//                                         onClick={() => {
//                                             setUploadvisible(false);
//                                             setuploadxl(null);
//                                         }}
//                                         style={{
//                                             backgroundColor: 'white',
//                                             color: 'black',
//                                             border: '1px solid #ccc',
//                                         }}
//                                     />

//                                 </div>


//                                 <div className="modal-body">

//                                     <div className="import-input">

//                                         <label
//                                             htmlFor="importdata"
//                                             className="form-label"
//                                         >
//                                             Import Data
//                                         </label>


//                                         <input
//                                             type="file"
//                                             className="form-control"
//                                             accept=".csv, .xls, .xlsx"
//                                             onChange={
//                                                 handleUploadExcelSheet
//                                             }
//                                         />

//                                     </div>


//                                     <hr className="mt-2" />


//                                     <div className="download-sample-template text-center">

//                                         <p>
//                                             Important ⚠
//                                         </p>


//                                         <span className='text-danger'>

//                                             Download The Below The Template That Colum Name Based Enter The Data Then Upload here

//                                         </span>


//                                         <a
//                                             href="/MachineMasterTemp.xlsx"
//                                             className="nav-link text-decoration-underline"
//                                             download
//                                         >
//                                             Click to Download
//                                         </a>

//                                     </div>


//                                     <div className="text-center mt-3">

//                                         <button
//                                             className="btn btn-danger mx-2 btn-hover-effect"
//                                             onClick={() => {
//                                                 setUploadvisible(false);
//                                                 setuploadxl(null);
//                                             }}
//                                         >
//                                             CANCEL
//                                         </button>


//                                         <button
//                                             className="btn btn-success mx-2 btn-hover-effect"
//                                             onClick={handleUploadData}
//                                         >
//                                             Upload Data
//                                         </button>

//                                     </div>

//                                 </div>

//                             </div>

//                         </div>

//                     </div>

//                 )}


//                 {/* =================================================
//                     HEADER
//                 ================================================== */}

//                 {/* <div
//                     className='border header p-3 mx-5'
//                     style={{
//                         background: '#106FB2'
//                     }}
//                 >

//                     <h4 className="mb-0 d-flex justify-content-center">

//                         <FaUsers
//                             className="me-2 text-primary fs-4"
//                         />

//                         <span
//                             style={{
//                                 color: 'rgb(255, 255, 255)'
//                             }}
//                         >
//                             Machine Master
//                         </span>

//                     </h4>


//                     <div
//                         className="text-end"
//                         style={{
//                             width: "33%"
//                         }}
//                     >

//                         <button
//                             className="btn-close btn-close-white me-2"
//                             onClick={() =>
//                                 navigate("/Settings/Configure")
//                             }
//                         />

//                     </div>

//                 </div> */}


//                 {/* =================================================
//                     ACTION BUTTONS
//                 ================================================== */}


//                 {/* =================================================
//                     BODY / AG GRID
//                 ================================================== */}

//                 {/* <div className="card-body px-5 py-2">

//                     <div
//                         style={{
//                             height: 550,
//                             width: '100%',
//                         }}
//                         className="ag-theme-quartz mt-3"
//                     >

//                         <AgGridReact
//                             ref={gridRef}
//                             rowData={rowData}
//                             columnDefs={columdef}
//                             rowSelection={"multiple"}
//                             autoGroupColumnDef={
//                                 autoGroupColumnDef
//                             }
//                             pagination={pagination}
//                             paginationPageSize={
//                                 paginationPageSize
//                             }
//                             paginationPageSizeSelector={
//                                 paginationPageSizeSelector
//                             }
//                             getRowHeight={() => 45}
//                         />

//                     </div>

//                 </div> */}



//                 {/* ==================== MAIN CARD ==================== */}
//                 <div className='card'>
//                     <div className='card-header d-flex justify-content-between align-items-center p-3'
//                         style={{ background: '#106FB2' }}>
//                         <h4 className="mb-0 text-white d-flex align-items-center gap-2">
//                             <FaCog className="fs-4" />Machine Master
//                         </h4>
//                         <button className="btn-close btn-close-white"
//                             onClick={() => navigate("/Settings/Configure")}></button>
//                     </div>

//                     <div className="d-flex justify-content-end mt-2 gap-2 px-3">
//                         {!((pageData.addstatus === null || pageData.addstatus === 'i') && auth.UserStatus === 'A') && (
//                             <CButton type="button" color="primary"
//                                 className="d-flex align-items-center gap-2"
//                                 onClick={() => setUploadvisible(true)}
//                                 style={{
//                                     background: 'linear-gradient(135deg, #007bff, #00b4d8)',
//                                     color: '#fff', border: 'none', borderRadius: '12px',
//                                     fontWeight: 600, padding: '10px 18px',
//                                     boxShadow: '0 4px 15px rgba(0, 123, 255, 0.35)'
//                                 }}>
//                                 <CIcon icon={cilCloudDownload} /> Import
//                             </CButton>
//                         )}

//                         <button className="d-flex align-items-center gap-2"
//                             data-bs-toggle="modal" data-bs-target="#exampleModal"
//                             style={{
//                                 background: 'linear-gradient(135deg, #ff4b2b, #ff0000)',
//                                 color: '#fff', border: 'none', borderRadius: '12px',
//                                 fontWeight: 600, padding: '10px 18px',
//                                 boxShadow: '0 4px 15px rgba(255, 0, 0, 0.35)', cursor: 'pointer'
//                             }}>
//                             <i className="bi bi-cloud-download"></i> Export
//                         </button>

//                         {!((pageData.addstatus === null || pageData.addstatus === 'i') && auth.UserStatus === 'A') && (
//                             <CButton type="button" color="success"
//                                 className="me-3 d-flex align-items-center gap-2"
//                                 onClick={() => { handleClear(); setIsModalVisible(true); }}
//                                 style={{
//                                     background: 'linear-gradient(135deg, #00c853, #009624)',
//                                     color: '#fff', border: 'none', borderRadius: '12px',
//                                     fontWeight: 600, padding: '10px 18px',
//                                     boxShadow: '0 4px 15px rgba(0, 200, 83, 0.35)'
//                                 }}>
//                                 <CIcon icon={cilPlus} /> Add
//                             </CButton>
//                         )}
//                     </div>

//                     <div className='card-body py-3 px-5 mb-4'>
//                         <div className="ag-theme-quartz mt-2" style={{ height: "450px" }}>
//                             <AgGridReact
//                                 ref={gridRef}
//                                 rowData={rowData}
//                                 columnDefs={columdef}
//                                 defaultColDef={{ sortable: true, filter: true, resizable: true }}
//                                 autoGroupColumnDef={autoGroupColumnDef}
//                                 pagination={pagination}
//                                 paginationPageSize={paginationPageSize}
//                                 paginationPageSizeSelector={paginationPageSizeSelector}
//                                 rowSelection="multiple"
//                                 suppressRowClickSelection={true}
//                                 animateRows={true}
//                                 getRowHeight={() => 55}
//                             />
//                         </div>
//                     </div>
//                 </div>

//             </div>

//         </>

//     );
// };


// MachineMaster.propTypes = {
//     auth: PropTypes.any.isRequired,
// };


// export default MachineMaster;



// import React, { useMemo, useState, useEffect, useRef } from 'react';
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
// import { useLocation, useNavigate } from 'react-router-dom';
// import { CButton } from '@coreui/react';
// import { FaEdit, FaEye, FaCog } from 'react-icons/fa';
// import { getConfig } from 'src/config';
// import CIcon from '@coreui/icons-react';
// import { cilCloudDownload, cilPlus, cilTrash, cilX } from '@coreui/icons';

// const MachineMaster = ({ auth }) => {
//     const API_URL = getConfig().REACT_APP_API_URL;
//     console.log('AUTH OBJECT:', auth);
//     const navigate = useNavigate();
//     const location = useLocation();
//     const gridRef = useRef(null);

//     const [Uploadvisible, setUploadvisible] = useState(false);
//     const [uploadxl, setuploadxl] = useState(null);
//     const [loading, setLoading] = useState(false);
//     const [rowData, setRowData] = useState([]);
//     const [isModalVisible, setIsModalVisible] = useState(false);

//     let pageData = location.state?.pageData;
//     if (!pageData) {
//         const storedData = localStorage.getItem('pageData');
//         pageData = storedData ? JSON.parse(storedData) : {};
//     }

//     // =========================================================
//     // REGISTER STATE — ONLY MACHINE FIELDS
//     // =========================================================
//     const initialRegister = {
//         MachineId: '',
//         MachineRFID: '',
//         Itemcode: '',
//         Location: '',
//         Description: ''
//     };

//     const [Register, setRegister] = useState(initialRegister);

//     const handleClear = () => {
//         setRegister(initialRegister);
//     };

//     // =========================================================
//     // FETCH ALL
//     // =========================================================
//     const fetchData = async () => {
//         setLoading(true);
//         try {
//             const alldata = {
//                 mode: 'S',
//                 MachineId: '',
//                 MachineRFID: '',
//                 Itemcode: '',
//                 Location: '',
//                 Description: '',
//                 Createdby: '',
//                 updatedby: '',
//                 branchid: auth.branchid || 0,
//                 BranchAccess: auth.BranchAccess || ''
//             };
//             const response = await axios.post(`${API_URL}/MachineConfig`, alldata);
//             setRowData(response.data || []);
//         } catch (error) {
//             console.error('Error fetching Machine details:', error);
//             Swal.fire({ title: 'Error', text: 'Unable to fetch Machine details', icon: 'error' });
//         } finally {
//             setLoading(false);
//         }
//     };

//     useEffect(() => {
//         fetchData();
//     }, []);

//     // =========================================================
//     // LOAD SINGLE MACHINE (for View / Edit)
//     // =========================================================
//     const loadMachine = async (data) => {
//         try {
//             setLoading(true);
//             const alldata = {
//                 mode: 'SD',
//                 MachineId: data.MachineId,
//                 MachineRFID: '',
//                 Itemcode: '',
//                 Location: '',
//                 Description: '',
//                 Createdby: '',
//                 updatedby: '',
//                 branchid: auth.branchid || 0,
//                 BranchAccess: auth.BranchAccess || ''
//             };
//             const response = await axios.post(`${API_URL}/MachineConfig`, alldata);
//             const item = Array.isArray(response.data) ? response.data[0] : response.data;
//             setRegister({
//                 MachineId: item?.MachineId || data.MachineId || '',
//                 MachineRFID: item?.MachineRFID || '',
//                 Itemcode: item?.Itemcode || '',
//                 Location: item?.Location || '',
//                 Description: item?.Description || '',
//                 Createdby: item?.Createdby || ''
//             });
//         } catch (error) {
//             console.error('Error loading Machine details:', error);
//             Swal.fire({ title: 'Error', text: 'Unable to load Machine details', icon: 'error' });
//         } finally {
//             setLoading(false);
//         }
//     };

//     // =========================================================
//     // VALIDATION
//     // =========================================================
//     const validateFields = () => {
//         const fieldsToCheck = [
//             { key: 'MachineRFID', message: 'Please Enter Machine RFID' },
//             { key: 'Itemcode', message: 'Please Enter Item Code' },
//             { key: 'Location', message: 'Please Enter Location' },
//             { key: 'Description', message: 'Please Enter Description' },
//         ];

//         for (const field of fieldsToCheck) {
//             if (!Register[field.key]?.trim()) {
//                 Swal.fire({ title: field.message, icon: 'warning', confirmButtonText: 'Done' });
//                 return false;
//             }
//         }
//         return true;
//     };

//     // =========================================================
//     // INSERT
//     // =========================================================
//     const handlecheck = async () => {
//         if (!validateFields()) return;

//         const isExisting = rowData.some(
//             (item) => item.MachineRFID?.trim().toLowerCase() === Register.MachineRFID?.trim().toLowerCase()
//         );
//         if (isExisting) {
//             Swal.fire({ text: 'This Machine RFID Already Exists', icon: 'warning' });
//             return;
//         }

//         try {
//             setLoading(true);
//             // Insert
//             const alldata = {
//                 MachineRFID: Register.MachineRFID.trim(),
//                 Itemcode: Register.Itemcode.trim(),
//                 Location: Register.Location.trim(),
//                 Description: Register.Description.trim(),
//                 Createdby: auth.empid,      // 
//                 updatedby: auth.empid,      // 
//                 branchid: auth.branchid || 0,
//                 BranchAccess: auth.BranchAccess || '',
//                 mode: 'I'
//             };

//             const response = await axios.post(`${API_URL}/MachineConfig`, alldata);
//             if (response.status === 200) {
//                 Swal.fire({ title: 'Saved Successfully', icon: 'success', confirmButtonText: 'Done' })
//                     .then(() => {
//                         setIsModalVisible(false);
//                         handleClear();
//                         fetchData();
//                     });
//             }
//         } catch (err) {
//             console.error(err);
//             Swal.fire({ title: 'Error', text: 'Unable to save Machine details', icon: 'error' });
//         } finally {
//             setLoading(false);
//         }
//     };

//     // =========================================================
//     // EDIT (load + open)
//     // =========================================================
//     const handleEdit = async (data) => {
//         await loadMachine(data);
//     };

//     // =========================================================
//     // UPDATE
//     // =========================================================
//     const handlechange = async () => {
//         if (!validateFields()) return;

//         try {
//             setLoading(true);
//             // Update
//             const alldata = {
//                 MachineId: Register.MachineId,
//                 MachineRFID: Register.MachineRFID.trim(),
//                 Itemcode: Register.Itemcode.trim(),
//                 Location: Register.Location.trim(),
//                 Description: Register.Description.trim(),
//                 Createdby: Register.Createdby,   // preserve original creator id (already loaded as int from SP)
//                 updatedby: auth.empid,           // was auth.employeename
//                 branchid: auth.branchid || 0,
//                 BranchAccess: auth.BranchAccess || '',
//                 mode: 'U'
//             };

//             const response = await axios.post(`${API_URL}/MachineConfig`, alldata);
//             if (response.status === 200) {
//                 Swal.fire({ title: 'Updated', text: 'Updated Successfully', icon: 'success', confirmButtonText: 'Done' })
//                     .then(() => {
//                         handleClear();
//                         fetchData();
//                     });
//             }
//         } catch (err) {
//             console.error(err);
//             Swal.fire({ title: 'Error', text: 'Unable to update Machine details', icon: 'error' });
//         } finally {
//             setLoading(false);
//         }
//     };

//     // =========================================================
//     // DELETE
//     // =========================================================
//     const handleDelete = async (data) => {
//         const result = await Swal.fire({
//             title: 'Are you sure?',
//             text: 'Once deleted, you will not be able to recover the data!',
//             icon: 'warning',
//             showCancelButton: true,
//             confirmButtonText: 'Delete',
//             cancelButtonText: 'Cancel'
//         });
//         if (!result.isConfirmed) return;

//         setLoading(true);
//         try {
//             // Delete
//             const alldata = {
//                 mode: 'D',
//                 MachineId: data.MachineId,
//                 MachineRFID: '',
//                 Itemcode: '',
//                 Location: '',
//                 Description: '',
//                 Createdby: '',
//                 updatedby: auth.empid,   // was auth.employeename
//                 branchid: auth.branchid || 0,
//                 BranchAccess: auth.BranchAccess || ''
//             };
//             const response = await axios.post(`${API_URL}/MachineConfig`, alldata);
//             if (response.status === 200) {
//                 Swal.fire({ title: 'Deleted Successfully', icon: 'success', confirmButtonText: 'Done' });
//                 fetchData();
//             }
//         } catch (error) {
//             console.error(error);
//             Swal.fire({ title: 'Error', text: 'Unable to delete Machine', icon: 'error' });
//         } finally {
//             setLoading(false);
//         }
//     };

//     // =========================================================
//     // IMPORT
//     // =========================================================
//     const handleUploadExcelSheet = (e) => {
//         const selectedFile = e.target.files[0];
//         if (selectedFile) {
//             const ext = selectedFile.name.split('.').pop().toLowerCase();
//             if (['csv', 'xls', 'xlsx'].includes(ext)) {
//                 setuploadxl(selectedFile);
//             } else {
//                 Swal.fire({ title: 'Invalid File Format', text: 'Please select CSV or Excel file.', icon: 'warning' });
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
//             title: 'Are you sure?',
//             text: 'Once uploaded, you will not be able to check the Machine list immediately!',
//             icon: 'warning',
//             showCancelButton: true,
//             confirmButtonText: 'Upload',
//             cancelButtonText: 'Cancel'
//         });
//         if (!result.isConfirmed) return;

//         setLoading(true);
//         try {
//             const formData = new FormData();
//             formData.append('file', uploadxl);
//             formData.append('CreatedBy', auth.empid);
//             formData.append('branchid', auth.branchid);

//             const response = await axios.post(`${API_URL}/MachineUploadData`, formData, {
//                 headers: { 'Content-Type': 'multipart/form-data' }
//             });

//             const { uploadcount, unuploadedFilePath } = response.data;
//             await fetchData();

//             if (unuploadedFilePath) {
//                 swal({
//                     heightAuto: true,
//                     title: `Total Uploaded Count: ${uploadcount}`,
//                     text: 'Some Machine data could not be uploaded. Please download the file to see the errors.',
//                     icon: 'warning',
//                     buttons: { cancel: 'OK', download: { text: 'Download File', value: 'download' } }
//                 }).then((value) => {
//                     if (value === 'download') {
//                         const link = document.createElement('a');
//                         link.href = `${API_URL}${unuploadedFilePath}`;
//                         link.setAttribute('download', 'unuploaded_Machine_data.xlsx');
//                         document.body.appendChild(link);
//                         link.click();
//                         link.parentNode.removeChild(link);
//                     }
//                 });
//             } else {
//                 Swal.fire({ title: `Total Uploaded Count: ${uploadcount}`, text: 'All data uploaded successfully', icon: 'success' });
//             }
//         } catch (err) {
//             console.error(err);
//             Swal.fire({ title: 'Please Upload Valid File', icon: 'error' });
//         } finally {
//             setUploadvisible(false);
//             setuploadxl(null);
//             setLoading(false);
//         }
//     };

//     // =========================================================
//     // EXPORT — PDF
//     // =========================================================
//     const generatePDF = () => {
//         setLoading(true);
//         try {
//             const filteredData = gridRef.current.api.getModel().rowsToDisplay.map(r => r.data);

//             if (!filteredData.length) {
//                 Swal.fire({ title: 'No Data', text: 'No data available to export', icon: 'warning' });
//                 setLoading(false);
//                 return;
//             }

//             const doc = new jsPDF({ format: 'a2' });
//             const pageWidth = doc.internal.pageSize.width;
//             const currentUser = auth.employeename || 'Unknown User';
//             const currentDateTime = new Date().toLocaleString();
//             const title = 'Machine Master';

//             const columnMapping = [
//                 { header: 'Machine RFID', key: 'MachineRFID' },
//                 { header: 'Item Code', key: 'Itemcode' },
//                 { header: 'Location', key: 'Location' },
//                 { header: 'Description', key: 'Description' }
//             ];

//             doc.autoTable({
//                 head: [columnMapping.map(c => c.header)],
//                 body: filteredData.map(row => columnMapping.map(c => row[c.key] || '')),
//                 margin: { top: 30, right: 10, left: 10, bottom: 20 },
//                 theme: 'grid',
//                 styles: { fontSize: 10, halign: 'center', valign: 'middle', overflow: 'linebreak', lineColor: [0, 0, 0], lineWidth: 0.1 },
//                 headStyles: { fillColor: [63, 119, 210], textColor: [255, 255, 255], fontStyle: 'bold' },
//                 bodyStyles: { fillColor: [245, 245, 245], textColor: [0, 0, 0] },
//                 didDrawPage: (data) => {
//                     doc.setFontSize(10);
//                     doc.text(`User: ${currentUser}`, pageWidth - 11, 12, { align: 'right' });
//                     doc.text(`Date: ${currentDateTime}`, pageWidth - 11, 18, { align: 'right' });
//                     doc.setFontSize(14);
//                     doc.setFont('helvetica', 'bold');
//                     doc.text(title, pageWidth / 2, 15, { align: 'center' });
//                     doc.setFontSize(10);
//                     doc.text(`Page ${data.pageNumber}`, pageWidth / 2, doc.internal.pageSize.height - 10, { align: 'center' });
//                 }
//             });

//             doc.save('Machine_Master.pdf');
//         } catch (error) {
//             console.error('Error generating PDF:', error);
//             Swal.fire({ title: 'Error', text: 'Failed to generate PDF. Please try again.', icon: 'error' });
//         } finally {
//             setLoading(false);
//         }
//     };

//     const onExportClick = () => {
//         if (!gridRef.current?.api) return;
//         gridRef.current.api.exportDataAsCsv({
//             fileName: 'Machines_Details.csv',
//             columnKeys: ['MachineRFID', 'Itemcode', 'Location', 'Description']
//         });
//     };

//     // =========================================================
//     // RENDERERS
//     // =========================================================
//     const ViewRenderer = (params) => {
//         if ((pageData.viewstatus === null || pageData.viewstatus === 'i') && auth.UserStatus === 'A') return null;
//         return (
//             <button
//                 className="btn btn-hover-effect"
//                 data-bs-toggle="modal"
//                 data-bs-target="#exampleModalView"
//                 onClick={() => loadMachine(params.data)}
//             >
//                 <FaEye className="text-primary cursor-pointer fs-3" title="View" />
//             </button>
//         );
//     };

//     const EditRenderer = (params) => {
//         if ((pageData.editstatus === null || pageData.editstatus === 'i') && auth.UserStatus === 'A') return null;
//         return (
//             <button
//                 onClick={() => handleEdit(params.data)}
//                 data-bs-toggle="modal"
//                 data-bs-target="#exampleModalEdit"
//                 className="mt-1 ms-2"
//                 style={{
//                     background: 'linear-gradient(135deg, #007bff, #00b4d8)',
//                     color: '#fff', border: 'none', borderRadius: '50%', padding: '7px',
//                     display: 'flex', alignItems: 'center', justifyContent: 'center',
//                     cursor: 'pointer', boxShadow: '0 4px 12px rgba(0, 123, 255, 0.35)',
//                     transition: 'all 0.3s ease',
//                 }}
//                 onMouseEnter={(e) => {
//                     e.currentTarget.style.background = 'linear-gradient(135deg, #3399ff, #33ccff)';
//                     e.currentTarget.style.transform = 'translateY(-2px)';
//                 }}
//                 onMouseLeave={(e) => {
//                     e.currentTarget.style.background = 'linear-gradient(135deg, #007bff, #00b4d8)';
//                     e.currentTarget.style.transform = 'translateY(0)';
//                 }}
//             >
//                 <FaEdit className="fs-5" title="Edit" />
//             </button>
//         );
//     };

//     const DeleteRenderer = (params) => {
//         if ((pageData.deletestatus === null || pageData.deletestatus === 'i') && auth.UserStatus === 'A') return null;
//         return (
//             <button
//                 className="mt-1 ms-1"
//                 onClick={() => handleDelete(params.data)}
//                 style={{
//                     background: 'linear-gradient(135deg, #ff4d4d, #ff1a1a)',
//                     color: '#fff', border: 'none', borderRadius: '50%', padding: '4px',
//                     display: 'flex', alignItems: 'center', justifyContent: 'center',
//                     cursor: 'pointer', boxShadow: '0 4px 12px rgba(255, 0, 0, 0.35)',
//                     transition: 'all 0.3s ease',
//                 }}
//                 onMouseEnter={(e) => {
//                     e.currentTarget.style.background = 'linear-gradient(135deg, #ff6666, #ff3333)';
//                     e.currentTarget.style.transform = 'translateY(-2px)';
//                 }}
//                 onMouseLeave={(e) => {
//                     e.currentTarget.style.background = 'linear-gradient(135deg, #ff4d4d, #ff1a1a)';
//                     e.currentTarget.style.transform = 'translateY(0)';
//                 }}
//             >
//                 <CIcon icon={cilTrash} size="xl" />
//             </button>
//         );
//     };

//     const pagination = true;
//     const paginationPageSize = 100;
//     const paginationPageSizeSelector = [10, 50, 100];

//     const columdef = [
//         { headerCheckboxSelection: true, checkboxSelection: true, width: 60 },
//         { headerName: 'Machine RFID', field: 'MachineRFID', filter: true, floatingFilter: true, headerClass: 'agheader', flex: 1, minWidth: 150 },
//         { headerName: 'Item Code', field: 'Itemcode', filter: true, floatingFilter: true, headerClass: 'agheader', flex: 1, minWidth: 150 },
//         { headerName: 'Location', field: 'Location', filter: true, floatingFilter: true, headerClass: 'agheader', flex: 1, minWidth: 180 },
//         { headerName: 'Description', field: 'Description', filter: true, floatingFilter: true, headerClass: 'agheader', flex: 2, minWidth: 250 },
//         { headerName: 'View', field: 'View', headerClass: 'agheader', cellRenderer: ViewRenderer, width: 80, pinned: 'right' },
//         {
//             headerName: (pageData.editstatus === null || pageData.editstatus === 'i') ? '' : 'Edit',
//             field: 'Edit', cellRenderer: EditRenderer, width: 80, pinned: 'right', headerClass: 'agheader',
//         },
//         { headerName: 'Delete', field: 'Delete', headerClass: 'agheader', cellRenderer: DeleteRenderer, width: 90, pinned: 'right' },
//     ];

//     const autoGroupColumnDef = useMemo(() => ({
//         headerCheckboxSelection: true,
//         field: 'MachineId',
//         flex: 1,
//         minWidth: 240,
//         cellRendererParams: { checkbox: true },
//     }), []);

//     // =========================================================
//     // SHARED FORM FIELDS (used by Add/Edit/View modals)
//     // =========================================================
//     const renderFields = (disabled = false) => (
//         <div className="row">
//             {[
//                 { label: 'Machine RFID', key: 'MachineRFID' },
//                 { label: 'Item Code', key: 'Itemcode' },
//                 { label: 'Location', key: 'Location' },
//             ].map(({ label, key }) => (
//                 <div className="col-lg-6 col-md-6 col-sm-12 mt-3" key={key}>
//                     <label className="form-label">
//                         {label} {!disabled && <span className="text-danger">*</span>}
//                     </label>
//                     <input
//                         type="text"
//                         className="form-control"
//                         placeholder={disabled ? '' : `Enter ${label}`}
//                         value={Register[key] || ''}
//                         disabled={disabled}
//                         onChange={(e) => !disabled && setRegister({ ...Register, [key]: e.target.value })}
//                     />
//                 </div>
//             ))}

//             <div className="col-lg-6 col-md-6 col-sm-12 mt-3">
//                 <label className="form-label">
//                     Description {!disabled && <span className="text-danger">*</span>}
//                 </label>
//                 <textarea
//                     className="form-control"
//                     rows="2"
//                     placeholder={disabled ? '' : 'Enter Description'}
//                     value={Register.Description || ''}
//                     disabled={disabled}
//                     onChange={(e) => !disabled && setRegister({ ...Register, Description: e.target.value })}
//                 />
//             </div>
//         </div>
//     );

//     return (
//         <>
//             {loading && (
//                 <div className="loading-overlay">
//                     <div className="loading-spinner">
//                         <BallTriangle height={100} width={100} radius={5} color="#4fa94d" ariaLabel="ball-triangle-loading" visible={true} />
//                     </div>
//                 </div>
//             )}

//             <div>
//                 {/* Import Modal */}
//                 {Uploadvisible && (
//                     <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
//                         <div className="modal-dialog modal-dialog-centered modal-lg modal-dialog-scrollable">
//                             <div className="modal-content card">
//                                 <div className="modal-header">
//                                     <h1 className="modal-title fs-5">Import Format</h1>
//                                     <button
//                                         type="button"
//                                         className="btn-close btn-hover-effect"
//                                         onClick={() => { setUploadvisible(false); setuploadxl(null); }}
//                                     />
//                                 </div>
//                                 <div className="modal-body">
//                                     <div className="import-input">
//                                         <label htmlFor="importdata" className="form-label">Import Data</label>
//                                         <input
//                                             type="file"
//                                             className="form-control"
//                                             accept=".csv, .xls, .xlsx"
//                                             onChange={handleUploadExcelSheet}
//                                         />
//                                     </div>
//                                     <hr className="mt-2" />
//                                     <div className="download-sample-template text-center">
//                                         <p>Important ⚠</p>
//                                         <span className="text-danger">
//                                             Download the template, fill data in the same column format, then upload here.
//                                         </span>
//                                         <br />
//                                         <a href="/MachineMasterTemp.xlsx" className="nav-link text-decoration-underline" download>
//                                             Click to Download
//                                         </a>
//                                     </div>
//                                     <div className="text-center mt-3">
//                                         <button
//                                             className="btn btn-danger mx-2 btn-hover-effect"
//                                             onClick={() => { setUploadvisible(false); setuploadxl(null); }}
//                                         >
//                                             CANCEL
//                                         </button>
//                                         <button className="btn btn-success mx-2 btn-hover-effect" onClick={handleUploadData}>
//                                             Upload Data
//                                         </button>
//                                     </div>
//                                 </div>
//                             </div>
//                         </div>
//                     </div>
//                 )}

//                 {/* Export Modal */}
//                 <div className="modal fade" id="exampleModal" tabIndex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
//                     <div className="modal-dialog modal-dialog-centered">
//                         <div className="modal-content">
//                             <div className="modal-header p-2" style={{ background: '#3f77d2' }}>
//                                 <h1 className="modal-title fs-5 text-white" id="exampleModalLabel">Download Format</h1>
//                                 <button
//                                     type="button"
//                                     className="btn-close btn-hover-effect me-2"
//                                     data-bs-dismiss="modal"
//                                     aria-label="Close"
//                                     style={{ backgroundColor: 'white', color: 'black', border: '1px solid #ccc' }}
//                                 />
//                             </div>
//                             <div className="modal-body">
//                                 <div className="d-flex justify-content-evenly">
//                                     <div className="btn btn-success btn-hover-effect" onClick={onExportClick}>
//                                         <i className="bi bi-file-earmark-spreadsheet fs-1"></i>
//                                     </div>
//                                     <div className="btn btn-danger btn-hover-effect" onClick={generatePDF}>
//                                         <i className="bi bi-filetype-pdf fs-1"></i>
//                                     </div>
//                                 </div>
//                                 <div className="d-flex justify-content-evenly mt-2">
//                                     <span className="text-muted">Download Excel Format</span>
//                                     <span className="text-muted">Download PDF Format</span>
//                                 </div>
//                             </div>
//                         </div>
//                     </div>
//                 </div>

//                 {/* View Modal */}
//                 <div className="modal fade" id="exampleModalView" aria-labelledby="exampleModalLabel" aria-hidden="true">
//                     <div className="modal-dialog modal-xl modal-dialog-centered">
//                         <div className="modal-content">
//                             <div className="modal-header p-2" style={{ background: '#3f77d2' }}>
//                                 <h1 className="modal-title fs-5 text-white" id="exampleModalLabel">Machine Information</h1>
//                                 <button
//                                     type="button"
//                                     className="btn-close btn-hover-effect me-2"
//                                     data-bs-dismiss="modal"
//                                     aria-label="Close"
//                                     style={{ backgroundColor: 'white', color: 'black', border: '1px solid #ccc' }}
//                                     onClick={handleClear}
//                                 />
//                             </div>
//                             <div className="modal-body">{renderFields(true)}</div>
//                         </div>
//                     </div>
//                 </div>

//                 {/* Edit Modal */}
//                 <div className="modal fade" id="exampleModalEdit" data-bs-backdrop="static" aria-labelledby="exampleModalLabel" aria-hidden="true">
//                     <div className="modal-dialog modal-xl modal-dialog-centered">
//                         <div className="modal-content">
//                             <div className="modal-header p-2" style={{ background: '#3f77d2' }}>
//                                 <h1 className="modal-title fs-5 text-white" id="exampleModalLabel">Edit Machine</h1>
//                                 <button
//                                     type="button"
//                                     className="btn-close btn-hover-effect me-2"
//                                     data-bs-dismiss="modal"
//                                     aria-label="Close"
//                                     style={{ backgroundColor: 'white', color: 'black', border: '1px solid #ccc' }}
//                                     onClick={handleClear}
//                                 />
//                             </div>
//                             <div className="modal-body">{renderFields(false)}</div>
//                             <div className="modal-footer">
//                                 <CButton
//                                     data-bs-dismiss="modal"
//                                     onClick={handleClear}
//                                     style={{ background: 'linear-gradient(135deg, #616161, #616161)', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 600, padding: '10px 18px' }}
//                                 >
//                                     <CIcon icon={cilX} /> Close
//                                 </CButton>
//                                 <button
//                                     type="button"
//                                     data-bs-dismiss="modal"
//                                     onClick={handlechange}
//                                     style={{
//                                         background: 'linear-gradient(135deg, #00c853, #009624)',
//                                         color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 600,
//                                         padding: '10px 22px', boxShadow: '0 4px 15px rgba(0, 200, 83, 0.35)',
//                                         transition: 'all 0.3s ease', cursor: 'pointer',
//                                     }}
//                                 >
//                                     <i className="bi bi-arrow-repeat"></i> Update
//                                 </button>
//                             </div>
//                         </div>
//                     </div>
//                 </div>

//                 {/* Add Modal */}
//                 {isModalVisible && (
//                     <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
//                         <div className="modal-dialog modal-xl modal-dialog-centered">
//                             <div className="modal-content">
//                                 <div className="modal-header p-2" style={{ background: '#3f77d2' }}>
//                                     <h1 className="modal-title fs-5 text-white">Add Machine</h1>
//                                     <button
//                                         type="button"
//                                         className="btn-close btn-hover-effect me-2"
//                                         onClick={() => { handleClear(); setIsModalVisible(false); }}
//                                     />
//                                 </div>
//                                 <div className="modal-body">{renderFields(false)}</div>
//                                 <div className="modal-footer">
//                                     <CButton
//                                         onClick={() => { handleClear(); setIsModalVisible(false); }}
//                                         style={{ background: 'linear-gradient(135deg, #616161, #616161)', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 600, padding: '10px 18px' }}
//                                     >
//                                         <CIcon icon={cilX} /> Close
//                                     </CButton>
//                                     <button
//                                         type="button"
//                                         onClick={handlecheck}
//                                         style={{
//                                             background: 'linear-gradient(135deg, #00c853, #009624)',
//                                             color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 600,
//                                             padding: '10px 22px', boxShadow: '0 4px 15px rgba(0, 200, 83, 0.35)',
//                                             transition: 'all 0.3s ease', cursor: 'pointer',
//                                         }}
//                                     >
//                                         <i className="bi bi-check2-circle"></i> Save
//                                     </button>
//                                 </div>
//                             </div>
//                         </div>
//                     </div>
//                 )}

//                 {/* ==================== MAIN CARD ==================== */}
//                 <div className="card">
//                     <div className="card-header d-flex justify-content-between align-items-center p-3" style={{ background: '#106FB2' }}>
//                         <h4 className="mb-0 text-white d-flex align-items-center gap-2">
//                             <FaCog className="fs-4" /> Machine Master
//                         </h4>
//                         <button className="btn-close btn-close-white" onClick={() => navigate('/Settings/Configure')} />
//                     </div>

//                     <div className="d-flex justify-content-end mt-2 gap-2 px-5">
//                         {!((pageData.addstatus === null || pageData.addstatus === 'i') && auth.UserStatus === 'A') && (
//                             <CButton
//                                 type="button"
//                                 color="primary"
//                                 className="d-flex align-items-center gap-2"
//                                 onClick={() => setUploadvisible(true)}
//                                 style={{
//                                     background: 'linear-gradient(135deg, #007bff, #00b4d8)',
//                                     color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 600,
//                                     padding: '10px 18px', boxShadow: '0 4px 15px rgba(0, 123, 255, 0.35)'
//                                 }}
//                             >
//                                 <CIcon icon={cilCloudDownload} /> Import
//                             </CButton>
//                         )}

//                         <button
//                             className="d-flex align-items-center gap-2"
//                             data-bs-toggle="modal"
//                             data-bs-target="#exampleModal"
//                             style={{
//                                 background: 'linear-gradient(135deg, #ff4b2b, #ff0000)',
//                                 color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 600,
//                                 padding: '10px 18px', boxShadow: '0 4px 15px rgba(255, 0, 0, 0.35)', cursor: 'pointer'
//                             }}
//                         >
//                             <i className="bi bi-cloud-download"></i> Export
//                         </button>

//                         {!((pageData.addstatus === null || pageData.addstatus === 'i') && auth.UserStatus === 'A') && (
//                             <CButton
//                                 type="button"
//                                 color="success"
//                                 className="d-flex align-items-center gap-2"
//                                 onClick={() => { handleClear(); setIsModalVisible(true); }}
//                                 style={{
//                                     background: 'linear-gradient(135deg, #00c853, #009624)',
//                                     color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 600,
//                                     padding: '10px 18px', boxShadow: '0 4px 15px rgba(0, 200, 83, 0.35)'
//                                 }}
//                             >
//                                 <CIcon icon={cilPlus} /> Add
//                             </CButton>
//                         )}
//                     </div>

//                     <div className="card-body py-3 px-5 mb-4">
//                         <div className="ag-theme-quartz mt-2" style={{ height: '450px' }}>
//                             <AgGridReact
//                                 ref={gridRef}
//                                 rowData={rowData}
//                                 columnDefs={columdef}
//                                 defaultColDef={{ sortable: true, filter: true, resizable: true }}
//                                 autoGroupColumnDef={autoGroupColumnDef}
//                                 pagination={pagination}
//                                 paginationPageSize={paginationPageSize}
//                                 paginationPageSizeSelector={paginationPageSizeSelector}
//                                 rowSelection="multiple"
//                                 suppressRowClickSelection={true}
//                                 animateRows={true}
//                                 getRowHeight={() => 55}
//                             />
//                         </div>
//                     </div>
//                 </div>
//             </div>
//         </>
//     );
// };

// MachineMaster.propTypes = {
//     auth: PropTypes.any.isRequired,
// };

// export default MachineMaster;

// import React, { useMemo, useState, useEffect, useRef } from 'react';
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
// import { useLocation, useNavigate } from 'react-router-dom';
// import { CButton } from '@coreui/react';
// import { FaEdit, FaEye, FaCog } from 'react-icons/fa';
// import { getConfig } from 'src/config';
// import CIcon from '@coreui/icons-react';
// import { cilCloudDownload, cilPlus, cilTrash, cilX } from '@coreui/icons';

// const MachineMaster = ({ auth }) => {
//     const API_URL = getConfig().REACT_APP_API_URL;
//     console.log('AUTH OBJECT:', auth);
//     const navigate = useNavigate();
//     const location = useLocation();
//     const gridRef = useRef(null);

//     const [Uploadvisible, setUploadvisible] = useState(false);
//     const [uploadxl, setuploadxl] = useState(null);
//     const [loading, setLoading] = useState(false);
//     const [rowData, setRowData] = useState([]);
//     const [isModalVisible, setIsModalVisible] = useState(false);
//     const [locationOptions, setLocationOptions] = useState([]);

//     let pageData = location.state?.pageData;
//     if (!pageData) {
//         const storedData = localStorage.getItem('pageData');
//         pageData = storedData ? JSON.parse(storedData) : {};
//     }

//     // =========================================================
//     // REGISTER STATE — ONLY MACHINE FIELDS
//     // =========================================================
//     const initialRegister = {
//         MachineId: '',
//         MachineRFID: '',
//         Itemcode: '',
//         Location: '',
//         Description: ''
//     };

//     const [Register, setRegister] = useState(initialRegister);

//     const handleClear = () => {
//         setRegister(initialRegister);
//     };

//     // =========================================================
//     // FETCH ALL
//     // =========================================================
//     const fetchData = async () => {
//         setLoading(true);
//         try {
//             const alldata = {
//                 mode: 'S',
//                 MachineId: '',
//                 MachineRFID: '',
//                 Itemcode: '',
//                 Location: '',
//                 Description: '',
//                 Createdby: '',
//                 updatedby: '',
//                 branchid: auth.branchid || 0,
//                 BranchAccess: auth.BranchAccess || ''
//             };
//             const response = await axios.post(`${API_URL}/MachineConfig`, alldata);
//             setRowData(response.data || []);
//         } catch (error) {
//             console.error('Error fetching Machine details:', error);
//             Swal.fire({ title: 'Error', text: 'Unable to fetch Machine details', icon: 'error' });
//         } finally {
//             setLoading(false);
//         }
//     };

//     // =========================================================
//     // FETCH LOCATIONS (for dropdown)
//     // =========================================================
//     const fetchLocations = async () => {
//         try {
//             const res = await axios.post(`${API_URL}/LocationConfig`, { mode: 'FetchLocation' });
//             setLocationOptions(Array.isArray(res.data) ? res.data : []);
//         } catch (error) {
//             console.error('Error fetching Locations:', error);
//         }
//     };

//     useEffect(() => {
//         fetchData();
//         fetchLocations();
//     }, []);

//     // =========================================================
//     // LOAD SINGLE MACHINE (for View / Edit)
//     // =========================================================
//     const loadMachine = async (data) => {
//         try {
//             setLoading(true);
//             const alldata = {
//                 mode: 'SD',
//                 MachineId: data.MachineId,
//                 MachineRFID: '',
//                 Itemcode: '',
//                 Location: '',
//                 Description: '',
//                 Createdby: '',
//                 updatedby: '',
//                 branchid: auth.branchid || 0,
//                 BranchAccess: auth.BranchAccess || ''
//             };
//             const response = await axios.post(`${API_URL}/MachineConfig`, alldata);
//             const item = Array.isArray(response.data) ? response.data[0] : response.data;
//             setRegister({
//                 MachineId: item?.MachineId || data.MachineId || '',
//                 MachineRFID: item?.MachineRFID || '',
//                 Itemcode: item?.Itemcode || '',
//                 Location: item?.Location || '',
//                 Description: item?.Description || '',
//                 Createdby: item?.Createdby || ''
//             });
//         } catch (error) {
//             console.error('Error loading Machine details:', error);
//             Swal.fire({ title: 'Error', text: 'Unable to load Machine details', icon: 'error' });
//         } finally {
//             setLoading(false);
//         }
//     };

//     // =========================================================
//     // VALIDATION
//     // =========================================================
//     const validateFields = () => {
//         const fieldsToCheck = [
//             { key: 'MachineRFID', message: 'Please Enter Machine RFID' },
//             { key: 'Itemcode', message: 'Please Enter Item Code' },
//             { key: 'Location', message: 'Please Enter Location' },
//             { key: 'Description', message: 'Please Enter Description' },
//         ];

//         for (const field of fieldsToCheck) {
//             if (!Register[field.key]?.trim()) {
//                 Swal.fire({ title: field.message, icon: 'warning', confirmButtonText: 'Done' });
//                 return false;
//             }
//         }
//         return true;
//     };

//     // =========================================================
//     // INSERT
//     // =========================================================
//     const handlecheck = async () => {
//         if (!validateFields()) return;

//         const isExisting = rowData.some(
//             (item) => item.MachineRFID?.trim().toLowerCase() === Register.MachineRFID?.trim().toLowerCase()
//         );
//         if (isExisting) {
//             Swal.fire({ text: 'This Machine RFID Already Exists', icon: 'warning' });
//             return;
//         }

//         try {
//             setLoading(true);
//             // Insert
//             const alldata = {
//                 MachineRFID: Register.MachineRFID.trim(),
//                 Itemcode: Register.Itemcode.trim(),
//                 Location: Register.Location.trim(),
//                 Description: Register.Description.trim(),
//                 Createdby: auth.empid,      // 
//                 updatedby: auth.empid,      // 
//                 branchid: auth.branchid || 0,
//                 BranchAccess: auth.BranchAccess || '',
//                 mode: 'I'
//             };

//             const response = await axios.post(`${API_URL}/MachineConfig`, alldata);
//             if (response.status === 200) {
//                 Swal.fire({ title: 'Saved Successfully', icon: 'success', confirmButtonText: 'Done' })
//                     .then(() => {
//                         setIsModalVisible(false);
//                         handleClear();
//                         fetchData();
//                     });
//             }
//         } catch (err) {
//             console.error(err);
//             Swal.fire({ title: 'Error', text: 'Unable to save Machine details', icon: 'error' });
//         } finally {
//             setLoading(false);
//         }
//     };

//     // =========================================================
//     // EDIT (load + open)
//     // =========================================================
//     const handleEdit = async (data) => {
//         await loadMachine(data);
//     };

//     // =========================================================
//     // UPDATE
//     // =========================================================
//     const handlechange = async () => {
//         if (!validateFields()) return;

//         try {
//             setLoading(true);
//             // Update
//             const alldata = {
//                 MachineId: Register.MachineId,
//                 MachineRFID: Register.MachineRFID.trim(),
//                 Itemcode: Register.Itemcode.trim(),
//                 Location: Register.Location.trim(),
//                 Description: Register.Description.trim(),
//                 Createdby: Register.Createdby,   // preserve original creator id (already loaded as int from SP)
//                 updatedby: auth.empid,           // was auth.employeename
//                 branchid: auth.branchid || 0,
//                 BranchAccess: auth.BranchAccess || '',
//                 mode: 'U'
//             };

//             const response = await axios.post(`${API_URL}/MachineConfig`, alldata);
//             if (response.status === 200) {
//                 Swal.fire({ title: 'Updated', text: 'Updated Successfully', icon: 'success', confirmButtonText: 'Done' })
//                     .then(() => {
//                         handleClear();
//                         fetchData();
//                     });
//             }
//         } catch (err) {
//             console.error(err);
//             Swal.fire({ title: 'Error', text: 'Unable to update Machine details', icon: 'error' });
//         } finally {
//             setLoading(false);
//         }
//     };

//     // =========================================================
//     // DELETE
//     // =========================================================
//     const handleDelete = async (data) => {
//         const result = await Swal.fire({
//             title: 'Are you sure?',
//             text: 'Once deleted, you will not be able to recover the data!',
//             icon: 'warning',
//             showCancelButton: true,
//             confirmButtonText: 'Delete',
//             cancelButtonText: 'Cancel'
//         });
//         if (!result.isConfirmed) return;

//         setLoading(true);
//         try {
//             // Delete
//             const alldata = {
//                 mode: 'D',
//                 MachineId: data.MachineId,
//                 MachineRFID: '',
//                 Itemcode: '',
//                 Location: '',
//                 Description: '',
//                 Createdby: '',
//                 updatedby: auth.empid,   // was auth.employeename
//                 branchid: auth.branchid || 0,
//                 BranchAccess: auth.BranchAccess || ''
//             };
//             const response = await axios.post(`${API_URL}/MachineConfig`, alldata);
//             if (response.status === 200) {
//                 Swal.fire({ title: 'Deleted Successfully', icon: 'success', confirmButtonText: 'Done' });
//                 fetchData();
//             }
//         } catch (error) {
//             console.error(error);
//             Swal.fire({ title: 'Error', text: 'Unable to delete Machine', icon: 'error' });
//         } finally {
//             setLoading(false);
//         }
//     };

//     // =========================================================
//     // IMPORT
//     // =========================================================
//     const handleUploadExcelSheet = (e) => {
//         const selectedFile = e.target.files[0];
//         if (selectedFile) {
//             const ext = selectedFile.name.split('.').pop().toLowerCase();
//             if (['csv', 'xls', 'xlsx'].includes(ext)) {
//                 setuploadxl(selectedFile);
//             } else {
//                 Swal.fire({ title: 'Invalid File Format', text: 'Please select CSV or Excel file.', icon: 'warning' });
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
//             title: 'Are you sure?',
//             text: 'Once uploaded, you will not be able to check the Machine list immediately!',
//             icon: 'warning',
//             showCancelButton: true,
//             confirmButtonText: 'Upload',
//             cancelButtonText: 'Cancel'
//         });
//         if (!result.isConfirmed) return;

//         setLoading(true);
//         try {
//             const formData = new FormData();
//             formData.append('file', uploadxl);
//             formData.append('CreatedBy', auth.empid);
//             formData.append('branchid', auth.branchid);

//             const response = await axios.post(`${API_URL}/MachineUploadData`, formData, {
//                 headers: { 'Content-Type': 'multipart/form-data' }
//             });

//             const { uploadcount, unuploadedFilePath } = response.data;
//             await fetchData();

//             if (unuploadedFilePath) {
//                 swal({
//                     heightAuto: true,
//                     title: `Total Uploaded Count: ${uploadcount}`,
//                     text: 'Some Machine data could not be uploaded. Please download the file to see the errors.',
//                     icon: 'warning',
//                     buttons: { cancel: 'OK', download: { text: 'Download File', value: 'download' } }
//                 }).then((value) => {
//                     if (value === 'download') {
//                         const link = document.createElement('a');
//                         link.href = `${API_URL}${unuploadedFilePath}`;
//                         link.setAttribute('download', 'unuploaded_Machine_data.xlsx');
//                         document.body.appendChild(link);
//                         link.click();
//                         link.parentNode.removeChild(link);
//                     }
//                 });
//             } else {
//                 Swal.fire({ title: `Total Uploaded Count: ${uploadcount}`, text: 'All data uploaded successfully', icon: 'success' });
//             }
//         } catch (err) {
//             console.error(err);
//             Swal.fire({ title: 'Please Upload Valid File', icon: 'error' });
//         } finally {
//             setUploadvisible(false);
//             setuploadxl(null);
//             setLoading(false);
//         }
//     };

//     // =========================================================
//     // EXPORT — PDF
//     // =========================================================
//     const generatePDF = () => {
//         setLoading(true);
//         try {
//             const filteredData = gridRef.current.api.getModel().rowsToDisplay.map(r => r.data);

//             if (!filteredData.length) {
//                 Swal.fire({ title: 'No Data', text: 'No data available to export', icon: 'warning' });
//                 setLoading(false);
//                 return;
//             }

//             const doc = new jsPDF({ format: 'a2' });
//             const pageWidth = doc.internal.pageSize.width;
//             const currentUser = auth.employeename || 'Unknown User';
//             const currentDateTime = new Date().toLocaleString();
//             const title = 'Machine Master';

//             const columnMapping = [
//                 { header: 'Machine RFID', key: 'MachineRFID' },
//                 { header: 'Item Code', key: 'Itemcode' },
//                 { header: 'Location', key: 'Location' },
//                 { header: 'Description', key: 'Description' }
//             ];

//             doc.autoTable({
//                 head: [columnMapping.map(c => c.header)],
//                 body: filteredData.map(row => columnMapping.map(c => row[c.key] || '')),
//                 margin: { top: 30, right: 10, left: 10, bottom: 20 },
//                 theme: 'grid',
//                 styles: { fontSize: 10, halign: 'center', valign: 'middle', overflow: 'linebreak', lineColor: [0, 0, 0], lineWidth: 0.1 },
//                 headStyles: { fillColor: [63, 119, 210], textColor: [255, 255, 255], fontStyle: 'bold' },
//                 bodyStyles: { fillColor: [245, 245, 245], textColor: [0, 0, 0] },
//                 didDrawPage: (data) => {
//                     doc.setFontSize(10);
//                     doc.text(`User: ${currentUser}`, pageWidth - 11, 12, { align: 'right' });
//                     doc.text(`Date: ${currentDateTime}`, pageWidth - 11, 18, { align: 'right' });
//                     doc.setFontSize(14);
//                     doc.setFont('helvetica', 'bold');
//                     doc.text(title, pageWidth / 2, 15, { align: 'center' });
//                     doc.setFontSize(10);
//                     doc.text(`Page ${data.pageNumber}`, pageWidth / 2, doc.internal.pageSize.height - 10, { align: 'center' });
//                 }
//             });

//             doc.save('Machine_Master.pdf');
//         } catch (error) {
//             console.error('Error generating PDF:', error);
//             Swal.fire({ title: 'Error', text: 'Failed to generate PDF. Please try again.', icon: 'error' });
//         } finally {
//             setLoading(false);
//         }
//     };

//     const onExportClick = () => {
//         if (!gridRef.current?.api) return;
//         gridRef.current.api.exportDataAsCsv({
//             fileName: 'Machines_Details.csv',
//             columnKeys: ['MachineRFID', 'Itemcode', 'Location', 'Description']
//         });
//     };

//     // =========================================================
//     // RENDERERS
//     // =========================================================
//     const ViewRenderer = (params) => {
//         if ((pageData.viewstatus === null || pageData.viewstatus === 'i') && auth.UserStatus === 'A') return null;
//         return (
//             <button
//                 className="btn btn-hover-effect"
//                 data-bs-toggle="modal"
//                 data-bs-target="#exampleModalView"
//                 onClick={() => loadMachine(params.data)}
//             >
//                 <FaEye className="text-primary cursor-pointer fs-3" title="View" />
//             </button>
//         );
//     };

//     const EditRenderer = (params) => {
//         if ((pageData.editstatus === null || pageData.editstatus === 'i') && auth.UserStatus === 'A') return null;
//         return (
//             <button
//                 onClick={() => handleEdit(params.data)}
//                 data-bs-toggle="modal"
//                 data-bs-target="#exampleModalEdit"
//                 className="mt-1 ms-2"
//                 style={{
//                     background: 'linear-gradient(135deg, #007bff, #00b4d8)',
//                     color: '#fff', border: 'none', borderRadius: '50%', padding: '7px',
//                     display: 'flex', alignItems: 'center', justifyContent: 'center',
//                     cursor: 'pointer', boxShadow: '0 4px 12px rgba(0, 123, 255, 0.35)',
//                     transition: 'all 0.3s ease',
//                 }}
//                 onMouseEnter={(e) => {
//                     e.currentTarget.style.background = 'linear-gradient(135deg, #3399ff, #33ccff)';
//                     e.currentTarget.style.transform = 'translateY(-2px)';
//                 }}
//                 onMouseLeave={(e) => {
//                     e.currentTarget.style.background = 'linear-gradient(135deg, #007bff, #00b4d8)';
//                     e.currentTarget.style.transform = 'translateY(0)';
//                 }}
//             >
//                 <FaEdit className="fs-5" title="Edit" />
//             </button>
//         );
//     };

//     const DeleteRenderer = (params) => {
//         if ((pageData.deletestatus === null || pageData.deletestatus === 'i') && auth.UserStatus === 'A') return null;
//         return (
//             <button
//                 className="mt-1 ms-1"
//                 onClick={() => handleDelete(params.data)}
//                 style={{
//                     background: 'linear-gradient(135deg, #ff4d4d, #ff1a1a)',
//                     color: '#fff', border: 'none', borderRadius: '50%', padding: '4px',
//                     display: 'flex', alignItems: 'center', justifyContent: 'center',
//                     cursor: 'pointer', boxShadow: '0 4px 12px rgba(255, 0, 0, 0.35)',
//                     transition: 'all 0.3s ease',
//                 }}
//                 onMouseEnter={(e) => {
//                     e.currentTarget.style.background = 'linear-gradient(135deg, #ff6666, #ff3333)';
//                     e.currentTarget.style.transform = 'translateY(-2px)';
//                 }}
//                 onMouseLeave={(e) => {
//                     e.currentTarget.style.background = 'linear-gradient(135deg, #ff4d4d, #ff1a1a)';
//                     e.currentTarget.style.transform = 'translateY(0)';
//                 }}
//             >
//                 <CIcon icon={cilTrash} size="xl" />
//             </button>
//         );
//     };

//     const pagination = true;
//     const paginationPageSize = 100;
//     const paginationPageSizeSelector = [10, 50, 100];

//     const columdef = [
//         { headerCheckboxSelection: true, checkboxSelection: true, width: 60 },
//         { headerName: 'Machine RFID', field: 'MachineRFID', filter: true, floatingFilter: true, headerClass: 'agheader', flex: 1, minWidth: 150 },
//         { headerName: 'Item Code', field: 'Itemcode', filter: true, floatingFilter: true, headerClass: 'agheader', flex: 1, minWidth: 150 },
//         {
//             headerName: 'Location', field: 'Location', filter: true, floatingFilter: true, headerClass: 'agheader', flex: 1, minWidth: 180,
//             valueFormatter: (params) => {
//                 const loc = locationOptions.find(l => l.LocationId == params.value);
//                 return loc ? loc.LocationName : params.value;
//             }
//         },
//         { headerName: 'Description', field: 'Description', filter: true, floatingFilter: true, headerClass: 'agheader', flex: 2, minWidth: 250 },
//         { headerName: 'View', field: 'View', headerClass: 'agheader', cellRenderer: ViewRenderer, width: 80, pinned: 'right' },
//         {
//             headerName: (pageData.editstatus === null || pageData.editstatus === 'i') ? '' : 'Edit',
//             field: 'Edit', cellRenderer: EditRenderer, width: 80, pinned: 'right', headerClass: 'agheader',
//         },
//         { headerName: 'Delete', field: 'Delete', headerClass: 'agheader', cellRenderer: DeleteRenderer, width: 90, pinned: 'right' },
//     ];

//     const autoGroupColumnDef = useMemo(() => ({
//         headerCheckboxSelection: true,
//         field: 'MachineId',
//         flex: 1,
//         minWidth: 240,
//         cellRendererParams: { checkbox: true },
//     }), []);

//     // =========================================================
//     // SHARED FORM FIELDS (used by Add/Edit/View modals)
//     // =========================================================
//     const renderFields = (disabled = false) => (
//         <div className="row">
//             {[
//                 { label: 'Machine RFID', key: 'MachineRFID' },
//                 { label: 'Item Code', key: 'Itemcode' },
//             ].map(({ label, key }) => (
//                 <div className="col-lg-6 col-md-6 col-sm-12 mt-3" key={key}>
//                     <label className="form-label">
//                         {label} {!disabled && <span className="text-danger">*</span>}
//                     </label>
//                     <input
//                         type="text"
//                         className="form-control"
//                         placeholder={disabled ? '' : `Enter ${label}`}
//                         value={Register[key] || ''}
//                         disabled={disabled}
//                         onChange={(e) => !disabled && setRegister({ ...Register, [key]: e.target.value })}
//                     />
//                 </div>
//             ))}

//             {/* Location Dropdown */}
//             <div className="col-lg-6 col-md-6 col-sm-12 mt-3">
//                 <label className="form-label">
//                     Location {!disabled && <span className="text-danger">*</span>}
//                 </label>
//                 {disabled ? (
//                     <input
//                         className="form-control"
//                         value={
//                             locationOptions.find(l => l.LocationId == Register.Location)?.LocationName
//                             || Register.Location
//                             || ''
//                         }
//                         disabled
//                     />
//                 ) : (
//                     <select
//                         className="form-select"
//                         value={Register.Location || ''}
//                         onChange={(e) => setRegister({ ...Register, Location: e.target.value })}
//                     >
//                         <option value="">-- Select Location --</option>
//                         {locationOptions.map((loc) => (
//                             <option key={loc.LocationId} value={loc.LocationId}>
//                                 {loc.LocationName}
//                             </option>
//                         ))}
//                     </select>
//                 )}
//             </div>

//             <div className="col-lg-6 col-md-6 col-sm-12 mt-3">
//                 <label className="form-label">
//                     Description {!disabled && <span className="text-danger">*</span>}
//                 </label>
//                 <textarea
//                     className="form-control"
//                     rows="2"
//                     placeholder={disabled ? '' : 'Enter Description'}
//                     value={Register.Description || ''}
//                     disabled={disabled}
//                     onChange={(e) => !disabled && setRegister({ ...Register, Description: e.target.value })}
//                 />
//             </div>
//         </div>
//     );

//     return (
//         <>
//             {loading && (
//                 <div className="loading-overlay">
//                     <div className="loading-spinner">
//                         <BallTriangle height={100} width={100} radius={5} color="#4fa94d" ariaLabel="ball-triangle-loading" visible={true} />
//                     </div>
//                 </div>
//             )}

//             <div>
//                 {/* Import Modal */}
//                 {Uploadvisible && (
//                     <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
//                         <div className="modal-dialog modal-dialog-centered modal-lg modal-dialog-scrollable">
//                             <div className="modal-content card">
//                                 <div className="modal-header">
//                                     <h1 className="modal-title fs-5">Import Format</h1>
//                                     <button
//                                         type="button"
//                                         className="btn-close btn-hover-effect"
//                                         onClick={() => { setUploadvisible(false); setuploadxl(null); }}
//                                     />
//                                 </div>
//                                 <div className="modal-body">
//                                     <div className="import-input">
//                                         <label htmlFor="importdata" className="form-label">Import Data</label>
//                                         <input
//                                             type="file"
//                                             className="form-control"
//                                             accept=".csv, .xls, .xlsx"
//                                             onChange={handleUploadExcelSheet}
//                                         />
//                                     </div>
//                                     <hr className="mt-2" />
//                                     <div className="download-sample-template text-center">
//                                         <p>Important ⚠</p>
//                                         <span className="text-danger">
//                                             Download the template, fill data in the same column format, then upload here.
//                                         </span>
//                                         <br />
//                                         <a href="/MachineMasterTemp.xlsx" className="nav-link text-decoration-underline" download>
//                                             Click to Download
//                                         </a>
//                                     </div>
//                                     <div className="text-center mt-3">
//                                         <button
//                                             className="btn btn-danger mx-2 btn-hover-effect"
//                                             onClick={() => { setUploadvisible(false); setuploadxl(null); }}
//                                         >
//                                             CANCEL
//                                         </button>
//                                         <button className="btn btn-success mx-2 btn-hover-effect" onClick={handleUploadData}>
//                                             Upload Data
//                                         </button>
//                                     </div>
//                                 </div>
//                             </div>
//                         </div>
//                     </div>
//                 )}

//                 {/* Export Modal */}
//                 <div className="modal fade" id="exampleModal" tabIndex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
//                     <div className="modal-dialog modal-dialog-centered">
//                         <div className="modal-content">
//                             <div className="modal-header p-2" style={{ background: '#3f77d2' }}>
//                                 <h1 className="modal-title fs-5 text-white" id="exampleModalLabel">Download Format</h1>
//                                 <button
//                                     type="button"
//                                     className="btn-close btn-hover-effect me-2"
//                                     data-bs-dismiss="modal"
//                                     aria-label="Close"
//                                     style={{ backgroundColor: 'white', color: 'black', border: '1px solid #ccc' }}
//                                 />
//                             </div>
//                             <div className="modal-body">
//                                 <div className="d-flex justify-content-evenly">
//                                     <div className="btn btn-success btn-hover-effect" onClick={onExportClick}>
//                                         <i className="bi bi-file-earmark-spreadsheet fs-1"></i>
//                                     </div>
//                                     <div className="btn btn-danger btn-hover-effect" onClick={generatePDF}>
//                                         <i className="bi bi-filetype-pdf fs-1"></i>
//                                     </div>
//                                 </div>
//                                 <div className="d-flex justify-content-evenly mt-2">
//                                     <span className="text-muted">Download Excel Format</span>
//                                     <span className="text-muted">Download PDF Format</span>
//                                 </div>
//                             </div>
//                         </div>
//                     </div>
//                 </div>

//                 {/* View Modal */}
//                 <div className="modal fade" id="exampleModalView" aria-labelledby="exampleModalLabel" aria-hidden="true">
//                     <div className="modal-dialog modal-xl modal-dialog-centered">
//                         <div className="modal-content">
//                             <div className="modal-header p-2" style={{ background: '#3f77d2' }}>
//                                 <h1 className="modal-title fs-5 text-white" id="exampleModalLabel">Machine Information</h1>
//                                 <button
//                                     type="button"
//                                     className="btn-close btn-hover-effect me-2"
//                                     data-bs-dismiss="modal"
//                                     aria-label="Close"
//                                     style={{ backgroundColor: 'white', color: 'black', border: '1px solid #ccc' }}
//                                     onClick={handleClear}
//                                 />
//                             </div>
//                             <div className="modal-body">{renderFields(true)}</div>
//                         </div>
//                     </div>
//                 </div>

//                 {/* Edit Modal */}
//                 <div className="modal fade" id="exampleModalEdit" data-bs-backdrop="static" aria-labelledby="exampleModalLabel" aria-hidden="true">
//                     <div className="modal-dialog modal-xl modal-dialog-centered">
//                         <div className="modal-content">
//                             <div className="modal-header p-2" style={{ background: '#3f77d2' }}>
//                                 <h1 className="modal-title fs-5 text-white" id="exampleModalLabel">Edit Machine</h1>
//                                 <button
//                                     type="button"
//                                     className="btn-close btn-hover-effect me-2"
//                                     data-bs-dismiss="modal"
//                                     aria-label="Close"
//                                     style={{ backgroundColor: 'white', color: 'black', border: '1px solid #ccc' }}
//                                     onClick={handleClear}
//                                 />
//                             </div>
//                             <div className="modal-body">{renderFields(false)}</div>
//                             <div className="modal-footer">
//                                 <CButton
//                                     data-bs-dismiss="modal"
//                                     onClick={handleClear}
//                                     style={{ background: 'linear-gradient(135deg, #616161, #616161)', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 600, padding: '10px 18px' }}
//                                 >
//                                     <CIcon icon={cilX} /> Close
//                                 </CButton>
//                                 <button
//                                     type="button"
//                                     data-bs-dismiss="modal"
//                                     onClick={handlechange}
//                                     style={{
//                                         background: 'linear-gradient(135deg, #00c853, #009624)',
//                                         color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 600,
//                                         padding: '10px 22px', boxShadow: '0 4px 15px rgba(0, 200, 83, 0.35)',
//                                         transition: 'all 0.3s ease', cursor: 'pointer',
//                                     }}
//                                 >
//                                     <i className="bi bi-arrow-repeat"></i> Update
//                                 </button>
//                             </div>
//                         </div>
//                     </div>
//                 </div>

//                 {/* Add Modal */}
//                 {isModalVisible && (
//                     <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
//                         <div className="modal-dialog modal-xl modal-dialog-centered">
//                             <div className="modal-content">
//                                 <div className="modal-header p-2" style={{ background: '#3f77d2' }}>
//                                     <h1 className="modal-title fs-5 text-white">Add Machine</h1>
//                                     <button
//                                         type="button"
//                                         className="btn-close btn-hover-effect me-2"
//                                         onClick={() => { handleClear(); setIsModalVisible(false); }}
//                                     />
//                                 </div>
//                                 <div className="modal-body">{renderFields(false)}</div>
//                                 <div className="modal-footer">
//                                     <CButton
//                                         onClick={() => { handleClear(); setIsModalVisible(false); }}
//                                         style={{ background: 'linear-gradient(135deg, #616161, #616161)', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 600, padding: '10px 18px' }}
//                                     >
//                                         <CIcon icon={cilX} /> Close
//                                     </CButton>
//                                     <button
//                                         type="button"
//                                         onClick={handlecheck}
//                                         style={{
//                                             background: 'linear-gradient(135deg, #00c853, #009624)',
//                                             color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 600,
//                                             padding: '10px 22px', boxShadow: '0 4px 15px rgba(0, 200, 83, 0.35)',
//                                             transition: 'all 0.3s ease', cursor: 'pointer',
//                                         }}
//                                     >
//                                         <i className="bi bi-check2-circle"></i> Save
//                                     </button>
//                                 </div>
//                             </div>
//                         </div>
//                     </div>
//                 )}

//                 {/* ==================== MAIN CARD ==================== */}
//                 <div className="card">
//                     <div className="card-header d-flex justify-content-between align-items-center p-3" style={{ background: '#106FB2' }}>
//                         <h4 className="mb-0 text-white d-flex align-items-center gap-2">
//                             <FaCog className="fs-4" /> Machine Master
//                         </h4>
//                         <button className="btn-close btn-close-white" onClick={() => navigate('/Settings/Configure')} />
//                     </div>

//                     <div className="d-flex justify-content-end mt-2 gap-2 px-5">
//                         {!((pageData.addstatus === null || pageData.addstatus === 'i') && auth.UserStatus === 'A') && (
//                             <CButton
//                                 type="button"
//                                 color="primary"
//                                 className="d-flex align-items-center gap-2"
//                                 onClick={() => setUploadvisible(true)}
//                                 style={{
//                                     background: 'linear-gradient(135deg, #007bff, #00b4d8)',
//                                     color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 600,
//                                     padding: '10px 18px', boxShadow: '0 4px 15px rgba(0, 123, 255, 0.35)'
//                                 }}
//                             >
//                                 <CIcon icon={cilCloudDownload} /> Import
//                             </CButton>
//                         )}

//                         <button
//                             className="d-flex align-items-center gap-2"
//                             data-bs-toggle="modal"
//                             data-bs-target="#exampleModal"
//                             style={{
//                                 background: 'linear-gradient(135deg, #ff4b2b, #ff0000)',
//                                 color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 600,
//                                 padding: '10px 18px', boxShadow: '0 4px 15px rgba(255, 0, 0, 0.35)', cursor: 'pointer'
//                             }}
//                         >
//                             <i className="bi bi-cloud-download"></i> Export
//                         </button>

//                         {!((pageData.addstatus === null || pageData.addstatus === 'i') && auth.UserStatus === 'A') && (
//                             <CButton
//                                 type="button"
//                                 color="success"
//                                 className="d-flex align-items-center gap-2"
//                                 onClick={() => { handleClear(); setIsModalVisible(true); }}
//                                 style={{
//                                     background: 'linear-gradient(135deg, #00c853, #009624)',
//                                     color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 600,
//                                     padding: '10px 18px', boxShadow: '0 4px 15px rgba(0, 200, 83, 0.35)'
//                                 }}
//                             >
//                                 <CIcon icon={cilPlus} /> Add
//                             </CButton>
//                         )}
//                     </div>

//                     <div className="card-body py-3 px-5 mb-4">
//                         <div className="ag-theme-quartz mt-2" style={{ height: '450px' }}>
//                             <AgGridReact
//                                 ref={gridRef}
//                                 rowData={rowData}
//                                 columnDefs={columdef}
//                                 defaultColDef={{ sortable: true, filter: true, resizable: true }}
//                                 autoGroupColumnDef={autoGroupColumnDef}
//                                 pagination={pagination}
//                                 paginationPageSize={paginationPageSize}
//                                 paginationPageSizeSelector={paginationPageSizeSelector}
//                                 rowSelection="multiple"
//                                 suppressRowClickSelection={true}
//                                 animateRows={true}
//                                 getRowHeight={() => 55}
//                             />
//                         </div>
//                     </div>
//                 </div>
//             </div>
//         </>
//     );
// };

// MachineMaster.propTypes = {
//     auth: PropTypes.any.isRequired,
// };

// export default MachineMaster;


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
import {  FaEye, FaGears } from 'react-icons/fa6';
import { getConfig } from 'src/config';
import CIcon from '@coreui/icons-react';
import { cilCloudDownload, cilPlus, cilTrash, cilX } from '@coreui/icons';
import { FaEdit } from 'react-icons/fa';

const MachineMaster = ({ auth }) => {
    const API_URL = getConfig().REACT_APP_API_URL;
    const navigate = useNavigate();
    const location = useLocation();
    const gridRef = useRef(null);
    const [Uploadvisible, setUploadvisible] = useState(false);
    const [uploadxl, setuploadxl] = useState(null);
    const [loading, setLoading] = useState(false);
    const [rowData, setRowData] = useState([]);
    const [isModalVisible, setIsModalVisible] = useState(false);

    // =====================
    // PERMISSIONS (from Configure.jsx: state={{ permission, screenId }})
    // Assuming Machine Master is screen AC002 — swap if yours is different.
    // =====================
    let permission = location.state?.permission;
    if (permission) {
        localStorage.setItem('machineMasterPermission', JSON.stringify(permission));
    } else {
        const stored = localStorage.getItem('machineMasterPermission');
        permission = stored ? JSON.parse(stored) : {};
    }

    const canAdd = auth.UserStatus === 'SA' || permission?.AddStatus === 'a';
    const canEdit = auth.UserStatus === 'SA' || permission?.EditStatus === 'a';
    const canDelete = auth.UserStatus === 'SA' || permission?.DeleteStatus === 'a';

    // =====================
    // REGISTER — only the fields on the Add Machine form
    // =====================
    const initialRegister = {
        Id: '',
        RFID: '',
        MachineNo: '',
        MachineName: '',
        MachineDescription: '',
        MachineMake: '',
        MachineCapacity: '',
        SPM: ''
    };

    const [Register, setRegister] = useState(initialRegister);

    const handleClear = () => {
        setRegister(initialRegister);
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

    // =====================
    // FETCH ALL (branch-scoped)
    // =====================
    const fetchData = async () => {
        setLoading(true);
        try {
            const response = await axios.post(`${API_URL}/MachineConfig`, {
                mode: 'A',
                branchid: auth.branchid,
                BranchAccess: auth.UserStatus === 'SA' ? null : auth.BranchAccess
            });
            setRowData(response.data || []);
        } catch (error) {
            console.error('Error fetching Machine details:', error);
            Swal.fire({ title: 'Error', text: 'Unable to fetch Machine details', icon: 'error' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // =====================
    // VALIDATION
    // =====================
    const validateFields = () => {
        const fieldsToCheck = [
            { key: 'RFID', message: 'Please Enter RFID' },
            { key: 'MachineNo', message: 'Please Enter Machine No' },
            { key: 'MachineName', message: 'Please Enter Machine Name' },
            { key: 'MachineDescription', message: 'Please Enter Machine Description' },
            { key: 'MachineMake', message: 'Please Enter Make' },
            { key: 'MachineCapacity', message: 'Please Enter Capacity' },
            { key: 'SPM', message: 'Please Enter SPM' },
        ];

        for (const field of fieldsToCheck) {
            if (!String(Register[field.key] || '').trim()) {
                Swal.fire({ title: field.message, icon: 'warning', confirmButtonText: 'Done' });
                return false;
            }
        }
        return true;
    };

    // =====================
    // INSERT
    // =====================
    const handlecheck = async () => {
        if (!validateFields()) return;

        try {
            const alldata = {
                ...Register,
                CreatedBy: auth.employeename,
                branchid: auth.branchid,
                mode: 'I'
            };
            const response = await axios.post(`${API_URL}/MachineConfig`, alldata);
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
            Swal.fire({ title: 'Error', text: 'Unable to save Machine details', icon: 'error' });
        }
    };

    // =====================
    // LOAD FOR EDIT / VIEW
    // =====================
    const handleEdit = (data) => {
        setRegister({
            Id: data.Id,
            RFID: data.RFID,
            MachineNo: data.MachineNo,
            MachineName: data.MachineName,
            MachineDescription: data.MachineDescription,
            MachineMake: data.MachineMake,
            MachineCapacity: data.MachineCapacity,
            SPM: data.SPM
        });
    };

    // =====================
    // UPDATE
    // =====================
    const handlechange = async () => {
        if (!validateFields()) return;

        try {
            const alldata = {
                ...Register,
                UpdatedBy: auth.employeename,
                mode: 'U'
            };
            const response = await axios.post(`${API_URL}/MachineConfig`, alldata);
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
            Swal.fire({ title: 'Error', text: 'Unable to update Machine details', icon: 'error' });
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
            const alldata = { Id: data.Id, UpdatedBy: auth.employeename, mode: 'D' };
            const response = await axios.post(`${API_URL}/MachineConfig`, alldata);
            if (response.status === 200) {
                Swal.fire({ title: 'Deleted Successfully', icon: 'success', confirmButtonText: 'Done' });
                fetchData();
            }
        } catch (error) {
            console.error(error);
            Swal.fire({ title: 'Error', text: 'Unable to delete Machine', icon: 'error' });
        } finally {
            setLoading(false);
        }
    };

    // =====================
    // IMPORT
    // =====================
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

            const response = await axios.post(`${API_URL}/MachineUploadData`, formData, {
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
                        link.setAttribute('download', 'unuploaded_Machine_data.xlsx');
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
                { header: 'Machine No', key: 'MachineNo' },
                { header: 'Machine Name', key: 'MachineName' },
                { header: 'Description', key: 'MachineDescription' },
                { header: 'Make', key: 'MachineMake' },
                { header: 'Capacity', key: 'MachineCapacity' },
                { header: 'SPM', key: 'SPM' },
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
                    doc.text('Machine Master', pageWidth / 2, 15, { align: 'center' });
                    doc.setFontSize(10);
                    doc.text(`Page ${data.pageNumber}`, pageWidth / 2, doc.internal.pageSize.height - 10, { align: 'center' });
                }
            });
            doc.save('Machine_Master.pdf');
        } catch (error) {
            console.error(error);
            alert('Failed to generate PDF');
        } finally {
            setLoading(false);
        }
    };

    const onExportClick = () => {
        gridRef.current.api.exportDataAsCsv({
            fileName: 'Machine_Details.csv',
            columnKeys: ['RFID', 'MachineNo', 'MachineName', 'MachineDescription', 'MachineMake', 'MachineCapacity', 'SPM', 'CreatedDate']
        });
    };

    // =====================
    // RENDERERS
    // =====================
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
        { headerName: 'RFID', field: 'RFID', filter: true, headerClass: 'agheader', floatingFilter: true, flex: 1, minWidth: 120 },
        { headerName: 'Machine No', field: 'MachineNo', filter: true, headerClass: 'agheader', floatingFilter: true, flex: 1, minWidth: 130 },
        { headerName: 'Machine Name', field: 'MachineName', filter: true, headerClass: 'agheader', floatingFilter: true, flex: 1, minWidth: 150 },
        { headerName: 'Description', field: 'MachineDescription', filter: true, headerClass: 'agheader', floatingFilter: true, flex: 2, minWidth: 180 },
        { headerName: 'Make', field: 'MachineMake', filter: true, headerClass: 'agheader', floatingFilter: true, flex: 1, minWidth: 120 },
        { headerName: 'Capacity', field: 'MachineCapacity', filter: true, headerClass: 'agheader', floatingFilter: true, flex: 1, minWidth: 120 },
        { headerName: 'SPM', field: 'SPM', filter: true, headerClass: 'agheader', floatingFilter: true, flex: 1, minWidth: 100 },
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
        headerCheckboxSelection: true, field: 'Id', flex: 1, minWidth: 240,
        cellRendererParams: { checkbox: true }
    }), []);

    // =====================
    // FORM FIELDS (reused in Add/Edit/View modals) — matches the screenshot layout:
    // row 1: RFID, Machine No, Machine Name, Description
    // row 2: Make, Capacity, SPM
    // =====================
    const renderFields = (disabled = false) => (
        <div className="row">
            {[
                { label: 'RFID', key: 'RFID' },
                { label: 'Machine No', key: 'MachineNo' },
                { label: 'Machine Name', key: 'MachineName' },
                { label: 'Machine Description', key: 'MachineDescription' },
                { label: 'Make', key: 'MachineMake' },
                { label: 'Capacity', key: 'MachineCapacity' },
                { label: 'SPM', key: 'SPM' },
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
                {/* Import Modal */}
                {Uploadvisible && (
                    <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
                        <div className="modal-dialog modal-dialog-centered modal-lg">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title">Import Machine Data</h5>
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
                                        <a href="/MachineMasterTemp.xlsx" className="nav-link text-decoration-underline" download>
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
                                <h1 className="modal-title fs-5 text-white">View Machine Details</h1>
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
                                <h1 className="modal-title fs-5 text-white">Edit Machine Details</h1>
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

                {/* Add Modal — matches the screenshot */}
                {isModalVisible && (
                    <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
                        <div className="modal-dialog modal-xl modal-dialog-centered">
                            <div className="modal-content">
                                <div className="modal-header p-2" style={{ background: '#3f77d2' }}>
                                    <h1 className="modal-title fs-5 text-white">Add Machine</h1>
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
                            <FaGears className="fs-4" /> Machine Master
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

MachineMaster.propTypes = { auth: PropTypes.any.isRequired };
export default MachineMaster;