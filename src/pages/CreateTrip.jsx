import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import Navbar from '../components/layout/Navbar'
import { colors, card, button as btn, input as inp } from '../styles/theme'

const TRUCK_TYPES = ['A1', 'A2', 'A5', 'A8', 'T6', 'T1']

export default function CreateTrip() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    lr_number: '',
    trip_date: '',
    vehicle_number: '',
    party_name: '',
    truck_type: '',
    ss_point: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    const lr = form.lr_number.trim()

    // Mandatory field check

    if (!lr || !form.trip_date || !form.vehicle_number || !form.party_name || !form.truck_type) {
      setError('Please fill all mandatory fields (marked *)')
      return
    }

    setLoading(true)

    // Block duplicate LR number (case-insensitive). Escape LIKE wildcards in the input.
    const safeLr = lr.replace(/[\\%_]/g, '\\$&')
    const { data: existing, error: checkError } = await supabase
      .from('trips')
      .select('id')
      .ilike('lr_number', safeLr)
      .limit(1)

    if (checkError) {
      setError('Could not check LR number: ' + checkError.message)
      setLoading(false)
      return
    }

    if (existing && existing.length > 0) {
      setError('LR Number already exists')
      setLoading(false)
      return
    }

    const { data: userData } = await supabase.auth.getUser()

    const { data, error: insertError } = await supabase
      .from('trips')
      .insert({

        lr_number: lr,
        trip_date: form.trip_date,
        vehicle_number: form.vehicle_number,
        party_name: form.party_name,
        truck_type: form.truck_type,
        ss_point: form.ss_point || null,
        created_by: userData.user.id,
        status: 'Trip Created',
      })
      .select()
      .single()

    setLoading(false)

    if (insertError) {
      // 23505 = unique violation (fires only once the DB unique index is added later)
      if (insertError.code === '23505') {
        setError('LR Number already exists')
      } else {
        setError('Failed to create trip: ' + insertError.message)
      }
      return
    }

    // Move to the next step: choosing Vehicle / Inland
    navigate(`/trip/${data.id}/select-type`)
  }

  return (
    <div>
      <Navbar />
      <div style={styles.container}>

        <h2 style={styles.heading}>Create New Trip</h2>
        <form onSubmit={handleSubmit} style={styles.form}>
          <label style={styles.label}>
            LR Number *
            <input name="lr_number" value={form.lr_number} onChange={handleChange} style={styles.input} />
          </label>

          <label style={styles.label}>
            Date *
            <input type="date" name="trip_date" value={form.trip_date} onChange={handleChange} style={styles.input} />
          </label>

          <label style={styles.label}>
            Vehicle Number *
            <input name="vehicle_number" value={form.vehicle_number} onChange={handleChange} style={styles.input} />
          </label>

          <label style={styles.label}>
            Party Name *
            <input name="party_name" value={form.party_name} onChange={handleChange} style={styles.input} />
          </label>

          <label style={styles.label}>
            Truck Type *
            <select name="truck_type" value={form.truck_type} onChange={handleChange} style={styles.input}>
              <option value="">Select...</option>
              {TRUCK_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </label>


          <label style={styles.label}>
            SS Point (optional)
            <input name="ss_point" value={form.ss_point} onChange={handleChange} style={styles.input} />
          </label>

          {error && <p style={styles.error}>{error}</p>}

          <button type="submit" disabled={loading} style={styles.button}>
            {loading ? 'Creating...' : 'Create Trip'}
          </button>
        </form>
      </div>
    </div>
  )
}

const styles = {
  container: { padding: '28px', maxWidth: '520px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '16px' },
  heading: { margin: 0, fontSize: '22px', color: colors.textPrimary },
  form: { ...card, display: 'flex', flexDirection: 'column', gap: '16px' },
  label: { display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '14px', fontWeight: 600, color: colors.textPrimary },
  input: { ...inp },
  button: { ...btn.primary, marginTop: '6px' },
  error: {
    color: colors.danger, background: colors.dangerLight, padding: '10px 12px',
    borderRadius: '8px', fontSize: '13px', margin: 0,
  },
}