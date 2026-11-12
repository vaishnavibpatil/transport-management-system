import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import Navbar from '../components/layout/Navbar'
import { colors, card } from '../styles/theme'

export default function PendingPOD() {
  const navigate = useNavigate()
  const [trips, setTrips] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadTrips()
  }, [])

  async function loadTrips() {
    setLoading(true)
    // Trips that have vehicle details (so a POD is expected) but no pod record yet
    const { data } = await supabase
      .from('trips')
      .select('*, vehicle_details(*), pods(*)')
      .not('vehicle_details', 'is', null)
      .order('trip_date', { ascending: true })

    const pending = (data || []).filter((trip) => trip.vehicle_details && !trip.pods)
    setTrips(pending)
    setLoading(false)
  }

  return (
    <div>
      <Navbar />
      <div style={styles.container}>
        <h2>Pending POD</h2>
        <p style={styles.subtitle}>Vehicles that have unloaded but POD hasn't been uploaded yet.</p>

        {loading ? (
          <p>Loading...</p>
        ) : trips.length === 0 ? (
          <p style={{ color: colors.textSecondary }}>Nothing pending — all PODs are up to date. 🎉</p>
        ) : (
          <div style={styles.list}>
            {trips.map((trip) => (
              <div key={trip.id} style={styles.row} onClick={() => navigate(`/trip/${trip.id}`)}>
                <div>
                  <p style={styles.rowTitle}>{trip.lr_number} — {trip.vehicle_number}</p>
                  <p style={styles.rowSub}>{trip.party_name} · {trip.trip_date}</p>
                </div>
                <span style={styles.badge}>Upload POD</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

const styles = {
  container: { padding: '28px', maxWidth: '700px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '16px' },
  subtitle: { color: colors.textSecondary, margin: 0, fontSize: '14px' },
  list: { display: 'flex', flexDirection: 'column', gap: '10px' },
  row: {
    ...card, display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer',
  },
  rowTitle: { margin: 0, fontWeight: 700, color: colors.textPrimary },
  rowSub: { margin: 0, fontSize: '13px', color: colors.textSecondary },
  badge: {
    fontSize: '12px', fontWeight: 700, color: colors.warning,
    background: colors.warningLight, padding: '6px 12px', borderRadius: '6px',
  },
}