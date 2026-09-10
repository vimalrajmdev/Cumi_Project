import React, { useEffect, useState } from 'react';
import Select from "react-select";
import axios from "axios";
import { getConfig } from 'src/config';
import { CCard, CCardBody, CCardHeader, CButton, CNav, CNavItem, CNavLink, CTabContent, CTabPane, CTable, CTableHead, CTableRow, CTableHeaderCell, CTableBody, CFormSwitch, CTableDataCell, CModal, CModalHeader, CModalTitle, CModalBody, CFormLabel, CFormInput, CFormTextarea, CModalFooter } from "@coreui/react";
import PropTypes from 'prop-types';
import Swal from 'sweetalert2';
import swal from 'sweetalert';

const ReminderSettings = ({ auth }) => {

  const API_URL = getConfig().REACT_APP_API_URL;
  const [activeKey, setActiveKey] = useState(1)
  const [showModal, setShowModal] = useState(false);
  const [selectedReminder, setSelectedReminder] = useState(null);

  const [ReminderReg, setReminderReg] = useState({
    Category: "",
    SubCategory: "",
    ReminderType: "",
    ReminderTitle: "",
    ReminderDays: "",
    ReminderDescription: "",
    ReminderMode: "",
    ReminderStatus: "Active"
  });

  const [CategoryDropDownData, SetCategoryDropDownData] = useState([]);

  const FetchCategoryDropdown = async () => {
    try {
      const alldata = { mode: 'SD', branchid: 1 };
      const response = await axios.post(`${API_URL}/fetchCategorydata`, alldata);
      if (response.status === 200) {
        SetCategoryDropDownData(response.data.send);
      }
    } catch (err) {
      console.log(err);
    }
  };

  const [SubCategoryDropDownData, SetSubCategoryDropDownData] = useState([]);

  const FetchSubCategoryDropdown = async (selected) => {
    try {
      const alldata = { mode: 'SDS', branchid: 1, Category: selected };
      const response = await axios.post(`${API_URL}/fetchSubCategorydata`, alldata);
      if (response.status === 200) {
        SetSubCategoryDropDownData(response.data.send);
      }
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    FetchCategoryDropdown();
    fetchReminderType();
  }, []);

  const [RemiderType, setRemiderType] = useState([]);

  const fetchReminderType = async () => {
    try {
      const data = { mode: 'S', branchid: auth.branchid, BranchAccess: auth.BranchAccess, Createdby: '', Updatedby: '' }
      const response = await axios.post(`${API_URL}/ReminderTypeAPI`, data);
      setRemiderType(response.data.send);
    } catch (error) {
      console.error('Error fetching user details:', error);
    }
  };
  const handleReminderAdd = async () => {
    try {
      const data = { ...ReminderReg, mode: 'I', branchid: auth.branchid, BranchAccess: auth.BranchAccess, Createdby: auth.empid, Updatedby: '' }
      const response = await axios.post(`${API_URL}/ReminderSettingAPI`, data);
      if (response.status === 200) {
        swal({
          title: "Success",
          text: "Reminder Added Successfully",
          icon: "success",
        }).then(() => {
          setReminderReg({
            Category: "",
            SubCategory: "",
            ReminderType: "",
            ReminderTitle: "",
            ReminderDays: "",
            ReminderDescription: "",
            ReminderMode: "",
            ReminderStatus: "Active"
          })
        })
      }
    } catch (error) {
      console.error('Error fetching user details:', error);
    }
  };
  const [ReminderData, setReminderData] = useState([]);
  const getReminderList = async () => {
    try {
      const data = { ...ReminderReg, mode: 'S', branchid: auth.branchid, BranchAccess: auth.BranchAccess, Createdby: auth.empid, Updatedby: '' }
      const response = await axios.post(`${API_URL}/ReminderSettingAPI`, data);
      if (response.status === 200) {
        setReminderData(response.data);
        console.log("🚀 ~ FetchAllReminder ~ response.data:", response.data)
      }
    } catch (error) {
      console.error('Error fetching user details:', error);
    }
  };
  const handleUpdateReminder = async () => {
    try {
      const data = { ...selectedReminder, mode: 'U', branchid: auth.branchid, BranchAccess: auth.BranchAccess, Createdby: '', Updatedby: auth.empid }
      const response = await axios.post(`${API_URL}/ReminderSettingAPI`, data);
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

  const handleToggle = (item) => {
    const newStatus = item.ReminderStatus === "Active" ? "Inactive" : "Active";

    Swal.fire({
      title: `Are you sure?`,
      text: `Do you want to mark this reminder as ${newStatus}?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: `Yes, ${newStatus}`,
      cancelButtonText: "Cancel",
    }).then((result) => {
      if (result.isConfirmed) {
        // API call update
        updateReminderStatus(item.ReminderID, newStatus);
      }
    });
  };

  const updateReminderStatus = async (id, status) => {
    try {
      console.log("Updating Reminder ID:", id, "to status:", status);
      const res = await axios.post(`${API_URL}/ReminderSettingAPI`, {
        ReminderID: id,
        ReminderStatus: status,
        mode: 'US',
        branchid: auth.branchid,
        BranchAccess: auth.BranchAccess,
        Createdby: auth.empid,
        Updatedby: auth.empid
      });

      Swal.fire("Updated!", `Reminder marked as ${status}.`, "success");

      // Refresh UI
      getReminderList();
    } catch (err) {
      Swal.fire("Error!", "Something went wrong.", "error");
    }
  };

  // Clear Form
  const handleClear = () => {
    setReminderReg({
      Category: "",
      SubCategory: "",
      ReminderType: "",
      ReminderTitle: "",
      ReminderDays: "",
      ReminderDescription: "",
      ReminderMode: "",
      ReminderStatus: "Active"
    });
    SetSubCategoryDropDownData([]);
  };

  return (
    <div className="container mt-4">
      <CNav variant="pills" role="tablist" className='mb-3'>
        <CNavItem>
          <CNavLink active={activeKey === 1} onClick={() => setActiveKey(1)}>
            Reminder Setting
          </CNavLink>
        </CNavItem>
        <CNavItem>
          <CNavLink active={activeKey === 2} onClick={() => {
            setActiveKey(2);
            getReminderList();
          }}>
            All Reminders
          </CNavLink>
        </CNavItem>
      </CNav>
      <CTabContent>

        <CTabPane role="tabpanel" aria-labelledby="home-tab" visible={activeKey === 1}>
          <CCard className="shadow-sm border-0" style={{ borderRadius: "18px" }}>
            <div className="card-header pro-header p-1">
              <div className="d-flex justify-content-center align-items-center">
                {/* Center Title */}
                <div className="text-center text-white" >
                  <h4 className=" fw-bold m-0 text-white">Reminder Settings</h4>
                </div>
              </div>
            </div>
            {/* <CCardHeader className="bg-white border-0 text-center">
              <h4 className=" fw-bold m-0">Reminder Settings</h4>
            </CCardHeader> */}

            <CCardBody className='py-3'>
              <div className="row g-4">

                {/* Category */}
                <div className="col-lg-6">
                  <label className="fw-semibold">Category</label>
                  <Select
                    options={CategoryDropDownData.map(c => ({
                      value: c.Category,
                      label: c.Category
                    }))}
                    value={
                      ReminderReg.Category
                        ? { value: ReminderReg.Category, label: ReminderReg.Category }
                        : null
                    }
                    onChange={selected => {
                      if (selected != null) {
                        console.log(selected);
                        FetchSubCategoryDropdown(selected.value)
                        setReminderReg({ ...ReminderReg, Category: selected?.value || "" })
                      } else {
                        setReminderReg({ ...ReminderReg, Category: "" })
                        SetSubCategoryDropDownData([])
                      }

                    }}
                    placeholder="Select Category"
                    isClearable
                  />
                </div>

                {/* Sub Category */}
                <div className="col-lg-6">
                  <label className="fw-semibold">Sub Category</label>
                  <Select
                    options={SubCategoryDropDownData.map(c => ({
                      value: c.SubCategory,
                      label: c.SubCategory
                    }))}
                    value={
                      ReminderReg.SubCategory
                        ? { value: ReminderReg.SubCategory, label: ReminderReg.SubCategory }
                        : null
                    }
                    onChange={selected =>
                      setReminderReg({ ...ReminderReg, SubCategory: selected?.value || "" })
                    }
                    placeholder="Select Sub Category"
                    isClearable
                  />
                </div>

                {/* Reminder Title */}
                <div className="col-lg-6">
                  <label className="fw-semibold">Reminder Title</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Enter Title"
                    value={ReminderReg.ReminderTitle}
                    onChange={e =>
                      setReminderReg({ ...ReminderReg, ReminderTitle: e.target.value })
                    }
                  />
                </div>

                {/* Reminder Type */}
                <div className="col-lg-6">
                  <label className="fw-semibold">Reminder Type</label>
                  <Select
                    options={RemiderType.map(c => ({
                      value: c.ReminderType,
                      label: c.ReminderType
                    }))}
                    value={
                      ReminderReg.ReminderType
                        ? { value: ReminderReg.ReminderType, label: ReminderReg.ReminderType }
                        : null
                    }
                    onChange={selected =>
                      setReminderReg({ ...ReminderReg, ReminderType: selected?.value || "" })
                    }
                    placeholder="Choose Reminder Type"
                    isClearable
                  />
                </div>

                {/* Reminder Days */}
                <div className="col-lg-6">
                  <label className="fw-semibold">Reminder Days</label>
                  <input
                    type="number"
                    className="form-control"
                    placeholder="Enter number of days"
                    value={ReminderReg.ReminderDays}
                    onChange={e =>
                      setReminderReg({ ...ReminderReg, ReminderDays: e.target.value })
                    }
                  />
                </div>
                {/* Reminder Mode */}
                <div className="col-lg-6">
                  <label className="fw-semibold">Reminder Mode</label>
                  <Select
                    options={[
                      { value: "Once", label: "Once" },
                      { value: "Repeated", label: "Repeated" }
                    ]}
                    value={
                      ReminderReg.ReminderMode
                        ? { value: ReminderReg.ReminderMode, label: ReminderReg.ReminderMode }
                        : null
                    }
                    onChange={selected =>
                      setReminderReg({ ...ReminderReg, ReminderMode: selected?.value || "" })
                    }
                    isClearable
                    placeholder="Select Reminder Mode"
                  />
                </div>

                {/* Reminder ReminderDescription */}
                <div className="col-12">
                  <label className="fw-semibold">Reminder Description</label>
                  <textarea
                    className="form-control"
                    rows="3"
                    placeholder="Enter Reminder Description..."
                    value={ReminderReg.ReminderDescription}
                    onChange={e =>
                      setReminderReg({
                        ...ReminderReg,
                        ReminderDescription: e.target.value
                      })
                    }
                  ></textarea>
                </div>


                {/* Reminder Status */}
                {/* <div className="col-lg-6">
              <label className="fw-semibold">Status</label>
              <Select
                options={[
                  { value: "Active", label: "Active" },
                  { value: "Inactive", label: "Inactive" },
                ]}
                value={
                  ReminderReg.ReminderStatus
                    ? { value: ReminderReg.ReminderStatus, label: ReminderReg.ReminderStatus }
                    : null
                }
                onChange={selected =>
                  setReminderReg({ ...ReminderReg, ReminderStatus: selected?.value || "" })
                }
                isClearable
              />
            </div> */}

              </div>

              {/* Buttons */}
              <div className="text-end mt-4">
                <CButton color="danger" className="me-2 px-4" onClick={handleClear}>
                  Clear
                </CButton>
                <CButton color="primary" className="px-4" onClick={handleReminderAdd}>
                  Remind Me
                </CButton>
              </div>
            </CCardBody>
          </CCard>
        </CTabPane>

        <CTabPane role="tabpanel" aria-labelledby="home-tab" visible={activeKey === 2}>

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
              <CButton color="primary" onClick={handleUpdateReminder}>
                Update
              </CButton>
            </CModalFooter>
          </CModal>

          <CCard className="shadow-sm border-0" style={{ borderRadius: "18px" }}>
            <div className="card-header pro-header p-3 text-white text-center">
              <h4 className="fw-bold m-0">All Reminders</h4>
            </div>

            <CCardBody className="p-0"> {/* Remove default padding to control scroll area */}
              {/* Scrollable Table Container */}
              <div
                className="table-responsive"
                style={{
                  maxHeight: "500px",           /* Adjust this height as needed */
                  overflowY: "auto",
                  overflowX: "hidden"
                }}
              >
                <CTable hover className="mb-0"> {/* mb-0 to remove bottom margin inside scroll */}
                  <CTableHead className="bg-light position-sticky top-0 z-index-1">
                    {/* Sticky header so it stays visible while scrolling */}
                    <CTableRow>
                      <CTableHeaderCell className="fw-bold">Reminder</CTableHeaderCell>
                      <CTableHeaderCell className="fw-bold text-center">Action</CTableHeaderCell>
                    </CTableRow>
                  </CTableHead>

                  <CTableBody>
                    {ReminderData.length > 0 ? (
                      ReminderData.map((item) => (
                        <CTableRow key={item.ReminderID}>
                          {/* Reminder Column */}
                          <CTableDataCell
                            style={{ width: "85%", cursor: "pointer" }}
                            onClick={() => {
                              setSelectedReminder({ ...item }); // Use spread to avoid mutation
                              setShowModal(true);
                            }}
                          >
                            <div className="fw-bold fs-5">{item.ReminderTitle}</div>

                            <div className="text-muted small">
                              <u>Category</u>: <span className="fw-semibold">{item.Category}</span> /
                              <u> SubCategory</u>: <span className="fw-semibold"> {item.SubCategory || 'N/A'}</span>
                            </div>

                            <div className="mt-1">{item.ReminderDescription || 'No description'}</div>

                            <div className="small text-secondary mt-1">
                              Mode: {item.ReminderMode} — Every {item.ReminderDays} Days
                            </div>
                          </CTableDataCell>

                          {/* Action Column */}
                          <CTableDataCell className="text-center align-middle" style={{ width: "15%" }}>
                            <CFormSwitch
                              checked={item.ReminderStatus === "Active"}
                              onChange={() => handleToggle(item)}
                              style={{
                                cursor: "pointer",
                                transform: "scale(1.8)",
                                transformOrigin: "center"
                              }}
                            />
                          </CTableDataCell>
                        </CTableRow>
                      ))
                    ) : (
                      <CTableRow>
                        <CTableDataCell colSpan={2} className="text-center py-5 text-muted">
                          No reminders found.
                        </CTableDataCell>
                      </CTableRow>
                    )}
                  </CTableBody>
                </CTable>
              </div>
            </CCardBody>
          </CCard>

        </CTabPane>
      </CTabContent>

    </div>
  );
};
ReminderSettings.propTypes = {
  auth: PropTypes.any.isRequired,
};
export default ReminderSettings;
