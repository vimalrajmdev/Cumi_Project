import React, { useEffect, useState, useMemo, useRef } from 'react'
// import * as XLSX from 'xlsx';
import Swal from 'sweetalert2';
import axios from 'axios';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import "ag-grid-community/styles/ag-theme-quartz.css";
import { Card, CardBody, CardHeader, Col, Row } from 'react-bootstrap';
import PropTypes from 'prop-types';
import { getConfig } from 'src/config';
import { Typeahead } from 'react-bootstrap-typeahead';
import { BallTriangle } from 'react-loader-spinner';
import { FaCheckCircle, FaDatabase, FaExclamationTriangle, FaTimesCircle } from 'react-icons/fa';
import { IoSearchOutline } from 'react-icons/io5';
import ExcelJS from "exceljs";
import autoTable from 'jspdf-autotable';
import { saveAs } from "file-saver";
import logo from 'src/assets/images/Base64/Apple_base64'; // Can also be base64 string
import { CButton, CModal, CModalBody, CModalHeader, CModalTitle } from '@coreui/react';

const AuditScan = ({ auth }) => {
    const [SearchInput, SetSearchInput] = useState({
        FromDate: '', ToDate: ''
    });
    const [loading, setLoading] = useState(false); // Loader state
    const API_URL = getConfig().REACT_APP_API_URL;
    const [InventoryType, setInventoryType] = useState('AlldataWith_Bulk');
    const [LocationDropDownData, SetLocationDropDownData] = useState([]);
    const [FloorDropDownData, SetFloorDropDownData] = useState([]);

    const [inputdata, setInputdata] = useState({
        RFIDnumber: '', LocationRFID: '', mode: 'AlldataWith_Bulk'
    });
    const [statusCounts, setStatusCounts] = useState({
        Total: 0,
        Matched: 0,
        NotFound: 0,
        Mismatched: 0
    });
    const gridRef = useRef(null);
    // Excel for Bulk
    const downloadbulkExcel = async () => {
        const columnDefs = [
            { header: "S.No", key: "S.No" },
            { header: "Audit Status", key: "status" },
            { header: "RFID No", key: "RFIDId" },
            { header: "Asset ID", key: "AssetID" },
            { header: "Asset Name", key: "AssetName" },
            { header: "Asset Group", key: "AssetGroupName" },
            { header: "Category", key: "Category" },
            { header: "SubCategory", key: "SubCategory" },
            { header: "Department", key: "Department" },
            { header: "Original Location", key: "AssetLocation" },
            { header: "Location Code", key: "LocationCode" }
        ];

        const rowData = [];
        gridRef.current.api.forEachNode((node) => rowData.push(node.data));

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

        const statusCounts1 = {
            Total: statusCounts.Total,
            Found: statusCounts.Matched,
            NotFound: statusCounts.NotFound,
        };

        // Create Excel file
        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet("Bulk Wise Audit Report");

        sheet.views = [{ showGridLines: false }];

        const now = new Date();
        const formattedDate = now.toLocaleDateString("en-IN");

        // ⭐ TITLE
        sheet.mergeCells(1, 1, 1, columnDefs.length);
        const titleCell = sheet.getCell("A1");
        titleCell.value = `Bulk Audit Report - ${formattedDate}`;
        titleCell.font = { bold: true, size: 16 };
        titleCell.alignment = { vertical: "middle", horizontal: "left" };
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

        // =====================================================
        // ⭐ SUMMARY HEADER (ROW 3)
        // =====================================================
        const summaryHeaderRow = sheet.getRow(3);
        const summaryHeaders = ["Total", "Found", "Not Found"];

        summaryHeaders.forEach((text, index) => {
            const cell = summaryHeaderRow.getCell(index + 1);
            cell.value = text;
            cell.font = { bold: true };
            cell.alignment = { horizontal: "center", vertical: "middle" };
            cell.fill = {
                type: "pattern",
                pattern: "solid",
                fgColor: { argb: "BDD7EE" },
            };
            cell.border = {
                top: { style: "thin" },
                left: { style: "thin" },
                bottom: { style: "thin" },
                right: { style: "thin" },
            };
        });
        summaryHeaderRow.commit();

        // =====================================================
        // ⭐ SUMMARY VALUES (ROW 4)
        // =====================================================
        const summaryValueRow = sheet.getRow(4);
        const summaryValues = [
            statusCounts1.Total || '0',
            statusCounts1.Found || '0',
            statusCounts1.NotFound || '0',
        ];

        summaryValues.forEach((value, index) => {
            const cell = summaryValueRow.getCell(index + 1);
            cell.value = value;
            cell.alignment = { horizontal: "center", vertical: "middle" };
            cell.border = {
                top: { style: "thin" },
                left: { style: "thin" },
                bottom: { style: "thin" },
                right: { style: "thin" },
            };
        });
        summaryValueRow.commit();

        // =====================================================
        // ⭐ EMPTY ROW (ROW 5)
        // =====================================================
        sheet.addRow([]);

        // =====================================================
        // ⭐ TABLE HEADER (ROW 6)
        // =====================================================

        const headerRow = sheet.getRow(6);
        columnDefs.forEach((col, i) => {
            const cell = headerRow.getCell(i + 1);
            cell.value = col.header;
            cell.font = { bold: true };
            cell.alignment = { horizontal: "center", vertical: "middle" };
            cell.fill = {
                type: "pattern",
                pattern: "solid",
                fgColor: { argb: "D9D9D9" },
            };

            cell.border = {
                top: { style: "thin" },
                left: { style: "thin" },
                bottom: { style: "thin" },
                right: { style: "thin" },
            };
        });
        headerRow.commit();

        // ⭐ DATA ROWS
        rowData.forEach((row, index) => {
            const rowValues = columnDefs.map((c) => {
                if (c.header === "S.No") {
                    return index + 1; // Serial Number
                }
                let v = row[c.key];

                // Format DOB & DOJ
                if (c.key === "DateOfBirth" || c.key === "DateOfJoining") {
                    return formatDate(v);
                }
                return v ?? "-";
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
            column.width = maxLength + 5;

        });

        // Save Excel file
        const buffer = await workbook.xlsx.writeBuffer();
        saveAs(new Blob([buffer]), "Bulk_Audit_Report.xlsx");
    };
    // Excel For Location
    // Excel For Location Wise Audit Report
    const downloadLocationwiseExcel = async () => {

        // ⭐ COLUMN DEFINITIONS
        const columnDefs = [
            { header: "S.No", key: "S.No" },
            { header: "Audit Status", key: "status" },
            { header: "RFID No", key: "RFIDId" },
            { header: "Asset ID", key: "AssetID" },
            { header: "Asset Name", key: "AssetName" },
            { header: "Asset Group", key: "AssetGroupName" },
            { header: "Category", key: "Category" },
            { header: "SubCategory", key: "SubCategory" },
            { header: "Department", key: "Department" },
            { header: "Original Location", key: "AssetLocation" },
            { header: "Location Code", key: "LocationCode" },
            { header: "Founded Location", key: "MobileLocation" },
            { header: "Founded Location Code", key: "MobileFoundedLocationCode" },
        ];

        // ⭐ GET GRID DATA
        const rowData = [];
        gridRef.current.api.forEachNode((node) => rowData.push(node.data));

        // ⭐ CARD COUNTS (FROM UI)
        const statusCounts1 = {
            Total: statusCounts.Total,
            Found: statusCounts.Matched,
            NotFound: statusCounts.NotFound,
            Mismatch: statusCounts.Mismatched,
        };

        // ⭐ CREATE WORKBOOK
        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet("Location Wise Audit Report");

        sheet.views = [{ showGridLines: false }];

        const now = new Date();
        const formattedDate = now.toLocaleDateString("en-IN");

        // =====================================================
        // ⭐ TITLE ROW (ROW 1)
        // =====================================================
        sheet.mergeCells(1, 1, 1, columnDefs.length);
        const titleCell = sheet.getCell("A1");
        titleCell.value = `Location Wise Audit Report - ${formattedDate}`;
        titleCell.font = { bold: true, size: 16 };
        titleCell.alignment = { horizontal: "center", vertical: "middle" };
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

        // =====================================================
        // ⭐ SUMMARY HEADER (ROW 3)
        // =====================================================
        const summaryHeaderRow = sheet.getRow(3);
        const summaryHeaders = ["Total", "Found", "Not Found", "Mismatch"];

        summaryHeaders.forEach((text, index) => {
            const cell = summaryHeaderRow.getCell(index + 1);
            cell.value = text;
            cell.font = { bold: true };
            cell.alignment = { horizontal: "center", vertical: "middle" };
            cell.fill = {
                type: "pattern",
                pattern: "solid",
                fgColor: { argb: "BDD7EE" },
            };
            cell.border = {
                top: { style: "thin" },
                left: { style: "thin" },
                bottom: { style: "thin" },
                right: { style: "thin" },
            };
        });
        summaryHeaderRow.commit();

        // =====================================================
        // ⭐ SUMMARY VALUES (ROW 4)
        // =====================================================
        const summaryValueRow = sheet.getRow(4);
        const summaryValues = [
            statusCounts1.Total || '0',
            statusCounts1.Found || '0',
            statusCounts1.NotFound || '0',
            statusCounts1.Mismatch || '0',
        ];

        summaryValues.forEach((value, index) => {
            const cell = summaryValueRow.getCell(index + 1);
            cell.value = value;
            cell.alignment = { horizontal: "center", vertical: "middle" };
            cell.border = {
                top: { style: "thin" },
                left: { style: "thin" },
                bottom: { style: "thin" },
                right: { style: "thin" },
            };
        });
        summaryValueRow.commit();

        // =====================================================
        // ⭐ EMPTY ROW (ROW 5)
        // =====================================================
        sheet.addRow([]);

        // =====================================================
        // ⭐ TABLE HEADER (ROW 6)
        // =====================================================
        const headerRow = sheet.getRow(6);
        columnDefs.forEach((col, i) => {
            const cell = headerRow.getCell(i + 1);
            cell.value = col.header;
            cell.font = { bold: true };
            cell.alignment = { horizontal: "center", vertical: "middle" };
            cell.fill = {
                type: "pattern",
                pattern: "solid",
                fgColor: { argb: "D9D9D9" },
            };
            cell.border = {
                top: { style: "thin" },
                left: { style: "thin" },
                bottom: { style: "thin" },
                right: { style: "thin" },
            };
        });
        headerRow.commit();

        // =====================================================
        // ⭐ DATA ROWS (START FROM ROW 7)
        // =====================================================
        rowData.forEach((row, index) => {
            const rowValues = columnDefs.map((c) => {
                if (c.header === "S.No") return index + 1;
                return row[c.key] ?? "-";
            });

            const dataRow = sheet.addRow(rowValues);
            dataRow.eachCell((cell) => {
                cell.alignment = { horizontal: "center", vertical: "middle" };
                cell.border = {
                    top: { style: "thin" },
                    left: { style: "thin" },
                    bottom: { style: "thin" },
                    right: { style: "thin" },
                };
            });
        });

        // =====================================================
        // ⭐ AUTO COLUMN WIDTH
        // =====================================================
        sheet.columns.forEach((column) => {
            let maxLength = 10;
            column.eachCell({ includeEmpty: true }, (cell) => {
                const value = cell.value ? cell.value.toString() : "";
                maxLength = Math.max(maxLength, value.length);
            });
            column.width = maxLength + 5;
        });

        // =====================================================
        // ⭐ DOWNLOAD FILE
        // =====================================================
        const buffer = await workbook.xlsx.writeBuffer();
        saveAs(new Blob([buffer]), "Location_Audit_Report.xlsx");
    };


    // Excel For Floor 
    const downloadFloorExcel = async () => {
        const columnDefs = [
            { header: "S.No", key: "S.No" },
            { header: "Audit Status", key: "status" },
            { header: "RFID No", key: "RFIDId" },
            { header: "Asset ID", key: "AssetID" },
            { header: "Asset Name", key: "AssetName" },
            { header: "Asset Group", key: "AssetGroupName" },
            { header: "Category", key: "Category" },
            { header: "SubCategory", key: "SubCategory" },
            { header: "Department", key: "Department" },
            { header: "Original Location", key: "LocationRFID" },
            { header: "Location Code", key: "LocationCode" },
            { header: "Original Floor", key: "AssetOGFloor" },
            { header: "Founded Floor ", key: "MobileFoundFloor" },
        ];

        const rowData = [];
        gridRef.current.api.forEachNode((node) => rowData.push(node.data));

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

        // ⭐ CARD COUNTS (FROM UI)
        const statusCounts1 = {
            Total: statusCounts.Total,
            Found: statusCounts.Matched,
            NotFound: statusCounts.NotFound,
            Mismatch: statusCounts.Mismatched,
        };

        // Create Excel file
        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet("Floor Wise Audit Report");

        sheet.views = [{ showGridLines: false }];

        const now = new Date();
        const formattedDate = now.toLocaleDateString("en-IN");

        // ⭐ TITLE
        sheet.mergeCells(1, 1, 1, columnDefs.length);
        const titleCell = sheet.getCell("A1");
        titleCell.value = `Floor Audit Report - ${formattedDate}`;
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
        titleCell.alignment = { vertical: "middle", horizontal: "left" };

        // =====================================================
        // ⭐ SUMMARY HEADER (ROW 3)
        // =====================================================
        const summaryHeaderRow = sheet.getRow(3);
        const summaryHeaders = ["Total", "Found", "Not Found", "Mismatch"];

        summaryHeaders.forEach((text, index) => {
            const cell = summaryHeaderRow.getCell(index + 1);
            cell.value = text;
            cell.font = { bold: true };
            cell.alignment = { horizontal: "center", vertical: "middle" };
            cell.fill = {
                type: "pattern",
                pattern: "solid",
                fgColor: { argb: "BDD7EE" },
            };
            cell.border = {
                top: { style: "thin" },
                left: { style: "thin" },
                bottom: { style: "thin" },
                right: { style: "thin" },
            };
        });
        summaryHeaderRow.commit();

        // =====================================================
        // ⭐ SUMMARY VALUES (ROW 4)
        // =====================================================
        const summaryValueRow = sheet.getRow(4);
        const summaryValues = [
            statusCounts1.Total || '0',
            statusCounts1.Found || '0',
            statusCounts1.NotFound || '0',
            statusCounts1.Mismatch || '0',
        ];

        summaryValues.forEach((value, index) => {
            const cell = summaryValueRow.getCell(index + 1);
            cell.value = value;
            cell.alignment = { horizontal: "center", vertical: "middle" };
            cell.border = {
                top: { style: "thin" },
                left: { style: "thin" },
                bottom: { style: "thin" },
                right: { style: "thin" },
            };
        });
        summaryValueRow.commit();

        // =====================================================
        // ⭐ EMPTY ROW (ROW 5)
        // =====================================================
        sheet.addRow([]);

        // =====================================================
        // ⭐ TABLE HEADER (ROW 6)
        // =====================================================

        const headerRow = sheet.getRow(6);
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
        rowData.forEach((row, index) => {
            const rowValues = columnDefs.map((c) => {
                if (c.header === "S.No") {
                    return index + 1; // Serial Number
                }
                let v = row[c.key];

                // Format DOB & DOJ
                if (c.key === "DateOfBirth" || c.key === "DateOfJoining") {
                    return formatDate(v);
                }
                return v ?? "-";
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
        saveAs(new Blob([buffer]), "Floor_Audit_Report.xlsx");
    };

    // PDF For Bulk
    // PDF For Bulk (Dashboard Style Header)
    const handleBulkpdf = async (selectedDate) => {
        setLoading(true);
        await new Promise((resolve) => setTimeout(resolve, 0));

        const filteredData = gridRef.current.api
            .getModel()
            .rowsToDisplay.map((rowNode) => rowNode.data);

        if (!filteredData.length) {
            Swal.fire("No data available to export", "", "warning");
            setLoading(false);
            return;
        }

        const doc = new jsPDF({ orientation: "landscape", format: "a3" });
        const title = "Bulk Audit Report";

        // ==========================
        // 📌 DATE FORMAT
        // ==========================
        let reportDate;
        try {
            const rawDate = selectedDate?.$d || selectedDate;
            const parsedDate = new Date(rawDate);
            if (isNaN(parsedDate)) throw new Error();
            reportDate = parsedDate.toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "short",
                year: "numeric",
            });
        } catch {
            reportDate = new Date().toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "short",
                year: "numeric",
            });
        }

        // ==========================
        // 📌 SUMMARY COUNTS
        // ==========================
        const summary = {
            Total: statusCounts.Total || 0,
            Found: statusCounts.Matched || 0,
            NotFound: statusCounts.NotFound || 0,
        };

        // ==========================
        // 📌 TABLE HEADER & BODY
        // ==========================
        const headers = [
            "S.No",
            "Status",
            "RFID No",
            "Asset ID",
            "Asset Name",
            "Asset Group",
            "Category",
            "SubCategory",
            "Department",
            "Original Location",
            "Location Code",
        ];

        const bodyData = filteredData.map((item, index) => [
            index + 1,
            item.status || "-",
            item.RFIDId || "-",
            item.AssetID || "-",
            item.AssetName || "-",
            item.AssetGroupName || "-",
            item.Category || "-",
            item.SubCategory || "-",
            item.Department || "-",
            item.AssetLocation || "-",
            item.LocationCode || "-",
        ]);

        // ==========================
        // 📌 MAIN TABLE
        // ==========================
        if (bodyData.length > 0) {
            autoTable(doc, {
                head: [headers],
                body: bodyData,
                startY: 75,
                margin: { top: 75, right: 15, left: 10, bottom: 20 },

                styles: {
                    halign: "center",
                    valign: "middle",
                    fontSize: 10,
                    font: "times",
                    cellPadding: 3,
                    textColor: [0, 0, 0],
                    lineColor: [0, 0, 0],
                    lineWidth: 0.2,
                },

                headStyles: {
                    fillColor: [0, 0, 0],
                    textColor: [255, 255, 255],
                    fontSize: 11,
                    fontStyle: "bold",
                },

                didDrawPage: () => {
                    const pageWidth = doc.internal.pageSize.width;
                    const pageHeight = doc.internal.pageSize.height;

                    // ==========================
                    // 📌 LOGO
                    // ==========================
                    doc.addImage(logo, "PNG", 10, 6, 30, 12);

                    // ==========================
                    // 📌 TITLE
                    // ==========================
                    doc.setFont("times", "bold");
                    doc.setFontSize(20);
                    doc.text(`${title} - ${reportDate}`, pageWidth / 2, 25, {
                        align: "center",
                    });

                    // ==========================
                    // 📌 DASHBOARD STYLE SUMMARY CARDS
                    // ==========================
                    const cardY = 35;
                    const cardHeight = 22;
                    const cardWidth = 85;
                    const gap = 14;

                    const startX =
                        (pageWidth - (cardWidth * 3 + gap * 2)) / 2;

                    // ---- TOTAL CARD ----
                    doc.setFillColor(235, 240, 255);
                    doc.roundedRect(startX, cardY, cardWidth, cardHeight, 4, 4, "F");
                    doc.setTextColor(60, 60, 60);
                    doc.setFontSize(10);
                    doc.text("Total Asset", startX + cardWidth / 2, cardY + 8, { align: "center" });
                    doc.setFontSize(16);
                    doc.setFont("times", "bold");
                    doc.text(String(summary.Total), startX + cardWidth / 2, cardY + 17, {
                        align: "center",
                    });

                    // ---- FOUND CARD ----
                    doc.setFillColor(230, 255, 240);
                    doc.roundedRect(startX + cardWidth + gap, cardY, cardWidth, cardHeight, 4, 4, "F");
                    doc.setFontSize(10);
                    doc.text(
                        "Founded",
                        startX + cardWidth + gap + cardWidth / 2,
                        cardY + 8,
                        { align: "center" }
                    );
                    doc.setFontSize(16);
                    doc.text(
                        String(summary.Found),
                        startX + cardWidth + gap + cardWidth / 2,
                        cardY + 17,
                        { align: "center" }
                    );

                    // ---- NOT FOUND CARD ----
                    doc.setFillColor(255, 235, 235);
                    doc.roundedRect(
                        startX + (cardWidth + gap) * 2,
                        cardY,
                        cardWidth,
                        cardHeight,
                        4,
                        4,
                        "F"
                    );
                    doc.setFontSize(10);
                    doc.text(
                        "Not Founded",
                        startX + (cardWidth + gap) * 2 + cardWidth / 2,
                        cardY + 8,
                        { align: "center" }
                    );
                    doc.setFontSize(16);
                    doc.text(
                        String(summary.NotFound),
                        startX + (cardWidth + gap) * 2 + cardWidth / 2,
                        cardY + 17,
                        { align: "center" }
                    );

                    // ==========================
                    // 📌 PAGE NUMBER
                    // ==========================
                    doc.setFontSize(8);
                    doc.setFont("times", "normal");
                    doc.text(
                        `Page ${doc.internal.getCurrentPageInfo().pageNumber}`,
                        pageWidth - 10,
                        10,
                        { align: "right" }
                    );

                    // ==========================
                    // 📌 FOOTER
                    // ==========================
                    const footerText = `Printed By: ${auth.employeename} | Printed On: ${new Date().toLocaleDateString()} | Time: ${new Date().toLocaleTimeString()}`;
                    const footerNote = `Note: This document has been generated electronically and is valid without signature.`;

                    doc.text(footerText, pageWidth / 2, pageHeight - 15, { align: "center" });
                    doc.text(footerNote, pageWidth / 2, pageHeight - 8, { align: "center" });
                },
            });
            doc.save("Bulk_Audit_Report.pdf");
        } else {
            Swal.fire("No data available to export", "", "warning");
        }
        setLoading(false);
    };


    // PDF For LOcation
    const handleLocationpdf = async (selectedDate) => {
        setLoading(true);
        await new Promise(resolve => setTimeout(resolve, 0));

        const filteredData = gridRef.current.api.getModel().rowsToDisplay.map(rowNode => rowNode.data);

        const doc = new jsPDF({ orientation: "landscape", format: 'a3' });
        const title = 'Location Audit Report';

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
        // ==========================
        // 📌 SUMMARY COUNTS
        // ==========================
        const summary = {
            Total: statusCounts.Total || 0,
            Found: statusCounts.Matched || 0,
            NotFound: statusCounts.NotFound || 0,
            Mismatch: statusCounts.Mismatched || 0,
        };

        // ✅ Header columns
        const headers = [
            'S.No', 'status', 'RFIDId', 'AssetID', "Asset Name",
            "Asset Group", 'Category', 'SubCategory', 'Department', 'AssetLocation', 'LocationCode', 'MobileLocation', 'MobileFoundedLocationCode'
        ];


        // ✅ Match field names from API / grid (case-sensitive!)
        const bodyData = filteredData.map((item, index) => [
            index + 1,
            item.status || "-",
            item.RFIDId || "-",
            item.AssetID || "-",
            item.AssetName || "-",
            item.AssetGroupName || "-",
            item.Category || "-",
            item.SubCategory || "-",
            item.Department || "-",
            item.AssetLocation || "-",
            item.LocationCode || "-",
            item.MobileLocation || "-",
            item.MobileFoundedLocationCode || "-"


        ]);

        if (bodyData.length > 0) {
            autoTable(doc, {
                head: [headers],
                body: bodyData,
                startY: 80,              // ✅ PUSH TABLE BELOW CARDS
                margin: { top: 80, right: 15, left: 10, bottom: 20 },
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

                    // ==========================
                    // 📌 DASHBOARD STYLE SUMMARY CARDS (4 CARDS)
                    // ==========================
                    const cardY = 35;
                    const cardHeight = 22;
                    const cardWidth = 75;
                    const gap = 12;

                    // 4 cards center aligned
                    const startX =
                        (pageWidth - (cardWidth * 4 + gap * 3)) / 2;

                    // ---- TOTAL ----
                    doc.setFillColor(235, 240, 255);
                    doc.roundedRect(startX, cardY, cardWidth, cardHeight, 4, 4, "F");
                    doc.setFontSize(10);
                    doc.text("Total Asset", startX + cardWidth / 2, cardY + 8, { align: "center" });
                    doc.setFontSize(16);
                    doc.text(String(summary.Total), startX + cardWidth / 2, cardY + 17, { align: "center" });

                    // ---- FOUND ----
                    doc.setFillColor(230, 255, 240);
                    doc.roundedRect(startX + (cardWidth + gap), cardY, cardWidth, cardHeight, 4, 4, "F");
                    doc.setFontSize(10);
                    doc.text("Founded", startX + (cardWidth + gap) + cardWidth / 2, cardY + 8, { align: "center" });
                    doc.setFontSize(16);
                    doc.text(String(summary.Found), startX + (cardWidth + gap) + cardWidth / 2, cardY + 17, { align: "center" });

                    // ---- MISMATCH ----
                    doc.setFillColor(255, 245, 230);
                    doc.roundedRect(startX + (cardWidth + gap) * 2, cardY, cardWidth, cardHeight, 4, 4, "F");
                    doc.setFontSize(10);
                    doc.text("Mismatch", startX + (cardWidth + gap) * 2 + cardWidth / 2, cardY + 8, { align: "center" });
                    doc.setFontSize(16);
                    doc.text(String(summary.Mismatch), startX + (cardWidth + gap) * 2 + cardWidth / 2, cardY + 17, { align: "center" });

                    // ---- NOT FOUND ----
                    doc.setFillColor(255, 235, 235);
                    doc.roundedRect(startX + (cardWidth + gap) * 3, cardY, cardWidth, cardHeight, 4, 4, "F");
                    doc.setFontSize(10);
                    doc.text("Not Found", startX + (cardWidth + gap) * 3 + cardWidth / 2, cardY + 8, { align: "center" });
                    doc.setFontSize(16);
                    doc.text(String(summary.NotFound), startX + (cardWidth + gap) * 3 + cardWidth / 2, cardY + 17, { align: "center" });

                    // ==========================
                    // 📌 PAGE NUMBER
                    // ==========================
                    doc.setFontSize(8);
                    doc.setFont("times", "normal");
                    doc.text(
                        `Page ${doc.internal.getCurrentPageInfo().pageNumber}`,
                        pageWidth - 10,
                        10,
                        { align: "right" }
                    );

                    const footerText = `Printed By: ${auth.employeename} | Printed On: ${new Date().toLocaleDateString()} | Time: ${new Date().toLocaleTimeString()}`;
                    const footerNote = `Note: This document has been generated electronically and is valid without signature.`;

                    // both lines centered
                    doc.text(footerText, pageWidth / 2, pageHeight - 15, { align: 'center' });
                    doc.text(footerNote, pageWidth / 2, pageHeight - 8, { align: 'center' });

                }
            });

            doc.save("Location_Audit_Report.pdf");
        } else {
            Swal.fire("No data available to export", "", "warning");
        }
        setLoading(false);
    };

    // PDF FOR Floor
    const handleFloorpdf = async (selectedDate) => {
        setLoading(true);
        await new Promise(resolve => setTimeout(resolve, 0));

        const filteredData = gridRef.current.api.getModel().rowsToDisplay.map(rowNode => rowNode.data);

        const doc = new jsPDF({ orientation: "landscape", format: 'a3' });
        const title = 'Floor Audit Report';

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
        // ==========================
        // 📌 SUMMARY COUNTS
        // ==========================
        const summary = {
            Total: statusCounts.Total || 0,
            Found: statusCounts.Matched || 0,
            NotFound: statusCounts.NotFound || 0,
            Mismatch: statusCounts.Mismatched || 0,
        };

        // ✅ Header columns
        const headers = [
            'S.No', 'status', 'RFIDId', 'AssetID', 'AssetName', 'AssetGroupName', 'Category', 'SubCategory', 'Department', 'Location RFID', 'LocationCode', 'OG_Floor', 'MobileFoundedFloor'
        ];


        // ✅ Match field names from API / grid (case-sensitive!)
        const bodyData = filteredData.map((item, index) => [
            index + 1,
            item.status || "-",
            item.RFIDId || "-",
            item.AssetID || "-",
            item.AssetName || "-",
            item.AssetGroupName || "-",
            item.Category || "-",
            item.SubCategory || "-",
            item.Department || "-",
            item.LocationRFID || "-",
            item.LocationCode || "-",
            item.AssetOGFloor || "-",
            item.MobileFoundFloor || "-"


        ]);

        if (bodyData.length > 0) {
            autoTable(doc, {
                head: [headers],
                body: bodyData,
                startY: 80,              // ✅ PUSH TABLE BELOW CARDS
                margin: { top: 80, right: 15, left: 10, bottom: 20 },

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

                    // ==========================
                    // 📌 DASHBOARD STYLE SUMMARY CARDS (4 CARDS)
                    // ==========================
                    const cardY = 35;
                    const cardHeight = 22;
                    const cardWidth = 75;
                    const gap = 12;

                    // 4 cards center aligned
                    const startX =
                        (pageWidth - (cardWidth * 4 + gap * 3)) / 2;

                    // ---- TOTAL ----
                    doc.setFillColor(235, 240, 255);
                    doc.roundedRect(startX, cardY, cardWidth, cardHeight, 4, 4, "F");
                    doc.setFontSize(10);
                    doc.text("Total Asset", startX + cardWidth / 2, cardY + 8, { align: "center" });
                    doc.setFontSize(16);
                    doc.text(String(summary.Total), startX + cardWidth / 2, cardY + 17, { align: "center" });

                    // ---- FOUND ----
                    doc.setFillColor(230, 255, 240);
                    doc.roundedRect(startX + (cardWidth + gap), cardY, cardWidth, cardHeight, 4, 4, "F");
                    doc.setFontSize(10);
                    doc.text("Founded", startX + (cardWidth + gap) + cardWidth / 2, cardY + 8, { align: "center" });
                    doc.setFontSize(16);
                    doc.text(String(summary.Found), startX + (cardWidth + gap) + cardWidth / 2, cardY + 17, { align: "center" });

                    // ---- MISMATCH ----
                    doc.setFillColor(255, 245, 230);
                    doc.roundedRect(startX + (cardWidth + gap) * 2, cardY, cardWidth, cardHeight, 4, 4, "F");
                    doc.setFontSize(10);
                    doc.text("Mismatch", startX + (cardWidth + gap) * 2 + cardWidth / 2, cardY + 8, { align: "center" });
                    doc.setFontSize(16);
                    doc.text(String(summary.Mismatch), startX + (cardWidth + gap) * 2 + cardWidth / 2, cardY + 17, { align: "center" });

                    // ---- NOT FOUND ----
                    doc.setFillColor(255, 235, 235);
                    doc.roundedRect(startX + (cardWidth + gap) * 3, cardY, cardWidth, cardHeight, 4, 4, "F");
                    doc.setFontSize(10);
                    doc.text("Not Found", startX + (cardWidth + gap) * 3 + cardWidth / 2, cardY + 8, { align: "center" });
                    doc.setFontSize(16);
                    doc.text(String(summary.NotFound), startX + (cardWidth + gap) * 3 + cardWidth / 2, cardY + 17, { align: "center" });

                    // ==========================
                    // 📌 PAGE NUMBER
                    // ==========================
                    doc.setFontSize(8);
                    doc.setFont("times", "normal");
                    doc.text(
                        `Page ${doc.internal.getCurrentPageInfo().pageNumber}`,
                        pageWidth - 10,
                        10,
                        { align: "right" }
                    );

                    // ✅ Footer (center aligned)
                    doc.setFontSize(8);

                    const footerText = `Printed By: ${auth.employeename} | Printed On: ${new Date().toLocaleDateString()} | Time: ${new Date().toLocaleTimeString()}`;
                    const footerNote = `Note: This document has been generated electronically and is valid without signature.`;

                    // both lines centered
                    doc.text(footerText, pageWidth / 2, pageHeight - 15, { align: 'center' });
                    doc.text(footerNote, pageWidth / 2, pageHeight - 8, { align: 'center' });

                }
            });

            doc.save("Floor_Audit_Report.pdf");
        } else {
            Swal.fire("No data available to export", "", "warning");
        }
        setLoading(false);
    };

    const [rowDef, setRowDef] = useState([])
    const [show, setShow] = useState(true);
    const [maxCreatedDate, setmaxCreatedDate] = useState('');

    useEffect(() => {
        const date = new Date().toISOString().split('T')[0];
        setmaxCreatedDate(date);
        FetchLocationDropdown();
        FetchFloorDropdown();
    }, []);

    const handleSearchDataforAll = async () => {
        if (auth.branchid === "0" || auth.branchid === 0) {
            Swal.fire({
                icon: 'warning',
                title: 'Invalid Selection',
                text: "Please select a specific branch. 'ALL' is not allowed.",
            });
            return;
        }
        if (inputdata.mode === 'AlldataWith_Bulk') {
            setRowDef([])
            if (SearchInput.FromDate === '') {
                Swal.fire({
                    text: 'Please Enter From Date',
                    icon: 'warning'
                })
                return
            }
        }
        setLoading(true);
        const alldata = { ...SearchInput, ...inputdata, branchid: auth.branchid }
        console.log("🚀 ~ handleSearchDataforAll ~ alldata:", alldata)
        try {

            const response = await axios.post(`${API_URL}/InventoryReport_new`, alldata)
            if (response.status === 200) {
                const data = response.data.send;
                const statusCounts = {
                    Matched: 0,
                    NotFound: 0,
                    Mismatched: 0
                };

                // Count statuses
                let nullStatusCount = 0;

                data.forEach(item => {
                    // console.log(item.status === null);  
                    if (item.status === null) {
                        statusCounts.NotFound++;
                    } else if (item.status === 'Found') {
                        statusCounts.Matched++;
                    } else if (item.status === 'Not Found') {
                        statusCounts.NotFound++;
                    } else if (item.status === 'Mismatched') {
                        statusCounts.Mismatched++;
                    }
                });

                // console.log("Null status count:", nullStatusCount);  // Logs the count of null status

                const total = statusCounts.Matched + statusCounts.NotFound;
                setStatusCounts({
                    ...statusCounts,
                    Total: total
                });

                const mobileLocation = data[0]?.MobileLocation;
                if (inputdata.LocationRFID === '') {
                    console.log('false')
                    setRowDef(response.data.send)

                } else {
                    if (mobileLocation === inputdata.LocationRFID) {
                        setRowDef(response.data.send)

                    } else if (mobileLocation !== inputdata.LocationRFID) {
                        Swal.fire({
                            text: 'Sorry No Data Found..!',
                            icon: 'warning'
                        })
                        setInputdata({
                            ...inputdata,
                            RFIDnumber: '', BranchName: '', PhysicalLocation: '', LocationRFID: '', mode: ''
                        })
                        setRowDef([])
                        setStatusCounts({
                            Total: 0,
                            Matched: 0,
                            NotFound: 0,
                            Mismatched: 0
                        })
                        SetSearchInput({
                            ...SearchInput,
                            FromDate: ''
                        })
                    }
                    console.log('true')

                }

                setLoading(false);


            } else {
                Swal.fire({
                    text: 'Sorry No Data Found..!',
                    icon: 'warning'
                }).then(() => {
                    setLoading(false);
                })

            }
        } catch (err) {
            console.log(err);
            setLoading(false);

        }
    }

    const handleSearchDataforLocation = async () => {
        if (auth.branchid === "0" || auth.branchid === 0) {
            Swal.fire({
                icon: 'warning',
                title: 'Invalid Selection',
                text: "Please select a specific branch. 'ALL' is not allowed.",
            });
            return;
        }
        if (SearchInput.FromDate === '') {
            Swal.fire({
                text: 'Please Enter From Date',
                icon: 'warning'
            })
            return
        }

        if (inputdata.LocationRFID === '') {
            Swal.fire({
                text: 'Please select Location',
                icon: 'warning'
            })
            return
        }
        setLoading(true);
        const alldata = { ...SearchInput, ...inputdata, branchid: auth.branchid }
        try {
            const response = await axios.post(`${API_URL}/InventoryReport_new`, alldata)
            console.log("🚀 ~ handleSearchDataforLocation ~ response:", response)
            if (response.status === 200) {
                const data = response.data.send;
                if (data.length > 0) {
                    const statusCounts = {
                        Matched: 0,
                        NotFound: 0,
                        Mismatched: 0
                    };
                    // Count statuses
                    data.forEach(item => {
                        if (item.status === null) {
                            statusCounts.NotFound++;
                        } else if (item.status === 'Found') {
                            statusCounts.Matched++;
                        } else if (item.status === 'Not Found') {
                            statusCounts.NotFound++;
                        } else if (item.status === 'Mismatched') {
                            statusCounts.Mismatched++;
                        }
                    });
                    const total = statusCounts.Matched + statusCounts.NotFound;
                    setStatusCounts({
                        ...statusCounts,
                        Total: total
                    });
                    setLoading(false);
                    const mobileLocation = data[0]?.MobileLocation;
                    if (inputdata.LocationRFID === '') {
                        console.log('false');
                        setRowDef(response.data.send)
                        setLoading(false);
                    } else {
                        if (mobileLocation === inputdata.LocationRFID) {

                            setRowDef(response.data.send);
                            setLoading(false);

                        } else if (mobileLocation !== inputdata.LocationRFID) {
                            // Swal.fire({
                            //     text: 'Sorry No Data Found..!',
                            //     icon: 'warning'
                            // })
                            // setInputdata({
                            //     ...inputdata,
                            //     RFIDnumber: '', BranchName: '', PhysicalLocation: '', LocationRFID: '', mode: 'L'
                            // })
                            // setRowDef([])
                            // setStatusCounts({
                            //     Total: 0,
                            //     Matched: 0,
                            //     NotFound: 0,
                            //     Mismatched: 0
                            // })

                            // SetSearchInput({
                            //     ...SearchInput,
                            //     FromDate: ''
                            // })
                        }
                        const alldata = { ...SearchInput, ...inputdata }
                        setRowDef(response.data.send);
                        setLoading(false);

                    }
                } else {
                    setLoading(false);
                    Swal.fire({
                        text: 'Sorry No Data Found..!',
                        icon: 'warning'
                    })

                    setRowDef([])
                    setStatusCounts({
                        Total: 0,
                        Matched: 0,
                        NotFound: 0,
                        Mismatched: 0
                    })

                }

            } else {
                setLoading(false);
                Swal.fire({
                    text: 'Sorry No Data Found..!',
                    icon: 'warning'
                })
            }
        } catch (err) {
            console.log(err);
            setLoading(false);
            Swal.fire({
                text: 'Sorry No Data Found..!',
                icon: 'warning'
            })

            // setInputdata({
            //     ...inputdata,
            //     RFIDnumber: '', BranchName: '', PhysicalLocation: '', LocationRFID: '', mode: 'L'
            // })
            // setRowDef([])
            // setStatusCounts({
            //     Total: 0,
            //     Matched: 0,
            //     NotFound: 0,
            //     Mismatched: 0
            // })

            // SetSearchInput({
            //     ...SearchInput,
            //     FromDate: ''
            // })
        }
    }

    const handleSearchDataforFloor = async () => {
        if (auth.branchid === "0" || auth.branchid === 0) {
            Swal.fire({
                icon: 'warning',
                title: 'Invalid Selection',
                text: "Please select a specific branch. 'ALL' is not allowed.",
            });
            return;
        }
        if (SearchInput.FromDate === '') {
            Swal.fire({
                text: 'Please Enter From Date',
                icon: 'warning'
            })
            return
        }


        // setLoading(true);
        const alldata = { ...SearchInput, ...inputdata, branchid: auth.branchid }
        try {
            const response = await axios.post(`${API_URL}/InventoryReport_new`, alldata)
            console.log("🚀 ~ handleSearchDataforLocation ~ response:", response)
            if (response.status === 200) {
                const data = response.data.send;
                if (data.length > 0) {
                    const statusCounts = {
                        Matched: 0,
                        NotFound: 0,
                        Mismatched: 0
                    };
                    // Count statuses
                    data.forEach(item => {
                        if (item.status === null) {
                            statusCounts.NotFound++;
                        } else if (item.status === 'Found') {
                            statusCounts.Matched++;
                        } else if (item.status === 'Not Found') {
                            statusCounts.NotFound++;
                        } else if (item.status === 'Mismatched') {
                            statusCounts.Mismatched++;
                        }
                    });
                    const total = statusCounts.Matched + statusCounts.NotFound;
                    setStatusCounts({
                        ...statusCounts,
                        Total: total
                    });
                    setLoading(false);
                    const mobileLocation = data[0]?.MobileLocation;
                    if (inputdata.LocationRFID === '') {
                        console.log('false');
                        setRowDef(response.data.send)
                        setLoading(false);
                    } else {
                        if (mobileLocation === inputdata.LocationRFID) {

                            setRowDef(response.data.send);
                            setLoading(false);

                        } else if (mobileLocation !== inputdata.LocationRFID) {
                            // Swal.fire({
                            //     text: 'Sorry No Data Found..!',
                            //     icon: 'warning'
                            // })
                            // setInputdata({
                            //     ...inputdata,
                            //     RFIDnumber: '', BranchName: '', PhysicalLocation: '', LocationRFID: '', mode: 'L'
                            // })
                            // setRowDef([])
                            // setStatusCounts({
                            //     Total: 0,
                            //     Matched: 0,
                            //     NotFound: 0,
                            //     Mismatched: 0
                            // })

                            // SetSearchInput({
                            //     ...SearchInput,
                            //     FromDate: ''
                            // })
                        }
                        const alldata = { ...SearchInput, ...inputdata }
                        setRowDef(response.data.send);
                        setLoading(false);

                    }
                } else {
                    setLoading(false);
                    Swal.fire({
                        text: 'Sorry No Data Found..!',
                        icon: 'warning'
                    })

                    setRowDef([])
                    setStatusCounts({
                        Total: 0,
                        Matched: 0,
                        NotFound: 0,
                        Mismatched: 0
                    })

                }

            } else {
                setLoading(false);
                Swal.fire({
                    text: 'Sorry No Data Found..!',
                    icon: 'warning'
                })
            }
        } catch (err) {
            console.log(err);
            setLoading(false);
            Swal.fire({
                text: 'Sorry No Data Found..!',
                icon: 'warning'
            })


        }
    }
    // Table
    const pagination = true;
    const paginationPageSize = 50;
    const paginationPageSizeSelector = [10, 20, 50];

    const columndef = [
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
    ]

    const columndef1 = [
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
    ]

    const columndef2 = [
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
    ]

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

    const FetchLocationDropdown = async () => {
        try {
            const response = await axios.post(`${API_URL}/LocationRegister`, { mode: 'getLocation', branchid: auth.branchid, BranchAccess: auth.BranchAccess });
            if (response.status === 200) {
                SetLocationDropDownData(response.data);
            }
        } catch (err) {
            console.log(err);
        }
    };

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
    const [selectedLocation, setSelectedLocation] = useState(null);
    const [selectedFloor, setSelectedFloor] = useState(null);
    const handleChange = (event) => {
        const value1 = event.target.value;
        console.log("🚀 ~ handleChange ~ value1:", value1)

        setInventoryType(value1);

        // reset all dependent states
        SetSearchInput({ FromDate: '', ToDate: '' });
        setSelectedLocation(null);
        setSelectedFloor(null);
        setRowDef([]);
        setStatusCounts({
            Total: 0,
            Matched: 0,
            NotFound: 0,
            Mismatched: 0
        });

        setInputdata({
            mode: value1,
            LocationRFID: ''
        });
        if (value1 === 'AlldataWith_Bulk') {
            // setInventoryType(true);
            SetSearchInput({
                FromDate: '', ToDate: ''
            })

            setInputdata({
                RFIDnumber: '', BranchName: '', PhysicalLocation: '', LocationRFID: '', mode: 'AlldataWith_Bulk'
            }
            )
            setRowDef([])
            setStatusCounts({
                Total: 0,
                Matched: 0,
                NotFound: 0,
                Mismatched: 0
            })

        }
        else if (value1 === 'LocationWise') {
            SetSearchInput({
                FromDate: '', ToDate: ''
            })
            setInputdata({
                RFIDnumber: '', BranchName: '', PhysicalLocation: '', LocationRFID: '', mode: 'LocationWise'
            })
            // setInventoryType(false)
            setRowDef([])
            setStatusCounts({
                Total: 0,
                Matched: 0,
                NotFound: 0,
                Mismatched: 0
            })
        }
        else {
            SetSearchInput({
                FromDate: '', ToDate: ''
            })
            setInputdata({
                RFIDnumber: '', BranchName: '', PhysicalLocation: '', LocationRFID: '', mode: 'FloorWise'
            })
            setRowDef([])
            setStatusCounts({
                Total: 0,
                Matched: 0,
                NotFound: 0,
                Mismatched: 0
            })
        }
    };

    const [visible, setVisible] = useState(false);


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

            {/* Modal for Download Format Register Asset*/}
            {/* CoreUI Modal for Download Format Register Asset */}
            <CModal
                visible={visible}
                // onClose={() => setVisible(false)}
                alignment="center"
            >
                <CModalHeader className="pro-header" closeButton={false}>
                    <CModalTitle className="text-white">
                        Download Format
                    </CModalTitle>

                    <CButton
                        color="light"
                        variant="outline"
                        size="sm"
                        onClick={() => setVisible(false)}
                    >
                        X
                    </CButton>
                </CModalHeader>

                <CModalBody>
                    <div className="d-flex justify-content-evenly">

                        {/* Excel */}
                        <div
                            className="btn btn-success"
                            style={{ cursor: "pointer" }}
                            onClick={() => {
                                if (InventoryType === 'AlldataWith_Bulk') {
                                    downloadbulkExcel();
                                } else if (InventoryType === 'LocationWise') {
                                    downloadLocationwiseExcel();
                                } else {
                                    downloadFloorExcel();
                                }
                                setVisible(false);
                            }}
                        >
                            <i className="bi bi-file-earmark-spreadsheet fs-1"></i>
                        </div>

                        {/* PDF */}
                        <div
                            className="btn btn-danger"
                            style={{ cursor: "pointer" }}
                            onClick={() => {
                                if (InventoryType === 'AlldataWith_Bulk') {
                                    handleBulkpdf();
                                } else if (InventoryType === 'LocationWise') {
                                    handleLocationpdf();
                                } else {
                                    handleFloorpdf();
                                }
                                setVisible(false);
                            }}
                        >
                            <i className="bi bi-filetype-pdf fs-1"></i>
                        </div>

                    </div>

                    <div className="d-flex justify-content-evenly mt-2">
                        <span className="text-muted">Download Excel Format</span>
                        <span className="text-muted">Download PDF Format</span>
                    </div>
                </CModalBody>
            </CModal>

            <Card>
                <CardHeader className='pro-header p-1'>
                    <h3 className='text-center text-white'>
                        <IoSearchOutline className="fs-3 mb-1" /> Mobile Scan
                    </h3>
                </CardHeader>

                <CardBody>

                    {/* ----------- TOGGLE ----------- */}
                    <div className="toggle-group mt-3 m-3">
                        {[
                            { value: 'AlldataWith_Bulk', label: 'All' },
                            { value: 'LocationWise', label: 'Location' },
                            { value: 'FloorWise', label: 'Floor Wise' }
                        ].map(option => (
                            <label
                                key={option.value}
                                className={`toggle-option-modern ${InventoryType === option.value ? 'active' : ''
                                    }`}
                            >
                                <input
                                    type="radio"
                                    name="InventoryType"
                                    value={option.value}
                                    checked={InventoryType === option.value}
                                    onChange={handleChange}
                                />
                                <span className="toggle-label-modern">{option.label}</span>
                            </label>
                        ))}
                    </div>

                    {/* ----------- FILTER SECTION ----------- */}
                    <div className="mx-3">

                        {/* ALL */}
                        {InventoryType === 'AlldataWith_Bulk' && (
                            <div className="d-flex mt-3">
                                <div className="col-lg-3 me-2">
                                    <input
                                        type="date"
                                        className="form-control"
                                        max={maxCreatedDate}
                                        value={SearchInput.FromDate}
                                        onChange={(e) =>
                                            SetSearchInput({
                                                ...SearchInput,
                                                FromDate: e.target.value
                                            })
                                        }
                                    />
                                </div>

                                <button
                                    className="btn btn-primary"
                                    onClick={handleSearchDataforAll}
                                >
                                    Generate
                                </button>
                            </div>
                        )}

                        {/* LOCATION */}
                        {InventoryType === 'LocationWise' && (
                            <div className="d-flex flex-wrap mt-3">

                                <div className="col-lg-3 me-2">
                                    <Typeahead
                                        id="location-typeahead"
                                        labelKey="LocationCode"
                                        options={LocationDropDownData}
                                        placeholder="Select Location..."
                                        selected={selectedLocation ? [selectedLocation] : []}
                                        onChange={(selected) => {
                                            if (selected.length > 0) {
                                                setSelectedLocation(selected[0]);
                                                setInputdata(prev => ({
                                                    ...prev,
                                                    LocationRFID: selected[0].LocationRFID
                                                }));
                                            } else {
                                                setSelectedLocation(null);
                                                setInputdata(prev => ({ ...prev, LocationRFID: '' }));
                                            }
                                        }}
                                    />
                                </div>

                                <div className="col-lg-3 me-2">
                                    <input
                                        type="date"
                                        className="form-control"
                                        max={maxCreatedDate}
                                        value={SearchInput.FromDate}
                                        onChange={(e) =>
                                            SetSearchInput({
                                                ...SearchInput,
                                                FromDate: e.target.value
                                            })}
                                    />
                                </div>

                                <button
                                    className="btn btn-primary"
                                    onClick={handleSearchDataforLocation}
                                >
                                    Generate
                                </button>
                            </div>
                        )}

                        {/* FLOOR */}
                        {InventoryType === 'FloorWise' && (
                            <div className="d-flex flex-wrap mt-3">

                                <div className="col-lg-3 me-2">
                                    <Typeahead
                                        id="floor-typeahead"
                                        labelKey="Floor"
                                        options={FloorDropDownData}
                                        placeholder="Select Floor..."
                                        selected={selectedFloor ? [selectedFloor] : []}
                                        onChange={(selected) => {
                                            if (selected.length > 0) {
                                                setSelectedFloor(selected[0]);
                                                setInputdata(prev => ({
                                                    ...prev,
                                                    LocationRFID: selected[0].Floor
                                                }));
                                            } else {
                                                setSelectedFloor(null);
                                                setInputdata(prev => ({ ...prev, LocationRFID: '' }));
                                            }
                                        }}
                                    />
                                </div>

                                <div className="col-lg-3 me-2">
                                    <input
                                        type="date"
                                        className="form-control"
                                        max={maxCreatedDate}
                                        value={SearchInput.FromDate}
                                        onChange={(e) =>
                                            SetSearchInput({
                                                ...SearchInput,
                                                FromDate: e.target.value
                                            })
                                        }
                                    />
                                </div>

                                <button
                                    className="btn btn-primary"
                                    onClick={handleSearchDataforFloor}
                                >
                                    Generate
                                </button>
                            </div>
                        )}

                    </div>
                </CardBody>
            </Card>

            <Row className=" mx-5 d-flex flex-wrap justify-content-center">

                {/* Total Asset */}
                <Col xl={3} lg={inputdata.mode === 'AlldataWith_Bulk' ? 4 : 6} md={6} sm={6} xs={12}>
                    <Card
                        className="border-0 shadow-sm rounded-4 text-dark"
                        style={{
                            background: "linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)",
                            position: "relative",
                            overflow: "hidden",
                            transition: "transform 0.3s ease",
                            cursor: "pointer",
                            padding: "0.5rem 0.75rem",
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-5px)")}
                        onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
                    >
                        {/* Decorative Circle */}
                        <div
                            style={{
                                position: "absolute",
                                top: "-15px",
                                right: "-15px",
                                width: "80px",
                                height: "80px",
                                borderRadius: "50%",
                                background: "linear-gradient(135deg, #0d6efd50, #6f42c150)",
                                zIndex: 0,
                            }}
                        ></div>

                        <Card.Body className="text-center position-relative p-2" style={{ zIndex: 1 }}>
                            {/* Icon Badge */}
                            <div
                                className="mx-auto mb-1 d-flex align-items-center justify-content-center"
                                style={{
                                    width: "40px",
                                    height: "40px",
                                    borderRadius: "50%",
                                    background: "linear-gradient(135deg, #0d6efd, #6f42c1)",
                                    color: "#fff",
                                }}
                            >
                                <FaDatabase size={20} />
                            </div>

                            <h6 className="text-secondary mb-0">
                                {InventoryType === "FloorWise" ? "Floor Wise Total Asset" : "Total Asset"}
                            </h6>
                            <h4 className="fw-bold mb-0">{statusCounts.Total}</h4>
                        </Card.Body>
                    </Card>
                </Col>

                {/* Founded */}
                <Col xl={3} lg={inputdata.mode === 'AlldataWith_Bulk' ? 4 : 6} md={6} sm={6} xs={12}>
                    <Card
                        className="border-0 shadow-sm rounded-4 text-dark"
                        style={{
                            background: "linear-gradient(135deg, #f0fff4 0%, #d1f7e3 100%)",
                            position: "relative",
                            overflow: "hidden",
                            transition: "transform 0.3s ease",
                            cursor: "pointer",
                            padding: "0.5rem 0.75rem",
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-5px)")}
                        onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
                    >
                        <div
                            style={{
                                position: "absolute",
                                top: "-15px",
                                right: "-15px",
                                width: "80px",
                                height: "80px",
                                borderRadius: "50%",
                                background: "linear-gradient(135deg, #28a74550, #20c99750)",
                                zIndex: 0,
                            }}
                        ></div>

                        <Card.Body className="text-center position-relative p-2" style={{ zIndex: 1 }}>
                            <div
                                className="mx-auto mb-1 d-flex align-items-center justify-content-center"
                                style={{
                                    width: "40px",
                                    height: "40px",
                                    borderRadius: "50%",
                                    background: "linear-gradient(135deg, #28a745, #20c997)",
                                    color: "#fff",
                                }}
                            >
                                <FaCheckCircle size={20} />
                            </div>

                            <h6 className="text-secondary mb-0">Founded</h6>
                            <h4 className="fw-bold mb-0">{statusCounts.Matched}</h4>
                        </Card.Body>
                    </Card>
                </Col>

                {/* Not Founded */}
                <Col xl={3} lg={inputdata.mode === 'AlldataWith_Bulk' ? 4 : 6} md={6} sm={6} xs={12}>
                    <Card
                        className="border-0 shadow-sm rounded-4 text-dark"
                        style={{
                            background: "linear-gradient(135deg, #fff5f5 0%, #ffe3e3 100%)",
                            position: "relative",
                            overflow: "hidden",
                            transition: "transform 0.3s ease",
                            cursor: "pointer",
                            padding: "0.5rem 0.75rem",
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-5px)")}
                        onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
                    >
                        <div
                            style={{
                                position: "absolute",
                                top: "-15px",
                                right: "-15px",
                                width: "80px",
                                height: "80px",
                                borderRadius: "50%",
                                background: "linear-gradient(135deg, #dc354550, #ff6b6b50)",
                                zIndex: 0,
                            }}
                        ></div>

                        <Card.Body className="text-center position-relative p-2" style={{ zIndex: 1 }}>
                            <div
                                className="mx-auto mb-1 d-flex align-items-center justify-content-center"
                                style={{
                                    width: "40px",
                                    height: "40px",
                                    borderRadius: "50%",
                                    background: "linear-gradient(135deg, #dc3545, #ff6b6b)",
                                    color: "#fff",
                                }}
                            >
                                <FaTimesCircle size={20} />
                            </div>

                            <h6 className="text-secondary mb-0">Not Founded</h6>
                            <h4 className="fw-bold mb-0">{statusCounts.NotFound}</h4>
                        </Card.Body>
                    </Card>
                </Col>

                {/* MisMatched */}
                <Col
                    xl={3}
                    lg={6}
                    md={6}
                    sm={6}
                    xs={12}
                    style={{ display: inputdata.mode === "LocationWise" || inputdata.mode === "FloorWise" ? "block" : "none" }}
                >
                    <Card
                        className="border-0 shadow-sm rounded-4 text-dark"
                        style={{
                            background: "linear-gradient(135deg, #fff8e1 0%, #ffe8a1 100%)",
                            position: "relative",
                            overflow: "hidden",
                            transition: "transform 0.3s ease",
                            cursor: "pointer",
                            padding: "0.5rem 0.75rem",
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-5px)")}
                        onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
                    >
                        <div
                            style={{
                                position: "absolute",
                                top: "-15px",
                                right: "-15px",
                                width: "80px",
                                height: "80px",
                                borderRadius: "50%",
                                background: "linear-gradient(135deg, #ffc10750, #ffdd5750)",
                                zIndex: 0,
                            }}
                        ></div>

                        <Card.Body className="text-center position-relative p-2" style={{ zIndex: 1 }}>
                            <div
                                className="mx-auto mb-1 d-flex align-items-center justify-content-center"
                                style={{
                                    width: "40px",
                                    height: "40px",
                                    borderRadius: "50%",
                                    background: "linear-gradient(135deg, #ffc107, #ffdd57)",
                                    color: "#fff",
                                }}
                            >
                                <FaExclamationTriangle size={20} />
                            </div>

                            <h6 className="text-secondary mb-0">MisMatched</h6>
                            <h4 className="fw-bold mb-0">{statusCounts.Mismatched}</h4>
                        </Card.Body>
                    </Card>
                </Col>

            </Row>

            <div className='d-flex justify-content-end '>
                <CButton color="primary" className='d-flex' variant='outline' onClick={() => setVisible(true)}>
                    <i className="bi bi-cloud-upload me-1  d-none d-sm-none d-md-block"></i>Export
                </CButton>
            </div>
            <div className='ag-theme-quartz mt-2' style={{ height: "500px" }}>
                <AgGridReact rowData={rowDef} columnDefs={inputdata.mode === 'AlldataWith_Bulk' ? columndef : inputdata.mode === 'LocationWise' ? columndef1 : columndef2} rowSelection={"multiple"} autoGroupColumnDef={autoGroupColumnDef} pagination={pagination} paginationPageSize={paginationPageSize} paginationPageSizeSelector={paginationPageSizeSelector} ref={gridRef} />
            </div>


        </div>
    )
}

AuditScan.propTypes = {
    auth: PropTypes.any.isRequired,
};

export default AuditScan
