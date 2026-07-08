/**
 * ============================================================
 * VERCEL SERVERLESS PROXY FOR GITHUB STATS
 * Keeps the GitHub Personal Access Token (GH_TOKEN) server-side
 * and caches responses at the Vercel edge.
 * ============================================================
 */

export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    const GH_TOKEN = process.env.GH_TOKEN;
    const GH_USER = "Roy-code5k";

    if (!GH_TOKEN) {
        return res.status(500).json({ 
            error: "GH_TOKEN is not configured in Vercel environment variables." 
        });
    }

    try {
        // 1. Fetch GitHub User Profile
        const userRes = await fetch(`https://api.github.com/users/${GH_USER}`, {
            headers: {
                "Authorization": `Bearer ${GH_TOKEN}`,
                "Accept": "application/vnd.github+json",
                "User-Agent": "Roy-Portfolio-Proxy"
            }
        });
        if (!userRes.ok) throw new Error(`User profile REST error: ${userRes.status}`);
        const userData = await userRes.json();

        // 2. Fetch all public repos to count stars
        let page = 1;
        let allRepos = [];
        while (true) {
            const reposRes = await fetch(`https://api.github.com/users/${GH_USER}/repos?per_page=100&page=${page}`, {
                headers: {
                    "Authorization": `Bearer ${GH_TOKEN}`,
                    "Accept": "application/vnd.github+json",
                    "User-Agent": "Roy-Portfolio-Proxy"
                }
            });
            if (!reposRes.ok) throw new Error(`Repos REST error: ${reposRes.status}`);
            const batch = await reposRes.json();
            allRepos = allRepos.concat(batch);
            if (batch.length < 100) break;
            page++;
        }

        const totalStars = allRepos.reduce((sum, r) => sum + (r.stargazers_count || 0), 0);

        // 3. Fetch contributions heatmap calendar via GraphQL
        const now = new Date();
        const from = new Date(now.getFullYear(), 0, 1).toISOString();
        const to = now.toISOString();

        const query = `
            query($login: String!, $from: DateTime!, $to: DateTime!) {
                user(login: $login) {
                    contributionsCollection(from: $from, to: $to) {
                        contributionCalendar {
                            totalContributions
                            weeks {
                                contributionDays {
                                    contributionCount
                                    date
                                }
                            }
                        }
                    }
                }
            }
        `;

        const graphQLRes = await fetch("https://api.github.com/graphql", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${GH_TOKEN}`,
                "Content-Type": "application/json",
                "User-Agent": "Roy-Portfolio-Proxy"
            },
            body: JSON.stringify({
                query,
                variables: { login: GH_USER, from, to }
            })
        });

        if (!graphQLRes.ok) throw new Error(`GraphQL error: ${graphQLRes.status}`);
        const graphQLData = await graphQLRes.json();

        if (graphQLData.errors) {
            throw new Error(graphQLData.errors[0].message);
        }

        const cal = graphQLData.data.user.contributionsCollection.contributionCalendar;

        // Cache response at Vercel CDN/Edge for 12 hours (43200 seconds)
        // to minimize rate-limiting and maximize loading speed.
        res.setHeader('Cache-Control', 's-maxage=43200, stale-while-revalidate');

        res.status(200).json({
            public_repos: userData.public_repos || 0,
            totalStars,
            totalContributions: cal.totalContributions || 0,
            weeks: cal.weeks || []
        });

    } catch (err) {
        console.error("Vercel API Proxy error:", err);
        res.status(500).json({ error: err.message || "Internal server error" });
    }
}
