// import React, { useState, useEffect, useMemo } from "react";
// import PropTypes from 'prop-types';
// import { AgGridReact } from 'ag-grid-react';
// import 'ag-grid-community/styles/ag-grid.css';
// import 'ag-grid-community/styles/ag-theme-quartz.css';
// import {
//   CButton,
//   CCardBody,
//   CCard,
//   CFormSelect,
//   CCol,
//   CRow,
//   CModal,
//   CModalBody,
//   CModalHeader,
//   CTable,
//   CTableBody,
//   CTableDataCell,
//   CTableHead,
//   CTableHeaderCell,
//   CTableRow,
//   CFormSwitch,
//   CPaginationItem,
//   CPagination,
//   CFormInput
// } from '@coreui/react';
// import { cilClipboard, cilCheckAlt, cilSearch } from '@coreui/icons';
// import CIcon from '@coreui/icons-react';
// import swal from 'sweetalert';
// import axios from 'axios';
// import { API_URL } from 'src/config';

// const Userauth = ({ auth }) => {
//   const [editvisible, setEditvisible] = useState(false);
//   const [UserRolePermissonData, SetUserRolePermissonData] = useState([]);
//   const [ReportGridData, SetReportGridData] = useState([]);
//   const [RoleDropDownData, SetRoleDropDownData] = useState([]);
//   const [PageMappingDataRoleid, SetPageMappingDataRoleid] = useState(null);
//   const [modifiedScreenIds, setModifiedScreenIds] = useState([]);
//   const [itemsPerPage, setItemsPerPage] = useState(100);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [totalPages, setTotalPages] = useState(0);
//   const [currentItems, setCurrentItems] = useState([]);
//   const [searchQuery, setSearchQuery] = useState('');

//   const colmun = [
//     { field: "employeecode" },
//     { field: "employeename" },
//     { field: "ScreeenName", headerName: 'Screen Name' },
//     { field: "userrole", headerName: 'Role Type' },
//     {
//       field: "status",
//       cellRenderer: (params) => (
//         <p className='text-success fw-normal bg-brown'>{params.value === 'a' ? 'Access' : "In Access"}</p>
//       )
//     },
//   ];

//   const defaultColDef = useMemo(() => ({
//     filter: 'agTextColumnFilter',
//     floatingFilter: true,
//   }), []);

//   const handleMappingPage = async () => {
//     if (PageMappingDataRoleid === null) {
//       swal({ text: 'Please Select One Role', icon: 'warning' });
//       return;
//     }

//     if (UserRolePermissonData.length === 0) {
//       swal({ text: 'No Permissions to Save', icon: 'warning' });
//       return;
//     }

//     try {
//       const alldata = {
//         roleid: PageMappingDataRoleid,
//         pageid: modifiedScreenIds,
//         createby: auth.empid,
//         branchid: auth.branchid,
//         mood: 'I'
//       };

//       const response = await axios.post(`${API_URL}/RoleMapping`, alldata);
//       if (response.status === 200) {
//         swal({ text: 'Permissions Updated Successfully', icon: 'success' });
//       }
//     } catch (error) {
//       console.log(error);
//     }
//   };

//   // const handleEnable = (e, Screenid) => {
//   //   const updatedStatus = e.target.checked ? 'a' : 'i';

//   //   SetUserRolePermissonData(prevData => {
//   //     const updatedData = prevData.map(item =>
//   //       item.Screenid === Screenid ? { ...item, status: updatedStatus } : item
//   //     );

//   //     setModifiedScreenIds(prevModified => {
//   //       const existingIndex = prevModified.findIndex(item => item.Screenid === Screenid);
//   //       if (existingIndex > -1) {
//   //         if (updatedStatus !== prevModified[existingIndex].status) {
//   //           return [
//   //             ...prevModified.slice(0, existingIndex),
//   //             { Screenid, status: updatedStatus },
//   //             ...prevModified.slice(existingIndex + 1),
//   //           ];
//   //         } else {
//   //           return prevModified;
//   //         }
//   //       } else {
//   //         return [...prevModified, { Screenid, status: updatedStatus }];
//   //       }
//   //     });

//   //     return updatedData;
//   //   });
//   // };

//   const handleEnable = (e, Screenid) => {
//     const updatedStatus = e.target.checked ? 'a' : 'i';

//     // Update UserRolePermissonData
//     SetUserRolePermissonData(prevData => {
//       const updatedData = prevData.map(item =>
//         item.Screenid === Screenid ? { ...item, status: updatedStatus } : item
//       );

//       // Update modifiedScreenIds as needed
//       setModifiedScreenIds(prevModified => {
//         const existingIndex = prevModified.findIndex(item => item.Screenid === Screenid);
//         if (existingIndex > -1) {
//           if (updatedStatus !== prevModified[existingIndex].status) {
//             return [
//               ...prevModified.slice(0, existingIndex),
//               { Screenid, status: updatedStatus },
//               ...prevModified.slice(existingIndex + 1),
//             ];
//           } else {
//             return prevModified;
//           }
//         } else {
//           return [...prevModified, { Screenid, status: updatedStatus }];
//         }
//       });

//       return updatedData;
//     });
//   };

//   // Add useEffect to manage currentItems based on currentPage
//   useEffect(() => {
//     const startIndex = (currentPage - 1) * itemsPerPage;
//     const endIndex = startIndex + itemsPerPage;
//     setCurrentItems(UserRolePermissonData.slice(startIndex, endIndex));
//   }, [UserRolePermissonData, currentPage, itemsPerPage]);

//   const fetchRoleDropdown = async () => {
//     try {
//       const alldata = { id: '', userrole: '', createdby: '', updateby: '', branchid: auth.branchid, mode: 'S' };
//       const response = await axios.post(`${API_URL}/UserroleMaster`, alldata);
//       if (response.status === 200) {
//         SetRoleDropDownData(response.data);
//       }
//     } catch (err) {
//       console.log(err);
//     }
//   };

//   const reportSearch = async () => {
//     if (PageMappingDataRoleid === null) {
//       swal({ text: 'Please Select One Role', icon: 'warning' });
//       return;
//     }

//     try {
//       const alldata = { pageid: '', roleid: PageMappingDataRoleid, createby: '', mood: 'R', branchid: auth.branchid };
//       const response = await axios.post(`${API_URL}/RoleMapping`, alldata);
//       if (response.status === 200) {
//         SetReportGridData(response.data);
//       }
//     } catch (error) {
//       console.log(error);
//     }
//   };

//   useEffect(() => {
//     fetchRoleDropdown();
//   }, []);

//   useEffect(() => {
//     const totalItems = UserRolePermissonData.length;
//     setTotalPages(Math.ceil(totalItems / itemsPerPage));
//     paginate(1); // Reset to the first page whenever data changes
//   }, [UserRolePermissonData, itemsPerPage]);

//   const paginate = (pageNumber) => {
//     if (pageNumber > totalPages || pageNumber < 1) return;
//     setCurrentPage(pageNumber);
//     const startIndex = (pageNumber - 1) * itemsPerPage;
//     const endIndex = startIndex + itemsPerPage;
//     setCurrentItems(UserRolePermissonData.slice(startIndex, endIndex));
//   };

//   const getPageItems = () => {
//     const items = [];
//     const pageRange = 2;
//     const startPage = Math.max(2, currentPage - pageRange);
//     const endPage = Math.min(totalPages - 1, currentPage + pageRange);

//     items.push(
//       <CPaginationItem key={1} active={currentPage === 1} onClick={() => paginate(1)}>
//         1
//       </CPaginationItem>
//     );

//     if (startPage > 2) {
//       items.push(<CPaginationItem key="start-ellipsis" disabled>...</CPaginationItem>);
//     }

//     for (let i = startPage; i <= endPage; i++) {
//       items.push(
//         <CPaginationItem key={i} active={i === currentPage} onClick={() => paginate(i)}>
//           {i}
//         </CPaginationItem>
//       );
//     }

//     if (endPage < totalPages - 1) {
//       items.push(<CPaginationItem key="end-ellipsis" disabled>...</CPaginationItem>);
//     }

//     items.push(
//       <CPaginationItem key={totalPages} active={currentPage === totalPages} onClick={() => paginate(totalPages)}>
//         {totalPages}
//       </CPaginationItem>
//     );

//     return items;
//   };

//   const handleSearch = (event) => {
//     const query = event.target.value.toLowerCase();
//     setSearchQuery(query);
//     setCurrentPage(1); // Reset to first page on new search

//     const filteredData = UserRolePermissonData.filter((staffMember) =>
//       Object.values(staffMember).some((value) =>
//         value !== null && value !== undefined && value.toString().toLowerCase().includes(query)
//       )
//     );

//     setCurrentItems(filteredData);
//   };


//   // const handleRoleSelect = async (e) => {
//   //   const roleid = e;
//   //   SetPageMappingDataRoleid(roleid);

//   //   if (roleid === '') {
//   //     SetUserRolePermissonData([]);
//   //     return;
//   //   }

//   //   try {
//   //     const alldata = { pageid: '', roleid, createby: '', mood: 'SD', branchid: auth.branchid };
//   //     const response = await axios.post(`${API_URL}/RoleMapping`, alldata);
//   //     if (response.status === 200) {
//   //       SetUserRolePermissonData(response.data);
//   //       console.log("Fetched permissions data:", response.data); // Debugging
//   //     }
//   //   } catch (error) {
//   //     console.log(error);
//   //   }
//   // };


//   const handleRoleSelect = async (e) => {
//     const roleid = e;
//     SetPageMappingDataRoleid(roleid);

//     if (roleid === '') {
//       SetUserRolePermissonData([]);
//       return;
//     }

//     try {
//       const alldata = { pageid: '', roleid, createby: '', mood: 'SD', branchid: auth.branchid };
//       const response = await axios.post(`${API_URL}/RoleMapping`, alldata);
//       if (response.status === 200) {
//         SetUserRolePermissonData(response.data);
//         setCurrentPage(1); // Reset to the first page only when changing roles
//       }
//     } catch (error) {
//       console.log(error);
//     }
//   };

//   return (
//     <>
//       <CModal
//         size="xl"
//         alignment="center"
//         visible={editvisible}
//         onClose={() => setEditvisible(false)}
//         aria-labelledby="VerticallyCenteredExample"
//       >
//         <CModalHeader> User Privilege Details</CModalHeader>
//         <CModalBody>
//           <CCard className='m-3'>
//             <CCardBody>
//               <CRow className='my-3 d-flex justify-content-center'>
//                 <CCol md={4}>
//                   <CFormSelect
//                     className='mt-3'
//                     aria-label="Default select example"
//                     options={[
//                       { label: 'Please Select Role', value: '' },
//                       ...RoleDropDownData.map(option => ({ label: option.userrole, value: option.roleid }))
//                     ]}
//                     onChange={(e) => handleRoleSelect(e.target.value)}
//                   />
//                 </CCol>
//                 <CCol md={4}>
//                   <CButton className="mt-3" type="clear" variant='outline' color="primary" onClick={reportSearch}>
//                     <CIcon icon={cilClipboard} /> VIEW
//                   </CButton>
//                 </CCol>
//               </CRow>
//             </CCardBody>
//           </CCard>

//           <div className="ag-theme-quartz" style={{ height: 500 }}>
//             <AgGridReact
//               rowData={ReportGridData}
//               columnDefs={colmun}
//               defaultColDef={defaultColDef}
//               rowSelection="multiple"
//               pagination={true}
//               paginationPageSize={10}
//             />
//           </div>
//         </CModalBody>
//       </CModal>

//       <div>
//         <CCard className="mb-3">
//           <CCardBody>
//             <CRow className='mb-3 mt-3 d-flex justify-content-center'>
//               <CCol md={4}>
//                 <CFormSelect
//                   aria-label="Default select example"
//                   options={[
//                     { label: 'Please Select Role', value: '' },
//                     ...RoleDropDownData.map(option => ({ label: option.userrole, value: option.roleid }))
//                   ]}
//                   onChange={(e) => handleRoleSelect(e.target.value)}
//                 />
//               </CCol>
//               <CCol md={4}>
//                 <CButton type="submit" variant='outline' color="success" onClick={handleMappingPage}>
//                   <CIcon icon={cilCheckAlt} /> SAVE
//                 </CButton>
//                 <CButton className="mx-2" type="clear" variant='outline' color="primary" onClick={() => setEditvisible(true)}>
//                   <CIcon icon={cilClipboard} /> VIEW
//                 </CButton>
//               </CCol>
//             </CRow>
//           </CCardBody>
//         </CCard>
//         <CCard>
//           <CCardBody>
//             <CCol sm={3}>
//               <div className="position-relative">
//                 <CFormInput
//                   type="search"
//                   className="mb-3 border shadow-sm "
//                   placeholder="Search"
//                   value={searchQuery}
//                   onChange={handleSearch}
//                   style={{ paddingLeft: '40px' }} // Adjust input padding to accommodate the icon
//                 />
//                 <CIcon className="position-absolute top-50 start-0 translate-middle-y text-muted ms-1" icon={cilSearch} size='xxl' style={{ left: '10px' }} />
//               </div>
//             </CCol>
//             <CTable align="middle" className="mb-3 border-bottom" hover responsive>
//               <CTableHead color="dark">
//                 <CTableRow>
//                   <CTableHeaderCell scope="col">S.no</CTableHeaderCell>
//                   <CTableHeaderCell scope="col">SCREEN ID</CTableHeaderCell>
//                   <CTableHeaderCell scope="col">NAME</CTableHeaderCell>
//                   <CTableHeaderCell scope="col">Permission</CTableHeaderCell>
//                 </CTableRow>
//               </CTableHead>
//               <CTableBody>
//                 {currentItems.length > 0 ? (
//                   currentItems.map((d, index) => (
//                     <CTableRow key={d.Screenid || index}>
//                       <CTableDataCell>{(currentPage - 1) * itemsPerPage + index + 1}</CTableDataCell>
//                       <CTableDataCell>{d.Screenid}</CTableDataCell>
//                       <CTableDataCell>{d.ScreeenName}</CTableDataCell>
//                       <CTableDataCell>
//                         <CFormSwitch id={`checkbox-${index}`} checked={d.status === 'a'}
//                           onChange={(e) => handleEnable(e, d.Screenid)} />
//                       </CTableDataCell>
//                     </CTableRow>
//                   ))
//                 ) : (
//                   <CTableRow>
//                     <CTableDataCell colSpan={4}>No Data Found</CTableDataCell>
//                   </CTableRow>
//                 )}
//               </CTableBody>
//             </CTable>

//             {/* Pagination */}
//             {totalPages > 0 && (
//               <div>
//                 <div className="pagination-info">
//                   Showing page {currentPage} of {totalPages} ({UserRolePermissonData.length} items)
//                 </div>
//                 <CPagination aria-label="Page navigation example" align="end">
//                   <CPaginationItem
//                     aria-label="Previous"
//                     disabled={currentPage === 1}
//                     onClick={() => paginate(currentPage - 1)}
//                   >
//                     <span >&laquo;</span>
//                   </CPaginationItem>
//                   {getPageItems()}
//                   <CPaginationItem
//                     aria-label="Next"
//                     disabled={currentPage === totalPages}
//                     onClick={() => paginate(currentPage + 1)}
//                   >
//                     <span >&raquo;</span>
//                   </CPaginationItem>
//                 </CPagination>
//               </div>
//             )}
//           </CCardBody>
//         </CCard>
//       </div>
//     </>
//   );
// };

// Userauth.propTypes = {
//   auth: PropTypes.object.isRequired,
// };

// export default Userauth;
import React, { useState, useEffect, useMemo } from "react";
import PropTypes from "prop-types";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import {
  CButton,
  CCardBody,
  CCard,
  CCardHeader,
  CFormSelect,
  CCol,
  CRow,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
  CFormSwitch,
  CModal,
  CModalBody,
  CModalHeader,
  CFormInput,
} from "@coreui/react";
import CIcon from "@coreui/icons-react";
import { cilClipboard, cilCheckAlt } from "@coreui/icons";
import swal from "sweetalert";
import axios from "axios";
import { getConfig } from 'src/config';
import { useLocation } from "react-router-dom";
import { FaUserShield } from "react-icons/fa";
import secureLocalStorage from 'react-secure-storage';

const Userauth = ({ auth }) => {
  const API_URL = getConfig().REACT_APP_API_URL;
  const [editvisible, setEditvisible] = useState(false);
  const [UserRolePermissionData, setUserRolePermissionData] = useState([]);
  const [RoleDropDownData, setRoleDropDownData] = useState([]);
  const [ReportGridData, setReportGridData] = useState([]);
  const [PageMappingDataRoleid, setPageMappingDataRoleid] = useState(null);
  const [modifiedScreenIds, setModifiedScreenIds] = useState([]);
  const [loading, setLoading] = useState(false); // Loading state for API calls
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  
  let pageData = location.state?.pageData;
  if (!pageData) {
    const storedData = secureLocalStorage.getItem('pageData');
    pageData = storedData || {};
  }

  const defaultColDef = useMemo(() => ({ filter: "agTextColumnFilter" }), []);

  const colmun = [
    { field: "Screenid", headerName: "Screen ID", sortable: true },
    { field: "ScreeenName", headerName: "Screen Name", sortable: true },
    {
      field: "screenAccess", headerName: "screen Access", sortable: true, renderCell: (params) => {
        return params.value === 'a' ? 'Access Granted' : 'No Access'; // Customizing display
      }
    },
    {
      field: "AddStatus", headerName: "Add Status", sortable: true, renderCell: (params) => {
        return params.value === 'a' ? 'Access Granted' : 'No Access'; // Customizing display
      }
    },
    {
      field: "EditStatus", headerName: "Edit Status", sortable: true, renderCell: (params) => {
        return params.value === 'a' ? 'Access Granted' : 'No Access'; // Customizing display
      }
    },
    // {
    //   field: "ViewStatus", headerName: "View Status", sortable: true, renderCell: (params) => {
    //     return params.value === 'i' ? 'Access Granted' : 'No Access'; // Customizing display
    //   }
    // },
    {
      field: "DeleteStatus", headerName: "Delete Status", sortable: true, renderCell: (params) => {
        return params.value === 'a' ? 'Access Granted' : 'No Access'; // Customizing display
      }
    },
    {
      field: "ApprovalStatus", headerName: "ApprovalStatus", sortable: true, renderCell: (params) => {
        return params.value === '' ? 'Access Granted' : 'No Access'; // Customizing display
      }
    },
  ];

  // Fetch role data
  const fetchRoleDropdown = async () => {
    setLoading(true); // Start loading
    try {
      const response = await axios.post(`${API_URL}/UserroleMaster`, {
        id: "",
        userrole: "",
        createdby: "",
        updateby: "",
        branchid: auth.branchid,
        mode: "S",
      });
      if (response.status === 200) {
        // console.log(response.data)
        setRoleDropDownData(response.data);
      }
    } catch (err) {
      swal({ text: "Error fetching role data", icon: "error" });
      console.error(err);
    } finally {
      setLoading(false); // End loading
    }
  };

  const fetchRolePermissions = async (roleid) => {
    setLoading(true); // Start loading
    // console.log(roleid)
    try {
      const response = await axios.post(`${API_URL}/RoleMapping`, {
        pageid: "",
        roleid: roleid,
        createby: "",
        mood: "SD",
        branchid: auth.branchid,
      });
      if (response.status === 200) {
        setUserRolePermissionData(response.data);
        setReportGridData(response.data);
        // console.log(response.data)
      }
    } catch (err) {
      swal({ text: `Error fetching role permissions: ${err.message}`, icon: "error" });
      console.error('Error fetching role permissions', err.response ? err.response.data : err);
    } finally {
      setLoading(false); // End loading
    }
  };

  // Save mapping changes
  const handleMappingPage = async () => {
    if (!PageMappingDataRoleid) {
      swal({ text: "Please Select One Role", icon: "warning" });
      return;
    }

    setLoading(true); // Start loading
    try {
      const alldata = {
        roleid: PageMappingDataRoleid,
        pageid: modifiedScreenIds,
        createby: auth.empid,
        branchid: auth.branchid,
        mood: "I",
      }


      const response = await axios.post(`${API_URL}/RoleMapping`, alldata);

      if (response.status === 200) {
        swal({ text: "Permissions Updated Successfully", icon: "success" });
        fetchRolePermissions(PageMappingDataRoleid); // Refresh permissions
        fetchRolePermissions(PageMappingDataRoleid);
        setModifiedScreenIds([])
      }


    } catch (err) {
      swal({ text: "Error saving permissions", icon: "error" });
      console.error(err);
    } finally {
      setLoading(false); // End loading
    }
  };

  const handlePermissionToggle = (e, Screenid, permissionType) => {
    const updatedStatus = e.target.checked ? "a" : "i";

    // If the toggled permission is 'screenAccess' and it's being set to inactive
    if (permissionType === "screenAccess" && updatedStatus === "i") {
      // Set all permissions to inactive when 'ScreenAccess' is deactivated
      setUserRolePermissionData((prevData) =>
        prevData.map((item) =>
          item.Screenid === Screenid
            ? {
              ...item,
              screenAccess: updatedStatus,
              AddStatus: "i",
              ViewStatus: "i",
              EditStatus: "i",
              DeleteStatus: "i",
              ApprovalStatus: "i",
            }
            : item
        )
      );

      setModifiedScreenIds((prev) => {
        const originalScreenData = UserRolePermissionData.find((item) => item.Screenid === Screenid);

        return [
          ...prev,
          {
            Screenid,
            ...originalScreenData, // Store the previous status
            [permissionType]: updatedStatus,
            AddStatus: "i",
            ViewStatus: "i",
            EditStatus: "i",
            DeleteStatus: "i",
            ApprovalStatus: "i",
          },
        ];

      });
    } else {
      // If it's any permission toggle other than 'screenAccess'
      setUserRolePermissionData((prevData) =>
        prevData.map((item) =>
          item.Screenid === Screenid
            ? { ...item, [permissionType]: updatedStatus }
            : item
        )
      );
    }

    // Update the modifiedScreenIds array (if needed)
    //   setModifiedScreenIds((prev) => {
    //     const existingIndex = prev.findIndex((item) => item.Screenid === Screenid);
    //     if (existingIndex > -1) {
    //       const updatedPermissions = {
    //         ...prev[existingIndex],
    //         [permissionType]: updatedStatus,
    //       };
    //       return [...prev.slice(0, existingIndex), updatedPermissions, ...prev.slice(existingIndex + 1)];
    //     }
    //     return [...prev, { Screenid, [permissionType]: updatedStatus }];
    //   });
    // };

    setModifiedScreenIds((prev) => {
      const existingIndex = prev.findIndex((item) => item.Screenid === Screenid);

      if (existingIndex > -1) {
        // Update the existing screen's permissions
        const updatedPermissions = {
          ...prev[existingIndex],
          [permissionType]: updatedStatus,
        };
        // console.log('====================================');
        // console.log('updatedPermissions', updatedPermissions);
        // console.log('====================================');
        return [...prev.slice(0, existingIndex), updatedPermissions, ...prev.slice(existingIndex + 1)];
      } else {
        // Get the original screen data before modification
        const originalScreenData = UserRolePermissionData.find((item) => item.Screenid === Screenid);
        // console.log("originalScreenData", originalScreenData);

        return [
          ...prev,
          {
            Screenid,
            ...originalScreenData, // Store the previous status
            [permissionType]: updatedStatus,
            // AddStatus: "i",
            // ViewStatus: "i",
            // EditStatus: "i",
            // DeleteStatus: "i",
            // ApprovalStatus: "i",
            // Update the modified status
          },
        ];
      }
    });
  };
  // console.log("ModifiedScreenIds", modifiedScreenIds);

  const handleRoleSelect = (roleid) => {
    if (roleid === "Please Select Role") {
      setUserRolePermissionData([]);
    } else {
      setPageMappingDataRoleid(roleid);
      fetchRolePermissions(roleid);
    }
  };

  useEffect(() => {
    fetchRoleDropdown();
  }, []);

  // console.log("UserRolePermissionData", UserRolePermissionData);
  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const filteredData = UserRolePermissionData.filter((d) =>
    d.ScreeenName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>

      {/* Modal for User Privilege Details */}
      <CModal
        size="xl"
        alignment="center"
        visible={editvisible}
        onClose={() => setEditvisible(false)}
      >
        <CModalHeader>User Privilege Details</CModalHeader>
        <CModalBody>
          <CCard className="m-3">
            <CCardBody>
              <CRow className="my-3 d-flex justify-content-center">
                <CCol md={4}>
                  <CFormSelect
                    className="mt-3"
                    aria-label="Default select example"
                    options={[
                      "Please Select Role",
                      ...RoleDropDownData.map((option) => ({
                        label: option.userrole,
                        value: option.roleid,
                      })),
                    ]}
                    onChange={(e) => handleRoleSelect(e.target.value)}
                  />
                </CCol>
              </CRow>
            </CCardBody>
          </CCard>

          <div className="ag-theme-quartz" style={{ height: 500 }}>
            <AgGridReact
              rowData={ReportGridData}
              columnDefs={colmun}
              defaultColDef={defaultColDef}
              rowSelection="multiple"
              pagination
              paginationPageSize={10}
            />
          </div>
        </CModalBody>
      </CModal>

      {/* Main Card */}
      <CCard className="mt-5">
        <CCardHeader className="p-2 pro-header"   style={{ background: '#106FB5' }}>
          <div className="d-flex justify-content-center text-white">
            <FaUserShield className="fs-3 me-1" /> <h3 className="text-white">User Previlege</h3>
          </div>
        </CCardHeader>
        <CCardBody>
          <CRow className="mb-4 mt-3 d-flex justify-content-start">
            <CCol md={4}>
              <CFormSelect
                aria-label="Default select example"
                options={[
                  "Please Select Role",
                  ...RoleDropDownData.map((option) => ({
                    label: option.userrole,
                    value: option.roleid,
                  })),
                ]}
                onChange={(e) => handleRoleSelect(e.target.value)}
              />
            </CCol>
            <CCol md={4}>
              {
                (pageData.addstatus === null || pageData.addstatus === 'i') && auth.UserStatus === 'A'
                  ? '' :
                  <CButton
                    type="submit"
                    variant="outline"
                    color="success"
                    className="btn-hover-effect"
                    onClick={handleMappingPage}
                    disabled={loading} // Disable button while loading
                  >
                    {loading ? "Saving..." : <><CIcon icon={cilCheckAlt} /> Save</>}
                  </CButton>
              }
              <CButton
                className="mx-2 btn-hover-effect"
                type="submit"
                variant="outline"
                color="primary"
                onClick={() => setEditvisible(true)}
              >
                <CIcon icon={cilClipboard} /> View
              </CButton>
            </CCol>
            <CCol md={4}>
              <div className="position-relative bordred">
                <CFormInput
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="form-control ps-5"
                  aria-label="Search screen permissions"
                />
                <i className="bi bi-search position-absolute top-50 start-0 translate-middle-y ps-2 fs-5"></i>
              </div>
            </CCol>
          </CRow>
          
          <div
            style={{
              width: "100%",
              maxHeight: "500px",
              overflowY: "auto",
            }}
          >
            <CTable align="middle" className="mb-3 border-bottom" hover responsive>
             
              <CTableHead color="dark">
                <CTableRow>
                  <CTableHeaderCell scope="col" className="text-dark" style={{ backgroundColor:'#524d4da4' }}>S.No</CTableHeaderCell>
                  <CTableHeaderCell scope="col" className="text-dark" style={{ backgroundColor:'#524d4da4' }}>Screen Name</CTableHeaderCell>
                  <CTableHeaderCell scope="col"  className="text-dark" style={{ backgroundColor:'#524d4da4' }}>Screen Access</CTableHeaderCell>
                  <CTableHeaderCell scope="col" className="text-dark" style={{ backgroundColor:'#524d4da4' }}>Add</CTableHeaderCell>
                  <CTableHeaderCell scope="col" className="text-dark" style={{ backgroundColor:'#524d4da4' }}>Edit</CTableHeaderCell>
                  <CTableHeaderCell scope="col" className="text-dark" style={{ backgroundColor:'#524d4da4' }}>Delete</CTableHeaderCell>
                   <CTableHeaderCell scope="col" className="text-dark" style={{ backgroundColor:'#524d4da4' }}>Approval</CTableHeaderCell>
                </CTableRow>
              </CTableHead>

              <CTableBody>
                {filteredData.length > 0 ? (
                  filteredData.map((d, index) => (
                    <CTableRow key={d.Screenid || index}>
                      <CTableDataCell>{index + 1}</CTableDataCell>
                      <CTableDataCell>{d.ScreeenName}</CTableDataCell>
                      <CTableDataCell>
                        <CFormSwitch
                          checked={d.screenAccess === "a"}
                          onChange={(e) =>
                            handlePermissionToggle(e, d.Screenid, "screenAccess")
                          }
                          aria-label={`Toggle screen access for ${d.ScreeenName}`}
                        />
                      </CTableDataCell>
                      {/* Add Switch with conditional disabled state */}
                      <CTableDataCell>
                        <CFormSwitch
                          checked={d.AddStatus === "a"}
                          onChange={(e) =>
                            handlePermissionToggle(e, d.Screenid, "AddStatus")
                          }
                          disabled={d.screenAccess !== "a"}
                          aria-label={`Toggle add permission for ${d.ScreeenName}`}
                        />
                      </CTableDataCell>
                      {/* <CTableDataCell>
                        <CFormSwitch
                          checked={d.ViewStatus === "a"}
                          onChange={(e) =>
                            handlePermissionToggle(e, d.Screenid, "ViewStatus")
                          }
                          disabled={d.screenAccess !== "a"}
                          aria-label={`Toggle view permission for ${d.ScreeenName}`}
                        />
                      </CTableDataCell> */}
                      <CTableDataCell>
                        <CFormSwitch
                          checked={d.EditStatus === "a"}
                          onChange={(e) =>
                            handlePermissionToggle(e, d.Screenid, "EditStatus")
                          }
                          disabled={d.screenAccess !== "a"}
                          aria-label={`Toggle edit permission for ${d.ScreeenName}`}
                        />
                      </CTableDataCell>
                      <CTableDataCell>
                        <CFormSwitch
                          checked={d.DeleteStatus === "a"}
                          onChange={(e) =>
                            handlePermissionToggle(e, d.Screenid, "DeleteStatus")
                          }
                          disabled={d.screenAccess !== "a"}
                          aria-label={`Toggle delete permission for ${d.ScreeenName}`}
                        />
                      </CTableDataCell>
                       <CTableDataCell>
                        <CFormSwitch
                          checked={d.ApprovalStatus === "a"}
                          onChange={(e) =>
                            handlePermissionToggle(e, d.Screenid, "ApprovalStatus")
                          }
                          disabled={d.screenAccess !== "a"}
                          aria-label={`Toggle Approval permission for ${d.ScreeenName}`}
                        />
                      </CTableDataCell>

                    </CTableRow>
                  ))
                ) : (
                  <CTableRow>
                    <CTableDataCell colSpan={5}>No Data Found</CTableDataCell>
                  </CTableRow>
                )}
              </CTableBody>
              
            </CTable>

          </div>
        </CCardBody>
      </CCard>
    </>
  );
};

Userauth.propTypes = {
  auth: PropTypes.object.isRequired,
};

export default Userauth;