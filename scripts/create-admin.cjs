// Run after building the API: node scripts/create-admin.cjs
// Credentials are stored only in the Git-ignored .local directory.
const fs = require('node:fs');
const path = require('node:path');
const { randomBytes, scrypt, timingSafeEqual } = require('node:crypto');
const { promisify } = require('node:util');
const { Store } = require('../apps/api/dist/store.js');
const root = path.resolve(__dirname, '..');
const credentialsPath = path.join(root, '.local/admin-account.json');
const derive = promisify(scrypt);
const store = new Store();
const timer = setTimeout(() => { console.error('Admin setup timed out.'); process.exit(1); }, 45000);
async function run() {
 try { process.loadEnvFile(path.join(root, '.env')); } catch(e) { if(e.code !== 'ENOENT') throw e; }
 await store.onModuleInit();
 let account;
 const existing = await store.users.findOne({ username: 'admin' }).select('+passwordHash');
 if(fs.existsSync(credentialsPath)) {
  account = JSON.parse(fs.readFileSync(credentialsPath, 'utf8'));
  if(account.username !== 'admin' || typeof account.password !== 'string' || account.password.length < 8) throw new Error('Invalid local admin credentials.');
 } else {
  if(existing) throw new Error('The admin username is already in use; no account was changed.');
  account = { username: 'admin', password: randomBytes(18).toString('base64url'), name: '사이트 관리자' };
  fs.mkdirSync(path.dirname(credentialsPath), { recursive: true });
  fs.writeFileSync(credentialsPath, JSON.stringify(account, null, 2), { flag: 'wx', mode: 0o600 });
 }
 if(existing) {
  const [salt, stored] = existing.passwordHash.split(':');
  const key = await derive(account.password, salt, 64);
  if(existing.role !== 'admin' || !timingSafeEqual(key, Buffer.from(stored, 'hex'))) throw new Error('Existing admin differs from the local credentials; no account was changed.');
 } else {
  const salt = randomBytes(16).toString('hex');
  const key = await derive(account.password, salt, 64);
  await store.users.create({ username: account.username, name: account.name, passwordHash: salt+':'+key.toString('hex'), role: 'admin' });
 }
 console.log('ADMIN_READY username=admin credentials=.local/admin-account.json');
}
run().catch(() => { console.error('Admin setup failed. Check the connection and existing admin credentials; no existing account is overwritten.'); process.exitCode=1; }).finally(async()=>{await store.onModuleDestroy();clearTimeout(timer)});
