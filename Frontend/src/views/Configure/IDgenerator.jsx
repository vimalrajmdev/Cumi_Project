import React, { useMemo, useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { AgGridReact } from 'ag-grid-react';
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import axios from 'axios';
import Swal from 'sweetalert2'
import PropTypes from 'prop-types';
import { getConfig } from 'src/config';
import { FaEdit } from 'react-icons/fa';
import { CButton } from '@coreui/react';
import jsPDF from 'jspdf';
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import logo from 'src/assets/images/Base64/Apple_base64'; // Can also be base64 string
import autoTable from 'jspdf-autotable';
import { useRef } from 'react';
import { right } from '@popperjs/core';
import { BsCassette } from 'react-icons/bs';
import { BallTriangle } from 'react-loader-spinner';
import secureLocalStorage from 'react-secure-storage';

const IDgenerator = ({ auth }) => {
    const [FetchID_data, setFetchID_data] = useState([])
    const [Register, setRegister] = useState({
        CategoryName: '', Prefix: '', Suffix: '', id: ''
    })
    const [Uploadvisible, setUploadvisible] = useState(false)
    const [uploadxl, setuploadxl] = useState(false)
    const [loading, setLoading] = useState(false); // Loader state

    const downloadExcel = async () => {
        const columnDefs = [
            { header: "S.No", key: "S.No" },
            { header: "Category Name", key: "prefixSuffix" },
            { header: "Prefix", key: "Prefix" },
            { header: "Suffix", key: "Suffix" },
            {
                header: "Created By", key: "Createdby",
            },

            {
                header: "Created Date", key: "createdate",
            },
            {
                header: "Last Modified By", key: "updatedby",

            },
            {
                header: "Last Modified Date", key: "updateddate",

            },

        ];
        const rowData = gridRef.current.api.getRenderedNodes().map(n => n.data);
        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet("Asset ID Generator Master");
        // TURN OFF GRIDLINES
        sheet.views = [{ showGridLines: false }];
        const now = new Date();
        const formattedDate = now.toLocaleDateString("en-IN");
        // TITLE
        sheet.mergeCells(1, 1, 1, columnDefs.length);
        const titleCell = sheet.getCell("A1");
        titleCell.value = `ASSET ID GENERATOR MASTER - ${formattedDate}`;
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


                if (c.key === "createdate" || c.key === "updateddate") {
                    return formatDate(v);
                }
                // Remove time from ISO date if exists (2025-11-10T00:00:00)


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
            column.width = maxLength < 10 ? 10 : maxLength + 5;
        });


        const buffer = await workbook.xlsx.writeBuffer();
        saveAs(new Blob([buffer]), "Asset ID Generator Master.xlsx");
    };

    const gridRef = useRef(null);
    //pdf
    const handlepdf = async (selectedDate) => {
        setLoading(true);
        await new Promise(resolve => setTimeout(resolve, 0));

        const filteredData = gridRef.current.api.getModel().rowsToDisplay.map(rowNode => rowNode.data);

        const doc = new jsPDF({ orientation: "landscape", format: 'a4' });
        const title = 'Asset ID Generator Master';

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
            'S.No', 'Category Name', 'Prefix', 'Suffix', 'Created By', 'Created Date', 'Last Modified By', 'Last Modified Date',
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
            item.prefixSuffix || "",
            item.Prefix || "",
            item.Suffix || "",
            item.Createdby || "-",
            formatDate(item.createdate) || "-",
            item.updatedby || "-",
            formatDate(item.updateddate) || "-",

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

            doc.save("Asset ID Generator Master.pdf");
        } else {
            Swal.fire("No data available to export", "", "warning");
        }
        setLoading(false);
    };

    //end pdf
    const navigate = useNavigate();
    const [CategoryDropDownData, SetCategoryDropDownData] = useState([]);

    const location = useLocation();
    let pageData = location.state?.pageData;
    if (!pageData) {
        // Fallback to local storage if available
        const storedData = secureLocalStorage.getItem('pageData');
        pageData = storedData || {};
    }

    const API_URL = getConfig().REACT_APP_API_URL;

    // Save Vendors
    const handleclickSave = async (e) => {
        if (Register.CategoryName === '') {
            Swal.fire({
                icon: 'error',
                title: 'Please Enter Type'
            })
            return
        }
        if (Register.Prefix === '') {
            Swal.fire({
                icon: 'error',
                title: 'Please Enter Prefix'
            })
            return
        }
        if (Register.Suffix === '') {
            Swal.fire({
                icon: 'error',
                title: 'Please Enter Suffix'
            })
            return
        }

        const isValid = FetchID_data.some((item) => {
            return (
                item.prefixSuffix.toString().trim().toLowerCase() === Register.CategoryName.toString().trim().toLowerCase()

            );
        });
        if (isValid) {
            Swal.fire({
                title: 'Type Already Exists',
                icon: 'error',
                confirmButtonText: 'Done'
            });
            return;
        }

        try {
            const alldata = { ...Register, mode: 'I', Createdby: auth.empid, branchid: auth.branchid }
            const response = await axios.post(`${API_URL}/IDgeneratorConfig`, alldata)
            if (response.status === 200) {
                setRegister({
                    CategoryName: '', Prefix: '', Suffix: ''
                })
                Swal.fire({
                    title: 'Saved Successfully',
                    icon: 'success',
                    confirmButtonText: 'Done'
                })
                fetchData();

            }

        } catch (err) {
            console.log(err)
        }
    }
    // HAndle Update
    const HandleUpdate = async (e) => {
        const isValid = FetchID_data.some((item) => {
            return (
                item.prefixSuffix.toString().trim().toLowerCase() === Register.CategoryName.toString().trim().toLowerCase()
                && parseInt(item.Suffix) === parseInt(Register.Suffix)
                && parseInt(item.Prefix) === parseInt(Register.Prefix));
        });
        if (isValid) {
            Swal.fire({
                title: 'Type Already Exists',
                icon: 'error',
                confirmButtonText: 'Done'
            });
            return;
        }
        try {
            const alldata = { ...Register, Createdby: auth.empid, branchid: auth.branchid, mode: 'U' }
            const response = await axios.post(`${API_URL}/IDgeneratorConfig`, alldata)
            if (response.status === 200) {
                fetchData();
                Swal.fire({
                    title: 'Edit ID Successfully',
                    icon: 'success',
                    confirmButtonText: 'Done'
                })

            }

        } catch (err) {
            console.log(err)
        }
    }

    const FetchCategoryDropdown = async () => {
        try {
            const alldata = { mode: 'SD', branchid: auth.branchid };
            const response = await axios.post(`${API_URL}/fetchCategorydata`, alldata);
            if (response.status === 200) {
                // console.log('Fetched categories:', response.data.send); // Debugging line
                SetCategoryDropDownData(response.data.send);
            }
        } catch (err) {
            console.log(err);
        }
    };
    const fetchData = async () => {
        try {
            const alldata = { mode: 'S', CategoryName: '', Createdby: '', branchid: auth.branchid, Prefix: '', Suffix: '', id: '' }
            const response = await axios.post(`${API_URL}/IDgeneratorConfig`, alldata);
            setFetchID_data(response.data);
        } catch (error) {
            console.error('Error fetching user details:', error);
        }
    };
    useEffect(() => {

        fetchData();
        const interval = setInterval(() => {
            fetchData();
        }, 60000);

        // Clean up interval on component unmount
        return () => clearInterval(interval);
    }, [])


    // Table
    const pagination = true;
    const paginationPageSize = 10;
    const paginationPageSizeSelector = [10, 20, 50];

    const EditRenderer = (params) => {

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
                }} onClick={() => handleEditRenderer(params.data.id)} data-bs-toggle="modal" data-bs-target="#VendormodalEDIT">
                <FaEdit className="fs-5" />
            </button></div>

    }
    const handleEditRenderer = async (id) => {
        try {
            const alldata = { mode: 'E', CategoryName: '', Createdby: '', branchid: auth.branchid, Prefix: '', Suffix: '', id: id }
            const response = await axios.post(`${API_URL}/IDgeneratorConfig`, alldata)
            if (response.status === 200) {
                console.log('response.data', response.data);
                const { Prefix, Suffix, branchid, id, prefixSuffix } = response.data[0]
                FetchCategoryDropdown();
                setRegister({
                    ...Register,
                    Prefix: Prefix, Suffix: Suffix, id: id, CategoryName: prefixSuffix
                })
                console.log('Register', Register);

            }

        } catch (err) {
            console.log(err)
        }
    }
    const DeleteRenderer = (params) => {

        return <div><i className="bi bi-trash3 fs-5"></i></div>

    }

    const columndef = [

        {
            headerName: "S.No",
            valueGetter: "node.rowIndex + 1",
            width: 90,
            pinned: 'left', headerCheckboxSelection: true, checkboxSelection: true,
        },
        {
            headerName: "Type", headerClass: 'agheader',
            field: 'prefixSuffix',
            filter: true,
            floatingFilter: true,
            editable: true
        },
        {
            headerName: "Prefix", headerClass: 'agheader',
            field: 'Prefix',
            filter: true,
            floatingFilter: true,

            editable: true
        },
        {
            headerName: "Suffix", headerClass: 'agheader',
            field: 'Suffix',
            filter: true,
            floatingFilter: true,
            editable: true
        },

        {
            headerName: "Created By", headerClass: 'agheader', field: "Createdby",
            valueGetter: (params) => {
                const value = params.data?.Createdby;
                return value || "-";
            }
        },
        {
            headerName: "Created Date", headerClass: 'agheader', field: "createdate",
            valueGetter: (params) => {
                const date = params.data.createdate;
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

        {
            headerName: "Last Modified By", headerClass: 'agheader', field: "updatedby",
            valueGetter: (params) => {
                const value = params.data?.updateby;
                return value || "-";
            }
        }, {
            headerName: "Last Modified Date", headerClass: 'agheader', field: "updateddate",
            valueGetter: (params) => {
                const date = params.data.updateddate;
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
        {
            headerName: "Edit", headerClass: 'agheader',
            field: 'Edit',
            cellRenderer: EditRenderer, pinned: right,
            hide: pageData.EditStatus === null || pageData.EditStatus === 'i',
            width: 100 // Fixed width for action column
        }
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
                formData.append('branchid', auth.branchid);
                formData.append('Createdby', auth.empid);
                const response = await axios.post(`${API_URL}/IDGeneratorUploadData`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });

                const { message, uploadcount, unuploadedFilePath } = response.data;
                console.log(response.data)
                if (unuploadedFilePath) {
                    Swal.fire({
                        title: `Total Uploaded File Count: ${uploadcount}`,
                        text: "Some data could not be uploaded. Please download the file to see the errors.",
                        icon: 'warning',
                        showCancelButton: true,
                        cancelButtonText: 'OK',
                        confirmButtonText: 'Download File',
                    }).then((result) => {
                        if (result.isConfirmed) {
                            const link = document.createElement('a');
                            link.href = `${API_URL}${unuploadedFilePath}`;
                            link.setAttribute('download', 'UnuploadedIDGenerator.xlsx');
                            document.body.appendChild(link);
                            link.click();
                            link.remove();
                        }
                    });
                } else {


                    fetchData();

                    setLoading(false)
                    Swal.fire({
                        title: `Total Uploaded File Count: ${uploadcount}`,
                        text: 'All data uploaded successfully',
                        icon: 'success',
                    });
                }
            } catch (err) {
                console.error(err);
                Swal.fire({
                    title: 'Internal Server Error',
                    icon: 'error',
                });
            } finally {
                setUploadvisible(false);
                setLoading(false);
            }
        }
    };

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


            {/* Modal2 for Download Format */}
            <div className="modal fade" id="exampleModal2" tabIndex="-1" aria-labelledby="exampleModalLabel2" >
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content">
                        <div className="modal-header p-2 pro-header">
                            <h1 className="modal-title fs-5 text-white" id="exampleModalLabel2">Download Format</h1>

                            <button type="button"
                                className="btn-close border border-danger btn-close-white me-2"
                                data-bs-dismiss="modal"
                               >
                            </button>
                        </div>

                        <div className="modal-body">
                            <div className="d-flex justify-content-evenly">
                                <div className="btn btn-success" onClick={downloadExcel}>
                                    <i className="bi bi-file-earmark-spreadsheet fs-1"></i>
                                </div>

                                <div className="btn btn-danger" onClick={handlepdf}>
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

            {/* Add Vendor Modal */}
            <div className="modal fade" id="Vendormodal" tabIndex="-1" aria-labelledby="vendorModalLabel"  data-bs-backdrop="static">
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content border-0 shadow-lg">
                        {/* Modal Header */}
                        <div className="modal-header p-2 text-white pro-header">
                            <h1 className="modal-title fs-5 text-white" id="vendorModalLabel">
                                Create ID
                            </h1>
                            <button
                                type="button"
                                className="btn-close border border-danger btn-close-white me-2"
                                data-bs-dismiss="modal"
                               
                                onClick={() => {
                                    setRegister({
                                        ...Register,
                                        CategoryName: '', Prefix: '', Suffix: '', id: ''
                                    })
                                }}
                            ></button>
                        </div>

                        {/* Modal Body */}
                        <div className="modal-body">
                            <div className="container-fluid">
                                <div className="row g-3">
                                    {/* Category Field */}
                                    <div className="col-12">
                                        <label className="form-label  fw-semibold">
                                            Type <span className="text-danger">*</span>
                                        </label>
                                        <input
                                            className='form-control'
                                            placeholder="Enter Type"
                                            onChange={(e) => setRegister({ ...Register, CategoryName: e.target.value })}
                                            value={Register.CategoryName}
                                        />
                                        {/* <select
                                            className="form-select"
                                            onChange={(e) => {
                                                setRegister({
                                                    ...Register,
                                                    CategoryName: e.target.value
                                                })
                                            }}
                                            value={Register.CategoryName}
                                            required
                                        >
                                            <option value="">Select Category</option>
                                            {CategoryDropDownData.map((option) => (
                                                <option key={option.CategoryID} value={option.Category}>
                                                    {option.Category}
                                                </option>
                                            ))}
                                        </select> */}
                                    </div>

                                    {/* Prefix Field */}
                                    <div className="col-12">
                                        <label className="form-label  fw-semibold">Prefix</label>
                                        <input
                                            className='form-control'
                                            placeholder="Enter prefix (e.g., VEND)"
                                            onChange={(e) => setRegister({ ...Register, Prefix: e.target.value })}
                                            value={Register.Prefix}
                                        />
                                    </div>

                                    {/* Suffix Field */}
                                    <div className="col-12">
                                        <label className="form-label  fw-semibold">Suffix</label>
                                        <input
                                            className='form-control'
                                            type='number'
                                            placeholder="Enter numerical suffix"
                                            onChange={(e) => setRegister({ ...Register, Suffix: e.target.value })}
                                            value={Register.Suffix}
                                        />
                                        <small className="text-muted">Numbers only</small>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="modal-footer border-top-0 bg-light">
                            <button
                                type="button"
                                className="btn btn-outline-secondary"
                                data-bs-dismiss="modal"
                                onClick={() => {
                                    setRegister({
                                        ...Register,
                                        CategoryName: '', Prefix: '', Suffix: '', id: ''
                                    })
                                }}
                            >
                                <i className="bi bi-x-lg me-1"></i> Cancel
                            </button>

                            <button
                                type="button"
                                className="btn btn-primary"
                                data-bs-dismiss="modal"
                                onClick={handleclickSave}
                            >
                                <i className="bi bi-check-lg me-1"></i> Create ID
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Edit Vendor Modal */}
            <div className="modal fade" id="VendormodalEDIT" tabIndex="-1" aria-labelledby="exampleModalLabel"  data-bs-backdrop="static">
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content">

                        {/* Modal Header */}
                        <div className="modal-header p-2 pro-header">
                            <h1 className="modal-title fs-5 text-white" id="vendorModalLabel">
                                Edit ID
                            </h1>
                            <button
                                type="button"
                                className="btn-close border border-danger btn-close-white me-2"
                                data-bs-dismiss="modal"
                               
                                onClick={() => {
                                    setRegister({
                                        ...Register,
                                        CategoryName: '', Prefix: '', Suffix: '', id: ''
                                    })
                                }}
                            ></button>
                        </div>

                        {/* Modal Body */}
                        <div className="modal-body">
                            <div className="container-fluid">
                                <div className="row g-3">
                                    {/* Category Field */}
                                    <div className="col-12">
                                        <label className="form-label  fw-semibold">
                                            Type <span className="text-danger">*</span>
                                        </label>
                                        <input
                                            className='form-control'
                                            placeholder="Enter Type"
                                            onChange={(e) => setRegister({ ...Register, CategoryName: e.target.value })}
                                            value={Register.CategoryName}
                                        />
                                    </div>

                                    {/* Prefix Field */}
                                    <div className="col-12">
                                        <label className="form-label  fw-semibold">Prefix</label>
                                        <input
                                            className='form-control'
                                            placeholder="Enter prefix (e.g., VEND)"
                                            value={Register.Prefix}
                                            onChange={(e) => setRegister({ ...Register, Prefix: e.target.value })}
                                        />
                                    </div>

                                    {/* Suffix Field */}
                                    <div className="col-12">
                                        <label className="form-label  fw-semibold">Suffix</label>
                                        <input
                                            className='form-control'
                                            type='number'
                                            placeholder="Enter numerical suffix"
                                            value={Register.Suffix}
                                            onChange={(e) => setRegister({ ...Register, Suffix: e.target.value })}
                                        />
                                        <small className="text-muted">Numbers only</small>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="modal-footer border-top-0 bg-light">
                            <button
                                type="button"
                                className="btn btn-outline-secondary"
                                data-bs-dismiss="modal"
                                onClick={() => {
                                    setRegister({
                                        ...Register,
                                        CategoryName: '', Prefix: '', Suffix: '', id: ''
                                    })
                                }}
                            >
                                <i className="bi bi-x-lg me-1"></i> Cancel
                            </button>
                            <button
                                type="button"
                                className="btn btn-primary"
                                data-bs-dismiss="modal"
                                onClick={HandleUpdate}
                            >
                                <i className="bi bi-check-lg me-1"></i> Save Changes
                            </button>
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
                                    <div>
                                        <a href="/IDGeneratorTemp.xlsx" className=' nav-link text-decoration-underline ' download>Click to Download</a>
                                    </div>
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

            <div className='card  mt-2'>
                <div className="card-header pro-header p-1">
                    <div className="d-flex align-items-center">
                        {/* Left Space (empty) */}
                        <div style={{ width: "33%" }}></div>

                        {/* Center Title */}
                        <div className="text-center" style={{ width: "34%" }}>
                            <h3 className="text-white m-0  text-nowrap">
                                <BsCassette className='fs-4 mb-1 me-1' /> Asset ID Generator Details
                            </h3>
                        </div>

                        {/* Right Icon */}
                        <div
                            className="text-end"
                            style={{ width: "33%" }}
                        >
                            <button
                                className="btn-close fs-4 me-2 btn-close-white border border-danger"
                                style={{ cursor: "pointer" }}
                                onClick={() => navigate("/Settings/Configure")}
                            ></button>
                        </div>

                    </div>
                </div>
                <div className='px-5'>
                    <div className='text-end my-2 me-2'>
                        {
                            pageData.EditStatus === null || pageData.EditStatus === 'i' ? '' :
                                <CButton type="submit" color="primary" variant="outline" className='me-2 btn-hover-effect fw-bold' onClick={() => setUploadvisible(true)}>
                                    <i className="bi bi-cloud-download me-1"></i>Import
                                </CButton>
                        }
                        <CButton type="submit" color="danger" variant="outline" className='me-2 btn-hover-effect fw-bold'
                            data-bs-toggle="modal"
                            data-bs-target="#exampleModal2"
                        >
                            <i className="bi bi-cloud-upload me-1"></i>Export
                        </CButton>
                        {
                            pageData.EditStatus === null || pageData.EditStatus === 'i' ? '' :
                                <CButton type="submit" color="success" variant="outline" className='me-2 btn-hover-effect fw-bold' data-bs-toggle="modal" data-bs-target='#Vendormodal'
                                    onClick={FetchCategoryDropdown}
                                >
                                    Create ID
                                </CButton>
                        }

                    </div>
                    <div className='ag-theme-quartz mb-5' style={{ height: "400px" }}>
                        <AgGridReact ref={gridRef} rowData={FetchID_data} columnDefs={columndef} rowSelection={"multiple"} autoGroupColumnDef={autoGroupColumnDef} pagination={pagination} paginationPageSize={paginationPageSize} paginationPageSizeSelector={paginationPageSizeSelector} getRowHeight={() => 55} />
                    </div>
                </div>

            </div>

        </div>
    )
}

IDgenerator.propTypes = {
    auth: PropTypes.any.isRequired,
};

export default IDgenerator


