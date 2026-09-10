import React from 'react';

// react-bootstrap
import { Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';

// ==============================|| ORDER CARD ||============================== //

const OrderCard2 = ({ params }) => {
  let cardClass = ['order-card'];
  if (params.class) {
    cardClass = [...cardClass, params.class];
  }

  let iconClass = ['float-start'];
  if (params.icon) {
    iconClass = [...iconClass, params.icon];
  }

   

  return (
    <Card className={cardClass.join(' ')}>
      <Card.Body>
        <h6 className="text-white">{params.title}</h6>
        <h2 className="text-end text-white">
          <i className={iconClass.join(' ')} />
          <span>{params.primaryText}</span>
        </h2>
        <p className="mb-0">
          {params.secondaryText}
          <Link to='/ManageAsset/MaptoEmp'>  <span className="float-end badge bg-light text-dark  hover-effect ">{params.extraText}</span></Link>
        </p>
      </Card.Body>
    </Card>
  );
};


OrderCard2.propTypes = {
  params: PropTypes.shape({
    class: PropTypes.string,
    icon: PropTypes.string,
    title: PropTypes.string,
    primaryText: PropTypes.string,
    secondaryText: PropTypes.string,
    extraText: PropTypes.string,
  }).isRequired,
};

export default OrderCard2;
