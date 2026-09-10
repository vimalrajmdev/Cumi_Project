import { cilDelete, cilPencil, cilPlus, cilTrash, cilUserPlus } from '@coreui/icons'
import CIcon from '@coreui/icons-react'
import { CButton, CCard, CCardBody, CCardHeader, CCol, CFormInput, CFormLabel, CFormSelect, CHeader, CModal, CModalBody, CModalFooter, CNav, CNavItem, CNavLink, CRow, CTabContent, CTabPane, CTooltip } from '@coreui/react'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { AgGridReact } from 'ag-grid-react';
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import axios from "axios";
import swal from 'sweetalert';
import DatePicker , { DateObject } from "react-multi-date-picker"
import transition from "react-element-popper/animations/transition"
import InputIcon from "react-multi-date-picker/components/input_icon"
import { RotatingLines } from 'react-loader-spinner';
import PropTypes from 'prop-types'; // Import PropTypes
import { getConfig } from 'src/config';
import { Typeahead } from "react-bootstrap-typeahead";
import { FaEdit, FaTrash } from 'react-icons/fa';
import { right } from '@popperjs/core';
import { CardHeader } from 'react-bootstrap';
import "react-bootstrap-typeahead/css/Typeahead.css";

const Superusercreate = ({ auth }) => {
  const API_URL = getConfig().REACT_APP_API_URL;
  const PartRef1 = useRef(null)
  const [activeKey, setActiveKey] = useState(1)

  const [editvisible, setEditvisible] = useState(false)

  const [GridData, SetGridData] = useState([])

  const [dojDate, setDojDate] = useState()

  const [Editid, SetEditid] = useState(null)


  const [ValidationData, SetValidationData] = useState([])

  const [RoleDropDownData, SetRoleDropDownData] = useState([])

  const [BranchDropDown, SetBranchDropDown] = useState([])

  const [DepartmentDropDownData, SetDepartmentDropDownData] = useState([])

  const [loading, setLoading] = useState(false); // Loader state

  const colmun = [
    { field: "employeecode", headerClass: 'agheader', headerName: 'Employee ID' },
    { field: "employeename", headerClass: 'agheader', headerName: 'Employee Name' },
    { field: "email", headerClass: 'agheader', headerName: 'Email-ID' },
    {
      field: "DateofJoining", headerClass: 'agheader', headerName: 'Date of Joining',
      cellRenderer: (params) => (
        <>
          <p>{new Date(params.value).toISOString().replaceAll('/', '-').slice(0, 10)}</p>
        </>
      )
    },
    { field: "userrole", headerClass: 'agheader', headerName: 'User Role' },
    { field: "departmentname", headerClass: 'agheader', headerName: 'Department Name' },
    { field: "branchName", headerClass: 'agheader', headerName: 'Branch Name' },
    {
      field: 'Edit', headerClass: 'agheader', pinned: right,
      width: 100,
      floatingFilter: false,
      cellRenderer: (params) => (
        <button className="border-0 mt-1 rounded-circle d-flex justify-content-center align-items-center"
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
          }} onClick={() => {
            handleEdit(params.data.id)
          }} >
          <FaEdit className="fs-5" />
        </button>
      )
    },


    {
      field: 'Delete', headerClass: 'agheader', pinned: right,
      width: 100,
      floatingFilter: false,
      cellRenderer: (params) => (
        <button
          className="border-0 mt-1 rounded-circle d-flex justify-content-center align-items-center"
          style={{
            width: "40px",
            height: "40px",
            backdropFilter: "blur(6px)",
            background: "rgba(220, 53, 69, 0.15)", // red glass look
            border: "1px solid rgba(220, 53, 69, 0.3)",
            color: "#dc3545",
            transition: "all 0.3s ease",
            boxShadow: "0 2px 6px rgba(0, 0, 0, 0.1)",
          }}
          onClick={() => handleDelete(params.data.id)}
          title="Delete"
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(220,53,69,0.25)";
            e.currentTarget.style.transform = "scale(1.1)";
            e.currentTarget.style.boxShadow = "0 4px 12px rgba(220,53,69,0.3)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(220,53,69,0.15)";
            e.currentTarget.style.transform = "scale(1)";
            e.currentTarget.style.boxShadow = "0 2px 6px rgba(0, 0, 0, 0.1)";
          }}
        >
          <FaTrash className="fs-5" />
        </button>

        // <CTooltip content="Delete">
        //   <CIcon
        //     icon={cilTrash}
        //     className='mx-2'
        //     size='lg'
        //     onClick={() => handleDelete(params.data.id)}
        //     style={{ color: 'white', background: 'red', borderRadius: '5px' }}
        //   />
        // </CTooltip>
      )
    },
  ]

  const defaultColDef = useMemo(() => {
    return {
      filter: 'agTextColumnFilter',
      floatingFilter: true,
    }
  }, []);


  const [NewUserregister, setNewUserregister] = useState({
    employeecode: "",
    employeename: "",
    email: "",
    dateofjoin: dojDate,
    UserStatus: 'A',
    userrole: null,
    department: null,
    Branch: auth.branchid,
  })



  const [UpdateUserregister, SetUpdateUserregister] = useState({
    id: null,
    employeecode: "",
    employeename: "",
    email: "",
    dateofjoin: dojDate,
    UserStatus: 'A',
    userrole: null,
    department: null,
    Branch: null,
  })


  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  };


  const handleEdit = async (id) => {
    try {

      FetchRoleDropdown()
      FetchDepartmentDropdown()
      FetchBranchDropdown()
      SetEditid(id)

      const alldata = { id: id, updateby: auth.empid, branchid: auth.branchid, mode: 'E' }

      const response = await axios.post(`${API_URL}/userMainMasterSelect`, alldata)

      if (response.status === 200) {

        const { employeecode, employeename, email, DateofJoining, branchid, userrole, department } = response.data[0];

        SetUpdateUserregister({
          ...UpdateUserregister, id: id, employeecode: employeecode, employeename: employeename, email: email,
          dateofjoin: DateofJoining, Branch: branchid, userrole: userrole, department: department
        })

        setEditvisible(true)
      }


    } catch (error) {

      console.log(error);
    }
  }


  const handleDelete = async (id) => {

    swal({
      text: 'Are You Sure Want to Delete User',
      icon: 'warning',
      buttons: [true, 'Yes Delete'],
      dangerMode: true
    }).then(async (result) => {
      if (result) {
        setLoading(true)
        try {

          const alldata = { id: id, updateby: auth.empid, branchid: auth.branchid, mode: 'D' } // updatedby as goes to delete deleted by 

          const response = await axios.post(`${API_URL}/userMainMasterSelect`, alldata)

          if (response.status === 200) {
            swal({
              text: 'Deleted User SuccessFully',
              icon: 'success'
            })
            ValidationFetch()
            setLoading(false)
          }


        } catch (error) {

          setLoading(false)

          console.log(error);
        }
      }
    })
  }

  //// new Admin create

  const handleAddemployee = async () => {

    if (NewUserregister.employeecode == '') {
      swal({
        text: "Please Enter Employee ID",
        icon: "warning",
      })

      return
    }

    const isValidEmployeeCode = ValidationData.some((item) => {
      return (
        item.employeecode.toLowerCase() === NewUserregister.employeecode.toLowerCase()
      )
    })
    if (isValidEmployeeCode) {
      swal({
        text: "This EmployeeCode is Already Exitsing",
        icon: "warning"
      });
      return;
    }

    if (NewUserregister.employeename == '') {
      swal({
        text: "Please Enter EmployeeName",
        icon: "warning",
      })

      return
    }
    if (NewUserregister.email == '') {
      swal({
        text: "Please Enter Email",
        icon: "warning",
      })

      return
    }
    if (NewUserregister.dateofjoin == '') {
      swal({
        text: "Please Select Date of Join",
        icon: "warning",
      })

      return
    }
    if (NewUserregister.userrole == '') {
      swal({
        text: "Please Select User Role",
        icon: "warning",
      })

      return
    }
    if (NewUserregister.Branch == '') {
      swal({
        text: "Please Select Branch",
        icon: "warning",
      })

      return
    }

    if (NewUserregister.department == '') {
      swal({
        text: "Please Select Department",
        icon: "warning",
      })

      return
    }

    const isValidEmployeeName = ValidationData.some((item) => {
      return (
        item.employeename.toLowerCase() === NewUserregister.employeename.toLowerCase()
      )
    })
    if (isValidEmployeeName) {
      swal({
        text: "This EmployeeName is Already Exitsing",
        icon: "warning"
      });
      return;
    }


    if (NewUserregister.email == '') {
      swal({
        text: "Please Enter Email ID",
        icon: "warning",
      })

      return
    }


    if (!validateEmail(NewUserregister.email)) {

      swal({
        text: "Please enter a valid email address",
        icon: 'warning'
      })

      return
    }


    const isValidEmail = ValidationData.some((item) => {
      return (
        item.email.toLowerCase() === NewUserregister.email.toLowerCase()
      )
    })
    if (isValidEmail) {
      swal({
        text: "This Email ID is Already Exitsing",
        icon: "warning"
      });
      return;
    }

    try {

      setLoading(true)

      const alldata = { ...NewUserregister, id: '', createdby: 0, updateby: '', branchid: NewUserregister.Branch, mode: 'I' }
      console.log('alldata', alldata);

      const response = await axios.post(`${API_URL}/UserMainmasterRegister`, alldata)

      if (response.status === 200) {
        setLoading(false);
        swal({
          text: `${response.data.message}`,
          icon: 'success'
        }).then(() => {
          ValidationFetch();
          setNewUserregister({ ...NewUserregister, employeecode: '', employeename: '', email: '', status: '', userrole: '', department: '' });
        })


      }

      if (response.status === 500) {
        setLoading(false)
        swal({
          text: `${response.data.message}`,
          icon: 'warning'
        })
        setNewUserregister({ ...NewUserregister, employeecode: '', employeename: '', email: '', status: '', userrole: '', department: '' })
      }



    } catch (err) {
      console.log(err);
      setLoading(false)
    }






  }


  const handleupdate = async () => {
    setLoading(true)
    swal({
      text: 'Are You Sure Want to Update The Data',
      icon: 'warning',
      buttons: [true, 'Yes Update'],
      dangerMode: true
    }).then(async (result) => {
      if (result) {
        try {

          const alldata = { ...UpdateUserregister, updateddby: auth.empid, mode: 'U', branchid: auth.branchid }

          const response = await axios.post(`${API_URL}/userMainMasterUpdate`, alldata)

          if (response.status === 200) {
            ValidationFetch();
            setEditvisible(false);
            setLoading(false);
            swal({
              text: "User Data Updated SuccessFullly",
              icon: "success"
            })

          }

        } catch (error) {
          setLoading(false);
          console.log(error);
        }

      }

    })
  }




  /// dropdown Data fetching

  const FetchBranchDropdown = async () => {
    try {

      const alldata = { id: 0, branchName: '', createdby: 0, updateby: 0, mode: 'S' }
      const response = await axios.post(`${API_URL}/BranchMaster`, alldata)

      if (response.status === 200) {
        SetBranchDropDown(response.data)
      }

    } catch (err) {

      console.log(err);
    }
  }


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

  const ValidationFetch = async () => {
    try {

      const alldata = { id: 0, updateby: auth.empid, branchid: auth.branchid, mode: 'SA' }

      const response = await axios.post(`${API_URL}/userMainMasterSelect`, alldata)

      if (response.status === 200) {

        // console.log(response.data);

        SetGridData(response.data)

        SetValidationData(response.data)
      }

    } catch (err) {
      console.log(err);
    }
  }


  useEffect(() => {
    FetchRoleDropdown()
    FetchBranchDropdown()
    FetchDepartmentDropdown()
    ValidationFetch()
  }, [])



  return (
    <div>
      <CModal
        size='lg'
        alignment="center"
        backdrop='static'
        visible={editvisible}
        onClose={() => setEditvisible(false)}
        aria-labelledby="VerticallyCenteredExample">
        <CardHeader className='pro-header p-2 d-flex '>
          <h4 className='text-white'>Edit</h4>
          {/* <Link to='/branchmaster/userperusercreate'> */}
          {/* <button className='btn-close mt-1 btn-close-white' style={{marginLeft:'700px'}} ></button> */}
          {/* </Link> */}
        </CardHeader>
        <CModalBody>
          <CCardBody>
            <CRow>
              <CCol md={6}>
                <div className="mb-3">
                  <CFormLabel htmlFor="empid">Emp ID  <span style={{ color: 'red' }}>*</span></CFormLabel>
                  <CFormInput
                    type="text"
                    id='Emp ID'
                    placeholder="Emp ID"
                    onChange={(e) => SetUpdateUserregister({ ...UpdateUserregister, employeecode: e.target.value })}
                    value={UpdateUserregister.employeecode}
                    disabled={loading} // Disable input during loading
                  />
                </div>
              </CCol>
              <CCol md={6}>
                <div className="mb-3">
                  <CFormLabel htmlFor="empname">Employee Name  <span style={{ color: 'red' }}>*</span></CFormLabel>
                  <CFormInput
                    type="text"
                    id='empname'
                    placeholder="Employee Name"
                    onChange={(e) => SetUpdateUserregister({ ...UpdateUserregister, employeename: e.target.value })}
                    value={UpdateUserregister.employeename}
                    disabled={loading} // Disable input during loading
                  />
                </div>
              </CCol>
              <CCol md={6}>
                <div className="mb-3">
                  <CFormLabel htmlFor="Email">Email  <span style={{ color: 'red' }}>*</span></CFormLabel>
                  <CFormInput
                    type="email"
                    id='Email'
                    placeholder="example@gmail.com"
                    onChange={(e) => SetUpdateUserregister({ ...UpdateUserregister, email: e.target.value })}
                    value={UpdateUserregister.email}
                    disabled={loading} // Disable input during loading
                  />
                </div>
              </CCol>
              <CCol md={6}>
                <CFormLabel className='me-3' htmlFor="doj">Date of Joining  <span style={{ color: 'red' }}>*</span></CFormLabel>
                <div>
                  <DatePicker
                    animations={[transition()]}
                    render={<InputIcon className="form-control " placeholder="Date of Joining" />}
                    value={new Date(UpdateUserregister.dateofjoin)}
                    disabled={loading} // Disable input during loading
                    maxDate={new Date()}
                    onChange={(date) => {
                      const formattedDate = date.format('YYYY/MM/DD')
                      SetUpdateUserregister({ ...UpdateUserregister, dateofjoin: formattedDate })
                      console.log(formattedDate)
                    }}
                  />
                </div>
              </CCol>

              <CCol md={6}>
                <CFormLabel htmlFor="status">Branch  <span style={{ color: 'red' }}>*</span></CFormLabel>
                <CFormSelect
                  aria-label="Default select example"
                  options={['Select Branch Name',
                    ...BranchDropDown.map(option => ({ label: option.branchName, value: option.branchid }))]}
                  onChange={(e) => SetUpdateUserregister({ ...UpdateUserregister, Branch: e.target.value })}
                  value={UpdateUserregister.Branch}
                  disabled={loading} // Disable input during loading
                />
              </CCol>
              <CCol md={6}>
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
              <CCol md={6}>
                <CFormLabel htmlFor="department">Department<span style={{ color: 'red' }}>*</span></CFormLabel>
                {/* <CFormSelect
                  aria-label="Default select example"
                  options={['Select Department Name',
                    ...DepartmentDropDownData.map(option => ({ label: option.departmentname, value: option.departmentid }))]}
                  onChange={(e) => SetUpdateUserregister({ ...UpdateUserregister, department: e.target.value })}
                  value={UpdateUserregister.department}
                  disabled={loading} // Disable input during loading
                /> */}
                <Typeahead
                  ref={PartRef1}
                  id="basic-typeahead-single"
                  options={DepartmentDropDownData}

                  /* 🔥 IMPORTANT FIX */
                  labelKey={(option) => option.Department || ''}

                  placeholder="Select Department"
                  clearButton
                  multiple={false}

                  onChange={(selected) => {
                    if (selected.length > 0) {
                      SetUpdateUserregister({
                        ...UpdateUserregister,
                        department: selected[0].DepartmentID
                      });
                    } else {
                      SetUpdateUserregister({
                        ...UpdateUserregister,
                        department: ''
                      });
                    }
                  }}

                  selected={
                    UpdateUserregister.department
                      ? DepartmentDropDownData.filter(
                        item => item.DepartmentID === UpdateUserregister.department
                      )
                      : []
                  }
                />



              </CCol>
            </CRow>
          </CCardBody>
        </CModalBody>

        <CModalFooter>
          <div className='m-2 d-flex justify-content-end'>
            <CButton
              className="mx-2"
              type="button"
              disabled={loading}
              onClick={() => setEditvisible(false)}
              style={{
                background: "linear-gradient(135deg, #ff4d4d, #cc0000)",
                color: "#fff",
                padding: "8px 20px",
                fontWeight: 600,
                borderRadius: "10px",
                border: "none",
                transition: "all 0.3s ease",
                boxShadow: "0px 3px 8px rgba(0,0,0,0.15)"
              }}
              onMouseEnter={(e) => (e.target.style.boxShadow = "0px 6px 15px rgba(255,0,0,0.4)")}
              onMouseLeave={(e) => (e.target.style.boxShadow = "0px 3px 8px rgba(0,0,0,0.15)")}
            >
              Close
            </CButton>

            <CButton
              type="button"
              disabled={loading}
              onClick={handleupdate}
              style={{
                background: "linear-gradient(135deg, #28a745, #1d7a32)",
                color: "#fff",
                padding: "8px 20px",
                fontWeight: 600,
                borderRadius: "10px",
                border: "none",
                transition: "all 0.3s ease",
                boxShadow: "0px 3px 8px rgba(0,0,0,0.15)"
              }}
              onMouseEnter={(e) => (e.target.style.boxShadow = "0px 6px 15px rgba(0,150,50,0.4)")}
              onMouseLeave={(e) => (e.target.style.boxShadow = "0px 3px 8px rgba(0,0,0,0.15)")}
            >
              Update
            </CButton>

          </div>
        </CModalFooter>

      </CModal>


      {/* <CNavItem className="label-print-nav">
          <CNavLink
            href="/#/branchmaster/userperusercreate"
            active={activeKey === 1}
            onClick={() => {
              setActiveKey(1)
            }}
          >
            Create Admin
          </CNavLink>
        </CNavItem> */}
      {/* <CNavItem className="label-print-nav text-dark"> */}
      {/* <CNavLink
            href="/#/branchmaster/userperusercreate"
            active={activeKey === 2}
            onClick={() => {
              setActiveKey(2)
              ValidationFetch()
            }}
          >
            Admin Details
          </CNavLink> */}
      {/* </CNavItem> */}


      {/* <CTabPane role="tabpanel" aria-labelledby="profile-tab" visible={activeKey === 1}> */}
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


      <CCard className="mb-3">
        <CCardHeader className=" text-white pro-header p-2"  style={{ background: '#106FB2' }}><h3 className='text-white' >    <CIcon className="me-1  mt-1" style={{ marginLeft: '600px' }}  size={'xl'} icon={cilUserPlus} /> Add Admin</h3></CCardHeader>
        <CCardBody className='mt-3'>
          <CRow>
            <CCol md={3}>
              <div className="mb-3">
                <CFormLabel htmlFor="empid">Emp ID  <span style={{ color: 'red' }}>*</span></CFormLabel>
                <CFormInput
                  type="text"
                  id='Emp ID'
                  placeholder="Emp ID"
                  onChange={(e) => setNewUserregister({ ...NewUserregister, employeecode: e.target.value })}
                  value={NewUserregister.employeecode}
                  disabled={loading} // Disable input during loading
                />
              </div>
            </CCol>
            <CCol md={3}>
              <div className="mb-3">
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
              <div className="mb-3">
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
            <CCol md={3}>
              <CFormLabel className='me-3' htmlFor="doj">Date of Joining  <span style={{ color: 'red' }}>*</span></CFormLabel>
              <div>
                <DatePicker
                  animations={[transition()]}
                  maxDate={new DateObject()}
                  render={<InputIcon className="form-control" placeholder="Date of Joining" />}
                  value={dojDate}
                  disabled={loading} // Disable input during loading
                  onChange={(dateObj) => {
                    setDojDate(dateObj);
                   if (dateObj) {
                      const formattedDate = dateObj.format("YYYY/MM/DD")
                      setNewUserregister({
                        ...NewUserregister,
                        dateofjoin: formattedDate,
                      })
                      console.log("Selected:", formattedDate)
                    } else {
                      setNewUserregister({ ...NewUserregister, dateofjoin: "" })
                    }
                  }}
                />
              </div>
            </CCol>

            <CCol md={3}>
              <CFormLabel htmlFor="status">Branch  <span style={{ color: 'red' }}>*</span></CFormLabel>
              <CFormSelect
                aria-label="Default select example"
                options={['Select Branch Name',
                  ...BranchDropDown.map(option => ({ label: option.branchName, value: option.branchid }))]}
                onChange={(e) => setNewUserregister({ ...NewUserregister, Branch: e.target.value })}
                value={NewUserregister.Branch}
                disabled={loading} // Disable input during loading
              />
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
            <CCol md={3} className=''>
              <CFormLabel htmlFor="department">Department<span style={{ color: 'red' }} className='ms-2'>*</span></CFormLabel>
              {/* <CFormSelect
                    aria-label="Default select example"
                    options={['Select Department Name',
                      ...DepartmentDropDownData.map(option => ({ label: option.departmentname, value: option.departmentid }))]}
                    onChange={(e) => setNewUserregister({ ...NewUserregister, department: e.target.value })}
                    value={NewUserregister.department}
                    disabled={loading} // Disable input during loading
                  /> */}
              <Typeahead
                ref={PartRef1}
                id="department-typeahead"
                labelKey="Department"
                multiple={false}
                clearButton
                options={DepartmentDropDownData}
                placeholder="Select Department"
                onChange={(selected) => {
                  if (selected.length > 0) {
                    setNewUserregister({
                      ...NewUserregister,
                      department: selected[0].DepartmentID
                    });
                  } else {
                    setNewUserregister({
                      ...NewUserregister,
                      department: ''
                    });
                  }
                }}
                selected={
                  NewUserregister.department
                    ? DepartmentDropDownData.filter(
                      item => item.DepartmentID === NewUserregister.department
                    )
                    : []
                }
              />


            </CCol>
          </CRow>
          <div className='mb-2 me-2 d-flex justify-content-end'>
            <CButton className="mx-2 btn-hover-effect" variant='outline' type="submit" color="danger" onClick={() => {
              setNewUserregister({
                employeecode: "",
                employeename: "",
                email: "",
                dateofjoin: dojDate,
                UserStatus: 'A',
                userrole: null,
                department: null,
                Branch: auth.branchid,
              })
            }}>
              <CIcon icon={cilDelete} /> Clear
            </CButton>
            <CButton type="submit" color="primary" variant='outline' className='btn-hover-effect' disabled={loading} onClick={handleAddemployee}>
              <CIcon icon={cilPlus} /> Add
            </CButton>
          </div >
        </CCardBody>
      </CCard>

      {/* </CTabPane> */}
      {/* <CTabPane role="tabpanel" aria-labelledby="profile-tab" visible={activeKey === 2}> */}
      <div className="ag-theme-quartz mt-3 " style={{ height: 400 }}>
        <AgGridReact
          rowData={GridData}
          columnDefs={colmun}
          defaultColDef={defaultColDef}
          //onGridReady={onGridReady}
          rowSelection="multiple"
          pagination={true}
          paginationPageSize={10}
          paginationPageSizeSelector={[10, 15, 20]}
          getRowHeight={() => 55}
        />
      </div>
      {/* </CTabPane> */}

    </div>
  )
}
Superusercreate.propTypes = {
  auth: PropTypes.any.isRequired,
};
export default Superusercreate