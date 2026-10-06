const state = { semesterKey:'all', view:'list', mode:'sessions' };
const $ = (selector) => document.querySelector(selector);
const monthName = new Intl.DateTimeFormat('es-ES', { month:'long', year:'numeric' });
const longDate = new Intl.DateTimeFormat('es-ES', { weekday:'long', day:'numeric', month:'long' });
const shortDate = new Intl.DateTimeFormat('es-ES', { day:'numeric', month:'short' });
const semesterFor = date => `${date.slice(0,4)}-${Number(date.slice(5,7)) <= 6 ? 1 : 2}`;
const semesterLabel = key => { const [year, semester] = key.split('-'); return `Semestre ${semester}º de ${year}`; };
function currentSemester() {
  const parts = new Intl.DateTimeFormat('en', { timeZone:'Europe/Madrid', year:'numeric', month:'2-digit' }).formatToParts(new Date());
  const year = parts.find(part => part.type === 'year').value;
  const month = Number(parts.find(part => part.type === 'month').value);
  return `${year}-${month <= 6 ? 1 : 2}`;
}
const activeData = () => (state.mode === 'seminarios' ? seminarios : sessions).filter(item => item.hidden !== true);

function currentSessions() {
  const search = $('#searchInput').value.trim().toLowerCase();
  const format = $('#formatFilter').value;
  const area = $('#areaFilter').value;
  const semesterKey = state.semesterKey;
  return activeData().filter(item => {
    const matchesSearch = !search || `${item.title} ${item.owner} ${item.area}`.toLowerCase().includes(search);
    return (semesterKey === 'all' || semesterFor(item.date) === semesterKey) && matchesSearch && (format === 'all' || statusFor(item) === format) && (area === 'all' || item.area === area);
  }).sort((a,b) => a.date.localeCompare(b.date));
}

function statusFor(item) {
  if (item.format !== 'Programada') return item.format;
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const date = new Date(`${item.date}T00:00:00`);
  return date <= today ? 'Realizada' : 'Programada';
}

function badgeClass(format) { return `badge badge-${format.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'')}`; }
function renderList(items) {
  const months = items.reduce((acc,item) => { const key = item.date.slice(0,7); (acc[key] ||= []).push(item); return acc; }, {});
  return Object.entries(months).map(([month, monthItems]) => {
    const groups = monthItems.reduce((acc,item) => ((acc[item.date] ||= []).push(item), acc), {});
    const monthLabel = monthName.format(new Date(`${month}-01T12:00:00`)).replace(/^./, c => c.toUpperCase());
    const days = Object.entries(groups).map(([date, dayItems]) => {
      const day = new Date(`${date}T12:00:00`);
      const dayLabel = longDate.format(day).replace(',', '').replace(/^./, c => c.toUpperCase()).split(' de ')[0];
      return `<div class="day-group">${dayItems.map((item, index) => `<article class="session-row"><div class="session-day">${index === 0 ? dayLabel : ''}</div><div><div class="session-title">${item.title}</div><div class="session-meta">${item.owner ? `<span class="owner">${item.owner}</span>` : ''}${item.reviewer ? `<span class="reviewer">Revisa: ${item.reviewer}</span>` : ''}<span class="area">${item.area}</span></div></div><span class="${badgeClass(statusFor(item))}">${statusFor(item)}</span></article>`).join('')}</div>`;
    }).join('');
    return `<section class="month-block"><h3>${monthLabel}</h3>${days}</section>`;
  }).join('');
}

function renderCalendar(items) {
  const months = items.reduce((acc,item) => { const key = item.date.slice(0,7); (acc[key] ||= []).push(item); return acc; }, {});
  return Object.entries(months).map(([month, monthItems]) => renderSingleCalendar(month, monthItems)).join('');
}

function renderSingleCalendar(monthKey, items) {
  const [year, month] = monthKey.split('-').map(Number);
  const first = new Date(year, month - 1, 1); const start = (first.getDay() + 6) % 7; const days = new Date(year, month, 0).getDate();
  const byDate = items.reduce((acc,item) => ((acc[item.date] ||= []).push(item), acc), {});
  let cells = ['Lun','Mar','Mié','Jue','Vie','Sáb','Dom'].map(day => `<div class="calendar-head">${day}</div>`).join('');
  for (let i=0; i<start; i++) cells += '<div class="calendar-cell"></div>';
  for (let day=1; day<=days; day++) {
    const key = `${year}-${String(month).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
    cells += `<div class="calendar-cell"><span class="calendar-date">${day}</span>${(byDate[key] || []).map(item => `<div class="calendar-event"><strong>${item.title}</strong>${item.owner ? `<span>Ponente: ${item.owner}</span>` : ''}${item.reviewer ? `<span>Revisa: ${item.reviewer}</span>` : ''}<span>Área: ${item.area}</span><em>${statusFor(item)}</em></div>`).join('')}</div>`;
  }
  const label = monthName.format(first).replace(/^./, c => c.toUpperCase());
  return `<section class="calendar-month"><h3>${label}</h3><div class="calendar">${cells}</div></section>`;
}

function render() {
  const items = currentSessions();
  $('#monthTitle').textContent = state.semesterKey === 'all' ? 'Toda la agenda' : semesterLabel(state.semesterKey);
  $('#agendaView').innerHTML = state.view === 'list' ? renderList(items) : renderCalendar(items);
  $('#emptyState').hidden = items.length > 0;
  $('#agendaView').hidden = items.length === 0;
  $('#monthCount').textContent = items.length;
  const next = activeData().map(item => ({...item, d:new Date(`${item.date}T12:00:00`)})).filter(item => item.d >= new Date()).sort((a,b) => a.d-b.d)[0];
  $('#nextDate').textContent = next ? shortDate.format(next.d) : '—'; $('#nextTitle').textContent = next ? next.title : 'Sin próximas sesiones';
}

function fillFilters() { [...new Set(activeData().map(statusFor))].forEach(v => $('#formatFilter').insertAdjacentHTML('beforeend', `<option>${v}</option>`)); [...new Set(activeData().map(s => s.area))].forEach(v => $('#areaFilter').insertAdjacentHTML('beforeend', `<option>${v}</option>`)); }
function fillSemesters() { [...new Set([currentSemester(), ...activeData().map(s => semesterFor(s.date))])].sort().forEach(key => { $('#monthFilter').insertAdjacentHTML('beforeend', `<option value="${key}">${semesterLabel(key)}</option>`); }); }
function resetDatasetControls() { $('#formatFilter').innerHTML = '<option value="all">Todos</option>'; $('#areaFilter').innerHTML = '<option value="all">Todas</option>'; $('#monthFilter').innerHTML = '<option value="all">Toda la agenda</option>'; state.semesterKey = currentSemester(); fillFilters(); fillSemesters(); $('#monthFilter').value = state.semesterKey; }
document.querySelectorAll('.view-button').forEach(button => button.addEventListener('click', () => { document.querySelectorAll('.view-button').forEach(b => b.classList.remove('active')); button.classList.add('active'); state.view = button.dataset.view; render(); }));
document.querySelectorAll('.mode-button').forEach(button => button.addEventListener('click', () => { document.querySelectorAll('.mode-button').forEach(b => b.classList.toggle('active', b === button)); state.mode = button.dataset.mode; $('#pageTitle').textContent = state.mode === 'seminarios' ? 'Seminarios' : 'Sesiones del servicio'; resetDatasetControls(); render(); }));
['searchInput','formatFilter','areaFilter'].forEach(id => $(`#${id}`).addEventListener('input', render));
$('#monthFilter').addEventListener('change', event => { state.semesterKey = event.target.value; render(); });
$('#todayButton').addEventListener('click', () => { document.querySelector('#agenda').scrollIntoView({ behavior:'smooth' }); });
$('#printButton').addEventListener('click', () => {
  state.view = 'list';
  document.querySelectorAll('.view-button').forEach(button => button.classList.toggle('active', button.dataset.view === 'list'));
  render();
  window.print();
});
$('#themeToggle').addEventListener('click', () => { document.body.classList.toggle('dark'); });
$('#updatedAt').textContent = new Intl.DateTimeFormat('es-ES', { day:'numeric', month:'long', year:'numeric' }).format(new Date());
resetDatasetControls(); render();
