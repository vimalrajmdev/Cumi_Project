// export default App;
import React, { Suspense, useEffect, useState } from 'react'
import {
  unstable_HistoryRouter as HistoryRouter,
  Navigate,
  Route,
  Routes,
  useLocation
} from 'react-router-dom'
import PropTypes from 'prop-types'
import { createHashHistory } from 'history'

import './scss/style.scss'
import secureLocalStorage from 'react-secure-storage'
import '../src/views/css/loader.css'
import 'bootstrap/dist/css/bootstrap.min.css'
import '../src/scss/_custom.scss'
import { getConfig } from 'src/config';

// Future flags for React Router v7 compatibility
const futureConfig = {
  v7_startTransition: true,
  v7_relativeSplatPath: true,
}

// Create custom hash history (like HashRouter)
const history = createHashHistory()

const loading = (
  <div className="pt-3 text-center">
    <div className="sk-spinner sk-spinner-pulse"></div>
  </div>
)

// Guards the protected layout. It re-checks the login session in
// secureLocalStorage on EVERY navigation (including browser Back after
// logout) instead of trusting the auth state captured at mount — that stale
// state is what let the app screen reappear after Sign Out.
const RequireAuth = ({ auth, children }) => {
  useLocation() // re-evaluates this guard on every route change
  const storedUser = secureLocalStorage.getItem('userData')
  // secureLocalStorage keeps an in-memory cache, so also confirm the session
  // still physically exists in localStorage — after logout it does not.
  const persisted = Object.keys(window.localStorage).some((key) => key.endsWith('.userData'))
  if (!storedUser || !persisted || auth === null) {
    return <Navigate to="/" replace />
  }
  return children
}

RequireAuth.propTypes = {
  auth: PropTypes.any,
  children: PropTypes.node,
}

// Lazy loaded containers/pages
const DefaultLayout = React.lazy(() => import('./layout/DefaultLayout'))

const Login = React.lazy(() => import('./views/pages/login/Login'))
const Forgotpassword = React.lazy(() => import('./views/pages/forgotpassword/Forgotpassword'))
const Register = React.lazy(() => import('./views/pages/register/Register'))
const Page404 = React.lazy(() => import('./views/pages/page404/Page404'))
const Page500 = React.lazy(() => import('./views/pages/page500/Page500'))
const RestPasswordFirstLogin = React.lazy(() => import('./views/pages/firsttimelogin/Firsttimelogin'))
const Expirepassword = React.lazy(() => import('./views/pages/expirepassword/Expirepassword'))

function App() {
  const [auth, setAuth] = useState(secureLocalStorage.getItem("userData"))
  const [pagedata, setPagedata] = useState(secureLocalStorage.getItem("pageData"))
  const [ipAddress, setIPAddress] = useState(null)
  const API_URL = getConfig().REACT_APP_API_URL;
  
  useEffect(() => {
    const localData = () => {
      setAuth(secureLocalStorage.getItem("userData"))
      setPagedata(secureLocalStorage.getItem("pageData"))
    }
    const fetchLANIP = async () => {
      try {
        const response = await fetch(`${API_URL}/get-lan-ip`)
        const data = await response.json()
        setIPAddress(data.ip)
      } catch (error) {
        console.error('Error fetching LAN IP:', error)
      }
    }

    fetchLANIP();
    localData();
  }, [])

  return (
    <HistoryRouter history={history} future={futureConfig}>
      <Suspense fallback={loading}>
        <Routes>
          <Route path="/" element={<Login setAuth={setAuth} GetPagedata={setPagedata} ipAddress={ipAddress} />} />
          <Route path="/login" element={<Login setAuth={setAuth} GetPagedata={setPagedata} ipAddress={ipAddress} />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgotpassword" element={<Forgotpassword />} />
          <Route path="/404" element={<Page404 />} />
          <Route path="/500" element={<Page500 />} />
          <Route path="/RestPasswordFirstLogin" element={<RestPasswordFirstLogin />} />
          <Route path="/Expirepassword" element={<Expirepassword />} />
          <Route
            path="*"
            element={
              <RequireAuth auth={auth}>
                <DefaultLayout auth={auth} pageData={pagedata} ipAddress={auth?.ipAddress} />
              </RequireAuth>
            }
          />
        </Routes>
      </Suspense>
    </HistoryRouter>
  )
}

export default App