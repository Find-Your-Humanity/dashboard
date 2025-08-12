import { createTheme } from '@mui/material/styles';
import { koKR } from '@mui/material/locale';

// 다크/글래스 모던 팔레트
const theme = createTheme(
  {
    palette: {
      mode: 'dark',
      primary: {
        main: '#6C5CE7', // neon purple
        light: '#8F7BFF',
        dark: '#4E3FB5',
        contrastText: '#0b1020',
      },
      secondary: {
        main: '#00D4FF', // cyan
        light: '#56E6FF',
        dark: '#00AACC',
        contrastText: '#0b1020',
      },
      success: { main: '#2ECC71' },
      warning: { main: '#F39C12' },
      error: { main: '#E74C3C' },
      background: {
        default: '#0b1020',
        paper: 'rgba(19, 26, 42, 0.8)',
      },
      text: {
        primary: '#E6EAF2',
        secondary: '#9AA3B2',
      },
    },
    typography: {
      fontFamily: 'Inter, "Noto Sans KR", system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif',
      h1: { fontSize: '2.4rem', fontWeight: 700, letterSpacing: '-0.02em' },
      h2: { fontSize: '1.8rem', fontWeight: 700 },
      h3: { fontSize: '1.4rem', fontWeight: 600 },
      h4: { fontSize: '1.2rem', fontWeight: 600 },
      button: { textTransform: 'none', fontWeight: 600 },
    },
    shape: { borderRadius: 14 },
    spacing: 8,
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            background: 'radial-gradient(1200px 600px at 10% -10%, rgba(108,92,231,0.25), transparent), radial-gradient(900px 500px at 100% 10%, rgba(0,212,255,0.25), transparent), #0b1020',
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            background: 'linear-gradient(90deg, rgba(19,26,42,0.8), rgba(19,26,42,0.6))',
            backdropFilter: 'blur(10px)',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
          },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            background: 'rgba(19,26,42,0.75)',
            backdropFilter: 'blur(8px)',
            borderRight: '1px solid rgba(255,255,255,0.06)',
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            background: 'linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.03))',
            border: '1px solid rgba(255,255,255,0.08)',
            boxShadow: '0 10px 30px rgba(0,0,0,0.25)',
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          containedPrimary: {
            boxShadow: '0 8px 20px rgba(108,92,231,0.35)',
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: { fontWeight: 600 },
        },
      },
    },
  },
  koKR,
);

export default theme;