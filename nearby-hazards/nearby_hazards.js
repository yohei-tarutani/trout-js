'use strict';

import {
  initializeApp,
  getFirestore,
  collection,
  getDocs,
  query,
  where,
  firebaseConfig,
  tomtomAPIKey
} from "../common/modules/module.js";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Map
const key = tomtomAPIKey;

tt.setProductInfo("trout-demo", "1.0")
let map = tt.map({
  key: key,
  container: 'map',
  zoom: 14,
});

// Get user current location
if (navigator.geolocation) {
  navigator.geolocation.getCurrentPosition(
    function (position) {
      const lat = position.coords.latitude;
      const lng = position.coords.longitude;

      // Center the map with the user
      map.setCenter([lng, lat]);

      // Add a customized pin of the user
      const currentLocationEle = document.createElement("div");
      currentLocationEle.id = "currentMarker"
      let marker = new tt.Marker({ element: currentLocationEle }).setLngLat([lng, lat]).addTo(map);
    },
    function (error) {
      console.error("Error al obtener la ubicación:", error.message);
    }
  );
} else {
  console.error("La geolocalización no es compatible con este navegador ");
}

const loaderWrapper = document.querySelector('.loader-wrapper');
const loaderTrigger = document.getElementById('loader-trigger');
const main = document.querySelector('main');
const rangeValue = document.getElementById('rangeInput');
const rereportList = document.querySelector('.report-list');

// Initial process
window.onload = async function () {
  displayLoader(loaderWrapper, main);
  try {
    const preferableRange = 8;
    const cul = await getUserCurrentLocation();
    const reports = await fetchActiveReports();

    reports.forEach(report => {
      const lat = report.data().location._lat;
      const long = report.data().location._long;
      
      if (calculateDistance(cul.currentLat, cul.currentLong, lat, long) <= preferableRange) {
        const hazardsMarkerEle = document.createElement("div");
        hazardsMarkerEle.id = "hazardsMarker";
        const reportList = document.querySelector('.report-list');
        reportList.appendChild(generateHazardCard(report));
        let marker = new tt.Marker({ element: hazardsMarkerEle })
          .setLngLat([long, lat])
          .addTo(map);
      }
    });
  } catch (error) {
    console.error("Error fetching or processing reports:", error);
  }
  undisplayLoader(loaderWrapper, main)
}

rangeValue.addEventListener('input', async function () {
  const mapEle = document.querySelector('.mapboxgl-canvas-container');
  const hazards = mapEle.querySelectorAll('#hazardsMarker');
  hazards.forEach(function(hazard) {
    hazard.parentNode.removeChild(hazard);
  });

  displayLoader(loaderWrapper, main);
  removeAllChildElements(rereportList);
  const preferableRange = rangeValue.value;
  const sliderValueDisplay = document.getElementById('sliderValueDisplay');
  sliderValueDisplay.textContent = `${preferableRange}km`;

  try {
    const cul = await getUserCurrentLocation();
    const reports = await fetchActiveReports();
    reports.forEach(report => {
      const lat = report.data().location._lat;
      const long = report.data().location._long;

      if (calculateDistance(cul.currentLat, cul.currentLong, lat, long) <= preferableRange) {
        const hazardsMarkerEle = document.createElement("div");
        hazardsMarkerEle.id = "hazardsMarker";
        const reportList = document.querySelector('.report-list');
        reportList.appendChild(generateHazardCard(report));
        let marker = new tt.Marker({ element: hazardsMarkerEle })
          .setLngLat([long, lat])
          .addTo(map);
      }
    });
  } catch (error) {
    console.error("Error fetching or processing reports:", error);
  }
  undisplayLoader(loaderWrapper, main);
});

// Get the user's current location
function getUserCurrentLocation() {
  return new Promise((resolve, reject) => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        position => {
          const currentLat = position.coords.latitude;
          const currentLong = position.coords.longitude;
          resolve({ currentLat, currentLong });
        },
        error => {
          reject(error);
        }
      );
    } else {
      reject(new Error('Geolocation is not supported by this browser.'));
    }
  });
}

// Fetch active reports from Firestore
async function fetchActiveReports() {
  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);
  const reportsRef = collection(db, "Reports");
  const q = query(reportsRef, where("status", "in", ["1_New", "2_Ongoing"]));
  const querySnapshop = await getDocs(q);
  return querySnapshop;
}

// Calculate distance between the user location and the report location
function calculateDistance(curremtLat, currentLong, hazardLat, hazardLong) {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = (hazardLat - curremtLat) * Math.PI / 180;  // Convert degrees to radians
  const dLon = (hazardLong - currentLong) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(curremtLat * Math.PI / 180) * Math.cos(hazardLat * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in kilometers
  return distance;
}

// Generate a hazard card
function generateHazardCard(report) {
  // Report wrapper
  const div = document.createElement('div');
  div.classList.add('report');
  // Text wrapper
  const textWrapper = document.createElement('div');
  textWrapper.classList.add('text-wrapper');
  // Image wrapper
  const imageWrapper = document.createElement('div');
  imageWrapper.classList.add('image-wrapper');
  // Image
  const img = document.createElement('img');
  img.src = report.data().photo;
  img.alt = "Image of a hazard";
  // Title
  const title = document.createElement('h3');
  title.innerHTML = report.data().type;
  // Posted Date
  const postedDate = document.createElement('p');
  postedDate.innerHTML = `Posted ${report.data().created_date}`;
  // Address
  const address = document.createElement('p');
  address.innerHTML = report.data().address;
  
  // Read more
  const readMore = document.createElement('a');
  readMore.href ='#';
  readMore.innerHTML = 'See details';

  imageWrapper.appendChild(img);
  textWrapper.appendChild(title);
  textWrapper.appendChild(postedDate);
  textWrapper.appendChild(address);
  textWrapper.appendChild(readMore);
  div.appendChild(imageWrapper);
  div.appendChild(textWrapper);
  return div;
}

// Remove existed all reports
function removeAllChildElements(parentElement) {
  while (parentElement.firstChild) {
    parentElement.removeChild(parentElement.firstChild);
  }
}

function displayLoader(loaderWrapper, main) {
  loaderWrapper.classList.remove('visually-hidden');
  main.classList.add('visually-hidden');
}

function undisplayLoader(loaderWrapper, main) {
  loaderWrapper.classList.add('visually-hidden');
  main.classList.remove('visually-hidden');
}


const filterButton = document.querySelector(".filter-button");
const filterMenu = document.querySelector(".filter-menu");

filterButton.onclick = () => {
    filterMenu.classList.toggle('open');
}
