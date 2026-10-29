
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  ChefHat,
  Heart,
  Leaf,
  UtensilsCrossed
} from 'lucide-react';
import '../../styles/about.css';

const values = [
  {
    icon: Leaf,
    title: 'Fresh by nature',
    description:
      'Seasonal ingredients and balanced flavours inspire the food we create.'
  },
  {
    icon: ChefHat,
    title: 'Crafted with care',
    description:
      'Every plate is thoughtfully prepared with attention to detail.'
  },
  {
    icon: Heart,
    title: 'Hospitality first',
    description:
      'We believe a memorable meal is about the people around the table.'
  }
];

export default function About() {
  return (
    <>
      <section className="about-hero">
        <div className="container about-hero-inner">
          <span className="eyebrow eyebrow--gold">
            GET TO KNOW COPPER & THYME
          </span>

          <h1>
            More than food.
            <br />
            <em>A place to belong.</em>
          </h1>

          <p>
            Copper & Thyme celebrates thoughtful cooking,
            welcoming spaces, and the simple pleasure
            of sharing a meal together.
          </p>
        </div>
      </section>

      <section className="section about-story">
        <div className="container about-story-grid">
          <div className="about-art">
            <div className="about-art-circle">
              <UtensilsCrossed size={70} strokeWidth={1} />
              <span>MADE WITH CARE</span>
            </div>
          </div>

          <div className="about-story-copy">
            <span className="eyebrow">OUR STORY</span>
            <h2>
              Inspired by food.
              <br />
              <em>Connected by people.</em>
            </h2>

            <p>
              We believe that a great restaurant experience
              begins with good ingredients and becomes
              unforgettable through genuine hospitality.
            </p>

            <p>
              Our approach brings together seasonal flavours,
              carefully prepared dishes, and a welcoming
              atmosphere where every gathering feels special.
            </p>

            <Link to="/" className="about-text-link">
              Explore our restaurant <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      <section className="section about-values">
        <div className="container">
          <div className="section-intro">
            <span className="eyebrow">WHAT WE BELIEVE</span>
            <h2>
              The values behind <em>every plate.</em>
            </h2>
            <p>
              A few simple ideas guide our approach to
              food, service, and meaningful experiences.
            </p>
          </div>

          <div className="about-values-grid">
            {values.map(({ icon: Icon, title, description }) => (
              <article className="about-value-card" key={title}>
                <div className="about-value-icon">
                  <Icon size={28} strokeWidth={1.5} />
                </div>
                <h3>{title}</h3>
                <p>{description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="about-cta">
        <div className="container about-cta-inner">
          <div>
            <span className="eyebrow eyebrow--gold">
              THE ART OF GATHERING
            </span>
            <h2>
              Good food.
              <br />
              <em>Better together.</em>
            </h2>
            <p>
              Discover the food, atmosphere, and experiences
              that make Copper & Thyme special.
            </p>
          </div>

          <Link to="/" className="button button--gold">
            Back to homepage <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </>
  );
}
