import React, { useEffect, useState } from 'react';
import axiosInstance from '../services/axiosConfig';
import { summarizePXTK, summarizePXLG, summarizePXLT } from '../services/statisticService';
import { apiRoutes } from '../services/apiRoutes';
import { AlarmClock, Calendar, User, Users } from 'lucide-react';



type ApiResponse<T> = {
  status: string;
  table: string;
  count: number;
  next: boolean;
  data: T[];
};

type PXTKRecord = {
  thoigiansanxuat_ca: number;
  thongtincoban_ngay?: string;
  thongtincoban_truongca?: string;
  thongtincoban_thoigiansanxuat_gio?: number | null;
  thongtincoban_thoigiansanxuat_sonhanvien?: number | null;
  sanluongca_qtksanxuatthucte: number | null;
  sanluongca_qtksanglocao?: number | null;
  sanluongca_bui?: number | null;
  sanluongca_khoiluongphanlan1?: number | null;
  sanluongca_khoiluongphanlan2?: number | null;
  tieuhaonangluong_đien?: number | null;
  tieuhaonangluong_nuoc?: number | null;
  apsuatamtong: number | null;
  nhietdodiemhoa: number | null;
  apsuatamonggioso12: number | null;
  apluckhithan: number | null;
  domocuagio: number | null;
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
  const [expectedShiftCount, setExpectedShiftCount] = useState<number>(0);

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
      // Cập nhật expectedShiftCount chỉ khi người dùng bấm Tìm kiếm
      try {
        const start = new Date(startDate);
        const end = endDateEnabled ? new Date(endDate) : new Date(startDate);
        const startMid = new Date(start.getFullYear(), start.getMonth(), start.getDate());
        const endMid = new Date(end.getFullYear(), end.getMonth(), end.getDate());
        const msPerDay = 24 * 60 * 60 * 1000;
        const diff = Math.floor((endMid.getTime() - startMid.getTime()) / msPerDay);
        const daysCount = (isNaN(startMid.getTime()) || isNaN(endMid.getTime())) ? 0 : (diff >= 0 ? diff + 1 : 1);
        setExpectedShiftCount(daysCount * 3);
      } catch {
        setExpectedShiftCount(0);
      }
      if (selectedSite === 'pxtk') {
        const res = await axiosInstance.get<ApiResponse<PXTKRecord>>(apiRoutes.SUMMARY(selectedPartner, startDate, endDateEnabled ? endDate : '', selectedSite));
        const techRes = await axiosInstance.get<ApiResponse<PXTKRecord>>(apiRoutes.PXTK_GET_TECH(selectedPartner, startDate, endDateEnabled ? endDate : '', selectedSite));
        // const analyticsRes = await axiosInstance.get<ApiResponse<PXTKRecord>>(apiRoutes.PXTK_GET_ANALYTICS(selectedPartner, startDate, endDateEnabled ? endDate : '', selectedSite));
        const processed = summarizePXTK(res.data?.data ?? [], techRes.data?.data ?? []);
        setPxtk(processed.rows as PXTKRecord[]);
        setPxlg([]);
        setPxlt([]);
      } else if (selectedSite === 'pxlg') {
        const res = await axiosInstance.get<ApiResponse<PXLGRecord>>(apiRoutes.SUMMARY(selectedPartner, startDate, endDateEnabled ? endDate : '', selectedSite));
        const processed = summarizePXLG(res.data?.data ?? []);
        setPxlg(processed.rows as PXLGRecord[]);
        setPxtk([]);
        setPxlt([]);
      } else if (selectedSite === 'pxlt') {
        const res = await axiosInstance.get<ApiResponse<PXLTRecord>>(apiRoutes.SUMMARY(selectedPartner, startDate, endDateEnabled ? endDate : '', selectedSite));
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

  // Group PXTK by day and then render per-shift boxes inside each day container
  const groupedPXTK = React.useMemo(() => {
    const groups: Record<string, PXTKRecord[]> = {};
    pxtk.forEach((row) => {
      const day = (row.thongtincoban_ngay ?? '') as string;
      if (!day) return;
      if (selectedShift && String(row.thoigiansanxuat_ca) !== selectedShift) return;
      if (!groups[day]) groups[day] = [];
      groups[day].push(row);
    });
    return groups;
  }, [pxtk, selectedShift]);

  // Tổng số ca (từ dữ liệu SUMMARY đã được normalize)
  const totalShiftCount = React.useMemo(() => pxtk.length, [pxtk]);
  // Số ca còn thiếu dựa trên expectedShiftCount (chỉ đổi khi bấm Tìm kiếm)
  const missingShiftCount = Math.max(expectedShiftCount - totalShiftCount, 0);

  // Số ca nhập thiếu dữ liệu (bất kỳ trong 7 chỉ số API 1.2 là null)
  const missingDataShiftCount = React.useMemo(() => {
    return pxtk.filter((row) => {
      if (selectedShift && String(row.thoigiansanxuat_ca) !== selectedShift) return false;
      return [
        row.sanluongca_qtksanxuatthucte,
        row.sanluongca_qtksanglocao,
        row.sanluongca_bui,
        row.sanluongca_khoiluongphanlan1,
        row.sanluongca_khoiluongphanlan2,
        row.tieuhaonangluong_đien,
        row.tieuhaonangluong_nuoc,
      ].some((v) => v == null);
    }).length;
  }, [pxtk, selectedShift]);

  return (
    <div className="container mx-auto px-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-center">Theo dõi vận hành</h1>
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
            <div className="flex justify-center items-center">
              <div className="pb-6 text-sm col-span-1 opacity-70">Hoặc</div>
            </div>
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
            <div className="grid grid-cols-12 gap-6">
              <div className="col-span-2 col-start-1">
                <div className="sticky top-16 z-20">
                {Object.keys(groupedPXTK).length !== 0 ? (
                  <div className="stats stats-vertical shadow bg-base-100 rounded-md">
                    <div className="stat">
                      <div className="stat-title text-lg!">Tổng số ca đã nhập</div>
                      <div className="stat-value text-primary">{totalShiftCount}</div>
                      <div className="stat-desc text-sm!">Còn thiếu {missingShiftCount}/{expectedShiftCount}</div>
                    </div>
                    <div className="stat">
                      <div className="stat-title text-lg!">Số ca nhập thiếu dữ liệu</div>
                      <div className="stat-value text-primary">{missingDataShiftCount}</div>
                    </div>
                  </div>
                ) : (
                  <div className="stats shadow">
                  </div>
                )}
                </div>
              </div>

              <div className="col-span-10 col-start-3 flex flex-col gap-6">
                <div className='text-left text-2xl font-bold'>Tổng kết ca PXTK</div>
                {Object.keys(groupedPXTK).length === 0 ? (
                  <div className="alert alert-info">Không có dữ liệu</div>
                ) : (
                  Object.entries(groupedPXTK)
                    .sort((a, b) => (a[0] > b[0] ? 1 : -1))
                    .map(([day, rows]) => (
                      <div key={day} className="card bg-base-100 shadow-md">
                        <div className="card-body p-4">
                          {/* Day banner once per container */}
                          <div className="rounded-xl bg-blue-50 border border-blue-200 p-3 mb-3 sticky top-0 z-10">
                            <div className="flex items-center gap-3">
                              <Calendar />
                              <span className="font-medium text-lg">Ngày làm việc:</span>
                              <span className="ml-2 text-lg">{(() => {
                                const date = new Date(day);
                                return date.toLocaleDateString('vi-VN')
                              })()}</span>
                            </div>
                          </div>

                          {/* Shift boxes inside the day container */}
                          <div className="grid grid-cols-1 gap-4">
                            {rows
                              .sort((a, b) => (a.thoigiansanxuat_ca ?? 0) - (b.thoigiansanxuat_ca ?? 0))
                              .map((row, idx) => (
                                <div
                                  key={idx}
                                  className={`rounded-xl bg-base-200 border ${[
                                    row.sanluongca_qtksanxuatthucte,
                                    row.sanluongca_qtksanglocao,
                                    row.sanluongca_bui,
                                    row.sanluongca_khoiluongphanlan1,
                                    row.sanluongca_khoiluongphanlan2,
                                    row.tieuhaonangluong_đien,
                                    row.tieuhaonangluong_nuoc,
                                  ].some((v) => v == null) ? 'border-red-400' : 'border-green-400'} p-3 shadow-sm hover:shadow-md transition`}
                                >
                                  {/* Shift info (Ca, Trưởng ca, Số lượng công nhân) */}
                                  <div className="flex flex-wrap items-center gap-10 mb-3 p-3 rounded-xl bg-base-100 border border-base-300 text-left">
                                    <div className="flex items-center gap-3">
                                      <div className="w-8 h-8 rounded-full bg-blue-400 text-white flex items-center justify-center text-lg"><AlarmClock /></div>
                                      <div>
                                        <div className="text-sm opacity-70">Ca</div>
                                        <div className="font-semibold text-lg">{row.thoigiansanxuat_ca ?? '...'}{row.thongtincoban_thoigiansanxuat_gio ? ` (${row.thongtincoban_thoigiansanxuat_gio} giờ)` : ''}</div>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                      <div className="w-8 h-8 rounded-full bg-purple-400 text-white flex items-center justify-center text-sm"><User /></div>
                                      <div>
                                        <div className="text-sm opacity-70">Trưởng ca</div>
                                        <div className="font-semibold text-lg">{row.thongtincoban_truongca ?? '...'}</div>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                      <div className="w-8 h-8 rounded-full bg-teal-400 text-white flex items-center justify-center text-sm"><Users /></div>
                                      <div>
                                        <div className="text-sm opacity-70">Số lượng công nhân</div>
                                        <div className="font-semibold text-lg">{row.thongtincoban_thoigiansanxuat_sonhanvien ?? '...'}</div>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Detail metrics section (updated) */}
                                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
                                    <div className="stat bg-base-100 rounded-xl border border-base-200 transition-transform hover:-translate-y-0.5 hover:shadow-md">
                                      <div className="stat-title text-sm opacity-70">Thời gian chạy máy</div>
                                      <div className="stat-value text-base font-semibold">{row.thongtincoban_thoigiansanxuat_gio ?? '...'} giờ</div>
                                    </div>
                                    <div className={`stat bg-base-100 rounded-xl border transition-transform hover:-translate-y-0.5 hover:shadow-md ${row.sanluongca_qtksanxuatthucte == null ? 'border-red-400' : 'border-base-200'}`}>
                                      <div className="stat-title text-sm opacity-70">Quặng TK Sản xuất thực tế</div>
                                      <div className="stat-value text-base font-semibold">{row.sanluongca_qtksanxuatthucte ?? '...'} tấn</div>
                                    </div>
                                    <div className={`stat bg-base-100 rounded-xl border transition-transform hover:-translate-y-0.5 hover:shadow-md ${row.sanluongca_qtksanglocao == null ? 'border-red-400' : 'border-base-200'}`}>
                                      <div className="stat-title text-sm opacity-70">Quặng Thiêu kết trong lò cao</div>
                                      <div className="stat-value text-base font-semibold">{row.sanluongca_qtksanglocao ?? '...'} tấn</div>
                                    </div>
                                    <div className={`stat bg-base-100 rounded-xl border transition-transform hover:-translate-y-0.5 hover:shadow-md ${row.sanluongca_bui == null ? 'border-red-400' : 'border-base-200'}`}>
                                      <div className="stat-title text-sm opacity-70">Bụi ra</div>
                                      <div className="stat-value text-base font-semibold">{row.sanluongca_bui ?? '...'} tấn</div>
                                    </div>
                                    <div className={`stat bg-base-100 rounded-xl border transition-transform hover:-translate-y-0.5 hover:shadow-md ${row.sanluongca_khoiluongphanlan1 == null ? 'border-red-400' : 'border-base-200'}`}>
                                      <div className="stat-title text-sm opacity-70">Khối lượng phản lần 1 (t)</div>
                                      <div className="stat-value text-base font-semibold">{row.sanluongca_khoiluongphanlan1 ?? '...'}</div>
                                    </div>
                                    <div className={`stat bg-base-100 rounded-xl border transition-transform hover:-translate-y-0.5 hover:shadow-md ${row.sanluongca_khoiluongphanlan2 == null ? 'border-red-400' : 'border-base-200'}`}>
                                      <div className="stat-title text-sm opacity-70">Khối lượng phản lần 2 (t)</div>
                                      <div className="stat-value text-base font-semibold">{row.sanluongca_khoiluongphanlan2 ?? '...'}</div>
                                    </div>
                                    <div className={`stat bg-base-100 rounded-xl border transition-transform hover:-translate-y-0.5 hover:shadow-md ${row.tieuhaonangluong_đien == null ? 'border-red-400' : 'border-base-200'}`}>
                                      <div className="stat-title text-sm opacity-70">Chỉ số điện (kWh)</div>
                                      <div className="stat-value text-base font-semibold">{row.tieuhaonangluong_đien ?? '...'}</div>
                                    </div>
                                    <div className={`stat bg-base-100 rounded-xl border transition-transform hover:-translate-y-0.5 hover:shadow-md ${row.tieuhaonangluong_nuoc == null ? 'border-red-400' : 'border-base-200'}`}>
                                      <div className="stat-title text-sm opacity-70">Chỉ số nước (m3)</div>
                                      <div className="stat-value text-base font-semibold">{row.tieuhaonangluong_nuoc ?? '...'}</div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                          </div>
                        </div>
                      </div>
                    ))
                )}
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
                            <td>{row.thongtincoban_ngay ?? '...'}</td>
                            <td>{row.thongtincoban_truongca ?? '...'}</td>
                            <td>{row.thongtincoban_thoigiansanxuat_gio ?? '...'}</td>
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
                            <td>{row.thongtincoban_ngay ?? '...'}</td>
                            <td>{row.thongtincoban_truongca ?? '...'}</td>
                            <td>{row.thongtincoban_thoigiansanxuat_gio ?? '...'}</td>
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
