"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function editPost(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Bạn phải đăng nhập để sửa bài." };
  }

  const postId = formData.get("postId");
  const citySlug = formData.get("citySlug");
  const title = formData.get("title");
  const content = formData.get("content");
  const postType = formData.get("postType");

  try {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || (process.env.NODE_ENV === "production" ? "https://classifieds-forum.onrender.com/api" : "http://localhost:5000/api");
    const response = await fetch(`${API_URL}/posts/${postId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "x-supabase-uid": user.id
      },
      body: JSON.stringify({
        postType,
        title,
        description: content,
      }),
    });

    const result = await response.json();

    if (!result.success) {
      return { error: result.error || "Có lỗi xảy ra từ máy chủ." };
    }

    revalidatePath(`/${citySlug}`);
    revalidatePath(`/${citySlug}/post/${postId}`);
    return { success: true };
  } catch (error) {
    console.error("Fetch error:", error);
    return { error: "Không thể kết nối đến máy chủ." };
  }
}
