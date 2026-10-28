import { useEffect, useState, type FormEvent } from 'react';
import { Link, NavLink, Route, Routes, useNavigate, useParams } from 'react-router-dom';
import {
  Activity,
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  Check,
  ChevronDown,
  CircleHelp,
  Clock3,
  Compass,
  Heart,
  Hospital as HospitalIcon,
  Leaf,
  LogOut,
  Menu,
  MessageCircle,
  Plus,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  Stethoscope,
  Users,
  X,
} from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  login,
  logout,
  register,
  me,
  request,
  chat,
  forgotPassword,
  resetPassword,
  type ChatResult,
  type DoctorCard,
  type HospitalCard,
} from '../services/api';

function useSession() {
  const queryClient = useQueryClient();
  const query = useQuery({ queryKey: ['session'], queryFn: me, retry: false });
  return {
    user: query.data?.user,
    doctor: query.data?.doctor,
    hospital: query.data?.hospital,
    loading: query.isLoading,
    refresh: () => queryClient.invalidateQueries({ queryKey: ['session'] }),
  };
}
function Header() {
  const { user } = useSession();
  return (
    <header className="site-header">
      <Link to="/" className="brand">
        <span className="brand-mark">
          <Leaf size={21} />
        </span>
        carekind
      </Link>
      <nav className="public-nav">
        <a href="/#how">How it works</a>
        <Link to="/doctors">Doctors</Link>
        <Link to="/hospitals">Hospitals</Link>
      </nav>
      <div className="header-actions">
        {user ? (
          <Link
            to={
              user.role === 'doctor'
                ? '/doctor'
                : user.role === 'hospital'
                  ? '/hospital'
                  : user.role === 'admin'
                    ? '/admin'
                    : '/app'
            }
            className="btn btn-small"
          >
            My care <ArrowRight size={15} />
          </Link>
        ) : (
          <>
            <Link to="/login" className="login-link">
              Sign in
            </Link>
            <Link to="/register" className="btn btn-small">
              Get started <ArrowRight size={15} />
            </Link>
          </>
        )}
      </div>
    </header>
  );
}
function Landing() {
  return (
    <>
      <Header />
      <main>
        <section className="hero">
          <div className="hero-left">
            <div className="eyebrow">
              <span className="eyebrow-dot" /> A calmer way to navigate care
            </div>
            <h1>
              Understand your health.
              <br />
              <em>Find the right care.</em>
            </h1>
            <p className="hero-copy">
              Thoughtful health information, helpful next steps, and trusted connections to care —
              all in one place.
            </p>
            <div className="hero-actions">
              <Link className="btn btn-primary" to="/chat">
                Talk to AI assistant <ArrowRight size={17} />
              </Link>
              <Link to="/doctors" className="btn btn-quiet">
                Find a doctor
              </Link>
            </div>
            <div className="hero-note">
              <ShieldCheck size={15} /> Your health information stays private
            </div>
          </div>
          <div className="hero-art" aria-label="Abstract botanical illustration">
            <div className="art-wash" />
            <div className="art-card art-card-top">
              <span className="art-icon">
                <Sparkles size={18} />
              </span>
              <span>
                <b>A little more clarity</b>
                <small>Thoughtful guidance, at your pace</small>
              </span>
              <ArrowUpRight size={15} />
            </div>
            <div className="art-ring">
              <div className="ring-inner">
                <span className="sun-dot" />
                <span className="leaf-shape leaf-one" />
                <span className="leaf-shape leaf-two" />
                <span className="leaf-shape leaf-three" />
                <span className="leaf-stem" />
              </div>
            </div>
            <div className="art-card art-card-bottom">
              <span className="avatar-stack">
                <i>AR</i>
                <i>KM</i>
                <i>+</i>
              </span>
              <span>
                <b>Care that feels human</b>
                <small>Explore doctors at your own pace</small>
              </span>
            </div>
            <div className="art-caption">
              A more considered approach to feeling well <span>01 / 03</span>
            </div>
          </div>
        </section>
        <section className="trust-strip">
          <span>
            <ShieldCheck size={17} /> Private by design
          </span>
          <span>
            <Sparkles size={17} /> AI with clear limits
          </span>
          <span>
            <Stethoscope size={17} /> People-first care
          </span>
        </section>
        <section className="section intro-section" id="how">
          <div className="section-heading">
            <span className="eyebrow">A little help goes a long way</span>
            <h2>Your next step, made clearer.</h2>
            <p>Start wherever you are. We’ll help you find your way forward.</p>
          </div>
          <div className="feature-grid">
            <Link to="/chat" className="feature-card feature-sage">
              <span className="feature-icon">
                <MessageCircle />
              </span>
              <span className="card-index">01 — LISTEN</span>
              <h3>Talk it through</h3>
              <p>
                Share what’s on your mind and get general health information in a calm, supportive
                conversation.
              </p>
              <span className="text-link">
                Meet your AI assistant <ArrowRight size={16} />
              </span>
            </Link>
            <Link to="/doctors" className="feature-card">
              <span className="feature-icon">
                <Stethoscope />
              </span>
              <span className="card-index">02 — CONNECT</span>
              <h3>Find your person</h3>
              <p>
                Explore sample doctor profiles by specialty, city, and consultation style. Make the
                choice that feels right for you.
              </p>
              <span className="text-link">
                Explore doctors <ArrowRight size={16} />
              </span>
            </Link>
            <Link to="/hospitals" className="feature-card feature-peach">
              <span className="feature-icon">
                <HospitalIcon />
              </span>
              <span className="card-index">03 — DISCOVER</span>
              <h3>Find a place to begin</h3>
              <p>Browse clearly labelled demonstration hospitals and their listed specialties.</p>
              <span className="text-link">
                Explore hospitals <ArrowRight size={16} />
              </span>
            </Link>
          </div>
        </section>
        <section className="reassurance">
          <div className="reassurance-art">
            <span className="reassurance-orbit orbit-a" />
            <span className="reassurance-orbit orbit-b" />
            <span className="reassurance-cross">✳</span>
          </div>
          <div>
            <span className="eyebrow">Carefully considered</span>
            <h2>
              Technology can guide.
              <br />
              <em>People provide care.</em>
            </h2>
            <p>
              AI can help you learn about possible explanations and next steps. It cannot diagnose
              you or replace a healthcare professional. When you need care, connect with a qualified
              clinician who can understand your whole story.
            </p>
            <Link className="text-link" to="/register">
              Create your private care space <ArrowRight size={16} />
            </Link>
          </div>
        </section>
        <section className="cta-band">
          <div>
            <span className="eyebrow">Whenever you’re ready</span>
            <h2>Start with what’s on your mind.</h2>
            <p>There’s no perfect way to begin. Just a place to start.</p>
          </div>
          <Link to="/chat" className="btn btn-light">
            Talk to AI assistant <ArrowRight size={17} />
          </Link>
        </section>
        <section className="section faq">
          <div>
            <span className="eyebrow">A few things to know</span>
            <h2>
              Clear answers,
              <br />
              before you begin.
            </h2>
          </div>
          <div className="faq-list">
            <details>
              <summary>
                Can the AI diagnose me?
                <ChevronDown size={17} />
              </summary>
              <p>
                No. It shares general health information and possible explanations. Only a qualified
                professional can assess your symptoms and provide a diagnosis.
              </p>
            </details>
            <details>
              <summary>
                Are the doctors and hospitals real?
                <ChevronDown size={17} />
              </summary>
              <p>
                Profiles shown in this demonstration are fictional sample data. They are clearly
                labelled and are not verified professionals or live providers.
              </p>
            </details>
            <details>
              <summary>
                Is this for emergencies?
                <ChevronDown size={17} />
              </summary>
              <p>
                No. If you may be experiencing an emergency, contact your local emergency services.
                In India, call 112.
              </p>
            </details>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
function Footer() {
  return (
    <footer className="footer">
      <Link to="/" className="brand">
        <span className="brand-mark">
          <Leaf size={18} />
        </span>
        carekind
      </Link>
      <span>Thoughtful tools for your health journey.</span>
      <div>
        <Link to="/privacy">Privacy</Link>
        <Link to="/doctors">Find a doctor</Link>
        <small>© 2026 Carekind. Informational use only.</small>
      </div>
    </footer>
  );
}
function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useSession();
  const [mobile, setMobile] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  useEffect(() => {
    if (!loading && !user) navigate('/login');
  }, [loading, user, navigate]);
  if (loading || !user)
    return (
      <div className="loading-screen">
        <span className="spinner" /> Your care space is getting ready…
      </div>
    );
  const links: Array<[string, string, typeof Activity]> =
    user.role === 'admin'
      ? [
          ['/admin', 'Overview', Activity],
          ['/admin/doctors', 'Doctor review', Stethoscope],
          ['/admin/hospitals', 'Hospital review', HospitalIcon],
          ['/admin/users', 'People', Users],
          ['/admin/appointments', 'Appointments', CalendarDays],
          ['/admin/reviews', 'Reviews', Star],
        ]
      : user.role === 'doctor'
        ? [
            ['/doctor', 'Overview', Activity],
            ['/doctor/appointments', 'Appointments', CalendarDays],
            ['/doctor/profile', 'Profile & availability', Stethoscope],
          ]
        : user.role === 'hospital'
          ? [
              ['/hospital', 'Overview', Activity],
              ['/hospital/profile', 'Profile & facilities', HospitalIcon],
            ]
          : ([
              ['/app', 'Your overview', Activity],
              ['/chat', 'AI health assistant', MessageCircle],
              ['/history', 'Chat history', Clock3],
              ['/doctors', 'Find doctors', Stethoscope],
              ['/hospitals', 'Find hospitals', HospitalIcon],
              ['/appointments', 'Appointments', CalendarDays],
              ['/summaries', 'Health summaries', Heart],
              ['/saved', 'Saved care', Star],
              ['/activity', 'Healthcare activity', Activity],
              ['/profile', 'Profile', Users],
              ['/settings', 'Settings', CircleHelp],
            ] as const);
  return (
    <div className="app-shell">
      <aside className={`sidebar ${mobile ? 'sidebar-open' : ''}`}>
        <Link to="/" className="brand">
          <span className="brand-mark">
            <Leaf size={19} />
          </span>
          carekind
        </Link>
        <div className="workspace-label">
          {user.role === 'patient' ? 'YOUR CARE SPACE' : `${user.role.toUpperCase()} PORTAL`}
        </div>
        <nav className="side-nav">
          {links.map(([to, label, Icon]) => (
            <NavLink end to={to} key={to} onClick={() => setMobile(false)}>
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="privacy-card">
            <ShieldCheck size={17} />
            <span>
              <b>Your health, your choice</b>
              <small>Review what you choose to share.</small>
            </span>
          </div>
          <div className="profile-button">
            <span className="profile-avatar">{user.name.slice(0, 1).toUpperCase()}</span>
            <span>
              <b>{user.name}</b>
              <small>
                {user.role === 'patient'
                  ? 'Personal account'
                  : user.role === 'hospital'
                    ? 'Hospital account'
                    : user.role}
              </small>
            </span>
          </div>
          <button
            className="sign-out-button"
            type="button"
            onClick={async () => {
              await logout();
              queryClient.clear();
              navigate('/', { replace: true });
            }}
          >
            <LogOut size={16} /> Sign out
          </button>
        </div>
      </aside>
      <div className="app-main">
        <header className="app-topbar">
          <button
            className="icon-button mobile-menu"
            onClick={() => setMobile(!mobile)}
            aria-label="Toggle navigation"
          >
            {mobile ? <X size={20} /> : <Menu size={20} />}
          </button>
          <div className="breadcrumb">
            <span>My care</span>
            <ArrowDownRight size={14} />
            <b>
              {location.pathname.split('/').filter(Boolean).pop()?.replace(/-/g, ' ') || 'Overview'}
            </b>
          </div>
          <div className="topbar-right">
            <span className="privacy-chip">
              <span /> Private space
            </span>
            <button className="icon-button" aria-label="Help" onClick={() => navigate('/privacy')}>
              <CircleHelp size={19} />
            </button>
            <span className="profile-avatar small-avatar">
              {user.name.slice(0, 1).toUpperCase()}
            </span>
          </div>
        </header>
        <main className="app-content">{children}</main>
      </div>
    </div>
  );
}
function PageTitle({
  eyebrow,
  title,
  copy,
  action,
}: {
  eyebrow: string;
  title: string;
  copy?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="page-title">
      <div>
        <span className="eyebrow">{eyebrow}</span>
        <h1>{title}</h1>
        {copy && <p>{copy}</p>}
      </div>
      {action}
    </div>
  );
}
function Dashboard() {
  const { user } = useSession();
  const { data: appts } = useQuery({
    queryKey: ['appointments'],
    queryFn: () => request<{ items: Array<Record<string, unknown>> }>('/appointments'),
    enabled: !!user,
  });
  const { data: history } = useQuery({
    queryKey: ['conversations'],
    queryFn: () =>
      request<{ items: Array<{ _id: string; title: string; lastActivityAt: string }> }>(
        '/conversations',
      ),
    enabled: user?.role === 'patient',
  });
  const upcoming = appts?.items?.find(
    (a) =>
      ['pending', 'confirmed'].includes(String(a.status)) &&
      new Date(String(a.startsAt)) > new Date(),
  );
  return (
    <>
      <PageTitle
        eyebrow="YOUR CARE SPACE"
        title={`Welcome, ${user?.name.split(' ')[0] ?? 'there'}.`}
        copy="A little more clarity, one step at a time."
      />
      <div className="welcome-panel">
        <div className="welcome-copy">
          <span className="welcome-icon">
            <Sparkles size={19} />
          </span>
          <span className="eyebrow">WHENEVER YOU’RE READY</span>
          <h2>What’s on your mind today?</h2>
          <p>Start a private conversation, explore your options, or come back to what matters.</p>
          <Link to="/chat" className="btn btn-primary">
            Start a conversation <ArrowRight size={16} />
          </Link>
        </div>
        <div className="welcome-illustration">
          <span className="welcome-sun" />
          <span className="welcome-leaf leaf-a" />
          <span className="welcome-leaf leaf-b" />
          <span className="welcome-leaf leaf-c" />
          <span className="welcome-pot" />
        </div>
      </div>
      <div className="dashboard-grid">
        <section className="dashboard-panel">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">YOUR NEXT STEP</span>
              <h3>Coming up</h3>
            </div>
            <Link to="/appointments" className="icon-link" aria-label="View appointments">
              <ArrowRight size={17} />
            </Link>
          </div>
          {upcoming ? (
            <div className="appointment-preview">
              <span className="appointment-icon">
                <CalendarDays />
              </span>
              <div>
                <b>
                  {(upcoming.doctor as { user?: { name?: string } })?.user?.name ??
                    'Your appointment'}
                </b>
                <small>{new Date(String(upcoming.startsAt)).toLocaleString()}</small>
              </div>
              <span className="status-pill">{String(upcoming.status)}</span>
            </div>
          ) : (
            <div className="empty-state compact">
              <span className="empty-icon">
                <CalendarDays size={19} />
              </span>
              <b>No appointments yet</b>
              <p>When you book a visit, you’ll find the details here.</p>
              <Link to="/doctors" className="text-link">
                Explore doctors <ArrowRight size={15} />
              </Link>
            </div>
          )}
        </section>
        <section className="dashboard-panel">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">PICK UP WHERE YOU LEFT OFF</span>
              <h3>Recent conversations</h3>
            </div>
            <Link to="/history" className="icon-link" aria-label="View history">
              <ArrowRight size={17} />
            </Link>
          </div>
          {history?.items?.length ? (
            history.items.slice(0, 3).map((c) => (
              <Link key={c._id} to={`/chat/${c._id}`} className="conversation-row">
                <span className="conversation-dot">
                  <MessageCircle size={16} />
                </span>
                <span>
                  <b>{c.title}</b>
                  <small>{new Date(c.lastActivityAt).toLocaleDateString()}</small>
                </span>
                <ArrowRight size={15} />
              </Link>
            ))
          ) : (
            <div className="empty-state compact">
              <span className="empty-icon">
                <MessageCircle size={18} />
              </span>
              <b>Your conversations live here</b>
              <p>Start a chat whenever you’re ready.</p>
            </div>
          )}
        </section>
      </div>
      <div className="quick-actions">
        <Link to="/doctors">
          <span>
            <Stethoscope size={19} />
          </span>
          <b>Find a doctor</b>
          <small>Browse by specialty and city</small>
          <ArrowRight size={16} />
        </Link>
        <Link to="/hospitals">
          <span>
            <HospitalIcon size={19} />
          </span>
          <b>Explore hospitals</b>
          <small>Browse sample locations</small>
          <ArrowRight size={16} />
        </Link>
        <Link to="/summaries">
          <span>
            <Heart size={19} />
          </span>
          <b>Health summaries</b>
          <small>Your saved information</small>
          <ArrowRight size={16} />
        </Link>
      </div>
      <p className="demo-note">
        <ShieldCheck size={15} /> Doctor and hospital profiles currently shown are fictional demo
        data.
      </p>
    </>
  );
}
function AuthPage({ mode }: { mode: 'login' | 'register' }) {
  const { refresh } = useSession();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [role, setRole] = useState<'patient' | 'doctor' | 'hospital'>('patient');
  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    const data = Object.fromEntries(new FormData(e.currentTarget));
    try {
      const result =
        mode === 'login'
          ? await login(String(data.email), String(data.password))
          : await register({
              ...data,
              role,
              ...(role === 'doctor'
                ? {
                    qualifications: String(data.qualifications ?? '')
                      .split(',')
                      .map((s) => s.trim())
                      .filter(Boolean),
                    yearsExperience: Number(data.yearsExperience || 0),
                    fee: Number(data.fee || 0),
                  }
                : {}),
              ...(role === 'hospital'
                ? {
                    city: String(data.city ?? '').trim() || 'Demo City',
                    specialties: String(data.specialties ?? '')
                      .split(',')
                      .map((s) => s.trim())
                      .filter(Boolean),
                    facilities: String(data.facilities ?? '')
                      .split(',')
                      .map((s) => s.trim())
                      .filter(Boolean),
                    description: String(data.description ?? '').trim(),
                    phone: String(data.phone ?? '').trim(),
                  }
                : {}),
            });
      await refresh();
      navigate(
        result.user.role === 'doctor'
          ? '/doctor'
          : result.user.role === 'hospital'
            ? '/hospital'
            : result.user.role === 'admin'
              ? '/admin'
              : '/app',
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to continue');
    }
  };
  return (
    <div className="auth-page">
      <Header />
      <main className="auth-wrap">
        <div className="auth-aside">
          <span className="eyebrow">A SPACE THAT’S YOURS</span>
          <h1>
            Care begins
            <br />
            <em>with a conversation.</em>
          </h1>
          <p>Thoughtful tools, a little more clarity, and the freedom to choose what comes next.</p>
          <div className="auth-aside-note">
            <ShieldCheck size={18} />
            <span>
              <b>Private by design</b>
              <small>Your personal health space belongs to you.</small>
            </span>
          </div>
        </div>
        <div className="auth-card">
          <span className="eyebrow">
            {mode === 'login' ? 'WELCOME BACK' : 'A GOOD PLACE TO BEGIN'}
          </span>
          <h2>{mode === 'login' ? 'Sign in to your care space' : 'Create your account'}</h2>
          <p>
            {mode === 'login'
              ? 'Pick up right where you left off.'
              : 'A private home for your healthcare journey.'}
          </p>
          {mode === 'register' && (
            <div className="role-switch">
              <button
                className={role === 'patient' ? 'selected' : ''}
                onClick={() => setRole('patient')}
                type="button"
              >
                Patient
              </button>
              <button
                className={role === 'doctor' ? 'selected' : ''}
                onClick={() => setRole('doctor')}
                type="button"
              >
                Doctor
              </button>
              <button
                className={role === 'hospital' ? 'selected' : ''}
                onClick={() => setRole('hospital')}
                type="button"
              >
                Hospital
              </button>
            </div>
          )}
          <form onSubmit={submit} className="form-stack">
            {mode === 'register' && (
              <>
                <label>
                  {role === 'hospital' ? 'Hospital or center name' : 'Full name'}
                  <input
                    name="name"
                    autoComplete="name"
                    required
                    minLength={2}
                    placeholder={
                      role === 'hospital'
                        ? 'e.g. City Health Hospital'
                        : role === 'doctor'
                          ? 'Dr. Full Name'
                          : 'Your name'
                    }
                  />
                </label>
                {role === 'doctor' && (
                  <>
                    <label>
                      Specialty
                      <input name="specialty" required placeholder="e.g. Family medicine" />
                    </label>
                    <label>
                      Professional registration number
                      <input
                        name="registrationNumber"
                        required
                        placeholder="Your registration number"
                      />
                    </label>
                    <label>
                      Qualifications <span className="optional">comma separated</span>
                      <input name="qualifications" placeholder="e.g. MBBS, MD" />
                    </label>
                    <div className="form-row">
                      <label>
                        Years of experience
                        <input
                          name="yearsExperience"
                          type="number"
                          min="0"
                          max="70"
                          defaultValue="0"
                        />
                      </label>
                      <label>
                        Consultation fee (₹)
                        <input name="fee" type="number" min="0" defaultValue="500" />
                      </label>
                    </div>
                  </>
                )}
                {role === 'hospital' && (
                  <>
                    <div className="form-row">
                      <label>
                        City or locality
                        <input name="city" required placeholder="e.g. Mumbai or Demo City" />
                      </label>
                      <label>
                        Contact phone
                        <input name="phone" placeholder="e.g. +91 98765 43210" />
                      </label>
                    </div>
                    <label>
                      Listed specialties <span className="optional">comma separated</span>
                      <input
                        name="specialties"
                        placeholder="e.g. Cardiology, Neurology, Pediatrics"
                      />
                    </label>
                    <label>
                      Facilities & departments <span className="optional">comma separated</span>
                      <input
                        name="facilities"
                        placeholder="e.g. 24/7 Emergency, ICU, Diagnostic Lab"
                      />
                    </label>
                    <label>
                      Overview & description
                      <input
                        name="description"
                        placeholder="Brief summary of your hospital services..."
                      />
                    </label>
                  </>
                )}
              </>
            )}
            <label>
              Email address
              <input
                name="email"
                type="email"
                autoComplete="email"
                required
                placeholder="you@example.com"
              />
            </label>
            <label>
              <div
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
              >
                <span>Password</span>
                {mode === 'login' && (
                  <Link
                    to="/forgot-password"
                    className="text-link"
                    style={{ fontSize: '0.8125rem' }}
                  >
                    Forgot password?
                  </Link>
                )}
              </div>
              <input
                name="password"
                type="password"
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                required
                minLength={mode === 'register' ? 12 : 1}
                placeholder={mode === 'register' ? 'At least 12 characters' : 'Your password'}
              />
              {mode === 'register' && (
                <small className="field-hint">Use at least 12 characters.</small>
              )}
            </label>
            {error && (
              <div role="alert" className="form-error">
                {error}
              </div>
            )}
            <button className="btn btn-primary btn-full" type="submit">
              {mode === 'login' ? 'Sign in' : 'Create account'} <ArrowRight size={16} />
            </button>
          </form>
          <p className="auth-switch">
            {mode === 'login' ? (
              <>
                New here? <Link to="/register">Create an account</Link>
              </>
            ) : (
              <>
                Already have an account? <Link to="/login">Sign in</Link>
              </>
            )}
          </p>
          {role === 'doctor' && mode === 'register' && (
            <p className="pending-note">
              Doctor accounts remain pending review until an administrator verifies the profile.
            </p>
          )}
          {role === 'hospital' && mode === 'register' && (
            <p className="pending-note">
              Hospital accounts remain pending review until an administrator verifies the
              organization. Patients can view submitted details in the directory with pending
              status.
            </p>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [step, setStep] = useState<'request' | 'verify' | 'success'>('request');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const onRequest = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setNotice('');
    setLoading(true);
    try {
      const res = await forgotPassword(email.trim());
      setStep('verify');
      if (res.otp) {
        setOtp(res.otp);
      }
      setNotice(
        res.message ||
          'If an account exists with this email, a 6-digit verification code was sent.',
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to request password reset');
    } finally {
      setLoading(false);
    }
  };

  const onReset = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setNotice('');
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 12) {
      setError('Password must be at least 12 characters.');
      return;
    }
    if (otp.trim().length !== 6) {
      setError('Please enter the 6-digit code sent to your email.');
      return;
    }
    setLoading(true);
    try {
      const res = await resetPassword({
        email: email.trim(),
        otp: otp.trim(),
        password,
      });
      setStep('success');
      setNotice(res.message || 'Password reset successful!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <Header />
      <main className="auth-wrap">
        <div className="auth-aside">
          <span className="eyebrow">ACCOUNT RECOVERY</span>
          <h1>
            Secure access
            <br />
            <em>to your care space.</em>
          </h1>
          <p>
            We’ll send a one-time 6-digit code to your registered email to help you safely reset
            your password.
          </p>
          <div className="auth-aside-note">
            <ShieldCheck size={18} />
            <span>
              <b>Private &amp; secure</b>
              <small>Verification codes expire in 15 minutes.</small>
            </span>
          </div>
        </div>
        <div className="auth-card">
          <span className="eyebrow">PASSWORD RESET</span>
          {step === 'request' && (
            <>
              <h2>Reset your password</h2>
              <p>Enter your email address and we’ll send you a 6-digit verification code.</p>
              <form onSubmit={onRequest} className="form-stack">
                <label>
                  Email address
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="you@example.com"
                    autoComplete="email"
                  />
                </label>
                {error && (
                  <div role="alert" className="form-error">
                    {error}
                  </div>
                )}
                <button
                  className="btn btn-primary btn-full"
                  type="submit"
                  disabled={loading || !email.trim()}
                >
                  {loading ? 'Sending code…' : 'Send verification code'} <ArrowRight size={16} />
                </button>
              </form>
              <p className="auth-switch">
                Remember your password? <Link to="/login">Sign in</Link>
              </p>
            </>
          )}

          {step === 'verify' && (
            <>
              <h2>Enter verification code</h2>
              <p>
                We sent a 6-digit code to <strong>{email}</strong>.
              </p>
              {notice && (
                <p className="inline-notice" role="status">
                  {notice}
                </p>
              )}
              <form onSubmit={onReset} className="form-stack">
                <label>
                  6-digit code
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="123456"
                    required
                    maxLength={6}
                    style={{ letterSpacing: '4px', fontSize: '1.25rem', textAlign: 'center' }}
                  />
                  <small className="field-hint">Check your inbox and spam folder.</small>
                </label>
                <label>
                  New password
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={12}
                    placeholder="At least 12 characters"
                    autoComplete="new-password"
                  />
                  <small className="field-hint">Must be at least 12 characters.</small>
                </label>
                <label>
                  Confirm new password
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={12}
                    placeholder="Repeat new password"
                    autoComplete="new-password"
                  />
                </label>
                {error && (
                  <div role="alert" className="form-error">
                    {error}
                  </div>
                )}
                <button
                  className="btn btn-primary btn-full"
                  type="submit"
                  disabled={loading || otp.length !== 6 || password.length < 12}
                >
                  {loading ? 'Resetting password…' : 'Update password'} <Check size={16} />
                </button>
              </form>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginTop: '1rem',
                  fontSize: '0.875rem',
                }}
              >
                <button type="button" className="text-button" onClick={() => setStep('request')}>
                  ← Change email
                </button>
                <button
                  type="button"
                  className="text-button"
                  onClick={onRequest}
                  disabled={loading}
                >
                  Resend code
                </button>
              </div>
            </>
          )}

          {step === 'success' && (
            <div style={{ textAlign: 'center', padding: '1rem 0' }}>
              <div
                style={{
                  display: 'inline-flex',
                  padding: '1rem',
                  borderRadius: '50%',
                  backgroundColor: '#eef5f1',
                  color: '#1e3d34',
                  marginBottom: '1rem',
                }}
              >
                <Check size={32} />
              </div>
              <h2>Password updated!</h2>
              <p>
                Your password has been reset successfully. You can now sign in with your new
                credentials.
              </p>
              <div style={{ marginTop: '1.5rem' }}>
                <Link to="/login" className="btn btn-primary btn-full">
                  Sign in to your care space <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

function ChatPage() {
  const { id: routeId } = useParams();
  const [conversationId, setConversationId] = useState<string | undefined>(routeId);
  const [messages, setMessages] = useState<
    Array<{ role: 'user' | 'assistant'; text: string; assessment?: ChatResult['assessment'] }>
  >([]);
  const [input, setInput] = useState('');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const [title, setTitle] = useState('A new conversation');
  const navigate = useNavigate();
  const scrollRef = { current: null as HTMLDivElement | null };
  useEffect(() => {
    setConversationId(routeId);
    if (routeId) {
      void request<{
        conversation: { title: string };
        messages: Array<{
          role: 'user' | 'assistant';
          text: string;
          assessment?: ChatResult['assessment'];
        }>;
      }>(`/conversations/${routeId}`)
        .then((data) => {
          setMessages(data.messages);
          setTitle(data.conversation.title);
        })
        .catch(() => setError('This conversation is not available.'));
    } else {
      setMessages([]);
      setTitle('A new conversation');
    }
  }, [routeId]);
  const send = async (text: string) => {
    const clean = text.trim();
    if (!clean || pending) return;
    setInput('');
    setError('');
    setMessages((prev) => [...prev, { role: 'user', text: clean }]);
    setPending(true);
    try {
      const result = await chat(clean, conversationId);
      setConversationId(result.conversationId);
      setTitle(result.title);
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', text: result.message.text, assessment: result.assessment },
      ]);
      if (!routeId) navigate(`/chat/${result.conversationId}`, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Your message could not be sent.');
    } finally {
      setPending(false);
    }
  };
  const saveSummary = async (assessment: ChatResult['assessment']) => {
    try {
      await request('/health-summaries', {
        method: 'POST',
        body: JSON.stringify({
          conversationId,
          content: `AI-generated informational summary — not a diagnosis.\n\nReported symptoms: ${assessment.symptomSummary.join('; ') || 'Not summarized'}\n\nPossible explanations: ${assessment.possibleCauses.map((c) => `${c.name}: ${c.explanation}`).join('; ') || 'No explanations generated'}\n\nUrgency: ${assessment.urgency}. ${assessment.urgencyExplanation}\n\nRecommended specialty: ${assessment.recommendedSpecialties.join(', ') || 'Not specified'}`,
          urgency: assessment.urgency,
          specialties: assessment.recommendedSpecialties,
        }),
      });
      setError('Summary saved to your health summaries.');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not save summary.');
    }
  };
  return (
    <div className="chat-layout">
      <div className="chat-history-panel">
        <div className="chat-history-head">
          <span className="eyebrow">YOUR CONVERSATIONS</span>
          <Link to="/chat" className="icon-button" aria-label="New conversation">
            <Plus size={18} />
          </Link>
        </div>
        <form
          className="history-search"
          onSubmit={(e) => {
            e.preventDefault();
            const q = new FormData(e.currentTarget).get('q');
            navigate(`/history?search=${encodeURIComponent(String(q ?? ''))}`);
          }}
        >
          <Search size={15} />
          <input name="q" placeholder="Search chats" aria-label="Search conversations" />
        </form>
        <Link to="/history" className="history-all">
          Browse all conversations <ArrowRight size={14} />
        </Link>
        <p className="chat-side-info">
          <ShieldCheck size={14} /> Only you can see your conversations.
        </p>
      </div>
      <div className="chat-main">
        <div className="chat-titlebar">
          <div>
            <span className="eyebrow">PRIVATE HEALTH CONVERSATION</span>
            <h1>{title}</h1>
          </div>
          <button
            className="icon-button"
            onClick={() => navigate('/chat')}
            title="New conversation"
          >
            <Plus size={18} />
          </button>
        </div>
        <div
          className="chat-messages"
          ref={(el) => {
            scrollRef.current = el;
          }}
        >
          {messages.length === 0 && !pending && (
            <div className="chat-empty">
              <span className="chat-sparkle">
                <Sparkles size={23} />
              </span>
              <h2>What’s on your mind?</h2>
              <p>
                Share a little about what you’ve been experiencing. We can explore general
                information together.
              </p>
              <div className="prompt-grid">
                {[
                  'I’ve had a headache for three days.',
                  'I’ve been feeling unusually tired.',
                  'What could be causing my skin rash?',
                  'What kind of doctor should I see for stomach pain?',
                ].map((prompt) => (
                  <button key={prompt} onClick={() => void send(prompt)}>
                    {prompt}
                    <ArrowUpRight size={14} />
                  </button>
                ))}
              </div>
            </div>
          )}
          {messages.map((message, index) => (
            <div className={`chat-message ${message.role}`} key={index}>
              <span className="chat-avatar">
                {message.role === 'assistant' ? <Sparkles size={15} /> : <span>Y</span>}
              </span>
              <div className="chat-bubble">
                <div className="message-author">
                  {message.role === 'assistant' ? 'carekind assistant' : 'You'}
                </div>
                <p>{message.text}</p>
                {message.assessment && (
                  <div className={`assessment-card urgency-${message.assessment.urgency}`}>
                    <div className="urgency-heading">
                      <span>CARE GUIDANCE</span>
                      <b>
                        {message.assessment.urgency === 'routine'
                          ? 'Routine care'
                          : message.assessment.urgency === 'soon'
                            ? 'Medical evaluation soon'
                            : message.assessment.urgency === 'urgent'
                              ? 'Urgent evaluation'
                              : 'Emergency care'}
                      </b>
                    </div>
                    <p>{message.assessment.urgencyExplanation}</p>
                    {message.assessment.symptomSummary.length > 0 && (
                      <>
                        <b>What you shared</b>
                        <ul>
                          {message.assessment.symptomSummary.map((x) => (
                            <li key={x}>{x}</li>
                          ))}
                        </ul>
                      </>
                    )}
                    {message.assessment.possibleCauses.length > 0 && (
                      <>
                        <b>Possible explanations</b>
                        {message.assessment.possibleCauses.map((c) => (
                          <p key={c.name}>
                            <strong>{c.name}.</strong> {c.explanation}{' '}
                            <span className="uncertainty">{c.uncertainty}</span>
                          </p>
                        ))}
                      </>
                    )}
                    {message.assessment.recommendedActions.length > 0 && (
                      <>
                        <b>Suggested next steps</b>
                        <ul>
                          {message.assessment.recommendedActions.map((x) => (
                            <li key={x}>{x}</li>
                          ))}
                        </ul>
                      </>
                    )}
                    {message.assessment.redFlags.length > 0 && (
                      <>
                        <b>Get help promptly if</b>
                        <ul>
                          {message.assessment.redFlags.map((x) => (
                            <li key={x}>{x}</li>
                          ))}
                        </ul>
                      </>
                    )}
                    <div className="assessment-actions">
                      {message.assessment.showDoctorCTA && (
                        <Link
                          to={`/doctors${message.assessment.recommendedSpecialties[0] ? `?specialty=${encodeURIComponent(message.assessment.recommendedSpecialties[0])}` : ''}`}
                          className="btn btn-small btn-primary"
                        >
                          Find recommended doctors <ArrowRight size={14} />
                        </Link>
                      )}
                      {message.assessment.showHospitalCTA && (
                        <Link to="/hospitals" className="btn btn-small btn-outline">
                          Explore hospitals <ArrowRight size={14} />
                        </Link>
                      )}
                      <button
                        className="text-button"
                        onClick={() => void saveSummary(message.assessment!)}
                      >
                        Save summary
                      </button>
                    </div>
                  </div>
                )}
                <small className="message-disclaimer">
                  AI health information, not a medical diagnosis.
                </small>
              </div>
            </div>
          ))}
          {pending && (
            <div className="chat-message assistant">
              <span className="chat-avatar">
                <Sparkles size={15} />
              </span>
              <div className="typing-indicator">
                <i />
                <i />
                <i />
                <span>Thinking carefully…</span>
              </div>
            </div>
          )}
        </div>
        <div className="chat-compose-wrap">
          <div className="chat-error" role="status">
            {error}
          </div>
          <form
            className="chat-compose"
            onSubmit={(e) => {
              e.preventDefault();
              void send(input);
            }}
          >
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  void send(input);
                }
              }}
              placeholder="Share what’s on your mind…"
              aria-label="Message the health assistant"
              rows={1}
              maxLength={4000}
            />
            <button
              type="submit"
              disabled={!input.trim() || pending}
              className="send-button"
              aria-label="Send message"
            >
              <ArrowRight size={18} />
            </button>
          </form>
          <p className="composer-note">
            <ShieldCheck size={13} /> AI health information, not a medical diagnosis. For
            emergencies, call 112 in India or your local emergency number.
          </p>
        </div>
      </div>
    </div>
  );
}
function HistoryPage() {
  const [search, setSearch] = useState('');
  const { data, error, isLoading, refetch } = useQuery({
    queryKey: ['conversations', search],
    queryFn: () =>
      request<{ items: Array<{ _id: string; title: string; lastActivityAt: string }> }>(
        `/conversations?search=${encodeURIComponent(search)}`,
      ),
  });
  const queryClient = useQueryClient();
  const [notice, setNotice] = useState('');
  const remove = async (id: string) => {
    if (!window.confirm('Delete this conversation? Its messages will be deleted too.')) return;
    try {
      await request(`/conversations/${id}`, { method: 'DELETE' });
      await queryClient.invalidateQueries({ queryKey: ['conversations'] });
      setNotice('Conversation deleted.');
    } catch (e) {
      setNotice(e instanceof Error ? e.message : 'Could not delete conversation.');
    }
  };
  return (
    <>
      <PageTitle
        eyebrow="YOUR HEALTH SPACE"
        title="Chat history"
        copy="Your private conversations, whenever you need them."
        action={
          <Link to="/chat" className="btn btn-primary">
            <Plus size={16} /> New chat
          </Link>
        }
      />
      <div className="filter-search">
        <Search size={17} />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search conversations…"
          aria-label="Search conversations"
        />
      </div>
      {notice && (
        <p role="status" className="inline-notice">
          {notice}
        </p>
      )}
      {isLoading ? (
        <p className="loading-copy">Loading your history…</p>
      ) : error ? (
        <div className="inline-notice" role="alert">
          Could not load conversations.{' '}
          <button className="text-button" onClick={() => void refetch()}>
            Try again
          </button>
        </div>
      ) : data?.items.length ? (
        <div className="list-panel">
          {data.items.map((c) => (
            <div className="history-item" key={c._id}>
              <Link to={`/chat/${c._id}`} className="history-open">
                <span className="conversation-dot">
                  <MessageCircle size={17} />
                </span>
                <span>
                  <b>{c.title}</b>
                  <small>{new Date(c.lastActivityAt).toLocaleString()}</small>
                </span>
                <ArrowRight size={16} />
              </Link>
              <button className="text-button danger-text" onClick={() => void remove(c._id)}>
                Delete
              </button>
            </div>
          ))}
        </div>
      ) : (
        <Empty
          icon={<MessageCircle />}
          title={search ? 'No matches found' : 'No conversations yet'}
          copy={
            search
              ? 'Try another search.'
              : 'Start a private conversation to see your chat history here.'
          }
          link="/chat"
          label="Start a conversation"
        />
      )}
    </>
  );
}
function Empty({
  icon,
  title,
  copy,
  link,
  label,
}: {
  icon: React.ReactNode;
  title: string;
  copy: string;
  link?: string;
  label?: string;
}) {
  return (
    <div className="empty-state page-empty">
      <span className="empty-icon">{icon}</span>
      <h3>{title}</h3>
      <p>{copy}</p>
      {link && (
        <Link className="btn btn-outline" to={link}>
          {label} <ArrowRight size={15} />
        </Link>
      )}
    </div>
  );
}
function DoctorsPage() {
  const [q, setQ] = useState('');
  const [specialty, setSpecialty] = useState(
    new URLSearchParams(location.search).get('specialty') ?? '',
  );
  const [city, setCity] = useState('');
  const { data, error, isLoading, refetch } = useQuery({
    queryKey: ['doctors', q, specialty, city],
    queryFn: () =>
      request<{ items: DoctorCard[]; source: string }>(
        `/doctors?q=${encodeURIComponent(q)}&specialty=${encodeURIComponent(specialty)}&city=${encodeURIComponent(city)}`,
      ),
  });
  return (
    <>
      <PageTitle
        eyebrow="DOCTOR DISCOVERY"
        title="Find the right doctor."
        copy="Explore sample profiles and providers who have shared their profile. Pending verification is clearly marked."
      />
      <div className="discovery-tools">
        <label className="filter-search">
          <Search size={17} />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by doctor name"
          />
        </label>
        <select
          aria-label="Filter by specialty"
          value={specialty}
          onChange={(e) => setSpecialty(e.target.value)}
        >
          <option value="">All specialties</option>
          {[
            'General Physician',
            'Cardiologist',
            'Dermatologist',
            'Orthopedic',
            'Pediatrician',
            'Neurologist',
            'Gynecologist',
            'ENT Specialist',
          ].map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
        <label className="filter-search city-search">
          <Compass size={16} />
          <input
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="City or locality"
          />
        </label>
      </div>
      <div className="results-note">
        <span>{data?.items.length ?? 0} profiles</span>
        <span>Pending providers cannot be booked until verified.</span>
      </div>
      {isLoading ? (
        <div className="doctor-grid">
          {[1, 2, 3].map((i) => (
            <div className="skeleton-card" key={i} />
          ))}
        </div>
      ) : error ? (
        <div role="alert" className="inline-notice">
          Unable to load profiles.{' '}
          <button className="text-button" onClick={() => void refetch()}>
            Try again
          </button>
        </div>
      ) : data?.items.length ? (
        <div className="doctor-grid">
          {data.items.map((doc) => (
            <DoctorTile doc={doc} key={doc._id} />
          ))}
        </div>
      ) : (
        <Empty
          icon={<Stethoscope />}
          title="No profiles found"
          copy="Try a broader search or choose another specialty."
        />
      )}
    </>
  );
}
function DoctorTile({ doc }: { doc: DoctorCard }) {
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);
  const doSave = async () => {
    setBusy(true);
    try {
      await request(`/saved/doctors/${doc._id}`, { method: saved ? 'DELETE' : 'POST' });
      setSaved(!saved);
    } catch (e) {
      if (e instanceof Error && e.message === 'Authentication required') location.assign('/login');
      else alert(e instanceof Error ? e.message : 'Could not save doctor');
    } finally {
      setBusy(false);
    }
  };
  return (
    <article className="doctor-card">
      <div className="doctor-card-top">
        <span className="doctor-avatar">
          <Stethoscope size={23} />
        </span>
        {doc.verification === 'approved' && (
          <button
            className={`save-button ${saved ? 'is-saved' : ''}`}
            aria-label={saved ? 'Remove saved doctor' : 'Save doctor'}
            disabled={busy}
            onClick={() => void doSave()}
          >
            <Heart size={17} fill={saved ? 'currentColor' : 'none'} />
          </button>
        )}
      </div>
      <div className="doctor-meta">
        <span className="demo-badge">{doc.demo ? 'DEMO PROFILE' : 'PROVIDER PROFILE'}</span>
        <span className="verification-mark">
          <ShieldCheck size={13} />
          {doc.verification === 'approved' ? 'Verified' : 'Pending review'}
        </span>
      </div>
      <h3>{doc.user?.name ?? 'Doctor'}</h3>
      <p className="doctor-specialty">{doc.specialty}</p>
      <p className="qualifications">
        {doc.qualifications?.join(' · ') ||
          (doc.demo ? 'Sample profile' : 'Qualifications not provided')}{' '}
        · {doc.yearsExperience} years {doc.demo ? 'sample experience' : 'experience'}
      </p>
      <div className="doctor-stats">
        <span>
          <Star size={14} />
          {doc.review?.count
            ? `${doc.review.average?.toFixed(1)} (${doc.review.count})`
            : 'No reviews'}
        </span>
        <span>
          ₹{doc.fee}
          {doc.demo ? ' sample' : ''}
        </span>
      </div>
      <div className="doctor-location">
        <Compass size={14} />
        {doc.city}
        {doc.demo ? ' · Sample location' : ''}
      </div>
      <div className="doctor-card-actions">
        <Link to={`/doctors/${doc._id}`} className="btn btn-outline">
          View profile
        </Link>
        {doc.verification === 'approved' ? (
          <Link to={`/doctors/${doc._id}#booking`} className="btn btn-primary">
            View availability <ArrowRight size={14} />
          </Link>
        ) : (
          <span className="pending-provider-note">Booking opens after verification</span>
        )}
      </div>
    </article>
  );
}
function DoctorDetail() {
  const { id } = useParams();
  const { data, error, isLoading } = useQuery({
    queryKey: ['doctor', id],
    queryFn: () =>
      request<{
        doctor: DoctorCard & { registrationNumber: string; languages: string[] };
        reviews: Array<{ rating: number; text: string }>;
      }>(`/doctors/${id}`),
  });
  const [slots, setSlots] = useState<string[]>([]);
  const [selected, setSelected] = useState('');
  const [reason, setReason] = useState('');
  const [notice, setNotice] = useState('');
  const [loadingSlots, setLoadingSlots] = useState(false);
  const loadSlots = async () => {
    setLoadingSlots(true);
    try {
      const result = await request<{ dates: Array<{ date: string; slots: string[] }> }>(
        `/doctors/${id}/availability`,
      );
      setSlots(result.dates.flatMap((d) => d.slots));
    } catch (e) {
      setNotice(e instanceof Error ? e.message : 'Availability is unavailable.');
    } finally {
      setLoadingSlots(false);
    }
  };
  const book = async () => {
    if (!selected || reason.trim().length < 3) return;
    try {
      const result = await request<{ appointment: { reference: string } }>('/appointments', {
        method: 'POST',
        body: JSON.stringify({
          doctorId: id,
          startsAt: selected,
          consultationType: 'in-person',
          reason,
        }),
      });
      setNotice(
        `Booking requested. Reference ${result.appointment.reference}. The doctor will confirm your appointment.`,
      );
      setSelected('');
    } catch (e) {
      setNotice(e instanceof Error ? e.message : 'Could not book appointment.');
    }
  };
  if (isLoading) return <p className="loading-copy">Loading doctor profile…</p>;
  if (error || !data)
    return (
      <Empty
        icon={<Stethoscope />}
        title="Profile unavailable"
        copy="This profile could not be found."
        link="/doctors"
        label="Back to doctors"
      />
    );
  const doc = data.doctor;
  return (
    <>
      <Link className="back-link" to="/doctors">
        ← All doctors
      </Link>
      <section className="doctor-profile-card">
        <div className="profile-hero">
          <span className="doctor-avatar large">
            <Stethoscope size={29} />
          </span>
          <div>
            <span className="demo-badge">
              {doc.demo ? 'FICTIONAL DEMO PROFILE' : 'PROVIDER PROFILE'}
            </span>
            <h1>{doc.user?.name}</h1>
            <p>
              {doc.specialty} · {doc.city}
            </p>
          </div>
        </div>
        <p>
          {doc.bio ||
            (doc.demo
              ? 'Fictional sample profile for demonstration purposes. This is not a real or verified healthcare professional.'
              : 'The provider has not added a bio yet.')}
        </p>
        <div className="profile-facts">
          <span>
            <Clock3 />
            {doc.yearsExperience} years {doc.demo ? 'sample experience' : 'experience'}
          </span>
          <span>
            <ShieldCheck />
            Professional verification {doc.verification === 'approved' ? 'approved' : 'pending'}
          </span>
          <span>
            ₹{doc.fee}
            {doc.demo ? ' sample consultation fee' : ' consultation fee'}
          </span>
        </div>
        {doc.demo ? (
          <p className="demo-note">
            This profile and its professional details are fictional sample data.
          </p>
        ) : doc.verification === 'pending' ? (
          <p className="demo-note">
            This provider has submitted a profile. It is awaiting verification; appointments are
            unavailable until review is complete.
          </p>
        ) : (
          <p className="demo-note">
            Provider-submitted profile. Check professional credentials independently.
          </p>
        )}
      </section>
      {doc.verification === 'approved' ? (
        <section className="booking-panel" id="booking">
          <div>
            <span className="eyebrow">APPOINTMENT REQUEST</span>
            <h2>Explore available times</h2>
            <p>
              {doc.demo
                ? 'Availability is generated from the demo profile schedule.'
                : 'Availability is based on the provider’s published schedule.'}{' '}
              Booking requests require doctor confirmation.
            </p>
          </div>
          <button
            className="btn btn-outline"
            disabled={loadingSlots}
            onClick={() => void loadSlots()}
          >
            {loadingSlots ? 'Checking…' : 'Check availability'} <CalendarDays size={16} />
          </button>
          {slots.length > 0 && (
            <>
              <div className="slot-grid">
                {slots.map((slot) => (
                  <button
                    key={slot}
                    className={`slot-button ${selected === slot ? 'selected' : ''}`}
                    onClick={() => setSelected(slot)}
                  >
                    {new Date(slot).toLocaleString(undefined, {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit',
                    })}
                  </button>
                ))}
              </div>
              <label>
                What would you like to discuss?
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  maxLength={1000}
                  placeholder="Share a brief reason for the visit…"
                />
              </label>
              <button
                className="btn btn-primary"
                disabled={!selected || reason.trim().length < 3}
                onClick={() => void book()}
              >
                Request appointment <ArrowRight size={15} />
              </button>
            </>
          )}
          {notice && (
            <p role="status" className="inline-notice">
              {notice}
            </p>
          )}
        </section>
      ) : (
        <p className="inline-notice">
          Appointment booking will be available after this provider is verified.
        </p>
      )}
      <section className="section compact-section">
        <span className="eyebrow">PATIENT REVIEWS</span>
        <h2>Reviews from appointments</h2>
        {data.reviews.length ? (
          data.reviews.map((r, i) => (
            <p key={i}>
              <Star size={14} /> {r.rating}/5 — {r.text || 'Demo review'}
            </p>
          ))
        ) : (
          <p>No patient reviews yet.</p>
        )}
      </section>
    </>
  );
}
function HospitalsPage() {
  const [q, setQ] = useState('');
  const [city, setCity] = useState('');
  const { data, error, isLoading, refetch } = useQuery({
    queryKey: ['hospitals', q, city],
    queryFn: () =>
      request<{ items: HospitalCard[]; source: string }>(
        `/hospitals?q=${encodeURIComponent(q)}&city=${encodeURIComponent(city)}`,
      ),
  });
  return (
    <>
      <PageTitle
        eyebrow="HOSPITAL DISCOVERY"
        title="Explore care nearby."
        copy="Browse healthcare organizations, hospitals, and listed medical departments."
      />
      <div className="discovery-tools">
        <label className="filter-search">
          <Search size={17} />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search hospitals" />
        </label>
        <label className="filter-search city-search">
          <Compass size={16} />
          <input
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="City or locality"
          />
        </label>
      </div>
      <div className="results-note">
        <span>{data?.items.length ?? 0} hospitals listed</span>
        <span>Registered organizations and sample locations</span>
      </div>
      {isLoading ? (
        <p className="loading-copy">Loading locations…</p>
      ) : error ? (
        <div className="inline-notice" role="alert">
          Could not load hospitals.{' '}
          <button className="text-button" onClick={() => void refetch()}>
            Try again
          </button>
        </div>
      ) : (
        <div className="hospital-grid">
          {data?.items.map((h) => (
            <HospitalTile key={h._id} hospital={h} />
          ))}
        </div>
      )}
      {data?.items.length === 0 && (
        <Empty icon={<HospitalIcon />} title="No hospitals found" copy="Try another search." />
      )}
    </>
  );
}
function HospitalTile({ hospital }: { hospital: HospitalCard }) {
  const [saved, setSaved] = useState(false);
  const save = async () => {
    try {
      await request(`/saved/hospitals/${hospital._id}`, { method: saved ? 'DELETE' : 'POST' });
      setSaved(!saved);
    } catch (e) {
      if (e instanceof Error && e.message === 'Authentication required') location.assign('/login');
      else alert(e instanceof Error ? e.message : 'Could not save hospital');
    }
  };
  return (
    <article className="hospital-card">
      <div className="hospital-art">
        <span className="hospital-symbol">
          <HospitalIcon size={27} />
        </span>
        <span className="demo-badge">{hospital.demo ? 'DEMO LOCATION' : 'HOSPITAL PROFILE'}</span>
        <button
          className={`save-button ${saved ? 'is-saved' : ''}`}
          aria-label="Save hospital"
          onClick={() => void save()}
        >
          <Heart size={17} fill={saved ? 'currentColor' : 'none'} />
        </button>
      </div>
      <div className="hospital-body">
        <div className="doctor-meta">
          <span className="verification-mark">
            <ShieldCheck size={13} />
            {hospital.verification === 'approved' ? 'Verified' : 'Pending review'}
          </span>
        </div>
        <h3>{hospital.name}</h3>
        <p className="doctor-location">
          <Compass size={14} />
          {hospital.city}
          {hospital.demo ? ' · Sample location' : ''}
        </p>
        <p>{hospital.description || 'Healthcare provider location.'}</p>
        {hospital.phone && <p className="doctor-location">Phone: {hospital.phone}</p>}
        <b className="minor-heading">Listed specialties</b>
        <div className="tag-list">
          {hospital.specialties?.length ? (
            hospital.specialties.map((s) => <span key={s}>{s}</span>)
          ) : (
            <span>General</span>
          )}
        </div>
        <b className="minor-heading">Facilities</b>
        <div className="tag-list">
          {hospital.facilities?.length ? (
            hospital.facilities.map((f) => <span key={f}>{f}</span>)
          ) : (
            <span>General care</span>
          )}
        </div>
        <p className="unverified-note">
          <ShieldCheck size={14} />{' '}
          {hospital.emergencyServicesVerified
            ? 'Emergency services verified'
            : 'Emergency services not verified'}
        </p>
        <div className="doctor-card-actions">
          <button className="btn btn-outline" onClick={() => void save()}>
            {saved ? 'Saved' : 'Save hospital'} <Heart size={14} />
          </button>
          <Link to={`/hospitals/${hospital._id}`} className="btn btn-primary">
            Explore <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </article>
  );
}
function HospitalDetail() {
  const { id } = useParams();
  const { data, error, isLoading } = useQuery({
    queryKey: ['hospital', id],
    queryFn: () => request<{ hospital: HospitalCard; doctors: DoctorCard[] }>(`/hospitals/${id}`),
  });
  if (isLoading) return <p>Loading…</p>;
  if (error || !data)
    return (
      <Empty
        icon={<HospitalIcon />}
        title="Location unavailable"
        copy="This profile could not be found."
        link="/hospitals"
        label="Back to hospitals"
      />
    );
  return (
    <>
      <Link className="back-link" to="/hospitals">
        ← All hospitals
      </Link>
      <PageTitle
        eyebrow={data.hospital.demo ? 'FICTIONAL DEMO LOCATION' : 'HOSPITAL PROFILE'}
        title={data.hospital.name}
        copy={`${data.hospital.city}${data.hospital.demo ? ' · Sample location' : ''}`}
      />
      <div className="doctor-verification">
        <ShieldCheck size={19} />
        <span>
          <b>
            Verification:{' '}
            {data.hospital.verification === 'approved' ? 'Verified Organization' : 'Pending Review'}
          </b>
          <small>
            {data.hospital.demo
              ? 'Fictional sample profile for product demonstration.'
              : data.hospital.verification === 'approved'
                ? 'Verified healthcare provider organization.'
                : 'Provider-submitted organization profile awaiting verification review.'}
          </small>
        </span>
      </div>
      <section className="booking-panel">
        <h2>Organization overview</h2>
        <p>{data.hospital.description || 'No description provided.'}</p>
        {data.hospital.phone && (
          <p className="doctor-location">
            <strong>Contact:</strong> {data.hospital.phone}
          </p>
        )}
        <h3>Listed specialties</h3>
        <div className="tag-list">
          {data.hospital.specialties?.length ? (
            data.hospital.specialties.map((s) => <span key={s}>{s}</span>)
          ) : (
            <span>General</span>
          )}
        </div>
        <h3>Facilities & services</h3>
        <div className="tag-list">
          {data.hospital.facilities?.length ? (
            data.hospital.facilities.map((f) => <span key={f}>{f}</span>)
          ) : (
            <span>General care</span>
          )}
        </div>
        <p>
          Emergency services:{' '}
          {data.hospital.emergencyServicesVerified
            ? 'Emergency services verified'
            : 'Emergency services not verified'}
          .
        </p>
      </section>
      <section className="compact-section">
        <h2>Associated doctors</h2>
        <div className="doctor-grid">
          {data.doctors?.length ? (
            data.doctors.map((doc) => <DoctorTile key={doc._id} doc={doc} />)
          ) : (
            <p>No associated doctors currently listed for this specialty set.</p>
          )}
        </div>
      </section>
    </>
  );
}
function AppointmentsPage() {
  const queryClient = useQueryClient();
  const { data, error, isLoading, refetch } = useQuery({
    queryKey: ['appointments'],
    queryFn: () => request<{ items: Array<Record<string, unknown>> }>('/appointments'),
  });
  const [notice, setNotice] = useState('');
  const cancel = async (id: string) => {
    try {
      await request(`/appointments/${id}/cancel`, {
        method: 'PATCH',
        body: JSON.stringify({ reason: 'Cancelled by patient' }),
      });
      await queryClient.invalidateQueries({ queryKey: ['appointments'] });
      setNotice('Appointment cancelled.');
    } catch (e) {
      setNotice(e instanceof Error ? e.message : 'Could not cancel.');
    }
  };
  return (
    <>
      <PageTitle
        eyebrow="YOUR APPOINTMENTS"
        title="Appointments"
        copy="Your upcoming visits and appointment history."
        action={
          <Link className="btn btn-primary" to="/doctors">
            Find a doctor <ArrowRight size={15} />
          </Link>
        }
      />
      <div className="tab-row">
        <span className="active-tab">All appointments</span>
      </div>
      {notice && (
        <p role="status" className="inline-notice">
          {notice}
        </p>
      )}
      {isLoading ? (
        <p>Loading appointments…</p>
      ) : error ? (
        <div className="inline-notice" role="alert">
          Could not load appointments.{' '}
          <button className="text-button" onClick={() => void refetch()}>
            Try again
          </button>
        </div>
      ) : data?.items.length ? (
        <div className="list-panel">
          {data.items.map((a, i) => (
            <div className="appointment-list-item" key={String(a._id ?? i)}>
              <span className="appointment-icon">
                <CalendarDays />
              </span>
              <span className="appointment-info">
                <b>
                  {(a.doctor as { user?: { name?: string } })?.user?.name ?? 'Doctor appointment'}
                </b>
                <small>
                  {new Date(String(a.startsAt)).toLocaleString()} · {String(a.consultationType)} · ₹
                  {String(a.fee)}
                </small>
                <small>Reference {String(a.reference)}</small>
              </span>
              <span className={`status-pill status-${String(a.status)}`}>{String(a.status)}</span>
              {['pending', 'confirmed'].includes(String(a.status)) && (
                <button
                  className="text-button danger-text"
                  onClick={() => void cancel(String(a._id))}
                >
                  Cancel
                </button>
              )}
            </div>
          ))}
        </div>
      ) : (
        <Empty
          icon={<CalendarDays />}
          title="No appointments yet"
          copy="When you book an appointment, the details will show up here."
          link="/doctors"
          label="Explore doctors"
        />
      )}
    </>
  );
}
function SummariesPage() {
  const queryClient = useQueryClient();
  const { data, error, isLoading, refetch } = useQuery({
    queryKey: ['summaries'],
    queryFn: () =>
      request<{
        items: Array<{ _id: string; content: string; createdAt: string; urgency?: string }>;
      }>('/health-summaries'),
  });
  const [notice, setNotice] = useState('');
  const remove = async (id: string) => {
    try {
      await request(`/health-summaries/${id}`, { method: 'DELETE' });
      await queryClient.invalidateQueries({ queryKey: ['summaries'] });
    } catch (e) {
      setNotice(e instanceof Error ? e.message : 'Could not delete summary.');
    }
  };
  return (
    <>
      <PageTitle
        eyebrow="YOUR HEALTH SPACE"
        title="Health summaries"
        copy="Informational summaries you chose to save. These are not medical records or diagnoses."
      />
      {notice && (
        <div className="inline-notice" role="alert">
          {notice}
        </div>
      )}
      {isLoading ? (
        <p>Loading summaries…</p>
      ) : error ? (
        <div className="inline-notice" role="alert">
          Could not load summaries.{' '}
          <button className="text-button" onClick={() => void refetch()}>
            Try again
          </button>
        </div>
      ) : data?.items.length ? (
        <div className="summary-grid">
          {data.items.map((s) => (
            <article className="summary-card" key={s._id}>
              <span className="eyebrow">
                AI-GENERATED INFORMATION · {new Date(s.createdAt).toLocaleDateString()}
              </span>
              <p>{s.content}</p>
              <button className="text-button danger-text" onClick={() => void remove(s._id)}>
                Delete summary
              </button>
            </article>
          ))}
        </div>
      ) : (
        <Empty
          icon={<Heart />}
          title="Nothing saved yet"
          copy="Save a summary from a conversation to find it here."
          link="/chat"
          label="Start a conversation"
        />
      )}
    </>
  );
}
function SavedPage() {
  const [tab, setTab] = useState<'doctors' | 'hospitals'>('doctors');
  const queryClient = useQueryClient();
  const [notice, setNotice] = useState('');
  const { data, error, isLoading, refetch } = useQuery({
    queryKey: ['saved', tab],
    queryFn: () =>
      request<{ items: Array<{ entity: DoctorCard | HospitalCard }> }>(`/saved/${tab}`),
  });
  const unsave = async (entity: DoctorCard | HospitalCard) => {
    try {
      await request(`/saved/${tab}/${entity._id}`, { method: 'DELETE' });
      await queryClient.invalidateQueries({ queryKey: ['saved'] });
    } catch (e) {
      setNotice(e instanceof Error ? e.message : 'Could not remove saved item.');
    }
  };
  return (
    <>
      <PageTitle
        eyebrow="YOUR CARE SPACE"
        title="Saved care"
        copy="The people and places you’d like to come back to."
      />
      {notice && (
        <p role="status" className="inline-notice">
          {notice}
        </p>
      )}
      <div className="tab-row">
        <button onClick={() => setTab('doctors')} className={tab === 'doctors' ? 'active-tab' : ''}>
          Doctors
        </button>
        <button
          onClick={() => setTab('hospitals')}
          className={tab === 'hospitals' ? 'active-tab' : ''}
        >
          Hospitals
        </button>
      </div>
      {isLoading ? (
        <p>Loading saved items…</p>
      ) : error ? (
        <div className="inline-notice" role="alert">
          Could not load saved items.{' '}
          <button className="text-button" onClick={() => void refetch()}>
            Try again
          </button>
        </div>
      ) : data?.items.length ? (
        <div className="list-panel">
          {data.items.map(({ entity }) => (
            <div className="history-item" key={entity._id}>
              <Link
                className="history-open"
                to={tab === 'doctors' ? `/doctors/${entity._id}` : `/hospitals/${entity._id}`}
              >
                <span className="conversation-dot">
                  {tab === 'doctors' ? <Stethoscope size={16} /> : <HospitalIcon size={16} />}
                </span>
                <span>
                  <b>
                    {'specialty' in entity ? (entity.user?.name ?? 'Demo doctor') : entity.name}
                  </b>
                  <small>{'specialty' in entity ? entity.specialty : entity.city}</small>
                </span>
                <ArrowRight size={16} />
              </Link>
              <button className="text-button danger-text" onClick={() => void unsave(entity)}>
                Remove
              </button>
            </div>
          ))}
        </div>
      ) : (
        <Empty
          icon={tab === 'doctors' ? <Stethoscope /> : <HospitalIcon />}
          title={`No saved ${tab} yet`}
          copy="Use the bookmark icon on a profile to save it here."
          link={tab === 'doctors' ? '/doctors' : '/hospitals'}
          label={`Explore ${tab}`}
        />
      )}
    </>
  );
}
function DoctorPortal({ tab }: { tab: 'home' | 'appointments' | 'profile' }) {
  const queryClient = useQueryClient();
  const { data: meData } = useQuery({ queryKey: ['session'], queryFn: me });
  const { data, error, isLoading, refetch } = useQuery({
    queryKey: ['appointments'],
    queryFn: () => request<{ items: Array<Record<string, unknown>> }>('/appointments'),
    enabled: tab !== 'profile',
  });
  const { data: profile } = useQuery({
    queryKey: ['doctor-profile'],
    queryFn: () =>
      request<{
        doctor: DoctorCard & {
          verification: string;
          workingDays: number[];
          startHour: number;
          endHour: number;
          slotMinutes: number;
        };
      }>('/auth/me').then(() =>
        request<{
          doctor: DoctorCard & {
            verification: string;
            workingDays: number[];
            startHour: number;
            endHour: number;
            slotMinutes: number;
          };
        }>('/doctors/mine'),
      ),
    enabled: tab === 'profile',
    retry: false,
  });
  const [notice, setNotice] = useState('');
  const update = async (id: string, status: string) => {
    try {
      await request(`/doctor/appointments/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
      await queryClient.invalidateQueries({ queryKey: ['appointments'] });
      setNotice(`Appointment ${status}.`);
    } catch (e) {
      setNotice(e instanceof Error ? e.message : 'Could not update appointment.');
    }
  };
  const [specialty, setSpecialty] = useState('');
  const [city, setCity] = useState('');
  const [fee, setFee] = useState('');
  const [days, setDays] = useState('1,2,3,4,5');
  const [start, setStart] = useState('9');
  const [end, setEnd] = useState('17');
  const [duration, setDuration] = useState('30');
  useEffect(() => {
    if (profile?.doctor) {
      setSpecialty(profile.doctor.specialty);
      setCity(profile.doctor.city);
      setFee(String(profile.doctor.fee));
      setDays(profile.doctor.workingDays.join(','));
      setStart(String(profile.doctor.startHour));
      setEnd(String(profile.doctor.endHour));
      setDuration(String(profile.doctor.slotMinutes));
    }
  }, [profile]);
  const saveProfile = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await request('/doctor/profile', {
        method: 'PATCH',
        body: JSON.stringify({ specialty, city, fee: Number(fee) }),
      });
      setNotice('Profile updated.');
    } catch (e) {
      setNotice(e instanceof Error ? e.message : 'Could not save profile.');
    }
  };
  const saveAvailability = async () => {
    try {
      await request('/doctor/availability', {
        method: 'PUT',
        body: JSON.stringify({
          workingDays: days.split(',').map(Number),
          startHour: Number(start),
          endHour: Number(end),
          slotMinutes: Number(duration),
        }),
      });
      setNotice('Availability saved.');
    } catch (e) {
      setNotice(e instanceof Error ? e.message : 'Could not save availability.');
    }
  };
  return (
    <>
      <PageTitle
        eyebrow="DOCTOR PORTAL"
        title={
          tab === 'profile'
            ? 'Your profile & availability'
            : tab === 'appointments'
              ? 'Your appointments'
              : 'Welcome to your practice'
        }
        copy={
          meData?.doctor?.verification === 'pending'
            ? 'Save your profile details to appear in the directory. Appointment booking remains unavailable until administrator verification.'
            : 'Manage your appointments and profile.'
        }
      />
      <div className="doctor-verification">
        <ShieldCheck size={19} />
        <span>
          <b>Verification: {meData?.doctor?.verification ?? 'Pending'}</b>
          <small>
            Patients can see your submitted profile while it is pending review; appointment booking
            opens after approval.
          </small>
        </span>
      </div>
      {notice && (
        <p role="status" className="inline-notice">
          {notice}
        </p>
      )}
      {tab === 'profile' ? (
        <div className="doctor-manage-grid">
          <form className="booking-panel form-stack" onSubmit={saveProfile}>
            <h2>Profile details</h2>
            <label>
              Specialty
              <input
                value={specialty}
                onChange={(e) => setSpecialty(e.target.value)}
                placeholder="Your specialty"
              />
            </label>
            <label>
              City or locality
              <input
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Your location"
              />
            </label>
            <label>
              Consultation fee
              <input type="number" value={fee} onChange={(e) => setFee(e.target.value)} min="0" />
            </label>
            <button className="btn btn-primary">Save profile</button>
          </form>
          <div className="booking-panel form-stack">
            <h2>Working hours</h2>
            <label>
              Working days <small>(0 Sunday – 6 Saturday)</small>
              <input
                value={days}
                onChange={(e) => setDays(e.target.value)}
                placeholder="1,2,3,4,5"
              />
            </label>
            <div className="form-row">
              <label>
                Start hour
                <input
                  type="number"
                  min="0"
                  max="23"
                  value={start}
                  onChange={(e) => setStart(e.target.value)}
                />
              </label>
              <label>
                End hour
                <input
                  type="number"
                  min="1"
                  max="24"
                  value={end}
                  onChange={(e) => setEnd(e.target.value)}
                />
              </label>
            </div>
            <label>
              Slot length (minutes)
              <input
                type="number"
                min="15"
                max="120"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
              />
            </label>
            <button className="btn btn-primary" onClick={() => void saveAvailability()}>
              Save availability
            </button>
          </div>
        </div>
      ) : isLoading ? (
        <p>Loading appointments…</p>
      ) : error ? (
        <div className="inline-notice" role="alert">
          Could not load appointments.{' '}
          <button className="text-button" onClick={() => void refetch()}>
            Retry
          </button>
        </div>
      ) : data?.items.length ? (
        <div className="list-panel">
          {data.items.map((a, i) => (
            <div className="appointment-list-item" key={String(a._id ?? i)}>
              <span className="appointment-icon">
                <CalendarDays />
              </span>
              <span className="appointment-info">
                <b>{(a.patient as { name?: string })?.name ?? 'Patient'}</b>
                <small>
                  {new Date(String(a.startsAt)).toLocaleString()} · {String(a.consultationType)}
                </small>
                <small>{String(a.reason)}</small>
              </span>
              <span className={`status-pill status-${String(a.status)}`}>{String(a.status)}</span>
              {a.status === 'pending' && (
                <>
                  <button
                    className="text-button"
                    onClick={() => void update(String(a._id), 'confirmed')}
                  >
                    Confirm
                  </button>
                  <button
                    className="text-button danger-text"
                    onClick={() => void update(String(a._id), 'rejected')}
                  >
                    Decline
                  </button>
                </>
              )}
              {a.status === 'confirmed' && (
                <button
                  className="text-button"
                  onClick={() => void update(String(a._id), 'completed')}
                >
                  Mark complete
                </button>
              )}
            </div>
          ))}
        </div>
      ) : (
        <Empty
          icon={<CalendarDays />}
          title="No appointments yet"
          copy="Patient appointment requests will appear here."
        />
      )}
    </>
  );
}
function HospitalPortal({ tab }: { tab: 'home' | 'profile' }) {
  const queryClient = useQueryClient();
  const { data: meData } = useQuery({ queryKey: ['session'], queryFn: me });
  const { data: profileData } = useQuery({
    queryKey: ['hospital-profile'],
    queryFn: () => request<{ hospital: HospitalCard }>('/hospital/profile'),
  });
  const [notice, setNotice] = useState('');
  const [name, setName] = useState('');
  const [city, setCity] = useState('');
  const [phone, setPhone] = useState('');
  const [description, setDescription] = useState('');
  const [specialties, setSpecialties] = useState('');
  const [facilities, setFacilities] = useState('');

  const currentHospital = profileData?.hospital || meData?.hospital;

  useEffect(() => {
    if (currentHospital) {
      setName(currentHospital.name || '');
      setCity(currentHospital.city || '');
      setPhone(currentHospital.phone || '');
      setDescription(currentHospital.description || '');
      setSpecialties(currentHospital.specialties?.join(', ') || '');
      setFacilities(currentHospital.facilities?.join(', ') || '');
    }
  }, [currentHospital]);

  const saveProfile = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await request('/hospital/profile', {
        method: 'PATCH',
        body: JSON.stringify({
          name: name.trim(),
          city: city.trim(),
          phone: phone.trim(),
          description: description.trim(),
          specialties: specialties
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean),
          facilities: facilities
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean),
        }),
      });
      await queryClient.invalidateQueries({ queryKey: ['hospital-profile'] });
      await queryClient.invalidateQueries({ queryKey: ['session'] });
      await queryClient.invalidateQueries({ queryKey: ['hospitals'] });
      setNotice('Hospital profile updated successfully.');
    } catch (e) {
      setNotice(e instanceof Error ? e.message : 'Could not save hospital profile.');
    }
  };

  const isPending = (currentHospital?.verification ?? 'pending') === 'pending';

  return (
    <>
      <PageTitle
        eyebrow="HOSPITAL PORTAL"
        title={tab === 'profile' ? 'Organization profile & facilities' : 'Hospital dashboard'}
        copy={
          isPending
            ? 'Your organization is listed in the directory. Profile verification is pending administrator review.'
            : 'Manage your organization details, medical specialties, and facilities.'
        }
        action={
          currentHospital?._id ? (
            <Link to={`/hospitals/${currentHospital._id}`} className="btn btn-outline">
              View public profile <ArrowRight size={14} />
            </Link>
          ) : undefined
        }
      />
      <div className="doctor-verification">
        <ShieldCheck size={19} />
        <span>
          <b>
            Verification:{' '}
            {currentHospital?.verification === 'approved'
              ? 'Approved Organization'
              : 'Pending Review'}
          </b>
          <small>
            {currentHospital?.verification === 'approved'
              ? 'Your hospital profile is fully verified. Patients can discover your profile, departments, and services.'
              : 'Your hospital profile has been submitted and is discoverable in the directory with a pending status badge.'}
          </small>
        </span>
      </div>
      {notice && (
        <p role="status" className="inline-notice">
          {notice}
        </p>
      )}
      {tab === 'profile' ? (
        <form className="booking-panel form-stack" onSubmit={saveProfile}>
          <h2>Organization details</h2>
          <label>
            Hospital or center name
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. City Care General Hospital"
              required
            />
          </label>
          <div className="form-row">
            <label>
              City or locality
              <input
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="e.g. Mumbai or Pune"
                required
              />
            </label>
            <label>
              Contact phone
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. +91 98765 43210"
              />
            </label>
          </div>
          <label>
            Overview & description
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your hospital, departments, patient care values..."
              rows={3}
            />
          </label>
          <label>
            Listed specialties <small>(comma separated)</small>
            <input
              value={specialties}
              onChange={(e) => setSpecialties(e.target.value)}
              placeholder="e.g. Cardiology, Neurology, Pediatrics, Orthopedics"
            />
          </label>
          <label>
            Facilities & services <small>(comma separated)</small>
            <input
              value={facilities}
              onChange={(e) => setFacilities(e.target.value)}
              placeholder="e.g. 24/7 Emergency, ICU, Diagnostic Lab, Blood Bank"
            />
          </label>
          <button className="btn btn-primary" type="submit">
            Save hospital profile
          </button>
        </form>
      ) : (
        <div className="doctor-manage-grid">
          <section className="booking-panel">
            <h2>Organization summary</h2>
            <p>
              <strong>Name:</strong> {currentHospital?.name || 'Not configured'}
            </p>
            <p>
              <strong>City:</strong> {currentHospital?.city || 'Not configured'}
            </p>
            {currentHospital?.phone && (
              <p>
                <strong>Phone:</strong> {currentHospital.phone}
              </p>
            )}
            <p>
              <strong>Description:</strong>{' '}
              {currentHospital?.description || 'No description added yet.'}
            </p>
            <div style={{ marginTop: '1.25rem' }}>
              <Link to="/hospital/profile" className="btn btn-primary">
                Edit profile & facilities <ArrowRight size={14} />
              </Link>
            </div>
          </section>
          <section className="booking-panel">
            <h2>Departments & facilities</h2>
            <b className="minor-heading">Specialties</b>
            <div className="tag-list" style={{ marginBottom: '1rem' }}>
              {currentHospital?.specialties?.length ? (
                currentHospital.specialties.map((s) => <span key={s}>{s}</span>)
              ) : (
                <span>General medical</span>
              )}
            </div>
            <b className="minor-heading">Facilities</b>
            <div className="tag-list">
              {currentHospital?.facilities?.length ? (
                currentHospital.facilities.map((f) => <span key={f}>{f}</span>)
              ) : (
                <span>Inpatient & Outpatient</span>
              )}
            </div>
          </section>
        </div>
      )}
    </>
  );
}

function AdminPage({
  tab,
}: {
  tab: 'overview' | 'doctors' | 'hospitals' | 'users' | 'appointments' | 'reviews';
}) {
  const queryClient = useQueryClient();
  const { data: doctors } = useQuery({
    queryKey: ['admin-doctors'],
    queryFn: () =>
      request<{
        items: Array<{
          _id: string;
          specialty: string;
          verification: string;
          user: { name: string; email: string };
        }>;
      }>('/admin/doctors?status=pending'),
    enabled: tab === 'overview' || tab === 'doctors',
  });
  const { data: hospitals } = useQuery({
    queryKey: ['admin-hospitals'],
    queryFn: () =>
      request<{ items: Array<HospitalCard & { user?: { name: string; email: string } }> }>(
        '/admin/hospitals?status=pending',
      ),
    enabled: tab === 'overview' || tab === 'hospitals',
  });
  const { data: users } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () =>
      request<{
        items: Array<{
          _id: string;
          name: string;
          email: string;
          role: string;
          suspended: boolean;
        }>;
      }>('/admin/users'),
    enabled: tab === 'users' || tab === 'overview',
  });
  const { data: appointments } = useQuery({
    queryKey: ['admin-appts'],
    queryFn: () => request<{ items: Array<Record<string, unknown>> }>('/admin/appointments'),
    enabled: tab === 'appointments' || tab === 'overview',
  });
  const { data: reviews } = useQuery({
    queryKey: ['admin-reviews'],
    queryFn: () =>
      request<{
        items: Array<{
          _id: string;
          rating: number;
          text: string;
          moderated: boolean;
          patient: { name: string };
        }>;
      }>('/admin/reviews'),
    enabled: tab === 'reviews',
  });
  const [notice, setNotice] = useState('');

  const verify = async (id: string, verification: string) => {
    try {
      await request(`/admin/doctors/${id}/verification`, {
        method: 'PATCH',
        body: JSON.stringify({ verification }),
      });
      await queryClient.invalidateQueries({ queryKey: ['admin-doctors'] });
      setNotice(`Doctor ${verification}.`);
    } catch (e) {
      setNotice(e instanceof Error ? e.message : 'Could not update verification.');
    }
  };

  const verifyHospital = async (id: string, verification: string) => {
    try {
      await request(`/admin/hospitals/${id}/verification`, {
        method: 'PATCH',
        body: JSON.stringify({ verification }),
      });
      await queryClient.invalidateQueries({ queryKey: ['admin-hospitals'] });
      await queryClient.invalidateQueries({ queryKey: ['hospitals'] });
      setNotice(`Hospital ${verification}.`);
    } catch (e) {
      setNotice(e instanceof Error ? e.message : 'Could not update hospital verification.');
    }
  };

  const suspend = async (id: string, suspended: boolean) => {
    try {
      await request(`/admin/users/${id}/suspension`, {
        method: 'PATCH',
        body: JSON.stringify({ suspended }),
      });
      await queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      setNotice('Account updated.');
    } catch (e) {
      setNotice(e instanceof Error ? e.message : 'Could not update account.');
    }
  };

  const moderate = async (id: string, moderated: boolean) => {
    try {
      await request(`/admin/reviews/${id}/moderation`, {
        method: 'PATCH',
        body: JSON.stringify({ moderated }),
      });
      await queryClient.invalidateQueries({ queryKey: ['admin-reviews'] });
      setNotice('Review moderation updated.');
    } catch (e) {
      setNotice(e instanceof Error ? e.message : 'Could not moderate review.');
    }
  };

  return (
    <>
      <PageTitle
        eyebrow="ADMIN PORTAL"
        title={
          tab === 'overview'
            ? 'Platform overview'
            : tab === 'doctors'
              ? 'Doctor verification'
              : tab === 'hospitals'
                ? 'Hospital verification'
                : tab === 'users'
                  ? 'People and accounts'
                  : tab === 'appointments'
                    ? 'All appointments'
                    : 'Review moderation'
        }
        copy="Restricted operations for authorized administrators."
      />
      {notice && (
        <p role="status" className="inline-notice">
          {notice}
        </p>
      )}
      {tab === 'overview' && (
        <div className="admin-metrics">
          <div>
            <span>
              <Users />
            </span>
            <b>{users?.items.length ?? '—'}</b>
            <small>Accounts</small>
          </div>
          <div>
            <span>
              <Stethoscope />
            </span>
            <b>{doctors?.items.length ?? '—'}</b>
            <small>Pending doctor reviews</small>
          </div>
          <div>
            <span>
              <HospitalIcon />
            </span>
            <b>{hospitals?.items.length ?? '—'}</b>
            <small>Pending hospital reviews</small>
          </div>
          <div>
            <span>
              <CalendarDays />
            </span>
            <b>{appointments?.items.length ?? '—'}</b>
            <small>Appointments</small>
          </div>
          <div>
            <span>
              <Activity />
            </span>
            <b>—</b>
            <small>AI usage (not connected)</small>
          </div>
        </div>
      )}
      {tab === 'overview' && (
        <p className="demo-note">
          Dashboard counts are capped list counts. AI telemetry and usage reporting have not been
          connected.
        </p>
      )}
      {(tab === 'overview' || tab === 'doctors') && (
        <section className="admin-section">
          <h2>Doctor verification queue</h2>
          {doctors?.items.length ? (
            doctors.items.map((d) => (
              <div className="admin-row" key={d._id}>
                <span>
                  <b>{d.user.name}</b>
                  <small>
                    {d.user.email} · {d.specialty} · Pending
                  </small>
                </span>
                <span>
                  <button
                    className="btn btn-small btn-primary"
                    onClick={() => void verify(d._id, 'approved')}
                  >
                    <Check size={14} /> Approve
                  </button>{' '}
                  <button
                    className="btn btn-small btn-outline"
                    onClick={() => void verify(d._id, 'rejected')}
                  >
                    Reject
                  </button>
                </span>
              </div>
            ))
          ) : (
            <p>No doctors waiting for review.</p>
          )}
        </section>
      )}
      {(tab === 'overview' || tab === 'hospitals') && (
        <section className="admin-section">
          <h2>Hospital verification queue</h2>
          {hospitals?.items.length ? (
            hospitals.items.map((h) => (
              <div className="admin-row" key={h._id}>
                <span>
                  <b>{h.name}</b>
                  <small>
                    {h.user?.name ? `${h.user.name} (${h.user.email}) · ` : ''}
                    {h.city} · {h.specialties?.join(', ') || 'General'} · Pending
                  </small>
                </span>
                <span>
                  <button
                    className="btn btn-small btn-primary"
                    onClick={() => void verifyHospital(h._id, 'approved')}
                  >
                    <Check size={14} /> Approve
                  </button>{' '}
                  <button
                    className="btn btn-small btn-outline"
                    onClick={() => void verifyHospital(h._id, 'rejected')}
                  >
                    Reject
                  </button>
                </span>
              </div>
            ))
          ) : (
            <p>No hospitals waiting for review.</p>
          )}
        </section>
      )}
      {tab === 'users' && (
        <section className="admin-section">
          <h2>Accounts</h2>
          {users?.items.map((u) => (
            <div className="admin-row" key={u._id}>
              <span>
                <b>{u.name}</b>
                <small>
                  {u.email} · {u.role} {u.suspended ? '· Suspended' : ''}
                </small>
              </span>
              <button
                className="text-button danger-text"
                onClick={() => void suspend(u._id, !u.suspended)}
              >
                {u.suspended ? 'Restore account' : 'Suspend account'}
              </button>
            </div>
          ))}
        </section>
      )}
      {tab === 'appointments' && (
        <section className="admin-section">
          <h2>Appointments</h2>
          {appointments?.items.map((a, i) => (
            <div className="admin-row" key={String(a._id ?? i)}>
              <span>
                <b>{String(a.reference)}</b>
                <small>
                  {String(a.status)} · {new Date(String(a.startsAt)).toLocaleString()}
                </small>
              </span>
              <span>{String(a.fee)}</span>
            </div>
          ))}
        </section>
      )}
      {tab === 'reviews' && (
        <section className="admin-section">
          <h2>Patient reviews</h2>
          {reviews?.items.map((r) => (
            <div className="admin-row" key={r._id}>
              <span>
                <b>
                  {'★'.repeat(r.rating)} · {r.patient.name} {r.moderated ? '· Hidden' : ''}
                </b>
                <small>{r.text || 'No written comment'}</small>
              </span>
              <button className="text-button" onClick={() => void moderate(r._id, !r.moderated)}>
                {r.moderated ? 'Restore' : 'Hide'}
              </button>
            </div>
          ))}
        </section>
      )}
    </>
  );
}

function PrivacyPage() {
  return (
    <>
      <PageTitle
        eyebrow="YOUR INFORMATION"
        title="Privacy, in plain language."
        copy="A short overview of how this demo treats personal and health information."
      />
      <div className="policy-card">
        <h2>Your choices matter</h2>
        <p>
          Health conversations, appointment reasons, and summaries are sensitive. This application
          stores them in its configured Supabase PostgreSQL database and displays them only to the
          account owner, with limited access for the relevant appointment workflow.
        </p>
        <h3>AI configuration</h3>
        <p>
          When Gemini is configured, conversation content is sent to Google’s API through the
          backend. Review Google’s current service terms, data processing, retention, and privacy
          before sending real patient data. Demo mode does not send health content to Gemini and
          does not generate a health assessment.
        </p>
        <h3>Demonstration data</h3>
        <p>
          Sample doctors and hospitals are fictional. No real provider verification, clinical
          validation, regulatory certification, or compliance assessment is represented.
        </p>
        <h3>Deletion</h3>
        <p>
          Use account settings to delete the account and associated private content. Appointment
          records may have additional retention obligations in a real deployment; assess policy and
          local requirements before handling real records.
        </p>
        <h3>For emergencies</h3>
        <p>
          This application is not an emergency service. In India, call 112; elsewhere, contact your
          local emergency service.
        </p>
        <Link to="/" className="btn btn-outline">
          Back to Carekind
        </Link>
      </div>
    </>
  );
}
function PublicPrivacy() {
  return (
    <>
      <Header />
      <main className="app-content">
        <PrivacyPage />
      </main>
      <Footer />
    </>
  );
}
function ProfilePage() {
  const { user } = useSession();
  return (
    <>
      <PageTitle
        eyebrow="YOUR ACCOUNT"
        title="Profile"
        copy="The basic details connected to your care space."
      />
      <div className="policy-card">
        <div className="profile-facts">
          <span>
            <Users /> Name: {user?.name}
          </span>
          <span>Email: {user?.email}</span>
          <span>Account type: {user?.role}</span>
        </div>
        <p className="demo-note">Your account contact details are not shown publicly.</p>
        <Link to="/settings" className="btn btn-outline">
          Manage account settings <ArrowRight size={15} />
        </Link>
      </div>
    </>
  );
}
const accountSettingsSchema = z.object({
  name: z.string().trim().min(2).max(100),
  phone: z.string().max(30),
});
function SettingsPage() {
  const { user } = useSession();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [notice, setNotice] = useState('');
  const {
    register: registerField,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<z.infer<typeof accountSettingsSchema>>({
    resolver: zodResolver(accountSettingsSchema),
    defaultValues: { name: user?.name ?? '', phone: user?.phone ?? '' },
  });
  useEffect(() => {
    if (user) reset({ name: user.name, phone: user.phone ?? '' });
  }, [user, reset]);
  const save = handleSubmit(async (values) => {
    try {
      await request('/auth/account', { method: 'PATCH', body: JSON.stringify(values) });
      await queryClient.invalidateQueries({ queryKey: ['session'] });
      setNotice('Your account details were updated.');
    } catch (e) {
      setNotice(e instanceof Error ? e.message : 'Could not update account details.');
    }
  });
  const remove = async () => {
    if (
      !window.confirm(
        'Delete your account and its private conversations, summaries, saves, and reviews? Active appointments will be cancelled. This cannot be undone.',
      )
    )
      return;
    try {
      await request('/auth/account', { method: 'DELETE' });
      await queryClient.clear();
      navigate('/');
    } catch (e) {
      setNotice(e instanceof Error ? e.message : 'Could not delete your account.');
    }
  };
  return (
    <>
      <PageTitle
        eyebrow="YOUR ACCOUNT"
        title="Settings"
        copy="Manage your account details and privacy choices."
      />
      <section className="policy-card">
        <h2>Account details</h2>
        <form className="form-stack settings-form" onSubmit={save}>
          <label>
            Your name
            <input {...registerField('name')} />
            {errors.name && (
              <small role="alert" className="field-hint">
                {errors.name.message}
              </small>
            )}
          </label>
          <label>
            Email address
            <input value={user?.email ?? ''} disabled />
          </label>
          <label>
            Phone number (optional)
            <input {...registerField('phone')} placeholder="Add a contact number" />
            {errors.phone && (
              <small role="alert" className="field-hint">
                {errors.phone.message}
              </small>
            )}
          </label>
          <button className="btn btn-primary">Save changes</button>
        </form>
        {notice && (
          <p className="inline-notice" role="status">
            {notice}
          </p>
        )}
        <h3>Privacy</h3>
        <p>
          AI chat content is sent to Google only when a Gemini key is configured. Sample mode does
          not generate medical assessments.
        </p>
        <Link to="/privacy" className="text-link">
          Read the privacy overview <ArrowRight size={15} />
        </Link>
        <h3 className="delete-heading">Delete your account</h3>
        <p>
          Account deletion removes your private conversations, summaries, saved items, reviews, and
          account. Active appointments are cancelled before deletion.
        </p>
        <button className="btn btn-outline danger-outline" onClick={() => void remove()}>
          Delete account
        </button>
      </section>
    </>
  );
}
function ActivityPage() {
  const { data, error, isLoading, refetch } = useQuery({
    queryKey: ['activity'],
    queryFn: () =>
      request<{ items: Array<{ type: string; title: string; createdAt: string }>; notice: string }>(
        '/activity',
      ),
  });
  const icons: Record<string, React.ReactNode> = {
    conversation: <MessageCircle />,
    summary: <Heart />,
    appointment: <CalendarDays />,
    review: <Star />,
  };
  return (
    <>
      <PageTitle
        eyebrow="YOUR CARE SPACE"
        title="Healthcare activity"
        copy="A personal timeline of activity in this platform, not an official clinical record."
      />
      {isLoading ? (
        <p>Loading your activity…</p>
      ) : error ? (
        <div role="alert" className="inline-notice">
          Could not load activity.{' '}
          <button className="text-button" onClick={() => void refetch()}>
            Try again
          </button>
        </div>
      ) : data?.items.length ? (
        <>
          <div className="list-panel activity-list">
            {data.items.map((item, i) => (
              <div className="history-item" key={`${item.type}-${item.createdAt}-${i}`}>
                <span className="conversation-dot">{icons[item.type] ?? <Activity />}</span>
                <span className="history-open">
                  <span>
                    <b>{item.title}</b>
                    <small>{new Date(item.createdAt).toLocaleString()}</small>
                  </span>
                </span>
              </div>
            ))}
          </div>
          <p className="demo-note">
            <ShieldCheck size={14} />
            {data.notice}
          </p>
        </>
      ) : (
        <Empty
          icon={<Activity />}
          title="No activity yet"
          copy="Conversations, summaries, appointments, and reviews you create will appear here."
        />
      )}
    </>
  );
}
function NotFound() {
  return (
    <>
      <Header />
      <Empty
        icon={<Search />}
        title="We couldn’t find that page"
        copy="Try returning to your care space or browse doctors and hospitals."
        link="/"
        label="Back home"
      />
    </>
  );
}
export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<AuthPage mode="login" />} />
      <Route path="/register" element={<AuthPage mode="register" />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/privacy" element={<PublicPrivacy />} />
      <Route
        path="/profile"
        element={
          <AppLayout>
            <ProfilePage />
          </AppLayout>
        }
      />
      <Route
        path="/settings"
        element={
          <AppLayout>
            <SettingsPage />
          </AppLayout>
        }
      />
      <Route
        path="/activity"
        element={
          <AppLayout>
            <ActivityPage />
          </AppLayout>
        }
      />
      <Route
        path="/app"
        element={
          <AppLayout>
            <Dashboard />
          </AppLayout>
        }
      />
      <Route
        path="/chat"
        element={
          <AppLayout>
            <ChatPage />
          </AppLayout>
        }
      />
      <Route
        path="/chat/:id"
        element={
          <AppLayout>
            <ChatPage />
          </AppLayout>
        }
      />
      <Route
        path="/history"
        element={
          <AppLayout>
            <HistoryPage />
          </AppLayout>
        }
      />
      <Route
        path="/doctors"
        element={
          <AppLayout>
            <DoctorsPage />
          </AppLayout>
        }
      />
      <Route
        path="/doctors/:id"
        element={
          <AppLayout>
            <DoctorDetail />
          </AppLayout>
        }
      />
      <Route
        path="/hospitals"
        element={
          <AppLayout>
            <HospitalsPage />
          </AppLayout>
        }
      />
      <Route
        path="/hospitals/:id"
        element={
          <AppLayout>
            <HospitalDetail />
          </AppLayout>
        }
      />
      <Route
        path="/appointments"
        element={
          <AppLayout>
            <AppointmentsPage />
          </AppLayout>
        }
      />
      <Route
        path="/summaries"
        element={
          <AppLayout>
            <SummariesPage />
          </AppLayout>
        }
      />
      <Route
        path="/saved"
        element={
          <AppLayout>
            <SavedPage />
          </AppLayout>
        }
      />
      <Route
        path="/doctor"
        element={
          <AppLayout>
            <DoctorPortal tab="home" />
          </AppLayout>
        }
      />
      <Route
        path="/doctor/appointments"
        element={
          <AppLayout>
            <DoctorPortal tab="appointments" />
          </AppLayout>
        }
      />
      <Route
        path="/doctor/profile"
        element={
          <AppLayout>
            <DoctorPortal tab="profile" />
          </AppLayout>
        }
      />
      <Route
        path="/hospital"
        element={
          <AppLayout>
            <HospitalPortal tab="home" />
          </AppLayout>
        }
      />
      <Route
        path="/hospital/profile"
        element={
          <AppLayout>
            <HospitalPortal tab="profile" />
          </AppLayout>
        }
      />
      <Route
        path="/admin"
        element={
          <AppLayout>
            <AdminPage tab="overview" />
          </AppLayout>
        }
      />
      <Route
        path="/admin/doctors"
        element={
          <AppLayout>
            <AdminPage tab="doctors" />
          </AppLayout>
        }
      />
      <Route
        path="/admin/hospitals"
        element={
          <AppLayout>
            <AdminPage tab="hospitals" />
          </AppLayout>
        }
      />
      <Route
        path="/admin/users"
        element={
          <AppLayout>
            <AdminPage tab="users" />
          </AppLayout>
        }
      />
      <Route
        path="/admin/appointments"
        element={
          <AppLayout>
            <AdminPage tab="appointments" />
          </AppLayout>
        }
      />
      <Route
        path="/admin/reviews"
        element={
          <AppLayout>
            <AdminPage tab="reviews" />
          </AppLayout>
        }
      />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
