'use client';

import { useState, useEffect, useRef } from 'react';

const STORAGE_KEY = 'angvey-finisher-v35';
const LEGACY_KEYS = [
  'angvey-finisher-v34', 'angvey-finisher-v33', 'angvey-finisher-v32', 'angvey-finisher-v31', 'angvey-finisher-v30', 'angvey-finisher-v29', 'angvey-finisher-v28', 'angvey-finisher-v27', 'angvey-finisher-v26', 'angvey-finisher-v25', 'angvey-finisher-v24', 'angvey-finisher-v23',
  'angvey-finisher-v22', 'angvey-finisher-v21', 'angvey-finisher-v20', 'angvey-finisher-v19',
  'angvey-finisher-v18', 'angvey-finisher-v17', 'angvey-finisher-v16', 'angvey-finisher-v15',
  'angvey-finisher-v14', 'angvey-finisher-v13', 'angvey-finisher-v12', 'angvey-finisher-v11',
  'angvey-finisher-v10', 'angvey-finisher-v9', 'angvey-finisher-v8'
];

const IRREVERSIBLE_KEYWORDS = /\b(send|email|mail|pay|payment|delete|remove|publish|post|book|reserve|submit|update|change|modify|cancel|unsubscribe|charge|transfer|deploy|merge|drop|wipe|purchase|buy|order|confirm|approve)\b/i;

export default function Home() {
  const [tasks, setTasks] = useState([]);
  const [memory, setMemory] = useState([]);
  const [log, setLog] = useState([]);
  const [goal, setGoal] = useState('');
  const [client, setClient] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [tags, setTags] = useState('');
  const [priority, setPriority] = useState('normal');
  const [copied, setCopied] = useState(null);
  const fileRef = useRef(null);

  useEffect(() => {
    let data = null;
    for (const key of [STORAGE_KEY, ...LEGACY_KEYS]) {
      const raw = localStorage.getItem(key);
      if (raw) {
        try {
          data = JSON.parse(raw);
          if (key !== STORAGE_KEY) {
            localStorage.setItem(STORAGE_KEY, raw);
            localStorage.removeItem(key);
          }
          break;
        } catch (e) {}
      }
    }
    if (data) {
      setTasks(data.tasks || []);
      setMemory(data.memory || []);
      setLog(data.log || []);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ tasks, memory, log, version: 'v35' }));
  }, [tasks, memory, log]);

  const addLog = (msg) => setLog(prev => [{ t: new Date().toISOString(), msg }, ...prev].slice(0, 50));

  const addTask = () => {
    if (!goal.trim()) return;
    const id = Date.now().toString();
    setTasks(prev => [...prev, {
      id,
      goal: goal.trim(),
      client: client.trim(),
      dueDate,
      tags: tags.split(',').map(t => t.trim()).filter(Boolean),
      priority,
      status: 'open',
      nextAction: '',
      progress: 0,
      evidence: [],
      created: new Date().toISOString()
    }]);
    addLog(`Started task: ${goal.trim()}`);
    setGoal(''); setClient(''); setDueDate(''); setTags('');
  };

  const updateTask = (id, updates) => setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));

  const deleteTask = (id) => {
    if (confirm('Delete this task?')) {
      setTasks(prev => prev.filter(t => t.id !== id));
      addLog(`Deleted task ${id}`);
    }
  };

  const addMemory = (type, content, clientName) => {
    if (!content.trim()) return;
    setMemory(prev => [...prev, {
      id: Date.now().toString(),
      type,
      content: content.trim(),
      client: clientName || '',
      created: new Date().toISOString()
    }]);
    addLog(`Added ${type}: ${content.slice(0, 40)}`);
  };

  const copyPacket = (name, text) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(name);
      addLog(`Copied ${name}`);
      setTimeout(() => setCopied(null), 2000);
    });
  };

  const openTasks = tasks.filter(t => t.status === 'open');
  const topOpen = openTasks.slice(0, 5);
  const finishRate = tasks.length ? Math.round((tasks.filter(t => t.status === 'done').length / tasks.length) * 100) : 0;
  const clients = [...new Set(tasks.map(t => t.client).filter(Boolean))];

  const exportData = () => {
    const data = { tasks, log, memory, version: 'v35', exported: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `angvey-finisher-v35-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    addLog('Exported data');
  };

  const importData = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result);
        setTasks(data.tasks || []);
        setMemory(data.memory || []);
        setLog(data.log || []);
        addLog('Imported data');
      } catch (err) {
        alert('Invalid file');
      }
    };
    reader.readAsText(file);
  };

  // Day 32: Verification Burden Killer Packet
  const generateVerificationBurden = () => {
    const locks = memory.filter(m => m.type === 'lock' || m.type === 'preference').slice(-8);
    const recentEvidence = memory.filter(m => m.type === 'evidence' || m.type === 'outcome').slice(-6);
    const focus = topOpen[0];

    let text = `# ANGVEY Verification Burden Killer Packet (v32)\n\n`;
    text += `**Purpose:** Eliminate the Verification Tax. Force any agent to produce verification-ready artifacts with evidence trails, confidence scores, and minimal human review points. Inspired by Superpowers verification-before-completion (evidence before claims), skill packaging, and BCG/Stanford verification-burden research.\n\n`;
    text += `## Current State Boot View\n`;
    text += `- Open threads: ${openTasks.length}\n`;
    text += `- Finish rate: ${finishRate}%\n`;
    text += `- Active locks: ${locks.length}\n`;
    if (focus) text += `- Highest-leverage focus: ${focus.goal} (${focus.client || 'no client'})\n`;
    text += `\n## Active Locks & Preferences\n`;
    if (locks.length) {
      locks.forEach(l => text += `- [${l.created.slice(0,10)}] ${l.content}\n`);
    } else text += `- None recorded yet. Add via Memory panel.\n`;
    text += `\n## Recent Evidence / Outcomes\n`;
    if (recentEvidence.length) {
      recentEvidence.forEach(e => text += `- ${e.content.slice(0,120)}\n`);
    } else text += `- None yet.\n`;

    text += `\n## Strict Protocol (paste into any agent)\n`;
    text += `1. **Evidence Before Claims (Iron Law):** Never claim work is done, fixed, or accurate without fresh verification evidence in the same response. State the exact check performed and its result.\n`;
    text += `2. **Output Structure Required:** Every deliverable must include:\n`;
    text += `   - Confidence: High / Medium / Low\n`;
    text += `   - Evidence trail: sources, commands run, diffs, screenshots described, or data cited\n`;
    text += `   - Assumptions made\n`;
    text += `   - Irreversible risks flagged (use keywords: send, pay, delete, publish, deploy, etc.)\n`;
    text += `   - Verification load score: Low (spot-check) / Medium (sample review) / High (full human audit)\n`;
    text += `3. **Minimal Review Points:** Recommend at most 1-2 specific human checks. Batch only true conflicts or high-irreversibility items.\n`;
    text += `4. **Self-Verification:** Before finishing, run an internal checklist: "What would prove this is correct? Did I run it? What is the actual output?"\n`;
    text += `5. **Adherence Log:** End with a 3-line log: locks restated, verification performed, residual risk.\n\n`;
    text += `## Cognitive Budget Note\n`;
    text += `This packet reduces verification minutes by forcing agents to do the hard part first. Use during deep-work windows. Zero agent pings until the packet is fully answered.\n\n`;
    text += `---\nGenerated by ANGVEY Finisher v32 · ${new Date().toISOString()}\n`;

    copyPacket('Verification Burden', text);
  };

  // Day 33: Methodology Lock / Portable SKILL.md Packet
  const generateMethodologyLock = () => {
    const locks = memory.filter(m => m.type === 'lock' || m.type === 'preference').slice(-6);
    const focus = topOpen[0] || { goal: 'general client work', client: '', nextAction: '' };
    const skillName = 'angvey-methodology-lock';

    let text = `---\n`;
    text += `name: ${skillName}\n`;
    text += `description: Force any agent to follow a disciplined Clarify → Plan → Execute → Verify workflow for solopreneur tasks. Use when starting work, switching agents, or when methodology drift is suspected. Locks evidence-before-claims and minimal verification.\n`;
    text += `license: MIT\n`;
    text += `metadata:\n`;
    text += `  author: ANGVEY Finisher\n`;
    text += `  version: v33\n`;
    text += `  generated: ${new Date().toISOString()}\n`;
    text += `---\n\n`;
    text += `# ANGVEY Methodology Lock Skill (v33)\n\n`;
    text += `**Purpose:** Kill methodology amnesia and skill drift. Inspired by obra/superpowers structured skills and the open Agent Skills (SKILL.md) standard. Ensures agents always clarify intent, plan with verification points, execute with evidence, and self-verify before claiming done.\n\n`;
    text += `## Current Focus Boot\n`;
    text += `- Primary task: ${focus.goal}${focus.client ? ` (client: ${focus.client})` : ''}\n`;
    text += `- Next action: ${focus.nextAction || 'Not set'}\n`;
    text += `- Open threads: ${openTasks.length}\n`;
    text += `- Finish rate: ${finishRate}%\n\n`;
    text += `## Active Locks\n`;
    if (locks.length) {
      locks.forEach(l => text += `- ${l.content}\n`);
    } else text += `- No locks yet. Record hard rules in the Memory panel.\n`;

    text += `\n## Mandatory Workflow (follow in order)\n`;
    text += `1. **Clarify Intent:** Restate the goal in your own words. Ask 1-2 clarifying questions if ambiguity remains. Do not start work until confirmed.\n`;
    text += `2. **Plan with Verification Points:** Break into 3-7 discrete steps. For each step list: expected output, how you will verify it, and residual risk. Prefer small, reversible steps.\n`;
    text += `3. **Execute + Evidence:** Perform the work. After each major step, record concrete evidence (what you checked, actual result). Flag irreversible actions immediately.\n`;
    text += `4. **Self-Verify Before Done:** Run the checklist: "What would prove this correct? Did I run the check? What is the real output?" Only then claim completion.\n`;
    text += `5. **Handoff Packet:** End with a short summary: what was done, evidence produced, next action, and any open questions.\n\n`;
    text += `## Iron Laws\n`;
    text += `- Evidence before claims. Never say "done" or "fixed" without showing the check.\n`;
    text += `- At most 1-2 human review points. Batch only high-irreversibility items.\n`;
    text += `- Respect all locks above. If a lock conflicts with the request, surface it and stop.\n`;
    text += `- Progressive disclosure: keep responses tight; expand only when asked.\n\n`;
    text += `## Usage\n`;
    text += `Paste this entire block into any agent that supports SKILL.md or custom instructions (Claude, Codex, Cursor, Grok, etc.). Or save as \`${skillName}/SKILL.md\` for agents that load skill folders.\n\n`;
    text += `---\nGenerated by ANGVEY Finisher v33 · ${new Date().toISOString()}\n`;

    copyPacket('Methodology Lock', text);
  };

  // Day 34: Research Grounding Packet — Kill Manual Research Paste Tax
  const generateResearchGrounding = () => {
    const locks = memory.filter(m => m.type === 'lock' || m.type === 'preference').slice(-6);
    const focus = topOpen[0] || { goal: 'general client work', client: '', nextAction: '' };
    const queries = [
      `${focus.goal} current status or latest updates`,
      focus.client ? `${focus.client} recent news or pricing` : 'competitor pricing comparison',
      `${focus.goal} official documentation or primary sources`
    ];

    let text = `# ANGVEY Research Grounding Packet (v34)\n\n`;
    text += `**Purpose:** Kill the Manual Research Paste Tax. Agents hallucinate on fresh web data (pricing, competitors, news, docs) or force humans to search + copy-paste every time. Inspired by Firecrawl skills (search/scrape/cite), Agent-Reach patterns, and evidence-before-claims discipline. This packet structures research so agents cite sources or request specific pastes with minimal friction.\n\n`;
    text += `## Current Focus Boot\n`;
    text += `- Primary task: ${focus.goal}${focus.client ? ` (client: ${focus.client})` : ''}\n`;
    text += `- Next action: ${focus.nextAction || 'Not set'}\n`;
    text += `- Open threads: ${openTasks.length}\n`;
    text += `- Finish rate: ${finishRate}%\n\n`;
    text += `## Active Locks\n`;
    if (locks.length) {
      locks.forEach(l => text += `- ${l.content}\n`);
    } else text += `- None yet.\n`;

    text += `\n## Suggested Research Queries\n`;
    queries.forEach(q => text += `- ${q}\n`);

    text += `\n## Strict Grounding Protocol (paste into any agent)\n`;
    text += `1. **Tool First:** If you have web tools (search, scrape, Firecrawl, browser), use them. Cite every fact with URL + short snippet. Never invent numbers, dates, prices, or quotes.\n`;
    text += `2. **If No Tools:** List the exact 1-3 searches or pages you need the human to paste. Provide a template: "Source N: URL | Key snippet | Relevance".\n`;
    text += `3. **Output Structure:**\n`;
    text += `   - Answer / Recommendation\n`;
    text += `   - Sources (URL, date if available, confidence per source: High/Medium/Low)\n`;
    text += `   - Assumptions & Gaps\n`;
    text += `   - Irreversible risks flagged\n`;
    text += `   - Next verification step\n`;
    text += `4. **Confidence Rule:** Overall confidence only High if ≥2 independent primary sources agree. Otherwise Medium or Low and say what would raise it.\n`;
    text += `5. **No Hallucination Zone:** If data is older than 30 days or unverified, mark it and recommend fresh check.\n\n`;
    text += `## Usage\n`;
    text += `Paste the full packet at the start of the agent session. After research, append any pasted sources under a "## Pasted Sources" section and re-ask for the grounded answer.\n\n`;
    text += `---\nGenerated by ANGVEY Finisher v34 · ${new Date().toISOString()}\n`;

    copyPacket('Research Grounding', text);
  };

  // Day 35: Parallel Agent Scope Lock Packet — Kill Duplicate Work & Conflict Tax
  const generateParallelScopeLock = () => {
    const locks = memory.filter(m => m.type === 'lock' || m.type === 'preference').slice(-6);
    const focus = topOpen[0] || { goal: 'general client work', client: '', nextAction: '' };
    const openGoals = openTasks.slice(0, 4).map(t => t.goal);

    let text = `# ANGVEY Parallel Agent Scope Lock Packet (v35)\n\n`;
    text += `**Purpose:** Kill the Duplicate Work & Conflict Tax when running fleets of agents (Claude Code, Cursor, Codex, Grok, etc.). Inspired by Orca-style multi-bot orchestration and Superpowers structured workflows. Assigns non-overlapping scopes, forces unique ownership, and defines merge protocol with evidence.\n\n`;
    text += `## Current Focus Boot\n`;
    text += `- Primary task: ${focus.goal}${focus.client ? ` (client: ${focus.client})` : ''}\n`;
    text += `- Next action: ${focus.nextAction || 'Not set'}\n`;
    text += `- Open threads: ${openTasks.length}\n`;
    text += `- Finish rate: ${finishRate}%\n`;
    if (openGoals.length) text += `- Candidate scopes: ${openGoals.join(' | ')}\n`;
    text += `\n`;
    text += `## Active Locks\n`;
    if (locks.length) {
      locks.forEach(l => text += `- ${l.content}\n`);
    } else text += `- None yet.\n`;

    text += `\n## Scope Assignment Protocol (paste into each agent)\n`;
    text += `1. **Unique Ownership:** Claim exactly one discrete sub-goal or file/module. Announce it first. Do not touch any other agent's claimed scope.\n`;
    text += `2. **No Overlap Rule:** If your planned work intersects another claim, stop and propose a boundary split. Prefer vertical slices over horizontal.\n`;
    text += `3. **Evidence-Only Handoff:** When done with your scope, output only: what changed, verification evidence, residual risks, and exact next owner if any. No speculative recommendations outside scope.\n`;
    text += `4. **Merge Gate:** Human or designated lead merges only after all scopes report evidence. Conflicts resolved by locks + evidence, not opinion.\n`;
    text += `5. **Cost Guard:** Prefer the agent with the best subscription/tooling for the scope. Do not re-research what another agent already grounded.\n\n`;
    text += `## Output Template per Agent\n`;
    text += `### Scope Claimed\n`;
    text += `- Sub-goal / files:\n`;
    text += `- Why this agent:\n`;
    text += `### Evidence Produced\n`;
    text += `- Changes / results:\n`;
    text += `- Verification performed:\n`;
    text += `- Confidence: High/Medium/Low\n`;
    text += `### Handoff\n`;
    text += `- Residual risk:\n`;
    text += `- Ready for merge: yes/no\n\n`;
    text += `## Usage\n`;
    text += `Generate once, paste the protocol into every parallel agent session. Collect the filled templates and merge manually or with a final agent that only sees the evidence packets.\n\n`;
    text += `---\nGenerated by ANGVEY Finisher v35 · ${new Date().toISOString()}\n`;

    copyPacket('Parallel Scope Lock', text);
  };

  return (
    <div className="container">
      <h1>ANGVEY Finisher</h1>
      <p className="subtitle">
        Persistent task + memory agent for solopreneurs. Kill context-switch, draft-rework, session-amnesia, judgment-drain, restart-replay, preference-drift, irreversible-action uncertainty, cognitive-load, Verification Tax, Methodology Amnesia / Skill Drift, Manual Research Paste Tax, and now Parallel Agent Duplicate Work & Conflict Tax.
        One-click packets (including portable SKILL.md, Research Grounding, and Parallel Scope Lock) for any agent.
      </p>

      <div className="card brief">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div>
            Finish rate: {finishRate}% · Open: {topOpen.length} · Memory: {memory.length}
          </div>
          <div>
            <button onClick={exportData} className="secondary">Export</button>
            <button onClick={() => fileRef.current.click()} className="secondary" style={{ marginLeft: '0.5rem' }}>Import</button>
            <input type="file" ref={fileRef} onChange={importData} style={{ display: 'none' }} accept=".json" />
          </div>
        </div>

        {topOpen.length > 0 && (
          <>
            <h3>Daily Brief — What's Next</h3>
            {topOpen.map(t => (
              <div key={t.id} className="step" style={{ marginBottom: '0.75rem' }}>
                <strong>{t.goal}</strong>
                {t.client && <span className="due"> · {t.client}</span>}
                {t.dueDate && <span className={new Date(t.dueDate) < new Date() ? 'due-overdue' : 'due'}> · due {t.dueDate}</span>}
                <span className={`prio prio-${t.priority}`}>{t.priority}</span>
                <div className="progress"><div className="progress-bar" style={{ width: `${t.progress}%` }} /></div>
                <small className="small">{t.nextAction || 'No next action set'}</small>
              </div>
            ))}
          </>
        )}

        <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button onClick={generateVerificationBurden}>
            {copied === 'Verification Burden' ? 'Copied!' : 'Verification Burden Packet'}
          </button>
          <button onClick={generateMethodologyLock}>
            {copied === 'Methodology Lock' ? 'Copied!' : 'Methodology Lock (SKILL.md)'}
          </button>
          <button onClick={generateResearchGrounding}>
            {copied === 'Research Grounding' ? 'Copied!' : 'Research Grounding Packet'}
          </button>
          <button onClick={generateParallelScopeLock}>
            {copied === 'Parallel Scope Lock' ? 'Copied!' : 'Parallel Scope Lock Packet'}
          </button>
        </div>
      </div>

      <div className="card">
        <h3>Start / Update Task</h3>
        <input placeholder="Goal / outcome" value={goal} onChange={e => setGoal(e.target.value)} />
        <input placeholder="Client (optional)" value={client} onChange={e => setClient(e.target.value)} />
        <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} />
        <input placeholder="Tags (comma-separated)" value={tags} onChange={e => setTags(e.target.value)} />
        <select value={priority} onChange={e => setPriority(e.target.value)}>
          <option value="high">High</option>
          <option value="normal">Normal</option>
          <option value="low">Low</option>
        </select>
        <button onClick={addTask}>Add Task</button>
      </div>

      <div className="card">
        <h3>Open Tasks</h3>
        {openTasks.length === 0 && <p className="small">No open tasks. Add one above.</p>}
        {openTasks.map(t => (
          <div key={t.id} className="step">
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div>
                <strong>{t.goal}</strong>
                {t.client && <span className="due"> · {t.client}</span>}
              </div>
              <button className="secondary" onClick={() => deleteTask(t.id)} style={{ padding: '0.3rem 0.6rem' }}>Del</button>
            </div>
            <input
              placeholder="Next action"
              value={t.nextAction}
              onChange={e => updateTask(t.id, { nextAction: e.target.value })}
              style={{ marginTop: '0.5rem' }}
            />
            <input
              type="range" min="0" max="100" value={t.progress}
              onChange={e => updateTask(t.id, { progress: Number(e.target.value) })}
            />
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
              <button className="secondary" onClick={() => updateTask(t.id, { status: 'done' })}>Mark Done</button>
              <button className="secondary" onClick={() => addMemory('evidence', `Evidence for: ${t.goal}`, t.client)}>Add Evidence</button>
            </div>
          </div>
        ))}
      </div>

      <div className="card">
        <h3>Memory / Locks / Preferences</h3>
        <p className="small">Add locks, preferences, or evidence that packets will surface.</p>
        <input id="mem-content" placeholder="Content (e.g. 'Never send email without client approval')" />
        <select id="mem-type">
          <option value="lock">Lock / Hard Rule</option>
          <option value="preference">Preference</option>
          <option value="evidence">Evidence</option>
          <option value="outcome">Outcome</option>
        </select>
        <button onClick={() => {
          const content = document.getElementById('mem-content').value;
          const type = document.getElementById('mem-type').value;
          addMemory(type, content);
          document.getElementById('mem-content').value = '';
        }}>Add Memory</button>
        <div style={{ marginTop: '1rem' }}>
          {memory.slice(-10).reverse().map(m => (
            <div key={m.id} className="small" style={{ padding: '0.4rem 0', borderBottom: '1px solid #334155' }}>
              <strong>{m.type}</strong>: {m.content.slice(0, 100)} {m.client && `(${m.client})`}
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <h3>Activity Log</h3>
        <div className="log">
          {log.map((l, i) => (
            <div key={i} className="small">{new Date(l.t).toLocaleString()}: {l.msg}</div>
          ))}
        </div>
      </div>
    </div>
  );
}
