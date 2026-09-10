import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import axios from 'axios';
import { getConfig } from 'src/config';
import Select from "react-select";
import PropTypes from 'prop-types';
import defaultimage from '../../assets/images/apple-logo.png';
import { Typeahead } from 'react-bootstrap-typeahead';
import 'react-bootstrap-typeahead/css/Typeahead.css';
import swal from 'sweetalert';
import secureLocalStorage from 'react-secure-storage';

const AddRegister = ({ auth }) => {
    const permissions = secureLocalStorage.getItem("pageData") || {};
    const navigate = useNavigate();
    const [showDateInput, setShowDateInput] = useState(true);
    const [maxCreatedDate, setmaxCreatedDate] = useState('');
    const API_URL = getConfig().REACT_APP_API_URL;

    const [CategoryDropDownData, SetCategoryDropDownData] = useState([]);
    const [SubCategoryData, setSubCategoryData] = useState([]);
    const [DepartmentDropDownData, SetDepartmentDropDownData] = useState([]);
    const [LocationDropDownData, SetLocationDropDownData] = useState([]);
    const [AssetType, setAssetType] = useState([]);
    const [VendorData, setVendorData] = useState([]);
    const [MaintainedbyData, setMaintainedbyData] = useState([]);
    const [AssetPackageData, setAssetPackageData] = useState([]);
    const [AssetGroupData, setAssetGroupData] = useState([]);

    // Image Upload
    const fileInput = useRef(null);
    const defaultImage = defaultimage;

    const [image, setImage] = useState({
        src: defaultImage,
        alt: ''
    });

    const handleImg = (event) => {
        const file = event.target.files[0];
        if (file && file.size <= 2 * 1024 * 1024) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setRegister(prevRegister => ({
                    ...prevRegister,
                    AssetImg: reader.result
                }));
                setImage({
                    src: URL.createObjectURL(file),
                    alt: file.name
                });
            };
            reader.readAsDataURL(file);
        } else {
            alert('File size should be less than or equal to 2MB');
        }
    };

    // Asset Register State
    const [Register, setRegister] = useState({
        AssetID: '', Brand: '', Model: '', Category: '', CreatedBy: '', PDate: '', PCost: '', CreatedDate: '', WType: '', WPeriod: '', WEndDate: '', Description: '', AssetImg: '', Movement: '', InvoiceNumber: '', AssetName: '', SubCategory: '', VendorName: '', PhoneNumber: '', LocationCode: '',
        AssetType: '', LinkID: '', Building: '', Floor: '', Room: '', LocationRFID: '', MaintainById: '', AssetGroupName: '', BUnitId: '', PackageName: '',
        DepreciationType: 'Straight Line', DepreciationMode: 'Year', DepreciationValue: ''
    });

    const formatDateYYYYMMDD = (date) => {
        const d = new Date(date);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    // Submit Details
    const handlecheck = async (e) => {
        let temp = { ...Register };

        if (!temp.PackageName) return Swal.fire({ title: 'Please Select Asset Package', icon: 'warning' });
        if (!temp.AssetGroupName) return Swal.fire({ title: 'Please Select Asset Group', icon: 'warning' });
        if (!temp.AssetID) return Swal.fire({ title: 'Please Enter Asset ID', icon: 'warning' });
        if (!temp.LocationCode) return Swal.fire({ title: 'Please Enter Location Code', icon: 'warning' });
        if (!temp.LocationRFID) return Swal.fire({ title: 'Please Enter Location RFID', icon: 'warning' });
        if (!temp.Category) return Swal.fire({ title: 'Please Select Category', icon: 'warning' });
        if (!temp.SubCategory) return Swal.fire({ title: 'Please Select Sub Category', icon: 'warning' });
        if (!temp.Department) return Swal.fire({ title: 'Please Select Department', icon: 'warning' });

        if (!temp.CreatedDate) temp.CreatedDate = formatDateYYYYMMDD(new Date());
        if (!temp.PCost) {
            temp.PCost = 0;
            temp.DepreciationValue = 0;
        }

        try {
            const file = fileInput.current.files[0];
            let imagePath = '';
            if (file) {
                const formData = new FormData();
                formData.append('image', file);
                try {
                    const imageUploadResponse = await axios.post(`${API_URL}/api/upload`, formData, {
                        headers: { 'Content-Type': 'multipart/form-data' }
                    });
                    if (imageUploadResponse.data.success) {
                        imagePath = imageUploadResponse.data.file.path;
                    } else {
                        swal({ text: 'Error uploading image', icon: 'error' });
                        return;
                    }
                } catch (error) {
                    console.error('Error during image upload:', error);
                    swal({ text: 'Error during image upload', icon: 'error' });
                    return;
                }
            } else {
                imagePath = '';
            }

            const alldata = { ...temp, Movement: 'Inward', CreatedBy: auth.empid, mode: 'I', AssetImg: imagePath, branchid: auth.branchid };
            const response = await axios.post(`${API_URL}/NewRegister`, alldata);
            if (response.status === 200) {
                swal({
                    title: 'Saved Successfully',
                    icon: 'success',
                    confirmButtonText: 'Done'
                }).then(() => {
                    navigate('/ManageAsset/NewRegister');
                });
            }
        } catch (err) {
            console.log(err);
        }
    };

    // Fetch Functions
    const FetchDepartmentDropDownData = async () => {
        try {
            const data = { mode: 'S', branchid: auth.branchid };
            const response = await axios.post(`${API_URL}/fetchDeparmentData`, data);
            if (response.status === 200) {
                SetDepartmentDropDownData(response.data.send);
            }
        } catch (err) {
            console.log(err);
        }
    };

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

    const fetchAssetType = async () => {
        try {
            const data = { mode: 'S', branchid: auth.branchid, BranchAccess: auth.BranchAccess };
            const response = await axios.post(`${API_URL}/AssetTypeMaster`, data);
            if (response.status === 200) {
                setAssetType(response.data);
            }
        } catch (err) {
            console.log(err);
        }
    };

    const fetchVendorData = async () => {
        try {
            const alldata = { branchid: auth.branchid, mode: 'S', BranchAccess: auth.BranchAccess };
            const response = await axios.post(`${API_URL}/FetchVendors`, alldata);
            setVendorData(response.data.send);
        } catch (error) {
            console.error('Error fetching vendor data:', error);
        }
    };

    const fetchMaintainedbyData = async () => {
        try {
            const alldata = { mode: 'S', branchid: auth.branchid, BranchAccess: auth.BranchAccess, MaintainId: '' };
            const response = await axios.post(`${API_URL}/MaintainedConfig`, alldata);
            setMaintainedbyData(response.data);
        } catch (error) {
            console.error('Error fetching maintained by data:', error);
        }
    };

    const fetchAssetPackageData = async () => {
        try {
            const alldata = { mode: 'getPackage', branchid: auth.branchid, BranchAccess: auth.BranchAccess, PackageId: '' };
            const response = await axios.post(`${API_URL}/PackageConfig`, alldata);
            setAssetPackageData(response.data);
        } catch (error) {
            console.error('Error fetching package data:', error);
        }
    };

    const fetchAssetGroupData = async () => {
        try {
            const alldata = { mode: 'S', branchid: auth.branchid, BranchAccess: auth.BranchAccess, GroupId: '' };
            const response = await axios.post(`${API_URL}/AssetGroupConfig`, alldata);
            setAssetGroupData(response.data);
        } catch (error) {
            console.error('Error fetching group data:', error);
        }
    };

    const fetchPackageWiseCategory = async (selected) => {
        try {
            const alldata = { mode: 'getCategoryPackageWise', branchid: auth.branchid, BranchAccess: auth.BranchAccess, ...selected[0], PackageId: '' };
            const response = await axios.post(`${API_URL}/PackageConfig`, alldata);
            SetCategoryDropDownData(response.data);
        } catch (error) {
            console.error('Error fetching category data:', error);
        }
    };

    const fetchSubCategory = async (Category) => {
        try {
            const alldata = { Category, mode: 'SDS', branchid: auth.branchid };
            const response = await axios.post(`${API_URL}/fetchSubCategorydata`, alldata);
            if (response.status === 200) {
                setSubCategoryData(response.data.send);
            }
        } catch (err) {
            console.log(err);
        }
    };

    const handleCategoryChange = async (selected) => {
        const selectedCategory = selected[0]?.Category;
        if (selectedCategory) {
            const alldata = { mode: 'GetCode', Category: selectedCategory, branchid: auth.branchid, BranchAccess: auth.BranchAccess };
            const response = await axios.post(`${API_URL}/getAssetCode`, alldata);
            const PrefixSuffix = response.data[0].PrefixSuffix;
            setRegister({ ...Register, Category: selectedCategory, AssetID: PrefixSuffix });
            fetchSubCategory(selectedCategory);
        } else {
            setRegister({ ...Register, Category: '', AssetID: '' });
            setSubCategoryData([]);
        }
    };

    const handlegetVendorNumber = (selected) => {
        const selectedVendor = selected?.value;
        const selectedOption = VendorData.find(option => option.VendorName === selectedVendor);
        setRegister({
            ...Register,
            VendorName: selectedVendor || '',
            PhoneNumber: selectedOption?.PhoneNumber || ''
        });
    };

    const handleChangeWarrantyEndingDate = (e) => {
        const warrantyMonths = parseInt(e.target.value, 10);
        if (Register.PDate && !isNaN(warrantyMonths)) {
            const purchaseDate = new Date(Register.PDate);
            purchaseDate.setMonth(purchaseDate.getMonth() + warrantyMonths);
            const warrantyEndDate = purchaseDate.toISOString().split('T')[0];
            setRegister({ ...Register, WEndDate: warrantyEndDate, WPeriod: e.target.value });
        } else {
            setRegister({ ...Register, WEndDate: "", WPeriod: '' });
        }
    };

    const getUniqueAssetGroups = (data) => {
        const uniqueMap = new Map();
        data.forEach(item => uniqueMap.set(item.GroupName, item));
        return Array.from(uniqueMap.values());
    };

    const getUniqueCategory = (data) => {
        const uniqueMap = new Map();
        data.forEach(item => uniqueMap.set(item.Category, item));
        return Array.from(uniqueMap.values());
    };

    useEffect(() => {
        const date = new Date().toISOString().split('T')[0];
        setmaxCreatedDate(date);
        FetchDepartmentDropDownData();
        FetchLocationDropdown();
        fetchAssetType();
        fetchVendorData();
        fetchMaintainedbyData();
        fetchAssetPackageData();
        fetchAssetGroupData();
    }, []);

    const normalizePermission = (permission) => {
        if (!permission) return null;
        return {
            ...permission,
            ViewStatus: permission.ViewStatus?.toLowerCase(),
            AddStatus: permission.AddStatus?.toLowerCase(),
            EditStatus: permission.EditStatus?.toLowerCase(),
            DeleteStatus: permission.DeleteStatus?.toLowerCase(),
        };
    };

    const hasViewPermission = (screenId) => {
        return permissions?.[screenId]?.ViewStatus === 'a' || auth.UserStatus === 'SA';
    };
    const getScreenPermission = (screenId) => {
        const perm = permissions?.[screenId];
        return normalizePermission(perm);
    };


    return (
        <div className="card shadow-sm border-0 rounded-3">
            {/* Header */}
            <div className="card-header d-flex justify-content-between align-items-center pro-header p-2">
                <h6 className="text-white mb-0">Add New Asset</h6>
                <button
                    className="btn-close fs-4 me-2 btn-close-white border border-danger"
                    style={{ cursor: "pointer" }}
                    onClick={() => navigate("/ManageAsset/NewRegister")}
                ></button>
            </div>

            <div className="card-body bg-white rounded-bottom">
                <div className="row">
                    <div className="col-12 col-md-6 col-lg-4 mt-2">
                        <label className="form-label fw-semibold text-secondary">Asset Package</label>
                        <div className="d-flex align-items-center gap-2 ">
                            <Typeahead
                                id="asset-package-typeahead"
                                labelKey="PackageName"
                                options={AssetPackageData}
                                placeholder="Select an Asset Package"
                                onChange={selected => {
                                    if (selected.length > 0) {
                                        fetchPackageWiseCategory(selected);
                                        setRegister({ ...Register, PackageName: selected[0].PackageName || "" });
                                    } else {
                                        SetCategoryDropDownData([]);
                                        setRegister({ ...Register, PackageName: "" });
                                    }
                                }}
                                className="flex-grow-1"
                                clearButton
                            />
                            {hasViewPermission('AC007') && (
                                <Link to="/Configure/AssetPackage" title="Add Asset Package" state={{ permission: getScreenPermission('AC007'), screenId: 'AC007' }}>
                                    <i className="bi bi-plus-circle text-primary fs-4"></i>
                                </Link>
                            )}
                        </div>
                    </div>

                    {/* Category */}
                    <div className="col-12 col-md-6 col-lg-4 mt-2">
                        <label className="form-label fw-semibold text-secondary">Category</label>
                        <div className="d-flex align-items-center gap-2">
                            <Typeahead
                                id="category-typeahead"
                                labelKey="Category"
                                options={getUniqueCategory(CategoryDropDownData)}
                                placeholder="Select an Category"
                                onChange={handleCategoryChange}
                                className="flex-grow-1"
                                clearButton
                            />
                            {hasViewPermission('AC006') && (
                                <Link to="/Configure/Category" title="Add Category" state={{ permission: getScreenPermission('AC006'), screenId: 'AC006' }}>
                                    <i className="bi bi-plus-circle text-primary fs-4"></i>
                                </Link>
                            )}
                        </div>
                    </div>

                    {/* Asset ID */}
                    <div className="col-12 col-md-6 col-lg-4 mt-2">
                        <label className="form-label fw-semibold text-secondary">Asset ID</label>
                        <input
                            type="text"
                            className="form-control shadow-sm"
                            value={Register.AssetID}
                            disabled
                            placeholder="Auto Generated"
                        />
                    </div>

                    {/* Asset Name */}
                    <div className="col-12 col-md-6 col-lg-4 mt-2">
                        <label className="form-label fw-semibold text-secondary">Asset Name</label>
                        <input
                            type="text"
                            className="form-control shadow-sm"
                            value={Register.AssetName || ""}
                            onChange={e => setRegister({ ...Register, AssetName: e.target.value })}
                            placeholder="Enter Asset Name"
                        />
                    </div>

                    {/* Brand */}
                    <div className="col-12 col-md-6 col-lg-4 mt-2">
                        <label className="form-label fw-semibold text-secondary">Brand</label>
                        <input
                            type="text"
                            className="form-control shadow-sm"
                            value={Register.Brand || ""}
                            onChange={e => setRegister({ ...Register, Brand: e.target.value })}
                            placeholder="Enter Brand"
                        />
                    </div>

                    {/* Model */}
                    <div className="col-12 col-md-6 col-lg-4 mt-2">
                        <label className="form-label fw-semibold text-secondary">Model</label>
                        <input
                            type="text"
                            className="form-control shadow-sm"
                            value={Register.Model || ""}
                            onChange={e => setRegister({ ...Register, Model: e.target.value })}
                            placeholder="Enter Model"
                        />
                    </div>

                    {/* Sub Category */}
                    <div className="col-12 col-md-6 col-lg-4 mt-2">
                        <label className="form-label fw-semibold text-secondary">Sub Category</label>
                        <div className="d-flex align-items-center gap-2">
                            <Typeahead
                                id="subcategory-typeahead"
                                labelKey="SubCategory"
                                options={SubCategoryData}
                                placeholder="Select an SubCategory"
                                onChange={selected => {
                                    if (selected.length > 0) {
                                        setRegister({
                                            ...Register,
                                            SubCategory: selected[0].SubCategory || "",
                                            AssetGroupName: selected[0].GroupId || ""
                                        });
                                    } else {
                                        setRegister({
                                            ...Register,
                                            SubCategory: "",
                                            AssetGroupName: ""
                                        });
                                    }
                                }}
                                className="flex-grow-1"
                                clearButton
                            />
                            {hasViewPermission('AC006') && (
                                <Link to="/Configure/Category" title="Add Sub Category" state={{ permission: getScreenPermission('AC006'), screenId: 'AC006' }}>
                                    <i className="bi bi-plus-circle text-primary fs-4"></i>
                                </Link>
                            )}
                        </div>
                    </div>

                    {/* Asset Group */}
                    <div className="col-12 col-md-6 col-lg-4 mt-2">
                        <label className="form-label fw-semibold text-secondary">Asset Group</label>
                        <div className="d-flex align-items-center gap-2 ">
                            <Typeahead
                                id="asset-group-typeahead"
                                labelKey="GroupName"
                                options={getUniqueAssetGroups(AssetGroupData)}
                                placeholder="Select an Asset Group"
                                onChange={selected => {
                                    setRegister({ ...Register, AssetGroupName: selected[0]?.GroupName || "" });
                                }}
                                className="flex-grow-1"
                                clearButton
                            />
                            {hasViewPermission('AC008') && (
                                <Link to="/Configure/AssetGroup" title="Add Asset Group" state={{ permission: getScreenPermission('AC008'), screenId: 'AC008' }}>
                                    <i className="bi bi-plus-circle text-primary fs-4"></i>
                                </Link>
                            )}
                        </div>
                    </div>

                    {/* Department */}
                    <div className="col-12 col-md-6 col-lg-4 mt-2">
                        <label className="form-label fw-semibold text-secondary">Department</label>
                        <div className="d-flex align-items-center gap-2">
                            <Select
                                options={DepartmentDropDownData.map(opt => ({
                                    value: opt.Department,
                                    label: opt.Department,
                                }))}
                                value={Register.Department ? { value: Register.Department, label: Register.Department } : null}
                                onChange={selected => setRegister({ ...Register, Department: selected?.value || "" })}
                                placeholder="Select Department"
                                className="flex-grow-1"
                                isClearable
                            />
                            {hasViewPermission('AC009') && (
                                <Link to="/Configure/Department" title="Add Department" state={{ permission: getScreenPermission('AC009'), screenId: 'AC009' }}>
                                    <i className="bi bi-plus-circle text-primary fs-4"></i>
                                </Link>
                            )}
                        </div>
                    </div>

                    {/* Location Code */}
                    <div className="col-12 col-md-6 col-lg-4 mt-2">
                        <label className="form-label fw-semibold text-secondary">Location Code</label>
                        <div className="d-flex align-items-center gap-2">
                            <Typeahead
                                id="location-code-typeahead"
                                labelKey="LocationCode"
                                options={LocationDropDownData}
                                placeholder="Select a Location Code..."
                                onChange={selected => {
                                    const sel = selected[0] || {};
                                    setRegister({
                                        ...Register,
                                        LocationCode: sel.LocationCode || "",
                                        LinkID: sel.LinkID || "",
                                        LocationRFID: sel.LocationRFID || "",
                                        Building: sel.Building || "",
                                        Floor: sel.Floor || "",
                                        Room: sel.Room || ""
                                    });
                                }}
                                selected={Register.LocationCode ? LocationDropDownData.filter(item => item.LocationCode === Register.LocationCode) : []}
                                className="flex-grow-1"
                                clearButton
                            />
                            {hasViewPermission('AC004') && (
                                <Link to="/Configure/LinkLocation" title="Add Location" state={{ permission: getScreenPermission('AC004'), screenId: 'AC004' }}>
                                    <i className="bi bi-plus-circle text-primary fs-4"></i>
                                </Link>
                            )}
                        </div>
                    </div>

                    {/* Location RFID */}
                    <div className="col-12 col-md-6 col-lg-4 mt-2">
                        <label className="form-label fw-semibold text-secondary">Location RFID</label>
                        <div className="d-flex align-items-center gap-2">
                            <Typeahead
                                id="location-rfid-typeahead"
                                labelKey="LocationRFID"
                                options={LocationDropDownData}
                                placeholder="Select a Location RFID..."
                                onChange={selected => {
                                    const sel = selected[0] || {};
                                    setRegister({
                                        ...Register,
                                        LocationCode: sel.LocationCode || "",
                                        LinkID: sel.LinkID || "",
                                        LocationRFID: sel.LocationRFID || "",
                                        Building: sel.Building || "",
                                        Floor: sel.Floor || "",
                                        Room: sel.Room || ""
                                    });
                                }}
                                selected={Register.LocationRFID ? LocationDropDownData.filter(item => item.LocationRFID === Register.LocationRFID) : []}
                                className="flex-grow-1"
                                clearButton
                            />
                            {hasViewPermission('AC004') && (
                                <Link to="/Configure/LinkLocation" title="Add Location" state={{ permission: getScreenPermission('AC004'), screenId: 'AC004' }}>
                                    <i className="bi bi-plus-circle text-primary fs-4"></i>
                                </Link>
                            )}
                        </div>
                    </div>

                    {/* Building */}
                    <div className="col-12 col-md-6 col-lg-4 mt-2">
                        <label className="form-label fw-semibold text-secondary">Building</label>
                        <input
                            type="text"
                            className="form-control shadow-sm"
                            value={Register.Building || ""}
                            placeholder='Building'
                            disabled
                        />
                    </div>

                    {/* Floor */}
                    <div className="col-12 col-md-6 col-lg-4 mt-2">
                        <label className="form-label fw-semibold text-secondary">Floor</label>
                        <input
                            type="text"
                            className="form-control shadow-sm"
                            value={Register.Floor || ""}
                            placeholder='Floor'
                            disabled
                        />
                    </div>

                    {/* Room */}
                    <div className="col-12 col-md-6 col-lg-4 mt-2">
                        <label className="form-label fw-semibold text-secondary">Room</label>
                        <input
                            type="text"
                            className="form-control shadow-sm"
                            value={Register.Room || ""}
                            placeholder='Room'
                            disabled
                        />
                    </div>

                    {/* Asset Type - Fixed auto-selection */}
                    <div className="col-12 col-md-6 col-lg-4 mt-2">
                        <label className="form-label fw-semibold text-secondary">Asset Type</label>
                        <div className="d-flex align-items-center gap-2">
                            <Typeahead
                                id="asset-type-typeahead"
                                labelKey="AssetType"
                                options={AssetType}
                                placeholder="Select an Asset Type..."
                                onChange={selected => {
                                    setRegister({
                                        ...Register,
                                        AssetType: selected.length > 0 ? selected[0].AssetType : ""
                                    });
                                }}
                                selected={Register.AssetType ? AssetType.filter(item => item.AssetType === Register.AssetType) : []}
                                className="flex-grow-1"
                                clearButton
                            />
                            {hasViewPermission('AC005') && (

                                <Link to="/Configure/AssetType" title="Add Asset Type" state={{ permission: getScreenPermission('AC005'), screenId: 'AC005' }}>
                                    <i className="bi bi-plus-circle text-primary fs-4"></i>
                                </Link>
                            )}

                        </div>
                    </div>

                    {/* Maintained by */}
                    <div className="col-12 col-md-6 col-lg-4 mt-2">
                        <label className="form-label fw-semibold text-secondary">Maintained By</label>
                        <div className="d-flex align-items-center gap-2">
                            <Typeahead
                                id="maintained-typeahead"
                                labelKey="MaintainbyName"
                                options={MaintainedbyData}
                                placeholder="Select an Maintain by"
                                onChange={selected => {
                                    setRegister({
                                        ...Register,
                                        MaintainById: selected.length > 0 ? selected[0].MaintainById : ""
                                    });
                                }}
                                selected={Register.MaintainById ? MaintainedbyData.filter(item => item.MaintainById === Register.MaintainById) : []}
                                className="flex-grow-1"
                                clearButton
                            />
                            {hasViewPermission('AC013') && (

                                <Link to="/Configure/Maintained" title="Add Asset Type" state={{ permission: getScreenPermission('AC013'), screenId: 'AC013' }}>
                                    <i className="bi bi-plus-circle text-primary fs-4"></i>
                                </Link>
                            )}

                        </div>
                    </div>

                    {/* Description */}
                    <div className="col-12 mt-2">
                        <label className="form-label fw-semibold text-secondary">Description</label>
                        <textarea
                            className="form-control shadow-sm"
                            placeholder="Enter Description of Product"
                            rows={3}
                            value={Register.Description || ""}
                            onChange={e => setRegister({ ...Register, Description: e.target.value })}
                        />
                    </div>
                </div>

                {/* PURCHASE DETAILS */}
                <div className="card mb-4 border-0 shadow-sm rounded-3 mt-2">
                    <div className="card-header pro-header text-white rounded-top ">
                        <h6 className="mb-0 text-white">
                            Purchase Details
                        </h6>
                    </div>
                    <div className="card-body bg-white rounded-bottom mt-3">
                        <div className="row gy-3 gx-4">
                            <div className="col-12 col-md-6 col-lg-4">
                                <label className="form-label fw-semibold text-secondary">Invoice Number</label>
                                <input
                                    type="text"
                                    className="form-control shadow-sm"
                                    onChange={e => setRegister({ ...Register, InvoiceNumber: e.target.value })}
                                    placeholder="Enter Invoice Number"
                                />
                            </div>

                            <div className="col-12 col-md-6 col-lg-4">
                                <label className="form-label fw-semibold text-secondary">Vendor</label>
                                <div className="d-flex align-items-center gap-2">
                                    <Select
                                        options={VendorData.map(opt => ({
                                            value: opt.VendorName,
                                            label: opt.VendorName,
                                        }))}
                                        onChange={handlegetVendorNumber}
                                        placeholder="Select Vendor"
                                        className="flex-grow-1"
                                        isClearable
                                    />
                                    {hasViewPermission('AC011') && (

                                        <Link to="/Configure/Vendors" title="Add Vendor" state={{ permission: getScreenPermission('AC011'), screenId: 'AC011' }}>
                                            <i className="bi bi-plus-circle text-primary fs-4"></i>
                                        </Link>
                                    )}

                                </div>
                            </div>

                            <div className="col-12 col-md-6 col-lg-4">
                                <label className="form-label fw-semibold text-secondary">Phone Number</label>
                                <input
                                    type="text"
                                    className="form-control shadow-sm"
                                    value={Register.PhoneNumber || ""}
                                    placeholder='Vendor PhoneNumber'
                                    disabled
                                />
                            </div>

                            {showDateInput && (
                                <div className="col-12 col-md-6 col-lg-4">
                                    <label className="form-label fw-semibold text-secondary">Created Date</label>
                                    <input
                                        type="date"
                                        max={maxCreatedDate}
                                        className="form-control shadow-sm"
                                        onChange={e => setRegister({ ...Register, CreatedDate: e.target.value })}
                                    />
                                </div>
                            )}

                            <div className="col-12 col-md-6 col-lg-4">
                                <label className="form-label fw-semibold text-secondary">Purchase Date</label>
                                <input
                                    type="date"
                                    max={maxCreatedDate}
                                    className="form-control shadow-sm"
                                    onChange={e => setRegister({ ...Register, PDate: e.target.value })}
                                />
                            </div>

                            <div className="col-12 col-md-6 col-lg-4">
                                <label className="form-label fw-semibold text-secondary">Warranty Period (Months)</label>
                                <input
                                    type="number"
                                    className="form-control shadow-sm"
                                    onChange={handleChangeWarrantyEndingDate}
                                    placeholder="Enter Warranty Period"
                                />
                            </div>

                            <div className="col-12 col-md-6 col-lg-4">
                                <label className="form-label fw-semibold text-secondary">Warranty Type</label>
                                <Select
                                    options={[
                                        { value: "ServiceWarranty", label: "Service Warranty" },
                                        { value: "OnsiteWarranty", label: "Onsite Warranty" },
                                    ]}
                                    value={Register.WType ? { value: Register.WType, label: Register.WType } : null}
                                    onChange={selected => setRegister({ ...Register, WType: selected?.value || "" })}
                                    placeholder="Select Warranty Type"
                                    isClearable
                                />
                            </div>

                            <div className="col-12 col-md-6 col-lg-4">
                                <label className="form-label fw-semibold text-secondary">Purchase Cost</label>
                                <input
                                    type="text"
                                    className="form-control shadow-sm"
                                    onChange={e => setRegister({ ...Register, PCost: e.target.value })}
                                    placeholder="Enter Purchase Cost"
                                />
                            </div>

                            <div className="col-12 col-md-6 col-lg-4">
                                <label className="form-label fw-semibold text-secondary">Warranty End Date</label>
                                <input
                                    type="date"
                                    className="form-control shadow-sm"
                                    value={Register.WEndDate || ""}
                                    disabled
                                />
                            </div>

                            <div className="col-12 col-md-6 col-lg-4">
                                <label className="form-label">Depreciation Mode</label>
                                <select
                                    className="form-select"
                                    style={{ minWidth: "120px" }}
                                    value={Register.DepreciationMode || ""}
                                    onChange={(e) => setRegister({ ...Register, DepreciationMode: e.target.value })}
                                >
                                    <option value="Month">Month</option>
                                    <option value="Year">Year</option>
                                </select>
                            </div>

                            <div className="col-12 col-md-6 col-lg-4">
                                <label className="form-label">Depreciation Type</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={Register.DepreciationType}
                                    placeholder="Enter Depreciation Type"
                                    disabled
                                />
                            </div>

                            <div className="col-12 col-md-6 col-lg-4">
                                <label className="form-label">Depreciation Value</label>
                                <input
                                    type="number"
                                    className="form-control"
                                    onChange={(e) => setRegister({ ...Register, DepreciationValue: e.target.value })}
                                    placeholder="Enter Depreciation Value"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* ASSET IMAGE */}
                <div className="card mb-4 border-0 shadow-sm rounded-3">
                    <div className="card-header pro-header text-white rounded-top">
                        <h6 className="mb-0 text-white">
                            Asset Image
                        </h6>
                    </div>
                    <div className="card-body bg-white text-center rounded-bottom">
                        <div className="d-flex flex-column flex-md-row align-items-center justify-content-center gap-3 mt-2">
                            <img
                                src={image.src || defaultImage}
                                alt={image.alt || "Asset Preview"}
                                className="border rounded shadow-sm"
                                style={{ width: "100px", height: "100px", objectFit: "cover" }}
                            />
                            <div>
                                <input
                                    ref={fileInput}
                                    type="file"
                                    accept=".png, .jpg, .jpeg"
                                    className="d-none"
                                    onChange={handleImg}
                                />
                                <button
                                    className="btn btn-primary me-2 shadow-sm"
                                    onClick={() => fileInput.current.click()}
                                >
                                    Upload Image
                                </button>
                                <small className="text-danger">(Max size ≤ 2MB)</small>
                            </div>
                        </div>
                    </div>
                </div>

                {/* SUBMIT BUTTON */}
                <div className="text-center mt-4">
                    <button
                        className="btn btn-success px-5 py-2 fw-semibold shadow-sm rounded-3 btn-hover-effect"
                        onClick={handlecheck}
                    >
                        Save All Details
                    </button>
                </div>
            </div>
        </div>
    );
};

AddRegister.propTypes = {
    auth: PropTypes.any.isRequired,
};

export default AddRegister;