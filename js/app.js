/* ─────────────────────────────────────────────
   ForgeFit AI  –  app.js
   ───────────────────────────────────────────── */

'use strict';

/* ── STATE ── */
let currentStep  = 0;
let openDayIndex = -1;
let userData     = {};
let currentPlan  = null;

/* ── INIT ── */
document.addEventListener('DOMContentLoaded', () => {
  initChips();
  setTimeGreeting();
  loadSavedProfile();
});

function setTimeGreeting() {
  const h = new Date().getHours();
  const el = document.getElementById('time-greeting');
  if (!el) return;
  el.textContent = h < 12 ? 'MORNING' : h < 17 ? 'AFTERNOON' : 'EVENING';
}

/* ── CHIP INTERACTIONS ── */
function initChips() {
  // Single-select chips
  document.querySelectorAll('.chip-group').forEach(group => {
    group.querySelectorAll('.chip').forEach(chip => {
      chip.addEventListener('click', () => {
        group.querySelectorAll('.chip').forEach(c => c.classList.remove('selected'));
        chip.classList.add('selected');
      });
    });
  });

  // Multi-select condition chips
  document.querySelectorAll('.condition-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      if (chip.dataset.val === 'none') {
        document.querySelectorAll('.condition-chip').forEach(c => c.classList.remove('selected'));
        chip.classList.toggle('selected');
      } else {
        document.querySelector('.condition-chip[data-val="none"]')?.classList.remove('selected');
        chip.classList.toggle('selected');
      }
    });
  });
}

/* ── STEP NAVIGATION ── */
function nextStep(to) {
  document.getElementById('step-' + currentStep)?.classList.remove('active');
  const dotCurrent = document.getElementById('dot-' + currentStep);
  dotCurrent?.classList.remove('active');
  dotCurrent?.classList.add('done');

  currentStep = to;

  document.getElementById('step-' + currentStep)?.classList.add('active');
  document.getElementById('dot-' + currentStep)?.classList.add('active');

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function resetToStep(s) {
  for (let i = 0; i < 4; i++) {
    document.getElementById('step-' + i)?.classList.remove('active');
    document.getElementById('dot-' + i)?.classList.remove('active', 'done');
  }
  currentStep = s;
  document.getElementById('step-' + s)?.classList.add('active');
  document.getElementById('dot-' + s)?.classList.add('active');
}

/* ── VIEW ROUTING ── */
function showView(id) {
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.getElementById(id)?.classList.add('active');

  document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
  if (id === 'profile-view')  document.getElementById('tab-setup')?.classList.add('active');
  if (id === 'schedule-view') document.getElementById('tab-schedule')?.classList.add('active');

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function editProfile() {
  showView('profile-view');
  resetToStep(0);
}

/* ── COLLECT USER DATA ── */
function collectUserData() {
  userData = {
    name:     (document.getElementById('name')?.value || '').trim() || 'Champion',
    age:      document.getElementById('age')?.value || 25,
    gender:   document.getElementById('gender')?.value || 'Male',
    height:   document.getElementById('height')?.value || 170,
    weight:   document.getElementById('weight')?.value || 70,
    bodyfat:  document.getElementById('bodyfat')?.value || '',
    goal:     document.querySelector('#goal-chips .chip.selected')?.dataset.val || 'general-fitness',
    experience: document.querySelector('#exp-chips .chip.selected')?.dataset.val || 'beginner',
    daysPerWeek: parseInt(document.getElementById('days-per-week')?.value) || 4,
    sessionDuration: document.getElementById('session-duration')?.value || '60 mins',
    equipment: document.querySelector('#equip-chips .chip.selected')?.dataset.val || 'full-gym',
    medical:   [...document.querySelectorAll('#medical-chips .condition-chip.selected')].map(c => c.dataset.val),
    injuries:  (document.getElementById('injuries')?.value || '').trim(),
    activity:  document.querySelector('#activity-chips .chip.selected')?.dataset.val || 'sedentary',
    style:     document.querySelector('#style-chips .chip.selected')?.dataset.val || 'weights',
    prefTime:  document.getElementById('pref-time')?.value || 'Morning',
    diet:      document.getElementById('diet')?.value || 'No Preference',
    notes:     (document.getElementById('extra-notes')?.value || '').trim(),
    apiKey:    (document.getElementById('api-key')?.value || '').trim(),
  };

  // Persist profile (without API key for security)
  const toSave = { ...userData };
  delete toSave.apiKey;
  try { localStorage.setItem('forgefit_profile', JSON.stringify(toSave)); } catch(_) {}
}

function loadSavedProfile() {
  try {
    const saved = JSON.parse(localStorage.getItem('forgefit_profile') || 'null');
    if (!saved) return;
    if (saved.name && saved.name !== 'Champion') setInput('name', saved.name);
    if (saved.age)    setInput('age', saved.age);
    if (saved.gender) setSelect('gender', saved.gender);
    if (saved.height) setInput('height', saved.height);
    if (saved.weight) setInput('weight', saved.weight);
    if (saved.bodyfat) setInput('bodyfat', saved.bodyfat);
  } catch(_) {}
}

function setInput(id, val) {
  const el = document.getElementById(id);
  if (el) el.value = val;
}
function setSelect(id, val) {
  const el = document.getElementById(id);
  if (el) el.value = val;
}

/* ── GENERATE SCHEDULE ── */
async function generateSchedule() {
  collectUserData();

  const useAi = Boolean(userData.apiKey);
  showView('generating-view');

  // Animate bar
  let prog = 0;
  const bar = document.getElementById('gen-bar');
  const sub = document.getElementById('gen-sub');
  const steps_msg = useAi ? [
    'Analyzing your body metrics…',
    'Mapping your fitness goals…',
    'Checking medical conditions…',
    'Building your week structure…',
    'Selecting exercises…',
    'Finalizing your plan…',
  ] : [
    'Reading your answers…',
    'Matching a local template…',
    'Checking medical conditions…',
    'Building your week structure…',
    'Selecting exercises…',
    'Finalizing your plan…',
  ];
  let msgIdx = 0;
  const ticker = setInterval(() => {
    prog += Math.random() * 10 + 3;
    if (prog > 92) { prog = 92; clearInterval(ticker); }
    if (bar) bar.style.width = prog + '%';
    if (sub && msgIdx < steps_msg.length) sub.textContent = steps_msg[Math.floor(msgIdx++)];
  }, 600);

  try {
    const plan = useAi
      ? await callAnthropicAPI(buildSchedulePrompt(), 1800)
      : await buildOfflinePlan();
    clearInterval(ticker);
    if (bar) bar.style.width = '100%';
    setTimeout(() => {
      renderDashboard(plan);
      if (!useAi) {
        showToast('Offline plan ready — built from your answers (no API key). Add a key for a Claude-written plan.');
      }
    }, 500);
  } catch (err) {
    clearInterval(ticker);
    showView('profile-view');
    resetToStep(3);
    showToast('❌ ' + (err.message || 'Something went wrong. Check your API key and try again.'));
  }
}

function buildOfflinePlan() {
  return new Promise(resolve => setTimeout(() => resolve(buildLocalPlan(userData)), 1400));
}

/* ── ANTHROPIC API CALL ── */
async function callAnthropicAPI(userPrompt, maxTokens = 1000) {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': userData.apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: maxTokens,
      messages: [{ role: 'user', content: userPrompt }],
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err?.error?.message || `API error ${response.status}`);
  }

  const data = await response.json();
  const raw  = data.content?.[0]?.text || '';
  const clean = raw.replace(/```json[\s\S]*?```/g, m => m.slice(7, -3))
                   .replace(/```[\s\S]*?```/g, m => m.slice(3, -3))
                   .trim();

  // Extract first JSON object
  const jsonMatch = clean.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('No JSON in API response');
  return JSON.parse(jsonMatch[0]);
}

/* ── PROMPT BUILDER ── */
function buildSchedulePrompt() {
  const u = userData;
  const hasMedical = u.medical.filter(m => m && m !== 'none').length > 0;

  return `You are an expert personal trainer and sports physiologist. Create a safe, effective, personalized weekly gym schedule.

USER PROFILE:
- Name: ${u.name}, Age: ${u.age}, Gender: ${u.gender}
- Height: ${u.height}cm, Weight: ${u.weight}kg${u.bodyfat ? ', Body Fat: ' + u.bodyfat + '%' : ''}
- Primary Goal: ${u.goal}
- Experience Level: ${u.experience}
- Days available/week: ${u.daysPerWeek}
- Session length: ${u.sessionDuration}
- Equipment: ${u.equipment}
- Medical conditions: ${hasMedical ? u.medical.filter(m => m !== 'none').join(', ') : 'None'}
- Past injuries/surgery: ${u.injuries || 'None'}
- Current activity level: ${u.activity}
- Preferred style: ${u.style}
- Preferred time: ${u.prefTime}
- Diet: ${u.diet}
- Additional notes: ${u.notes || 'None'}

INSTRUCTIONS:
- Distribute EXACTLY ${u.daysPerWeek} workout days across 7 days (Mon–Sun), rest days fill the remainder
- All exercises MUST be safe and appropriate for the listed medical conditions
- Scale intensity to match the experience level (beginner = lighter, more form focus; advanced = heavier, more complex)
- Match exercises to available equipment (${u.equipment})
- Provide practical, achievable milestones for week 1

Return ONLY valid JSON with NO markdown fences, NO explanation text. Use this exact schema:

{
  "weeklyCalories": 2100,
  "intensity": "6/10",
  "phase": "ADAPT",
  "phaseDesc": "Foundation building",
  "aiTip": "A 2-sentence personalized training tip based on this user's specific situation",
  "medicalNotes": ["Safety note relevant to their conditions — omit if no conditions"],
  "milestones": [
    { "text": "Complete your first full week", "done": false },
    { "text": "Hit 3 sessions without skipping", "done": false },
    { "text": "Track your starting lifts/times", "done": false }
  ],
  "days": [
    {
      "day": "MON",
      "type": "strength",
      "typeLabel": "Upper Body Strength",
      "duration": "60 min",
      "exercises": [
        { "name": "Bench Press", "sets": "4 × 8 reps", "badge": "Primary" },
        { "name": "Incline Dumbbell Press", "sets": "3 × 10 reps", "badge": "" }
      ]
    }
  ]
}

Rules:
- "type" must be one of: "strength" | "cardio" | "hiit" | "active" | "rest"
- Rest days have empty exercises array and a "restNote" field
- Include 4–7 exercises per workout day
- "badge" is "Primary", "Compound", "Isolation", "Cardio", "Core", or ""
- weeklyCalories should be realistic for the user's stats and workout volume`;
}

/* ── RENDER DASHBOARD ── */
function renderDashboard(plan) {
  currentPlan = plan;
  const u = userData;

  // Header
  const nameEl = document.getElementById('user-name-display');
  if (nameEl) nameEl.textContent = u.name.split(' ')[0].toUpperCase();

  const subtitleEl = document.getElementById('dash-subtitle');
  if (subtitleEl) subtitleEl.textContent = `Week 1 of your personalized program · ${u.goal.replace(/-/g,' ')} focus`;

  // Stats
  setText('stat-sessions', u.daysPerWeek);
  setText('stat-cals', Number(plan.weeklyCalories || 2000).toLocaleString());
  setText('stat-phase', plan.phase || 'BUILD');
  setText('stat-phase-desc', plan.phaseDesc || '');
  setText('stat-intensity', plan.intensity || '6/10');

  // AI Tip
  const tipEl = document.getElementById('ai-tip');
  if (tipEl) tipEl.innerHTML = `<strong>💡 Personalized Insight</strong>${plan.aiTip || 'Stay consistent — progress compounds over time.'}`;

  // Medical notes
  const medNotes = (plan.medicalNotes || []).filter(Boolean);
  const hasMedical = u.medical.filter(m => m && m !== 'none').length > 0;
  const medCard = document.getElementById('medical-card');
  const medNotesEl = document.getElementById('medical-notes');
  if (medCard && medNotesEl && medNotes.length && hasMedical) {
    medCard.style.display = 'block';
    medNotesEl.innerHTML = medNotes.map(n =>
      `<div class="medical-alert"><div class="medical-icon">⚠️</div><div>${n}</div></div>`
    ).join('');
  }

  // Milestones
  const milestonesEl = document.getElementById('milestones');
  if (milestonesEl) {
    milestonesEl.innerHTML = (plan.milestones || []).map(m =>
      `<div class="milestone ${m.done ? 'milestone-done' : ''}">
        <div class="milestone-icon">${m.done ? '✅' : '⬜'}</div>
        <div class="milestone-text">${m.text}</div>
      </div>`
    ).join('');
  }

  // Schedule
  renderSchedule(plan.days || []);

  // Show dashboard
  document.getElementById('tab-schedule').style.display = '';
  setTimeGreeting();
  showView('schedule-view');
}

function renderSchedule(days) {
  const container = document.getElementById('schedule-days');
  if (!container) return;
  container.innerHTML = '';
  openDayIndex = -1;

  days.forEach((day, i) => {
    const isRest = day.type === 'rest';
    const wrapper = document.createElement('div');

    const exercisePreview = isRest
      ? (day.restNote || 'Rest & recover')
      : (day.exercises || []).map(e => e.name).join(' · ');

    wrapper.innerHTML = `
      <div class="day-row ${isRest ? 'rest-day' : ''}" onclick="${isRest ? '' : `toggleDay(${i})`}">
        <div class="day-label">${day.day}</div>
        <div class="day-type-pill ${day.type}">${day.typeLabel || day.type}</div>
        <div class="day-exercises">${exercisePreview}</div>
        <div class="day-duration">${day.duration || '—'}</div>
        ${!isRest ? '<div class="day-arrow">›</div>' : ''}
      </div>
      ${!isRest ? `
      <div class="exercise-detail" id="detail-${i}">
        <div class="exercise-list">
          ${(day.exercises || []).map(e => `
            <div class="exercise-item">
              <div>
                <div class="exercise-name">${e.name}</div>
                <div class="exercise-sets">${e.sets}</div>
              </div>
              ${e.badge ? `<div class="exercise-badge">${e.badge}</div>` : ''}
            </div>
          `).join('')}
        </div>
      </div>` : ''}
    `;

    container.appendChild(wrapper);
  });
}

function toggleDay(i) {
  const detail = document.getElementById('detail-' + i);
  if (!detail) return;

  if (openDayIndex === i) {
    detail.classList.remove('open');
    openDayIndex = -1;
  } else {
    if (openDayIndex !== -1) {
      document.getElementById('detail-' + openDayIndex)?.classList.remove('open');
    }
    detail.classList.add('open');
    openDayIndex = i;
  }
}

/* ── AI CHAT ── */
async function sendChat() {
  const input = document.getElementById('chat-input');
  const question = (input?.value || '').trim();
  if (!question) return;
  input.value = '';

  if (!userData.apiKey) {
    showAiBubble('⚠️ Please enter your Anthropic API key in the Setup to use the AI chat.');
    return;
  }

  showAiBubble('⏳ Thinking…');

  const u = userData;
  const prompt = `You are a friendly, expert personal trainer AI. Be concise and practical (2–4 sentences max).

User profile: goal=${u.goal}, experience=${u.experience}, equipment=${u.equipment}, medical conditions=${(u.medical || []).join(', ') || 'none'}, age=${u.age}.

User question: ${question}`;

  try {
    const data = await callAnthropicAPI(prompt, 300);
    // If the API returned JSON (shouldn't but just in case), extract text
    const answer = typeof data === 'string' ? data : (data.answer || data.response || JSON.stringify(data));
    showAiBubble(answer);
  } catch (err) {
    showAiBubble('Sorry, I couldn\'t connect right now. Check your API key and try again.');
  }
}

// Override callAnthropicAPI for chat (returns raw text, not JSON)
async function sendChatMessage(prompt) {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': userData.apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 300,
      messages: [{ role: 'user', content: prompt }],
    }),
  });
  if (!response.ok) throw new Error('API error');
  const data = await response.json();
  return data.content?.[0]?.text || '';
}

// Replace sendChat to use raw text version
(function() {
  const origSendChat = window.sendChat;
  window.sendChat = async function() {
    const input = document.getElementById('chat-input');
    const question = (input?.value || '').trim();
    if (!question) return;
    input.value = '';

    if (!userData.apiKey) {
      showAiBubble('⚠️ Please enter your Anthropic API key in the Setup to use the AI chat.');
      return;
    }

    showAiBubble('⏳ Thinking…');

    const u = userData;
    const prompt = `You are a friendly, expert personal trainer AI. Be concise and practical (2–4 sentences max).
User profile: goal=${u.goal}, experience=${u.experience}, equipment=${u.equipment}, medical=${(u.medical||[]).join(',')||'none'}, age=${u.age}.
User asks: ${question}`;

    try {
      const text = await sendChatMessage(prompt);
      showAiBubble(text || 'No response received.');
    } catch (err) {
      showAiBubble('Sorry, couldn\'t connect. Please check your API key.');
    }
  };
})();

/* ── HELPERS ── */
function showAiBubble(text) {
  const bubble  = document.getElementById('ai-bubble');
  const textEl  = document.getElementById('ai-bubble-text');
  if (textEl)  textEl.textContent = text;
  bubble?.classList.add('visible');
}

function closeAiBubble() {
  document.getElementById('ai-bubble')?.classList.remove('visible');
}

function setText(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val;
}

function showToast(msg, duration = 5000) {
  let toast = document.getElementById('global-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'global-toast';
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.classList.add('visible');
  setTimeout(() => toast.classList.remove('visible'), duration);
}

/* ── KEYBOARD SHORTCUT ── */
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeAiBubble();
});
