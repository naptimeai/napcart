"use server";

import { loginToAdmin, logoutFromAdmin } from "@/app/admin/actions";

export async function login(formData: FormData) {
  return loginToAdmin(formData);
}

export async function logout() {
  return logoutFromAdmin();
}
