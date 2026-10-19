/* =========================================================
   VENUS - JavaScript
   Tres interacciones, cada una en su propia función:
   1. Menú adaptable (celular)
   2. Filtro de masajes
   3. Validación accesible del formulario
   Sin librerías externas (sin jQuery ni Bootstrap).
   ========================================================= */

// Avisamos al CSS que JavaScript está funcionando.
// Gracias a esta clase, el botón "Menú" solo aparece si hay JS.
document.documentElement.classList.add("js");


/* ---------- 1. MENÚ ADAPTABLE ---------- */
function iniciarMenu() {
  const boton = document.getElementById("menu-boton");
  const menu = document.getElementById("menu");

  // Si no existen los elementos, no hacemos nada (evita errores)
  if (!boton || !menu) return;

  function abrirMenu() {
    menu.classList.add("abierto");
    boton.setAttribute("aria-expanded", "true");
    boton.textContent = "Cerrar";
  }

  function cerrarMenu() {
    menu.classList.remove("abierto");
    boton.setAttribute("aria-expanded", "false");
    boton.textContent = "Menú";
  }

  // Al hacer clic en el botón: si está abierto lo cierra, si no lo abre
  boton.addEventListener("click", function () {
    const estaAbierto = boton.getAttribute("aria-expanded") === "true";
    if (estaAbierto) {
      cerrarMenu();
    } else {
      abrirMenu();
    }
  });

  // Al elegir un enlace, el menú se cierra para dejar ver la sección
  menu.addEventListener("click", function (evento) {
    if (evento.target.tagName === "A") {
      cerrarMenu();
    }
  });

  // Con la tecla Escape se cierra y el foco vuelve al botón
  document.addEventListener("keydown", function (evento) {
    if (evento.key === "Escape" && menu.classList.contains("abierto")) {
      cerrarMenu();
      boton.focus();
    }
  });
}


/* ---------- 2. FILTRO DE MASAJES ---------- */
function iniciarFiltro() {
  const botones = document.querySelectorAll(".filtro");
  const masajes = document.querySelectorAll(".masaje");
  const estado = document.getElementById("filtro-estado");

  if (botones.length === 0 || masajes.length === 0) return;

  function filtrar(objetivo) {
    let visibles = 0;

    for (const masaje of masajes) {
      // data-objetivo puede tener varias palabras: "antiedad relajar"
      const objetivos = masaje.dataset.objetivo.split(" ");
      const coincide = objetivo === "todos" || objetivos.includes(objetivo);

      masaje.hidden = !coincide;   // hidden oculta el elemento
      if (coincide) visibles++;
    }

    // Mensaje que anuncia el lector de pantalla (aria-live en el HTML)
    if (estado) {
      const palabra = visibles === 1 ? "técnica" : "técnicas";
      estado.textContent = `Mostrando ${visibles} ${palabra}.`;
    }
  }

  function marcarBotonActivo(botonElegido) {
    for (const boton of botones) {
      const esElegido = boton === botonElegido;
      boton.classList.toggle("activo", esElegido);
      boton.setAttribute("aria-pressed", esElegido ? "true" : "false");
    }
  }

  for (const boton of botones) {
    boton.addEventListener("click", function () {
      marcarBotonActivo(boton);
      filtrar(boton.dataset.filtro);
    });
  }
}


/* ---------- 3. VALIDACIÓN ACCESIBLE DEL FORMULARIO ---------- */
function iniciarFormulario() {
  const formulario = document.getElementById("formulario");
  if (!formulario) return;

  const nombre = document.getElementById("nombre");
  const correo = document.getElementById("correo");
  const acepto = document.getElementById("acepto");
  const mensajeExito = document.getElementById("mensaje-exito");

  // Muestra u oculta el error de un campo.
  // aria-invalid avisa al lector de pantalla que el campo tiene un problema
  // y aria-describedby (en el HTML) hace que lea el mensaje.
  function mostrarError(campo, mensaje) {
    const error = document.getElementById("error-" + campo.id);
    error.textContent = mensaje;
    if (mensaje) {
      campo.setAttribute("aria-invalid", "true");
    } else {
      campo.removeAttribute("aria-invalid");
    }
  }

  // Cada función devuelve el texto del error, o "" si está bien
  function validarNombre() {
    const valor = nombre.value.trim();
    if (valor === "") return "Escribe tu nombre.";
    if (valor.length < 2) return "El nombre debe tener al menos 2 letras.";
    return "";
  }

  function validarCorreo() {
    const valor = correo.value.trim();
    // Expresión regular sencilla: algo@algo.algo
    const formato = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (valor === "") return "Escribe tu correo electrónico.";
    if (!formato.test(valor)) return "Revisa el correo, por ejemplo: nombre@correo.com";
    return "";
  }

  function validarAcepto() {
    if (!acepto.checked) return "Marca esta casilla para unirte a la lista.";
    return "";
  }

  // Lista de campos con su validación, para recorrerlos con un for
  const reglas = [
    { campo: nombre, validar: validarNombre },
    { campo: correo, validar: validarCorreo },
    { campo: acepto, validar: validarAcepto }
  ];

  formulario.addEventListener("submit", function (evento) {
    evento.preventDefault();   // aún no hay servidor: no enviamos de verdad
    mensajeExito.textContent = "";

    let primerCampoConError = null;

    for (const regla of reglas) {
      const mensaje = regla.validar();
      mostrarError(regla.campo, mensaje);
      if (mensaje && !primerCampoConError) {
        primerCampoConError = regla.campo;
      }
    }

    // Si hay errores, llevamos el foco al primero para corregirlo
    if (primerCampoConError) {
      primerCampoConError.focus();
      return;
    }

    // Todo correcto
    const nombreLimpio = nombre.value.trim();
    formulario.reset();
    mensajeExito.textContent = `¡Gracias, ${nombreLimpio}! Te avisaremos cuando Venus esté disponible.`;
  });

  // Cuando la persona corrige un campo, el error desaparece al momento
  for (const regla of reglas) {
    const tipoEvento = regla.campo.type === "checkbox" ? "change" : "input";
    regla.campo.addEventListener(tipoEvento, function () {
      if (regla.campo.getAttribute("aria-invalid") === "true") {
        mostrarError(regla.campo, regla.validar());
      }
    });
  }

  // El botón "Borrar datos" también limpia errores y mensajes
  formulario.addEventListener("reset", function () {
    for (const regla of reglas) {
      mostrarError(regla.campo, "");
    }
    mensajeExito.textContent = "";
  });
}


/* ---------- INICIO ---------- */
// El script está al final del <body>, así que el HTML ya está cargado
iniciarMenu();
iniciarFiltro();
iniciarFormulario();