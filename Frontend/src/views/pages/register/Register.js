import React, { useState } from "react";
import {
  CButton,
  CCard,
  CCardBody,
  CCol,
  CContainer,
  CForm,
  CFormInput,
  CInputGroup,
  CInputGroupText,
  CRow,
} from "@coreui/react";
import CIcon from "@coreui/icons-react";
import { cilCalendar, cilEnvelopeClosed, cilLockLocked, cilUser } from "@coreui/icons";
// import Logo1 from "../../../assets/images/bsl.png";
import Logo1 from "../../../assets/images/Apple_logo.png";

import { useNavigate } from "react-router-dom";
import DatePicker from 'react-multi-date-picker';
import transition from "react-element-popper/animations/transition"
import InputIcon from "react-multi-date-picker/components/input_icon"
const Register = () => {
  const [dojDate, setdojDate] = useState(new Date());
  const navigate = useNavigate();
  const handleLogin = async () => {
    navigate("/login");
  };
  return (
    <div className="bg-image min-vh-100 d-flex flex-row align-items-center">
      <CContainer>
        <CRow className="justify-content-center">
          <CCol md={9} lg={7} xl={6}>
            <CCard className="mx-4">
              <CCardBody className="p-4">
                <div className="text-center">
                  <img src={Logo1}  width={300} alt="Logo" />
                </div>
                <h1 className="text-center">Forgot Password</h1>
                <CForm className="m-5">

                
                  <CInputGroup className="mb-3">
                    <CInputGroupText>
                      <CIcon icon={cilUser} size="xl"/>
                    </CInputGroupText>
                    <CFormInput
                      placeholder="User Name"
                      autoComplete="username"
                    />
                  </CInputGroup>
                  <CInputGroup className="mb-3 ">
                    <CInputGroupText>
                      <CIcon icon={cilCalendar} size="xl" />
                    </CInputGroupText>
                    <DatePicker
                         
                            animations={[transition()]}
                            render={<InputIcon className="form-control" />}
                            value={dojDate}
                          />
                  </CInputGroup>
                  <CInputGroup className="mb-3">
                    <CInputGroupText>
                       <CIcon icon={cilEnvelopeClosed} size="xl" />
                    </CInputGroupText>
                    <CFormInput placeholder="Email" autoComplete="email" />
                  </CInputGroup>

                  <div className="d-grid">
                    <CButton color="primary" onClick={handleLogin}>
                     Verify
                    </CButton>
                  </div>
                </CForm>
              </CCardBody>
            </CCard>
          </CCol>
        </CRow>
      </CContainer>
    </div>
  );
};

export default Register;
