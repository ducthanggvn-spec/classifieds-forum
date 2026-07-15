"use client";

import Link from "next/link";
import { updatePassword } from "./actions";
import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";

export default function UpdatePasswordPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  // Check if we are actually authenticated via the recovery link
  useEffect(() => {
    const checkSession = async () => {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        // Look for tokens in hash (happens right after clicking email link)
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get("access_token");
        
        if (!accessToken) {
          setError("Liên kết đã hết hạn hoặc không hợp lệ. Vui lòng yêu cầu khôi phục lại.");
        }
      }
      setCheckingAuth(false);
    };
    
    checkSession();
  }, []);

  const handleSubmit = async (formData: FormData) => {
    setLoading(true);
    setError(null);
    const result = await updatePassword(formData);
    
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <div className="text-xs text-gray-500 mb-2">
        <Link href="/" className="hover:underline">Forums</Link> &gt; 
      </div>

      <h1 className="text-2xl font-bold text-primary dark:text-white mb-4">
        Tạo mật khẩu mới
      </h1>

      <div className="bg-white dark:bg-primary shadow-sm border border-border rounded-sm overflow-hidden">
        <div className="bg-secondary text-white text-sm font-bold px-4 py-2">
          Cập nhật mật khẩu
        </div>

        <div className="p-4 sm:p-6 bg-[#f5f5f5] dark:bg-muted/10">
          {checkingAuth ? (
            <div className="text-center p-8">Đang kiểm tra bảo mật...</div>
          ) : (
            <form action={handleSubmit} className="bg-white dark:bg-primary border border-border rounded-sm shadow-sm">
              {error && (
                <div className="p-3 text-sm text-red-600 bg-red-50 border-b border-border font-bold">
                  {error}
                </div>
              )}

              <div className="divide-y divide-border">
                <div className="p-4 bg-gray-50 dark:bg-muted/5 text-sm text-gray-700 dark:text-gray-300">
                  Vui lòng nhập mật khẩu mới cho tài khoản của bạn.
                </div>
                
                <div className="flex flex-col sm:flex-row p-4">
                  <div className="sm:w-1/3 sm:text-right pr-4 pb-2 sm:pb-0">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Mật khẩu mới:
                    </label>
                  </div>
                  <div className="sm:w-2/3">
                    <input
                      type="password"
                      name="password"
                      required
                      minLength={6}
                      className="w-full max-w-sm px-3 py-1.5 text-sm border border-border rounded-sm focus:outline-none focus:ring-1 focus:ring-secondary dark:bg-muted dark:text-white"
                      placeholder="Nhập mật khẩu..."
                    />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row p-4 bg-gray-50 dark:bg-muted/5">
                  <div className="sm:w-1/3 sm:text-right pr-4 pb-2 sm:pb-0">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Xác nhận mật khẩu:
                    </label>
                  </div>
                  <div className="sm:w-2/3">
                    <input
                      type="password"
                      name="confirmPassword"
                      required
                      minLength={6}
                      className="w-full max-w-sm px-3 py-1.5 text-sm border border-border rounded-sm focus:outline-none focus:ring-1 focus:ring-secondary dark:bg-muted dark:text-white"
                      placeholder="Nhập lại mật khẩu..."
                    />
                  </div>
                </div>

                <div className="p-4 flex flex-col sm:flex-row items-center justify-center">
                  <div className="sm:w-1/3"></div>
                  <div className="sm:w-2/3 flex flex-col items-start gap-3 w-full">
                    <button
                      type="submit"
                      disabled={loading || error !== null}
                      className="bg-[#245992] hover:bg-[#1a4370] text-white font-bold px-6 py-2 rounded-sm transition-colors disabled:opacity-50 text-sm shadow-sm border border-[#163a5f]"
                    >
                      {loading ? "Đang lưu..." : "Lưu mật khẩu mới"}
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
