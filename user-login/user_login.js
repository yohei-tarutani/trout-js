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
const db = getFirestore(app)
const auth = getAuth(app);
// const auth2 = getAuth();


// firestore data collection ref
const colRef = collection(db, 'Users');

// get button DOM elements
const login = document.getElementById('login');
const signup = document.getElementById('signup');


// login (Users)
login.addEventListener('click', function () {

  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      sessionStorage.setItem("userId", userCredential.user.uid);
      window.location.href = "../index.html";
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      alert(errorCode, errorMessage);
    });
})


// // sign up (Users)
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
//           alert('User created!');
//         })
//         .catch((error) => {
//           const errorCode = error.code;
//           const errorMessage = error.message;
//           alert(errorCode, errorMessage);
//         });
//     })
//     .catch((error) => {
//       const errorCode = error.code;
//       const errorMessage = error.message;
//       alert(errorCode, errorMessage);
//     });
// });


// // Authenticate Using Google

// // Create an instance of the Google provider object:
// const providerG = new GoogleAuthProvider();

// // To sign in with a pop-up window, call signInWithPopup:
// signInWithPopup(auth2, providerG)
//   .then((result) => {
//     // This gives you a Google Access Token. You can use it to access the Google API.
//     const credential = GoogleAuthProvider.credentialFromResult(result);
//     const token = credential.accessToken;
//     // The signed-in user info.
//     const user = result.user;
//     // IdP data available using getAdditionalUserInfo(result)
//     // ...
//   }).catch((error) => {
//     // Handle Errors here.
//     const errorCode = error.code;
//     const errorMessage = error.message;
//     // The email of the user's account used.
//     const email = error.customData.email;
//     // The AuthCredential type that was used.
//     const credential = GoogleAuthProvider.credentialFromError(error);
//     // ...
//   });


// // Authenticate Using Facebook

// // Create an instance of the Facebook provider object
// const providerF = new FacebookAuthProvider();

// // To sign in with a pop-up window, call signInWithPopup:
// signInWithPopup(auth2, providerF)
//   .then((result) => {
//     // The signed-in user info.
//     const user = result.user;

//     // This gives you a Facebook Access Token. You can use it to access the Facebook API.
//     const credential = FacebookAuthProvider.credentialFromResult(result);
//     const accessToken = credential.accessToken;

//     // IdP data available using getAdditionalUserInfo(result)
//     // ...
//   })
//   .catch((error) => {
//     // Handle Errors here.
//     const errorCode = error.code;
//     const errorMessage = error.message;
//     // The email of the user's account used.
//     const email = error.customData.email;
//     // The AuthCredential type that was used.
//     const credential = FacebookAuthProvider.credentialFromError(error);

//     // ...
//   });


// // Authenticate Using Apple

// // Create an instance of the Facebook provider object
// const providerA = new OAuthProvider('apple.com');

// // To sign in with a pop-up window, call signInWithPopup:
// signInWithPopup(auth2, providerA)
//   .then((result) => {
//     // The signed-in user info.
//     const user = result.user;

//     // Apple credential
//     const credential = OAuthProvider.credentialFromResult(result);
//     const accessToken = credential.accessToken;
//     const idToken = credential.idToken;

//     // IdP data available using getAdditionalUserInfo(result)
//     // ...
//   })
//   .catch((error) => {
//     // Handle Errors here.
//     const errorCode = error.code;
//     const errorMessage = error.message;
//     // The email of the user's account used.
//     const email = error.customData.email;
//     // The credential that was used.
//     const credential = OAuthProvider.credentialFromError(error);

//     // ...
//   });


