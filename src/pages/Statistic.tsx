import React, { useEffect, useState } from 'react';
import axiosInstance from '../services/axiosConfig';
import { apiRoutes } from '../services/apiRoutes';

type PartnerInfo = { id: string; name: string };

type ApiResponse<T> = {
  status: string;
  table: string;
  count: number;
  next: boolean;
  data: T[];
};

type PXTKRecord = {
  thongtincoban_ngay?: string;
  thongtincoban_truongca?: string;
  thongtincoban_thoigiansanxuat_gio?: number;
  thongtincoban_thoigiansanxuat_sonhanvien?: number;
  [key: string]: unknown;
};

type PXLGRecord = {
  thongtincoban_ngay?: string;
  thongtincoban_truongca?: string;
  thongtincoban_thoigiansanxuat_gio?: number;
  [key: string]: unknown;
};

type PXLTRecord = {
  thongtincoban_ngay?: string;
  thongtincoban_truongca?: string;
  thongtincoban_thoigiansanxuat_gio?: number;
  [key: string]: unknown;
};

const formatDateInput = (date: Date) => date.toISOString().slice(0, 10);

const StatisticPage: React.FC = () => {
  const [partners, setPartners] = useState<PartnerInfo[]>([]);
  const [selectedPartner, setSelectedPartner] = useState<string>('');
  const [startDate, setStartDate] = useState<string>(formatDateInput(new Date()));
  const [endDate, setEndDate] = useState<string>(formatDateInput(new Date()));

  const [pxtk, setPxtk] = useState<PXTKRecord[]>([]);
  const [pxlg, setPxlg] = useState<PXLGRecord[]>([]);
  const [pxlt, setPxlt] = useState<PXLTRecord[]>([]);

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Load partners from localStorage (stored by AuthProvider)
    const stored = localStorage.getItem('partners');
    if (stored) {
      try {
        const parsed: PartnerInfo[] = JSON.parse(stored);
        setPartners(parsed);
        // Try using previously selected partner
        const sel = localStorage.getItem('selected_partner');
        if (sel) {
          setSelectedPartner(sel);
        } else if (parsed.length > 0) {
          setSelectedPartner(parsed[0].id);
        }
      } catch {
        // ignore parse errors
      }
    }
  }, []);

  // Listen to global partner changes triggered from Navbar PartnerSelect
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<{ partner: string }>).detail;
      if (detail?.partner) {
        setSelectedPartner(detail.partner);
      }
    };
    window.addEventListener('partner_change', handler as EventListener);
    return () => window.removeEventListener('partner_change', handler as EventListener);
  }, []);

  const fetchData = async () => {
    if (!selectedPartner) return;
    setLoading(true);
    setError(null);
    try {
      const [pxtkRes, pxlgRes, pxltRes] = await Promise.all([
        axiosInstance.get<ApiResponse<PXTKRecord>>(apiRoutes.SUMMARY_PXTK(selectedPartner, startDate, endDate)),
        axiosInstance.get<ApiResponse<PXLGRecord>>(apiRoutes.SUMMARY_PXLG(selectedPartner, startDate, endDate)),
        axiosInstance.get<ApiResponse<PXLTRecord>>(apiRoutes.SUMMARY_PXLT(selectedPartner, startDate, endDate)),
      ]);
      setPxtk(pxtkRes.data?.data ?? []);
      setPxlg(pxlgRes.data?.data ?? []);
      setPxlt(pxltRes.data?.data ?? []);
    } catch (e: any) {
      setError(e?.message ?? 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPartner, startDate, endDate]);

  const selectedPartnerName = partners.find((p) => p.id === selectedPartner)?.name ?? selectedPartner;

  // Partner selection is handled globally in Navbar.

  return (
    <div className="container mx-auto px-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-center text-[#21e40fef]">Thống kê</h1>
      </div>

      <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="form-control">
          <label className="label"><span className="label-text">Từ ngày</span></label>
          <input type="date" className="input input-bordered" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        </div>
        <div className="form-control">
          <label className="label"><span className="label-text">Đến ngày</span></label>
          <input type="date" className="input input-bordered" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        </div>
      </div>

      {loading && <div className="alert alert-info">Đang tải dữ liệu...</div>}
      {error && <div className="alert alert-error">{error}</div>}

      {!loading && !error && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* PXTK */}
          <div className="card bg-base-200 shadow">
            <div className="card-body">
              <h2 className="card-title">PXTK</h2>
              {pxtk.length === 0 ? (
                <div>Không có dữ liệu</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="table table-zebra">
                    <thead>
                      <tr>
                        <th>Ngày</th>
                        <th>Trưởng ca</th>
                        <th>Giờ SX</th>
                        <th>Số NV</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pxtk.map((row, idx) => (
                        <tr key={idx}>
                          <td>{row.thongtincoban_ngay ?? 'N/A'}</td>
                          <td>{row.thongtincoban_truongca ?? 'N/A'}</td>
                          <td>{row.thongtincoban_thoigiansanxuat_gio ?? 'N/A'}</td>
                          <td>{row.thongtincoban_thoigiansanxuat_sonhanvien ?? 'N/A'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* PXLG */}
          <div className="card bg-base-200 shadow">
            <div className="card-body">
              <h2 className="card-title">PXLG</h2>
              {pxlg.length === 0 ? (
                <div>Không có dữ liệu</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="table table-zebra">
                    <thead>
                      <tr>
                        <th>Ngày</th>
                        <th>Trưởng ca</th>
                        <th>Giờ SX</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pxlg.map((row, idx) => (
                        <tr key={idx}>
                          <td>{row.thongtincoban_ngay ?? 'N/A'}</td>
                          <td>{row.thongtincoban_truongca ?? 'N/A'}</td>
                          <td>{row.thongtincoban_thoigiansanxuat_gio ?? 'N/A'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* PXLT
          <div className="card bg-base-200 shadow">
            <div className="card-body">
              <h2 className="card-title">PXLT</h2>
              {pxlt.length === 0 ? (
                <div>Không có dữ liệu</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="table table-zebra">
                    <thead>
                      <tr>
                        <th>Ngày</th>
                        <th>Trưởng ca</th>
                        <th>Giờ SX</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pxlt.map((row, idx) => (
                        <tr key={idx}>
                          <td>{row.thongtincoban_ngay ?? 'N/A'}</td>
                          <td>{row.thongtincoban_truongca ?? 'N/A'}</td>
                          <td>{row.thongtincoban_thoigiansanxuat_gio ?? 'N/A'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div> */}
        </div>
      )}
    </div>
  );
};

export default StatisticPage;
