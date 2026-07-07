import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Link as RouterLink, Routes, Navigate, useNavigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import AccountCircle from '@mui/icons-material/AccountCircle';

import Map from './pages/Map/Map';
import VisitedSitesPage from './pages/VisitedSites/VisitedSitesPage';
import ChatBot from './pages/ChatBot/ChatBot';
import Login from './pages/Login/Login';
import Register from './pages/Register/Register';
import ProfileSidebar from './components/common/ProfileSidebar';
import { Site } from './types';
import theme from './styles/theme';
import { AUTH_LOGOUT_EVENT, clearAuthSession } from './services/authService';
import './App.scss';

const App: React.FC = () => {
  const [sites, setSites] = useState<Site[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showProfileSidebar, setShowProfileSidebar] = useState(false);
  const [username, setUsername] = useState('');
  const navigate = useNavigate();

  React.useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUsername = localStorage.getItem('username');
    if (token && savedUsername) {
      setIsAuthenticated(true);
      setUsername(savedUsername);
    }
  }, []);

  React.useEffect(() => {
    const handleUnauthenticated = () => {
      setIsAuthenticated(false);
      setUsername('');
      setShowProfileSidebar(false);
      navigate('/login');
    };

    window.addEventListener(AUTH_LOGOUT_EVENT, handleUnauthenticated);

    return () => {
      window.removeEventListener(AUTH_LOGOUT_EVENT, handleUnauthenticated);
    };
  }, [navigate]);

  const handleLogin = (loggedInUsername: string) => {
    setIsAuthenticated(true);
    setUsername(loggedInUsername);
  };

  const handleRegister = (registeredUsername: string) => {
    setIsAuthenticated(true);
    setUsername(registeredUsername);
  };

  const handleLogout = () => {
    clearAuthSession();
    setIsAuthenticated(false);
    setUsername('');
    setShowProfileSidebar(false);
    navigate('/login');
  };

  const toggleProfileSidebar = () => {
    setShowProfileSidebar(!showProfileSidebar);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div className="App">
        {isAuthenticated && (
          <AppBar position="static">
            <Toolbar>
              <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                Interactive Roman History Map
              </Typography>
              <Button color="inherit" component={RouterLink} to="/">Map</Button>
              <Button color="inherit" component={RouterLink} to="/visited">Visited Sites</Button>
              <Button color="inherit" component={RouterLink} to="/chat">Chat</Button>
              <IconButton
                size="large"
                aria-label="account of current user"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={toggleProfileSidebar}
                color="inherit"
              >
                <AccountCircle />
              </IconButton>
              <Button color="inherit" onClick={handleLogout}>Logout</Button>
            </Toolbar>
          </AppBar>
        )}

        {showProfileSidebar && (
          <ProfileSidebar
            username={username}
            visitedSites={sites.filter(site => site.visited).length}
            onClose={toggleProfileSidebar}
          />
        )}

        <Routes>
          <Route path="/login" element={
            isAuthenticated ? <Navigate to="/" /> : <Login onLogin={handleLogin} />
          } />
          <Route path="/register" element={
            isAuthenticated ? <Navigate to="/" /> : <Register onRegister={handleRegister} />
          } />
          <Route path="/" element={
            isAuthenticated ? <Map setSites={setSites} /> : <Navigate to="/login" />
          } />
          <Route path="/visited" element={
            isAuthenticated ? <VisitedSitesPage sites={sites} /> : <Navigate to="/login" />
          } />
          <Route path="/chat" element={
            isAuthenticated ? <ChatBot /> : <Navigate to="/login" />
          } />
        </Routes>
      </div>
    </ThemeProvider>
  );
};

const AppWrapper: React.FC = () => (
  <Router>
    <App />
  </Router>
);

export default AppWrapper;
