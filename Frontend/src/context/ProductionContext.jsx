// import React, { createContext, useState, useContext } from 'react';

// const ProductionContext = createContext();

// export const useProduction = () => useContext(ProductionContext);

// export const ProductionProvider = ({ children }) => {
//     const [workOrders, setWorkOrders] = useState([]);
//     const [productionEntries, setProductionEntries] = useState([]);

//     const computeStatus = (orderQty, balanceQty) => {
//         if (Number(balanceQty) <= 0) return 'Completed';
//         if (Number(balanceQty) === Number(orderQty)) return 'Pending';
//         return 'In Progress';
//     };

//     const addWorkOrder = (wo) => {
//         // Auto-generate a unique ID for internal tracking
//         const newId = `WO-${Date.now()}`;
//         const newWO = {
//             id: newId,
//             poNumber: wo.poNumber,
//             itemName: wo.itemName,
//             orderQuantity: Number(wo.orderQuantity),
//             balanceQuantity: Number(wo.orderQuantity), // Initially, balance equals order qty
//             status: computeStatus(wo.orderQuantity, wo.orderQuantity)
//         };
//         setWorkOrders((prev) => [...prev, newWO]);
//     };

//     const addProductionEntry = (entry) => {
//         const completedQty = Number(entry.completedQuantity);
        
//         // Add to production entries
//         setProductionEntries((prev) => [
//             { ...entry, completedQuantity: completedQty }, 
//             ...prev
//         ]);

//         // Update the corresponding Work Order balance and status using the generated ID
//         setWorkOrders((prev) =>
//             prev.map((wo) => {
//                 if (wo.id === entry.woId) {
//                     const newBalance = wo.balanceQuantity - completedQty;
//                     return {
//                         ...wo,
//                         balanceQuantity: newBalance,
//                         status: computeStatus(wo.orderQuantity, newBalance)
//                     };
//                 }
//                 return wo;
//             })
//         );
//     };

//     return (
//         <ProductionContext.Provider value={{ workOrders, addWorkOrder, productionEntries, addProductionEntry }}>
//             {children}
//         </ProductionContext.Provider>
//     );
// };


import React, { createContext, useState, useContext } from 'react';

const ProductionContext = createContext();

export const useProduction = () => useContext(ProductionContext);

export const ProductionProvider = ({ children }) => {
    const [workOrders, setWorkOrders] = useState([]);
    const [productionEntries, setProductionEntries] = useState([]);
    const [replaceHistory, setReplaceHistory] = useState([]); // NEW: For Replace History

    const computeStatus = (orderQty, balanceQty) => {
        if (Number(balanceQty) <= 0) return 'Completed';
        if (Number(balanceQty) === Number(orderQty)) return 'Pending';
        return 'In Progress';
    };

    const addWorkOrder = (wo) => {
        const newId = `WO-${Date.now()}`;
        const newWO = {
            id: newId,
            poNumber: wo.poNumber,
            itemName: wo.itemName,
            orderQuantity: Number(wo.orderQuantity),
            balanceQuantity: Number(wo.orderQuantity),
            status: computeStatus(wo.orderQuantity, wo.orderQuantity)
        };
        setWorkOrders((prev) => [...prev, newWO]);
    };

    const addProductionEntry = (entry) => {
        const completedQty = Number(entry.completedQuantity);
        setProductionEntries((prev) => [{ ...entry, completedQuantity: completedQty }, ...prev]);

        setWorkOrders((prev) =>
            prev.map((wo) => {
                if (wo.id === entry.woId) {
                    const newBalance = wo.balanceQuantity - completedQty;
                    return {
                        ...wo,
                        balanceQuantity: newBalance,
                        status: computeStatus(wo.orderQuantity, newBalance)
                    };
                }
                return wo;
            })
        );
    };

    // NEW: Function to save replacement history
    const addReplaceHistory = (record) => {
        setReplaceHistory((prev) => [
            { 
                ...record, 
                id: Date.now(), 
                replacedDate: new Date().toLocaleDateString(), 
                createdDate: new Date().toLocaleDateString() 
            },
            ...prev
        ]);
    };

    return (
        <ProductionContext.Provider value={{ workOrders, addWorkOrder, productionEntries, addProductionEntry, replaceHistory, addReplaceHistory }}>
            {children}
        </ProductionContext.Provider>
    );
};