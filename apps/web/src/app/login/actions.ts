"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const loginSchema = z.object({
  email: z.email().trim(),
  password: z.string().min(8).max(128),
  next: z.string().trim().optional(),
});

function resolveLoginRedirect(nextPath?: string) {
  if (!nextPath || !nextPath.startsWith("/")) {
    return "/admin";
  }

  return nextPath;
}

export async function login(formData: FormData) {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    next: formData.get("next"),
  });

  if (!parsed.success) {
    redirect("/login?error=Please%20enter%20a%20valid%20email%20and%20password.");
  }

  const supabase = await createClient();
  const { email, password, next } = parsed.data;

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    redirect("/login?error=Invalid%20email%20or%20password.");
  }

  revalidatePath("/", "layout");
  redirect(resolveLoginRedirect(next));
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}
