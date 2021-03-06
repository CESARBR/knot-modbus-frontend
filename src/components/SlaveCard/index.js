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
import SourceList from './SourceList';
import './styles.css';

const SlaveCard = ({ slave, onExpanded }) => (
  <Card className={slave.online ? 'slave-card' : 'slave-card slave-card-offline'}>
    <CardContent>
      <Typography component="h2" variant="h5">
        {slave.name}
      </Typography>
      <Typography component="p" color={!slave.online ? 'textSecondary' : ''}>
        {`${slave.online ? 'Online' : 'Offline'}`}
      </Typography>
      <Typography color="textSecondary">
        {`Id: ${slave.id}`}
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
          { slave.sources ? <SourceList sources={slave.sources} /> : null }
        </CardContent>
      </Collapse>
    </CardContent>
  </Card>
);

SlaveCard.propTypes = {
  slave: PropTypes.shape({
    name: PropTypes.string.isRequired,
    id: PropTypes.number.isRequired,
    online: PropTypes.bool.isRequired,
    expanded: PropTypes.bool.isRequired,
    sources: PropTypes.array
  }).isRequired,
  onExpanded: PropTypes.func.isRequired
};

export default SlaveCard;
