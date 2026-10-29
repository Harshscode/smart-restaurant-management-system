import { ArrowRight, ChefHat, Clock3, Heart, Leaf, Sparkles, UtensilsCrossed } from 'lucide-react';

const favorites = [
  { category: 'MAINS', name: 'Creamy Alfredo', description: 'A rich, comforting pasta made for slow evenings.', price: '$18.99' },
  { category: 'STARTERS', name: 'Garden Greens', description: 'Seasonal vegetables, bright herbs and a fresh finish.', price: '$11.50' },
  { category: 'DESSERTS', name: 'Chocolate Lava Cake', description: 'Warm chocolate with a soft, indulgent center.', price: '$9.95' },
];

export default function Home() {
  return (
    <>
      <section className="hero" aria-labelledby="hero-title">
        <div className="container hero-grid">
          <div className="hero-copy">
            <span className="eyebrow eyebrow--gold"><span className="eyebrow-dot" /> SEASONAL FOOD. SHARED MOMENTS.</span>
            <h1 id="hero-title">Where good food <em>meets</em> great company.</h1>
            <p>A little unexpected, a lot delicious. Discover thoughtfully crafted plates, warm hospitality and evenings worth remembering.</p>
            <div className="hero-actions">
              <a href="#discover" className="button button--gold">Discover our kitchen <ArrowRight size={18} /></a>
              <a href="#story" className="inline-link">Our story <ArrowRight size={17} /></a>
            </div>
            <div className="opening-note"><span className="open-dot" /> OPEN DAILY <strong>12:00 PM - 10:00 PM</strong></div>
          </div>
          <div className="hero-visual">
            <img src="/images/hero-fallback.svg" alt="Illustration of a welcoming restaurant dining room with fresh food" />
            <div className="hero-photo-frame" aria-hidden="true" />
            <div className="hero-stamp"><span>OUR PHILOSOPHY</span><strong>Made with care.<br />Shared with joy.</strong><Leaf size={25} /></div>
          </div>
        </div>
      </section>

      <section className="benefits" aria-label="What makes our kitchen special">
        <div className="container benefits-inner">
          <div><ChefHat size={27} /><span><strong>Made with intention</strong><small>Thoughtful, seasonal ingredients</small></span></div>
          <div><Heart size={27} /><span><strong>Hospitality at heart</strong><small>Feel right at home</small></span></div>
          <div><Leaf size={27} /><span><strong>Something for everyone</strong><small>Fresh, flexible dining choices</small></span></div>
        </div>
      </section>

      <section className="section favorites" id="discover">
        <div className="container">
          <div className="section-intro"><span className="eyebrow">A TASTE OF COPPER &amp; THYME</span><h2>The dishes you'll <em>come back for.</em></h2><p>A few guest favorites from our kitchen. The interactive menu and online ordering arrive in the next frontend stages.</p></div>
          <div className="favorites-grid">
            {favorites.map((dish, index) => (
              <article className="favorite-card" key={dish.name}>
                <div className={`favorite-card-visual favorite-card-visual--${index + 1}`}><UtensilsCrossed size={52} strokeWidth={1} /></div>
                <div className="favorite-card-content"><span className="eyebrow">{dish.category}</span><div className="favorite-card-title"><h3>{dish.name}</h3><strong>{dish.price}</strong></div><p>{dish.description}</p></div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="story" id="story">
        <div className="container story-grid">
          <div className="story-art"><Sparkles size={39} /><span>EVERY DAY<br />A REASON TO GATHER</span></div>
          <div className="story-content"><span className="eyebrow">MORE THAN A MEAL</span><h2>Come for the food.<br /><em>Stay for the feeling.</em></h2><p>We're inspired by the simple joy of bringing people together. From the first pour to the last bite, our kitchen celebrates food and company worth making time for.</p><div className="story-highlights"><span><UtensilsCrossed size={18} /> Seasonal kitchen</span><span><Clock3 size={18} /> Unhurried dining</span></div></div>
        </div>
      </section>
      <section className="visit" id="visit"><div className="container visit-inner"><div><span className="eyebrow eyebrow--gold">WE SAVED YOU A SEAT</span><h2>See you at <em>the table.</em></h2><p>Daily from 12:00 PM to 10:00 PM. Reservations and online ordering are coming in the next stages.</p></div><a href="#top" className="button button--gold">Back to top <ArrowRight size={18} /></a></div></section>
    </>
  );
}
