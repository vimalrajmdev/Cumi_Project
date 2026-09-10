import React, { useState, useMemo } from 'react';
import Swal from 'sweetalert2';
import { useProduction } from '../../context/ProductionContext';

const ProductionEntry = () => {
    const { workOrders, productionEntries, addProductionEntry, addReplaceHistory } = useProduction();
    
    const [pdfNumber, setPdfNumber] = useState('');
    const [selectedWOId, setSelectedWOId] = useState('');
    const [completedQuantity, setCompletedQuantity] = useState('');
    const [operatorName, setOperatorName] = useState('');

    // Modal state
    const [showBreakdownModal, setShowBreakdownModal] = useState(false);
    
    // Breakdown form states
    const [breakdownItems, setBreakdownItems] = useState([]);
    const [selectedItems, setSelectedItems] = useState([]); // Array of objects: { itemType, quantity, newPart, replaceQty }
    const [breakdownReason, setBreakdownReason] = useState('');

    const operators = ['Rajesh', 'Hari', 'Arun', 'Kumar', 'Admin'];

    const currentWO = useMemo(
        () => workOrders.find((wo) => wo.id === selectedWOId),
        [workOrders, selectedWOId]
    );

    const handleSave = () => {
        if (!pdfNumber.trim() || !selectedWOId || !completedQuantity || !operatorName) {
            Swal.fire('Missing Fields', 'Please fill all required fields.', 'warning');
            return;
        }

        const completedQty = Number(completedQuantity);
        if (completedQty <= 0) {
            Swal.fire('Invalid Quantity', 'Completed Quantity must be greater than 0.', 'warning');
            return;
        }

        if (currentWO && completedQty > currentWO.balanceQuantity) {
            Swal.fire('Quantity Exceeded', `Completed Quantity cannot exceed Balance Quantity (${currentWO.balanceQuantity}).`, 'warning');
            return;
        }

        addProductionEntry({
            pdfNumber: pdfNumber.trim(),
            woId: selectedWOId,
            poNumber: currentWO.poNumber,
            itemName: currentWO.itemName,
            completedQuantity: completedQty,
            operatorName
        });

        Swal.fire('Saved!', 'Production Entry has been recorded.', 'success');
        setPdfNumber('');
        setCompletedQuantity('');
    };

    // 1. Breakdown Button Logic - Opens Modal
    const handleBreakdownClick = () => {
        if (!currentWO) {
            Swal.fire('Select Work Order', 'Please select a Work Order first.', 'warning');
            return;
        }

        // Generate dynamic item list based on PO
        const mockParts = ['Item123', currentWO.itemName, 'Item1', 'Item2_3', 'Item3', 'Item4', 'Item5'];
        const items = mockParts.map(name => ({ itemType: name, quantity: 10 }));
        setBreakdownItems(items);
        setSelectedItems([]); // Reset selected items
        setShowBreakdownModal(true);
    };

    // Handle Checkbox toggle - Add/Remove from selectedItems array
    const handleItemCheck = (item, isChecked) => {
        if (isChecked) {
            // Add item with default replace values
            setSelectedItems(prev => [...prev, { ...item, newPart: '', replaceQty: 1 }]);
        } else {
            setSelectedItems(prev => prev.filter(i => i.itemType !== item.itemType));
        }
    };

    // Update the New Part dropdown for a specific selected item
    const handleNewPartChange = (itemType, newPartValue) => {
        setSelectedItems(prev => 
            prev.map(i => i.itemType === itemType ? { ...i, newPart: newPartValue } : i)
        );
    };

    // Update the Replace Qty for a specific selected item
    const handleReplaceQtyChange = (itemType, qtyValue) => {
        setSelectedItems(prev => 
            prev.map(i => i.itemType === itemType ? { ...i, replaceQty: Number(qtyValue) } : i)
        );
    };

    // 2. Submit Breakdown Logic - Saves all replacements and finishes
    const handleSubmitBreakdown = () => {
        if (selectedItems.length === 0 || !breakdownReason) {
            Swal.fire('Missing Fields', 'Please select at least one item and enter a reason.', 'warning');
            return;
        }

        // Validate that all selected items have a new part selected and valid qty
        for (let item of selectedItems) {
            if (!item.newPart) {
                Swal.fire('Error', `Please select a replacement part for ${item.itemType}.`, 'warning');
                return;
            }
            if (item.replaceQty <= 0 || item.replaceQty > item.quantity) {
                Swal.fire('Error', `Replacement qty for ${item.itemType} must be between 1 and ${item.quantity}.`, 'warning');
                return;
            }
        }

        // Save all replacements to history
        selectedItems.forEach(item => {
            addReplaceHistory({
                poNumber: currentWO.poNumber,
                itemType: item.itemType,
                oldPart: item.itemType,
                newPart: item.newPart,
                replacedBy: operatorName || 'Admin',
                replacedQty: item.replaceQty
            });
        });

        // Close modal and reset
        setShowBreakdownModal(false);
        setSelectedItems([]);
        setBreakdownReason('');
        Swal.fire('Success!', 'Parts replaced successfully. Breakdown processed.', 'success');
    };

    return (
        <div className="mt-4">
            <div className="card">
                <div className="card-header d-flex justify-content-between align-items-center" style={{ background: '#106FB2' }}>
                    <h4 className="mb-0 text-white d-flex align-items-center gap-2">
                        <i className="bi bi-clipboard-data"></i> Production Entry
                    </h4>
                </div>
                <div className="card-body py-4">
                    <div className="row g-3 mb-3">
                        <div className="col-md-4 col-6">
                            <label className="form-label fw-bold">PDF Number <span className="text-danger">*</span></label>
                            <input type="text" className="form-control" placeholder="e.g. PDF1001"
                                value={pdfNumber} onChange={(e) => setPdfNumber(e.target.value)} />
                        </div>
                        <div className="col-md-4 col-6">
                            <label className="form-label fw-bold">Work Order (PO - Item) <span className="text-danger">*</span></label>
                            <select className="form-select" value={selectedWOId} onChange={(e) => setSelectedWOId(e.target.value)}>
                                <option value="">Select Work Order</option>
                                {workOrders.map((wo) => (
                                    <option key={wo.id} value={wo.id}>
                                        {wo.poNumber} — {wo.itemName} {wo.status === 'Completed' ? '(Completed)' : ''}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="col-md-4 col-6">
                            <label className="form-label fw-bold">Order Quantity</label>
                            <input type="text" className="form-control" disabled value={currentWO ? currentWO.orderQuantity : ''} />
                        </div>
                        <div className="col-md-4 col-6">
                            <label className="form-label fw-bold">Balance Quantity</label>
                            <input type="text" className="form-control" disabled value={currentWO ? currentWO.balanceQuantity : ''} />
                        </div>
                        <div className="col-md-4 col-6">
                            <label className="form-label fw-bold">Completed Quantity <span className="text-danger">*</span></label>
                            <input type="number" min="1" className="form-control" placeholder="e.g. 5"
                                value={completedQuantity} onChange={(e) => setCompletedQuantity(e.target.value)} />
                        </div>
                        <div className="col-md-4 col-6">
                            <label className="form-label fw-bold">Operator Name <span className="text-danger">*</span></label>
                            <select className="form-select" value={operatorName} onChange={(e) => setOperatorName(e.target.value)}>
                                <option value="">Select Operator</option>
                                {operators.map((op) => (
                                    <option key={op} value={op}>{op}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <button className="btn btn-success" onClick={handleSave}>
                        <i className="bi bi-check2-circle me-2"></i> Save Production Entry
                    </button>

                    <div className="table-responsive mt-4">
                        <table className="table table-bordered table-hover align-middle">
                            <thead className="table-dark">
                                <tr>
                                    <th>S.No</th>
                                    <th>PDF Number</th>
                                    <th>PO Number</th>
                                    <th>Item Name</th>
                                    <th>Completed Quantity</th>
                                    <th>Operator Name</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {productionEntries.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" className="text-center text-muted py-4">No Production Entries recorded yet.</td>
                                    </tr>
                                ) : (
                                    productionEntries.map((entry, index) => (
                                        <tr key={index}>
                                            <td>{index + 1}</td>
                                            <td>{entry.pdfNumber}</td>
                                            <td>{entry.poNumber}</td>
                                            <td>{entry.itemName}</td>
                                            <td className="fw-bold text-success">{entry.completedQuantity}</td>
                                            <td>{entry.operatorName}</td>
                                            <td>
                                                <button className="btn btn-sm btn-outline-primary">View</button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Breakdown Button - Center Right */}
                    <div className="d-flex justify-content-end mt-3">
                        <button className="btn btn-danger" onClick={handleBreakdownClick}>
                            <i className="bi bi-exclamation-triangle me-2"></i> Breakdown
                        </button>
                    </div>
                </div>
            </div>

            {/* Popup: Breakdown Item List Modal */}
            {showBreakdownModal && (
                <div className="modal fade show d-block" tabIndex="-1" style={{ background: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-lg">
                        <div className="modal-content">
                            <div className="modal-header bg-danger text-white">
                                <h5 className="modal-title">Breakdown Details - PO: {currentWO?.poNumber}</h5>
                                <button type="button" className="btn-close btn-close-white" onClick={() => setShowBreakdownModal(false)}></button>
                            </div>
                            <div className="modal-body">
                                {/* Main Item List Table */}
                                <table className="table table-bordered">
                                    <thead>
                                        <tr>
                                            <th>Item Type</th>
                                            <th>Quantity</th>
                                            <th>Choose</th>
                                            <th>Replace With (New Part)</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {breakdownItems.map((item, idx) => {
                                            // Find if this item is currently selected
                                            const selected = selectedItems.find(i => i.itemType === item.itemType);
                                            return (
                                                <tr key={idx}>
                                                    <td>{item.itemType}</td>
                                                    <td>{item.quantity}</td>
                                                    <td>
                                                        <input 
                                                            type="checkbox" 
                                                            className="form-check-input"
                                                            value={item.itemType} 
                                                            checked={!!selected}
                                                            onChange={(e) => handleItemCheck(item, e.target.checked)} 
                                                        />
                                                    </td>
                                                    <td>
                                                        <select 
                                                            className="form-select form-select-sm" 
                                                            disabled={!selected}
                                                            value={selected?.newPart || ''}
                                                            onChange={(e) => handleNewPartChange(item.itemType, e.target.value)}
                                                        >
                                                            <option value="">Select Part</option>
                                                            <option value="Item3">Item3</option>
                                                            <option value="Item4">Item4</option>
                                                            <option value="Item5">Item5</option>
                                                        </select>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>

                                <div className="mb-3">
                                    <label className="form-label fw-bold">Breakdown Reason</label>
                                    <select className="form-select" value={breakdownReason} onChange={(e) => setBreakdownReason(e.target.value)}>
                                        <option value="">Select Reason</option>
                                        <option value="Breakdown">Breakdown</option>
                                        <option value="Damaged">Damaged</option>
                                        <option value="Faulty">Faulty Part</option>
                                    </select>
                                </div>

                                {/* Selected Items Summary Table (Appears only if items are selected) */}
                                {selectedItems.length > 0 && (
                                    <div className="mt-4 border-top pt-3">
                                        <h6 className="fw-bold text-primary">Items to be Replaced</h6>
                                        <table className="table table-sm table-bordered table-striped">
                                            <thead className="table-light">
                                                <tr>
                                                    <th>Old Part (Item Type)</th>
                                                    <th>new part</th>
                                                    <th>Repalce Qty</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {selectedItems.map((item, idx) => (
                                                    <tr key={idx}>
                                                        <td>{item.itemType}</td>
                                                        <td className="text-success fw-bold">{item.newPart || 'Not Selected'}</td>
                                                        <td style={{ width: '120px' }}>
                                                            <input 
                                                                type="number" 
                                                                min="1" 
                                                                max={item.quantity}
                                                                className="form-control form-control-sm" 
                                                                value={item.replaceQty} 
                                                                onChange={(e) => handleReplaceQtyChange(item.itemType, e.target.value)} 
                                                            />
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                            <div className="modal-footer">
                                <button className="btn btn-secondary" onClick={() => setShowBreakdownModal(false)}>Close</button>
                                {/* Final Button to complete breakdown */}
                                <button className="btn btn-primary" onClick={handleSubmitBreakdown}>
                                    <i className="bi bi-check2-circle me-2"></i> Submit Breakdown
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductionEntry;