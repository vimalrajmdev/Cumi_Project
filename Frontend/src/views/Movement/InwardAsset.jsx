import React, { useState, useEffect, useRef } from 'react'
import Swal from 'sweetalert2'
import axios from 'axios'
import PropTypes from 'prop-types';
import { Typeahead } from 'react-bootstrap-typeahead';
import { getConfig } from 'src/config';
import { AgGridReact } from 'ag-grid-react';
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import { CButton, CFormInput, CFormLabel, CModal, CModalBody, CModalFooter, CModalHeader, CModalTitle } from '@coreui/react';
import { useLocation } from 'react-router-dom';
import Select from "react-select";
import { useNavigate } from "react-router-dom";

const InwardAsset = ({ auth }) => {

    const navigate = useNavigate();

    // const { auth } = useContext(AuthContext)
    const PartRef1 = useRef(null)
    const PartRef2 = useRef(null)
    const API_URL = getConfig().REACT_APP_API_URL;
    const [RFID, setRFID] = useState(false)
    const [ID, setID] = useState(false)
    const [inwardData, SetinwardData] = useState([])
    const location = useLocation();
    const data = location.state?.inwardAssetData;
    const [Location, setLocation] = useState([]);

    // Get Asset Details
    const [Register, setRegister] = useState(

        {
            TransferredBranchName: '', Transferredbranchid: auth.branchid, ReceivedBranchName: '',
            Receivedbranchid: '', RFIDnumber: '', AssetID: '', Activity: '', Remarks: '', AssetName: '', AssetCost: '', Receivedby: '', PaidAmount: 0, DCNo: '', TransferCost: 0, LocationRFID: '', Location: ''
        }
    )



    const [select, setselect] = useState({
        RFIDnumber: '',
    })
    const InwardAsset = async (selected) => {
        if (selected.length === 0) {
            setRegister({
                ...Register,
                TransferredBranchName: '', Transferredbranchid: auth.branchid, ReceivedBranchName: '',
                Receivedbranchid: '', RFIDnumber: '', AssetID: '', Remarks: '', AssetName: '', AssetCost: '', PaidAmount: 0, TransferCost: 0
            })
            setID(false)
        }
        if (selected.length > 0) {
            try {
                const alldata = { RFIDnumber: selected[0].AssetID, mode: 'SED', branchid: auth.branchid, BranchAccess: auth.BranchAccess, Transferredbranchid: '', Receivedbranchid: '', Receivedby: '', PaidAmount: 0 }
                const response = await axios.post(`${API_URL}/InwardAsset`, alldata)
                const data = response.data[0];

                if (response.status === 200) {
                    if (data.RFID === 'In-Active') {
                        Swal.fire({
                            title: 'In-Active Asset',
                            text: 'Please Try Inside Asset',
                            icon: 'warning',
                            confirmButtonText: 'Done'
                        })
                    }
                    else if (data.MaintenanceDetails === 'UnderMaintenance') {
                        Swal.fire({
                            title: 'Asset In Under Maintenance',
                            text: 'Please Try Inside Asset',
                            icon: 'warning',
                            confirmButtonText: 'Done'
                        })
                    }
                    else {
                        const { AssetID, AssetName, RFIDnumber, TransferredBranchName, Transferredbranchid, Receivedbranchid, AssetCost, ReceivedBranchName, DCNo, TransferCost } = data

                        setRegister({
                            ...Register,
                            TransferredBranchName: TransferredBranchName, Transferredbranchid: Transferredbranchid, ReceivedBranchName: ReceivedBranchName,
                            Receivedbranchid: Receivedbranchid, RFIDnumber: RFIDnumber, AssetID: AssetID, Remarks: '', AssetName: AssetName, AssetCost: AssetCost, DCNo: DCNo, TransferCost: TransferCost, PaidAmount: 0
                        })
                        setID(true)

                    }

                }

            } catch (err) {
                Swal.fire({
                    title: 'Invalid Input',
                    text: 'Please Enter Valid RFID Number',
                    icon: 'error'
                })
            }
        }
    }
    const InwardAsset1 = async (selected) => {
        if (selected.length === 0) {
            setRegister({
                ...Register,
                TransferredBranchName: '', Transferredbranchid: auth.branchid, ReceivedBranchName: '',
                Receivedbranchid: '', RFIDnumber: '', AssetID: '', Remarks: '', AssetName: '', AssetCost: ''
            })
            setRFID(false)
        }
        if (selected.length > 0) {
            try {
                const alldata = { RFIDnumber: selected[0].RFIDnumber, mode: 'SED', branchid: auth.branchid, BranchAccess: auth.BranchAccess, Transferredbranchid: '', Receivedbranchid: '', Receivedby: '', PaidAmount: '' }
                const response = await axios.post(`${API_URL}/InwardAsset`, alldata)
                const data = response.data[0];

                if (response.status === 200) {
                    if (data.RFID === 'In-Active') {
                        Swal.fire({
                            title: 'In-Active Asset',
                            text: 'Please Try Inside Asset',
                            icon: 'warning',
                            confirmButtonText: 'Done'
                        })
                    }
                    else if (data.MaintenanceDetails === 'UnderMaintenance') {
                        Swal.fire({
                            title: 'Asset In Under Maintenance',
                            text: 'Please Try Inside Asset',
                            icon: 'warning',
                            confirmButtonText: 'Done'
                        })
                    }
                    else {
                        const { AssetID, AssetName, RFIDnumber, TransferredBranchName, Transferredbranchid, Receivedbranchid, AssetCost, ReceivedBranchName, DCNo } = data

                        setRegister({
                            ...Register,
                            TransferredBranchName: TransferredBranchName, Transferredbranchid: Transferredbranchid, ReceivedBranchName: ReceivedBranchName,
                            Receivedbranchid: Receivedbranchid, RFIDnumber: RFIDnumber, AssetID: AssetID, Remarks: '', AssetName: AssetName, AssetCost: AssetCost, DCNo: DCNo
                        })
                        setRFID(true)

                    }

                }

            } catch (err) {
                Swal.fire({
                    title: 'Invalid Input',
                    text: 'Please Enter Valid RFID Number',
                    icon: 'error'
                })
            }
        }
    }
    // 


    // LOCATION DROPDOWN

    const FetchInwardAssets = async () => {
        try {
            const alldata = { mode: 'GetInwardAsset', branchid: auth.branchid, BranchAccess: auth.BranchAccess, Transferredbranchid: '', Receivedbranchid: '', Receivedby: '', PaidAmount: '' }
            const response = await axios.post(`${API_URL}/InwardAsset`, alldata)
            if (response.status === 200) {
                SetinwardData(response.data);
                console.log('response.data', response.data);

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
        FetchInwardAssets();
        fetchPhysicalLocations();
    }, []);

    const fetchPhysicalLocations = async () => {
        try {
            const alldata = { mode: 'SPL', branchid: auth.branchid }
            const response = await axios.post(`${API_URL}/fetchPhysicalLocations`, alldata);
            if (response.status === 200) {
                setLocation(response.data.send);
            }
        } catch (err) {
            console.log(err);
        }
    };


    useEffect(() => {

        if (data && parseInt(auth.branchid) === parseInt(data.Receivedbranchid)) {
            // ✅ Populate when navigated with data

            setRegister({
                TransferredBranchName: data.TransferredBranchName,
                Transferredbranchid: data.Transferredbranchid,
                ReceivedBranchName: data.ReceivedBranchName,
                Receivedbranchid: data.Receivedbranchid,
                RFIDnumber: data.RFIDnumber,
                AssetID: data.AssetID,
                Remarks: "",
                AssetName: data.AssetName,
                AssetCost: data.AssetCost,
                TransferCost: data.TransferCost,
                DCNo: data.DCNo,
                PaidAmount: 0
            });
            setID(true);
        } else {
            // ✅ If refresh happens → clear all values
            setRegister({
                TransferredBranchName: "",
                Transferredbranchid: "",
                ReceivedBranchName: "",
                Receivedbranchid: "",
                RFIDnumber: "",
                AssetID: "",
                Remarks: "",
                AssetName: "",
                AssetCost: "",
                TransferCost: "",
                DCNo: "",
            });
            setID(false);
        }
    }, [data]);

    const [RFIDdropdown, setRFIDdropdown] = useState([])
    const fetchDataRFID = async () => {
        try {
            const alldata = { mode: 'EnrolledAssets', branchid: auth.branchid, BranchAccess: auth.BranchAccess, Transferredbranchid: '', Receivedbranchid: '', Receivedby: '', PaidAmount: '', departmentname: auth.departmentname }
            const response = await axios.post(`${API_URL}/InwardAsset`, alldata)
            setRFIDdropdown(response.data);
            // console.log(response.data.send)
        } catch (error) {
            console.error('Error fetching user details:', error);
        }
    };
    // Inward External Transferred Asset
    const HandleInwardAsset = async () => {
        if (Register.RFIDnumber === '') {
            Swal.fire({
                title: 'Please Enter RFID ',
                icon: 'error'
            })
            return
        }
        const UpdatedData = {
            ...Register,
            Receivedby: auth.empid,
            mode: 'UT', branchid: auth.branchid
        }

        try {
            const response = await axios.post(`${API_URL}/InwardAsset`, UpdatedData)
            if (response.status === 200) {
                setRegister({
                    ...Register,
                    TransferredBranchName: '', Transferredbranchid: '', ReceivedBranchName: '', Receivedbranchid: '', RFIDnumber: '', AssetID: '', Activity: '', Remarks: '', AssetName: '', AssetCost: '', Receivedby: '', DCNo: '', TransferCost: 0, LocationRFID: '', Location: ''
                })

                setselect({
                    RFIDnumber: ''
                })
                Swal.fire({
                    title: 'Inward Asset Successfully',
                    icon: 'success',
                    confirmButtonText: 'Done'
                })

                if (PartRef1.current) {
                    PartRef1.current.clear()
                }
                if (PartRef2.current) {
                    PartRef2.current.clear()
                }
                navigate(".", { replace: true, state: null });

                setID(false)
                setRFID(false)
            }

        } catch (err) {
            console.log(err)
        }

    }

    const columnDefs = [
        { field: "AssetID", headerName: "Asset ID", sortable: true, filter: true },
        { field: "AssetName", headerName: "Asset Name", sortable: true, filter: true },
        // { field: "TransferCost", headerName: "Transfer Cost", sortable: true, filter: true },
        // { field: "PaidAmount", headerName: "Paid Amount", sortable: true, filter: true },
        // { field: "BalanceAmount", headerName: "Balance", sortable: true, filter: true },
        { field: "Approval", headerName: "Approval Status", sortable: true, filter: true },
        { field: "PaymentStatus", headerName: "Payment Status", sortable: true, filter: true },
        { field: "ReceivedBranchName", headerName: "Received Branch", sortable: true, filter: true },
        { field: "TransferredBranchName", headerName: "Transferred Branch", sortable: true, filter: true },
        { field: "Remarks", headerName: "Remarks", sortable: true, filter: true },
        {
            field: "Payment",
            headerName: "Payment Update",
            sortable: false,
            filter: false,
            cellRenderer: (params) => {
                return (
                    <button
                        className="btn btn-sm btn-success"
                        onClick={() => handlePaymentClick(params.data)}
                        disabled={params.data.PaymentStatus === "Closed"}
                    >
                        Pay
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

    const [showModal, setShowModal] = useState(false);
    const [selectedAsset, setSelectedAsset] = useState(null);
    const [paymentAmount, setPaymentAmount] = useState(0);

    // Open modal
    const handlePaymentClick = (data) => {
        setSelectedAsset(data);
        setPaymentAmount(data.TransferCost - data.PaidAmount); // default balance
        setShowModal(true);
    };

    // Submit payment
    const handlePaymentSubmit = async () => {
        try {
            const payload = {
                ...selectedAsset,
                PaidAmount: paymentAmount,
                branchid: auth.branchid, mode: 'UpdatePayment', TransferredBy: ''
            };
            const response = await axios.post(`${API_URL}/PaymentHistory`, payload);
            if (response.status === 200) {
                setShowModal(false);
                Swal.fire({
                    title: 'successfully Paid',
                    icon: 'Success',
                }).then(() => {
                    FetchInwardAssets();
                })
                return
            }
        } catch (err) {
            console.error(err);
        }
    };

    const HandleLocationChange = (selected) => {

        const selectedLocation = selected.value;
        const selectedOption = Location.find(option => option.Location === selectedLocation);

        setRegister({
            ...Register,
            Location: selectedLocation,
            LocationRFID: selectedOption ? selectedOption.LocationRFID : ''
        });
    };


    return (
        <div className=''>

            <CModal visible={showModal} onClose={() => setShowModal(false)}>
                <CModalHeader>
                    <CModalTitle>Update Payment for {selectedAsset?.AssetName}</CModalTitle>
                </CModalHeader>
                <CModalBody>
                    <p>Transfer Cost: {selectedAsset?.TransferCost}</p>
                    <p>Paid Amount: {selectedAsset?.PaidAmount}</p>
                    <p>Balance: {selectedAsset?.TransferCost - selectedAsset?.PaidAmount}</p>
                    <CFormInput
                        type="number"
                        value={paymentAmount}
                        onChange={(e) => setPaymentAmount(Number(e.target.value))}
                        max={selectedAsset?.TransferCost - selectedAsset?.PaidAmount}
                    />
                    <div>
                        <CFormLabel htmlFor="remarks">Remarks</CFormLabel>
                        <CFormInput
                            type="text"
                            id="remarks"
                            // value={selectedAsset?.Remarks || ''}
                            onChange={(e) => setSelectedAsset({ ...selectedAsset, Remarks: e.target.value })}
                            placeholder="Enter remarks"
                        />
                    </div>
                </CModalBody>
                <CModalFooter>
                    <CButton color="secondary" onClick={() => setShowModal(false)}>
                        Cancel
                    </CButton>
                    <CButton color="primary" onClick={handlePaymentSubmit}>
                        Submit Payment
                    </CButton>
                </CModalFooter>
            </CModal>

            <div className="card shadow-lg border-0 rounded-3 p-4">
                {/* Header */}
                <div className="card-header pro-header p-1">
                    <div className="d-flex justify-content-center align-items-center">
                        {/* Center Title */}
                        <div className="text-center" >
                            <h3 className="text-white m-0">
                                <i className="bi bi-pin-map fs-4 text-primary ms-2"></i> Inward Asset
                            </h3>
                        </div>
                    </div>
                </div>

                {/* Body */}
                <div className="card-body py-3">
                    {/* First Row */}
                    <div className="row g-3">
                        {/* RFID */}
                        <div className="col-xl-3 col-lg-6 col-md-6 col-sm-6">
                            <label className="form-label fw-semibold">RFID Number</label>
                            {RFID ? (
                                <input
                                    className="form-control shadow-sm"
                                    maxLength="24"
                                    value={Register.RFIDnumber}
                                    disabled
                                />
                            ) : (
                                <Typeahead
                                    ref={PartRef1}
                                    id="rfid-typeahead"
                                    labelKey={(option) => `${option.RFIDnumber} / ${option.AssetID}`}
                                    onChange={(selected) => InwardAsset(selected)}
                                    options={RFIDdropdown}
                                    placeholder="Search RFID..."
                                    className="shadow-sm"
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

                                                InwardAsset(selected);

                                            }
                                        }
                                    }}
                                    selected={
                                        Register.RFIDnumber && Register.AssetID
                                            ? [{ RFIDnumber: Register.RFIDnumber, AssetID: Register.AssetID }]
                                            : []
                                    }
                                />
                            )}
                        </div>

                        <div className="col-xl-3 col-lg-6 col-md-6 col-sm-6">
                            <label className="form-label fw-semibold">Asset Name</label>
                            <input
                                className="form-control"
                                value={Register.AssetName}
                                disabled
                                placeholder="Asset Name"
                            />
                        </div>

                        <div className="col-xl-3 col-lg-6 col-md-6 col-sm-6">
                            <label className="form-label fw-semibold">Branch</label>
                            <input
                                className="form-control"
                                value={Register.TransferredBranchName}
                                disabled
                                placeholder="Branch"
                            />
                        </div>

                        <div className="col-xl-3 col-lg-6 col-md-6 col-sm-6">
                            <label className="form-label fw-semibold">Asset Cost</label>
                            <input
                                className="form-control"

                                placeholder="Enter Asset Cost"
                                value={Register.AssetCost}
                                disabled
                            />
                        </div>

                        {/* <div className="col-xl-3 col-lg-6 col-md-6 col-sm-6">
                            <label className="form-label fw-semibold">Transfer Cost</label>
                            <input
                                className="form-control"

                                placeholder="Enter Transfer Cost"
                                value={Register.TransferCost}
                                disabled
                            />
                        </div>

                        <div className="col-xl-3 col-lg-6 col-md-6 col-sm-6">
                            <label className="form-label fw-semibold">To Pay</label>
                            <input
                                className="form-control"
                                onChange={(e) => {
                                    const TransferCost = parseFloat(Register.TransferCost) || 0
                                    const paidAmount = parseFloat(e.target.value) || 0

                                    if (paidAmount > TransferCost) {
                                        swal({
                                            icon: 'warning',
                                            title: 'Paid amount is Greater than Transfer cost!',
                                        }).then(() => {
                                            setRegister({ ...Register, PaidAmount: '' })
                                        })
                                    } else {
                                        setRegister({ ...Register, PaidAmount: e.target.value })
                                    }
                                }}
                                placeholder="Enter Asset Cost"
                                value={Register.PaidAmount}
                                disabled
                            />
                        </div> */}

                        <div className="col-xl-3 col-lg-6 col-md-6 col-sm-6">
                            <label className="form-label">Select Location</label>
                            <Select
                                options={Location.map((opt) => ({
                                    value: opt.LocationCode,
                                    label: opt.LocationCode,
                                }))}
                                value={
                                    Register.Location
                                        ? { value: Register.Location, label: Register.Location }
                                        : null
                                }
                                onChange={HandleLocationChange}
                                placeholder="Select Location"
                            />
                        </div>
                        {/* Remarks */}
                        <div className="col-xl-6 col-lg-12 col-md-12 col-sm-12">
                            <label className="form-label fw-semibold">Remarks</label>
                            <input
                                rows="3"
                                className="form-control"
                                onChange={(e) => setRegister({ ...Register, Remarks: e.target.value })}
                                value={Register.Remarks}
                                placeholder="Enter remarks"
                            ></input>
                        </div>

                    </div>


                    {/* Action Button */}
                    <div className="text-center mt-4">
                        <button
                            className="btn btn-success px-4 py-2 rounded-pill btn-hover-effect"
                            onClick={HandleInwardAsset}
                        >
                            <i className="bi bi-check-circle me-2"></i>Inward Asset
                        </button>
                    </div>
                </div>

                {/* <div className="ag-theme-quartz" style={{ height: 500, width: "100%" }}>
                    <AgGridReact
                        rowData={inwardData}
                        columnDefs={columnDefs}
                        defaultColDef={defaultColDef}
                        rowSelection="multiple"
                        pagination={true}
                        paginationPageSize={10}
                    />
                </div> */}


            </div>

        </div>
    )
}

InwardAsset.propTypes = {
    auth: PropTypes.any.isRequired,
};

export default InwardAsset
