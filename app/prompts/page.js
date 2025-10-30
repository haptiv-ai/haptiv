"use client";

const categories = {
  "Understanding the Real Problem": [
    `Help me identify the real service problem behind my product idea. My product does [describe it]. What pain points in healthcare delivery, workflow, or patient experience might this actually solve or worsen?`,
    `Ask me five questions to uncover where my product could fail in the real healthcare environment—especially around access, trust, or workflow fit.`,
    `Summarise what data, feedback, or evidence I would need to prove this is solving a real service problem rather than a product feature gap.`
  ]
  // Add other sections from your library.
};

export default function Page(){
  const copy = async (t) => navigator.clipboard.writeText(t);
  return (
    <main className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-serif mb-4">Prompt Library</h1>
      {Object.entries(categories).map(([k, arr])=>(
        <section key={k} className="mb-8">
          <h2 className="text-xl font-medium mb-2">{k}</h2>
          <div className="grid md:grid-cols-2 gap-3">
            {arr.map((p,i)=>(
              <div key={i} className="border rounded p-3 bg-white">
                <p className="text-sm whitespace-pre-wrap">{p}</p>
                <button onClick={()=>copy(p)} className="mt-2 border px-3 py-1 rounded">Copy</button>
              </div>
            ))}
          </div>
        </section>
      ))}
    </main>
  );
}
