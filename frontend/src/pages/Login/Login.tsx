import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TextField, Button, Paper, Typography, Container, Alert } from '@mui/material';
import { login } from '../../services';
import './LoginPage.scss';

interface LoginProps {
  onLogin: (username: string) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await login(username, password);
      localStorage.setItem('token', response.token);
      localStorage.setItem('username', response.username);
      onLogin(response.username);
      navigate('/');
    } catch (err: any) {
      setError('Invalid username or password');
      console.error('Login failed:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page__container">
      <Container component="main" maxWidth="xs">
        <Paper elevation={3} className="login-page__paper">
          <Typography component="h1" variant="h5" className="login-page__title">
            Login
          </Typography>
          {error && (
            <Alert severity="error" className="login-page__error">
              {error}
            </Alert>
          )}
          <form onSubmit={handleSubmit} className="login-page__form">
            <TextField
              variant="outlined"
              margin="normal"
              required
              fullWidth
              id="username"
              label="Username"
              name="username"
              autoComplete="username"
              autoFocus
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <TextField
              variant="outlined"
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              className="login-page__submit-btn"
              disabled={loading}
            >
              {loading ? 'Logging in...' : 'Login'}
            </Button>
            <Typography
              variant="body2"
              color="textSecondary"
              align="center"
              className="login-page__demo-info"
            >
              Demo account: username = x, password = x
            </Typography>
            <Typography variant="body2" align="center" className="login-page__register-link">
              Don't have an account? <a href="/register">Register here</a>
            </Typography>
          </form>
        </Paper>
      </Container>
    </div>
  );
};

export default Login;
