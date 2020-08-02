import React, {useState} from 'react';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import { makeStyles, useTheme } from '@material-ui/styles';
import {
  Card,
  CardHeader,
  CardContent,
  IconButton,
  Divider,
  Typography,
  CircularProgress,
  Box,
  Grid,
} from '@material-ui/core';
import MoreVertIcon from '@material-ui/icons/MoreVert';

const useStyles = makeStyles(theme => ({
  root: {
    height: '100%'
  },
  chartContainer: {
    position: 'relative',
    justifyContent: 'center',
    height: 355
  },
  stats: {
    marginTop: theme.spacing(2),
    display: 'flex',
    justifyContent: 'center',
  },
  time: {
    margin: 'auto',
    fontSize: 'larger',
  },
  deliveryMessage: {
    margin: 'auto',
    fontSize: 'xx-large',
  },
}));

function CircularProgressWithLabel(props) {
  console.log(props.left);
  return (
    <Box
      display="inline-flex"
      position="relative"
    >
      <CircularProgress
        size={200}
        thickness={2}
        variant="static"
        color='secondary'
        {...props}
      />
      <Box
        alignItems="center"
        bottom={0}
        display="flex"
        justifyContent="center"
        left={0}
        position="absolute"
        right={0}
        top={0}
      >

        <Typography
          color="textSecondary"
          variant="h4"
        >{
            `${Math.floor(props.left/60)} hrs
          ${Math.floor(props.left) % 60} mins`}</Typography>
      </Box>
    </Box>
  );
}




const TimeStamp = props => {
  const { info, total, left, className, ...rest } = props;
  const classes = useStyles();

  const getTimerMessage = () => {
    if (isNaN(total) || isNaN(left)) {
      return <div className={classes.time}> Delivery time will be available shortly after the package get dispatched</div>;
    }
    if ( info && info['status'] === 'delivered' && left <= 0) {
      return <div className={classes.deliveryMessage}>Delivered</div>
    }
    return <CircularProgressWithLabel value={100 - Math.floor(left/total*100)} left={left}/>
  }
  /* React.useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((preTimeLeft) => (preTimeLeft - 10 <= 0 ? 0 : preTimeLeft - 10));
    }, 800);
    return () => {
      clearInterval(timer);
    };
  }, []); */

  return (
    <Grid
    style={{height: 250, overflow: 'auto'}}
      alignItems="center"
      className={classes.chartContainer}
      container
      justify="center"
      spacing={0}
    >
      {
        getTimerMessage()
      }
    </Grid>
  );
};

CircularProgressWithLabel.propTypes = {
  /**
   * The value of the progress indicator for the determinate and static variants.
   * Value between 0 and 100.
   */
  value: PropTypes.number.isRequired,
};

TimeStamp.propTypes = {
  className: PropTypes.string
};

export default TimeStamp;

/* const options = {
  legend: {
    display: false
  },
  responsive: true,
  maintainAspectRatio: false,
  animation: false,
  cutoutPercentage: 80,
  layout: { padding: 0 },
  tooltips: {
    enabled: true,
    mode: 'index',
    intersect: false,
    borderWidth: 1,
    borderColor: theme.palette.divider,
    backgroundColor: theme.palette.white,
    titleFontColor: theme.palette.text.primary,
    bodyFontColor: theme.palette.text.secondary,
    footerFontColor: theme.palette.text.secondary
  }
};
*/
