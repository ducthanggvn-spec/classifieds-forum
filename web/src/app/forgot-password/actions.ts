"use server";

import { createClient } from "@/utils/supabase/server";

export async function forgotPassword(formData: FormData) {
  const supabase = await createClient();
  const email = formData.get("email") as string;

  if (!email) {
    return { error: "Vui lòng nhập địa chỉ email" };
  }

  // Generate URL for resetting. Must match the domain.
  const origin = process.env.NEXT_PUBLIC_FRONTEND_URL || "http://localhost:3000";
  const resetUrl = `${origin}/update-password`;

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: resetUrl,
  });

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}
