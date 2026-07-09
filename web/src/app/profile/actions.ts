"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateProfile(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Bạn phải đăng nhập để cập nhật hồ sơ." };
  }

  const fullName = formData.get("fullName");
  const birthYear = formData.get("birthYear");
  const phone = formData.get("phone");
  const signature = formData.get("signature");

  try {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || (typeof window !== "undefined" ? "/api" : "http://127.0.0.1:5000/api");
    const response = await fetch(`${API_URL}/users/${user.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        fullName,
        birthYear,
        phone,
        signature
      }),
    });

    const result = await response.json();

    if (!result.success) {
      return { error: result.error || "Có lỗi xảy ra từ máy chủ." };
    }

    revalidatePath("/profile");
    revalidatePath(`/user/${result.user?.nickname}`);
    
    return { success: true };
  } catch (error) {
    console.error("Update profile error:", error);
    return { error: "Không thể kết nối đến máy chủ." };
  }
}
