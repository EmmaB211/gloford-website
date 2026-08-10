const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  const existing = await prisma.siteSettings.findUnique({ where: { id: "singleton" } });

  const demoSocials = {
    twitter: "https://x.com/gloford_org",
    facebook: "https://www.facebook.com/gloford.org",
    instagram: "https://www.instagram.com/gloford_org",
    linkedin: "https://www.linkedin.com/company/gloford",
    // Example YouTube channel id path — replace as needed
    youtube: "https://www.youtube.com/channel/UCBR8-60-B28hp2BmDPdntcQ",
    twitterEnabled: true,
    facebookEnabled: true,
    instagramEnabled: true,
    linkedinEnabled: true,
    youtubeEnabled: true,
    demoPosts: {
      twitter: [
        {
          id: "demo-tweet-1",
          text: "Welcome to GLOFORD — building stronger communities together!",
          link: "https://x.com/gloford_org/status/demo-tweet-1",
          createdAt: new Date().toISOString(),
          likeCount: 42,
          retweetCount: 5,
        },
      ],
      facebook: [
        {
          id: "demo-fb-1",
          message: "Our recent community health drive reached over 1,200 people.",
          link: "https://facebook.com/gloford.org/posts/demo-fb-1",
          picture: "/seed-images/gloford/hero-community.jpg",
          createdAt: new Date().toISOString(),
          likeCount: 128,
          shareCount: 12,
        },
      ],
      youtube: [],
    },
  };

  const socials = Object.assign({}, (existing?.socials as object) ?? {}, demoSocials);

  await prisma.siteSettings.upsert({
    where: { id: "singleton" },
    create: {
      id: "singleton",
      siteName: existing?.siteName ?? "GLOFORD Demo",
      contact: existing?.contact ?? {},
      socials,
      seo: existing?.seo ?? {},
      foundingYear: existing?.foundingYear ?? 2017,
      donationsEnabled: existing?.donationsEnabled ?? true,
      campaignsEnabled: existing?.campaignsEnabled ?? true,
    },
    update: {
      socials,
    },
  });

  console.log("Demo socials seeded.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
