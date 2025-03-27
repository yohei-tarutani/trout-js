"use strict";
import {
  initializeApp,
  getFirestore,
  doc,
  setDoc,
  GeoPoint,
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
  firebaseConfig,
  tomtomAPIKey
} from '../common/modules/module_report.js';

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

let type;
let description;
let longitude;
let latitude;
let address;
let selectedFile
let uploadedPhotoUrl;

// Map
const key = tomtomAPIKey;

tt.setProductInfo("trout-demo", "1.0")
let map = tt.map({
  key: key,
  container: 'map',
  zoom: 13,
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

let marker = null;

// Report
document.getElementById("photoUploader").addEventListener("change", async (e) => {
  selectedFile = e.target.files[0];
});

// First Screen
document.getElementById('confirm-data').addEventListener('click', async () => {
  // Make first-screen unvisible
  const firstScreen = document.getElementById('first-screen');
  const secondScreen = document.getElementById('second-screen');
  firstScreen.style.display = 'none';
  secondScreen.style.display = 'block';

  const coords = getCoordinatesAndAddress();
  longitude = (await coords).longitude;
  latitude = (await coords).latitude;
  address = (await coords).address;

  type = getTypeValue();
  description = validateDescription(document.getElementById('description').value);

  // Elements for the second screen
  // type
  const checkedType = document.getElementById('checkedType');
  checkedType.value = type;
  checkedType.innerHTML = type;
  // description
  const checkedDescription = document.getElementById('checkedDescription');
  checkedDescription.value = description;
  checkedDescription.innerHTML = description;
  // photo
  const checkedPhotoName = document.getElementById('checkedPhotoName');
  checkedPhotoName.innerHTML = selectedFile.name;
  // longitude
  const checkedLongitude = document.getElementById('checkedLongitude');
  checkedLongitude.value = longitude;
  checkedLongitude.innerHTML = longitude;
  checkedLongitude.style.display = 'none';
  // latitude
  const checkedLatitude = document.getElementById('checkedLatitude');
  checkedLatitude.value = latitude;
  checkedLatitude.innerHTML = latitude;
  checkedLatitude.style.display = 'none';
  // address
  const checkedAddress = document.getElementById('checkedAddress');
  checkedAddress.value = address;
  checkedAddress.innerHTML = address;
});

// Second Screen
document.getElementById('submit-button').addEventListener('click', async () => {
  // Upload photo to Storage
  try {
    const storage = getStorage(app);
    const fileRef = ref(storage, '/images/' + selectedFile.name);
    const uploadTaskPromise = uploadBytes(fileRef, selectedFile);
    const snapshot = await uploadTaskPromise;
    uploadedPhotoUrl = await getDownloadURL(fileRef);
  } catch (err) {
    console.log('failed to upload blob or file!', err);
  };

  // Make second-screen unvisible
  const secondScreen = document.getElementById('second-screen');
  const thirdScreen = document.getElementById('third-screen');
  secondScreen.style.display = 'none';
  thirdScreen.style.display = 'block';
  // Upload photo to Storage
  type = document.getElementById('checkedType').value;
  description = document.getElementById('checkedDescription').value;
  longitude = document.getElementById('checkedLongitude').value;
  latitude = document.getElementById('checkedLatitude').value;
  address = document.getElementById('checkedAddress').value;

  const formattedDate = new Date().toISOString().split('T')[0].toString();
  const report_id = Math.random().toString(36);

  // PATTERN OF REPORTS COLLECTION
  await setDoc(doc(db, 'Reports', report_id), {
    address: address,
    created_date: formattedDate,
    description: description,
    location: new GeoPoint(latitude, longitude),
    photo: uploadedPhotoUrl,
    report_id: report_id,
    status: '1_New',
    type: type,
    user_id: sessionStorage.getItem("userId"),
  });
});

// Get a value of the type
function getTypeValue() {
  const radios = document.getElementsByName('type');
  for (var i = 0; i < radios.length; i++) {
    if (radios[i].checked) {
      return radios[i].value;
    }
  }
}

// Convert address to coordinates
async function convertAddressToCoordinates(address) {
  const response = await fetch(`https://api.tomtom.com/search/2/geocode/${address}.json?key=${key}`);
  const data = await response.json();
  const { lat, lon } = data.results[0].position;
  return { lat, lon };
}

// Get coordinates and address
async function getCoordinatesAndAddress() {
  let address, longitude, latitude;
  // Check if the address is typed
  if (document.getElementById('typedAddress').value) {
    address = document.getElementById('typedAddress').value;
    const coord = await convertAddressToCoordinates(address);
    longitude = coord.lon;
    latitude = coord.lat;
  } else {
    // Get the coordinates from the map
    longitude = document.getElementById('longitude').value;
    latitude = document.getElementById('latitude').value;
    address = document.getElementById('generetedAddress').value;
  }
  return { longitude, latitude, address };
}

function createLocationElement(longitude, latitude, address) {
  // If the inputs already exist, remove them
  if (document.getElementById('latitude') && document.getElementById('longitude') && document.getElementById('generetedAddress')) {
    document.getElementById('latitude').remove();
    document.getElementById('longitude').remove();
    document.getElementById('generetedAddress').remove();
  }

  // Create hidden inputs to store the latitude and longitude
  const latInput = document.createElement('input');
  latInput.id = 'latitude';
  latInput.type = 'hidden';
  latInput.value = latitude;
  const lngInput = document.createElement('input');
  lngInput.id = 'longitude';
  lngInput.type = 'hidden';
  lngInput.value = longitude;
  const addressInput = document.createElement('input');
  addressInput.id = 'generetedAddress';
  addressInput.type = 'hidden';
  addressInput.value = address;
  document.querySelector('.input-field').appendChild(latInput);
  document.querySelector('.input-field').appendChild(lngInput);
  document.querySelector('.input-field').appendChild(addressInput);
}

// Get the location of the clicked point
async function selectLocation(event) {
  let latitude = event.lngLat.lat;
  let longitude = event.lngLat.lng;
  let address;

  // Remove the previous marker if exists
  if (marker !== null) {
    marker.remove();
  }

  // Create a new marker at the clicked coordinates
  const hazardLocationEle = document.createElement("div");
  hazardLocationEle.id = "hazardsMarker"
  marker = new tt.Marker({ element: hazardLocationEle })
    .setLngLat([longitude, latitude])
    .addTo(map);

  // Convert longitude and latitude to address
  try {
    const response = await fetch('https://api.tomtom.com/search/2/reverseGeocode/' + latitude + ',' + longitude + '.json?key=' + key);
    const data = await response.json();
    address = await data.addresses[0].address.freeformAddress;
    createLocationElement(longitude, latitude, address);
  } catch (error) {
    console.error('Error converting coordinates:', error);
  }
}

function validateDescription(description) {
  if (!description.endsWith('.')) {
    description += '.';
  }
  if (!description.includes(' ')) {
    description += ' ';
  }
  return description;
}

const backButton = document.querySelector('.back-button');

map.on('click', selectLocation);

backButton.addEventListener('click', () => {
  const firstScreen = document.getElementById('first-screen');
  const secondScreen = document.getElementById('second-screen');
  firstScreen.style.display = "block";
  secondScreen.style.display = "none";

});