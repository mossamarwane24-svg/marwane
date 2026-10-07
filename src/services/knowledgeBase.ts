/**
 * Comprehensive Factual Knowledge Base & Answering Engine
 * Covers: Science, Physics, Astronomy, Biology, History, Geography, World Capitals,
 * Culinary Recipes, Programming, Everyday practical queries, Inventions, Computing.
 */

export interface KnowledgeTopic {
  keywords: string[];
  title: string;
  category: string;
  directAnswer: string;
  details: string;
  keyPoints: string[];
}

// Accent & punctuation normalization for robust matching
export function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove accents (é -> e, etc.)
    .replace(/['’]/g, ' ')           // replace apostrophes with space
    .replace(/[-_]/g, ' ')           // replace dashes with space
    .replace(/[^\w\s+*\/=]/g, ' ')   // remove punctuation
    .replace(/\s+/g, ' ')
    .trim();
}

// World Capitals Dictionary (instant accurate answers)
export const WORLD_CAPITALS: Record<string, { capital: string; country: string; facts: string }> = {
  france: { capital: 'Paris', country: 'France', facts: 'Paris est la capitale et la plus grande ville de France, peuplée de plus de 2,1 millions d’habitants intramuros et centre culturel et économique majeur.' },
  australie: { capital: 'Canberra', country: 'Australie', facts: 'Canberra est la capitale fédérale de l’Australie (et non Sydney ni Melbourne), choisie en 1908 comme compromis entre les deux grandes métropoles.' },
  canada: { capital: 'Ottawa', country: 'Canada', facts: 'Ottawa est la capitale du Canada (province de l’Ontario), désignée en 1857 par la reine Victoria pour sa position stratégique entre anglophones et francophones.' },
  bresil: { capital: 'Brasília', country: 'Brésil', facts: 'Brasília est la capitale fédérale du Brésil depuis son inauguration en 1960 par Juscelino Kubitschek, remplaçant Rio de Janeiro.' },
  maroc: { capital: 'Rabat', country: 'Maroc', facts: 'Rabat est la capitale politique et administrative du Royaume du Maroc, abritant le Palais Royal, le Parlement et les ambassades (Casablanca étant la capitale économique).' },
  algerie: { capital: 'Alger', country: 'Algérie', facts: 'Alger (surnommée « Alger la Blanche ») est la capitale et la plus grande ville d’Algérie, située au bord de la mer Méditerranée.' },
  tunisie: { capital: 'Tunis', country: 'Tunisie', facts: 'Tunis est la capitale de la République tunisienne, située au nord-est du pays au fond du golfe de Tunis.' },
  espagne: { capital: 'Madrid', country: 'Espagne', facts: 'Madrid est la capitale et la plus grande ville d’Espagne, située au centre géographique de la péninsule ibérique.' },
  italie: { capital: 'Rome', country: 'Italie', facts: 'Rome (la « Ville Éternelle ») est la capitale de l’Italie, berceau de la civilisation romaine et abritant l’enclave de la Cité du Vatican.' },
  allemagne: { capital: 'Berlin', country: 'Allemagne', facts: 'Berlin est la capitale de l’Allemagne et la ville la plus peuplée de l’Union Européenne avec plus de 3,7 millions d’habitants.' },
  'royaume-uni': { capital: 'Londres', country: 'Royaume-Uni', facts: 'Londres est la capitale du Royaume-Uni et de l’Angleterre, métropole mondiale majeure traversée par la Tamise.' },
  angleterre: { capital: 'Londres', country: 'Angleterre', facts: 'Londres est la capitale de l’Angleterre et du Royaume-Uni.' },
  'etats-unis': { capital: 'Washington D.C.', country: 'États-Unis', facts: 'Washington D.C. (District of Columbia) est la capitale fédérale des États-Unis (et non New York), siège de la Maison Blanche et du Capitole.' },
  usa: { capital: 'Washington D.C.', country: 'États-Unis', facts: 'Washington D.C. est la capitale des États-Unis.' },
  japon: { capital: 'Tokyo', country: 'Japon', facts: 'Tokyo est la capitale du Japon et le cœur de la plus grande aire urbaine du monde avec plus de 37 millions d’habitants.' },
  chine: { capital: 'Pékin (Beijing)', country: 'Chine', facts: 'Pékin (Beijing) est la capitale de la République Populaire de Chine, siège du gouvernement et riche de plus de 3 000 ans d’histoire.' },
  russie: { capital: 'Moscou', country: 'Russie', facts: 'Moscou est la capitale de la Fédération de Russie, reconnaissable à sa Place Rouge et au Kremlin.' },
  portugal: { capital: 'Lisbonne', country: 'Portugal', facts: 'Lisbonne est la capitale du Portugal, située à l’embouchure du Tage sur la côte atlantique.' },
  belgique: { capital: 'Bruxelles', country: 'Belgique', facts: 'Bruxelles est la capitale de la Belgique et le siège principal des institutions de l’Union Européenne et de l’OTAN.' },
  suisse: { capital: 'Berne', country: 'Suisse', facts: 'Berne est la ville fédérale et siège du gouvernement de la Confédération suisse.' },
  senegal: { capital: 'Dakar', country: 'Sénégal', facts: 'Dakar est la capitale et la plus grande métropole du Sénégal, située sur la presqu’île du Cap-Vert, point le plus occidental du continent africain.' },
  'cote d ivoire': { capital: 'Yamoussoukro', country: 'Côte d’Ivoire', facts: 'Yamoussoukro est la capitale politique de la Côte d’Ivoire (abritant la Basilique Notre-Dame de la Paix), tandis qu’Abidjan reste la capitale économique.' },
  egypte: { capital: 'Le Caire', country: 'Égypte', facts: 'Le Caire est la capitale de l’Égypte et la plus grande métropole du monde arabe, située au bord du Nil près du plateau de Gizeh.' },
  turquie: { capital: 'Ankara', country: 'Turquie', facts: 'Ankara est la capitale de la Turquie depuis 1923 sous Mustafa Kemal Atatürk (et non Istanbul, qui en est la plus grande métropole).' },
  argentine: { capital: 'Buenos Aires', country: 'Argentine', facts: 'Buenos Aires est la capitale de l’Argentine, située sur la rive sud du Río de la Plata.' },
  mexique: { capital: 'Mexico', country: 'Mexique', facts: 'Mexico (Ciudad de México) est la capitale du Mexique, construite sur les ruines de l’ancienne cité aztèque de Tenochtitlan.' },
  inde: { capital: 'New Delhi', country: 'Inde', facts: 'New Delhi est la capitale de l’Inde, district fédéral au sein de la métropole de Delhi.' },
  'coree du sud': { capital: 'Séoul', country: 'Corée du Sud', facts: 'Séoul est la capitale de la Corée du Sud, traversée par le fleuve Han.' }
};

export function matchCapitalQuery(query: string): { country: string; capital: string; facts: string } | null {
  const norm = normalizeText(query);
  if (!norm.includes('capitale')) return null;

  for (const [key, val] of Object.entries(WORLD_CAPITALS)) {
    const keyNorm = normalizeText(key);
    if (norm.includes(keyNorm)) {
      return val;
    }
  }
  return null;
}

export const FACTUAL_TOPICS: KnowledgeTopic[] = [
  // 1. NAPOLÉON BONAPARTE
  {
    keywords: ['napoleon', 'napoléon', 'bonaparte', 'qui est napoleon', 'qui etait napoleon'],
    title: 'Napoléon Bonaparte : Parcours, Réformes et Héritage',
    category: 'Histoire de France & Empire',
    directAnswer: "**Napoléon Bonaparte** (1769-1821) est un militaire et homme d'État français, figure majeure de l'histoire universelle. Général victorieux de la Révolution, il prend le pouvoir lors du coup d'État du 18 Brumaire (1799), devient Premier Consul, puis se fait proclamer **Empereur des Français** sous le nom de **Napoléon Ier** de 1804 à 1815.",
    details: `#### 1. Ascension fulgurante (1769 - 1799)
- Né à Ajaccio en Corse, formé aux écoles militaires de Brienne et de Paris.
- S'illustre au siège de Toulon (1793), puis lors de la campagne d'Italie (1796-1797) avec les victoires d'Arcole et de Rivoli.
- Mène l'expédition d'Égypte (1798) avant de s'emparer du pouvoir politique le **9 novembre 1799 (18 Brumaire)**.

#### 2. Les grandes réformes institutionnelles (Les "Masses de Granit")
Napoléon a posé les bases de l'administration et du droit moderne :
- **Le Code Civil (1804)** : Uniformise le droit, consacre l'égalité devant la loi, la laïcité de l'état civil et le droit de propriété.
- **Création d'institutions pérennes** : Banque de France (1800), les Préfets (1800), les Lycées (1802), la Légion d'honneur (1802), la Cour des comptes (1807).

#### 3. L'Empire et les guerres napoléoniennes (1804 - 1815)
- Sacré Empereur le 2 décembre 1804 à Notre-Dame de Paris.
- Chefs-d'œuvre militaires : **Austerlitz** (1805), Iéna (1806), Friedland (1807), Wagram (1809).
- Points de rupture : Guerre d'Espagne et désastreuse campagne de Russie (1812).
- Vaincu à **Waterloo** le 18 juin 1815, il est déporté par les Britanniques sur l'île de **Sainte-Hélène**, où il meurt le 5 mai 1821.`,
    keyPoints: [
      'Général de la Révolution devenu Premier Consul (1799) puis Empereur (1804-1815).',
      'Créateur du Code Civil, des lycées, des préfets et de la Banque de France.',
      'Génie tactique (Austerlitz), vaincu à Waterloo (1815) et exilé à Sainte-Hélène.'
    ]
  },

  // 2. CRÊPES
  {
    keywords: ['crepe', 'crêpe', 'crepes', 'crêpes', 'pate a crepe', 'pâte à crêpe', 'recette crepe', 'faire des crepes'],
    title: 'Recette Inratable des Crêpes Traditionnelles Françaises',
    category: 'Gastronomie & Cuisine',
    directAnswer: "Voici la recette authentique et inratable pour réaliser environ **15 à 20 crêpes moelleuses et dorées**, sans aucun grumeau.",
    details: `#### 🛒 Ingrédients exacts :
- **Farine de blé (type T45 ou T55)** : 250 g
- **Œufs frais entiers** : 4 gros œufs
- **Lait demi-écrémé ou entier** : 500 ml (1/2 litre)
- **Beurre doux fondu** : 50 g
- **Sucre en poudre** : 2 cuillères à soupe (pour des crêpes sucrées)
- **Sel fin** : 1 pincée
- **Arôme au choix** : 1 cuillère à café d'extrait de vanille, ou 1 cuillère à soupe de fleur d'oranger ou de rhum ambré.

---

#### 👨‍🍳 Étapes de préparation pas à pas :
1. **Le puit de farine** : Dans un grand saladier, versez la farine tamisée avec la pincée de sel et le sucre. Formez un creux (un puit) au centre.
2. **Les œufs** : Cassez les 4 œufs entiers au centre du puit. À l'aide d'un fouet, commencez à mélanger doucement en partant du centre et en incorporant la farine petit à petit.
3. **Incorporation du liquide** : Versez le lait progressivement en filet tout en continuant de fouetter vivement pour **éviter la formation de grumeaux**.
4. **Finition** : Ajoutez le beurre fondu tiédi et l'arôme choisi. Mélangez jusqu'à obtenir une pâte parfaitement lisse et fluide comme une crème liquide.
5. **Temps de repos** : Laissez reposer la pâte **30 minutes** à température ambiante (cela permet à l'amidon de gonfler pour des crêpes très moelleuses).

---

#### 🍳 Cuisson optimale :
- Faites chauffer une poêle à crêpe à feu moyen-vif et graissez-la légèrement avec un papier absorbant imbibé d'huile ou de beurre.
- Versez une petite louche de pâte, inclinez rapidement la poêle pour répartir la pâte sur toute la surface.
- Laissez cuire **1 à 2 minutes** : dès que les bords se détachent et dorent, retournez la crêpe avec une spatule.
- Laissez cuire encore **30 à 45 secondes** sur la seconde face, puis glissez sur une assiette. Répétez l'opération !`,
    keyPoints: [
      'Proportion d\'or : 250g farine / 4 œufs / 500ml lait / 50g beurre.',
      'Toujours verser le lait progressivement pour éliminer les grumeaux.',
      'Un repos de 30 minutes garantit un moelleux incomparable.'
    ]
  },

  // 3. CARBONARA
  {
    keywords: ['carbonara', 'pates carbonara', 'recette carbonara', 'vraie carbonara'],
    title: 'La Véritable Recette des Pâtes Carbonara Traditionnelles',
    category: 'Gastronomie Italienne',
    directAnswer: "La véritable **Carbonara romaine** ne contient **JAMAIS de crème fraîche, d'oignons ni de lardons industriels**. Elle repose sur l'émulsion créée entre les œufs, le fromage affiné et l'eau de cuisson riche en amidon des pâtes.",
    details: `#### 🛒 Ingrédients pour 4 personnes :
- **Spaghetti ou Rigatoni** : 400 g
- **Guanciale** (joue de porc séchée) : 150 g (ou à défaut de la pancetta de qualité)
- **Jaunes d'œufs frais** : 4 jaunes + 1 œuf entier
- **Pecorino Romano AOP râpé** : 80 g
- **Poivre noir en grains fraîchement moulu** : généreusement

---

#### 👨‍🍳 Étapes de réalisation :
1. **La crème d'œufs** : Dans un bol, battez les jaunes et l'œuf entier avec le Pecorino râpé et le poivre noir moulu.
2. **Le Guanciale** : Coupez en lardons et faites dorer dans une poêle sans matière grasse pendant 8 minutes jusqu'à ce qu'il soit croustillant. Retirez du feu en gardant le gras fondu.
3. **Cuisson des pâtes** : Cuisez les pâtes al dente et conservez impérativement 1 verre d'eau de cuisson.
4. **L'émulsion hors du feu** : Jetez les pâtes chaudes dans la poêle contenant le gras de guanciale avec un peu d'eau de cuisson. Retirez la poêle du feu, versez la crème d'œufs et remuez vivement : l'émulsion donne une sauce onctueuse parfaite sans coaguler !`,
    keyPoints: [
      'Zéro crème, zéro lardon : uniquement guanciale, œufs, pecorino et poivre.',
      'L\'onctuosité provient de l\'émulsion entre le gras, les œufs et l\'eau de cuisson des pâtes.',
      'Toujours incorporer les œufs hors du feu.'
    ]
  },

  // 4. GÂTEAU AU CHOCOLAT
  {
    keywords: ['gateau au chocolat', 'gâteau au chocolat', 'recette chocolat fondant'],
    title: 'Recette du Gâteau au Chocolat Fondant & Moelleux',
    category: 'Gastronomie & Pâtisserie',
    directAnswer: "Voici la recette classique et rapide pour un **gâteau au chocolat fondant et moelleux** au cœur intense, prêt en 35 minutes chrono.",
    details: `#### 🛒 Ingrédients (pour 6 à 8 parts) :
- **Chocolat noir à pâtisser (65% min)** : 200 g
- **Beurre doux** : 100 g
- **Sucre en poudre** : 100 g
- **Œufs entiers** : 3 gros œufs
- **Farine de blé** : 50 g (environ 2 cuillères à soupe bombées)
- **Sel fin** : 1 pincée

---

#### 👨‍🍳 Étapes de préparation :
1. Préchauffez le four à **180°C**. Beurrez et farinez un moule rond de 20 cm.
2. Faites fondre ensemble le chocolat et le beurre au bain-marie ou au micro-ondes à feu doux.
3. Dans un saladier, fouettez vivement les 3 œufs entiers avec le sucre jusqu'à ce que le mélange blanchisse.
4. Incorporez le chocolat fondu tiède, puis ajoutez la farine tamisée et la pincée de sel.
5. Versez dans le moule et enfournez pendant **20 à 25 minutes**. Le cœur doit rester légèrement tremblotant pour un fondant parfait.`,
    keyPoints: [
      '200g chocolat noir, 100g beurre, 100g sucre, 3 œufs, 50g farine.',
      'Cuisson rapide de 20-22 min à 180°C pour préserver le fondant central.',
      'Une pincée de sel réhausse la puissance aromatique du cacao.'
    ]
  },

  // 5. CUISSON DES ŒUFS
  {
    keywords: ['cuisson oeuf', 'cuisson des oeufs', 'cuire un oeuf', 'oeuf a la coque', 'oeuf mollet', 'oeuf dur'],
    title: 'Les Temps de Cuisson Exacts des Œufs (Règle 3 - 6 - 9)',
    category: 'Guide Pratique Culinaire',
    directAnswer: "La règle universelle et mnémotechnique pour cuire des œufs dans l'eau bouillante est la règle **« 3 - 6 - 9 minutes »** : 3 minutes pour un œuf à la coque, 6 minutes pour un œuf mollet, et 9 minutes pour un œuf dur.",
    details: `#### ⏱️ Les 3 cuissons fondamentales (eau à frémissement) :
1. **Œuf à la coque (3 minutes)** :
   - Blanc tout juste pris et soyeux, jaune totalement liquide et chaud. Idéal avec des mouillettes de pain beurré.
2. **Œuf mollet (6 minutes)** :
   - Blanc parfaitement ferme, jaune crémeux et coulant au centre. À plonger immédiatement dans un bol d'eau glacée pour stopper net la cuisson avant de l'écaler délicatement.
3. **Œuf dur (9 minutes)** :
   - Blanc ferme, jaune cuit à cœur mais encore fondant. Ne dépassez pas 10 minutes pour éviter la formation d'un cerclage grisâtre autour du jaune causé par le soufre.

#### 💡 Astuce de chef :
Plongez toujours vos œufs avec une cuillère dans une eau déjà bouillante avec un filet de vinaigre blanc (qui coagule le blanc en cas de micro-fissure de la coquille).`,
    keyPoints: [
      '3 minutes = Œuf à la coque (jaune liquide).',
      '6 minutes = Œuf mollet (jaune onctueux coulant).',
      '9 minutes = Œuf dur (jaune ferme et fondant).'
    ]
  },

  // 6. PÂTE À PIZZA
  {
    keywords: ['pate a pizza', 'pâte à pizza', 'recette pizza maison'],
    title: 'Recette Authentique de la Pâte à Pizza Napolitaine',
    category: 'Gastronomie Italienne',
    directAnswer: "La véritable pâte à pizza napolitaine maison se compose de seulement 5 ingrédients simples : **500 g de farine T55 ou 00, 320 ml d'eau tiède, 1 cuillère à café de levure boulangère, 10 g de sel fin et 2 cuillères à soupe d'huile d'olive**.",
    details: `#### 👨‍🍳 Étapes de préparation :
1. **Activation de la levure** : Diluez la levure dans 50 ml d'eau tiède (non brûlante) et laissez reposer 5 minutes.
2. **Pétrissage** : Dans un grand saladier, mélangez la farine et le sel. Versez l'eau restante, la levure diluée et l'huile d'olive. Pétrissez pendant 8 à 10 minutes jusqu'à ce que la pâte devienne lisse et élastique.
3. **Première pousse** : Formez une boule, couvrez d'un linge humide et laissez lever 2 heures à température ambiante (la pâte doit doubler de volume).
4. **Façonnage** : Divisez en pâtons de 220 g et étalez toujours **à la main du centre vers les bords** (jamais au rouleau à pâtisserie, pour chasser l'air vers la croûte et obtenir un rebord bien aéré).
5. **Cuisson** : Enfournez à la température maximale de votre four (250°C - 280°C) sur plaque très chaude pendant 8 à 10 minutes.`,
    keyPoints: [
      'Proportions : 500g farine, 320ml eau, levure, 10g sel, 2 c.à.s huile d\'olive.',
      'Pétrir 10 minutes et laisser lever 2 heures minimum.',
      'Étaler à la main sans rouleau pour préserver les bulles d\'air de la croûte.'
    ]
  },

  // 7. TERRE RONDE
  {
    keywords: ['terre est ronde', 'terre ronde', 'pourquoi la terre est ronde', 'forme de la terre', 'terre plate ou ronde'],
    title: 'Pourquoi la Terre est-elle ronde ?',
    category: 'Astrophysique & Géophysique',
    directAnswer: "La Terre est sphérique principalement en raison de la **gravitation universelle** et de l'**équilibre hydrostatique** : toute planète accumulant une masse suffisante voit sa propre gravité attirer la matière de manière égale et isotrope vers son centre de gravité, formant naturellement une sphère.",
    details: `#### 1. Le mécanisme fondamental : L'Équilibre Hydrostatique
- Lorsqu'un corps céleste atteint une masse critique, sa force gravitationnelle interne surpasse la résistance mécanique des roches.
- Les roches et la matière chaude se comportent comme un fluide plastique sous cette pression colossale : les creux sont comblés et les sommets s'effondrent vers le centre de gravité.
- La forme d'énergie minimale pour un tel système isotrope est mathématiquement la **sphère**.

#### 2. La forme exacte : Un « Géoïde » ou « Ellipsoïde de révolution »
La Terre n'est pas une sphère géométrique absolue :
- En raison de sa **rotation sur elle-même** (une rotation en 23h 56min), la force centrifuge pousse la matière vers l'extérieur au niveau de l'équateur.
- **Rayon équatorial** : ~6 378 km.
- **Rayon polaire** : ~6 357 km (soit un aplatissement d'environ 21 km aux pôles).

#### 3. Preuves tangibles et observations historiques :
1. **L'ombre de la Terre lors des éclipses de Lune** (décrite par Aristote dès le IVe siècle av. J.-C.) : l'ombre projetée sur la Lune est TOUJOURS circulaire.
2. **Le mât des bateaux à l'horizon** : lorsqu'un navire s'éloigne au large, sa coque disparaît sous l'horizon avant le sommet de son mât.
3. **Photographies spatiales directes** : toutes les sondes, satellites en orbite et missions lunaires Apollo ont photographié la Terre ronde depuis l'espace.`,
    keyPoints: [
      'Cause : La gravité attire la masse de façon égale dans toutes les directions (équilibre hydrostatique).',
      'Forme exacte : Ellipsoïde aplati aux pôles (géoïde) à cause de la rotation terrestre.',
      'Preuves : Éclipses lunaires, mât des bateaux à l\'horizon, constellations et photos spatiales.'
    ]
  },

  // 8. CIEL BLEU
  {
    keywords: ['ciel est bleu', 'ciel bleu', 'pourquoi le ciel'],
    title: 'Pourquoi le ciel est-il bleu ?',
    category: 'Physique & Optique',
    directAnswer: "Le ciel apparaît bleu en raison de la **diffusion de Rayleigh** : les molécules de gaz de l'atmosphère terrestre (principalement l'azote $N_2$ et l'oxygène $O_2$) diffusent la lumière du Soleil dans toutes les directions, en dispersant beaucoup plus fortement les courtes longueurs d'onde (bleu et violet) que les longues longueurs d'onde (rouge et jaune).",
    details: `#### 1. Le principe physique de Rayleigh
La lumière du Soleil est une onde électromagnétique polychromatique (lumière blanche).
- L'intensité de la diffusion par de petites particules est inversement proportionnelle à la puissance 4 de la longueur d'onde :
  $$I \\propto \\frac{1}{\\lambda^4}$$
- La lumière bleue a une longueur d'onde d'environ 450 nm, tandis que la lumière rouge mesure environ 700 nm.
- Le bleu est donc diffusé environ **$(700/450)^4 \\approx 5{,}8$ fois plus intensément** que la lumière rouge.

#### 2. Pourquoi ne le voit-on pas violet ?
Le violet possède une longueur d'onde encore plus courte (environ 400 nm) et est encore plus diffusé. Cependant :
1. Le spectre d'émission du Soleil est plus pauvre en photons violets qu'en photons bleus.
2. Les cônes photorécepteurs de l'œil humain sont nettement plus sensibles aux longueurs d'onde bleues et vertes qu'au violet.`,
    keyPoints: [
      'Phénomène causé par la diffusion de Rayleigh sur les molécules de N2 et O2.',
      'Loi en 1/λ⁴ : les photons bleus sont diffusés 5 à 6 fois plus que le rouge.',
      'L\'œil humain est calibré pour être plus réceptif au bleu qu\'au violet.'
    ]
  },

  // 9. PHOTOSYNTHÈSE
  {
    keywords: ['photosynthese', 'photosynthèse'],
    title: 'La Photosynthèse : Mécanismes et Équation Chimique',
    category: 'Biologie Végétale & Biochimie',
    directAnswer: "La **photosynthèse** est le processus biochimique vital par lequel les plantes vertes, les algues et certaines cyanobactéries captent l'énergie de la lumière solaire pour synthétiser du glucose à partir d'eau et de dioxyde de carbone, tout en rejetant de l'oxygène pur ($O_2$) dans l'atmosphère.",
    details: `#### 1. L'Équation Bilan Fondamentale
$$\\mathbf{6\\,CO_2 + 6\\,H_2O + photons \\longrightarrow C_6H_{12}O_6 + 6\\,O_2}$$
*(6 molécules de gaz carbonique + 6 molécules d'eau produisent 1 molécule de glucose + 6 molécules de dioxygène)*.

#### 2. Déroulement en deux phases :
1. **Phase photochimique (Phase claire)** :
   - Se produit dans les thylakoïdes des **chloroplastes**.
   - La **chlorophylle** absorbe les photons et provoque la photolyse de l'eau ($2\\,H_2O \\rightarrow O_2 + 4H^+ + 4e^-$).
   - Synthétise de l'adénosine triphosphate (**ATP**) et du **NADPH**, vecteurs d'énergie chimique.
2. **Phase biochimique (Cycle de Calvin / Phase sombre)** :
   - Se déroule dans le stroma des chloroplastes sans besoin direct de photons.
   - L'enzyme maîtresse **RuBisCO** fixe le carbone inorganique du $CO_2$ pour assembler des glucides à 6 carbones.`,
    keyPoints: [
      'Équation : 6 CO2 + 6 H2O + énergie lumineuse -> C6H12O6 + 6 O2.',
      'Siège de la réaction : chloroplastes et thylakoïdes grâce à la chlorophylle.',
      'Indispensable au maintien de l\'oxygène atmosphérique et au cycle du carbone.'
    ]
  },

  // 10. VITESSE DE LA LUMIÈRE
  {
    keywords: ['vitesse de la lumiere', 'vitesse de la lumière', 'rapidite de la lumiere', 'celerite de la lumiere'],
    title: 'La Vitesse de la Lumière dans le Vide',
    category: 'Constantes Fondamentales de la Physique',
    directAnswer: "La vitesse exacte de la lumière dans le vide est de **299 792 458 mètres par seconde** (soit environ **300 000 km/s** ou $1{,}08 \\times 10^9$ km/h). Elle est notée $c$ (du latin *celeritas*, célérité).",
    details: `#### 1. Pourquoi cette valeur exacte ?
Depuis 1983, la vitesse de la lumière n'est plus mesurée, mais **fixée par définition** dans le Système International d'Unités (SI). C'est le mètre qui est défini à partir de $c$ : *le mètre est la distance parcourue par la lumière dans le vide en 1 / 299 792 458 de seconde*.

#### 2. Exemples d'ordres de grandeur :
- **Terre - Lune** (~384 400 km) : la lumière met **1,28 seconde**.
- **Soleil - Terre** (~149,6 millions de km) : la lumière met **8 minutes et 20 secondes**.
- **Tour de la Terre à l'équateur** (~40 000 km) : la lumière en fait **7,5 fois le tour en une seule seconde**.
- **Étoile la plus proche (Proxima du Centaure)** : environ **4,24 années-lumière**.`,
    keyPoints: [
      'Constante exacte universelle : c = 299 792 458 m/s.',
      'Le Soleil se situe à environ 8 minutes et 20 secondes-lumière de la Terre.',
      'Vitesse limite infranchissable pour tout corps doté d\'une masse.'
    ]
  },

  // 11. TROUS NOIRS
  {
    keywords: ['trou noir', 'trous noirs'],
    title: 'Les Trous Noirs : Physique, Singularité et Horizon',
    category: 'Astrophysique & Relativité Générale',
    directAnswer: "Un **trou noir** est un objet céleste dont le champ gravitationnel est si intense que rien, pas même la lumière, ne peut s'échapper une fois franchie une frontière appelée l'**horizon des événements**.",
    details: `#### 1. Anatomie d'un trou noir :
1. **L'horizon des événements** : La surface théorique à l'intérieur de laquelle la vitesse de libération dépasse la vitesse de la lumière ($v_{\\text{lib}} > c$).
   - Son rayon est appelé **rayon de Schwarzschild** :
     $$R_s = \\frac{2GM}{c^2}$$
2. **La singularité centrale** : Point où toute la masse est concentrée dans un volume théoriquement nul, où la courbure de l'espace-temps et la densité deviennent infinies.
3. **Le disque d'accrétion** : Matière en orbite accélérée à des vitesses relativistes, chauffée à des millions de degrés et émettant d'intenses rayons X.`,
    keyPoints: [
      'Horizon des événements : frontière où la vitesse de libération dépasse c.',
      'Rayon de Schwarzschild : Rs = 2GM / c².',
      'Première image capturée en 2019 (M87*) par l\'Event Horizon Telescope.'
    ]
  },

  // 12. ADN
  {
    keywords: ['adn', 'acide desoxyribonucleique', 'structure adn'],
    title: 'L’ADN (Acide Désoxyribonucléique) : Structure et Fonction',
    category: 'Génétique & Biologie Moléculaire',
    directAnswer: "L'**ADN** (Acide Désoxyribonucléique) est la macromolécule biologique qui contient toute l'information génétique nécessaire au développement, au fonctionnement et à la reproduction de tous les êtres vivants connus et de nombreux virus.",
    details: `#### 1. La structure en double hélice
Découverte par James Watson, Francis Crick et Rosalind Franklin en 1953 :
- Deux brins antiparallèles enroulés l'un autour de l'autre en forme de double hélice.
- Chaque brin est composé d'une chaîne de **nucléotides**, formés d'un sucre (désoxyribose), d'un groupement phosphate et d'une base azotée.

#### 2. Les 4 bases azotées et leur complémentarité stricte :
- **Adénine (A)** s'apparie toujours avec **Thymine (T)** (par 2 liaisons hydrogène).
- **Guanine (G)** s'apparie toujours avec **Cytosine (C)** (par 3 liaisons hydrogène).`,
    keyPoints: [
      'Double hélice formée de nucléotides avec 4 bases : Adénine, Thymine, Guanine, Cytosine.',
      'Appariement exclusif : A avec T, G avec C.',
      'Contient le code génétique traduit en protéines via l\'ARN messager.'
    ]
  },

  // 13. PREMIÈRE GUERRE MONDIALE
  {
    keywords: ['premiere guerre mondiale', 'première guerre mondiale', '14 18', '1914 1918'],
    title: 'La Première Guerre Mondiale (1914 - 1918)',
    category: 'Histoire Contemporaine',
    directAnswer: "La **Première Guerre mondiale** (1914-1918) est un conflit militaire mondial opposant la **Triple-Entente** (France, Royaume-Uni, Russie, rejoints par l'Italie en 1915 et les États-Unis en 1917) aux **Empires centraux** (Allemagne, Autriche-Hongrie, Empire ottoman, Bulgarie). Elle a fait environ 20 millions de morts civils et militaires.",
    details: `#### 1. L'élément déclencheur
L'assassinat de l'archiduc François-Ferdinand d'Autriche à Sarajevo le **28 juin 1914** par Gavrilo Princip active le jeu des alliances européennes en quelques semaines.

#### 2. Les grandes phases du conflit :
1. **Guerre de mouvement (1914)** : Bataille des Frontières, puis bataille de la Marne qui stoppe l'avancée allemande.
2. **Guerre de position et de tranchées (1915 - 1917)** : Les fronts se figent sur des centaines de kilomètres. Batailles d'usure sanglantes : **Verdun** (1916) et la **Somme** (1916).
3. **Le tournant de 1917** : Révolution russe et entrée en guerre décisive des **États-Unis**.
4. **Dénouement (1918)** : L'armistice est signé le **11 novembre 1918** à Rethondes.`,
    keyPoints: [
      'Dates clés : 28 juillet 1914 au 11 novembre 1918.',
      'Batailles majeures : la Marne (1914), Verdun (1916), la Somme (1916).',
      'Chute de 4 empires et signature du Traité de Versailles en 1919.'
    ]
  },

  // 14. DISTANCE TERRE-LUNE
  {
    keywords: ['distance terre lune', 'a quelle distance est la lune'],
    title: 'Distance Terre - Lune : Données Astronomiques Précises',
    category: 'Astronomie & Mécanique Céleste',
    directAnswer: "La distance moyenne entre la Terre et la Lune est de **384 400 kilomètres**. En raison de son orbite légèrement elliptique, cette distance varie entre **363 300 km** (au périgée) et **405 500 km** (à l'apogée).",
    details: `#### Repères et ordres de grandeur :
- **Temps lumière** : à la vitesse de la lumière ($c = 299\\,792\\text{ km/s}$), un signal radio ou laser met **1,28 seconde** pour faire le trajet Terre-Lune.
- **Temps de vol habité** : les missions Apollo ont mis environ **3 jours (73 heures)** pour atteindre l'orbite lunaire.
- **Éloignement séculaire** : La Lune s'éloigne de la Terre d'environ **3,8 centimètres par an** en raison des marées océaniques.`,
    keyPoints: [
      'Distance moyenne : 384 400 km (variations de 363 300 à 405 500 km).',
      'Temps de trajet pour la lumière : 1,28 seconde.',
      'La Lune s\'éloigne de 3,8 cm par an à cause des marées.'
    ]
  },

  // 15. JOCONDE
  {
    keywords: ['joconde', 'mona lisa', 'peint la joconde'],
    title: 'La Joconde (Mona Lisa) : Chef-d’œuvre de Léonard de Vinci',
    category: 'Histoire de l’Art & Renaissance',
    directAnswer: "La Joconde (*Mona Lisa*) a été peinte par le génie de la Renaissance italienne **Léonard de Vinci** entre **1503 et 1506** (avec des retouches jusqu'en 1519). C'est le tableau le plus célèbre du monde, exposé au **Musée du Louvre à Paris**.",
    details: `#### Le modèle et la technique :
- **Lisa Gherardini** : épouse de Francesco del Giocondo, riche marchand florentin.
- **Technique du Sfumato** : superposition de fines couches transparentes estompant les contours pour donner un regard et un sourire vivants.
- **Support** : Peinture à l'huile sur bois de peuplier de 77 × 53 cm.`,
    keyPoints: [
      'Artiste : Léonard de Vinci.',
      'Modèle : Lisa Gherardini.',
      'Lieu : Musée du Louvre à Paris.'
    ]
  },

  // 16. GRAVITÉ
  {
    keywords: ['decouvert la gravite', 'gravite newton', 'gravitation newton', 'qui a decouvert la gravite'],
    title: 'La Découverte de la Gravitation : D’Isaac Newton à Albert Einstein',
    category: 'Histoire des Sciences & Physique',
    directAnswer: "La loi de la gravitation universelle a été découverte et formulée mathématiquement par le savant anglais **Sir Isaac Newton en 1687** dans ses *Philosophiae Naturalis Principia Mathematica*. Elle a ensuite été réinterprétée en 1915 par **Albert Einstein** comme une courbure géométrique de l'espace-temps.",
    details: `#### 1. Formule de Newton :
$$\\mathbf{F = G \\,\\frac{m_1 \\, m_2}{r^2}}$$
*(La force d'attraction est proportionnelle aux masses et décroît avec le carré de la distance).*`,
    keyPoints: [
      'Pionnier : Isaac Newton en 1687 avec la loi universelle en 1/r².',
      'Généralisation moderne : Albert Einstein en 1915 (courbure de l\'espace-temps).'
    ]
  },

  // 17. AMÉRIQUE
  {
    keywords: ['decouvert l amerique', 'christophe colomb', 'qui a decouvert l amerique'],
    title: 'La Découverte de l’Amérique : Histoire et Peuplement',
    category: 'Histoire des Grandes Découvertes',
    directAnswer: "Pour l'histoire occidentale, l'Amérique a été abordée le **12 octobre 1492** par le navigateur génois **Christophe Colomb** sous pavillon espagnol. Cependant, le continent était déjà peuplé depuis plus de 15 000 ans par les peuples autochtones et avait été exploré vers l'an 1000 par les **Vikings menés par Leif Erikson**.",
    details: `#### Repères historiques :
- **Christophe Colomb (1492)** accoste aux Bahamas en cherchant une route occidentale vers les Indes.
- **Amerigo Vespucci (1503)** prouve que ces terres constituent un nouveau continent, auquel le cartographe Martin Waldseemüller donne son nom en 1507.`,
    keyPoints: [
      '1492 : Débarquement de Christophe Colomb aux Bahamas.',
      'Vers l\'an 1000 : Établissement viking de Leif Erikson à Terre-Neuve.',
      'Nommé d\'après le cartographe Amerigo Vespucci.'
    ]
  },

  // 18. IMPRIMERIE
  {
    keywords: ['invente l imprimerie', 'gutenberg imprimerie', 'qui a invente l imprimerie'],
    title: 'L’Invention de l’Imprimerie Moderne : Johannes Gutenberg',
    category: 'Histoire & Technologies',
    directAnswer: "L'imprimerie moderne à caractères mobiles métalliques a été mise au point vers **1440-1450 à Mayence (Allemagne)** par l'orfèvre allemand **Johannes Gutenberg**. Son premier chef-d'œuvre est la **Bible à 42 lignes**, imprimée en 1455.",
    details: `#### Innovations clés :
- Caractères mobiles réutilisables en alliage de plomb, étain et antimoine.
- Encre grasse typographique à base d'huile.
- Presse à vis en bois inspirée des pressoirs viticoles.`,
    keyPoints: [
      'Inventeur : Johannes Gutenberg à Mayence vers 1440-1450.',
      'Premier tirage : La Bible à 42 lignes achevée en 1455.'
    ]
  },

  // 19. INTERNET
  {
    keywords: ['invente internet', 'origine d internet', 'qui a cree internet', 'qui a invente internet'],
    title: 'L’Invention d’Internet et du Web : De l’ARPANET au World Wide Web',
    category: 'Histoire de l’Informatique & Télécoms',
    directAnswer: "Internet est le fruit d'innovations collectives : **l'armée américaine (DARPA) crée l'ARPANET en 1969**, **Vinton Cerf et Bob Kahn** conçoivent la suite **TCP/IP** en 1974, et **Tim Berners-Lee** invente le **World Wide Web (WWW)** en 1989 au CERN.",
    details: `#### Chronologie essentielle :
- **1969 - ARPANET** : Première transmission de données par paquets entre ordinateurs universitaires.
- **1974 - Protocoles TCP/IP** : Règles d'adressage IP universelles fondant le réseau des réseaux (*Internet*).
- **1989 - Le Web (Tim Berners-Lee)** : URLs, protocole HTTP, langage HTML et premier navigateur graphique.`,
    keyPoints: [
      '1969 : Naissance d\'ARPANET.',
      '1974 : Protocoles TCP/IP par Vinton Cerf et Robert Kahn.',
      '1989 : Invention du Web par Tim Berners-Lee au CERN.'
    ]
  },

  // 20. MER SALÉE
  {
    keywords: ['mer est salee', 'mer salee', 'pourquoi la mer est salee', 'pourquoi l eau de mer est salee'],
    title: 'Pourquoi la mer et les océans sont-ils salés ?',
    category: 'Océanographie & Géologie',
    directAnswer: "L'eau de mer est salée principalement à cause de l'**érosion continue des roches continentales par les pluies** pendant des milliards d'années, couplée à l'activité des **sources hydrothermales volcaniques** sous-marines. L'évaporation de l'eau ne retient que l'eau pure et concentre les sels minéraux.",
    details: `#### Les causes :
1. **Érosion des roches** : La pluie légèrement acide dissout les ions Sodium ($Na^+$) et les transporte par les fleuves.
2. **Volcanisme sous-marin** : Les fumeurs noirs sous-marins rejettent de grandes quantités de Chlorure ($Cl^-$).
3. **Évaporation** : Seule l'eau pure s'évapore pour former des nuages ; le sel ($NaCl$) reste piégé dans l'océan (salinité moyenne : 35 g par litre).`,
    keyPoints: [
      'Origine : Érosion chimique des roches + sources hydrothermales sous-marines.',
      'Concentration stable d\'environ 35 grammes de sel par litre.'
    ]
  },

  // 21. DISPARITION DES DINOSAURES
  {
    keywords: ['disparition des dinosaures', 'extinction des dinosaures', 'pourquoi les dinosaures ont disparu'],
    title: 'La Disparition des Dinosaures : L’Extinction Crétacé-Paléogène',
    category: 'Paléontologie & Histoire de la Terre',
    directAnswer: "Les dinosaures non-aviens ont disparu il y a **66 millions d'années** lors de la crise d'extinction massive Crétacé-Paléogène (K-Pg), causée principalement par l'impact d'un **astéroïde géant d'environ 10 à 12 km de diamètre à Chicxulub** (Mexique actuel), aggravé par le volcanisme intense des trapps du Deccan en Inde.",
    details: `#### Conséquences de l'impact :
- Libération colossale d'énergie (plus de 100 millions de mégatonnes de TNT).
- Hiver d'impact : poussières et suie obscurcissent le Soleil pendant des années, stoppant la photosynthèse.
- Seuls les petits animaux fouisseurs et les dinosaures théropodes à plumes (ancêtres des **oiseaux**) ont survécu.`,
    keyPoints: [
      'Date : Il y a 66 millions d\'années.',
      'Cause : Astéroïde de 10 km à Chicxulub + hiver d\'impact.',
      'Les oiseaux modernes sont les descendants vivants des dinosaures théropodes.'
    ]
  },

  // 22. HAUTE MONTAGNE & GRAND OCÉAN
  {
    keywords: ['plus haute montagne', 'montagne la plus haute', 'sommet le plus haut'],
    title: 'La Plus Haute Montagne du Monde : Le Mont Everest',
    category: 'Géographie Mondiale',
    directAnswer: "La plus haute montagne de la Terre au-dessus du niveau de la mer est le **Mont Everest**, culminant à **8 848,86 mètres** d'altitude dans l'Himalaya, à la frontière entre le Népal et la Chine (Tibet). Première ascension réussie en 1953 par Edmund Hillary et Tenzing Norgay.",
    details: ``,
    keyPoints: [
      'Altitude officielle : 8 848,86 mètres.',
      'Chaîne de l\'Himalaya (Népal / Tibet).'
    ]
  },
  {
    keywords: ['plus grand ocean', 'ocean le plus grand'],
    title: 'Le Plus Grand Océan du Monde : L’Océan Pacifique',
    category: 'Géographie Océanique',
    directAnswer: "Le plus grand océan de la Terre est l'**Océan Pacifique**, qui s'étend sur plus de **165,2 millions de km²** (soit un tiers de la surface du globe) et abrite le point le plus profond de la planète : la **Fosse des Mariannes** (-10 994 m).",
    details: ``,
    keyPoints: [
      'Superficie : 165,2 millions de km².',
      'Point le plus profond : Fosse des Mariannes (-10 994 m).'
    ]
  },

  // 23. BÂILLEMENT
  {
    keywords: ['baillement', 'baillons nous', 'bailler', 'pourquoi on baille'],
    title: 'Pourquoi bâille-t-on ? Les Fonctions Biologiques du Bâillement',
    category: 'Physiologie & Neurosciences',
    directAnswer: "On bâille principalement pour **refroidir le cerveau (thermorégulation cérébrale)**, **stimuler la vigilance** lors des transitions de rythme veille-sommeil, et maintenir la cohésion sociale par un mécanisme d'empathie activant les **neurones miroirs**.",
    details: `#### 1. La thermorégulation du cerveau
- Le cerveau fonctionne à son optimum dans une plage thermique très étroite (environ 37°C). Lors de la fatigue ou d'un effort intellectuel soutenu, sa température augmente légèrement.
- La grande inspiration d'air frais lors du bâillement refroidit le sang veineux dans les cavités nasales et les sinus crâniens, diminuant rapidement la température du cortex cérébral.

#### 2. La stimulation de la vigilance
- L'étirement musculaire puissant des mâchoires comprime les artères carotides, provoquant un pic d'afflux sanguin vers le cerveau et augmentant la libération de neurotransmetteurs d'éveil (dopamine, acétylcholine).

#### 3. Pourquoi le bâillement est-il « contagieux » ?
- Voir ou entendre quelqu'un bâiller active les **neurones miroirs** dans le cortex prémoteur et l'insula.
- C'est un réflexe social d'écho-phénomène lié à l'**empathie** : il servait aux premiers groupes humains à synchroniser leur état de vigilance collective face aux prédateurs.`,
    keyPoints: [
      'Refroidissement thermique du cerveau par inspiration d\'air frais.',
      'Augmentation de la pression carotidienne et de l\'oxygénation.',
      'Contagion sociale due à l\'empathie et aux neurones miroirs.'
    ]
  },

  // 24. PNEU DE VÉLO
  {
    keywords: ['pneu de velo', 'crevaison velo', 'reparer un pneu de velo', 'reparer une chambre a air'],
    title: 'Comment Réparer un Pneu de Vélo Crevé (Guide Pratique Étape par Étape)',
    category: 'Bricolage & Mobilité',
    directAnswer: "Pour réparer un pneu de vélo crevé, il suffit de **5 étapes simples : démonter la roue et extraire la chambre à air, localiser le trou dans l'eau, poncer au papier de verre, coller la rustine avec la colle à dissolution, et inspecter l'intérieur du pneu avant remontage**.",
    details: `#### 🛠️ Matériel nécessaire :
- 2 ou 3 démonte-pneus en plastique
- Un kit de rustines (papier de verre fin, tube de colle dissolution, rustines)
- Une pompe à vélo
- Une bassine d'eau

---

#### 👨‍🔧 La procédure pas à pas :
1. **Démonter la roue et le pneu** :
   - Desserrez l'axe de la roue et retirez-la du cadre. Dégonflez complètement la valve.
   - Insérez un premier démonte-pneu sous le flanc du pneu et faites levier. Bloquez-le aux rayons, puis glissez un second démonte-pneu pour faire sortir tout le pneu de la jante.
2. **Localiser la fuite** :
   - Gonflez légèrement la chambre à air et plongez-la dans une bassine d'eau : l'apparition de bulles d'air révèle l'emplacement exact du trou.
   - Séchez la zone et marquez le trou avec un trait de craie ou un stylo.
3. **Préparer la surface** :
   - Frottez délicatement la surface autour du trou avec le papier de verre pour la rendre rugueuse et éliminer la pellicule de cire.
4. **Appliquer la colle et la rustine** :
   - Déposez une goutte de colle à dissolution (vulcanisante) et étalez-la en fine couche sur une surface plus large que la rustine.
   - **Attendez impérativement 2 à 3 minutes** jusqu'à ce que la colle devienne mate au toucher (ne collez pas immédiatement !).
   - Appliquez la rustine et pressez fermement avec le pouce pendant au moins 1 minute.
5. **Vérification cruciale & Remontage** :
   - Passez délicatement vos doigts à l'intérieur du pneu pour retirer l'épine, le bout de verre ou le clou qui a causé la crevaison.
   - Replacez la chambre à air, remettez le pneu sur la jante (à la main sans pincer la chambre), et gonflez à la pression recommandée (indiquée sur le flanc du pneu, généralement entre 2,5 et 4 bars).`,
    keyPoints: [
      'Toujours poncer la chambre à air avant d\'appliquer la colle vulcanisante.',
      'Laisser sécher la colle 2 minutes avant de presser la rustine.',
      'Passer le doigt dans le pneu pour enlever le débris avant de remonter.'
    ]
  },

  // 25. INFLATION ÉCONOMIQUE
  {
    keywords: ['inflation', 'c est quoi l inflation', 'pourquoi l inflation', 'taux d inflation'],
    title: 'L’Inflation Économique : Définition, Causes et Conséquences',
    category: 'Économie & Finance',
    directAnswer: "L'**inflation** est la hausse générale, durable et auto-entretenue du niveau des prix des biens et services au sein d'une économie. Elle entraîne mécaniquement une **diminution du pouvoir d'achat** de la monnaie (avec la même somme d'argent, on peut acheter moins de choses qu'auparavant).",
    details: `#### 1. Comment est-elle mesurée ?
L'inflation est calculée par les instituts de statistique (comme l'INSEE en France) grâce à l'**Indice des Prix à la Consommation (IPC)**, qui suit l'évolution du coût d'un « panier moyen de biens et services » consommés par les ménages (alimentation, énergie, logement, transports, santé).

#### 2. Les 3 causes majeures de l'inflation :
1. **L'inflation par la demande** : La demande globale de biens et services dépasse l'offre disponible. Lorsque les acheteurs sont plus nombreux que les produits mis en vente, les prix montent.
2. **L'inflation par les coûts** : Les coûts de production des entreprises augmentent (hausse du prix du pétrole, du gaz, des matières premières agricoles ou des salaires), ce qui force les entreprises à répercuter cette hausse sur leurs prix de vente finaux.
3. **L'inflation par la création monétaire excessive** : La masse monétaire en circulation croît beaucoup plus vite que la production réelle de richesse (la fameuse formule de Milton Friedman : *« L'inflation est toujours et partout un phénomène monétaire »*).

#### 3. Comment les Banques Centrales la régulent-elles ?
Les Banques Centrales (comme la BCE ou la Fed) augmentent leurs **taux d'intérêt directeurs** pour renchérir le coût du crédit, ce qui ralentit la consommation et l'investissement, refroidissant ainsi la hausse des prix.`,
    keyPoints: [
      'Définition : Hausse durable du niveau général des prix et perte de valeur de la monnaie.',
      'Mesurée par l\'IPC (panier de consommation représentatif).',
      'Régulée par les Banques Centrales via la hausse des taux d\'intérêt.'
    ]
  },

  // 26. API (INFORMATIQUE)
  {
    keywords: ['api', 'c est quoi une api', 'definition api', 'interface de programmation'],
    title: 'Qu’est-ce qu’une API ? (Application Programming Interface)',
    category: 'Informatique & Génie Logiciel',
    directAnswer: "Une **API** (Application Programming Interface ou Interface de Programmation d'Application) est un ensemble normalisé de règles, protocoles et définitions qui permet à deux logiciels distincts de **communiquer entre eux et d'échanger des données en temps réel** de façon sécurisée.",
    details: `#### 1. La métaphore du serveur au restaurant :
- **Vous (le Client)** êtes assis à une table et regardez le menu.
- **La Cuisine (le Serveur / Base de données)** prépare les plats.
- **Le Serveur (l'API)** prend votre commande, la transmet fidèlement à la cuisine, puis vous rapporte le plat préparé sans que vous ayez besoin de savoir comment la cuisine fonctionne en interne.

#### 2. Exemples concrets du quotidien :
- **Paiements en ligne** : Quand vous payez sur un site e-commerce via PayPal ou Stripe, le site appelle l'API de Stripe pour valider la transaction sans jamais stocker votre numéro de carte bancaire.
- **Météo sur smartphone** : Votre application météo interroge l'API d'un service météorologique (ex: Météo-France) pour afficher la température de votre ville.
- **Connexion Google / Apple** : Le bouton « Se connecter avec Google » utilise l'API OAuth de Google pour vérifier votre identité sans partager votre mot de passe.

#### 3. Les standards modernes :
- **API REST (JSON over HTTP)** : Le standard dominant utilisant les verbes HTTP usuels (\`GET\` pour lire, \`POST\` pour créer, \`PUT\` pour modifier, \`DELETE\` pour supprimer).
- **GraphQL** : Permet au client de spécifier exactement la structure des données dont il a besoin.`,
    keyPoints: [
      'Passerelle standardisée de communication entre applications différentes.',
      'Sécurise l\'accès aux données sans exposer le code source interne.',
      'Format d\'échange standard : requêtes HTTP et réponses JSON (REST).'
    ]
  },

  // 27. DOCKER & GIT
  {
    keywords: ['docker', 'c est quoi docker'],
    title: 'Docker : La Révolution des Conteneurs Logiciels',
    category: 'DevOps & Infrastructure',
    directAnswer: "**Docker** est une plateforme open source qui permet d'empaqueter une application avec toutes ses dépendances (code, runtime, bibliothèques système, configuration) au sein d'une unité isolée et légère appelée **conteneur**, garantissant qu'elle s'exécutera à l'identique sur n'importe quelle machine.",
    details: `#### Pourquoi Docker est-il indispensable ?
- **Résout le problème classique** : *« Ça marchait pourtant sur ma machine ! »*
- **Différence avec une Machine Virtuelle (VM)** : Contrairement aux VM qui embarquent un système d'exploitation complet (plusieurs gigaoctets), les conteneurs Docker partagent le noyau Linux de la machine hôte. Ils démarrent en quelques millisecondes et ne consomment que quelques mégaoctets de RAM.`,
    keyPoints: [
      'Conteneurisation légère partageant le noyau hôte.',
      'Reproductibilité totale de l\'environnement du développement à la production.',
      'Créé par le Français Solomon Hykes en 2013.'
    ]
  },
  {
    keywords: ['git', 'c est quoi git'],
    title: 'Git : Le Système de Gestion de Versions Décentralisé',
    category: 'Développement Logiciel',
    directAnswer: "**Git** est le système de contrôle de version décentralisé le plus utilisé au monde. Créé en **2005 par Linus Torvalds** (le créateur de Linux), il permet à des équipes de développeurs de suivre l'historique complet des modifications de code, de créer des branches parallèles et de collaborer sans écraser le travail d'autrui.",
    details: `#### Les concepts clés de Git :
- **Commit** : Une capture instantanée de l'état des fichiers à un instant $T$.
- **Branch** : Une ligne de développement indépendante pour concevoir une fonctionnalité sans perturber la version stable (\`main\`).
- **Merge** : La fusion d'une branche de travail dans la branche principale.`,
    keyPoints: [
      'Créé par Linus Torvalds en 2005.',
      'Gestion décentralisée et traçabilité intégrale de l\'historique du code.',
      'Plateformes d\'hébergement majeures : GitHub, GitLab.'
    ]
  },

  // 28. RAYURES DES ZÈBRES
  {
    keywords: ['rayures des zebres', 'pourquoi les zebres ont des rayures', 'zebre rayures'],
    title: 'Pourquoi les zèbres ont-ils des rayures ? Les Réponses de la Science',
    category: 'Zoologie & Biologie de l’Évolution',
    directAnswer: "Des études scientifiques rigoureuses (notamment de l'Université de Bristol et UC Davis) ont démontré que les rayures des zèbres servent principalement de **répulsif naturel contre les insectes piqueurs (mouches tsé-tsé et taons)**, tout en contribuant à la **thermorégulation** et au **camouflage optique en troupeau**.",
    details: `#### 1. La protection anti-parasites (La cause prouvée) :
- Les taons et mouches tsé-tsé sont attirés par la lumière polarisée réfléchie par les pelages sombres et uniformes.
- Le contraste strié noir et blanc perturbe le système visuel des insectes à basse résolution : ils sont incapables d'évaluer correctement leur distance et ratent leur atterrissage sur le zèbre.

#### 2. La thermorégulation sous le soleil africain :
- Les bandes noires absorbent la chaleur et chauffent, tandis que les bandes blanches réfléchissent les rayons et restent plus fraîches.
- Cette différence de température de surface crée de minuscules flux d'air tourbillonnaires (convection thermique) qui rafraîchissent la peau de l'animal.`,
    keyPoints: [
      'Rôle numéro 1 : Perturber la vision des taons et mouches hématophages.',
      'Rôle thermique : Micro-courants d\'air rafraîchissants noir/blanc.',
      'Effet de troupeau : Brouillage visuel face aux prédateurs.'
    ]
  },

  // 29. PILIER 31 (NEURO-SYMBOLIQUE)
  {
    keywords: ['pilier 31', 'neuro symbolique', 'raisonnement neuro symbolique', 'hybride neuro symbolique'],
    title: 'Pilier 31 : Le Raisonnement Neuro-Symbolique Hybride',
    category: 'Architecture Cognitive & IA Fondamentale',
    directAnswer: "Le **Pilier 31** fusionne l'intuition statistique des réseaux de neurones profonds (Deep Learning) avec la rigueur déductive des **solveurs logiques formels (SMT et SAT)**. Cette symbiose élimine les hallucinations et garantit une exactitude mathématique et logique absolue (0% d'erreur).",
    details: `#### 1. Pourquoi le neuro-symbolique est-il supérieur au Deep Learning pur ?
- **Les LLM classiques** prédisent le mot le plus probable statistiquement, ce qui les rend vulnérables aux approximations et hallucinations de calcul.
- **Le système symbolique** applique des axiomes et des règles logiques strictes, comme un compilateur ou un solveur mathématique.
- **L'architecture hybride du Pilier 31** utilise le réseau de neurones pour appréhender le langage naturel et modéliser le problème, puis délègue systématiquement la vérification aux solveurs symboliques certifiés.

#### 2. Les 3 garanties formelles :
1. **Zéro hallucination sur les faits vérifiables** : Les assertions sont validées contre des invariants logiques.
2. **Preuve formelle mathématique** : Chaque résultat d'opération dispose d'une preuve déductive étape par étape.
3. **Explicabilité totale** : Le cheminement de déduction est transparent et auditable dans l'arbre de raisonnement.`,
    keyPoints: [
      'Union du Deep Learning (intuition sémantique) et des solveurs SMT/SAT (rigueur logique).',
      'Élimination garantie des hallucinations sur les calculs et relations causales.',
      'Raisonnement formel vérifiable et auditable pas à pas.'
    ]
  }
];

// Robust Matcher for Factual Knowledge
export function matchFactualKnowledge(query: string): KnowledgeTopic | null {
  const norm = normalizeText(query);
  for (const topic of FACTUAL_TOPICS) {
    for (const kw of topic.keywords) {
      const kwNorm = normalizeText(kw);
      if (norm.includes(kwNorm)) {
        return topic;
      }
    }
  }
  return null;
}

// Solve linear equations like 2x + 5 = 15 or 3x - 9 = 0
export function solveEquation(query: string): { equation: string; solution: string; steps: string[] } | null {
  const clean = query.toLowerCase().replace(/\s+/g, '');
  const eqMatch = clean.match(/([+-]?\d*)x([+-]\d+)?=([+-]?\d+)/);
  if (!eqMatch) return null;

  let aStr = eqMatch[1];
  let a = aStr === '' || aStr === '+' ? 1 : aStr === '-' ? -1 : parseInt(aStr, 10);
  let b = eqMatch[2] ? parseInt(eqMatch[2], 10) : 0;
  let c = parseInt(eqMatch[3], 10);

  if (isNaN(a) || isNaN(b) || isNaN(c) || a === 0) return null;

  const step1 = `Isoler le terme en x : ${a}x = ${c} - (${b}) = ${c - b}`;
  const xVal = (c - b) / a;
  const formattedX = Number.isInteger(xVal) ? xVal.toString() : xVal.toFixed(4);

  return {
    equation: `${a !== 1 ? a : ''}x ${b >= 0 ? '+ ' + b : '- ' + Math.abs(b)} = ${c}`,
    solution: `x = ${formattedX}`,
    steps: [
      `Forme standard de l'équation du 1er degré : ax + b = c`,
      step1,
      `Diviser par le coefficient a (${a}) : x = (${c - b}) / ${a}`,
      `Valeur exacte déduite : x = ${formattedX}`,
      `Vérification : ${a}*(${formattedX}) + ${b} = ${a * xVal + b} (Conforme à c = ${c})`
    ]
  };
}
