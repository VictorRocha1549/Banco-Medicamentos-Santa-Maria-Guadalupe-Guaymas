import { initializeApp } from "firebase/app";
import { getAuth, setPersistence, browserSessionPersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';


// Traemos las llaves desde el archivo seguro oculto
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Inicializamos la aplicación
const app = initializeApp(firebaseConfig);

// Inicializamos la Base de Datos y la exportamos para usarla en el catálogo
export const db = getFirestore(app);
export const auth = getAuth(app);


// Configurar persistencia de sesión en sessionStorage (se borra al cerrar pestaña)
setPersistence(auth, browserSessionPersistence)
  .catch((error) => {
    console.error('Error al configurar persistencia de sesión:', error);
  });