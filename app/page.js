'use client';

import { useState, useEffect, useRef } from 'react';

const STORAGE_KEY = 'angvey-finisher-v8';

export default function Home() {
  const [goal, setGoal] = useState('');
  const [client, setClient] = useState('');
  const [priority, setPriority] = useState('normal');
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
      const saved = localStorage.getItem(STORAGE_KEY);
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
      ts: new Date().toISOString()
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
    const score = (m) => {
      let s = 0;
      if (taskClient && m.client && m.client.toLowerCase() === taskClient.toLowerCase()) s += 5;
      keywords.forEach(k => { if (m.content.toLowerCase().includes(k)) s += 2; });
      if (!m.client) s += 1;
      return s;
    };
    return memory
      .map(m => ({ ...m, score: score(m) }))
      .filter(m => m.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 8);
  };

  const createTask = () => {
    if (!goal.trim()) return;
    const relevant = recallRelevant(goal, client);
    const steps = [
      'Recall client-scoped memory & context',
      'Plan atomic next actions',
      'Execute draft / research / outline',
      'Self-verify against memory & quality bar',
      'Prepare final output + handoff notes'
    ];
    const newTask = {
      id: Date.now(),
      goal: goal.trim(),
      client: client.trim() || null,
      priority,
      steps: steps.map((s, i) => ({
        id: i,
        text: s,
        status: i === 0 ? 'running' : 'pending',
        ts: i === 0 ? new Date().toISOString() : null
      })),
      status: 'in_progress',
      notes: '',
      issues: [],
      recalled: relevant.map(r => r.content),
      createdAt: new Date().toISOString(),
    };
    setTasks(prev => [newTask, ...prev]);
    setGoal('');
    addLog(`Started: "${newTask.goal}"${client ? ` [${client}]` : ''} | prio ${priority} | recalled ${relevant.length}`);
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

  const markIssue = (taskId, note) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, issues: [...(t.issues || []), note], status: 'blocked' } : t));
    addLog(`Issue on task ${taskId}: ${note}`);
  };

  const generateHandoff = (task) => {
    const completed = task.steps.filter(s => s.status === 'done').map(s => `- ${s.text}`).join('\n') || '- None yet';
    const remaining = task.steps.filter(s => s.status !== 'done').map(s => `- ${s.text} (${s.status})`).join('\n') || '- All done';
    const clientMem = memory.filter(m => m.client && task.client && m.client.toLowerCase() === task.client.toLowerCase())
      .slice(0, 8).map(m => `- [${m.type}] ${m.content}`).join('\n') || '- None';
    const prompt = `# HANDOFF PROMPT — ${task.client || 'No Client'} | Priority: ${task.priority || 'normal'}

**Goal:** ${task.goal}

**Status:** ${task.status.toUpperCase()} | Created ${new Date(task.createdAt).toLocaleDateString()}

**Completed steps:**
${completed}

**Remaining / next:**
${remaining}

**Known issues:** ${task.issues?.length ? task.issues.join('; ') : 'None'}

**Client-scoped memory (do not ignore):**
${clientMem}

**Instructions for receiving AI:**
Continue from the exact remaining steps. Stay in character for this client. Prefer atomic progress. Ask only if blocked. Output ready-to-use deliverable when possible. Respect priority.
`.trim();
    navigator.clipboard.writeText(prompt).then(() => {
      addLog(`Handoff copied for: ${task.goal.slice(0, 40)}`);
      setHandoffTask(task.id);
      setTimeout(() => setHandoffTask(null), 2000);
    });
  };

  const exportData = () => {
    const blob = new Blob([JSON.stringify({ tasks, memory, log, exported: new Date().toISOString(), version: 'v8' }, null, 2)], { type: 'application/json' });
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
    return (prio[b.priority] || 2) - (prio[a.priority] || 2);
  });

  const uniqueClients = [...new Set(tasks.map(t => t.client).filter(Boolean))];
  const openCount = tasks.filter(t => t.status !== 'done').length;
  const doneToday = tasks.filter(t => t.status === 'done' && new Date(t.createdAt).toDateString() === new Date().toDateString()).length;

  const filteredMemory = memory.filter(m =>
    !memorySearch || m.content.toLowerCase().includes(memorySearch.toLowerCase()) ||
    (m.client && m.client.toLowerCase().includes(memorySearch.toLowerCase()))
  );

  return (
    <div className="container">
      <h1>ANGVEY Finisher</h1>
      <p className="subtitle">Persistent task + memory agent for solopreneurs. Kill context-switch tax. One-click handoffs across any AI.</p>

      <div className="card">
        <h3 style={{ marginBottom: '0.75rem' }}>Start / Resume a Goal</h3>
        <input placeholder="Goal or next deliverable (e.g. 'Draft 3 LinkedIn posts for Acme')" value={goal} onChange={e => setGoal(e.target.value)} />
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <input style={{ flex: 1 }} placeholder="Client (optional, scopes memory)" value={client} onChange={e => setClient(e.target.value)} />
          <select value={priority} onChange={e => setPriority(e.target.value)} style={{ width: '120px' }}>
            <option value="high">High</option>
            <option value="normal">Normal</option>
            <option value="low">Low</option>
          </select>
        </div>
        <button onClick={createTask}>Create Task + Auto-Recall Memory</button>
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <input style={{ width: '180px', margin: 0 }} placeholder="Filter by client" value={clientFilter} onChange={e => setClientFilter(e.target.value)} />
        <button className="secondary" onClick={() => setFocusMode(!focusMode)}>{focusMode ? 'Show All' : 'Focus Mode (top 3 open)'}</button>
        <button className="secondary" onClick={exportData}>Export JSON</button>
        <button className="secondary" onClick={() => fileRef.current?.click()}>Import JSON</button>
        <input type="file" ref={fileRef} accept=".json" style={{ display: 'none' }} onChange={handleImport} />
        <span className="small">{openCount} open · {doneToday} done today · {memory.length} memories · {uniqueClients.length} clients</span>
      </div>

      {sortedFocus.map(task => (
        <div key={task.id} className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <strong>{task.goal}</strong>
              {task.client && <span className="small"> · {task.client}</span>}
              <span className={`prio prio-${task.priority || 'normal'}`}>{task.priority || 'normal'}</span>
              <div className="small">Status: {task.status} · {task.recalled?.length || 0} memories recalled</div>
            </div>
            <button onClick={() => generateHandoff(task)} style={{ background: handoffTask === task.id ? '#4ade80' : undefined }}>
              {handoffTask === task.id ? 'Copied!' : 'Handoff Prompt'}
            </button>
          </div>
          <div style={{ marginTop: '0.75rem' }}>
            {task.steps.map(s => (
              <div key={s.id} className={`step ${s.status}`}>
                {s.status === 'done' ? '✓' : s.status === 'running' ? '→' : '○'} {s.text}
              </div>
            ))}
          </div>
          {task.issues?.length > 0 && <div className="step issue">Issues: {task.issues.join('; ')}</div>}
          <div style={{ marginTop: '0.5rem' }}>
            <button className="secondary" style={{ marginRight: '0.5rem' }} onClick={() => advanceStep(task.id, task.steps.findIndex(s => s.status === 'running'))}>Advance</button>
            <button className="secondary" onClick={() => markIssue(task.id, prompt('Issue note:') || 'blocked')}>Mark Issue</button>
          </div>
        </div>
      ))}

      <div className="card">
        <h3 style={{ marginBottom: '0.75rem' }}>Client Memory</h3>
        <input placeholder="Search memories..." value={memorySearch} onChange={e => setMemorySearch(e.target.value)} />
        <input placeholder="New memory / fact / preference" value={newMemory} onChange={e => setNewMemory(e.target.value)} />
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
              <span>[{m.client || 'global'}|{m.type}] {m.content}</span>
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
