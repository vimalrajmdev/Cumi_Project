import React, { useEffect, useRef, useState } from 'react'
import PropTypes from 'prop-types';
import Swal from 'sweetalert2';
import { Typeahead } from 'react-bootstrap-typeahead';
import axios from 'axios';
import { getConfig } from 'src/config';
import { CCard, CCardBody, CBadge } from "@coreui/react";
import { cilFile, cilFolderOpen } from '@coreui/icons';
import CIcon from '@coreui/icons-react';

const Attachments = ({ auth }) => {
    const API_URL = getConfig().REACT_APP_API_URL;
    const [RFIDdropdown, setRFIDdropdown] = useState([]);
    const [selectedAsset, setSelectedAsset] = useState(null);
    const [attachmentFiles, setAttachmentFiles] = useState([]);
    const PartRef1 = useRef(null)

    const fetchDataRFID = async () => {
        try {
            const data = {
                departmentname: auth.departmentname,
                mode: 'EnrolledAssets',
                branchid: auth.branchid,
                BranchAccess: auth.BranchAccess
            };
            const response = await axios.post(`${API_URL}/EnrolledAssetInfo`, data);
            setRFIDdropdown(response.data.send);
        } catch (error) {
            console.error('Fetch RFID Error:', error);
        }
    };

    useEffect(() => {
        fetchDataRFID();
    }, []);

    const fetchAttachments = async (selected) => {
        if (selected.length === 0) {
            setSelectedAsset(null);
            setAttachmentFiles([]);
            return;
        }

        const asset = selected[0];
        setSelectedAsset(asset);

        try {
            const response = await axios.post(`${API_URL}/GetAttachments`, {
                AssetID: asset.AssetID,
                mode: 'getFiles',
                branchid: auth.branchid
            });

            if (response.data.length === 0) {
                setAttachmentFiles([]);
                return;
            }

            setAttachmentFiles(response.data);
        } catch (err) {
            console.log(err);
        }
    };

    return (
        <div className="container py-3">

            {/* Header */}
            <h3 className="fw-bold mb-4 text-primary">
                <CIcon icon={cilFolderOpen} size="xl" className="me-2" />
                Asset Attachments
            </h3>

            {/* RFID Select */}
            <div className="col-lg-4 mb-4">
                <label className="form-label fw-semibold">Select Asset (RFID)</label>
                <Typeahead
                    ref={PartRef1}
                    id="rfid-select"
                    labelKey={(opt) => `${opt.RFIDnumber} / ${opt.AssetID}`}
                    onChange={fetchAttachments}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            const selected = PartRef1.current?.getInput().value;

                            if (selected) {
                                fetchAttachments([{ RFIDnumber: selected }]);
                            }
                        }
                    }}
                    options={RFIDdropdown}
                    placeholder="Choose an Asset"
                    className="w-100 shadow-sm"
                    clearButton
                />
            </div>

            {/* Asset Details */}
            {selectedAsset && (
                <CCard className="mb-4 border-0 asset-card">
                    <CCardBody>
                        <h5 className="fw-bold text-dark mb-3">
                            <i className="bi bi-box-seam me-2 text-primary"></i> Asset Details
                        </h5>

                        <div className="row g-3">
                            <div className="col-md-6 d-flex align-items-center">
                                <i className="bi bi-upc-scan text-primary me-2"></i>
                                <span><b>Asset ID:</b> {selectedAsset.AssetID}</span>
                            </div>

                            <div className="col-md-6 d-flex align-items-center">
                                <i className="bi bi-tag text-success me-2"></i>
                                <span><b>Name:</b> {selectedAsset.AssetName}</span>
                            </div>

                            <div className="col-md-6 d-flex align-items-center">
                                <i className="bi bi-layers text-warning me-2"></i>
                                <span><b>Category:</b> {selectedAsset.Category}</span>
                            </div>

                            <div className="col-md-6 d-flex align-items-center">
                                <i className="bi bi-diagram-3 text-danger me-2"></i>
                                <span><b>Sub Category:</b> {selectedAsset.SubCategory}</span>
                            </div>
                        </div>
                    </CCardBody>
                </CCard>

            )}

            {/* Attachments Section */}
            <h5 className="fw-bold mb-3">Attachments</h5>

            {attachmentFiles.length === 0 ? (
                <div className="text-center text-muted p-4 border rounded shadow-sm bg-light animated-fade-in">
                    <CIcon icon={cilFile} size="xl" className="mb-2 text-secondary" />
                    <div>No files attached for this asset.</div>
                </div>
            ) : (
                <div className="row animated-fade-in">
                    {attachmentFiles.map((file, i) => (
                        <div className="col-md-4 mb-3" key={i}>
                            <CCard className="shadow-sm border-0 hover-card">
                                <CCardBody>
                                    <div className="d-flex align-items-center">
                                        <CIcon icon={cilFile} size="2xl" className="text-primary me-3" />
                                        <div style={{ wordBreak: "break-word" }}>
                                            <div className="fw-semibold">{file.FileName}</div>
                                            <a
                                                href={`${API_URL}${file.FilePath}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-primary small"
                                            >
                                                View File →
                                            </a>
                                        </div>
                                    </div>
                                </CCardBody>
                            </CCard>
                        </div>
                    ))}
                </div>
            )}

            {/* CSS */}
            <style>{`
                .asset-card {
  background: rgba(255, 255, 255, 0.75);
  backdrop-filter: blur(10px);
  border-radius: 18px !important;
  padding: 10px;
  box-shadow: 0 8px 18px rgba(0, 0, 0, 0.08);
  animation: fadeIn 0.4s ease-in-out;
}

.asset-card h5 {
  background: linear-gradient(90deg, #4e91ff, #6dd5fa);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

            `}</style>

        </div>
    );
};

Attachments.propTypes = {
    auth: PropTypes.any.isRequired,
};

export default Attachments;
