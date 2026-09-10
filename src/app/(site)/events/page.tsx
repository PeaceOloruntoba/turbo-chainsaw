import type { Metadata } from 'next'
import { getPayloadClient } from '@/lib/payload'

export const metadata: Metadata = {
  title: 'Events',
  description:
    'Nigeria Lex Roundtables, investor briefings, general counsel briefings, sector forums and research presentations.',
  alternates: { canonical: '/events' },
}

async function getUpcomingEvents() {
  try {
    const payload = await getPayloadClient()
    const result = await payload.find({
      collection: 'events',
      sort: 'eventDate',
      limit: 50,
      depth: 0,
    })
    return result.docs
  } catch {
    return []
  }
}

export default async function EventsPage() {
  const events = await getUpcomingEvents()

  return (
    <div className="container max-w-3xl py-16 md:py-20">
      <p className="text-[12px] font-semibold uppercase tracking-[0.06em] text-green">Events</p>
      <h1 className="mt-2 font-serif text-3xl text-navy md:text-4xl">
        Roundtables, briefings and research presentations.
      </h1>

      {events.length === 0 ? (
        <div className="mt-10 rounded-sm border border-line bg-white p-8">
          <p className="font-serif text-lg text-navy">No events are currently scheduled.</p>
          <p className="mt-2 text-[14px] text-slate">
            Nigeria Lex Roundtables, investor briefings, sector forums and research presentations
            will be listed here as they are confirmed.
          </p>
        </div>
      ) : (
        <ul className="mt-10 divide-y divide-line border-t border-line">
          {events.map((event: any) => (
            <li key={event.id} className="py-6">
              <p className="text-[12px] font-semibold uppercase tracking-[0.06em] text-green">
                {new Date(event.eventDate).toLocaleDateString('en-GB', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </p>
              <h2 className="mt-2 font-serif text-xl text-navy">{event.title}</h2>
              <p className="mt-1 text-[14px] text-slate">{event.venue}</p>
              {event.speakers?.length > 0 && (
                <p className="mt-2 text-[13px] text-slate">
                  Speakers:{' '}
                  {event.speakers.map((s: any) => s.name).join(', ')}
                </p>
              )}
              {event.registrationUrl && (
                <a
                  href={event.registrationUrl}
                  className="mt-3 inline-block text-[13px] font-semibold text-green"
                >
                  Register →
                </a>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
