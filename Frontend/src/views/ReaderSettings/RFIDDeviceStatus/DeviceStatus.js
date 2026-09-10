import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { CCard, CCardHeader, CCardBody, CRow, CCol, CContainer } from "@coreui/react";
import { FaQuestionCircle } from "react-icons/fa";
import { getConfig } from 'src/config';

const DeviceStatus = () => {
     const API_URL = getConfig().REACT_APP_API_URL;
  const [data, setData] = useState([]); // devices
  const [antennaStatusMap, setAntennaStatusMap] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await axios.post(`${API_URL}/Atennastatus`, {
        mode: "FetchAntenna",
        Id: "",
        LogTime: "",
      });

      if (response.status === 200) {
        setData(response.data); // device list     
        console.log('response.data', response.data);

        await processAllIPAddresses(response.data);
      }
    } catch (error) {
      setError("Failed to fetch antenna data");
      console.error("Error fetching user details:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAntennaStatus = async (IPaddress) => {
    try {
      const response = await axios.post(`${API_URL}/Atennastatus`, {
        mode: "AntennaStatus",
        ReaderIP: IPaddress,
        AntennaID: "",
        Id: "",
        LogTime: "",
      });

      if (response.status === 200) {
        console.log('response.data', response.data);

        setAntennaStatusMap((prev) => {
          const newMap = { ...prev };
          response.data.forEach((item) => {
            const key = `${item.IPaddress}-${item.AntennaID}`;
            newMap[key] = {
              status: item.Status,
              IPaddress: item.IPaddress || "N/A",
              AntennaID: item.AntennaID,
            };
          });
          return newMap;
        });
      }
    } catch (error) {
      console.error(`Error fetching status for IP ${IPaddress}:`, error);
    }
  };

  const processAllIPAddresses = async (ipList) => {
    const promises = ipList.map((item) =>
      fetchAntennaStatus(item.IPaddress).catch((error) => {
        console.error(`Error fetching status for IP ${item.IPaddress}:`, error);
        return null;
      })
    );
    await Promise.all(promises);
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
 <div>
      <h3
        className="text-xl font-semibold mb-2 text-center"
        style={{
          background: 'linear-gradient(90deg, #28285F 30%, #25d4aeff 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          fontFamily: 'Baskerville Old Face'
        }}
      >
        <FaQuestionCircle style={{ fontSize: "30px" }} className="mb-1 me-2" />
        RFID Device Status
      </h3>

      {isLoading && <p className="text-center">Loading...</p>}
      {error && <p className="text-danger text-center">{error}</p>}

      <CContainer fluid className="mt-4">
        <CRow className="g-4">
          {data.map((device) => {
            const headerColor =
              device.Status === "Active" ? "#28a745" : "#1a1c1fea";
            {/* <div
                style={{
                  backgroundImage:
                    device.Status === "Active"
                      ? "linear-gradient(to right, #28a745, #5be37d)"
                      : "linear-gradient(to right, #28285F 30%, #25d4aeff)",
                  color: "#fff", // optional text color
                  padding: "10px",
                  borderRadius: "8px",
                }}
              >
                {device.Status}
              </div> */}
            // filter antennas for this device
            const deviceAntennas = Object.entries(antennaStatusMap)
              .filter(([key]) => key.startsWith(device.IPaddress))
              .map(([_, val]) => val);

            return (
              <CCol xs={12} sm={6} md={4} lg={3} key={device.ID}>
                <CCard className="h-100 border shadow-sm">
                  <CCardHeader
                    className="text-white text-center fw-semibold py-2"
                    style={{ backgroundColor: headerColor }}
                  >
                    {device.DeviceName} <br />
                    <small>{device.IPaddress}</small>
                  </CCardHeader>

                  <CCardBody className="d-flex flex-wrap justify-content-between p-3">
                    {deviceAntennas.length > 0 ? (
                      deviceAntennas.map((ant) => {
                        const isActive = ant.status === "Active";
                        return (
                          <div
                            key={ant.AntennaID}
                            className="text-center rounded p-2 mb-2"
                            style={{
                              width: "48%",
                              backgroundColor: isActive
                                ? "#d4edda"
                                : "#f8d7da",
                              border: `2px solid ${isActive ? "#28a745" : "#dc3545"
                                }`,
                              fontWeight: "bold",
                            }}
                          >
                            <div style={{ fontSize: "1.5rem" }}>
                              {isActive ? "🟢" : "🔴"}
                            </div>
                            <div style={{ fontSize: "0.9rem" }}>
                              Antenna {ant.AntennaID}
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <p className="text-muted w-100 text-center">
                        No Antennas Found
                      </p>
                    )}
                  </CCardBody>
                </CCard>
              </CCol>
            );
          })}
        </CRow>
      </CContainer>
    </div>
  )
}

export default DeviceStatus
