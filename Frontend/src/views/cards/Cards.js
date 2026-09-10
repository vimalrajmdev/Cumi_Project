import React from "react";
import {
    CCard,
    CCardBody,
    CCardFooter,
    CCardGroup,
    CCardHeader,
    CCol,
    CLink,
    CRow,
} from "@coreui/react";
import PropTypes from "prop-types";
const Cards = ({auth}) => {
    return (
        <>
            <CRow className="mb-3">
                <CCol lg={6}>
                    <CRow className="">
                        <CCardGroup>
                            <CCard className=" mb-2">
                                <CCardHeader className="text-center">ENQUIRIES</CCardHeader>
                                <CRow>
                                    <CCardGroup>
                                        <div className="card">
                                            <div className="card-body text-center">
                                                <div>OPEN</div>
                                                <div className="text-primary">50</div>
                                            </div>
                                        </div>

                                        <div className="card">
                                            <div className="card-body text-center">
                                                <div>CONVERTED</div>
                                                <div className="text-primary">50</div>
                                            </div>
                                        </div>

                                        <div className="card">
                                            <div className="card-body text-center">
                                                <div>LOST</div>
                                                <div className="text-primary">50</div>
                                            </div>
                                        </div>
                                    </CCardGroup>
                                </CRow>
                                <CCardFooter className="text-center "> TRAILS </CCardFooter>
                                <CRow>
                                    <CCardGroup>
                                        <div className="card">
                                            <div className="card-body text-center">
                                                <div>SCHEDULED</div>
                                                <div className="text-primary">50</div>
                                            </div>
                                        </div>

                                        <div className="card">
                                            <div className="card-body text-center">
                                                <div>COMPLETED</div>
                                                <div className="text-primary">50</div>
                                            </div>
                                        </div>

                                        <div className="card">
                                            <div className="card-body text-center">
                                                <div>NOT-ATTENDED</div>
                                                <div className="text-primary">50</div>
                                            </div>
                                        </div>
                                    </CCardGroup>
                                </CRow>
                            </CCard>
                        </CCardGroup>
                    </CRow>
                </CCol>

                <CCol lg={6}>
                    <CRow className="mb-3">
                        <CCardGroup>
                            <CCard>
                                <CCardHeader className="text-center my-4">Total Clients</CCardHeader>
                                <CCardBody className="">
                                    <div className="text-center">Active: {27}</div>
                                </CCardBody>
                                <CCardFooter className="text-center my-4"><CLink href="/#">View</CLink></CCardFooter>
                            </CCard>
                            <CCard>
                                <CCardHeader className="text-center my-4">{153}</CCardHeader>
                                <CCardBody className="">
                                    <div className="text-center">In Active: {126}</div>
                                </CCardBody>
                                <CCardFooter className="text-center my-4"><CLink href="/#">View</CLink></CCardFooter>
                            </CCard>
                        </CCardGroup>
                    </CRow>
                    <CRow>
                    </CRow>
                </CCol>
            </CRow>
            <CRow>
                <CCol lg={6}>
                    <CRow className="">
                        <CCardGroup>
                            <CCard className="mb-2">
                                <CCardHeader className="text-center">MEMBER SUPPORT REQUESTS</CCardHeader>
                                <CCardBody>
                                    <CRow>
                                        <CCardGroup>
                                            <div className="card">
                                                <div className="card-body text-center">
                                                    <div>RAISED</div>
                                                    <div className="text-primary">50</div>
                                                </div>
                                            </div>

                                            <div className="card">
                                                <div className="card-body text-center">
                                                    <div>OPEN</div>
                                                    <div className="text-primary">50</div>
                                                </div>
                                            </div>

                                            <div className="card">
                                                <div className="card-body text-center">
                                                    <div>CLOSED</div>
                                                    <div className="text-primary">50</div>
                                                </div>
                                            </div>
                                        </CCardGroup>
                                    </CRow>
                                </CCardBody>
                            </CCard>
                        </CCardGroup>
                    </CRow>
                </CCol>
                <CCol lg={6}>
                    <CRow className="">
                        <CCardGroup>
                            <CCard className="mb-2">
                                <CCardHeader className="text-center">FEEDBACK</CCardHeader>
                                <CCardBody>
                                    <CRow>
                                        <CCardGroup>
                                            <div className="card">
                                                <div className="card-body text-center">
                                                    <div>RECEIVED</div>
                                                    <div className="text-primary">50</div>
                                                </div>
                                            </div>

                                            <div className="card">
                                                <div className="card-body text-center">
                                                    <div>NEGATIVE</div>
                                                    <div className="text-primary">50</div>
                                                </div>
                                            </div>

                                        </CCardGroup>
                                    </CRow>
                                </CCardBody>
                            </CCard>
                        </CCardGroup>
                    </CRow>
                </CCol>
            </CRow>
        </>

    );
};

Cards.propTypes = {
    auth: PropTypes.any.isRequired,
};

export default Cards;
