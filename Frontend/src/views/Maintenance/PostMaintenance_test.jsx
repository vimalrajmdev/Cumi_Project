import React, { useState, useRef, useMemo, useEffect, useContext } from 'react'
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import Swal from 'sweetalert2'
import { AgGridReact } from 'ag-grid-react';
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import axios from 'axios';
import secureLocalStorage from 'react-secure-storage';
// import { AuthContext } from '../../AuthContext';
import PropTypes from 'prop-types';
import { Typeahead } from 'react-bootstrap-typeahead';
import { getConfig } from 'src/config';
import { Card, CardBody, CardHeader } from 'react-bootstrap';
import "react-bootstrap-typeahead/css/Typeahead.css";
import { BallTriangle } from 'react-loader-spinner';


const PostMaintenance_test = ({ auth }) => {
    const [loading, setLoading] = useState(false);
    const PartRef1 = useRef(null)
    const PartRef2 = useRef(null)
    const [RFID, setRFID] = useState(false)
    const [ID, setID] = useState(false)
    // const { auth } = useContext(AuthContext)
    //   
    const API_URL = getConfig().REACT_APP_API_URL;
    const [LocationDropDownData, SetLocationDropDownData] = useState([])
    const [physicalLocationData, setPhysicalLocationData] = useState([]);
    const [show, setShow] = useState(true);

    const [selectedOption, setSelectedOption] = useState('CheckOut'); // State to manage selected option
    const [inputdata, setInputdata] = useState({
        BranchName: '', PhysicalLocation: '', LocationRFID: ''
    });
    const [select, setSelect] = useState({
        RFIDnumber: '',
    });
    // Function to handle select change
    const handleSelectChange = (event) => {
        setSelectedOption(event.target.value); // Update selected option state
        // Automatically show date inputs if "customdate" is selected
        if (event.target.value === 'CheckOut') {
            setShow(true);
        } else {
            setShow(false);
        }
    };


    // 

    const componentRef = useRef(null);

    const generatePDF = () => {
        const doc = new jsPDF();
        const tableElement = document.getElementById('CheckInDetails');
        doc.autoTable({ html: tableElement });
        doc.save('CheckInDetails.pdf');
    };

    const downloadExcel = () => {
        const table = componentRef.current;
        const ws = XLSX.utils.table_to_sheet(table);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'CheckInDetails');
        XLSX.writeFile(wb, 'CheckInDetails.xlsx');
    };
    // Table For Under Maintenance TAble
    const pagination = true;
    const paginationPageSize = 10;
    const paginationPageSizeSelector = [10, 20, 50];

    const StatusRenderer = (params) => {
        return (
            <div>
                <span className='badge bg-danger'>Under Maintenance</span>
            </div>
        )
    }
    const [rowdata, setRowdata] = useState([])

    const columndef = [

        // { headerCheckboxSelection: true, checkboxSelection: true, headerName: "Select", field: "Id", filter: true, floatingFilter: true, editable: true },
        { headerName: "RFID Number", headerClass: 'agheader', field: "RFIDnumber", filter: true, floatingFilter: true, editable: true },
        { headerName: "Asset ID", headerClass: 'agheader', field: "AssetID", filter: true, floatingFilter: true, editable: true },
        { headerName: "Asset Name", headerClass: 'agheader', field: "AssetName", filter: true, floatingFilter: true, editable: true },
        { headerName: "Vendors", headerClass: 'agheader', field: "VendorName", filter: true, floatingFilter: true, editable: true },
        { headerName: "Maintenance Type", headerClass: 'agheader', field: "MaintenanceType", filter: true, floatingFilter: true, editable: true },
        { headerName: "Maintenance Register Date", headerClass: 'agheader', field: "MaintenanceRegDate", filter: true, floatingFilter: true, editable: true },
        { headerName: "Status", field: "Status", headerClass: 'agheader', cellRenderer: StatusRenderer },
        { headerName: "Description", headerClass: 'agheader', field: "Description", filter: true, floatingFilter: true, editable: true },

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
    // FETCH DATA
    const fetchData1 = async () => {
        try {
            const data = { mode: 'UML', departmentname: auth.departmentname, branchid: auth.branchid, BranchAccess: auth.BranchAccess }
            const response = await axios.post(`${API_URL}/UnderMaintenance`, data);
            setRowdata(response.data.send);
        } catch (error) {
            console.error('Error fetching user details:', error);
        }
    };
    useEffect(() => {
        fetchData1();

    }, []);

    // handle KEy Down
    // const handlekeydown = (e) => {
    //     if (e.key === 'Enter') {
    //         handleEnterMaintenance(e)
    //     }
    // }
    // Handle Enter for Search Maintenance Details
    const [enter, setEnter] = useState({
        RFIDnumber: ''
    });
    const [Register, setRegister] = useState({
        RFIDnumber: '', id: '', SerialNumber: '', Activity: '', Vendors: '', MaintenanceType: '', MaintenanceRegDate: '', Status: '', Description: '', MaintenanceID: '', ScrapRegDate: '', InspectedBy: '', MaintenanceInvoiceNumber: '', MaintenanceCost: '', Room: '', MaintenanceDetails: '', MaintenanceDoneRegDate: '', RegisteredBy: '', AssetID: '', AssetName: '', Movement: '', Remarks: '', DCNo: ''
    })

    const handleEnterMaintenance1 = async (selected) => {

        if (selected.length === 0) {
            setRegister({
                ...Register,
                RFIDnumber: '', id: '', AssetID: '', AssetName: '', Activity: '', Vendors: '', MaintenanceType: '', MaintenanceRegDate: '', Status: '', MaintenanceID: '',
            })
            setRFID(false)
        }
        if (selected.length > 0) {
            try {
                const alldata = { RFIDnumber: selected[0].AssetID, mode: 'SU', branchid: auth.branchid }

                const response = await axios.post(`${API_URL}/SearchUnderMaintenance`, alldata)
                const data = response.data[0]
                if (response.status === 200) {
                    const { RFIDnumber, id, AssetID, AssetName, Activity, Vendors, MaintenanceType, MaintenanceRegDate, Status, MaintenanceID, Description, DCNo } = data
                    setRegister({
                        ...Register,
                        RFIDnumber: RFIDnumber, id: id, AssetID: AssetID, AssetName: AssetName, Activity: Activity, Vendors: Vendors, MaintenanceType: MaintenanceType, MaintenanceRegDate: MaintenanceRegDate, Status: Status, MaintenanceID: MaintenanceID, Description: Description, DCNo: DCNo
                    })

                    setRFID(true)
                }
            } catch (err) {
                Swal.fire({
                    title: 'Search Failed No Assets in Under Maintenance',
                    icon: 'info',
                    confirmButtonText: 'okay'
                })
                console.log("Error on Enter RFID in FrontEnd", err)
            }
        }
    }
    // MOVE to Scrap
    const handlecheckforScrap = async (e) => {
        // console.log(Register)
        setLoading(true);
        const Updateddata = { ...Register, Activity: 'Scrap', mode: 'MTS', RegisteredBy: auth.empid, branchid: auth.branchid }

        try {
            const response = await axios.post(`${API_URL}/MovetoScrap`, Updateddata)
            if (response.status === 200) {
                setLoading(false);
                Swal.fire({
                    title: 'Successfully Move to Scrap',
                    icon: 'success',
                    confirmButtonText: 'okay'
                })

                fetchData1();
                setRegister({
                    ...Register,
                    RFIDnumber: '', id: '', SerialNumber: '', Activity: '', Vendors: '', MaintenanceType: '', MaintenanceRegDate: '', Status: '', Description: '', MaintenanceID: '', ScrapRegDate: '', InspectedBy: '', MaintenanceInvoiceNumber: '', MaintenanceCost: '', Room: '', MaintenanceDetails: '', Location: '', MaintenanceDoneRegDate: '', Branch: '', PhysicalLocation: '', AssetID: '', AssetName: '', Remarks: ''

                })

                setEnter({
                    RFIDnumber: ''
                })

                setInputdata({
                    ...inputdata,
                    LocationRFID: '',
                    PhysicalLocation: '',
                    BranchName: ''
                })
                if (PartRef1.current) {
                    PartRef1.current.clear()
                }
                if (PartRef2.current) {
                    PartRef2.current.clear()
                }
                setID(false);
                setRFID(false);
                fetchDataRFID();
            }
        } catch (err) {
            console.log(err)

        }
    }
    // Maintenance Done
    const handlecheckforMaintenanceDone = async (e) => {
        const updateData = { ...Register, Status: 'Active', RegisteredBy: auth.empid, Movement: 'Maintenance Done', branchid: auth.branchid }
        const updateData1 = { ...updateData, MaintenanceDetails: 'Done', Activity: 'Check-In', mode: 'MD' }
        if (Register.RFIDnumber === '') {
            Swal.fire({
                title: 'Please Enter RFID Number',
                icon: 'error'
            })
            return
        }
        if (Register.MaintenanceInvoiceNumber === '') {
            Swal.fire({
                title: 'Please Enter Maintenance Invoice Number',
                icon: 'error'
            })
            return
        }
        if (Register.MaintenanceCost === '') {
            Swal.fire({
                title: 'Please Enter Maintenance Cost',
                icon: 'error'
            })
            return
        }
        try {
            setLoading(true);
            const alldata = { ...inputdata, ...updateData1 }
            const response = await axios.post(`${API_URL}/MaintenanceDoneReg`, alldata)
            const data = response.data[0]
            if (response.status === 200) {
                setLoading(false);
                fetchData1();

                setRegister({
                    ...Register,
                    RFIDnumber: '', id: '', SerialNumber: '', Activity: '', Vendors: '', MaintenanceType: '', MaintenanceRegDate: '', Status: '', Description: '', MaintenanceID: '', ScrapRegDate: '', InspectedBy: '', MaintenanceInvoiceNumber: '', MaintenanceCost: '', Room: '', MaintenanceDetails: '', Location: '', MaintenanceDoneRegDate: '', Branch: '', PhysicalLocation: '', AssetID: '', AssetName: '', Remarks: ''

                });
                setSelect({
                    RFIDnumber: ''
                })

                setEnter({
                    RFIDnumber: ''
                })

                setInputdata({
                    ...inputdata,
                    LocationRFID: '',
                    PhysicalLocation: '',
                    BranchName: ''
                })
                if (PartRef1.current) {
                    PartRef1.current.clear()
                }
                if (PartRef2.current) {
                    PartRef2.current.clear()
                }
                setID(false)
                setRFID(false)

                Swal.fire({
                    title: 'Successfully Maintenance Done',
                    icon: 'success',
                    confirmButtonText: 'okay'
                })
            }
        } catch (err) {
            console.log(err)
        }
    }



    const inputRef = useRef(null);


    //   USER Dropdown
    // const [Inspecteddata, SetInspecteddata] = useState([])

    // const FetchMappedBy = async () => {
    //     try {
    //         const response = await axios.post(`${API_URL}/fetchUser`);
    //         if (response.status === 200) {
    //             SetInspecteddata(response.data.send);
    //         }
    //     } catch (err) {
    //         console.log(err);

    //     }
    // };
    const [user, setUser] = useState([]);
    const fetchData = async () => {
        const userdata = secureLocalStorage.getItem("userdata");
        if (userdata) {
            const parsedUser = JSON.parse(userdata);
            setUser(parsedUser)
        }
    }

    const FetchLocationDropdown = async () => {
        try {
            const alldata = { mode: 'SD', branchid: auth.branchid }
            const response = await axios.post(`${API_URL}/fetchLocation`, alldata);
            if (response.status === 200) {
                SetLocationDropDownData(response.data.send);
            }
        } catch (err) {
            console.log(err);
        }
    };


    const fetchPhysicalLocations = async (BranchName) => {
        try {
            const alldata = { BranchName, mode: 'SPL', branchid: auth.branchid }
            const response = await axios.post(`${API_URL}/fetchPhysicalLocations`, alldata);
            if (response.status === 200) {
                setPhysicalLocationData(response.data.send);
            }
        } catch (err) {
            console.log(err);
        }
    };


    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.focus();
            inputRef.current.setSelectionRange(0, 0); // Set cursor position to the start
        }
        fetchData();
        FetchLocationDropdown();
        fetchDataRFID();

    }, []);

    const [RFIDdropdown, setRFIDdropdown] = useState([])
    const fetchDataRFID = async () => {
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

    const resetAssetDetails = () => {
        setRegister({
            ...Register,
            AssetName: '',
            Description: '',
            Vendors: '',
            RFIDnumber: '',
            // clear all auto-populated fields
        });
        setSelect({ AssetID: '' });
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
            <Card>

                <div className="card-header pro-header p-1">
                    <div className="d-flex justify-content-center align-items-center">
                        {/* Center Title */}
                        <div className="text-center" >
                            <h3 className="text-white m-0">
                                <i class="bi bi-check2-circle fs-3 ms-1"></i> Maintenance Done Register
                            </h3>
                        </div>
                    </div>
                </div>
                <CardBody>
                    <div className='d-flex row mb-3 mt-3'>
                        <div className="col-xl-3 col-lg-6 col-sm-6 col-xs-2 ">
                            <label className="form-label">Select Asset ID / RFID <span style={{ color: "red" }}>*</span></label>
                            <Typeahead
                                id="branch-typeahead"
                                labelKey={(option) => `${option.AssetID} / ${option.RFIDnumber}`}
                                options={RFIDdropdown}
                                placeholder="Select a Asset ID / RFID..."
                                onChange={(selected) => {
                                    console.log(selected.length);
                                    if (selected.length > 0) {
                                        handleEnterMaintenance1(selected);
                                        setSelect({
                                            AssetID: selected[0].AssetID
                                        })
                                    }
                                    else {
                                        setSelect({
                                            AssetID: ''
                                        })
                                        resetAssetDetails();
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

                                            handleEnterMaintenance1(selected);

                                        }
                                    }
                                }}
                                selected={select.AssetID ? RFIDdropdown.filter(item => item.AssetID === select.AssetID) : []}
                                required
                                clearButton
                            />
                        </div>
                        {/* <div className='col-xl-3 col-lg-6 col-sm-6 col-xs-2'>
                        <label>RFID Number</label>
                        {RFID ?
                            <input className='form-control' ref={inputRef} o maxLength='24' value={Register.RFIDnumber} disabled />
                            :
                            <Typeahead
                                ref={PartRef1}
                                id="basic-typeahead-single"
                                labelKey="RFIDnumber"
                                onChange={(selected) => {
                                    handleEnterMaintenance(selected)
                                }}
                                options={RFIDdropdown.filter(opt => opt.RFIDnumber !== "N/A")}
                                placeholder="Select RFID"
                            />
                        }
                    </div>
                    <div className='col-xl-3 col-lg-6 col-sm-6 col-xs-2'>
                        <label>Asset ID</label>
                        {ID ?
                            <input className='form-control' value={Register.AssetID} disabled />
                            :
                            <Typeahead
                                ref={PartRef2}
                                id="basic-typeahead-single"
                                labelKey="AssetID"
                                onChange={(selected) => {
                                    handleEnterMaintenance1(selected)
                                }}
                                options={RFIDdropdown}
                                placeholder="Select RFID"
                            />
                        }
                    </div> */}
                        <div className='col-xl-3 col-lg-6 col-sm-6 col-xs-2'>
                            <label>Asset Name <span style={{ color: "red" }}>*</span></label>
                            <input className='form-control mt-2' placeholder='Please Enter Asset Name' value={Register.AssetName} disabled />
                        </div>
                        <div className='col-xl-3 col-lg-6 col-sm-6 col-xs-2'>
                            <label>Description <span style={{ color: "red" }}>*</span></label>
                            <input className='form-control mt-2' placeholder='Please Enter Description' value={Register.Description} disabled />
                        </div>
                        {show && <div className='col-xl-3 col-lg-6 col-sm-6 col-xs-2'>
                            <label>Vendor <span style={{ color: "red" }}>*</span></label>
                            <input className='form-control mt-2' placeholder='Please Enter Vendor' value={Register.Vendors} disabled />

                        </div>}

                    </div>

                    <div className='d-flex row mb-3'>

                        {show && <div className='col-xl-3 col-lg-6 col-sm-6 col-xs-2'>
                            <label>Maintenance Invoice Number <span style={{ color: "red" }}>*</span></label>
                            <input className='form-control mt-2'
                                placeholder='Please Enter Invoice Number' onChange={(e) => setRegister({ ...Register, MaintenanceInvoiceNumber: e.target.value })} value={Register.MaintenanceInvoiceNumber} />

                        </div>}
                        {show && <div className='col-xl-3 col-lg-6 col-sm-6 col-xs-2'>
                            <label>Maintenance Cost <span style={{ color: "red" }}>*</span></label>
                            <input className='form-control mt-2'
                                placeholder='Please Enter Maintanence Cost' onChange={(e) => setRegister({ ...Register, MaintenanceCost: e.target.value })} value={Register.MaintenanceCost} />

                        </div>}
                        <div className='col-xl-3 col-lg-6 col-sm-6 col-xs-2'>
                            <div>
                                <label>Status <span style={{ color: "red" }}>*</span></label>
                                <select id="mySelect" onChange={handleSelectChange} value={selectedOption} className='form-select mt-1'>
                                    <option value="CheckOut">Problem Re-Solved</option>
                                    <option value="Dispose">Problem Not Re-Solved</option>
                                </select>
                            </div>
                        </div>

                    </div>
                    <div>
                        <label>Remarks</label>
                        <textarea className='form-control border border-2 mt-2' placeholder='Please Enter Remarks / Description' onChange={(e) => setRegister({ ...Register, Remarks: e.target.value })} value={Register.Remarks}></textarea>
                    </div>
                    <div className='text-center mt-3'>
                        <button className='btn btn-danger me-2 btn-hover-effect'>Cancel</button>
                        {show ? <button className='btn   btn-success me-2 text-nowrap btn-hover-effect' onClick={handlecheckforMaintenanceDone}>Maintenance Done</button> : <button className='btn   btn-success mx-2 btn-hover-effect' onClick={handlecheckforScrap}>Move to Scrap</button>}
                    </div>
                </CardBody>
            </Card>

            {/*  */}
            {/* Modal for Download Format */}
            <div className="modal fade" id="exampleModal" tabIndex="-1" aria-labelledby="exampleModalLabel" >
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h1 className="modal-title fs-5" id="exampleModalLabel">Download Format</h1>
                            <button type="button" className="btn-close" data-bs-dismiss="modal"></button>
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
            {/*  */}

            <div className='card'>
                <div className='ag-theme-quartz' style={{ height: "500px" }}>
                    <AgGridReact rowData={rowdata} columnDefs={columndef} rowSelection={"multiple"}
                    // autoGroupColumnDef={autoGroupColumnDef} pagination={pagination} paginationPageSize={paginationPageSize} paginationPageSizeSelector={paginationPageSizeSelector}
                    />
                </div>
            </div>
        </div>
    )
}

PostMaintenance_test.propTypes = {
    auth: PropTypes.any.isRequired,
};

export default PostMaintenance_test
