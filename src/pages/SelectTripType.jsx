import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import Navbar from '../components/layout/Navbar'

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
        <h2>Select Trip Type</h2>
        <div style={styles.row}>
          <button onClick={() => handleSelect('vehicle')} style={styles.card}>
            Vehicle
          </button>
          <button onClick={() => handleSelect('inland')} style={styles.card}>
            Inland
          </button>
        </div>
      </div>
    </div>
  )
}

const styles = {
  container: { padding: '24px' },
  row: { display: 'flex', gap: '16px', marginTop: '20px' },
  card: {
    padding: '30px 50px', fontSize: '18px', fontWeight: 'bold',
    background: '#fff', border: '2px solid #2563eb', color: '#2563eb',
    borderRadius: '10px', cursor: 'pointer',
  },
}