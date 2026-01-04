import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { applyLoan as applyForLoan } from '../api/loanService';
import { Loader2, X } from 'lucide-react';

const ApplyLoanModal = ({ isOpen, onClose, onSuccess }) => {
    const [amount, setAmount] = useState('');
    const [tenure, setTenure] = useState('');
    const [loanType, setLoanType] = useState('PERSONAL');
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (parseFloat(amount) < 1000) {
            toast.error("Minimum loan amount is $1,000");
            return;
        }
        if (parseInt(tenure) < 3) {
            toast.error("Minimum tenure is 3 months");
            return;
        }

        setLoading(true);
        try {
            // Updated to match DTO: { loanType, principalAmount, interestRate, tenureMonths }
            await applyForLoan({
                loanType,
                principalAmount: parseFloat(amount),
                interestRate: 10.5, // Hardcoded for now, or dynamic based on type
                tenureMonths: parseInt(tenure)
            });
            toast.success("Loan application submitted successfully!");
            onSuccess();
            onClose();
            setAmount('');
            setTenure('');
            setLoanType('PERSONAL');
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to submit application");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content animate-slide-up" style={{ maxWidth: '400px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>Apply for a Loan</h2>
                    <button onClick={onClose} className="btn-icon">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div className="form-group">
                        <label className="form-label">Loan Type</label>
                        <select
                            className="input-field"
                            value={loanType}
                            onChange={(e) => setLoanType(e.target.value)}
                        >
                            <option value="PERSONAL">Personal Loan</option>
                            <option value="HOME">Home Loan</option>
                            <option value="EDUCATION">Education Loan</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Loan Amount ($)</label>
                        <input
                            type="number"
                            className="input-field"
                            placeholder="e.g. 5000"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Tenure (Months)</label>
                        <input
                            type="number"
                            className="input-field"
                            placeholder="e.g. 12"
                            value={tenure}
                            onChange={(e) => setTenure(e.target.value)}
                            required
                        />
                    </div>

                    <div style={{ padding: '0.75rem', borderRadius: '8px', backgroundColor: 'var(--bg-surface)', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        <p>Interest Rate: <strong>10.5% p.a.</strong></p>
                        {amount && tenure && (
                            <p style={{ marginTop: '0.25rem' }}>
                                Estimated Monthly EMI: <strong>${Math.round((amount * (1 + 0.105 * (tenure / 12))) / tenure)}</strong>
                            </p>
                        )}
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={loading}
                        style={{ marginTop: '0.5rem' }}
                    >
                        {loading ? <Loader2 className="animate-spin" size={18} /> : 'Submit Application'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ApplyLoanModal;
