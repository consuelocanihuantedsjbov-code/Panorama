/* ==========================================================
   Navegación entre páginas (por #) y animaciones de entrada
   ========================================================== */
(function () {
  "use strict";

  var views = document.querySelectorAll("[data-view]");
  var navLinks = document.querySelectorAll("[data-link]");
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  var titles = {
    inicio: "Pride, Creamfields y Noche de Museos",
    pride: "Pride: diversidad, orgullo e inclusión",
    creamfields: "Creamfields: música electrónica y una experiencia inolvidable",
    museos: "Noche de Museos: Santiago se llena de cultura bajo las estrellas"
  };

  // Duración de cada animación (milisegundos)
  var durations = { pride: 4400, creamfields: 4800, museos: 6400 };

  var activeIntro = null;
  var introTimer = null;

  /* ---------- Rutas ---------- */

  function currentRoute() {
    var hash = window.location.hash.replace("#", "");
    return titles[hash] ? hash : "inicio";
  }

  function showView(route, playIntro) {
    views.forEach(function (v) {
      v.hidden = v.getAttribute("data-view") !== route;
    });

    navLinks.forEach(function (a) {
      if (a.getAttribute("data-link") === route) {
        a.setAttribute("aria-current", "page");
      } else {
        a.removeAttribute("aria-current");
      }
    });

    document.title = titles[route];
    window.scrollTo(0, 0);

    if (route !== "inicio" && playIntro) {
      startIntro(route);
    } else {
      stopIntro(true);
    }
  }

  window.addEventListener("hashchange", function () {
    var hash = window.location.hash.replace("#", "");
    if (hash && !titles[hash]) return; // enlaces internos como #contenido
    showView(currentRoute(), true);
  });

  /* ---------- Animaciones ---------- */

  function startIntro(name) {
    stopIntro(true);
    if (reduceMotion.matches) {
      focusHeading(name);
      return;
    }

    var intro = document.querySelector('[data-intro="' + name + '"]');
    if (!intro) return;

    if (name === "creamfields") buildBursts(intro.querySelector(".bursts"));

    intro.hidden = false;
    intro.classList.remove("is-leaving", "is-playing");
    void intro.offsetWidth; // reinicia las animaciones CSS
    intro.classList.add("is-playing");
    document.body.classList.add("intro-open");
    activeIntro = intro;

    var skip = intro.querySelector(".intro-skip");
    if (skip) skip.focus({ preventScroll: true });

    introTimer = window.setTimeout(function () { stopIntro(false); }, durations[name]);
  }

  function stopIntro(immediate) {
    window.clearTimeout(introTimer);
    var intro = activeIntro;
    activeIntro = null;
    document.body.classList.remove("intro-open");
    if (!intro) return;

    var name = intro.getAttribute("data-intro");
    if (immediate) {
      finish(intro);
      return;
    }
    intro.classList.add("is-leaving");
    window.setTimeout(function () { finish(intro); }, 600);
    focusHeading(name);
  }

  function finish(intro) {
    intro.hidden = true;
    intro.classList.remove("is-playing", "is-leaving");
  }

  function focusHeading(name) {
    var h = document.querySelector("#" + name + " h1");
    if (h) h.focus({ preventScroll: true });
  }

  // Luces de Creamfields: varios destellos del archivo en distintos colores
  function buildBursts(container) {
    container.innerHTML = "";
    var colors = ["#FFFFFF", "#F72585", "#4CC9F0", "#FFFFFF", "#B5179E", "#F72585", "#FFFFFF"];
    var spots = [
      [18, 30], [80, 26], [34, 72], [70, 70], [50, 20], [12, 66], [88, 58]
    ];
    spots.forEach(function (pos, i) {
      var b = document.createElement("div");
      var color = colors[i % colors.length];
      b.className = "burst " + (color === "#FFFFFF" ? "burst-white" : "burst-tint");
      b.style.setProperty("--x", pos[0] + "%");
      b.style.setProperty("--y", pos[1] + "%");
      b.style.setProperty("--size", (38 + Math.random() * 30) + "vmax");
      b.style.setProperty("--delay", (i * 0.38) + "s");
      b.style.setProperty("--dur", (1.1 + Math.random() * 0.5) + "s");
      b.style.setProperty("--rot", (Math.random() > 0.5 ? 1 : -1) * (12 + Math.random() * 20) + "deg");
      b.style.setProperty("--color", color);
      container.appendChild(b);
    });

    // Gran destello central junto al título
    var big = document.createElement("div");
    big.className = "burst burst-white";
    big.style.setProperty("--x", "50%");
    big.style.setProperty("--y", "48%");
    big.style.setProperty("--size", "130vmax");
    big.style.setProperty("--delay", "3s");
    big.style.setProperty("--dur", "1.8s");
    big.style.setProperty("--rot", "10deg");
    container.appendChild(big);

    var bigTint = document.createElement("div");
    bigTint.className = "burst burst-tint";
    bigTint.style.setProperty("--x", "50%");
    bigTint.style.setProperty("--y", "48%");
    bigTint.style.setProperty("--size", "150vmax");
    bigTint.style.setProperty("--delay", "3.1s");
    bigTint.style.setProperty("--dur", "1.7s");
    bigTint.style.setProperty("--rot", "-14deg");
    bigTint.style.setProperty("--color", "#F72585");
    container.appendChild(bigTint);
  }

  // Cerrar la animación: botón, clic en la pantalla o tecla Escape
  document.querySelectorAll(".intro").forEach(function (intro) {
    intro.addEventListener("click", function () { stopIntro(false); });
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && activeIntro) stopIntro(false);
  });

  // Repetir animación
  document.querySelectorAll("[data-replay]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      startIntro(btn.getAttribute("data-replay"));
    });
  });

  /* ---------- Inicio ---------- */
  showView(currentRoute(), true);
})();
