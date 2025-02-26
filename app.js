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

const searchParams = new URLSearchParams(location.search);
const useCluster = searchParams.has('useCluster');
const useStage = searchParams.has('useStage');
const baseUrl = useStage ? 'https://darom-adom-steps-staging-aeh4chfefwfkgrf2.eastus-01.azurewebsites.net' : 'https://darom-adom-steps-dgfrgpctfrcggeb8.eastus-01.azurewebsites.net';

const initMap = async data => {
  // Add some markers to the map.
  const markers = data.map(([lat, lng, color]) => {
    const marker = new google.maps.Marker({
        position: { lat, lng },
        icon: 'flower-red.svg',
        // icon: `flower-${color || 'red'}.svg`,
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
    if (totalSteps) {
      const row = document.createElement('div');
      row.classList.add('row');
      row.dataset.countryCode = countryCode;
      row.innerHTML = `
        <div class="index">${index++}</div>
        <div class="country">${countryNames[countryCode] || countryCode}</div>
        <div class="steps">${totalSteps.toLocaleString('en-US')}</div>`;

      row.addEventListener('click', ({ target }) => {
        const rowEl = target.matches('.row') ? target : target.closest('.row');
        if (!boundsPerCountry[rowEl.dataset.countryCode]) {
          return;
        }
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

const getMarkers = (code, totalMarkers, colorPercentage) => fetch(`/locations/${code}.json`)
  .then(res => {
    if (res.ok) {
      return res.json();
    }
    console.error(`[APP] Failed to fetch markers for ${code}`);
    return [];
  })
  .then(res => {
    const result = res.slice(0, totalMarkers);
    if (result.length) {
      boundsPerCountry[code] = new google.maps.LatLngBounds();
      result.forEach(([lat, lng]) => boundsPerCountry[code].extend({ lat, lng }));
    }
    return colorPercentage ? randomizeByPercentage(result, colorPercentage) : result;
  });

const randomizeByPercentage = (arr, percentage) => {
  let count = Math.floor(arr.length * percentage);
  let indices = new Set();
  
  while (indices.size < count) {
      indices.add(Math.floor(Math.random() * arr.length));
  }
  
  return arr.map((item, index) => [
    ...item,
    indices.has(index) ? 'orange' : 'red'
  ]);
}

Promise.all([
  fetch(`${baseUrl}/steps/get-all`, {
    headers: { 'requested-from-browser': true }
  }).then(res => {
    if (res.ok) {
      return res.json();
    }
    console.error('[APP] Failed to fetch GET ALL');
    return [];
  }),
  fetch('country-names.json').then(res => {
    if (res.ok) {
      return res.json();
    }
    console.error('[APP] Failed to fetch COUNTRY NAMES');
    return {};
  }),
  fetch(`${baseUrl}/steps/color`).then(res => {
    if (res.ok) {
      return res.json();
    }
    console.error('[APP] Failed to fetch STEPS COLOR');
    return {};
  })
]).then(([res, countryNames, stepsColor]) => {
    const colorPercentage = stepsColor?.percentage;
    updateBoxes(res.sort(({totalSteps: x}, {totalSteps: y}) => y - x), countryNames);
    return Promise.all(
      res.filter(({ totalMarkers }) => totalMarkers).map(({ countryCode, totalMarkers }) => getMarkers(countryCode, totalMarkers, colorPercentage))
    );
  })
  .then(res => {
    return res.flatMap(i => i);
  })
  .then(data => initMap(data));
