import {DataTable,StatusBadge} from './ui';
import {formatDate,formatTime} from '../utils/domain';
export default function InspectionTable({records,recipes,onSelect}){return <DataTable rows={records} onSelect={onSelect} columns={[
  {key:'id',label:'Inspección',render:i=><span className="record-id">{i.id}</span>},
  {key:'date',label:'Fecha / hora',render:i=><span className="table-date">{formatTime(i.date)}<small>{formatDate(i.date)}</small></span>},
  {key:'recipe',label:'Receta',render:i=><span>{recipes.find(r=>r.id===i.recipeId)?.name||'Sin receta'}<small className="cell-subtitle">{i.lotId} · {i.batchId}</small></span>},
  {key:'angle',label:'Ángulo',render:i=><span className="angle-cell">{i.angle.toFixed(2)}°</span>},
  {key:'status',label:'Resultado',render:i=><StatusBadge status={i.status}/>},
]}/>;}
