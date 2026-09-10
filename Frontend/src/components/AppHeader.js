import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import {
  CContainer,
  CDropdown,
  CDropdownItem,
  CDropdownMenu,
  CDropdownToggle,
  CHeader,
  CHeaderNav,
  CHeaderToggler,
  CButton,
  CFormInput,
  CBadge,
  CModal,
  CModalBody,
  CTooltip,
  CModalHeader,
  CDropdownDivider,

  CFormSelect,

  CFormTextarea,
  CRow,
  CCol,
  CNavItem,
  CNav,
  CNavLink,
  CTabContent,
  CTabPane,
  CModalTitle,
  CModalFooter,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import {
  cilContrast,
  cilEnvelopeClosed,
  cilExitToApp,
  cilLockUnlocked,
  cilMenu,
  cilMoon,
  cilPhone,
  cilSun,
  cilTask,
} from '@coreui/icons'
import { useColorModes } from '@coreui/react'
import { AppBreadcrumb } from './index'
import { AppHeaderDropdown } from './header/index'
import { useNavigate } from "react-router-dom";
import axios from 'axios'
import PropTypes from 'prop-types'
import { AgGridReact } from 'ag-grid-react';
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import swal from 'sweetalert'
import { RotatingLines } from 'react-loader-spinner';
import secureLocalStorage from 'react-secure-storage'
import { FaBell, FaBroadcastTower, FaExclamationCircle } from "react-icons/fa";
import { IoHelpCircle } from "react-icons/io5";
import { getConfig } from 'src/config';
import { BsBellFill, BsFillInfoCircleFill } from 'react-icons/bs'
import { fetchInwardAsset } from "../views/Movement/inwardAssetService";
import Swal from 'sweetalert2'
import { FaUserLock } from 'react-icons/fa6'

const AppHeader = ({ auth, ipAddress }) => {
  const API_URL = getConfig().REACT_APP_API_URL;
  const [secureLocalStorageData, setsecureLocalStorageData] = useState(secureLocalStorage.getItem("userData"));
  const permissions = secureLocalStorage.getItem("pageData") || {};
  const [internalGridApi, setInternalGridApi] = useState(null);
  const [inwardGridApi, setInwardGridApi] = useState(null);
  const [externalGridApi, setExternalGridApi] = useState(null);
  const role = auth.userrole.toLowerCase()
  const [helpvisible, setHelpvisible] = useState(false)
  const [GridData, SetGridData] = useState([])
  const [BranchDropDown, SetBranchDropDown] = useState([])
  const [DefaultSelectedBrach, SetDefaultSelectedBrach] = useState(auth.branchid)
  const headerRef = useRef()
  const { colorMode, setColorMode } = useColorModes('');
  const [PasswordNotficationData, SetPasswordNotficationData] = useState([]);
  const [loading, setLoading] = useState(false); // Loader state
  const [InactiveNotficationCount, SetInactiveNotficationCount] = useState(null)
  const gridRef = useRef();

  const exportToExcel = () => {
    const params = {
      fileName: 'InactiveStatus.csv',
    };
    gridRef.current.api.exportDataAsCsv(params);
  };


  // Approval Pending Start
  const [visible, setVisible] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalReminderVisible, setmodalReminderVisible] = useState(false);
  const [InactiveReadervisible, setInactiveReadervisible] = useState(false)

  // Approval Pending Count States
  const [ExternalLocationTransferCount, SetExternalLocationTransferCount] = useState(0);
  const [InternalLocationTransferCount, SetInternalLocationTransferCount] = useState(0);
  const [InwardAssetCount, SetInwardAssetCount] = useState(0);
  // const [PaymentHistoryCount, SetPaymentHistoryCount] = useState(0);
  const [InwardPendingCount, SetInwardPendingCount] = useState(0);
  const [MaintenanceDoneCount, SetMaintenanceDoneCount] = useState(0);
  const [ReminderCount, SetReminderCount] = useState(0);
  const [InternalTransferredData, SetInternalTransferredData] = useState([]);
  const [ExternalTransferredData, SetExternalTransferredData] = useState([]);
  const [InwardAssetData, SetInwardAssetData] = useState([]);
  const [InwardPendingData, SetInwardPendingData] = useState([]);
  const [PaymentData, SetPaymentData] = useState([]);
  const [MaintenanceDoneData, SetMaintenanceDoneData] = useState([]);
  const [activeTab, setActiveTab] = useState('ExternalLocationTransfer');
  const [PasswordNotficationCount, setPasswordNotficationCount] = useState(0); // 
  const [ReminderData, setReminderData] = useState([]); // 
  const [InactiveNotficationData, SetInactiveNotficationData] = useState([])

  const handleInwardAsset = async (rowData) => {
    const data = await fetchInwardAsset(rowData.RFIDnumber, auth);
    if (data) {
      navigate("/Movement/InwardAsset", { state: { inwardAssetData: data } });
      setModalVisible(false);
    }
  };

  const handleApproveAll = async (tab, rows) => {
    console.log('tab', tab, rows);
    if (tab === 'InternalLocationTransfer') {
      console.log('a');

      if (!rows) {
        console.warn("No rows found!");
        return;
      }
      setLoading(true);
      try {
        // Create an array of promises
        const allRequests = rows.map((row) => {
          const fullData = {
            ...row,
            mode: "UA",
            branchid: auth.branchid,
            BranchAccess: auth.BranchAccess,
          };

          return axios.post(`${API_URL}/InternalLocationTransfer`, fullData);
        });

        // Wait until ALL requests complete
        await Promise.all(allRequests);
        setLoading(false);

        // 🎉 Everything finished successfully
        Swal.fire({
          icon: "success",
          title: "Approved Successfully!",
          text: "All assets have been approved.",
          timer: 2000,
          showConfirmButton: false,
        }).then(() => {
          ApprovalPendingFetch();
        })

      } catch (error) {
        console.error("Error during Approve All:", error);

        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Some approvals failed. Check console for details.",
        });
      }

    } else {
      console.log('b', rows);
      if (!rows) {
        console.warn("No rows found!");
        return;
      }
      setLoading(true);
      try {
        // Create an array of promises
        const allRequests1 = rows.map((row) => {
          const fullData = {
            ...row,
            mode: "UA",
            TransferedBy: row.Createdby, branchid: auth.branchid, BranchAccess: auth.BranchAccess, Transferredbranchid: '', Receivedbranchid: '', departmentname: auth.departmentname
          };
          console.log('fullData', fullData);

          return axios.post(`${API_URL}/ExternalLocationTransfer`, fullData);
        });

        // Wait until ALL requests complete
        await Promise.all(allRequests1);
        setLoading(false);

        // 🎉 Everything finished successfully
        Swal.fire({
          icon: "success",
          title: "Approved Successfully!",
          text: "All assets have been approved.",
          timer: 2000,
          showConfirmButton: false,
        }).then(() => {
          ApprovalPendingFetch();
        })

      } catch (error) {
        console.error("Error during Approve All:", error);

        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Some approvals failed. Check console for details.",
        });
      }
    }
  };

  const handleApproveAllforInward = async (tab, rows) => {
    try {
      // Create an array of promises
      const allRequests = rows.map((row) => {
        const fullData = {
          ...row, branchid: auth.branchid, BranchAccess: auth.BranchAccess, mode: 'UP', branchid: auth.branchid, BranchAccess: auth.BranchAccess, Transferredbranchid: '', Receivedbranchid: '', Receivedby: '', PaidAmount: '', departmentname: auth.departmentname
        };
        console.log("🚀 ~ handleApproveAllforInward ~ fullData:", fullData)

        return axios.post(`${API_URL}/InwardAsset`, fullData);
      });

      // Wait until ALL requests complete
      await Promise.all(allRequests);
      setLoading(false);

      // 🎉 Everything finished successfully
      Swal.fire({
        icon: "success",
        title: "Inward Asset Successfully!",
        text: "All assets have been Inward Successfully.",
        timer: 2000,
        showConfirmButton: false,
      }).then(() => {
        ApprovalPendingFetch();
      })

    } catch (error) {
      console.error("Error during Inward Asset All:", error);

      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Some Inwards failed. Check console for details.",
      });
    }
  };

  const handleRejectAll = async (tab, rows) => {
    if (tab === 'InternalLocationTransfer') {
      if (!rows || rows.length === 0) {
        console.warn("No rows found!");
        return;
      }
      setLoading(true);

      try {
        // Create an array of promises
        const allRequests = rows.map((row) => {
          const fullData = {
            ...row,
            mode: "UR",
            branchid: auth.branchid,
            BranchAccess: auth.BranchAccess,
          };

          return axios.post(`${API_URL}/InternalLocationTransfer`, fullData);
        });

        // Wait until ALL requests complete
        await Promise.all(allRequests);
        setLoading(false);

        // 🎉 Everything finished successfully
        Swal.fire({
          icon: "success",
          title: "Rejected Successfully!",
          text: "All assets have been Rejected.",
          timer: 2000,
          showConfirmButton: false,
        }).then(() => {
          ApprovalPendingFetch();
        })

      } catch (error) {
        console.error("Error during Rejection All:", error);

        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Some approvals failed. Check console for details.",
        });
      }
    } else {
      if (!rows || rows.length === 0) {
        console.warn("No rows found!");
        return;
      }
      setLoading(true);

      try {
        // Create an array of promises
        const allRequests = rows.map((row) => {
          const fullData = {
            ...row,
            mode: "UR",
            branchid: auth.branchid, BranchAccess: auth.BranchAccess, Transferredbranchid: '', Receivedbranchid: '', TransferedBy: '', departmentname: auth.departmentname
          };

          return axios.post(`${API_URL}/InternalLocationTransfer`, fullData);
        });

        // Wait until ALL requests complete
        await Promise.all(allRequests);
        setLoading(false);

        // 🎉 Everything finished successfully
        Swal.fire({
          icon: "success",
          title: "Rejected Successfully!",
          text: "All assets have been Rejected.",
          timer: 2000,
          showConfirmButton: false,
        }).then(() => {
          ApprovalPendingFetch();
        })

      } catch (error) {
        console.error("Error during Rejection All:", error);

        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Some approvals failed. Check console for details.",
        });
      }
    }
  };


  const getAllRowData = (tab) => {
    const allData = [];

    const api = tab === 'InternalLocationTransfer'
      ? internalGridApi
      : externalGridApi;

    if (api) {
      api.forEachNode((node) => allData.push(node.data));
    }

    return allData;
  };

  const getAllRowData1 = (tab) => {
    const allData = [];

    const api = tab === 'InwardAsset'
      ? inwardGridApi
      : '';

    if (api) {
      api.forEachNode((node) => allData.push(node.data));
    }

    return allData;
  };

  const generateColumnDefs = (data) => {
    if (!data || data.length === 0) return [];

    const columns = Object.keys(data[0]).map((key) => ({
      field: key,
      filter: true,
      sortable: true,
      floatingFilter: true,
    }));

    // ============================
    // INTERNAL & EXTERNAL TRANSFER
    // ============================
    if (activeTab === 'InternalLocationTransfer' || activeTab === 'ExternalLocationTransfer') {
      columns.unshift({
        field: 'ApproveReject',
        filter: false,
        sortable: false,
        floatingFilter: false,
        editable: false,

        // ⭐ HEADER WITH APPROVE ALL + REJECT ALL
        headerComponent: () => (
          <div style={{ display: 'flex', gap: '6px' }}>
            <CButton
              color="success"
              size="sm"
              onClick={() => handleApproveAll(activeTab, getAllRowData(activeTab))}
            >
              Approve All
            </CButton>

            <CButton
              color="danger"
              size="sm"
              onClick={() => handleRejectAll(activeTab, getAllRowData(activeTab))}
            >
              Reject All
            </CButton>
          </div>
        ),


        // ROW BUTTON
        cellRenderer: (params) => (
          <CTooltip content="Approve / Reject">
            <CIcon
              size="xl"
              icon={cilTask}
              className="m-2"
              onClick={() => handleAction(activeTab, params.data)}
              style={{
                color: 'white',
                background: 'blue',
                borderRadius: '5px',
                cursor: 'pointer',
              }}
            />
          </CTooltip>
        ),
      });

      // ============================
      // OTHER TABS (ONLY APPROVE)
      // ============================
    } else if (activeTab !== 'InwardPending') {
      columns.unshift({
        field: 'Approve',
        filter: false,
        sortable: false,
        floatingFilter: false,
        editable: false,

        // ⭐ HEADER WITH APPROVE ALL ONLY
        headerComponent: () => (
          <CButton color="success" size="sm" onClick={() => handleApproveAllforInward(activeTab, getAllRowData1(activeTab))}>
            Approve All
          </CButton>
        ),

        cellRenderer: (params) => (
          <CTooltip content="Approve">
            <CIcon
              size="xl"
              icon={cilLockUnlocked}
              className="m-2"
              onClick={() => handleApprove(activeTab, params.data)}
              style={{ color: 'white', background: 'green', borderRadius: '5px', cursor: 'pointer' }}
            />
          </CTooltip>
        ),
      });

      // ============================
      // INWARD PENDING
      // ============================
    } else {
      columns.unshift({
        field: 'InwardAsset',
        filter: false,
        sortable: false,
        floatingFilter: false,
        editable: false,

        // HEADER TEXT
        headerName: "Inward",

        cellRenderer: (params) => (
          <CTooltip content="InwardAsset">
            <CButton color="info" size="sm" onClick={() => handleInwardAsset(params.data)}>
              Inward Asset
            </CButton>
          </CTooltip>
        ),
      });
    }

    return columns;
  };

  const handleAction = (tableName, data) => {
    Swal.fire({
      title: "Choose Action",
      text: "Approve or Reject this Request?",
      icon: "question",
      showCancelButton: true,
      showDenyButton: true,
      confirmButtonText: "Approve",
      denyButtonText: "Reject",
      cancelButtonText: "Cancel",
    }).then((result) => {
      if (result.isConfirmed) {
        // APPROVE
        handleApprove(tableName, data, "UA");
      }
      else if (result.isDenied) {
        // REJECT
        handleApprove(tableName, data, "UR");
      }
      // Cancel does nothing
    });
  };

  const defaultColDef1 = {
    // flex: 1,
    minWidth: 100,
    filter: true,
    sortable: true,
    floatingFilter: true,
  };

  const handleApprove = async (tableName, data, mode) => {
    try {
      if (tableName === 'InternalLocationTransfer') {
        const alldata = { ...data, tableName, mode, branchid: auth.branchid, BranchAccess: auth.BranchAccess }
        try {
          const response = await axios.post(`${API_URL}/InternalLocationTransfer`, alldata);
          if (response.status === 200) {
            Swal.fire({
              text: mode === "UA"
                ? "Internal Location Transfer Approved Successfully"
                : "Internal Location Transfer Rejected Successfully",
              icon: "success"
            }).then(() => {
              ApprovalPendingFetch();
              // 
            });
          }
        } catch (error) {
          swal({
            text: "Something went wrong while approving!",
            icon: "error"
          });
        }
      }
      else if (tableName === 'ExternalLocationTransfer') {
        const alldata = { ...data, TransferedBy: data.Transferredby, branchid: auth.branchid, BranchAccess: auth.BranchAccess, Transferredbranchid: '', Receivedbranchid: '', TransferedBy: '', departmentname: auth.departmentname, mode }
        try {
          const response = await axios.post(`${API_URL}/ExternalLocationTransfer`, alldata);
          if (response.status === 200) {
            Swal.fire({
              text: mode === "UA"
                ? "External Location Transfer Approved Successfully"
                : "External Location Transfer Rejected Successfully",
              icon: "success"
            }).then(() => {
              ApprovalPendingFetch();
              // 
            });
          }
        } catch (error) {
          swal({
            text: "Something went wrong while approving!",
            icon: "error"
          });
        }
      }
      else if (tableName === 'PaymentHistory') {
        const alldata = { ...data, branchid: auth.branchid, BranchAccess: auth.BranchAccess, Transferredbranchid: '', Receivedbranchid: '', TransferredBy: '', departmentname: auth.departmentname, mode: 'UP' }
        swal({
          text: "Payment Received Approve?",
          icon: "warning",
          buttons: ["Cancel", "Approve"],   // Cancel = false, Approve = true
          dangerMode: true,
        }).then(async (willApprove) => {
          if (willApprove) {
            try {
              const response = await axios.post(`${API_URL}/PaymentHistory`, alldata);
              if (response.status === 200) {
                swal({
                  text: "payment Received Successfully",
                  icon: "success"
                }).then(() => {
                  ApprovalPendingFetch();

                })


              }
            } catch (error) {
              swal({
                text: "Something went wrong while approving!",
                icon: "error"
              });
            }
          } else {
            swal({
              text: "Internal Location Transfer approval was cancelled",
              icon: "info"
            });
          }
        });
      } else if (tableName === 'InwardAsset') {
        const alldata = { ...data, branchid: auth.branchid, BranchAccess: auth.BranchAccess, mode: 'UP', branchid: auth.branchid, BranchAccess: auth.BranchAccess, Transferredbranchid: '', Receivedbranchid: '', Receivedby: '', PaidAmount: '', departmentname: auth.departmentname }
        swal({
          text: "Approval For Asset Inward?",
          icon: "warning",
          buttons: ["Cancel", "Approve"],   // Cancel = false, Approve = true
          dangerMode: true,
        }).then(async (willApprove) => {
          if (willApprove) {
            try {
              const response = await axios.post(`${API_URL}/InwardAsset`, alldata)
              if (response.status === 200) {
                swal({
                  text: "Inward Asset Successfully",
                  icon: "success"
                }).then(() => {
                  ApprovalPendingFetch();
                })


              }
            } catch (error) {
              swal({
                text: "Something went wrong while approving!",
                icon: "error"
              });
            }
          } else {
            swal({
              text: "Internal Location Transfer approval was cancelled",
              icon: "info"
            });
          }
        });
      }
    } catch (err) {
      console.error('Approve Error:', err);
    }
  };

  // Approval Pending End

  const dispatch = useDispatch()

  const sidebarShow = useSelector((state) => state.sidebarShow)

  useEffect(() => {
    document.addEventListener('scroll', () => {
      headerRef.current &&
        headerRef.current.classList.toggle('shadow-sm', document.documentElement.scrollTop > 0)
    })
  }, [])

  const navigate = useNavigate();

  const PasswordNotfictionFetch = async () => {
    try {

      const alldata = { mood: 'PD', id: '', branchid: auth.branchid } /// fetch password data mood pd mean password data

      const response = await axios.post(`${API_URL}/Notification`, alldata)

      if (response.status === 200) {
        setPasswordNotficationCount(response.data.count)
        SetPasswordNotficationData(response.data.PasswordAlertData)
      }

    } catch (err) {
      console.log(err);
    }
  }

  const colmun = [
    { field: "employeecode" },
    { field: "employeename" },
    { field: "email" },
    {
      field: 'User Unlock',
      filter: false,
      sortable: false,
      floatingFilter: false,
      editable: false,
      cellRenderer: (params) => (
        <CTooltip content="Unlock">
          <CIcon
            size='xl'
            icon={cilLockUnlocked}
            className='m-2'
            onClick={() => handleUnlockPassword(params.data.id)}
            style={{ color: 'white', background: 'blue', borderRadius: '5px' }}
          />
        </CTooltip>
      )
    },
  ]

  const handleUnlockPassword = (id) => {
    swal({
      title: "Are you sure?",
      text: "Unlock The User Password",
      icon: "warning",
      buttons: [true, "Yes"],
      dangerMode: false,
    }).then(async (result) => {
      if (result) {
        try {
          const alldata = { mood: 'PU', id, branchid: auth.branchid } /// password unlock mood pu mean passowrd unlock

          const response = await axios.post(`${API_URL}/NotificationUpdate`, alldata)

          // console.log(response.status);

          if (response.status === 200) {
            swal({
              text: 'Unlock Password SuccessFully',
              icon: 'success'
            }).then(() => {
              setPasswordNotficationCount(null);
              SetPasswordNotficationData([]);
              setVisible(false);
              PasswordNotfictionFetch();
            })


          }
        }
        catch (err) {
          console.log(err);
        }
      }
    });

  }

  const defaultColDef = useMemo(() => ({
    filter: 'agTextColumnFilter',
    floatingFilter: true,

  }), []);

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

  const handleBranchChange = (id) => {
    try {
      if (!secureLocalStorageData) {
        throw new Error("No data in local storage");
      }

      const updatedData = { ...secureLocalStorageData, branchid: id };

      secureLocalStorage.removeItem('userData')

      // Save the updated data back to local storage
      secureLocalStorage.setItem("userData", updatedData);

      // Update the state
      setsecureLocalStorageData(updatedData);

      console.log(updatedData, secureLocalStorageData);

      setLoading(true);

      setTimeout(() => {
        setLoading(false);
        window.location.reload()
      }, 1000);

    } catch (error) {
      console.log(error);
      setLoading(false); // Set loading to false in case of an error
    }
  };

  const ApprovalPendingFetch = async () => {
    try {

      const alldata = { mood: 'AP', id: '', branchid: auth.branchid } /// fetch password data mood pd mean password data

      const response = await axios.post(`${API_URL}/ApprovalPendingNotification`, alldata)

      if (response.status === 200) {
        // set ApprovalPendingCount
        SetExternalLocationTransferCount(response.data.ExternalLocationTransferCount);
        SetInternalLocationTransferCount(response.data.InternalLocationTransferCount);
        SetInwardPendingCount(response.data.InwardPendingCount);
        SetInwardAssetCount(response.data.InwardAssetCount);
        // SetPaymentHistoryCount(response.data.PaymentHistoryCount);
        SetMaintenanceDoneCount(response.data.MaintenanceDoneCount);

        SetExternalTransferredData(response.data.ExternalLocationTransfer);
        SetInternalTransferredData(response.data.InternalLocationTransfer);
        SetInwardAssetData(response.data.InwardAsset);
        SetInwardPendingData(response.data.InwardPending);
        SetPaymentData(response.data.PaymentHistory);
        SetMaintenanceDoneData(response.data.MaintenanceDone);

      }
    } catch (err) {
      console.log(err);
    }
  }

  const ReminderNotification = async () => {
    try {

      const alldata = { mood: 'getReminder', id: '', branchid: auth.branchid } /// fetch password data mood pd mean password data

      const response = await axios.post(`${API_URL}/ReminderNotification`, alldata)
      if (response.status === 200) {
        const { ReminderCount } = response.data.reminderCount[0];
        SetReminderCount(ReminderCount);
        setReminderData(response.data.reminderData);

      }
    } catch (err) {
      console.log(err);
    }
  }

  useEffect(() => {

    if (auth.UserStatus === 'SA' || auth.UserStatus === 'A') {
      PasswordNotfictionFetch();
      ApprovalPendingFetch();
      CalculateDepreciation();
      ReminderNotification();
      GetInactiveStatusFetch();
    }

    FetchBranchDropdown();
    GetInactiveStatusFetch();

    const intervalLoop = () => {

      if (auth.UserStatus === 'SA' || auth.UserStatus === 'A') {
        PasswordNotfictionFetch();
        ApprovalPendingFetch();
        CalculateDepreciation();
        ReminderNotification();
        GetInactiveStatusFetch();
      }

    };

    const intervalId = setInterval(intervalLoop, 5000);

    return () => {

      if (auth.UserStatus === 'SA' || auth.UserStatus === 'A') {
        PasswordNotfictionFetch();
        ApprovalPendingFetch();
        CalculateDepreciation();
        ReminderNotification();
      }


      clearInterval(intervalId);
    };
  }, [])

  const CalculateDepreciation = async () => {
    try {
      const response = await axios.post(`${API_URL}/CalculateDepreciation`, { branchid: auth.branchid });
    } catch (err) {
      console.log(err);
    }

  }

  const [HelpData, SetHelpData] = useState({
    Name: "",
    EmailId: "",
    Comments: "",
    ToMail: "",
    branchid: auth.branchid
  })

  const handleSubmitHelp = async () => {
    try {

      if (HelpData.Name === '') {
        swal({
          text: 'Please Enter Name Before Submit Form !',
          icon: 'warning'
        })
        return
      }
      if (HelpData.EmailId === '') {
        swal({
          text: 'Please Enter Email Id Before Submit Form !',
          icon: 'warning'
        })
        return
      }
      if (HelpData.Comments === '') {
        swal({
          text: 'Please Enter Comments Before Submit Form !',
          icon: 'warning'
        })
        return
      }


      const response = await axios.post(`${API_URL}/Help-Desk-Mail`, HelpData)

      if (response.status === 200) {

        console.log(response);

        swal({
          text: `${response.data}`,
          icon: 'success'
        })
      }


    } catch (err) {
      console.log(err);
    }
  }

  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState([]);
  const hasApprovalAccess = (screenCode) =>
    permissions?.[screenCode]?.ApprovalStatus === "a" || auth.UserStatus === "SA";

  // Build notification list dynamically
  useEffect(() => {
    const newNotifs = [];
    if (PasswordNotficationCount > 0 && hasApprovalAccess("UC001")) {
      newNotifs.push({
        id: "userUnlock",
        label: "User Unlock",
        count: PasswordNotficationCount,
        icon: <FaUserLock className="text-danger fs-5" />,
        onClick: () => setVisible(prev => !prev),
      });
    }

    if (ExternalLocationTransferCount > 0 || InternalLocationTransferCount > 0 || InwardAssetCount > 0 || InwardPendingCount > 0
      // || PaymentHistoryCount > 0 
      || MaintenanceDoneCount > 0) {
      newNotifs.push({
        id: "approvalPending",
        label: "Approval Pending",
        count: ExternalLocationTransferCount + InternalLocationTransferCount + InwardAssetCount + InwardPendingCount +
          // PaymentHistoryCount +
          MaintenanceDoneCount + ReminderCount,
        icon: <FaExclamationCircle className="text-warning fs-5" />,
        onClick: () => setModalVisible(true),
      });
    }

    if (ReminderCount > 0) {
      newNotifs.push({
        id: "Reminder",
        label: "Reminder",
        count: ReminderCount,
        icon: <BsBellFill className="text-danger fs-5" />,
        onClick: () => setmodalReminderVisible(prev => !prev),
      });
    }
    if (InactiveNotficationCount > 0) {
      newNotifs.push({
        id: "ReaderStatus",
        label: "Reader Status",
        count: InactiveNotficationCount,
        icon: <FaBroadcastTower className="text-danger fs-5" />,
        onClick: () => setInactiveReadervisible(!InactiveReadervisible),
      });
    }
    setUnreadNotifications(newNotifs);
  }, [PasswordNotficationCount, ExternalLocationTransferCount, InternalLocationTransferCount, InwardAssetCount, InwardPendingCount
    // , PaymentHistoryCount
    , MaintenanceDoneCount, ReminderCount, setVisible, setModalVisible, InactiveNotficationCount]);

  // Auto-open dropdown when new unread notifications exist
  useEffect(() => {
    if (unreadNotifications.length > 0) {
      setDropdownVisible(true);
    }
  }, [unreadNotifications]);

  // Handle click → mark as read + close dropdown
  const handleNotificationClick = (notif) => {
    notif.onClick();
    // setUnreadNotifications((prev) => prev.filter((n) => n.id !== notif.id));
    setDropdownVisible(false);
  };

  const handleMarkAllAsRead = () => {
    setUnreadNotifications([]);
    setDropdownVisible(false);
  };

  const hasApproval = (permissions, screenCode) => {
    return permissions?.[screenCode]?.ApprovalStatus === 'a' || auth.UserStatus === 'SA';
  };

  const approvalTabs = [
    {
      key: 'MaintenanceDone',
      label: 'Maintenance Done',
      screen: 'MR002',
      count: ExternalLocationTransferCount
    },
    {
      key: 'ExternalLocationTransfer',
      label: 'External Location Transfer',
      screen: 'AM002',
      count: ExternalLocationTransferCount
    },
    {
      key: 'InternalLocationTransfer',
      label: 'Internal Location Transfer',
      screen: 'AM001',
      count: InternalLocationTransferCount
    },
    {
      key: 'InwardAsset',
      label: 'Inward Asset',
      screen: 'AM003',
      count: InwardAssetCount
    },
    {
      key: 'InwardPending',
      label: 'Inward Pending',
      screen: 'AM003',
      count: InwardPendingCount
    }
  ];

  const canShowAnyApprovalTab = approvalTabs.some(
    tab => hasApproval(permissions, tab.screen)
  );
  const GetInactiveStatusFetch = async () => {
    try {

      const alldata = { mood: 'GetInactiveStatus', id: '', branchid: auth.branchid } /// fetch password data mood pd mean password data

      const response = await axios.post(`${API_URL}/GetInactiveStatus`, alldata)

      if (response.status === 200) {
        const { InactiveCount, InactiveDetails } = response.data;
        SetInactiveNotficationCount(InactiveCount);
        SetInactiveNotficationData(InactiveDetails);
        // InactiveDetails.forEach(async (tool) => {
        //   if (!sentAntennaRef.current.has(tool.MachineID)) {
        //     // Send push notification
        //     await axios.post(`${API_URL}/api/send-notification`, {
        //       type: "Antenna Not Active",
        //       title: `Inactive IP Address:${tool.IPaddress} ,Antenna ID:${tool.AntennaID}`,
        //       body: `Machine ID: ${tool.MachineID} `,
        //     });
        //     // ✅ Update immediately
        //     sentAntennaRef.current.add(tool.MachineID);
        //   }
        // });
      }

    } catch (err) {
      console.log(err);
    }
  }
  const InactiveReadercolumn = [
    { field: "ReaderStatus" },
    { field: "AntennaStatus" },
    { field: "IPaddress" },
    { field: "AntennaID" },
    { field: "Issue" }
  ]

  
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
        size='lg'
        backdrop="static"
        visible={helpvisible}
        onClose={() => setHelpvisible(false)}
        aria-labelledby="StaticBackdropExampleLabel"
      >
        <CModalHeader className="bg-primary text-white d-flex justify-content-between">
          <div className="d-flex align-items-center">
            <BsFillInfoCircleFill className="me-2 fs-3" />
            <h5 className="mb-0">Help & Support</h5>
          </div>
        </CModalHeader>

        <CModalBody>
          {/* Contact Info */}
          <div className="bg-light rounded p-3 mb-4 shadow-sm">
            <CRow className="align-items-center">
              <CCol md={6}>
                <p className="mb-2">
                  <CIcon icon={cilEnvelopeClosed} className="me-2 text-primary" />
                  <strong>Email:</strong>
                  {/* info@rspm.co.in / support@rspm.co.in */}
                </p>
              </CCol>
              <CCol md={6}>
                <p className="mb-2">
                  <CIcon icon={cilPhone} className="me-2 text-primary" />
                  <strong>Phone:</strong>
                  {/* +91 9940021769 / +91 7904726741 */}
                </p>
              </CCol>
            </CRow>
          </div>

          {/* Help Form */}
          <CRow className="gy-3">
            <CCol md={6}>
              <CFormInput
                type="text"
                floatingLabel="Your Name"
                placeholder="Enter name"
                onChange={(e) => SetHelpData({ ...HelpData, Name: e.target.value })}
              />
            </CCol>

            <CCol md={6}>
              <CFormInput
                type="email"
                floatingLabel="Email Address"
                placeholder="Enter email"
                onChange={(e) => SetHelpData({ ...HelpData, EmailId: e.target.value })}
              />
            </CCol>

            <CCol xs={12}>
              <CFormTextarea
                floatingLabel="Your Message"
                placeholder="Describe your issue or feedback..."
                style={{ height: '150px' }}
                onChange={(e) => SetHelpData({ ...HelpData, Comments: e.target.value })}
              />
            </CCol>

            <CCol className="text-center mt-3">
              <CButton
                type="submit"
                color="primary"
                className="px-5 py-2"
                onClick={handleSubmitHelp}
              >
                <CIcon icon={cilExitToApp} className="me-2" />
                Submit
              </CButton>
            </CCol>
          </CRow>
        </CModalBody>
      </CModal>

      {/* Reminder Modal */}
      <CModal
        size="lg"
        scrollable
        visible={modalReminderVisible}
        onClose={() => setmodalReminderVisible(false)}
      >
        <CModalHeader className="bg-light">
          <CModalTitle className="fw-bold">🔔 Reminder Notifications</CModalTitle>
        </CModalHeader>

        <CModalBody style={{ maxHeight: "70vh", overflowY: "auto" }}>
          {ReminderData.length === 0 ? (
            <div className="text-center py-4 text-secondary">
              No reminders due today 🎉
            </div>
          ) : (
            ReminderData.map((item) => (
              <div
                key={item.ReminderID}
                className="p-3 mb-3 shadow-sm rounded border bg-white"
                style={{ cursor: "pointer" }}
              >
                <div className="d-flex justify-content-between">
                  <h5 className="fw-bold text-primary">{item.ReminderTitle}</h5>

                  <CBadge color="danger" className="py-2 px-3 fs-6">
                    Due Today
                  </CBadge>
                </div>

                <div className="text-muted small mt-1">
                  <b>Category:</b> {item.Category} / <b>SubCategory:</b> {item.SubCategory}
                </div>

                <div className="mt-2">{item.ReminderDescription}</div>

                {/* <div className="d-flex justify-content-end mt-3">
                  <CButton
                    color="success"
                    variant="outline"
                    className="me-2"
                    onClick={() => handleMarkAsDone(item)}
                  >
                    ✔ Mark as Done
                  </CButton>

                  <CButton
                    color="primary"
                    onClick={() => handleViewReminder(item)}
                  >
                    View Details
                  </CButton>
                </div> */}
              </div>
            ))
          )}
        </CModalBody>

        <CModalFooter>
          <CButton color="secondary" onClick={() => setmodalReminderVisible(false)}>
            Close
          </CButton>
        </CModalFooter>
      </CModal>

      <CModal
        size='lg'
        backdrop="static"
        visible={visible}
        onClose={() => setVisible(false)}
        aria-labelledby="StaticBackdropExampleLabel">
        <CModalHeader> User Unlock </CModalHeader>
        <CModalBody>

          <div className="ag-theme-quartz" style={{ height: 500 }}>
            <AgGridReact
              rowData={PasswordNotficationData}
              columnDefs={colmun}
              defaultColDef={defaultColDef}
              // onGridReady={onGridReady}
              rowSelection="multiple"
              pagination={true}
              paginationPageSize={10}
              paginationPageSizeSelector={[10, 15, 20]}
            />
          </div>

        </CModalBody>

      </CModal>


      <CModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        size="xl"
        backdrop="static"
      >
        <CModalHeader>
          <CModalTitle>Approval Pending</CModalTitle>
        </CModalHeader>
        <CModalBody>
          {canShowAnyApprovalTab && (
            <CNav variant="tabs" role="tablist" className="position-relative">

              {approvalTabs.map(tab => {
                if (!hasApproval(permissions, tab.screen)) return null;

                return (
                  <CNavItem key={tab.key} className="position-relative">
                    <CNavLink
                      active={activeTab === tab.key}
                      onClick={() => setActiveTab(tab.key)}
                    >
                      {tab.label}
                    </CNavLink>

                    {tab.count > 0 && (
                      <CBadge
                        color="danger"
                        shape="rounded-pill"
                        className="position-absolute top-0 start-100 translate-middle badge-glow"
                      >
                        {tab.count}
                      </CBadge>
                    )}
                  </CNavItem>
                );
              })}

            </CNav>
          )}

          <CTabContent>

            <CTabPane visible={activeTab === 'MaintenanceDone'}>
              <div className="ag-theme-quartz" style={{ height: 500 }}>
                <AgGridReact
                  rowData={MaintenanceDoneData}
                  columnDefs={generateColumnDefs(MaintenanceDoneData)}
                  defaultColDef={defaultColDef1}
                  rowSelection="multiple"
                  pagination={true}
                  paginationPageSize={10}
                  paginationPageSizeSelector={[10, 15, 20]}
                />
              </div>
            </CTabPane>

            <CTabPane visible={activeTab === 'ExternalLocationTransfer'}>
              <div className="ag-theme-quartz" style={{ height: 500 }}>
                <AgGridReact
                  rowData={ExternalTransferredData}
                  columnDefs={generateColumnDefs(ExternalTransferredData)}
                  defaultColDef={defaultColDef1}
                  rowSelection="multiple"
                  pagination={true}
                  paginationPageSize={10}
                  paginationPageSizeSelector={[10, 15, 20]}
                  onGridReady={(params) => setExternalGridApi(params.api)}
                />
              </div>
            </CTabPane>

            <CTabPane visible={activeTab === 'InternalLocationTransfer'}>
              <div className="ag-theme-quartz" style={{ height: 500 }}>
                <AgGridReact
                  rowData={InternalTransferredData}
                  columnDefs={generateColumnDefs(InternalTransferredData)}
                  defaultColDef={defaultColDef1}
                  rowSelection="multiple"
                  pagination={true}
                  paginationPageSize={10}
                  paginationPageSizeSelector={[10, 15, 20]}
                  onGridReady={(params) => setInternalGridApi(params.api)}
                />
              </div>
            </CTabPane>

            <CTabPane visible={activeTab === 'InwardAsset'}>
              <div className="ag-theme-quartz" style={{ height: 500 }}>
                <AgGridReact
                  rowData={InwardAssetData}
                  columnDefs={generateColumnDefs(InwardAssetData)}
                  defaultColDef={defaultColDef1}
                  rowSelection="multiple"
                  pagination={true}
                  paginationPageSize={10}
                  paginationPageSizeSelector={[10, 15, 20]}
                  onGridReady={(params) => setInwardGridApi(params.api)}

                />
              </div>
            </CTabPane>

            <CTabPane visible={activeTab === 'InwardPending'}>
              <div className="ag-theme-quartz" style={{ height: 500 }}>
                <AgGridReact
                  rowData={InwardPendingData}
                  columnDefs={generateColumnDefs(InwardPendingData)}
                  defaultColDef={defaultColDef1}
                  rowSelection="multiple"
                  pagination={true}
                  paginationPageSize={10}
                  paginationPageSizeSelector={[10, 15, 20]}
                />
              </div>
            </CTabPane>

          </CTabContent>

        </CModalBody>
      </CModal>

      <CModal
        size="xl"
        backdrop="static"
        visible={InactiveReadervisible}
        onClose={() => setInactiveReadervisible(false)}
        aria-labelledby="StaticBackdropExampleLabel"
      >
        <CModalHeader>Inactive Reader/Antenna Status</CModalHeader>
        <CModalBody>
          <button
            className="btn btn-success mb-2"
            onClick={exportToExcel}
          >
            Export to Excel
          </button>

          <div className="ag-theme-quartz" style={{ height: 500 }}>
            <AgGridReact
              ref={gridRef}
              rowData={InactiveNotficationData}
              columnDefs={InactiveReadercolumn}
              defaultColDef={defaultColDef}
              rowSelection="multiple"
              pagination={true}
              paginationPageSize={10}
              paginationPageSizeSelector={[10, 15, 20]}
            />
          </div>
        </CModalBody>
      </CModal>


      <CHeader position="sticky" className="p-0 mb-3" ref={headerRef}>
        <CContainer className="border-bottom px-4" fluid>
          <CHeaderToggler
            onClick={() => dispatch({ type: 'set', sidebarShow: !sidebarShow })}
            style={{ marginInlineStart: '-14px' }}
          >
            <CIcon icon={cilMenu} size="xxl" />
          </CHeaderToggler>


          <CHeaderNav className="d-none d-md-flex">
            <CNavItem>
              <CFormSelect
                aria-label="Default select example"
                options={[
                  { label: 'Select Branch Name', value: '', disabled: true },
                  ...(BranchDropDown?.filter(option =>
                    auth.UserStatus === 'SA' ||
                    auth.BranchAccess?.split(',').includes(option.branchid.toString())
                  ).length > 1
                    ? [{ label: 'ALL', value: 0 }]  // ✅ Show 'ALL' only if more than one branch
                    : []
                  ),
                  ...BranchDropDown
                    .filter(option =>
                      auth.UserStatus === 'SA' ||
                      auth.BranchAccess?.split(',').includes(option.branchid.toString())
                    )
                    .map(option => ({
                      label: option.branchName.toUpperCase(),
                      value: option.branchid
                    }))
                ]}
                onChange={(e) => handleBranchChange(e.target.value)}
                disabled={loading}
                value={DefaultSelectedBrach}
              />

            </CNavItem>
          </CHeaderNav>

          <CHeaderNav className="ms-auto">
            <CNavItem>
            </CNavItem>
          </CHeaderNav>

          <CHeaderNav>
            <CDropdown
              variant="nav-item"
              visible={dropdownVisible}
              onShow={() => setDropdownVisible(true)}
              onHide={() => setDropdownVisible(false)}
              placement="bottom-end"
              popper={false}
            >
              <CDropdownToggle
                caret={false}
                className='position-relative'
              >
                <FaBell className="text-primary fs-2" />
                <CBadge
                  color="danger"
                  className="position-absolute rounded-pill glowing-badge"
                  style={{
                    top: "2px",
                    right: "0px",
                    display: unreadNotifications.length > 0 ? "block" : "none",
                  }}
                >
                  {unreadNotifications.reduce((sum, n) => sum + n.count, 0)}
                </CBadge>
              </CDropdownToggle>

              <CDropdownMenu
                className="dropdown-menu-end pt-0 shadow-lg rounded-3"
                style={{ width: "320px" }}
              >
                {/* <div className="d-flex justify-content-between align-items-center p-3 border-bottom fw-bold" style={{ cursor: 'pointer' }}>
                  <span>Notifications</span>
                  {unreadNotifications.length > 0 && (
                    <button
                      className="btn btn-sm btn-dark"
                      onClick={handleMarkAllAsRead}
                    >
                      Notified
                    </button>
                  )}
                </div> */}
                {unreadNotifications.length === 0 ? (
                  <div className="p-3 text-center text-muted">No new alerts 🎉</div>
                ) : (
                  unreadNotifications.map((notif) => (
                    <div
                      key={notif.id}
                      className="d-flex align-items-center justify-content-between px-3 py-2 border-bottom hover:bg-light"
                      onClick={() => handleNotificationClick(notif)}
                      style={{ cursor: 'pointer' }}
                    >
                      <div className="d-flex align-items-center gap-2">
                        {notif.icon}
                        <div className="d-flex flex-column">
                          <span className="fw-semibold">{notif.label}</span>
                          <small className="text-muted">Just now</small>
                        </div>
                      </div>
                      <CBadge color="danger">{notif.count}</CBadge>
                    </div>
                  ))
                )}
              </CDropdownMenu>
            </CDropdown>
          </CHeaderNav>

          <CHeaderNav >
            <CNavItem>
              <IoHelpCircle style={{ cursor: 'pointer' }} onClick={() => setHelpvisible(!visible)} className={` fs-1 `} />
            </CNavItem>
          </CHeaderNav>

          <CHeaderNav>
            <CDropdown variant="nav-item" placement="bottom-end">
              <CDropdownToggle caret={false}>
                {colorMode === 'dark' ? (
                  <CIcon icon={cilMoon} size="xl" />
                ) : colorMode === 'auto' ? (
                  <CIcon icon={cilContrast} size="xl" />
                ) : (
                  <CIcon icon={cilSun} size="xl" />
                )}
              </CDropdownToggle>
              <CDropdownMenu>
                <CDropdownItem
                  active={colorMode === 'light'}
                  className="d-flex align-items-center"
                  as="button"
                  type="button"
                  onClick={() => setColorMode('light')}
                >
                  <CIcon className="me-2" icon={cilSun} size="xl" /> Light
                </CDropdownItem>
                <CDropdownItem
                  active={colorMode === 'dark'}
                  className="d-flex align-items-center"
                  as="button"
                  type="button"
                  onClick={() => setColorMode('dark')}
                >
                  <CIcon className="me-2" icon={cilMoon} size="xl" /> Dark
                </CDropdownItem>
                <CDropdownItem
                  active={colorMode === 'auto'}
                  className="d-flex align-items-center"
                  as="button"
                  type="button"
                  onClick={() => setColorMode('auto')}
                >
                  <CIcon className="me-2" icon={cilContrast} size="xl" /> Auto
                </CDropdownItem>
              </CDropdownMenu>
            </CDropdown>
            <AppHeaderDropdown auth={auth} ipAddress={ipAddress} />
          </CHeaderNav>
        </CContainer>

        <CContainer className="px-4" fluid style={{ background: 'linear-gradient(to right, #F2F2F7)' }}>


          <AppBreadcrumb />
        </CContainer>
      </CHeader>
    </>
  )
}

AppHeader.propTypes = {
  auth: PropTypes.any, // Replace 'any' with the appropriate type based on what 'auth' contains
  ipAddress: PropTypes.any
};

export default AppHeader
