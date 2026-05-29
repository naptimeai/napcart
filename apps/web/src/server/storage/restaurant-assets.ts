import { createAdminClient } from "@/lib/supabase/admin";
import { slugify } from "@/lib/utils/slugify";

const ASSET_BUCKET = "napcart-assets";

async function ensureAssetBucket() {
  const supabase = createAdminClient();
  const { data: buckets, error: listError } = await supabase.storage.listBuckets();

  if (listError) {
    throw listError;
  }

  if (buckets.some((bucket) => bucket.name === ASSET_BUCKET)) {
    return supabase;
  }

  const { error: createError } = await supabase.storage.createBucket(ASSET_BUCKET, {
    public: true,
    allowedMimeTypes: ["image/*"],
    fileSizeLimit: "5MB",
  });

  if (createError && !createError.message.toLowerCase().includes("already exists")) {
    throw createError;
  }

  return supabase;
}

function sanitizeFileName(name: string) {
  const extension = name.includes(".") ? name.split(".").pop() ?? "bin" : "bin";
  const baseName = name.replace(/\.[^/.]+$/, "");
  return `${slugify(baseName) || "asset"}.${extension.toLowerCase()}`;
}

export async function uploadRestaurantAsset({
  restaurantSlug,
  scope,
  file,
}: {
  restaurantSlug: string;
  scope: "branding" | "products";
  file: File;
}) {
  if (!file.size) {
    return null;
  }

  if (!file.type.startsWith("image/")) {
    throw new Error("Only image uploads are supported.");
  }

  if (file.size > 5 * 1024 * 1024) {
    throw new Error("Images must be smaller than 5MB.");
  }

  const supabase = await ensureAssetBucket();
  const bytes = new Uint8Array(await file.arrayBuffer());
  const filePath = [
    "restaurants",
    slugify(restaurantSlug) || "restaurant",
    scope,
    `${Date.now()}-${sanitizeFileName(file.name)}`,
  ].join("/");

  const { error: uploadError } = await supabase.storage
    .from(ASSET_BUCKET)
    .upload(filePath, bytes, {
      contentType: file.type,
      upsert: false,
    });

  if (uploadError) {
    throw uploadError;
  }

  const { data } = supabase.storage.from(ASSET_BUCKET).getPublicUrl(filePath);

  return {
    bucket: ASSET_BUCKET,
    filePath,
    publicUrl: data.publicUrl,
  };
}
