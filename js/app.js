/**
 * app.js — Punt d'entrada de l'aplicació
 * Inicialitza el sistema i mostra la pantalla de títol.
 */

const app = document.getElementById('app');

function showPlaceholder() {
  app.innerHTML = `
    <div class="screen screen--active flex-column" style="justify-content: center; align-items: center; min-height: 100vh;">
      <h1>AVENTURES TEXTUALS<br>RETRO</h1>
      <p class="text-center text-muted" style="margin-top: 2rem;">
        Motor en construcció...
      </p>
      <p class="text-center text-accent" style="margin-top: 3rem; font-size: 0.55rem;">
        Fase 0 completada<span class="cursor"></span>
      </p>
    </div>
  `;
}

showPlaceholder();
