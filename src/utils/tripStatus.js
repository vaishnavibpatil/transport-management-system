import { supabase } from '../lib/supabaseClient'

// Recalculates a trip's status based on which sides are filled in:
//   Trip Created            -> neither side added yet
//   Vehicle Details Added   -> vehicle done, inland not yet
//   Inland Details Added    -> BOTH vehicle and inland are done
// Never touches trips that have already moved past this stage
// (POD Uploaded, Payment Completed, Trip Completed stay untouched).
export async function updateTripStageStatus(tripId) {
  const { data: trip } = await supabase
    .from('trips')
    .select('status, vehicle_details(id), inland_details(id)')
    .eq('id', tripId)
    .single()

  if (!trip) return

  const laterStages = ['POD Uploaded', 'Payment Completed', 'Trip Completed']
  if (laterStages.includes(trip.status)) return

  const hasVehicle = !!trip.vehicle_details
  const hasInland = !!trip.inland_details

  let newStatus = 'Trip Created'
  if (hasVehicle && hasInland) newStatus = 'Inland Details Added'
  else if (hasVehicle) newStatus = 'Vehicle Details Added'

  if (newStatus !== trip.status) {
    await supabase.from('trips').update({ status: newStatus }).eq('id', tripId)
  }
}
// If vehicle is paid: Payment Completed. If company balance also received: Trip Completed.
export async function completeTripIfSettled(tripId) {
  const { data: payment } = await supabase
    .from('payments').select('paid').eq('trip_id', tripId).maybeSingle()

  const { data: inland } = await supabase
    .from('inland_details').select('balance_received').eq('trip_id', tripId).maybeSingle()

  const vehiclePaid = payment?.paid ?? false
  const inlandReceived = inland?.balance_received ?? false

  if (vehiclePaid && inlandReceived) {
    await supabase.from('trips').update({ status: 'Trip Completed' }).eq('id', tripId)
  } else if (vehiclePaid) {
    await supabase.from('trips').update({ status: 'Payment Completed' }).eq('id', tripId)
  }
}