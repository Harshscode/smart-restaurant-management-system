import { useState } from 'react';
import { Search, Trash2, UsersRound } from 'lucide-react';
import { readStored, writeStored } from '../../lib/storage.js';

// Local sample directory only. Roles/passwords/authorization must come from
// backend APIs later; this preview never manages real credentials.
export default function AdminUsers() {
  const [accounts, setAccounts] = useState(() => readStored('demoAccounts', []));
  const [search, setSearch] = useState('');
  const filtered = accounts.filter(a => `${a.name} ${a.email}`.toLowerCase().includes(search.toLowerCase()));
  function remove(account) {
    if (!window.confirm(`Remove ${account.email} from local demo profiles?`)) return;
    const next = accounts.filter(a => a.id !== account.id);
    writeStored('demoAccounts', next);
    setAccounts(next);
  }
  return <>
    <div className="admin-page-header"><div><span className="eyebrow">RESTAURANT / DEMO PROFILES</span><h1>Customer profiles</h1><p>Review profiles created in this browser's frontend-only demo.</p></div><UsersRound size={30} /></div>
    <div className="ct-demo-note"><strong>Demonstration only:</strong> No real user authentication or secure staff permissions are managed here. The backend phase adds server-side accounts and access control.</div>
    <div className="admin-panel"><div className="admin-filter-row"><div className="admin-search"><Search size={18} /><input aria-label="Search demo customers" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search demo customers" /></div><span className="admin-list-count">{filtered.length} local profiles</span></div>
      <div style={{ padding:24 }}>
        {filtered.length ? filtered.map(account => <div className="ct-admin-row" key={account.id}><div><strong>{account.name}</strong><p>{account.email}{account.phone ? ` • ${account.phone}` : ''}</p></div><button className="btn btn-outline btn-sm" type="button" onClick={() => remove(account)} aria-label={`Remove ${account.email}`}><Trash2 size={15} /> Remove</button></div>) : <p>No matching local profiles. Create a preview profile from the customer account page.</p>}
      </div>
    </div>
  </>;
}
