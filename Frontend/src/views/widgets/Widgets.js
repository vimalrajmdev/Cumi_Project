import React from "react";
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CLink,
  CRow,
} from "@coreui/react";
const Widgets = () => {
  return (
    <CCard className="mb-3">
      <CCardHeader>Class Details</CCardHeader>
      <CCardBody>
        <CRow className="mb-2">
          <CCol xs={12}  sm={6} lg={3}>

          </CCol>
          <CCol xs={12} sm={6} lg={2}>
            <div className="text-center mb-2">Bookings</div>
          </CCol>
          <CCol xs={12} sm={6} lg={2}>
            <div className="text-center mb-2">Reservations</div>
          </CCol>
          <CCol xs={12} sm={6} lg={2}>
            <div className="text-center mb-2">Cancellations</div>
          </CCol>
        </CRow>
        <CRow className="mb-2">
          <CCol xs={12} sm={6} lg={3}>
            <CCard className="text-center mb-2">
              <CCardBody>Classes</CCardBody>
            </CCard>
          </CCol>
          <CCol xs={12} sm={6} lg={2}>
            <CCard className="text-center mb-2">
              <CCardBody>{50}</CCardBody>
            </CCard>
          </CCol>
          <CCol xs={12} sm={6} lg={2}>
            <CCard className="text-center mb-2">
              <CCardBody>{50}</CCardBody>
            </CCard>
          </CCol>
          <CCol xs={12} sm={6} lg={2}>
            <CCard className="text-center mb-2">
              <CCardBody>{50}</CCardBody>
            </CCard>
          </CCol>
          <CCol xs={12} sm={6} lg={3}>
            <CCard className="text-center border-0 mb-2">
              <CCardBody>
                <CLink href="/#">View</CLink>
              </CCardBody>
            </CCard>
          </CCol>
        </CRow>
        <CRow className="mb-2">
          <CCol xs={12} sm={6} lg={3}>
            <CCard className="text-center mb-2">
              <CCardBody>Session</CCardBody>
            </CCard>
          </CCol>
          <CCol xs={12} sm={6} lg={2}>
            <CCard className="text-center mb-2">
              <CCardBody>{50}</CCardBody>
            </CCard>
          </CCol>
          <CCol xs={12} sm={6} lg={2}>
            <CCard className="text-center mb-2">
              <CCardBody>{50}</CCardBody>
            </CCard>
          </CCol>
          <CCol xs={12} sm={6} lg={2}>
            <CCard className="text-center mb-2">
              <CCardBody>{50}</CCardBody>
            </CCard>
          </CCol>
          <CCol xs={12} sm={6} lg={3}>
            <CCard className="text-center border-0 mb-2">
              <CCardBody>
                <CLink href="/#">View</CLink>
              </CCardBody>
            </CCard>
          </CCol>
        </CRow>
      </CCardBody>
    </CCard>
  );
};

export default Widgets;
