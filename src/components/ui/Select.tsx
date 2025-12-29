'use client';

import { forwardRef, SelectHTMLAttributes, ReactNode, useId } from 'react';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  /** Label for the select */
  label?: ReactNode;
  /** Helper text below the select */
  helperText?: string;
  /** Error message (also sets error state) */
  error?: string;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Options to display */
  options: SelectOption[];
  /** Placeholder option text */
  placeholder?: string;
  /** Full width select */
  fullWidth?: boolean;
  /** Icon to display at the start */
  leftIcon?: ReactNode;
  /** Additional CSS classes for the container */
  containerClassName?: string;
  /** Additional CSS classes for the select */
  className?: string;
}

const sizeStyles = {
  sm: 'px-3 py-1.5 text-sm pr-8',
  md: 'px-4 py-2 text-base pr-10',
  lg: 'px-4 py-3 text-lg pr-12',
};

const iconSizeStyles = {
  sm: 'pl-9',
  md: 'pl-10',
  lg: 'pl-11',
};

/**
 * Select Component
 * Accessible select dropdown with label, helper text, and error states
 * Supports keyboard navigation
 */
export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      helperText,
      error,
      size = 'md',
      options,
      placeholder,
      fullWidth = false,
      leftIcon,
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
              className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground-muted pointer-events-none"
              aria-hidden="true"
            >
              {leftIcon}
            </span>
          )}
          <select
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
              appearance-none cursor-pointer
              transition-colors duration-200
              focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background
              disabled:opacity-50 disabled:cursor-not-allowed
              ${sizeStyles[size]}
              ${leftIcon ? iconSizeStyles[size] : ''}
              ${
                hasError
                  ? 'border-error focus:ring-error focus:border-error'
                  : 'border-border focus:ring-accent focus:border-accent'
              }
              ${className}
            `}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option
                key={option.value}
                value={option.value}
                disabled={option.disabled}
              >
                {option.label}
              </option>
            ))}
          </select>
          {/* Custom dropdown arrow */}
          <span
            className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground-muted pointer-events-none"
            aria-hidden="true"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </span>
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

Select.displayName = 'Select';

export default Select;
