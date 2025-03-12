import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import 'bootstrap/dist/css/bootstrap.min.css';

function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { token } = useParams();
  const navigate = useNavigate();
  
  const API_URL = 'https://chatroulletexbackend-production-adb8.up.railway.app';
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validate password match
    if (password !== confirmPassword) {
      Swal.fire({
        title: 'Password Mismatch',
        text: 'Password and Confirm Password do not match',
        icon: 'error'
      });
      return;
    }
    
    // Validate password strength
    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await axios.post(`${API_URL}/reset-password/${token}`, { 
        password 
      });
      
      Swal.fire({
        title: 'Success!',
        text: 'Your password has been reset successfully',
        icon: 'success',
        confirmButtonText: 'Login Now'
      }).then(() => {
        navigate('/login');
      });
      
    } catch (error) {
      setError(
        error.response?.data?.message || 
        'Failed to reset password. Token may be invalid or expired.'
      );
      
      Swal.fire({
        title: 'Error',
        text: error.response?.data?.message || 'Failed to reset password',
        icon: 'error'
      });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="container mt-5">
      <style>{`
        /* Custom styles for input fields */
        .custom-input {
          background-color: #000000;
          color: #ffffff;
          border: 1px solid #ffffff;
        }
        
        .custom-input::placeholder {
          color: #cccccc;
        }
        
        .custom-input:focus {
          background-color: #000000;
          color: #ffffff;
          border-color: #2575fc;
          box-shadow: 0 0 0 0.25rem rgba(37, 117, 252, 0.25);
        }
      `}</style>
      
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card">
            <div className="card-body">
              <h2 className="card-title text-center mb-4">Reset Your Password</h2>
              
              {error && (
                <div className="alert alert-danger">{error}</div>
              )}
              
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="password" className="form-label">New Password</label>
                  <input
                    type="password"
                    className="form-control custom-input"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter new password"
                    required
                  />
                </div>
                
                <div className="mb-4">
                  <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
                  <input
                    type="password"
                    className="form-control custom-input"
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
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
                        Resetting Password...
                      </>
                    ) : 'Reset Password'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ResetPassword;