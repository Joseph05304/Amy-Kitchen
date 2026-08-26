import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext.jsx'
import './Reservations.css'

const today = new Date().toISOString().split('T')[0]

const TIMES = [
  '11:00',
  '11:30',
  '12:00',
  '12:30',
  '13:00',
  '13:30',
  '18:00',
  '18:30',
  '19:00',
  '19:30',
  '20:00',
  '20:30',
  '21:00',
]

export default function Reservations() {
  const { addReservation } = useCart()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    date: '',
    time: '',
    guests: 2,
    seating: 'indoor',
    requests: '',
  })
  const [errors, setErrors] = useState({})
  const [done, setDone] = useState(null)

  const update = (key, value) => {
    setForm((f) => ({ ...f, [key]: value }))
    setErrors((e) => ({ ...e, [key]: undefined }))
  }

  const validate = () => {
    const e = {}
    if (!form.name.trim()) e.name = 'Please enter your name.'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      e.email = 'Enter a valid email.'
    if (!/^[0-9+()\-\s]{7,}$/.test(form.phone))
      e.phone = 'Enter a valid phone number.'
    if (!form.date) e.date = 'Choose a date.'
    else if (form.date < today) e.date = 'Date cannot be in the past.'
    if (!form.time) e.time = 'Choose a time.'
    if (form.guests < 1 || form.guests > 20)
      e.guests = 'Party size must be 1–20.'
    return e
  }

  const handleSubmit = async (ev) => {
    ev.preventDefault()
    const e = validate()
    if (Object.keys(e).length) {
      setErrors(e)
      return
    }
    const record = await addReservation(form)
    setDone(record)
    setForm({
      name: '',
      email: '',
      phone: '',
      date: '',
      time: '',
      guests: 2,
      seating: 'indoor',
      requests: '',
    })
  }

  if (done) {
    return (
      <div className="section container res-done">
        <div className="card res-done-card">
          <div className="res-check">✅</div>
          <h2>Table booked!</h2>
          <p>
            Thanks {done.name}. We’ve reserved a table for {done.guests} on{' '}
            <strong>{done.date}</strong> at <strong>{done.time}</strong> (
            {done.seating}).
          </p>
          <p className="res-id">
            Confirmation: <strong>{done.id}</strong>
          </p>
          <div className="res-done-actions">
            <button className="btn" onClick={() => navigate('/bookings')}>
              View my bookings
            </button>
            <button className="btn btn-secondary" onClick={() => setDone(null)}>
              Book another
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="section container res-page">
      <h2 className="section-title">Reserve a table</h2>
      <p className="section-subtitle">
        Tell us when you’re coming — we’ll save you a seat.
      </p>

      <form className="card res-form" onSubmit={handleSubmit} noValidate>
        <div className="res-row">
          <div className="res-field">
            <label htmlFor="name">Full name</label>
            <input
              id="name"
              value={form.name}
              onChange={(e) => update('name', e.target.value)}
              placeholder="Jane Doe"
            />
            {errors.name && <span className="err">{errors.name}</span>}
          </div>
          <div className="res-field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={form.email}
              onChange={(e) => update('email', e.target.value)}
              placeholder="jane@email.com"
            />
            {errors.email && <span className="err">{errors.email}</span>}
          </div>
        </div>

        <div className="res-row">
          <div className="res-field">
            <label htmlFor="phone">Phone</label>
            <input
              id="phone"
              value={form.phone}
              onChange={(e) => update('phone', e.target.value)}
              placeholder="(555) 012-3456"
            />
            {errors.phone && <span className="err">{errors.phone}</span>}
          </div>
          <div className="res-field">
            <label htmlFor="guests">Party size</label>
            <input
              id="guests"
              type="number"
              min="1"
              max="20"
              value={form.guests}
              onChange={(e) => update('guests', Number(e.target.value))}
            />
            {errors.guests && <span className="err">{errors.guests}</span>}
          </div>
        </div>

        <div className="res-row">
          <div className="res-field">
            <label htmlFor="date">Date</label>
            <input
              id="date"
              type="date"
              min={today}
              value={form.date}
              onChange={(e) => update('date', e.target.value)}
            />
            {errors.date && <span className="err">{errors.date}</span>}
          </div>
          <div className="res-field">
            <label htmlFor="time">Time</label>
            <select
              id="time"
              value={form.time}
              onChange={(e) => update('time', e.target.value)}
            >
              <option value="">Select…</option>
              {TIMES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
            {errors.time && <span className="err">{errors.time}</span>}
          </div>
        </div>

        <div className="res-field">
          <label>Seating preference</label>
          <div className="res-seating">
            <label className="res-radio">
              <input
                type="radio"
                name="seating"
                checked={form.seating === 'indoor'}
                onChange={() => update('seating', 'indoor')}
              />
              Indoor
            </label>
            <label className="res-radio">
              <input
                type="radio"
                name="seating"
                checked={form.seating === 'outdoor'}
                onChange={() => update('seating', 'outdoor')}
              />
              Outdoor
            </label>
            <label className="res-radio">
              <input
                type="radio"
                name="seating"
                checked={form.seating === 'any'}
                onChange={() => update('seating', 'any')}
              />
              No preference
            </label>
          </div>
        </div>

        <div className="res-field">
          <label htmlFor="requests">Special requests (optional)</label>
          <textarea
            id="requests"
            rows="3"
            value={form.requests}
            onChange={(e) => update('requests', e.target.value)}
            placeholder="Allergies, celebrations, high chair…"
          />
        </div>

        <button type="submit" className="btn res-submit">
          Confirm reservation
        </button>
      </form>
    </div>
  )
}
