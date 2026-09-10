import React, { useState } from 'react';
import Swal from 'sweetalert2';
import { useProduction } from '../../context/ProductionContext';

const WorkOrder = () => {
    const { workOrders, addWorkOrder } = useProduction(); 
    
    const [form, setForm] = useState({
        poNumber: '',
        itemName: '',
        orderQuantity: ''
    });

    const handleChange = (field) => (e) => setForm({ ...form, [field]: e.target.value });

    const handleOk = () => {
        if (!form.poNumber.trim() || !form.itemName.trim() || !form.orderQuantity.trim()) {
            Swal.fire('Missing Fields', 'Please fill in PO Number, Item Name, and Item Quantity.', 'warning');
            return;
        }

        addWorkOrder({
            poNumber: form.poNumber.trim(),
            itemName: form.itemName.trim(),
            orderQuantity: form.orderQuantity
        });

        Swal.fire('Added!', 'Work Order has been created.', 'success');
        setForm({ poNumber: '', itemName: '', orderQuantity: '' });
    };

    const getStatusBadge = (status) => {
        if (status === 'Completed') return <span className="badge bg-success p-2">{status}</span>;
        if (status === 'In Progress') return <span className="badge bg-primary p-2">{status}</span>;
        return <span className="badge bg-warning text-dark p-2">{status}</span>;
    };

    return (
        <div className="mt-4">
            <div className="card">
                <div className="card-header" style={{ background: '#106FB2' }}>
                    <h4 className="mb-0 text-white d-flex align-items-center gap-2">
                        <i className="bi bi-file-earmark-text"></i> Work Order Creation
                    </h4>
                </div>
                <div className="card-body py-4">
                    <div className="row g-3 mb-3">
                        <div className="col-md-4 col-6">
                            <label className="form-label fw-bold">PO Number <span className="text-danger">*</span></label>
                            <input type="text" className="form-control" value={form.poNumber} onChange={handleChange('poNumber')} />
                        </div>
                        <div className="col-md-4 col-6">
                            <label className="form-label fw-bold">Item Name / Code <span className="text-danger">*</span></label>
                            <input type="text" className="form-control" value={form.itemName} onChange={handleChange('itemName')} />
                        </div>
                        <div className="col-md-4 col-6">
                            <label className="form-label fw-bold">Item Quantity (Order Qty) <span className="text-danger">*</span></label>
                            <input type="number" min="1" className="form-control" value={form.orderQuantity} onChange={handleChange('orderQuantity')} />
                        </div>
                        <div className="col-md-4 col-6">
                            <label className="form-label fw-bold">Balance Quantity</label>
                            <input type="text" className="form-control" disabled value={form.orderQuantity || 0} />
                        </div>
                        <div className="col-md-4 col-6">
                            <label className="form-label fw-bold">Status</label>
                            <input type="text" className="form-control" disabled value={form.orderQuantity > 0 ? 'Pending' : ''} />
                        </div>
                    </div>

                    <button className="btn btn-primary" onClick={handleOk}>
                        <i className="bi bi-check2-circle me-2"></i> OK
                    </button>

                    <div className="table-responsive mt-4">
                        <table className="table table-bordered table-hover align-middle">
                            <thead className="table-dark">
                                <tr>
                                    <th>S.No</th>
                                    <th>PO Number</th>
                                    <th>Item Code</th>
                                    <th>Order Quantity</th>
                                    <th>Balance Quantity</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {workOrders.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" className="text-center text-muted py-4">No Work Orders created yet.</td>
                                    </tr>
                                ) : (
                                    workOrders.map((wo, index) => (
                                        <tr key={index}>
                                            <td>{index + 1}</td>
                                            <td>{wo.poNumber}</td>
                                            <td>{wo.itemName}</td>
                                            <td>{wo.orderQuantity}</td>
                                            <td>{wo.balanceQuantity}</td>
                                            <td>{getStatusBadge(wo.status)}</td>
                                            <td>
                                                <button className="btn btn-sm btn-outline-secondary" disabled>
                                                    View
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
    );
};

export default WorkOrder;