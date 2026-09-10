import { cilArrowRight, cilChartLine, cilCheckAlt, cilDelete, cilMove, cilPencil, cilPlus, cilPrint, cilSave, cilSettings, cilTrash, cilX } from '@coreui/icons'
import CIcon from '@coreui/icons-react'
import {
  CButton,
  CCard,
  CCardBody,
  CCol,
  CFormInput,
  CFormLabel,
  CFormSelect,
  CFormTextarea,
  CModal,
  CModalBody,
  CModalFooter,
  CModalHeader,
  CModalTitle,
  CNav,
  CNavItem,
  CNavLink,
  CRow,
  CTabContent,
  CTabPane,
  CTooltip
} from '@coreui/react'
import React, { useEffect, useMemo, useState } from 'react'
import { AgGridReact } from 'ag-grid-react';
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import swal from 'sweetalert';
import axios from 'axios';
import PropTypes from 'prop-types';
import { getConfig } from 'src/config';
import { FaEdit, FaTrash } from 'react-icons/fa';
import { Card, CardHeader } from 'react-bootstrap';

const Generalsetting = ({ auth }) => {
    const [deletevisible, setDeletevisible] = useState(false)
    const [activeKey, setActiveKey] = useState(1)
    const API_URL = getConfig().REACT_APP_API_URL;
    const [editvisible, setEditvisible] = useState(false)
    const [Generalsettingeditvisible, SetGeneralsettingeditvisible] = useState(false)

    const [EmailConfigdata, setEmailConfigdata] = useState({
        frommail: '',
        apppassword: '',
        ServiceName: '',
        HostName: '',
        PortNumber: '',
    })

    const [EmailConfigUpdatedata, setEmailConfigUpdatedata] = useState({
        frommail: '',
        apppassword: '',
        ServiceName: '',
        HostName: '',
        PortNumber: ''
    })

    const [generalSettingData, SetgeneralSettingData] = useState({
        autologouttime: null,
        passwordexpireday: null,
        LoginAttempCount: null,
        DefaultPassword: null
    })

    const [generalSettingUpdateData, SetgeneralSettingUpdateData] = useState({
        autologouttime: null,
        passwordexpireday: null,
        LoginAttempCount: null,
        DefaultPassword: null
    })

    const [GridData, SetGridData] = useState([])
    const [GeneralSettingData, SetGeneralSettingData] = useState([])
    const [Editid, setEditid] = useState(null)

    const colmun = [
        { field: "frommail", headerName: 'From Email' },
        { field: "apppassword", headerName: 'App Password' },
        { field: "ServiceName", headerName: 'Service Name' },
        { field: "HostName", headerName: 'Host Name' },
        { field: "PortNo", headerName: 'Port No' },
        {
            headerName: 'Edit',
            width: 75,
            filter: false,
            sortable: false,
            floatingFilter: false,
            editable: false,
            cellRenderer: (params) => (
                <CTooltip content="Edit">
                    <CIcon
                        size='xl'
                        icon={cilPencil}
                        className='m-2'
                        onClick={() => handleEdit(params.data.id)}
                        style={{ 
                            color: 'white', 
                            background: 'rgb(34,139,34)', 
                            borderRadius: '5px', 
                            cursor: 'pointer',
                            padding: '8px'
                        }}
                    />
                </CTooltip>
            )
        },
        {
            headerName: 'Delete',
            width: 75,
            filter: false,
            sortable: false,
            floatingFilter: false,
            editable: false,
            cellRenderer: (params) => (
                <CTooltip content="Delete">
                    <CIcon
                        size='xl'
                        icon={cilTrash}
                        className='m-2'
                        onClick={() => {
                            setEditid(params.data.id);
                            setDeletevisible(true);
                        }}
                        style={{ 
                            color: 'white', 
                            background: 'rgb(237,28,36)', 
                            borderRadius: '5px', 
                            cursor: 'pointer',
                            padding: '8px'
                        }}
                    />
                </CTooltip>
            )
        },
    ]

    const GeneralSettingcolmun = [
        { field: "AutoLogoutTime", headerClass: 'agheader', headerName: 'Auto Logout Minutes', width: '250px' },
        { field: "PasswordExpireDay", headerClass: 'agheader', headerName: 'Password Expire Days', width: '270px' },
        { field: "LoginAttempCount", headerClass: 'agheader', headerName: 'Login Attempt Count', width: '280px' },
        { field: "DefaultPassword", headerClass: 'agheader', headerName: 'Default Password', width: '280px' },
        {
            headerName: 'Edit',
            headerClass: 'agheader',
            width: '150px',
            filter: false,
            sortable: false,
            floatingFilter: false,
            editable: false,
            cellRenderer: (params) => (
                <button
                    className="border-0 mt-1 rounded-circle d-flex justify-content-center align-items-center"
                    style={{
                        width: "40px",
                        height: "40px",
                        backdropFilter: "blur(6px)",
                        background: "rgba(25, 135, 84, 0.15)",
                        border: "1px solid rgba(25, 135, 84, 0.3)",
                        color: "#198754",
                        transition: "all 0.3s ease",
                        boxShadow: "0 2px 6px rgba(0, 0, 0, 0.1)",
                        cursor: 'pointer',
                    }}
                    title="Edit"
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
                    onClick={() => handleEditGeneralsetting(params.data.id)}
                >
                    <FaEdit className="fs-5" />
                </button>
            )
        },
        {
            headerName: 'Delete',
            headerClass: 'agheader',
            width: '150px',
            floatingFilter: false,
            cellRenderer: (params) => (
                <button
                    style={{
                        width: "40px",
                        height: "40px",
                        backdropFilter: "blur(6px)",
                        background: "rgba(220, 53, 69, 0.15)",
                        border: "1px solid rgba(220, 53, 69, 0.3)",
                        color: "#dc3545",
                        transition: "all 0.3s ease",
                        boxShadow: "0 2px 6px rgba(0, 0, 0, 0.1)",
                        cursor: 'pointer',
                    }}
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
                    className="border-0 mt-1 rounded-circle d-flex justify-content-center align-items-center"
                    onClick={() => handleDeleteGeneralsetting(params.data.id)}
                >
                    <FaTrash className="fs-5" />
                </button>
            )
        },
    ]

    const defaultColDef = useMemo(() => {
        return {
            filter: 'agTextColumnFilter',
            floatingFilter: true,
            editable: true,
        }
    }, []);

    const handlecreateEmailConfig = async () => {
        if (!EmailConfigdata.frommail) return swal({ text: 'Please Enter From Email Address', icon: 'warning' });
        if (!EmailConfigdata.apppassword) return swal({ text: 'Please Enter App Password', icon: 'warning' });
        if (!EmailConfigdata.ServiceName) return swal({ text: 'Please Enter Service Name', icon: 'warning' });
        if (!EmailConfigdata.HostName) return swal({ text: 'Please Enter Host Name', icon: 'warning' });
        if (!EmailConfigdata.PortNumber) return swal({ text: 'Please Enter Port Number', icon: 'warning' });

        try {
            const alldata = { ...EmailConfigdata, id: 0, createdby: auth.empid, updateby: auth.empid, branchid: auth.branchid, mode: 'I' };
            const response = await axios.post(`${API_URL}/emailconfigsettings`, alldata);
            if (response.status === 200) {
                swal({ text: 'Email Config Added Successfully', icon: 'success' });
                FetchGridData();
            }
        } catch (error) {
            console.log(error);
            swal({ text: 'Error adding email config', icon: 'error' });
        }
    }

    const FetchGridData = async () => {
        try {
            const alldata = { id: 0, createdby: auth.empid, updateby: 0, branchid: auth.branchid, mode: 'S' };
            const response = await axios.post(`${API_URL}/emailconfigsettings`, alldata);
            if (response.status === 200) {
                SetGridData(response.data);
            }
        } catch (error) {
            console.log(error);
        }
    }

    const FetchGeneralSettingData = async () => {
        try {
            const alldata = { id: 0, createdby: auth.empid, branchid: auth.branchid, mode: 'S', BranchAccess: auth.BranchAccess };
            const response = await axios.post(`${API_URL}/othersetting`, alldata);
            if (response.status === 200) {
                SetGeneralSettingData(response.data);
            }
        } catch (error) {
            console.log(error);
        }
    }

    const handleEdit = async (ids) => {
        try {
            setEditid(ids);
            const alldata = { id: ids, createdby: auth.empid, updateby: 0, branchid: auth.branchid, mode: 'E' };
            const response = await axios.post(`${API_URL}/emailconfigsettings`, alldata);
            if (response.status === 200 && response.data.length > 0) {
                const { frommail, apppassword, ServiceName, HostName, PortNo } = response.data[0];
                setEmailConfigUpdatedata({ frommail, apppassword, ServiceName, HostName, PortNumber: PortNo });
                setEditvisible(true);
            }
        } catch (error) {
            console.log(error);
        }
    }

    const handleEditGeneralsetting = async (ids) => {
        try {
            setEditid(ids);
            const alldata = { id: ids, createdby: auth.empid, branchid: auth.branchid, mode: 'E', BranchAccess: '' };
            const response = await axios.post(`${API_URL}/othersetting`, alldata);
            if (response.status === 200 && response.data.length > 0) {
                const { PasswordExpireDay, AutoLogoutTime, LoginAttempCount, DefaultPassword } = response.data[0];
                SetgeneralSettingUpdateData({
                    passwordexpireday: PasswordExpireDay,
                    autologouttime: AutoLogoutTime,
                    LoginAttempCount,
                    DefaultPassword
                });
                SetGeneralsettingeditvisible(true);
            }
        } catch (error) {
            console.log(error);
        }
    }

    const handleDelete = async () => {
        if (!Editid) return;
        try {
            const alldata = { id: Editid, createdby: auth.empid, updateby: auth.empid, branchid: auth.branchid, mode: 'D' };
            const response = await axios.post(`${API_URL}/emailconfigsettings`, alldata);
            if (response.status === 200) {
                swal({ text: 'Deleted Successfully', icon: 'success' });
                setDeletevisible(false);
                FetchGridData();
            }
        } catch (error) {
            console.log(error);
        }
    }

    const handleDeleteGeneralsetting = async (id) => {
        try {
            const alldata = { id, createdby: auth.empid, branchid: auth.branchid, mode: 'D', BranchAccess: '' };
            const response = await axios.post(`${API_URL}/othersetting`, alldata);
            if (response.status === 200) {
                swal({ text: 'Setting Deleted Successfully', icon: 'success' });
                FetchGeneralSettingData();
            }
        } catch (error) {
            console.log(error);
        }
    }

    const handleupdateEmailConfig = async () => {
        if (!EmailConfigUpdatedata.frommail) return swal({ text: 'Please Enter From Email Address', icon: 'warning' });
        if (!EmailConfigUpdatedata.apppassword) return swal({ text: 'Please Enter App Password', icon: 'warning' });
        if (!EmailConfigUpdatedata.ServiceName) return swal({ text: 'Please Enter Service Name', icon: 'warning' });
        if (!EmailConfigUpdatedata.HostName) return swal({ text: 'Please Enter Host Name', icon: 'warning' });
        if (!EmailConfigUpdatedata.PortNumber) return swal({ text: 'Please Enter Port Number', icon: 'warning' });

        try {
            const alldata = { ...EmailConfigUpdatedata, id: Editid, createdby: auth.empid, updateby: auth.empid, branchid: auth.branchid, mode: 'U' };
            const response = await axios.post(`${API_URL}/emailconfigsettings`, alldata);
            if (response.status === 200) {
                swal({ text: 'Email Config Updated Successfully', icon: 'success' });
                FetchGridData();
                setEditvisible(false);
            }
        } catch (error) {
            console.log(error);
            swal({ text: 'Error updating email config', icon: 'error' });
        }
    }

    const handleSaveOtherSetting = async () => {
        if (!generalSettingData.autologouttime) return swal({ text: 'Please Enter Auto Logout Time', icon: 'warning' });
        if (!generalSettingData.passwordexpireday) return swal({ text: 'Please Enter Password Expire Day', icon: 'warning' });
        if (!generalSettingData.LoginAttempCount) return swal({ text: 'Please Enter Login Attempt Count', icon: 'warning' });
        if (!generalSettingData.DefaultPassword) return swal({ text: 'Please Enter Default Password', icon: 'warning' });

        try {
            const alldata = { ...generalSettingData, id: 0, createdby: auth.empid, branchid: auth.branchid, mode: 'I', BranchAccess: '' };
            const response = await axios.post(`${API_URL}/othersetting`, alldata);
            if (response.status === 200) {
                swal({ text: 'General Settings Saved Successfully', icon: 'success' });
                FetchGeneralSettingData();
            }
        } catch (error) {
            console.log(error);
            swal({ text: 'Error saving settings', icon: 'error' });
        }
    }

    const handleUpdateOtherSetting = async () => {
        if (!generalSettingUpdateData.autologouttime) return swal({ text: 'Please Enter Auto Logout Time', icon: 'warning' });
        if (!generalSettingUpdateData.passwordexpireday) return swal({ text: 'Please Enter Password Expire Day', icon: 'warning' });
        if (!generalSettingUpdateData.LoginAttempCount) return swal({ text: 'Please Enter Login Attempt Count', icon: 'warning' });
        if (!generalSettingUpdateData.DefaultPassword) return swal({ text: 'Please Enter Default Password', icon: 'warning' });

        try {
            const alldata = { ...generalSettingUpdateData, id: Editid, createdby: auth.empid, branchid: auth.branchid, mode: 'U', BranchAccess: '' };
            const response = await axios.post(`${API_URL}/othersetting`, alldata);
            if (response.status === 200) {
                swal({ text: 'General Settings Updated Successfully', icon: 'success' });
                FetchGeneralSettingData();
                SetGeneralsettingeditvisible(false);
            }
        } catch (error) {
            console.log(error);
            swal({ text: 'Error updating settings', icon: 'error' });
        }
    }

    useEffect(() => {
        FetchGridData();
        FetchGeneralSettingData();
    }, []);

    return (
        <div>
            {/* Delete Confirmation Modal */}
            <CModal size='sm' alignment="center" visible={deletevisible} onClose={() => setDeletevisible(false)}>
                <CModalTitle className='ms-3'>Are you sure?</CModalTitle>
                <CModalBody><p>This operation can&apos;t be reverted</p></CModalBody>
                <CModalFooter>
                    <CButton color="secondary" onClick={() => setDeletevisible(false)}>CANCEL</CButton>
                    <CButton color="primary" onClick={handleDelete}>CONFIRM</CButton>
                </CModalFooter>
            </CModal>

            {/* Edit Email Config Modal */}
            <CModal size="lg" alignment="center" backdrop="static" visible={editvisible} onClose={() => setEditvisible(false)}>
                <CModalHeader><CModalTitle>Edit Email Configuration</CModalTitle></CModalHeader>
                <CModalBody>
                    <CCard className="shadow-sm border-0 rounded-3">
                        <CCardBody>
                            <CRow className="g-4">
                                <CCol md={6}>
                                    <CFormLabel>From Email <span className="text-danger">*</span></CFormLabel>
                                    <CFormInput type="email" value={EmailConfigUpdatedata.frommail || ''} onChange={(e) => setEmailConfigUpdatedata({ ...EmailConfigUpdatedata, frommail: e.target.value })} />
                                </CCol>
                                <CCol md={6}>
                                    <CFormLabel>App Password <span className="text-danger">*</span></CFormLabel>
                                    <CFormInput type="text" value={EmailConfigUpdatedata.apppassword || ''} onChange={(e) => setEmailConfigUpdatedata({ ...EmailConfigUpdatedata, apppassword: e.target.value })} />
                                </CCol>
                                <CCol md={6}>
                                    <CFormLabel>Service Name <span className="text-danger">*</span></CFormLabel>
                                    <CFormInput type="text" value={EmailConfigUpdatedata.ServiceName || ''} onChange={(e) => setEmailConfigUpdatedata({ ...EmailConfigUpdatedata, ServiceName: e.target.value })} />
                                </CCol>
                                <CCol md={6}>
                                    <CFormLabel>Host Name <span className="text-danger">*</span></CFormLabel>
                                    <CFormInput type="text" value={EmailConfigUpdatedata.HostName || ''} onChange={(e) => setEmailConfigUpdatedata({ ...EmailConfigUpdatedata, HostName: e.target.value })} />
                                </CCol>
                                <CCol md={6}>
                                    <CFormLabel>Port Number <span className="text-danger">*</span></CFormLabel>
                                    <CFormInput type="number" value={EmailConfigUpdatedata.PortNumber || ''} onChange={(e) => setEmailConfigUpdatedata({ ...EmailConfigUpdatedata, PortNumber: e.target.value })} />
                                </CCol>
                            </CRow>
                        </CCardBody>
                    </CCard>
                </CModalBody>
                <CModalFooter className="d-flex justify-content-end">
                    <CButton color="secondary" onClick={() => setEditvisible(false)}><CIcon icon={cilX} className="me-2" /> Cancel</CButton>
                    <CButton color="danger" onClick={() => setEditvisible(false)}><CIcon icon={cilDelete} className="me-2" /> Clear</CButton>
                    <CButton color="success" onClick={handleupdateEmailConfig}><CIcon icon={cilCheckAlt} className="me-2" /> Save</CButton>
                </CModalFooter>
            </CModal>

            <Card className='mt-4'>
                <CardHeader className='pro-header text-white'>
                    <div className="d-flex justify-content-center">
                        <CIcon className="me-2" size={'xxl'} icon={cilSettings} />
                        <h3 className='text-white'>General Settings</h3>
                    </div>
                </CardHeader>

                <CRow className="m-3">
                    {GeneralSettingData.length === 0 && (
                        <CCard className="shadow-sm border-0 rounded-3">
                            <CCardBody>
                                <h5 className="fw-bold mb-3 text-primary">General Settings</h5>
                                <CRow className="g-4">
                                    <CCol md={3}>
                                        <CFormLabel>Logout Idle Minutes <span className="text-danger">*</span></CFormLabel>
                                        <CFormInput type="number" onChange={(e) => SetgeneralSettingData({ ...generalSettingData, autologouttime: e.target.value })} />
                                    </CCol>
                                    <CCol md={3}>
                                        <CFormLabel>Password Expire Days <span className="text-danger">*</span></CFormLabel>
                                        <CFormInput type="number" onChange={(e) => SetgeneralSettingData({ ...generalSettingData, passwordexpireday: e.target.value })} />
                                    </CCol>
                                    <CCol md={3}>
                                        <CFormLabel>Login Attempt Count <span className="text-danger">*</span></CFormLabel>
                                        <CFormInput type="number" onChange={(e) => SetgeneralSettingData({ ...generalSettingData, LoginAttempCount: e.target.value })} />
                                    </CCol>
                                    <CCol md={3}>
                                        <CFormLabel>Default Password <span className="text-danger">*</span></CFormLabel>
                                        <CFormInput type="text" onChange={(e) => SetgeneralSettingData({ ...generalSettingData, DefaultPassword: e.target.value })} />
                                    </CCol>
                                </CRow>
                                <div className="d-flex justify-content-end mt-4">
                                    <CButton color="success" onClick={handleSaveOtherSetting}>
                                        <CIcon icon={cilSave} className="me-2" /> Save Settings
                                    </CButton>
                                </div>
                            </CCardBody>
                        </CCard>
                    )}

                    <div className="ag-theme-quartz mt-4" style={{ height: 500 }}>
                        <AgGridReact
                            rowData={GeneralSettingData}
                            columnDefs={GeneralSettingcolmun}
                            defaultColDef={defaultColDef}
                            rowSelection="multiple"
                            pagination
                            paginationPageSize={10}
                            paginationPageSizeSelector={[10, 15, 20]}
                            getRowHeight={() => 55}
                        />
                    </div>
                </CRow>
            </Card>

            {/* Edit General Settings Modal */}
            <CModal size="lg" alignment="center" visible={Generalsettingeditvisible} onClose={() => SetGeneralsettingeditvisible(false)} backdrop='static'>
                <CModalBody>
                    <CCard className="shadow-sm border-0 rounded-3">
                        <CCardBody>
                            <h5 className="fw-bold mb-3 text-primary">Edit Settings</h5>
                            <CRow className="g-4">
                                <CCol md={3}>
                                    <CFormLabel>Logout Idle Minutes <span className="text-danger">*</span></CFormLabel>
                                    <CFormInput type="number" value={generalSettingUpdateData.autologouttime || ''} onChange={(e) => SetgeneralSettingUpdateData({ ...generalSettingUpdateData, autologouttime: e.target.value })} />
                                </CCol>
                                <CCol md={3}>
                                    <CFormLabel>Password Expire Days <span className="text-danger">*</span></CFormLabel>
                                    <CFormInput type="number" value={generalSettingUpdateData.passwordexpireday || ''} onChange={(e) => SetgeneralSettingUpdateData({ ...generalSettingUpdateData, passwordexpireday: e.target.value })} />
                                </CCol>
                                <CCol md={3}>
                                    <CFormLabel>Login Attempt Count <span className="text-danger">*</span></CFormLabel>
                                    <CFormInput type="number" value={generalSettingUpdateData.LoginAttempCount || ''} onChange={(e) => SetgeneralSettingUpdateData({ ...generalSettingUpdateData, LoginAttempCount: e.target.value })} />
                                </CCol>
                                <CCol md={3}>
                                    <CFormLabel>Default Password <span className="text-danger">*</span></CFormLabel>
                                    <CFormInput type="text" value={generalSettingUpdateData.DefaultPassword || ''} onChange={(e) => SetgeneralSettingUpdateData({ ...generalSettingUpdateData, DefaultPassword: e.target.value })} />
                                </CCol>
                            </CRow>
                        </CCardBody>
                        <CModalFooter className="d-flex justify-content-end">
                            <CButton color="secondary" onClick={() => SetGeneralsettingeditvisible(false)}>Cancel</CButton>
                            <CButton color="success" onClick={handleUpdateOtherSetting}>
                                <CIcon icon={cilSave} className="me-2" /> Save Changes
                            </CButton>
                        </CModalFooter>
                    </CCard>
                </CModalBody>
            </CModal>
        </div>
    )
}

Generalsetting.propTypes = {
    auth: PropTypes.any.isRequired,
};

export default Generalsetting