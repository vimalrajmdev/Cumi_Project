// // src/views/Production/productionApi.js
// import axios from 'axios';

// const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3601';

// const getUser = () => JSON.parse(localStorage.getItem('user') || '{}');

// export const generatePONo = async () => {
//   const { branchid } = getUser();
//   const res = await axios.post(`${API_URL}/GeneratePONumber`, { branchid });
//   return res.data.poNo;
// };

// export const createWorkOrder = async ({ poNo, item, itemQty }) => {
//   const { branchid, usercode } = getUser();
//   const res = await axios.post(`${API_URL}/CreateWorkOrder`, {
//     poNo, item, itemQty, createdby: usercode, branchid,
//   });
//   return res.data;
// };

// export const getWorkOrders = async () => {
//   const { branchid, BranchAccess } = getUser();
//   const res = await axios.post(`${API_URL}/GetWorkOrders`, { branchid, BranchAccess });
//   return res.data.send;
// };

// export const updateWorkOrderStatus = async (woNo, status) => {
//   const { branchid } = getUser();
//   const res = await axios.post(`${API_URL}/UpdateWorkOrderStatus`, { woNo, status, branchid });
//   return res.data;
// };
// export const addProductionEntry = async ({ woNo, producedQty, rejectedQty, remarks }) => {
//   const { branchid, usercode } = getUser();
//   const res = await axios.post(`${API_URL}/AddProductionEntry`, {
//     woNo, producedQty, rejectedQty, remarks, createdby: usercode, branchid,
//   });
//   return res.data;
// };

// export const getProductionEntries = async (woNo) => {
//   const { branchid } = getUser();
//   const res = await axios.post(`${API_URL}/GetProductionEntries`, { woNo, branchid });
//   return res.data.send;
// };