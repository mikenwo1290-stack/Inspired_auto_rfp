/**
 * AutoRFP Design System Tokens
 * 
 * This file provides easy access to design tokens for use in components.
 * All values are CSS variables that automatically adapt to light/dark themes.
 */

export const designTokens = {
  // Color System (using OKLCH values via CSS variables - Tailwind v4 compatible)
  colors: {
    // Base colors
    background: 'var(--background)',
    foreground: 'var(--foreground)',
    
    // Brand colors - Primary Scale
    primary: {
      50: 'var(--primary-50)',
      100: 'var(--primary-100)',
      200: 'var(--primary-200)',
      300: 'var(--primary-300)',
      400: 'var(--primary-400)',
      500: 'var(--primary)',
      600: 'var(--primary-600)',
      700: 'var(--primary-700)',
      800: 'var(--primary-800)',
      900: 'var(--primary-900)',
      950: 'var(--primary-950)',
      foreground: 'var(--primary-foreground)',
    },
    
    // Semantic colors
    destructive: {
      DEFAULT: 'var(--destructive)',
      foreground: 'var(--destructive-foreground)',
    },
    warning: {
      DEFAULT: 'var(--warning)',
      foreground: 'var(--warning-foreground)',
    },
    success: {
      DEFAULT: 'var(--success)',
      foreground: 'var(--success-foreground)',
    },
    info: {
      DEFAULT: 'var(--info)',
      foreground: 'var(--info-foreground)',
    },
    
    // Neutral colors
    muted: {
      DEFAULT: 'var(--muted)',
      foreground: 'var(--muted-foreground)',
    },
    accent: {
      DEFAULT: 'var(--accent)',
      foreground: 'var(--accent-foreground)',
    },
    
    // Interface colors
    border: 'var(--border)',
    input: 'var(--input)',
    ring: 'var(--ring)',
    
    // Surface colors
    card: {
      DEFAULT: 'var(--card)',
      foreground: 'var(--card-foreground)',
    },
    popover: {
      DEFAULT: 'var(--popover)',
      foreground: 'var(--popover-foreground)',
    },
    
    // Chart colors
    chart: {
      1: 'var(--chart-1)',
      2: 'var(--chart-2)',
      3: 'var(--chart-3)',
      4: 'var(--chart-4)',
      5: 'var(--chart-5)',
    },
  },

  // Typography Scale
  typography: {
    fontFamily: {
      sans: 'var(--font-sans)',
      serif: 'var(--font-serif)',
      mono: 'var(--font-mono)',
      heading: 'var(--font-heading)',
    },
    fontSize: {
      xs: ['0.75rem', { lineHeight: '1rem' }],
      sm: ['0.875rem', { lineHeight: '1.25rem' }],
      base: ['1rem', { lineHeight: '1.5rem' }],
      lg: ['1.125rem', { lineHeight: '1.75rem' }],
      xl: ['1.25rem', { lineHeight: '1.75rem' }],
      '2xl': ['1.5rem', { lineHeight: '2rem' }],
      '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
      '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
      '5xl': ['3rem', { lineHeight: '1' }],
      '6xl': ['3.75rem', { lineHeight: '1' }],
    },
    fontWeight: {
      light: '300',
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
      extrabold: '800',
    },
  },

  // Spacing Scale
  spacing: {
    px: '1px',
    0: '0',
    1: 'var(--space-1)',
    2: 'var(--space-2)',
    3: 'var(--space-3)',
    4: 'var(--space-4)',
    5: 'var(--space-5)',
    6: 'var(--space-6)',
    8: 'var(--space-8)',
    10: 'var(--space-10)',
    12: 'var(--space-12)',
    16: 'var(--space-16)',
    20: 'var(--space-20)',
    24: 'var(--space-24)',
  },

  // Border Radius
  borderRadius: {
    none: '0',
    sm: 'calc(var(--radius) - 4px)',
    DEFAULT: 'calc(var(--radius) - 2px)',
    md: 'calc(var(--radius) - 2px)',
    lg: 'var(--radius)',
    xl: 'calc(var(--radius) + 4px)',
    '2xl': 'calc(var(--radius) + 8px)',
    '3xl': 'calc(var(--radius) + 12px)',
    full: '9999px',
  },

  // Shadow System
  shadows: {
    '2xs': 'var(--shadow-2xs)',
    xs: 'var(--shadow-xs)',
    sm: 'var(--shadow-sm)',
    DEFAULT: 'var(--shadow)',
    md: 'var(--shadow-md)',
    lg: 'var(--shadow-lg)',
    xl: 'var(--shadow-xl)',
    '2xl': 'var(--shadow-2xl)',
    inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
    none: 'none',
  },

  // Animation & Transitions
  transitions: {
    duration: {
      75: '75ms',
      100: '100ms',
      150: '150ms',
      200: '200ms',
      300: '300ms',
      500: '500ms',
    },
    timing: {
      'ease-in-quart': 'cubic-bezier(0.5, 0, 0.75, 0)',
      'ease-out-quart': 'cubic-bezier(0.25, 1, 0.5, 1)',
      'ease-in-out-quart': 'cubic-bezier(0.76, 0, 0.24, 1)',
    },
  },

  // Component Variants (for use with class-variance-authority)
  variants: {
    button: {
      size: {
        sm: 'h-8 px-3 text-xs',
        default: 'h-9 px-4 py-2',
        lg: 'h-10 px-8',
        icon: 'h-9 w-9',
      },
      variant: {
        default: 'bg-primary text-primary-foreground shadow hover:bg-primary/90',
        destructive: 'bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90',
        outline: 'border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground',
        secondary: 'bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
      },
    },
    badge: {
      variant: {
        default: 'border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/80',
        secondary: 'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80',
        destructive: 'border-transparent bg-destructive text-destructive-foreground shadow hover:bg-destructive/80',
        outline: 'text-foreground',
        success: 'border-transparent bg-success text-success-foreground shadow hover:bg-success/80',
        warning: 'border-transparent bg-warning text-warning-foreground shadow hover:bg-warning/80',
        info: 'border-transparent bg-info text-info-foreground shadow hover:bg-info/80',
      },
    },
  },
} as const;

// Helper functions for common design patterns
export const designHelpers = {
  // Get consistent spacing values
  getSpacing: (size: keyof typeof designTokens.spacing) => designTokens.spacing[size],
  
  // Get semantic color for states
  getSemanticColor: (type: 'success' | 'warning' | 'error' | 'info') => {
    const colorMap = {
      success: designTokens.colors.success.DEFAULT,
      warning: designTokens.colors.warning.DEFAULT,
      error: designTokens.colors.destructive.DEFAULT,
      info: designTokens.colors.info.DEFAULT,
    };
    return colorMap[type];
  },
  
  // Get focus ring styles
  getFocusRing: () => 'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  
  // Get disabled styles
  getDisabledStyles: () => 'disabled:pointer-events-none disabled:opacity-50',
};

export type ColorScale = keyof typeof designTokens.colors.primary;
export type SemanticColor = 'success' | 'warning' | 'error' | 'info';
export type SpacingScale = keyof typeof designTokens.spacing;
