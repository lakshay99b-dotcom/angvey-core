'use client';

import { useState } from 'react';

export default function Home() {
  const [goal, setGoal] = useState('');
  const [tasks, setTasks] = useState([]);
  const [log, setLog] = useState([]);

  const addLog = (msg) => setLog(prev => [`${new Date().toLocaleTimeString()}: ${msg}`, ...prev].slice(0, 20));

  const createTask = () => {
    if (!goal.trim()) return;
    const steps = [
      'Research & clarify requirements',
      'Break into atomic actions',
      'Execute first draft',
      'Self-verify & fix issues',
      'Prepare final output for approval'
    ];
    const newTask = {
      id: Date.now(),
      goal: goal.trim(),
      steps: steps.map((s, i) => ({ id: i, text: s, status: i === 0 ? 'running' : 'pending' })),
      status: 'in_progress'
    };
    setTasks(prev => [newTask, ...prev]);
    setGoal('');
    addLog(`New task started: "${newTask.goal}"`);
    // Simulate agent progress
    setTimeout(() => advanceStep(newTask.id, 0), 800);
  };

  const advanceStep = (taskId, stepIdx) => {
    setTasks(prev => prev.map(t => {
      if (t.id !== taskId) return t;
      const steps = [...t.steps];
      if (steps[stepIdx]) steps[stepIdx].status = 'done';
      if (steps[stepIdx + 1]) steps[stepIdx + 1].status = 'running';
      return { ...t, steps };
    }));
    addLog(`Step ${stepIdx + 1} completed for task ${taskId}`);
    if (stepIdx < 4) {
      setTimeout(() => advanceStep(taskId, stepIdx + 1), 1200);
    } else {
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: 'awaiting_approval' } : t));
      addLog(`Task ${taskId} ready for human approval`);
    }
  };

  const approve = (taskId) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: 'completed' } : t));
    addLog(`Task ${taskId} approved and marked complete`);
  };

  return (
    <div className="container">
      <h1>ANGVEY Finisher</h1>
      <p className="subtitle">Persistent agent that finishes solopreneur tasks — with clear progress, approvals, and audit trail.</p>

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
          </div>
          {task.steps.map(step => (
            <div key={step.id} className={`step ${step.status === 'done' ? 'approved' : step.status === 'running' ? 'pending' : ''}`}>
              {step.status === 'done' ? '✓' : step.status === 'running' ? '▶' : '○'} {step.text}
            </div>
          ))}
          {task.status === 'awaiting_approval' && (
            <button style={{marginTop: '0.75rem'}} onClick={() => approve(task.id)}>Approve & Finish</button>
          )}
          {task.status === 'completed' && <div style={{color: '#4ade80', marginTop: '0.5rem'}}>Completed ✓</div>}
        </div>
      ))}

      <div className="card">
        <h3 style={{marginBottom: '0.5rem'}}>Audit Log</h3>
        <div className="log">
          {log.length === 0 ? <div>No activity yet.</div> : log.map((l, i) => <div key={i}>{l}</div>)}
        </div>
      </div>
    </div>
  );
}
