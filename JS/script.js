// --- Configuración inicial ---
const candidatos = [
  "Luis Arce",
  "Evo Morales",
  "Carlos Mesa",
  "Fernando Camacho",
  "Jeanine Áñez"
];
const MAX_VOTANTES = 10;

// --- Utilidades de almacenamiento ---
function getUsuarios() {
  return JSON.parse(localStorage.getItem("usuarios") || "[]");
}
function setUsuarios(usuarios) {
  localStorage.setItem("usuarios", JSON.stringify(usuarios));
}
function getVotos() {
  return JSON.parse(localStorage.getItem("votos") || "[]");
}
function setVotos(votos) {
  localStorage.setItem("votos", JSON.stringify(votos));
}
function getSesion() {
  return JSON.parse(localStorage.getItem("sesion") || "null");
}
function setSesion(ci) {
  localStorage.setItem("sesion", JSON.stringify(ci));
}
function clearSesion() {
  localStorage.removeItem("sesion");
}

// --- Registro de usuario ---
document.getElementById("formCrearCuenta").onsubmit = function(e) {
  e.preventDefault();
  const usuario = {
    ci: document.getElementById("ci").value,
    nombre: document.getElementById("nombre").value,
    correo: document.getElementById("correo").value,
    departamento: document.getElementById("departamento").value,
    nacimiento: document.getElementById("nacimiento").value,
    votacion: document.getElementById("votacion").value,
    password: document.getElementById("password").value,
    yaVoto: false
  };
  let usuarios = getUsuarios();
  if (usuarios.find(u => u.ci === usuario.ci)) {
    alert("Ya existe un usuario con esa CI.");
    return;
  }
  if (usuarios.length >= MAX_VOTANTES) {
    alert("Solo se permiten 10 votantes.");
    return;
  }
  usuarios.push(usuario);
  setUsuarios(usuarios);
  alert("¡Usuario registrado! Ahora puedes iniciar sesión.");
  document.getElementById("formCrearCuenta").reset();
};

// --- Login ---
document.getElementById("formLogin").onsubmit = function(e) {
  e.preventDefault();
  const ci = document.getElementById("loginCI").value;
  const pass = document.getElementById("loginPass").value;
  const usuarios = getUsuarios();
  const usuario = usuarios.find(u => u.ci === ci && u.password === pass);
  if (!usuario) {
    alert("CI o contraseña incorrectos.");
    return;
  }
  setSesion(ci);
  mostrarPanelVotacion();
};

// --- Olvidé contraseña ---
function mostrarOlvide() {
  document.getElementById("olvide").style.display = "block";
}
document.getElementById("formOlvide").onsubmit = function(e) {
  e.preventDefault();
  const correo = document.getElementById("olvideCorreo").value;
  const usuarios = getUsuarios();
  const usuario = usuarios.find(u => u.correo === correo);
  if (!usuario) {
    alert("Correo no encontrado.");
    return;
  }
  alert("Tu contraseña es: " + usuario.password);
  document.getElementById("olvide").style.display = "none";
};

// --- Votación ---
function mostrarPanelVotacion() {
  document.getElementById("crearCuenta").style.display = "none";
  document.getElementById("login").style.display = "none";
  document.getElementById("olvide").style.display = "none";
  document.getElementById("votar").style.display = "block";
  document.getElementById("estadisticas").style.display = "block";
  mostrarCandidatos();
  mostrarResultados();
}
function mostrarCandidatos() {
  const sesion = getSesion();
  const usuarios = getUsuarios();
  const usuario = usuarios.find(u => u.ci === sesion);
  let yaVoto = usuario ? usuario.yaVoto : false;
  let html = "";
  candidatos.forEach((c, i) => {
    html += `
      <div class="form-check">
        <input class="form-check-input" type="radio" name="candidato" id="candidato${i}" value="${i}" ${yaVoto ? "disabled" : ""} required>
        <label class="form-check-label" for="candidato${i}">${c}</label>
      </div>
    `;
  });
  if (yaVoto) {
    html += `<div class="alert alert-info mt-2">Ya has votado.</div>`;
  }
  document.getElementById("candidatos").innerHTML = html;
}
document.getElementById("formVotar").onsubmit = function(e) {
  e.preventDefault();
  const sesion = getSesion();
  const usuarios = getUsuarios();
  const usuario = usuarios.find(u => u.ci === sesion);
  if (!usuario || usuario.yaVoto) {
    alert("No puedes votar dos veces.");
    return;
  }
  const elegido = document.querySelector('input[name="candidato"]:checked').value;
  let votos = getVotos();
  votos.push({ci: usuario.ci, candidato: parseInt(elegido)});
  setVotos(votos);
  usuario.yaVoto = true;
  setUsuarios(usuarios);
  mostrarCandidatos();
  mostrarResultados();
  alert("¡Voto registrado!");
};

// --- Estadísticas ---
function mostrarResultados() {
  const votos = getVotos();
  let conteo = Array(candidatos.length).fill(0);
  votos.forEach(v => conteo[v.candidato]++);
  let html = "<ul class='list-group'>";
  candidatos.forEach((c, i) => {
    html += `<li class='list-group-item d-flex justify-content-between align-items-center'>
      ${c}
      <span class='badge bg-success rounded-pill'>${conteo[i]}</span>
    </li>`;
  });
  html += "</ul>";
  document.getElementById("resultados").innerHTML = html;
}

// --- Logout ---
function logout() {
  clearSesion();
  document.getElementById("crearCuenta").style.display = "block";
  document.getElementById("login").style.display = "block";
  document.getElementById("olvide").style.display = "none";
  document.getElementById("votar").style.display = "none";
  document.getElementById("estadisticas").style.display = "none";
}

// --- Mostrar panel correcto al cargar ---
window.onload = function() {
  if (getSesion()) {
    mostrarPanelVotacion();
  }
  mostrarResultados();
};

function togglePassword() {
  const input = document.getElementById("password");
  const btn = input.nextElementSibling;
  if (input.type === "password") {
    input.type = "text";
    btn.textContent = "Ocultar";
  } else {
    input.type = "password";
    btn.textContent = "Ver";
  }
} 