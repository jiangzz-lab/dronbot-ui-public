import React from 'react';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/styles';

import GMap from './GMap'

const useStyles = makeStyles(() => ({
  root: {
    height: 393,
    position: 'relative',
    margin: 'auto',
    paddingTop: 0,
    paddingBottom: 0,
  },
}));

const googleMapsApiKey = "AIzaSyBdIJ5MrQ4rwNhyx52hGx2J3KDwftrGps0";

const PackageMap = props => {
  const classes = useStyles();
  const { info } = props;
  console.log('BBB', info)
  return (
    <div className={classes.root}>
      <GMap
        googleMapURL={
          'https://maps.googleapis.com/maps/api/js?key=' +
          googleMapsApiKey +
          '&libraries=geometry,drawing,places'
        }
        loadingElement={<div style={{ height: `100%` }} />}
        containerElement={<div style={{ height: `600px` }} />}
        mapElement={<div style={{ height: `100%` }} />}
        info = {info}
      />
    </div>
  );
};

PackageMap.propTypes = {
  className: PropTypes.string
};

export default PackageMap;
