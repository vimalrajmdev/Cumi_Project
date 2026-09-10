import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import PropTypes from 'prop-types'; // Import PropTypes
import {
  CCloseButton,
  CImage,
  CSidebar,
  CSidebarBrand,
  CSidebarFooter,
  CSidebarHeader,
  CSidebarToggler,
} from '@coreui/react';
import { AppSidebarNav } from './AppSidebarNav';

// import Logofull from "../../src/assets/images/bsl.png";
import Logofull from "../../src/assets/images/CUMI .LOGO.jpeg";
// import Logofull from "../../src/assets/images/Apple_logo.png";

// import Logo from "../../src/assets/images/bsl.png";
import Logo from "../../src/assets/images/apple-logo.png";

// sidebar nav config
//import navigation from '../_nav';
import _nav from '../_nav';


const AppSidebar = ({ auth, pageData }) => {
  const dispatch = useDispatch();
  const unfoldable = useSelector((state) => state.sidebarUnfoldable);
  const sidebarShow = useSelector((state) => state.sidebarShow);

  return (
    <CSidebar
      className="border-end shadow-lg sidebar-hover"
      colorScheme="light"
      position="fixed"
      unfoldable={unfoldable}
      visible={sidebarShow}
      onVisibleChange={(visible) => {
        dispatch({ type: 'set', sidebarShow: visible });
      }}
    >
      <CSidebarHeader className="border-bottom d-flex justify-content-center"
        // style={{ backgroundColor: 'rgb(17, 17, 17)' }}
        style={{ background: 'linear-gradient(to right, #f1f1f1ff)' ,height: '150px'}}
      >
        <CSidebarBrand to="/" className='me-2 pb-2' >
          <CImage src={Logofull} className="sidebar-brand-full" style={{ width: '200px', height: '140px' }} />
          <CImage src={Logofull} className="sidebar-brand-narrow w-100 h-100" />
        </CSidebarBrand>
        <CCloseButton
          className="d-lg-none"
          dark
          onClick={() => dispatch({ type: 'set', sidebarShow: false })}
        />
      </CSidebarHeader>

      <AppSidebarNav items={_nav} className='sidebar-hover' auth={auth} pageData={pageData} />

      <CSidebarFooter className="border-top">
        {/* <CImage src={Logofull1} className="sidebar-brand-full w-75 h-78 " /> */}
        {/* <CImage src={Logo1} className="sidebar-brand-narrow w-50 h-50" /> */}
        <CSidebarToggler

          className='border shadow-lg'
          onClick={() => dispatch({ type: 'set', sidebarUnfoldable: !unfoldable })}
        />

      </CSidebarFooter>
    </CSidebar>
  );
};

AppSidebar.propTypes = {
  auth: PropTypes.any, // Replace 'any' with the appropriate type based on what 'auth' contains
  pageData: PropTypes.any
};

export default React.memo(AppSidebar);
