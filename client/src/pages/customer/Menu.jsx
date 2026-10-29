import { useMemo, useState } from 'react';
import { Search, SlidersHorizontal, X, ArrowUpDown } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { CATEGORIES, DIETS } from '../../lib/format.js';
import { getMenu } from '../../services/restaurantService.js';
import { useLiveData } from '../../hooks/useLiveData.js';
import MenuCard from '../../components/menu/MenuCard.jsx';
import { EmptyState, ErrorPanel, PageHeader, Spinner } from '../../components/common/Ui.jsx';

export default function Menu() {
  const { data: menu, loading, error, refresh } = useLiveData(getMenu);
  const [params, setParams] = useSearchParams();
  const category = params.get('category') || 'All';
  const [search, setSearch] = useState('');
  const [diet, setDiet] = useState('All');
  const [sort, setSort] = useState('featured');
  const [maxPrice, setMaxPrice] = useState('All');
  const [showFilters, setShowFilters] = useState(false);
  const changeCategory = value => setParams(value === 'All' ? {} : { category: value });
  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return (menu || []).filter(item => {
      if (category !== 'All' && item.category !== category) return false;
      if (diet !== 'All' && !item.dietary.includes(diet)) return false;
      if (maxPrice !== 'All' && item.price > Number(maxPrice)) return false;
      if (query && !`${item.name} ${item.description} ${item.ingredients.join(' ')} ${item.dietary.join(' ')}`.toLowerCase().includes(query)) return false;
      return true;
    }).sort((a, b) => sort === 'price-low' ? a.price - b.price : sort === 'price-high' ? b.price - a.price : sort === 'name' ? a.name.localeCompare(b.name) : Number(b.popular) - Number(a.popular));
  }, [menu, category, diet, maxPrice, search, sort]);
  const clear = () => { setSearch(''); setDiet('All'); setMaxPrice('All'); setSort('featured'); changeCategory('All'); };
  return <><PageHeader eyebrow="FROM OUR KITCHEN" title={<>Made to be <em>enjoyed.</em></>} description="Explore freshly prepared favorites, comforting classics, and a little something unexpected." />
    <section className="section menu-page"><div className="container">
      <div className="menu-toolbar"><div className="menu-search"><Search size={20} /><input aria-label="Search dishes" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search dishes or ingredients..." /></div><button type="button" className={`btn btn-outline filter-toggle ${showFilters ? 'is-active' : ''}`} onClick={() => setShowFilters(x => !x)} aria-expanded={showFilters}><SlidersHorizontal size={17} /> Filters</button></div>
      <div className="menu-categories" role="group" aria-label="Menu categories">{['All', ...CATEGORIES].map(cat => <button type="button" key={cat} onClick={() => changeCategory(cat)} className={`category-pill ${category === cat ? 'active' : ''}`}>{cat === 'All' ? 'All dishes' : cat}</button>)}</div>
      {showFilters && <div className="menu-filters"><div><label htmlFor="diet">Dietary preference</label><select id="diet" value={diet} onChange={e => setDiet(e.target.value)}>{['All', ...DIETS].map(x => <option key={x} value={x}>{x === 'All' ? 'All dietary types' : x}</option>)}</select></div><div><label htmlFor="price">Maximum price</label><select id="price" value={maxPrice} onChange={e => setMaxPrice(e.target.value)}>{['All', '10', '15', '20', '25', '30', '40'].map(x => <option key={x} value={x}>{x === 'All' ? 'Any price' : `$${x} and under`}</option>)}</select></div><div><label htmlFor="sort">Sort by</label><select id="sort" value={sort} onChange={e => setSort(e.target.value)}><option value="featured">Guest favorites</option><option value="price-low">Price: low to high</option><option value="price-high">Price: high to low</option><option value="name">Name: A–Z</option></select></div><button type="button" className="filter-clear" onClick={clear}><X size={15} /> Clear filters</button></div>}
      {error ? <ErrorPanel message={error} refresh={refresh} /> : loading ? <Spinner label="Loading menu" /> : <><div className="menu-result-bar"><span><strong>{filtered.length}</strong> delicious {filtered.length === 1 ? 'choice' : 'choices'}</span><span>Freshly prepared, just for you</span></div>{filtered.length ? <div className="menu-grid">{filtered.map(item => <MenuCard key={item.id} item={item} />)}</div> : <EmptyState title="No dishes found" description="Try another category, diet, or price to find something delicious." />}</>}
      <div className="dietary-note"><strong>Dietary information:</strong> Our menu lists common ingredients and allergens for reference. Speak with restaurant staff about allergies or cross-contact concerns.</div>
    </div></section>
  </>;
}
