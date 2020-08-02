/*global google*/
import React, { Component } from 'react'
import RedRob from './RedRob.svg'
import blueMarker from './blue-marker.svg'
import drone from './drone.png'
import mapStyles from './mapStyles'
import customStyles from './customStlyes.css'
import Tooltip from '@material-ui/core/Tooltip';
import Button from '@material-ui/core/Button';
import ClickAwayListener from '@material-ui/core/ClickAwayListener';

import {
  withScriptjs,
  withGoogleMap,
  GoogleMap,
  DirectionsRenderer,
  Marker,
  InfoWindow,
  Polyline,
} from "react-google-maps";

class Route extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      directions: null,
      error: null
    };
    this.getRoute = this.getRoute.bind(this);
  }

  getRoute = () => {
    const destination  = this.props.deslocation;
    const origin = this.props.location;
    const request = {
      origin: origin,
      destination: destination,
      travelMode: google.maps.TravelMode.DRIVING,
    };

    const directionsService = new google.maps.DirectionsService();
    directionsService.route(
      request, (result, status) => {
        if (status === google.maps.DirectionsStatus.OK) {
          this.setState({
            directions: result
          });

        } else {
          this.setState({ error: result });
        }
      });
  }

  componentDidMount() {
    this.getRoute();
    this.routeTimer = setInterval(
      () => this.getRoute(),
      60 * 1000
    );
  }

  componentWillMount() {
    clearInterval(this.routeTimer);
  }

  /* componentDidUpdate() {

     const directionsService = new google.maps.DirectionsService();
     directionsService.route(
       {
         origin: origin,
         destination: desLocation,
         travelMode: google.maps.TravelMode.DRIVING,
       },
       (result, status) => {
         if (status === google.maps.DirectionsStatus.OK) {
           this.setState({
             directions: result
           });
         } else {
           this.setState({ error: result });
         }
       }
     );
   } */

  render() {
    if (this.state.error) {
      return <h1>{this.state.error}</h1>;
    }
    return (this.state.directions && <DirectionsRenderer
      options={{
        markerOptions: {visible : false}
      }}
      directions={this.state.directions} />)
  }
}

export class AroundMap extends Component {
  constructor(props) {
    super(props);
  }
  state = {
    isOpen: false,
    // robot: true,
    directions: null,
  };

  displayMarkers = (locations) => {
    // const { robot } = this.state;
    if ((this.props.info && this.props.info['machine type'] === 'robot')) {
      return locations.map((store, index) => {
        return <Tooltip title="Your Package is getting closer! " placement="right">
          <Marker key={index} id={index} position={{
            lat: store.lat,
            lng: store.lng
          }}
                  icon={{
                    url: RedRob,
                    scaledSize: new window.google.maps.Size(35,35),
                  }}
                  onClick={() => console.log("You clicked me!")} />
        </Tooltip>
      })
    } else {
      return locations.map((store, index) => {
        return <Tooltip title="Your Package is getting closer! " placement="right">
          <Marker key={index} id={index} position={{
            lat: store.lat,
            lng: store.lng
          }}
                  icon={{
                    url: drone,
                    scaledSize: new window.google.maps.Size(30,30),
                  }}
                  onClick={() => console.log("You clicked me!")} />
        </Tooltip>
      })
    }
  }

  _mapLoaded(mapProps, map) {
    map.setOptions({
      styles: mapStyles
    })
  }

  handleToggle = () => {
    this.setState((prevState) => ({ isOpen: !prevState.isOpen }));
  }

  render() {
    const mapStyles = {
      width: '100%',
      height: '100%'
    }

    const { info } = this.props;
    console.log('GMap info -->', info);
    let locationString = [];
    if (info && info['current location'] != undefined) {
      locationString = info['current location'].split(',');
    }

    const location = {
      lat: parseFloat(locationString[0]),
      lng: parseFloat(locationString[1]),
    };
    console.log('location -->', location);

    let desLocationString = [];
    if (info && info['destination'] != undefined) {
      desLocationString = info['destination'].split(',');
    }
    const desLocation = {
      lat: parseFloat(desLocationString[0]),
      lng: parseFloat(desLocationString[1]),
    };
    console.log('desLocation -->', desLocation);

    return (
      <div>
        <GoogleMap
          zoom={12}
          defaultCenter={{ lat: 37.765, lng: -122.44 }}
        >
          {
            isNaN(location.lat) || isNaN(location.lng) || isNaN(desLocation.lat) || isNaN(desLocation.lng) ? null :
              info['machine type'] === 'drone' ? <Polyline
                path={[
                  location,
                  desLocation
                ]}
                options={{strokeColor:'#00FFFF'}}/> :
                <Route location={location} deslocation={desLocation}/>
          }
          {this.displayMarkers([location])}
          <Marker
            position={{lat: desLocation.lat, lng: desLocation.lng}}
            onMouseOver={this.handleToggle}
            onMouseOut={this.handleToggle}
            onClick={this.handleToggle}

            icon={{
              url: blueMarker,
              scaledSize: new window.google.maps.Size(20,35),
            }}
            onClick={this.handleToggle}
          >
            {this.state.isOpen ? (
              <InfoWindow>
                <div>
                  <h3>This is Destination. Carrier is on the way.</h3>
                </div>
              </InfoWindow>
            ) : null}
          </Marker>
        </GoogleMap>

      </div>
    );

  }
}

const GMap = withScriptjs(withGoogleMap(AroundMap));

export default GMap;
