import React,{useMemo} from 'react'
import { AgGridReact } from 'ag-grid-react';
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
// import AssetImag from '/Users/NewTemplate/temp/src/assets/images/Upload.jpg'

const CheckInAssetTable = () => {
    const pagination = true;
    const paginationPageSize = 10;
    const paginationPageSizeSelector = [10, 20, 50];
    const ViewRenderer=(params)=> {
        
        return <div><i className="bi bi-eye-fill fs-5"></i></div>
    }
    const EditRenderer=(params)=> {
        
        return <div><i className="bi bi-pen fs-5"></i></div>
        
    }
    const DeleteRenderer=(params)=> {
        
        return <div><i className="bi bi-trash3 fs-5"></i></div>
        
    }
    const ImageRenderer=(params)=>{
        return(
            <div>
                {/* <img src={AssetImag} alt='AssetImage'  className='rounded-circle border border-dark' style={{ width: '30px' }} /> */}
            </div>
        )
    }
    

    const rowdef=[
{Id:"1",RFID:"E0000001",AssetId:"Asset121",Status:"Check-In",PONo:"#PO1231",GRNNo:"12345",SerialNumber:"S2323",Category:"Electronic",Description:"N/A",Model:"Model1",Brand:"Dell",Cost:"₹10200",PurshaseDate:"24/3/24",DisposedDate:"N/A",CreatedDate:"24/3/24",Location:"Area-1",Room:"Room-A1"},
{Id:"2",RFID:"E0000002",AssetId:"Asset122",Status:"Check-In",PONo:"#PO1232",GRNNo:"12346",SerialNumber:"S2323",Category:"Electronic",Description:"N/A",Model:"Model1",Brand:"Dell",Cost:"₹10200",PurshaseDate:"24/3/24",DisposedDate:"N/A",CreatedDate:"24/3/24",Location:"Area-1",Room:"Room-A1"},
{Id:"3",RFID:"E0000003",AssetId:"Asset123",Status:"Check-In",PONo:"#PO1233",GRNNo:"12347",SerialNumber:"S2323",Category:"Electronic",Description:"N/A",Model:"Model1",Brand:"Dell",Cost:"₹10200",PurshaseDate:"24/3/24",DisposedDate:"N/A",CreatedDate:"24/3/24",Location:"Area-1",Room:"Room-A1"},
{Id:"4",RFID:"E0000004",AssetId:"Asset124",Status:"Check-In",PONo:"#PO1234",GRNNo:"12348",SerialNumber:"S2323",Category:"Electronic",Description:"N/A",Model:"Model1",Brand:"Dell",Cost:"₹10200",PurshaseDate:"24/3/24",DisposedDate:"N/A",CreatedDate:"24/3/24",Location:"Area-1",Room:"Room-A1"},
{Id:"5",RFID:"E0000005",AssetId:"Asset125",Status:"Check-In",PONo:"#PO1235",GRNNo:"12349",SerialNumber:"S2323",Category:"Electronic",Description:"N/A",Model:"Model1",Brand:"Dell",Cost:"₹10200",PurshaseDate:"24/3/24",DisposedDate:"N/A",CreatedDate:"24/3/24",Location:"Area-1",Room:"Room-A1"},
{Id:"6",RFID:"E0000006",AssetId:"Asset126",Status:"Check-In",PONo:"#PO1236",GRNNo:"12350",SerialNumber:"S2323",Category:"Electronic",Description:"N/A",Model:"Model1",Brand:"Dell",Cost:"₹10200",PurshaseDate:"24/3/24",DisposedDate:"N/A",CreatedDate:"24/3/24",Location:"Area-1",Room:"Room-A1"},
{Id:"7",RFID:"E0000007",AssetId:"Asset127",Status:"Check-In",PONo:"#PO1237",GRNNo:"12351",SerialNumber:"S2323",Category:"Electronic",Description:"N/A",Model:"Model1",Brand:"Dell",Cost:"₹10200",PurshaseDate:"24/3/24",DisposedDate:"N/A",CreatedDate:"24/3/24",Location:"Area-1",Room:"Room-A1"},
{Id:"8",RFID:"E0000008",AssetId:"Asset128",Status:"Check-In",PONo:"#PO1238",GRNNo:"12352",SerialNumber:"S2323",Category:"Electronic",Description:"N/A",Model:"Model1",Brand:"Dell",Cost:"₹10200",PurshaseDate:"24/3/24",DisposedDate:"N/A",CreatedDate:"24/3/24",Location:"Area-1",Room:"Room-A1"},
{Id:"9",RFID:"E0000009",AssetId:"Asset129",Status:"Check-In",PONo:"#PO1239",GRNNo:"12353",SerialNumber:"S2323",Category:"Electronic",Description:"N/A",Model:"Model1",Brand:"Dell",Cost:"₹10200",PurshaseDate:"24/3/24",DisposedDate:"N/A",CreatedDate:"24/3/24",Location:"Area-1",Room:"Room-A1"},
{Id:"10",RFID:"E0000010",AssetId:"Asset130",Status:"Check-In",PONo:"#PO1240",GRNNo:"12354",SerialNumber:"S2323",Category:"Electronic",Description:"N/A",Model:"Model1",Brand:"Dell",Cost:"₹10200",PurshaseDate:"24/3/24",DisposedDate:"N/A",CreatedDate:"24/3/24",Location:"Area-1",Room:"Room-A1"},
{Id:"11",RFID:"E0000011",AssetId:"Asset131",Status:"Check-In",PONo:"#PO1241",GRNNo:"12355",SerialNumber:"S2323",Category:"Electronic",Description:"N/A",Model:"Model1",Brand:"Dell",Cost:"₹10200",PurshaseDate:"24/3/24",DisposedDate:"N/A",CreatedDate:"24/3/24",Location:"Area-1",Room:"Room-A1"},
{Id:"12",RFID:"E0000012",AssetId:"Asset132",Status:"Check-In",PONo:"#PO1242",GRNNo:"12356",SerialNumber:"S2323",Category:"Electronic",Description:"N/A",Model:"Model1",Brand:"Dell",Cost:"₹10200",PurshaseDate:"24/3/24",DisposedDate:"N/A",CreatedDate:"24/3/24",Location:"Area-1",Room:"Room-A1"},
{Id:"13",RFID:"E0000013",AssetId:"Asset133",Status:"Check-In",PONo:"#PO1243",GRNNo:"12357",SerialNumber:"S2323",Category:"Electronic",Description:"N/A",Model:"Model1",Brand:"Dell",Cost:"₹10200",PurshaseDate:"24/3/24",DisposedDate:"N/A",CreatedDate:"24/3/24",Location:"Area-1",Room:"Room-A1"},
{Id:"14",RFID:"E0000014",AssetId:"Asset134",Status:"Check-In",PONo:"#PO1244",GRNNo:"12358",SerialNumber:"S2323",Category:"Electronic",Description:"N/A",Model:"Model1",Brand:"Dell",Cost:"₹10200",PurshaseDate:"24/3/24",DisposedDate:"N/A",CreatedDate:"24/3/24",Location:"Area-1",Room:"Room-A1"},
{Id:"15",RFID:"E0000015",AssetId:"Asset135",Status:"Check-In",PONo:"#PO1245",GRNNo:"12359",SerialNumber:"S2323",Category:"Electronic",Description:"N/A",Model:"Model1",Brand:"Dell",Cost:"₹10200",PurshaseDate:"24/3/24",DisposedDate:"N/A",CreatedDate:"24/3/24",Location:"Area-1",Room:"Room-A1"},
{Id:"16",RFID:"E0000016",AssetId:"Asset136",Status:"Check-In",PONo:"#PO1246",GRNNo:"12360",SerialNumber:"S2323",Category:"Electronic",Description:"N/A",Model:"Model1",Brand:"Dell",Cost:"₹10200",PurshaseDate:"24/3/24",DisposedDate:"N/A",CreatedDate:"24/3/24",Location:"Area-1",Room:"Room-A1"},
{Id:"17",RFID:"E0000017",AssetId:"Asset137",Status:"Check-In",PONo:"#PO1247",GRNNo:"12361",SerialNumber:"S2323",Category:"Electronic",Description:"N/A",Model:"Model1",Brand:"Dell",Cost:"₹10200",PurshaseDate:"24/3/24",DisposedDate:"N/A",CreatedDate:"24/3/24",Location:"Area-1",Room:"Room-A1"},
{Id:"18",RFID:"E0000018",AssetId:"Asset138",Status:"Check-In",PONo:"#PO1248",GRNNo:"12362",SerialNumber:"S2323",Category:"Electronic",Description:"N/A",Model:"Model1",Brand:"Dell",Cost:"₹10200",PurshaseDate:"24/3/24",DisposedDate:"N/A",CreatedDate:"24/3/24",Location:"Area-1",Room:"Room-A1"},
{Id:"19",RFID:"E0000019",AssetId:"Asset139",Status:"Check-In",PONo:"#PO1249",GRNNo:"12363",SerialNumber:"S2323",Category:"Electronic",Description:"N/A",Model:"Model1",Brand:"Dell",Cost:"₹10200",PurshaseDate:"24/3/24",DisposedDate:"N/A",CreatedDate:"24/3/24",Location:"Area-1",Room:"Room-A1"},
{Id:"20",RFID:"E0000020",AssetId:"Asset140",Status:"Check-In",PONo:"#PO1250",GRNNo:"12364",SerialNumber:"S2323",Category:"Electronic",Description:"N/A",Model:"Model1",Brand:"Dell",Cost:"₹10200",PurshaseDate:"24/3/24",DisposedDate:"N/A",CreatedDate:"24/3/24",Location:"Area-1",Room:"Room-A1"},

]
    const columndef=[
        
        {headerCheckboxSelection:true,checkboxSelection: true,headerName:"Select",field:"Id",filter:true,floatingFilter:true},
        {headerName:"Asset Image",field:"AssetImage",cellRenderer:ImageRenderer},
        {headerName:"RFID Number",field:"RFID",filter:true,floatingFilter:true},
        {headerName:"Asset Id",field:"AssetId",filter:true,floatingFilter:true},
        {headerName:"Status",field:"Status",filter:true,floatingFilter:true},
        {headerName:"PO Number",field:"PONo",filter:true,floatingFilter:true},
        {headerName:"GRN Number",field:"GRNNo",filter:true,floatingFilter:true},
        {headerName:"Serial Number",field:"SerialNumber",filter:true,floatingFilter:true},
        {headerName:"Category",field:"Category",filter:true,floatingFilter:true},
        {headerName:"Description",field:"Description",filter:true,floatingFilter:true},
        {headerName:"Model",field:"Model",filter:true,floatingFilter:true},
        {headerName:"Brand",field:"Brand",filter:true,floatingFilter:true},
        {headerName:"Cost",field:"Cost",filter:true,floatingFilter:true},
        {headerName:"Purshase Date",field:"PurshaseDate",filter:true,floatingFilter:true},
        {headerName:"Disposed Date",field:"DisposedDate",filter:true,floatingFilter:true},
        {headerName:"Created Date",field:"CreatedDate",filter:true,floatingFilter:true},
        {headerName:"Location",field:"Location",filter:true,floatingFilter:true},
        {headerName:"Room",field:"Room",filter:true,floatingFilter:true},
        {headerName:"View",field:"View",cellRenderer: ViewRenderer,},
      
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
         <div style={{height:"500px"}} className='ag-theme-quartz'>
      <AgGridReact rowData={rowdef} columnDefs={columndef} rowSelection={"multiple"} autoGroupColumnDef={autoGroupColumnDef} pagination={pagination}  paginationPageSize={paginationPageSize}  paginationPageSizeSelector={paginationPageSizeSelector} />
      </div>
    </div>
  )
}

export default CheckInAssetTable
