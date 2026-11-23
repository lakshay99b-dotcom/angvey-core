'use client';

import { useState, useEffect, useRef } from 'react';

const STORAGE_KEY = 'angvey-finisher-v30';
const LEGACY_KEYS = [
  'angvey-finisher-v29', 'angvey-finisher-v28', 'angvey-finisher-v27', 'angvey-finisher-v26', 'angvey-finisher-v25', 'angvey-finisher-v24', 'angvey-finisher-v23',
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
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ tasks, memory, log, version: 'v30' }));
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
    const packet = `# Judgment Drain Packet\nGenerated: ${new Date().toLocaleString()}\n\n## Locked Rules & Prefs\n${locks.map(l => `- ${l.content}`).join('\n') || '- None'}\n\n## Open Next Actions\n${open.map(t => `- ${t.goal}: ${t.nextAction || 'TBD'}`).join('\n') || '- None'}\n\n## Instructions for Agent\nAuto-proceed on any item that matches a locked rule/pref with high confidence. Batch only true conflicts (with recommended default) into one compact list. Output only the batch (or \"none — proceeding\") + short summary. Do not drip micro-questions.`;
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
    const packet = `# Preference Drift Check Packet\nGenerated: ${new Date().toLocaleString()}\nVersion: v30\n\n## Active Locked Preferences & Rules\n${locks.map((l, i) => `${i + 1}. ${l.content} (since ${new Date(l.created).toLocaleDateString()})`).join('\n') || '- None locked'}\n\n## Recent Evidence / Outcomes\n${recentEvidence.map(e => `- ${e.content}`).join('\n') || '- None'}\n\n## Current Focus\n${topTask ? `${topTask.goal} → next atomic: ${topTask.nextAction || 'not set'}` : 'No open task'}\n\n## Strict Instructions for Any Agent\n1. Restate each locked preference in your own words and confirm you will honor it strictly.\n2. Scan the current next action and recent evidence for any risk of drift, softening, or re-interpretation.\n3. List only true conflicts (or \"none\") with a recommended default that preserves the lock.\n4. If no conflicts, auto-proceed and append a one-line adherence log: \"Locks honored: [list of ids or short names]\".\n5. Do not ask clarifying questions on locked items. Prefer finishing over new starts.\n\nThis packet forces re-grounding to kill preference drift tax.`;
    copyPacket('Preference Drift Check', packet);
  };

  const generateActionApproval = () => {
    const open = tasks.filter(t => t.status !== 'done').slice(0, 8);
    const flagged = open.filter(t => IRREVERSIBLE_KEYWORDS.test(t.nextAction || '') || IRREVERSIBLE_KEYWORDS.test(t.goal || ''));
    const reversible = open.filter(t => !flagged.includes(t));
    const packet = `# Action Approval & Side-Effect Packet\nGenerated: ${new Date().toLocaleString()}\nVersion: v30\n\n## Open Next Actions\n${open.map(t => `- [${t.priority}] ${t.goal} → ${t.nextAction || 'define next'}${IRREVERSIBLE_KEYWORDS.test(t.nextAction || t.goal) ? ' ⚠️ potentially irreversible' : ''}`).join('\n') || '- None'}\n\n## Flagged for Explicit Approval (irreversible keywords detected)\n${flagged.map(t => `- APPROVAL NEEDED: ${t.goal} → ${t.nextAction || t.goal}`).join('\n') || '- None flagged — all appear reversible'}\n\n## Reversible (auto-proceed ok)\n${reversible.map(t => `- ${t.goal} → ${t.nextAction || 'define'}`).join('\n') || '- None'}\n\n## Strict Instructions for Any Agent (incl. local agents like Nod)\n1. Declare the exact planned actions and expected side-effects for the top open task.\n2. For every flagged irreversible item: STOP and output a compact approval request. Do not act until human replies \"approved: [item]\" or equivalent.\n3. On reversible items only: auto-proceed if they match locked rules/prefs.\n4. After any action, append a verification log line: \"Executed: [action] — evidence: [link/screenshot/confirmation] — reversible: yes/no\".\n5. Never redo irreversible side-effects. Prefer finishing over new starts. Respect all locks.\n\nThis packet kills irreversible action uncertainty by forcing declaration + selective approval + evidence.`;
    copyPacket('Action Approval', packet);
  };

  const generateAttentionResidue = () => {
    const open = tasks.filter(t => t.status !== 'done').slice(0, 10);
    const scored = open.map(t => {
      const ageDays = Math.max(0, Math.floor((Date.now() - new Date(t.created).getTime()) / (1000 * 60 * 60 * 24)));
      let residue = 'low';
      if (!t.nextAction || t.progress < 30 || ageDays > 2) residue = 'high';
      else if (t.progress < 70 || ageDays > 0) residue = 'medium';
      return { ...t, ageDays, residue };
    }).sort((a, b) => ({ high: 3, medium: 2, low: 1 }[b.residue] || 1) - ({ high: 3, medium: 2, low: 1 }[a.residue] || 1));

    const packet = `# Attention Residue & Clean Handoff Packet\nGenerated: ${new Date().toLocaleString()}\nVersion: v30\n\n## Open Threads by Residue Risk\n${scored.map(t => `- [${t.residue.toUpperCase()}] [${t.priority}] ${t.goal} → next: ${t.nextAction || 'NOT SET'} | progress: ${t.progress}% | age: ${t.ageDays}d`).join('\n') || '- None'}\n\n## Recommended Close-or-Park\n${scored.slice(0, 5).map(t => `- ${t.goal}: ${t.residue === 'high' ? 'COMPLETE next atomic now OR produce self-contained handoff paragraph' : 'Park with compact resume note if not finishing today'}`).join('\n') || '- None'}\n\n## Strict Instructions for Any Agent\n1. Select the single highest-residue open task.\n2. Either fully complete its next atomic action (update progress + add outcome/evidence) OR write a self-contained one-paragraph handoff that includes: relevant locks, current state, exact resume point, and any pending irreversible items. This clears attention residue so human or next session carries zero mental thread.\n3. For remaining items: batch any true decisions into one compact list with recommended defaults. Auto-proceed on clear lock matches.\n4. Prefer finishing existing work over starting new. Never leave partial states that require re-orientation.\n5. Append adherence log: \"Residue cleared for [short goal]: method=completed|parked\".\n\nInspired by attention-residue research (Sophie Leroy) and modern agent handoff patterns (skills frameworks, clean process locks). Kills the unfinished-thread and decision-queue tax.`;
    copyPacket('Attention Residue', packet);
  };

  const generateSessionContinuity = () => {
    const open = tasks.filter(t => t.status !== 'done').slice(0, 12);
    const locks = memory.filter(m => m.type === 'rule' || m.type === 'pref').slice(0, 8);
    const scored = open.map(t => {
      const ageDays = Math.max(0, Math.floor((Date.now() - new Date(t.created).getTime()) / (1000 * 60 * 60 * 24)));
      let residue = 'low';
      if (!t.nextAction || t.progress < 30 || ageDays > 2) residue = 'high';
      else if (t.progress < 70 || ageDays > 0) residue = 'medium';
      return { ...t, ageDays, residue };
    }).sort((a, b) => {
      const residueScore = ({ high: 3, medium: 2, low: 1 }[b.residue] || 1) - ({ high: 3, medium: 2, low: 1 }[a.residue] || 1);
      if (residueScore !== 0) return residueScore;
      return ({ high: 3, normal: 2, low: 1 }[b.priority] || 2) - ({ high: 3, normal: 2, low: 1 }[a.priority] || 2);
    });

    const top = scored.slice(0, 5);
    const bootView = top.map(t => `- [${t.residue.toUpperCase()}] [${t.priority}] ${t.goal}${t.client ? ` (${t.client})` : ''} → next: ${t.nextAction || 'NOT SET'} | ${t.progress}% | age ${t.ageDays}d`).join('\n') || '- None';

    const packet = `# Session Continuity & Multi-Thread Handoff Packet\nGenerated: ${new Date().toLocaleString()}\nVersion: v30\n\n## Boot View — Top Parallel Threads (exact resume points)\n${bootView}\n\n## Active Locks (honor strictly)\n${locks.map(l => `- ${l.content}`).join('\n') || '- None'}\n\n## Strict Multi-Thread Protocol for Any Agent\n1. Treat every open task as a potential parallel agent thread. Your goal is zero attention residue across all of them.\n2. Select exactly ONE thread to resume fully right now (prefer highest residue + priority). Complete its next atomic action or write a self-contained one-paragraph handoff that pins: locks, current state, exact next action, and any irreversible items.\n3. For every other open thread: produce a compact park note (2-3 lines max) that is self-contained so a future session or different agent can resume with zero re-orientation. Do not leave partial mental threads.\n4. Batch any true cross-thread decisions into one compact list with recommended defaults. Auto-proceed only on clear lock matches.\n5. Output format:\n   - RESUMING: [short goal] — method=completed|parked\n   - PARKED: [list of short goals with one-line park notes]\n   - Adherence: \"Multi-thread residue cleared. Zero open mental threads.\"\n6. Prefer finishing existing work. Never start new threads until current ones are completed or cleanly parked.\n\nInspired by Agent Host Protocol session continuity, handoff-memory patterns, and Superpowers-style mandatory process steps. Kills the multi-session / fried-brain tax from juggling parallel agent threads across tools or devices.`;
    copyPacket('Session Continuity', packet);
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
    const data = { tasks, log, memory, version: 'v30', exported: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `angvey-finisher-v30-${Date.now()}.json`;
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
        Persistent task + memory agent for solopreneurs. Kill context-switch, draft-rework, session-amnesia, judgment-drain, restart-replay, preference-drift, irreversible-action uncertainty, attention-residue, and multi-thread/session continuity taxes.
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
          <button onClick={generateAttentionResidue} style={{ marginLeft: '0.5rem' }}>{copied === 'Attention Residue' ? 'Copied!' : 'Attention Residue'}</button>
          <button onClick={generateSessionContinuity} style={{ marginLeft: '0.5rem' }}>{copied === 'Session Continuity' ? 'Copied!' : 'Session Continuity'}</button>
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
