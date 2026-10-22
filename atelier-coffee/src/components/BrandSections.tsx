export default function BrandSections() {
  return <section className="atelier-story" id="story" aria-labelledby="atelier-story-title">
    <span id="cafes" className="anchor-alias" aria-hidden="true" />
    <span id="univers" className="anchor-alias" aria-hidden="true" />
    <div className="atelier-story-copy">
      <p className="editorial-kicker">L’ATELIER</p>
      <h2 id="atelier-story-title">Le soin du geste.</h2>
      <p>Le grain fraîchement moulu, l’eau à bonne température, une extraction suivie à la seconde. Le plaisir d’un espresso tient à ces détails.</p>
    </div>
    <figure className="atelier-story-photo">
      <img
        src="/images/atelier-detail.webp"
        alt="Main d’un barista tassant le café dans un porte-filtre en acier, sous une lumière ambrée"
        width="1280"
        height="854"
        loading="lazy"
        decoding="async"
      />
      <figcaption>Avant la première goutte.</figcaption>
    </figure>
  </section>;
}
