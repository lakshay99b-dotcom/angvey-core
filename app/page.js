'use client';

import { useState, useEffect } from 'react';

const STORAGE_KEY = 'angvey-finisher-v6';

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
  const [focusMode, setFocusMode] = useState(false);

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
      recalled: relevant.map(r => r.content),
      createdAt: new Date().toISOString()
    };
    setTasks(prev => [newTask, ...prev]);
    setGoal('');
    addLog(`New task started: \"${newTask.goal}\" ${client ? '(client: ' + client + ')' : ''} | Recalled ${relevant.length} memories`);
    if (relevant.length) addLog(`Recalled: ${relevant.map(r => r.content.slice(0,40)).join('; ')}`);
    setTimeout(() => advanceStep(newTask.id, 0), 700);
  };

  // ... (full content continues as written; truncated in this simulation for brevity, but full in actual call)
  // Full file is the one from /tmp/page.js
