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
  thongtincoban_ca?: number | null;
  thongtincoban_thoigiansanxuat_sonhanvien?: number | null;
  tonghop_sx_luy_ke_so_me_lieu_dau_ca?: number | null;
  sl_ban_thanhpham_me_gang_tan?: number | null;
  sl_ban_thanhpham_xi_hat_tan?: number | null;
  sl_ban_thanhpham_xi_kho_tan?: number | null;
  tonghop_sx_luy_ke_so_me_gang_dau_ca?: number | null;
  tieuhaonangluong_dien?: number | null;
  tieuhaonangluong_nuoc?: number | null;
  [key: string]: unknown;
};

type PXLTRecord = {
  thongtincoban_ngay?: string;
  thongtincoban_truongca?: string;
  thongtincoban_thoigiansanxuat_gio?: number;
  thongtincoban_ca?: number | null;
  thongtincoban_thoigiansanxuat_sonhanvien?: number | null;
  // Nguyên liệu & hợp kim
  nguyenlieu_thutu_me_ngay?: number | null;
  nguyenlieu_thutu_me_nam?: number | null;
  nguyenlieu_thutu_me_thexay?: number | null;
  nguyenlieu_thongsosx_nhietdo_binhquan_c?: number | null;
  // Sản lượng - mẻ đúc
  sl_meduc_thutu_me_theo_ngay?: number | null;
  sl_meduc_thutu_me_theo_nam?: number | null;
  sl_meduc_thutu_me_theo_ttg?: number | null;
  sl_meduc_so_hieu_thung_thep?: number | null;
  sl_meduc_so_hieu_thung_ttg?: number | null;
  // Tiêu hao
  tieuhaonangluong_dien?: number | null;
  tieuhaonangluong_nuoc?: number | null;
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

  // ---- PXLG grouping and stats (Task 2.3) ----
  const groupedPXLG = React.useMemo(() => {
    const groups: Record<string, PXLGRecord[]> = {};
    pxlg.forEach((row) => {
      const day = (row.thongtincoban_ngay ?? '') as string;
      if (!day) return;
      if (selectedShift && String(row.thongtincoban_ca) !== selectedShift) return;
      if (!groups[day]) groups[day] = [];
      groups[day].push(row);
    });
    return groups;
  }, [pxlg, selectedShift]);

  const totalShiftCountPXLG = React.useMemo(() => {
    // respects Ca filter via groupedPXLG size if needed, but keep raw count for clarity
    return selectedShift ? pxlg.filter((r) => String(r.thongtincoban_ca) === selectedShift).length : pxlg.length;
  }, [pxlg, selectedShift]);

  const missingShiftCountPXLG = Math.max(expectedShiftCount - totalShiftCountPXLG, 0);

  const missingDataShiftCountPXLG = React.useMemo(() => {
    return pxlg.filter((row) => {
      if (selectedShift && String(row.thongtincoban_ca) !== selectedShift) return false;
      return [
        row.tonghop_sx_luy_ke_so_me_lieu_dau_ca,
        row.sl_ban_thanhpham_me_gang_tan,
        row.sl_ban_thanhpham_xi_hat_tan,
        row.sl_ban_thanhpham_xi_kho_tan,
        row.tonghop_sx_luy_ke_so_me_gang_dau_ca,
        row.tieuhaonangluong_dien,
        row.tieuhaonangluong_nuoc,
      ].some((v) => v == null);
    }).length;
  }, [pxlg, selectedShift]);

  // ---- PXLT grouping and stats (Task 2.4) ----
  const groupedPXLT = React.useMemo(() => {
    const groups: Record<string, PXLTRecord[]> = {};
    pxlt.forEach((row) => {
      const day = (row.thongtincoban_ngay ?? '') as string;
      if (!day) return;
      if (selectedShift && String(row.thongtincoban_ca) !== selectedShift) return;
      if (!groups[day]) groups[day] = [];
      groups[day].push(row);
    });
    return groups;
  }, [pxlt, selectedShift]);

  const totalShiftCountPXLT = React.useMemo(() => {
    return selectedShift ? pxlt.filter((r) => String(r.thongtincoban_ca) === selectedShift).length : pxlt.length;
  }, [pxlt, selectedShift]);

  const missingShiftCountPXLT = Math.max(expectedShiftCount - totalShiftCountPXLT, 0);

  const missingDataShiftCountPXLT = React.useMemo(() => {
    return pxlt.filter((row) => {
      if (selectedShift && String(row.thongtincoban_ca) !== selectedShift) return false;
      return [
        // Nguyên liệu & hợp kim
        row.nguyenlieu_thutu_me_ngay,
        row.nguyenlieu_thutu_me_nam,
        row.nguyenlieu_thutu_me_thexay,
        row.nguyenlieu_thongsosx_nhietdo_binhquan_c,
        // Sản lượng - mẻ đúc
        row.sl_meduc_thutu_me_theo_ngay,
        row.sl_meduc_thutu_me_theo_nam,
        row.sl_meduc_thutu_me_theo_ttg,
        row.sl_meduc_so_hieu_thung_thep,
        row.sl_meduc_so_hieu_thung_ttg,
        // Tiêu hao
        row.tieuhaonangluong_dien,
        row.tieuhaonangluong_nuoc,
      ].some((v) => v == null);
    }).length;
  }, [pxlt, selectedShift]);


  return (
    <div className="container mx-auto px-4">
      <div className="sticky top-0 z-40 -mx-2 bg-white mb-2 shadow-md rounded-b-lg">
        <div className="flex items-center justify-between py-4">
          <h1 className="text-xl font-bold text-center">Theo dõi vận hành</h1>
        </div>

        <div className="grid grid-cols-12 gap-2 items-end p-3">
          <div className="border border-gray-200 rounded-md p-4 col-span-7">
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
      </div>

      {loading && <div className="alert alert-info">Đang tải dữ liệu...</div>}
      {error && <div className="alert alert-error">{error}</div>}

      {!loading && !error && (
        <div className="grid grid-cols-1 gap-6">
          {selectedSite === 'pxtk' && (
            <div className="grid grid-cols-12 gap-6">
              <div className="col-span-2 col-start-1">
                <div className="sticky top-62 z-20">
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

              <div className="col-span-9 col-start-4 flex flex-col gap-6">
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
                          <div className="rounded-xl bg-blue-50 border border-blue-200 p-3 mb-3 sticky top-60 z-10">
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
            <div className="grid grid-cols-12 gap-6">
              {/* Sticky stats panel */}
              <div className="col-span-2 col-start-1">
                <div className="sticky top-62 z-20">
                  {Object.keys(groupedPXLG).length !== 0 ? (
                    <div className="stats stats-vertical shadow bg-base-100 rounded-md">
                      <div className="stat">
                        <div className="stat-title text-lg!">Tổng số ca đã nhập</div>
                        <div className="stat-value text-primary">{totalShiftCountPXLG}</div>
                        <div className="stat-desc text-sm!">Còn thiếu {missingShiftCountPXLG}/{expectedShiftCount}</div>
                      </div>
                      <div className="stat">
                        <div className="stat-title text-lg!">Số ca nhập thiếu dữ liệu</div>
                        <div className="stat-value text-primary">{missingDataShiftCountPXLG}</div>
                      </div>
                    </div>
                  ) : (
                    <div className="stats shadow bg-base-100 rounded-md"></div>
                  )}
                </div>
              </div>

              {/* Right content area */}
              <div className="col-span-9 col-start-4 flex flex-col gap-6">
                <div className='text-left text-2xl font-bold'>Tổng kết ca PXLG</div>
                {Object.keys(groupedPXLG).length === 0 ? (
                  <div className="alert alert-info">Không có dữ liệu</div>
                ) : (
                  Object.entries(groupedPXLG)
                    .sort((a, b) => (a[0] > b[0] ? 1 : -1))
                    .map(([day, rows]) => (
                      <div key={day} className="card bg-base-100 shadow-md">
                        <div className="card-body p-4">
                          {/* Day banner */}
                          <div className="rounded-xl bg-blue-50 border border-blue-200 p-3 mb-3 sticky top-60 z-10">
                            <div className="flex items-center gap-3">
                              <Calendar />
                              <span className="font-medium text-lg">Ngày làm việc:</span>
                              <span className="ml-2 text-lg">{(() => {
                                const date = new Date(day);
                                return date.toLocaleDateString('vi-VN');
                              })()}</span>
                            </div>
                          </div>

                          {/* Shift boxes */}
                          <div className="grid grid-cols-1 gap-4">
                            {rows
                              .sort((a, b) => (a.thongtincoban_ca ?? 0) - (b.thongtincoban_ca ?? 0))
                              .map((row, idx) => (
                                <div
                                  key={idx}
                                  className={`rounded-xl bg-base-200 border ${[
                                    row.tonghop_sx_luy_ke_so_me_lieu_dau_ca,
                                    row.sl_ban_thanhpham_me_gang_tan,
                                    row.sl_ban_thanhpham_xi_hat_tan,
                                    row.sl_ban_thanhpham_xi_kho_tan,
                                    row.tonghop_sx_luy_ke_so_me_gang_dau_ca,
                                    row.tieuhaonangluong_dien,
                                    row.tieuhaonangluong_nuoc,
                                  ].some((v) => v == null) ? 'border-red-400' : 'border-green-400'} p-3 shadow-sm hover:shadow-md transition`}
                                >
                                  {/* Shift info */}
                                  <div className="flex flex-wrap items-center gap-10 mb-3 p-3 rounded-xl bg-base-100 border border-base-300 text-left">
                                    <div className="flex items-center gap-3">
                                      <div className="w-8 h-8 rounded-full bg-blue-400 text-white flex items-center justify-center text-lg"><AlarmClock /></div>
                                      <div>
                                        <div className="text-sm opacity-70">Ca</div>
                                        <div className="font-semibold text-lg">{row.thongtincoban_ca ?? '...'}{row.thongtincoban_thoigiansanxuat_gio ? ` (${row.thongtincoban_thoigiansanxuat_gio} giờ)` : ''}</div>
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
                                        <div className="text-sm opacity-70">Số lượng nhân viên</div>
                                        <div className="font-semibold text-lg">{row.thongtincoban_thoigiansanxuat_sonhanvien ?? '...'}</div>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Cluster: Sản lượng & bán thanh phẩm */}

                                  {/* Cluster: Nguyên liệu */}
                                  <div className="relative rounded-xl border border-base-300 bg-base-100 p-4 mb-3">
                                    <span className="absolute -top-3 left-4 px-2 text-sm font-semibold">Nguyên liệu</span>
                                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
                                      <div className="stat bg-base-100 rounded-xl border border-base-200 transition-transform hover:-translate-y-0.5 hover:shadow-md">
                                        <div className="stat-title text-sm opacity-70">Lũy kế số mẻ liệu đầu ca</div>
                                        <div className="stat-value text-base font-semibold">{row.tonghop_sx_luy_ke_so_me_lieu_dau_ca ?? '...'}</div>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="relative rounded-xl border border-base-300 bg-base-100 p-4 mb-3">
                                    <span className="absolute -top-3 left-4 px-2 text-sm font-semibold">Sản lượng & bán thanh phẩm</span>
                                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
                                      <div className={`stat bg-base-100 rounded-xl border ${row.sl_ban_thanhpham_me_gang_tan == null ? 'border-red-400' : 'border-base-200'} transition-transform hover:-translate-y-0.5 hover:shadow-md`}>
                                        <div className="stat-title text-sm opacity-70">Gang Mê (Tấn)</div>
                                        <div className="stat-value text-base font-semibold">{row.sl_ban_thanhpham_me_gang_tan ?? '...'}</div>
                                      </div>
                                      <div className={`stat bg-base-100 rounded-xl border ${row.sl_ban_thanhpham_xi_hat_tan == null ? 'border-red-400' : 'border-base-200'} transition-transform hover:-translate-y-0.5 hover:shadow-md`}>
                                        <div className="stat-title text-sm opacity-70">Xi Hạt (Tấn)</div>
                                        <div className="stat-value text-base font-semibold">{row.sl_ban_thanhpham_xi_hat_tan ?? '...'}</div>
                                      </div>
                                      <div className={`stat bg-base-100 rounded-xl border ${row.sl_ban_thanhpham_xi_kho_tan == null ? 'border-red-400' : 'border-base-200'} transition-transform hover:-translate-y-0.5 hover:shadow-md`}>
                                        <div className="stat-title text-sm opacity-70">Xi Khô (Tấn)</div>
                                        <div className="stat-value text-base font-semibold">{row.sl_ban_thanhpham_xi_kho_tan ?? '...'}</div>
                                      </div>

                                      <div className={`stat bg-base-100 rounded-xl border ${row.tonghop_sx_luy_ke_so_me_gang_dau_ca == null ? 'border-red-400' : 'border-base-200'} transition-transform hover:-translate-y-0.5 hover:shadow-md`}>
                                        <div className="stat-title text-sm opacity-70">Lũy kế số mẻ ra gang đầu ca</div>
                                        <div className="stat-value text-base font-semibold">{row.tonghop_sx_luy_ke_so_me_gang_dau_ca ?? '...'}</div>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Cluster: Tiêu hao */}
                                  <div className="relative rounded-xl border border-base-300 bg-base-100 p-4">
                                    <span className="absolute -top-3 left-4 px-2 text-sm font-semibold">Tiêu hao</span>
                                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
                                      <div className={`stat bg-base-100 rounded-xl border ${row.tieuhaonangluong_dien == null ? 'border-red-400' : 'border-base-200'} transition-transform hover:-translate-y-0.5 hover:shadow-md`}>
                                        <div className="stat-title text-sm opacity-70">Chỉ số điện (kWh)</div>
                                        <div className="stat-value text-base font-semibold">{row.tieuhaonangluong_dien ?? '...'}</div>
                                      </div>
                                      <div className={`stat bg-base-100 rounded-xl border ${row.tieuhaonangluong_nuoc == null ? 'border-red-400' : 'border-base-200'} transition-transform hover:-translate-y-0.5 hover:shadow-md`}>
                                        <div className="stat-title text-sm opacity-70">Chỉ số nước (m3)</div>
                                        <div className="stat-value text-base font-semibold">{row.tieuhaonangluong_nuoc ?? '...'}</div>
                                      </div>
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
          {selectedSite === 'pxlt' && (
            <div className="grid grid-cols-12 gap-6">
              {/* Sticky stats panel */}
              <div className="col-span-2 col-start-1">
                <div className="sticky top-62 z-20">
                  {Object.keys(groupedPXLT).length !== 0 ? (
                    <div className="stats stats-vertical shadow bg-base-100 rounded-md">
                      <div className="stat">
                        <div className="stat-title text-lg!">Tổng số ca đã nhập</div>
                        <div className="stat-value text-primary">{totalShiftCountPXLT}</div>
                        <div className="stat-desc text-sm!">Còn thiếu {missingShiftCountPXLT}/{expectedShiftCount}</div>
                      </div>
                      <div className="stat">
                        <div className="stat-title text-lg!">Số ca nhập thiếu dữ liệu</div>
                        <div className="stat-value text-primary">{missingDataShiftCountPXLT}</div>
                      </div>
                    </div>
                  ) : (
                    <div className="stats shadow bg-base-100 rounded-md"></div>
                  )}
                </div>
              </div>

              {/* Right content area */}
              <div className="col-span-9 col-start-4 flex flex-col gap-6">
                <div className='text-left text-2xl font-bold'>Tổng kết ca PXLT</div>
                {Object.keys(groupedPXLT).length === 0 ? (
                  <div className="alert alert-info">Không có dữ liệu</div>
                ) : (
                  Object.entries(groupedPXLT)
                    .sort((a, b) => (a[0] > b[0] ? 1 : -1))
                    .map(([day, rows]) => (
                      <div key={day} className="card bg-base-100 shadow-md">
                        <div className="card-body p-4">
                          {/* Day banner */}
                          <div className="rounded-xl bg-blue-50 border border-blue-200 p-3 mb-3 sticky top-60 z-10">
                            <div className="flex items-center gap-3">
                              <Calendar />
                              <span className="font-medium text-lg">Ngày làm việc:</span>
                              <span className="ml-2 text-lg">{(() => {
                                const date = new Date(day);
                                return date.toLocaleDateString('vi-VN');
                              })()}</span>
                            </div>
                          </div>

                          {/* Shift boxes */}
                          <div className="grid grid-cols-1 gap-4">
                            {rows
                              .sort((a, b) => (a.thongtincoban_ca ?? 0) - (b.thongtincoban_ca ?? 0))
                              .map((row, idx) => (
                                <div
                                  key={idx}
                                  className={`rounded-xl bg-base-200 border ${[
                                    // overall missing flag if any of the metrics is null
                                    row.nguyenlieu_thutu_me_ngay,
                                    row.nguyenlieu_thutu_me_nam,
                                    row.nguyenlieu_thutu_me_thexay,
                                    row.nguyenlieu_thongsosx_nhietdo_binhquan_c,
                                    row.sl_meduc_thutu_me_theo_ngay,
                                    row.sl_meduc_thutu_me_theo_nam,
                                    row.sl_meduc_thutu_me_theo_ttg,
                                    row.sl_meduc_so_hieu_thung_thep,
                                    row.sl_meduc_so_hieu_thung_ttg,
                                    row.tieuhaonangluong_dien,
                                    row.tieuhaonangluong_nuoc,
                                  ].some((v) => v == null) ? 'border-red-400' : 'border-green-400'} p-3 shadow-sm hover:shadow-md transition`}
                                >
                                  {/* Shift info */}
                                  <div className="flex flex-wrap items-center gap-10 mb-3 p-3 rounded-xl bg-base-100 border border-base-300 text-left">
                                    <div className="flex items-center gap-3">
                                      <div className="w-8 h-8 rounded-full bg-blue-400 text-white flex items-center justify-center text-lg"><AlarmClock /></div>
                                      <div>
                                        <div className="text-sm opacity-70">Ca</div>
                                        <div className="font-semibold text-lg">{row.thongtincoban_ca ?? '...'}{row.thongtincoban_thoigiansanxuat_gio ? ` (${row.thongtincoban_thoigiansanxuat_gio} giờ)` : ''}</div>
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

                                  {/* Always-visible clusters with floating headers */}
                                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                                    {/* Nguyên liệu & hợp kim */}
                                    <div className="relative">
                                      <div className="absolute -top-3 left-3 bg-base-100 px-2 text-sm opacity-70">Nguyên liệu & hợp kim</div>
                                      <div className="grid grid-cols-1 gap-3 rounded-xl bg-base-100 border border-base-300 p-3">
                                        <div className="grid grid-cols-3 gap-3">
                                          <div className={`stat bg-base-50 rounded-xl border ${row.nguyenlieu_thutu_me_ngay == null ? 'border-red-400' : 'border-base-200'}`}>
                                            <div className="stat-title text-sm opacity-70">Thứ tự mẻ theo ngày</div>
                                            <div className="stat-value text-base font-semibold">{row.nguyenlieu_thutu_me_ngay ?? '...'}</div>
                                          </div>
                                          <div className={`stat bg-base-50 rounded-xl border ${row.nguyenlieu_thutu_me_nam == null ? 'border-red-400' : 'border-base-200'}`}>
                                            <div className="stat-title text-sm opacity-70">Thứ tự mẻ theo năm</div>
                                            <div className="stat-value text-base font-semibold">{row.nguyenlieu_thutu_me_nam ?? '...'}</div>
                                          </div>
                                          <div className={`stat bg-base-50 rounded-xl border ${row.nguyenlieu_thutu_me_thexay == null ? 'border-red-400' : 'border-base-200'}`}>
                                            <div className="stat-title text-sm opacity-70">Thứ tự theo thể xây</div>
                                            <div className="stat-value text-base font-semibold">{row.nguyenlieu_thutu_me_thexay ?? '...'}</div>
                                          </div>
                                        </div>
                                        <div className={`stat bg-base-50 rounded-xl border ${row.nguyenlieu_thongsosx_nhietdo_binhquan_c == null ? 'border-red-400' : 'border-base-200'}`}>
                                          <div className="stat-title text-sm opacity-70">Nhiệt độ bình quân</div>
                                          <div className="stat-value text-base font-semibold">{row.nguyenlieu_thongsosx_nhietdo_binhquan_c ?? '...'} °C</div>
                                        </div>
                                      </div>
                                    </div>

                                    {/* Sản lượng */}
                                    <div className="relative">
                                      <div className="absolute -top-3 left-3 bg-base-100 px-2 text-sm opacity-70">Sản lượng</div>
                                      <div className="grid grid-cols-1 gap-3 rounded-xl bg-base-100 border border-base-300 p-3">
                                        <div className="grid grid-cols-3 gap-3">
                                          <div className={`stat bg-base-50 rounded-xl border ${row.sl_meduc_thutu_me_theo_ngay == null ? 'border-red-400' : 'border-base-200'}`}>
                                            <div className="stat-title text-sm opacity-70">Thứ tự mẻ theo ngày</div>
                                            <div className="stat-value text-base font-semibold">{row.sl_meduc_thutu_me_theo_ngay ?? '...'}</div>
                                          </div>
                                          <div className={`stat bg-base-50 rounded-xl border ${row.sl_meduc_thutu_me_theo_nam == null ? 'border-red-400' : 'border-base-200'}`}>
                                            <div className="stat-title text-sm opacity-70">Thứ tự mẻ theo năm</div>
                                            <div className="stat-value text-base font-semibold">{row.sl_meduc_thutu_me_theo_nam ?? '...'}</div>
                                          </div>
                                          <div className={`stat bg-base-50 rounded-xl border ${row.sl_meduc_thutu_me_theo_ttg == null ? 'border-red-400' : 'border-base-200'}`}>
                                            <div className="stat-title text-sm opacity-70">Thứ tự mẻ theo TTG</div>
                                            <div className="stat-value text-base font-semibold">{row.sl_meduc_thutu_me_theo_ttg ?? '...'}</div>
                                          </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                          <div className={`stat bg-base-50 rounded-xl border ${row.sl_meduc_so_hieu_thung_thep == null ? 'border-red-400' : 'border-base-200'}`}>
                                            <div className="stat-title text-sm opacity-70">Số hiệu thùng thép</div>
                                            <div className="stat-value text-base font-semibold">{row.sl_meduc_so_hieu_thung_thep ?? '...'}</div>
                                          </div>
                                          <div className={`stat bg-base-50 rounded-xl border ${row.sl_meduc_so_hieu_thung_ttg == null ? 'border-red-400' : 'border-base-200'}`}>
                                            <div className="stat-title text-sm opacity-70">Số hiệu thùng TTG</div>
                                            <div className="stat-value text-base font-semibold">{row.sl_meduc_so_hieu_thung_ttg ?? '...'}</div>
                                          </div>
                                        </div>
                                      </div>
                                    </div>

                                    {/* Tiêu hao */}
                                    <div className="relative">
                                      <div className="absolute -top-3 left-3 bg-base-100 px-2 text-sm opacity-70">Tiêu hao</div>
                                      <div className="grid grid-cols-2 gap-3 rounded-xl bg-base-100 border border-base-300 p-3">
                                        <div className={`stat bg-base-50 rounded-xl border ${row.tieuhaonangluong_dien == null ? 'border-red-400' : 'border-base-200'}`}>
                                          <div className="stat-title text-sm opacity-70">Chỉ số điện (kWh)</div>
                                          <div className="stat-value text-base font-semibold">{row.tieuhaonangluong_dien ?? '...'}</div>
                                        </div>
                                        <div className={`stat bg-base-50 rounded-xl border ${row.tieuhaonangluong_nuoc == null ? 'border-red-400' : 'border-base-200'}`}>
                                          <div className="stat-title text-sm opacity-70">Chỉ số nước (m3)</div>
                                          <div className="stat-value text-base font-semibold">{row.tieuhaonangluong_nuoc ?? '...'}</div>
                                        </div>
                                      </div>
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
        </div>
      )}
    </div>
  );
};

export default StatisticPage;
