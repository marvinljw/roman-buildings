import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TextField, Button, Paper, Typography, Container } from '@mui/material';

interface LoginProps {
  onLogin: (username: string) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // For now, we'll just do a simple check
    if (username && password) {
      // In a real app, you would validate credentials here
      console.log('Logged in with', username, password);
      onLogin(username); // Call the onLogin function passed from the parent with the username
      navigate('/'); // Redirect to home page after login
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Paper elevation={3} sx={{ padding: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 8 }}>
        <Typography component="h1" variant="h5">
          Login
        </Typography>
        <form onSubmit={handleSubmit} style={{ width: '100%', marginTop: 1 }}>
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
            sx={{ mt: 3, mb: 2 }}
          >
            Login
          </Button>
        </form>
      </Paper>
    </Container>
  );
};

export default Login;