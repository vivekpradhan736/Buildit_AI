import NextAuth from 'next-auth';
import GithubProvider from 'next-auth/providers/github';

const handler = NextAuth({
  providers: [
    GithubProvider({
      clientId: process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID,
      clientSecret: process.env.NEXT_PUBLIC_GITHUB_CLIENT_SECRET,
      authorization: {
        url: 'https://github.com/login/oauth/authorize',
        params: {
          scope: 'repo user', // Explicitly request 'repo' and 'user' scopes
        },
      },
      accessTokenUrl: 'https://github.com/login/oauth/access_token',
      profileUrl: 'https://api.github.com/user',
      profile: async (profile, tokens) => {
        // Log the scopes to verify they are granted
        const response = await fetch('https://api.github.com/user', {
          headers: {
            Authorization: `Bearer ${tokens.access_token}`,
            Accept: 'application/vnd.github+json',
          },
        });
        const scopes = response.headers.get('x-oauth-scopes');
        console.log('GitHub OAuth Scopes after authentication:', scopes);

        return {
          id: profile.id.toString(),
          name: profile.name || profile.login,
          email: profile.email,
          image: profile.avatar_url,
          login: profile.login,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account, profile }) {
      // Log the requested scopes during initial sign-in
      if (account) {
        console.log('Requested scopes during OAuth:', account.scope);
        token.access_token = account.access_token;
        token.refresh_token = account.refresh_token;
        token.expires_at = account.expires_at;
        token.githubUsername = profile.login;
      }

      // Check if token is expired
      if (Date.now() / 1000 > token.expires_at) {
        try {
          const response = await fetch('https://github.com/login/oauth/access_token', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Accept: 'application/json',
            },
            body: JSON.stringify({
              client_id: process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID,
              client_secret: process.env.NEXT_PUBLIC_GITHUB_CLIENT_SECRET,
              refresh_token: token.refresh_token,
              grant_type: 'refresh_token',
            }),
          });

          const refreshedTokens = await response.json();

          if (!response.ok) {
            throw new Error('Failed to refresh token');
          }

          token.access_token = refreshedTokens.access_token;
          token.refresh_token = refreshedTokens.refresh_token || token.refresh_token;
          token.expires_at = Math.floor(Date.now() / 1000 + refreshedTokens.expires_in);
        } catch (error) {
          console.error('Error refreshing access token:', error);
          return { ...token, error: 'RefreshAccessTokenError' };
        }
      }

      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.access_token;
      session.githubUsername = token.githubUsername;
      session.error = token.error;
      return session;
    },
  },
});

export { handler as GET, handler as POST };