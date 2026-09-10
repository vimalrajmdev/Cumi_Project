import React from 'react';

// react-botstrap
import { Card, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';


// ==============================|| SOCIAL CARD ||============================== //

const SocialCard1 = ({ params }) => {
  let iconClass = ['d-block f-40'];
  if (params.class) {
    iconClass = [...iconClass, 'text-c-' + params.class];
  }
  if (params.icon) {
    iconClass = [...iconClass, params.icon];
  }
  

  return (
    <Card >
      <Card.Body className="text-center">
        <div className=' d-flex'>
        <i className={iconClass.join(' ')} />
        <h4 className=" mt-3 ms-4">
          <span className={'text-c-' + params.class}>{params.primaryTitle}</span> {params.primaryText}
        </h4>
        
        </div>
        <div className='row'>
          <div className='col-lg-9'>
        <p >{params.secondaryText}</p>
        </div>
        <div className='col-lg-3'>
        <Button  className="btn-primary btn-sm ">
        <i className="bi bi-chevron-double-right "></i>
        </Button>
        </div>
        </div>
      </Card.Body>
    </Card>
  );
};

SocialCard1.propTypes = {
  params: PropTypes.shape({
    class: PropTypes.string,
    icon: PropTypes.string,
    primaryTitle: PropTypes.string,
    primaryText: PropTypes.string,
    secondaryText: PropTypes.string,
  }).isRequired,
};

export default SocialCard1;
