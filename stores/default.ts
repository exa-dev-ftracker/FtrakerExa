import type { Category, Transaction } from "~/types";

export const useDefaultStore = defineStore("default", {
  state: () => {
    return {
      isAuth: false,
      jwt: "",
      user: null as { email: string; name: string; id: string } | null,
      isTransactionModalOpen: false,
      transactionToEdit: null as Transaction | null,
      refreshTrigger: 0,
      categories: [] as Category[],
    };
  },
  actions: {
    login(jwt: string) {
      this.isAuth = true;
      this.jwt = jwt;
    },
    setUser(user: { email: string; name: string; id: string } | null) {
      this.user = user;
    },
    logout() {
      this.isAuth = false;
      this.user = null;
      this.jwt = "";
      this.categories = [];
    },
    toggleTransactionModal(value: boolean) {
      this.isTransactionModalOpen = value;
      if (!value) {
        this.transactionToEdit = null;
      }
    },
    editTransaction(transaction: Transaction) {
      this.transactionToEdit = JSON.parse(JSON.stringify(transaction));
      this.isTransactionModalOpen = true;
    },
    triggerRefresh() {
      this.refreshTrigger++;
    },
    async fetchCategories() {
      try {
        const { $axios } = useNuxtApp();
        const res = await ($axios as any).get("/api/category");
        this.categories = res.data?.body || res.body || [];
      } catch (err) {
        console.error("Failed to fetch categories:", err);
      }
    },
  },
});
