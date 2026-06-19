"use client";

const testimonials = [
  {
    quote: "My students no longer watch the clock. They watch the screen with wonder.",
    name: "Ms. Priya",
    location: "Mumbai",
    avatar: "https://i.pravatar.cc/100?img=5",
  },
  {
    quote: "The Hindi translation of complex bio terms is a life-saver in my rural class.",
    name: "Mr. Anand",
    location: "Patna",
    avatar: "https://i.pravatar.cc/100?img=11",
  },
  {
    quote: "Visual kits for physics helped me explain gravity in 5 minutes.",
    name: "Ms. Elena",
    location: "Toronto",
    avatar: "https://i.pravatar.cc/100?img=9",
  },
  {
    quote: "EduAgent isn't a tool, it's my co-pilot in the classroom.",
    name: "Mr. David",
    location: "London",
    avatar: "https://i.pravatar.cc/100?img=12",
  },
  {
    quote: "I used to dread Monday mornings. Now I can't wait to show my students something new.",
    name: "Ms. Rekha",
    location: "Chennai",
    avatar: "https://i.pravatar.cc/100?img=20",
  },
];

function TestimonialCard({
  quote,
  name,
  location,
  avatar,
}: {
  quote: string;
  name: string;
  location: string;
  avatar: string;
}) {
  return (
    <div className="glass-card px-8 py-6 rounded-2xl min-w-[360px] flex flex-col gap-6">
      <p className="text-on-surface leading-relaxed text-lg">{quote}</p>
      <div className="flex items-center gap-4 mt-auto">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={avatar}
          alt={name}
          className="w-10 h-10 rounded-full object-cover border border-white/20"
        />
        <span className="text-sm uppercase tracking-widest text-on-surface-variant">
          {name}, {location}
        </span>
      </div>
    </div>
  );
}

export default function TestimonialsMarquee() {
  // Double the array for seamless infinite loop
  const doubled = [...testimonials, ...testimonials];

  return (
    <section className="py-16 border-y border-white/10 bg-[#121318]/50 overflow-hidden">
      <div className="animate-marquee-slow gap-8 px-4 flex">
        {doubled.map((t, i) => (
          <TestimonialCard key={i} {...t} />
        ))}
      </div>
    </section>
  );
}
