import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
async function main() {
  const scans = await prisma.scan.findMany({
    orderBy: { createdAt: "desc" },
    take: 5,
    select: {
      id: true,
      url: true,
      status: true,
      createdAt: true,
      viewportScreenshot: true,
    },
  });
  console.log("=== SCREENSHOT STORAGE CHECK ===");
  for (const s of scans) {
    const hasShot = s.viewportScreenshot !== null && s.viewportScreenshot !== "";
    const shotLen = s.viewportScreenshot?.length ?? 0;
    console.log({
      id: s.id,
      url: s.url.slice(0, 50),
      status: s.status,
      createdAt: s.createdAt.toISOString(),
      hasScreenshot: hasShot,
      screenshotLength: shotLen,
    });
  }
}
main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
