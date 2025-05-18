import React from 'react';
import { List, ListItem, ListItemText, Typography, Divider } from '@mui/material';

interface WebhookData {
  timestamp: string;
  [key: string]: any;
}

interface WebhookListProps {
  webhooks: WebhookData[];
}

const WebhookList: React.FC<WebhookListProps> = ({ webhooks }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const renderWebhookData = (data: any) => {
    return Object.entries(data)
      .filter(([key]) => key !== 'timestamp')
      .map(([key, value]) => (
        <Typography key={key} variant="body2" color="text.secondary">
          <strong>{key}:</strong> {JSON.stringify(value)}
        </Typography>
      ));
  };

  return (
    <List>
      {webhooks.length === 0 ? (
        <ListItem>
          <ListItemText primary="No webhook data received yet" />
        </ListItem>
      ) : (
        webhooks.map((webhook, index) => (
          <React.Fragment key={index}>
            <ListItem alignItems="flex-start">
              <ListItemText
                primary={formatDate(webhook.timestamp)}
                secondary={renderWebhookData(webhook)}
              />
            </ListItem>
            {index < webhooks.length - 1 && <Divider />}
          </React.Fragment>
        ))
      )}
    </List>
  );
};

export default WebhookList; 