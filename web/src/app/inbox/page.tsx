import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { serverFetch as fetch } from '@/utils/serverFetch';

export const metadata = {
  title: "Hộp thư đến | TTVNOL",
  description: "Hệ thống tin nhắn riêng tư",
};

export default async function InboxPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const API_URL = process.env.NEXT_PUBLIC_API_URL || (typeof window !== "undefined" ? "/api" : "http://127.0.0.1:5000/api");
  const res = await fetch(`${API_URL}/messages`, { cache: "no-store" });
  const result = res.ok ? await res.json() : { success: false, data: [] };
  const conversations = result.success ? result.data : [];

  return (
    <div className="bg-white dark:bg-primary shadow-sm border border-border mt-4 mb-6">
      <div className="bg-secondary text-white p-3 font-bold uppercase text-sm border-b border-border flex justify-between items-center">
        <span>Hộp thư đến</span>
      </div>

      <div className="divide-y divide-border">
        {conversations.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            Hộp thư của bạn đang trống.
          </div>
        ) : (
          conversations.map((cp: any) => {
            const convo = cp.conversation;
            const otherUser = convo.participants[0]?.user; // Vì API đã lọc bỏ chính mình
            const latestMsg = convo.messages[0];
            const isUnread = !cp.lastReadAt || new Date(convo.updatedAt) > new Date(cp.lastReadAt);

            return (
              <Link 
                href={`/inbox/${convo.id}`} 
                key={convo.id}
                className={`flex items-center p-3 sm:p-4 hover:bg-gray-50 dark:hover:bg-muted/10 transition-colors ${isUnread ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}`}
              >
                <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden shrink-0 flex items-center justify-center font-bold text-gray-500 mr-4 shadow-sm">
                  {otherUser?.avatarUrl ? (
                    <img src={otherUser.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    (otherUser?.nickname || '?').charAt(0).toUpperCase()
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className={`font-bold text-[15px] truncate pr-4 ${isUnread ? 'text-[#1e4471] dark:text-blue-400' : 'text-gray-800 dark:text-gray-200'}`}>
                      {convo.subject}
                    </h3>
                    <span className="text-xs text-gray-500 shrink-0 whitespace-nowrap">
                      {new Date(convo.updatedAt).toLocaleDateString('vi-VN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  
                  <div className="text-sm text-gray-600 dark:text-gray-400 truncate">
                    <span className="font-medium mr-1">{latestMsg?.sender?.nickname}:</span>
                    {latestMsg?.content}
                  </div>
                </div>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}
