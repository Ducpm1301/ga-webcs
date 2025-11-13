export type PXTKLike = {
  thongtincoban_ngay?: string;
  thongtincoban_truongca?: string;
  thongtincoban_thoigiansanxuat_gio?: unknown;
  thongtincoban_thoigiansanxuat_sonhanvien?: unknown;
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

const toNumber = (v: unknown): number => {
  if (typeof v === 'number') return v;
  if (typeof v === 'string') {
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
  }
  return 0;
};

export const summarizePXTK = (rows: PXTKLike[]) => {
  console.log({rows:rows});
  let total_gio = 0;
  let total_nv = 0;
  const normalized = rows.map((r) => {
    const gio = toNumber(r.thongtincoban_thoigiansanxuat_gio);
    const nv = toNumber(r.thongtincoban_thoigiansanxuat_sonhanvien);
    total_gio += gio;
    total_nv += nv;
    return {
      ...r,
      thongtincoban_thoigiansanxuat_gio: gio,
      thongtincoban_thoigiansanxuat_sonhanvien: nv,
    };
  });
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

