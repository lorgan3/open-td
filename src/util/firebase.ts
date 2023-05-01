import { initializeApp } from "firebase/app";
import { getAnalytics, logEvent as log } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCUua4XIvRX14AI5zAQe1OynmeSxe57f0A",
  authDomain: "open-td-ac8be.firebaseapp.com",
  projectId: "open-td-ac8be",
  storageBucket: "open-td-ac8be.appspot.com",
  messagingSenderId: "351731826193",
  appId: "1:351731826193:web:072686940fc4909b337bb0",
  measurementId: "G-D9LVZGMF6F",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export const logEvent = (
  eventName: string,
  eventParams?: { [key: string]: any }
) => {
  log(analytics, eventName, eventParams);
};
