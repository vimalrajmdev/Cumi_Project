import React, { useRef, useState, useMemo, useEffect } from 'react'
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import "ag-grid-community/styles/ag-theme-quartz.css";
import axios from 'axios';
import { useLocation } from 'react-router-dom';
import PropTypes from 'prop-types';
import { Typeahead } from 'react-bootstrap-typeahead';
import { getConfig } from 'src/config';
import { CCol, CLink, CRow, CWidgetStatsF } from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilBalanceScale, cilBan, cilBellExclamation, cilCheckAlt, cilCheckCircle, cilMap, cilStorage, cilTextDirectionLtr, cilWarning, cilXCircle } from '@coreui/icons';
import { FaBarsProgress } from 'react-icons/fa6';
import { Card, CardBody, CardHeader } from 'react-bootstrap';
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import logo from 'src/assets/images/Base64/Apple_base64'; // Can also be base64 string
import autoTable from 'jspdf-autotable';
import Swal from 'sweetalert2'
import DatePicker from 'react-multi-date-picker';
import InputIcon from 'react-multi-date-picker/components/input_icon';
import { BallTriangle } from 'react-loader-spinner';
import secureLocalStorage from 'react-secure-storage';

const AuditConsolidateReport = ({ auth }) => {
    const API_URL = getConfig().REACT_APP_API_URL;
    const location = useLocation();
    let pageData = location.state?.pageData;
    const [loading, setLoading] = useState(false);
    if (!pageData) {
        // Fallback to local storage if available
        const storedData = secureLocalStorage.getItem('pageData');
        pageData = storedData || {};
    }
    const [selectedAudit, setSelectedAudit] = useState(null);
    const [AuditType, setAuditType] = useState(null);
    const [TotalAsset, setTotalAsset] = useState(0);
    const [Founded, setFounded] = useState(0);
    const [notFounded, setnotFounded] = useState(0);
    const [LocationwiseCount, setLocationwiseCount] = useState(0);
    const [Completed, setCompleted] = useState(0);
    const [PartiallyCompleted, setPartiallyCompleted] = useState(0);
    const [Pending, setPending] = useState(0);
    const [Mismatch, setMismatch] = useState(0);
    // console.log("pageData", pageData);


    const gridRef = useRef(null);
    const gridRef1 = useRef(null);

    const downloadExcelColumnWise = async (gridRef, sheetName, fileName, summaryData = null) => {
        // ✅ Get column definitions dynamically from the grid
        const columnState = gridRef.current.api.getColumnDefs();

        // Filter out checkbox/action columns
        const exportColumns = columnState.filter(col =>
            col.field && col.field !== 'View' && col.headerName !== 'S.No'
        );

        // Get row data
        const rowData = [];
        gridRef.current.api.forEachNode((node) => rowData.push(node.data));

        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet(sheetName);
        sheet.views = [{ showGridLines: false }];

        const now = new Date();
        const formattedDate = now.toLocaleDateString("en-IN");
        const totalCols = exportColumns.length + 1; // +1 for S.No

        // ⭐ TITLE ROW
        sheet.mergeCells(1, 1, 1, totalCols);
        const titleCell = sheet.getCell("A1");
        titleCell.value = `${sheetName} - ${formattedDate}`;
        titleCell.font = { bold: true, size: 16 };
        titleCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "D9D9D9" } };
        titleCell.border = { top: { style: "thin" }, left: { style: "thin" }, bottom: { style: "thin" }, right: { style: "thin" } };
        titleCell.alignment = { vertical: "middle", horizontal: "left" };

        // ⭐ SUMMARY SECTION (Row 3 & 4) - optional
        if (summaryData) {
            const summaryHeaders = Object.keys(summaryData);
            const summaryValues = Object.values(summaryData);

            const summaryHeaderRow = sheet.getRow(3);
            summaryHeaders.forEach((text, index) => {
                const cell = summaryHeaderRow.getCell(index + 1);
                cell.value = text;
                cell.font = { bold: true };
                cell.alignment = { horizontal: "center", vertical: "middle" };
                cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "BDD7EE" } };
                cell.border = { top: { style: "thin" }, left: { style: "thin" }, bottom: { style: "thin" }, right: { style: "thin" } };
            });
            summaryHeaderRow.commit();

            const summaryValueRow = sheet.getRow(4);
            summaryValues.forEach((value, index) => {
                const cell = summaryValueRow.getCell(index + 1);
                cell.value = value ?? '0';
                cell.alignment = { horizontal: "center", vertical: "middle" };
                cell.border = { top: { style: "thin" }, left: { style: "thin" }, bottom: { style: "thin" }, right: { style: "thin" } };
            });
            summaryValueRow.commit();
        }

        sheet.addRow([]); // Empty row

        // ⭐ TABLE HEADER ROW (Row 6)
        const headerRow = sheet.getRow(6);

        // S.No column
        const snoCell = headerRow.getCell(1);
        snoCell.value = "S.No";
        snoCell.font = { bold: true };
        snoCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "D9D9D9" } };
        snoCell.alignment = { horizontal: "center", vertical: "center" };
        snoCell.border = { top: { style: "thin" }, left: { style: "thin" }, bottom: { style: "thin" }, right: { style: "thin" } };

        // Dynamic columns from grid
        exportColumns.forEach((col, i) => {
            const cell = headerRow.getCell(i + 2); // +2 because col 1 is S.No
            cell.value = col.headerName;
            cell.font = { bold: true };
            cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "D9D9D9" } };
            cell.alignment = { horizontal: "center", vertical: "center" };
            cell.border = { top: { style: "thin" }, left: { style: "thin" }, bottom: { style: "thin" }, right: { style: "thin" } };
        });
        headerRow.commit();

        // ⭐ DATA ROWS
        rowData.forEach((row, index) => {
            const dataRow = sheet.addRow([
                index + 1, // S.No
                ...exportColumns.map(col => {
                    const value = row[col.field];

                    // ✅ Force string type for RFIDId column
                    if (col.field === 'RFIDId') {
                        const cellValue = value ?? '-';
                        return { text: String(cellValue), type: 'string' };
                    }

                    // Apply valueFormatter if exists (for "-" fallback)
                    if (col.valueFormatter) {
                        return col.valueFormatter({ value }) ?? "-";
                    }
                    return value ?? "-";
                })
            ]);

            dataRow.eachCell((cell) => {
                // ✅ Apply string numFmt to RFIDId cells to prevent scientific notation
                if (cell.value && typeof cell.value === 'object' && cell.value.type === 'string') {
                    cell.value = cell.value.text;
                    cell.numFmt = '@';  // @ means "Text" format in Excel
                }
                cell.alignment = { horizontal: "center", vertical: "center" };
                cell.border = {
                    top: { style: "thin" }, left: { style: "thin" },
                    bottom: { style: "thin" }, right: { style: "thin" }
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

        const buffer = await workbook.xlsx.writeBuffer();
        saveAs(new Blob([buffer]), `${fileName}.xlsx`);
    };

    // For Main Grid (gridRef)
    const handleMainGridDownload = () => {
        const isSpecialMode1 = Register?.mode === 'AlldataWith_Bulk' && AuditType === 'Detailed';
        const isSpecialMode2 = Register?.mode === 'FloorWiseDetailed' && AuditType === 'Detailed';
        const isSummaryMode =
            (Register?.mode === 'AlldataWith_Bulk' && AuditType === 'Summary') ||
            (Register?.mode === 'BulkAudit_Summary' && AuditType === 'Summary') ||
            (Register?.mode === 'FloorWiseOverAllSummary' && AuditType === 'Summary');

        // Build summaryData to mirror visible cards only
        const summaryData = {};

        // Always visible
        summaryData["Total"] = TotalAsset || 0;
        summaryData["Found"] = Founded || 0;
        summaryData["Not Found"] = notFounded || 0;

        if (isSpecialMode1) {
            // Hide: Mismatched, Total Location, Completed, Partially Completed, Pending
            // Show:  Total, Found, Not Found  ← already added above
        } else if (isSpecialMode2) {
            // Hide: Total Location, Completed, Partially Completed, Pending
            // Show: Mismatched
            summaryData["Mismatched"] = Mismatch || 0;
        } else if (isSummaryMode) {
            // Hide: Mismatched
            // Show: Total Location, Completed, Partially Completed, Pending

            summaryData[Register.mode === 'FloorWiseSummary' || AuditType === 'FloorWiseDetailed' || Register.mode === 'FloorWiseOverAllSummary' ? "Total Floor" : "Total Location"] = LocationwiseCount || 0;
            summaryData["Completed"] = Completed || 0;
            summaryData["Partially Completed"] = PartiallyCompleted || 0;
            summaryData["Pending"] = Pending || 0;
        } else {
            // Default: show everything
            summaryData[Register.mode === 'FloorWiseSummary' || AuditType === 'FloorWiseDetailed' || Register.mode === 'FloorWiseOverAllSummary' ? "Total Floor" : "Total Location"] = LocationwiseCount || 0;
            summaryData["Completed"] = Completed || 0;
            summaryData["Partially Completed"] = PartiallyCompleted || 0;
            summaryData["Pending"] = Pending || 0;
            summaryData["Mismatched"] = Mismatch || 0;
        }

        const modeConfig = {
            'AlldataWith_Bulk': { sheet: "Bulk Audit Detailed", file: "Bulk_Audit_Detailed" },
            'BulkAudit_Summary': { sheet: "Bulk Audit Summary", file: "Bulk_Audit_Summary" },
            'FloorWiseSummary': { sheet: "Floor Wise Summary", file: "FloorWise_Summary" },
            'FloorWiseDetailed': { sheet: "Floor Wise Detailed", file: "FloorWise_Detailed" },
            'FloorWiseOverAllSummary': { sheet: "Floor Overall Summary", file: "Floor_Overall_Summary" },
            'LocationWiseSummary': { sheet: "Location Wise Summary", file: "LocationWise_Summary" },
        };

        const config = modeConfig[Register.mode] || { sheet: "Audit Report", file: "Audit_Report" };
        downloadExcelColumnWise(gridRef, config.sheet, config.file, summaryData);
    };

    // For View Modal Grid (gridRef1) — no summary needed
    const handleViewGridDownload = () => {
        downloadExcelColumnWise(gridRef1, "Audit Detail View", "Audit_Detail_View");
    };

    const handleMainPdf = async () => {
        setLoading(true);
        await new Promise(resolve => setTimeout(resolve, 0));

        const filteredData = gridRef.current.api.getModel().rowsToDisplay.map(rowNode => rowNode.data);

        // ── Same mode flags as Excel & card filter ──────────────────────────
        const isSpecialMode1 = Register?.mode === 'AlldataWith_Bulk' && AuditType === 'Detailed';
        const isSpecialMode2 = Register?.mode === 'FloorWiseDetailed' && AuditType === 'Detailed';
        const isSummaryMode =
            (Register?.mode === 'AlldataWith_Bulk' && AuditType === 'Summary') ||
            (Register?.mode === 'BulkAudit_Summary' && AuditType === 'Summary') ||
            (Register?.mode === 'FloorWiseOverAllSummary' && AuditType === 'Summary');

        const isFloorLabel =
            Register?.mode === 'FloorWiseSummary' ||
            Register?.mode === 'FloorWiseDetailed' ||
            Register?.mode === 'FloorWiseOverAllSummary';

        // ── Build visible cards (mirrors .filter() logic) ───────────────────
        const cards = [];

        // Always visible
        cards.push({ label: 'Total Asset', value: TotalAsset, color: [235, 240, 255] });
        cards.push({ label: 'Found', value: Founded, color: [230, 255, 240] });
        cards.push({ label: 'Not Found', value: notFounded, color: [255, 235, 235] });

        if (isSpecialMode1) {
            // Only Total, Found, Not Found — nothing extra

        } else if (isSpecialMode2) {
            // Add Mismatched only
            cards.push({ label: 'Mismatched', value: Mismatch, color: [255, 235, 235] });

        } else if (isSummaryMode) {
            // No Mismatched; add location/status cards
            cards.push({ label: isFloorLabel ? 'Total Floor' : 'Total Location', value: LocationwiseCount, color: [235, 240, 255] });
            cards.push({ label: 'Completed', value: Completed, color: [230, 255, 240] });
            cards.push({ label: 'Partially Completed', value: PartiallyCompleted, color: [255, 243, 205] });
            cards.push({ label: 'Pending', value: Pending, color: [255, 235, 235] });

        } else {
            // Default: all cards
            cards.push({ label: isFloorLabel ? 'Total Floor' : 'Total Location', value: LocationwiseCount, color: [235, 240, 255] });
            cards.push({ label: 'Completed', value: Completed, color: [230, 255, 240] });
            cards.push({ label: 'Partially Completed', value: PartiallyCompleted, color: [255, 243, 205] });
            cards.push({ label: 'Pending', value: Pending, color: [255, 235, 235] });
            cards.push({ label: 'Mismatched', value: Mismatch, color: [255, 235, 235] });
        }

        // ── Title & date ────────────────────────────────────────────────────
        const modeTitle = {
            'AlldataWith_Bulk': 'Bulk Audit Detailed Report',
            'BulkAudit_Summary': 'Bulk Audit Summary Report',
            'FloorWiseSummary': 'Floor Wise Summary Report',
            'FloorWiseDetailed': 'Floor Wise Detailed Report',
            'FloorWiseOverAllSummary': 'Floor Overall Summary Report',
            'LocationWiseSummary': 'Location Wise Summary Report',
        };
        const title = modeTitle[Register?.mode] || 'Audit Report';

        let reportDate;
        try {
            // const rawDate = selectedDate?.$d || selectedDate;
            const parsedDate = new Date();
            if (isNaN(parsedDate)) throw new Error();
            reportDate = parsedDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
        } catch {
            reportDate = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
        }

        // ── Dynamic card layout ─────────────────────────────────────────────
        const cardHeight = 18;
        const cardWidth = 62;
        const gap = 8;
        const maxPerRow = 4;
        const cardsRow1 = cards.slice(0, maxPerRow);
        const cardsRow2 = cards.slice(maxPerRow);          // empty if ≤4 cards
        const row1Y = 32;
        const row2Y = row1Y + cardHeight + 6;

        // startY for table: below however many rows of cards exist
        const tableStartY = cardsRow2.length > 0
            ? row2Y + cardHeight + 10
            : row1Y + cardHeight + 10;

        // ── Grid columns from current mode ──────────────────────────────────
        const columnState = gridRef.current.api.getColumnDefs();
        const exportColumns = columnState.filter(col =>
            col.field && col.field !== 'View' && col.headerName !== 'S.No'
        );
        const headers = ['S.No', ...exportColumns.map(col => col.headerName)];

        const formatDate = (d) => {
            if (!d) return "-";
            const date = new Date(d);
            if (isNaN(date)) return String(d);
            const year = date.getUTCFullYear();
            const month = String(date.getUTCMonth() + 1).padStart(2, "0");
            const day = String(date.getUTCDate()).padStart(2, "0");
            const hh = String(date.getUTCHours()).padStart(2, "0");
            const mi = String(date.getUTCMinutes()).padStart(2, "0");
            const ss = String(date.getUTCSeconds()).padStart(2, "0");
            return `${day}-${month}-${year} ${hh}:${mi}:${ss}`;
        };

        const bodyData = filteredData.map((row, index) => [
            index + 1,
            ...exportColumns.map(col => {
                const value = row[col.field];
                if (col.valueFormatter) return col.valueFormatter({ value }) ?? "-";
                if (value instanceof Date || (typeof value === 'string' && value.includes('T'))) {
                    return formatDate(value);
                }
                return value ?? "-";
            })
        ]);

        const doc = new jsPDF({ orientation: "landscape", format: 'a3' });

        // ── Draw cards helper ───────────────────────────────────────────────
        const drawCardRow = (cardList, rowY, pageWidth) => {
            const rowWidth = cardList.length * cardWidth + (cardList.length - 1) * gap;
            const startX = (pageWidth - rowWidth) / 2;
            cardList.forEach((card, i) => {
                const x = startX + i * (cardWidth + gap);
                doc.setFillColor(...card.color);
                doc.roundedRect(x, rowY, cardWidth, cardHeight, 3, 3, "F");
                doc.setFontSize(9);
                doc.setFont("times", "normal");
                doc.text(card.label, x + cardWidth / 2, rowY + 7, { align: "center" });
                doc.setFontSize(13);
                doc.text(String(card.value ?? 0), x + cardWidth / 2, rowY + 16, { align: "center" });
            });
        };

        if (bodyData.length > 0) {
            autoTable(doc, {
                head: [headers],
                body: bodyData,
                startY: tableStartY,
                margin: { top: tableStartY, right: 15, left: 10, bottom: 20 },
                styles: {
                    halign: "center", valign: "middle",
                    fontSize: 10, font: "times", cellPadding: 3,
                    textColor: [0, 0, 0], lineColor: [0, 0, 0], lineWidth: 0.2,
                },
                headStyles: {
                    fillColor: [0, 0, 0], textColor: [255, 255, 255],
                    fontSize: 11, halign: 'center', fontStyle: 'bold',
                },
                didDrawPage: () => {
                    const pageWidth = doc.internal.pageSize.width;
                    const pageHeight = doc.internal.pageSize.height;

                    // Logo
                    doc.addImage(logo, 'PNG', 10, 5, 30, 12);

                    // Title
                    doc.setFontSize(20);
                    doc.setFont("times", "bold");
                    doc.text(`${title} - ${reportDate}`, pageWidth / 2, 22, { align: 'center' });

                    // Cards — row 1 always, row 2 only if exists
                    drawCardRow(cardsRow1, row1Y, pageWidth);
                    if (cardsRow2.length > 0) {
                        drawCardRow(cardsRow2, row2Y, pageWidth);
                    }

                    // Page number
                    doc.setFontSize(8);
                    doc.setFont("times", "normal");
                    doc.text(
                        `Page ${doc.internal.getCurrentPageInfo().pageNumber}`,
                        pageWidth - 10, 10, { align: "right" }
                    );

                    // Footer
                    doc.text(
                        `Printed By: ${auth.employeename} | Printed On: ${new Date().toLocaleDateString()} | Time: ${new Date().toLocaleTimeString()}`,
                        pageWidth / 2, pageHeight - 15, { align: 'center' }
                    );
                    doc.text(
                        `Note: This document has been generated electronically and is valid without signature.`,
                        pageWidth / 2, pageHeight - 8, { align: 'center' }
                    );
                }
            });

            const modeFile = {
                'AlldataWith_Bulk': 'Bulk_Audit_Detailed_Report',
                'BulkAudit_Summary': 'Bulk_Audit_Summary_Report',
                'FloorWiseSummary': 'FloorWise_Summary_Report',
                'FloorWiseDetailed': 'FloorWise_Detailed_Report',
                'FloorWiseOverAllSummary': 'Floor_Overall_Summary_Report',
                'LocationWiseSummary': 'LocationWise_Summary_Report',
            };
            doc.save(`${modeFile[Register?.mode] || 'Audit_Report'}.pdf`);
        } else {
            Swal.fire("No data available to export", "", "warning");
        }

        setLoading(false);
    };

    const [Register, setRegister] = useState({
        mode: '', LocationRFID: '', Floor: '', FromDate: '', ToDate: ''
    })

    const [Viewmode, setviewmode] = useState(null);

    // View Start
    const [view, setview] = useState([]);
    const handleView = async (data) => {
        let mode = '';
        let LocationRFID = '';
        if (Register.mode === 'AlldataWith_Bulk' || Register.mode === 'BulkAudit_Summary') {
            mode = 'BulkLocationwise';
            LocationRFID = data.LocationRFID;
            setviewmode('BulkLocationwise');
        } else if (Register.mode === 'LocationWiseSummary') {
            mode = 'LocationWise';
            LocationRFID = data.LocationRFID;
            setviewmode('LocationWise');

        } else if (Register.mode === 'FloorWiseOverAllSummary') {
            mode = 'Floorwise';
            LocationRFID = data.Floor;
            setviewmode('Floorwise');

        } else {
            mode = 'FloorWiseSingleDetailed';
            LocationRFID = data.Floor;
            setviewmode('FloorWiseSingleDetailed');
        }

        try {
            const alldata = { ...data, FromDate: Register.FromDate, ToDate: Register.ToDate, mode: mode, Department: auth.departmentname, branchid: auth.branchid, LocationRFID: LocationRFID }
            console.log("🚀 ~ handleView ~ alldata:", alldata)
            const response = await axios.post(`${API_URL}/InventoryReport_New`, alldata)
            setview(response.data.send);
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
    const paginationPageSize = 1000;
    const paginationPageSizeSelector = [100, 500, 1000];

    const columnforBulkwise = [
        {
            headerName: "S.No",
            valueGetter: "node.rowIndex + 1",
            width: 90,
            pinned: 'left', headerCheckboxSelection: true, checkboxSelection: true,
        },
        {
            headerName: "Status", headerClass: 'agheader',
            field: "status",
            width: 190,
            filter: true, floatingFilter: true,
            cellRenderer: params => {
                // Determine the status based on the value in params
                const statusText = params.value === 'Found' ? 'Founded' : params.value === 'Not Found' ? 'Not Founded ' : params.value === 'Mismatched' ? 'Mismatched' : '';
                // Determine the CSS class based on the status
                const statusClass = params.value === 'Found' ? 'badge bg-success' : params.value === 'Not Found' ? 'badge bg-danger' : params.value === 'Mismatched' ? 'badge bg-warning' : '';

                return (
                    <span className={statusClass}>
                        {statusText}
                    </span>
                );
            }
        },
        {
            headerName: "RFID No", headerClass: 'agheader', field: "RFIDId", filter: true, floatingFilter: true, width: 250,
            valueFormatter: (params) => params.value ? params.value : "-"
        },
        {
            headerName: "Asset ID", headerClass: 'agheader', field: "AssetID", filter: true, floatingFilter: true, width: 250,
            valueFormatter: (params) => params.value ? params.value : "-"
        },
        {
            headerName: "Asset Name", headerClass: 'agheader', field: "AssetName", filter: true, floatingFilter: true, width: 250,
            valueFormatter: (params) => params.value ? params.value : "-"
        },
        {
            headerName: "Asset Group", headerClass: 'agheader', field: "AssetGroupName", filter: true, floatingFilter: true, width: 250,
            valueFormatter: (params) => params.value ? params.value : "-"
        },
        {
            headerName: "Category", headerClass: 'agheader', field: "Category", filter: true, floatingFilter: true, width: 250,
            valueFormatter: (params) => params.value ? params.value : "-"
        },
        {
            headerName: "Sub Category", headerClass: 'agheader', field: "SubCategory", filter: true, floatingFilter: true, width: 250,
            valueFormatter: (params) => params.value ? params.value : "-"
        },
        {
            headerName: "Department", headerClass: 'agheader', field: "Department", filter: true, floatingFilter: true, width: 250,
            valueFormatter: (params) => params.value ? params.value : "-"
        },
        {
            headerName: "Location RFID", headerClass: 'agheader', field: "AssetLocation", filter: true, floatingFilter: true, width: 200,
            valueFormatter: (params) => params.value ? params.value : "-"
        },
        {
            headerName: 'Location Code', headerClass: 'agheader', field: 'LocationCode', filter: true, floatingFilter: true, width: 250,
            valueFormatter: (params) => params.value ? params.value : "-"
        }
    ];

    const columnforBulkwiseWithLocation = [

        {
            headerName: "S.No",
            valueGetter: "node.rowIndex + 1",
            width: 90,
            pinned: 'left', headerCheckboxSelection: true, checkboxSelection: true,
        },
        {
            headerName: "status",
            field: "status",
            width: 190,
            filter: true, floatingFilter: true,
            cellRenderer: params => {
                // Determine the status based on the value in params
                const statusText = params.value === 'Pending' ? 'Pending' : params.value === 'Partially Completed' ? 'Partially Completed ' : 'Completed';
                // Determine the CSS class based on the status
                const statusClass = params.value === 'Pending' ? 'badge bg-danger' : params.value === 'Partially Completed' ? 'badge bg-warning' : params.value === 'Completed' ? 'badge bg-success' : "";

                return (
                    <span className={statusClass}>
                        {statusText}
                    </span>
                );
            }
        },
        { headerName: "View", field: "View", cellRenderer: ViewRenderer, width: 80 },

        { headerName: "Location Code", field: "LocationCode", filter: true, floatingFilter: true, editable: true },
        { headerName: "Total Asset", field: "AssetCount", filter: true, floatingFilter: true, editable: true },
        { headerName: "Founded", field: "FoundedCount", filter: true, floatingFilter: true, editable: true },
        { headerName: "Not Founded", field: "NotFounded", filter: true, floatingFilter: true, editable: true },
        // { headerName: "MisMatch", field: "MismatchCount", filter: true, floatingFilter: true, editable: true },
    ];

    const columnforRoomwise = [
        {
            headerName: "S.No",
            valueGetter: "node.rowIndex + 1",
            width: 90,
            pinned: 'left', headerCheckboxSelection: true, checkboxSelection: true,
        },
        {
            headerName: "status",
            field: "status",
            width: 190,
            filter: true, floatingFilter: true,
            cellRenderer: params => {
                // Determine the status based on the value in params
                const statusText = params.value === 'Not Found' ? 'Not Found' : params.value === 'Found' ? 'Found ' : 'Mismatched';
                // Determine the CSS class based on the status
                const statusClass = params.value === 'Not Found' ? 'badge bg-danger' : params.value === 'Found' ? 'badge bg-success' : params.value === 'Mismatched' ? 'badge bg-warning' : "";

                return (
                    <span className={statusClass}>
                        {statusText}
                    </span>
                );
            }
        },
        { headerName: "Asset ID", field: "AssetID", filter: true, floatingFilter: true, editable: true },
        { headerName: "RFID Number", field: "RFIDId", filter: true, floatingFilter: true, editable: true },
        { headerName: "Category", field: "Category", filter: true, floatingFilter: true, editable: true },
        { headerName: "Sub Category", field: "SubCategory", filter: true, floatingFilter: true, editable: true },
        { headerName: "Department", field: "Department", filter: true, floatingFilter: true, editable: true },
        { headerName: "Building", field: "Building", filter: true, floatingFilter: true, editable: true },
        { headerName: "Floor", field: "Floor", filter: true, floatingFilter: true, editable: true },
        { headerName: "Room", field: "Room", filter: true, floatingFilter: true, editable: true }
    ];

    const columnforFloorwise = [

        {
            headerName: "S.No",
            valueGetter: "node.rowIndex + 1",
            width: 90,
            pinned: 'left', headerCheckboxSelection: true, checkboxSelection: true,
        },
        {
            headerName: "status",
            field: "status",
            width: 190,
            filter: true, floatingFilter: true,
            cellRenderer: params => {
                // Determine the status based on the value in params
                const statusText = params.value === 'Pending' ? 'Pending' : params.value === 'Partially Completed' ? 'Partially Completed ' : 'Completed';
                // Determine the CSS class based on the status
                const statusClass = params.value === 'Pending' ? 'badge bg-danger' : params.value === 'Partially Completed' ? 'badge bg-warning' : params.value === 'Completed' ? 'badge bg-success' : "";

                return (
                    <span className={statusClass}>
                        {statusText}
                    </span>
                );
            }
        },
        { headerName: "View", field: "View", cellRenderer: ViewRenderer, width: 80 },

        { headerName: "Floor", field: "Floor", filter: true, floatingFilter: true, editable: true },
        { headerName: "Total Asset", field: "AssetCount", filter: true, floatingFilter: true, editable: true },
        { headerName: "Founded", field: "FoundedCount", filter: true, floatingFilter: true, editable: true },
        { headerName: "Not Founded", field: "NotFounded", filter: true, floatingFilter: true, editable: true },
        { headerName: "MisMatch", field: "MismatchCount", filter: true, floatingFilter: true, editable: true },
    ];

    const columnforFloorDetailed = [
        {
            headerName: "S.No",
            valueGetter: "node.rowIndex + 1",
            width: 90,
            pinned: 'left', headerCheckboxSelection: true, checkboxSelection: true,
        },
        {
            headerName: "Status", headerClass: 'agheader',
            field: "status",
            width: 190,
            filter: true, floatingFilter: true,
            cellRenderer: params => {
                // Determine the status based on the value in params
                const statusText = params.value === 'Found' ? 'Founded' : params.value === 'Not Found' ? 'Not Founded ' : params.value === 'Mismatched' ? 'Mismatched' : '';
                // Determine the CSS class based on the status
                const statusClass = params.value === 'Found' ? 'badge bg-success' : params.value === 'Not Found' ? 'badge bg-danger' : params.value === 'Mismatched' ? 'badge bg-warning' : '';

                return (
                    <span className={statusClass}>
                        {statusText}
                    </span>
                );
            }
        },
        {
            headerName: "RFID No", headerClass: 'agheader', field: "RFIDId", filter: true, floatingFilter: true, width: 250,
            valueFormatter: (params) => params.value ? params.value : "-"
        },
        {
            headerName: "Asset ID", headerClass: 'agheader', field: "AssetID", filter: true, floatingFilter: true, width: 250,
            valueFormatter: (params) => params.value ? params.value : "-"
        },
        {
            headerName: "Asset Name", headerClass: 'agheader', field: "AssetName", filter: true, floatingFilter: true, width: 250,
            valueFormatter: (params) => params.value ? params.value : "-"
        },
        {
            headerName: "Asset Group", headerClass: 'agheader', field: "AssetGroupName", filter: true, floatingFilter: true, width: 250,
            valueFormatter: (params) => params.value ? params.value : "-"
        },
        {
            headerName: "Category", headerClass: 'agheader', field: "Category", filter: true, floatingFilter: true, width: 250,
            valueFormatter: (params) => params.value ? params.value : "-"
        },
        {
            headerName: "Sub Category", headerClass: 'agheader', field: "SubCategory", filter: true, floatingFilter: true, width: 250,
            valueFormatter: (params) => params.value ? params.value : "-"
        },
        {
            headerName: "Department", headerClass: 'agheader', field: "Department", filter: true, floatingFilter: true, width: 250,
            valueFormatter: (params) => params.value ? params.value : "-"
        },
        {
            headerName: "Location RFID", headerClass: 'agheader', field: "LocationRFID", filter: true, floatingFilter: true, width: 200,
            valueFormatter: (params) => params.value ? params.value : "-"
        },
        {
            headerName: 'Location Code', headerClass: 'agheader', field: 'LocationCode', filter: true, floatingFilter: true, width: 250,
            valueFormatter: (params) => params.value ? params.value : "-"
        },
        {
            headerName: "Floor", headerClass: 'agheader', field: "AssetOGFloor", filter: true, floatingFilter: true, width: 250,
            valueFormatter: (params) => params.value ? params.value : "-"
        },
        { headerName: 'Founded Floor', headerClass: 'agheader', field: 'MobileFoundFloor', filter: true, floatingFilter: true, width: 250, valueFormatter: (params) => params.value ? params.value : "-" }
    ];

    const columnforLocationWise = [

        {
            headerName: "S.No",
            valueGetter: "node.rowIndex + 1",
            width: 90,
            pinned: 'left', headerCheckboxSelection: true, checkboxSelection: true,
        },
        {
            headerName: "status",
            field: "status",
            width: 190,
            filter: true, floatingFilter: true,
            cellRenderer: params => {
                // Determine the status based on the value in params
                const statusText = params.value === 'Pending' ? 'Pending' : params.value === 'Partially Completed' ? 'Partially Completed ' : 'Completed';
                // Determine the CSS class based on the status
                const statusClass = params.value === 'Pending' ? 'badge bg-danger' : params.value === 'Partially Completed' ? 'badge bg-warning' : params.value === 'Completed' ? 'badge bg-success' : "";

                return (
                    <span className={statusClass}>
                        {statusText}
                    </span>
                );
            }
        },
        { headerName: "View", field: "View", cellRenderer: ViewRenderer, width: 80 },

        { headerName: "Location Code", field: "LocationCode", filter: true, floatingFilter: true, editable: true },
        { headerName: "Total Asset", field: "AssetCount", filter: true, floatingFilter: true, editable: true },
        { headerName: "Founded", field: "FoundedCount", filter: true, floatingFilter: true, editable: true },
        { headerName: "Not Founded", field: "NotFounded", filter: true, floatingFilter: true, editable: true },
        { headerName: "MisMatch", field: "MismatchCount", filter: true, floatingFilter: true, editable: true },
    ];

    const columnForLocation = [
        {
            headerName: "S.No",
            valueGetter: "node.rowIndex + 1",
            width: 90,
            pinned: 'left', headerCheckboxSelection: true, checkboxSelection: true,
        },
        {
            headerName: "Status",
            field: "status", headerClass: 'agheader',
            width: 190,
            filter: true, floatingFilter: true,
            cellRenderer: params => {
                // Determine the status based on the value in params
                const statusText = params.value === 'Found' ? 'Founded' : params.value === 'Not Found' ? 'Not Founded ' : params.value === 'Mismatched' ? 'Mismatched' : '';
                // Determine the CSS class based on the status
                const statusClass = params.value === 'Found' ? 'badge bg-success' : params.value === 'Not Found' ? 'badge bg-danger' : params.value === 'Mismatched' ? 'badge bg-warning' : '';

                return (
                    <span className={statusClass}>
                        {statusText}
                    </span>
                );
            }
        },
        {
            headerName: "RFID No", headerClass: 'agheader', field: "RFIDId", filter: true, floatingFilter: true, editable: true, width: 250,
            valueFormatter: (params) => params.value ? params.value : "-"
        },
        {
            headerName: "Asset ID", headerClass: 'agheader', field: "AssetID", filter: true, floatingFilter: true, width: 250,
            valueFormatter: (params) => params.value ? params.value : "-"
        },
        {
            headerName: "Asset Name", headerClass: 'agheader', field: "AssetName", filter: true, floatingFilter: true, width: 250,
            valueFormatter: (params) => params.value ? params.value : "-"
        },
        {
            headerName: "Asset Group", headerClass: 'agheader', field: "AssetGroupName", filter: true, floatingFilter: true, width: 250,
            valueFormatter: (params) => params.value ? params.value : "-"
        },
        {
            headerName: "Category", headerClass: 'agheader', field: "Category", filter: true, floatingFilter: true, width: 250,
            valueFormatter: (params) => params.value ? params.value : "-"
        },
        {
            headerName: "Sub Category", headerClass: 'agheader', field: "SubCategory", filter: true, floatingFilter: true, width: 250,
            valueFormatter: (params) => params.value ? params.value : "-"
        },
        {
            headerName: "Department", headerClass: 'agheader', field: "Department", filter: true, floatingFilter: true, width: 250,
            valueFormatter: (params) => params.value ? params.value : "-"
        },
        {
            headerName: "OG Location RFID", headerClass: 'agheader', field: "AssetLocation", filter: true, floatingFilter: true, width: 200,
            valueFormatter: (params) => params.value ? params.value : "-"
        },
        {
            headerName: 'OG Location Code', headerClass: 'agheader', field: 'LocationCode', filter: true, floatingFilter: true, width: 250,
            valueFormatter: (params) => params.value ? params.value : "-"
        },
        {
            headerName: "Founded Location RFID", headerClass: 'agheader', field: "MobileLocation", filter: true, floatingFilter: true, width: 250,
            valueFormatter: (params) => params.value ? params.value : "-"
        },
        { headerName: 'Founded Location Code', headerClass: 'agheader', field: 'MobileFoundedLocationCode', filter: true, floatingFilter: true, width: 250, valueFormatter: (params) => params.value ? params.value : "-" }
    ];

    const columnforFloorwiseOverAllSummary = [

        {
            headerName: "S.No",
            valueGetter: "node.rowIndex + 1",
            width: 90,
            pinned: 'left', headerCheckboxSelection: true, checkboxSelection: true,
        },
        {
            headerName: "status",
            field: "status",
            width: 190,
            filter: true, floatingFilter: true,
            cellRenderer: params => {
                // Determine the status based on the value in params
                const statusText = params.value === 'Pending' ? 'Pending' : params.value === 'Partially Completed' ? 'Partially Completed ' : 'Completed';
                // Determine the CSS class based on the status
                const statusClass = params.value === 'Pending' ? 'badge bg-danger' : params.value === 'Partially Completed' ? 'badge bg-warning' : params.value === 'Completed' ? 'badge bg-success' : "";

                return (
                    <span className={statusClass}>
                        {statusText}
                    </span>
                );
            }
        },
        { headerName: "View", field: "View", cellRenderer: ViewRenderer, width: 80 },

        { headerName: "Floor", field: "Floor", filter: true, floatingFilter: true, editable: true },
        { headerName: "Total Asset", field: "AssetCount", filter: true, floatingFilter: true, editable: true },
        { headerName: "Founded", field: "FoundedCount", filter: true, floatingFilter: true, editable: true },
        { headerName: "Not Founded", field: "NotFounded", filter: true, floatingFilter: true, editable: true },

    ];

    const columnforSingleFloorwise = [
        {
            headerName: "S.No",
            valueGetter: "node.rowIndex + 1",
            width: 90,
            pinned: 'left', headerCheckboxSelection: true, checkboxSelection: true,
        },
        {
            headerName: "Status", headerClass: 'agheader',
            field: "status",
            width: 190,
            filter: true, floatingFilter: true,
            cellRenderer: params => {
                // Determine the status based on the value in params
                const statusText = params.value === 'Found' ? 'Founded' : params.value === 'Not Found' ? 'Not Founded ' : params.value === 'Mismatched' ? 'Mismatched' : '';
                // Determine the CSS class based on the status
                const statusClass = params.value === 'Found' ? 'badge bg-success' : params.value === 'Not Found' ? 'badge bg-danger' : params.value === 'Mismatched' ? 'badge bg-warning' : '';

                return (
                    <span className={statusClass}>
                        {statusText}
                    </span>
                );
            }
        },
        {
            headerName: "RFID No", headerClass: 'agheader', field: "RFIDId", filter: true, floatingFilter: true, width: 250,
            valueFormatter: (params) => params.value ? params.value : "-"
        },
        {
            headerName: "Asset ID", headerClass: 'agheader', field: "AssetID", filter: true, floatingFilter: true, width: 250,
            valueFormatter: (params) => params.value ? params.value : "-"
        },
        {
            headerName: "Asset Name", headerClass: 'agheader', field: "AssetName", filter: true, floatingFilter: true, width: 250,
            valueFormatter: (params) => params.value ? params.value : "-"
        },
        {
            headerName: "Asset Group", headerClass: 'agheader', field: "AssetGroupName", filter: true, floatingFilter: true, width: 250,
            valueFormatter: (params) => params.value ? params.value : "-"
        },
        {
            headerName: "Category", headerClass: 'agheader', field: "Category", filter: true, floatingFilter: true, width: 250,
            valueFormatter: (params) => params.value ? params.value : "-"
        },
        {
            headerName: "Sub Category", headerClass: 'agheader', field: "SubCategory", filter: true, floatingFilter: true, width: 250,
            valueFormatter: (params) => params.value ? params.value : "-"
        },
        {
            headerName: "Department", headerClass: 'agheader', field: "Department", filter: true, floatingFilter: true, width: 250,
            valueFormatter: (params) => params.value ? params.value : "-"
        },
        {
            headerName: "Location RFID", headerClass: 'agheader', field: "LocationRFID", filter: true, floatingFilter: true, width: 200,
            valueFormatter: (params) => params.value ? params.value : "-"
        },
        {
            headerName: 'Location Code', headerClass: 'agheader', field: 'LocationCode', filter: true, floatingFilter: true, width: 250,
            valueFormatter: (params) => params.value ? params.value : "-"
        },
        {
            headerName: "Floor", headerClass: 'agheader', field: "AssetOGFloor", filter: true, floatingFilter: true, width: 250,
            valueFormatter: (params) => params.value ? params.value : "-"
        },
        { headerName: 'Founded Floor', headerClass: 'agheader', field: 'MobileFoundFloor', filter: true, floatingFilter: true, width: 250, valueFormatter: (params) => params.value ? params.value : "-" }
    ];


    // const columnforAssetIQSummary = [

    //     {
    //         headerName: "S.No",
    //         valueGetter: "node.rowIndex + 1",
    //         width: 90,
    //         pinned: 'left', headerCheckboxSelection: true, checkboxSelection: true,
    //     },
    //     {
    //         headerName: "status",
    //         field: "status",
    //         width: 190,
    //         filter: true, floatingFilter: true,
    //         cellRenderer: params => {
    //             // Determine the status based on the value in params
    //             const statusText = params.value === 'Pending' ? 'Pending' : params.value === 'Partially Completed' ? 'Partially Completed ' : 'Completed';
    //             // Determine the CSS class based on the status
    //             const statusClass = params.value === 'Pending' ? 'badge bg-danger' : params.value === 'Partially Completed' ? 'badge bg-warning' : params.value === 'Completed' ? 'badge bg-success' : "";

    //             return (
    //                 <span className={statusClass}>
    //                     {statusText}
    //                 </span>
    //             );
    //         }
    //     },
    //     { headerName: "View", field: "View", cellRenderer: ViewRenderer, width: 80 },

    //     { headerName: "Floor", field: "Floor", filter: true, floatingFilter: true, editable: true },
    //     { headerName: "Total Asset", field: "AssetCount", filter: true, floatingFilter: true, editable: true },
    //     { headerName: "Founded", field: "FoundedCount", filter: true, floatingFilter: true, editable: true },
    //     { headerName: "Not Founded", field: "NotFounded", filter: true, floatingFilter: true, editable: true },
    //     { headerName: "Found in Other Location", field: "FoundInOtherLocation", filter: true, floatingFilter: true, editable: true },
    //     { headerName: "Actual NotFound", field: "ActualNotFound", filter: true, floatingFilter: true, editable: true },
    // ];

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
            const alldata = { ...Register, branchid: auth.branchid, BranchAccess: auth.BranchAccess, Department: auth.departmentname };
            const response = await axios.post(`${API_URL}/InventoryReport_New`, alldata);
            if (response.status === 200) {
                const data = response.data.send;
                if (Register.mode === 'AlldataWith_Bulk' && AuditType === 'Detailed') {
                    const statusCounts = {
                        TotalAsset: 0,
                        Founded: 0,
                        NotFounded: 0
                    };

                    // Calculate totals from data
                    data.forEach(item => {
                        statusCounts.TotalAsset = data.length; // Assuming each item represents one asset
                        if (item.status === 'Found') {
                            statusCounts.Founded++;
                        } else if (item.status === 'Not Found') {
                            statusCounts.NotFounded++;
                        }
                    });

                    // Calculate LocationWiseCount as sum of locations
                    // Set state with counts
                    setRowdef(data);
                    setTotalAsset(statusCounts.TotalAsset);
                    setFounded(statusCounts.Founded);
                    setnotFounded(statusCounts.NotFounded);

                } else if (Register.mode === 'BulkAudit_Summary' && AuditType === 'Summary') {
                    console.log('data', data);
                    const statusCounts = {
                        TotalAsset: 0,
                        Founded: 0,
                        NotFounded: 0,
                        LocationWiseCount: 0,
                        Completed: 0,
                        PartiallyCompleted: 0,
                        Pending: 0,
                        Mismatched: 0
                    };

                    // Calculate totals from data
                    data.forEach(item => {
                        statusCounts.TotalAsset += item.AssetCount || 0;
                        statusCounts.Founded += item.FoundedCount || 0;
                        statusCounts.NotFounded += item.NotFounded || 0;
                        statusCounts.Mismatched += item.MismatchCount || 0;
                        if (item.status === 'Pending') {
                            statusCounts.Pending++;
                        } else if (item.status === 'Completed') {
                            statusCounts.Completed++;
                        } else if (item.status === 'Partially Completed') {
                            statusCounts.PartiallyCompleted++;
                        }
                    });

                    // Calculate LocationWiseCount as sum of locations
                    statusCounts.LocationWiseCount = statusCounts.Completed + statusCounts.Pending + statusCounts.PartiallyCompleted;

                    // Set state with counts
                    setRowdef(data);
                    setTotalAsset(statusCounts.TotalAsset);
                    setFounded(statusCounts.Founded);
                    setnotFounded(statusCounts.NotFounded);
                    setLocationwiseCount(statusCounts.LocationWiseCount);
                    setCompleted(statusCounts.Completed);
                    setPartiallyCompleted(statusCounts.PartiallyCompleted);
                    setPending(statusCounts.Pending);
                    setMismatch(statusCounts.Mismatched);

                } else if (Register.mode === 'FloorWiseSummary' && AuditType === 'Summary') {
                    const statusCounts = {
                        TotalAsset: 0,
                        Founded: 0,
                        NotFounded: 0,
                        LocationWiseCount: 0,
                        Completed: 0,
                        PartiallyCompleted: 0,
                        Pending: 0,
                        Mismatched: 0

                    };

                    // Calculate totals from data
                    data.forEach(item => {
                        statusCounts.TotalAsset += item.AssetCount || 0;
                        statusCounts.Founded += item.FoundedCount || 0;
                        statusCounts.NotFounded += item.NotFounded || 0;
                        statusCounts.Mismatched += item.MismatchCount || 0;
                        if (item.status === 'Pending') {
                            statusCounts.Pending++;
                        } else if (item.status === 'Completed') {
                            statusCounts.Completed++;
                        } else if (item.status === 'Partially Completed') {
                            statusCounts.PartiallyCompleted++;
                        }
                    });

                    // Calculate LocationWiseCount as sum of locations
                    statusCounts.LocationWiseCount = statusCounts.Completed + statusCounts.Pending + statusCounts.PartiallyCompleted;

                    // Set state with counts
                    setRowdef(data);
                    setTotalAsset(statusCounts.TotalAsset);
                    setFounded(statusCounts.Founded);
                    setnotFounded(statusCounts.NotFounded);
                    setLocationwiseCount(statusCounts.LocationWiseCount);
                    setCompleted(statusCounts.Completed);
                    setPartiallyCompleted(statusCounts.PartiallyCompleted);
                    setPending(statusCounts.Pending);
                    setMismatch(statusCounts.Mismatched);

                } else if (Register.mode === 'FloorWiseDetailed' && AuditType === 'Detailed') {
                    const statusCounts = {
                        TotalAsset: 0,
                        Founded: 0,
                        NotFounded: 0,
                        Mismatched: 0
                    };

                    // Calculate totals from data
                    data.forEach(item => {
                        statusCounts.TotalAsset = data.length; // Assuming each item represents one asset
                        if (item.status === 'Found') {
                            statusCounts.Founded++;
                        } else if (item.status === 'Not Found') {
                            statusCounts.NotFounded++;
                        }
                        else if (item.status === 'Mismatched') {
                            statusCounts.Mismatched++;
                        }
                    });

                    // Calculate LocationWiseCount as sum of locations
                    // Set state with counts
                    setRowdef(data);
                    setTotalAsset(statusCounts.TotalAsset);
                    setFounded(statusCounts.Founded);
                    setnotFounded(statusCounts.NotFounded);
                    setMismatch(statusCounts.Mismatched);
                } else if (Register.mode === 'FloorWiseOverAllSummary' && AuditType === 'Summary') {
                    const statusCounts = {
                        TotalAsset: 0,
                        Founded: 0,
                        NotFounded: 0,
                        LocationWiseCount: 0,
                        Completed: 0,
                        PartiallyCompleted: 0,
                        Pending: 0,
                        Mismatched: 0

                    };

                    // Calculate totals from data
                    data.forEach(item => {
                        statusCounts.TotalAsset += item.AssetCount || 0;
                        statusCounts.Founded += item.FoundedCount || 0;
                        statusCounts.NotFounded += item.NotFounded || 0;
                        statusCounts.Mismatched += item.MismatchCount || 0;
                        if (item.status === 'Pending') {
                            statusCounts.Pending++;
                        } else if (item.status === 'Completed') {
                            statusCounts.Completed++;
                        } else if (item.status === 'Partially Completed') {
                            statusCounts.PartiallyCompleted++;
                        }
                    });

                    // Calculate LocationWiseCount as sum of locations
                    statusCounts.LocationWiseCount = statusCounts.Completed + statusCounts.Pending + statusCounts.PartiallyCompleted;

                    // Set state with counts
                    setRowdef(data);
                    setTotalAsset(statusCounts.TotalAsset);
                    setFounded(statusCounts.Founded);
                    setnotFounded(statusCounts.NotFounded);
                    setLocationwiseCount(statusCounts.LocationWiseCount);
                    setCompleted(statusCounts.Completed);
                    setPartiallyCompleted(statusCounts.PartiallyCompleted);
                    setPending(statusCounts.Pending);
                    setMismatch(statusCounts.Mismatched);

                } else if (Register.mode === 'LocationWiseSummary') {
                    console.log('data', data);
                    const statusCounts = {
                        TotalAsset: 0,
                        Founded: 0,
                        NotFounded: 0,
                        LocationWiseCount: 0,
                        Completed: 0,
                        PartiallyCompleted: 0,
                        Pending: 0,
                        Mismatched: 0
                    };

                    // Calculate totals from data
                    data.forEach(item => {
                        statusCounts.TotalAsset += item.AssetCount || 0;
                        statusCounts.Founded += item.FoundedCount || 0;
                        statusCounts.NotFounded += item.NotFounded || 0;
                        statusCounts.Mismatched += item.MismatchCount || 0;
                        if (item.status === 'Pending') {
                            statusCounts.Pending++;
                        } else if (item.status === 'Completed') {
                            statusCounts.Completed++;
                        } else if (item.status === 'Partially Completed') {
                            statusCounts.PartiallyCompleted++;
                        }
                    });

                    // Calculate LocationWiseCount as sum of locations
                    statusCounts.LocationWiseCount = statusCounts.Completed + statusCounts.Pending + statusCounts.PartiallyCompleted;

                    // Set state with counts
                    setRowdef(data);
                    setTotalAsset(statusCounts.TotalAsset);
                    setFounded(statusCounts.Founded);
                    setnotFounded(statusCounts.NotFounded);
                    setLocationwiseCount(statusCounts.LocationWiseCount);
                    setCompleted(statusCounts.Completed);
                    setPartiallyCompleted(statusCounts.PartiallyCompleted);
                    setPending(statusCounts.Pending);
                    setMismatch(statusCounts.Mismatched);


                } else {
                    swal({
                        title: 'No data Founded',
                        icon: 'info'
                    }).then(() => {
                        setRowdef([])
                    })
                    return;
                }
            }
        } catch (err) {
            console.log(err);
        }
    };

    const Dropdowndata = [{ label: 'Bulk wise', value: 'AlldataWith_Bulk' }, { label: 'Floor wise', value: 'FloorWiseSummary' }, { label: 'Location Wise Summary', value: 'LocationWiseSummary', }, { label: 'FloorWise OverAll', value: 'FloorWiseOverAllSummary', }
    ];

    const [Schedulerdata, setSchedulerdata] = useState([]);

    const getReminderList = async () => {
        try {
            const data = { AuditCode: "", AuditType: "", Fromdate: "", Todate: "", Status: "", Mode: 'S', branchid: auth.branchid, BranchAccess: auth.BranchAccess, Createdby: auth.empid, Updatedby: '', Id: '' }
            const response = await axios.post(`${API_URL}/SchedulerSettingAPI`, data);
            if (response.status === 200) {
                setSchedulerdata(response.data);
            }
        } catch (error) {
            console.error('Error fetching user details:', error);
        }
    };

    const [FloorDropDownData, SetFloorDropDownData] = useState([]);

    const FetchFloorDropdown = async () => {
        try {
            const response = await axios.post(`${API_URL}/FloorMaster`, { mode: 'S', branchid: auth.branchid, BranchAccess: auth.BranchAccess });
            if (response.status === 200) {
                SetFloorDropDownData(response.data);
            }
        } catch (err) {
            console.log(err);
        }
    };

    const handleAuditSelect = (selected) => {
        if (selected && selected.length > 0) {
            const audit = selected[0];
            setSelectedAudit(audit);

            setRegister((prev) => ({
                ...prev,
                FromDate: audit.FromDate ? audit.FromDate.split('T')[0] : null, // Store as YYYY-MM-DD string
                ToDate: audit.ToDate ? audit.ToDate.split('T')[0] : null,
            }));

        } else {
            setSelectedAudit(null);
            setRegister((prev) => ({
                ...prev,
                FromDate: null,
                ToDate: null,
            }));
        }
    };

    useEffect(() => {
        FetchFloorDropdown();
        getReminderList();
    }, []);

    return (
        <div className=''>
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
                        <div className="modal-header">
                            <h1 className="modal-title fs-5" id="exampleModalLabel">Download Format</h1>
                            <button type="button" className="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div className="modal-body">
                            <div className="d-flex justify-content-evenly">
                                <div className="btn btn-success" onClick={handleMainGridDownload}>
                                    <i className="bi bi-file-earmark-spreadsheet fs-1"></i>
                                </div>

                                <div className="btn btn-danger" onClick={() => handleMainPdf()}>
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

            <div className="modal fade" id="exampleModal1" tabIndex="-1" aria-labelledby="exampleModalLabel" >
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h1 className="modal-title fs-5" id="exampleModalLabel">Download Format</h1>
                            <button type="button" className="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div className="modal-body">
                            <div className="d-flex justify-content-evenly">
                                <div className="btn btn-success" onClick={handleViewGridDownload}>
                                    <i className="bi bi-file-earmark-spreadsheet fs-1"></i>
                                </div>

                                {/* <div className="btn btn-danger" onClick={handleLocationWisepdf}>
                                    <i className="bi bi-filetype-pdf fs-1"></i>
                                </div> */}

                            </div>
                            <div className="d-flex justify-content-evenly mt-2">
                                <span className="text-muted">Download Excel Format</span>
                                <span className="text-muted">Download PDF Format</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <Card>
                <CardHeader className='pro-header p-1'>
                    <h3 className='text-white text-center'>Audit Consolidate Report</h3>
                </CardHeader>
                <CardBody>
                    <div className="row mt-3">
                        {/* LEFT SIDE */}
                        <div className="col-lg-10 gap-2">
                            <div className='row'>
                                <div className="col-xl-3 col-lg-6 col-md-4 col-sm-6 col-6 mb-3">
                                    <Typeahead
                                        id="branch-typeahead"
                                        options={Dropdowndata}

                                        placeholder="Select Audit Type"
                                        onChange={(selected) => {
                                            if (selected.length > 0) {
                                                const selectedValue = selected[0].value;
                                                setRegister({
                                                    ...Register,
                                                    mode: selected[0].value
                                                });
                                                setRowdef([]);
                                                setTotalAsset(0);
                                                setFounded(0);
                                                setnotFounded(0);
                                                setLocationwiseCount(0);
                                                setCompleted(0);
                                                setPartiallyCompleted(0);
                                                setPending(0);
                                                setMismatch(0);
                                                if (selectedValue === 'AlldataWith_Bulk' || selectedValue === 'FloorWiseDetailed') {
                                                    setAuditType('Detailed');
                                                } else {
                                                    setAuditType('Summary');
                                                }

                                            } else {
                                                setRegister({
                                                    ...Register,
                                                    mode: ''
                                                });
                                                setRowdef([]);
                                                setTotalAsset(0);
                                                setFounded(0);
                                                setnotFounded(0);
                                                setLocationwiseCount(0);
                                                setCompleted(0);
                                                setPartiallyCompleted(0);
                                                setPending(0);
                                                setMismatch(0);
                                            }
                                        }}
                                        required
                                    />
                                </div>
                                <div className="col-xl-3 col-lg-6 col-md-4 col-sm-6 col-6 mb-3">
                                    <select
                                        className="form-select"
                                        value={AuditType}
                                        disabled={Register.mode === 'LocationWiseSummary' || Register.mode === 'FloorWiseOverAllSummary' }
                                        onChange={(e) => {
                                            const selectedValue = e.target.value;

                                            setAuditType(e.target.value)
                                            if (Register.mode === 'AlldataWith_Bulk' && selectedValue === 'Summary') {
                                                setRegister({
                                                    ...Register,
                                                    mode: 'BulkAudit_Summary'
                                                })
                                            } else if (Register.mode === 'FloorWiseSummary' && selectedValue === 'Detailed') {
                                                setRegister({
                                                    ...Register,
                                                    mode: 'FloorWiseDetailed'
                                                })
                                            } else if (Register.mode === 'FloorWiseDetailed' && selectedValue === 'Summary') {
                                                setRegister({
                                                    ...Register,
                                                    mode: 'FloorWiseSummary'
                                                })
                                            }
                                        }}
                                    >
                                        <option>Select Audit View</option>
                                        <option value="Detailed">Detailed</option>
                                        <option value="Summary">Summary</option>
                                    </select>
                                </div>

                                {Register.mode === 'FloorWiseSummary' && AuditType === 'Detailed' && (
                                    <div className="col-xl-3 col-lg-6 col-md-4 col-sm-6 col-6 mb-3">
                                        <Typeahead
                                            id="floor-typeahead"
                                            labelKey="Floor"
                                            options={FloorDropDownData}
                                            placeholder="Select Floor..."
                                            onChange={(selected) => {
                                                if (selected.length > 0) {
                                                    setRegister({
                                                        ...Register,
                                                        LocationRFID: selected[0].FloorId,
                                                        Floor: selected[0].Floor,
                                                    });
                                                } else {
                                                    setRegister({
                                                        ...Register,
                                                        LocationRFID: '',
                                                        Floor: '',
                                                    });
                                                }
                                            }}
                                            selected={
                                                Register.Floor
                                                    ? FloorDropDownData.filter(item => item.Floor === Register.Floor)
                                                    : []
                                            }
                                            required
                                        />
                                    </div>
                                )}

                                <div className="col-xl-3 col-lg-6 col-md-4 col-sm-6 col-6 mb-3">
                                    <Typeahead
                                        id="audit-typeahead"
                                        labelKey="AuditType"
                                        options={Schedulerdata}
                                        placeholder="Select Audit..."
                                        onChange={handleAuditSelect}
                                        required
                                    />
                                </div>

                                {selectedAudit && (
                                    <>
                                        {/* From Date */}
                                        <div className="col-xl-3 col-lg-6 col-md-4 col-sm-6 col-6 mb-3">
                                            <DatePicker
                                                render={<InputIcon className="form-control" placeholder="From Date" />}
                                                onChange={(date) => {
                                                    const formattedDate = date.format('YYYY-MM-DD');
                                                    setRegister({ ...Register, FromDate: formattedDate });
                                                }}
                                                value={Register.FromDate ? new Date(Register.FromDate) : null}
                                                minDate={selectedAudit.FromDate ? new Date(selectedAudit.FromDate) : null}
                                                maxDate={selectedAudit.ToDate ? new Date(selectedAudit.ToDate) : null}
                                            />
                                        </div>

                                        {/* To Date */}
                                        <div className="col-xl-3 col-lg-6 col-md-4 col-sm-6 col-6 mb-3">
                                            <DatePicker
                                                render={<InputIcon className="form-control" placeholder="To Date" />}
                                                onChange={(date) => {
                                                    const formattedDate = date.format('YYYY-MM-DD');
                                                    setRegister({ ...Register, ToDate: formattedDate });
                                                }}
                                                value={Register.ToDate ? new Date(Register.ToDate) : null}
                                                minDate={selectedAudit.FromDate ? new Date(selectedAudit.FromDate) : null}
                                                maxDate={selectedAudit.ToDate ? new Date(selectedAudit.ToDate) : null}
                                            />
                                        </div>
                                    </>
                                )}

                                <button className="btn btn-primary col-lg-2 col-md-2 col-sm-6 col-6 mb-3" onClick={fetchdata}>
                                    Search
                                </button>
                            </div>
                        </div>

                        {/* RIGHT SIDE */}
                        <div className="text-end col-lg-2  mb-3">
                            <button className="btn btn-success" data-bs-toggle="modal" data-bs-target="#exampleModal">
                                <i className="bi bi-cloud-upload me-1"></i>
                                Export
                            </button>
                        </div>
                    </div>
                </CardBody>
            </Card>

            <CRow className="g-3">

                {/* ✅ COMMON HOVER STYLE */}
                {[
                    {
                        title: "Register Asset",
                        value: TotalAsset,
                        percent: "100%",
                        icon: <CIcon icon={cilStorage} height={22} />,
                        bg: "linear-gradient(135deg, #e3f2fd, #bbdefb)"
                    },

                    {
                        title: "Founded",
                        value: Founded,
                        percent: TotalAsset ? ((Founded / TotalAsset) * 100).toFixed(1) + "%" : "0%",
                        icon: <CIcon icon={cilCheckCircle} height={22} />,
                        bg: "linear-gradient(135deg, #e8f5e9, #c8e6c9)"
                    },

                    {
                        title: "Not Founded",
                        value: notFounded,
                        percent: TotalAsset ? ((notFounded / TotalAsset) * 100).toFixed(1) + "%" : "0%",
                        icon: <CIcon icon={cilXCircle} height={22} />,
                        bg: "linear-gradient(135deg, #fdecea, #f5c6cb)"
                    },
                    {
                        title: "Mismatched",
                        value: Mismatch,
                        percent: TotalAsset ? ((Mismatch / TotalAsset) * 100).toFixed(1) + "%" : "0%",
                        icon: <CIcon icon={cilBan} height={22} />,
                        bg: "linear-gradient(135deg, #cac6c6, #c2ceda)"
                    },

                    {
                        title: Register.mode === 'FloorWiseSummary' || AuditType === 'FloorWiseDetailed' || Register.mode === 'FloorWiseOverAllSummary' ? "Total Floor" : "Total Location",
                        value: LocationwiseCount,
                        percent: "",
                        icon: <CIcon icon={cilMap} height={22} />,
                        bg: "linear-gradient(135deg, #e0f7fa, #b2ebf2)"
                    },

                    {
                        title: "Completed",
                        value: Completed,
                        percent: LocationwiseCount ? ((Completed / LocationwiseCount) * 100).toFixed(1) + "%" : "0%",
                        icon: <CIcon icon={cilCheckAlt} height={22} />,
                        bg: "linear-gradient(135deg, #d4edda, #a8e0b8)"
                    },

                    {
                        title: "Partially Completed",
                        value: PartiallyCompleted,
                        percent: LocationwiseCount ? ((PartiallyCompleted / LocationwiseCount) * 100).toFixed(1) + "%" : "0%",
                        icon: <FaBarsProgress className="fs-4" />,
                        bg: "linear-gradient(135deg, #fff3cd, #ffe69c)"
                    },

                    {
                        title: "Pending",
                        value: Pending,
                        percent: LocationwiseCount ? ((Pending / LocationwiseCount) * 100).toFixed(1) + "%" : "0%",
                        icon: <CIcon icon={cilWarning} height={22} />,
                        bg: "linear-gradient(135deg, #f8d7da, #f1aeb5)"
                    }

                ]
                    .filter(card => {
                        const isSpecialMode1 = Register?.mode === 'AlldataWith_Bulk' && AuditType === 'Detailed';
                        const isSpecialMode2 = Register?.mode === 'FloorWiseDetailed' && AuditType === 'Detailed';
                        const isSummarymode = Register?.mode === 'AlldataWith_Bulk' && AuditType === 'Detailed' || Register?.mode === 'BulkAudit_Summary' && AuditType === 'Summary' || Register?.mode === 'FloorWiseOverAllSummary' && AuditType === 'Summary';


                        if (isSpecialMode1) {
                            // Hide these cards in special mode
                            return !['Mismatched', 'Total Location', 'Completed', 'Partially Completed', 'Pending'].includes(card.title);
                        } else if (isSpecialMode2) {
                            // Hide these cards in special mode
                            return !['Total Location', 'Completed', 'Partially Completed', 'Pending'].includes(card.title);
                        } else if (isSummarymode) {
                            return !['Mismatched'].includes(card.title);
                        }
                        return true; // Show all cards in normal mode
                    })
                    .map((card, index) => (
                        <CCol key={index} lg={4} xl={3} md={6} sm={12} xs={12}>
                            <Card
                                className="border-0 shadow-sm rounded-4 text-dark"
                                style={{
                                    background: card.bg,
                                    position: "relative",
                                    overflow: "hidden",
                                    transition: "transform 0.3s ease",
                                    cursor: "pointer",
                                    padding: "0.75rem"
                                }}
                                onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-5px)")}
                                onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
                            >

                                {/* ✅ Decorative Circle */}
                                <div
                                    style={{
                                        position: "absolute",
                                        top: "-15px",
                                        right: "-15px",
                                        width: "80px",
                                        height: "80px",
                                        borderRadius: "50%",
                                        background: "rgba(0,0,0,0.05)",
                                        zIndex: 0
                                    }}
                                ></div>

                                <Card.Body className="text-center position-relative p-2" style={{ zIndex: 1 }}>

                                    {/* ✅ Icon Circle */}
                                    <div
                                        className="mx-auto mb-1 d-flex align-items-center justify-content-center"
                                        style={{
                                            width: "40px",
                                            height: "40px",
                                            borderRadius: "50%",
                                            background: "#212529",
                                            color: "#fff"
                                        }}
                                    >
                                        {card.icon}
                                    </div>

                                    <h6 className="text-secondary mb-0">{card.title}</h6>

                                    <h4 className="fw-bold mb-0">
                                        {card.value}
                                        {card.percent && (
                                            <span className="fs-6 text-muted"> ({card.percent})</span>
                                        )}
                                    </h4>

                                </Card.Body>
                            </Card>
                        </CCol>
                    ))}

            </CRow>


            <div className='card mt-1'>
                <div className='ag-theme-quartz' style={{ height: "500px" }}>
                    <AgGridReact ref={gridRef} rowData={rowdef} columnDefs={
                        (Register?.mode === 'AlldataWith_Bulk' && AuditType === 'Detailed')
                            ? columnforBulkwise : Register?.mode === 'BulkAudit_Summary' && AuditType === 'Summary' ? columnforBulkwiseWithLocation : Register?.mode === 'FloorWiseSummary' && AuditType === 'Summary' ? columnforFloorwise : Register?.mode === 'LocationWiseSummary' ? columnforLocationWise : Register?.mode === 'FloorWiseOverAllSummary' ? columnforFloorwiseOverAllSummary : columnforFloorDetailed
                    } rowSelection={"multiple"} autoGroupColumnDef={autoGroupColumnDef} pagination={pagination} paginationPageSize={paginationPageSize} paginationPageSizeSelector={paginationPageSizeSelector} />
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
                                    data-bs-toggle="modal" data-bs-target="#exampleModal1"
                                >
                                    <i className="bi bi-cloud-upload me-1"></i>Export
                                </button>
                            </div>
                            <div style={{ height: "500px" }} className='ag-theme-quartz'>
                                <AgGridReact ref={gridRef1} rowData={view} columnDefs={(Viewmode === 'BulkLocationwise') ? columnforRoomwise : Viewmode === 'LocationWise' ? columnForLocation : Viewmode === 'FloorWise' ? columnforSingleFloorwise : columnforFloorDetailed} rowSelection={"multiple"} autoGroupColumnDef={autoGroupColumnDef} pagination={pagination} paginationPageSize={paginationPageSize} paginationPageSizeSelector={paginationPageSizeSelector} />
                            </div>

                        </div>
                    </div>
                </div>
            </div>

        </div>
    )
}
AuditConsolidateReport.propTypes = {
    auth: PropTypes.any.isRequired,
};
export default AuditConsolidateReport
