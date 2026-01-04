import React, { useEffect, useState } from 'react';
import { getAllApplications, approveLoan, rejectLoan } from '../api/loanService';
import { toast } from 'react-hot-toast';
import { Check, X, Clock, Loader2 } from 'lucide-react';

const AdminLoanManagement = () => {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const data = await getAllApplications();
            // Sort: Pending first, then by date
            const sorted = data.sort((a, b) => {
                if (a.status === 'PENDING' && b.status !== 'PENDING') return -1;
                if (a.status !== 'PENDING' && b.status === 'PENDING') return 1;
                return new Date(b.createdAt) - new Date(a.createdAt);
            });
            setApplications(sorted);
        } catch (error) {
            toast.error("Failed to load loan applications");
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (id) => {
        if (!confirm("Are you sure you want to approve this loan?")) return;
        setProcessingId(id);
        try {
            await approveLoan(id);
            toast.success("Loan approved successfully");
            fetchData();
        } catch (error) {
            toast.error("Failed to approve loan");
        } finally {
            setProcessingId(null);
        }
    };

    const handleReject = async (id) => {
        if (!confirm("Are you sure you want to reject this loan?")) return;
        setProcessingId(id);
        try {
            await rejectLoan(id);
            toast.success("Loan rejected");
            fetchData();
        } catch (error) {
            toast.error("Failed to reject loan");
        } finally {
            setProcessingId(null);
        }
    };

    if (loading) return <div className="flex-center" style={{ padding: '2rem' }}>Loading...</div>;

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Loan Applications</h2>
                <button className="btn btn-outline btn-sm" onClick={fetchData}>Refresh</button>
            </div>

            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--bg-surface)' }}>
                            <th style={{ padding: '1rem', textAlign: 'left', color: 'var(--text-muted)' }}>User ID</th>
                            <th style={{ padding: '1rem', textAlign: 'left', color: 'var(--text-muted)' }}>Amount</th>
                            <th style={{ padding: '1rem', textAlign: 'left', color: 'var(--text-muted)' }}>Tenure</th>
                            <th style={{ padding: '1rem', textAlign: 'left', color: 'var(--text-muted)' }}>Status</th>
                            <th style={{ padding: '1rem', textAlign: 'right', color: 'var(--text-muted)' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {applications.map((app) => (
                            <tr key={app.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                <td style={{ padding: '1rem', fontSize: '0.85rem' }}>{app.userId}</td>
                                <td style={{ padding: '1rem', fontWeight: '500' }}>${app.principalAmount.toLocaleString()}</td>
                                <td style={{ padding: '1rem' }}>{app.tenureMonths} months</td>
                                <td style={{ padding: '1rem' }}>
                                    <span style={{
                                        display: 'inline-block',
                                        padding: '0.25rem 0.6rem',
                                        borderRadius: '12px',
                                        fontSize: '0.75rem',
                                        fontWeight: '600',
                                        backgroundColor: app.status === 'PENDING' ? 'hsla(35, 90%, 50%, 0.1)' :
                                            app.status === 'APPROVED' ? 'hsla(150, 60%, 45%, 0.1)' :
                                                'hsla(0, 70%, 50%, 0.1)',
                                        color: app.status === 'PENDING' ? 'var(--warning)' :
                                            app.status === 'APPROVED' ? 'var(--success)' :
                                                '#ef4444'
                                    }}>
                                        {app.status}
                                    </span>
                                </td>
                                <td style={{ padding: '1rem', textAlign: 'right' }}>
                                    {app.status === 'PENDING' && (
                                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                                            <button
                                                className="btn-icon"
                                                style={{ color: 'var(--success)', backgroundColor: 'hsla(150, 60%, 45%, 0.1)' }}
                                                onClick={() => handleApprove(app.id)}
                                                disabled={processingId === app.id}
                                            >
                                                {processingId === app.id ? <Loader2 className="animate-spin" size={16} /> : <Check size={16} />}
                                            </button>
                                            <button
                                                className="btn-icon"
                                                style={{ color: '#ef4444', backgroundColor: 'hsla(0, 70%, 50%, 0.1)' }}
                                                onClick={() => handleReject(app.id)}
                                                disabled={processingId === app.id}
                                            >
                                                {processingId === app.id ? <Loader2 className="animate-spin" size={16} /> : <X size={16} />}
                                            </button>
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ))}
                        {applications.length === 0 && (
                            <tr>
                                <td colSpan="5" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                                    No applications found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminLoanManagement;
