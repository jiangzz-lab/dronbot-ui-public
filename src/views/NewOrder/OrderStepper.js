import React, { useEffect, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';
import Paper from '@material-ui/core/Paper';
import Stepper from '@material-ui/core/Stepper';
import Step from '@material-ui/core/Step';
import StepLabel from '@material-ui/core/StepLabel';
import Button from '@material-ui/core/Button';
import Link from '@material-ui/core/Link';
import Typography from '@material-ui/core/Typography';
import { CircularProgress } from '@material-ui/core';
import Popover from '@material-ui/core/Popover';
import Alert from '@material-ui/lab/Alert';

import axios from 'axios';

import {
  useStripe,
  useElements,
  CardNumberElement
} from '@stripe/react-stripe-js';

import {
  ShipInfoForm,
  Recommend,
  PaymentForm,
  Checkout
} from './components';

function Copyright() {
  return (
    <Typography
      align="center"
      color="textSecondary"
      variant="body2"
    >
      {'Copyright © '}
      <Link
        color="inherit"
        href="https://material-ui.com/"
      >
        Your Website
      </Link>{' '}
      {new Date().getFullYear()}
      {'.'}
    </Typography>
  );
}

const useStyles = makeStyles((theme) => ({
  appBar: {
    position: 'relative',
  },
  layout: {
    width: 'auto',
    marginLeft: theme.spacing(2),
    marginRight: theme.spacing(2),
    [theme.breakpoints.up(600 + theme.spacing(2) * 2)]: {
      width: '75%',
      marginLeft: 'auto',
      marginRight: 'auto',
    },
  },
  paper: {
    marginTop: theme.spacing(3),
    marginBottom: theme.spacing(3),
    padding: theme.spacing(2),
    [theme.breakpoints.up(600 + theme.spacing(3) * 2)]: {
      marginTop: theme.spacing(6),
      marginBottom: theme.spacing(6),
      padding: theme.spacing(3),
    },
  },
  stepper: {
    padding: theme.spacing(3, 0, 5),
  },
  stepLabel: {
    fontSize: 'medium',
  },
  buttons: {
    display: 'flex',
    justifyContent: 'flex-end',
  },
  button: {
    marginTop: theme.spacing(3),
    marginLeft: theme.spacing(1),
  },
}));

const steps = ['Shipping information', 'Select solution', 'Review your order', 'Payment'];


function OrderStepper () {
  const classes = useStyles();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [orderInfo, setOrderInfo ] = useState({
    userId: localStorage.getItem('userID'),
    senderFirstName: localStorage.getItem('firstName'),
    senderLastName: localStorage.getItem('lastName'),
    senderAddress: localStorage.getItem('primaryAddress') + ', San Fransisco, CA, ' + localStorage.getItem('zipCode'),
    senderPhoneNumber: localStorage.getItem('phoneNumber'),
    senderEmail: localStorage.getItem('email'),
    recipientFirstName: '',
    recipientLastName: '',
    recipientAddress: '',
    recipientPhoneNumber: '',
    recipientEmail: '',
    packageWeight : '',
    packageHeight : '',
    packageLength : '',
    packageWidth : '',
    station: '',
    fragile: false,
  });
  const [error, setError] = useState({
    weightError: false,
    lengthError: false,
    heightError: false,
    widthError: false,
  })
  const [hasError, setHasError] = useState(true);
  const [paid, setPaid] = useState(false);

  const [anchorEl, setAnchorEl] = React.useState(null);

  const open = hasError && Boolean(anchorEl);
  const id = open ? 'next' : undefined;
  const stripe = useStripe();
  const elements = useElements();

  useEffect(() => {
    if (paid === true) {
      placeOrder();
    }
  }, [paid])

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  function handleChange(newInfo) {
    const newOrderInfo = Object.assign(orderInfo, newInfo);
    setOrderInfo(newOrderInfo);
  }

  function toggleError(error) {
    setError(error);
  }

  function getStepContent(step) {
    switch (step) {
      case 0:
        return <ShipInfoForm
          handleChange={handleChange}
          orderInfo={orderInfo}
          error={error}
          toggleError={toggleError}
        />;
      case 1:
        return <Recommend
          handleChange={handleChange}
          recommendations={orderInfo['recommendations']}/>;
      case 2:
        return <Checkout orderInfo={orderInfo}/>;
      case 3:
        return <PaymentForm handleChange={handleChange}/>;
      default:
        throw new Error('Unknown step');
    }
  }

  const pay = async () => {
    setLoading(true);
    console.log('elements --> ', elements);
    const cardElement = elements.getElement(CardNumberElement);
    console.log('card element --> ', cardElement);
    const {error, paymentMethod} = await stripe.createPaymentMethod({
      type: 'card',
      card: cardElement,
    });

    if (error) {
      console.log(error.message);
    } else {
      console.log(paymentMethod);
      // To change: the price should come from the state in real case
      const price = 10;

      console.log('already generate paymentMethod!');
      axios.post('http://18.219.44.193:5000/pay', {
        price: price,
        currency: 'usd',
        paymentMethodId: paymentMethod['id'],
      })
        .then(response => {
          console.log(response.data);
          handleChange({
            paid : true,
          });
          setPaid(true);
        })
        .catch((error) => {
          console.log(error);
          setLoading(false);
          handleChange({
            paid : false,
          });
        })
    }
  }

  const placeOrder = async () => {
    setLoading(true);
    const appointmentMap = {
      '30 mins' : '0.5hr',
      '1 hour' : '1hr',
      '2 hours' : '2hr',
    }

    await axios.post( 'http://18.219.44.193:5000/neworder', {
      userId: orderInfo['userId'],
      senderFirstName: orderInfo['senderFirstName'],
      senderLastName: orderInfo['senderLastName'],
      senderAddress: orderInfo['senderAddress'],
      senderPhoneNumber: orderInfo['senderPhoneNumber'],
      senderEmail: orderInfo['senderEmail'],
      recipientFirstName: orderInfo['recipientFirstName'],
      recipientLastName: orderInfo['recipientLastName'],
      recipientAddress: orderInfo['recipientAddress'],
      recipientPhoneNumber: orderInfo['recipientPhoneNumber'],
      recipientEmail: orderInfo['recipientEmail'],
      packageWeight: orderInfo['packageWeight'],
      packageHeight: orderInfo['packageHeight'],
      packageLength: orderInfo['packageLength'],
      packageWidth: orderInfo['packageWidth'],
      carrier: orderInfo['solution']['carrier'],
      totalCost: orderInfo['solution']['price'],
      appointmentTime: appointmentMap[orderInfo['solution']['dispatch within: ']],
      active:true,
      isFragile: orderInfo['fragile'],
      stationId: Number(orderInfo['station']),
    })
      .then((response) => {
        console.log('response from /neworder -->', response.data);
        const trackingID = response.data['tracking id'];
        if(trackingID) {
          handleChange({
            trackingID : trackingID,
          });
        }
        setLoading(false);
        setActiveStep(activeStep + 1);
      })
      .catch(error => {
        console.log(error);
        setLoading(false);
      });
  }

  const validateInputs = () => {
    const newHasError = !Object.values(error).includes(true);
    setHasError(!newHasError);
    return newHasError;
  }

  const getRecommendations = async () => {
    console.log('We are ready to get recommendations!');
    console.log('orderInfo before send to recommendation -->', orderInfo);
    setLoading(true);
    await axios.post('http://18.219.44.193:5000/recommendation', {
      address: orderInfo['station'],
      receiverAddr: orderInfo['recipientAddress'],
      height : orderInfo['packageHeight'],
      length : orderInfo['packageLength'],
      width : orderInfo['packageWidth'],
      weight : orderInfo['packageWeight'],
      fragile : orderInfo['fragile'],
    })
      .then((response) => {
        // It is very awkward to put two pieces of data into one object;
        // We should receive Json array here in the future;
        console.log('response from backend -->', response.data);
        handleChange({
          recommendations: response.data,
        });
        setLoading(false);
        setActiveStep(activeStep + 1);
      })
      .catch(error => {
        console.log(error);
      })
  }

  const handleNext = () => {
    console.log(activeStep);
    if (activeStep === 0) {
      if(!validateInputs()) {
        return;
      }
      getRecommendations();
    } else if (activeStep === 3) {
      pay();
    } else {
      setActiveStep(activeStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep(activeStep - 1);
  };

  return (
    <React.Fragment>
      <CssBaseline />
      <main className={classes.layout}>
        <Paper className={classes.paper}>
          <form autoComplete="off" className={classes.form} onSubmit={e => { e.preventDefault(); handleNext() }}>
          <Typography
            align="center"
            component="h1"
            variant="h4"
          >
            {activeStep === steps.length ? 'Order placed!' : steps[activeStep] }
          </Typography>
          <Stepper
            activeStep={activeStep}
            className={classes.stepper}
          >
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel><span className={classes.stepLabel}>{label}</span></StepLabel>
              </Step>
            ))}
          </Stepper>
          <React.Fragment>
            {activeStep === steps.length ? (
              <React.Fragment>
                <Typography
                  gutterBottom
                  variant="h5"
                >
                  Thank you for your order.
                </Typography>
                <Typography variant="subtitle1">
                  Your order #{orderInfo['trackingID']} is placed. We have emailed your order confirmation, and will
                  send you an update when your order has shipped. <Link href="/dashboard">Click to track your package</Link>
                </Typography>

              </React.Fragment>
            ) : (
              <React.Fragment>
                {getStepContent(activeStep)}
                <div className={classes.buttons}>
                  {activeStep !== 0 && (
                    <Button
                      className={classes.button}
                      onClick={handleBack}
                    >
                      Back
                    </Button>
                  )}

                  <Button
                    aria-describedby={id}
                    className={classes.button}
                    color="primary"
                    disabled={loading}
                    type="submit"
                    variant="contained"
                    onClick={handleClick}
                  >
                    {
                      loading
                        ?
                        <CircularProgress size={24} />
                        :
                        activeStep === steps.length - 1 ? 'Place your order' : 'Next'
                    }
                  </Button>
                  <Popover
                    id={id}
                    open={open}
                    anchorEl={anchorEl}
                    onClose={handleClose}
                    anchorOrigin={{
                      vertical: 'top',
                      horizontal: 'center',
                    }}
                    transformOrigin={{
                      vertical: 'bottom',
                      horizontal: 'center',
                    }}
                  >
                    <Alert severity="error">Please correct the information before moving on!</Alert>
                  </Popover>
                </div>
              </React.Fragment>
            )}
          </React.Fragment>
          </form>
        </Paper>
        <Copyright />
      </main>
    </React.Fragment>
  );
}

export default OrderStepper;
