import React, { useState, useMemo, useEffect, useRef, useContext } from 'react';
import Swal from 'sweetalert2';
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import axios from 'axios';
import PropTypes from 'prop-types';
import { Typeahead } from 'react-bootstrap-typeahead';
import { useLocation } from 'react-router-dom';
import {
    GridRowModes,
    DataGrid,
    GridActionsCellItem,
    GridRowEditStopReasons
} from '@mui/x-data-grid';
import { Box } from "@mui/material";
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/DeleteOutlined';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Close';
import { getConfig } from 'src/config';
import { Card, CardBody, CardHeader } from 'react-bootstrap';
import "react-bootstrap-typeahead/css/Typeahead.css";
import secureLocalStorage from 'react-secure-storage';

const ScrabRegister = ({ auth }) => {
    const [select, setSelect] = useState({
        RFIDnumber: '',
        AssetID: ''  // Added AssetID to fully control the Typeahead
    });

    const [MinDueDate, setMinDueDate] = useState('');
    const location = useLocation();
    let pageData = location.state?.pageData;
    if (!pageData) {
        const storedData = secureLocalStorage.getItem('pageData');
        pageData = storedData || {};
    }
    const API_URL = getConfig().REACT_APP_API_URL;
    const [RFID, setRFID] = useState(false)
    const [ID, setID] = useState(false)
    const PartRef1 = useRef(null)
    const PartRef2 = useRef(null)
    const [Register, setRegister] = useState({
        AssetID: '', VendorID: '', InspectedBy: '', Condition: '', Defect: '', MaintenanceDetails: '', id: '', MaintenanceType: '', MaintenanceRegDate: '', ScrapRegDate: '', Status: '', RFIDnumber: '', Movement: '', RegisteredBy: '',
    });

    // MUI data Grid Start
    const [rows, setRows] = useState([]);
    const [rowModesModel, setRowModesModel] = useState({});
    // Prevent auto-save on blur
    const handleRowEditStop = (params, event) => {
        if (params.reason === GridRowEditStopReasons.rowFocusOut) {
            event.defaultMuiPrevented = true;
        }
    };

    // Edit
    const handleEditClick = (id) => () => {
        setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.Edit } });
    };

    // Save
    const handleSaveClick = (id) => () => {
        setRowModesModel((oldModel) => {
            const newModel = {
                ...oldModel,
                [id]: { mode: GridRowModes.View },
            };
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
            return newRow;
        }
        const updatedRow = {
            ...existingRow,
            ...newRow,
            DueDate: newRow.DueDate ? (newRow.DueDate instanceof Date ? newRow.DueDate : new Date(newRow.DueDate)) : null,
        };
        const updatedRows = rows.map((row) =>
            row.id === newRow.id ? updatedRow : row
        );
        setRows([...updatedRows]);
        return updatedRow;
    };
    const handleRowModesModelChange = (newRowModesModel) => {
        setRowModesModel(newRowModesModel);
    };

    const columns = [
        { field: "AssetID", headerClass: 'agheader', headerName: "Asset ID", width: 220 },
        { field: "AssetName", headerClass: 'agheader', headerName: "Asset Name", width: 230 },
        { field: "RFIDnumber", headerClass: 'agheader', headerName: "RFID", width: 220 },
        { field: "Description", headerClass: 'agheader', headerName: "Description", width: 240 },
        { field: "Remarks", headerClass: 'agheader', headerName: "Remarks", editable: true, width: 240 },
        {
            field: "actions",
            type: "actions", headerClass: 'agheader',
            headerName: "Actions",
            width: 240,
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
                    <GridActionsCellItem
                        icon={<EditIcon />}
                        label="Edit"
                        onClick={handleEditClick(id)}
                        color="inherit"
                    />,
                    <GridActionsCellItem
                        icon={<DeleteIcon />}
                        label="Delete"
                        onClick={handleDeleteClick(id)}
                        color="inherit"
                    />,
                ];
            },
        },
    ];

    // MUI data Grid End

    const [show, setShow] = useState(true);
    const [selectedOption, setSelectedOption] = useState(''); // State to manage selected option

    // Function to handle select change
    const handleSelectChange = (event) => {
        const value = event.target.value;
        setSelectedOption(value);
        setRegister(prevRegister => ({
            ...prevRegister,
            Activity: value
        }));
        if (value === 'Maintenance') {
            setShow(true);
        } else {
            setShow(false);
        }
    };

    const handleEnterforMP1 = async (selected) => {
        if (selected.length === 0) {
            setRegister({
                ...Register,
                AssetID: '',
                AssetName: '',
                RFIDnumber: '',
                Category: '',
                SubCategory: '',
                branchName: '',
                Location: '',
                Department: '',
                Description: ''
            });
            setRFID(false)
        }
        if (selected.length > 0) {
            try {
                const alldata = {
                    mode: 'SM',
                    RFIDnumber: selected[0].AssetID,
                    branchid: auth.branchid
                };

                const response = await axios.post(`${API_URL}/PendingAssetMaintenanceSearch`, alldata);
                const data = response.data[0];

                if (!data) {
                    Swal.fire({
                        title: `RFID Not Found`,
                        text: `Please Enter Valid RFID number`,
                        icon: 'warning'
                    });
                    return;
                }

                if (data.MaintenanceDetails === 'UnderMaintenance') {
                    Swal.fire({
                        title: `RFID Already Under Maintenance`,
                        text: `Please Enter Valid RFID number`,
                        icon: 'warning'
                    });
                    return;
                }
                if (data.ExternalTransferStatus === 'ExtrenalTransfer') {
                    Swal.fire({
                        title: `Not Valid`,
                        text: `External Transfer is Pending `,
                        icon: 'warning'
                    });
                    return;
                }
                if (data.InternalTransferStatus === 'InternalTransfer') {
                    Swal.fire({
                        title: `Not Valid`,
                        text: `Internal Transfer is Pending `,
                        icon: 'warning'
                    });
                    return;
                }
                if (data.AllocatedStatus === 'Allocated') {
                    Swal.fire({
                        title: `Not Valid`,
                        text: `Asset Allocated to Employee ,Please Recover and Try `,
                        icon: 'warning'
                    });
                    return;
                }

                const {
                    AssetID, AssetName, RFIDnumber, Description, id
                } = data;

                setRows((prevRows) => {
                    if (prevRows.some((row) => row.AssetID === AssetID)) {
                        return prevRows;
                    }
                    return [
                        ...prevRows,
                        {
                            id: id,
                            AssetID,
                            AssetName,
                            RFIDnumber,
                            Description,
                            Remarks: '',
                            DueDate: ''
                        }
                    ];
                });

                setRegister({ ...Register, AssetID, AssetName, RFIDnumber });
                setRFID(true);

            } catch (err) {
                Swal.fire({
                    title: `RFID Number is Not Valid`,
                    text: `Please Enter Valid RFID number`,
                    icon: 'warning'
                });
                console.error("Error On sending RFID", err);
            }
        }
    }

    // Move to Scrap - Fixed to clear Typeahead properly
    const handlecheckforScrap = async (e) => {
        if (auth.branchid === "0" || auth.branchid === 0) {
            Swal.fire({
                icon: 'warning',
                title: 'Invalid Selection',
                text: "Please select a specific branch. 'ALL' is not allowed.",
            });
            return;
        }

        try {
            const requests = rows.map(data => {
                const alldata = {
                    ...data,
                    ...Register,
                    RegisteredBy: auth.empid, mode: 'MTS', branchid: auth.branchid
                };
                console.log("🚀 ~ handlecheckforScrap ~ alldata:", alldata)
                return axios.post(`${API_URL}/MovetoScrap`, alldata);
            });

            await Promise.all(requests);

            Swal.fire({
                title: 'Successfully Moved to Scrap',
                icon: 'success',
                confirmButtonText: 'okay'
            }).then(() => {
                // Reset Register state
                setRegister({
                    AssetID: '', AssetName: '', id: '', MaintenanceDetails: '', MaintenanceType: '', MaintenanceRegDate: '', ScrapRegDate: '',
                    Status: '', Activity: '', VendorID: '', Description: '', Category: '',
                    SubCategory: '', branchName: '', Location: '', Remarks: '', Department: '', RFIDnumber: ''
                })

                // Critical: Reset select state to clear the Typeahead selection
                setSelect({
                    RFIDnumber: '',
                    AssetID: ''
                });

                // Clear grid and flags
                setRows([]);
                setID(false);
                setRFID(false);

                // Optional: clear refs if still using them elsewhere
                if (PartRef1.current) {
                    PartRef1.current.clear()
                }
                if (PartRef2.current) {
                    PartRef2.current.clear()
                }
            })



        } catch (err) {
            console.log("Error On Move to Scrap Frontend", err)
            Swal.fire({
                title: 'Error',
                text: 'Failed to move asset to scrap.',
                icon: 'error'
            });
        }
    }

    const inputRef = useRef(null);

    // USER Dropdown
    const [MaintenanceType, SetMaintenanceType] = useState([])
    const FetchMaintenanceType = async () => {
        try {
            const response = await axios.post(`${API_URL}/fetchMaintenance`, { branchid: auth.branchid, mode: 'S' });
            if (response.status === 200) {
                SetMaintenanceType(response.data.send);
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
            console.error('Error fetching vendor details:', error);
        }
    };

    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.focus();
            inputRef.current.setSelectionRange(0, 0);
        }
        const date = new Date().toISOString().split('T')[0];
        setMinDueDate(date);
        FetchMaintenanceType();
        fetchData();
        fetchVendorData();
    }, []);

    const [RFIDdropdown, setRFIDdropdown] = useState([])
    const fetchData = async () => {
        try {
            const alldata = { departmentname: auth.departmentname, mode: 'EnrolledAssets', branchid: auth.branchid, BranchAccess: auth.BranchAccess }
            const response = await axios.post(`${API_URL}/EnrolledAssetInfo`, alldata);
            setRFIDdropdown(response.data.send);
        } catch (error) {
            console.error('Error fetching user details:', error);
        }
    };

    return (
        <div className=''>
            <Card className='mt-4'>
                <div className="card-header pro-header p-1">
                    <div className="d-flex justify-content-center align-items-center">
                        <div className="text-center" >
                            <h3 className="text-white m-0">
                                <i className="bi bi-trash3 ms-1 fs-4"></i> Scrap Register
                            </h3>
                        </div>
                    </div>
                </div>
                <CardBody>
                    <div className="row g-4 mt-2">
                        <div className="col-lg-4 mt-1">
                            <label className="form-label">Select Asset ID / RFID</label>
                            <Typeahead
                                id="branch-typeahead"
                                labelKey={(option) => `${option.AssetID} / ${option.RFIDnumber}`}
                                options={RFIDdropdown}
                                placeholder="Select a Asset ID / RFID..."
                                onChange={(selected) => {
                                    if (selected.length > 0) {
                                        handleEnterforMP1(selected);
                                        setSelect({
                                            AssetID: selected[0].AssetID,
                                            RFIDnumber: selected[0].RFIDnumber
                                        })
                                    } else {
                                        setSelect({
                                            AssetID: '',
                                            RFIDnumber: ''
                                        })
                                        // Clear rows if nothing selected
                                        setRows([]);
                                        setRegister(prev => ({
                                            ...prev,
                                            AssetID: '',
                                            AssetName: '',
                                            RFIDnumber: ''
                                        }));
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

                                        console.log("🚀 ~ PreMaintenance_test ~ selected.length:", selected)
                                        if (selected.length > 0) {

                                            handleEnterforMP1(selected);

                                        }
                                    }
                                }}
                                selected={select.AssetID ? RFIDdropdown.filter(item => item.AssetID === select.AssetID) : []}
                                required
                                clearButton
                            />
                        </div>
                    </div>

                    <Box
                        className="mt-4"
                        sx={{
                            height: 350,
                            width: "100%",
                            "& .MuiDataGrid-columnHeaders": {
                                background: "#f1f3f7",
                                fontWeight: "bold",
                                fontSize: "15px",
                            },
                            "& .MuiDataGrid-row:nth-of-type(odd)": {
                                backgroundColor: "#f9f9f9",
                            },
                            "& .MuiDataGrid-row:nth-of-type(even)": {
                                backgroundColor: "#e6f2ff",
                            },
                            "& .MuiDataGrid-cell": {
                                color: "#333",
                                fontSize: "14px",
                            },
                            "& .MuiDataGrid-row:hover": {
                                backgroundColor: "#cce6ff !important",
                            },
                        }}
                    >
                        <DataGrid
                            rows={rows}
                            columns={columns}
                            editMode="row"
                            getRowId={(row) => row.id}
                            rowModesModel={rowModesModel}
                            onRowModesModelChange={handleRowModesModelChange}
                            onRowEditStop={handleRowEditStop}
                            processRowUpdate={processRowUpdate}
                            onProcessRowUpdateError={(err) => {
                                console.error("Row update error:", err);
                                Swal.fire({
                                    title: "Error",
                                    text: `Failed to update row: ${err.message}`,
                                    icon: "error",
                                });
                            }}
                            experimentalFeatures={{ newEditingApi: true }}
                        />
                    </Box>

                    {/* Action Buttons */}
                    {(pageData.editstatus === null || pageData.editstatus === 'i') && auth.UserStatus === 'A'
                        ? '' : (
                            <div className='text-center mt-3'>
                                <button className='btn btn-danger me-2 btn-hover-effect'>Cancel</button>
                                <button className='btn btn-success mx-2 text-nowrap btn-hover-effect' onClick={handlecheckforScrap}>Save & Move Scrap</button>
                            </div>
                        )}
                </CardBody>
            </Card>
        </div>
    )
}

ScrabRegister.propTypes = {
    auth: PropTypes.any.isRequired,
};

export default ScrabRegister