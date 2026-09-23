import * as svc from '../services/conversationService.js';
import {getMessages} from '../services/messageService.js';import {ok} from '../utils/apiResponse.js';import {asyncHandler} from '../utils/asyncHandler.js';
export const create=asyncHandler(async(req,res)=>{const conversation=await svc.createConversation(req.user,req.body);req.app.get('io')?.emit('conversation_created',conversation);return ok(res,conversation,'Conversation created',201)});
export const list=asyncHandler(async(req,res)=>ok(res,await svc.listConversations(req.user,req.query)));
export const get=asyncHandler(async(req,res)=>ok(res,await svc.accessConversation(req.params.id,req.user)));
export const accept=asyncHandler(async(req,res)=>{const conversation=await svc.acceptConversation(req.params.id,req.user);req.app.get('io')?.emit('conversation_accepted',conversation);return ok(res,conversation,'Conversation accepted')});
export const close=asyncHandler(async(req,res)=>{const conversation=await svc.closeConversation(req.params.id,req.user);req.app.get('io')?.emit('conversation_closed',conversation);return ok(res,conversation,'Conversation closed')});
export const read=asyncHandler(async(req,res)=>{const result=await svc.markRead(req.params.id,req.user);if(result.accepted)req.app.get('io')?.emit('conversation_accepted',result.conversation);req.app.get('io')?.to(`conversation:${req.params.id}`).emit('message_read',{conversationId:req.params.id,userId:String(req.user._id)});return ok(res,result,'Messages marked as read')});
export const messages=asyncHandler(async(req,res)=>ok(res,await getMessages(req.params.id,req.user)));
