import React, { useRef, useState, useMemo, useEffect } from 'react'
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import "ag-grid-community/styles/ag-theme-quartz.css";
import axios from 'axios';
import { API_URL } from 'src/config';
import { useLocation } from 'react-router-dom';
import PropTypes from 'prop-types';
import { getConfig } from 'src/config';
import { CButton } from '@coreui/react';
import { Card, CardBody, CardHeader } from 'react-bootstrap';
import secureLocalStorage from 'react-secure-storage';
const InventoryReport = ({ auth }) => {
  const API_URL = getConfig().REACT_APP_API_URL;
  const componentRef = useRef(null);
  const location = useLocation();
  let pageData = location.state?.pageData;
  const [filteredRowDef, setFilteredRowDef] = useState([]);
  const [loading, setLoading] = useState(false);
  if (!pageData) {
    // Fallback to local storage if available
    const storedData = secureLocalStorage.getItem('pageData');
    pageData = storedData || {};
  }
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  // console.log("pageData", pageData);
  const generatePDF = async () => {
    setLoading(true);

    try {
      const filteredData = gridRef.current.api.getModel().rowsToDisplay.map(rowNode => rowNode.data);

      const doc = new jsPDF({ format: 'a3' });
      const title = 'All Asset Report';
      const titleX = doc.internal.pageSize.width / 2; // Center the title
      const titleY = 15;

      // Logo settings
      const logoWidth = 50;
      const logoHeight = 20;
      const logoX = doc.internal.pageSize.width - logoWidth - 10; // Align logo to the right
      const logoY = titleY - 8;

      const logo = Logo; // Use the logo in Base64 format

      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");

      // Add the logo image
      doc.addImage(logo, 'PNG', logoX, logoY, logoWidth, logoHeight);

      // Title (centered)
      const titleWidth = doc.getTextWidth(title);
      const centeredTitleX = (doc.internal.pageSize.width - titleWidth) / 2;
      doc.text(title, centeredTitleX, titleY, { align: 'center' });

      // Date and employee info
      const currentDate = new Date();
      const formattedDate = currentDate.toLocaleDateString('en-GB');

      const dateX = 10;  // Left-aligned date
      const dateY = titleY + 5;
      const employeeX = 10;  // Left-aligned employee name
      const employeeY = dateY + 5;

      doc.text(`Date: ${formattedDate}`, dateX, dateY);
      doc.text(`Employee: ${auth.empid}`, employeeX, employeeY);

      if (filteredData.length > 0) {
        // Define columns and corresponding data keys
        const columnMapping = [
          { header: "RFID Number", key: "RFIDnumber", },
          { header: "Asset Id", key: "id", },
          { header: "Asset Name", key: "AssetName", },
          { header: "Description", key: "Description", },
          { header: "Category", key: "Category", },
          { header: "Sub Category", key: "SubCategory", },
          // { header: "Brand", key: "Brand", },
          // { header: "Cost", key: "PCost", },
          // { header: "Purshase Date", key: "PDate", },
          // { header: "Disposed Date", key: "DisposedDate", },
          { header: "Created Date", key: "CreatedDate", },
          { header: "Branch", key: "Branch", },
          { header: "Physical Location", key: "PhysicalLocation", },
        ];

        // Extract headers and map data accordingly
        const columnHeaders = columnMapping.map(col => col.header);
        const data = filteredData.map(obj => columnMapping.map(col => obj[col.key] || ''));

        const tableYPosition = 30;  // Adjust the Y-position for the table

        // Add the table to the PDF
        doc.autoTable({
          head: [columnHeaders],
          body: data,
          startY: tableYPosition,
          margin: { top: 60, left: 15, right: 10 },
          styles: {
            theme: 'grid',
            halign: 'center',
            valign: 'middle',
            fontSize: 8,
            minCellHeight: 6,
            overflow: 'linebreak',
            cellWidth: 'wrap',
            lineColor: [0, 0, 0],
            lineWidth: 0.5,
          },
          columnStyles: {
            0: { cellWidth: 40 },
            1: { cellWidth: 25 },
            2: { cellWidth: 25 },
            3: { cellWidth: 40 },
            4: { cellWidth: 25 },
            5: { cellWidth: 35 },
            6: { cellWidth: 25 },
            7: { cellWidth: 25 },
            8: { cellWidth: 25 },
          },
          didDrawPage: function (data) {
            const pageCount = doc.internal.getNumberOfPages();
            doc.setFontSize(10);

            const pageWidth = doc.internal.pageSize.width;
            const footerY = doc.internal.pageSize.height - 10; // Positioning the footer 10 units from the bottom

            // Footer text (centered)
            const footerText = `Page ${data.pageCount}`;
            doc.text(footerText, pageWidth / 2, footerY, { align: 'center' });
          }
        });

        // Save the PDF document
        doc.save('All_Parts_Report.pdf');
      } else {
        alert('No data available to export');
      }

    } catch (error) {
      setLoading(false);
      console.error("Error generating PDF:", error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setLoading(false); // Reset loading state in the end
    }
  };
  // const downloadExcel = () => {
  //   const table = componentRef.current;
  //   const ws = XLSX.utils.table_to_sheet(table);
  //   const wb = XLSX.utils.book_new();
  //   XLSX.utils.book_append_sheet(wb, ws, 'AuditReport');
  //   XLSX.writeFile(wb, 'AuditReport.xlsx');
  // };
  const gridRef = useRef(null);
  const downloadExcel = () => {
    const params = {
      fileName: 'Audit.csv',
    };
    gridRef.current.api.exportDataAsCsv(params);
  };
  const downloadExcel1 = () => {
    const params = {
      fileName: 'FoundedAsset.csv',
    };
    gridRef.current.api.exportDataAsCsv(params);
  };
  const [show, setShow] = useState(false);

  const [selectedOption, setSelectedOption] = useState('All'); // State to manage selected option



  // View Start
  const [view, setview] = useState([]);
  const handleView = async (data) => {
    try {
      const alldata = { ...data, mode: 'AuditwiseReport', fromDate: '', Department: auth.departmentname, branchid: auth.branchid, BranchAccess: auth.BranchAccess }
      console.log(alldata)
      const response = await axios.post(`${API_URL}/InventoryReport`, alldata);
      setview(response.data.send);
      console.log(response.data.send)
    }
    catch (error) {
      console.log(error)
    }
  }
  const ViewRenderer = (params) => {
    // Check if ViewStatus is null (or some other condition you want to apply)
    if (pageData.viewstatus === null || pageData.viewstatus === 'i') {
      return null; // Hide the button by returning null
    }

    // If ViewStatus is not null, render the button
    return (
      <div>
        <button
          className="btn"
          onClick={() => handleView(params.data)}
          data-bs-toggle="modal"
          data-bs-target="#exampleModalView"
        >
          <i className="bi bi-eye-fill fs-5"></i>
        </button>
      </div>
    );
  };

  // View End
  const pagination = true;
  const paginationPageSize = 10;
  const paginationPageSizeSelector = [10, 20, 50];
  const FoundedScanRenderer = (params) => {
    return <span className='badge bg-success'>Founded</span>
  }
  const columndef = [
    { headerCheckboxSelection: true, checkboxSelection: true, width: 50 },
    { headerName: "View",headerClass: 'agheader', field: "View", cellRenderer: ViewRenderer, width: 80 },
    {
      headerName: "Inventory Date",headerClass: 'agheader',
      field: "InventoryDate",
      filter: true,
      floatingFilter: true,
      editable: true,
      valueGetter: (params) => {
        const date = new Date(params.data.InventoryDate);

        // Format the date to 'yyyy-MM-dd HH:mm' (e.g., '2025-02-24 17:44')
        const formattedDate = date.toISOString().slice(0, 16).replace('T', ' ');

        return formattedDate;
      }
    },

    { headerName: "Total Assets",headerClass: 'agheader', field: "TotalAssets", filter: true, floatingFilter: true, editable: true },
    { headerName: "Location Wise Count", headerClass: 'agheader',field: "LocationWiseCount", filter: true, floatingFilter: true, editable: true },
    { headerName: "Founded Count", headerClass: 'agheader',field: "FoundedCount", filter: true, floatingFilter: true, editable: true },
    { headerName: "Not Founded LocationWise", headerClass: 'agheader',field: "NotFoundedLocationWiseCountDifference", filter: true, floatingFilter: true, editable: true },
    { headerName: "Branch", headerClass: 'agheader',field: "BranchName", filter: true, floatingFilter: true, editable: true },
    { headerName: "Physical Location",headerClass: 'agheader', field: "PhysicalLocation", filter: true, floatingFilter: true, editable: true }
  ]
  const columndef1 = [
    { headerCheckboxSelection: true, checkboxSelection: true, width: 50 },
    { headerName: "RFID Number", headerClass: 'agheader',field: "RFIDnumber", filter: true, floatingFilter: true, editable: true },
    { headerName: "Asset ID", headerClass: 'agheader',field: "AssetID", filter: true, floatingFilter: true, editable: true },
    { headerName: "Category", headerClass: 'agheader',field: "Category", filter: true, floatingFilter: true, editable: true },
    { headerName: "Sub Category",headerClass: 'agheader', field: "SubCategory", filter: true, floatingFilter: true, editable: true },
    { headerName: "Department", headerClass: 'agheader',field: "Department", filter: true, floatingFilter: true, editable: true },
    { headerName: "Branch", headerClass: 'agheader',field: "Branch", filter: true, floatingFilter: true, editable: true },
    { headerName: "Physical Location", headerClass: 'agheader',field: "PhysicalLocation", filter: true, floatingFilter: true, editable: true }
  ]
  const [rowdef, setRowdef] = useState([])
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

  const fetchdata = async () => {
    try {
      const alldata = { mode: 'GetAudit', fromDate: '', LocationRFID: '', branchid: auth.branchid, BranchAccess: auth.BranchAccess, Department: auth.departmentname }
      console.log(alldata)
      const response = await axios.post(`${API_URL}/InventoryReport`, alldata);
      setRowdef(response.data.send)
      console.log(response.data.send)
      if (response.status === 200) {
      }
    } catch (err) {
      console.log(err)
    }
  }

  useEffect(() => {

    fetchdata();
    const interval = setInterval(() => {
      fetchdata();
    }, 60000);

    // Clean up interval on component unmount
    return () => clearInterval(interval);

  }, [])

  // Function to handle select change
  const handleSelectChange = (event) => {
    console.log(event.target.value);
    setSelectedOption(event.target.value);
    if (event.target.value === 'Customdate') {
      setShow(true);
    } else {
      setShow(false);
    }
  };

  useEffect(() => {
    // Filter data based on selected option
    const filterData = () => {
      let filteredData = [...rowdef];

      switch (selectedOption) {
        case 'Today': {
          filteredData = rowdef.filter(item => new Date(item.InventoryDate).toDateString() === new Date().toDateString());
          console.log(filteredData)
          break;
        }
        case 'week': {
          const today = new Date();
          // Calculate the start of the week (Sunday)
          const weekStart = new Date(today);
          weekStart.setDate(today.getDate() - today.getDay()); // Set to the previous Sunday
          weekStart.setHours(0, 0, 0, 0); // Normalize to start of the day

          // Calculate the end of the week (Saturday)
          const weekEnd = new Date(today);
          weekEnd.setDate(today.getDate() + (6 - today.getDay())); // Set to the next Saturday
          weekEnd.setHours(23, 59, 59, 999); // Normalize to end of the day

          filteredData = rowdef.filter(item => {
            const itemDate = new Date(item.InventoryDate);
            return itemDate >= weekStart && itemDate <= weekEnd;
          });

          console.log(filteredData)
          break;
        }
        case 'month': {
          const now = new Date();

          // Calculate the start of the month
          const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
          monthStart.setHours(0, 0, 0, 0); // Normalize to start of the day

          // Calculate the end of the month
          const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0); // Last day of the current month
          monthEnd.setHours(23, 59, 59, 999); // Normalize to end of the day

          filteredData = rowdef.filter(item => {
            const itemDate = new Date(item.InventoryDate);
            return itemDate >= monthStart && itemDate <= monthEnd;
          });
          console.log(filteredData)
          break;
        }
        case 'Customdate': {
          if (fromDate && toDate) {
            filteredData = rowdef.filter(item => {
              const itemDate = new Date(item.InventoryDate);
              return itemDate >= new Date(fromDate) && itemDate <= new Date(toDate);
            });
          }
          break;
        }
        default:
          break;
      }

      setFilteredRowDef(filteredData);
    };

    filterData();
  }, [selectedOption, rowdef, fromDate, toDate]);

  return (
    <div className=''>
      {/* Modal for Download Format */}
      <div className="modal fade" id="exampleModal" tabIndex="-1" aria-labelledby="exampleModalLabel" >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h1 className="modal-title fs-5" id="exampleModalLabel">Download Format</h1>
              <button type="button" className="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div className="modal-body">
              <div className="d-flex justify-content-evenly">
                <div className="btn btn-success" onClick={downloadExcel}>
                  <i className="bi bi-file-earmark-spreadsheet fs-1"></i>
                </div>
                <div className="btn btn-danger" onClick={generatePDF}>
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

      <Card className="mx-auto mt-2" id='box-shadow' style={{ maxWidth: "700px" }}>
        <CardHeader className="p-1 pro-header">
          <div className='d-flex justify-content-center mt-1'>
            {/* <BsFiles className=" text-white fs-3 me-2" /> */}
            <h3 className="text-white ">Audit Report</h3>
          </div>
        </CardHeader>

        <CardBody>

          {/* Search Mode */}
          <div className="row mt-3 justify-content-center">
            <div className="col-lg-6 col-md-8 col-sm-10 col-12">
              <label className="fw-semibold">Select Search Mode</label>
              <select
                id="mySelect"
                onChange={handleSelectChange}
                value={selectedOption}
                className="form-select"
              >
                <option value="All">All</option>
                <option value="Today">Today</option>
                <option value="week">Week</option>
                <option value="month">Month</option>
                <option value="Customdate">Custom Date</option>
              </select>
            </div>
          </div>

          {/* Date Pickers */}
          {show && (
            <div className="row mt-3 justify-content-center">
              <div className="col-lg-6 col-md-8 col-sm-10 col-12">
                <label className="fw-semibold">From Date</label>
                <input
                  type="date"
                  className="form-control"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                />
              </div>
            </div>
          )}

          {show && (
            <div className="row mt-3 justify-content-center">
              <div className="col-lg-6 col-md-8 col-sm-10 col-12">
                <label className="fw-semibold">To Date</label>
                <input
                  type="date"
                  className="form-control"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                />
              </div>
            </div>
          )}

        </CardBody>
      </Card>

      <div className='text-end'>
        <CButton className="" variant='outline' color='danger'
           data-bs-toggle="modal" data-bs-target="#exampleModal"
          // onClick={downloadExcel}
          >
          <i className="bi bi-cloud-upload me-1"></i>Export
        </CButton>
      </div>

      <div className='card mt-1'>
        <div className='ag-theme-quartz' style={{ height: "500px" }}>
          <AgGridReact ref={gridRef} rowData={filteredRowDef} columnDefs={columndef} rowSelection={"multiple"} autoGroupColumnDef={autoGroupColumnDef} pagination={pagination} paginationPageSize={paginationPageSize} paginationPageSizeSelector={paginationPageSizeSelector} />
        </div>

      </div>

      {/* <!-- Modal for View Asset --> */}
      <div className="modal fade" id="exampleModalView" aria-labelledby="exampleModalLabel" >
        <div className="modal-dialog modal-xl">
          <div className="modal-content">
            <div className="modal-header">
              <h1 className="modal-title fs-5" id="exampleModalLabel">Founded Asset Information</h1>
              <button type="button" className="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div className="modal-body">
              <div className='text-end mb-2'>
                <button className="btn btn-success "
                  //  data-bs-toggle="modal" data-bs-target="#exampleModal"
                  onClick={downloadExcel1}>
                  <i className="bi bi-cloud-upload me-1"></i>Export
                </button>
              </div>
              <div style={{ height: "500px" }} className='ag-theme-quartz'>
                <AgGridReact ref={gridRef} rowData={view} columnDefs={columndef1} rowSelection={"multiple"} autoGroupColumnDef={autoGroupColumnDef} pagination={pagination} paginationPageSize={paginationPageSize} paginationPageSizeSelector={paginationPageSizeSelector} />
              </div>

            </div>
            {/* <div className="modal-footer">
              <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Close</button>
              <button type="button" className="btn btn-primary">Save changes</button>
            </div> */}
          </div>
        </div>
      </div>

    </div>
  )
}
InventoryReport.propTypes = {
  auth: PropTypes.any.isRequired,
};
export default InventoryReport
