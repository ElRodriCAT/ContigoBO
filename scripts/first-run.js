const fs = require('fs-extra');
const path = require('path');
const os = require('os');

async function firstRun(userDataPath) {
  // If a seed DB exists in prisma/seed.db, copy it to userData
  const repoSeed = path.join(__dirname, '..', 'prisma', 'seed.db');
  const targetDb = path.join(userDataPath, 'data.db');

  await fs.ensureDir(userDataPath);

  if (await fs.pathExists(targetDb)) {
    console.log('Database already exists at', targetDb);
    return;
  }

  if (await fs.pathExists(repoSeed)) {
    await fs.copy(repoSeed, targetDb);
    console.log('Copied seed DB to', targetDb);
  } else {
    console.log('No seed DB found in repo; leaving empty DB to be created by Prisma');
  }
}

if (require.main === module) {
  const userDataPath = process.argv[2] || path.join(os.homedir(), '.contigo');
  firstRun(userDataPath).catch(err => { console.error(err); process.exit(1); });
}

module.exports = firstRun;
