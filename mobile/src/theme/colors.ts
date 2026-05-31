export const colors = {
  background:      '#0B0D17',
  surface:         '#141623',
  surfaceElevated: '#1C1E30',
  surfaceHigh:     '#22253A',

  border:      '#252738',
  borderLight: '#1A1C2E',

  primary:    '#7C6FF7',
  primaryDim: 'rgba(124,111,247,0.15)',
  primaryGlow:'rgba(124,111,247,0.08)',

  secondary:    '#4ECDC4',
  secondaryDim: 'rgba(78,205,196,0.12)',

  gold:    '#E2C97E',
  goldDim: 'rgba(226,201,126,0.12)',

  textPrimary:   '#F4F4F8',
  textSecondary: '#8B8FA8',
  textMuted:     '#5A5E72',

  success:    '#52D68A',
  successDim: 'rgba(82,214,138,0.12)',

  error:    '#F76E6E',
  errorDim: 'rgba(247,110,110,0.12)',

  warning:    '#F5A623',
  warningDim: 'rgba(245,166,35,0.12)',

  income:     '#52D68A',
  incomeDim:  'rgba(82,214,138,0.12)',
  expense:    '#F76E6E',
  expenseDim: 'rgba(247,110,110,0.12)',

  high:   '#F76E6E',
  medium: '#F5A623',
  low:    '#52D68A',

  white:       '#FFFFFF',
  black:       '#000000',
  transparent: 'transparent',
} as const;

export type ColorKey = keyof typeof colors;
