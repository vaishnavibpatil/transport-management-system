export const colors = {
  primary: '#4f46e5',        // indigo — main brand color
  primaryDark: '#4338ca',
  primaryLight: '#eef2ff',
  success: '#16a34a',
  successLight: '#dcfce7',
  danger: '#dc2626',
  dangerLight: '#fef2f2',
  warning: '#d97706',
  warningLight: '#fffbeb',
  background: '#f8fafc',
  cardBg: '#ffffff',
  textPrimary: '#0f172a',
  textSecondary: '#64748b',
  border: '#e2e8f0',
}

export const shadow = '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)'

export const card = {
  background: colors.cardBg,
  borderRadius: '12px',
  padding: '20px',
  boxShadow: shadow,
  border: `1px solid ${colors.border}`,
}

export const button = {
  primary: {
    padding: '12px 20px',
    fontSize: '15px',
    fontWeight: 600,
    background: colors.primary,
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
  },
  secondary: {
    padding: '10px 18px',
    fontSize: '14px',
    fontWeight: 600,
    background: '#fff',
    color: colors.primary,
    border: `1.5px solid ${colors.primary}`,
    borderRadius: '8px',
    cursor: 'pointer',
  },
}

export const input = {
  padding: '11px 14px',
  fontSize: '15px',
  border: `1px solid ${colors.border}`,
  borderRadius: '8px',
  outline: 'none',
  color: colors.textPrimary,
  background: '#fff',
}