import React, { useRef, useState } from "react";
import PropTypes from 'prop-types';
import Logo1 from "../../../assets/images/Apple_logo.png";
import Swal from 'sweetalert2';
import { Navigate, useNavigate } from "react-router-dom";
import swal from 'sweetalert';
import axios from "axios";
import secureLocalStorage from "react-secure-storage";
import { getConfig } from 'src/config';
import { FaApple } from 'react-icons/fa';
import styles from './LoginTest.module.scss';

const Login = ({ setAuth, GetPagedata, ipAddress }) => {
  const [loginData, setLoginData] = useState({ username: '', password: '' });
  const [navigateto, setnavigateto] = useState('');
  const navigate = useNavigate();
  const API_URL = getConfig().REACT_APP_API_URL;
  const rfidBtnRef = useRef(null);

  const handleRfidClick = (e) => {
    const btn = rfidBtnRef.current;
    if (!btn) return;

    const ripple = document.createElement('span');
    const rect = btn.getBoundingClientRect();
    const x = e.nativeEvent.offsetX;
    const y = e.nativeEvent.offsetY;
    const size = Math.max(rect.width, rect.height);

    ripple.className = styles.ripple;
    ripple.style.width = ripple.style.height = `${size}px`;
    ripple.style.left = `${x - size / 2}px`;
    ripple.style.top = `${y - size / 2}px`;

    btn.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);
  };

  const handleLogin = async () => {
    if (!loginData.username || !loginData.password) {
      swal({ text: 'Please enter both User ID and Password', icon: 'warning' });
      return;
    }

    try {
      const response = await axios.post(`${API_URL}/login`, { ...loginData, ipAddress });
      if (response.status === 200) {
        const userdata = { ...response.data.send, ipAddress };
        const pagedata = response.data.pagedata || [];

        setAuth(userdata);
        GetPagedata(pagedata);
        secureLocalStorage.setItem("userData", userdata);
        secureLocalStorage.setItem("pageData", pagedata);
        if (response.data.token) {
          // JWT attached to every later API call by the axios interceptor
          // (src/authSetup.js) and to the dashboard WebSocket URL.
          secureLocalStorage.setItem("authToken", response.data.token);
        }

        const userrole = response.data.send.userrole.toLowerCase();
        const firstlogin = response.data.send.firstlogin;
        const accountStatus = response.data.send.accountStatus;
        const daysUntilExpire = response.data.send.daysUntilExpire;
        const ExpirationAlert = response.data.send.ExpirationAlert;

        if (userdata.UserStatus === 'SA') {
          setnavigateto('Dashboard');
          return;
        }

        if (accountStatus === 'Expired') {
          swal({ text: 'Your Password has expired. Please change it.', icon: 'warning' });
          setnavigateto('Expirepassword');
        } else if (firstlogin === 1) {
          swal({ text: 'Please change your temporary password.', icon: 'warning' });
          setnavigateto('RestPasswordFirstLogin');
        } else {
          setnavigateto('Dashboard');
          if (daysUntilExpire <= 5) {
            swal({ text: `Your Password ${ExpirationAlert}`, icon: 'warning' });
          } else {
            let timerInterval;
            Swal.fire({
              icon: 'success',
              title: "Login Successfully",
              timer: 700,
              showConfirmButton: false,
              didOpen: () => {
                const timer = Swal.getPopup().querySelector("b");
                if (timer) {
                  timerInterval = setInterval(() => {
                    timer.textContent = `${Swal.getTimerLeft()}`;
                  }, 100);
                }
              },
              willClose: () => clearInterval(timerInterval)
            });
          }
        }
      }
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'Login failed';
      swal({ text: errorMessage, icon: 'error' });
    }
  };

  if (navigateto) return <Navigate to={`/${navigateto}`} replace />;

  return (
    
    <div className={styles.appContainer}>
      <div className={styles.bgCircles}>
        <div className={styles.circle}></div>
        <div className={styles.circle}></div>

        {/* Multiple ripple waves */}
        <div className={styles.waveBeam}></div>
        <div className={styles.waveBeam}></div>
        <div className={styles.waveBeam}></div>
      </div>
      {/* Login Card */}
      <div className={styles.loginContainer}>
        <div className={styles.logo}>
          <img src={Logo1} alt="Logo" width="100" />
        </div>
        <h1 className={styles.title} >RFID Asset Tracker</h1>
        <p className={styles.subtitle}>Secure • Real-Time</p>

        <div className={styles.form}>
          <div className={styles.inputGroup}>
            <label className={styles.label}>User ID</label>
            <input
              type="text"
              placeholder="User ID"
              className={styles.input}
              value={loginData.username}
              onChange={(e) => setLoginData({ ...loginData, username: e.target.value })}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
            />
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>Passcode</label>
            <input
              type="password"
              placeholder="••••••••"
              className={styles.input}
              value={loginData.password}
              onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
            />
          </div>
          <div className="text-end">
            <button type="button" className={styles.appleBtn} onClick={handleLogin}>
              <FaApple /> Login
            </button>
          </div>
        </div>


        <div className={styles.version}>Version: v5.1</div>
      </div>
    </div>
  );
};

Login.propTypes = {
  setAuth: PropTypes.func.isRequired,
  GetPagedata: PropTypes.func.isRequired,
  ipAddress: PropTypes.string
};

export default Login;