import React, { useRef, useMemo, useState, useEffect } from 'react'
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { AgGridReact } from 'ag-grid-react';
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import axios from 'axios';
import Swal from 'sweetalert2';
import Select from "react-select";
import { BallTriangle } from 'react-loader-spinner';
import PropTypes from 'prop-types';
import { useLocation } from "react-router-dom";
import { CButton, CModal, CModalBody, CModalFooter, CModalHeader, CModalTitle } from '@coreui/react';
import { getConfig } from 'src/config';
import defaultlogo from '../../assets/images/apple-logo.png'; // no curly braces!
import { Typeahead } from 'react-bootstrap-typeahead';
import 'react-bootstrap-typeahead/css/Typeahead.css';
import CIcon from '@coreui/icons-react';
import { cilCloudUpload, cilFile, cilPaperclip, cilPrint, cilX } from '@coreui/icons';
import { FaEdit } from 'react-icons/fa';
import { right } from '@popperjs/core';
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import logo from 'src/assets/images/Base64/Apple_base64'; // Can also be base64 string
import autoTable from 'jspdf-autotable';
import { Card, CardBody, Col, Row } from 'react-bootstrap';
import { IoEye } from 'react-icons/io5';
import { printLabels } from "../LabelPrint/LabelPrintService";
import secureLocalStorage from 'react-secure-storage';

const RegisterDetails = ({ auth }) => {
    const API_URL = getConfig().REACT_APP_API_URL;
    const [loading, setLoading] = useState(false); // Loader state
    const location = useLocation();
    const [AssetType, setAssetType] = useState([]);
    const [ValidateData, setValidateData] = useState([]);

    let pageData = location.state?.pageData;
    if (!pageData) {
        const storedData = secureLocalStorage.getItem('pageData');
        pageData = storedData || {};
    }
    const fileInput = useRef(null);
    const [Register, setRegister] = useState(
        {
            AssetID: '', AssetName: '', Brand: '', Model: '', Category: '', SubCategory: '', Department: '', Vendors: '', POnumber: '', GRNnumber: '', PDate: '', PCost: '', WType: '', WPeriod: '', WEndDate: '', Description: '', Activity: '', SelectPType: '', RFID: '', UpdatedBy: '', AssetMappedBy: '', Movement: '', id: '', InvoiceNumber: '', Status: '', LocationCode: '', LocationRFID: '', Image: '', VendorName: '', PhoneNumber: '', Building: '', Floor: '', Room: '',
            AssetType: '', GroupName: '', BUnitName: '', Depreciation: '', MaintainbyName: '', MaintainById: '', AssetGroupName: '', BUnitId: '', PackageName: '', CreatedDate: '',
            DepreciationType: 'Straight Line', DepreciationMode: 'Year', DepreciationValue: ''
        }
    );
    const downloadExcel = async () => {
        const columnDefs = [
            { header: "S.No", key: "S.No" },
            { header: "Status", key: "RFID" },
            { header: "Allocated Status", key: "AllocatedStatus" },
            { header: "Print Status", key: "PrintStatus" },
            { header: "RFID Number", key: "RFIDnumber" },
            { header: "Asset Type", key: "AssetType" },
            { header: "Asset ID", key: "AssetID" },
            { header: "Asset Group", key: "AssetGroupName" },
            { header: "Category", key: "Category" },
            { header: "SubCategory", key: "SubCategory" },
            { header: "Department", key: "Department" },
            { header: "Description", key: "Description" },
            { header: "LocationCode", key: "LocationCode" },
            { header: "Building", key: "Building" },
            { header: "Floor", key: "Floor" },
            { header: "Room", key: "Room" },
            { header: "Vendor Name", key: "VendorName" },
            { header: "Phone Number", key: "PhoneNumber" },
            { header: "Created By", key: "CreatedBy", },
            { header: "Created Date", key: "CreatedDate", },
            {
                header: "Last Modified By", key: "UpdatedBy",
            },
            {
                header: "Last Modified Date", key: "UpdatedDate",
            },

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

        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet("Registered Asset Details");
        // TURN OFF GRIDLINES
        sheet.views = [{ showGridLines: false }];
        const now = new Date();
        const formattedDate = now.toLocaleDateString("en-IN");
        // TITLE
        sheet.mergeCells(1, 1, 1, columnDefs.length);
        const titleCell = sheet.getCell("A1");
        titleCell.value = `Registered Asset Details - ${formattedDate}`;
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

        // AUTO RESIZE COLUMNS BASED ON CONTENT
        sheet.columns.forEach((column) => {
            let maxLength = 0;
            column.eachCell({ includeEmpty: true }, (cell) => {
                const colValue = cell.value ? cell.value.toString() : "";
                maxLength = Math.max(maxLength, colValue.length);
            });

            // minimum width 10, otherwise add padding
            column.width = maxLength < 10 ? 10 : maxLength + 0;
        });


        const buffer = await workbook.xlsx.writeBuffer();
        saveAs(new Blob([buffer]), "Registered_Asset_Details.xlsx");
    };

    //pdf
    const handlepdf = async (selectedDate) => {
        setLoading(true);
        await new Promise(resolve => setTimeout(resolve, 0));

        const filteredData = gridRef.current.api.getModel().rowsToDisplay.map(rowNode => rowNode.data);

        const doc = new jsPDF({ orientation: "landscape", format: 'a2' });
        const title = 'Registered Asset Details';

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
            'S.No', 'Status', 'AllocatedStatus', 'Print Status', 'RFID Number', 'Asset Type', 'Asset ID','Asset Group' ,'Category',
            'SubCategory', 'Department', 'Description', 'LocationCode', 'Building', 'Floor', 'Room', 'Vendor Name', 'Phone Number', 'Created By', 'Created Date', 'Updated By', 'Updated Date'
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
            item.RFID || "-",
            item.AllocatedStatus || "-",
            item.PrintStatus || "-",
            item.RFIDnumber || "-",
            item.AssetType || "-",
            item.AssetID || "-",
            item.AssetGroupName || "-",
            item.Category || "-",
            item.SubCategory || "-",
            item.Department || "-",
            item.Description || "-",
            item.LocationCode || "-",
            item.Building || "-",
            item.Floor || "-",
            item.Room || "-",
            item.VendorName || "-",
            item.PhoneNumber || "-",
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

            doc.save("Registered Asset Details.pdf");
        } else {
            Swal.fire("No data available to export", "", "warning");
        }
        setLoading(false);
    };
    //end pdf

    // TAble
    const [CategoryDropDownData, SetCategoryDropDownData] = useState([])
    const [SubCategoryData, setSubCategoryData] = useState([]);
    const [DepartmentDropDownData, SetDepartmentDropDownData] = useState([])

    // Table for All Asset
    const pagination = true;
    const paginationPageSize = 50;
    const paginationPageSizeSelector = [10, 20, 50];

    const [rowData, setRowData] = useState([]);

    const [inputdata, setInputdata] = useState({
        RFIDnumber: ''
    })
    // Edit Start
    // Upload Image start
    const [image, setImage] = useState({
        src: '',
        alt: ''
    });
    const handleImg = (event) => {
        const file = event.target.files[0];

        // Check if the file is larger than 2MB
        if (file && file.size <= 2 * 1024 * 1024) { // 2MB in bytes
            const reader = new FileReader();
            reader.onloadend = () => {
                setImage({
                    src: reader.result,
                    alt: file.name,
                });

                setRegister(prevRegister => ({
                    ...prevRegister,
                    Image: reader.result
                }));
            };

            reader.readAsDataURL(file); // Convert image to base64
        } else {
            alert('File size should be less than or equal to 2MB'); // Provide user feedback
        }
    };
    const fetchAssetType = async () => {
        try {
            const data = { mode: 'S', branchid: auth.branchid, BranchAccess: auth.BranchAccess }
            const response = await axios.post(`${API_URL}/AssetTypeMaster`, data);
            if (response.status === 200) {
                setAssetType(response.data);
            }
        } catch (err) {
            console.log(err);
        }
    };


    // Upload Image End

    const [MaintainedData, setMaintainedData] = useState([])

    const fetchMaintainedData = async () => {
        try {
            const alldata = { mode: 'S', branchid: auth.branchid, BranchAccess: auth.BranchAccess, MaintainId: '' }
            const response = await axios.post(`${API_URL}/MaintainedConfig`, alldata);
            setMaintainedData(response.data);
        } catch (error) {
            console.error('Error fetching user details:', error);
        }
    };

    const handleEdit = async (id) => {
        try {
            const alldata = { id, mode: 'S', branchid: auth.branchid, BranchAccess: auth.BranchAccess }
            const response = await axios.post(`${API_URL}/ViewRegister`, alldata);
            console.log('response.data.send', response.data.send);

            setRegister(...response.data.send)
            fetchAssetType();
            fetchMaintainedData();
            fetchAssetGroupData();
            fetchAssetPackageData();

        } catch (error) {
            console.error('ERROR EDITING RECORD:', error);
            throw error;
        }




    }

    const EditRenderer = (params) => {

        // console.log(pageData.editstatus)
        // Check if ViewStatus is null (or some other condition you want to apply)
        if ((pageData.addstatus === null || pageData.addstatus === 'i') && auth.UserStatus === 'A') {
            return null; // Hide the button by returning null
        }
        return <div>
            <button className="border-0 mt-1 rounded-circle d-flex justify-content-center align-items-center"
                style={{
                    width: "40px",
                    height: "40px",
                    cursor: 'pointer',
                    background: "rgba(25, 135, 84, 0.15)",
                    border: "1px solid rgba(25, 135, 84, 0.3)",
                    color: "#198754",
                    transition: "all 0.3s ease",
                    boxShadow: "0 2px 6px rgba(0, 0, 0, 0.1)",
                }}
                // onClick={() => handlefetch(params.data.BuildingId)}

                onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(25,135,84,0.25)";
                    e.currentTarget.style.transform = "scale(1.1)";
                    e.currentTarget.style.boxShadow = "0 4px 12px rgba(25,135,84,0.3)";
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.background = "rgba(25,135,84,0.15)";
                    e.currentTarget.style.transform = "scale(1)";
                    e.currentTarget.style.boxShadow = "0 2px 6px rgba(0, 0, 0, 0.1)";
                }} onClick={() => handleEdit(params.data.id)} data-bs-toggle="modal" data-bs-target="#exampleModalEdit">
                <FaEdit className="fs-5" />
            </button>
        </div>

    }

    const [AssetPackageData, setAssetPackageData] = useState([])

    const fetchAssetPackageData = async () => {
        try {
            const alldata = { mode: 'getPackage', branchid: auth.branchid, BranchAccess: auth.BranchAccess, PackageId: '' }
            const response = await axios.post(`${API_URL}/PackageConfig`, alldata);
            setAssetPackageData(response.data);
            console.log("🚀 ~ fetchAssetPackageData ~ response.data:", response.data)
        } catch (error) {
            console.error('Error fetching user details:', error);
        }
    };

    const [AssetGroupData, setAssetGroupData] = useState([])

    const fetchAssetGroupData = async () => {
        try {
            const alldata = { mode: 'S', branchid: auth.branchid, BranchAccess: auth.BranchAccess, GroupId: '' }
            const response = await axios.post(`${API_URL}/AssetGroupConfig`, alldata);
            setAssetGroupData(response.data);
        } catch (error) {
            console.error('Error fetching user details:', error);
        }
    };


    // Update Details
    //   Submit Updated Details
    const handlechange = async (e) => {
        if (auth.branchid === "0" || auth.branchid === 0) {
            Swal.fire({
                icon: 'warning',
                title: 'Invalid Selection',
                text: "Please select a specific branch. 'ALL' is not allowed.",
            });
            return;
        }

        if (Register.PackageName === '') {
            Swal.fire({
                title: 'Please Select Package',
                icon: 'warning',
                confirmButtonText: 'Done'
            })
            return
        }
        if (Register.Category === '') {
            Swal.fire({
                title: 'Please Select Category',
                icon: 'warning',
                confirmButtonText: 'Done'
            })
            return
        }
        if (Register.SubCategory === '') {
            Swal.fire({
                title: 'Please Select Sub Category',
                icon: 'warning',
                confirmButtonText: 'Done'
            })
            return
        }
        if (Register.AssetGroupName === '') {
            Swal.fire({
                title: 'Please Select Asset Group',
                icon: 'warning',
                confirmButtonText: 'Done'
            })
            return
        }
        if (Register.Department === '') {
            Swal.fire({
                title: 'Please Select Department',
                icon: 'warning',
                confirmButtonText: 'Done'
            })
            return
        }
        if (Register.AssetType === '') {
            Swal.fire({
                title: 'Please Select Asset Type',
                icon: 'warning',
                confirmButtonText: 'Done'
            })
            return
        }
        if (Register.MaintainById === '') {
            Swal.fire({
                title: 'Please Select Maintain By',
                icon: 'warning',
                confirmButtonText: 'Done'
            })
            return
        }

        // e.preventDefault();
        setLoading(true);

        let imagePath = Register.Image || ''; // fallback to current image path

        // Check if a new file is selected
        const file = fileInput.current?.files[0];
        if (file) {
            const formData = new FormData();
            formData.append('image', file);

            try {
                const imageUploadResponse = await axios.post(`${API_URL}/api/upload`, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                });

                if (imageUploadResponse.data.success) {
                    imagePath = imageUploadResponse.data.file.path;
                } else {
                    Swal.fire({
                        text: 'Image upload failed',
                        icon: 'error',
                    });
                    setLoading(false);
                    return;
                }
            } catch (error) {
                console.error('Image upload error:', error);
                Swal.fire({
                    text: 'Error during image upload',
                    icon: 'error',
                });
                setLoading(false);
                return;
            }
        }

        // Now prepare the full payload
        const UpdatedData = {
            ...Register,
            UpdatedBy: auth.empid,
            mode: 'U',
            AssetImg: imagePath, // updated or existing image path
        };
        console.log("🚀 ~ handlechange ~ UpdatedData:", UpdatedData)

        const alldata = { ...UpdatedData, ...inputdata };

        try {
            const response = await axios.post(`${API_URL}/UpdateRegister`, alldata);

            if (response.status === 200) {
                const res = { ...response.data.send };
                setRegister(res);
                setLoading(false);
                fetchData(); // refresh updated data

                Swal.fire({
                    title: 'Updated Successfully',
                    icon: 'success',
                    confirmButtonText: 'Done',
                });
            }
        } catch (err) {
            console.error('Update error:', err);
            setLoading(false);
            Swal.fire({
                title: 'Update Failed',
                icon: 'error',
            });
        }
    };
    const [modalImage, setModalImage] = useState(null); // State for modal image URL
    const [Imagevisible, setImagevisible] = useState(false);
    const [selectedAsset, setSelectedAsset] = useState(null);
    const [addAttachmentModal, setAddAttachmentModal] = useState(false);
    const [viewAttachmentModal, setViewAttachmentModal] = useState(false);
    const [attachmentFiles, setAttachmentFiles] = useState([]);

    const removeFile = (index) => {
        const updatedList = [...attachmentFiles];
        updatedList.splice(index, 1);
        setAttachmentFiles(updatedList);
    };

    const fetchAttachments = async (assetId) => {
        try {
            const response = await axios.post(`${API_URL}/GetAttachments`, { AssetID: assetId, mode: 'getFiles', branchid: auth.branchid });

            if (response.data.length === 0) {
                Swal.fire("No Files", "No files are attached to this asset.", "info");
                return;
            }

            setAttachmentFiles(response.data);
            setViewAttachmentModal(true);
        } catch (err) {
            console.log(err);
            setViewAttachmentModal(true);
        }
    };

    const uploadAttachment = async () => {
        const formData = new FormData();
        formData.append("AssetID", selectedAsset.AssetID);
        formData.append("Createdby", auth.empid);
        formData.append("branchid", auth.branchid);
        for (let i = 0; i < attachmentFiles.length; i++) {
            formData.append("files", attachmentFiles[i]);
        }
        const res = await axios.post(`${API_URL}/UploadAttachment`, formData);
        Swal.fire("Success", "Files uploaded successfully!", "success");
        setAddAttachmentModal(false);
        setAttachmentFiles([]);
    };


    const handleDeleteAttachment = async (attachmentId, index) => {
        const confirmDelete = window.confirm("Are you sure you want to delete this file?");
        if (!confirmDelete) return;
        try {
            const response = await axios.post(`${API_URL}/DeleteAttachment`, {
                attachmentId: attachmentId, branchid: auth.branchid
            });

            if (response.data.success) {
                // Remove from UI without refresh
                const updated = [...attachmentFiles];
                updated.splice(index, 1);
                setAttachmentFiles(updated);

                alert("Attachment deleted successfully!");
            } else {
                alert("Failed to delete attachment!");
            }
        } catch (err) {
            console.error(err);
            alert("Server error while deleting file!");
        }
    }


    const handleImageClick = (imageUrl) => {
        // const fullImageUrl = `${API_URL}/${imageUrl}`;
        console.log(imageUrl);
        setModalImage(imageUrl);
        setImagevisible(true)
    };

    const [view, setview] = useState([]);
    const handleView = async (id) => {
        try {
            const alldata = { id, mode: 'S', branchid: auth.branchid, BranchAccess: auth.BranchAccess }
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

    // client-side date filter comparator for "DD-MM-YYYY HH:MM:SS" cell text
    const dateFilterComparator = (filterLocalDateAtMidnight, cellValue) => {
        if (!cellValue || cellValue === '-') return -1;
        const [datePart] = String(cellValue).split(' ');
        const [dd, mm, yyyy] = datePart.split('-').map(Number);
        if (!yyyy) return -1;
        const cell = new Date(yyyy, (mm || 1) - 1, dd || 1);
        const picked = new Date(filterLocalDateAtMidnight.getFullYear(), filterLocalDateAtMidnight.getMonth(), filterLocalDateAtMidnight.getDate());
        return cell < picked ? -1 : cell > picked ? 1 : 0;
    };

    const columndef = [
        {
            width: 50, cellClass: 'center-align',
            headerName: "S.No",
            valueGetter: "node.rowIndex + 1",
            width: 80,
            pinned: 'left',
            headerCheckboxSelection: true, checkboxSelection: true,
        },
        {
            field: "AssetID",
            headerName: "Attachment",
            width: 110,
            headerClass: 'agheader',
            cellRenderer: (params) => {
                const handleAttachmentClick = () => {
                    Swal.fire({
                        title: "Attachment Options",
                        text: "What do you want to do?",
                        icon: "question",
                        showCancelButton: true,
                        showDenyButton: true,
                        confirmButtonText: "Add Attachment",
                        denyButtonText: "View Attachments",
                        cancelButtonText: "Cancel",
                    }).then((result) => {
                        if (result.isConfirmed) {
                            // Add Attachment
                            setSelectedAsset(params.data);
                            setAddAttachmentModal(true);
                        }
                        else if (result.isDenied) {
                            // View Attachment
                            fetchAttachments(params.data.AssetID);
                        }
                    });
                };
                return (
                    <div className="client-name-cell" >
                        <div className="action-icons">
                            <button onClick={handleAttachmentClick}
                                title="Attachments">
                                <CIcon icon={cilPaperclip} size='lg' />
                            </button>
                        </div>

                        <style jsx>{`
                                    .client-name-cell 
                                    { position: relative; display: flex; align-items: center; height: 100%; }
                                    .client-name-link 
                                    { font-weight: bold; color: #007bff; text-decoration: none; padding: 4px 6px; border-radius: 4px; transition: all 0.2s; }
                                    .client-name-link:hover
                                     { background: #e7f3ff; text-decoration: underline; }
                                    .action-icons
                                     { margin-left: 10px; display: flex; gap: 8px; transition: opacity 0.25s ease; }
                                    .action-icons button
                                     { all: unset; cursor: pointer; padding: 4px; border-radius: 50%; display: flex; align-items: center; justify-content: center; transition: transform 0.2s; }
                                    .action-icons button:hover
                                     { transform: scale(1.2); background: rgba(0,0,0,0.05); }
                                    .client-name-cell:hover .action-icons
                                     { opacity: 1; }
                                `}</style>
                    </div >
                );
            },
        },
        {
            headerName: "Image", headerClass: 'agheader',
            field: "Image",
            width: 100,
            filter: false,
            sortable: false,
            floatingFilter: false,
            editable: false,
            cellRenderer: (params) => {
                const isValidImage = params.value != null && params.value !== 'null' && String(params.value).trim() !== "";
                const imagePath = isValidImage ? `${API_URL}/${params.value}` : defaultlogo;

                // console.log('imagePath:', isValidImage);

                return (
                    <img
                        src={imagePath}
                        className="border border-dark rounded-circle"
                        alt="Asset"
                        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                        onClick={() =>
                            handleImageClick(isValidImage ? `${API_URL}/${params.value}` : defaultlogo)
                        }
                        onError={(e) => {
                            e.target.onerror = null; // Prevent infinite loop
                            e.target.src = defaultlogo; // fallback image
                        }}
                    />
                );
            },
        },
        {
            headerName: "Allocated Status",
            field: "AllocatedStatus",
            width: 180,
            cellClass: 'center-align',
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
        {
            headerName: "Status", headerClass: 'agheader',
            field: "RFID",
            width: 150,
            cellClass: 'center-align',
            filter: true, floatingFilter: true, editable: true,
            cellRenderer: params => {
                // Determine the status based on the value in params
                const statusText = params.value === 'YES' ? 'With RFID' : 'Without RFID';
                // Determine the CSS class based on the status
                const statusClass = params.value === 'YES' ? 'badge bg-success' : 'badge bg-danger';

                return (
                    <span className={statusClass}>
                        {statusText}
                    </span>
                );
            }
        },
        {
            headerName: "Print Status", headerClass: 'agheader',
            field: "PrintStatus",
            width: 150,
            cellClass: 'center-align',
            filter: true, floatingFilter: true, editable: true,
            cellRenderer: params => {
                // Determine the status based on the value in params
                const statusText = params.value === 'Pending' ? 'Pending' : 'Already Printed';
                // Determine the CSS class based on the status
                const statusClass = params.value === 'Pending' ? 'badge bg-success' : 'badge bg-danger';

                return (
                    <span className={statusClass}>
                        {statusText}
                    </span>
                );
            }
        },
        {
            headerName: "RFID Number", headerClass: 'agheader', field: "RFIDnumber", filter: true, floatingFilter: true, editable: true, editable: true, cellClass: 'center-align',
            valueGetter: (params) => {
                const value = params.data?.RFIDnumber;
                return value || "-";
            }
        },
        {
            headerName: "Asset Type", headerClass: 'agheader', field: "AssetType", filter: true, floatingFilter: true, cellClass: 'center-align', editable: true, editable: true,
            valueGetter: (params) => {
                const value = params.data?.AssetType;
                return value || "-";
            }
        },
        {
            headerName: "Asset ID", headerClass: 'agheader', field: "AssetID", filter: true, floatingFilter: true, editable: true, cellClass: 'center-align',
            valueGetter: (params) => {
                const value = params.data?.AssetID;
                return value || "-";
            }
        },
        // { headerName: "Asset Name", field: "AssetName", filter: true, floatingFilter: true,editable:true },
        // { headerName: "Invoice Number", field: "InvoiceNumber", filter: true, floatingFilter: true,editable:true },
        {
            headerName: "Asset Group", headerClass: 'agheader', field: "AssetGroupName", filter: true, floatingFilter: true, editable: true, cellClass: 'center-align',
            valueGetter: (params) => {
                const value = params.data?.AssetGroupName;
                return value || "-";
            }
        },
        {
            headerName: "Category", headerClass: 'agheader', field: "Category", filter: true, floatingFilter: true, editable: true, cellClass: 'center-align',
            valueGetter: (params) => {
                const value = params.data?.Category;
                return value || "-";
            }
        },
        {
            headerName: "Sub Category", headerClass: 'agheader', field: "SubCategory", filter: true, floatingFilter: true, editable: true, cellClass: 'center-align',
            valueGetter: (params) => {
                const value = params.data?.SubCategory;
                return value || "-";
            }
        },
        {
            headerName: "Department", headerClass: 'agheader', field: "Department", filter: true, floatingFilter: true, editable: true, cellClass: 'center-align',
            valueGetter: (params) => {
                const value = params.data?.Department;
                return value || "-";
            }
        },
        {
            headerName: "Description", headerClass: 'agheader', field: "Description", filter: true, floatingFilter: true, editable: true, cellClass: 'center-align',
            valueGetter: (params) => {
                const value = params.data?.Description;
                return value || "-";
            }
        },
        // { headerName: "Model", field: "Model", filter: true, floatingFilter: true,editable:true },
        // { headerName: "Brand", field: "Brand", filter: true, floatingFilter: true,editable:true },
        // { headerName: "Cost", field: "PCost", filter: true, floatingFilter: true,editable:true },
        // { headerName: "Purshase Date", field: "PDate", filter: true, floatingFilter: true,editable:true },
        // { headerName: "Warranty Type", field: "WType", filter: true, floatingFilter: true,editable:true },
        // { headerName: "Warranty Period", field: "WPeriod", filter: true, floatingFilter: true,editable:true },
        // { headerName: "Warranty End Date", field: "WEndDate", filter: true, floatingFilter: true,editable:true },
        // { headerName: "Disposed Date", field: "DisposedDate", filter: true, floatingFilter: true,editable:true },
        // { headerName: "Created Date", field: "CreatedDate", filter: true, floatingFilter: true,editable:true },
        {
            headerName: 'Location Code', headerClass: 'agheader', field: 'LocationCode', filter: true, floatingFilter: true, cellClass: 'center-align', editable: true,
            valueGetter: (params) => {
                const value = params.data?.LocationCode;
                return value || "-";
            }
        },
        {
            headerName: 'Building', headerClass: 'agheader', field: 'Building', filter: true, floatingFilter: true, cellClass: 'center-align', editable: true,
            valueGetter: (params) => {
                const value = params.data?.Building;
                return value || "-";
            }
        },
        {
            headerName: 'Floor', headerClass: 'agheader', field: 'Floor', filter: true, floatingFilter: true, cellClass: 'center-align', editable: true,
            valueGetter: (params) => {
                const value = params.data?.Floor;
                return value || "-";
            }
        },
        {
            headerName: 'Room', headerClass: 'agheader', field: 'Room', filter: true, floatingFilter: true, cellClass: 'center-align', editable: true,
            valueGetter: (params) => {
                const value = params.data?.Room;
                return value || "-";
            }
        },
        {
            headerName: "Vendor", headerClass: 'agheader', field: "VendorName", filter: true, floatingFilter: true, editable: true, cellClass: 'center-align',
            valueGetter: (params) => {
                const value = params.data?.VendorName;
                return value || "-";
            }
        },
        {
            headerName: "Phone No", headerClass: 'agheader', field: "PhoneNumber", filter: true, floatingFilter: true, editable: true, cellClass: 'center-align',
            valueGetter: (params) => {
                const value = params.data?.PhoneNumber;
                return value || "-";
            }
        },

        {
            headerName: "Created By", headerClass: 'agheader', filter: true, floatingFilter: true, editable: true, field: "CreatedBy",
            valueGetter: (params) => {
                const value = params.data?.CreatedBy;
                return value || "-";
            }
        },

        {
            headerName: "Created Date", headerClass: 'agheader', filter: 'agDateColumnFilter', floatingFilter: true, editable: true, field: "CreatedDate", filterParams: { comparator: dateFilterComparator },
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
            headerName: "Last Modified Date", headerClass: 'agheader', filter: 'agDateColumnFilter', floatingFilter: true, editable: true, field: "UpdatedDate", filterParams: { comparator: dateFilterComparator },
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
        { headerName: "View", headerClass: 'agheader', field: "View", cellRenderer: ViewRenderer, cellClass: 'center-align', pinned: right, width: 90 },
        { headerName: (pageData.addstatus === null || pageData.addstatus === 'i') && auth.UserStatus === 'A' ? '' : 'Edit', field: "Edit", cellRenderer: EditRenderer, headerClass: 'agheader', width: 80, cellClass: 'center-align', pinned: right },
    ]
    // Download Excel Format
    const gridRef = useRef(null);

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
    // Download Excel Format

    // Grid Api For Select Specfic Row Data



    const [isModalVisible, setIsModalVisible] = useState(false);

    const [select, setselect] = useState({
        id: '',
    })

    const [gridApi, setGridApi] = useState(null);

    const getSelectedRows = async () => {
        const selectedRows = gridApi.getSelectedRows();
        if (selectedRows.length > 1) {
            Swal.fire({
                icon: 'warning',
                title: 'Invalid Selection',
                text: "Please select a specific Row. Multiple Rows is not allowed for RFID Mapping.",
            });
            return;
        }

        if (auth.branchid === "0" || auth.branchid === 0) {
            Swal.fire({
                icon: 'warning',
                title: 'Invalid Selection',
                text: "Please select a specific branch. 'ALL' is not allowed.",
            });
            return;
        }
        try {
            setIsModalVisible(true);
            if (gridApi) {
                const selectedNodes = gridApi.getSelectedNodes();
                const selectedData = selectedNodes.map(node => node.data.id);
                // console.log('Selected Rows:', selectedData);

                if (selectedData.length === 0) {
                    setIsModalVisible(false);
                    Swal.fire({
                        title: 'Please Select One Asset',
                        icon: 'warning'
                    })
                    return
                }
                else {
                    setselect({ id: selectedData });
                    const response = await axios.post(`${API_URL}/ReMapRfidtoAsset`, { id: selectedData })

                    if (response.status === 200) {
                        const data = response.data.send;
                        const { AssetID, AssetName, Description, Activity, PDate, RFIDnumber, id, branchName, Location } = data[0];

                        setRegister(({
                            ...Register,
                            AssetID: AssetID,
                            AssetName: AssetName,
                            Description: Description,
                            Activity: Activity,
                            PDate: PDate,
                            RFIDnumber: RFIDnumber,
                            id: id,
                            branchName: branchName,
                            Location: Location
                        }));
                    }
                }

            }
        } catch (err) {
            console.log(err)
        }
    };

    const modalRef = useRef(null);

    // Set Cursor Point in Modal start
    const inputRef = useRef(null);
    useEffect(() => {
        if (isModalVisible) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }

        return () => {
            document.body.style.overflow = 'auto'; // Clean up when component unmounts
        };
    }, [isModalVisible]);
    useEffect(() => {
        if (isModalVisible && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isModalVisible]);
    // set Cursor Point End

    // Handle Map for RFID to Asset

    const HandleRe_Mapped = async (e) => {

        // Duplicate-RFID check via the server so it works at any data size
        // (not just the rows currently loaded in the grid).
        try {
            const chk = await axios.post(`${API_URL}/EnrolledAssetInfoPaged`, {
                departmentname: auth.departmentname, mode: 'EnrolledAssets',
                branchid: auth.branchid, BranchAccess: auth.BranchAccess,
                startRow: 0, pageSize: 1,
                filters: { RFIDnumber: { op: 'equals', v: Register.RFIDnumber } },
            });
            if ((chk.data.total || 0) > 0) {
                Swal.fire({ title: 'RFID Number Already Exists', icon: 'error', confirmButtonText: 'Done' });
                return;
            }
        } catch (err) {
            console.error('RFID duplicate check failed:', err); // don't block mapping if the check errors
        }

        setLoading(true)
        try {
            if (Register.RFIDnumber != '') {
                const updateddata = { ...Register, RFID: 'YES', Movement: 'With RFID', AssetReMappedBy: auth.empid, mode: 'RM', branchid: auth.branchid }
                const response = await axios.post(`${API_URL}/RemappedRfid`, updateddata)
                const res = { ...response.data.send }
                setRegister(res)
                if (response.status === 200) {
                    setLoading(false)
                    Swal.fire({
                        title: 'RFID Number Saved Successfully',
                        icon: 'success',
                        confirmButtonText: 'Done'
                    }).then(() => {
                        setIsModalVisible(false)
                        fetchData();
                    });
                    setRegister({
                        ...Register,
                        RFIDnumber: ''
                    })

                }
                else if (response.status === 250) {
                    setIsModalVisible(false)
                    setLoading(false)
                    Swal.fire({
                        title: 'this RFID Number Already Mapped',
                        text: 'please try another RFID Number',
                        icon: 'error'
                    })
                }
            } else {
                const updateddata = { ...Register, RFID: '', AssetMappedBy: auth.empid, Movement: 'Reg WithOut RFID', mode: 'MWO', branchid: auth.branchid, Status: 'Active' }
                const response = await axios.post(`${API_URL}/UpdateWithoutRFID`, updateddata)
                const res = { ...response.data.send }
                setRegister(res)
                if (response.status === 200) {
                    setLoading(false)
                    Swal.fire({
                        title: 'Asset Saved Successfully WithOut RFID',
                        icon: 'success',
                        confirmButtonText: 'Done'
                    }).then(() => {
                        setIsModalVisible(false)
                        fetchData();
                    });
                    setRegister({
                        ...Register,
                        RFIDnumber: ''
                    })

                }
                else if (response.status === 250) {
                    setIsModalVisible(false)
                    setLoading(false)
                }
            }


        } catch (err) {
            console.log(err)
        }

    }

    // adaptive: instant client-side for small data, fast server paging for large
    const [serverSide, setServerSide] = useState(null);
    const CLIENT_SIDE_LIMIT = 20000;

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

    const onGridReady = (params) => {
        setGridApi(params.api);
        if (!serverSide) return;
        const ds = {
            getRows: async (p) => {
                const sort = (p.sortModel && p.sortModel[0]) || {};
                try {
                    const { data } = await axios.post(`${API_URL}/EnrolledAssetInfoPaged`, {
                        departmentname: auth.departmentname, mode: 'EnrolledAssets',
                        branchid: auth.branchid, BranchAccess: auth.BranchAccess,
                        startRow: p.startRow, pageSize: p.endRow - p.startRow,
                        sortCol: sort.colId || 'CreatedDate', sortDir: sort.sort || 'desc',
                        filters: normalizeFilters(p.filterModel),
                    });
                    p.successCallback(data.rows, data.total);
                } catch (error) { console.error('Error fetching Registered Assets page:', error); p.failCallback(); }
            },
        };
        params.api.setGridOption ? params.api.setGridOption('datasource', ds) : params.api.setDatasource(ds);
    };

    const fetchData = async () => {
        setLoading(true);
        try {
            const probe = await axios.post(`${API_URL}/EnrolledAssetInfoPaged`, {
                departmentname: auth.departmentname, mode: 'EnrolledAssets',
                branchid: auth.branchid, BranchAccess: auth.BranchAccess, startRow: 0, pageSize: 1, filters: {},
            });
            const total = probe.data.total || 0;
            if (total > CLIENT_SIDE_LIMIT) {
                setServerSide(true); // grid pages from the server (onGridReady datasource)
                // if the grid is already mounted (e.g. refresh after an edit), reload its pages
                if (gridApi && gridApi.purgeInfiniteCache) gridApi.purgeInfiniteCache();
            } else {
                const { data } = await axios.post(`${API_URL}/ViewEnrolledAssets`, {
                    mode: 'EnrolledAssets', departmentname: auth.departmentname,
                    branchid: auth.branchid, BranchAccess: auth.BranchAccess,
                });
                const rows = data?.send ?? [];
                setRowData(rows);
                setValidateData(rows);
                setServerSide(false);
            }
        } catch (error) {
            console.error('Error fetching enrolled assets:', error);
            setServerSide(false);
        } finally {
            setLoading(false);
        }
    };


    const [VendorData, setVendorData] = useState([])
    const fetchVendorData = async () => {
        try {
            const alldata = { branchid: auth.branchid, mode: 'S', BranchAccess: auth.BranchAccess }
            const response = await axios.post(`${API_URL}/FetchVendors`, alldata);
            setVendorData(response.data.send);
        } catch (error) {
            console.error('Error fetching user details:', error);
        }
    };

    const handleVendorChange = (selected) => {
        const vendorName = selected ? selected.value : "";
        const vendorOption = VendorData.find(v => v.VendorName === vendorName);
        setRegister({
            ...Register,
            VendorName: vendorName,
            PhoneNumber: vendorOption ? vendorOption.PhoneNumber : ""
        });
    };

    useEffect(() => {
        fetchData();
    }, []);


    const FetchDepartmentDropDownData = async () => {
        try {
            const data = { mode: 'S', branchid: auth.branchid }
            const response = await axios.post(`${API_URL}/fetchDeparmentData`, data);
            if (response.status === 200) {
                SetDepartmentDropDownData(response.data.send);
            }
        } catch (err) {
            console.log(err);
        }
    };
    // Fetch subcategories based on selected category
    const fetchSubCategory = async (Category) => {
        try {
            const alldata = { Category, mode: 'SDS', branchid: auth.branchid }
            const response = await axios.post(`${API_URL}/fetchSubCategorydata`, alldata);
            if (response.status === 200) {
                setSubCategoryData(response.data.send);
            }
        } catch (err) {
            console.log(err);
        }
    };
    // Handle category change
    const handleCategoryChange = (selected) => {
        const selectedCategory = selected[0].Category;
        setRegister({ ...Register, Category: selectedCategory });
        fetchSubCategory(selectedCategory); // Fetch subcategories when category is selected
    };

    const fetchPackageWiseCategory = async (selected) => {
        try {
            const alldata = { mode: 'getCategoryPackageWise', branchid: auth.branchid, BranchAccess: auth.BranchAccess, ...selected[0], PackageId: '' }
            const response = await axios.post(`${API_URL}/PackageConfig`, alldata);
            SetCategoryDropDownData(response.data);
        } catch (error) {
            console.error('Error fetching user details:', error);
        }
    };

    useEffect(() => {
        if (isModalVisible && inputRef.current) {
            inputRef.current.focus();
        }
        fetchVendorData();
        FetchDepartmentDropDownData();
    }, [isModalVisible])

    // print Section
    const handleprint = async () => {
        const selectedRows = gridApi.getSelectedRows();

        if (!selectedRows || selectedRows.length === 0) {
            swal({
                text: "Please Select One Asset Code",
                icon: "warning"
            });
            return;
        }

        // 🔹 Convert grid rows → label format
        const labels = selectedRows.map((row, index) => ({
            AssetID: row.AssetID,
            AssetName: row.AssetName,
            AssetType: row.AssetType,
            Building: row.Building,
            Floor: row.Floor,
            Room: row.Room,
            Department: row.Department,
            LocationCode: row.LocationCode,
            SequenceNo: index + 1
        }));
        console.log("🚀 ~ handleprint ~ labels:", labels)

        // 🔥 PRINT (no backend)
        await printLabels(labels);
    };

    const handleChangeWarrantyEndingDate = (e) => {
        const warrantyMonths = parseInt(e.target.value, 10);

        // Ensure there's a valid Purchase Date and the Warranty Period is a number
        if (Register.PDate && !isNaN(warrantyMonths)) {
            const purchaseDate = new Date(Register.PDate);  // Convert Purchase Date to Date object
            purchaseDate.setMonth(purchaseDate.getMonth() + warrantyMonths);  // Add Warranty Period in months

            // Format the resulting date to match the "yyyy-mm-dd" format
            const warrantyEndDate = purchaseDate.toISOString().split('T')[0];
            // const warrantyEndDate = purchaseDate

            // Set the calculated Warranty Ending Date
            setRegister({ ...Register, WEndDate: warrantyEndDate, WPeriod: e.target.value });
        }
        else {
            // If any data is missing or invalid, reset the Warranty Ending Date
            setRegister({ ...Register, WEndDate: "", WPeriod: '' });
        }
    };
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

            {/* Attachment Start */}

            <CModal visible={addAttachmentModal} onClose={() => setAddAttachmentModal(false)} size="lg">
                <CModalHeader className="bg-primary text-white">
                    <CModalTitle>Add Attachment</CModalTitle>
                </CModalHeader>

                <CModalBody className="p-4">

                    {/* Asset Details Box */}
                    {selectedAsset && (
                        <div className="p-3 mb-4 rounded shadow-sm border bg-white">
                            <h6 className="fw-bold mb-3">Asset Details</h6>
                            <div className="row">
                                <div className="col-md-6"><b>Asset ID:</b> {selectedAsset.AssetID}</div>
                                <div className="col-md-6"><b>Name:</b> {selectedAsset.AssetName}</div>
                                <div className="col-md-6"><b>Category:</b> {selectedAsset.Category}</div>
                                <div className="col-md-6"><b>Sub Category:</b> {selectedAsset.SubCategory}</div>
                                <div className="col-md-6"><b>Department:</b> {selectedAsset.Department}</div>
                            </div>
                        </div>
                    )}

                    {/* Upload Section */}
                    <label className="fw-bold">Upload Files</label>

                    <div
                        className="file-drop-area mt-2 p-4 rounded border border-primary bg-light text-center"
                        style={{ cursor: "pointer" }}
                        onClick={() => document.getElementById("fileInput").click()}
                    >
                        <CIcon icon={cilCloudUpload} size="xl" className="text-primary mb-2" />
                        <p className="m-0 text-secondary">Click to select files or drag & drop here</p>
                    </div>

                    <input
                        id="fileInput"
                        type="file"
                        multiple
                        className="d-none"
                        onChange={(e) => setAttachmentFiles(Array.from(e.target.files))}
                    />

                    {/* File Preview List */}
                    {attachmentFiles.length > 0 && (
                        <div className="mt-4">
                            <h6 className="fw-bold mb-3">Files to Upload</h6>

                            {attachmentFiles.map((file, index) => (
                                <div
                                    key={index}
                                    className="d-flex justify-content-between align-items-center p-2 mb-2 rounded border bg-white shadow-sm"
                                >
                                    <div className="d-flex align-items-center">
                                        <CIcon icon={cilFile} size="lg" className="text-info me-2" />
                                        <div>
                                            <div className="fw-semibold">{file.name}</div>
                                            <small className="text-muted">
                                                {(file.size / 1024).toFixed(1)} KB
                                            </small>
                                        </div>
                                    </div>

                                    <button
                                        className="btn btn-sm btn-danger rounded-circle"
                                        onClick={() => removeFile(index)}
                                    >
                                        <CIcon icon={cilX} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </CModalBody>

                <CModalFooter>
                    <CButton color="secondary" onClick={() => setAddAttachmentModal(false)}>
                        Cancel
                    </CButton>
                    <CButton color="primary" onClick={uploadAttachment} disabled={attachmentFiles.length === 0}>
                        Upload Files
                    </CButton>
                </CModalFooter>

                {/* Styles */}
                <style jsx>{`
        .file-drop-area:hover {
            background: #eaf4ff;
            border-color: #0d6efd;
        }
    `}</style>
            </CModal>

            <CModal
                visible={viewAttachmentModal}
                onClose={() => setViewAttachmentModal(false)}
                size="lg"
            >
                <CModalHeader className="bg-light">
                    <CModalTitle className="fw-bold">Attachment Details</CModalTitle>
                </CModalHeader>

                <CModalBody>
                    {attachmentFiles.length === 0 ? (
                        <div className="text-center text-secondary py-3">
                            No files attached.
                        </div>
                    ) : (
                        attachmentFiles.map((file, index) => {
                            const fileUrl = `${API_URL}${file.FilePath}`;

                            return (
                                <div
                                    key={index}
                                    className="d-flex justify-content-between align-items-center border rounded p-3 mb-2 shadow-sm"
                                >
                                    {/* File Info */}
                                    <div className="d-flex align-items-center">
                                        <i className="bi bi-file-earmark fs-3 me-3 text-primary"></i>
                                        <div>
                                            <b>{file.FileName}</b>
                                            <div className="text-muted small">{file.FileType}</div>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="d-flex gap-2">
                                        {/* View Button */}
                                        <a
                                            href={fileUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="btn btn-sm btn-outline-primary"
                                        >
                                            <i className="bi bi-eye"></i> View
                                        </a>

                                        {/* Download Button */}
                                        <a
                                            href={fileUrl}
                                            download={file.FileName}
                                            className="btn btn-sm btn-outline-success"
                                        >
                                            <i className="bi bi-download"></i> Download
                                        </a>

                                        {/* Delete Button */}
                                        <button
                                            className="btn btn-sm btn-outline-danger"
                                            onClick={() =>
                                                handleDeleteAttachment(file.AttachmentID, index)
                                            }
                                        >
                                            <i className="bi bi-trash"></i> Delete
                                        </button>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </CModalBody>

                <CModalFooter>
                    <CButton color="secondary" onClick={() => setViewAttachmentModal(false)}>
                        Close
                    </CButton>
                </CModalFooter>
            </CModal>




            {/* Attachment End */}



            {/* Image Modal Start */}

            <CModal
                // size='md'
                alignment="center"
                visible={Imagevisible}
                onClose={() => setImagevisible(false)}
                aria-labelledby="VerticallyCenteredExample"
            >

                <CModalTitle>

                    <div><h3 className='text-center mt-2'> Part Image</h3></div>

                </CModalTitle>

                <CModalBody>
                    <img src={modalImage} alt="Larger View" style={{ width: '460px', maxHeight: '100%', border: '1px solid' }} />
                </CModalBody>

                <CModalFooter>
                    <div className='m-2 d-flex justify-content-end'>
                        <CButton className="mx-2" type='submit' color="danger" onClick={() => setImagevisible(false)}>
                            CANCEL
                        </CButton>

                    </div>
                </CModalFooter>


            </CModal>
            {/* Image ModalEnd */}

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
                                                        <tr><td><strong>Asset Name</strong></td><td>{user.AssetName || '-'}</td></tr>
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

            {/* Modal For Edit Asset */}
            <div className="modal fade" id="exampleModalEdit" data-bs-backdrop="false"
            >
                <div className="modal-dialog modal-xl modal-dialog-centered">
                    <div className="modal-content">
                        <div className="modal-header p-2 pro-header">
                            <h5 className="modal-title text-white">Edit Asset Details</h5>
                            <button
                                className="btn-close fs-6 me-2 btn-close-white border border-danger"
                                style={{ cursor: "pointer" }}
                                data-bs-dismiss="modal"
                            ></button>
                        </div>
                        <div className="modal-body">
                            <div className="container-fluid">

                                {/* Asset Image */}
                                <div className="row mb-4">
                                    <div className="col-lg-3 text-center">
                                        <div className="card p-3">
                                            <h6 className="text-primary mb-3">Asset Image</h6>
                                            <img
                                                src={image.src || (Register.Image ? `${API_URL}/${Register.Image}` : defaultlogo)}
                                                alt="Asset"
                                                className="rounded-circle border border-dark mx-auto"
                                                style={{ width: "120px", height: "120px", objectFit: "contain", cursor: "pointer" }}
                                                onClick={() => fileInput.current.click()}
                                                onError={(e) => { e.target.onerror = null; e.target.src = defaultlogo; }}
                                            />
                                            <input
                                                type="file"
                                                ref={fileInput}
                                                className="d-none"
                                                accept=".jpg,.jpg,.png"
                                                onChange={handleImg}
                                            />
                                            <small className="text-muted d-block mt-2">Click to change image</small>
                                        </div>
                                    </div>

                                    {/* Input Fields */}
                                    <div className="col-lg-9">

                                        <div className="row g-3">

                                            {/* Text Inputs */}
                                            <div className="col-lg-4">
                                                <label className="form-label fw-semibold text-secondary">Asset ID</label>
                                                <input className="form-control" value={Register.AssetID} disabled />
                                            </div>

                                            <div className=" col-lg-4">
                                                <label className="form-label fw-semibold text-secondary">Asset Package</label>
                                                <div className="d-flex align-items-center gap-2 ">
                                                    <Typeahead
                                                        id="asset-type-typeahead"
                                                        labelKey="PackageName"
                                                        options={AssetPackageData}
                                                        placeholder="Select an Asset Package"
                                                        onChange={selected => {
                                                            if (selected.length > 0) {
                                                                setRegister({ ...Register, PackageName: selected[0].PackageName || "" });
                                                                fetchPackageWiseCategory(selected);
                                                            }
                                                        }}
                                                        className="flex-grow-1"
                                                        selected={
                                                            Register.PackageName
                                                                ? AssetPackageData.filter(item => item.PackageName === Register.PackageName)
                                                                : []
                                                        }
                                                        required
                                                    />

                                                </div>
                                            </div>

                                            {/* Dropdowns using React-Select */}
                                            <div className="col-lg-4">
                                                <label className="form-label fw-semibold text-secondary">Category</label>
                                                <Select
                                                    options={CategoryDropDownData.map(c => ({ value: c.Category, label: c.Category }))}
                                                    value={Register.Category ? { value: Register.Category, label: Register.Category } : null}
                                                    onChange={selected => {
                                                        if (selected.length > 0) {
                                                            setRegister({ ...Register, Category: selected?.value || "" });
                                                            handleCategoryChange(selected);
                                                        }
                                                        else {
                                                            setRegister({ ...Register, Category: "" });
                                                            setSubCategoryData([]);
                                                        }
                                                    }
                                                    }
                                                    isClearable
                                                    placeholder="Select Category"
                                                />
                                            </div>

                                            <div className="col-lg-4">
                                                <label className="form-label fw-semibold text-secondary">Sub-Category</label>
                                                <Select
                                                    options={SubCategoryData.map(s => ({ value: s.SubCategory, label: s.SubCategory }))}
                                                    value={Register.SubCategory ? { value: Register.SubCategory, label: Register.SubCategory } : null}
                                                    onChange={selected => setRegister({ ...Register, SubCategory: selected?.value || "" })}
                                                    isClearable
                                                    placeholder="Select Sub-Category"
                                                />
                                            </div>

                                            {/* Text Inputs */}
                                            <div className="col-lg-4">
                                                <label className="form-label fw-semibold text-secondary">Asset Group</label>
                                                <Typeahead
                                                    id="asset-type-typeahead"
                                                    labelKey="GroupName"
                                                    options={AssetGroupData}
                                                    placeholder="Select an Asset Group"
                                                    onChange={selected => {
                                                        if (selected.length > 0) {
                                                            setRegister({ ...Register, AssetGroupName: selected[0].GroupName || "" });
                                                        } else {
                                                            setRegister({ ...Register, AssetGroupName: "" });
                                                        }
                                                    }}
                                                    selected={
                                                        Register.AssetGroupName
                                                            ? AssetGroupData.filter(item => item.GroupName === Register.AssetGroupName)
                                                            : []
                                                    }
                                                    className="flex-grow-1"
                                                    required
                                                />
                                            </div>

                                            <div className="col-lg-4">
                                                <label className="form-label fw-semibold text-secondary">Asset Name</label>
                                                <input
                                                    className="form-control"
                                                    value={Register.AssetName}
                                                    onChange={e => setRegister({ ...Register, AssetName: e.target.value })}
                                                />
                                            </div>

                                            <div className="col-lg-4">
                                                <label className="form-label fw-semibold text-secondary">Brand</label>
                                                <input
                                                    className="form-control"
                                                    value={Register.Brand}
                                                    onChange={e => setRegister({ ...Register, Brand: e.target.value })}
                                                />
                                            </div>

                                            <div className="col-lg-4">
                                                <label className="form-label fw-semibold text-secondary">Model</label>
                                                <input
                                                    className="form-control"
                                                    value={Register.Model}
                                                    onChange={e => setRegister({ ...Register, Model: e.target.value })}
                                                />
                                            </div>

                                            <div className="col-lg-4">
                                                <label className="form-label fw-semibold text-secondary">Select Department</label>
                                                <Select
                                                    options={DepartmentDropDownData.map(d => ({ value: d.Department, label: d.Department }))}
                                                    value={Register.Department ? { value: Register.Department, label: Register.Department } : null}
                                                    onChange={selected => setRegister({ ...Register, Department: selected?.value || "" })}
                                                    isClearable
                                                    placeholder="Select Department"
                                                />
                                            </div>

                                            <div className="col-lg-4">
                                                <label className="form-label fw-semibold text-secondary">LocationCode</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    placeholder="Enter Location Code"
                                                    value={Register.LocationCode}
                                                    onChange={e => setRegister({ ...Register, LocationCode: e.target.value })}
                                                    disabled
                                                />
                                            </div>
                                            <div className="col-lg-4">
                                                <label className="form-label fw-semibold text-secondary">Building</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    placeholder="Enter Building"
                                                    value={Register.Building}
                                                    onChange={e => setRegister({ ...Register, Building: e.target.value })}
                                                    disabled
                                                />
                                            </div>
                                            <div className="col-lg-4">
                                                <label className="form-label fw-semibold text-secondary">Floor</label>
                                                <input
                                                    type="text"
                                                    className="form-control "
                                                    placeholder="Enter Floor"
                                                    value={Register.Floor}
                                                    onChange={e => setRegister({ ...Register, Floor: e.target.value })}
                                                    disabled
                                                />
                                            </div>
                                            <div className="col-lg-4">
                                                <label className="form-label fw-semibold text-secondary">Room</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    placeholder="Enter Room"
                                                    value={Register.Description}
                                                    onChange={e => setRegister({ ...Register, Description: e.target.value })}
                                                    disabled
                                                />
                                            </div>

                                            <div className="col-12 col-md-6 col-lg-4">
                                                <label className="form-label fw-semibold text-secondary">Asset Type</label>
                                                <Typeahead
                                                    id="branch-typeahead"
                                                    labelKey="AssetType"
                                                    options={AssetType}
                                                    placeholder="Select a Asset Type..."
                                                    onChange={(selected) => {
                                                        setRegister({
                                                            ...Register,
                                                            AssetType: selected.length > 0 ? selected[0].AssetType : ''
                                                        });
                                                    }}
                                                    selected={
                                                        Register.AssetType
                                                            ? AssetType.filter((item) => item.AssetType === Register.AssetType)
                                                            : []
                                                    }
                                                    required
                                                />
                                            </div>

                                            {/* Maintained By */}
                                            <div className="col-12 col-md-6 col-lg-4">
                                                <label className="form-label fw-semibold text-secondary"> Maintained By</label>
                                                <div className="d-flex align-items-center gap-2">
                                                    <Typeahead
                                                        id="asset-type-typeahead"
                                                        labelKey="MaintainbyName"
                                                        options={MaintainedData}
                                                        placeholder="Select an Maintain"
                                                        onChange={selected => {
                                                            if (selected.length > 0) {
                                                                setRegister({
                                                                    ...Register,
                                                                    MaintainbyName: selected.length > 0 ? selected[0].MaintainbyName : "",
                                                                    MaintainById: selected.length > 0 ? selected[0].MaintainById : "",
                                                                });
                                                            } else {
                                                                setRegister({
                                                                    ...Register,
                                                                    MaintainbyName: "",
                                                                    MaintainById: "",
                                                                });
                                                            }
                                                        }}
                                                        selected={
                                                            Register.MaintainbyName
                                                                ? MaintainedData.filter(item => item.MaintainbyName === Register.MaintainbyName)
                                                                : []
                                                        }
                                                        className="flex-grow-1"
                                                        required
                                                    />

                                                </div>
                                            </div>
                                            <hr></hr>

                                            <h6 className="mb-0">
                                                <i className="bi bi-cash-stack me-2"></i>Purchase Details
                                            </h6>


                                            <div className="col-lg-4">
                                                <label className="form-label fw-semibold text-secondary">Invoice Number</label>
                                                <input
                                                    className="form-control"
                                                    value={Register.InvoiceNumber}
                                                    onChange={e => setRegister({ ...Register, InvoiceNumber: e.target.value })}
                                                />
                                            </div>

                                            {/* Vendor */}
                                            <div className="col-lg-4">
                                                <label className="form-label fw-semibold text-secondary">Select Vendor</label>
                                                <Select
                                                    options={VendorData.map(v => ({ value: v.VendorName, label: v.VendorName }))}
                                                    value={Register.VendorName ? { value: Register.VendorName, label: Register.VendorName } : null}
                                                    onChange={handleVendorChange}
                                                    isClearable
                                                    placeholder="Select Vendor"
                                                />
                                            </div>

                                            <div className="col-lg-4">
                                                <label className="form-label fw-semibold text-secondary">Phone Number</label>
                                                <input className="form-control" value={Register.PhoneNumber} disabled />
                                            </div>
                                            <div className="col-lg-4">
                                                <label className="form-label fw-semibold text-secondary">Created Date</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    value={Register.CreatedDate}
                                                    disabled
                                                // onChange={e => setRegister({ ...Register, CreatedDate: e.target.value })}
                                                />
                                            </div>

                                            <div className="col-lg-4">
                                                <label className="form-label fw-semibold text-secondary">Purchase Date</label>
                                                <input
                                                    type="date"
                                                    className="form-control"
                                                    value={Register.PDate}
                                                    onChange={e => setRegister({ ...Register, PDate: e.target.value })}
                                                />
                                            </div>

                                            <div className="col-lg-4">
                                                <label className="form-label fw-semibold text-secondary">Warranty Period</label>
                                                <input
                                                    className="form-control"
                                                    value={Register.WPeriod}
                                                    onChange={(e) => handleChangeWarrantyEndingDate(e)}
                                                />
                                            </div>


                                            <div className="col-lg-4">
                                                <label className="form-label fw-semibold text-secondary">Warranty Type</label>
                                                <Select
                                                    options={[
                                                        { value: "ServiceWarranty", label: "Service Warranty" },
                                                        { value: "OnsiteWarranty", label: "Onsite Warranty" }
                                                    ]}
                                                    value={Register.WType ? { value: Register.WType, label: Register.WType } : null}
                                                    onChange={selected => setRegister({ ...Register, WType: selected?.value || "" })}
                                                    isClearable
                                                    placeholder="Select Warranty Type"
                                                />
                                            </div>


                                            <div className="col-lg-4">
                                                <label className="form-label fw-semibold text-secondary">Warranty End Date</label>
                                                <input
                                                    type="date"
                                                    className="form-control"
                                                    value={Register.WEndDate}
                                                    onChange={e => setRegister({ ...Register, WEndDate: e.target.value })}
                                                // disabled
                                                />
                                            </div>



                                            <div className="col-lg-4">
                                                <label className="form-label fw-semibold text-secondary">Purchase Cost</label>
                                                <input
                                                    className="form-control"
                                                    value={Register.PCost}
                                                    onChange={e => setRegister({ ...Register, PCost: e.target.value })}
                                                />
                                            </div>
                                            {/* Depreciation Type */}
                                            <div className="col-12 col-md-6 col-lg-4">
                                                <label className="form-label">Depreciation Type</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    value={Register.DepreciationType}
                                                    onChange={(e) =>
                                                        setRegister({ ...Register, DepreciationType: e.target.value })
                                                    }
                                                    placeholder="Enter Depreciation Type"
                                                    disabled
                                                />
                                            </div>


                                            {/* Depreciation Value */}
                                            <div className="col-12 col-md-6 col-lg-4">
                                                <label className="form-label">Depreciation Value</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    value={Register.DepreciationValue}
                                                    onChange={(e) =>
                                                        setRegister({ ...Register, DepreciationValue: e.target.value })
                                                    }
                                                    placeholder="Enter Depreciation Value"
                                                />
                                            </div>


                                            {/* Depreciation Mode */}
                                            <div className="col-12 col-md-6 col-lg-4">
                                                <label className="form-label">Depreciation Mode</label>
                                                <select
                                                    className="form-select"
                                                    style={{ minWidth: "120px" }}
                                                    value={Register.DepreciationMode || ""}
                                                    onChange={(e) =>
                                                        setRegister({ ...Register, DepreciationMode: e.target.value })
                                                    }
                                                >
                                                    <option value="Month">Month</option>
                                                    <option value="Year">Year</option>
                                                </select>
                                            </div>

                                            <div className="col-lg-8">
                                                <label className="form-label fw-semibold text-secondary">Description of Product</label>
                                                <input
                                                    type="textarea"
                                                    className="form-control"
                                                    placeholder="Enter Description Of Product"
                                                    value={Register.Description}
                                                    onChange={e => setRegister({ ...Register, Description: e.target.value })}
                                                />
                                            </div>

                                        </div>
                                    </div>
                                </div>

                            </div>
                        </div>

                        <div className="modal-footer">
                            <button type="button" className="btn btn-danger btn-hover-effect" data-bs-dismiss="modal">Close</button>
                            <button type="button" className="btn btn-success btn-hover-effect" onClick={handlechange} data-bs-dismiss="modal">Update</button>
                        </div>

                    </div>
                </div>
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

            {/* Modal1 for RE-Print Label */}
            <div className="modal fade" id="exampleModal1" tabIndex="-1" aria-labelledby="exampleModalLabel1" >
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content">
                        <div className="modal-header ">
                            <h1 className="modal-title fs-5 " id="exampleModalLabel1">Re-Print Label</h1>
                            <button type="button" className="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div className="modal-body">
                            <div className='d-flex row'>
                                <div className='col-lg-6'>
                                    <label>Asset Serial No</label>
                                    <input className='form-control ' value='01' disabled />
                                </div>
                                <div className='col-lg-6'>
                                    <label>Asset Po Number</label>
                                    <input className='form-control ' value='#Po123456	' disabled />
                                </div>
                            </div>
                            <div className='d-flex row'>
                                <div className='col-lg-6'>
                                    <label>GNR Number</label>
                                    <input className='form-control ' value='#Po123456	' disabled />
                                </div>
                                <div className='col-lg-6'>
                                    <label>Purchase Date</label>
                                    <input className='form-control ' value='10/05/2024		' disabled />
                                </div>
                            </div>
                            <div className='d-flex row'>
                                <div className='col-lg-6'>
                                    <label>Select Location</label>
                                    <select className='form-control border border-2'>
                                        <option>
                                            Area-1
                                        </option>
                                        <option>
                                            Area-2
                                        </option>
                                    </select>
                                </div>
                                <div className='col-lg-6'>
                                    <label>Select Room</label>
                                    <select className='form-control border border-2'>
                                        <option>
                                            Room-A1
                                        </option>
                                        <option>
                                            Room-A2
                                        </option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label>
                                    Select Activity
                                </label>
                                <select className='form-control border border-2'>
                                    <option>Check-In</option>
                                    <option>Check-Out</option>
                                </select>
                            </div>
                            <div className='text-center mt-2'>
                                <button className='btn btn-primary col-lg-4'>Re-Print</button>
                            </div>

                        </div>
                    </div>
                </div>
            </div>

            {/*  Modal2 for Re-Map Tag */}
            <div
                className={`modal fade ${isModalVisible ? 'show' : ''}`}
                id="exampleModal2"
                aria-labelledby="exampleModalLabel2"
                style={{ display: isModalVisible ? 'block' : 'none' }}
                ref={modalRef}
            >
                <div className="modal-dialog modal-dialog-centered modal-lg">
                    <div className="modal-content">
                        <div className="modal-header pro-header" >
                            <h1 className="modal-title fs-5 text-white" id="exampleModalLabel2">Re-Mapping Tag</h1>
                            <button type="button" className="btn-close btn-close-white border border-danger" onClick={() => setIsModalVisible(false)}
                            ></button>
                        </div>
                        <div className="modal-body">
                            <div className='card '>
                                <div className='m-5'>
                                    <label>Scanned RFID Number</label>
                                    <input className='form-control' ref={inputRef} onChange={(e) => setRegister({ ...Register, RFIDnumber: e.target.value })} maxLength='24'
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                HandleRe_Mapped();   // 👈 Call function on Enter
                                            }
                                        }}
                                        value={Register.RFIDnumber} />
                                </div>
                            </div>
                            <div className='d-flex row'>
                                <div className='col-lg-6'>
                                    <label>Asset ID</label>
                                    <input className='form-control' disabled value={Register.AssetID} />
                                </div>
                                <div className='col-lg-6'>
                                    <label>Asset Name</label>
                                    <input className='form-control ' disabled value={Register.AssetName} />
                                </div>
                            </div>
                            <div className='d-flex row'>
                                <div className='col-lg-6'>
                                    <label>Description</label>
                                    <input className='form-control ' disabled value={Register.Description} />
                                </div>
                                <div className='col-lg-6'>
                                    <label>Purchase Date</label>
                                    <input className='form-control ' disabled value={Register.PDate} />
                                </div>
                            </div>

                            <div className='text-center mt-2'>
                                <button className='btn btn-info col-lg-4' onClick={HandleRe_Mapped} data-bs-dismiss='modal'>Map Tag</button>
                            </div>
                        </div>

                    </div>
                </div>
            </div>


            {/* Action Buttons */}
            <Card className='mt-4'>
                <div className="card-header pro-header p-1">
                    <div className="d-flex justify-content-center align-items-center">
                        {/* Center Title */}
                        <div className="text-center" >
                            <h3 className="text-white m-0">
                                <i class="bi bi-recycle fs-4 ms-2"></i> Registered Details
                            </h3>
                        </div>


                    </div>
                </div>

                <CardBody>
                    <div className='text-end mt-2'>
                        <CButton type="submit" variant="outline" color="dark" className="me-2"
                            onClick={() => handleprint()}
                        >
                            <CIcon icon={cilPrint} className='me-2' />Print
                        </CButton>

                        {
                            (pageData.addstatus === null || pageData.addstatus === 'i') && auth.UserStatus === 'A' ? '' :
                                <CButton type="submit" color="success" variant="outline" className='me-2 btn-hover-effect' onClick={getSelectedRows}>
                                    Re-Mapping Tag
                                </CButton>
                        }
                        <CButton type="submit" color="danger" variant="outline" className='me-2 btn-hover-effect'
                            data-bs-toggle="modal" data-bs-target="#exampleModal"
                        >
                            <i className="bi bi-cloud-upload me-2"></i>Export
                        </CButton>

                    </div>

                    <div className="d-flex justify-content-end flex-wrap ">
                        {/* <div className="position-relative">
                        <CFormInput
                            placeholder="Search..."
                            value={searchQuery}
                            onChange={handleSearchChange}
                            className="form-control ps-5    "
                        />
                        <i className="bi bi-search position-absolute top-50 start-0 translate-middle-y ps-2 fs-6"></i>
                    </div> */}


                    </div>

                    <div style={{ height: "500px" }} className='ag-theme-quartz mt-2'>
                        {/* <div className='d-flex justify-content-end'>
                        <h6 className='text-end mt-2'>Total Rows : </h6><h5 className='badge bg-dark ms-1 fs-6'>{rowCount}</h5>
                    </div> */}
                        {serverSide !== null && (
                            <AgGridReact
                                ref={gridRef}
                                columnDefs={columndef}
                                rowSelection={"multiple"}
                                getRowHeight={() => 65}
                                onGridReady={onGridReady}
                                {...(serverSide
                                    ? { rowModelType: 'infinite', cacheBlockSize: paginationPageSize }
                                    : { rowData })}
                                autoGroupColumnDef={autoGroupColumnDef} pagination={pagination} paginationPageSize={paginationPageSize} paginationPageSizeSelector={paginationPageSizeSelector}
                            />
                        )}

                    </div>
                </CardBody>
            </Card>

        </div >
    )
}

RegisterDetails.propTypes = {
    auth: PropTypes.any.isRequired,
};

export default RegisterDetails
