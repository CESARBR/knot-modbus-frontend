import React from 'react';
import PropTypes from 'prop-types';
import SettingsInputComponent from '@material-ui/icons/SettingsInputComponent';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Avatar from '@material-ui/core/Avatar';

const SourceList = ({ sources }) => (
  <List>
    { sources.map(source => (
      <ListItem key={source.address}>
        <Avatar>
          <SettingsInputComponent />
        </Avatar>
        <ListItemText primary={source.name} secondary={source.value} />
      </ListItem>
    )) }
  </List>
);

SourceList.propTypes = {
  sources: PropTypes.arrayOf(PropTypes.shape({
    name: PropTypes.string.isRequired,
    signature: PropTypes.string.isRequired,
    address: PropTypes.number.isRequired,
    pollinginterval: PropTypes.number.isRequired,
    value: PropTypes.any.isRequired
  })).isRequired
};

export default SourceList;
