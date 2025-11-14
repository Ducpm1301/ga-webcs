export type PXTKLike = {
  thoigiansanxuat_ca: number;
  thongtincoban_ngay?: string;
  thongtincoban_truongca?: string;
  thongtincoban_thoigiansanxuat_gio?: unknown;
  thongtincoban_thoigiansanxuat_sonhanvien?: unknown;
  sanluongca_qtksanxuatthucte: number | null;
  sanluongca_qtksanglocao?: unknown;
  sanluongca_bui?: unknown;
  sanluongca_khoiluongphanlan1?: unknown;
  sanluongca_khoiluongphanlan2?: unknown;
  tieuhaonangluong_đien?: unknown;
  tieuhaonangluong_nuoc?: unknown;
  [key: string]: unknown;
};

export type PXLGLike = {
  thongtincoban_ngay?: string;
  thongtincoban_truongca?: string;
  thongtincoban_thoigiansanxuat_gio?: unknown;
  [key: string]: unknown;
};

export type PXLTLike = {
  thongtincoban_ngay?: string;
  thongtincoban_truongca?: string;
  thongtincoban_thoigiansanxuat_gio?: unknown;
  [key: string]: unknown;
};

export type PXTKTech = {
  thoigiansanxuat_ca: number;
  apsuatamtong: number | null;
  nhietdodiemhoa: number | null;
  apsuatamonggioso12: number | null;
  apluckhithan: number | null;
  domocuagio: number | null;
  mocthoidiem?: unknown;
}

const toNumber = (v: unknown): number => {
  if (typeof v === 'number') return v;
  if (typeof v === 'string') {
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
  }
  return 0;
};

const toTimestamp = (v: unknown): number => {
  if (typeof v === 'number') return v;
  if (typeof v === 'string') {
    // Try parse as numeric then as date string
    const asNum = Number(v);
    if (Number.isFinite(asNum)) return asNum;
    const asDate = Date.parse(v);
    return Number.isFinite(asDate) ? asDate : 0;
  }
  return 0;
};

export const summarizePXTK = (rows: PXTKLike[], techRows: PXTKTech[]) => {
  console.log({
    rows:rows,
    techRows:techRows,
  });
  let total_gio = 0;
  let total_nv = 0;

  // Lấy bản ghi công nghệ có 'mocthoidiem' lớn nhất (latest snapshot)
  let latestTech: PXTKTech | null = null;
  let latestTs = -Infinity;
  for (const t of techRows) {
    const ts = toTimestamp(t.mocthoidiem);
    if (ts >= latestTs) {
      latestTs = ts;
      latestTech = t;
    }
  }

  const normalized = rows.map((r) => {
    const gio = toNumber(r.thongtincoban_thoigiansanxuat_gio);
    const nv = toNumber(r.thongtincoban_thoigiansanxuat_sonhanvien);
    const qtk_thucte = r.sanluongca_qtksanxuatthucte == null ? null : toNumber(r.sanluongca_qtksanxuatthucte);
    const qtk_locao = r.sanluongca_qtksanglocao == null ? null : toNumber(r.sanluongca_qtksanglocao);
    const bui_ra = r.sanluongca_bui == null ? null : toNumber(r.sanluongca_bui);
    const kl_phan1 = r.sanluongca_khoiluongphanlan1 == null ? null : toNumber(r.sanluongca_khoiluongphanlan1);
    const kl_phan2 = r.sanluongca_khoiluongphanlan2 == null ? null : toNumber(r.sanluongca_khoiluongphanlan2);
    const chi_so_dien = r.tieuhaonangluong_đien == null ? null : toNumber(r.tieuhaonangluong_đien);
    const chi_so_nuoc = r.tieuhaonangluong_nuoc == null ? null : toNumber(r.tieuhaonangluong_nuoc);
    total_gio += gio;
    total_nv += nv;
    return {
      ...r,
      thongtincoban_thoigiansanxuat_gio: gio,
      thongtincoban_thoigiansanxuat_sonhanvien: nv,
      sanluongca_qtksanxuatthucte: qtk_thucte,
      sanluongca_qtksanglocao: qtk_locao,
      sanluongca_bui: bui_ra,
      sanluongca_khoiluongphanlan1: kl_phan1,
      sanluongca_khoiluongphanlan2: kl_phan2,
      tieuhaonangluong_đien: chi_so_dien,
      tieuhaonangluong_nuoc: chi_so_nuoc,
      // Kèm theo dữ liệu công nghệ mới nhất cho các ô tóm tắt PXTK
      apsuatamtong: latestTech?.apsuatamtong ?? null,
      nhietdodiemhoa: latestTech?.nhietdodiemhoa ?? null,
      apsuatamonggioso12: latestTech?.apsuatamonggioso12 ?? null,
      apluckhithan: latestTech?.apluckhithan ?? null,
      domocuagio: latestTech?.domocuagio ?? null,
    };
  });
  console.log(latestTech)
  return { rows: normalized, totals: { total_gio, total_nv } };
};

export const summarizePXLG = (rows: PXLGLike[]) => {
  let total_gio = 0;
  const normalized = rows.map((r) => {
    const gio = toNumber(r.thongtincoban_thoigiansanxuat_gio);
    total_gio += gio;
    return {
      ...r,
      thongtincoban_thoigiansanxuat_gio: gio,
    };
  });
  return { rows: normalized, totals: { total_gio } };
};

export const summarizePXLT = (rows: PXLTLike[]) => {
  let total_gio = 0;
  const normalized = rows.map((r) => {
    const gio = toNumber(r.thongtincoban_thoigiansanxuat_gio);
    total_gio += gio;
    return {
      ...r,
      thongtincoban_thoigiansanxuat_gio: gio,
    };
  });
  return { rows: normalized, totals: { total_gio } };
};

