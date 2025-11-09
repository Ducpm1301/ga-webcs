import React, { useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import axiosInstance from '../../services/axiosConfig';
import { apiRoutes } from '../../services/apiRoutes';

interface ForgotPasswordFormProps {
  onSuccess: () => void;
  onBackToLogin: () => void;
}

const ForgotPasswordSchema = Yup.object().shape({
  email: Yup.string()
    .email('Email không hợp lệ')
    .required('Vui lòng nhập email')
});

const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({ onSuccess, onBackToLogin }) => {
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  const formik = useFormik({
    initialValues: {
      email: ''
    },
    validationSchema: ForgotPasswordSchema,
    onSubmit: async (values) => {
      try {
        setError(null);
        await axiosInstance.post(apiRoutes.AUTH_FORGOT_PASSWORD, values);
        setSuccessMessage('Hướng dẫn đặt lại mật khẩu đã được gửi đến email của bạn.');
        setTimeout(() => {
          onSuccess();
        }, 3000);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Đã xảy ra lỗi. Vui lòng thử lại sau.');
      }
    }
  });

  return (
    <div className="flex justify-center items-center">
      <form onSubmit={formik.handleSubmit} className="w-full">
        <fieldset className="fieldset bg-base-200 border-base-300 rounded-box w-xs border p-4">
          <legend className="fieldset-legend">Quên mật khẩu</legend>
          
          {successMessage ? (
            <div className="alert alert-success mb-4">{successMessage}</div>
          ) : (
            <>
              <div className="mb-4">
                <p className="text-sm mb-4">Nhập địa chỉ email của bạn và chúng tôi sẽ gửi hướng dẫn đặt lại mật khẩu.</p>
                
                <label className="label" htmlFor="email">Email</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  className="input w-full"
                  placeholder="Nhập email của bạn"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.email}
                />
                {formik.touched.email && formik.errors.email ? (
                  <div className="text-error text-sm mt-1">{formik.errors.email}</div>
                ) : null}
              </div>

              {error && <div className="alert alert-error mb-4">{error}</div>}

              <button 
            type="submit" 
            className="btn main-button text-white w-full" 
            disabled={formik.isSubmitting}
          >
                {formik.isSubmitting ? 'Đang gửi...' : 'Gửi yêu cầu'}
              </button>
            </>
          )}
          
          <div className="text-center mt-4">
            <button type="button" className="hover:text-[#21e40fef] cursor-pointer" onClick={onBackToLogin}>
              Quay lại đăng nhập
            </button>
          </div>
        </fieldset>
      </form>
    </div>
  );
}

export default ForgotPasswordForm;
