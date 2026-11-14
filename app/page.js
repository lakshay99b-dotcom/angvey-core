'use client';

import { useState, useEffect, useRef } from 'react';

const STORAGE_KEY = 'angvey-finisher-v22';
const LEGACY_KEYS = [
  'angvey-finisher-v21', 'angvey-finisher-v20', 'angvey-finisher-v19', 'angvey-finisher-v18',
  'angvey-finisher-v17', 'angvey-finisher-v16', 'angvey-finisher-v15',
  'angvey-finisher-v14', 'angvey-finisher-v13', 'angvey-finisher-v12',
  'angvey-finisher-v11', 'angvey-finisher-v10', 'angvey-finisher-v9', 'angvey-finisher-v8'
];

export default function Home() {
  const [goal, setGoal] = useState('');
  const [client, setClient] = useState('');
  const [priority, setPriority] = useState('normal');
  const [dueDate, setDueDate] = useState('');
  const [tags, setTags] = useState('');
  const [tasks, setTasks] = useState([]);
  const [log, setLog] = useState([]);
  const [memory, setMemory] = useState([]);
  const [newMemory, setNewMemory] = useState('');
  const [memoryClient, setMemoryClient] = useState('');
  const [memoryType, setMemoryType] = useState('fact');
  const [clientFilter, setClientFilter] = useState('');
  const [copied, setCopied] = useState('');
  const fileRef = useRef(null);

  useEffect(() => {
    let data = null;
    for (const key of [STORAGE_KEY, ...LEGACY_KEYS]) {
      const raw = localStorage.getItem(key);
      if (raw) {
        try {
          data = JSON.parse(raw);
          break;
        } catch {}
      }
    }
    if (data) {
      setTasks(data.tasks || []);
      setLog(data.log || []);
      setMemory(data.memory || []);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ tasks, log, memory, version: 'v22' }));
  }, [tasks, log, memory]);

  const addLog = (msg) => setLog(prev => [{ t: new Date().toISOString(), msg }, ...prev].slice(0, 50));

  const addTask = () => {
    if (!goal.trim()) return;
    const id = Date.now().toString();
    const steps = [
      { id: 's1', text: 'Clarify scope & success criteria', status: 'pending' },
      { id: 's2', text: 'Produce first verifiable increment', status: 'pending' },
      { id: 's3', text: 'Verify against rules & checks', status: 'pending' },
      { id: 's4', text: 'Log evidence & update client', status: 'pending' }
    ];
    setTasks(prev => [...prev, {
      id, goal: goal.trim(), client: client.trim(), priority, dueDate,
      tags: tags.split(',').map(t => t.trim()).filter(Boolean),
      status: 'open', steps, checks: [], progress: 0, created: new Date().toISOString()
    }]);
    addLog(`Started task: ${goal.trim()}`);
    setGoal(''); setClient(''); setTags(''); setDueDate('');
  };

  const updateStep = (taskId, stepId, status) => {
    setTasks(prev => prev.map(t => {
      if (t.id !== taskId) return t;
      const steps = t.steps.map(s => s.id === stepId ? { ...s, status } : s);
      const done = steps.filter(s => s.status === 'done').length;
      const progress = Math.round((done / steps.length) * 100);
      const allDone = done === steps.length;
      return { ...t, steps, progress, status: allDone ? 'done' : t.status };
    }));
  };

  const deleteTask = (id) => {
    if (confirm('Delete this task?')) {
      setTasks(prev => prev.filter(t => t.id !== id));
      addLog(`Deleted task ${id}`);
    }
  };

  const addMemory = () => {
    if (!newMemory.trim()) return;
    setMemory(prev => [...prev, {
      id: Date.now().toString(),
      text: newMemory.trim(),
      client: memoryClient.trim(),
      type: memoryType,
      created: new Date().toISOString(),
      score: memoryType === 'rule' || memoryType === 'outcome' ? 2 : 1
    }]);
    setNewMemory('');
    addLog(`Added ${memoryType} memory`);
  };

  const exportData = () => {
    const data = { tasks, log, memory, version: 'v22', exported: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `angvey-finisher-v22-${Date.now()}.json`;
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
        setLog(data.log || []);
        setMemory(data.memory || []);
        addLog('Imported data');
      } catch { alert('Invalid file'); }
    };
    reader.readAsText(file);
  };

  const copy = async (text, label) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(label);
      setTimeout(() => setCopied(''), 2000);
    } catch { alert('Copy failed'); }
  };

  const relevantMemory = (clientName) => memory.filter(m => !clientName || !m.client || m.client === clientName)
    .sort((a, b) => (b.score || 1) - (a.score || 1)).slice(0, 8);

  const generateSkillCard = (clientName) => {
    const mems = relevantMemory(clientName);
    const rules = mems.filter(m => m.type === 'rule');
    const prefs = mems.filter(m => m.type === 'pref');
    const outcomes = mems.filter(m => m.type === 'outcome');
    return `# SKILL.md — ${clientName || 'General'}\n\n## Rules\n${rules.map(r => `- ${r.text}`).join('\n') || '- None'}\n\n## Preferences\n${prefs.map(p => `- ${p.text}`).join('\n') || '- None'}\n\n## Recent Outcomes\n${outcomes.map(o => `- ${o.text}`).join('\n') || '- None'}\n\nUse this as persistent context. Prefer rules over prefs.`;
  };

  const generateResumePacket = (task) => {
    const mems = relevantMemory(task.client);
    const next = task.steps.find(s => s.status !== 'done') || task.steps[0];
    const pending = task.checks?.filter(c => !c.done).map(c => c.text).join(', ') || 'none';
    return `# Resume Packet — ${task.client || 'No client'} / ${task.goal}\n\n**Next atomic action:** ${next?.text || 'Complete remaining steps'}\n**Progress:** ${task.progress}%\n**Pending checks:** ${pending}\n\n## Relevant rules\n${mems.filter(m => m.type === 'rule').map(m => `- ${m.text}`).join('\n') || '- None'}\n\n## Recent evidence\n${mems.filter(m => m.type === 'outcome').slice(0, 3).map(m => `- ${m.text}`).join('\n') || '- None'}`;
  };

  const generateNextAction = (task) => {
    const next = task.steps.find(s => s.status !== 'done') || { text: 'Finish remaining work' };
    const rules = relevantMemory(task.client).filter(m => m.type === 'rule').slice(0, 3);
    return `# Next-Action Finish Prompt\n\nDo ONLY this single atomic step for \"${task.goal}\" (${task.client || 'no client'}):\n\n**Action:** ${next.text}\n\nRules to obey:\n${rules.map(r => `- ${r.text}`).join('\n') || '- None'}\n\nProduce the smallest verifiable artifact. Then output exactly:\nARTIFACT: <one-line description of what you produced>\nVERIFICATION: <how to check it>\nThen STOP. Do not expand scope.`;
  };

  const generateEvidencePacket = (task) => generateNextAction(task) + '\n\nAfter you finish, paste the ARTIFACT/VERIFICATION block back here to log evidence.';

  const generateReceipt = (task) => {
    const outcomes = relevantMemory(task.client).filter(m => m.type === 'outcome').slice(0, 2);
    return `# Client Update — ${task.client || 'Project'}\n\nProgress on: ${task.goal}\n\nRecent outcomes:\n${outcomes.map(o => `- ${o.text}`).join('\n') || '- Work in progress'}\n\nCurrent next step: ${task.steps.find(s => s.status !== 'done')?.text || 'Finalizing'}\n\nAll checks passed where applicable. Ready for your review.`;
  };

  const generateDayStart = () => {
    const open = tasks.filter(t => t.status !== 'done')
      .sort((a, b) => (b.priority === 'high' ? 1 : 0) - (a.priority === 'high' ? 1 : 0) || new Date(a.dueDate || '9999') - new Date(b.dueDate || '9999'))
      .slice(0, 3);
    if (!open.length) return '# Day-Start Packet\n\nNo open tasks. Great day to plan or rest.';
    const top = open[0];
    return `# Day-Start Finish Packet\n\n${generateNextAction(top)}\n\n## Other open\n${open.slice(1).map(t => `- ${t.goal} (${t.client || '—'}) ${t.progress}%`).join('\n')}`;
  };

  const generateDayClose = () => {
    const today = new Date().toDateString();
    const recentOutcomes = memory.filter(m => m.type === 'outcome' && new Date(m.created).toDateString() === today);
    const open = tasks.filter(t => t.status !== 'done').slice(0, 5);
    return `# Day-Close Finish Packet\n\n## Today's outcomes\n${recentOutcomes.map(o => `- [${o.client || 'General'}] ${o.text}`).join('\n') || '- None logged'}\n\n## Tomorrow's queue\n${open.map(t => `- ${t.priority === 'high' ? 'HIGH ' : ''}${t.goal} (${t.client || '—'})`).join('\n') || '- None'}`;
  };

  const generateMidDay = () => {
    const top = tasks.filter(t => t.status !== 'done')[0];
    if (!top) return '# Mid-Day Resume\n\nNothing open.';
    return `# Mid-Day Resume Packet (after interruption)\n\n${generateResumePacket(top)}\n\nResume only the next atomic action. Do not re-plan.`;
  };

  const generateWeeklyInvoice = () => {
    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const weekOutcomes = memory.filter(m => m.type === 'outcome' && new Date(m.created).getTime() > weekAgo);
    const byClient = {};
    weekOutcomes.forEach(o => {
      const c = o.client || 'General';
      if (!byClient[c]) byClient[c] = [];
      byClient[c].push(o.text);
    });
    const openByClient = {};
    tasks.filter(t => t.status !== 'done').forEach(t => {
      const c = t.client || 'General';
      if (!openByClient[c]) openByClient[c] = [];
      openByClient[c].push(`${t.goal} (${t.progress}%)`);
    });

    let md = `# Weekly Invoice Narrative Packet\n\nGenerated ${new Date().toLocaleDateString()}\n\nUse this to justify billable work and write invoice line items or client status.\n\n`;
    const clients = [...new Set([...Object.keys(byClient), ...Object.keys(openByClient)])];
    if (!clients.length) return md + 'No outcomes or open work this week.';

    clients.forEach(c => {
      md += `## ${c}\n\n**Completed / Evidenced this week:**\n`;
      md += (byClient[c] || []).map(t => `- ${t}`).join('\n') || '- None';
      md += `\n\n**Still open:**\n`;
      md += (openByClient[c] || []).map(t => `- ${t}`).join('\n') || '- None';
      md += `\n\n**Suggested invoice line:**\n- Professional services: ${c} deliverables and progress (see outcomes above)\n\n`;
    });
    md += `\n---\nCopy into invoice tool, email, or client portal. Adjust hours as needed.`;
    return md;
  };

  const generateComplianceAudit = (clientName = '') => {
    const rules = relevantMemory(clientName).filter(m => m.type === 'rule');
    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const recentOutcomes = memory.filter(m =>
      m.type === 'outcome' &&
      new Date(m.created).getTime() > weekAgo &&
      (!clientName || !m.client || m.client === clientName)
    ).slice(0, 12);

    if (!rules.length && !recentOutcomes.length) {
      return '# Compliance Audit Packet\n\nNo rules or recent outcomes to audit. Add rules and log outcomes first.';
    }

    let md = `# Compliance Audit Packet — ${clientName || 'General'}\n\nGenerated ${new Date().toLocaleDateString()}. Use before any client delivery or invoice to kill silent rule drift.\n\n## Rules to enforce\n${rules.map(r => `- ${r.text}`).join('\n') || '- None defined'}\n\n## Recent outcomes / evidence (last 7 days)\n${recentOutcomes.map(o => `- [${o.client || 'General'}] ${o.text}`).join('\n') || '- None'}\n\n## Audit instructions\n1. Cross-check every listed outcome against the rules above.\n2. Flag any violations or soft deviations with severity (high/med/low) and a concrete suggested fix.\n3. If fully compliant, produce a short client-safe confirmation summary.\n4. Output only the audit results. Do not invent new work or expand scope.\n\nPaste into any agent. Act on the result before shipping to the client.`;
    return md;
  };

  const generateGrillPacket = (clientName = '') => {
    const locked = relevantMemory(clientName).filter(m => m.type === 'rule' || m.type === 'pref');
    const topTask = tasks.filter(t => t.status !== 'done' && (!clientName || (t.client || '').toLowerCase().includes(clientName.toLowerCase())))[0];
    const nextAction = topTask ? (topTask.steps.find(s => s.status !== 'done')?.text || 'Continue work') : 'No open task';

    if (!locked.length) {
      return '# Grill-Before-Act Packet\n\nNo locked rules or preferences yet. Add some first, then regenerate.';
    }

    let md = `# Grill-Before-Act Packet — ${clientName || 'General'}\n\nGenerated ${new Date().toLocaleDateString()}. Kill the pre-action re-explanation tax. Force alignment before any proposal.\n\n## Locked preferences & rules (non-negotiable)\n`;
    locked.forEach(m => {
      md += `- [${m.type.toUpperCase()}] ${m.text}\n`;
    });
    md += `\n## Current context\nTop open next action: ${nextAction}\n\n## Instructions for any agent\n1. Grill yourself against every locked item above. Confirm you understand each one and will not violate it.\n2. If any conflict with the next action or your planned response, STOP and list the conflicts. Do not propose alternatives that ignore locks.\n3. Only if fully aligned, propose exactly one atomic next action that obeys all locks.\n4. Output format only:\nCONFIRMATIONS:\n- item: understood / conflict\nPROPOSED_ACTION: <single sentence or STOP>\nThen stop. Do not expand scope or ask clarifying questions that re-open locked decisions.\n\nPaste this packet into the agent at the start of any session.`;
    return md;
  };

  const finishRate = tasks.length ? Math.round((tasks.filter(t => t.status === 'done').length / tasks.length) * 100) : 0;
  const topOpen = tasks.filter(t => t.status !== 'done')
    .sort((a, b) => (b.priority === 'high' ? 1 : 0) - (a.priority === 'high' ? 1 : 0))
    .slice(0, 5);

  const filteredTasks = clientFilter ? tasks.filter(t => (t.client || '').toLowerCase().includes(clientFilter.toLowerCase())) : tasks;

  return (
    <div className="container">
      <h1>ANGVEY Finisher</h1>
      <p className="subtitle">
        Persistent task + memory agent for solopreneurs. Kill context-switch, rework, amnesia, morning, close-out, interruption, weekly invoice, rule-compliance, and now pre-action alignment taxes.
        One-click Skill Cards, Resume Packets, Next-Action Prompts, Evidence, Receipts, Day-Start/Close/Mid-Day, Weekly Invoice Narratives, Compliance Audits, and Grill-Before-Act Packets for any agent.
      </p>

      <div className="card brief">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div>Finish rate: {finishRate}% · Open: {tasks.filter(t => t.status !== 'done').length} · Memory: {memory.length}</div>
          <div>
            <button className="secondary" onClick={exportData}>Export</button>
            <button className="secondary" onClick={() => fileRef.current.click()}>Import</button>
            <input ref={fileRef} type="file" accept=".json" onChange={importData} style={{ display: 'none' }} />
          </div>
        </div>

        {topOpen.length > 0 && (
          <>
            <h3>Daily Brief — What's Next</h3>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', margin: '0.75rem 0' }}>
              <button onClick={() => copy(generateDayStart(), 'daystart')}>{copied === 'daystart' ? 'Copied!' : 'Day-Start Packet'}</button>
              <button onClick={() => copy(generateDayClose(), 'dayclose')}>{copied === 'dayclose' ? 'Copied!' : 'Day-Close Packet'}</button>
              <button onClick={() => copy(generateMidDay(), 'midday')}>{copied === 'midday' ? 'Copied!' : 'Mid-Day Resume'}</button>
              <button onClick={() => copy(generateWeeklyInvoice(), 'invoice')}>{copied === 'invoice' ? 'Copied!' : 'Weekly Invoice Narrative'}</button>
              <button onClick={() => copy(generateComplianceAudit(clientFilter), 'audit')}>{copied === 'audit' ? 'Copied!' : 'Compliance Audit'}</button>
              <button onClick={() => copy(generateGrillPacket(clientFilter), 'grill')}>{copied === 'grill' ? 'Copied!' : 'Grill-Before-Act'}</button>
            </div>
            {topOpen.map(t => (
              <div key={t.id} style={{ marginBottom: '0.5rem' }}>
                <strong>{t.goal}</strong> <span className={`prio prio-${t.priority}`}>{t.priority}</span>
                <span className="small"> {t.client} · {t.progress}%</span>
                <div style={{ marginTop: '0.25rem' }}>
                  <button className="secondary" style={{ fontSize: '0.8rem', padding: '0.3rem 0.6rem' }} onClick={() => copy(generateNextAction(t), 'next-' + t.id)}>Next-Action</button>
                  <button className="secondary" style={{ fontSize: '0.8rem', padding: '0.3rem 0.6rem' }} onClick={() => copy(generateReceipt(t), 'rec-' + t.id)}>Receipt</button>
                </div>
              </div>
            ))}
          </>
        )}
      </div>

      <div className="card">
        <h3>New Task</h3>
        <input placeholder="Goal / outcome" value={goal} onChange={e => setGoal(e.target.value)} />
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <input placeholder="Client" value={client} onChange={e => setClient(e.target.value)} style={{ flex: 1 }} />
          <select value={priority} onChange={e => setPriority(e.target.value)} style={{ width: 'auto' }}>
            <option value="normal">Normal</option>
            <option value="high">High</option>
          </select>
        </div>
        <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} />
        <input placeholder="Tags (comma)" value={tags} onChange={e => setTags(e.target.value)} />
        <button onClick={addTask}>Start Task</button>
      </div>

      <div className="card">
        <h3>Portable Client Skill Cards</h3>
        <p className="small">Generate compact SKILL.md-style context. Paste into any agent. Filter also scopes Compliance Audit and Grill packets.</p>
        <input placeholder="Client name (blank = general)" value={clientFilter} onChange={e => setClientFilter(e.target.value)} />
        <button onClick={() => copy(generateSkillCard(clientFilter), 'skill')}>{copied === 'skill' ? 'Copied!' : 'Generate Skill Card'}</button>
        <button onClick={() => copy(generateComplianceAudit(clientFilter), 'audit-skill')}>{copied === 'audit-skill' ? 'Copied!' : 'Generate Compliance Audit'}</button>
        <button onClick={() => copy(generateGrillPacket(clientFilter), 'grill-skill')}>{copied === 'grill-skill' ? 'Copied!' : 'Generate Grill Packet'}</button>
      </div>

      <div className="card">
        <h3>Memory</h3>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <select value={memoryType} onChange={e => setMemoryType(e.target.value)} style={{ width: 'auto' }}>
            <option value="fact">Fact</option>
            <option value="rule">Rule</option>
            <option value="pref">Pref</option>
            <option value="outcome">Outcome</option>
          </select>
          <input placeholder="Client (optional)" value={memoryClient} onChange={e => setMemoryClient(e.target.value)} />
        </div>
        <textarea placeholder="Memory text" value={newMemory} onChange={e => setNewMemory(e.target.value)} rows={2} />
        <button onClick={addMemory}>Add Memory</button>
        <div className="log" style={{ marginTop: '1rem' }}>
          {memory.slice(-10).reverse().map(m => (
            <div key={m.id} className="small">[{m.type}] {m.client ? m.client + ': ' : ''}{m.text}</div>
          ))}
        </div>
      </div>

      <div className="card">
        <h3>Tasks {clientFilter && `(filtered: ${clientFilter})`}</h3>
        {filteredTasks.length === 0 && <p className="small">No tasks yet.</p>}
        {filteredTasks.map(t => (
          <div key={t.id} className="card" style={{ marginBottom: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div>
                <strong>{t.goal}</strong>
                <span className={`prio prio-${t.priority}`}>{t.priority}</span>
                {t.client && <span className="small"> · {t.client}</span>}
                {t.dueDate && <span className="small"> · due {t.dueDate}</span>}
              </div>
              <button className="secondary" onClick={() => deleteTask(t.id)} style={{ fontSize: '0.75rem' }}>Delete</button>
            </div>
            <div className="small">Progress: {t.progress}% · Status: {t.status}</div>
            {t.steps.map(s => (
              <div key={s.id} className={`step ${s.status}`}>
                {s.text}
                <span style={{ float: 'right' }}>
                  {['pending', 'running', 'done'].map(st => (
                    <button key={st} className="secondary" style={{ fontSize: '0.7rem', padding: '0.2rem 0.4rem', marginLeft: '0.25rem' }}
                      onClick={() => updateStep(t.id, s.id, st)}>{st}</button>
                  ))}
                </span>
              </div>
            ))}
            <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <button className="secondary" onClick={() => copy(generateResumePacket(t), 'res-' + t.id)}>Resume Packet</button>
              <button className="secondary" onClick={() => copy(generateNextAction(t), 'na-' + t.id)}>Next-Action</button>
              <button className="secondary" onClick={() => copy(generateEvidencePacket(t), 'ev-' + t.id)}>Evidence Prompt</button>
              <button className="secondary" onClick={() => copy(generateReceipt(t), 'rc-' + t.id)}>Receipt</button>
            </div>
          </div>
        ))}
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
