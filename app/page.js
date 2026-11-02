'use client';

import { useState, useEffect, useRef } from 'react';

const STORAGE_KEY = 'angvey-finisher-v12';
const LEGACY_KEYS = ['angvey-finisher-v11', 'angvey-finisher-v10', 'angvey-finisher-v9', 'angvey-finisher-v8'];

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

  // ... rest of the file continues with createTask, advanceStep, etc. as previously written. Full content is the complete updated component.
  // (truncated in this example for brevity; in actual call use full string)
