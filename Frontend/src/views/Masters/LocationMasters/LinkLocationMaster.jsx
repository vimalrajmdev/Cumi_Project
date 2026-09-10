
// import React, { useMemo, useState, useEffect, useRef } from 'react';
// import { AgGridReact } from 'ag-grid-react';
// import "ag-grid-community/styles/ag-grid.css";
// import "ag-grid-community/styles/ag-theme-alpine.css";
// import axios from 'axios';
// import Swal from 'sweetalert2';
// import { BallTriangle } from 'react-loader-spinner';
// import { useLocation } from "react-router-dom";
// import { getConfig } from 'src/config';
// import CIcon from '@coreui/icons-react';
// import { cilPlus, cilTrash } from '@coreui/icons';
// import { FaEdit, FaEye } from 'react-icons/fa';
// import { useNavigate } from 'react-router-dom';
// import { Typeahead } from 'react-bootstrap-typeahead';
// import 'react-bootstrap-typeahead/css/Typeahead.css';

// const LocationMaster = ({ auth }) => {
//     const API_URL = getConfig().REACT_APP_API_URL;
//     const navigate = useNavigate();

//     // ======================== STATE ========================
//     const [loading, setLoading] = useState(false);
//     const [locationData, setLocationData] = useState([]);
//     const [rackData, setRackData] = useState([]);
//     const [rowOptions, setRowOptions] = useState([]);
//     const [mappings, setMappings] = useState([]);

//     const [selectedRack, setSelectedRack] = useState([]);
//     const [selectedRow, setSelectedRow] = useState([]);

//     const [Location, setLocation] = useState({
//         LocationId: '',
//         PlantCode: auth.PlantCode,
//         LocationCode: '',
//         LocationName: '',
//         LocationRFID: '',
//         RackId: '',
//         RowId: '',
//         Rack: '',
//         Row: '',
//         Status: 'Active',
//         CreatedBy: ''
//     });

//     // ======================== PAGE DATA ========================
//     const location = useLocation();
//     let pageData = location.state?.pageData;
//     if (!pageData) {
//         const storedData = localStorage.getItem('pageData');
//         pageData = storedData ? JSON.parse(storedData) : {};
//     }

//     const gridRef = useRef(null);
//     const pagination = true;
//     const paginationPageSize = 100;
//     const paginationPageSizeSelector = [10, 50, 100];

//     const formatDate = (date) => {
//         if (!date) return '';
//         const d = new Date(date);
//         return d.toISOString().split('T')[0];
//     };

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
//     const handleClear = () => {
//         setLocation({
//             LocationId: '',
//             PlantCode: auth.PlantCode,
//             LocationCode: '',
//             LocationName: '',
//             LocationRFID: '',
//             RackId: '',
//             RowId: '',
//             Rack: '',
//             Row: '',
//             Status: 'Active',
//             CreatedBy: ''
//         });
//         setSelectedRack([]);
//         setSelectedRow([]);
//         setRowOptions([]);
//         setMappings([]);
//     };

//     const generateLocationCode = (locationName, rackName, rowName) => {
//         if (!locationName || !rackName || !rowName) return '';
//         const loc = locationName.trim().replace(/\s+/g, '-').toUpperCase();
//         const rack = rackName.trim().replace(/\s+/g, '-').toUpperCase();
//         const row = rowName.trim().replace(/\s+/g, '-').toUpperCase();
//         return `${loc}-${rack}-${row}`;
//     };

//     // ======================== FETCH GRID DATA ========================
//     const fetchData = async () => {
//         setLoading(true);
//         try {
//             const response = await axios.post(`${API_URL}/LocationConfig`, {
//                 mode: 'FetchLocation',
//                 PlantCode: auth.PlantCode
//             });
//             if (response.status === 200) {
//                 setLocationData(Array.isArray(response.data) ? response.data : []);
//             }
//         } catch (error) {
//             console.error('Error fetching location details:', error);
//         } finally {
//             setLoading(false);
//         }
//     };


//     // ======================== FETCH RACK MASTER ========================
//     // ======================== FETCH LOCATION MASTER ========================
//     const fetchLocationData = async () => {
//         try {
//             const response = await axios.post(`${API_URL}/LocationMaster`, {
//                 mode: 'FetchLocation'
//             });

//             if (response.status === 200) {
//                 console.log("LOCATION MASTER DATA:", response.data);

//                 setLocationData(
//                     Array.isArray(response.data)
//                         ? response.data
//                         : []
//                 );
//             }
//         } catch (error) {
//             console.error('Error fetching Location Master:', error);
//         }
//     };
//     // ======================== FETCH RACK MASTER ========================
//     const fetchRackData = async () => {
//         try {
//             const response = await axios.post(`${API_URL}/RackMaster`, {
//                 mode: 'FetchRack',
//                 PlantCode: auth.PlantCode
//             });
//             if (response.status === 200) {
//                 setRackData(Array.isArray(response.data) ? response.data : []);
//             }
//         } catch (error) {
//             console.error('Error fetching Rack Master:', error);
//         }
//     };

//     // ======================== FETCH ROW MASTER ========================
//     const fetchRowData = async (rackId) => {
//         try {
//             setRowOptions([]);
//             setSelectedRow([]);
//             if (!rackId) return;
//             const response = await axios.post(`${API_URL}/RowMaster`, {
//                 mode: 'FetchRow',
//                 RackId: rackId,
//                 PlantCode: auth.PlantCode
//             });
//             if (response.status === 200) {
//                 setRowOptions(Array.isArray(response.data) ? response.data : []);
//             }
//         } catch (error) {
//             console.error('Error fetching Row Master:', error);
//         }
//     };

//     useEffect(() => {
//         fetchData();          // Link Location grid
//         fetchLocationData();  // Location Master dropdown
//         fetchRackData();      // Rack Master dropdown

//         const interval = setInterval(() => {
//             fetchData();
//         }, 60000);

//         return () => clearInterval(interval);
//     }, []);

//     // ======================== VIEW HANDLER ========================
//     const handleView = async (data) => {
//         try {
//             const response = await axios.post(`${API_URL}/LocationConfig`, {
//                 mode: 'E',
//                 LocationId: data.LocationId,
//                 PlantCode: data.PlantCode
//             });
//             if (Array.isArray(response.data) && response.data.length > 0) {
//                 setLocation(prev => ({ ...prev, ...response.data[0] }));
//             }
//         } catch (error) {
//             console.error('Error viewing record:', error);
//         }
//     };

//     // ======================== EDIT HANDLER ========================
//     const handleEdit = async (data) => {
//         try {
//             const response = await axios.post(`${API_URL}/LocationConfig`, {
//                 mode: 'E',
//                 LocationId: data.LocationId,
//                 PlantCode: data.PlantCode
//             });
//             if (Array.isArray(response.data) && response.data.length > 0) {
//                 const rec = response.data[0];
//                 setLocation(prev => ({ ...prev, ...rec }));

//                 const matchedRack = rackData.find(r => r.RackId === rec.RackId);
//                 setSelectedRack(matchedRack ? [matchedRack] : []);

//                 if (rec.RackId) {
//                     const rowResp = await axios.post(`${API_URL}/RowMaster`, {
//                         mode: 'FetchRow',
//                         RackId: rec.RackId,
//                         PlantCode: data.PlantCode
//                     });
//                     if (rowResp.status === 200) {
//                         const rows = Array.isArray(rowResp.data) ? rowResp.data : [];
//                         setRowOptions(rows);
//                         const matchedRow = rows.find(r => r.RowId === rec.RowId);
//                         setSelectedRow(matchedRow ? [matchedRow] : []);
//                     }
//                 }
//             }
//         } catch (error) {
//             console.error('ERROR EDITING RECORD:', error);
//         }
//     };

//     // ======================== DELETE HANDLER ========================
//     const handleDelete = async (data) => {
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
//                 const response = await axios.post(`${API_URL}/LocationConfig`, {
//                     mode: 'D',
//                     LocationId: data.LocationId
//                 });
//                 if (response.status === 200) {
//                     await fetchData();
//                     Swal.fire({ title: 'Deleted', text: 'Deleted Successfully', icon: 'success', confirmButtonText: 'Done' });
//                 }
//             } catch (error) {
//                 console.error('ERROR DELETING RECORD:', error);
//                 Swal.fire({ title: 'Error', text: 'Failed to delete. Please try again.', icon: 'error' });
//             } finally {
//                 setLoading(false);
//             }
//         }
//     };

//     // ======================== INPUT CHANGE ========================
//     const handleLocationChange = (e) => {
//         const { name, value } = e.target;
//         setLocation(prev => {
//             const updated = { ...prev, [name]: value };
//             if (name === 'LocationName') {
//                 updated.LocationCode = generateLocationCode(value, prev.Rack, prev.Row);
//             }
//             return updated;
//         });
//     };

//     // ======================== RACK / ROW TYPEAHEAD HANDLERS ========================
//     const handleRackChange = (selected) => {
//         setSelectedRack(selected);
//         if (selected.length > 0) {
//             const rack = selected[0];
//             const newCode = generateLocationCode(Location.LocationName, rack.RackName, Location.Row);
//             setLocation(prev => ({
//                 ...prev,
//                 RackId: rack.RackId,
//                 Rack: rack.RackName,
//                 RowId: '', Row: '',
//                 LocationCode: newCode
//             }));
//             fetchRowData(rack.RackId);
//         } else {
//             setLocation(prev => ({
//                 ...prev,
//                 RackId: '', Rack: '',
//                 RowId: '', Row: '',
//                 LocationCode: ''
//             }));
//             setRowOptions([]);
//             setSelectedRow([]);
//         }
//     };
//     const handleRowChange = (selected) => {
//         setSelectedRow(selected);
//         if (selected.length > 0) {
//             const row = selected[0];
//             const newCode = generateLocationCode(Location.LocationName, Location.Rack, row.RowName);
//             setLocation(prev => ({
//                 ...prev,
//                 RowId: row.RowId,
//                 Row: row.RowName,
//                 LocationCode: newCode
//             }));
//         } else {
//             setLocation(prev => ({
//                 ...prev,
//                 RowId: '', Row: '',
//                 LocationCode: ''
//             }));
//         }
//     };
//     // ======================== ADD ROW TO TEMP MAPPING TABLE ========================
//     // ======================== ADD ROW TO TEMP MAPPING TABLE ========================
//     const handleAddMapping = () => {
//         if (!Location.LocationName.trim()) {
//             Swal.fire({ title: 'Please enter Location Name', icon: 'warning', confirmButtonText: 'OK' });
//             return;
//         }
//         if (!Location.LocationCode.trim()) {
//             Swal.fire({ title: 'Please enter Location Code', icon: 'warning', confirmButtonText: 'OK' });
//             return;
//         }
//         if (!Location.RackId || !Location.RowId) {
//             Swal.fire({ title: 'Please select Rack and Row', icon: 'warning', confirmButtonText: 'OK' });
//             return;
//         }

//         const code = Location.LocationCode.trim().toLowerCase();
//         const rfid = Location.LocationRFID.trim().toLowerCase();

//         // ── Check duplicate LocationCode in DB ──
//         const codeInDB = locationData.some(item =>
//             item.LocationCode?.toLowerCase().trim() === code
//         );
//         if (codeInDB) {
//             Swal.fire({ title: 'Duplicate Location Code', text: `"${Location.LocationCode}" already exists in the database.`, icon: 'warning', confirmButtonText: 'OK' });
//             return;
//         }

//         // ── Check duplicate LocationCode in temp table ──
//         const codeInTemp = mappings.some(item =>
//             item.LocationCode?.toLowerCase().trim() === code
//         );
//         if (codeInTemp) {
//             Swal.fire({ title: 'Duplicate Location Code', text: `"${Location.LocationCode}" already added in the list.`, icon: 'warning', confirmButtonText: 'OK' });
//             return;
//         }

//         // ── Check duplicate LocationRFID in DB (only if RFID entered) ──
//         if (rfid) {
//             const rfidInDB = locationData.some(item =>
//                 item.LocationRFID?.toLowerCase().trim() === rfid
//             );
//             if (rfidInDB) {
//                 Swal.fire({ title: 'Duplicate Location RFID', text: `"${Location.LocationRFID}" already exists in the database.`, icon: 'warning', confirmButtonText: 'OK' });
//                 return;
//             }

//             // ── Check duplicate LocationRFID in temp table ──
//             const rfidInTemp = mappings.some(item =>
//                 item.LocationRFID?.toLowerCase().trim() === rfid
//             );
//             if (rfidInTemp) {
//                 Swal.fire({ title: 'Duplicate Location RFID', text: `"${Location.LocationRFID}" already added in the list.`, icon: 'warning', confirmButtonText: 'OK' });
//                 return;
//             }
//         }

//         const newRow = {
//             LocationCode: Location.LocationCode.trim(),
//             LocationName: Location.LocationName.trim(),
//             LocationRFID: Location.LocationRFID.trim(),
//             RackId: Location.RackId,
//             RackName: selectedRack[0]?.RackName || Location.Rack,
//             RowId: Location.RowId,
//             RowName: selectedRow[0]?.RowName || Location.Row,
//         };
//         setMappings(prev => [...prev, newRow]);

//         // Reset Rack + Row + Code + RFID, keep LocationName
//         setSelectedRack([]);
//         setSelectedRow([]);
//         setRowOptions([]);
//         setLocation(prev => ({
//             ...prev,
//             LocationCode: '',
//             LocationRFID: '',
//             RackId: '', Rack: '',
//             RowId: '', Row: ''
//         }));
//     };

//     const handleSave = async () => {

//         if (!Location.LocationName?.trim()) {
//             Swal.fire({
//                 title: 'Please select Location',
//                 icon: 'warning',
//                 confirmButtonText: 'OK'
//             });
//             return;
//         }

//         if (mappings.length === 0) {
//             Swal.fire({
//                 title: 'Please add at least one mapping',
//                 icon: 'warning',
//                 confirmButtonText: 'OK'
//             });
//             return;
//         }

//         console.log("========== LOCATION SAVE ==========");
//         console.log("Location:", Location);
//         console.log("Mappings:", mappings);

//         setLoading(true);

//         try {

//             const payload = {
//                 mode: 'I',
//                 PlantCode: auth.PlantCode,
//                 CreatedBy: auth.EmployeeName,
//                 Mappings: mappings
//             };

//             console.log("Sending Payload:", payload);

//             const response = await axios.post(
//                 `${API_URL}/LocationConfig`,
//                 payload
//             );

//             console.log("LocationConfig Response:", response.data);

//             if (response.status === 200) {

//                 closeModal('exampleModalAdd');

//                 handleClear();

//                 await fetchData();

//                 Swal.fire({
//                     title: 'Saved Successfully',
//                     text: 'Location has been added.',
//                     icon: 'success',
//                     confirmButtonText: 'Done'
//                 });
//             }

//         } catch (err) {

//             console.error("========== LOCATION SAVE ERROR ==========");
//             console.error("Error:", err);
//             console.error("Response:", err.response);
//             console.error("Response Data:", err.response?.data);
//             console.error("Response Status:", err.response?.status);

//             Swal.fire({
//                 title: 'Error',
//                 text:
//                     err.response?.data?.error ||
//                     err.response?.data?.message ||
//                     err.message ||
//                     'Failed to save. Please try again.',
//                 icon: 'error',
//                 confirmButtonText: 'OK'
//             });

//         } finally {
//             setLoading(false);
//         }
//     };

//     // ======================== UPDATE ========================
//     const handleUpdate = async () => {
//         if (!Location.LocationName.trim()) {
//             Swal.fire({ title: 'Please enter Location Name', icon: 'warning', confirmButtonText: 'OK' });
//             return;
//         }
//         if (!Location.RackId || !Location.RowId) {
//             Swal.fire({ title: 'Please select Rack and Row', icon: 'warning', confirmButtonText: 'OK' });
//             return;
//         }
//         setLoading(true);
//         try {
//             const response = await axios.post(`${API_URL}/LocationConfig`, {
//                 ...Location,
//                 CreatedBy: auth.EmployeeName,
//                 mode: 'U'
//             });
//             if (response.status === 200) {
//                 closeModal('exampleModalEdit');
//                 handleClear();
//                 await fetchData();
//                 Swal.fire({ title: 'Updated Successfully', text: 'Location has been updated.', icon: 'success', confirmButtonText: 'Done' });
//             }
//         } catch (err) {
//             console.error('Update error:', err);
//             Swal.fire({ title: 'Error', text: 'Failed to update. Please try again.', icon: 'error' });
//         } finally {
//             setLoading(false);
//         }
//     };

//     // ======================== PERMISSION CHECKS ========================
//     const canAdd = () => {
//         if ((pageData.addstatus === null || pageData.addstatus === 'i') && auth.UserStatus === 'A') return false;
//         return true;
//     };

//     // ======================== CELL RENDERERS ========================
//     const ViewRenderer = (params) => {
//         if ((pageData.viewstatus === null || pageData.viewstatus === 'i') && auth.UserStatus === 'A') return null;
//         return (
//             <button className="btn btn-hover-effect" onClick={() => handleView(params.data)}
//                 data-bs-toggle="modal" data-bs-target="#exampleModalView">
//                 <FaEye className="text-primary cursor-pointer fs-3" title="View" />
//             </button>
//         );
//     };

//     const EditRenderer = (params) => {
//         if ((pageData.editstatus === null || pageData.editstatus === 'i') && auth.UserStatus === 'A') return null;
//         return (
//             <button onClick={() => handleEdit(params.data)}
//                 data-bs-toggle="modal" data-bs-target="#exampleModalEdit"
//                 className='mt-1 ms-2'
//                 style={{
//                     background: 'linear-gradient(135deg, #007bff, #00b4d8)',
//                     color: '#fff', border: 'none', borderRadius: '50%', padding: '7px',
//                     display: 'flex', alignItems: 'center', justifyContent: 'center',
//                     cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,123,255,0.35)', transition: 'all 0.3s ease',
//                 }}
//                 onMouseEnter={(e) => { e.currentTarget.style.background = 'linear-gradient(135deg, #3399ff, #33ccff)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
//                 onMouseLeave={(e) => { e.currentTarget.style.background = 'linear-gradient(135deg, #007bff, #00b4d8)'; e.currentTarget.style.transform = 'translateY(0)'; }}
//             >
//                 <FaEdit className="fs-5" title="Edit" />
//             </button>
//         );
//     };

//     const DeleteRenderer = (params) => {
//         if ((pageData.deletestatus === null || pageData.deletestatus === 'i') && auth.UserStatus === 'A') return null;
//         return (
//             <button className='mt-1 ms-1' onClick={() => handleDelete(params.data)}
//                 style={{
//                     background: 'linear-gradient(135deg, #ff4d4d, #ff1a1a)',
//                     color: '#fff', border: 'none', borderRadius: '50%', padding: '4px',
//                     display: 'flex', alignItems: 'center', justifyContent: 'center',
//                     cursor: 'pointer', boxShadow: '0 4px 12px rgba(255,0,0,0.35)', transition: 'all 0.3s ease',
//                 }}
//                 onMouseEnter={(e) => { e.currentTarget.style.background = 'linear-gradient(135deg, #ff6666, #ff3333)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
//                 onMouseLeave={(e) => { e.currentTarget.style.background = 'linear-gradient(135deg, #ff4d4d, #ff1a1a)'; e.currentTarget.style.transform = 'translateY(0)'; }}
//             >
//                 <CIcon icon={cilTrash} size="xl" />
//             </button>
//         );
//     };

//     // ======================== COLUMN DEFINITIONS ========================
//     const columdef = [
//         { headerCheckboxSelection: true, checkboxSelection: true, width: 60 },
//         { headerName: "Location RFID", field: "LocationRFID", filter: true, headerClass: 'agheader', floatingFilter: true },
//         { headerName: "Location Code", field: "LocationCode", filter: true, headerClass: 'agheader', floatingFilter: true },

//         { headerName: "Location Name", field: "LocationName", filter: true, headerClass: 'agheader', floatingFilter: true },
//         { headerName: "Rack", field: "RackName", filter: true, headerClass: 'agheader', floatingFilter: true },
//         { headerName: "Row", field: "RowName", filter: true, headerClass: 'agheader', floatingFilter: true },
//         {
//             headerName: "Created Date", field: "CreatedDate", headerClass: 'agheader', filter: true, floatingFilter: true,
//             valueGetter: (params) => {
//                 const date = params.data.CreatedDate;
//                 if (!date) return '-';
//                 const d = new Date(date);
//                 return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')} ${String(d.getUTCHours()).padStart(2, '0')}:${String(d.getUTCMinutes()).padStart(2, '0')}:${String(d.getUTCSeconds()).padStart(2, '0')}`;
//             },
//         },
//         { headerName: "Created By", field: "CreatedBy", filter: true, headerClass: 'agheader', floatingFilter: true },
//         { headerName: "View", pinned: 'right', field: "View", headerClass: 'agheader', cellRenderer: ViewRenderer, width: 80, filter: false, floatingFilter: false },
//         { headerName: 'Edit', pinned: 'right', field: "Edit", headerClass: 'agheader', cellRenderer: EditRenderer, width: 80, filter: false, floatingFilter: false },
//         { headerName: "Delete", pinned: 'right', field: "Delete", headerClass: 'agheader', cellRenderer: DeleteRenderer, width: 90, filter: false, floatingFilter: false },
//     ];

//     const autoGroupColumnDef = useMemo(() => ({
//         headerCheckboxSelection: true, field: "id", flex: 1, minWidth: 240,
//         cellRendererParams: { checkbox: true }
//     }), []);

//     // ======================== RETURN JSX ========================
//     return (
//         <>
//             {loading && (
//                 <div className="loading-overlay">
//                     <div className="loading-spinner">
//                         <BallTriangle height={100} width={100} radius={5} color="#4fa94d" ariaLabel="ball-triangle-loading" wrapperStyle={{ justifyContent: 'center' }} />
//                     </div>
//                 </div>
//             )}

//             <div className="card">
//                 <div className='card-header d-flex justify-content-between align-items-center p-3' style={{ background: '#106FB2' }}>
//                     <h4 className="mb-0 text-white d-flex align-items-center gap-2">
//                         <i className="fas fa-map-marked-alt me-2"></i> Link Location Master
//                     </h4>
//                     <button className="btn-close btn-close-white" onClick={() => navigate("/Settings/Configure")}></button>
//                 </div>

//                 <div className="d-flex justify-content-end flex-wrap gap-2 px-4 mt-2">
//                     {canAdd() && (
//                         <button type="button" className="btn d-flex align-items-center gap-2"
//                             onClick={handleClear} data-bs-toggle="modal" data-bs-target="#exampleModalAdd"
//                             style={{ background: 'linear-gradient(135deg, #00c853, #009624)', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 600, padding: '10px 18px' }}>
//                             <CIcon icon={cilPlus} /> Add Location
//                         </button>
//                     )}
//                     <button type="button" className="btn d-flex align-items-center gap-2"
//                         style={{ background: 'linear-gradient(135deg, #ff4b2b, #ff0000)', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 600, padding: '10px 18px' }}>
//                         <i className="bi bi-cloud-download"></i> Export
//                     </button>
//                 </div>

//                 <div className="card border-0 shadow-sm">
//                     <div className="card-body py-3 px-3 px-md-4">
//                         <div className="ag-theme-quartz mt-2" style={{ height: "450px", width: "100%" }}>
//                             <AgGridReact
//                                 ref={gridRef}
//                                 rowData={locationData}
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

//             {/* ==================== ADD MODAL ==================== */}
//             <div className="modal fade" id="exampleModalAdd" tabIndex="-1" aria-hidden="true"
//                 data-bs-backdrop="static" data-bs-keyboard="false">
//                 <div className="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
//                     <div className="modal-content" style={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 40px rgba(0,0,0,0.15)' }}>

//                         <div className="modal-header p-3" style={{ background: '#3f77d2', borderRadius: '16px 16px 0 0' }}>
//                             <h5 className="modal-title text-white fw-bold">
//                                 <i className="fas fa-plus-circle me-2"></i> Add Location
//                             </h5>
//                             <button type="button" className="btn-close btn-close-white"
//                                 data-bs-dismiss="modal" onClick={handleClear}></button>
//                         </div>

//                         <div className="modal-body p-3 p-md-4">
//                             <div className="row g-3">

//                                 <div className="col-12">
//                                     <h6 className="fw-bold text-primary">
//                                         <i className="fas fa-info-circle me-2"></i> Basic Information
//                                     </h6>
//                                     <hr className="mt-1" />
//                                 </div>

//                                 {/* ── Row 1: Location Name | Rack | Row ── */}
//                                 <div className="col-12 col-md-4">
//                                     <label className="form-label fw-semibold">
//                                         Location <span className="text-danger">*</span>
//                                     </label>

//                                     <Typeahead
//                                         id="location-typeahead-add"
//                                         labelKey={(option) =>
//                                             `${option.LocationCode} - ${option.LocationName}`
//                                         }
//                                         options={locationData}
//                                         selected={
//                                             Location.LocationId
//                                                 ? locationData.filter(
//                                                     x => Number(x.LocationId) === Number(Location.LocationId)
//                                                 )
//                                                 : []
//                                         }
//                                         onChange={(selected) => {
//                                             const loc = selected[0];

//                                             setLocation(prev => ({
//                                                 ...prev,
//                                                 LocationId: loc?.LocationId || '',
//                                                 LocationName: loc?.LocationName || '',
//                                                 LocationCode: loc?.LocationCode || '',
//                                                 LocationRFID: loc?.LocationRFID || '',
//                                                 RackId: '',
//                                                 Rack: '',
//                                                 RowId: '',
//                                                 Row: ''
//                                             }));

//                                             setSelectedRack([]);
//                                             setSelectedRow([]);
//                                             setRowOptions([]);
//                                         }}
//                                         placeholder="Select Location..."
//                                         clearButton
//                                     />
//                                 </div>

//                                 <div className="col-12 col-md-4">
//                                     <label className="form-label fw-semibold">
//                                         Rack <span className="text-danger">*</span>
//                                     </label>
//                                     <Typeahead
//                                         id="rack-typeahead-add"
//                                         labelKey={(option) => `${option.RackCode} - ${option.RackName}`}
//                                         options={rackData}
//                                         selected={selectedRack}
//                                         onChange={handleRackChange}
//                                         placeholder="Search Rack..."
//                                         clearButton
//                                     />
//                                 </div>

//                                 <div className="col-12 col-md-4">
//                                     <label className="form-label fw-semibold">
//                                         Row <span className="text-danger">*</span>
//                                     </label>
//                                     <Typeahead
//                                         id="row-typeahead-add"
//                                         labelKey={(option) => `${option.RowCode} - ${option.RowName}`}
//                                         options={rowOptions}
//                                         selected={selectedRow}
//                                         onChange={handleRowChange}
//                                         placeholder={Location.RackId ? "Search Row..." : "Select Rack first"}
//                                         clearButton
//                                         disabled={!Location.RackId}
//                                     />
//                                 </div>

//                                 {/* ── Row 2: Location Code | Location RFID | Add button ── */}
//                                 <div className="col-12 col-md-4">
//                                     <label className="form-label fw-semibold">
//                                         Location Code <span className="text-danger">*</span>
//                                     </label>
//                                     <input
//                                         type="text"
//                                         className="form-control"
//                                         name="LocationCode"
//                                         value={Location.LocationCode}
//                                         onChange={handleLocationChange}
//                                         placeholder="Enter Location Code"
//                                     />
//                                 </div>

//                                 <div className="col-12 col-md-4">
//                                     <label className="form-label fw-semibold">Location RFID</label>
//                                     <input
//                                         type="text"
//                                         className="form-control"
//                                         name="LocationRFID"
//                                         value={Location.LocationRFID}
//                                         onChange={handleLocationChange}
//                                         placeholder="Enter Location RFID"
//                                     />
//                                 </div>

//                                 <div className="col-12 col-md-4 d-flex align-items-end">
//                                     <button
//                                         type="button"
//                                         className="btn text-white fw-semibold d-flex align-items-center gap-2  justify-content-center"
//                                         onClick={handleAddMapping}
//                                         style={{
//                                             background: 'linear-gradient(135deg, #007bff, #00b4d8)',
//                                             border: 'none', borderRadius: '10px', padding: '9px 18px'
//                                         }}
//                                     >
//                                         <CIcon icon={cilPlus} /> Add
//                                     </button>
//                                 </div>

//                                 {/* ── Mapping Table ── */}
//                                 {mappings.length > 0 && (
//                                     <div className="col-12 mt-2">
//                                         <h6 className="fw-bold text-secondary mb-2">
//                                             <i className="fas fa-list me-2"></i> Added Location Mappings
//                                         </h6>
//                                         <div className="table-responsive">
//                                             <table className="table table-bordered table-sm align-middle">
//                                                 <thead style={{ background: '#f0f4ff' }}>
//                                                     <tr>
//                                                         <th>#</th>
//                                                         <th>Location Name</th>
//                                                         <th>Location Code</th>
//                                                         <th>Location RFID</th>
//                                                         <th>Rack</th>
//                                                         <th>Row</th>
//                                                         <th>Action</th>
//                                                     </tr>
//                                                 </thead>
//                                                 <tbody>
//                                                     {mappings.map((m, i) => (
//                                                         <tr key={i}>
//                                                             <td>{i + 1}</td>
//                                                             <td>{m.LocationName}</td>
//                                                             <td>{m.LocationCode}</td>
//                                                             <td>{m.LocationRFID || '-'}</td>
//                                                             <td>{m.RackName}</td>
//                                                             <td>{m.RowName}</td>
//                                                             <td>
//                                                                 <button
//                                                                     className="btn btn-sm btn-danger d-flex align-items-center justify-content-center"
//                                                                     style={{ borderRadius: '50%', width: '30px', height: '30px', padding: 0 }}
//                                                                     onClick={() => setMappings(prev => prev.filter((_, idx) => idx !== i))}
//                                                                 >
//                                                                     <CIcon icon={cilTrash} />
//                                                                 </button>
//                                                             </td>
//                                                         </tr>
//                                                     ))}
//                                                 </tbody>
//                                             </table>
//                                         </div>
//                                     </div>
//                                 )}

//                             </div>
//                         </div>

//                         <div className="modal-footer">
//                             <button type="button" className="btn btn-secondary d-flex align-items-center gap-2"
//                                 data-bs-dismiss="modal" onClick={handleClear}
//                                 style={{ borderRadius: '10px', padding: '9px 18px' }}>
//                                 <i className="fas fa-times"></i> Cancel
//                             </button>
//                             <button type="button"
//                                 className="btn text-white fw-semibold d-flex align-items-center gap-2"
//                                 onClick={handleSave} disabled={loading}
//                                 style={{ background: 'linear-gradient(135deg, #00c853, #009624)', border: 'none', borderRadius: '10px', padding: '9px 22px' }}>
//                                 {loading
//                                     ? <><span className="spinner-border spinner-border-sm me-1"></span> Saving...</>
//                                     : <><i className="fas fa-save"></i> Save</>
//                                 }
//                             </button>
//                         </div>
//                     </div>
//                 </div>
//             </div>

//             {/* ==================== VIEW MODAL ==================== */}
//             <div className="modal fade" id="exampleModalView" tabIndex="-1" aria-hidden="true">
//                 <div className="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
//                     <div className="modal-content" style={{ borderRadius: '16px', border: 'none' }}>

//                         <div className="modal-header p-3"
//                             style={{ background: 'linear-gradient(135deg, #28a745, #5cb85c)', borderRadius: '16px 16px 0 0' }}>
//                             <h5 className="modal-title text-white fw-bold">
//                                 <i className="fas fa-eye me-2"></i> View Location Details
//                             </h5>
//                             <button type="button" className="btn-close btn-close-white" data-bs-dismiss="modal"></button>
//                         </div>

//                         <div className="modal-body p-3 p-md-4">
//                             <div className="row g-3">
//                                 <div className="col-12 col-md-4">
//                                     <label className="form-label text-muted">Location Name</label>
//                                     <p className="fw-semibold">{Location.LocationName || '-'}</p>
//                                 </div>
//                                 <div className="col-12 col-md-4">
//                                     <label className="form-label text-muted">Rack</label>
//                                     <p className="fw-semibold">{Location.RackName || '-'}</p>
//                                 </div>
//                                 <div className="col-12 col-md-4">
//                                     <label className="form-label text-muted">Row</label>
//                                     <p className="fw-semibold">{Location.RowName || '-'}</p>
//                                 </div>
//                                 <div className="col-12 col-md-4">
//                                     <label className="form-label text-muted">Location Code</label>
//                                     <p className="fw-semibold">{Location.LocationCode || '-'}</p>
//                                 </div>
//                                 <div className="col-12 col-md-4">
//                                     <label className="form-label text-muted">Location RFID</label>
//                                     <p className="fw-semibold">{Location.LocationRFID || '-'}</p>
//                                 </div>
//                                 <div className="col-12 col-md-4">
//                                     <label className="form-label text-muted">Created By</label>
//                                     <p className="fw-semibold">{Location.CreatedBy || '-'}</p>
//                                 </div>
//                                 <div className="col-12 col-md-4">
//                                     <label className="form-label text-muted">Created Date</label>
//                                     <p className="fw-semibold">{formatDate(Location.CreatedDate) || '-'}</p>
//                                 </div>
//                             </div>
//                         </div>

//                         <div className="modal-footer">
//                             <button type="button" className="btn btn-secondary" data-bs-dismiss="modal" style={{ borderRadius: '10px' }}>
//                                 <i className="fas fa-times me-1"></i> Close
//                             </button>
//                         </div>
//                     </div>
//                 </div>
//             </div>

//             {/* ==================== EDIT MODAL ==================== */}
//             <div className="modal fade" id="exampleModalEdit" tabIndex="-1" aria-hidden="true"
//                 data-bs-backdrop="static" data-bs-keyboard="false">
//                 <div className="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
//                     <div className="modal-content" style={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 40px rgba(0,0,0,0.15)' }}>

//                         <div className="modal-header p-3" style={{ background: '#3f77d2', borderRadius: '16px 16px 0 0' }}>
//                             <h5 className="modal-title text-white fw-bold">
//                                 <i className="fas fa-edit me-2"></i> Edit Location
//                             </h5>
//                             <button type="button" className="btn-close btn-close-white"
//                                 data-bs-dismiss="modal" onClick={handleClear}></button>
//                         </div>

//                         <div className="modal-body p-3 p-md-4">
//                             <div className="row g-3">

//                                 <div className="col-12">
//                                     <h6 className="fw-bold text-primary">
//                                         <i className="fas fa-info-circle me-2"></i> Basic Information
//                                     </h6>
//                                     <hr className="mt-1" />
//                                 </div>

//                                 {/* ── Row 1: Location Name | Rack | Row ── */}
//                                 <div className="col-12 col-md-4">
//                                     <label className="form-label fw-semibold">
//                                         Location Name <span className="text-danger">*</span>
//                                     </label>
//                                     <Typeahead
//                                         id="location-typeahead-add"
//                                         labelKey={(option) =>
//                                             `${option.LocationCode} - ${option.LocationName}`
//                                         }
//                                         options={locationData}
//                                         selected={
//                                             Location.LocationId
//                                                 ? locationData.filter(
//                                                     x =>
//                                                         Number(x.LocationId) ===
//                                                         Number(Location.LocationId)
//                                                 )
//                                                 : []
//                                         }
//                                         onChange={(selected) => {
//                                             const loc = selected[0];

//                                             setLocation(prev => ({
//                                                 ...prev,
//                                                 LocationId: loc?.LocationId || '',
//                                                 LocationCode: loc?.LocationCode || '',
//                                                 LocationName: loc?.LocationName || '',
//                                                 RackId: '',
//                                                 Rack: '',
//                                                 RowId: '',
//                                                 Row: ''
//                                             }));

//                                             setSelectedRack([]);
//                                             setSelectedRow([]);
//                                             setRowOptions([]);
//                                         }}
//                                         placeholder="Select Location..."
//                                         clearButton
//                                     />
//                                 </div>

//                                 <div className="col-12 col-md-4">
//                                     <label className="form-label fw-semibold">
//                                         Rack <span className="text-danger">*</span>
//                                     </label>
//                                     <Typeahead
//                                         id="rack-typeahead-edit"
//                                         labelKey={(option) => `${option.RackCode} - ${option.RackName}`}
//                                         options={rackData}
//                                         selected={selectedRack}
//                                         onChange={handleRackChange}
//                                         placeholder="Search Rack..."
//                                         clearButton
//                                     />
//                                 </div>

//                                 <div className="col-12 col-md-4">
//                                     <label className="form-label fw-semibold">
//                                         Row <span className="text-danger">*</span>
//                                     </label>
//                                     <Typeahead
//                                         id="row-typeahead-edit"
//                                         labelKey={(option) => `${option.RowCode} - ${option.RowName}`}
//                                         options={rowOptions}
//                                         selected={selectedRow}
//                                         onChange={handleRowChange}
//                                         placeholder={Location.RackId ? "Search Row..." : "Select Rack first"}
//                                         clearButton
//                                         disabled={!Location.RackId}
//                                     />
//                                 </div>

//                                 {/* ── Row 2: Location Code (readonly) | Location RFID ── */}
//                                 <div className="col-12 col-md-4">
//                                     <label className="form-label fw-semibold">Location Code</label>
//                                     <input
//                                         type="text"
//                                         className="form-control"
//                                         name="LocationCode"
//                                         value={Location.LocationCode}
//                                         readOnly
//                                         placeholder="Auto-generated"
//                                         style={{ background: '#f8f9fa', cursor: 'not-allowed' }}
//                                     />
//                                 </div>

//                                 <div className="col-12 col-md-4">
//                                     <label className="form-label fw-semibold">Location RFID</label>
//                                     <input
//                                         type="text"
//                                         className="form-control"
//                                         name="LocationRFID"
//                                         value={Location.LocationRFID}
//                                         onChange={handleLocationChange}
//                                         placeholder="Enter Location RFID"
//                                     />
//                                 </div>

//                             </div>
//                         </div>

//                         <div className="modal-footer">
//                             <button type="button" className="btn btn-secondary d-flex align-items-center gap-2"
//                                 data-bs-dismiss="modal" onClick={handleClear}
//                                 style={{ borderRadius: '10px', padding: '9px 18px' }}>
//                                 <i className="fas fa-times"></i> Cancel
//                             </button>
//                             <button type="button"
//                                 className="btn text-white fw-semibold d-flex align-items-center gap-2"
//                                 onClick={handleUpdate} disabled={loading}
//                                 style={{ background: 'linear-gradient(135deg, #00c853, #009624)', border: 'none', borderRadius: '10px', padding: '9px 22px' }}>
//                                 {loading
//                                     ? <><span className="spinner-border spinner-border-sm me-1"></span> Updating...</>
//                                     : <><i className="fas fa-save"></i> Update</>
//                                 }
//                             </button>
//                         </div>
//                     </div>
//                 </div>
//             </div>
//         </>
//     );
// };

// export default LocationMaster;

import React, { useMemo, useState, useEffect, useRef } from 'react';
import { AgGridReact } from 'ag-grid-react';
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import axios from 'axios';
import Swal from 'sweetalert2';
import { BallTriangle } from 'react-loader-spinner';
import { useLocation, useNavigate } from "react-router-dom";
import { getConfig } from 'src/config';
import CIcon from '@coreui/icons-react';
import { cilPlus, cilTrash } from '@coreui/icons';
import { FaEdit, FaEye } from 'react-icons/fa';
import { Typeahead } from 'react-bootstrap-typeahead';
import 'react-bootstrap-typeahead/css/Typeahead.css';

const LocationMaster = ({ auth }) => {
    const API_URL = getConfig().REACT_APP_API_URL;
    const navigate = useNavigate();

    // ======================== STATE ========================
    const [loading, setLoading] = useState(false);

    // rowData = the actual "Link Location" grid rows (from /LocationConfig)
    // locationOptions = the master Location list for the "Location" dropdown (from /LocationMaster)
    // These were previously sharing one state variable and clobbering each other.
    const [rowData, setRowData] = useState([]);
    const [locationOptions, setLocationOptions] = useState([]);

    const [rackData, setRackData] = useState([]);
    const [rowOptions, setRowOptions] = useState([]);
    const [mappings, setMappings] = useState([]);

    const [selectedRack, setSelectedRack] = useState([]);
    const [selectedRow, setSelectedRow] = useState([]);

    const initialLocation = {
        LinkId: '',       // PK of this Link Location row — used for View/Edit/Update/Delete
        LocationId: '',    // FK of the picked master Location — Typeahead selection only
        LocationCode: '',
        LocationName: '',
        LocationRFID: '',
        RackId: '',
        RowId: '',
        Rack: '',
        Row: '',
        Status: 'Active',
        CreatedBy: ''
    };

    const [Location, setLocation] = useState(initialLocation);

    // ======================== PERMISSIONS (from Configure.jsx: state={{ permission, screenId: 'AC007' }}) ========================
    const location = useLocation();
    let permission = location.state?.permission;
    if (permission) {
        localStorage.setItem('linkLocationMasterPermission', JSON.stringify(permission));
    } else {
        const stored = localStorage.getItem('linkLocationMasterPermission');
        permission = stored ? JSON.parse(stored) : {};
    }

    const canAdd = auth.UserStatus === 'SA' || permission?.AddStatus === 'a';
    const canEdit = auth.UserStatus === 'SA' || permission?.EditStatus === 'a';
    const canDelete = auth.UserStatus === 'SA' || permission?.DeleteStatus === 'a';

    const gridRef = useRef(null);
    const pagination = true;
    const paginationPageSize = 100;
    const paginationPageSizeSelector = [10, 50, 100];

    const formatDate = (date) => {
        if (!date) return '';
        const d = new Date(date);
        return d.toISOString().split('T')[0];
    };

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
        setLocation(initialLocation);
        setSelectedRack([]);
        setSelectedRow([]);
        setRowOptions([]);
        setMappings([]);
    };

    const generateLocationCode = (locationName, rackName, rowName) => {
        if (!locationName || !rackName || !rowName) return '';
        const loc = locationName.trim().replace(/\s+/g, '-').toUpperCase();
        const rack = rackName.trim().replace(/\s+/g, '-').toUpperCase();
        const row = rowName.trim().replace(/\s+/g, '-').toUpperCase();
        return `${loc}-${rack}-${row}`;
    };

    // ======================== FETCH GRID DATA (branch-scoped) ========================
    const fetchData = async () => {
        setLoading(true);
        try {
            const response = await axios.post(`${API_URL}/LocationConfig`, {
                mode: 'FetchLocation',
                branchid: auth.branchid,
                BranchAccess: auth.UserStatus === 'SA' ? null : auth.BranchAccess
            });
            if (response.status === 200) {
                setRowData(Array.isArray(response.data) ? response.data : []);
            }
        } catch (error) {
            console.error('Error fetching location details:', error);
        } finally {
            setLoading(false);
        }
    };

    // ======================== FETCH LOCATION MASTER (dropdown source) ========================
    const fetchLocationOptions = async () => {
        try {
            const response = await axios.post(`${API_URL}/LocationMaster`, {
                mode: 'FetchLocation'
            });
            if (response.status === 200) {
                setLocationOptions(Array.isArray(response.data) ? response.data : []);
            }
        } catch (error) {
            console.error('Error fetching Location Master:', error);
        }
    };

    // ======================== FETCH RACK MASTER ========================
    const fetchRackData = async () => {
        try {
            const response = await axios.post(`${API_URL}/RackMaster`, {
                mode: 'FetchRack'
            });
            if (response.status === 200) {
                setRackData(Array.isArray(response.data) ? response.data : []);
            }
        } catch (error) {
            console.error('Error fetching Rack Master:', error);
        }
    };

    // ======================== FETCH ROW MASTER ========================
    const fetchRowData = async (rackId) => {
        try {
            setRowOptions([]);
            setSelectedRow([]);
            if (!rackId) return;
            const response = await axios.post(`${API_URL}/RowMaster`, {
                mode: 'FetchRow',
                RackId: rackId
            });
            if (response.status === 200) {
                setRowOptions(Array.isArray(response.data) ? response.data : []);
            }
        } catch (error) {
            console.error('Error fetching Row Master:', error);
        }
    };

    useEffect(() => {
        fetchData();            // Link Location grid
        fetchLocationOptions(); // Location Master dropdown
        fetchRackData();        // Rack Master dropdown

        const interval = setInterval(() => {
            fetchData();
        }, 60000);

        return () => clearInterval(interval);
    }, []);

    // ======================== VIEW HANDLER ========================
    const handleView = async (data) => {
        try {
            const response = await axios.post(`${API_URL}/LocationConfig`, {
                mode: 'E',
                LinkId: data.LinkId
            });
            if (Array.isArray(response.data) && response.data.length > 0) {
                setLocation(prev => ({ ...prev, ...response.data[0] }));
            }
        } catch (error) {
            console.error('Error viewing record:', error);
        }
    };

    // ======================== EDIT HANDLER ========================
    const handleEdit = async (data) => {
        try {

            const response = await axios.post(`${API_URL}/LocationConfig`, {
                mode: 'E',
                LinkId: data.LinkId
            });
            if (Array.isArray(response.data) && response.data.length > 0) {
                const rec = response.data[0];
                setLocation({ ...initialLocation, ...rec });

                const matchedRack = rackData.find(r => r.RackId === rec.RackId);
                setSelectedRack(matchedRack ? [matchedRack] : []);

                if (rec.RackId) {
                    const rowResp = await axios.post(`${API_URL}/RowMaster`, {
                        mode: 'FetchRow',
                        RackId: rec.RackId
                    });
                    if (rowResp.status === 200) {
                        const rows = Array.isArray(rowResp.data) ? rowResp.data : [];
                        setRowOptions(rows);
                        const matchedRow = rows.find(r => r.RowId === rec.RowId);
                        setSelectedRow(matchedRow ? [matchedRow] : []);
                    }
                }
            }
        } catch (error) {
            console.error('ERROR EDITING RECORD:', error);
        }
    };

    // ======================== DELETE HANDLER ========================
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
                const response = await axios.post(`${API_URL}/LocationConfig`, {
                    mode: 'D',
                    LinkId: data.LinkId
                });
                if (response.status === 200) {
                    await fetchData();
                    Swal.fire({ title: 'Deleted', text: 'Deleted Successfully', icon: 'success', confirmButtonText: 'Done' });
                }
            } catch (error) {
                console.error('ERROR DELETING RECORD:', error);
                Swal.fire({ title: 'Error', text: 'Failed to delete. Please try again.', icon: 'error' });
            } finally {
                setLoading(false);
            }
        }
    };

    // ======================== INPUT CHANGE ========================
    const handleLocationChange = (e) => {
        const { name, value } = e.target;
        setLocation(prev => {
            const updated = { ...prev, [name]: value };
            if (name === 'LocationName') {
                updated.LocationCode = generateLocationCode(value, prev.Rack, prev.Row);
            }
            return updated;
        });
    };

    // ======================== RACK / ROW TYPEAHEAD HANDLERS ========================
    const handleRackChange = (selected) => {
        setSelectedRack(selected);
        if (selected.length > 0) {
            const rack = selected[0];
            const newCode = generateLocationCode(Location.LocationName, rack.RackName, Location.Row);
            setLocation(prev => ({
                ...prev,
                RackId: rack.RackId,
                Rack: rack.RackName,
                RowId: '', Row: '',
                LocationCode: newCode
            }));
            fetchRowData(rack.RackId);
        } else {
            setLocation(prev => ({
                ...prev,
                RackId: '', Rack: '',
                RowId: '', Row: '',
                LocationCode: ''
            }));
            setRowOptions([]);
            setSelectedRow([]);
        }
    };
    const handleRowChange = (selected) => {
        setSelectedRow(selected);
        if (selected.length > 0) {
            const row = selected[0];
            const newCode = generateLocationCode(Location.LocationName, Location.Rack, row.RowName);
            setLocation(prev => ({
                ...prev,
                RowId: row.RowId,
                Row: row.RowName,
                LocationCode: newCode
            }));
        } else {
            setLocation(prev => ({
                ...prev,
                RowId: '', Row: '',
                LocationCode: ''
            }));
        }
    };

    // ======================== ADD ROW TO TEMP MAPPING TABLE ========================
    const handleAddMapping = () => {
        if (!Location.LocationName.trim()) {
            Swal.fire({ title: 'Please enter Location Name', icon: 'warning', confirmButtonText: 'OK' });
            return;
        }
        if (!Location.LocationCode.trim()) {
            Swal.fire({ title: 'Please enter Location Code', icon: 'warning', confirmButtonText: 'OK' });
            return;
        }
        if (!Location.RackId || !Location.RowId) {
            Swal.fire({ title: 'Please select Rack and Row', icon: 'warning', confirmButtonText: 'OK' });
            return;
        }

        const code = Location.LocationCode.trim().toLowerCase();
        const rfid = Location.LocationRFID.trim().toLowerCase();

        // ── Check duplicate LocationCode against saved grid rows ──
        const codeInDB = rowData.some(item =>
            item.LocationCode?.toLowerCase().trim() === code
        );
        if (codeInDB) {
            Swal.fire({ title: 'Duplicate Location Code', text: `"${Location.LocationCode}" already exists in the database.`, icon: 'warning', confirmButtonText: 'OK' });
            return;
        }

        // ── Check duplicate LocationCode in temp table ──
        const codeInTemp = mappings.some(item =>
            item.LocationCode?.toLowerCase().trim() === code
        );
        if (codeInTemp) {
            Swal.fire({ title: 'Duplicate Location Code', text: `"${Location.LocationCode}" already added in the list.`, icon: 'warning', confirmButtonText: 'OK' });
            return;
        }

        // ── Check duplicate LocationRFID against saved grid rows (only if RFID entered) ──
        if (rfid) {
            const rfidInDB = rowData.some(item =>
                item.LocationRFID?.toLowerCase().trim() === rfid
            );
            if (rfidInDB) {
                Swal.fire({ title: 'Duplicate Location RFID', text: `"${Location.LocationRFID}" already exists in the database.`, icon: 'warning', confirmButtonText: 'OK' });
                return;
            }

            // ── Check duplicate LocationRFID in temp table ──
            const rfidInTemp = mappings.some(item =>
                item.LocationRFID?.toLowerCase().trim() === rfid
            );
            if (rfidInTemp) {
                Swal.fire({ title: 'Duplicate Location RFID', text: `"${Location.LocationRFID}" already added in the list.`, icon: 'warning', confirmButtonText: 'OK' });
                return;
            }
        }

        const newRow = {
            LocationCode: Location.LocationCode.trim(),
            LocationName: Location.LocationName.trim(),
            LocationRFID: Location.LocationRFID.trim(),
            RackId: Location.RackId,
            RackName: selectedRack[0]?.RackName || Location.Rack,
            RowId: Location.RowId,
            RowName: selectedRow[0]?.RowName || Location.Row,
        };
        setMappings(prev => [...prev, newRow]);

        // Reset Rack + Row + Code + RFID, keep LocationName
        setSelectedRack([]);
        setSelectedRow([]);
        setRowOptions([]);
        setLocation(prev => ({
            ...prev,
            LocationCode: '',
            LocationRFID: '',
            RackId: '', Rack: '',
            RowId: '', Row: ''
        }));
    };

    // ======================== SAVE (INSERT) ========================
    const handleSave = async () => {
        if (!Location.LocationName?.trim()) {
            Swal.fire({ title: 'Please select Location', icon: 'warning', confirmButtonText: 'OK' });
            return;
        }
        if (mappings.length === 0) {
            Swal.fire({ title: 'Please add at least one mapping', icon: 'warning', confirmButtonText: 'OK' });
            return;
        }

        setLoading(true);
        try {
            const payload = {
                mode: 'I',
                branchid: auth.branchid,
                CreatedBy: auth.employeename,
                Mappings: mappings
            };

            const response = await axios.post(`${API_URL}/LocationConfig`, payload);

            if (response.status === 200) {
                closeModal('exampleModalAdd');
                handleClear();
                await fetchData();
                Swal.fire({
                    title: 'Saved Successfully',
                    text: 'Location has been added.',
                    icon: 'success',
                    confirmButtonText: 'Done'
                });
            }
        } catch (err) {
            console.error('Location save error:', err);
            Swal.fire({
                title: 'Error',
                text:
                    err.response?.data?.error ||
                    err.response?.data?.message ||
                    err.message ||
                    'Failed to save. Please try again.',
                icon: 'error',
                confirmButtonText: 'OK'
            });
        } finally {
            setLoading(false);
        }
    };

    // ======================== UPDATE ========================
    const handleUpdate = async () => {
        if (!Location.LocationName.trim()) {
            Swal.fire({ title: 'Please enter Location Name', icon: 'warning', confirmButtonText: 'OK' });
            return;
        }
        if (!Location.LocationCode.trim()) {
            Swal.fire({ title: 'Please enter Location Code', icon: 'warning', confirmButtonText: 'OK' });
            return;
        }
        if (!Location.RackId || !Location.RowId) {
            Swal.fire({ title: 'Please select Rack and Row', icon: 'warning', confirmButtonText: 'OK' });
            return;
        }
        setLoading(true);
        try {
            const response = await axios.post(`${API_URL}/LocationConfig`, {
                ...Location,
                CreatedBy: auth.employeename,
                mode: 'U'
            });
            const result = response.data?.[0];
            if (result?.StatusCode === 0) {
                Swal.fire({ title: result.Message, icon: 'warning' });
                return;
            }
            closeModal('exampleModalEdit');
            handleClear();
            await fetchData();
            Swal.fire({ title: 'Updated Successfully', text: 'Location has been updated.', icon: 'success', confirmButtonText: 'Done' });
        } catch (err) {
            console.error('Update error:', err);
            Swal.fire({ title: 'Error', text: 'Failed to update. Please try again.', icon: 'error' });
        } finally {
            setLoading(false);
        }
    };

    // ======================== CELL RENDERERS ========================
    const ViewRenderer = (params) => (
        <button className="btn btn-hover-effect" onClick={() => handleView(params.data)}
            data-bs-toggle="modal" data-bs-target="#exampleModalView">
            <FaEye className="text-primary cursor-pointer fs-3" title="View" />
        </button>
    );

    const EditRenderer = (params) => {
        if (!canEdit) return null;
        return (
            <button onClick={() => handleEdit(params.data)}
                data-bs-toggle="modal" data-bs-target="#exampleModalEdit"
                className='mt-1 ms-2'
                style={{
                    background: 'linear-gradient(135deg, #007bff, #00b4d8)',
                    color: '#fff', border: 'none', borderRadius: '50%', padding: '7px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,123,255,0.35)', transition: 'all 0.3s ease',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'linear-gradient(135deg, #3399ff, #33ccff)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'linear-gradient(135deg, #007bff, #00b4d8)'; e.currentTarget.style.transform = 'translateY(0)'; }}
            >
                <FaEdit className="fs-5" title="Edit" />
            </button>
        );
    };

    const DeleteRenderer = (params) => {
        if (!canDelete) return null;
        return (
            <button className='mt-1 ms-1' onClick={() => handleDelete(params.data)}
                style={{
                    background: 'linear-gradient(135deg, #ff4d4d, #ff1a1a)',
                    color: '#fff', border: 'none', borderRadius: '50%', padding: '4px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', boxShadow: '0 4px 12px rgba(255,0,0,0.35)', transition: 'all 0.3s ease',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'linear-gradient(135deg, #ff6666, #ff3333)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'linear-gradient(135deg, #ff4d4d, #ff1a1a)'; e.currentTarget.style.transform = 'translateY(0)'; }}
            >
                <CIcon icon={cilTrash} size="xl" />
            </button>
        );
    };

    // ======================== COLUMN DEFINITIONS ========================
    const columdef = [
        { headerCheckboxSelection: true, checkboxSelection: true, width: 60 },
        { headerName: "Location RFID", field: "LocationRFID", filter: true, headerClass: 'agheader', floatingFilter: true },
        { headerName: "Location Code", field: "LocationCode", filter: true, headerClass: 'agheader', floatingFilter: true },
        { headerName: "Location Name", field: "LocationName", filter: true, headerClass: 'agheader', floatingFilter: true },
        { headerName: "Rack", field: "RackName", filter: true, headerClass: 'agheader', floatingFilter: true },
        { headerName: "Row", field: "RowName", filter: true, headerClass: 'agheader', floatingFilter: true },
        {
            headerName: "Created Date", field: "CreatedDate", headerClass: 'agheader', filter: true, floatingFilter: true,
            valueGetter: (params) => {
                const date = params.data.CreatedDate;
                if (!date) return '-';
                const d = new Date(date);
                return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')} ${String(d.getUTCHours()).padStart(2, '0')}:${String(d.getUTCMinutes()).padStart(2, '0')}:${String(d.getUTCSeconds()).padStart(2, '0')}`;
            },
        },
        { headerName: "Created By", field: "CreatedBy", filter: true, headerClass: 'agheader', floatingFilter: true },
        { headerName: "View", pinned: 'right', field: "View", headerClass: 'agheader', cellRenderer: ViewRenderer, width: 80, filter: false, floatingFilter: false },
        { headerName: 'Edit', pinned: 'right', field: "Edit", headerClass: 'agheader', cellRenderer: EditRenderer, width: 80, filter: false, floatingFilter: false },
        { headerName: "Delete", pinned: 'right', field: "Delete", headerClass: 'agheader', cellRenderer: DeleteRenderer, width: 90, filter: false, floatingFilter: false },
    ];

    const autoGroupColumnDef = useMemo(() => ({
        headerCheckboxSelection: true, field: "id", flex: 1, minWidth: 240,
        cellRendererParams: { checkbox: true }
    }), []);

    // ======================== RETURN JSX ========================
    return (
        <>
            {loading && (
                <div className="loading-overlay">
                    <div className="loading-spinner">
                        <BallTriangle height={100} width={100} radius={5} color="#4fa94d" ariaLabel="ball-triangle-loading" wrapperStyle={{ justifyContent: 'center' }} />
                    </div>
                </div>
            )}

            <div className="card">
                <div className='card-header d-flex justify-content-between align-items-center p-3' style={{ background: '#106FB2' }}>
                    <h4 className="mb-0 text-white d-flex align-items-center gap-2">
                        <i className="fas fa-map-marked-alt me-2"></i> Link Location Master
                    </h4>
                    <button className="btn-close btn-close-white" onClick={() => navigate("/Settings/Configure")}></button>
                </div>

                <div className="d-flex justify-content-end flex-wrap gap-2 px-4 mt-2">
                    {canAdd && (
                        <button type="button" className="btn d-flex align-items-center gap-2"
                            onClick={handleClear} data-bs-toggle="modal" data-bs-target="#exampleModalAdd"
                            style={{ background: 'linear-gradient(135deg, #00c853, #009624)', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 600, padding: '10px 18px' }}>
                            <CIcon icon={cilPlus} /> Add Link Location
                        </button>
                    )}
                    <button type="button" className="btn d-flex align-items-center gap-2"
                        style={{ background: 'linear-gradient(135deg, #ff4b2b, #ff0000)', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 600, padding: '10px 18px' }}>
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

            {/* ==================== ADD MODAL ==================== */}
            <div className="modal fade" id="exampleModalAdd" tabIndex="-1" aria-hidden="true"
                data-bs-backdrop="static" data-bs-keyboard="false">
                <div className="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
                    <div className="modal-content" style={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 40px rgba(0,0,0,0.15)' }}>

                        <div className="modal-header p-3" style={{ background: '#3f77d2', borderRadius: '16px 16px 0 0' }}>
                            <h5 className="modal-title text-white fw-bold">
                                <i className="fas fa-plus-circle me-2"></i> Add Link Location
                            </h5>
                            <button type="button" className="btn-close btn-close-white"
                                data-bs-dismiss="modal" onClick={handleClear}></button>
                        </div>

                        <div className="modal-body p-3 p-md-4">
                            <div className="row g-3">

                                <div className="col-12">
                                    <h6 className="fw-bold text-primary">
                                        <i className="fas fa-info-circle me-2"></i> Basic Information
                                    </h6>
                                    <hr className="mt-1" />
                                </div>

                                {/* ── Row 1: Location Name | Rack | Row ── */}
                                <div className="col-12 col-md-4">
                                    <label className="form-label fw-semibold">
                                        Location <span className="text-danger">*</span>
                                    </label>

                                    <Typeahead
                                        id="location-typeahead-add"
                                        labelKey={(option) =>
                                            `${option.LocationCode} - ${option.LocationName}`
                                        }
                                        options={locationOptions}
                                        selected={
                                            Location.LocationId
                                                ? locationOptions.filter(
                                                    x => Number(x.LocationId) === Number(Location.LocationId)
                                                )
                                                : []
                                        }
                                        onChange={(selected) => {
                                            const loc = selected[0];

                                            setLocation(prev => ({
                                                ...prev,
                                                LocationId: loc?.LocationId || '',
                                                LocationName: loc?.LocationName || '',
                                                LocationCode: loc?.LocationCode || '',
                                                LocationRFID: loc?.LocationRFID || '',
                                                RackId: '',
                                                Rack: '',
                                                RowId: '',
                                                Row: ''
                                            }));

                                            setSelectedRack([]);
                                            setSelectedRow([]);
                                            setRowOptions([]);
                                        }}
                                        placeholder="Select Location..."
                                        clearButton
                                    />
                                </div>

                                <div className="col-12 col-md-4">
                                    <label className="form-label fw-semibold">
                                        Rack <span className="text-danger">*</span>
                                    </label>
                                    <Typeahead
                                        id="rack-typeahead-add"
                                        labelKey={(option) => `${option.RackCode} - ${option.RackName}`}
                                        options={rackData}
                                        selected={selectedRack}
                                        onChange={handleRackChange}
                                        placeholder="Search Rack..."
                                        clearButton
                                    />
                                </div>

                                <div className="col-12 col-md-4">
                                    <label className="form-label fw-semibold">
                                        Row <span className="text-danger">*</span>
                                    </label>
                                    <Typeahead
                                        id="row-typeahead-add"
                                        labelKey={(option) => `${option.RowCode} - ${option.RowName}`}
                                        options={rowOptions}
                                        selected={selectedRow}
                                        onChange={handleRowChange}
                                        placeholder={Location.RackId ? "Search Row..." : "Select Rack first"}
                                        clearButton
                                        disabled={!Location.RackId}
                                    />
                                </div>

                                {/* ── Row 2: Location Code (editable) | Location RFID (scan-to-add) | Add button ── */}
                                <div className="col-12 col-md-4">
                                    <label className="form-label fw-semibold">
                                        Location Code <span className="text-danger">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        name="LocationCode"
                                        value={Location.LocationCode}
                                        onChange={handleLocationChange}
                                        placeholder="Enter Location Code"
                                    />
                                </div>

                                <div className="col-12 col-md-4">
                                    <label className="form-label fw-semibold">Location RFID</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        name="LocationRFID"
                                        value={Location.LocationRFID}
                                        onChange={handleLocationChange}
                                        onKeyDown={(e) => {
                                            // RFID scanners type the tag then send Enter — auto-add the mapping row
                                            if (e.key === 'Enter') {
                                                e.preventDefault();
                                                handleAddMapping();
                                            }
                                        }}
                                        placeholder="Tap / scan RFID"
                                    />
                                </div>

                                <div className="col-12 col-md-4 d-flex align-items-end">
                                    <button
                                        type="button"
                                        className="btn text-white fw-semibold d-flex align-items-center gap-2  justify-content-center"
                                        onClick={handleAddMapping}
                                        style={{
                                            background: 'linear-gradient(135deg, #007bff, #00b4d8)',
                                            border: 'none', borderRadius: '10px', padding: '9px 18px'
                                        }}
                                    >
                                        <CIcon icon={cilPlus} /> Add
                                    </button>
                                </div>

                                {/* ── Mapping Table ── */}
                                {mappings.length > 0 && (
                                    <div className="col-12 mt-2">
                                        <h6 className="fw-bold text-secondary mb-2">
                                            <i className="fas fa-list me-2"></i> Added Location Mappings
                                        </h6>
                                        <div className="table-responsive">
                                            <table className="table table-bordered table-sm align-middle">
                                                <thead style={{ background: '#f0f4ff' }}>
                                                    <tr>
                                                        <th>#</th>
                                                        <th>Location Name</th>
                                                        <th>Location Code</th>
                                                        <th>Location RFID</th>
                                                        <th>Rack</th>
                                                        <th>Row</th>
                                                        <th>Action</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {mappings.map((m, i) => (
                                                        <tr key={i}>
                                                            <td>{i + 1}</td>
                                                            <td>{m.LocationName}</td>
                                                            <td>{m.LocationCode}</td>
                                                            <td>{m.LocationRFID || '-'}</td>
                                                            <td>{m.RackName}</td>
                                                            <td>{m.RowName}</td>
                                                            <td>
                                                                <button
                                                                    className="btn btn-sm btn-danger d-flex align-items-center justify-content-center"
                                                                    style={{ borderRadius: '50%', width: '30px', height: '30px', padding: 0 }}
                                                                    onClick={() => setMappings(prev => prev.filter((_, idx) => idx !== i))}
                                                                >
                                                                    <CIcon icon={cilTrash} />
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}

                            </div>
                        </div>

                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary d-flex align-items-center gap-2"
                                data-bs-dismiss="modal" onClick={handleClear}
                                style={{ borderRadius: '10px', padding: '9px 18px' }}>
                                <i className="fas fa-times"></i> Cancel
                            </button>
                            <button type="button"
                                className="btn text-white fw-semibold d-flex align-items-center gap-2"
                                onClick={handleSave} disabled={loading}
                                style={{ background: 'linear-gradient(135deg, #00c853, #009624)', border: 'none', borderRadius: '10px', padding: '9px 22px' }}>
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
                                <i className="fas fa-eye me-2"></i> View Link Location Details
                            </h5>
                            <button type="button" className="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                        </div>

                        <div className="modal-body p-3 p-md-4">
                            <div className="row g-3">
                                <div className="col-12 col-md-4">
                                    <label className="form-label text-muted">Location Name</label>
                                    <p className="fw-semibold">{Location.LocationName || '-'}</p>
                                </div>
                                <div className="col-12 col-md-4">
                                    <label className="form-label text-muted">Rack</label>
                                    <p className="fw-semibold">{Location.RackName || '-'}</p>
                                </div>
                                <div className="col-12 col-md-4">
                                    <label className="form-label text-muted">Row</label>
                                    <p className="fw-semibold">{Location.RowName || '-'}</p>
                                </div>
                                <div className="col-12 col-md-4">
                                    <label className="form-label text-muted">Location Code</label>
                                    <p className="fw-semibold">{Location.LocationCode || '-'}</p>
                                </div>
                                <div className="col-12 col-md-4">
                                    <label className="form-label text-muted">Location RFID</label>
                                    <p className="fw-semibold">{Location.LocationRFID || '-'}</p>
                                </div>
                                <div className="col-12 col-md-4">
                                    <label className="form-label text-muted">Created By</label>
                                    <p className="fw-semibold">{Location.CreatedBy || '-'}</p>
                                </div>
                                <div className="col-12 col-md-4">
                                    <label className="form-label text-muted">Created Date</label>
                                    <p className="fw-semibold">{formatDate(Location.CreatedDate) || '-'}</p>
                                </div>
                            </div>
                        </div>

                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" data-bs-dismiss="modal" style={{ borderRadius: '10px' }}>
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
                                <i className="fas fa-edit me-2"></i> Edit Link Location
                            </h5>
                            <button type="button" className="btn-close btn-close-white"
                                data-bs-dismiss="modal" onClick={handleClear}></button>
                        </div>

                        <div className="modal-body p-3 p-md-4">
                            <div className="row g-3">

                                <div className="col-12">
                                    <h6 className="fw-bold text-primary">
                                        <i className="fas fa-info-circle me-2"></i> Basic Information
                                    </h6>
                                    <hr className="mt-1" />
                                </div>

                                {/* ── Row 1: Location Name | Rack | Row ── */}
                                <div className="col-12 col-md-4">
                                    <label className="form-label fw-semibold">
                                        Location Name <span className="text-danger">*</span>
                                    </label>
                                    <Typeahead
                                        id="location-typeahead-edit"
                                        labelKey={(option) =>
                                            `${option.LocationCode} - ${option.LocationName}`
                                        }
                                        options={locationOptions}
                                        selected={
                                            Location.LocationId
                                                ? locationOptions.filter(
                                                    x =>
                                                        Number(x.LocationId) ===
                                                        Number(Location.LocationId)
                                                )
                                                : []
                                        }
                                        onChange={(selected) => {
                                            const loc = selected[0];

                                            setLocation(prev => ({
                                                ...prev,
                                                LocationId: loc?.LocationId || '',
                                                LocationCode: loc?.LocationCode || '',
                                                LocationName: loc?.LocationName || '',
                                                RackId: '',
                                                Rack: '',
                                                RowId: '',
                                                Row: ''
                                            }));

                                            setSelectedRack([]);
                                            setSelectedRow([]);
                                            setRowOptions([]);
                                        }}
                                        placeholder="Select Location..."
                                        clearButton
                                    />
                                </div>

                                <div className="col-12 col-md-4">
                                    <label className="form-label fw-semibold">
                                        Rack <span className="text-danger">*</span>
                                    </label>
                                    <Typeahead
                                        id="rack-typeahead-edit"
                                        labelKey={(option) => `${option.RackCode} - ${option.RackName}`}
                                        options={rackData}
                                        selected={selectedRack}
                                        onChange={handleRackChange}
                                        placeholder="Search Rack..."
                                        clearButton
                                    />
                                </div>

                                <div className="col-12 col-md-4">
                                    <label className="form-label fw-semibold">
                                        Row <span className="text-danger">*</span>
                                    </label>
                                    <Typeahead
                                        id="row-typeahead-edit"
                                        labelKey={(option) => `${option.RowCode} - ${option.RowName}`}
                                        options={rowOptions}
                                        selected={selectedRow}
                                        onChange={handleRowChange}
                                        placeholder={Location.RackId ? "Search Row..." : "Select Rack first"}
                                        clearButton
                                        disabled={!Location.RackId}
                                    />
                                </div>

                                {/* ── Row 2: Location Code (now editable) | Location RFID ── */}
                                <div className="col-12 col-md-4">
                                    <label className="form-label fw-semibold">
                                        Location Code <span className="text-danger">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        name="LocationCode"
                                        value={Location.LocationCode}
                                        onChange={handleLocationChange}
                                        placeholder="Enter Location Code"
                                    />
                                </div>

                                <div className="col-12 col-md-4">
                                    <label className="form-label fw-semibold">Location RFID</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        name="LocationRFID"
                                        value={Location.LocationRFID}
                                        onChange={handleLocationChange}
                                        placeholder="Enter Location RFID"
                                    />
                                </div>

                            </div>
                        </div>

                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary d-flex align-items-center gap-2"
                                data-bs-dismiss="modal" onClick={handleClear}
                                style={{ borderRadius: '10px', padding: '9px 18px' }}>
                                <i className="fas fa-times"></i> Cancel
                            </button>
                            <button type="button"
                                className="btn text-white fw-semibold d-flex align-items-center gap-2"
                                onClick={handleUpdate} disabled={loading}
                                style={{ background: 'linear-gradient(135deg, #00c853, #009624)', border: 'none', borderRadius: '10px', padding: '9px 22px' }}>
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

export default LocationMaster;