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
    CModal,
    CModalBody,
    CModalFooter,
    CModalHeader,
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
import axios from "axios";
// import { API_URL } from "src/config";
import swal from "sweetalert";
import { RotatingLines } from "react-loader-spinner";
import { getConfig } from 'src/config';
const Firsttimelogin = () => {
    const API_URL = getConfig().REACT_APP_API_URL;
    const [changepasswordData, SetchangepasswordData] = useState({
        usercode: '',
        oldpassword: '',
        newpassword: '',
        confirmpassword: ''
    });

    const [loading, setLoading] = useState(false); // Loader state

    const navigate = useNavigate();

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
                swal({
                    text: `${response.data.message}`,
                    icon: 'success'
                });
            }

            navigate("/");

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


            <div className="bg-image min-vh-100 d-flex flex-row LoginBackground align-items-center">
                <CContainer>
                    <CRow className="justify-content-center">
                        <CCol md={9} lg={7} xl={6}>
                            <CCard className="mx-4 content">
                                <CCardBody className="p-4">
                                    <CForm className="m-5">
                                        <div className="text-center">
                                            <img src={Logo1} width={300} alt="Logo" />
                                        </div>
                                        <p className="fw-bold text-center mt-3 text-primary">Change your Password</p>
                                        <CInputGroup className="mb-3">
                                            <CInputGroupText className="bg-primary">
                                                <CIcon icon={cilUser} className="text-white" />
                                            </CInputGroupText>
                                            <CFormInput
                                                placeholder="User ID"
                                                autoComplete="false"
                                                onChange={(e) => SetchangepasswordData({ ...changepasswordData, usercode: e.target.value })}
                                                disabled={loading} // Disable input during loading
                                                value={changepasswordData.usercode}
                                            />
                                        </CInputGroup>
                                        <CInputGroup className="mb-3">
                                            <CInputGroupText className="bg-primary">
                                                <CIcon icon={cilLockLocked} className="text-white" />
                                            </CInputGroupText>
                                            <CFormInput
                                                type="password"
                                                placeholder="Temp Password"
                                                autoComplete="Temp-password"
                                                onChange={(e) => SetchangepasswordData({ ...changepasswordData, oldpassword: e.target.value })}
                                                disabled={loading} // Disable input during loading
                                                value={changepasswordData.oldpassword}
                                            />
                                        </CInputGroup>
                                        <CInputGroup className="mb-3">
                                            <CInputGroupText className="bg-primary">
                                                <CIcon icon={cilLockLocked} className="text-white" />
                                            </CInputGroupText>
                                            <CFormInput
                                                type="password"
                                                placeholder="New Password"
                                                autoComplete="new-password"
                                                onChange={(e) => SetchangepasswordData({ ...changepasswordData, newpassword: e.target.value })}
                                                disabled={loading} // Disable input during loading
                                                value={changepasswordData.newpassword}
                                            />
                                        </CInputGroup>
                                        <CInputGroup className="mb-4">
                                            <CInputGroupText className="bg-primary">
                                                <CIcon icon={cilLockLocked} className="text-white" />
                                            </CInputGroupText>
                                            <CFormInput
                                                type="password"
                                                placeholder="Confirm password"
                                                autoComplete="confirm-password"
                                                onChange={(e) => SetchangepasswordData({ ...changepasswordData, confirmpassword: e.target.value })}
                                                disabled={loading} // Disable input during loading
                                                value={changepasswordData.confirmpassword}
                                            />
                                        </CInputGroup>
                                        <div className="d-flex justify-content-center">
                                            <div className="mx-3">
                                                <CButton color="secondary" variant='outline' disabled={loading}>
                                                    Clear
                                                </CButton>
                                            </div>
                                            <div>
                                                <CButton color="primary" variant="outline" onClick={handleChangepassword} disabled={loading}>
                                                    Submit
                                                </CButton>
                                            </div>
                                        </div>
                                    </CForm>

                                </CCardBody>
                            </CCard>
                        </CCol>
                    </CRow>
                </CContainer>
            </div>
        </>

    );
};

export default Firsttimelogin;
