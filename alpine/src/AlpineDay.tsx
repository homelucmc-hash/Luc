import { useState } from 'react'
import { ArrowRight, Moon, Sunrise, Sunset, Sun } from 'lucide-react'
import './alpine-day.css'

const moments = [
  { time: '08:30', name: 'Le premier souffle.', label: 'LES PREMIÈRES LUEURS', icon: Sunrise, image: '/images/alpine-hero.jpg', text: 'Le village s’éveille. Le ciel s’éclaircit. Vous êtes déjà ailleurs.', location: 'VAL THORENS · 2 300 M' },
  { time: '11:00', name: 'Le monde est à vous.', label: 'L’APPEL DU GRAND BLANC', icon: Sun, image: '/images/ski.jpg', text: 'Les jambes dessinent la courbe. Le reste peut attendre.', location: 'LES 3 VALLÉES · AU GRAND AIR' },
  { time: '16:30', name: 'Retenir la lumière.', label: 'LE DERNIER RAYON', icon: Sunset, image: '/images/alpine-hero.jpg', text: 'Encore un virage. Encore un regard. Ne pas tout à fait rentrer.', location: 'FACE AUX SOMMETS · L’HEURE DORÉE' },
  { time: '20:00', name: 'La nuit nous appartient.', label: 'SOUS LE CIEL DES ALPES', icon: Moon, image: '/images/night-summit.jpg', text: 'Les étoiles prennent le relais. Les histoires de la journée commencent.', location: 'QUELQUE PART LÀ-HAUT · SOUS LES ÉTOILES' },
]

export default function AlpineDay() {
  const [moment, setMoment] = useState(0)
  const current = moments[moment]
  const Icon = current.icon

  return <section className={`alpine-day alpine-day--${moment}`} id="une-journee" aria-labelledby="day-title">
    <div className="day-photos" aria-hidden="true">{moments.map((item, i) => <img src={item.image} key={item.time} className={i === moment ? 'is-active' : ''} alt="" loading="lazy" />)}</div>
    <div className="day-shade" />
    <div className="day-topline"><span>03 / UNE JOURNÉE À PART.</span><span>LE TEMPS, AUTREMENT.</span></div>
    <div className="day-intro"><h2 id="day-title">Les heures passent.<br />Les sensations <em>restent.</em></h2><p>Du premier rayon à la dernière étoile,<br />l’altitude change tout.</p></div>
    <div className="day-story" key={current.time} aria-live="polite" aria-atomic="true"><div className="day-story-label"><Icon size={18} strokeWidth={1.3} /><span>{current.label}</span></div><p className="day-time" aria-hidden="true">{current.time}</p><h3>{current.name}</h3><p className="day-story-copy">{current.text}</p></div>
    <span className="day-location">{current.location}</span>
    <div className="day-bottom"><div className="day-moments" role="group" aria-label="Explorer les moments de la journée">{moments.map((item, i) => <button key={item.time} className={moment === i ? 'is-active' : ''} aria-pressed={moment === i} onClick={() => setMoment(i)}><span className="moment-dot" /><span>{item.time}</span><span className="moment-name">{['L’éveil', 'L’élan', 'L’éclat', 'L’étoile'][i]}</span></button>)}</div><button className="day-next" aria-label="Découvrir le moment suivant" onClick={() => setMoment((moment + 1) % moments.length)}><ArrowRight size={21} /></button></div>
    <p className="day-note">UNE JOURNÉE IMAGINÉE · PHOTOGRAPHIES D’AMBIANCE</p>
  </section>
}
