"use client";

import Link from "next/link";
import { forgotPassword } from "./actions";
import { useState } from "react";

export default function ForgotPasswordPage() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (formData: FormData) => {
    setLoading(true);
    setError(null);
    const result = await forgotPassword(formData);
    
    if (result?.error) {
      setError(result.error);
    } else if (result?.success) {
      setSuccess(true);
    }
    setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <div className="text-xs text-gray-500 mb-2">
        <Link href="/" className="hover:underline">Forums</Link> &gt; 
        <Link href="/login" className="hover:underline ml-1">Đăng nhập</Link> &gt; 
      </div>

      <h1 className="text-2xl font-bold text-primary dark:text-white mb-4">
        Khôi phục mật khẩu
      </h1>

      <div className="bg-white dark:bg-primary shadow-sm border border-border rounded-sm overflow-hidden">
        <div className="bg-secondary text-white text-sm font-bold px-4 py-2">
          Quên mật khẩu
        </div>

        <div className="p-4 sm:p-6 bg-[#f5f5f5] dark:bg-muted/10">
          {success ? (
            <div className="bg-green-50 border border-green-200 text-green-700 p-6 text-center rounded-sm shadow-sm">
              <h2 className="text-xl font-bold mb-2">Đã gửi email khôi phục!</h2>
              <p>Vui lòng kiểm tra hòm thư của bạn (cả hộp thư rác) để lấy liên kết đổi mật khẩu.</p>
              <div className="mt-4">
                <Link href="/" className="text-secondary font-bold hover:underline">Quay lại trang chủ</Link>
              </div>
            </div>
          ) : (
            <form action={handleSubmit} className="bg-white dark:bg-primary border border-border rounded-sm shadow-sm">
              {error && (
                <div className="p-3 text-sm text-red-600 bg-red-50 border-b border-border font-bold">
                  {error}
                </div>
              )}

              <div className="divide-y divide-border">
                <div className="p-4 bg-gray-50 dark:bg-muted/5 text-sm text-gray-700 dark:text-gray-300">
                  Nếu bạn quên mật khẩu, hãy nhập địa chỉ email bạn đã sử dụng để đăng ký. Chúng tôi sẽ gửi cho bạn một liên kết để tạo mật khẩu mới.
                </div>
                
                <div className="flex flex-col sm:flex-row p-4">
                  <div className="sm:w-1/3 sm:text-right pr-4 pb-2 sm:pb-0">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Email đăng ký:
                    </label>
                  </div>
                  <div className="sm:w-2/3">
                    <input
                      type="email"
                      name="email"
                      required
                      className="w-full max-w-sm px-3 py-1.5 text-sm border border-border rounded-sm focus:outline-none focus:ring-1 focus:ring-secondary dark:bg-muted dark:text-white"
                      placeholder="Nhập email của bạn..."
                    />
                  </div>
                </div>

                <div className="p-4 flex flex-col sm:flex-row items-center justify-center bg-gray-50 dark:bg-muted/10">
                  <div className="sm:w-1/3"></div>
                  <div className="sm:w-2/3 flex flex-col items-start gap-3 w-full">
                    <button
                      type="submit"
                      disabled={loading}
                      className="bg-[#245992] hover:bg-[#1a4370] text-white font-bold px-6 py-2 rounded-sm transition-colors disabled:opacity-50 text-sm shadow-sm border border-[#163a5f]"
                    >
                      {loading ? "Đang gửi..." : "Gửi email khôi phục"}
                    </button>
                  </div>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
