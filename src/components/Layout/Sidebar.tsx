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
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { APP_CONFIG } from '../../config/constants';

interface SidebarProps {
  onItemClick?: () => void;
}

const menuItems = [
  {
    id: 'dashboard',
    label: '대시보드',
    path: '/dashboard',
    icon: <DashboardIcon />,
  },
  {
    id: 'analytics',
    label: '분석',
    path: '/analytics',
    icon: <AnalyticsIcon />,
  },
  {
    id: 'users',
    label: '사용자 관리',
    path: '/users',
    icon: <PeopleIcon />,
  },
  {
    id: 'settings',
    label: '설정',
    path: '/settings',
    icon: <SettingsIcon />,
  },
];

const Sidebar: React.FC<SidebarProps> = ({ onItemClick }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleItemClick = (path: string) => {
    navigate(path);
    onItemClick?.();
  };

  return (
    <Box>
      {/* 로고 영역 */}
      <Toolbar>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <SecurityIcon sx={{ color: 'secondary.main' }} />
          <Typography variant="h6" noWrap sx={{ fontWeight: 800, letterSpacing: '-0.02em' }}>
            {APP_CONFIG.NAME.split(' ')[0]}
          </Typography>
        </Box>
      </Toolbar>
      
      <Divider />
      
      {/* 네비게이션 메뉴 */}
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
                      bgcolor: 'rgba(108,92,231,0.25)',
                      color: 'secondary.main',
                    '&:hover': {
                        bgcolor: 'rgba(108,92,231,0.35)',
                    },
                    '& .MuiListItemIcon-root': {
                        color: 'secondary.main',
                    },
                  },
                  '&:hover': {
                      bgcolor: isActive ? 'rgba(108,92,231,0.3)' : 'rgba(255,255,255,0.04)',
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    color: isActive ? 'inherit' : 'text.secondary',
                    minWidth: 40,
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{
                    variant: 'body2',
                    fontWeight: isActive ? 'medium' : 'regular',
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
      
      <Divider sx={{ mt: 2 }} />
      
      {/* 버전 정보 */}
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Typography variant="caption" color="text.secondary">
          v{APP_CONFIG.VERSION}
        </Typography>
      </Box>
    </Box>
  );
};

export default Sidebar;