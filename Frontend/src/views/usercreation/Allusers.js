import React, { useMemo, useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types'; // Import PropTypes
import { AgGridReact } from 'ag-grid-react';
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import 'ag-grid-community/styles/ag-theme-quartz.css';
import CIcon from '@coreui/icons-react';
import { useNavigate } from "react-router-dom";
import { cilCloudDownload, cilPencil, cilPeople, cilPlus, cilSync, cilUser, cilX, cilXCircle } from '@coreui/icons';
import DatePicker from "react-multi-date-picker"
import InputIcon from "react-multi-date-picker/components/input_icon"
import transition from "react-element-popper/animations/transition"
import logo from 'src/assets/images/Base64/Apple_base64'; // Can also be base64 string
import { utils } from 'react-modern-calendar-datepicker'; // add this
import { CBadge, CButton, CCard, CCardBody, CCardHeader, CCol, CFormInput, CFormLabel, CFormSelect, CModal, CModalBody, CModalFooter, CModalHeader, CModalTitle, CRow, CTooltip } from '@coreui/react';
import axios from 'axios';
import { API_URL } from 'src/config';
import swal from 'sweetalert';
import { RotatingLines } from 'react-loader-spinner';
import jsPDF from 'jspdf'
import 'jspdf-autotable';
import { cilUserPlus, cilDelete, cilCalculator } from "@coreui/icons";
import { PiMicrosoftExcelLogo } from "react-icons/pi";
import { GrDocumentPdf } from "react-icons/gr";
import { useLocation } from "react-router-dom";
import { Typeahead } from 'react-bootstrap-typeahead';
import { getConfig } from 'src/config';
import "react-bootstrap-typeahead/css/Typeahead.css";
import { FaEdit, FaUsers } from 'react-icons/fa';
import { right } from '@popperjs/core';
import ExcelJS from "exceljs";
import autoTable from 'jspdf-autotable';
import { saveAs } from "file-saver";
import secureLocalStorage from 'react-secure-storage';
const Allusers = ({ auth, ipAddress }) => {

  const [editvisible, setEditvisible] = useState(false)

  const [deletevisible, setDeletevisible] = useState(false)

  const [Uploadvisible, setUploadvisible] = useState(false)
  const [Editid, SetEditid] = useState(null)
  const [BranchDropDown, SetBranchDropDown] = useState([])

  //pdf
  const handlepdf = async (selectedDate) => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 0));

    const filteredData = gridRef.current.api.getModel().rowsToDisplay.map(rowNode => rowNode.data);

    const doc = new jsPDF({ orientation: "portrait", format: 'a4' });
    const title = 'All User';

    // ✅ Format selectedDate properly
    let reportDate;
    try {
      const rawDate = selectedDate?.$d || selectedDate;
      const parsedDate = new Date(rawDate);
      if (isNaN(parsedDate)) throw new Error("Invalid date");
      reportDate = parsedDate.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      reportDate = new Date().toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    }
    const imgData = logo;

    // ✅ Header columns
    const headers = [
      'Emp ID', 'Emp Name', 'Email-ID', 'DOJ', 'Role', 'Department', 'Status'
    ];

    // Helper function to format dates consistently
    const formatDate = (dateString) => {
      if (!dateString) return "-";
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString || "-";
      return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    };

    // ✅ Match field names from API / grid with proper date formatting
    const bodyData = filteredData.map(item => [
      item.employeecode || "-",
      item.employeename || "-",
      item.email || "-",
      formatDate(item.DateofJoining),  // ✅ Fixed: Proper date format, no slicing
      item.userrole || "-",
      item.departmentname || "-",
      item.UserStatus || "-",
    ]);

    if (bodyData.length > 0) {
      autoTable(doc, {
        head: [headers],
        body: bodyData,
        margin: { top: 60, right: 15, left: 10, bottom: 20 },  // ✅ Increased top margin to prevent overlap

        // ✅ Keep your original styles but add overflow handling
        styles: {
          halign: "center",
          valign: "middle",
          fontSize: 10,
          font: "times",
          cellPadding: 4,  // ✅ Slightly increased padding
          textColor: [0, 0, 0],
          lineColor: [0, 0, 0],
          lineWidth: 0.2,
          overflow: 'linebreak',  // ✅ Prevents text slicing
        },

        // ✅ Keep your original header styles
        headStyles: {
          fillColor: [0, 0, 0, 0.9],
          textColor: [255, 255, 255],
          fontSize: 11,
          halign: 'center',
          fontStyle: 'bold',
        },

        didDrawPage: (data) => {
          const pageWidth = doc.internal.pageSize.width;
          const pageHeight = doc.internal.pageSize.height;

          // ✅ Logo (same position)
          doc.addImage(imgData, 'PNG', 10, 5, 30, 12);

          // ✅ Title (moved down slightly to prevent overlap)
          doc.setFontSize(20);
          doc.setFont("times", "bold");
          doc.text(`${title} - ${reportDate}`, pageWidth / 2, 28, { align: 'center' });  // ✅ Moved down from 22 to 28

          // ✅ Page Number (same)
          doc.setFontSize(8);
          doc.text(`Page ${doc.internal.getCurrentPageInfo().pageNumber}`, pageWidth - 10, 10, { align: 'right' });

          // ✅ Footer (same style)
          doc.setFontSize(8);

          const footerText = `Printed By: ${auth.employeename} | Printed On: ${new Date().toLocaleDateString()} | Time: ${new Date().toLocaleTimeString()}`;
          const footerNote = `Note: This document has been generated electronically and is valid without signature.`;

          // both lines centered
          doc.text(footerText, pageWidth / 2, pageHeight - 15, { align: 'center' });
          doc.text(footerNote, pageWidth / 2, pageHeight - 8, { align: 'center' });

        }
      });

      doc.save("All User.pdf");
    } else {
      Swal.fire("No data available to export", "", "warning");
    }
    setLoading(false);
  };
  //end pdf

  const [GridData, SetGridData] = useState([])
  const location = useLocation();
  let pageData = location.state?.pageData;
  if (!pageData) {
    // Fallback to local storage if available
    const storedData = secureLocalStorage.getItem('pageData');
    pageData = storedData || {};
  }

  console.log("Auth", auth);

  const [UpdateUserregister, SetUpdateUserregister] = useState({
    id: null,
    employeecode: "",
    employeename: "",
    email: "",
    dateofjoin: '',
    UserStatus: null,
    userrole: 0,
    department: 0,
    departmentname: '',
    branchName: ''

  })

  const colmun = [
    {
      field: "employeecode", headerClass: 'agheader',
      headerName: 'Employee ID'
    },
    {
      field: "employeename", headerClass: 'agheader',
      headerName: 'Employee Name'
    },
    {
      field: "email", headerClass: 'agheader',
      headerName: 'Email-ID'
    },
    {
      field: "DateofJoining", headerClass: 'agheader',
      headerName: 'Date of Joining',
      cellRenderer: (params) => {
        const date = new Date(params.value);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return <p>{`${day}-${month}-${year}`}</p>;
      }
    },
    {
      field: "userrole", headerClass: 'agheader',
      headerName: 'User Role'
    },
    {
      field: "departmentname", headerClass: 'agheader',
      headerName: 'Department Name'
    },

    {
      field: "UserStatus", headerClass: 'agheader',
      headerName: 'User Status',
      cellRenderer: (params) => (
        <CBadge className='fs-6' color={params.value === 'A' ? 'success' : 'danger'}>
          {params.value === 'A' ? 'Active' : 'In-Active'}
        </CBadge>
      )
    },
    {
      headerName: (pageData.editstatus === null || pageData.editstatus === 'i') && auth.UserStatus === 'A' ? '' : 'Edit',
      width: 75, pinned: right, headerClass: 'agheader',
      filter: false,
      sortable: false,
      floatingFilter: false,
      editable: false,
      cellRenderer: (params) => {

        if ((pageData.editstatus === null || pageData.editstatus === 'i') && auth.UserStatus === 'A') {
          return null; // Return null to hide the button
        }

        // Otherwise, render the Edit button
        return (
          // <CTooltip content="Edit">
          <button
            className="border-0 mt-1 rounded-circle d-flex justify-content-center align-items-center" onClick={() => handleEdit(params.data.id)}
            style={{
              width: "40px",
              height: "40px",
              cursor: 'pointer',
              background: "rgba(25, 135, 84, 0.15)",
              border: "1px solid rgba(25, 135, 84, 0.3)",
              color: "#198754",
              transition: "all 0.3s ease",
              boxShadow: "0 2px 6px rgba(0, 0, 0, 0.1)",
            }}
            // onClick={() => handlefetch(params.data.BuildingId)}

            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(25,135,84,0.25)";
              e.currentTarget.style.transform = "scale(1.1)";
              e.currentTarget.style.boxShadow = "0 4px 12px rgba(25,135,84,0.3)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(25,135,84,0.15)";
              e.currentTarget.style.transform = "scale(1)";
              e.currentTarget.style.boxShadow = "0 2px 6px rgba(0, 0, 0, 0.1)";
            }}
          > <FaEdit className="fs-5" /></button>
          // </CTooltip>
        );
      }
    },
    {
      headerName: (pageData.deletestatus === null || pageData.deletestatus === 'i') && auth.UserStatus === 'A' ? '' : 'Status',
      // field: 'Delete',
      width: 83, pinned: right, headerClass: 'agheader',
      filter: false,
      sortable: false,
      floatingFilter: false,
      editable: false,
      cellRenderer: (params) => {

        if ((pageData.deletestatus === null || pageData.deletestatus === 'i') && auth.UserStatus === 'A') {
          return null; // Return null to hide the button
        }
        return (
          <CTooltip content="Inactive">
            <CIcon
              size='xl'
              icon={cilXCircle}
              className='m-2'
              onClick={() => handleDelete(params.data.id)}
              style={{ color: 'white', background: 'rgb(237,28,36)', borderRadius: '5px', display: params.data.UserStatus === 'I' ? 'none' : 'block' }}
            />
          </CTooltip>
        )
      }
    },
    {
      headerName: (pageData.editstatus === null || pageData.editstatus === 'i') && auth.UserStatus === 'A' ? '' : 'Reset',
      // headerName: 'Reset',
      // field: 'Rest Password',
      width: 80, pinned: right, headerClass: 'agheader',
      filter: false,
      sortable: false,
      floatingFilter: false,
      editable: false,
      cellRenderer: (params) => {

        if ((pageData.editstatus === null || pageData.editstatus === 'i') && auth.UserStatus === 'A') {
          return null; // Return null to hide the button
        }
        return (
          <CTooltip content="Password Reset">
            <CIcon
              size='xl'
              icon={cilSync}
              className='m-2'
              onClick={() => handleResetPassword(params)}
              style={{ color: 'white', background: 'blue', borderRadius: '5px', display: params.data.UserStatus === 'I' ? 'none' : 'block' }}
            />
          </CTooltip>
        )
      }

    },
  ]

  const navigate = useNavigate();
  const [dojDate, setDojDate] = useState();
  const PartRef1 = useRef(null)
  const [error, setError] = useState('');
  const API_URL = getConfig().REACT_APP_API_URL;
  const [ValidationData, SetValidationData] = useState([])


  const [RoleDropDownData, SetRoleDropDownData] = useState([])


  const [DepartmentDropDownData, SetDepartmentDropDownData] = useState([])

  const [loading, setLoading] = useState(false); // Loader state

  const [NewUserregister, setNewUserregister] = useState({
    employeecode: "",
    employeename: "",
    email: "",
    dateofjoin: dojDate,
    UserStatus: null,
    userrole: null,
    department: null,
    branchName: ''

  })

  const handleClear = (e) => {
    e.preventDefault();  // Add this
    setNewUserregister({
      employeecode: "",
      employeename: "",
      email: "",
      dateofjoin: null,
      UserStatus: "",
      userrole: "",
      department: "",
      branchName: ''
    });
    setDojDate(null);
    PartRef1.current?.clear();
  };

  // console.log(NewUserregister);

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  };

  //// new employee create
  const handleAddemployee = async () => {
    // Employee ID
    if (!NewUserregister.employeecode.trim()) {
      swal({
        text: "Please Enter Employee ID",
        icon: "warning",
      });
      return;
    }

    const isValidEmployeeCode = ValidationData.some((item) =>
      item.employeecode.toLowerCase() === NewUserregister.employeecode.toLowerCase()
    );
    if (isValidEmployeeCode) {
      swal({
        text: "This Employee ID is Already Existing",
        icon: "warning"
      });
      return;
    }

    // Employee Name
    if (!NewUserregister.employeename.trim()) {
      swal({
        text: "Please Enter Employee Name",
        icon: "warning",
      });
      return;
    }

    // Email
    if (!NewUserregister.email.trim()) {
      swal({
        text: "Please Enter Email ID",
        icon: "warning",
      });
      return;
    }

    if (!validateEmail(NewUserregister.email)) {
      swal({
        text: "Please enter a valid email address",
        icon: 'warning'
      });
      return;
    }

    // Date of Joining - NEW
    if (!NewUserregister.dateofjoin) {
      swal({
        text: "Please Select Date of Joining",
        icon: "warning",
      });
      return;
    }

    // User Role - NEW
    if (!NewUserregister.userrole) {
      swal({
        text: "Please Select User Role",
        icon: "warning",
      });
      return;
    }

    // Department - NEW
    if (!NewUserregister.department) {
      swal({
        text: "Please Select Department",
        icon: "warning",
      });
      return;
    }

    // Branch Access - NEW
    if (!NewUserregister.branchName || NewUserregister.branchName.trim() === '') {
      swal({
        text: "Please Select at least one Branch Access",
        icon: "warning",
      });
      return;
    }

    // If all validations pass, proceed with API call
    try {
      setLoading(true);

      const alldata = {
        ...NewUserregister,
        id: '',
        createdby: auth.empid,
        updateby: '',
        branchid: auth.branchid,
        mode: 'I'
      };

      const response = await axios.post(`${API_URL}/UserMainmasterRegister`, alldata);

      if (response.status === 200) {
        swal({
          text: `${response.data.message}`,
          icon: 'success'
        });
        FetchGridData();
        setLoading(false);
        // Reset form
        setNewUserregister({
          employeecode: '',
          employeename: '',
          email: '',
          UserStatus: '',
          userrole: '',
          department: '',
          dateofjoin: '',
          branchName: ''
        });
        setDojDate(null);
        if (PartRef1.current) {
          PartRef1.current.clear();
        }
      }
    } catch (err) {
      console.log(err);
      setLoading(false);
      swal({
        text: "An error occurred while adding the employee",
        icon: "error"
      });
    }
  };
  /// dropdown Data fetching

  const FetchRoleDropdown = async () => {
    try {
      const alldata = { id: '', userrole: '', createdby: '', updateby: '', branchid: auth.branchid, mode: 'S' }
      const response = await axios.post(`${API_URL}/UserroleMaster`, alldata)

      if (response.status === 200) {
        SetRoleDropDownData(response.data)
      }

    } catch (err) {

      console.log(err);
    }
  }

  const ValidationFetch = async () => {
    try {

      const alldata = { id: 0, updateby: auth.empid, branchid: auth.branchid, mode: 'S' }

      const response = await axios.post(`${API_URL}/userMainMasterSelect`, alldata)

      if (response.status === 200) {
        SetValidationData(response.data)
      }
    } catch (err) {
      console.log(err);
    }
  }

  useEffect(() => {
    FetchRoleDropdown();
    FetchDepartmentDropdown();
    FetchBranchDropdown();
    ValidationFetch();
    FetchGridData();
  }, [])

  const handleInputChange = (e) => {
    const value = e.target.value;
    // Regular expression to match special characters
    const regex = /[^a-zA-Z0-9]/g;

    if (regex.test(value)) {
      setError('Emp ID should not contain special characters');
    } else {
      setError('');
    }

    setNewUserregister({ ...NewUserregister, employeecode: value });
  };

  const [selectedBranches, setSelectedBranches] = useState([]);

  const authBranch =
    BranchDropDown?.find(b => b.branchid === auth.branchid) || {
      branchid: auth.branchid,
      branchName: 'DEFAULT BRANCH',
    };
  useEffect(() => {
    setSelectedBranches([authBranch]);
  }, [authBranch.branchid]);

  useEffect(() => {
    const uniqueBranches = [
      authBranch,
      ...selectedBranches.filter(b => b.branchid !== auth.branchid),
    ];

    setNewUserregister(prev => ({
      ...prev,
      branchName: uniqueBranches.map(b => b.branchid).join(','),
    }));
  }, [selectedBranches, authBranch]);


  /// dropdown Data fetching
  const FetchBranchDropdown = async () => {
    try {

      const alldata = { id: 0, branchName: '', createdby: 0, updateby: 0, mode: 'S', branchid: auth.branchid, BranchAccess: auth.BranchAccess }
      const response = await axios.post(`${API_URL}/BranchMaster`, alldata)

      if (response.status === 200) {
        SetBranchDropDown(response.data)
      }

    } catch (err) {

      console.log(err);
    }
  }

  const handleEdit = async (id) => {
    try {
      setEditvisible(true);
      SetEditid(id);
      // Fetch dropdowns first
      await Promise.all([
        FetchRoleDropdown(),
        FetchDepartmentDropdown(),
        FetchBranchDropdown()
      ]);

      const alldata = { id: id, updateby: auth.empid, branchid: auth.branchid, mode: 'E' };

      const response = await axios.post(`${API_URL}/userMainMasterSelect`, alldata);

      if (response.status === 200 && response.data.length > 0) {
        const user = response.data[0];

        // Clean and parse BranchAccess properly
        let branchIds = [];
        if (user.BranchAccess && typeof user.BranchAccess === 'string') {
          branchIds = user.BranchAccess.split(',')
            .map(id => id.trim())
            .filter(id => id !== '');
        }

        SetUpdateUserregister({
          id: id,
          employeecode: user.employeecode || '',
          employeename: user.employeename || '',
          email: user.email || '',
          dateofjoin: user.DateofJoining || '',
          UserStatus: user.UserStatus || '',
          userrole: user.userrole || '',
          department: user.department || '',
          departmentname: user.departname || '',
          branchName: branchIds.join(',') // Clean comma-separated string
        });
      }
    } catch (err) {
      console.log(err);
      swal({ text: "Failed to load user data", icon: "error" });
    }
  };

  const handleDelete = (id) => {
    try {
      setDeletevisible(true)
      SetEditid(id)
    } catch (err) {
      console.log(err);
    }
  }

  const handleconfirmDelete = async () => {

    setLoading(true)
    try {

      const alldata = { id: Editid, updateby: auth.empid, branchid: auth.branchid, mode: 'D' }

      const response = await axios.post(`${API_URL}/userMainMasterSelect`, alldata)

      if (response.status === 200) {
        setDeletevisible(false)
        FetchGridData()
        setLoading(false)
        swal({
          text: 'User Inactive SuccessFully',
          icon: 'success'
        })

      }

    } catch (err) {
      console.log(err);
    }
  }

  const handleupdate = async () => {
    // Validation
    if (!UpdateUserregister.employeename.trim()) {
      swal({ text: "Employee Name is required", icon: "warning" });
      setLoading(false);
      return;
    }
    if (!UpdateUserregister.email.trim()) {
      swal({ text: "Email is required", icon: "warning" });
      setLoading(false);
      return;
    }
    if (!UpdateUserregister.dateofjoin) {
      swal({ text: "Date of Joining is required", icon: "warning" });
      setLoading(false);
      return;
    }
    if (!UpdateUserregister.UserStatus || UpdateUserregister.UserStatus === 'Status') {
      swal({ text: "Please select a Status", icon: "warning" });
      setLoading(false);
      return;
    }
    if (!UpdateUserregister.userrole || UpdateUserregister.userrole === 'Select Role Name') {
      swal({ text: "Please select a User Role", icon: "warning" });
      setLoading(false);
      return;
    }
    if (!UpdateUserregister.department) {
      swal({ text: "Please select a Department", icon: "warning" });
      setLoading(false);
      return;
    }
    if (!UpdateUserregister.branchName || UpdateUserregister.branchName.trim() === '') {
      swal({ text: "Please select at least one Branch", icon: "warning" });
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      const alldata = {
        ...UpdateUserregister,
        updateddby: auth.empid,
        mode: 'U',
        branchid: auth.branchid
      };

      const response = await axios.post(`${API_URL}/userMainMasterUpdate`, alldata);

      if (response.status === 200) {
        FetchGridData();
        setEditvisible(false);
        swal({
          text: "User Data Updated Successfully",
          icon: "success"
        });
      }
    } catch (error) {
      console.error(error);
      swal({
        text: error.response?.data?.message || "Failed to update user",
        icon: "error"
      });
    } finally {
      setLoading(false); // Always stop loading
    }
  };

  const handleResetPassword = async (params) => {
    swal({
      text: 'Are You Sure Reset The Password',
      icon: 'warning',
      buttons: [true, 'Yes Reset'],
      dangerMode: true
    }).then(async (result) => {
      if (result) {
        try {

          const alldata = { id: params.data.id, employeecode: params.data.employeecode, employeename: params.data.employeename, email: params.data.email, branchid: auth.branchid }

          const response = await axios.post(`${API_URL}/ResetPassword`, alldata)

          if (response.status === 200) {
            swal({
              text: 'Password Reset SuccessFully',
              icon: 'success'
            })
          }

        } catch (error) {

          console.log(error);

        }
      }
    })

  }

  const defaultColDef = useMemo(() => ({
    filter: 'agTextColumnFilter',
    floatingFilter: true,
    editable: true,
  }), []);

  const FetchGridData = async () => {
    try {

      const alldata = { id: 0, updateby: auth.empid, branchid: auth.branchid, mode: 'S', BranchAccess: auth.BranchAccess }

      const response = await axios.post(`${API_URL}/userMainMasterSelect`, alldata)


      if (response.status === 200) {
        SetGridData(response.data)
      }

    } catch (err) {
      console.log(err);
    }

  }

  const status = [{ lable: 'Active', value: 'A' }, { lable: 'InActive', value: 'I' }]


  const gridRef = useRef(null);
  const onExportClick = () => {
    const params = {
      fileName: 'Alluser_Data.csv',
      columnKeys: ['employeecode', 'employeename', 'email', 'DateofJoining', 'userrole', 'departmentname'],
    };
    gridRef.current.api.exportDataAsCsv(params);
  };

  const handleexport = () => {
    // Get the filtered data from the AG Grid
    const filteredData = gridRef.current.api.getModel().rowsToDisplay.map(rowNode => rowNode.data);

    console.log("filteredData", filteredData);

    const doc = new jsPDF({ format: 'a1' });
    const title = 'User Detail';
    const titleX = doc.internal.pageSize.width / 2; // Centering the title horizontally
    const titleY = 15; // Setting the vertical position of the title

    // Setting font size and weight
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");

    doc.text(title, titleX, titleY, { align: 'center' });

    const exportKeys = ['employeecode', 'employeename', 'email', 'DateofJoining', 'userrole', 'departmentname', 'UserStatus'];

    if (filteredData.length > 0) {
      // Extract only the required fields
      const data = filteredData.map(obj => exportKeys.map(key => obj[key]));


      doc.autoTable({
        head: [exportKeys],
        body: data,
        margin: { top: 20, right: 10, left: 10, bottom: 30 }, // Add bottom margin for footer
        styles: {
          theme: 'grid',
          halign: "center",
          valign: "middle", // Center vertically
          fontSize: 10,
          overflow: 'linebreak', // Allow line break to avoid overlap
          cellWidth: 'wrap', // Adjust cell width to fit text
        },
        // columnStyles: {
        //   0: { cellWidth: 80 },
        //   1: { cellWidth: 60 },
        //   2: { cellWidth: 80 },
        // },

        didDrawPage: function (_data) {
          const pageCount = doc.internal.getNumberOfPages();
          doc.setFontSize(10);
          const footerText = `Printed By: ${auth.employeename}; 
          Printed On: ${new Date().toLocaleDateString()} Time: ${new Date().toLocaleTimeString()}
          Note: This document has been generated electronically and is valid without signature.`;

          const pageWidth = doc.internal.pageSize.width;
          const footerY = doc.internal.pageSize.height - 20; // Adjusted positioning of the footer
          doc.text(footerText, pageWidth / 2, footerY, { align: 'center', maxWidth: pageWidth - 20 }); // Add maxWidth to avoid overflow
        }
      });

      doc.save('User Detail.pdf');
    } else {
      alert('No data available to export');
    }
  };

  const [uploadxl, setuploadxl] = useState(false)

  const handleUploadExcelSheet = (e) => {
    const selectedFile = e.target.files[0];

    if (selectedFile) {
      const fileName = selectedFile.name;
      const fileExtension = fileName.split('.').pop().toLowerCase();

      if (fileExtension === 'csv' || fileExtension === 'xls' || fileExtension === 'xlsx') {
        setuploadxl(selectedFile);
      } else {
        console.log('Please select a CSV or Excel file.');
        swal({
          title: 'Invalid File Format',
          html: 'Please select a valid CSV or Excel file format.<br>(Other formats are not supported)',
          icon: 'warning'
        });
        setuploadxl(false); // Reset uploadxl state
        e.target.value = null; // Clear the file input field
        return;
      }
    }
  };

  const [unuploadfillink, setunuploadfillink] = useState(false)

  const handleuploaddata = (e) => {
    if (!uploadxl) {
      swal({
        text: 'Please Select Upload File',
        icon: 'warning',
      });
      return;
    }

    swal({
      title: "Are you sure?",
      text: "Once Upload, you will and check userlist!",
      icon: "warning",
      buttons: true,
      closeOnEsc: true,
      dangerMode: false,
    }).then(async (result) => {

      setLoading(true)
      if (result) {
        try {
          const formData = new FormData();
          formData.append('file', uploadxl);
          formData.append('createdby', auth.empid)
          formData.append('systemip', ipAddress)
          formData.append('branchid', auth.branchid)
          setUploadvisible(false);

          const response = await axios.post(`${API_URL}/UserUploadData`, formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          });
          if (response.status === 200) {
            setLoading(false);
            const { message, uploadcount, unuploadedFilePath, temppassword } = response.data;
            if (unuploadedFilePath) {
              setunuploadfillink(true);
              FetchGridData();
              swal({
                heightAuto: true,
                title: `Total Uploaded File Count: ${uploadcount}`,
                text: `Some data could not be uploaded. Please download the file to see the error.Temparory Password is : ${temppassword}`,
                icon: 'warning',
                buttons: {
                  cancel: "OK",
                  download: {
                    text: "Download File",
                    value: "download",
                  },
                },
              }).then((value) => {
                if (value === "download") {
                  const link = document.createElement('a');
                  link.href = `${API_URL}${unuploadedFilePath}`;
                  link.setAttribute('download', 'unuploaded_User_data.xlsx');
                  document.body.appendChild(link);
                  link.click();
                  link.parentNode.removeChild(link);
                }
              });
            } else {
              setUploadvisible(false);
              FetchGridData();
              swal({
                heightAuto: true,
                title: `Total Uploaded File Count: ${uploadcount}`,
                text: `Temparory Password is : ${temppassword}`,
                icon: 'success',
                width: '500px',
                timer: 4000,
                animation: true,
                customClass: {
                  title: 'swaltitle',
                },
              });
              setUploadvisible(false);
            }
          } else {
            swal({
              heightAuto: true,
              title: `Error: ${response.status}`,
              icon: 'error',
              width: '500px',
              timer: 4000,
              animation: true,
              customClass: {
                title: 'swaltitle',
              },
            });
          }
        } catch (err) {
          console.log(err);
          setLoading(false)
          swal({
            heightAuto: true,
            title: 'Internal Server Error',
            icon: 'error',
            width: '500px',
            timer: 4000,
            animation: true,
            customClass: {
              title: 'swaltitle',
            },
          });
        } finally {
          setUploadvisible(true);
          setLoading(false)
        }
      } else {
        setLoading(false)
      }
    });
  };
  const FetchDepartmentDropdown = async () => {
    try {

      const alldata = { mode: 'S', branchid: auth.branchid }
      const response = await axios.post(`${API_URL}/FetchDepartment`, alldata)

      if (response.status === 200) {
        SetDepartmentDropDownData(response.data.send)
      }

    } catch (err) {

      console.log(err);
    }
  }

  return (

    <>

      {loading && (
        <div className="loading-overlay">
          <div className="loading-spinner">
            <RotatingLines
              visible={true}
              height="96"
              width="96"
              color="grey"
              strokeWidth="5"
              animationDuration="0.75"
              ariaLabel="rotating-lines-loading"
              wrapperStyle={{}}
              wrapperClass=""
            />
          </div>
        </div>
      )}

      {/* Delete Model start*/}
      <CModal
        size='sm'
        alignment="center"
        visible={deletevisible}
        onClose={() => setDeletevisible(false)}
        aria-labelledby="VerticallyCenteredExample"
      >
        <CModalTitle id="VerticallyCenteredExample" className='ms-3'>Are you sure?</CModalTitle>
        <CModalBody>
          <p>This operation can&apos;t be reverted</p>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" type='submit' onClick={() => setDeletevisible(false)}>
            CANCEL
          </CButton>
          <CButton color="primary" type='submit' onClick={() => handleconfirmDelete()} >CONFIRM</CButton>
        </CModalFooter>
      </CModal>
      {/* Delete model end*/}

      {/* <CRow className='mb-1'>
        <div className="d-flex justify-content-center">
1        </div>
      </CRow> */}
      {
        (pageData.addstatus === null || pageData.addstatus === 'i') && auth.UserStatus === 'A' ? '' :
          <CCard className="mb-3">
            <CCardHeader className="d-flex justify-content-center pro-header p-2"   style={{ background: '#106FB2' }}>
              <h3 className='text-bold text-white' style={{ color: '#1D1D1F' }}> <CIcon icon={cilUser} size='xl' /> All Users</h3>
            </CCardHeader>
            <CCardBody>
              <CRow>
                <CCol md={3}>
                  <div className="my-3">
                    <CFormLabel htmlFor="empid">Employee ID  <span style={{ color: 'red' }}>*</span></CFormLabel>
                    <CFormInput
                      type="text"
                      id='Emp ID'
                      placeholder="Employee ID"
                      onChange={handleInputChange}
                      value={NewUserregister.employeecode}
                      disabled={loading} // Disable input during loading

                    />
                    {error && <p style={{ color: 'red' }}>{error}</p>}
                  </div>
                </CCol>
                <CCol md={3}>
                  <div className="my-3">
                    <CFormLabel htmlFor="empname">Employee Name  <span style={{ color: 'red' }}>*</span></CFormLabel>
                    <CFormInput
                      type="text"
                      id='empname'
                      placeholder="Employee Name"
                      onChange={(e) => setNewUserregister({ ...NewUserregister, employeename: e.target.value })}
                      value={NewUserregister.employeename}
                      disabled={loading} // Disable input during loading
                    />
                  </div>
                </CCol>
                <CCol md={3}>
                  <div className="mt-3">
                    <CFormLabel htmlFor="Email">Email  <span style={{ color: 'red' }}>*</span></CFormLabel>
                    <CFormInput
                      type="email"
                      id='Email'
                      placeholder="example@gmail.com"
                      onChange={(e) => setNewUserregister({ ...NewUserregister, email: e.target.value })}
                      value={NewUserregister.email}
                      disabled={loading} // Disable input during loading
                    />
                  </div>
                </CCol>

                <CCol md={3} className='mt-3'>
                  <CFormLabel className='me-3' htmlFor="doj">Date of Joining  <span style={{ color: 'red' }}>*</span></CFormLabel>
                  <div className="">
                    <DatePicker
                      maximumDate={utils().getToday()} // ← changed here (includes today)
                      animations={[transition()]}
                      render={<InputIcon className="form-control" placeholder="Date of Join" />}
                      value={NewUserregister.dateofjoin}
                      disabled={loading}
                      onChange={(date) => {
                        const formattedDate = date ? `${date.year}/${date.month}/${date.day}` : ''; // also adjust formatting if needed
                        setNewUserregister({ ...NewUserregister, dateofjoin: formattedDate });
                      }}
                    />
                  </div>
                </CCol>

                <CCol md={3}>
                  <CFormLabel htmlFor="userrole">User Role  <span style={{ color: 'red' }}>*</span></CFormLabel>
                  <CFormSelect
                    aria-label="Default select example"
                    options={['Select Role Name',
                      ...RoleDropDownData.map(option => ({ label: option.userrole, value: option.roleid }))]}
                    onChange={(e) => setNewUserregister({ ...NewUserregister, userrole: e.target.value })}

                    value={NewUserregister.userrole}

                    disabled={loading} // Disable input during loading
                  />
                </CCol>

                <CCol md={3}>
                  <CFormLabel htmlFor="department">Department<span style={{ color: 'red' }}>*</span></CFormLabel>

                  <Typeahead
                    ref={PartRef1}
                    id="basic-typeahead-single"
                    labelKey="Department"
                    onChange={(selected) => {
                      if (selected.length > 0) {
                        setNewUserregister({ ...NewUserregister, department: selected[0].DepartmentID })
                      }
                      else {
                        setNewUserregister({ ...NewUserregister, department: '' })
                      }
                    }}
                    options={DepartmentDropDownData}
                    placeholder="Select Department"
                    clearButton
                  />
                </CCol>

                <CCol md={3}>
                  <CFormLabel>
                    Branch Access <span style={{ color: 'red' }}>*</span>
                  </CFormLabel>

                  <Typeahead
                    multiple
                    id="branch-typeahead"
                    labelKey="branchName"
                    options={BranchDropDown || []}
                    placeholder="Select Branch(es)"
                    selected={selectedBranches}
                    onChange={(selected) => {
                      const filtered = selected.filter(
                        b => b.branchid !== auth.branchid
                      );

                      setSelectedBranches([authBranch, ...filtered]);
                    }}
                    renderToken={(option, { onRemove }, index) => {
                      const isAuthBranch = option.branchid === auth.branchid;

                      return (
                        <div
                          key={index}
                          className={`badge me-1 ${isAuthBranch ? 'bg-dark' : 'bg-primary'}`}
                          style={{ padding: '0.5em 0.75em', fontSize: '0.9em' }}
                          title={
                            isAuthBranch
                              ? 'Default branch cannot be removed'
                              : 'Click to remove'
                          }
                        >
                          {option.branchName}

                          {!isAuthBranch && (
                            <span
                              style={{ marginLeft: 8, cursor: 'pointer' }}
                              onClick={() => onRemove(option)}
                            >
                              &times;
                            </span>
                          )}

                          {isAuthBranch && (
                            <span style={{ marginLeft: 6, color: '#ccc' }}>🔒</span>
                          )}
                        </div>
                      );
                    }}
                    clearButton
                  />
                </CCol>


                <div className='m-2 d-flex justify-content-end'>
                  <CButton className="mx-2 btn-hover-effect" type='button' color="danger" onClick={handleClear}>
                    <CIcon icon={cilDelete} /> Clear
                  </CButton>
                  <CButton type="submit" className="btn-hover-effect" color="success" disabled={loading} onClick={handleAddemployee}>
                    <CIcon icon={cilPlus} /> Add
                  </CButton>
                </div >
              </CRow>
            </CCardBody>
          </CCard>
      }
      {(pageData.viewstatus === null || pageData.viewstatus === 'i') && auth.UserStatus === 'A' ? '' :
        <h3 className='text-bold text-dark' style={{ color: '#1D1D1F' }}> <CIcon icon={cilUser} size='xl' /> All Users</h3>
      }
      <CRow className='d-flex mb-2'>
        <CCol className='d-flex justify-content-end flex-wrap'>
          {
            (pageData.addstatus === null || pageData.addstatus === 'i') && auth.UserStatus === 'A' ? '' :
              <CButton type="submit" color="primary" variant="outline" className='me-2 btn-hover-effect' onClick={() => setUploadvisible(true)}>
                {/* <CImage src={excel_icon} className='w-50 h-50 '></CImage> */}
                <CIcon icon={cilCloudDownload} /> Import
              </CButton>
          }
          {/* <CTooltip content="Export Excel"> */}
          <CButton type="submit" color="success" variant="outline" className='me-2 btn-hover-effect' onClick={onExportClick}>
            <PiMicrosoftExcelLogo /> Export
          </CButton>
          {/* </CTooltip> */}
          {/* <CTooltip content="Export PDF"> */}
          <CButton type="submit" color="danger" variant="outline" className='me-2 btn-hover-effect' onClick={handlepdf}>
            <GrDocumentPdf /> Export
          </CButton>
          {/* </CTooltip> */}
          {/* {
            (pageData.addstatus === null || pageData.addstatus === 'i') && auth.UserStatus === 'A' ? '' :
              <CButton type="submit" color="info" variant="outline" className='btn-hover-effect' onClick={addStaff}>
                <CIcon icon={cilPlus} /> Add
              </CButton>
          } */}
        </CCol>
      </CRow>
      {/* <div style={containerStyle}> */}
      <div className="ag-theme-quartz" style={{ height: 400 }}>
        <AgGridReact
          ref={gridRef}
          rowData={GridData}
          columnDefs={colmun}
          defaultColDef={defaultColDef}
          // onGridReady={onGridReady}
          getRowHeight={() => 55}
          rowSelection="multiple"
          pagination={true}
          paginationPageSize={10}
          paginationPageSizeSelector={[10, 20, 30, 40, 50]}
        />
      </div>
      {/* </div> */}



      {/* { Edit Document modal start} */}

      <>
        <CModal
          size="lg"
          alignment="center"
          backdrop='static'
          visible={editvisible}
          onClose={() => setEditvisible(false)}
          aria-labelledby="VerticallyCenteredExample"
        >
          {/* <CModalTitle><div className="d-flex">
            <CIcon className="me-2" size={'xxl'} icon={cilPencil} />
            <h3> Edit User</h3>
          </div>
          </CModalTitle> */}
          <CCardHeader className="bg-dark text-white d-flex justify-content-between align-items-center p-3">
            <h4 className="mb-0 fw-bold text-light">Edit User <CIcon icon={cilPencil} size='lg' /></h4>

            <CIcon
              icon={cilX}
              size="lg"
              className="text-white opacity-75"
              onClick={() => setEditvisible(false)} title="Close"
            />
          </CCardHeader>
          <CModalBody>

            <CRow>
              <CCol md={3}>
                <div className="mb-3">
                  <CFormLabel htmlFor="empid">Emp ID <span style={{ color: 'red' }}>*</span></CFormLabel>
                  <CFormInput
                    type="text"
                    id='Emp ID'
                    placeholder="Emp ID"
                    value={UpdateUserregister.employeecode}
                    disabled
                  />
                </div>
              </CCol>
              <CCol md={3}>
                <div className="mb-3">
                  <CFormLabel htmlFor="empname">Employee Name <span style={{ color: 'red' }}>*</span></CFormLabel>
                  <CFormInput
                    type="text"
                    id='empname'
                    placeholder="Employee Name"
                    value={UpdateUserregister.employeename}
                    onChange={(e) => SetUpdateUserregister({ ...UpdateUserregister, employeename: e.target.value })}
                    disabled={loading} // Disable input during loading
                  />
                </div>
              </CCol>
              <CCol md={3}>
                <div className="mb-3">
                  <CFormLabel htmlFor="Email">Email  <span style={{ color: 'red' }}>*</span></CFormLabel>
                  <CFormInput
                    type="email"
                    id='Email'
                    placeholder="example@gmail.com"
                    value={UpdateUserregister.email}
                    onChange={(e) => SetUpdateUserregister({ ...UpdateUserregister, email: e.target.value })}
                    disabled={loading} // Disable input during loading
                  />
                </div>
              </CCol>
              <CCol md={3}>

                <CFormLabel className='me-3' htmlFor="doj">Date of Joining<span style={{ color: 'red' }}>*</span></CFormLabel>
                <div >
                  <DatePicker
                    animations={[transition()]}
                    render={<InputIcon className="form-control" />}
                    value={new Date(UpdateUserregister.dateofjoin)}
                    disabled={loading} // Disable input during loading
                    onChange={(date) => {
                      const formattedDate = date.format('YYYY-MM-DD')
                      SetUpdateUserregister({ ...UpdateUserregister, dateofjoin: formattedDate })
                      console.log(formattedDate)
                    }}
                  />
                </div>
              </CCol>
              <CCol md={3}>
                <CFormLabel htmlFor="status">Status  <span style={{ color: 'red' }}>*</span></CFormLabel>
                <CFormSelect
                  aria-label="Default select example"
                  options={['Status',
                    ...status.map(option => ({ label: option.lable, value: option.value }))
                  ]}
                  onChange={(e) => SetUpdateUserregister({ ...UpdateUserregister, UserStatus: e.target.value })}
                  value={UpdateUserregister.UserStatus}
                  disabled={loading} // Disable input during loading
                />
              </CCol>

              <CCol md={3}>
                <CFormLabel htmlFor="userrole">User Role  <span style={{ color: 'red' }}>*</span></CFormLabel>
                <CFormSelect
                  aria-label="Default select example"
                  options={['Select Role Name',
                    ...RoleDropDownData.map(option => ({ label: option.userrole, value: option.roleid }))]}
                  onChange={(e) => SetUpdateUserregister({ ...UpdateUserregister, userrole: e.target.value })}
                  value={UpdateUserregister.userrole}
                  disabled={loading} // Disable input during loading
                />
              </CCol>

              <CCol md={3}>
                <CFormLabel htmlFor="department">Department<span style={{ color: 'red' }}>*</span></CFormLabel>
                {/* <CFormSelect

                      aria-label="Default select example"
                      options={['Select Department Name',
                        ...DepartmentDropDownData.map(option => ({ label: option.departmentname, value: option.departmentid }))]}
                      onChange={(e) => SetUpdateUserregister({ ...UpdateUserregister, department: e.target.value })}
                      value={UpdateUserregister.department}
                      disabled // Disable input during loading
                    /> */}

                <Typeahead
                  ref={PartRef1}
                  id="basic-typeahead-single"
                  labelKey="Department"
                  onChange={(selected) => {
                    if (selected.length > 0) {
                      SetUpdateUserregister({
                        ...UpdateUserregister, department: selected[0].DepartmentID,
                        departmentname: selected[0].Department
                      })
                    }
                    else {
                      SetUpdateUserregister({ ...UpdateUserregister, department: '', departmentname: '' })
                    }
                  }}
                  options={DepartmentDropDownData}
                  placeholder="Select Department"
                  selected={UpdateUserregister.departmentname ? [UpdateUserregister.departmentname] : []}
                  clearButton
                />

              </CCol>

              <CCol md={12} className="mt-3">
                <CFormLabel >Branch Access <span style={{ color: 'red' }}>*</span></CFormLabel>
                <Typeahead
                  multiple
                  id="edit-branch-typeahead-multiple"
                  labelKey="branchName"
                  options={BranchDropDown || []}
                  placeholder="Select Branch(es)"
                  onChange={(selected) => {
                    const authBranch =
                      BranchDropDown?.find(b => b.branchid === auth.branchid) || {
                        branchid: auth.branchid,
                        branchName: 'DEFAULT BRANCH',
                      };

                    // Filter out auth branch from selected to avoid duplication
                    const filtered = (selected || []).filter(
                      item => item.branchid !== auth.branchid
                    );

                    // Always include auth branch first
                    const updatedSelection = [authBranch, ...filtered];

                    const selectedIds = updatedSelection.map(item => item.branchid);

                    SetUpdateUserregister({
                      ...UpdateUserregister,
                      branchName: selectedIds.join(','),
                    });
                  }}
                  selected={
                    (() => {
                      if (!UpdateUserregister.branchName) return [];

                      const selectedIds = UpdateUserregister.branchName
                        .split(',')
                        .map(id => id.trim())
                        .filter(id => id);

                      const selectedBranches = BranchDropDown?.filter(branch =>
                        selectedIds.includes(branch.branchid.toString())
                      ) || [];

                      const authBranch =
                        BranchDropDown?.find(b => b.branchid === auth.branchid) || {
                          branchid: auth.branchid,
                          branchName: 'DEFAULT BRANCH',
                        };

                      const hasAuthBranch = selectedBranches.some(
                        item => item.branchid === auth.branchid
                      );

                      return hasAuthBranch
                        ? selectedBranches
                        : [authBranch, ...selectedBranches];
                    })()
                  }
                  renderToken={(option, { onRemove }, index) => {
                    const isAuthBranch = option.branchid === auth.branchid;

                    return (
                      <div
                        key={index}
                        className={`badge me-1 ${isAuthBranch ? 'bg-dark' : 'bg-primary'}`}
                        style={{
                          padding: '0.5em 0.75em',
                          display: 'inline-block',
                          fontSize: '0.9em',
                        }}
                        title={isAuthBranch ? 'Default branch (cannot be removed)' : 'Click to remove'}
                      >
                        {option.branchName}
                        {!isAuthBranch && (
                          <span
                            style={{ marginLeft: 8, cursor: 'pointer' }}
                            onClick={() => onRemove(option)}
                          >
                            ×
                          </span>
                        )}
                        {isAuthBranch && (
                          <span style={{ marginLeft: 8, fontSize: '1em', color: '#ccc' }}>Locked</span>
                        )}
                      </div>
                    );
                  }}
                  clearButton={false} // Optional: prevent clearing all (since default is required)
                />
              </CCol>

            </CRow>

          </CModalBody>


          <CModalFooter>
            <div className='m-2 d-flex justify-content-end'>
              <CButton className="mx-2 btn-hover-effect" type='submit' color="danger" disabled={loading} onClick={() => setEditvisible(false)}>
                Cancel
              </CButton>
              <CButton type="submit" className='btn-hover-effect' color="success" onClick={handleupdate} disabled={loading}>
                Update
              </CButton>
            </div>
          </CModalFooter>
        </CModal>


      </>


      {/* Upload Modal Start*/}

      <CModal
        size='lg'
        alignment="center"
        visible={Uploadvisible}
        onClose={() => setUploadvisible(false)}
        aria-labelledby="VerticallyCenteredExample"
      >
        <CModalTitle id="VerticallyCenteredExample" className='ms-3'>Import Data</CModalTitle>
        <CModalBody>

          <div className="import-input">
            <label htmlFor="importdata" className=' form-label '>Import Data</label>
            <input type="file" className=' form-control ' onChange={handleUploadExcelSheet} />
          </div>
          <hr className='mt-2' />
          <div className="download-sample-template text-center">
            <p>Important ⚠</p>
            <span className='text-danger'>Download The Below The Template That Colum Name Based Enter The Data Then Upload here</span>
            <div>
              <a href="/UserUpload_Temp.xlsx" className=' nav-link text-decoration-underline ' download>Click to Download</a>
            </div>
          </div>

        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" type='submit' className='btn-hover-effect' onClick={() => setUploadvisible(false)}>
            CANCEL
          </CButton>
          <CButton color="primary" type='submit' className='btn-hover-effect' onClick={() => handleuploaddata()} >Upload Data</CButton>
        </CModalFooter>
      </CModal>


      {/* Upload Modal End */}
    </>



  );
};

Allusers.propTypes = {
  auth: PropTypes.any.isRequired,
  ipAddress: PropTypes.string
};


export default Allusers;