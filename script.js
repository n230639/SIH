let pendingAction=null;
let currentStation='ALPHA-10';
let searchTimer=null;

const stationData={
 "ALPHA-10":{name:"Station ALPHA-10",region:"Northern Ridge",lat:"41.8781° N",lon:"87.6298° W",alt:"181m MSL",temp:24.1,humidity:58,wind:14.2,health:98,predicted:24.4,status:"Stable",pressure:1013.2,rain:.2,latency:14,integrity:99.98,edge:18.4,storage:84,compute:62,insight:"No significant anomaly detected. AI confidence 0.96.",trend:[42,48,45,52,58,55,61,57,64,60,66],neighbors:["BETA-07","GAMMA-03","DELTA-09"],alerts:2,positions:[
{name:"North Ridge",type:"Monitoring Point",distance:"8.4 km",bearing:"N"},
{name:"East Relay",type:"Edge Relay",distance:"12.1 km",bearing:"E"},
{name:"Valley Sensor",type:"Sensor Cluster",distance:"15.7 km",bearing:"SE"},
{name:"West Gateway",type:"Gateway",distance:"19.3 km",bearing:"W"}]},
 "BETA-07":{name:"Station BETA-07",region:"Central Plains",lat:"39.7392° N",lon:"104.9903° W",alt:"1609m MSL",temp:23.9,humidity:61,wind:18.8,health:94,predicted:24.2,status:"Stable",pressure:1008.7,rain:.0,latency:19,integrity:99.94,edge:22.1,storage:71,compute:57,insight:"Telemetry is consistent with neighboring nodes. AI confidence 0.93.",trend:[55,53,59,57,62,60,65,63,68,66,70],neighbors:["ALPHA-10","GAMMA-03"],alerts:1,positions:[
{name:"Central Relay",type:"Edge Relay",distance:"6.2 km",bearing:"NE"},
{name:"Plains Sensor",type:"Sensor Cluster",distance:"10.8 km",bearing:"E"},
{name:"South Checkpoint",type:"Monitoring Point",distance:"14.5 km",bearing:"S"},
{name:"West Gateway",type:"Gateway",distance:"18.0 km",bearing:"W"}]},
 "GAMMA-03":{name:"Station GAMMA-03",region:"Coastal Ridge",lat:"47.6062° N",lon:"122.3321° W",alt:"72m MSL",temp:22.9,humidity:67,wind:11.6,health:91,predicted:23.3,status:"Stable",pressure:1016.4,rain:1.4,latency:16,integrity:99.91,edge:17.6,storage:66,compute:49,insight:"Minor humidity drift detected; no correction required. AI confidence 0.89.",trend:[60,58,61,59,64,62,66,65,69,67,71],neighbors:["ALPHA-10","BETA-07"],alerts:1,positions:[
{name:"Coastal Relay",type:"Edge Relay",distance:"5.9 km",bearing:"NW"},
{name:"Harbor Sensor",type:"Sensor Cluster",distance:"9.7 km",bearing:"SW"},
{name:"North Watch",type:"Monitoring Point",distance:"13.2 km",bearing:"N"},
{name:"East Gateway",type:"Gateway",distance:"17.6 km",bearing:"E"}]},
 "DELTA-09":{name:"Station DELTA-09",region:"Eastern Sector",lat:"25.7617° N",lon:"80.1918° W",alt:"3m MSL",temp:28.6,humidity:76,wind:22.4,health:73,predicted:27.9,status:"Warning",pressure:1004.9,rain:2.7,latency:31,integrity:98.7,edge:34.5,storage:89,compute:78,insight:"Temperature deviation detected. AI recommends calibration with 0.84 confidence.",trend:[50,54,58,63,72,68,77,81,75,84,88],neighbors:["PHI-OBSERVATORY","BETA-07"],alerts:5,positions:[
{name:"East Sector Relay",type:"Edge Relay",distance:"4.8 km",bearing:"E"},
{name:"Coastal Sensor",type:"Sensor Cluster",distance:"7.5 km",bearing:"SE"},
{name:"South Watch",type:"Monitoring Point",distance:"11.4 km",bearing:"S"},
{name:"Regional Gateway",type:"Gateway",distance:"16.8 km",bearing:"NW"}]},
 "PHI-OBSERVATORY":{name:"Station PHI-OBSERVATORY",region:"Critical Observatory",lat:"34.0522° N",lon:"118.2437° W",alt:"89m MSL",temp:31.2,humidity:42,wind:26.7,health:64,predicted:25.8,status:"Critical",pressure:997.8,rain:0,latency:48,integrity:96.2,edge:51.8,storage:93,compute:91,insight:"Critical thermal anomaly detected. AI correction strongly recommended.",trend:[45,50,58,70,82,95,88,100,92,105,110],neighbors:["DELTA-09","GAMMA-03"],alerts:8,positions:[
{name:"Observatory Core",type:"Monitoring Point",distance:"1.2 km",bearing:"N"},
{name:"Thermal Relay",type:"Edge Relay",distance:"3.6 km",bearing:"E"},
{name:"Sky Sensor Array",type:"Sensor Cluster",distance:"5.1 km",bearing:"SW"},
{name:"Emergency Gateway",type:"Gateway",distance:"8.9 km",bearing:"W"}]},
 "METRO-02":{name:"Station METRO-02",region:"Metro East",lat:"41.8819° N",lon:"87.6278° W",alt:"176m MSL",temp:23.5,humidity:63,wind:10.4,health:88,predicted:23.7,status:"Offline",pressure:1011.8,rain:.4,latency:0,integrity:99.2,edge:0,storage:58,compute:0,insight:"Station is offline. Last valid telemetry retained for comparison.",trend:[48,48,47,47,46,46,45,45,44,44,43],neighbors:["ALPHA-10"],alerts:3,positions:[
{name:"Metro Relay",type:"Edge Relay",distance:"2.1 km",bearing:"E"},
{name:"Urban Sensor",type:"Sensor Cluster",distance:"4.3 km",bearing:"S"},
{name:"North Monitoring",type:"Monitoring Point",distance:"6.7 km",bearing:"N"},
{name:"Backup Gateway",type:"Gateway",distance:"9.5 km",bearing:"W"}]}
};

function toast(msg){const t=document.getElementById('toast');t.textContent=msg;t.classList.add('show');clearTimeout(window.__toast);window.__toast=setTimeout(()=>t.classList.remove('show'),2300)}
function showDashboard(){document.getElementById('dashboard').classList.remove('hide');document.getElementById('station').classList.remove('show');document.getElementById('crumbText').textContent='Regional Overview';renderDashboard(currentStation)}
function openStation(id='ALPHA-10'){id=(id||'').toUpperCase().trim();const key=findStation(id);if(!key){toast('Station "'+id+'" not found');return}currentStation=key;document.getElementById('search').value=key;document.getElementById('dashboard').classList.add('hide');document.getElementById('station').classList.add('show');document.getElementById('crumbText').textContent=key;renderAll(key)}
function findStation(q){
  const keys=Object.keys(stationData),v=(q||'').toLowerCase().trim();
  if(!v)return null;
  return keys.find(k=>k.toLowerCase()===v)
    || keys.find(k=>k.toLowerCase().includes(v))
    || keys.find(k=>stationData[k].name.toLowerCase().includes(v))
    || keys.find(k=>stationData[k].region.toLowerCase().includes(v))
    || keys.find(k=>(stationData[k].positions||[]).some(p=>
      p.name.toLowerCase().includes(v)||p.type.toLowerCase().includes(v)));
}
function searchStation(value){const key=findStation((value||'').trim());if(key){openStation(key)}else if((value||'').trim()){toast('No station found for "'+value+'"')}}
function populateStationList(){document.getElementById('stationList').innerHTML=Object.keys(stationData).map(id=>'<option value="'+id+'">').join('');renderQuickStations()}
function renderQuickStations(){document.getElementById('stationQuickList').innerHTML=Object.keys(stationData).map(id=>{const s=stationData[id];return '<button class="quickstation '+(id===currentStation?'selected':'')+'" onclick="openStation(\\''+id+'\\')"><b>'+id+'</b><span class="qsstatus" style="color:'+(s.health<70?'var(--red)':s.health<80?'var(--yellow)':'var(--green)')+'">●</span><small>'+s.temp.toFixed(1)+'°C · '+s.health+'% health</small></button>'}).join('')}
function renderAll(id){renderStation(id);renderDashboard(id);renderMap(id);renderQuickStations()}
function renderDashboard(id){const s=stationData[id];document.getElementById('networkIntegrity').innerHTML=s.integrity.toFixed(2)+'<span class="unit">UPTIME</span>';document.getElementById('edgeLatency').innerHTML=s.edge.toFixed(1)+'<span class="unit">MS</span>';document.getElementById('activeNodes').innerHTML=(s.status==='Offline'?1427:1428)+'<span class="unit">ONLINE</span>';document.getElementById('anomalyCount').innerHTML=s.alerts+'<span class="unit">ACTIVE</span>';document.getElementById('storageValue').textContent=s.storage+'%';document.getElementById('computeValue').textContent=s.compute+'%';document.getElementById('storageFill').style.width=s.storage+'%';document.getElementById('computeFill').style.width=s.compute+'%';document.getElementById('footTemp').textContent=s.temp.toFixed(1)+'°C';document.getElementById('footHumidity').textContent=s.humidity+'%';document.getElementById('footWind').textContent=s.wind.toFixed(1)+' km/h';document.getElementById('footPressure').textContent=s.pressure.toFixed(1)+' hPa';document.getElementById('footRain').textContent=s.rain.toFixed(1)+' mm';document.getElementById('footLatency').textContent=(s.latency?s.latency:0)+'ms';document.getElementById('criticalBadge').textContent=(s.status==='Critical'?Math.max(1,Math.floor(s.alerts/2)):Math.min(5,s.alerts))+' CRITICAL'}
function renderStation(id){
  const s=stationData[id];
  document.getElementById('stationName').textContent=s.name+' ('+s.region+')';
  document.getElementById('stationMeta').textContent=s.lat+' · '+s.lon+' · '+s.alt+' · Last sync: just now';
  document.getElementById('stTemp').innerHTML=s.temp.toFixed(1)+'<span class="unit">°C</span>';
  document.getElementById('stHumidity').innerHTML=s.humidity+'<span class="unit">%</span>';
  document.getElementById('stWind').innerHTML=s.wind.toFixed(1)+'<span class="unit">km/h</span>';
  document.getElementById('stHealth').innerHTML=s.health+'<span class="unit">%</span>';
  document.getElementById('predictedTemp').innerHTML=s.predicted.toFixed(1)+'<span class="unit">°C</span>';
  document.getElementById('predictionStatus').textContent=s.status;
  document.getElementById('aiInsight').innerHTML='<b>⚙ AI INSIGHT</b>'+s.insight;
  document.getElementById('stationStatusLabel').textContent=s.status.toUpperCase()+' TELEMETRY';
  document.getElementById('stationStatusDetail').textContent='All station values are now synchronized to '+id;
  document.getElementById('stationStatusDot').style.color=s.status==='Critical'?'var(--red)':s.status==='Warning'?'var(--yellow)':s.status==='Offline'?'#65768a':'var(--green)';
  renderTrend(s.trend); renderNeighbors(s.neighbors); renderPositions(s.positions||[]);
}
function renderMap(id){const s=stationData[id];document.getElementById('mapLat').textContent='LAT: '+s.lat;document.getElementById('mapLon').textContent='LONG: '+s.lon;document.getElementById('mapAlt').textContent='ALT: '+s.alt}
function renderTrend(values){const max=Math.max(...values),min=Math.min(...values),span=Math.max(1,max-min),pts=values.map((v,i)=>[i*(700/(values.length-1)),250-((v-min)/span)*180]),d=pts.map((p,i)=>(i?'L':'M')+p[0].toFixed(1)+' '+p[1].toFixed(1)).join(' ');document.getElementById('telemetryLine').setAttribute('d',d);document.getElementById('telemetryArea').setAttribute('d',d+' L 700 300 L 0 300 Z')}
function renderPositions(items){
  const el=document.getElementById('relatedPositions');
  if(!el)return;
  el.innerHTML=items.map(p=>'<div class="quickstation" onclick="toast(\''+p.name+' · '+p.distance+' · '+p.bearing+'\')"><b>'+p.name+'</b><small>'+p.type+' · '+p.distance+' · '+p.bearing+'</small></div>').join('');
}
function renderNeighbors(ids){document.getElementById('neighbors').innerHTML=ids.map(id=>{const s=stationData[id];return '<div class="nodecard" onclick="openStation(\\''+id+'\\')" style="cursor:pointer"><div class="nodeinfo"><b>'+id+'</b><small>'+s.region+' · '+s.temp.toFixed(1)+'°C · Health '+s.health+'%</small></div><span class="'+(s.health<75?'maintenance':'online')+'">'+s.status.toUpperCase()+'</span></div>'}).join('')}
function clearAlerts(){const s=stationData[currentStation];s.alerts=0;renderAll(currentStation);document.querySelector('#alertTable tbody').innerHTML='<tr><td colspan="6" style="text-align:center;color:#65768a;padding:25px">No active alerts for '+currentStation+' — feed cleared.</td></tr>';toast('Alerts cleared for '+currentStation)}
function ack(btn){const row=btn.closest('tr');row.style.opacity='.45';btn.textContent='ACKED';btn.disabled=true;const s=stationData[currentStation];s.alerts=Math.max(0,s.alerts-1);renderDashboard(currentStation);toast('Alert acknowledged for '+currentStation)}
function syncFleet(){const btn=document.querySelector('.sync');const old=btn.innerHTML;btn.disabled=true;btn.innerHTML='⟳ &nbsp; SYNCHRONIZING...';setTimeout(()=>{btn.disabled=false;btn.innerHTML=old;toast('Fleet synchronization complete · '+currentStation+' values refreshed');renderAll(currentStation)},1200)}
function openDiagnostics(){confirmAction('System diagnostics','Run a full diagnostic scan across telemetry, edge nodes, storage, and AI services for '+currentStation+'.')}
function confirmAction(title,text){pendingAction=title;document.getElementById('modalTitle').textContent=title;document.getElementById('modalText').textContent=text;document.getElementById('modal').classList.add('show')}
function closeModal(){document.getElementById('modal').classList.remove('show');pendingAction=null}
function executeModal(){const action=pendingAction;closeModal();if(action==='Force calibration'){toast('Force calibration started on '+currentStation);setTimeout(()=>toast(currentStation+' calibration completed successfully'),1200)}else if(action==='Manual override'){toast('Manual override enabled for '+currentStation)}else if(action==='Apply AI correction'){stationData[currentStation].temp=stationData[currentStation].predicted;renderAll(currentStation);toast('AI correction applied · '+currentStation+' reading updated')}else if(action==='System diagnostics'){toast('Diagnostics complete · '+currentStation+' core services operational')}else toast(action+' executed successfully')}
function focusAlerts(){showDashboard();const a=document.querySelector('.alerts');a.scrollIntoView({behavior:'smooth',block:'center'});a.style.outline='1px solid var(--cyan)';setTimeout(()=>a.style.outline='',1200);toast('Alert feed focused for '+currentStation)}
document.getElementById('modal').addEventListener('click',e=>{if(e.target.id==='modal')closeModal()});
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeModal();if(e.key==='/'&&document.activeElement.tagName!=='INPUT'){e.preventDefault();document.getElementById('search').focus()}});
populateStationList();renderAll(currentStation);