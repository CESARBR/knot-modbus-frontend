import React from 'react';
import PropTypes from 'prop-types';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import './styles.css';

const SlaveCard = ({ slave }) => (
  <Card className="slave-card">
    <CardContent>
      <Typography component="h2" variant="h5">
        {slave.name}
      </Typography>
      <Typography color="textSecondary" gutterBottom>
        {`Id: ${slave.id}`}
      </Typography>
      <Typography component="p">
        {`Enable: ${slave.enable ? 'true' : 'false'}`}
      </Typography>
    </CardContent>
  </Card>
);

SlaveCard.propTypes = {
  slave: PropTypes.shape({
    name: PropTypes.string.isRequired,
    id: PropTypes.number.isRequired,
    enable: PropTypes.bool.isRequired
  }).isRequired
};

export default SlaveCard;
