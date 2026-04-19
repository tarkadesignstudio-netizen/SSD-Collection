export const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL;

export const isAdmin = (user: { email?: string | null } | null) => {
  return user?.email === ADMIN_EMAIL;
};
