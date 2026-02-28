import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { authApi } from '@obtp/api-client';

export default function ActivateAccountPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();

  const token = params.get('token');
  const [password, setPassword] = useState('');
   const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!token) {
      alert('Token không tồn tại.');
      return;
    }

    try {
      setLoading(true);

     const res = await authApi.activateAccount({
        token,
        newPassword: password,
        confirmNewPassword: confirmPassword,
      });

      login(res.accessToken, res.user);

      navigate('/admin');
    } catch (err: any) {
      alert(
        err?.response?.data?.message ||
          'Token không hợp lệ hoặc đã hết hạn.',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 40 }}>
      <h2>Kích hoạt tài khoản quản trị</h2>

      <input
        type="password"
        placeholder="Nhập mật khẩu mới"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <button onClick={handleSubmit} disabled={loading}>
        {loading ? 'Đang xử lý...' : 'Kích hoạt'}
      </button>
    </div>
  );
}