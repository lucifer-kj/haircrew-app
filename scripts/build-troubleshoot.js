const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔧 Prisma Build Troubleshooter');

function cleanPrismaCache() {
  const prismaPath = path.join(__dirname, '..', 'node_modules', '.prisma');
  if (fs.existsSync(prismaPath)) {
    console.log('🧹 Cleaning Prisma cache...');
    try {
      fs.rmSync(prismaPath, { recursive: true, force: true });
      console.log('✅ Prisma cache cleaned');
    } catch (error) {
      console.log('⚠️ Could not clean Prisma cache:', error.message);
    }
  }
}

function generatePrisma() {
  console.log('🔨 Generating Prisma client...');
  try {
    execSync('npx prisma generate', { stdio: 'inherit' });
    console.log('✅ Prisma client generated successfully');
    return true;
  } catch (error) {
    console.log('❌ Prisma generation failed:', error.message);
    return false;
  }
}

function main() {
  cleanPrismaCache();
  
  if (!generatePrisma()) {
    console.log('⚠️ Continuing build without Prisma generation...');
    console.log('💡 You may need to run "npm run prisma:generate" manually later');
  }
  
  console.log('🚀 Proceeding with Next.js build...');
  try {
    execSync('npx next build', { stdio: 'inherit' });
    console.log('✅ Build completed successfully');
  } catch (error) {
    console.log('❌ Build failed:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { cleanPrismaCache, generatePrisma }; 