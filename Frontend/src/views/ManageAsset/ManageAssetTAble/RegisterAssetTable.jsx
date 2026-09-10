import React, { useMemo, useState, useEffect, useRef, useContext } from 'react'
import { AgGridReact } from 'ag-grid-react';
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import axios from 'axios';
import Swal from 'sweetalert2';
import swal from 'sweetalert';
import { Row, Col, Card, CardHeader } from 'react-bootstrap';
// import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import Select from "react-select";
import PropTypes from 'prop-types';
import { BallTriangle } from 'react-loader-spinner';
import { useLocation } from "react-router-dom";
import { getConfig } from 'src/config';
import { CButton, CCol, CModal, CModalBody, CModalFooter, CModalTitle, CRow } from '@coreui/react';
import defaultlogo from '../../../assets/images/apple-logo.png'; // no curly braces!
import { useNavigate } from 'react-router-dom';
import { Typeahead } from 'react-bootstrap-typeahead';
import 'react-bootstrap-typeahead/css/Typeahead.css';
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import logo from 'src/assets/images/Base64/Apple_base64'; // Can also be base64 string
import autoTable from 'jspdf-autotable';
import { right } from '@popperjs/core';
import { FaEdit } from 'react-icons/fa';
import { IoEye } from 'react-icons/io5';
import secureLocalStorage from 'react-secure-storage';
const RegisterAssetTable = ({ auth }) => {
    const [Uploadvisible, setUploadvisible] = useState(false)
    const [uploadxl, setuploadxl] = useState(false)
    const [loading, setLoading] = useState(false); // Loader state
    const API_URL = getConfig().REACT_APP_API_URL;
    const navigate = useNavigate();
    const [AssetType, setAssetType] = useState([]);
    // const { auth } = useContext(AuthContext)
    const [Register, setRegister] = useState(
        {
            AssetID: '', AssetName: '', Brand: '', Model: '', Category: '', SubCategory: '', Department: '', Vendors: '', POnumber: '', GRNnumber: '', PDate: '', PCost: '', WType: '', WPeriod: '', WEndDate: '', Description: '', Activity: '', SelectPType: '', RFID: '', UpdatedBy: '', AssetMappedBy: '', Movement: '', id: '', InvoiceNumber: '', Status: '', LocationCode: '', LocationRFID: '', Image: '', VendorName: '', PhoneNumber: '', Building: '', Floor: '', Room: '',
            AssetType: '', GroupName: '', BUnitName: '', MaintainbyName: '', MaintainById: '', AssetGroupName: '', BUnitId: '', PackageName: '', CreatedDate: '',
            DepreciationType: 'Straight Line', DepreciationMode: 'Year', DepreciationValue: ''
        }
    )
    const location = useLocation();
    let pageData = location.state?.pageData;
    if (!pageData) {
        // Fallback to local storage if available
        const storedData = secureLocalStorage.getItem('pageData');
        pageData = storedData || {};
    }
    // console.log("pageData", pageData);


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

    // Upload Image End 


    const [CategoryDropDownData, SetCategoryDropDownData] = useState([])
    const [SubCategoryData, setSubCategoryData] = useState([]);
    //    MAP Selected Row Data
    const modalRef = useRef(null);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isModalVisible1, setIsModalVisible1] = useState(false);
    const [DepartmentDropDownData, SetDepartmentDropDownData] = useState([])
    // const [unuploadfillink, setunuploadfillink] = useState(false)
    const [inputdata, setInputdata] = useState({
        RFIDnumber: ''
    })
    const pagination = true;
    const paginationPageSize = 50;
    const paginationPageSizeSelector = [10, 50, 100];
    // View Start
    const [view, setview] = useState([]);
    const handleView = async (id) => {
        try {
            const alldata = { id, mode: 'S', branchid: auth.branchid, BranchAccess: auth.BranchAccess }
            const response = await axios.post(`${API_URL}/ViewRegister`, alldata);
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

    // View End

    // Edit Start
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

    const [DepreciationData, setDepreciationData] = useState([])

    const fetchDepreciationData = async () => {
        try {
            const alldata = { mode: 'S', branchid: auth.branchid, BranchAccess: auth.BranchAccess, DepreciationId: '' }
            const response = await axios.post(`${API_URL}/DepreciationConfig`, alldata);
            setDepreciationData(response.data);
        } catch (error) {
            console.error('Error fetching user details:', error);
        }
    };

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
            setRegister(...response.data.send);
            fetchAssetType();
            fetchDepreciationData();
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
        if (pageData.editstatus === null || pageData.editstatus === 'i') {
            return null; // Hide the button by returning null
        }
        return <div>
            {/* <button className='btn' onClick={() => handleEdit(params.data.id)}>
                <i className="bi bi-pen fs-5"></i>
            </button> */}
            <button
                className="border-0  rounded-circle d-flex justify-content-center align-items-center" data-bs-toggle="modal" data-bs-target="#exampleModalEdit" onClick={() => handleEdit(params.data.id)}
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
                }}
            > <FaEdit className="fs-5" /></button>
        </div>

    }

    const [AssetPackageData, setAssetPackageData] = useState([])

    const fetchAssetPackageData = async () => {
        try {
            const alldata = { mode: 'getPackage', branchid: auth.branchid, BranchAccess: auth.BranchAccess, PackageId: '' }
            const response = await axios.post(`${API_URL}/PackageConfig`, alldata);
            setAssetPackageData(response.data);
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
        if (auth.branchid === "0" || auth.branchid === 0) {
            Swal.fire({
                icon: 'warning',
                title: 'Invalid Selection',
                text: "Please select a specific branch. 'ALL' is not allowed.",
            });
            return;
        }
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

    // Edit End
    const [rowData, setRowData] = useState([]);
    const fetchData = async () => {
        setLoading(true)
        try {
            const response = await axios.post(`${API_URL}/RegisterAssetInfo`, { branchid: auth.branchid, BranchAccess: auth.BranchAccess });
            setRowData(response.data.senddata);
            if (response.status === 200) {
                setLoading(false)
            }
        } catch (error) {
            setLoading(false)
            console.error('Error fetching user details:', error);
        }
    };
    const [modalImage, setModalImage] = useState(null); // State for modal image URL
    const [Imagevisible, setImagevisible] = useState(false)

    const handleImageClick = (imageUrl) => {
        // const fullImageUrl = `${API_URL}/${imageUrl}`;
        setModalImage(imageUrl);
        setImagevisible(true)
    };
    // Table for All Asset

    const columdef = [

        {
            checkboxSelection: true, width: 50, cellClass: 'center-align',
            headerName: "S.No",
            valueGetter: "node.rowIndex + 1",
            width: 80,
            pinned: 'left'
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
                const isValidImage = params.value && params.value.trim() !== "";
                const imagePath = isValidImage ? `${API_URL}/${params.value}` : defaultlogo;
                return (
                    <img
                        src={imagePath}
                        loading="lazy"
                        decoding="async"
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

        // {
        //     headerName: "Image", field: "Image", width: 100, cellRenderer: params => (
        //         <img src={params.value} alt="Asset" style={{ maxWidth: '40px', maxHeight: '40px', objectFit: 'contain' }} />
        //     )
        // },
        {
            headerName: "Asset ID", headerClass: 'agheader', field: "AssetID", filter: true, floatingFilter: true, cellClass: 'center-align', editable: true,
            valueGetter: (params) => {
                const value = params.data?.AssetID;
                return value || "-";
            }
        },
        {
            headerName: "Asset Type", headerClass: 'agheader', field: "AssetType", filter: true, floatingFilter: true, cellClass: 'center-align', editable: true,
            valueGetter: (params) => {
                const value = params.data?.AssetType;
                return value || "-";
            }
        },
        // { headerName: "Asset Name", field: "AssetName", filter: true,floatingFilter: true,editable:true },
        {
            headerName: "Description", headerClass: 'agheader', field: "Description", filter: true, floatingFilter: true, cellClass: 'center-align', editable: true,
            valueGetter: (params) => {
                const value = params.data?.Description;
                return value || "-";
            }
        },
        // { headerName: "Invoice Number", field: "InvoiceNumber", filter: true,floatingFilter: true,editable:true },
        // { headerName: "Vendor Name", field: "Vendors", filter: true,floatingFilter: true,editable:true },
        {
            headerName: "Asset Group", headerClass: 'agheader', field: "AssetGroupName", filter: true, floatingFilter: true, cellClass: 'center-align', editable: true,
            valueGetter: (params) => {
                const value = params.data?.AssetGroupName;
                return value || "-";
            }
        },
        {
            headerName: "Category", headerClass: 'agheader', field: "Category", filter: true, floatingFilter: true, cellClass: 'center-align', editable: true,
            valueGetter: (params) => {
                const value = params.data?.Category;
                return value || "-";
            }
        },
        {
            headerName: "Sub Category", headerClass: 'agheader', field: "SubCategory", filter: true, floatingFilter: true, cellClass: 'center-align', editable: true,
            valueGetter: (params) => {
                const value = params.data?.SubCategory;
                return value || "-";
            }
        },
        {
            headerName: "Department", headerClass: 'agheader', field: "Department", filter: true, floatingFilter: true, cellClass: 'center-align', editable: true,
            valueGetter: (params) => {
                const value = params.data?.Department;
                return value || "-";
            }
        },
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
            headerName: 'vendor Name', headerClass: 'agheader', field: 'VendorName', filter: true, cellClass: 'center-align', floatingFilter: true, editable: true,
            valueGetter: (params) => {
                const value = params.data?.VendorName;
                return value || "-";
            }
        },
        {
            headerName: 'Phone Number', headerClass: 'agheader', field: 'PhoneNumber', filter: true, cellClass: 'center-align', floatingFilter: true, editable: true,
            valueGetter: (params) => {
                const value = params.data?.PhoneNumber;
                return value || "-";
            }
        },
        {
            headerName: 'Depreciation Type', headerClass: 'agheader', field: 'DepreciationType', filter: true, cellClass: 'center-align', floatingFilter: true, editable: true,
            valueGetter: (params) => {
                const value = params.data?.DepreciationType;
                return value || "-";
            }
        },
        {
            headerName: 'Depreciation Mode', headerClass: 'agheader', field: 'DepreciationMode', filter: true, cellClass: 'center-align', floatingFilter: true, editable: true,
            valueGetter: (params) => {
                const value = params.data?.DepreciationMode;
                return value || "-";
            }
        },
        {
            headerName: 'Depreciation Value', headerClass: 'agheader', field: 'DepreciationValue', filter: true, cellClass: 'center-align', floatingFilter: true, editable: true,
            valueGetter: (params) => {
                const value = params.data?.DepreciationValue;
                return value || "-";
            }
        },
        {
            headerName: 'Depreciation Amount', headerClass: 'agheader', field: 'DepreciationAmount', filter: true, cellClass: 'center-align', floatingFilter: true, editable: true,
            valueGetter: (params) => {
                const value = params.data?.DepreciationAmount;
                return value || "-";
            }
        },
        {
            headerName: "Created By", headerClass: 'agheader', field: "CreatedBy",
            valueGetter: (params) => {
                const value = params.data?.CreatedBy;
                return value || "-";
            }
        },
        {
            headerName: "Created Date", headerClass: 'agheader', field: "CreatedDate",
            valueGetter: (params) => {
                const date = params.data.CreatedDate;
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
            headerName: "Last Modified By", headerClass: 'agheader', field: "UpdatedBy",
            valueGetter: (params) => {
                const value = params.data?.UpdatedBy;
                return value || "-";
            }
        },
        {
            headerName: "Last Modified Date", headerClass: 'agheader', field: "UpdatedDate",
            valueGetter: (params) => {
                const date = params.data.UpdatedDate;
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
        { headerName: pageData.editstatus === null || pageData.editstatus === 'i' ? '' : 'Edit', field: "Edit", cellRenderer: EditRenderer, headerClass: 'agheader', cellClass: 'center-align', pinned: right, width: 90, cellClass: 'center-align' },
        // { headerName: "Delete", field: "Delete", cellRenderer: DeleteRenderer, width: 90 },
    ]

    const fileInput = useRef(null);
    const componentRef = useRef(null);
    //pdf
    const handlepdf = async (selectedDate) => {
        setLoading(true);
        await new Promise(resolve => setTimeout(resolve, 0));

        const filteredData = gridRef.current.api.getModel().rowsToDisplay.map(rowNode => rowNode.data);

        const doc = new jsPDF({ orientation: "landscape", format: 'a2' });
        const title = 'Register Details';

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
            'Asset ID', 'Asset Type', 'Description', 'Asset Group', 'Category', 'SubCategory', 'Department',
            'LocationCode', 'Building', 'Floor', 'Room', 'VendorName', 'PhoneNumber', 'Created By', 'Created Date', 'Update By', 'Updated Date',
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
        const bodyData = filteredData.map(item => [
            item.AssetID || "-",
            item.AssetType || "-",
            item.Description || "-",
            item.AssetGroupName || "-",
            item.Category || "-",
            item.SubCategory || "-",
            item.Department || "-",
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

            doc.save("Register Details.pdf");
        } else {
            Swal.fire("No data available to export", "", "warning");
        }
        setLoading(false);
    };
    //end pdf
    const gridRef = useRef(null);
    const downloadExcel = async () => {
        const columnDefs = [
            { header: "Asset ID", key: "AssetID" },
            { header: "Asset Type", key: "AssetType" },
            { header: "Description", key: "Description" },
            { header: "Asset Group", key: "AssetGroupName" },
            { header: "Category", key: "Category" },
            { header: "SubCategory", key: "SubCategory" },
            { header: "Department", key: "Department" },
            { header: "Location Code", key: "LocationCode" },
            { header: "Building", key: "Building" },
            { header: "Floor", key: "Floor" },
            { header: "Room", key: "Room" },
            { header: "Vendor Name", key: "VendorName" },
            { header: "Phone Number", key: "PhoneNumber" },
            {
                header: "Created By", key: "CreatedBy",
            },
            {
                header: "Created Date", key: "CreatedDate",
            },
            {
                header: "Last Modified By", key: "updatedBy",
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
        const sheet = workbook.addWorksheet("Register Details Master");
        // TURN OFF GRIDLINES
        sheet.views = [{ showGridLines: false }];
        const now = new Date();
        const formattedDate = now.toLocaleDateString("en-IN");
        // TITLE
        sheet.mergeCells(1, 1, 1, columnDefs.length);
        const titleCell = sheet.getCell("A1");
        titleCell.value = `REGISTER DETAILS - ${formattedDate}`;
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

                return v ?? "-";
            }); const dataRow = sheet.addRow(rowValues);

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
        saveAs(new Blob([buffer]), "Register Details.xlsx");
    };
    const [select, setselect] = useState({
        id: '',
    })
    const [gridApi, setGridApi] = useState(null);
    const getSelectedRows = async () => {
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
                if (selectedData.length === 0) {
                    setIsModalVisible(false);
                    Swal.fire({
                        title: 'Please Select One Asset',
                        icon: 'warning'
                    })
                    return
                } else {
                    setselect({ id: selectedData });
                    const response = await axios.post(`${API_URL}/MapRfidtoAsset`, { id: selectedData })
                    const { SerialNumber, Brand, Model, Category, Vendors, InspectedBy, Condition, Defect, POnumber,
                        GRNnumber, PDate, PCost, CreatedDate, DisposedDate, WType, WPeriod, WEndDate, Description, Activity,
                        DepreciationType, DMethod, AssetLife, DCost, salvageValue, DateAcquired, RentalStart, RentalEnd, SelectPType, RFID, UpdatedBy, AssetMappedBy, Movement, id, AssetID, AssetName, Branch, Location, LocationRFID } = response.data[0]
                    setRegister({
                        ...Register,
                        SerialNumber: SerialNumber, Brand: Brand, Model: Model, Category: Category, Vendors: Vendors, InspectedBy: InspectedBy, Condition: Condition, Defect: Defect, POnumber: POnumber,
                        GRNnumber: GRNnumber, PDate: PDate, PCost: PCost, CreatedDate: CreatedDate, DisposedDate: DisposedDate, WType: WType, WPeriod: WPeriod, WEndDate: WEndDate, Description: Description, Activity: Activity,
                        DepreciationType: DepreciationType, DMethod: DMethod, AssetLife: AssetLife, DCost: DCost, salvageValue: salvageValue, DateAcquired: DateAcquired, RentalStart: RentalStart, RentalEnd: RentalEnd, SelectPType: SelectPType, RFID: RFID, UpdatedBy: UpdatedBy, AssetMappedBy: AssetMappedBy, Movement: Movement, id: id, AssetID: AssetID, AssetName: AssetName, branchName: Branch, Location: Location, LocationRFID: LocationRFID

                    })
                    fetchData();
                    setInputdata({
                        RFIDnumber: ''
                    })


                }

            }
        } catch (err) {
            console.log(err)
        }
    };
    const getSelectedRows1 = async () => {
        if (auth.branchid === "0" || auth.branchid === 0) {
            Swal.fire({
                icon: 'warning',
                title: 'Invalid Selection',
                text: "Please select a specific branch. 'ALL' is not allowed.",
            });
            return;
        }
        try {
            // setIsModalVisible1(true);

            if (gridApi) {
                const selectedNodes = gridApi.getSelectedNodes();
                const selectedData = selectedNodes.map(node => node.data.id);
                if (selectedData.length === 0) {
                    // setIsModalVisible1(false);

                    Swal.fire({
                        title: 'Please Select One Asset',
                        icon: 'warning'
                    })
                    return
                }
                else {
                    setselect({ id: selectedData });
                    const response = await axios.post(`${API_URL}/MapRfidtoAsset`, { id: selectedData })
                    const { Brand, Model, Category, Vendors, InspectedBy, Condition, Defect
                        , PDate, PCost, CreatedDate, DisposedDate, WType, WPeriod, WEndDate, Description, Activity,
                        DepreciationType, DMethod, AssetLife, DCost, salvageValue, DateAcquired, RentalStart, RentalEnd, SelectPType, RFID, UpdatedBy, AssetMappedBy, Movement, id, AssetID, AssetName, Branch, Location, LocationRFID } = response.data[0]

                    setRegister({
                        ...Register,
                        Brand: Brand, Model: Model, Category: Category, Vendors: Vendors, InspectedBy: InspectedBy, Condition: Condition, Defect: Defect, PDate: PDate, PCost: PCost, CreatedDate: CreatedDate, DisposedDate: DisposedDate, WType: WType, WPeriod: WPeriod, WEndDate: WEndDate, Description: Description, Activity: Activity,
                        DepreciationType: DepreciationType, DMethod: DMethod, AssetLife: AssetLife, DCost: DCost, salvageValue: salvageValue, DateAcquired: DateAcquired, RentalStart: RentalStart, RentalEnd: RentalEnd, SelectPType: SelectPType, RFID: RFID, UpdatedBy: UpdatedBy, AssetMappedBy: AssetMappedBy, Movement: Movement, id: id, AssetID: AssetID, AssetName: AssetName, branchName: Branch, Location: Location, LocationRFID: LocationRFID

                    })
                    setInputdata({
                        RFIDnumber: ''
                    })
                    if (response.status === 200) {
                        if (auth.branchid === "0" || auth.branchid === 0) {
                            Swal.fire({
                                icon: 'warning',
                                title: 'Invalid Selection',
                                text: "Please select a specific branch. 'ALL' is not allowed.",
                            });
                            return;
                        }
                        try {
                            const data1 = response.data[0]
                            const updatedRegister = { ...data1, AssetMappedBy: auth.empid, Activity: 'Check-In', Movement: 'Reg WithOut RFID', mode: 'MWO', Status: 'Active', branchid: auth.branchid };
                            const UpdateData = { ...inputdata, ...updatedRegister }
                            const response1 = await axios.post(`${API_URL}/UpdateWithoutRFID`, UpdateData)
                            if (response1.status === 200) {
                                setLoading(false);

                                Swal.fire({
                                    title: 'Asset Saved Successfully WithOut RFID',
                                    icon: 'success',
                                    confirmButtonText: 'Done'
                                }).then(() => {

                                    setIsModalVisible1(false);

                                    fetchData()

                                });
                                setInputdata({
                                    RFIDnumber: ''
                                })



                            }

                        }
                        catch (err) {
                            setLoading(false)

                            console.log(err)
                        }
                    }
                    else {
                        Swal.fire({
                            title: 'Please Select One Asset',
                            icon: 'warning'
                        })
                        return
                    }

                }

            }
        } catch (err) {
            console.log(err)
        }
    };
    // Handle Map for RFID to Asset
    const HandleMapped = async (e) => {

        if (auth.branchid === "0" || auth.branchid === 0) {
            Swal.fire({
                icon: 'warning',
                title: 'Invalid Selection',
                text: "Please select a specific branch. 'ALL' is not allowed.",
            });
            return;
        }

        setLoading(true);
        try {

            const updatedRegister = { ...Register, RFID: 'YES', AssetMappedBy: auth.empid, Activity: 'Check-In', Movement: 'Reg With RFID', mode: 'MW', Status: 'Active', branchid: auth.branchid };
            const UpdateData = { ...inputdata, ...updatedRegister }
            const response = await axios.post(`${API_URL}/UpdateRfid`, UpdateData)
            const res = { ...response.data.send }

            setRegister(res)
            if (response.status === 200) {
                setLoading(false);

                Swal.fire({
                    title: 'RFID Number Saved Successfully',
                    icon: 'success',
                    confirmButtonText: 'Done'
                }).then(() => {

                    setIsModalVisible(false);

                    fetchData()

                });
                setInputdata({
                    RFIDnumber: ''
                })



            }



        } catch (err) {
            setLoading(false);

            console.log(err)
        }

    }
    // // Handle For With Out RFID
    // const HandleWithOutRFID = async (e) => {
    //     setLoading(true);
    // }
    // Set Cursor Point in Modal start
    const inputRef = useRef(null);
    // set Cursor Point End
    const FetchCategoryDropdown = async () => {
        try {
            const alldata = { mode: 'SD', branchid: auth.branchid };
            const response = await axios.post(`${API_URL}/fetchCategorydata`, alldata);
            if (response.status === 200) {
                SetCategoryDropDownData(response.data.send);
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
        if (isModalVisible && inputRef.current) {
            inputRef.current.focus();
        }
        fetchData();
        FetchDepartmentDropDownData();
        fetchVendorData();
    }, [isModalVisible])
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
        if (auth.branchid === "0" || auth.branchid === 0) {
            Swal.fire({
                icon: 'warning',
                title: 'Invalid Selection',
                text: "Please select a specific branch. 'ALL' is not allowed.",
            });
            return;
        }
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
                formData.append('branchid', auth.branchid)
                const response = await axios.post(`${API_URL}/AssetUploadData`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
                console.log("🚀 ~ handleUploadData ~ response:", response.data)

                const { message, uploadcount, unuploadedFilePath } = response.data;
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
                            link.href = `${API_URL}${unuploadedFilePath}`;
                            link.setAttribute('download', 'unuploaded_data.xlsx');
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
        } else {
            setLoading(false);

        }
    };

    const handleAddClick = () => {
        if (auth.branchid === "0" || auth.branchid === 0) {
            Swal.fire({
                icon: 'warning',
                title: 'Invalid Selection',
                text: "Please select a specific branch. 'ALL' is not allowed.",
            });
            return;
        }

        navigate('/ManageAsset/AddRegister');
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

            {/* Image Modal Start */}

            <CModal
                // size='md'
                alignment="center"
                visible={Imagevisible}
                onClose={() => setImagevisible(false)}
                aria-labelledby="VerticallyCenteredExample"
            >

                <CModalTitle>

                    <div><h3 className='text-center mt-2'> Asset Image</h3></div>

                </CModalTitle>

                <CModalBody>
                    <img src={modalImage} alt="Larger View" style={{ width: '460px', maxHeight: '100%', border: '1px solid' }} />
                </CModalBody>

                <CModalFooter>
                    <div className='m-2 d-flex justify-content-end'>
                        <CButton className="mx-2 btn-hover-effect" type='submit' color="danger" onClick={() => setImagevisible(false)}>
                            CANCEL
                        </CButton>

                    </div>
                </CModalFooter>


            </CModal>
            {/* Image ModalEnd */}

            <div >


                {/* Modal for Download Format Register Asset*/}
                <div className="modal fade" id="exampleModal" tabIndex="-1" aria-labelledby="exampleModalLabel" >
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header p-2 pro-header">
                                <h1 className="modal-title fs-5 text-white" id="exampleModalLabel">Download Format</h1>
                                <button
                                    className="btn-close fs-6 me-2 btn-close-white border border-danger"
                                    style={{ cursor: "pointer" }}
                                    data-bs-dismiss="modal"
                                ></button>
                            </div>
                            <div className="modal-body">
                                <div className="d-flex justify-content-evenly">
                                    <div className="btn btn-success btn-hover-effect" onClick={downloadExcel}>
                                        <i className="bi bi-file-earmark-spreadsheet fs-1"></i>
                                    </div>
                                    <div className="btn btn-danger btn-hover-effect" onClick={handlepdf} >
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
                                                        <h5 className="card-title">Asset Image</h5>
                                                        <img
                                                            src={user.Image ? `${API_URL}/${user.Image}` : defaultlogo}
                                                            alt="Asset"
                                                            loading="lazy"
                                                            decoding="async"
                                                            style={{ width: '200px', height: '200px', }}
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

                {/*  Modal2 for WITH RFID Map Tag */}
                <div
                    className={`modal fade ${isModalVisible ? 'show' : ''}`}
                    id="exampleModal2"
                    aria-labelledby="exampleModalLabel2"
                    aria-hidden={!isModalVisible}
                    style={{ display: isModalVisible ? 'block' : 'none' }}
                    ref={modalRef}
                >
                    <div className="modal-dialog modal-dialog-centered modal-lg">
                        <div className="modal-content card border">
                            <div className="modal-header pro-header">
                                <h1 className="modal-title fs-5 text-white" id="exampleModalLabel2">Map Tag</h1>
                                <button
                                    className="btn-close fs-6 me-2 btn-close-white border border-danger"
                                    style={{ cursor: "pointer" }}
                                    onClick={() => setIsModalVisible(false)}
                                ></button>

                            </div>
                            <div className="modal-body">
                                <div className='card'>
                                    <div className='m-5'>
                                        <label>Scanned RFID Number</label>
                                        <input className='form-control' ref={inputRef} maxLength="24" onChange={(e) => setInputdata({ ...inputdata, RFIDnumber: e.target.value })}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    HandleMapped();   // 👈 Call function on Enter
                                                }
                                            }}
                                            value={inputdata.RFIDnumber} />
                                    </div>


                                </div>
                                <div className='row'>
                                    <div className='col-lg-6'>
                                        <label>Asset ID</label>
                                        <input className='form-control ' value={Register.AssetID} disabled />
                                    </div>
                                    <div className='col-lg-6'>
                                        <label>Asset Name</label>
                                        <input className='form-control ' value={Register.AssetName} disabled />
                                    </div>

                                    <div className='col-lg-6'>
                                        <label>Asset Description</label>
                                        <input className='form-control ' value={Register.Description} disabled />
                                    </div>

                                    <div className='col-lg-6'>
                                        <label>Purchase Date</label>
                                        <input className='form-control ' value={Register.PDate} disabled />
                                    </div>

                                </div>

                                <div className='text-center mt-2'>
                                    <button className='btn btn-info col-lg-4 btn-hover-effect' onClick={HandleMapped} >Map Tag</button>
                                </div>
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
                                            <a href="/AssetRegisterTemp.xlsx" className=' nav-link text-decoration-underline ' download>Click to Download</a>
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
                <Card className='mt-4'>
                    <CardHeader className='pro-header '>
                        <h3 className='text-center text-white p-0'>
                            <i className="bi bi-r-square me-1"></i>Register Details
                        </h3>
                    </CardHeader>
                    <div className="d-flex justify-content-end flex-wrap gap-2 mb-3 mt-2">
                        {/* 1. With RFID Tag */}
                        {(pageData.editstatus === null || pageData.editstatus === 'i') && auth.UserStatus === 'A' ? null :
                            <CButton
                                type="submit" color="info" variant="outline" onClick={getSelectedRows} className='me-2 btn-hover-effect'

                            >
                                <i className="bi bi-tag me-1 d-none d-sm-inline"></i>
                                <span className="d-inline d-sm-none">RFID</span>
                                <span className="d-none d-sm-inline">With RFID Tag</span>
                            </CButton>
                        }

                        {/* 2. Without RFID */}
                        {(pageData.editstatus === null || pageData.editstatus === 'i') && auth.UserStatus === 'A' ? null :
                            <CButton
                                type="submit" color="warning" variant="outline" className='me-2 btn-hover-effect' onClick={getSelectedRows1}
                            >
                                <i className="bi bi-tag-fill me-1 d-none d-sm-inline"></i>
                                <span className="d-inline d-sm-none">No RFID</span>
                                <span className="d-none d-sm-inline">Without RFID</span>
                            </CButton>
                        }

                        {/* 3. Import */}
                        {(pageData.editstatus === null || pageData.editstatus === 'i') && auth.UserStatus === 'A' ? null :
                            <CButton
                                type="submit" color="secondary" variant="outline" className='me-2 btn-hover-effect' onClick={() => setUploadvisible(true)}
                            >
                                <i className="bi bi-cloud-download me-1 d-none d-sm-inline"></i>Import
                            </CButton>
                        }

                        {/* 4. Export */}
                        <CButton
                            type="submit" color="danger" variant="outline" className='me-2 btn-hover-effect' data-bs-toggle="modal"
                            data-bs-target="#exampleModal"
                        >
                            <i className="bi bi-cloud-upload me-1 d-none d-sm-inline"></i>Export
                        </CButton>

                        {/* 5. Add */}
                        {(pageData.addstatus === null || pageData.addstatus === 'i') && auth.UserStatus === 'A' ? null :
                            <CButton
                                type="submit" color="success" variant="outline" className='me-2 btn-hover-effect' onClick={handleAddClick}
                            >
                                <i className="bi bi-plus-lg me-1"></i>Add
                            </CButton>
                        }
                    </div>

                    {/* Responsive Card + Grid */}

                    <div style={{ height: "500px" }} className='ag-theme-quartz'>
                        <AgGridReact
                            ref={gridRef}
                            rowData={rowData}
                            columnDefs={columdef}
                            rowSelection="single"
                            getRowHeight={() => 65}
                            onGridReady={(params) => setGridApi(params.api)}
                            pagination={pagination} paginationPageSize={paginationPageSize} paginationPageSizeSelector={paginationPageSizeSelector}
                            rowBuffer={20} suppressColumnVirtualisation={true}
                        />
                    </div>
                </Card>

            </div>

        </>
    )
}

RegisterAssetTable.propTypes = {
    auth: PropTypes.any.isRequired,
};

export default RegisterAssetTable
