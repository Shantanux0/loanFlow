import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Loader2, X, ArrowRight } from 'lucide-react';

const ForgotPasswordModal = ({ onClose }) => {
    const [step, setStep] = useState(1); // 1: Email, 2: OTP & New Password
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [timeLeft, setTimeLeft] = useState(300); // 5 minutes

    const { sendResetOtp, resetPassword } = useAuth();

    React.useEffect(() => {
        if (step === 2 && timeLeft > 0) {
            const timerId = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
            return () => clearTimeout(timerId);
        }
    }, [timeLeft, step]);

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    const handleSendOtp = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await sendResetOtp(email);
            setStep(2);
            setTimeLeft(300); // Reset timer when entering step 2
        } catch (e) {
            // handled
        } finally {
            setSubmitting(false);
        }
    };

    const handleResend = async () => {
        if (timeLeft > 0) return;
        setSubmitting(true);
        try {
            await sendResetOtp(email);
            setTimeLeft(300);
        } catch (e) {
            // handled
        } finally {
            setSubmitting(false);
        }
    };

    const handleReset = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await resetPassword(email, otp, newPassword);
            onClose(); // Close modal, user should login
        } catch (e) {
            // handled
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
                <button
                    onClick={onClose}
                    style={{ position: 'absolute', top: '1rem', right: '1rem', color: 'var(--text-muted)' }}
                >
                    <X size={20} />
                </button>

                <h2 style={{ marginBottom: '0.5rem', fontSize: '1.5rem' }} className="title-gradient">Reset Password</h2>

                {step === 1 ? (
                    <>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                            Enter your email to receive a password reset OTP.
                        </p>
                        <form onSubmit={handleSendOtp}>
                            <div className="input-group">
                                <label className="input-label">Email Address</label>
                                <input
                                    type="email"
                                    className="input-field"
                                    placeholder="you@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                            <button
                                type="submit"
                                className="btn btn-primary"
                                style={{ width: '100%', marginTop: '1rem' }}
                                disabled={submitting}
                            >
                                {submitting ? <Loader2 className="animate-spin" /> : 'Send OTP'}
                            </button>
                        </form>
                    </>
                ) : (
                    <>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                            Enter the OTP sent to <strong>{email}</strong> and your new password.
                        </p>
                        <form onSubmit={handleReset}>
                            <div className="input-group">
                                <label className="input-label">OTP</label>
                                <input
                                    type="text"
                                    className="input-field"
                                    placeholder="Enter OTP"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="input-group">
                                <label className="input-label">New Password</label>
                                <input
                                    type="password"
                                    className="input-field"
                                    placeholder="••••••••"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
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
                                {submitting ? <Loader2 className="animate-spin" /> : 'Reset Password'}
                            </button>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
};

export default ForgotPasswordModal;
