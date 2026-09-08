document.addEventListener("DOMContentLoaded", () => {
  const STORAGE_KEY = "vincularte-prototype-v1";

  const seed = {
    houses: [
      { id: 1, name: "Casa Centro", street: "San Martín", number: "1248", status: "Activa" },
      { id: 2, name: "Casa Norte", street: "Aristóbulo del Valle", number: "5630", status: "Activa" },
      { id: 3, name: "Casa Sur", street: "Uruguay", number: "2217", status: "Inactiva" }
    ],
    users: [
      {
        id: 1, firstName: "Julia", lastName: "Benítez", dni: "30222111",
        username: "30222111", email: "julia@vincularte.org",
        assignments: [{ houseId: 1, role: "Administrador" }, { houseId: 2, role: "Administrador" }]
      },
      {
        id: 2, firstName: "Marcos", lastName: "Suárez", dni: "33456789",
        username: "33456789", email: "marcos@vincularte.org",
        assignments: [{ houseId: 1, role: "Profesional" }]
      }
    ],
    assisted: [
      { id: 1, firstName: "Alex", lastName: "Medina", dni: "44555111", state: "Activa", observations: "", houseId: 1, checkIn: "2026-08-12", checkOut: "" },
      { id: 2, firstName: "Lucía", lastName: "R.", dni: "44888999", state: "En seguimiento", observations: "", houseId: 1, checkIn: "2026-09-01", checkOut: "" },
      { id: 3, firstName: "Sofía", lastName: "N.", dni: "43999111", state: "Activa", observations: "", houseId: 2, checkIn: "2026-08-28", checkOut: "" }
    ],
    professionals: [
      { id: 1, firstName: "Marcos", lastName: "Suárez", dni: "33456789", license: "MP 4821", specialty: "Trabajo Social", email: "marcos@vincularte.org", houseIds: [1, 2] },
      { id: 2, firstName: "Carla", lastName: "Méndez", dni: "31987654", license: "MP 7350", specialty: "Psicología", email: "carla@vincularte.org", houseIds: [1] }
    ],
    activity: [
      { id: 1, at: "07/09/2026 10:14", user: "Ian Gómez", action: "Actualización", detail: "Modificó datos de Casa Centro" },
      { id: 2, at: "07/09/2026 09:41", user: "Julia Benítez", action: "Parte diario", detail: "Creó el parte de Casa Centro" },
      { id: 3, at: "06/09/2026 16:22", user: "Ian Gómez", action: "Alta de usuario", detail: "Creó el usuario 33456789" },
      { id: 4, at: "06/09/2026 15:02", user: "Ian Gómez", action: "Alta de casa", detail: "Creó Casa Sur" }
    ]
  };

  let state = loadState();
  let currentHouseId = null;

  const titles = {
    dashboard: "Resumen",
    houses: "Casas",
    users: "Usuarios",
    assisted: "Personas asistidas",
    professionals: "Profesionales",
    daily: "Parte diario",
    roles: "Roles y permisos",
    audit: "Auditoría",
    manual: "Manual de usuario",
    "house-detail": "Gestión de casa"
  };

  function cloneSeed() {
    return JSON.parse(JSON.stringify(seed));
  }

  function loadState() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : cloneSeed();
    } catch {
      return cloneSeed();
    }
  }

  function saveState() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  function nextId(items) {
    return items.length ? Math.max(...items.map(i => i.id)) + 1 : 1;
  }

  function houseById(id) {
    return state.houses.find(h => h.id === Number(id));
  }

  function escapeHtml(value = "") {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function toast(message) {
    const el = document.querySelector("#toast");
    el.textContent = message;
    el.classList.add("is-visible");
    clearTimeout(toast.timer);
    toast.timer = setTimeout(() => el.classList.remove("is-visible"), 2600);
  }

  function logActivity(action, detail) {
    state.activity.unshift({
      id: nextId(state.activity),
      at: new Date().toLocaleString("es-AR", { dateStyle: "short", timeStyle: "short" }),
      user: "Ian Gómez",
      action,
      detail
    });
    state.activity = state.activity.slice(0, 50);
  }

  function showView(name) {
    document.querySelectorAll(".view").forEach(v => v.classList.toggle("is-active", v.dataset.view === name));
    document.querySelectorAll(".nav-item").forEach(btn => btn.classList.toggle("is-active", btn.dataset.viewLink === name));
    document.querySelector("#pageTitle").textContent = titles[name] || "VinculArte";
    document.querySelector("#sidebar").classList.remove("is-open");
    window.scrollTo({ top: 0, behavior: "smooth" });

    if (name === "house-detail") renderHouseDetail();
    if (name === "audit") renderAudit();
  }

  function renderAll() {
    renderMetrics();
    renderDashboard();
    renderHouses();
    renderUsers();
    renderAssisted();
    renderProfessionals();
    renderAudit();
    refreshHouseSelects();
  }

  function renderMetrics() {
    document.querySelector("#metricHouses").textContent = state.houses.filter(h => h.status === "Activa").length;
    document.querySelector("#metricUsers").textContent = state.users.length;
    document.querySelector("#metricAssisted").textContent = state.assisted.length;
    document.querySelector("#metricProfessionals").textContent = state.professionals.length;
  }

  function renderDashboard() {
    const houseTarget = document.querySelector("#dashboardHouses");
    const activeHouses = state.houses.slice(0, 4);

    houseTarget.innerHTML = activeHouses.map(h => {
      const people = state.assisted.filter(p => p.houseId === h.id).length;
      const pros = state.professionals.filter(p => p.houseIds.includes(h.id)).length;
      return `
        <div class="mini-house-row">
          <div class="mini-house-mark">◇</div>
          <div>
            <strong>${escapeHtml(h.name)}</strong>
            <small>${people} personas · ${pros} profesionales</small>
          </div>
          <span class="status-pill ${h.status === "Activa" ? "" : "status-pill--inactive"}">${escapeHtml(h.status)}</span>
        </div>
      `;
    }).join("") || `<div class="empty-state"><strong>Sin casas</strong>Creá la primera unidad.</div>`;

    const actTarget = document.querySelector("#dashboardActivity");
    actTarget.innerHTML = state.activity.slice(0, 5).map(a => `
      <div class="activity-row">
        <span class="activity-dot"></span>
        <div>
          <strong>${escapeHtml(a.action)}</strong>
          <small>${escapeHtml(a.detail)}</small>
        </div>
        <time>${escapeHtml(a.at)}</time>
      </div>
    `).join("");
  }

  function renderHouses() {
    const q = document.querySelector("#houseSearch")?.value.toLowerCase().trim() || "";
    const rows = state.houses.filter(h => `${h.name} ${h.street} ${h.number}`.toLowerCase().includes(q));
    document.querySelector("#houseCountLabel").textContent = `${rows.length} casa${rows.length === 1 ? "" : "s"}`;

    document.querySelector("#housesTable").innerHTML = rows.map(h => {
      const people = state.assisted.filter(p => p.houseId === h.id).length;
      const pros = state.professionals.filter(p => p.houseIds.includes(h.id)).length;
      return `
        <tr>
          <td><span class="cell-title">${escapeHtml(h.name)}</span><span class="cell-sub">ID CASA #${h.id}</span></td>
          <td>${escapeHtml(h.street)} ${escapeHtml(h.number)}</td>
          <td>${people}</td>
          <td>${pros}</td>
          <td><span class="status-pill ${h.status === "Activa" ? "" : "status-pill--inactive"}">${escapeHtml(h.status)}</span></td>
          <td><button class="table-action" data-open-house="${h.id}">Abrir casa →</button></td>
        </tr>
      `;
    }).join("") || `<tr><td colspan="6"><div class="empty-state"><strong>No hay resultados</strong>Probá con otra búsqueda.</div></td></tr>`;

    document.querySelectorAll("[data-open-house]").forEach(btn => {
      btn.addEventListener("click", () => {
        currentHouseId = Number(btn.dataset.openHouse);
        showView("house-detail");
      });
    });
  }

  function renderUsers() {
    const q = document.querySelector("#userSearch")?.value.toLowerCase().trim() || "";
    const rows = state.users.filter(u => `${u.firstName} ${u.lastName} ${u.dni} ${u.username}`.toLowerCase().includes(q));
    document.querySelector("#userCountLabel").textContent = `${rows.length} usuario${rows.length === 1 ? "" : "s"}`;

    document.querySelector("#usersTable").innerHTML = rows.map(u => {
      const chips = u.assignments.map(a => {
        const h = houseById(a.houseId);
        return `<span class="assignment-chip">${escapeHtml(h?.name || "Casa")} · ${escapeHtml(a.role)}</span>`;
      }).join("");
      return `
        <tr>
          <td><span class="cell-title">${escapeHtml(u.firstName)} ${escapeHtml(u.lastName)}</span><span class="cell-sub">DNI ${escapeHtml(u.dni)}</span></td>
          <td><span class="cell-title">${escapeHtml(u.username)}</span><span class="cell-sub">Basado en DNI</span></td>
          <td>${chips || '<span class="cell-sub">Sin asignaciones</span>'}</td>
          <td>${escapeHtml(u.email || "—")}</td>
          <td><button class="table-action" type="button">Ver detalle</button></td>
        </tr>
      `;
    }).join("");
  }

  function renderAssisted() {
    const target = document.querySelector("#assistedGrid");
    target.innerHTML = state.assisted.map(p => {
      const h = houseById(p.houseId);
      return `
        <article class="people-card">
          <div class="person-head">
            <div class="person-avatar">${escapeHtml((p.firstName[0] || "") + (p.lastName[0] || ""))}</div>
            <div><strong>${escapeHtml(p.firstName)} ${escapeHtml(p.lastName)}</strong><small>DNI ${escapeHtml(p.dni)}</small></div>
          </div>
          <div class="person-meta">
            <div><span>Estado</span><strong>${escapeHtml(p.state)}</strong></div>
            <div><span>Casa</span><strong>${escapeHtml(h?.name || "—")}</strong></div>
            <div><span>Ingreso</span><strong>${formatDate(p.checkIn)}</strong></div>
            <div><span>Egreso</span><strong>${p.checkOut ? formatDate(p.checkOut) : "Pendiente"}</strong></div>
          </div>
        </article>
      `;
    }).join("") || `<div class="empty-state"><strong>Sin personas asistidas</strong>Usá “Nueva persona asistida” para crear la primera.</div>`;
  }

  function renderProfessionals() {
    const target = document.querySelector("#professionalsGrid");
    target.innerHTML = state.professionals.map(p => {
      const houseNames = p.houseIds.map(id => houseById(id)?.name).filter(Boolean).join(", ");
      return `
        <article class="people-card">
          <div class="person-head">
            <div class="person-avatar">${escapeHtml((p.firstName[0] || "") + (p.lastName[0] || ""))}</div>
            <div><strong>${escapeHtml(p.firstName)} ${escapeHtml(p.lastName)}</strong><small>${escapeHtml(p.specialty)}</small></div>
          </div>
          <div class="person-meta">
            <div><span>Matrícula</span><strong>${escapeHtml(p.license || "—")}</strong></div>
            <div><span>Casas</span><strong>${escapeHtml(houseNames || "—")}</strong></div>
            <div><span>Email</span><strong>${escapeHtml(p.email || "—")}</strong></div>
          </div>
        </article>
      `;
    }).join("");
  }

  function renderAudit() {
    document.querySelector("#auditTable").innerHTML = state.activity.map(a => `
      <tr>
        <td>${escapeHtml(a.at)}</td>
        <td><span class="cell-title">${escapeHtml(a.user)}</span></td>
        <td>${escapeHtml(a.action)}</td>
        <td>${escapeHtml(a.detail)}</td>
      </tr>
    `).join("");
  }

  function renderHouseDetail() {
    const h = houseById(currentHouseId);
    if (!h) return;

    document.querySelector("#houseDetailName").textContent = h.name;
    document.querySelector("#houseDetailAddress").textContent = `${h.street} ${h.number}`;
    document.querySelector("#houseDetailStatus").textContent = h.status;
    document.querySelector("#houseDetailStatus").className = `status-pill ${h.status === "Activa" ? "" : "status-pill--inactive"}`;

    const people = state.assisted.filter(p => p.houseId === h.id);
    const pros = state.professionals.filter(p => p.houseIds.includes(h.id));
    const users = state.users.filter(u => u.assignments.some(a => a.houseId === h.id));

    document.querySelector("#houseDetailAssisted").textContent = people.length;
    document.querySelector("#houseDetailProfessionals").textContent = pros.length;
    document.querySelector("#houseDetailUsers").textContent = users.length;

    document.querySelector("#houseDetailPeople").innerHTML = people.map(p => `
      <div class="simple-row">
        <div class="mini-house-mark">◌</div>
        <div><strong>${escapeHtml(p.firstName)} ${escapeHtml(p.lastName)}</strong><small>${escapeHtml(p.state)} · Ingreso ${formatDate(p.checkIn)}</small></div>
      </div>
    `).join("") || `<div class="empty-state"><strong>Sin registros</strong>No hay personas vinculadas a esta casa.</div>`;

    document.querySelector("#houseDetailPros").innerHTML = pros.map(p => `
      <div class="simple-row">
        <div class="mini-house-mark">✦</div>
        <div><strong>${escapeHtml(p.firstName)} ${escapeHtml(p.lastName)}</strong><small>${escapeHtml(p.specialty)}</small></div>
      </div>
    `).join("") || `<div class="empty-state"><strong>Sin profesionales</strong>No hay profesionales vinculados.</div>`;
  }

  function formatDate(value) {
    if (!value) return "—";
    const [y, m, d] = value.split("-");
    return `${d}/${m}/${y}`;
  }

  function refreshHouseSelects() {
    const options = state.houses.filter(h => h.status === "Activa").map(h =>
      `<option value="${h.id}">${escapeHtml(h.name)}</option>`
    ).join("");

    document.querySelector("#assistedHouse").innerHTML = `<option value="">Seleccionar casa</option>${options}`;
    document.querySelector("#professionalHouses").innerHTML = options;
    rebuildAssignments();
  }

  function rebuildAssignments() {
    const target = document.querySelector("#assignmentRows");
    target.innerHTML = "";
    addAssignmentRow();
  }

  function addAssignmentRow() {
    const target = document.querySelector("#assignmentRows");
    const row = document.createElement("div");
    row.className = "assignment-row";
    row.innerHTML = `
      <label class="field">Casa
        <select class="assignment-house" required>
          <option value="">Seleccionar</option>
          ${state.houses.filter(h => h.status === "Activa").map(h => `<option value="${h.id}">${escapeHtml(h.name)}</option>`).join("")}
        </select>
      </label>
      <label class="field">Rol
        <select class="assignment-role" required>
          <option value="">Seleccionar</option>
          <option>Administrador</option>
          <option>Profesional</option>
          <option>SuperAdmin</option>
        </select>
      </label>
      <button class="remove-row-button" type="button" aria-label="Quitar asignación">×</button>
    `;
    row.querySelector(".remove-row-button").addEventListener("click", () => {
      if (target.children.length > 1) row.remove();
    });
    target.appendChild(row);
  }

  document.querySelectorAll("[data-view-link]").forEach(btn => {
    btn.addEventListener("click", e => {
      e.preventDefault();
      showView(btn.dataset.viewLink);
    });
  });

  document.querySelector("#menuButton").addEventListener("click", () => {
    document.querySelector("#sidebar").classList.toggle("is-open");
  });

  document.querySelectorAll("[data-open-dialog]").forEach(btn => {
    btn.addEventListener("click", () => {
      const dialog = document.querySelector(`#${btn.dataset.openDialog}`);
      if (btn.dataset.openDialog === "userDialog") rebuildAssignments();
      dialog.showModal();
    });
  });

  document.querySelectorAll("[data-close-dialog]").forEach(btn => {
    btn.addEventListener("click", () => document.querySelector(`#${btn.dataset.closeDialog}`).close());
  });

  document.querySelector("#addAssignment").addEventListener("click", addAssignmentRow);

  document.querySelector("#userDni").addEventListener("input", e => {
    document.querySelector("#usernamePreview").value = e.target.value.replace(/\D/g, "");
  });

  document.querySelector("#houseSearch").addEventListener("input", renderHouses);
  document.querySelector("#userSearch").addEventListener("input", renderUsers);

  document.querySelector("#houseForm").addEventListener("submit", e => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const house = {
      id: nextId(state.houses),
      name: fd.get("name").trim(),
      street: fd.get("street").trim(),
      number: fd.get("number").trim(),
      status: fd.get("status")
    };
    state.houses.push(house);
    logActivity("Alta de casa", `Creó ${house.name}`);
    saveState();
    renderAll();
    e.currentTarget.reset();
    document.querySelector("#houseDialog").close();
    toast(`Casa creada: ${house.name}`);
    showView("houses");
  });

  document.querySelector("#userForm").addEventListener("submit", e => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const assignmentRows = [...document.querySelectorAll("#assignmentRows .assignment-row")];
    const assignments = assignmentRows.map(row => ({
      houseId: Number(row.querySelector(".assignment-house").value),
      role: row.querySelector(".assignment-role").value
    })).filter(a => a.houseId && a.role);

    const uniqueHouses = new Set(assignments.map(a => a.houseId));
    if (assignments.length !== uniqueHouses.size) {
      toast("No asignes la misma casa dos veces al mismo usuario.");
      return;
    }

    const dni = String(fd.get("dni")).replace(/\D/g, "");
    if (state.users.some(u => u.dni === dni)) {
      toast("Ya existe un usuario asociado a ese DNI.");
      return;
    }

    const user = {
      id: nextId(state.users),
      firstName: fd.get("firstName").trim(),
      lastName: fd.get("lastName").trim(),
      dni,
      username: dni,
      email: fd.get("email").trim(),
      birthDate: fd.get("birthDate"),
      areaCode: fd.get("areaCode"),
      phone: fd.get("phone"),
      street: fd.get("street"),
      streetNumber: fd.get("streetNumber"),
      assignments
    };

    state.users.push(user);
    logActivity("Alta de usuario", `Creó el usuario ${user.username} con ${assignments.length} asignación(es)`);
    saveState();
    renderAll();
    e.currentTarget.reset();
    document.querySelector("#userDialog").close();
    toast(`Usuario creado: ${user.firstName} ${user.lastName}`);
    showView("users");
  });

  document.querySelector("#assistedForm").addEventListener("submit", e => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const person = {
      id: nextId(state.assisted),
      firstName: fd.get("firstName").trim(),
      lastName: fd.get("lastName").trim(),
      dni: String(fd.get("dni")).replace(/\D/g, ""),
      birthDate: fd.get("birthDate"),
      areaCode: fd.get("areaCode"),
      phone: fd.get("phone"),
      email: fd.get("email"),
      street: fd.get("street"),
      streetNumber: fd.get("streetNumber"),
      state: fd.get("state"),
      observations: fd.get("observations"),
      houseId: Number(fd.get("houseId")),
      checkIn: fd.get("checkIn"),
      checkOut: fd.get("checkOut"),
      stayObservation: fd.get("stayObservation")
    };

    state.assisted.push(person);
    const h = houseById(person.houseId);
    logActivity("Alta de persona asistida", `Registró a ${person.firstName} ${person.lastName} en ${h?.name || "una casa"}`);
    saveState();
    renderAll();
    e.currentTarget.reset();
    document.querySelector("#assistedDialog").close();
    toast(`Persona registrada: ${person.firstName} ${person.lastName}`);
    showView("assisted");
  });

  document.querySelector("#professionalForm").addEventListener("submit", e => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const houseIds = [...document.querySelector("#professionalHouses").selectedOptions].map(o => Number(o.value));
    const professional = {
      id: nextId(state.professionals),
      firstName: fd.get("firstName").trim(),
      lastName: fd.get("lastName").trim(),
      dni: String(fd.get("dni")).replace(/\D/g, ""),
      license: fd.get("license"),
      specialty: fd.get("specialty"),
      email: fd.get("email"),
      houseIds
    };
    state.professionals.push(professional);
    logActivity("Alta de profesional", `Registró a ${professional.firstName} ${professional.lastName}`);
    saveState();
    renderAll();
    e.currentTarget.reset();
    document.querySelector("#professionalDialog").close();
    toast(`Profesional creado: ${professional.firstName} ${professional.lastName}`);
    showView("professionals");
  });

  document.querySelector("#fakeDailyButton").addEventListener("click", () => {
    toast("En la V1 navegable, este botón abriría el formulario del parte diario.");
  });

  document.querySelector("#resetDemo").addEventListener("click", () => {
    if (!confirm("¿Restablecer todos los datos de demostración?")) return;
    state = cloneSeed();
    saveState();
    renderAll();
    showView("dashboard");
    toast("Datos de demostración restablecidos.");
  });

  renderAll();
});
