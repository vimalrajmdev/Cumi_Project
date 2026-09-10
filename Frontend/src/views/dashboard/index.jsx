import React, { useEffect, useState } from 'react';
import "react-big-calendar/lib/css/react-big-calendar.css";
import { Row, Col, Card, Button, CardHeader, CardBody, CardFooter } from 'react-bootstrap';
import Chart from 'react-apexcharts';
import { Link } from 'react-router-dom';
import axios from 'axios';
import PropTypes from 'prop-types';
import SocialCard1 from 'src/components/Widgets/SocialCard1';
import { getConfig } from 'src/config';
import secureLocalStorage from 'react-secure-storage'
import { Typeahead } from 'react-bootstrap-typeahead';
import 'react-bootstrap-typeahead/css/Typeahead.css';
import { FaDatabase, FaUserCircle } from 'react-icons/fa';
import { BsArrowLeftRight, BsArrowsMove, BsController, BsLockFill, BsShieldX, BsTruck } from 'react-icons/bs';
import { TbLayoutDistributeHorizontalFilled } from 'react-icons/tb';
import { SiActivitypub } from 'react-icons/si';

const DashAnalytics = ({ auth, }) => {
  const API_URL = getConfig().REACT_APP_API_URL;
  const [pageData] = useState(() => {
    const data = secureLocalStorage.getItem("pageData");

    // ✅ Only parse if it's a string
    if (typeof data === 'string') {
      try {
        return JSON.parse(data);
      } catch (error) {
        console.warn("Invalid JSON. Returning empty object.");
        return {};
      }
    }

    // ✅ If already an object (your case), return as is
    return data || {};
  });
  // Dash Board Card 1 Details
  const [dashboard, setDashboard] = useState({
    totalAssets: 0,
    totalAssetValue: 0,
    withRFID: 0,
    withRFIDValue: 0,
    withoutRFID: 0,
    withoutRFIDValue: 0,
    underMaintenance: 0,
    dueDateCrossed: 0,
    maintenanceCost: 0,
    scrapAssets: 0
  });


  const [chartType, setChartType] = useState("Package");


  const [chartData, setChartData] = useState({
    type: 'donut',
    height: '350',
    options: {
      labels: [],
      dataLabels: { enabled: true },
      plotOptions: {
        pie: {
          expandOnClick: true,
          donut: {
            size: '47%',
            labels: { show: true }
          }
        }
      },
      legend: { position: 'bottom', show: true },
      tooltip: { theme: 'dark' },
      colors: [
        '#058cea', '#1cf3bc', '#f3ad1c', '#E4003A', '#1ce6f3', '#924f04', '#1cf3bc',
        '#2d8a75', '#f29b8f', '#4b66c5', '#dc35d6', '#7b4400', '#13a4a1', '#e2d70e',
        '#69c7d5', '#0d4075', '#f1a7d7', '#3b8d2d', '#00b8f2', '#7b1c3a', '#8f8f8f',
        '#56ca73', '#d97a47', '#ae77ff', '#f6a48e', '#b09a72', '#f1e140', '#8c7b02',
        '#40bfef', '#75c6da', '#1f4068', '#004c99', '#f9b57b', '#18b897'
      ],
      stroke: { width: 5 }
    },
    series: [],
  });


  const [chartData2, setChartData2] = useState({
    type: 'donut',
    height: '400',
    options: {
      labels: [],
      dataLabels: { enabled: true },
      plotOptions: {
        pie: {
          expandOnClick: true,
          donut: {
            size: '47%',
            labels: { show: true }
          }
        }
      },
      legend: { position: 'bottom', show: true },
      tooltip: { theme: 'dark' },
      colors: ['#058cea', '#1cf3bc', '#f3ad1c', '#E4003A', '#1ce6f3', '#924f04', '#1cf3bc',
        '#2d8a75', '#f29b8f', '#4b66c5', '#dc35d6', '#7b4400', '#13a4a1', '#e2d70e',
        '#69c7d5', '#0d4075', '#f1a7d7', '#3b8d2d', '#00b8f2', '#7b1c3a', '#8f8f8f',
        '#56ca73', '#d97a47', '#ae77ff', '#f6a48e', '#b09a72', '#f1e140', '#8c7b02',
        '#40bfef', '#75c6da', '#1f4068', '#004c99', '#f9b57b', '#18b897'],
      stroke: { width: 5 }
    },
    series: [],
  });

  const [chartData3, setChartData3] = useState({
    type: 'donut',
    height: '400',
    options: {
      labels: [],
      dataLabels: { enabled: true },
      plotOptions: {
        pie: {
          expandOnClick: true,
          donut: {
            size: '47%',
            labels: { show: true }
          }
        }
      },
      legend: { position: 'bottom', show: true },
      tooltip: { theme: 'dark' },
      colors: ['#058cea', '#1cf3bc', '#f3ad1c', '#E4003A', '#1ce6f3', '#924f04', '#1cf3bc',
        '#2d8a75', '#f29b8f', '#4b66c5', '#dc35d6', '#7b4400', '#13a4a1', '#e2d70e',
        '#69c7d5', '#0d4075', '#f1a7d7', '#3b8d2d', '#00b8f2', '#7b1c3a', '#8f8f8f',
        '#56ca73', '#d97a47', '#ae77ff', '#f6a48e', '#b09a72', '#f1e140', '#8c7b02',
        '#40bfef', '#75c6da', '#1f4068', '#004c99', '#f9b57b', '#18b897'],
      stroke: { width: 5 }
    },
    series: [],
  });

  const fetchDashboardCards = async () => {
    try {
      const { data } = await axios.post(`${API_URL}/dashboard/cards`, {
        departmentname: auth.departmentname,
        branchid: auth.branchid,
        BranchAccess: auth.BranchAccess
      });

      setDashboard({
        totalAssets: data.assets?.TotalAssets ?? 0,
        totalAssetValue: data.assets?.TotalAssetValue ?? 0,
        withRFID: data.assets?.WithRFID ?? 0,
        withRFIDValue: data.assets?.WithRFidValue ?? 0,
        withoutRFID: data.assets?.WithoutRFID ?? 0,
        withoutRFIDValue: data.assets?.WithOutRfidValue ?? 0,
        underMaintenance: data.maintenance?.UnderMaintenance ?? 0,
        dueDateCrossed: data.maintenance?.DueDateCrossed ?? 0,
        maintenanceCost: data.maintenanceCost?.MaintenanceCost ?? 0,
        scrapAssets: data.scrap?.ScrapAssets ?? 0
      });
    } catch (err) {
      console.error('Dashboard fetch failed', err);
    }
  };


  // GET INWARD & OUTWARD Details
  const [data, setData] = useState([]);
  const fetchMovement = async () => {
    try {
      const data = { mode: 'SM', departmentname: auth.departmentname, branchid: auth.branchid, BranchAccess: auth.BranchAccess }
      const response = await axios.post(`${API_URL}/Get_In_Out_data`, data)
      if (response.status === 200) {
        setData(response.data.send)
      }
    } catch (error) {
      console.log(error)
    }
  }
  const fetchUnAuthorizedDataMail = async () => {
    try {
      const data = { mode: 'UM', departmentname: auth.departmentname, branchid: auth.branchid, BranchAccess: auth.BranchAccess }
      const response = await axios.post(`${API_URL}/Get_In_Out_data`, data)

    } catch (error) {
      console.log(error)
    }
  }

  const [UnAuthorizedData, setUnAuthorizedData] = useState([]);
  const fetchUnAuthorizedData = async () => {
    try {
      const data = { mode: 'SUM', departmentname: auth.departmentname, branchid: auth.branchid, BranchAccess: auth.BranchAccess }
      const response = await axios.post(`${API_URL}/Get_In_Out_data`, data)
      if (response.status === 200) {
        setUnAuthorizedData(response.data.send)
      }
    } catch (error) {
      console.log(error)
    }
  }
  const [AuthorizedData, setAuthorizedData] = useState([]);
  const fetchAuthorizedData = async () => {
    try {
      const data = { mode: 'FetchAuthdata', departmentname: auth.departmentname, branchid: auth.branchid, BranchAccess: auth.BranchAccess }
      const response = await axios.post(`${API_URL}/Get_In_Out_data`, data)
      if (response.status === 200) {
        setAuthorizedData(response.data.send)
      }
    } catch (error) {
      console.log(error)
    }
  }

  const fetchChartData = async ({
    mode,
    labelKey,
    valueKey,
    setChartState,
    LocationRFID = ""
  }) => {
    try {
      const { data } = await axios.post(`${API_URL}/ChartDatas`, {
        mode,
        departmentname: auth.departmentname,
        branchid: auth.branchid,
        BranchAccess: auth.BranchAccess,
        LocationRFID
      });
      console.log("🚀 ~ fetchChartData ~ data:", data)

      const labels = data.map((item, index) =>
        item[labelKey] ? item[labelKey].toString() : `Unknown ${index + 1}`
      );

      const series = data.map(item =>
        item[valueKey] ?? 0
      );


      setChartState(prev => ({
        ...prev,
        options: {
          ...prev.options,
          labels
        },
        series
      }));
    } catch (err) {
      console.error(`${mode} chart fetch failed`, err);
    }
  };

  const loadAllCharts = (LocationRFID) => {
    fetchChartData({
      mode: 'PackageCount',
      labelKey: 'PackageName',
      valueKey: 'PackageWiseCount',
      setChartState: setChartData3,
      LocationRFID
    });
    fetchChartData({
      mode: 'GroupCount',
      labelKey: 'AssetGroupName',
      valueKey: 'GroupWiseCount',
      setChartState: setChartData2,
      LocationRFID
    });
    fetchChartData({
      mode: 'FloorCount',
      labelKey: 'FloorName',
      valueKey: 'FloorWiseCount',
      setChartState: setChartData,
      LocationRFID
    });


  };


  const [LocationDropDownData, SetLocationDropDownData] = useState([]);

  const [Register, setRegister] = useState({ LocationRFID: 'All', LocationCode: 'All' });

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


  // Live updates arrive over the dashboard WebSocket (pushed by the backend
  // only when data changes). The old 10-second REST polling is kept as an
  // automatic fallback for whenever the socket is down (server restart etc.).
  useEffect(() => {
    fetchDashboardCards();
    fetchMovement();
    FetchLocationDropdown();
    fetchUnAuthorizedData();
    fetchAuthorizedData();
    loadAllCharts(Register.LocationRFID);

    let ws = null;
    let wsOpen = false;
    let reconnectTimer = null;
    let disposed = false;

    const applyCards = (data) => {
      setDashboard({
        totalAssets: data.assets?.TotalAssets ?? 0,
        totalAssetValue: data.assets?.TotalAssetValue ?? 0,
        withRFID: data.assets?.WithRFID ?? 0,
        withRFIDValue: data.assets?.WithRFidValue ?? 0,
        withoutRFID: data.assets?.WithoutRFID ?? 0,
        withoutRFIDValue: data.assets?.WithOutRfidValue ?? 0,
        underMaintenance: data.maintenance?.UnderMaintenance ?? 0,
        dueDateCrossed: data.maintenance?.DueDateCrossed ?? 0,
        maintenanceCost: data.maintenanceCost?.MaintenanceCost ?? 0,
        scrapAssets: data.scrap?.ScrapAssets ?? 0
      });
    };

    const connect = () => {
      const token = secureLocalStorage.getItem('authToken');
      if (!token || disposed) return;
      const wsUrl = `${API_URL.replace(/^http/, 'ws')}/ws/dashboard?token=${encodeURIComponent(token)}`;
      ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        wsOpen = true;
        ws.send(JSON.stringify({
          type: 'subscribe',
          departmentname: auth.departmentname,
          branchid: auth.branchid,
          BranchAccess: auth.BranchAccess
        }));
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg.type === 'cards') applyCards(msg.data);
          else if (msg.type === 'movement') setData(msg.data || []);
          else if (msg.type === 'unauthorized') setUnAuthorizedData(msg.data || []);
          else if (msg.type === 'authorized') setAuthorizedData(msg.data || []);
          // sliding refresh delivered over the socket (a user watching the
          // dashboard makes no REST calls, so the header path never runs)
          else if (msg.type === 'token') secureLocalStorage.setItem('authToken', msg.data);
        } catch (err) {
          console.error('Bad dashboard socket message', err);
        }
      };

      ws.onclose = () => {
        wsOpen = false;
        if (!disposed) reconnectTimer = setTimeout(connect, 5000);
      };

      ws.onerror = () => ws.close();
    };
    connect();

    const interval = setInterval(() => {
      if (wsOpen) return; // socket is live — the server pushes updates
      fetchMovement();
      fetchDashboardCards();
      fetchUnAuthorizedData();
      fetchAuthorizedData();
      fetchUnAuthorizedDataMail();
    }, 10000);

    return () => {
      disposed = true;
      clearInterval(interval);
      clearTimeout(reconnectTimer);
      if (ws) ws.close();
    };
  }, [auth]);

  const locationOptions = [
    { LocationCode: "All", LocationRFID: "All", label: "All Location" },
    ...LocationDropDownData
  ];

  const formatINR = (value) => {
    if (!value) return 0;

    if (value >= 1_00_00_000) {
      return (value / 1_00_00_000).toFixed(2) + " Cr";
    }
    if (value >= 1_00_000) {
      return (value / 1_00_000).toFixed(2) + " L";
    }
    if (value >= 1_000) {
      return (value / 1_000).toFixed(2) + " K";
    }
    return value;
  };

  const formatDateTime = (value) => {
    if (!value) return "-";

    const date = new Date(value);
    if (isNaN(date)) return value;

    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, "0");
    const day = String(date.getUTCDate()).padStart(2, "0");

    const hh = String(date.getUTCHours()).padStart(2, "0");
    const mi = String(date.getUTCMinutes()).padStart(2, "0");
    const ss = String(date.getUTCSeconds()).padStart(2, "0");

    return `${day}-${month}-${year} ${hh}:${mi}:${ss}`;
  };

  const fetchPackageData = async (LocationRFID) => {
    try {
      const payload = {
        mode: 'PackageCount',
        departmentname: auth.departmentname,
        UserStatus: auth.UserStatus,
        branchid: auth.branchid,
        BranchAccess: auth.BranchAccess,
        LocationRFID: LocationRFID || ""  // 👈 Add this
      };

      const response = await axios.post(`${API_URL}/ChartDatas`, payload);
      const resCount = response.data;

      const labels = resCount.map(item => item.PackageName);
      const series = resCount.map(item => item.PackageWiseCount);

      setChartData3(prev => ({
        ...prev,
        options: { ...prev.options, labels },
        series
      }));

    } catch (error) {
      console.error('Error fetching Package-wise data:', error);
    }
  };

  const fetchFloorData = async (LocationRFID) => {
    try {
      const payload = {
        mode: 'FloorCount',
        departmentname: auth.departmentname,
        UserStatus: auth.UserStatus,
        branchid: auth.branchid,
        BranchAccess: auth.BranchAccess,
        LocationRFID: LocationRFID || ""
      };
      const response = await axios.post(`${API_URL}/ChartDatas`, payload);
      const resCount = response.data;

      const labels = resCount.map(item => item.Floor);
      const series = resCount.map(item => item.FloorWiseCount);

      setChartData(prev => ({
        ...prev,
        options: { ...prev.options, labels },
        series
      }));

    } catch (error) {
      console.error('Error fetching Category-wise data:', error);
    }
  };

  const fetchGroupData = async (LocationRFID) => {
    try {
      const payload = {
        mode: 'GroupCount',
        departmentname: auth.departmentname,
        UserStatus: auth.UserStatus,
        branchid: auth.branchid,
        BranchAccess: auth.BranchAccess,
        LocationRFID: LocationRFID || ""
      };
      const response = await axios.post(`${API_URL}/ChartDatas`, payload);
      const resCount = response.data;

      const labels = resCount.map(item => item.AssetGroupName);
      const series = resCount.map(item => item.GroupWiseCount);

      setChartData2(prev => ({
        ...prev,
        options: { ...prev.options, labels },
        series
      }));

    } catch (error) {
      console.error('Error fetching Group-wise data:', error);
    }
  };




  return (
    <React.Fragment>
      <div>
        <Row className="">
          {/* Registered Assets */}
          <Col md={6} xl={3} lg={6}>
            <Link to={"/ManageAsset/RegisterDetais"} style={{ textDecoration: "none" }}>
              <Card id='box-shadow'
                className="border-0 shadow-sm rounded-4 text-dark"
                style={{
                  background: "linear-gradient(135deg, #dceeff 0%, #b6d8ff 100%)",
                  position: "relative",
                  overflow: "hidden",
                  transition: "transform 0.3s ease",
                  cursor: "pointer",
                  padding: "0.55rem",
                  minHeight: "130px",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-5px)")}
                onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
              >
                <div
                  style={{
                    position: "absolute",
                    top: "-15px",
                    right: "-15px",
                    width: "70px",
                    height: "70px",
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #007bff50, #6610f250)",
                    zIndex: 0,
                  }}
                ></div>

                <Card.Body className="text-center position-relative p-1" style={{ zIndex: 1 }}>
                  <div
                    className="mx-auto mb-1 d-flex align-items-center justify-content-center"
                    style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "50%",
                      background: "linear-gradient(135deg, #007bff, #6610f2)",
                      color: "#fff",
                    }}
                  >
                    <FaDatabase size={18} />
                  </div>

                  <h6 className="text-secondary mb-0 text-dark" style={{ fontSize: "0.9rem" }}>
                    Registered Assets
                  </h6>

                  <h5 className="fw-bold mb-0" style={{ fontSize: "1.5rem" }}>
                    {dashboard.totalAssets}
                  </h5>

                  <h6 className="text-muted d-block mt-1  fw-semibold" style={{ fontSize: "0.80rem" }}>
                    Net Value: ₹ {formatINR(dashboard.totalAssetValue)}
                    {/* ₹ {TotalAssetValue?.toLocaleString()} */}
                  </h6>
                </Card.Body>
              </Card>
            </Link>
          </Col>

          {/* Assets With RFID */}
          <Col md={6} xl={3} lg={6}>
            <Link to={"/ManageAsset/WithRFID"}>
              <Card id='box-shadow'
                className="border-0 shadow-sm rounded-4 text-dark"
                style={{
                  background: "linear-gradient(135deg, #d8f5dd 0%, #b4ebc4 100%)",
                  position: "relative",
                  overflow: "hidden",
                  transition: "transform 0.3s ease",
                  cursor: "pointer",
                  padding: "0.55rem",
                  minHeight: "130px",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-5px)")}
                onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
              >
                <div
                  style={{
                    position: "absolute",
                    top: "-15px",
                    right: "-15px",
                    width: "70px",
                    height: "70px",
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #28a74550, #20c99750)",
                    zIndex: 0,
                  }}
                ></div>

                <Card.Body className="text-center position-relative p-1" style={{ zIndex: 1 }}>
                  <div
                    className="mx-auto mb-1 d-flex align-items-center justify-content-center"
                    style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "50%",
                      background: "linear-gradient(135deg, #28a745, #20c997)",
                      color: "#fff",
                    }}
                  >
                    <i className="bi bi-check-circle mt-1" style={{ fontSize: "1.2rem" }}></i>
                  </div>

                  <h6 className="text-secondary mb-0 text-dark" style={{ fontSize: "0.9rem" }}>
                    Assets With RFID
                  </h6>

                  <h5 className="fw-bold mb-0" style={{ fontSize: "1.5rem" }}>
                    {dashboard.withRFID}
                  </h5>

                  <h6 className="text-secondary mt-1 fw-semibold" style={{ fontSize: "0.80rem" }}>
                    Net Value: ₹ {formatINR(dashboard.withRFIDValue)}
                    {/* {WithRFIDValue?.toLocaleString()} */}
                  </h6>
                </Card.Body>
              </Card>
            </Link>
          </Col>

          {/* Assets Without RFID */}
          <Col md={6} xl={3} lg={6}>
            <Link to={"/ManageAsset/WithOutRFID"}>
              <Card
                className="border-0 shadow-sm rounded-4 text-dark"
                style={{
                  background: "linear-gradient(135deg, #ffd9dd 0%, #ffb3bd 100%)",
                  position: "relative",
                  overflow: "hidden",
                  transition: "transform 0.3s ease",
                  cursor: "pointer",
                  padding: "0.55rem",
                  minHeight: "130px",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-5px)")}
                onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
              >
                <div
                  style={{
                    position: "absolute",
                    top: "-15px",
                    right: "-15px",
                    width: "70px",
                    height: "70px",
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #dc354550, #6f42c150)",
                    zIndex: 0,
                  }}
                ></div>

                <Card.Body className="text-center position-relative p-1" style={{ zIndex: 1 }}>
                  <div
                    className="mx-auto mb-1 d-flex align-items-center justify-content-center"
                    style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "50%",
                      background: "linear-gradient(135deg, #dc3545, #6f42c1)",
                      color: "#fff",
                    }}
                  >
                    <i className="bi bi-exclamation-diamond mt-1" style={{ fontSize: "1.2rem" }}></i>
                  </div>

                  <h6 className="text-secondary mb-0 text-dark" style={{ fontSize: "0.9rem" }}>
                    Assets Without RFID
                  </h6>

                  <h5 className="fw-bold mb-0" style={{ fontSize: "1.5rem" }}>
                    {dashboard.withoutRFID}
                  </h5>

                  <h6 className="text-muted mt-1 fw-semibold" style={{ fontSize: "0.80rem" }}>
                    Net Value: ₹  {formatINR(dashboard.withoutRFIDValue)}
                    {/* {WithOutRFIDValue?.toLocaleString()} */}
                  </h6>
                </Card.Body>
              </Card>
            </Link>
          </Col>

          {/* Under Maintenance */}
          <Col md={6} xl={3} lg={6}>
            <Link to={"/Reports/MaintenanceReport"}>
              <Card
                className="border-0 shadow-sm rounded-4 text-dark"
                style={{
                  background: "linear-gradient(135deg, #fff3cd 0%, #ffe39a 100%)",
                  position: "relative",
                  overflow: "hidden",
                  transition: "transform 0.3s ease",
                  cursor: "pointer",
                  padding: "0.55rem",
                  minHeight: "130px",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-5px)")}
                onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
              >
                <div
                  style={{
                    position: "absolute",
                    top: "-15px",
                    right: "-15px",
                    width: "70px",
                    height: "70px",
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #ffc10750, #6f42c150)",
                    zIndex: 0,
                  }}
                ></div>

                <Card.Body className="text-center position-relative p-1" style={{ zIndex: 1 }}>
                  <div
                    className="mx-auto mb-1 d-flex align-items-center justify-content-center"
                    style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "50%",
                      background: "linear-gradient(135deg, #ffc107, #6f42c1)",
                      color: "#fff",
                    }}
                  >
                    <i className="bi bi-tools" style={{ fontSize: "1.1rem" }}></i>
                  </div>

                  <h6 className="text-secondary mb-0 text-dark" style={{ fontSize: "0.9rem" }}>
                    Under Maintenance
                  </h6>

                  <h5 className="fw-bold mb-0" style={{ fontSize: "1.7rem" }}>
                    {dashboard.underMaintenance}
                  </h5>

                  <small className="fw-bold text-muted" style={{ fontSize: "0.80rem" }}>
                    ⚠️ Due Date Crossed: {dashboard.dueDateCrossed}
                  </small>
                </Card.Body>
              </Card>
            </Link>
          </Col>
        </Row>

        <Row className="">

          {/* Category / SubCategory Chart */}
          <Col md={12} xl={5}>
            <Card className="shadow-lg border-0 rounded-4">
              <Card.Header className=" text-dark rounded-top  text-center" style={{ background: 'linear-gradient(to right, #F2F2F7)' }} >
                <h6 className="mb-0 text-dark " ><b><TbLayoutDistributeHorizontalFilled size={20} /> Asset Distribution</b></h6>
              </Card.Header>
              <Card.Body>
                <Typeahead
                  id="location-code-typeahead"
                  labelKey={(option) => option.LocationCode === "All"
                    ? "All Location"
                    : option.LocationCode
                  }

                  options={locationOptions}
                  placeholder="Select a Location Code..."
                  onChange={selected => {
                    const location = selected.length > 0 ? selected[0].LocationRFID : "";
                    const locationCode = selected.length > 0 ? selected[0].LocationCode : "";
                    setRegister(prev => ({ ...prev, LocationRFID: location, LocationCode: locationCode }));
                    // 👇 Fetch all charts again based on selected location
                    fetchPackageData(location);
                    fetchFloorData(location);
                    fetchGroupData(location);
                  }}
                  selected={
                    Register.LocationCode
                      ? locationOptions.filter(
                        (item) => item.LocationCode === Register.LocationCode
                      )
                      : []
                  }
                  className="flex-grow-1 mt-2"
                  required
                />

                {/* Toggle buttons inside the card */}
                <div className="d-flex justify-content-center gap-2 my-2 flex-wrap">
                  <button
                    className={`btn ${chartType === "Package" ? "btn-primary" : "btn-outline-primary"}`}
                    onClick={() => setChartType("Package")}
                  >
                    Package
                  </button>
                  <button
                    className={`btn ${chartType === "group" ? "btn-primary" : "btn-outline-primary"}`}
                    onClick={() => setChartType("group")}
                  >
                    Group
                  </button>
                  <button
                    className={`btn ${chartType === "Floor" ? "btn-primary" : "btn-outline-primary"}`}
                    onClick={() => setChartType("Floor")}
                  >
                    Floor
                  </button>
                </div>

                {/* Conditional Chart Rendering */}
                {chartType === "Package" && (
                  <>
                    <h6 className="text-center mb-3 text-secondary"><b>📄 Asset Distribution by Package</b></h6>
                    <Chart {...chartData3} />
                  </>
                )}

                {chartType === "group" && (
                  <>
                    <h6 className="text-center mb-3 text-secondary"><b>📄 Asset Distribution by Group-wise</b></h6>
                    <Chart {...chartData2} />
                  </>
                )}
                {chartType === "Floor" && (
                  <>
                    <h6 className="text-center mb-3 text-secondary"><b>📄 Asset Distribution by Floor-wise</b></h6>
                    <Chart {...chartData} />
                  </>
                )}
              </Card.Body>

            </Card>
            <Link to="/Reports/ScrapReport" style={{ textDecoration: "none" }}>
              <div
                className="rounded-4 shadow-sm p-4 d-flex align-items-center justify-content-between hover-scale"
                style={{
                  background: "white",
                  border: "1px solid #eee",
                  transition: "0.3s"
                }}
              >
                {/* Icon Box */}
                <div
                  className="d-flex align-items-center justify-content-center"
                  style={{
                    width: "50px",
                    height: "50px",
                    background: "#ffe6e6",
                    borderRadius: "12px"
                  }}
                >
                  <i className="bi bi-trash3" style={{ fontSize: "24px", color: "#d9534f" }}></i>
                </div>

                {/* Text Section */}
                <div className="ms-3 flex-grow-1">
                  <h4 className="mb-1 fw-bold text-danger">{String(dashboard.scrapAssets)}</h4>
                  <h6 className="mb-1 text-dark">Scrap Asset</h6>
                  <p className="text-muted mb-0" style={{ fontSize: "13px" }}>
                    Click here to view scrap asset report
                  </p>
                </div>

                {/* Arrow Icon */}
                <i className="bi bi-arrow-right-circle fs-4 text-secondary"></i>
              </div>
            </Link>


          </Col>

          {/* Asset Un-Authorized Movement */}
          <Col md={12} xl={7}>
            <Row className="">
              <Col sm={12}>
                <Card
                  className="rounded-4 shadow-sm border-0"
                  style={{
                    height: "370px",
                    background: "#ffffff",
                  }}
                >
                  {/* HEADER */}
                  <Card.Header
                    className="rounded-top text-center py-3"
                    style={{
                      background: "linear-gradient(90deg, #eef1f6, #f7f9fc)",
                      borderBottom: "1px solid #e3e6ee",
                    }}
                  >
                    <h5 className="mb-0 fw-bold text-dark">
                      <BsShieldX size={18} className="mb-1" /> Unauthorized Movement
                    </h5>
                  </Card.Header>

                  {/* BODY */}
                  <Card.Body className="p-0">
                    <div className="table-responsive" style={{ maxHeight: "300px" }}>
                      <table
                        className="table table-hover align-middle mb-0"
                        style={{
                          fontSize: "12.5px",
                          borderSpacing: 0,
                          borderCollapse: "separate",
                        }}
                      >
                        <thead
                          style={{
                            position: "sticky",
                            top: 0,
                            zIndex: 1,
                            background: "#f1f3f7",
                            color: "#333",
                            fontWeight: "600",
                            borderBottom: "1px solid #d9dce3",
                          }}
                        >
                          <tr>
                            <th className="px-3 py-2">Asset ID</th>
                            <th className="px-3 py-2">Asset Name</th>
                            <th className="px-3 py-2">Building</th>
                            <th className="px-3 py-2">Date & Time</th>
                            <th className="px-3 py-2">Status</th>
                          </tr>
                        </thead>

                        <tbody>
                          {UnAuthorizedData?.length > 0 ? (
                            UnAuthorizedData.map((item, index) => (
                              <tr key={index} className="table-row-custom">
                                <td className="px-3 fw-semibold">
                                  {item.AssetID || "—"}
                                </td>

                                <td
                                  className="px-3 fw-semibold text-wrap"
                                  title={item.AssetName || ""}
                                  style={{ maxWidth: "220px", wordBreak: "break-word" }}
                                >
                                  {item.AssetName || "—"}
                                </td>

                                <td
                                  className="px-3 fw-semibold text-wrap"
                                  title={item.building || ""}
                                  style={{ maxWidth: "260px", wordBreak: "break-word" }}
                                >
                                  {item.building || "—"}
                                </td>

                                <td className="px-3 fw-semibold">
                                  {formatDateTime(item.CreatedDate)}
                                </td>

                                <td className="px-3 fw-semibold">
                                  <span
                                    className={`badge rounded-pill px-3 py-2 shadow-sm ${item.Movement === "Un-Authorized"
                                      ? "bg-danger"
                                      : item.Movement === "Reg WithOut RFID"
                                        ? "bg-warning text-dark"
                                        : item.Movement === "UnderMaintenance"
                                          ? "bg-danger"
                                          : item.Movement === "Maintenance Done"
                                            ? "bg-success"
                                            : item.Movement === "Transfered Location"
                                              ? "bg-primary"
                                              : item.Movement === "Move to Scrap"
                                                ? "bg-danger"
                                                : item.Movement === "Asset Allocated"
                                                  ? "bg-info"
                                                  : "bg-secondary"
                                      }`}
                                    style={{ fontSize: "11px", minWidth: "110px", display: "inline-block" }}
                                  >
                                    {item.Movement || "Unknown"}
                                  </span>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan="5" className="text-center py-4 text-muted">
                                No unauthorized movements recorded
                              </td>
                            </tr>
                          )}
                        </tbody>

                      </table>
                    </div>
                  </Card.Body>
                </Card>
              </Col>

              <Col sm={12} >

                <Card className="rounded-4 shadow-sm border-0" style={{ height: "380px", backgroundColor: "#FAFAFA" }}>
                  <Card.Header
                    className="rounded-top text-center py-3"
                    style={{
                      background: "linear-gradient(90deg, #eef1f6, #f7f9fc)",
                      borderBottom: "1px solid #e3e6ee",
                    }}
                  >
                    <h5 className="mb-0 text-dark fw-bold">
                      <SiActivitypub size={20} className='me-1' />Real Time Operations Activity</h5>
                  </Card.Header>

                  <Card.Body className="p-0">
                    <div className="table-responsive" style={{ maxHeight: "330px" }}>
                      <table className="table table-hover align-middle mb-0" style={{ fontSize: "13px" }}>
                        <thead style={{ backgroundColor: "#F2F2F7" }} className="text-dark">
                          <tr>
                            <th >Asset ID</th>
                            <th>Asset Name</th>
                            <th>Date & Time</th>
                            <th>Status</th>
                          </tr>
                        </thead>

                        <tbody className="text-nowrap">
                          {data.map((item, index) => (
                            <tr key={index} style={{ cursor: "pointer" }}>
                              {/* RFID */}

                              {/* Asset ID */}
                              <td className="fw-semibold">{item.AssetID}</td>
                              <td className="px-3 fw-semibold">{item.AssetName}</td>
                              {/* Date */}
                              <td className="fw-semibold">{item.RegisterDate}</td>

                              {/* Status */}
                              <td className="px-3 fw-semibold">
                                <span
                                  className={`badge rounded-pill px-3 py-2 text-white shadow-sm ${item.Movement === "Reg With RFID"
                                    ? "bg-success"
                                    : item.Movement === "Reg WithOut RFID"
                                      ? "bg-warning text-dark"
                                      : item.Movement === "UnderMaintenance"
                                        ? "bg-danger"
                                        : item.Movement === "Maintenance Done"
                                          ? "bg-success"
                                          : item.Movement === "Transfered Location"
                                            ? "bg-primary"
                                            : item.Movement === "Move to Scrap"
                                              ? "bg-danger"
                                              : item.Movement === "Asset Allocated" ?
                                                "bg-info" : "bg-secondary"
                                    }`}
                                  style={{ fontSize: "11px" }}
                                >
                                  {item.Movement}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </Card.Body>
                </Card>

             



              </Col>



            </Row>
          </Col>

        </Row>
           <Card
                  className="rounded-4 shadow-sm border-0"
                  style={{
                    height: "370px",
                    background: "#ffffff",
                  }}
                >
                  {/* HEADER */}
                  <Card.Header
                    className="rounded-top text-center py-3"
                    style={{
                      background: "linear-gradient(90deg, #eef1f6, #f7f9fc)",
                      borderBottom: "1px solid #e3e6ee",
                    }}
                  >
                    <h5 className="mb-0 fw-bold text-dark">
                      <BsArrowsMove size={18} className="mb-1" /> Authorized Movement
                    </h5>
                  </Card.Header>

                  {/* BODY */}
                  <Card.Body className="p-0">
                    <div className="table-responsive" style={{ maxHeight: "300px" }}>
                      <table
                        className="table table-hover align-middle mb-0"
                        style={{
                          fontSize: "12.5px",
                          borderSpacing: 0,
                          borderCollapse: "separate",
                        }}
                      >
                        <thead
                          style={{
                            position: "sticky",
                            top: 0,
                            zIndex: 1,
                            background: "#f1f3f7",
                            color: "#333",
                            fontWeight: "600",
                            borderBottom: "1px solid #d9dce3",
                          }}
                        >
                          <tr>
                            <th className="px-3 py-2">Asset ID</th>
                            <th className="px-3 py-2">Asset Name</th>
                            <th className="px-3 py-2">Building</th>
                            <th className="px-3 py-2">Date & Time</th>
                            <th className="px-3 py-2">Status</th>
                          </tr>
                        </thead>

                        <tbody>
                          {AuthorizedData?.length > 0 ? (
                            AuthorizedData.map((item, index) => (
                              <tr key={index} className="table-row-custom">
                                <td className="px-3 fw-semibold">
                                  {item.AssetID || "—"}
                                </td>

                                <td
                                  className="px-3 fw-semibold text-wrap"
                                  title={item.AssetName || ""}
                                  style={{ maxWidth: "220px", wordBreak: "break-word" }}
                                >
                                  {item.AssetName || "—"}
                                </td>

                                <td
                                  className="px-3 fw-semibold text-wrap"
                                  title={item.building || ""}
                                  style={{ maxWidth: "260px", wordBreak: "break-word" }}
                                >
                                  {item.building || "—"}
                                </td>

                                <td className="px-3 fw-semibold">
                                  {formatDateTime(item.CreatedDate)}
                                </td>

                                <td className="px-3 fw-semibold">
                                  <span
                                    className={`badge rounded-pill px-3 py-2 shadow-sm ${item.Movement === "Authorized"
                                      ? "bg-success"
                                      : item.Movement === "Reg WithOut RFID"
                                        ? "bg-warning text-dark"
                                        : item.Movement === "UnderMaintenance"
                                          ? "bg-danger"
                                          : item.Movement === "Maintenance Done"
                                            ? "bg-success"
                                            : item.Movement === "Transfered Location"
                                              ? "bg-primary"
                                              : item.Movement === "Move to Scrap"
                                                ? "bg-danger"
                                                : item.Movement === "Asset Allocated"
                                                  ? "bg-info"
                                                  : "bg-secondary"
                                      }`}
                                    style={{ fontSize: "11px", minWidth: "110px", display: "inline-block" }}
                                  >
                                    {item.Movement || "Unknown"}
                                  </span>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan="5" className="text-center py-4 text-muted">
                                No authorized movements recorded
                              </td>
                            </tr>
                          )}
                        </tbody>

                      </table>
                    </div>
                  </Card.Body>
                </Card>
      </div>
    </React.Fragment>

  );
};
DashAnalytics.propTypes = {
  auth: PropTypes.any, // Replace 'any' with the appropriate type based on what 'auth' contains
};
export default DashAnalytics;
