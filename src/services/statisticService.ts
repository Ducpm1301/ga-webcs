export type PXTKLike = {
  thoigiansanxuat_ca: number;
  thongtincoban_ngay?: string;
  thongtincoban_truongca?: string;
  thongtincoban_thoigiansanxuat_gio?: unknown;
  thongtincoban_thoigiansanxuat_sonhanvien?: unknown;
  sanluongca_qtksanxuatthucte: number | null;
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

export type PXTKAnalytics = {
  danhgia_doamlieuhonhop: number | null;
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

export const summarizePXTK = (rows: PXTKLike[], techRows: PXTKTech[], analyticsRows: PXTKAnalytics[]) => {
  console.log({
    rows:rows,
    techRows:techRows,
    analyticsRows:analyticsRows
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
    total_gio += gio;
    total_nv += nv;
    return {
      ...r,
      thongtincoban_thoigiansanxuat_gio: gio,
      thongtincoban_thoigiansanxuat_sonhanvien: nv,
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

