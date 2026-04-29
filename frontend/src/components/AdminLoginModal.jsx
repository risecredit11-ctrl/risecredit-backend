import React, { useState } from 'react';
import './AdminLoginModal.css';

function AdminLoginModal({ isOpen, onClose, onVerify }) {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password) return;
    
    setLoading(true);
    setError(false);
    
    const success = await onVerify(password);
    
    if (!success) {
      setError(true);
      // Reset shake animation
      setTimeout(() => setError(false), 500);
    }
    
    setLoading(false);
  };

  return (
    <div className="admin-modal-overlay">
      <div className={`admin-modal-content ${error ? 'shake' : ''}`}>
        <button className="admin-modal-close" onClick={onClose}>&times;</button>
        
        <div className="admin-modal-header">
          <div className="admin-modal-icon">🔐</div>
          <h2>Admin Access</h2>
          <p>Please enter your administrative password to proceed.</p>
        </div>

        <form onSubmit={handleSubmit} className="admin-modal-form">
          <div className="admin-modal-input-group">
            <input
              type="password"
              placeholder="Enter Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoFocus
              required
            />
          </div>
          
          <button type="submit" className={`btn btn-primary admin-modal-submit ${loading ? 'loading' : ''}`} disabled={loading}>
            {loading ? 'Verifying...' : 'Access Dashboard'}
          </button>
          
          {error && <p className="admin-modal-error">Access Denied. Please try again.</p>}
        </form>
      </div>
    </div>
  );
}

export default AdminLoginModal;
