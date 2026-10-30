// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

'use client';

import classNames from 'classnames';
import { Button, type ButtonKind, type ButtonSize, InlineLoading } from '@carbon/react';
import { useEffect, useState } from 'react';
import { useFormStatus } from 'react-dom';

import styles from './SubmitButton.module.scss';
import { ActionStatus } from '../../typings/common';

export enum SubmitButtonVariant {
  Compact = 'compact',
  Full = 'full',
}

type ButtonLabels = Record<ActionStatus, string>;
type SubmitButtonLabels = Partial<ButtonLabels> & Pick<ButtonLabels, ActionStatus.Idle>;

interface SubmitButtonProps {
  disabled?: boolean;
  formAction?: (data: FormData) => void;
  kind?: ButtonKind;
  label: string | SubmitButtonLabels;
  onSubmitDone?: () => void;
  size?: ButtonSize;
  status: ActionStatus;
  variant?: SubmitButtonVariant;
}

export function SubmitButton({
  disabled = false,
  formAction,
  kind = 'primary',
  label,
  onSubmitDone,
  size,
  status,
  variant = SubmitButtonVariant.Compact,
}: SubmitButtonProps) {
  const formStatus = useFormStatus();
  const [submitStatus, setSubmitStatus] = useState(status);
  const singularLabel = isSingularLabel(label) ? label : null;
  const pluralLabel = !isSingularLabel(label) ? label : null;
  const buttonLabel = singularLabel || pluralLabel?.[submitStatus];

  function isSingularLabel(labels: string | SubmitButtonLabels): labels is string {
    return typeof labels === 'string';
  }

  useEffect(() => {
    // Since the success here comes from the useActionState hook which is unable to provide a state in between success or not,
    // we compensate for the state change ourselves
    if (!formStatus.pending && status === ActionStatus.Success) {
      setSubmitStatus(ActionStatus.Success);

      setTimeout(() => {
        setSubmitStatus(ActionStatus.Idle);
        onSubmitDone?.();
      }, 1000);
    }
  }, [formStatus.pending, status, onSubmitDone]);

  useEffect(() => {
    if (!formStatus.pending && status === ActionStatus.Error) {
      setSubmitStatus(ActionStatus.Error);

      setTimeout(() => {
        setSubmitStatus(ActionStatus.Idle);
      }, 2500);
    }
  }, [formStatus.pending, status]);

  if (disabled) {
    return (
      <Button kind={kind} size={size} disabled>
        {buttonLabel}
      </Button>
    );
  }

  if (formStatus.pending) {
    return (
      <InlineLoading
        className={classNames(
          styles.loading,
          `cds--btn cds--btn--${size} cds--layout--size-${size}`,
          variant === SubmitButtonVariant.Full && styles.full,
        )}
        description={singularLabel || pluralLabel?.[ActionStatus.Pending] || 'Submitting...'}
        status="active"
      />
    );
  }

  if (submitStatus === ActionStatus.Success) {
    return (
      <InlineLoading
        className={classNames(
          styles.loading,
          `cds--btn cds--btn--${size} cds--layout--size-${size}`,
          variant === SubmitButtonVariant.Full && styles.full,
        )}
        description={buttonLabel || 'Success!'}
        status="finished"
      />
    );
  }

  if (submitStatus === ActionStatus.Error) {
    return (
      <InlineLoading
        className={classNames(
          styles.loading,
          `cds--btn cds--btn--${size} cds--layout--size-${size}`,
          variant === SubmitButtonVariant.Full && styles.full,
        )}
        description={buttonLabel || 'Submission error'}
        status="error"
      />
    );
  }

  return (
    <Button type="submit" kind={kind} size={size} formAction={formAction}>
      {buttonLabel}
    </Button>
  );
}
