import { MarkerClusterer } from 'https://cdn.skypack.dev/@googlemaps/markerclusterer@2.3.1';

// Request needed libraries.
const { Map } = await google.maps.importLibrary('maps');
const map = new google.maps.Map(document.getElementById('map'));
const boundsPerCountry = {};
const bounds = new google.maps.LatLngBounds();
let currentBound;

// Check if the query matches (user prefers reduced motion)
const query = window.matchMedia('(prefers-reduced-motion: reduce)');
const prefersReducedMotion = query.matches;

const initMap = async data => {
  const useCluster = new URLSearchParams(location.search).has('useCluster');

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
      row.dataset.countryCode = countryCode;
      row.innerHTML = `
        <div class="index">${index++}</div>
        <div class="country">${countryNames[countryCode] || countryCode}</div>
        <div class="steps">${totalSteps.toLocaleString('en-US')}</div>`;

      row.addEventListener('click', ({ target }) => {
        const rowEl = target.matches('.row') ? target : target.closest('.row');
        document.querySelector('.row.selected')?.classList?.remove('selected');
        rowEl.classList.add('selected')
        if (!currentBound || prefersReducedMotion) {
          map.fitBounds(boundsPerCountry[rowEl.dataset.countryCode]);
        } else if (currentBound !== rowEl.dataset.countryCode) {
          map.fitBounds(bounds);
          setTimeout(() => map.fitBounds(boundsPerCountry[rowEl.dataset.countryCode]), 800);
        }
        currentBound = rowEl.dataset.countryCode;
      });
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
  .then(res => {
    const result = res.slice(0, totalMarkers);
    boundsPerCountry[code] = new google.maps.LatLngBounds();
    result.forEach(([lat, lng]) => boundsPerCountry[code].extend({ lat, lng }));
    return result;
  });

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
