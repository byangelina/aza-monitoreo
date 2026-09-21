import {useState} from 'react';
import {Bell,ArrowUpRight,Check} from 'lucide-react';
import {useData} from '../context/DataContext';
import {useAuth} from '../context/AuthContext';
import {formatTime,formatDate} from '../utils/domain';
import {AlarmBadge,Button,EmptyState,ConfirmationDialog,ErrorState} from './ui';
export default function AlarmPanel({alarms,onSelect,compact=false}) {
  const {recognizeAlarm}=useData();const {user}=useAuth();const [pending,setPending]=useState(null),[busy,setBusy]=useState(false),[error,setError]=useState('');
  async function confirm(){setBusy(true);setError('');try{await recognizeAlarm(pending.id,user);setPending(null);}catch(e){setError(e.message);}finally{setBusy(false);}}
  return <><div className={`alarm-list ${compact?'compact':''}`}>{alarms.length?alarms.map(alarm=><article className="alarm-item" key={alarm.id}><div className="alarm-item-top"><span className="alarm-symbol"><Bell size={16}/></span><AlarmBadge status={alarm.status}/><time>{formatTime(alarm.date)}</time></div><h3>{alarm.title}</h3><p>{alarm.description}</p><span className="alarm-reference">{alarm.inspectionId} · {formatDate(alarm.date)}</span><div className="alarm-item-actions"><button className="text-button" onClick={()=>onSelect(alarm.inspectionId)}>Ver inspección<ArrowUpRight size={14}/></button>{alarm.status==='Activa'&&<Button variant="secondary" onClick={()=>setPending(alarm)}><Check size={14}/>Reconocer</Button>}{alarm.status==='Reconocida'&&<small>Reconocimiento registrado</small>}</div></article>):<EmptyState title="Sin alarmas activas" description="No hay eventos por reconocer en la demostración."/>}</div>{error&&<ErrorState message={error}/>}<ConfirmationDialog open={!!pending} title="Reconocer alarma" description={`Quedará registrado que ${user.name} revisó ${pending?.id || 'la alarma'}. El resultado de la inspección no cambiará.`} onClose={()=>{if(!busy)setPending(null);}} onConfirm={confirm} busy={busy}/></>;
}
