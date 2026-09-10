import React from 'react';
import { NavLink } from 'react-router-dom';
import PropTypes from 'prop-types';
import SimpleBar from 'simplebar-react';
import 'simplebar-react/dist/simplebar.min.css';
import { CBadge, CSidebarNav } from '@coreui/react';

export const AppSidebarNav = ({ items, auth, pageData }) => {

  // Convert all keys in pageData to lowercase.
  // This conversion handles nested objects as well.
  const lowerCasePageData = Object.fromEntries(
    Object.entries(pageData).map(([key, value]) => [
      key.toLowerCase(),
      typeof value === 'object' && value !== null
        ? Object.fromEntries(
          Object.entries(value).map(([k, v]) => [
            k.toLowerCase(),
            typeof v === 'string' ? v.toLowerCase() : v,
          ])
        )
        : typeof value === 'string'
          ? value.toLowerCase()
          : value,
    ])
  );

  const navLink = (name, icon, badge, indent = false) => (
    <>
      {icon ? (
        <span className="nav-icon">{icon}</span>
      ) : (
        indent && (
          <span className="nav-icon">
            <span className="nav-icon-bullet"></span>
          </span>
        )
      )}
      {name && name}
      {badge && (
        <CBadge color={badge.color} className="ms-auto">
          {badge.text}
        </CBadge>
      )}
    </>
  );

  const navItem = (item, index, indent = false) => {
    const { component: Component, name, screenid, badge, icon, ...rest } = item;

    // Convert the screenid to lowercase for lookup
    const screenId = screenid ? screenid.toLowerCase() : '';

    // Look up page data for this screenId
    const pageDataForScreen = lowerCasePageData[screenId] || {};

    // Authorization check using lowercase keys.
    // Skip this item if pageDataForScreen.screenid is not 'a' and the user isn't a super admin.
    if (pageDataForScreen.screenid !== 'a' && auth.UserStatus !== 'SA') {
      return null;
    }

    // console.log('====================================');
    // console.log('pageDataForScreen navitem',lowerCasePageData[screenId]);
    // console.log('====================================');
    return (
      <Component as="div" key={index}>
        {rest.to || rest.href ? (
          <NavLink
            {...rest}
            // Pass the entire pageData for the screen via navigation state
            state={{ pageData: pageDataForScreen }}
            className={({ isActive }) => `nav-link ${isActive ? 'nav-link-active' : ''}`}
          >
            {navLink(name, icon, badge, indent)}
          </NavLink>
        ) : (
          navLink(name, icon, badge, indent)
        )}
      </Component>
    );
  };

  //   const navGroup = (item, index) => {
  //     const { component: Component, name, screenid, icon, items, ...rest } = item;

  //     // Convert screenid to lowercase for lookup
  //     const screenId = screenid ? screenid.toLowerCase() : '';
  //     console.log('====================================');
  //     console.log('screenId nav group',screenId);
  //     console.log('====================================');
  // // Check if screenid is an array, and if so, map over each element and convert to lowercase
  // // const screenId = Array.isArray(screenid)
  // //   ? screenid.map(id => id.toLowerCase()) // Convert each element of the array to lowercase
  // //   : screenid ? screenid.toLowerCase() : ''; // For a single string, convert it to lowercase

  //     // Skip the group if not authorized
  //     if (lowerCasePageData[screenId]?.screenid !== 'a' && auth.UserStatus !== 'SA') {
  //       return null;
  //     }

  //     return (
  //       <Component compact as="div" key={index} toggler={navLink(name, icon)} {...rest}>
  //         {items?.map((subItem, subIndex) =>
  //           subItem.items ? navGroup(subItem, subIndex) : navItem(subItem, subIndex, true)
  //         )}
  //       </Component>
  //     );
  //   };


  const navGroup = (item, index) => {
    const { component: Component, name, icon, items, ...rest } = item

    // Recursive check: does any child item (or grandchild) pass authorization?
    const hasAuthorizedChild = (children) =>
      children?.some(subItem => {
        if (subItem.items) {
          return hasAuthorizedChild(subItem.items)
        } else {
          const subScreenId = subItem.screenid?.toLowerCase() || ''
          const subPageData = lowerCasePageData[subScreenId] || {}
          return subPageData.screenid === 'a' || auth.UserStatus === 'SA'
        }
      })

    if (!hasAuthorizedChild(items)) {
      return null
    }

    return (
      <Component compact as="div" key={index} toggler={navLink(name, icon)} {...rest}>
        {items?.map((subItem, subIndex) =>
          subItem.items ? navGroup(subItem, subIndex) : navItem(subItem, subIndex, true)
        )}
      </Component>
    )
  }

  return (
    <CSidebarNav as={SimpleBar}>
      {items && items.length > 0 ? (
        items.map((item, index) => {
          // console.log('====================================');
          // console.log('item', item);
          // console.log('====================================');
          return item.items ? navGroup(item, index) : navItem(item, index);
        })
      ) : (
        <p>No items available</p>
      )}
    </CSidebarNav>
  );
};

AppSidebarNav.propTypes = {
  items: PropTypes.arrayOf(PropTypes.any).isRequired,
  auth: PropTypes.shape({
    UserStatus: PropTypes.string.isRequired,
  }).isRequired,
  pageData: PropTypes.objectOf(PropTypes.object).isRequired,
};

export default AppSidebarNav;
