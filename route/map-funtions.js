import {
  initializeApp,
  getFirestore,
  collection,
  getDocs,
  firebaseConfig,
  tomtomAPIKeyForRoute
} from "../common/modules/module.js";
import { toggleButtonsVisibility } from "./toggle-buttons.js";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

let hazards = [];
var waypoints = [];

var adjustedGlobalTime = 0;

let map = tt.map({
  key: tomtomAPIKeyForRoute,
  container: "map",
  zoom: 13,
  pitch: 0,
  center: [0, 0],
});
var currentUserLocation = null;

// Mark the reported hazard location
// async function markReportedLocation() {
//   const colRef = collection(db, "Reports");
//   const snapShot = await getDocs(colRef);
//   snapShot.forEach((doc) => {
//     if (doc.data().status == "1_New" || doc.data().status == "2_Ongoing") {
//       const markerElement = document.createElement("div");
//       markerElement.innerHTML =
//         '<img src="../assets/Mobile/Hazard on map.png" alt="Marker" style="width: 1.5rem; height: 1.5rem;">';

//       // Usar el elemento personalizado como ícono del marcador
//       let marker = new tt.Marker({
//         element: markerElement,
//       })
//         .setLngLat([doc.data().location._long, doc.data().location._lat])
//         .addTo(map);

//       // Create a popup
//       let popup = new tt.Popup().setHTML(`
//         <img src="${
//           doc.data().photo
//         }" alt="Photo" style="width: 5rem; height: auto;">
//         <p>Address: ${doc.data().address}</p>
//       `);

//       // Show the popup on the marker
//       marker.setPopup(popup);
//     }
//   });
// }
async function markReportedLocation() {
  const colRef = collection(db, "Reports");
  const snapShot = await getDocs(colRef);
  snapShot.forEach((doc) => {
    if (doc.data().status == "1_New" || doc.data().status == "2_Ongoing") {
      const markerElement = document.createElement("div");
      markerElement.id = "hazardsMarker";

      let marker = new tt.Marker({
        element: markerElement,
      })
        .setLngLat([doc.data().location._long, doc.data().location._lat])
        .addTo(map);

      let popupContent = `
        <div class="report">
          <div class="header-container">
            <img src="${doc.data().photo}" alt="Photo" class="report-img">
            <p>Address: ${doc.data().address}</p>
          </div>

        </div>
      `;

      let popup = new tt.Popup().setHTML(popupContent);
      marker.setPopup(popup);
    }
  });
}

function showSearchBar(map) {
  let options = {
    searchOptions: {
      key: tomtomAPIKeyForRoute,
      language: "en-GB",
      limit: 5,
      boundingBox: new tt.LngLatBounds(
        new tt.LngLat(-123.224215, 49.19854), // Esquina inferior izquierda de Vancouver
        new tt.LngLat(-123.022947, 49.316738) // Esquina superior derecha de Vancouver
      ),
    },
    autocompleteOptions: {
      key: tomtomAPIKeyForRoute,
      language: "en-GB",
      boundingBox: new tt.LngLatBounds(
        new tt.LngLat(-123.224215, 49.19854), // Esquina inferior izquierda de Vancouver
        new tt.LngLat(-123.022947, 49.316738) // Esquina superior derecha de Vancouver
      ),
    },
  };

  let ttSearchBox = new tt.plugins.SearchBox(tt.services, options);
  let searchMarkersManager = new SearchMarkersManager(map);
  ttSearchBox.on("tomtom.searchbox.resultsfound", handleResultsFound);
  ttSearchBox.on("tomtom.searchbox.resultselected", handleResultSelection);
  ttSearchBox.on("tomtom.searchbox.resultfocused", handleResultSelection);
  ttSearchBox.on("tomtom.searchbox.resultscleared", handleResultClearing);
  map.addControl(ttSearchBox, "top-left");

  function handleResultsFound(event) {
    let results = event.data.results.fuzzySearch.results;

    if (results.length === 0) {
      searchMarkersManager.clear();
    }
    searchMarkersManager.draw(results);
    // fitToViewport(results);
  }

  checkHazardsAndMark;

  function handleResultSelection(event) {
    let result = event.data.result;
    const coord = result.position;

    if (result.type === "category" || result.type === "brand") {
      return;
    }
    waypoints = [currentUserLocation];
    searchMarkersManager.draw([result]);
    waypoints.push(coord);
    thirdRout();
    route();
    secondRout();

    toggleButtonsVisibility();
    const userLocation = waypoints[0];
    fitToViewport(userLocation, coord); // Ajustar el mapa
  }
  //change
  function fitToViewport(userLocation, destination) {
    let markerData = [];
    if (!destination) {
      return;
    }
    let bounds = new tt.LngLatBounds();
    // Añadir la ubicación del usuario y del destino al bounds
    bounds.extend(new tt.LngLat(userLocation[0], userLocation[1])); // Longitud, Latitud del usuario
    bounds.extend(new tt.LngLat(destination.lng, destination.lat)); // Longitud, Latitud del destino

    map.fitBounds(bounds, { padding: 110 }); // Ajusta el padding según sea necesario
    if (markerData instanceof Array) {
      markerData.forEach(function (marker) {
        bounds.extend(getBounds(marker));
      });
    } else {
      bounds.extend(getBounds(markerData));
    }
    if (markerData.length > 0) {
      map.setCenter(markerData[0].position);
    }
  }

  function getBounds(data) {
    let btmRight;
    let topLeft;
    if (data.viewport) {
      btmRight = [
        data.viewport.btmRightPoint.lng,
        data.viewport.btmRightPoint.lat,
      ];
      topLeft = [
        data.viewport.topLeftPoint.lng,
        data.viewport.topLeftPoint.lat,
      ];
    }
    return [btmRight, topLeft];
  }

  function handleResultClearing() {
    searchMarkersManager.clear();
  }

  function SearchMarkersManager(map, options) {
    this.map = map;
    this._options = options || {};
    this._poiList = undefined;
    this.markers = {};
  }

  SearchMarkersManager.prototype.draw = function (poiList) {
    this._poiList = poiList;
    this.clear();
    this._poiList.forEach(function (poi) {
      let markerId = poi.id;
      let poiOpts = {
        name: poi.poi ? poi.poi.name : undefined,
        address: poi.address ? poi.address.freeformAddress : "",
        distance: poi.dist,
        classification: poi.poi ? poi.poi.classifications[0].code : undefined,
        position: poi.position,
        entryPoints: poi.entryPoints,
      };
      let marker = new SearchMarker(poiOpts, this._options);
      marker.addTo(this.map);
      this.markers[markerId] = marker;
    }, this);
  };

  SearchMarkersManager.prototype.clear = function () {
    for (let markerId in this.markers) {
      let marker = this.markers[markerId];
      marker.remove();
    }
    this.markers = {};
    this._lastClickedMarker = null;
  };

  function SearchMarker(poiData, options) {
    this.poiData = poiData;
    this.options = options || {};
    this.marker = new tt.Marker({
      element: this.createMarker(),
      anchor: "bottom",
    });
    let lon = this.poiData.position.lng || this.poiData.position.lon;
    this.marker.setLngLat([lon, this.poiData.position.lat]);
  }

  SearchMarker.prototype.addTo = function (map) {
    this.marker.addTo(map);
    this._map = map;
    return this;
  };

  SearchMarker.prototype.createMarker = function () {
    let elem = document.createElement("div");
    elem.className = "tt-icon-marker-black tt-search-marker";
    if (this.options.markerClassName) {
      elem.className += " " + this.options.markerClassName;
    }
    let innerElem = document.createElement("div");
    let imgElem = document.createElement("img");
    imgElem.src = "../assets/Desktop/Destination.png";
    imgElem.alt = "Market";
    imgElem.style.width = "30px"; // Ajusta el ancho según sea necesario
    imgElem.style.height = "45px"; // Ajusta la altura según sea necesario

    // Opcionalmente, puedes aplicar estilos adicionales a innerElem si es necesario
    innerElem.style.display = "flex";
    innerElem.style.justifyContent = "center";
    innerElem.style.alignItems = "center";
    innerElem.style.width = "50px"; // Asegúrate de que este sea suficiente para contener la imagen más cualquier borde o margen
    innerElem.style.height = "50px"; // Igual que arriba

    // Añade imgElem a innerElem
    innerElem.appendChild(imgElem);

    elem.appendChild(innerElem);
    return elem;
  };

  SearchMarker.prototype.remove = function () {
    const buttonsBox = document.querySelector(".buttons-box");
    this.marker.remove();
    this._map = null;

    removeLayer(["route", "second", "third"]);
    // hideButtonsVisibility();
    buttonsBox.classList.add("visually-hidden");
  };

  ttSearchBox.on("tomtom.searchbox.resultsfound", function (data) {
    console.log(data);
  });

  ttSearchBox.updateOptions({
    minNumberOfCharacters: 5,
    showSearchButton: false,
    labels: {
      //place holders: for the  search box text fields
      placeholder: "To Location",
    },
  });

  ttSearchBox.query();
}

tt.setProductInfo("trout-demo", "1.0");

if (navigator.geolocation) {
  // Getting user location
  navigator.geolocation.getCurrentPosition(
    (position) => {
      const lat = position.coords.latitude;
      const lon = position.coords.longitude;
      currentUserLocation = [lon, lat];

      // Center the map with the user
      map.setCenter([lon, lat]);
      waypoints.unshift([lon, lat]);

      // Crear un elemento HTML para el ícono del marcador
      const markerElement = document.createElement("div");
      //Current location marker

      markerElement.innerHTML =
        '<img src="../assets/Desktop/current-location.png" alt="Current Location" style="width: 5rem; height: 5rem;">';

      // Add a pin to the user
      let marker = new tt.Marker({ element: markerElement })
        .setLngLat([lon, lat])
        .addTo(map);
      showSearchBar(map);
    },

    function (error) {
      console.error("Location error:", error.message);
    }
  );
} else {
  console.error("No compatible geolocations found.");
}

function thirdRout() {
  removeLayer(["route", "second"]);
  tt.services
    .calculateRoute({
      key: tomtomAPIKeyForRoute,
      travelMode: "pedestrian",
      locations: waypoints,
    })
    .then((result) => {
      console.log(result);
      const summary = document.getElementById("summary-third");

      const lengthInMeters = result.routes[0].summary.lengthInMeters;
      const lengthInKilometers = (lengthInMeters / 1000).toFixed(2);
      const travelTimeInSeconds = result.routes[0].summary.travelTimeInSeconds;
      adjustedGlobalTime = Math.round(travelTimeInSeconds / 60);

      // summary.innerHTML = `Distance route 3: ${lengthInKilometers} kilometers. Time: ${adjustedGlobalTime} minutes`; // Mostrar distancia y tiempo en minutos

      summary.innerHTML = `
      <p class="summary-text">Route 3 - ${lengthInKilometers} km</p>
      <div class="summary-container">
        <img src="../assets/Desktop/Pedestrian-1.png" alt="Descripción" class="summary-image">
        <p class="summary-text">${adjustedGlobalTime} min</p>
      </div>
    `;

      console.log(
        `Longitud de la ruta: ${lengthInMeters} metros, Tiempo: ${adjustedGlobalTime} minutos`
      );

      const geojson = result.toGeoJson();
      if (map.getLayer("third")) {
        map.removeLayer("third");
        map.removeSource("third");
      }

      map.addLayer({
        id: "third",
        type: "line",
        source: {
          type: "geojson",
          data: geojson,
        },
        paint: {
          "line-color": "#88CBF3",
          "line-width": 10,
          "line-dasharray": [0.5, 0.3],
        },
      });
    });
}

function route() {
  removeLayer(["second", "third"]);

  tt.services
    .calculateRoute({
      key: tomtomAPIKeyForRoute,
      routeType: "shortest",
      locations: waypoints,
    })
    .then((result) => {
      console.log(result);
      const summary = document.getElementById("summary-route");

      const lengthInMeters = result.routes[0].summary.lengthInMeters;
      const lengthInKilometers = (lengthInMeters / 1000).toFixed(2);

      const increasedTime = adjustedGlobalTime * 1.09; // 2% More
      const adjustedTime = Math.round(increasedTime);

      // summary.innerHTML = `Route 1: ${lengthInKilometers} km ${adjustedTime} min`;
      summary.innerHTML = `
      <p class="summary-text">Route 1 - ${lengthInKilometers} km</p>
      <div class="summary-container">
      <img src="../assets/Desktop/Pedestrian-1.png" alt="Descripción" class="summary-image">
      <p class="summary-text">${adjustedTime} min</p>
      </div>
    `;

      const summaryRoute = document.getElementById("summary-route");
      console.log(
        `Longitud de la ruta: ${lengthInMeters} metros, Tiempo: ${adjustedGlobalTime} minutos`
      );

      const geojson = result.toGeoJson();
      if (map.getLayer("route")) {
        map.removeLayer("route");
        map.removeSource("route");
      }

      map.addLayer({
        id: "route",
        type: "line",
        source: {
          type: "geojson",
          data: geojson,
        },
        paint: {
          "line-color": "#0576BC",
          "line-width": 7,
        },
      });
    });
}

function secondRout() {
  removeLayer(["route", "third"]);

  tt.services
    .calculateRoute({
      key: tomtomAPIKeyForRoute,
      routeType: "fastest",
      locations: waypoints,
    })
    .then((result) => {
      console.log(result);
      const summary = document.getElementById("summary-second");

      const lengthInMeters = result.routes[0].summary.lengthInMeters;
      const lengthInKilometers = (lengthInMeters / 1000).toFixed(2);

      const increasedTime = adjustedGlobalTime * 1.04;
      const adjustedTime = Math.round(increasedTime);

      // summary.innerHTML = `Distance route 2: ${lengthInKilometers} kilometers. Time: ${adjustedTime} minutes`;
      // Show the time in minutes and hours for
      summary.innerHTML = `
  <p class="secondRout-text">Route 2 - ${lengthInKilometers} km</p>
  <div class="summary-container">
  <img src="../assets/Desktop/Pedestrian-1.png" alt="Descripción" class="secondRout-image">
  <p class="secondRout-text">${adjustedTime} min</p>
  </div>
`;

      console.log(
        `Longitud de la ruta: ${lengthInMeters} metros, Tiempo: ${adjustedGlobalTime} minutos`
      );

      const geojson = result.toGeoJson();
      if (map.getLayer("second")) {
        map.removeLayer("second");
        map.removeSource("second");
      }

      map.addLayer({
        id: "second",
        type: "line",
        source: {
          type: "geojson",
          data: geojson,
        },
        paint: {
          "line-color": "#49B5F7",
          "line-width": 6,
        },
      });
    });
}

// En map-functions.js, después de definir tus funciones y exportarlas
document.addEventListener("DOMContentLoaded", (event) => {
  document.querySelector("button#routeButton").addEventListener("click", route);
  document
    .querySelector("button#secondRoutButton")
    .addEventListener("click", secondRout);
  document
    .querySelector("button#thirdRoutButton")
    .addEventListener("click", thirdRout);
});

// CALCULATE DISTANCE BETWEEN PIONTS
function checkHazardsAndMark() {
  const userLocation = waypoints[0]; // Asumiendo que el primer punto es la ubicación del usuario.

  hazards.forEach((hazard) => {
    // Calcular la ruta desde la ubicación del usuario hasta el punto de peligro actual.
    tt.services
      .calculateRoute({
        key: tomtomAPIKeyForRoute,
        locations: [userLocation, hazard],
        routeType: "shortest",
      })
      .then((result) => {
        const lengthInMeters = result.routes[0].summary.lengthInMeters;
        if (lengthInMeters < 10000) {
          new tt.Marker().setLngLat(hazard).addTo(map);
        }
      })
      .catch((error) => {
        console.error("Error calculando la ruta:", error);
      });
  });
}

// Luego, invocas esta función después de obtener la ubicación del usuario.
if (navigator.geolocation) {
  navigator.geolocation.getCurrentPosition(
    (position) => {
      const lat = position.coords.latitude;
      const lon = position.coords.longitude;
      waypoints.unshift([lon, lat]); // Asegúrate de que la ubicación del usuario es el primer punto en waypoints.

      // Suponiendo que tienes tu mapa y tt inicializados correctamente.
      // new tt.Marker().setLngLat([lon, lat]).addTo(map);

      // Ahora comprueba los puntos de peligro.
      checkHazardsAndMark();
    },
    (error) => {
      console.error("Error al obtener la ubicación:", error.message);
    }
  );
} else {
  console.error("La geolocalización no es compatible con este navegador.");
}

function removeLayer(layerIds) {
  layerIds.forEach((layerId) => {
    if (map.getLayer(layerId)) {
      map.removeLayer(layerId);
      map.removeSource(layerId);
    }
  });
}

markReportedLocation();

document.addEventListener("DOMContentLoaded", function () {
  const thirdRoutButton = document.getElementById("thirdRoutButton");

  if (thirdRoutButton) {
    thirdRoutButton.addEventListener("click", function () {
      thirdRout();
    });
  }
});
