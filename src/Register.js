import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import LetterGlitch from './glitch'; // Import the LetterGlitch component
import Swal from 'sweetalert2';
import './Register.css';

function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [toast, setToast] = useState(null);
  const navigate = useNavigate();

  // Auto-dismiss toast
  React.useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (password !== confirmPassword) {
      setToast({
        message: "Passwords don't match!",
        type: "error",
      });
      return;
    }
    
    if (!username || !email || !password) {
      setToast({
        message: "All fields are required!",
        type: "error",
      });
      return;
    }
    
    try {
      Swal.fire({
        title: 'Creating Account',
        text: 'Please wait...',
        icon: 'info',
        allowOutsideClick: false,
        showConfirmButton: false,
        willOpen: () => {
          Swal.showLoading();
        }
      });
      
      const response = await axios.post('http://localhost:5000/register', {
        username,
        email,
        password
      });
      
      Swal.close();
      
      // Store email for verification
      localStorage.setItem('verificationEmail', email);
      
      Swal.fire({
        title: 'Registration Successful!',
        text: 'Redirecting to verification page...',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false
      });
      
      setTimeout(() => {
        navigate('/verify-email');
      }, 2000);
      
    } catch (error) {
      Swal.close();
      
      Swal.fire({
        title: 'Registration Failed',
        text: error.response?.data?.message || "Registration failed. Please try again.",
        icon: 'error'
      });
    }
  };

  return (
    <div className="register-page">
      {/* LetterGlitch Background */}
      <div className="background">
        <LetterGlitch
          glitchSpeed={50}
          centerVignette={true}
          outerVignette={false}
          smooth={true}
          glitchColors={["#ffffff", "#ff5555", "#55ff55", "#0000ff", "#ffff00"]}
        />
      </div>
      
      <div className="register-container">
        <div className="register-card">
          <h1>Create Account</h1>
          <p className="register-subtitle">Join our chat platform today</p>
          
          {toast && (
            <div className={`toast ${toast.type === 'success' ? 'success' : 'error'}`}>
              {toast.message}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="register-form">
            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input
                type="text"
                id="username"
                name="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a password"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password"
              />
            </div>
            
            <button 
              type="submit" 
              className="register-button"
            >
              Register
            </button>
            
            <div className="login-link">
              Already have an account? <span onClick={() => navigate('/login')}>Login</span>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Register; 