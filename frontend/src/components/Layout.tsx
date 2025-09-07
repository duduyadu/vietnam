import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Avatar,
  ToggleButton,
  ToggleButtonGroup
} from '@mui/material';
import {
  Menu as MenuIcon,
  ChevronLeft,
  Dashboard,
  School,
  RecordVoiceOver,
  Assessment,
  People,
  Business,
  Settings,
  Logout,
  Edit
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

const drawerWidth = 240;

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  
  const [open, setOpen] = useState(true);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [language, setLanguage] = useState(i18n.language);

  useEffect(() => {
    loadMenuItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language]);

  const loadMenuItems = async () => {
    // 임시로 기본 메뉴만 사용
    const defaultMenus = [
      { menu_key: 'dashboard', menu_name: t('menu.dashboard'), icon: 'Dashboard', route: '/' },
      { menu_key: 'students', menu_name: t('menu.students'), icon: 'School', route: '/students' },
      { menu_key: 'consultations', menu_name: t('menu.consultations'), icon: 'RecordVoiceOver', route: '/consultations' },
      { menu_key: 'topik-upload', menu_name: 'TOPIK 점수 업로드', icon: 'Assessment', route: '/topik-scores-upload' }
    ];

    // 관리자인 경우 사용자 관리 및 유학원 관리 메뉴 추가
    if (user?.role === 'admin') {
      defaultMenus.push({ 
        menu_key: 'users', 
        menu_name: '사용자 관리', 
        icon: 'People', 
        route: '/users' 
      });
      defaultMenus.push({ 
        menu_key: 'agencies', 
        menu_name: '유학원 관리', 
        icon: 'Business', 
        route: '/agencies' 
      });
    }
    
    // 역할별 메뉴 필터링
    let filteredMenus = defaultMenus;
    if (user?.role === 'korean_branch') {
      // 한국지점은 학생 관리, 상담, 대시보드 접근 가능
      filteredMenus = defaultMenus.filter(menu => 
        ['dashboard', 'students', 'consultations'].includes(menu.menu_key)
      );
    } else if (user?.role === 'teacher') {
      // 교사는 상담 기록까지
      filteredMenus = defaultMenus.filter(menu => 
        ['dashboard', 'students', 'consultations'].includes(menu.menu_key)
      );
    }
    
    setMenuItems(filteredMenus);
  };

  const getIcon = (iconName: string) => {
    const icons: any = {
      Dashboard: <Dashboard />,
      School: <School />,
      RecordVoiceOver: <RecordVoiceOver />,
      Assessment: <Assessment />,
      People: <People />,
      Business: <Business />,
      Settings: <Settings />,
      Edit: <Edit />
    };
    return icons[iconName] || <Dashboard />;
  };

  const handleDrawerToggle = () => {
    setOpen(!open);
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleLanguageChange = (
    event: React.MouseEvent<HTMLElement>,
    newLanguage: string | null
  ) => {
    if (newLanguage) {
      setLanguage(newLanguage);
      i18n.changeLanguage(newLanguage);
    }
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar
        position="fixed"
        sx={{
          width: `calc(100% - ${open ? drawerWidth : 0}px)`,
          ml: `${open ? drawerWidth : 0}px`,
          transition: 'width 0.3s, margin 0.3s'
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={handleDrawerToggle}
            edge="start"
            sx={{ mr: 2 }}
          >
            {open ? <ChevronLeft /> : <MenuIcon />}
          </IconButton>
          
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            Vietnam Student Management System
          </Typography>

          <ToggleButtonGroup
            value={language}
            exclusive
            onChange={handleLanguageChange}
            size="small"
            sx={{ mr: 2, backgroundColor: 'rgba(255,255,255,0.1)' }}
          >
            <ToggleButton value="ko" sx={{ color: 'white' }}>
              한국어
            </ToggleButton>
            <ToggleButton value="vi" sx={{ color: 'white' }}>
              Tiếng Việt
            </ToggleButton>
          </ToggleButtonGroup>

          <IconButton color="inherit" onClick={handleMenuClick}>
            <Avatar sx={{ width: 32, height: 32 }}>
              {user?.full_name?.charAt(0).toUpperCase()}
            </Avatar>
          </IconButton>
          
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
          >
            <MenuItem disabled>
              <Typography variant="body2">
                {user?.full_name}
              </Typography>
            </MenuItem>
            <MenuItem disabled>
              <Typography variant="caption" color="textSecondary">
                {user?.role === 'admin' ? '관리자' : 
                 user?.role === 'teacher' ? '교사' : '한국 지점'}
              </Typography>
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleLogout}>
              <ListItemIcon>
                <Logout fontSize="small" />
              </ListItemIcon>
              {t('auth.logout')}
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      <Drawer
        sx={{
          width: open ? drawerWidth : 0,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: open ? drawerWidth : 0,
            boxSizing: 'border-box',
            transition: 'width 0.3s'
          },
        }}
        variant="persistent"
        anchor="left"
        open={open}
      >
        <Toolbar>
          <Typography variant="h6" noWrap>
            VSMS
          </Typography>
        </Toolbar>
        <Divider />
        <List>
          {menuItems.map((item) => (
            <ListItem key={item.menu_key} disablePadding>
              <ListItemButton
                selected={location.pathname === item.route}
                onClick={() => navigate(item.route)}
              >
                <ListItemIcon>
                  {getIcon(item.icon)}
                </ListItemIcon>
                <ListItemText primary={item.menu_name} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Drawer>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          bgcolor: 'background.default',
          p: 3,
          width: `calc(100% - ${open ? drawerWidth : 0}px)`,
          ml: open ? 0 : `-${drawerWidth}px`,
          transition: 'width 0.3s, margin 0.3s'
        }}
      >
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
};

export default Layout;