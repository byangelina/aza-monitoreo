import {createContext,useContext,useEffect,useRef,useState,useCallback} from 'react';
import {dataService} from '../services/dataService';
import {useAuth} from './AuthContext';
const DataContext=createContext(null);
export function DataProvider({children}) {
  const {user}=useAuth();
  const [data,setData]=useState(null),[loading,setLoading]=useState(true),[error,setError]=useState(''),[lastUpdated,setLastUpdated]=useState(null);
  const generation=useRef(0),pending=useRef(null),sequence=useRef(0);
  const reload=useCallback(async(quiet=false)=>{
    if(!user)return;
    const gen=generation.current;
    if(pending.current?.gen===gen)return pending.current.promise;
    const seq=++sequence.current;
    if(!quiet)setLoading(true);
    const promise=(async()=>{try{const next=await dataService.load(user);if(gen===generation.current&&seq===sequence.current){setData(next);setError('');setLastUpdated(Date.now());}}
    catch(e){if(gen===generation.current&&seq===sequence.current)setError(e.message||'No pudimos cargar los datos.');}
    finally{if(gen===generation.current){setLoading(false);if(pending.current?.seq===seq)pending.current=null;}}})();
    pending.current={gen,seq,promise};return promise;
  },[user]);
  useEffect(()=>{
    generation.current++;pending.current=null;setData(null);setLastUpdated(null);setError('');setLoading(true);
    if(!user)return;
    reload();const timer=setInterval(()=>reload(true),5000);
    return()=>{generation.current++;clearInterval(timer);};
  },[user,reload]);
  async function mutate(method,args){const gen=generation.current;const seq=++sequence.current;const next=await dataService[method](...args);if(gen===generation.current&&seq===sequence.current){setData(next);setError('');setLastUpdated(Date.now());}}
  return <DataContext.Provider value={{data,loading,error,reload,lastUpdated,addObservation:(...args)=>mutate('addObservation',args),recognizeAlarm:(...args)=>mutate('recognizeAlarm',args)}}>{children}</DataContext.Provider>;
}
export const useData=()=>useContext(DataContext);
