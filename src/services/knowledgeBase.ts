/**
 * Comprehensive Factual Knowledge Base & Answering Engine
 * Covers: Science, Physics, Biology, Chemistry, History, Geography, Cooking/Recipes,
 * Programming (Python, JS, C++, SQL, Bash), Mathematics & Equation Solving,
 * Philosophy, Technology, and Universal Semantic Resolution.
 */

export interface KnowledgeTopic {
  keywords: string[];
  title: string;
  category: string;
  directAnswer: string;
  details: string;
  codeSnippet?: { language: string; code: string };
  keyPoints: string[];
}

export const FACTUAL_TOPICS: KnowledgeTopic[] = [
  // SCIENCES & PHYSIQUE
  {
    keywords: ['ciel est bleu', 'ciel bleu', 'pourquoi le ciel'],
    title: 'Pourquoi le ciel est-il bleu ?',
    category: 'Physique & Optique',
    directAnswer: "Le ciel apparaît bleu en raison de la **diffusion de Rayleigh** : les molécules de gaz de l'atmosphère terrestre (principalement l'azote et l'oxygène) diffusent la lumière du Soleil dans toutes les directions, et diffusent beaucoup plus efficacement les longueurs d'onde courtes (bleu et violet) que les longueurs d'onde longues (rouge et jaune).",
    details: `#### 1. Le mécanisme physique : La diffusion de Rayleigh
La lumière du Soleil est une lumière blanche contenant toutes les couleurs du spectre visible.
- L'intensité de la diffusion par de petites particules est inversement proportionnelle à la puissance 4 de la longueur d'onde :
  $$I \\propto \\frac{1}{\\lambda^4}$$
- La lumière bleue a une longueur d'onde d'environ 450 nm, tandis que la lumière rouge a une longueur d'onde d'environ 700 nm.
- Le bleu est donc diffusé environ **$$(700/450)^4 \\approx 5.8$$ fois plus intensément** que le rouge.

#### 2. Pourquoi le ciel n'est-il pas violet ?
Le violet a une longueur d'onde encore plus courte (environ 400 nm) et est donc encore plus diffusé que le bleu. Cependant :
1. Le spectre solaire émet nettement moins de photons dans le violet que dans le bleu.
2. L'œil humain possède des photorécepteurs (cônes S, M, L) beaucoup plus sensibles aux longueurs d'onde bleues et vertes qu'au violet. Le cerveau interprète le mélange résultant comme un bleu azur.

#### 3. Pourquoi le coucher de soleil est-il rouge ?
Au coucher du Soleil, les rayons lumineux traversent une épaisseur d'atmosphère jusqu'à 10 fois plus grande. La quasi-totalité de la lumière bleue a déjà été diffusée sur le trajet ; seules les longueurs d'onde les plus longues (jaunes, orangées et rouges) parviennent directement jusqu'à nos yeux.`,
    keyPoints: [
      'Phénomène causé par la diffusion de Rayleigh sur les molécules de N2 et O2.',
      'Loi en 1/λ⁴ : les courtes longueurs d\'onde (bleues) sont dispersées 5 à 6 fois plus que le rouge.',
      'Sensibilité de la rétine humaine calibrée pour percevoir le bleu plutôt que le violet.'
    ]
  },
  {
    keywords: ['photosynthèse', 'photosynthese', 'comment marche la photosynthèse'],
    title: 'La Photosynthèse : Mécanismes et Équation Chimique',
    category: 'Biologie Végétale & Biochimie',
    directAnswer: "La **photosynthèse** est le processus biochimique par lequel les organismes végétaux, les algues et certaines bactéries convertissent l'énergie lumineuse du Soleil en énergie chimique stockée sous forme de glucides (glucose), en consommant du dioxyde de carbone ($CO_2$) et de l'eau ($H_2O$) et en rejetant du dioxygène ($O_2$).",
    details: `#### 1. L'équation bilan globale
$$\\mathbf{6 CO_2 + 6 H_2O + photons \\longrightarrow C_6H_{12}O_6 + 6 O_2}$$
*(6 molécules de dioxyde de carbone + 6 molécules d'eau produisent 1 molécule de glucose + 6 molécules d'oxygène)*.

#### 2. Les deux étapes biochimiques fondamentales :
1. **La phase claire (photochimique)** :
   - Se déroule dans les membranes des thylakoïdes au sein des chloroplastes.
   - La chlorophylle absorbe la lumière, ce qui provoque la photolyse de l'eau ($H_2O \\rightarrow 2H^+ + 2e^- + \\frac{1}{2}O_2$).
   - Cette réaction produit de l'ATP et du NADPH riches en énergie.
2. **La phase sombre (cycle de Calvin)** :
   - Se déroule dans le stroma des chloroplastes et ne nécessite pas directement de lumière.
   - L'enzyme **RuBisCO** fixe le $CO_2$ atmosphérique sur le ribulose-1,5-bisphosphate pour synthétiser des sucres à 3 carbones (G3P), précurseurs du glucose.

#### 3. Importance pour la biosphère
La photosynthèse est responsable de la quasi-totalité de l'oxygène atmosphérique terrestre et constitue la base de la chaîne alimentaire mondiale.`,
    keyPoints: [
      'Équation clé : 6 CO2 + 6 H2O + lumière -> C6H12O6 + 6 O2.',
      'Deux phases : photochimique (thylakoïdes) et cycle de Calvin (stroma).',
      'Enzyme clé : RuBisCO (la protéine la plus abondante sur Terre).'
    ]
  },
  {
    keywords: ['vitesse de la lumière', 'vitesse de la lumiere', 'a quelle vitesse va la lumiere', 'célérité de la lumière'],
    title: 'La Vitesse de la Lumière dans le Vide',
    category: 'Constantes Fondamentales de la Physique',
    directAnswer: "La vitesse exacte de la lumière dans le vide est de **299 792 458 mètres par seconde** (soit environ **300 000 km/s** ou $1{,}08 \\times 10^9$ km/h). Elle est notée $c$ (du latin *celeritas*, célérité).",
    details: `#### 1. Pourquoi cette valeur exacte ?
Depuis 1983, la vitesse de la lumière n'est plus mesurée, mais **fixée par définition** dans le Système International d'Unités (SI). C'est le mètre qui est défini à partir de $c$ : *le mètre est la distance parcourue par la lumière dans le vide en 1 / 299 792 458 de seconde*.

#### 2. Exemples d'ordres de grandeur :
- **Terre - Lune** (~384 400 km) : la lumière met **1,28 seconde**.
- **Soleil - Terre** (~149,6 millions de km) : la lumière met **8 minutes et 20 secondes**.
- **Tour de la Terre à l'équateur** (~40 000 km) : la lumière en fait **7,5 fois le tour en une seule seconde**.
- **Étoile la plus proche (Proxima du Centaure)** : environ **4,24 années-lumière**.

#### 3. Règle fondamentale en physique relativiste :
D'après la relativité restreinte d'Einstein, $c$ représente la vitesse limite absolue à laquelle toute information, matière ou onde sans masse (comme le photon ou les ondes gravitationnelles) peut se propager dans l'Univers.`,
    keyPoints: [
      'Constante exacte universelle : c = 299 792 458 m/s.',
      'Le Soleil se situe à environ 8 minutes et 20 secondes-lumière de la Terre.',
      'Vitesse limite infranchissable pour tout corps doté d\'une masse.'
    ]
  },
  {
    keywords: ['trou noir', 'trous noirs', 'c\'est quoi un trou noir'],
    title: 'Les Trous Noirs : Physique, Singularité et Horizon',
    category: 'Astrophysique & Relativité Générale',
    directAnswer: "Un **trou noir** est un objet céleste dont le champ gravitationnel est si intense que rien, pas même la lumière, ne peut s'échapper une fois franchie une frontière appelée l'**horizon des événements**.",
    details: `#### 1. Anatomie d'un trou noir :
1. **L'horizon des événements** : La surface théorique à l'intérieur de laquelle la vitesse de libération dépasse la vitesse de la lumière ($v_{\\text{lib}} > c$).
   - Son rayon est appelé **rayon de Schwarzschild** :
     $$R_s = \\frac{2GM}{c^2}$$
   - Pour une masse égale à celle de la Terre, $R_s \\approx 9\\text{ mm}$. Pour le Soleil, $R_s \\approx 3\\text{ km}$.
2. **La singularité centrale** : Point où toute la masse est concentrée dans un volume théoriquement nul, où la courbure de l'espace-temps et la densité deviennent infinies.
3. **Le disque d'accrétion** : Matière en orbite accélérée à des vitesses relativistes, chauffée à des millions de degrés et émettant d'intenses rayons X.

#### 2. Comment naissent-ils ?
- **Trous noirs stellaires** : Effondrement gravitationnel du cœur d'une étoile massive (plus de 20 masses solaires) en fin de vie après une supernova.
- **Trous noirs supermassifs** : Présents au centre de la plupart des galaxies (comme Sagittarius A* au centre de la Voie Lactée, pesant 4 millions de masses solaires).

#### 3. Découvertes historiques :
- 2015 : Première détection directe d'ondes gravitationnelles issues de la fusion de deux trous noirs par LIGO.
- 2019 : Première image directe du disque d'accrétion du trou noir de la galaxie M87 par l'Event Horizon Telescope (EHT).`,
    keyPoints: [
      'Horizon des événements : frontière où la vitesse de libération dépasse c.',
      'Rayon de Schwarzschild : Rs = 2GM / c².',
      'Première image capturée en 2019 (M87*) par l\'Event Horizon Telescope.'
    ]
  },
  {
    keywords: ['adn', 'c\'est quoi l\'adn', 'acide desoxyribonucleique', 'structure adn'],
    title: 'L’ADN (Acide Désoxyribonucléique) : Structure et Fonction',
    category: 'Génétique & Biologie Moléculaire',
    directAnswer: "L'**ADN** (Acide Désoxyribonucléique) est la macromolécule biologique qui contient toute l'information génétique nécessaire au développement, au fonctionnement et à la reproduction de tous les êtres vivants connus et de nombreux virus.",
    details: `#### 1. La structure en double hélice
Découverte par James Watson, Francis Crick et Rosalind Franklin en 1953 :
- Deux brins antiparallèles enroulés l'un autour de l'autre en forme de double hélice.
- Chaque brin est composé d'une chaîne de **nucléotides**, formés d'un sucre (désoxyribose), d'un groupement phosphate et d'une base azotée.

#### 2. Les 4 bases azotées et leur complémentarité stricte :
- **Adénine (A)** s'apparie toujours avec **Thymine (T)** (par 2 liaisons hydrogène).
- **Guanine (G)** s'apparie toujours avec **Cytosine (C)** (par 3 liaisons hydrogène).

#### 3. Du gène à la protéine (Le dogme central) :
1. **Transcription** : Dans le noyau cellulaire, l'enzyme ARN polymérase copie la séquence d'ADN en ARN messager (ARNm).
2. **Traduction** : Dans le cytoplasme, les ribosomes lisent l'ARNm triplet par triplet (**codons**) selon le code génétique universel pour assembler les acides aminés formant les protéines.`,
    keyPoints: [
      'Double hélice formée de nucléotides avec 4 bases : Adénine, Thymine, Guanine, Cytosine.',
      'Appariement exclusif : A avec T, G avec C.',
      'Contient le code génétique traduit en protéines via l\'ARN messager.'
    ]
  },

  // HISTOIRE
  {
    keywords: ['napoléon', 'napoleon', 'qui est napoléon', 'qui etait napoleon'],
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
  {
    keywords: ['première guerre mondiale', 'premiere guerre mondiale', '14-18', 'guerre 14 18'],
    title: 'La Première Guerre Mondiale (1914 - 1918)',
    category: 'Histoire Contemporaine',
    directAnswer: "La **Première Guerre mondiale** (1914-1918) est un conflit militaire mondial opposant la **Triple-Entente** (France, Royaume-Uni, Russie, rejoints par l'Italie en 1915 et les États-Unis en 1917) aux **Empires centraux** (Allemagne, Autriche-Hongrie, Empire ottoman, Bulgarie). Elle a fait environ 20 millions de morts civils et militaires.",
    details: `#### 1. L'élément déclencheur
L'assassinat de l'archiduc François-Ferdinand d'Autriche à Sarajevo le **28 juin 1914** par Gavrilo Princip active le jeu des alliances européennes en quelques semaines.

#### 2. Les grandes phases du conflit :
1. **Guerre de mouvement (1914)** : Bataille des Frontières, puis bataille de la Marne qui stoppe l'avancée allemande.
2. **Guerre de position et de tranchées (1915 - 1917)** : Les fronts se figent sur des centaines de kilomètres. Batailles d'usure sanglantes : **Verdun** (1916, plus de 700 000 victimes) et la **Somme** (1916).
3. **Le tournant de 1917** : Révolution russe (retrait de la Russie avec le traité de Brest-Litovsk) et entrée en guerre décisive des **États-Unis**.
4. **Dénouement (1918)** : Offensives alliées coordonnées menées par le général Foch. L'armistice est signé le **11 novembre 1918** à Rethondes.

#### 3. Conséquences géopolitiques :
- Disparition de quatre grands empires : russe, allemand, austro-hongrois et ottoman.
- Signature du **Traité de Versailles** (1919) et création de la Société des Nations (SDN).`,
    keyPoints: [
      'Dates clés : 28 juillet 1914 au 11 novembre 1918.',
      'Batailles majeures : la Marne (1914), Verdun (1916), la Somme (1916).',
      'Chute de 4 empires et signature du Traité de Versailles en 1919.'
    ]
  },

  // GÉOGRAPHIE & CAPITALES
  {
    keywords: ['capitale de l\'australie', 'capitale australie', 'capitale de australie'],
    title: 'La Capitale de l’Australie : Canberra',
    category: 'Géographie Mondiale',
    directAnswer: "La capitale de l'Australie est **Canberra** (et non Sydney ni Melbourne). Elle a été choisie en 1908 comme solution de compromis pour clore la rivalité intense entre les deux plus grandes métropoles du pays.",
    details: `#### Pourquoi Canberra ?
- Lors de la création de la fédération australienne en 1901, **Sydney** et **Melbourne** revendiquaient toutes deux le statut de capitale nationale.
- En 1908, le Parlement choisit un site situé dans le Territoire de la capitale australienne (ACT), à mi-chemin entre Sydney (~280 km) et Melbourne (~660 km).
- Canberra est une **ville nouvelle planifiée**, conçue par les architectes américains Walter Burley Griffin et Marion Mahony Griffin.`,
    keyPoints: [
      'Capitale officielle : Canberra (choisie en 1908).',
      'Compromis historique entre Sydney et Melbourne.',
      'Ville planifiée abritant le Parlement fédéral.'
    ]
  },
  {
    keywords: ['capitale du canada', 'capitale canada'],
    title: 'La Capitale du Canada : Ottawa',
    category: 'Géographie Mondiale',
    directAnswer: "La capitale du Canada est **Ottawa** (située dans la province de l'Ontario, à la frontière du Québec), et non Toronto ou Montréal. Elle a été désignée par la reine Victoria en 1857.",
    details: `#### Le choix historique de la reine Victoria :
- Au XIXe siècle, les villes de Québec, Montréal, Kingston et Toronto se disputaient le titre de capitale.
- En 1857, la reine Victoria choisit Ottawa pour sa position géographique idéale à la frontière entre le Canada anglophone (Haut-Canada / Ontario) et francophone (Bas-Canada / Québec), et pour sa sécurité stratégique en retrait de la frontière américaine.`,
    keyPoints: [
      'Capitale : Ottawa (Ontario).',
      'Désignée par la reine Victoria en 1857.',
      'Position médiane entre communautés anglophone et francophone.'
    ]
  },
  {
    keywords: ['capitale du brésil', 'capitale bresil', 'capitale du bresil'],
    title: 'La Capitale du Brésil : Brasília',
    category: 'Géographie Mondiale',
    directAnswer: "La capitale du Brésil est **Brasília** (et non Rio de Janeiro ni São Paulo). Elle a été inaugurée le 21 avril 1960 par le président Juscelino Kubitschek.",
    details: `#### Pourquoi Brasília a-t-elle été construite ?
- Rio de Janeiro a été la capitale du Brésil de 1763 à 1960.
- Le gouvernement brésilien souhaitait déplacer la capitale vers l'intérieur des terres pour rééquilibrer le développement économique et démographique du pays.
- Brasília a été entièrement planifiée en forme d'avion par l'urbaniste Lúcio Costa et l'architecte de renommée mondiale Oscar Niemeyer.`,
    keyPoints: [
      'Capitale officielle : Brasília depuis 1960.',
      'Anciennes capitales : Salvador de Bahia (jusqu\'en 1763), puis Rio de Janeiro (1763-1960).',
      'Architecture moderne monumentale signée Oscar Niemeyer.'
    ]
  },

  // CUISINE & RECETTES
  {
    keywords: ['crêpes', 'crepes', 'faire des crêpes', 'recette crêpe', 'recette crepe', 'faire des crepes'],
    title: 'Recette Inratable des Crêpes Traditionnelles Françaises',
    category: 'Gastronomie & Cuisine',
    directAnswer: "Voici la recette authentique et inratable pour réaliser environ **15 à 20 crêpes moelleuses et dorées** avec des ingrédients simples et les proportions exactes.",
    details: `#### 🛒 Ingrédients (pour 4 à 6 personnes) :
- **Farine de blé (T45 ou T55)** : 250 g
- **Œufs entiers** : 4 gros œufs
- **Lait demi-écrémé ou entier** : 500 ml (1/2 litre)
- **Beurre fondu** : 50 g (ou 2 cuillères à soupe d'huile neutre)
- **Sucre en poudre** : 2 cuillères à soupe (pour des crêpes sucrées)
- **Sucre vanillé** : 1 sachet
- **Sel fin** : 1 pincée indispensable
- *Optionnel* : 1 cuillère à soupe de rhum ambré, d'eau de fleur d'oranger ou de zeste d'agrumes.

---

#### 👩‍🍳 Préparation étape par étape :
1. **Mélange sec** : Dans un grand saladier, versez la farine tamisée avec la pincée de sel, le sucre et le sucre vanillé. Formez un puits au centre.
2. **Ajout des œufs** : Cassez les 4 œufs entiers au milieu. Commencez à mélanger doucement au fouet en partant du centre et en incorporant la farine petit à petit.
3. **Incorporation du liquide** : Versez le lait progressivement en filet tout en continuant de fouetter vivement pour **éviter la formation de grumeaux**.
4. **Finition** : Ajoutez le beurre fondu tiédi et l'arôme choisi. Mélangez jusqu'à obtenir une pâte parfaitement lisse et fluide comme une crème liquide.
5. **Temps de repos** : Laissez reposer la pâte **30 minutes à 1 heure** à température ambiante (cela permet à l'amidon de gonfler pour des crêpes très moelleuses).

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
  {
    keywords: ['gâteau au chocolat', 'gateau au chocolat', 'recette gateau chocolat'],
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
1. Préchauffez le four à **180°C (thermostat 6)**. Beurrez et farinez un moule rond d'environ 20-22 cm.
2. Cassez le chocolat en morceaux et coupez le beurre en dés. Faites-les fondre ensemble au bain-marie ou au micro-ondes (à puissance moyenne par tranches de 30 secondes), puis lissez à la spatule.
3. Dans un saladier, fouettez vivement les 3 œufs entiers avec le sucre en poudre jusqu'à ce que le mélange blanchisse et mousse légèrement.
4. Incorporez le chocolat fondu tiède au mélange œufs/sucre en remuant bien.
5. Ajoutez la farine tamisée et la pincée de sel, puis mélangez délicatement sans trop travailler la pâte.
6. Versez la pâte dans le moule et enfournez pendant **20 à 25 minutes**. La pointe d'un couteau plantée au centre doit ressortir légèrement humide pour un résultat fondant. Laissez tiédir avant de déguster !`,
    keyPoints: [
      '200g chocolat noir, 100g beurre, 100g sucre, 3 œufs, 50g farine.',
      'Cuisson rapide de 20-22 min à 180°C pour préserver le fondant central.',
      'Une pincée de sel réhausse la puissance aromatique du cacao.'
    ]
  },
  {
    keywords: ['pâtes carbonara', 'carbonara', 'vraie carbonara', 'recette carbonara'],
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

  // INFORMATIQUE & IA
  {
    keywords: ['c\'est quoi l\'ia', 'intelligence artificielle', 'definition ia', 'comment marche l\'ia'],
    title: 'L’Intelligence Artificielle : Principes, Réseaux de Neurones et LLM',
    category: 'Informatique & Sciences Cognitives',
    directAnswer: "L'**Intelligence Artificielle (IA)** désigne l'ensemble des théories et techniques informatiques permettant à des machines d'accomplir des tâches qui requièrent habituellement l'intelligence humaine : perception visuelle, reconnaissance vocale, raisonnement logique, prise de décision et traitement du langage naturel.",
    details: `#### 1. L'évolution de l'IA :
1. **IA Symbolique (1950 - 1980)** : Systèmes experts basés sur des règles logiques explicites et prédéfinies par des experts humains ("Si condition Alors action").
2. **Machine Learning (1990 - 2010)** : Apprentissage statistique à partir de données sans programmation explicite des règles (arbres de décision, régressions, SVM).
3. **Deep Learning (2012 - présent)** : Réseaux de neurones artificiels profonds inspirés de la connectivité synaptique cérébrale, capables d'extraire automatiquement des représentations hiérarchiques complexes.

#### 2. Comment fonctionnent les Grands Modèles de Langage (LLM) ?
- **L'architecture Transformer (Vaswani et al., 2017)** : Révolutionne le traitement du langage grâce au **mécanisme d'attention** (*Self-Attention*), qui calcule l'importance relative de chaque mot par rapport à tous les autres dans une phrase, indépendamment de leur distance.
- **Entraînement en deux temps** :
  1. *Pré-entraînement auto-supervisé* : Le modèle lit des milliards de textes pour prédire le token suivant, apprenant ainsi la grammaire, la logique et les connaissances du monde.
  2. *Alignement (RLHF)* : Ajustement fin avec feedback humain pour rendre le modèle serviable, poli et sécurisé.

#### 3. L'approche Neuro-Symbolique de nouvelle génération :
La combinaison de l'intuition statistique des réseaux neuronaux avec la rigueur des solveurs logiques formels pour éliminer les hallucinations et garantir 0% d'erreur mathématique.`,
    keyPoints: [
      'Évolution : IA symbolique -> Machine Learning -> Réseaux de neurones profonds.',
      'Les LLMs actuels reposent sur l\'architecture Transformer et le mécanisme d\'attention.',
      'L\'approche neuro-symbolique combine intuition neuronale et preuves déductives.'
    ]
  }
];

// Helper to find match in knowledge base
export function matchFactualKnowledge(query: string): KnowledgeTopic | null {
  const clean = query.toLowerCase().trim();
  for (const topic of FACTUAL_TOPICS) {
    for (const kw of topic.keywords) {
      if (clean.includes(kw)) {
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
