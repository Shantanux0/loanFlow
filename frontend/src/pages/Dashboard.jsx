import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { Shield, CreditCard, PieChart, Activity, Plus } from 'lucide-react';
import { getMyLoans as getMyApplications, getMyActiveLoans } from '../api/loanService';
import ApplyLoanModal from '../components/ApplyLoanModal';
import LoanStatusList from '../components/LoanStatusList';
import { toast } from 'react-hot-toast';

const Dashboard = () => {
    const { user } = useAuth();
    const [applications, setApplications] = useState([]);
    const [activeLoans, setActiveLoans] = useState([]);
    const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            const [appsData, loansData] = await Promise.all([
                getMyApplications(),
                getMyActiveLoans() // This might fail if endpoint not ready, but we handle error
            ]);
            setApplications(Array.isArray(appsData) ? appsData : []);
            setActiveLoans(Array.isArray(loansData) ? loansData : []);
        } catch (error) {
            console.error("Failed to fetch loan data", error);
            // toast.error("Could not load loan data");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const totalActiveAmount = Array.isArray(activeLoans) ? activeLoans.reduce((sum, loan) => sum + (loan.status === 'ACTIVE' ? loan.principalAmount : 0), 0) : 0;
    // Placeholder for monthly repayment calculation
    const monthlyRepayment = (Array.isArray(activeLoans) && activeLoans.length > 0) ? 840 : 0;

    return (
        <div className="container">
            <div style={{ marginBottom: '2rem' }}>
                <h1 className="title-gradient" style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>
                    Hello, {user?.name?.split(' ')[0] || 'User'}
                </h1>
                <p style={{ color: 'var(--text-muted)' }}>Here's what's happening with your loans today.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
                <div className="card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                        <div style={{ padding: '0.75rem', borderRadius: '12px', backgroundColor: 'hsla(220, 90%, 60%, 0.1)', color: 'var(--primary)' }}>
                            <CreditCard size={24} />
                        </div>
                        <span style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>${totalActiveAmount.toLocaleString()}</span>
                    </div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Total Active Loans</div>
                </div>

                <div className="card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                        <div style={{ padding: '0.75rem', borderRadius: '12px', backgroundColor: 'hsla(150, 60%, 45%, 0.1)', color: 'var(--success)' }}>
                            <PieChart size={24} />
                        </div>
                        <span style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>${monthlyRepayment}</span>
                    </div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Monthly Repayment</div>
                </div>

                <div className="card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                        <div style={{ padding: '0.75rem', borderRadius: '12px', backgroundColor: 'hsla(35, 90%, 50%, 0.1)', color: 'var(--warning)' }}>
                            <Activity size={24} />
                        </div>
                        <span style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Good</span>
                    </div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Credit Score</div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
                <div className="card">
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                        <h2 style={{ fontSize: '1.25rem' }}>Recent Applications</h2>
                        <button className="btn btn-sm btn-outline" onClick={fetchData}>Refresh</button>
                    </div>

                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '2rem' }}>Loading...</div>
                    ) : (
                        <LoanStatusList applications={applications} />
                    )}
                </div>

                <div className="card" style={{ height: 'fit-content' }}>
                    <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>Quick Actions</h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <button
                            className="btn btn-primary"
                            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                            onClick={() => setIsApplyModalOpen(true)}
                        >
                            <Plus size={18} /> Apply for Loan
                        </button>
                        <button className="btn btn-outline" style={{ width: '100%' }}>View Documents</button>
                    </div>
                </div>
            </div>

            <ApplyLoanModal
                isOpen={isApplyModalOpen}
                onClose={() => setIsApplyModalOpen(false)}
                onSuccess={fetchData}
            />
        </div>
    );
};

export default Dashboard;
