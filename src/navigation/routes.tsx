import React from 'react';
import DashboardScreen from '../screens/DashboardScreen';
import AnalyticsScreen from '../screens/AnalyticsScreen';
import UsersScreen from '../screens/UsersScreen';
import SettingsScreen from '../screens/SettingsScreen';

export type AppRoute = {
  path: string;
  element: React.ReactElement;
  label: string;
  id: string;
  showInMenu?: boolean;
};

export const TENANT_ROUTES: AppRoute[] = [
  { id: 'dashboard', label: '대시보드', path: '/app/dashboard', element: <DashboardScreen />, showInMenu: true },
  { id: 'analytics', label: '분석', path: '/app/analytics', element: <AnalyticsScreen />, showInMenu: true },
  { id: 'settings', label: '설정', path: '/app/settings', element: <SettingsScreen />, showInMenu: true },
];

export const ADMIN_ROUTES: AppRoute[] = [
  { id: 'dashboard', label: '대시보드', path: '/admin/dashboard', element: <DashboardScreen />, showInMenu: true },
  { id: 'analytics', label: '분석', path: '/admin/analytics', element: <AnalyticsScreen />, showInMenu: true },
  { id: 'users', label: '사용자 관리', path: '/admin/users', element: <UsersScreen />, showInMenu: true },
  { id: 'settings', label: '설정', path: '/admin/settings', element: <SettingsScreen />, showInMenu: true },
];


