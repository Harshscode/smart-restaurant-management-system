import { useState } from 'react';
import { Clock3, Plus, Leaf, Check, Info } from 'lucide-react';
import { FoodImage } from '../common/Ui.jsx';
import { money } from '../../lib/format.js';
import { useCart } from '../../context/CartContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';

export default function MenuCard({ item }) {
  const [expanded, setExpanded] = useState(false);
  const { addItem } = useCart();
  const toast = useToast();
  const onAdd = () => { addItem(item.id); toast(`${item.name} added to your bag.`); };
  return <article className="menu-card">
    <div className="menu-card__image"><FoodImage src={item.image} alt={item.name} />
      {item.popular && <span className="menu-card__flag">Guest favorite</span>}
      {!item.available && <span className="menu-card__unavailable">Sold out</span>}
    </div>
    <div className="menu-card__body">
      <div className="menu-card__meta"><span>{item.category}</span>{item.dietary.includes('Vegan') ? <span><Leaf size={12} /> Vegan</span> : item.dietary.includes('Vegetarian') ? <span><Leaf size={12} /> Vegetarian</span> : <span><Clock3 size={12} /> Made fresh</span>}</div>
      <div className="menu-card__title-row"><h3>{item.name}</h3><strong>{money(item.price)}</strong></div>
      <p className="menu-card__description">{item.description}</p>
      <button type="button" className="details-toggle" aria-expanded={expanded} onClick={() => setExpanded(x => !x)}><Info size={14} />{expanded ? 'Hide details' : 'Ingredients & allergens'}</button>
      {expanded && <div className="menu-card__details"><p><strong>Ingredients:</strong> {item.ingredients.join(', ')}</p><p><strong>Allergens:</strong> {item.allergens.length ? item.allergens.join(', ') : 'None listed'}</p>{item.dietary.length > 0 && <p><strong>Dietary:</strong> {item.dietary.join(', ')}</p>}<small>For severe allergies, please check with staff. Cross-contact is possible.</small></div>}
      <button type="button" className="menu-card__add" onClick={onAdd} disabled={!item.available}>
        {item.available ? <><Plus size={17} /> Add to order</> : <><Check size={17} /> Unavailable</>}
      </button>
    </div>
  </article>;
}
