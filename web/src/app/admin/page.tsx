import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import AdminDashboard from "./AdminDashboard";

export const metadata = {
  title: "Admin Dashboard | TTVNOL",
  description: "Bảng điều khiển quản trị viên",
};

export default async function AdminPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
  
  // Lấy thông tin user từ DB để check role
  const userRes = await fetch(`${API_URL}/users/${user.id}`, { cache: "no-store" });
  if (!userRes.ok) redirect("/");
  
  const dbUser = await userRes.json();
  if (dbUser.role !== 'admin' && dbUser.role !== 'mod') {
    redirect("/"); // Cấm truy cập nếu không phải admin/mod
  }

  // Lấy danh sách users (Chỉ admin)
  let users = [];
  if (dbUser.role === 'admin') {
    const usersRes = await fetch(`${API_URL}/admin/users`, { 
      headers: { "user-id": dbUser.id.toString() }, // Giả lập middleware auth
      cache: "no-store" 
    });
    if (usersRes.ok) {
      const data = await usersRes.json();
      users = data.data || [];
    }
  }

  // Lấy Moderation Logs
  let logs = [];
  const logsRes = await fetch(`${API_URL}/admin/logs`, { 
    headers: { "user-id": dbUser.id.toString() },
    cache: "no-store" 
  });
  if (logsRes.ok) {
    const data = await logsRes.json();
    logs = data.data || [];
  }

  return (
    <div className="max-w-6xl mx-auto my-6">
      <h1 className="text-2xl font-bold text-primary dark:text-blue-400 mb-6 border-b border-border pb-2">
        Bảng điều khiển {dbUser.role === 'admin' ? 'Quản Trị Viên (Admin)' : 'Điều Hành Viên (Mod)'}
      </h1>
      <AdminDashboard currentUser={dbUser} initialUsers={users} initialLogs={logs} />
    </div>
  );
}
