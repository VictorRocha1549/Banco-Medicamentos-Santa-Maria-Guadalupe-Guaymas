import { useInactivityLogout } from '../hooks/useInactivityLogout';

export function SessionManager({ children }) {
  useInactivityLogout();
  return children;
}