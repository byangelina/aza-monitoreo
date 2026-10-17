import {useEffect,useState} from 'react';
import {Link} from 'react-router-dom';
import {CheckCircle2,XCircle,MinusCircle,Maximize2,ArrowLeft,Bell,ImageOff,Expand} from 'lucide-react';
import {useData} from '../context/DataContext';
import {Button,LoadingState,ErrorState,EmptyState,Modal,PageTitle} from '../components/ui';
import InspectionTable from '../components/InspectionTable';
import InspectionDetail from '../components/InspectionDetail';
import {recentInspections,formatTime,formatDate} from '../utils/domain';
import '../operator.css';
function Picture({url,title,onExpand}) {
  const [failed,setFailed]=useState(false);
  useEffect(()=>setFailed(false),[url]);
  return <section className="op-picture"><div className="op-picture-heading"><h2>{title}</h2>{url&&!failed&&<button onClick={()=>onExpand({url,title})} aria-label={`Ampliar ${title}`}><Expand size={20}/></button>}</div>{url&&!failed?<img src={url} alt={title} onError={()=>setFailed(true)}/>:<div className="op-no-image"><ImageOff size={44}/><strong>{failed?'Imagen no disponible':'Esperando imagen'}</strong><span>{failed?'No se pudo cargar la imagen de esta inspección.':'El sistema de captura aún no envió esta imagen.'}</span></div>}</section>;
}
export default function Operator({recentOnly=false,room=false}) {
  const {data,loading,error,reload,lastUpdated}=useData();
  const [selected,setSelected]=useState(null),[expanded,setExpanded]=useState(null),[notice,setNotice]=useState(''),[now,setNow]=useState(Date.now());
  const [validation,setValidation]=useState(()=>{try{return localStorage.getItem('aza-validation')!=='false';}catch{return true;}});
  useEffect(()=>{const timer=setInterval(()=>setNow(Date.now()),1000);return()=>clearInterval(timer);},[]);
  useEffect(()=>{try{localStorage.setItem('aza-validation',String(validation));}catch{}},[validation]);
  async function fullscreen(){try{if(document.fullscreenElement)await document.exitFullscreen();else await document.documentElement.requestFullscreen();}catch{setNotice('Usa F11 para ampliar la pantalla en este navegador.');}}
  if(loading&&!data)return <LoadingState/>;
  if(!data)return <ErrorState message={error||'Sin datos disponibles'} onRetry={()=>reload()}/>;
  const recent=recentInspections(data.inspections),latest=recent[0],active=data.alarms.filter(a=>a.status==='Activa').length;
  const recipe=data.recipes.find(r=>r.id===latest?.recipeId);
  const tone=latest?.status==='Aprobado'?'approved':latest?.status==='Rechazado'?'rejected':'neutral';
  const Icon=tone==='approved'?CheckCircle2:tone==='rejected'?XCircle:MinusCircle;
  const stale=!!error||!lastUpdated||now-lastUpdated>15000;
  const minutes=latest?Math.max(0,Math.floor((now-new Date(latest.date))/60000)):0;
  const age=minutes<1?'Hace menos de 1 min':minutes<60?`Hace ${minutes} min`:minutes<1440?`Hace ${Math.floor(minutes/60)} h`:`Hace ${Math.floor(minutes/1440)} días`;
  return <>{recentOnly?<><PageTitle eyebrow="VENTANA OPERATIVA" title="Inspecciones recientes" description="Ocho horas respecto del último registro recibido."/>{error&&<ErrorState message={error} onRetry={()=>reload()}/>}<section className="card"><InspectionTable records={recent} recipes={data.recipes} onSelect={i=>setSelected(i.id)}/></section></>:<div className={`operator-console ${room?'is-room':''} tone-${tone}`}>
    <header className="op-toolbar"><div><span className="op-brand">AZA / OPERACIÓN</span><h1>{room?'Monitor de sala':'Control de trefilado'}</h1></div><div className="op-actions">{room?<Link to="/operador"><ArrowLeft size={20}/>Escritorio</Link>:<Link to="/operador/sala"><Maximize2 size={20}/>Modo sala</Link>}{room&&<button onClick={fullscreen}><Maximize2 size={20}/>Pantalla completa</button>}<Link to="/operador/alarmas"><Bell size={20}/>Alarmas <b>{active}</b></Link></div></header>
    <div className={`op-connection ${stale?'is-stale':''}`} role="status"><span className="op-dot"/><strong>{stale?'SIN ACTUALIZACIÓN CONFIRMADA':'API conectada'}</strong><span>{lastUpdated?`Última consulta ${formatTime(lastUpdated)}`:'Esperando respuesta'} · cada 5 s</span>{stale&&<button onClick={()=>reload(true)}>Reintentar</button>}</div>
    {notice&&<p role="status">{notice}</p>}
    {latest?<><section className="op-result" aria-label="Último resultado"><div className="op-angle"><span>ÁNGULO REGISTRADO</span><strong>{Number(latest.angle).toFixed(2)}<small>°</small></strong><p>{latest.min==null||latest.max==null?'Sin límites de receta':`Límites: ${Number(latest.min).toFixed(2)}° — ${Number(latest.max).toFixed(2)}°`}</p></div><div className="op-verdict"><span>RESULTADO RECIBIDO</span><strong><Icon/>{latest.status}</strong><p>{formatDate(latest.date)} · {formatTime(latest.date)}</p><b className={minutes>=5?'op-old':''}>{age}{minutes>=5?' · Revisar antigüedad del resultado':''}</b></div></section>
    <div className="op-context"><span><small>INSPECCIÓN</small><b>{latest.id}</b></span><span><small>RECETA</small><b>{recipe?.name||'Sin receta'}</b></span><span><small>LOTE</small><b>{latest.lotId||'Sin asignar'}</b></span><span><small>BATCH</small><b>{latest.batchId||'Sin asignar'}</b></span></div>
    <div className="op-image-controls"><span>{validation?'Validación visual · comparación de la misma inspección':'Vista de análisis'}</span><label><input type="checkbox" checked={validation} onChange={e=>setValidation(e.target.checked)}/>Mostrar captura real</label></div>
    <div className={`op-images ${validation?'':'single'}`}><Picture url={latest.analysisImage} title="Imagen analizada" onExpand={setExpanded}/>{validation&&<Picture url={latest.captureImage} title="Captura real" onExpand={setExpanded}/>}</div>
    <footer className="op-footer"><span>Resultado informado por el sistema de captura.</span><div><Link to="/operador/recientes">Inspecciones recientes</Link><button onClick={()=>setSelected(latest.id)}>Detalle y observaciones</button></div></footer></>:<EmptyState title="Esperando la primera inspección" description="Los resultados aparecerán cuando el sistema de captura los envíe."/>}
  </div>}<InspectionDetail key={selected||'closed'} inspectionId={selected} onClose={()=>setSelected(null)}/><Modal open={!!expanded} onClose={()=>setExpanded(null)} title={expanded?.title||'Imagen'} wide>{expanded&&<img className="op-expanded" src={expanded.url} alt={expanded.title}/>}</Modal></>;
}
