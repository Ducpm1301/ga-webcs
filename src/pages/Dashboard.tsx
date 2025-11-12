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
      <div className="container mx-auto p-4">
        <div className="card bg-base-200 shadow-xl">
          <div className="card-body">
            <h2 className="card-title text-2xl mb-4">Welcome to WebCS!</h2>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;