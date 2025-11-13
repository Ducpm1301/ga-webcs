import React, { useEffect, useState } from 'react';
import { useAuth } from '../auth/AuthProvider';

type PartnerInfo = { id: string; name: string };

interface PartnerSelectProps {
  value?: string;
  onChange?: (value: string) => void;
  className?: string;
}

const PartnerSelect: React.FC<PartnerSelectProps> = ({ value, onChange, className }) => {
  const [partners, setPartners] = useState<PartnerInfo[]>([]);
  const [selected, setSelected] = useState<string>('');
  const { partnersReady, loadingPartners } = useAuth();

  useEffect(() => {
    if (!partnersReady) return; // wait until AuthProvider finishes fetching partners
    try {
      const stored = localStorage.getItem('partners');
      if (stored) {
        const parsed: PartnerInfo[] = JSON.parse(stored);
        setPartners(parsed);
      }
    } catch {
      // ignore
    }
  }, [partnersReady]);

  useEffect(() => {
    if (typeof value === 'string') {
      setSelected(value);
      return;
    }
    const sel = localStorage.getItem('selected_partner');
    if (sel) {
      setSelected(sel);
    } else if (partners.length > 0) {
      setSelected(partners[0].id);
    }
  }, [value, partners]);

  useEffect(() => {
    const handler = (e: Event) => {
      if (typeof value === 'string') return;
      const detail = (e as CustomEvent<{ partner: string }>).detail;
      if (detail?.partner) {
        setSelected(detail.partner);
      }
    };
    window.addEventListener('partner_change', handler as EventListener);
    return () => window.removeEventListener('partner_change', handler as EventListener);
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setSelected(val);
    localStorage.setItem('selected_partner', val);
    onChange?.(val);
    console.log('selected_partner', val);
    // Dispatch a custom event to notify listeners of partner change
    window.dispatchEvent(new CustomEvent('partner_change', { detail: { partner: val } }));
  };

  if (!partnersReady) {
    // Do not render until partners are ready
    return null;
  }

  return (
    <select
      className={className ?? 'select select-bordered w-56'}
      value={selected}
      onChange={handleChange}
      disabled={loadingPartners}
    >
      {partners.length === 0 && <option value="">Không có đối tác</option>}
      {partners.map((p) => (
        <option key={p.id} value={p.id}>{p.name}</option>
      ))}
    </select>
  );
};

export default PartnerSelect;
