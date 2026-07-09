"use server";
import { serverFetch as fetch } from '@/utils/serverFetch';

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createPost(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Bạn phải đăng nhập để đăng bài." };
  }

  const citySlug = formData.get("citySlug");
  const title = formData.get("title");
  const content = formData.get("content");
  const postType = formData.get("postType");

  try {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || (typeof window !== "undefined" ? "/api" : "http://127.0.0.1:5000/api");
    const response = await fetch(`${API_URL}/posts`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        citySlug,
        listingType: postType,
        title,
        description: content,
      }),
    });

    const result = await response.json();

    if (!result.success) {
      return { error: result.error || "Có lỗi xảy ra từ máy chủ." };
    }

    revalidatePath(`/${citySlug}`);
    return { success: true, postId: result.data.id };
  } catch (error) {
    console.error("Fetch error:", error);
    return { error: "Không thể kết nối đến máy chủ." };
  }
}
