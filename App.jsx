import React, { useState, useRef, useEffect } from "react";

const C={bg:"#0a0e14",surface:"#111720",card:"#161e2a",border:"#1e2d3d",accent:"#00c9a7",warn:"#f59e0b",danger:"#ef4444",ok:"#22c55e",text:"#e2e8f0",muted:"#64748b",dim:"#94a3b8"};
const F={mono:"'JetBrains Mono','Courier New',monospace",sans:"'DM Sans',sans-serif",display:"'Barlow Condensed',sans-serif"};
const CLOCK=["12 oclock","3 oclock","6 oclock","9 oclock"];

function today(){return new Date().toISOString().split("T")[0];}
function getLoss(nom,val){return nom>0&&val!=null?((nom-val)/nom)*100:0;}
function allVals(spots){return(spots||[]).flatMap(s=>(s.readings||[]).filter(r=>r.value!=null).map(r=>r.value));}
function getMin(v){return v.length?Math.min(...v):null;}
function getStatus(nom,spots){const v=allVals(spots);if(!v.length)return"ok";const l=getLoss(nom,getMin(v));return l>=30?"critical":l>=15?"warning":"ok";}
function sCol(s){return s==="critical"?C.danger:s==="warning"?C.warn:C.ok;}

const SUPABASE_URL="https://skfmtshibkfpwgwxscql.supabase.co";
const SUPABASE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNrZm10c2hpYmtmcHdnd3hzY3FsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc0NDQ2OTIsImV4cCI6MjA5MzAyMDY5Mn0.uK3b45fOqPnICRTSaT8alkmmCn72qDsaUTy9z0MxA4Y";
const SBH={"apikey":SUPABASE_KEY,"Authorization":"Bearer "+SUPABASE_KEY,"Content-Type":"application/json"};
async function sbLoad(){try{const r=await fetch(SUPABASE_URL+"/rest/v1/pipes?select=*",{headers:SBH});const d=await r.json();return(d||[]).filter(x=>x.data&&x.data.id).map(x=>x.data);}catch{return[];}}
async function sbSave(pipe){try{await fetch(SUPABASE_URL+"/rest/v1/pipes",{method:"POST",headers:{...SBH,"Prefer":"resolution=merge-duplicates"},body:JSON.stringify({id:String(pipe.id),data:pipe,updated_at:new Date().toISOString()})});}catch{}}

const LS="pwt_field";
const LS_NAME="pwt_inspector";
function lsGet(fb){try{const v=localStorage.getItem(LS);return v?JSON.parse(v):fb;}catch{return fb;}}
function lsSet(v){try{localStorage.setItem(LS,JSON.stringify(v));}catch{}}
function lsGetName(){try{return localStorage.getItem(LS_NAME)||"";}catch{return "";}}
function lsSetName(n){try{localStorage.setItem(LS_NAME,n);}catch{}}

const SAMPLE=[
  {id:1,pipeName:"Main Feed Line A",area:"Plant North",location:"Section 3 Node 7",diameter:"DN 100",nominalThickness:12.7,unit:"mm",material:"Carbon Steel",welds:[{label:"Weld 1",metres:2.52,frac:0.42}],turnsCount:1,turnHistory:[{date:"2026-03-15",bottomPosition:"6 oclock",turnNumber:1}],changeoutHistory:[],photos:[],
    spots:[{id:11,name:"Inlet 12 oclock",axialLabel:"Inlet stub",circumLabel:"12 oclock",weldFrac:undefined,readings:[{value:12.1,date:"2026-04-01"},{value:11.8,date:"2026-04-15"}]},{id:12,name:"Inlet 3 oclock",axialLabel:"Inlet stub",circumLabel:"3 oclock",weldFrac:undefined,readings:[{value:12.3,date:"2026-04-01"},{value:12.0,date:"2026-04-15"}]},{id:13,name:"Inlet 6 oclock",axialLabel:"Inlet stub",circumLabel:"6 oclock",weldFrac:undefined,readings:[{value:11.9,date:"2026-04-01"},{value:11.5,date:"2026-04-15"}]},{id:14,name:"Inlet 9 oclock",axialLabel:"Inlet stub",circumLabel:"9 oclock",weldFrac:undefined,readings:[{value:12.0,date:"2026-04-01"},{value:11.7,date:"2026-04-15"}]},{id:15,name:"Weld 1 12 oclock",axialLabel:"Weld 1",circumLabel:"12 oclock",weldFrac:0.42,readings:[{value:11.5,date:"2026-04-01"},{value:11.1,date:"2026-04-15"}]},{id:16,name:"Weld 1 6 oclock",axialLabel:"Weld 1",circumLabel:"6 oclock",weldFrac:0.42,readings:[{value:11.3,date:"2026-04-01"},{value:10.9,date:"2026-04-15"}]},{id:17,name:"Outlet 12 oclock",axialLabel:"Outlet stub",circumLabel:"12 oclock",weldFrac:undefined,readings:[{value:12.0,date:"2026-04-01"},{value:11.6,date:"2026-04-15"}]},{id:18,name:"Outlet 6 oclock",axialLabel:"Outlet stub",circumLabel:"6 oclock",weldFrac:undefined,readings:[{value:11.8,date:"2026-04-01"},{value:11.4,date:"2026-04-15"}]}]},
  {id:2,pipeName:"Cooling Return",area:"Utility Block",location:"Section 5 Node 11",diameter:"DN 50",nominalThickness:7.0,unit:"mm",material:"Carbon Steel",welds:[],turnsCount:0,turnHistory:[],changeoutHistory:[],photos:[],
    spots:[{id:21,name:"Inlet 12 oclock",axialLabel:"Inlet stub",circumLabel:"12 oclock",weldFrac:undefined,readings:[{value:5.2,date:"2026-04-10"},{value:5.0,date:"2026-04-20"}]},{id:22,name:"Inlet 6 oclock",axialLabel:"Inlet stub",circumLabel:"6 oclock",weldFrac:undefined,readings:[{value:5.0,date:"2026-04-10"},{value:4.8,date:"2026-04-20"}]},{id:23,name:"Outlet 12 oclock",axialLabel:"Outlet stub",circumLabel:"12 oclock",weldFrac:undefined,readings:[{value:4.9,date:"2026-04-10"},{value:4.6,date:"2026-04-20"}]},{id:24,name:"Outlet 6 oclock",axialLabel:"Outlet stub",circumLabel:"6 oclock",weldFrac:undefined,readings:[{value:4.8,date:"2026-04-10"},{value:4.5,date:"2026-04-20"}]}]},
  {id:3,pipeName:"Steam Supply",area:"Plant North",location:"Section 2 Node 4",diameter:"DN 150",nominalThickness:15.0,unit:"mm",material:"Chrome-Moly",welds:[],turnsCount:0,turnHistory:[],changeoutHistory:[],photos:[],
    spots:[{id:31,name:"Inlet 12 oclock",axialLabel:"Inlet stub",circumLabel:"12 oclock",weldFrac:undefined,readings:[{value:14.8,date:"2026-04-22"}]},{id:32,name:"Inlet 6 oclock",axialLabel:"Inlet stub",circumLabel:"6 oclock",weldFrac:undefined,readings:[{value:15.0,date:"2026-04-22"}]},{id:33,name:"Outlet 12 oclock",axialLabel:"Outlet stub",circumLabel:"12 oclock",weldFrac:undefined,readings:[{value:14.9,date:"2026-04-22"}]},{id:34,name:"Outlet 6 oclock",axialLabel:"Outlet stub",circumLabel:"6 oclock",weldFrac:undefined,readings:[{value:14.7,date:"2026-04-22"}]}]},
  {id:5,pipeName:"HDPE Main 560 SDR11",area:"Plant North",location:"Section 4 Node 8",diameter:"OD 560mm",od:560,nominalThickness:50.9,unit:"mm",material:"HDPE",sdr:"SDR 11",welds:[{label:"Weld 1",metres:4.5,frac:0.5}],turnsCount:2,turnHistory:[{date:"2026-02-10",bottomPosition:"3 oclock",turnNumber:1},{date:"2026-03-20",bottomPosition:"9 oclock",turnNumber:2}],changeoutHistory:[],photos:[],lastInspected:"2026-04-29T07:30:00Z",lastInspector:"John H",
    spots:[
      {id:51,name:"Inlet 12 oclock",axialLabel:"Inlet stub",circumLabel:"12 oclock",weldFrac:undefined,readings:[{value:50.9,date:"2026-01-10"},{value:49.2,date:"2026-02-10"},{value:47.8,date:"2026-03-20"},{value:46.1,date:"2026-04-29"}]},
      {id:52,name:"Inlet 3 oclock",axialLabel:"Inlet stub",circumLabel:"3 oclock",weldFrac:undefined,readings:[{value:50.9,date:"2026-01-10"},{value:49.5,date:"2026-02-10"},{value:48.2,date:"2026-03-20"},{value:46.8,date:"2026-04-29"}]},
      {id:53,name:"Inlet 6 oclock",axialLabel:"Inlet stub",circumLabel:"6 oclock",weldFrac:undefined,readings:[{value:50.9,date:"2026-01-10"},{value:48.1,date:"2026-02-10"},{value:45.3,date:"2026-03-20"},{value:42.4,date:"2026-04-29"}]},
      {id:54,name:"Inlet 9 oclock",axialLabel:"Inlet stub",circumLabel:"9 oclock",weldFrac:undefined,readings:[{value:50.9,date:"2026-01-10"},{value:49.8,date:"2026-02-10"},{value:48.9,date:"2026-03-20"},{value:47.5,date:"2026-04-29"}]},
      {id:55,name:"Weld 1 12 oclock",axialLabel:"Weld 1",circumLabel:"12 oclock",weldFrac:0.5,readings:[{value:50.9,date:"2026-01-10"},{value:47.5,date:"2026-02-10"},{value:44.2,date:"2026-03-20"},{value:40.8,date:"2026-04-29"}]},
      {id:56,name:"Weld 1 6 oclock",axialLabel:"Weld 1",circumLabel:"6 oclock",weldFrac:0.5,readings:[{value:50.9,date:"2026-01-10"},{value:46.2,date:"2026-02-10"},{value:42.1,date:"2026-03-20"},{value:38.5,date:"2026-04-29"}]},
      {id:57,name:"Outlet 12 oclock",axialLabel:"Outlet stub",circumLabel:"12 oclock",weldFrac:undefined,readings:[{value:50.9,date:"2026-01-10"},{value:49.1,date:"2026-02-10"},{value:47.4,date:"2026-03-20"},{value:45.6,date:"2026-04-29"}]},
      {id:58,name:"Outlet 6 oclock",axialLabel:"Outlet stub",circumLabel:"6 oclock",weldFrac:undefined,readings:[{value:50.9,date:"2026-01-10"},{value:48.3,date:"2026-02-10"},{value:46.0,date:"2026-03-20"},{value:43.7,date:"2026-04-29"}]},
    ]},
  {id:4,pipeName:"Bypass Header",area:"Plant South",location:"Section 1 Node 2",diameter:"DN 80",nominalThickness:9.5,unit:"mm",material:"Stainless 316",welds:[],turnsCount:0,turnHistory:[],changeoutHistory:[],photos:[],
    spots:[{id:41,name:"Inlet 12 oclock",axialLabel:"Inlet stub",circumLabel:"12 oclock",weldFrac:undefined,readings:[{value:9.4,date:"2026-04-15"},{value:9.3,date:"2026-04-29"}]},{id:42,name:"Inlet 6 oclock",axialLabel:"Inlet stub",circumLabel:"6 oclock",weldFrac:undefined,readings:[{value:9.5,date:"2026-04-15"},{value:9.2,date:"2026-04-29"}]},{id:43,name:"Outlet 12 oclock",axialLabel:"Outlet stub",circumLabel:"12 oclock",weldFrac:undefined,readings:[{value:9.3,date:"2026-04-15"},{value:9.1,date:"2026-04-29"}]},{id:44,name:"Outlet 6 oclock",axialLabel:"Outlet stub",circumLabel:"6 oclock",weldFrac:undefined,readings:[{value:9.2,date:"2026-04-15"},{value:9.0,date:"2026-04-29"}]}]},
];

function SyncBar({online,pending,syncing,inspector}){
  const col=!online?C.warn:pending>0?C.warn:C.ok;
  const msg=syncing?"SYNCING...":!online?"OFFLINE -- "+pending+" change"+(pending!==1?"s":"")+" queued":pending>0?pending+" uploading...":"SYNCED";
  const[pulse,setPulse]=useState(false);
  useEffect(()=>{
    if(!online||pending>0){const t=setInterval(()=>setPulse(p=>!p),800);return()=>clearInterval(t);}
    setPulse(false);
  },[online,pending]);
  return(
    <div style={{background:"#0d1520",borderBottom:"1px solid #1e2d3d",padding:"4px 16px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
      <div style={{display:"flex",alignItems:"center",gap:6}}>
        <div style={{width:6,height:6,borderRadius:"50%",background:col,transition:"opacity 0.4s",opacity:pulse?0.3:1,boxShadow:online&&!pending?"0 0 5px "+col:"none"}}/>
        <span style={{fontSize:9,color:col,fontFamily:F.mono,letterSpacing:0.5}}>{msg}</span>
      </div>
      {inspector&&<span style={{fontSize:9,color:C.muted,fontFamily:F.mono}}>{inspector}</span>}
    </div>
  );
}

function InspectorNamePrompt({onSet}){
  const[name,setName]=useState("");
  return(
    <div style={{position:"fixed",inset:0,background:C.bg,zIndex:300,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"32px 24px"}}>
      <link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;700;800&family=DM+Sans:wght@400;600;700&family=JetBrains+Mono:wght@400;700&display=swap" rel="stylesheet"/>
      <div style={{fontSize:11,color:C.accent,fontFamily:F.mono,letterSpacing:2,marginBottom:8}}>FIELD INSPECTION APP</div>
      <div style={{fontSize:32,fontWeight:800,fontFamily:F.display,marginBottom:8,letterSpacing:0.5,textAlign:"center"}}>WHO ARE YOU?</div>
      <div style={{fontSize:14,color:C.muted,fontFamily:F.mono,marginBottom:32,textAlign:"center"}}>Your name will be recorded with every reading you take.</div>
      <input value={name} onChange={e=>setName(e.target.value)}
        onKeyDown={e=>e.key==="Enter"&&name.trim()&&onSet(name.trim())}
        placeholder="Enter your name..."
        autoFocus
        style={{width:"100%",maxWidth:360,background:C.card,border:"2px solid "+C.accent,borderRadius:12,
          padding:"16px 18px",color:C.text,fontFamily:F.sans,fontSize:18,outline:"none",
          boxSizing:"border-box",marginBottom:16,textAlign:"center"}}/>
      <button onClick={()=>name.trim()&&onSet(name.trim())} disabled={!name.trim()}
        style={{width:"100%",maxWidth:360,padding:"16px",background:name.trim()?C.accent:C.border,
          border:"none",color:name.trim()?"#000":C.muted,borderRadius:12,fontSize:18,fontWeight:800,
          fontFamily:F.display,cursor:name.trim()?"pointer":"not-allowed",letterSpacing:1}}>
        START INSPECTING
      </button>
    </div>
  );
}

function Badge({status}){
  const col=sCol(status);
  const lbl=status==="critical"?"CRITICAL":status==="warning"?"TURN REQ":"GOOD";
  return(<span style={{background:col+"22",color:col,border:"1px solid "+col+"44",borderRadius:4,padding:"2px 8px",fontSize:10,fontFamily:F.mono,fontWeight:700,letterSpacing:1}}>{lbl}</span>);
}


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
  const safeLimit=8.0;

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
        P = (20 x MRS x C) / (SDR_eff - 1) x f_temp -- MRS=10MPa (PE100), C=0.8, SDR_eff=OD/measured wall. Safe limit = 8.0 bar (fixed). ISO 4427-1.
      </div>
    </div>
  );
}

// -- Quick Turn screen --------------------------------------------------------
function QuickTurnScreen({pipe,onBack,onSave,inspector}){
  const[turnPos,setTurnPos]=useState("");
  const[overrideAll,setOverrideAll]=useState(false);

  // Work out which positions have already been at the bottom
  const usedPositions=new Set((pipe.turnHistory||[]).map(t=>t.bottomPosition).filter(Boolean));
  const currentBottom=pipe.turnHistory&&pipe.turnHistory.length?pipe.turnHistory[pipe.turnHistory.length-1].bottomPosition:null;
  // Available = all 4 minus ones already used (and not the current bottom either)
  const available=CLOCK.filter(p=>!usedPositions.has(p));
  const allUsed=available.length===0;
  // What to show: if all used and override not triggered, show warning. Otherwise show available (or all if override)
  const showPositions=overrideAll?CLOCK:available;

  function doTurn(){
    if(!turnPos)return;
    const entry={date:today(),bottomPosition:turnPos,turnNumber:(pipe.turnsCount||0)+1,inspector:inspector||""};
    onSave({...pipe,turnsCount:(pipe.turnsCount||0)+1,turnHistory:[...(pipe.turnHistory||[]),entry],lastInspected:new Date().toISOString(),lastInspector:inspector||""});
  }
  return(
    <div style={{minHeight:"100vh",background:C.bg,color:C.text,fontFamily:F.sans,maxWidth:480,margin:"0 auto",display:"flex",flexDirection:"column"}}>
      <link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;700;800&family=DM+Sans:wght@400;600;700&family=JetBrains+Mono:wght@400;700&display=swap" rel="stylesheet"/>
      <div style={{background:C.surface,borderBottom:"1px solid "+C.border,padding:"12px 16px",display:"flex",alignItems:"center",gap:10}}>
        <button onClick={onBack} style={{background:"transparent",border:"none",color:C.muted,fontSize:13,fontFamily:F.mono,cursor:"pointer",padding:0}}>BACK</button>
        <span style={{fontSize:14,color:C.muted,fontFamily:F.mono}}>/</span>
        <span style={{fontSize:14,fontWeight:700,color:C.text,fontFamily:F.display}}>{pipe.pipeName}</span>
      </div>
      <div style={{flex:1,display:"flex",flexDirection:"column",justifyContent:"center",padding:"24px 20px",overflowY:"auto"}}>
        <div style={{fontSize:11,color:C.accent,fontFamily:F.mono,letterSpacing:2,marginBottom:8}}>MARK PIPE TURN</div>
        <div style={{fontSize:28,fontWeight:800,fontFamily:F.display,marginBottom:4}}>{pipe.pipeName}</div>
        <div style={{fontSize:12,color:C.muted,fontFamily:F.mono,marginBottom:12}}>{pipe.area} -- {pipe.diameter}</div>

        {/* Turn history summary */}
        {currentBottom&&(
          <div style={{background:C.accent+"15",border:"1px solid "+C.accent+"33",borderRadius:8,padding:"8px 12px",marginBottom:12,fontSize:11,fontFamily:F.mono,color:C.accent}}>
            Turn {pipe.turnsCount} -- Current bottom: {currentBottom}
          </div>
        )}

        {/* Positions already used */}
        {usedPositions.size>0&&(
          <div style={{marginBottom:16}}>
            <div style={{fontSize:9,color:C.muted,fontFamily:F.mono,letterSpacing:0.5,marginBottom:6}}>POSITIONS ALREADY USED AS BOTTOM</div>
            <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
              {CLOCK.map(pos=>usedPositions.has(pos)&&(
                <span key={pos} style={{background:C.border,borderRadius:6,padding:"4px 10px",fontSize:10,fontFamily:F.mono,color:C.muted,textDecoration:"line-through"}}>{pos}</span>
              ))}
            </div>
          </div>
        )}

        {/* All positions used warning */}
        {allUsed&&!overrideAll&&(
          <div style={{background:C.danger+"18",border:"2px solid "+C.danger+"66",borderRadius:12,padding:16,marginBottom:20}}>
            <div style={{fontSize:14,fontWeight:800,color:C.danger,fontFamily:F.display,marginBottom:6,letterSpacing:0.5}}>ALL POSITIONS HAVE BEEN AT THE BOTTOM</div>
            <div style={{fontSize:12,color:C.dim,fontFamily:F.mono,marginBottom:12}}>This pipe has been through all 4 clock positions. It should be changed out rather than rotated again.</div>
            <button onClick={onBack}
              style={{width:"100%",padding:"14px",background:C.danger,border:"none",color:"#fff",borderRadius:10,fontSize:15,fontWeight:800,fontFamily:F.display,cursor:"pointer",letterSpacing:1,marginBottom:8}}>
              GO BACK -- ARRANGE CHANGEOUT
            </button>
            <button onClick={()=>setOverrideAll(true)}
              style={{width:"100%",padding:"12px",background:"transparent",border:"1px solid "+C.border,color:C.muted,borderRadius:10,fontSize:12,fontFamily:F.mono,cursor:"pointer"}}>
              IGNORE AND ROTATE ANYWAY
            </button>
          </div>
        )}

        {/* Position picker -- only shown when positions available or override active */}
        {(!allUsed||overrideAll)&&(<>
          {overrideAll&&(
            <div style={{background:C.warn+"15",border:"1px solid "+C.warn+"44",borderRadius:8,padding:"8px 12px",marginBottom:12,fontSize:10,fontFamily:F.mono,color:C.warn}}>
              Override active -- showing all positions including previously used ones
            </div>
          )}
          <div style={{fontSize:14,color:C.muted,fontFamily:F.mono,marginBottom:16}}>Which position will be at the BOTTOM after rotation?</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:24}}>
            {showPositions.map(pos=>(
              <button key={pos} onClick={()=>setTurnPos(pos)}
                style={{padding:"22px 12px",borderRadius:14,cursor:"pointer",fontFamily:F.mono,fontSize:15,fontWeight:700,
                  border:"2px solid "+(turnPos===pos?C.accent:C.border),
                  background:turnPos===pos?C.accent+"22":C.card,
                  color:turnPos===pos?C.accent:C.muted,transition:"all 0.15s"}}>
                {pos}
              </button>
            ))}
          </div>
          {turnPos&&(
            <div style={{background:C.accent+"15",border:"1px solid "+C.accent+"44",borderRadius:10,padding:"12px 16px",marginBottom:20,fontSize:13,color:C.accent,fontFamily:F.mono}}>
              After rotation: {turnPos} will be at the bottom
            </div>
          )}
          <button onClick={doTurn} disabled={!turnPos}
            style={{width:"100%",padding:"18px",background:turnPos?C.accent:C.border,border:"none",color:turnPos?"#000":C.muted,borderRadius:14,fontSize:18,fontWeight:800,fontFamily:F.display,cursor:turnPos?"pointer":"not-allowed",letterSpacing:1,marginBottom:10}}>
            CONFIRM TURN #{(pipe.turnsCount||0)+1}
          </button>
        </>)}

        <button onClick={onBack} style={{width:"100%",padding:"14px",background:"transparent",border:"1px solid "+C.border,color:C.muted,borderRadius:14,fontSize:14,fontFamily:F.mono,cursor:"pointer"}}>CANCEL</button>
      </div>
    </div>
  );
}

// -- Quick Changeout screen ---------------------------------------------------
function QuickChangeoutScreen({pipe,onBack,onSave,inspector}){
  const[note,setNote]=useState("");
  const[confirm,setConfirm]=useState(false);
  function doChangeout(){
    const archive={date:today(),notes:note,inspector:inspector||"",spots:pipe.spots.map(s=>({...s,readings:[...(s.readings||[])]}))};
    onSave({...pipe,
      spots:pipe.spots.map(s=>({...s,readings:[]})),
      changeoutHistory:[...(pipe.changeoutHistory||[]),archive],
      lastInspected:new Date().toISOString(),
      lastInspector:inspector||""
    });
  }
  return(
    <div style={{minHeight:"100vh",background:C.bg,color:C.text,fontFamily:F.sans,maxWidth:480,margin:"0 auto",display:"flex",flexDirection:"column"}}>
      <link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;700;800&family=DM+Sans:wght@400;600;700&family=JetBrains+Mono:wght@400;700&display=swap" rel="stylesheet"/>
      <div style={{background:C.surface,borderBottom:"1px solid "+C.border,padding:"12px 16px",display:"flex",alignItems:"center",gap:10}}>
        <button onClick={onBack} style={{background:"transparent",border:"none",color:C.muted,fontSize:13,fontFamily:F.mono,cursor:"pointer",padding:0}}>BACK</button>
        <span style={{fontSize:14,color:C.muted,fontFamily:F.mono}}>/</span>
        <span style={{fontSize:14,fontWeight:700,color:C.text,fontFamily:F.display}}>{pipe.pipeName}</span>
      </div>
      <div style={{flex:1,display:"flex",flexDirection:"column",justifyContent:"center",padding:"24px 20px"}}>
        <div style={{fontSize:11,color:C.warn,fontFamily:F.mono,letterSpacing:2,marginBottom:8}}>PIPE CHANGEOUT</div>
        <div style={{fontSize:28,fontWeight:800,fontFamily:F.display,marginBottom:4}}>{pipe.pipeName}</div>
        <div style={{fontSize:12,color:C.muted,fontFamily:F.mono,marginBottom:20}}>{pipe.area} -- {pipe.diameter}</div>
        <div style={{background:C.warn+"11",border:"1px solid "+C.warn+"33",borderRadius:10,padding:"12px 14px",marginBottom:20}}>
          <div style={{fontSize:12,fontWeight:700,color:C.warn,fontFamily:F.mono,marginBottom:4}}>THIS WILL ARCHIVE ALL CURRENT READINGS</div>
          <div style={{fontSize:11,color:C.dim,fontFamily:F.mono}}>All {(pipe.spots||[]).reduce((a,s)=>a+(s.readings||[]).filter(r=>r.value!=null).length,0)} readings will be archived. The pipe record stays with fresh spots ready for the new spool.</div>
        </div>
        <div style={{fontSize:10,color:C.muted,fontFamily:F.mono,letterSpacing:0.5,marginBottom:6}}>REASON FOR CHANGEOUT</div>
        <textarea value={note} onChange={e=>setNote(e.target.value)} rows={3}
          placeholder="e.g. Below minimum thickness, scheduled replacement..."
          style={{width:"100%",background:C.card,border:"1px solid "+C.border,borderRadius:10,padding:"12px 14px",color:C.text,fontFamily:F.sans,fontSize:14,resize:"none",outline:"none",boxSizing:"border-box",marginBottom:16}}/>
        {!confirm?(
          <button onClick={()=>setConfirm(true)}
            style={{width:"100%",padding:"18px",background:C.warn,border:"none",color:"#000",borderRadius:14,fontSize:18,fontWeight:800,fontFamily:F.display,cursor:"pointer",letterSpacing:1,marginBottom:10}}>
            MARK AS CHANGED OUT
          </button>
        ):(
          <div style={{background:C.danger+"11",border:"1px solid "+C.danger+"44",borderRadius:12,padding:16,marginBottom:10}}>
            <div style={{fontSize:13,color:C.danger,fontFamily:F.mono,fontWeight:700,marginBottom:12}}>Are you sure? This cannot be undone from the field app.</div>
            <div style={{display:"flex",gap:8}}>
              <button onClick={doChangeout} style={{flex:1,padding:"14px",background:C.danger,border:"none",color:"#fff",borderRadius:10,fontSize:15,fontWeight:800,fontFamily:F.display,cursor:"pointer",letterSpacing:1}}>YES, CONFIRM</button>
              <button onClick={()=>setConfirm(false)} style={{flex:1,padding:"14px",background:"transparent",border:"1px solid "+C.border,color:C.muted,borderRadius:10,fontSize:14,fontFamily:F.mono,cursor:"pointer"}}>CANCEL</button>
            </div>
          </div>
        )}
        <button onClick={onBack} style={{width:"100%",padding:"14px",background:"transparent",border:"1px solid "+C.border,color:C.muted,borderRadius:14,fontSize:14,fontFamily:F.mono,cursor:"pointer"}}>BACK TO PIPES</button>
      </div>
    </div>
  );
}

function PipeList({pipes,onSelect,onScan,online,pending,syncing,inspector,onQuickTurn,onQuickChangeout}){
  const[search,setSearch]=useState("");
  const[area,setArea]=useState("all");
  const areas=[...new Set(pipes.map(p=>p.area).filter(Boolean))].sort();
  const filtered=pipes.filter(p=>{
    const q=search.toLowerCase();
    return(p.pipeName.toLowerCase().includes(q)||(p.area||"").toLowerCase().includes(q)||(p.location||"").toLowerCase().includes(q))&&(area==="all"||p.area===area);
  });
  return(
    <div style={{minHeight:"100vh",background:C.bg,color:C.text,fontFamily:F.sans,maxWidth:480,margin:"0 auto"}}>
      <link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;700;800&family=DM+Sans:wght@400;600;700&family=JetBrains+Mono:wght@400;700&display=swap" rel="stylesheet"/>
      <SyncBar online={online} pending={pending} syncing={syncing} inspector={inspector}/>
      <div style={{background:"linear-gradient(180deg,"+C.surface+","+C.bg+")",padding:"20px 16px 14px",borderBottom:"1px solid "+C.border}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
          <div>
            <div style={{fontSize:11,color:C.accent,fontFamily:F.mono,letterSpacing:2,marginBottom:2}}>FIELD INSPECTION</div>
            <div style={{fontSize:26,fontWeight:800,fontFamily:F.display,lineHeight:1,letterSpacing:0.5}}>SELECT PIPE</div>
          </div>
          <button onClick={onScan} style={{background:C.accent,border:"none",color:"#000",borderRadius:12,padding:"10px 16px",fontFamily:F.mono,fontSize:11,fontWeight:700,cursor:"pointer",letterSpacing:1}}>SCAN QR</button>
        </div>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search pipe name, area..."
          style={{width:"100%",background:C.card,border:"1px solid "+C.border,borderRadius:10,padding:"10px 14px",color:C.text,fontFamily:F.sans,fontSize:14,outline:"none",boxSizing:"border-box",marginBottom:10}}/>
        <div style={{display:"flex",gap:6,overflowX:"auto",paddingBottom:2}}>
          {["all",...areas].map(a=>(<button key={a} onClick={()=>setArea(a)} style={{flexShrink:0,padding:"4px 12px",borderRadius:20,border:"1px solid "+(area===a?C.accent:C.border),background:area===a?C.accent+"22":C.card,color:area===a?C.accent:C.muted,fontSize:11,fontFamily:F.mono,cursor:"pointer",whiteSpace:"nowrap"}}>{a==="all"?"ALL":a}</button>))}
        </div>
      </div>
      <div style={{padding:"12px 16px 100px"}}>
        {filtered.length===0&&<div style={{textAlign:"center",padding:40,color:C.muted,fontFamily:F.mono,fontSize:13}}>NO PIPES FOUND</div>}
        {filtered.map(pipe=>{
          const status=getStatus(pipe.nominalThickness,pipe.spots);
          const minR=getMin(allVals(pipe.spots));
          const bc=sCol(status);
          const spotsToday=(pipe.spots||[]).filter(s=>(s.readings||[]).some(r=>r.date===today())).length;
          const total=(pipe.spots||[]).length;
          const prog=total>0?spotsToday/total:0;
          return(
            <div key={pipe.id} style={{background:C.card,border:"1px solid "+bc+"44",borderRadius:14,padding:16,marginBottom:10,boxShadow:status==="critical"?"0 0 16px "+C.danger+"22":"none"}}>
              <div onClick={()=>onSelect(pipe)} style={{cursor:"pointer"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:16,fontWeight:700,color:C.text,fontFamily:F.display,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",letterSpacing:0.3}}>{pipe.pipeName}</div>
                  <div style={{fontSize:11,color:C.muted,fontFamily:F.mono,marginTop:2}}>{pipe.area&&<span style={{color:C.accent+"cc",marginRight:6}}>{pipe.area}</span>}{pipe.location}</div>
                </div>
                <Badge status={status}/>
              </div>
              {/* Material badge */}
              <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:8}}>
                <span style={{fontSize:10,fontFamily:F.mono,fontWeight:700,color:pipe.material==="HDPE"?C.ok:C.accent,background:(pipe.material==="HDPE"?C.ok:C.accent)+"18",border:"1px solid "+(pipe.material==="HDPE"?C.ok:C.accent)+"44",borderRadius:5,padding:"2px 8px"}}>
                  {pipe.material||"Unknown"}
                </span>
                {pipe.sdr&&<span style={{fontSize:10,fontFamily:F.mono,color:C.muted,background:C.border+"66",borderRadius:5,padding:"2px 8px"}}>{pipe.sdr}</span>}
                {pipe.lined&&pipe.liningMaterial&&<span style={{fontSize:10,fontFamily:F.mono,color:C.warn,background:C.warn+"18",border:"1px solid "+C.warn+"33",borderRadius:5,padding:"2px 8px"}}>{pipe.liningMaterial} lined</span>}
                {pipe.pipeType==="bend"&&<span style={{fontSize:10,fontFamily:F.mono,color:C.muted,background:C.border+"66",borderRadius:5,padding:"2px 8px"}}>{pipe.bendAngle||"90"} deg bend</span>}
              </div>
              <div style={{display:"flex",gap:16,marginBottom:10}}>
                <div><div style={{fontSize:9,color:C.muted,fontFamily:F.mono,letterSpacing:0.5}}>DIAMETER</div><div style={{fontSize:13,fontWeight:700,color:C.dim,fontFamily:F.mono}}>{pipe.diameter||"--"}</div></div>
                <div><div style={{fontSize:9,color:C.muted,fontFamily:F.mono,letterSpacing:0.5}}>NOMINAL WT</div><div style={{fontSize:13,fontWeight:700,color:C.dim,fontFamily:F.mono}}>{pipe.nominalThickness}{pipe.unit}</div></div>
                <div><div style={{fontSize:9,color:C.muted,fontFamily:F.mono,letterSpacing:0.5}}>MIN READING</div><div style={{fontSize:20,fontWeight:800,color:bc,fontFamily:F.mono}}>{minR!=null?minR.toFixed(1):"--"}<span style={{fontSize:9,marginLeft:2}}>{pipe.unit}</span></div></div>
              </div>
              <div>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}><span style={{fontSize:9,color:C.muted,fontFamily:F.mono}}>TODAY</span><span style={{fontSize:9,color:prog===1?C.ok:C.muted,fontFamily:F.mono,fontWeight:prog===1?700:400}}>{spotsToday}/{total} spots{prog===1?" -- DONE":""}</span></div>
                <div style={{background:C.border,borderRadius:4,height:5,overflow:"hidden"}}><div style={{width:(prog*100)+"%",height:"100%",background:prog===1?C.ok:C.accent,borderRadius:4,transition:"width 0.4s"}}/></div>
              </div>
              <div style={{marginTop:8,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                {pipe.lastInspected?(
                  <span style={{fontSize:9,color:C.muted,fontFamily:F.mono}}>
                    {pipe.lastInspector?" "+pipe.lastInspector+" -- ":""}
                    {new Date(pipe.lastInspected).toLocaleDateString()}
                  </span>
                ):<span style={{fontSize:9,color:C.muted,fontFamily:F.mono}}>Not yet inspected</span>}
                <span style={{fontSize:10,color:C.accent,fontFamily:F.mono,letterSpacing:0.5}}>TAP TO MEASURE</span>
              </div>
              {/* Current bottom position */}
              {pipe.turnsCount>0&&pipe.turnHistory&&pipe.turnHistory.length>0&&(
                <div style={{marginTop:6,display:"flex",alignItems:"center",gap:6,padding:"5px 10px",background:C.accent+"0d",border:"1px solid "+C.accent+"33",borderRadius:8}}>
                  <div style={{width:8,height:8,borderRadius:"50%",background:C.accent,flexShrink:0}}/>
                  <span style={{fontSize:10,color:C.accent,fontFamily:F.mono,fontWeight:700}}>
                    CURRENT BOTTOM: {pipe.turnHistory[pipe.turnHistory.length-1].bottomPosition}
                  </span>
                  <span style={{fontSize:9,color:C.muted,fontFamily:F.mono,marginLeft:4}}>
                    (turn {pipe.turnsCount})
                  </span>
                </div>
              )}
              </div>
              {/* Quick action buttons */}
              <div style={{display:"flex",gap:6,marginTop:8}}>
                <button onClick={()=>onQuickTurn(pipe)}
                  style={{flex:1,padding:"8px 6px",background:C.accent+"18",border:"1px solid "+C.accent+"44",color:C.accent,borderRadius:8,fontSize:11,fontFamily:F.mono,fontWeight:700,cursor:"pointer"}}>
                  MARK TURNED
                </button>
                <button onClick={()=>onQuickChangeout(pipe)}
                  style={{flex:1,padding:"8px 6px",background:C.warn+"18",border:"1px solid "+C.warn+"44",color:C.warn,borderRadius:8,fontSize:11,fontFamily:F.mono,fontWeight:700,cursor:"pointer"}}>
                  CHANGED OUT
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function MeasureScreen({pipe,onBack,onSave,inspector}){
  const ordered=[
    ...(pipe.spots||[]).filter(s=>s.axialLabel==="Inlet stub"),
    ...(pipe.spots||[]).filter(s=>s.axialLabel!=="Inlet stub"&&s.axialLabel!=="Outlet stub").sort((a,b)=>(a.weldFrac||0.5)-(b.weldFrac||0.5)),
    ...(pipe.spots||[]).filter(s=>s.axialLabel==="Outlet stub"),
  ];
  const[idx,setIdx]=useState(0);
  const[vals,setVals]=useState(ordered.map(()=>""));
  const[nas,setNas]=useState(ordered.map(()=>false));
  const[skips,setSkips]=useState(ordered.map(()=>false));
  const[photos,setPhotos]=useState(ordered.map(()=>[]));
  const[phase,setPhase]=useState("measure");
  const[turnPos,setTurnPos]=useState("");
  const[sessionNote,setSessionNote]=useState("");
  const[confirmBack,setConfirmBack]=useState(false);
  const inputRef=useRef();
  const photoRef=useRef();
  useEffect(()=>{
    if(phase==="measure"&&inputRef.current){
      // Small timeout ensures keyboard reliably opens on mobile
      const t=setTimeout(()=>{if(inputRef.current)inputRef.current.focus();},80);
      return()=>clearTimeout(t);
    }
  },[idx,phase]);
  const spot=ordered[idx];
  const lastR=(spot?.readings||[]).filter(r=>r.value!=null).slice(-1)[0];
  const lastVal=lastR?lastR.value:null;
  const newVal=parseFloat(vals[idx]);
  const newLoss=!isNaN(newVal)&&newVal>0?getLoss(pipe.nominalThickness,newVal):null;
  const newCol=newLoss==null?C.muted:newLoss>=30?C.danger:newLoss>=15?C.warn:C.ok;
  const canNext=nas[idx]||skips[idx]||(!isNaN(parseFloat(vals[idx]))&&parseFloat(vals[idx])>0);
  function advance(){if(idx<ordered.length-1)setIdx(idx+1);else setPhase("summary");}
  function toggleNa(){const a=[...nas];a[idx]=!a[idx];setNas(a);}
  function doSave(){
    const dt=today();
    const updated=pipe.spots.map(sp=>{
      const i=ordered.findIndex(o=>o.id===sp.id);
      if(i===-1||nas[i])return sp;
      const v=parseFloat(vals[i]);
      if(isNaN(v)||v<=0)return sp;
      const newPhotos=photos[i]&&photos[i].length?photos[i]:undefined;
      return{...sp,
        readings:[...(sp.readings||[]),{value:v,date:dt,inspector:inspector||undefined,note:sessionNote||undefined}],
        photos:newPhotos?[...(sp.photos||[]),...newPhotos]:(sp.photos||[])};
    });
    const pipeNote=sessionNote?{date:dt,note:sessionNote}:null;
    onSave({...pipe,spots:updated,lastInspected:new Date().toISOString(),lastInspector:inspector||"",notes:pipeNote?((pipe.notes||"")+( pipe.notes?String.fromCharCode(10):"")+dt+": "+sessionNote):(pipe.notes||"")});
  }
  function doTurn(){
    if(!turnPos)return;
    onSave({...pipe,turnsCount:(pipe.turnsCount||0)+1,turnHistory:[...(pipe.turnHistory||[]),{date:today(),bottomPosition:turnPos,turnNumber:(pipe.turnsCount||0)+1}]});
    setPhase("measure");
  }
  const status=getStatus(pipe.nominalThickness,pipe.spots);

  if(phase==="turn")return(
    <div style={{minHeight:"100vh",background:C.bg,color:C.text,fontFamily:F.sans,maxWidth:480,margin:"0 auto",display:"flex",flexDirection:"column"}}>
      <link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;700;800&family=DM+Sans:wght@400;600;700&family=JetBrains+Mono:wght@400;700&display=swap" rel="stylesheet"/>
      <div style={{flex:1,display:"flex",flexDirection:"column",justifyContent:"center",padding:"24px 20px"}}>
        <div style={{fontSize:11,color:C.accent,fontFamily:F.mono,letterSpacing:2,marginBottom:8}}>MARK PIPE TURN</div>
        <div style={{fontSize:28,fontWeight:800,fontFamily:F.display,marginBottom:6}}>{pipe.pipeName}</div>
        <div style={{fontSize:14,color:C.muted,fontFamily:F.mono,marginBottom:32}}>Which position will be at the BOTTOM after rotation?</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:24}}>
          {CLOCK.map(pos=>(<button key={pos} onClick={()=>setTurnPos(pos)} style={{padding:"22px 12px",borderRadius:14,cursor:"pointer",fontFamily:F.mono,fontSize:15,fontWeight:700,border:"2px solid "+(turnPos===pos?C.accent:C.border),background:turnPos===pos?C.accent+"22":C.card,color:turnPos===pos?C.accent:C.muted,transition:"all 0.15s"}}>{pos}</button>))}
        </div>
        {turnPos&&<div style={{background:C.accent+"15",border:"1px solid "+C.accent+"44",borderRadius:10,padding:"12px 16px",marginBottom:20,fontSize:13,color:C.accent,fontFamily:F.mono}}>After rotation: {turnPos} will be at the bottom</div>}
        <button onClick={doTurn} disabled={!turnPos} style={{width:"100%",padding:"18px",background:turnPos?C.accent:C.border,border:"none",color:turnPos?"#000":C.muted,borderRadius:14,fontSize:18,fontWeight:800,fontFamily:F.display,cursor:turnPos?"pointer":"not-allowed",letterSpacing:1,marginBottom:10}}>CONFIRM TURN</button>
        <button onClick={()=>setPhase("summary")} style={{width:"100%",padding:"14px",background:"transparent",border:"1px solid "+C.border,color:C.muted,borderRadius:14,fontSize:14,fontFamily:F.mono,cursor:"pointer"}}>CANCEL</button>
      </div>
    </div>
  );

  if(phase==="summary")return(
    <div style={{minHeight:"100vh",background:C.bg,color:C.text,fontFamily:F.sans,maxWidth:480,margin:"0 auto",display:"flex",flexDirection:"column"}}>
      <link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;700;800&family=DM+Sans:wght@400;600;700&family=JetBrains+Mono:wght@400;700&display=swap" rel="stylesheet"/>
      <div style={{flex:1,padding:"32px 20px 20px",overflowY:"auto"}}>
        <div style={{textAlign:"center",marginBottom:28}}>
          <div style={{fontSize:52,lineHeight:1,marginBottom:8}}>OK</div>
          <div style={{fontSize:24,fontWeight:800,fontFamily:F.display,color:C.ok,marginBottom:4}}>INSPECTION COMPLETE</div>
          <div style={{fontSize:12,color:C.muted,fontFamily:F.mono}}>{pipe.pipeName} -- {today()}</div>
        </div>
        <div style={{background:C.card,border:"1px solid "+C.border,borderRadius:14,overflow:"hidden",marginBottom:16}}>
          {ordered.map((sp,i)=>{
            const v=parseFloat(vals[i]);
            const isNa=nas[i];
            const loss=!isNa&&!isNaN(v)&&v>0?getLoss(pipe.nominalThickness,v):null;
            const col=loss==null?C.muted:loss>=30?C.danger:loss>=15?C.warn:C.ok;
            return(<div key={sp.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"11px 14px",borderBottom:"1px solid "+C.border}}>
              <div><div style={{fontSize:12,color:C.text,fontFamily:F.mono}}>{sp.name}</div><div style={{fontSize:9,color:C.muted,fontFamily:F.mono}}>{sp.axialLabel}</div></div>
              <div style={{textAlign:"right"}}>{isNa?<span style={{fontSize:12,color:C.muted,fontFamily:F.mono}}>N/A</span>:skips[i]?<span style={{fontSize:12,color:C.accent,fontFamily:F.mono}}>SKIP</span>:(<><div style={{fontSize:16,fontWeight:800,color:col,fontFamily:F.mono}}>{!isNaN(v)&&v>0?v.toFixed(1):"--"}<span style={{fontSize:9,marginLeft:2}}>{pipe.unit}</span></div>{loss!=null&&<div style={{fontSize:9,color:col,fontFamily:F.mono}}>{loss.toFixed(1)}%</div>}</>)}</div>
            </div>);
          })}
        </div>
        <button onClick={()=>setPhase("turn")} style={{width:"100%",padding:"14px",background:C.warn+"22",border:"1px solid "+C.warn+"44",color:C.warn,borderRadius:14,fontSize:14,fontFamily:F.mono,fontWeight:700,cursor:"pointer",marginBottom:10}}>MARK PIPE TURNED</button>
        {/* Session notes */}
        <div style={{marginBottom:12}}>
          <div style={{fontSize:10,color:C.muted,fontFamily:F.mono,marginBottom:6,letterSpacing:0.5}}>INSPECTION NOTES (optional)</div>
          <textarea value={sessionNote} onChange={e=>setSessionNote(e.target.value)} rows={2}
            placeholder="e.g. Access difficult due to scaffolding, reading taken in rain..."
            style={{width:"100%",background:C.card,border:"1px solid "+C.border,borderRadius:10,padding:"10px 12px",color:C.text,fontFamily:F.sans,fontSize:13,resize:"none",outline:"none",boxSizing:"border-box"}}/>
        </div>
        <button onClick={doSave} style={{width:"100%",padding:"18px",background:C.ok,border:"none",color:"#000",borderRadius:14,fontSize:18,fontWeight:800,fontFamily:F.display,cursor:"pointer",letterSpacing:1,marginBottom:10}}>SAVE + SYNC</button>
        <button onClick={onBack} style={{width:"100%",padding:"14px",background:"transparent",border:"1px solid "+C.border,color:C.muted,borderRadius:14,fontSize:14,fontFamily:F.mono,cursor:"pointer"}}>BACK TO PIPES</button>
      </div>
    </div>
  );

  return(
    <div style={{minHeight:"100vh",background:C.bg,color:C.text,fontFamily:F.sans,maxWidth:480,margin:"0 auto",display:"flex",flexDirection:"column"}}>
      <link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;700;800&family=DM+Sans:wght@400;600;700&family=JetBrains+Mono:wght@400;700&display=swap" rel="stylesheet"/>
      {confirmBack&&(
        <div style={{position:"fixed",inset:0,background:"#000000cc",zIndex:200,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
          <div style={{background:C.surface,borderRadius:16,padding:24,width:"100%",maxWidth:340,border:"1px solid "+C.border}}>
            <div style={{fontSize:16,fontWeight:800,color:C.text,fontFamily:F.display,marginBottom:8}}>DISCARD READINGS?</div>
            <div style={{fontSize:13,color:C.muted,fontFamily:F.mono,marginBottom:20}}>You have unsaved readings. Going back will lose them.</div>
            <button onClick={onBack} style={{width:"100%",padding:"14px",background:C.danger,border:"none",color:"#fff",borderRadius:10,fontSize:15,fontWeight:800,fontFamily:F.display,cursor:"pointer",marginBottom:8,letterSpacing:0.5}}>DISCARD AND GO BACK</button>
            <button onClick={()=>setConfirmBack(false)} style={{width:"100%",padding:"12px",background:"transparent",border:"1px solid "+C.border,color:C.muted,borderRadius:10,fontSize:13,fontFamily:F.mono,cursor:"pointer"}}>KEEP MEASURING</button>
          </div>
        </div>
      )}
      <div style={{background:C.surface,borderBottom:"1px solid "+C.border,padding:"12px 16px"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
          <button onClick={()=>{
            const hasData=vals.some((v,i)=>nas[i]||(!isNaN(parseFloat(v))&&parseFloat(v)>0));
            if(hasData)setConfirmBack(true);else onBack();
          }} style={{background:"transparent",border:"none",color:C.muted,fontSize:13,fontFamily:F.mono,cursor:"pointer",padding:0}}>BACK</button>
          <Badge status={status}/>
        </div>
        <div style={{fontSize:17,fontWeight:700,color:C.text,fontFamily:F.display,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{pipe.pipeName}</div>
        <div style={{fontSize:10,color:C.muted,fontFamily:F.mono}}>{pipe.area} -- {pipe.diameter} -- {pipe.material}</div>
        {pipe.material==="HDPE"&&pipe.od&&pipe.sdr&&(
          <div style={{marginTop:8}}>
            <HDPEPressureCalc
              pipeOD={pipe.od}
              pipeSdr={pipe.sdr}
              pipeNomWall={pipe.nominalThickness}
              latestReading={getMin(allVals(pipe.spots))||pipe.nominalThickness}
              embedded={true}/>
          </div>
        )}
        {pipe.turnsCount>0&&pipe.turnHistory&&pipe.turnHistory.length>0&&(
          <div style={{marginTop:4,display:"inline-flex",alignItems:"center",gap:5,padding:"3px 8px",background:C.accent+"18",border:"1px solid "+C.accent+"44",borderRadius:6}}>
            <div style={{width:6,height:6,borderRadius:"50%",background:C.accent}}/>
            <span style={{fontSize:9,color:C.accent,fontFamily:F.mono,fontWeight:700}}>
              BOTTOM: {pipe.turnHistory[pipe.turnHistory.length-1].bottomPosition} -- turn {pipe.turnsCount}
            </span>
          </div>
        )}
      </div>
      <div style={{padding:"10px 16px 0"}}>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}><span style={{fontSize:10,color:C.muted,fontFamily:F.mono}}>SPOT {idx+1} OF {ordered.length}</span><span style={{fontSize:10,color:C.muted,fontFamily:F.mono}}>{Math.round((idx/ordered.length)*100)}%</span></div>
        <div style={{background:C.border,borderRadius:4,height:4}}><div style={{width:(idx/ordered.length*100)+"%",height:"100%",background:C.accent,borderRadius:4,transition:"width 0.3s"}}/></div>
        <div style={{display:"flex",gap:4,marginTop:8,flexWrap:"wrap"}}>
          {ordered.map((s,i)=>{const v=parseFloat(vals[i]);const filled=nas[i]||(!isNaN(v)&&v>0);const isCur=i===idx;const loss=filled&&!nas[i]?getLoss(pipe.nominalThickness,v):null;const col=nas[i]?C.muted:loss==null?C.border:loss>=30?C.danger:loss>=15?C.warn:C.ok;return(<div key={s.id} onClick={()=>setIdx(i)} style={{width:isCur?28:8,height:8,borderRadius:4,background:isCur?C.accent:filled?col:C.border,transition:"all 0.2s",cursor:"pointer",flexShrink:0}}/>);})}
        </div>
      </div>
      <div style={{flex:1,display:"flex",flexDirection:"column",padding:"16px 16px 0"}}>
        <div style={{background:C.card,border:"1px solid "+C.border,borderRadius:14,padding:"16px",marginBottom:14}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:4}}>
            <div style={{fontSize:11,color:C.accent,fontFamily:F.mono,letterSpacing:1}}>MEASURING</div>
            {(spot?.readings||[]).some(r=>r.date===today())&&(
              <span style={{fontSize:9,background:C.warn+"22",color:C.warn,border:"1px solid "+C.warn+"44",borderRadius:4,padding:"2px 6px",fontFamily:F.mono,fontWeight:700}}>ALREADY DONE TODAY</span>
            )}
          </div>
          <div style={{fontSize:22,fontWeight:800,color:C.text,fontFamily:F.display,marginBottom:2}}>{spot?.name}</div>
          <div style={{display:"flex",gap:12}}><span style={{fontSize:11,color:C.muted,fontFamily:F.mono}}>{spot?.axialLabel}</span><span style={{fontSize:11,color:C.muted,fontFamily:F.mono}}>{spot?.circumLabel}</span></div>
          {lastVal!=null&&(<div style={{marginTop:8,padding:"6px 10px",background:C.bg,borderRadius:8,display:"flex",gap:16,alignItems:"center"}}>
            <div><div style={{fontSize:8,color:C.muted,fontFamily:F.mono,letterSpacing:0.5}}>LAST READING</div><div style={{fontSize:16,fontWeight:700,fontFamily:F.mono,color:C.dim}}>{lastVal.toFixed(1)}<span style={{fontSize:9,marginLeft:2}}>{pipe.unit}</span></div></div>
            <div><div style={{fontSize:8,color:C.muted,fontFamily:F.mono,letterSpacing:0.5}}>DATE</div><div style={{fontSize:12,fontWeight:700,fontFamily:F.mono,color:C.dim}}>{lastR.date}</div></div>
          </div>)}
          {/* Photo strip for this spot */}
          <div style={{marginTop:8,display:"flex",gap:6,alignItems:"center",flexWrap:"wrap"}}>
            {(photos[idx]||[]).map((src,pi)=>(<img key={pi} src={src} alt="spot" style={{width:40,height:40,objectFit:"cover",borderRadius:6,border:"1px solid "+C.border}}/>))}
            <button onClick={()=>photoRef.current&&photoRef.current.click()}
              style={{width:40,height:40,borderRadius:6,border:"1px dashed "+C.accent+"66",background:C.accent+"0d",color:C.accent,fontSize:13,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:F.mono}}>
              CAM
            </button>
            <input ref={photoRef} type="file" accept="image/*" capture="environment" style={{display:"none"}}
              onChange={e=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=ev=>{const a=[...photos];a[idx]=[...(a[idx]||[]),ev.target.result];setPhotos(a);};r.readAsDataURL(f);e.target.value="";}}/>
            {(photos[idx]||[]).length>0&&<span style={{fontSize:9,color:C.muted,fontFamily:F.mono}}>{photos[idx].length} photo{photos[idx].length!==1?"s":""}</span>}
          </div>
        </div>
        <div style={{background:C.card,border:"2px solid "+(nas[idx]?C.border:newLoss!=null?newCol:C.accent),borderRadius:14,padding:"20px 16px",marginBottom:12,transition:"border-color 0.2s"}}>
          <div style={{fontSize:10,color:C.muted,fontFamily:F.mono,letterSpacing:1,marginBottom:8}}>{nas[idx]?"MARKED AS N/A":"NEW READING ("+pipe.unit+")"}</div>
          {!nas[idx]?(<>
            <input ref={inputRef} type="number" inputMode="decimal" value={vals[idx]} onChange={e=>{const a=[...vals];a[idx]=e.target.value;setVals(a);}} onKeyDown={e=>e.key==="Enter"&&canNext&&advance()} placeholder="0.0"
              style={{width:"100%",background:"transparent",border:"none",outline:"none",fontSize:56,fontWeight:800,color:newLoss!=null?newCol:C.text,fontFamily:F.mono,textAlign:"center",caretColor:C.accent,boxSizing:"border-box"}}/>
            {newLoss!=null&&(
              <div style={{textAlign:"center",marginTop:4}}>
                <span style={{fontSize:18,fontWeight:700,color:newCol,fontFamily:F.mono}}>{newLoss.toFixed(1)}% wall loss</span>
                <span style={{fontSize:12,color:newCol,fontFamily:F.mono,marginLeft:8}}>{newLoss>=30?"CRITICAL":newLoss>=15?"TURN REQUIRED":"OK"}</span>
              </div>
            )}
            {newLoss!=null&&lastVal!=null&&(()=>{
              const diff=newVal-lastVal;
              const pct=Math.abs(diff/lastVal*100).toFixed(1);
              const col=diff<-0.5?C.warn:diff>0.5?C.ok:C.muted;
              const flag=Math.abs(diff)>lastVal*0.15;
              return(
                <div style={{marginTop:8,padding:"8px 12px",background:flag?C.danger+"18":C.bg,border:"1px solid "+(flag?C.danger+"44":C.border),borderRadius:8}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <div>
                      <div style={{fontSize:11,color:col,fontFamily:F.mono,fontWeight:700}}>
                        {diff>=0?"+":""}{diff.toFixed(2)} {pipe.unit} vs last ({pct}%)
                      </div>
                      <div style={{fontSize:9,color:C.muted,fontFamily:F.mono,marginTop:2}}>
                        Last reading: {lastVal.toFixed(1)} {pipe.unit} on {lastR.date}
                      </div>
                    </div>
                    {flag&&(
                      <div style={{fontSize:9,color:C.danger,fontFamily:F.mono,textAlign:"right",fontWeight:700}}>
                        LARGE<br/>CHANGE
                      </div>
                    )}
                  </div>
                  {flag&&<div style={{fontSize:10,color:C.danger,fontFamily:F.mono,marginTop:4}}>Double-check your reading before continuing</div>}
                </div>
              );
            })()}
          </>):(<div style={{textAlign:"center",padding:"20px 0",fontSize:20,color:C.muted,fontFamily:F.mono}}>N/A -- not accessible</div>)}
        </div>
        <div style={{display:"flex",gap:8,marginBottom:12}}>
          <button onClick={toggleNa} style={{flex:1,padding:"12px",background:nas[idx]?C.warn+"22":"transparent",border:"1px solid "+(nas[idx]?C.warn:C.border),color:nas[idx]?C.warn:C.muted,borderRadius:10,fontSize:12,fontFamily:F.mono,fontWeight:700,cursor:"pointer",transition:"all 0.15s"}}>{nas[idx]?"UNDO N/A":"N/A (NOT ACCESSIBLE)"}</button>
          <button onClick={()=>{const a=[...skips];a[idx]=!a[idx];setSkips(a);}} style={{flex:1,padding:"12px",background:skips[idx]?C.accent+"22":"transparent",border:"1px solid "+(skips[idx]?C.accent:C.border),color:skips[idx]?C.accent:C.muted,borderRadius:10,fontSize:12,fontFamily:F.mono,fontWeight:700,cursor:"pointer",transition:"all 0.15s"}}>{skips[idx]?"UNDO SKIP":"SKIP (COME BACK)"}</button>
        </div>
      </div>
      <div style={{padding:"12px 16px 32px",background:C.surface,borderTop:"1px solid "+C.border}}>
        {!canNext&&<div style={{textAlign:"center",fontSize:10,color:C.muted,fontFamily:F.mono,marginBottom:8,letterSpacing:0.5}}>Enter a reading above or mark as N/A to continue</div>}
        <div style={{display:"flex",gap:10}}>
          {idx>0&&(<button onClick={()=>setIdx(idx-1)} style={{flex:1,padding:"14px",background:C.card,border:"1px solid "+C.border,color:C.muted,borderRadius:12,fontSize:14,fontFamily:F.mono,fontWeight:700,cursor:"pointer"}}>PREV</button>)}
          <button onClick={advance} disabled={!canNext} style={{flex:3,padding:"16px",background:canNext?C.accent:C.border,border:"none",color:canNext?"#000":C.muted,borderRadius:12,fontSize:18,fontWeight:800,fontFamily:F.display,cursor:canNext?"pointer":"not-allowed",letterSpacing:1,transition:"all 0.15s"}}>{idx===ordered.length-1?"FINISH":"NEXT"}</button>
        </div>
      </div>
    </div>
  );
}

function ScanModal({pipes,onFound,onClose,onCreateStub}){
  const[input,setInput]=useState("");
  const[error,setError]=useState("");
  function tryFind(val){const v=val.trim();const id=v.startsWith("pipe:")?parseFloat(v.slice(5)):parseFloat(v);const found=pipes.find(p=>p.id===id||String(p.id)===String(id));if(found)onFound(found);else setError("No pipe found for: "+v);}
  return(
    <div style={{position:"fixed",inset:0,background:"#000000ee",zIndex:100,display:"flex",alignItems:"flex-end",justifyContent:"center"}}>
      <div style={{background:C.surface,borderRadius:"20px 20px 0 0",width:"100%",maxWidth:480,padding:24,border:"1px solid "+C.border,borderBottom:"none"}}>
        <div style={{width:40,height:4,background:C.border,borderRadius:2,margin:"0 auto 16px"}}/>
        <div style={{fontSize:18,fontWeight:800,color:C.text,fontFamily:F.display,marginBottom:4}}>SCAN QR CODE</div>
        <div style={{fontSize:11,color:C.muted,fontFamily:F.mono,marginBottom:16}}>Point camera at QR label on pipe, or enter pipe ID manually.</div>
        <div style={{background:"#000",borderRadius:12,height:130,display:"flex",alignItems:"center",justifyContent:"center",marginBottom:16,border:"2px solid "+C.accent+"44",position:"relative",overflow:"hidden"}}>
          <div style={{fontSize:11,color:C.muted,fontFamily:F.mono,textAlign:"center"}}>Camera active on device.</div>
          {[[0,0],[1,0],[0,1],[1,1]].map(([r,cc],i)=>(<div key={i} style={{position:"absolute",top:r?undefined:8,bottom:r?8:undefined,left:cc?undefined:8,right:cc?8:undefined,width:24,height:24,borderTop:r?"none":"2px solid "+C.accent,borderBottom:r?"2px solid "+C.accent:"none",borderLeft:cc?"none":"2px solid "+C.accent,borderRight:cc?"2px solid "+C.accent:"none"}}/>))}
        </div>
        <div style={{display:"flex",gap:8,marginBottom:error?8:0}}>
          <input value={input} onChange={e=>{setInput(e.target.value);setError("");}} onKeyDown={e=>e.key==="Enter"&&tryFind(input)} placeholder="pipe:1 or just 1"
            style={{flex:1,background:C.card,border:"1px solid "+C.border,borderRadius:10,padding:"12px 14px",color:C.text,fontFamily:F.mono,fontSize:14,outline:"none"}}
            onFocus={e=>e.target.style.borderColor=C.accent} onBlur={e=>e.target.style.borderColor=C.border}/>
          <button onClick={()=>tryFind(input)} style={{background:C.accent,color:"#000",border:"none",borderRadius:10,padding:"12px 20px",fontWeight:700,fontFamily:F.mono,fontSize:13,cursor:"pointer"}}>GO</button>
        </div>
        {error&&(
          <div style={{marginBottom:8}}>
            <div style={{fontSize:11,color:C.danger,fontFamily:F.mono,marginBottom:8}}>{error}</div>
            <button onClick={()=>onCreateStub&&onCreateStub(input.trim())}
              style={{width:"100%",padding:"12px",background:C.warn+"22",border:"1px solid "+C.warn+"44",
                color:C.warn,borderRadius:10,fontSize:12,fontFamily:F.mono,fontWeight:700,cursor:"pointer"}}>
              CREATE NEW PIPE RECORD
            </button>
            <div style={{fontSize:9,color:C.muted,fontFamily:F.mono,marginTop:4}}>Creates a basic record now -- add full details later in the admin app</div>
          </div>
        )}
        <button onClick={onClose} style={{width:"100%",marginTop:12,background:"transparent",color:C.muted,border:"1px solid "+C.border,borderRadius:10,padding:"12px",fontFamily:F.mono,fontSize:13,cursor:"pointer"}}>CANCEL</button>
      </div>
    </div>
  );
}

export default function App(){
  const[pipes,setPipesRaw]=useState([]);
  const[selected,setSelected]=useState(null);
  const[quickTurn,setQuickTurn]=useState(null);
  const[quickChangeout,setQuickChangeout]=useState(null);
  const[showScan,setShowScan]=useState(false);
  const[online,setOnline]=useState(navigator.onLine);
  const[pending,setPending]=useState(0);
  const[syncing,setSyncing]=useState(false);
  const[inspector,setInspectorRaw]=useState(()=>lsGetName());
  const queue=useRef([]);
  function setInspector(n){lsSetName(n);setInspectorRaw(n);}

  useEffect(()=>{
    // Always start with SAMPLE so demo pipe is visible immediately
    const local=lsGet(SAMPLE);
    // Merge: ensure SAMPLE pipes that aren't in localStorage are present
    const localIds=new Set(local.map(p=>String(p.id)));
    const merged=[...local,...SAMPLE.filter(p=>!localIds.has(String(p.id)))];
    setPipesRaw(merged);
    if(navigator.onLine){
      setSyncing(true);
      sbLoad().then(remote=>{
        setSyncing(false);
        if(remote.length>0){
          // Merge remote with SAMPLE: remote wins for shared pipes, keep SAMPLE pipes not in remote
          const remoteIds=new Set(remote.map(p=>String(p.id)));
          const demoExtras=SAMPLE.filter(p=>!remoteIds.has(String(p.id)));
          const final=[...remote,...demoExtras];
          lsSet(final);
          setPipesRaw(final);
        }
      }).catch(()=>setSyncing(false));
    }
  },[]);

  useEffect(()=>{
    function goOnline(){setOnline(true);flush();}
    function goOffline(){setOnline(false);}
    window.addEventListener("online",goOnline);window.addEventListener("offline",goOffline);
    return()=>{window.removeEventListener("online",goOnline);window.removeEventListener("offline",goOffline);};
  },[]);

  async function flush(){
    if(!queue.current.length)return;
    setSyncing(true);
    for(const p of queue.current)await sbSave(p);
    queue.current=[];setPending(0);setSyncing(false);
  }

  function handleSave(updated){
    const next=pipes.map(p=>p.id===updated.id?updated:p);
    lsSet(next);setPipesRaw(next);setSelected(null);
    if(navigator.onLine){setSyncing(true);sbSave(updated).then(()=>setSyncing(false));}
    else{queue.current=[...queue.current.filter(p=>p.id!==updated.id),updated];setPending(queue.current.length);}
  }

  function handleCreateStub(rawId){
    const dt=new Date().toISOString();
    const newId=Date.now();
    const stub={id:newId,pipeName:"New Pipe ("+newId+")",area:"",location:"",diameter:"",nominalThickness:0,unit:"mm",material:"Unknown",welds:[],spots:[],turnsCount:0,turnHistory:[],changeoutHistory:[],photos:[],notes:"Created via QR scan on "+today()};
    const next=[...pipes,stub];
    lsSet(next);setPipesRaw(next);
    if(navigator.onLine)sbSave(stub);
    setShowScan(false);setSelected(stub);
  }

  if(!inspector)return <InspectorNamePrompt onSet={setInspector}/>;
  if(quickTurn)return <QuickTurnScreen pipe={quickTurn} onBack={()=>setQuickTurn(null)} onSave={p=>{handleSave(p);setQuickTurn(null);}} inspector={inspector}/>;
  if(quickChangeout)return <QuickChangeoutScreen pipe={quickChangeout} onBack={()=>setQuickChangeout(null)} onSave={p=>{handleSave(p);setQuickChangeout(null);}} inspector={inspector}/>;
  if(selected)return <MeasureScreen pipe={selected} onBack={()=>setSelected(null)} onSave={handleSave} inspector={inspector}/>;
  return(<><PipeList pipes={pipes} onSelect={setSelected} onScan={()=>setShowScan(true)} online={online} pending={pending} syncing={syncing} inspector={inspector} onQuickTurn={setQuickTurn} onQuickChangeout={setQuickChangeout}/>{showScan&&<ScanModal pipes={pipes} onFound={p=>{setShowScan(false);setSelected(p);}} onClose={()=>setShowScan(false)} onCreateStub={handleCreateStub}/>}</>);
}
