type ProductAddonOption = {
  id: string;
  price: unknown;
};

type ProductAddonGroup = {
  id: string;
  name: string;
  isRequired: boolean;
  minSelect: number;
  maxSelect: number;
  addons: ProductAddonOption[];
};

export type SelectedAddonMatch<
  TGroup extends ProductAddonGroup = ProductAddonGroup,
  TAddon extends ProductAddonOption = ProductAddonOption,
> = {
  addon: TAddon;
  group: TGroup;
};

export function resolveSelectedAddons<
  TGroup extends ProductAddonGroup,
  TAddon extends ProductAddonOption = TGroup["addons"][number],
>({
  addonGroups,
  addonIds,
  productName,
}: {
  addonGroups: TGroup[];
  addonIds: string[];
  productName: string;
}): SelectedAddonMatch<TGroup, TAddon>[] {
  const addonMap = new Map(
    addonGroups.flatMap((group) =>
      group.addons.map((addon) => [
        addon.id,
        { addon: addon as TAddon, group },
      ] as const),
    ),
  );
  const uniqueAddonIds = [...new Set(addonIds)];

  if (uniqueAddonIds.length !== addonIds.length) {
    throw new Error(`Duplicate add-ons selected for ${productName}.`);
  }

  const selectedAddons = uniqueAddonIds.map((addonId) => {
    const match = addonMap.get(addonId);
    if (!match) {
      throw new Error(`Invalid add-on selected for ${productName}.`);
    }
    return match;
  });

  for (const group of addonGroups) {
    const selectedCount = selectedAddons.filter(
      (match) => match.group.id === group.id,
    ).length;
    const minRequired = group.isRequired
      ? Math.max(group.minSelect, 1)
      : group.minSelect;
    const maxAllowed = group.maxSelect > 0 ? group.maxSelect : group.addons.length;

    if (selectedCount < minRequired) {
      throw new Error(`${productName} requires ${group.name}.`);
    }
    if (selectedCount > maxAllowed) {
      throw new Error(
        `${productName} allows only ${maxAllowed} option(s) for ${group.name}.`,
      );
    }
  }

  return selectedAddons;
}
