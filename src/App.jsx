import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import ProtectedRoute from './components/shared/ProtectedRoute'
import CreateTrip from './pages/CreateTrip'
import SelectTripType from './pages/SelectTripType'
import VehicleDetails from './pages/VehicleDetails'
import InlandDetails from './pages/InlandDetails'
import SearchTrip from './pages/SearchTrip'
import TripDetails from './pages/TripDetails'
import AllTrips from './pages/AllTrips'
import PendingPOD from './pages/PendingPOD'
import PendingPayment from './pages/PendingPayment'
import Reports from './pages/Reports'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route
          path="/dashboard"
          
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
                <Route
          path="/create-trip"
          element={
            <ProtectedRoute>
              <CreateTrip />
            </ProtectedRoute>
          }
        />
        <Route
          path="/trip/:tripId/select-type"
          element={
            <ProtectedRoute>
              <SelectTripType />
            </ProtectedRoute>
          }
        />
        <Route
          path="/trip/:tripId/vehicle"
          element={
            <ProtectedRoute>
              <VehicleDetails />
            </ProtectedRoute>
          }
        />
        <Route
          path="/trip/:tripId/inland"
          element={
            <ProtectedRoute>
              <InlandDetails />
            </ProtectedRoute>
          }
        />
                <Route
          path="/search-trip"
          element={
            <ProtectedRoute>
              <SearchTrip />
            </ProtectedRoute>
          }
        />
        <Route
          path="/trip/:tripId"
          element={
            <ProtectedRoute>
              <TripDetails />
            </ProtectedRoute>
          }
        />
        <Route path="/all-trips" element={<ProtectedRoute><AllTrips /></ProtectedRoute>} />
        <Route path="/pending-pod" element={<ProtectedRoute><PendingPOD /></ProtectedRoute>} />
        <Route path="/pending-payment" element={<ProtectedRoute><PendingPayment /></ProtectedRoute>} />
                <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  )
}

export default App