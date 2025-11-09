import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../components/auth/AuthProvider';


const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  useEffect(() => {
    // Check if token exists in localStorage
    const token = localStorage.getItem('auth_token');
    if (!token) {
      // Redirect to login if token doesn't exist
      navigate('/login');
    }
  }, [navigate]);

  const handleLogout = () => {
    logout()
  };

  return (
    <div className="min-h-screen bg-base-100">
      <div className="navbar bg-primary text-primary-content">
        <div className="flex-1">
          <a className="btn btn-ghost normal-case text-xl">Dashboard</a>
        </div>
        <div className="flex-none">
          <button className="btn btn-ghost" onClick={handleLogout}>Logout</button>
        </div>
      </div>

      <div className="container mx-auto p-4">
        <div className="card bg-base-200 shadow-xl">
          <div className="card-body">
            <h2 className="card-title text-2xl mb-4">Welcome to your Dashboard!</h2>
            <p>You have successfully logged in to the application.</p>
            <p className="mt-4">This is a sample dashboard page that demonstrates successful authentication.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;