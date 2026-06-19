"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import {
  ArrowLeft,
  ArrowRight,
  BadgeInfo,
  Bike,
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  CreditCard,
  FileText,
  ExternalLink,
  HandCoins,
  Headset,
  House,
  Lock,
  Mail,
  MapPin,
  Pencil,
  Phone,
  Search,
  ShieldCheck,
  ShoppingBag,
  Star,
  Store,
  Truck,
  Wallet,
} from "lucide-react";
import {
  startTransition,
  useDeferredValue,
  useEffect,
  useMemo,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import {
  formatSmogyMoney,
  useSmogyStorefront,
  type SmogyMenuItem,
} from "@/components/storefront/smogy-context";
import type {
  StorefrontAddon,
  StorefrontOrderSummary,
} from "@/server/storefront/types";

const featuredProducts = [
  {
    id: "curl-lotus",
    name: "Lotus Biscoff Curl",
    description:
      "Our signature curl ice cream infused with rich Lotus Biscoff spread and crushed cookies.",
    category: "Live Ice Cream",
    image: "/storefront/smogyice/live-ice-cream-feature.jpg",
    isPopular: true,
    selection: {
      categoryName: "Signature Live",
      subCategoryName: "Nutella Range",
      itemName: "Lotus",
      variantName: "Large",
    },
  },
  {
    id: "shake-chocolate",
    name: "Nutella Blast Shake",
    description:
      "Creamy, thick shake blended with pure Nutella and topped with chocolate curls.",
    category: "Crazy Ice Shakes",
    image: "https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=800&q=80",
    isPopular: true,
    selection: {
      categoryName: "Crazy Ice Shakes",
      subCategoryName: "Premium Shakes",
      itemName: "Nutella Shake",
      variantName: "Glass",
    },
  },
  {
    id: "dessert-molten",
    name: "Molten Lava Cake",
    description:
      "Warm chocolate cake with a gooey center, served with a scoop of our premium vanilla ice cream.",
    category: "Molten Lava",
    image: "https://images.unsplash.com/photo-1624353365286-3f8d62daad51?w=800&q=80",
    isPopular: true,
    selection: {
      categoryName: "Desserts & Cakes",
      subCategoryName: "Molten Lava",
      itemName: "Molten Lava Cake",
      variantName: "Unit",
    },
  },
  {
    id: "curl-pistachio",
    name: "Pistachio Delight",
    description:
      "Premium pistachio infused curl ice cream with roasted nut pieces.",
    category: "Live Ice Cream",
    image: "https://images.unsplash.com/photo-1501443762994-82bd5dace89a?w=800&q=80",
    selection: {
      categoryName: "Live Ice Cream",
      subCategoryName: "Smogy Special",
      itemName: "Pistachio",
      variantName: "Large",
    },
  },
  {
    id: "beverage-cold-coffee",
    name: "Caramel Macchiato Chill",
    description:
      "Signature cold coffee with a rich caramel drizzle and whipped cream.",
    category: "Drinks",
    image: "/storefront/smogyice/cold-coffee-smogy.png",
    selection: {
      categoryName: "Cold Coffee",
      subCategoryName: "Coffee Shakes",
      itemName: "Caramel Cold Coffee",
      variantName: "Unit",
    },
  },
  {
    id: "soft-serve-dip",
    name: "Chocolate Dipped Cone",
    description: "Our silky soft serve dipped in premium Belgian chocolate.",
    category: "Soft Serve",
    image: "/storefront/smogyice/soft-serve-cones.jpg",
    selection: {
      categoryName: "Soft Serve",
      subCategoryName: "Soft Cone",
      itemName: "Waffle Dip Cone",
      variantName: "Unit",
    },
  },
];

type CheckoutForm = {
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  deliveryZoneId: string;
  landmark: string;
  orderNotes: string;
};

const initialCheckoutForm: CheckoutForm = {
  customerName: "",
  customerPhone: "",
  deliveryAddress: "",
  deliveryZoneId: "",
  landmark: "",
  orderNotes: "",
};

const smogyBranchMapLinks: Record<string, string> = {
  "Wapda Town": "https://maps.app.goo.gl/SxkX2nrpbMZsdoWD9",
  "DHA Phase 8": "https://maps.app.goo.gl/AQ6y6GuxjyCtHRJe9",
  "Walton Road": "https://maps.app.goo.gl/oJEgrZv9E9ZJwjSw8",
  Sheikhupura: "https://maps.app.goo.gl/Amkh5pC8YnBzCY9y5",
};
const smogyDisplayPhone = "0301-1417221";
const smogyEmail = "smogyice@gmail.com";

export function SmogyHomePage() {
  return (
    <>
      <Hero />
      <QuickActions />
      <MenuSection />
      <EventBanner />
      <BranchesSection />
    </>
  );
}

function Hero() {
  const { basePath } = useSmogyStorefront();

  return (
    <section className="relative flex min-h-[90vh] items-center overflow-hidden bg-smogy-cream pt-32 pb-12 md:pt-40 md:pb-24">
      <div className="absolute top-[-10%] right-[-10%] size-[500px] rounded-full bg-smogy-secondary/10 blur-3xl" />
      <div className="absolute bottom-[-10%] left-[-10%] size-[500px] rounded-full bg-smogy-primary/10 blur-3xl" />

      <div className="relative z-10 mx-auto grid w-full max-w-7xl items-center gap-12 px-6 md:grid-cols-2">
        <motion.div
          animate={{ opacity: 1, x: 0 }}
          initial={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.8 }}
        >
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-smogy-primary/10 px-4 py-2 font-medium text-smogy-primary">
            <Star className="size-4 fill-current" />
            <span>Pakistan&apos;s #1 Curl Ice Cream spot</span>
          </div>
          <h1 className="mb-6 font-serif text-6xl leading-[0.9] font-black text-smogy-primary md:text-8xl">
            Curl into <br />
            <span className="text-smogy-secondary">Happiness.</span>
          </h1>
          <p className="mb-10 max-w-lg text-xl leading-relaxed text-neutral-600">
            Indulge in Lahore&apos;s finest handcrafted curl ice cream,
            decadent brownies, and creamy shakes. Real ingredients, pure
            obsession.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              className="btn-secondary !px-10 !py-4 text-lg"
              href={`${basePath}/menu`}
            >
              Order Pickup
            </Link>
            <Link
              className="rounded-full border border-smogy-primary/20 bg-white px-10 py-4 font-medium text-smogy-primary shadow-sm transition-all hover:bg-neutral-50"
              href={`${basePath}/menu`}
            >
              View Menu
            </Link>
          </div>
          <div className="mt-12 flex items-center gap-6">
            <div className="-space-x-3 flex">
              {[1, 2, 3, 4].map((index) => (
                <div
                  className="size-12 overflow-hidden rounded-full border-2 border-white bg-neutral-200"
                  key={index}
                >
                  <Image
                    alt="Smogy Ice customer"
                    height={100}
                    src={`https://i.pravatar.cc/100?u=${index}`}
                    width={100}
                  />
                </div>
              ))}
            </div>
            <div className="text-sm">
              <div className="flex gap-0.5 text-smogy-accent">
                {[1, 2, 3, 4, 5].map((index) => (
                  <Star className="size-3.5 fill-current" key={index} />
                ))}
              </div>
              <p className="font-semibold text-smogy-primary">
                5,000+ Happy Foodies
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          animate={{ opacity: 1, scale: 1 }}
          className="relative"
          initial={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 1, delay: 0.2 }}
        >
          <div className="absolute inset-0 scale-90 rounded-full bg-smogy-secondary/20 blur-2xl" />
          <div className="relative aspect-square rotate-3 rounded-[3rem] bg-smogy-primary p-4 shadow-2xl transition-transform duration-700 hover:rotate-0">
            <Image
              alt="Rolled Oreo ice cream by Smogy Ice"
              className="size-full rounded-[2rem] object-cover"
              height={720}
              priority
              src="/storefront/smogyice/hero-oreo-ice-cream.jpg"
              width={720}
            />
          </div>

          <motion.div
            animate={{ y: [0, -10, 0] }}
            className="glass-card absolute -top-6 -left-6 flex items-center gap-3 rounded-2xl p-4"
            transition={{ repeat: Infinity, duration: 3 }}
          >
            <div className="flex size-10 items-center justify-center rounded-full bg-smogy-accent">
              🍦
            </div>
            <div>
              <p className="text-xs leading-none font-bold tracking-widest text-neutral-400 uppercase">
                Freshly Made
              </p>
              <p className="text-sm font-bold text-smogy-primary">
                Signature Curls
              </p>
            </div>
          </motion.div>

          <motion.div
            animate={{ y: [0, 10, 0] }}
            className="glass-card absolute -right-6 -bottom-6 flex items-center gap-3 rounded-2xl p-4"
            transition={{ repeat: Infinity, duration: 4, delay: 0.5 }}
          >
            <div className="flex size-10 items-center justify-center rounded-full bg-smogy-secondary text-white">
              🔥
            </div>
            <div>
              <p className="text-xs leading-none font-bold tracking-widest text-neutral-400 uppercase">
                Bestseller
              </p>
              <p className="text-sm font-bold text-smogy-primary">
                Molten Lava
              </p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

function QuickActions() {
  const { data } = useSmogyStorefront();
  const supportPhone = data.restaurant.supportPhone || smogyDisplayPhone;
  const primaryBranchHours = data.branches.find((branch) => branch.isOpenNow)
    ?.operatingHoursSummary ?? data.branches[0]?.operatingHoursSummary;
  const actions = [
    {
      icon: <Clock className="text-smogy-secondary" />,
      title: primaryBranchHours?.label ?? "Opening Hours",
      desc: primaryBranchHours?.hours ?? "See branch timings",
    },
    {
      icon: <MapPin className="text-smogy-secondary" />,
      title: `${data.branches.length} Branches`,
      desc: "Across Lahore & SKP",
    },
    {
      icon: <Phone className="text-smogy-secondary" />,
      title: "Order Direct",
      desc: supportPhone,
    },
  ];

  return (
    <section className="relative z-20 mx-6 -mt-6 max-w-5xl rounded-3xl border-y border-smogy-cream bg-white py-12 shadow-xl lg:mx-auto">
      <div className="grid grid-cols-1 divide-y divide-smogy-cream md:grid-cols-3 md:divide-x md:divide-y-0">
        {actions.map((action) => (
          <div
            className="group flex items-center gap-4 px-10 py-6 md:py-2"
            key={action.title}
          >
            <div className="flex size-12 items-center justify-center rounded-2xl bg-smogy-secondary/10 transition-colors group-hover:bg-smogy-secondary/20">
              {action.icon}
            </div>
            <div>
              <h4 className="font-bold text-smogy-primary">{action.title}</h4>
              <p className="text-sm text-neutral-500">{action.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function MenuSection() {
  const router = useRouter();
  const { addItem, basePath, menuCategories } = useSmogyStorefront();
  const homeCategories = [
    {
      icon: "🍦",
      label: "Live Ice Cream",
      match: ["Live Ice Cream"],
    },
    {
      icon: "🥤",
      label: "Crazy Ice Shakes",
      match: ["Crazy Ice Shakes"],
    },
    {
      icon: "🍰",
      label: "Molten Lava",
      match: ["Desserts & Cakes"],
    },
    {
      icon: "☕",
      label: "Drinks",
      match: ["Mocktails & Drinks", "Cold Coffee"],
    },
    {
      icon: "🍦",
      label: "Soft Serve",
      match: ["Soft Serve"],
    },
  ];
  const allItems = menuCategories.flatMap((category) =>
    category.subCategories.flatMap((subCategory) => subCategory.items),
  );

  function addFeaturedProduct(
    selection: (typeof featuredProducts)[number]["selection"],
  ) {
    const item =
      allItems.find(
        (menuItem) =>
          menuItem.categoryName === selection.categoryName &&
          menuItem.subCategoryName === selection.subCategoryName &&
          menuItem.name === selection.itemName,
      ) ?? null;
    const variant =
      item?.variants.find(
        (variantItem) => variantItem.name === selection.variantName,
      ) ??
      item?.variants[0];

    if (!item || !variant) {
      router.push(`${basePath}/menu`);
      return;
    }

    addItem({
      itemId: item.product.id,
      variantKey: variant.id,
      name: item.name,
      price: variant.price,
      variantLabel: variant.name,
      image: item.image,
      categoryId: item.categoryId,
      categoryName: item.categoryName,
      subCategoryName: item.subCategoryName,
    });
  }

  return (
    <section className="mx-auto max-w-7xl px-6 py-24" id="menu">
      <div className="mb-16 text-center">
        <h2 className="section-title">Explore Our Cravings</h2>
        <p className="mx-auto max-w-xl text-neutral-500">
          From our signature curls to decadent brownies, find your next favorite
          dessert.
        </p>
      </div>

      <div className="mb-16 grid grid-cols-2 gap-6 md:grid-cols-5">
        {homeCategories.map((category) => {
          const matchedCategory =
            menuCategories.find((menuCategory) =>
              category.match.includes(menuCategory.name),
            ) ?? menuCategories[0];

          return (
            <motion.div key={category.label} whileHover={{ y: -5 }}>
              <Link
                className="flex w-full flex-col items-center gap-4 rounded-3xl border border-smogy-cream bg-white p-6 shadow-sm transition-all hover:shadow-xl"
                href={`${basePath}/menu`}
                onClick={() => {
                  if (matchedCategory) {
                    window.sessionStorage.setItem(
                      `napcart:${basePath}:selected-menu-category`,
                      matchedCategory.id,
                    );
                  }
                }}
              >
                <div className="flex size-16 items-center justify-center rounded-full bg-smogy-primary/5 text-3xl">
                  {category.icon}
                </div>
                <span className="text-sm font-bold text-smogy-primary sm:text-base">
                  {category.label}
                </span>
              </Link>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {featuredProducts.map((product) => (
          <motion.div
            className="glass-card group flex h-full flex-col rounded-[2.5rem] p-4"
            key={product.id}
            layout
          >
            <div className="relative mb-6 aspect-[4/3] overflow-hidden rounded-[2rem]">
              <Image
                alt={product.name}
                className="size-full object-cover transition-transform duration-500 group-hover:scale-110"
                height={440}
                src={product.image}
                width={640}
              />
              {product.isPopular ? (
                <div className="absolute top-4 left-4 rounded-full bg-smogy-accent px-3 py-1 text-xs font-bold tracking-tighter text-smogy-primary uppercase">
                  Popular
                </div>
              ) : null}
            </div>
            <div className="flex flex-1 flex-col px-4 pb-4">
              <div className="mb-2 flex items-start justify-between">
                <h3 className="font-serif text-xl font-bold text-smogy-primary">
                  {product.name}
                </h3>
                <span className="rounded-md bg-smogy-secondary/10 px-2 py-1 text-xs font-bold text-smogy-secondary">
                  {product.category}
                </span>
              </div>
              <p className="mb-6 flex-1 text-sm text-neutral-500">
                {product.description}
              </p>
              <button
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-smogy-primary py-3 font-bold text-white transition-colors hover:bg-smogy-primary/90"
                onClick={() => addFeaturedProduct(product.selection)}
                type="button"
              >
                Add to Cart
                <ArrowRight className="size-[18px]" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function EventBanner() {
  return (
    <section className="px-6 py-24" id="events">
      <div className="relative mx-auto flex min-h-[400px] max-w-7xl items-center overflow-hidden rounded-[3rem] bg-smogy-primary">
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute top-0 left-0 size-full"
            style={{
              backgroundImage:
                "radial-gradient(circle at 2px 2px, white 1px, transparent 0)",
              backgroundSize: "40px 40px",
            }}
          />
        </div>

        <div className="relative z-10 grid w-full gap-12 p-8 md:grid-cols-2 md:p-20">
          <div>
            <h2 className="mb-6 font-serif text-4xl leading-none font-black text-white md:text-6xl">
              Elevate Your <br />
              <span className="text-smogy-accent underline decoration-smogy-secondary">
                Events.
              </span>
            </h2>
            <p className="mb-8 max-w-md text-lg text-white/80">
              From birthdays to weddings, bring the magic of Smogy Ice curls
              and desserts to your special day. Professional catering and custom
              setups available.
            </p>
            <button className="inline-flex items-center gap-2 rounded-full bg-white px-8 py-4 font-bold text-smogy-primary transition-transform hover:scale-105">
              <Calendar className="size-5" />
              Book For Events
            </button>
          </div>
          <div className="hidden items-center justify-center md:flex">
            <div className="max-w-xs rotate-6 rounded-3xl border border-white/10 bg-white/10 p-8 backdrop-blur-3xl">
              <Star
                className="mb-4 size-8 fill-current text-smogy-accent"
              />
              <p className="mb-4 font-serif text-xl leading-normal text-white italic">
                &quot;Smogy Ice made our wedding celebrations so much more
                special. Their curl live station was the highlight of the
                night!&quot;
              </p>
              <div className="text-sm text-white/60">
                - Sarah & Ahmed, 2024
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function BranchesSection() {
  const { data } = useSmogyStorefront();

  return (
    <section className="mx-auto max-w-7xl px-6 py-24" id="branches">
      <div className="mb-16 flex flex-col items-end justify-between gap-6 md:flex-row">
        <div className="max-w-xl">
          <h2 className="section-title">Visit Our Stores</h2>
          <p className="text-lg text-neutral-500">
            Deliciousness is just around the corner. Find your nearest Smogy Ice
            branch and get ready for a treat.
          </p>
        </div>
        <button className="group flex items-center gap-2 font-bold text-smogy-secondary">
          View Map
          <ArrowRight className="size-5 transition-transform group-hover:translate-x-2" />
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 text-xl md:grid-cols-2 lg:grid-cols-4">
        {data.branches.map((branch) => (
          <div
            className="rounded-3xl border border-smogy-cream bg-white p-8 shadow-sm transition-colors hover:border-smogy-secondary/20"
            key={branch.id}
          >
            <div className="mb-6 flex size-12 items-center justify-center rounded-2xl bg-smogy-secondary/10 text-smogy-secondary">
              <MapPin className="size-6" />
            </div>
            <h3 className="mb-2 font-serif text-2xl font-bold text-smogy-primary">
              {branch.name}
            </h3>
            <p className="mb-6 min-h-10 text-sm text-neutral-500">
              {branch.addressText}
            </p>
            <div className="mb-8 space-y-3">
              <div className="flex items-center gap-3 text-sm text-neutral-600">
                <Clock className="size-4" />
                <span>
                  {branch.operatingHoursSummary.hours}
                  {branch.operatingHoursSummary.label !== "Every day"
                    ? ` • ${branch.operatingHoursSummary.label}`
                    : ""}
                </span>
              </div>
              <div className="flex items-center gap-3 text-sm text-neutral-600">
                <Phone className="size-4" />
                <span>{branch.phone || data.restaurant.supportPhone || smogyDisplayPhone}</span>
              </div>
            </div>
            <a
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-neutral-100 py-3 font-bold !text-smogy-primary transition-colors hover:bg-neutral-50"
              href={
                smogyBranchMapLinks[branch.name] ??
                `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(branch.addressText)}`
              }
              rel="noreferrer"
              target="_blank"
            >
              Get Directions
              <ExternalLink className="size-4" />
            </a>
          </div>
        ))}
      </div>
    </section>
  );
}

export function SmogyMenuPage() {
  const searchParams = useSearchParams();
  const { addItem, basePath, menuCategories } = useSmogyStorefront();
  const homePath = basePath || "/";
  const [activeCategory, setActiveCategory] = useState(
    searchParams.get("category") ?? menuCategories[0]?.id ?? "",
  );
  const [searchQuery, setSearchQuery] = useState("");
  const deferredSearchQuery = useDeferredValue(searchQuery);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const storedCategoryId = window.sessionStorage.getItem(
        `napcart:${basePath}:selected-menu-category`,
      );

      if (
        storedCategoryId &&
        menuCategories.some((category) => category.id === storedCategoryId)
      ) {
        setActiveCategory(storedCategoryId);
        window.sessionStorage.removeItem(
          `napcart:${basePath}:selected-menu-category`,
        );
      }
    }, 0);

    return () => window.clearTimeout(timer);
  }, [basePath, menuCategories]);

  const currentCategoryData = useMemo(
    () =>
      menuCategories.find((category) => category.id === activeCategory) ??
      menuCategories[0],
    [activeCategory, menuCategories],
  );

  const filteredSubCategories = useMemo(() => {
    if (!currentCategoryData) {
      return [];
    }

    const query = deferredSearchQuery.trim().toLowerCase();

    if (!query) {
      return currentCategoryData.subCategories;
    }

    return currentCategoryData.subCategories
      .map((subCategory) => ({
        ...subCategory,
        items: subCategory.items.filter((item) =>
          item.name.toLowerCase().includes(query),
        ),
      }))
      .filter((subCategory) => subCategory.items.length > 0);
  }, [currentCategoryData, deferredSearchQuery]);

  return (
    <div className="min-h-screen bg-smogy-cream pt-24 pb-20">
      <div className="mx-auto mb-12 max-w-7xl px-6">
        <Link
          className="group mb-8 inline-flex items-center gap-2 text-smogy-primary transition-colors hover:text-smogy-secondary"
          href={homePath}
        >
          <ArrowLeft className="size-5 transition-transform group-hover:-translate-x-1" />
          <span className="font-bold">Back to Home</span>
        </Link>

        <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
          <div>
            <h1 className="mb-4 font-serif text-5xl leading-none font-black text-smogy-primary md:text-7xl">
              Smogy <span className="text-smogy-secondary">Menu</span>
            </h1>
            <p className="max-w-md text-lg text-neutral-500">
              Experience the joy in every swirl. Browse our full selection of
              premium treats.
            </p>
          </div>

          <div className="relative w-full max-w-sm">
            <Search className="absolute top-1/2 left-4 size-5 -translate-y-1/2 text-neutral-400" />
            <input
              className="w-full rounded-2xl border border-smogy-cream bg-white py-4 pr-6 pl-12 shadow-sm transition-all focus:border-smogy-primary focus:outline-none"
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search favorites (e.g. Nutella)"
              type="text"
              value={searchQuery}
            />
          </div>
        </div>
      </div>

      <div className="sticky top-20 z-40 mb-12 border-y border-neutral-200 bg-smogy-cream/80 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-6">
          <div className="no-scrollbar flex items-center gap-2 overflow-x-auto px-4 py-4">
            {menuCategories.map((category) => (
              <button
                className={`flex items-center gap-2 rounded-full px-6 py-3 font-bold whitespace-nowrap transition-all ${
                  currentCategoryData?.id === category.id
                    ? "scale-105 bg-smogy-primary text-white shadow-lg shadow-smogy-primary/20"
                    : "border border-smogy-cream bg-white text-smogy-primary hover:bg-neutral-50"
                }`}
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                type="button"
              >
                <span>{category.icon}</span>
                <span>{category.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6">
        <AnimatePresence mode="wait">
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            className="grid gap-12 lg:grid-cols-[1fr_350px]"
            exit={{ opacity: 0, y: -20 }}
            initial={{ opacity: 0, y: 20 }}
            key={currentCategoryData?.id}
          >
            <div className="space-y-16">
              {filteredSubCategories.length > 0 ? (
                filteredSubCategories.map((subCategory, index) => (
                  <div className="space-y-8" key={`${subCategory.name}-${index}`}>
                    <div className="flex items-center gap-4">
                      <h2 className="font-serif text-3xl font-bold text-smogy-primary">
                        {subCategory.name}
                      </h2>
                      <div className="h-px flex-1 bg-smogy-primary/10" />
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      {subCategory.items.map((item) => (
                        <MenuItemCard
                          item={item}
                          key={item.id}
                          onAdd={(variant, addons) =>
                            addItem({
                              itemId: item.product.id,
                              variantKey: variant.id,
                              addonIds: addons.map((addon) => addon.id),
                              addons,
                              name: item.name,
                              price:
                                variant.price +
                                addons.reduce((sum, addon) => sum + addon.price, 0),
                              variantLabel: variant.name,
                              image: item.image ?? currentCategoryData?.image,
                              categoryId: item.categoryId,
                              categoryName: item.categoryName,
                              subCategoryName: item.subCategoryName,
                            })
                          }
                        />
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-20 text-center">
                  <p className="font-serif text-2xl text-neutral-400 italic">
                    No matches found for &quot;{searchQuery}&quot;
                  </p>
                </div>
              )}
            </div>

            <div className="hidden lg:block">
              <div className="sticky top-44 space-y-8">
                <div className="relative aspect-[3/4] overflow-hidden rounded-[2.5rem] shadow-2xl">
                  {currentCategoryData ? (
                    <Image
                      alt={currentCategoryData.name}
                      className="size-full object-cover"
                      height={720}
                      src={currentCategoryData.image}
                      width={540}
                    />
                  ) : null}
                  <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-smogy-primary/80 via-transparent to-transparent p-8">
                    <p className="mb-2 text-xs font-bold tracking-widest text-smogy-secondary uppercase">
                      Featured Category
                    </p>
                    <h3 className="font-serif text-3xl font-bold text-white">
                      {currentCategoryData?.name}
                    </h3>
                  </div>
                </div>

                <div className="relative overflow-hidden rounded-[2.5rem] bg-smogy-primary p-8 text-white">
                  <div className="relative z-10">
                    <h4 className="mb-4 font-serif text-2xl font-bold">
                      Special Event Delivery?
                    </h4>
                    <p className="mb-6 text-sm text-white/60">
                      Planning a birthday or wedding? We deliver custom setups
                      and live stations!
                    </p>
                    <button className="w-full rounded-2xl bg-smogy-secondary py-4 font-bold text-white transition-all hover:scale-[1.02] active:scale-95">
                      Enquire Now
                    </button>
                  </div>
                  <div className="absolute -right-10 -bottom-10 size-40 rounded-full bg-white/5" />
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

function MenuItemCard({
  item,
  onAdd,
}: {
  item: SmogyMenuItem;
  onAdd: (
    variant: SmogyMenuItem["variants"][number],
    addons: StorefrontAddon[],
  ) => void;
}) {
  const [selectedAddonIds, setSelectedAddonIds] = useState<string[]>([]);
  const [addonError, setAddonError] = useState<string | null>(null);
  const selectedAddons = item.product.addonGroups.flatMap((group) =>
    group.addons.filter((addon) => selectedAddonIds.includes(addon.id)),
  );

  function selectedCountForGroup(groupId: string) {
    const group = item.product.addonGroups.find((itemGroup) => itemGroup.id === groupId);
    return (
      group?.addons.filter((addon) => selectedAddonIds.includes(addon.id)).length ??
      0
    );
  }

  function toggleAddon(groupId: string, addonId: string) {
    const group = item.product.addonGroups.find((itemGroup) => itemGroup.id === groupId);

    if (!group) {
      return;
    }

    setAddonError(null);
    setSelectedAddonIds((currentIds) => {
      if (currentIds.includes(addonId)) {
        return currentIds.filter((id) => id !== addonId);
      }

      const groupSelectedCount = group.addons.filter((addon) =>
        currentIds.includes(addon.id),
      ).length;
      const maxSelect = group.maxSelect > 0 ? group.maxSelect : group.addons.length;

      if (groupSelectedCount >= maxSelect) {
        setAddonError(`Choose up to ${maxSelect} option(s) for ${group.name}.`);
        return currentIds;
      }

      return [...currentIds, addonId];
    });
  }

  function validateAddonSelection() {
    for (const group of item.product.addonGroups) {
      const count = selectedCountForGroup(group.id);
      const minRequired = group.isRequired
        ? Math.max(group.minSelect, 1)
        : group.minSelect;

      if (count < minRequired) {
        setAddonError(`Choose at least ${minRequired} option(s) for ${group.name}.`);
        return false;
      }
    }

    setAddonError(null);
    return true;
  }

  function addVariant(variant: SmogyMenuItem["variants"][number]) {
    if (!validateAddonSelection()) {
      return;
    }

    onAdd(variant, selectedAddons);
  }

  return (
    <div className="group rounded-3xl border border-smogy-cream bg-white p-6 transition-all hover:border-smogy-secondary/30 hover:shadow-xl hover:shadow-smogy-secondary/5">
      <div className="mb-4 flex items-start justify-between">
        <h3 className="text-xl font-bold text-smogy-primary transition-colors group-hover:text-smogy-secondary">
          {item.name}
        </h3>
        <button
          className="text-smogy-primary/20 transition-colors hover:text-smogy-secondary"
          onClick={() => {
            const variant =
              item.variants.find((variantItem) => variantItem.isDefault) ??
              item.variants[0];

            if (variant) {
              addVariant(variant);
            }
          }}
          type="button"
        >
          <ShoppingBag className="size-5" />
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {item.variants.map((variant) => (
          <button
            className="rounded-xl border border-neutral-100 bg-neutral-50 px-3 py-1.5 text-left transition-all hover:border-smogy-secondary/20 hover:bg-smogy-secondary/10"
            key={variant.id}
            onClick={() => addVariant(variant)}
            type="button"
          >
            <span className="block text-[10px] font-bold tracking-widest text-neutral-400 uppercase">
              {variant.name}
            </span>
            <span className="font-bold text-smogy-primary">
              Rs. {variant.price.toLocaleString()}
            </span>
          </button>
        ))}
      </div>

      {item.product.addonGroups.length ? (
        <div className="mt-5 space-y-4 border-t border-smogy-primary/10 pt-4">
          {item.product.addonGroups.map((group) => (
            <div key={group.id}>
              <div className="mb-2 flex items-center justify-between gap-3">
                <p className="text-xs font-black tracking-[0.16em] text-smogy-primary uppercase">
                  {group.name}
                </p>
                <span className="rounded-full bg-smogy-primary/5 px-2 py-1 text-[10px] font-bold text-smogy-primary/70">
                  {group.isRequired ? "Required" : "Optional"} · max{" "}
                  {group.maxSelect || group.addons.length}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {group.addons.map((addon) => {
                  const isSelected = selectedAddonIds.includes(addon.id);

                  return (
                    <label
                      className={`flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-2 text-xs font-bold transition ${
                        isSelected
                          ? "border-smogy-primary bg-smogy-primary text-white"
                          : "border-neutral-100 bg-neutral-50 text-smogy-primary hover:border-smogy-secondary/30"
                      }`}
                      key={addon.id}
                    >
                      <input
                        checked={isSelected}
                        className="sr-only"
                        type="checkbox"
                        onChange={() => toggleAddon(group.id, addon.id)}
                      />
                      <span>{addon.name}</span>
                      <span
                        className={
                          isSelected ? "text-white/80" : "text-neutral-400"
                        }
                      >
                        +Rs. {addon.price.toLocaleString()}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          ))}
          {addonError ? (
            <p className="rounded-xl bg-red-50 px-3 py-2 text-xs font-semibold text-red-600">
              {addonError}
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

export function SmogyCheckoutPage() {
  const router = useRouter();
  const {
    basePath,
    clearCart,
    currency,
    data,
    items,
    orderType,
    selectedBranchId,
    setOrderType,
    setSelectedBranchId,
    totalPrice,
    restaurantSlug,
    updateQuantity,
  } = useSmogyStorefront();
  const [formState, setFormState] = useState(initialCheckoutForm);
  const [checkoutStep, setCheckoutStep] = useState<1 | 2>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkoutBranches = useMemo(
    () =>
      data.branches.filter((branch) =>
        orderType === "delivery" ? branch.supportsDelivery : branch.supportsPickup,
      ),
    [data.branches, orderType],
  );
  const checkoutBranch =
    checkoutBranches.find((branch) => branch.id === selectedBranchId) ?? null;
  const effectiveDeliveryZoneId =
    formState.deliveryZoneId || checkoutBranch?.deliveryZones[0]?.id || "";
  const selectedDeliveryZone =
    orderType === "delivery"
      ? (checkoutBranch?.deliveryZones.find(
          (zone) => zone.id === effectiveDeliveryZoneId,
        ) ?? checkoutBranch?.deliveryZones[0] ?? null)
      : null;
  const checkoutDeliveryFee = selectedDeliveryZone?.fee ?? 0;
  const checkoutGrandTotal =
    totalPrice + (orderType === "delivery" ? checkoutDeliveryFee : 0);

  useEffect(() => {
    if (
      selectedBranchId &&
      !checkoutBranches.some((branch) => branch.id === selectedBranchId)
    ) {
      setSelectedBranchId("");
    }
  }, [checkoutBranches, selectedBranchId, setSelectedBranchId]);

  const branchAvailabilityNotice = (() => {
    if (!selectedBranchId) {
      return null;
    }

    if (!checkoutBranch) {
      return {
        tone: "error" as const,
        message: `Selected branch does not support ${orderType}.`,
      };
    }

    if (!checkoutBranch.isOpenNow) {
      return {
        tone: "warning" as const,
        message: `${checkoutBranch.name} is closed right now. Please choose another open branch or try again during opening hours.`,
      };
    }

    return null;
  })();
  const isBranchCurrentlyUnavailable = branchAvailabilityNotice != null;
  const paymentMethodLabel =
    orderType === "delivery" ? "Cash on Delivery" : "Cash on Pickup";
  const orderNotesCount = formState.orderNotes.length;

  function handleChange(field: keyof CheckoutForm, value: string) {
    setFormState((current) => ({ ...current, [field]: value }));
  }

  function handleFulfillmentChange(nextOrderType: "delivery" | "pickup") {
    setOrderType(nextOrderType);
    setCheckoutStep(1);
    setError(null);
  }

  function validateStepOne() {
    if (items.length === 0) {
      return "Your cart is empty.";
    }

    if (isBranchCurrentlyUnavailable) {
      return branchAvailabilityNotice?.message ?? "Selected branch is unavailable.";
    }

    if (!checkoutBranch) {
      return "Please select a branch.";
    }

    if (!checkoutBranch.isOpenNow) {
      return "Selected branch is not accepting orders right now.";
    }

    if (formState.customerName.trim().length < 2) {
      return "Please enter the customer name.";
    }

    if (formState.customerPhone.trim().length < 7) {
      return "Please enter a valid phone number.";
    }

    if (orderType === "delivery" && !formState.deliveryAddress.trim()) {
      return "Delivery address is required.";
    }

    if (orderType === "delivery" && !selectedDeliveryZone) {
      return "Please select a delivery zone.";
    }

    return null;
  }

  function buildDeliveryNotes() {
    return [
      selectedDeliveryZone ? `Delivery zone: ${selectedDeliveryZone.name}` : null,
      formState.landmark.trim()
        ? `Landmark: ${formState.landmark.trim()}`
        : null,
    ]
      .filter(Boolean)
      .join(" | ");
  }

  function handleContinueToReview() {
    const validationError = validateStepOne();

    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    setCheckoutStep(2);
  }

  function handleQuantityChange(
    item: (typeof items)[number],
    nextQuantity: number,
  ) {
    const delta = nextQuantity - item.quantity;

    if (delta !== 0) {
      updateQuantity(item.key, delta);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const validationError = validateStepOne();

    if (validationError) {
      setError(validationError);
      setCheckoutStep(1);
      return;
    }

    const currentBranch = checkoutBranch;

    if (!currentBranch) {
      setError("Please select a branch.");
      setCheckoutStep(1);
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/storefront/${restaurantSlug}/orders`, {
        body: JSON.stringify({
          branchId: currentBranch.id,
          fulfillmentType: orderType,
          customer: {
            name: formState.customerName,
            phone: formState.customerPhone,
          },
          addressText:
            orderType === "delivery" ? formState.deliveryAddress : undefined,
          deliveryZoneId:
            orderType === "delivery"
              ? selectedDeliveryZone?.id
              : undefined,
          deliveryNotes:
            orderType === "delivery" ? buildDeliveryNotes() || undefined : undefined,
          orderNotes: formState.orderNotes.trim() || undefined,
          items: items.map((item) => ({
            productId: item.itemId,
            variantId: item.variantKey,
            quantity: item.quantity,
            addonIds: item.addonIds,
          })),
        }),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });
      const payload = (await response.json()) as
        | { accessToken: string; orderNumber: string }
        | { error?: string };

      if (!response.ok || !("orderNumber" in payload) || !("accessToken" in payload)) {
        throw new Error(
          "error" in payload && payload.error
            ? payload.error
            : "Unable to place order right now.",
        );
      }

      clearCart();
      startTransition(() => {
        router.push(
          `${basePath}/order-success/${payload.orderNumber}?token=${encodeURIComponent(
            payload.accessToken,
          )}`,
        );
      });
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Unable to place order right now.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-smogy-cream px-6 pt-28">
        <div className="mx-auto max-w-3xl rounded-[2rem] border border-smogy-cream bg-white p-10 text-center shadow-xl">
          <ShoppingBag className="mx-auto mb-6 size-12 text-smogy-primary/30" />
          <h1 className="mb-3 font-serif text-3xl font-bold text-smogy-primary">
            Your cart is empty
          </h1>
          <p className="mb-8 text-neutral-500">
            Add a few items from the menu before checking out.
          </p>
          <Link className="btn-primary" href={`${basePath}/menu`}>
            Go to Menu
          </Link>
        </div>
      </div>
    );
  }

  const sidebarCards =
    checkoutStep === 1
      ? [
          {
            icon: Wallet,
            title: "Payment Method",
            description: paymentMethodLabel,
          },
          {
            icon: Clock,
            title: "Estimated Delivery Time",
            description: "30-45 min • On-time, every time",
          },
          {
            icon: MapPin,
            title: "WhatsApp Routed Orders",
            description: "Your complete order is sent to the branch team",
          },
          {
            icon: ShieldCheck,
            title: "Fresh & On-Time",
            description: "Made fresh and delivered with care, always.",
          },
        ]
      : [
          {
            icon: Wallet,
            title: "Payment Summary",
            description: paymentMethodLabel,
          },
          {
            icon: Clock,
            title: "Estimated Delivery Time",
            description: "30-45 min • On-time, every time",
          },
          {
            icon: MapPin,
            title: "Branch Confirmation",
            description: "The branch team receives the full order details",
          },
        ];

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#fbf7f1] pt-28 pb-20">
      <div className="absolute top-32 left-[-6rem] h-72 w-72 rounded-full bg-[#f5effb] blur-3xl" />
      <div className="absolute top-40 right-[-4rem] h-80 w-80 rounded-full bg-[#ffe7d7] blur-3xl" />

      <div className="relative mx-auto max-w-[1400px] px-6">
        <Link
          className="mb-8 inline-flex items-center gap-2 text-[#5d2396] hover:text-[#ff8a3d]"
          href={`${basePath}/menu`}
        >
          <ArrowLeft className="size-[18px]" />
          Back to Menu
        </Link>

        <div className="grid items-start gap-7 xl:grid-cols-[minmax(0,1.65fr)_minmax(360px,0.9fr)]">
          <form
            className="space-y-6 rounded-[28px] border border-[#e9e2ee] bg-white p-6 shadow-[0_28px_70px_-42px_rgba(74,25,127,0.35)] md:p-8 xl:p-9"
            onSubmit={handleSubmit}
          >
            <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
              <div className="max-w-2xl">
                <p className="mb-3 text-xs font-black tracking-[0.32em] text-[#ff8a3d] uppercase">
                  Checkout
                </p>
                <h1 className="font-serif text-4xl leading-none font-black text-[#5d2396] md:text-[56px]">
                  {checkoutStep === 1 ? "Complete Your Order" : "Review Your Order"}
                </h1>
                <p className="mt-4 text-sm text-[#7e748c] md:text-base">
                  {checkoutStep === 1
                    ? "Add your delivery details and confirm your payment method to continue."
                    : "Confirm your details before placing your order."}
                </p>
              </div>

              <CheckoutStepper step={checkoutStep} />
            </div>

            {checkoutStep === 1 ? (
              <>
                <div className="rounded-full border border-[#e9e2ee] bg-white p-1.5 shadow-[0_18px_40px_-35px_rgba(74,25,127,0.4)]">
                  <div className="grid gap-2 sm:grid-cols-2">
                    {[
                      { value: "delivery" as const, title: "Delivery", icon: Bike },
                      { value: "pickup" as const, title: "Pickup", icon: Store },
                    ].map((option) => {
                      const Icon = option.icon;

                      return (
                        <button
                          className={`flex items-center justify-center gap-2 rounded-full px-5 py-4 text-sm font-bold transition-all md:text-base ${
                            orderType === option.value
                              ? "bg-[#5d2396] text-white shadow-[0_18px_34px_-24px_rgba(93,35,150,0.8)]"
                              : "text-[#3d3151] hover:bg-[#f5effb]"
                          }`}
                          key={option.value}
                          onClick={() => handleFulfillmentChange(option.value)}
                          type="button"
                        >
                          <Icon className="size-4.5" />
                          <span>{option.title}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <CheckoutPanelSection
                  description=""
                  icon={Phone}
                  title="Contact Details"
                >
                  <div className="grid gap-4 md:grid-cols-2">
                    <CheckoutInput
                      label="Customer Name"
                      onChange={(value) => handleChange("customerName", value)}
                      placeholder="Enter your full name"
                      required
                      value={formState.customerName}
                      variant="white"
                    />
                    <CheckoutInput
                      label="Phone Number"
                      onChange={(value) => handleChange("customerPhone", value)}
                      placeholder="03XX-XXXXXXX"
                      required
                      type="tel"
                      value={formState.customerPhone}
                      variant="white"
                    />
                  </div>
                </CheckoutPanelSection>

                <CheckoutPanelSection
                  description={
                    orderType === "delivery"
                      ? "Share your location details so we can deliver to you."
                      : "Choose the branch where the customer will collect this order."
                  }
                  icon={MapPin}
                  title={orderType === "delivery" ? "Delivery Details" : "Pickup Details"}
                >
                  <div className="space-y-5">
                    <CheckoutSelect
                      label="Branch"
                      onChange={(value) => setSelectedBranchId(value)}
                      options={checkoutBranches.map((branch) => ({
                        label: `${branch.name}${
                          !branch.isOpenNow ? " (Closed right now)" : ""
                        }`,
                        value: branch.id,
                      }))}
                      placeholder="Select a branch"
                      value={selectedBranchId}
                    />

                    {!checkoutBranches.length ? (
                      <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                        No branch is currently configured for{" "}
                        {orderType === "delivery" ? "delivery" : "pickup"} orders.
                      </div>
                    ) : null}

                    {checkoutBranch ? (
                      <div className="rounded-[18px] border border-[#ece4f2] bg-[#faf7fe] px-5 py-4 text-sm text-[#7e748c]">
                        <div className="flex flex-wrap items-center gap-3 text-[#5d2396]">
                          <span className="font-bold">{checkoutBranch.name}</span>
                          <span className="text-xs">
                            {checkoutBranch.isOpenNow
                              ? "Accepting orders"
                              : "Closed right now"}
                          </span>
                        </div>
                        <p className="mt-2">{checkoutBranch.addressText}</p>
                      </div>
                    ) : null}

                    {orderType === "delivery" ? (
                      <>
                        <CheckoutTextarea
                          label="Delivery Address"
                          onChange={(value) =>
                            handleChange("deliveryAddress", value)
                          }
                          placeholder="House No., Street, Area, Landmark"
                          required
                          rows={4}
                          value={formState.deliveryAddress}
                          variant="white"
                        />

                        <div className="grid gap-4 md:grid-cols-2">
                          <CheckoutSelect
                            label="Delivery Zone"
                            onChange={(value) =>
                              handleChange("deliveryZoneId", value)
                            }
                            options={(checkoutBranch?.deliveryZones ?? []).map(
                              (zone) => ({
                                label: `${zone.name} - ${formatSmogyMoney(currency, zone.fee)}`,
                                value: zone.id,
                              }),
                            )}
                            placeholder={
                              checkoutBranch?.deliveryZones.length
                                ? "Select delivery zone"
                                : "No delivery zones configured"
                            }
                            value={effectiveDeliveryZoneId}
                          />
                          <CheckoutInput
                            label="Landmark (Optional)"
                            onChange={(value) => handleChange("landmark", value)}
                            placeholder="E.g., Near Main Gate, Blue Building"
                            value={formState.landmark}
                            variant="white"
                          />
                        </div>

                        {selectedDeliveryZone ? (
                          <div className="rounded-2xl border border-[#eadff2] bg-[#f8f1fd] px-4 py-3 text-sm text-[#5d2396]">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <span className="font-bold">
                                {selectedDeliveryZone.name}
                              </span>
                              <span className="font-black">
                                {formatSmogyMoney(
                                  currency,
                                  selectedDeliveryZone.fee,
                                )}
                              </span>
                            </div>
                            {selectedDeliveryZone.minimumOrderAmount ? (
                              <p className="mt-1 text-xs text-[#7e748c]">
                                Minimum order:{" "}
                                {formatSmogyMoney(
                                  currency,
                                  selectedDeliveryZone.minimumOrderAmount,
                                )}
                              </p>
                            ) : null}
                          </div>
                        ) : null}

                        <div className="flex items-start gap-3 rounded-2xl border border-[#d8e7ff] bg-[#eaf2ff] px-4 py-3 text-sm text-[#4a5f87]">
                          <BadgeInfo className="mt-0.5 size-4 shrink-0 text-[#4f73b8]" />
                          <p>
                            Delivery fee and minimum order are calculated from
                            the selected branch delivery zone.
                          </p>
                        </div>
                      </>
                    ) : null}
                  </div>
                </CheckoutPanelSection>

                <CheckoutPanelSection
                  description=""
                  icon={CreditCard}
                  title="Payment Method"
                >
                  <PaymentMethodCard
                    accentLabel="Only available method"
                    helperText={
                      orderType === "delivery"
                        ? "Pay in cash when your order is delivered."
                        : "Pay in cash when you collect your order."
                    }
                    noteText={
                      orderType === "delivery"
                        ? "No online payment required"
                        : "No advance payment required"
                    }
                    title={paymentMethodLabel}
                  />
                </CheckoutPanelSection>

                <CheckoutPanelSection
                  description=""
                  icon={FileText}
                  title="Notes (Optional)"
                >
                  <CheckoutTextarea
                    counter={`${orderNotesCount}/200`}
                    label=""
                    maxLength={200}
                    onChange={(value) => handleChange("orderNotes", value)}
                    placeholder="Add any special instructions for the rider (e.g., Don't ring the bell, Leave at gate, etc.)"
                    rows={4}
                    value={formState.orderNotes}
                    variant="white"
                  />
                </CheckoutPanelSection>

                {branchAvailabilityNotice ? (
                  <div
                    className={`rounded-2xl px-4 py-3 text-sm ${
                      branchAvailabilityNotice.tone === "warning"
                        ? "border border-amber-200 bg-amber-50 text-amber-800"
                        : "border border-red-200 bg-red-50 text-red-700"
                    }`}
                  >
                    {branchAvailabilityNotice.message}
                  </div>
                ) : null}

                {error ? (
                  <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                  </div>
                ) : null}

                <button
                  className="flex h-14 w-full items-center justify-center gap-3 rounded-full bg-[#5d2396] px-6 text-base font-bold text-white shadow-[0_25px_50px_-28px_rgba(93,35,150,0.95)] transition hover:bg-[#4a197f]"
                  onClick={handleContinueToReview}
                  type="button"
                >
                  <span>Continue to Review</span>
                  <ArrowRight className="size-4.5" />
                </button>

                <CheckoutSecurityNote />
              </>
            ) : (
              <>
                <CheckoutReviewBlock icon={Truck} title="Order Type">
                  <div className="rounded-[16px] border border-[#e3d8f0] bg-[#f5effb] px-4 py-4 text-sm font-bold text-[#5d2396]">
                    <div className="flex items-center gap-3">
                      {orderType === "delivery" ? (
                        <Bike className="size-4.5" />
                      ) : (
                        <Store className="size-4.5" />
                      )}
                      <span>{orderType === "delivery" ? "Delivery" : "Pickup"}</span>
                    </div>
                  </div>
                </CheckoutReviewBlock>

                <CheckoutReviewBlock
                  action={
                    <button
                      className="inline-flex items-center gap-2 text-sm font-bold text-[#5d2396] hover:text-[#4a197f]"
                      onClick={() => setCheckoutStep(1)}
                      type="button"
                    >
                      <Pencil className="size-4" />
                      Edit
                    </button>
                  }
                  icon={MapPin}
                  title={orderType === "delivery" ? "Delivering To" : "Collecting From"}
                >
                  <div className="space-y-3 text-sm text-[#3d3151]">
                    <div className="grid gap-2 md:grid-cols-2">
                      <p className="font-semibold">{formState.customerName}</p>
                      <p className="text-[#7e748c]">{formState.customerPhone}</p>
                    </div>
                    {orderType === "delivery" ? (
                      <>
                        <p>{formState.deliveryAddress}</p>
                        <p className="text-[#7e748c]">
                          {[selectedDeliveryZone?.name, formState.landmark]
                            .filter(Boolean)
                            .join(" • ") || "No delivery zone selected"}
                        </p>
                      </>
                    ) : (
                      <>
                        <p className="font-semibold text-[#5d2396]">
                          {checkoutBranch?.name ?? "Branch not selected"}
                        </p>
                        <p className="text-[#7e748c]">
                          {checkoutBranch?.addressText ?? "Select a branch to continue"}
                        </p>
                      </>
                    )}
                  </div>
                </CheckoutReviewBlock>

                <CheckoutReviewBlock icon={CreditCard} title="Payment Method">
                  <PaymentMethodCard
                    accentLabel="Only available method"
                    helperText={
                      orderType === "delivery"
                        ? "Pay in cash when your order is delivered."
                        : "Pay in cash when you collect your order."
                    }
                    noteText={
                      orderType === "delivery"
                        ? "No online payment required"
                        : "No advance payment required"
                    }
                    title={paymentMethodLabel}
                  />
                </CheckoutReviewBlock>

                <CheckoutReviewBlock icon={ShoppingBag} title="Items in Your Order">
                  <div className="space-y-4">
                    {items.map((item) => (
                      <div
                        className="flex flex-col gap-4 rounded-[18px] border border-[#ece4f2] bg-white p-4 md:flex-row md:items-center"
                        key={item.key}
                      >
                        <div className="flex min-w-0 flex-1 items-center gap-4">
                          <div className="relative h-16 w-16 overflow-hidden rounded-2xl bg-[#f5effb]">
                            <Image
                              alt={item.name}
                              className="size-full object-cover"
                              fill
                              sizes="64px"
                              src={
                                item.image ?? "/storefront/smogyice/hero-oreo-ice-cream.jpg"
                              }
                            />
                          </div>
                          <div className="min-w-0">
                            <p className="truncate font-bold text-[#3d3151]">
                              {item.name}
                            </p>
                            <p className="text-sm text-[#7e748c]">
                              {item.variantLabel}
                            </p>
                            {item.addons.length ? (
                              <p className="text-sm text-[#7e748c]">
                                Add-ons:{" "}
                                {item.addons.map((addon) => addon.name).join(", ")}
                              </p>
                            ) : null}
                            <p className="text-sm text-[#7e748c]">
                              Qty: {item.quantity}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 md:ml-auto">
                          <select
                            className="rounded-xl border border-[#e9e2ee] bg-white px-3 py-2 text-sm text-[#3d3151] focus:border-[#5d2396] focus:outline-none"
                            onChange={(event) =>
                              handleQuantityChange(item, Number(event.target.value))
                            }
                            value={item.quantity}
                          >
                            {Array.from({ length: 10 }, (_, index) => index + 1).map(
                              (quantityOption) => (
                                <option key={quantityOption} value={quantityOption}>
                                  {quantityOption}
                                </option>
                              ),
                            )}
                          </select>
                          <p className="min-w-20 text-right font-bold text-[#3d3151]">
                            {formatSmogyMoney(currency, item.price * item.quantity)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CheckoutReviewBlock>

                <CheckoutReviewBlock icon={FileText} title="Order Notes (Optional)">
                  <div className="rounded-[16px] border border-[#ece4f2] bg-white px-4 py-4 text-sm text-[#7e748c]">
                    {formState.orderNotes || "No additional note added."}
                  </div>
                </CheckoutReviewBlock>

                <div className="grid gap-4 lg:grid-cols-3">
                  {[
                    {
                      icon: ShieldCheck,
                      title: "Secure Ordering",
                      description: "Your data is protected and safe with us.",
                    },
                    {
                      icon: Truck,
                      title: "Fast & Reliable Delivery",
                      description:
                        "Quick delivery from your nearest open branch.",
                    },
                    {
                      icon: MapPin,
                      title: "Branch Confirmation",
                      description:
                        "Your selected branch receives the complete order.",
                    },
                  ].map((card) => (
                    <CheckoutTrustCard
                      description={card.description}
                      icon={card.icon}
                      key={card.title}
                      title={card.title}
                    />
                  ))}
                </div>

                {error ? (
                  <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                  </div>
                ) : null}

                <button
                  className="h-14 w-full rounded-full bg-[#5d2396] px-6 text-base font-bold text-white shadow-[0_25px_50px_-28px_rgba(93,35,150,0.95)] transition hover:bg-[#4a197f] disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={isSubmitting || isBranchCurrentlyUnavailable}
                  type="submit"
                >
                  {isSubmitting ? "Placing Order..." : "Place Order"}
                </button>

                <button
                  className="flex h-14 w-full items-center justify-center gap-2 rounded-full border border-[#7c4cb0] bg-white px-6 text-base font-bold text-[#5d2396] transition hover:bg-[#f5effb]"
                  onClick={() => setCheckoutStep(1)}
                  type="button"
                >
                  <ArrowLeft className="size-4.5" />
                  <span>Back to Delivery & Payment</span>
                </button>

                <CheckoutSecurityNote />
              </>
            )}
          </form>

          <aside className="h-fit rounded-[28px] border border-[#e9e2ee] bg-white p-6 shadow-[0_28px_70px_-42px_rgba(74,25,127,0.35)] md:p-8">
            <div className="mb-6 flex items-center justify-between gap-4">
              <h2 className="text-[32px] leading-none font-black text-[#5d2396]">
                Your Order
              </h2>
              <Link
                className="inline-flex items-center gap-2 text-sm font-bold text-[#5d2396] hover:text-[#4a197f]"
                href={`${basePath}/menu`}
              >
                <Pencil className="size-4" />
                Edit Cart
              </Link>
            </div>

            <div className="mb-8 space-y-5">
              {items.map((item) => (
                <div
                  className="flex items-start justify-between gap-4 border-b border-[#efe7f4] pb-5"
                  key={item.key}
                >
                  <div className="flex min-w-0 items-center gap-4">
                    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl bg-[#f5effb]">
                      <Image
                        alt={item.name}
                        className="size-full object-cover"
                        fill
                        sizes="64px"
                        src={
                          item.image ?? "/storefront/smogyice/hero-oreo-ice-cream.jpg"
                        }
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-lg font-bold text-[#3d3151]">
                        {item.name}
                      </p>
                      <p className="text-sm text-[#7e748c]">{item.variantLabel}</p>
                      {item.addons.length ? (
                        <p className="text-sm text-[#7e748c]">
                          Add-ons:{" "}
                          {item.addons.map((addon) => addon.name).join(", ")}
                        </p>
                      ) : null}
                      <p className="text-sm text-[#7e748c]">
                        Qty: {item.quantity}
                      </p>
                    </div>
                  </div>
                  <p className="text-lg font-bold text-[#3d3151]">
                    {formatSmogyMoney(currency, item.price * item.quantity)}
                  </p>
                </div>
              ))}
            </div>

            <div className="mb-8 space-y-4 text-sm text-[#7e748c]">
              <SummaryRow
                label="Items total"
                value={formatSmogyMoney(currency, totalPrice)}
              />
              {orderType === "delivery" ? (
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <span>Delivery Fee</span>
                    <BadgeInfo className="size-4 text-[#5d2396]" />
                  </div>
                  <span className="font-bold text-[#3d3151]">
                    {formatSmogyMoney(currency, checkoutDeliveryFee)}
                  </span>
                </div>
              ) : null}
            </div>

            <div className="mb-8 border-t border-[#efe7f4] pt-6">
              <div className="flex items-center justify-between gap-4 text-[#5d2396]">
                <span className="text-[22px] font-black">Total Amount</span>
                <span className="text-[22px] font-black">
                  {formatSmogyMoney(currency, checkoutGrandTotal)}
                </span>
              </div>
            </div>

            <div className="space-y-4">
              {sidebarCards.map((card) => (
                <CheckoutSidebarFeatureCard
                  description={card.description}
                  icon={card.icon}
                  key={card.title}
                  title={card.title}
                />
              ))}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

function CheckoutStepper({ step }: { step: 1 | 2 }) {
  return (
    <div className="flex shrink-0 items-center gap-3 text-sm">
      <StepperPoint
        isActive={step === 1}
        isComplete={step === 2}
        label="Delivery & Payment"
        number={1}
      />
      <div className="h-px w-12 bg-[#d9cfdf]" />
      <StepperPoint
        isActive={step === 2}
        isComplete={false}
        label="Review"
        number={2}
      />
    </div>
  );
}

function StepperPoint({
  label,
  number,
  isActive,
  isComplete,
}: {
  label: string;
  number: number;
  isActive: boolean;
  isComplete: boolean;
}) {
  return (
    <div className="flex items-center gap-2">
      <span
        className={`flex size-8 items-center justify-center rounded-full text-xs font-black ${
          isActive || isComplete
            ? "bg-[#5d2396] text-white"
            : "bg-[#b7b0bf] text-white"
        }`}
      >
        {isComplete ? <CheckCircle2 className="size-4" /> : number}
      </span>
      <span
        className={`font-semibold ${
          isActive || isComplete ? "text-[#5d2396]" : "text-[#8e8599]"
        }`}
      >
        {label}
      </span>
    </div>
  );
}

function CheckoutPanelSection({
  title,
  description,
  icon: Icon,
  children,
}: {
  title: string;
  description: string;
  icon: typeof Phone;
  children: ReactNode;
}) {
  return (
    <section className="rounded-[20px] border border-[#e9e2ee] bg-white p-5 shadow-[0_18px_36px_-34px_rgba(74,25,127,0.35)] md:p-6">
      <div className="mb-5">
        <div className="flex items-center gap-3 text-[#5d2396]">
          <div className="flex size-9 items-center justify-center rounded-full bg-[#f5effb]">
            <Icon className="size-4.5" />
          </div>
          <h3 className="text-lg font-bold">{title}</h3>
        </div>
        {description ? (
          <p className="mt-3 text-sm text-[#7e748c]">{description}</p>
        ) : null}
      </div>
      {children}
    </section>
  );
}

function CheckoutReviewBlock({
  title,
  icon: Icon,
  action,
  children,
}: {
  title: string;
  icon: typeof Phone;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="rounded-[20px] border border-[#e9e2ee] bg-white p-5 shadow-[0_18px_36px_-34px_rgba(74,25,127,0.35)] md:p-6">
      <div className="mb-5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 text-[#5d2396]">
          <div className="flex size-9 items-center justify-center rounded-full bg-[#f5effb]">
            <Icon className="size-4.5" />
          </div>
          <h3 className="text-lg font-bold">{title}</h3>
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

function CheckoutInput({
  label,
  value,
  onChange,
  placeholder,
  required,
  type = "text",
  variant = "cream",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  type?: "text" | "tel";
  variant?: "cream" | "white";
}) {
  return (
    <label className="space-y-2">
      <span className="text-sm font-bold text-[#5d2396]">{label}</span>
      <input
        className={`w-full rounded-xl border border-[#e9e2ee] px-4 py-3.5 text-sm text-[#3d3151] placeholder:text-[#a9a0b4] focus:border-[#5d2396] focus:outline-none ${
          variant === "white" ? "bg-white" : "bg-[#fbf7f1]"
        }`}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        required={required}
        type={type}
        value={value}
      />
    </label>
  );
}

function CheckoutSelect({
  label,
  value,
  onChange,
  options,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ label: string; value: string }>;
  placeholder: string;
}) {
  return (
    <label className="space-y-2">
      <span className="text-sm font-bold text-[#5d2396]">{label}</span>
      <select
        className="w-full rounded-xl border border-[#e9e2ee] bg-white px-4 py-3.5 text-sm text-[#3d3151] focus:border-[#5d2396] focus:outline-none"
        onChange={(event) => onChange(event.target.value)}
        value={value}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function CheckoutTextarea({
  label,
  value,
  onChange,
  placeholder,
  required,
  rows,
  maxLength,
  counter,
  variant = "cream",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  rows: number;
  maxLength?: number;
  counter?: string;
  variant?: "cream" | "white";
}) {
  return (
    <label className="block space-y-2">
      {label ? (
        <span className="text-sm font-bold text-[#5d2396]">{label}</span>
      ) : null}
      <textarea
        className={`w-full rounded-xl border border-[#e9e2ee] px-4 py-3.5 text-sm text-[#3d3151] placeholder:text-[#a9a0b4] focus:border-[#5d2396] focus:outline-none ${
          variant === "white" ? "bg-white" : "bg-[#fbf7f1]"
        }`}
        maxLength={maxLength}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        required={required}
        rows={rows}
        value={value}
      />
      {counter ? (
        <div className="text-right text-xs text-[#9a90a8]">{counter}</div>
      ) : null}
    </label>
  );
}

function PaymentMethodCard({
  title,
  accentLabel,
  helperText,
  noteText,
}: {
  title: string;
  accentLabel: string;
  helperText: string;
  noteText: string;
}) {
  return (
    <div className="rounded-[20px] border border-[#7c4cb0] bg-[linear-gradient(135deg,#fff_0%,#faf7fe_100%)] p-5 shadow-[0_22px_45px_-34px_rgba(93,35,150,0.5)]">
      <div className="flex flex-col gap-5 md:flex-row md:items-center">
        <div className="flex size-20 items-center justify-center rounded-full bg-[#f5effb] text-[#5d2396]">
          <HandCoins className="size-10" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <h4 className="text-2xl font-bold text-[#5d2396]">{title}</h4>
            <span className="rounded-full bg-[#ffe1c7] px-3 py-1 text-xs font-bold text-[#ff8a3d]">
              {accentLabel}
            </span>
          </div>
          <p className="mt-2 text-sm text-[#7e748c]">{helperText}</p>
          <div className="mt-3 flex items-center gap-2 text-sm font-semibold text-[#5d2396]">
            <CheckCircle2 className="size-4" />
            <span>{noteText}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span>{label}</span>
      <span className="font-bold text-[#3d3151]">{value}</span>
    </div>
  );
}

function CheckoutSidebarFeatureCard({
  icon: Icon,
  title,
  description,
}: {
  icon: typeof Phone;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-center gap-4 rounded-[20px] bg-[#f5effb] px-4 py-5">
      <div className="flex size-12 items-center justify-center rounded-full bg-white text-[#5d2396] shadow-sm">
        <Icon className="size-5" />
      </div>
      <div>
        <p className="font-bold text-[#5d2396]">{title}</p>
        <p className="mt-1 text-sm text-[#7e748c]">{description}</p>
      </div>
    </div>
  );
}

function CheckoutTrustCard({
  icon: Icon,
  title,
  description,
}: {
  icon: typeof Phone;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-[18px] bg-[#f5effb] px-4 py-5">
      <div className="mb-3 flex size-11 items-center justify-center rounded-full bg-white text-[#5d2396]">
        <Icon className="size-5" />
      </div>
      <p className="font-bold text-[#5d2396]">{title}</p>
      <p className="mt-1 text-sm text-[#7e748c]">{description}</p>
    </div>
  );
}

function CheckoutSecurityNote() {
  return (
    <div className="flex items-center justify-center gap-2 text-sm text-[#8e8599]">
      <Lock className="size-4" />
      <span>Your data is safe and secure with us.</span>
    </div>
  );
}

export function SmogyOrderSuccessPage({
  order,
}: {
  order: StorefrontOrderSummary;
}) {
  const { basePath, data } = useSmogyStorefront();
  const homePath = basePath || "/";
  const supportPhone = data.restaurant.supportPhone || smogyDisplayPhone;
  const supportEmail = data.restaurant.contactEmail || smogyEmail;
  const isDelivery = order.fulfillmentType === "delivery";
  const paymentMethodLabel = isDelivery
    ? "Cash on Delivery"
    : "Cash on Pickup";
  const etaLabel = isDelivery ? "30-45 min" : "15-20 min";
  const etaHelper = isDelivery
    ? "On-time, every time"
    : "Fresh and ready for pickup";
  const isPendingConfirmation = order.status === "pending_confirmation";
  const confirmationTitle = isPendingConfirmation
    ? "Order Placed!"
    : order.status === "cancelled"
      ? "Order Cancelled"
      : "Order Confirmed!";
  const confirmationSubtitle = isPendingConfirmation
    ? "Your order has been sent to the restaurant for confirmation."
    : order.status === "cancelled"
      ? "The restaurant has cancelled this order."
      : "Your order has been confirmed and is being prepared.";
  const confirmationMessage = isPendingConfirmation
    ? "The restaurant has received your order request. You will be notified once staff confirm or cancel it."
    : order.status === "cancelled"
      ? "Please contact the restaurant if you need help placing another order."
      : isDelivery
        ? "Your order is confirmed. We'll prepare and deliver it as soon as possible."
        : "Your order is confirmed. We'll prepare it for pickup as soon as possible.";
  const orderTypeValue = isDelivery ? "Delivery" : "Pickup";
  const orderTypeHelper = isDelivery
    ? "We'll deliver it to you"
    : "We'll prepare it for pickup";
  const summaryCards = [
    {
      title: "Payment Method",
      description: `${paymentMethodLabel}\n${
        isDelivery
          ? "Pay in cash when your order is delivered."
          : "Pay in cash when you collect your order."
      }`,
      icon: Wallet,
    },
    {
      title: "Estimated Delivery Time",
      description: `${etaLabel} • ${etaHelper}`,
      icon: Clock,
    },
    {
      title: "Fresh & On-Time",
      description: "Made fresh and delivered with care, always.",
      icon: ShieldCheck,
    },
  ] as const;
  const supportItems = [
    {
      title: "Need help with your order?",
      text: "Our support team is here for you.",
      icon: Headset,
    },
    {
      title: supportPhone,
      text: "Call us",
      icon: Phone,
    },
    {
      title: supportEmail,
      text: "Email us",
      icon: Mail,
    },
    {
      title: "10:00 AM - 12:00 AM",
      text: "We're available",
      icon: Clock,
    },
  ] as const;
  const primaryItemImage = "/storefront/smogyice/blizzard-smogy.png";

  return (
    <div className="bg-[#fbf7f1] px-6 pb-20 pt-28 md:pt-32">
      <div className="mx-auto max-w-[1400px]">
        <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1.85fr)_minmax(320px,0.95fr)]">
          <section className="rounded-[28px] border border-[#e9e2ee] bg-white p-6 shadow-[0_32px_80px_-48px_rgba(74,25,127,0.45)] md:p-8 lg:p-9">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
              <div className="flex items-start gap-5">
                <div className="relative shrink-0">
                  <div className="flex size-[86px] items-center justify-center rounded-full bg-[#22b857] text-white shadow-[0_18px_40px_-22px_rgba(34,184,87,0.75)]">
                    <Check className="size-10 stroke-[3]" />
                  </div>
                  <span className="absolute -top-2 left-3 size-2 rounded-full bg-[#ff7a3d]" />
                  <span className="absolute top-2 -right-3 size-2.5 rounded-full bg-[#5d2396]" />
                  <span className="absolute -bottom-1 -left-2 size-2.5 rounded-full bg-[#f6c24a]" />
                  <span className="absolute right-2 -bottom-3 size-2 rounded-full bg-[#22b857]" />
                </div>
                <div>
                  <p className="text-xs font-black tracking-[0.32em] text-[#ff7a3d] uppercase">
                    ORDER SUCCESS
                  </p>
                  <h1 className="mt-3 font-serif text-[clamp(2.2rem,4vw,3.2rem)] font-bold leading-none text-[#4a197f]">
                    {confirmationTitle}
                  </h1>
                  <p className="mt-4 max-w-2xl text-base text-[#7e748c] md:text-lg">
                    {confirmationSubtitle}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8 rounded-[20px] border border-[#eadff2] bg-[#f5effb] p-6">
              <div className="grid gap-6 md:grid-cols-2 md:divide-x md:divide-[#ddcfeb]">
                <div className="md:pr-6">
                  <p className="text-xs font-black tracking-[0.24em] text-[#5d2396] uppercase">
                    Order Number
                  </p>
                  <p className="mt-3 text-[30px] font-black text-[#4a197f]">
                    {order.orderNumber.startsWith("#")
                      ? order.orderNumber
                      : `#${order.orderNumber}`}
                  </p>
                </div>
                <div className="md:pl-6">
                  <p className="text-xs font-black tracking-[0.24em] text-[#5d2396] uppercase">
                    Estimated {isDelivery ? "Delivery" : "Pickup"}
                  </p>
                  <div className="mt-3 flex items-center gap-3 text-[#4a197f]">
                    <div className="flex size-10 items-center justify-center rounded-full bg-white text-[#5d2396] shadow-sm">
                      <Clock className="size-5" />
                    </div>
                    <div>
                      <p className="text-[26px] font-black leading-none">
                        {etaLabel}
                      </p>
                      <p className="mt-1 text-sm text-[#7e748c]">{etaHelper}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-start gap-3 rounded-[18px] border border-[#d6e7ff] bg-[#eef6ff] px-5 py-4 text-[#3d3151]">
              <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-white text-[#5d2396]">
                <BadgeInfo className="size-4" />
              </div>
              <p className="text-sm leading-6 md:text-[15px]">
                {confirmationMessage}
              </p>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div className="rounded-[18px] border border-[#e9e2ee] bg-white p-5 shadow-[0_16px_32px_-28px_rgba(74,25,127,0.35)]">
                <div className="flex items-start gap-4">
                  <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-[#f5effb] text-[#5d2396]">
                    {isDelivery ? (
                      <Bike className="size-5" />
                    ) : (
                      <ShoppingBag className="size-5" />
                    )}
                  </div>
                  <div>
                    <p className="text-[11px] font-black tracking-[0.22em] text-[#5d2396] uppercase">
                      Order Type
                    </p>
                    <p className="mt-2 text-xl font-black text-[#3d3151]">
                      {orderTypeValue}
                    </p>
                    <p className="mt-1 text-sm text-[#7e748c]">
                      {orderTypeHelper}
                    </p>
                  </div>
                </div>
              </div>
              <div className="rounded-[18px] border border-[#e9e2ee] bg-white p-5 shadow-[0_16px_32px_-28px_rgba(74,25,127,0.35)]">
                <div className="flex items-start gap-4">
                  <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-[#f5effb] text-[#5d2396]">
                    <Wallet className="size-5" />
                  </div>
                  <div>
                    <p className="text-[11px] font-black tracking-[0.22em] text-[#5d2396] uppercase">
                      Payment Method
                    </p>
                    <p className="mt-2 text-xl font-black text-[#3d3151]">
                      {paymentMethodLabel}
                    </p>
                    <p className="mt-1 text-sm text-[#7e748c]">
                      {isDelivery
                        ? "Pay when your order arrives"
                        : "Pay when you collect your order"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <section className="mt-6 rounded-[20px] border border-[#e9e2ee] bg-white p-5 shadow-[0_18px_36px_-34px_rgba(74,25,127,0.35)] md:p-6">
              <div className="flex items-center gap-3 text-[#5d2396]">
                <div className="flex size-10 items-center justify-center rounded-full bg-[#f5effb]">
                  <MapPin className="size-5" />
                </div>
                <h2 className="text-lg font-bold uppercase tracking-[0.08em]">
                  {isDelivery ? "Delivery Details" : "Pickup Details"}
                </h2>
              </div>
              <div className="mt-5 grid gap-5 md:grid-cols-3 md:divide-x md:divide-[#e9e2ee]">
                <div className="space-y-2 md:pr-5">
                  <p className="text-sm font-semibold text-[#7e748c]">
                    Customer Name
                  </p>
                  <p className="text-base font-bold text-[#3d3151]">
                    {order.customerName}
                  </p>
                </div>
                <div className="space-y-2 md:px-5">
                  <p className="text-sm font-semibold text-[#7e748c]">
                    Phone Number
                  </p>
                  <p className="text-base font-bold text-[#3d3151]">
                    {order.customerPhone}
                  </p>
                </div>
                <div className="space-y-2 md:pl-5">
                  <p className="text-sm font-semibold text-[#7e748c]">
                    {isDelivery ? "Delivery Address" : "Pickup Branch"}
                  </p>
                  <div className="space-y-1.5 text-[#3d3151]">
                    <p className="text-base font-bold">
                      {isDelivery
                        ? order.addressText || "Address provided at checkout"
                        : order.branchName}
                    </p>
                    <p className="text-sm text-[#7e748c]">
                      {isDelivery
                        ? `Assigned branch: ${order.branchName}`
                        : "Please collect from your selected branch."}
                    </p>
                    <p className="text-sm text-[#7e748c]">Pakistan</p>
                  </div>
                </div>
              </div>
            </section>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <Link
                className="inline-flex h-14 items-center justify-center gap-3 rounded-[18px] border border-[#5d2396] bg-white px-6 text-base font-bold text-[#5d2396] transition hover:bg-[#f5effb]"
                href={homePath}
              >
                <House className="size-5" />
                <span>Back to Home</span>
              </Link>
              <a
                className="inline-flex h-14 items-center justify-center gap-3 rounded-[18px] bg-[#5d2396] px-6 text-base font-bold text-white shadow-[0_18px_36px_-24px_rgba(93,35,150,0.75)] transition hover:bg-[#4a197f]"
                href={`tel:${smogyDisplayPhone.replace(/[^+\d]/g, "")}`}
              >
                <Headset className="size-5" />
                <span>Contact Support</span>
              </a>
            </div>

            <div className="mt-6 rounded-[20px] bg-[#f5effb] px-5 py-4 md:px-6">
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4 xl:divide-x xl:divide-[#ddd3e7]">
                {supportItems.map((item, index) => (
                  <div
                    className={`flex items-start gap-3 ${
                      index === 0
                        ? "xl:pr-4"
                        : index === supportItems.length - 1
                          ? "xl:pl-4"
                          : "xl:px-4"
                    }`}
                    key={item.title}
                  >
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-white text-[#5d2396] shadow-sm">
                      <item.icon className="size-5" />
                    </div>
                    <div>
                      <p className="font-bold text-[#5d2396]">{item.title}</p>
                      <p className="mt-1 text-sm text-[#7e748c]">{item.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <aside className="rounded-[28px] border border-[#e9e2ee] bg-white p-6 shadow-[0_32px_80px_-48px_rgba(74,25,127,0.45)] md:p-8">
            <div className="mb-6 flex items-center justify-between gap-4">
              <h2 className="text-[28px] font-black text-[#5d2396]">
                Order Summary
              </h2>
              <Link
                className="inline-flex items-center gap-2 text-sm font-bold text-[#5d2396] transition hover:text-[#4a197f]"
                href={`${basePath}/menu`}
              >
                <Pencil className="size-4" />
                <span>Edit Cart</span>
              </Link>
            </div>

            <div className="space-y-5">
              {order.items.map((item, index) => (
                <div
                  className={`flex items-start gap-4 ${
                    index !== order.items.length - 1
                      ? "border-b border-[#efe7f4] pb-5"
                      : ""
                  }`}
                  key={`${item.name}-${item.variantName}-${index}`}
                >
                  <div className="relative size-[72px] overflow-hidden rounded-[18px] bg-[#f5effb]">
                    <Image
                      alt={item.name}
                      className="object-cover"
                      fill
                      sizes="72px"
                      src={primaryItemImage}
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-lg font-black text-[#3d3151]">
                      {item.name}
                    </p>
                    <p className="mt-1 text-sm text-[#7e748c]">
                      {item.variantName}
                    </p>
                    <p className="mt-1 text-sm text-[#7e748c]">
                      Qty: {item.quantity}
                    </p>
                  </div>
                  <p className="text-lg font-black text-[#3d3151]">
                    {formatSmogyMoney(order.currency, item.lineTotal)}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-6 space-y-4 text-sm text-[#7e748c]">
              <SummaryRow
                label="Items Total"
                value={formatSmogyMoney(order.currency, order.subtotal)}
              />
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <span>{isDelivery ? "Delivery Fee" : "Pickup Fee"}</span>
                  <BadgeInfo className="size-4 text-[#5d2396]" />
                </div>
                <span className="font-bold text-[#3d3151]">
                  {formatSmogyMoney(order.currency, order.deliveryFee)}
                </span>
              </div>
            </div>

            <div className="mt-6 border-t border-[#efe7f4] pt-6">
              <div className="flex items-center justify-between gap-4 text-[#5d2396]">
                <span className="text-[22px] font-black">Total Amount</span>
                <span className="text-[22px] font-black">
                  {formatSmogyMoney(order.currency, order.grandTotal)}
                </span>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              {summaryCards.map((card) => (
                <CheckoutSidebarFeatureCard
                  description={card.description}
                  icon={card.icon}
                  key={card.title}
                  title={card.title}
                />
              ))}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
