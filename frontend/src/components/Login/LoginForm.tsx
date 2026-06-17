import React, { useState } from 'react';
import { TextField, Button, Paper, Typography, Container } from '@mui/material';
import './LoginForm.scss';

interface LoginFormProps {
  onLogin: (username: string) => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username && password) {
      onLogin(username);
    }
  };

  return (
    <Container component="main" maxWidth="xs" className="login-form-container">
      <Paper elevation={3} className="login-form-paper">
        <Typography component="h1" variant="h5">
          Login
        </Typography>
        <form onSubmit={handleSubmit} className="login-form">
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
            className="submit-button"
          >
            Login
          </Button>
        </form>
      </Paper>
    </Container>
  );
};

export default LoginForm;