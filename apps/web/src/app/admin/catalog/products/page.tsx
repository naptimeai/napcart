import {
  Copy,
  Filter,
  Package,
  Pencil,
  Plus,
  Store,
  Trash2,
} from "lucide-react";
import { deleteProduct, duplicateProduct } from "@/app/admin/actions";
import { ConfirmSubmitButton } from "@/components/admin/confirm-submit-button";
import {
  AdminWorkspace,
  FormSelect,
  PageTitle,
  Panel,
  PrimaryButton,
  ProductThumb,
  SearchBox,
  StatCard,
  StatusBadge,
  formatAdminDecimal,
} from "@/components/admin/phase45-ui";
import { PageNotice } from "@/components/admin/primitives";
import { requireAdminSession } from "@/lib/auth/admin-session";
import { getCatalogManagementData } from "@/server/repositories/restaurant-admin";

type ProductsPageProps = {
  searchParams?: Promise<{
    q?: string;
    category?: string;
    status?: string;
    notice?: string;
    error?: string;
  }>;
};

export default async function CatalogProductsPage({
  searchParams,
}: ProductsPageProps) {
  const session = await requireAdminSession();
  const params = searchParams ? await searchParams : undefined;
  const data = await getCatalogManagementData(session.restaurantId);
  const query = params?.q?.toLowerCase() ?? "";
  const categoryFilter = params?.category ?? "";
  const statusFilter = params?.status ?? "";
  const filteredProducts = data.products.filter((product) => {
    const matchesQuery =
      !query ||
      product.name.toLowerCase().includes(query) ||
      product.description?.toLowerCase().includes(query);
    const matchesCategory = !categoryFilter || product.categoryId === categoryFilter;
    const normalizedStatus =
      product.isActive && product.isAvailable ? "available" : "out";
    const matchesStatus = !statusFilter || normalizedStatus === statusFilter;

    return matchesQuery && matchesCategory && matchesStatus;
  });
  const visibleProducts = filteredProducts.slice(0, 10);
  const availableCount = data.products.filter(
    (product) => product.isActive && product.isAvailable,
  ).length;
  const outOfStockCount = data.products.length - availableCount;

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
            <PrimaryButton className="min-w-[176px]" href="/admin/catalog/products/new">
              <Plus className="size-5" />
              New product
            </PrimaryButton>
          }
          description="Manage all products in your catalog."
          title="Products"
        />

        <form className="grid gap-4 xl:grid-cols-[minmax(280px,460px)_190px_190px_1fr]">
          <SearchBox defaultValue={params?.q} placeholder="Search products..." />
          <FormSelect defaultValue={categoryFilter} name="category">
            <option value="">All categories</option>
            {data.categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </FormSelect>
          <FormSelect defaultValue={statusFilter} name="status">
            <option value="">All statuses</option>
            <option value="available">Available</option>
            <option value="out">Out of stock</option>
          </FormSelect>
          <button className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-[10px] border border-[#deded8] bg-white px-5 text-sm font-semibold text-[#111] xl:ml-auto xl:w-32">
            <Filter className="size-4" />
            Filters
          </button>
        </form>

        <Panel className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1040px] text-left text-sm">
              <thead>
                <tr className="border-b border-[#e7e7e3] text-sm font-semibold text-[#111]">
                  <th className="px-5 py-5">Product</th>
                  <th className="px-5 py-5">Category</th>
                  <th className="px-5 py-5">Price (PKR)</th>
                  <th className="px-5 py-5">Availability</th>
                  <th className="px-5 py-5">Branches</th>
                  <th className="px-5 py-5">Actions</th>
                </tr>
              </thead>
              <tbody>
                {visibleProducts.map((product) => {
                  const availableBranches = product.branchAvailability.filter(
                    (availability) => availability.isAvailable,
                  ).length;

                  return (
                    <tr
                      className="border-b border-[#eeeeea] last:border-b-0"
                      key={product.id}
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-4">
                          <ProductThumb alt={product.name} src={product.imageUrl} />
                          <div className="min-w-0">
                            <p className="truncate font-semibold text-[#111]">
                              {product.name}
                            </p>
                            <p className="mt-1 max-w-[250px] truncate text-sm text-[#777]">
                              {product.description ?? "No description added yet"}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-[#111]">
                        {product.category.name}
                      </td>
                      <td className="px-5 py-4 text-[#111]">
                        {formatAdminDecimal(product.basePrice)}
                      </td>
                      <td className="px-5 py-4">
                        <StatusBadge
                          tone={
                            product.isActive && product.isAvailable
                              ? "green"
                              : "gray"
                          }
                        >
                          {product.isActive && product.isAvailable
                            ? "Available"
                            : "Out of stock"}
                        </StatusBadge>
                      </td>
                      <td className="px-5 py-4 text-[#111]">
                        {availableBranches || data.branches.length}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <a
                            aria-label={`Edit ${product.name}`}
                            className="inline-flex size-9 items-center justify-center rounded-[10px] border border-transparent !text-[#111] transition hover:border-[#deded8] hover:bg-[#f6f6f3]"
                            href={`/admin/catalog/products/new?product=${product.id}&step=1`}
                          >
                            <Pencil className="size-5 !text-[#111]" />
                          </a>
                          <form action={duplicateProduct}>
                            <input
                              name="productId"
                              type="hidden"
                              value={product.id}
                            />
                            <input
                              name="redirectTo"
                              type="hidden"
                              value="/admin/catalog/products"
                            />
                            <button
                              aria-label={`Duplicate ${product.name}`}
                              className="inline-flex size-9 items-center justify-center rounded-[10px] border border-transparent !text-[#111] transition hover:border-[#deded8] hover:bg-[#f6f6f3]"
                              type="submit"
                            >
                              <Copy className="size-5 !text-[#111]" />
                            </button>
                          </form>
                          <form action={deleteProduct}>
                            <input
                              name="productId"
                              type="hidden"
                              value={product.id}
                            />
                            <input
                              name="redirectTo"
                              type="hidden"
                              value="/admin/catalog/products"
                            />
                            <ConfirmSubmitButton
                              className="inline-flex size-9 items-center justify-center rounded-[10px] border border-transparent !text-[#c73645] transition hover:border-[#f0c7cc] hover:bg-[#fff3f4]"
                              confirmMessage={`Delete "${product.name}"? This removes it from the active catalog, while existing order history stays safe.`}
                              label={`Delete ${product.name}`}
                            >
                              <Trash2 className="size-5 !text-[#c73645]" />
                            </ConfirmSubmitButton>
                          </form>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Panel>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          <StatCard
            icon={Package}
            label="Total products"
            note="All products in this restaurant"
            tone="gray"
            value={data.products.length}
          />
          <StatCard
            icon={Package}
            label="Available"
            note={`${Math.round((availableCount / Math.max(data.products.length, 1)) * 100)}% of catalog`}
            value={availableCount}
          />
          <StatCard
            icon={Package}
            label="Out of stock"
            note={`${Math.round((outOfStockCount / Math.max(data.products.length, 1)) * 100)}% of catalog`}
            tone="gray"
            value={outOfStockCount}
          />
          <StatCard
            icon={Store}
            label="Total branches"
            note="Active product availability targets"
            tone="gray"
            value={data.branches.length}
          />
        </div>

        <div className="flex flex-col gap-4 text-sm text-[#555] md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <span>Show</span>
            <span className="inline-flex h-11 items-center rounded-[10px] border border-[#deded8] px-4 text-[#111]">
              10
            </span>
            <span>per page</span>
          </div>
          <div className="flex items-center gap-3">
            <span>
              {visibleProducts.length
                ? `1-${visibleProducts.length} of ${filteredProducts.length}`
                : "0 of 0"}
            </span>
            <div className="flex items-center overflow-hidden rounded-[10px] border border-[#deded8]">
              <span className="px-4 py-3 text-[#aaa]">‹</span>
              <span className="bg-[var(--admin-primary)] px-4 py-3 font-semibold text-white">1</span>
              <span className="px-4 py-3">2</span>
              <span className="px-4 py-3">3</span>
              <span className="px-4 py-3">...</span>
              <span className="px-4 py-3">25</span>
              <span className="px-4 py-3">›</span>
            </div>
          </div>
        </div>
      </div>
    </AdminWorkspace>
  );
}
