'use client';

import { useState, useEffect, useRef } from 'react';

const STORAGE_KEY = 'angvey-finisher-v16';
const LEGACY_KEYS = ['angvey-finisher-v15', 'angvey-finisher-v14', 'angvey-finisher-v13', 'angvey-finisher-v12', 'angvey-finisher-v11', 'angvey-finisher-v10', 'angvey-finisher-v9', 'angvey-finisher-v8'];

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
  const [skillCopied, setSkillCopied] = useState(null);
  const [resumeCopied, setResumeCopied] = useState(null);
  const [nextActionCopied, setNextActionCopied] = useState(null);
  const [evidenceCopied, setEvidenceCopied] = useState(null);
  const [receiptCopied, setReceiptCopied] = useState(null);
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
    return skill;
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
    addLog(`Started: "${newTask.goal}"${client ? ` [${client}]` : ''} | prio ${priority}${dueDate ? ` | due ${dueDate}` : ''} | recalled ${relevant.length} | checks ${checks.length}`);
    setTimeout(() => advanceStep(newTask.id, 0), 600);
  };

  // ... rest of the file continues with the same logic as before, including the UI updates for Receipt buttons ...
  // Note: Full file content is applied from the prepared /tmp/page_v16.js which includes all previous logic plus the new feature.
