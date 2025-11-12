import React, { useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import axiosInstance from '../../services/axiosConfig';
import { apiRoutes } from '../../services/apiRoutes';
import { APPLICATION_CODE, DEVICE } from '../../configs/apiConfig';
import { useAuth } from './AuthProvider';

interface LoginFormProps {
  onSuccess: () => void;
  onForgotPassword: () => void;
  onRegister: () => void;
}

const LoginSchema = Yup.object().shape({
  email: Yup.string()
    .email('Email không hợp lệ')
    .required('Vui lòng nhập email'),
  password: Yup.string()
    .required('Vui lòng nhập mật khẩu')
});

const LoginForm: React.FC<LoginFormProps> = ({ onSuccess, onForgotPassword, onRegister }) => {
  const [error, setError] = useState<string | null>(null);
  const { login } = useAuth();

  const formik = useFormik({
    initialValues: {
      email: '',
      password: ''
    },
    validationSchema: LoginSchema,
    onSubmit: async (values) => {
      try {
        setError(null);
        console.log(values)
        const request_params = {
          "application.code": APPLICATION_CODE,
          "user.email": values.email,
          "user.password": values.password,
          "device": DEVICE
        }

        const response = await axiosInstance.post(apiRoutes.AUTH_LOGIN, request_params);
        console.log(response)
        if (response.data) {
          if (response.data.code === "OK") {
            login(response.data);
            onSuccess();
          } else {
            setError('Tên tài khoản hoặc mật khẩu không chính xác. Vui lòng thử lại');
          }
        } else {
          setError('Đăng nhập không thành công. Vui lòng thử lại.');
        }

      } catch (err: any) {
        setError(err.response?.data?.message || 'Đã xảy ra lỗi. Vui lòng thử lại sau.');
      }
    }
  });

  return (
    <div className="flex justify-center items-center">
      <form onSubmit={formik.handleSubmit} className="w-full">
        <fieldset className="fieldset bg-base-200 border-base-300 rounded-box w-xs border p-5">
          <legend className="fieldset-legend text-lg">Đăng nhập vào tài khoản</legend>

          <div className="mb-4">
            <label className="label text-left" htmlFor="email">Địa chỉ email</label>
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
              placeholder="Password"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.password}
            />
            {formik.touched.password && formik.errors.password ? (
              <div className="text-error text-sm mt-1">{formik.errors.password}</div>
            ) : null}
          </div>

          {error && <div className="alert alert-error mb-4">{error}</div>}

          <div className="text-right mb-4">
            <a onClick={onForgotPassword} className="text-blue-600 hover:text-blue-400 cursor-pointer">
              Quên mật khẩu?
            </a>
          </div>

          <button
            type="submit"
            className="btn main-button w-full"
            disabled={formik.isSubmitting}
          >
            {formik.isSubmitting ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>

          <div className="text-center mt-4">
            <p>
              Chưa có tài khoản?
              <a onClick={onRegister} className="text-primary ml-2 cursor-pointer">
                Đăng ký
              </a>
            </p>
          </div>
        </fieldset>
      </form>
    </div>
  );

}

export default LoginForm;