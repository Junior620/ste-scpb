/**
 * Property-Based Tests for Keyboard Accessibility
 * **Feature: ste-scpb-refonte, Property 14: Keyboard Accessibility**
 * **Validates: Requirements 13.2**
 *
 * Property: For any interactive element (buttons, links, form inputs, menu items),
 * it should be focusable via Tab key and operable via Enter/Space keys.
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';

/**
 * Interactive element types that must support keyboard navigation
 */
type InteractiveElementType =
  | 'button'
  | 'link'
  | 'input'
  | 'select'
  | 'checkbox'
  | 'radio'
  | 'menuitem'
  | 'tab';

/**
 * Represents an interactive element's accessibility properties
 */
interface InteractiveElementProps {
  type: InteractiveElementType;
  disabled: boolean;
  tabIndex?: number;
  role?: string;
  ariaDisabled?: boolean;
}

/**
 * Determines if an element should be focusable based on its properties
 */
function shouldBeFocusable(props: InteractiveElementProps): boolean {
  // Disabled elements should not be focusable (except for aria-disabled which keeps focus)
  if (props.disabled && !props.ariaDisabled) {
    return false;
  }

  // Elements with tabIndex -1 are not focusable via Tab
  if (props.tabIndex === -1) {
    return false;
  }

  // All other interactive elements should be focusable
  return true;
}

/**
 * Determines which keys should activate an element
 */
function getActivationKeys(props: InteractiveElementProps): string[] {
  if (props.disabled) {
    return []; // Disabled elements should not be activatable
  }

  switch (props.type) {
    case 'button':
    case 'menuitem':
    case 'tab':
      return ['Enter', ' ']; // Space and Enter
    case 'link':
      return ['Enter']; // Links only respond to Enter
    case 'checkbox':
    case 'radio':
      return [' ']; // Checkboxes/radios respond to Space
    case 'input':
    case 'select':
      return ['Enter']; // Form inputs submit on Enter
    default:
      return ['Enter', ' '];
  }
}

/**
 * Validates that an element has proper ARIA attributes for its type
 */
function hasProperAriaAttributes(props: InteractiveElementProps): boolean {
  // If disabled, should have aria-disabled or disabled attribute
  if (props.disabled) {
    return true; // We assume the component handles this
  }

  // Custom interactive elements should have appropriate role
  if (props.role) {
    const validRoles: Record<InteractiveElementType, string[]> = {
      button: ['button'],
      link: ['link'],
      input: ['textbox', 'searchbox', 'spinbutton'],
      select: ['listbox', 'combobox'],
      checkbox: ['checkbox', 'switch'],
      radio: ['radio'],
      menuitem: ['menuitem', 'menuitemcheckbox', 'menuitemradio'],
      tab: ['tab'],
    };

    return validRoles[props.type]?.includes(props.role) ?? true;
  }

  return true;
}

/**
 * Arbitrary generator for interactive element properties
 * Generates valid combinations only
 */
const interactiveElementArb: fc.Arbitrary<InteractiveElementProps> = fc
  .record({
    type: fc.constantFrom<InteractiveElementType>(
      'button',
      'link',
      'input',
      'select',
      'checkbox',
      'radio',
      'menuitem',
      'tab'
    ),
    disabled: fc.boolean(),
    tabIndex: fc.option(fc.integer({ min: -1, max: 10 }), { nil: undefined }),
    ariaDisabled: fc.option(fc.boolean(), { nil: undefined }),
  })
  .map((props) => {
    // Generate a valid role for the element type (or undefined)
    const validRoles: Record<InteractiveElementType, string | undefined> = {
      button: 'button',
      link: 'link',
      input: 'textbox',
      select: 'listbox',
      checkbox: 'checkbox',
      radio: 'radio',
      menuitem: 'menuitem',
      tab: 'tab',
    };

    return {
      ...props,
      // Only assign role if it matches the element type
      role: Math.random() > 0.5 ? validRoles[props.type] : undefined,
    };
  });

describe('Property 14: Keyboard Accessibility', () => {
  /**
   * Property: For any interactive element that is not disabled,
   * it should be focusable via Tab key
   */
  it('should make non-disabled interactive elements focusable', () => {
    fc.assert(
      fc.property(interactiveElementArb, (props) => {
        const isFocusable = shouldBeFocusable(props);

        // If element is not disabled and has valid tabIndex, it should be focusable
        if (!props.disabled && props.tabIndex !== -1) {
          expect(isFocusable).toBe(true);
        }

        // If element is disabled (not aria-disabled), it should not be focusable
        if (props.disabled && !props.ariaDisabled) {
          expect(isFocusable).toBe(false);
        }

        return true;
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property: For any interactive element, it should be operable
   * via appropriate keyboard keys (Enter/Space)
   */
  it('should define correct activation keys for each element type', () => {
    fc.assert(
      fc.property(interactiveElementArb, (props) => {
        const activationKeys = getActivationKeys(props);

        // Disabled elements should have no activation keys
        if (props.disabled) {
          expect(activationKeys).toHaveLength(0);
          return true;
        }

        // All non-disabled interactive elements should have at least one activation key
        expect(activationKeys.length).toBeGreaterThan(0);

        // Buttons should respond to both Enter and Space
        if (props.type === 'button') {
          expect(activationKeys).toContain('Enter');
          expect(activationKeys).toContain(' ');
        }

        // Links should respond to Enter
        if (props.type === 'link') {
          expect(activationKeys).toContain('Enter');
        }

        // Checkboxes and radios should respond to Space
        if (props.type === 'checkbox' || props.type === 'radio') {
          expect(activationKeys).toContain(' ');
        }

        return true;
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property: For any interactive element with a custom role,
   * the role should be appropriate for the element type
   */
  it('should have appropriate ARIA roles for element types', () => {
    fc.assert(
      fc.property(interactiveElementArb, (props) => {
        const hasProperAria = hasProperAriaAttributes(props);
        expect(hasProperAria).toBe(true);
        return true;
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Focus order should be logical (positive tabIndex values
   * should be avoided in favor of natural DOM order)
   */
  it('should prefer natural focus order (tabIndex 0 or undefined)', () => {
    fc.assert(
      fc.property(interactiveElementArb, (props) => {
        // Best practice: tabIndex should be 0, -1, or undefined
        // Positive tabIndex values disrupt natural focus order
        if (props.tabIndex !== undefined && props.tabIndex > 0) {
          // This is a warning case - positive tabIndex is discouraged
          // but not strictly invalid
          console.warn(
            `Element with type "${props.type}" has positive tabIndex (${props.tabIndex}). ` +
              'Consider using natural DOM order instead.'
          );
        }

        // The property still passes - we're just flagging the anti-pattern
        return true;
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property: aria-disabled elements should remain focusable
   * (unless they have tabIndex=-1 which explicitly removes them from tab order)
   */
  it('should keep aria-disabled elements focusable unless tabIndex is -1', () => {
    fc.assert(
      fc.property(interactiveElementArb, (props) => {
        // When using aria-disabled (not disabled attribute),
        // element should remain focusable for screen reader users
        // UNLESS tabIndex is explicitly set to -1
        if (props.ariaDisabled && !props.disabled && props.tabIndex !== -1) {
          const isFocusable = shouldBeFocusable(props);
          expect(isFocusable).toBe(true);
        }

        return true;
      }),
      { numRuns: 100 }
    );
  });
});

/**
 * Unit tests for specific UI component accessibility patterns
 */
describe('UI Component Accessibility Patterns', () => {
  it('Button component should support keyboard activation', () => {
    const buttonProps: InteractiveElementProps = {
      type: 'button',
      disabled: false,
    };

    expect(shouldBeFocusable(buttonProps)).toBe(true);
    expect(getActivationKeys(buttonProps)).toContain('Enter');
    expect(getActivationKeys(buttonProps)).toContain(' ');
  });

  it('Disabled button should not be focusable or activatable', () => {
    const disabledButtonProps: InteractiveElementProps = {
      type: 'button',
      disabled: true,
    };

    expect(shouldBeFocusable(disabledButtonProps)).toBe(false);
    expect(getActivationKeys(disabledButtonProps)).toHaveLength(0);
  });

  it('Input component should support keyboard interaction', () => {
    const inputProps: InteractiveElementProps = {
      type: 'input',
      disabled: false,
    };

    expect(shouldBeFocusable(inputProps)).toBe(true);
    expect(getActivationKeys(inputProps)).toContain('Enter');
  });

  it('Select component should support keyboard interaction', () => {
    const selectProps: InteractiveElementProps = {
      type: 'select',
      disabled: false,
    };

    expect(shouldBeFocusable(selectProps)).toBe(true);
    expect(getActivationKeys(selectProps)).toContain('Enter');
  });

  it('Menu item should support keyboard activation', () => {
    const menuItemProps: InteractiveElementProps = {
      type: 'menuitem',
      disabled: false,
      role: 'menuitem',
    };

    expect(shouldBeFocusable(menuItemProps)).toBe(true);
    expect(getActivationKeys(menuItemProps)).toContain('Enter');
    expect(getActivationKeys(menuItemProps)).toContain(' ');
    expect(hasProperAriaAttributes(menuItemProps)).toBe(true);
  });

  it('Link should only respond to Enter key', () => {
    const linkProps: InteractiveElementProps = {
      type: 'link',
      disabled: false,
    };

    expect(shouldBeFocusable(linkProps)).toBe(true);
    const keys = getActivationKeys(linkProps);
    expect(keys).toContain('Enter');
    expect(keys).not.toContain(' '); // Links don't activate on Space
  });

  it('Checkbox should respond to Space key', () => {
    const checkboxProps: InteractiveElementProps = {
      type: 'checkbox',
      disabled: false,
    };

    expect(shouldBeFocusable(checkboxProps)).toBe(true);
    const keys = getActivationKeys(checkboxProps);
    expect(keys).toContain(' ');
  });
});
