import {
  createOrUpdateCategory,
  deleteCategory,
} from "@/app/admin/actions";
import { ConfirmSubmitButton } from "@/components/admin/confirm-submit-button";
import {
  AdminWorkspace,
  CommonIcons,
  EmptyState,
  FormField,
  FormInput,
  FormTextarea,
  IconBubble,
  PageTitle,
  Panel,
  PanelHeader,
  PrimaryButton,
  ProductThumb,
  SearchBox,
  SecondaryButton,
  StatusBadge,
  ToggleInput,
  UploadBox,
  formatAdminMoney,
} from "@/components/admin/phase45-ui";
import { PageNotice } from "@/components/admin/primitives";
import { requireAdminSession } from "@/lib/auth/admin-session";
import { getCatalogManagementData } from "@/server/repositories/restaurant-admin";
import {
  ChevronRight,
  Filter,
  Folder,
  Plus,
  Trash2,
} from "lucide-react";

type CategoriesPageProps = {
  searchParams?: Promise<{
    category?: string;
    q?: string;
    notice?: string;
    error?: string;
  }>;
};

export default async function CatalogCategoriesPage({
  searchParams,
}: CategoriesPageProps) {
  const session = await requireAdminSession();
  const params = searchParams ? await searchParams : undefined;
  const data = await getCatalogManagementData(session.restaurantId);
  const query = params?.q?.toLowerCase() ?? "";
  const filteredCategories = data.categories.filter((category) =>
    category.name.toLowerCase().includes(query),
  );
  const isCreatingCategory = params?.category === "new";
  const selectedCategory = isCreatingCategory
    ? undefined
    : data.categories.find((category) => category.id === params?.category) ??
      filteredCategories[0] ??
      data.categories[0];
  const categoryProducts = selectedCategory
    ? data.products.filter((product) => product.categoryId === selectedCategory.id)
    : [];

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
            <PrimaryButton
              className="min-w-[168px]"
              href="/admin/catalog/categories?category=new"
            >
              <Plus className="size-5" />
              New category
            </PrimaryButton>
          }
          description="Organize your menu with categories to make it easy to browse."
          title="Categories"
        />

        <div className="grid gap-4 xl:grid-cols-[38%_1fr]">
          <Panel className="min-h-[720px] p-5">
            <form className="flex gap-3">
              <SearchBox
                className="flex-1"
                defaultValue={params?.q}
                placeholder="Search categories..."
              />
              <button
                aria-label="Filter categories"
                className="flex size-12 items-center justify-center rounded-[10px] border border-[#deded8] bg-white text-[#111]"
                type="submit"
              >
                <Filter className="size-5 text-[#111]" />
              </button>
            </form>

            <div className="mt-5 space-y-3">
              {filteredCategories.map((category) => {
                const isSelected = category.id === selectedCategory?.id;

                return (
                  <a
                    className={
                      isSelected
                        ? "flex min-h-[92px] items-center gap-4 rounded-[12px] border-2 border-[#111] p-4"
                        : "flex min-h-[92px] items-center gap-4 rounded-[12px] border border-[#e2e2dd] p-4 transition hover:border-[#111]"
                    }
                    href={`/admin/catalog/categories?category=${category.id}`}
                    key={category.id}
                  >
                    <IconBubble className="size-14" icon={Folder} tone="gray" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-lg font-semibold text-[#111]">
                        {category.name}
                      </span>
                      <span className="mt-1 block text-sm text-[#777]">
                        {category._count.products} products
                      </span>
                    </span>
                    <StatusBadge tone={category.isActive ? "green" : "gray"}>
                      {category.isActive ? "Active" : "Inactive"}
                    </StatusBadge>
                    <ChevronRight className="size-5" />
                  </a>
                );
              })}
            </div>

            <p className="mt-5 text-sm text-[#777]">
              {filteredCategories.length} categories
            </p>
          </Panel>

          <Panel className="p-7">
            {selectedCategory ? (
              <>
                <PanelHeader
                  action={
                    <form action={deleteCategory}>
                      <input
                        name="categoryId"
                        type="hidden"
                        value={selectedCategory.id}
                      />
                      <input
                        name="redirectTo"
                        type="hidden"
                        value="/admin/catalog/categories"
                      />
                      <ConfirmSubmitButton
                        className="flex size-11 items-center justify-center rounded-[10px] border border-[#f0c7cc] bg-white text-[#c73645] transition hover:bg-[#fff3f4]"
                        confirmMessage={`Delete "${selectedCategory.name}"? Categories can only be deleted after their products are deleted or moved.`}
                        label="Delete category"
                      >
                        <Trash2 className="size-5 text-[#c73645]" />
                      </ConfirmSubmitButton>
                    </form>
                  }
                  title="Category details"
                />

                <form action={createOrUpdateCategory} className="mt-8 space-y-8">
                  <input
                    name="categoryId"
                    type="hidden"
                    value={selectedCategory.id}
                  />
                  <input
                    name="slug"
                    type="hidden"
                    value={selectedCategory.slug}
                  />
                  <input
                    name="description"
                    type="hidden"
                    value={selectedCategory.description ?? ""}
                  />
                  <input
                    name="redirectTo"
                    type="hidden"
                    value={`/admin/catalog/categories?category=${selectedCategory.id}`}
                  />
                  <div className="grid gap-8 lg:grid-cols-2">
                    <FormField label="Category name *">
                      <div className="relative">
                        <FormInput
                          defaultValue={selectedCategory.name}
                          name="name"
                          required
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-[#777]">
                          {selectedCategory.name.length} / 100
                        </span>
                      </div>
                    </FormField>
                    <FormField
                      hint="Lower numbers appear first."
                      label="Sort order"
                    >
                      <FormInput
                        defaultValue={selectedCategory.sortOrder}
                        name="sortOrder"
                        type="number"
                      />
                    </FormField>
                    <FormField
                      hint="This category is visible on the menu."
                      label="Visibility"
                    >
                      <div className="flex h-12 items-center gap-3">
                        <ToggleInput
                          defaultChecked={selectedCategory.isActive}
                          name="isActive"
                        />
                        <span className="text-sm font-semibold text-[#111]">
                          Visible
                        </span>
                      </div>
                    </FormField>
                    <FormField label={<span>Category image <span className="font-normal text-[#777]">(optional)</span></span>}>
                      <UploadBox name="image" />
                    </FormField>
                  </div>

                  <div className="border-t border-[#e7e7e3] pt-7">
                    <PanelHeader
                      description={`${categoryProducts.length} products`}
                      title="Products in this category"
                    />
                    <div className="mt-5 overflow-hidden rounded-[12px] border border-[#e3e3de]">
                      {categoryProducts.slice(0, 3).map((product) => (
                        <div
                          className="flex items-center gap-4 border-b border-[#eeeeea] p-3 last:border-b-0"
                          key={product.id}
                        >
                          <ProductThumb
                            alt={product.name}
                            className="size-13"
                            src={product.imageUrl}
                          />
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold text-[#111]">
                              {product.name}
                            </p>
                            <p className="mt-1 text-sm text-[#777]">
                              {formatAdminMoney(
                                product.basePrice,
                                data.restaurant.defaultCurrency,
                              )}
                            </p>
                          </div>
                          <StatusBadge
                            tone={
                              product.isActive && product.isAvailable
                                ? "green"
                                : "gray"
                            }
                          >
                            {product.isActive && product.isAvailable
                              ? "Active"
                              : "Inactive"}
                          </StatusBadge>
                          <CommonIcons.MoreVertical className="size-5 text-[#111]" />
                        </div>
                      ))}
                      {categoryProducts.length ? (
                        <div className="p-3">
                          <a
                            className="inline-flex h-12 items-center gap-3 rounded-[10px] border border-[#deded8] px-4 text-sm font-semibold text-[#111]"
                            href={`/admin/catalog/products?category=${selectedCategory.id}`}
                          >
                            View all products ({categoryProducts.length})
                            <ChevronRight className="size-4" />
                          </a>
                        </div>
                      ) : (
                        <div className="p-3">
                          <EmptyState
                            description="Products assigned to this category will appear here."
                            title="No products in this category"
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid gap-4 border-t border-[#e7e7e3] pt-6 md:grid-cols-[1fr_240px]">
                    <SecondaryButton type="button">Cancel</SecondaryButton>
                    <PrimaryButton type="submit">Save changes</PrimaryButton>
                  </div>
                </form>
              </>
            ) : (
              <form action={createOrUpdateCategory} className="space-y-5">
                <PanelHeader title="Category details" />
                <input
                  name="redirectTo"
                  type="hidden"
                  value="/admin/catalog/categories"
                />
                <input name="categoryId" type="hidden" value="" />
                <input name="slug" type="hidden" value="" />
                <input name="sortOrder" type="hidden" value="0" />
                <FormField label="Category name *">
                  <FormInput name="name" placeholder="New category" required />
                </FormField>
                <FormField label="Description">
                  <FormTextarea name="description" />
                </FormField>
                <PrimaryButton type="submit">Create category</PrimaryButton>
              </form>
            )}
          </Panel>
        </div>
      </div>
    </AdminWorkspace>
  );
}
