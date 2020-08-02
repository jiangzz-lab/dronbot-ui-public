/*global google*/
import React, { Component, useEffect, useState } from 'react';
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
} from 'react-google-maps';

const Route = (props) => {
  const { location, deslocation } = props;
  const [directions, setDirections] = useState(null);
  const [error, setError] = useState(null);

  const getRoute = () => {
    const destination  = deslocation;
    const origin = location;
    const request = {
      origin: origin,
      destination: destination,
      travelMode: google.maps.TravelMode.DRIVING,
    };

    const directionsService = new google.maps.DirectionsService();
    directionsService.route(
      request, (result, status) => {
        if (status === google.maps.DirectionsStatus.OK) {
          setDirections(result);
        } else {
          setError(result);
        }
      });
  }

  /*useEffect(() => {
    const routerTimer = setInterval(
      getRoute,
      60 * 1000
    );
    return clearInterval(routerTimer);
  },[])*/

  useEffect(() => {
    getRoute();
  },[location, deslocation])

  if (error) {
    return <h1>{error}</h1>;
  }
  return (directions && <DirectionsRenderer
    directions={directions}
    options={{
      markerOptions: {visible : false}
    }}
                        />)

}

export class AroundMap extends Component {
  constructor(props) {
    super(props);
  }
  state = {
    isDesOpen: false,
    isCarrierOpen: false,
    directions: null,
  };

  displayMarkers = (locations) => {
    // const { robot } = this.state;
    if ((this.props.info && this.props.info['machine type'] === 'robot')) {
      return locations.map((store, index) => {
        return <div>
          <Marker 
            icon={{
              url: RedRob,
              scaledSize: new window.google.maps.Size(35,35),
            }} 
            id={index} 
            key={index}
            onMouseOut={this.handleToggleCarrier}
            onMouseOver={this.handleToggleCarrier}
            position={{
              lat: store.lat,
              lng: store.lng
            }}
          >
            {this.state.isCarrierOpen ? (
              <InfoWindow>
                <div>
                  <h3>I am carrying your package!</h3>
                </div>
              </InfoWindow>
            ) : null}
        </Marker>
        </div>
      })
    } else {
      return locations.map((store, index) => {
        return <div>
          <Marker
            icon={{
              url: drone,
              scaledSize: new window.google.maps.Size(30,30),
            }}
            id={index}
            key={index}
            onClick={this.handleToggleCarrier}
            onMouseOut={this.handleToggleCarrier}
            onMouseOver={this.handleToggleCarrier}
            position={{
              lat: store.lat,
              lng: store.lng
            }}
          >
            {this.state.isCarrierOpen ? (
              <InfoWindow>
                <div>
                  <h3>I am carrying your package!</h3>
                </div>
              </InfoWindow>
            ) : null}
          </Marker>
        </div>
      })
    }
  }

  _mapLoaded(mapProps, map) {
    map.setOptions({
      styles: mapStyles
    })
  }

  handleToggleDes = () => {
    this.setState((prevState) => ({ isDesOpen: !prevState.isDesOpen }));
  }

  handleToggleCarrier = () => {
    this.setState((prevState) => ({ isCarrierOpen: !prevState.isCarrierOpen }));
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
          defaultCenter={{ lat: 37.765, lng: -122.44 }}
          zoom={12}
        >
          {
            isNaN(location.lat) || isNaN(location.lng) || isNaN(desLocation.lat) || isNaN(desLocation.lng) ? null :
              info['machine type'] === 'drone' ? <Polyline
                options={{strokeColor:'#00FFFF'}}
                path={[
                  location,
                  desLocation
                ]}
                                                 /> :
                <Route
                  deslocation={desLocation}
                  location={location}
                />
          }
          {this.displayMarkers([location])}
          <Marker
            icon={{
              url: blueMarker,
              scaledSize: new window.google.maps.Size(20,35),
            }}
            onMouseOut={this.handleToggleDes}
            onMouseOver={this.handleToggleDes}
            position={{lat: desLocation.lat, lng: desLocation.lng}}
          >
            {this.state.isDesOpen ? (
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
