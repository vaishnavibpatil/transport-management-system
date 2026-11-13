import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { colors, card, button as btn, input as inp } from '../styles/theme'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  async function handleLogin(e) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    setLoading(false)

    if (error) {
      setError('Invalid email or password')
    } else {
      navigate('/dashboard')
    }
  }

  return (
    <div style={styles.container}>
      <form onSubmit={handleLogin} style={styles.form}>
        <div style={styles.logo}>🚚</div>

        <h1 style={styles.title}>Transport Management System</h1>
        <p style={styles.subtitle}>Sign in to continue</p>

        <input
          type="email"
          placeholder="Username / Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={styles.input}
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={styles.input}
          required
        />

        {error && <p style={styles.error}>{error}</p>}

        <button type="submit" disabled={loading} style={styles.button}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
    </div>
  )
}

const styles = {

  container: {
    minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center',
    background: colors.background, padding: '20px',
  },
  form: {
    ...card, width: '100%', maxWidth: '360px', padding: '36px',
    display: 'flex', flexDirection: 'column', gap: '14px',
  },
  logo: { fontSize: '40px', textAlign: 'center' },
  title: { fontSize: '20px', fontWeight: 700, textAlign: 'center', margin: 0, color: colors.textPrimary },
  subtitle: { textAlign: 'center', color: colors.textSecondary, margin: '0 0 8px', fontSize: '14px' },
  input: { ...inp },
  button: { ...btn.primary, marginTop: '6px' },
  error: {
    color: colors.danger, background: colors.dangerLight, padding: '10px 12px',
    borderRadius: '8px', fontSize: '13px', margin: 0,
  },
}