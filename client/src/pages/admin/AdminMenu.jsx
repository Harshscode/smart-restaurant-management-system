import { useState } from 'react';
import { Edit3, Plus, Search, Trash2, X } from 'lucide-react';
import { CATEGORIES, DIETS, money } from '../../lib/format.js';
import { hasErrors, validateMenuItem } from '../../lib/validation.js';
import { getMenu, saveMenuItem, deleteMenuItem } from '../../services/restaurantService.js';
import { useLiveData } from '../../hooks/useLiveData.js';
import { useToast } from '../../context/ToastContext.jsx';
import { Field, FoodImage, Spinner, StatusBadge, ErrorPanel } from '../../components/common/Ui.jsx';

const empty = { name: '', category: 'Mains', description: '', price: '', ingredients: '', allergens: '', dietary: [], image: '', available: true, popular: false, featured: false, heat: 0 };
const toForm = item => item ? { ...item, price: String(item.price), ingredients: item.ingredients.join(', '), allergens: item.allergens.join(', ') } : empty;

export default function AdminMenu() {
  const { data: menu, loading, error, refresh } = useLiveData(getMenu);
  const notify = useToast();
  const [search, setSearch] = useState(''), [category, setCategory] = useState('All');
  const [editing, setEditing] = useState(null), [open, setOpen] = useState(false), [form, setForm] = useState(empty);
  const [errors, setErrors] = useState({}), [saving, setSaving] = useState(false);
  const showForm = item => { setEditing(item || null); setForm(toForm(item)); setErrors({}); setOpen(true); };
  const close = () => { if (!saving) setOpen(false); };
  const update = e => { const { name, value, type, checked } = e.target; setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value })); setErrors(prev => ({ ...prev, [name]: undefined })); };
  const toggleDiet = value => setForm(prev => ({ ...prev, dietary: prev.dietary.includes(value) ? prev.dietary.filter(x => x !== value) : [...prev.dietary, value] }));
  const save = async e => {
    e.preventDefault();
    const payload = { ...form, price: Number(form.price), ingredients: form.ingredients.split(',').map(x => x.trim()).filter(Boolean), allergens: form.allergens.split(',').map(x => x.trim()).filter(Boolean) };
    const next = validateMenuItem(payload); setErrors(next); if (hasErrors(next)) return;
    setSaving(true);
    try { await saveMenuItem(payload, editing?.id || null); notify(editing ? 'Menu item updated.' : 'New dish added.'); setOpen(false); }
    catch (err) { setErrors(err.fields || {}); notify(err.message, 'error'); }
    finally { setSaving(false); }
  };
  const remove = async (item) => {
    if (!window.confirm(`Remove "${item.name}" from the menu? Existing order records will be preserved.`)) return;
    try { await deleteMenuItem(item.id); notify('Menu item removed.'); } catch (err) { notify(err.message, 'error'); }
  };
  const filtered = (menu || []).filter(x => (category === 'All' || x.category === category) && `${x.name} ${x.description}`.toLowerCase().includes(search.toLowerCase()));
  return <><div className="admin-page-header"><div><span className="eyebrow">RESTAURANT / MENU</span><h1>Menu management</h1><p>Add, update, and organize every item on your menu.</p></div><button type="button" className="btn btn-primary btn-sm" onClick={() => showForm(null)}><Plus size={17} /> Add menu item</button></div>
    <div className="admin-panel admin-list-panel"><div className="admin-filter-row"><div className="admin-search"><Search size={18} /><input aria-label="Search menu items" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search menu items..." /></div><select aria-label="Filter by category" value={category} onChange={e => setCategory(e.target.value)}>{['All', ...CATEGORIES].map(c => <option key={c}>{c}</option>)}</select><span className="admin-list-count">{filtered.length} dishes</span></div>
      {error ? <ErrorPanel message={error} refresh={refresh} /> : loading ? <Spinner /> : <div className="admin-table-scroll"><table className="admin-table admin-menu-table"><thead><tr><th>Dish</th><th>Category</th><th>Price</th><th>Availability</th><th>Actions</th></tr></thead><tbody>{filtered.map(item => <tr key={item.id}><td><div className="admin-menu-dish"><FoodImage src={item.image} alt={item.name} /><div><strong>{item.name}</strong><small>{item.description}</small></div></div></td><td>{item.category}</td><td><strong>{money(item.price)}</strong></td><td><StatusBadge status={item.available ? 'Available' : 'Unavailable'} /></td><td><div className="table-actions"><button type="button" aria-label={`Edit ${item.name}`} onClick={() => showForm(item)} title="Edit"><Edit3 size={17} /></button><button type="button" aria-label={`Delete ${item.name}`} className="danger" onClick={() => remove(item)} title="Delete"><Trash2 size={17} /></button></div></td></tr>)}</tbody></table>{!filtered.length && <div className="admin-empty">No menu items match your search.</div>}</div>}
    </div>
    {open && <div className="modal-backdrop" role="presentation" onMouseDown={e => { if (e.target === e.currentTarget) close(); }}><section className="admin-modal" role="dialog" aria-modal="true" aria-labelledby="menu-modal-title"><div className="admin-modal__header"><div><span className="eyebrow">MENU EDITOR</span><h2 id="menu-modal-title">{editing ? 'Edit menu item' : 'Add a new dish'}</h2></div><button className="icon-button" type="button" onClick={close} aria-label="Close"><X size={21} /></button></div><form onSubmit={save} className="admin-modal__form" noValidate>
      <div className="form-grid"><Field name="name" label="Dish name" required error={errors.name}><input id="name" name="name" value={form.name} onChange={update} placeholder="Dish name" /></Field><Field name="category" label="Category" required error={errors.category}><select id="category" name="category" value={form.category} onChange={update}>{CATEGORIES.map(c => <option key={c}>{c}</option>)}</select></Field><Field name="price" label="Price ($)" required error={errors.price}><input id="price" name="price" type="number" min="0.01" step="0.01" value={form.price} onChange={update} /></Field><Field name="heat" label="Spice level (0–3)"><select id="heat" name="heat" value={form.heat} onChange={update}><option value="0">0 – Mild</option><option value="1">1 – Light</option><option value="2">2 – Medium</option><option value="3">3 – Hot</option></select></Field></div>
      <Field name="description" label="Description" required error={errors.description}><textarea id="description" name="description" rows={3} value={form.description} onChange={update} placeholder="Describe this dish" /></Field><Field name="ingredients" label="Ingredients (comma-separated)" required error={errors.ingredients}><input id="ingredients" name="ingredients" value={form.ingredients} onChange={update} placeholder="Tomato, basil, olive oil" /></Field><Field name="allergens" label="Allergens (comma-separated)"><input id="allergens" name="allergens" value={form.allergens} onChange={update} placeholder="Dairy, gluten" /></Field><Field name="image" label="Image URL (optional)" hint="Use a direct HTTPS image URL. A built-in placeholder appears if it cannot be loaded."><input id="image" name="image" type="url" value={form.image} onChange={update} placeholder="https://..." /></Field>
      <div className="form-field"><span className="form-label">Dietary labels</span><div className="check-grid">{DIETS.map(value => <label key={value}><input type="checkbox" checked={form.dietary.includes(value)} onChange={() => toggleDiet(value)} />{value}</label>)}</div></div><div className="form-field"><span className="form-label">Visibility and promotion</span><div className="check-grid"><label><input name="available" type="checkbox" checked={form.available} onChange={update} />Available for orders</label><label><input name="popular" type="checkbox" checked={form.popular} onChange={update} />Guest favorite</label><label><input name="featured" type="checkbox" checked={form.featured} onChange={update} />Feature on homepage</label></div></div>
      <div className="admin-modal__footer"><button type="button" className="btn btn-outline" onClick={close} disabled={saving}>Cancel</button><button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : editing ? 'Save changes' : 'Add dish'}</button></div>
    </form></section></div>}
  </>;
}
