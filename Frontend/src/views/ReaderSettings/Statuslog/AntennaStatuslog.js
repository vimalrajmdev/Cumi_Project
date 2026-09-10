import { CButton, CCardHeader, CCol, CFormInput, CFormLabel, CModal, CModalBody, CModalFooter, CModalTitle, CRow } from '@coreui/react';
import { ClientSideRowModelModule, CsvExportModule } from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';
import React, { useEffect, useMemo, useRef, useState } from 'react'
import Swal from 'sweetalert2';
import { getConfig } from 'src/config';
import axios from 'axios';
// import { Pencil } from 'lucid-react';
import { FaEdit, FaSatelliteDish, FaTrash } from 'react-icons/fa';
import PropTypes from 'prop-types';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable'
// import arkema from '../../../assets/images/ARKEMA_logo3.png';
// import Meritimage from 'src/views/Meritlogo/Meritimage';
import { BsFileEarmarkPdfFill, BsTrash } from 'react-icons/bs';
import { PiMicrosoftExcelLogoFill } from 'react-icons/pi';
import { CiEdit } from 'react-icons/ci';


import logo from 'src/assets/images/Base64/Apple_base64'; // Can also be base64 string
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { useLocation } from 'react-router-dom';
import { Card, CardBody, CardHeader } from 'react-bootstrap';
import secureLocalStorage from 'react-secure-storage';
const AntennaStatuslog = ({ auth }) => {
  const API_URL = getConfig().REACT_APP_API_URL;
  const [createmodal, setcreatemodal] = useState(false);
  const [editmodal, seteditmodal] = useState(false)
  const [loading, setLoading] = useState(false)

  const [create, setcreate] = useState([])
  const [rowData, setRowData] = useState([]);
  const [Antenna, setAntenna] = useState({
    Id: '', ReaderIP: '', AntennaID: '', Status: '', Gain: '',
    TransmitPower: '', ReceiveSensitivity: '', LogTime: ''
  })
  const handlecreate = (app) => {
    setcreate(app);
  }
  const Antennafetch = async () => {
    const alldata = { ...Antenna, mode: 'F' }
    const response = await axios.post(`${API_URL}/Atennastatus`, alldata)
    console.log('res.data', response.data)
    setRowData(response.data)
  }
  const location = useLocation();
  let pageData = location.state?.pageData;
  if (!pageData) {
    // Fallback to local storage if available
    const storedData = secureLocalStorage.getItem('pageData');
    pageData = storedData || {};
  }
  useEffect(() => {
    Antennafetch();
  }, [])
  const handlesave = async () => {
    if (Antenna.ReaderIP == '') {
      swal({
        text: "please Enter Reader IP",
        icon: "warning",
      })
      return
    }
    if (Antenna.AntennaID == '') {
      swal({
        text: "please Enter Antenna ID",
        icon: "warning",
      })
      return
    }
    if (Antenna.Status == '') {
      swal({
        text: "please Enter Status",
        icon: "warning",
      })
      return
    }

    if (Antenna.Gain == '') {
      swal({
        text: "please Enter Gain",
        icon: "warning",
      })
      return
    }
    if (Antenna.TransmitPower == '') {
      swal({
        text: "please Enter Transmit Power",
        icon: "warning",
      })
      return
    }
    //   if (Antenna.ReceiveSensitivity == '') {
    //   swal({
    //     text: "please Enter ReceiveSensitivity",
    //     icon: "warning",
    //   })
    //   return
    // }
    const alldata = { ...Antenna, mode: 'I' }
    const response = await axios.post(`${API_URL}/Atennastatus`, alldata)
    if (response.status === 200) {
      Swal.fire({
        position: "center",
        icon: "success",
        title: "Your work has been saved",
        showConfirmButton: false,
        timer: 1500
      });
      Antennafetch();
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
  const colDefs = [
    { field: 'Id', headerClass: 'agheader', headerName: 'ID', width: 100 },
    { field: 'ReaderIP', headerClass: 'agheader', headerName: 'Reader IP', width: 150 },
    { field: 'AntennaID', headerClass: 'agheader', headerName: 'Antenna ID', width: 150 },
    { field: 'Status', headerClass: 'agheader', headerName: 'Status', width: 150 },
    { field: 'Gain', headerClass: 'agheader', headerName: 'Gain', width: 140 },
    { field: 'TransmitPower', headerClass: 'agheader', headerName: 'Transmit Power' },
    { field: 'ReceiveSensitivity', headerClass: 'agheader', headerName: 'Receive Sensitivity' },
    {
      field: 'LogTime', headerClass: 'agheader', headerName: 'Log Time', width: 159,
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
        return `${dd}-${mm}-${yyyy} ${hh}:${mi}:${ss}`;
      },
    },
    {
      field: "edit", headerClass: 'agheader', headerClass: 'agheader', pinned: 'right', headerName: "Edit", width: 100,
      cellRenderer: (params) => {
        const isEditable = !((pageData.editstatus === null || pageData.editstatus === 'i') && auth.UserStatus === 'A');
        if (!isEditable) return null;
        return (
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
      }
    },

    {
      field: "delete", headerClass: 'agheader', headerClass: 'agheader', pinned: 'right', headerName: "Delete", width: 100,
      cellRenderer: (params) => {
        if (pageData.deletestatus === null || pageData.deletestatus === 'i') return null;
        return (
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
            <FaTrash className="fs-5" />
          </button>
        )
      }
    }
  ];
  const handleedit = async (params) => {
    const Id = params
    const alldata = { ...Antenna, Id: Id, mode: 'E' }
    const response = await axios.post(`${API_URL}/Atennastatus`, alldata)
    if (response.status === 200) {
      setAntenna(...response.data)
    }
  }
  const handleupdate = async () => {
    const alldata = { ...Antenna, mode: 'U' }
    console.log('alldata', alldata);
    const response = await axios.post(`${API_URL}/Atennastatus`, alldata)
    if (response.status === 200) {
      Swal.fire({
        position: "center",
        icon: "success",
        title: "Your Antenna Status Log has been Update",
        showConfirmButton: false,
        timer: 1500
      });
      Antennafetch();
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
    const alldata = { ...Antenna, Id: Id, mode: 'D' }
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
        const response = await axios.post(`${API_URL}/Atennastatus`, alldata)
        if (response.status === 200) {
          Swal.fire({

            icon: 'success',
            text: 'Deleted Successfully!',
          });
          Antennafetch();
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
  const gridRef = useRef(null);
  const onExportClick = async () => {
    const columnDefs = [
      { header: "Id", key: "Id" },
      { header: "Reader IP", key: "ReaderIP" },
      { header: "Antenna ID", key: "AntennaID" },
      { header: "Status", key: "Status" },
      { header: "Gain", key: "Gain" },
      { header: "Transmit Power", key: "TransmitPower" },
      { header: "Receive Sensitivity", key: "ReceiveSensitivity" },
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
    const sheet = workbook.addWorksheet("Antenna Status Log");

    sheet.views = [{ showGridLines: false }];

    const now = new Date();
    const formattedDate = now.toLocaleDateString("en-IN");

    // ⭐ TITLE
    sheet.mergeCells(1, 1, 1, columnDefs.length);
    const titleCell = sheet.getCell("A1");
    titleCell.value = `Antenna Status Log - ${formattedDate}`;
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
    saveAs(new Blob([buffer]), "Antenna Status Log.xlsx");
  };

  // console.log("Row data sample:", gridRef.current.api.getModel().rowsToDisplay[0].data);

  //pdf
  const handlepdf = async (selectedDate) => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 0));

    const filteredData = gridRef.current.api.getModel().rowsToDisplay.map(rowNode => rowNode.data);

    const doc = new jsPDF({ orientation: "portrait", format: 'a4' });
    const title = 'Antenna Status Log';

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
      'Antenna ID',
      'Status',
      'Gain',
      'Transmit Power',
      'Receive Sensitivity',
      'Log Time',

    ];

    // ✅ Match field names from API / grid (case-sensitive!)
    const bodyData = filteredData.map(item => [
      item.Id || "-",
      item.ReaderIP || "-",
      item.AntennaID || "-",
      item.Status || "-",
      item.Gain || "-",
      item.TransmitPower || "-",
      item.ReceiveSensitivity || "-",
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

      doc.save("Antenna Status Log.pdf");
    } else {
      Swal.fire("No data available to export", "", "warning");
    }
    setLoading(false);
  };
  //end pdf
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
      <Card className='mt-4'>
        <CardHeader className='pro-header'>
          <div className='d-flex justify-content-center text-white'>
            <FaSatelliteDish style={{ fontSize: '30px' }} className='mb-2 me-1' /> <h3 className='text-white'>Antenna Status Log</h3>
          </div>
        </CardHeader>
        <CardBody>
          <div className='d-flex justify-content-end mt-2 flex-wrap col-lg-12 col-md-12 col-sm-12'>
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
                  <CButton className="btn ms-2 mb-2" onClick={() => {
                    handlecreate(); setcreatemodal(true);
                    setAntenna({
                      Id: '', ReaderIP: '', AntennaID: '', Status: '', Gain: '',
                      TransmitPower: '', ReceiveSensitivity: '', LogTime: ''
                    })
                  }} variant='outline' color='primary'>
                    <i className="bi bi-plus-lg me-1"></i>
                    Add
                  </CButton>

              }

            </div>
          </div>
          {/* <div className='d-flex justify-content-end'>
            {
              (pageData.editstatus === null || pageData.editstatus === 'i') && auth.UserStatus === 'A'
                ? '' :
                <div className="btn-group">
                  <button
                    className="btn text-white dropdown-toggle me-2"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                    role="button"
                    style={{
                      background: 'linear-gradient(45deg, #e53935, #b71c1c)',
                      border: 'none',
                      borderRadius: '8px',
                      fontWeight: '500',
                      boxShadow: '0 4px 10px rgba(229, 57, 53, 0.4)',
                      // padding: '10px 20px',
                      transition: 'all 0.3s ease-in-out',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'scale(1.03)';
                      e.currentTarget.style.boxShadow = '0 6px 14px rgba(229, 57, 53, 0.5)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'scale(1)';
                      e.currentTarget.style.boxShadow = '0 4px 10px rgba(229, 57, 53, 0.4)';
                    }}
                  >
                    <i className="bi bi-download me-2"></i>Download
                  </button>

                  <ul className="dropdown-menu mt-2 shadow rounded-3">
                    <li>
                      <button
                        className="dropdown-item d-flex align-items-center"
                        onClick={handlepdf}
                        style={{
                          gap: '10px',
                          fontWeight: '500',
                          // padding: '10px 16px',
                          transition: 'background-color 0.2s ease',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#f8d7da';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                        }}

                      >
                        <BsFileEarmarkPdfFill
                          style={{
                            color: 'rgb(187, 10, 10)',
                            fontSize: '22px',
                            flexShrink: 0,
                          }}
                        />
                        <span>PDF</span>
                      </button>
                    </li>
                    <li>
                      <button
                        className="dropdown-item d-flex align-items-center"
                        onClick={onExportClick}
                        style={{
                          gap: '10px',
                          fontWeight: '500',
                          padding: '10px 16px',
                          transition: 'background-color 0.2s ease',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#d1e7dd';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                        }}
                      >
                        <PiMicrosoftExcelLogoFill
                          style={{
                            color: 'rgb(43, 126, 23)',
                            fontSize: '24px',
                            flexShrink: 0,
                          }}
                        />
                        <span>Excel</span>
                      </button>
                    </li>
                  </ul>
                </div>
            }
            {
              (pageData.editstatus === null || pageData.editstatus === 'i') && auth.UserStatus === 'A'
                ? '' :
                <CButton
                  style={{
                    background: 'linear-gradient(45deg, #2cc22cff, #0b2b94ff)',
                    color: '#fff',
                    border: 'none',
                    // padding: '10px 20px',
                    fontSize: '1rem',
                    fontWeight: '500',
                    borderRadius: '8px',
                    boxShadow: '0px 4px 10px rgba(76, 175, 80, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.05)';
                    e.currentTarget.style.boxShadow = '0px 6px 14px rgba(76, 175, 80, 0.5)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                    e.currentTarget.style.boxShadow = '0px 4px 10px rgba(76, 175, 80, 0.3)';
                  }}
                  onClick={() => {
                    handlecreate(); setcreatemodal(true);
                    setAntenna({
                      Id: '', ReaderIP: '', AntennaID: '', Status: '', Gain: '',
                      TransmitPower: '', ReceiveSensitivity: '', LogTime: ''
                    })
                  }}
                >
                  Add  <i className="bi bi-arrow-right-circle"></i>
                </CButton>
            }
          </div> */}

          <CModal
            size='lg'
            alignment='center'
            backdrop='static'
            visible={createmodal}
            onClose={() => setcreatemodal(false)}
          >
            <CCardHeader className='p-2 d-flex pro-header justify-content-between align-items-center' >
              <h5 className='text-light m-0' >Add New Antenna Status Log</h5>
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
                  <CFormInput type='text' placeholder='Enter Reader IP' onChange={(e) => setAntenna({ ...Antenna, ReaderIP: e.target.value })} />
                </CCol>
                <CCol>
                  <CFormLabel>Antenna ID <span className='text-danger'>*</span></CFormLabel>
                  <CFormInput type='text' placeholder='Enter Antenna ID' onChange={(e) => setAntenna({ ...Antenna, AntennaID: e.target.value })} />
                </CCol>
                <CCol>
                  <CFormLabel>Status <span className='text-danger'>*</span></CFormLabel>
                  <CFormInput type='text' placeholder='Enter Status' onChange={(e) => setAntenna({ ...Antenna, Status: e.target.value })} />
                </CCol>
              </CRow>
              <CRow className='mt-2'>
                <CCol>
                  <CFormLabel>Gain <span className='text-danger'>*</span></CFormLabel>
                  <CFormInput type='text' placeholder='Enter Gain' onChange={(e) => setAntenna({ ...Antenna, Gain: e.target.value })} />
                </CCol>

                <CCol>
                  <CFormLabel>Transmit Power <span className='text-danger'>*</span></CFormLabel>
                  <CFormInput type='text' placeholder='Enter Transmit Power' onChange={(e) => setAntenna({ ...Antenna, TransmitPower: e.target.value })} />
                </CCol>
                <CCol>
                  <CFormLabel>Receive Sensitivity <span className='text-danger'>*</span></CFormLabel>
                  <CFormInput type='text' placeholder='Enter Receive Sensitivity' onChange={(e) => ({ ...Antenna, ReceiveSensitivity: e.target.value })} />
                </CCol>
              </CRow>
              <CRow>

                {/* <CCol>
                            <CFormLabel>Log Time <span className='text-danger'>*</span></CFormLabel>
                            <CFormInput type='text' placeholder='Enter Log Time' onChange={(e) => setReader({ ...Antenna, LogTime: e.target.value })} />
                        </CCol> */}
                <CCol>

                </CCol>
                <CCol>

                </CCol>
              </CRow>
            </CModalBody>
            <CModalFooter>

              <button
                onClick={() => setcreatemodal(false)}
                style={{
                  background: 'linear-gradient(45deg, #ff6b6b, #c0392b)',
                  color: '#fff',
                  border: 'none',
                  fontSize: '1rem',
                  fontWeight: '500',
                  borderRadius: '8px',
                  padding: '8px 16px',
                  boxShadow: '0px 4px 10px rgba(255, 99, 71, 0.3)',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                  marginRight: '8px',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.05)';
                  e.currentTarget.style.boxShadow = '0px 6px 14px rgba(255, 99, 71, 0.5)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.boxShadow = '0px 4px 10px rgba(255, 99, 71, 0.3)';
                }}
              >
                Cancel
              </button>
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
              >Save</button>
            </CModalFooter>
          </CModal>

          {/* //edit model */}
          <CModal
            size='lg'
            visible={editmodal}
            alignment='center'
            backdrop='static'
            onClose={() => seteditmodal(false)}
          >
            <CCardHeader className='p-2 pro-header d-flex justify-content-between align-items-center'>
              <h5 className='text-light m-0' >Edit Antenna Status Log</h5>
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
                  <CFormInput type='text' placeholder='Enter ReaderIp' onChange={(e) => setAntenna({ ...Antenna, ReaderIP: e.target.value })} value={Antenna.ReaderIP} />
                </CCol>
                <CCol>
                  <CFormLabel>Antenna ID <span className='text-danger'>*</span></CFormLabel>
                  <CFormInput type='text' placeholder='Enter Antenna ID' onChange={(e) => setAntenna({ ...Antenna, AntennaID: e.target.value })} value={Antenna.AntennaID} />
                </CCol>
                <CCol>
                  <CFormLabel>Status <span className='text-danger'>*</span></CFormLabel>
                  <CFormInput type='text' placeholder='Enter Status' onChange={(e) => setAntenna({ ...Antenna, Status: e.target.value })} value={Antenna.Status} />
                </CCol>
              </CRow>
              <CRow className='mt-2'>
                <CCol>
                  <CFormLabel>Gain <span className='text-danger'>*</span></CFormLabel>
                  <CFormInput type='text' placeholder='Enter Gain' onChange={(e) => setAntenna({ ...Antenna, Gain: e.target.value })} value={Antenna.Gain} />
                </CCol>

                <CCol>
                  <CFormLabel>Transmit Power <span className='text-danger'>*</span></CFormLabel>
                  <CFormInput type='text' placeholder='Enter Transmit Power' onChange={(e) => setAntenna({ ...Antenna, TransmitPower: e.target.value })} value={Antenna.TransmitPower} />
                </CCol>
                <CCol>
                  <CFormLabel>Receive Sensitivity <span className='text-danger'>*</span></CFormLabel>
                  <CFormInput type='text' placeholder='Enter Receive Sensitivity' onChange={(e) => ({ ...Antenna, ReceiveSensitivity: e.target.value })} value={Antenna.ReceiveSensitivity} />
                </CCol>
              </CRow>
              <CRow>
                {/* 
                        <CCol className='mt-2'>
                            <CFormLabel>Log Time <span className='text-danger'>*</span></CFormLabel>
                            <CFormInput type='text' placeholder='Enter Log Time' onChange={(e) => setReader({ ...Antenna, LogTime: e.target.value })} value={Antenna.LogTime} />
                        </CCol> */}
                <CCol>

                </CCol>
                <CCol>

                </CCol>
              </CRow>
            </CModalBody>
            <CModalFooter>
              <button
                onClick={() => seteditmodal(false)}
                style={{
                  background: 'linear-gradient(45deg, #ff6b6b, #c0392b)',
                  color: '#fff',
                  border: 'none',
                  fontSize: '1rem',
                  fontWeight: '500',
                  borderRadius: '8px',
                  padding: '8px 16px',
                  boxShadow: '0px 4px 10px rgba(255, 99, 71, 0.3)',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                  marginRight: '8px',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.05)';
                  e.currentTarget.style.boxShadow = '0px 6px 14px rgba(255, 99, 71, 0.5)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.boxShadow = '0px 4px 10px rgba(255, 99, 71, 0.3)';
                }}
              >
                Cancel
              </button>
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
AntennaStatuslog.propTypes = {
  auth: PropTypes.any.isRequired,
};
export default AntennaStatuslog
