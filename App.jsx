import React, { useState, useEffect, useCallback } from "react";

const C={bg:"#0a0e14",surface:"#111720",card:"#161e2a",border:"#1e2d3d",accent:"#00c9a7",warn:"#f59e0b",danger:"#ef4444",ok:"#22c55e",text:"#e2e8f0",muted:"#64748b",dim:"#94a3b8"};
const F={mono:"'JetBrains Mono','Courier New',monospace",sans:"'DM Sans',sans-serif",display:"'Barlow Condensed',sans-serif"};

const SUPABASE_URL="https://skfmtshibkfpwgwxscql.supabase.co";
const SUPABASE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNrZm10c2hpYmtmcHdnd3hzY3FsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc0NDQ2OTIsImV4cCI6MjA5MzAyMDY5Mn0.uK3b45fOqPnICRTSaT8alkmmCn72qDsaUTy9z0MxA4Y";
const SBH={"apikey":SUPABASE_KEY,"Authorization":"Bearer "+SUPABASE_KEY};
async function sbLoad(){try{const r=await fetch(SUPABASE_URL+"/rest/v1/pipes?select=*",{headers:SBH});const d=await r.json();return(d||[]).filter(x=>x.data&&x.data.id).map(x=>x.data);}catch{return[];}}

function today(){return new Date().toISOString().split("T")[0];}
function getLoss(nom,val){return nom>0&&val!=null?((nom-val)/nom)*100:0;}
function allVals(spots){return(spots||[]).flatMap(s=>(s.readings||[]).filter(r=>r.value!=null).map(r=>r.value));}
function getMin(v){return v.length?Math.min(...v):null;}
function getStatus(nom,spots){const v=allVals(spots);if(!v.length)return"ok";const l=getLoss(nom,getMin(v));return l>=30?"critical":l>=15?"warning":"ok";}
function sCol(s){return s==="critical"?C.danger:s==="warning"?C.warn:C.ok;}
function sLbl(s){return s==="critical"?"CRITICAL":s==="warning"?"TURN REQ":"GOOD";}

const SDR_RATIO_DASH={"SDR 6":6,"SDR 7.3":7.3,"SDR 9":9,"SDR 11":11,"SDR 13.5":13.5,"SDR 17":17,"SDR 21":21,"SDR 26":26,"SDR 32.5":32.5,"SDR 41":41};
const TEMP_FACTORS_DASH={20:1.00,25:0.935,30:0.87,35:0.805,40:0.74,45:0.67,50:0.60,55:0.50,60:0.40};
function getDashTempFactor(t){const keys=Object.keys(TEMP_FACTORS_DASH).map(Number).sort((a,b)=>a-b);if(t<=keys[0])return TEMP_FACTORS_DASH[keys[0]];if(t>=keys[keys.length-1])return TEMP_FACTORS_DASH[keys[keys.length-1]];for(let i=0;i<keys.length-1;i++){if(t>=keys[i]&&t<=keys[i+1]){const f2=(t-keys[i])/(keys[i+1]-keys[i]);return TEMP_FACTORS_DASH[keys[i]]+f2*(TEMP_FACTORS_DASH[keys[i+1]]-TEMP_FACTORS_DASH[keys[i]]);}}return 1;}
function calcHDPEPressure(od,wall,tempC){if(!od||!wall||wall<=0)return 0;return(20*10*0.8)/(od/wall-1)*getDashTempFactor(tempC||20);}
function getHDPEStatus(pipe){
  if(pipe.material!=="HDPE"||!pipe.od)return null;
  const sdrRatio=SDR_RATIO_DASH[pipe.sdr];if(!sdrRatio)return null;
  const nomWall=pipe.od/sdrRatio;
  const nomP=calcHDPEPressure(pipe.od,nomWall,20);
  const safeLimit=8.0;
  const minR=getMin(allVals(pipe.spots));
  if(minR==null)return null;
  const currentP=calcHDPEPressure(pipe.od,minR,20);
  const wallPct=(minR/nomWall)*100;
  return{currentP,nomP,safeLimit,minR,nomWall,wallPct,belowSafe:currentP<safeLimit,pctOfNom:(currentP/nomP)*100};
}

function wearRate(spots){
  const all=(spots||[]).flatMap(s=>(s.readings||[]).filter(r=>r.value!=null).map(r=>({...r})));
  if(all.length<2)return null;
  const sorted=[...all].sort((a,b)=>new Date(a.date)-new Date(b.date));
  const first=sorted[0],last=sorted[sorted.length-1];
  const days=(new Date(last.date)-new Date(first.date))/(1000*86400);
  if(days<=0)return null;
  return(first.value-last.value)/days;
}

function projectedDays(nom,spots){
  const rate=wearRate(spots);
  if(!rate||rate<=0)return null;
  const min=getMin(allVals(spots));
  if(min==null)return null;
  const threshold=nom*0.7;
  if(min<=threshold)return 0;
  return Math.round((min-threshold)/rate);
}

const SAMPLE=[
  {id:1,pipeName:"Main Feed Line A",area:"Plant North",diameter:"DN 100",nominalThickness:12.7,unit:"mm",material:"Carbon Steel",lastInspected:"2026-04-29T08:22:00Z",lastInspector:"John H",
    spots:[{readings:[{value:12.1,date:"2026-03-01"},{value:11.8,date:"2026-04-01"},{value:11.5,date:"2026-04-29"}]},{readings:[{value:11.9,date:"2026-03-01"},{value:11.5,date:"2026-04-01"},{value:11.2,date:"2026-04-29"}]}]},
  {id:2,pipeName:"Cooling Return",area:"Utility Block",diameter:"DN 50",nominalThickness:7.0,unit:"mm",material:"Carbon Steel",lastInspected:"2026-04-29T09:05:00Z",lastInspector:"Sarah M",
    spots:[{readings:[{value:5.2,date:"2026-03-01"},{value:5.0,date:"2026-04-01"},{value:4.8,date:"2026-04-29"}]},{readings:[{value:4.9,date:"2026-03-01"},{value:4.6,date:"2026-04-01"},{value:4.3,date:"2026-04-29"}]}]},
  {id:3,pipeName:"Steam Supply",area:"Plant North",diameter:"DN 150",nominalThickness:15.0,unit:"mm",material:"Chrome-Moly",lastInspected:"2026-04-28T14:30:00Z",lastInspector:"John H",
    spots:[{readings:[{value:14.8,date:"2026-04-01"},{value:14.9,date:"2026-04-28"}]},{readings:[{value:15.0,date:"2026-04-01"},{value:14.7,date:"2026-04-28"}]}]},
  {id:4,pipeName:"Bypass Header",area:"Plant South",diameter:"DN 80",nominalThickness:9.5,unit:"mm",material:"Stainless 316",lastInspected:"2026-04-27T11:00:00Z",lastInspector:"Mike T",
    spots:[{readings:[{value:9.4,date:"2026-03-01"},{value:9.2,date:"2026-04-01"},{value:9.0,date:"2026-04-27"}]},{readings:[{value:9.3,date:"2026-03-01"},{value:9.1,date:"2026-04-01"},{value:8.8,date:"2026-04-27"}]}]},
  {id:5,pipeName:"HDPE Feed Main",area:"Utility Block",diameter:"OD 110mm",od:110,sdr:"SDR 11",nominalThickness:10.0,unit:"mm",material:"HDPE",lastInspected:"2026-04-25T10:15:00Z",lastInspector:"Sarah M",
    spots:[{readings:[{value:10.2,date:"2026-04-01"},{value:10.0,date:"2026-04-25"}]},{readings:[{value:10.3,date:"2026-04-01"},{value:10.1,date:"2026-04-25"}]}]},
  {id:7,pipeName:"HDPE Main 560 SDR11",area:"Plant North",diameter:"OD 560mm",od:560,sdr:"SDR 11",nominalThickness:50.9,unit:"mm",material:"HDPE",lastInspected:"2026-04-29T07:30:00Z",lastInspector:"John H",
    spots:[{readings:[{value:50.9,date:"2026-01-10"},{value:47.8,date:"2026-02-10"},{value:44.2,date:"2026-03-20"},{value:40.8,date:"2026-04-29"}]},{readings:[{value:50.9,date:"2026-01-10"},{value:46.2,date:"2026-02-10"},{value:42.1,date:"2026-03-20"},{value:38.5,date:"2026-04-29"}]}]},
  {id:6,pipeName:"Condensate Return",area:"Plant North",diameter:"DN 65",nominalThickness:8.0,unit:"mm",material:"Carbon Steel",lastInspected:null,lastInspector:null,
    spots:[{readings:[{value:7.8,date:"2026-02-01"},{value:7.4,date:"2026-03-15"}]},{readings:[{value:7.6,date:"2026-02-01"},{value:7.1,date:"2026-03-15"}]}]},
];

// Mini sparkline
// -- HDPE Pressure Rating Calculator -----------------------------------------
// Auto-uses pipe OD and SDR when passed as props.
// Can also be used standalone with manual input.
// Based on: P = (20 - MRS - C) / (SDR_eff - 1) - f_temp
// MRS = 10 MPa (PE100), C = 0.8, SDR_eff = OD / measured_wall
// Temperature derating per ISO 4427-1

const TEMP_FACTORS={20:1.00,25:0.935,30:0.87,35:0.805,40:0.74,45:0.67,50:0.60,55:0.50,60:0.40};
const TEMP_COLORS={20:"#2563eb",25:"#0891b2",30:"#16a34a",35:"#65a30d",40:"#d97706",45:"#c2410c",50:"#ea580c",55:"#c026d3",60:"#dc2626"};
const HDPE_OD_LIST=[16,20,25,32,40,50,63,75,90,110,125,140,160,180,200,225,250,280,315,355,400,450,500,560,630,710,800,900,1000];
const SDR_RATIO_MAP={"SDR 6":6,"SDR 7.3":7.3,"SDR 9":9,"SDR 11":11,"SDR 13.5":13.5,"SDR 17":17,"SDR 21":21,"SDR 26":26,"SDR 32.5":32.5,"SDR 41":41};

function getTempFactor(t){
  const keys=Object.keys(TEMP_FACTORS).map(Number).sort((a,b)=>a-b);
  if(t<=keys[0])return TEMP_FACTORS[keys[0]];
  if(t>=keys[keys.length-1])return TEMP_FACTORS[keys[keys.length-1]];
  for(let i=0;i<keys.length-1;i++){
    if(t>=keys[i]&&t<=keys[i+1]){
      const f=(t-keys[i])/(keys[i+1]-keys[i]);
      return TEMP_FACTORS[keys[i]]+f*(TEMP_FACTORS[keys[i+1]]-TEMP_FACTORS[keys[i]]);
    }
  }
  return 1;
}
function calcPressure(od,wall,tempC){
  if(!od||!wall||wall<=0)return 0;
  const effSDR=od/wall;
  return(20*10*0.8)/(effSDR-1)*getTempFactor(tempC);
}
function nomWallFromSDR(od,sdr){
  const r=SDR_RATIO_MAP[sdr];
  if(!r||!od)return null;
  return parseFloat((od/r).toFixed(1));
}
// Minimum safe wall = 50% of nominal (conservative field threshold)
function minWall(nomW){return parseFloat((nomW*0.5).toFixed(1));}

function HDPEPressureCalc({pipeOD,pipeSdr,pipeNomWall,latestReading,embedded}){
  // embedded=true: compact view inside a pipe card
  // standalone: full calculator with OD/SDR pickers

  const[od,setOd]=useState(pipeOD||560);
  const[sdr,setSdr]=useState(pipeSdr||"SDR 11");
  const[temp,setTemp]=useState(20);
  const[collapsed,setCollapsed]=useState(!!embedded);

  const nomW=pipeNomWall||nomWallFromSDR(od,sdr)||0;
  const minW=minWall(nomW);
  const nomPressure=calcPressure(od,nomW,20);
  const safeLimit=nomPressure*0.8;

  // Wall reading: use latestReading if provided, else nomW (slider at nominal)
  const[wallReading,setWallReading]=useState(latestReading||nomW);

  // Update wallReading when pipe data changes
  React.useEffect(()=>{if(latestReading!=null)setWallReading(latestReading);},[latestReading]);
  React.useEffect(()=>{if(pipeOD)setOd(pipeOD);},[pipeOD]);
  React.useEffect(()=>{if(pipeSdr)setSdr(pipeSdr);},[pipeSdr]);

  const currentPressure=calcPressure(od,wallReading,temp);
  const wallPct=nomW>0?(wallReading/nomW*100):0;
  const tf=getTempFactor(temp);
  const pressureColor=currentPressure<safeLimit?C.danger:currentPressure<nomPressure*0.9?C.warn:C.ok;
  const wallColor=wallPct<60?C.danger:wallPct<80?C.warn:C.ok;
  const tColor=tf<0.6?C.danger:tf<0.8?C.warn:C.muted;
  const sliderMax=nomW>0?nomW:100;
  const sliderMin=minW>0?minW:sliderMax*0.5;

  // Build sparkline data points for mini chart
  const pts=[];
  const step=(nomW-minW)/40;
  for(let w=nomW;w>=minW-0.01;w-=step>0?step:0.1){pts.push(parseFloat(w.toFixed(2)));}

  // SVG mini chart
  const CW=300,CH=80,padL=28,padR=8,padT=8,padB=20;
  const chartW=CW-padL-padR,chartH=CH-padT-padB;
  const pressures=pts.map(w=>calcPressure(od,w,temp));
  const pMin=0,pMax=Math.max(...pressures)*1.1;
  const toX=i=>padL+(i/(pts.length-1||1))*chartW;
  const toY=p=>padT+chartH-((p-pMin)/(pMax-pMin||1))*chartH;
  const safeLimitY=toY(safeLimit);
  const linePath=pressures.map((p,i)=>(i===0?"M":"L")+toX(i).toFixed(1)+","+toY(p).toFixed(1)).join(" ");
  const closestIdx=pts.reduce((b,w,i)=>Math.abs(w-wallReading)<Math.abs(pts[b]-wallReading)?i:b,0);
  const dotX=toX(closestIdx),dotY=toY(pressures[closestIdx]||0);
  const tColor2=TEMP_COLORS[temp]||"#2563eb";

  if(collapsed)return(
    <div style={{background:C.bg,border:"1px solid "+(currentPressure<safeLimit?C.danger:C.border),borderRadius:8,padding:"8px 12px",cursor:"pointer"}} onClick={()=>setCollapsed(false)}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div style={{fontSize:10,color:C.muted,fontFamily:F.mono,letterSpacing:0.5}}>HDPE PRESSURE RATING</div>
        <span style={{fontSize:9,color:C.accent,fontFamily:F.mono}}>EXPAND</span>
      </div>
      <div style={{display:"flex",gap:16,marginTop:4}}>
        <div>
          <div style={{fontSize:9,color:C.muted,fontFamily:F.mono}}>CURRENT</div>
          <div style={{fontSize:16,fontWeight:800,color:pressureColor,fontFamily:F.mono}}>{currentPressure.toFixed(1)} bar</div>
        </div>
        <div>
          <div style={{fontSize:9,color:C.muted,fontFamily:F.mono}}>WALL</div>
          <div style={{fontSize:16,fontWeight:800,color:wallColor,fontFamily:F.mono}}>{wallPct.toFixed(0)}%</div>
        </div>
        <div>
          <div style={{fontSize:9,color:C.muted,fontFamily:F.mono}}>SAFE LIMIT</div>
          <div style={{fontSize:16,fontWeight:800,color:C.muted,fontFamily:F.mono}}>{safeLimit.toFixed(1)} bar</div>
        </div>
        {currentPressure<safeLimit&&<div style={{alignSelf:"center",background:C.danger+"22",border:"1px solid "+C.danger+"44",borderRadius:6,padding:"3px 8px",fontSize:10,fontFamily:F.mono,color:C.danger,fontWeight:700}}>BELOW SAFE LIMIT</div>}
      </div>
    </div>
  );

  return(
    <div style={{background:C.card,border:"1px solid "+(currentPressure<safeLimit?C.danger+"66":C.border),borderRadius:10,padding:embedded?14:20}}>
      {embedded&&<div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
        <div style={{fontSize:10,fontWeight:700,color:C.accent,fontFamily:F.mono,letterSpacing:1}}>HDPE PRESSURE RATING CALCULATOR</div>
        <button onClick={()=>setCollapsed(true)} style={{background:"transparent",border:"none",color:C.muted,fontSize:10,fontFamily:F.mono,cursor:"pointer"}}>COLLAPSE</button>
      </div>}

      {!embedded&&<div style={{fontSize:11,fontWeight:700,color:C.accent,fontFamily:F.mono,letterSpacing:1,marginBottom:12}}>HDPE PRESSURE RATING CALCULATOR</div>}

      {/* OD + SDR selectors (only shown in standalone mode) */}
      {!embedded&&(
        <div style={{display:"flex",gap:8,marginBottom:14,flexWrap:"wrap"}}>
          <div style={{flex:1,minWidth:120}}>
            <div style={{fontSize:9,color:C.muted,fontFamily:F.mono,marginBottom:4}}>OD (mm)</div>
            <select value={od} onChange={e=>setOd(parseFloat(e.target.value))}
              style={{width:"100%",background:C.bg,border:"1px solid "+C.border,borderRadius:7,padding:"7px 10px",color:C.text,fontFamily:F.mono,fontSize:12,outline:"none"}}>
              {HDPE_OD_LIST.map(o=><option key={o} value={o}>{o} mm</option>)}
            </select>
          </div>
          <div style={{flex:1,minWidth:120}}>
            <div style={{fontSize:9,color:C.muted,fontFamily:F.mono,marginBottom:4}}>SDR</div>
            <select value={sdr} onChange={e=>setSdr(e.target.value)}
              style={{width:"100%",background:C.bg,border:"1px solid "+C.border,borderRadius:7,padding:"7px 10px",color:C.text,fontFamily:F.mono,fontSize:12,outline:"none"}}>
              {Object.keys(SDR_RATIO_MAP).map(s=><option key={s}>{s}</option>)}
            </select>
          </div>
          <div style={{flex:1,minWidth:100}}>
            <div style={{fontSize:9,color:C.muted,fontFamily:F.mono,marginBottom:4}}>NOM WALL</div>
            <div style={{background:C.bg,border:"1px solid "+C.border,borderRadius:7,padding:"7px 10px",fontFamily:F.mono,fontSize:12,color:C.accent}}>{nomW>0?nomW+" mm":"--"}</div>
          </div>
        </div>
      )}
      {embedded&&<div style={{fontSize:10,color:C.muted,fontFamily:F.mono,marginBottom:10}}>OD {od}mm -- {sdr} -- Nominal wall: {nomW}mm</div>}

      {/* Summary stat boxes */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:6,marginBottom:14}}>
        {[["NOMINAL",nomPressure.toFixed(1)+" bar",C.muted],["CURRENT",currentPressure.toFixed(1)+" bar",pressureColor],["SAFE LIMIT",safeLimit.toFixed(1)+" bar",currentPressure<safeLimit?C.danger:C.muted],["WALL %",wallPct.toFixed(1)+"%",wallColor]].map(([l,v,col])=>(
          <div key={l} style={{background:C.bg,borderRadius:7,padding:"7px 8px",border:"1px solid "+(col===C.danger||col===C.warn?"" :C.border)}}>
            <div style={{fontSize:8,color:C.muted,fontFamily:F.mono,letterSpacing:0.3,marginBottom:2}}>{l}</div>
            <div style={{fontSize:13,fontWeight:800,color:col,fontFamily:F.mono}}>{v}</div>
          </div>
        ))}
      </div>

      {currentPressure<safeLimit&&(
        <div style={{background:C.danger+"18",border:"1px solid "+C.danger+"44",borderRadius:8,padding:"8px 12px",marginBottom:12,display:"flex",alignItems:"center",gap:8}}>
          <div style={{width:8,height:8,borderRadius:"50%",background:C.danger,flexShrink:0}}/>
          <div style={{fontSize:11,color:C.danger,fontFamily:F.mono,fontWeight:700}}>
            BELOW SAFE OPERATING PRESSURE -- pipe at risk at current wall thickness
          </div>
        </div>
      )}

      {/* Mini SVG pressure chart */}
      <div style={{marginBottom:12}}>
        <div style={{fontSize:9,color:C.muted,fontFamily:F.mono,marginBottom:4,letterSpacing:0.3}}>PRESSURE vs WALL THICKNESS</div>
        <svg viewBox={"0 0 "+CW+" "+CH} style={{width:"100%",height:"auto",maxHeight:80,background:C.bg,borderRadius:7,display:"block"}}>
          {/* Safe limit line */}
          <line x1={padL} y1={safeLimitY} x2={CW-padR} y2={safeLimitY} stroke={C.muted} strokeWidth={1} strokeDasharray="4 3"/>
          <text x={padL+2} y={safeLimitY-2} fontSize={6} fill={C.muted} fontFamily={F.mono}>safe</text>
          {/* Pressure curve */}
          <path d={linePath} fill="none" stroke={tColor2} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round"/>
          {/* Area fill */}
          <path d={linePath+" L"+toX(pts.length-1).toFixed(1)+","+(padT+chartH)+" L"+padL+","+(padT+chartH)+" Z"} fill={tColor2+"18"}/>
          {/* UT reading dot */}
          <circle cx={dotX} cy={dotY} r={4} fill={C.warn} stroke={C.bg} strokeWidth={1.5}/>
          {/* Y axis label */}
          <text x={6} y={padT+4} fontSize={6} fill={C.muted} fontFamily={F.mono}>{pMax.toFixed(0)}</text>
          <text x={6} y={padT+chartH} fontSize={6} fill={C.muted} fontFamily={F.mono}>0</text>
          {/* X axis labels */}
          <text x={padL} y={CH-3} fontSize={6} fill={C.muted} fontFamily={F.mono}>{nomW}</text>
          <text x={CW-padR-12} y={CH-3} fontSize={6} fill={C.muted} fontFamily={F.mono}>{minW}</text>
        </svg>
        <div style={{display:"flex",justifyContent:"space-between",fontSize:8,color:C.muted,fontFamily:F.mono,padding:"0 2px"}}>
          <span>Nominal ({nomW}mm)</span><span style={{color:C.warn}}>UT: {wallReading.toFixed(1)}mm</span><span>Min ({minW}mm)</span>
        </div>
      </div>

      {/* UT reading slider */}
      <div style={{marginBottom:10}}>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
          <span style={{fontSize:9,color:C.muted,fontFamily:F.mono,letterSpacing:0.3}}>UT READING (mm)</span>
          <span style={{fontSize:11,fontWeight:700,color:wallColor,fontFamily:F.mono}}>{wallReading.toFixed(1)} mm</span>
        </div>
        <input type="range" min={minW} max={sliderMax} step={0.1} value={wallReading}
          onChange={e=>setWallReading(parseFloat(e.target.value))}
          style={{width:"100%",accentColor:tColor2}}/>
        <div style={{display:"flex",justifyContent:"space-between",fontSize:8,color:C.muted,fontFamily:F.mono,marginTop:2}}>
          <span>Worn ({minW}mm)</span><span>New ({nomW}mm)</span>
        </div>
      </div>

      {/* Temperature slider */}
      <div style={{marginBottom:10}}>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
          <span style={{fontSize:9,color:C.muted,fontFamily:F.mono,letterSpacing:0.3}}>OPERATING TEMPERATURE</span>
          <span style={{fontSize:11,fontWeight:700,color:tColor,fontFamily:F.mono}}>{temp} C -- factor {tf.toFixed(2)}</span>
        </div>
        <input type="range" min={20} max={60} step={5} value={temp}
          onChange={e=>setTemp(parseInt(e.target.value))}
          style={{width:"100%",accentColor:tColor2}}/>
        <div style={{display:"flex",justifyContent:"space-between",fontSize:8,color:C.muted,fontFamily:F.mono,marginTop:2}}>
          <span>20 C</span><span>40 C</span><span>60 C</span>
        </div>
      </div>

      <div style={{fontSize:9,color:C.muted,fontFamily:F.mono,lineHeight:1.5,marginTop:8,padding:"6px 8px",background:C.bg,borderRadius:6}}>
        P = (20 x MRS x C) / (SDR_eff - 1) x f_temp -- MRS=10MPa (PE100), C=0.8, SDR_eff=OD/measured wall. Safe limit = 80% of nominal. ISO 4427-1.
      </div>

    </div>
  );
}

function Spark({readings,nominal}){
  if(!readings||readings.length<2)return null;
  const W=80,H=28,pad=2;
  const vals=readings.map(r=>r.value);
  const mn=Math.min(...vals,nominal*0.85),mx=Math.max(...vals,nominal*1.05);
  const tx=i=>pad+(i/(vals.length-1))*(W-pad*2);
  const ty=v=>H-pad-((v-mn)/(mx-mn||1))*(H-pad*2);
  const path=vals.map((v,i)=>(i===0?"M":"L")+tx(i).toFixed(1)+","+ty(v).toFixed(1)).join(" ");
  const nomY=ty(nominal);
  const lastC=getLoss(nominal,vals[vals.length-1])>=30?C.danger:getLoss(nominal,vals[vals.length-1])>=15?C.warn:C.ok;
  return(
    <svg viewBox={"0 0 "+W+" "+H} style={{width:W,height:H,flexShrink:0}}>
      <line x1={pad} y1={nomY} x2={W-pad} y2={nomY} stroke={C.muted} strokeWidth={0.5} strokeDasharray="2 2"/>
      <path d={path} fill="none" stroke={lastC} strokeWidth={1.5} strokeLinejoin="round" strokeLinecap="round"/>
      <circle cx={tx(vals.length-1)} cy={ty(vals[vals.length-1])} r={2.5} fill={lastC}/>
    </svg>
  );
}

function Badge({status,small}){
  const col=sCol(status);const lbl=sLbl(status);
  return(<span style={{background:col+"22",color:col,border:"1px solid "+col+"44",borderRadius:4,padding:small?"1px 6px":"2px 8px",fontSize:small?9:10,fontFamily:F.mono,fontWeight:700,letterSpacing:1,whiteSpace:"nowrap"}}>{lbl}</span>);
}

// HDPE pressure row
function HDPEPressureRow({pipe}){
  const s=getHDPEStatus(pipe);
  if(!s)return null;
  const barW=Math.min(100,s.pctOfNom);
  const col=s.belowSafe?C.danger:s.pctOfNom<90?C.warn:C.ok;
  return(
    <div style={{padding:"10px 8px",borderBottom:"1px solid "+C.border+"55",marginBottom:2}}>
      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
        <div style={{flex:1,minWidth:0}}>
          <div style={{fontSize:13,fontWeight:700,color:C.text,fontFamily:F.display,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{pipe.pipeName}</div>
          <div style={{fontSize:9,color:C.muted,fontFamily:F.mono,marginTop:1}}>{pipe.area} -- {pipe.diameter} -- {pipe.sdr}</div>
        </div>
        <div style={{textAlign:"right",flexShrink:0}}>
          <div style={{fontSize:16,fontWeight:800,color:col,fontFamily:F.mono}}>{s.currentP.toFixed(1)} bar</div>
          <div style={{fontSize:9,color:C.muted,fontFamily:F.mono}}>safe limit: 8.0 bar</div>
        </div>
        {s.belowSafe&&<span style={{background:C.danger+"22",color:C.danger,border:"1px solid "+C.danger+"44",borderRadius:4,padding:"2px 6px",fontSize:9,fontFamily:F.mono,fontWeight:700,flexShrink:0}}>UNSAFE</span>}
      </div>
      {/* Pressure bar */}
      <div style={{background:C.border,borderRadius:3,height:5,overflow:"hidden",position:"relative"}}>
        {/* Safe limit marker */}
        <div style={{position:"absolute",left:Math.min(99,(8/s.nomP)*100)+"%",top:0,width:1,height:"100%",background:C.muted+"88",zIndex:1}}/>
        <div style={{width:barW+"%",height:"100%",background:"linear-gradient(90deg,"+col+"88,"+col+")",borderRadius:3,transition:"width 0.5s"}}/>
      </div>
      <div style={{display:"flex",justifyContent:"space-between",fontSize:8,color:C.muted,fontFamily:F.mono,marginTop:2}}>
        <span>0 bar</span>
        <span style={{color:C.muted}}>safe limit 8.0 bar</span>
        <span>nom {s.nomP.toFixed(1)} bar</span>
      </div>
      <div style={{marginTop:4,fontSize:9,fontFamily:F.mono,color:C.muted}}>
        Wall: {s.minR.toFixed(1)}mm of {s.nomWall.toFixed(1)}mm nominal ({s.wallPct.toFixed(1)}%)
      </div>
    </div>
  );
}

// Section card wrapper
function Panel({title,count,color,children,flex}){
  return(
    <div style={{flex:flex||1,background:C.surface,border:"1px solid "+C.border,borderRadius:12,display:"flex",flexDirection:"column",overflow:"hidden",minWidth:0}}>
      <div style={{padding:"10px 14px",borderBottom:"1px solid "+C.border,display:"flex",justifyContent:"space-between",alignItems:"center",flexShrink:0}}>
        <div style={{fontSize:11,fontWeight:700,color:color||C.muted,fontFamily:F.mono,letterSpacing:1}}>{title}</div>
        {count!=null&&<div style={{background:(color||C.muted)+"22",color:color||C.muted,borderRadius:20,padding:"1px 10px",fontSize:12,fontFamily:F.mono,fontWeight:700}}>{count}</div>}
      </div>
      <div style={{flex:1,overflowY:"auto",padding:"8px 10px"}}>{children}</div>
    </div>
  );
}

// Critical / warning pipe row
function AlertRow({pipe}){
  const status=getStatus(pipe.nominalThickness,pipe.spots);
  const min=getMin(allVals(pipe.spots));
  const loss=getLoss(pipe.nominalThickness,min);
  const allReadings=(pipe.spots||[]).flatMap(s=>s.readings||[]).filter(r=>r.value!=null).sort((a,b)=>new Date(a.date)-new Date(b.date));
  return(
    <div style={{display:"flex",alignItems:"center",gap:8,padding:"8px 6px",borderBottom:"1px solid "+C.border+"55",marginBottom:2}}>
      <div style={{flex:1,minWidth:0}}>
        <div style={{fontSize:13,fontWeight:700,color:C.text,fontFamily:F.display,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{pipe.pipeName}</div>
        <div style={{fontSize:9,color:C.muted,fontFamily:F.mono,marginTop:1}}>{pipe.area} -- {pipe.diameter}</div>
      </div>
      <Spark readings={allReadings.slice(-6)} nominal={pipe.nominalThickness}/>
      <div style={{textAlign:"right",flexShrink:0}}>
        <div style={{fontSize:16,fontWeight:800,color:sCol(status),fontFamily:F.mono}}>{min!=null?min.toFixed(1):"--"}<span style={{fontSize:9,marginLeft:2}}>{pipe.unit}</span></div>
        <div style={{fontSize:9,color:sCol(status),fontFamily:F.mono}}>{loss.toFixed(1)}% loss</div>
      </div>
      <Badge status={status} small/>
    </div>
  );
}

// Wear rate row
function WearRow({pipe,i}){
  const rate=wearRate(pipe.spots);
  const days=projectedDays(pipe.nominalThickness,pipe.spots);
  const min=getMin(allVals(pipe.spots));
  const status=getStatus(pipe.nominalThickness,pipe.spots);
  return(
    <div style={{display:"flex",alignItems:"center",gap:8,padding:"8px 6px",borderBottom:"1px solid "+C.border+"55",marginBottom:2}}>
      <div style={{width:18,height:18,borderRadius:"50%",background:C.warn+"22",border:"1px solid "+C.warn+"44",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
        <span style={{fontSize:9,color:C.warn,fontFamily:F.mono,fontWeight:700}}>{i+1}</span>
      </div>
      <div style={{flex:1,minWidth:0}}>
        <div style={{fontSize:13,fontWeight:700,color:C.text,fontFamily:F.display,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{pipe.pipeName}</div>
        <div style={{fontSize:9,color:C.muted,fontFamily:F.mono}}>{pipe.area}</div>
      </div>
      <div style={{textAlign:"right",flexShrink:0}}>
        <div style={{fontSize:12,fontWeight:700,color:C.warn,fontFamily:F.mono}}>{rate!=null?rate.toFixed(4):"--"} {pipe.unit}/day</div>
        {days!=null&&<div style={{fontSize:9,color:days<30?C.danger:days<90?C.warn:C.ok,fontFamily:F.mono,fontWeight:days<30?700:400}}>
          {days<=0?"PAST THRESHOLD":days+" days to threshold"}
        </div>}
      </div>
    </div>
  );
}

// Inspector activity row
function ActivityRow({name,pipes,count}){
  return(
    <div style={{display:"flex",alignItems:"center",gap:10,padding:"8px 6px",borderBottom:"1px solid "+C.border+"55",marginBottom:2}}>
      <div style={{width:32,height:32,borderRadius:"50%",background:C.accent+"22",border:"1px solid "+C.accent+"44",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
        <span style={{fontSize:12,fontWeight:700,color:C.accent,fontFamily:F.mono}}>{name?name[0].toUpperCase():"?"}</span>
      </div>
      <div style={{flex:1,minWidth:0}}>
        <div style={{fontSize:13,fontWeight:700,color:C.text,fontFamily:F.display}}>{name||"Unknown"}</div>
        <div style={{fontSize:9,color:C.muted,fontFamily:F.mono,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
          {pipes.slice(0,3).map(p=>p.pipeName).join(", ")}{pipes.length>3?" +more":""}
        </div>
      </div>
      <div style={{textAlign:"right",flexShrink:0}}>
        <div style={{fontSize:18,fontWeight:800,color:C.accent,fontFamily:F.mono}}>{count}</div>
        <div style={{fontSize:9,color:C.muted,fontFamily:F.mono}}>pipe{count!==1?"s":""} today</div>
      </div>
    </div>
  );
}

// Overdue row
function OverdueRow({pipe,daysSince}){
  const col=daysSince>14?C.danger:daysSince>7?C.warn:C.muted;
  return(
    <div style={{display:"flex",alignItems:"center",gap:8,padding:"8px 6px",borderBottom:"1px solid "+C.border+"55",marginBottom:2}}>
      <div style={{flex:1,minWidth:0}}>
        <div style={{fontSize:13,fontWeight:700,color:C.text,fontFamily:F.display,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{pipe.pipeName}</div>
        <div style={{fontSize:9,color:C.muted,fontFamily:F.mono}}>{pipe.area} -- {pipe.diameter}</div>
      </div>
      <div style={{textAlign:"right",flexShrink:0}}>
        <div style={{fontSize:14,fontWeight:800,color:col,fontFamily:F.mono}}>{pipe.lastInspected?daysSince+"d ago":"Never"}</div>
        {pipe.lastInspector&&<div style={{fontSize:9,color:C.muted,fontFamily:F.mono}}>Last: {pipe.lastInspector}</div>}
      </div>
      <Badge status={getStatus(pipe.nominalThickness,pipe.spots)} small/>
    </div>
  );
}

export default function App(){
  const[pipes,setPipes]=useState(SAMPLE);
  const[loading,setLoading]=useState(false);
  const[lastRefresh,setLastRefresh]=useState(new Date());
  const[error,setError]=useState("");

  async function refresh(){
    setLoading(true);setError("");
    try{
      const remote=await sbLoad();
      if(remote.length>0)setPipes(remote);
      else setPipes(SAMPLE);
      setLastRefresh(new Date());
    }catch(e){setError("Could not reach Supabase: "+e.message);}
    setLoading(false);
  }

  useEffect(()=>{refresh();},[]);

  // Derived data
  const critical=pipes.filter(p=>getStatus(p.nominalThickness,p.spots)==="critical");
  const warning=pipes.filter(p=>getStatus(p.nominalThickness,p.spots)==="warning");
  const alerts=[...critical,...warning];

  const wearPipes=pipes.map(p=>({pipe:p,rate:wearRate(p.spots)})).filter(x=>x.rate!=null&&x.rate>0).sort((a,b)=>b.rate-a.rate).slice(0,8);

  // Who inspected today
  const todayInspectors={};
  pipes.forEach(p=>{
    if(p.lastInspected&&p.lastInspected.startsWith(today())&&p.lastInspector){
      if(!todayInspectors[p.lastInspector])todayInspectors[p.lastInspector]=[];
      todayInspectors[p.lastInspector].push(p);
    }
  });
  const inspectorList=Object.entries(todayInspectors).sort((a,b)=>b[1].length-a[1].length);

  // Overdue (no inspection in 7+ days)
  const overdue=pipes.filter(p=>{
    if(!p.lastInspected)return true;
    const days=(new Date()-new Date(p.lastInspected))/(1000*86400);
    return days>=7;
  }).map(p=>{
    const days=p.lastInspected?Math.floor((new Date()-new Date(p.lastInspected))/(1000*86400)):999;
    return{pipe:p,days};
  }).sort((a,b)=>b.days-a.days).slice(0,8);

  const counts={critical:critical.length,warning:warning.length,ok:pipes.filter(p=>getStatus(p.nominalThickness,p.spots)==="ok").length,total:pipes.length};
  const todayCount=pipes.filter(p=>p.lastInspected&&p.lastInspected.startsWith(today())).length;

  return(
    <div style={{minHeight:"100vh",background:C.bg,color:C.text,fontFamily:F.sans,display:"flex",flexDirection:"column"}}>
      <link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;700;800&family=DM+Sans:wght@400;600;700&family=JetBrains+Mono:wght@400;700&display=swap" rel="stylesheet"/>

      {/* Header */}
      <div style={{background:C.surface,borderBottom:"1px solid "+C.border,padding:"10px 20px",display:"flex",alignItems:"center",justifyContent:"space-between",flexShrink:0}}>
        <div style={{display:"flex",alignItems:"center",gap:16}}>
          <div>
            <div style={{fontSize:11,color:C.accent,fontFamily:F.mono,letterSpacing:2}}>UT INSPECTION</div>
            <div style={{fontSize:22,fontWeight:800,fontFamily:F.display,letterSpacing:0.5,lineHeight:1}}>PIPE WALL THICKNESS DASHBOARD</div>
          </div>
          {/* Summary pills */}
          <div style={{display:"flex",gap:8,marginLeft:16}}>
            {[[counts.critical,C.danger,"CRITICAL"],[counts.warning,C.warn,"TURN REQ"],[counts.ok,C.ok,"GOOD"],[counts.total,C.dim,"TOTAL"]].map(([n,col,lbl])=>(
              <div key={lbl} style={{background:col+"18",border:"1px solid "+col+"33",borderRadius:8,padding:"4px 12px",textAlign:"center"}}>
                <div style={{fontSize:18,fontWeight:800,color:col,fontFamily:F.mono,lineHeight:1}}>{n}</div>
                <div style={{fontSize:8,color:col,fontFamily:F.mono,letterSpacing:0.5}}>{lbl}</div>
              </div>
            ))}
          </div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <div style={{textAlign:"right"}}>
            <div style={{fontSize:9,color:C.muted,fontFamily:F.mono}}>LAST REFRESHED</div>
            <div style={{fontSize:11,color:C.dim,fontFamily:F.mono}}>{lastRefresh.toLocaleTimeString()}</div>
          </div>
          {error&&<div style={{fontSize:10,color:C.danger,fontFamily:F.mono,maxWidth:160}}>{error}</div>}
          <button onClick={refresh} disabled={loading}
            style={{background:loading?C.border:C.accent,border:"none",color:loading?C.muted:"#000",borderRadius:10,padding:"10px 20px",fontFamily:F.mono,fontSize:12,fontWeight:700,cursor:loading?"not-allowed":"pointer",letterSpacing:1,transition:"all 0.2s"}}>
            {loading?"LOADING...":"REFRESH"}
          </button>
        </div>
      </div>

      {/* Today banner */}
      <div style={{background:"#0d1a26",borderBottom:"1px solid "+C.border,padding:"5px 20px",display:"flex",gap:24,alignItems:"center",flexShrink:0}}>
        <span style={{fontSize:9,color:C.muted,fontFamily:F.mono,letterSpacing:1}}>TODAY</span>
        <span style={{fontSize:11,color:C.accent,fontFamily:F.mono}}>{todayCount} pipe{todayCount!==1?"s":""} inspected</span>
        {inspectorList.length>0&&<span style={{fontSize:11,color:C.dim,fontFamily:F.mono}}>On site: {inspectorList.map(([n])=>n).join(", ")}</span>}
        <span style={{fontSize:11,color:overdue.length>0?C.warn:C.ok,fontFamily:F.mono}}>{overdue.length} overdue (&gt;7 days)</span>
        {(()=>{const hdpePressureIssues=pipes.filter(p=>{ const s=getHDPEStatus(p); return s&&s.belowSafe;}).length; return hdpePressureIssues>0&&(<span style={{fontSize:11,color:C.danger,fontFamily:F.mono,fontWeight:700}}>{hdpePressureIssues} HDPE pipe{hdpePressureIssues!==1?"s":""} below safe pressure</span>);})()}
        <span style={{marginLeft:"auto",fontSize:9,color:C.muted,fontFamily:F.mono}}>{new Date().toLocaleDateString("en-AU",{weekday:"long",year:"numeric",month:"long",day:"numeric"})}</span>
      </div>

      {/* Main grid */}
      <div style={{flex:1,padding:"12px 16px 16px",display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(300px,1fr))",gap:12,overflow:"hidden",minHeight:0}}>

        {/* Alerts */}
        <Panel title="ALERTS -- CRITICAL AND TURN REQUIRED" count={alerts.length} color={alerts.length>0?C.danger:C.ok}>
          {alerts.length===0?(
            <div style={{textAlign:"center",padding:"40px 0",color:C.ok,fontFamily:F.mono,fontSize:13}}>All pipes within limits</div>
          ):alerts.map(p=>(<AlertRow key={p.id} pipe={p}/>))}
        </Panel>

        {/* Wear rates */}
        <Panel title="FASTEST WEARING PIPES" count={wearPipes.length} color={C.warn}>
          {wearPipes.length===0?(
            <div style={{textAlign:"center",padding:"40px 0",color:C.muted,fontFamily:F.mono,fontSize:13}}>Not enough data yet</div>
          ):wearPipes.map(({pipe},i)=>(<WearRow key={pipe.id} pipe={pipe} i={i}/>))}
        </Panel>

        {/* Inspection history */}
        <Panel title="INSPECTION HISTORY -- ALL PIPES" color={C.accent}>
          <div style={{display:"flex",gap:16,marginBottom:10,padding:"6px 8px",background:C.bg,borderRadius:8}}>
            {[["INSPECTED TODAY",pipes.filter(p=>p.lastInspected&&p.lastInspected.startsWith(today())).length,C.ok],
              ["THIS WEEK",pipes.filter(p=>{if(!p.lastInspected)return false;const d=(new Date()-new Date(p.lastInspected))/(1000*86400);return d<7;}).length,C.accent],
              ["OVERDUE",overdue.length,overdue.length>0?C.danger:C.muted],
              ["NEVER",pipes.filter(p=>!p.lastInspected).length,C.muted]].map(([lbl,n,col])=>(
              <div key={lbl} style={{flex:1,textAlign:"center"}}>
                <div style={{fontSize:20,fontWeight:800,color:col,fontFamily:F.mono,lineHeight:1}}>{n}</div>
                <div style={{fontSize:8,color:col,fontFamily:F.mono,letterSpacing:0.3,marginTop:2}}>{lbl}</div>
              </div>
            ))}
          </div>
          <div style={{fontSize:9,color:C.muted,fontFamily:F.mono,letterSpacing:1,marginBottom:6,paddingLeft:2}}>ALL PIPES -- MOST RECENTLY INSPECTED FIRST</div>
          {[...pipes].sort((a,b)=>{
            if(!a.lastInspected&&!b.lastInspected)return 0;
            if(!a.lastInspected)return 1;
            if(!b.lastInspected)return -1;
            return new Date(b.lastInspected)-new Date(a.lastInspected);
          }).map(p=>{
            const daysSince=p.lastInspected?Math.floor((new Date()-new Date(p.lastInspected))/(1000*86400)):null;
            const dCol=daysSince===null?C.muted:daysSince===0?C.ok:daysSince<7?C.accent:daysSince<14?C.warn:C.danger;
            const status=getStatus(p.nominalThickness,p.spots);
            return(
              <div key={p.id} style={{display:"flex",alignItems:"center",gap:8,padding:"7px 6px",borderBottom:"1px solid "+C.border+"55"}}>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:12,fontWeight:600,color:C.text,fontFamily:F.display,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{p.pipeName}</div>
                  <div style={{fontSize:9,color:C.muted,fontFamily:F.mono}}>{p.area} -- {p.diameter}</div>
                </div>
                <div style={{textAlign:"right",flexShrink:0}}>
                  <div style={{fontSize:12,fontWeight:700,color:dCol,fontFamily:F.mono}}>
                    {daysSince===null?"NEVER":daysSince===0?"TODAY":daysSince+"d ago"}
                  </div>
                  <div style={{fontSize:9,color:C.muted,fontFamily:F.mono}}>
                    {p.lastInspector?p.lastInspector:"--"}
                  </div>
                </div>
                <Badge status={status} small/>
              </div>
            );
          })}
        </Panel>


      </div>
    </div>
  );
}
