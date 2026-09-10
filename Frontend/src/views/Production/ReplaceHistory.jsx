import React from 'react';
import { useProduction } from '../../context/ProductionContext';

const ReplaceHistory = () => {
    const { replaceHistory } = useProduction();

    return (
        <div className="mt-4">
            <div className="card">
                <div className="card-header" style={{ background: '#106FB2' }}>
                    <h4 className="mb-0 text-white d-flex align-items-center gap-2">
                        <i className="bi bi-clock-history"></i> Replace History
                    </h4>
                </div>
                <div className="card-body py-4">
                    <div className="table-responsive">
                        <table className="table table-bordered table-hover align-middle">
                            <thead className="table-dark">
                                <tr>
                                    <th>PO Number</th>
                                    <th>Item Type</th>
                                    <th>Old Part</th>
                                    <th>New Part</th>
                                    <th>Replaced By</th>
                                    <th>Replaced Date</th>
                                    <th>Replaced Qty</th>
                                    <th>Created Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {replaceHistory.length === 0 ? (
                                    <tr>
                                        <td colSpan="8" className="text-center text-muted py-4">No Replacement History found.</td>
                                    </tr>
                                ) : (
                                    replaceHistory.map((rec, index) => (
                                        <tr key={index}>
                                            <td>{rec.poNumber}</td>
                                            <td>{rec.itemType}</td>
                                            <td className="text-danger">{rec.oldPart}</td>
                                            <td className="text-success">{rec.newPart}</td>
                                            <td>{rec.replacedBy}</td>
                                            <td>{rec.replacedDate}</td>
                                            <td>{rec.replacedQty}</td>
                                            <td>{rec.createdDate}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReplaceHistory;