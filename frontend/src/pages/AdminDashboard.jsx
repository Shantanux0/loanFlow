import React, { useState } from 'react';
import AdminUserManagement from './AdminUserManagement'; // We will refactor current content into this if needed, or just inline for now.
import AdminLoanManagement from './AdminLoanManagement';
import { Users, FileText } from 'lucide-react';


const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState('loans'); // Default to loans for now

    const TabButton = ({ id, label, icon }) => (
        <button
            onClick={() => setActiveTab(id)}
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1.5rem',
                border: 'none',
                background: 'transparent',
                borderBottom: activeTab === id ? '2px solid var(--primary)' : '2px solid transparent',
                color: activeTab === id ? 'var(--primary)' : 'var(--text-muted)',
                fontWeight: activeTab === id ? '600' : '400',
                cursor: 'pointer',
                transition: 'all 0.2s'
            }}
        >
            {icon}
            {label}
        </button>
    );

    return (
        <div className="container">
            <div style={{ marginBottom: '2rem' }}>
                <h1 className="title-gradient" style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Admin Dashboard</h1>
                <p style={{ color: 'var(--text-muted)' }}>Manage system resources and requests.</p>
            </div>

            <div style={{ borderBottom: '1px solid var(--border-color)', marginBottom: '2rem', display: 'flex' }}>
                <TabButton id="users" label="User Management" icon={<Users size={18} />} />
                <TabButton id="loans" label="Loan Management" icon={<FileText size={18} />} />
            </div>

            <div className="animate-fade-in">
                {activeTab === 'users' ? <AdminUserManagement /> : <AdminLoanManagement />}
            </div>
        </div>
    );
};

export default AdminDashboard;
