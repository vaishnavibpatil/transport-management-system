import { colors, card } from '../styles/theme'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import Navbar from '../components/layout/Navbar'
import { useNavigate } from 'react-router-dom'
import { toLocalDateString } from '../utils/dates'

export default function Dashboard() {
  const navigate = useNavigate()
  const [stats, setStats] = useState({
    totalTrips: 0,
    todaysTrips: 0,
    pendingPODs: 0,
    pendingPayments: 0,
    completedTrips: 0,
    totalProfit: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStats()
  }, [])

  async function loadStats() {
    setLoading(true)

        const today = toLocalDateString()

    const [
      { count: totalTrips },
      { count: todaysTrips },
      podData,
      { count: pendingPayments },
      { count: completedTrips },
      profitData,
    ] = await Promise.all([
      supabase.from('trips').select('*', { count: 'exact', head: true }),
      supabase.from('trips').select('*', { count: 'exact', head: true }).eq('trip_date', today),
      supabase.from('trips').select('id, vehicle_details(id), pods(id)'),
      supabase.from('payments').select('*', { count: 'exact', head: true }).eq('paid', false),
      supabase.from('trips').select('*', { count: 'exact', head: true }).eq('status', 'Trip Completed'),
      supabase.from('trips').select('id, vehicle_details(vehicle_amount), inland_details(company_amount)'),
    ])

    // Pending POD = vehicle details added, no POD uploaded yet
    const pendingPODs = (podData.data || []).filter((t) => t.vehicle_details && !t.pods).length

    let totalProfit = 0
    if (profitData.data) {
      totalProfit = profitData.data.reduce((sum, trip) => {
        const vehicleAmt = trip.vehicle_details?.vehicle_amount
        const companyAmt = trip.inland_details?.company_amount
        if (vehicleAmt != null && companyAmt != null) {
          return sum + (companyAmt - vehicleAmt)
        }
        return sum
      }, 0)
    }

    setStats({
      totalTrips: totalTrips || 0,
      todaysTrips: todaysTrips || 0,
      pendingPODs,
      pendingPayments: pendingPayments || 0,
      completedTrips: completedTrips || 0,
      totalProfit,
    })
    setLoading(false)
  }

  const cards = [
    { label: 'Total Trips', value: stats.totalTrips },
    { label: "Today's Trips", value: stats.todaysTrips },
    { label: 'Pending PODs', value: stats.pendingPODs },
    { label: 'Pending Payments', value: stats.pendingPayments },
    { label: 'Completed Trips', value: stats.completedTrips },
    { label: 'Total Profit', value: `₹${stats.totalProfit.toLocaleString('en-IN')}` },
  ]

  return (
    <div>
      <Navbar />
      <div style={styles.container}>
        <div style={styles.headerRow}>
          <h2 style={styles.heading}>Dashboard</h2>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button onClick={() => navigate('/all-trips')} style={styles.createButton}>
              📋 All Trips
            </button>
            <button onClick={() => navigate('/pending-pod')} style={styles.createButton}>
              📷 Pending POD
            </button>
            <button onClick={() => navigate('/pending-payment')} style={styles.createButton}>
              💰 Pending Payment
            </button>
            <button onClick={() => navigate('/search-trip')} style={styles.createButton}>
              🔍 Search Trip
            </button>
            <button onClick={() => navigate('/create-trip')} style={styles.createButton}>
              + Create Trip
            </button>
            <button onClick={() => navigate('/reports')} style={styles.createButton}>
              📊 Reports
            </button>
          </div>
        </div>
        {loading ? (
          <p>Loading...</p>
        ) : (
          <div style={styles.grid}>
            {cards.map((c) => (
              <div key={c.label} style={styles.card}>
                <p style={styles.cardLabel}>{c.label}</p>
                <p style={styles.cardValue}>{c.value}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

const styles = {
  container: { padding: '28px', maxWidth: '1000px', margin: '0 auto' },
  heading: { margin: 0, fontSize: '22px', color: colors.textPrimary },
  headerRow: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px',
  },
  createButton: {
    background: colors.primary, color: '#fff', border: 'none', padding: '11px 20px',
    borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '14px',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '16px',
  },
  card: { ...card },
  cardLabel: { color: colors.textSecondary, fontSize: '13px', marginBottom: '8px', fontWeight: 500 },
  cardValue: { fontSize: '26px', fontWeight: 700, margin: 0, color: colors.textPrimary },
}