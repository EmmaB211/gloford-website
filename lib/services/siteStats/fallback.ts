export type SiteStatFallbackInput = {
  programCount: number;
  donationCount: number;
  subscriberCount: number;
  eventCount: number;
  foundingYear?: number;
};

export type SiteStatFallbackItem = {
  id: string;
  label: string;
  value: string;
};

export function buildFallbackSiteStats({
  programCount,
  donationCount,
  subscriberCount,
  eventCount,
  foundingYear = 2017,
}: SiteStatFallbackInput): SiteStatFallbackItem[] {
  const livesEstimate = donationCount + subscriberCount + eventCount;
  const yearsOfImpact = new Date().getFullYear() - foundingYear;

  return [
    { id: "_communities", label: "Communities Served", value: "45+" },
    {
      id: "_lives",
      label: "Lives Impacted",
      value: livesEstimate > 0 ? `${livesEstimate.toLocaleString("en")}+` : "500+",
    },
    {
      id: "_programs",
      label: "Active Programs",
      value: programCount > 0 ? `${programCount}` : "8",
    },
    {
      id: "_years",
      label: "Years of Impact",
      value: `${yearsOfImpact}+`,
    },
  ];
}
