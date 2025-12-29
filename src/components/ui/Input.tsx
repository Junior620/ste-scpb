'use client';

import { forwardRef, InputHTMLAttributes, ReactNode, useId } from 'react';

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /** Label for the input */
  label?: string;
  /** Helper text below the input */
  helperText?: string;
  /** Error message (also sets error state) */
  error?: string;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Icon to display at the start */
  leftIcon?: ReactNode;
  /** Icon to display at the end */
  rightIcon?: ReactNode;
  /** Full width input */
  fullWidth?: boolean;
  /** Additional CSS classes for the container */
  containerClassName?: string;
  /** Additional CSS classes for the input */
  className?: string;
}

const sizeStyles = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-4 py-3 text-lg',
};

const iconSizeStyles = {
  sm: 'pl-9',
  md: 'pl-10',
  lg: 'pl-11',
};

const rightIconSizeStyles = {
  sm: 'pr-9',
  md: 'pr-10',
  lg: 'pr-11',
};

/**
 * Input Component
 * Accessible text input with label, helper text, and error states
 * Supports icons and keyboard navigation
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      helperText,
      error,
      size = 'md',
      leftIcon,
      rightIcon,
      fullWidth = false,
      containerClassName = '',
      className = '',
      id: providedId,
      disabled,
      required,
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const id = providedId || generatedId;
    const helperId = `${id}-helper`;
    const errorId = `${id}-error`;
    const hasError = Boolean(error);

    return (
      <div className={`${fullWidth ? 'w-full' : ''} ${containerClassName}`}>
        {label && (
          <label
            htmlFor={id}
            className="block text-sm font-medium text-foreground mb-1.5"
          >
            {label}
            {required && (
              <span className="text-error ml-1" aria-hidden="true">
                *
              </span>
            )}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <span
              className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground-muted"
              aria-hidden="true"
            >
              {leftIcon}
            </span>
          )}
          <input
            ref={ref}
            id={id}
            disabled={disabled}
            required={required}
            aria-invalid={hasError}
            aria-describedby={
              hasError ? errorId : helperText ? helperId : undefined
            }
            className={`
              w-full rounded-lg border bg-background-secondary text-foreground
              placeholder:text-foreground-muted
              transition-colors duration-200
              focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background
              disabled:opacity-50 disabled:cursor-not-allowed
              ${sizeStyles[size]}
              ${leftIcon ? iconSizeStyles[size] : ''}
              ${rightIcon ? rightIconSizeStyles[size] : ''}
              ${
                hasError
                  ? 'border-error focus:ring-error focus:border-error'
                  : 'border-border focus:ring-accent focus:border-accent'
              }
              ${className}
            `}
            {...props}
          />
          {rightIcon && (
            <span
              className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground-muted"
              aria-hidden="true"
            >
              {rightIcon}
            </span>
          )}
        </div>
        {helperText && !hasError && (
          <p id={helperId} className="mt-1.5 text-sm text-foreground-muted">
            {helperText}
          </p>
        )}
        {hasError && (
          <p id={errorId} className="mt-1.5 text-sm text-error" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
