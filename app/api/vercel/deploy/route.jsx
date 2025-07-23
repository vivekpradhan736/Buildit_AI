
const VERCEL_TOKEN = process.env.NEXT_PUBLIC_VERCEL_TOKEN;

export async function POST(request) {
  try {
    const { userId, repoOwner, repoName, githubAccessToken} = await request.json();

    if (!userId || !repoOwner || !repoName || !githubAccessToken) {
      return new Response(JSON.stringify({ error: 'Missing required fields: userId, repoOwner, and repoName are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (!VERCEL_TOKEN) {
      return new Response(JSON.stringify({ error: 'Vercel API token is not configured' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Fetch the GitHub repoId using the GitHub API
    const githubResponse = await fetch(`https://api.github.com/repos/${repoOwner}/${repoName}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${githubAccessToken}`,
        Accept: 'application/vnd.github+json',
      },
    });

    console.log("githubResponse",githubResponse)

    const githubData = await githubResponse.json();
    console.log("githubData",githubData)

    if (!githubResponse.ok) {
      throw new Error(githubData.message || 'Failed to fetch GitHub repository details');
    }

    const repoId = githubData.id;
    console.log("repoId",repoId)

    // Create a new deployment using Vercel API
    const response = await fetch('https://api.vercel.com/v13/deployments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${VERCEL_TOKEN}`,
      },
      body: JSON.stringify({
        name: repoName,
        gitSource: {
          type: 'github',
          repoId: repoId,
          ref: 'main',
        },
        projectSettings: {
          framework: 'vite',
          buildCommand: 'npm run build',
          outputDirectory: 'dist',
        },
        env: {},
      }),
    });

    const data = await response.json();
    console.log("data",data)

    if (!response.ok) {
      throw new Error(data.error?.message || 'Failed to create Vercel deployment');
    }

    // The deployment URL will be in the format https://<deployment-id>.vercel.app
    const deploymentId = data.id; // Vercel deployment ID
    const deploymentUrl = data.url || `https://${repoName}.vercel.app`;

    return new Response(JSON.stringify({ deploymentId, deploymentUrl }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Vercel deployment error:', error);
    return new Response(JSON.stringify({ error: `Failed to deploy to Vercel: ${error.message}` }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}