import React, { useState, useEffect, useRef } from 'react';
import Swal from 'sweetalert2';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';
import axios from 'axios';
import PropTypes from 'prop-types';
import { Typeahead } from 'react-bootstrap-typeahead';
import { useLocation } from 'react-router-dom';
import {
    DataGrid,
    GridActionsCellItem,
    GridRowModes,
    GridRowEditStopReasons,
    GridToolbar,
} from '@mui/x-data-grid';
import DeleteIcon from '@mui/icons-material/DeleteOutlined';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Close';
import { getConfig } from 'src/config';
import Select from "react-select";
import { Card, CardBody, CardHeader } from 'react-bootstrap';
import secureLocalStorage from 'react-secure-storage';

const Allocated_assets = ({ auth }) => {
    const gridRef = useRef(null);
    const [select, setSelect] = useState({
        AssetID: '',
    });
    const [selectLocation, setselectLocation] = useState({
        LinkID: '',
    });
    const location = useLocation();
    let pageData = location.state?.pageData;
    if (!pageData) {
        const storedData = secureLocalStorage.getItem('pageData');
        pageData = storedData || {};
    }
    const API_URL = getConfig().REACT_APP_API_URL;
    const [Register, setRegister] = useState({
        AssetType: '', id: '', EmployeeId: '', EmployeeRFID: '', EmployeeName: ''
    });

    // MUI data Grid Start
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [rows, setRows] = useState([]);
    const [rowModesModel, setRowModesModel] = useState({});
    const [selectedRows, setSelectedRows] = useState([]);
    // Prevent auto-save on blur
    const handleRowEditStop = (params, event) => {
        if (params.reason === GridRowEditStopReasons.rowFocusOut) {
            event.defaultMuiPrevented = true;
        }
    };

    // Edit
    const handleEditClick = (id) => () => {
        // console.log('Edit row with id:', id, 'rowModesModel:', rowModesModel);
        setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.Edit } });
    };

    // Save
    const handleSaveClick = (id) => () => {
        // console.log('Saving row with id:', id);
        // console.log('Current rowModesModel:', rowModesModel);
        setRowModesModel((oldModel) => {
            const newModel = {
                ...oldModel,
                [id]: { mode: GridRowModes.View },
            };
            // console.log('New rowModesModel after save:', newModel);
            return newModel;
        });
    };

    // Delete
    const handleDeleteClick = (id) => () => {
        setRows((prev) => prev.filter((row) => row.id !== id));
    };

    // Cancel
    const handleCancelClick = (id) => () => {
        setRowModesModel({
            ...rowModesModel,
            [id]: { mode: GridRowModes.View, ignoreModifications: true },
        });
    };

    // Persist edits into state
    const processRowUpdate = (newRow) => {
        const existingRow = rows.find((row) => row.id === newRow.id);
        if (!existingRow) {
            console.error('Existing row not found for id:', newRow.id);
            return newRow;
        }
        const updatedRow = {
            ...existingRow, // Preserve all fields
            ...newRow, // Update edited fields
            DueDate: newRow.DueDate ? (newRow.DueDate instanceof Date ? newRow.DueDate : new Date(newRow.DueDate)) : null,
        };
        const updatedRows = rows.map((row) =>
            row.id === newRow.id ? updatedRow : row
        );
        setRows([...updatedRows]);
        return updatedRow;
    };

    const handleRowModesModelChange = (newRowModesModel) => {
        // console.log('New rowModesModel:', newRowModesModel);
        setRowModesModel(newRowModesModel);
    };

    // const columns = [
    //     { headerCheckboxSelection: true, checkboxSelection: true, width: 60 },
    //     { field: "AssetID", headerName: "Asset ID", width: 150 },
    //     { field: "AssetName", headerName: "Asset Name", width: 200 },
    //     { field: "AssetType", headerName: "Asset Type", width: 150 },
    //     { field: "LocationCode", headerName: "Location Code", width: 150 },
    //     { field: "Building", headerName: "Building", width: 150 },
    //     { field: "Floor", headerName: "Floor", width: 150 },
    //     { field: "Room", headerName: "Room", width: 150 },
    //     { field: "Category", headerName: "Category", width: 150 },
    //     { field: "SubCategory", headerName: "SubCategory", width: 150 },
    //     { field: "Department", headerName: "Department", width: 150 },
    //     { field: "Description", headerName: "Description", width: 150 },
    //     { field: "VendorName", headerName: "Vendor Name", width: 150 },
    //     { field: "PhoneNumber", headerName: "vendor Number", width: 150 },

    // ];
    const columns = [
        {
            field: "actions", headerClass: 'agheader',
            headerName: "Actions",
            type: "actions",
            width: 120,
            getActions: ({ id }) => {
                const isInEditMode = rowModesModel[id]?.mode === GridRowModes.Edit;
                if (isInEditMode) {
                    return [
                        <GridActionsCellItem
                            icon={<SaveIcon />}
                            label="Save"
                            onClick={handleSaveClick(id)}
                        />,
                        <GridActionsCellItem
                            icon={<CancelIcon />}
                            label="Cancel"
                            onClick={handleCancelClick(id)}
                            color="inherit"
                        />,
                    ];
                }
                return [
                    // <GridActionsCellItem
                    //     icon={<EditIcon />}
                    //     label="Edit"
                    //     onClick={handleEditClick(id)}
                    //     color="inherit"
                    // />,
                    <GridActionsCellItem
                        icon={<DeleteIcon />}
                        label="Delete"
                        onClick={handleDeleteClick(id)}
                        color="inherit"
                    />,
                ];
            },
        },
        { field: "AssetID", headerClass: 'agheader', headerName: "Asset ID", width: 150, editable: true },
        { field: "AssetName", headerClass: 'agheader', headerName: "Asset Name", width: 200, editable: true },
        { field: "AssetType", headerName: "Asset Type", width: 150, editable: true },
        { field: "LocationCode", headerName: "Location Code", width: 150, editable: true },
        { field: "Building", headerName: "Building", width: 150, editable: true },
        { field: "Floor", headerName: "Floor", width: 150, editable: true },
        { field: "Room", headerName: "Room", width: 150, editable: true },
        { field: "Category", headerName: "Category", width: 150, editable: true },
        { field: "SubCategory", headerName: "SubCategory", width: 150, editable: true },
        { field: "Department", headerName: "Department", width: 150, editable: true },
        { field: "Description", headerName: "Description", width: 150, editable: true },
        { field: "VendorName", headerName: "Vendor Name", width: 150, editable: true },
        { field: "PhoneNumber", headerName: "Vendor Number", width: 150, editable: true },

    ];


    // MUI data Grid End


    // const { auth } = useContext(AuthContext)
    const [show, setShow] = useState(false);

    const handlegetDIR_assets = async (selected) => {
        if (selected.length > 0) {
            try {
                const alldata = {
                    mode: 'GetDIRassets',
                    LinkID: selected[0].LinkID,
                    branchid: auth.branchid
                };
                console.log("🚀 ~ handlegetDIR_assets ~ alldata:", alldata)

                const response = await axios.post(`${API_URL}/AllocateAssets`, alldata);
                const data = response.data; // ✅ array of assets

                if (data.length > 0) {
                    setRows((prevRows) => {
                        const newRows = data.filter((item) =>
                            !prevRows.some((row) => row.AssetID === item.AssetID)
                        ).map((item) => ({
                            id: item.id,// ✅ must exist and unique
                            AssetID: item.AssetID,
                            AssetName: item.AssetName,
                            RFIDnumber: item.RFIDnumber,
                            LinkID: item.LinkID,
                            AssetType: item.AssetType,
                            LocationCode: item.LocationCode,
                            Building: item.Building,
                            Floor: item.Floor,
                            Room: item.Room,
                            Category: item.Category,
                            SubCategory: item.SubCategory,
                            Department: item.Department,
                            Description: item.Description,
                            VendorName: item.VendorName,
                            PhoneNumber: item.PhoneNumber
                        }));

                        return [...prevRows, ...newRows];
                    });
                } else {
                    Swal.fire({
                        title: `DIR Asset Not Available`,
                        text: `DIR Asset Not Available in This Location`,
                        icon: 'info'
                    });
                }

            } catch (err) {
                Swal.fire({
                    title: `Error`,
                    text: `Error On Getting DIR Based Asset`,
                    icon: 'error'
                });
                console.error("Error On Getting DIR Based Asset", err);
            }
        }
    };

    const handlegetPIR_assets = async (selected) => {

        if (selected.length > 0) {
            try {
                const alldata = {
                    mode: 'GetPIRassets',
                    AssetID: selected[0].AssetID,
                    branchid: auth.branchid
                };

                const response = await axios.post(`${API_URL}/AllocateAssets`, alldata);
                const data = response.data; // ✅ array of assets
                if (data.length > 0) {
                    if (data[0].MaintenanceDetails === 'UnderMaintenance') {
                        swal({
                            title: `RFID Already Under Maintenance`,
                            text: `Please Enter Valid RFID number`,
                            icon: 'warning'
                        });
                        return;
                    }
                    if (data[0].TransferStatus === 'InternalTransfer') {
                        swal({
                            title: `Not Valid`,
                            text: `Internal Transfer is Pending `,
                            icon: 'warning'
                        });
                        return;
                    }
                    if (data[0].TransferStatus === 'ExternalTransfer') {
                        swal({
                            title: `Not Valid`,
                            text: `External Transfer is Pending `,
                            icon: 'warning'
                        });
                        return;
                    }
                    if (data[0].TransferStatus === 'ExternallyTransferred') {
                        swal({
                            title: `Asset Not Valid`,
                            text: `Please try Another Asset,This Asset Externally Transferred `,
                            icon: 'warning'
                        });
                        return;
                    }
                    if (data[0].AllocateStatus === 'Allocated') {
                        swal({
                            title: `Not Valid`,
                            text: `Asset Allocated Please Release and Try `,
                            icon: 'warning'
                        });
                        return;
                    }

                    setRows((prevRows) => {
                        // Find only unique new rows (skip duplicates)
                        const newRows = data.filter((item) =>
                            !prevRows.some((row) => row.AssetID === item.AssetID)
                        ).map((item) => ({
                            id: item.id,           // must be unique
                            AssetID: item.AssetID,
                            AssetName: item.AssetName,
                            RFIDnumber: item.RFIDnumber,
                            LinkID: item.LinkID,
                            AssetType: item.AssetType,
                            LocationCode: item.LocationCode,
                            Building: item.Building,
                            Floor: item.Floor,
                            Room: item.Room,
                            Category: item.Category,
                            SubCategory: item.SubCategory,
                            Department: item.Department,
                            Description: item.Description,
                            VendorName: item.VendorName,
                            PhoneNumber: item.PhoneNumber
                        }));

                        // Find duplicates (for alert)
                        const duplicateAssets = data
                            .filter((item) =>
                                prevRows.some((row) => row.AssetID === item.AssetID)
                            )
                            .map((dup) => dup.AssetID);

                        // ⚠️ Show alert once if any duplicates exist
                        if (duplicateAssets.length > 0) {
                            Swal.fire({
                                icon: 'warning',
                                title: 'Duplicate Entries Detected',
                                html: `Assets with IDs <b>${duplicateAssets.join(', ')}</b> already exist!`,
                                confirmButtonText: 'OK',
                                confirmButtonColor: '#3085d6',
                            });
                        }

                        return [...prevRows, ...newRows];
                    });

                } else {
                    Swal.fire({
                        title: `Warning`,
                        text: `Asset Already Allocated,Try Another`,
                        icon: 'warning'
                    });
                }
            } catch (err) {
                Swal.fire({
                    title: `Error`,
                    text: `Error On Getting PIR Based Asset`,
                    icon: 'error'
                });
                console.error("Error On Getting PIR Based Asset", err);
            }
        }

    }

    // Update Allocate
    const handlecheckPIR = async (e) => {
        if (auth.branchid === "0" || auth.branchid === 0) {
            Swal.fire({
                icon: 'warning',
                title: 'Invalid Selection',
                text: "Please select a specific branch. 'ALL' is not allowed.",
            });
            return;
        }
        if (Register.AssetType === '') {
            Swal.fire({
                icon: 'warning',
                title: 'SELECT ASSET TYPE',
                text: "Select Asset Type",
            });
            return;
        }
        if (rows.length === 0) {
            Swal.fire({
                icon: 'warning',
                title: 'ASSET NOT AVAILABLE',
                text: "Give Assets to Allocate",
            });
            return;
        }
        if (Register.EmployeeId === '') {
            Swal.fire({
                icon: 'warning',
                title: 'PLEASE SELECT EMPLOYEE',
                text: "Select Employee to Allocate Asset",
            });
            return;
        }
        try {
            const requests = rows.map(data => {
                const alldata = {
                    ...data,
                    ...Register,
                    Createdby: auth.empid,
                    mode: 'I',
                    branchid: auth.branchid,
                };
                return axios.post(`${API_URL}/AllocateAssets`, alldata);
            });

            await Promise.all(requests);

            Swal.fire({
                title: 'Saved Successfully',
                text: '',
                icon: 'success',
                confirmButtonText: 'Done'
            }).then(() => {
                setRows([]); // Clear the rows after processing
                setRegister(
                    {
                        ...Register,
                        AssetType: '', id: '', EmployeeId: '', EmployeeRFID: ''
                    }
                );
                setAssetData([]);
                setSelect({
                    AssetID: ''
                });
                SetLocationDropDownData([])
            });

        } catch (err) {
            console.log("Error on Update Maintenance Register", err)
        }

    }

    const handlecheckDIR = async (e) => {
        if (auth.branchid === "0" || auth.branchid === 0) {
            Swal.fire({
                icon: 'warning',
                title: 'Invalid Selection',
                text: "Please select a specific branch. 'ALL' is not allowed.",
            });
            return;
        }
        if (Register.AssetType === '') {
            Swal.fire({
                icon: 'warning',
                title: 'SELECT ASSET TYPE',
                text: "Select Asset Type",
            });
            return;
        }

        if (rows.length === 0) {
            Swal.fire({
                icon: 'warning',
                title: 'ASSET NOT AVAILABLE',
                text: "Give Assets to Allocate",
            });
            return;
        }

        if (Register.EmployeeId === '') {
            Swal.fire({
                icon: 'warning',
                title: 'PLEASE SELECT EMPLOYEE',
                text: "Select Employee to Allocate Asset",
            });
            return;
        }

        try {
            const requests = rows.map(data => {
                const alldata = {
                    ...data,
                    ...Register,
                    Createdby: auth.empid,
                    mode: 'I',
                    branchid: auth.branchid,
                };
                return axios.post(`${API_URL}/AllocateAssets`, alldata);
            });

            await Promise.all(requests);

            Swal.fire({
                title: 'Saved Successfully',
                icon: 'success',
                confirmButtonText: 'Done'
            }).then(() => {
                // ✅ Clear all fields and selections after success
                setRows([]);
                setRegister({
                    ...Register,
                    AssetType: '', id: '', EmployeeId: '', EmployeeRFID: ''
                });
                setAssetData([]);
                setSelect({ AssetID: '' });
                SetLocationDropDownData([]);
                setselectLocation({ LinkID: '' });
            });


        } catch (err) {
            console.error("Error on Allocate Assets", err);
        }
    };

    const [AssetType, setAssetType] = useState([]);
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
    const [LocationDropDownData, SetLocationDropDownData] = useState([]);
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

    const [AssetData, setAssetData] = useState([])
    const fetchAssetData = async () => {
        try {
            const alldata = { departmentname: auth.departmentname, mode: 'PIRAssets', branchid: auth.branchid, BranchAccess: auth.BranchAccess }
            // console.log(alldata)
            const response = await axios.post(`${API_URL}/EnrolledAssetInfo`, alldata);
            setAssetData(response.data.send);
            console.log(response.data.send)
        } catch (error) {
            console.error('Error fetching user details:', error);
        }
    };

    const [EmployeeData, setEmployeeData] = useState([]);
    const fetchEmployeeData = async () => {
        const alldata = {
            mode: 'FetchEmployee', Id: '', Empid: '', FirstName: '', LastName: '', DOJ: '', DOB: '', Department: ''
            , email: '', Contact: '', Status: '', Type: '', Gender: '', Photo: '', CreatedBy: '',
            RFID: ''
        }
        try {
            const response = await axios.post(`${API_URL}/EmployeeConfig`, alldata);
            setEmployeeData(response.data);

        } catch (error) {
            console.error('Error fetching user details:', error);
        }
    };

    useEffect(() => {
        fetchAssetType();
        FetchLocationDropdown();
        fetchEmployeeData();

    }, []);

    return (
        <>



            {/* <div className="row "> */}
            <Card>

                <div className="card-header pro-header p-1">
                    <div className="d-flex justify-content-center align-items-center">
                        {/* Center Title */}
                        <div className="text-center" >
                            <h4 className="text-white m-0">
                                <i class="bi bi-link ms-1 fs-2"></i>  Allocate Assets
                            </h4>
                        </div>


                    </div>
                </div>


                <CardBody>
                    <div className="row mt-3">
                        <div className="col-xl-3 col-lg-6 col-sm-6 col-xs-2 mt-1">
                            <label className='fw-bold form-label'>Select Asset Type</label>
                            <Select
                                options={AssetType.map(opt => ({
                                    value: opt.AssetType,
                                    label: opt.AssetType
                                }))}
                                onChange={selected => {
                                    setRegister({
                                        ...Register,
                                        AssetType: selected.value
                                    })
                                    if (selected.value === "DIR") {
                                        setShow(true);
                                        FetchLocationDropdown();

                                    } else {
                                        setShow(false);
                                        fetchAssetData();

                                    }

                                }
                                }
                                value={
                                    Register.AssetType
                                        ? { value: Register.AssetType, label: Register.AssetType }
                                        : null
                                }
                                placeholder="Select Asset Type"
                                styles={{
                                    menuPortal: (base) => ({ ...base, zIndex: 9999 }), // bring to front
                                    menu: (base) => ({ ...base, zIndex: 9999, opacity: 1 }), // full opacity
                                }}
                            />
                        </div>

                        {show && (
                            <div className="col-xl-3 col-lg-6 col-sm-6 col-xs-2 mt-1">
                                <label className="form-label">Select Location Code</label>
                                <Typeahead
                                    id="branch-typeahead"
                                    labelKey="LocationCode"
                                    options={LocationDropDownData}
                                    placeholder="Select a Location Code..."
                                    onChange={(selected) => {
                                        console.log(selected.length);
                                        if (selected.length > 0) {
                                            setselectLocation({
                                                ...selectLocation,
                                                LinkID: selected.length > 0 ? selected[0].LinkID : ''
                                            });
                                            handlegetDIR_assets(selected);
                                        } else {
                                            setselectLocation({
                                                ...selectLocation,
                                                LinkID: ''
                                            });
                                        }

                                    }}

                                    selected={selectLocation.LinkID ? LocationDropDownData.filter(item => item.LinkID === selectLocation.LinkID) : []}
                                    required
                                />
                            </div>
                        )}

                        {!show && (
                            <div className="col-xl-3 col-lg-6 col-sm-6 col-xs-2 mt-1">
                                <label className="form-label">Select Asset ID / RFID</label>
                                <Typeahead
                                    id="branch-typeahead"
                                    labelKey={(option) => `${option.AssetID} / ${option.RFIDnumber}`}
                                    options={AssetData}
                                    placeholder="Select a Asset ID / RFID..."
                                    onChange={(selected) => {
                                        console.log(selected.length);
                                        if (selected.length > 0) {
                                            handlegetPIR_assets(selected);
                                            setSelect({
                                                AssetID: selected[0].AssetID
                                            })
                                        }
                                        else {
                                            setSelect({
                                                AssetID: ''
                                            })
                                        }

                                    }}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();

                                            const inputValue = e.target.value.trim();

                                            // Find by AssetID OR RFIDnumber
                                            const selected = RFIDdropdown.filter(
                                                item =>
                                                    item.AssetID === inputValue ||
                                                    item.RFIDnumber === inputValue ||
                                                    `${item.AssetID} / ${item.RFIDnumber}` === inputValue
                                            );


                                            if (selected.length > 0) {

                                                handlegetPIR_assets(selected);

                                            }
                                        }
                                    }}
                                    selected={select.AssetID ? AssetData.filter(item => item.AssetID === select.AssetID) : []}
                                    required
                                />
                            </div>
                        )}

                        <div className="col-xl-3 col-lg-6 col-sm-6 col-xs-2 mt-1">
                            <label className="form-label">Select Employee ID</label>
                            <Typeahead
                                id="branch-typeahead"
                                labelKey={(option) => `${option.Empid} / ${option.RFID}`}
                                options={EmployeeData}
                                placeholder="Select a Employee ID / RFID..."
                                onChange={(selected) => {
                                    setRegister({
                                        ...Register,
                                        EmployeeId: selected.length > 0 ? selected[0].Empid : '',
                                        EmployeeRFID: selected.length > 0 ? selected[0].RFID : '',
                                        EmployeeName: selected.length > 0 ? selected[0].FirstName : '',
                                    });
                                }}
                                selected={Register.EmployeeId ? EmployeeData.filter(item => item.Empid === Register.EmployeeId) : []}
                                required
                            />
                        </div>

                        <div className="col-xl-3 col-lg-6 col-sm-6 col-xs-2 mt-1">
                            <label className="form-label">Employee Name</label>
                            <input className='form-control' onChange={(e) => setRegister({ ...Register, EmployeeName: e.target.value })} value={Register.EmployeeName} placeholder='Employee Name' disabled />

                        </div>
                    </div>
                </CardBody>
            </Card>
            {/* </div> */}

            {/* <div
                    className="ag-theme-quartz mt-4"
                    style={{
                        height: 350,
                        width: "100%",
                    }}
                >
                    <AgGridReact
                        ref={gridRef}
                        rowData={rows}
                        columnDefs={columns}
                        defaultColDef={{
                            editable: true,
                            resizable: true,
                            sortable: true,
                            filter: true,
                        }}
                        rowSelection="multiple"
                        onCellValueChanged={processRowUpdate} // same update logic as before
                        onGridReady={(params) => params.api.sizeColumnsToFit()}
                        pagination={true}
                        paginationPageSize={10}
                    />
                </div> */}

            <div
                className="ag-theme-quartz mt-4"
                style={{
                    height: 470,
                    width: "100%",
                }}
            >                <DataGrid className="ag-theme-quartz mt-4"

                rows={rows}
                columns={columns}
                ref={gridRef}
                editMode="row"
                rowModesModel={rowModesModel}
                onRowModesModelChange={handleRowModesModelChange}
                onRowEditStop={handleRowEditStop}
                processRowUpdate={processRowUpdate}
                checkboxSelection
                disableRowSelectionOnClick
                slots={{ toolbar: GridToolbar }}
                slotProps={{
                    toolbar: {
                        showQuickFilter: true,
                        quickFilterProps: { debounceMs: 500 },
                    },
                }}
                onRowSelectionModelChange={(newSelection) => {

                    const selectedData = rows.filter((row) => newSelection.includes(row.id));
                    setSelectedRows(selectedData);
                }}
                pageSizeOptions={[5, 10, 25, 50]}
                paginationModel={{ pageSize, page: page - 1 }}
                onPaginationModelChange={(model) => {
                    setPage(model.page + 1);
                    setPageSize(model.pageSize);
                }}
                pagination
                sx={{
                    '& .MuiDataGrid-columnHeaders': {
                        backgroundColor: '#f5f5f5',
                        fontWeight: 'bold',
                    },
                    '& .MuiDataGrid-cell': {
                        borderBottom: '1px solid #e0e0e0',
                    },
                    '& .MuiTablePagination-root': {
                        backgroundColor: '#fafafa',
                    },
                }}
                />
            </div>


            {/* Action Buttons */}
            {
                (pageData.editstatus === null || pageData.editstatus === 'i') && auth.UserStatus === 'A'
                    ? '' : (
                        <div className='d-flex justify-content-between pb-5 '>
                            <button className='btn btn-danger me-2 gap-2 mt-3 btn-hover-effect' onClick={() => {
                                setRegister({
                                    ...Register,
                                    AssetType: '', EmployeeId: '', EmployeeRFID: '', id: ''
                                });
                                setSelect({
                                    AssetID: ''
                                });
                                setselectLocation({
                                    LinkID: ''
                                });
                                setRows([]);
                            }}>Clear</button>
                            <button className='btn btn-success me-2 gap-2 mt-3 text-nowrap btn-hover-effect' onClick={() => {
                                if (Register.AssetType === 'PIR') {
                                    handlecheckPIR()
                                } else {
                                    handlecheckDIR()
                                }

                            }}>Allocate</button>

                        </div>
                    )
            }

        </>
    )
}

Allocated_assets.propTypes = {
    auth: PropTypes.any.isRequired,
};

export default Allocated_assets
