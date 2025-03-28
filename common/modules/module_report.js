"use strict";

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import {
  getFirestore,
  doc,
  setDoc,
  GeoPoint,
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-storage.js";

import { firebaseConfig, tomtomAPIKey } from "../../config.js";

export {
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
  tomtomAPIKey,
};
