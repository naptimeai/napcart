import Link from "next/link";
import {
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  CircleHelp,
  ExternalLink,
  FileText,
  Folder,
  Package,
  Store,
} from "lucide-react";
import {
  ActionTile,
  AdminWorkspace,
  EmptyState,
  IconBubble,
  PageTitle,
  Panel,
  PanelHeader,
  ProductThumb,
  StatCard,
  StatusBadge,
  formatAdminDecimal,
} from "@/components/admin/phase45-ui";
import { PageNotice } from "@/components/admin/primitives";
import { requireAdminSession } from "@/lib/auth/admin-session";
import { getCatalogManagementData } from "@/server/repositories/restaurant-admin";

type CatalogPageProps = {
  searchParams?: Promise<{
    notice?: string;
    error?: string;
  }>;
};

export default async function CatalogOverviewPage({
  searchParams,
}: CatalogPageProps) {
  const session = await requireAdminSession();
  const params = searchParams ? await searchParams : undefined;
  const data = await getCatalogManagementData(session.restaurantId);
  const activeCategories = data.categories.filter((category) => category.isActive);
  const activeBranches = data.branches.filter(
    (branch) => branch.isAcceptingOrders && !branch.isTemporarilyClosed,
  );
  const activeProducts = data.products.filter(
    (product) => product.isActive && product.isAvailable,
  );
  const draftChanges = data.categories.filter((category) => !category.isActive).length +
    data.products.filter((product) => !product.isActive || !product.isAvailable).length;
  const recentProducts = [...data.products]
    .sort((left, right) => right.updatedAt.getTime() - left.updatedAt.getTime())
    .slice(0, 6);
  const latestPublishedDate = recentProducts[0]?.updatedAt ?? new Date();

  return (
    <AdminWorkspace>
      <div className="space-y-6">
        {typeof params?.notice === "string" ? (
          <PageNotice message={params.notice} />
        ) : null}
        {typeof params?.error === "string" ? (
          <PageNotice message={params.error} tone="error" />
        ) : null}

        <PageTitle
          action={
            <StatusBadge tone="green">
              <CheckCircle2 className="size-3.5" />
              Published
            </StatusBadge>
          }
          description="Get a summary of your catalog and keep your menu up to date."
          meta={
            <div className="hidden items-center gap-3 text-sm text-[#555] md:flex">
              <CalendarDays className="size-5 text-[#111]" />
              <div>
                <p className="font-semibold text-[#111]">Last published</p>
                <p>
                  {latestPublishedDate.toLocaleDateString("en-PK", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}{" "}
                  -{" "}
                  {latestPublishedDate.toLocaleTimeString("en-PK", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          }
          title="Overview"
        />

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          <StatCard
            action={<CardAction href="/admin/catalog/categories" label="Manage categories" />}
            icon={Folder}
            label="Total categories"
            note="All organized and up to date"
            value={data.categories.length}
          />
          <StatCard
            action={<CardAction href="/admin/catalog/products" label="View products" />}
            icon={Package}
            label="Total products"
            note={`${activeProducts.length} available right now`}
            value={data.products.length}
          />
          <StatCard
            action={<CardAction href="/admin/branches" label="Manage branches" />}
            icon={Store}
            label="Active branches"
            note={`${activeBranches.length} accepting orders`}
            value={data.branches.length}
          />
          <StatCard
            action={<CardAction href="/admin/catalog/products" label="Review changes" />}
            icon={FileText}
            label="Draft changes"
            note="Unpublished or unavailable records"
            tone="yellow"
            value={draftChanges}
          />
        </div>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(320px,380px)]">
          <div className="min-w-0 space-y-6">
            <Panel className="p-6">
              <PanelHeader
                description="Common tasks to manage your catalog."
                title="Quick actions"
              />
              <div className="mt-6 grid gap-4 lg:grid-cols-3">
                <ActionTile
                  description="Create a new category"
                  href="/admin/catalog/categories"
                  icon={Folder}
                  title="Add category"
                />
                <ActionTile
                  description="Create a new product"
                  href="/admin/catalog/products/new"
                  icon={Package}
                  title="Add product"
                />
                <ActionTile
                  description="Add or update branches"
                  href="/admin/branches"
                  icon={Store}
                  title="Manage branches"
                />
              </div>
            </Panel>

            <Panel className="p-6">
              <PanelHeader
                action={
                  <Link
                    className="inline-flex items-center gap-1 text-sm font-semibold text-[#111]"
                    href="/admin/catalog/products"
                  >
                    View all products
                    <ChevronRight className="size-4" />
                  </Link>
                }
                description="Latest products added or updated."
                title="Recent products"
              />
              {recentProducts.length ? (
                <div className="mt-5 overflow-x-auto">
                  <table className="w-full min-w-[760px] text-left text-sm">
                    <thead>
                      <tr className="border-b border-[#e7e7e3] text-xs font-semibold text-[#555]">
                        <th className="py-3 pr-4">Product</th>
                        <th className="px-4 py-3">Category</th>
                        <th className="px-4 py-3">Price (PKR)</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="pl-4 py-3">Updated</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentProducts.map((product) => (
                        <tr
                          className="border-b border-[#eeeeea] last:border-b-0"
                          key={product.id}
                        >
                          <td className="py-3 pr-4">
                            <div className="flex items-center gap-3">
                              <ProductThumb
                                alt={product.name}
                                className="size-10"
                                src={product.imageUrl}
                              />
                              <span className="font-semibold text-[#111]">
                                {product.name}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-[#555]">
                            {product.category.name}
                          </td>
                          <td className="px-4 py-3 text-[#111]">
                            {formatAdminDecimal(product.basePrice)}
                          </td>
                          <td className="px-4 py-3">
                            <StatusBadge
                              tone={
                                product.isActive && product.isAvailable
                                  ? "green"
                                  : "yellow"
                              }
                            >
                              {product.isActive && product.isAvailable
                                ? "Published"
                                : "Draft"}
                            </StatusBadge>
                          </td>
                          <td className="pl-4 py-3 text-[#555]">
                            {product.updatedAt.toLocaleDateString("en-PK", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="mt-5">
                  <EmptyState
                    description="Create your first product once categories are ready."
                    title="No products yet"
                  />
                </div>
              )}
            </Panel>
          </div>

          <Panel className="min-w-0 flex flex-col p-6">
            <PanelHeader
              description="Follow these steps to get the most out of your catalog."
              title="Recommended next steps"
            />
            <div className="mt-7 space-y-5">
              <CompletedStep
                description={`Great start! You have ${activeCategories.length} active categories.`}
                title="Create your first category"
              />
              <CompletedStep
                description={`Awesome! You have ${data.products.length} products.`}
                title="Add your first product"
              />
              <PendingStep
                description="Add a branch to make your menu available in more locations."
                href="/admin/branches"
                number={3}
                title="Add a branch"
              />
              <PendingStep
                description="Review and publish your draft changes when ready."
                href="/admin/catalog/products"
                number={4}
                title="Review draft changes"
              />
              <PendingStep
                description="Make your menu live for all customers."
                href="/admin/catalog"
                number={5}
                title="Publish your catalog"
              />
            </div>
            <Link
              className="mt-auto flex items-center gap-4 rounded-[12px] border border-[#deded8] p-4"
              href="/admin/settings"
            >
              <CircleHelp className="size-6" />
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold text-[#111]">
                  Need help?
                </span>
                <span className="mt-1 block text-xs text-[#777]">
                  Check setup settings or contact support.
                </span>
              </span>
              <ExternalLink className="size-4" />
            </Link>
          </Panel>
        </div>
      </div>
    </AdminWorkspace>
  );
}

function CardAction({ href, label }: { href: string; label: string }) {
  return (
    <Link
      className="relative z-10 flex items-center justify-between text-sm font-semibold !text-[#111] opacity-100"
      href={href}
    >
      {label}
      <ChevronRight className="size-5 !text-[#111]" />
    </Link>
  );
}

function CompletedStep({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="flex gap-4">
      <IconBubble className="size-8" icon={CheckCircle2} tone="green" />
      <div>
        <p className="text-sm font-semibold text-[#111]">{title}</p>
        <p className="mt-1 text-sm leading-5 text-[#777]">{description}</p>
      </div>
    </div>
  );
}

function PendingStep({
  number,
  title,
  description,
  href,
}: {
  number: number;
  title: string;
  description: string;
  href: string;
}) {
  return (
    <Link
      className="flex items-center gap-4 rounded-[12px] border border-[#deded8] p-4 transition hover:border-[var(--admin-primary)] hover:bg-[var(--admin-primary-softer)]"
      href={href}
    >
      <span className="flex size-8 items-center justify-center rounded-full bg-[#eeeeeb] text-sm font-semibold text-[#111]">
        {number}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold text-[#111]">{title}</span>
        <span className="mt-1 block text-sm leading-5 text-[#777]">
          {description}
        </span>
      </span>
      <ChevronRight className="size-5" />
    </Link>
  );
}
