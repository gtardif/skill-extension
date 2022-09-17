import React from 'react';
import { createDockerDesktopClient } from '@docker/extension-api-client';
import { Stack, TextField, Typography } from '@mui/material';

import * as skill from "@atomist/skill";

// Note: This line relies on Docker Desktop's presence as a host application.
// If you're running this React app in a browser, it won't work properly.
const client = createDockerDesktopClient();

function useDockerDesktopClient() {
  return client;
}

export function App() {
  const [response, setResponse] = React.useState<string>();
  const ddClient = useDockerDesktopClient();

  skill.subscribe({
    namespace: "atomist",
    name: "skill-extension",
    apiKey: "<api key>",
    workspaceId: "<workspace id>",
    debug: true,
  }, {"new_issue": async ctx => {
    setResponse(JSON.stringify(ctx.event.context.subscription.result[0][0]));
    return skill.status.completed("Handled new issue event");
  }}, require("pusher-js/with-encryption"));

  return (
    <>
      <Typography variant="h3">Docker extension demo</Typography>
      <Stack direction="row" alignItems="start" spacing={2} sx={{ mt: 4 }}>
      <TextField
          label="Subscription event"
          sx={{ width: "100%" }}
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

