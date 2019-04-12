import React from 'react';
import PropTypes from 'prop-types';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardActions from '@material-ui/core/CardActions';
import Collapse from '@material-ui/core/Collapse';
import IconButton from '@material-ui/core/IconButton';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ExpandLessIcon from '@material-ui/icons/ExpandLess';
import Typography from '@material-ui/core/Typography';
import './styles.css';

const SlaveCard = ({ slave, onExpanded }) => (
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
      <CardActions>
        <IconButton
          onClick={onExpanded}
          aria-expanded={slave.expanded}
          aria-label="Show more"
        >
          { slave.expanded ? <ExpandLessIcon /> : <ExpandMoreIcon /> }
        </IconButton>
        <Typography component="h1" variant="title">Sources</Typography>
      </CardActions>
      <Collapse in={slave.expanded} timeout="auto" unmountOnExit>
        <CardContent>
          {/* TODO: List sources */}
        </CardContent>
      </Collapse>
    </CardContent>
  </Card>
);

SlaveCard.propTypes = {
  slave: PropTypes.shape({
    name: PropTypes.string.isRequired,
    id: PropTypes.number.isRequired,
    enable: PropTypes.bool.isRequired,
    expanded: PropTypes.bool.isRequired
  }).isRequired,
  onExpanded: PropTypes.func.isRequired
};

export default SlaveCard;
