import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { Container, Typography, Paper, Box } from '@mui/material';
import WebhookList from './components/WebhookList';

const socket = io(process.env.NODE_ENV === 'production' 
  ? 'https://upwork-job-track-backend.vercel.app'
  : 'http://localhost:5000',
  {
    path: '/api/socket.io',
    transports: ['websocket', 'polling']
  }
);

function App() {
  const [webhooks, setWebhooks] = useState<any[]>([]);

  useEffect(() => {
    // Listen for initial data
    socket.on('initialData', (data) => {
      setWebhooks(data);
    });

    // Listen for new webhook data
    socket.on('newWebhookData', (data) => {
      setWebhooks(prev => [data, ...prev]);
    });

    // Cleanup on unmount
    return () => {
      socket.off('initialData');
      socket.off('newWebhookData');
    };
  }, []);

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom align="center">
          Webhook Data Monitor
        </Typography>
        <Paper elevation={3} sx={{ p: 2 }}>
          <WebhookList webhooks={webhooks} />
        </Paper>
      </Box>
    </Container>
  );
}

export default App;
