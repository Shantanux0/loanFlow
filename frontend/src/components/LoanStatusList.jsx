import React from 'react';
import { Clock, CheckCircle, XCircle } from 'lucide-react';

const LoanStatusList = ({ applications }) => {
    if (!applications || !Array.isArray(applications) || applications.length === 0) {
        return (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', backgroundColor: 'var(--bg-surface)', borderRadius: 'var(--radius-md)' }}>
                No loan applications found.
            </div>
        );
    }

    const getStatusBadge = (status) => {
        const styles = {
            PENDING: { bg: 'hsla(35, 90%, 50%, 0.1)', color: 'var(--warning)', icon: <Clock size={14} /> },
            APPROVED: { bg: 'hsla(150, 60%, 45%, 0.1)', color: 'var(--success)', icon: <CheckCircle size={14} /> },
            REJECTED: { bg: 'hsla(0, 70%, 50%, 0.1)', color: '#ef4444', icon: <XCircle size={14} /> },
            ACTIVE: { bg: 'hsla(220, 90%, 60%, 0.1)', color: 'var(--primary)', icon: <CheckCircle size={14} /> },
        };
        const style = styles[status] || styles.PENDING;

        return (
            <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.25rem 0.6rem',
                borderRadius: '12px',
                backgroundColor: style.bg,
                color: style.color,
                fontSize: '0.75rem',
                fontWeight: '600'
            }}>
                {style.icon}
                {status}
            </div>
        );
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {applications.map((app) => (
                <div key={app.id} style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '1rem',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--bg-surface)',
                    border: '1px solid var(--border-color)'
                }}>
                    <div>
                        <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>
                            ${app.principalAmount.toLocaleString()} Loan ({app.loanType})
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            {app.tenureMonths} months • Applied on {new Date(app.createdAt).toLocaleDateString()}
                        </div>
                    </div>
                    <div>
                        {getStatusBadge(app.status)}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default LoanStatusList;
