import React, { useState, useEffect, useRef } from 'react'
import Swal from 'sweetalert2'
import axios from 'axios'
import PropTypes from 'prop-types';
import { Typeahead } from 'react-bootstrap-typeahead';
import { getConfig } from 'src/config';
import { AgGridReact } from 'ag-grid-react';
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import { CBadge, CNav, CNavItem, CNavLink, CTabContent, CTabPane } from '@coreui/react';
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
import "react-bootstrap-typeahead/css/Typeahead.css";
import EditIcon from '@mui/icons-material/Edit';
import { DeleteOutline } from '@mui/icons-material';


const ExternalTransfer = ({ auth }) => {
    // const { auth } = useContext(AuthContext)
    const PartRef1 = useRef(null)
    const PartRef2 = useRef(null)
    const API_URL = getConfig().REACT_APP_API_URL;
    const [RFID, setRFID] = useState(false)
    const [ID, setID] = useState(false)
    const [LocationDropDownData, SetLocationDropDownData] = useState([])
    const [ExternalTransferData, setExternalTransferData] = useState([]);
    const printRef = useRef();
    const [activeKey, setActiveKey] = useState(1);
    const [selectedRFID, setSelectedRFID] = useState(null);

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
        { field: "RFIDnumber", headerClass: 'agheader', headerName: "RFID", width: 150 },
        { field: "AssetID", headerClass: 'agheader', headerName: "Asset ID", width: 150 },
        { field: "AssetName", headerClass: 'agheader', headerName: "Asset Name", width: 200 },
        { field: "Category", headerClass: 'agheader', headerName: "Asset Name", width: 200 },
        { field: "SubCategory", headerClass: 'agheader', headerName: "Asset Name", width: 200 },
        { field: "AssetCost", headerName: "AssetCost", editable: true, width: 150 },

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


    const [printData, setPrintData] = useState(null);
    const handlePrintClick = async (data) => {
        try {
            const alldata = { mode: 'HandlePrint', branchid: auth.branchid, BranchAccess: auth.BranchAccess, Transferredbranchid: '', Receivedbranchid: '', TransferedBy: '', departmentname: auth.departmentname, AssetID: data.AssetID, RFIDnumber: data.RFIDnumber }
            const response = await axios.post(`${API_URL}/ExternalLocationTransfer`, alldata);
            if (response.status === 200 && response.data) {
                const printContent = Array.isArray(response.data) ? response.data : [response.data];
                setPrintData(printContent);
                setTimeout(() => {
                    handlePrint(); // print after DOM updates
                }, 100);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handlePrint = () => {
        const printContent = printRef.current;
        const printWindow = window.open("", "", "width=800,height=600");
        printWindow.document.write(`
      <html>
        <head>
          <title>Print</title>
          <style>
            @media print {
              @page { size: A4 portrait; margin: 10mm; }
              body { margin: 0; padding: 0; }
              .print-container {
                width: 210mm;
                height: 297mm;
                overflow: hidden;
                box-sizing: border-box;
                page-break-inside: avoid;
              }
              .print-scale {
                transform: scale(0.9);
                transform-origin: top left;
              }
            }
          </style>
        </head>
        <body>
          <div class="print-container print-scale">${printContent.innerHTML}</div>
        </body>
      </html>
    `);
        printWindow.document.close();
        printWindow.print();
    };

    // Get Asset Details
    const [Register, setRegister] = useState(
        {
            TransferredBranchName: '', Transferredbranchid: auth.branchid, ReceivedBranchName: '',
            Receivedbranchid: '', Remarks: '', TransferCost: 0, TransferedBy: '', DCNo: ''
        }
    )



    const [select, setselect] = useState({
        RFIDnumber: '',
    });

    const ExternalLocationTransfer = async (selected) => {
        if (selected.length > 0) {
            try {
                const alldata = { AssetID: selected[0].AssetID, mode: 'SED', branchid: auth.branchid, BranchAccess: auth.BranchAccess, Transferredbranchid: '', Receivedbranchid: '', TransferedBy: '', departmentname: auth.departmentname }
                const response = await axios.post(`${API_URL}/ExternalLocationTransfer`, alldata)
                const data = response.data[0];
                console.log("🚀 ~ ExternalLocationTransfer ~ data:", data)
                if (response.status === 200) {
                    if (data.RFID === 'In-Active') {
                        swal({
                            title: 'In-Active Asset',
                            text: 'Please Try Inside Asset',
                            icon: 'warning',
                        })
                        return;
                    }
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

                    const { branchName, branchid, AssetID } = data

                    setRegister({
                        ...Register,
                        TransferredBranchName: branchName, Transferredbranchid: branchid,
                        AssetID: AssetID,
                    })
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
                            RFIDnumber: data.RFIDnumber || '-',
                            AssetCost: data.DepreciationAmount,
                            Category: data.Category,
                            SubCategory: data.SubCategory
                        };

                        return [...prevRows, newRow];
                    });
                    setID(true);

                }

            } catch (err) {
                Swal.fire({
                    title: 'External Transfer Approval for This Asset is Still Pending',
                    text: 'Please Try Another Asset',
                    icon: 'error'
                })
            }
        }
    }

    // LOCATION DROPDOWN

    const FetchLocationDropdown = async () => {
        try {
            const alldata = { mode: 'getBranch', branchid: auth.branchid }
            const response = await axios.post(`${API_URL}/fetchLocation`, alldata);
            if (response.status === 200) {
                SetLocationDropDownData(response.data.send);

            }
        } catch (err) {
            console.log(err);
        }
    };
    // Filter out the current user's branch
    const filteredLocationList = LocationDropDownData.filter(
        (b) => b.branchid !== auth.branchid
    );


    const handleBranchChange = (e) => {
        const selectedBranch = e.target.value;
        if (selectedBranch === "selectbranch") {
            swal({
                title: 'Please select Branch ',
                icon: 'warning'
            }).then(() => {
                setRegister({ ...Register, ReceivedBranchName: '', Receivedbranchid: '' });
            })
            return;
        } else {
            const selectedOption = LocationDropDownData.find(option => option.branchName === selectedBranch);
            setRegister({ ...Register, ReceivedBranchName: selectedBranch, Receivedbranchid: selectedOption.branchid });
        }


    };

    const FetchExternalTransferredAssets = async () => {
        try {
            const alldata = { mode: 'ExternalTransferdata', branchid: auth.branchid, BranchAccess: auth.BranchAccess, Transferredbranchid: '', Receivedbranchid: '', TransferedBy: '', departmentname: auth.departmentname }
            const response = await axios.post(`${API_URL}/ExternalLocationTransfer`, alldata)
            if (response.status === 200) {
                setExternalTransferData(response.data);

            }
        } catch (err) {
            console.log(err);
        }
    };

    // AG GRID
    const columnDefs = [
        { field: "AssetID", headerName: "Asset ID", sortable: true, filter: true },
        { field: "AssetName", headerName: "Asset Name", sortable: true, filter: true },
        // { field: "TransferCost", headerName: "Asset Cost", sortable: true, filter: true },
        // { field: "PaidAmount", headerName: "Paid Amount", sortable: true, filter: true },
        // { field: "BalanceAmount", headerName: "Balance", sortable: true, filter: true },
        { field: "Approval", headerName: "Approval Status", sortable: true, filter: true },
        { field: "PaymentStatus", headerName: "Payment Status", sortable: true, filter: true },
        { field: "ReceivedBranchName", headerName: "Received Branch", sortable: true, filter: true },
        { field: "TransferredBranchName", headerName: "Transferred Branch", sortable: true, filter: true },
        { field: "Remarks", headerName: "Remarks", sortable: true, filter: true },
        {
            field: "Print",
            headerName: "Print",
            sortable: false,
            filter: false,
            cellRenderer: (params) => {
                return (
                    <button
                        className="btn btn-sm btn-success"
                        onClick={() => handlePrintClick(params.data)}
                        disabled={params.data.PaymentStatus === "Closed"}
                    >
                        Print
                    </button>
                );
            },
        },
    ];


    const defaultColDef = {
        resizable: true,
        filter: true,
        sortable: true,
        floatingFilter: true,
    };

    useEffect(() => {
        const input = document.getElementById('textInput');
        if (input) {
            input.focus();
            input.setSelectionRange(0, 0); // Set cursor position to the start
        }
        FetchLocationDropdown();
        fetchDataRFID();
        FetchExternalTransferredAssets();
        FetchDCNo();
    }, []);



    const FetchDCNo = async () => {
        try {
            const alldata = { departmentname: auth.departmentname, mode: 'DCNo', branchid: auth.branchid, BranchAccess: auth.BranchAccess, Transferredbranchid: '', Receivedbranchid: '', TransferedBy: '' }
            const response = await axios.post(`${API_URL}/ExternalLocationTransfer`, alldata);
            if (response.status === 200) {
                const { PrefixSuffix } = response.data[0];
                setRegister(prevState => ({
                    ...prevState,
                    DCNo: PrefixSuffix
                }))
            }
        } catch (err) {
            console.log(err);
        }

    }
    const [RFIDdropdown, setRFIDdropdown] = useState([])
    const fetchDataRFID = async () => {
        try {
            const alldata = { departmentname: auth.departmentname, mode: 'EnrolledAssets', branchid: auth.branchid, BranchAccess: auth.BranchAccess, Transferredbranchid: '', Receivedbranchid: '', TransferedBy: '' }
            const response = await axios.post(`${API_URL}/ExternalLocationTransfer`, alldata);
            setRFIDdropdown(response.data);
        } catch (error) {
            console.error('Error fetching user details:', error);
        }
    };
    // Internal Transfer
    const handlecheckExternalTransfer = async () => {
        if (Register.ReceivedBranchName === '') {
            Swal.fire({
                title: 'Please select Branch ',
                icon: 'error'
            })
            return
        }


        try {

            const apiCalls = rows.map((data) => {
                const UpdatedData = {
                    ...data,
                    ...Register,
                    TransferedBy: auth.empid,
                    mode: 'UT',
                    branchid: auth.branchid
                };
                console.log("🚀 ~ handlecheckExternalTransfer ~ UpdatedData:", UpdatedData)
                return axios.post(`${API_URL}/ExternalLocationTransfer`, UpdatedData);
            });
            await Promise.all(apiCalls);

            setRegister({
                ...Register,
                TransferredBranchName: '', Transferredbranchid: '', ReceivedBranchName: '', Receivedbranchid: '', Remarks: '', TransferCost: '', TransferedBy: ''
            })

            setselect({
                RFIDnumber: ''
            })

            setRows([]);

            Swal.fire({
                title: 'Transferred Successfully',
                icon: 'success',
                confirmButtonText: 'Done'
            })

            if (PartRef1.current) {
                PartRef1.current.clear()
            }

            if (PartRef2.current) {
                PartRef2.current.clear()
            }

            setID(false);
            setRFID(false);
            FetchExternalTransferredAssets();

        } catch (err) {
            console.log(err)
        }

    }
    const ExternalTransferCount = ExternalTransferData.length;

    return (
        <div className=''>
            <CNav variant="pills" role="tablist" className='mb-3'>
                <CNavItem>
                    <CNavLink active={activeKey === 1} onClick={() => setActiveKey(1)} className='border border-2 me-2'>
                        External Transfer
                    </CNavLink>
                </CNavItem>
                <CNavItem>
                    <CNavLink active={activeKey === 2} onClick={() => setActiveKey(2)}
                        className='border border-2 me-2'>
                        External Transfer DC
                        <CBadge color="danger" className="ms-2">
                            {ExternalTransferCount}  {/* <- count value */}
                        </CBadge>
                    </CNavLink>
                </CNavItem>
            </CNav>
            <CTabContent>
                <CTabPane role="tabpanel" aria-labelledby="home-tab" visible={activeKey === 1}>
                    <div className="card shadow border-0 rounded-4">
                        {/* Header */}
                        <div className="card-header pro-header p-1">
                            <div className="d-flex justify-content-center align-items-center">
                                {/* Center Title */}
                                <div className="text-center" >
                                    <h3 className="text-white m-0">
                                        <i className="bi bi-pin-map-fill me-2"></i>
                                        External Location Transfer
                                    </h3>
                                </div>
                            </div>
                        </div>

                        {/* <div className="card-header bg-white border-0 py-3 px-4 d-flex justify-content-between align-items-center rounded-top-4">
                            <h4 className="fw-bold mb-0 text-primary d-flex align-items-center">
                                <i className="bi bi-pin-map-fill me-2"></i>
                                External Location Transfer
                            </h4>
                        </div> */}

                        {/* Body */}
                        <div className="card-body px-4 py-4 ">

                            {/* First Row */}
                            <div className="row g-4">

                                {/* Branch */}
                                <div className="col-lg-4">
                                    <label className="form-label fw-semibold">Select Branch <span style={{ color: "red" }}>*</span></label>
                                    <select
                                        className="form-select shadow-sm"
                                        onChange={handleBranchChange}
                                        value={Register.NewBranch}
                                    >
                                        <option value="selectbranch">Select Branch</option>
                                        {filteredLocationList.map((option) => (
                                            <option key={option.branchid} value={option.branchName}>
                                                {option.branchName}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* RFID */}
                                <div className="col-lg-4 col-md-6">
                                    <label className="form-label fw-semibold">RFID Number <span style={{ color: "red" }}>*</span></label>
                                    {RFID ? (
                                        <input
                                            className="form-control shadow-sm"
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
                                                    ExternalLocationTransfer(selected);
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

                                                        ExternalLocationTransfer(selected);

                                                    }
                                                }
                                            }}


                                            clearButton
                                        />
                                    )}
                                </div>

                                {/* Cost */}
                                {/* <div className="col-lg-4 col-md-6">
                                    <label className="form-label fw-semibold">Transfer Cost</label>
                                    <input
                                        className="form-control shadow-sm"
                                        placeholder="Enter transfer cost"
                                        value={Register.TransferCost}
                                        onChange={(e) => setRegister({ ...Register, TransferCost: e.target.value })}
                                        disabled
                                    />
                                </div> */}

                                {/* Remarks */}
                                <div className="col-lg-4 col-md-6 ">
                                    <label className="form-label fw-semibold">Remarks</label>
                                    <input
                                        className="form-control shadow-sm"
                                        onChange={(e) => setRegister({ ...Register, Remarks: e.target.value })}
                                        value={Register.Remarks}
                                        placeholder="Enter remarks"
                                    />
                                </div>
                            </div>

                            {/* Table */}
                            <div className="ag-theme-quartz mt-4"
                                style={{ height: 420, width: "100%" }}
                            >
                                <DataGrid
                                    className="ag-theme-quartz"
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
                                            backgroundColor: '#f1f3f5',
                                            fontWeight: 'bold',
                                            fontSize: "15px",
                                        },
                                        '& .MuiDataGrid-cell': {
                                            borderBottom: '1px solid #e9ecef',
                                        },
                                        '& .MuiTablePagination-root': {
                                            backgroundColor: '#fafafa',
                                        },
                                    }}
                                />
                            </div>

                            {/* Action Button */}
                            <div className="text-center mt-4">
                                <button
                                    className="btn btn-success px-5 py-2 rounded-pill shadow-sm fw-semibold"
                                    style={{ fontSize: "1.05rem" }}
                                    onClick={handlecheckExternalTransfer}
                                >
                                    <i className="bi bi-check2-circle me-2"></i>
                                    Transfer Externally
                                </button>
                            </div>
                        </div>
                    </div>

                </CTabPane>
                <CTabPane role="tabpanel" aria-labelledby="profile-tab" visible={activeKey === 2}>

                    <div className='card'>
                        <div className="card-header pro-header p-1">
                            <div className="d-flex justify-content-center align-items-center">
                                {/* Center Title */}
                                <div className="text-center" >
                                    <h3 className="text-white m-0">
                                        <i className="bi bi-pin-map-fill me-2"></i>
                                        External Transfer Details & DC print
                                    </h3>
                                </div>
                            </div>
                        </div>

                        <div className="ag-theme-quartz" style={{ height: 500, width: "100%" }}>
                            <AgGridReact
                                rowData={ExternalTransferData}
                                columnDefs={columnDefs}
                                defaultColDef={defaultColDef}
                                rowSelection="multiple"
                                pagination={true}
                                paginationPageSize={10}
                            />
                        </div>

                    </div>

                </CTabPane>
            </CTabContent>
            {/* Hidden print container */}
            {printData && (
                <div
                    ref={printRef}
                    style={{
                        position: "absolute",
                        left: "-10000px", // Offscreen for printing
                        top: 0,
                        width: "210mm", // A4 width
                        fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
                        fontSize: "10pt",
                        color: "#000",
                        backgroundColor: "#fff",
                        lineHeight: "1.4",
                    }}
                >
                    {printData.map((dataItem, pageIndex) => (
                        <div
                            key={pageIndex}
                            style={{
                                width: "210mm",
                                height: "210mm", // A4 height
                                padding: "15mm 15mm 10mm 15mm",
                                boxSizing: "border-box",
                                border: "0.5mm solid #000",
                                pageBreakAfter: "always",
                                display: "flex",
                                flexDirection: "column",
                                justifyContent: "space-between",
                            }}
                        >
                            {/* Header */}
                            <div>
                                <h2
                                    style={{
                                        textAlign: "center",
                                        fontSize: "14pt",
                                        fontWeight: "bold",
                                        margin: "0 0 10mm",
                                        textTransform: "uppercase",
                                        borderBottom: "1px solid #000",
                                        paddingBottom: "5mm",
                                    }}
                                >
                                    Delivery Challan for Transfer Asset
                                </h2>
                                <div
                                    style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        fontSize: "9pt",
                                        marginBottom: "8mm",
                                    }}
                                >
                                    <div>
                                        <p style={{ margin: "2px 0" }}><strong>GST IN:</strong> {dataItem.CompanyGst}</p>
                                        <p style={{ margin: "2px 0" }}><strong>DC No:</strong> {dataItem.DCNo}</p>
                                        <p style={{ margin: "2px 0" }}>
                                            <strong>Date:</strong>{" "}
                                            {new Date().toLocaleDateString("en-GB", {
                                                day: "2-digit",
                                                month: "short",
                                                year: "numeric",
                                            })}
                                        </p>
                                    </div>
                                    <div style={{ textAlign: "right" }}>
                                        <p style={{ margin: "2px 0", fontWeight: "bold" }}>
                                            Total: {dataItem.TransferCost}
                                        </p>
                                    </div>
                                </div>

                                {/* Addresses */}
                                <div
                                    style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        marginBottom: "8mm",
                                        fontSize: "9pt",
                                    }}
                                >
                                    <div style={{ width: "48%" }}>
                                        <h4 style={{ fontSize: "10pt", margin: "0 0 3mm", fontWeight: "bold" }}>
                                            Branch Address
                                        </h4>
                                        <p style={{ margin: "0" }}>
                                            {dataItem.TransferredBranchName}<br />
                                            {dataItem.CompanyAdr}, {dataItem.CompanyCity}, {dataItem.CompanyState} - {dataItem.CompanyPostal}<br />
                                            <strong>Phone:</strong> {dataItem.CompanyCN}<br />
                                            <strong>GST:</strong> {dataItem.CompanyGst}
                                        </p>
                                    </div>
                                    <div style={{ width: "48%", textAlign: "right" }}>
                                        <h4 style={{ fontSize: "10pt", margin: "0 0 3mm", fontWeight: "bold" }}>
                                            Receiver Address
                                        </h4>
                                        <p style={{ margin: "0" }}>
                                            {dataItem.ReceivedBranchName}<br />
                                            {dataItem.ReceiverAdr}, {dataItem.ReceiverCity}, {dataItem.ReceiverState} - {dataItem.ReceiverPostal}<br />
                                            <strong>Phone:</strong> {dataItem.ReceiverCN}<br />
                                            <strong>GST:</strong> {dataItem.ReceiverGst}
                                        </p>
                                    </div>
                                </div>

                                {/* Asset Table */}
                                <table
                                    style={{
                                        width: "100%",
                                        borderCollapse: "collapse",
                                        marginBottom: "8mm",
                                        fontSize: "9pt",
                                    }}
                                >
                                    <thead>
                                        <tr style={{ backgroundColor: "#e6e6e6", textAlign: "left" }}>
                                            <th style={{ border: "0.5mm solid #000", padding: "5px", fontWeight: "bold" }}>
                                                Sl No.
                                            </th>
                                            <th style={{ border: "0.5mm solid #000", padding: "5px", fontWeight: "bold" }}>
                                                Asset ID
                                            </th>
                                            <th style={{ border: "0.5mm solid #000", padding: "5px", fontWeight: "bold" }}>
                                                Asset Name
                                            </th>
                                            <th style={{ border: "0.5mm solid #000", padding: "5px", fontWeight: "bold" }}>
                                                Asset Cost
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td style={{ border: "0.5mm solid #000", padding: "5px" }}>1</td>
                                            <td style={{ border: "0.5mm solid #000", padding: "5px" }}>
                                                {dataItem.AssetID}
                                            </td>
                                            <td style={{ border: "0.5mm solid #000", padding: "5px" }}>
                                                {dataItem.AssetName}
                                            </td>
                                            <td style={{ border: "0.5mm solid #000", padding: "5px" }}>
                                                {dataItem.AssetCost}
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                            {/* Signatures and Footer */}
                            <div>
                                {/* Signatures */}
                                <div
                                    style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        marginBottom: "10mm",
                                        fontSize: "9pt",
                                    }}
                                >
                                    <div>
                                        <p style={{ margin: "0", fontWeight: "bold" }}>Receiver's Signature:</p>
                                        <div
                                            style={{
                                                borderBottom: "0.5mm solid #000",
                                                width: "30mm",
                                                marginTop: "15mm",
                                            }}
                                        ></div>
                                    </div>
                                    <div style={{ textAlign: "right" }}>
                                        <p style={{ margin: "0", fontWeight: "bold" }}>Transfer Cost: {dataItem.TransferCost}</p>
                                        <p style={{ margin: "0", fontWeight: "bold" }}>Authorized By:</p>
                                        <div
                                            style={{
                                                borderBottom: "0.5mm solid #000",
                                                width: "30mm",
                                                marginTop: "15mm",
                                            }}
                                        ></div>
                                    </div>
                                </div>

                                {/* Footer */}
                                <div style={{ textAlign: "center", fontSize: "8pt", color: "#333" }}>
                                    <p style={{ margin: "0", fontWeight: "bold", textTransform: "uppercase" }}>
                                        Not for Sale - For Further Process and Return
                                    </p>
                                    <p style={{ margin: "5mm 0 0", fontWeight: "bold" }}>
                                        For {dataItem.TransferredBranchName}
                                    </p>
                                    <p style={{ margin: "5mm 0 0", fontWeight: "bold" }}>
                                        Authorized Signatory
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

ExternalTransfer.propTypes = {
    auth: PropTypes.any.isRequired,
};

export default ExternalTransfer
