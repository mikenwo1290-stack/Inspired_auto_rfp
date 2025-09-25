/**
 * Design Tokens - TypeScript interface for the design system
 * Provides type-safe access to all design tokens and helper functions
 */

// Color Scale Types
export type ColorScale = {
  50: string;
  100: string;
  200: string;
  300: string;
  400: string;
  500: string;
  600: string;
  700: string;
  800: string;
  900: string;
  950: string;
};

export type SemanticColor = {
  DEFAULT: string;
  foreground: string;
};

// Design Token Interfaces
export interface DesignTokens {
  colors: {
    primary: ColorScale & { DEFAULT: string; foreground: string };
    secondary: SemanticColor;
    destructive: SemanticColor;
    muted: SemanticColor;
    accent: SemanticColor;
    popover: SemanticColor;
    card: SemanticColor;
    warning: SemanticColor;
    success: SemanticColor;
    info: SemanticColor;
    sidebar: {
      DEFAULT: string;
      foreground: string;
      border: string;
      accent: string;
      "accent-foreground": string;
      ring: string;
    };
    chart: {
      1: string;
      2: string;
      3: string;
      4: string;
      5: string;
    };
    background: string;
    foreground: string;
    border: string;
    input: string;
    ring: string;
  };
  typography: {
    fontFamily: {
      sans: string[];
      serif: string[];
      mono: string[];
      display: string[];
    };
    fontSize: {
      "2xs": [string, { lineHeight: string }];
      xs: [string, { lineHeight: string }];
      sm: [string, { lineHeight: string }];
      base: [string, { lineHeight: string }];
      lg: [string, { lineHeight: string }];
      xl: [string, { lineHeight: string }];
      "2xl": [string, { lineHeight: string }];
      "3xl": [string, { lineHeight: string }];
      "4xl": [string, { lineHeight: string }];
      "5xl": [string, { lineHeight: string }];
      "6xl": [string, { lineHeight: string }];
      "7xl": [string, { lineHeight: string }];
      "8xl": [string, { lineHeight: string }];
      "9xl": [string, { lineHeight: string }];
    };
  };
  spacing: {
    px: string;
    0: string;
    0.5: string;
    1: string;
    1.5: string;
    2: string;
    2.5: string;
    3: string;
    3.5: string;
    4: string;
    5: string;
    6: string;
    7: string;
    8: string;
    9: string;
    10: string;
    11: string;
    12: string;
    14: string;
    16: string;
    20: string;
    24: string;
    28: string;
    32: string;
    36: string;
    40: string;
    44: string;
    48: string;
    52: string;
    56: string;
    60: string;
    64: string;
    72: string;
    80: string;
    96: string;
  };
  borderRadius: {
    none: string;
    sm: string;
    DEFAULT: string;
    md: string;
    lg: string;
    xl: string;
    "2xl": string;
    "3xl": string;
    full: string;
  };
  boxShadow: {
    "2xs": string;
    xs: string;
    sm: string;
    DEFAULT: string;
    md: string;
    lg: string;
    xl: string;
    "2xl": string;
    inner: string;
    none: string;
  };
  animation: {
    "accordion-down": string;
    "accordion-up": string;
    fade: string;
    "fade-out": string;
    "slide-in": string;
    "slide-out": string;
    "slide-up": string;
    "slide-down": string;
    scale: string;
    "scale-out": string;
    pulse: string;
    "spin-slow": string;
    bounce: string;
  };
  transitionTimingFunction: {
    "in-expo": string;
    "out-expo": string;
    "in-out-expo": string;
    "in-circ": string;
    "out-circ": string;
    "in-out-circ": string;
    "in-back": string;
    "out-back": string;
    "in-out-back": string;
  };
}

// Helper Functions
export const getSemanticColor = (color: 'warning' | 'success' | 'info', variant: 'DEFAULT' | 'foreground' = 'DEFAULT'): string => {
  const colorMap = {
    warning: {
      DEFAULT: 'var(--warning)',
      foreground: 'var(--warning-foreground)'
    },
    success: {
      DEFAULT: 'var(--success)',
      foreground: 'var(--success-foreground)'
    },
    info: {
      DEFAULT: 'var(--info)',
      foreground: 'var(--info-foreground)'
    }
  };
  return colorMap[color][variant];
};

export const getFocusRing = (color: string = 'var(--ring)'): string => {
  return `0 0 0 2px ${color}`;
};

export const getDisabledStyles = (): string => {
  return 'opacity-50 cursor-not-allowed';
};

// Component Variant Definitions
export const buttonVariants = {
  primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
  secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
  destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
  outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
  ghost: 'hover:bg-accent hover:text-accent-foreground',
  link: 'text-primary underline-offset-4 hover:underline',
  warning: 'bg-warning text-warning-foreground hover:bg-warning/90',
  success: 'bg-success text-success-foreground hover:bg-success/90',
  info: 'bg-info text-info-foreground hover:bg-info/90',
} as const;

export const badgeVariants = {
  default: 'bg-primary text-primary-foreground hover:bg-primary/80',
  secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
  destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/80',
  outline: 'text-foreground border border-input',
  warning: 'bg-warning text-warning-foreground hover:bg-warning/80',
  success: 'bg-success text-success-foreground hover:bg-success/80',
  info: 'bg-info text-info-foreground hover:bg-info/80',
} as const;

// Animation Utilities
export const animationClasses = {
  fade: 'animate-fade',
  'fade-out': 'animate-fade-out',
  'slide-in': 'animate-slide-in',
  'slide-out': 'animate-slide-out',
  'slide-up': 'animate-slide-up',
  'slide-down': 'animate-slide-down',
  scale: 'animate-scale',
  'scale-out': 'animate-scale-out',
  pulse: 'animate-pulse',
  'spin-slow': 'animate-spin-slow',
  bounce: 'animate-bounce',
} as const;

// Typography Utilities
export const typographyClasses = {
  'heading-1': 'text-4xl font-bold tracking-tight',
  'heading-2': 'text-3xl font-semibold tracking-tight',
  'heading-3': 'text-2xl font-semibold tracking-tight',
  'heading-4': 'text-xl font-semibold tracking-tight',
  'body-large': 'text-lg leading-7',
  'body': 'text-base leading-6',
  'body-small': 'text-sm leading-5',
  'caption': 'text-xs leading-4',
  'code': 'font-mono text-sm',
} as const;

// Spacing Utilities
export const spacingClasses = {
  'section': 'py-16 px-4',
  'container': 'max-w-7xl mx-auto',
  'card': 'p-6',
  'button': 'px-4 py-2',
  'input': 'px-3 py-2',
} as const;

// Export all utilities
export const designTokens = {
  getSemanticColor,
  getFocusRing,
  getDisabledStyles,
  buttonVariants,
  badgeVariants,
  animationClasses,
  typographyClasses,
  spacingClasses,
} as const;

export default designTokens;
