import { execSync } from 'child_process';
import { existsSync } from 'fs';
import { resolve } from 'path';

try {
  // Check if dist folder exists
  const distPath = resolve('dist');
  if (!existsSync(distPath)) {
    console.error('❌ dist folder not found. Run "npm run build" first.');
    process.exit(1);
  }

  console.log('📦 Deploying to GitHub Pages...');
  
  // Navigate to repository root
  const repoRoot = resolve('..');
  process.chdir(repoRoot);
  
  // Use git subtree to push only the dist folder to gh-pages
  execSync('git subtree push --prefix scoreboard/dist origin gh-pages', { 
    stdio: 'inherit' 
  });

  console.log('✅ Successfully deployed to GitHub Pages!');
  console.log('🌐 Your site will be available at: https://niekgroeneveld.github.io/PubquizScoreBoard/');
} catch (error) {
  console.error('❌ Deployment failed:', error.message);
  process.exit(1);
}
