import React, { useEffect, useState } from 'react';
import { useAuth } from '../auth/AuthProvider';
import PartnerSelect from './PartnerSelect';

interface PartnerGateProps {
  children: React.ReactNode;
}

const PartnerGate: React.FC<PartnerGateProps> = ({ children }) => {
  const [needsSelection, setNeedsSelection] = useState(false);
  const [ready, setReady] = useState(false);
  const { partnersReady, loadingPartners } = useAuth();

  useEffect(() => {
    if (!partnersReady) return; // wait until partners are loaded
    const sel = localStorage.getItem('selected_partner');
    if (!sel) {
      setNeedsSelection(true);
    } else {
      setNeedsSelection(false);
    }
    setReady(true);
  }, [partnersReady]);

  const handleConfirm = () => {
    const sel = localStorage.getItem('selected_partner');
    if (sel && sel.length > 0) {
      setNeedsSelection(false);
    }
  };

  if (loadingPartners) {
    // optional: show a lightweight placeholder while fetching partners
    return <div className="p-4 text-center">Đang tải danh sách đối tác…</div>;
  }

  if (!ready) return null;

  // If selection is needed, show modal and block children render as requested
  if (needsSelection) {
    return (
      <div className="relative">
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg">Chọn đối tác</h3>
            <p className="py-4">Vui lòng chọn đối tác để tiếp tục xem Dashboard.</p>
            <div className="py-2">
              <PartnerSelect />
            </div>
            <div className="modal-action">
              <button className="btn btn-primary" onClick={handleConfirm}>Xác nhận</button>
            </div>
          </div>
          <div className="modal-backdrop blur" />
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default PartnerGate;
