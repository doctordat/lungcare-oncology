import React,{createContext,useContext,useMemo,useState} from 'react';
import {ClinicalState,parseStored,seedState,transition} from '../domain/store';

type Actor='patient'|'nurse'|'doctor'|'system';
const STORAGE_KEY='lungcare:v2';
const LEGACY_KEY='lungcare:v1';
const load=():ClinicalState=>{const current=localStorage.getItem(STORAGE_KEY);if(current)return parseStored(current);const legacy=localStorage.getItem(LEGACY_KEY);const migrated=parseStored(legacy);try{localStorage.setItem(STORAGE_KEY,JSON.stringify(migrated))}catch{}return migrated};
const C=createContext<any>(null);
export function AppProvider({children}:{children:React.ReactNode}){const [state,setState]=useState<ClinicalState>(load);const emit=(event:string,patch:Partial<ClinicalState>={},actor:Actor='system')=>setState(s=>{const n=transition(s,event,actor,patch);try{localStorage.setItem(STORAGE_KEY,JSON.stringify(n))}catch{}return n});const reset=()=>{try{localStorage.removeItem(STORAGE_KEY);localStorage.removeItem(LEGACY_KEY)}catch{}setState(seedState)};const value=useMemo(()=>({state,emit,reset}),[state]);return <C.Provider value={value}>{children}</C.Provider>}
export const useApp=()=>useContext(C);