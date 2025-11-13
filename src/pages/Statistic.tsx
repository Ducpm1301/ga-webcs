import React, { useEffect, useState } from 'react';
import axiosInstance from '../services/axiosConfig';
import { summarizePXTK, summarizePXLG, summarizePXLT } from '../services/statisticService';
import { apiRoutes } from '../services/apiRoutes';



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
  const [selectedPartner, setSelectedPartner] = useState<string>('');
  const [startDate, setStartDate] = useState<string>(formatDateInput(new Date()));
  const [endDate, setEndDate] = useState<string>(formatDateInput(new Date()));
  const [endDateEnabled, setEndDateEnabled] = useState<boolean>(false);
  const [selectedSite, setSelectedSite] = useState<string>('pxtk');
  const [selectedShift, setSelectedShift] = useState<string>('');
  const [preset, setPreset] = useState<string>('');
  const [dateMode, setDateMode] = useState<'preset' | 'custom'>('custom');

  const [pxtk, setPxtk] = useState<PXTKRecord[]>([]);
  const [pxlg, setPxlg] = useState<PXLGRecord[]>([]);
  const [pxlt, setPxlt] = useState<PXLTRecord[]>([]);

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const sel = localStorage.getItem('selected_partner');
    if (sel) {
      setSelectedPartner(sel);
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

  const fetchData = React.useCallback(async () => {
    if (!selectedPartner) return;
    setLoading(true);
    setError(null);
    try {
      if (selectedSite === 'pxtk') {
        const res = await axiosInstance.get<ApiResponse<PXTKRecord>>(apiRoutes.SUMMARY(selectedPartner, startDate, endDateEnabled ? endDate : '', selectedSite, selectedShift || undefined));
        const processed = summarizePXTK(res.data?.data ?? []);
        setPxtk(processed.rows as PXTKRecord[]);
        setPxlg([]);
        setPxlt([]);
      } else if (selectedSite === 'pxlg') {
        const res = await axiosInstance.get<ApiResponse<PXLGRecord>>(apiRoutes.SUMMARY(selectedPartner, startDate, endDateEnabled ? endDate : '', selectedSite, selectedShift || undefined));
        const processed = summarizePXLG(res.data?.data ?? []);
        setPxlg(processed.rows as PXLGRecord[]);
        setPxtk([]);
        setPxlt([]);
      } else if (selectedSite === 'pxlt') {
        const res = await axiosInstance.get<ApiResponse<PXLTRecord>>(apiRoutes.SUMMARY(selectedPartner, startDate, endDateEnabled ? endDate : '', selectedSite, selectedShift || undefined));
        const processed = summarizePXLT(res.data?.data ?? []);
        setPxlt(processed.rows as PXLTRecord[]);
        setPxtk([]);
        setPxlg([]);
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Failed to load data';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [selectedPartner, startDate, endDate, endDateEnabled, selectedSite, selectedShift]);


  // Partner selection is handled globally in Navbar.

  return (
    <div className="container mx-auto px-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-center text-[#21e40fef]">Theo dõi vận hành</h1>
      </div>

      <div className="grid grid-cols-12 gap-2 items-end">
        <div className="mb-4 border border-gray-200 rounded-md p-4 col-span-7">
          <div className="grid grid-cols-10 gap-4">
            <div
              className={`form-control rounded-md p-3 col-span-3 border ${dateMode === 'preset' ? 'border-primary shadow-sm bg-primary/5' : 'border-gray-200 opacity-90'}`}
              onClick={() => setDateMode('preset')}
            >
              <label className="label"><span className="label-text">Khoảng thời gian</span></label>
              <select
                className="select select-bordered"
                value={preset}
                onFocus={() => setDateMode('preset')}
                onChange={(e) => {
                  const val = e.target.value;
                  setPreset(val);
                  setDateMode('preset');
                  const now = new Date();
                  if (val === 'this_week') {
                    const day = now.getDay();
                    const diffToMonday = (day + 6) % 7;
                    const monday = new Date(now);
                    monday.setDate(now.getDate() - diffToMonday);
                    setStartDate(formatDateInput(monday));
                    setEndDate(formatDateInput(now));
                    setEndDateEnabled(true);
                  } else if (val === 'last_week') {
                    const day = now.getDay();
                    const diffToMonday = (day + 6) % 7;
                    const thisMonday = new Date(now);
                    thisMonday.setDate(now.getDate() - diffToMonday);
                    const lastMonday = new Date(thisMonday);
                    lastMonday.setDate(thisMonday.getDate() - 7);
                    const lastSunday = new Date(thisMonday);
                    lastSunday.setDate(thisMonday.getDate() - 1);
                    setStartDate(formatDateInput(lastMonday));
                    setEndDate(formatDateInput(lastSunday));
                    setEndDateEnabled(true);
                  } else if (val === 'this_month') {
                    const first = new Date(now.getFullYear(), now.getMonth(), 1);
                    setStartDate(formatDateInput(first));
                    setEndDate(formatDateInput(now));
                    setEndDateEnabled(true);
                  } else {
                    setDateMode('custom');
                  }
                }}
                disabled={dateMode === 'custom'}
              >
                <option value="">Chọn</option>
                <option value="this_week">Tuần này</option>
                <option value="last_week">Tuần trước</option>
                <option value="this_month">Tháng này</option>
              </select>
            </div>
            <div className="pb-6 text-sm col-span-1 opacity-70">Or</div>
            <div
              className={`grid grid-cols-2 gap-3 rounded-md p-3 col-span-6 border ${dateMode === 'custom' ? 'border-primary shadow-sm bg-primary/5' : 'border-gray-200 opacity-90'}`}
              onClick={() => setDateMode('custom')}
            >
              <div className="form-control">
                <label className="label"><span className="label-text text-left">Ngày</span></label>
                <input
                  type="date"
                  className="input input-bordered"
                  value={startDate}
                  onFocus={() => setDateMode('custom')}
                  onChange={(e) => { setStartDate(e.target.value); setDateMode('custom'); }}
                  disabled={dateMode === 'preset'}
                />
              </div>
              <div className="form-control">
                <label className="label"><span className="label-text"><input type="checkbox" className="checkbox mr-2" checked={endDateEnabled} onChange={(e) => { setEndDateEnabled(e.target.checked); setDateMode('custom'); }} disabled={dateMode === 'preset'} />Đến ngày</span></label>
                <input
                  type="date"
                  className="input input-bordered"
                  value={endDate}
                  onFocus={() => setDateMode('custom')}
                  onChange={(e) => { setEndDate(e.target.value); setDateMode('custom'); }}
                  disabled={dateMode === 'preset' || !endDateEnabled}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="form-control col-span-2 mb-4 self-end">
          <label className="label"><span className="label-text">Phân xưởng</span></label>
          <select className="select select-bordered" value={selectedSite} onChange={(e) => setSelectedSite(e.target.value)}>
            <option value="pxtk">PXTK</option>
            <option value="pxlg">PXLG</option>
            <option value="pxlt">PXLT</option>
          </select>
        </div>
        <div className="form-control col-span-2 mb-4 self-end">
          <label className="label"><span className="label-text">Ca</span></label>
          <select className="select select-bordered" value={selectedShift} onChange={(e) => setSelectedShift(e.target.value)}>
            <option value="">Tất cả</option>
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
          </select>
        </div>
        <button className="btn btn-primary col-span-1 mb-4 self-end" onClick={fetchData}>Tìm kiếm</button>
      </div>

      {loading && <div className="alert alert-info">Đang tải dữ liệu...</div>}
      {error && <div className="alert alert-error">{error}</div>}

      {!loading && !error && (
        <div className="grid grid-cols-1 gap-6">
          {selectedSite === 'pxtk' && (
            <div className="card bg-base-200 shadow">
              <div className="card-body">
                <h2 className="card-title text-2xl!">Tổng kết ca PXTK</h2>
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
                      {pxtk.length === 0 ? (
                        <tr>
                          <td colSpan={4}>Không có dữ liệu</td>
                        </tr>
                      ) : (
                        pxtk.map((row, idx) => (
                          <tr key={idx}>
                            <td>{row.thongtincoban_ngay ?? 'N/A'}</td>
                            <td>{row.thongtincoban_truongca ?? 'N/A'}</td>
                            <td>{row.thongtincoban_thoigiansanxuat_gio ?? 'N/A'}</td>
                            <td>{row.thongtincoban_thoigiansanxuat_sonhanvien ?? 'N/A'}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
          {selectedSite === 'pxlg' && (
            <div className="card bg-base-200 shadow">
              <div className="card-body">
                <h2 className="card-title text-2xl!">Tổng kết ca PXLG</h2>
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
                      {pxlg.length === 0 ? (
                        <tr>
                          <td colSpan={3}>Không có dữ liệu</td>
                        </tr>
                      ) : (
                        pxlg.map((row, idx) => (
                          <tr key={idx}>
                            <td>{row.thongtincoban_ngay ?? 'N/A'}</td>
                            <td>{row.thongtincoban_truongca ?? 'N/A'}</td>
                            <td>{row.thongtincoban_thoigiansanxuat_gio ?? 'N/A'}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
          {selectedSite === 'pxlt' && (
            <div className="card bg-base-200 shadow">
              <div className="card-body">
                <h2 className="card-title text-2xl!">Tổng kết ca PXLT</h2>
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
                      {pxlt.length === 0 ? (
                        <tr>
                          <td colSpan={3}>Không có dữ liệu</td>
                        </tr>
                      ) : (
                        pxlt.map((row, idx) => (
                          <tr key={idx}>
                            <td>{row.thongtincoban_ngay ?? 'N/A'}</td>
                            <td>{row.thongtincoban_truongca ?? 'N/A'}</td>
                            <td>{row.thongtincoban_thoigiansanxuat_gio ?? 'N/A'}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default StatisticPage;
