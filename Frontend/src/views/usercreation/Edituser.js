import React, { useState, useEffect, useRef } from "react";
import swal from 'sweetalert';
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
  CFormSelect
} from '@coreui/react';

import { cilPencil, cilPlus, cilDelete } from "@coreui/icons";
import CIcon from '@coreui/icons-react';

const Edituser = () => {
  const [dojDate, setDojDate] = useState(new Date());




  return (
    <>
      <CRow className='mb-3'>
        <div className="d-flex">
          <CIcon className="me-2" size={'xxl'} icon={cilPencil} />
          <h3> Edit User</h3>
        </div>
      </CRow>
      <CCard className="mb-3">
        <CCardHeader className="bg-dark text-light">Personal Information</CCardHeader>
        <CCardBody>
          <CRow>
            <CCol md={6}>
              <div className="mb-3">
                <CFormLabel htmlFor="empid">Emp ID  <span style={{ color: 'red' }}>*</span></CFormLabel>
                <CFormInput
                  type="text"
                  id='Emp ID'
                  placeholder="Emp ID"
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

                />
              </div>
            </CCol>
            <CCol md={6}>

              <CFormLabel className='me-3' htmlFor="doj">Date of Joining  <span style={{ color: 'red' }}>*</span></CFormLabel>
              <div>
                <DatePicker
                  animations={[transition()]}
                  render={<InputIcon className="form-control" />}
                  value={dojDate}
                />
              </div>
            </CCol>
            <CCol md={6}>
              <CFormLabel htmlFor="status">Status  <span style={{ color: 'red' }}>*</span></CFormLabel>
              <CFormSelect
                aria-label="Default select example"
                options={[
                  'Status',
                ]}
              />
            </CCol>
            <CCol md={6}>
              <CFormLabel htmlFor="userrole">User Role  <span style={{ color: 'red' }}>*</span></CFormLabel>
              <CFormSelect
                aria-label="Default select example"
                options={[
                  'User Role',
                ]}
              />
            </CCol>
            <CCol md={6}>
              <CFormLabel htmlFor="department">Department<span style={{ color: 'red' }}>*</span></CFormLabel>
              <CFormSelect
                aria-label="Default select example"
                options={[
                  'Department',
                ]}
              />
            </CCol>
          </CRow>
        </CCardBody>
      </CCard>
      <div className='m-2 d-flex justify-content-end'>
        <CButton className="mx-2" type="clear" color="danger">
          <CIcon icon={cilDelete} /> CLEAR
        </CButton>
        <CButton type="submit" color="success">
          <CIcon icon={cilPlus} /> UPDATE
        </CButton>
      </div>








          </>
          )
}

          export default Edituser