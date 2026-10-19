import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import mongoose, { Schema, Connection } from 'mongoose';
@Injectable()
export class Store implements OnModuleInit, OnModuleDestroy {
  connection!: Connection;
  users!: mongoose.Model<any, unknown, unknown, unknown>;
  sessions!: mongoose.Model<any, unknown, unknown, unknown>;
  projects!: mongoose.Model<any, unknown, unknown, unknown>;
  async onModuleInit() {
    if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI is required');
    this.connection = await mongoose.createConnection(process.env.MONGODB_URI, {serverSelectionTimeoutMS:10000}).asPromise();
    this.users = this.connection.model<any>('User', new Schema({username:{type:String,required:true,unique:true},name:{type:String,required:true},passwordHash:{type:String,required:true,select:false},role:{type:String,enum:['user','admin'],default:'user',required:true}},{timestamps:true}));
    this.sessions = this.connection.model<any>('Session', new Schema({tokenHash:{type:String,unique:true,required:true},userId:{type:Schema.Types.ObjectId,required:true},expiresAt:{type:Date,required:true,index:{expires:0}}},{timestamps:true}));
    this.projects = this.connection.model<any>('Project', new Schema({ownerId:{type:Schema.Types.ObjectId,required:true,index:true},title:{type:String,required:true},description:{type:String,default:''},track:{type:String,enum:['frontend','backend','fullstack'],required:true},status:{type:String,enum:['learning','building','completed'],default:'learning'}},{timestamps:true}));
    await Promise.all([this.users.init(),this.sessions.init(),this.projects.init()]);
  }
  async onModuleDestroy(){await this.connection?.close();}
}
