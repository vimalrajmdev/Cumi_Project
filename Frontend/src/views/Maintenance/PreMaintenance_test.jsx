import React, { useState, useEffect, useRef } from 'react';
import Swal from 'sweetalert2';
import { AgGridReact } from 'ag-grid-react';
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
import { Box, TextField } from "@mui/material";
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/DeleteOutlined';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Close';
import { getConfig } from 'src/config';
import Select from "react-select";
import { BallTriangle } from 'react-loader-spinner';
import { Card, CardHeader } from 'react-bootstrap';
import "react-bootstrap-typeahead/css/Typeahead.css";

import { CBadge, CNav, CNavItem, CNavLink, CTabContent, CTabPane } from '@coreui/react';
import { DeleteForever, DeleteForeverSharp, DeleteOutline } from '@mui/icons-material';
import secureLocalStorage from 'react-secure-storage';
const PreMaintenance_test = ({ auth }) => {
    const [select, setSelect] = useState({
        RFIDnumber: '', AssetID: ''
    });
    const [activeKey, setActiveKey] = useState(1);
    const [loading, setLoading] = useState(false);
    const [selectedVendor, setselectedVendor] = useState(null)
    const [MinDueDate, setMinDueDate] = useState('');
    const [MaintenanceData, setMaintenanceData] = useState([]);
    const printRef = useRef();
    const [printData, setPrintData] = useState(null);
    const underMaintenanceCount = MaintenanceData.length;
    const handlePrintClick = async (data) => {
        try {
            const alldata = { mode: 'Print', AssetID: data.AssetID, RFIDnumber: data.RFIDnumber, DCNo: data.DCNo, branchid: auth.branchid, DueDate: '', id: '', VendorID: data.Vendors };
            const response = await axios.post(`${API_URL}/PrintMaintenanceAsset`, alldata);
            if (response.status === 200 && response.data) {
                setPrintData(response.data);
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
        AssetID: '', VendorID: '', InspectedBy: '', Condition: '', Defect: '', MaintenanceDetails: '', id: '', MaintenanceType: '', MaintenanceRegDate: '', ScrapRegDate: '', Status: '', RFIDnumber: '', Movement: '', RegisteredBy: '', DCNo: ''
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
        console.log('processRowUpdate called with newRow:', newRow);
        console.log('Current rows state:', rows);
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
        console.log('Updated rows:', updatedRows);
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
        { field: "AssetID", headerName: "Asset ID", width: 150 },
        { field: "AssetName", headerName: "Asset Name", width: 200 },
        { field: "RFIDnumber", headerName: "RFID", width: 150 },
        { field: "Description", headerName: "Description", width: 150 },
        { field: "Remarks", headerName: "Remarks", editable: true, width: 200 },
        {
            field: "DueDate",
            headerName: "Due Date",
            editable: true,
            width: 180,
            type: 'date',
        },

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

    // const { auth } = useContext(AuthContext)
    const [show, setShow] = useState(true);
    // console.log("auth", auth)
    const [selectedOption, setSelectedOption] = useState(''); // State to manage selected option

    // Function to handle select change
    const handleSelectChange = (event) => {
        const value = event.target.value;
        // console.log('Selected value:', value);
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




    const handleEnterforMP = async (selected) => {
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
            setID(false);
            return;
        }

        if (selected.length > 0) {
            try {
                const alldata = {
                    mode: 'SM',
                    RFIDnumber: selected[0].RFIDnumber,
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

                const {
                    AssetID, AssetName, RFIDnumber, Description, id
                } = data;

                // ✅ Prevent duplicate row insertion
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
                setID(true);

            } catch (err) {
                Swal.fire({
                    title: `RFID Number is Not Valid`,
                    text: `Please Enter Valid RFID number`,
                    icon: 'warning'
                });
                console.error("Error On sending RFID", err);
            }
        }
    };

    const handleEnterforMP1 = async (selected) => {

        // console.log(selected.length)
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
                console.log("🚀 ~ handleEnterforMP1 ~ data:", data)

                if (!data) {
                    Swal.fire({
                        title: `RFID Not Found`,
                        text: `Please Enter Valid RFID number`,
                        icon: 'warning'
                    });
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
                const {
                    AssetID, AssetName, RFIDnumber, Description, id
                } = data;

                // ✅ Prevent duplicate row insertion
                setRows((prevRows) => {
                    if (prevRows.some((row) => row.AssetID === AssetID)) {
                        Swal.fire({
                            icon: 'warning',
                            title: 'Duplicate Entry',
                            text: `Asset with ID ${AssetID} already exists!`,
                            confirmButtonText: 'OK',
                            confirmButtonColor: '#3085d6',
                        });
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

    // Update Maitenance Register 
    const handlecheck = async (e) => {
        if (auth.branchid === "0" || auth.branchid === 0) {
            Swal.fire({
                icon: 'warning',
                title: 'Invalid Selection',
                text: "Please select a specific branch. 'ALL' is not allowed.",
            });
            return;
        }
        if (Register.RFIDnumber === '') {
            Swal.fire({
                title: 'Please Enter RFID Number',
                icon: 'error'
            })
            return
        }
        if (Register.VendorID === '') {
            Swal.fire({
                title: 'Please Enter VendorID',
                icon: 'error'
            })
            return
        }
        if (Register.MaintenanceType === '') {
            Swal.fire({
                title: 'Please select Maintenance Type',
                icon: 'error'
            })
            return
        }
        for (const data of rows) {
            if (!data.DueDate || isNaN(new Date(data.DueDate).getTime())) {
                Swal.fire({
                    title: 'Please select a valid Due Date',
                    icon: 'error'
                });
                return;
            }
        }
        FetchDCNo();


        try {
            setLoading(true);
            for (const data of rows) {
                if (data.DueDate === 'null') {
                    Swal.fire({
                        title: 'Please select Due Date',
                        icon: 'error'
                    })
                    return
                }
                const formatDate = (date) => {
                    if (!date) return null;
                    const d = new Date(date);
                    // Format as YYYY-MM-DD in local time
                    const year = d.getFullYear();
                    const month = String(d.getMonth() + 1).padStart(2, "0");
                    const day = String(d.getDate()).padStart(2, "0");

                    return `${year}-${month}-${day}`;
                };
                const alldata = {
                    ...data,
                    ...Register, MaintenanceDetails: 'UnderMaintenance', Activity: 'In-Active', Status: 'UnderMaintenance', RegisteredBy: auth.empid, mode: 'UM', Movement: 'UnderMaintenance', branchid: auth.branchid, DueDate: formatDate(data?.DueDate)
                };
                const response = await axios.post(`${API_URL}/UpdateMaintenanceReg`, alldata)
                if (response.status === 200) {
                    setLoading(false);
                    Swal.fire({
                        title: 'Saved Successfully',
                        text: '',
                        icon: 'success',
                        confirmButtonText: 'Done'
                    }).then(() => {
                        FetchMaintenanceAssets();
                        setID(false);
                        setRows([]); // Clear the rows after processing
                        setRFID(false);
                        setSelect({
                            RFIDnumber: '', AssetID: ''
                        });
                        setRegister({ ...Register, VendorID: '', MaintenanceType: '' });
                        setselectedVendor(null);
                        FetchDCNo();

                        if (PartRef1.current) {
                            PartRef1.current.clear()
                        }
                        if (PartRef2.current) {
                            PartRef2.current.clear()
                        }
                    });
                    setRegister(
                        {
                            ...Register,
                            AssetID: '', AssetName: '', id: '', MaintenanceDetails: '', MaintenanceType: '', MaintenanceRegDate: '', ScrapRegDate: '',
                            Status: '', Activity: '', VendorID: '', Description: '', Category: '',
                            SubCategory: '', branchName: '', Location: '', Remarks: '', Department: '', RFIDnumber: '',
                            DueDate: MinDueDate
                        }
                    )


                }
            }

        } catch (err) {
            console.log("Error on Update Maintenance Register", err);
            setLoading(false);
        }

    }
    // 
    const inputRef = useRef(null);


    //   USER Dropdown
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
            console.log('response.data.send', response.data.send);

        } catch (error) {
            console.error('Error fetching user details:', error);
        }
    };
    useEffect(() => {

        if (inputRef.current) {
            inputRef.current.focus();
            inputRef.current.setSelectionRange(0, 0); // Set cursor position to the start
        }
        const date = new Date().toISOString().split('T')[0];
        setMinDueDate(date);
        FetchMaintenanceType();
        fetchData();
        fetchVendorData();
        FetchDCNo();
        FetchMaintenanceAssets();

    }, []);

    const FetchMaintenanceAssets = async () => {
        try {
            const response = await axios.post(`${API_URL}/fetchMaintenance`, { branchid: auth.branchid, mode: 'PendingMaintenance' });
            if (response.status === 200) {
                setMaintenanceData(response.data.send);


            }
        } catch (err) {
            console.log(err);
        }
    };

    // AG GRID
    const columnDefs = [
        { field: "AssetID", headerClass: 'agheader', headerName: "Asset ID", sortable: true, filter: true },
        { field: "RFIDnumber", headerClass: 'agheader', headerName: "RFID No", sortable: true, filter: true },
        { field: "AssetName", headerClass: 'agheader', headerName: "Asset Name", sortable: true, filter: true },
        { field: "DCNo", headerClass: 'agheader', headerName: "DC No", sortable: true, filter: true },
        {
            headerName: "Due Date", headerClass: 'agheader', field: "DueDate",
            valueGetter: (params) => {
                const date = params.data.DueDate;
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
        // { field: "DueDate", headerClass: 'agheader', headerName: "Due Date", sortable: true, filter: true },
        { field: "RegisteredBy", headerClass: 'agheader', headerName: "Created By", sortable: true, filter: true },
        { field: "MaintenanceType", headerClass: 'agheader', headerName: "Maintenance Type", sortable: true, filter: true },
        { field: "VendorName", headerClass: 'agheader', headerName: "Vendor Name", sortable: true, filter: true },
        { field: "Description", headerClass: 'agheader', headerName: "Remarks", sortable: true, filter: true },
        {
            field: "Print",
            headerName: "Print", headerClass: 'agheader',
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

    const FetchDCNo = async () => {
        try {
            const alldata = {
                mode: 'DCNo',
                branchid: auth.branchid
            };

            const response = await axios.post(`${API_URL}/PendingAssetMaintenanceSearch`, alldata);
            if (response.status === 200) {

                const { PrefixSuffix } = response.data[0];
                console.log("🚀 ~ FetchDCNo ~ PrefixSuffix:", PrefixSuffix)

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
    const fetchData = async () => {
        try {
            const alldata = { departmentname: auth.departmentname, mode: 'EnrolledAssets', branchid: auth.branchid, BranchAccess: auth.BranchAccess }
            // console.log(alldata)
            const response = await axios.post(`${API_URL}/EnrolledAssetInfo`, alldata);
            setRFIDdropdown(response.data.send);
            // console.log(response.data.send)
        } catch (error) {
            console.error('Error fetching user details:', error);
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
            <CNav variant="pills" role="tablist" className='mb-2'>
                <CNavItem className='me-2'>
                    <CNavLink active={activeKey === 1} onClick={() => setActiveKey(1)} className='border border-2 fw-bold' >
                        Maintenance Register
                    </CNavLink>
                </CNavItem>
                <CNavItem>
                    <CNavLink active={activeKey === 2} onClick={() => setActiveKey(2)} className='border border-2 fw-bold'  >
                        Under Maintenance Details
                        <CBadge color="danger" className="ms-2">
                            {underMaintenanceCount}  {/* <- count value */}
                        </CBadge>
                    </CNavLink>
                </CNavItem>
            </CNav>
            <CTabContent>

                <CTabPane role="tabpanel" aria-labelledby="home-tab" visible={activeKey === 1}>
                    <Card>
                        <div className="card-header pro-header p-1">
                            <div className="d-flex justify-content-center align-items-center">
                                {/* Center Title */}
                                <div className="text-center" >
                                    <h3 className="text-white m-0">
                                        <i className="bi bi-gear ms-1 fs-4"></i> Maintenance Register
                                    </h3>
                                </div>
                            </div>
                        </div>
                        {/* <CardHeader className='pro-header'>
                            <div className="mb-2 p-0">
                                <h3 className="text-center text-white">
                                    <i className="bi bi-gear ms-1 fs-4"></i> Maintenance Register
                                </h3>
                            </div>
                        </CardHeader> */}
                        <div className=" p-4">
                            <div className="row ">
                                {/* Vendor - Conditional */}
                                {show && (
                                    <div className="col-xl-3 col-lg-6 col-sm-6 col-xs-2 ">
                                        <label className='fw-bold form-label'>Select Vendor <span style={{ color: "red" }}>*</span></label>
                                        <Select
                                            value={selectedVendor}
                                            options={VendorData.map(opt => ({
                                                value: opt.VendorID,
                                                label: opt.VendorName
                                            }))}
                                            onChange={(selected) => {
                                                setRegister({
                                                    ...Register,
                                                    VendorID: selected.value
                                                });
                                                setselectedVendor(selected);
                                            }}
                                            placeholder="Select Vendor"

                                            // ✅ Fix dropdown visibility
                                            menuPortalTarget={document.body}
                                            styles={{
                                                menuPortal: (base) => ({ ...base, zIndex: 9999 }), // bring to front
                                                menu: (base) => ({ ...base, zIndex: 9999, opacity: 1 }), // full opacity
                                            }}
                                            isClearable
                                        />

                                    </div>
                                )}


                                <div className="col-xl-3 col-lg-6 col-sm-6 col-xs-2 mt-1">
                                    <label className="form-label fw-bold">Select Asset ID / RFID <span style={{ color: "red" }}>*</span></label>
                                    <Typeahead
                                        id="branch-typeahead"
                                        labelKey={(option) => `${option.AssetID} / ${option.RFIDnumber}`}
                                        options={RFIDdropdown}
                                        placeholder="Select a Asset ID / RFID..."
                                        onChange={(selected) => {
                                            console.log(selected.length);
                                            if (selected.length > 0) {
                                                handleEnterforMP1(selected);
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


                                {/* Maintenance Type - Conditional */}
                                {show && (
                                    <div className="col-xl-3 col-lg-6 col-sm-6 col-xs-2">
                                        <label className="form-label fw-bold">Maintenance Type <span style={{ color: "red" }}>*</span></label>
                                        <select
                                            className="form-select"
                                            value={Register.MaintenanceType}
                                            onChange={(e) =>
                                                setRegister({ ...Register, MaintenanceType: e.target.value })
                                            }
                                        >
                                            <option value="" disabled selected>
                                                Select Type
                                            </option>
                                            {MaintenanceType.map((option) => (
                                                <option
                                                    key={option.MaintenanceID}
                                                    value={option.MaintenanceType}
                                                >
                                                    {option.MaintenanceType}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                            </div>

                            <Box
                                className="mt-4"
                                sx={{
                                    height: 300,
                                    width: "100%",
                                    "& .MuiDataGrid-columnHeaders": {
                                        background: "#f1f3f7",// Header background color
                                        // color: "#fff", // Header text color
                                        fontWeight: "bold",
                                        fontSize: "15px",
                                    },
                                    "& .MuiDataGrid-row:nth-of-type(odd)": {
                                        backgroundColor: "#f9f9f9", // Light color for odd rows
                                    },
                                    "& .MuiDataGrid-row:nth-of-type(even)": {
                                        backgroundColor: "#e6f2ff", // Slightly blue for even rows
                                    },
                                    "& .MuiDataGrid-cell": {
                                        color: "#333", // Cell text color
                                        fontSize: "14px",
                                    },
                                    "& .MuiDataGrid-row:hover": {
                                        backgroundColor: "#cce6ff !important", // Hover color
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
                                    experimentalFeatures={{ newEditingApi: true }} // Add if necessary
                                />
                            </Box>
                            {/* Action Buttons */}
                            {
                                (pageData.editstatus === null || pageData.editstatus === 'i') && auth.UserStatus === 'A'
                                    ? '' : (
                                        <div className='text-center  mt-3'>
                                            <button className='btn btn-danger me-2 btn-hover-effect'>Cancel</button>
                                            <button className='btn btn-success me-2 text-nowrap btn-hover-effect' onClick={handlecheck}>Maintenance Start</button>

                                        </div>
                                    )}
                        </div>
                    </Card>
                </CTabPane>
                <CTabPane role="tabpanel" aria-labelledby="home-tab" visible={activeKey === 2}>

                    <div className="ag-theme-quartz mt-3" style={{ height: 500, width: "100%" }}>
                        <AgGridReact
                            rowData={MaintenanceData}
                            columnDefs={columnDefs}
                            defaultColDef={defaultColDef}
                            rowSelection="multiple"
                            pagination={true}
                            paginationPageSize={10}
                        />
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
                                    Delivery Challan for Maintenance Asset
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
                                        <p style={{ margin: "2px 0" }}><strong>GST IN:</strong> {dataItem.BranchGSTNumber}</p>
                                        <p style={{ margin: "2px 0" }}><strong>DC No:</strong> {dataItem.DCNo}</p>
                                        <p style={{ margin: "2px 0" }}>
                                            <strong>Date:</strong>{" "}
                                            {new Date(dataItem.MaintenanceRegDate).toLocaleDateString("en-GB", {
                                                day: "2-digit",
                                                month: "short",
                                                year: "numeric",
                                            })}
                                        </p>
                                    </div>
                                    <div style={{ textAlign: "right" }}>
                                        <p style={{ margin: "2px 0" }}><strong>Status:</strong> {dataItem.Status}</p>
                                        <p style={{ margin: "2px 0" }}><strong>Maintenance Type:</strong> {dataItem.MaintenanceType}</p>
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
                                            {dataItem.branchName}<br />
                                            {dataItem.BranchAddress}, {dataItem.BranchCity}, {dataItem.BranchState} - {dataItem.BranchPincode}<br />
                                            <strong>Phone:</strong> {dataItem.BranchContactNumber}<br />
                                            <strong>GST:</strong> {dataItem.BranchGSTNumber}
                                        </p>
                                    </div>
                                    <div style={{ width: "48%", textAlign: "right" }}>
                                        <h4 style={{ fontSize: "10pt", margin: "0 0 3mm", fontWeight: "bold" }}>
                                            Vendor / Receiver Address
                                        </h4>
                                        <p style={{ margin: "0" }}>
                                            {dataItem.vendorContactPerson}<br />
                                            {dataItem.vendorAddress}, {dataItem.vendorCity}, {dataItem.vendorState} - {dataItem.vendorPostalCode}<br />
                                            <strong>Phone:</strong> {dataItem.vendorPhoneNumber}<br />
                                            <strong>GST:</strong> {dataItem.vendorGSTNumber}
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
                                                Description
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
                                                {dataItem.Description}
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
                                        For {dataItem.branchName}
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

PreMaintenance_test.propTypes = {
    auth: PropTypes.any.isRequired,
};

export default PreMaintenance_test
