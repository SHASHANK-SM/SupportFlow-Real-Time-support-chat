import {useEffect,useRef,useState} from 'react';
import {Link,useNavigate,useParams} from 'react-router-dom';import {useDispatch,useSelector} from 'react-redux';
import {Archive,ArrowLeft,Bell,ChevronDown,FileText,Headphones,LogOut,Paperclip,Send,Settings,Smile,SlidersHorizontal,UserRound,WifiOff,X,Check,CheckCheck} from 'lucide-react';
import api from '../lib/api.js';import {connectSocket,disconnectSocket,getSocket} from '../lib/socket.js';import {clearAuth} from '../app/store.js';
import {createAttachment,isImageAttachment} from '../lib/attachments.js';
import {personEmoji,supportAgentLabel} from '../lib/avatar.js';
const time=t=>new Intl.DateTimeFormat(undefined,{hour:'numeric',minute:'2-digit'}).format(new Date(t));
const date=t=>new Intl.DateTimeFormat(undefined,{month:'short',day:'numeric'}).format(new Date(t));
const emojis=['🙂','😊','👍','🎉','❤️','🙏','👋','✨'];

function CustomerMessage({message,user,time,date,messages,index,getReadStatus,getReadIcon}){
  const isOwn=String(message.senderId?._id||message.senderId)===String(user._id);
  const showDate=!index||date(messages[index-1].createdAt)!==date(message.createdAt);
  return(
    <div key={message._id} className="message-wrap">
      {showDate&&<div className="date-separator">{date(message.createdAt)}</div>}
      <div className={'customer-message '+(isOwn?'outgoing':'incoming')+' '+(message.attachment?'has-attachment':'')}>
        <div className="message-bubble">
          {message.attachment&&(isImageAttachment(message.attachment)?<a href={message.attachment.url} target="_blank" rel="noopener noreferrer" className="attachment"><img src={message.attachment.url} alt={message.attachment.name}/></a>:<a href={message.attachment.url} download={message.attachment.name} className="file-attachment"><FileText size={20}/><span>{message.attachment.name}</span></a>)}
          {message.content}
        </div>
        <div className="message-meta">
          <time>{time(message.createdAt)}</time>
          {isOwn&&<span className={getReadStatus(message)}>{getReadIcon(message)}</span>}
        </div>
      </div>
    </div>
  );
}

export default function CustomerChat(){
  const {conversationId}=useParams(),user=useSelector(s=>s.auth.user),go=useNavigate(),dispatch=useDispatch();
  const [chat,setChat]=useState(null),[messages,setMessages]=useState([]),[draft,setDraft]=useState(''),[attachment,setAttachment]=useState(null),[typing,setTyping]=useState(false),[connected,setConnected]=useState(false),[loading,setLoading]=useState(true),[sending,setSending]=useState(false),[error,setError]=useState(''),[notice,setNotice]=useState(''),[showEmoji,setShowEmoji]=useState(false),[menu,setMenu]=useState(false);
  const bottom=useRef(),file=useRef(),typingTimer=useRef(),msgEnd=useRef();
  const load=async()=>{setLoading(true);try{const [c,m]=await Promise.all([api.get(`/conversations/${conversationId}`),api.get(`/conversations/${conversationId}/messages`)]);setChat(c.data);setMessages(m.data);await api.patch(`/conversations/${conversationId}/read`)}catch(e){setError(e.message)}finally{setLoading(false)}};useEffect(()=>{load()},[conversationId]);
  useEffect(()=>{const socket=connectSocket();const join=()=>{setConnected(true);socket.emit('join_conversation',{conversationId})},lost=()=>setConnected(false),newMessage=({conversationId:id,message})=>id===conversationId&&setMessages(x=>x.some(m=>m._id===message._id)?x:[...x,message]),accepted=c=>c._id===conversationId&&setChat(c),closed=c=>c._id===conversationId&&setChat(c),start=({conversationId:id})=>id===conversationId&&setTyping(true),stop=({conversationId:id})=>id===conversationId&&setTyping(false),read=({conversationId:id})=>id===conversationId&&setMessages(x=>x.map(m=>String(m.senderId?._id||m.senderId)===String(user._id)?{...m,isRead:true}:m));socket.on('connect',join);socket.on('disconnect',lost);socket.on('new_message',newMessage);socket.on('conversation_accepted',accepted);socket.on('conversation_closed',closed);socket.on('typing_start',start);socket.on('typing_stop',stop);socket.on('message_read',read);if(socket.connected)join();return()=>{socket.emit('leave_conversation',{conversationId});socket.off('connect',join);socket.off('disconnect',lost);socket.off('new_message',newMessage);socket.off('conversation_accepted',accepted);socket.off('conversation_closed',closed);socket.off('typing_start',start);socket.off('typing_stop',stop);socket.off('message_read',read)}},[conversationId,user._id]);
  useEffect(()=>{bottom.current?.scrollIntoView({behavior:'smooth'})},[messages,typing]);
  useEffect(()=>{if(!notice)return;const timer=setTimeout(()=>setNotice(''),3000);return()=>clearTimeout(timer)},[notice]);
  const send=async()=>{const content=draft.trim(),pendingAttachment=attachment;if((!content&&!pendingAttachment)||chat?.status==='closed'||sending)return;setSending(true);setError('');try{getSocket()?.emit('typing_stop',{conversationId});const response=await api.post(`/conversations/${conversationId}/messages`,{content,attachment:pendingAttachment});const message=response.data;setMessages(items=>items.some(m=>m._id===message._id)?items:[...items,message]);setDraft('');setAttachment(null);setShowEmoji(false);}catch(e){setError(e.message||'Message could not be sent. Please try again.');setNotice(e.message||'Message could not be sent. Please try again.');}finally{setSending(false)}};
  const handleKeyDown=e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();send()}};
  const change=e=>{setDraft(e.target.value);const socket=getSocket();if(socket?.connected){socket.emit('typing_start',{conversationId});clearTimeout(typingTimer.current);typingTimer.current=setTimeout(()=>socket.emit('typing_stop',{conversationId}),850)}};
  const attach=e=>{const f=e.target.files?.[0];if(!f)return;if(!/^image\/(png|jpeg|webp)$/.test(f.type)||f.size>500000)return setError('Choose a PNG, JPG, or WebP image under 500 KB.');const reader=new FileReader();reader.onload=()=>setAttachment({name:f.name,url:reader.result,type:f.type,size:f.size});reader.readAsDataURL(f)};
  const close=async()=>{if(!confirm('End this support conversation?'))return;try{const r=await api.patch(`/conversations/${conversationId}/close`);setChat(r.data)}catch(e){setError(e.message)}};
  const logout=()=>{disconnectSocket();dispatch(clearAuth());go('/login',{replace:true})};
  if(loading)return <div className="chat-loading"><Headphones/><p>Loading your conversation…</p></div>;
  if(error&&!chat)return <div className="chat-loading"><p>{error}</p><Link to="/customer/dashboard">Back to dashboard</Link></div>;
  const agent=chat?.agentId;
  const getReadStatus=m=>{if(String(m.senderId?._id||m.senderId)===String(user._id)){return m.isRead?'read':'sent'}return ''};
  const getReadIcon=m=>{const s=getReadStatus(m);return s==='read'?<CheckCheck size={14}/>:s==='sent'?<Check size={14}/>:null};
  return(
    <div className="customer-chat-page">
      <header className="customer-chat-header">
        <button onClick={()=>go('/customer/conversations')}><ArrowLeft/> <span>Conversations</span></button>
        <div className="chat-person">
          <span className="avatar">{personEmoji(agent)}</span>
          <span><b>{supportAgentLabel(agent)}</b><small><i className={agent?.isOnline?'online':''}/>{agent?.isOnline?'Online':agent?.lastSeen?'Last seen recently':'Waiting for an agent'}</small></span>
        </div>
        <div className={'chat-status '+chat.status}>{chat.status==='waiting'?'Waiting for a support agent…':chat.status==='active'?'Active conversation':'Closed'}</div>
        {chat.status!=='closed'&&<button className="end-chat" onClick={close}><Archive size={16}/><span>End chat</span></button>}
        <div className="profile-menu-wrap">
          <button className="profile-trigger" onClick={()=>setMenu(!menu)}><span className="avatar">{personEmoji(user)}</span><ChevronDown size={15}/></button>
          {menu&&<div className="profile-dropdown"><button onClick={()=>go('/customer/profile')}><UserRound/>Profile</button><button onClick={()=>go('/customer/profile/edit')}><SlidersHorizontal/>Edit profile</button><button onClick={()=>go('/customer/notifications')}><Bell/>Notifications</button><button onClick={()=>go('/customer/settings')}><Settings/>Settings</button><hr/><button className="logout-item" onClick={logout}><LogOut/>Logout</button></div>}
        </div>
      </header>
      <main className="customer-messages">
        {chat.status==='waiting'&&<div className="waiting-banner"><span/> We've received your request. Waiting for a support agent…</div>}
        {!messages.length&&<div className="chat-empty"><Headphones size={32}/><h2>Start the conversation</h2><p>Tell us what you need help with. We'll be with you shortly.</p></div>}
        {messages.map((m,i)=><CustomerMessage key={m._id} message={m} user={user} time={time} date={date} messages={messages} index={i} getReadStatus={getReadStatus} getReadIcon={getReadIcon}/>)}
        {typing&&<div className="typing-indicator customer-typing-indicator" role="status" aria-label="The support agent is typing"><i/><i/><i/><span>Support agent is typing</span></div>}
        <div ref={msgEnd}/>
      </main>
      <div className="composer">
        <div className="composer-input-wrap">
          <button className="attach" onClick={()=>file.current?.click()} title="Attach file"><Paperclip size={20}/></button>
          <input type="file" ref={file} style={{display:'none'}} accept="image/png,image/jpeg,image/webp,image/gif,.pdf,.doc,.docx,.xls,.xlsx,.txt" onChange={async e=>{try{setAttachment(await createAttachment(e.target.files?.[0]))}catch(err){setError(err.message)}finally{e.target.value=''}}}/>
          <button className="emoji-btn" onClick={()=>setShowEmoji(!showEmoji)} title="Emoji"><Smile size={20}/></button>
          <textarea value={draft} onChange={change} onKeyDown={handleKeyDown} placeholder={chat?.status==='closed'?'Conversation is closed':chat?.status==='waiting'?'Describe your issue while we connect you…':'Type a message…'} disabled={chat?.status==='closed'} rows={1} style={{minHeight:44,maxHeight:120}}></textarea>
        </div>
        {attachment&&<div className="attachment-preview"><img src={attachment.url} alt={attachment.name}/><span>{attachment.name}</span><button onClick={()=>setAttachment(null)}>✕</button></div>}
        {showEmoji&&<div className="emoji-picker">{emojis.map(e=><button key={e} onClick={()=>setDraft(draft+e)}>{e}</button>)}</div>}
        <div className="composer-actions"><button className="primary" onClick={send} disabled={sending||chat?.status==='closed'||(!draft.trim()&&!attachment)} aria-label="Send message">{sending?<span className="send-label">Sending…</span>:<><Send size={20}/><span className="send-label">Send</span></>}</button></div>
      </div>
      {notice&&<div className="toast success" role="alert">{notice}<button onClick={()=>setNotice('')}>×</button></div>}
    </div>
  );
}
