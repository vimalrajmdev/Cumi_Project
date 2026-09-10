import React, { useState, useMemo, useEffect } from 'react'
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AgGridReact } from 'ag-grid-react';
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import axios from 'axios';
import Swal from 'sweetalert2'
import { BallTriangle } from 'react-loader-spinner';
import PropTypes from 'prop-types';
// import logo from '../../../assets/images/Cumi/Cumi_logo.jpg'; // Can also be base64 string
import { FaEdit, FaTrash } from 'react-icons/fa';
import { getConfig } from 'src/config';
import CIcon from '@coreui/icons-react';
import { cilCloudDownload, cilTrash } from '@coreui/icons';
import { CButton } from '@coreui/react';

const UOMMaster = ({ auth }) => {
    const API_URL = getConfig().REACT_APP_API_URL;
    const [Uploadvisible, setUploadvisible] = useState(false)
    const [uploadxl, setuploadxl] = useState(false)
    const [loading, setLoading] = useState(false); // Loader state
    const navigate = useNavigate();
    // Download PDF Format Start
    const generatePDF = async () => {
        setLoading(true);
        try {
            const filteredData = gridRef.current.api.getModel().rowsToDisplay.map(rowNode => rowNode.data);
            const doc = new jsPDF({ format: 'a4' });

            const title = 'UOM_Master';
            const currentUser = auth.employeename || 'Unknown User';
            const currentDateTime = new Date().toLocaleString();

            const pageWidth = doc.internal.pageSize.width;
            const titleY = 15;

            // Insert logo (top-left)
            const logoWidth = 15;
            const logoHeight = 15;
            doc.addImage(logo, 'PNG', 10, 10, logoWidth, logoHeight);

            // User name (top-right)
            // doc.setFontSize(10);
            // doc.text(`User: ${currentUser}`, pageWidth - 10, 12, { align: 'right' });

            // // Date and Time (below user)
            // doc.text(`Date: ${currentDateTime}`, pageWidth - 10, 18, { align: 'right' });

            // Title centered
            doc.setFontSize(14);
            doc.setFont("helvetica", "bold");
            doc.text(title, pageWidth / 2, titleY, { align: 'center' });

            if (filteredData.length > 0) {
                const columnMapping = [
                    { header: "UOMType Code", key: 'UOMCode' },
                    { header: "UOMType", key: 'UOMType' },

                ];

                const columnHeaders = columnMapping.map(col => col.header);
                const data = filteredData.map(obj => columnMapping.map(col => obj[col.key] || ''));

                doc.autoTable({
                    head: [columnHeaders],
                    body: data,
                    margin: { top: 30, right: 10, left: 40, bottom: 20 },
                    theme: 'grid', // Ensures full grid with borders
                    styles: {
                        fontSize: 10,
                        halign: "center",
                        valign: "middle",
                        overflow: 'linebreak',
                        cellWidth: 'auto',
                        lineColor: [0, 0, 0], // Black border
                        lineWidth: 0.1,
                    },
                    headStyles: {
                        fillColor: ['#3f77d2'],
                        textColor: [255, 255, 255],
                        lineColor: [0, 0, 0],
                        lineWidth: 0.1,
                        fontStyle: 'bold'
                    },
                    bodyStyles: {
                        fillColor: [245, 245, 245],
                        textColor: [0, 0, 0],
                        lineColor: [0, 0, 0],
                        lineWidth: 0.1,
                    },
                    columnStyles: {
                        0: { cellWidth: 60 },
                        1: { cellWidth: 60 },
                    },
                    didDrawPage: function (data) {
                        const pageWidth = doc.internal.pageSize.width;
                        const pageHeight = doc.internal.pageSize.height;

                        // Header - Logo (top-left)
                        const logoWidth = 15;
                        const logoHeight = 15;
                        doc.addImage(logo, 'PNG', 10, 10, logoWidth, logoHeight);

                        // Header - User and Date (top-right)
                        doc.setFontSize(10);
                        doc.text(`User: ${currentUser}`, pageWidth - 10, 12, { align: 'right' });
                        doc.text(`Date: ${currentDateTime}`, pageWidth - 10, 18, { align: 'right' });

                        // Header - Centered Title
                        doc.setFontSize(14);
                        doc.setFont("helvetica", "bold");
                        doc.text(title, pageWidth / 2, 15, { align: 'center' });

                        // Footer - Page number
                        doc.setFontSize(10);
                        doc.text(`Page ${data.pageNumber}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
                    }
                });
                doc.save('UOM_Master.pdf');
                setLoading(false);
            } else {
                alert('No data available to export');
                setLoading(false);
            }
        } catch (error) {
            console.error("Error generating PDF:", error);
            alert('Failed to generate PDF. Please try again.');
            setLoading(false);
        }
    };


    // Download PDF Format END
    const location = useLocation();
    let pageData = location.state?.pageData;
    if (!pageData) {
        // Fallback to local storage if available
        const storedData = localStorage.getItem('pageData');
        pageData = storedData ? JSON.parse(storedData) : {};
    }

    // Download Excel
    const gridRef = useRef(null);
    const downloadExcel = () => {
        const params = {
            fileName: 'UOMType.csv',
            columnKeys: ['UOMCode', 'UOMType'],
        };
        gridRef.current.api.exportDataAsCsv(params);
    };

    const [Register, setRegister] = useState({
        UOMType: '', UOMCode: '', id: '', CreatedBy: ''
    })
    // Handle Save Data
    const handleSave = async (e) => {

        if (Register.UOMType === '') {
            Swal.fire({
                icon: 'warning',
                title: 'Please Enter UOMType'
            })
            return
        }
        if (Register.UOMCode === '') {
            Swal.fire({
                icon: 'warning',
                title: 'Please Enter UOMType Code'
            })
            return
        }

        const isValidPartCode = UOMTypeData.some((item) => {
            return item.UOMCode.toLowerCase() === Register.UOMCode.toLowerCase()
        });

        if (isValidPartCode) {
            swal({
                text: "This Center Code is Already Exitsing",
                icon: "warning"
            });
            return;
        }

        try {

            const alldata = { ...Register, mode: 'I', CreatedBy: auth.employeename }
            // console.log(alldata)
            const response = await axios.post(`${API_URL}/DropdownUOMMaster`, alldata)
            if (response.status === 200) {
                fetchData();
                Swal.fire({
                    title: 'Saved Successfully',
                    icon: 'success',
                    confirmButtonText: 'Done'
                })

                setRegister({
                    ...Register,
                    UOMType: '', UOMCode: '', id: '', CreatedBy: ''
                })
            }
        } catch (err) {
            console.log(err)
        }
    }


    // Table 
    const pagination = true;
    const paginationPageSize = 100;
    const paginationPageSizeSelector = [10, 20, 50];

    const EditRenderer = (params) => {
        if ((pageData.editstatus === null || pageData.editstatus === 'i') && auth.UserStatus === 'A') {
            return null; // Hide the button by returning null
        }
        return <div>
            <button className='btn btn-hover-effect' data-bs-toggle="modal" data-bs-target="#exampleModalEDIT" onClick={() => handleEditUOMType(params.data)} style={{
                background: 'linear-gradient(135deg, #007bff, #00b4d8)', // blue gradient
                color: '#fff',
                border: 'none',
                borderRadius: '50%', // circular button
                padding: '7px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(0, 123, 255, 0.35)',
                transition: 'all 0.3s ease',
                // width: '44px',
                // height: '44px',
                // marginRight: '8px',
            }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'linear-gradient(135deg, #3399ff, #33ccff)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 6px 18px rgba(51, 204, 255, 0.45)';
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'linear-gradient(135deg, #007bff, #00b4d8)';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 123, 255, 0.35)';
                }}>
                {/* <i className="bi bi-pen fs-5"></i> */}

                <FaEdit className="fs-5" title="Edit" />
            </button>
        </div>

    }
    // Handle EDIT UOMType
    const handleEditUOMType = async (data) => {
        try {
            const alldata = { ...data, mode: 'E' }
            console.log(alldata)
            const response = await axios.post(`${API_URL}/DropdownUOMMaster`, alldata)
            if (response.status === 200) {
                console.log(response.data)
                setRegister(...response.data)
            }

        } catch (err) {
            console.log(err)
        }
    }
    // Handle Edit Updated Data
    const handleEdit = async () => {
        try {
            const alldata = { ...Register, mode: 'U', CreatedBy: auth.employeename }
            const response = await axios.post(`${API_URL}/DropdownUOMMaster`, alldata)
            if (response.status === 200) {

                fetchData();
                Swal.fire({
                    title: 'EDIT UOMType Successfully',
                    icon: 'success',
                    confirmButtonText: 'Done'
                })

                setRegister({
                    ...Register,
                    UOMType: '', UOMCode: '', id: '', CreatedBy: ''
                })

            }

        } catch (err) {
            console.log(err)
        }
    }
    const DeleteRenderer = (params) => {
        if ((pageData.deletestatus === null || pageData.deletestatus === 'i') && auth.UserStatus === 'A') {
            return null; // Hide the button by returning null
        }
        return <div>
            <button
                className='mt-1 ms-1'
                onClick={() => handleDelete(params.data)}
                style={{
                    background: 'linear-gradient(135deg, #ff4d4d, #ff1a1a)', // red gradient
                    color: '#fff',
                    border: 'none',
                    borderRadius: '50%',
                    padding: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(255, 0, 0, 0.35)',
                    transition: 'all 0.3s ease',
                    // width: '44px',
                    // height: '44px',
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'linear-gradient(135deg, #ff6666, #ff3333)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 6px 18px rgba(255, 80, 80, 0.45)';
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'linear-gradient(135deg, #ff4d4d, #ff1a1a)';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(255, 0, 0, 0.35)';
                }}
            >
                <CIcon icon={cilTrash} size="xl" />
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
                const response = await axios.post(`${API_URL}/DropdownUOMMaster`, alldata)
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
    const columndef = [
        { headerCheckboxSelection: true, checkboxSelection: true,headerClass: 'agheader',  flex: 1 },
        { headerName: "UOM Type Code", field: 'UOMCode', filter: true, floatingFilter: true,headerClass: 'agheader',  width: 400,  flex: 2 },
        { headerName: "UOM Type", field: 'UOMType', filter: true, floatingFilter: true, headerClass: 'agheader', width: 400,  flex: 2 },
        { headerName: "Edit", field: 'Edit', cellRenderer: EditRenderer, width: 200, headerClass: 'agheader', flex: 1 },
        { headerName: "Delete", field: 'Delete', cellRenderer: DeleteRenderer, headerClass: 'agheader', flex: 1 }
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
    const [UOMTypeData, setUOMTypeData] = useState([])

    const fetchData = async () => {
        try {
            const alldata = { mode: 'FetchUOMType', UOMType: '', UOMCode: '', id: '', CreatedBy: '' }
            const response = await axios.post(`${API_URL}/DropdownUOMMaster`, alldata);
            // console.log(response.data)
            setUOMTypeData(response.data);
        } catch (error) {
            console.error('Error fetching user details:', error);
        }
    };
    useEffect(() => {

        fetchData();
    }, [])


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
            text: "Once uploaded, you will not be able to check the UOM list immediately!",
            icon: "warning",
            showCancelButton: true,
            cancelButtonText: 'Cancel',
            confirmButtonText: 'Upload',
        });




        if (result.isConfirmed) {
            setLoading(true);
            try {
                const formData = new FormData();
                formData.append('file', uploadxl);

                const response = await axios.post(`${API_URL}/UOMUploadData`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });

                const { message, uploadcount, unuploadedFilePath } = response.data;
                // console.log(response.data)
                if (unuploadedFilePath) {
                    Swal.fire({
                        title: `Total Uploaded Count: ${uploadcount}`,
                        text: `${message}`,
                        icon: 'warning',
                        showCancelButton: true,
                        cancelButtonText: 'OK',
                        confirmButtonText: 'Download File',
                    }).then((result) => {
                        if (result.isConfirmed) {
                            const link = document.createElement('a');
                            link.href = `${API_URL}${unuploadedFilePath}`;
                            link.setAttribute('download', 'unuploaded_UOM_data.xlsx');
                            document.body.appendChild(link);
                            link.click();
                            link.remove();
                        }
                    });
                } else {


                    fetchData();
                    setLoading(false)
                    Swal.fire({
                        title: `Total Uploaded Count: ${uploadcount}`,
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

        <div className='mt-4'>
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
            <div className="modal fade" id="exampleModal2" tabIndex="-1" aria-labelledby="exampleModalLabel2" aria-hidden="true" data-bs-backdrop="static">
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content">
                        <div className="modal-header p-2" style={{ background: '#3f77d2' }}>
                            <h1 className="modal-title fs-5 text-white" id="exampleModalLabel2">Download Format</h1>
                            <button type="button" className="btn-close btn-hover-effect me-2" data-bs-dismiss="modal" aria-label="Close" style={{
                                backgroundColor: 'white',
                                color: 'black',  // text color (or change it to a color you prefer)
                                border: '1px solid #ccc', // optional border
                            }}></button>
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

            {/* Modal3 for Add UOMType */}
            <div className="modal fade" id="exampleModal3" tabIndex="-1" aria-labelledby="exampleModalLabel3" aria-hidden="true" data-bs-backdrop="static">
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content">

                        <div className="modal-header  text-white rounded-top-3 p-2" style={{ background: "#3f77d2" }}>
                            <h5 className="modal-title fw-semibold text-white" id="exampleModalLabel3">
                                Add UOM Type
                            </h5>
                            <button
                                type="button"
                                className="btn-close btn-close-white me-2"
                                data-bs-dismiss="modal"
                                aria-label="Close"
                            ></button>
                        </div>
                        <div className="modal-body p-4">
                            <div className='mb-3'>
                                <label className='form-label'>UOM Type Code</label>
                                <input className='form-control mt-2 ' onChange={(e) => setRegister({ ...Register, UOMCode: e.target.value })}
                                    value={Register.UOMCode}
                                    placeholder='Enter UOM Code'
                                />

                            </div>
                            <div className='mb-3'>
                                <label className='form-label'>UOM Type Name</label>
                                <input className='form-control mt-2 ' onChange={(e) => setRegister({ ...Register, UOMType: e.target.value })}
                                    value={Register.UOMType}
                                    placeholder='Enter UOM Type'
                                />
                            </div>
                        </div>

                        <div className="modal-footer justify-content-center ">
                            <button
                                type="button"
                                data-bs-dismiss="modal"
                                aria-label="Close"
                                className="btn btn-hover-effect d-flex align-items-center gap-2"
                                onClick={handleSave}
                                style={{
                                    background: 'linear-gradient(135deg, #00c853, #009624)', // green gradient
                                    color: '#fff',
                                    border: 'none',
                                    borderRadius: '12px',
                                    fontWeight: 600,
                                    padding: '10px 22px',
                                    boxShadow: '0 4px 15px rgba(0, 200, 83, 0.35)',
                                    transition: 'all 0.3s ease',
                                    cursor: 'pointer',
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.background = 'linear-gradient(135deg, #00e676, #00c853)';
                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                    e.currentTarget.style.boxShadow = '0 6px 20px rgba(0, 200, 83, 0.45)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.background = 'linear-gradient(135deg, #00c853, #009624)';
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = '0 4px 15px rgba(0, 200, 83, 0.35)';
                                }}
                            >
                                <i className="bi bi-check2-circle"></i> Save
                            </button>
                        </div>

                    </div>
                </div>
            </div>

            {/* Modal3 for EDIT Add UOMType */}
            <div className="modal fade" id="exampleModalEDIT" tabIndex="-1" aria-labelledby="exampleModalLabel3" aria-hidden="true" data-bs-backdrop="static">
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content">
                        <div className="modal-header  text-white rounded-top-3 p-2" style={{ background: '#3f77d2' }}>
                            <h5 className="modal-title fw-semibold text-white" id="exampleModalLabel3">
                                Edit UOM Type
                            </h5>
                            <button
                                type="button"
                                className="btn-close btn-close-white"
                                data-bs-dismiss="modal"
                                aria-label="Close"
                            ></button>
                        </div>
                        <div className="modal-body p-4">
                            <div className='mb-3'>
                                <label className='form-label '>UOM Type Code</label>
                                <input className='form-control mt-2 ' onChange={(e) => setRegister({ ...Register, UOMCode: e.target.value })}
                                    value={Register.UOMCode}
                                    placeholder='Enter UOM Code'
                                />

                            </div>
                            <div className='mb-3'>
                                <label className='form-label '>UOM Type Name</label>
                                <input className='form-control mt-2 ' onChange={(e) => setRegister({ ...Register, UOMType: e.target.value })}
                                    value={Register.UOMType}
                                    placeholder='Enter UOM Type'
                                />
                            </div>
                        </div>

                        <div className="modal-footer justify-content-center ">
                            <button
                                style={{
                                    background: 'linear-gradient(135deg, #8e2de2, #4a00e0)', // purple gradient
                                    color: '#fff',
                                    border: 'none',
                                    borderRadius: '12px',
                                    fontWeight: 600,
                                    padding: '10px 18px',
                                    boxShadow: '0 4px 15px rgba(142, 45, 226, 0.35)',
                                    transition: 'all 0.3s ease',
                                    cursor: 'pointer',
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.background = 'linear-gradient(135deg, #a043ff, #5c25ff)';
                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                    e.currentTarget.style.boxShadow = '0 6px 20px rgba(142, 45, 226, 0.45)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.background = 'linear-gradient(135deg, #8e2de2, #4a00e0)';
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = '0 4px 15px rgba(142, 45, 226, 0.35)';
                                }}
                                className="btn shadow-sm"
                                onClick={handleEdit}
                                data-bs-dismiss="modal"
                                aria-label="Close"
                            >
                                <i className="bi bi-arrow-repeat"></i> Update
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
                                <button type="button" className="btn-close btn-hover-effect" onClick={() => setUploadvisible(false)}></button>

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
                                        <a href="/UOM_Dropdown_MasterTemp.xlsx" className=' nav-link text-decoration-underline ' download>Click to Download</a>
                                    </div>
                                </div>
                                <div className="text-center mt-3">
                                    <button className="btn btn-danger mx-2 btn-hover-effect" onClick={() => setUploadvisible(false)}>
                                        CANCEL
                                    </button>
                                    <button className="btn btn-success mx-2 btn-hover-effect" onClick={handleUploadData}>
                                        Upload Data
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className='card'>
                {/* Action Buttons */}
                <div className='card-header d-flex justify-content-between align-items-center' style={{ background: '#3f77d2' }}>
                    <h4 className='text-white'> <i class="bi bi-list-ul me-2"></i> UOM Type Details</h4>
                    <i
                        className="bi bi-x-lg text-white fs-4 me-2"
                        style={{ cursor: 'pointer' }}
                        onClick={() => navigate("/Settings/Configure")}
                    />
                </div>

                <div className='card-body px-5 pb-5'>
                    <div className="d-flex justify-content-end my-2 flex-wrap gap-2">
                        {
                            (pageData.addstatus === null || pageData.addstatus === 'i') && auth.UserStatus === 'A'
                                ? '' :
                                <CButton
                                    type="submit"
                                    color="primary"
                                    className="btn-hover-effect  d-flex align-items-center gap-2 ms-2"
                                    onClick={() => setUploadvisible(true)}
                                    style={{
                                        background: 'linear-gradient(135deg, #007bff, #00b4d8)', // blue gradient
                                        color: '#fff',
                                        border: 'none',
                                        borderRadius: '12px',
                                        fontWeight: 600,
                                        padding: '10px 18px',
                                        boxShadow: '0 4px 15px rgba(0, 123, 255, 0.35)',
                                        transition: 'all 0.3s ease',
                                        cursor: 'pointer',
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.background = 'linear-gradient(135deg, #3399ff, #33ccff)';
                                        e.currentTarget.style.transform = 'translateY(-2px)';
                                        e.currentTarget.style.boxShadow = '0 6px 20px rgba(51, 204, 255, 0.45)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.background = 'linear-gradient(135deg, #007bff, #00b4d8)';
                                        e.currentTarget.style.transform = 'translateY(0)';
                                        e.currentTarget.style.boxShadow = '0 4px 15px rgba(0, 123, 255, 0.35)';
                                    }}
                                >
                                    <CIcon icon={cilCloudDownload} /> Import
                                </CButton>
                        }

                        <button
                            className="d-flex align-items-center gap-2"
                            data-bs-toggle="modal"
                            data-bs-target="#exampleModal2"
                            title="Download Excel"
                            style={{
                                background: 'linear-gradient(135deg, #ff4b2b, #ff0000)', // red gradient
                                color: '#fff',
                                border: 'none',
                                borderRadius: '12px',
                                fontWeight: 600,
                                padding: '10px 18px',
                                boxShadow: '0 4px 15px rgba(255, 0, 0, 0.35)',
                                transition: 'all 0.3s ease',
                                cursor: 'pointer',
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = 'linear-gradient(135deg, #ff6b4b, #ff1a1a)';
                                e.currentTarget.style.transform = 'translateY(-2px)';
                                e.currentTarget.style.boxShadow = '0 6px 20px rgba(255, 0, 0, 0.45)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'linear-gradient(135deg, #ff4b2b, #ff0000)';
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '0 4px 15px rgba(255, 0, 0, 0.35)';
                            }}
                        >
                            <i className="bi bi-cloud-download"></i>
                            Export
                        </button>
                        {
                            (pageData.addstatus === null || pageData.addstatus === 'i') && auth.UserStatus === 'A'
                                ? '' :
                                <button
                                    className="btn btn-success px-4 d-flex align-items-center gap-2 btn-hover-effect"
                                    data-bs-toggle="modal" data-bs-target="#exampleModal3"
                                    onClick={() => {
                                        setRegister({
                                            ...Register,
                                            UOMCode: '', UOMType: ''
                                        })
                                    }}
                                    style={{
                                        background: 'linear-gradient(135deg, #00c853, #009624)', // green gradient
                                        color: '#fff',
                                        border: 'none',
                                        borderRadius: '12px',
                                        fontWeight: 600,
                                        padding: '10px 18px',
                                        boxShadow: '0 4px 15px rgba(0, 200, 83, 0.35)',
                                        transition: 'all 0.3s ease',
                                        cursor: 'pointer',
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.background = 'linear-gradient(135deg, #00e676, #00c853)';
                                        e.currentTarget.style.transform = 'translateY(-2px)';
                                        e.currentTarget.style.boxShadow = '0 6px 20px rgba(0, 200, 83, 0.45)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.background = 'linear-gradient(135deg, #00c853, #009624)';
                                        e.currentTarget.style.transform = 'translateY(0)';
                                        e.currentTarget.style.boxShadow = '0 4px 15px rgba(0, 200, 83, 0.35)';
                                    }}
                                >
                                    <i className="bi bi-plus-lg me-1"></i>Add
                                </button>
                        }
                    </div>
                    <div className='ag-theme-quartz' style={{ height: "400px" }}>
                        <AgGridReact ref={gridRef} rowData={UOMTypeData} columnDefs={columndef} rowSelection={"multiple"} autoGroupColumnDef={autoGroupColumnDef} pagination={pagination} paginationPageSize={paginationPageSize} paginationPageSizeSelector={paginationPageSizeSelector} />
                    </div>
                </div>
            </div>

            {/* <div className='mt-2'>
                <Link className='btn btn-danger' to='/Masters/dropdownMaster'>Back To Dropdown Master</Link>
            </div> */}
        </div>

    )
}

UOMMaster.propTypes = {
    auth: PropTypes.any.isRequired,
};

export default UOMMaster
