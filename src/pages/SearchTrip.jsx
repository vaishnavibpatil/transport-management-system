import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import Navbar from '../components/layout/Navbar'
import { colors, card, button as btn, input as inp } from '../styles/theme'

export default function SearchTrip() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  async function handleSearch(e) {
    e.preventDefault()
    setLoading(true)

    const { data, error } = await supabase
      .from('trips')
      .select('*')
      .or(`lr_number.ilike.%${query}%,vehicle_number.ilike.%${query}%`)
      .order('created_at', { ascending: false })

    setLoading(false)
    if (!error) setResults(data)
  }

  return (
    <div>
      <Navbar />
      <div style={styles.container}>
        <h2 style={styles.heading}>Search Trip</h2>
        <form onSubmit={handleSearch} style={styles.form}>

          <input
            placeholder="Enter LR Number or Vehicle Number"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={styles.input}
          />
          <button type="submit" style={styles.button}>Search</button>
        </form>

        {loading && <p style={{ color: colors.textSecondary }}>Searching...</p>}

        <div style={styles.results}>
          {results.map((trip) => (
            <div key={trip.id} style={styles.row} onClick={() => navigate(`/trip/${trip.id}`)}>
              <span style={styles.cell}>{trip.trip_date}</span>
              <span style={styles.cell}><strong>{trip.lr_number}</strong></span>
              <span style={styles.cell}>{trip.vehicle_number}</span>
              <span style={styles.cell}>{trip.party_name}</span>
              <span style={styles.statusBadge}>{trip.status}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

const styles = {
  container: { padding: '28px', maxWidth: '760px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '16px' },
  heading: { margin: 0, fontSize: '22px', color: colors.textPrimary },
  form: { display: 'flex', gap: '10px' },
  input: { ...inp, flex: 1 },

  button: { ...btn.primary, padding: '11px 22px' },
  results: { display: 'flex', flexDirection: 'column', gap: '10px' },
  row: {
    ...card, display: 'flex', alignItems: 'center', gap: '16px', cursor: 'pointer',
    padding: '14px 18px', flexWrap: 'wrap',
  },
  cell: { fontSize: '14px', color: colors.textPrimary, minWidth: '90px' },
  statusBadge: {
    marginLeft: 'auto', fontSize: '12px', fontWeight: 700, color: colors.primary,
    background: colors.primaryLight, padding: '5px 10px', borderRadius: '6px',
  },
}