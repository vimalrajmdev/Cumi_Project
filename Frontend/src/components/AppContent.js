import React, { Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { CContainer, CSpinner } from '@coreui/react'
import PropTypes from 'prop-types'; // Import PropTypes


// routes config
import routes from '../routes'

const AppContent = ({ auth, ipAddress,pageData }) => {



  return (
    <CContainer fluid>
      <Suspense fallback={<CSpinner color="primary" />}>
        <Routes>
          {routes.map((route, idx) => {
            return (
              route.element && (
                <Route
                  key={idx}
                  path={route.path}
                  exact={route.exact}
                  name={route.name}
                  element={<route.element auth={auth} ipAddress={ipAddress} pageData={pageData}/>}
                />
              )
            )
          })}
          <Route path="/" element={<Navigate to="login" replace />} />
        </Routes>
      </Suspense>
    </CContainer>
  )
}

AppContent.propTypes = {
  auth: PropTypes.any,
  ipAddress: PropTypes.any,
    pageData: PropTypes.any
};

export default React.memo(AppContent)
