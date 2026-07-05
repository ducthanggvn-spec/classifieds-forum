"use client";

import { useState } from "react";

export default function AdminDashboard({ currentUser, initialUsers, initialLogs }: { currentUser: any, initialUsers: any[], initialLogs: any[] }) {
  const [activeTab, setActiveTab] = useState<'users' | 'logs'>('users');
  const [users, setUsers] = useState(initialUsers);
  const [logs] = useState(initialLogs);

  const handleRoleChange = async (userId: number, newRole: string) => {
    if (!confirm(`Bạn có chắc chắn đổi quyền của user này thành ${newRole.toUpperCase()}?`)) return;
    
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
      const res = await fetch(`${API_URL}/admin/users/${userId}/role`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          "user-id": currentUser.id.toString()
        },
        body: JSON.stringify({ role: newRole })
      });
      const data = await res.json();
      if (data.success) {
        alert("Đổi quyền thành công");
        setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
      } else {
        alert(data.error || "Lỗi");
      }
    } catch (e) {
      alert("Lỗi kết nối");
    }
  };

  return (
    <div>
      <div className="flex gap-2 border-b border-border mb-6">
        {currentUser.role === 'admin' && (
          <button 
            className={`px-4 py-2 font-bold ${activeTab === 'users' ? 'bg-[#245992] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'} rounded-t`}
            onClick={() => setActiveTab('users')}
          >
            Thành viên
          </button>
        )}
        <button 
          className={`px-4 py-2 font-bold ${activeTab === 'logs' ? 'bg-[#245992] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'} rounded-t`}
          onClick={() => setActiveTab('logs')}
        >
          Nhật ký Kiểm duyệt
        </button>
      </div>

      {activeTab === 'users' && currentUser.role === 'admin' && (
        <div className="bg-white dark:bg-primary shadow-sm border border-border rounded overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-100 dark:bg-muted border-b border-border">
              <tr>
                <th className="p-3">ID</th>
                <th className="p-3">Nickname</th>
                <th className="p-3">Role</th>
                <th className="p-3">Số bài</th>
                <th className="p-3 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {users.map(u => (
                <tr key={u.id} className="hover:bg-gray-50 dark:hover:bg-muted/50">
                  <td className="p-3">{u.id}</td>
                  <td className="p-3 font-bold">{u.nickname}</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${u.role === 'admin' ? 'bg-red-100 text-red-700' : u.role === 'mod' ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-700'}`}>
                      {u.role.toUpperCase()}
                    </span>
                  </td>
                  <td className="p-3">{u.postCount}</td>
                  <td className="p-3 text-right">
                    {u.id !== currentUser.id && (
                      <select 
                        value={u.role} 
                        onChange={(e) => handleRoleChange(u.id, e.target.value)}
                        className="border border-gray-300 rounded px-2 py-1 text-xs"
                      >
                        <option value="user">USER</option>
                        <option value="mod">MOD</option>
                        <option value="admin">ADMIN</option>
                      </select>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'logs' && (
        <div className="bg-white dark:bg-primary shadow-sm border border-border rounded overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-100 dark:bg-muted border-b border-border">
              <tr>
                <th className="p-3">Thời gian</th>
                <th className="p-3">Người thực hiện</th>
                <th className="p-3">Hành động</th>
                <th className="p-3">Lý do</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {logs.map(log => (
                <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-muted/50">
                  <td className="p-3 whitespace-nowrap text-gray-500">
                    {new Date(log.createdAt).toLocaleString('vi-VN')}
                  </td>
                  <td className="p-3 font-bold text-blue-600">{log.mod.nickname}</td>
                  <td className="p-3">
                    <span className="font-bold text-red-600">{log.action}</span>
                    <div className="text-xs text-gray-500 max-w-xs truncate">{log.targetInfo}</div>
                  </td>
                  <td className="p-3 text-gray-600">{log.reason}</td>
                </tr>
              ))}
              {logs.length === 0 && (
                <tr><td colSpan={4} className="p-8 text-center text-gray-500">Chưa có bản ghi nào.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
