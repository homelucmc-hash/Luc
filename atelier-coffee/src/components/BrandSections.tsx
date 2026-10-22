'use client';

import { useRef, useState } from 'react';

type Profile = {
  id: string;
  name: string;
  line: string;
  notes: string;
  description: string;
  roast: string;
  strength: number;
};

const profiles: Profile[] = [
  { id: 'matin', name: 'Le Matin', line: 'La lumière, en tasse.', notes: 'Fleurs blanches, agrumes, miel.', description: 'Une attaque vive, une fin de bouche délicate. Pour ceux qui aiment retrouver la fraîcheur du grain.', roast: 'Clair', strength: 2 },
  { id: 'instant', name: 'L’Instant', line: 'Le point d’équilibre.', notes: 'Noisette, caramel, chocolat au lait.', description: 'Un espresso rond et précis. De la douceur au premier contact, puis une longueur qui invite à prendre son temps.', roast: 'Médium', strength: 3 },
  { id: 'soir', name: 'Le Velours', line: 'Une présence qui reste.', notes: 'Cacao, prune, épices douces.', description: 'Une texture enveloppante, des notes de cacao et une finale profonde. À déguster jusqu’à la dernière goutte.', roast: 'Soutenu', strength: 4 },
];

function Arrow({ down = false }: { down?: boolean }) {
  return <svg className={down ? 'editorial-arrow is-down' : 'editorial-arrow'} viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 12h16M13 5l7 7-7 7" /></svg>;
}

function EditorialPhoto({ src, alt, className }: { src: string; alt: string; className: string }) {
  const [unavailable, setUnavailable] = useState(false);
  return <div className={`${className}${unavailable ? ' media-unavailable' : ''}`}>
    {!unavailable && <img src={src} alt={alt} width="1280" height="854" loading="lazy" decoding="async" onError={() => setUnavailable(true)} />}
    {unavailable && <div className="editorial-media-fallback" aria-hidden="true"><span>ATELIER</span><em>coffee.</em></div>}
  </div>;
}

export default function BrandSections() {
  const [selected, setSelected] = useState(1);
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const profile = profiles[selected];

  function choose(event: React.KeyboardEvent<HTMLButtonElement>, index: number) {
    let next = index;
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = (index + 1) % profiles.length;
    else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') next = (index + profiles.length - 1) % profiles.length;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = profiles.length - 1;
    else return;
    event.preventDefault();
    setSelected(next);
    refs.current[next]?.focus();
  }

  return <>
    <section className="atelier-story editorial-section" id="story" aria-labelledby="atelier-story-title">
      <span id="univers" className="anchor-alias" aria-hidden="true" />
      <div className="editorial-section-head"><span>THE ATELIER</span><span>DU GRAIN AU GESTE.</span></div>
      <div className="atelier-story-grid">
        <div className="atelier-story-copy">
          <p className="editorial-kicker">LE GOÛT DE LA JUSTESSE.</p>
          <h2 id="atelier-story-title">Tout se joue<br />dans <em>l’instant.</em></h2>
          <p className="editorial-lead">Un grain choisi. Une mouture précise.<br />L’eau, la pression, le temps.</p>
          <p>Le café se révèle dans les détails. Nous aimons ce moment où les gestes s’effacent et où il ne reste que le goût.</p>
          <a href="#cafes" className="editorial-link">DÉCOUVRIR NOS CAFÉS <Arrow /></a>
        </div>
        <div className="atelier-story-image-wrap">
          <EditorialPhoto src="/images/atelier-detail.webp" alt="Main d’un barista tassant le café dans un porte-filtre en acier, sous une lumière ambrée" className="atelier-story-image" />
          <div className="editorial-photo-caption"><span>LA MATIÈRE. LE GESTE. LE GOÛT.</span><span>ATELIER COFFEE</span></div>
        </div>
      </div>
      <div className="atelier-story-signature"><span>Le café mérite toute notre attention.</span><i aria-hidden="true" /><span>LA VÔTRE AUSSI.</span></div>
    </section>

    <section className="coffee-collection editorial-section" id="cafes" aria-labelledby="coffee-collection-title">
      <div className="editorial-section-head"><span>OUR COFFEE</span><span>UN RITUEL, TROIS CARACTÈRES.</span></div>
      <div className="collection-heading"><h2 id="coffee-collection-title">Le goût<br />de la <em>nuance.</em></h2><p>Un même soin.<br />Votre façon de le savourer.</p></div>
      <div className="coffee-selection">
        <div className="coffee-selection-copy">
          <div className="coffee-profile-tabs" role="tablist" aria-label="Choisir un profil de café" aria-orientation="vertical">
            {profiles.map((item, index) => <button
              key={item.id}
              id={`profile-tab-${item.id}`}
              role="tab"
              ref={element => { refs.current[index] = element; }}
              aria-controls="coffee-profile-panel"
              aria-selected={index === selected}
              tabIndex={index === selected ? 0 : -1}
              onClick={() => setSelected(index)}
              onKeyDown={event => choose(event, index)}
              type="button"
            ><span className="coffee-profile-index">0{index + 1}</span><span>{item.name}</span><Arrow /></button>)}
          </div>
          <div className="coffee-profile-panel" id="coffee-profile-panel" role="tabpanel" aria-labelledby={`profile-tab-${profile.id}`} tabIndex={0}>
            <span className="coffee-profile-line">{profile.line}</span>
            <p className="coffee-profile-description">{profile.description}</p>
            <div className="coffee-profile-notes"><span>NOTES DE DÉGUSTATION</span><p>{profile.notes}</p></div>
            <div className="coffee-profile-specs"><div><span>TORRÉFACTION</span><strong>{profile.roast}</strong></div><div><span>INTENSITÉ</span><div className="coffee-intensity" aria-label={`${profile.strength} sur 5`}>{[1, 2, 3, 4, 5].map(i => <i key={i} className={i <= profile.strength ? 'is-filled' : ''} aria-hidden="true" />)}</div></div></div>
          </div>
        </div>
        <div className="coffee-selection-photo">
          <EditorialPhoto src="/images/roast-detail.webp" alt="Grains de café torréfiés en gros plan sous une lumière rasante ambrée" className="coffee-bean-image" />
          <div className="coffee-photo-title" aria-hidden="true"><span>ATELIER</span><em>COFFEE.</em></div>
        </div>
      </div>
      <p className="collection-disclaimer">Collection d’inspiration. ATELIER COFFEE est une marque fictive.</p>
    </section>

    <section className="atelier-closing" aria-labelledby="atelier-closing-title">
      <p className="editorial-kicker">LE TEMPS D’UN ESPRESSO.</p>
      <h2 id="atelier-closing-title">Une goutte.<br /><em>Tout un monde.</em></h2>
      <a className="editorial-link" href="#process">REVIVRE LE RITUEL <Arrow /></a>
    </section>
  </>;
}
