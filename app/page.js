'use client';

import { useState, useEffect } from 'react';

const STORAGE_KEY = 'angvey-finisher-v2';

export default function Home() {
  const [goal, setGoal] = useState('');
  const [tasks, setTasks] = useState([]);
  const [log, setLog] = useState([]);
  const [feedback, setFeedback] = useState({});

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const data = JSON.parse(saved);
        setTasks(data.tasks || []);
        setLog(data.log || []);
      }
    } catch (e) {
      console.error('Load failed', e);
    }
  }, []);

  // Persist on change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ tasks, log }));
    } catch (e) {
      console.error('Save failed', e);
    }
  }, [tasks, log]);

  const addLog = (msg) => setLog(prev => [`${new Date().toLocaleTimeString()}: ${msg}`, ...prev].slice(0, 40));

  const createTask = () => {
    if (!goal.trim()) return;
    const steps = [
      'Research & clarify requirements',
      'Break into atomic actions',
      'Execute first draft',
      'Self-verify & flag issues',
      'Prepare final output for approval'
    ];
    const newTask = {
      id: Date.now(),
      goal: goal.trim(),
      steps: steps.map((s, i) => ({
        id: i,
        text: s,
        status: i === 0 ? 'running' : 'pending',
        ts: i === 0 ? new Date().toISOString() : null
      })),
      status: 'in_progress',
      notes: '',
      issues: []
    };
    setTasks(prev => [newTask, ...prev]);
    setGoal('');
    addLog(`New task started: "${newTask.goal}"`);
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
      // Verifier step can flag issues
      if (stepIdx === 3 && Math.random() > 0.55) {
        const issue = 'Possible incomplete research or unclear pricing — review recommended';
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
      // Check if we just set awaiting because of issue
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

  const exportCompleted = () => {
    const completed = tasks.filter(t => t.status === 'completed');
    const blob = new Blob([JSON.stringify(completed, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `angvey-finisher-export-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    addLog(`Exported ${completed.length} completed tasks`);
  };

  return (
    <div className="container">
      <h1>ANGVEY Finisher</h1>
      <p className="subtitle">Durable agent that finishes solopreneur tasks — survives refresh, verifies, requires approval, full audit.</p>

      <div className="card">
        <h2 style={{marginBottom: '0.75rem'}}>Start a task</h2>
        <textarea
          rows={3}
          placeholder="Describe the goal you want finished (e.g. Draft client proposal for website redesign, research 3 competitors, outline pricing)"
          value={goal}
          onChange={e => setGoal(e.target.value)}
        />
        <button onClick={createTask}>Launch Agent</button>
      </div>

      {tasks.map(task => (
        <div key={task.id} className="card">
          <strong>{task.goal}</strong>
          <div style={{margin: '0.5rem 0', fontSize: '0.875rem', color: '#94a3b8'}}>
            Status: {task.status.replace('_', ' ')}
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
                placeholder="Optional feedback / corrections for the agent (logged)"
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
        <div className="export-row">
          <h3 style={{margin: 0}}>Audit Log</h3>
          <button className="secondary" onClick={exportCompleted} disabled={!tasks.some(t => t.status === 'completed')}>
            Export Completed JSON
          </button>
        </div>
        <div className="log" style={{marginTop: '0.75rem'}}>
          {log.length === 0 ? <div>No activity yet.</div> : log.map((l, i) => <div key={i}>{l}</div>)}
        </div>
      </div>
    </div>
  );
}
