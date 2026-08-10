import { z } from "zod";

export const siteSettingsUpdateSchema = z.object({
  siteName: z.string().trim().min(1).max(120),
  logoUrl: z.string().trim().max(500).optional().nullable(),
  loginBgUrl: z.string().trim().max(500).optional().nullable(),
  foundingYear: z.number().int().min(1900).max(2100).default(2017),
  donationsEnabled: z.boolean().default(true),
  campaignsEnabled: z.boolean().default(true),
  contact: z
    .object({
      email: z.string().email().optional().or(z.literal("")),
      phone: z.string().trim().max(40).optional(),
      address: z.string().trim().max(300).optional(),
    })
    .default({}),
  socials: z
    .object({
      twitter: z.string().trim().max(200).optional(),
      facebook: z.string().trim().max(200).optional(),
      instagram: z.string().trim().max(200).optional(),
      linkedin: z.string().trim().max(200).optional(),
      youtube: z.string().trim().max(200).optional(),
      twitterEnabled: z.boolean().optional().default(true),
      facebookEnabled: z.boolean().optional().default(true),
      instagramEnabled: z.boolean().optional().default(true),
      linkedinEnabled: z.boolean().optional().default(true),
      youtubeEnabled: z.boolean().optional().default(true),
    })
    .default({}),
  seo: z
    .object({
      defaultTitle: z.string().trim().max(120).optional(),
      defaultDescription: z.string().trim().max(300).optional(),
      ogImageUrl: z.string().trim().max(500).optional(),
    })
    .default({}),
});
