// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

'use client';

import { ArrowRight } from '@carbon/icons-react';
import { useTranslation } from 'react-i18next';
import { Link } from '../../components/Carbon';
import styles from './page.module.scss';

export default function LoginFooterLinks() {
  const { t } = useTranslation();

  return (
    <div className={styles.links}>
      <Link href={t(($) => $.login.documentationUrl)} size="lg" target="_blank">
        {t(($) => $.login.documentationLabel)} <ArrowRight aria-label="Arrow Right" />
      </Link>
      <Link href={t(($) => $.login.supportUrl)} size="lg" target="_blank">
        {t(($) => $.login.supportLabel)} <ArrowRight aria-label="Arrow Right" />
      </Link>
    </div>
  );
}
