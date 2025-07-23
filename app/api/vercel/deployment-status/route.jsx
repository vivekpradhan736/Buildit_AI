const VERCEL_TOKEN = process.env.NEXT_PUBLIC_VERCEL_TOKEN;

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const deploymentId = searchParams.get('deploymentId');

    if (!deploymentId) {
      return new Response(JSON.stringify({ error: 'Missing required parameter: deploymentId' }), {
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

    // Fetch deployment status from Vercel API
    const response = await fetch(`https://api.vercel.com/v13/deployments/${deploymentId}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${VERCEL_TOKEN}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || 'Failed to fetch deployment status');
    }

    // Extract relevant deployment status information
    const status = data.readyState || 'QUEUED'; // Possible values: QUEUED, BUILDING, DEPLOYING, READY, ERROR
    const buildStatus = data.builds?.[0]?.state || 'UNKNOWN'; // Build-specific status
    const errorMessage = data.errorMessage || null; // Error message if deployment fails
    const deploymentUrl = data.url ? `https://${data.url}` : null; // Final deployment URL

    return new Response(JSON.stringify({
      status,
      buildStatus,
      errorMessage,
      deploymentUrl,
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Vercel deployment status error:', error);
    return new Response(JSON.stringify({ error: `Failed to fetch deployment status: ${error.message}` }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}