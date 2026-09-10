import React from "react";
import CIcon from "@coreui/icons-react";
import { cilCog } from "@coreui/icons";
import { CNavGroup, CNavItem } from "@coreui/react";
import { AiOutlineAudit, AiOutlineFileSync } from "react-icons/ai";
import { FaAnglesUp, FaClipboardUser, FaCodeBranch, FaLocationPinLock, FaUserCheck, FaUserLock, FaUserPlus, FaUsers, FaUserShield, FaUsersLine } from "react-icons/fa6";
import { TbAntenna, TbDeviceGamepad, TbExchange, TbMoneybag, TbSettings2, TbStatusChange } from "react-icons/tb";
import { BsBellFill, BsBezier2, BsBoxes, BsCrosshair, BsDatabaseAdd, BsDiagram3, BsFileArrowDown, BsFileCheck, BsFileEarmarkX, BsFilePdf, BsFiles, BsGeo, BsJournals, BsLink, BsPatchCheck, BsPatchPlus, BsRecycle, BsSliders, BsSpeedometer2, BsTools, BsUnlock, BsWrenchAdjustableCircle } from "react-icons/bs";
import { IoLocationOutline, IoLogInOutline, IoMapSharp, IoSearchOutline, IoSettingsOutline } from "react-icons/io5";
import { DeviceHub, ReadMore } from "@mui/icons-material";
import { FaHistory, FaRunning } from "react-icons/fa";

const _nav = [

  // Dashboard
  {
    component: CNavItem,
    name: "Dashboard",
    screenid: 'DA001',
    to: "/dashboard",
    icon: <BsSpeedometer2 className="fs-6" />,
    roles: ['admin', 'user'],
  },

  //Branch
  {
    component: CNavGroup,
    name: "Branch Master",
    screenid: 'BM001',
    to: "/branchmaster",
    icon: <FaLocationPinLock className="fs-6 " />,
    items: [
      {
        component: CNavItem,
        name: "Super Admin",
        screenid: 'SA001',
        to: "/branchmaster/userperusercreate",
        icon: <FaUserLock className="ms-2" />,
      },
      {
        component: CNavGroup,
        name: "Branch Config",
        screenid: 'BM001',
        to: "/branchmaster/config",
        icon: <CIcon icon={cilCog} className="ms-2" />,
        items: [
          {
            component: CNavItem,
            name: "Branches",
            screenid: 'BM001',
            to: "/branchmaster/config/branches",
            icon: <FaCodeBranch className="ms-4 fs-6 me-0" />,
          },
        ]
      },
    ]
  },
  // User Creation
  {
    component: CNavGroup,
    name: "User Creation",
    screenid: 'UC001' || 'UC002',
    to: "/usercreation",
    icon: <FaUserPlus className="fs-6" />,
    items: [
      {
        component: CNavItem,
        name: "All Users",
        screenid: 'UC001',
        to: "/usercreation/allusers",
        icon: <FaUsers className="ms-2" />,
      },
      {
        component: CNavGroup,
        name: "User Config",
        screenid: 'UC002',
        to: "/usercreation/config",
        icon: <CIcon icon={cilCog} className="ms-2" />,
        items: [
          {
            component: CNavItem,
            name: "User Role",
            screenid: 'UC002',
            to: "/usercreation/config/userrole",
            icon: <FaUserCheck className="ms-4 me-2" />,
          }
        ],
      },
    ],
  },
  // User Privileges
  {
    component: CNavItem,
    name: "User Privileges",
    to: "/userauthenticate/userauth",
    screenid: 'UA001',
    icon: <FaUserShield className="fs-6" />,
  },

  {
    component: CNavGroup,
    name: "Production",
    screenid: 'PD001' || 'PD002' || 'PD003' || 'PD004',
    icon: <BsBoxes className="fs-6" />,
    items: [

      // {
      //   component: CNavItem,
      //   name: "QR generate",
      //   screenid: 'PD001',
      //   to: "/Production/QRCodeCreation",
      //   icon: <BsJournals className="ms-2" />,
      // },
      {
        component: CNavItem,
        name: "Work Order",
        screenid: 'PD002',
        to: "/Production/WorkOrder",
        icon: <BsJournals className="ms-2" />,
      },
      // {
      //   component: CNavItem,
      //   name: 'Picking',
      //   to: '/Production/Picking',
      //   icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path></svg>, // Or use your existing icon component like <cil-cart />
      // },
      {
        component: CNavItem,
        name: "Production Entry",
        screenid: 'PD003',
        to: "/Production/ProductionEntry",
        icon: <BsFileCheck className="ms-2" />,
      },
      {
        component: CNavItem,
        title: "Replace History",
        screenid: 'PD004',
        to: "/Production/ReplaceHistory",
        icon: "Replaced-history",
      }
    ],
  },

  // {
  //   component: CNavItem,
  //   name: "Employee Details",
  //   screenid: 'EMP001',
  //   to: "/EmployeeMaster",
  //   icon: <FaUsersLine className="fs-6" />,
  // },

  // Asset Config
  {
    component: CNavItem,
    name: "Master",
    to: "/Settings/Configure",
    icon: <BsSliders className="" />,
    screenid: 'ST001'
  },

  // // Manage Asset
  // {
  //   component: CNavGroup,
  //   name: "Manage Asset",
  //   // to: "/ManageAsset",
  //   screenid: 'AR001' || 'AR002' || 'AR003' || 'AR004',
  //   icon: <BsDatabaseAdd className="fs-6" />,
  //   items: [
  //     {
  //       component: CNavItem,
  //       name: "New Register",
  //       screenid: 'AR001',
  //       to: "/ManageAsset/NewRegister",
  //       icon: <BsBoxes className="ms-2" />,
  //     },
  //     {
  //       component: CNavItem,
  //       name: "Registered Assets",
  //       screenid: 'AR002',
  //       to: "/ManageAsset/RegisterDetais",
  //       icon: <BsJournals className="ms-2" />,
  //     },
  //     {
  //       component: CNavItem,
  //       name: "With RFID",
  //       screenid: 'AR003',
  //       to: "/ManageAsset/WithRFID",
  //       icon: <BsDiagram3 className="ms-2" />,
  //     },
  //     {
  //       component: CNavItem,
  //       name: "Without RFID",
  //       screenid: 'AR004',
  //       to: "/ManageAsset/WithOutRFID",
  //       icon: <BsCrosshair className="ms-2" />,
  //     },

  //   ]
  // },
  // Asset Mapped With Employee
  // {
  //   component: CNavGroup,
  //   name: "Allocated / Recover",
  //   screenid: 'MA001' || 'MA002',
  //   icon: <BsRecycle className="fs-6" />,
  //   items: [
  //     {
  //       component: CNavItem,
  //       name: "Allocate Asset",
  //       screenid: 'MA001',
  //       to: "/Allocated_Release/Allocated_assets",
  //       icon: <BsLink className="ms-2" />,
  //     },
  //     {
  //       component: CNavItem,
  //       name: "Recover Asset",
  //       screenid: 'MA002',
  //       to: "/Allocated_Release/Release_assets",
  //       icon: <BsUnlock className="ms-2" />,
  //     }

  //   ]
  // },
  // Asset Maintenance
  // {
  //   component: CNavGroup,
  //   name: "Maintenance",
  //   to: "/Maintanance",
  //   screenid: 'MR001' || 'MR002' || 'MR003',
  //   icon: <BsWrenchAdjustableCircle className="fs-6" />,
  //   items: [
  //     {
  //       component: CNavItem,
  //       name: "Maintenance Register",
  //       screenid: 'MR001',
  //       to: "/Maintenance/PreMaintenance",
  //       icon: <BsPatchPlus className="ms-2" />,
  //     },
  //     {
  //       component: CNavItem,
  //       name: "Scrap Register",
  //       screenid: 'MR003',
  //       to: "/Maintenance/ScrapRegister",
  //       icon: <BsRecycle className="ms-2" />,
  //     },
  //     {
  //       component: CNavItem,
  //       name: "Maintenance Done",
  //       screenid: 'MR002',
  //       to: "/Maintenance/PostMaintenance",
  //       icon: <BsPatchCheck className="ms-2" />,
  //     }

  //   ]
  // },
  // Asset Movement
  // {
  //   component: CNavGroup,
  //   name: "Asset Movement",
  //   to: "/ManageAsset",
  //   screenid: 'AM001' || 'AM002' || 'AM003',
  //   icon: <TbExchange className="fs-6" />,
  //   items: [
  //     {
  //       component: CNavItem,
  //       name: "Internal Transfer",
  //       screenid: 'AM001',
  //       to: "/Movement/InternalTransfer",
  //       icon: <IoLocationOutline className="ms-2" />,
  //     },
  //     {
  //       component: CNavItem,
  //       name: "External Transfer",
  //       screenid: 'AM002',
  //       to: "/Movement/ExternalTransfer",
  //       icon: <IoMapSharp className="ms-2" />,
  //     },
  //     {
  //       component: CNavItem,
  //       name: "Inward Asset",
  //       screenid: 'AM003',
  //       to: "/Movement/InwardAsset",
  //       icon: <IoLogInOutline className="ms-2" />,
  //     }
  //   ]
  // },
  // // Asset Movement History
  // {
  //   component: CNavItem,
  //   name: "Movement History",
  //   screenid: 'MH001',
  //   to: "/Movement/MovementHistory",
  //   icon: <BsBezier2 className="fs-6" />,
  // },

  // Asset Config
  // {
  //   component: CNavItem,
  //   name: "Geo Fence",
  //   screenid: 'GF001',
  //   to: "/API/GeoFence",
  //   icon: <BsGeo className="fs-6" />,
  // items: [
  //   {
  //     component: CNavItem,
  //     name: "Geo Fence",
  //     screenid: 'GF001',
  //     to: "/API/GeoFence",
  //     icon: <BsGeo className="ms-2" />,
  //   }
  // ]






  {
    component: CNavItem,
    name: "Mould Mapping",
    to: "/MouldMapping",
    screenid: 'RS001',
    icon: <BsLink className="fs-5" />
  },
  {
    component: CNavItem,
    name: "Reminder Settings",
    to: "/ReminderSettings",
    screenid: 'RS001',
    icon: <BsBellFill className="fs-6" />
  },
  {
    component: CNavItem,
    name: "Scheduler Settings",
    to: "/SchedulerSettings",
    screenid: 'SCH01',
    icon: <BsBellFill className="fs-6" />
  },


  {
    component: CNavItem,
    name: "Attachments",
    to: "/Attachments",
    screenid: 'AT001',
    icon: <BsFilePdf className="fs-6" />
  },

  // Mobile Scan
  {
    component: CNavItem,
    name: "Mobile Scan",
    to: "/Mobile/AuditScan",
    screenid: 'IV001',
    icon: <IoSearchOutline className="fs-6" />,

  },
  // Mobile Scan
  {
    component: CNavItem,
    name: "Asset History",
    to: "/Audit/AssetAudit",
    screenid: 'AA001',
    icon: <BsBezier2 className="fs-6" />,
  },

  //RFID Setting
  {
    component: CNavGroup,
    name: "Reader Settings",
    screenid: 'DS001' || 'DS002' || 'DS003' || 'DS004' || 'DS005' || 'DS006',
    icon: <ReadMore className="fs-6 " />,
    items: [
      {
        component: CNavItem,
        name: "Antenna Power Level",
        screenid: 'DS001',
        to: "/Settings/AntennaPowerLevel",
        icon: <TbAntenna className="ms-2 fs-6" />,
      },
      {
        component: CNavItem,
        name: "RFID Device Master",
        screenid: 'DS002',
        to: "/Settings/RFIDReaderDeviceMaster",
        icon: <TbDeviceGamepad className="ms-2 fs-6" />,
      },
      {
        component: CNavItem,
        name: "Reader Status Log",
        screenid: 'DS003',
        to: "/Settings/ReaderStatuslog",
        icon: <FaAnglesUp className="ms-2 fs-6" />,
      },
      {
        component: CNavItem,
        name: "Antenna Status Log",
        screenid: 'DS004',
        to: "/Settings/AntennaStatuslog",
        icon: <TbAntenna className="ms-2 fs-6" />,
      },
      {
        component: CNavItem,
        name: "RFID Device Status",
        screenid: 'DS005',
        to: "/Settings/DeviceStatus",
        icon: <TbStatusChange className="ms-2 fs-6" />,
      },
      {
        component: CNavItem,
        name: "Antenna RSSI Settings",
        screenid: 'DS006',
        to: "/Settings/AntennaRSSISettings",
        icon: <TbSettings2 className="ms-2 fs-6" />,
      },
    ],
  },

  // Manage Asset
  {
    component: CNavGroup,
    name: "Report",
    to: "/Reports",
    screenid: 'RP001' || 'RP002' || 'RP003' || 'RP004' || 'RP005' || 'RP006' || 'RP007' || 'RP008' || 'RP009',
    icon: <BsJournals className="fs-6" />,
    items: [
      {
        component: CNavItem,
        name: "All Asset Report",
        screenid: 'RP001',
        to: "/Reports/AllAssetReport",
        icon: <BsFiles className="ms-2" />,
      },
      {
        component: CNavItem,
        name: "Internal Transfer Report",
        screenid: 'RP002',
        to: "/Reports/InternalTransferReport",
        icon: <BsFileCheck className="ms-2" />,
      },
      {
        component: CNavItem,
        name: "External Transfer Report",
        screenid: 'RP003',
        to: "/Reports/ExternalTransferReport",
        icon: <BsFileArrowDown className="ms-2" />,
      },
      {
        component: CNavItem,
        name: "Under-Maintenance",
        screenid: 'RP004',
        to: "/Reports/MaintenanceReport",
        icon: <BsTools className="ms-2" />,
      },
      {
        component: CNavItem,
        name: "Maintenance Done Report",
        screenid: 'RP005',
        to: "/Reports/PostMaintenanceReport",
        icon: <AiOutlineFileSync className="ms-2" />,
      },
      {
        component: CNavItem,
        name: "Audit consolidate Report",
        screenid: 'RP006',
        to: "/Reports/AuditConsolidateReport",
        icon: <AiOutlineAudit className="ms-2" />,
      },
      {
        component: CNavItem,
        name: "Scrap Report",
        screenid: 'RP007',
        to: "/Reports/ScrapReport",
        icon: <BsFileEarmarkX className="ms-2" />,
      },
      {
        component: CNavItem,
        name: "Allocated History Report",
        screenid: 'RP008',
        to: "/Reports/AllocatedtHistoryReport",
        icon: <FaHistory className="ms-2" />,
      },
      {
        component: CNavItem,
        name: "Printed Log Report",
        screenid: 'RP009',
        to: "/Reports/PrintedLogReport",
        icon: <FaHistory className="ms-2" />,
      }


    ]
  },

  //General Setting
  {
    component: CNavItem,
    name: "General Settings",
    screenid: 'SE002',
    to: "/setting/generalsetup",
    icon: <IoSettingsOutline className="fs-6 " />
  },
  {
    component: CNavItem,
    name: "Login Details",
    screenid: 'LD001',
    to: "/log/logdetails",
    icon: <FaUsersLine className="ms-2 fs-6" />
  },
  {
    component: CNavItem,
    name: "Digital Profile",
    screenid: 'DP001',
    to: "/digitalprofile",
    icon: <FaClipboardUser className="fs-6 " />,
  },
];

export default _nav;
