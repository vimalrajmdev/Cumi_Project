// import React, { useState } from 'react';
// import Swal from 'sweetalert2';
// import { QRCodeCanvas } from 'qrcode.react';

// const QRCodeCreation = () => {
//     const [poNumber, setPoNumber] = useState('');
//     const [itemName, setItemName] = useState('');
//     const [itemQuantity, setItemQuantity] = useState('');
//     const [generated, setGenerated] = useState(null);

//     const handleSave = () => {
//         if (!poNumber.trim() || !itemName.trim() || !itemQuantity.trim()) {
//             Swal.fire('Missing Fields', 'Please enter PO Number, Item Name and Item Quantity.', 'warning');
//             return;
//         }
//         if (Number(itemQuantity) <= 0) {
//             Swal.fire('Invalid Quantity', 'Item Quantity must be greater than 0.', 'warning');
//             return;
//         }

//         setGenerated({
//             poNumber: poNumber.trim(),
//             itemName: itemName.trim(),
//             itemQuantity: Number(itemQuantity),
//         });
//     };

//     const handleReset = () => {
//         setPoNumber('');
//         setItemName('');
//         setItemQuantity('');
//         setGenerated(null);
//     };

//     return (
//         <div className="mt-4">
//             <div className="card">
//                 <div className="card-header d-flex justify-content-between align-items-center" style={{ background: '#106FB2' }}>
//                     <h4 className="mb-0 text-white d-flex align-items-center gap-2">
//                         <i className="bi bi-qr-code"></i> Step 1: QR Code Creation
//                     </h4>
//                 </div>
//                 <div className="card-body py-4">
//                     <div className="row g-3 mb-4">
//                         <div className="col-md-4 col-12">
//                             <label className="form-label fw-bold">PO Number <span className="text-danger">*</span></label>
//                             <input type="text" className="form-control" placeholder="e.g. PO1001"
//                                 value={poNumber} onChange={(e) => setPoNumber(e.target.value)} />
//                         </div>
//                         <div className="col-md-4 col-12">
//                             <label className="form-label fw-bold">Item Name <span className="text-danger">*</span></label>
//                             <input type="text" className="form-control" placeholder="e.g. Product A"
//                                 value={itemName} onChange={(e) => setItemName(e.target.value)} />
//                         </div>
//                         <div className="col-md-4 col-12">
//                             <label className="form-label fw-bold">Item Quantity <span className="text-danger">*</span></label>
//                             <input type="number" min="1" className="form-control" placeholder="e.g. 20"
//                                 value={itemQuantity} onChange={(e) => setItemQuantity(e.target.value)} />
//                         </div>
//                     </div>

//                     <button className="btn btn-success" onClick={handleSave}>
//                         <i className="bi bi-check2-circle me-2"></i> Save & Generate QR
//                     </button>
//                     {generated && (
//                         <button className="btn btn-secondary ms-2" onClick={handleReset}>
//                             <i className="bi bi-arrow-counterclockwise me-2"></i> Clear
//                         </button>
//                     )}

//                     {generated && (
//                         <div className="row g-3 mt-4">
//                             <div className="col-md-6 col-12">
//                                 <div className="border rounded-3 p-4 text-center h-100 bg-light">
//                                     <h6 className="text-muted mb-3">QR Code 1 — PO Number</h6>
//                                     <div className="d-flex justify-content-center mb-3 bg-white p-3 inline-block">
//                                         <QRCodeCanvas value={generated.poNumber} size={180} includeMargin />
//                                     </div>
//                                     <p className="fw-bold fs-5">{generated.poNumber}</p>
//                                 </div>
//                             </div>
//                             <div className="col-md-6 col-12">
//                                 <div className="border rounded-3 p-4 text-center h-100 bg-light">
//                                     <h6 className="text-muted mb-3">QR Code 2 — Item Details</h6>
//                                     <div className="d-flex justify-content-center mb-3 bg-white p-3 inline-block">
//                                         <QRCodeCanvas
//                                             value={JSON.stringify({ itemName: generated.itemName, itemQuantity: generated.itemQuantity })}
//                                             size={180}
//                                             includeMargin
//                                         />
//                                     </div>
//                                     <p className="fw-bold fs-5 mb-0">{generated.itemName}</p>
//                                     <p className="text-muted">Qty: {generated.itemQuantity}</p>
//                                 </div>
//                             </div>
//                         </div>
//                     )}
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default QRCodeCreation;