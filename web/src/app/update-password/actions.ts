"use server";

import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export async function updatePassword(formData: FormData) {
  const supabase = await createClient();
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!password || !confirmPassword) {
    return { error: "Vui lòng nhập đầy đủ thông tin" };
  }

  if (password !== confirmPassword) {
    return { error: "Mật khẩu xác nhận không khớp" };
  }

  if (password.length < 6) {
    return { error: "Mật khẩu phải có ít nhất 6 ký tự" };
  }

  const { error } = await supabase.auth.updateUser({
    password: password
  });

  if (error) {
    return { error: error.message };
  }

  redirect("/login?message=Password updated successfully");
}
