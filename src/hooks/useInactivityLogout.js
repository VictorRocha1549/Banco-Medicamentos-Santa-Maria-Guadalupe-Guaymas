// src/hooks/useInactivityLogout.js
import { useEffect, useRef } from 'react';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';

const INACTIVITY_LIMIT_MS = 30 * 60 * 1000; // 30 minutos de inactividad

export function useInactivityLogout() {
  const timeoutRef = useRef(null);

  const resetTimer = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      signOut(auth).then(() => {
        // Opcional: redirigir al login si es necesario
        window.location.href = '/login';
      });
    }, INACTIVITY_LIMIT_MS);
  };

  useEffect(() => {
    // Eventos que consideramos actividad del usuario
    const eventos = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];
    eventos.forEach((evento) => window.addEventListener(evento, resetTimer));

    resetTimer(); // Inicia el temporizador al montar

    return () => {
      clearTimeout(timeoutRef.current);
      eventos.forEach((evento) => window.removeEventListener(evento, resetTimer));
    };
  }, []);
}