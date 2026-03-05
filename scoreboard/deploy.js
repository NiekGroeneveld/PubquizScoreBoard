import { execSync } from 'child_process';
import { mkdtempSync, cpSync, rmSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

// Create a temporary directory
const tempDir = mkdtempSync(join(tmpdir(), 'gh-pages-deploy-'));

try {
  console.log('📦 Copying dist files to temporary directory...');
  cpSync('dist', tempDir, { recursive: true });

  console.log('🔧 Initializing git repository...');
  execSync('git init', { cwd: tempDir, stdio: 'inherit' });
  execSync('git add -A', { cwd: tempDir, stdio: 'inherit' });
  execSync('git commit -m "Deploy to GitHub Pages"', { cwd: tempDir, stdio: 'inherit' });

  console.log('📤 Pushing to gh-pages branch...');
  execSync('git remote add origin https://github.com/NiekGroeneveld/PubquizScoreBoard.git', { cwd: tempDir });
  execSync('git push -f origin HEAD:gh-pages', { cwd: tempDir, stdio: 'inherit' });

  console.log('✅ Successfully deployed to GitHub Pages!');
} catch (error) {
  console.error('❌ Deployment failed:', error.message);
  process.exit(1);
} finally {
  // Clean up temp directory
  console.log('🧹 Cleaning up...');
  rmSync(tempDir, { recursive: true, force: true });
}
