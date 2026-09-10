import axios from 'axios'
import React, { useState,useEffect,useMemo } from 'react'
import { Link } from 'react-router-dom'
import Swal from 'sweetalert2'
import { AgGridReact } from 'ag-grid-react';
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import { API_URL } from 'src/config';
import PropTypes from 'prop-types';


const CompanyInfo = ({auth}) => {


  // Set Company Information
  const [Register, setRegister] = useState({
    CompanyName: '', IndustryType: '', PostalCode: '', CompanyUrl: '', City: '', State: '', CompanyAddress: ''
  })
  const handlecheck = async (e) => {

    if(Register.CompanyName===''){
      Swal.fire({
        icon:'warning',
        title:'Please Enter Company Name'
      })
      return
    }
    if(Register.IndustryType===''){
      Swal.fire({
        icon:'warning',
        title:'Please Enter IndustryType'
      })
      return
    }

    if(Register.PostalCode===''){
      Swal.fire({
        icon:'warning',
        title:'Please Enter PostalCode'
      })
      return
    }
    if(Register.CompanyUrl===''){
      Swal.fire({
        icon:'warning',
        title:'Please Enter PostalCode'
      })
      return
    }
    if(Register.City===''){
      Swal.fire({
        icon:'warning',
        title:'Please Enter City'
      })
      return
    }
    if(Register.State===''){
      Swal.fire({
        icon:'warning',
        title:'Please Enter State'
      })
      return
    }
    if(Register.CompanyAddress===''){
      Swal.fire({
        icon:'warning',
        title:'Please Enter CompanyAddress'
      })
      return
    }
    try {
      const response = await axios.post(`${API_URL}/CompanyRegister`, Register)
      if (response.status === 200) {
        Swal.fire({
          title: 'Saved Successfully',
          text: '',
          icon: 'success',
          confirmButtonText: 'Done'
        })
        console.log(Register)
        setRegister({
          CompanyName: '', IndustryType: '', PostalCode: '', CompanyUrl: '', City: '', State: '', CompanyAddress: ''
        })
        const fetchData = async () => {
          try {
            const response = await axios.post(`${API_URL}/FetchCompanyInfo`);
            setRowdata(response.data.send);
          } catch (error) {
            console.error('Error fetching user details:', error);
          }
        };
        fetchData();
      }
    } catch (err) {
      console.log(err)
    }

  }
  const columndef = [
    { headerCheckboxSelection: true, checkboxSelection: true, headerName: "Select", field: 'id', filter: true, floatingFilter: true, width: 200 },
    { headerName: "Company Name", field: 'CompanyName', filter: true, floatingFilter: true,editable:true },
    { headerName: "Industry Type", field: 'IndustryType', filter: true, floatingFilter: true,editable:true },
    { headerName: "Postal Code", field: 'PostalCode', filter: true, floatingFilter: true,editable:true },
    { headerName: "Company Url", field: 'CompanyUrl', filter: true, floatingFilter: true,editable:true },
    { headerName: "City", field: 'City', filter: true, floatingFilter: true ,editable:true},
    { headerName: "State", field: 'State', filter: true, floatingFilter: true,editable:true },
    { headerName: "Company Address", field: 'CompanyAddress', filter: true, floatingFilter: true,editable:true },
    // { headerName: "Make Changes", field: 'Edit', cellRenderer: EditRenderer, width: 150 },
    // { headerName: "Delete", field: 'Delete', cellRenderer: DeleteRenderer, }
  ]
  const [rowdata, setRowdata] = useState([])
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.post(`${API_URL}/FetchCompanyInfo`);
        setRowdata(response.data.send);
      } catch (error) {
        console.error('Error fetching user details:', error);
      }
    };
    fetchData();
    const interval = setInterval(() => {
      fetchData();
    }, 60000);

    // Clean up interval on component unmount
    return () => clearInterval(interval);
  }, [])
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
  return (
    <div className=''>

      <div className='card mx-2 py-5 mt-5' >
        <div className='d-flex justify-content-evenly flex-wrap'>
          <div className='col-lg-5'>
            <div className='mb-2'>
              <label>Company Name</label>
              <input className='form-control border border-2 mt-1' onChange={(e) => setRegister({ ...Register, CompanyName: e.target.value })} value={Register.CompanyName} />
            </div>
            <div className='mb-2'>
              <label>Select Industry Type</label>
              <select className='form-control border border-2 mt-1' onChange={(e) => setRegister({ ...Register, IndustryType: e.target.value })} value={Register.IndustryType} >
                <option></option>
                <option>Education</option>
                <option>Industrial</option>
              </select>
            </div>
            <div className='mb-2'>
              <label>Postal Code</label>
              <input className='form-control border border-2 mt-1' onChange={(e) => setRegister({ ...Register, PostalCode: e.target.value })} value={Register.PostalCode} />
            </div>
          </div>
          <div className='col-lg-5'>
            <div className='mb-2'>
              <label>Company Url<span className='ms-2 text-muted'>(Eg : https://www.example.com)</span></label>
              <input className='form-control border border-2 mt-1' onChange={(e) => setRegister({ ...Register, CompanyUrl: e.target.value })} value={Register.CompanyUrl} />
            </div>
            <div className='mb-2 d-flex justify-content-between'>
              <div className='mb-2'>
                <label>City</label>
                <input className='form-control border border-2 mt-1' onChange={(e) => setRegister({ ...Register, City: e.target.value })} value={Register.City} />
              </div>
              <div className='mb-2'>
                <label>State</label>
                <input className='form-control border border-2 mt-1' onChange={(e) => setRegister({ ...Register, State: e.target.value })} value={Register.State} />
              </div>
            </div>

            <div className='mb-2'>
              <label>Company Address</label>
              <input className='form-control border border-2 mt-1' onChange={(e) => setRegister({ ...Register, CompanyAddress: e.target.value })} value={Register.CompanyAddress} />
            </div>
          </div>
        </div>
        <div className='text-center'>
          <button className='btn btn-success col-lg-2' onClick={handlecheck}>Save</button>
        </div>
      </div>
      <div className='card'>
        <div className='ag-theme-quartz mb-5' style={{ height: "400px" }}>
          <AgGridReact  rowData={rowdata} columnDefs={columndef} rowSelection={"multiple"} autoGroupColumnDef={autoGroupColumnDef} />
        </div>
      </div>
      <div className='mt-2 ms-2'>
        <Link className='btn btn-danger' to='/Settings/Configure'>Back To configure</Link>
      </div>
    </div>
  )
}

CompanyInfo.propTypes = {
    auth: PropTypes.any.isRequired,
};

export default CompanyInfo
