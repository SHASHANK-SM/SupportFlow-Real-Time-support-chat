import {useEffect,useMemo,useRef,useState,useCallback} from 'react';
import {Link,useNavigate} from 'react-router-dom';
import {useDispatch,useSelector} from 'react-redux';
import {Bell,ChevronDown,ChevronRight,Clock3,Headphones,Inbox,LifeBuoy,LogOut,Mail,MessageCircle,Plus,Settings,SlidersHorizontal,UserRound,Users,X,UserPlus,Edit2,Trash2,ToggleLeft,ToggleRight,Loader2,CheckCircle,CheckCircle2,AlertCircle,Eye,EyeOff,ShieldCheck} from 'lucide-react';
import api from '../lib/api.js';import {clearAuth,setAuth,setSelected,upsertChat} from '../app/store.js';import {disconnectSocket} from '../lib/socket.js';import {personEmoji,supportAgentLabel} from '../lib/avatar.js';
const NAV={customer:[['Dashboard','/customer/dashboard'],['Conversations','/customer/conversations'],['Notifications','/customer/notifications']],agent:[['Dashboard','/agent/dashboard'],['Waiting queue','/agent/waiting'],['Active chats','/agent/active'],['Resolved','/agent/resolved'],['Profile','/agent/profile'],['Settings','/agent/settings'],['Notifications','/agent/notifications']],admin:[['Overview','/admin/dashboard'],['Agent management','/admin/agents'],['Settings','/admin/settings']]};
const label=p=>p==='edit-profile'?'Edit profile':p.replace(/-/g,' ');
export default function RoleDashboard({page}){const {user,token}=useSelector(s=>s.auth),dispatch=useDispatch(),go=useNavigate();const [conversations,setConversations]=useState([]),[loading,setLoading]=useState(true),[notice,setNotice]=useState(''),[menu,setMenu]=useState(false);const role=user.role;const isAdmin=role==='admin';const isAgent=role==='agent';
  const load=async()=>{if(isAdmin){setLoading(false);return}setLoading(true);try{let status;if(page==='waiting')status='waiting';else if(page==='active')status='active';else if(page==='resolved')status='closed';const r=await api.get('/conversations',{params:{status}});setConversations(r.data)}catch(e){setNotice(e.message)}finally{setLoading(false)}};useEffect(()=>{load()},[page,role]);
 const start=async()=>{try{const r=await api.post('/conversations',{priority:'normal'});dispatch(upsertChat(r.data));dispatch(setSelected(r.data));go(`/customer/chat/${r.data._id}`)}catch(e){setNotice(e.message)}};
 const open=c=>{dispatch(setSelected(c));go(role==='customer'?`/customer/chat/${c._id}`:`/chat/${c._id}`)}; const logout=()=>{disconnectSocket();dispatch(clearAuth());go('/login',{replace:true})}; const stats=useMemo(()=>({open:conversations.filter(c=>c.status!=='closed').length,active:conversations.filter(c=>c.status==='active').length,unread:conversations.reduce((n,c)=>n+(c.unreadCount||0),0)}),[conversations]);
 if(isAgent){const agentNav=NAV.agent;return <div className="customer-app"><header className="customer-top"><Link className="customer-logo" to="/agent/dashboard"><span className="brand-mark"><Headphones size={19}/></span>SupportFlow</Link><nav>{agentNav.map(([n,p])=><Link key={p} className={p.endsWith(page)?'current':''} to={p}>{n}</Link>)}</nav><div className="profile-menu-wrap"><button className="profile-trigger" onClick={()=>setMenu(!menu)} aria-expanded={menu}><span className="avatar">{personEmoji(user)}</span><span className="profile-name">{user.name.split(' ')[0]}</span><ChevronDown size={16}/></button>{menu&&<AgentProfileMenu go={go} logout={logout}/>}</div></header><main className="customer-main">{page==='profile'&&<AgentProfile user={user} go={go}/>}{page==='edit-profile'&&<EditProfile user={user} token={token} dispatch={dispatch} go={go}/>}{page==='settings'&&<SettingsPage/>}{page==='notifications'&&<Notifications conversations={conversations} open={open} loading={loading}/>}</main>{notice&&<Toast message={notice} clear={()=>setNotice('')}/>}</div>}if(isAdmin){const adminNav=NAV.admin;return <div className="customer-app"><header className="customer-top"><Link className="customer-logo" to="/admin/dashboard"><span className="brand-mark"><Headphones size={19}/></span>SupportFlow</Link><nav>{adminNav.map(([n,p])=><Link key={p} className={p.endsWith(page)?'current':''} to={p}>{n}</Link>)}</nav><div className="profile-menu-wrap"><button className="profile-trigger" onClick={()=>setMenu(!menu)} aria-expanded={menu}><span className="avatar">{personEmoji(user)}</span><span className="profile-name">{user.name.split(' ')[0]}</span><ChevronDown size={16}/></button>{menu&&<AdminProfileMenu go={go} logout={logout}/>}</div></header><main className="customer-main">{page==='dashboard'&&<AdminDashboard/>}{page==='agents'&&<AgentManagement/>}{page==='settings'&&<SettingsPage/>}</main>{notice&&<Toast message={notice} clear={()=>setNotice('')}/>}</div>}
 return <div className="customer-app"><header className="customer-top"><Link className="customer-logo" to="/customer/dashboard"><span className="brand-mark"><Headphones size={19}/></span>SupportFlow</Link><nav>{NAV.customer.map(([n,p])=><Link key={p} className={p.endsWith(page)?'current':''} to={p}>{n}{n==='Notifications'&&stats.unread>0&&<b>{stats.unread}</b>}</Link>)}</nav><div className="profile-menu-wrap"><button className="profile-trigger" onClick={()=>setMenu(!menu)} aria-expanded={menu}><span className="avatar">{personEmoji(user)}</span><span className="profile-name">{user.name.split(' ')[0]}</span><ChevronDown size={16}/></button>{menu&&<ProfileMenu go={go} logout={logout}/>}</div></header><main className="customer-main">
 {page==='dashboard'&&<CustomerDashboard user={user} stats={stats} conversations={conversations} loading={loading} start={start} open={open}/>} {page==='new-chat'&&<NewChat start={start}/>} {page==='conversations'&&<PagePanel title="Your conversations" description="Every support request, in one place."><ConversationList conversations={conversations} loading={loading} open={open} customer/></PagePanel>} {page==='notifications'&&<Notifications conversations={conversations} open={open} loading={loading}/>} {page==='profile'&&<Profile user={user} go={go}/>} {page==='edit-profile'&&<EditProfile user={user} token={token} dispatch={dispatch} go={go}/>} {page==='settings'&&<SettingsPage/>}
 </main>{notice&&<Toast message={notice} clear={()=>setNotice('')}/>}</div>}
function ProfileMenu({go,logout}){return <div className="profile-dropdown"><button onClick={()=>go('/customer/profile')}><UserRound/>Profile</button><button onClick={()=>go('/customer/profile/edit')}><SlidersHorizontal/>Edit profile</button><button onClick={()=>go('/customer/notifications')}><Bell/>Notifications</button><button onClick={()=>go('/customer/settings')}><Settings/>Settings</button><hr/><button className="logout-item" onClick={logout}><LogOut/>Logout</button></div>}
function CustomerDashboard({user,stats,conversations,loading,start,open}){const current=conversations.find(c=>c.status!=='closed');return <><section className="customer-hero premium-hero"><div><span className="eyebrow">SUPPORT, ON YOUR TERMS</span><h1>Hi {user.name.split(' ')[0]}, how can we help?</h1><p>Start a private conversation with our support team or pick up exactly where you left off.</p><div className="hero-trust"><span><i/> Support team online</span><span><Clock3 size={14}/> Typical reply under 5 min</span></div></div><button className="start-chat" onClick={start}><Plus/>Start new chat</button></section><section className="customer-dashboard-grid"><div className="dashboard-primary">{current?<ActiveCard conversation={current} open={open}/>:<EmptyActive start={start}/>}<PagePanel title="Recent conversations" action={<Link to="/customer/conversations">View all <ChevronRight size={15}/></Link>}><ConversationList conversations={conversations.slice(0,4)} loading={loading} open={open} customer/></PagePanel></div><aside className="dashboard-aside"><div className="support-status"><span className="status-icon"><Headphones/></span><span className="eyebrow">SUPPORT STATUS</span><h3>We’re here to help</h3><p>Our specialists are available and ready to take your request.</p><div><i/> Live support available</div></div><div className="quick-actions"><span className="eyebrow">QUICK ACTIONS</span><button onClick={start}><Plus/>New support request</button><Link to="/customer/conversations"><MessageCircle/>Browse conversations</Link><Link to="/customer/profile/edit"><UserRound/>Update your profile</Link></div><div className="mini-stat"><Bell/><span><b>{stats.unread}</b><small>unread update{stats.unread===1?'':'s'}</small></span></div></aside></section></>}
function ActiveCard({conversation,open}){const agent=conversation.agentId;return <section className="active-conversation"><div className="active-title"><span className="eyebrow">ACTIVE CONVERSATION</span><span className={'status-pill '+conversation.status}>{conversation.status==='waiting'?'Waiting for agent':'Active now'}</span></div><div className="active-body"><span className="avatar large">{personEmoji(agent)}</span><div><h2>{supportAgentLabel(agent)}</h2><p>{conversation.status==='waiting'?'Waiting for a support agent…':conversation.lastMessage||'Your support conversation is active.'}</p></div><button onClick={()=>open(conversation)}>Open chat <ChevronRight size={16}/></button></div></section>}
function EmptyActive({start}){return <section className="active-conversation empty-active"><LifeBuoy/><div><span className="eyebrow">NO OPEN REQUESTS</span><h2>Need a hand?</h2><p>Start a chat and we’ll connect you with the right specialist.</p></div><button onClick={start}>Start a chat</button></section>}
function PagePanel({title,description,action,children}){return <section className="customer-card page-panel"><div className="panel-title"><div><span className="eyebrow">SUPPORT CENTER</span><h2>{title}</h2>{description&&<p>{description}</p>}</div>{action}</div>{children}</section>}
function NewChat({start}){return <section className="new-chat-card"><div className="new-chat-icon"><LifeBuoy size={34}/></div><span className="eyebrow">NEW SUPPORT REQUEST</span><h2>Let’s get you to the right person.</h2><p>Open a secure chat with our support specialists. Your conversation and messages are saved automatically.</p><button className="start-chat" onClick={start}>Start secure chat <ChevronRight/></button><small><Clock3 size={14}/> Typical response time: under 5 minutes</small></section>}
function ConversationList({conversations=[],loading,open,customer}){if(loading)return <div className="route-skeleton"><i/><i/><i/></div>;if(!conversations.length)return <div className="route-empty"><Inbox size={32}/><h3>No conversations yet</h3><p>{customer?'When you contact support, your requests will live here.':'There’s nothing needing attention right now.'}</p></div>;return <div className="route-list">{conversations.map(c=>{const p=customer?(c.agentId||{name:'Support Team'}):c.customerId;return <button key={c._id} onClick={()=>open(c)}><span className="avatar">{personEmoji(p)}</span><span className="route-copy"><b>{customer?supportAgentLabel(p):(p?.name||'Support Team')}</b><small>{c.lastMessage||'New support request'}</small></span>{c.unreadCount>0&&customer&&<em className="unread-badge">{c.unreadCount}</em>}<span className={'status-dot '+c.status}>{c.status}</span><ChevronRight size={16}/></button>})}</div>}
function Notifications({conversations,open,loading}){const unread=conversations.filter(c=>c.unreadCount>0);return <PagePanel title="Notifications" description="Updates from your conversations."><ConversationList conversations={unread} loading={loading} open={open} customer/></PagePanel>}
function Profile({user,go}){return <section className="profile-card"><span className="profile-avatar">{personEmoji(user)}</span><h2>{user.name}</h2><p>{user.email}</p><button className="outline-button" onClick={()=>go('/customer/profile/edit')}>Edit profile</button><div><b>Role</b><span>Customer</span></div><div><b>Member since</b><span>{new Date(user.createdAt||Date.now()).toLocaleDateString()}</span></div></section>}
function EditProfile({user,token,dispatch,go}){const [name,setName]=useState(user.name),[saving,setSaving]=useState(false),[error,setError]=useState('');const profilePath=user.role==='agent'?'/agent/profile':'/customer/profile';const submit=async e=>{e.preventDefault();setSaving(true);setError('');try{const r=await api.patch('/users/me',{name});dispatch(setAuth({user:r.data.user,token}));go(profilePath)}catch(e){setError(e.message)}finally{setSaving(false)}};return <section className="edit-profile-card"><span className="eyebrow">YOUR ACCOUNT</span><h2>Edit profile</h2><p>Keep your support account details up to date.</p><form onSubmit={submit}><label>Full name<input required minLength="2" maxLength="80" value={name} onChange={e=>setName(e.target.value)}/></label><label>Email address<input value={user.email} disabled/><small>Email changes are managed by support.</small></label>{error&&<div className="form-error">{error}</div>}<div><button type="button" className="outline-button" onClick={()=>go(profilePath)}>Cancel</button><button className="start-chat" disabled={saving}>{saving?'Saving…':'Save changes'}</button></div></form></section>}
function SettingsPage(){const [notify,setNotify]=useState(localStorage.getItem('notify')!=='off');return <section className="settings-card"><span className="eyebrow">PREFERENCES</span><h2>Settings</h2><div><span><b>Desktop notifications</b><small>Receive an alert for new messages</small></span><button className={notify?'toggle on':'toggle'} onClick={()=>{setNotify(!notify);localStorage.setItem('notify',notify?'off':'on')}}><i/></button></div></section>}
function AgentProfile({user,go}){return <section className="profile-card"><span className="profile-avatar">{personEmoji(user)}</span><h2>{user.name}</h2><p>{user.email}</p><button className="outline-button" onClick={()=>go('/agent/profile/edit')}>Edit profile</button><div><b>Role</b><span>Support Agent</span></div><div><b>Availability</b><span>{user.availability||'offline'}</span></div><div><b>Member since</b><span>{new Date(user.createdAt||Date.now()).toLocaleDateString()}</span></div></section>}
function AgentProfileMenu({go,logout}){return <div className="profile-dropdown"><button onClick={()=>go('/agent/profile')}><UserRound/>Profile</button><button onClick={()=>go('/agent/profile/edit')}><SlidersHorizontal/>Edit profile</button><button onClick={()=>go('/agent/notifications')}><Bell/>Notifications</button><button onClick={()=>go('/agent/settings')}><Settings/>Settings</button><hr/><button className="logout-item" onClick={logout}><LogOut/>Logout</button></div>}
function AdminDashboard(){return <section className="admin-dashboard"><div className="admin-stats"><div className="stat-card"><Headphones size={24} /><div><b>Total Agents</b><span>Support team members</span></div></div><div className="stat-card"><MessageCircle size={24} /><div><b>Active Chats</b><span>Conversations in progress</span></div></div><div className="stat-card"><CheckCircle2 size={24} /><div><b>Resolved Today</b><span>Completed conversations</span></div></div></div><PagePanel title="Quick Actions"><div className="quick-action-grid"><Link to="/admin/agents" className="action-card"><UserPlus size={24} /><h3>Manage Agents</h3><p>Add, edit, or remove support agents</p></Link><Link to="/admin/settings" className="action-card"><Settings size={24} /><h3>System Settings</h3><p>Configure platform preferences</p></Link></div></PagePanel></section>}
function AdminProfileMenu({go,logout}){return <div className="profile-dropdown"><button onClick={()=>go('/admin/dashboard')}><UserRound/>Profile</button><button onClick={()=>go('/admin/settings')}><Settings/>Settings</button><hr/><button className="logout-item" onClick={logout}><LogOut/>Logout</button></div>}
function Desk({role,page,conversations,loading,open,load}){return <div className="desk-main"><header className="desk-header"><div><span className="eyebrow">SUPPORT OPERATIONS</span><h1>{label(page)}</h1></div></header>{role==='admin'&&page==='agents'?<AgentManagement/>:<PagePanel title={page==='dashboard'?'Recent conversations':label(page)}><ConversationList conversations={conversations} loading={loading} open={open}/></PagePanel>}</div>}
function AgentManagement() {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingAgent, setEditingAgent] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', password: '', availability: 'offline' });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState('');
  const [noticeType, setNoticeType] = useState('');

  const loadAgents = useCallback(async () => {
    try {
      const r = await api.get('/users/agents');
      setAgents(r.data);
    } catch (e) {
      setNotice(e.message || 'Failed to load agents');
      setNoticeType('error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadAgents(); }, [loadAgents]);

  const validateForm = () => {
    const newErrors = {};
    if (!form.name?.trim() || form.name.trim().length < 2) newErrors.name = 'Name must be at least 2 characters';
    if (!form.email?.includes('@')) newErrors.email = 'Valid email required';
    if (!editingAgent && (!form.password || form.password.length < 8)) newErrors.password = 'Password must be at least 8 characters';
    if (editingAgent && form.password && form.password.length < 8) newErrors.password = 'Password must be at least 8 characters';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setSaving(true);
    setNotice('');
    try {
      if (editingAgent) {
        const { password, ...data } = form;
        const payload = Object.keys(data).reduce((acc, key) => {
          if (data[key] !== '') acc[key] = data[key];
          return acc;
        }, {});
        if (password) payload.password = password;
        await api.patch(`/users/agents/${editingAgent._id}`, payload);
        setNotice('Agent updated successfully');
      } else {
        await api.post('/users/agents', form);
        setNotice('Support agent created successfully');
      }
      setNoticeType('success');
      setShowForm(false);
      setEditingAgent(null);
      setForm({ name: '', email: '', password: '', availability: 'offline' });
      loadAgents();
    } catch (e) {
      setNotice(e.message || 'Operation failed');
      setNoticeType('error');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (agent) => {
    setEditingAgent(agent);
    setForm({ name: agent.name, email: agent.email, password: '', availability: agent.availability });
    setShowForm(true);
  };

  const handleDelete = async (agent) => {
    if (!confirm(`Delete agent "${agent.name}"? This cannot be undone.`)) return;
    try {
      await api.delete(`/users/agents/${agent._id}`);
      setNotice('Agent deleted');
      setNoticeType('success');
      loadAgents();
    } catch (e) {
      setNotice(e.message || 'Failed to delete agent');
      setNoticeType('error');
    }
  };

  const handleAvailabilityChange = async (agent, newAvailability) => {
    try {
      await api.patch(`/users/agents/${agent._id}/availability`, { availability: newAvailability });
      setNotice(`Agent set to ${newAvailability}`);
      setNoticeType('success');
      loadAgents();
    } catch (e) {
      setNotice(e.message || 'Failed to update availability');
      setNoticeType('error');
    }
  };

  const cancelForm = () => {
    setShowForm(false);
    setEditingAgent(null);
    setForm({ name: '', email: '', password: '', availability: 'offline' });
    setErrors({});
  };

  const getStatusColor = (availability, isOnline) => {
    if (availability === 'online' && isOnline) return 'online';
    if (availability === 'away') return 'away';
    return 'offline';
  };

  const getStatusLabel = (availability, isOnline) => {
    if (availability === 'online' && isOnline) return 'Online';
    if (availability === 'away') return 'Away';
    return 'Offline';
  };

  if (loading) return <div className="route-skeleton"><i/><i/><i/></div>;

  return (
    <PagePanel title="Support Agents" description="Manage support agent accounts, availability, and permissions.">
      {notice && <div className={`toast ${noticeType}`}>{notice}<button onClick={() => setNotice('')}>✕</button></div>}
      
      <div className="agents-header">
        <h3>All Agents ({agents.length})</h3>
        <button className="primary" onClick={() => { setEditingAgent(null); setForm({ name: '', email: '', password: '', availability: 'offline' }); setShowForm(true); }}>
          <UserPlus size={16} /> Add Agent
        </button>
      </div>

      {showForm && (
        <div className="agent-form-overlay" onClick={cancelForm}>
          <div className="agent-form-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingAgent ? 'Edit Agent' : 'Create Support Agent'}</h3>
              <button onClick={cancelForm}><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="agent-form">
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  placeholder="Agent name"
                  required
                />
                {errors.name && <span className="form-error">{errors.name}</span>}
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  placeholder="agent@example.com"
                  required
                  disabled={editingAgent}
                />
                {errors.email && <span className="form-error">{errors.email}</span>}
                {editingAgent && <small className="form-hint">Email cannot be changed</small>}
              </div>
              <div className="form-group">
                <label>{editingAgent ? 'New Password (optional)' : 'Password'}</label>
                <input
                  type="password"
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  placeholder={editingAgent ? 'Leave blank to keep current' : 'Minimum 8 characters'}
                  required={!editingAgent}
                />
                {errors.password && <span className="form-error">{errors.password}</span>}
              </div>
              <div className="form-group">
                <label>Availability Status</label>
                <select
                  value={form.availability}
                  onChange={e => setForm({ ...form, availability: e.target.value })}
                >
                  <option value="online">Online - Ready for chats</option>
                  <option value="away">Away - Temporarily unavailable</option>
                  <option value="offline">Offline - Not accepting chats</option>
                </select>
              </div>
              <div className="form-actions">
                <button type="button" className="outline-button" onClick={cancelForm}>Cancel</button>
                <button type="submit" className="primary" disabled={saving}>
                  {saving ? <Loader2 size={16} className="spin" /> : (editingAgent ? 'Save Changes' : 'Create Agent')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="agents-table-container">
        <table className="agents-table">
          <thead>
            <tr>
              <th>Agent</th>
              <th>Email</th>
              <th>Status</th>
              <th>Availability</th>
              <th>Joined</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {agents.length === 0 ? (
              <tr><td colSpan={6} className="empty-state">No agents found. Click "Add Agent" to create one.</td></tr>
            ) : (
              agents.map(agent => (
                <tr key={agent._id}>
                  <td>
                    <div className="agent-info">
                      <span className="avatar">{personEmoji(agent)}</span>
                      <span className="agent-name">{agent.name}</span>
                    </div>
                  </td>
                  <td>{agent.email}</td>
                  <td>
                    <span className={`status-badge ${agent.isOnline ? 'online' : 'offline'}`}>
                      <span className="status-dot" />
                      {agent.isOnline ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <select
                      value={agent.availability}
                      onChange={e => handleAvailabilityChange(agent, e.target.value)}
                      className="availability-select"
                    >
                      <option value="online">Online</option>
                      <option value="away">Away</option>
                      <option value="offline">Offline</option>
                    </select>
                  </td>
                  <td>{new Date(agent.createdAt).toLocaleDateString()}</td>
                  <td>
                    <div className="action-buttons">
                      <button className="icon-btn" onClick={() => handleEdit(agent)} title="Edit">
                        <Edit2 size={16} />
                      </button>
                      <button className="icon-btn danger" onClick={() => handleDelete(agent)} title="Delete">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </PagePanel>
  );
}
function Toast({message,clear}){return <div className="toast">{message}<button onClick={clear}><X size={15}/></button></div>}
