import { MarkerClusterer } from 'https://cdn.skypack.dev/@googlemaps/markerclusterer@2.3.1';
import jsonAll from './all.js';

async function initMap(data) {
  console.log('[PERFFF] init map', Date.now() - PERFFF);
  // Request needed libraries.
  const { Map } = await google.maps.importLibrary('maps');
  console.log('[PERFFF] LOAD map', Date.now() - PERFFF);

  const bounds = new google.maps.LatLngBounds();
  const map = new google.maps.Map(document.getElementById('map'));

  // Add some markers to the map.
  const markers = data.map(position => {
    const marker = new google.maps.Marker({
        position,
        icon: 'flower.svg',
        // icon: {
        //   path: google.maps.SymbolPath.CIRCLE,
        //   fillColor: 'red',
        //   fillOpacity: 1,
        //   scale: 10,
        //   strokeWeight: 0
        // }
    });
    bounds.extend(marker.position);

    return marker;
  });
  console.log('[PERFFF] LOOP', Date.now() - PERFFF);

  map.fitBounds(bounds);
  // Add a marker clusterer to manage the markers.
  new MarkerClusterer({ markers, map });
}

// http://www.geognos.com/api/en/countries/info/all.json
const capitals = Object.values(jsonAll.Results).flatMap(data => data.Capital ? {
    lat: data.Capital.GeoPt.at(0),
    lng: data.Capital.GeoPt.at(1)
} : []);

const getMarkers = (code, totalMarkers) => fetch(`/coordinates/${code}.json`)
  .then(res => {
    if (res.ok) {
      console.log('[PERFFF] GET ALL', code ,Date.now() - PERFFF);
      return res.json();
    }
    console.error(`[APP] Failed to fetch markers for ${code}`);
    return [];
  })
  .then(res => res.slice(0, totalMarkers));

fetch('https://b.primefactorgames.com/steps/get-all')
  .then(res => {
    if (res.ok) {
      console.log('[PERFFF] GET ALL', Date.now() - PERFFF);
      return res.json();
    }
    console.error('[APP] Failed to fetch GET ALL');
    return [];
  })
  .then(res => {
    console.log('+++ RRR', res);
    return Promise.all(
      res.filter(({ totalMarkers }) => totalMarkers).map(({ countryCode, totalMarkers }) => getMarkers(countryCode, totalMarkers))
    );
  })
  .then(res => res.flatMap(i => i))
  .then(data => initMap(data));
