import React, { useState, useEffect, useRef } from "react";
import swal from 'sweetalert';
// import DatePicker from "react-datepicker";
import DatePicker from "react-multi-date-picker"
import transition from "react-element-popper/animations/transition"
import InputIcon from "react-multi-date-picker/components/input_icon"
import { useNavigate } from "react-router-dom";
import {
  CButton,
  CFormLabel,
  CFormInput,
  CRow,
  CCol,
  CCard,
  CCardHeader,
  CCardBody,
  CFormSelect,
  CProgress,
  CProgressBar
} from '@coreui/react';

import { cilUserPlus, cilPlus, cilDelete, cilCalculator } from "@coreui/icons";
import CIcon from '@coreui/icons-react';
import axios from "axios";
import { RotatingLines } from 'react-loader-spinner';
import PropTypes from 'prop-types'; // Import PropTypes
import { Typeahead } from "react-bootstrap-typeahead";
import { getConfig } from 'src/config';
import "react-bootstrap-typeahead/css/Typeahead.css";

const Adduser = ({ auth }) => {
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

  const handleClear = () => {
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
    setDojDate(null); // Clear the date picker value
  };

  // console.log(NewUserregister);

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  };



  //// new employee create

  const handleAddemployee = async () => {



    if (NewUserregister.employeecode == '') {
      swal({
        text: "Please Enter Employeecode",
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
        text: "This Employee Code is Already Exitsing",
        icon: "warning"
      });
      return;
    }

    if (NewUserregister.employeename == '') {
      swal({
        text: "Please Enter Employee Name",
        icon: "warning",
      })

      return
    }

    // const isValidEmployeeName = ValidationData.some((item) => {
    //   return (
    //     item.employeename.toLowerCase() === NewUserregister.employeename.toLowerCase()
    //   )
    // })
    // if (isValidEmployeeName) {
    //   swal({
    //     text: "This EmployeeName is Already Exitsing",
    //     icon: "warning"
    //   });
    //   return;
    // }


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

    if (NewUserregister.UserStatus == '') {
      swal({
        text: "Please Enter Employee Status",
        icon: "warning",
      })

      return
    }

    if (NewUserregister.dateofjoin == '') {
      swal({
        text: "Please Enter Employee dateofjoin",
        icon: "warning",
      })

      return
    }

    try {

      setLoading(true)

      const alldata = { ...NewUserregister, id: '', createdby: auth.empid, updateby: '', branchid: auth.branchid, mode: 'I' }

      const response = await axios.post(`${API_URL}/UserMainmasterRegister`, alldata)

      if (response.status === 200) {
        swal({
          text: `${response.data.message}`,
          icon: 'success'
        })
        setLoading(false)
        setNewUserregister({ ...NewUserregister, employeecode: '', employeename: '', email: '', UserStatus: '', userrole: '', department: '', branchName: '', dateofjoin: '' })
        if (PartRef1.current) {
          PartRef1.current.clear()
        }
      }

      if (response.status === 500) {
        setLoading(false)
        swal({
          text: `${response.data.message}`,
          icon: 'warning'
        })
        setNewUserregister({ ...NewUserregister, employeecode: '', employeename: '', email: '', UserStatus: '', userrole: '', department: '', dateofjoin: '', branchName: '' })
        setDojDate(null)
      }



    } catch (err) {
      console.log(err);
      setLoading(false)
    }






  }






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

      const alldata = { id: 0, updateby: auth.empid, branchid: auth.branchid, mode: 'S' }

      const response = await axios.post(`${API_URL}/userMainMasterSelect`, alldata)

      if (response.status === 200) {
        SetValidationData(response.data)
      }
    } catch (err) {
      console.log(err);
    }
  }

  const [BranchDropDown, SetBranchDropDown] = useState([])

  const FetchBranchDropdown = async () => {
    try {

      const alldata = { id: 0, branchName: '', createdby: 0, updateby: 0, mode: 'S', branchid: auth.branchid, BranchAccess: auth.BranchAccess }
      const response = await axios.post(`${API_URL}/BranchMaster`, alldata)

      if (response.status === 200) {
        SetBranchDropDown(response.data)
        // console.log('====================================');
        // console.log('response.data',response.data);
        // console.log('====================================');
      }

    } catch (err) {

      console.log(err);
    }
  }

  useEffect(() => {
    FetchRoleDropdown();
    FetchDepartmentDropdown();
    ValidationFetch();
    FetchBranchDropdown();
  }, [])

  const status = [{ lable: 'Active', value: 'A' }, { lable: 'InActive', value: 'I' }]
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
    const selectedIds = selectedBranches
      .filter(item => item.branchid !== auth.branchid)
      .map(item => item.branchid);

    // Always include default branch at front
    const finalSelected = [authBranch, ...selectedBranches.filter(item => item.branchid !== auth.branchid)];

    setNewUserregister({
      ...NewUserregister,
      branchName: finalSelected.map(item => item.branchid).join(','),
    });
  }, [selectedBranches]);

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
      <CRow className='mb-3'>
        <div className="d-flex">
          <CIcon className="me-2" size={'lg'} icon={cilUserPlus} />
          <h5> Add User</h5>
        </div>
      </CRow>

      <CCard className="mb-3">
        <CCardHeader className="bg-dark text-light d-flex justify-content-between "><span className="mt-1">Personal Information </span>
          <i
            className="bi bi-x-lg text-white fs-4 me-2"
            style={{ cursor: 'pointer' }}
            onClick={() => navigate('/usercreation/allusers')}
          /></CCardHeader>
        <CCardBody>
          <CRow>
            <CCol md={6}>
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
            <CCol md={6}>
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
            <CCol md={6}>
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
            <CCol md={6}>
              <CFormLabel className='me-3' htmlFor="doj">Date of Joining  <span style={{ color: 'red' }}>*</span></CFormLabel>
              <div className="mb-3">
                <DatePicker
                  maxDate={new Date()}
                  animations={[transition()]}
                  render={<InputIcon className="form-control" placeholder="Date of Join" />}
                  value={NewUserregister.dateofjoin}
                  disabled={loading} // Disable input during loading
                  onChange={(date) => {
                    const formattedDate = date.format('YYYY/MM/DD')
                    setNewUserregister({ ...NewUserregister, dateofjoin: formattedDate })
                  }}
                />
              </div>
            </CCol>
            {/* <CCol md={6} className="mb-3">
              <CFormLabel htmlFor="status">Status  <span style={{ color: 'red' }}>*</span></CFormLabel>
              <CFormSelect
                aria-label="Default select example"
                options={['Status',
                  ...status.map(option => ({ label: option.lable, value: option.value }))
                ]}
                onChange={(e) => setNewUserregister({ ...NewUserregister, UserStatus: e.target.value })}
                value={NewUserregister.UserStatus}
                disabled={loading} // Disable input during loading
              />
            </CCol> */}
            <CCol md={6}>
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
            <CCol md={6}>
              <CFormLabel htmlFor="department">Department<span style={{ color: 'red' }}>*</span></CFormLabel>
              {/* <CFormSelect
                className='text-capitalize'
                aria-label="Default select example"
                options={['Select Department Name',
                  ...DepartmentDropDownData.map(option => ({ label: option.Department, value: option.DepartmentID }))]}
                onChange={(e) => setNewUserregister({ ...NewUserregister, department: e.target.value })}
                value={NewUserregister.department}

                disabled={loading} // Disable input during loading
              /> */}
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

            <CCol md={6} className="mt-3">
              <CFormLabel htmlFor="department">Branch Access<span style={{ color: 'red' }}>*</span></CFormLabel>
              {/* <Typeahead
                multiple
                id="basic-typeahead-multiple"
                labelKey="branchName"
                onChange={(selected) => {
                  const selectedIds = selected.map(item => item.branchid); // [1, 2, 3]
                  setNewUserregister({
                    ...NewUserregister,
                    branchName: selectedIds.join(','), // Save as "1,2,3"
                  });
                }}
                selected={
                  typeof NewUserregister.branchName === 'string'
                    ? (BranchDropDown?.length
                      ? BranchDropDown.filter(branch =>
                        NewUserregister.branchName.split(',').includes(branch.branchid.toString())
                      )
                      : [
                        {
                          branchid: auth.branchid,
                          branchName: auth.branchname?.toUpperCase?.() || 'DEFAULT BRANCH'
                        }
                      ])
                    : []
                }
                options={BranchDropDown?.length ? BranchDropDown : [
                  {
                    branchid: auth.branchid,
                    branchName: auth.branchname?.toUpperCase?.() || 'DEFAULT BRANCH'
                  }
                ]}
                placeholder="Select Branch(es)"
              /> */}
              <Typeahead
                multiple
                // clearButton // allows clearing all (except default, which we’ll always re-add)
                id="basic-typeahead-multiple"
                labelKey="branchName"
                options={BranchDropDown || []}
                placeholder="Select Branch(es)"
                onChange={(selected) => {
                  const authBranch =
                    BranchDropDown?.find(b => b.branchid === auth.branchid) || {
                      branchid: auth.branchid,
                      branchName: 'DEFAULT BRANCH',
                    };

                  const filtered = (selected || []).filter(
                    item => item.branchid !== auth.branchid
                  );

                  const updatedSelection = [authBranch, ...filtered];

                  const selectedIds = updatedSelection.map(item => item.branchid);

                  setNewUserregister({
                    ...NewUserregister,
                    branchName: selectedIds.join(','),
                  });
                }}
                selected={
                  (() => {
                    const selectedIds = NewUserregister.branchName?.split(',') || [];

                    const selectedBranches =
                      BranchDropDown?.filter(branch =>
                        selectedIds.includes(branch.branchid.toString())
                      ) || [];

                    const authBranch =
                      BranchDropDown?.find(b => b.branchid === auth.branchid) || {
                        branchid: auth.branchid,
                        branchName: 'DEFAULT BRANCH',
                      };

                    const alreadyIncluded = selectedBranches.some(
                      item => item.branchid === auth.branchid
                    );

                    return alreadyIncluded
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
                      title={isAuthBranch ? 'Default branch cannot be removed' : 'Click to remove'}
                    >
                      {option.branchName}
                      {!isAuthBranch && (
                        <span
                          style={{ marginLeft: 8, cursor: 'pointer' }}
                          onClick={() => onRemove(option)} // ✅ correct: pass the option (not index)
                        >
                          &times;
                        </span>
                      )}
                      {isAuthBranch && (
                        <span style={{ marginLeft: 8, fontSize: '1em', color: '#ccc' }}>🔒</span>
                      )}
                    </div>
                  );
                }}
              />
            </CCol>

            <div className='m-2 d-flex justify-content-end'>
              <CButton className="mx-2 btn-hover-effect" type='submit' color="danger" onClick={handleClear}>
                <CIcon icon={cilDelete} /> Clear
              </CButton>
              <CButton type="submit" className="btn-hover-effect" color="success" disabled={loading} onClick={handleAddemployee}>
                <CIcon icon={cilPlus} /> Add
              </CButton>
            </div >
          </CRow>
        </CCardBody>
      </CCard>



    </>
  )
}


Adduser.propTypes = {
  auth: PropTypes.any.isRequired,
};

export default Adduser