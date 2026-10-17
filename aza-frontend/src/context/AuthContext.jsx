import { createContext, useContext, useEffect, useState } from 'react';
import { api, getToken, setToken, clearToken } from '../services/api';

const AuthContext = createContext(null);

function toAppUser(apiUser) {
  if (!apiUser) return null;
  const initials = apiUser.nombre.split(' ').filter(Boolean).slice(0, 2).map((p) => p[0]).join('').toUpperCase();
  return {
    id: apiUser.id,
    name: apiUser.nombre,
    email: apiUser.correo,
    role: apiUser.rol,
    initials,
    mustChange: !!apiUser.debeCambiarPassword,
  };
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);

  // Si cualquier llamada a la API devuelve 401 (token expirado o revocado), se cierra
  // la sesión localmente: RoleGuard redirige a /login en el siguiente render.
  useEffect(() => {
    const onUnauthorized = () => setUser(null);
    window.addEventListener('aza:unauthorized', onUnauthorized);
    const onStorage=e=>{if(e.key==='aza-token'){if(!e.newValue)setUser(null);else api.get('/auth/me').then(({data})=>setUser(toAppUser(data.user))).catch(()=>setUser(null));}};
    window.addEventListener('storage',onStorage);
    return () => {window.removeEventListener('aza:unauthorized', onUnauthorized);window.removeEventListener('storage',onStorage);};
  }, []);

  useEffect(() => {
    (async () => {
      if (getToken()) {
        try {
          const { data } = await api.get('/auth/me');
          setUser(toAppUser(data.user));
        } catch {
          clearToken();
        }
      }
      setInitializing(false);
    })();
  }, []);

  useEffect(()=>{
    if(!user)return;
    let lastActivity=Date.now();
    const touch=()=>{lastActivity=Date.now();};
    const events=['pointerdown','keydown','touchstart'];events.forEach(event=>window.addEventListener(event,touch,{passive:true}));
    const timeout=Math.max(1,Number(import.meta.env.VITE_IDLE_MINUTES)||30)*60000;
    const timer=setInterval(()=>{if(Date.now()-lastActivity>=timeout)logout();},10000);
    return()=>{clearInterval(timer);events.forEach(event=>window.removeEventListener(event,touch));};
  },[user?.id]);

  async function login(correo, password) {
    const { data } = await api.post('/auth/login', { correo, password });
    setToken(data.token);
    const account = toAppUser(data.user);
    setUser(account);
    return account;
  }

  async function logout() {
    try { await api.post('/auth/logout'); } catch { /* best-effort: igual se limpia localmente */ }
    clearToken();
    setUser(null);
  }

  async function recuperar(correo) {
    const { data } = await api.post('/auth/recuperar', { correo });
    return data; // { message, previewUrl? }
  }

  async function restablecer(token, password) {
    const { data } = await api.post('/auth/restablecer', { token, password });
    return data;
  }

  async function changePassword(passwordActual, passwordNueva) {
    const {data}=await api.post('/auth/cambiar-password', { passwordActual, passwordNueva });
    if(data.token)setToken(data.token);
    setUser((prev) => (prev ? { ...prev, mustChange: false } : prev));
  }

  return (
    <AuthContext.Provider value={{ user, initializing, login, logout, recuperar, restablecer, changePassword }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
