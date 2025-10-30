import Link from "next/link";

export default function Home(){
  return (
    <main className="max-w-5xl mx-auto p-6">
      <section className="py-16">
        <h1 className="text-4xl font-serif">Design your healthcare service with Agentic AI</h1>
        <p className="mt-4 text-lg max-w-2xl">Describe your product. Get a mapped journey, gap analysis, and a readiness plan in minutes.</p>
        <Link href="/agent" className="inline-block mt-6 bg-[var(--brand-vermillion)] text-white px-6 py-3 rounded">Launch Agentic AI</Link>
        <p className="mt-2 text-sm text-gray-600">No signup required.</p>
      </section>
      <section className="grid md:grid-cols-3 gap-6">
        {[
          ["Tell it what you’re building","Plain-English inputs"],
          ["Get your blueprint","Actors, stages, systems"],
          ["Close your gaps","Prioritised steps with evidence"]
        ].map(([t,s],i)=>(
          <div key={i} className="border rounded p-4 bg-white">
            <h3 className="font-medium">{t}</h3>
            <p className="text-sm mt-2">{s}</p>
          </div>
        ))}
      </section>
      <section className="mt-10 border-t pt-6">
        <h3 className="font-serif text-xl">Use our prompts anywhere</h3>
        <p className="text-sm mt-2">Browse the Haptiv Prompt Library or run them inside the Agent.</p>
        <div className="flex gap-3 mt-3">
          <Link href="/prompts" className="border px-4 py-2 rounded">Browse Prompt Library</Link>
          <Link href="/agent" className="border px-4 py-2 rounded">Use in Agentic AI</Link>
        </div>
      </section>
    </main>
  );
}
