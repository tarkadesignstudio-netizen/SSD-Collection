export const ALLOWED_ADMIN_EMAILS = [
  'tarkadesignstudio@gmail.com',
  'ssd.motwani@gmail.com'
];

export const isAdmin = (user: { email?: string | null } | null) => {
  return !!user?.email && ALLOWED_ADMIN_EMAILS.includes(user.email);
};
