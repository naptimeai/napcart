export type StorefrontFulfillmentType = "delivery" | "pickup";

export type StorefrontRestaurant = {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  supportPhone: string;
  contactEmail: string | null;
  defaultCurrency: string;
  timezone: string;
  isAcceptingOrders: boolean;
  isGloballyClosed: boolean;
  deliveryEnabled: boolean;
  pickupEnabled: boolean;
  minimumOrderAmount: number | null;
};

export type StorefrontBranch = {
  id: string;
  name: string;
  slug: string;
  phone: string | null;
  addressText: string;
  latitude: number | null;
  longitude: number | null;
  supportsPickup: boolean;
  supportsDelivery: boolean;
  deliveryRadiusKm: number | null;
  operatingHoursSummary: {
    hours: string;
    label: string;
  };
  isOpenNow: boolean;
  isAcceptingOrders: boolean;
  isTemporarilyClosed: boolean;
  deliveryZones: Array<{
    id: string;
    name: string;
    fee: number;
    maxDistanceKm: number | null;
    minimumOrderAmount: number | null;
  }>;
};

export type StorefrontAddon = {
  id: string;
  name: string;
  price: number;
};

export type StorefrontAddonGroup = {
  id: string;
  name: string;
  minSelect: number;
  maxSelect: number;
  isRequired: boolean;
  addons: StorefrontAddon[];
};

export type StorefrontVariant = {
  id: string;
  name: string;
  price: number;
  isDefault: boolean;
};

export type StorefrontProduct = {
  id: string;
  categoryId: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  basePrice: number;
  deliveryAvailable: boolean;
  pickupAvailable: boolean;
  variants: StorefrontVariant[];
  addonGroups: StorefrontAddonGroup[];
  availableBranchIds: string[];
};

export type StorefrontCategory = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  products: StorefrontProduct[];
};

export type StorefrontData = {
  restaurant: StorefrontRestaurant;
  branches: StorefrontBranch[];
  categories: StorefrontCategory[];
};

export type StorefrontOrderRequest = {
  branchId: string;
  fulfillmentType: StorefrontFulfillmentType;
  customer: {
    name: string;
    phone: string;
  };
  addressText?: string;
  deliveryZoneId?: string;
  deliveryNotes?: string;
  orderNotes?: string;
  items: Array<{
    productId: string;
    variantId?: string;
    quantity: number;
    addonIds?: string[];
    itemNotes?: string;
  }>;
};

export type StorefrontOrderResponse = {
  orderId: string;
  orderNumber: string;
  accessToken: string;
  status: "pending_confirmation" | "confirmed" | "cancelled";
  branchName: string;
  fulfillmentType: StorefrontFulfillmentType;
  subtotal: number;
  deliveryFee: number;
  grandTotal: number;
  currency: string;
  placedAt: string;
};

export type StorefrontOrderSummary = StorefrontOrderResponse & {
  customerName: string;
  customerPhone: string;
  addressText: string | null;
  items: Array<{
    name: string;
    variantName: string | null;
    quantity: number;
    lineTotal: number;
  }>;
};
