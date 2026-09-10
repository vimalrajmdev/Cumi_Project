import { CButton, CCardHeader, CCol, CFormInput, CFormLabel, CModal, CModalBody, CModalFooter, CModalTitle, CRow } from '@coreui/react'
import { ClientSideRowModelModule, CsvExportModule } from 'ag-grid-community'
import { AgGridReact } from 'ag-grid-react'
import axios from 'axios'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import Swal from 'sweetalert2';
import { getConfig } from 'src/config';
import PropTypes from 'prop-types';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable'
import { FaEdit, FaServer } from 'react-icons/fa'
import { BsFileEarmarkPdfFill, BsTrash } from 'react-icons/bs'
import { PiMicrosoftExcelLogoFill } from 'react-icons/pi'
import { CiEdit } from 'react-icons/ci'
import { useLocation } from 'react-router-dom'

import logo from 'src/assets/images/Base64/Apple_base64'; // Can also be base64 string
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { Card, CardBody, CardHeader } from 'react-bootstrap'
import secureLocalStorage from 'react-secure-storage';

const ReaderStatuslog = ({ auth }) => {
  const API_URL = getConfig().REACT_APP_API_URL;
  const [createmodal, setcreatemodal] = useState(false);
  const [create, setcreate] = useState([]);
  const [editmodal, seteditmodal] = useState(false)
  const [rowData, setRowData] = useState([]);
  const [loading, setLoading] = useState(false)
  const [Reader, setReader] = useState({
    Id: '', ReaderIP: '', Status: '', LogTime: ''
  })

  const handlecreate = (app) => {
    setcreate(app)
  }

  const Readerfetch = async () => {
    const alldata = { ...Reader, mode: 'F' }
    const response = await axios.post(`${API_URL}/Readerstatus`, alldata)
    console.log('res.data', response.data);
    setRowData(response.data)
  }
  useEffect(() => {
    Readerfetch();
  }, [])
  const location = useLocation();
  let pageData = location.state?.pageData;
  if (!pageData) {
    // Fallback to local storage if available
    const storedData = secureLocalStorage.getItem('pageData');
    pageData = storedData || {};

  }
  const colDefs = [
    { field: 'Id', headerClass: 'agheader', headerName: 'ID', width: '300px' },
    { field: 'ReaderIP', headerClass: 'agheader', headerName: 'Reader IP', width: '300px' },
    { field: 'Status', headerClass: 'agheader', headerName: 'Status', width: '300px' },
    {
      field: 'LogTime', headerClass: 'agheader', headerName: 'Log Date', width: '300px',
      valueGetter: (params) => {
        const date = params.data.LogTime;
        if (!date) return '-';

        const d = new Date(date);
        const yyyy = d.getUTCFullYear();
        const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
        const dd = String(d.getUTCDate()).padStart(2, '0');
        const hh = String(d.getUTCHours()).padStart(2, '0');
        const mi = String(d.getUTCMinutes()).padStart(2, '0');
        const ss = String(d.getUTCSeconds()).padStart(2, '0');
        const ms = String(d.getUTCMilliseconds()).padStart(3, '0');
        // return `${yyyy}-${mm}-${dd} `;
        return `${yyyy}-${mm}-${dd}`;
      },
    },
    {
      field: "edit", headerClass: 'agheader', headerClass: 'agheader', pinned: 'right', headerName: "Edit", width: 120,
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
          }}
          onClick={() => { handleedit(params.data.Id); seteditmodal(true); }}

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
        >
          <FaEdit className="fs-5" />
        </button>
      )
    },
    {
      field: "delete", headerClass: 'agheader', headerClass: 'agheader', pinned: 'right', headerName: "Delete", width: 120,
      cellRenderer: (params) => (
        <button
          className="border-0 mt-1 rounded-circle d-flex justify-content-center align-items-center"
          style={{
            width: "40px",
            height: "40px",
            backdropFilter: "blur(6px)",
            background: "rgba(220, 53, 69, 0.15)", // red glass look
            border: "1px solid rgba(220, 53, 69, 0.3)",
            color: "#dc3545",
            transition: "all 0.3s ease",
            boxShadow: "0 2px 6px rgba(0, 0, 0, 0.1)",
          }}
          onClick={() => { handledelete(params.data.Id) }}
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
        >
          <BsTrash className="fs-5" />
        </button>

      )
    }
  ];


  const gridRef = useRef(null);
  const onExportClick = async () => {
    const columnDefs = [
      { header: "Id", key: "Id" },
      { header: "Reader IP", key: "ReaderIP" },
      { header: "Status", key: "Status" },
      { header: "Log Time", key: "LogTime" },
    ];

    const rowData = [];
    gridRef.current.api.forEachNode((node) => rowData.push(node.data));

    // Helper — Format date to DD-MM-YYYY
    const formatDate = (d) => {
      if (!d) return "";
      const date = new Date(d);
      if (isNaN(date)) return d; // in case it's already formatted
      return `${String(date.getDate()).padStart(2, "0")}-${String(
        date.getMonth() + 1
      ).padStart(2, "0")}-${date.getFullYear()}`;
    };

    // Create Excel file
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Reader Status Log");

    sheet.views = [{ showGridLines: false }];

    const now = new Date();
    const formattedDate = now.toLocaleDateString("en-IN");

    // ⭐ TITLE
    sheet.mergeCells(1, 1, 1, columnDefs.length);
    const titleCell = sheet.getCell("A1");
    titleCell.value = `Reader Status Log - ${formattedDate}`;
    titleCell.font = { bold: true, size: 16 };
    titleCell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "D9D9D9" },
    };
    titleCell.border = {
      top: { style: "thin" },
      left: { style: "thin" },
      bottom: { style: "thin" },
      right: { style: "thin" },
    };
    titleCell.alignment = { vertical: "middle", horizon3al: "center" };

    // ⭐ HEADER (ROW 2)
    const headerRow = sheet.getRow(2);
    columnDefs.forEach((col, i) => {
      const cell = headerRow.getCell(i + 1);
      cell.value = col.header;
      cell.font = { bold: true };
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "D9D9D9" },
      };
      cell.alignment = { horizontal: "center", vertical: "center" };
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
    });
    headerRow.commit();

    // ⭐ DATA ROWS
    rowData.forEach((row) => {
      const rowValues = columnDefs.map((c) => {
        let v = row[c.key];

        // Format DOB & DOJ
        if (c.key === "DateOfBirth" || c.key === "DateOfJoining") {
          return formatDate(v);
        }

        // Remove time from ISO date if exists (2025-11-10T00:00:00)
        // if (typeof v === "string" && v.includes("T")) {
        //     v = v.split("T")[0];
        // }

        return v ?? "";
      });

      const dataRow = sheet.addRow(rowValues);

      dataRow.eachCell((cell) => {
        cell.alignment = { horizontal: "center", vertical: "center" };
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
      });
    });

    // ⭐ AUTO COLUMN WIDTH
    sheet.columns.forEach((column) => {
      let maxLength = 0;
      column.eachCell({ includeEmpty: true }, (cell) => {
        const colValue = cell.value ? cell.value.toString() : "";
        maxLength = Math.max(maxLength, colValue.length);
      });
      column.width = maxLength < 10 ? 10 : maxLength + 5;
    });

    // Save Excel file
    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), "Reader Status Log.xlsx");
  };


  //pdf
  const handlepdf = async (selectedDate) => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 0));

    const filteredData = gridRef.current.api.getModel().rowsToDisplay.map(rowNode => rowNode.data);

    const doc = new jsPDF({ orientation: "portrait", format: 'a4' });
    const title = 'Reader Status Log';

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
      'Id',
      'Reader IP',
      'Status',
      'Log Time',
    ];

    // ✅ Match field names from API / grid (case-sensitive!)
    const bodyData = filteredData.map(item => [
      item.Id || "-",
      item.ReaderIP || "-",
      item.Status || "-",
      item.LogTime || "-",
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

      doc.save("Reader Status Log.pdf");
    } else {
      Swal.fire("No data available to export", "", "warning");
    }
    setLoading(false);
  };
  //end pdf

  //export end..........
  const handlesave = async () => {
    if (Reader.ReaderIP == '') {
      swal({
        text: "please Enter Reader IP",
        icon: "warning",
      })
      return
    }
    if (Reader.Status == '') {
      swal({
        text: "please Enter Status",
        icon: "warning",
      })
      return
    }
    const alldata = { ...Reader, mode: 'I' }
    const response = await axios.post(`${API_URL}/Readerstatus`, alldata)
    if (response.status === 200) {
      Swal.fire({
        position: "center",
        icon: "success",
        title: "Your work has been saved",
        showConfirmButton: false,
        timer: 1500
      });
      Readerfetch();
      setcreatemodal(false)
    } else {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Something went wrong!",
        footer: '<a href="#">Why do I have this issue?</a>'
      });

    }
  }
  const handleedit = async (params) => {
    const Id = params
    const alldata = { ...Reader, Id: Id, mode: 'E' }
    const response = await axios.post(`${API_URL}/Readerstatus`, alldata)
    if (response.status === 200) {
      setReader(...response.data)
    }
  }
  const handleupdate = async () => {
    const alldata = { ...Reader, mode: 'U' }
    console.log('alldata', alldata);
    const response = await axios.post(`${API_URL}/Readerstatus`, alldata)
    if (response.status === 200) {
      Swal.fire({
        position: "center",
        icon: "success",
        title: "Your Reader Status Log has been Update",
        showConfirmButton: false,
        timer: 1500
      });
      Readerfetch();
      seteditmodal(false)
    } else {
      Swal.fire({
        icon: "error",
        title: "Save Failed",
        text: "Something went wrong. Please try again.",
      });
    }
  }
  const handledelete = async (params) => {
    const Id = params
    const alldata = { ...Reader, Id: Id, mode: 'D' }
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be Delete this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!"
    }).then(async (result) => {
      if (result.isConfirmed) {
        const response = await axios.post(`${API_URL}/Readerstatus`, alldata)
        if (response.status === 200) {
          Swal.fire({

            icon: 'success',


            text: 'user Deleted Successfully!',
          });
          Readerfetch();
        }
      }
    })
  }
  const defaultColDef = useMemo(() => {
    return {
      filter: "agTextColumnFilter",
      floatingFilter: true,
      editable: true,
    };
  }, []);
  const rowSelection = {
    mode: "multiRow",
    hideDisabledCheckboxes: true,
  }
  return (
    <div>

      {/* Modal for Download Format Register Asset*/}
      <div className="modal fade" id="exampleModal" tabIndex="-1" aria-labelledby="exampleModalLabel" >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header p-2 pro-header">
              <h1 className="modal-title fs-5 text-white" id="exampleModalLabel">Download Format</h1>
              <button type="button" className="btn-close btn-close-white me-2" data-bs-dismiss="modal"></button>
            </div>
            <div className="modal-body">
              <div className="d-flex justify-content-evenly">
                <div className="btn btn-success" onClick={onExportClick}>
                  <i className="bi bi-file-earmark-spreadsheet fs-1"></i>
                </div>
                <div className="btn btn-danger" onClick={handlepdf} >
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
      {/* <h3 className='mt-2' style={{ fontFamily: 'Baskerville Old Face' }}>Reader Status Log</h3> */}
      <Card>
        <CardHeader className='pro-header'>
          <div className='d-flex justify-content-center text-white'>
            <FaServer style={{ fontSize: '30px' }} className='mb-2 me-1' /> <h3 className='text-white'>Reader Status Log</h3>
          </div>
        </CardHeader>
        <CardBody>
          <div className='d-flex justify-content-end'>
            <div className='d-flex justify-content-end mt-3 flex-wrap col-lg-12 col-md-12 col-sm-12'>
              <div className='d-flex flex-wrap'>
                {/* {
                  (pageData.addstatus === null || pageData.addstatus === 'i') && auth.UserStatus === 'A'
                    ? '' :
                    <CButton className=" ms-2 mb-2 " variant='outline' color='success' onClick={() => setUploadvisible(true)}>
                      <i className="bi bi-cloud-download me-1"></i>
                      Import
                    </CButton>
                } */}
                <CButton className="btn  ms-2 mb-2" variant='outline' color='danger'
                  data-bs-toggle="modal" data-bs-target="#exampleModal"
                >
                  <i className="bi bi-cloud-upload me-1"></i>
                  Export
                </CButton>
                {
                  (pageData.addstatus === null || pageData.addstatus === 'i') && auth.UserStatus === 'A'
                    ? '' :

                    <CButton className="btn ms-2 mb-2" variant='outline' onClick={() => {
                      handlecreate(); setcreatemodal(true);
                      setReader({
                        Id: '', ReaderIP: '', Status: '', LogTime: ''
                      })
                    }} color='primary'>
                      <i className="bi bi-plus-lg me-1"></i>
                      Add
                    </CButton>
                }
              </div>
            </div>
          </div>
          <CModal
            size='md'
            alignment='center'
            backdrop='static'
            visible={createmodal}
            onClose={() => setcreatemodal(false)}
          >
            <CCardHeader className='p-2 d-flex pro-header justify-content-between align-items-center' id='cardheader'>
              <h5 className='text-light m-0' >Add New Reader Status Log</h5>
              <span
                color="danger"
                size="sm"
                onClick={() => setcreatemodal(false)}
                className="text-light me-2"
              >
                <i class="bi bi-x-lg"></i>
              </span>
            </CCardHeader>
            <CModalBody>
              <CRow>
                <CCol>
                  <CFormLabel>Reader IP <span className='text-danger'>*</span></CFormLabel>
                  <CFormInput type='text' placeholder='Enter Reader IP' onChange={(e) => setReader({ ...Reader, ReaderIP: e.target.value })} />
                </CCol>
                <CCol>
                  <CFormLabel>Status <span className='text-danger'>*</span></CFormLabel>
                  <CFormInput type='text' placeholder='Enter Status' onChange={(e) => setReader({ ...Reader, Status: e.target.value })} />
                </CCol>
              </CRow>
            </CModalBody>
            <CModalFooter>
              <CButton
                style={{
                  background: 'linear-gradient(45deg, #ff6b6b, #c0392b)', // Red gradient
                  color: '#fff',
                  border: 'none',
                  fontSize: '1rem',
                  fontWeight: '500',
                  borderRadius: '8px',
                  boxShadow: '0px 4px 10px rgba(255, 99, 71, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                  padding: '8px 16px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.05)';
                  e.currentTarget.style.boxShadow = '0px 6px 14px rgba(255, 99, 71, 0.5)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.boxShadow = '0px 4px 10px rgba(255, 99, 71, 0.3)';
                }}
                onClick={() => setcreatemodal(false)}
              >
                Cancel
              </CButton>
              <button
                className="btn btn-info"
                style={{
                  background: 'linear-gradient(45deg, #00c6ff, #0072ff)',
                  color: '#fff',
                  fontWeight: '500',
                  borderRadius: '8px',
                  padding: '8px 16px',
                  boxShadow: '0px 4px 10px rgba(0, 114, 255, 0.3)',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.05)';
                  e.currentTarget.style.boxShadow = '0px 6px 14px rgba(0, 114, 255, 0.5)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.boxShadow = '0px 4px 10px rgba(0, 114, 255, 0.3)';
                }}
                onClick={handlesave}
              >
                Save
              </button>
            </CModalFooter>
          </CModal>
          {/* //edit model */}
          <CModal
            size='md'
            visible={editmodal}
            alignment='center'
            backdrop='static'
            onClose={() => seteditmodal(false)}
          >
            <CCardHeader className='p-2 pro-header d-flex justify-content-between align-items-center' id='cardheader'>
              <h5 className='text-light m-0 ' >Edit Reader Status Log</h5>
              <span
                color="danger"
                size="sm"
                onClick={() => seteditmodal(false)}
                className="text-light me-2"
              >
                <i class="bi bi-x-lg"></i>
              </span>
            </CCardHeader>
            <CModalBody>
              <CRow>

                <CCol>
                  <CFormLabel>Reader IP <span className='text-danger'>*</span></CFormLabel>
                  <CFormInput type='text' placeholder='Enter Reader IP' onChange={(e) => setReader({ ...Reader, ReaderIP: e.target.value })} value={Reader.ReaderIP} />
                </CCol>
                <CCol>
                  <CFormLabel>Status <span className='text-danger'>*</span></CFormLabel>
                  <CFormInput type='text' placeholder='Enter Status' onChange={(e) => setReader({ ...Reader, Status: e.target.value })} value={Reader.Status} />
                </CCol>
              </CRow>

            </CModalBody>
            <CModalFooter>
              <CButton
                style={{
                  background: 'linear-gradient(45deg, #ff6b6b, #c0392b)', // Red gradient
                  color: '#fff',
                  border: 'none',
                  fontSize: '1rem',
                  fontWeight: '500',
                  borderRadius: '8px',
                  boxShadow: '0px 4px 10px rgba(255, 99, 71, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                  padding: '8px 16px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.05)';
                  e.currentTarget.style.boxShadow = '0px 6px 14px rgba(255, 99, 71, 0.5)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.boxShadow = '0px 4px 10px rgba(255, 99, 71, 0.3)';
                }}
                onClick={() => seteditmodal(false)}
              >
                Cancel
              </CButton>
              <button
                className="btn btn-info"
                style={{
                  background: 'linear-gradient(45deg, #00c6ff, #0072ff)',
                  color: '#fff',
                  fontWeight: '500',
                  borderRadius: '8px',
                  padding: '8px 16px',
                  boxShadow: '0px 4px 10px rgba(0, 114, 255, 0.3)',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.05)';
                  e.currentTarget.style.boxShadow = '0px 6px 14px rgba(0, 114, 255, 0.5)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.boxShadow = '0px 4px 10px rgba(0, 114, 255, 0.3)';
                }}
                onClick={handleupdate}
              >
                Update
              </button>
            </CModalFooter>
          </CModal>
          <div style={{ height: 500, width: '100%' }} className="ag-theme-quartz mt-2">
            <AgGridReact
              modules={[ClientSideRowModelModule, CsvExportModule]}
              rowData={rowData}
              ref={gridRef}
              columnDefs={colDefs}
              defaultColDef={defaultColDef}
              rowSelection={rowSelection}
              pagination={true}
              paginationPageSize={10}
              paginationPageSizeSelector={[10, 25, 50]}
              getRowHeight={() => 60}
            />
          </div>
        </CardBody>
      </Card>
    </div>
  )
}
ReaderStatuslog.propTypes = {
  auth: PropTypes.any.isRequired,
};
export default ReaderStatuslog
