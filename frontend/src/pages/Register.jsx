import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, User, ArrowRight, Loader2 } from 'lucide-react';
import VerifyEmailModal from '../components/VerifyEmailModal';

const Register = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showVerifyModal, setShowVerifyModal] = useState(false);

    const { register, sendVerifyOtp } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            // 1. Try to Register
            await register(name, email, password);

            // 2. If successful, send OTP
            await sendVerifyOtp(email);
            setShowVerifyModal(true);

        } catch (error) {
            // Check if error is "Email already exists" (409)
            if (error.response && error.response.status === 409) {
                try {
                    // 3. Try sending OTP anyway (Handling Unverified User Case)
                    await sendVerifyOtp(email);
                    // If successful, it means user was unverified. Show modal.
                    setShowVerifyModal(true);
                    return; // Stop here, don't show error
                } catch (otpError) {
                    // If this fails (e.g. 409 Conflict from sendOtp), it means user is ALREADY VERIFIED.
                    // Fallthrough to show original registration error
                }
            }
            // Handled in context (toast)
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleModalClose = () => {
        setShowVerifyModal(false);
        // Whether verified or just closed, user is logged in, so go to Dashboard
        navigate('/');
    };

    return (
        <div className="container flex-center" style={{ minHeight: '80vh' }}>
            {showVerifyModal && <VerifyEmailModal onClose={handleModalClose} email={email} />}

            <div className="card" style={{ width: '100%', maxWidth: '450px' }}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <h1 className="title-gradient" style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Create Account</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Join LoanFlow for smarter financial management</p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label className="input-label">Full Name</label>
                        <div style={{ position: 'relative' }}>
                            <User size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                            <input
                                type="text"
                                className="input-field"
                                style={{ paddingLeft: '2.5rem', width: '100%' }}
                                placeholder="John Doe"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div className="input-group">
                        <label className="input-label">Email Address</label>
                        <div style={{ position: 'relative' }}>
                            <Mail size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                            <input
                                type="email"
                                className="input-field"
                                style={{ paddingLeft: '2.5rem', width: '100%' }}
                                placeholder="you@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div className="input-group">
                        <label className="input-label">Password</label>
                        <div style={{ position: 'relative' }}>
                            <Lock size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                            <input
                                type="password"
                                className="input-field"
                                style={{ paddingLeft: '2.5rem', width: '100%' }}
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary"
                        style={{ width: '100%', marginTop: '1rem' }}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : 'Create Account'}
                        {!isSubmitting && <ArrowRight size={18} />}
                    </button>
                </form>

                <div style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                    Already have an account? <Link to="/login" style={{ color: 'var(--primary)', fontWeight: '500' }}>Log in</Link>
                </div>
            </div>
        </div>
    );
};

export default Register;
