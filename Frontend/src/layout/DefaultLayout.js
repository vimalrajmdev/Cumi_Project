import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { AppContent, AppSidebar, AppFooter, AppHeader } from '../components/index';
import axios from 'axios';
import swal from 'sweetalert';
import secureLocalStorage from 'react-secure-storage';
import { useNavigate } from 'react-router-dom';
//test
import { getConfig } from 'src/config';
const DefaultLayout = ({ auth, pageData, ipAddress }) => {
  const API_URL = getConfig().REACT_APP_API_URL;
  const UserStatus = auth.UserStatus.toLowerCase()
  
  const LogoutTime = auth.AutoLogoutTime
  const navigate = useNavigate();

  const handleAutologout = () => {
    let countdown = 10; // Countdown starting from 10 seconds

    // Single dialog whose text is updated each second; clicking "Yes"
    // cancels the countdown, reaching zero closes it and logs out.
    const countdownInterval = setInterval(() => {
      countdown--;
      const textEl = document.querySelector('.swal-text');
      if (textEl) {
        textEl.textContent = `You will be logged out in ${countdown} seconds.`;
      }
      if (countdown <= 0) {
        clearInterval(countdownInterval);
        swal.close();
        logouting();
      }
    }, 1000);

    swal({
      title: 'Are You Still There?',
      text: `You will be logged out in ${countdown} seconds.`,
      icon: 'warning',
      buttons: [true, 'Yes'],
      closeOnClickOutside: false,
      closeOnEsc: false
    }).then((result) => {
      clearInterval(countdownInterval);
      if (result) {
        swal({ text: 'Ok, you are still logged in.' });
        resetTimeout(); // keep the session alive and re-arm the idle timer
      }
    });
  };



  const logouting = async () => {
    try {
      const alldata = { usercode: auth.usercode, username: auth.employeename, status: 'SystemAborted', ipAddress, mood: 'I', branchid: auth.branchid }

      const response = await axios.post(`${API_URL}/loginhistory`, alldata);
      if (response.status === 200) {
        secureLocalStorage.clear();
        localStorage.clear();
        navigate('/');
        window.location.reload();
      }
    } catch (err) {
      console.log(err);
      // even if logging the event failed, still end the session locally
      secureLocalStorage.clear();
      localStorage.clear();
      navigate('/');
      window.location.reload();
    }
  };

  const [lastInteractionTime, setLastInteractionTime] = useState(Date.now());

  const timeoutRef = useRef(null);


  const resetTimeout = () => {
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      if (UserStatus !== 'sa') {
        handleAutologout();
      }

    }, LogoutTime * 60000);
  };



  const handleUserInteraction = () => {
    setLastInteractionTime(Date.now());
    resetTimeout();
  };


  useEffect(() => {
    const events = ['click', 'keypress', 'mousemove', 'scroll', 'touchstart'];

    // Add event listeners
    events.forEach((event) => {
      window.addEventListener(event, handleUserInteraction);
    });

    // Set the initial timeout
    resetTimeout();

    // Clean up event listeners and timeout on component unmount
    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, handleUserInteraction);
      });
      clearTimeout(timeoutRef.current);
    };
  }, []);


  return (
    <div>
      <AppSidebar auth={auth} pageData={pageData} />
      <div className="wrapper d-flex flex-column min-vh-100">
        <AppHeader auth={auth} ipAddress={ipAddress} pageData={pageData} />
        <div className="body flex-grow-1 px-3">
          <AppContent auth={auth} ipAddress={ipAddress} pageData={pageData} />
        </div>
        <AppFooter />
      </div>
    </div>
  );
}

DefaultLayout.propTypes = {
  auth: PropTypes.any, // Replace 'any' with the appropriate type based on what 'auth' contains
  pageData: PropTypes.any,
  ipAddress: PropTypes.any,
};

export default DefaultLayout;
