import React, { useState } from 'react';
import { useAuth } from '../auth/AuthProvider';
import PartnerSelect from '../partners/PartnerSelect';
import { Bell, LogOut } from 'lucide-react';

const Navbar: React.FC = () => {
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const { user, logout, partnersReady, loadingPartners } = useAuth();

    return (
        <div className="navbar w-full bg-white shadow">
            <div className="navbar-start">
                <label htmlFor="my-drawer-4" aria-label="open sidebar" className="btn btn-square btn-ghost">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" strokeLinejoin="round" strokeLinecap="round" strokeWidth="2" fill="none" stroke="currentColor" className="my-1.5 inline-block size-4"><path d="M4 4m0 2a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2z"></path><path d="M9 4v16"></path><path d="M14 10l2 2l-2 2"></path></svg>
                </label>
                <div className="text-xl px-4">WebCS</div>
            </div>
            <div className="navbar-center">
                {/* Partner selector moved from StatisticPage */}
                
            </div>
            <div className="navbar-end gap-5">
                {partnersReady ? (
                    <PartnerSelect className="select select-bordered w-64" />
                ) : (
                    <span className="text-sm opacity-70">
                        {loadingPartners ? 'Đang tải đối tác…' : ''}
                    </span>
                )}
                <button className="btn btn-ghost! border-gray-500">
                    <div className="indicator">
                        <Bell />
                        <span className="badge badge-xs badge-primary indicator-item"></span>
                    </div>
                </button>
                <button className="btn btn-ghost border-gray-500" onClick={logout}><LogOut /></button>
            </div>
        </div>
    );
};

export default Navbar;
