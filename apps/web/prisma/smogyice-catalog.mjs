const image = {
  live: "/storefront/smogyice/live-ice-cream-feature.jpg",
  hero: "/storefront/smogyice/hero-oreo-ice-cream.jpg",
  softServe: "/storefront/smogyice/soft-serve-cones.jpg",
  blizzard: "/storefront/smogyice/blizzard-smogy.png",
  coldCoffee: "/storefront/smogyice/cold-coffee-smogy.png",
  drinks:
    "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=800&q=80",
  shakes:
    "https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=800&q=80",
  desserts:
    "https://images.unsplash.com/photo-1624353365286-3f8d62daad51?w=800&q=80",
};

export const SMOGYICE_CATALOG = [
  {
    id: "live-ice-cream",
    name: "Live Ice Cream",
    imageUrl: image.live,
    subCategories: [
      {
        name: "Classic",
        prices: [
          ["Small", 390],
          ["Large", 440],
        ],
        items: [
          "Oreo",
          "Chocolate Mystery",
          "Caramel Macchiato",
          "Choco-Chip Cookies",
          "Candy Biscuit",
          "Coco Wafer",
          "Caramel",
          "Banana",
          "Vanilla",
        ],
      },
      {
        name: "Premium",
        prices: [
          ["Small", 390],
          ["Large", 460],
        ],
        items: [
          "Oreo Overloaded",
          "Oreo Love",
          "Kitkat Oreo",
          "Kitkat Caramel",
          "Kitkat",
          "Dairy Milk",
          "Snickers",
          "Mars",
          "Bounty",
          "Twix",
          "Brownie",
          "Strawberry Punch",
          "Strawberry Banana",
          "Blueberry",
          "Kiwi",
          "Mango Tango",
          "Nutella Banana",
        ],
      },
      {
        name: "Smogy Special",
        prices: [
          ["Small", 470],
          ["Large", 550],
        ],
        items: [
          "Chocolate Special",
          "Fruits Special",
          "Dry Fruits Special",
          "Snicker Lotus",
          "Brownie Lotus",
          "Pistachio",
        ],
      },
      {
        name: "Fixed-Price Specials",
        items: [
          ["Curly Ferrero", [["Standard", 570]]],
          ["Curly Reffelow", [["Standard", 700]]],
          ["Ferrero Nutella", [["Standard", 600]]],
          ["Ferrero Kitkat", [["Standard", 600]]],
        ],
      },
    ],
  },
  {
    id: "signature-live",
    name: "Signature Live",
    imageUrl: image.hero,
    subCategories: [
      {
        name: "Chocolates",
        prices: [
          ["Small", 400],
          ["Large", 470],
        ],
        items: [
          "Nutella Kitkat",
          "Dairy Kitkat",
          "Snickers Nutella",
          "Snickers Caramel",
          "Snickers Peanut Butter",
          "Peanut Butter",
          "Peanut Butter Banana",
          "Mars Caramel",
          "Toblerone",
          "Brownie Nutella",
          "M&Ms",
        ],
      },
      {
        name: "Nutella Range",
        prices: [
          ["Small", 400],
          ["Large", 470],
        ],
        items: ["Nutella", "Cheese Cake", "Bounty Oreo", "Lotus"],
      },
      {
        name: "Fruits",
        prices: [
          ["Small", 400],
          ["Large", 470],
        ],
        items: [
          "Strawberry Blueberry",
          "Strawberry Nutella",
          "Strawberry Banana",
          "Cherry",
          "Kiwi Oreo",
          "Kiwi Blueberry",
          "Mango Nutella",
          "Pineapple Twist",
        ],
      },
      {
        name: "Dry Fruits",
        prices: [
          ["Small", 400],
          ["Large", 470],
        ],
        items: [
          "Almond",
          "Almond Oreo",
          "Walnuts",
          "Walnuts Caramel",
          "Kaju Nutella",
        ],
      },
    ],
  },
  {
    id: "soft-serve",
    name: "Soft Serve",
    imageUrl: image.softServe,
    subCategories: [
      {
        name: "Soft Cone",
        items: [
          ["Baby Cone", [["Unit", 100]]],
          ["Waffle Cone", [["Unit", 160]]],
          ["Sprinkle Waffle Cone", [["Unit", 200]]],
          ["Waffle Dip Cone", [["Unit", 240]]],
          ["Oreo Love Cone", [["Unit", 200]]],
          ["Nutty Waffle Cone", [["Unit", 220]]],
          ["Special Waffle Dip Cone", [["Unit", 300]]],
        ],
      },
      {
        name: "Soft Cup",
        items: [
          ["Simple Cup", [["Unit", 160]]],
          ["Oreo Love Cup", [["Unit", 200]]],
          ["Sprinkle Cup", [["Unit", 200]]],
          ["Dip Cup", [["Unit", 240]]],
          ["Nutty Cup", [["Unit", 220]]],
          ["Special Dip Nutty Cup", [["Unit", 300]]],
        ],
      },
      {
        name: "Sundae Cup",
        items: [
          ["Oreo Sundae", [["Unit", 270]]],
          ["Choco-Chip Sundae", [["Unit", 270]]],
          ["Caramel Sundae", [["Unit", 320]]],
          ["Kitkat Sundae", [["Unit", 320]]],
          ["Brownie Sundae", [["Unit", 370]]],
          ["Blueberry Sundae", [["Unit", 320]]],
          ["Strawberry Sundae", [["Unit", 320]]],
          ["Mango Sundae", [["Unit", 370]]],
        ],
      },
    ],
  },
  {
    id: "blizzard",
    name: "Blizzard",
    imageUrl: image.blizzard,
    subCategories: [
      {
        name: "Signature Blizzards",
        items: [
          ["Oreo Blizzard", [["Unit", 440]]],
          ["Dairy Milk Blizzard", [["Unit", 440]]],
          ["Blueberry Chunks Blizzard", [["Unit", 440]]],
          ["Mango Chunks Blizzard", [["Unit", 440]]],
          ["Kitkat Blizzard", [["Unit", 440]]],
          ["Snickers Blizzard", [["Unit", 460]]],
          ["Mars Blizzard", [["Unit", 460]]],
          ["Lotus Blizzard", [["Unit", 460]]],
          ["Bounty Blizzard", [["Unit", 460]]],
        ],
      },
    ],
  },
  {
    id: "drinks",
    name: "Mocktails & Drinks",
    imageUrl: image.drinks,
    subCategories: [
      {
        name: "Refreshing Beverages",
        prices: [["Glass", 200]],
        items: [
          "Blueberry",
          "Bubble Gum",
          "Black Currant",
          "Green Apple",
          "Lychee",
          "Strawberry",
          "Imli (Tamarind)",
          "Orange",
          "Pineapple",
        ],
      },
    ],
  },
  {
    id: "shakes",
    name: "Crazy Ice Shakes",
    imageUrl: image.shakes,
    subCategories: [
      {
        name: "Classic Favorites",
        prices: [["Glass", 380]],
        items: ["Oreo Shake", "Banana Shake", "Caramel"],
      },
      {
        name: "Premium Shakes",
        prices: [["Glass", 460]],
        items: [
          "Kitkat Shake",
          "Kitkat Oreo Shake",
          "Nutella Oreo Shake",
          "Brownie Shake",
          "Strawberry Shake",
          "Strawberry Banana Shake",
          "Strawberry Nutella Shake",
          "Mango Shake",
          "Blueberry Shake",
          "Nutella Shake",
          "Lotus Shake",
        ],
      },
      {
        name: "Deluxe Combinations",
        prices: [["Glass", 480]],
        items: [
          "Blueberry Strawberry Shake",
          "Lotus Nutella Shake",
          "Lotus Brownie Shake",
          "Kitkat Brownie Shake",
          "Brownie Nutella Shake",
          "Nutella Kitkat Shake",
        ],
      },
      {
        name: "Signature Shakes",
        prices: [["Glass", 540]],
        items: [
          "Mars Shake",
          "Bounty Shake",
          "Snickers Shake",
          "Pistachio Shake",
          "Almond Shake",
          "Almond Oreo Shake",
          "Walnut Shake",
        ],
      },
      {
        name: "Super Premium",
        items: [
          ["Dry Fruit Cocktail Shake", [["Unit", 570]]],
          ["Chocolate Blaster Shake", [["Unit", 570]]],
        ],
      },
    ],
  },
  {
    id: "cold-coffee",
    name: "Cold Coffee",
    imageUrl: image.coldCoffee,
    subCategories: [
      {
        name: "Coffee Shakes",
        items: [
          ["Vanilla Cold Coffee", [["Unit", 380]]],
          ["Chocolate Cold Coffee", [["Unit", 440]]],
          ["Caramel Cold Coffee", [["Unit", 440]]],
        ],
      },
    ],
  },
  {
    id: "desserts",
    name: "Desserts & Cakes",
    imageUrl: image.desserts,
    subCategories: [
      {
        name: "Brownies",
        items: [
          ["Fudge Hot Brownie", [["Unit", 330]]],
          ["Brownie With Ice Cream", [["Unit", 400]]],
          ["Special Brownie With Ice Cream", [["Unit", 450]]],
        ],
      },
      {
        name: "Molten Lava",
        items: [
          ["Molten Lava Cake", [["Unit", 350]]],
          ["Molten Lava With Ice Cream", [["Unit", 450]]],
        ],
      },
    ],
  },
];

export function slugify(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

export function flattenSmogyiceCatalog() {
  return SMOGYICE_CATALOG.map((category, categoryIndex) => ({
    ...category,
    slug: category.id,
    sortOrder: categoryIndex + 1,
    products: category.subCategories.flatMap((subCategory, subCategoryIndex) =>
      subCategory.items.map((item, itemIndex) => {
        const isTuple = Array.isArray(item);
        const name = isTuple ? item[0] : item;
        const prices = isTuple ? item[1] : subCategory.prices;
        const slug = slugify(`${subCategory.name}-${name}`);

        return {
          name,
          slug,
          subCategoryName: subCategory.name,
          description: `${subCategory.name} from ${category.name}.`,
          imageUrl: category.imageUrl,
          basePrice: prices[0][1],
          displayOrder: subCategoryIndex * 100 + itemIndex + 1,
          variants: prices.map(([variantName, price], variantIndex) => ({
            name: variantName,
            fixedPrice: price,
            isDefault: variantIndex === 0,
            sortOrder: variantIndex + 1,
          })),
        };
      }),
    ),
  }));
}
