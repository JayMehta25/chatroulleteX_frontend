import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import 'bootstrap/dist/css/bootstrap.min.css';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  
  const API_URL = 'http://localhost:5000';
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email) {
      Swal.fire({
        title: 'Error',
        text: 'Please enter your email address',
        icon: 'warning'
      });
      return;
    }
    
    setLoading(true);
    setMessage('');
    
    try {
      const response = await axios.post(`${API_URL}/forgot-password`, { email });
      
      Swal.fire({
        title: 'Success',
        text: 'Password reset link has been sent to your email',
        icon: 'success'
      });
      
      setMessage('Password reset link sent! Check your email.');
      setEmail('');
      
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to send reset link';
      
      Swal.fire({
        title: 'Error',
        text: errorMsg,
        icon: 'error'
      });
      
      setMessage(errorMsg);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card">
            <div className="card-body">
              <h2 className="card-title text-center mb-4">Forgot Password</h2>
              
              {message && (
                <div className={`alert ${message.includes('sent') ? 'alert-success' : 'alert-danger'}`}>
                  {message}
                </div>
              )}
              
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="email" className="form-label">Email Address</label>
                  <input
                    type="email"
                    className="form-control"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your registered email"
                    required
                  />
                </div>
                
                <div className="d-grid">
                  <button 
                    type="submit" 
                    className="btn btn-primary"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Sending...
                      </>
                    ) : 'Send Reset Link'}
                  </button>
                </div>
              </form>
              
              <div className="text-center mt-3">
                <Link to="/login">Back to Login</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword; 