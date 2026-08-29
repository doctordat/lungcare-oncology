import React from 'react';
import ReactDOM from 'react-dom/client';
import {BrowserRouter,Navigate,Route,Routes} from 'react-router-dom';
import {AppProvider} from './state/AppState';
import {Workspace} from './ui/Workspace';
import {ErrorBoundary} from './ui/ErrorBoundary';
import './styles.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
 <React.StrictMode><ErrorBoundary><BrowserRouter basename={import.meta.env.BASE_URL}><AppProvider><Routes>
  <Route path="/" element={<Navigate to="/patient" replace/>}/>
  <Route path="/patient" element={<Workspace role="patient"/>}/>
  <Route path="/nurse" element={<Workspace role="nurse"/>}/>
  <Route path="/doctor" element={<Workspace role="doctor"/>}/>
  <Route path="*" element={<Navigate to="/patient" replace/>}/>
 </Routes></AppProvider></BrowserRouter></ErrorBoundary></React.StrictMode>
);
