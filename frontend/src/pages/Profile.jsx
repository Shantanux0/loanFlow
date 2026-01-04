import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Mail, ShieldCheck, ShieldAlert, Loader2 } from 'lucide-react';
import VerifyEmailModal from '../components/VerifyEmailModal';

const Profile = () => {
    const { user, sendVerifyOtp } = useAuth();
    const [showVerifyModal, setShowVerifyModal] = useState(false);
    const [sendingOtp, setSendingOtp] = useState(false);

    const handleVerifyClick = async () => {
        setSendingOtp(true);
        try {
            await sendVerifyOtp(user.email);
            setShowVerifyModal(true);
        } catch (e) {
            // error handled in context
        } finally {
            setSendingOtp(false);
        }
    };

    return (
        <div className="container" style={{ maxWidth: '800px' }}>
            {showVerifyModal && <VerifyEmailModal onClose={() => setShowVerifyModal(false)} email={user.email} />}

            <h1 className="title-gradient" style={{ fontSize: '2rem', marginBottom: '2rem' }}>My Profile</h1>

            <div className="card">
                <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', marginBottom: '3rem', flexDirection: 'column', textAlign: 'center' }}>
                    <div style={{
                        width: '120px',
                        height: '120px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, var(--bg-surface) 0%, var(--bg-card) 100%)',
                        border: '2px solid var(--border-color)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '3rem',
                        color: 'var(--text-muted)'
                    }}>
                        {user.name.charAt(0)}
                    </div>
                    <div>
                        <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{user.name}</h2>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', justifyContent: 'center' }}>
                            <div style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                padding: '0.25rem 0.75rem',
                                borderRadius: '20px',
                                backgroundColor: user.isAccountVerified ? 'hsla(150, 60%, 45%, 0.1)' : 'hsla(35, 90%, 50%, 0.1)',
                                color: user.isAccountVerified ? 'var(--success)' : 'var(--warning)',
                                fontSize: '0.85rem',
                                fontWeight: '500'
                            }}>
                                {user.isAccountVerified ? <ShieldCheck size={14} /> : <ShieldAlert size={14} />}
                                {user.isAccountVerified ? 'Verified Account' : 'Unverified Account'}
                            </div>

                            {!user.isAccountVerified && (
                                <button
                                    className="btn btn-outline"
                                    style={{ padding: '0.25rem 0.75rem', fontSize: '0.8rem' }}
                                    onClick={handleVerifyClick}
                                    disabled={sendingOtp}
                                >
                                    {sendingOtp ? <Loader2 className="animate-spin" size={14} /> : 'Verify Now'}
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                <div style={{ display: 'grid', gap: '1.5rem' }}>
                    <div className="input-group">
                        <label className="input-label">Full Name</label>
                        <div style={{ position: 'relative' }}>
                            <User size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                            <input
                                type="text"
                                className="input-field"
                                style={{ paddingLeft: '2.5rem', width: '100%', opacity: 0.7 }}
                                value={user.name}
                                readOnly
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
                                style={{ paddingLeft: '2.5rem', width: '100%', opacity: 0.7 }}
                                value={user.email}
                                readOnly
                            />
                        </div>
                    </div>
                </div>

                <div style={{ marginTop: '2rem', paddingTop: '2rem', borderTop: '1px solid var(--border-color)' }}>
                    <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>Account Security</h3>
                    <button className="btn btn-outline">Change Password</button>
                </div>
            </div>
        </div>
    );
};

export default Profile;
