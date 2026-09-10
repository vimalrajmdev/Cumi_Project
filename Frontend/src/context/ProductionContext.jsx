// import React, { createContext, useState, useCallback } from 'react';
// import {
//   getWorkOrders,
//   updateWorkOrderStatus,
//   addProductionEntry as apiAddProductionEntry,
//   getProductionEntries as apiGetProductionEntries,
// } from '../views/Production/productionApi';

// export const ProductionContext = createContext(null);

// export const ProductionProvider = ({ children }) => {
//   const [workOrders, setWorkOrders] = useState([]);
//   const [productionEntries, setProductionEntries] = useState([]);
//   const [loading, setLoading] = useState(false);

//   const refreshWorkOrders = useCallback(async () => {
//     setLoading(true);
//     try {
//       const data = await getWorkOrders();
//       setWorkOrders(data || []);
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   const refreshProductionEntries = useCallback(async (woNo) => {
//     setLoading(true);
//     try {
//       const data = await apiGetProductionEntries(woNo);
//       setProductionEntries(data || []);
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   const addProductionEntry = useCallback(async (entry) => {
//     const result = await apiAddProductionEntry(entry);
//     await refreshWorkOrders();
//     return result;
//   }, [refreshWorkOrders]);

//   const changeWorkOrderStatus = useCallback(async (woNo, status) => {
//     const result = await updateWorkOrderStatus(woNo, status);
//     await refreshWorkOrders();
//     return result;
//   }, [refreshWorkOrders]);

//   return (
//     <ProductionContext.Provider
//       value={{
//         workOrders,
//         productionEntries,
//         loading,
//         refreshWorkOrders,
//         refreshProductionEntries,
//         addProductionEntry,
//         changeWorkOrderStatus,
//       }}
//     >
//       {children}
//     </ProductionContext.Provider>
//   );
// };