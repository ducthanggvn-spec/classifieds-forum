"use client";

import { useState, useEffect } from "react";

export default function AdminTools({ currentUser }: { currentUser: any }) {
  const [users, setUsers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchedName, setSearchedName] = useState("");
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchLogs(); // Admin và Mod đều xem được log
    if (currentUser.role === "admin") {
      fetchUsers();
    } else {
      setLoading(false); 
    }
  }, [currentUser]);

  const fetchUsers = async () => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
      const res = await fetch(`${API_URL}/admin/users`, {
        headers: { "x-supabase-uid": currentUser.supabaseUid },
      });
      const data = await res.json();
      if (data.success) {
        setUsers(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchLogs = async () => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
      const res = await fetch(`${API_URL}/admin/logs`, {
        headers: { "x-supabase-uid": currentUser.supabaseUid },
      });
      const data = await res.json();
      if (data.success) {
        setLogs(data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleChangeRole = async (userId: number, newRole: string) => {
    if (!confirm(`Bạn có chắc muốn đổi quyền thành ${newRole}?`)) return;
    
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
      const res = await fetch(`${API_URL}/admin/users/${userId}/role`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-supabase-uid": currentUser.supabaseUid,
        },
        body: JSON.stringify({ role: newRole }),
      });
      const data = await res.json();
      if (data.success) {
        alert("Đổi quyền thành công");
        fetchUsers();
      } else {
        alert("Lỗi: " + data.error);
      }
    } catch (err) {
      alert("Lỗi kết nối");
    }
  };

  if (currentUser.role !== "admin" && currentUser.role !== "mod") {
    return null;
  }

  const handleSearch = () => {
    setSearchedName(searchQuery);
    setHasSearched(true);
    setSelectedUserId(null); // Bỏ chọn khi search mới
  };

  const filteredUsers = hasSearched && searchedName.trim() !== ""
    ? users.filter((u) => 
        u.nickname.toLowerCase().includes(searchedName.toLowerCase()) || 
        u.email.toLowerCase().includes(searchedName.toLowerCase())
      )
    : users;

  return (
    <div className="bg-white dark:bg-primary shadow rounded-lg p-6 mt-6 border-l-4 border-red-500">
      <h2 className="text-xl font-bold border-b border-border pb-2 mb-4 text-red-600 dark:text-red-400">
        Công cụ Quản trị ({currentUser.role.toUpperCase()})
      </h2>

      {currentUser.role === "mod" && (
        <div className="text-gray-600 dark:text-gray-300">
          <p>Bạn hiện là <strong>Moderator</strong>.</p>
          <p>Bạn có quyền Xóa/Ẩn các bài viết hoặc bình luận vi phạm trực tiếp trên giao diện của bài viết đó.</p>
        </div>
      )}

      {currentUser.role === "admin" && (
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Quản lý và cấp quyền cho thành viên trong diễn đàn.
          </p>

          {loading ? (
            <p>Đang tải danh sách...</p>
          ) : error ? (
            <p className="text-red-500">{error}</p>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-2 max-w-md">
                <input 
                  type="text" 
                  placeholder="Nhập Tên hoặc Email..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="flex-1 px-4 py-2 border border-border rounded focus:outline-none focus:ring-2 focus:ring-secondary dark:bg-primary dark:text-white"
                />
                <button 
                  onClick={handleSearch}
                  className="bg-[#1e4471] hover:bg-blue-800 text-white px-4 py-2 rounded font-bold whitespace-nowrap transition-colors"
                >
                  Tìm kiếm
                </button>
              </div>

              {hasSearched && searchedName && (
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  Kết quả tìm kiếm cho: <strong>"{searchedName}"</strong>
                  <button onClick={() => { setSearchQuery(""); setSearchedName(""); setHasSearched(false); setSelectedUserId(null); }} className="ml-4 text-blue-500 hover:underline">Xóa bộ lọc</button>
                </div>
              )}

              <div className="overflow-x-auto">
                <table className="min-w-full bg-white dark:bg-muted border border-border">
                <thead>
                  <tr className="bg-gray-100 dark:bg-primary text-left text-sm font-bold">
                    <th className="py-2 px-4 border-b border-border">ID</th>
                    <th className="py-2 px-4 border-b border-border">Nickname</th>
                    <th className="py-2 px-4 border-b border-border">Email</th>
                    <th className="py-2 px-4 border-b border-border">Chức vụ</th>
                    <th className="py-2 px-4 border-b border-border">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((u) => (
                    <tr 
                      key={u.id} 
                      onClick={() => { if (u.id !== currentUser.id) setSelectedUserId(u.id === selectedUserId ? null : u.id) }}
                      className={`text-sm border-b border-border transition-colors ${u.id !== currentUser.id ? 'cursor-pointer' : ''} ${selectedUserId === u.id ? 'bg-blue-50 dark:bg-blue-900/30' : 'hover:bg-gray-50 dark:hover:bg-primary/50'}`}
                    >
                      <td className="py-2 px-4">{u.id}</td>
                      <td className={`py-2 px-4 font-bold ${selectedUserId === u.id ? 'text-blue-700 dark:text-blue-300' : 'text-accent'}`}>{u.nickname}</td>
                      <td className="py-2 px-4">{u.email}</td>
                      <td className="py-2 px-4">
                        <span className={`px-2 py-1 rounded text-xs font-bold ${u.role === 'admin' ? 'bg-red-100 text-red-700' : u.role === 'mod' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                          {u.role.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-2 px-4">
                        {u.id === currentUser.id ? (
                          <span className="text-gray-400 text-xs italic">Bạn</span>
                        ) : selectedUserId === u.id ? (
                          <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-2">
                            <select 
                              value={u.role} 
                              onChange={(e) => handleChangeRole(u.id, e.target.value)}
                              onClick={(e) => e.stopPropagation()}
                              className="border border-blue-300 p-1 rounded text-xs dark:bg-primary text-blue-900 dark:text-white ring-2 ring-blue-500/20 focus:outline-none"
                            >
                              <option value="user">USER (Thành viên)</option>
                              <option value="mod">MOD (Quản lý)</option>
                              <option value="admin">ADMIN (Quản trị)</option>
                            </select>
                          </div>
                        ) : (
                          <span className="text-gray-400 text-xs hover:text-blue-500">Chỉ định ✎</span>
                        )}
                      </td>
                    </tr>
                  ))}
                  {filteredUsers.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-red-500 bg-red-50 dark:bg-red-900/10 font-medium">
                        Không tìm thấy thành viên nào khớp với "{searchedName}".
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
          )}
        </div>
      )}

      {/* Nhật ký quản trị (Cả Admin và Mod đều xem được) */}
      <div className="mt-8 space-y-4">
        <h3 className="text-lg font-bold border-b border-border pb-2 dark:text-white">
          Nhật ký Quản trị
        </h3>
        {logs.length === 0 ? (
          <p className="text-sm text-gray-500">Chưa có bản ghi nào.</p>
        ) : (
          <div className="overflow-x-auto max-h-96">
            <table className="min-w-full bg-white dark:bg-muted border border-border">
              <thead className="sticky top-0 bg-gray-100 dark:bg-primary z-10">
                <tr className="text-left text-xs font-bold">
                  <th className="py-2 px-4 border-b border-border">Thời gian</th>
                  <th className="py-2 px-4 border-b border-border">Người thực hiện</th>
                  <th className="py-2 px-4 border-b border-border">Hành động</th>
                  <th className="py-2 px-4 border-b border-border">Đối tượng</th>
                  <th className="py-2 px-4 border-b border-border">Lý do</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id} className="text-xs border-b border-border hover:bg-gray-50 dark:hover:bg-primary/50">
                    <td className="py-2 px-4 whitespace-nowrap text-gray-500">
                      {new Date(log.createdAt).toLocaleString("vi-VN")}
                    </td>
                    <td className="py-2 px-4 font-bold text-accent">
                      {log.mod?.nickname} <span className="text-gray-400 text-[10px]">({log.mod?.role})</span>
                    </td>
                    <td className="py-2 px-4 text-red-600 font-medium">
                      {log.action}
                    </td>
                    <td className="py-2 px-4 text-gray-600 dark:text-gray-300">
                      ID: {log.targetId} <br/>
                      <span className="italic">"{log.targetInfo}"</span>
                    </td>
                    <td className="py-2 px-4">
                      {log.reason}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
