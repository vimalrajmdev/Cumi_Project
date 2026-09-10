import React from "react";
import { CFooter } from "@coreui/react";

const AppFooter = () => {
  return (
    <CFooter>
      
      {/* <div className="ms-auto text-center">
        <span className="me-1">© Copyright {new Date().getFullYear()} All rights reserved by</span>
        <a href="https://rspm.co.in/" target="_blank" rel="noopener noreferrer" className="text-primary">
         RSPM Infotech
        </a>
      </div> */}
    </CFooter>
  );
};

export default React.memo(AppFooter);