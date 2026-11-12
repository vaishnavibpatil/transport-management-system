import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient'
import { colors } from '../../styles/theme'

export default function Navbar() {
  const navigate = useNavigate()

  async function handleLogout() {
    await supabase.auth.signOut()
    navigate('/login')
  }

  return (
    <div style={styles.bar}>
      <span style={styles.title}>🚚 Transport Management System</span>

      <div style={styles.rightSide}>
        <button onClick={() => navigate('/dashboard')} style={styles.homeButton}>
          🏠 Home
        </button>
        <button onClick={handleLogout} style={styles.button}>Logout</button>
      </div>
    </div>
  )
}

const styles = {
  bar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 28px',

    background: colors.primary,
    color: '#fff',
  },
  title: { fontSize: '16px', fontWeight: 700, letterSpacing: '0.2px' },
  rightSide: { display: 'flex', gap: '10px' },
  homeButton: {
    background: 'rgba(255,255,255,0.15)',
    color: '#fff',
    border: '1.5px solid rgba(255,255,255,0.4)',
    padding: '8px 16px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 600,
    fontSize: '13px',
  },
  button: {
    background: 'rgba(255,255,255,0.15)',
    color: '#fff',
    border: '1.5px solid rgba(255,255,255,0.4)',
    padding: '8px 16px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 600,
    fontSize: '13px',
  },
}