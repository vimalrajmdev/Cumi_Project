import React, { useState, useMemo, useEffect, useRef, useContext } from 'react';
import Swal from 'sweetalert2';
import { AgGridReact } from 'ag-grid-react';
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import axios from 'axios';
import PropTypes from 'prop-types';
import { Typeahead } from 'react-bootstrap-typeahead';
import { useLocation } from 'react-router-dom';
import {
  GridRowModes,
  DataGrid,
  GridActionsCellItem,
  GridRowEditStopReasons
} from '@mui/x-data-grid';
import { Box, TextField } from "@mui/material";
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/DeleteOutlined';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Close';
import { getConfig } from 'src/config';
import { Card, CardBody, CardHeader } from 'react-bootstrap';
import secureLocalStorage from 'react-secure-storage';

const Release_assets = ({ auth }) => {
  const gridRef = useRef(null);
  const location = useLocation();
  let pageData = location.state?.pageData;
  if (!pageData) {
    const storedData = secureLocalStorage.getItem('pageData');
    pageData = storedData || {};
  }
  const API_URL = getConfig().REACT_APP_API_URL;
  const [Register, setRegister] = useState({
    id: '', EmployeeId: '', EmployeeRFID: ''
  });

  const columns = [
    { headerCheckboxSelection: true, checkboxSelection: true, width: 60 },
    { field: "AssetID", headerClass: 'agheader', headerName: "Asset ID", width: 150, editable: true, filter: true, floatingFilter: true },
    { field: "AssetName", headerClass: 'agheader', headerName: "Asset Name", width: 200, editable: true, filter: true, floatingFilter: true },
    { field: "RFIDnumber", headerClass: 'agheader', headerName: "Asset RFID", width: 150, editable: true, filter: true, floatingFilter: true },
    { field: "AssetType", headerClass: 'agheader', headerName: "Asset Type", width: 150, editable: true, filter: true, floatingFilter: true },
    { field: "Category", headerClass: 'agheader', headerName: "Category", width: 150, editable: true, filter: true, floatingFilter: true },
    { field: "SubCategory", headerClass: 'agheader', headerName: "SubCategory", width: 150, editable: true, filter: true, floatingFilter: true },
    { field: "Department", headerClass: 'agheader', headerName: "Department", width: 150, editable: true, filter: true, floatingFilter: true },
    { field: "EmployeeId", headerClass: 'agheader', headerName: "Employee ID", width: 150, editable: true, filter: true, floatingFilter: true },
    { field: "EmployeeRFID", headerClass: 'agheader', headerName: "Employee RFID", width: 150, editable: true, filter: true, floatingFilter: true },
    { field: "FirstName", headerClass: 'agheader', headerName: "First Name", width: 150, editable: true, filter: true, floatingFilter: true }
  ];



  // Update Maitenance Register 
  const HandleRelease = async (e) => {
    if (auth.branchid === "0" || auth.branchid === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Invalid Selection',
        text: "Please select a specific branch. 'ALL' is not allowed.",
      });
      return;
    }
    const selectedRows = gridRef.current.api.getSelectedRows();

    if (selectedRows.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'No Rows Selected',
        text: 'Please select at least one asset to release.',
      });
      return;
    }
    try {


      const requests = selectedRows.map(data => {
        const alldata = {
          ...data, Createdby: auth.empid, mode: 'RA', branchid: auth.branchid,
        };
        return axios.post(`${API_URL}/AllocateAssets`, alldata);
      });
      await Promise.all(requests);

      Swal.fire({
        title: 'Recovered Successfully',
        text: '',
        icon: 'success',
        confirmButtonText: 'Done'
      }).then(() => {
        FetchData();
      });

    } catch (err) {
      console.log("Error on Released Assets", err)
    }


  }

  const [rowData, SetRowData] = useState([]);
  const FetchData = async () => {
    try {
      const alldata = { branchid: auth.branchid, Createdby: '', mode: 'GetAllocatedAssets' }
      const response = await axios.post(`${API_URL}/AllocateAssets`, alldata)
      if (response.status === 200) {
        SetRowData(response.data);
        console.log('response.data', response.data);
      }
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    FetchData();

  }, []);
  return (
    <>
      <Card className='mt-4'>

        <div className="card-header pro-header p-1">
          <div className="d-flex justify-content-center align-items-center">
            {/* Center Title */}
            <div className="text-center" style={{ width: "34%" }}>
              <h3 className="text-white m-0">
                <i class="bi bi-unlock2 ms-1 fs-4"></i>  Recover Assets
              </h3>
            </div>
          </div>
        </div>

        <CardBody>
          {
            (pageData.editstatus === null || pageData.editstatus === 'i') && auth.UserStatus === 'A'
              ? '' : (
                <div className='text-end mt-2'>
                  <button className='btn btn-outline-success me-2 text-nowrap btn-hover-effect fs-6' onClick={HandleRelease}>
                    <b>Recover</b>
                  </button>
                </div>
              )}
          <div
            className="ag-theme-quartz mt-3"
            style={{
              height: 520,
              width: "100%",
            }}
          >
            <AgGridReact
              ref={gridRef}
              rowData={rowData}
              columnDefs={columns}
              defaultColDef={{
                resizable: true,
                sortable: true,

              }}
              rowSelection='multiple'
              onGridReady={(params) => params.api.sizeColumnsToFit()}
              pagination={true}
              paginationPageSize={50}
            />
          </div>
        </CardBody>
      </Card>
    </>
  )
}
Release_assets.propTypes = {
  auth: PropTypes.any.isRequired,
};
export default Release_assets
