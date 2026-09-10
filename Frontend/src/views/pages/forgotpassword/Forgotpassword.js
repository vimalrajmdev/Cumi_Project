import React, { useState } from "react";
import {
  CButton,
  CCard,
  CCardBody,
  CCardGroup,
  CCol,
  CContainer,
  CForm,
  CFormInput,
  CFormLabel,
  CInputGroup,
  CInputGroupText,
  CModal,
  CModalBody,
  CModalFooter,
  CModalHeader,
  CRow,
} from "@coreui/react";
import CIcon from "@coreui/icons-react";
import { cilCalendar, cilChevronDoubleRight, cilEnvelopeClosed, cilExitToApp, cilLockLocked, cilUser } from "@coreui/icons";
// import Logo1 from "../../../assets/images/bsl.png";
import Logo1 from "../../../assets/images/Apple_logo.png";

import { useNavigate } from "react-router-dom";
import DatePicker from 'react-multi-date-picker';
import transition from "react-element-popper/animations/transition"
import InputIcon from "react-multi-date-picker/components/input_icon"
import axios from "axios";
// simport swal from "sweetalert";
import { RotatingLines } from "react-loader-spinner";
import { getConfig } from 'src/config';
const Forgotpassword = () => {
  const [dojDate, setdojDate] = useState();
  const [editvisible, setEditvisible] = useState(false)
  const API_URL = getConfig().REACT_APP_API_URL;
  const [forgetPasswordData, SetforgetPasswordData] = useState({
    usercode: '',
    dateofjoin: '',
    email: ''
  })


  const [loading, setLoading] = useState(false); // Loader state

  const navigate = useNavigate();
  const handleLogin = async () => {
    navigate("/dashboard");
  };

  const handleforgotpassword = async () => {


    if (forgetPasswordData.usercode === '') {
      swal({
        text: 'Please Enter User Code ',
        icon: 'warning'
      })
      return
    }

    if (forgetPasswordData.dateofjoin === '') {
      swal({
        text: 'Please Enter Date Of Join ',
        icon: 'warning'
      })
      return
    }
    if (forgetPasswordData.email === '') {
      swal({
        text: 'Please Enter Your Email Id ',
        icon: 'warning'
      })
      return
    }

    try {

      setLoading(true)

      const response = await axios.post(`${API_URL}/forgotpassword`, forgetPasswordData)

      navigate('/')
      if (response.status === 200) {
        swal({
          text: response.data.message,
          icon: 'success'
        });

        setLoading(false)
      }

    } catch (err) {
      console.log(err);
      swal({
        text: `${err.response.data.error}`,
        icon: 'error'
      });
      setLoading(false)
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

      <CModal
        size='md'
        alignment="center"
        visible={editvisible}
        onClose={() => setEditvisible(false)}
        aria-labelledby="VerticallyCenteredExample">

        <CModalBody>
          <CForm className="m-5">
            <div className="text-center ">
              <img src={Logo1} alt="Logo" className="" />
            </div>
            <h3 className="mb-5 text-center"></h3>
            <CInputGroup className="mb-3">
              <CInputGroupText>
                <CIcon icon={cilUser} />
              </CInputGroupText>
              <CFormInput
                placeholder="UserCode"
                autoComplete="UserCode"
              />
            </CInputGroup>
            <CInputGroup className="mb-4">
              <CInputGroupText>
                <CIcon icon={cilLockLocked} />
              </CInputGroupText>
              <CFormInput
                type="password"
                placeholder="Temp Password"
                autoComplete="current-password"
              />
            </CInputGroup>
          </CForm>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setEditvisible(false)}>
            CANCEL
          </CButton>
          <CButton color="primary" onClick={handleLogin} > LOGIN</CButton>
        </CModalFooter>
      </CModal>


      <div className="min-vh-100 d-flex flex-row align-items-center LoginBackground">
        <CContainer className="">
          <CRow className="justify-content-center">
            <CCol xxl={5} xl={6} lg={7} md={9} sm={12}>
              <CCardGroup className="content">
                <CCard className="custom-shadow">
                  <CCardBody className="mx-sm-0 mx-md-4 mx-5">
                    <div >
                      <img src={Logo1} width={300} alt="Logo" className="mx-auto d-block" />
                    </div>
                    <div className="mt-3 text-start">
                      <h4 className="text-center text-primary">Forgot Password</h4>
                      {/* <small className="mt-2">User Name:</small> */}
                      <CInputGroup className="mt-4">
                        <CInputGroupText className="bg-primary text-white">
                          <CIcon icon={cilUser} size="xl" />
                        </CInputGroupText>
                        <CFormInput
                          placeholder="User ID"
                          autoComplete="UserCode"
                          onChange={(e) => SetforgetPasswordData({ ...forgetPasswordData, usercode: e.target.value })}
                        />
                      </CInputGroup>
                      {/* <small className="mt-2">Date of Joining:</small> */}
                      <CInputGroup className="d-flex mt-4">
                        <CInputGroupText className="bg-primary text-white">
                          <CIcon icon={cilCalendar} size="xl" />
                        </CInputGroupText>
                        <DatePicker
                          animations={[transition()]}
                          render={<InputIcon className="form-control col-12 " placeholder="Select DOJ" />} // Add placeholder here
                          value={dojDate}
                          containerStyle={{ width: '87%' }}
                          onChange={(date) => {
                            const formattedDate = date.format('YYYY-MM-DD')
                            SetforgetPasswordData({ ...forgetPasswordData, dateofjoin: formattedDate })
                          }}
                        />

                      </CInputGroup>
                      {/* <small className="mt-2">Email:</small> */}
                      <CInputGroup className="mt-4">
                        <CInputGroupText className="bg-primary text-white">
                          <CIcon icon={cilEnvelopeClosed} size="xl" />
                        </CInputGroupText>
                        <CFormInput
                          placeholder="Email"
                          autoComplete="email"
                          onChange={(e) => SetforgetPasswordData({ ...forgetPasswordData, email: e.target.value })}
                        />
                      </CInputGroup>
                    </div>

                    <div className="mx-2">
                      <CRow className="mt-5 mb-2">
                        <CButton
                          type="submit" color="primary"
                          variant="outline"
                          className="px-2"
                          onClick={handleforgotpassword}
                        >
                          <CIcon icon={cilChevronDoubleRight} /> SEND PASSWORD
                        </CButton>
                      </CRow>
                    </div>

                  </CCardBody>

                </CCard>
              </CCardGroup>

            </CCol>
          </CRow>
        </CContainer>
      </div>



    </>

  );
};

export default Forgotpassword;
