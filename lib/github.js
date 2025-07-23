import { Octokit } from '@octokit/core';

// Hardcoded files (from your DEFAULT_FILE)
const DEFAULT_FILES = {
  'index.html': `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" href="/favicon.ico" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Vite + React</title>
    <script src="https://cdn.tailwindcss.com"></script>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>`,
  'src/App.css': `
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 210 40% 98%;
    --foreground: 222.2 84% 4.9%;

    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;

    --popover: 0 0% 100%;
    --popover-foreground: 222.2 84% 4.9%;

    --primary: 221 83% 53%;
    --primary-foreground: 210 40% 98%;

    --secondary: 210 40% 96.1%;
    --secondary-foreground: 222.2 47.4% 11.2%;

    --muted: 210 40% 96.1%;
    --muted-foreground: 215.4 16.3% 46.9%;

    --accent: 223 100% 97%;
    --accent-foreground: 221 83% 53%;

    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;

    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 221 83% 53%;

    --radius: 0.5rem;

    --sidebar-background: 0 0% 98%;
    --sidebar-foreground: 240 5.3% 26.1%;
    --sidebar-primary: 221 83% 53%;
    --sidebar-primary-foreground: 0 0% 98%;
    --sidebar-accent: 240 4.8% 95.9%;
    --sidebar-accent-foreground: 240 5.9% 10%;
    --sidebar-border: 220 13% 91%;
    --sidebar-ring: 221 83% 53%;
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;

    --card: 222.2 84% 4.9%;
    --card-foreground: 210 40% 98%;

    --popover: 222.2 84% 4.9%;
    --popover-foreground: 210 40% 98%;

    --primary: 217.2 91.2% 59.8%;
    --primary-foreground: 222.2 47.4% 11.2%;

    --secondary: 217.2 32.6% 17.5%;
    --secondary-foreground: 210 40% 98%;

    --muted: 217.2 32.6% 17.5%;
    --muted-foreground: 215 20.2% 65.1%;

    --accent: 217.2 32.6% 17.5%;
    --accent-foreground: 210 40% 98%;

    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 210 40% 98%;

    --border: 217.2 32.6% 17.5%;
    --input: 217.2 32.6% 17.5%;
    --ring: 224.3 76.3% 48%;
    --sidebar-background: 240 5.9% 10%;
    --sidebar-foreground: 240 4.8% 95.9%;
    --sidebar-primary: 224.3 76.3% 48%;
    --sidebar-primary-foreground: 0 0% 100%;
    --sidebar-accent: 240 3.7% 15.9%;
    --sidebar-accent-foreground: 240 4.8% 95.9%;
    --sidebar-border: 240 3.7% 15.9%;
    --sidebar-ring: 217.2 91.2% 59.8%;
  }
}

@layer base {
  * {
    @apply border-border;
  }

  body {
    @apply bg-background text-foreground;
  }
}

.hover-scale {
  @apply transition-transform duration-200 hover:scale-105;
}`,
  'tailwind.config.js': `
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}`,
  'postcss.config.js': `
/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    tailwindcss: {},
  },
};

export default config;
`,
'vite.config.js': `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
});`
};

// Hardcoded dependencies (from your DEPENDANCY)
const DEPENDENCIES = {
  dependencies: {
    "postcss": "^8",
    "tailwindcss": "^3.4.1",
    "autoprefixer": "^10.0.0",
    "uuid4": "^2.0.3",
    "tailwind-merge": "^2.4.0",
    "tailwindcss-animate": "^1.0.7",
    "lucide-react": "^0.469.0",
    "react-router-dom": "^7.1.1",
    "firebase": "^11.1.0",
    "@google/generative-ai": "^0.21.0",
    "date-fns": "^4.1.0",
    "react-chartjs-2": "^5.3.0",
    "chart.js": "^4.4.7",
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  devDependencies: {
    "vite": "^4.0.0",
    "@vitejs/plugin-react": "^4.0.0"
  }
};

function combineProjectFiles(generatedProject, repoName) {
  const files = {};

  // Step 1: Extract AI-generated files and map to Vite structure
  for (const [filePath, fileData] of Object.entries(generatedProject.files)) {
    // Map AI-generated paths to Vite structure
    // e.g., /App.js -> src/App.js, /components/Button.js -> src/components/Button.js
    const cleanPath = filePath.startsWith('/') ? filePath.slice(1) : filePath;
    const vitePath = filePath.startsWith('/components') 
      ? `src/${cleanPath.replace(/\.js$/, '.jsx')}` 
      : `src/${cleanPath.replace(/\.js$/, '.jsx')}`;
    files[vitePath] = fileData.code;
  }

  // Step 2: Merge with hardcoded files
  for (const [filePath, code] of Object.entries(DEFAULT_FILES)) {
    files[filePath] = code;
  }

  // Step 3: Generate index.js
  files['src/main.jsx'] = `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import "./styles.css";

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);`;

  // Step 4: Generate package.json
  files['package.json'] = JSON.stringify({
    name: repoName,
    version: '1.0.0',
    private: true,
    scripts: {
      dev: 'vite',
      build: 'vite build',
      preview: 'vite preview'
    },
    ...DEPENDENCIES
  }, null, 2);

  return files;
}

export async function createRepoAndPushCode(userId, projectName, generatedProject, accessToken) {
  try {
    // Validate access token
    if (!accessToken) {
      throw new Error('No GitHub access token provided');
    }

    // Initialize Octokit with user-specific access token
    const octokit = new Octokit({ auth: accessToken });

    // Test token authentication and retrieve user info
    let userResponse;
    try {
      userResponse = await octokit.request('GET /user');
      console.log('Authenticated as:', userResponse.data.login);
    } catch (authError) {
      throw new Error(`Invalid GitHub access token: Unable to authenticate - ${authError.message}`);
    }

    // Check token scopes
    const tokenScopes = userResponse.headers['x-oauth-scopes'] || '';
    const requiredScopes = ['repo', 'user'];
    const hasRequiredScopes = requiredScopes.every(scope => tokenScopes.includes(scope));
    if (!hasRequiredScopes) {
      throw new Error(`GitHub access token lacks required scopes. Required: ${requiredScopes.join(', ')}, Found: ${tokenScopes}`);
    }

    // Create a unique repository name
    const repoName = `buildit-ai-${userId}-${projectName.replace(/\s+/g, '-')}`.toLowerCase();

    // Create a new repository
    const repoResponse = await octokit.request('POST /user/repos', {
      name: repoName,
      description: `Generated by Buildit.ai: ${generatedProject.projectTitle || 'React App'}`,
      private: false,
      auto_init: false,
    });

    const repoOwner = repoResponse.data.owner.login;

    // Combine generated and hardcoded files
    const files = combineProjectFiles(generatedProject, repoName);

    // Upload each file to the repository
    for (const [filePath, content] of Object.entries(files)) {
      const base64Content = Buffer.from(content).toString('base64');
      await octokit.request('PUT /repos/{owner}/{repo}/contents/{path}', {
        owner: repoOwner,
        repo: repoName,
        path: filePath,
        message: `Add ${filePath} from Buildit.ai`,
        content: base64Content,
      });
    }

    const repoUrl = `https://github.com/${repoOwner}/${repoName}.git`;

    return { repoOwner, repoName, repoUrl };
  } catch (error) {
    console.error('GitHub API error:', error);
    throw new Error(`Failed to create repository or push code: ${error.message}`);
  }
}