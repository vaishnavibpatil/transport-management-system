import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import Navbar from '../components/layout/Navbar'
import { colors, input as inp, button as btn } from '../styles/theme'
import { updateTripStageStatus } from '../utils/tripStatus'

export default function InlandDetails() {
  const { tripId } = useParams()
  const navigate = useNavigate()

  const [thcNumber, setThcNumber] = useState('')
  const [tonnage, setTonnage] = useState('')
  const [companyRate, setCompanyRate] = useState('')
  const [companyAdvance, setCompanyAdvance] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [loadingExisting, setLoadingExisting] = useState(true)

  useEffect(() => {
    loadExisting()
  }, [tripId])

  async function loadExisting() {
    const { data: trip } = await supabase.from('trips').select('thc_number').eq('id', tripId).single()
    if (trip?.thc_number) setThcNumber(trip.thc_number)

    const { data: existing } = await supabase
      .from('inland_details')
      .select('*')
      .eq('trip_id', tripId)
      .maybeSingle()

    if (existing) {
      setIsEditing(true)
      setTonnage(String(existing.tonnage))
      setCompanyRate(String(existing.company_rate))
      setCompanyAdvance(String(existing.company_advance || 0))
    }

    setLoadingExisting(false)
  }

  const companyAmount = (parseFloat(tonnage) || 0) * (parseFloat(companyRate) || 0)
  const companyBalance = companyAmount - (parseFloat(companyAdvance) || 0)

  async function handleSubmit() {
    setError('')
    if (!tonnage || !companyRate) {
      setError('Tonnage and Company Rate are required')
      return
    }
    setLoading(true)

    if (isEditing) {
      const { error: updateError } = await supabase
        .from('inland_details')
        .update({
          tonnage: parseFloat(tonnage),
          company_rate: parseFloat(companyRate),
          company_advance: parseFloat(companyAdvance) || 0,
        })
        .eq('trip_id', tripId)

      if (updateError) {
        setError('Failed to update: ' + updateError.message)
        setLoading(false)
        return
      }

           await supabase.from('trips').update({ thc_number: thcNumber || null }).eq('id', tripId)
      await updateTripStageStatus(tripId)
    } else {
      const { error: inlandError } = await supabase.from('inland_details').insert({
        trip_id: tripId,
        tonnage: parseFloat(tonnage),
        company_rate: parseFloat(companyRate),
        company_advance: parseFloat(companyAdvance) || 0,
      })

      if (inlandError) {
        setError('Failed to save inland details: ' + inlandError.message)
        setLoading(false)
        return
      }

      await supabase
        .from('trips')
        .update({ thc_number: thcNumber || null, status: 'Inland Details Added' })
        .eq('id', tripId)
    }

    setLoading(false)
    navigate(`/trip/${tripId}`)
  }

  if (loadingExisting) return <p style={{ padding: '24px' }}>Loading...</p>

  return (
    <div>
      <Navbar />
      <div style={styles.container}>
        <h2>{isEditing ? 'Edit Inland Details' : 'Inland Details'}</h2>

        <label style={styles.label}>
          THC Number
          <input value={thcNumber} onChange={(e) => setThcNumber(e.target.value)} style={styles.input} placeholder="Entered by transporter" />
        </label>

        <label style={styles.label}>
          Tonnage
          <input type="number" value={tonnage} onChange={(e) => setTonnage(e.target.value)} style={styles.input} />
        </label>

        <label style={styles.label}>
          Company Rate (per ton)
          <input type="number" value={companyRate} onChange={(e) => setCompanyRate(e.target.value)} style={styles.input} />
        </label>

        <div style={styles.amountBox}>
          Company Amount: <strong>₹{companyAmount.toLocaleString('en-IN')}</strong>
        </div>

        <label style={styles.label}>
          Company Advance
          <input type="number" value={companyAdvance} onChange={(e) => setCompanyAdvance(e.target.value)} style={styles.input} placeholder="₹0" />
        </label>

        <div style={styles.amountBox}>
          Company Balance: <strong>₹{companyBalance.toLocaleString('en-IN')}</strong>
        </div>

        {error && <p style={styles.error}>{error}</p>}

        <button onClick={handleSubmit} disabled={loading} style={styles.button}>
          {loading ? 'Saving...' : isEditing ? 'Update Inland Details' : 'Save Inland Details'}
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