export const useDefaultStore = defineStore("default", {
  state: () => {
    return {
      isAuth: false,
      jwt: "",
      user: null as { email: string; name: string; id: string } | null,
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
    },
  },
});
