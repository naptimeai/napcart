"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import {
  Mail,
  MapPin,
  Menu as MenuIcon,
  Minus,
  Phone,
  Plus,
  ShoppingBag,
  Trash2,
  Truck,
  X,
} from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  formatSmogyMoney,
  SmogyStorefrontProvider,
  useSmogyStorefront,
} from "@/components/storefront/smogy-context";
import type { StorefrontData } from "@/server/storefront/types";

const smogyLogo = "/storefront/smogyice/smogyice-logo.png";
const smogyDisplayPhone = "0301-1417221";
const smogyEmail = "smogyice@gmail.com";
const socialIcons = [
  { label: "Instagram", Icon: InstagramIcon, href: "https://www.instagram.com/smogyice" },
  { label: "Facebook", Icon: FacebookIcon, href: "https://www.facebook.com/smogyice" },
  { label: "Twitter", Icon: TwitterIcon, href: "https://x.com/smogyice" },
];

function BrandWordmark({ name }: { name: string }) {
  const normalizedName = name.replace(/\s+/g, "").toLowerCase();

  if (normalizedName === "smogyice") {
    return (
      <>
        Smogy<span className="text-smogy-secondary">Ice</span>
      </>
    );
  }

  return name;
}

export function SmogyStorefrontShell({
  children,
  data,
  restaurantSlug,
}: {
  children: ReactNode;
  data: StorefrontData;
  restaurantSlug: string;
}) {
  return (
    <SmogyStorefrontProvider data={data} restaurantSlug={restaurantSlug}>
      <div className="min-h-screen">
        <Navbar />
        <main>{children}</main>
        <Footer />
      </div>
    </SmogyStorefrontProvider>
  );
}

function useHashScroller() {
  const pathname = usePathname();
  const previousPathname = useRef<string | null>(null);

  useEffect(() => {
    function scrollToCurrentHash(behavior: ScrollBehavior) {
      if (!window.location.hash) {
        window.scrollTo(0, 0);
        return;
      }

      const element = document.getElementById(window.location.hash.replace("#", ""));
      if (element) {
        const offsetPosition =
          element.getBoundingClientRect().top + window.scrollY - 80;
        window.scrollTo({ top: offsetPosition, behavior });
      }
    }

    const isInitialMount = previousPathname.current === null;
    const didPathChange = previousPathname.current !== pathname;
    previousPathname.current = pathname;
    const timer =
      !isInitialMount && didPathChange
        ? window.setTimeout(() => scrollToCurrentHash("auto"), 100)
        : undefined;
    const handleHashChange = () => {
      window.setTimeout(() => scrollToCurrentHash("smooth"), 0);
    };

    window.addEventListener("hashchange", handleHashChange);

    return () => {
      if (timer) {
        window.clearTimeout(timer);
      }
      window.removeEventListener("hashchange", handleHashChange);
    };
  }, [pathname]);
}

function Navbar() {
  const { basePath, data, totalItems, setDrawerOpen } = useSmogyStorefront();
  const homePath = basePath || "/";
  const brandName = data.restaurant.name;
  const logoUrl = data.restaurant.logoUrl || smogyLogo;
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useHashScroller();

  useEffect(() => {
    function handleScroll() {
      setIsScrolled(window.scrollY > 50);
    }

    handleScroll();
    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems = [
    { label: "Menu", href: `${basePath}/menu` },
    { label: "Favorites", href: `${basePath}#menu` },
    { label: "Events", href: `${basePath}#events` },
    { label: "Branches", href: `${basePath}#branches` },
  ];

  return (
    <>
      <nav
        className={`fixed top-0 right-0 left-0 z-40 transition-all duration-300 ${
          isScrolled
            ? "bg-white/80 py-3 shadow-md backdrop-blur-lg"
            : "bg-transparent py-5"
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6">
          <Link className="flex items-center gap-3" href={homePath}>
            <Image
              alt={`${brandName} logo`}
              className="size-11 shrink-0 rounded-full object-cover shadow-lg"
              height={44}
              src={logoUrl}
              width={44}
            />
            <span className="font-serif text-2xl font-bold tracking-tight text-smogy-primary">
              <BrandWordmark name={brandName} />
            </span>
          </Link>

          <div className="hidden items-center gap-8 md:flex">
            {navItems.map((item) => (
              <Link
                className="font-medium !text-smogy-primary transition-colors hover:!text-smogy-secondary"
                href={item.href}
                key={item.label}
              >
                {item.label}
              </Link>
            ))}
            <div className="flex items-center gap-4">
              <button
                className="group relative rounded-full border border-smogy-cream bg-white p-2.5 transition-all hover:border-smogy-secondary/30"
                onClick={() => setDrawerOpen(true)}
                type="button"
              >
                <ShoppingBag className="size-[22px] text-smogy-primary transition-colors group-hover:text-smogy-secondary" />
                {totalItems > 0 ? (
                  <span className="absolute -top-1 -right-1 flex size-5 animate-in items-center justify-center rounded-full bg-smogy-secondary text-[10px] font-bold text-white shadow-lg zoom-in">
                    {totalItems}
                  </span>
                ) : null}
              </button>
              <Link
                className="flex items-center gap-2 rounded-full bg-smogy-primary px-6 py-2.5 font-semibold !text-white shadow-md shadow-smogy-primary/20 transition-all hover:scale-105 active:scale-95"
                href={`${basePath}/menu`}
              >
                <span className="!text-white">Order Now</span>
              </Link>
            </div>
          </div>

          <div className="flex items-center gap-3 md:hidden">
            <button
              className="relative rounded-full border border-smogy-cream bg-white p-2"
              onClick={() => setDrawerOpen(true)}
              type="button"
            >
              <ShoppingBag className="size-[22px] text-smogy-primary" />
              {totalItems > 0 ? (
                <span className="absolute -top-1 -right-1 flex size-5 items-center justify-center rounded-full bg-smogy-secondary text-[10px] font-bold text-white shadow-lg">
                  {totalItems}
                </span>
              ) : null}
            </button>
            <button
              className="p-2 text-smogy-primary"
              onClick={() => setIsMobileMenuOpen((value) => !value)}
              type="button"
            >
              {isMobileMenuOpen ? (
                <X className="size-7" />
              ) : (
                <MenuIcon className="size-7" />
              )}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {isMobileMenuOpen ? (
            <motion.div
              animate={{ opacity: 1, y: 0 }}
              className="absolute top-full right-0 left-0 flex flex-col gap-4 border-t bg-white p-6 shadow-2xl md:hidden"
              exit={{ opacity: 0, y: -20 }}
              initial={{ opacity: 0, y: -20 }}
            >
              {navItems.map((item) => (
                <Link
                  className="py-2 text-lg font-medium !text-smogy-primary"
                  href={item.href}
                  key={item.label}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              <Link
                className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-smogy-secondary py-4 font-bold !text-white"
                href={`${basePath}/menu`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <ShoppingBag className="size-5" />
                <span className="!text-white">Order Now</span>
              </Link>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </nav>
      <CartDrawer />
    </>
  );
}

function CartDrawer() {
  const router = useRouter();
  const {
    basePath,
    currency,
    isDrawerOpen,
    items,
    orderType,
    removeItem,
    setDrawerOpen,
    setOrderType,
    totalPrice,
    updateQuantity,
  } = useSmogyStorefront();

  function handleExploreMenu() {
    setDrawerOpen(false);
    router.push(`${basePath}/menu`);
  }

  function handleCheckout() {
    setDrawerOpen(false);
    router.push(`${basePath}/checkout`);
  }

  return (
    <AnimatePresence>
      {isDrawerOpen ? (
        <>
          <motion.button
            animate={{ opacity: 1 }}
            aria-label="Close cart"
            className="fixed inset-0 z-[1000] bg-smogy-primary/40 backdrop-blur-sm"
            exit={{ opacity: 0 }}
            initial={{ opacity: 0 }}
            onClick={() => setDrawerOpen(false)}
            type="button"
          />

          <motion.div
            animate={{ x: 0 }}
            className="fixed top-0 right-0 bottom-0 z-[1001] flex w-full max-w-md flex-col bg-white shadow-2xl"
            exit={{ x: "100%" }}
            initial={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
          >
            <div className="flex items-center justify-between border-b border-neutral-100 p-6">
              <div className="flex items-center gap-3">
                <div className="flex size-12 items-center justify-center rounded-2xl bg-smogy-secondary/10 text-smogy-secondary">
                  <ShoppingBag className="size-6" />
                </div>
                <div>
                  <h2 className="font-serif text-xl font-black text-smogy-primary">
                    Your Cart
                  </h2>
                  <p className="text-xs font-bold tracking-widest text-neutral-400 uppercase">
                    Smogy Ice Delights
                  </p>
                </div>
              </div>
              <button
                className="rounded-full p-2 transition-colors hover:bg-neutral-50"
                onClick={() => setDrawerOpen(false)}
                type="button"
              >
                <X className="size-6 text-smogy-primary" />
              </button>
            </div>

            <div className="border-b border-neutral-100 bg-neutral-50/30 p-4 px-6">
              <div className="flex rounded-2xl bg-neutral-100 p-1.5">
                <button
                  className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-black tracking-widest uppercase transition-all ${
                    orderType === "delivery"
                      ? "bg-white text-smogy-secondary shadow-sm"
                      : "text-smogy-primary/40 hover:text-smogy-primary"
                  }`}
                  onClick={() => setOrderType("delivery")}
                  type="button"
                >
                  <Truck className="size-4" />
                  Delivery
                </button>
                <button
                  className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-black tracking-widest uppercase transition-all ${
                    orderType === "pickup"
                      ? "bg-white text-smogy-secondary shadow-sm"
                      : "text-smogy-primary/40 hover:text-smogy-primary"
                  }`}
                  onClick={() => setOrderType("pickup")}
                  type="button"
                >
                  <ShoppingBag className="size-4" />
                  Pickup
                </button>
              </div>
            </div>

            <div className="no-scrollbar flex-1 space-y-6 overflow-y-auto p-6">
              {items.length > 0 ? (
                items.map((item) => (
                  <div className="group flex gap-4" key={item.key}>
                    <div className="min-w-0 flex-1">
                      <div className="mb-1 flex items-start justify-between">
                        <h3 className="truncate font-bold text-smogy-primary transition-colors group-hover:text-smogy-secondary">
                          {item.name}
                        </h3>
                        <button
                          className="text-neutral-300 transition-colors hover:text-red-500"
                          onClick={() => removeItem(item.key)}
                          type="button"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                      <p className="mb-3 text-xs font-medium text-neutral-400">
                        {item.variantLabel
                          ? `Variant: ${item.variantLabel}`
                          : "Standard"}
                      </p>
                      {item.addons.length ? (
                        <p className="-mt-2 mb-3 text-xs leading-5 text-neutral-500">
                          Add-ons:{" "}
                          {item.addons.map((addon) => addon.name).join(", ")}
                        </p>
                      ) : null}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 rounded-lg border border-neutral-100 bg-neutral-50 p-1 px-2">
                          <button
                            className="rounded-md p-1 text-smogy-primary transition-all hover:bg-white hover:shadow-sm"
                            onClick={() => updateQuantity(item.key, -1)}
                            type="button"
                          >
                            <Minus className="size-3.5" />
                          </button>
                          <span className="min-w-5 text-center text-sm font-bold">
                            {item.quantity}
                          </span>
                          <button
                            className="rounded-md p-1 text-smogy-primary transition-all hover:bg-white hover:shadow-sm"
                            onClick={() => updateQuantity(item.key, 1)}
                            type="button"
                          >
                            <Plus className="size-3.5" />
                          </button>
                        </div>
                        <span className="font-black text-smogy-primary">
                          {formatSmogyMoney(
                            currency,
                            item.price * item.quantity,
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex h-full flex-col items-center justify-center pb-20 text-center">
                  <div className="mb-6 flex size-32 items-center justify-center rounded-full bg-smogy-cream opacity-50">
                    <ShoppingBag className="size-12 text-smogy-primary/20" />
                  </div>
                  <h3 className="mb-2 font-serif text-2xl font-bold text-smogy-primary">
                    Cart is empty
                  </h3>
                  <p className="mb-8 max-w-60 text-neutral-400">
                    Looks like you haven&apos;t added any swirls to your cart
                    yet.
                  </p>
                  <button
                    className="rounded-2xl bg-smogy-primary px-8 py-4 font-bold text-white shadow-lg shadow-smogy-primary/20 transition-all hover:scale-105 active:scale-95"
                    onClick={handleExploreMenu}
                    type="button"
                  >
                    Explore Menu
                  </button>
                </div>
              )}
            </div>

            {items.length > 0 ? (
              <div className="border-t border-neutral-200 bg-smogy-cream p-6">
                <div className="mb-6 flex items-center justify-between">
                  <span className="text-xs font-bold tracking-wider text-neutral-500 uppercase">
                    Total Amount
                  </span>
                  <span className="font-serif text-3xl font-black text-smogy-primary">
                    {formatSmogyMoney(currency, totalPrice)}
                  </span>
                </div>
                <button
                  className="flex w-full items-center justify-center gap-3 rounded-2xl bg-smogy-secondary py-5 text-lg font-black text-white shadow-xl shadow-smogy-secondary/30 transition-all hover:scale-[1.02] active:scale-98"
                  onClick={handleCheckout}
                  type="button"
                >
                  Continue to Checkout
                  <Plus className="size-6 rotate-45" />
                </button>
                <p className="mt-4 text-center text-[10px] font-bold tracking-widest text-neutral-400 uppercase">
                  {orderType === "pickup"
                    ? "Pickup branch is selected at checkout"
                    : "Delivery branch and fee are confirmed at checkout"}
                </p>
              </div>
            ) : null}
          </motion.div>
        </>
      ) : null}
    </AnimatePresence>
  );
}

function Footer() {
  const { basePath, data } = useSmogyStorefront();
  const homePath = basePath || "/";
  const brandName = data.restaurant.name;
  const logoUrl = data.restaurant.logoUrl || smogyLogo;
  const supportPhone = data.restaurant.supportPhone || smogyDisplayPhone;
  const supportEmail = data.restaurant.contactEmail || smogyEmail;
  const navItems = [
    { label: "Menu", href: `${basePath}/menu` },
    { label: "Favorites", href: `${basePath}#menu` },
    { label: "Events", href: `${basePath}#events` },
    { label: "Branches", href: `${basePath}#branches` },
  ];

  return (
    <footer className="bg-smogy-primary pt-24 pb-12 text-white">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-16 grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-6">
            <Link className="flex items-center gap-3" href={homePath}>
              <Image
                alt={`${brandName} logo`}
                className="size-11 shrink-0 rounded-full object-cover"
                height={44}
                src={logoUrl}
                width={44}
              />
              <span className="font-serif text-2xl font-bold tracking-tight text-white">
                <BrandWordmark name={brandName} />
              </span>
            </Link>
            <p className="max-w-xs leading-relaxed text-white/60">
              {brandName} is Pakistan&apos;s favorite spot for handcrafted curl ice cream and
              premium desserts. Crafting happiness, one swirl at a time.
            </p>
            <div className="flex items-center gap-4">
              {socialIcons.map(({ Icon, href, label }) => (
                <a
                  className="flex size-10 items-center justify-center rounded-full border border-white/10 transition-colors hover:bg-white/10"
                  href={href}
                  key={label}
                  aria-label={label}
                  rel="noreferrer"
                  target="_blank"
                >
                  <Icon className="size-[18px]" />
                </a>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <h4 className="font-serif text-lg font-bold">Quick Links</h4>
            <ul className="space-y-4">
              {navItems.map((item) => (
                <li key={item.label}>
                  <Link
                    className="text-white/60 transition-colors hover:text-smogy-secondary"
                    href={item.href}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  className="text-white/60 transition-colors hover:text-smogy-secondary"
                  href="/menu"
                >
                  Order Menu
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-6">
            <h4 className="font-serif text-lg font-bold">Contact Us</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <Phone className="mt-1 size-[18px] shrink-0 text-smogy-secondary" />
                <span className="text-white/60">{supportPhone}</span>
              </li>
              <li className="flex items-start gap-3">
                <Mail className="mt-1 size-[18px] shrink-0 text-smogy-secondary" />
                <span className="text-white/60">{supportEmail}</span>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="mt-1 size-[18px] shrink-0 text-smogy-secondary" />
                <span className="text-white/60">Lahore, Pakistan</span>
              </li>
            </ul>
          </div>

          <div className="space-y-6">
            <h4 className="font-serif text-lg font-bold">Newsletter</h4>
            <p className="text-sm text-white/60">
              For offers and updates, contact {brandName} directly on social media.
            </p>
            <div className="flex gap-2">
              <input
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm focus:border-smogy-secondary focus:outline-none"
                placeholder="Newsletter coming soon"
                readOnly
                type="email"
              />
              <button
                className="rounded-xl bg-smogy-secondary p-3 transition-all hover:scale-105 active:scale-95"
                type="button"
                aria-label="Subscribe on Instagram"
              >
                <InstagramIcon className="size-5" />
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-4 border-t border-white/5 pt-12 text-sm text-white/40 md:flex-row">
          <p>© 2025 {brandName}. All rights reserved.</p>
          <div className="flex gap-8">
            <Link className="transition-colors hover:text-white" href="/">
              Privacy Policy
            </Link>
            <Link className="transition-colors hover:text-white" href="/">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className ?? "size-[18px]"}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <rect height="18" rx="5" ry="5" width="18" x="3" y="3" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <path d="M17.5 6.5h.01" />
    </svg>
  );
}

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className ?? "size-[18px]"}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

function TwitterIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className ?? "size-[18px]"}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path d="M22 4.01c-.77.35-1.6.58-2.46.69a4.25 4.25 0 0 0 1.88-2.35 8.5 8.5 0 0 1-2.7 1.03A4.24 4.24 0 0 0 11.5 7.25c0 .33.04.65.11.96A12.03 12.03 0 0 1 2.88 3.78a4.24 4.24 0 0 0 1.31 5.66 4.2 4.2 0 0 1-1.92-.53v.05a4.24 4.24 0 0 0 3.4 4.16 4.33 4.33 0 0 1-1.91.07 4.25 4.25 0 0 0 3.96 2.94A8.51 8.51 0 0 1 2 17.93a12.01 12.01 0 0 0 6.51 1.91c7.81 0 12.09-6.47 12.09-12.08v-.55A8.65 8.65 0 0 0 22 4.01z" />
    </svg>
  );
}
