import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import Navbar from '../components/layout/Navbar'
import { colors, card, input as inp } from '../styles/theme'

const TRUCK_TYPES = ['A1', 'A2', 'A5', 'A8', 'T6', 'T1']
const STATUSES = [
  'Trip Created', 'Vehicle Details Added', 'Inland Details Added',
  'POD Uploaded', 'Payment Completed', 'Trip Completed',
]

export default function AllTrips() {
  const navigate = useNavigate()
  const [trips, setTrips] = useState([])
  const [loading, setLoading] = useState(true)

  const [filters, setFilters] = useState({
    lr_number: '', vehicle_number: '', party_name: '',
    trip_date: '', status: '', truck_type: '',
  })

  useEffect(() => {
    loadTrips()
  }, [])

  async function loadTrips() {
    setLoading(true)
    let query = supabase.from('trips').select('*').order('created_at', { ascending: false })

    if (filters.lr_number) query = query.ilike('lr_number', `%${filters.lr_number}%`)
    if (filters.vehicle_number) query = query.ilike('vehicle_number', `%${filters.vehicle_number}%`)

    if (filters.party_name) query = query.ilike('party_name', `%${filters.party_name}%`)
    if (filters.trip_date) query = query.eq('trip_date', filters.trip_date)
    if (filters.status) query = query.eq('status', filters.status)
    if (filters.truck_type) query = query.eq('truck_type', filters.truck_type)

    const { data } = await query
    setTrips(data || [])
    setLoading(false)
  }

  function handleFilterChange(e) {
    setFilters({ ...filters, [e.target.name]: e.target.value })
  }

  function clearFilters() {
    setFilters({ lr_number: '', vehicle_number: '', party_name: '', trip_date: '', status: '', truck_type: '' })
  }

  return (
    <div>
      <Navbar />
      <div style={styles.container}>
        <h2>All Trips</h2>

        <div style={styles.filterGrid}>
          <input name="lr_number" placeholder="LR Number" value={filters.lr_number} onChange={handleFilterChange} style={styles.input} />
          <input name="vehicle_number" placeholder="Vehicle Number" value={filters.vehicle_number} onChange={handleFilterChange} style={styles.input} />
          <input name="party_name" placeholder="Party Name" value={filters.party_name} onChange={handleFilterChange} style={styles.input} />
          <input type="date" name="trip_date" value={filters.trip_date} onChange={handleFilterChange} style={styles.input} />

          <select name="status" value={filters.status} onChange={handleFilterChange} style={styles.input}>
            <option value="">All Statuses</option>

            {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>

          <select name="truck_type" value={filters.truck_type} onChange={handleFilterChange} style={styles.input}>
            <option value="">All Truck Types</option>
            {TRUCK_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>

        <div style={styles.filterActions}>
          <button onClick={loadTrips} style={styles.applyButton}>Apply Filters</button>
          <button onClick={() => { clearFilters(); loadTrips() }} style={styles.clearButton}>Clear</button>
        </div>

        {loading ? (
          <p>Loading...</p>
        ) : (
          <div style={styles.list}>
            {trips.length === 0 && <p style={{ color: colors.textSecondary }}>No trips found.</p>}
            {trips.map((trip) => (
              <div key={trip.id} style={styles.row} onClick={() => navigate(`/trip/${trip.id}`)}>
                <span style={styles.cell}>{trip.trip_date}</span>
                <span style={styles.cell}><strong>{trip.lr_number}</strong></span>
                <span style={styles.cell}>{trip.vehicle_number}</span>
                <span style={styles.cell}>{trip.party_name}</span>
                <span style={styles.statusBadge}>{trip.status}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>

  )
}

const styles = {
  container: { padding: '28px', maxWidth: '900px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '16px' },
  filterGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '10px' },
  input: { ...inp },
  filterActions: { display: 'flex', gap: '10px' },
  applyButton: {
    padding: '9px 18px', background: colors.primary, color: '#fff', border: 'none',
    borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '13px',
  },
  clearButton: {
    padding: '9px 18px', background: '#fff', color: colors.textSecondary, border: `1px solid ${colors.border}`,
    borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '13px',
  },
  list: { display: 'flex', flexDirection: 'column', gap: '10px' },
  row: {
    ...card, display: 'flex', alignItems: 'center', gap: '16px', cursor: 'pointer', padding: '14px 18px', flexWrap: 'wrap',
  },
  cell: { fontSize: '14px', color: colors.textPrimary, minWidth: '90px' },
  statusBadge: {
    marginLeft: 'auto', fontSize: '12px', fontWeight: 700, color: colors.primary,
    background: colors.primaryLight, padding: '5px 10px', borderRadius: '6px',
  },
}