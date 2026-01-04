import api from './axios';

export const applyLoan = async (loanData) => {
    // Expected loanData: { loanType, principalAmount, interestRate, tenureMonths }
    const response = await api.post('/loans/apply', loanData);
    return response.data;
};

export const getMyLoans = async () => {
    const response = await api.get('/loans/my');
    return response.data;
};

export const getLoanById = async (loanId) => {
    const response = await api.get(`/loans/${loanId}`);
    return response.data;
};

export const repayLoan = async (loanId, amount) => {
    const response = await api.post(`/loans/${loanId}/repay`, { amount });
    return response.data;
};

// Admin
export const getAllApplications = async () => {
    const response = await api.get('/admin/loans');
    return response.data;
};

export const approveLoan = async (loanId) => {
    const response = await api.put(`/admin/loans/${loanId}/approve`);
    return response.data;
};

export const rejectLoan = async (loanId) => {
    const response = await api.put(`/admin/loans/${loanId}/reject`);
    return response.data;
};

// Compatibility wrappers if needed by existing code, 
// though we should try to switch to the above naming if possible.
export const getMyApplications = getMyLoans;
export const getMyActiveLoans = async () => {
    const loans = await getMyLoans();
    if (Array.isArray(loans)) {
        return loans.filter(l => l.status === 'ACTIVE' || l.status === 'APPROVED');
    }
    return [];
};
