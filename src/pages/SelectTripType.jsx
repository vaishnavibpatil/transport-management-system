import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import Navbar from '../components/layout/Navbar'
import { colors, card } from '../styles/theme'

export default function SelectTripType() {
  const { tripId } = useParams()
  const navigate = useNavigate()

  async function handleSelect(type) {
    await supabase.from('trips').update({ trip_type: type }).eq('id', tripId)

    if (type === 'vehicle') {
      navigate(`/trip/${tripId}/vehicle`)
    } else {
      navigate(`/trip/${tripId}/inland`)
    }
  }

  return (
    <div>
      <Navbar />
      <div style={styles.container}>
        <h2 style={styles.heading}>Select Trip Type</h2>
        <p style={styles.subtitle}>Pick a side to fill first. You can add the other side later from Trip Details.</p>
        <div style={styles.row}>
          <button onClick={() => handleSelect('vehicle')} style={styles.option}>🚚 Vehicle</button>
          <button onClick={() => handleSelect('inland')} style={styles.option}>🏢 Inland</button>
        </div>
      </div>
    </div>
  )

}

const styles = {
  container: { padding: '28px', maxWidth: '560px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '12px' },
  heading: { margin: 0, fontSize: '22px', color: colors.textPrimary },
  subtitle: { margin: 0, color: colors.textSecondary, fontSize: '14px' },
  row: { display: 'flex', gap: '16px', marginTop: '12px', flexWrap: 'wrap' },
  option: {
    ...card, flex: 1, minWidth: '160px', padding: '36px 20px', fontSize: '18px', fontWeight: 700,
    color: colors.primary, border: `2px solid ${colors.primary}`, cursor: 'pointer', textAlign: 'center',
  },
}