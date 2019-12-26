import React from 'react';
import Mapbox, { withMap } from '../packages/Mapbox';
import Plugin from '../packages/MapboxAnimatorPlugin';

// eslint-disable-next-line prefer-destructuring
const MAPBOX_TOKEN = process.env.MAPBOX_TOKEN;

// also just wrapping a functional component can be done real simply
// and as needed.
const PluginWithMap = withMap( ( props ) => {
  console.log( 'PluginWithMap', props );
  return (
    <div>simple component</div>
  );
} );

// Story Config
export default {
  title: 'Mapbox',
};

// story 1
export const Map = () => ( <Mapbox accessToken={ MAPBOX_TOKEN } /> );

// story 2
export const MapWithPlugins = () => (
  <Mapbox accessToken={ MAPBOX_TOKEN }>
    <Plugin />
    <PluginWithMap />
  </Mapbox>
);
