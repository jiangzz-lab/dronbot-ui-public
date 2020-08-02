import React, { useEffect, useState } from 'react';
import { makeStyles } from '@material-ui/styles';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Grid,
  Button,
  Divider,
  CardActions,
  FormControlLabel,
  Switch,
  CircularProgress
} from '@material-ui/core';

import axios from 'axios';

import {
  ActiveOrderList,
  PackageMap,
  TimeStamp,
  TrackingBar,
  OrderDetail,
} from './components';
import { Link } from 'react-router-dom';

const useStyles = makeStyles(theme => ({
  root: {
    padding: theme.spacing(1),
    height: '75%',
  },
  cardContent: {
    justifyContent: 'center',
  },
  actions: {
    justifyContent: 'flex-end',
  }
}));

const Dashboard = (props) => {
  const classes = useStyles();
  const { history } = props;
  const user_id = localStorage.getItem('userID');
  if (!user_id) {
    history.push('./sign-in');
  }
  const selected = localStorage.getItem('selected');

  const [loadingDetail, setLoadingDetail] = useState(false);

  const [showDetail, setShowDetail] = useState(false);
  const [activeOrderList, setActiveOrderList] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(0);
  const [trackingInfo, setTrackingInfo] = useState(undefined);
  const [orderDetail, setOrderDetail] = useState({});
  const [currentTime, setCurrentTime] = useState(new Date());

  const orderNumber = activeOrderList.length !== 0 && selectedOrder !== undefined ? activeOrderList[selectedOrder]['Tracking ID'] : undefined;
  const recipient = activeOrderList.length !== 0 && selectedOrder !== undefined ? activeOrderList[selectedOrder]['Recipient'] : undefined;
  const status = trackingInfo ? trackingInfo.status : undefined;

  const createdTimeMin = trackingInfo && trackingInfo['created time'] ?
    Date.parse(trackingInfo['created time'].replace(' ', 'T'))/1000/60 : NaN;

  const deliveryTimeMin = trackingInfo && trackingInfo['estimated delivered time'] ?
    Date.parse(trackingInfo['estimated delivered time'].replace(' ','T'))/1000/60 : NaN;

  const totalTimeMin = deliveryTimeMin - createdTimeMin;

  const currentTimeMin = Date.parse(currentTime)/1000/60 + currentTime.getTimezoneOffset();

  const timeLeftMin = deliveryTimeMin - currentTimeMin;

  console.log('dash selectedOrder->',selectedOrder);
  console.log('dash trackingInfo->', trackingInfo);

  const getTrackingTitle = () => {
    if (activeOrderList.length === 0) {
      return "You don't have any active orders.";
    }
    if (trackingInfo === undefined) {
      return 'Loading ...';
    }
    return `Your package #${orderNumber} to ${recipient} is ${status}`;
  }

  const searchOrderByID = (orderList) => {
    console.log('selected -->', selected);
    localStorage.removeItem('selected');
    if (orderList && orderList.length !== 0) {
      orderList.forEach((order, index) => {
        if(order['Order ID'] === selected) {
          console.log('index match selected -->', index);
          setSelectedOrder(index);
          return;
        }
      })
    } else {
      setSelectedOrder(0);
    }
  }

  const toggleDetail = (event) => {
    setLoadingDetail(true);
    setShowDetail(event.target.checked)
  }

  const getOrderDetail = async () => {

    await axios.post('http://18.219.44.193:5000/detail', {
      order_id : activeOrderList[selectedOrder]['Order ID'],
    })
      .then(response => {
        console.log(response.data);
        setOrderDetail(response.data);
        setLoadingDetail(false);
      })
      .catch(error => console.log(error));
  }

  // set a timer to record time for this page; update once per minute
  useEffect(() => {
    const timer = setInterval(() => {
     // console.log(new Date());
    //   setCurrentTime(new Date());
    // }, 2 * 1000);
    setCurrentTime(new Date());
    }, 5 * 1000);
    return () => clearInterval(timer);
  }, [])

  // get order detail as an effect of switching on showDetail
  useEffect(() => {
    console.log(showDetail);
    if (showDetail === true) {
      getOrderDetail();
    }
  }, [showDetail, selectedOrder])

  const toggleActive=(index) =>{
    setSelectedOrder(index);
  }

  //fetch active order list data
  useEffect(() => {
    console.log('useEffect called')
    axios.post('http://18.219.44.193:5000/activeorder',{
      user_id : user_id,
    })
      .then(res => {
        const data = res.data;
        if (data[0].alert) {
          setActiveOrderList([]);
        } else {
          const orderArraySorted = data.sort(
            (a, b) => Date.parse(b['Order Date']) - Date.parse(a['Order Date'])
          );
          searchOrderByID(orderArraySorted);
          setActiveOrderList(orderArraySorted);
        }
      })
      .catch(err =>{
        console.log(err)
      });
  }, []);

  //fetch tracking info
 const getTrackingInfo = async () => {
   if(activeOrderList.length === 0 || selectedOrder === undefined || showDetail === true) {return;}
   const tracking_id=activeOrderList[selectedOrder]['Tracking ID'];
   // console.log('tracking_id',tracking_id)
   await axios.post('http://18.219.44.193:5000/tracking',{
     tracking_id : tracking_id
   })
     .then(res => {
       setTrackingInfo(res.data)
     })
     .catch(err =>{
       console.log(err)
     });
   console.log('trackingInfo -->', trackingInfo);
  }

 /* useEffect(() => {
    if(selected) { searchOrderByID(); }
  }, [activeOrderList]) */

  useEffect(() => {
    // console.log('Tracking useEffect called')
    getTrackingInfo();
  },[selectedOrder,activeOrderList, currentTime])

  const renderOrderDetail = () => {
    console.log(loadingDetail);
    console.log(orderDetail);
    if (activeOrderList.length === 0) {
      return <span> You don't have any active orders! </span>;
    }
    if (loadingDetail) {
      return <CircularProgress color="secondary" />;
    }
    return <OrderDetail orderDetail={orderDetail}/>;
  }

  console.log('activeOrderList -->', activeOrderList);
  console.log('activeOrderList length -->', activeOrderList.length);


  return (
    <Grid
      alignItems="stretch"
      container
      spacing={1}
    >
      <Grid
        item
        lg={8}
        md={12}
        xl={9}
        xs={12}
      >
        <Box className={classes.root}>
          <Card >
            <CardHeader
              style={{ textAlign: 'center' }}
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
                  xl={12}
                >
                  <TrackingBar info={trackingInfo}/>
                </Grid>
                <Grid
                  item
                  xl={12}
                >
                  {showDetail ? renderOrderDetail(): <PackageMap info={trackingInfo}/>}
                </Grid>
              </Grid>
            </CardContent>

            <CardActions className={classes.actions}>
              <FormControlLabel
                control={<Switch
                  checked={showDetail}
                  color="secondary"
                  disabled={!activeOrderList || activeOrderList.length === 0}
                  onChange={toggleDetail}
                  name="checkedA" />}
                label="View Detail"
              />
            </CardActions>
          </Card>
        </Box>
      </Grid>

      <Grid
        item
        lg={4}
        md={6}
        xl={3}
        xs={12}
      >
        <Box className={classes.root}>
          <Card>
            <CardHeader title = "Arrive in:"
            //  style={{height: 50, overflow: 'auto'}}
             />
            <Divider />
            <CardContent className={classes.cardContent}>
              <TimeStamp
              total={totalTimeMin}
              left={timeLeftMin}/>
              <ActiveOrderList 
                style={{height:285, overflow: 'auto'}}
                list={activeOrderList}
                selected={selectedOrder}
                toggleActive={toggleActive}
              />
            </CardContent>
            <CardActions>
              <Link to='/history'>
              <Button
                color="primary"
                size="small"
                variant="text"
              >

                View all history {/*<ArrowRightIcon />*/}

              </Button>
              </Link>
            </CardActions>
          </Card>
        </Box>
      </Grid>
    </Grid>
  );
};

export default Dashboard;
