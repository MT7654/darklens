import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
async function main() {
  const scan = await prisma.scan.findFirst({
    orderBy: { createdAt: "desc" },
    select: { id: true, createdAt: true, viewportScreenshot: true, pageTitle: true },
  });
  if (!scan) { console.log("No scans found"); return; }
  const shot = scan.viewportScreenshot ?? "";
  console.log("Latest scan ID:", scan.id);
  console.log("Created at:", scan.createdAt.toISOString());
  console.log("Page title:", scan.pageTitle);
  console.log("Screenshot base64 length:", shot.length);
  console.log("Screenshot approx KB:", Math.round(shot.length * 0.75 / 1024));
  // Save the screenshot to a file so we can see what was actually captured
  if (shot) {
    const fs = await import("node:fs/promises");
    // Detect if it's PNG or JPEG from the base64 header
    const buf = Buffer.from(shot, "base64");
    const isPNG = buf[0] === 0x89 && buf[1] === 0x50;
    const isJPEG = buf[0] === 0xff && buf[1] === 0xd8;
    const ext = isPNG ? "png" : isJPEG ? "jpg" : "bin";
    console.log("Image format:", ext.toUpperCase());
    await fs.writeFile(`/home/.z/workspaces/con_V31OwkUric6hurdV/latest-scan-screenshot.${ext}`, buf);
    console.log("Saved to: /home/.z/workspaces/con_V31OwkUric6hurdV/latest-scan-screenshot." + ext);
  }
}
main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
