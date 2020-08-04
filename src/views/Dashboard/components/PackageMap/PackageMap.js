import React from 'react';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/styles';

import GMap from './GMap'
import { GMAP_API_KEY } from '../../../../constants';

const useStyles = makeStyles(() => ({
  root: {
    height: 385,
    position: 'relative',
    margin: 'auto',
    paddingTop: 0,
    paddingBottom: 20,
  },
  mapBottom: {
    height: 10,
  }
}));

const PackageMap = props => {
  const classes = useStyles();
  const { info } = props;
  console.log('BBB', info)
  return (
    <div className={classes.root}>
      <GMap
        googleMapURL={
          'https://maps.googleapis.com/maps/api/js?key=' +
          GMAP_API_KEY +
          '&libraries=geometry,drawing,places'
        }
        loadingElement={<div style={{ height: `100%` }} />}
        containerElement={<div style={{ height: `500px` }} />}
        mapElement={<div style={{ height: `80%` }} />}
        info = {info}
      />
      <span className={classes.mapBottom}></span>
    </div>
  );
};

PackageMap.propTypes = {
  className: PropTypes.string
};

export default PackageMap;
