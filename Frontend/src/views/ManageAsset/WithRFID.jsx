import axios from 'axios'
import React, { useState, useEffect, useMemo, useContext, useRef } from 'react'
import Swal from 'sweetalert2';
import { AgGridReact } from 'ag-grid-react';
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { BallTriangle } from 'react-loader-spinner';
import PropTypes from 'prop-types';
import { getConfig } from 'src/config';
import { Card, CardBody, CardHeader, Col, Row } from 'react-bootstrap';
import { CButton } from '@coreui/react';
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import logo from 'src/assets/images/Base64/Apple_base64'; // Can also be base64 string
import autoTable from 'jspdf-autotable';
import { IoEye } from 'react-icons/io5';
import { useLocation } from 'react-router-dom';
import { right } from '@popperjs/core';
import defaultlogo from '../../assets/images/apple-logo.png'; // no curly braces!
import secureLocalStorage from 'react-secure-storage';


const MaptoEmp = ({ auth }) => {
    // Get Asset Details
    const [loading, setLoading] = useState(false); // Loader state
    const [rowCount, setRowCount] = useState(0);
    const API_URL = getConfig().REACT_APP_API_URL;
    const [rowData, setRowData] = useState([]);
    const location = useLocation();
    let pageData = location.state?.pageData;
    if (!pageData) {
        const storedData = secureLocalStorage.getItem('pageData');
        pageData = storedData || {};
    }

    // Table For Unassigned Asset
    const pagination = true;
    const paginationPageSize = 50;
    const paginationPageSizeSelector = [10, 20, 50];

    const StatusRenderer = (params) => {
        return (
            <div>
                <span className='badge bg-success'>With RFID</span>
            </div>
        )
    }


    const [view, setview] = useState([]);
    const handleView = async (id) => {
        try {
            const alldata = { id, mode: 'S', branchid: auth.branchid, BranchAccess: auth.BranchAccess }
            console.log("🚀 ~ handleView ~ alldata:", alldata)
            const response = await axios.post(`${API_URL}/ViewRegister`, alldata);
            setview(response.data.send);
            console.log(response.data.send)
        }
        catch (error) {
            console.log(error)
        }
    }
    const ViewRenderer = (params) => {
        // console.log(pageData.viewstatus)
        // Check if ViewStatus is null (or some other condition you want to apply)
        if (pageData.viewstatus === null || pageData.viewstatus === 'i') {
            return null; // Hide the button by returning null
        }

        // If ViewStatus is not null, render the button
        return (
            <div>
                {/* <button
                            className="btn"
                            onClick={() => handleView(params.data.id)}
                            data-bs-toggle="modal"
                            data-bs-target="#exampleModalView"
                        >
                            <i className="bi bi-eye-fill fs-5"></i>
                        </button> */}
                <button
                    className="border-0  rounded-circle d-flex justify-content-center align-items-center"
                    style={{
                        width: "40px",
                        height: "40px",
                        backdropFilter: "blur(6px)",
                        // background: "rgba(0, 0, 0, 0.33)",
                        border: "1px solid rgba(0, 0, 0, 0.33)",
                        color: "rgba(0, 0, 0, 0.33)",
                        transition: "all 0.3s ease",
                        boxShadow: "0 2px 6px rgba(0, 0, 0, 0.15)",
                    }}
                    onClick={() => handleView(params.data.id)}
                    data-bs-toggle="modal"
                    data-bs-target="#exampleModalView"
                    title="View Details"
                    onMouseEnter={(e) => {
                        // e.currentTarget.style.background = " rgba(0, 0, 0, 0.71)";
                        // e.currentTarget.style.transform = "scale(1.1)";
                        // e.currentTarget.style.boxShadow = "0 0 15pxr rgba(0, 0, 0, 0.71)";
                    }}
                    onMouseLeave={(e) => {
                        // e.currentTarget.style.background = "rgba(13,110,253,0.15)";
                        // e.currentTarget.style.transform = "scale(1)";
                        // e.currentTarget.style.boxShadow = "0 2px 6px rgba(0, 0, 0, 0.72)";
                    }}
                >
                    <IoEye className="fs-5 text-dark" />
                </button>
            </div>
        );
    };

    // client-side date filter: compare the "DD-MM-YYYY HH:MM:SS" cell text
    // against AG Grid's picked date (both reduced to midnight).
    const dateFilterComparator = (filterLocalDateAtMidnight, cellValue) => {
        if (!cellValue || cellValue === '-') return -1;
        const [datePart] = String(cellValue).split(' ');
        const [dd, mm, yyyy] = datePart.split('-').map(Number);
        if (!yyyy) return -1;
        const cell = new Date(yyyy, (mm || 1) - 1, dd || 1);
        const picked = new Date(filterLocalDateAtMidnight.getFullYear(), filterLocalDateAtMidnight.getMonth(), filterLocalDateAtMidnight.getDate());
        return cell < picked ? -1 : cell > picked ? 1 : 0;
    };

    const columndef = useMemo(() => [

        {
            width: 50,
            headerName: "S.No",
            valueGetter: "node.rowIndex + 1",
            width: 80,
            pinned: 'left',
            headerCheckboxSelection: true, checkboxSelection: true,
        },
        { headerName: "View", headerClass: 'agheader', field: "View", cellRenderer: ViewRenderer, pinned: right, width: 90 },
        {
            headerName: "Allocated Status",
            field: "AllocatedStatus",
            width: 180,
            filter: true, floatingFilter: true, editable: true,
            cellRenderer: params => {
                // Determine the status based on the value in params
                const statusText = params.value === 'Allocated' ? 'Allocated' : 'Un-Allocated';
                // Determine the CSS class based on the status
                const statusClass = params.value === 'Allocated' ? 'badge bg-success' : 'badge bg-danger';

                return (
                    <span className={statusClass}>
                        {statusText}
                    </span>
                );
            }
        },
        { headerName: "Status", headerClass: 'agheader', field: "Status", cellRenderer: StatusRenderer },
        { headerName: "RFID Number", headerClass: 'agheader', field: "RFIDnumber", filter: true, floatingFilter: true, editable: true ,
              valueGetter: (params) => {
                const value = params.data?.RFIDnumber;
                return value || "-";
            }
        },
        { headerName: "Asset Type", headerClass: 'agheader', field: "AssetType", filter: true, floatingFilter: true, editable: true ,  valueGetter: (params) => {
                const value = params.data?.AssetType;
                return value || "-";
            }},
        { headerName: "Asset Id", headerClass: 'agheader', field: "AssetID", filter: true, floatingFilter: true, editable: true ,  
            valueGetter: (params) => {
                const value = params.data?.AssetID;
                return value || "-";
            }},
        // { headerName: "Asset Name", field: "AssetName", filter: true, floatingFilter: true,editable:true },
        { headerName: "Description", headerClass: 'agheader', field: "Description", filter: true, floatingFilter: true, editable: true ,valueGetter: (params) => {
                const value = params.data?.Description;
                return value || "-";
            }},
        { headerName: "Category", headerClass: 'agheader', field: "Category", filter: true, floatingFilter: true, editable: true ,valueGetter: (params) => {
                const value = params.data?.Category;
                return value || "-";
            }},
        { headerName: "Sub Category", headerClass: 'agheader', field: "SubCategory", filter: true, floatingFilter: true, editable: true ,valueGetter: (params) => {
                const value = params.data?.SubCategory;
                return value || "-";
            }},
        { headerName: "Department", headerClass: 'agheader', field: "Department", filter: true, floatingFilter: true, editable: true ,valueGetter: (params) => {
                const value = params.data?.Department;
                return value || "-";
            }},
        // { headerName: "Model", field: "Model", filter: true, floatingFilter: true,editable:true },
        // { headerName: "Brand", field: "Brand", filter: true, floatingFilter: true,editable:true },
        // { headerName: "Cost", field: "PCost", filter: true, floatingFilter: true,editable:true },
        // { headerName: "Purshase Date", field: "PDate", filter: true, floatingFilter: true,editable:true },
        // { headerName: "Disposed Date", field: "DisposedDate", filter: true, floatingFilter: true,editable:true },
        // { headerName: "Created Date", field: "CreatedDate", filter: true, floatingFilter: true,editable:true },
        { headerName: 'Location Code', headerClass: 'agheader', field: 'LocationCode', filter: true, floatingFilter: true, editable: true
            ,valueGetter: (params) => {
                const value = params.data?.LocationCode;
                return value || "-";
            }
         },
        { headerName: 'Building', headerClass: 'agheader', field: 'Building', filter: true, floatingFilter: true, editable: true 
            ,valueGetter: (params) => {
                const value = params.data?.Building;
                return value || "-";
            }
        },
        { headerName: 'Floor', headerClass: 'agheader', field: 'Floor', filter: true, floatingFilter: true, editable: true
            ,valueGetter: (params) => {
                const value = params.data?.Floor;
                return value || "-";
            }
         },
        { headerName: 'Room', headerClass: 'agheader', field: 'Room', filter: true, floatingFilter: true, editable: true 
            ,valueGetter: (params) => {
                const value = params.data?.Room;
                return value || "-";
            }
        },
        { headerName: "Vendor", headerClass: 'agheader', field: "VendorName", filter: true, floatingFilter: true, editable: true 
            ,valueGetter: (params) => {
                const value = params.data?.VendorName;
                return value || "-";
            }
        },
        { headerName: "Phone No", headerClass: 'agheader', field: "PhoneNumber", filter: true, floatingFilter: true, editable: true ,valueGetter: (params) => {
                const value = params.data?.PhoneNumber;
                return value || "-";
            }},
        {
            headerName: "Created By", headerClass: 'agheader', filter: true, floatingFilter: true, editable: true, field: "CreatedBy",
            valueGetter: (params) => {
                const value = params.data?.CreatedBy;
                return value || "-";
            }
        },

        {
            headerName: "Created Date", headerClass: 'agheader', filter: 'agDateColumnFilter', floatingFilter: true, editable: true, field: "CreatedDate",
            filterParams: { comparator: dateFilterComparator },
            valueGetter: (params) => {
                const date = params.data?.CreatedDate;
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
                const value = params.data?.UpdatedBy;
                return value || "-";
            }
        },
        {
            headerName: "Last Modified Date", headerClass: 'agheader', filter: 'agDateColumnFilter', floatingFilter: true, editable: true, field: "UpdatedDate",
            filterParams: { comparator: dateFilterComparator },
            valueGetter: (params) => {
                const date = params.data?.UpdatedDate;
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

    ], [pageData])

    const downloadExcel = async () => {
        const columnDefs = [
            { header: "S.No", key: "S.No" },
            { header: "Status", key: "RFID" },
            { header: "Allocated Status", key: "AllocatedStatus" },
            { header: "RFID Number", key: "RFIDnumber" },
            { header: "Asset Type", key: "AssetType" },
            { header: "Asset ID", key: "AssetID" },
            { header: "Description", key: "Description" },
            { header: "Category", key: "Category" },
            { header: "SubCategory", key: "SubCategory" },
            { header: "Department", key: "Department" },
            // { header: "Description", key: "Description" },
            { header: "LocationCode", key: "LocationCode" },
            { header: "Building", key: "Building" },
            { header: "Floor", key: "Floor" },
            { header: "Room", key: "Room" },
            { header: "Vendor Name", key: "VendorName" },
            { header: "Phone Number", key: "PhoneNumber" },
            { header: "Created By", key: "CreatedBy", },
            { header: "Created Date", key: "CreatedDate", },
            { header: "Last Modified By", key: "updatedBy", },
            { header: "Last Modified Date", key: "UpdatedDate", },
            
        ];
        // fetch the full dataset so the export isn't limited to the loaded page
        const rowData = await fetchAllRows();

        // Helper — Format date to DD-MM-YYYY
        const formatDate = (d) => {
            if (!d) return "-";

            const date = new Date(d);
            if (isNaN(date)) return d;

            const year = date.getUTCFullYear();
            const month = String(date.getUTCMonth() + 1).padStart(2, "0");
            const day = String(date.getUTCDate()).padStart(2, "0");

            const hh = String(date.getUTCHours()).padStart(2, "0");
            const mi = String(date.getUTCMinutes()).padStart(2, "0");
            const ss = String(date.getUTCSeconds()).padStart(2, "0");

            return `${day}-${month}-${year} ${hh}:${mi}:${ss}`;
        };
        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet("With RFID Assets");
        // TURN OFF GRIDLINES
        sheet.views = [{ showGridLines: false }];
        const now = new Date();
        const formattedDate = now.toLocaleDateString("en-IN");
        // TITLE
        sheet.mergeCells(1, 1, 1, columnDefs.length);
        const titleCell = sheet.getCell("A1");
        titleCell.value = `WITH RFID ASSETS - ${formattedDate}`;
        titleCell.font = { bold: true, size: 16 };
        titleCell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "D9D9D9" }
        };
        titleCell.border = {
            top: { style: "thin" },
            left: { style: "thin" },
            bottom: { style: "thin" },
            right: { style: "thin" },
        };
        titleCell.alignment = { vertical: "middle", horizontal: "left" };

        // HEADER (ROW 2)
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

        // DATA ROWS
        rowData.forEach((row, index) => {
            const rowValues = columnDefs.map((c) => {
                if (c.header === "S.No") {
                    return index + 1; // Serial Number
                }
                let v = row[c.key];

                if (c.key === "CreatedDate" || c.key === "UpdatedDate") {
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

        // AUTO RESIZE COLUMNS BASED ON CONTENT
        sheet.columns.forEach((column) => {
            let maxLength = 0;
            column.eachCell({ includeEmpty: true }, (cell) => {
                const colValue = cell.value ? cell.value.toString() : "";
                maxLength = Math.max(maxLength, colValue.length);
            });

            // minimum width 10, otherwise add padding
            column.width = maxLength < 10 ? 10 : maxLength + 5;
        });


        const buffer = await workbook.xlsx.writeBuffer();
        saveAs(new Blob([buffer]), "With RFID Assets.xlsx");
    };
    //pdf
    const handlepdf = async (selectedDate) => {
        setLoading(true);
        await new Promise(resolve => setTimeout(resolve, 0));

        const filteredData = await fetchAllRows();

        const doc = new jsPDF({ orientation: "lanscape", format: 'a2' });
        const title = 'With RFID Assets';

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
            'S.No', 'Status', 'Allocated Status', 'RFID Number', 'Asset Type', 'Asset ID', 'Description', 'Category',
            'SubCategory', 'Department', 'LocationCode', 'Building', 'Floor', 'Room', 'Vendor Name', 'Phone Number', 'Created By', 'Created Date', 'Updated By', 'Updated Date',
        ];
        const formatDate = (d) => {
            if (!d) return "-";

            const date = new Date(d);
            if (isNaN(date)) return d;

            const year = date.getUTCFullYear();
            const month = String(date.getUTCMonth() + 1).padStart(2, "0");
            const day = String(date.getUTCDate()).padStart(2, "0");

            const hh = String(date.getUTCHours()).padStart(2, "0");
            const mi = String(date.getUTCMinutes()).padStart(2, "0");
            const ss = String(date.getUTCSeconds()).padStart(2, "0");

            return `${day}-${month}-${year} ${hh}:${mi}:${ss}`;
        };
        // ✅ Match field names from API / grid (case-sensitive!)
        const bodyData = filteredData.map((item, index) => [
            index + 1,
            item.RFID || "",
            item.AllocatedStatus || "",
            item.RFIDnumber || "",
            item.AssetType || "",
            item.AssetID || "",
            item.Description || "",
            item.Category || "",
            item.SubCategory || "",
            item.Department || "",
            item.LocationCode || "",
            item.Building || "",
            item.Floor || "",
            item.Room || "",
            item.VendorName || "",
            item.PhoneNumber || "",
            item.CreatedBy || "-",
            formatDate(item.CreatedDate) || "-",
            item.UpdatedBy || "-",
            formatDate(item.UpdatedDate) || "-",

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

            doc.save("With RFID Assets.pdf");
        } else {
            Swal.fire("No data available to export", "", "warning");
        }
        setLoading(false);
    };
    //end pdf

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

    const gridRef = useRef(null);
    // null = still deciding; false = client-side (small data); true = server paged (large data)
    const [serverSide, setServerSide] = useState(null);
    const CLIENT_SIDE_LIMIT = 20000; // below this, load all rows for instant client-side filtering

    // AG Grid filterModel -> server { colId: { op, v, v2 } } (per-column, ranges for number/date)
    const normalizeFilters = (filterModel) => {
        const out = {};
        Object.entries(filterModel || {}).forEach(([colId, f]) => {
            if (!f) return;
            if (f.filterType === 'date') {
                const v = f.dateFrom ? f.dateFrom.slice(0, 10) : null;
                const v2 = f.dateTo ? f.dateTo.slice(0, 10) : null;
                if (v || v2) out[colId] = { op: f.type, v, v2 };
            } else if (f.filterType === 'number') {
                if (f.filter !== undefined && f.filter !== null && `${f.filter}` !== '')
                    out[colId] = { op: f.type, v: `${f.filter}`, v2: f.filterTo != null ? `${f.filterTo}` : null };
            } else {
                const v = f.filter;
                if (v !== undefined && v !== null && `${v}` !== '') out[colId] = { op: f.type || 'contains', v: `${v}` };
            }
        });
        return out;
    };

    // server-side datasource (used only for large datasets)
    const onGridReady = (params) => {
        const ds = {
            getRows: async (p) => {
                const sort = (p.sortModel && p.sortModel[0]) || {};
                try {
                    const { data } = await axios.post(`${API_URL}/EnrolledAssetInfoPaged`, {
                        departmentname: auth.departmentname, mode: 'WithRFID',
                        branchid: auth.branchid, BranchAccess: auth.BranchAccess,
                        startRow: p.startRow, pageSize: p.endRow - p.startRow,
                        sortCol: sort.colId || 'CreatedDate', sortDir: sort.sort || 'desc',
                        filters: normalizeFilters(p.filterModel),
                    });
                    setRowCount(data.total);
                    p.successCallback(data.rows, data.total);
                } catch (error) {
                    console.error('Error fetching With RFID page:', error);
                    p.failCallback();
                }
            },
        };
        params.api.setGridOption ? params.api.setGridOption('datasource', ds) : params.api.setDatasource(ds);
    };

    // Decide client-side vs server-side by the row count, then load accordingly.
    const initGrid = async () => {
        setLoading(true);
        try {
            const probe = await axios.post(`${API_URL}/EnrolledAssetInfoPaged`, {
                departmentname: auth.departmentname, mode: 'WithRFID',
                branchid: auth.branchid, BranchAccess: auth.BranchAccess,
                startRow: 0, pageSize: 1, filters: {},
            });
            const total = probe.data.total || 0;
            setRowCount(total);
            if (total > CLIENT_SIDE_LIMIT) {
                setServerSide(true); // grid uses the paged datasource (onGridReady)
            } else {
                const { data } = await axios.post(`${API_URL}/EnrolledAssetInfo`, {
                    departmentname: auth.departmentname, mode: 'WithRFID',
                    branchid: auth.branchid, BranchAccess: auth.BranchAccess,
                });
                setRowData(data.send || []);
                setServerSide(false);
            }
        } catch (error) {
            console.error('Error initializing With RFID grid:', error);
            setServerSide(false);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        initGrid();
    }, []);

    // export: use loaded rows client-side; fetch the full set on the server-side path
    const fetchAllRows = async () => {
        if (!serverSide) return rowData;
        const { data } = await axios.post(`${API_URL}/EnrolledAssetInfo`, {
            departmentname: auth.departmentname, mode: 'WithRFID',
            branchid: auth.branchid, BranchAccess: auth.BranchAccess,
        });
        return data.send || [];
    };


    // Download Excel Format



    return (
        <div>


            {loading && (
                <div className="loading-overlay">
                    <div className="loading-spinner">

                        (<BallTriangle
                            height={100}
                            width={100}
                            radius={5}
                            color="#4fa94d"
                            ariaLabel="ball-triangle-loading"
                            wrapperStyle={{}}
                            wrapperClass=""
                            visible={true}
                        />)

                    </div>
                </div>
            )}



            {/* Modal for Download Format */}
            <div className="modal fade" id="exampleModal" tabIndex="-1" aria-labelledby="exampleModalLabel" >
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content">
                        <div className="modal-header p-2 pro-header">
                            <h1 className="modal-title fs-5 text-white" id="exampleModalLabel">Download Format</h1>
                            <button type="button" className="btn-close btn-close-white me-2" data-bs-dismiss="modal"></button>
                        </div>
                        <div className="modal-body">
                            <div className="d-flex justify-content-evenly">
                                <div className="btn btn-success" onClick={downloadExcel} data-bs-dismiss='modal'>
                                    <i className="bi bi-file-earmark-spreadsheet fs-1" ></i>
                                </div>
                                <div className="btn btn-danger" onClick={handlepdf} data-bs-dismiss='modal'>
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

            {/* <!-- Modal for View Asset --> */}
            <div className="modal fade" data-bs-backdrop="false" id="exampleModalView" aria-labelledby="exampleModalLabel" >
                <div className="modal-dialog modal-xl">
                    <div className="modal-content">
                        <div className="modal-header p-2 pro-header">
                            <h1 className="modal-title fs-5 text-white" id="exampleModalLabel">Asset Information</h1>
                            <button
                                className="btn-close fs-6 me-2 btn-close-white border border-danger"
                                style={{ cursor: "pointer" }}
                                data-bs-dismiss="modal"
                            ></button>
                        </div>
                        <div className="modal-body">
                            {
                                view.map((user, index) => {

                                    return <div key={index}>
                                        <Row>
                                            {/* Image Card */}
                                            <Col xl={3} lg={3} className="mb-4">
                                                <div className="card p-3 text-center">
                                                    <h5 className="card-title border-bottom pb-2 ">Asset Image</h5>
                                                    <img
                                                        src={user.Image ? `${API_URL}/${user.Image}` : defaultlogo}
                                                        alt="Asset"
                                                        loading="lazy"
                                                        decoding="async"
                                                        style={{ width: '200px', height: '200px', objectFit: 'cover' }}
                                                        className="rounded-circle border border-dark p-2 mx-auto"
                                                        onError={(e) => {
                                                            e.target.onerror = null;
                                                            e.target.src = defaultlogo;
                                                        }}
                                                    />
                                                </div>
                                            </Col>


                                            {/* Card 1: Basic Asset Info */}
                                            <Col lg={4} xl={4} className="card border me-4 p-3">
                                                <h5 className="mb-3 border-bottom pb-2">Asset Information</h5>
                                                <table className="table table-borderless table-sm mb-0">
                                                    <tbody>
                                                        <tr><td><strong>Asset Package</strong></td><td>{user.PackageName || '-'}</td></tr>
                                                        <tr><td><strong>Asset ID</strong></td><td>{user.AssetID || '-'}</td></tr>
                                                        <tr><td><strong>Brand Name</strong></td><td>{user.Brand || '-'}</td></tr>
                                                        <tr><td><strong>Model</strong></td><td>{user.Model || '-'}</td></tr>
                                                        <tr><td><strong>Category</strong></td><td>{user.Category || '-'}</td></tr>
                                                        <tr><td><strong>Sub Category</strong></td><td>{user.SubCategory || '-'}</td></tr>
                                                        <tr><td><strong>Asset Group</strong></td><td>{user.AssetGroupName || '-'}</td></tr>
                                                        <tr><td><strong>Department</strong></td><td>{user.Department || '-'}</td></tr>
                                                        <tr><td><strong>LocationCode</strong></td><td>{user.LocationCode || '-'}</td></tr>
                                                        <tr><td><strong>Building</strong></td><td>{user.Building || '-'}</td></tr>
                                                        <tr><td><strong>Floor</strong></td><td>{user.Floor || '-'}</td></tr>
                                                        <tr><td><strong>Room</strong></td><td>{user.Room || '-'}</td></tr>
                                                        <tr><td><strong>Asset Type</strong></td><td>{user.AssetType || '-'}</td></tr>
                                                        <tr><td><strong>Maintained By</strong></td><td>{user.MaintainbyName || '-'}</td></tr>

                                                    </tbody>
                                                </table>
                                            </Col>

                                            {/* Card 2: Warranty & Meta Info */}
                                            <Col lg={4} xl={4} className="card border p-3">
                                                <h5 className="mb-3 border-bottom pb-2">Warranty & Metadata</h5>
                                                <table className="table table-borderless table-sm mb-0">
                                                    <tbody>
                                                        <tr><td><strong>Purchase Date</strong></td><td>{user.PDate || '-'}</td></tr>
                                                        <tr><td><strong>Purchase Cost</strong></td><td>{user.PCost || '-'}</td></tr>
                                                        <tr><td><strong>Invoice NO</strong></td><td>{user.InvoiceNumber || '-'}</td></tr>
                                                        <tr><td><strong>Vendor</strong></td><td>{user.VendorName || '-'}</td></tr>
                                                        <tr><td><strong>Phone NO</strong></td><td>{user.PhoneNumber || '-'}</td></tr>
                                                        <tr><td><strong>Warranty Type</strong></td><td>{user.WType || '-'}</td></tr>
                                                        <tr><td><strong>Warranty Period</strong></td><td>{user.WPeriod || '-'}</td></tr>
                                                        <tr><td><strong>Warranty End Date</strong></td><td>{user.WEndDate || '-'}</td></tr>
                                                        <tr><td><strong>Created By</strong></td><td>{user.CreatedBy || '-'}</td></tr>
                                                        <tr><td><strong>Created Date</strong></td><td>{user.CreatedDate || '-'}</td></tr>
                                                        <tr><td><strong>Depreciation Type</strong></td><td>{user.DepreciationType || '-'}</td></tr>
                                                        <tr><td><strong>Depreciation Mode</strong></td><td>{user.DepreciationMode || '-'}</td></tr>
                                                        <tr><td><strong>Depreciation Value</strong></td><td>{user.DepreciationValue || '-'}</td></tr>
                                                        <tr><td><strong>Description</strong></td><td>{user.Description || '-'}</td></tr>
                                                    </tbody>
                                                </table>
                                            </Col>
                                        </Row>


                                    </div>
                                })
                            }




                        </div>
                        {/* <div className="modal-footer">
                                            <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                                            <button type="button" className="btn btn-primary">Save changes</button>
                                        </div> */}
                    </div>
                </div>
            </div>


            <Card className='mt-4'>
                <div className="card-header pro-header p-1">
                    <div className="d-flex justify-content-center align-items-center">
                        {/* Center Title */}
                        <div className="text-center" >
                            <h3 className='text-white'> <i class="bi bi-wifi-2 fs-2 ms-2" ></i> With RFID Assets</h3>
                        </div>
                    </div>
                </div>

                <CardBody>
                    <Col>
                        <div className='text-end mt-1'>
                            <CButton type="submit" color="danger" variant="outline" className='me-2 btn-hover-effect'
                                data-bs-toggle="modal" data-bs-target="#exampleModal"
                            // onClick={onExportClick}
                            >
                                <i className="bi bi-cloud-upload me-1"></i>Export
                            </CButton>
                        </div>
                    </Col>
                    <div style={{ height: "500px" }} className='ag-theme-quartz mt-2'>
                        {serverSide !== null && (
                            <AgGridReact ref={gridRef} columnDefs={columndef} rowSelection={"multiple"}
                                {...(serverSide
                                    ? { rowModelType: 'infinite', cacheBlockSize: paginationPageSize, onGridReady }
                                    : { rowData })}
                                autoGroupColumnDef={autoGroupColumnDef} pagination={pagination} paginationPageSize={paginationPageSize} paginationPageSizeSelector={paginationPageSizeSelector}
                                rowBuffer={20} suppressColumnVirtualisation={true}
                            />
                        )}
                    </div>
                </CardBody>
            </Card>
        </div>
    )
}

MaptoEmp.propTypes = {
    auth: PropTypes.any.isRequired,
};

export default MaptoEmp
