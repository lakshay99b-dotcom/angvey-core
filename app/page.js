'use client';

import { useState, useEffect, useRef } from 'react';

const STORAGE_KEY = 'angvey-finisher-v18';
const LEGACY_KEYS = ['angvey-finisher-v17', 'angvey-finisher-v16', 'angvey-finisher-v15', 'angvey-finisher-v14', 'angvey-finisher-v13', 'angvey-finisher-v12', 'angvey-finisher-v11', 'angvey-finisher-v10', 'angvey-finisher-v9', 'angvey-finisher-v8'];

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
  const [memorySearch, setMemorySearch] = useState('');
  const [skillCopied, setSkillCopied] = useState(null);
  const [resumeCopied, setResumeCopied] = useState(null);
  const [nextActionCopied, setNextActionCopied] = useState(null);
  const [evidenceCopied, setEvidenceCopied] = useState(null);
  const [receiptCopied, setReceiptCopied] = useState(null);
  const [dayStartCopied, setDayStartCopied] = useState(false);
  const [dayCloseCopied, setDayCloseCopied] = useState(false);
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

  const isOverdue = (t) => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'done';

  const recallRelevant = (goalText, taskClient) => {
    const keywords = (goalText || '').toLowerCase().split(/\W+/).filter(w => w.length > 3);
    const now = Date.now();
    const score = (m) => {
      let s = 0;
      if (taskClient && m.client && m.client.toLowerCase() === taskClient.toLowerCase()) s += 5;
      keywords.forEach(k => { if (m.content.toLowerCase().includes(k)) s += 2; });
      if (!m.client) s += 1;
      if (m.type === 'rule' || m.type === 'pref' || m.type === 'outcome') s += 3;
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
    setMemory(prev => prev.map(m => relevant.find(r => r.id === m.id) ? { ...m, uses: (m.uses || 0) + 1 } : m));
    return relevant;
  };

  const generateSkill = (clientName) => {
    const clientMem = memory.filter(m => m.client && m.client.toLowerCase() === (clientName || '').toLowerCase());
    const rules = clientMem.filter(m => m.type === 'rule' || m.type === 'pref').slice(0, 8);
    const outcomes = clientMem.filter(m => m.type === 'outcome').slice(0, 5);
    const facts = clientMem.filter(m => m.type === 'fact').slice(0, 4);
    const skill = `# Skill: ${clientName || 'Global'} Client Context\n\n## Must-Respect Rules & Preferences\n${rules.map(r => `- ${r.content}`).join('\n') || '- None yet'}\n\n## Recent Outcomes & Lessons\n${outcomes.map(o => `- ${o.content}`).join('\n') || '- None'}\n\n## Key Facts\n${facts.map(f => `- ${f.content}`).join('\n') || '- None'}\n\n## Instructions\nLoad this as system context or SKILL.md. Prefer small verifiable progress. Run any verification checklist. Ask only if blocked. Produce output that respects the rules above.`;
    navigator.clipboard.writeText(skill).then(() => {
      setSkillCopied(clientName || 'global');
      addLog(`Generated & copied Skill Card for ${clientName || 'global'}`);
      setTimeout(() => setSkillCopied(null), 2000);
    });
  };

  const generateResumePacket = (clientName) => {
    const clientMem = memory.filter(m => m.client && m.client.toLowerCase() === (clientName || '').toLowerCase());
    const rules = clientMem.filter(m => m.type === 'rule' || m.type === 'pref').slice(0, 6);
    const outcomes = clientMem.filter(m => m.type === 'outcome').slice(0, 4);
    const clientTasks = tasks
      .filter(t => t.client && t.client.toLowerCase() === (clientName || '').toLowerCase() && t.status !== 'done')
      .sort((a, b) => {
        const prio = { high: 3, normal: 2, low: 1 };
        return (prio[b.priority] || 2) - (prio[a.priority] || 2);
      })
      .slice(0, 3);
    const openTasksStr = clientTasks.map(t => {
      const pct = Math.round((t.steps.filter(s => s.status === 'done').length / t.steps.length) * 100);
      const next = t.steps.find(s => s.status === 'running' || s.status === 'pending')?.text || 'Finalize';
      const pendingChecks = (t.checks || []).filter(c => !c.passed).slice(0, 2).map(c => c.text).join('; ');
      return `- [${t.priority}] ${t.goal.slice(0, 90)}${t.goal.length > 90 ? '…' : ''} (${pct}% , next: ${next}${pendingChecks ? ', checks: ' + pendingChecks : ''}${isOverdue(t) ? ' OVERDUE' : ''})`;
    }).join('\n') || '- No open tasks for this client';
    const packet = `# Client Resume Packet: ${clientName || 'Global'}\nGenerated: ${new Date().toLocaleString()}\n\n## Must-Respect Rules & Preferences\n${rules.map(r => `- ${r.content}`).join('\n') || '- None yet'}\n\n## Recent Outcomes & Lessons\n${outcomes.map(o => `- ${o.content}`).join('\n') || '- None'}\n\n## Open Work — Resume From Here\n${openTasksStr}\n\n## Instructions\nPaste this into any agent to instantly resume work for this client. Start with the highest-priority open task's next action. Respect every rule. Prefer finishing existing work. After progress, reflect and retain new outcomes/rules.`;
    navigator.clipboard.writeText(packet).then(() => {
      setResumeCopied(clientName || 'global');
      addLog(`Generated & copied Resume Packet for ${clientName || 'global'}`);
      setTimeout(() => setResumeCopied(null), 2000);
    });
  };

  const generateNextAction = (task) => {
    const nextStep = task.steps.find(s => s.status === 'running' || s.status === 'pending')?.text || 'Finalize and deliver';
    const relevant = recallRelevant(task.goal, task.client);
    const rules = relevant.filter(r => r.type === 'rule' || r.type === 'pref').slice(0, 4).map(r => `- ${r.content}`).join('\n') || '- None specific';
    const pendingChecks = (task.checks || []).filter(c => !c.passed).slice(0, 3).map(c => c.text).join('; ') || 'None pending';
    const promptText = `# NEXT ATOMIC ACTION — ${task.client || 'No Client'} | ${task.priority.toUpperCase()}\nGoal: ${task.goal}\n\n**Do ONLY this next action:** ${nextStep}\n\n**Must respect:**\n${rules}\n\n**Pending checks to satisfy:** ${pendingChecks}\n\n**Instructions:** Produce the smallest possible verifiable output for this single action only. Do not expand scope. After the output, add one line: VERIFICATION: [how this satisfies the checks / rules]. Then stop.`;
    navigator.clipboard.writeText(promptText).then(() => {
      setNextActionCopied(task.id);
      addLog(`Generated & copied Next-Action Prompt for: ${task.goal.slice(0, 40)}`);
      setTimeout(() => setNextActionCopied(null), 2000);
    });
  };

  const generateEvidenceRequest = (task) => {
    const nextStep = task.steps.find(s => s.status === 'running' || s.status === 'pending')?.text || 'Finalize and deliver';
    const relevant = recallRelevant(task.goal, task.client);
    const rules = relevant.filter(r => r.type === 'rule' || r.type === 'pref').slice(0, 3).map(r => `- ${r.content}`).join('\n') || '- None';
    const pendingChecks = (task.checks || []).filter(c => !c.passed).slice(0, 2).map(c => c.text).join('; ') || 'None';
    const promptText = `# FINISH EVIDENCE REQUEST — ${task.client || 'No Client'} | ${task.priority.toUpperCase()}\nGoal: ${task.goal}\n\n**Do ONLY this next action and produce evidence:** ${nextStep}\n\n**Must respect:**\n${rules}\n\n**Pending checks:** ${pendingChecks}\n\n**STRICT OUTPUT FORMAT ONLY:**\nARTIFACT: [the exact smallest verifiable output — text, bullets, link, or snippet]\nVERIFICATION: [one line explaining how this satisfies the action and checks]\nSTOP\n\nDo not add anything else. Do not expand scope. Do not claim done without the ARTIFACT.`;
    navigator.clipboard.writeText(promptText).then(() => {
      setEvidenceCopied(task.id);
      addLog(`Generated & copied Finish Evidence Prompt for: ${task.goal.slice(0, 40)}`);
      setTimeout(() => setEvidenceCopied(null), 2000);
    });
  };

  const logEvidence = (taskId) => {
    const evidence = prompt('Paste the agent\'s ARTIFACT + VERIFICATION output (or summary of the finished increment):');
    if (!evidence || !evidence.trim()) return;
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    addMemory(evidence.trim(), 'outcome', 'evidence', task.client || '');
    addLog(`Logged evidence for task ${taskId}: ${evidence.slice(0, 60)}`);
    const advance = confirm('Advance the current step as done?');
    if (advance) {
      const stepIdx = task.steps.findIndex(s => s.status === 'running');
      if (stepIdx >= 0) advanceStep(taskId, stepIdx);
    }
  };

  const generateClientReceipt = (task) => {
    const nextStep = task.steps.find(s => s.status === 'running' || s.status === 'pending')?.text || 'Continue to next increment';
    const relevant = recallRelevant(task.goal, task.client);
    const recentOutcomes = relevant.filter(r => r.type === 'outcome').slice(0, 3).map(r => r.content).join('\n- ') || 'Progress recorded internally';
    const rulesHint = relevant.filter(r => r.type === 'rule' || r.type === 'pref').slice(0, 2).map(r => r.content).join('; ') || 'Client preferences respected';
    const pct = Math.round((task.steps.filter(s => s.status === 'done').length / task.steps.length) * 100);
    const receipt = `# Progress Update — ${task.client || 'Project'}\n${new Date().toLocaleDateString()}\n\n**Goal:** ${task.goal}\n\n**What was completed:**\n- ${recentOutcomes}\n\n**Progress:** ${pct}% · Next step: ${nextStep}\n\n**Notes:** Delivered with respect to: ${rulesHint}. Evidence retained for verification.\n\nReady for your review or next direction.`;
    navigator.clipboard.writeText(receipt).then(() => {
      setReceiptCopied(task.id);
      addLog(`Generated & copied Client Receipt for: ${task.goal.slice(0, 40)}`);
      setTimeout(() => setReceiptCopied(null), 2000);
    });
  };

  const generateDayStartPacket = () => {
    const open = tasks.filter(t => t.status !== 'done').sort((a, b) => {
      const prio = { high: 3, normal: 2, low: 1 };
      const pa = prio[a.priority] || 2;
      const pb = prio[b.priority] || 2;
      if (pb !== pa) return pb - pa;
      const oa = isOverdue(a) ? 1 : 0;
      const ob = isOverdue(b) ? 1 : 0;
      if (ob !== oa) return ob - oa;
      return (a.dueDate || '9999') < (b.dueDate || '9999') ? -1 : 1;
    }).slice(0, 3);
    if (open.length === 0) {
      alert('No open tasks. Add one first.');
      return;
    }
    const top = open[0];
    const nextStep = top.steps.find(s => s.status === 'running' || s.status === 'pending')?.text || 'Finalize and deliver';
    const relevant = recallRelevant(top.goal, top.client);
    const rules = relevant.filter(r => r.type === 'rule' || r.type === 'pref').slice(0, 4).map(r => `- ${r.content}`).join('\n') || '- None specific';
    const pendingChecks = (top.checks || []).filter(c => !c.passed).slice(0, 3).map(c => c.text).join('; ') || 'None pending';
    const others = open.slice(1).map(t => {
      const n = t.steps.find(s => s.status === 'running' || s.status === 'pending')?.text || 'Finalize';
      return `- [${t.priority}${isOverdue(t) ? ' OVERDUE' : ''}] ${t.client || 'No client'}: ${t.goal.slice(0, 70)}… → next: ${n}`;
    }).join('\n') || '- None';
    const packet = `# DAY-START FINISH PACKET — ${new Date().toLocaleDateString()}\n\n## Attack THIS first (highest leverage)\n# NEXT ATOMIC ACTION — ${top.client || 'No Client'} | ${top.priority.toUpperCase()}${isOverdue(top) ? ' | OVERDUE' : ''}\nGoal: ${top.goal}\n\n**Do ONLY this next action:** ${nextStep}\n\n**Must respect:**\n${rules}\n\n**Pending checks to satisfy:** ${pendingChecks}\n\n**Instructions:** Produce the smallest possible verifiable output for this single action only. Do not expand scope. After the output, add one line: VERIFICATION: [how this satisfies the checks / rules]. Then stop.\n\n## Then queue these\n${others}\n\n## Global note\nPrefer finishing existing work. Reflect outcomes into memory after each increment.`;
    navigator.clipboard.writeText(packet).then(() => {
      setDayStartCopied(true);
      addLog('Generated & copied Day-Start Finish Packet');
      setTimeout(() => setDayStartCopied(false), 2000);
    });
  };

  const generateDayClosePacket = () => {
    const today = new Date().toDateString();
    const recentOutcomes = memory.filter(m => m.type === 'outcome' && new Date(m.ts).toDateString() === today);
    const byClient = {};
    recentOutcomes.forEach(o => {
      const c = o.client || 'No client';
      if (!byClient[c]) byClient[c] = [];
      byClient[c].push(o.content.slice(0, 120));
    });
    const completedStr = Object.keys(byClient).length
      ? Object.entries(byClient).map(([c, items]) => `### ${c}\n${items.map(i => `- ${i}`).join('\n')}`).join('\n\n')
      : '- No evidence/outcomes logged today yet. Log some finishes first.';
    const open = tasks.filter(t => t.status !== 'done').sort((a, b) => {
      const prio = { high: 3, normal: 2, low: 1 };
      return (prio[b.priority] || 2) - (prio[a.priority] || 2);
    }).slice(0, 3);
    const tomorrowStr = open.map(t => {
      const n = t.steps.find(s => s.status === 'running' || s.status === 'pending')?.text || 'Finalize';
      return `- [${t.priority}${isOverdue(t) ? ' OVERDUE' : ''}] ${t.client || 'No client'}: ${t.goal.slice(0, 70)}… → next: ${n}`;
    }).join('\n') || '- All clear — great day!';
    const packet = `# DAY-CLOSE FINISH PACKET — ${new Date().toLocaleDateString()}\n\n## Completed increments today (from logged evidence/outcomes)\n${completedStr}\n\n## Client-safe daily status notes\nUse the above summaries for email/Slack updates or billing narratives. Evidence is retained.\n\n## Queue for tomorrow (highest leverage first)\n${tomorrowStr}\n\n## Reflection prompt\nAny new rules or prefs learned today? Add them to memory before closing. Prefer finishing over starting new work tomorrow.`;
    navigator.clipboard.writeText(packet).then(() => {
      setDayCloseCopied(true);
      addLog('Generated & copied Day-Close Finish Packet');
      setTimeout(() => setDayCloseCopied(false), 2000);
    });
  };

  const createTask = () => {
    if (!goal.trim()) return;
    const relevant = recallRelevant(goal, client);
    const steps = [
      'Recall client-scoped memory & constraints',
      'Plan atomic next actions',
      'Execute draft / research / outline',
      'Self-verify against memory & quality bar',
      'Prepare final output + handoff notes',
      'Reflect on outcome & retain new rules'
    ];
    const tagList = tags.split(',').map(t => t.trim()).filter(Boolean);
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
    addLog(`Started: \"${newTask.goal}\"${client ? ` [${client}]` : ''} | prio ${priority}${dueDate ? ` | due ${dueDate}` : ''} | recalled ${relevant.length} | checks ${checks.length}`);
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
    addLog(`Advanced step on task ${taskId}`);
  };

  const toggleCheck = (taskId, checkId) => {
    setTasks(prev => prev.map(t => {
      if (t.id !== taskId) return t;
      const checks = (t.checks || []).map(c => c.id === checkId ? { ...c, passed: !c.passed } : c);
      return { ...t, checks };
    }));
  };

  const deleteTask = (id) => {
    if (confirm('Delete this task?')) {
      setTasks(prev => prev.filter(t => t.id !== id));
      addLog(`Deleted task ${id}`);
    }
  };

  const exportData = () => {
    const data = { tasks, log, memory, version: 'v18', exported: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `angvey-finisher-v18-${Date.now()}.json`;
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
        if (data.tasks) setTasks(data.tasks);
        if (data.memory) setMemory(data.memory);
        if (data.log) setLog(data.log);
        addLog('Imported data');
      } catch (err) {
        alert('Invalid file');
      }
    };
    reader.readAsText(file);
  };

  const clients = [...new Set(tasks.map(t => t.client).filter(Boolean))];
  const filteredTasks = tasks.filter(t => {
    if (clientFilter && t.client !== clientFilter) return false;
    if (focusMode && t.status === 'done') return false;
    return true;
  });
  const topOpen = tasks.filter(t => t.status !== 'done').sort((a, b) => {
    const prio = { high: 3, normal: 2, low: 1 };
    return (prio[b.priority] || 2) - (prio[a.priority] || 2);
  }).slice(0, 3);
  const finishRate = tasks.length ? Math.round((tasks.filter(t => t.status === 'done').length / tasks.length) * 100) : 0;
  const filteredMemory = memory.filter(m => {
    if (memorySearch && !m.content.toLowerCase().includes(memorySearch.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="container">
      <h1>ANGVEY Finisher</h1>
      <p className="subtitle">
        Persistent task + memory agent for solopreneurs. Kill the AI context-switch tax, draft rework tax, session amnesia, morning prioritization tax, and end-of-day close-out tax.
        One-click Skill Cards, Resume Packets, Next-Action Prompts, Evidence, Receipts, Day-Start Packets, and Day-Close Packets for any agent.
      </p>
      <div style={{ marginBottom: '1rem', fontSize: '0.875rem' }}>
        Finish rate: {finishRate}% · Open: {tasks.filter(t => t.status !== 'done').length} · Memory: {memory.length}
        <button className="secondary" style={{ marginLeft: '1rem' }} onClick={exportData}>Export</button>
        <button className="secondary" style={{ marginLeft: '0.5rem' }} onClick={() => fileRef.current.click()}>Import</button>
        <input type="file" ref={fileRef} onChange={importData} style={{ display: 'none' }} accept=".json" />
        <label style={{ marginLeft: '1rem' }}>
          <input type="checkbox" checked={focusMode} onChange={e => setFocusMode(e.target.checked)} /> Focus (hide done)
        </label>
      </div>

      <div className="card brief">
        <h3>Daily Brief — What's Next</h3>
        <button onClick={generateDayStartPacket} style={{ marginBottom: '0.75rem', marginRight: '0.5rem' }}>
          {dayStartCopied ? 'Copied!' : 'Generate Day-Start Finish Packet'}
        </button>
        <button onClick={generateDayClosePacket} style={{ marginBottom: '0.75rem' }}>
          {dayCloseCopied ? 'Copied!' : 'Generate Day-Close Finish Packet'}
        </button>
        {topOpen.length === 0 ? <p>No open tasks. Create one below.</p> : topOpen.map(t => {
          const next = t.steps.find(s => s.status === 'running' || s.status === 'pending');
          const pct = Math.round((t.steps.filter(s => s.status === 'done').length / t.steps.length) * 100);
          return (
            <div key={t.id} style={{ marginBottom: '0.75rem' }}>
              <strong>{t.client || 'No client'}</strong> · {t.goal.slice(0, 80)}{t.goal.length > 80 ? '…' : ''}
              <span className={`prio prio-${t.priority}`}>{t.priority}</span>
              {isOverdue(t) && <span className="due-overdue">OVERDUE</span>}
              <div className="progress"><div className="progress-bar" style={{ width: `${pct}%` }} /></div>
              <div className="small">Next: {next?.text || 'Finalize'} · {pct}%</div>
            </div>
          );
        })}
      </div>

      <div className="card">
        <h3>Start New Work</h3>
        <input placeholder="Goal / task description" value={goal} onChange={e => setGoal(e.target.value)} />
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <input placeholder="Client" value={client} onChange={e => setClient(e.target.value)} style={{ flex: 1 }} />
          <select value={priority} onChange={e => setPriority(e.target.value)} style={{ flex: 1 }}>
            <option value="high">High</option>
            <option value="normal">Normal</option>
            <option value="low">Low</option>
          </select>
          <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} style={{ flex: 1 }} />
        </div>
        <input placeholder="Tags (comma)" value={tags} onChange={e => setTags(e.target.value)} />
        <button onClick={createTask}>Start Task</button>
      </div>

      <div className="card">
        <h3>Open Work</h3>
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
          <select value={clientFilter} onChange={e => setClientFilter(e.target.value)}>
            <option value="">All clients</option>
            {clients.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        {filteredTasks.filter(t => t.status !== 'done').map(t => {
          const pct = Math.round((t.steps.filter(s => s.status === 'done').length / t.steps.length) * 100);
          return (
            <div key={t.id} className="card" style={{ marginBottom: '1rem', padding: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div>
                  <strong>{t.goal}</strong>
                  {t.client && <span className="small"> · {t.client}</span>}
                  <span className={`prio prio-${t.priority}`}>{t.priority}</span>
                  {t.dueDate && <span className={isOverdue(t) ? 'due-overdue' : 'due'}>{t.dueDate}</span>}
                </div>
                <button className="secondary" onClick={() => deleteTask(t.id)} style={{ fontSize: '0.75rem' }}>×</button>
              </div>
              <div className="progress"><div className="progress-bar" style={{ width: `${pct}%` }} /></div>
              {t.steps.map((s, i) => (
                <div key={s.id} className={`step ${s.status}`}>
                  {s.status === 'done' ? '✓' : s.status === 'running' ? '▶' : '○'} {s.text}
                  {s.status === 'running' && <button className="secondary" style={{ marginLeft: '0.5rem', fontSize: '0.7rem' }} onClick={() => advanceStep(t.id, i)}>Done</button>}
                </div>
              ))}
              {(t.checks || []).length > 0 && (
                <div style={{ marginTop: '0.5rem' }}>
                  <div className="small">Checks:</div>
                  {t.checks.map(c => (
                    <label key={c.id} style={{ display: 'block', fontSize: '0.8rem' }}>
                      <input type="checkbox" checked={c.passed} onChange={() => toggleCheck(t.id, c.id)} /> {c.text}
                    </label>
                  ))}
                </div>
              )}
              <div style={{ marginTop: '0.75rem' }}>
                <button className="secondary" style={{ marginRight: '0.4rem', fontSize: '0.75rem' }} onClick={() => generateSkill(t.client)}>
                  {skillCopied === t.client ? 'Copied!' : 'Skill'}
                </button>
                <button className="secondary" style={{ marginRight: '0.4rem', fontSize: '0.75rem' }} onClick={() => generateResumePacket(t.client)}>
                  {resumeCopied === t.client ? 'Copied!' : 'Resume'}
                </button>
                <button className="secondary" style={{ marginRight: '0.4rem', fontSize: '0.75rem' }} onClick={() => generateNextAction(t)}>
                  {nextActionCopied === t.id ? 'Copied!' : 'Next-Action'}
                </button>
                <button className="secondary" style={{ marginRight: '0.4rem', fontSize: '0.75rem' }} onClick={() => generateEvidenceRequest(t)}>
                  {evidenceCopied === t.id ? 'Copied!' : 'Evidence'}
                </button>
                <button className="secondary" style={{ marginRight: '0.4rem', fontSize: '0.75rem' }} onClick={() => logEvidence(t.id)}>Log Evidence</button>
                <button className="secondary" style={{ fontSize: '0.75rem' }} onClick={() => generateClientReceipt(t)}>
                  {receiptCopied === t.id ? 'Copied!' : 'Receipt'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="card">
        <h3>Memory</h3>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <input placeholder="New memory" value={newMemory} onChange={e => setNewMemory(e.target.value)} style={{ flex: 2 }} />
          <input placeholder="Client" value={memoryClient} onChange={e => setMemoryClient(e.target.value)} style={{ flex: 1 }} />
          <select value={memoryType} onChange={e => setMemoryType(e.target.value)} style={{ flex: 1 }}>
            <option value="fact">Fact</option>
            <option value="rule">Rule</option>
            <option value="pref">Pref</option>
            <option value="outcome">Outcome</option>
          </select>
          <button onClick={() => { addMemory(newMemory, memoryType, 'manual', memoryClient); setNewMemory(''); }}>Add</button>
        </div>
        <input placeholder="Search memory" value={memorySearch} onChange={e => setMemorySearch(e.target.value)} />
        <div className="log">
          {filteredMemory.slice(0, 30).map(m => (
            <div key={m.id} style={{ marginBottom: '0.4rem' }}>
              <span className="small">[{m.type}{m.client ? '/' + m.client : ''}] </span>{m.content}
              <button className="secondary" style={{ marginLeft: '0.5rem', fontSize: '0.7rem' }} onClick={() => deleteMemory(m.id)}>×</button>
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
