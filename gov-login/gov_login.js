'use strict';

// Import modules from module.js
import {
  initializeApp,
  getAuth,
  signInWithEmailAndPassword,
  getFirestore,
  collection,
  firebaseConfig
} from '../common/modules/module.js';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// firestore data collection ref
const colRef = collection(db, 'Gov admin users');

// get button DOM elements
const login = document.getElementById('login');
const signup = document.getElementById('signup');


// login (gov user)
login.addEventListener('click', function () {

  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {

      sessionStorage.setItem("userId", userCredential.user.uid);
      // window.location.href = "../gov_interface.html";
      window.location.href = "../gov-dashboard/gov_dashboard.html";
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      alert(errorCode, errorMessage);
    });

});


// // sign up (gov user)
// signup.addEventListener('click', function () {

//   const email = document.getElementById('email').value;
//   const password = document.getElementById('password').value;

//   // authenticate with email & password
//   createUserWithEmailAndPassword(auth, email, password)
//     .then((userCredential) => {

//       // create unique id from userCredential
//       const uniqueId = userCredential.user.uid;
//       console.log(userCredential);

//       // Specify the document ID as the unique ID
//       const docRef = doc(colRef, uniqueId);

//       // Add new document with the specified document ID
//       setDoc(docRef, {
//         email: email,
//         uniqueId: uniqueId,
//       })
//         .then(() => {
//           alert('Gov user created!');
//         })
//         .catch((error) => {
//           const errorCode = error.code;
//           const errorMessage = error.message;
//           alert(errorCode, errorMessage);
//         });
//     })
// })



