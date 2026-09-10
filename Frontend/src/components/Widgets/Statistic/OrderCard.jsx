import React from 'react';

// react-bootstrap
import { Card, OverlayTrigger,Tooltip } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';

// ==============================|| ORDER CARD ||============================== //

const OrderCard = ({ params }) => {
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
          // ✅ When user has access, show clickable link
          <Link to={params.link || '#'}>
            <h6 className="text-white">{params.title}</h6>
            <h2 className="text-end text-white">
              <i className={iconClass.join(' ')} />
              <span className="badge">{params.primaryText}</span>
            </h2>
            <p className="mb-0 d-flex justify-content-between">
              <span className="float-start badge bg-light text-dark me-2" style={{ fontSize: '13px' }}>
                {params.secondaryText}
              </span>
              <span className="float-end badge bg-light text-dark">
                {params.extraText}
              </span>
            </p>
          </Link>
        ) : (
          // ❌ When no access, show non-clickable version with tooltip
          <OverlayTrigger overlay={<Tooltip>You don’t have access</Tooltip>}>
            <div style={{ cursor: 'not-allowed' }}>
              <h6 className="text-white">{params.title}</h6>
              <h2 className="text-end text-white">
                <i className={iconClass.join(' ')} />
                <span className="badge">{params.primaryText}</span>
              </h2>
              <p className="mb-0 d-flex justify-content-between">
                <span className="float-start badge bg-light text-dark me-2" style={{ fontSize: '13px' }}>
                  {params.secondaryText}
                </span>
                <span className="float-end badge bg-light text-dark">
                  {params.extraText}
                </span>
              </p>
            </div>
          </OverlayTrigger>
        )}
      </Card.Body>
    </Card>

  );
};


OrderCard.propTypes = {
  params: PropTypes.shape({
    class: PropTypes.string,
    icon: PropTypes.string,
    title: PropTypes.string,
    primaryText: PropTypes.string,
    secondaryText: PropTypes.string,
    extraText: PropTypes.string,
    link: PropTypes.string,
    hasAccess: PropTypes.bool, // <- important
  }).isRequired,
};
export default OrderCard;
