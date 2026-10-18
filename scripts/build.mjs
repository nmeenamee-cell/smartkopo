import {spawnSync} from 'node:child_process';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
function run(args,cwd=root){const r=spawnSync(process.execPath,args,{cwd,env:process.env,stdio:'inherit'});if(r.status!==0)process.exit(r.status||1);}
run(['node_modules/typescript/bin/tsc','-p','apps/api/tsconfig.json']);
if(process.env.SITES_EXPORT==='1')await import('./export-site.mjs');
else run(['node_modules/next/dist/bin/next','build','--webpack'],path.join(root,'apps/web'));
