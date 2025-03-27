'use strict';

// Import modules from module.js
import {
  initializeApp,
  getAuth,
  createUserWithEmailAndPassword,
  getFirestore,
  collection,
  doc,
  setDoc,
  firebaseConfig
} from '../common/modules/module.js';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app)
const auth = getAuth(app);
// const database = getDatabase(app);

// firestore data collection ref
const colRef = collection(db, 'Users');

// get button DOM elements
const login = document.getElementById('login');
const signup = document.getElementById('signup');

// sign up (Users)
signup.addEventListener('click', function () {

  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  // authenticate with email & password
  createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {

      // create unique id from userCredential
      const uniqueId = userCredential.user.uid;
      console.log(userCredential);

      // Specify the document ID as the unique ID
      const docRef = doc(colRef, uniqueId);

      // Add new document with the specified document ID
      setDoc(docRef, {
        email: email,
        uniqueId: uniqueId,
      })
        .then(() => {
          alert('User created!');
        })
        .catch((error) => {
          const errorCode = error.code;
          const errorMessage = error.message;
          alert(errorCode, errorMessage);
        });
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      alert(errorCode, errorMessage);
    });
});



// login (Users)
// login.addEventListener('click', function () {

//   const email = document.getElementById('email').value;
//   const password = document.getElementById('password').value;

//   signInWithEmailAndPassword(auth, email, password)
//     .then((userCredential) => {
//       sessionStorage.setItem("userId", userCredential.user.uid);
//       window.location.href = "../user-myreports/myreports.html";
//     })
//     .catch((error) => {
//       const errorCode = error.code;
//       const errorMessage = error.message;
//       alert(errorCode, errorMessage);
//     });
// })




