import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {MongoMemoryServer} from 'mongodb-memory-server';
const require=createRequire(new URL('../apps/api/package.json',import.meta.url));
const mongoose=require('mongoose');
const mongo=await MongoMemoryServer.create();
process.env.MONGODB_URI=mongo.getUri('netlify_integration');
process.env.FRONTEND_ORIGINS='https://smartkopo.netlify.app';
const {handler}=require('./netlify/functions/api.js');
const invoke=(path,method='GET',body,extraHeaders={})=>handler({path,httpMethod:method,headers:{host:'smartkopo.netlify.app',origin:process.env.FRONTEND_ORIGINS,'content-type':'application/json',...extraHeaders},queryStringParameters:{},body:body?JSON.stringify(body):null,isBase64Encoded:false,requestContext:{identity:{sourceIp:'127.0.0.1'}}},{});
try{
 let result=await invoke('/api/health');assert.equal(result.statusCode,200);assert.equal(JSON.parse(result.body).database,'connected');
 result=await invoke('/.netlify/functions/api/health');assert.equal(result.statusCode,200);
 assert.equal((await invoke('/api/admin/users')).statusCode,401);
 const user={username:'netlify_test',password:'NetlifyTestPassword_2026',name:'배포 테스트'};
 result=await invoke('/api/auth/register','POST',user);assert.equal(result.statusCode,201);
 const cookies=result.multiValueHeaders?.['set-cookie']||result.multiValueHeaders?.['Set-Cookie'];
 const cookie=cookies?.[0]||result.headers?.['set-cookie']||result.headers?.['Set-Cookie'];
 assert.ok(cookie);assert.match(cookie,/Secure/);assert.match(cookie,/HttpOnly/);assert.match(cookie,/SameSite=Strict/);
 const session=cookie.split(';')[0];
 result=await invoke('/api/auth/me','GET',null,{cookie:session});assert.equal(result.statusCode,200);assert.equal(JSON.parse(result.body).user.username,user.username);
 assert.equal((await invoke('/api/admin/users','GET',null,{cookie:session})).statusCode,403);
 assert.equal((await invoke('/api/projects','POST',{title:'CSRF',description:'',track:'backend'},{cookie:session,origin:'https://untrusted.example'})).statusCode,403);
 assert.equal((await invoke('/api/auth/logout','POST',null,{cookie:session})).statusCode,201);
 assert.equal((await invoke('/api/auth/me','GET',null,{cookie:session})).statusCode,401);
 console.log('NETLIFY_FUNCTION_AUTH_COOKIE_ROUTE_AND_GUARD_CHECKS_PASSED');
}finally{await mongoose.disconnect();await mongo.stop();}
