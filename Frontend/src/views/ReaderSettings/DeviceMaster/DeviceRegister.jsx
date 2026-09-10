import React, { useMemo, useState, useEffect, useRef, useContext } from 'react'
import { AgGridReact } from 'ag-grid-react';
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import axios from 'axios';
import Swal from 'sweetalert2';
import swal from 'sweetalert';
import { Row, Col, Card, CardHeader, CardBody } from 'react-bootstrap';
// import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { Link } from 'react-router-dom';
// import { Modal } from 'bootstrap';
import { getConfig } from 'src/config';
// import secureLocalStorage from "react-secure-storage";
import PropTypes from 'prop-types';
import { BallTriangle } from 'react-loader-spinner';
import { useLocation } from "react-router-dom";
import { Typeahead } from 'react-bootstrap-typeahead';
import logo from 'src/assets/images/Base64/Apple_base64'; // Can also be base64 string
import { CButton } from '@coreui/react';
import ExcelJS from "exceljs";
import autoTable from 'jspdf-autotable';
import { saveAs } from "file-saver";
import { FaEdit, FaTrash } from 'react-icons/fa';
import { IoEye } from 'react-icons/io5';
import { right } from '@popperjs/core';
import { DeviceHub } from '@mui/icons-material';
const RegisterAssetTable = ({ auth }) => {
    const [Uploadvisible, setUploadvisible] = useState(false)
    const [uploadxl, setuploadxl] = useState(false)
    const [loading, setLoading] = useState(false); // Loader state
    const location = useLocation();
    const API_URL = getConfig().REACT_APP_API_URL;
    let pageData = location.state?.pageData;
    if (!pageData) {
        // Fallback to local storage if available
        const storedData = secureLocalStorage.getItem('pageData');
        pageData = storedData || {};
    }
    const [Register, setRegister] = useState(
        {
            SequenceNo: ''
            , BranchID: auth.branchid
            , DeviceID: ''
            , DeviceName: ''
            , Floor: ''
            , IPaddress: ''
            , MACaddress: ''
            , MachineID: ''
            , DeviceType: ''
            , ReaderType: ''
            , AllowDoorLock: ''
            , LockDoor: ''
            , Alarm: ''
            , ManufactureName: ''
            , LastSeqNumber: ''
            , Active: ''
            , AntennaID: ''
            , RoomType: ''
            , mode: ''
        }
    )
    const [isModalVisible, setIsModalVisible] = useState(false);

    const pagination = true;
    const paginationPageSize = 10;
    const paginationPageSizeSelector = [10, 50, 100];

    const [view, setview] = useState([]);
    const handleView = async (SequenceNo) => {
        try {
            const alldata = {
                SequenceNo, mode: 'E', BranchID: '', DeviceID: '', DeviceName: '', Floor: '', IPaddress: '', MACaddress: '', MachineID: ''
                , DeviceType: '', ReaderType: '', AllowDoorLock: '', LockDoor: '', Alarm: '', ManufactureName: '', LastSeqNumber: '', Active: '', AntennaID: '', RoomType: ''
            }
            console.log(alldata)
            const response = await axios.post(`${API_URL}/DeviceRegisterInfo`, alldata);
            console.log(response.data)
            setRegister(...response.data)


        }
        catch (error) {
            console.log(error)
        }
    }
    //pdf
    const handlepdf = async (selectedDate) => {
        setLoading(true);
        await new Promise(resolve => setTimeout(resolve, 0));

        const filteredData = gridRef.current.api.getModel().rowsToDisplay.map(rowNode => rowNode.data);

        const doc = new jsPDF({ orientation: "portrait", format: 'a2' });
        const title = 'Device Register';

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
            'Sequence No',
            'Branch ID',
            'Device ID',
            'Device Name',
            'Floor',
            'Reader IP',
            'MAC Address',
            'Device Type',
            'Reader Type',
            'Allow Door Lock',
            'Lock Door',
            'Alarm',
            'Manufacture Name',
            'Last Seq Number',
            'Active',
            'Antenna ID',
            'Room Type'];

        // ✅ Match field names from API / grid (case-sensitive!)
        const bodyData = filteredData.map(item => [
            item.SequenceNo || "-",
            item.BranchID || "-",
            item.DeviceID || "-",
            item.DeviceName || "-",
            item.Floor || "-",

            item.IPaddress || "-",       // Reader IP
            item.MACaddress || "-",
            item.DeviceType || "-",
            item.ReaderType || "-",
            item.AllowDoorLock || "-",
            item.LockDoor || "-",
            item.Alarm || "-",
            item.ManufactureName || "-",
            item.LastSeqNumber || "-",
            item.Active || "-",
            item.AntennaID || "-",
            item.RoomType || "-",

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

            doc.save("Device Register.pdf");
        } else {
            Swal.fire("No data available to export", "", "warning");
        }
        setLoading(false);
    };
    //end pdf
    const ViewRenderer = (params) => {
        if ((pageData.viewstatus === null || pageData.viewstatus === 'i') && auth.UserStatus === 'A') {
            return null; // Hide the button by returning null
        }
        return (
            <div>
                <button
                    className="border-0 mt-1 rounded-circle d-flex justify-content-center align-items-center"
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
                    onClick={() => handleView(params.data.SequenceNo)}
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

    const handleEdit = async (SequenceNo) => {
        try {
            const alldata = {
                SequenceNo, mode: 'E', BranchID: '', DeviceID: '', DeviceName: '', Floor: '', IPaddress: '', MACaddress: '', MachineID: ''
                , DeviceType: '', ReaderType: '', AllowDoorLock: '', LockDoor: '', Alarm: '', ManufactureName: '', LastSeqNumber: '', Active: '', AntennaID: '', RoomType: ''
            }
            console.log(alldata)
            const response = await axios.post(`${API_URL}/DeviceRegisterInfo`, alldata);
            console.log(response.data)
            setRegister(...response.data)

        } catch (error) {
            console.error('ERROR EDITING RECORD:', error);
            throw error;
        }
    }
    const EditRenderer = (params) => {
        if ((pageData.editstatus === null || pageData.editstatus === 'i') && auth.UserStatus === 'A') {
            return null; // Hide the button by returning null
        }
        return <div>
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
                onClick={() => handleEdit(params.data.SequenceNo)}
                data-bs-toggle="modal"
                data-bs-target="#exampleModalEdit"
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
        </div>

    }

    // Update Details
    //   Submit Updated Details
    const handlechange = async (e) => {
        setLoading(true)
        try {
            const alldata = { ...Register, AllowDoorLock: '', LockDoor: '', Alarm: '', LastSeqNumber: '', Active: '', UpdatedBy: auth.empid, mode: 'U' }
            // console.log(alldata)
            const response = await axios.post(`${API_URL}/DeviceRegisterInfo`, alldata)
            if (response.status === 200) {
                setLoading(false)
                fetchData();
                Swal.fire({
                    title: 'Updated',
                    text: 'Updated Successfully',
                    icon: 'success',
                    confirmButtonText: 'Done'
                })
                return
            }
        }
        catch (err) {
            console.log(err)
        }
    }
    // Edit End
    const [rowData, setRowData] = useState([]);
    const fetchData = async () => {
        setLoading(true)
        const alldata = {
            mode: 'FetchDevice', SequenceNo: '', BranchID: '', DeviceID: '', DeviceName: '', Floor: '', IPaddress: '', MACaddress: '', MachineID: ''
            , DeviceType: '', ReaderType: '', AllowDoorLock: '', LockDoor: '', Alarm: '', ManufactureName: '', LastSeqNumber: '', Active: ''
            , AntennaID: '', RoomType: ''
        }
        try {
            const response = await axios.post(`${API_URL}/DeviceRegisterInfo`, alldata);
            setRowData(response.data);
            console.log(response.data)
            if (response.status === 200) {
                setLoading(false)
            }
        } catch (error) {
            setLoading(false)
            console.error('Error fetching user details:', error);
        }
    };
    const DeleteRenderer = (params) => {
        if ((pageData.deletestatus === null || pageData.deletestatus === 'i') && auth.UserStatus === 'A') {
            return null; // Hide the button by returning null
        }
        return <div>
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
                onClick={() => handleDelete(params.data)}
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
        </div>
    }

    const handleDelete = async (data) => {
        const result = await Swal.fire({
            title: "Are you sure?",
            text: "Once deleted, you will not be able to recover the data!",
            icon: "warning",
            showCancelButton: true,
            cancelButtonText: 'Cancel',
            confirmButtonText: 'Delete',
        });
        if (result.isConfirmed) {
            setLoading(true)
            try {
                const alldata = { ...data, mode: 'D' }
                console.log(alldata)
                const response = await axios.post(`${API_URL}/DeviceRegisterInfo`, alldata)
                if (response.status === 200) {
                    fetchData();
                    setLoading(false)
                    Swal.fire({
                        title: 'Deleted',
                        text: 'Deleted Successfully',
                        icon: 'success',
                        confirmButtonText: 'Done'
                    })
                    return
                }
            } catch (error) {
                console.error('ERROR DELETING RECORD:', error);
                throw error;
            }
        }
    }
    const columdef = [
        { headerCheckboxSelection: true, checkboxSelection: true, width: 50 },
        { header: "Sequence No", headerClass: 'agheader', field: "SequenceNo", filter: true, floatingFilter: true, editable: true, editable: true },
        { header: "Branch ID", headerClass: 'agheader', field: "BranchID", filter: true, floatingFilter: true, editable: true },
        { header: "Device ID", headerClass: 'agheader', field: "DeviceID", filter: true, floatingFilter: true, editable: true },
        { header: "Device Name", headerClass: 'agheader', field: "DeviceName", filter: true, floatingFilter: true, editable: true },
        { header: "Floor", headerClass: 'agheader', field: "Floor", filter: true, floatingFilter: true, editable: true },
        { header: "IP address", headerClass: 'agheader', field: "IPaddress", filter: true, floatingFilter: true, editable: true },
        { header: "MAC address", headerClass: 'agheader', field: "MACaddress", filter: true, floatingFilter: true, editable: true },
        // { header: "MachineID", field: "MachineID", filter: true, floatingFilter: true, editable: true },
        { header: "Device Type", headerClass: 'agheader', field: "DeviceType", filter: true, floatingFilter: true, editable: true },
        { header: "Reader Type", headerClass: 'agheader', field: "ReaderType", filter: true, floatingFilter: true, editable: true },
        { header: "Allow Door Lock", headerClass: 'agheader', field: "AllowDoorLock", filter: true, floatingFilter: true, editable: true },
        { header: "Lock Door", headerClass: 'agheader', field: "LockDoor", filter: true, floatingFilter: true, editable: true },
        { header: "Alarm", headerClass: 'agheader', field: "Alarm", filter: true, floatingFilter: true, editable: true },
        { header: "Manufacture Name", headerClass: 'agheader', field: "ManufactureName", filter: true, floatingFilter: true, editable: true },
        { header: "Last SeqNumber", headerClass: 'agheader', field: "LastSeqNumber", filter: true, floatingFilter: true, editable: true },
        { header: 'Active', headerClass: 'agheader', field: 'Active', filter: true, floatingFilter: true, editable: true },
        { header: 'Antenna ID', headerClass: 'agheader', field: 'AntennaID', filter: true, floatingFilter: true, editable: true },
        { header: "Room Type", headerClass: 'agheader', field: "RoomType", filter: true, floatingFilter: true, editable: true },
        {
            header: "Created Date", headerClass: 'agheader', field: "Createddate",
            valueGetter: (params) => {
                const date = params.data.Createddate;
                if (!date) return '-';
                const d = new Date(date);
                const yyyy = d.getUTCFullYear();
                const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
                const dd = String(d.getUTCDate()).padStart(2, '0');
                const hh = String(d.getUTCHours()).padStart(2, '0');
                const mi = String(d.getUTCMinutes()).padStart(2, '0');
                const ss = String(d.getUTCSeconds()).padStart(2, '0');
                const ms = String(d.getUTCMilliseconds()).padStart(3, '0');
                return `${dd}-${mm}-${yyyy}`;
                // return `${dd}-${mm}-${yyyy} ${hh}:${mi}:${ss}`;
            },
        },
        {
            header: "Created By", headerClass: 'agheader', field: "Createdby",
            valueGetter: (params) => {
                const value = params.data?.Createdby;
                return value || "-";
            }
        },
        {
            header: "Last Modified Date", headerClass: 'agheader', field: "Updateddate",
            valueGetter: (params) => {
                const date = params.data.Updateddate;
                if (!date) return '-';
                const d = new Date(date);
                const yyyy = d.getUTCFullYear();
                const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
                const dd = String(d.getUTCDate()).padStart(2, '0');
                const hh = String(d.getUTCHours()).padStart(2, '0');
                const mi = String(d.getUTCMinutes()).padStart(2, '0');
                const ss = String(d.getUTCSeconds()).padStart(2, '0');
                const ms = String(d.getUTCMilliseconds()).padStart(3, '0');
                return `${dd}-${mm}-${yyyy}`;
                // return `${dd}-${mm}-${yyyy} ${hh}:${mi}:${ss}`;
            },
        },
        {
            header: "Last Modified By", headerClass: 'agheader', field: "updateby",
            valueGetter: (params) => {
                const value = params.data?.updateby;
                return value || "-";
            }
        },
        { header: "View", pinned: right, headerClass: 'agheader', field: "View", cellRenderer: ViewRenderer, width: 80 },
        { header: pageData.editstatus === null || pageData.editstatus === 'i' ? '' : 'Edit', field: "Edit", pinned: right, headerClass: 'agheader', cellRenderer: EditRenderer, width: 80 },
        { header: "Delete", headerClass: 'agheader', field: "Delete", cellRenderer: DeleteRenderer, pinned: right, width: 90 },
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


    // Download PDF Format END
    const gridRef = useRef(null);
    const downloadExcel = async () => {
        const columnDefs = [
            { header: "Sequence No", key: "SequenceNo" },
            { header: "Branch ID", key: "BranchID" },
            { header: "Device ID", key: "DeviceID" },
            { header: "Device Name", key: "DeviceName" },
            { header: "Floor", key: "Floor" },
            { header: "IP Address", key: "IPaddress" },
            { header: "MAC Address", key: "MACaddress" },
            { header: "Device Type", key: "DeviceType" },
            { header: "Reader Type", key: "ReaderType" },
            { header: "Allow Door Lock", key: "AllowDoorLock" },
            { header: "Lock Door", key: "LockDoor" },
            { header: "Alarm", key: "Alarm" },
            { header: "Manufacture Name", key: "ManufactureName" },
            { header: "Last Seq Number", key: "LastSeqNumber" },
            { header: "Active", key: "Active" },
            { header: "Antenna ID", key: "AntennaID" },
            { header: "Room Type", key: "RoomType" },
            { header: "Created Date", key: "Createddate", },
            { header: "Created By", key: "Createdby", },
            {
                header: "Last Modified Date", key: "Updateddate",
            },
            {
                header: "Last Modified By", key: "updateby",
            },
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
        const sheet = workbook.addWorksheet("Device Register");

        sheet.views = [{ showGridLines: false }];

        const now = new Date();
        const formattedDate = now.toLocaleDateString("en-IN");

        // ⭐ TITLE
        sheet.mergeCells(1, 1, 1, columnDefs.length);
        const titleCell = sheet.getCell("A1");
        titleCell.value = `DEVICE REGISTER - ${formattedDate}`;
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
        saveAs(new Blob([buffer]), "Device Register.xlsx");
    };

    useEffect(() => {
        if (isModalVisible && inputRef.current) {
            inputRef.current.focus();
        }
        fetchData();
        // FetchMachine() disabled: /OEEReport does not exist in this backend
        // (leftover from the OEE project) — the call always 404'd and the
        // Machine dropdown stayed empty either way.

    }, [isModalVisible])

    const [Machinedropdown, SetMachinedropdown] = useState([])
    const FetchMachine = async () => {
        try {
            const alldata = { FromDate: '', ToDate: '', Machineid: '', ShiftEndTime: '', ShiftStartTime: '', Plant: '', mode: 'fetchMachine' };
            const response = await axios.post(`${API_URL}/OEEReport`, alldata);
            console.log("Machine Details:", response.data);
            SetMachinedropdown(response.data);

        } catch (err) {
            console.error("Error fetching data:", err);
        }
    };


    // Handle Import
    const handleUploadExcelSheet = (e) => {
        const selectedFile = e.target.files[0];

        if (selectedFile) {
            const fileName = selectedFile.name;
            const fileExtension = fileName.split('.').pop().toLowerCase();

            if (fileExtension === 'csv' || fileExtension === 'xls' || fileExtension === 'xlsx') {
                setuploadxl(selectedFile);
            } else {
                Swal.fire({
                    title: 'Invalid File Format',
                    text: 'Please select a valid CSV or Excel file format.',
                    icon: 'warning'
                });
                setuploadxl(null);
                e.target.value = null; // Clear the file input field
            }
        }
    };
    const handleUploadData = async () => {
        if (!uploadxl) {
            Swal.fire({
                text: 'Please Select Upload File',
                icon: 'warning',
            });
            return;
        }

        const result = await Swal.fire({
            title: "Are you sure?",
            text: "Once uploaded, you will not be able to check the user list immediately!",
            icon: "warning",
            showCancelButton: true,
            cancelButtonText: 'Cancel',
            confirmButtonText: 'Upload',
        });

        setLoading(true);


        if (result.isConfirmed) {

            try {
                const formData = new FormData();
                formData.append('file', uploadxl);
                formData.append('CreatedBy', auth.empid)
                const response = await axios.post(`${API_URL}/DeveiceMasterUpload`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });

                const { message, uploadcount, unuploadedFilePath } = response.data;
                // console.log(response.data)
                if (unuploadedFilePath) {


                    fetchData()
                    swal({
                        heightAuto: true,
                        title: `Total Uploaded File Count: ${uploadcount}`,
                        text: "Some data could not be uploaded. Please download the file to see the errors.",
                        icon: 'warning',
                        buttons: {
                            cancel: "OK",
                            download: {
                                text: "Download File",
                                value: "download",
                            },
                        },
                    }).then((value) => {
                        if (value === "download") {
                            const link = document.createElement('a');
                            // console.log(unuploadedFilePath)
                            link.href = `${API_URL}${unuploadedFilePath}`;
                            link.setAttribute('download', 'unuploaded_Device_data.xlsx');
                            document.body.appendChild(link);
                            link.click();
                            link.parentNode.removeChild(link);
                        }
                    });
                } else {

                    fetchData()

                    Swal.fire({
                        title: `Total Uploaded File Count: ${uploadcount}`,
                        text: 'All data uploaded successfully',
                        icon: 'success',
                    });
                }
            } catch (err) {
                console.error(err);
                setLoading(false);
                Swal.fire({
                    title: 'Please Upload Valid File',
                    icon: 'error',
                });
            } finally {
                setUploadvisible(false);
                setLoading(false);
            }
        }
    };
    return (
        <>

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
                            wrapperclassName=""
                            visible={true}
                        />)

                    </div>
                </div>
            )}


            <div >


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
                                    <div className="btn btn-success" onClick={downloadExcel}>
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

                {/* <!-- Modal for View Asset --> */}
                <div className="modal fade" id="exampleModalView" aria-labelledby="exampleModalLabel" >
                    <div className="modal-dialog modal-xl">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h1 className="modal-title fs-5" id="exampleModalLabel">Device Information</h1>
                                <button type="button" className="btn-close" data-bs-dismiss="modal"></button>
                            </div>
                            <div className="modal-body">

                                <div className=" row ">

                                    <div className="col-lg-3">
                                        <label>Device ID</label>
                                        <input className='form-control' onChange={(e) => setRegister({ ...Register, DeviceID: e.target.value })} value={Register.DeviceID} disabled />
                                    </div>
                                    <div className="col-lg-3">
                                        <label>Device Name</label>
                                        <input className='form-control' onChange={(e) => setRegister({ ...Register, DeviceName: e.target.value })} value={Register.DeviceName} disabled />
                                    </div>
                                    <div className="col-lg-3">
                                        <label>Floor</label>
                                        <input className='form-control' onChange={(e) => setRegister({ ...Register, Floor: e.target.value })} value={Register.Floor} disabled />
                                    </div>
                                    <div className="col-lg-3">
                                        <label>IP Address </label>
                                        <input className='form-control' onChange={(e) => setRegister({ ...Register, IPaddress: e.target.value })} value={Register.IPaddress} disabled />
                                    </div>

                                    <div className="col-lg-3">
                                        <label>MAC Address</label>
                                        <input className="form-control mb-2  border border-2" type="text" onChange={(e) => setRegister({ ...Register, MACaddress: e.target.value })} value={Register.MACaddress} disabled />
                                    </div>

                                    {/* <div className="col-lg-3">
                                        <label>Machine ID</label>
                                        <input className="form-control mb-2  border border-2" type="text" onChange={(e) => setRegister({ ...Register, MachineID: e.target.value })} value={Register.MachineID} disabled />
                                    </div> */}

                                    <div className="col-lg-3">
                                        <label>Device Type</label>
                                        <input className="form-control mb-2  border border-2" type="text" onChange={(e) => setRegister({ ...Register, DeviceType: e.target.value })} value={Register.DeviceType} disabled />
                                    </div>

                                    <div className="col-lg-3">
                                        <label>Reader Type</label>
                                        <input className="form-control mb-2  border border-2" type="text" onChange={(e) => setRegister({ ...Register, ReaderType: e.target.value })} value={Register.ReaderType} disabled />
                                    </div>

                                    <div className="col-lg-3">
                                        <label>Manufacture Name</label>
                                        <input className="form-control mb-2  border border-2" type="text" onChange={(e) => setRegister({ ...Register, ManufactureName: e.target.value })} value={Register.ManufactureName} disabled />
                                    </div>

                                    <div className="col-lg-3">
                                        <label>Antenna ID</label>
                                        <input className="form-control mb-2  border border-2" type="text" onChange={(e) => setRegister({ ...Register, AntennaID: e.target.value })} value={Register.AntennaID} disabled />
                                    </div>

                                    <div className="col-lg-3">
                                        <label>Room Type</label>
                                        <input className="form-control mb-2  border border-2" type="text" onChange={(e) => setRegister({ ...Register, RoomType: e.target.value })} value={Register.RoomType} disabled />
                                    </div>

                                </div>
                            </div>

                        </div>
                    </div>
                </div>

                {/* Modal For Edit Asset */}
                <div className="modal fade" id="exampleModalEdit" aria-labelledby="exampleModalLabel" >
                    <div className="modal-dialog modal-xl">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h1 className="modal-title fs-5" id="exampleModalLabel">Edit Device Details</h1>
                                <button type="button" className="btn-close" data-bs-dismiss="modal"></button>
                            </div>
                            <div className="modal-body">
                                <div className=" row ">

                                    <div className="col-lg-3">
                                        <label>Device ID</label>
                                        <input className='form-control' onChange={(e) => setRegister({ ...Register, DeviceID: e.target.value })} value={Register.DeviceID} />
                                    </div>
                                    <div className="col-lg-3">
                                        <label>Device Name</label>
                                        <input className='form-control' onChange={(e) => setRegister({ ...Register, DeviceName: e.target.value })} value={Register.DeviceName} />
                                    </div>
                                    <div className="col-lg-3">
                                        <label>Floor</label>
                                        <input className='form-control' onChange={(e) => setRegister({ ...Register, Floor: e.target.value })} value={Register.Floor} />
                                    </div>
                                    <div className="col-lg-3">
                                        <label>IP Address </label>
                                        <input className='form-control' onChange={(e) => setRegister({ ...Register, IPaddress: e.target.value })} value={Register.IPaddress} />
                                    </div>

                                    <div className="col-lg-3">
                                        <label>MAC Address</label>
                                        <input className="form-control mb-2  border border-2" type="text" onChange={(e) => setRegister({ ...Register, MACaddress: e.target.value })} value={Register.MACaddress} />
                                    </div>

                                    {/* <div className="col-lg-3">
                                        <label>Machine ID</label>
                                        <Typeahead
                                            type="text"
                                            id="vendor2"
                                            labelKey="mc_id"
                                            options={Machinedropdown}
                                            onKeyDown={(e) => {
                                                const isSpecialChar = /[^A-Za-z0-9 ]/.test(e.key);
                                                if (isSpecialChar) {
                                                    e.preventDefault();
                                                }
                                            }}
                                            onChange={(selected) => {
                                                if (selected.length > 0) {
                                                    const selectedValue = selected[0];
                                                    setRegister({
                                                        ...Register,
                                                        MachineID: selectedValue.mc_id,
                                                    });
                                                } else {
                                                    setRegister((prev) => ({ ...prev, MachineID: "" }));
                                                }
                                            }}
                                            selected={
                                                Register.MachineID
                                                    ? [{ mc_id: Register.MachineID }]
                                                    : []
                                            }                                            // disabled={loading}
                                            maxLength={100}
                                        />
                                    </div> */}

                                    <div className="col-lg-3">
                                        <label>Device Type</label>
                                        <input className="form-control mb-2  border border-2" type="text" onChange={(e) => setRegister({ ...Register, DeviceType: e.target.value })} value={Register.DeviceType} />
                                    </div>

                                    <div className="col-lg-3">
                                        <label>Reader Type</label>
                                        <input className="form-control mb-2  border border-2" type="text" onChange={(e) => setRegister({ ...Register, ReaderType: e.target.value })} value={Register.ReaderType} />
                                    </div>

                                    <div className="col-lg-3">
                                        <label>Manufacture Name</label>
                                        <input className="form-control mb-2  border border-2" type="text" onChange={(e) => setRegister({ ...Register, ManufactureName: e.target.value })} value={Register.ManufactureName} />
                                    </div>

                                    <div className="col-lg-3">
                                        <label>Antenna ID</label>
                                        <input className="form-control mb-2  border border-2" type="text" onChange={(e) => setRegister({ ...Register, AntennaID: e.target.value })} value={Register.AntennaID} />
                                    </div>

                                    <div className="col-lg-3">
                                        <label>Room Type</label>
                                        <input className="form-control mb-2  border border-2" type="text" onChange={(e) => setRegister({ ...Register, RoomType: e.target.value })} value={Register.RoomType} />
                                    </div>

                                </div>


                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-danger" data-bs-dismiss="modal">Close</button>
                                <button type="button" className="btn btn-success" onClick={() => handlechange()} data-bs-dismiss="modal" >Update</button>
                            </div>
                        </div>
                    </div>
                </div>



                {Uploadvisible && (
                    <div className={`modal fade ${Uploadvisible ? 'show' : ''}`} style={{ display: Uploadvisible ? 'block' : 'none' }}>
                        <div className="modal-dialog modal-dialog-centered modal-lg modal-dialog-scrollable">
                            <div className="modal-content card">
                                <div className="modal-header">
                                    <button type="button" className="btn-close" onClick={() => setUploadvisible(false)}></button>

                                </div>
                                <div className="modal-body">
                                    <div className="import-input">
                                        <label htmlFor="importdata" className="form-label">Import Data</label>
                                        <input
                                            type="file"
                                            className="form-control"
                                            accept=".csv, .xls, .xlsx"
                                            onChange={handleUploadExcelSheet}
                                        />
                                    </div>
                                    <hr className="mt-2" />

                                    <div className="download-sample-template text-center">
                                        <p>Important ⚠</p>
                                        <span className='text-danger'>Download The Below The Template That Colum Name Based Enter The Data Then Upload here</span>

                                        <a href="/DeveiceMasterTemp.xlsx" className="nav-link text-decoration-underline" download>
                                            Click to Download
                                        </a>

                                    </div>
                                    <div className="text-center mt-3">
                                        <button className="btn btn-danger mx-2" onClick={() => setUploadvisible(false)}>
                                            CANCEL
                                        </button>
                                        <button className="btn btn-success mx-2" onClick={handleUploadData}>
                                            Upload Data
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                <Card className='mt-4'>
                    <CardHeader className='pro-header'>
                        <div className='d-flex justify-content-center text-white'>
                            <DeviceHub className="ms-2 fs-3" /> <h3 className='text-white'>RFID Reader Device Master</h3>
                        </div>
                    </CardHeader>
                    <CardBody>
                        <div className='d-flex justify-content-end mt-2 flex-wrap col-lg-12 col-md-12 col-sm-12'>
                            <div className='d-flex flex-wrap'>
                                {
                                    (pageData.addstatus === null || pageData.addstatus === 'i') && auth.UserStatus === 'A'
                                        ? '' :
                                        <CButton className=" ms-2 mb-2 " variant='outline' color='success' onClick={() => setUploadvisible(true)}>
                                            <i className="bi bi-cloud-download me-1"></i>
                                            Import
                                        </CButton>
                                }
                                <CButton className="btn  ms-2 mb-2" variant='outline' color='danger'
                                    data-bs-toggle="modal" data-bs-target="#exampleModal"
                                >
                                    <i className="bi bi-cloud-upload me-1"></i>
                                    Export
                                </CButton>
                                {
                                    (pageData.addstatus === null || pageData.addstatus === 'i') && auth.UserStatus === 'A'
                                        ? '' :
                                        <Link to='/Settings/AddNewDevice'>
                                            <CButton className="btn ms-2 mb-2" variant='outline' color='primary'>
                                                <i className="bi bi-plus-lg me-1"></i>
                                                Add
                                            </CButton>
                                        </Link>

                                }

                            </div>
                        </div>
                        <div style={{ height: "500px" }} className='ag-theme-quartz'>
                            <AgGridReact ref={gridRef} rowData={rowData} columnDefs={columdef} rowSelection={"multiple"}
                              getRowHeight={() => 60}  autoGroupColumnDef={autoGroupColumnDef} pagination={pagination} paginationPageSize={paginationPageSize} paginationPageSizeSelector={paginationPageSizeSelector}
                            />
                        </div>
                    </CardBody>
                </Card>

            </div>

        </>
    )
}

RegisterAssetTable.propTypes = {
    auth: PropTypes.any.isRequired,
};

export default RegisterAssetTable
