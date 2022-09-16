import React from 'react';
import { createDockerDesktopClient } from '@docker/extension-api-client';
import { Stack, TextField, Typography } from '@mui/material';

import Pusher from 'pusher-js/with-encryption';

// Note: This line relies on Docker Desktop's presence as a host application.
// If you're running this React app in a browser, it won't work properly.
const client = createDockerDesktopClient();

function useDockerDesktopClient() {
  return client;
}

export function App() {
  const [response, setResponse] = React.useState<string>();
  const ddClient = useDockerDesktopClient();

  Pusher.logToConsole = true;

  var pusher = new Pusher('e7f313cb5f6445399f58', {
    cluster: 'mt1',
    channelAuthorization: {
      endpoint: 'https://api.atomist.com/pusher/channel/auth',
      headers: {
        'Authorization': 'Bearer <insert token>'
      }
    } as any
  });
  
  var channel = pusher.subscribe('private-encrypted-<workspace id>_atomist_skill-extension');
  channel.bind('execution-trigger', data => {
    setResponse(JSON.stringify(data));
  });

  return (
    <>
      <Typography variant="h3">Docker extension demo</Typography>
      <Stack direction="row" alignItems="start" spacing={2} sx={{ mt: 4 }}>
      <TextField
          label="Subscription event"
          sx={{ width: 480 }}
          disabled
          multiline
          variant="outlined"
          minRows={5}
          value={response ?? ''}
        />
      </Stack>
    </>
  );
}
