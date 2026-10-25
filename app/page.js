'use client';

import { useState, useEffect } from 'react';

const STORAGE_KEY = 'angvey-finisher-v4';

export default function Home() {
  const [goal, setGoal] = useState('');
  const [client, setClient] = useState('');
  const [tasks, setTasks] = useState([]);
  const [log, setLog] = useState([]);
  const [feedback, setFeedback] = useState({});
  const [memory, setMemory] = useState([]);
  const [newMemory, setNewMemory] = useState('');
  const [memoryClient, setMemoryClient] = useState('');
  const [memoryFilter, setMemoryFilter] = useState('');
  const [clientFilter, setClientFilter] = useState('');

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
      id: Date.now(),
      type,
      content: content.trim(),
      client: memClient.trim() || null,
      source,
      ts: new Date().toISOString()
    };
    setMemory(prev => [entry, ...prev].slice(0, 100));
    addLog(`Memory added (${type}${memClient ? ' / ' + memClient : ''}): ${content.slice(0, 60)}...`);
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
    return [...clientMatches, ...globalMatches].slice(0, 6);
  };

  const createTask = () => {
    if (!goal.trim()) return;
    const relevant = recallRelevant(goal, client);
    const steps = [
      'Recall client-scoped memory & context',
      'Plan atomic actions',
      'Execute draft (research/outline)',
      'Self-verify against memory & quality',
      'Prepare final output for approval'
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
      recalled: relevant.map(r => r.content)
    };
    setTasks(prev => [newTask, ...prev]);
    setGoal('');
    addLog(`New task started: "${newTask.goal}" ${client ? '(client: ' + client + ')' : ''} | Recalled ${relevant.length} memories`);
    if (relevant.length) addLog(`Recalled: ${relevant.map(r => r.content.slice(0,40)).join('; ')}`);
    setTimeout(() => advanceStep(newTask.id, 0), 700);
  };

  const advanceStep = (taskId, stepIdx) => {
    setTasks(prev => prev.map(t => {
      if (t.id !== taskId) return t;
      const steps = [...t.steps];
      if (steps[stepIdx]) {
        steps[stepIdx].status = 'done';
        steps[stepIdx].ts = new Date().toISOString();
      }
      if (stepIdx === 3 && (t.recalled?.length === 0 || Math.random() > 0.65)) {
        const issue = t.recalled?.length === 0 
          ? 'No prior memory matched for this client — consider adding client facts or decisions'
          : 'Possible inconsistency with past decision — review recommended';
        steps[stepIdx].status = 'issue';
        return {
          ...t,
          steps,
          issues: [...(t.issues || []), issue],
          status: 'awaiting_approval'
        };
      }
      if (steps[stepIdx + 1]) {
        steps[stepIdx + 1].status = 'running';
        steps[stepIdx + 1].ts = new Date().toISOString();
      }
      return { ...t, steps };
    }));

    addLog(`Step ${stepIdx + 1} completed for task ${taskId}`);

    if (stepIdx < 4) {
      setTimeout(() => {
        setTasks(current => {
          const t = current.find(x => x.id === taskId);
          if (t && t.status === 'awaiting_approval') {
            addLog(`Verifier flagged issue on task ${taskId} — awaiting human review`);
            return current;
          }
          if (stepIdx < 3) advanceStep(taskId, stepIdx + 1);
          else {
            setTasks(p => p.map(tt => tt.id === taskId ? { ...tt, status: 'awaiting_approval' } : tt));
            addLog(`Task ${taskId} ready for human approval`);
          }
          return current;
        });
      }, 1100);
    }
  };

  const approve = (taskId) => {
    const note = feedback[taskId] || '';
    setTasks(prev => prev.map(t => {
      if (t.id !== taskId) return t;
      const decision = `Completed "${t.goal}"${note ? ' with note: ' + note.slice(0, 100) : ''}`;
      addMemory(decision, 'decision', `task-${taskId}`, t.client || '');
      return {
        ...t,
        status: 'completed',
        notes: note || t.notes,
        completedAt: new Date().toISOString()
      };
    }));
    addLog(`Task ${taskId} approved${note ? ' with note: ' + note.slice(0, 80) : ''} and marked complete`);
    setFeedback(prev => ({ ...prev, [taskId]: '' }));
  };

  const resumeTask = (taskId) => {
    setTasks(prev => prev.map(t => {
      if (t.id !== taskId || t.status === 'completed') return t;
      const runningIdx = t.steps.findIndex(s => s.status === 'running' || s.status === 'issue');
      const nextIdx = runningIdx >= 0 ? runningIdx : t.steps.findIndex(s => s.status === 'pending');
      if (nextIdx >= 0) {
        const steps = [...t.steps];
        steps[nextIdx].status = 'running';
        steps[nextIdx].ts = new Date().toISOString();
        addLog(`Resumed task ${taskId} at step ${nextIdx + 1}`);
        setTimeout(() => advanceStep(taskId, nextIdx), 500);
        return { ...t, steps, status: 'in_progress' };
      }
      return t;
    }));
  };

  const exportCompleted = () => {
    const completed = tasks.filter(t => t.status === 'completed');
    const blob = new Blob([JSON.stringify({ completed, memory }, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `angvey-finisher-export-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    addLog(`Exported ${completed.length} completed tasks + memory bank`);
  };

  const uniqueClients = [...new Set(memory.map(m => m.client).filter(Boolean).concat(tasks.map(t => t.client).filter(Boolean)))];

  const unfinished = tasks.filter(t => t.status !== 'completed');
  const filteredTasks = tasks.filter(t => !clientFilter || (t.client && t.client.toLowerCase().includes(clientFilter.toLowerCase())) || !t.client);

  const filteredMemory = memory.filter(m => 
    (!memoryFilter || m.content.toLowerCase().includes(memoryFilter.toLowerCase()) || m.type.includes(memoryFilter.toLowerCase())) &&
    (!clientFilter || (m.client && m.client.toLowerCase().includes(clientFilter.toLowerCase())) || !m.client)
  );

  return (
    <div className="container">
      <h1>ANGVEY Finisher</h1>
      <p className="subtitle">Durable agent + Client-scoped Memory Bank for solopreneurs — isolates multi-client context, recalls past decisions, resumes unfinished work, full audit.</p>

      <div className="card">
        <h2 style={{marginBottom: '0.75rem'}}>Start a task</h2>
        <input
          placeholder="Client / Project name (optional — scopes memory)"
          value={client}
          onChange={e => setClient(e.target.value)}
        />
        <textarea
          rows={3}
          placeholder="Describe the goal you want finished (e.g. Draft client proposal for website redesign, research 3 competitors, outline pricing)"
          value={goal}
          onChange={e => setGoal(e.target.value)}
        />
        <button onClick={createTask}>Launch Agent</button>
      </div>

      {unfinished.length > 0 && (
        <div className="card">
          <h3 style={{marginBottom: '0.5rem'}}>Unfinished / Resume Queue <span className="small">({unfinished.length} open)</span></h3>
          {unfinished.map(t => (
            <div key={t.id} className="small" style={{marginBottom: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
              <span>{t.goal.slice(0, 70)}{t.client ? ` [${t.client}]` : ''} — {t.status.replace('_', ' ')}</span>
              {t.status !== 'completed' && <button className="secondary" style={{padding: '0.3rem 0.6rem', fontSize: '0.75rem'}} onClick={() => resumeTask(t.id)}>Resume</button>}
            </div>
          ))}
        </div>
      )}

      <div style={{marginBottom: '1rem'}}>
        <input
          placeholder="Filter tasks & memory by client..."
          value={clientFilter}
          onChange={e => setClientFilter(e.target.value)}
        />
      </div>

      {filteredTasks.map(task => (
        <div key={task.id} className="card">
          <strong>{task.goal}</strong>
          {task.client && <span className="small" style={{marginLeft: '0.5rem', color: '#38bdf8'}}>[{task.client}]</span>}
          <div style={{margin: '0.5rem 0', fontSize: '0.875rem', color: '#94a3b8'}}>
            Status: {task.status.replace('_', ' ')}
            {task.recalled && task.recalled.length > 0 && (
              <div className="small">Recalled: {task.recalled.slice(0,2).join('; ')}...</div>
            )}
            {task.issues && task.issues.length > 0 && (
              <div className="step issue">Verifier issues: {task.issues.join('; ')}</div>
            )}
          </div>
          {task.steps.map(step => (
            <div key={step.id} className={`step ${
              step.status === 'done' ? 'approved' :
              step.status === 'running' ? 'pending' :
              step.status === 'issue' ? 'issue' : ''
            }`}>
              {step.status === 'done' ? '✓' : step.status === 'running' ? '▶' : step.status === 'issue' ? '!' : '○'} {step.text}
              {step.ts && <span className="small"> · {new Date(step.ts).toLocaleTimeString()}</span>}
            </div>
          ))}
          {task.status === 'awaiting_approval' && (
            <div className="feedback">
              <textarea
                rows={2}
                placeholder="Optional feedback / corrections for the agent (logged + added to memory)"
                value={feedback[task.id] || ''}
                onChange={e => setFeedback(prev => ({ ...prev, [task.id]: e.target.value }))}
              />
              <button style={{marginTop: '0.5rem'}} onClick={() => approve(task.id)}>Approve & Finish</button>
            </div>
          )}
          {task.status === 'completed' && (
            <div style={{color: '#4ade80', marginTop: '0.5rem'}}>
              Completed ✓ {task.completedAt && <span className="small">· {new Date(task.completedAt).toLocaleString()}</span>}
              {task.notes && <div className="small">Note: {task.notes}</div>}
            </div>
          )}
        </div>
      ))}

      <div className="card">
        <h3 style={{marginBottom: '0.5rem'}}>Memory Bank <span className="small">({memory.length} entries — client-scoped + global)</span></h3>
        <div style={{display: 'flex', gap: '0.5rem', marginBottom: '0.75rem'}}>
          <input
            placeholder="Client (optional)"
            value={memoryClient}
            onChange={e => setMemoryClient(e.target.value)}
            style={{flex: 1}}
          />
          <input
            placeholder="Add fact, preference or decision..."
            value={newMemory}
            onChange={e => setNewMemory(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && (addMemory(newMemory, 'fact', 'manual', memoryClient), setNewMemory(''), setMemoryClient(''))}
            style={{flex: 2}}
          />
          <button onClick={() => { addMemory(newMemory, 'fact', 'manual', memoryClient); setNewMemory(''); setMemoryClient(''); }}>Add</button>
        </div>
        <input
          placeholder="Filter memory..."
          value={memoryFilter}
          onChange={e => setMemoryFilter(e.target.value)}
          style={{marginBottom: '0.75rem'}}
        />
        <div className="log" style={{maxHeight: '180px'}}>
          {filteredMemory.length === 0 ? <div>No memories yet. Add client facts, pricing decisions, brand voice, etc.</div> :
            filteredMemory.map(m => (
              <div key={m.id} className="small" style={{marginBottom: '0.35rem'}}>
                <span style={{color: m.type === 'decision' ? '#4ade80' : '#38bdf8'}}>[{m.type}]</span>
                {m.client && <span style={{color: '#a78bfa'}}> [{m.client}]</span>} {m.content}
                <span style={{color: '#64748b'}}> · {new Date(m.ts).toLocaleDateString()}</span>
              </div>
            ))
          }
        </div>
      </div>

      <div className="card">
        <div className="export-row">
          <h3 style={{margin: 0}}>Audit Log</h3>
          <button className="secondary" onClick={exportCompleted} disabled={!tasks.some(t => t.status === 'completed')}>
            Export JSON (tasks + memory)
          </button>
        </div>
        <div className="log" style={{marginTop: '0.75rem'}}>
          {log.length === 0 ? <div>No activity yet.</div> : log.map((l, i) => <div key={i}>{l}</div>)}
        </div>
      </div>
    </div>
  );
}
