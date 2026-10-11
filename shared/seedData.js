// Joueurs et jeux de depart : utilises par le serveur (classement mondial) et
// par le navigateur quand le serveur en ligne n'est pas joignable.

export const SEED_USERS = [
  { name: 'Rayan', avatar: '🦊', grade: 'CM2', elo: 1310, ryos: 7250, streak: 12 },
  { name: 'Lina', avatar: '🦋', grade: 'CE2', elo: 1245, ryos: 5120, streak: 8 },
  { name: 'Adam', avatar: '🐯', grade: '5E', elo: 1402, ryos: 11840, streak: 21 },
  { name: 'Inaya', avatar: '🦄', grade: 'CM1', elo: 1188, ryos: 3960, streak: 5 },
  { name: 'Nolan', avatar: '🐉', grade: '4E', elo: 1367, ryos: 9410, streak: 15 },
  { name: 'Sofia', avatar: '🐧', grade: 'CE1', elo: 1092, ryos: 2180, streak: 3 },
  { name: 'Yanis', avatar: '🦈', grade: '3E', elo: 1489, ryos: 15620, streak: 27 },
  { name: 'Aïcha', avatar: '🐝', grade: '6E', elo: 1266, ryos: 6140, streak: 9 },
  { name: 'Lucas', avatar: '🐺', grade: 'CM2', elo: 1211, ryos: 4470, streak: 6 },
  { name: 'Maya', avatar: '🐼', grade: 'CP', elo: 1043, ryos: 1490, streak: 2 },
  { name: 'Ilyes', avatar: '🦅', grade: '5E', elo: 1338, ryos: 8830, streak: 18 },
  { name: 'Jade', avatar: '🐨', grade: 'CE2', elo: 1157, ryos: 3320, streak: 4 },
  { name: 'Karim', avatar: '🐙', grade: '4E', elo: 1421, ryos: 12980, streak: 24 },
  { name: 'Emma', avatar: '🦉', grade: 'CM1', elo: 1229, ryos: 5610, streak: 11 },
  { name: 'Noah', avatar: '🐢', grade: '6E', elo: 1180, ryos: 3810, streak: 7 },
  { name: 'Sarah', avatar: '🐰', grade: '3E', elo: 1451, ryos: 14230, streak: 19 },
  { name: 'Mehdi', avatar: '🦁', grade: 'CM2', elo: 1278, ryos: 6720, streak: 10 },
  { name: 'Léa', avatar: '🐳', grade: 'CE1', elo: 1076, ryos: 1860, streak: 3 },
  { name: 'Amir', avatar: '🐻', grade: '5E', elo: 1355, ryos: 9105, streak: 16 },
  { name: 'Nour', avatar: '🐸', grade: 'GS', elo: 1010, ryos: 860, streak: 2 },
  { name: 'Zayd', avatar: '🐝', grade: '6E', elo: 1241, ryos: 5320, streak: 8 },
  { name: 'Célia', avatar: '🦋', grade: 'CM1', elo: 1203, ryos: 4120, streak: 6 },
  { name: 'Bilal', avatar: '🐯', grade: '4E', elo: 1395, ryos: 11020, streak: 22 },
  { name: 'Manon', avatar: '🦄', grade: 'CE2', elo: 1132, ryos: 2740, streak: 5 }
];

const q = (prompt, choices, answer, explanation) => ({ prompt, choices, answer, explanation });

export const SEED_GAMES = [
  {
    id: 'seed-tables',
    title: 'Les tables de multiplication en folie',
    subject: 'maths',
    grades: ['CE2', 'CM1', 'CM2'],
    difficulty: 'moyen',
    authorId: 'seed_matthieu',
    authorName: 'SenseiMatthieu',
    createdAt: Date.now() - 86400000 * 12,
    plays: 412,
    likes: 87,
    questions: [
      q('7 × 8 = ?', ['56', '54', '63', '48'], 0, '7 × 8 = 56.'),
      q('9 × 6 = ?', ['54', '56', '45', '63'], 0, '9 × 6 = 54.'),
      q('12 × 4 = ?', ['48', '44', '52', '36'], 0, '12 × 4 = 48.'),
      q('6 × 9 = ?', ['54', '56', '48', '45'], 0, '6 × 9 = 54.'),
      q('8 × 8 = ?', ['64', '72', '56', '68'], 0, '8 × 8 = 64.'),
      q('7 × 7 = ?', ['49', '42', '56', '47'], 0, '7 × 7 = 49.'),
      q('11 × 11 = ?', ['121', '111', '122', '132'], 0, '11 × 11 = 121.'),
      q('5 × 12 = ?', ['60', '55', '65', '50'], 0, '5 × 12 = 60.')
    ]
  },
  {
    id: 'seed-ortho',
    title: 'Dictée express : les homophones',
    subject: 'francais',
    grades: ['CE2', 'CM1', 'CM2', '6E'],
    difficulty: 'moyen',
    authorId: 'seed_amel',
    authorName: 'MaitresseAmel',
    createdAt: Date.now() - 86400000 * 8,
    plays: 268,
    likes: 64,
    questions: [
      q('Il ___ un joli vélo rouge.', ['a', 'à', 'as', 'ha'], 0, '« a » = verbe avoir.'),
      q('Je vais ___ la piscine.', ['à', 'a', 'as', 'ah'], 0, '« à » = préposition.'),
      q('Ils ___ très contents.', ['sont', 'son', 'sons', 's’ont'], 0, '« sont » = être au pluriel.'),
      q('Elle a perdu ___ cartable.', ['son', 'sont', 'sons', 'son’t'], 0, '« son » = possessif.'),
      q('___ tu viens, on joue.', ['Si', 'S’il', 'Ci', 'Sis'], 0, '« Si » = condition.'),
      q('Elle ___ trompée de chemin.', ['s’est', 'c’est', 'ses', 'ces'], 0, '« s’est » = pronominal.')
    ]
  },
  {
    id: 'seed-sciences',
    title: 'Le corps humain — défi sciences',
    subject: 'sciences',
    grades: ['CM1', 'CM2', '6E', '5E'],
    difficulty: 'moyen',
    authorId: 'seed_karim',
    authorName: 'ProfessorKarim',
    createdAt: Date.now() - 86400000 * 5,
    plays: 194,
    likes: 51,
    questions: [
      q('Combien d’os compte le squelette humain adulte ?', ['206', '186', '256', '300'], 0, 'Le corps adulte compte 206 os.'),
      q('Quel organe filtre le sang ?', ['les reins', 'l’estomac', 'les poumons', 'le cœur'], 0, 'Les reins filtrent le sang.'),
      q('Quel gaz respirons-nous pour vivre ?', ['le dioxygène', 'le dioxyde de carbone', 'l’azote', 'l’hélium'], 0, 'Nous avons besoin de dioxygène (O₂).'),
      q('Combien de dents a un adulte ?', ['32', '28', '24', '36'], 0, 'Un adulte a 32 dents.'),
      q('Quel muscle permet de respirer ?', ['le diaphragme', 'le biceps', 'le mollet', 'le tendon'], 0, 'Le diaphragme est le muscle de la respiration.'),
      q('Combien de chambres a le cœur ?', ['4', '2', '3', '6'], 0, 'Le cœur a 2 oreillettes et 2 ventricules.')
    ]
  },
  {
    id: 'seed-histoire',
    title: 'Voyage dans l’Histoire de France',
    subject: 'histoire',
    grades: ['CM2', '6E', '5E', '4E', '3E'],
    difficulty: 'difficile',
    authorId: 'seed_ines',
    authorName: 'DocteurInes',
    createdAt: Date.now() - 86400000 * 3,
    plays: 143,
    likes: 39,
    questions: [
      q('Qui était le « Roi-Soleil » ?', ['Louis XIV', 'Louis XV', 'Henri IV', 'Napoléon'], 0, 'Louis XIV était le Roi-Soleil.'),
      q('En quelle année la Révolution française a-t-elle commencé ?', ['1789', '1799', '1776', '1815'], 0, 'La Révolution débute en 1789.'),
      q('Quel empereur a été vaincu à Waterloo ?', ['Napoléon', 'César', 'Charlemagne', 'Louis XVI'], 0, 'Napoléon est vaincu à Waterloo en 1815.'),
      q('Qui a unifié les Francs ?', ['Clovis', 'Vercingétorix', 'Charlemagne', 'Philippe Auguste'], 0, 'Clovis, roi des Francs.'),
      q('En quelle année le mur de Berlin est-il tombé ?', ['1989', '1991', '1961', '1975'], 0, 'Le 9 novembre 1989.')
    ]
  },
  {
    id: 'seed-anglais',
    title: 'English Warm-up : les bases',
    subject: 'anglais',
    grades: ['CE2', 'CM1', 'CM2', '6E', '5E'],
    difficulty: 'facile',
    authorId: 'seed_tom',
    authorName: 'TeacherTom',
    createdAt: Date.now() - 86400000 * 2,
    plays: 122,
    likes: 33,
    questions: [
      q('Que veut dire « I am hungry » ?', ['J’ai faim', 'J’ai chaud', 'Je suis fatigué', 'J’ai soif'], 0, 'Hungry = avoir faim.'),
      q('Quel est le pluriel de « box » ?', ['boxes', 'boxs', 'boxies', 'box'], 0, 'On ajoute -es après x.'),
      q('« She ___ a cat »', ['has', 'have', 'is have', 'haves'], 0, 'À la 3e personne : has.'),
      q('Que veut dire « tomorrow » ?', ['demain', 'hier', 'aujourd’hui', 'plus tard'], 0, 'Tomorrow = demain.'),
      q('Traduis « sept » en anglais.', ['seven', 'seaven', 'sevin', 'sevenn'], 0, 'Seven = 7.')
    ]
  },
  {
    id: 'seed-maternelle',
    title: 'Éveil maternelle : animaux et couleurs',
    subject: 'sciences',
    grades: ['MS', 'GS', 'CP'],
    difficulty: 'facile',
    authorId: 'seed_amina',
    authorName: 'NounouAmina',
    createdAt: Date.now() - 86400000,
    plays: 89,
    likes: 27,
    questions: [
      q('Quelle est la couleur du soleil ?', ['jaune', 'bleu', 'violet', 'noir'], 0, 'Le soleil est jaune.'),
      q('Quel animal fait « coin-coin » ?', ['le canard', 'le chat', 'la souris', 'le mouton'], 0, 'Le canard fait coin-coin.'),
      q('Combien de pattes a un chat ?', ['4', '2', '6', '8'], 0, 'Le chat a 4 pattes.'),
      q('Où nage le poisson ?', ['dans l’eau', 'dans le sable', 'dans un arbre', 'dans une boîte'], 0, 'Le poisson nage dans l’eau.')
    ]
  }
];
