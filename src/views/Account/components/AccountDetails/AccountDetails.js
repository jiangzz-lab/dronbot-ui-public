import React, { useEffect, useState } from 'react';
import clsx from 'clsx';
import axios from 'axios';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/styles';
import {
  Card,
  CardHeader,
  CardContent,
  CardActions,
  Divider,
  Grid,
  Button,
  TextField, Typography
} from '@material-ui/core';

const useStyles = makeStyles(() => ({
  root: {}
}));

const AccountDetails = props => {
  const { className, profile, updateProfile, ...rest  } = props;
  console.log('profile in detail -->', profile);

  const classes = useStyles();
  const [values, setValues] = useState(profile);
  console.log('values-->', values);

  const handleChange = event => {
    setValues({
      ...values,
      [event.target.name]: event.target.value
    });
  };

  const postProfile = () => {
    axios.post('http://18.219.44.193:5000/userprofile',{
      user_id : profile['user_id'],
      email: values['email'] ? values['email'] : '',
      last_name: values['lastName'] ? values['lastName'] : '',
      first_name: values['firstName'] ? values['firstName'] : '',
      phoneNumber: values['phoneNumber'] ? values['phoneNumber'] : '',
      primaryAddress: values['primaryAddress'] ? values['primaryAddress'] : '',
      zipCode: values['zipCode'] ? values['zipCode'] : '',
    })
      .then(response => {
        const updated = response.data.updated;
        console.log(updated);
      })
      .then(error => {
        console.log(error);
      });
  }

  console.log(values);

  return (
    <Card
      {...rest}
      className={clsx(classes.root, className)}
    >
        <CardHeader
          subheader="The information can be edited"
          title="Profile"
        />
        <Divider />
        <CardContent>
          <Grid
            container
            spacing={3}
          >
            <Grid
              item
              md={6}
              xs={12}
            >
              <TextField
                fullWidth
                helperText="Please specify the first name"
                label="First name"
                margin="dense"
                name="firstName"
                onChange={handleChange}
                required
                variant="outlined"
                value={values.firstName}
              />
            </Grid>
            <Grid
              item
              md={6}
              xs={12}
            >
              <TextField
                fullWidth
                label="Last name"
                margin="dense"
                name="lastName"
                onChange={handleChange}
                required
                value={values.lastName}
                variant="outlined"
              />
            </Grid>
            <Grid
              item
              md={6}
              xs={12}
            >
              <TextField
                fullWidth
                label="Email"
                margin="dense"
                name="email"
                onChange={handleChange}
                required
                value={values.email}
                variant="outlined"
              />
            </Grid>
            <Grid
              item
              md={6}
              xs={12}
            >
              <TextField
                fullWidth
                label="Phone Number"
                margin="dense"
                name="phoneNumber"
                onChange={handleChange}
                value={values.phoneNumber}
                variant="outlined"
              />
            </Grid>
            <Grid
              item
              md={12}
              xs={12}
            >
              <TextField
                fullWidth
                label="Primary address"
                margin="dense"
                name="primaryAddress"
                onChange={handleChange}
                required
                value={values.primaryAddress}
                variant="outlined"
              />
            </Grid>
            <Grid
              item
              md={6}
              xs={12}
            >
              <TextField
                fullWidth
                label="city"
                margin="dense"
                name="city"
                onChange={handleChange}
                required
                value={values.city}
                variant="outlined"
              />
            </Grid>
            <Grid
              item
              md={6}
              xs={12}
            >
              <TextField
                fullWidth
                label="zip-code"
                margin="dense"
                name="zipCode"
                onChange={handleChange}
                required
                value={values.zipCode}
                variant="outlined"
              />
            </Grid>
          </Grid>
        </CardContent>
        <Divider />
        <CardActions>
          <Button
            color="primary"
            variant="contained"
            onClick={() => {
              updateProfile(values);
              // we should post the updated profile information to /userprofile in the future
              postProfile();
            }
            }
          >
            Save details
          </Button>
        </CardActions>
    </Card>
  );
};

AccountDetails.propTypes = {
  className: PropTypes.string
};

export default AccountDetails;
