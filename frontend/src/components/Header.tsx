import { useEffect, useState } from 'react';
import { DoorClosed, Settings, RefreshCw } from 'lucide-react';
import type { ConnectionState } from '../types';
interface HeaderProps { status: ConnectionState; onOpenSettings: () => void; onRefresh: () => void; isLoading: boolean; }
export function Header({ status, onOpenSettings, onRefresh, isLoading }: HeaderProps) {
  const [active, setActive] = useState('hero-twin');
  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const offset = (document.querySelector('.dashboard-header')?.getBoundingClientRect().bottom ?? 100) + 48;
      let current = 'hero-twin';
      for (const id of ['hero-twin', 'hardware-cards', 'event-log']) {
        const section = document.getElementById(id);
        if (section && section.getBoundingClientRect().top <= offset) current = id;
      }
      setActive(current);
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    schedule();
    return () => { cancelAnimationFrame(frame); window.removeEventListener('scroll', schedule); window.removeEventListener('resize', schedule); };
  }, []);
  const navigate = (id: string) => { setActive(id); document.getElementById(id)?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'start' }); };
  return <header className="app-header"><div className="header-inner">
    <a className="brand" href="#hero-twin" onClick={(event) => { event.preventDefault(); navigate('hero-twin'); }}><DoorClosed size={23} strokeWidth={1.5} /><span>smartdoor<span className="brand-dot">.</span></span></a>
    <nav aria-label="Dashboard navigation" className="main-nav" data-active={active === 'hero-twin' ? 0 : active === 'hardware-cards' ? 1 : 2}>{[{ id: 'hero-twin', label: 'Overview' }, { id: 'hardware-cards', label: 'Controls' }, { id: 'event-log', label: 'Activity' }].map(item => <button key={item.id} aria-current={active === item.id ? 'location' : undefined} onClick={() => navigate(item.id)}>{item.label}</button>)}</nav>
    <div className="header-actions"><span className="connection-label"><i data-online={status === 'CONNECTED'} />{status === 'CONNECTED' ? 'Connected' : status === 'UNKNOWN' ? 'Connecting' : 'Offline'}</span><button onClick={onRefresh} disabled={isLoading} aria-label="Refresh hardware status" title="Refresh hardware status"><RefreshCw size={17} className={isLoading ? 'animate-spin' : ''} /></button><button onClick={onOpenSettings} aria-label="Settings" title="Configure System Thresholds & Delays"><Settings size={18} /></button></div>
  </div></header>;
}
export default Header;
