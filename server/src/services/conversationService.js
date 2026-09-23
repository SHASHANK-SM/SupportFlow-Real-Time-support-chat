import Conversation from '../models/Conversation.js'; import Message from '../models/Message.js';
const fail=(message,status=400)=>{const e=new Error(message);e.status=status;throw e;};
export async function accessConversation(id,user,{waiting=true}={}){const c=await Conversation.findById(id).populate('customerId','name email avatar isOnline lastSeen').populate('agentId','name email avatar isOnline lastSeen');if(!c)fail('Conversation not found',404);const own=String(c.customerId._id)===String(user._id)||c.agentId&&String(c.agentId._id)===String(user._id);if(!own&&!(waiting&&user.role==='agent'&&c.status==='waiting'))fail('Not authorized',403);return c;}
export async function createConversation(user,{priority='normal'}={}){const active=await Conversation.findOne({customerId:user._id,status:{$in:['waiting','active']}});if(active) return accessConversation(active._id,user);const User=(await import('../models/User.js')).default;const agent=await User.findOne({role:'agent',availability:'online'}).sort({updatedAt:1});const created=await Conversation.create({customerId:user._id,agentId:agent?._id,priority});return accessConversation(created._id,user);}
export async function listConversations(user,{status,unread,search}){let q=user.role==='customer'?{customerId:user._id}:{$or:[{agentId:user._id},{status:'waiting'}]};if(status)q.status=status;if(unread==='true')q.unreadCount={$gt:0};let rows=await Conversation.find(q).populate('customerId','name email avatar isOnline lastSeen').populate('agentId','name email avatar isOnline lastSeen').sort({updatedAt:-1});if(search){const term=search.toLowerCase();rows=rows.filter(c=>[c.customerId?.name,c.customerId?.email,c.lastMessage].some(x=>x?.toLowerCase().includes(term)));}return rows;}
export async function acceptConversation(id,user){const c=await Conversation.findOneAndUpdate({_id:id,status:'waiting',$or:[{agentId:null},{agentId:user._id}]},{agentId:user._id,status:'active'},{new:true}).populate('customerId','name email avatar isOnline lastSeen').populate('agentId','name email avatar isOnline lastSeen');if(!c)fail('Conversation is no longer available to accept',409);return c;}
export async function closeConversation(id,user){const c=await accessConversation(id,user);const isCustomer=String(c.customerId?._id)===String(user._id);const isAgent=user.role==='agent'&&String(c.agentId?._id)===String(user._id);if(!isCustomer&&!isAgent)fail('Only a conversation participant can close this chat',403);c.status='closed';c.closedAt=new Date();await c.save();return c;}
export async function markRead(id,user){
  let c=await accessConversation(id,user);
  let accepted=false;

  // Opening a waiting request is how an agent takes ownership of it.  This
  // prevents the composer from remaining disabled after the agent has viewed
  // the customer's message, and the conditional update in acceptConversation
  // keeps two agents from claiming the same request.
  if(user.role==='agent'&&c.status==='waiting'){
    c=await acceptConversation(id,user);
    accepted=true;
  }

  const result=await Message.updateMany({conversationId:id,senderId:{$ne:user._id},isRead:false},{$set:{isRead:true,readAt:new Date()}});
  if(user.role==='agent'){
    c.unreadCount=0;
    await c.save();
  }
  return {conversation:c,modified:result.modifiedCount,accepted};
}
