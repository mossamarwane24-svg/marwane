# Révision Maths 5ème — Aires & Pourcentages

Fiches de révision pour un contrôle de 5ème sur **les aires** et **les pourcentages**.

## 📱 Les fichiers à ouvrir (versions PDF, lisibles sur téléphone et imprimables)

| Fichier | À quoi ça sert | Pages |
|---|---|---|
| **`apprendre-les-formules-5e.pdf`** | 🧠 **Comprendre** : d'où viennent les formules (avec des dessins), la méthode pour les retenir, un exercice à trous et une feuille à plier | 7 |
| **`fiche-revision-maths-5e.pdf`** | 📘 **Apprendre** : le cours, les formules, les exemples corrigés, le bloc « à retenir par cœur » | 5 |
| **`exercices-maths-5e.pdf`** | ✍️ **S'entraîner** : 34 exercices avec corrections détaillées, du plus facile au contrôle blanc noté sur 20 | 9 |

👉 Pour les lire : ouvre le PDF, ou imprime-le (imprimante ou à l'école). Tout est en noir et blanc friendly.

## 💻 Les versions interactives (dans le navigateur)

| Fichier | Particularité |
|---|---|
| `revision-maths-5e-aires-pourcentages.html` | Même contenu que la fiche, avec des dessins de figures (carré, rectangle, triangle, disque) |
| `exercices-maths-5e-aires-pourcentages.html` | Quiz interactif : boutons « coup de pouce », corrections à ouvrir, **barre de progression** (coche « réussi ») |

⚠️ Ce sont des fichiers `.html` : si tu les ouvres dans un éditeur de texte, tu verras du **code**. Pour les voir comme des pages web, ouvre-les dans un navigateur (double-clic) — ou utilise simplement les PDF ci-dessus.

## 🗂️ Contenu des révisions

**Les aires**
- différence aire / périmètre, unités (cm², m², conversions ×100)
- carré `c × c` • rectangle `L × l` • triangle `(b × h) ÷ 2` • disque `π × r × r`
- figures composées, pièges classiques (÷ 2 oublié, rayon/diamètre)

**Les pourcentages**
- « pour cent » = sur 100, les repères 10 / 20 / 25 / 50 / 75 %
- `t % d'un nombre = (nombre ÷ 100) × t`
- pourcentage inverse : `(partie ÷ total) × 100`
- soldes et augmentations

## 🔧 Regénérer les PDF

```bash
pip install reportlab
python3 outils/generer-fiches-pdf.py
```

Tout le contenu (textes **et** dessins vectoriels) est écrit en Python dans `outils/generer-fiches-pdf.py` :
le script réécrit les trois PDF à la racine. Les dessins (rectangle quadrillé, triangle dédoublé en
parallélogramme, disque, grille des 100 cases des pourcentages) sont tracés directement avec l'API canvas
de reportlab — aucune image externe n'est nécessaire.

Polices : DejaVu Sans, présentes sur la plupart des systèmes Linux (`/usr/share/fonts/truetype/dejavu/`).
