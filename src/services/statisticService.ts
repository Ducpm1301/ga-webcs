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
  thongtincoban_ca?: unknown;
  thongtincoban_thoigiansanxuat_sonhanvien?: unknown;
  tonghop_sx_luy_ke_so_me_lieu_dau_ca?: unknown;
  sl_ban_thanhpham_me_gang_tan?: unknown;
  sl_ban_thanhpham_xi_hat_tan?: unknown;
  sl_ban_thanhpham_xi_kho_tan?: unknown;
  tonghop_sx_luy_ke_so_me_gang_dau_ca?: unknown;
  tieuhaonangluong_dien?: unknown;
  tieuhaonangluong_nuoc?: unknown;
  [key: string]: unknown;
};

export type PXLTLike = {
  thongtincoban_ngay?: string;
  thongtincoban_truongca?: string;
  thongtincoban_thoigiansanxuat_gio?: unknown;
  thongtincoban_ca?: unknown;
  thongtincoban_thoigiansanxuat_sonhanvien?: unknown;
  // Nguyên liệu & hợp kim
  nguyenlieu_thutu_me_ngay?: unknown;
  nguyenlieu_thutu_me_nam?: unknown;
  nguyenlieu_thutu_me_thexay?: unknown;
  nguyenlieu_thongsosx_nhietdo_binhquan_c?: unknown;
  // Sản lượng - Thông tin mẻ đúc
  sl_meduc_thutu_me_theo_ngay?: unknown;
  sl_meduc_thutu_me_theo_nam?: unknown;
  sl_meduc_thutu_me_theo_ttg?: unknown;
  sl_meduc_so_hieu_thung_thep?: unknown;
  sl_meduc_so_hieu_thung_ttg?: unknown;
  // Tiêu hao
  tieuhaonangluong_dien?: unknown;
  tieuhaonangluong_nuoc?: unknown;
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
    const ca = toNumber(r.thongtincoban_ca);
    const gio = toNumber(r.thongtincoban_thoigiansanxuat_gio);
    const nv = toNumber(r.thongtincoban_thoigiansanxuat_sonhanvien);

    const me_lieu_dau_ca = r.tonghop_sx_luy_ke_so_me_lieu_dau_ca == null ? null : toNumber(r.tonghop_sx_luy_ke_so_me_lieu_dau_ca);
    const me_gang_dau_ca = r.tonghop_sx_luy_ke_so_me_gang_dau_ca == null ? null : toNumber(r.tonghop_sx_luy_ke_so_me_gang_dau_ca);
    const me_gang_tan = r.sl_ban_thanhpham_me_gang_tan == null ? null : toNumber(r.sl_ban_thanhpham_me_gang_tan);
    const xi_hat_tan = r.sl_ban_thanhpham_xi_hat_tan == null ? null : toNumber(r.sl_ban_thanhpham_xi_hat_tan);
    const xi_kho_tan = r.sl_ban_thanhpham_xi_kho_tan == null ? null : toNumber(r.sl_ban_thanhpham_xi_kho_tan);
    const dien = r.tieuhaonangluong_dien == null ? null : toNumber(r.tieuhaonangluong_dien);
    const nuoc = r.tieuhaonangluong_nuoc == null ? null : toNumber(r.tieuhaonangluong_nuoc);

    total_gio += gio;

    return {
      ...r,
      thongtincoban_ca: ca,
      thongtincoban_thoigiansanxuat_gio: gio,
      thongtincoban_thoigiansanxuat_sonhanvien: nv,
      tonghop_sx_luy_ke_so_me_lieu_dau_ca: me_lieu_dau_ca,
      tonghop_sx_luy_ke_so_me_gang_dau_ca: me_gang_dau_ca,
      sl_ban_thanhpham_me_gang_tan: me_gang_tan,
      sl_ban_thanhpham_xi_hat_tan: xi_hat_tan,
      sl_ban_thanhpham_xi_kho_tan: xi_kho_tan,
      tieuhaonangluong_dien: dien,
      tieuhaonangluong_nuoc: nuoc,
    };
  });
  return { rows: normalized, totals: { total_gio } };
};

export const summarizePXLT = (rows: PXLTLike[]) => {
  let total_gio = 0;
  const normalized = rows.map((r) => {
    const ca = toNumber(r.thongtincoban_ca);
    const gio = toNumber(r.thongtincoban_thoigiansanxuat_gio);
    const nv = toNumber(r.thongtincoban_thoigiansanxuat_sonhanvien);

    // Nguyên liệu & hợp kim
    const me_ngay = r.nguyenlieu_thutu_me_ngay == null ? null : toNumber(r.nguyenlieu_thutu_me_ngay);
    const me_nam = r.nguyenlieu_thutu_me_nam == null ? null : toNumber(r.nguyenlieu_thutu_me_nam);
    const me_thexay = r.nguyenlieu_thutu_me_thexay == null ? null : toNumber(r.nguyenlieu_thutu_me_thexay);
    const nhietdo_bq = r.nguyenlieu_thongsosx_nhietdo_binhquan_c == null ? null : toNumber(r.nguyenlieu_thongsosx_nhietdo_binhquan_c);

    // Sản lượng - mẻ đúc
    const sl_ngay = r.sl_meduc_thutu_me_theo_ngay == null ? null : toNumber(r.sl_meduc_thutu_me_theo_ngay);
    const sl_nam = r.sl_meduc_thutu_me_theo_nam == null ? null : toNumber(r.sl_meduc_thutu_me_theo_nam);
    const sl_ttg = r.sl_meduc_thutu_me_theo_ttg == null ? null : toNumber(r.sl_meduc_thutu_me_theo_ttg);
    const thung_thep = r.sl_meduc_so_hieu_thung_thep == null ? null : toNumber(r.sl_meduc_so_hieu_thung_thep);
    const thung_ttg = r.sl_meduc_so_hieu_thung_ttg == null ? null : toNumber(r.sl_meduc_so_hieu_thung_ttg);

    // Tiêu hao
    const dien = r.tieuhaonangluong_dien == null ? null : toNumber(r.tieuhaonangluong_dien);
    const nuoc = r.tieuhaonangluong_nuoc == null ? null : toNumber(r.tieuhaonangluong_nuoc);

    total_gio += gio;

    return {
      ...r,
      thongtincoban_ca: ca,
      thongtincoban_thoigiansanxuat_gio: gio,
      thongtincoban_thoigiansanxuat_sonhanvien: nv,
      // Nguyên liệu & hợp kim
      nguyenlieu_thutu_me_ngay: me_ngay,
      nguyenlieu_thutu_me_nam: me_nam,
      nguyenlieu_thutu_me_thexay: me_thexay,
      nguyenlieu_thongsosx_nhietdo_binhquan_c: nhietdo_bq,
      // Sản lượng - mẻ đúc
      sl_meduc_thutu_me_theo_ngay: sl_ngay,
      sl_meduc_thutu_me_theo_nam: sl_nam,
      sl_meduc_thutu_me_theo_ttg: sl_ttg,
      sl_meduc_so_hieu_thung_thep: thung_thep,
      sl_meduc_so_hieu_thung_ttg: thung_ttg,
      // Tiêu hao
      tieuhaonangluong_dien: dien,
      tieuhaonangluong_nuoc: nuoc,
    };
  });
  return { rows: normalized, totals: { total_gio } };
};

