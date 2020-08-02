import React, {useState, useEffect}from 'react';
import PackageMap from '../Dashboard/components/PackageMap';
import TrackingBar from '../Dashboard/components/TrackingBar';
import TimeStamp from '../Dashboard/components/TimeStamp';
import OrderDetail from '../UserList/components/OrderDetail';
import {
  Box,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Divider,
  FormControlLabel,
  Grid,
  Switch
} from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import axios from 'axios';

const useStyles = makeStyles(theme => ({
  root: {
    padding: theme.spacing(1),
    height: '75%',
    width: '75%',
    margin: 'auto',
  },
  cardContent: {
    justifyContent: 'center',
  },
  actions: {
    justifyContent: 'flex-end',
  }
}));


const Tracking = (props) => {
  const classes = useStyles();

  const { params } = props.match;

  // console.log(props.match);

  const [currentTime, setCurrentTime] = useState(new Date());
  const [trackingInfo, setTrackingInfo] = useState({
    "current location": "37.76009460,-122.41483030",
    "estimated delivered time": "2020-07-31 16:07:44",
    "delay": false,
    "destination": "37.78674750,-122.47985860",
    "status": "in transit"
  });

  const orderNumber = params.id;
  const status = trackingInfo['status'];
  const delay = trackingInfo['delay'];

  const getTrackingInfo = async () => {
    await axios.post('http://18.219.44.193:5000/tracking',{
      tracking_id :  orderNumber,
    })
      .then(res => {
        setTrackingInfo(res.data)
      })
      .catch(err =>{
        console.log(err)
      });
    console.log('trackingInfo -->', trackingInfo);
  }

  const getTrackingTitle = () => {
    if (!trackingInfo) {
      return 'Loading ...';
    }
    const timeString = () => {
      if (trackingInfo['status'] === 'delivered') {
        return '';
      }
      return trackingInfo['estimated delivered time'] ?
        `The estimated delivery time is ${trackingInfo['estimated delivered time']}.` :
        'The estimated delivery time is available shortly after the package is dispatched.'
    }
    return `Package #${orderNumber} is ${status}. ${timeString()} It is ${delay ? 'delayed' : 'on time'}`;
  }

  useEffect(() => {
    const timer = setInterval(() => {
      // console.log(new Date());
      setCurrentTime(new Date());
    }, 5 * 1000);
    return () => clearInterval(timer);
  }, [])

  useEffect(() => {
    // console.log('Tracking useEffect called')
    getTrackingInfo();
  },[currentTime])

  return <Box className={classes.root}>
    <Card >
      <CardHeader
        style={{
          textAlign: 'center',
          fontSize: 'medium',
        }}
        title={ getTrackingTitle()}
      />
      <Divider />
      <CardContent className={classes.cardContent}>
        <Grid
          container
          direction="column"
        >
          <Grid
            item
            md={12}
          >
            <TrackingBar info={trackingInfo}/>
          </Grid>
          <Grid
            item
            md={12}
          >
            <PackageMap info={trackingInfo}/>
          </Grid>
        </Grid>
      </CardContent>

      <CardActions className={classes.actions}>
      </CardActions>
    </Card>
    {/* <OrderDetail /> */}
  </Box>
}

export default Tracking;
