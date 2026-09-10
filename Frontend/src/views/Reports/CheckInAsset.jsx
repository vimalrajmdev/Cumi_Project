import React, { useRef, useState } from 'react'
import CheckInAssetTable from './ReportTables/ChekInAssetTable'
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
const CheckInAsset = () => {

  const componentRef = useRef(null);

  const generatePDF = () => {
      const doc = new jsPDF(
          {
              orientation: "landscape",
              unit: "in",
              format: [20, 20]
          }
      );
      const tableElement = document.getElementById('AssetDetails');
      doc.autoTable({ html: tableElement });
      doc.save('AssetDetails.pdf');
  };

  const downloadExcel = () => {
      const table = componentRef.current;
      const ws = XLSX.utils.table_to_sheet(table);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'AssetDeatils');
      XLSX.writeFile(wb, 'AssetDeatils.xlsx');
  };

  // 
  const [show, setShow] = useState(false);

  const [selectedOption, setSelectedOption] = useState('All'); // State to manage selected option

  // Function to handle select change
  const handleSelectChange = (event) => {
      setSelectedOption(event.target.value); // Update selected option state
      // Automatically show date inputs if "customdate" is selected
      if (event.target.value === 'Customdate') {
          setShow(true);
      } else {
          setShow(false);
      }
  };
  return (

    
    <div>
        {/* Modal for Download Format */}
        <div className="modal fade" id="exampleModal" tabIndex="-1" aria-labelledby="exampleModalLabel" >
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h1 className="modal-title fs-5" id="exampleModalLabel">Download Format</h1>
                            <button type="button" className="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div className="modal-body">
                            <div className="d-flex justify-content-evenly">
                                <div className="btn btn-success" onClick={downloadExcel}>
                                    <i className="bi bi-file-earmark-spreadsheet fs-1"></i>
                                </div>
                                <div className="btn btn-danger" onClick={generatePDF}>
                                    <i className="bi bi-filetype-pdf fs-1"></i>
                                </div>
                            </div>
                            <div className="d-flex justify-content-evenly mt-2">
                                <span className="text-muted">Download Excel Format</span>
                                <span className="text-muted">Download PDF Format</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

         

            <div className="d-flex ">

                <div className='col-lg-2 '>
                    <div>
                        <label>Select Search Mode </label>
                        <select id="mySelect" onChange={handleSelectChange} value={selectedOption} className='form-select border border-dark'>
                            <option value="All">All</option>
                            <option value="Today">Today</option>
                            <option value="week">week</option>
                            <option value="month">month</option>
                            <option value="Customdate">Custom date</option>

                        </select>

                    </div>
                </div>

                {show && (
                    <div className='col-lg-2 mx-3'>
                        <label>From Date</label>
                        <input type='date' className='form-control' />
                    </div>)
                }

                {show && (
                    <div className='col-lg-2 '>
                        <label>To Date</label>
                        <input type='date' className='form-control' />
                    </div>)
                }


                <button className='btn btn-primary col-lg-1 mt-4 ms-3'>Search</button>





            </div>

            <div className='text-end '>
                <button className="btn btn-success " data-bs-toggle="modal" data-bs-target="#exampleModal">
                    <i className="bi bi-cloud-upload me-1"></i>Export
                </button>
            </div>
            <div className='card p-5 mt-2'>
     <CheckInAssetTable/>
     </div>
    </div>
  )
}

export default CheckInAsset
