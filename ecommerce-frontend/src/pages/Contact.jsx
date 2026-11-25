import { useState } from 'react'

function Contact() {
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (event) => {
    event.preventDefault()
    setSubmitted(true)
    event.currentTarget.reset()
  }

  return (
    <section className="mx-auto grid max-w-7xl gap-12 px-5 py-12 sm:px-8 sm:py-16 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-[#526553]">
          We are here to help
        </p>
        <h1 className="mt-3 font-serif text-4xl leading-tight text-[#292b25] sm:text-5xl">
          Get in touch.
        </h1>
        <p className="mt-5 max-w-md leading-7 text-[#66645b]">
          Questions about a piece or an order? Send us a note and we will be
          glad to help.
        </p>
      </div>

      <form className="space-y-5" onSubmit={handleSubmit}>
        <label className="block text-xs font-medium text-[#625f57]">
          Name
          <input
            autoComplete="name"
            className="mt-2 min-h-12 w-full border border-[#d9d6cd] bg-white px-3 text-sm outline-none focus:border-[#526553]"
            maxLength={100}
            name="name"
            onChange={() => setSubmitted(false)}
            required
          />
        </label>
        <label className="block text-xs font-medium text-[#625f57]">
          Email
          <input
            autoComplete="email"
            className="mt-2 min-h-12 w-full border border-[#d9d6cd] bg-white px-3 text-sm outline-none focus:border-[#526553]"
            name="email"
            onChange={() => setSubmitted(false)}
            required
            type="email"
          />
        </label>
        <label className="block text-xs font-medium text-[#625f57]">
          Subject
          <input
            className="mt-2 min-h-12 w-full border border-[#d9d6cd] bg-white px-3 text-sm outline-none focus:border-[#526553]"
            maxLength={150}
            name="subject"
            onChange={() => setSubmitted(false)}
            required
          />
        </label>
        <label className="block text-xs font-medium text-[#625f57]">
          Message
          <textarea
            className="mt-2 w-full border border-[#d9d6cd] bg-white px-3 py-3 text-sm outline-none focus:border-[#526553]"
            maxLength={2000}
            minLength={10}
            name="message"
            onChange={() => setSubmitted(false)}
            required
            rows={5}
          />
        </label>
        <button
          className="min-h-12 bg-[#526553] px-7 text-sm font-medium text-white hover:bg-[#3f5040]"
          type="submit"
        >
          Prepare message
        </button>
        {submitted && (
          <p className="bg-[#edf1ea] p-4 text-sm leading-6 text-[#405444]" role="status">
            Your message passed the form checks. Message delivery is not
            connected in this demo, so nothing has been sent.
          </p>
        )}
      </form>
    </section>
  )
}

export default Contact
