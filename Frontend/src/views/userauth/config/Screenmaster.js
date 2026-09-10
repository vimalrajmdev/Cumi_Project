import { cilLayers, cilPlus, cilDelete, cilPencil, cilTrash, cilPeople, cilCloudDownload, cilSearch } from '@coreui/icons'
import CIcon from '@coreui/icons-react'
import { CButton, CPaginationItem, CCardBody, CPagination, CCard, CFormLabel, CCol, CForm, CFormCheck, CFormInput, CModal, CModalBody, CModalFooter, CModalHeader, CModalTitle, CRow, CTable, CTableBody, CTableDataCell, CTableHead, CTableHeaderCell, CTableRow, CTooltip } from '@coreui/react'
import React, { useState, useEffect, useRef } from "react";
import swal from 'sweetalert';
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import { API_URL } from 'src/config';
import PropTypes from 'prop-types'; // Import PropTypes
import { getConfig } from 'src/config';
const Screenmaster = ({ auth }) => {
  const API_URL = getConfig().REACT_APP_API_URL;
  const navigate = useNavigate();

  const [editvisible, setEditvisible] = useState(false)

  const [deletevisible, setDeletevisible] = useState(false)

  const [TableDatas, SetTableDatas] = useState([])


  const [Name, SetName] = useState('')

  const [UpdateName, SetUpdateName] = useState('')

  const [editid, Seteditid] = useState('')

  const [Status, setStatus] = useState('')

  const fetchGridData = async () => {
    try {
      const alldata = {
        pageid: '',
        pagename: '',
        createby: '',
        updateby: '',
        mood: 'S',
        branchid: auth.branchid
      };

      const response = await axios.post(`${API_URL}/pagemaster`, alldata);

      if (response.status === 200) {
        SetTableDatas(response.data);
        setFilteredData(response.data); // Set filteredData to the fetched data
      } else {
        console.error(`Failed to fetch data. Status code: ${response.status}`);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
    }
  };

  const adddata = async () => {
    setStatus('Add')
    setEditvisible(true)
    SetName('')
    SetUpdateName('')
  };


  const onchangeRole = async (e) => {
    const name = e.target.value
    SetName(name)
    SetUpdateName(name)
  }


  const handleCreateRole = async () => {
    if (Name === '') {
      swal({
        text: 'Please Enter The Screen Name',
        icon: "warning"
      })
      return
    }

    const isValidationSuccess = TableDatas.some((item) => {
      return (
        item.pagename.toLowerCase() === Name.toLowerCase()
      )
    })
    if (isValidationSuccess) {
      swal({
        text: "This Screen Name is Already Exitsing",
        icon: "warning"
      });
      return;
    }

    try {

      const alldata = { pageid: '', pagename: Name, createby: auth.empid, updateby: '', mood: 'I', branchid: auth.branchid }
      const response = await axios.post(`${API_URL}/pagemaster`, alldata)

      if (response.status === 200) {
        fetchGridData()
        setEditvisible(false)
        SetName('')
        swal({
          text: "Screen Created SuccessFully",
          icon: "success"
        })
      }

    } catch (err) {

      console.log(err);
    }




  }
  // Testing

  const hardcodedData = [
    { screenid: 'DA001', name: 'Dashboard' },
    { screenid: 'UC001', name: 'User Creation' },
    // Add more hardcoded data
  ];

  // const fetchGridData = async () => {

  //   try {

  //     const alldata = { pageid: '', pagename: '', createby: '', updateby: '', mood: 'S', branchid: auth.branchid }

  //     const response = await axios.post(`${API_URL}/pagemaster`, alldata)

  //     if (response.status === 200) {
  //       SetTableDatas(response.data)
  //     }


  //   } catch (err) {

  //     console.log(err);
  //   }

  // }


  const handleedit = async (id) => {
    try {

      const alldata = { pageid: id, pagename: '', createby: '', updateby: '', mood: 'E', branchid: auth.branchid }

      const response = await axios.post(`${API_URL}/pagemaster`, alldata)

      if (response.status === 200) {

        SetUpdateName(response.data[0].pagename)

        Seteditid(id)

        setStatus('edit')

        setEditvisible(true)


      }


    } catch (error) {
      console.error('Error fetching staff data:', error);
    }
  };


  const handleupdate = async () => {
    try {

      if (UpdateName === '') {
        swal({
          text: 'Please Enter The Screen Name',
          icon: 'warning'
        })
        return
      }

      const alldata = { pageid: editid, pagename: UpdateName, createby: '', updateby: auth.empid, mood: 'U', branchid: auth.branchid }

      const response = await axios.post(`${API_URL}/pagemaster`, alldata)

      if (response.status === 200) {

        setEditvisible(false)

        fetchGridData()

        swal({
          text: 'Screen Name Update SuccessFully',
          icon: 'success'
        })
      }


    } catch (err) {

      console.log(err);

    }

  }

  const handledelete = async (id) => {
    try {
      setDeletevisible(true)
      Seteditid(id)
    } catch (err) {
      console.log(err);
    }


  };


  const confirmDelete = async () => {
    try {

      const alldata = { pageid: editid, pagename: '', createby: '', updateby: '', mood: 'D', branchid: auth.branchid }

      const response = await axios.post(`${API_URL}/pagemaster`, alldata)

      if (response.status === 200) {

        swal({
          text: 'Screen Name Deleted SuccessFully',
          icon: 'success'
        })
        setDeletevisible(false)
        fetchGridData()
      }

    } catch (err) {
      console.log(err);
    }

  }

  useEffect(() => {
    fetchGridData()
  }, [])


  const [filteredData, setFilteredData] = useState([]);

  const handlesearch = async (e) => {
    try {
      const input = e.target.value.toLowerCase();


      // const filterdata = TableDatas.filter((data) =>
      const filterdata = screenmasterArray.filter((data) =>
        data.name.toLowerCase().includes(input)
        // data.screenid.toLowerCase().includes(input)
      );

      setFilteredData(filterdata);
    } catch (err) {
      console.log(err);
    }
  };

  const screenmasterArray = [
    {
      name: 'Dashboard',
      screenid: 'DA001',
    },
    {
      name: 'User Creation',
      screenid: 'UC001',
    },
    {
      name: 'All Users',
      screenid: 'UC002',
    },
    {
      name: 'All Employees',
      screenid: 'UC003',
    },
    {
      name: 'User Config',
      screenid: 'UC004',
    },
    {
      name: 'User Role',
      screenid: 'UC005',
    },
    {
      name: 'Department',
      screenid: 'UC006',
    },
    {
      name: 'User Privileges',
      screenid: 'UA001',
    },
    {
      name: 'User Privilege',
      screenid: 'UA002',
    },
    {
      name: 'Document Register',
      screenid: 'DR001',
    },
    {
      name: 'All Document',
      screenid: 'DR002',
    },
    {
      name: 'Doc Config',
      screenid: 'DC001',
    },
    {
      name: 'Doc Type',
      screenid: 'DC002',
    },
    {
      name: 'Doc Location',
      screenid: 'DC003',
    },
    {
      name: 'Doc Rack',
      screenid: 'DC004',
    },
    {
      name: 'Doc Row',
      screenid: 'DC005',
    },
    {
      name: 'Label Printing',
      screenid: 'LP001',
    },
    {
      name: 'Label Print',
      screenid: 'LP002',
    },
    {
      name: 'Label Re-Print',
      screenid: 'LP003',
    },
    {
      name: 'Transaction',
      screenid: 'TR001',
    },
    {
      name: 'Document InWard',
      screenid: 'TR002',
    },
    {
      name: 'Document OutWard',
      screenid: 'TR002',
    },
    {
      name: 'Document Destruction',
      screenid: 'DD001',
    },
    {
      name: 'Document Destruct',
      screenid: 'DD002',
    },
    {
      name: 'Audit Trail',
      screenid: 'AT001',
    },
    {
      name: 'Audit-Trail',
      screenid: 'AT002',
    },
    {
      name: 'Userwise Audit',
      screenid: 'AT003',
    },
    {
      name: 'Docwise Audit',
      screenid: 'AT004',
    },
    {
      name: 'Reports',
      screenid: 'RE001',
    },
    {
      name: 'InWard Report',
      screenid: 'RE002',
    },
    {
      name: 'OutWard Report',
      screenid: 'RE003',
    },
    {
      name: 'Document Report',
      screenid: 'RE004',
    },
    {
      name: 'DestrucDoc Report',
      screenid: 'RE005',
    },
    {
      name: 'Settings',
      screenid: 'SE001',
    },
    {
      name: 'Settings',
      screenid: 'SE002',
    },
    {
      name: 'Log Details',
      screenid: 'LD001',
    },
    {
      name: 'Digital Profile',
      screenid: 'DP001',
    },





  ]
  return (
    <div>
      {/* Edit Model start*/}
      {/* <CModal
        size='sm'
        alignment="center"
        visible={editvisible}
        onClose={() => setEditvisible(false)}
        aria-labelledby="VerticallyCenteredExample"
      >
        <CModalTitle id="VerticallyCenteredExample" className='ms-3'>{Status === 'Add' ? 'Create New Screen Name' : 'Edit Screen Name'}</CModalTitle>
        <CModalBody>
          <CForm>
            <CFormLabel htmlFor="hsn">Master Screen <span style={{ color: 'red' }}>*</span></CFormLabel>
            <CFormInput
              className='mb-3'
              type="text"
              id='name'
              placeholder="Source"
              onChange={(e) => onchangeRole(e)}
              value={UpdateName}
            />
          </CForm>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setEditvisible(false)}>
            CANCEL
          </CButton>
          <CButton color="primary" onClick={() => Status === 'Add' ? handleCreateRole() : handleupdate()} >{Status === 'Add' ? 'Add' : 'Edit'}</CButton>
        </CModalFooter>
      </CModal> */}


      {/* Edit model end*/}



      {/* Delete Model start*/}
      {/* <CModal
        size='sm'
        alignment="center"
        visible={deletevisible}
        onClose={() => setDeletevisible(false)}
        aria-labelledby="VerticallyCenteredExample"
      >
        <CModalTitle id="VerticallyCenteredExample" className='ms-3'>Are you sure?</CModalTitle>
        <CModalBody>
          <p>This operation can&apos;t be reverted</p>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setDeletevisible(false)}>
            CANCEL
          </CButton>
          <CButton color="primary" onClick={() => confirmDelete()}>CONFIRM</CButton>
        </CModalFooter>
      </CModal> */}
      {/* Delete model end*/}
      <div>
        <CRow className='mb-3'>
          <div className="d-flex">
            <CIcon className="me-2" size={'xxl'} icon={cilLayers} />
            <h3> All Master Screens</h3>
          </div>
        </CRow>
        <CRow className='d-flex mb-3'>
          <CCol className='d-flex justify-content-end'>
            <CTooltip content="select members to export">
              <CButton type="submit" color="danger" variant="outline" className='me-2'>
                <CIcon icon={cilCloudDownload} /> EXPORT
              </CButton>
            </CTooltip>
            {/* <CButton type="submit" color="success" variant="outline" onClick={() => adddata()}>
              <CIcon icon={cilPlus} /> ADD
            </CButton> */}
          </CCol>
        </CRow>
        <CCard className="mb-3">
          <CCardBody>
            <CCol sm={4}>
              <CFormInput type="search" className="mb-3 border border-bottom flex-direction-start" placeholder="Search Screen"
                onChange={handlesearch}
              />
            </CCol>

            <CTable align="middle" className="mb-3 border-bottom" hover responsive >
              <CTableHead color="dark">
                <CTableRow>
                  {/* <CTableHeaderCell scope="col"><CFormCheck /> </CTableHeaderCell> */}
                  <CTableHeaderCell scope="col">ID</CTableHeaderCell>
                  <CTableHeaderCell scope="col">SCREEN ID</CTableHeaderCell>
                  <CTableHeaderCell scope="col">NAME</CTableHeaderCell>

                  {/* <CTableHeaderCell scope="col">ACTION</CTableHeaderCell> */}
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {/* Map over clientData to dynamically render rows */}

                {(filteredData.length > 0 ? filteredData : screenmasterArray).map((d, index) => (
                  <CTableRow key={index}>
                    <CTableDataCell>{index + 1}</CTableDataCell>
                    <CTableDataCell>{d.screenid}</CTableDataCell>
                    <CTableDataCell>{d.name}</CTableDataCell>
                    {/* <CTableDataCell className='col-sm-1'>
                      <CTooltip content="Edit">
                        <CIcon icon={cilPencil} className='mx-2' onClick={() => handleedit(d.pageid)} />
                      </CTooltip>
                      <CTooltip content="Delete">
                        <CIcon icon={cilTrash} className='mx-2' onClick={() => handledelete(d.pageid)} />
                      </CTooltip>
                    </CTableDataCell> */}
                  </CTableRow>
                ))}

              </CTableBody>
            </CTable>
            {/* Pagination */}

            {/* <CPagination aria-label="Page navigation example" align="end">
              <CPaginationItem
                aria-label="Previous"
                disabled={currentPage === 1}
                onClick={() => paginate(currentPage - 1)}
              >
                <span >&laquo;</span>
              </CPaginationItem>
              {Array.from({ length: totalPages }, (_, i) => (
                <CPaginationItem
                  key={i}
                  active={i + 1 === currentPage}
                  onClick={() => paginate(i + 1)}
                >
                  {i + 1}
                </CPaginationItem>
              ))}
              <CPaginationItem
                aria-label="Next"
                disabled={currentPage === totalPages}
                onClick={() => paginate(currentPage + 1)}
              >
                <span >&raquo;</span>
              </CPaginationItem>
            </CPagination> */}


          </CCardBody>
        </CCard>
      </div>



    </div>
  )
}

Screenmaster.propTypes = {
  auth: PropTypes.object.isRequired,
};
export default Screenmaster