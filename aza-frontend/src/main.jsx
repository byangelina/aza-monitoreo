import React from 'react';
import ReactDOM from 'react-dom/client';
import {BrowserRouter} from 'react-router-dom';
import {AuthProvider} from './context/AuthContext';
import {DataProvider} from './context/DataContext';
import AppRoutes from './routes/AppRoutes';
import './styles.css';
ReactDOM.createRoot(document.getElementById('root')).render(<React.StrictMode><BrowserRouter><AuthProvider><DataProvider><AppRoutes/></DataProvider></AuthProvider></BrowserRouter></React.StrictMode>);
