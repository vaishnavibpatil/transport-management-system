import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { sendWhatsAppMessage, sendWhatsAppImage } from '../lib/whatsapp'
import Navbar from '../components/layout/Navbar'
import { colors, card, button as btn } from '../styles/theme'

export default function TripDetails() {
  const { tripId } = useParams()
  const navigate = useNavigate()
  const [payment, setPayment] = useState(null)
  const [processingPayment, setProcessingPayment] = useState(false)
  const [markingReceived, setMarkingReceived] = useState(false)
  const [trip, setTrip] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    loadTrip()
  }, [tripId])

  async function loadTrip() {
    const { data } = await supabase
      .from('trips')
      .select('*, vehicle_details(*), inland_details(*), pods(*), advances(*)')
      .eq('id', tripId)
      .single()
    setTrip(data)

    const { data: paymentData } = await supabase
      .from('payments')
      .select('*')
      .eq('trip_id', tripId)
      .maybeSingle()

    setPayment(paymentData)
  }

  async function handlePodUpload(e) {
    const file = e.target.files[0]
    if (!file) return

    setError('')
    setUploading(true)

    // Send the image directly to WhatsApp — no Supabase Storage, no saved copy anywhere
    await sendWhatsAppImage(
      'YOUR_WHATSAPP_NUMBER_HERE',
      file,
      `POD Uploaded\nLR: ${trip.lr_number}\nVehicle: ${trip.vehicle_number}`
    )

    // Record only that a POD was uploaded (timestamp) — not the image itself
    await supabase.from('pods').upsert({ trip_id: tripId, uploaded_at: new Date().toISOString() })
    await supabase.from('trips').update({ status: 'POD Uploaded' }).eq('id', tripId)

    const vehicleAmount = trip.vehicle_details?.vehicle_amount || 0
    const totalAdvanceNow = (trip.advances || [])
      .filter((a) => a.advance_type !== 'Pending')
      .reduce((sum, a) => sum + Number(a.amount), 0)
    const remaining = vehicleAmount - totalAdvanceNow

    await supabase.from('payments').upsert({ trip_id: tripId, remaining_amount: remaining, paid: false })

    setUploading(false)
    loadTrip()
  }

    async function handlePayRemaining() {
    setProcessingPayment(true)
    await supabase.from('payments').update({ paid: true, paid_at: new Date().toISOString() }).eq('trip_id', tripId)
    await checkAndCompleteTrip()
    setProcessingPayment(false)
    loadTrip()
  }

    async function handleMarkBalanceReceived() {
    setMarkingReceived(true)
    await supabase
      .from('inland_details')
      .update({ balance_received: true, balance_received_at: new Date().toISOString() })
      .eq('trip_id', tripId)
    await checkAndCompleteTrip()
    setMarkingReceived(false)
    loadTrip()
  }

    async function checkAndCompleteTrip() {
    // Re-fetch the latest state so we're checking real, current values
    const { data: latestPayment } = await supabase
      .from('payments')
      .select('paid')
      .eq('trip_id', tripId)
      .maybeSingle()

    const { data: latestInland } = await supabase
      .from('inland_details')
      .select('balance_received')
      .eq('trip_id', tripId)
      .maybeSingle()

    const vehiclePaid = latestPayment?.paid ?? false
    const inlandReceived = latestInland?.balance_received ?? false

    // Only mark Trip Completed once BOTH sides are financially closed
    if (vehiclePaid && inlandReceived) {
      await supabase.from('trips').update({ status: 'Trip Completed' }).eq('id', tripId)
    } else if (vehiclePaid) {
      await supabase.from('trips').update({ status: 'Payment Completed' }).eq('id', tripId)
    }
  }
  if (!trip) return <p style={{ padding: '24px' }}>Loading...</p>

  const podUploaded = !!trip.pods
  const totalAdvance = (trip.advances || [])
    .filter((a) => a.advance_type !== 'Pending')
    .reduce((sum, a) => sum + Number(a.amount), 0)
  const vehicleRemaining = (trip.vehicle_details?.vehicle_amount || 0) - totalAdvance

  return (
    <div>
      <Navbar />
      <div style={styles.container}>
        <h2>Trip Details</h2>
        <div style={styles.infoBox}>
          <p><strong>LR Number:</strong> {trip.lr_number}</p>
          <p><strong>Vehicle:</strong> {trip.vehicle_number}</p>
          <p><strong>Party:</strong> {trip.party_name}</p>
          <p><strong>Status:</strong> {trip.status}</p>
        </div>

        <h3 style={{ marginTop: '20px' }}>Vehicle Side</h3>
        <div style={styles.sideCardFull}>
          {trip.vehicle_details ? (
            <>
              <p style={styles.success}>✅ Amount: ₹{trip.vehicle_details.vehicle_amount.toLocaleString('en-IN')}</p>
              <p style={styles.subText}>Advance Paid: ₹{totalAdvance.toLocaleString('en-IN')}</p>

              {!podUploaded && (
                <>
                  <label style={styles.uploadButton}>
                    {uploading ? 'Uploading...' : '📷 Upload / Take POD Photo'}
                    <input
                      type="file" accept="image/*" capture="environment"
                      onChange={handlePodUpload} disabled={uploading} style={{ display: 'none' }}
                    />
                  </label>
                  {error && <p style={styles.error}>{error}</p>}
                </>
              )}

              {podUploaded && (
                <>
                  <p style={styles.success}>✅ POD Uploaded</p>
                  <p style={styles.subText}>Remaining Amount: ₹{vehicleRemaining.toLocaleString('en-IN')}</p>
                  <p style={styles.subText}>Payment Status: {payment?.paid ? '✅ Paid' : '⏳ Pending'}</p>

                                    {!payment?.paid && (
                    <button onClick={handlePayRemaining} disabled={processingPayment} style={styles.smallButtonPrimary}>
                      {processingPayment ? 'Processing...' : 'Pay Remaining Amount'}
                    </button>
                  )}
                </>
              )}

              <button onClick={() => navigate(`/trip/${tripId}/vehicle`)} style={styles.smallButton}>
                ✏️ Edit Vehicle / Advance Details
              </button>
            </>
          ) : (
            <button onClick={() => navigate(`/trip/${tripId}/vehicle`)} style={styles.smallButton}>
              + Add Vehicle Details
            </button>
          )}
        </div>

        <h3 style={{ marginTop: '20px' }}>Inland Side</h3>
        <div style={styles.sideCardFull}>
          {trip.inland_details ? (
            <>
              <p style={styles.success}>✅ Amount: ₹{trip.inland_details.company_amount.toLocaleString('en-IN')}</p>
              <p style={styles.subText}>Company Advance: ₹{Number(trip.inland_details.company_advance).toLocaleString('en-IN')}</p>
              <p style={styles.subText}>Balance to Receive: ₹{Number(trip.inland_details.company_balance).toLocaleString('en-IN')}</p>
              <p style={styles.subText}>
                Balance Status: {trip.inland_details.balance_received ? '✅ Received' : '⏳ Pending'}
              </p>

                            {!trip.inland_details.balance_received && (
                <button onClick={handleMarkBalanceReceived} disabled={markingReceived} style={styles.smallButtonPrimary}>
                  {markingReceived ? 'Marking...' : 'Mark Balance Received'}
                </button>
              )}

              <button onClick={() => navigate(`/trip/${tripId}/inland`)} style={styles.smallButton}>
                ✏️ Edit Inland / Advance Details
              </button>
            </>
          ) : (
            <button onClick={() => navigate(`/trip/${tripId}/inland`)} style={styles.smallButton}>
              + Add Inland Details
            </button>
          )}
        </div>

        {trip.vehicle_details && trip.inland_details && (
          <div style={styles.profitBox}>
            Profit: <strong>₹{(trip.inland_details.company_amount - trip.vehicle_details.vehicle_amount).toLocaleString('en-IN')}</strong>
          </div>
        )}
      </div>
    </div>
  )
}

const styles = {
  container: { padding: '28px', maxWidth: '500px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '10px' },
  infoBox: { ...card, display: 'flex', flexDirection: 'column', gap: '8px' },
  sideCardFull: { ...card, display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-start' },
  subText: { fontSize: '13px', color: colors.textSecondary, margin: 0 },
  smallButton: { ...btn.secondary, marginTop: '4px' },
  smallButtonPrimary: { ...btn.primary, padding: '9px 16px', fontSize: '13px', marginTop: '4px' },
  uploadButton: { ...btn.primary, display: 'inline-block', textAlign: 'center' },
  success: { color: colors.success, fontWeight: 600, margin: 0 },
  error: { color: colors.danger, fontSize: '13px', margin: 0 },
  profitBox: {
    padding: '16px', background: colors.successLight, borderRadius: '10px',
    fontSize: '16px', color: colors.success, fontWeight: 700, border: '1px solid #bbf7d0',
  },
}