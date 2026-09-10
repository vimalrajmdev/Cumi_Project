import { cilLayers, cilPlus } from '@coreui/icons';
import CIcon from '@coreui/icons-react';
import {
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CFormInput,
  CModal,
  CModalBody,
  CModalFooter,
  CModalHeader,
  CModalTitle,
  CForm,
  CFormLabel,
} from '@coreui/react';
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import swal from 'sweetalert';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import PropTypes from 'prop-types';
import { getConfig } from 'src/config';
import { FaEdit } from 'react-icons/fa';

// AG Grid imports
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';
import secureLocalStorage from 'react-secure-storage';

const Userrole = ({ auth }) => {
  const API_URL = getConfig().REACT_APP_API_URL;
  const navigate = useNavigate();
  const location = useLocation();

  const [editvisible, setEditvisible] = useState(false);
  const [deletevisible, setDeletevisible] = useState(false);
  const [TableDatas, SetTableDatas] = useState([]);
  const [Name, SetName] = useState('');
  const [UpdateName, SetUpdateName] = useState('');
  const [editid, Seteditid] = useState('');
  const [Status, setStatus] = useState('');
  const [quickFilterText, setQuickFilterText] = useState('');

  let pageData = location.state?.pageData;
  if (!pageData) {
    const storedData = secureLocalStorage.getItem('pageData');
    pageData = storedData || {};
  }

  const gridRef = React.useRef();

  // Fetch all roles
  const fetchGridData = async () => {
    try {
      const alldata = {
        id: '',
        userrole: '',
        createdby: '',
        updateby: '',
        branchid: auth.branchid,
        mode: 'S',
      };

      const response = await axios.post(`${API_URL}/UserroleMaster`, alldata);
      if (response.status === 200) {
        SetTableDatas(response.data);
      }
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchGridData();
  }, []);

  // Add new role modal
  const adddata = () => {
    setStatus('Add');
    SetName('');
    SetUpdateName('');
    setEditvisible(true);
  };

  const onchangeRole = (e) => {
    const value = e.target.value;
    SetName(value);
    SetUpdateName(value);
  };

  // Create role
  const handleCreateRole = async () => {
    if (!Name.trim()) {
      swal({ text: 'Please Enter The Role', icon: 'warning' });
      return;
    }

    const exists = TableDatas.some(
      (item) => item.userrole.toLowerCase() === Name.toLowerCase().trim()
    );
    if (exists) {
      swal({ text: 'This Role Name is Already Existing', icon: 'warning' });
      return;
    }

    try {
      const alldata = {
        id: '',
        userrole: Name.toLowerCase().trim(),
        createdby: auth.empid,
        updateby: '',
        branchid: auth.branchid,
        mode: 'I',
      };

      const response = await axios.post(`${API_URL}/UserroleMaster`, alldata);
      if (response.status === 200) {
        fetchGridData();
        setEditvisible(false);
        SetName('');
        swal({ text: 'Role Created Successfully', icon: 'success' });
      }
    } catch (err) {
      console.log(err);
    }
  };

  // Edit role
  const handleedit = async (id) => {
    try {
      const alldata = {
        id,
        userrole: '',
        createdby: '',
        updateby: '',
        branchid: auth.branchid,
        mode: 'E',
      };

      const response = await axios.post(`${API_URL}/UserroleMaster`, alldata);
      if (response.status === 200 && response.data.length > 0) {
        SetUpdateName(response.data[0].userrole);
        Seteditid(id);
        setStatus('edit');
        setEditvisible(true);
      }
    } catch (error) {
      console.error('Error fetching role data:', error);
    }
  };

  // Update role
  const handleupdate = async () => {
    if (!UpdateName.trim()) {
      swal({ text: 'Please Enter The Role', icon: 'warning' });
      return;
    }

    try {
      const alldata = {
        id: editid,
        userrole: UpdateName.trim(),
        createdby: '',
        updateby: auth.empid,
        branchid: auth.branchid,
        mode: 'U',
      };

      const response = await axios.post(`${API_URL}/UserroleMaster`, alldata);
      if (response.status === 200) {
        fetchGridData();
        setEditvisible(false);
        swal({ text: 'Role Updated Successfully', icon: 'success' });
      }
    } catch (err) {
      console.log(err);
    }
  };

  // Delete role
  const handledelete = (id) => {
    Seteditid(id);
    setDeletevisible(true);
  };

  const confirmDelete = async () => {
    try {
      const alldata = {
        id: editid,
        userrole: '',
        createdby: '',
        updateby: auth.empid,
        branchid: auth.branchid,
        mode: 'D',
      };

      const response = await axios.post(`${API_URL}/UserroleMaster`, alldata);
      if (response.status === 200) {
        fetchGridData();
        setDeletevisible(false);
        swal({ text: 'Role Deleted Successfully', icon: 'success' });
      }
    } catch (err) {
      console.log(err);
    }
  };
  // AG Grid Column Definitions
  const columnDefs = useMemo(() => {
    const cols = [
      {
        headerName: 'S.No',
        field: 'serialNo',
        valueGetter: (params) => params.node.rowIndex + 1,
        sortable: true,
        flex:1,
        filter: false,
        editable: true, // ✅ Editable enabled
      },
      {
        headerName: 'Role Name',
        field: 'userrole',
        sortable: true,
        filter: true,
        editable: true,
        flex:3,
        floatingFilter: true,
        cellStyle: { textTransform: 'capitalize' },
      },
      {
            headerName: "Created By", headerClass: 'agheader', field: "createdby",
            valueGetter: (params) => {
                const value = params.data?.createdby;
                return value || "-";
            }
        },
        {
            headerName: "Created Date", headerClass: 'agheader', field: "createdate",
            valueGetter: (params) => {
                const date = params.data.createdate;
                if (!date) return '-';
                const d = new Date(date);
                const yyyy = d.getUTCFullYear();
                const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
                const dd = String(d.getUTCDate()).padStart(2, '0');
                const hh = String(d.getUTCHours()).padStart(2, '0');
                const mi = String(d.getUTCMinutes()).padStart(2, '0');
                const ss = String(d.getUTCSeconds()).padStart(2, '0');
                const ms = String(d.getUTCMilliseconds()).padStart(3, '0');
                return `${dd}-${mm}-${yyyy} ${hh}:${mi}:${ss}`;
            },
        },
        {
            headerName: "Last Modified By", headerClass: 'agheader', field: "updatedby",
            valueGetter: (params) => {
                const value = params.data?.updatedby;
                return value || "-";
            }
        },
        {
            headerName: "Last Modified Date", headerClass: 'agheader', field: "updateddate",
            valueGetter: (params) => {
                const date = params.data.updateddate;
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
    ];

    // Only show Action column if user has edit permission
    if (
      pageData.editstatus !== 'i' &&
      !(pageData.editstatus === null && auth.UserStatus === 'A')
    ) {
      cols.push({
        headerName: 'Action',
        // pinned: 'right',
        flex:1,
        sortable: false,
        filter: false,
        cellRenderer: (params) => (
          <div className="d-flex  align-items-center h-100">
            <button
              onClick={() => handleedit(params.data.roleid)}
              style={{
                width: '40px',
                height: '40px',
                background: 'rgba(25, 135, 84, 0.15)',
                border: '1px solid rgba(25, 135, 84, 0.3)',
                color: '#198754',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.3s ease',
                boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
              }}
            >
              <FaEdit size={18} />
            </button>
          </div>
        ),
      });
    }

    return cols;
  }, [pageData, auth]);


  // Default column settings
  const defaultColDef = useMemo(() => ({
    sortable: true,
    filter: true,
    resizable: true,
  }), []);

  return (
    <div>
      {/* Edit Modal */}
      <CModal
        size="md"
        alignment="center"
        visible={editvisible}
        backdrop="static"
        onClose={() => setEditvisible(false)}
      >
        <CModalHeader closeButton>
          <CModalTitle>{Status === 'Add' ? 'Create New Role' : 'Edit Role'}</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CForm>
            <CFormLabel>
              Role <span style={{ color: 'red' }}>*</span>
            </CFormLabel>
            <CFormInput
              type="text"
              placeholder="Enter Role"
              value={UpdateName}
              onChange={onchangeRole}
            />
          </CForm>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setEditvisible(false)}>
            Cancel
          </CButton>
          <CButton
            color="primary"
            onClick={Status === 'Add' ? handleCreateRole : handleupdate}
          >
            {Status === 'Add' ? 'Add' : 'Save'}
          </CButton>
        </CModalFooter>
      </CModal>

      {/* Delete Confirmation Modal */}
      <CModal
        size="sm"
        alignment="center"
        visible={deletevisible}
        onClose={() => setDeletevisible(false)}
      >
        <CModalHeader closeButton>
          <CModalTitle>Are you sure?</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <p>This operation can&apos;t be reverted</p>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setDeletevisible(false)}>
            CANCEL
          </CButton>
          <CButton color="danger" onClick={confirmDelete}>
            CONFIRM
          </CButton>
        </CModalFooter>
      </CModal>

      {/* Main Card */}
      <CCard className="">
        <CCardHeader className="pro-header p-3"   style={{ background: '#106FB2' }}>
          <div className="d-flex align-items-center">
            <CIcon className="me-2" size="xxl" icon={cilLayers} />
            <h3 className="text-white mb-0">All Roles</h3>
          </div>
        </CCardHeader>
        <CCardBody>
          <div className="d-flex justify-content-between m-3">
            <CCol sm={4}>
              <CFormInput
                type="search"
                placeholder="Search Role..."
                value={quickFilterText}
                onChange={(e) => setQuickFilterText(e.target.value)}
              />
            </CCol>
            <div>
              {(pageData.addstatus === null || pageData.addstatus === 'i') &&
                auth.UserStatus === 'A' ? null : (
                <CButton
                  color="info"
                  variant="outline"
                  onClick={adddata}
                  className="btn-hover-effect"
                >
                  <CIcon icon={cilPlus} className="me-1" /> Add
                </CButton>
              )}
            </div>
          </div>

          {/* AG Grid */}
          <div
            className="ag-theme-quartz"
            style={{ height: '400px' }}
          >
            <AgGridReact
              ref={gridRef}
              rowData={TableDatas}
              columnDefs={columnDefs}
              defaultColDef={defaultColDef}
              pagination={true}
              paginationPageSize={10} // default
              paginationPageSizeSelector={[10, 20, 30, 40, 50]}
              quickFilterText={quickFilterText}
              animateRows={true}
              domLayout="normal"
            />

          </div>
        </CCardBody>
      </CCard>
    </div>
  );
};

Userrole.propTypes = {
  auth: PropTypes.object.isRequired,
};

export default Userrole;