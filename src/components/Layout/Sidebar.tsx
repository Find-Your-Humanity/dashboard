import React from 'react';
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Divider,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Analytics as AnalyticsIcon,
  People as PeopleIcon,
  Settings as SettingsIcon,
  Security as SecurityIcon,
  Payment as PaymentIcon,
  Email as EmailIcon,
  Timeline as TimelineIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface SidebarProps {
  onItemClick?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onItemClick }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  // 실제 사용자 권한 확인
  const isUserAdmin = user?.is_admin === true || user?.is_admin === 1 || user?.role === 'admin';
  
  // 두 가지 모드: admin / tenant
  const isAdminPath = location.pathname.startsWith('/admin');
  
  // 일반 사용자는 항상 /app 경로 사용, 관리자만 /admin 경로 사용
  const base = (isUserAdmin && isAdminPath) ? '/admin' : '/app';
  
  const menuItems = [
    { id: 'dashboard', label: '대시보드', path: `${base}/dashboard`, icon: <DashboardIcon /> },
    { id: 'analytics', label: '분석', path: `${base}/analytics`, icon: <AnalyticsIcon /> },
    // 실제 관리자 권한이 있을 때만 관리자 메뉴 표시
    ...(isUserAdmin ? [
      { id: 'users', label: '사용자 관리', path: `${base}/users`, icon: <PeopleIcon /> },
      { id: 'plans', label: '요금제 관리', path: `${base}/plans`, icon: <PaymentIcon /> },
      { id: 'requests', label: '요청사항', path: `${base}/requests`, icon: <EmailIcon /> },
      { id: 'request-status', label: '요청 상태', path: `${base}/request-status`, icon: <TimelineIcon /> },
    ] : []),
    { id: 'settings', label: '설정', path: `${base}/settings`, icon: <SettingsIcon /> },
  ];

  const handleItemClick = (path: string) => {
    navigate(path);
    onItemClick?.();
  };

  return (
    <Box>
      <Toolbar>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <SecurityIcon sx={{ color: 'primary.main' }} />
          <Typography variant="h6" noWrap sx={{ fontWeight: 'bold', color: 'primary.main' }}>
            Real
          </Typography>
        </Box>
      </Toolbar>

      <Divider />

      <List>
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <ListItem key={item.id} disablePadding>
              <ListItemButton
                onClick={() => handleItemClick(item.path)}
                selected={isActive}
                sx={{
                  mx: 1,
                  mb: 0.5,
                  borderRadius: 1,
                  '&.Mui-selected': {
                    bgcolor: 'primary.main',
                    color: 'primary.contrastText',
                    '&:hover': { bgcolor: 'primary.dark' },
                    '& .MuiListItemIcon-root': { color: 'primary.contrastText' },
                  },
                  '&:hover': { bgcolor: isActive ? 'primary.main' : 'action.hover' },
                }}
              >
                <ListItemIcon sx={{ color: isActive ? 'inherit' : 'text.secondary', minWidth: 40 }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{ variant: 'body2', fontWeight: isActive ? 'medium' : 'regular' }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      <Divider sx={{ mt: 2 }} />

      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Typography variant="caption" color="text.secondary">
          v1.0.0
        </Typography>
      </Box>
    </Box>
  );
};

export default Sidebar;


