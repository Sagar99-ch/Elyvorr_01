import { mutation } from "./_generated/server";

export const seedProducts = mutation({
  args: {},

  handler: async (ctx) => {
    // Prevent duplicate products
    const existingProducts = await ctx.db.query("products").collect();

    if (existingProducts.length > 0) {
      return {
        success: false,
        message: "Products already exist in the database.",
        count: existingProducts.length,
      };
    }

    const products = [
      {
        name: "Noir Oud",
        volume: "100ml",
        price: 2499,
        oldPrice: 3499,
        reviews: 124,
        badge: "Bestseller",
        image: "/images/perfumes/noir-oud.png",
        stock: 50,
        isActive: true,
        createdAt: Date.now(),
      },

      {
        name: "Velvet Bloom",
        volume: "100ml",
        price: 2199,
        oldPrice: 2999,
        reviews: 98,
        badge: "New",
        image: "/images/perfumes/velvet-bloom.png",
        stock: 50,
        isActive: true,
        createdAt: Date.now(),
      },

      {
        name: "Royal Musk",
        volume: "100ml",
        price: 1899,
        oldPrice: 2599,
        reviews: 86,
        badge: "Popular",
        image: "/images/perfumes/royal-musk.png",
        stock: 50,
        isActive: true,
        createdAt: Date.now(),
      },

      {
        name: "Amber Woods",
        volume: "100ml",
        price: 2299,
        oldPrice: 3199,
        reviews: 76,
        badge: "New",
        image: "/images/perfumes/amber-woods.png",
        stock: 50,
        isActive: true,
        createdAt: Date.now(),
      },
    ];

    const insertedIds = [];

    for (const product of products) {
      const id = await ctx.db.insert("products", product);

      insertedIds.push(id);
    }

    return {
      success: true,
      message: "ELYVORR products added successfully.",
      count: insertedIds.length,
      ids: insertedIds,
    };
  },
});
