import { MarkerClusterer } from 'https://cdn.skypack.dev/@googlemaps/markerclusterer@2.3.1';
import jsonAll from './all.js';

async function initMap() {
  // Request needed libraries.
  const { Map } = await google.maps.importLibrary('maps');

  const bounds = new google.maps.LatLngBounds();
  const map = new google.maps.Map(document.getElementById('map'));

  // Add some markers to the map.
  const markers = capitals.map(position => {
    const marker = new google.maps.Marker({
        position,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          fillColor: 'red',
          fillOpacity: 1,
          scale: 10,
          strokeWeight: 0
        }
    });
    bounds.extend(marker.position);

    return marker;
  });

  map.fitBounds(bounds);
  // Add a marker clusterer to manage the markers.
  new MarkerClusterer({ markers, map });
}

// http://www.geognos.com/api/en/countries/info/all.json
const capitals = Object.values(jsonAll.Results).flatMap(data => data.Capital ? {
    lat: data.Capital.GeoPt.at(0),
    lng: data.Capital.GeoPt.at(1)
} : []);

initMap();
