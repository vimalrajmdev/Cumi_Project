import React, { useState, useEffect, useContext, useRef } from 'react'
import Swal from 'sweetalert2'
import axios from 'axios'
import PropTypes from 'prop-types';
import { Typeahead } from 'react-bootstrap-typeahead';
import { getConfig } from 'src/config';
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
import EditIcon from '@mui/icons-material/Edit';
import { DeleteOutline } from '@mui/icons-material';
import "react-bootstrap-typeahead/css/Typeahead.css";

const InternalTransfer = ({ auth }) => {
    // const { auth } = useContext(AuthContext)
    const PartRef1 = useRef(null)
    const PartRef2 = useRef(null)
    const API_URL = getConfig().REACT_APP_API_URL;
    const [RFID, setRFID] = useState(false)
    const [ID, setID] = useState(false)
    const [physicalLocationData, setPhysicalLocationData] = useState([]);
    const [selectedRFID, setSelectedRFID] = useState(null);
    const typeaheadRef = useRef(null);

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
    // const handleDeleteClick = (id) => () => {
    //     setRows((prev) => prev.filter((row) => row.id !== id));
    // };

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

    const columns = [
        {
            field: "actions",
            type: "actions",
            headerName: "Actions",
            width: 120,
            getActions: ({ id }) => {
                const isInEditMode = rowModesModel[id]?.mode === GridRowModes.Edit;

                if (isInEditMode) {
                    return [
                        <GridActionsCellItem
                            icon={<SaveIcon />}
                            label="Save"
                            onClick={handleSaveClick(id)}
                            key="save"
                        />,
                        <GridActionsCellItem
                            icon={<CancelIcon />}
                            label="Cancel"
                            onClick={handleCancelClick(id)}
                            color="inherit"
                            key="cancel"
                        />,
                    ];
                }

                return [
                    <GridActionsCellItem
                        icon={<EditIcon />}
                        label="Edit"
                        onClick={handleEditClick(id)}
                        color="inherit"
                        key="edit"
                    />,
                    <GridActionsCellItem
                        icon={<DeleteOutline className='text-dark' />}
                        label="Delete"
                        color="error"
                        onClick={async () => {
                            const result = await Swal.fire({
                                title: 'Are you sure?',
                                text: "You want to delete this row? This action cannot be undone.",
                                icon: 'warning',
                                showCancelButton: true,
                                confirmButtonColor: '#d33',
                                cancelButtonColor: '#3085d6',
                                confirmButtonText: 'Yes, delete it!',
                                cancelButtonText: 'Cancel'
                            });

                            if (result.isConfirmed) {
                                // Proceed with deletion only if confirmed
                                setRows((prevRows) => prevRows.filter((row) => row.id !== id));

                                Swal.fire({
                                    title: 'Deleted!',
                                    text: 'The row has been removed.',
                                    icon: 'success',
                                    timer: 1500,
                                    showConfirmButton: false
                                });
                            }
                        }}
                        key="delete"
                    />,
                ];
            },
        },
        { field: "RFIDnumber", headerClass: 'agheader', headerName: "RFID", width: 150, editable: true },
        { field: "AssetID", headerClass: 'agheader', headerName: "Asset ID", width: 150, editable: true },
        { field: "Location", headerName: "From Location", width: 150, editable: true },
        { field: "NewLocation", headerName: "To Location", width: 150, editable: true },
        { field: "AssetName", headerClass: 'agheader', headerName: "Asset Name", width: 200, editable: true },
        { field: "Category", headerName: "Category", width: 150, editable: true },
        { field: "SubCategory", headerName: "SubCategory", width: 150, editable: true },
        { field: "departmentname", headerName: "Department", width: 150, editable: true },

    ];


    // MUI data Grid End

    const handleDeleteClick = (id) => async () => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: "You want to delete this row? This action cannot be undone.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete it!',
            cancelButtonText: 'Cancel'
        });

        if (result.isConfirmed) {
            setRows((prevRows) => prevRows.filter((row) => row.id !== id));
            Swal.fire('Deleted!', 'The row has been removed.', 'success');
        }
    };

    // Get Asset Details
    const [Register, setRegister] = useState(

        {
            Category: '', Location: '', RFIDnumber: '', AssetID: '', Activity: '', NewLocation: '', TransferedBy: '', Remarks: '', Movement: '', AssetName: '', branchName: '', SubCategory: ''
        }
    )



    const [select, setselect] = useState({
        RFIDnumber: '',
    });

    const InternalLocationTransfer = async (selected) => {
        console.log("🚀 ~ InternalLocationTransfer ~ selected:", selected)
        if (selected.length === 0) {
            setRegister({
                ...Register,
                Category: '', Location: '', RFIDnumber: '', AssetID: '', Activity: '', TransferedBy: '', Movement: '', AssetName: '', branchName: '', SubCategory: ''
            })
            setID(false)
        }
        if (Register.NewLocation === '') {
            swal({
                icon: "warning",
                title: "Invalid To-Location",
                text: "Please Select To-Location"

            })
            return
        }
        if (selected.length > 0) {
            try {
                const alldata = {
                    RFIDnumber: selected[0].AssetID,
                    mode: 'SED',
                    branchid: auth.branchid,
                    BranchAccess: auth.BranchAccess
                };
                console.log("🚀 ~ InternalLocationTransfer ~ alldata:", alldata)

                const response = await axios.post(`${API_URL}/InternalLocationTransfer`, alldata);
                if (response.status === 200) {

                    const data = response.data[0];  // data = ONE row only
                    console.log("🚀 ~ InternalLocationTransfer ~ data:", data);
                    if (data !== undefined) {

                        if (data.MaintenanceDetails === 'UnderMaintenance') {
                            swal({
                                title: `RFID Already Under Maintenance`,
                                text: `Please Enter Valid RFID number`,
                                icon: 'warning'
                            });
                            return;
                        }
                        if (data.TransferStatus === 'InternalTransfer') {
                            swal({
                                title: `Not Valid`,
                                text: `Internal Transfer is Pending `,
                                icon: 'warning'
                            });
                            return;
                        }
                        if (data.TransferStatus === 'ExternalTransfer') {
                            swal({
                                title: `Not Valid`,
                                text: `External Transfer is Pending `,
                                icon: 'warning'
                            });
                            return;
                        }
                        if (data.TransferStatus === 'ExternallyTransferred') {
                            swal({
                                title: `Asset Not Valid`,
                                text: `Please try Another Asset,This Asset Externally Transferred `,
                                icon: 'warning'
                            });
                            return;
                        }
                        if (data.AllocateStatus === 'Allocated') {
                            swal({
                                title: `Not Valid`,
                                text: `Asset Allocated Please Release and Try `,
                                icon: 'warning'
                            });
                            return;
                        }
                        // -----------------------------
                        // ✔ ADD TO TABLE ROWS
                        // -----------------------------
                        setRows(prevRows => {

                            const alreadyExists = prevRows.some(row => row.AssetID === data.AssetID);

                            if (alreadyExists) {
                                Swal.fire({
                                    icon: 'warning',
                                    title: 'Duplicate Entry',
                                    text: `Asset ${data.AssetID} already added!`
                                });
                                return prevRows;
                            }

                            const newRow = {
                                id: data.AssetID,
                                AssetID: data.AssetID,
                                AssetName: data.AssetName,
                                RFIDnumber: data.RFIDnumber,
                                Category: data.Category,
                                SubCategory: data.SubCategory,
                                departmentname: data.Department,
                                Location: data.LocationCode,
                                NewLocation: Register.NewLocation
                            };

                            return [...prevRows, newRow];
                        });

                        setID(true);
                    } else {
                        Swal.fire({
                            title: 'Internal Transfer Approval is Pending',
                            text: 'Please Try Another Asset',
                            icon: 'error'
                        });
                    }


                }

            } catch (err) {
                Swal.fire({
                    title: 'Error on Calling API',
                    text: 'Please Try Another Asset',
                    icon: 'error'
                });
            }
        }

    }

    // LOCATION DROPDOWN


    const fetchPhysicalLocations = async () => {
        try {
            const alldata = { mode: 'SPL', branchid: auth.branchid, BranchAccess: auth.BranchAccess }
            const response = await axios.post(`${API_URL}/fetchPhysicalLocations`, alldata);
            if (response.status === 200) {
                setPhysicalLocationData(response.data.send);
            }
        } catch (err) {
            console.log(err);
        }
    };



    useEffect(() => {
        const input = document.getElementById('textInput');
        if (input) {
            input.focus();
            input.setSelectionRange(0, 0); // Set cursor position to the start
        }
        fetchDataRFID();
        fetchPhysicalLocations();

    }, []);
    const [RFIDdropdown, setRFIDdropdown] = useState([])
    const fetchDataRFID = async () => {
        try {

            const alldata = { departmentname: auth.departmentname, mode: 'EnrolledAssets', branchid: auth.branchid, BranchAccess: auth.BranchAccess }
            const response = await axios.post(`${API_URL}/InternalLocationTransfer`, alldata)
            setRFIDdropdown(response.data);
        } catch (error) {
            console.error('Error fetching user details:', error);
        }
    };
    // Internal Transfer
    const handlecheckInternalTransfer = async () => {
        // if (Register.NewLocation === '') {
        //     Swal.fire({ title: 'Please select New Location', icon: 'error' });
        //     return;
        // }
        console.log('rows.length', rows.length);
        if (rows.length === 0) {
            swal({
                icon: "warning",
                title: "Not Valid",
                text: "Internal Transfer Assets Not Available"
            })
            return;
        }
        try {
            // 🔥 Create all API calls at once
            const apiCalls = rows.map((data) => {
                const UpdatedData = {
                    ...data,
                    Remarks: Register.Remarks,
                    TransferedBy: auth.empid,
                    mode: 'UT',
                    branchid: auth.branchid
                };
                return axios.post(`${API_URL}/InternalLocationTransfer`, UpdatedData);
            });

            // 🚀 Wait for ALL transfers to finish
            await Promise.all(apiCalls);

            // ✔ After all operations succeed → clear all states
            setRegister({
                Category: '',
                Location: '',
                RFIDnumber: '',
                AssetID: '',
                Activity: '',
                TransferedBy: '',
                Movement: '',
                AssetName: '',
                branchName: '',
                SubCategory: '',
                Remarks: ''
            });

            setselect({ RFIDnumber: '' });
            setRows([]);       // 🔥 clear full table
            setID(false);
            setRFID(false);
            setSelectedRFID(null)

            if (PartRef1.current) PartRef1.current.clear();
            if (PartRef2.current) PartRef2.current.clear();

            // 🎉 FINAL SUCCESS MSG (Only once)
            Swal.fire({
                title: 'All Assets Transferred Successfully',
                icon: 'success',
                confirmButtonText: 'Done'
            });

        } catch (err) {
            console.log(err);

            Swal.fire({
                title: 'Transfer Failed',
                text: 'Some assets could not be transferred',
                icon: 'error'
            });
        }
    };


    const handlePhysicalLocationChange = (LocationCode) => {
        // console.log('e.target.value',e.target.value);

        const selectedLocation = LocationCode;

        setRegister({
            ...Register,
            NewLocation: selectedLocation ? selectedLocation : ''
        });
    };
    return (
        <div className=''>

            <div className="card shadow-lg border-0 rounded-3 p-4">

                <div className="card-header pro-header p-1">
                    <div className="d-flex justify-content-center align-items-center">
                        {/* Center Title */}
                        <div className="text-center" >
                            <h3 className="text-white m-0">
                                <i className="bi bi-pin-map fs-4 text-primary ms-2"></i>  Internal Location Transfer
                            </h3>
                        </div>


                    </div>
                </div>

                <div className="card-body mt-3">
                    {/* First Row */}
                    <div className="row g-3">

                        <div className="col-lg-4">
                            <label className="form-label fw-semibold">To Location <span style={{ color: "red" }}>*</span></label>

                            <Typeahead
                                id="typeahead-location"
                                labelKey="LocationCode"
                                options={physicalLocationData}
                                placeholder="Select Location"
                                selected={
                                    Register.NewLocation
                                        ? physicalLocationData.filter(
                                            (loc) => loc.LocationCode === Register.NewLocation
                                        )
                                        : []
                                }
                                onChange={(selected) => {
                                    if (selected.length > 0) {
                                        console.log('selected[0].LocationCode', selected[0].LocationCode);

                                        handlePhysicalLocationChange(selected[0].LocationCode);
                                    } else {
                                        handlePhysicalLocationChange("");
                                    }
                                }}
                                clearButton
                            />
                        </div>

                        <div className="col-lg-4">
                            <label className="form-label fw-semibold">RFID Number <span style={{ color: "red" }}>*</span></label>
                            {RFID ? (
                                <input
                                    className="form-control"
                                    maxLength="24"
                                    value={Register.RFIDnumber}
                                    disabled
                                />
                            ) : (
                                <Typeahead
                                    id="rfid-typeahead"
                                    ref={PartRef1}
                                    labelKey={(option) => `${option.RFIDnumber} / ${option.AssetID}`}
                                    options={RFIDdropdown}
                                    placeholder="Select RFID"
                                    className="w-100"
                                    selected={selectedRFID}        // ← strongly recommended
                                    onChange={(selected) => {
                                        setSelectedRFID(selected); // store selected item

                                        if (selected.length > 0) {
                                            // call only when user actually selects from dropdown
                                            InternalLocationTransfer(selected);
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

                                                InternalLocationTransfer(selected);

                                            }
                                        }
                                    }}
                                    clearButton
                                />

                            )}
                        </div>

                        <div className="col-lg-4">
                            <h6 className="form-label fw-semibold mt-1">Remarks <span style={{ color: "red" }}>*</span></h6>
                            <input
                                // rows="3"
                                className="form-control"
                                placeholder='Please Enter Remark'
                                onChange={(e) =>
                                    setRegister({ ...Register, Remarks: e.target.value })
                                }
                                value={Register.Remarks}
                            ></input>
                        </div>

                        <div
                            className="ag-theme-quartz mt-2"
                            style={{
                                height: 400,
                                width: "100%",
                            }}
                        >                <DataGrid className="ag-theme-quartz mt-4"

                            rows={rows}
                            columns={columns}
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

                        {/* Button */}
                        <div className="text-center mt-5">
                            <button
                                className="btn btn-success  rounded-pill  btn-hover-effect"
                                onClick={handlecheckInternalTransfer}
                            >
                                <i className="bi bi-check-circle me-2"></i>Transferred Internaly
                            </button>
                        </div>

                    </div>

                </div>
            </div>


        </div>
    )
}

InternalTransfer.propTypes = {
    auth: PropTypes.any.isRequired,
};

export default InternalTransfer
