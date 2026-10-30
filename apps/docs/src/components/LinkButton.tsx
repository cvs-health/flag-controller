// SPDX-FileCopyrightText: © 2026 CVS Health and/or one of its affiliates.
// SPDX-License-Identifier: Apache-2.0

export enum LinkButtonVariant {
  Primary = 'primary',
  Secondary = 'secondary',
  Tertiary = 'tartiary',
}

export enum LinkButtonSize {
  Small = 'small',
  Medium = 'medium',
  Large = 'large',
}

export interface LinkButtonProps {
  className?: string;
  href: string;
  icon?: React.ReactNode;
  label: string;
  size?: LinkButtonSize;
  variant?: LinkButtonVariant;
}

function LinkButton({
  href,
  label,
  icon,
  variant = LinkButtonVariant.Primary,
  size = LinkButtonSize.Medium,
  className = '',
}: LinkButtonProps) {
  const textSize = {
    [LinkButtonSize.Small]: 'text-sm',
    [LinkButtonSize.Medium]: 'text-base',
    [LinkButtonSize.Large]: 'text-lg',
  };
  const padding = {
    [LinkButtonSize.Small]: 'px-5 py-2',
    [LinkButtonSize.Medium]: 'px-6 py-3',
    [LinkButtonSize.Large]: 'px-8 py-4',
  };
  const baseClassNames = `no-underline hover:no-underline rounded-[14px] font-semibold duration-150 ${padding[size]} ${textSize[size]}`;

  if (variant === LinkButtonVariant.Secondary) {
    return (
      <a
        href={href}
        className={`${baseClassNames} text-primary-text hover:text-primary-text border border-solid border-white-off bg-white hover:bg-white-subtle transition-colors ${className}`}
      >
        {label}
      </a>
    );
  }

  const nonSecondaryClassNames = `${baseClassNames} flex items-center gap-2 text-white hover:text-white hover:opacity-90 transition-opacity`;

  return (
    <a
      href={href}
      className={`${nonSecondaryClassNames} ${variant === LinkButtonVariant.Primary ? 'bg-(image:--color-primary-gradient)' : 'bg-(image:--color-cyan-gradient)'} ${className}`}
    >
      {icon}
      {label}
    </a>
  );
}

export default LinkButton;
