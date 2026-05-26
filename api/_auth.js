export function adminToken() {
  return process.env.ADMIN_TOKEN || "";
}

export function isAdmin(req) {
  const token = req.headers["x-admin-token"] || req.query.token;
  return Boolean(adminToken()) && token === adminToken();
}
