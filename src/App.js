import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Box,
  Container,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  IconButton,
  Divider,
  Badge,
  CircularProgress,
  Chip,
  AppBar,
  Toolbar,
  useTheme,
  useMediaQuery,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Snackbar,
  Alert
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Notifications as NotificationsIcon,
  Code as CodeIcon,
  Send as SendIcon,
  ContentCopy as CopyIcon,
  DeleteOutline as DeleteIcon,
  InfoOutlined as InfoIcon,
  Link as LinkIcon,
  CloudOutlined as CloudIcon
} from '@mui/icons-material';
import { format } from 'date-fns';

// Your backend URL
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

// Main App component
function App() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [webhooks, setWebhooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newCount, setNewCount] = useState(0);
  const [openTestDialog, setOpenTestDialog] = useState(false);
  const [testWebhookData, setTestWebhookData] = useState('{\n  "event": "test_event",\n  "data": {\n    "message": "This is a test webhook"\n  }\n}');
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
  const [selectedWebhook, setSelectedWebhook] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  // Fetch webhooks on component mount and periodically
  useEffect(() => {
    fetchWebhooks();
    
    // Poll for new webhooks every 5 seconds
    const intervalId = setInterval(() => {
      fetchWebhooks(true);
    }, 5000);
    
    return () => clearInterval(intervalId);
  }, []);
  
  // Function to fetch webhooks from the API
  const fetchWebhooks = async (silent = false) => {
    if (!silent) setLoading(true);
    
    try {
      const response = await fetch(`${API_URL}/api/webhooks`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch webhooks');
      }
      
      const data = await response.json();
      
      // Check for new webhooks
      if (webhooks.length > 0 && data.data.length > webhooks.length) {
        const newWebhooksCount = data.data.length - webhooks.length;
        setNewCount(newWebhooksCount);
        setNotification({
          open: true,
          message: `${newWebhooksCount} new webhook${newWebhooksCount > 1 ? 's' : ''} received!`,
          severity: 'success'
        });
      }
      
      setWebhooks(data.data || []);
      setError(null);
    } catch (err) {
      if (!silent) {
        setError(err.message);
        setNotification({
          open: true,
          message: `Error: ${err.message}`,
          severity: 'error'
        });
      }
    } finally {
      if (!silent) setLoading(false);
    }
  };
  
  // Function to send a test webhook
  const sendTestWebhook = async () => {
    try {
      let parsedData = JSON.parse(testWebhookData);
      
      const response = await fetch(`${API_URL}/api/webhook`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(parsedData)
      });
      
      if (!response.ok) {
        throw new Error('Failed to send test webhook');
      }
      
      setNotification({
        open: true,
        message: 'Test webhook sent successfully!',
        severity: 'success'
      });
      
      setOpenTestDialog(false);
      fetchWebhooks();
    } catch (err) {
      setNotification({
        open: true,
        message: `Error: ${err.message}`,
        severity: 'error'
      });
    }
  };

  // Function to copy text to clipboard
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setNotification({
      open: true,
      message: 'Copied to clipboard!',
      severity: 'success'
    });
  };

  // Function to view webhook details
  const viewWebhookDetails = (webhook) => {
    setSelectedWebhook(webhook);
    setDetailsOpen(true);
  };

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      minHeight: '100vh',
      bgcolor: theme.palette.mode === 'dark' ? '#121212' : '#f5f8fa',
    }}>
      {/* App Bar */}
      <AppBar position="static" elevation={0} sx={{ bgcolor: theme.palette.primary.main }}>
        <Toolbar>
          <Box display="flex" alignItems="center">
            <motion.div
              initial={{ rotate: 0 }}
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: 0 }}
            >
              <CloudIcon sx={{ mr: 1.5, fontSize: 28 }} />
            </motion.div>
            <Typography variant="h5" component="div" sx={{ flexGrow: 1, fontWeight: 600 }}>
              Webhook Monitor
            </Typography>
          </Box>
          
          <Box sx={{ flexGrow: 1 }} />
          
          <Box>
            <IconButton 
              color="inherit" 
              onClick={() => setOpenTestDialog(true)}
              size="large"
              sx={{ mr: 1 }}
            >
              <SendIcon />
            </IconButton>
            
            <Badge badgeContent={newCount} color="error">
              <IconButton 
                color="inherit" 
                onClick={() => { fetchWebhooks(); setNewCount(0); }}
                size="large"
              >
                <RefreshIcon />
              </IconButton>
            </Badge>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4, flexGrow: 1 }}>
        {/* Webhook URL Info Card */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Paper
            elevation={0}
            sx={{
              p: 3,
              mb: 4,
              borderRadius: 2,
              border: `1px solid ${theme.palette.divider}`,
              background: 'linear-gradient(145deg, #2196f3 0%, #3f51b5 100%)',
              color: 'white'
            }}
          >
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={7}>
                <Typography variant="h6" gutterBottom fontWeight="bold">
                  Your Webhook URL
                </Typography>
                <Typography variant="body1" sx={{ mb: 1, opacity: 0.9 }}>
                  Send HTTP POST requests to this URL to receive webhook data:
                </Typography>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    p: 1.5,
                    borderRadius: 1.5,
                    bgcolor: 'rgba(0, 0, 0, 0.2)',
                    fontFamily: 'monospace',
                    fontSize: isMobile ? '0.75rem' : '0.875rem',
                    overflow: 'hidden',
                    whiteSpace: 'nowrap',
                    textOverflow: 'ellipsis'
                  }}
                >
                  <LinkIcon sx={{ mr: 1, opacity: 0.7 }} />
                  {`${API_URL}/api/webhook`}
                  <IconButton
                    color="inherit"
                    size="small"
                    onClick={() => copyToClipboard(`${API_URL}/api/webhook`)}
                    sx={{ ml: 'auto', opacity: 0.7 }}
                  >
                    <CopyIcon fontSize="small" />
                  </IconButton>
                </Box>
              </Grid>
              <Grid item xs={12} md={5}>
                <Box sx={{ textAlign: 'center' }}>
                  <Button
                    variant="contained"
                    color="secondary"
                    startIcon={<SendIcon />}
                    onClick={() => setOpenTestDialog(true)}
                    sx={{
                      px: 3,
                      py: 1.5,
                      borderRadius: 2,
                      boxShadow: '0 4px 10px rgba(0,0,0,0.15)',
                      bgcolor: '#fff',
                      color: '#3f51b5',
                      '&:hover': {
                        bgcolor: '#f5f5f5'
                      }
                    }}
                  >
                    Send Test Webhook
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </motion.div>

        {/* Webhooks List */}
        <Typography variant="h5" sx={{ mb: 3, fontWeight: 500 }}>
          Recent Webhooks
          {webhooks.length > 0 && (
            <Typography component="span" variant="body1" color="text.secondary" sx={{ ml: 1 }}>
              ({webhooks.length})
            </Typography>
          )}
        </Typography>

        {loading && webhooks.length === 0 ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 6 }}>
            <CircularProgress />
          </Box>
        ) : webhooks.length === 0 ? (
          <Paper 
            elevation={0}
            sx={{ 
              p: 4, 
              textAlign: 'center',
              borderRadius: 2,
              border: `1px dashed ${theme.palette.divider}`,
              bgcolor: 'transparent'
            }}
          >
            <NotificationsIcon sx={{ fontSize: 60, color: 'text.secondary', opacity: 0.5, mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No webhooks received yet
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Send a webhook to the URL above to see it displayed here
            </Typography>
            <Button
              variant="outlined"
              color="primary"
              startIcon={<SendIcon />}
              onClick={() => setOpenTestDialog(true)}
              sx={{ mt: 3 }}
            >
              Send Test Webhook
            </Button>
          </Paper>
        ) : (
          <Grid container spacing={3}>
            <AnimatePresence>
              {webhooks.map((webhook, index) => (
                <Grid item xs={12} key={webhook.id}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <Card 
                      elevation={0}
                      sx={{ 
                        borderRadius: 2,
                        overflow: 'hidden',
                        border: `1px solid ${theme.palette.divider}`,
                        '&:hover': {
                          boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
                        },
                        transition: 'all 0.3s'
                      }}
                    >
                      <Box 
                        sx={{ 
                          p: 2, 
                          display: 'flex', 
                          alignItems: 'center',
                          borderBottom: `1px solid ${theme.palette.divider}`,
                          bgcolor: theme.palette.background.default
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <CodeIcon color="primary" sx={{ mr: 1.5 }} />
                          <Typography variant="subtitle1" fontWeight={500}>
                            {webhook.data.event || 'Webhook'}
                          </Typography>
                        </Box>
                        
                        <Chip 
                          label={format(new Date(webhook.timestamp), 'PPpp')}
                          size="small"
                          variant="outlined"
                          sx={{ ml: 2, opacity: 0.7 }}
                        />
                        
                        <Box sx={{ ml: 'auto', display: 'flex' }}>
                          <IconButton size="small" onClick={() => viewWebhookDetails(webhook)}>
                            <InfoIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      </Box>
                      
                      <CardContent sx={{ p: 0 }}>
                        <Box 
                          sx={{ 
                            maxHeight: '200px',
                            overflow: 'auto',
                            p: 2,
                            fontFamily: 'monospace',
                            fontSize: '0.875rem',
                            bgcolor: theme.palette.mode === 'dark' ? '#1e1e1e' : '#f8f9fa' 
                          }}
                        >
                          <pre style={{ margin: 0, whiteSpace: 'pre-wrap', overflowWrap: 'break-word' }}>
                            {JSON.stringify(webhook.data, null, 2)}
                          </pre>
                        </Box>
                      </CardContent>
                    </Card>
                  </motion.div>
                </Grid>
              ))}
            </AnimatePresence>
          </Grid>
        )}
      </Container>

      {/* Footer */}
      <Box
        component="footer"
        sx={{
          py: 3,
          px: 2,
          mt: 'auto',
          backgroundColor: theme.palette.background.paper,
          borderTop: `1px solid ${theme.palette.divider}`
        }}
      >
        <Container maxWidth="lg">
          <Typography variant="body2" color="text.secondary" align="center">
            Upwork Job Track — Webhook Monitor &copy; {new Date().getFullYear()}
          </Typography>
        </Container>
      </Box>

      {/* Test Webhook Dialog */}
      <Dialog 
        open={openTestDialog} 
        onClose={() => setOpenTestDialog(false)}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>Send Test Webhook</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Enter JSON data to send as a test webhook:
          </Typography>
          <TextField
            fullWidth
            multiline
            minRows={8}
            maxRows={15}
            value={testWebhookData}
            onChange={(e) => setTestWebhookData(e.target.value)}
            InputProps={{
              style: { fontFamily: 'monospace', fontSize: '0.875rem' }
            }}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenTestDialog(false)}>Cancel</Button>
          <Button 
            onClick={sendTestWebhook} 
            variant="contained" 
            color="primary"
            startIcon={<SendIcon />}
          >
            Send Webhook
          </Button>
        </DialogActions>
      </Dialog>

      {/* Webhook Details Dialog */}
      <Dialog
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        fullWidth
        maxWidth="md"
      >
        {selectedWebhook && (
          <>
            <DialogTitle>
              Webhook Details
              <IconButton
                onClick={() => setDetailsOpen(false)}
                sx={{ position: 'absolute', right: 8, top: 8 }}
              >
                &times;
              </IconButton>
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">ID</Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>{selectedWebhook.id}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">Timestamp</Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {format(new Date(selectedWebhook.timestamp), 'PPpp')}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">Source</Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>{selectedWebhook.source || 'Unknown'}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">Raw Data</Typography>
                  <Paper 
                    elevation={0} 
                    sx={{ 
                      p: 2, 
                      mt: 1, 
                      bgcolor: theme.palette.mode === 'dark' ? '#1e1e1e' : '#f8f9fa',
                      border: `1px solid ${theme.palette.divider}`,
                      borderRadius: 1,
                      position: 'relative',
                      fontFamily: 'monospace',
                      fontSize: '0.875rem'
                    }}
                  >
                    <IconButton 
                      size="small" 
                      sx={{ position: 'absolute', top: 8, right: 8 }}
                      onClick={() => copyToClipboard(JSON.stringify(selectedWebhook.data, null, 2))}
                    >
                      <CopyIcon fontSize="small" />
                    </IconButton>
                    <pre style={{ margin: 0, whiteSpace: 'pre-wrap', overflow: 'auto', maxHeight: '400px' }}>
                      {JSON.stringify(selectedWebhook.data, null, 2)}
                    </pre>
                  </Paper>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDetailsOpen(false)}>Close</Button>
              <Button 
                startIcon={<CopyIcon />}
                onClick={() => copyToClipboard(JSON.stringify(selectedWebhook.data, null, 2))}
              >
                Copy Data
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Notification Snackbar */}
      <Snackbar
        open={notification.open}
        autoHideDuration={5000}
        onClose={() => setNotification({ ...notification, open: false })}
      >
        <Alert 
          severity={notification.severity}
          variant="filled"
          onClose={() => setNotification({ ...notification, open: false })}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default App; 