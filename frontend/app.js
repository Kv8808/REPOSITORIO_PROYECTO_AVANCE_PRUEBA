// frontend/app.js
// exige token; si no existe, redirige a login
const token = localStorage.getItem('token');
if (!token) {
  location.href = '/login.html';
}

const headers = () => ({ 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token });

const listArea = document.getElementById('listArea');
const btnCreate = document.getElementById('btnCreate');
const btnEdit = document.getElementById('btnEdit');
const btnDelete = document.getElementById('btnDelete');
const btnCancel = document.getElementById('btnCancel');
const btnRefresh = document.getElementById('btnRefresh');
const searchInput = document.getElementById('searchInput');

let patients = [];
let selectedId = null;

document.getElementById('logout').onclick = () => { localStorage.clear(); location.href = '/login.html'; };
document.getElementById('menuSalir').onclick = () => { localStorage.clear(); location.href = '/login.html'; };
document.getElementById('menuPacientes').onclick = () => { /* opcional salto */ window.scrollTo({top:0, behavior:'smooth'}); };

btnCreate.onclick = () => openModal();
btnEdit.onclick = () => {
  if (!selectedId) return alert('Selecciona un paciente.');
  const p = patients.find(x => x._id === selectedId);
  openModal(p);
};
btnDelete.onclick = async () => {
  if (!selectedId) return alert('Selecciona un paciente.');
  if (!confirm('Eliminar paciente?')) return;
  try {
    const res = await fetch('/api/patients/' + selectedId, { method: 'DELETE', headers: headers() });
    if (!res.ok) {
      const r = await res.json().catch(()=>({ error: 'error' }));
      return alert('Error: ' + (r.msg || r.error || JSON.stringify(r)));
    }
    selectedId = null; btnEdit.disabled = true; btnDelete.disabled = true;
    await fetchPatients();
  } catch (err) {
    alert('Error: ' + err.message);
  }
};
btnCancel.onclick = () => { selectedId = null; btnEdit.disabled = true; btnDelete.disabled = true; clearSelection(); };
btnRefresh.onclick = () => fetchPatients();
searchInput.oninput = () => renderTable(filteredPatients());

function filteredPatients() {
  const q = (searchInput.value || '').toLowerCase().trim();
  if (!q) return patients;
  return patients.filter(p => (p.nombrePaciente || '').toLowerCase().includes(q));
}

async function fetchPatients() {
  listArea.innerHTML = '<div class="loading">Cargando formularios...</div>';
  try {
    const res = await fetch('/api/patients', { headers: headers() });
    if (res.status === 401) { localStorage.clear(); location.href = '/login.html'; return; }
    const data = await res.json();
    if (!Array.isArray(data)) {
      listArea.innerHTML = '<div class="loading">Error al obtener la lista.</div>';
      console.error('list patients error', data);
      return;
    }
    patients = data;
    renderTable(patients);
  } catch (err) {
    listArea.innerHTML = '<div class="loading">Error de conexión: ' + err.message + '</div>';
  }
}

function renderTable(list) {
  if (!list || list.length === 0) {
    listArea.innerHTML = '<div class="loading">No hay formularios</div>';
    return;
  }

  const table = document.createElement('table');
  table.className = 'table';
  const thead = document.createElement('thead');
  thead.innerHTML = `<tr>
    <th style="width:40px"></th>
    <th>Nombre</th>
    <th>Ingreso</th>
    <th>Edad</th>
    <th>Diagnóstico</th>
    <th>Teléfono</th>
    <th style="width:150px">Acciones</th>
  </tr>`;
  table.appendChild(thead);

  const tbody = document.createElement('tbody');
  list.forEach(p => {
    const tr = document.createElement('tr');
    tr.className = 'row';
    if (p._id === selectedId) tr.classList.add('selected');

    const radioTd = document.createElement('td');
    const radio = document.createElement('input');
    radio.type = 'radio';
    radio.name = 'selectedPatient';
    radio.checked = (p._id === selectedId);
    radio.onclick = () => selectRow(p._id, tr);
    radioTd.appendChild(radio);

    tr.appendChild(radioTd);
    tr.insertAdjacentHTML('beforeend', `<td>${escapeHtml(p.nombrePaciente || '-')}</td>`);
    tr.insertAdjacentHTML('beforeend', `<td>${p.fechaIngreso ? new Date(p.fechaIngreso).toLocaleDateString() : '-'}</td>`);
    tr.insertAdjacentHTML('beforeend', `<td>${p.edad || '-'}</td>`);
    tr.insertAdjacentHTML('beforeend', `<td>${escapeHtml(p.diagnostico || '-')}</td>`);
    tr.insertAdjacentHTML('beforeend', `<td>${escapeHtml(p.telefono || '-')}</td>`);

    const actionsTd = document.createElement('td');
    actionsTd.className = 'actions';
    const viewBtn = document.createElement('button');
    viewBtn.textContent = 'Ver';
    viewBtn.onclick = () => viewPatient(p);
    const editBtn = document.createElement('button');
    editBtn.textContent = 'Editar';
    editBtn.className = 'edit';
    editBtn.onclick = () => openModal(p);
    const delBtn = document.createElement('button');
    delBtn.textContent = 'Eliminar';
    delBtn.className = 'delete';
    delBtn.onclick = async () => {
      if (!confirm('Eliminar paciente?')) return;
      const res = await fetch('/api/patients/' + p._id, { method: 'DELETE', headers: headers() });
      if (!res.ok) {
        const r = await res.json().catch(()=>({ error: 'error' }));
        return alert('Error: ' + (r.msg || r.error || JSON.stringify(r)));
      }
      if (selectedId === p._id) { selectedId = null; btnEdit.disabled = true; btnDelete.disabled = true; }
      fetchPatients();
    };

    actionsTd.appendChild(viewBtn);
    actionsTd.appendChild(editBtn);
    actionsTd.appendChild(delBtn);
    tr.appendChild(actionsTd);

    // click row selects
    tr.onclick = (e) => { if (e.target.tagName !== 'BUTTON' && e.target.tagName !== 'INPUT') selectRow(p._id, tr); };

    tbody.appendChild(tr);
  });

  table.appendChild(tbody);
  listArea.innerHTML = '';
  listArea.appendChild(table);
}

function selectRow(id, trEl) {
  selectedId = id;
  btnEdit.disabled = false;
  btnDelete.disabled = false;
  // clear previous
  document.querySelectorAll('.row.selected').forEach(r => r.classList.remove('selected'));
  trEl.classList.add('selected');
}

function clearSelection() {
  document.querySelectorAll('.row.selected').forEach(r => r.classList.remove('selected'));
  document.querySelectorAll('input[name="selectedPatient"]').forEach(i => i.checked = false);
}

/* Modal logic */
const modal = document.getElementById('modal');
const closeModalBtn = document.getElementById('closeModal');
const patientForm = document.getElementById('patientForm');
const modalTitle = document.getElementById('modalTitle');
let editId = null;

function openModal(p) {
  editId = p && p._id ? p._id : null;
  modalTitle.textContent = editId ? 'Editar formulario' : 'Crear formulario';
  // populate fields
  document.getElementById('nombrePaciente').value = p?.nombrePaciente || '';
  document.getElementById('fechaIngreso').value = p?.fechaIngreso ? p.fechaIngreso.split('T')[0] : '';
  document.getElementById('edad').value = p?.edad || '';
  document.getElementById('sexo').value = p?.sexo || '';
  document.getElementById('estadoCivil').value = p?.estadoCivil || '';
  document.getElementById('numeroHijos').value = p?.numeroHijos || '';
  document.getElementById('ocupacion').value = p?.ocupacion || '';
  document.getElementById('calleYNúmero').value = p?.calleYNúmero || '';
  document.getElementById('codigoPostal').value = p?.codigoPostal || '';
  document.getElementById('localidad').value = p?.localidad || '';
  document.getElementById('municipio').value = p?.municipio || '';
  document.getElementById('estado').value = p?.estado || '';
  document.getElementById('diagnostico').value = p?.diagnostico || '';
  document.getElementById('tratamiento').value = p?.tratamiento || '';
  document.getElementById('duracionDias').value = p?.duracionDias || '';
  document.getElementById('hospital').value = p?.hospital || '';
  document.getElementById('telefono').value = p?.telefono || '';
  document.getElementById('observaciones').value = p?.observaciones || '';

  modal.classList.remove('hidden');
}
closeModalBtn.onclick = () => { modal.classList.add('hidden'); };

patientForm.onsubmit = async (e) => {
  e.preventDefault();
  const payload = {
    nombrePaciente: document.getElementById('nombrePaciente').value.trim(),
    fechaIngreso: document.getElementById('fechaIngreso').value || null,
    edad: Number(document.getElementById('edad').value || 0),
    sexo: document.getElementById('sexo').value.trim(),
    estadoCivil: document.getElementById('estadoCivil').value.trim(),
    numeroHijos: Number(document.getElementById('numeroHijos').value || 0),
    ocupacion: document.getElementById('ocupacion').value.trim(),
    calleYNúmero: document.getElementById('calleYNúmero').value.trim(),
    codigoPostal: document.getElementById('codigoPostal').value.trim(),
    localidad: document.getElementById('localidad').value.trim(),
    municipio: document.getElementById('municipio').value.trim(),
    estado: document.getElementById('estado').value.trim(),
    diagnostico: document.getElementById('diagnostico').value.trim(),
    tratamiento: document.getElementById('tratamiento').value.trim(),
    duracionDias: Number(document.getElementById('duracionDias').value || 0),
    hospital: document.getElementById('hospital').value.trim(),
    telefono: document.getElementById('telefono').value.trim(),
    observaciones: document.getElementById('observaciones').value.trim()
  };

  try {
    let res;
    if (editId) {
      res = await fetch('/api/patients/' + editId, { method: 'PUT', headers: headers(), body: JSON.stringify(payload) });
    } else {
      res = await fetch('/api/patients', { method: 'POST', headers: headers(), body: JSON.stringify(payload) });
    }
    const rj = await res.json();
    if (!res.ok) {
      alert(rj.msg || rj.error || JSON.stringify(rj));
      return;
    }
    modal.classList.add('hidden');
    editId = null;
    await fetchPatients();
  } catch (err) {
    alert('Error: ' + err.message);
  }
};

function viewPatient(p) {
  // vista rápida (puedes expandir modal con detalles)
  const lines = [
    `Nombre: ${p.nombrePaciente || '-'}`,
    `Ingreso: ${p.fechaIngreso ? new Date(p.fechaIngreso).toLocaleDateString() : '-'}`,
    `Edad: ${p.edad || '-'}`,
    `Diagnóstico: ${p.diagnostico || '-'}`,
    `Teléfono: ${p.telefono || '-'}`
  ];
  alert(lines.join('\n'));
}

/* pequeña función para evitar XSS en render */
function escapeHtml(s) {
  if (!s) return '';
  return s.replace(/[&<>"']/g, (m) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
}

/* init */
fetchPatients();

