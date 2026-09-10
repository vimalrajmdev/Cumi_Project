import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  CAvatar,
  CDropdown,
  CDropdownHeader,
  CDropdownItem,
  CDropdownMenu,
  CDropdownToggle,
  CHeaderDivider,
} from '@coreui/react'
import {
  cilLockLocked,
  cilPowerStandby,
  cilSettings,
  cilUser,
} from '@coreui/icons'
import CIcon from '@coreui/icons-react'

import avatar8 from './../../assets/images/avatars/10.png'
import axios from "axios";
import PropTypes from 'prop-types'
import secureLocalStorage from 'react-secure-storage';
import { getConfig } from 'src/config';
const AppHeaderDropdown = ({ auth, ipAddress }) => {
  const API_URL = getConfig().REACT_APP_API_URL;
  const navigate = useNavigate();
  const [image, setImage] = useState(null);
  const [imagedata, setimagedata] = useState(null);
  const role = auth.userrole.toLowerCase()



  useEffect(() => {
    fetchpaymentmode();
  }, []);

  const handleClearLocalStorage = async () => {
    try {
      const alldata = { usercode: auth.usercode, username: auth.employeename, status: 'logout', ipAddress, mood: 'I', branchid: auth.branchid }
      await axios.post(`${API_URL}/loginhistory`, alldata)
    } catch (error) {
      console.error('Error recording logout:', error);
    } finally {
      // always end the session locally, even if the API call failed.
      // secureLocalStorage.clear() also drops the library's IN-MEMORY cache —
      // localStorage.clear() alone leaves the session readable until a reload.
      secureLocalStorage.clear();
      localStorage.clear();
      navigate('/', { replace: true });
    }
  };



  const fetchpaymentmode = async () => {
    try {
      // debugger;
      if (localStorage.getItem("profileimage") != "") {
        setimagedata(localStorage.getItem("profileimage"));
      }
      else {
        setimagedata(avatar8);
      }
    } catch (error) {
      console.error('Error fetching staff data:', error);
    }
  };





  return (
    <CDropdown variant="nav-item">
      {/* Avatar Button */}
      <CDropdownToggle
        placement="bottom-end"
        className="py-0 pe-0 border-0 bg-transparent"
        caret={false}
      >
        <CAvatar
          src={avatar8}
          size="md"
          className="shadow-sm border rounded-circle cursor-pointer"
        />
      </CDropdownToggle>

      {/* Dropdown Menu */}
      <CDropdownMenu
        placement="bottom-end"
        className="dropdown-menu-end shadow-lg border-0 rounded-4 p-0"
        style={{ minWidth: '230px' }}
      >
        {/* Header */}
        <div className="border-bottom text-center bg-light  mb-2">
          <div className="fw-semibold text-dark">
            {auth.employeename || 'User Name'}
          </div>
          <small className="text-muted">Logged in</small>
        </div>

        {/* Menu Items */}
        <div className="py-2">
          <CDropdownItem
            href="#/digitalprofile"
            className="d-flex align-items-center gap-2 dropdown-item-custom"
          >
            <CIcon icon={cilUser} className="text-primary" />
            Profile
          </CDropdownItem>

          <CDropdownItem
            href="#/setting/generalsetup"
            className="d-flex align-items-center gap-2 dropdown-item-custom"
          >
            <CIcon icon={cilSettings} className="text-primary" />
            Settings
          </CDropdownItem>
        </div>

        <CHeaderDivider className="my-1" />

        {/* Sign Out */}
        <CDropdownItem
          onClick={handleClearLocalStorage}
          className="d-flex align-items-center gap-2 text-danger dropdown-item-custom"
        >
          <CIcon icon={cilPowerStandby} />
          Sign Out
        </CDropdownItem>
      </CDropdownMenu>
    </CDropdown>

  )
}


AppHeaderDropdown.propTypes = {
  auth: PropTypes.any, // Replace 'any' with the appropriate type based on what 'auth' contains
  ipAddress: PropTypes.any,
};

export default AppHeaderDropdown
