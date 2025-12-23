// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyChMOYURjHNB1Wh8L-hIzYUaph0F6CdeAE",
  authDomain: "english-vocabulary-fb865.firebaseapp.com",
  projectId: "english-vocabulary-fb865",
  storageBucket: "english-vocabulary-fb865.firebasestorage.app",
  messagingSenderId: "879484795972",
  appId: "1:879484795972:web:0ba2168cf37b0cf7de5011",
  measurementId: "G-XXYJM237TV"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);
export const db = getFirestore(app);
