import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LoginForm from '../components/auth/LoginForm';
import ForgotPasswordForm from '../components/auth/ForgotPasswordForm';
import RegistrationForm from '../components/auth/RegistrationForm';
import logo from '../assets/GA_logo.png';

const AuthView = {
  LOGIN: 'LOGIN',
  REGISTER: 'REGISTER',
  FORGOT_PASSWORD: 'FORGOT_PASSWORD'
} as const;

type AuthViewValue = typeof AuthView[keyof typeof AuthView];

const Login: React.FC = () => {
  const [currentView, setCurrentView] = useState<AuthViewValue>(AuthView.LOGIN);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if token exists in localStorage
    const token = localStorage.getItem('auth_token');
    if (token) {
      // Redirect to dashboard if token exists
      navigate('/dashboard');
    }
  }, [navigate]);

  const handleLoginSuccess = () => {
    navigate('/dashboard');
  };

  const handleForgotPasswordSuccess = () => {
    setCurrentView(AuthView.LOGIN);
  };

  const handleRegistrationSuccess = () => {
    navigate('/dashboard');
  };

  const renderAuthView = () => {
    switch (currentView) {
      case AuthView.LOGIN:
        return (
          <LoginForm 
            onSuccess={handleLoginSuccess} 
            onForgotPassword={() => setCurrentView(AuthView.FORGOT_PASSWORD)}
            onRegister={() => setCurrentView(AuthView.REGISTER)}
          />
        );
      case AuthView.REGISTER:
        return (
          <RegistrationForm 
            onSuccess={handleRegistrationSuccess}
            onBackToLogin={() => setCurrentView(AuthView.LOGIN)}
          />
        );
      case AuthView.FORGOT_PASSWORD:
        return (
          <ForgotPasswordForm 
            onSuccess={handleForgotPasswordSuccess}
            onBackToLogin={() => setCurrentView(AuthView.LOGIN)}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-start bg-base-100">
      <div className="mb-6">
        <img src={logo} alt="GA Logo" className="h-16" />
      </div>
      <div className="w-full max-w-md flex justify-center items-center">
        {renderAuthView()}
      </div>
    </div>
  );
};

export default Login;