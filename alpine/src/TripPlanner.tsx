import { useId, useRef, useState, type FormEvent } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { ArrowLeft, ArrowUpRight, Check, Mountain, Snowflake, Sun, X } from 'lucide-react'
import './trip-planner.css'

type Mood = 'ski' | 'slow' | 'friends'

const moods: { id: Mood; label: string; detail: string; icon: typeof Mountain }[] = [
  { id: 'ski', label: 'Grand ski', detail: 'La première trace.', icon: Mountain },
  { id: 'slow', label: 'Slow altitude', detail: 'Le temps de respirer.', icon: Sun },
  { id: 'friends', label: 'Entre amis', detail: 'Les souvenirs ensemble.', icon: Snowflake },
]

const suggestions: Record<Mood, { title: string; description: string }[]> = {
  ski: [
    { title: 'Le domaine pour horizon.', description: 'Commencer sur les pistes de Val Thorens, puis élargir le terrain de jeu aux 3 Vallées selon votre niveau et le forfait choisi.' },
    { title: 'Un déjeuner au-dessus du quotidien.', description: 'Déchausser pour une terrasse d’altitude, prendre le soleil et laisser le panorama prolonger la pause.' },
    { title: 'Le grand angle de Cime Caron.', description: 'Rejoindre le panorama de Cime Caron à 3 200 m, si les remontées et la météo le permettent. La montagne donne le tempo.' },
  ],
  slow: [
    { title: 'Le matin, sans réveil.', description: 'Un café dans le village, une promenade à pied sur les itinéraires accessibles et le plaisir de regarder la montagne s’éveiller.' },
    { title: 'Une parenthèse au chaud.', description: 'Retrouver Le Board, le centre sportif et de bien-être de Val Thorens, pour une pause piscine ou spa selon les espaces ouverts.' },
    { title: 'La lumière comme souvenir.', description: 'Choisir une terrasse avec vue, puis une table dans le village. Garder une soirée libre, juste pour le plaisir de ne rien prévoir.' },
  ],
  friends: [
    { title: 'À chacun sa première descente.', description: 'Se retrouver sur un secteur adapté au niveau de chacun. Un cours avec une école de ski locale peut donner le même élan à tout le groupe.' },
    { title: 'Le rendez-vous en terrasse.', description: 'Fixer un déjeuner d’altitude comme point de ralliement, puis repartir ensemble ou à son rythme sur le domaine.' },
    { title: 'Quand le village s’anime.', description: 'Laisser les skis au repos et partager une soirée à Val Thorens : spécialités savoyardes, musique et histoires de la journée.' },
  ],
}

function localDate(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

export default function TripPlanner({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const id = useId()
  const today = localDate(new Date())
  const [arrival, setArrival] = useState('')
  const [nights, setNights] = useState('5')
  const [guests, setGuests] = useState('2')
  const [mood, setMood] = useState<Mood>('ski')
  const [result, setResult] = useState(false)
  const [error, setError] = useState('')
  const openerRef = useRef<HTMLElement | null>(null)

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!arrival || arrival < today) {
      setError('Choisissez une date d’arrivée à partir d’aujourd’hui.')
      document.getElementById(`${id}-arrival`)?.focus()
      return
    }
    setError('')
    setResult(true)
    requestAnimationFrame(() => document.getElementById(`${id}-result`)?.focus())
  }

  const selectedMood = moods.find((item) => item.id === mood)!
  const formattedArrival = arrival ? new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(`${arrival}T12:00:00`)) : ''

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="trip-overlay" />
        <Dialog.Content
          className="trip-dialog"
          onOpenAutoFocus={() => {
            openerRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null
          }}
          onCloseAutoFocus={(event) => {
            event.preventDefault()
            const opener = openerRef.current
            if (opener?.isConnected && opener !== document.body) opener.focus()
            else document.querySelector<HTMLButtonElement>('.button--header')?.focus()
          }}
        >
          <Dialog.Close className="trip-close" aria-label="Fermer le séjour"><X size={21} /></Dialog.Close>
          <div className="trip-kicker"><span /> VOTRE PARENTHÈSE ALPINE</div>
          <Dialog.Title className="trip-title">{result ? 'Votre envie de là-haut.' : 'Et si on partait là-haut ?'}</Dialog.Title>
          <Dialog.Description className="trip-description">{result ? 'Une première inspiration à faire vôtre.' : 'Quelques envies. Une montagne de possibilités.'}</Dialog.Description>

          {!result ? (
            <form className="trip-form" onSubmit={submit}>
              <div className="trip-fields">
                <div className="trip-field trip-date-field">
                  <label htmlFor={`${id}-arrival`}>Votre arrivée</label>
                  <input id={`${id}-arrival`} type="date" required min={today} value={arrival} onChange={(event) => { setArrival(event.target.value); setError('') }} aria-describedby={error ? `${id}-error` : undefined} aria-invalid={!!error} />
                </div>
                <div className="trip-field">
                  <label htmlFor={`${id}-nights`}>La durée</label>
                  <select id={`${id}-nights`} value={nights} onChange={(event) => setNights(event.target.value)}>
                    <option value="3">3 nuits</option><option value="5">5 nuits</option><option value="7">7 nuits</option>
                  </select>
                </div>
                <div className="trip-field">
                  <label htmlFor={`${id}-guests`}>Les voyageurs</label>
                  <select id={`${id}-guests`} value={guests} onChange={(event) => setGuests(event.target.value)}>
                    {Array.from({ length: 8 }, (_, index) => <option value={index + 1} key={index}>{index + 1} {index === 0 ? 'personne' : 'personnes'}</option>)}
                  </select>
                </div>
              </div>
              {error && <p className="trip-error" id={`${id}-error`} role="alert">{error}</p>}
              <fieldset className="trip-moods">
                <legend>Votre état d’esprit</legend>
                <div className="trip-mood-grid">
                  {moods.map(({ id: moodId, label, detail, icon: Icon }) => (
                    <label key={moodId} className={`trip-mood ${mood === moodId ? 'is-selected' : ''}`}>
                      <input type="radio" name={`${id}-mood`} value={moodId} checked={mood === moodId} onChange={() => setMood(moodId)} />
                      <Icon size={25} strokeWidth={1.35} aria-hidden="true" />
                      <strong>{label}</strong><span>{detail}</span>
                      {mood === moodId && <Check className="trip-mood-check" size={14} aria-hidden="true" />}
                    </label>
                  ))}
                </div>
              </fieldset>
              <button type="submit" className="trip-primary">Dessiner mon séjour <ArrowUpRight size={20} aria-hidden="true" /></button>
              <p className="trip-fineprint">Une sélection d’idées, sans réservation ni paiement.</p>
            </form>
          ) : (
            <div className="trip-result" id={`${id}-result`} tabIndex={-1}>
              <div className="trip-summary"><span>{formattedArrival}</span><span>{nights} nuits · {guests} {guests === '1' ? 'personne' : 'personnes'}</span><strong>{selectedMood.label}</strong></div>
              <ol className="trip-itinerary">
                {suggestions[mood].map((item, index) => <li key={item.title}><span className="trip-step">0{index + 1}</span><div><h3>{item.title}</h3><p>{item.description}</p></div></li>)}
              </ol>
              <p className="trip-availability">À adapter à la saison, à votre niveau et aux ouvertures du moment. Retrouvez les disponibilités et les réservations auprès de la station.</p>
              <a className="trip-primary" href="https://www.valthorens.com/" target="_blank" rel="noreferrer">Consulter le site officiel <ArrowUpRight size={20} aria-hidden="true" /></a>
              <button className="trip-back" type="button" onClick={() => setResult(false)}><ArrowLeft size={16} aria-hidden="true" /> Modifier mes envies</button>
            </div>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
