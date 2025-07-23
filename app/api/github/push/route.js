import { createRepoAndPushCode } from '@/lib/github';

export async function POST(req) {
  const body = await req.json();
  const { userId, projectName, generatedCode, accessToken } = body;

  // Validate input
  if (!userId || !projectName || !generatedCode || !generatedCode.files) {
    return new Response(
      JSON.stringify({ error: 'Missing required fields: userId, projectName, generatedCode' }),
      { status: 400 }
    );
  }

  try {
    if (!accessToken) {
      return new Response(
        JSON.stringify({ error: 'User has not connected GitHub account' }),
        { status: 401 }
      );
    }

    const { repoOwner, repoName, repoUrl } = await createRepoAndPushCode(
      userId,
      projectName,
      generatedCode,
      accessToken
    );

    return new Response(JSON.stringify({ repoOwner, repoName, repoUrl }), { status: 200 });
  } catch (error) {
    console.error('Error in /api/github/push:', error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
