import React, { useState } from 'react'

// Replace this placeholder with the production webhook URL from n8n.
export const N8N_WEBHOOK_URL = 'https://studentfeedbackauto.app.n8n.cloud/webhook-test/student-feedback'

const initialForm = {
  studentName: '',
  email: '',
  courseName: '',
  rating: '',
  message: '',
}

const Home = () => {
  const [form, setForm] = useState(initialForm)
  const [errors, setErrors] = useState({})
  const [status, setStatus] = useState({ type: '', message: '' })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const updateField = (event) => {
    const { name, value } = event.target
    setForm((currentForm) => ({ ...currentForm, [name]: value }))
    setErrors((currentErrors) => ({ ...currentErrors, [name]: '' }))
    setStatus({ type: '', message: '' })
  }

  const validateForm = () => {
    const nextErrors = {}
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    if (!form.studentName.trim()) nextErrors.studentName = 'Enter your name.'
    if (!form.email.trim()) nextErrors.email = 'Enter your email address.'
    else if (!emailPattern.test(form.email.trim())) nextErrors.email = 'Enter a valid email address.'
    if (!form.courseName.trim()) nextErrors.courseName = 'Enter the course name.'
    if (!form.rating) nextErrors.rating = 'Choose a rating from 1 to 5.'
    if (!form.message.trim()) nextErrors.message = 'Share a little feedback.'

    return nextErrors
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const nextErrors = validateForm()

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      setStatus({ type: 'error', message: 'Please review the highlighted fields.' })
      return
    }

    setIsSubmitting(true)
    setStatus({ type: '', message: '' })

    try {
      const response = await fetch(N8N_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentName: form.studentName.trim(),
          email: form.email.trim(),
          courseName: form.courseName.trim(),
          rating: Number(form.rating),
          message: form.message.trim(),
        }),
      })

      if (!response.ok) throw new Error(`Request failed with status ${response.status}`)

      setForm(initialForm)
      setErrors({})
      setStatus({ type: 'success', message: 'Thanks for your feedback. Your response has been received.' })
    } catch (error) {
      setStatus({ type: 'error', message: 'We could not submit your feedback. Please try again.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const fieldError = (name) => errors[name] && <span className="field-error">{errors[name]}</span>

  return (
    <main className="feedback-page">
      <section className="feedback-shell" aria-labelledby="feedback-title">
        <div className="intro-panel">
          <span className="eyebrow">Student voice / 01</span>
          <h1 id="feedback-title">Shape what comes next.</h1>
          <p>Your perspective helps us make every course clearer, more useful, and more human.</p>
          <div className="intro-rule" />
          <p className="intro-note">A thoughtful response takes less than two minutes.</p>
        </div>

        <form className="feedback-form" onSubmit={handleSubmit} noValidate>
          <div className="form-heading">
            <span className="form-kicker">Course feedback</span>
            <h2>Tell us how it felt.</h2>
          </div>

          {status.message && (
            <div className={`status-message ${status.type}`} role="alert">
              {status.message}
            </div>
          )}

          <div className="field-grid">
            <label className="field">
              <span>Student name</span>
              <input name="studentName" value={form.studentName} onChange={updateField} aria-invalid={Boolean(errors.studentName)} placeholder="Your full name" />
              {fieldError('studentName')}
            </label>
            <label className="field">
              <span>Email address</span>
              <input type="email" name="email" value={form.email} onChange={updateField} aria-invalid={Boolean(errors.email)} placeholder="you@example.com" />
              {fieldError('email')}
            </label>
            <label className="field field-wide">
              <span>Course name</span>
              <input name="courseName" value={form.courseName} onChange={updateField} aria-invalid={Boolean(errors.courseName)} placeholder="e.g. Introduction to Psychology" />
              {fieldError('courseName')}
            </label>
            <label className="field">
              <span>Overall rating</span>
              <select name="rating" value={form.rating} onChange={updateField} aria-invalid={Boolean(errors.rating)}>
                <option value="">Select rating</option>
                <option value="5">5 - Excellent</option>
                <option value="4">4 - Good</option>
                <option value="3">3 - Okay</option>
                <option value="2">2 - Needs work</option>
                <option value="1">1 - Poor</option>
              </select>
              {fieldError('rating')}
            </label>
          </div>

          <label className="field">
            <span>Feedback message</span>
            <textarea name="message" value={form.message} onChange={updateField} aria-invalid={Boolean(errors.message)} placeholder="What worked well? What could be improved?" rows="5" />
            {fieldError('message')}
          </label>

          <button className="submit-button" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Sending response...' : 'Send feedback'}
            <span aria-hidden="true">&#8594;</span>
          </button>
        </form>
      </section>
    </main>
  )
}

export default Home
