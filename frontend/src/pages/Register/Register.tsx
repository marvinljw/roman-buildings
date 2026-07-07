import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { TextField, Button, Paper, Typography, Container, Alert } from '@mui/material';
import { register } from '../../services';
import './RegisterPage.scss';

interface RegisterProps {
  onRegister: (username: string) => void;
}

const Register: React.FC<RegisterProps> = ({ onRegister }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 3) {
      setError('Password must be at least 3 characters');
      return;
    }

    setLoading(true);

    try {
      const response = await register(username, password);
      localStorage.setItem('token', response.token);
      localStorage.setItem('username', response.username);
      onRegister(response.username);
      navigate('/');
    } catch (err: any) {
      setError('Registration failed. Username may already exist.');
      console.error('Registration failed:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page__container">
      <Container component="main" maxWidth="xs">
        <Paper elevation={3} className="register-page__paper">
          <Typography component="h1" variant="h5" className="register-page__title">
            Register
          </Typography>
          {error && (
            <Alert severity="error" className="register-page__error">
              {error}
            </Alert>
          )}
          <form onSubmit={handleSubmit} className="register-page__form">
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
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <TextField
              variant="outlined"
              margin="normal"
              required
              fullWidth
              name="confirmPassword"
              label="Confirm Password"
              type="password"
              id="confirmPassword"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              className="register-page__submit-btn"
              disabled={loading}
            >
              {loading ? 'Registering...' : 'Register'}
            </Button>
            <Typography variant="body2" align="center" className="register-page__login-link">
              Already have an account? <Link to="/login">Login here</Link>
            </Typography>
          </form>
        </Paper>
      </Container>
    </div>
  );
};

export default Register;
