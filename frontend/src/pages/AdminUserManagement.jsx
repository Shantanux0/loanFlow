import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { toast } from 'react-hot-toast';
import { ShieldCheck, ShieldAlert, Loader2 } from 'lucide-react';

const AdminUserManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [verifying, setVerifying] = useState(null);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const { data } = await api.get('/admin/users');
            setUsers(data);
        } catch (error) {
            toast.error("Failed to load users");
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyUser = async (email) => {
        setVerifying(email);
        try {
            await api.patch(`/admin/verify-user/${email}`);
            toast.success(`Verified user ${email}`);
            setUsers(users.map(u => u.email === email ? { ...u, isAccountVerified: true } : u));
        } catch (error) {
            toast.error("Failed to verify user");
        } finally {
            setVerifying(null);
        }
    };

    if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>;

    return (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                    <tr style={{ borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--bg-surface)' }}>
                        <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '500', color: 'var(--text-muted)' }}>Name</th>
                        <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '500', color: 'var(--text-muted)' }}>Email</th>
                        <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '500', color: 'var(--text-muted)' }}>Status</th>
                        <th style={{ padding: '1rem', textAlign: 'right', fontWeight: '500', color: 'var(--text-muted)' }}>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map((user) => (
                        <tr key={user.email} style={{ borderBottom: '1px solid var(--border-color)' }}>
                            <td style={{ padding: '1rem' }}>
                                <div style={{ fontWeight: '500' }}>{user.name}</div>
                            </td>
                            <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>{user.email}</td>
                            <td style={{ padding: '1rem' }}>
                                <div style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '0.4rem',
                                    padding: '0.2rem 0.6rem',
                                    borderRadius: '12px',
                                    backgroundColor: user.isAccountVerified ? 'hsla(150, 60%, 45%, 0.1)' : 'hsla(35, 90%, 50%, 0.1)',
                                    color: user.isAccountVerified ? 'var(--success)' : 'var(--warning)',
                                    fontSize: '0.8rem',
                                    fontWeight: '500'
                                }}>
                                    {user.isAccountVerified ? <ShieldCheck size={14} /> : <ShieldAlert size={14} />}
                                    {user.isAccountVerified ? 'Verified' : 'Unverified'}
                                </div>
                            </td>
                            <td style={{ padding: '1rem', textAlign: 'right' }}>
                                {!user.isAccountVerified && (
                                    <button
                                        className="btn"
                                        style={{
                                            padding: '0.4rem 0.8rem',
                                            fontSize: '0.8rem',
                                            backgroundColor: 'var(--primary)',
                                            color: 'white'
                                        }}
                                        onClick={() => handleVerifyUser(user.email)}
                                        disabled={verifying === user.email}
                                    >
                                        {verifying === user.email ? <Loader2 className="animate-spin" size={14} /> : 'Verify'}
                                    </button>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default AdminUserManagement;
