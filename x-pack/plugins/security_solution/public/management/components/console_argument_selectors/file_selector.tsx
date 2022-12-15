/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import React, { memo, useCallback, useMemo, useState } from 'react';
import { EuiButtonIcon, EuiFilePicker, EuiPopover } from '@elastic/eui';
import type { EuiFilePickerProps } from '@elastic/eui/src/components/form/file_picker/file_picker';
import { v4 as uuidV4 } from 'uuid';
import type { CommandArgumentValueSelectorProps } from '../console/types';

// FIXME:PT support props for: file size limit, single

export const ArgumentFileSelector = memo<CommandArgumentValueSelectorProps>(
  ({ value, valueText, onChange }) => {
    const [isPopoverOpen, setIsPopoverOpen] = useState(true);

    const filePickerUUID = useMemo(() => {
      return uuidV4();
    }, []);

    const handleOpenPopover = useCallback(() => {
      setIsPopoverOpen((prevState) => !prevState);
    }, []);

    const handleClosePopover = useCallback(() => {
      setIsPopoverOpen(false);
    }, []);

    const handleFileSelection = useCallback<EuiFilePickerProps['onChange']>(
      (selectedFiles) => {
        // FIXME:PT handle validations here - like what if multiple files are selected, file size limits, and any others

        const file = selectedFiles?.item(0);

        onChange({
          value: file,
          valueText: file ? file.name : '',
        });

        setIsPopoverOpen(false);
      },
      [onChange]
    );

    return (
      <div>
        <span>{valueText || 'Click folder icon to select file'}</span>
        <EuiPopover
          isOpen={isPopoverOpen}
          closePopover={handleClosePopover}
          anchorPosition="upCenter"
          initialFocus={`#${filePickerUUID}`}
          button={<EuiButtonIcon iconType="folderOpen" onClick={handleOpenPopover} />}
        >
          {isPopoverOpen && (
            <EuiFilePicker
              id={filePickerUUID}
              onChange={handleFileSelection}
              fullWidth
              display="large"
            />
          )}
        </EuiPopover>
      </div>
    );
  }
);
ArgumentFileSelector.displayName = 'ArgumentFileSelector';
