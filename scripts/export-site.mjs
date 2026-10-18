import {spawnSync} from 'node:child_process';
import {cp,mkdir} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const result=spawnSync(process.execPath,['node_modules/next/dist/bin/next','build','--webpack'],{cwd:path.join(root,'apps/web'),env:{...process.env,EXPORT_STATIC:'1',NEXT_PUBLIC_STATIC_PREVIEW:'1'},stdio:'inherit'});
if(result.status!==0)process.exit(result.status||1);
await mkdir(path.join(root,'out'),{recursive:true});await cp(path.join(root,'apps/web/out'),path.join(root,'out'),{recursive:true});
console.log('Static promotional preview exported. Authentication requires the full NestJS deployment.');
