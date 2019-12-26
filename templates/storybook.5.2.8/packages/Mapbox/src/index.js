import React, { Component } from 'react';
import PropTypes from 'prop-types';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

export const MapContext = React.createContext( {
  map: null,
} );

export const withMap = ( NewComponwnt ) => () => (
  <MapContext.Consumer>
    {
      // eslint-disable-next-line react/prop-types
      ( props ) => ( <NewComponwnt map={ props.map } { ...props } /> )
    }
  </MapContext.Consumer>
);

class Mapbox extends Component {
  constructor( props ) {
    super( props );
    this.mapRef = React.createRef();
    this.state = {
      mapInst: null,
    };
  }

  componentDidMount() {
    const { accessToken } = this.props;
    this.setState( {
      mapInst: new mapboxgl.Map( {
        accessToken,
        container: this.mapRef.current,
        style: 'mapbox://styles/mapbox/streets-v11',
        center: [ -122.420679, 37.772537 ],
        zoom: 13,
      } ),
    } );
  }

  componentWillUnmount() {
    const { mapInst } = this.state;
    if ( mapInst ) mapInst.remove();
  }

  render() {
    const { height, children } = this.props;
    const { mapInst } = this.state;
    return (
      <div
        id="map"
        style={ { height } }
        ref={ this.mapRef }
      >
        <MapContext.Provider value={ { map: mapInst } }>
          { mapInst && children }
        </MapContext.Provider>
      </div>
    );
  }
}

Mapbox.propTypes = {
  accessToken: PropTypes.string.isRequired,
  height: PropTypes.string,
  children: PropTypes.oneOfType( [
    PropTypes.string,
    PropTypes.node,
    PropTypes.element,
  ] ),
};

Mapbox.defaultProps = {
  height: 'calc(100vh - 18px)',
  children: null,
};

export default Mapbox;
