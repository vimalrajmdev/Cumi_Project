import React, { useState, useRef, useEffect } from 'react';
import Swal from 'sweetalert2';
import axios from 'axios';
import secureLocalStorage from 'react-secure-storage';
import { Html5Qrcode } from 'html5-qrcode';

const API_URL = 'http://localhost:3601/api/prod';

const QRCodeCreation = () => {
    const [scanningMode, setScanningMode] = useState(null); // 'camera' or null
    const [scannedPOs, setScannedPOs] = useState([]); // Array to hold multiple PO numbers
    
    const scannerRef = useRef(null);
    const fileInputRef = useRef(null);

    const authConfig = {
        headers: { Authorization: `Bearer ${secureLocalStorage.getItem('token')}` }
    };

    // Handle Scan Result - Add to list
    const handleScanResult = (decodedText) => {
        setScannedPOs(prev => {
            if (!prev.includes(decodedText)) {
                Swal.fire({
                    title: 'PO Added!',
                    text: `PO Number: ${decodedText} added to list.`,
                    icon: 'success',
                    timer: 1500,
                    showConfirmButton: false
                });
                return [...prev, decodedText];
            } else {
                Swal.fire({
                    title: 'Duplicate',
                    text: `PO Number: ${decodedText} is already in the list.`,
                    icon: 'info',
                    timer: 1500,
                    showConfirmButton: false
                });
                return prev;
            }
        });
    };

    // =========== CAMERA SCAN LOGIC ===========
    useEffect(() => {
        if (!scanningMode) return undefined;

        const html5QrCode = new Html5Qrcode("qr-reader");
        scannerRef.current = html5QrCode;

        html5QrCode.start(
            { facingMode: "environment" },
            { fps: 10, qrbox: 250 },
            (decodedText) => {
                handleScanResult(decodedText);
                // Do NOT stop camera after scan, so user can scan next PO immediately
            },
            (errorMessage) => {
                // Ignore continuous errors (no QR in frame)
            }
        ).catch(err => {
            Swal.fire('Camera Error', 'Could not access camera. Check permissions.', 'error');
            setScanningMode(null);
        });

        // Cleanup on unmount or mode change
        return () => {
            if (scannerRef.current && scannerRef.current.isScanning) {
                scannerRef.current.stop().then(() => scannerRef.current.clear()).catch(() => {});
            }
        };
    }, [scanningMode]);

    const startCamera = () => {
        setScanningMode('camera');
    };

    const stopCamera = () => {
        if (scannerRef.current && scannerRef.current.isScanning) {
            scannerRef.current.stop().then(() => scannerRef.current.clear()).catch(() => {});
        }
        setScanningMode(null);
    };

    // =========== IMAGE UPLOAD SCAN LOGIC ===========
    const handleImageUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        if (!document.getElementById("qr-reader-file")) {
            const div = document.createElement("div");
            div.id = "qr-reader-file";
            div.style.display = "none";
            document.body.appendChild(div);
        }

        const html5QrCode = new Html5Qrcode("qr-reader-file");
        
        try {
            const decodedText = await html5QrCode.scanFile(file, false);
            handleScanResult(decodedText);
        } catch (err) {
            Swal.fire('Scan Failed', 'Could not read QR code from this image.', 'error');
        } finally {
            html5QrCode.clear();
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    // =========== SAVE ALL SCANNED POs TO DB ===========
    const handleSaveAll = async () => {
        if (scannedPOs.length === 0) {
            Swal.fire('Empty List', 'Please scan at least one PO QR code.', 'warning');
            return;
        }

        try {
            for (let po of scannedPOs) {
                await axios.post(`${API_URL}/qr-data`, {
                    poNumber: po,
                    itemName: 'N/A', // Default value since we are only scanning PO
                    itemQuantity: 0  // Default value
                }, authConfig);
            }

            Swal.fire('Saved!', `${scannedPOs.length} PO Numbers saved to database.`, 'success');
            setScannedPOs([]); // Clear list after saving
        } catch (error) {
            Swal.fire('Error', 'Failed to save PO data to database.', 'error');
        }
    };

    const removePO = (po) => {
        setScannedPOs(prev => prev.filter(p => p !== po));
    };

    return (
        <div className="mt-4">
            <div className="card">
                <div className="card-header d-flex justify-content-between align-items-center" style={{ background: '#106FB2' }}>
                    <h4 className="mb-0 text-white">Scan PO QR Codes</h4>
                </div>
                <div className="card-body py-4">
                    
                    <div className="row g-4">
                        {/* Left Column: Scan Actions */}
                        <div className="col-md-5">
                            <h5 className="mb-3 text-primary border-bottom pb-2">Scan Options</h5>
                            
                            {/* Camera Scanner Controls */}
                            <div className="d-flex gap-2 mb-4">
                                {!scanningMode ? (
                                    <button className="btn btn-primary" onClick={startCamera}>
                                        <i className="bi bi-camera-video me-2"></i> Start Camera
                                    </button>
                                ) : (
                                    <button className="btn btn-danger" onClick={stopCamera}>
                                        <i className="bi bi-x-lg me-2"></i> Stop Camera
                                    </button>
                                )}
                            </div>

                            {/* Camera View */}
                            {scanningMode && (
                                <div className="mb-4 text-center border p-3 rounded bg-light">
                                    <div id="qr-reader" style={{ width: '100%', maxWidth: '350px', margin: '0 auto' }}></div>
                                    <p className="mt-2 text-muted small">Point camera at QR Codes one by one...</p>
                                </div>
                            )}

                            {/* Image Upload Scanner */}
                            <h6 className="text-muted mb-2">Or Upload QR Image</h6>
                            <input 
                                type="file" 
                                ref={fileInputRef}
                                className="form-control" 
                                accept="image/*" 
                                onChange={handleImageUpload} 
                            />
                            <p className="mt-2 text-muted small">Upload an image of the QR code to extract PO Number.</p>
                        </div>

                        {/* Right Column: Scanned Results List */}
                        <div className="col-md-7">
                            <div className="d-flex justify-content-between align-items-center mb-3 border-bottom pb-2">
                                <h5 className="text-primary mb-0">Scanned PO List ({scannedPOs.length})</h5>
                                <button 
                                    className="btn btn-success btn-sm" 
                                    onClick={handleSaveAll}
                                    disabled={scannedPOs.length === 0}
                                >
                                    <i className="bi bi-check2-circle me-2"></i> Save All to DB
                                </button>
                            </div>
                            
                            <div className="table-responsive" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                                <table className="table table-bordered table-hover align-middle">
                                    <thead className="table-dark sticky-top">
                                        <tr>
                                            <th style={{ width: '10%' }}>S.No</th>
                                            <th>PO Number</th>
                                            <th style={{ width: '15%' }}>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {scannedPOs.length === 0 ? (
                                            <tr>
                                                <td colSpan="3" className="text-center text-muted py-4">
                                                    No PO Numbers scanned yet. Start scanning to add to the list.
                                                </td>
                                            </tr>
                                        ) : (
                                            scannedPOs.map((po, index) => (
                                                <tr key={index}>
                                                    <td>{index + 1}</td>
                                                    <td className="fw-bold text-success">{po}</td>
                                                    <td>
                                                        <button className="btn btn-sm btn-outline-danger" onClick={() => removePO(po)}>
                                                            <i className="bi bi-trash"></i>
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default QRCodeCreation;