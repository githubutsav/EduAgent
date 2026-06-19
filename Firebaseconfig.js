// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyD0MUUmVMJuKdbR8nte08UWazPC833mvwA",
  authDomain: "edutech-2cfe9.firebaseapp.com",
  projectId: "edutech-2cfe9",
  storageBucket: "edutech-2cfe9.firebasestorage.app",
  messagingSenderId: "619549715412",
  appId: "1:619549715412:web:0fa2459633c88ff6440441",
  measurementId: "G-QBZ0195R4Q"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);