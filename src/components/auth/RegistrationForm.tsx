import React, { useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import axiosInstance from '../../services/axiosConfig';
import { apiRoutes } from '../../services/apiRoutes';

interface RegistrationFormProps {
  onSuccess: () => void;
  onBackToLogin: () => void;
}

const RegistrationSchema = Yup.object().shape({
  fullName: Yup.string()
    .required('Vui lòng nhập họ và tên'),
  email: Yup.string()
    .email('Email không hợp lệ')
    .required('Vui lòng nhập email'),
  password: Yup.string()
    .min(6, 'Mật khẩu phải có ít nhất 6 ký tự')
    .required('Vui lòng nhập mật khẩu'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password')], 'Mật khẩu không khớp')
    .required('Vui lòng xác nhận mật khẩu')
});

const RegistrationForm: React.FC<RegistrationFormProps> = ({ onSuccess, onBackToLogin }) => {
  const [error, setError] = useState<string | null>(null);
  
  const formik = useFormik({
    initialValues: {
      fullName: '',
      email: '',
      password: '',
      confirmPassword: ''
    },
    validationSchema: RegistrationSchema,
    onSubmit: async (values) => {
      try {
        setError(null);
        const response = await axiosInstance.post(apiRoutes.AUTH_REGISTER, {
          fullName: values.fullName,
          email: values.email,
          password: values.password
        });
        
        if (response.data && response.data.token) {
          localStorage.setItem('token', response.data.token);
          onSuccess();
        } else {
          setError('Đăng ký không thành công. Vui lòng thử lại.');
        }
      } catch (err: any) {
        setError(err.response?.data?.message || 'Đã xảy ra lỗi. Vui lòng thử lại sau.');
      }
    }
  });

  return (
    <div className="flex justify-center items-center">
      <form onSubmit={formik.handleSubmit} className="w-full">
        <fieldset className="fieldset bg-base-200 border-base-300 rounded-box w-xs border p-4">
          <legend className="fieldset-legend">Tạo tài khoản mới</legend>

          <div className="mb-4">
            <label className="label" htmlFor="fullName">Họ và tên</label>
            <input
              id="fullName"
              name="fullName"
              type="text"
              className="input w-full"
              placeholder="Họ và tên"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.fullName}
            />
            {formik.touched.fullName && formik.errors.fullName ? (
              <div className="text-error text-sm mt-1">{formik.errors.fullName}</div>
            ) : null}
          </div>

          <div className="mb-4">
            <label className="label" htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              className="input w-full"
              placeholder="Email"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.email}
            />
            {formik.touched.email && formik.errors.email ? (
              <div className="text-error text-sm mt-1">{formik.errors.email}</div>
            ) : null}
          </div>

          <div className="mb-4">
            <label className="label" htmlFor="password">Mật khẩu</label>
            <input
              id="password"
              name="password"
              type="password"
              className="input w-full"
              placeholder="Mật khẩu"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.password}
            />
            {formik.touched.password && formik.errors.password ? (
              <div className="text-error text-sm mt-1">{formik.errors.password}</div>
            ) : null}
          </div>

          <div className="mb-4">
            <label className="label" htmlFor="confirmPassword">Xác nhận mật khẩu</label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              className="input w-full"
              placeholder="Xác nhận mật khẩu"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.confirmPassword}
            />
            {formik.touched.confirmPassword && formik.errors.confirmPassword ? (
              <div className="text-error text-sm mt-1">{formik.errors.confirmPassword}</div>
            ) : null}
          </div>

          {error && <div className="alert alert-error mb-4">{error}</div>}

          <button 
            type="submit" 
            className="btn main-button w-full" 
            disabled={formik.isSubmitting}
          >
            {formik.isSubmitting ? 'Đang đăng ký...' : 'Đăng ký'}
          </button>
          
          <div className="text-center mt-4">
            <button type="button"  onClick={onBackToLogin}  className="hover:text-[#21e40fef] cursor-pointer">
              Đã có tài khoản? Đăng nhập
            </button>
          </div>
        </fieldset>
      </form>
    </div>
  );

};

export default RegistrationForm;