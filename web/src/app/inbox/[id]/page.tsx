import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import ReplyForm from "./ReplyForm";
import BBCodeRenderer from "@/components/BBCodeRenderer";

export const metadata = {
  title: "Đọc tin nhắn | TTVNOL",
};

export default async function ConversationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const API_URL = process.env.NEXT_PUBLIC_API_URL || (typeof window !== "undefined" ? "/api" : "http://127.0.0.1:5000/api");
  const res = await fetch(`${API_URL}/messages/${id}?supabaseUid=${user.id}`, { cache: "no-store" });
  const result = res.ok ? await res.json() : { success: false, data: null, error: "Không tải được dữ liệu" };
  
  if (!result.success || !result.data) {
    return (
      <div className="bg-white dark:bg-primary shadow-sm border border-border mt-4 mb-6 p-8 text-center">
        <p className="text-red-500 font-bold mb-4">{result.error || "Hội thoại không tồn tại hoặc bạn không có quyền truy cập."}</p>
        <Link href="/inbox" className="text-blue-600 hover:underline">&laquo; Quay lại Hộp thư</Link>
      </div>
    );
  }

  const convo = result.data;

  return (
    <div className="space-y-4 my-4">
      <div className="flex items-center gap-2 mb-2 text-sm text-gray-500">
        <Link href="/inbox" className="text-blue-600 hover:underline font-bold">Hộp thư</Link>
        <span>&rsaquo;</span>
        <span>{convo.subject}</span>
      </div>

      <div className="bg-white dark:bg-primary border border-border shadow-sm rounded-sm overflow-hidden">
        <div className="bg-secondary text-white p-3 border-b border-border font-bold text-[15px]">
          {convo.subject}
        </div>

        <div className="divide-y divide-gray-100 dark:divide-gray-800 max-h-[60vh] overflow-y-auto">
          {convo.messages.map((msg: any) => (
            <div key={msg.id} className="p-4 flex gap-4">
              <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden shrink-0 shadow-sm flex items-center justify-center font-bold text-gray-500">
                {msg.sender.avatarUrl ? (
                  <img src={msg.sender.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  (msg.sender.nickname || '?').charAt(0).toUpperCase()
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-end mb-2">
                  <Link href={`/user/${msg.sender.nickname}`} className="font-bold text-[#1e4471] dark:text-blue-400 hover:underline">
                    {msg.sender.nickname}
                  </Link>
                  <span className="text-[11px] text-gray-500">
                    {new Date(msg.createdAt).toLocaleString('vi-VN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div className="text-sm text-gray-800 dark:text-gray-200">
                  <BBCodeRenderer content={msg.content} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <ReplyForm conversationId={id} currentUserSupabaseUid={user.id} />
    </div>
  );
}
