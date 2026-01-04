import React from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, User, Shield, LayoutDashboard } from 'lucide-react';

const Layout = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const isActive = (path) => location.pathname === path;

    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <nav style={{
                borderBottom: '1px solid var(--border-color)',
                padding: '1rem 0',
                backgroundColor: 'rgba(13, 22, 35, 0.8)', // Semi-transparent var(--bg-page)
                backdropFilter: 'blur(10px)',
                position: 'sticky',
                top: 0,
                zIndex: 100
            }}>
                <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{
                            width: '32px',
                            height: '32px',
                            background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-light) 100%)',
                            borderRadius: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontWeight: 'bold'
                        }}>
                            L
                        </div>
                        <span style={{ fontSize: '1.25rem', fontWeight: 'bold' }} className="title-gradient">LoanFlow</span>
                    </Link>

                    <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                        {user ? (
                            <>
                                {user.role === 'ADMIN' ? (
                                    <Link
                                        to="/management/dashboard"
                                        style={{
                                            color: isActive('/management/dashboard') ? 'var(--primary)' : 'var(--text-muted)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.5rem',
                                            transition: 'color 0.2s'
                                        }}
                                    >
                                        <Shield size={18} />
                                        Admin Dashboard
                                    </Link>
                                ) : (
                                    <Link
                                        to="/"
                                        style={{
                                            color: isActive('/') ? 'var(--primary)' : 'var(--text-muted)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.5rem',
                                            transition: 'color 0.2s'
                                        }}
                                    >
                                        <LayoutDashboard size={18} />
                                        Dashboard
                                    </Link>
                                )}

                                <div style={{
                                    width: '1px',
                                    height: '24px',
                                    backgroundColor: 'var(--border-color)'
                                }} />

                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <Link
                                        to="/profile"
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.5rem',
                                            color: 'var(--text-main)'
                                        }}
                                    >
                                        <div style={{
                                            width: '32px',
                                            height: '32px',
                                            borderRadius: '50%',
                                            backgroundColor: 'var(--bg-surface)',
                                            border: '1px solid var(--border-color)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}>
                                            <User size={16} />
                                        </div>
                                        <span style={{ fontSize: '0.9rem' }}>{user.name}</span>
                                    </Link>

                                    <button
                                        onClick={handleLogout}
                                        title="Logout"
                                        style={{
                                            color: 'var(--text-muted)',
                                            padding: '0.5rem',
                                            borderRadius: 'var(--radius-sm)',
                                            transition: 'all 0.2s'
                                        }}
                                        onMouseOver={(e) => { e.currentTarget.style.color = 'var(--error)'; e.currentTarget.style.backgroundColor = 'rgba(255, 50, 50, 0.1)'; }}
                                        onMouseOut={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.backgroundColor = 'transparent'; }}
                                    >
                                        <LogOut size={20} />
                                    </button>
                                </div>
                            </>
                        ) : (
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <Link to="/login" className="btn btn-outline" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}>
                                    Log In
                                </Link>
                                <Link to="/register" className="btn btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}>
                                    Sign Up
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </nav>

            <main style={{ flex: 1, padding: '2rem 0' }}>
                <Outlet />
            </main>
        </div>
    );
};

export default Layout;
