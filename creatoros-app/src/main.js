// CreatorOS Dashboard
document.querySelectorAll('.nav-item').forEach(item => {
  item.addEventListener('click', () => switchPage(item.dataset.page));
});

function switchPage(pageName) {
  document.querySelectorAll('.nav-item').forEach(item => item.classList.toggle('active', item.dataset.page === pageName));
  document.querySelectorAll('.page').forEach(page => page.classList.toggle('active', page.id === `page-${pageName}`));
}

function setLoading(btnId, loading) {
  const btn = document.getElementById(btnId);
  btn.classList.toggle('loading', loading);
  btn.disabled = loading;
}

function displayOutput(elementId, content, isError = false) {
  const output = document.getElementById(elementId);
  if (isError) {
    output.innerHTML = `<div class="error">${content}</div>`;
  } else {
    output.innerHTML = `<div class="output-content">${content.replace(/\n/g, '<br>')}</div>`;
  }
}

async function generateIdeas() {
  setLoading('generate-ideas-btn', true);
  try {
    const result = await window.__TAURI__.core.invoke('run_idea_generator', { count: parseInt(document.getElementById('idea-count').value) });
    displayOutput('ideas-output', result.success ? result.output : result.error, !result.success);
  } catch (e) { displayOutput('ideas-output', e.toString(), true); }
  setLoading('generate-ideas-btn', false);
}

async function generateScript() {
  const topic = document.getElementById('script-topic').value.trim();
  if (!topic) { displayOutput('script-output', 'Please enter a topic', true); return; }
  setLoading('generate-script-btn', true);
  try {
    const result = await window.__TAURI__.core.invoke('run_script_generator', {
      topic, style: document.getElementById('script-style').value, duration: document.getElementById('script-duration').value
    });
    displayOutput('script-output', result.success ? result.output : result.error, !result.success);
  } catch (e) { displayOutput('script-output', e.toString(), true); }
  setLoading('generate-script-btn', false);
}

async function generateViralContent() {
  const topic = document.getElementById('viral-topic').value.trim();
  if (!topic) { displayOutput('viral-output', 'Please enter a topic', true); return; }
  setLoading('generate-viral-btn', true);
  try {
    const result = await window.__TAURI__.core.invoke('run_viral_content', { topic });
    displayOutput('viral-output', result.success ? result.output : result.error, !result.success);
  } catch (e) { displayOutput('viral-output', e.toString(), true); }
  setLoading('generate-viral-btn', false);
}

async function fetchAnalytics() {
  setLoading('fetch-analytics-btn', true);
  try {
    const result = await window.__TAURI__.core.invoke('run_youtube_analytics', { channel: 'Anshuman Parmar' });
    displayOutput('analytics-output', result.success ? result.output : result.error, !result.success);
  } catch (e) { displayOutput('analytics-output', e.toString(), true); }
  setLoading('fetch-analytics-btn', false);
}

async function generateCalendar() {
  setLoading('generate-calendar-btn', true);
  try {
    const result = await window.__TAURI__.core.invoke('run_content_calendar', {});
    displayOutput('calendar-output', result.success ? result.output : result.error, !result.success);
  } catch (e) { displayOutput('calendar-output', e.toString(), true); }
  setLoading('generate-calendar-btn', false);
}

console.log('CreatorOS loaded');
