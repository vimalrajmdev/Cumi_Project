import React, { useState } from 'react';
import { CAccordion, CAccordionBody, CAccordionHeader, CAccordionItem, CButton, CCard, CCardBody, CCardImage, CCol, CForm, CFormCheck, CFormInput, CFormLabel, CInputGroup, CInputGroupText, CLink, CModal, CModalBody, CModalHeader, CModalTitle, CNav, CNavItem, CNavLink, CRow, CTabContent, CTabPane, CTable, CTableBody, CTableDataCell, CTableHead, CTableHeaderCell, CTableRow, CTooltip } from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilHappy, cilLockLocked, cilPowerStandby, cilUser } from '@coreui/icons';
import profile_img from '../../assets/images/avatars/11.png';
// import Logo1 from "../../assets/images/bsl.png";
import Logo1 from "../../assets/images/Apple_logo.png";
import swal from 'sweetalert';
import { RotatingLines } from 'react-loader-spinner';
import PropTypes from 'prop-types'; // Import PropTypes
import "../css/loader.css"
import axios from 'axios';
import { getConfig } from 'src/config';
const Digitalprofile = ({ auth }) => {
  const [activeKey, setActiveKey] = useState(1);
  const [editvisible, setEditvisible] = useState(false);
  const [loading, setLoading] = useState(false); // Loader state
  const API_URL = getConfig().REACT_APP_API_URL;
  const [changepasswordData, SetchangepasswordData] = useState({
    usercode: '',
    oldpassword: '',
    newpassword: '',
    confirmpassword: ''
  });

  function checkPassword(str) {
    const lengthCheck = /^.{8,}$/;
    const digitCheck = /^(?=.*\d)/;
    const specialCharCheck = /^(?=.*[!@#$%^&*])/;
    const lowercaseCheck = /^(?=.*[a-z])/;
    const uppercaseCheck = /^(?=.*[A-Z])/;

    if (!lengthCheck.test(str)) {
      swal({
        text: 'Password must be exactly 8 characters long.',
        icon: 'warning'
      });
      return false;
    }
    if (!digitCheck.test(str)) {
      swal({
        text: 'Password must contain at least one digit.',
        icon: 'warning'
      });
      return false;
    }
    if (!specialCharCheck.test(str)) {
      swal({
        text: 'Password must contain at least one special character.',
        icon: 'warning'
      });
      return false;
    }
    if (!lowercaseCheck.test(str)) {
      swal({
        text: 'Password must contain at least one lowercase letter.',
        icon: 'warning'
      });
      return false;
    }
    if (!uppercaseCheck.test(str)) {
      swal({
        text: 'Password must contain at least one uppercase letter.',
        icon: 'warning'
      });
      return false;
    }

    return true;
  }


  const handleChangepassword = async () => {
    if (changepasswordData.usercode === '') {
      swal({
        text: 'Please Enter Usercode',
        icon: 'warning'
      });
      return;
    }

    if (changepasswordData.oldpassword === '') {
      swal({
        text: 'Please Enter Your old Password',
        icon: 'warning'
      });
      return;
    }

    if (changepasswordData.newpassword === '') {
      swal({
        text: 'Please Enter Your New Password',
        icon: 'warning'
      });
      return;
    }

    if (changepasswordData.confirmpassword === '') {
      swal({
        text: 'Please Enter Your Confirm Password',
        icon: 'warning'
      });
      return;
    }

    if (changepasswordData.oldpassword === changepasswordData.newpassword) {
      swal({
        text: 'Old Password and New Password are the same. Please choose a different New Password.',
        icon: 'warning'
      });
      return;
    }

    if (changepasswordData.newpassword !== changepasswordData.confirmpassword) {
      swal({
        text: 'New Password and Confirm Password do not match',
        icon: 'warning'
      });
      return;
    }

    if (!checkPassword(changepasswordData.confirmpassword)) {
      return;
    }


    setLoading(true); // Show loader

    try {

      const response = await axios.post(`${API_URL}/changepassword`, changepasswordData)

      if (response.status === 200) {
        setLoading(false);
        setEditvisible(false);
        swal({
          text: `${response.data.message}`,
          icon: 'success'
        });
      }

      SetchangepasswordData({ ...changepasswordData, usercode: '', oldpassword: '', newpassword: '', confirmpassword: '' })

    } catch (err) {
      console.log(err);
      setLoading(false);
      swal({
        text: `${err.response.data.error}`,
        icon: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handlechangepasswordModal = async () => {
    setEditvisible(true);
  };

  const handleClear = () => {
    SetchangepasswordData({
      usercode: '',
      oldpassword: '',
      newpassword: '',
      confirmpassword: ''
    });
  };

  return (
    <>
      {/* 🔄 Loader Overlay */}
      {loading && (
        <div className="loading-overlay d-flex justify-content-center align-items-center">
          <RotatingLines
            visible={true}
            height="80"
            width="80"
            color="#0d6efd"
            strokeWidth="5"
            animationDuration="0.75"
            ariaLabel="rotating-lines-loading"
          />
        </div>
      )}

      {/* 🔐 Change Password Modal */}
      <CModal
        size="md"
        backdrop="static"
        alignment="center"
        visible={editvisible}
        onClose={() => setEditvisible(false)}
      >
        <CModalHeader className="fw-bold text-white fs-5 pro-header p-2">
          🔐 Change Your Password
        </CModalHeader>
        <CModalBody>
          <CForm className="px-4">
            <div className="text-center mb-3">
              <img src={Logo1} width={180} alt="Logo" />
            </div>

            <CInputGroup className="mb-3">
              <CInputGroupText className="bg-dark text-white">
                <CIcon icon={cilUser} size="lg" />
              </CInputGroupText>
              <CFormInput
                placeholder="User ID"
                value={changepasswordData.usercode}
                onChange={(e) =>
                  SetchangepasswordData({ ...changepasswordData, usercode: e.target.value })
                }
                disabled={loading}
              />
            </CInputGroup>

            <CInputGroup className="mb-3">
              <CInputGroupText className="bg-dark text-white">
                <CIcon icon={cilLockLocked} size="lg" />
              </CInputGroupText>
              <CFormInput
                type="password"
                placeholder="Old Password"
                value={changepasswordData.oldpassword}
                onChange={(e) =>
                  SetchangepasswordData({ ...changepasswordData, oldpassword: e.target.value })
                }
                disabled={loading}
              />
            </CInputGroup>

            <CInputGroup className="mb-3">
              <CInputGroupText className="bg-dark text-white">
                <CIcon icon={cilLockLocked} size="lg" />
              </CInputGroupText>
              <CFormInput
                type="password"
                placeholder="New Password"
                value={changepasswordData.newpassword}
                onChange={(e) =>
                  SetchangepasswordData({ ...changepasswordData, newpassword: e.target.value })
                }
                disabled={loading}
              />
            </CInputGroup>

            <CInputGroup className="mb-4">
              <CInputGroupText className="bg-dark text-white">
                <CIcon icon={cilLockLocked} size="lg" />
              </CInputGroupText>
              <CFormInput
                type="password"
                placeholder="Confirm Password"
                value={changepasswordData.confirmpassword}
                onChange={(e) =>
                  SetchangepasswordData({ ...changepasswordData, confirmpassword: e.target.value })
                }
                disabled={loading}
              />
            </CInputGroup>

            <div className="d-flex justify-content-between">
              <CButton color="secondary" variant="outline" onClick={handleClear} disabled={loading}>
                Clear
              </CButton>
              <CButton color="primary" variant="outline"  onClick={handleChangepassword} disabled={loading}>
                Submit
              </CButton>
            </div>
          </CForm>
        </CModalBody>
      </CModal>

      {/* 👤 Profile Section */}
      <div className="p-3">
        <CRow className="justify-content-center">
          <CCol md={4}>
            <CCard className="shadow-lg border-0 rounded-4 overflow-hidden text-center">
              <div className="position-relative">
                <CCardImage src={profile_img} />
                <span className="position-absolute top-0 start-0 badge rounded-pill bg-light text-dark m-3 fs-6">
                  {auth?.usercode}
                </span>
              </div>
              <CCardBody>
                <h5 className="fw-bold text-dark">{auth?.employeename}</h5>
                <p className="text-muted mb-1">Joined on {new Date(auth?.DateofJoining).toDateString()}</p>
                <span className="badge bg-primary text-uppercase mb-2">{auth?.userrole}</span>
                {auth?.UserStatus !== 'SA' && (
                  <p className="text-danger fw-bold text-uppercase">
                    <span className="text-muted">Branch:</span> {auth?.branchName}
                  </p>
                )}
                <hr />
                <div className="text-start px-4">
                  <p><strong>Email:</strong> {auth?.email}</p>
                  <p><strong>Department:</strong> {auth?.departmentname}</p>
                </div>
              </CCardBody>
            </CCard>
          </CCol>

          {/* ⚙️ Settings Panel */}
          <CCol md={7}>
            <div className="border-bottom border-3 border-primary mb-3 d-flex align-items-center">
              {/* <CIcon className="me-2 text-dark" size="xl" icon={cilHappy} /> */}
              <h4 className="mb-0 fw-bold text-dark">😁 My Profile Settings</h4>
            </div>

            <CNav variant="tabs" role="tablist" className="mb-3">
              <CNavItem>
                <CNavLink
                  active={activeKey === 1}
                  onClick={() => setActiveKey(1)}
                  disabled={loading}
                >
                  ⚙️ Settings
                </CNavLink>
              </CNavItem>
            </CNav>

            <CTabContent>
              <CTabPane visible={activeKey === 1}>
                <CAccordion className="my-4">
                  <CAccordionItem itemKey={1}>
                    <CAccordionHeader>Change Password</CAccordionHeader>
                    <CAccordionBody className="d-flex justify-content-between align-items-center">
                      <span>Want to update your password?</span>
                      <CButton color="dark" size="sm" onClick={handlechangepasswordModal} disabled={loading}>
                        Change Password
                      </CButton>
                    </CAccordionBody>
                  </CAccordionItem>
                </CAccordion>
              </CTabPane>
            </CTabContent>
          </CCol>
        </CRow>
      </div>

      {/* 🧭 Styles */}
      {/* <style jsx="true">{`
        .loading-overlay {
          position: fixed;
          top: 0; left: 0;
          width: 100%; height: 100%;
          background: rgba(255,255,255,0.7);
          z-index: 2000;
        }
        .loading-spinner {
          position: absolute;
          top: 50%; left: 50%;
          transform: translate(-50%, -50%);
        }
      `}</style> */}
    </>
  );
};

Digitalprofile.propTypes = {
  auth: PropTypes.any.isRequired,
};



export default Digitalprofile;
