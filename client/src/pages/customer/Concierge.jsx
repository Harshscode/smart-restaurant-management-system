import { useEffect, useRef, useState } from 'react';
import { Bot, MessageCircle, Send, Sparkles, UserRound, UtensilsCrossed } from 'lucide-react';
import { PageHeader, Spinner, ErrorPanel } from '../../components/common/Ui.jsx';
import { QUICK_QUESTIONS, getConciergeReply } from '../../services/conciergeService.js';
import { getMenu } from '../../services/restaurantService.js';
import { useLiveData } from '../../hooks/useLiveData.js';

const greeting = { id: 'greeting', role: 'concierge', text: "Welcome to Copper & Thyme! Looking for something delicious? Ask about our menu, dietary choices, today's favorites, or anything else on your mind." };

export default function Concierge() {
  const { data: menu, loading, error, refresh } = useLiveData(getMenu);
  const [messages, setMessages] = useState([greeting]);
  const [input, setInput] = useState('');
  const bottom = useRef(null);
  useEffect(() => { bottom.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); }, [messages]);
  const send = (question) => {
    const text = String(question || '').trim().slice(0, 300);
    if (!text || !menu) return;
    setMessages(prev => [...prev, { id: `u${Date.now()}`, role: 'user', text }, { id: `c${Date.now()}`, role: 'concierge', text: getConciergeReply(text, menu) }]);
    setInput('');
  };
  return <><PageHeader eyebrow="A LITTLE HELP FROM OUR KITCHEN" title={<>Meet your menu <em>concierge.</em></>} description="Not sure what to order? Tell us what you enjoy and we'll help you explore." />
    <section className="section concierge-page"><div className="container concierge-layout"><div className="concierge-aside"><span className="eyebrow">HERE TO HELP</span><h2>Good food starts with <em>a great suggestion.</em></h2><p>Ask about today's dishes, vegetarian or gluten-free options, spice preferences, and your budget.</p><div className="concierge-info"><Sparkles size={20} /><p>Our local menu guide uses the restaurant's current sample menu. For serious allergies, verify ingredients and cross-contact risks with staff.</p></div><div className="concierge-aside__photo" role="img" aria-label="A selection of fresh restaurant dishes" /></div>
      <div className="chat-panel"><div className="chat-panel__header"><div className="chat-panel__avatar"><UtensilsCrossed size={20} /></div><div><strong>Copper & Thyme Concierge</strong><small><span /> Ready to help you choose</small></div></div><div className="chat-panel__messages" role="log" aria-label="Concierge conversation" aria-live="polite">{messages.map(message => <div key={message.id} className={`chat-message ${message.role === 'user' ? 'chat-message--user' : ''}`}><span className="chat-message__avatar">{message.role === 'user' ? <UserRound size={16} /> : <MessageCircle size={16} />}</span><div className="chat-message__bubble">{message.text}</div></div>)}<div ref={bottom} /></div><div className="chat-panel__bottom">{error ? <ErrorPanel message={error} refresh={refresh} /> : loading ? <Spinner label="Loading restaurant menu" /> : <><div className="quick-questions">{QUICK_QUESTIONS.map(q => <button type="button" onClick={() => send(q)} key={q}>{q}</button>)}</div><form className="chat-compose" onSubmit={e => { e.preventDefault(); send(input); }}><input aria-label="Ask the menu concierge" value={input} onChange={e => setInput(e.target.value)} maxLength={300} placeholder="Try: something vegetarian under $25..." /><button disabled={!input.trim()} type="submit" aria-label="Send message"><Send size={18} /></button></form></>}</div></div></div></section>
  </>;
}
