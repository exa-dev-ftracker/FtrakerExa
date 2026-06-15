import Category from "~/server/model/category";

const defaultCategories = [
  { name: "General", type: null, color: "#6b7280", icon: "i-heroicons-tag" },
  { name: "Salary", type: "income", color: "#22c55e", icon: "i-heroicons-briefcase" },
  { name: "Freelance", type: "income", color: "#10b981", icon: "i-heroicons-banknotes" },
  { name: "Investment", type: "income", color: "#06b6d4", icon: "i-heroicons-chart-bar" },
  { name: "Gift", type: "income", color: "#a855f7", icon: "i-heroicons-gift" },
  { name: "Food & Drinks", type: "expense", color: "#f97316", icon: "i-heroicons-shopping-cart" },
  { name: "Transport", type: "expense", color: "#3b82f6", icon: "i-heroicons-truck" },
  { name: "Shopping", type: "expense", color: "#ec4899", icon: "i-heroicons-tag" },
  { name: "Bills", type: "expense", color: "#ef4444", icon: "i-heroicons-home" },
  { name: "Entertainment", type: "expense", color: "#d946ef", icon: "i-heroicons-musical-note" },
  { name: "Health", type: "expense", color: "#f43f5e", icon: "i-heroicons-heart" },
  { name: "Education", type: "expense", color: "#6366f1", icon: "i-heroicons-academic-cap" },
  { name: "Miscellaneous", type: null, color: "#8b5cf6", icon: "i-heroicons-ellipsis-horizontal" },
];

export async function ensureGeneralCategory(userId: string) {
  const general = await Category.findOne({ user: userId, name: "General" });
  if (general) return general;
  return await Category.create({ user: userId, name: "General", type: null, color: "#6b7280", icon: "i-heroicons-tag" });
}

export default async function seedCategories(userId: string) {
  const existing = await Category.findOne({ user: userId });
  if (existing) return;
  const categories = defaultCategories.map((cat) => ({
    ...cat,
    user: userId,
  }));
  await Category.insertMany(categories);
}
