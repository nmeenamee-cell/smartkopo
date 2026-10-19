import {spawnSync} from 'node:child_process';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
function run(args,cwd=root,extra={}){
 const result=spawnSync(process.execPath,args,{cwd,env:{...process.env,...extra},stdio:'inherit'});
 if(result.status!==0)process.exit(result.status||1);
}
run(['node_modules/typescript/bin/tsc','-p','apps/api/tsconfig.json']);
run(['node_modules/next/dist/bin/next','build','--webpack'],path.join(root,'apps/web'),{EXPORT_STATIC:'1',NEXT_PUBLIC_STATIC_PREVIEW:'0',NEXT_PUBLIC_API_URL:''});
