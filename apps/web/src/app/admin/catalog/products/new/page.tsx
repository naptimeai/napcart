import Link from "next/link";
import type { ReactNode } from "react";
import {
  BriefcaseBusiness,
  Check,
  ChevronRight,
  Folder,
  GripVertical,
  List,
  Pencil,
  Plus,
  Send,
  Store,
} from "lucide-react";
import {
  createOrUpdateAddon,
  createOrUpdateAddonGroup,
  createOrUpdateProduct,
  createOrUpdateProductVariant,
  updateProductBranchAvailability,
} from "@/app/admin/actions";
import {
  AdminWorkspace,
  EmptyState,
  FormField,
  FormInput,
  FormSelect,
  FormTextarea,
  Panel,
  PanelHeader,
  PrimaryButton,
  ProductPreviewCard,
  ProductThumb,
  SettingToggleRow,
  StatusBadge,
  Stepper,
  ToggleInput,
  UploadBox,
  formatAdminMoney,
} from "@/components/admin/phase45-ui";
import { PageNotice } from "@/components/admin/primitives";
import { requireAdminSession } from "@/lib/auth/admin-session";
import { getCatalogManagementData } from "@/server/repositories/restaurant-admin";

type NewProductPageProps = {
  searchParams?: Promise<{
    product?: string;
    step?: string;
    notice?: string;
    error?: string;
  }>;
};

export default async function NewProductPage({ searchParams }: NewProductPageProps) {
  const session = await requireAdminSession();
  const params = searchParams ? await searchParams : undefined;
  const data = await getCatalogManagementData(session.restaurantId);
  const step = resolveStep(params?.step);
  const product = data.products.find((item) => item.id === params?.product);
  const activeCategories = data.categories.filter((category) => category.isActive);
  const selectedCategory =
    product?.category ?? activeCategories[0] ?? data.categories[0];
  const branchAvailability = data.branches.map((branch) => {
    const availability = product?.branchAvailability.find(
      (item) => item.branchId === branch.id,
    );

    return {
      branch,
      isAvailable: availability?.isAvailable ?? true,
      deliveryAvailable: availability?.deliveryAvailable ?? true,
      pickupAvailable: availability?.pickupAvailable ?? true,
    };
  });
  const selectedBranchCount = branchAvailability.filter(
    (item) => item.isAvailable,
  ).length;

  return (
    <AdminWorkspace>
      <div className="space-y-6">
        {typeof params?.notice === "string" ? (
          <PageNotice message={params.notice} />
        ) : null}
        {typeof params?.error === "string" ? (
          <PageNotice message={params.error} tone="error" />
        ) : null}

        <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="text-[34px] font-semibold leading-tight tracking-normal text-[#111]">
              New product
            </h1>
            <p className="mt-2 text-[15px] leading-6 text-[#767676]">
              Create your item in 4 simple steps.
            </p>
          </div>
          <Link
            className="inline-flex h-12 items-center gap-2 text-sm font-semibold text-[#111]"
            href="/admin/catalog/categories"
          >
            <Folder className="size-5" />
            Manage categories
            <ChevronRight className="size-4" />
          </Link>
        </div>

        <Stepper activeStep={step} />

        {step === 1 ? (
          <StepOne
            categories={activeCategories}
            currency={data.restaurant.defaultCurrency}
            product={product}
            selectedCategoryName={selectedCategory?.name}
          />
        ) : null}
        {step === 2 ? (
          <StepTwo
            branchAvailability={branchAvailability}
            currency={data.restaurant.defaultCurrency}
            product={product}
            selectedBranchCount={selectedBranchCount}
            totalBranches={data.branches.length}
          />
        ) : null}
        {step === 3 ? (
          <StepThree
            currency={data.restaurant.defaultCurrency}
            product={product}
            selectedBranchCount={selectedBranchCount}
          />
        ) : null}
        {step === 4 ? (
          <StepFour
            branchAvailability={branchAvailability}
            currency={data.restaurant.defaultCurrency}
            product={product}
            selectedBranchCount={selectedBranchCount}
          />
        ) : null}
      </div>
    </AdminWorkspace>
  );
}

function resolveStep(value?: string): 1 | 2 | 3 | 4 {
  if (value === "2" || value === "3" || value === "4") {
    return Number(value) as 2 | 3 | 4;
  }

  return 1;
}

function StepOne({
  product,
  categories,
  currency,
  selectedCategoryName,
}: {
  product: ProductDraft | undefined;
  categories: Array<{ id: string; name: string }>;
  currency: string;
  selectedCategoryName?: string;
}) {
  return (
    <>
      <div className="grid gap-7 xl:grid-cols-[1fr_330px]">
        <Panel className="p-6">
          <PanelHeader
            description="Add the essential details about your product."
            title="Basic information"
          />
          <form
            action={createOrUpdateProduct}
            className="mt-7 grid gap-7"
          >
            <input name="productId" type="hidden" value={product?.id ?? ""} />
            <input
              name="redirectTo"
              type="hidden"
              value="/admin/catalog/products/new?step=2&product=__PRODUCT_ID__"
            />
            <div className="grid gap-8 lg:grid-cols-[250px_1fr]">
              <FormField label="Product image">
                <UploadBox />
              </FormField>
              <div className="space-y-6">
                <FormField label="Product name *">
                  <div className="relative">
                    <FormInput
                      defaultValue={product?.name ?? ""}
                      name="name"
                      placeholder="e.g. Double Smash Burger"
                      required
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-[#777]">
                      {product?.name.length ?? 0} / 100
                    </span>
                  </div>
                </FormField>
                <FormField
                  hint="You can manage categories separately."
                  label="Category *"
                >
                  <FormSelect
                    defaultValue={product?.categoryId ?? categories[0]?.id}
                    name="categoryId"
                    required
                  >
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </FormSelect>
                </FormField>
              </div>
            </div>
            <FormField label="Description">
              <div className="relative">
                <FormTextarea
                  defaultValue={product?.description ?? ""}
                  name="description"
                  placeholder="Describe your product, ingredients, and anything customers should know."
                />
                <span className="absolute bottom-3 right-4 text-xs text-[#777]">
                  {product?.description?.length ?? 0} / 300
                </span>
              </div>
            </FormField>
            <div className="grid gap-8 lg:grid-cols-[320px_1fr]">
              <FormField
                hint="Set the price for this product."
                label={`Price (${currency}) *`}
              >
                <FormInput
                  defaultValue={product ? Number(product.basePrice) : "0.00"}
                  min="0"
                  name="basePrice"
                  required
                  step="0.01"
                  type="number"
                />
              </FormField>
              <div className="grid gap-4 md:grid-cols-2">
                <SettingToggleRow
                  defaultChecked={product?.isAvailable ?? true}
                  description="Show this product in the catalog."
                  name="isAvailable"
                  title="Available"
                />
                <SettingToggleRow
                  defaultChecked={false}
                  description="Mark as popular to highlight it."
                  name="isPopular"
                  title="Popular"
                />
              </div>
            </div>
            <input
              name="slug"
              type="hidden"
              value={product?.slug ?? ""}
            />
            <input
              name="displayOrder"
              type="hidden"
              value={product?.displayOrder ?? 0}
            />
            <input
              name="isActive"
              type="hidden"
              value="on"
            />
            <input
              name="deliveryAvailable"
              type="hidden"
              value="on"
            />
            <input
              name="pickupAvailable"
              type="hidden"
              value="on"
            />
            <WizardActionBar
              backHref="/admin/catalog/products"
              continueLabel="Continue to availability"
              saveDraft
              submit
            />
          </form>
        </Panel>
        <ProductPreviewCard
          category={selectedCategoryName ?? "Category"}
          description={product?.description ?? undefined}
          imageUrl={product?.imageUrl}
          price={formatAdminMoney(product?.basePrice ?? 0, currency)}
          title={product?.name ?? "Product name"}
        >
          <WhatsNext steps={[["2", "Availability", "Choose branches where this product will be available."], ["3", "Variations & Add-ons", "Add sizes, options, and add-ons."], ["4", "Review & Publish", "Review details and publish when you are ready."]]} />
        </ProductPreviewCard>
      </div>
    </>
  );
}

function StepTwo({
  product,
  branchAvailability,
  selectedBranchCount,
  totalBranches,
}: {
  product: ProductDraft | undefined;
  currency: string;
  branchAvailability: BranchAvailabilityDraft[];
  selectedBranchCount: number;
  totalBranches: number;
}) {
  if (!product) {
    return <MissingProductStep />;
  }

  return (
    <form action={updateProductBranchAvailability} className="space-y-6">
      <input name="productId" type="hidden" value={product.id} />
      <input
        name="redirectTo"
        type="hidden"
        value={`/admin/catalog/products/new?step=3&product=${product.id}`}
      />
      <div className="grid gap-7 xl:grid-cols-[1fr_330px]">
        <Panel className="p-6">
          <PanelHeader
            description="Choose where this product is available."
            title="Availability"
          />
          <div className="mt-6 flex min-h-20 items-center gap-5 rounded-[12px] border border-[#deded8] p-5">
            <ToggleInput defaultChecked name="availableEverywhere" />
            <div>
              <p className="font-semibold text-[#111]">Available in all branches</p>
              <p className="mt-1 text-sm text-[#777]">
                Show this product in every branch
              </p>
            </div>
          </div>
          <div className="my-8 flex items-center gap-6 text-sm font-semibold text-[#777]">
            <span className="h-px flex-1 bg-[#e7e7e3]" />
            OR
            <span className="h-px flex-1 bg-[#e7e7e3]" />
          </div>
          <p className="text-sm font-medium text-[#777]">
            Customize availability by branch
          </p>
          <div className="mt-4 space-y-3">
            {branchAvailability.map(({ branch, isAvailable }) => (
              <div
                className="flex items-center gap-4 rounded-[12px] border border-[#deded8] p-4"
                key={branch.id}
              >
                <Store className="size-5 rounded-[10px] bg-[#f1f1ef] p-3 box-content" />
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-[#111]">{branch.name}</p>
                  <p className="mt-1 text-sm text-[#777]">
                    {branch.isTemporarilyClosed ? "Temporarily closed" : "Active branch"}
                  </p>
                </div>
                <ToggleInput
                  defaultChecked={isAvailable}
                  name={`${branch.id}_isAvailable`}
                />
                <input
                  name={`${branch.id}_deliveryAvailable`}
                  type="hidden"
                  value="on"
                />
                <input
                  name={`${branch.id}_pickupAvailable`}
                  type="hidden"
                  value="on"
                />
                <div className="w-28">
                  <p className="text-sm font-semibold text-[#111]">
                    {isAvailable ? "In stock" : "Out of stock"}
                  </p>
                  <p className="mt-1 text-xs text-[#777]">
                    {isAvailable ? "Visible to customers" : "Hidden from customers"}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <p className="mt-6 text-sm text-[#777]">
            Customers will only see this product at branches where it is available.
          </p>
        </Panel>
        <ProductPreviewCard
          category={product.category.name}
          imageUrl={product.imageUrl}
          price={formatAdminMoney(product.basePrice)}
          title={product.name}
        >
          <div className="mt-7 border-t border-[#e7e7e3] pt-6">
            <p className="font-semibold text-[#111]">
              {selectedBranchCount} of {totalBranches} branches
            </p>
            <p className="mt-1 text-sm text-[#777]">
              This product is available in {selectedBranchCount} branches.
            </p>
            <button className="mt-5 inline-flex h-11 items-center gap-2 rounded-[10px] border border-[#deded8] px-4 text-sm font-semibold">
              <List className="size-4" />
              View branch list
            </button>
          </div>
          <WhatsNext steps={[["3", "Variations & Add-ons", "Add sizes, options, and add-ons."], ["4", "Review & Publish", "Review details and publish when you are ready."]]} />
        </ProductPreviewCard>
      </div>
      <WizardActionBar
        backHref={`/admin/catalog/products/new?step=1&product=${product.id}`}
        continueLabel="Continue to variations & add-ons"
        submit
      />
    </form>
  );
}

function StepThree({
  product,
  selectedBranchCount,
  currency,
}: {
  product: ProductDraft | undefined;
  selectedBranchCount: number;
  currency: string;
}) {
  if (!product) {
    return <MissingProductStep />;
  }

  return (
    <>
      <div className="grid gap-7 xl:grid-cols-[1fr_330px]">
        <div className="space-y-5">
          <Panel className="p-6">
            <PanelHeader
              description="Add options that affect the price, like size or portion."
              title="Variations"
            />
            <div className="mt-6 rounded-[12px] border border-[#deded8] p-3">
              <GroupHeader badge="Required" title="Size" />
              <div className="mt-3 space-y-2">
                {(product.variants.length ? product.variants : []).map((variant) => (
                  <form
                    action={createOrUpdateProductVariant}
                    className="flex min-h-12 items-center gap-3 rounded-[10px] border border-[#e7e7e3] px-3"
                    key={variant.id}
                  >
                    <input name="productId" type="hidden" value={product.id} />
                    <input name="variantId" type="hidden" value={variant.id} />
                    <input
                      name="redirectTo"
                      type="hidden"
                      value={`/admin/catalog/products/new?step=3&product=${product.id}`}
                    />
                    <GripVertical className="size-4 text-[#999]" />
                    <FormInput
                      className="h-9 border-0 px-0 focus:ring-0"
                      defaultValue={variant.name}
                      name="name"
                    />
                    <FormInput
                      className="h-9 w-28"
                      defaultValue={Number(variant.priceDelta ?? 0)}
                      name="priceDelta"
                      placeholder="+ PKR"
                    />
                    <input name="fixedPrice" type="hidden" value="" />
                    <input name="sortOrder" type="hidden" value={variant.sortOrder} />
                    <input name="isActive" type="hidden" value="on" />
                    <button aria-label="Save variation" type="submit">
                      <Check className="size-4" />
                    </button>
                  </form>
                ))}
                <form
                  action={createOrUpdateProductVariant}
                  className="grid gap-2 rounded-[10px] border border-dashed border-[#d7d7d1] p-3 md:grid-cols-[1fr_120px_90px]"
                >
                  <input name="productId" type="hidden" value={product.id} />
                  <input
                    name="redirectTo"
                    type="hidden"
                    value={`/admin/catalog/products/new?step=3&product=${product.id}`}
                  />
                  <FormInput name="name" placeholder="Add option" required />
                  <FormInput name="priceDelta" placeholder="+ PKR" type="number" />
                  <input name="fixedPrice" type="hidden" value="" />
                  <input name="sortOrder" type="hidden" value="0" />
                  <input name="isActive" type="hidden" value="on" />
                  <PrimaryButton type="submit">
                    <Plus className="size-4" />
                    Add
                  </PrimaryButton>
                </form>
              </div>
              <button className="mt-3 flex h-11 w-full items-center justify-center gap-2 rounded-[10px] border border-dashed border-[#d7d7d1] text-sm font-semibold">
                <Plus className="size-4" />
                Add variation group
              </button>
            </div>
          </Panel>

          <Panel className="p-6">
            <PanelHeader
              description="Add extra items customers can add to their order."
              title="Add-ons"
            />
            <div className="mt-6 space-y-4">
              {product.addonGroups.map((group) => (
                <div
                  className="rounded-[12px] border border-[#deded8] p-3"
                  key={group.id}
                >
                  <GroupHeader
                    badge={group.isRequired ? "Required" : "Optional"}
                    title={group.name}
                  />
                  <div className="mt-3 divide-y divide-[#eeeeea] overflow-hidden rounded-[10px] border border-[#e7e7e3]">
                    {group.addons.map((addon) => (
                      <form
                        action={createOrUpdateAddon}
                        className="grid min-h-11 items-center gap-3 px-3 py-2 md:grid-cols-[24px_1fr_80px_80px]"
                        key={addon.id}
                      >
                        <input name="productId" type="hidden" value={product.id} />
                        <input name="addonGroupId" type="hidden" value={group.id} />
                        <input name="addonId" type="hidden" value={addon.id} />
                        <input
                          name="redirectTo"
                          type="hidden"
                          value={`/admin/catalog/products/new?step=3&product=${product.id}`}
                        />
                        <input type="checkbox" />
                        <FormInput
                          className="h-8 border-0 px-0 focus:ring-0"
                          defaultValue={addon.name}
                          name="name"
                        />
                        <span className="text-sm text-[#777]">+ PKR</span>
                        <FormInput
                          className="h-8"
                          defaultValue={Number(addon.price)}
                          name="price"
                          type="number"
                        />
                        <input name="sortOrder" type="hidden" value={addon.sortOrder} />
                        <input name="isActive" type="hidden" value="on" />
                      </form>
                    ))}
                  </div>
                  <form
                    action={createOrUpdateAddon}
                    className="mt-3 grid gap-2 rounded-[10px] border border-dashed border-[#d7d7d1] p-3 md:grid-cols-[1fr_120px_90px]"
                  >
                    <input name="productId" type="hidden" value={product.id} />
                    <input name="addonGroupId" type="hidden" value={group.id} />
                    <input
                      name="redirectTo"
                      type="hidden"
                      value={`/admin/catalog/products/new?step=3&product=${product.id}`}
                    />
                    <FormInput name="name" placeholder="Add option" required />
                    <FormInput name="price" placeholder="+ PKR" required type="number" />
                    <input name="sortOrder" type="hidden" value="0" />
                    <input name="isActive" type="hidden" value="on" />
                    <PrimaryButton type="submit">Add</PrimaryButton>
                  </form>
                </div>
              ))}
              <form
                action={createOrUpdateAddonGroup}
                className="grid gap-3 rounded-[10px] border border-dashed border-[#d7d7d1] p-3 md:grid-cols-[1fr_120px]"
              >
                <input name="productId" type="hidden" value={product.id} />
                <input
                  name="redirectTo"
                  type="hidden"
                  value={`/admin/catalog/products/new?step=3&product=${product.id}`}
                />
                <FormInput name="name" placeholder="Add add-on group" required />
                <input name="minSelect" type="hidden" value="0" />
                <input name="maxSelect" type="hidden" value="1" />
                <input name="sortOrder" type="hidden" value="0" />
                <input name="isActive" type="hidden" value="on" />
                <PrimaryButton type="submit">
                  <Plus className="size-4" />
                  Add
                </PrimaryButton>
              </form>
            </div>
          </Panel>
        </div>
        <ProductPreviewCard
          category={product.category.name}
          imageUrl={product.imageUrl}
          price={formatAdminMoney(product.basePrice, currency)}
          title={product.name}
        >
          <div className="mt-7 border-t border-[#e7e7e3] pt-6">
            <SummaryList
              rows={[
                ["Base price", formatAdminMoney(product.basePrice, currency)],
                ...product.variants.slice(0, 3).map((variant) => [
                  variant.name,
                  formatAdminMoney(
                    Number(product.basePrice) + Number(variant.priceDelta ?? 0),
                    currency,
                  ),
                ]),
              ]}
              title="Pricing summary"
            />
            <SummaryList
              rows={product.addonGroups
                .flatMap((group) => group.addons)
                .slice(0, 3)
                .map((addon) => [
                  addon.name,
                  `+ ${formatAdminMoney(addon.price, currency)}`,
                ])}
              title="Add-ons (example)"
            />
            <div className="border-t border-[#e7e7e3] py-5">
              <p className="font-semibold text-[#111]">Selected branches</p>
              <div className="mt-4 flex items-center gap-4">
                <Store className="size-11 rounded-full bg-[#ddf5e7] p-3 text-[#239b53]" />
                <div className="flex-1">
                  <p className="text-lg font-semibold text-[#111]">
                    {selectedBranchCount}
                  </p>
                  <p className="text-sm text-[#777]">branches</p>
                </div>
                <button className="rounded-[10px] border border-[#deded8] px-3 py-2 text-sm font-semibold">
                  View all
                </button>
              </div>
            </div>
            <WhatsNext steps={[["4", "Review & Publish", "Confirm details and publish when you are ready."]]} />
          </div>
        </ProductPreviewCard>
      </div>
      <WizardActionBar
        backHref={`/admin/catalog/products/new?step=2&product=${product.id}`}
        continueHref={`/admin/catalog/products/new?step=4&product=${product.id}`}
        continueLabel="Continue to review"
      />
    </>
  );
}

function StepFour({
  product,
  selectedBranchCount,
  branchAvailability,
  currency,
}: {
  product: ProductDraft | undefined;
  selectedBranchCount: number;
  branchAvailability: BranchAvailabilityDraft[];
  currency: string;
}) {
  if (!product) {
    return <MissingProductStep />;
  }

  const activeAddons = product.addonGroups.flatMap((group) => group.addons);

  return (
    <>
      <div className="grid gap-7 xl:grid-cols-[1fr_360px]">
        <div className="space-y-5">
          <ReviewCard
            editHref={`/admin/catalog/products/new?step=1&product=${product.id}`}
            title="Basic information"
          >
            <div className="grid gap-7 md:grid-cols-[160px_1fr]">
              <ProductThumb
                alt={product.name}
                className="size-40"
                src={product.imageUrl}
              />
              <div className="grid gap-4 text-sm md:grid-cols-[130px_1fr]">
                <ReviewLabel label="Product name" value={product.name} />
                <ReviewLabel label="Category" value={product.category.name} />
                <ReviewLabel
                  label="Description"
                  value={product.description ?? "No description added."}
                />
                <ReviewLabel
                  label="Price (PKR)"
                  value={formatAdminMoney(product.basePrice, currency)}
                />
              </div>
            </div>
          </ReviewCard>
          <ReviewCard
            editHref={`/admin/catalog/products/new?step=2&product=${product.id}`}
            title="Availability"
          >
            <p className="text-sm text-[#555]">
              Available at{" "}
              <span className="font-semibold text-[#111]">
                {selectedBranchCount} branches
              </span>
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              {branchAvailability
                .filter((item) => item.isAvailable)
                .slice(0, 3)
                .map(({ branch }) => (
                  <StatusBadge key={branch.id} tone="green">
                    <Check className="size-3" />
                    {branch.name}
                  </StatusBadge>
                ))}
              {selectedBranchCount > 3 ? (
                <StatusBadge tone="gray">+{selectedBranchCount - 3} more</StatusBadge>
              ) : null}
            </div>
          </ReviewCard>
          <ReviewCard
            editHref={`/admin/catalog/products/new?step=3&product=${product.id}`}
            title="Variations & Add-ons"
          >
            <div className="grid gap-8 md:grid-cols-2">
              <div>
                <p className="text-sm font-semibold text-[#111]">
                  Variations ({product.variants.length})
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {product.variants.slice(0, 4).map((variant) => (
                    <span
                      className="rounded-[8px] border border-[#deded8] bg-[#f7f7f4] px-3 py-2 text-sm"
                      key={variant.id}
                    >
                      {variant.name}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-sm font-semibold text-[#111]">
                  Add-ons ({activeAddons.length})
                </p>
                <ul className="mt-3 space-y-2 text-sm text-[#111]">
                  {activeAddons.slice(0, 5).map((addon) => (
                    <li key={addon.id}>- {addon.name}</li>
                  ))}
                </ul>
              </div>
            </div>
          </ReviewCard>
        </div>
        <div className="space-y-5">
          <ProductPreviewCard
            category={product.category.name}
            imageUrl={product.imageUrl}
            price={formatAdminMoney(product.basePrice, currency)}
            title={product.name}
          >
            <div className="mt-6 divide-y divide-[#e7e7e3] border-t border-[#e7e7e3]">
              <PreviewRow
                label="Available at"
                value={`${selectedBranchCount} branches`}
              />
              <PreviewRow
                label="Variations"
                value={`${product.variants.length} available`}
              />
              <PreviewRow
                label="Add-ons"
                value={`${activeAddons.length} available`}
              />
            </div>
          </ProductPreviewCard>
          <Panel className="p-6">
            <PanelHeader title="Ready to publish" />
            <div className="mt-5 space-y-4">
              <ChecklistRow checked={Boolean(product.imageUrl)} label="Image added" />
              <ChecklistRow checked={Boolean(product.categoryId)} label="Category selected" />
              <ChecklistRow
                checked={selectedBranchCount > 0}
                label="At least 1 branch selected"
              />
            </div>
          </Panel>
        </div>
      </div>
      <div className="mt-6 rounded-[18px] border border-[#e5e5e1] bg-white p-5 shadow-[0_14px_45px_rgba(16,18,16,0.035)]">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex gap-4">
            <Link
              className="inline-flex h-14 w-32 items-center justify-center rounded-[10px] border border-[#deded8] font-semibold"
              href={`/admin/catalog/products/new?step=3&product=${product.id}`}
            >
              Back
            </Link>
            <button className="inline-flex h-14 items-center gap-3 rounded-[10px] border border-[#deded8] px-5 text-left">
              <BriefcaseBusiness className="size-5" />
              <span>
                <span className="block text-sm font-semibold text-[#111]">
                  Save draft
                </span>
                <span className="block text-xs text-[#777]">
                  All changes are saved
                </span>
              </span>
            </button>
          </div>
          <Link
            className="inline-flex h-14 items-center justify-center gap-3 rounded-[10px] bg-[#111] px-8 font-semibold !text-white [&_svg]:!text-white"
            href="/admin/catalog/products"
          >
            Publish product
            <Send className="size-5" />
          </Link>
        </div>
      </div>
    </>
  );
}

function MissingProductStep() {
  return (
    <Panel className="p-8">
      <EmptyState
        description="Create the basic product record first, then continue through availability, variations, and review."
        title="Product draft required"
      />
      <div className="mt-5">
        <PrimaryButton href="/admin/catalog/products/new?step=1">
          Back to basics
        </PrimaryButton>
      </div>
    </Panel>
  );
}

function WizardActionBar({
  backHref,
  continueHref,
  continueLabel,
  submit = false,
  saveDraft = false,
}: {
  backHref: string;
  continueHref?: string;
  continueLabel: string;
  submit?: boolean;
  saveDraft?: boolean;
}) {
  return (
    <div className="rounded-[18px] border border-[#e5e5e1] bg-white p-5 shadow-[0_14px_45px_rgba(16,18,16,0.035)]">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        {saveDraft ? (
          <button className="inline-flex h-14 items-center gap-3 rounded-[10px] border border-[#deded8] px-5 text-left">
            <BriefcaseBusiness className="size-5" />
            <span>
              <span className="block text-sm font-semibold text-[#111]">Save draft</span>
              <span className="block text-xs text-[#777]">All changes are saved</span>
            </span>
          </button>
        ) : (
          <span />
        )}
        <div className="flex gap-4">
          <Link
            className="inline-flex h-13 min-w-36 items-center justify-center rounded-[10px] bg-[#f4f4f2] px-5 text-sm font-semibold text-[#111]"
            href={backHref}
          >
            Back
          </Link>
          {submit ? (
            <PrimaryButton className="min-w-[250px]" type="submit">
              {continueLabel}
              <ChevronRight className="size-5" />
            </PrimaryButton>
          ) : (
            <PrimaryButton className="min-w-[250px]" href={continueHref}>
              {continueLabel}
              <ChevronRight className="size-5" />
            </PrimaryButton>
          )}
        </div>
      </div>
    </div>
  );
}

function WhatsNext({
  steps,
}: {
  steps: Array<[string, string, string]>;
}) {
  return (
    <div className="mt-7 border-t border-[#e7e7e3] pt-6">
      <p className="font-semibold text-[#111]">What&apos;s next?</p>
      <p className="mt-1 text-sm text-[#777]">
        Follow the steps to complete your product.
      </p>
      <div className="mt-5 space-y-3">
        {steps.map(([number, title, description], index) => (
          <div
            className={
              index === 0
                ? "flex gap-4 rounded-[12px] border border-[#deded8] p-4"
                : "flex gap-4 px-3 py-2"
            }
            key={number}
          >
            <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#eeeeeb] text-sm font-semibold">
              {number}
            </span>
            <span>
              <span className="block text-sm font-semibold text-[#111]">{title}</span>
              <span className="mt-1 block text-xs leading-5 text-[#777]">
                {description}
              </span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function GroupHeader({ title, badge }: { title: string; badge: string }) {
  return (
    <div className="flex items-center gap-3">
      <GripVertical className="size-4 text-[#999]" />
      <p className="font-semibold text-[#111]">{title}</p>
      <StatusBadge tone="green">{badge}</StatusBadge>
      <Pencil className="ml-auto size-4" />
    </div>
  );
}

function SummaryList({
  title,
  rows,
}: {
  title: string;
  rows: Array<string[]>;
}) {
  return (
    <div className="border-b border-[#e7e7e3] pb-5">
      <p className="font-semibold text-[#111]">{title}</p>
      <div className="mt-4 space-y-3">
        {rows.length ? rows.map(([label, value]) => (
          <div className="flex justify-between gap-4 text-sm" key={label}>
            <span className="text-[#777]">{label}</span>
            <span className="font-medium text-[#111]">{value}</span>
          </div>
        )) : (
          <p className="text-sm text-[#777]">No options added yet.</p>
        )}
      </div>
    </div>
  );
}

function ReviewCard({
  title,
  editHref,
  children,
}: {
  title: string;
  editHref: string;
  children: ReactNode;
}) {
  return (
    <Panel className="p-6">
      <PanelHeader
        action={
          <Link
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#111]"
            href={editHref}
          >
            <Pencil className="size-4" />
            Edit
          </Link>
        }
        title={title}
      />
      <div className="mt-6">{children}</div>
    </Panel>
  );
}

function ReviewLabel({ label, value }: { label: string; value: ReactNode }) {
  return (
    <>
      <span className="font-medium text-[#333]">{label}</span>
      <span className="leading-6 text-[#111]">{value}</span>
    </>
  );
}

function PreviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 py-4 text-sm">
      <span className="text-[#333]">{label}</span>
      <span className="font-semibold text-[#111]">{value}</span>
    </div>
  );
}

function ChecklistRow({ checked, label }: { checked: boolean; label: string }) {
  return (
    <div className="flex items-center gap-3">
      <span
        className={
          checked
            ? "flex size-6 items-center justify-center rounded-full bg-[#ddf5e7] text-[#239b53]"
            : "flex size-6 items-center justify-center rounded-full bg-[#eeeeeb] text-[#777]"
        }
      >
        <Check className="size-4" />
      </span>
      <span className="text-sm font-medium text-[#111]">{label}</span>
    </div>
  );
}

type CatalogData = Awaited<ReturnType<typeof getCatalogManagementData>>;
type ProductDraft = CatalogData["products"][number];
type BranchAvailabilityDraft = {
  branch: CatalogData["branches"][number];
  isAvailable: boolean;
  deliveryAvailable: boolean;
  pickupAvailable: boolean;
};
