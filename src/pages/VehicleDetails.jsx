import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { sendWhatsAppMessage } from '../lib/whatsapp'
import Navbar from '../components/layout/Navbar'
import { colors, card, button as btn, input as inp } from '../styles/theme'
import { updateTripStageStatus } from '../utils/tripStatus'

export default function VehicleDetails() {
  const { tripId } = useParams()
  const navigate = useNavigate()

  const [tonnage, setTonnage] = useState('')
  const [rate, setRate] = useState('')
  const [advances, setAdvances] = useState({ Cash: '', Fuel: '', UPI: '', Pending: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [loadingExisting, setLoadingExisting] = useState(true)

  useEffect(() => {
    loadExisting()
  }, [tripId])

  async function loadExisting() {
    const { data: existingVehicle } = await supabase
      .from('vehicle_details')
      .select('*')
      .eq('trip_id', tripId)
      .maybeSingle()

    if (existingVehicle) {
      setIsEditing(true)
      setTonnage(String(existingVehicle.tonnage))
      setRate(String(existingVehicle.rate))

      const { data: existingAdvances } = await supabase
        .from('advances')
        .select('*')
        .eq('trip_id', tripId)

      const prefill = { Cash: '', Fuel: '', UPI: '', Pending: '' }
      ;(existingAdvances || []).forEach((a) => {
        prefill[a.advance_type] = String(a.amount)
      })
      setAdvances(prefill)
    }

    setLoadingExisting(false)
  }

  const vehicleAmount = (parseFloat(tonnage) || 0) * (parseFloat(rate) || 0)
  const totalAdvance =
    (parseFloat(advances.Cash) || 0) +
    (parseFloat(advances.Fuel) || 0) +
    (parseFloat(advances.UPI) || 0)
  const remainingAmount = vehicleAmount - totalAdvance

  function handleAdvanceChange(type, value) {
    setAdvances({ ...advances, [type]: value })
  }

  async function handleSubmit() {
    setError('')
    if (!tonnage || !rate) {
      setError('Tonnage and Rate are required')
      return
    }
    setLoading(true)

    if (isEditing) {
      // Update existing vehicle_details
      const { error: updateError } = await supabase
        .from('vehicle_details')
        .update({ tonnage: parseFloat(tonnage), rate: parseFloat(rate) })
        .eq('trip_id', tripId)

      if (updateError) {
        setError('Failed to update: ' + updateError.message)
        setLoading(false)
        return
      }

      // Replace advances with the edited values
      await supabase.from('advances').delete().eq('trip_id', tripId)

      const advanceRows = Object.entries(advances)
        .filter(([, amount]) => parseFloat(amount) > 0)
        .map(([type, amount]) => ({ trip_id: tripId, advance_type: type, amount: parseFloat(amount) }))

      if (advanceRows.length > 0) {
        await supabase.from('advances').insert(advanceRows)
      }
    } else {
      // Insert new vehicle_details
      const { error: vehicleError } = await supabase.from('vehicle_details').insert({
        trip_id: tripId,
        tonnage: parseFloat(tonnage),
        rate: parseFloat(rate),
      })

      if (vehicleError) {
        setError('Failed to save vehicle details: ' + vehicleError.message)
        setLoading(false)
        return
      }

      const advanceRows = Object.entries(advances)
        .filter(([, amount]) => parseFloat(amount) > 0)
        .map(([type, amount]) => ({ trip_id: tripId, advance_type: type, amount: parseFloat(amount) }))

      if (advanceRows.length > 0) {
        await supabase.from('advances').insert(advanceRows)
      }

           await updateTripStageStatus(tripId)

      if (parseFloat(advances.Fuel) > 0) {
        const { data: tripData } = await supabase
          .from('trips')
          .select('vehicle_number')
          .eq('id', tripId)
          .single()

        await sendWhatsAppMessage(
          'YOUR_WHATSAPP_NUMBER_HERE',
          `Fuel Advance Alert\nVehicle: ${tripData.vehicle_number}\nFuel Amount: ₹${advances.Fuel}`
        )
      }
    }

    setLoading(false)
    navigate(`/trip/${tripId}`)
  }

  if (loadingExisting) return <p style={{ padding: '24px' }}>Loading...</p>

  return (
    <div>
      <Navbar />
      <div style={styles.container}>
        <h2>{isEditing ? 'Edit Vehicle Details' : 'Vehicle Details'}</h2>

        <label style={styles.label}>
          Tonnage
          <input type="number" value={tonnage} onChange={(e) => setTonnage(e.target.value)} style={styles.input} />
        </label>

        <label style={styles.label}>
          Rate (per ton)
          <input type="number" value={rate} onChange={(e) => setRate(e.target.value)} style={styles.input} />
        </label>

        <div style={styles.amountBox}>
          Vehicle Amount: <strong>₹{vehicleAmount.toLocaleString('en-IN')}</strong>
        </div>

        <h3 style={{ marginTop: '24px' }}>Advance</h3>
        {['Cash', 'Fuel', 'UPI', 'Pending'].map((type) => (
          <label key={type} style={styles.label}>
            {type}
            <input
              type="number"
              value={advances[type]}
              onChange={(e) => handleAdvanceChange(type, e.target.value)}
              style={styles.input}
              placeholder="₹0"
            />
          </label>
        ))}

        <div style={styles.amountBox}>
          Remaining Amount: <strong>₹{remainingAmount.toLocaleString('en-IN')}</strong>
        </div>

        {error && <p style={styles.error}>{error}</p>}

        <button onClick={handleSubmit} disabled={loading} style={styles.button}>
          {loading ? 'Saving...' : isEditing ? 'Update Vehicle Details' : 'Save Vehicle Details'}
        </button>
      </div>
    </div>
  )
}

const styles = {
  container: { padding: '28px', maxWidth: '420px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '14px' },
  label: { display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '14px', fontWeight: 600, color: colors.textPrimary },
  input: { ...inp },
  amountBox: { padding: '12px', background: colors.primaryLight, borderRadius: '8px', fontSize: '15px' },
  button: { ...btn.primary, marginTop: '10px' },
  error: { color: colors.danger, fontSize: '13px', margin: 0 },
}