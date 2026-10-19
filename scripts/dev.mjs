import {spawn} from 'node:child_process';
import {mkdir} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {MongoMemoryServer} from 'mongodb-memory-server';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const children=[];let mongo;let stopping=false;
const run=(args,cwd=root,extra={})=>{const child=spawn(process.execPath,args,{cwd,env:{...process.env,...extra},stdio:'inherit',windowsHide:true});children.push(child);return child;};
async function stop(){if(stopping)return;stopping=true;for(const child of children)child.kill();if(mongo)await mongo.stop({doCleanup:false});process.exit(0);}
process.on('SIGINT',stop);process.on('SIGTERM',stop);
try{
 try{process.loadEnvFile(path.join(root,'.env'));}catch(e){if(e.code!=='ENOENT')throw new Error('Could not load the local .env configuration.');}
 const compile=run(['node_modules/typescript/bin/tsc','-p','apps/api/tsconfig.json']);
 await new Promise((resolve,reject)=>compile.on('exit',code=>code===0?resolve():reject(new Error('API build failed'))));
 let uri=process.env.MONGODB_URI;
 if(!uri){await mkdir(path.join(root,'.local','db'),{recursive:true});mongo=await MongoMemoryServer.create({instance:{dbPath:path.join(root,'.local','db'),dbName:'kopo_campus',storageEngine:'wiredTiger',port:37017},binary:{version:'7.0.24',downloadDir:path.join(root,'.local','mongodb-binaries')}});uri=mongo.getUri('kopo_campus');}
 const api=run(['dist/main.js'],path.join(root,'apps/api'),{MONGODB_URI:uri,PORT:'4100',HOST:'127.0.0.1',NODE_ENV:'development',FRONTEND_ORIGINS:'http://127.0.0.1:3100,http://localhost:3100'});
 const web=run(['node_modules/next/dist/bin/next','dev','--hostname','127.0.0.1','--port','3100'],path.join(root,'apps/web'),{NODE_ENV:'development'});
 api.on('exit',code=>{if(!stopping&&code!==0)stop()});web.on('exit',()=>{if(!stopping)stop()});
 console.log(`KOPO NEXT → http://127.0.0.1:3100 · ${mongo?'local MongoDB: kopo_campus':'configured MongoDB connection'}`);
}catch(e){console.error(e.message);await stop();}
