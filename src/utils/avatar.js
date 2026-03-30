export function getAvatarFallback(name = "Usuario") {
  const safeName = String(name || "Usuario").trim();
  const initial = safeName.charAt(0).toUpperCase() || "U";

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="160" height="160" viewBox="0 0 160 160">
      <defs>
        <linearGradient id="avatarGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#00ff88" />
          <stop offset="100%" stop-color="#00c6ff" />
        </linearGradient>
      </defs>
      <rect width="160" height="160" rx="80" fill="#08110d" />
      <circle cx="80" cy="80" r="72" fill="url(#avatarGradient)" opacity="0.18" />
      <text x="50%" y="54%" dominant-baseline="middle" text-anchor="middle"
        font-family="Arial, Helvetica, sans-serif" font-size="62" font-weight="700" fill="#d8fff0">${initial}</text>
    </svg>
  `;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

export function getSafeAvatarSrc(source, name = "Usuario") {
  return typeof source === "string" && source.trim() ? source : getAvatarFallback(name);
}
