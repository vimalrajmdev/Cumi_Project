import axios from 'axios';
import PropTypes from 'prop-types';
import React, { useState, useRef, useEffect } from 'react';
import { Card, CardBody, CardHeader, Col, Row } from 'react-bootstrap';
import { Typeahead } from 'react-bootstrap-typeahead';
import Swal from 'sweetalert2';
import { getConfig } from 'src/config';
import {
    VerticalTimeline,
    VerticalTimelineElement,
} from "react-vertical-timeline-component";
import "react-vertical-timeline-component/style.min.css";
import {
    FaTools,
    FaExchangeAlt,
    FaUserCheck,
    FaUserTimes,
    FaClipboardList,
    FaCheckCircle,
} from "react-icons/fa";


const AssetAudit = ({ auth }) => {


    const colorMap = {
        asset: "linear-gradient(135deg, #1E90FF, #00BFFF)",
        maintenance: "linear-gradient(135deg, #009688, #00BCD4)",
        maintenanceDone: "linear-gradient(135deg, #1565C0, #42A5F5)",
        transfer: "linear-gradient(135deg, #6A1B9A, #9C27B0)",
        allocate: "linear-gradient(135deg, #2E7D32, #4CAF50)",
        release: "linear-gradient(135deg, #E64A19, #FF7043)",
    };

    const iconStyle = (color) => ({
        background: color,
        color: "#fff",
        boxShadow: "0 0 0 4px rgba(255,255,255,0.3)",
    });

    const boxStyle = {
        color: "#fff",
        borderRadius: "12px",
        boxShadow: "0px 3px 12px rgba(0,0,0,0.1)",
        padding: "15px 20px",
    };



    const API_URL = getConfig().REACT_APP_API_URL;
    const [show, setShow] = useState(false);
    const [TransferData, setTransferData] = useState([]);
    const [Register, setRegister] = useState({ RFIDnumber: '' });
    const [data, setData] = useState([]);
    const [Maintenancedata, setMaintenancedata] = useState([]);
    const [MaintenanceDonedata, setMaintenanceDonedata] = useState([]);
    const PartRef = useRef(null)
    const [RFID, setRFID] = useState(false)
    const [ID, setID] = useState(false)
    const [AllocatedData, setAllocatedData] = useState([]);
    const [ReleaseData, setReleaseData] = useState([]);

    const [select, setSelect] = useState({
        RFIDnumber: '',
    });

    const HandleSearch = async (selected) => {
        // if (Register.RFIDnumber === '') {
        //     Swal.fire({
        //         icon: 'warning',
        //         title: 'Please Fill RFID number After Search'
        //     });
        //     return;
        // }
        // console.log({ RFIDnumber: selected[0].RFIDnumber });
        if (selected.length === 0) {
            setShow(false);
            setData([]);
            setMaintenancedata([]);
            setID(false)
            setMaintenanceDonedata([]);
            setTransferData([]);
        }
        if (selected.length > 0) {
            try {
                const response = await axios.post(`${API_URL}/AuditForAsset`, { RFIDnumber: selected[0].RFIDnumber, branchid: auth.branchid, BranchAccess: auth.BranchAccess });
                if (response.status === 200) {
                    setShow(true);
                    const fetchedData = response.data.send;
                    setData(fetchedData);
                    const fetchedData2 = response.data.send2;
                    setMaintenancedata(fetchedData2);
                    setID(true)
                    const fetchedData3 = response.data.send3;
                    setMaintenanceDonedata(fetchedData3);
                    const fetchedData4 = response.data.send4;
                    setTransferData(fetchedData4);
                    console.log('fetchedData4', fetchedData4);



                }
            } catch (err) {
                console.log(err);
                Swal.fire({
                    icon: 'error',
                    title: 'RFID Not Valid'
                })
            }
        }
    };
    const HandleSearch1 = async (selected) => {
        // if (Register.RFIDnumber === '') {
        //     Swal.fire({
        //         icon: 'warning',
        //         title: 'Please Fill RFID number After Search'
        //     });
        //     return;
        // }
        // console.log({ RFIDnumber: selected[0].RFIDnumber });
        if (selected.length === 0) {
            setShow(false);
            setData([]);
            setMaintenancedata([]);
            setRFID(false)
            setMaintenanceDonedata([]);
            setTransferData([]);
            setAllocatedData([]);
            setReleaseData([]);
        }
        if (selected.length > 0) {
            try {
                console.log('selected[0].AssetID',selected[0].AssetID);
                
                const response = await axios.post(`${API_URL}/AuditForAsset`, { RFIDnumber: selected[0].AssetID, branchid: auth.branchid, BranchAccess: auth.BranchAccess });
                if (response.status === 200) {
                    setShow(true);
                    const fetchedData = response.data.send;
                    setData(fetchedData);
                    const fetchedData2 = response.data.send2;
                    setMaintenancedata(fetchedData2);
                    // console.log(fetchedData2);
                    setRFID(true)
                    const fetchedData3 = response.data.send3;
                    setMaintenanceDonedata(fetchedData3);
                    const fetchedData4 = response.data.send4;
                    setTransferData(fetchedData4);

                    const fetchedData5 = response.data.send5;
                    setAllocatedData(fetchedData5);
                    console.log("🚀 ~ HandleSearch1 Allocated ~ fetchedData5:", fetchedData5)

                    const fetchedData6 = response.data.send6;
                    setReleaseData(fetchedData6);
                    console.log("🚀 ~ HandleSearch1 Release ~ fetchedData6:", fetchedData6)



                }
            } catch (err) {
                console.log(err);
                Swal.fire({
                    icon: 'error',
                    title: 'RFID Not Valid'
                })
            }
        }
    };
    // const handleKey = (e) => {
    //     if (e.key === 'Enter') {
    //         e.preventDefault()
    //         HandleSearch();
    //     }
    // }

    useEffect(() => {
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
    return (
        <div>
            <Card>
                <CardHeader className='pro-header'>
                    <div className='d-flex justify-content-center text-center text-center'>
                        <i class="bi bi-clock-history fs-4 ms-2 text-white me-2 "></i> <h3 className='text-white'>Asset History </h3>
                    </div>
                </CardHeader>
                <CardBody>
                    <Row className='mt-3'>
                        {/* <Col xl={4} lg={4}>
                    <label>RFID Number</label>
                    {RFID ?
                        <input className='form-control' maxLength='24' value={Register.RFIDnumber} disabled />
                        :
                        <Typeahead
                            ref={PartRef}
                            id="basic-typeahead-single"
                            labelKey="RFIDnumber"
                            onChange={(selected) => {
                                HandleSearch(selected)
                            }}
                            options={RFIDdropdown.filter(opt => opt.RFIDnumber !== "N/A")}
                            placeholder="Select RFID"
                        />
                    }


                </Col>
                <Col xl={4} lg={4}>
                    <label>Asset ID</label>
                    {ID ?
                        <input className='form-control' value={Register.AssetID} disabled />
                        :
                        <Typeahead
                            ref={PartRef}
                            id="basic-typeahead-single"
                            labelKey="AssetID"
                            onChange={(selected) => {
                                HandleSearch1(selected)
                            }}
                            options={RFIDdropdown}
                            placeholder="Select Asset ID"
                        />
                    }


                </Col> */}
                        <Col xl={4} lg={4}>
                            <label className="form-label">Select Asset ID / RFID</label>
                            <Typeahead
                                id="branch-typeahead"
                                labelKey={(option) => `${option.AssetID} / ${option.RFIDnumber}`}
                                options={RFIDdropdown}
                                placeholder="Select a Asset ID / RFID..."
                                onChange={(selected) => {
                                    if (selected.length > 0) {
                                        HandleSearch1(selected);
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

                                                HandleSearch1(selected);

                                            }
                                        }
                                    }}
                                selected={select.AssetID ? RFIDdropdown.filter(item => item.AssetID === select.AssetID) : []}
                                required
                                clearButton
                            />
                        </Col>
                    </Row>
                </CardBody>
            </Card>
            <div className="mt-3">
                {show ? (
                    <>
                        <div className="text-center mb-3">
                            <h5 className="fw-bold text-dark">Asset Activity</h5>
                        </div>

                        <VerticalTimeline>
                            {/* Asset Registered */}
                            {data.map((item, i) => (
                                <VerticalTimelineElement
                                    key={i}
                                    contentStyle={{
                                        ...boxStyle,
                                        background: colorMap.asset, // custom background for each element
                                    }}
                                    contentArrowStyle={{
                                        borderRight: "7px solid #1E90FF", // arrow color
                                    }}
                                    date={<span style={{ color: "#070707ff", fontWeight: "500" }}>{item.CreatedDate}</span>} // dark color for date
                                    iconStyle={iconStyle("#1E90FF")} // icon background color
                                    icon={<FaClipboardList />} // icon
                                >
                                    <h5 className="text-white">Asset RFID: {item.RFIDnumber}</h5>
                                    <p>
                                        Enrolled Date: <b className="">{item.CreatedDate}</b>
                                    </p>
                                    <span className="badge bg-light text-dark">{item.Activity}</span>
                                </VerticalTimelineElement>

                            ))}

                            {/* Maintenance Registered */}
                            {Maintenancedata.map((item2, i) => (
                                <VerticalTimelineElement
                                    key={i}
                                    contentStyle={{
                                        ...boxStyle,
                                        background: colorMap.maintenance, // custom background for maintenance
                                    }}
                                    contentArrowStyle={{
                                        borderRight: "7px solid #009688", // arrow color
                                    }}
                                    date={<span style={{ color: "#070707ff", fontWeight: "500" }}>{item2.MaintenanceRegDate}</span>} // dark date
                                    iconStyle={iconStyle("#009688")} // icon background
                                    icon={<FaTools />} // icon
                                >
                                    <h5 className="text-white">Maintenance Registered</h5>
                                    <p>
                                        Date: <b className="text-dark">{item2.MaintenanceRegDate}</b>
                                    </p>
                                    <p>
                                        Vendor: <b className="text-dark">{item2.Vendors}</b>
                                    </p>
                                    <span className="badge bg-danger">Status: {item2.Status}</span>
                                </VerticalTimelineElement>
                            ))}


                            {/* Maintenance Done */}
                            {MaintenanceDonedata.map((item3, i) => (
                                <VerticalTimelineElement
                                    key={i}
                                    contentStyle={{
                                        ...boxStyle,
                                        background: colorMap.maintenanceDone,
                                    }}
                                    contentArrowStyle={{
                                        borderRight: "7px solid #1565C0",
                                    }}
                                    date={<span style={{ color: "#070707ff", fontWeight: "500" }}>{item3.MaintenanceDoneRegDate}</span>} // dark color for date

                                    // date={item3.MaintenanceDoneRegDate}
                                    iconStyle={iconStyle("#1565C0")}
                                    icon={<FaCheckCircle />}
                                >
                                    <h5>Post Maintenance</h5>

                                    <p>Date: <b>{item3.MaintenanceDoneRegDate}</b></p>
                                    <p>Activity: {item3.Activity}</p>
                                    <p>Cost: ₹{item3.MaintenanceCost}</p>
                                </VerticalTimelineElement>
                            ))}

                            {/* Transfer */}
                            {TransferData.map((item4, i) => (
                                <VerticalTimelineElement
                                    key={i}
                                    contentStyle={{
                                        ...boxStyle,
                                        background: colorMap.transfer,
                                    }}
                                    contentArrowStyle={{
                                        borderRight: "7px solid #6A1B9A",
                                    }}
                                    date={<span style={{ color: "#070707ff", fontWeight: "500" }}>{item4.CreatedDate}</span>} // dark color for date

                                    // date={item4.CreatedDate}
                                    iconStyle={iconStyle("#6A1B9A")}
                                    icon={<FaExchangeAlt />}
                                >
                                    <h5 className='text-white'>Transfer Location</h5>
                                    <p>Date: <b>{item4.CreatedDate}</b></p>
                                    <p>
                                        <b>Old:</b> {item4.Location}{" "}
                                        <span className="badge bg-light text-dark">
                                            {item4.oldBuilding} {item4.oldFloor} {item4.oldRoom}
                                        </span>
                                    </p>
                                    <p>
                                        <b>New:</b> {item4.NewLocation}{" "}
                                        <span className="badge bg-light text-dark">
                                            {item4.NewBuilding} {item4.NewFloor} {item4.NewRoom}
                                        </span>
                                    </p>
                                </VerticalTimelineElement>
                            ))}

                            {/* Allocated */}
                            {AllocatedData.map((item5, i) => (
                                <VerticalTimelineElement
                                    key={i}
                                    contentStyle={{
                                        ...boxStyle,
                                        background: colorMap.allocate,
                                    }}
                                    contentArrowStyle={{
                                        borderRight: "7px solid #2E7D32",
                                    }}
                                    date={<span style={{ color: "#070707ff", fontWeight: "500" }}>{item5.Createddate}</span>} // dark color for date

                                    // date={item5.Createddate}
                                    iconStyle={iconStyle("#2E7D32")}
                                    icon={<FaUserCheck />}
                                >
                                    <h5 className='text-white'>Allocated</h5>
                                    <p>Date: <b>{item5.Createddate}</b></p>
                                    <p>Asset ID: {item5.AssetID}</p>
                                    <p>Employee ID: {item5.EmployeeId}</p>
                                </VerticalTimelineElement>
                            ))}

                            {/* Released */}
                            {ReleaseData.map((item6, i) => (
                                <VerticalTimelineElement
                                    key={i}
                                    contentStyle={{
                                        ...boxStyle,
                                        background: colorMap.release,
                                    }}
                                    contentArrowStyle={{
                                        borderRight: "7px solid #E64A19",
                                    }}
                                    date={<span style={{ color: "#070707ff", fontWeight: "500" }}>{item6.Createddate}</span>} // dark color for date

                                    // date={item6.Createddate}
                                    iconStyle={iconStyle("#E64A19")}
                                    icon={<FaUserTimes />}
                                >
                                    <h5>Recover</h5>
                                    <p>Date: <b>{item6.Createddate}</b></p>
                                    <p>Asset ID: {item6.AssetID}</p>
                                    <p>Employee ID: {item6.EmployeeId}</p>
                                </VerticalTimelineElement>
                            ))}
                        </VerticalTimeline>

                        {/* Warranty Info */}
                        {data.length > 0 && (
                            <div className="text-center mt-4">
                                <h6 className="fw-bold text-secondary">Warranty End Date</h6>
                                <span className="badge bg-light text-dark">
                                    {data[0].WEndDate === "undefined"
                                        ? "Not Applicable"
                                        : data[0].WEndDate}
                                </span>
                            </div>
                        )}

                    </>
                ) : (
                    <div className="text-center" style={{ marginTop: "100px" }}>
                        <h5>Please enter RFID or Asset ID to view Asset History</h5>
                        <p style={{ fontSize: "16px", color: "#888" }}>
                            Enter the required details to view the activity timeline and history
                            of the asset.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

AssetAudit.propTypes = {
    auth: PropTypes.any.isRequired,
};

export default AssetAudit;
