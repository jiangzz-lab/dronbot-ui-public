import React, { useEffect, useState } from 'react';
import { makeStyles, withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import Autocomplete from '@material-ui/lab/Autocomplete';
import FormControl from '@material-ui/core/FormControl';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import HelpOutlineIcon from '@material-ui/icons/HelpOutline';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
// import { ValidatorForm, TextValidator} from 'react-material-ui-form-validator';
import Checkbox from '@material-ui/core/Checkbox';
import Divider from '@material-ui/core/Divider';
import InputAdornment from '@material-ui/core/InputAdornment';
import Tooltip from '@material-ui/core/Tooltip';
import FormHelperText from '@material-ui/core/FormHelperText';
import axios from 'axios';

const useStyles = makeStyles((theme) => ({
  formControl: {
    minWidth: 120,
  },
  selectEmpty: {
    marginTop: theme.spacing(2),
  },
}));

const HtmlTooltip = withStyles((theme) => ({
  tooltip: {
    backgroundColor: '#f5f5f9',
    color: 'rgba(0, 0, 0, 0.87)',
    maxWidth: 220,
    fontSize: theme.typography.pxToRem(12),
    border: '1px solid #dadde9',
  },
}))(Tooltip);

function ShipInfoForm(props) {
  const { handleChange, orderInfo, toggleError } = props;

  const [stationOptions, setStationOptions] = useState([
    {
      station : '1',
      address : 'Sunset/Parkside',
      duration: Infinity,
      distance: '',
    },
    {
      station: '2',
      address : 'Mission District',
      duration: Infinity,
      distance: '',
    },
    {
      station: '3',
      address: 'Excelsior',
      duration: Infinity,
      distance: '',
    }
  ])

  const [options, setOptions] = useState([{
    address: localStorage.getItem('primaryAddress'),
    zipCode: localStorage.getItem('zipCode'),
  }]);

  const [senderAddress, setSenderAddress] = useState(options[0]);
  const [recipientAddress, setRecipientAddress] = useState('1600 Amphitheatre Parkway, Mountain View');
  const [recipientZip, setRecipientZip] = useState('');
  const [fragile, setFragile] = useState(false);
  const [station, setStation] = useState('1');
  const [error, setError] = useState({
    weightError: false,
    lengthError: false,
    heightError: false,
    widthError: false,
  })

  //console.log('options -->', options);

  async function getOptions(address) {
    if(!address) { return; }
    const response = await axios.post('http://18.219.44.193:5000/autocomplete',{
      address : address,
    });
    const data = response.data;
    //console.log('data from /autocomplete -->', data);
    setOptions(data);
  }

  async function getDurations(origins, destinations) {
    const originsArr = origins.map(origin => {
      return {
        address : origin
      }
    });
    const destinationsArr = destinations.map(destination => {
      return {
        address: destination + 'San Francisco, CA',
      }
    });

      await axios.post('http://18.219.44.193:5000/duration',{
        origins: originsArr,
        destinations: destinationsArr,
      }).
      then(response => {
        const durations = response.data
          .map((duration, index) => {
          return {
            duration: duration.duration,
            distance: duration.distance,
            station: (index + 1).toString(),
          }
        })
      //  console.log('durations back from node -->', durations);
        const newStationArray = stationOptions.map((option, index) => {
          return {
            ...option,
            address: option.address,
            duration: durations[index].duration,
            distance: durations[index].distance,
          };
        }).sort((a, b) => a.duration - b.duration);
        setStationOptions(newStationArray);
        setStation(newStationArray[0].station);
        handleChange({
          station: newStationArray[0].station,
        });
   //     console.log('newStationArray -->', newStationArray);
   //     console.log('newStation -->', newStationArray[0].station);
      })
  }

  function handleAddressInput(event, value) {
    const address = value;
    setTimeout(() => { getOptions(address); }, 500);
  }

  useEffect(() => {
    const origins = [ senderAddress.address + ', San Fransisco, CA, ' + senderAddress.zipCode ];
    const destinations = stationOptions.map(option => option.address);
    getDurations(origins, destinations);
  }, [])

  useEffect(() => {
    toggleError(error);
  },[error])
  // console.log('station -->', station);

  // console.log(error);

  return (
    <React.Fragment>
      <Typography
        gutterBottom
        variant="h6"
      >
        Sender information
      </Typography>
      <Grid
        container
        spacing={3}
      >
        <Grid
          item
          xs={3}
        >
          <TextField
            autoComplete="given-name"
            defaultValue={orderInfo['senderFirstName']}
            fullWidth
            id="senderFirstName"
            label="First name"
            name="senderFirstName"
            onChange={(event) => {
              handleChange({senderFirstName : event.target.value});
            }}
            required
          />
        </Grid>
        <Grid
          item
          xs={3}
        >
          <TextField
            autoComplete="family-name"
            defaultValue={orderInfo['senderLastName']}
            fullWidth
            id="senderLastName"
            label="Last name"
            name="senderLastName"
            onChange={(event) => {
              handleChange({senderLastName : event.target.value});
            }}
            required
          />
        </Grid>

        <Grid
          item
          xs={6}
        >
          <TextField
            autoComplete="email"
            defaultValue={orderInfo['senderEmail']}
            fullWidth
            id="senderEmail"
            label="Email"
            name="senderEmail"
            onChange={(event) => {
              handleChange({senderEmail : event.target.value});
            }}
            required
          />
        </Grid>
        <Grid
          item
          xs={3}
        >
          <TextField
            autoComplete="phone-number"
            defaultValue={orderInfo['senderPhoneNumber']}
            fullWidth
            id="senderPhoneNumber"
            label="Phone Number"
            name="senderPhoneNumber"
            onChange={(event) => {
              handleChange({senderPhoneNumber : event.target.value});
            }}
            required
          />
        </Grid>
        <Grid
          item
          xs={6}
        >
          <Autocomplete
            freeSolo
            getOptionLabel={(option) => option.address ? option.address : ''}
            getOptionSelected={(option, value) => option.name === value.name}
            id="senderAddress"
            value={senderAddress}
            onChange={(event, value,reason) => {
              if (reason === 'select-option'){
                setSenderAddress(value);
                handleChange({
                  senderAddress: value['address'] + ', San Fransisco ,CA, ' + value['zipCode'],
                });
              }
            }}
            inputValue={senderAddress['address']}
            onInputChange={(event, value) => {
              setSenderAddress({...senderAddress,
                address: value,
              });
              handleAddressInput(event, value);
            }
            }
            options={options}
            renderInput={(params) => (
              <TextField
                {...params}
                InputProps={{
                  ...params.InputProps,
                }}
                label="Address"
                onMouseOut={() => {
                  const origins = [ senderAddress.address + ', San Fransisco, CA, ' + senderAddress.zipCode ];
                  const destinations = stationOptions.map(option => option.address);
                  getDurations(origins, destinations);
                }}
              />
            )}
          />
        </Grid>

        <Grid
          item
          xs={3}
        >
          <TextField
            autoComplete="shipping postal-code"
            fullWidth
            id="senderZip"
            label="Zip code"
            name="zip"
            value={senderAddress['zipCode']}
            onChange={(event) => {
              setSenderAddress({...senderAddress,
                zipCode: event.target.value
              });
              handleChange({senderAddress : senderAddress['address'] + ', San Fransisco, CA, ' + event.target.value});
            }}
            required
          />
        </Grid>
        <Grid
          item
          xs={3}
        >
            <FormControl>
              <InputLabel shrink id="demo-simple-select-placeholder-label-label">
                Dispatch Station
              </InputLabel>
          <Select
            id="stationID"
            IconComponent={() => { return <HtmlTooltip
              arrow
              placement="top"
              title={
                <React.Fragment>
                <span>The stations are where the packages are dispatched to ship;</span>
                  <br/>
                  <span>The sender should bring the package to one of the stations;</span>
                  <br/>
                  <span>The option of stations are sorted from nearest to farthest from sender address based on travelling time.</span>
                </React.Fragment>
              }>
              <HelpOutlineIcon/>
              </HtmlTooltip>} }
            label='Station'
            value={station}
            onChange={event => {
              setStation(event.target.value);
              handleChange({
                station: event.target.value,
              });
            }}
            helperText='The default selection is the nearest to your sender address'
          >
            {
              stationOptions.map((option, index) =>
                <MenuItem key={index} value={option.station}>{option.address}({option.distance}) </MenuItem>)
            }
          </Select>
              <FormHelperText>The default selection is nearest to sender address</FormHelperText>
              </FormControl>
        </Grid>
        <Grid
          item
          xs={12}
        ><Divider /></Grid>
        <Grid
          item
          xs={12}
        />
      </Grid>

      <Typography
        gutterBottom
        variant="h6"
      >
        Recipient information
      </Typography>
      <Grid
        container
        spacing={3}
      >
        <Grid
          item
          xs={3}
        >
          <TextField
            autoComplete="given-name"
            fullWidth
            id="recipientFirstName"
            label="First name"
            name="recipientFirstName"
            onChange={(event) => {
              handleChange({recipientFirstName : event.target.value});
            }}
            required
          />
        </Grid>
        <Grid
          item
          xs={3}
        >
          <TextField
            autoComplete="family-name"
            fullWidth
            id="recipientLastName"
            label="Last name"
            name="recipientLastName"
            onChange={(event) => {
              handleChange({recipientLastName : event.target.value});
            }}
            required
          />
        </Grid>
        <Grid
          item
          xs={6}
        >
          <TextField
            autoComplete="email"
            fullWidth
            id="recipientEmail"
            label="Email"
            name="recipientEmail"
            onChange={(event) => {
              handleChange({recipientEmail : event.target.value});
            }}
            required
          />
        </Grid>
        <Grid
          item
          xs={3}
        >
          <TextField
            autoComplete="phone-number"
            fullWidth
            id="recipientPhoneNumber"
            label="Phone Number"
            name="recipientPhoneNumber"
            onChange={(event) => {
              handleChange({recipientPhoneNumber : event.target.value});
            }}
            required
          />
        </Grid>
        <Grid
          item
          xs={6}
        >
          <Autocomplete
            getOptionLabel={(option) => option.address ? option.address : ''}
            getOptionSelected={(option, value) => option.name === value.name}
            id="recipientAddress"
            inputValue={recipientAddress}
            onChange={(event, value, reason) => {
              if (reason === 'select-option') {
                setRecipientAddress(value['address']);
                setRecipientZip(value['zipCode']);
                handleChange({
                  recipientAddress: value['address'] + ', San Fransisco, CA, ' + value['zipCode'],
                });
              }
            }}
            onInputChange={(event, value) => {
              setRecipientAddress(value);
              handleAddressInput(event, value);
            }}
            options={options}
            renderInput={(params) => (
              <TextField
                {...params}
                InputProps={{
                  ...params.InputProps,
                }}
                label="Address"
              />
            )}
          />
        </Grid>
        <Grid
          item
          xs={3}
        >
          <TextField
            autoComplete="shipping postal-code"
            fullWidth
            id="recipientZip"
            label="Zip / Postal code"
            name="zip"
            onChange={(event) => {
              setRecipientZip(event.target.value);
              handleChange({recipientAddress : recipientAddress + ', San Francisco, CA, ' + event.target.value});
            }}
            required
            value={recipientZip}
          />
        </Grid>
        <Grid
          item
          xs={12}
        >
          <Divider />
        </Grid>
        <Grid
          item
          xs={12}
        />
      </Grid>

      <Typography
        gutterBottom
        variant="h6"
      >
        Package information
      </Typography>
      <Grid
        container
        spacing={2}
      >
        <Grid
          item
          xs={3}
        >
          <TextField
            autoComplete="weight"
            error={error['weightError']}
            fullWidth
            helperText="Package weight must be within 20 lbs"
            id="packageWeight"
            InputProps={{
              endAdornment: (
                <HtmlTooltip
                  arrow
                  placement="top"
                  title="package heavier than 5 pounds can only be shipped by walking robots">
                <InputAdornment position="end">
                  <HelpOutlineIcon />
                </InputAdornment>
                </HtmlTooltip>
              ),
            }}
            label="Weight(lbs)"
            name="packageWeight"
            onChange={(event) => {
              if (Number(event.target.value) > 20) {
                setError({...error, weightError: true})
              } else {setError({...error, weightError: false})}
              handleChange({packageWeight : event.target.value});
            }}
            required
          />
        </Grid>
        <Grid
          item
          xs={3}
        >
          <TextField
            autoComplete="length"
            error={error['lengthError']}
            fullWidth
            helperText="Package length must be within 25 inches"
            id="packageLength"
            InputProps={{
              endAdornment: (
                <HtmlTooltip
                  arrow
                  placement="top"
                  title="package with any dimension larger than 13 inches can only be shipped by walking robots">
                  <InputAdornment position="end">
                    <HelpOutlineIcon />
                  </InputAdornment>
                </HtmlTooltip>
              ),
            }}
            label="Length(inch)"
            name="packageLength"
            onChange={(event) => {
              setError({...error, lengthError: event.target.value > 25});
              handleChange({packageLength : event.target.value});
            }}
            required
          />
        </Grid>
        <Grid
          item
          xs={3}
        >
          <TextField
            autoComplete="width"
            error={error['widthError']}
            fullWidth
            helperText='Package width must be within 25 inches'
            id="packageWidth"
            InputProps={{
              endAdornment: (
                <HtmlTooltip
                  arrow
                  placement="top"
                  title="package with any dimension larger than 13 inches can only be shipped by walking robots">
                  <InputAdornment position="end">
                    <HelpOutlineIcon />
                  </InputAdornment>
                </HtmlTooltip>
              ),
            }}
            label="Width(inch)"
            name="packageWidth"
            onChange={(event) => {
              setError({...error, widthError: event.target.value > 25});
              handleChange({packageWidth : event.target.value});
            }}
            required
          />
        </Grid>

        <Grid
          item
          xs={3}
        >
          <TextField
            autoComplete="height"
            error={error['heightError']}
            fullWidth
            helperText='Package length must be within 25 inches'
            id="packageHeight"
            InputProps={{
              endAdornment: (
                <HtmlTooltip
                  arrow
                  placement="top"
                  title="package with any dimension larger than 13 inches can only be shipped by walking robots">
                  <InputAdornment position="end">
                    <HelpOutlineIcon />
                  </InputAdornment>
                </HtmlTooltip>
              ),
            }}
            label="Height(inch)"
            name="packageHeight"
            onChange={(event) => {
              setError({...error, heightError: event.target.value > 25});
              handleChange({packageHeight : event.target.value});
            }}
            required
          />
        </Grid>
      <Grid item xs={3}>
        <FormControlLabel
          control={
            <HtmlTooltip
              arrow
              placement="top"
              title="Fragile items can only be shipped by walking robots">
            <Checkbox
              checked={fragile}
              color='secondary'
              name="fragile"
              onChange={(event) => {
                setFragile(Boolean(event.target.checked));
                handleChange({
                  fragile: Boolean(event.target.checked),
                });
              }}
            />
            </HtmlTooltip>
          }
          label="Fragile?"
        />
      </Grid>
        <Grid
          item
          xs={12}
        ><Divider /></Grid>
        <Grid
          item
          xs={12}
        />
      </Grid>
    </React.Fragment>
  );
}

export default ShipInfoForm;
