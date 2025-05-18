import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Paper, 
  Typography, 
  Box, 
  List, 
  ListItem, 
  ListItemText,
  Divider,
  CircularProgress,
  Alert,
  AppBar,
  Toolbar,
  IconButton
} from '@mui/material';
import { Refresh as RefreshIcon } from '@mui/icons-material';
import { io } from 'socket.io-client';
import { format } from 'date-fns';

const BACKEND_URL = 'https://upwork-job-track-backend.vercel.app';

function App() {
  const [webhooks, setWebhooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    // Connect to WebSocket
    const socket = io(BACKEND_URL);

    socket.on('connect', () => {
      setConnected(true);
      setError(null);
    });

    socket.on('disconnect', () => {
      setConnected(false);
    });

    socket.on('webhook:history', (history) => {
      setWebhooks(history);
      setLoading(false);
    });

    socket.on('webhook:received', (webhook) => {
      setWebhooks(prev => [webhook, ...prev]);
    });

    // Fetch initial webhooks
    fetchWebhooks();

    return () => {
      socket.disconnect();
    };
  }, []);

  const fetchWebhooks = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/webhooks`);
      if (!response.ok) throw new Error('Failed to fetch webhooks');
      const data = await response.json();
      setWebhooks(data);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <Box sx={{ flexGrow: 1, minHeight: '100vh', bgcolor: '#f5f5f5' }}>
      <AppBar position="static" color="primary">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Upwork Job Track
          </Typography>
          <IconButton color="inherit" onClick={fetchWebhooks}>
            <RefreshIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" sx={{ mt: 4 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {!connected && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            Disconnected from server. Attempting to reconnect...
          </Alert>
        )}

        <Paper elevation={3} sx={{ p: 3 }}>
          <Typography variant="h5" gutterBottom>
            Webhook Feed
          </Typography>
          
          {loading ? (
            <Box display="flex" justifyContent="center" p={3}>
              <CircularProgress />
            </Box>
          ) : webhooks.length === 0 ? (
            <Typography color="textSecondary" align="center">
              No webhooks received yet
            </Typography>
          ) : (
            <List>
              {webhooks.map((webhook, index) => (
                <React.Fragment key={webhook.timestamp}>
                  <ListItem alignItems="flex-start">
                    <ListItemText
                      primary={
                        <Typography variant="subtitle1" color="primary">
                          {format(new Date(webhook.timestamp), 'PPpp')}
                        </Typography>
                      }
                      secondary={
                        <pre style={{ 
                          margin: 0, 
                          whiteSpace: 'pre-wrap',
                          wordBreak: 'break-word',
                          backgroundColor: '#f8f9fa',
                          padding: '8px',
                          borderRadius: '4px'
                        }}>
                          {JSON.stringify(webhook.data, null, 2)}
                        </pre>
                      }
                    />
                  </ListItem>
                  {index < webhooks.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          )}
        </Paper>
      </Container>
    </Box>
  );
}

export default App; 