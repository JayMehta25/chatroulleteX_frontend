import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import 'bootstrap/dist/css/bootstrap.min.css';

function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { token } = useParams(); // Extract token from URL
  const navigate = useNavigate();
  const API_URL = 'https://chatroulletexbackend-production-adb8.up.railway.app';

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate passwords
    if (!password || !confirmPassword) {
      Swal.fire({
        title: 'Error',
        text: 'Please enter both password fields',
        icon: 'warning'
      });
      return;
    }

    if (password !== confirmPassword) {
      Swal.fire({
        title: 'Error',
        text: 'Passwords do not match',
        icon: 'warning'
      });
      return;
    }

    setLoading(true);

    try {
      // Send request to reset password
      const response = await axios.post(`${API_URL}/reset-password/${token}`, {
        password
      });

      Swal.fire({
        title: 'Success',
        text: 'Password has been successfully reset. Redirecting to login...',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false
      });

      // Redirect to login after success
      setTimeout(() => {
        navigate('/login');
      }, 2000);

    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to reset password';
      
      Swal.fire({
        title: 'Error',
        text: errorMsg,
        icon: 'error'
      });
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
              <h2 className="card-title text-center mb-4">Reset Password</h2>
              
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="password" className="form-label">New Password</label>
                  <input
                    type="password"
                    className="form-control"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter new password"
                    required
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
                  <input
                    type="password"
                    className="form-control"
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
                        Resetting...
                      </>
                    ) : 'Reset Password'}
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

export default ResetPassword;