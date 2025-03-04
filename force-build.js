// This script helps troubleshoot Next.js build issues
// It forces a clean build with additional checks to help diagnose path alias issues

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m', 
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m'
};

console.log(`${colors.blue}🔍 Starting enhanced Next.js build troubleshooting${colors.reset}`);

// Check for .next directory and clear it if it exists
if (fs.existsSync('.next')) {
  console.log(`${colors.yellow}🧹 Clearing existing .next directory...${colors.reset}`);
  try {
    fs.rmSync('.next', { recursive: true, force: true });
    console.log(`${colors.green}✓ .next directory cleared${colors.reset}`);
  } catch (err) {
    console.error(`${colors.red}Error clearing .next directory:${colors.reset}`, err);
  }
}

// Clear any Next.js cache
console.log(`${colors.blue}🧹 Clearing Next.js cache...${colors.reset}`);
try {
  if (fs.existsSync('.next/cache')) {
    fs.rmSync('.next/cache', { recursive: true, force: true });
  }
  console.log(`${colors.green}✓ Cache cleared${colors.reset}`);
} catch (err) {
  console.error(`${colors.red}Error clearing cache:${colors.reset}`, err);
}

// Verify path aliases in tsconfig
console.log(`${colors.blue}🔍 Verifying path aliases in tsconfig.json...${colors.reset}`);
try {
  const tsconfig = JSON.parse(fs.readFileSync('tsconfig.json', 'utf8'));
  if (tsconfig.compilerOptions && tsconfig.compilerOptions.paths && tsconfig.compilerOptions.paths['@/*']) {
    console.log(`${colors.green}✓ @/* path alias found in tsconfig.json${colors.reset}`);
  } else {
    console.log(`${colors.red}✗ @/* path alias missing in tsconfig.json${colors.reset}`);
  }
} catch (err) {
  console.error(`${colors.red}Error checking tsconfig.json:${colors.reset}`, err);
}

// Check for existence of key modules that were reported as missing
const missingModules = [
  'src/components/layout/Sidebar.tsx',
  'src/components/auth/AuthGuard.tsx',
  'src/context/AuthContext.tsx',
  'src/lib/services/projectService.ts',
];

console.log(`${colors.blue}🔍 Checking for modules that were reported as missing:${colors.reset}`);
missingModules.forEach(modulePath => {
  if (fs.existsSync(modulePath)) {
    console.log(`${colors.green}✓ ${modulePath} exists${colors.reset}`);
  } else {
    console.log(`${colors.red}✗ ${modulePath} does not exist${colors.reset}`);
  }
});

// Run Next.js build with more verbose output
console.log(`${colors.blue}🏗️ Running Next.js build with additional diagnostics...${colors.reset}`);

try {
  // Run with NODE_OPTIONS to get more debugging info
  execSync('NODE_OPTIONS="--trace-warnings" npx next build', { 
    stdio: 'inherit',
    env: { 
      ...process.env, 
      NEXT_TELEMETRY_DISABLED: '1'
    }
  });
  console.log(`${colors.green}✅ Build completed successfully!${colors.reset}`);
} catch (err) {
  console.error(`${colors.red}❌ Build failed with error:${colors.reset}`, err.message);
  process.exit(1);
}