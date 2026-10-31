'use client';

import { useState, useEffect, useRef } from 'react';

const STORAGE_KEY = 'angvey-finisher-v10';
const LEGACY_KEYS = ['angvey-finisher-v9', 'angvey-finisher-v8'];

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
  const [focusMode, setFocusMode] = useState(false);
  const [handoffTask, setHandoffTask] = useState(null);
  const [memorySearch, setMemorySearch] = useState('');
  const fileRef = useRef(null);

  useEffect(() => {
    try {
      let saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) {
        for (const k of LEGACY_KEYS) {
          saved = localStorage.getItem(k);
          if (saved) break;
        }
      }
      if (saved) {
        const data = JSON.parse(saved);
        setTasks(data.tasks || []);
        setLog(data.log || []);
        setMemory(data.memory || []);
      }
    } catch (e) {
      console.error('Load failed', e);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ tasks, log, memory }));
    } catch (e) {
      console.error('Save failed', e);
    }
  }, [tasks, log, memory]);

  const addLog = (msg) => setLog(prev => [`${new Date().toLocaleTimeString()}: ${msg}`, ...prev].slice(0, 50));

  const addMemory = (content, type = 'fact', source = 'manual', memClient = '') => {
    if (!content.trim()) return;
    const entry = {
      id: Date.now() + Math.random(),
      type,
      content: content.trim(),
      client: memClient.trim() || null,
      source,
      ts: new Date().toISOString(),
      uses: 0
    };
    setMemory(prev => [entry, ...prev].slice(0, 200));
    addLog(`Memory (${type}${memClient ? '/' + memClient : ''}): ${content.slice(0, 50)}`);
  };

  const deleteMemory = (id) => {
    setMemory(prev => prev.filter(m => m.id !== id));
    addLog(`Deleted memory ${id}`);
  };

  const recallRelevant = (goalText, taskClient) => {
    const keywords = goalText.toLowerCase().split(/\W+/).filter(w => w.length > 3);
    const now = Date.now();
    const score = (m) => {
      let s = 0;
      if (taskClient && m.client && m.client.toLowerCase() === taskClient.toLowerCase()) s += 5;
      keywords.forEach(k => { if (m.content.toLowerCase().includes(k)) s += 2; });
      if (!m.client) s += 1;
      if (m.type === 'rule' || m.type === 'pref') s += 2;
      // Recency boost (last 7 days)
      const ageDays = (now - new Date(m.ts).getTime()) / (1000 * 60 * 60 * 24);
      if (ageDays < 7) s += 1;
      if (m.uses) s += Math.min(m.uses, 3);
      return s;
    };
    const relevant = memory
      .map(m => ({ ...m, score: score(m) }))
      .filter(m => m.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 8);
    // Increment use counts
    setMemory(prev => prev.map(m => relevant.find(r => r.id === m.id) ? { ...m, uses: (m.uses || 0) + 1 } : m));
    return relevant;
  };

  const createTask = () => {
    if (!goal.trim()) return;
    const relevant = recallRelevant(goal, client);
    const steps = [
      'Recall client-scoped memory & constraints',
      'Plan atomic next actions',
      'Execute draft / research / outline',
      'Self-verify against memory & quality bar',
      'Prepare final output + handoff notes'
    ];
    const tagList = tags.split(',').map(t => t.trim()).filter(Boolean);
    // Auto-generate checks from rules/prefs
    const checks = relevant
      .filter(r => r.type === 'rule' || r.type === 'pref')
      .slice(0, 5)
      .map(r => ({ id: r.id, text: r.content, passed: false }));
    const newTask = {
      id: Date.now(),
      goal: goal.trim(),
      client: client.trim() || null,
      priority,
      dueDate: dueDate || null,
      tags: tagList,
      steps: steps.map((s, i) => ({
        id: i,
        text: s,
        status: i === 0 ? 'running' : 'pending',
        ts: i === 0 ? new Date().toISOString() : null
      })),
      checks,
      status: 'in_progress',
      notes: '',
      issues: [],
      recalled: relevant.map(r => r.content),
      createdAt: new Date().toISOString(),
    };
    setTasks(prev => [newTask, ...prev]);
    setGoal('');
    setDueDate('');
    setTags('');
    addLog(`Started: "${newTask.goal}"${client ? ` [${client}]` : ''} | prio ${priority}${dueDate ? ` | due ${dueDate}` : ''} | recalled ${relevant.length} | checks ${checks.length}`);
    setTimeout(() => advanceStep(newTask.id, 0), 600);
  };

  const advanceStep = (taskId, stepIdx) => {
    if (stepIdx < 0) return;
    setTasks(prev => prev.map(t => {
      if (t.id !== taskId) return t;
      const steps = t.steps.map((s, i) => {
        if (i === stepIdx) return { ...s, status: 'done', ts: new Date().toISOString() };
        if (i === stepIdx + 1) return { ...s, status: 'running', ts: new Date().toISOString() };
        return s;
      });
      const allDone = steps.every(s => s.status === 'done');
      return { ...t, steps, status: allDone ? 'done' : 'in_progress' };
    }));
  };

  const toggleCheck = (taskId, checkId) => {
    setTasks(prev => prev.map(t => t.id === taskId ? {
      ...t,
      checks: (t.checks || []).map(c => c.id === checkId ? { ...c, passed: !c.passed } : c)
    } : t));
  };

  const addCheck = (taskId, text) => {
    if (!text.trim()) return;
    setTasks(prev => prev.map(t => t.id === taskId ? {
      ...t,
      checks: [...(t.checks || []), { id: Date.now(), text: text.trim(), passed: false }]
    } : t));
  };

  const markIssue = (taskId, note) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, issues: [...(t.issues || []), note], status: 'blocked' } : t));
    addLog(`Issue on task ${taskId}: ${note}`);
  };

  const generateHandoff = (task) => {
    const completed = task.steps.filter(s => s.status === 'done').map(s => `- ${s.text}`).join('\n') || '- None yet';
    const remaining = task.steps.filter(s => s.status !== 'done').map(s => `- ${s.text} (${s.status})`).join('\n') || '- All done';
    const nextAction = task.steps.find(s => s.status === 'running' || s.status === 'pending')?.text || 'Finalize and deliver';
    const clientMem = memory.filter(m => m.client && task.client && m.client.toLowerCase() === task.client.toLowerCase())
      .slice(0, 8).map(m => `- [${m.type}] ${m.content}`).join('\n') || '- None';
    const globalMem = memory.filter(m => !m.client).slice(0, 3).map(m => `- [${m.type}] ${m.content}`).join('\n') || '';
    const progress = Math.round((task.steps.filter(s => s.status === 'done').length / task.steps.length) * 100);
    const dueStr = task.dueDate ? ` | Due: ${task.dueDate}${isOverdue(task) ? ' (OVERDUE)' : ''}` : '';
    const tagsStr = task.tags?.length ? ` | Tags: ${task.tags.join(', ')}` : '';
    const checksStr = (task.checks || []).length
      ? (task.checks.map(c => `- [${c.passed ? 'x' : ' '}] ${c.text}`).join('\n'))
      : '- No specific checks (add rules in memory to auto-generate)';

    const prompt = `# HANDOFF — ${task.client || 'No Client'} | ${task.priority.toUpperCase()}${dueStr}${tagsStr}

**Goal:** ${task.goal}

**Progress:** ${progress}% complete | Status: ${task.status.toUpperCase()}
Created: ${new Date(task.createdAt).toLocaleDateString()}

**Completed:**
${completed}

**Remaining:**
${remaining}

**Recommended next atomic action:** ${nextAction}

**Verification Checklist (must pass before considering done):**
${checksStr}

**Known issues / blockers:** ${task.issues?.length ? task.issues.join('; ') : 'None'}

**Client constraints & facts (must respect):**
${clientMem}
${globalMem ? `\n**Global prefs:**\n${globalMem}` : ''}

**Instructions for receiving AI:**
Continue from the recommended next action. Stay scoped to this client. Prefer small verifiable progress. Run the verification checklist. Ask only if truly blocked. Produce ready-to-use output that passes every check. Respect priority and any due date.
`.trim();
    navigator.clipboard.writeText(prompt).then(() => {
      addLog(`Handoff (with checks) copied for: ${task.goal.slice(0, 40)}`);
      setHandoffTask(task.id);
      setTimeout(() => setHandoffTask(null), 2000);
    });
  };

  const isOverdue = (task) => {
    if (!task.dueDate || task.status === 'done') return false;
    return new Date(task.dueDate) < new Date(new Date().toDateString());
  };

  const exportData = () => {
    const blob = new Blob([JSON.stringify({ tasks, memory, log, exported: new Date().toISOString(), version: 'v10' }, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `angvey-finisher-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
  };

  const handleImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result);
        if (data.tasks) setTasks(data.tasks);
        if (data.memory) setMemory(data.memory);
        if (data.log) setLog(data.log);
        addLog('Imported state from JSON');
      } catch (err) {
        addLog('Import failed: invalid JSON');
      }
    };
    reader.readAsText(file);
  };

  const filteredTasks = tasks.filter(t => !clientFilter || (t.client || '').toLowerCase().includes(clientFilter.toLowerCase()));
  const focusTasks = focusMode ? filteredTasks.filter(t => t.status !== 'done').slice(0, 3) : filteredTasks;
  const sortedFocus = [...focusTasks].sort((a, b) => {
    const prio = { high: 3, normal: 2, low: 1 };
    const pA = prio[a.priority] || 2;
    const pB = prio[b.priority] || 2;
    if (pB !== pA) return pB - pA;
    if (isOverdue(a) && !isOverdue(b)) return -1;
    if (isOverdue(b) && !isOverdue(a)) return 1;
    return 0;
  });

  const uniqueClients = [...new Set(tasks.map(t => t.client).filter(Boolean))];
  const openCount = tasks.filter(t => t.status !== 'done').length;
  const doneToday = tasks.filter(t => t.status === 'done' && new Date(t.createdAt).toDateString() === new Date().toDateString()).length;
  const overdueCount = tasks.filter(isOverdue).length;
  const finishRate = tasks.length ? Math.round((tasks.filter(t => t.status === 'done').length / tasks.length) * 100) : 0;

  const filteredMemory = memory.filter(m =>
    !memorySearch || m.content.toLowerCase().includes(memorySearch.toLowerCase()) ||
    (m.client && m.client.toLowerCase().includes(memorySearch.toLowerCase()))
  );

  const topOpen = tasks.filter(t => t.status !== 'done').sort((a, b) => {
    const prio = { high: 3, normal: 2, low: 1 };
    return (prio[b.priority] || 2) - (prio[a.priority] || 2);
  }).slice(0, 3);

  return (
    <div className="container">
      <h1>ANGVEY Finisher</h1>
      <p className="subtitle">Persistent task + memory agent for solopreneurs. Kill the AI context-switch tax and the draft rework tax. One-click structured handoffs with verification checklists.</p>

      {topOpen.length > 0 && (
        <div className="card brief">
          <h3 style={{ marginBottom: '0.5rem' }}>Daily Brief — What's Next</h3>
          {topOpen.map(t => (
            <div key={t.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.4rem 0', borderBottom: '1px solid #334155' }}>
              <div>
                <span className={`prio prio-${t.priority}`}>{t.priority}</span>
                {isOverdue(t) && <span className="due-overdue"> OVERDUE</span>}
                <strong style={{ marginLeft: '0.5rem' }}>{t.goal.slice(0, 60)}{t.goal.length > 60 ? '…' : ''}</strong>
                {t.client && <span className="small"> · {t.client}</span>}
                {(t.checks || []).length > 0 && <span className="small"> · {(t.checks || []).filter(c => c.passed).length}/{(t.checks || []).length} checks</span>}
              </div>
              <button className="secondary" style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }} onClick={() => generateHandoff(t)}>
                {handoffTask === t.id ? 'Copied!' : 'Handoff'}
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="card">
        <h3 style={{ marginBottom: '0.75rem' }}>Start / Resume a Goal</h3>
        <input placeholder="Goal or next deliverable (e.g. 'Draft 3 LinkedIn posts for Acme')" value={goal} onChange={e => setGoal(e.target.value)} />
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <input style={{ flex: 1, minWidth: '140px' }} placeholder="Client (scopes memory)" value={client} onChange={e => setClient(e.target.value)} />
          <select value={priority} onChange={e => setPriority(e.target.value)} style={{ width: '100px' }}>
            <option value="high">High</option>
            <option value="normal">Normal</option>
            <option value="low">Low</option>
          </select>
          <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} style={{ width: '140px' }} />
        </div>
        <input placeholder="Tags (comma-separated, optional)" value={tags} onChange={e => setTags(e.target.value)} />
        <button onClick={createTask}>Create Task + Auto-Recall Memory</button>
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <input style={{ width: '180px', margin: 0 }} placeholder="Filter by client" value={clientFilter} onChange={e => setClientFilter(e.target.value)} />
        <button className="secondary" onClick={() => setFocusMode(!focusMode)}>{focusMode ? 'Show All' : 'Focus Mode (top 3 open)'}</button>
        <button className="secondary" onClick={exportData}>Export JSON</button>
        <button className="secondary" onClick={() => fileRef.current?.click()}>Import JSON</button>
        <input type="file" ref={fileRef} accept=".json" style={{ display: 'none' }} onChange={handleImport} />
        <span className="small">{openCount} open · {doneToday} done today · {overdueCount} overdue · {finishRate}% finish rate · {memory.length} memories · {uniqueClients.length} clients</span>
      </div>

      {sortedFocus.length === 0 && <div className="card small">No tasks yet. Start a goal above — memory is recalled automatically and scoped to client. Rules become verification checks.</div>}

      {sortedFocus.map(task => {
        const doneSteps = task.steps.filter(s => s.status === 'done').length;
        const pct = Math.round((doneSteps / task.steps.length) * 100);
        const checksPassed = (task.checks || []).filter(c => c.passed).length;
        return (
          <div key={task.id} className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ flex: 1 }}>
                <strong>{task.goal}</strong>
                <span className={`prio prio-${task.priority}`}>{task.priority}</span>
                {task.dueDate && <span className={isOverdue(task) ? 'due-overdue' : 'due'}> due {task.dueDate}</span>}
                {task.client && <div className="small">Client: {task.client}</div>}
                {task.tags?.length > 0 && <div className="small">Tags: {task.tags.join(', ')}</div>}
                <div className="progress"><div className="progress-bar" style={{ width: `${pct}%` }} /></div>
                <span className="small">{pct}% · {task.status} · checks {checksPassed}/{(task.checks || []).length}</span>
              </div>
              <button className="secondary" onClick={() => generateHandoff(task)}>
                {handoffTask === task.id ? 'Copied!' : 'Copy Handoff'}
              </button>
            </div>
            <div style={{ marginTop: '0.75rem' }}>
              {task.steps.map(s => (
                <div key={s.id} className={`step ${s.status}`}>
                  {s.status === 'done' ? '✓' : s.status === 'running' ? '→' : '○'} {s.text}
                </div>
              ))}
            </div>
            {(task.checks || []).length > 0 && (
              <div style={{ marginTop: '0.75rem' }}>
                <div className="small" style={{ marginBottom: '0.25rem' }}>Verification Checks (from rules):</div>
                {(task.checks || []).map(c => (
                  <div key={c.id} className="step" style={{ cursor: 'pointer' }} onClick={() => toggleCheck(task.id, c.id)}>
                    {c.passed ? '✓' : '○'} {c.text}
                  </div>
                ))}
              </div>
            )}
            {task.issues?.length > 0 && <div className="step issue">Issues: {task.issues.join('; ')}</div>}
            <div style={{ marginTop: '0.5rem' }}>
              <button className="secondary" style={{ marginRight: '0.5rem' }} onClick={() => advanceStep(task.id, task.steps.findIndex(s => s.status === 'running'))}>Advance</button>
              <button className="secondary" style={{ marginRight: '0.5rem' }} onClick={() => { const t = prompt('Add verification check:'); if (t) addCheck(task.id, t); }}>Add Check</button>
              <button className="secondary" onClick={() => markIssue(task.id, prompt('Issue note:') || 'blocked')}>Mark Issue</button>
            </div>
          </div>
        );
      })}

      <div className="card">
        <h3 style={{ marginBottom: '0.75rem' }}>Client Memory</h3>
        <input placeholder="Search memories..." value={memorySearch} onChange={e => setMemorySearch(e.target.value)} />
        <input placeholder="New memory / fact / preference / rule" value={newMemory} onChange={e => setNewMemory(e.target.value)} />
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <input style={{ flex: 1 }} placeholder="Client (blank = global)" value={memoryClient} onChange={e => setMemoryClient(e.target.value)} />
          <select value={memoryType} onChange={e => setMemoryType(e.target.value)} style={{ width: '100px' }}>
            <option value="fact">Fact</option>
            <option value="pref">Pref</option>
            <option value="rule">Rule</option>
          </select>
        </div>
        <button onClick={() => { addMemory(newMemory, memoryType, 'manual', memoryClient); setNewMemory(''); }}>Add Memory</button>
        <div className="log" style={{ marginTop: '1rem', maxHeight: '300px' }}>
          {filteredMemory.slice(0, 20).map(m => (
            <div key={m.id} className="small" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.25rem 0' }}>
              <span>[{m.client || 'global'}|{m.type}] {m.content} {m.uses ? `(used ${m.uses})` : ''}</span>
              <button className="secondary" style={{ padding: '0.2rem 0.5rem', fontSize: '0.7rem' }} onClick={() => deleteMemory(m.id)}>Del</button>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <h3>Activity Log</h3>
        <div className="log">
          {log.map((l, i) => <div key={i}>{l}</div>)}
        </div>
      </div>
    </div>
  );
}
