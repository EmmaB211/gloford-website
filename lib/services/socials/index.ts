import { getSiteSettings } from "@/lib/services/settings/site";

function extractHandleFromUrl(url: string) {
  try {
    const u = new URL(url);
    const parts = u.pathname.split("/").filter(Boolean);
    // twitter/x, linkedin, instagram: common pattern is first segment is the handle
    return parts[0] ?? null;
  } catch (e) {
    return null;
  }
}

async function fetchYouTube(channelUrl: string) {
  // try channel id first
  try {
    const u = new URL(channelUrl);
    const parts = u.pathname.split("/").filter(Boolean);
    const chIndex = parts.indexOf("channel");
    if (chIndex !== -1 && parts[chIndex + 1]) {
      const channelId = parts[chIndex + 1];
      const feedUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`;
      const res = await fetch(feedUrl);
      if (!res.ok) return [];
      const xml = await res.text();
      const entries: Array<any> = [];
      const entryRe = /<entry>([\s\S]*?)<\/entry>/g;
      let m: RegExpExecArray | null;
      while ((m = entryRe.exec(xml))) {
        const entry = m[1];
        if (!entry) continue;
        const titleMatch = entry.match(/<title>([\s\S]*?)<\/title>/);
        const linkMatch = entry.match(/<link[^>]*href="([^"]+)"/);
        const thumbMatch = entry.match(/<media:thumbnail[^>]*url="([^"]+)"/);
        const publishedMatch = entry.match(/<published>([\s\S]*?)<\/published>/);
        entries.push({
          title: titleMatch ? titleMatch[1] : null,
          link: linkMatch ? linkMatch[1] : null,
          thumbnail: thumbMatch ? thumbMatch[1] : null,
          publishedAt: publishedMatch ? publishedMatch[1] : null,
        });
      }
      return entries;
    }

    // fallback: if watch?v= style or channel url without id, return empty
    return [];
  } catch (e) {
    return [];
  }
}

async function fetchX(twitterUrl: string) {
  const bearer = process.env.X_BEARER_TOKEN;
  if (!bearer) return [];
  const handle = extractHandleFromUrl(twitterUrl);
  if (!handle) return [];
  try {
    const u = `https://api.twitter.com/2/users/by/username/${handle}`;
    const userRes = await fetch(u, { headers: { Authorization: `Bearer ${bearer}` } });
    if (!userRes.ok) return [];
    const userJson = await userRes.json();
    const id = userJson?.data?.id;
    if (!id) return [];
    const tweetsRes = await fetch(
      `https://api.twitter.com/2/users/${id}/tweets?max_results=5&tweet.fields=created_at,public_metrics,text`,
      { headers: { Authorization: `Bearer ${bearer}` } }
    );
    if (!tweetsRes.ok) return [];
    const tweets = await tweetsRes.json();
    return (tweets.data ?? []).map((t: any) => ({
      id: t.id,
      text: t.text,
      link: `https://x.com/${handle}/status/${t.id}`,
      createdAt: t.created_at,
      likeCount: t.public_metrics?.like_count ?? 0,
      retweetCount: t.public_metrics?.retweet_count ?? 0,
    }));
  } catch (e) {
    return [];
  }
}

async function fetchFacebook(pageUrl: string) {
  const token = process.env.FACEBOOK_PAGE_ACCESS_TOKEN;
  if (!token) return [];
  try {
    const u = new URL(pageUrl);
    const parts = u.pathname.split("/").filter(Boolean);
    const pageName = parts[0];
    if (!pageName) return [];
    // Resolve page id
    const pageRes = await fetch(`https://graph.facebook.com/v17.0/${pageName}?fields=id&access_token=${token}`);
    if (!pageRes.ok) return [];
    const pageJson = await pageRes.json();
    const id = pageJson?.id;
    if (!id) return [];
    const postsRes = await fetch(
      `https://graph.facebook.com/v17.0/${id}/posts?fields=message,created_time,permalink_url,full_picture,shares,likes.summary(true)&limit=5&access_token=${token}`
    );
    if (!postsRes.ok) return [];
    const postsJson = await postsRes.json();
    return (postsJson.data ?? []).map((p: any) => ({
      id: p.id,
      message: p.message,
      link: p.permalink_url,
      picture: p.full_picture,
      createdAt: p.created_time,
      likeCount: p.likes?.summary?.total_count ?? 0,
      shareCount: p.shares?.count ?? 0,
    }));
  } catch (e) {
    return [];
  }
}

async function fetchLinkedIn(linkedinUrl: string) {
  const token = process.env.LINKEDIN_ACCESS_TOKEN;
  if (!token) return [];
  try {
    const u = new URL(linkedinUrl);
    const parts = u.pathname.split("/").filter(Boolean);
    // try company id pattern /company/{id}
    const idx = parts.indexOf("company");
    let ownerUrn: string | null = null;
    if (idx !== -1 && parts[idx + 1]) {
      ownerUrn = `urn:li:organization:${parts[idx + 1]}`;
    }
    if (!ownerUrn) return [];
    const res = await fetch(`https://api.linkedin.com/v2/shares?q=owners&owners=${encodeURIComponent(ownerUrn)}&count=5`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return [];
    const json = await res.json();
    return (json.elements ?? []).map((e: any) => ({
      id: e.activity ?? e.share ?? null,
      text: e.text?.text ?? null,
      link: e.permalink ?? null,
      createdAt: e.created?.time ? new Date(e.created.time).toISOString() : null,
    }));
  } catch (e) {
    return [];
  }
}

export async function getSocialsFeed() {
  const settings = await getSiteSettings();
  const socials = (settings?.socials as Record<string, string>) ?? {};
  const out: Record<string, any> = { twitter: [], facebook: [], instagram: [], youtube: [], linkedin: [] };

  // Parallel fetchers
  const tasks = [
    (async () => {
      if (socials.twitter) out.twitter = await fetchX(socials.twitter);
    })(),
    (async () => {
      if (socials.facebook) out.facebook = await fetchFacebook(socials.facebook);
    })(),
    (async () => {
      if (socials.instagram) out.instagram = []; // TODO: Instagram oEmbed requires App Token; leaving empty unless token available
    })(),
    (async () => {
      if (socials.youtube) out.youtube = await fetchYouTube(socials.youtube);
    })(),
    (async () => {
      if (socials.linkedin) out.linkedin = await fetchLinkedIn(socials.linkedin);
    })(),
  ];

  await Promise.all(tasks);
  // If any provider returned no items, allow demo posts configured in site settings
  try {
    const demo = (socials as any)?.demoPosts ?? null;
    if (demo) {
      if ((out.twitter?.length ?? 0) === 0 && Array.isArray(demo.twitter)) out.twitter = demo.twitter;
      if ((out.facebook?.length ?? 0) === 0 && Array.isArray(demo.facebook)) out.facebook = demo.facebook;
      if ((out.instagram?.length ?? 0) === 0 && Array.isArray(demo.instagram)) out.instagram = demo.instagram;
      if ((out.youtube?.length ?? 0) === 0 && Array.isArray(demo.youtube)) out.youtube = demo.youtube;
      if ((out.linkedin?.length ?? 0) === 0 && Array.isArray(demo.linkedin)) out.linkedin = demo.linkedin;
    }
  } catch (e) {
    // ignore
  }

  return out;
}
