import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import Navbar from '../components/layout/Navbar'

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

    // Mandatory field check
    if (!form.lr_number || !form.trip_date || !form.vehicle_number || !form.party_name || !form.truck_type) {
      setError('Please fill all mandatory fields (marked *)')
      return
    }

    setLoading(true)

    const { data: userData } = await supabase.auth.getUser()

    const { data, error: insertError } = await supabase
      .from('trips')
      .insert({
        lr_number: form.lr_number,
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
      setError('Failed to create trip: ' + insertError.message)
      return
    }

    // Move to the next step: choosing Vehicle / Inland
    navigate(`/trip/${data.id}/select-type`)
  }

  return (
    <div>
      <Navbar />
      <div style={styles.container}>
        <h2>Create New Trip</h2>
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
  container: { padding: '24px', maxWidth: '480px' },
  form: { display: 'flex', flexDirection: 'column', gap: '16px' },
  label: { display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '14px', fontWeight: 'bold' },
  input: { padding: '10px', fontSize: '15px', border: '1px solid #ccc', borderRadius: '6px' },
  button: {
    padding: '12px', fontSize: '15px', background: '#2563eb', color: '#fff',
    border: 'none', borderRadius: '6px', cursor: 'pointer', marginTop: '10px',
  },
  error: { color: 'red', fontSize: '13px', margin: 0 },
}