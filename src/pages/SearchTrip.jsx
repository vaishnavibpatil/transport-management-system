import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import Navbar from '../components/layout/Navbar'

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
        <h2>Search Trip</h2>
        <form onSubmit={handleSearch} style={styles.form}>
          <input
            placeholder="Enter LR Number or Vehicle Number"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={styles.input}
          />
          <button type="submit" style={styles.button}>Search</button>
        </form>

        {loading && <p>Searching...</p>}

        <div style={styles.results}>
          {results.map((trip) => (
            <div key={trip.id} style={styles.card} onClick={() => navigate(`/trip/${trip.id}`)}>
              <p><strong>LR:</strong> {trip.lr_number} &nbsp; <strong>Vehicle:</strong> {trip.vehicle_number}</p>
              <p><strong>Party:</strong> {trip.party_name} &nbsp; <strong>Status:</strong> {trip.status}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

const styles = {
  container: { padding: '24px', maxWidth: '600px' },
  form: { display: 'flex', gap: '10px', marginBottom: '20px' },
  input: { flex: 1, padding: '10px', fontSize: '15px', border: '1px solid #ccc', borderRadius: '6px' },
  button: {
    padding: '10px 20px', background: '#2563eb', color: '#fff',
    border: 'none', borderRadius: '6px', cursor: 'pointer',
  },
  results: { display: 'flex', flexDirection: 'column', gap: '10px' },
  card: {
    background: '#fff', padding: '14px', borderRadius: '8px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.1)', cursor: 'pointer',
  },
}