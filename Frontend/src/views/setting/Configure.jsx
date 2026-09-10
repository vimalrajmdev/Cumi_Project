import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Categories from '../../assets/images/Category.png';
import Maintenance from '../../assets/images/rpa.png';
import Vendors from '../../assets/images/seller.png';
import IndustryType from '../../assets/images/diagram.png';
import { Card, Col, Row } from 'react-bootstrap';
import { useLocation } from "react-router-dom";
import MouldMaster from '../../assets/images/wrench.png';
import MachineMaster from '../../assets/images/drilling.png';
import EmployeeMaster from '../../assets/images/team.png';
import SupplierMaster from '../../assets/images/supplier.png';
import ShiftMaster from '../../assets/images/team-work.png';
import LocationMaster from '../../assets/images/maps.png';
import MouldType from '../../assets/images/spare-parts.png';
import RackMaster from '../../assets/images/rack.png';
import RowMaster from '../../assets/images/row.png'
import UOMMaster from '../../assets/images/measurable.png'
import PropTypes from 'prop-types';


import IDgenerator from '../../assets/images/ID_generator.png';
import AssetType from '../../assets/images/ID_generator.png';
import AssetPackage from '../../assets/images/box.png';
import AssetGroup from '../../assets/images/AssetGroup.png';
import Maintained from '../../assets/images/Maintained.png';
import Reminder from '../../assets/images/alarm.png';
import secureLocalStorage from 'react-secure-storage';
import { RiArrowRightDoubleFill } from 'react-icons/ri';
// import FGMaster from '../Masters/FGMaster';
import FGMaster from '../../assets/images/goods.png';


const Configure = ({ auth }) => {

  const CardStyle = {
    background: 'linear-gradient(90deg, rgba(233,233,233,1) 0%, rgba(242,242,242,1) 100%)'
  }
  const permissions = secureLocalStorage.getItem("pageData") || {};
  console.log("🚀 ~ Configure ~ permissions:", permissions)

  // 3️⃣ FUNCTION → check VIEW permission
  const hasViewPermission = (screenId) => {
    return permissions?.[screenId]?.ViewStatus === 'a' || auth.UserStatus === 'SA';
  };

  const normalizePermission = (permission) => {
    if (!permission) return null;
    return {
      ...permission,
      ViewStatus: permission.ViewStatus?.toLowerCase(),
      AddStatus: permission.AddStatus?.toLowerCase(),
      EditStatus: permission.EditStatus?.toLowerCase(),
      DeleteStatus: permission.DeleteStatus?.toLowerCase(),
    };
  };


  const getScreenPermission = (screenId) => {
    const perm = permissions?.[screenId];
    return normalizePermission(perm);
  };



  return (
    <div className=''>
      {/* <Card className=' py-2 px-2'> */}
      <Row >

    {/* Mould_Master */}
    {hasViewPermission('AC006') &&
          <Col xl={4} lg={6} md={6} sm={6} xs={12}>
            <Card style={CardStyle}>
              <Link className=' d-flex  text-decoration-none text-dark ' to='/Configure/MouldMaster'
                state={{ permission: getScreenPermission('AC007'), screenId: 'AC007' }}
              >
                <div className='  col-lg-4' id='Img5'>
                  <img src={FGMaster} alt='FG Master' style={{ width: '80px' }} className='ms-3 my-2' />
                </div>
                <div className='  col-lg-8 mt-3' id=''>
                  <h5 className='ms-2'>Mould Master</h5>
                  <span className='text-sm-start ms-2 '>Click to Add/View Mould master</span>

                  <div className='text-end me-2'>
                    <RiArrowRightDoubleFill className='fs-6' />
                  </div>
                </div>
              </Link>
            </Card>
          </Col>
        }


  {hasViewPermission('AC006') &&
          <Col xl={4} lg={6} md={6} sm={6} xs={12}>
            <Card style={CardStyle}>
              <Link className=' d-flex  text-decoration-none text-dark ' to='/Configure/MouldTypeMaster'
                state={{ permission: getScreenPermission('AC007'), screenId: 'AC007' }}
              >
                <div className='  col-lg-4' id='Img5'>
                  <img src={MouldType} alt='PartTypeMaster' style={{ width: '80px' }} className='ms-3 my-2' />
                </div>
                <div className='  col-lg-8 mt-3' id=''>
                  <h5 className='ms-2'>MouldType Master</h5>
                  <span className='text-sm-start ms-2 '>Click to Add/View PartType</span>

                  <div className='text-end me-2'>
                    <RiArrowRightDoubleFill className='fs-6' />
                  </div>
                </div>
              </Link>
            </Card>
          </Col>
        }

        {hasViewPermission('AC001') &&
          <Col xl={4} lg={6} md={6} sm={6} xs={12} >
            <Card style={CardStyle}>
              <Link className='  d-flex text-decoration-none text-dark   mb-2' to='/Configure/MouldPartMaster'
                state={{ permission: getScreenPermission('AC001'), screenId: 'AC001' }}
              >
                <div className='col-lg-4  pe-3' id='Img1'>
                  <img src={MouldMaster} alt='Part Info' style={{ width: '80px' }} className='ms-3 my-2' />
                </div>
                <div className=' col-lg-8 mt-3' id='cominfo'>
                  <h5 className='ms-2 '>MouldPartMaster </h5>
                  <span className='text-sm-start ms-2 '>Click to Add/View Part information</span>

                  <div className='text-end me-2'>
                    <RiArrowRightDoubleFill className='fs-6' />
                  </div>
                </div>
              </Link>
            </Card>
          </Col>
        }

        {hasViewPermission('AC002') &&
          <Col xl={4} lg={6} md={6} sm={6} xs={12}>
            <Card style={CardStyle}>
              <Link className='  d-flex text-decoration-none text-dark   mb-2' to='/Configure/MachineMaster'
                state={{ permission: getScreenPermission('AC002'), screenId: 'AC002' }}
              >
                <div className='col-lg-4  pe-3' id='Img1'>
                  <img src={MachineMaster} alt='MachineInfo' style={{ width: '80px' }} className='ms-3 my-2' />
                </div>
                <div className=' col-lg-8 mt-3' id='cominfo'>
                  <h5 className='ms-2 '>Machine Master </h5>
                  <span className='text-sm-start ms-2 '>Click to Add/View Machine Info</span>

                  <div className='text-end me-2'>
                    <RiArrowRightDoubleFill className='fs-6' />
                  </div>
                </div>
              </Link>
            </Card>
          </Col>
        }

        {hasViewPermission('AC003') &&
          <Col xl={4} lg={6} md={6} sm={6} xs={12} >
            <Card style={CardStyle}>
              <Link className='  d-flex text-decoration-none text-dark   mb-2' to='/Configure/EmployeeMaster'
                state={{ permission: getScreenPermission('AC003'), screenId: 'AC003' }}
              >
                <div className='col-lg-4  pe-3' id='Img1'>
                  <img src={EmployeeMaster} alt='Part Info' style={{ width: '80px' }} className='ms-3 my-2' />
                </div>
                <div className=' col-lg-8 mt-3' id='cominfo'>
                  <h5 className='ms-2 '>Employee Master </h5>
                  <span className='text-sm-start ms-2 '>Click to Add/View Employee information</span>

                  <div className='text-end me-2'>
                    <RiArrowRightDoubleFill className='fs-6' />
                  </div>
                </div>
              </Link>
            </Card>
          </Col>
        }

        {hasViewPermission('AC004') &&
          <Col xl={4} lg={6} md={6} sm={6} xs={12}>
            <Card style={CardStyle}>
              <Link className='d-flex  text-decoration-none text-dark  mb-2' to='/Configure/SupplierMaster'
                state={{ permission: getScreenPermission('AC004'), screenId: 'AC004' }}
              >
                <div className='  col-lg-4' id='Img2'>
                  <img src={SupplierMaster} alt='Supplier Master' style={{ width: '80px' }} className='ms-3 my-2' />
                </div>
                <div className='  col-lg-8 mt-3' id='Loc'>
                  <h5 className='ms-2'>Supplier Master</h5>
                  <span className='text-sm-start ms-2 '>Click to Add/View Supplier Details</span>

                  <div className='text-end me-2'>
                    <RiArrowRightDoubleFill className='fs-6' />
                  </div>
                </div>
              </Link>
            </Card>
          </Col>
        }

        {hasViewPermission('AC005') &&
          <Col xl={4} lg={6} md={6} sm={6} xs={12}>
            <Card style={CardStyle}>
              <Link className='d-flex  text-decoration-none text-dark  mb-2' to='/Configure/ShiftMaster'
                state={{ permission: getScreenPermission('AC004'), screenId: 'AC004' }}
              >
                <div className='  col-lg-4' id='Img2'>
                  <img src={ShiftMaster} alt='Supplier Master' style={{ width: '80px' }} className='ms-3 my-2' />
                </div>
                <div className='  col-lg-8 mt-3' id='Loc'>
                  <h5 className='ms-2'>Shift Master</h5>
                  <span className='text-sm-start ms-2 '>Click to Add/View Supplier Details</span>

                  <div className='text-end me-2'>
                    <RiArrowRightDoubleFill className='fs-6' />
                  </div>
                </div>
              </Link>
            </Card>
          </Col>
        }


        {hasViewPermission('AC007') &&
          <Col xl={4} lg={6} md={6} sm={6} xs={12}>
            <Card style={CardStyle}>
              <Link className=' d-flex  text-decoration-none text-dark ' to='/Configure/LinkLocationMaster'
                state={{ permission: getScreenPermission('AC007'), screenId: 'AC007' }}
              >
                <div className='  col-lg-4' id='Img5'>
                  <img src={LocationMaster} alt='Location Master' style={{ width: '80px' }} className='ms-3 my-2' />
                </div>
                <div className='  col-lg-8 mt-3' id=''>
                  <h5 className='ms-2'>Link Location Master</h5>
                  <span className='text-sm-start ms-2 '>Click to Add/View Link Location </span>

                  <div className='text-end me-2'>
                    <RiArrowRightDoubleFill className='fs-6' />
                  </div>
                </div>
              </Link>
            </Card>
          </Col>
        }

        
      
        {hasViewPermission('AC006') &&
          <Col xl={4} lg={6} md={6} sm={6} xs={12}>
            <Card style={CardStyle}>
              <Link className=' d-flex  text-decoration-none text-dark ' to='/Configure/LocationMaster'
                state={{ permission: getScreenPermission('AC007'), screenId: 'AC007' }}
              >
                <div className='  col-lg-4' id='Img5'>
                  <img src={RackMaster} alt='RackMaster' style={{ width: '80px' }} className='ms-3 my-2' />
                </div>
                <div className='  col-lg-8 mt-3' id=''>
                  <h5 className='ms-2'> Location Master</h5>
                  <span className='text-sm-start ms-2 '>Click to Add/View Location</span>

                  <div className='text-end me-2'>
                    <RiArrowRightDoubleFill className='fs-6' />
                  </div>
                </div>
              </Link>
            </Card>
          </Col>
        }


        {hasViewPermission('AC006') &&
          <Col xl={4} lg={6} md={6} sm={6} xs={12}>
            <Card style={CardStyle}>
              <Link className=' d-flex  text-decoration-none text-dark ' to='/Configure/RackMaster'
                state={{ permission: getScreenPermission('AC007'), screenId: 'AC007' }}
              >
                <div className='  col-lg-4' id='Img5'>
                  <img src={RackMaster} alt='RackMaster' style={{ width: '80px' }} className='ms-3 my-2' />
                </div>
                <div className='  col-lg-8 mt-3' id=''>
                  <h5 className='ms-2'> Rack Master</h5>
                  <span className='text-sm-start ms-2 '>Click to Add/View Rack</span>

                  <div className='text-end me-2'>
                    <RiArrowRightDoubleFill className='fs-6' />
                  </div>
                </div>
              </Link>
            </Card>
          </Col>
        }

        {hasViewPermission('AC006') &&
          <Col xl={4} lg={6} md={6} sm={6} xs={12}>
            <Card style={CardStyle}>
              <Link className=' d-flex  text-decoration-none text-dark ' to='/Configure/RowMaster'
                state={{ permission: getScreenPermission('AC007'), screenId: 'AC007' }}
              >
                <div className='  col-lg-4' id='Img5'>
                  <img src={RowMaster} alt='RowMaster' style={{ width: '80px' }} className='ms-3 my-2' />
                </div>
                <div className='  col-lg-8 mt-3' id=''>
                  <h5 className='ms-2'> Row Master</h5>
                  <span className='text-sm-start ms-2 '>Click to Add/View Row</span>

                  <div className='text-end me-2'>
                    <RiArrowRightDoubleFill className='fs-6' />
                  </div>
                </div>
              </Link>
            </Card>
          </Col>
        }

        {/* {hasViewPermission('AC006') &&
          <Col xl={4} lg={6} md={6} sm={6} xs={12}>
            <Card style={CardStyle}>
              <Link className=' d-flex  text-decoration-none text-dark ' to='/Configure/UOMMaster'
                state={{ permission: getScreenPermission('AC007'), screenId: 'AC007' }}
              >
                <div className='  col-lg-4' id='Img5'>
                  <img src={UOMMaster} alt='UOMMaster' style={{ width: '80px' }} className='ms-3 my-2' />
                </div>
                <div className='  col-lg-8 mt-3' id=''>
                  <h5 className='ms-2'> UOMMaster</h5>
                  <span className='text-sm-start ms-2 '>Click to Add/View UOMMaster</span>

                  <div className='text-end me-2'>
                    <RiArrowRightDoubleFill className='fs-6' />
                  </div>
                </div>
              </Link>
            </Card>
          </Col>
        } */}

        {/* {hasViewPermission('AC007') &&
          <Col xl={4} lg={6} md={6} sm={6} xs={12}>
            <Card style={CardStyle}>
              <Link className=' d-flex  text-decoration-none text-dark ' to='/Configure/AssetPackage'
                state={{ permission: getScreenPermission('AC007'), screenId: 'AC007' }}
              >
                <div className='  col-lg-4' id='Img5'>
                  <img src={AssetPackage} alt='AssetPackage' style={{ width: '70px' }} className='ms-3 my-2' />
                </div>
                <div className='  col-lg-8 mt-3' id='AssetPackage'>
                  <h6 className='ms-2'> UMO Master</h6>
                  <span className='text-sm-start ms-2 '>Click to Add/View UMO Master</span>

                  <div className='text-end me-2'>
                    <RiArrowRightDoubleFill className='fs-6' />
                  </div>
                </div>
              </Link>
            </Card>
          </Col>
        } */}
        {/* {hasViewPermission('AC008') &&
          <Col xl={4} lg={6} md={6} sm={6} xs={12}>
            <Card style={CardStyle}>
              <Link className=' d-flex  text-decoration-none text-dark ' to='/Configure/AssetGroup'
                state={{ permission: getScreenPermission('AC008'), screenId: 'AC008' }}
              >
                <div className='  col-lg-4' id='Img5'>
                  <img src={AssetGroup} alt='AssetGroup' style={{ width: '70px' }} className='ms-3 my-2' />
                </div>
                <div className='  col-lg-8 mt-3' id='AssetGroup'>
                  <h6 className='ms-2'>Asset Group Master</h6>
                  <span className='text-sm-start ms-2 '>Click to Add/View  AssetGroup</span>

                  <div className='text-end me-2'>
                    <RiArrowRightDoubleFill className='fs-6' />
                  </div>
                </div>
              </Link>
            </Card>
          </Col>
        } */}
        {/* {hasViewPermission('AC009') &&
          <Col xl={4} lg={6} md={6} sm={6} xs={12}>
            <Card style={CardStyle}>
              <Link className='d-flex text-decoration-none text-dark ' to='/Configure/Department'
                state={{ permission: getScreenPermission('AC009'), screenId: 'AC009' }}
              >
                <div className='col-lg-4' id='Img4'>
                  <img src={IndustryType} alt='Department' style={{ width: '70px' }} className='ms-3 my-2' />
                </div>
                <div className=' col-lg-8 mt-3' id='Type'>
                  <h6 className='ms-2'>Department Master</h6>
                  <span className='text-sm-start ms-2 '>Click to Add/View  Department</span>

                  <div className='text-end me-2'>
                    <RiArrowRightDoubleFill className='fs-6' />
                  </div>
                </div>
              </Link>
            </Card>
          </Col>
        } */}
        {/* {hasViewPermission('AC010') &&
          <Col xl={4} lg={6} md={6} sm={6} xs={12}>
            <Card style={CardStyle}>
              <Link className='d-flex text-decoration-none text-dark '
                to='/Configure/Maintenance'
                state={{ permission: getScreenPermission('AC010'), screenId: 'AC010' }}
              >
                <div className='col-lg-4' id='Img5'>
                  <img src={Maintenance} alt='Maintenance' style={{ width: '70px' }} className='ms-3 my-2' />
                </div>
                <div className='  col-lg-8 mt-3' id='Maintenance'>
                  <h6 className='ms-2'>Maintenance Type Master</h6>
                  <span className='text-sm-start ms-2 '>Click to Add/View  Maintenance</span>

                  <div className='text-end me-2'>
                    <RiArrowRightDoubleFill className='fs-6' />
                  </div>
                </div>
              </Link>
            </Card>
          </Col>
        } */}
        {/* {hasViewPermission('AC011') &&
          <Col xl={4} lg={6} md={6} sm={6} xs={12}>
            <Card style={CardStyle}>
              <Link className=' d-flex  text-decoration-none text-dark '
                to='/Configure/Vendors'
                state={{ permission: getScreenPermission('AC011'), screenId: 'AC011' }}
              >
                <div className='  col-lg-4' id='Img5'>
                  <img src={Vendors} alt='Vendors' style={{ width: '70px' }} className='ms-3 my-2' />
                </div>
                <div className='  col-lg-8 mt-3' id='Maintenance'>
                  <h6 className='ms-2'>Vendor Master</h6>
                  <span className='text-sm-start ms-2 '>Click to Add/View  Vendors</span>

                  <div className='text-end me-2'>
                    <RiArrowRightDoubleFill className='fs-6' />
                  </div>
                </div>
              </Link>
            </Card>
          </Col>
        } */}
        {/* {hasViewPermission('AC012') &&
          <Col xl={4} lg={6} md={6} sm={6} xs={12}>
            <Card style={CardStyle}>
              <Link className=' d-flex  text-decoration-none text-dark ' to='/Configure/IDgenerator'
                state={{ permission: getScreenPermission('AC012'), screenId: 'AC012' }}
              >
                <div className='  col-lg-4' id='Img5'>
                  <img src={IDgenerator} alt='ID Generator' style={{ width: '70px' }} className='ms-3 my-2' />
                </div>
                <div className='  col-lg-8 mt-3' id='Maintenance'>
                  <h6 className='ms-2'>Asset ID Generator</h6>
                  <span className='text-sm-start ms-2 '>Click to Add/View  ID</span>

                  <div className='text-end me-2'>
                    <RiArrowRightDoubleFill className='fs-6' />
                  </div>
                </div>
              </Link>
            </Card>
          </Col>
        } */}
        {/* {hasViewPermission('AC013') &&
          <Col xl={4} lg={6} md={6} sm={6} xs={12}>
            <Card style={CardStyle}>
              <Link className=' d-flex  text-decoration-none text-dark ' to='/Configure/Maintained'
                state={{ permission: getScreenPermission('AC013'), screenId: 'AC013' }}
              >
                <div className='  col-lg-4' id='Img5'>
                  <img src={Maintained} alt='Maintained' style={{ width: '70px' }} className='ms-3 my-2' />
                </div>
                <div className='  col-lg-8 mt-3' id='Maintained'>
                  <h6 className='ms-2'>Maintainted By Master</h6>
                  <span className='text-sm-start ms-2 '>Click to Add/View  Maintainted</span>

                  <div className='text-end me-2'>
                    <RiArrowRightDoubleFill className='fs-6' />
                  </div>
                </div>
              </Link>
            </Card>
          </Col>
        } */}
        {/* {hasViewPermission('AC014') &&
          <Col xl={4} lg={6} md={6} sm={6} xs={12}>
            <Card style={CardStyle}>
              <Link className=' d-flex  text-decoration-none text-dark ' to='/Configure/ReminderType'
                state={{ permission: getScreenPermission('AC014'), screenId: 'AC014' }}
              >
                <div className='  col-lg-4' id='Img5'>
                  <img src={Reminder} alt='Reminder' style={{ width: '70px' }} className='ms-3 my-2' />
                </div>
                <div className='  col-lg-8 mt-3' id='Reminder'>
                  <h6 className='ms-2'>Reminder Master</h6>
                  <span className='text-sm-start ms-2 '>Click to Add/View  Remider Type</span>

                  <div className='text-end me-2'>
                    <RiArrowRightDoubleFill className='fs-6' />
                  </div>
                </div>
              </Link>
            </Card>
          </Col>
        } */}
      </Row>
      {/* </Card> */}
    </div >
  )
}
Configure.propTypes = { auth: PropTypes.any.isRequired };
export default Configure;
