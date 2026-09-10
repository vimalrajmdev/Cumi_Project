import { cilLayers, cilPlus, cilPencil, cilTrash, cilCloudDownload } from '@coreui/icons'
import CIcon from '@coreui/icons-react'
import { CButton, CCardBody, CCard, CFormLabel, CCol, CForm, CFormInput, CModal, CModalBody, CModalFooter, CModalTitle, CRow, CTable, CTableBody, CTableDataCell, CTableHead, CTableHeaderCell, CTableRow, CTooltip, CModalHeader, CCardHeader } from '@coreui/react'
import React, { useState, useEffect, useRef } from "react";
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import swal from 'sweetalert';
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import PropTypes from 'prop-types'; // Import PropTypes
import { getConfig } from 'src/config';
import Papa from 'papaparse';
import ExcelJS from "exceljs";
import autoTable from 'jspdf-autotable';
import { saveAs } from "file-saver";
import logo from '../../../assets/images/Base64/Apple_base64'; // Can also be base64 string
import Swal from 'sweetalert2';
import { FaEdit, FaTrash } from "react-icons/fa";
import { AgGridReact } from 'ag-grid-react';
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";


const Branches = ({ auth }) => {
  const gridRef = useRef(null)
  const API_URL = getConfig().REACT_APP_API_URL;
  const [editvisible, setEditvisible] = useState(false)

  const [deletevisible, setDeletevisible] = useState(false)

  const [TableDatas, SetTableDatas] = useState([])

  const [loading, setLoading] = useState(false); // Loader state

  const [Name, SetName] = useState('')

  const [Branchdata, SetBranchdata] = useState({
    branchName: '', ContactPerson: '', ContactNumber: '', EmailId: '', Address: '', City: '', State: '', Pincode: '',
    Country: '', GSTNumber: '', PANNumber: '', BankName: '', AccountNumber: '', IFSCCode: ''
  })

  const [editid, Seteditid] = useState('')

  const [Status, setStatus] = useState('')


  const columnDefs = [
    {
      headerName: "ID",
      valueGetter: "node.rowIndex + 1",
      width: 80,
      pinned: "left"
    },
    { headerName: "Branch", field: "branchName", minWidth: 150 },
    {
      headerName: "Contact",
      field: "ContactPerson",
      valueFormatter: p => p.value && p.value !== "undifiend" ? p.value : "-"
    },
    {
      headerName: "Phone",
      field: "ContactNumber",
      valueFormatter: p => p.value && p.value !== "undifiend" ? p.value : "-"
    },
    {
      headerName: "Address",
      field: "Address",
      minWidth: 200,
      valueFormatter: p => p.value && p.value !== "undifiend" ? p.value : "-"
    },
    { headerName: "City", field: "City" },
    { headerName: "State", field: "State" },
    { headerName: "Country", field: "Country" },
    { headerName: "Pincode", field: "Pincode" },
    {
      headerName: "Email",
      field: "EmailId",
      minWidth: 200,
      valueFormatter: p => p.value && p.value !== "undifiend" ? p.value : "-"
    },
    { headerName: "GST", field: "GSTNumber" },
    { headerName: "PAN", field: "PANNumber" },
    { headerName: "Bank", field: "BankName" },
    {
      headerName: "Account",
      field: "AccountNumber",
      minWidth: 150
    },
    { headerName: "IFSC", field: "IFSCCode" },

    // 🔥 ACTION COLUMN
    {
      headerName: "Action",
      pinned: "right",
      width: 140,
      cellRenderer: (params) => (
        <div className="d-flex gap-2 align-items-center justify-content-center">
          <button
            className="border-0 rounded-circle d-flex justify-content-center align-items-center"
            style={{
              width: "38px",
              height: "38px",
              background: "rgba(25, 135, 84, 0.15)",
              border: "1px solid rgba(25, 135, 84, 0.3)",
              color: "#198754",
              cursor: "pointer"
            }}
            onClick={() => handleedit(params.data.branchid)}
          >
            <FaEdit />
          </button>

          <button
            className="border-0 rounded-circle d-flex justify-content-center align-items-center"
            style={{
              width: "38px",
              height: "38px",
              background: "rgba(220, 53, 69, 0.15)",
              border: "1px solid rgba(220, 53, 69, 0.3)",
              color: "#dc3545",
              cursor: "pointer"
            }}
            onClick={() => handledelete(params.data.branchid)}
          >
            <FaTrash />
          </button>
        </div>
      )
    }
  ];

  //pdf
  const handlepdf = async (selectedDate) => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 0));

    // const filteredData = gridRef.current.api.getModel().rowsToDisplay.map(rowNode => rowNode.data);

    const doc = new jsPDF({ orientation: "portrait", format: 'a4' });
    const title = 'Building Master';

    // ✅ Format selectedDate properly
    let reportDate;
    try {
      const rawDate = selectedDate?.$d || selectedDate;
      const parsedDate = new Date(rawDate);
      if (isNaN(parsedDate)) throw new Error("Invalid date");
      reportDate = parsedDate.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      reportDate = new Date().toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    }

    const imgData = logo;

    // ✅ Header columns
    const headers = [
      'Branch', 'Contact', 'Created Date', 'Created By', 'Updated Date', 'Update By'
    ];

    // ✅ Match field names from API / grid (case-sensitive!)
    const bodyData = filteredData.map(item => [
      item.BuildingId || "-",
      item.Building || "-",
      item.Createddate || "-",
      item.Createdby || "-",
      item.Updateddate || "-",
      item.updateby || "-",
    ]);

    if (bodyData.length > 0) {
      autoTable(doc, {
        head: [headers],
        body: bodyData,
        margin: { top: 40, right: 15, left: 10, bottom: 20 },

        // ✅ Increase body text size
        styles: {
          halign: "center",
          valign: "middle",
          fontSize: 10,       // <= Bigger data text
          font: "times",
          cellPadding: 3,
          textColor: [0, 0, 0],
          lineColor: [0, 0, 0],
          lineWidth: 0.2,
        },

        // ✅ Increase header text size
        headStyles: {
          fillColor: [0, 0, 0, 0.9],
          textColor: [255, 255, 255],
          fontSize: 11,       // <= Bigger header text
          halign: 'center',
          fontStyle: 'bold',
        },

        didDrawPage: (data) => {
          const pageWidth = doc.internal.pageSize.width;
          const pageHeight = doc.internal.pageSize.height;

          // ✅ Logo
          doc.addImage(imgData, 'PNG', 10, 5, 30, 12);

          // ✅ Title
          doc.setFontSize(20);
          doc.setFont("times", "bold");
          doc.text(`${title} - ${reportDate}`, pageWidth / 2, 22, { align: 'center' });

          // ✅ Page Number
          doc.setFontSize(8);
          doc.text(`Page ${doc.internal.getCurrentPageInfo().pageNumber}`, pageWidth - 10, 10, { align: 'right' });

          // ✅ Footer (center aligned)
          doc.setFontSize(8);

          const footerText = `Printed By: ${auth.employeename} | Printed On: ${new Date().toLocaleDateString()} | Time: ${new Date().toLocaleTimeString()}`;
          const footerNote = `Note: This document has been generated electronically and is valid without signature.`;

          // both lines centered
          doc.text(footerText, pageWidth / 2, pageHeight - 15, { align: 'center' });
          doc.text(footerNote, pageWidth / 2, pageHeight - 8, { align: 'center' });

        }
      });

      doc.save("Building Master.pdf");
    } else {
      Swal.fire("No data available to export", "", "warning");
    }
    setLoading(false);
  };
  //end pdf

  const adddata = async () => {
    setStatus('Add')
    setEditvisible(true)
    SetBranchdata({
      branchName: '', ContactPerson: '', ContactNumber: '', EmailId: '', Address: '', City: '', State: '', Pincode: '',
      Country: '', GSTNumber: '', PANNumber: '', BankName: '', AccountNumber: '', IFSCCode: ''
    })
  };



  const handleChange = (e) => {
    const { name, value } = e.target;
    SetBranchdata((prev) => ({
      ...prev,
      [name]: value,
    }));
  };


  const HandleCreateBranch = async () => {
    if (Branchdata.branchName === '') {
      swal({
        text: 'Please Enter The Branch',
        icon: "warning"
      })
      return
    }
    if (Branchdata.ContactNumber === '') {
      swal({
        text: 'Please Enter Contact Number',
        icon: "warning"
      })
      return
    }

    const isValidationSuccess = TableDatas.some((item) => {
      return (
        item.branchName.toLowerCase() === Branchdata.branchName.toLowerCase()
      )
    })
    if (isValidationSuccess) {
      swal({
        text: "This Branch Name is Already Exitsing",
        icon: "warning"
      });
      return;
    }

    try {


      const alldata = { id: 0, ...Branchdata, createdby: 0, updateby: 0, mode: 'I' }

      console.log('alldata', alldata);

      const response = await axios.post(`${API_URL}/BranchMaster`, alldata)

      if (response.status === 200) {
        fetchGridData()
        setEditvisible(false)
        SetName('')
        swal({
          text: "Branches Created SuccessFully",
          icon: "success"
        })
      }

    } catch (err) {

      console.log(err);
    }




  }


  const fetchGridData = async () => {

    try {

      const alldata = { id: 0, branchName: '', createdby: 0, updateby: 0, mode: 'S' }

      const response = await axios.post(`${API_URL}/BranchMaster`, alldata)

      if (response.status === 200) {
        SetTableDatas(response.data)
      }


    } catch (err) {

      console.log(err);
    }

  }

  const downloadExcel = async () => {
    const columnDefs = [
      { key: "branchName", header: "Branch Name" },
      { key: "ContactPerson", header: "Contact Person" },
      { key: "ContactNumber", header: "Contact Number" },
      { key: "Address", header: "Address" },
      { key: "City", header: "City" },
      { key: "State", header: "State" },
      { key: "Country", header: "Country" },
      { key: "EmailId", header: "Email" },
      { key: "GSTNumber", header: "GST Number" },
      { key: "PANNumber", header: "PAN Number" },
      { key: "BankName", header: "Bank Name" },
      { key: "AccountNumber", header: "Account Number" },
      { key: "IFSCCode", header: "IFSC Code" },
    ];

    // ✅ DIRECTLY USE YOUR TABLE DATA
    const rowData = filteredData.length > 0 ? filteredData : TableDatas;

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Branch Master");

    // ✅ TITLE
    sheet.mergeCells(1, 1, 1, columnDefs.length);
    const titleCell = sheet.getCell("A1");
    titleCell.value = "Branch Master";
    titleCell.font = { bold: true, size: 16 };
    titleCell.alignment = { horizontal: "center" };

    // ✅ HEADER
    const headerRow = sheet.getRow(2);
    columnDefs.forEach((col, i) => {
      const cell = headerRow.getCell(i + 1);
      cell.value = col.header;
      cell.font = { bold: true };
      cell.alignment = { horizontal: "center" };
    });

    // ✅ DATA
    rowData.forEach((row) => {
      sheet.addRow(columnDefs.map((c) => row[c.key] ?? "-"));
    });

    // ✅ AUTO WIDTH
    sheet.columns.forEach(col => col.width = 18);

    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), "Branch Master.xlsx");
  };

  const handleedit = async (id) => {
    try {

      const alldata = { id: id, branchName: '', createdby: 0, updateby: 0, mode: 'E' }

      const response = await axios.post(`${API_URL}/BranchMaster`, alldata)

      if (response.status === 200) {

        SetBranchdata(...response.data)

        Seteditid(id)

        setStatus('edit')

        setEditvisible(true)


      }


    } catch (error) {
      console.error('Error fetching staff data:', error);
    }
  };


  const HandleUpdateBranch = async () => {
    try {

      if (Branchdata === '') {
        swal({
          text: 'Please Enter The Branch Name',
          icon: 'warning'
        })
        return
      }

      const alldata = { id: editid, ...Branchdata, createdby: 0, updateby: 0, mode: 'U' }

      console.log('alldata', alldata);

      const response = await axios.post(`${API_URL}/BranchMaster`, alldata)



      if (response.status === 200) {

        setEditvisible(false)

        fetchGridData()

        swal({
          text: 'Branch Name Update SuccessFully',
          icon: 'success'
        })
      }


    } catch (err) {

      console.log(err);

    }

  }

  const handledelete = async (id) => {
    try {
      setDeletevisible(true)
      Seteditid(id)
    } catch (err) {
      console.log(err);
    }


  };


  const confirmDelete = async () => {
    try {

      const alldata = { id: editid, branchName: '', createdby: 0, updateby: 0, mode: 'D' }

      const response = await axios.post(`${API_URL}/BranchMaster`, alldata)


      if (response.status === 200) {

        swal({
          text: 'Branch Name Deleted SuccessFully',
          icon: 'success'
        })
        setDeletevisible(false)
        fetchGridData()
      }

    } catch (err) {
      console.log(err);
    }

  }

  useEffect(() => {
    fetchGridData()
  }, [])


  const [filteredData, setFilteredData] = useState([]);

  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();

    const filtered = TableDatas.filter(row =>
      row.branchName?.toLowerCase().includes(value) ||
      row.branchCode?.toLowerCase().includes(value) ||
      row.ContactPerson?.toLowerCase().includes(value) ||
      row.ContactNumber?.toLowerCase().includes(value) ||
      row.Address?.toLowerCase().includes(value) ||
      row.City?.toLowerCase().includes(value) ||
      row.State?.toLowerCase().includes(value) ||
      row.Country?.toLowerCase().includes(value) ||
      row.EmailId?.toLowerCase().includes(value) ||
      row.GSTNumber?.toLowerCase().includes(value) ||
      row.PANNumber?.toLowerCase().includes(value) ||
      row.BankName?.toLowerCase().includes(value) ||
      row.AccountNumber?.toLowerCase().includes(value) ||
      row.IFSCCode?.toLowerCase().includes(value) ||
      String(row.branchId)?.includes(value)
    );

    setFilteredData(filtered);
  };
  const [message, setMessage] = useState('');
  const handleInputChange = (event) => {
    const value = event.target.value;

    // Ensure the value contains only digits and limit to 10 digits
    if (/^\d*$/.test(value)) {
      const regex = /^\d{10}$/;
      if (value.length === 10) {
        setMessage('Mobile number is valid.');
      } else if (value.length === 0) {
        setMessage('');
      } else {
        setMessage('Mobile number must be exactly 10 digits.');
      }
    } else {
      setMessage('Only digits are allowed.');
    }
  };

  const rowData = filteredData.length > 0 ? filteredData : TableDatas;


  return (
    <div>
      {/* Edit Model start*/}
      <CModal
        size="lg"
        alignment="center"
        backdrop='static'
        visible={editvisible}
        onClose={() => setEditvisible(false)}
        aria-labelledby="VerticallyCenteredExample"
        className=" rounded-xl shadow-2xl"
      >
        <CModalHeader className='p-2 pro-header  text-white'>
          <CModalTitle id="VerticallyCenteredExample" className="text-2xl text-white font-bold text-gray-800 p-6 border-b border-gray-200">
            {Status === 'Add' ? 'Create New Branch' : 'Edit Branch'}
          </CModalTitle>
        </CModalHeader>

        <CModalBody className="p-6 bg-gray-50">
          <CForm>
            <div className="row">
              {/* Branch Name */}
              <div className="col-md-4 mb-3">
                <CFormLabel>
                  Branch Name <span className="text-danger">*</span>
                </CFormLabel>
                <CFormInput
                  type="text"
                  name="branchName"
                  placeholder="Enter Branch Name"
                  onChange={handleChange}
                  value={Branchdata.branchName}
                />
              </div>

              {/* Contact Person */}
              <div className="col-md-4 mb-3">
                <CFormLabel>
                  Contact Person <span className="text-danger">*</span>
                </CFormLabel>
                <CFormInput
                  type="text"
                  name="ContactPerson"
                  placeholder="Enter Contact Person"
                  onChange={handleChange}
                  value={Branchdata.ContactPerson}
                />
              </div>

              {/* Contact Number */}
              <div className="col-md-4 mb-3">
                <CFormLabel>Contact Number</CFormLabel>
                <CFormInput
                  type="text"
                  name="ContactNumber"
                  placeholder="Enter Contact Number"
                  onChange={(e) => {
                    handleInputChange(e);
                    handleChange(e);
                  }
                  }
                  onKeyDown={(e) => {
                    const isSpecialChar = /[^0-9 ]/.test(e.key);
                    if (isSpecialChar && e.key !== "Tab" && e.key !== "Enter" && e.key !== "Backspace") {
                      e.preventDefault();
                    }
                  }}
                  maxLength={10}
                  value={Branchdata.ContactNumber}
                />
                {message && (
                  <p style={{ color: message === 'Mobile number is valid.' ? 'green' : 'red' }}>
                    {message}
                  </p>
                )}
              </div>

              {/* Email */}
              <div className="col-md-4 mb-3">
                <CFormLabel>Email</CFormLabel>
                <CFormInput
                  type="email"
                  name="EmailId"
                  placeholder="Enter Email"
                  onChange={handleChange}
                  value={Branchdata.EmailId}
                />
              </div>

              {/* Address */}
              <div className="col-md-4 mb-3">
                <CFormLabel>Address</CFormLabel>
                <CFormInput
                  type="text"
                  name="Address"
                  placeholder="Enter Address"
                  onChange={handleChange}
                  value={Branchdata.Address}
                />
              </div>

              {/* City */}
              <div className="col-md-4 mb-3">
                <CFormLabel>City</CFormLabel>
                <CFormInput
                  type="text"
                  name="City"
                  placeholder="Enter City"
                  onChange={handleChange}
                  value={Branchdata.City}
                />
              </div>

              {/* State */}
              <div className="col-md-4 mb-3">
                <CFormLabel>State</CFormLabel>
                <CFormInput
                  type="text"
                  name="State"
                  placeholder="Enter State"
                  onChange={handleChange}
                  value={Branchdata.State}
                />
              </div>

              {/* Pincode */}
              <div className="col-md-4 mb-3">
                <CFormLabel>Pincode</CFormLabel>
                <CFormInput
                  type="text"
                  name="Pincode"
                  placeholder="Enter Pincode"
                  onChange={handleChange}
                  value={Branchdata.Pincode}
                />
              </div>

              {/* Country */}
              <div className="col-md-4 mb-3">
                <CFormLabel>Country</CFormLabel>
                <CFormInput
                  type="text"
                  name="Country"
                  placeholder="Enter Country"
                  onChange={handleChange}
                  value={Branchdata.Country}
                />
              </div>

              {/* GST Number */}
              <div className="col-md-4 mb-3">
                <CFormLabel>GST Number</CFormLabel>
                <CFormInput
                  type="text"
                  name="GSTNumber"
                  placeholder="Enter GST Number"
                  onChange={handleChange}
                  value={Branchdata.GSTNumber}
                />
              </div>

              {/* PAN Number */}
              <div className="col-md-4 mb-3">
                <CFormLabel>PAN Number</CFormLabel>
                <CFormInput
                  type="text"
                  name="PANNumber"
                  placeholder="Enter PAN Number"
                  onChange={handleChange}
                  value={Branchdata.PANNumber}
                />
              </div>

              {/* Bank Name */}
              <div className="col-md-4 mb-3">
                <CFormLabel>Bank Name</CFormLabel>
                <CFormInput
                  type="text"
                  name="BankName"
                  placeholder="Enter Bank Name"
                  onChange={handleChange}
                  value={Branchdata.BankName}
                />
              </div>

              {/* Account Number */}
              <div className="col-md-4 mb-3">
                <CFormLabel>Account Number</CFormLabel>
                <CFormInput
                  type="text"
                  name="AccountNumber"
                  placeholder="Enter Account Number"
                  onChange={handleChange}
                  value={Branchdata.AccountNumber}
                />
              </div>

              {/* IFSC Code */}
              <div className="col-md-4 mb-3">
                <CFormLabel>IFSC Code</CFormLabel>
                <CFormInput
                  type="text"
                  name="IFSCCode"
                  placeholder="Enter IFSC Code"
                  onChange={handleChange}
                  value={Branchdata.IFSCCode}
                />
              </div>
            </div>
          </CForm>
        </CModalBody>

        <CModalFooter className="p-6 border-t border-gray-200 flex justify-end gap-4">
          <CButton
            color="secondary"
            onClick={() => setEditvisible(false)}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg btn-hover-effect"
          >
            Cancel
          </CButton>
          <CButton
            color="primary"
            onClick={() => Status === 'Add' ? HandleCreateBranch() : HandleUpdateBranch()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg btn-hover-effect"
          >
            {Status === 'Add' ? 'Add' : 'Update'}
          </CButton>
        </CModalFooter>
      </CModal>

      {/* Edit model end*/}

      {/* Modal for Download Format Register Asset*/}
      <div className="modal fade" id="exampleModal" tabIndex="-1" aria-labelledby="exampleModalLabel" >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header p-2 pro-header" >
              <h1 className="modal-title fs-5 text-white" id="exampleModalLabel">Download Format</h1>
              <button type="button" className="btn-close me-2 btn-close-white" data-bs-dismiss="modal"></button>
            </div>
            <div className="modal-body">
              <div className="d-flex justify-content-evenly">
                <div className="btn btn-success btn-hover-effect" onClick={downloadExcel}>
                  <i className="bi bi-file-earmark-spreadsheet fs-1"></i>
                </div>
                <div className="btn btn-danger btn-hover-effect" onClick={handlepdf} >
                  <i className="bi bi-filetype-pdf fs-1"></i>
                </div>
              </div>
              <div className="d-flex justify-content-evenly mt-2">
                <span className="text-muted">Download Excel Format</span>
                <span className="text-muted">Download PDF Format</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Model start*/}
      <CModal
        size='sm'
        alignment="center"
        visible={deletevisible}
        onClose={() => setDeletevisible(false)}
        aria-labelledby="VerticallyCenteredExample"
      >
        <CModalTitle id="VerticallyCenteredExample" className='ms-3'>Are you sure?</CModalTitle>
        <CModalBody>
          <p>This operation can&apos;t be reverted</p>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" className='btn-hover-effect' onClick={() => setDeletevisible(false)} type='submit'>
            CANCEL
          </CButton>
          <CButton color="primary" className='btn-hover-effect' onClick={() => confirmDelete()} type='submit'>CONFIRM</CButton>
        </CModalFooter>
      </CModal>
      {/* Delete model end*/}
      <div>
        <CRow className='mb-3'>

        </CRow>

        <CCard className="mb-3">
          <CCardHeader className='pro-header p-2'  style={{ background: '#106FB2' }}>
            <div className="d-flex justify-content-center" >
              <CIcon className="me-2 text-primary" size={'xxl'} icon={cilLayers} />
              <h3 className='text-white'> All Branches</h3>
            </div>
          </CCardHeader>
          <CCardBody>
            {/* Search */}
            <div className='d-flex justify-content-between mt-2 mb-2'>
              {/* <CRow lg={5} className="mt-3"> */}
              <CCol lg={3} >
                <CFormInput
                  type="search"
                  placeholder="Search Branch"
                  onChange={handleSearch}
                />
              </CCol>
              {/* </CRow> */}

              {/* <CRow className='d-flex'> */}
              <CCol className='d-flex justify-content-end'>
                <CTooltip content="select members to export">
                  <CButton type="submit" color="danger" variant="outline" data-bs-toggle="modal"
                    data-bs-target="#exampleModal"
                    title="Export Tool Data" className='me-2 btn-hover-effect' >
                    <CIcon icon={cilCloudDownload} /> Export
                  </CButton>
                </CTooltip>
                <CButton type="submit" color="primary" variant="outline" className='btn-hover-effect' onClick={() => adddata()}>
                  <CIcon icon={cilPlus} /> Add
                </CButton>
              </CCol>
              {/* </CRow> */}
            </div>
            {/* Responsive Table */}
            <div className="card-body py-3 px-5">
              <div style={{ height: "450px" }} className="ag-theme-quartz">
                <AgGridReact
                  ref={gridRef}
                  rowData={rowData}
                  columnDefs={columnDefs}
                  rowSelection="multiple"
                  pagination={true}
                  paginationPageSize={10}
                  paginationPageSizeSelector={[10, 20, 50]}
                  getRowHeight={() => 55}
                  suppressCellFocus={true}
                  domLayout="normal"
                />
              </div>
            </div>

          </CCardBody>
        </CCard>

      </div>



    </div>
  )
}
Branches.propTypes = {
  auth: PropTypes.any.isRequired,
};
export default Branches