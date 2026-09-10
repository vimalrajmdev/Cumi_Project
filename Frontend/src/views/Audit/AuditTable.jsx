import React,{useMemo} from 'react'
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import "ag-grid-community/styles/ag-theme-quartz.css";
import PropTypes from 'prop-types';
const AuditTable = ({auth}) => {

    const pagination = true;
    const paginationPageSize = 10;
    const paginationPageSizeSelector = [10, 20, 50];
    const FoundedScanRenderer=(params)=>{
        return<span className='badge bg-success'>Founded</span>
    }
    const columndef=[
        {headerCheckboxSelection:true,checkboxSelection: true, headerName:"Select",field:"id",filter:true,floatingFilter:true },
        {headerName:"RFID No",headerClass: 'agheader',field:"RFIDNumber",filter:true,floatingFilter:true},
        {headerName:"Asset ID",field:"AssetId",filter:true,floatingFilter:true},
        {headerName:"Serial No",field:"SerialNumber",filter:true,floatingFilter:true},
        {headerName:"Category",field:"Category",filter:true,floatingFilter:true},
        {headerName:"Type",field:"Type",filter:true,floatingFilter:true},
        {headerName:"Loaction",field:"Location",filter:true,floatingFilter:true},
        {headerName:"Room",field:"Room",filter:true,floatingFilter:true},
        {headerName:"Brand",field:"Brand",filter:true,floatingFilter:true},
        {headerName:"Cost",field:"Cost",filter:true,floatingFilter:true},
        {headerName:"Status",field:"Status",filter:true,floatingFilter:true},
        {headerName:"Created Date",field:"CreatedDate",filter:true,floatingFilter:true},
        {headerName:"Disposed Date",field:"DisposedDate",filter:true,floatingFilter:true},
        {headerName:"Audit Scan Status",field:"AuditScanStatus",cellRenderer:FoundedScanRenderer},
    ]
    const rowdef=[
        {
        id:"1",RFIDNumber:"E0000001",AssetId:"Asset12",SerialNumber:"Se#123",
        Category:"Electronic",Type:"monitor",Location:"Area-1",Room:"Room-A1",
        Brand:"Dell",Cost:"₹5000",CreatedDate:"25/06/24",DisposedDate:"N/A"
    },
    {
        id:"2",RFIDNumber:"E0000002",AssetId:"Asset13",SerialNumber:"Se#124",
        Category:"Electronic",Type:"monitor",Location:"Area-1",Room:"Room-A1",
        Brand:"Dell",Cost:"₹5000",CreatedDate:"25/06/24",DisposedDate:"N/A"
    },
    {
        id:"3",RFIDNumber:"E0000003",AssetId:"Asset14",SerialNumber:"Se#125",
        Category:"Electronic",Type:"monitor",Location:"Area-1",Room:"Room-A1",
        Brand:"Dell",Cost:"₹5000",CreatedDate:"25/06/24",DisposedDate:"N/A"
    },
    {
        id:"4",RFIDNumber:"E0000004",AssetId:"Asset15",SerialNumber:"Se#126",
        Category:"Electronic",Type:"monitor",Location:"Area-1",Room:"Room-A1",
        Brand:"Dell",Cost:"₹5000",CreatedDate:"25/06/24",DisposedDate:"N/A"
    },
    {
        id:"5",RFIDNumber:"E0000005",AssetId:"Asset16",SerialNumber:"Se#127",
        Category:"Electronic",Type:"monitor",Location:"Area-1",Room:"Room-A1",
        Brand:"Dell",Cost:"₹5000",CreatedDate:"25/06/24",DisposedDate:"N/A"
    },
    {
        id:"6",RFIDNumber:"E0000006",AssetId:"Asset21",SerialNumber:"Se#133",
        Category:"Electronic",Type:"monitor",Location:"Area-1",Room:"Room-A1",
        Brand:"Dell",Cost:"₹5000",CreatedDate:"25/06/24",DisposedDate:"N/A"
    },
    {
        id:"7",RFIDNumber:"E0000007",AssetId:"Asset22",SerialNumber:"Se#143",
        Category:"Electronic",Type:"monitor",Location:"Area-1",Room:"Room-A1",
        Brand:"Dell",Cost:"₹5000",CreatedDate:"25/06/24",DisposedDate:"N/A"
    },
    {
        id:"8",RFIDNumber:"E0000008",AssetId:"Asset21",SerialNumber:"Se#153",
        Category:"Electronic",Type:"monitor",Location:"Area-1",Room:"Room-A1",
        Brand:"Dell",Cost:"₹5000",CreatedDate:"25/06/24",DisposedDate:"N/A"
    },
    {
        id:"9",RFIDNumber:"E0000009",AssetId:"Asset19",SerialNumber:"Se#163",
        Category:"Electronic",Type:"monitor",Location:"Area-1",Room:"Room-A1",
        Brand:"Dell",Cost:"₹5000",CreatedDate:"25/06/24",DisposedDate:"N/A"
    },
    {
        id:"10",RFIDNumber:"E0000010",AssetId:"Asset17",SerialNumber:"Se#173",
        Category:"Electronic",Type:"monitor",Location:"Area-1",Room:"Room-A1",
        Brand:"Dell",Cost:"₹5000",CreatedDate:"25/06/24",DisposedDate:"N/A"
    },
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
  return (
    <div>
      <div className='ag-theme-quartz' style={{height:"500px"}}>
        <AgGridReact rowData={rowdef} columnDefs={columndef} rowSelection={"multiple"} autoGroupColumnDef={autoGroupColumnDef} pagination={pagination}  paginationPageSize={paginationPageSize}  paginationPageSizeSelector={paginationPageSizeSelector}/>
      </div>
    </div>
  )
}

AuditTable.propTypes = {
    auth: PropTypes.any.isRequired,
};

export default AuditTable
