/**
 * Cloudflare Worker: dukrnkarane-corrections
 *
 * Receives correction submissions and creates GitHub PRs automatically.
 *
 * Required secrets (set via `wrangler secret put`):
 *   - GITHUB_TOKEN: Fine-grained PAT with Contents + Pull requests permissions
 */

export default {
  async fetch(request, env) {
    const corsHeaders = {
      "Access-Control-Allow-Origin": env.ALLOWED_ORIGIN,
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    // Handle CORS preflight
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    if (request.method !== "POST") {
      return new Response("Method not allowed", {
        status: 405,
        headers: corsHeaders,
      });
    }

    // Rate limiting: 1 request per IP per 60 seconds
    const ip = request.headers.get("CF-Connecting-IP") || "unknown";
    const rateLimitKey = `https://ratelimit.internal/${ip}`;
    const cache = caches.default;

    const cached = await cache.match(rateLimitKey);
    if (cached) {
      return Response.json(
        {
          error:
            "Too many requests. Please wait a minute before submitting another correction.",
        },
        { status: 429, headers: corsHeaders },
      );
    }

    try {
      const body = await request.json();
      const { section, content, isAppendix } = body;

      if (!section || !content) {
        return Response.json(
          { error: "Missing required fields: section and content" },
          { status: 400, headers: corsHeaders },
        );
      }

      // Validate section number
      const sectionNum = parseInt(section, 10);
      if (isNaN(sectionNum) || sectionNum < 1 || sectionNum > 986) {
        return Response.json(
          { error: "Invalid section number" },
          { status: 400, headers: corsHeaders },
        );
      }

      // Determine file path based on section type
      const paddedNum = String(
        isAppendix ? sectionNum - 972 : sectionNum,
      ).padStart(3, "0");
      const filePath = isAppendix
        ? `data/appendix/${paddedNum}.md`
        : `data/rules/${paddedNum}.md`;

      // Create the PR
      const result = await createPullRequest(
        env,
        sectionNum,
        filePath,
        content,
      );

      // Set rate limit cache after successful submission
      await cache.put(
        rateLimitKey,
        new Response("1", {
          headers: { "Cache-Control": "max-age=60" },
        }),
      );

      return Response.json(result, { headers: corsHeaders });
    } catch (error) {
      console.error("Worker error:", error);
      return Response.json(
        { error: error.message || "Internal server error" },
        { status: 500, headers: corsHeaders },
      );
    }
  },
};

/**
 * Creates a GitHub Pull Request with the correction
 */
async function createPullRequest(env, section, filePath, newContent) {
  const { GITHUB_TOKEN, REPO_OWNER, REPO_NAME } = env;

  if (!GITHUB_TOKEN) {
    throw new Error("GITHUB_TOKEN not configured");
  }

  const api = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}`;
  const headers = {
    Authorization: `Bearer ${GITHUB_TOKEN}`,
    Accept: "application/vnd.github+json",
    "User-Agent": "dukrnkarane-corrections-worker",
    "X-GitHub-Api-Version": "2022-11-28",
  };

  // 1. Get the default branch and its latest commit SHA
  const repoRes = await fetch(api, { headers });
  if (!repoRes.ok) {
    const err = await repoRes.json();
    throw new Error(
      `Failed to fetch repository info: ${err.message || repoRes.status}`,
    );
  }
  const repo = await repoRes.json();
  const defaultBranch = repo.default_branch;

  const refRes = await fetch(`${api}/git/refs/heads/${defaultBranch}`, {
    headers,
  });
  if (!refRes.ok) {
    const err = await refRes.json();
    throw new Error(
      `Failed to fetch branch reference: ${err.message || refRes.status}`,
    );
  }
  const refData = await refRes.json();
  const baseSha = refData.object.sha;

  // 2. Create a new branch for this correction
  const timestamp = Date.now();
  const branchName = `corrections/section-${section}-${timestamp}`;

  const createBranchRes = await fetch(`${api}/git/refs`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      ref: `refs/heads/${branchName}`,
      sha: baseSha,
    }),
  });

  if (!createBranchRes.ok) {
    const err = await createBranchRes.json();
    throw new Error(
      `Failed to create branch: ${err.message || "Unknown error"}`,
    );
  }

  // 3. Get the current file SHA (required for updating)
  const fileRes = await fetch(
    `${api}/contents/${filePath}?ref=${defaultBranch}`,
    { headers },
  );

  if (!fileRes.ok) {
    throw new Error(`File not found: ${filePath}`);
  }
  const fileData = await fileRes.json();
  const fileSha = fileData.sha;

  // 4. Update the file on the new branch
  // Properly encode UTF-8 content to base64
  const contentBase64 = btoa(
    String.fromCharCode(...new TextEncoder().encode(newContent)),
  );

  const updateRes = await fetch(`${api}/contents/${filePath}`, {
    method: "PUT",
    headers,
    body: JSON.stringify({
      message: `Correction for section ${section}`,
      content: contentBase64,
      sha: fileSha,
      branch: branchName,
    }),
  });

  if (!updateRes.ok) {
    const err = await updateRes.json();
    throw new Error(
      `Failed to commit changes: ${err.message || "Unknown error"}`,
    );
  }

  // 5. Create the Pull Request
  const prRes = await fetch(`${api}/pulls`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      title: `Correction for section ${section}`,
      head: branchName,
      base: defaultBranch,
      body: [
        `## Community Correction`,
        ``,
        `This is an automatically submitted correction for **section ${section}**.`,
        ``,
        `### File Changed`,
        `\`${filePath}\``,
        ``,
        `---`,
        `*Submitted via the dukrnkarane corrections workflow.*`,
      ].join("\n"),
    }),
  });

  if (!prRes.ok) {
    const err = await prRes.json();
    throw new Error(
      `Failed to create pull request: ${err.message || "Unknown error"}`,
    );
  }

  const pr = await prRes.json();

  return {
    success: true,
    prUrl: pr.html_url,
    prNumber: pr.number,
    branch: branchName,
  };
}
