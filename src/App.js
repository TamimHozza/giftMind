import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import AddRecipient from './pages/AddRecipient';
import GiftIdeas from './pages/GiftIdeas';
import Login from './pages/Login';
import Signup from './pages/Signup';
import PrivateRoute from './components/PrivateRoute';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        <Route
          path="/"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/add-recipient"
          element={
            <PrivateRoute>
              <AddRecipient />
            </PrivateRoute>
          }
        />
        <Route
          path="/recipient/:id"
          element={
            <PrivateRoute>
              <GiftIdeas />
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
