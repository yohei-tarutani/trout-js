'use strict';

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, doc, setDoc, GeoPoint } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-storage.js";

const firebaseConfig = {
  apiKey: "AIzaSyBmqeNfsTjrBZ3AP-Y6NWNOSGZORv_iqNc",
  authDomain: "user-login-test-fd82b.firebaseapp.com",
  databaseURL: "https://user-login-test-fd82b-default-rtdb.firebaseio.com",
  projectId: "user-login-test-fd82b",
  storageBucket: "user-login-test-fd82b.appspot.com",
  messagingSenderId: "332223181733",
  appId: "1:332223181733:web:e915de4da4c67354952e4c"
};

const tomtomAPIKey = 'TCvfICtkEZ7J69BTxMdmAepdI8sVgoNP';

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
  tomtomAPIKey
};