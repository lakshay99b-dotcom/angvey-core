'use client';

import { useState, useEffect } from 'react';

const STORAGE_KEY = 'angvey-finisher-v7';

export default function Home() {
  const [goal, setGoal] = useState('');
  const [client, setClient] = useState('');
  const [tasks, setTasks] = useState([]);
  const [log, setLog] = useState([]);
  const [memory, setMemory] = useState([]);
  const [newMemory, setNewMemory] = useState('');
  const [memoryClient, setMemoryClient] = useState('');
  const [clientFilter, setClientFilter] = useState('');
  const [focusMode, setFocusMode] = useState(false);
  const [handoffTask, setHandoffTask] = useState(null);

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

  const addLog = (msg) => setLog(prev => [`${new Date().toLocaleTimeString()}: ${msg}`, ...prev].slice(0, 40));

  const addMemory = (content, type = 'fact', source = 'manual', memClient = '') => {
    if (!content.trim()) return;
    const entry = {
      id: Date.now(),
      type,
      content: content.trim(),
      client: memClient.trim() || null,
      source,
      ts: new Date().toISOString()
    };
    setMemory(prev => [entry, ...prev].slice(0, 120));
    addLog(`Memory (${type}${memClient ? '/' + memClient : ''}): ${content.slice(0, 50)}`);
  };

  const recallRelevant = (goalText, taskClient) => {
    const keywords = goalText.toLowerCase().split(/\W+/).filter(w => w.length > 3);
    const clientMatches = memory.filter(m =>
      m.client && taskClient && m.client.toLowerCase() === taskClient.toLowerCase() &&
      (keywords.length === 0 || keywords.some(k => m.content.toLowerCase().includes(k)))
    );
    const globalMatches = memory.filter(m =>
      !m.client && (keywords.length === 0 || keywords.some(k => m.content.toLowerCase().includes(k)))
    );
    return [...clientMatches, ...globalMatches].slice(0, 8);
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
      priority: 'normal'
    };
    setTasks(prev => [newTask, ...prev]);
    setGoal('');
    addLog(`Started: "${newTask.goal}"${client ? ` [${client}]` : ''} | recalled ${relevant.length}`);
    setTimeout(() => advanceStep(newTask.id, 0), 600);
  };

  const advanceStep = (taskId, stepIdx) => {
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
      .slice(0, 6).map(m => `- [${m.type}] ${m.content}`).join('\n') || '- None';
    const prompt = `# HANDOFF PROMPT — ${task.client || 'No Client'}

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
Continue from the exact remaining steps. Stay in character for this client. Prefer atomic progress. Ask only if blocked. Output ready-to-use deliverable when possible.
`.trim();
    navigator.clipboard.writeText(prompt).then(() => {
      addLog(`Handoff copied for: ${task.goal.slice(0, 40)}`);
      setHandoffTask(task.id);
      setTimeout(() => setHandoffTask(null), 2000);
    });
  };

  const exportData = () => {
    const blob = new Blob([JSON.stringify({ tasks, memory, log, exported: new Date().toISOString() }, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `angvey-finisher-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
  };

  const filteredTasks = tasks.filter(t => !clientFilter || (t.client || '').toLowerCase().includes(clientFilter.toLowerCase()));
  const focusTasks = focusMode ? filteredTasks.filter(t => t.status !== 'done').slice(0, 3) : filteredTasks;

  const uniqueClients = [...new Set(tasks.map(t => t.client).filter(Boolean))];

  return (
    <div className="container">
      <h1>ANGVEY Finisher</h1>
      <p className="subtitle">Persistent task + memory agent for solopreneurs. Kill context-switch tax. One-click handoffs.</p>

      <div className="card">
        <h3 style={{ marginBottom: '0.75rem' }}>Start / Resume a Goal</h3>
        <input placeholder="Goal or next deliverable (e.g. 'Draft 3 LinkedIn posts for Acme')" value={goal} onChange={e => setGoal(e.target.value)} />
        <input placeholder="Client (optional, scopes memory)" value={client} onChange={e => setClient(e.target.value)} />
        <button onClick={createTask}>Create Task + Auto-Recall Memory</button>
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <input style={{ width: '200px', margin: 0 }} placeholder="Filter by client" value={clientFilter} onChange={e => setClientFilter(e.target.value)} />
        <button className="secondary" onClick={() => setFocusMode(!focusMode)}>{focusMode ? 'Show All' : 'Focus Mode (top 3 open)'}</button>
        <button className="secondary" onClick={exportData}>Export JSON</button>
        <span className="small">{tasks.filter(t => t.status !== 'done').length} open · {memory.length} memories · {uniqueClients.length} clients</span>
      </div>

      {focusTasks.map(task => (
        <div key={task.id} className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <strong>{task.goal}</strong>
              {task.client && <span className="small"> · {task.client}</span>}
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
        <input placeholder="New memory / fact / preference" value={newMemory} onChange={e => setNewMemory(e.target.value)} />
        <input placeholder="Client (blank = global)" value={memoryClient} onChange={e => setMemoryClient(e.target.value)} />
        <button onClick={() => { addMemory(newMemory, 'fact', 'manual', memoryClient); setNewMemory(''); }}>Add Memory</button>
        <div className="log" style={{ marginTop: '1rem' }}>
          {memory.slice(0, 15).map(m => (
            <div key={m.id} className="small">[{m.client || 'global'}] {m.content}</div>
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
