'use strict';

// Import the functions you need from the SDKs you need
import {
  initializeApp
} from "https://www.gstatic.com/firebasejs/10.7.2/firebase-app.js";

import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/10.7.2/firebase-auth.js";

import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDocs,
  updateDoc,
  query,
  where
} from "https://www.gstatic.com/firebasejs/10.7.2/firebase-firestore.js";


// web app's Firebase configuration
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

const tomtomAPIKeyForRoute = 'BFXDtwtvMM8EO3RThe25uCDj4UkbdeyU';

export {
  initializeApp,
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  getFirestore,
  collection,
  doc,
  setDoc,
  getDocs,
  updateDoc,
  query,
  where,
  firebaseConfig,
  tomtomAPIKey,
  tomtomAPIKeyForRoute
};