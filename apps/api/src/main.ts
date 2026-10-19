import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { Module, Controller, Get, Post, Patch, Delete, Body, Req, Res, Param, Query, Injectable, CanActivate, ExecutionContext, UnauthorizedException, ForbiddenException, ConflictException, BadRequestException, NotFoundException, ValidationPipe, UseGuards } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard, Throttle } from '@nestjs/throttler';
import { IsString, Length, Matches, IsIn } from 'class-validator';
import { randomBytes, scrypt, timingSafeEqual, createHash } from 'node:crypto';
import { promisify } from 'node:util';
import { Types } from 'mongoose';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { Request, Response } from 'express';
import { Store } from './store';
const derive = promisify(scrypt);
const hash = (s:string)=>createHash('sha256').update(s).digest('hex');
const cookieName = 'kopo_session';
const publicUser = (u:any)=>({id:String(u._id),username:u.username,name:u.name,role:u.role==='admin'?'admin':'user'});
class LoginDto {
 @IsString() @Matches(/^[a-z0-9_]{4,32}$/) username!:string;
 @IsString() @Length(8,128) password!:string;
}
class RegisterDto {
 @IsString() @Matches(/^[a-z0-9_]{4,32}$/) username!:string;
 @IsString() @Length(12,128) password!:string;
 @IsString() @Length(2,40) name!:string;
}
class ProjectDto {
 @IsString() @Length(1,80) @Matches(/\S/) title!:string;
 @IsString() @Length(0,1000) description!:string;
 @IsIn(['frontend','backend','fullstack']) track!:string;
}
class StatusDto { @IsIn(['learning','building','completed']) status!:string; }
@Injectable()
class SessionGuard implements CanActivate {
 constructor(private store:Store){}
 async canActivate(ctx:ExecutionContext){
  const req=ctx.switchToHttp().getRequest();const token=req.cookies?.[cookieName];
  if(typeof token!=='string'||!/^[a-f0-9]{64}$/.test(token)) throw new UnauthorizedException('로그인이 필요합니다.');
  const session=await this.store.sessions.findOne({tokenHash:hash(token),expiresAt:{$gt:new Date()}}).lean();
  if(!session)throw new UnauthorizedException('세션이 만료되었습니다. 다시 로그인해주세요.');
  const user=await this.store.users.findById(session.userId).lean();
  if(!user)throw new UnauthorizedException();req.user=user;return true;
 }
}
@Injectable()
class AdminGuard implements CanActivate {
 canActivate(ctx:ExecutionContext){
  if(ctx.switchToHttp().getRequest().user?.role!=='admin')throw new ForbiddenException('관리자만 접근할 수 있습니다.');
  return true;
 }
}
@Controller('api')
class ApiController {
 constructor(private store:Store){}
 @Get('health') health(){return {status:'ok',database:this.store.connection.readyState===1?'connected':'disconnected'};}
 async issueSession(user:any,req:Request,res:Response){
  const previous=req.cookies?.[cookieName];if(typeof previous==='string') await this.store.sessions.deleteOne({tokenHash:hash(previous)});
  const token=randomBytes(32).toString('hex');const maxAge=8*60*60*1000;
  await this.store.sessions.create({tokenHash:hash(token),userId:user._id,expiresAt:new Date(Date.now()+maxAge)});
  res.cookie(cookieName,token,{httpOnly:true,secure:process.env.NODE_ENV==='production',sameSite:'strict',path:'/api',maxAge});
  res.setHeader('Cache-Control','no-store');return {user:publicUser(user)};
 }
 @Post('auth/register') @Throttle({default:{limit:5,ttl:60000}})
 async register(@Body() dto:RegisterDto,@Req() req:Request,@Res({passthrough:true}) res:Response){
  if(!dto.name.trim())throw new BadRequestException('이름을 입력해주세요.');
  const salt=randomBytes(16).toString('hex');const key=await derive(dto.password,salt,64) as Buffer;
  try {const user=await this.store.users.create({username:dto.username,name:dto.name.trim(),passwordHash:salt+':'+key.toString('hex')});return await this.issueSession(user,req,res);}
  catch(e:any){if(e.code===11000)throw new ConflictException('이미 사용 중인 아이디입니다.');throw e;}
 }
 @Post('auth/login') @Throttle({default:{limit:8,ttl:60000}})
 async login(@Body() dto:LoginDto,@Req() req:Request,@Res({passthrough:true}) res:Response){
  const user=await this.store.users.findOne({username:dto.username}).select('+passwordHash');
  const [salt,stored]=(user?.passwordHash || '00000000000000000000000000000000:'+ '0'.repeat(128)).split(':');
  const key=await derive(dto.password,salt,64) as Buffer;
  if(!user||!timingSafeEqual(key,Buffer.from(stored,'hex')))throw new UnauthorizedException('아이디 또는 비밀번호를 확인해주세요.');
  return this.issueSession(user,req,res);
 }
 @Post('auth/logout') async logout(@Req() req:Request,@Res({passthrough:true}) res:Response){
  const token=req.cookies?.[cookieName];if(typeof token==='string')await this.store.sessions.deleteOne({tokenHash:hash(token)});
  res.clearCookie(cookieName,{httpOnly:true,secure:process.env.NODE_ENV==='production',sameSite:'strict',path:'/api'});return {ok:true};
 }
 @Get('auth/me') @UseGuards(SessionGuard) me(@Req() req:any,@Res({passthrough:true}) res:Response){res.setHeader('Cache-Control','no-store');return {user:publicUser(req.user)};}
 @Get('admin/users') @UseGuards(SessionGuard,AdminGuard)
 async adminUsers(@Query('page') requestedPage?:string){
  const page=requestedPage===undefined?1:Number(requestedPage);
  if((requestedPage!==undefined&&!/^[1-9]\d*$/.test(requestedPage))||!Number.isSafeInteger(page)||page>100000)throw new BadRequestException('페이지 번호를 확인해주세요.');
  const pageSize=20;
  const [totalUsers,totalProjects,users]=await Promise.all([
   this.store.users.countDocuments(),this.store.projects.countDocuments(),
   this.store.users.find().select('_id username name role createdAt').sort({createdAt:-1,_id:-1}).skip((page-1)*pageSize).limit(pageSize).lean()
  ]);
  return {users:users.map(u=>({...publicUser(u),createdAt:u.createdAt})),page,pageSize,totalUsers,totalProjects};
 }
 @Get('projects') @UseGuards(SessionGuard) async list(@Req() req:any){return {projects:await this.store.projects.find({ownerId:req.user._id}).select('-ownerId -__v').sort({createdAt:-1}).lean()};}
 @Post('projects') @UseGuards(SessionGuard) async create(@Body() dto:ProjectDto,@Req() req:any){return {project:await this.store.projects.create({...dto,title:dto.title.trim(),ownerId:req.user._id})};}
 @Patch('projects/:id') @UseGuards(SessionGuard) async update(@Param('id') id:string,@Body() dto:StatusDto,@Req() req:any){
  if(!Types.ObjectId.isValid(id))throw new BadRequestException('잘못된 프로젝트입니다.');
  const project=await this.store.projects.findOneAndUpdate({_id:id,ownerId:req.user._id},{$set:{status:dto.status}},{new:true}).select('-ownerId -__v');
  if(!project)throw new NotFoundException();return {project};
 }
 @Delete('projects/:id') @UseGuards(SessionGuard) async remove(@Param('id') id:string,@Req() req:any){
  if(!Types.ObjectId.isValid(id))throw new BadRequestException();
  const result=await this.store.projects.deleteOne({_id:id,ownerId:req.user._id});if(!result.deletedCount)throw new NotFoundException();return {ok:true};
 }
}
@Module({imports:[ThrottlerModule.forRoot([{ttl:60000,limit:120}])],controllers:[ApiController],providers:[Store,SessionGuard,AdminGuard,{provide:APP_GUARD,useClass:ThrottlerGuard}]})
class AppModule {}
export async function createApiApp(){
 const origins=(process.env.FRONTEND_ORIGINS||'http://127.0.0.1:3100,http://localhost:3100').split(',');
 if(process.env.NODE_ENV==='production'&&(!process.env.FRONTEND_ORIGINS||origins.some(o=>!o.startsWith('https://'))))throw new Error('Production FRONTEND_ORIGINS must contain explicit HTTPS origins');
 const app=await NestFactory.create(AppModule,{abortOnError:false});
 app.use(helmet());app.use(cookieParser());
 app.use((req:Request,res:Response,next:()=>void)=>{res.setHeader('Cache-Control','no-store');if(!['GET','HEAD','OPTIONS'].includes(req.method)&&(!req.headers.origin||!origins.includes(req.headers.origin))){res.status(403).json({message:'허용되지 않은 요청입니다.'});return;}next();});
 app.enableCors({origin:origins,credentials:true});
 app.useGlobalPipes(new ValidationPipe({whitelist:true,forbidNonWhitelisted:true,transform:true}));
 return app;
}
async function bootstrap(){
 const app=await createApiApp();
 app.enableShutdownHooks();await app.listen(Number(process.env.PORT||4100),process.env.HOST||'127.0.0.1');
}
if(require.main===module)bootstrap().catch(()=>{console.error('API startup failed. Check database and origin configuration.');process.exit(1);});
