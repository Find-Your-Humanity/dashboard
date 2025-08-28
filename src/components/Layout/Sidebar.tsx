import React from 'react';
import {
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Divider,
  Skeleton,
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
  const { user, loading } = useAuth();

  // 실제 사용자 권한 확인 - 더 엄격한 체크
  const isUserAdmin = React.useMemo(() => {
    // 로딩 중이어도 사용자 정보가 있으면 권한 확인
    if (!user) {
      console.log('Sidebar: 사용자 정보 없음');
      return false;
    }
    
    console.log('Sidebar: 사용자 정보 확인', {
      user,
      is_admin: user.is_admin,
      role: user.role,
      type: typeof user.is_admin
    });
    
    // 명시적으로 관리자 권한이 있는 경우만 true
    const isAdmin = (
      user.is_admin === true || 
      user.is_admin === 1 || 
      user.role === 'admin'
    );
    
    console.log('Sidebar: 관리자 권한 확인 결과', isAdmin);
    return isAdmin;
  }, [user, loading]);
  
  // 관리자는 /admin 경로, 일반 사용자는 /app 경로 사용
  const base = isUserAdmin ? '/admin' : '/app';
  
  // 기본 메뉴 항목 (모든 사용자)
  const baseMenuItems = [
    { id: 'dashboard', label: 'Dashboard', path: `${base}/dashboard`, icon: <DashboardIcon /> },
    { id: 'analytics', label: 'Analytics', path: `${base}/analytics`, icon: <AnalyticsIcon /> },
    { id: 'billing', label: '요금제', path: `${base}/billing`, icon: <PaymentIcon /> },
  ];

  // 관리자 전용 메뉴 항목
  const adminMenuItems = [
    { id: 'users', label: '사용자 관리', path: `${base}/users`, icon: <PeopleIcon /> },
    { id: 'plans', label: '요금제 관리', path: `${base}/plans`, icon: <PaymentIcon /> },
    { id: 'requests', label: '요청사항', path: `${base}/requests`, icon: <EmailIcon /> },
    { id: 'request-status', label: '요청 상태', path: `${base}/request-status`, icon: <TimelineIcon /> },
  ];

  // 설정 메뉴 (모든 사용자)
  const settingsMenuItem = { id: 'settings', label: '설정', path: `${base}/settings`, icon: <SettingsIcon /> };

  // 최종 메뉴 구성 - 로딩 중이어도 사용자 정보가 있으면 관리자 메뉴 표시
  const menuItems = [
    ...baseMenuItems,
    // 사용자 정보가 있고 관리자 권한이 있으면 관리자 메뉴 표시
    ...(user && isUserAdmin ? adminMenuItems : []),
    settingsMenuItem,
  ];
  
  console.log('Sidebar: 메뉴 구성', {
    user: !!user,
    isUserAdmin,
    baseMenuItemsCount: baseMenuItems.length,
    adminMenuItemsCount: adminMenuItems.length,
    finalMenuItemsCount: menuItems.length,
    base
  });

  const handleItemClick = (path: string) => {
    navigate(path);
    onItemClick?.();
  };

  return (
    <div style={{ 
      backgroundColor: 'white', 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column',
      padding: '16px 0'
    }}>
      {/* MENU 라벨 */}
      <div style={{ 
        padding: '0 24px 16px 24px'
      }}>
        <Typography 
          variant="caption" 
          style={{ 
            color: '#9e9e9e', 
            fontSize: '10px', 
            fontWeight: 400,
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}
        >
          MENU
        </Typography>
      </div>

      <List style={{ padding: '8px 0', flex: 1 }}>
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <ListItem key={item.id} disablePadding>
              <ListItemButton
                onClick={() => handleItemClick(item.path)}
                selected={isActive}
                style={{
                  margin: '0 16px 8px 16px',
                  borderRadius: '8px',
                  padding: '12px 16px',
                  backgroundColor: isActive ? '#424242' : 'transparent',
                  color: isActive ? 'white' : '#757575',
                  transition: 'all 0.2s ease',
                }}
                sx={{
                  '&:hover': { 
                    backgroundColor: isActive ? '#424242' : '#f5f5f5',
                    color: isActive ? 'white' : '#424242'
                  },
                  '& .MuiListItemIcon-root': { 
                    color: isActive ? 'white' : '#757575',
                    minWidth: 40
                  },
                }}
              >
                <ListItemIcon style={{ minWidth: 40 }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{ 
                    variant: 'body2', 
                    style: { 
                      fontSize: '13px', 
                      fontWeight: isActive ? 500 : 300,
                      color: 'inherit'
                    }
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
        
        {/* 로딩 중이고 사용자 정보가 없을 때만 스켈레톤 표시 */}
        {loading && !user && (
          <>
            {adminMenuItems.map((item) => (
              <ListItem key={`skeleton-${item.id}`} disablePadding>
                <ListItemButton disabled style={{ margin: '0 16px 8px 16px', borderRadius: '8px' }}>
                  <ListItemIcon style={{ minWidth: 40 }}>
                    <Skeleton variant="circular" width={24} height={24} />
                  </ListItemIcon>
                  <ListItemText
                    primary={<Skeleton variant="text" width="80%" />}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </>
        )}
      </List>

      <div style={{ padding: '16px 24px', textAlign: 'center' }}>
        <Typography 
          variant="caption" 
          style={{ 
            color: '#9e9e9e', 
            fontSize: '11px', 
            fontWeight: 400 
          }}
        >
          v1.0.0
        </Typography>
      </div>
    </div>
  );
};

export default Sidebar;


