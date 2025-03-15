export const isAuthenticated = () => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("adminToken") !== null;
    }
    return false;
  };  