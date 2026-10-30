// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

'use client';

import CodeMirror, { EditorView } from '@uiw/react-codemirror';
import classNames from 'classnames';
import { json } from '@codemirror/lang-json';
import { useMemo, useState } from 'react';
import { WarningFilled } from '@carbon/icons-react';

import styles from './JSONInput.module.scss';

interface JSONInputProps {
  className?: string;
  defaultValue?: string;
  height?: string;
  helperText?: string;
  id: string;
  invalid?: boolean;
  invalidText?: string;
  labelText: string;
  name: string;
  onChange?: (value: string) => void;
  readOnly?: boolean;
}

/**
 * A code editor for JSON form fields. The editor is not a native form control, so the current value is
 * mirrored to a hidden input to keep the field part of the surrounding form's data.
 */
export function JSONInput({
  className,
  defaultValue = '',
  height = '120px',
  helperText,
  id,
  invalid = false,
  invalidText,
  labelText,
  name,
  onChange,
  readOnly = false,
}: JSONInputProps) {
  const [value, setValue] = useState(defaultValue);
  const hasMessage = invalid || !!helperText;
  const messageId = invalid ? `${id}-error-msg` : `${id}-helper-text`;
  const extensions = useMemo(() => {
    const contentAttributes: Record<string, string> = { 'aria-label': labelText };

    if (invalid) {
      contentAttributes['aria-invalid'] = 'true';
    }

    if (hasMessage) {
      contentAttributes['aria-describedby'] = messageId;
    }

    return [json(), EditorView.contentAttributes.of(contentAttributes)];
  }, [hasMessage, invalid, labelText, messageId]);

  function handleChange(updatedValue: string) {
    setValue(updatedValue);
    onChange?.(updatedValue);
  }

  return (
    <div className={classNames('cds--form-item', styles.root, className)}>
      <span className="cds--label">{labelText}</span>
      <div className={styles.field}>
        <CodeMirror
          className={classNames(styles.editor, invalid && styles.invalid)}
          extensions={extensions}
          height={height}
          id={id}
          onChange={handleChange}
          readOnly={readOnly}
          value={value}
        />
        {invalid ? <WarningFilled aria-hidden className={styles.invalidIcon} size={16} /> : null}
      </div>
      {hasMessage ? (
        <p className={classNames('cds--form__helper-text', invalid && styles.invalidText)} id={messageId}>
          {invalid ? invalidText : helperText}
        </p>
      ) : null}
      <input name={name} readOnly type="hidden" value={value} />
    </div>
  );
}
