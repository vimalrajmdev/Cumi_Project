import axios from "axios";
import Swal from "sweetalert2";
import { getConfig } from 'src/config';   // adjust to your config

export const fetchInwardAsset = async (RFIDnumber, auth) => {
    const API_URL = getConfig().REACT_APP_API_URL;
    try {
        const alldata = {
            RFIDnumber,
            mode: "SED",
            branchid: auth.branchid,
            BranchAccess: auth.BranchAccess,
            Transferredbranchid: "",
            Receivedbranchid: "",
            Receivedby: "",
            PaidAmount: ""
        };

        const response = await axios.post(`${API_URL}/InwardAsset`, alldata);
        const data = response.data[0];

        if (response.status === 200) {
            if (data.RFID === "In-Active") {
                Swal.fire("In-Active Asset", "Please Try Inside Asset", "warning");
                return null;
            }
            if (data.MaintenanceDetails === "UnderMaintenance") {
                Swal.fire("Asset Under Maintenance", "Please Try Inside Asset", "warning");
                return null;
            }
            return data; // ✅ valid asset
        }
    } catch (err) {
        Swal.fire("Invalid Input", "Please Enter Valid RFID Number", "error");
        return null;
    }
};
