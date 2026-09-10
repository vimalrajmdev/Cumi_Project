import React, { useRef, useState, useMemo, useEffect } from 'react'
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { AgGridReact } from 'ag-grid-react';
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import axios from 'axios';
import { BallTriangle } from 'react-loader-spinner';
import PropTypes from 'prop-types';
import { getConfig } from 'src/config';
import { CButton, CCol, CModal, CModalBody, CModalFooter, CModalTitle } from '@coreui/react';
import defaultlogo from '../../assets/images/apple-logo.png'; // no curly braces!
import { Card, CardBody, CardHeader } from 'react-bootstrap';
import ExcelJS from "exceljs";
import DatePicker from 'react-multi-date-picker';
import transition from "react-element-popper/animations/transition"
import InputIcon from 'react-multi-date-picker/components/input_icon';
import { saveAs } from "file-saver";
import logo from 'src/assets/images/Base64/Apple_base64'; // Can also be base64 string
import autoTable from 'jspdf-autotable';
import Swal from 'sweetalert2'

const PrintedLog = ({ auth }) => {
    const API_URL = getConfig().REACT_APP_API_URL;
    const [filteredRowDef, setFilteredRowDef] = useState([]);
    const [show, setShow] = useState(false);
    const [rowdef, setRowdef] = useState([])
    const [selectedOption, setSelectedOption] = useState('All'); // State to manage selected option
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const [loading, setLoading] = useState(false); // Loader state

    // Download Excel
    const gridRef = useRef(null);
    const downloadExcel = async () => {
        const columnDefs = [
            { header: "S.No", key: "S.No" },
            { header: "Asset ID", key: "AssetID" },
            {
                header: "Asset Name", key: "AssetName",
            },
            {
                header: "Category", key: "Category",
            },
            {
                header: "Sub Category", key: "SubCategory",

            },
            {
                header: "Department", key: "Department",

            },
            {
                header: "Printed By", key: "Printedby",

            }, {
                header: "Printed Date", key: "PrintedDate",

            },
        ];
        const rowData = gridRef.current.api.getRenderedNodes().map(n => n.data);
        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet("Print Log Report");
        // TURN OFF GRIDLINES
        sheet.views = [{ showGridLines: false }];
        const now = new Date();
        const formattedDate = now.toLocaleDateString("en-IN");
        // TITLE
        sheet.mergeCells(1, 1, 1, columnDefs.length);
        const titleCell = sheet.getCell("A1");
        titleCell.value = `PRINT LOG REPORT - ${formattedDate}`;
        titleCell.font = { bold: true, size: 16 };
        titleCell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "D9D9D9" }
        };
        titleCell.border = {
            top: { style: "thin" },
            left: { style: "thin" },
            bottom: { style: "thin" },
            right: { style: "thin" },
        };
        titleCell.alignment = { vertical: "middle", horizontal: "left" };

        // HEADER (ROW 2)
        const headerRow = sheet.getRow(2);
        columnDefs.forEach((col, i) => {
            const cell = headerRow.getCell(i + 1);
            cell.value = col.header;
            cell.font = { bold: true };
            cell.fill = {
                type: "pattern",
                pattern: "solid",
                fgColor: { argb: "D9D9D9" },
            };
            cell.alignment = { horizontal: "center", vertical: "center" };
            cell.border = {
                top: { style: "thin" },
                left: { style: "thin" },
                bottom: { style: "thin" },
                right: { style: "thin" },
            };
        });
        headerRow.commit();
        const formatDate = (d) => {
            if (!d) return "-";

            const date = new Date(d);
            if (isNaN(date)) return d;

            const year = date.getUTCFullYear();
            const month = String(date.getUTCMonth() + 1).padStart(2, "0");
            const day = String(date.getUTCDate()).padStart(2, "0");

            const hh = String(date.getUTCHours()).padStart(2, "0");
            const mi = String(date.getUTCMinutes()).padStart(2, "0");
            const ss = String(date.getUTCSeconds()).padStart(2, "0");

            return `${day}-${month}-${year} ${hh}:${mi}:${ss}`;
        };
        // DATA ROWS
        rowData.forEach((row, index) => {
            const rowValues = columnDefs.map((c) => {
                if (c.header === "S.No") {
                    return index + 1; // Serial Number
                }
                let v = row[c.key];


                if (c.key === "PrintedDate") {
                    return formatDate(v);
                }
                // Remove time from ISO date if exists (2025-11-10T00:00:00)


                return v ?? "-";
            });
            const dataRow = sheet.addRow(rowValues);

            dataRow.eachCell((cell) => {
                cell.alignment = { horizontal: "center", vertical: "center" };
                cell.border = {
                    top: { style: "thin" },
                    left: { style: "thin" },
                    bottom: { style: "thin" },
                    right: { style: "thin" },
                };
            });
        });

        // AUTO RESIZE COLUMNS BASED ON CONTENT
        sheet.columns.forEach((column) => {
            let maxLength = 0;
            column.eachCell({ includeEmpty: true }, (cell) => {
                const colValue = cell.value ? cell.value.toString() : "";
                maxLength = Math.max(maxLength, colValue.length);
            });

            // minimum width 10, otherwise add padding
            column.width = maxLength < 10 ? 10 : maxLength + 1;
        });


        const buffer = await workbook.xlsx.writeBuffer();
        saveAs(new Blob([buffer]), "Print Log Report.xlsx");
    };
    //pdf
    const handlepdf = async (selectedDate) => {
        setLoading(true);
        await new Promise(resolve => setTimeout(resolve, 0));

        const filteredData = gridRef.current.api.getModel().rowsToDisplay.map(rowNode => rowNode.data);

        const doc = new jsPDF({ orientation: "landscape", format: 'a3' });
        const title = 'Print Log Report';

        // ✅ Format selectedDate properly
        let reportDate;
        try {
            const rawDate = selectedDate?.$d || selectedDate;
            const parsedDate = new Date(rawDate);
            if (isNaN(parsedDate)) throw new Error("Invalid date");
            reportDate = parsedDate.toLocaleDateString('en-GB', {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
            });
        } catch {
            reportDate = new Date().toLocaleDateString('en-GB', {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
            });
        }

        const imgData = logo;

        // ✅ Header columns
        const headers = [
            'S.No', 'Asset ID', 'Asset Name', 'Category', 'Sub Category', 'Department', 'Printed By', 'Printed Date'

        ];
        const formatDate = (d) => {
            if (!d) return "-";

            const date = new Date(d);
            if (isNaN(date)) return d;

            const year = date.getUTCFullYear();
            const month = String(date.getUTCMonth() + 1).padStart(2, "0");
            const day = String(date.getUTCDate()).padStart(2, "0");

            const hh = String(date.getUTCHours()).padStart(2, "0");
            const mi = String(date.getUTCMinutes()).padStart(2, "0");
            const ss = String(date.getUTCSeconds()).padStart(2, "0");

            return `${day}-${month}-${year} ${hh}:${mi}:${ss}`;
        };
        // ✅ Match field names from API / grid (case-sensitive!)
        const bodyData = filteredData.map((item, index) => [
            index + 1,

            item.AssetID || "",
            item.AssetName || "",
            item.Category || "-",
            item.SubCategory || "-",
            item.Department || "-",
            item.Printedby || "-",
            formatDate(item.PrintedDate) || "-",

        ]);

        if (bodyData.length > 0) {
            autoTable(doc, {
                head: [headers],
                body: bodyData,
                margin: { top: 40, right: 15, left: 10, bottom: 20 },

                // ✅ Increase body text size
                styles: {
                    halign: "center",
                    valign: "middle",
                    fontSize: 10,       // <= Bigger data text
                    font: "times",
                    cellPadding: 3,
                    textColor: [0, 0, 0],
                    lineColor: [0, 0, 0],
                    lineWidth: 0.2,
                },

                // ✅ Increase header text size
                headStyles: {
                    fillColor: [0, 0, 0, 0.9],
                    textColor: [255, 255, 255],
                    fontSize: 11,       // <= Bigger header text
                    halign: 'center',
                    fontStyle: 'bold',
                },

                didDrawPage: (data) => {
                    const pageWidth = doc.internal.pageSize.width;
                    const pageHeight = doc.internal.pageSize.height;

                    // ✅ Logo
                    doc.addImage(imgData, 'PNG', 10, 5, 30, 12);

                    // ✅ Title
                    doc.setFontSize(20);
                    doc.setFont("times", "bold");
                    doc.text(`${title} - ${reportDate}`, pageWidth / 2, 22, { align: 'center' });

                    // ✅ Page Number
                    doc.setFontSize(8);
                    doc.text(`Page ${doc.internal.getCurrentPageInfo().pageNumber}`, pageWidth - 10, 10, { align: 'right' });

                    // ✅ Footer (center aligned)
                    doc.setFontSize(8);

                    const footerText = `Printed By: ${auth.employeename} | Printed On: ${new Date().toLocaleDateString()} | Time: ${new Date().toLocaleTimeString()}`;
                    const footerNote = `Note: This document has been generated electronically and is valid without signature.`;

                    // both lines centered
                    doc.text(footerText, pageWidth / 2, pageHeight - 15, { align: 'center' });
                    doc.text(footerNote, pageWidth / 2, pageHeight - 8, { align: 'center' });

                }
            });

            doc.save("Print Log Report.pdf");
        } else {
            Swal.fire("No data available to export", "", "warning");
        }
        setLoading(false);
    };
    //end pdf

    // Table for All Asset
    const pagination = true;
    const paginationPageSize = 10;
    const paginationPageSizeSelector = [10, 20, 50];


    const fetchdata = async () => {
        try {
            const alldata = { departmentname: auth.departmentname, mode: 'S', branchid: auth.branchid, BranchAccess: auth.BranchAccess }
            const response = await axios.post(`${API_URL}/LabelPrintLog`, alldata);
            setRowdef(response.data)
            if (response.status === 200) {
                setLoading(false)
            }
        } catch (err) {
            setLoading(false)

            console.log(err)
        }
    }

    useEffect(() => {

        fetchdata();
        const interval = setInterval(() => {
            fetchdata();
        }, 60000);

        // Clean up interval on component unmount
        return () => clearInterval(interval);

    }, [])
    const [modalImage, setModalImage] = useState(null); // State for modal image URL
    const [Imagevisible, setImagevisible] = useState(false)

    const handleImageClick = (imageUrl) => {
        setModalImage(imageUrl);
        setImagevisible(true)
    };


    const columndef = [

        {
            headerName: "S.No",
            valueGetter: "node.rowIndex + 1",
            width: 90,
            pinned: 'left', headerCheckboxSelection: true, checkboxSelection: true,
        },
        { headerName: "Asset ID", headerClass: 'agheader', field: "AssetID", filter: true, floatingFilter: true },
        { headerName: "Asset Name", headerClass: 'agheader', field: "AssetName", filter: true, floatingFilter: true },
        { headerName: "Category", headerClass: 'agheader', field: "Category", filter: true, floatingFilter: true },
        { headerName: "Sub Category", headerClass: 'agheader', field: "SubCategory", filter: true, floatingFilter: true },
        { headerName: "Department", headerClass: 'agheader', field: "Department", filter: true, floatingFilter: true },
        { headerName: "Printed By", headerClass: 'agheader', field: "Printedby", filter: true, floatingFilter: true },
        {
            headerName: "Printed Date", headerClass: 'agheader', field: "PrintedDate", filter: true, floatingFilter: true,
            valueGetter: (params) => {
                const date = params.data.PrintedDate;
                if (!date) return '-';
                const d = new Date(date);
                const yyyy = d.getUTCFullYear();
                const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
                const dd = String(d.getUTCDate()).padStart(2, '0');
                const hh = String(d.getUTCHours()).padStart(2, '0');
                const mi = String(d.getUTCMinutes()).padStart(2, '0');
                const ss = String(d.getUTCSeconds()).padStart(2, '0');
                const ms = String(d.getUTCMilliseconds()).padStart(3, '0');
                return `${dd}-${mm}-${yyyy} ${hh}:${mi}:${ss}`;
            },
        }

    ]
    const autoGroupColumnDef = useMemo(() => {
        return {
            headerCheckboxSelection: true,
            field: "id",
            flex: 1,
            minWidth: 240,
            cellRendererParams: {
                checkbox: true,
            },
        };
    }, []);


    const handleSelectChange = (event) => {
        setSelectedOption(event.target.value);
        setShow(event.target.value === 'Customdate');
    };


    useEffect(() => {

        const filterData = () => {
            let filteredData = [...rowdef];

            switch (selectedOption) {

                // ---------------------------
                // Oneday
                // ---------------------------
                case 'Oneday': {
                    if (!fromDate) break;

                    const start = new Date(fromDate);
                    start.setHours(0, 0, 0, 0);

                    filteredData = rowdef.filter(item => {
                        const itemDate = new Date(item.PrintedDate);
                        itemDate.setHours(0, 0, 0, 0);
                        return itemDate.getTime() === start.getTime();
                    });

                    break;
                }

                // ---------------------------
                // WEEK - based on picked range
                // ---------------------------
                case 'week': {
                    if (!fromDate || !toDate) break;

                    const start = new Date(fromDate);
                    start.setHours(0, 0, 0, 0);

                    const end = new Date(toDate);
                    end.setHours(23, 59, 59, 999);

                    filteredData = rowdef.filter(item => {
                        const itemDate = new Date(item.PrintedDate);
                        itemDate.setHours(0, 0, 0, 0);
                        return itemDate >= start && itemDate <= end;
                    });
                    break;
                }

                // ---------------------------
                // MONTH - based on selected month
                // ---------------------------
                case 'month': {
                    if (!fromDate || !toDate) break;

                    const start = new Date(fromDate);
                    start.setHours(0, 0, 0, 0);

                    const end = new Date(toDate);
                    end.setHours(23, 59, 59, 999);

                    filteredData = rowdef.filter(item => {
                        const itemDate = new Date(item.PrintedDate);
                        itemDate.setHours(0, 0, 0, 0);
                        return itemDate >= start && itemDate <= end;
                    });
                    break;
                }

                // ---------------------------
                // CUSTOM DATE RANGE
                // ---------------------------
                case 'Customdate': {
                    if (!fromDate || !toDate) break;

                    const start = new Date(fromDate);
                    start.setHours(0, 0, 0, 0);

                    const end = new Date(toDate);
                    end.setHours(23, 59, 59, 999);

                    filteredData = rowdef.filter(item => {
                        const itemDate = new Date(item.PrintedDate);
                        itemDate.setHours(0, 0, 0, 0);
                        return itemDate >= start && itemDate <= end;
                    });
                    break;
                }

                default:
                    break;
            }

            setFilteredRowDef(filteredData);
        };

        filterData();

    }, [selectedOption, rowdef, fromDate, toDate]);

    return (
        <>
            {loading && (
                <div className="loading-overlay">
                    <div className="loading-spinner">

                        (<BallTriangle
                            height={100}
                            width={100}
                            radius={5}
                            color="#4fa94d"
                            ariaLabel="ball-triangle-loading"
                            wrapperStyle={{}}
                            wrapperClass=""
                            visible={true}
                        />)

                    </div>
                </div>
            )}

            {/* Image Modal Start */}
            <CModal
                // size='md'
                alignment="center"
                visible={Imagevisible}
                onClose={() => setImagevisible(false)}
                aria-labelledby="VerticallyCenteredExample"
            >

                <CModalTitle>

                    <div><h3 className='text-center mt-2'> Part Image</h3></div>

                </CModalTitle>

                <CModalBody>
                    <img src={modalImage} alt="Larger View" style={{ width: '460px', maxHeight: '100%', border: '1px solid' }} />
                </CModalBody>

                <CModalFooter>
                    <div className='m-2 d-flex justify-content-end'>
                        <CButton className="mx-2" type='submit' color="danger" onClick={() => setImagevisible(false)}>
                            CANCEL
                        </CButton>
                    </div>
                </CModalFooter>


            </CModal>
            {/* Image ModalEnd */}

            {/* Modal for Download Format */}
            <div className="modal fade" id="exampleModal" tabIndex="-1" aria-labelledby="exampleModalLabel" >
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content">
                        <div className="modal-header p-2 pro-header">
                            <h1 className="modal-title fs-5 text-white" id="exampleModalLabel">Download Format</h1>
                            <button type="button" className="btn-close btn-close-white me-2" data-bs-dismiss="modal"></button>
                        </div>
                        <div className="modal-body">
                            <div className="d-flex justify-content-evenly">
                                <div className="btn btn-success" onClick={downloadExcel}>
                                    <i className="bi bi-file-earmark-spreadsheet fs-1"></i>
                                </div>
                                <div className="btn btn-danger" onClick={handlepdf}>
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

            <Card className="mx-auto mt-2" id='box-shadow' style={{ maxWidth: "700px" }}>
                <CardHeader className="p-1 pro-header">
                    <div className='d-flex justify-content-center mt-1'>
                        {/* <BsFiles className=" text-white fs-3 me-2" /> */}
                        <h3 className="text-white ">Print Log Report</h3>
                    </div>
                </CardHeader>

                <CardBody>

                    {/* Search Mode */}
                    <div className="row mt-3  justify-content-center">
                        <div className="col-lg-4 col-md-8 col-sm-10 col-12">
                            <label className="fw-semibold">Select Search Mode</label>
                            <select
                                id="mySelect"
                                onChange={handleSelectChange}
                                value={selectedOption}
                                className="form-select"
                            >
                                <option value="All">All</option>
                                <option value="Oneday">One Day</option>
                                <option value="week">Week</option>
                                <option value="month">Month</option>
                                <option value="Customdate">Custom Date</option>
                            </select>
                        </div>
                        {/* Date Pickers */}
                        {show && (
                            <div className="col-lg-4 col-md-8 col-sm-10 col-12">
                                <label className="fw-semibold">From Date</label>
                                <DatePicker
                                    animations={[transition()]}
                                    render={<InputIcon className="form-control" placeholder='Select From Date' />}
                                    onChange={(date) => {
                                        setFromDate(date);
                                    }}
                                />
                            </div>
                        )}

                        {show && (
                            <div className="col-lg-4 col-md-8 col-sm-10 col-12">
                                <label className="fw-semibold">To Date</label>
                                <DatePicker
                                    animations={[transition()]}
                                    render={<InputIcon className="form-control" placeholder='Select To Date' />}
                                    onChange={(date) => {
                                        setToDate(date);
                                    }}
                                />
                            </div>
                        )}

                        <CCol xl={3} lg={3} md={4} sm={6} xs={6} className={`${selectedOption === 'Oneday' ? 'd-block' : 'd-none'}`} >
                            <label className="fw-semibold">Select Single Date</label>
                            <div className='d-flex flex-column'>
                                <DatePicker
                                    animations={[transition()]}
                                    render={<InputIcon className="form-control" placeholder='Select Date' />}
                                    onChange={(date) => {
                                        setFromDate(date);
                                        setToDate(date);
                                    }}
                                />
                            </div>
                        </CCol>



                        <CCol xl={3} lg={3} md={4} sm={6} xs={6} className={`${selectedOption === 'month' ? 'd-block' : 'd-none'}`}>
                            <label className="fw-semibold">Select Month </label>
                            <div className='d-flex flex-column'>
                                <DatePicker
                                    onlyMonthPicker
                                    format="YYYY/MM"
                                    animations={[transition()]}
                                    render={<InputIcon className="form-control" placeholder="From Month-Year" />}
                                    onChange={(date) => {
                                        if (!date) return;
                                        const jsDate = date.toDate(); // Converts to native JS Date
                                        const year = jsDate.getFullYear();
                                        const month = jsDate.getMonth(); // 0-indexed

                                        // Start date: first day of month
                                        const startDate = new Date(year, month, 1);
                                        // End date: last day of month
                                        const endDate = new Date(year, month + 1, 0); // 0th day of next month = last day of current

                                        const formattedStart = date.set({ day: 1 }).format("YYYY-MM-DD");
                                        const formattedEnd = date.set({ day: endDate.getDate() }).format("YYYY-MM-DD");

                                        setFromDate(formattedStart);
                                        setToDate(formattedEnd)


                                    }}
                                />
                            </div>
                        </CCol>

                        <CCol xl={3} lg={3} md={4} sm={6} xs={6} className={`${selectedOption === 'week' ? 'd-block' : 'd-none'}`}>
                            <label className="fw-semibold">Select Week</label>
                            <div className='d-flex flex-column'>
                                <DatePicker
                                    range
                                    weekPicker
                                    onChange={(date) => {
                                        const formattedDate1 = date[0].format('YYYY-MM-DD');
                                        const formattedDate2 = date[1].format('YYYY-MM-DD');
                                        setFromDate(formattedDate1);
                                        setToDate(formattedDate2);
                                    }}
                                    render={<InputIcon className="form-control" placeholder='Select Week' />}

                                />
                            </div>
                        </CCol>


                    </div>



                </CardBody>
            </Card>

            <div className='d-flex justify-content-end'>
                <CButton className="mb-1" variant='outline' color='danger'
                    data-bs-toggle="modal" data-bs-target="#exampleModal"
                // onClick={downloadExcel}
                >
                    <i className="bi bi-cloud-upload me-1"></i>Export
                </CButton>
            </div>
            <div className='mt-3  card  '>
                <div style={{ height: "500px" }} className='ag-theme-quartz'>
                    <AgGridReact ref={gridRef} rowData={filteredRowDef} columnDefs={columndef} rowSelection={"multiple"} autoGroupColumnDef={autoGroupColumnDef} pagination={pagination} paginationPageSize={paginationPageSize} paginationPageSizeSelector={paginationPageSizeSelector} getRowHeight={() => 65} />
                </div>
            </div>


        </>
    )
}
PrintedLog.propTypes = {
    auth: PropTypes.any.isRequired,
};
export default PrintedLog
