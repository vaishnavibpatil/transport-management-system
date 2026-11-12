import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import Navbar from '../components/layout/Navbar'
import { colors, card } from '../styles/theme'

function getDateRange(period) {
  const today = new Date()
  const end = today.toISOString().split('T')[0]
  let start

  if (period === 'daily') {
    start = end
  } else if (period === 'weekly') {
    const d = new Date(today)
    d.setDate(d.getDate() - 7)
    start = d.toISOString().split('T')[0]
  } else if (period === 'monthly') {
    const d = new Date(today)
    d.setMonth(d.getMonth() - 1)
    start = d.toISOString().split('T')[0]
  }

  return { start, end }
}

export default function Reports() {
  const navigate = useNavigate()
  const [period, setPeriod] = useState('daily')
  const [customStart, setCustomStart] = useState('')
  const [customEnd, setCustomEnd] = useState('')
  const [report, setReport] = useState(null)
  const [trips, setTrips] = useState([])
  const [loading, setLoading] = useState(false)

  async function runReport() {
    setLoading(true)

    let start, end
    if (period === 'custom') {
      if (!customStart || !customEnd) {
        setLoading(false)
        return
      }
      start = customStart
      end = customEnd
    } else {
      const range = getDateRange(period)
      start = range.start
      end = range.end
    }

    const { data: tripsData } = await supabase
      .from('trips')
      .select('id, lr_number, vehicle_number, party_name, trip_date, status, vehicle_details(vehicle_amount), inland_details(company_amount, company_balance, balance_received), payments(paid, remaining_amount)')
      .gte('trip_date', start)
      .lte('trip_date', end)

    let totalTrips = 0
    let companyAmount = 0
    let vehicleAmount = 0
    let totalPendingVehicle = 0
    let remainingByCompany = 0
    let totalProfit = 0

    ;(tripsData || []).forEach((trip) => {
      totalTrips += 1

      const vAmt = trip.vehicle_details?.vehicle_amount || 0
      const cAmt = trip.inland_details?.company_amount || 0

      vehicleAmount += vAmt
      companyAmount += cAmt

      if (trip.vehicle_details && trip.inland_details) {
        totalProfit += cAmt - vAmt
      }

      if (trip.payments && !trip.payments.paid) {
        totalPendingVehicle += Number(trip.payments.remaining_amount || 0)
      }

      if (trip.inland_details && !trip.inland_details.balance_received) {
        remainingByCompany += Number(trip.inland_details.company_balance || 0)
      }
    })

    setReport({
      totalTrips, companyAmount, vehicleAmount,
      totalPendingVehicle, remainingByCompany, totalProfit, start, end,
    })
    setTrips(tripsData || [])
    setLoading(false)
  }

  const cards = report ? [
    { label: 'Total Trips', value: report.totalTrips },
    { label: 'Company Amount', value: `₹${report.companyAmount.toLocaleString('en-IN')}` },
    { label: 'Vehicle Amount', value: `₹${report.vehicleAmount.toLocaleString('en-IN')}` },
    { label: 'Total Pending Amount', value: `₹${report.totalPendingVehicle.toLocaleString('en-IN')}` },
    { label: 'Remaining Amount by Company', value: `₹${report.remainingByCompany.toLocaleString('en-IN')}` },
    { label: 'Total Profit', value: `₹${report.totalProfit.toLocaleString('en-IN')}` },
  ] : []

  return (
    <div>
      <Navbar />
      <div style={styles.container}>
        <h2>Reports</h2>

        <div style={styles.periodRow}>
          {['daily', 'weekly', 'monthly', 'custom'].map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              style={period === p ? styles.periodButtonActive : styles.periodButton}
            >
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
        </div>

        {period === 'custom' && (
          <div style={styles.customRow}>
            <input type="date" value={customStart} onChange={(e) => setCustomStart(e.target.value)} style={styles.input} />
            <span>to</span>
            <input type="date" value={customEnd} onChange={(e) => setCustomEnd(e.target.value)} style={styles.input} />
          </div>
        )}

        <button onClick={runReport} disabled={loading} style={styles.runButton}>
          {loading ? 'Generating...' : 'Generate Report'}
        </button>

        {report && (
          <>
            <p style={styles.rangeText}>Showing: {report.start} to {report.end}</p>
            <div style={styles.grid}>
              {cards.map((c) => (
                <div key={c.label} style={styles.card}>
                  <p style={styles.cardLabel}>{c.label}</p>
                  <p style={styles.cardValue}>{c.value}</p>
                </div>
              ))}
            </div>

            <h3 style={{ marginTop: '10px' }}>Matching Trips ({trips.length})</h3>
            <div style={styles.list}>
              {trips.length === 0 && <p style={{ color: colors.textSecondary }}>No trips in this range.</p>}
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
          </>
        )}
      </div>
    </div>
  )
}

const styles = {
  container: { padding: '28px', maxWidth: '900px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '16px' },
  periodRow: { display: 'flex', gap: '8px', flexWrap: 'wrap' },
  periodButton: {
    padding: '9px 18px', background: '#fff', color: colors.textPrimary, border: `1px solid ${colors.border}`,
    borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '13px',
  },
  periodButtonActive: {
    padding: '9px 18px', background: colors.primary, color: '#fff', border: 'none',
    borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '13px',
  },
  customRow: { display: 'flex', alignItems: 'center', gap: '10px' },
  input: { padding: '9px 12px', border: `1px solid ${colors.border}`, borderRadius: '8px', fontSize: '14px' },
  runButton: {
    padding: '11px 20px', background: colors.primary, color: '#fff', border: 'none',
    borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '14px', width: 'fit-content',
  },
  rangeText: { color: colors.textSecondary, fontSize: '13px', margin: 0 },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' },
  card: { ...card },
  cardLabel: { color: colors.textSecondary, fontSize: '13px', marginBottom: '8px', fontWeight: 500 },
  cardValue: { fontSize: '24px', fontWeight: 700, margin: 0, color: colors.textPrimary },
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