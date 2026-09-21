import test from 'node:test';
import assert from 'node:assert/strict';
import {metrics,filterInspections,passwordError,recentInspections} from '../src/utils/domain.js';
const records=[
  {id:'A',date:'2026-09-13T01:00:00Z',status:'Aprobado',angle:999,recipeId:'R1',lotId:'L1'},
  {id:'B',date:'2026-09-13T13:00:00Z',status:'Rechazado',angle:277,recipeId:'R1',lotId:'L1'},
  {id:'C',date:'2026-09-13T14:00:00Z',status:'Sin receta',angle:275,recipeId:null,lotId:'L2'},
];
test('Los resultados se contabilizan por estado recibido, sin clasificar el ángulo',()=>{const {rate,...counts}=metrics(records);assert.deepEqual(counts,{total:3,approved:1,rejected:1,noRecipe:1});assert.ok(Math.abs(rate-100/3)<1e-10);});
test('Los KPI no duplican IDs y tratan correctamente un conjunto vacío',()=>{assert.equal(metrics([...records,records[0]]).total,3);assert.equal(metrics([]).rate,null);});
test('Filtros combinados respetan el día de Santiago y las relaciones',()=>{assert.deepEqual(filterInspections(records,{from:'2026-09-13',to:'2026-09-13',recipe:'R1',lot:'L1'}).map(i=>i.id),['B']);assert.equal(filterInspections(records,{recipe:'R1',lot:'L2'}).length,0);});
test('Ventana operativa excluye registros anteriores a ocho horas',()=>{assert.deepEqual(recentInspections(records).map(i=>i.id),['C','B']);assert.deepEqual(recentInspections([]),[]);});
test('Cambio de contraseña valida política y coincidencia (la comparación con la anterior la hace el backend)',()=>{assert.ok(passwordError('abc','abc'));assert.ok(passwordError('Demo2026A','Demo2026B'));assert.equal(passwordError('Nueva2026A','Nueva2026A'),'');});
