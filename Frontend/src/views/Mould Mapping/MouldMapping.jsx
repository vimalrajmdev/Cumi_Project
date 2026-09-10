import React, { useMemo, useState, useEffect } from 'react'
import axios from 'axios';
import Swal from 'sweetalert2';
import swal from 'sweetalert';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import PropTypes from 'prop-types';
import { BallTriangle } from 'react-loader-spinner';
import { Typeahead } from 'react-bootstrap-typeahead';
import 'react-bootstrap-typeahead/css/Typeahead.css';
// import logo from '../../assets/images/Cumi/Cumi_logo.jpg';
import { getConfig } from 'src/config';
import { cilTrash, cilCloudDownload } from '@coreui/icons';
import CIcon from '@coreui/icons-react';
import { useLocation } from 'react-router-dom';

const FGMouldMapping = ({ auth }) => {
    const API_URL = getConfig().REACT_APP_API_URL;
    const [loading, setLoading] = useState(false);
    const location = useLocation();
    let pageData = location.state?.pageData;
    if (!pageData) {
        const storedData = localStorage.getItem('pageData');
        pageData = storedData ? JSON.parse(storedData) : {};
    }
    const canAdd = !((pageData.addstatus === null || pageData.addstatus === 'i') && auth.UserStatus === 'A');
    const canDelete = !((pageData.deletestatus === null || pageData.deletestatus === 'i') && auth.UserStatus === 'A');

    const [FGData, setFGData] = useState([]);
    const [MouldData, setMouldData] = useState([]);
    const [MappingData, setMappingData] = useState([]);
    const [selectedFG, setSelectedFG] = useState([]);
    const [selectedMoulds, setSelectedMoulds] = useState([]);
    const [expanded, setExpanded] = useState({});
    const [searchSelection, setSearchSelection] = useState([]);

    const emptyPayload = { MapID: '', FG_ID: '', MM_ID: '', CreatedBy: '' };

    // ---------------- Fetchers ----------------
    const fetchFG = async () => {
        try {
            const response = await axios.post(`${API_URL}/FGMouldMapConfig`, { ...emptyPayload, mode: 'GetFG' });
            setFGData(response.data);
        } catch (err) { console.error('Error fetching FG list:', err); }
    };
    const fetchMould = async () => {
        try {
            const response = await axios.post(`${API_URL}/FGMouldMapConfig`, { ...emptyPayload, mode: 'GetMould' });
            setMouldData(response.data);
        } catch (err) { console.error('Error fetching Mould list:', err); }
    };
    const fetchMapping = async () => {
        setLoading(true);
        try {
            const response = await axios.post(`${API_URL}/FGMouldMapConfig`, { ...emptyPayload, mode: 'FetchMapping' });
            setMappingData(response.data);
        } catch (err) {
            console.error('Error fetching mappings:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFG();
        fetchMould();
        fetchMapping();
    }, []);

    // Only moulds not yet mapped anywhere are selectable
    const freeMoulds = useMemo(
        () => MouldData.filter(m => !m.MappedFGCode),
        [MouldData]
    );

    // ---------------- Group mappings FG-wise ----------------
    // All FG groups (no filter)
    const allGroups = useMemo(() => {
        const groups = {};
        MappingData.forEach(row => {
            if (!groups[row.FG_ID]) {
                groups[row.FG_ID] = {
                    FG_ID: row.FG_ID,
                    FGCode: row.FGCode,
                    WheelSize: row.WheelSize,
                    MouldSize: row.MouldSize,
                    Grade: row.Grade,
                    moulds: []
                };
            }
            groups[row.FG_ID].moulds.push(row);
        });
        return Object.values(groups).sort((a, b) => a.FGCode.localeCompare(b.FGCode));
    }, [MappingData]);

    // What actually renders: filtered by the search Typeahead
    const fgGroups = useMemo(() => {
        if (searchSelection.length > 0) {
            return allGroups.filter(g => g.FG_ID === searchSelection[0].FG_ID);
        }
        return allGroups;
    }, [allGroups, searchSelection]);

    const toggleExpand = (fgId) => {
        setExpanded(prev => ({ ...prev, [fgId]: !prev[fgId] }));
    };

    // ---------------- Map ----------------
    const handleMap = async () => {
        if (selectedFG.length === 0) {
            Swal.fire({ title: 'Please Select FG Code', icon: 'warning', confirmButtonText: 'Done' });
            return;
        }
        if (selectedMoulds.length === 0) {
            Swal.fire({ title: 'Please Select at least One Mould Item Code', icon: 'warning', confirmButtonText: 'Done' });
            return;
        }
        setLoading(true);
        try {
            const alldata = {
                ...emptyPayload,
                mode: 'I',
                FG_ID: selectedFG[0].id,
                MM_IDs: selectedMoulds.map(m => m.MM_ID),
                CreatedBy: auth.employeename
            };
            const response = await axios.post(`${API_URL}/FGMouldMapConfig`, alldata);
            const { mappedCount, skipped } = response.data;

            if (skipped && skipped.length > 0) {
                const skippedText = skipped.map(s => `MM_ID ${s.MM_ID} → already in ${s.MappedTo}`).join('\n');
                swal({
                    title: `Mapped: ${mappedCount}, Skipped: ${skipped.length}`,
                    text: `Some moulds were already mapped:\n${skippedText}`,
                    icon: 'warning'
                });
            } else {
                Swal.fire({
                    title: 'Mapped Successfully',
                    text: `${mappedCount} Mould(s) mapped to ${selectedFG[0].ItemCode}`,
                    icon: 'success',
                    confirmButtonText: 'Done'
                });
            }
            setSelectedMoulds([]);
            setSelectedFG([]);
            fetchMould();
            fetchMapping();
        } catch (err) {
            console.error(err);
            Swal.fire({ title: 'Mapping Failed', icon: 'error' });
        } finally {
            setLoading(false);
        }
    };

    // ---------------- Unmap ----------------
    const handleUnmap = async (row) => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: `Unmap Mould ${row.MouldItemCode} (${row.MouldPart}) from FG ${row.FGCode}?`,
            icon: 'warning',
            showCancelButton: true,
            cancelButtonText: 'Cancel',
            confirmButtonText: 'Unmap',
        });
        if (result.isConfirmed) {
            setLoading(true);
            try {
                const alldata = { ...emptyPayload, mode: 'D', MapID: row.MapID, CreatedBy: auth.employeename };
                const response = await axios.post(`${API_URL}/FGMouldMapConfig`, alldata);
                if (response.status === 200) {
                    Swal.fire({ title: 'Unmapped', text: 'Unmapped Successfully', icon: 'success', confirmButtonText: 'Done' });
                    // Clear search if the unmapped row emptied that FG
                    setSearchSelection([]);
                    fetchMould();
                    fetchMapping();
                }
            } catch (err) {
                console.error('ERROR UNMAPPING:', err);
            } finally {
                setLoading(false);
            }
        }
    };

    // ---------------- Exports ----------------
    const downloadCSV = (rows, fileName) => {
        if (!rows || rows.length === 0) {
            alert('No data available to export');
            return;
        }
        const headers = ['FG Code', 'Wheel Size', 'FG Mould Size', 'Grade', 'Mould Item Code', 'Mould Part', 'Short Form Size', 'RFID', 'Item Description', 'Mapped By', 'Mapped Date'];
        const csvRows = rows.map(r => [
            r.FGCode, r.WheelSize, r.MouldSize, r.Grade,
            r.MouldItemCode, r.MouldPart, r.ShortFormSize, r.RFID,
            (r.ItemDescription || '').replace(/,/g, ' '),
            r.CreatedBy || '',
            r.CreatedDate ? new Date(r.CreatedDate).toISOString().slice(0, 19).replace('T', ' ') : ''
        ].map(v => `"${v ?? ''}"`).join(','));
        const csvContent = [headers.join(','), ...csvRows].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.setAttribute('download', fileName);
        document.body.appendChild(link);
        link.click();
        link.parentNode.removeChild(link);
    };

    const exportAllCSV = () => downloadCSV(MappingData, 'FG_Mould_Mapping.csv');
    const exportFGCSV = (group) => downloadCSV(group.moulds, `FG_${group.FGCode}_Moulds.csv`);

    const generatePDF = () => {
        setLoading(true);
        try {
            if (MappingData.length === 0) {
                alert('No data available to export');
                setLoading(false);
                return;
            }
            const doc = new jsPDF({ format: 'a3', orientation: 'landscape' });
            const title = 'FG - Mould Mapping';
            const currentUser = auth.employeename || 'Unknown User';
            const currentDateTime = new Date().toLocaleString();
            const pageWidth = doc.internal.pageSize.width;

            doc.addImage(logo, 'PNG', 10, 10, 30, 10);
            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            doc.text(title, pageWidth / 2, 15, { align: 'center' });

            const columnMapping = [
                { header: 'FG Code', key: 'FGCode' },
                { header: 'Wheel Size', key: 'WheelSize' },
                { header: 'FG Mould Size', key: 'MouldSize' },
                { header: 'Grade', key: 'Grade' },
                { header: 'Mould Item Code', key: 'MouldItemCode' },
                { header: 'Mould Part', key: 'MouldPart' },
                { header: 'Short Form Size', key: 'ShortFormSize' },
                { header: 'RFID', key: 'RFID' },
                { header: 'Mapped By', key: 'CreatedBy' },
            ];
            const columnHeaders = columnMapping.map(c => c.header);
            const data = MappingData.map(obj => columnMapping.map(c => obj[c.key] || ''));

            doc.autoTable({
                head: [columnHeaders],
                body: data,
                margin: { top: 30, right: 10, left: 10, bottom: 20 },
                theme: 'grid',
                styles: { fontSize: 8, halign: 'center', valign: 'middle', overflow: 'linebreak', lineColor: [0, 0, 0], lineWidth: 0.1 },
                headStyles: { fillColor: ['#3f77d2'], textColor: [255, 255, 255], lineColor: [0, 0, 0], lineWidth: 0.1, fontStyle: 'bold' },
                bodyStyles: { fillColor: [245, 245, 245], textColor: [0, 0, 0], lineColor: [0, 0, 0], lineWidth: 0.1 },
                didDrawPage: function (data) {
                    const pageHeight = doc.internal.pageSize.height;
                    doc.addImage(logo, 'PNG', 10, 10, 30, 10);
                    doc.setFontSize(10);
                    doc.text(`User: ${currentUser}`, pageWidth - 10, 12, { align: 'right' });
                    doc.text(`Date: ${currentDateTime}`, pageWidth - 10, 18, { align: 'right' });
                    doc.setFontSize(14);
                    doc.setFont('helvetica', 'bold');
                    doc.text(title, pageWidth / 2, 15, { align: 'center' });
                    doc.setFontSize(10);
                    doc.text(`Page ${data.pageNumber}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
                }
            });
            doc.save('FG_Mould_Mapping.pdf');
        } catch (err) {
            console.error('Error generating PDF:', err);
            alert('Failed to generate PDF. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // ---------------- Render ----------------
    return (
        <>
            {loading && (
                <div className="loading-overlay">
                    <div className="loading-spinner">
                        <BallTriangle height={100} width={100} radius={5} color="#4fa94d" ariaLabel="ball-triangle-loading" visible={true} />
                    </div>
                </div>
            )}

            <div className="mt-3">

                {/* ======= Page Title ======= */}
                {/* NOTE: no overflow:hidden here — it was clipping the Typeahead dropdowns */}
                <div className="card shadow-sm border-0 mb-3" style={{ borderRadius: '14px' }}>
                    <div className="d-flex justify-content-between align-items-center px-4 py-3"
                        style={{
                            background: 'linear-gradient(135deg, #3f77d2, #00b4d8)',
                            borderTopLeftRadius: '14px',
                            borderTopRightRadius: '14px'
                        }}>
                        <h4 className="text-white mb-0">
                            <i className="bi bi-diagram-3 me-2"></i> Mould Mapping
                        </h4>
                        <div className="d-flex gap-2">
                            <button
                                className="btn d-flex align-items-center gap-2"
                                onClick={exportAllCSV}
                                title="Export All (Excel)"
                                style={{
                                    background: '#fff', color: '#0f7a3d', border: 'none', borderRadius: '10px',
                                    fontWeight: 600, padding: '8px 14px', boxShadow: '0 3px 10px rgba(0,0,0,0.2)'
                                }}>
                                <i className="bi bi-file-earmark-spreadsheet"></i> Excel
                            </button>
                            <button
                                className="btn d-flex align-items-center gap-2"
                                onClick={generatePDF}
                                title="Export All (PDF)"
                                style={{
                                    background: '#fff', color: '#c0392b', border: 'none', borderRadius: '10px',
                                    fontWeight: 600, padding: '8px 14px', boxShadow: '0 3px 10px rgba(0,0,0,0.2)'
                                }}>
                                <i className="bi bi-filetype-pdf"></i> PDF
                            </button>
                        </div>
                    </div>

                    {/* ======= Mapping Panel ======= */}
                    {canAdd && (
                        <div className="px-4 py-3"
                            style={{
                                background: '#f6f9ff',
                                borderBottomLeftRadius: '14px',
                                borderBottomRightRadius: '14px'
                            }}>
                            <div className="row align-items-end">
                                <div className="col-lg-3 col-md-6 mt-2">
                                    <label className="fw-semibold"> Mould Code <span style={{ color: 'red' }}>*</span></label>
                                    <Typeahead
                                        id="fg-typeahead"
                                        positionFixed
                                        labelKey={(option) => `${option.ItemCode}`}
                                        onChange={(selected) => setSelectedFG(selected)}
                                        options={FGData}
                                        placeholder="Select  Code"
                                        selected={selectedFG}
                                        clearButton
                                        renderMenuItemChildren={(option) => (
                                            <div>
                                                <strong>{option.ItemCode}</strong>
                                                <div className="small text-muted">
                                                    Wheel: {option.WheelSize} | Grade: {option.Grade}
                                                </div>
                                            </div>
                                        )}
                                    />
                                </div>
                                <div className="col-lg-2 col-md-6 mt-2">
                                    <label className="fw-semibold">Wheel Size</label>
                                    <input className="form-control" value={selectedFG[0]?.WheelSize || ''} disabled />
                                </div>
                                <div className="col-lg-4 col-md-8 mt-2">
                                    <label className="fw-semibold">Mould Item Code(s) <span style={{ color: 'red' }}>*</span></label>
                                    <Typeahead
                                        id="mould-typeahead"
                                        multiple
                                        positionFixed
                                        labelKey={(option) => `${option.ItemCode} (${option.MouldPart})`}
                                        onChange={(selected) => setSelectedMoulds(selected)}
                                        options={freeMoulds}
                                        placeholder={freeMoulds.length === 0 ? 'No Unmapped Moulds Available' : 'Select Mould Item Code(s)'}
                                        selected={selectedMoulds}
                                        clearButton
                                        renderMenuItemChildren={(option) => (
                                            <div>
                                                <strong>{option.ItemCode}</strong> — {option.MouldPart}
                                                <div className="small text-muted">
                                                    Size: {option.ShortFormSize} | RFID: {option.RFID}
                                                </div>
                                            </div>
                                        )}
                                    />
                                </div>
                                <div className="col-lg-3 col-md-4 mt-2">
                                    <button
                                        className="btn w-100 d-flex align-items-center justify-content-center gap-2"
                                        onClick={handleMap}
                                        style={{
                                            background: 'linear-gradient(135deg, #00c853, #009624)',
                                            color: '#fff', border: 'none', borderRadius: '12px',
                                            fontWeight: 600, padding: '10px 18px',
                                            boxShadow: '0 4px 15px rgba(0, 200, 83, 0.35)',
                                            transition: 'all 0.3s ease', cursor: 'pointer',
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.background = 'linear-gradient(135deg, #00e676, #00c853)';
                                            e.currentTarget.style.transform = 'translateY(-2px)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.background = 'linear-gradient(135deg, #00c853, #009624)';
                                            e.currentTarget.style.transform = 'translateY(0)';
                                        }}
                                    >
                                        <i className="bi bi-link-45deg fs-5"></i> Map Mould(s)
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* ======= FG-wise Mapping List ======= */}
                <div className="card shadow-sm border-0" style={{ borderRadius: '14px' }}>
                    <div className="card-body">
                        <div className="d-flex justify-content-between align-items-center flex-wrap mb-3">
                            <h5 className="mb-0" style={{ color: '#2e3f7e' }}>
                                <i className="bi bi-list-nested me-2"></i>Wise Mould Mapping
                                <span className="badge rounded-pill ms-2" style={{ background: '#3f77d2' }}>
                                    {fgGroups.length} FG
                                </span>
                            </h5>

                            {/* Search Typeahead: matches FG Code, Grade, Mould Item Code, Mould Part, RFID */}
                            <div style={{ minWidth: '320px' }}>
                                <Typeahead
                                    id="mapping-search-typeahead"
                                    positionFixed
                                    clearButton
                                    labelKey="FGCode"
                                    options={allGroups}
                                    placeholder="Search / Mould / Grade..."
                                    selected={searchSelection}
                                    onChange={(selected) => {
                                        setSearchSelection(selected);
                                        if (selected.length > 0) {
                                            // auto-expand the selected FG
                                            setExpanded(prev => ({ ...prev, [selected[0].FG_ID]: true }));
                                        }
                                    }}
                                    filterBy={(option, props) => {
                                        const s = props.text.toLowerCase();
                                        return option.FGCode.toLowerCase().includes(s) ||
                                            (option.Grade || '').toLowerCase().includes(s) ||
                                            option.moulds.some(m =>
                                                m.MouldItemCode.toLowerCase().includes(s) ||
                                                (m.MouldPart || '').toLowerCase().includes(s) ||
                                                (m.RFID || '').toLowerCase().includes(s)
                                            );
                                    }}
                                    renderMenuItemChildren={(option) => (
                                        <div>
                                            <strong>{option.FGCode}</strong>
                                            <div className="small text-muted">
                                                Grade: {option.Grade} | {option.moulds.length} Mould{option.moulds.length > 1 ? 's' : ''}
                                            </div>
                                        </div>
                                    )}
                                />
                            </div>
                        </div>

                        {fgGroups.length === 0 && (
                            <div className="text-center text-muted py-5">
                                <i className="bi bi-inboxes fs-1 d-block mb-2"></i>
                                No  Mould mappings found. Select an FG Code and Mould(s) above to map.
                            </div>
                        )}

                        {fgGroups.map((group) => (
                            <div key={group.FG_ID} className="mb-3 border rounded-3 overflow-hidden shadow-sm">
                                {/* FG Header Row */}
                                <div
                                    className="d-flex justify-content-between align-items-center px-3 py-2"
                                    style={{ background: '#eef4ff', cursor: 'pointer' }}
                                    onClick={() => toggleExpand(group.FG_ID)}
                                >
                                    <div className="d-flex align-items-center flex-wrap gap-3">
                                        <i className={`bi ${expanded[group.FG_ID] ? 'bi-chevron-down' : 'bi-chevron-right'} fs-5`}
                                            style={{ color: '#3f77d2', transition: 'transform 0.2s' }}></i>
                                        <div>
                                            <span className="fw-bold" style={{ color: '#2e3f7e', fontSize: '1.05rem' }}>
                                                {group.FGCode}
                                            </span>
                                            <div className="small text-muted">
                                                Wheel: {group.WheelSize} &nbsp;|&nbsp; Mould Size: {group.MouldSize} &nbsp;|&nbsp; Grade: {group.Grade}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="d-flex align-items-center gap-2">
                                        <span className="badge rounded-pill"
                                            style={{ background: 'linear-gradient(135deg, #3f77d2, #00b4d8)', fontSize: '0.85rem' }}>
                                            {group.moulds.length} Mould{group.moulds.length > 1 ? 's' : ''}
                                        </span>
                                        <button
                                            className="btn btn-sm d-flex align-items-center gap-1"
                                            title={`Export ${group.FGCode} Moulds`}
                                            onClick={(e) => { e.stopPropagation(); exportFGCSV(group); }}
                                            style={{
                                                background: 'linear-gradient(135deg, #007bff, #00b4d8)',
                                                color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 600,
                                            }}
                                        >
                                            <CIcon icon={cilCloudDownload} size="sm" /> Export
                                        </button>
                                    </div>
                                </div>

                                {/* Expanded: Mould detail table */}
                                {expanded[group.FG_ID] && (
                                    <div className="table-responsive">
                                        <table className="table table-striped table-hover align-middle mb-0">
                                            <thead>
                                                <tr style={{ background: '#3f77d2', color: '#fff' }}>
                                                    <th className="text-white">#</th>
                                                    <th className="text-white">Mould Item Code</th>
                                                    <th className="text-white">Mould Part</th>
                                                    <th className="text-white">Short Form Size</th>
                                                    <th className="text-white">RFID</th>
                                                    <th className="text-white">Item Description</th>
                                                    <th className="text-white">Mapped By</th>
                                                    <th className="text-white">Mapped Date</th>
                                                    {canDelete && <th className="text-white text-center">Unmap</th>}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {group.moulds.map((m, idx) => (
                                                    <tr key={m.MapID}>
                                                        <td>{idx + 1}</td>
                                                        <td className="fw-semibold">{m.MouldItemCode}</td>
                                                        <td>
                                                            <span className="badge" style={{ background: '#6c5ce7' }}>{m.MouldPart}</span>
                                                        </td>
                                                        <td>{m.ShortFormSize}</td>
                                                        <td>{m.RFID}</td>
                                                        <td className="small">{m.ItemDescription}</td>
                                                        <td>{m.CreatedBy}</td>
                                                        <td>
                                                            {m.CreatedDate
                                                                ? (() => {
                                                                    const d = new Date(m.CreatedDate);
                                                                    const dd = String(d.getUTCDate()).padStart(2, '0');
                                                                    const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
                                                                    const yyyy = d.getUTCFullYear();
                                                                    const hh = String(d.getUTCHours()).padStart(2, '0');
                                                                    const mi = String(d.getUTCMinutes()).padStart(2, '0');
                                                                    return `${dd}-${mm}-${yyyy} ${hh}:${mi}`;
                                                                })()
                                                                : '-'}
                                                        </td>
                                                        {canDelete && (
                                                            <td className="text-center">
                                                                <button
                                                                    onClick={() => handleUnmap(m)}
                                                                    title="Unmap"
                                                                    style={{
                                                                        background: 'linear-gradient(135deg, #ff4d4d, #ff1a1a)',
                                                                        color: '#fff', border: 'none', borderRadius: '50%',
                                                                        padding: '5px', display: 'inline-flex',
                                                                        alignItems: 'center', justifyContent: 'center',
                                                                        cursor: 'pointer',
                                                                        boxShadow: '0 3px 10px rgba(255, 0, 0, 0.35)',
                                                                        transition: 'all 0.3s ease',
                                                                    }}
                                                                    onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; }}
                                                                    onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}
                                                                >
                                                                    <CIcon icon={cilTrash} />
                                                                </button>
                                                            </td>
                                                        )}
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </>
    )
}

FGMouldMapping.propTypes = {
    auth: PropTypes.any.isRequired,
};

export default FGMouldMapping