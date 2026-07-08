/* ==========================================
   GITHUB CONTRIBUTIONS
   Fetches user stats & contribution heatmap
   via a secure serverless Vercel proxy.
   ========================================== */
const GH_TOKEN = ""; // Add your token here only for local development (do not commit it)

const GH_USER = "Roy-code5k";

document.addEventListener("DOMContentLoaded", () => {

    const section = document.querySelector(".github-section");
    if (!section) return;

    fetchGitHubData();
});

/* ── Main fetch orchestrator ── */
async function fetchGitHubData() {
    try {
        const cacheKey = "gh_portfolio_data";
        const cacheDateKey = "gh_portfolio_date";

        const cachedData = localStorage.getItem(cacheKey);
        const cachedDate = localStorage.getItem(cacheDateKey);
        const todayDate = new Date().toDateString(); // e.g., "Wed Jul 08 2026"

        let data;

        if (cachedData && cachedDate === todayDate) {
            // Use cached data for today
            data = JSON.parse(cachedData);
        } else {
            // Fetch fresh data for a new day
            try {
                const res = await fetch("/api/github");
                if (!res.ok) throw new Error(`Proxy status: ${res.status}`);
                data = await res.json();
            } catch (proxyErr) {
                console.warn("Proxy API unavailable. Falling back to local direct fetches...", proxyErr);
                
                // Fallback direct fetches if GH_TOKEN is configured in local development
                if (typeof GH_TOKEN !== 'undefined' && GH_TOKEN) {
                    const [userData, reposData, contribData] = await Promise.all([
                        fetchREST(`https://api.github.com/users/${GH_USER}`),
                        fetchAllRepos(),
                        fetchContributions()
                    ]);
                    
                    data = {
                        public_repos: userData.public_repos || 0,
                        totalStars: reposData.reduce((sum, r) => sum + (r.stargazers_count || 0), 0),
                        totalContributions: contribData?.totalContributions || 0,
                        weeks: contribData?.weeks || []
                    };
                } else {
                    throw new Error("Vercel proxy failed and no local token is configured.");
                }
            }

            // Save to cache
            localStorage.setItem(cacheKey, JSON.stringify(data));
            localStorage.setItem(cacheDateKey, todayDate);
        }

        /* Stats */
        renderStat("gh-repos-count", data.public_repos || 0);
        renderStat("gh-contributions-count", data.totalContributions || 0);
        renderStat("gh-commits-count", 673);
        renderStat("gh-stars-count", data.totalStars || 0);

        /* Heatmap */
        const weeks = data.weeks || [];
        renderHeatmap(weeks);

    } catch (err) {
        console.error("GitHub API error:", err);
        renderFallback();
    }
}

/* ── REST helper (Fallback) ── */
async function fetchREST(url) {
    const res = await fetch(url, {
        headers: {
            "Authorization": `Bearer ${GH_TOKEN}`,
            "Accept": "application/vnd.github+json"
        }
    });
    if (!res.ok) throw new Error(`REST ${res.status}`);
    return res.json();
}

/* ── Fetch all repos (Fallback) ── */
async function fetchAllRepos() {
    let page = 1;
    let all = [];
    while (true) {
        const batch = await fetchREST(
            `https://api.github.com/users/${GH_USER}/repos?per_page=100&page=${page}`
        );
        all = all.concat(batch);
        if (batch.length < 100) break;
        page++;
    }
    return all;
}

/* ── GraphQL: contribution calendar (Fallback) ── */
async function fetchContributions() {
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

    const res = await fetch("https://api.github.com/graphql", {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${GH_TOKEN}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            query,
            variables: { login: GH_USER, from, to }
        })
    });

    if (!res.ok) throw new Error(`GraphQL ${res.status}`);
    const json = await res.json();

    if (json.errors) {
        console.warn("GraphQL errors:", json.errors);
        throw new Error(json.errors[0].message);
    }

    const cal = json.data.user.contributionsCollection.contributionCalendar;
    return {
        totalContributions: cal.totalContributions,
        weeks: cal.weeks
    };
}

/* ── Animated counter ── */
function renderStat(elementId, target) {
    const el = document.getElementById(elementId);
    if (!el) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCount(el, target);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.3 });

    observer.observe(el);
}

function animateCount(el, target, duration = 1500) {
    let start = null;
    const step = (ts) => {
        if (!start) start = ts;
        const progress = Math.min((ts - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.floor(eased * target).toLocaleString();
        if (progress < 1) requestAnimationFrame(step);
        else el.textContent = target.toLocaleString();
    };
    requestAnimationFrame(step);
}

/* ── Heatmap renderer ── */
function renderHeatmap(weeks) {
    const container = document.getElementById("gh-heatmap");
    const yearEl = document.getElementById("gh-heatmap-year");
    if (!container) return;

    /* Clear loading */
    container.innerHTML = "";

    /* Year label */
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    /* Month labels */
    const monthsRow = document.createElement("div");
    monthsRow.className = "heatmap-months";
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const monthPositions = {};
    const currentYear = new Date().getFullYear();
    weeks.forEach((week, wi) => {
        week.contributionDays.forEach(day => {
            const d = new Date(day.date);
            if (d.getFullYear() !== currentYear) return;
            const m = d.getMonth();
            if (!(m in monthPositions)) monthPositions[m] = wi;
        });
    });

    /* Calculate width per week for positioning */
    const weekWidth = 16; /* 13px square + 3px gap */
    const labelPadding = 32; /* day labels width */

    Object.keys(monthPositions).sort((a, b) => a - b).forEach((m, idx, arr) => {
        const span = document.createElement("span");
        span.className = "heatmap-month-label";
        span.textContent = monthNames[m];
        const nextM = arr[idx + 1];
        const startW = monthPositions[m];
        const endW = nextM !== undefined ? monthPositions[nextM] : weeks.length;
        const colSpan = endW - startW;
        span.style.width = `${colSpan * weekWidth}px`;
        monthsRow.appendChild(span);
    });

    /* Build body (day labels + grid) */
    const body = document.createElement("div");
    body.className = "heatmap-body";

    /* Day labels column */
    const dayLabelsCol = document.createElement("div");
    dayLabelsCol.className = "heatmap-day-labels";
    const dayNames = ["", "Mon", "", "Wed", "", "Fri", ""];
    dayNames.forEach(name => {
        const lbl = document.createElement("span");
        lbl.className = "heatmap-day-label";
        lbl.textContent = name;
        dayLabelsCol.appendChild(lbl);
    });

    /* Weeks grid */
    const grid = document.createElement("div");
    grid.className = "heatmap-grid";

    weeks.forEach(week => {
        const weekCol = document.createElement("div");
        weekCol.className = "heatmap-week";

        week.contributionDays.forEach(day => {
            const cell = document.createElement("div");
            cell.className = "heatmap-day";
            const level = getLevel(day.contributionCount);
            cell.setAttribute("data-level", level);

            /* Tooltip */
            const tip = document.createElement("span");
            tip.className = "heatmap-tooltip";
            const dateStr = formatDate(day.date);
            tip.innerHTML = `<span class="tooltip-count">${day.contributionCount}</span> contribution${day.contributionCount !== 1 ? 's' : ''} on ${dateStr}`;
            cell.appendChild(tip);

            weekCol.appendChild(cell);
        });

        grid.appendChild(weekCol);
    });

    body.appendChild(dayLabelsCol);
    body.appendChild(grid);

    container.appendChild(monthsRow);
    container.appendChild(body);
}

/* ── Level mapper ── */
function getLevel(count) {
    if (count === 0) return 0;
    if (count <= 3) return 1;
    if (count <= 6) return 2;
    if (count <= 9) return 3;
    return 4;
}

/* ── Date formatter ── */
function formatDate(dateStr) {
    const d = new Date(dateStr);
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

/* ── Fallback on error ── */
function renderFallback() {
    const ids = ["gh-repos-count", "gh-contributions-count", "gh-commits-count", "gh-stars-count"];
    ids.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            if (id === "gh-commits-count") {
                el.textContent = "673";
            } else {
                el.textContent = "—";
            }
        }
    });

    const container = document.getElementById("gh-heatmap");
    if (container) {
        container.innerHTML = '<div class="github-loading">Unable to load contribution data.</div>';
    }
}
