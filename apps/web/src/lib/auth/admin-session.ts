import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { findAdminUserByAuthUserId } from "@/server/repositories/admin-users";

export type AdminSession = {
  authUserId: string;
  adminUserId: string;
  adminName: string;
  adminEmail: string;
  restaurantId: string;
  restaurantName: string;
  restaurantSlug: string;
  restaurantLogoUrl: string | null;
};

export const getAdminSession = cache(async (): Promise<AdminSession | null> => {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  const adminUser = await findAdminUserByAuthUserId(user.id);

  if (
    !adminUser ||
    !adminUser.isActive ||
    !adminUser.restaurant.isActive ||
    !adminUser.restaurant.settings
  ) {
    return null;
  }

  return {
    authUserId: user.id,
    adminUserId: adminUser.id,
    adminName: adminUser.name,
    adminEmail: adminUser.email,
    restaurantId: adminUser.restaurant.id,
    restaurantName: adminUser.restaurant.name,
    restaurantSlug: adminUser.restaurant.slug,
    restaurantLogoUrl: adminUser.restaurant.logoUrl,
  };
});

export async function requireAdminSession() {
  const session = await getAdminSession();

  if (!session) {
    redirect("/login");
  }

  return session;
}
