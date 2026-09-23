import {useState} from 'react';
import {useDispatch} from 'react-redux';
import {useLocation,useNavigate} from 'react-router-dom';
import {ArrowRight,Headphones,LockKeyhole,Mail,ShieldCheck,UserRound,Eye,EyeOff} from 'lucide-react';
import api from '../lib/api.js';
import {setAuth} from '../app/store.js';

export default function Auth(){
  const location=useLocation();
  const [mode,setMode]=useState(location.pathname==='/register'?'register':'login');
  const [show,setShow]=useState(false);
  const [form,setForm]=useState({name:'',email:'',password:'',role:'customer'});
  const [error,setError]=useState('');
  const [busy,setBusy]=useState(false);
  const dispatch=useDispatch(),go=useNavigate();
  const set=(key,value)=>setForm({...form,[key]:value});
  const isStaff=form.role!=='customer';
  const isAgentRegistration=mode==='register'&&form.role==='agent';
  const submit=async event=>{event.preventDefault();setBusy(true);setError('');try{const result=await api.post(`/auth/${mode==='login'?'login':'register'}`,form);dispatch(setAuth(result.data));go('/')}catch(err){setError(err.message)}finally{setBusy(false)}};
  const demo=()=>setForm({...form,email:form.role==='admin'?'admin@example.com':'agent@example.com',password:'SupportDemo2026!'});
  const switchMode=()=>{const next=mode==='login'?'register':'login';setMode(next);setError('');if(next==='register'&&form.role==='admin')set('role','customer')};
  return <main className="portal">
    <header className="portal-brand"><div className="brand-mark"><Headphones size={22}/></div><div><strong>SupportFlow</strong><span>Customer Support Platform</span></div><p><LockKeyhole size={15}/> Secure support portal</p></header>
    <section className="portal-card">
      <aside className="portal-visual"><div className="orb orb-one"/><div className="orb orb-two"/><div className="support-illustration"><div className="bubble one">Hello! How can we help?</div><div className="bubble two">We're here for you</div><div className="illustration-head"><i/><i/></div><div className="agent-face"><b className="hair"/><b className="glasses">◉ ◉</b></div><div className="laptop">✦</div></div><div className="visual-copy"><h1>Support that feels<br/>human.</h1><p>Get help quickly, track every conversation, and stay connected with your team.</p><div className="dots"><i/><i className="on"/><i/></div></div></aside>
      <section className="portal-form">
        <div className="form-intro"><span className="form-kicker">{mode==='login'?'WELCOME BACK':'GET STARTED'}</span><h2>{mode==='login'?'Sign in to SupportFlow':isAgentRegistration?'Join the support team':'Create your support account'}</h2><p>{mode==='login'?'Enter your details to continue to your workspace.':isAgentRegistration?'Create an agent account to help customers and manage conversations.':'Create an account to start a support conversation.'}</p></div>
        <form onSubmit={submit}>
          {mode==='register'&&<><div className="registration-role"><span>Account type</span><div className="role-toggle"><button type="button" className={form.role==='customer'?'on':''} onClick={()=>set('role','customer')}>Customer</button><button type="button" className={form.role==='agent'?'on':''} onClick={()=>set('role','agent')}>Support agent</button></div><small>{isAgentRegistration?'You will be taken to the agent workspace after registration.':'You will be able to create and follow your support requests.'}</small></div><label>Full name<div className="field"><UserRound size={18}/><input required minLength="2" placeholder="Your name" value={form.name} onChange={e=>set('name',e.target.value)}/></div></label></>}
          <label>Email address<div className="field"><Mail size={18}/><input required type="email" placeholder="you@example.com" value={form.email} onChange={e=>set('email',e.target.value)}/></div></label>
          <label>Password<div className="field"><LockKeyhole size={18}/><input required type={show?'text':'password'} minLength="8" placeholder="Use at least 8 characters" value={form.password} onChange={e=>set('password',e.target.value)}/><button type="button" onClick={()=>setShow(!show)}>{show?<EyeOff size={18}/>:<Eye size={18}/>}</button></div></label>
          {mode==='login'&&<div className="role-toggle"><button type="button" className={form.role==='customer'?'on':''} onClick={()=>set('role','customer')}>Customer</button><button type="button" className={form.role==='agent'?'on':''} onClick={()=>set('role','agent')}>Agent</button><button type="button" className={form.role==='admin'?'on':''} onClick={()=>set('role','admin')}>Admin</button></div>}
          {error&&<p className="error">{error}</p>}
          <button className="portal-submit" disabled={busy}>{busy?'Please wait…':mode==='login'?'Sign in':`Create ${isAgentRegistration?'agent':'customer'} account`} <ArrowRight size={18}/></button>
        </form>
        {mode==='login'&&isStaff&&<button className="demo-login" onClick={demo}><ShieldCheck size={16}/> Fill development {form.role} credentials</button>}
        <div className="switcher">{mode==='login'?"Don't have an account? ":'Already have an account? '}<button onClick={switchMode}>{mode==='login'?'Create an account':'Sign in'}</button></div>
        <footer>© 2026 SupportFlow. Built for better conversations.</footer>
      </section>
    </section>
  </main>
}
