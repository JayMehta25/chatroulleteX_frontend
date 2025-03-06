import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import LetterGlitch from './glitch';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Login.css';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  
  const API_URL = 'http://localhost:5000';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const response = await axios.post(`${API_URL}/login`, { 
        email, 
        password 
      });
      
      // Store token and user info in localStorage
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('username', response.data.username);
      localStorage.setItem('email', response.data.email);
      
      // Navigate to dashboard or chat interface
      navigate('/chatlanding');
    } catch (error) {
      if (error.response) {
        // Handle specific error scenarios
        if (error.response.status === 403) {
          // User not verified
          Swal.fire({
            title: 'Email Not Verified',
            text: 'Please verify your email before logging in',
            icon: 'warning',
            confirmButtonText: 'Verify Now'
          }).then(() => {
            // Save email for verification page
            localStorage.setItem('verificationEmail', email);
            navigate('/verify-email');
          });
        } else {
          // Other errors
          setError(error.response.data.message || 'Login failed');
        }
      } else {
        setError('Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
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

      <div className="login-container">
        <div className="login-card">
          <div className="container">
            <div className="row justify-content-center">
              <div className="col-12">
                <h1 className="text-center mb-4">Sign In</h1>
                
                {error && (
                  <div className="alert alert-danger text-center" role="alert">
                    {error}
                  </div>
                )}
                
                <form onSubmit={handleSubmit} className="text-center">
                  <div className="form-group mb-3">
                    <input
                      type="email"
                      className="form-control mx-auto"
                      style={{ maxWidth: '400px' }}
                      id="email"
                      placeholder="Email Address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="form-group mb-3">
                    <input
                      type="password"
                      className="form-control mx-auto"
                      style={{ maxWidth: '400px' }}
                      id="password"
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                  
                  {/* HIGHLY VISIBLE FORGOT PASSWORD LINK */}
                  <div className="text-center mb-4">
                    <Link 
                      to="/forgot-password" 
                      className="btn btn-outline-danger btn-sm"
                      style={{
                        fontSize: '1rem',
                        padding: '0.5rem 1rem',
                        border: '2px solid #ff5555',
                        borderRadius: '8px',
                        backgroundColor: 'rgba(255, 85, 85, 0.1)',
                        color: '#ff5555',
                        fontWeight: 'bold',
                        textDecoration: 'none',
                        display: 'inline-block',
                        marginTop: '10px'
                      }}
                    >
                      Forgot Password?
                    </Link>
                  </div>
                  
                  <button 
                    type="submit" 
                    className="btn btn-primary btn-lg px-5 mx-auto d-block"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Signing In...
                      </>
                    ) : 'Sign In'}
                  </button>
                </form>
                
                <div className="text-center mt-4 form-footer">
                  Don't have an account? <Link to="/register" className="text-decoration-none">Create Account</Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login; 