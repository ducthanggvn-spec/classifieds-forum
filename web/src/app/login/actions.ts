"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

export async function login(formData: FormData) {
  const supabase = await createClient();

  const data = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  const { error } = await supabase.auth.signInWithPassword(data);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/", "layout");
  redirect("/");
}

export async function signup(formData: FormData) {
  const supabase = await createClient();

  const data = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
    options: {
      data: {
        full_name: formData.get("email")?.toString().split("@")[0], // Mặc định lấy tên từ email
        nickname: formData.get("nickname"), // Lưu nickname
        birth_year: formData.get("birthYear"), // Lưu năm sinh
      },
    },
  };

  const { error } = await supabase.auth.signUp(data);

  if (error) {
    return { error: error.message };
  }

  // Gọi sang Express Backend để tạo row trong bảng User của Prisma
  if (data.email) {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || (typeof window !== "undefined" ? "/api" : "http://127.0.0.1:5000/api");
      
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await fetch(`${API_URL}/users/sync`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            supabaseUid: user.id,
            email: data.email,
            nickname: data.options?.data?.nickname,
            fullName: data.options?.data?.full_name,
            birthYear: data.options?.data?.birth_year,
          })
        });
      }
    } catch (err) {
      console.error("Lỗi đồng bộ Backend:", err);
    }
  }

  revalidatePath("/", "layout");
  redirect("/");
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}
