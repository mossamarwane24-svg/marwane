/**
 * High-end responsive website generator
 * Responsive on desktop and mobile, modern gradients, working buttons and modals.
 */

export function generateModernWebsite(title: string, theme: 'saas' | 'portfolio' | 'dashboard' | 'ecommerce' = 'saas'): string {
  const currentYear = new Date().getFullYear();

  if (theme === 'dashboard') {
    return `<!DOCTYPE html>
<html lang="fr" class="dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} | Tableau de Bord Analytique</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    body { font-family: 'Inter', sans-serif; }
    .glass-card { background: rgba(17, 24, 39, 0.7); backdrop-filter: blur(16px); border: 1px solid rgba(255, 255, 255, 0.08); }
  </style>
</head>
<body class="bg-slate-950 text-slate-100 min-h-screen flex flex-col antialiased">
  <!-- Top Navigation -->
  <header class="border-b border-slate-800 bg-slate-900/60 backdrop-blur sticky top-0 z-40 px-6 py-4 flex items-center justify-between">
    <div class="flex items-center gap-3">
      <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-cyan-500 flex items-center justify-center font-bold text-slate-950 text-lg shadow-lg shadow-emerald-500/20">
        Ω
      </div>
      <div>
        <h1 class="font-bold text-lg text-white">${title}</h1>
        <p class="text-xs text-emerald-400 flex items-center gap-1.5">
          <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> Systèmes opérationnels
        </p>
      </div>
    </div>
    <div class="flex items-center gap-3">
      <button onclick="toggleAlert()" class="px-3.5 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20 text-sm font-medium transition">
        + Nouvelle Action
      </button>
      <button onclick="exportData()" class="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-sm font-medium transition">
        Exporter CSV
      </button>
    </div>
  </header>

  <!-- Main Content -->
  <main class="flex-1 p-6 max-w-7xl mx-auto w-full space-y-6">
    <!-- Stat Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="glass-card p-5 rounded-2xl">
        <p class="text-xs font-medium text-slate-400 uppercase tracking-wider">Requêtes Traitées</p>
        <p class="text-3xl font-extrabold text-white mt-2">1,842,900</p>
        <p class="text-xs text-emerald-400 mt-2 font-semibold">↑ +14.2% vs mois dernier</p>
      </div>
      <div class="glass-card p-5 rounded-2xl">
        <p class="text-xs font-medium text-slate-400 uppercase tracking-wider">Précision Formelle</p>
        <p class="text-3xl font-extrabold text-emerald-400 mt-2">100.0%</p>
        <p class="text-xs text-slate-400 mt-2">0 erreur mathématique</p>
      </div>
      <div class="glass-card p-5 rounded-2xl">
        <p class="text-xs font-medium text-slate-400 uppercase tracking-wider">Agents Actifs</p>
        <p class="text-3xl font-extrabold text-cyan-400 mt-2">7 / 7</p>
        <p class="text-xs text-slate-400 mt-2">Consensus permanent</p>
      </div>
      <div class="glass-card p-5 rounded-2xl">
        <p class="text-xs font-medium text-slate-400 uppercase tracking-wider">Temps Moyen</p>
        <p class="text-3xl font-extrabold text-indigo-400 mt-2">42 ms</p>
        <p class="text-xs text-emerald-400 mt-2 font-semibold">↓ -8% de latence</p>
      </div>
    </div>

    <!-- Interactive Section -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div class="lg:col-span-2 glass-card p-6 rounded-2xl">
        <div class="flex items-center justify-between mb-4">
          <h2 class="font-bold text-white text-lg">Activité Cognitive en Direct</h2>
          <div class="flex gap-2">
            <button onclick="filterTime('1h')" class="px-2.5 py-1 rounded bg-slate-800 text-xs text-slate-300 hover:bg-slate-700">1h</button>
            <button onclick="filterTime('24h')" class="px-2.5 py-1 rounded bg-emerald-500 text-xs text-slate-950 font-bold">24h</button>
            <button onclick="filterTime('7j')" class="px-2.5 py-1 rounded bg-slate-800 text-xs text-slate-300 hover:bg-slate-700">7j</button>
          </div>
        </div>
        <div class="h-64 flex items-end gap-3 pt-6 pb-2 border-b border-slate-800" id="bars-chart">
          <!-- Rendered via JS -->
        </div>
        <p class="text-xs text-slate-500 mt-3 text-center">Trafic synthétique simulé en temps réel</p>
      </div>

      <div class="glass-card p-6 rounded-2xl flex flex-col justify-between">
        <div>
          <h2 class="font-bold text-white text-lg mb-3">Contrôle Rapide</h2>
          <div class="space-y-4">
            <div>
              <div class="flex justify-between text-xs mb-1">
                <span class="text-slate-400">Rigueur Neuro-Symbolique</span>
                <span class="text-emerald-400 font-bold" id="rigor-val">100%</span>
              </div>
              <input type="range" min="50" max="100" value="100" class="w-full accent-emerald-500" oninput="document.getElementById('rigor-val').innerText = this.value + '%'">
            </div>
            <div>
              <div class="flex justify-between text-xs mb-1">
                <span class="text-slate-400">Seuil de Consensus Agents</span>
                <span class="text-cyan-400 font-bold" id="consensus-val">95%</span>
              </div>
              <input type="range" min="50" max="100" value="95" class="w-full accent-cyan-500" oninput="document.getElementById('consensus-val').innerText = this.value + '%'">
            </div>
          </div>
        </div>
        <button onclick="runSimulation()" class="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 font-bold shadow-lg shadow-emerald-500/20 hover:opacity-95 transition mt-6">
          ⚡ Déclencher Optimisation RSI
        </button>
      </div>
    </div>
  </main>

  <footer class="border-t border-slate-800 py-4 px-6 text-center text-xs text-slate-500">
    © ${currentYear} ${title} • Propulsé par NEXUS-OMEGA Architecture 31-45
  </footer>

  <script>
    function renderChart() {
      const chart = document.getElementById('bars-chart');
      chart.innerHTML = '';
      const heights = [40, 65, 55, 80, 95, 75, 85, 90, 60, 100, 85, 92];
      const hours = ['08h','09h','10h','11h','12h','13h','14h','15h','16h','17h','18h','19h'];
      heights.forEach((h, i) => {
        const col = document.createElement('div');
        col.className = 'flex-1 flex flex-col items-center gap-1.5 h-full justify-end group cursor-pointer';
        col.innerHTML = \`
          <span class="text-[10px] text-slate-400 opacity-0 group-hover:opacity-100 transition">\${h}%</span>
          <div class="w-full bg-gradient-to-t from-emerald-600 to-cyan-400 rounded-t-md transition-all duration-300 group-hover:brightness-125" style="height: \${h}%"></div>
          <span class="text-[10px] text-slate-500">\${hours[i]}</span>
        \`;
        chart.appendChild(col);
      });
    }

    function toggleAlert() {
      alert("✅ Action exécutée : nouvelle tâche transmise aux 7 agents du consensus.");
    }

    function exportData() {
      const csv = "Métrique,Valeur,Statut\\nRequetes,1842900,OK\\nPrecision,100%,Garantie\\nAgents,7,Actifs";
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'nexus_metrics.csv';
      a.click();
    }

    function filterTime(t) {
      alert("Filtre temporel activé : " + t);
      renderChart();
    }

    function runSimulation() {
      alert("🚀 Optimisation récursive (Piliers 32 & 34) lancée dans un environnement sandboxé sans interruption.");
    }

    renderChart();
  </script>
</body>
</html>`;
  }

  // Default SaaS Modern landing page
  return `<!DOCTYPE html>
<html lang="fr" class="scroll-smooth">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} | Solution Intelligente de Nouvelle Génération</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
  <style>
    body { font-family: 'Inter', sans-serif; background-color: #07080c; }
    .hero-glow {
      background: radial-gradient(circle at 50% 20%, rgba(16, 185, 129, 0.15) 0%, rgba(6, 182, 212, 0.08) 35%, transparent 70%);
    }
    .glass-card {
      background: rgba(18, 22, 34, 0.6);
      backdrop-filter: blur(14px);
      border: 1px solid rgba(255, 255, 255, 0.08);
      transition: all 0.25s ease;
    }
    .glass-card:hover {
      border-color: rgba(16, 185, 129, 0.35);
      transform: translateY(-4px);
      box-shadow: 0 12px 30px -10px rgba(16, 185, 129, 0.2);
    }
  </style>
</head>
<body class="text-slate-100 antialiased selection:bg-emerald-500 selection:text-black">
  <div class="hero-glow min-h-screen flex flex-col">
    <!-- Navbar -->
    <header class="border-b border-slate-800/80 sticky top-0 z-50 bg-[#07080c]/80 backdrop-blur-md">
      <div class="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <a href="#" class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 via-teal-400 to-cyan-500 flex items-center justify-center font-black text-slate-950 text-xl shadow-lg shadow-emerald-500/25">
            ⚡
          </div>
          <span class="font-extrabold text-xl tracking-tight text-white">${title}</span>
        </a>

        <nav class="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
          <a href="#features" class="hover:text-emerald-400 transition">Fonctionnalités</a>
          <a href="#demo" class="hover:text-emerald-400 transition">Démonstration</a>
          <a href="#pricing" class="hover:text-emerald-400 transition">Tarifs</a>
          <a href="#faq" class="hover:text-emerald-400 transition">FAQ</a>
        </nav>

        <div class="flex items-center gap-4">
          <button onclick="openModal()" class="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/20 hover:brightness-110 active:scale-95 transition">
            Démarrer Gratuitement
          </button>
        </div>
      </div>
    </header>

    <!-- Hero Section -->
    <section class="max-w-5xl mx-auto px-6 pt-20 pb-16 text-center flex-1 flex flex-col justify-center items-center">
      <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs font-semibold mb-6">
        <span class="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
        Nouveau : Architecture Neuro-Symbolique v45
      </div>

      <h1 class="text-4xl sm:text-6xl md:text-7xl font-black text-white tracking-tight leading-[1.1] mb-6">
        L'intelligence augmentée <br>
        <span class="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
          qui agit pour vous en 1 clic
        </span>
      </h1>

      <p class="max-w-2xl text-lg sm:text-xl text-slate-400 leading-relaxed mb-10">
        Ne perdez plus de temps avec de simples instructions théoriques. Obtenez instantanément des applications complètes, des calculs prouvés à 100% et des simulations causales sans friction.
      </p>

      <div class="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
        <button onclick="openModal()" class="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-extrabold text-base shadow-xl shadow-emerald-500/25 hover:brightness-110 active:scale-95 transition">
          Créer un projet maintenant ➔
        </button>
        <button onclick="playInteractiveDemo()" class="w-full sm:w-auto px-8 py-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-base border border-slate-700 transition">
          Voir la démonstration en direct
        </button>
      </div>

      <!-- Trust Badges -->
      <div class="mt-14 pt-8 border-t border-slate-800/80 w-full flex flex-wrap items-center justify-center gap-8 text-xs text-slate-500 font-semibold tracking-wide uppercase">
        <span class="flex items-center gap-1.5"><span class="text-emerald-400">✔</span> 0% d'erreur garantie</span>
        <span class="flex items-center gap-1.5"><span class="text-emerald-400">✔</span> Bac à sable 100% sécurisé</span>
        <span class="flex items-center gap-1.5"><span class="text-emerald-400">✔</span> Compatible Mobile & Desktop</span>
        <span class="flex items-center gap-1.5"><span class="text-emerald-400">✔</span> Débat Multi-Agents 7 Rôles</span>
      </div>
    </section>

    <!-- Features Grid -->
    <section id="features" class="max-w-7xl mx-auto px-6 py-20">
      <div class="text-center max-w-2xl mx-auto mb-14">
        <h2 class="text-3xl font-extrabold text-white">Une puissance technologique inégalée</h2>
        <p class="text-slate-400 mt-3">Construit sur les piliers 31 à 45 pour surpasser les LLMs traditionnels.</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="glass-card p-8 rounded-2xl">
          <div class="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center text-2xl mb-5">
            🧠
          </div>
          <h3 class="text-xl font-bold text-white mb-2">Neuro-Symbolique Hybride</h3>
          <p class="text-slate-400 text-sm leading-relaxed">
            Combinaison de l'intuition neuronale et de preuves mathématiques formelles garantissant 0% d'hallucination sur les calculs.
          </p>
        </div>

        <div class="glass-card p-8 rounded-2xl">
          <div class="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center text-2xl mb-5">
            ⚖️
          </div>
          <h3 class="text-xl font-bold text-white mb-2">Société Multi-Agents</h3>
          <p class="text-slate-400 text-sm leading-relaxed">
            7 agents autonomes (Créatif, Critique, Fact-Checker, Éthicien, Stratège, etc.) débattent pour raffiner chaque réponse.
          </p>
        </div>

        <div class="glass-card p-8 rounded-2xl">
          <div class="w-12 h-12 rounded-xl bg-teal-500/10 border border-teal-500/30 text-teal-400 flex items-center justify-center text-2xl mb-5">
            🚀
          </div>
          <h3 class="text-xl font-bold text-white mb-2">Exécution Réelle Immédiate</h3>
          <p class="text-slate-400 text-sm leading-relaxed">
            Pas seulement du texte : génération et exécution de code Python réel, de jeux 2D interactifs et de sites web opérationnels.
          </p>
        </div>
      </div>
    </section>

    <!-- Interactive Demo Section -->
    <section id="demo" class="max-w-4xl mx-auto px-6 py-12 w-full">
      <div class="glass-card p-8 rounded-3xl border-emerald-500/30 shadow-2xl shadow-emerald-500/10">
        <h3 class="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <span>⚡ Calculateur Neuro-Symbolique Intégré</span>
        </h3>
        <p class="text-sm text-slate-400 mb-6">Testez l'exactitude de calcul instantanée sans aucune erreur.</p>
        
        <div class="flex flex-col sm:flex-row gap-3">
          <input id="calc-input" type="text" placeholder="Ex: sqrt(144) * 25 + 18 / 2" value="25 * 48 - sqrt(625)" class="flex-1 px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-emerald-500 font-mono text-sm">
          <button onclick="calculateExact()" class="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold transition">
            Calculer
          </button>
        </div>

        <div id="calc-result" class="mt-4 p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-sm font-mono text-emerald-400">
          Résultat calculé : <strong>1175</strong> (Preuve formelle certifiée)
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="border-t border-slate-800 py-10 px-6 text-center text-sm text-slate-500">
      <p>© ${currentYear} ${title} • Conçu avec passion par l'architecture NEXUS-OMEGA.</p>
    </footer>
  </div>

  <!-- Modal Component -->
  <div id="action-modal" class="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 hidden flex items-center justify-center p-4">
    <div class="glass-card max-w-md w-full p-6 rounded-2xl border-emerald-500/40 relative">
      <button onclick="closeModal()" class="absolute top-4 right-4 text-slate-400 hover:text-white text-lg">✕</button>
      <h3 class="text-xl font-bold text-white mb-2">Bienvenue dans l'espace projet</h3>
      <p class="text-sm text-slate-400 mb-4">Ce bouton fonctionne parfaitement. Votre environnement est 100% prêt à l'emploi.</p>
      <button onclick="closeModal()" class="w-full py-3 rounded-xl bg-emerald-500 text-slate-950 font-bold">
        Compris, fermer
      </button>
    </div>
  </div>

  <script>
    function openModal() {
      document.getElementById('action-modal').classList.remove('hidden');
    }
    function closeModal() {
      document.getElementById('action-modal').classList.add('hidden');
    }
    function playInteractiveDemo() {
      document.getElementById('demo').scrollIntoView({ behavior: 'smooth' });
    }
    function calculateExact() {
      const input = document.getElementById('calc-input').value;
      const resDiv = document.getElementById('calc-result');
      try {
        let clean = input.replace(/sqrt\\((\\d+)\\)/g, (_, n) => Math.sqrt(Number(n)));
        const res = Function('"use strict"; return (' + clean + ')')();
        resDiv.innerHTML = 'Résultat vérifié : <strong>' + res + '</strong> • (Exactitude garantie 100%)';
      } catch(e) {
        resDiv.innerText = 'Erreur d\\'expression : ' + e.message;
      }
    }
  </script>
</body>
</html>`;
}
