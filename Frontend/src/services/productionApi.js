import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3601';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      Authorization: token ? `Bearer ${token}` : '',
    },
  };
};

// Work Order APIs
export const getWorkOrders = () => axios.post(`${API_URL}/WorkOrderList`, {}, getAuthHeaders());
export const saveWorkOrder = (data) => axios.post(`${API_URL}/WorkOrderSave`, data, getAuthHeaders());
export const deleteWorkOrder = (id) => axios.post(`${API_URL}/WorkOrderDelete`, { id }, getAuthHeaders());

// Production Entry APIs
export const getProductionEntries = () => axios.post(`${API_URL}/ProductionEntryList`, {}, getAuthHeaders());
export const saveProductionEntry = (data) => axios.post(`${API_URL}/ProductionEntrySave`, data, getAuthHeaders());

// Reuse existing Employee Master API
export const getEmployees = () => axios.post(`${API_URL}/GetEmployeesDropdown`, {}, getAuthHeaders());