"use client";

import Link from "next/link";
import { login, signup } from "./actions";
import { useState, useEffect } from "react";

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('tab') === 'register') {
        setIsLogin(false);
      }
    }
  }, []);

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (formData: FormData) => {
    setLoading(true);
    setError(null);
    const action = isLogin ? login : signup;
    const result = await action(formData);
    
    if (result?.error) {
      setError(result.error);
    }
    setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      {/* Breadcrumb (Optional, to match XenForo feel) */}
      <div className="text-xs text-gray-500 mb-2">
        <Link href="/" className="hover:underline">Forums</Link> &gt; 
      </div>

      <h1 className="text-2xl font-bold text-primary dark:text-white mb-4">
        {isLogin ? "Đăng nhập" : "Đăng ký tài khoản"}
      </h1>

      <div className="bg-white dark:bg-primary shadow-sm border border-border rounded-sm overflow-hidden">
        {/* Tabs */}
        <div className="bg-secondary text-white text-sm font-bold flex">
          <button 
            onClick={() => { setIsLogin(true); setError(null); }}
            className={`px-4 py-2 ${isLogin ? 'bg-[#1e4471] text-white' : 'hover:bg-white/10 text-blue-200'} transition-colors`}
          >
            Đăng nhập
          </button>
          <button 
            onClick={() => { setIsLogin(false); setError(null); }}
            className={`px-4 py-2 ${!isLogin ? 'bg-[#1e4471] text-white' : 'hover:bg-white/10 text-blue-200'} transition-colors`}
          >
            Đăng ký tài khoản mới
          </button>
        </div>

        <div className="p-4 sm:p-6 bg-[#f5f5f5] dark:bg-muted/10">
          <form action={handleSubmit} className="bg-white dark:bg-primary border border-border rounded-sm shadow-sm">
            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 border-b border-border font-bold">
                {error}
              </div>
            )}
            
            {typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('message') && (
              <div className="p-3 text-sm text-green-600 bg-green-50 border-b border-border font-bold">
                {new URLSearchParams(window.location.search).get('message')}
              </div>
            )}

            <div className="divide-y divide-border">
              {/* Field: Email */}
              <div className="flex flex-col sm:flex-row p-4">
                <div className="sm:w-1/3 sm:text-right pr-4 pb-2 sm:pb-0">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Email:
                  </label>
                  {!isLogin && <div className="text-[10px] text-gray-400 mt-1">Bắt buộc</div>}
                </div>
                <div className="sm:w-2/3">
                  <input
                    type="email"
                    name="email"
                    required
                    className="w-full max-w-sm px-3 py-1.5 text-sm border border-border rounded-sm focus:outline-none focus:ring-1 focus:ring-secondary dark:bg-muted dark:text-white"
                  />
                </div>
              </div>

              {/* Field: Password */}
              <div className="flex flex-col sm:flex-row p-4 bg-gray-50 dark:bg-muted/5">
                <div className="sm:w-1/3 sm:text-right pr-4 pb-2 sm:pb-0">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Mật khẩu:
                  </label>
                  {!isLogin && <div className="text-[10px] text-gray-400 mt-1">Bắt buộc</div>}
                </div>
                <div className="sm:w-2/3">
                  <input
                    type="password"
                    name="password"
                    required
                    className="w-full max-w-sm px-3 py-1.5 text-sm border border-border rounded-sm focus:outline-none focus:ring-1 focus:ring-secondary dark:bg-muted dark:text-white"
                  />
                  {isLogin && (
                    <div className="mt-2 text-xs">
                      <Link href="/forgot-password" className="text-secondary hover:underline">Quên mật khẩu?</Link>
                    </div>
                  )}
                </div>
              </div>

              {!isLogin && (
                <>
                  {/* Field: Nickname */}
                  <div className="flex flex-col sm:flex-row p-4">
                    <div className="sm:w-1/3 sm:text-right pr-4 pb-2 sm:pb-0">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Username:
                      </label>
                      <div className="text-[10px] text-gray-400 mt-1">Bắt buộc</div>
                    </div>
                    <div className="sm:w-2/3">
                      <input
                        type="text"
                        name="nickname"
                        required
                        className="w-full max-w-sm px-3 py-1.5 text-sm border border-border rounded-sm focus:outline-none focus:ring-1 focus:ring-secondary dark:bg-muted dark:text-white"
                      />
                      <p className="text-[11px] text-gray-500 mt-1">This is the name that will be shown with your messages. You may use any name you wish.</p>
                    </div>
                  </div>

                  {/* Field: BirthYear */}
                  <div className="flex flex-col sm:flex-row p-4 bg-gray-50 dark:bg-muted/5">
                    <div className="sm:w-1/3 sm:text-right pr-4 pb-2 sm:pb-0">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Năm sinh:
                      </label>
                      <div className="text-[10px] text-gray-400 mt-1">Bắt buộc</div>
                    </div>
                    <div className="sm:w-2/3">
                      <input
                        type="number"
                        name="birthYear"
                        required
                        min="1900"
                        max="2020"
                        className="w-24 px-3 py-1.5 text-sm border border-border rounded-sm focus:outline-none focus:ring-1 focus:ring-secondary dark:bg-muted dark:text-white text-center"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Submit Area */}
              <div className="p-4 flex flex-col sm:flex-row items-center justify-center bg-gray-50 dark:bg-muted/10">
                <div className="sm:w-1/3"></div>
                <div className="sm:w-2/3 flex flex-col items-start gap-3 w-full">
                  {!isLogin && (
                    <label className="flex items-center gap-2 text-xs text-gray-700 dark:text-gray-300 cursor-pointer">
                      <input type="checkbox" required className="rounded text-secondary" />
                      <span>I agree to the <Link href="#" className="text-secondary hover:underline">terms</Link> and <Link href="#" className="text-secondary hover:underline">privacy policy</Link>.</span>
                    </label>
                  )}
                  {isLogin && (
                    <label className="flex items-center gap-2 text-xs text-gray-700 dark:text-gray-300 cursor-pointer">
                      <input type="checkbox" className="rounded text-secondary" defaultChecked />
                      <span>Stay logged in</span>
                    </label>
                  )}
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-[#245992] hover:bg-[#1a4370] text-white font-bold px-6 py-2 rounded-sm transition-colors disabled:opacity-50 text-sm shadow-sm border border-[#163a5f]"
                  >
                    {loading ? "Đang xử lý..." : isLogin ? "Log in" : "Register"}
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
