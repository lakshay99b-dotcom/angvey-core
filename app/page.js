'use client';

import { useState, useEffect, useRef } from 'react';

const STORAGE_KEY = 'angvey-finisher-v28';
const LEGACY_KEYS = [
  'angvey-finisher-v27', 'angvey-finisher-v26', 'angvey-finisher-v25', 'angvey-finisher-v24', 'angvey-finisher-v23',
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
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ tasks, memory, log, version: 'v28' }));
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

  const generateSkill = (clientName) => {
    const clientMem = memory.filter(m => !clientName || (m.client && m.client.toLowerCase() === clientName.toLowerCase()));
    const rules = clientMem.filter(m => m.type === 'rule' || m.type === 'pref');
    const outcomes = clientMem.filter(m => m.type === 'outcome').slice(0, 5);
    const packet = `# SKILL.md — ${clientName || 'Global'} Context\n\n## Locked Rules & Preferences\n${rules.map(r => `- ${r.content}`).join('\n') || '- None'}\n\n## Recent Outcomes\n${outcomes.map(o => `- ${o.content}`).join('\n') || '- None'}\n\n## Instructions\nRespect every locked rule. Prefer finishing existing work. After progress, reflect and retain.`;
    copyPacket(`Skill ${clientName || 'Global'}`, packet);
  };

  const generateResumePacket = (clientName) => {
    const clientTasks = tasks.filter(t => (!clientName || (t.client && t.client.toLowerCase() === clientName.toLowerCase())) && t.status !== 'done')
      .sort((a, b) => ({ high: 3, normal: 2, low: 1 }[b.priority] || 2) - ({ high: 3, normal: 2, low: 1 }[a.priority] || 2));
    const openStr = clientTasks.map(t => `- [${t.priority}] ${t.goal} → next: ${t.nextAction || 'define atomic next action'} (${t.progress}%)`).join('\n') || '- None';
    const packet = `# Client Resume Packet: ${clientName || 'Global'}\nGenerated: ${new Date().toLocaleString()}\n\n## Open Work\n${openStr}\n\n## Instructions\nResume highest-priority open task. Respect locks. Finish before starting new.`;
    copyPacket(`Resume ${clientName || 'Global'}`, packet);
  };

  const generateJudgmentDrain = () => {
    const locks = memory.filter(m => m.type === 'rule' || m.type === 'pref');
    const open = tasks.filter(t => t.status !== 'done');
    const packet = `# Judgment Drain Packet\nGenerated: ${new Date().toLocaleString()}\n\n## Locked Rules & Prefs\n${locks.map(l => `- ${l.content}`).join('\n') || '- None'}\n\n## Open Next Actions\n${open.map(t => `- ${t.goal}: ${t.nextAction || 'TBD'}`).join('\n') || '- None'}\n\n## Instructions for Agent\nAuto-proceed on any item that matches a locked rule/pref with high confidence. Batch only true conflicts (with recommended default) into one compact list. Output only the batch (or "none — proceeding") + short summary. Do not drip micro-questions.`;
    copyPacket('Judgment Drain', packet);
  };

  const generateRestartResume = () => {
    const doneSteps = tasks.filter(t => t.status === 'done' || t.progress >= 100).slice(0, 8);
    const top = tasks.filter(t => t.status !== 'done')[0];
    const packet = `# Restart Resume Packet\nGenerated: ${new Date().toLocaleString()}\n\n## Committed DONE\n${doneSteps.map(t => `- DONE: ${t.goal}`).join('\n') || '- None'}\n\n## Current Progress\n${top ? `${top.goal} — ${top.progress}% — next: ${top.nextAction || 'define'}` : 'No open task'}\n\n## Instructions\nAcknowledge completed work. Never redo irreversible side-effects. Resume ONLY the next atomic action of the top open task. Mark unknown side-effects for human review. Output confirmation of skip + resume plan.`;
    copyPacket('Restart Resume', packet);
  };

  const generatePreferenceDrift = () => {
    const locks = memory.filter(m => m.type === 'rule' || m.type === 'pref');
    const recentEvidence = memory.filter(m => m.type === 'outcome').slice(0, 6);
    const topTask = tasks.filter(t => t.status !== 'done')[0];
    const packet = `# Preference Drift Check Packet\nGenerated: ${new Date().toLocaleString()}\nVersion: v28\n\n## Active Locked Preferences & Rules\n${locks.map((l, i) => `${i + 1}. ${l.content} (since ${new Date(l.created).toLocaleDateString()})`).join('\n') || '- None locked'}\n\n## Recent Evidence / Outcomes\n${recentEvidence.map(e => `- ${e.content}`).join('\n') || '- None'}\n\n## Current Focus\n${topTask ? `${topTask.goal} → next atomic: ${topTask.nextAction || 'not set'}` : 'No open task'}\n\n## Strict Instructions for Any Agent\n1. Restate each locked preference in your own words and confirm you will honor it strictly.\n2. Scan the current next action and recent evidence for any risk of drift, softening, or re-interpretation.\n3. List only true conflicts (or "none") with a recommended default that preserves the lock.\n4. If no conflicts, auto-proceed and append a one-line adherence log: "Locks honored: [list of ids or short names]".\n5. Do not ask clarifying questions on locked items. Prefer finishing over new starts.\n\nThis packet forces re-grounding to kill preference drift tax.`;
    copyPacket('Preference Drift Check', packet);
  };

  const generateActionApproval = () => {
    const open = tasks.filter(t => t.status !== 'done').slice(0, 8);
    const flagged = open.filter(t => IRREVERSIBLE_KEYWORDS.test(t.nextAction || '') || IRREVERSIBLE_KEYWORDS.test(t.goal || ''));
    const reversible = open.filter(t => !flagged.includes(t));
    const packet = `# Action Approval & Side-Effect Packet\nGenerated: ${new Date().toLocaleString()}\nVersion: v28\n\n## Open Next Actions\n${open.map(t => `- [${t.priority}] ${t.goal} → ${t.nextAction || 'define next'}${IRREVERSIBLE_KEYWORDS.test(t.nextAction || t.goal) ? ' ⚠️ potentially irreversible' : ''}`).join('\n') || '- None'}\n\n## Flagged for Explicit Approval (irreversible keywords detected)\n${flagged.map(t => `- APPROVAL NEEDED: ${t.goal} → ${t.nextAction || t.goal}`).join('\n') || '- None flagged — all appear reversible'}\n\n## Reversible (auto-proceed ok)\n${reversible.map(t => `- ${t.goal} → ${t.nextAction || 'define'}`).join('\n') || '- None'}\n\n## Strict Instructions for Any Agent (incl. local agents like Nod)\n1. Declare the exact planned actions and expected side-effects for the top open task.\n2. For every flagged irreversible item: STOP and output a compact approval request. Do not act until human replies "approved: [item]" or equivalent.\n3. On reversible items only: auto-proceed if they match locked rules/prefs.\n4. After any action, append a verification log line: "Executed: [action] — evidence: [link/screenshot/confirmation] — reversible: yes/no".\n5. Never redo irreversible side-effects. Prefer finishing over new starts. Respect all locks.\n\nThis packet kills irreversible action uncertainty by forcing declaration + selective approval + evidence.`;
    copyPacket('Action Approval', packet);
  };

  const generateDayStart = () => {
    const top = tasks.filter(t => t.status !== 'done').sort((a, b) => ({ high: 3, normal: 2, low: 1 }[b.priority] || 2) - ({ high: 3, normal: 2, low: 1 }[a.priority] || 2)).slice(0, 3);
    const packet = `# Day-Start Finish Packet\n${new Date().toLocaleDateString()}\n\n## Top Open\n${top.map(t => `- [${t.priority}] ${t.goal} → ${t.nextAction || 'define next'}`).join('\n') || '- None'}\n\n## Instructions\nStart with highest-leverage unfinished work. Respect locks. Finish before new.`;
    copyPacket('Day-Start', packet);
  };

  const topOpen = tasks.filter(t => t.status !== 'done').sort((a, b) => ({ high: 3, normal: 2, low: 1 }[b.priority] || 2) - ({ high: 3, normal: 2, low: 1 }[a.priority] || 2));
  const finishRate = tasks.length ? Math.round((tasks.filter(t => t.status === 'done').length / tasks.length) * 100) : 0;
  const clients = [...new Set(tasks.map(t => t.client).filter(Boolean))];

  const exportData = () => {
    const data = { tasks, log, memory, version: 'v28', exported: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `angvey-finisher-v28-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    addLog('Exported data');
  };

  const importData = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result);
        setTasks(data.tasks || []);
        setMemory(data.memory || []);
        setLog(data.log || []);
        addLog('Imported data');
      } catch (err) { alert('Invalid file'); }
    };
    reader.readAsText(file);
  };

  return (
    <div className="container">
      <h1>ANGVEY Finisher</h1>
      <p className="subtitle">
        Persistent task + memory agent for solopreneurs. Kill context-switch, draft-rework, session-amnesia, judgment-drain, restart-replay, preference-drift, and irreversible-action uncertainty taxes.
        One-click packets for any agent.
      </p>
      <p>Finish rate: {finishRate}% · Open: {topOpen.length} · Memory: {memory.length} · 
        <button onClick={exportData} className="secondary" style={{ marginLeft: '0.5rem' }}>Export</button>
        <button onClick={() => fileRef.current.click()} className="secondary" style={{ marginLeft: '0.5rem' }}>Import</button>
        <input type="file" ref={fileRef} onChange={importData} style={{ display: 'none' }} accept=".json" />
      </p>

      {topOpen.length > 0 && (
        <div className="card brief">
          <h3>Daily Brief — What's Next</h3>
          <button onClick={generateDayStart}>{copied === 'Day-Start' ? 'Copied!' : 'Day-Start Packet'}</button>
          <button onClick={generateJudgmentDrain} style={{ marginLeft: '0.5rem' }}>{copied === 'Judgment Drain' ? 'Copied!' : 'Judgment Drain'}</button>
          <button onClick={generateRestartResume} style={{ marginLeft: '0.5rem' }}>{copied === 'Restart Resume' ? 'Copied!' : 'Restart Resume'}</button>
          <button onClick={generatePreferenceDrift} style={{ marginLeft: '0.5rem' }}>{copied === 'Preference Drift Check' ? 'Copied!' : 'Preference Drift Check'}</button>
          <button onClick={generateActionApproval} style={{ marginLeft: '0.5rem' }}>{copied === 'Action Approval' ? 'Copied!' : 'Action Approval'}</button>
          <ul style={{ marginTop: '1rem' }}>
            {topOpen.slice(0, 3).map(t => (
              <li key={t.id}>[{t.priority}] {t.goal} → {t.nextAction || 'set next action'}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="card">
        <h3>New Task</h3>
        <input placeholder="Goal / outcome" value={goal} onChange={e => setGoal(e.target.value)} />
        <input placeholder="Client (optional)" value={client} onChange={e => setClient(e.target.value)} />
        <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} />
        <input placeholder="Tags, comma-separated" value={tags} onChange={e => setTags(e.target.value)} />
        <select value={priority} onChange={e => setPriority(e.target.value)}>
          <option value="high">High</option>
          <option value="normal">Normal</option>
          <option value="low">Low</option>
        </select>
        <button onClick={addTask}>Start Task</button>
      </div>

      <div className="card">
        <h3>Portable Skill Cards & Packets</h3>
        <button onClick={() => generateSkill('')}>Global Skill</button>
        {clients.map(c => (
          <button key={c} onClick={() => generateSkill(c)} style={{ marginLeft: '0.5rem' }}>
            {copied === `Skill ${c}` ? 'Copied!' : c}
          </button>
        ))}
        <div style={{ marginTop: '0.75rem' }}>
          <button onClick={() => generateResumePacket('')}>Global Resume</button>
          {clients.map(c => (
            <button key={c} onClick={() => generateResumePacket(c)} style={{ marginLeft: '0.5rem' }}>
              {copied === `Resume ${c}` ? 'Copied!' : `Resume ${c}`}
            </button>
          ))}
        </div>
      </div>

      <div className="card">
        <h3>Open Tasks</h3>
        {tasks.filter(t => t.status !== 'done').map(t => (
          <div key={t.id} className="step" style={{ marginBottom: '1rem' }}>
            <strong>[{t.priority}] {t.goal}</strong> {t.client && <span className="small">({t.client})</span>}
            <input placeholder="Next atomic action" value={t.nextAction} onChange={e => updateTask(t.id, { nextAction: e.target.value })} />
            <input type="number" min="0" max="100" placeholder="Progress %" value={t.progress} onChange={e => updateTask(t.id, { progress: Number(e.target.value) })} />
            <button onClick={() => updateTask(t.id, { status: 'done' })}>Mark Done</button>
            <button onClick={() => deleteTask(t.id)} className="secondary" style={{ marginLeft: '0.5rem' }}>Delete</button>
          </div>
        ))}
        {tasks.filter(t => t.status !== 'done').length === 0 && <p className="small">No open tasks. Start one above.</p>}
      </div>

      <div className="card">
        <h3>Memory (Rules / Prefs / Outcomes)</h3>
        <MemoryForm onAdd={addMemory} />
        <div className="log" style={{ marginTop: '1rem' }}>
          {memory.slice().reverse().map(m => (
            <div key={m.id} className="small">[{m.type}] {m.content} {m.client && `(${m.client})`}</div>
          ))}
        </div>
      </div>

      <div className="card">
        <h3>Activity Log</h3>
        <div className="log">
          {log.map((l, i) => <div key={i} className="small">{new Date(l.t).toLocaleString()}: {l.msg}</div>)}
        </div>
      </div>
    </div>
  );
}

function MemoryForm({ onAdd }) {
  const [type, setType] = useState('pref');
  const [content, setContent] = useState('');
  const [client, setClient] = useState('');
  return (
    <div>
      <select value={type} onChange={e => setType(e.target.value)}>
        <option value="rule">Rule</option>
        <option value="pref">Preference</option>
        <option value="outcome">Outcome</option>
      </select>
      <textarea placeholder="Content" value={content} onChange={e => setContent(e.target.value)} rows={2} />
      <input placeholder="Client (optional)" value={client} onChange={e => setClient(e.target.value)} />
      <button onClick={() => { onAdd(type, content, client); setContent(''); }}>Add Memory</button>
    </div>
  );
}
