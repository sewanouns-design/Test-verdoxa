// Petit systeme d'auth "maison" sans base de donnees de sessions :
// - a la connexion, on verifie le mot de passe puis on pose un cookie
//   dont la valeur est le hash SHA-256 du mot de passe admin.
// - sur chaque requete protegee, on recalcule ce hash et on le compare
//   au cookie. Ca fonctionne aussi bien dans les Route Handlers (Node)
//   que dans le middleware (Edge), car crypto.subtle existe dans les deux.
export const ADMIN_COOKIE_NAME = "admin_token";

export async function hashPassword(pw: string): Promise<string> {
  const enc = new TextEncoder().encode(pw);
  const digest = await crypto.subtle.digest("SHA-256", enc);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
