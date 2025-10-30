"use client";
import { useRef, useState } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export default function Agent(){
  const [form,setForm]=useState({
    product:"",
    users:"Patients, Clinicians",
    setting:"NHS, home",
    startup_stage:"prototype",
    tech_maturity:"medium",
    data_flows:"PHI in app, EHR integration",
    integrations:"FHIR, EMIS",
    risk_area_focus:"safety, privacy"
  });
  const [summary,setSummary]=useState("");
  const [gap,setGap]=useState(null);
  const [plan,setPlan]=useState(null);
  const [bp,setBp]=useState(null);
  const bpRef=useRef(null);

  const onChange = key => e => setForm(s=>({ ...s, [key]: e.target.value }));

  const run = async ()=>{
    const input = {
      ...form,
      users: form.users.split(",").map(s=>s.trim()).filter(Boolean),
      setting: form.setting.split(",").map(s=>s.trim()).filter(Boolean),
      data_flows: form.data_flows.split(",").map(s=>s.trim()).filter(Boolean),
      integrations: form.integrations.split(",").map(s=>s.trim()).filter(Boolean),
      risk_area_focus: form.risk_area_focus.split(",").map(s=>s.trim()).filter(Boolean),
      evidence:{}, criteria:{}
    };
    const res = await fetch("/api/agent", { method:"POST", body: JSON.stringify({ input }) });
    if(!res.ok){ setSummary("Error: API not reachable."); return; }
    const { text } = await res.json();
    setSummary(text.replace(/```json[\s\S]*?```/g,"").trim()||"Summary unavailable.");
    const ga = text.match(/```json\s*GAP_ANALYSIS([\s\S]*?)```/i);
    const rp = text.match(/```json\s*READINESS_PLAN([\s\S]*?)```/i);
    const bl = text.match(/```json\s*BLUEPRINT([\s\S]*?)```/i);
    try{ setGap(ga?JSON.parse(ga[1]):null);}catch{}
    try{ setPlan(rp?JSON.parse(rp[1]):null);}catch{}
    try{ setBp(bl?JSON.parse(bl[1]):null);}catch{}
  };

  const exportPNG = async ()=>{
    if(!bpRef.current) return;
    const c = await html2canvas(bpRef.current);
    const a = document.createElement("a");
    a.href = c.toDataURL("image/png"); a.download = "service-blueprint.png"; a.click();
  };
  const exportPDF = async ()=>{
    if(!bpRef.current) return;
    const c = await html2canvas(bpRef.current);
    const pdf = new jsPDF({ orientation:"landscape", unit:"pt", format:"a4" });
    const w = pdf.internal.pageSize.getWidth(); const h = (c.height*w)/c.width;
    pdf.addImage(c.toDataURL("image/png"), "PNG", 0, 0, w, h); pdf.save("service-blueprint.pdf");
  };
  const exportJSON = ()=>{
    const blob = new Blob([JSON.stringify({ gap, readiness:plan, blueprint:bp }, null, 2)], { type:"application/json" });
    const url = URL.createObjectURL(blob); const a=document.createElement("a"); a.href=url; a.download="haptiv-output.json"; a.click();
  };

  return (
    <main className="max-w-6xl mx-auto p-6 grid md:grid-cols-2 gap-6">
      <section className="space-y-4">
        <h1 className="text-2xl font-serif">Agentic AI Facilitator</h1>

        <label className="block text-sm">Product description
          <textarea className="mt-1 w-full border rounded p-2" rows={5}
            value={form.product} onChange={onChange("product")}
            placeholder="What it does, who uses it, where, and the problem it solves"/>
        </label>

        <div className="grid md:grid-cols-2 gap-3">
          <label className="text-sm">Users
            <input className="mt-1 w-full border rounded p-2" value={form.users} onChange={onChange("users")}/>
          </label>
          <label className="text-sm">Setting
            <input className="mt-1 w-full border rounded p-2" value={form.setting} onChange={onChange("setting")}/>
          </label>
          <label className="text-sm">Startup stage
            <select className="mt-1 w-full border rounded p-2" value={form.startup_stage} onChange={onChange("startup_stage")}>
              <option>idea</option><option>prototype</option><option>pilot</option><option>live</option>
            </select>
          </label>
          <label className="text-sm">Tech maturity
            <select className="mt-1 w-full border rounded p-2" value={form.tech_maturity} onChange={onChange("tech_maturity")}>
              <option>low</option><option>medium</option><option>high</option>
            </select>
          </label>
          <label className="text-sm">Data flows
            <input className="mt-1 w-full border rounded p-2" value={form.data_flows} onChange={onChange("data_flows")} placeholder="PHI in app, EHR integration"/>
          </label>
          <label className="text-sm">Integrations
            <input className="mt-1 w-full border rounded p-2" value={form.integrations} onChange={onChange("integrations")} placeholder="FHIR, EMIS"/>
          </label>
          <label className="col-span-2 text-sm">Risk focus
            <input className="mt-1 w-full border rounded p-2" value={form.risk_area_focus} onChange={onChange("risk_area_focus")} placeholder="safety, privacy, bias"/>
          </label>
        </div>

        <button onClick={run} className="bg-[var(--brand-vermillion)] text-white px-4 py-2 rounded">Generate</button>

        <div className="border rounded p-3 bg-white text-sm min-h-[90px]">
          <p className="whitespace-pre-wrap">{summary || "Summary will appear here after Generate."}</p>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-serif">Outputs</h2>

        <div className="border rounded p-3 bg-white">
          <h3 className="font-medium">Gap analysis</h3>
          {!gap && <p className="text-sm text-gray-500">Runs after Generate.</p>}
          {gap && (
            <table className="w-full mt-2 text-sm border">
              <thead><tr><th className="border p-2">Rule</th><th className="border p-2">Severity</th><th className="border p-2">Status</th><th className="border p-2">Missing evidence</th></tr></thead>
              <tbody>
                {gap.map((g,i)=>(
                  <tr key={i}>
                    <td className="border p-2">{g.title}</td>
                    <td className="border p-2">{g.severity}</td>
                    <td className="border p-2">{g.status}</td>
                    <td className="border p-2">{(g.evidence_missing||[]).join(", ")||"—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="border rounded p-3 bg-white">
          <h3 className="font-medium">Readiness plan</h3>
          {!plan && <p className="text-sm text-gray-500">Runs after Generate.</p>}
          {plan && (
            <ol className="list-decimal ml-5 text-sm">
              {plan.map((p,i)=>(
                <li key={i} className="mt-1">
                  <b>{p.theme}</b> — {p.steps.join("; ")} • {p.timebox_weeks} weeks • Owner: {p.owner}
                </li>
              ))}
            </ol>
          )}
        </div>

        <div className="border rounded p-3 bg-white" ref={bpRef}>
          <h3 className="font-medium">Service blueprint</h3>
          {!bp && <p className="text-sm text-gray-500">Runs after Generate.</p>}
          {bp && <BlueprintGrid bp={bp} />}
        </div>

        <div className="flex gap-2">
          <button onClick={exportPNG} className="border px-3 py-2 rounded">Export PNG</button>
          <button onClick={exportPDF} className="border px-3 py-2 rounded">Export PDF</button>
          <button onClick={exportJSON} className="border px-3 py-2 rounded">Download JSON</button>
        </div>
      </section>
    </main>
  );
}

function BlueprintGrid({ bp }){
  const cols = bp.stages || [];
  const rows = [
    { label:"Frontstage", data: bp.frontstage || [] },
    { label:"Backstage", data: bp.backstage || [] },
    { label:"Systems", data: bp.systems || [] },
  ];
  return (
    <div className="text-sm">
      <div className="mb-2"><b>Actors:</b> {(bp.actors||[]).join(", ")}</div>
      <table className="w-full text-left border">
        <thead>
          <tr><th className="border p-2 w-40">Lane</th>{cols.map((c,i)=><th key={i} className="border p-2">{c}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((r,ri)=>(
            <tr key={ri}>
              <td className="border p-2 font-medium">{r.label}</td>
              {cols.map((_,ci)=>(
                <td key={ci} className="border p-2 align-top">
                  <ul className="list-disc ml-4">{(r.data?.[ci]||[]).map((it,ii)=><li key={ii}>{it}</li>)}</ul>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {(bp.risks||[]).length>0 && (
        <div className="mt-2">
          <b>Risks:</b>
          <ul className="list-disc ml-5">
            {bp.risks.map((r,i)=><li key={i}><b>{r.stage}:</b> {r.risk} — mitigation: {r.mitigation}</li>)}
          </ul>
        </div>
      )}
    </div>
  );
}
