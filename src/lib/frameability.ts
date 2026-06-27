export async function canFrameUrl(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, {
      method: "HEAD",
      redirect: "follow",
      signal: AbortSignal.timeout(8000),
    });

    const xfo = response.headers.get("x-frame-options");
    if (xfo && /^(deny|sameorigin)$/i.test(xfo.trim())) {
      return false;
    }

    const csp = response.headers.get("content-security-policy");
    if (csp) {
      const match = csp.match(/frame-ancestors\s+([^;]+)/i);
      if (match) {
        const ancestors = match[1].trim().toLowerCase();
        // 'none' blocks all; if it doesn't include '*' it's restrictive
        if (ancestors === "none" || !ancestors.includes("*")) {
          return false;
        }
      }
    }

    return true;
  } catch {
    // If we can't check headers, assume frameable and let the iframe try
    return true;
  }
}
