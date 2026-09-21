import {createContext,useContext,useEffect,useState,useCallback} from 'react';
import {dataService} from '../services/dataService';
import {useAuth} from './AuthContext';
const DataContext=createContext(null);
export function DataProvider({children}) {
  const {user}=useAuth();
  const [data,setData]=useState(null),[loading,setLoading]=useState(true),[error,setError]=useState('');
  const reload=useCallback(async(quiet=false)=>{
    if(!user) return;
    if(!quiet)setLoading(true);
    try{setData(await dataService.load(user));setError('');}
    catch(e){setError(e.message||'No pudimos cargar los datos del servidor. Inténtalo nuevamente.');}
    finally{setLoading(false);}
  },[user]);
  useEffect(()=>{
    if(!user){setData(null);setLoading(true);return;}
    reload();
    const id=setInterval(()=>reload(true),5000);
    return()=>clearInterval(id);
  },[user,reload]);
  return <DataContext.Provider value={{data,loading,error,reload,addObservation:async(...args)=>setData(await dataService.addObservation(...args)),recognizeAlarm:async(...args)=>setData(await dataService.recognizeAlarm(...args))}}>{children}</DataContext.Provider>;
}
export const useData=()=>useContext(DataContext);
