// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

import { type ChangeEvent, startTransition, type SubmitEvent, useActionState, useState } from 'react';
import { FeatureFlagType } from 'shared-types';

import createFeatureFlag, { type CreateFeatureFlagActionState } from '../../actions/createFeatureFlag';
import useInputValidation from '../../hooks/useInputValidation';
import {
  Button,
  ComposedModal,
  InlineNotification,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Select,
  SelectItem,
  SelectSkeleton,
  Stack,
  TextArea,
  TextInput,
} from '../../components/Carbon';
import styles from './CreateFeatureFlagModal.module.scss';
import useGetUserApplicationsQuery from '../../api/queries/useGetUserApplicationsQuery';
import {
  createFeatureFlagFieldsSchema,
  objectVariationValueSchema,
  variationValueSchema,
} from '../../schemas/createFeatureFlag';
import { ActionStatus } from '../../typings/common';
import { JSONInput } from '../../components/JSONInput/JSONInput';
import { SubmitButton, SubmitButtonVariant } from '../../components/SubmitButton/SubmitButton';
import { authClient } from '../../lib/auth-client';
import { featureFlagTypeLabels, lowercaseKebabCasePattern } from '../../constants/common';

const defaultVariationValues = {
  [FeatureFlagType.Boolean]: ['true', 'false'],
  [FeatureFlagType.Integer]: ['0', '1'],
  [FeatureFlagType.Object]: ['{}', '{}'],
  [FeatureFlagType.String]: ['', ''],
};

interface CreateFeatureFlagModalProps {
  defaultApplicationId?: string;
  open: boolean;
  onClose: () => void;
  onSuccess: (applicationName: string, featureFlagKey: string) => void;
}

export function CreateFeatureFlagModal({
  open,
  onClose,
  onSuccess,
  defaultApplicationId = '',
}: CreateFeatureFlagModalProps) {
  const session = authClient.useSession();
  const getUserApplicationsQuery = useGetUserApplicationsQuery(session.data?.user.id || '');
  const applications = getUserApplicationsQuery.data?.data || [];
  const initialApplicationId = defaultApplicationId || applications[0]?.id || '';
  const initialState: CreateFeatureFlagActionState = {
    status: ActionStatus.Idle,
    form: {
      applicationId: initialApplicationId,
      defaultVariationKey: 'enabled',
      description: '',
      key: '',
      type: FeatureFlagType.Boolean,
      variationKey1: 'enabled',
      variationKey2: 'disabled',
      variationValue1: 'true',
      variationValue2: 'false',
    },
  };
  const [formState, formAction] = useActionState(createFeatureFlag, initialState);
  const [featureFlagType, setFeatureFlagType] = useState(initialState.form.type);
  const [userDefinedVariationKeys, setUserDefinedVariationKeys] = useState({
    variationKey1: initialState.form.variationKey1,
    variationKey2: initialState.form.variationKey2,
  });
  const variationsList = [userDefinedVariationKeys.variationKey1, userDefinedVariationKeys.variationKey2].sort();
  const noApplications = !getUserApplicationsQuery.data?.data.length;
  const variationValueType = featureFlagType === FeatureFlagType.Integer ? 'number' : 'text';
  const keyInputValidation = useInputValidation({
    serverError: formState.errors?.fieldErrors?.key,
    schema: createFeatureFlagFieldsSchema.shape.key,
  });
  const applicationInputValidation = useInputValidation({
    serverError: formState.errors?.fieldErrors?.applicationId,
    schema: createFeatureFlagFieldsSchema.shape.applicationId,
  });
  const descriptionInputValidation = useInputValidation({
    serverError: formState.errors?.fieldErrors?.description,
    schema: createFeatureFlagFieldsSchema.shape.description,
  });
  const variationKey1InputValidation = useInputValidation({
    serverError: formState.errors?.fieldErrors?.variationKey1,
    schema: createFeatureFlagFieldsSchema.shape.variationKey1,
  });
  const variationKey2InputValidation = useInputValidation({
    serverError: formState.errors?.fieldErrors?.variationKey2,
    schema: createFeatureFlagFieldsSchema.shape.variationKey2,
  });
  const variationValue1InputValidation = useInputValidation({
    serverError: formState.errors?.fieldErrors?.variationValue1,
    schema: featureFlagType === FeatureFlagType.Object ? objectVariationValueSchema : variationValueSchema,
  });
  const variationValue2InputValidation = useInputValidation({
    serverError: formState.errors?.fieldErrors?.variationValue2,
    schema: featureFlagType === FeatureFlagType.Object ? objectVariationValueSchema : variationValueSchema,
  });
  const variationKeyInputValidations = {
    1: variationKey1InputValidation,
    2: variationKey2InputValidation,
  };
  const variationValueInputValidations = {
    1: variationValue1InputValidation,
    2: variationValue2InputValidation,
  };
  const typeInputValidation = useInputValidation({
    serverError: formState.errors?.fieldErrors?.type,
    schema: createFeatureFlagFieldsSchema.shape.type,
  });
  const defaultVariationInputValidation = useInputValidation({
    serverError: formState.errors?.fieldErrors?.defaultVariationKey,
    schema: createFeatureFlagFieldsSchema.shape.defaultVariationKey,
  });

  function handleVariationKeyChange(event: ChangeEvent<HTMLInputElement>) {
    setUserDefinedVariationKeys((currentKeys) => ({
      ...currentKeys,
      [event.target.name]: event.target.value,
    }));
  }

  function handleFeatureFlagTypeChange(event: ChangeEvent<HTMLSelectElement>) {
    const newType = event.target.value as FeatureFlagType;

    setFeatureFlagType(newType);
  }

  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    startTransition(() => {
      formAction(new FormData(event.currentTarget));
    });
  }

  function handleSubmitDone() {
    const application = applications.find((application) => application.id === formState.form.applicationId);
    const applicationName = application?.name || '';

    onSuccess(applicationName, formState.form.key);
  }

  return (
    <form action={formAction} onSubmit={handleSubmit} name="createFeatureFlagModal">
      <ComposedModal
        aria-label="Create feature flag modal"
        id="createFeatureFlagModal"
        onClose={() => onClose()}
        open={open}
        preventCloseOnClickOutside
      >
        <ModalHeader title="Create Flag" className={styles.header}>
          <p className={styles.description}>Feature flags will be disabled by default.</p>
        </ModalHeader>
        <ModalBody>
          <Stack gap={6}>
            {noApplications ? (
              <InlineNotification
                hideCloseButton
                kind="error"
                subtitle="There are no applications assigned to you."
                title="An application is required in order to create a flag"
              />
            ) : null}
            <TextInput
              data-modal-primary-focus
              helperText="Format should follow a lowercase, kebab-case convention (ex. my-feature-flag)"
              id="key"
              invalid={!!keyInputValidation.error}
              invalidText={keyInputValidation.error}
              name="key"
              labelText="Flag Key"
              onBlur={keyInputValidation.handleBlur}
              onChange={keyInputValidation.handleChange}
              onInvalid={keyInputValidation.handleInvalid}
              placeholder="my-feature-flag"
              required
              pattern={lowercaseKebabCasePattern.source}
            />
            <TextArea
              enableCounter
              id="description"
              invalid={!!descriptionInputValidation.error}
              invalidText={descriptionInputValidation.error}
              name="description"
              labelText="Description"
              placeholder=""
              defaultValue={initialState.form.description}
              onBlur={descriptionInputValidation.handleBlur}
              onChange={descriptionInputValidation.handleChange}
              onInvalid={descriptionInputValidation.handleInvalid}
              required
              rows={2}
            />
            {getUserApplicationsQuery.isPending ? (
              <SelectSkeleton />
            ) : (
              <Select
                id="applicationId"
                invalid={!!applicationInputValidation.error}
                invalidText={applicationInputValidation.error}
                labelText="Application"
                name="applicationId"
                defaultValue={initialState.form.applicationId}
                onBlur={applicationInputValidation.handleBlur}
                onChange={applicationInputValidation.handleChange}
                onInvalid={applicationInputValidation.handleInvalid}
              >
                {applications.map((application) => (
                  <SelectItem value={application.id} text={application.name} key={application.id} />
                ))}
              </Select>
            )}
            <Select
              id="type"
              invalid={!!typeInputValidation.error}
              invalidText={typeInputValidation.error}
              labelText="Type"
              name="type"
              defaultValue={initialState.form.type}
              onChange={handleFeatureFlagTypeChange}
              onInvalid={typeInputValidation.handleInvalid}
              required
            >
              {Object.values(FeatureFlagType).map((type) => (
                <SelectItem value={type} text={featureFlagTypeLabels[type]} key={type} />
              ))}
            </Select>
            <div>
              <h3 className={styles.label}>Variations</h3>
              <p className={styles.helperText}>
                You can create more variations once you&apos;ve created the feature flag.
              </p>
            </div>
            {([1, 2] as const).map((item) => (
              <div className={styles.variationsContainer} key={item}>
                <Stack orientation="vertical" gap={7}>
                  <TextInput
                    defaultValue={initialState.form[`variationKey${item}` as keyof typeof initialState.form]}
                    id={`variationKey${item}`}
                    invalid={!!variationKeyInputValidations[item].error}
                    invalidText={variationKeyInputValidations[item].error}
                    labelText="Key"
                    name={`variationKey${item}`}
                    onBlur={(event) => {
                      variationKeyInputValidations[item].handleBlur(event);
                    }}
                    onChange={(event) => {
                      handleVariationKeyChange(event);
                      variationKeyInputValidations[item].handleChange(event);
                    }}
                    onInvalid={variationKeyInputValidations[item].handleInvalid}
                    pattern={lowercaseKebabCasePattern.source}
                    placeholder="enabled"
                    required
                  />
                  {featureFlagType === FeatureFlagType.Object ? (
                    <JSONInput
                      key={`${featureFlagType}-variationValue${item}`}
                      defaultValue={defaultVariationValues[featureFlagType][item - 1]}
                      id={`variationValue${item}`}
                      invalid={!!variationValueInputValidations[item].error}
                      invalidText={variationValueInputValidations[item].error}
                      labelText="Value (JSON)"
                      helperText={'Enter a valid JSON object (e.g., { "key": "value" })'}
                      name={`variationValue${item}`}
                      onChange={(value) => variationValueInputValidations[item].handleChange(undefined, value)}
                    />
                  ) : (
                    <TextInput
                      key={`${featureFlagType}-variationValue${item}`}
                      defaultValue={defaultVariationValues[featureFlagType][item - 1]}
                      id={`variationValue${item}`}
                      invalid={!!variationValueInputValidations[item].error}
                      invalidText={variationValueInputValidations[item].error}
                      labelText="Value"
                      name={`variationValue${item}`}
                      onChange={variationValueInputValidations[item].handleChange}
                      onBlur={variationValueInputValidations[item].handleBlur}
                      onInvalid={variationValueInputValidations[item].handleInvalid}
                      readOnly={featureFlagType === FeatureFlagType.Boolean}
                      required
                      type={variationValueType}
                    />
                  )}
                </Stack>
              </div>
            ))}
            <Select
              defaultValue={initialState.form.defaultVariationKey}
              id="defaultVariationKey"
              name="defaultVariationKey"
              labelText="Default Variation"
              invalid={!!defaultVariationInputValidation.error}
              invalidText={defaultVariationInputValidation.error}
              onBlur={defaultVariationInputValidation.handleBlur}
              onChange={defaultVariationInputValidation.handleChange}
              onInvalid={defaultVariationInputValidation.handleInvalid}
              required
            >
              {variationsList.filter(Boolean).map((variation) => (
                <SelectItem value={variation} text={variation} key={variation} />
              ))}
            </Select>
            {formState.errors?.actionError ? (
              <InlineNotification
                hideCloseButton
                kind="error"
                subtitle={formState.errors.actionError.subtitle}
                title={formState.errors.actionError.title}
              />
            ) : null}
          </Stack>
        </ModalBody>
        <ModalFooter>
          <Button kind="secondary" onClick={() => onClose()}>
            Cancel
          </Button>
          <SubmitButton
            label="Create flag"
            disabled={noApplications}
            status={formState.status}
            variant={SubmitButtonVariant.Full}
            onSubmitDone={handleSubmitDone}
          />
        </ModalFooter>
      </ComposedModal>
    </form>
  );
}
