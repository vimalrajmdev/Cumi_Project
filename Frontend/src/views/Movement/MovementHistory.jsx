import { CBadge, CNav, CNavItem, CNavLink, CTabContent, CTabPane } from '@coreui/react'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { AgGridReact } from 'ag-grid-react';
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import PropTypes from 'prop-types';
import axios from 'axios';
import { getConfig } from 'src/config';
import Logo from '../../assets/images/Base64/Apple_base64';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import logo from 'src/assets/images/Base64/Apple_base64'; // Can also be base64 string
import Swal from 'sweetalert2';

import ExcelJS from "exceljs";
import autoTable from 'jspdf-autotable';
import { saveAs } from "file-saver";
import { BsBezier2 } from 'react-icons/bs';
import { Card, CardBody, CardHeader } from 'react-bootstrap';

const MovementHistory = ({ auth }) => {
    const API_URL = getConfig().REACT_APP_API_URL;
    const [activeTab, setActiveTab] = useState('MovementPending');
    const [MovementPendingData, setMovementPendingData] = useState([]);
    const [MovementCompletedData, setMovementCompletedData] = useState([]);
    const [loading, setLoading] = useState(false); // Loader state

    const fetchdata = async () => {
        try {
            const alldata = { departmentname: auth.departmentname, mode: 'MovementPending', branchid: auth.branchid, BranchAccess: auth.BranchAccess }
            console.log("🚀 ~ fetchdata ~ alldata:", alldata)
            const response = await axios.post(`${API_URL}/EnrolledAssetInfo`, alldata);
            setMovementPendingData(response.data.send)
        } catch (err) {
            console.log(err)
        }
    }

    const fetchdata1 = async () => {
        try {
            const alldata = { departmentname: auth.departmentname, mode: 'MovementCompleted', branchid: auth.branchid, BranchAccess: auth.BranchAccess }
            console.log("🚀 ~ fetchdata1 ~ alldata:", alldata)
            const response = await axios.post(`${API_URL}/EnrolledAssetInfo`, alldata);
            setMovementCompletedData(response.data.send)
        } catch (err) {
            console.log(err)
        }
    }

    useEffect(() => {

        fetchdata();
        fetchdata1();
        const interval = setInterval(() => {
            fetchdata();
            fetchdata1();
        }, 60000);
        return () => clearInterval(interval);

    }, [])


    // Table for All Asset
    const pagination = true;
    const paginationPageSize = 50;
    const paginationPageSizeSelector = [10, 20, 50];

    const Pendingcolumndef = [
        {
            headerName: "S.No",
            valueGetter: "node.rowIndex + 1",
            width: 90,
            pinned: 'left', headerCheckboxSelection: true, checkboxSelection: true,
        },
        { headerName: "Transfer Type", headerClass: 'agheader', field: "TransferType", filter: true, floatingFilter: true },
        { headerName: "Asset Id", headerClass: 'agheader', field: "AssetID", filter: true, floatingFilter: true },
        { headerName: "Asset Name", headerClass: 'agheader', field: "AssetName", filter: true, floatingFilter: true },
        { headerName: "Asset Type", headerClass: 'agheader', field: "AssetType", filter: true, floatingFilter: true },
        { headerName: "RFID Number", headerClass: 'agheader', field: "AssetRFID", filter: true, floatingFilter: true },
        { headerName: "Brand", headerClass: 'agheader', field: "Brand", filter: true, floatingFilter: true },
        { headerName: "Model", headerClass: 'agheader', field: "Model", filter: true, floatingFilter: true },
        { headerName: "Category", headerClass: 'agheader', field: "Category", filter: true, floatingFilter: true },
        { headerName: "Sub Category", headerClass: 'agheader', field: "SubCategory", filter: true, floatingFilter: true },
        { headerName: "Allocated Status", headerClass: 'agheader', field: "AllocatedStatus", filter: true, floatingFilter: true },
        { headerName: "Location RFID", headerClass: 'agheader', field: "LocationRFID", filter: true, floatingFilter: true },
        { headerName: "VendorName", headerClass: 'agheader', field: "VendorName", filter: true, floatingFilter: true },
        { headerName: "Employee ID", headerClass: 'agheader', field: "EmployeeID", filter: true, floatingFilter: true },
        { headerName: "Employee RFID", headerClass: 'agheader', field: "EmployeeRFID", filter: true, floatingFilter: true },
        { headerName: "Employee Name", headerClass: 'agheader', field: "EmployeeName", filter: true, floatingFilter: true },
        { headerName: "Transferred by", headerClass: 'agheader', field: "Transferredby", filter: true, floatingFilter: true },
        {
            headerName: "Transfered Date", headerClass: 'agheader', field: "TransferCreatedDate",
            valueGetter: (params) => {
                const date = params.data.TransferCreatedDate;
                if (!date) return '-';
                const d = new Date(date);
                const yyyy = d.getUTCFullYear();
                const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
                const dd = String(d.getUTCDate()).padStart(2, '0');
                const hh = String(d.getUTCHours()).padStart(2, '0');
                const mi = String(d.getUTCMinutes()).padStart(2, '0');
                const ss = String(d.getUTCSeconds()).padStart(2, '0');
                const ms = String(d.getUTCMilliseconds()).padStart(3, '0');
                return `${dd}-${mm}-${yyyy} ${hh}:${mi}:${ss}`;
            },
        },
        // { headerName: "Transfered Date", headerClass: 'agheader', field: "TransferCreatedDate", filter: true, floatingFilter: true },
        { headerName: "Aging Days", headerClass: 'agheader', field: "TransferAgingDays", filter: true, floatingFilter: true },
        { headerName: "Remarks", headerClass: 'agheader', field: "TransferRemarks", filter: true, floatingFilter: true }
    ]

    const Completedcolumndef = [
        {
            headerName: "S.No",
            valueGetter: "node.rowIndex + 1",
            width: 90,
            pinned: 'left', headerCheckboxSelection: true, checkboxSelection: true,
        },
        { headerName: "Transfer Type", headerClass: 'agheader', field: "TransferType", filter: true, floatingFilter: true },
        { headerName: "Asset Id", headerClass: 'agheader', field: "AssetID", filter: true, floatingFilter: true },
        { headerName: "Asset Name", headerClass: 'agheader', field: "AssetName", filter: true, floatingFilter: true },
        { headerName: "Asset Type", headerClass: 'agheader', field: "AssetType", filter: true, floatingFilter: true },
        { headerName: "RFID Number", headerClass: 'agheader', field: "AssetRFID", filter: true, floatingFilter: true },
        { headerName: "Brand", headerClass: 'agheader', field: "Brand", filter: true, floatingFilter: true },
        { headerName: "Model", headerClass: 'agheader', field: "Model", filter: true, floatingFilter: true },
        { headerName: "Category", headerClass: 'agheader', field: "Category", filter: true, floatingFilter: true },
        { headerName: "Sub Category", headerClass: 'agheader', field: "SubCategory", filter: true, floatingFilter: true },
        { headerName: "Allocated Status", headerClass: 'agheader', field: "AllocatedStatus", filter: true, floatingFilter: true },
        { headerName: "Location RFID", headerClass: 'agheader', field: "LocationRFID", filter: true, floatingFilter: true },
        { headerName: "VendorName", headerClass: 'agheader', field: "VendorName", filter: true, floatingFilter: true },
        { headerName: "Employee ID", headerClass: 'agheader', field: "EmployeeID", filter: true, floatingFilter: true },
        { headerName: "Employee RFID", headerClass: 'agheader', field: "EmployeeRFID", filter: true, floatingFilter: true },
        { headerName: "Employee Name", headerClass: 'agheader', field: "EmployeeName", filter: true, floatingFilter: true },
        { headerName: "Transferred by", headerClass: 'agheader', field: "Transferredby", filter: true, floatingFilter: true },
        {
            headerName: "Transfered Date", headerClass: 'agheader', field: "TransferCreatedDate",
            valueGetter: (params) => {
                const date = params.data.TransferCreatedDate;
                if (!date) return '-';
                const d = new Date(date);
                const yyyy = d.getUTCFullYear();
                const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
                const dd = String(d.getUTCDate()).padStart(2, '0');
                const hh = String(d.getUTCHours()).padStart(2, '0');
                const mi = String(d.getUTCMinutes()).padStart(2, '0');
                const ss = String(d.getUTCSeconds()).padStart(2, '0');
                const ms = String(d.getUTCMilliseconds()).padStart(3, '0');
                return `${dd}-${mm}-${yyyy} ${hh}:${mi}:${ss}`;
            },
        },
        { headerName: "Aging Days", headerClass: 'agheader', field: "TransferAgingDays", filter: true, floatingFilter: true },
        { headerName: "Received by", headerClass: 'agheader', field: "Receivedby", filter: true, floatingFilter: true },
        { headerName: "Received Date", headerClass: 'agheader', field: "ReceivedDate", filter: true, floatingFilter: true }


    ]

    const autoGroupColumnDef = useMemo(() => {
        return {
            headerCheckboxSelection: true,
            field: "id",
            minWidth: 130,
            cellRendererParams: {
                checkbox: true,
            },
        };
    }, []);

    // Download Excel
    const gridRef = useRef(null);
    const gridRef1 = useRef(null);

    const downloadpending = async () => {
        const columnDefs = [
            { header: "S.No", key: "S.No" },
            { header: "Transfer Type", key: "TransferType" },
            { header: "Asset Id", key: "AssetID" },
            { header: "Asset Name", key: "AssetName" },
            { header: "Asset Type", key: "AssetType" },
            { header: "RFID Number", key: "AssetRFID" },
            { header: "Brand", key: "Brand" },
            { header: "Model", key: "Model" },
            { header: "Category", key: "Category" },
            { header: "Sub Category", key: "SubCategory" },
            { header: "Allocated Status", key: "AllocatedStatus" },
            { header: "Location RFID", key: "LocationRFID" },
            { header: "VendorName", key: "VendorName" },
            { header: "Employee ID", key: "EmployeeID" },
            { header: "Employee RFID", key: "EmployeeRFID" },
            { header: "Employee Name", key: "EmployeeName" },
            { header: "Transferred by", key: "Transferredby" },
            { header: "Transfered Date", key: "TransferCreatedDate" },
            { header: "Aging Days", key: "TransferAgingDays" },
            { header: "Remarks", key: "TransferRemarks" }
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


        // Create Excel file
        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet("Movement Pending");

        sheet.views = [{ showGridLines: false }];

        const now = new Date();
        const formattedDate = now.toLocaleDateString("en-IN");

        // ⭐ TITLE
        sheet.mergeCells(1, 1, 1, columnDefs.length);
        const titleCell = sheet.getCell("A1");
        titleCell.value = `MOVEMENT PENDING- ${formattedDate}`;
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
        rowData.forEach((row, index) => {
            const rowValues = columnDefs.map((c) => {
                if (c.header === "S.No") {
                    return index + 1; // Serial Number
                }
                let v = row[c.key];

                // Format DOB & DOJ
                if (c.key === "TransferCreatedDate") {
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
        saveAs(new Blob([buffer]), "Movement Pending.xlsx");
    };

    const downloadcomplet = async () => {
        const columnDefs = [
            { header: "S.No", key: "S.No" },
            { header: "Transfer Type", key: "TransferType" },
            { header: "Asset Id", key: "AssetID" },
            { header: "Asset Name", key: "AssetName" },
            { header: "Asset Type", key: "AssetType" },
            { header: "RFID Number", key: "AssetRFID" },
            { header: "Brand", key: "Brand" },
            { header: "Model", key: "Model" },
            { header: "Category", key: "Category" },
            { header: "Sub Category", key: "SubCategory" },
            { header: "Allocated Status", key: "AllocatedStatus" },
            { header: "Location RFID", key: "LocationRFID" },
            { header: "VendorName", key: "VendorName" },
            { header: "Employee ID", key: "EmployeeID" },
            { header: "Employee RFID", key: "EmployeeRFID" },
            { header: "Employee Name", key: "EmployeeName" },
            { header: "Transferred by", key: "Transferredby" },
            { header: "Transfered Date", key: "TransferCreatedDate" },
            { header: "Aging Days", key: "TransferAgingDays" },
            { header: "Received by", key: "Receivedby" },
            { header: "Received Date", key: "ReceivedDate" },
        ];
        const rowData = [];
        gridRef1.current.api.forEachNode((node) => rowData.push(node.data));

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

        // Create Excel file
        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet("Movement Completed");

        sheet.views = [{ showGridLines: false }];

        const now = new Date();
        const formattedDate = now.toLocaleDateString("en-IN");

        // ⭐ TITLE
        sheet.mergeCells(1, 1, 1, columnDefs.length);
        const titleCell = sheet.getCell("A1");
        titleCell.value = `MOVEMENT COMPLETED- ${formattedDate}`;
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
        rowData.forEach((row, index) => {
            const rowValues = columnDefs.map((c) => {
                if (c.header === "S.No") {
                    return index + 1; // Serial Number
                }
                let v = row[c.key];

                // Format DOB & DOJ
                if (c.key === "TransferCreatedDate") {
                    return formatDate(v);
                }

                // Remove time from ISO date if exists (2025-11-10T00:00:00)
                // if (typeof v === "string" && v.includes("T")) {
                //     v = v.split("T")[0];
                // }

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
        saveAs(new Blob([buffer]), "Movement Completed.xlsx");
    };

    //pdf
    const PDFForPending = async (selectedDate) => {
        setLoading(true);
        await new Promise(resolve => setTimeout(resolve, 0));

        const filteredData = gridRef.current.api.getModel().rowsToDisplay.map(rowNode => rowNode.data);

        const doc = new jsPDF({ orientation: "landscape", format: 'a3' });
        const title = 'Movement Pending';

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
            'S.No',
            'Transfer Type',
            'Asset Id',
            'Asset Name',
            'Asset Type',
            'RFID Number',
            'Brand',
            'Model',
            'Category',
            'Sub Category',
            'Allocated Status',
            'Location RFID',
            'VendorName',
            'Employee ID',
            'Employee RFID',
            'Employee Name',
            'Transferred by',
            'Transfered Date',
            'Aging Days',
            'Remarks'
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
            item.TransferType || "-",
            item.AssetID || "-",
            item.AssetName || "-",
            item.AssetType || "-",
            item.AssetRFID || "-",
            item.Brand || "-",
            item.Model || "-",
            item.Category || "-",
            item.SubCategory || "-",
            item.AllocatedStatus || "-",
            item.LocationRFID || "-",
            item.VendorName || "-",
            item.EmployeeID || "-",
            item.EmployeeRFID || "-",
            item.EmployeeName || "-",
            item.Transferredby || "-",
            formatDate(item.TransferCreatedDate) || "-",
            item.TransferAgingDays || "-",
            item.TransferRemarks || "-",

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
            doc.save("Movement Pending.pdf");
        } else {
            Swal.fire("No data available to export", "", "warning");
        }
        setLoading(false);
    };
    //end pdf

    //pdf
    const PDFForCompleted = async (selectedDate) => {
        setLoading(true);
        await new Promise(resolve => setTimeout(resolve, 0));

        const filteredData = gridRef1.current.api.getModel().rowsToDisplay.map(rowNode => rowNode.data);

        const doc = new jsPDF({ orientation: "landscape", format: 'a3' });
        const title = 'Movement Completed Report';

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
            'S.No',
            'Transfer Type',
            'Asset Id',
            'Asset Name',
            'Asset Type',
            'RFID Number',
            'Brand',
            'Model',
            'Category',
            'Sub Category',
            'Allocated Status',
            'Location RFID',
            'VendorName',
            'Employee ID',
            'Employee RFID',
            'Employee Name',
            'Transferred by',
            'Transfered Date',
            'Aging Days',
            'Received by',
            'Received Date'
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
            item.TransferType || "-",
            item.AssetID || "-",
            item.AssetName || "-",
            item.AssetType || "-",
            item.AssetRFID || "-",
            item.Brand || "-",
            item.Model || "-",
            item.Category || "-",
            item.SubCategory || "-",
            item.AllocatedStatus || "-",
            item.LocationRFID || "-",
            item.VendorName || "-",
            item.EmployeeID || "-",
            item.EmployeeRFID || "-",
            item.EmployeeName || "-",
            item.Transferredby || "-",
            formatDate(item.TransferCreatedDate) || "-",
            item.TransferAgingDays || "-",
            item.Receivedby || "-",
            item.ReceivedDate || "-",
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

            doc.save("Movement Completed Report.pdf");
        } else {
            Swal.fire("No data available to export", "", "warning");
        }
        setLoading(false);
    };
    //end pdf

    const PendingCount = MovementPendingData.length;
    const CompletedCount = MovementCompletedData.length;

    return (
        <>
            <Card>
                <div className="card-header pro-header p-1">
                    <div className="d-flex justify-content-center align-items-center">
                        {/* Center Title */}
                        <div className="text-center" >
                            <h3 className='text-white'>  <BsBezier2 className="fs-3 me-1" />  Movement History</h3>
                        </div>
                    </div>
                </div>

                <CardBody>
                    <CNav variant="tabs" role="tablist" className="position-relative mt-3">

                        {/* Pending Asset */}
                        <CNavItem className="position-relative mx-2" >
                            <CNavLink
                                active={activeTab === 'MovementPending'}
                                onClick={() => setActiveTab('MovementPending')}
                                className={activeTab === 'MovementPending' ? 'active-tab' : ''}
                                style={{ cursor: 'pointer' }}
                            >
                                Pending
                                <CBadge color="danger" className="ms-2">
                                    {PendingCount}  {/* <- count value */}
                                </CBadge>
                            </CNavLink>
                        </CNavItem>

                        {/* Completed Assets */}
                        <CNavItem className="position-relative  mx-2">
                            <CNavLink
                                active={activeTab === 'MovementCompleted'}
                                onClick={() => setActiveTab('MovementCompleted')}
                                className={activeTab === 'MovementCompleted' ? 'active-tab' : ''}
                                style={{ cursor: 'pointer' }}
                            >
                                Completed
                                <CBadge color="danger" className="ms-2">
                                    {CompletedCount}  {/* <- count value */}
                                </CBadge>
                            </CNavLink>
                        </CNavItem>

                    </CNav>

                    <div className='text-end'>
                        <button className="btn btn-outline-success mt-3"
                            data-bs-toggle="modal" data-bs-target="#exampleModal"
                        >
                            <i className="bi bi-cloud-upload me-1"></i>Export
                        </button>
                    </div>

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
                                        <div className="btn btn-success" onClick={() => {
                                            if (activeTab === 'MovementPending') {
                                                downloadpending()
                                            } else {
                                                downloadcomplet()
                                            }
                                        }}>
                                            <i className="bi bi-file-earmark-spreadsheet fs-1"></i>
                                        </div>
                                        <div className="btn btn-danger"
                                            onClick={() => {
                                                if (activeTab === 'MovementPending') {
                                                    PDFForPending()
                                                } else {
                                                    PDFForCompleted()
                                                }
                                            }}
                                        >
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
                    {/*  */}


                    <CTabContent>

                        <CTabPane visible={activeTab === 'MovementPending'}>
                            <>
                                <div className='mt-3 card'>
                                    <div style={{ height: "500px" }} className='ag-theme-quartz'>
                                        <AgGridReact ref={gridRef} rowData={MovementPendingData} columnDefs={Pendingcolumndef} rowSelection={"multiple"} autoGroupColumnDef={autoGroupColumnDef} pagination={pagination} paginationPageSize={paginationPageSize} paginationPageSizeSelector={paginationPageSizeSelector} getRowHeight={() => 65} />
                                    </div>
                                </div>
                            </>
                        </CTabPane>

                        <CTabPane visible={activeTab === 'MovementCompleted'}>
                            <>
                                <div className='mt-3 card'>
                                    <div style={{ height: "500px" }} className='ag-theme-quartz'>
                                        <AgGridReact ref={gridRef1} rowData={MovementCompletedData} columnDefs={Completedcolumndef} rowSelection={"multiple"} autoGroupColumnDef={autoGroupColumnDef} pagination={pagination} paginationPageSize={paginationPageSize} paginationPageSizeSelector={paginationPageSizeSelector} getRowHeight={() => 65} />
                                    </div>
                                </div>
                            </>
                        </CTabPane>

                    </CTabContent>

                </CardBody>
            </Card>
        </>
    )
}

MovementHistory.propTypes = {
    auth: PropTypes.any.isRequired,
};

export default MovementHistory
