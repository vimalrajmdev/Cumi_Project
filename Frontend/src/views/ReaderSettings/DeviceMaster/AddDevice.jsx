import React, { useState, useRef, useEffect, useContext } from 'react';
// import Icon from '/Users/REACT/asset-track/src/Images/Upload.jpg';
import { Link, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2'
import axios from 'axios';
import { getConfig } from 'src/config';
// import DatePicker from 'react-datepicker';
// import secureLocalStorage from 'react-secure-storage';
// import { AuthContext } from '../../AuthContext';
import PropTypes from 'prop-types';
import { Typeahead } from 'react-bootstrap-typeahead';
import { Card, CardBody, CardFooter, CardHeader } from 'react-bootstrap';
const AddRegister = ({ auth }) => {
    const navigate = useNavigate();
    const [showDateInput, setShowDateInput] = useState(true);
    const [maxCreatedDate, setmaxCreatedDate] = useState('');
    const [minWarrantyEndingDate, setminWarrantyEndingDate] = useState('')
    const [DisposedDate, setDisposedDate] = useState('')
    const API_URL = getConfig().REACT_APP_API_URL;
    const [CategoryDropDownData, SetCategoryDropDownData] = useState([])
    const [SubCategoryData, setSubCategoryData] = useState([]);
    const [DepartmentDropDownData, SetDepartmentDropDownData] = useState([])
    const [LocationDropDownData, SetLocationDropDownData] = useState([])
    const [physicalLocationData, setPhysicalLocationData] = useState([]);
    const [inputdata, setInputdata] = useState({
        BranchName: '', PhysicalLocation: '', LocationRFID: ''
    })

    const [startDate, setStartDate] = useState("");
    const [daysToAdd, setDaysToAdd] = useState("");
    const [endDate, setEndDate] = useState("");

    // Swal For Return Asset

    const fileInput = useRef(null);

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
                    AssetImg: reader.result
                }));
            };

            reader.readAsDataURL(file); // Convert image to base64
        } else {
            alert('File size should be less than or equal to 2MB'); // Provide user feedback
        }
    };
    // Upload Image End

    //Asset Register Start
    const [Register, setRegister] = useState(
        {
            SequenceNo: ''
            , BranchID: auth.branchid
            , DeviceID: ''
            , DeviceName: ''
            , Floor: ''
            , IPaddress: ''
            , MACaddress: ''
            , MachineID: ''
            , DeviceType: ''
            , ReaderType: ''
            , AllowDoorLock: ''
            , LockDoor: ''
            , Alarm: ''
            , ManufactureName: ''
            , LastSeqNumber: ''
            , Active: ''
            , AntennaID: ''
            , RoomType: ''
            , mode: ''
        }
    )
    const validateFields = () => {
        const fieldsToCheck = [
            // { key: 'SequenceNo', message: 'Please Enter Sequence No' },
            { key: 'BranchID', message: 'Please Enter Branch ID' },
            { key: 'DeviceID', message: 'Please Enter Device ID' },
            { key: 'DeviceName', message: 'Please Enter Device Name' },
            { key: 'Floor', message: 'Please Enter Floor' },
            { key: 'IPaddress', message: 'Please Enter IP Address' },
            { key: 'MACaddress', message: 'Please Enter MAC Address' },
            // { key: 'MachineID', message: 'Please Enter Machine ID' },
            { key: 'DeviceType', message: 'Please Enter Device Type' },
            { key: 'ReaderType', message: 'Please Enter Reader Type' },
            // { key: 'AllowDoorLock', message: 'Please Enter Allow Door Lock' },
            // { key: 'LockDoor', message: 'Please Enter Lock Door' },
            // { key: 'Alarm', message: 'Please Enter Alarm' },
            { key: 'ManufactureName', message: 'Please Enter Manufacture Name' },
            // { key: 'LastSeqNumber', message: 'Please Enter Last Sequence Number' },
            // { key: 'Active', message: 'Please Enter Active Status' },
            { key: 'AntennaID', message: 'Please Enter Antenna ID' },
            { key: 'RoomType', message: 'Please Enter Room Type' },
        ];

        for (const field of fieldsToCheck) {
            if (Register[field.key] === '') {
                Swal.fire({
                    title: field.message,
                    icon: 'warning',
                    confirmButtonText: 'Done'
                });
                return false;
            }
        }

        return true;
    };
    //   Submit Details
    const handlecheck = async (e) => {
        if (validateFields()) {
            const isValidPartCode = rowData.some((item) => {
                return item.AntennaID.toLowerCase() === Register.AntennaID.toLowerCase() &&
                    item.IPaddress.toLowerCase() === Register.IPaddress.toLowerCase()

            });

            if (isValidPartCode) {
                swal({
                    text: "This Antenna ID and IP Address is Already Exitsing",
                    icon: "warning"
                });
                return;
            }
            try {
                const alldata = { ...Register, CreatedBy: auth.empid, mode: 'I' }
                console.log(alldata)
                const response = await axios.post(`${API_URL}/DeviceRegisterInfo`, alldata)
                if (response.status === 200) {
                    Swal.fire({
                        title: 'Saved Successfully',
                        text: '',
                        icon: 'success',
                        confirmButtonText: 'Done'
                    }).then(() => {
                        navigate('/Settings/RFIDReaderDeviceMaster');
                    });
                    return;
                }

            }
            catch (err) {
                console.log(err)
            }
        }





    }

    // Fetch Category
    const FetchCategoryDropdown = async () => {
        try {
            const alldata = { mode: 'SD' };
            const response = await axios.post(`${API_URL}/fetchCategorydata`, alldata);
            if (response.status === 200) {
                console.log('Fetched categories:', response.data.send); // Debugging line
                SetCategoryDropDownData(response.data.send);
            }
        } catch (err) {
            console.log(err);
        }
    };

    // Fetch subcategories based on selected category
    const fetchSubCategory = async (Category) => {
        try {
            const alldata = { Category, mode: 'SDS' }

            console.log(alldata)
            const response = await axios.post(`${API_URL}/fetchSubCategorydata`, alldata);
            if (response.status === 200) {
                setSubCategoryData(response.data.send);
            }
        } catch (err) {
            console.log(err);
        }
    };

    // Handle category change
    const handleCategoryChange = async (e) => {
        const selectedCategory = e.target.value;
        console.log(selectedCategory)
        const alldata = { mode: 'GetCode', Category: e.target.value }
        console.log(alldata)
        const response = await axios.post(`${API_URL}/getAssetCode`, alldata);
        const PrefixSuffix = response.data[0].PrefixSuffix
        // console.log(PrefixSuffix)
        // console.log(Register)
        setRegister({ ...Register, Category: selectedCategory, AssetID: PrefixSuffix });
        fetchSubCategory(selectedCategory); // Fetch subcategories when category is selected
    };


    //   USER Dropdown

    const FetchDepartmentDropDownData = async () => {
        try {
            const data = { mode: 'S' }
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
            const alldata = { mode: 'SD' }
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
            const alldata = { BranchName, mode: 'SPL' }
            const response = await axios.post(`${API_URL}/fetchPhysicalLocations`, alldata);
            if (response.status === 200) {
                setPhysicalLocationData(response.data.send);
            }
        } catch (err) {
            console.log(err);
        }
    };

    const handlePhysicalLocationChange = (e) => {
        const selectedLocation = e.target.value;
        const selectedOption = physicalLocationData.find(option => option.PhysicalLocation === selectedLocation);

        setInputdata({
            ...inputdata,
            PhysicalLocation: selectedLocation,
            LocationRFID: selectedOption ? selectedOption.LocationRFID : ''
        });
    };
    const handleBranchChange = (e) => {
        const selectedBranch = e.target.value;
        setInputdata({ ...inputdata, BranchName: selectedBranch });
        fetchPhysicalLocations(selectedBranch); // Fetch physical locations when a branch is selected
    };


    useEffect(() => {
        // FetchCategoryDropdown();
        // const date = new Date().toISOString().split('T')[0];
        // setmaxCreatedDate(date);
        // setminWarrantyEndingDate(date)
        // setDisposedDate(date);
        // FetchDepartmentDropDownData();
        // FetchLocationDropdown();
        // fetchPhysicalLocations();
        // fetchAssetID();
        fetchData();
        // FetchMachine() disabled: /OEEReport does not exist in this backend
        // (leftover from the OEE project) — the call always 404'd and the
        // Machine dropdown stayed empty either way.

    }, []);
    const [Machinedropdown, SetMachinedropdown] = useState([])
    const FetchMachine = async () => {
        try {
            const alldata = { FromDate: '', ToDate: '', Machineid: '', ShiftEndTime: '', ShiftStartTime: '', Plant: '', mode: 'fetchMachine' };
            const response = await axios.post(`${API_URL}/OEEReport`, alldata);
            console.log("Machine Details:", response.data);
            SetMachinedropdown(response.data);

        } catch (err) {
            console.error("Error fetching data:", err);
        }
    };
    const [rowData, setRowData] = useState([]);
    const fetchData = async () => {
        // setLoading(true)
        const alldata = {
            mode: 'FetchDevice', SequenceNo: '', BranchID: '', DeviceID: '', DeviceName: '', Floor: '', IPaddress: '', MACaddress: '', MachineID: ''
            , DeviceType: '', ReaderType: '', AllowDoorLock: '', LockDoor: '', Alarm: '', ManufactureName: '', LastSeqNumber: '', Active: ''
            , AntennaID: '', RoomType: ''
        }
        try {
            const response = await axios.post(`${API_URL}/DeviceRegisterInfo`, alldata);
            setRowData(response.data);
            // console.log(response.data)
            if (response.status === 200) {
                // setLoading(false)
            }
        } catch (error) {
            // setLoading(false)
            console.error('Error fetching user details:', error);
        }
    };
    // const fetchAssetID = async () => {
    //     try {
    //         const UpdateData = { mode: 'FetchAssetID' }
    //         const alldata = { ...UpdateData, ...inputdata }
    //         const response = await axios.post(`${API_URL}/NewRegister`, alldata)
    //         const PrefixSuffix = response.data[0].PrefixSuffix
    //         // console.log(PrefixSuffix)
    //         setRegister({
    //             ...Register,
    //             AssetID: PrefixSuffix
    //         })

    //     } catch (err) {
    //         console.log(err)
    //     }
    // }
    const handleChangeWarrantyEndingDate = (e) => {
        const warrantyMonths = parse = ''(e.target.value, 10);

        // Ensure there's a valid Purchase Date and the Warranty Period is a number
        if (Register.PDate && !isNaN(warrantyMonths)) {
            const purchaseDate = new Date(Register.PDate);  // Convert Purchase Date to Date object
            purchaseDate.setMonth(purchaseDate.getMonth() + warrantyMonths);  // Add Warranty Period in months

            // Format the resulting date to match the "yyyy-mm-dd" format
            const warrantyEndDate = purchaseDate.toISOString().split('T')[0];
            // const warrantyEndDate = purchaseDate
            console.log(warrantyEndDate)

            // Set the calculated Warranty Ending Date
            setRegister({ ...Register, WEndDate: warrantyEndDate, WPeriod: e.target.value });
            // console.log("Registerwdate",Register)
        }
        else {
            // If any data is missing or invalid, reset the Warranty Ending Date
            setRegister({ ...Register, WEndDate: "" });
        }
    };

    return (
        <Card style={{marginTop:'100px'}}>

            <CardHeader className='p-3 pro-header d-flex'>
                <h6 className='text-white text-nowrap'>Device Register</h6>
                <Link to='/Settings/RFIDReaderDeviceMaster'>
                    <button type="button" className="btn-close btn-close-white me-2" style={{ marginLeft: '1300px' }}></button>
                </Link>
            </CardHeader>

            <CardBody>
                <div className=" row mt-3">

                    <div className="col-lg-3">
                        <label>Device ID</label>
                        <input className='form-control' placeholder='Enter Device ID' onChange={(e) => setRegister({ ...Register, DeviceID: e.target.value })} />
                    </div>
                    <div className="col-lg-3">
                        <label>Device Name</label>
                        <input className='form-control' placeholder='Enter Device Name' onChange={(e) => setRegister({ ...Register, DeviceName: e.target.value })} />
                    </div>
                    <div className="col-lg-3">
                        <label>Floor</label>
                        <input className='form-control' placeholder='Enter Floor' onChange={(e) => setRegister({ ...Register, Floor: e.target.value })} />
                    </div>
                    <div className="col-lg-3">
                        <label>IP Address </label>
                        <input className='form-control' placeholder='Enter IP Address' onChange={(e) => setRegister({ ...Register, IPaddress: e.target.value })} />
                    </div>

                    <div className="col-lg-3 mt-3">
                        <label>MAC Address</label>
                        <input className="form-control mb-2  border border-2" placeholder='Enter MAC Address' type="text" onChange={(e) => setRegister({ ...Register, MACaddress: e.target.value })} />
                    </div>
                    {/* 
                    <div className="col-lg-3">
                        <label>Machine ID</label>
                        <Typeahead
                            type="text"
                            id="vendor2"
                            labelKey="mc_id"
                            options={Machinedropdown}
                            onKeyDown={(e) => {
                                const isSpecialChar = /[^A-Za-z0-9 ]/.test(e.key);
                                if (isSpecialChar) {
                                    e.preventDefault();
                                }
                            }}
                            onChange={(selected) => {
                                if (selected.length > 0) {
                                    const selectedValue = selected[0];
                                    setRegister({
                                        ...Register,
                                        MachineID: selectedValue.mc_id,
                                    });
                                } else {
                                    setRegister((prev) => ({ ...prev, MachineID: "" }));
                                }
                            }}
                            value={Register.MachineID}
                            // disabled={loading}
                            maxLength={100}
                        />
                    </div> */}

                    <div className="col-lg-3 mt-3">
                        <label>Device Type</label>
                        <input className="form-control mb-2  border border-2" placeholder='Enter Device Type'  type="text" onChange={(e) => setRegister({ ...Register, DeviceType: e.target.value })} />
                    </div>

                    <div className="col-lg-3 mt-3">
                        <label>Reader Type</label>
                        <input className="form-control mb-2  border border-2" placeholder='Enter Reader Type' type="text" onChange={(e) => setRegister({ ...Register, ReaderType: e.target.value })} />
                    </div>

                    <div className="col-lg-3 mt-3">
                        <label>Manufacture Name</label>
                        <input className="form-control mb-2  border border-2" placeholder='Enter Manufacture Name' type="text" onChange={(e) => setRegister({ ...Register, ManufactureName: e.target.value })} />
                    </div>

                    <div className="col-lg-3 mt-3">
                        <label>Antenna ID</label>
                        <input className="form-control mb-2  border border-2" placeholder='Enter Antenna ID' type="text" onChange={(e) => setRegister({ ...Register, AntennaID: e.target.value })} />
                    </div>

                    <div className="col-lg-3 mt-3">
                        <label>Room Type</label>
                        <input className="form-control mb-2  border border-2"  placeholder='Enter Room Type' type="text" onChange={(e) => setRegister({ ...Register, RoomType: e.target.value })} />
                    </div>

                </div>

            </CardBody>
            <CardFooter>
                <div className='d-flex justify-content-center  col-lg-10 '>
                    {/* <Link className='btn btn-primary col-lg-2 col-xl-3' to='/Settings/RFIDReaderDeviceMaster'><i className="bi bi-reply-fill me-1"></i>back to Details</Link> */}
                    <button className='btn btn-success col-lg-2' onClick={() => handlecheck()} ><i className="bi bi-check-circle me-1"></i>Save </button>
                </div>
            </CardFooter>



        </Card>
    )
}


AddRegister.propTypes = {
    auth: PropTypes.any.isRequired,
};

export default AddRegister
