'use client';

import { ReactNode } from 'react';

interface ResponsiveContainerProps {
  children: ReactNode;
  className?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '4xl' | '6xl' | 'full';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const maxWidthClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
  '4xl': 'max-w-4xl',
  '6xl': 'max-w-6xl',
  full: 'max-w-full',
};

const paddingClasses = {
  none: '',
  sm: 'px-2 sm:px-4',
  md: 'px-4 sm:px-6',
  lg: 'px-4 sm:px-6 md:px-8',
};

export default function ResponsiveContainer({
  children,
  className = '',
  maxWidth = '6xl',
  padding = 'md',
}: ResponsiveContainerProps) {
  const maxWidthClass = maxWidthClasses[maxWidth];
  const paddingClass = paddingClasses[padding];
  
  return (
    <div className={`mx-auto ${maxWidthClass} ${paddingClass} ${className}`}>
      {children}
    </div>
  );
}

// Composant pour les grilles responsives
interface ResponsiveGridProps {
  children: ReactNode;
  cols?: {
    default: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  gap?: 'sm' | 'md' | 'lg';
  className?: string;
}

const gapClasses = {
  sm: 'gap-2 sm:gap-3',
  md: 'gap-3 sm:gap-4',
  lg: 'gap-4 sm:gap-6',
};

export function ResponsiveGrid({
  children,
  cols = { default: 1, sm: 2, md: 3 },
  gap = 'md',
  className = '',
}: ResponsiveGridProps) {
  const getGridCols = () => {
    const base = `grid-cols-${cols.default}`;
    const sm = cols.sm ? `sm:grid-cols-${cols.sm}` : '';
    const md = cols.md ? `md:grid-cols-${cols.md}` : '';
    const lg = cols.lg ? `lg:grid-cols-${cols.lg}` : '';
    const xl = cols.xl ? `xl:grid-cols-${cols.xl}` : '';
    
    return `grid ${base} ${sm} ${md} ${lg} ${xl}`.trim();
  };

  const gapClass = gapClasses[gap];
  
  return (
    <div className={`${getGridCols()} ${gapClass} ${className}`}>
      {children}
    </div>
  );
}

// Composant pour les boutons responsifs
interface ResponsiveButtonProps {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'accent' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
}

const buttonVariants = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  accent: 'btn-accent',
  danger: 'bg-red-500 hover:bg-red-600 text-white',
  success: 'bg-green-500 hover:bg-green-600 text-white',
};

const buttonSizes = {
  sm: 'px-3 py-2 text-sm',
  md: 'px-4 py-2 text-sm sm:text-base',
  lg: 'px-6 py-3 text-base sm:text-lg',
};

export function ResponsiveButton({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className = '',
  onClick,
  disabled = false,
  type = 'button',
}: ResponsiveButtonProps) {
  const variantClass = buttonVariants[variant];
  const sizeClass = buttonSizes[size];
  const widthClass = fullWidth ? 'w-full' : '';
  
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`btn ${variantClass} ${sizeClass} ${widthClass} ${className}`}
    >
      {children}
    </button>
  );
}

// Composant pour les textes responsifs
interface ResponsiveTextProps {
  children: ReactNode;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span';
  size?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl';
  weight?: 'normal' | 'medium' | 'semibold' | 'bold';
  color?: 'primary' | 'secondary' | 'neutral' | 'success' | 'warning' | 'danger';
  className?: string;
}

const textSizes = {
  xs: 'text-xs',
  sm: 'text-sm sm:text-base',
  base: 'text-sm sm:text-base',
  lg: 'text-base sm:text-lg',
  xl: 'text-lg sm:text-xl',
  '2xl': 'text-xl sm:text-2xl',
  '3xl': 'text-2xl sm:text-3xl',
  '4xl': 'text-3xl sm:text-4xl',
  '5xl': 'text-4xl sm:text-5xl',
  '6xl': 'text-5xl sm:text-6xl',
};

const textWeights = {
  normal: 'font-normal',
  medium: 'font-medium',
  semibold: 'font-semibold',
  bold: 'font-bold',
};

const textColors = {
  primary: 'text-primary',
  secondary: 'text-secondary',
  neutral: 'text-neutral-800',
  success: 'text-green-600',
  warning: 'text-yellow-600',
  danger: 'text-red-600',
};

export function ResponsiveText({
  children,
  as: Component = 'p',
  size = 'base',
  weight = 'normal',
  color = 'neutral',
  className = '',
}: ResponsiveTextProps) {
  const sizeClass = textSizes[size];
  const weightClass = textWeights[weight];
  const colorClass = textColors[color];
  
  return (
    <Component className={`${sizeClass} ${weightClass} ${colorClass} ${className}`}>
      {children}
    </Component>
  );
}
