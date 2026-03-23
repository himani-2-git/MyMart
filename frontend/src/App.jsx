import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import POS from './pages/POS';
import Expenses from './pages/Expenses';
import Insights from './pages/Insights';
import SalesHistory from './pages/SalesHistory';
import Settings from './pages/Settings';
import Forecasting from './pages/Forecasting';
import ActivityLog from './pages/ActivityLog';
import FAQ from './pages/FAQ';
import NotFound from './pages/NotFound';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/" element={
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      }>
        <Route index element={<Dashboard />} />
        <Route path="inventory" element={<Inventory />} />
        <Route path="pos" element={<POS />} />
        <Route path="expenses" element={<Expenses />} />
        <Route path="sales" element={<SalesHistory />} />
        <Route path="insights" element={<Insights />} />
        <Route path="settings" element={<Settings />} />
        <Route path="forecasting" element={<Forecasting />} />
        <Route path="activity" element={<ActivityLog />} />
        <Route path="faq" element={<FAQ />} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
