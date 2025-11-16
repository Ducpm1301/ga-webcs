# task 1: Refine Default Layout:
## Task 1.1:
- There's a avatar in line 26 of src/components/layouts/Navbar.tsx. When press on it, I want to have a small dropdown menu to show user information and logout option.

# Task 2: Basis Statistic layout:
- I have a statistic page in src/pages/Statistic.tsx.
- When user login, the API will response as API 1.1 in docx/api.md. The partners then being saved in local storage. Further detail can be seen in src/components/auth/AuthProvider.tsx:47.
- After the login finished, there'll be a popup to ask user to select a partner to be seen. The selected partner will be saved in local storage (Further info in AuthProvider, login function). In the main layout, the selected partner will be shown in the navbar, in a select dropdown, which can be used to switch between partners.
- The partner code will then be used in the API request. Further detail about the API request can be seen in docx/api.md and src/services/apiRoutes.ts (Last 3 routes).
- After the partner is selected, in the Statistic page, the user can see the summary of the selected partner. The summary will be shown in 3 tables: PXTK, PXLG, PXLT.
## Task 2.1: Set default headers for summary table
- In the summary table, the headers will be shown in the first row. define the default data as shown in docx/img/tongketcapxlt.png:
- PXTK: docx/img/tongketcapxtk.png
- PXLG: docx/img/tongketcapxlg.png
- PXLT: docx/img/tongketcapxlt.png
If the API return empty data, the table will show "Không có dữ liệu" in the first row. And no other data will be shown.
## Task 2.2 Set data to summary of PXTK:
- dữ liệu cho các ô:
 - Tổng áp suất: API 1.5, lấy giá trị của trường 'apsuatamtong' của bản ghi có 'mocthoidiem' lớn nhất.
 - Nhiệt độ điểm hoá: API 1.5, lấy giá trị của trường 'nhietdodiemhoa' của bản ghi có 'mocthoidiem' lớn nhất.
 - Áp lực khí than: API 1.5, lấy giá trị của trường 'apluckhithan' của bản ghi có 'mocthoidiem' lớn nhất.
 - Độ mở gió: API 1.5, lấy giá trị của trường 'domocuagio' của bản ghi có 'mocthoidiem' lớn nhất.

## Task 2.3 Set data to summary of PXLG:
- dữ liệu cho các ô:
 {
    Ngày làm việc: API 1.3, trường thongtincoban_ngay,
    Ca: API 1.3, trường thongtincoban_ca,
    Giờ hoạt động: API 1.3, trường thongtincoban_thoigiansanxuat_gio,
    Trưởng ca: API 1.3, trường thongtincoban_truongca,
    Số lượng nhân viên: API 1.3, trường thongtincoban_thoigiansanxuat_sonhanvien,
	Nguyên liệu: {
		Lũy kế số mẻ liệu đầu ca: API 1.3, trường tonghop_sx_luy_ke_so_me_lieu_dau_ca
	},
	Sản lượng & bán thành phẩm: {
		Gang Mê (Tấn): API 1.3, trường sl_ban_thanhpham_me_gang_tan
		Xi Hạt (Tấn): API 1.3, trường sl_ban_thanhpham_xi_hat_tan
		Xi Khô (Tấn): API 1.3, trường sl_ban_thanhpham_xi_kho_tan
		Lũy kế số mẻ ra gang đầu ca: API 1.3, trường tonghop_sx_luy_ke_so_me_gang_dau_ca
	},
	Tiêu hao: {
		Chỉ số điện (kWh): API 1.3, trường tieuhaonangluong_dien
		Chỉ số nước (m3): API 1.3, trường tieuhaonangluong_nuoc
	}
}
Làm cấu trúc khung tương tự như PXTK, kể cả tab stats.

## Task 2.4 Set data to summary of PXLT:
- dữ liệu cho các ô:
 {
    Ngày làm việc: API 1.4, trường thongtincoban_ngay,
    Ca: API 1.4, trường thongtincoban_ca,
    Giờ hoạt động: API 1.4, trường thongtincoban_thoigiansanxuat_gio,
    Trưởng ca: API 1.4, trường thongtincoban_truongca,
    Số lượng nhân viên: API 1.4, trường thongtincoban_thoigiansanxuat_sonhanvien,
	Nguyên liệu & hợp kim {
        Số thứ tự mẻ thép: {
            Thứ tự mẻ theo ngày: ,
            Thứ tự mẻ theo năm: ,
            Thứ tự theo thể xây: ,
        },
        Thông số sản xuất {
            Nhiệt độ bình quân: ,
        }
    },
    Sản lượng {
        Thông tin mẻ đúc: {
            Thứ tự mẻ theo ngày: ,
            Thứ tự mẻ theo năm: ,
            Thứ tự mẻ theo TTG: ,
            Số hiệu thùng thép: ,
            Số hiệu thùng TTG: ,
        }
    },
    Tiêu hao {
        Chỉ số điện (kWh): API 1.4, trường tieuhaonangluong_dien,
        Chỉ số nước (m3): API 1.4, trường tieuhaonangluong_nuoc,
    }
}
Làm cấu trúc khung tương tự như PXTK, kể cả tab stats. Với các đầu mục lớn trong PXLT, như Nguyên liệu & hợp kim, Sản lượng, Tiêu hao, hãy lấy ví dụ từ docx/img/tabexample.png.
