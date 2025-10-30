export const runtime = "edge";

import OpenAI from "openai";
import rules from "@/configs/regulations.json";

function anyOverlap(a = [], b = []) { return b.some(x => a.includes(x)); }
function applies(rule, u){
  const x = rule.applies_if || {};
  if (x.setting_includes && !anyOverlap(u.setting, x.setting_includes)) return false;
  if (x.data_flows_includes && !anyOverlap(u.data_flows, x.data_flows_includes)) return false;
  if (x.integrations_includes && !anyOverlap(u.integrations, x.integrations_includes)) return false;
  if (x.risk_area_focus_includes && !anyOverlap(u.risk_area_focus, x.risk_area_focus_includes)) return false;
  if (x.product_includes && !x.product_includes.some(s => (u.product||"").toLowerCase().includes(String(s).toLowerCase()))) return false;
  return true;
}
const sevW = s => s==="high"?3:s==="med"?2:1;
const stageF = s => s==="idea"?3:s==="prototype"?2:s==="pilot"?1:0;

function evaluate(u){
  const out = [];
  for (const r of rules){
    if (!applies(r,u)) continue;
    const crit = r.success_criteria || [];
    const needs = (r.evidence||[]).map(e=>e.name);
    const hasAll = crit.every(c => u.criteria?.[c]);
    const hasEv = needs.every(n => u.evidence?.[n]);
    let status = "missing";
    if (hasAll && hasEv) status = "met";
    else if (hasAll || hasEv) status = "partial";
    out.push({
      rule_id:r.id, title:r.title, severity:r.severity, status,
      priority: sevW(r.severity) + stageF(u.startup_stage),
      evidence_missing: needs.filter(n => !u.evidence?.[n]),
      actions: crit.map(c => ({ owner:r.owner, action:c, effort:"S", impact:r.severity==="high"?"H":"M" }))
    });
  }
  out.sort((a,b)=>b.priority-a.priority);
  return out;
}

function readiness(gaps, maturity){
  const weeks = maturity==="low"?3:maturity==="medium"?2:1;
  return gaps.filter(g=>g.status!=="met").map((g,i)=>({
    theme: g.title.split(":")[0],
    priority: i+1,
    why: `${g.severity} severity; status ${g.status}`,
    steps: g.actions.map(a=>a.action),
    evidence_to_collect: g.evidence_missing,
    timebox_weeks: weeks,
    owner: g.actions[0]?.owner || "Owner"
  }));
}

const sys = `
You are an AI healthcare service design facilitator for the UK. Not legal advice. Plain language.
Output exactly:
Short summary (<=120 words), then three fenced JSON blocks:
\`\`\`json GAP_ANALYSIS
[ ... ]
\`\`\`
\`\`\`json READINESS_PLAN
[ ... ]
\`\`\`
\`\`\`json BLUEPRINT
{ ... }
\`\`\`
Blueprint schema:
{"actors":["Patient","Clinician","Product Team"],"stages":["Discover","Decide","Onboard","Use","Follow-up"],"frontstage":[[],[],[],[],[]],"backstage":[[],[],[],[],[]],"systems":[[],[],[],[],[]],"risks":[{"stage":"","risk":"","mitigation":""}]}
`;

const bpTemplate = {
  actors:["Patient","Clinician","Product Team"],
  stages:["Discover","Decide","Onboard","Use","Follow-up"],
  frontstage:[[],[],[],[],[]],
  backstage:[[],[],[],[],[]],
  systems:[[],[],[],[],[]],
  risks:[]
};

export async function POST(req){
  const { input } = await req.json();
  const gaps = evaluate(input);
  const plan = readiness(gaps, input.tech_maturity);

  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const chat = await client.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0.25,
    max_tokens: 1100,
    messages: [
      { role:"system", content: sys },
      { role:"user", content:
        `User Input:\n${JSON.stringify(input)}\n\nTop rules:\n${JSON.stringify(gaps.slice(0,10))}\n\nBlueprint template:\n${JSON.stringify(bpTemplate)}`
      }
    ]
  });

  return new Response(JSON.stringify({ text: chat.choices[0].message.content, gaps, plan }), {
    headers: { "Content-Type":"application/json" }
  });
}
