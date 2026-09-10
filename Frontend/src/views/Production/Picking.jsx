import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import axios from 'axios';
import secureLocalStorage from 'react-secure-storage';

const API_URL = 'http://localhost:3601/api/prod';

const Picking = () => {
    const [workOrders, setWorkOrders] = useState([]);
    const [locations, setLocations] = useState([]);
    const [selectedWOId, setSelectedWOId] = useState('');
    const [selectedLocation, setSelectedLocation] = useState('');

    const authConfig = { headers: { Authorization: `Bearer ${secureLocalStorage.getItem('token')}` } };

    const fetchData = async () => {
        try {
            const [woRes, locRes] = await Promise.all([
                axios.post(`${API_URL}/workorders`, { mode: 'S' }, authConfig),
                axios.get(`${API_URL}/locations`, authConfig)
            ]);
            setWorkOrders(woRes.data);
            setLocations(locRes.data);
        } catch (error) {
            console.error("Failed to fetch data:", error);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Find the selected work order details
    const currentWO = workOrders.find((wo) => wo.Id === parseInt(selectedWOId));

    const handlePick = () => {
        if (!currentWO || !selectedLocation) {
            Swal.fire('Incomplete', 'Please select Work Order and Location.', 'warning');
            return;
        }
        Swal.fire('Picked!', `Item ${currentWO.ItemName} picked for ${currentWO.PONumber} at ${selectedLocation}.`, 'success');
    };

    return (
        <div className="mt-4">
            <div className="card">
                <div className="card-header d-flex justify-content-between align-items-center" style={{ background: '#106FB2' }}>
                    <h4 className="mb-0 text-white d-flex align-items-center gap-2">
                        <i className="bi bi-box-seam"></i> Picking List
                    </h4>
                </div>
                <div className="card-body py-4">
                    <div className="row g-3 mb-4">
                        <div className="col-md-6 col-12">
                            <label className="form-label fw-bold">Select Work Order / PO Number <span className="text-danger">*</span></label>
                            <select 
                                className="form-select" 
                                value={selectedWOId} 
                                onChange={(e) => setSelectedWOId(e.target.value)}
                            >
                                <option value="">Select Work Order</option>
                                {workOrders.map((wo) => (
                                    <option key={wo.Id} value={wo.Id}>
                                        {wo.WONumber} — PO: {wo.PONumber}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="col-md-6 col-12">
                            <label className="form-label fw-bold">Select Location (Link Location Master) <span className="text-danger">*</span></label>
                            <select 
                                className="form-select" 
                                value={selectedLocation} 
                                onChange={(e) => setSelectedLocation(e.target.value)}
                            >
                                <option value="">Select Location</option>
                                {locations.map((loc) => (
                                    <option key={loc.Id} value={loc.name}>{loc.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="table-responsive mt-4">
                        <table className="table table-bordered table-hover align-middle">
                            <thead className="table-dark">
                                <tr>
                                    <th>S.No</th>
                                    <th>WO Number</th>
                                    <th>PO Number</th>
                                    <th>Item Name / Type</th>
                                    <th>Quantity</th>
                                    <th>Location</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {!currentWO ? (
                                    <tr>
                                        <td colSpan="7" className="text-center text-muted py-4">
                                            Select a Work Order to view item details.
                                        </td>
                                    </tr>
                                ) : (
                                    <tr>
                                        <td>1</td>
                                        <td>{currentWO.WONumber}</td>
                                        <td>{currentWO.PONumber}</td>
                                        <td className="fw-bold">{currentWO.ItemName}</td>
                                        <td className="fw-bold text-primary">{currentWO.OrderQuantity}</td>
                                        <td>{selectedLocation || 'Not Selected'}</td>
                                        <td>
                                            <button className="btn btn-success btn-sm" onClick={handlePick}>
                                                <i className="bi bi-check2-circle me-1"></i> Pick
                                            </button>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Picking;