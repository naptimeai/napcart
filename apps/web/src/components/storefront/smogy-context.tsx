"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type {
  StorefrontBranch,
  StorefrontData,
  StorefrontFulfillmentType,
  StorefrontProduct,
  StorefrontVariant,
} from "@/server/storefront/types";

export type SmogyCartItem = {
  key: string;
  itemId: string;
  variantKey: string;
  name: string;
  price: number;
  quantity: number;
  image: string | null;
  variantLabel: string;
  categoryId: string;
  categoryName: string;
  subCategoryName: string;
};

export type SmogyMenuItem = {
  id: string;
  name: string;
  image: string | null;
  categoryId: string;
  categoryName: string;
  subCategoryName: string;
  product: StorefrontProduct;
  variants: StorefrontVariant[];
};

export type SmogyMenuSubCategory = {
  name: string;
  items: SmogyMenuItem[];
};

export type SmogyMenuCategory = {
  id: string;
  name: string;
  icon: string;
  image: string;
  subCategories: SmogyMenuSubCategory[];
};

type AddCartItemInput = {
  itemId: string;
  variantKey: string;
  name: string;
  price: number;
  variantLabel: string;
  image?: string | null;
  categoryId: string;
  categoryName: string;
  subCategoryName: string;
};

type SmogyStorefrontContextValue = {
  data: StorefrontData;
  restaurantSlug: string;
  basePath: string;
  menuCategories: SmogyMenuCategory[];
  items: SmogyCartItem[];
  isDrawerOpen: boolean;
  setDrawerOpen: (open: boolean) => void;
  orderType: StorefrontFulfillmentType;
  setOrderType: (value: StorefrontFulfillmentType) => void;
  selectedBranchId: string;
  setSelectedBranchId: (value: string) => void;
  selectedBranch: StorefrontBranch | undefined;
  addItem: (item: AddCartItemInput) => void;
  removeItem: (itemId: string, variantKey: string) => void;
  updateQuantity: (itemId: string, delta: number, variantKey: string) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
  deliveryFee: number;
  grandTotal: number;
  currency: string;
};

const SmogyStorefrontContext =
  createContext<SmogyStorefrontContextValue | null>(null);

const categoryVisuals: Record<string, { icon: string; image: string }> = {
  "Live Ice Cream": {
    icon: "🍦",
    image: "/storefront/smogyice/live-ice-cream-feature.jpg",
  },
  "Signature Live": {
    icon: "✨",
    image: "/storefront/smogyice/hero-oreo-ice-cream.jpg",
  },
  "Soft Serve": {
    icon: "🍦",
    image: "/storefront/smogyice/soft-serve-cones.jpg",
  },
  Blizzard: {
    icon: "🌪️",
    image: "/storefront/smogyice/blizzard-smogy.png",
  },
  "Mocktails & Drinks": {
    icon: "🍹",
    image:
      "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=800&q=80",
  },
  "Crazy Ice Shakes": {
    icon: "🥤",
    image:
      "https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=800&q=80",
  },
  "Cold Coffee": {
    icon: "☕",
    image: "/storefront/smogyice/cold-coffee-smogy.png",
  },
  "Desserts & Cakes": {
    icon: "🍰",
    image:
      "https://images.unsplash.com/photo-1624353365286-3f8d62daad51?w=800&q=80",
  },
};

function getBranchDeliveryFee(branch: StorefrontBranch | undefined) {
  return branch?.deliveryZones[0]?.fee ?? 0;
}

function inferSubCategory(product: StorefrontProduct, categoryName: string) {
  const description = product.description?.trim();
  const suffix = ` from ${categoryName}.`;

  if (description?.endsWith(suffix)) {
    return description.slice(0, -suffix.length);
  }

  return categoryName;
}

function createCartKey(itemId: string, variantKey: string) {
  return `${itemId}:${variantKey}`;
}

function buildMenuCategories(data: StorefrontData): SmogyMenuCategory[] {
  return data.categories.map((category) => {
    const visual = categoryVisuals[category.name];
    const subCategories = new Map<string, SmogyMenuItem[]>();

    for (const product of category.products) {
      const subCategoryName = inferSubCategory(product, category.name);
      const item: SmogyMenuItem = {
        id: product.id,
        name: product.name,
        image: product.imageUrl,
        categoryId: category.id,
        categoryName: category.name,
        subCategoryName,
        product,
        variants: product.variants,
      };

      subCategories.set(subCategoryName, [
        ...(subCategories.get(subCategoryName) ?? []),
        item,
      ]);
    }

    return {
      id: category.id,
      name: category.name,
      icon: visual?.icon ?? "🍦",
      image:
        visual?.image ??
        category.products.find((product) => product.imageUrl)?.imageUrl ??
        "/storefront/smogyice/live-ice-cream-feature.jpg",
      subCategories: Array.from(subCategories.entries()).map(
        ([name, items]) => ({
          name,
          items,
        }),
      ),
    };
  });
}

export function SmogyStorefrontProvider({
  children,
  data,
  restaurantSlug,
}: {
  children: ReactNode;
  data: StorefrontData;
  restaurantSlug: string;
}) {
  const basePath = `/storefront/${restaurantSlug}`;
  const currency = data.restaurant.defaultCurrency;
  const storageKey = `napcart:${restaurantSlug}:smogy-cart`;
  const orderTypeStorageKey = `napcart:${restaurantSlug}:smogy-order-type`;

  const [items, setItems] = useState<SmogyCartItem[]>([]);
  const [hasRestoredCart, setHasRestoredCart] = useState(false);
  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const [orderType, setOrderTypeState] =
    useState<StorefrontFulfillmentType>("delivery");
  const [selectedBranchId, setSelectedBranchIdState] = useState("");

  const menuCategories = useMemo(() => buildMenuCategories(data), [data]);
  const selectedBranch = data.branches.find(
    (branch) => branch.id === selectedBranchId,
  );
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const deliveryFee =
    orderType === "delivery" ? getBranchDeliveryFee(selectedBranch) : 0;
  const grandTotal = totalPrice + deliveryFee;

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const storedItems = window.localStorage.getItem(storageKey);
      const storedOrderType = window.localStorage.getItem(orderTypeStorageKey);

      if (storedItems) {
        try {
          const parsedItems = JSON.parse(storedItems) as SmogyCartItem[];
          setItems(parsedItems.filter((item) => item.quantity > 0));
        } catch {
          window.localStorage.removeItem(storageKey);
        }
      }

      if (storedOrderType === "delivery" || storedOrderType === "pickup") {
        setOrderTypeState(storedOrderType);
      }

      setHasRestoredCart(true);
    }, 0);

    return () => window.clearTimeout(timer);
  }, [orderTypeStorageKey, storageKey]);

  useEffect(() => {
    if (!hasRestoredCart) {
      return;
    }

    window.localStorage.setItem(storageKey, JSON.stringify(items));
  }, [hasRestoredCart, items, storageKey]);

  function setOrderType(value: StorefrontFulfillmentType) {
    setOrderTypeState(value);
    window.localStorage.setItem(orderTypeStorageKey, value);
  }

  function setSelectedBranchId(value: string) {
    setSelectedBranchIdState(value);
  }

  function addItem(item: AddCartItemInput) {
    const key = createCartKey(item.itemId, item.variantKey);

    setItems((currentItems) => {
      const existing = currentItems.find((cartItem) => cartItem.key === key);

      if (existing) {
        return currentItems.map((cartItem) =>
          cartItem.key === key
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem,
        );
      }

      return [
        ...currentItems,
        {
          ...item,
          key,
          quantity: 1,
          image: item.image ?? null,
        },
      ];
    });
    setDrawerOpen(true);
  }

  function removeItem(itemId: string, variantKey: string) {
    const key = createCartKey(itemId, variantKey);
    setItems((currentItems) =>
      currentItems.filter((cartItem) => cartItem.key !== key),
    );
  }

  function updateQuantity(itemId: string, delta: number, variantKey: string) {
    const key = createCartKey(itemId, variantKey);
    setItems((currentItems) =>
      currentItems
        .map((item) =>
          item.key === key
            ? { ...item, quantity: Math.max(0, item.quantity + delta) }
            : item,
        )
        .filter((item) => item.quantity > 0),
    );
  }

  function clearCart() {
    setItems([]);
    window.localStorage.removeItem(storageKey);
  }

  const value = {
    data,
    restaurantSlug,
    basePath,
    menuCategories,
    items,
    isDrawerOpen,
    setDrawerOpen,
    orderType,
    setOrderType,
    selectedBranchId,
    setSelectedBranchId,
    selectedBranch,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    totalItems,
    totalPrice,
    deliveryFee,
    grandTotal,
    currency,
  };

  return (
    <SmogyStorefrontContext.Provider value={value}>
      {children}
    </SmogyStorefrontContext.Provider>
  );
}

export function useSmogyStorefront() {
  const context = useContext(SmogyStorefrontContext);

  if (!context) {
    throw new Error(
      "useSmogyStorefront must be used within SmogyStorefrontProvider",
    );
  }

  return context;
}

export function formatSmogyMoney(currency: string, amount: number) {
  if (currency.toUpperCase() === "PKR") {
    return `Rs. ${amount.toLocaleString()}`;
  }

  return `${currency} ${amount.toLocaleString()}`;
}
