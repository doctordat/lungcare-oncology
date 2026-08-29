import React,{createContext,useContext,useMemo,useState} from 'react';

type Status='previsit-draft'|'previsit-submitted'|'nurse-intake'|'ready-for-doctor'|'doctor-examining'|'doctor-plan-confirmed'|'nurse-education'|'home-care-active';
type Log={at:string;event:string};
type State={version:number;status:Status;appointmentConfirmed:boolean;intakeComplete:boolean;planConfirmed:boolean;teachbackComplete:boolean;taken:number;missed:number;urgent:boolean;urgentResolved:boolean;logs:Log[]};
const seed:State={version:1,status:'previsit-draft',appointmentConfirmed:false,intakeComplete:false,planConfirmed:false,teachbackComplete:false,taken:41,missed:1,urgent:false,urgentResolved:false,logs:[]};
const normalize=(x:any):State=>({version:1,status:typeof x?.status==='string'?x.status:seed.status,appointmentConfirmed:!!x?.appointmentConfirmed,intakeComplete:!!x?.intakeComplete,planConfirmed:!!x?.planConfirmed,teachbackComplete:!!x?.teachbackComplete,taken:Number.isFinite(x?.taken)?x.taken:41,missed:Number.isFinite(x?.missed)?x.missed:1,urgent:!!x?.urgent,urgentResolved:!!x?.urgentResolved,logs:Array.isArray(x?.logs)?x.logs:[]});
const load=()=>{try{return normalize(JSON.parse(localStorage.getItem('lungcare:v1')||'null'))}catch{return seed}};
const C=createContext<any>(null);
export function AppProvider({children}:{children:React.ReactNode}){const [state,setState]=useState<State>(load);const emit=(event:string,patch:Partial<State>)=>setState(s=>{const n={...s,...patch,logs:[...s.logs,{at:new Date().toISOString(),event}]};try{localStorage.setItem('lungcare:v1',JSON.stringify(n))}catch{}return n});const value=useMemo(()=>({state,emit,reset:()=>{localStorage.removeItem('lungcare:v1');setState(seed)}}),[state]);return <C.Provider value={value}>{children}</C.Provider>}
export const useApp=()=>useContext(C);