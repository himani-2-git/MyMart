import React, { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Loader from './components/ui/Loader';

const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Inventory = lazy(() => import('./pages/Inventory'));
const POS = lazy(() => import('./pages/POS'));
const Expenses = lazy(() => import('./pages/Expenses'));
const Insights = lazy(() => import('./pages/Insights'));
const SalesHistory = lazy(() => import('./pages/SalesHistory'));
const Settings = lazy(() => import('./pages/Settings'));
const Forecasting = lazy(() => import('./pages/Forecasting'));
const ActivityLog = lazy(() => import('./pages/ActivityLog'));
const FAQ = lazy(() => import('./pages/FAQ'));
const NotFound = lazy(() => import('./pages/NotFound'));

function App() {
  return (
    <Suspense fallback={<Loader fullPage text="Loading MyMart..." />}>
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
    </Suspense>
  );
}

export default App;
