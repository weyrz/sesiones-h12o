const storageKey = 'h12o-agenda-editor-v1';
const initialData = { sessions, seminarios };
let drafts = structuredClone(initialData);
let storageWarning = '';
try {
  const saved = JSON.parse(localStorage.getItem(storageKey));
  if (saved && Array.isArray(saved.sessions) && Array.isArray(saved.seminarios)) drafts = saved;
} catch { storageWarning = 'No se pudo cargar el borrador guardado.'; }
const selector = document.querySelector('#dataset');
const dialog = document.querySelector('#entryDialog');
const form = document.querySelector('#entryForm');
let editIndex = null;
const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, character => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[character]));
function save() {
  try {
    localStorage.setItem(storageKey, JSON.stringify(drafts));
    document.querySelector('#saveStatus').textContent = 'Borrador guardado en este navegador. Pendiente de publicar en GitHub.';
  } catch { document.querySelector('#saveStatus').textContent = 'No se pudo guardar en el navegador. Descarga los datos antes de cerrar esta página.'; }
}
function renderEntries() {
  const dataset = selector.value;
  document.querySelector('#destination').textContent = `Archivo que debes sustituir en GitHub: ${dataset === 'sessions' ? 'data.js' : 'seminarios/data.js'}`;
  const rows = drafts[dataset].map((entry, index) => ({entry,index})).sort((a,b) => a.entry.date.localeCompare(b.entry.date));
  document.querySelector('#entries').innerHTML = rows.length ? rows.map(({entry,index}) => `<article class="editor-entry ${entry.hidden ? 'hidden-entry' : ''}"><div class="entry-description"><strong>${escapeHtml(entry.date)} · ${escapeHtml(entry.title)}${entry.hidden ? ' (Oculta)' : ''}</strong><small>${escapeHtml(entry.owner)} · ${escapeHtml(entry.reviewer)} · ${escapeHtml(entry.area)}</small></div><button class="button button-ghost" data-edit="${index}">Editar</button><button class="button button-ghost" data-delete="${index}">Eliminar</button></article>`).join('') : '<p>No hay entradas. Pulsa «Añadir entrada» para empezar.</p>';
}
function openForm(index = null) {
  editIndex = index;
  form.reset();
  document.querySelector('#formTitle').textContent = index === null ? 'Añadir entrada' : 'Editar entrada';
  if (index !== null) {
    const entry = drafts[selector.value][index];
    ['date','title','area','owner','reviewer','format'].forEach(field => { form.elements[field].value = entry[field] ?? ''; });
    form.elements.hidden.checked = entry.hidden === true;
  }
  dialog.showModal();
}
selector.addEventListener('change', renderEntries);
document.querySelector('#add').addEventListener('click', () => openForm());
document.querySelector('#cancel').addEventListener('click', () => dialog.close());
document.querySelector('#entries').addEventListener('click', event => {
  const edit = event.target.closest('[data-edit]');
  const remove = event.target.closest('[data-delete]');
  if (edit) openForm(Number(edit.dataset.edit));
  if (remove && confirm('¿Eliminar esta entrada del borrador local?')) {
    drafts[selector.value].splice(Number(remove.dataset.delete), 1);
    save(); renderEntries();
  }
});
form.addEventListener('submit', event => {
  event.preventDefault();
  const entry = editIndex === null ? {} : {...drafts[selector.value][editIndex]};
  ['date','title','area','owner','reviewer','format'].forEach(field => { entry[field] = form.elements[field].value.trim(); });
  entry.hidden = form.elements.hidden.checked;
  if (!entry.title || !entry.area) return;
  if (editIndex === null) drafts[selector.value].push(entry);
  else drafts[selector.value][editIndex] = entry;
  save(); renderEntries(); dialog.close();
});
document.querySelector('#download').addEventListener('click', () => {
  const dataset = selector.value;
  const content = `// Agenda exportada desde el editor H12O.\nconst ${dataset} = ${JSON.stringify(drafts[dataset], null, 2)};\n`;
  const url = URL.createObjectURL(new Blob([content], {type:'text/javascript;charset=utf-8'}));
  const anchor = document.createElement('a');
  anchor.href = url; anchor.download = 'data.js'; anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
});
document.querySelector('#saveStatus').textContent = storageWarning || 'Borrador local. La agenda pública cambia cuando publicas el archivo en GitHub.';
renderEntries();
