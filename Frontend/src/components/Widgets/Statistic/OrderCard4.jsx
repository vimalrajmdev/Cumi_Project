import React from 'react';
import { Card, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';

// ==============================|| ORDER CARD 4 ||============================== //

const OrderCard4 = ({ params }) => {
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
        {params.hasAccess ? (
          // ✅ Has access: clickable card
          <Link to={params.link || '#'}>
            <h6 className="text-white">{params.title}</h6>
            <h2 className="text-end text-white">
              <i className={iconClass.join(' ')} />
              <span>{params.primaryText}</span>
            </h2>
            <p className="mb-0 d-flex justify-content-between">
              <span className="float-start badge bg-light text-dark me-2">{params.secondaryText}</span>
              <span className="float-end badge bg-light text-dark">{params.extraText}</span>
            </p>
          </Link>
        ) : (
          // ❌ No access: disable click and show tooltip
          <OverlayTrigger overlay={<Tooltip>You don’t have access</Tooltip>}>
            <div style={{ cursor: 'not-allowed'}}>
              <h6 className="text-white">{params.title}</h6>
              <h2 className="text-end text-white">
                <i className={iconClass.join(' ')} />
                <span>{params.primaryText}</span>
              </h2>
              <p className="mb-0 d-flex justify-content-between">
                <span className="float-start badge bg-light text-dark me-2">{params.secondaryText}</span>
                <span className="float-end badge bg-light text-dark">{params.extraText}</span>
              </p>
            </div>
          </OverlayTrigger>
        )}
      </Card.Body>
    </Card>
  );
};

OrderCard4.propTypes = {
  params: PropTypes.shape({
    class: PropTypes.string,
    icon: PropTypes.string,
    title: PropTypes.string,
    primaryText: PropTypes.string,
    secondaryText: PropTypes.string,
    extraText: PropTypes.string,
    link: PropTypes.string,
    hasAccess: PropTypes.bool, // ✅ required now
  }).isRequired,
};

export default OrderCard4;
