import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js'

// If you enabled Analytics in your project, add the Firebase SDK for Google Analytics
import { getAnalytics } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-analytics.js'

// Add Firebase products that you want to use
import { getAuth } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js'
import { getFirestore } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js'
// import firebase from "firebase/compat/app";
// // Required for side-effects
// import "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyAFURL-3e0iEEl1CQjLF_LK0ZUBtPk_x0Q",
    authDomain: "tik-tac-toe-firebase.firebaseapp.com",
    projectId: "tik-tac-toe-firebase",
    storageBucket: "tik-tac-toe-firebase.appspot.com",
    messagingSenderId: "852928793391",
    appId: "1:852928793391:web:cef9c232ef77f991cdafda",
    measurementId: "G-4MHB0P9S38"
};

// // Initialize Firebase
// const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);
// const firestore = getFirestore(app);
const app = firebase.initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);
// Initialize Cloud Firestore and get a reference to the service
const db = firebase.firestore();
window.app = app;
// window.analytics = analytics;
window.db = db;
// firebase.initializeApp(firebaseConfig);


// Initialize Cloud Firestore and get a reference to the service
// var db = firebase.firestore();
// const db = firestore;