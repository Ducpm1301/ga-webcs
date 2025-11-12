import React, { useState } from 'react';
import { useAuth } from '../auth/AuthProvider';
import PartnerSelect from '../partners/PartnerSelect';

const Navbar: React.FC = () => {
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const { user, logout, partnersReady, loadingPartners } = useAuth();

    return (
        <div className="navbar bg-base-100 shadow-sm">
            <div className="navbar-start">
                <label htmlFor="my-drawer-1" className="btn btn-ghost btn-circle drawer-button">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"> <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h7" /> </svg>
                </label>
                <a className="btn btn-ghost text-xl">WebCS</a>
            </div>
            <div className="navbar-center">
                {/* Partner selector moved from StatisticPage */}
                {partnersReady ? (
                    <PartnerSelect className="select select-bordered w-64" />
                ) : (
                    <span className="text-sm opacity-70">
                        {loadingPartners ? 'Đang tải đối tác…' : ''}
                    </span>
                )}
            </div>
            <div className="navbar-end gap-2">
                <button className="btn btn-ghost! btn-circle">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"> <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /> </svg>
                </button>
                <button className="btn btn-ghost! btn-circle">
                    <div className="indicator">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"> <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /> </svg>
                        <span className="badge badge-xs badge-primary indicator-item"></span>
                    </div>
                </button>
                <div className="dropdown dropdown-end">
                    <div
                        tabIndex={0}
                        role="button"
                        className="avatar"
                        onClick={() => setIsProfileOpen((prev) => !prev)}
                    >
                        <div className="w-12 rounded-full">
                            <img src="https://img.daisyui.com/images/profile/demo/yellingcat@192.webp" />
                        </div>
                    </div>
                    {isProfileOpen && (
                        <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-56">
                            <li className="menu-title">
                                <span>User</span>
                            </li>
                            <li>
                                <div className="flex flex-col px-2 py-1">
                                    <span className="text-sm">{user?.email ?? 'Unknown user'}</span>
                                </div>
                            </li>
                            <li>
                                <button className="btn btn-ghost" onClick={logout}>Logout</button>
                            </li>
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Navbar;
