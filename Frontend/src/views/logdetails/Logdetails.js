import React, { useEffect, useMemo, useState } from 'react'
import { AgGridReact } from 'ag-grid-react';
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import { CRow } from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilRecycle } from '@coreui/icons';
import axios from 'axios';
import PropTypes from 'prop-types'; // Import PropTypes
import { RotatingLines } from 'react-loader-spinner';
import { getConfig } from 'src/config';
import { Card, CardBody, CardHeader } from 'react-bootstrap';
const Logdetails = ({ auth }) => {
  const API_URL = getConfig().REACT_APP_API_URL;
  const [loading, setLoading] = useState(false); // Loader state
  const [GridData, SetGridData] = useState([])
  const colmun = [
    { field: "employeecode", headerClass: 'agheader', headerName: 'Employee Code' },
    { field: "employeename", headerClass: 'agheader', headerName: 'Employee Name' },
    {
      field: "Date", headerClass: 'agheader',
      valueGetter: (params) => {
        const date = params.data.Date;
        if (!date) return '-';
        const d = new Date(date);
        const yyyy = d.getUTCFullYear();
        const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
        const dd = String(d.getUTCDate()).padStart(2, '0');
        const hh = String(d.getUTCHours()).padStart(2, '0');
        const mi = String(d.getUTCMinutes()).padStart(2, '0');
        const ss = String(d.getUTCSeconds()).padStart(2, '0');
        const ms = String(d.getUTCMilliseconds()).padStart(3, '0');
        return `${yyyy}-${mm}-${dd}`;
      },
      cellRenderer: (params) => (
        <p style={{ color: params.value === null ? "green" : "red" }}>{params.value === null ? 'NA' : params.value}</p>
      )
    },
    {
      field: "LogIn", headerClass: 'agheader',
      cellRenderer: (params) => (
        <p style={{ color: params.value === null ? "black" : "green" }}>{params.value === null ? 'NA' : params.value}</p>
      ),
      valueGetter: (params) => {
        const date = params.data.LogIn;
        if (!date) return '-';

        const d = new Date(date);
        const yyyy = d.getUTCFullYear();
        const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
        const dd = String(d.getUTCDate()).padStart(2, '0');
        const hh = String(d.getUTCHours()).padStart(2, '0');
        const mi = String(d.getUTCMinutes()).padStart(2, '0');
        const ss = String(d.getUTCSeconds()).padStart(2, '0');
        const ms = String(d.getUTCMilliseconds()).padStart(3, '0');

        return `${yyyy}-${mm}-${dd} ${hh}:${mi}:${ss}`;
      },

    },
    {
      field: "LogOut", headerClass: 'agheader',

      cellRenderer: (params) => (
        <p style={{ color: params.value === null ? "red" : "blue" }}>{params.value === null ? 'NA' : params.value}</p>
      ),
      valueGetter: (params) => {
        const date = params.data.LogOut;
        if (!date) return '-';

        const d = new Date(date);
        const yyyy = d.getUTCFullYear();
        const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
        const dd = String(d.getUTCDate()).padStart(2, '0');
        const hh = String(d.getUTCHours()).padStart(2, '0');
        const mi = String(d.getUTCMinutes()).padStart(2, '0');
        const ss = String(d.getUTCSeconds()).padStart(2, '0');
        const ms = String(d.getUTCMilliseconds()).padStart(3, '0');

        return `${yyyy}-${mm}-${dd} ${hh}:${mi}:${ss}`;
      },

    },
    {
      field: "SystemAborted", headerClass: 'agheader', headerName: 'System Aborted',
      cellRenderer: (params) => (
        <p style={{ color: params.value === null ? "green" : "red" }}>{params.value === null ? 'NA' : params.value}</p>
      )

    },
    { field: "ipaddress", headerClass: 'agheader', headerName: 'IP Address' },
  ]

  const defaultColDef = useMemo(() => {
    return {
      filter: 'agTextColumnFilter',
      floatingFilter: true,
    }
  }, []);


  const fetchGridData = async () => {
    try {
      setLoading(true)
      const alldata = { usercode: '', username: '', status: '', ipAddress: '', mood: 'G', branchid: auth.branchid }

      const response = await axios.post(`${API_URL}/loginhistory`, alldata)

      if (response.status === 200) {
        SetGridData(response.data)
        setLoading(false)
      }
      setLoading(false)
    } catch (error) {

      console.log(error);

      setLoading(false)

    }
  }

  useEffect(() => {
    fetchGridData()
  }, [])

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
      <Card className='mt-4'>
        <CardHeader className='pro-header'>
          {/* <CRow className='mb-3'> */}
            <div className="d-flex justify-content-center text-white">
              <CIcon className="me-2" size={'xxl'} icon={cilRecycle} />
              <h3 className='text-white'> Employee Login Details</h3>
            </div>
          {/* </CRow> */}
        </CardHeader>
        <CardBody>
          <div className="ag-theme-quartz mt-3" style={{ height: 500 }}>
            <AgGridReact
              rowData={GridData}
              columnDefs={colmun}
              defaultColDef={defaultColDef}
              // onGridReady={onGridReady}
              rowSelection="multiple"
              pagination={true}
              paginationPageSize={10}
              paginationPageSizeSelector={[10, 20, 30, 40, 50]}
            />
          </div>
        </CardBody>
      </Card>
    </>

  )
}

Logdetails.propTypes = {
  auth: PropTypes.any.isRequired,
};

export default Logdetails