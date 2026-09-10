import { element } from "prop-types";
import React from "react";


// Basic need for template
const DashAnalytics = React.lazy(() => import("../src/views/dashboard/index"))
const SuperAdmin = React.lazy(() => import('./views/branchmaster/Superusercreate'))
const Branches = React.lazy(() => import('./views/branchmaster/config/Branches'))

const Allusers = React.lazy(() => import('./views/usercreation/Allusers'))
const Adduser = React.lazy(() => import('./views/usercreation/Adduser'))
const Edituser = React.lazy(() => import('./views/usercreation/Edituser'))
const Userrole = React.lazy(() => import('./views/usercreation/config/Userrole'))

// [retired 26-Aug-2026] Allemployees (Employee.js) and Department
// (config/Department.js) removed — legacy screens hidden from the menu whose
// backend SPs no longer exist; replaced by Configure > Employee Master and
// Configure > Department. Files in .backup_20260826/deleted/.

const Userauth = React.lazy(() => import('./views/userauth/Userauth'))
const Screenmaster = React.lazy(() => import('./views/userauth/config/Screenmaster'))

const Logdetails = React.lazy(() => import('./views/logdetails/Logdetails'))

const digitalprofile = React.lazy(() => import('./views/digitalprofile/Digitalprofile'))

const Generalsetting = React.lazy(() => import('./views/setting/Generalsetting'))

// Basic need for template


const NewRegister = React.lazy(() => import("./views/ManageAsset/ManageAssetTAble/RegisterAssetTable"));
const AddRegister = React.lazy(() => import("./views/ManageAsset/AddRegister"));
const RegisterDetails = React.lazy(() => import("./views/ManageAsset/RegisterDetails"));
const MaptoEmp = React.lazy(() => import("./views/ManageAsset/WithRFID"));
const UnmapAsset = React.lazy(() => import("./views/ManageAsset/WithOutRFID"));
const PreMaintenance = React.lazy(() => import("./views/Maintenance/PreMaintenance_test"));
const ScrapRegister = React.lazy(() => import("./views/Maintenance/ScrabRegister"));
const PostMaintenance = React.lazy(() => import("./views/Maintenance/PostMaintenance_test"));
const InternalTransfer = React.lazy(() => import("./views/Movement/InternalTransfer"));
const ExternalTransfer = React.lazy(() => import("./views/Movement/ExternalTransfer"));
const InwardAsset = React.lazy(() => import("./views/Movement/InwardAsset"));
const InventoryReport = React.lazy(() => import("./views/Reports/InventoryReport"));
const AssetAudit = React.lazy(() => import("./views/AssetAudit/AssetAudit"));
const AuditConsolidate = React.lazy(() => import("./views/Reports/AuditConsolidateReport"));
const AllReports = React.lazy(() => import("./views/Reports/AllReports"));
const InternalTransferReport = React.lazy(() => import("./views/Reports/InternalTransferReport"));
const ExternalTransferReport = React.lazy(() => import("./views/Reports/ExternalTransferReport"));
const PostMaintenanceReport = React.lazy(() => import("./views/Reports/PostMaintenanceReport"));
const MaintenanceReport = React.lazy(() => import("./views/Reports/MaintenanceReport"));
const ScrapReport = React.lazy(() => import("./views/Reports/ScrapReport"));
const PaymentHistoryReport = React.lazy(() => import("./views/Reports/PaymetHistoryReport"));
const AllocatedHistoryReport = React.lazy(() => import("./views/Reports/AllocatedHistory"));
const PrintLog = React.lazy(() => import('./views/Reports/PrintedLog'))
const DepartmentConfig = React.lazy(() => import("./views/Configure/Department"));
const MouldMaster = React.lazy(() => import("./views/Masters/MouldPartMaster"));
const FGMaster = React.lazy(() => import("./views/Masters/MouldMaster"));
const MachineMaster = React.lazy(() => import("./views/Masters/MachineMaster"));
const SupplierMaster = React.lazy(() => import("./views/Masters/SupplierMaster"));
const ShiftMaster = React.lazy(() => import("./views/Masters/ShiftMaster"));
const LocationMaster = React.lazy(() => import("./views/Masters/LocationMasters/LocationMaster"));
const LinkLocationMaster = React.lazy(() => import("./views/Masters/LocationMasters/LinkLocationMaster"));
const MouldTypeMaster = React.lazy(() => import("./views/Masters/MouldTypeMaster"));
const RackMaster = React.lazy(() => import("./views/Masters/LocationMasters/Rack"))
const RowMaster = React.lazy(() => import("./views/Masters/LocationMasters/Row"))
const UOMMaster = React.lazy(() => import("./views/Masters/UOMMaster"))
const MouldMapping = React.lazy(() => import("./views/Mould Mapping/MouldMapping"))





const AssetType = React.lazy(() => import("./views/Configure/AssetType"));
const IDgenerator = React.lazy(() => import("./views/Configure/IDgenerator"));
const Vendors = React.lazy(() => import("./views/Configure/Vendors"));
const Maintanance = React.lazy(() => import("./views/Configure/Maintenance"))
const Configure = React.lazy(() => import("./views/setting/Configure"))
const AuditScan = React.lazy(() => import("./views/Audit/AuditScan"))

// Reader settings
const AntennaPowerLevel = React.lazy(() => import("./views/ReaderSettings/AntennaPowerLevel"));
const RFIDDeviceMaster = React.lazy(() => import("./views/ReaderSettings/DeviceMaster/DeviceRegister"));
const AddDevice = React.lazy(() => import("./views/ReaderSettings/DeviceMaster/AddDevice"));
const ReaderStatuslog = React.lazy(() => import("./views/ReaderSettings/Statuslog/ReaderStatuslog"));
const AntennaStatuslog = React.lazy(() => import("./views/ReaderSettings/Statuslog/AntennaStatuslog"));
const DeviceStatus = React.lazy(() => import("./views/ReaderSettings/RFIDDeviceStatus/DeviceStatus"));
const AntennaRSSISettings = React.lazy(() => import("./views/ReaderSettings/AntennaRSSI/AntennaRSSISettings"));



// API
const GeoFence = React.lazy(() => import("./views/API/geofence"));
// Asset Allocate /Release
const Allocated_assets = React.lazy(() => import("./views/Allocated_Release/Allocated_assets"));
const Release_assets = React.lazy(() => import("./views/Allocated_Release/Release_assets"));
const EmployeeMaster = React.lazy(() => import("./views/Masters/EmployeeMaster"));
// Movement History
const MovementHistory = React.lazy(() => import("./views/Movement/MovementHistory"));
const Maintainedby = React.lazy(() => import("./views/Configure/MaintainedMaster"))
const AssetPackage = React.lazy(() => import("./views/Configure/AssetPackageMaster"))
const AssetGroup = React.lazy(() => import("./views/Configure/AssetGroupMaster"))
const Depreciation = React.lazy(() => import("./views/Configure/DepreciationMaster"))
const Attachments = React.lazy(() => import("./views/Attachment/Attachments"));
const ReminderTypesMaster = React.lazy(() => import("./views/Configure/RemiderTypes"));
const ReminderSettings = React.lazy(() => import("./views/ReminderSettings/ReminderSettings"));
const SchedulerSettings = React.lazy(() => import("./views/SchedulerSetting/SchedulerSetting"));

const routes = [
  { path: "/", exact: true, name: "Home" },
  { path: "/dashboard", name: "Dashboard", element: DashAnalytics },
  { path: "/branchmaster/userperusercreate", name: "Super Admin", element: SuperAdmin },
  { path: "/branchmaster/config/branches", name: "Branches", element: Branches },
  { path: "/usercreation", name: "User Creation" },
  { path: "/usercreation/allusers", name: "All Users", element: Allusers },
  { path: "/usercreation/adduser", name: "Add User", element: Adduser },
  { path: "/usercreation/edituser", name: "Edit User", element: Edituser },
  { path: "/usercreation/config", name: "User Config" },
  { path: "/usercreation/config/userrole", name: "User Role", element: Userrole },
  { path: "/userauthenticate", name: "User Previleges" },
  { path: "/userauthenticate/userauth", name: "User Previlege", element: Userauth },
  { path: "/userauthenticate/config/screenmaster", name: "Screenmaster", element: Screenmaster },


  { path: "/log", name: "Login Details" },
  { path: "/log/logdetails", name: "Login-Details", element: Logdetails },
  { path: "/digitalprofile", name: "Digital-Profile", element: digitalprofile },

  { path: "/setting", name: "Settings" },
  { path: "/setting/generalsetup", name: "General Settings", element: Generalsetting },

  // Screens
  // Manage Asset
  { path: "/ManageAsset", name: "Manage Asset" },
  { path: "/ManageAsset/NewRegister", name: "New Register", element: NewRegister },
  { path: "/ManageAsset/AddRegister", name: "New Register", element: AddRegister },
  { path: "/ManageAsset/RegisterDetais", name: "Registered Assets", element: RegisterDetails },
  { path: "/ManageAsset/WithRFID", name: "With RFID", element: MaptoEmp },
  { path: "/ManageAsset/WithOutRFID", name: "Without RFID", element: UnmapAsset },

  // Asset Maintenance
  { path: "/Maintanance", name: "Maintenance" },
  { path: "/Maintenance/PreMaintenance", name: "Maintenance Register", element: PreMaintenance },
  { path: "/Maintenance/ScrapRegister", name: "Scrap Register", element: ScrapRegister },
  { path: "/Maintenance/PostMaintenance", name: "Maintenance Done", element: PostMaintenance },

  // Asset Movement
  { path: "/Movement", name: "Movement" },
  { path: "/Movement/InternalTransfer", name: "Internal Location Transfer", element: InternalTransfer },
  { path: "/Movement/ExternalTransfer", name: "External Location Transfer", element: ExternalTransfer },
  { path: "/Movement/InwardAsset", name: "Inward Asset", element: InwardAsset },

  // Mobile Scan
  { path: "/Mobile", name: "Mobile" },
  { path: "/Mobile/AuditScan", name: "Asset Inventory", element: AuditScan },

  // Asset History
  { path: "/Audit", name: "Audit" },
  { path: "/Audit/AssetAudit", name: "Asset History", element: AssetAudit },

  // Asset Config
  { path: "/Config", name: "Config" },
  { path: "/Settings/Configure", name: "Config", element: Configure },
  { path: '/Configure/MouldPartMaster', name: "Part Master", element: MouldMaster },
  { path: "/Configure/MachineMaster", name: "Machine Master", element: MachineMaster },
  { path: "/Configure/EmployeeMaster", name: "Employee Master", element: EmployeeMaster },
  { path: "/Configure/SupplierMaster", name: "Supplier Master", element: SupplierMaster },
  { path: "/Configure/ShiftMaster", name: "Supplier Master", element: ShiftMaster },
  { path: "/Configure/LinkLocationMaster", name: "Location", element: LinkLocationMaster },
  { path: "/Configure/LocationMaster", name: "Location", element: LocationMaster },
  { path: "/Configure/MouldMaster", name: "FG", element: FGMaster },
  { path: "/Configure/MouldTypeMaster", name: "PartType", element: MouldTypeMaster },
  { path: "/Configure/RackMaster", name: "Rack", element: RackMaster },
  { path: "/Configure/RowMaster", name: "Rack", element: RowMaster },
  { path: "/Configure/UOMMaster", name: "UOM", element: UOMMaster },
  { path: "/MouldMapping", name: "MouldMapping", element: MouldMapping },







  { path: "/Configure/Department", name: "Department Config", element: DepartmentConfig },
  { path: "/Configure/Maintenance", name: "Maintenance Config", element: Maintanance },
  { path: "/Configure/Vendors", name: "Vendor Config", element: Vendors },
  { path: "/Configure/IDgenerator", name: "ID Config", element: IDgenerator },
  { path: "/Configure/AssetType", name: "Asset Type", element: AssetType },
  { path: "/Configure/Maintained", name: "Asset Maintained By", element: Maintainedby },
  { path: "/Configure/AssetPackage", name: "Asset Package", element: AssetPackage },
  { path: "/Configure/AssetGroup", name: "Asset Group", element: AssetGroup },
  { path: "/Configure/Depreciation", name: "Asset Depreciation", element: Depreciation },
  { path: "/Configure/ReminderType", name: "Reminder Type", element: ReminderTypesMaster },
  { path: "/ReminderSettings", name: "Reminder Setting", element: ReminderSettings },
  { path: "/SchedulerSettings", name: "Scheduler Settings", element: SchedulerSettings },

  // Report
  { path: "/Reports", name: "Report" },
  { path: "/Reports/AllAssetReport", name: "All Asset Report", element: AllReports },
  { path: "/Reports/InternalTransferReport", name: "Internal Transfer Report", element: InternalTransferReport },
  { path: "/Reports/ExternalTransferReport", name: "External Transfer Report", element: ExternalTransferReport },
  { path: "/Reports/MaintenanceReport", name: "Under-Maintenance Report", element: MaintenanceReport },
  { path: "/Reports/PostMaintenanceReport", name: "Maintenance Done Report", element: PostMaintenanceReport },
  { path: "/Reports/AuditReport", name: "Audit Report", element: InventoryReport },
  { path: "/Reports/AuditConsolidateReport", name: "Audit Report", element: AuditConsolidate },
  { path: "/Reports/ScrapReport", name: "Scrap Report", element: ScrapReport },
  { path: "/Reports/PaymentHistoryReport", name: "Payment History Report", element: PaymentHistoryReport },
  { path: "/Reports/AllocatedtHistoryReport", name: "Allocated History Report", element: AllocatedHistoryReport },
  { path: "/Reports/PrintedLogReport", name: "Print Log Report", element: PrintLog },

  // Reader Settings
  { path: "/Settings/AntennaPowerLevel", name: "Antenna Power Level", element: AntennaPowerLevel },
  { path: "/Settings/RFIDReaderDeviceMaster", name: "RFID Reader Device Master", element: RFIDDeviceMaster },
  { path: "/Settings/AddNewDevice", name: "RFID Reader Device Master", element: AddDevice },
  { path: "/Settings/ReaderStatuslog", name: "Reader Status Log", element: ReaderStatuslog },
  { path: "/Settings/AntennaStatuslog", name: "Antenna Status Log", element: AntennaStatuslog },
  { path: "/Settings/DeviceStatus", name: "RFID Device Status", element: DeviceStatus },
  { path: "/Settings/AntennaRSSISettings", name: "Antenna RSSI Settings", element: AntennaRSSISettings },

  // API
  { path: "/API/GeoFence", name: "GEO FENCE", element: GeoFence },
  { path: "/Attachments", name: "Attachments", element: Attachments },

  // Asset Allocate/Release
  { path: '/Allocated_Release/Allocated_assets', name: "Allocate Assets", element: Allocated_assets },
  { path: '/Allocated_Release/Release_assets', name: "Release Assets", element: Release_assets },
  { path: '/EmployeeMaster', name: "Employee Master", element: EmployeeMaster },

  // Movement History
  { path: '/Movement/MovementHistory', name: "Movement History", element: MovementHistory }

];

export default routes;
