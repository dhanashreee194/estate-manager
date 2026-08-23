import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";

// const firebaseConfig = {
//   apiKey: "YOUR_API_KEY",
//   authDomain: "YOUR_AUTH_DOMAIN",
//   projectId: "YOUR_PROJECT_ID",
//   storageBucket: "YOUR_STORAGE_BUCKET",
//   messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
//   appId: "YOUR_APP_ID",
// };
const firebaseConfig = {
  apiKey: "AIzaSyA2fS5ha2vLbkK7FzrVrULXAt0zwyZgme0",
  authDomain: "raut-estate.firebaseapp.com",
  projectId: "raut-estate",
  storageBucket: "raut-estate.firebasestorage.app",
  messagingSenderId: "932737375942",
  appId: "1:932737375942:web:aa38f5c9e6645b681401c7",
  measurementId: "G-7G3V9ZFLCY",
};

const app = initializeApp(firebaseConfig);

export const storage = getStorage(app);
