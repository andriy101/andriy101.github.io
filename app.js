import { MarkerClusterer } from 'https://cdn.skypack.dev/@googlemaps/markerclusterer@2.3.1';

const initMap = async data => {
  const useCluster = new URLSearchParams(location.search).has('useCluster');
  // Request needed libraries.
  const { Map } = await google.maps.importLibrary('maps');

  const bounds = new google.maps.LatLngBounds();
  const map = new google.maps.Map(document.getElementById('map'));

  // Add some markers to the map.
  const markers = data.map(([lat, lng]) => {
    const marker = new google.maps.Marker({
        position: { lat, lng },
        icon: 'flower.svg',
        ...(useCluster ? {} : { map })
    });

    bounds.extend(marker.position);

    return marker;
  });

  map.fitBounds(bounds);

  if (useCluster) {
    // Add a marker clusterer to manage the markers.
    new MarkerClusterer({
      markers,
      map,
      onClusterClick: ev => ev.preventDefault()
    });
  }
}

const updateBoxes = (res, countryNames) => {
  let index = 1;
  const total = res.reduce((acc, { countryCode, totalSteps }) => {
    if (totalSteps && index < 6) {
      const row = document.createElement('div');
      row.classList.add('row');
      row.innerHTML = `
        <div class="index">${index++}</div>
        <div class="country">${countryNames[countryCode] || countryCode}</div>
        <div class="steps">${totalSteps}</div>`;
      document.querySelector('.list .content').appendChild(row);
    }
    return acc + totalSteps;
  }, 0);
  document.querySelector('.number').innerHTML = total.toLocaleString('en-US');
};

const getMarkers = (code, totalMarkers) => fetch(`/coordinates/${code}.json`)
  .then(res => {
    if (res.ok) {
      return res.json();
    }
    console.error(`[APP] Failed to fetch markers for ${code}`);
    return [];
  })
  .then(res => res.slice(0, totalMarkers));

Promise.all([
  fetch('https://a.primefactorgames.com/steps/get-all', {
    headers: { 'requested-from-browser': true }
  }).then(res => {
    if (res.ok) {
      return res.json();
    }
    console.error('[APP] Failed to fetch GET ALL');
    return [];
  }),
  fetch('/country-names.json').then(res => {
    if (res.ok) {
      return res.json();
    }
    console.error('[APP] Failed to fetch COUNTRY NAMES');
    return {};
  }),
]).then(([res, countryNames]) => {
    updateBoxes(res, countryNames);

    return Promise.all(
      res.filter(({ totalMarkers }) => totalMarkers).map(({ countryCode, totalMarkers }) => getMarkers(countryCode, totalMarkers))
    );
  })
  .then(res => res.flatMap(i => i))
  .then(data => initMap(data));
