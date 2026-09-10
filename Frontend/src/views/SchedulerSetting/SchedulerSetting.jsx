import React, { useEffect, useMemo, useRef, useState } from 'react';
import Select from "react-select";
import axios from "axios";
import { getConfig } from 'src/config';
import { CCard, CCardBody, CCardHeader, CButton, CNav, CNavItem, CNavLink, CTabContent, CTabPane, CTable, CTableHead, CTableRow, CTableHeaderCell, CTableBody, CFormSwitch, CTableDataCell, CModal, CModalHeader, CModalTitle, CModalBody, CFormLabel, CFormInput, CFormTextarea, CModalFooter } from "@coreui/react";
import PropTypes from 'prop-types';
import Swal from 'sweetalert2';
import swal from 'sweetalert';
import DatePicker from 'react-multi-date-picker';
import InputIcon from 'react-multi-date-picker/components/input_icon';
import { AgGridReact } from 'ag-grid-react';
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import { IoEye } from 'react-icons/io5';
import { right } from '@popperjs/core';
import { FaEdit, FaRemoveFormat } from 'react-icons/fa';
import { FaDeleteLeft } from 'react-icons/fa6';
import { MdDelete, MdEdit } from 'react-icons/md';
import secureLocalStorage from 'react-secure-storage';

const SchedulerSetting = ({ auth }) => {

  const API_URL = getConfig().REACT_APP_API_URL;
  const [activeKey, setActiveKey] = useState(1)
  const [showModal, setShowModal] = useState(false);
  const [selectedReminder, setSelectedReminder] = useState(null);
  const gridRef = useRef(null);
  const [SchedulerReg, setSchedulerReg] = useState({
    AuditCode: "",
    AuditType: "",
    Fromdate: "",
    Todate: "",
    Status: "",
    Mode: ""
  });
  const [modalMode, setModalMode] = useState(''); // 'view' or 'edit'

  let pageData = location.state?.pageData;
  if (!pageData) {
    const storedData = secureLocalStorage.getItem('pageData');
    pageData = storedData || {};
  }
  const handleSchedulerAdd = async () => {
    try {
      const data = { ...SchedulerReg, Mode: 'I', Status: 'Active', branchid: auth.branchid, BranchAccess: auth.BranchAccess, Createdby: auth.empid, Updatedby: '', Id: '' }
      const response = await axios.post(`${API_URL}/SchedulerSettingAPI`, data);
      if (response.status === 200) {
        swal({
          title: "Success",
          text: "Schedular Added Successfully",
          icon: "success",
        }).then(() => {
          setSchedulerReg({
            AuditCode: "",
            AuditType: "",
            Fromdate: "",
            Todate: "",
            Status: "",
            Mode: ''
          });
          getReminderList();
        })
      }
    } catch (error) {
      console.error('Error fetching user details:', error);
    }
  };
  const [Schedulerdata, setSchedulerdata] = useState([]);

  const getReminderList = async () => {
    try {
      const data = { ...SchedulerReg, Mode: 'S', branchid: auth.branchid, BranchAccess: auth.BranchAccess, Createdby: auth.empid, Updatedby: '', Id: '' }
      const response = await axios.post(`${API_URL}/SchedulerSettingAPI`, data);
      if (response.status === 200) {
        setSchedulerdata(response.data);
        console.log("🚀 ~ FetchAllReminder ~ response.data:", response.data)
      }
    } catch (error) {
      console.error('Error fetching user details:', error);
    }
  };

  const handleUpdateScheduler = async () => {
    try {
      const data = { ...selectedReminder, mode: 'U', branchid: auth.branchid, BranchAccess: auth.BranchAccess, Createdby: '', Updatedby: auth.empid }
      const response = await axios.post(`${API_URL}/SchedulerSettingAPI`, data);
      if (response.status === 200) {
        swal({
          title: "Success",
          text: "Reminder Updated Successfully",
          icon: "success",
        }).then(() => {
          setShowModal(false);
          getReminderList();
        }
        );
      }
    } catch (error) {
      console.error('Error fetching user details:', error);
    }
  };

  // Clear Form
  const handleClear = () => {
    setSchedulerReg({
      AuditCode: "",
      AuditType: "",
      Fromdate: "",
      Todate: "",
      Status: "",
      Mode: ""
    });
  };

  const ViewRenderer = (params) => {
    if (pageData.viewstatus === null || pageData.viewstatus === 'i') return null;
    return (
      <div>
        <button
          className="border-0 rounded-circle d-flex justify-content-center align-items-center"
          style={{ width: "40px", height: "40px", boxShadow: "0 2px 6px rgba(0,0,0,0.15)" }}
          onClick={() => handleView(params.data.id)}
          data-bs-toggle="modal"
          data-bs-target="#exampleModalView"  // ✅ same modal
          title="View Details"
        >
          <IoEye className="fs-5 text-dark" />
        </button>
      </div>
    );
  };

  const EditRenderer = (params) => {
    if (pageData.editstatus === null || pageData.editstatus === 'i') return null;
    return (
      <div>
        <button
          className="border-0 rounded-circle d-flex justify-content-center align-items-center"
          style={{ width: "40px", height: "40px", boxShadow: "0 2px 6px rgba(0,0,0,0.15)" }}
          onClick={() => handleEdit(params.data.id)}
          data-bs-toggle="modal"
          data-bs-target="#exampleModalView"  // ✅ same modal
          title="Edit"
        >
          <MdEdit className="fs-5 text-warning" />
        </button>
      </div>
    );
  };

  const handleDelete = async (id) => {
    // ✅ Confirmation before delete
    const confirm = await swal({
      title: "Are you sure?",
      text: "Do you want to delete this Scheduler? This action cannot be undone.",
      icon: "warning",
      buttons: {
        cancel: {
          text: "Cancel",
          value: null,
          visible: true,
        },
        confirm: {
          text: "Yes, Delete it!",
          value: true,
          className: "btn-danger",
        },
      },
      dangerMode: true,
    });

    if (!confirm) return; // ✅ User clicked Cancel — stop here

    try {
      const alldata = {
        ...SchedulerReg,
        Mode: 'D',
        branchid: auth.branchid,
        BranchAccess: auth.BranchAccess,
        Createdby: auth.empid,
        Updatedby: '',
        Id: id
      };

      const response = await axios.post(`${API_URL}/SchedulerSettingAPI`, alldata);

      if (response.status === 200) {
        swal({
          title: "Deleted!",
          text: "Scheduler Deleted Successfully.",
          icon: "success",
        }).then(() => {
          getReminderList();
        });
      }

    } catch (error) {
      console.error('ERROR DELETE RECORD:', error);
      swal({
        title: "Error",
        text: "Something went wrong while deleting. Please try again.",
        icon: "error",
      });
    }
  };

  const handleView = (id) => {
    const selectedRow = gridRef.current.api.getRowNode(
      gridRef.current.api.getModel().rowsToDisplay.findIndex(r => r.data.id === id)
    )?.data;
    console.log("🚀 ~ handleView ~ selectedRow:", selectedRow)

    // ✅ Populate state from grid row directly
    setSchedulerReg({
      AuditCode: selectedRow?.AuditCode || '',
      AuditType: selectedRow?.AuditType || '',
      Fromdate: selectedRow?.FromDate || '',
      Todate: selectedRow?.ToDate || '',
      Status: selectedRow?.Status || '',
      Mode: 'V',
      Id: selectedRow?.id || id,
    });
    setModalMode('view'); // 🔒 Read-only
  };

  const handleEdit = (id) => {
    const selectedRow = gridRef.current.api.getRowNode(
      gridRef.current.api.getModel().rowsToDisplay.findIndex(r => r.data.id === id)
    )?.data;

    // ✅ Populate state from grid row
    setSchedulerReg({
      AuditCode: selectedRow?.AuditCode || '',
      AuditType: selectedRow?.AuditType || '',
      Fromdate: selectedRow?.FromDate || '',
      Todate: selectedRow?.ToDate || '',
      Status: selectedRow?.Status || '',
      Mode: 'E',
      Id: selectedRow?.id || id,
    });
    setModalMode('edit'); // ✏️ Editable
  };

  const handleUpdate = async () => {
    try {
      const alldata = {
        ...SchedulerReg,
        Mode: 'US',
        branchid: auth.branchid,
        BranchAccess: auth.BranchAccess,
        Createdby: auth.empid,
      };

      const response = await axios.post(`${API_URL}/SchedulerSettingAPI`, alldata);

      if (response.status === 200) {
        swal({
          title: "Success",
          text: "Scheduler Updated Successfully",
          icon: "success",
        }).then(() => {
          // ✅ Close modal programmatically
          const modal = window.bootstrap.Modal.getInstance(
            document.getElementById('exampleModalView')
          );
          modal?.hide();
          handleClear();
          getReminderList();
        });
      }
    } catch (error) {
      console.error('ERROR UPDATE RECORD:', error);
      swal({ title: "Error", text: "Update failed. Please try again.", icon: "error" });
    }
  };

  const DeleteRenderer = (params) => {
    if ((pageData.deletestatus === null || pageData.deletestatus === 'i') && auth.UserStatus === 'A') {
      return null; // Hide the button by returning null
    }
    return <div>
      <button className="border-0 mt-1 rounded-circle d-flex justify-content-center align-items-center"
        style={{
          width: "40px",
          height: "40px",
          cursor: 'pointer',
          background: "rgba(25, 135, 84, 0.15)",
          border: "1px solid rgba(25, 135, 84, 0.3)",
          color: "#dd3131",
          transition: "all 0.3s ease",
          boxShadow: "0 2px 6px rgba(0, 0, 0, 0.1)",
        }}

        onMouseEnter={(e) => {
          e.currentTarget.style.background = "rgba(25,135,84,0.25)";
          e.currentTarget.style.transform = "scale(1.1)";
          e.currentTarget.style.boxShadow = "0 4px 12px rgba(25,135,84,0.3)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "rgba(25,135,84,0.15)";
          e.currentTarget.style.transform = "scale(1)";
          e.currentTarget.style.boxShadow = "0 2px 6px rgba(0, 0, 0, 0.1)";
        }} onClick={() => handleDelete(params.data.id)} >
        <MdDelete className="fs-5" />
      </button>
    </div>

  };

  const columndef = [
    {
      width: 50,
      headerName: "S.No",
      valueGetter: "node.rowIndex + 1",
      width: 80,
      pinned: 'left',
      headerCheckboxSelection: true, checkboxSelection: true,
    },
    {
      headerName: "Audit Code", headerClass: 'agheader', field: "AuditCode", filter: true, floatingFilter: true, editable: true, editable: true,
      valueGetter: (params) => {
        const value = params.data?.AuditCode;
        return value || "-";
      }
    },
    {
      headerName: "Audit Type", headerClass: 'agheader', field: "AuditType", filter: true, floatingFilter: true, editable: true, editable: true,
      valueGetter: (params) => {
        const value = params.data?.AuditType;
        return value || "-";
      }
    },
    {
      headerName: "Audit Start Date", headerClass: 'agheader', field: "FromDate", filter: true, floatingFilter: true, editable: true, editable: true,
      valueGetter: (params) => {
        const date = params.data.FromDate;
        if (!date) return '-';
        const d = new Date(date);
        const yyyy = d.getUTCFullYear();
        const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
        const dd = String(d.getUTCDate()).padStart(2, '0');
        const hh = String(d.getUTCHours()).padStart(2, '0');
        const mi = String(d.getUTCMinutes()).padStart(2, '0');
        const ss = String(d.getUTCSeconds()).padStart(2, '0');
        const ms = String(d.getUTCMilliseconds()).padStart(3, '0');
        // return `${dd}-${mm}-${yyyy}`;
        return `${dd}-${mm}-${yyyy} `;
      },
    },
    {
      headerName: "Audit End Date", headerClass: 'agheader', field: "ToDate", filter: true, floatingFilter: true, editable: true, editable: true,
       valueGetter: (params) => {
        const date = params.data.ToDate;
        if (!date) return '-';
        const d = new Date(date);
        const yyyy = d.getUTCFullYear();
        const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
        const dd = String(d.getUTCDate()).padStart(2, '0');
        const hh = String(d.getUTCHours()).padStart(2, '0');
        const mi = String(d.getUTCMinutes()).padStart(2, '0');
        const ss = String(d.getUTCSeconds()).padStart(2, '0');
        const ms = String(d.getUTCMilliseconds()).padStart(3, '0');
        // return `${dd}-${mm}-${yyyy}`;
        return `${dd}-${mm}-${yyyy} `;
      },
    },
   
    {
      headerName: "Created By", headerClass: 'agheader', filter: true, floatingFilter: true, editable: true, field: "Createdby",
      valueGetter: (params) => {
        const value = params.data?.Createdby;
        return value || "-";
      }
    },

    {
      headerName: "Created Date", headerClass: 'agheader', filter: true, floatingFilter: true, editable: true, field: "Createddate",
      valueGetter: (params) => {
        const date = params.data.Createddate;
        if (!date) return '-';
        const d = new Date(date);
        const yyyy = d.getUTCFullYear();
        const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
        const dd = String(d.getUTCDate()).padStart(2, '0');
        const hh = String(d.getUTCHours()).padStart(2, '0');
        const mi = String(d.getUTCMinutes()).padStart(2, '0');
        const ss = String(d.getUTCSeconds()).padStart(2, '0');
        const ms = String(d.getUTCMilliseconds()).padStart(3, '0');
        // return `${dd}-${mm}-${yyyy}`;
        return `${dd}-${mm}-${yyyy} ${hh}:${mi}:${ss}`;
      },
    },

    {
      headerName: "Last Modified By", headerClass: 'agheader', filter: true, floatingFilter: true, editable: true, field: "UpdatedBy",
      valueGetter: (params) => {
        const value = params.data?.Updatedby;
        return value || "-";
      }
    },
    {
      headerName: "Last Modified Date", headerClass: 'agheader', filter: true, floatingFilter: true, editable: true, field: "Updateddate",
      valueGetter: (params) => {
        const date = params.data.Updateddate;
        if (!date) return '-';
        const d = new Date(date);
        const yyyy = d.getUTCFullYear();
        const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
        const dd = String(d.getUTCDate()).padStart(2, '0');
        const hh = String(d.getUTCHours()).padStart(2, '0');
        const mi = String(d.getUTCMinutes()).padStart(2, '0');
        const ss = String(d.getUTCSeconds()).padStart(2, '0');
        const ms = String(d.getUTCMilliseconds()).padStart(3, '0');
        // return `${dd}-${mm}-${yyyy}`;
        return `${dd}-${mm}-${yyyy} ${hh}:${mi}:${ss}`;
      },
    },
    { headerName: "View", headerClass: 'agheader', field: "View", cellRenderer: ViewRenderer, pinned: right, width: 90 },
    { headerName: (pageData.editstatus === null || pageData.editstatus === 'i') && auth.UserStatus === 'A' ? '' : 'Edit', field: "Edit", cellRenderer: EditRenderer, headerClass: 'agheader', width: 80, pinned: right },
    { headerName: (pageData.deletestatus === null || pageData.deletestatus === 'i') && auth.UserStatus === 'A' ? '' : 'Delete', field: "Delete", cellRenderer: DeleteRenderer, headerClass: 'agheader', width: 80, pinned: right },
  ]

  const autoGroupColumnDef = useMemo(() => {
    return {
      headerCheckboxSelection: true,
      field: "id",
      flex: 1,
      minWidth: 240,
      cellRendererParams: {
        checkbox: true,
      },
    };
  }, []);
  // Table for All Asset
  const pagination = true;
  const paginationPageSize = 50;
  const paginationPageSizeSelector = [10, 20, 50];

  useEffect(() => {
    getReminderList();
  }, [])


  return (
    <div className="container mt-4">
      <CNav variant="pills" role="tablist" className='mb-3'>
        <CNavItem>
          <CNavLink active={activeKey === 1} onClick={() => setActiveKey(1)}>
            Scheduler Create
          </CNavLink>
        </CNavItem>
      </CNav>
      <CTabContent>

        <CTabPane role="tabpanel" aria-labelledby="home-tab" visible={activeKey === 1}>

          <div className="modal fade" id="exampleModalView" tabIndex="-1" aria-labelledby="viewEditModalLabel">
            <div className="modal-dialog modal-lg modal-dialog-centered">
              <div className="modal-content">

                {/* ── Header ── */}
                <div className="modal-header">
                  <h5 className="modal-title" id="viewEditModalLabel">
                    {modalMode === 'view' ? (
                      <><i className="bi bi-eye me-2 text-primary"></i>View Scheduler</>
                    ) : (
                      <><i className="bi bi-pencil-square me-2 text-warning"></i>Edit Scheduler</>
                    )}
                  </h5>
                  <button
                    type="button"
                    className="btn-close"
                    data-bs-dismiss="modal"
                    onClick={handleClear}
                  ></button>
                </div>

                {/* ── Body ── */}
                <div className="modal-body">
                  <div className="row g-4">

                    {/* Audit Code */}
                    <div className="col-lg-3">
                      <label className="fw-semibold">Audit Code</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Enter Audit Code"
                        value={SchedulerReg.AuditCode}
                        disabled={modalMode === 'view'} // 🔒 locked in view
                        onChange={e =>
                          setSchedulerReg({ ...SchedulerReg, AuditCode: e.target.value })
                        }
                      />
                    </div>

                    {/* Audit Type */}
                    <div className="col-lg-3">
                      <label className="fw-semibold">Audit Type</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Enter Audit Type"
                        value={SchedulerReg.AuditType}
                        disabled={modalMode === 'view'} // 🔒 locked in view
                        onChange={e =>
                          setSchedulerReg({ ...SchedulerReg, AuditType: e.target.value })
                        }
                      />
                    </div>

                    {/* From Date */}
                    <div className="col-lg-3">
                      <label className="fw-semibold">From Date</label>
                      <DatePicker
                        render={<InputIcon className="form-control" placeholder="From Date" />}
                        onChange={(date) => {
                          if (modalMode === 'view') return;
                          setSchedulerReg({ ...SchedulerReg, Fromdate: date.format('YYYY-MM-DD') });
                        }}
                        value={SchedulerReg.Fromdate ? new Date(SchedulerReg.Fromdate) : null}  // ✅ ISO string → Date object works fine
                        readOnly={modalMode === 'view'}
                      />
                    </div>

                    {/* To Date */}
                    <div className="col-lg-3">
                      <label className="fw-semibold">To Date</label>
                      <DatePicker
                        render={<InputIcon className="form-control" placeholder="To Date" />}
                        onChange={(date) => {
                          if (modalMode === 'view') return;
                          setSchedulerReg({ ...SchedulerReg, Todate: date.format('YYYY-MM-DD') });
                        }}
                        value={SchedulerReg.Todate ? new Date(SchedulerReg.Todate) : null}      // ✅ ISO string → Date object works fine
                        readOnly={modalMode === 'view'}
                      />
                    </div>

                    {/* Status */}
                    <div className="col-lg-3">
                      <label className="fw-semibold">Status</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Status"
                        value={SchedulerReg.Status}
                        disabled={modalMode === 'view'} // 🔒 locked in view
                        onChange={e =>
                          setSchedulerReg({ ...SchedulerReg, Status: e.target.value })
                        }
                      />
                    </div>

                  </div>
                </div>

                {/* ── Footer ── */}
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    data-bs-dismiss="modal"
                    onClick={handleClear}
                  >
                    {modalMode === 'view' ? 'Close' : 'Cancel'}
                  </button>

                  {/* ✅ Show Update button only in edit mode */}
                  {modalMode === 'edit' && (
                    <button
                      type="button"
                      className="btn btn-primary px-4"
                      onClick={handleUpdate}
                    >
                      Update
                    </button>
                  )}
                </div>

              </div>
            </div>
          </div>


          <CCard className="shadow-sm border-0" style={{ borderRadius: "18px" }}>
            <div className="card-header pro-header p-1">
              <div className="d-flex justify-content-center align-items-center">
                {/* Center Title */}
                <div className="text-center text-white" >
                  <h4 className=" fw-bold m-0 text-white">Scheduler Creation</h4>
                </div>
              </div>
            </div>


            <CCardBody className='py-3'>
              <div className="row g-4">
                {/* Audit Code */}
                <div className="col-lg-3">
                  <label className="fw-semibold">Audit Code</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Enter Title"
                    value={SchedulerReg.AuditCode}
                    onChange={e =>
                      setSchedulerReg({ ...SchedulerReg, AuditCode: e.target.value })
                    }
                  />
                </div>

                {/* audit Type */}
                <div className="col-lg-3">
                  <label className="fw-semibold">Audit Type</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Enter Title"
                    value={SchedulerReg.AuditType}
                    onChange={e =>
                      setSchedulerReg({ ...SchedulerReg, AuditType: e.target.value })
                    }
                  />
                </div>

                {/* From date */}
                <div className="col-lg-3">
                  <div className="row align-items-center">
                    <div className="col-6">
                      <CFormLabel className="fw-semibold mb-0">
                        From Date
                      </CFormLabel>
                    </div>
                    <div className="col-12">
                      <DatePicker
                        render={<InputIcon className="form-control" placeholder="From Date" />}
                        onChange={(date) => {
                          const formattedDate = date.format('YYYY-MM-DD');
                          setSchedulerReg({ ...SchedulerReg, Fromdate: formattedDate });
                        }}
                        value={SchedulerReg.Fromdate ? new Date(SchedulerReg.Fromdate) : null}
                      />
                    </div>
                  </div>
                </div>

                {/* To date */}
                <div className="col-lg-3">
                  <div className="row align-items-center">
                    <div className="col-6">
                      <CFormLabel className="fw-semibold mb-0">
                        To Date
                      </CFormLabel>
                    </div>
                    <div className="col-12">
                      <DatePicker
                        render={<InputIcon className="form-control" placeholder="To Date" />}
                        onChange={(date) => {
                          const formattedDate = date.format('YYYY-MM-DD');
                          setSchedulerReg({ ...SchedulerReg, Todate: formattedDate });
                        }}
                        value={SchedulerReg.Todate ? new Date(SchedulerReg.Todate) : null}
                      />
                    </div>
                  </div>
                </div>

              </div>

              {/* Buttons */}
              <div className="text-end mt-4">
                <CButton color="danger" className="me-2 px-4" onClick={handleClear}>
                  Clear
                </CButton>
                <CButton color="primary" className="px-4" onClick={handleSchedulerAdd}>
                  Add Schedule
                </CButton>
              </div>
            </CCardBody>
          </CCard>
          <div style={{ height: "500px" }} className='ag-theme-quartz mt-2'>
            {/* <div className='d-flex justify-content-end'>
                                  <h6 className='text-end mt-2'>Total Rows : </h6><h5 className='badge bg-dark ms-1 fs-6'>{rowCount}</h5>
                              </div> */}
            <AgGridReact
              ref={gridRef}
              rowData={Schedulerdata}
              columnDefs={columndef}
              rowSelection={"multiple"}
              getRowHeight={() => 65}
              // onGridReady={(params) => setGridApi(params.api)}
              autoGroupColumnDef={autoGroupColumnDef} pagination={pagination} paginationPageSize={paginationPageSize} paginationPageSizeSelector={paginationPageSizeSelector}
            />

          </div>
        </CTabPane>

        <CModal visible={showModal} onClose={() => setShowModal(false)}>
          <CModalHeader closeButton>
            <CModalTitle>Update Reminder</CModalTitle>
          </CModalHeader>

          <CModalBody>
            {selectedReminder && (
              <>
                <CFormLabel>Title</CFormLabel>
                <CFormInput
                  value={selectedReminder.ReminderTitle}
                  onChange={(e) =>
                    setSelectedReminder({ ...selectedReminder, ReminderTitle: e.target.value })
                  }
                />

                <CFormLabel className="mt-2">Reminder Description</CFormLabel>
                <CFormTextarea
                  value={selectedReminder.ReminderDescription}
                  onChange={(e) =>
                    setSelectedReminder({ ...selectedReminder, ReminderDescription: e.target.value })
                  }
                />
                <CFormLabel className="mt-2">Reminder Days</CFormLabel>
                <CFormInput
                  type='number'
                  value={selectedReminder.ReminderDays}
                  onChange={(e) =>
                    setSelectedReminder({ ...selectedReminder, ReminderDays: e.target.value })
                  }
                />

                <CFormLabel className="mt-2">Reminder Mode</CFormLabel>
                <Select
                  options={[
                    { value: "Once", label: "Once" },
                    { value: "Repeated", label: "Repeated" }
                  ]}
                  value={
                    selectedReminder.ReminderMode
                      ? { value: selectedReminder.ReminderMode, label: selectedReminder.ReminderMode }
                      : null
                  }
                  onChange={selected =>
                    setSelectedReminder({ ...selectedReminder, ReminderMode: selected?.value || "" })
                  }
                  isClearable
                  placeholder="Select Reminder Mode"
                />
              </>
            )}
          </CModalBody>

          <CModalFooter>
            <CButton color="secondary" onClick={() => setShowModal(false)}>
              Cancel
            </CButton>
            <CButton color="primary" onClick={handleUpdateScheduler}>
              Update
            </CButton>
          </CModalFooter>
        </CModal>


      </CTabContent>

    </div>
  );
};
SchedulerSetting.propTypes = {
  auth: PropTypes.any.isRequired,
};
export default SchedulerSetting;
