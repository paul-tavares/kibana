/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import React, { memo, useEffect, useState } from 'react';
import { EuiSpacer } from '@elastic/eui';
import { useHttp } from '../../../../common/lib/kibana';
import type { ActionRequestComponentProps } from '../types';
import { ResponseActionFileDownloadLink } from '../../response_action_file_download_link';

export const ExecuteFileAction = memo<
  ActionRequestComponentProps<{
    file: File;
  }>
>(({ command, setStore, store, setStatus }) => {
  const file = command.args.args.file[0];
  const http = useHttp();

  const [newFileInfo, setNewFileInfo] = useState<undefined | object>(undefined);

  useEffect(() => {
    (async () => {
      const actionApiState = store.actionApiState ?? {
        request: {
          sent: false,
        },
      };

      if (!actionApiState.request.sent) {
        actionApiState.request.sent = true;
        setStore({
          ...store,
          actionApiState,
        });

        const uploadedFile = await http.post('/api/endpoint/action/upload', {
          body: file,
          headers: {
            'Content-Type': 'application/octet-stream',
          },
        });

        setNewFileInfo(uploadedFile);
        setStatus('success');
      }
    })();
  }, [file, http, setStatus, setStore, store]);

  return (
    <div>
      <div>
        <strong>{`Uploading file: ${file.name}`}</strong>
      </div>
      {newFileInfo && (
        <>
          <div>
            <pre>{JSON.stringify(newFileInfo, null, 2)}</pre>
          </div>

          <EuiSpacer size="xxl" />

          <div>
            <ResponseActionFileDownloadLink
              action={{
                isCompleted: true,
                wasSuccessful: true,
                agents: [newFileInfo.data.id.substring(newFileInfo.data.id.indexOf('.') + 1)],
                id: 'kbn_upload',
              }}
              agentId={newFileInfo.data.id.substring(newFileInfo.data.id.indexOf('.') + 1)}
            />
          </div>
        </>
      )}
    </div>
  );
});
ExecuteFileAction.displayName = 'ExecuteFileAction';
