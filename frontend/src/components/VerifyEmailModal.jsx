import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Loader2, X } from 'lucide-react';

const VerifyEmailModal = ({ onClose, email, mandatory = false }) => {
    const [otp, setOtp] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
    const { verifyEmail, sendVerifyOtp } = useAuth();

    React.useEffect(() => {
        if (timeLeft > 0) {
            const timerId = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
            return () => clearTimeout(timerId);
        }
    }, [timeLeft]);

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    const handleResend = async () => {
        if (timeLeft > 0) return;
        setSubmitting(true);
        try {
            await sendVerifyOtp(email);
            setTimeLeft(300);
        } catch (e) {
            // handled
        } finally {
            setSubmitting(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await verifyEmail(email, otp);
            onClose();
        } catch (e) {
            // handled in context
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.7)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 1000, backdropFilter: 'blur(4px)'
        }}>
            <div className="card" style={{ width: '90%', maxWidth: '400px', position: 'relative' }}>
                {!mandatory && (
                    <button
                        onClick={onClose}
                        style={{ position: 'absolute', top: '1rem', right: '1rem', color: 'var(--text-muted)' }}
                    >
                        <X size={20} />
                    </button>
                )}

                <h2 style={{ marginBottom: '1rem', fontSize: '1.5rem' }} className="title-gradient">Verify Email</h2>
                <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                    Please enter the OTP sent to your email address.
                </p>

                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label className="input-label">One-Time Password (OTP)</label>
                        <input
                            type="text"
                            className="input-field"
                            placeholder="Enter OTP"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            required
                        />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', fontSize: '0.9rem' }}>
                        <span style={{ color: 'var(--text-muted)' }}>
                            Expires in: <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>{formatTime(timeLeft)}</span>
                        </span>
                        <button
                            type="button"
                            onClick={handleResend}
                            disabled={timeLeft > 0 || submitting}
                            style={{
                                color: timeLeft > 0 ? 'var(--text-muted)' : 'var(--primary)',
                                fontWeight: 500,
                                cursor: timeLeft > 0 ? 'not-allowed' : 'pointer'
                            }}
                        >
                            Resend OTP
                        </button>
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary"
                        style={{ width: '100%' }}
                        disabled={submitting}
                    >
                        {submitting ? <Loader2 className="animate-spin" /> : 'Verify Account'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default VerifyEmailModal;
