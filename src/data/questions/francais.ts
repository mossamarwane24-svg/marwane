import type { GradeId } from '../../types';
import { mk, type RawQ } from './maths';

const q = mk;
const pickOne = <T,>(a: T[]): T => a[Math.floor(Math.random() * a.length)];
const rint = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

// ---------------------------------------------------------------------------
// FRANCAIS — questions ecrites a la main, par classe
// ---------------------------------------------------------------------------

const MS: RawQ[] = [
  q('Quelle est la première lettre de l’alphabet ?', 'A', ['B', 'C', 'D'], 'L’alphabet commence par A, B, C, D…', 1),
  q('Combien de syllabes entends-tu dans « papa » ?', '2', ['1', '3', '4'], 'Pa-pa : on entend 2 syllabes.', 1),
  q('Quel mot rime avec « chat » ?', 'rat', ['chien', 'lit', 'sac'], 'Chat et rat se terminent par le même son [a].', 1),
  q('Combien de lettres dans le mot « rat » ?', '3', ['2', '4', '5'], 'R-a-t : 3 lettres.', 1),
  q('Quelle lettre vient juste après A ?', 'B', ['Z', 'D', 'O'], 'Dans l’alphabet : A puis B.', 1),
  q('Quel mot commence par le son [s] ?', 'soleil', ['lune', 'table', 'maison'], 'Soleil commence par le son [s].', 1),
  q('Quelle est la première lettre du mot « Lune » ?', 'L', ['U', 'N', 'E'], 'Lune commence par L.', 1),
  q('Quel mot est le plus long ?', 'éléphant', ['chat', 'oie', 'rat'], 'Éléphant a 8 lettres, c’est le plus long.', 2),
  q('Quelle lettre est une voyelle ?', 'a', ['b', 't', 'm'], 'Les voyelles sont a, e, i, o, u, y.', 2),
  q('Combien de mots dans la phrase « Le chat dort. » ?', '3', ['2', '4', '5'], 'Le / chat / dort = 3 mots.', 2),
  q('Quel mot commence comme « bébé » ?', 'bateau', ['maison', 'lune', 'table'], 'Bébé et bateau commencent par le son [b].', 1),
  q('Combien de syllabes dans « gâteau » ?', '2', ['1', '3', '4'], 'Gâ-teau : on entend 2 syllabes.', 2),
  q('Quelle est la dernière lettre de « chat » ?', 't', ['a', 'c', 'h'], 'C-h-a-t : la dernière lettre est t.', 1),
  q('Quel animal fait « miaou » ?', 'le chat', ['le chien', 'la vache', 'le mouton'], 'Le chat miaule.', 1),
  q('Quel mot rime avec « main » ?', 'pain', ['chat', 'lune', 'table'], 'Main et pain se terminent par le même son.', 2),
  q('Combien de lettres dans « lune » ?', '4', ['3', '5', '2'], 'L-u-n-e : 4 lettres.', 1),
  q('Quel est le contraire de « grand » ?', 'petit', ['gros', 'long', 'haut'], 'Grand ↔ petit.', 1),
  q('Quel est le contraire de « chaud » ?', 'froid', ['bleu', 'dur', 'vite'], 'Chaud ↔ froid.', 1),
  q('Quelle couleur obtient-on en mélangeant du bleu et du jaune ?', 'du vert', ['du rouge', 'du noir', 'du blanc'], 'Bleu + jaune donne du vert.', 2),
  q('Combien de pattes a un chat ?', '4', ['2', '6', '3'], 'Le chat a 4 pattes.', 1),
  q('Comment appelle-t-on le bébé du chat ?', 'un chaton', ['un chiot', 'un veau', 'un poussin'], 'Le bébé du chat est un chaton.', 2),
  q('Lequel est un fruit ?', 'la pomme', ['la carotte', 'le chapeau', 'la chaise'], 'La pomme est un fruit.', 1),
  q('Lequel est un vêtement ?', 'le manteau', ['la banane', 'la chaise', 'le crayon'], 'Le manteau est un vêtement.', 1),
  q('Où vit le poisson ?', 'dans l’eau', ['dans un arbre', 'dans le ciel', 'dans une maison'], 'Le poisson vit dans l’eau.', 1),
  q('Quel cri fait la vache ?', 'meuh', ['miaou', 'ouaf', 'cot cot'], 'La vache fait « meuh ».', 1),
  q('Combien de mots dans « Papa joue. » ?', '2', ['1', '3', '4'], 'Papa / joue = 2 mots.', 2),
  q('Quelle lettre vient juste après M ?', 'N', ['L', 'O', 'P'], 'Dans l’alphabet, après M vient N.', 2),
  q('Lequel commence par la lettre « m » ?', 'la maison', ['la table', 'le soleil', 'la lune'], 'Maison commence par la lettre m.', 1),
  q('Lequel est le mot le plus court ?', 'le rat', ['l’éléphant', 'la girafe', 'le papillon'], 'Rat ne fait que 3 lettres.', 2),
  q('Que fait-on avec un crayon ?', 'on écrit', ['on mange', 'on dort', 'on court'], 'Un crayon sert à écrire.', 1),
  q('Quel mot rime avec « gâteau » ?', 'le bateau', ['le chat', 'la lune', 'la main'], 'Gâteau et bateau riment.', 2),
  q('Combien de syllabes dans « banane » ?', '3', ['2', '4', '1'], 'Ba-na-ne : 3 syllabes.', 2)
];

const GS: RawQ[] = [
  q('Combien de lettres dans le mot « maison » ?', '6', ['5', '7', '4'], 'm-a-i-s-o-n = 6 lettres.', 1),
  q('Quelle lettre n’est pas une voyelle ?', 'b', ['a', 'e', 'o'], 'a, e, o sont des voyelles ; b est une consonne.', 2),
  q('Quel mot rime avec « lune » ?', 'prune', ['table', 'chat', 'vélo'], 'Lune et prune riment.', 1),
  q('Quel mot commence par « ch » ?', 'chocolat', ['sapin', 'tomate', 'gâteau'], 'Chocolat commence par ch.', 1),
  q('« un chat, deux ... »', 'chats', ['chat', 'chate', 'chatses'], 'Pour le pluriel, on ajoute un s : des chats.', 2),
  q('Combien de syllabes dans « poupée » ?', '2', ['1', '3', '4'], 'Pou-pée : 2 syllabes.', 2),
  q('Quelle syllabe manque ? ma – ? – son', 'i', ['o', 'a', 'u'], 'Maison = ma-i-son.', 2),
  q('Quelle est la dernière lettre de « bateau » ?', 'u', ['b', 'e', 'a'], 'B-a-t-e-a-u : la dernière lettre est u.', 2),
  q('Combien de mots dans la phrase « La lune brille. » ?', '3', ['2', '4', '1'], 'La / lune / brille = 3 mots.', 2),
  q('Quelle lettre est une consonne ?', 't', ['a', 'i', 'o'], 'a, i, o sont des voyelles ; t est une consonne.', 3),
  q('Combien de lettres dans « école » ?', '5', ['4', '6', '7'], 'É-c-o-l-e : 5 lettres.', 2),
  q('Quel mot rime avec « jardin » ?', 'le lapin', ['la maison', 'la table', 'le chat'], 'Jardin et lapin riment.', 2),
  q('Quelle syllabe manque ? cho – co – …', 'lat', ['lot', 'lit', 'let'], 'Cho-co-lat : la dernière syllabe est « lat ».', 2),
  q('Mets au pluriel : une fleur → …', 'des fleurs', ['des fleur', 'une fleurs', 'des fleures'], 'On ajoute un s : des fleurs.', 2),
  q('Quel est le contraire de « jour » ?', 'la nuit', ['le matin', 'le midi', 'le soir'], 'Le jour s’oppose à la nuit.', 1),
  q('Quel mot est bien écrit ?', 'école', ['ecole', 'écolle', 'écolee'], 'La bonne orthographe est « école ».', 2),
  q('Combien de syllabes dans « chocolat » ?', '3', ['2', '4', '5'], 'Cho-co-lat : 3 syllabes.', 2),
  q('Lequel commence par « br » ?', 'le bras', ['le crabe', 'le train', 'le drap'], 'Bras commence par br.', 3),
  q('Quel est le féminin de « un chat » ?', 'une chatte', ['une chat', 'un chatte', 'une chate'], 'Le féminin de chat est chatte.', 3),
  q('Lequel est un légume ?', 'la carotte', ['la pomme', 'la banane', 'la fraise'], 'La carotte est un légume.', 1),
  q('Quelle est la première lettre de « zèbre » ?', 'z', ['b', 'e', 's'], 'Zèbre commence par z.', 1),
  q('Combien de mots dans « Le chien court vite. » ?', '4', ['3', '5', '2'], 'Le / chien / court / vite = 4 mots.', 2),
  q('Quel mot rime avec « maison » ?', 'le poisson', ['le chat', 'la table', 'la lune'], 'Maison et poisson riment.', 2),
  q('Complète : « Je … à l’école. »', 'vais', ['va', 'vas', 'vont'], 'Avec « je », on écrit : je vais.', 3),
  q('Lequel est une couleur ?', 'le rouge', ['le rond', 'la roue', 'la rue'], 'Le rouge est une couleur.', 1),
  q('Quel est le contraire de « vite » ?', 'lentement', ['rapidement', 'bientôt', 'vite'], 'Vite ↔ lentement.', 2),
  q('Combien de lettres dans « poisson » ?', '7', ['6', '8', '5'], 'P-o-i-s-s-o-n : 7 lettres.', 3),
  q('Lequel commence comme « grenouille » ?', 'le gâteau', ['le chat', 'la lune', 'la main'], 'Grenouille et gâteau commencent par le son [g].', 2),
  q('Quelle est la première syllabe de « parasol » ?', 'pa', ['ra', 'sol', 'sau'], 'Pa-ra-sol : la première syllabe est « pa ».', 2),
  q('Quel animal a de grandes oreilles et saute ?', 'le lapin', ['le poisson', 'la poule', 'le chat'], 'Le lapin a de grandes oreilles et il saute.', 1),
  q('Avec quoi entend-on ?', 'les oreilles', ['les yeux', 'le nez', 'les mains'], 'On entend avec les oreilles.', 1),
  q('Lequel désigne plusieurs objets ?', 'des jouets', ['le jouet', 'un jouet', 'la jouet'], '« Des jouets » désigne plusieurs objets.', 2)
];

const CP: RawQ[] = [
  q('Complète : « ... maison est grande. »', 'La', ['Le', 'Les', 'Un'], '« Maison » est un nom féminin : la maison.', 1),
  q('Mets au pluriel : un chien → ...', 'des chiens', ['des chien', 'un chiens', 'les chien'], 'On ajoute un s au nom : des chiens.', 1),
  q('Quelle phrase est correcte ?', 'Le chat mange.', ['chat le mange.', 'Mange le chat il.', 'Le mange chat.'], 'L’ordre correct est : sujet + verbe.', 2),
  q('Combien de syllabes dans « ananas » ?', '3', ['2', '4', '5'], 'A-na-nas : 3 syllabes.', 2),
  q('Quel mot est un nom ?', 'table', ['manger', 'vite', 'joli'], 'Une table est un nom (une chose).', 2),
  q('Quel mot est un verbe d’action ?', 'courir', ['stylo', 'rouge', 'petit'], 'Courir est une action : c’est un verbe.', 2),
  q('Remets la phrase dans l’ordre : dort / le / chat', 'Le chat dort.', ['Dort le chat.', 'Chat le dort.', 'Le dort chat.'], 'Sujet puis verbe : Le chat dort.', 2),
  q('Quel est le féminin de « un ami » ?', 'une amie', ['une ami', 'un amie', 'des amies'], 'On ajoute un e : une amie.', 2),
  q('Quelle ponctuation termine une question ?', '?', ['.', '!', ','], 'On termine une question par un point d’interrogation : ?', 1),
  q('Quel mot est bien écrit ?', 'éléphant', ['elephent', 'éléfant', 'élèphant'], 'La bonne orthographe est « éléphant ».', 3),
  q('Complète avec le bon article : « ... école »', 'L’', ['Le', 'La', 'Les'], 'Devant une voyelle on écrit « l’ » : l’école.', 3)
];

const CE1: RawQ[] = [
  q('Conjugue au présent : « Je (chanter) » →', 'je chante', ['je chantes', 'je chanté', 'je chantons'], 'Avec « je », le verbe au présent se termine par -e : je chante.', 1),
  q('Mets au pluriel : un oiseau → ...', 'des oiseaux', ['des oiseaus', 'des oiseau', 'des oiseauxs'], 'Les mots en -eau font leur pluriel en -eaux.', 2),
  q('Complète : « Il ... un vélo. »', 'a', ['à', 'as', 'ha'], '« a » est le verbe avoir ; « à » est une préposition.', 2),
  q('Complète : « Hier, j’... mangé une pomme. »', 'ai', ['est', 'a', 'es'], 'Passé composé : j’ai mangé.', 2),
  q('Un synonyme de « joli » est :', 'beau', ['laid', 'grand', 'noir'], 'Beau et joli ont le même sens.', 2),
  q('Le contraire de « grand » est :', 'petit', ['gros', 'long', 'haut'], 'Grand ↔ petit.', 1),
  q('Quel mot est correctement orthographié ?', 'beaucoup', ['beacoup', 'beaucou', 'beau coup'], 'La bonne orthographe est « beaucoup ».', 3),
  q('Quel est le féminin de « instituteur » ?', 'institutrice', ['instituteure', 'institutrise', 'instituteur'], 'Le féminin est « institutrice ».', 3),
  q('Mets au pluriel : un cheval → ...', 'des chevaux', ['des chevals', 'des cheval', 'des chevaus'], 'Les mots en -al font souvent leur pluriel en -aux.', 3),
  q('Quel mot vient en premier dans le dictionnaire ?', 'avion', ['banane', 'cerise', 'dauphin'], 'L’ordre alphabétique commence par a : avion.', 1),
  q('Quel mot contient le son [o] ?', 'chocolat', ['lutin', 'ami', 'tulipe'], 'Chocolat contient le son [o].', 1)
];

const CE2: RawQ[] = [
  q('Conjugue à l’imparfait : « Nous (jouer) » →', 'nous jouions', ['nous jouons', 'nous jouerons', 'nous joué'], 'À l’imparfait : nous jouions.', 2),
  q('Complète : « Il ... content. »', 'est', ['et', 'es', 'ai'], '« est » est le verbe être ; « et » relie deux mots.', 1),
  q('Complète : « Ils ... partis. »', 'sont', ['son', 'sons', 'sonts'], '« sont » est le verbe être au pluriel.', 2),
  q('Quel est le sujet de « Les enfants jouent dans le jardin » ?', 'Les enfants', ['jouent', 'dans le jardin', 'le jardin'], 'On pose la question : qui joue ? Les enfants.', 2),
  q('Complète : « Elle a (finir) ses devoirs. »', 'fini', ['finis', 'finie', 'finir'], 'Après « a », le participe passé est « fini ».', 2),
  q('Conjugue au futur : « Demain, nous (partir) » →', 'nous partirons', ['nous partons', 'nous partirions', 'nous partions'], 'Futur simple : nous partirons.', 3),
  q('Quel mot est un adjectif ?', 'rouge', ['maison', 'courir', 'vite'], 'Rouge donne une information sur le nom : c’est un adjectif.', 2),
  q('Mets au pluriel : un journal → ...', 'des journaux', ['des journals', 'des journales', 'des journaus'], 'On écrit des journaux.', 3),
  q('Quel mot appartient à la famille de « terre » ?', 'terrestre', ['terminal', 'tarte', 'verre'], 'Terrestre vient de « terre ».', 3),
  q('Complète : « Je ne sais pas ... il est. »', 'où', ['ou', 'oux', 'hou'], '« où » avec accent indique le lieu.', 2),
  q('Quelle phrase est au pluriel ?', 'Les élèves lisent.', ['L’élève lit.', 'L’élève lira.', 'L’élève a lu.'], '« Les élèves lisent » est au pluriel.', 1)
];

const CM1: RawQ[] = [
  q('Complète au passé simple : « Il (finir) son travail. »', 'finit', ['fini', 'finissait', 'finira'], 'Passé simple : il finit.', 3),
  q('Complète : « Les fleurs ... belles. »', 'sont', ['est', 'es', 'était'], 'Le sujet est pluriel : les fleurs sont.', 2),
  q('Complète : « Il range ... jouets. »', 'ses', ['ces', 'c’est', 's’est'], '« ses » indique la possession (les siens).', 3),
  q('Dans « Il mange une pomme », le complément d’objet direct est :', 'une pomme', ['Il', 'mange', 'une'], 'COD : il mange quoi ? une pomme.', 2),
  q('Accorde : « des maisons (blanc) » →', 'blanches', ['blanc', 'blancs', 'blanque'], 'Féminin pluriel : des maisons blanches.', 2),
  q('Quel préfixe signifie « avant » ?', 'pré-', ['anti-', 'trans-', 'dé-'], '« pré- » signifie avant (préhistoire).', 3),
  q('Dans « Nous partons demain », « demain » est un complément :', 'circonstanciel de temps', ['d’objet direct', 'du nom', 'd’agent'], 'Il indique quand : complément circonstanciel de temps.', 3),
  q('Conjugue au futur : « J’(avoir) un vélo. » →', 'j’aurai', ['j’avais', 'j’ai', 'j’aurais'], 'Futur simple : j’aurai.', 3),
  q('Complète : « Ils parlent à ... parents. »', 'leurs', ['leur', 'leur’s', 'leures'], 'Devant un nom au pluriel on écrit « leurs ».', 2),
  q('Quel est le verbe conjugué dans « Il a couru vite » ?', 'a couru', ['vite', 'Il', 'couru vite'], 'Le verbe est au passé composé : a couru.', 2),
  q('Un synonyme de « content » est :', 'joyeux', ['triste', 'fatigué', 'fâché'], 'Joyeu x et content expriment le même sentiment.', 1)
];

const CM2: RawQ[] = [
  q('Complète : « J’(avoir) déjà mangé. » (plus-que-parfait)', 'avais', ['ai', 'aurai', 'aie'], 'Plus-que-parfait : j’avais mangé.', 3),
  q('Dans « Il pleuvait quand soudain il partit », quelle action est au passé simple ?', 'il partit', ['il pleuvait', 'soudain', 'quand'], 'L’action brève au passé simple : il partit.', 3),
  q('Accorde : « Elles sont (partir) tôt. »', 'parties', ['parti', 'partis', 'partie'], 'Avec être, le participe s’accorde : elles sont parties.', 3),
  q('Complète : « ... heure est-il ? »', 'Quelle', ['Quel', 'Qu’elle', 'Quels'], 'Accord avec « heure » (féminin) : quelle heure.', 3),
  q('Dans « le chat de ma voisine », le complément du nom est :', 'de ma voisine', ['le chat', 'ma', 'voisine seulement'], '« de ma voisine » complète le nom « chat ».', 3),
  q('Dans « Il parle à sa sœur », le groupe souligné est :', 'un complément d’objet indirect', ['un complément d’objet direct', 'un sujet', 'un complément de lieu'], 'Il parle à qui ? À sa sœur : COI.', 3),
  q('Quel mot est correctement orthographié ?', 'professionnel', ['profesionel', 'proffessionnel', 'profesionnell'], 'On écrit « professionnel » avec deux n.', 3),
  q('Complète : « Il ... son manteau. »', 'met', ['mais', 'mes', 'm’est'], 'Le verbe mettre : il met.', 2),
  q('Impératif de « aller » à la 2e personne du pluriel :', 'allez', ['alliez', 'allez-y', 'irons'], 'Impératif présent : allez !', 2),
  q('Quel est le suffixe de « rapidement » ?', '-ment', ['rap-', '-ide', '-ard'], 'Le suffixe -ment forme un adverbe.', 2),
  q('Quel mot est un verbe au participe passé ?', 'chanté', ['chanter', 'chante', 'chantais'], 'Chanté est le participe passé du verbe chanter.', 2)
];

const SIXIEME: RawQ[] = [
  q('Dans « la maison », quelle est la nature de « la » ?', 'un déterminant', ['un pronom', 'une préposition', 'un adverbe'], '« la » est un article défini, donc un déterminant.', 2),
  q('Complète : « Elle ... lève tôt. »', 'se', ['ce', 's’est', 'c’est'], 'Verbe pronominal : elle se lève.', 2),
  q('Quel temps est utilisé dans « Il prit son sac » ?', 'le passé simple', ['l’imparfait', 'le passé composé', 'le futur'], 'Prit est le passé simple de prendre.', 3),
  q('Accorde : « Les lettres que j’ai (écrire) ».', 'écrites', ['écrit', 'écrits', 'écrite'], 'Le COD « que » (les lettres) est placé avant : accord au féminin pluriel.', 3),
  q('« Il est fort comme un lion » est une :', 'comparaison', ['métaphore', 'hyperbole', 'personnification'], 'Il y a un outil de comparaison (« comme »).', 2),
  q('Un synonyme de « rapide » est :', 'véloce', ['lent', 'lourd', 'léger'], 'Véloce signifie rapide.', 3),
  q('Dans « Je pense que tu as raison », la subordonnée est :', 'que tu as raison', ['Je pense', 'tu as raison que', 'raison'], 'La proposition subordonnée commence par « que ».', 3),
  q('Quel mot est correctement orthographié ?', 'développement', ['dévelopement', 'développpement', 'developement'], 'On écrit « développement » avec deux p.', 3),
  q('Quel est le féminin de « acteur » ?', 'actrice', ['acteure', 'acteuse', 'actresse'], 'Le féminin est « actrice ».', 2),
  q('Quel est le sujet du verbe dans « Dans la cour, les élèves chantent » ?', 'les élèves', ['la cour', 'chantent', 'Dans la cour'], 'Qui chante ? Les élèves.', 2),
  q('Un antonyme de « rare » est :', 'fréquent', ['unique', 'exclusif', 'exceptionnel'], 'Rare ↔ fréquent.', 2)
];

const CINQUIEME: RawQ[] = [
  q('Quelle phrase est à la voix passive ?', 'La souris est mangée par le chat.', ['Le chat mange la souris.', 'La souris mange le chat.', 'Le chat mangera la souris.'], 'Le sujet subit l’action : voix passive.', 3),
  q('« Quand je serai grand, je voyagerai. » Quel temps domine ?', 'le futur simple', ['le présent', 'l’imparfait', 'le passé composé'], 'Serai et voyagerai sont au futur simple.', 2),
  q('Complète : « Elles ont rangé ... affaires. »', 'leurs', ['leur', 'leures', 'leur’s'], 'Devant un nom pluriel : leurs affaires.', 2),
  q('Quel mot est un adverbe ?', 'lentement', ['lent', 'lenteur', 'ralentir'], 'Lentement modifie le verbe : c’est un adverbe.', 2),
  q('Un antonyme de « généreux » est :', 'avare', ['donneur', 'aimable', 'riche'], 'Généreux ↔ avare.', 3),
  q('Complète au subjonctif présent : « Il faut que tu (faire) tes devoirs. »', 'fasses', ['fais', 'feras', 'faisais'], 'Après « il faut que » : que tu fasses.', 3),
  q('Quel mot est correctement orthographié ?', 'accueil', ['acceuil', 'aceuil', 'accueille' ], 'On écrit « accueil » (c avant u).', 3),
  q('Accorde : « des cheveux (blond) » →', 'blonds', ['blond', 'blondes', 'blonds’'], 'Masculin pluriel : des cheveux blonds.', 2),
  q('Dans « Il travaille mais il est fatigué », la proposition « il est fatigué » est :', 'une proposition coordonnée', ['une subordonnée relative', 'une subordonnée circonstancielle', 'une principale'], 'Elle est reliée par la conjonction de coordination « mais ».', 3),
  q('Le préfixe « trans- » signifie :', 'à travers', ['avant', 'contre', 'sous'], 'Transporter = porter à travers.', 3)
];

const QUATRIEME: RawQ[] = [
  q('Dans « le livre qui est sur la table », quel est le pronom relatif ?', 'qui', ['le', 'est', 'sur'], '« qui » introduit la subordonnée relative.', 2),
  q('Transforme à la voix passive : « Le professeur corrige les copies. »', 'Les copies sont corrigées par le professeur.', ['Les copies corrigent le professeur.', 'Le professeur est corrigé par les copies.', 'Les copies étaient corrigées.'], 'Le sujet devient complément d’agent.', 3),
  q('Complète au conditionnel passé : « Si j’avais su, je ... venu. »', 'serais', ['suis', 'étais', 'serai'], 'Après « si + plus-que-parfait », la principale est au conditionnel : je serais venu.', 3),
  q('« Cette personne est un soleil » est une :', 'métaphore', ['comparaison', 'personnification', 'répétition'], 'Pas d’outil de comparaison : métaphore.', 3),
  q('Accorde : « Elles se sont (laver) les mains. »', 'lavé', ['lavées', 'lavés', 'lavée'], 'Le COD (les mains) est après le verbe : pas d’accord.', 3),
  q('Complète : « Je (aimer) venir avec toi. » (conditionnel présent)', 'aimerais', ['aimerai', 'aimais', 'aime'], 'Conditionnel présent : j’aimerais.', 2),
  q('Le préfixe « anti- » signifie :', 'contre', ['avec', 'avant', 'après'], 'Antivirus = contre les virus.', 1),
  q('Quel est le champ lexical de « pluie, vent, nuage, orage » ?', 'la météo', ['la cuisine', 'le sport', 'l’école'], 'Tous ces mots concernent la météo.', 2),
  q('Complète : « ... tu sois en retard, nous partirons. »', 'Bien que', ['Parce que', 'Donc', 'Ainsi'], '« Bien que » exprime l’opposition et demande le subjonctif.', 3),
  q('Quelle phrase contient une subordonnée conjonctive circonstancielle de but ?', 'Je travaille pour que tu réussisses.', ['Je travaille le soir.', 'Je travaille et je chante.', 'Le travail que je fais est dur.'], '« pour que » exprime le but.', 3)
];

const TROISIEME: RawQ[] = [
  q('Dans « Les livres que j’ai lus », pourquoi « lus » prend-il un s ?', 'Le COD est placé avant le verbe.', ['Le sujet est au pluriel.', 'C’est un verbe pronominal.', 'Il n’y a pas d’accord.'], 'Avec avoir, le participe s’accorde avec le COD antéposé.', 3),
  q('« Il est mort de rire » est une :', 'hyperbole', ['comparaison', 'métaphore', 'litote'], 'L’hyperbole exagère.', 3),
  q('Quel temps exprime « Je viendrais si je pouvais » ?', 'le conditionnel présent', ['le futur simple', 'l’imparfait', 'le subjonctif'], 'Viendrais = conditionnel présent.', 2),
  q('Complète : « ... soient les difficultés, il persévère. »', 'Quelles que', ['Quelques', 'Quelque', 'Quel que'], '« Quelles que » + subjonctif : sens de « peu importe ».', 3),
  q('Un synonyme de « courageux » est :', 'vaillant', ['peureux', 'paresseux', 'timide'], 'Vaillant signifie courageux.', 2),
  q('Quel connecteur exprime l’opposition ?', 'cependant', ['ainsi', 'donc', 'ensuite'], 'Cependant marque l’opposition.', 2),
  q('Quel registre utilise « ouais, ça déchire » ?', 'familier', ['soutenu', 'courant', 'littéraire'], 'Le registre familier s’emploie entre proches.', 2),
  q('Conjugue au passé simple : « Ils (finir) leur travail. »', 'finirent', ['finirents', 'finissaient', 'finiens'], 'Passé simple : ils finirent.', 3),
  q('« L’eau chantait sous les pierres » est une :', 'personnification', ['comparaison', 'hyperbole', 'énumération'], 'On donne un comportement humain à l’eau.', 3),
  q('Quelle est la fonction de « pour réussir » dans « Il travaille pour réussir » ?', 'complément circonstanciel de but', ['complément d’objet direct', 'sujet', 'attribut'], 'Il indique le but de l’action.', 3)
];

const FR_BY_GRADE: Record<GradeId, RawQ[]> = {
  MS, GS, CP, CE1, CE2, CM1, CM2, '6E': SIXIEME, '5E': CINQUIEME, '4E': QUATRIEME, '3E': TROISIEME
};

// ---------------------------------------------------------------------------
// Generateurs (conjugaison + homophones) pour avoir des questions infinies
// ---------------------------------------------------------------------------

interface Verb {
  inf: string;
  present: string[];
  futur: string[];
  imparfait: string[];
  passeSimple: string[];
}

const PRONOUNS = ['Je', 'Tu', 'Il', 'Nous', 'Vous', 'Ils'];

const VERBS: Verb[] = [
  { inf: 'chanter', present: ['chante', 'chantes', 'chante', 'chantons', 'chantez', 'chantent'], futur: ['chanterai', 'chanteras', 'chantera', 'chanterons', 'chanterez', 'chanteront'], imparfait: ['chantais', 'chantais', 'chantait', 'chantions', 'chantiez', 'chantaient'], passeSimple: ['chantai', 'chantas', 'chanta', 'chantâmes', 'chantâtes', 'chantèrent'] },
  { inf: 'jouer', present: ['joue', 'joues', 'joue', 'jouons', 'jouez', 'jouent'], futur: ['jouerai', 'joueras', 'jouera', 'jouerons', 'jouerez', 'joueront'], imparfait: ['jouais', 'jouais', 'jouait', 'jouions', 'jouiez', 'jouaient'], passeSimple: ['jouai', 'jouas', 'joua', 'jouâmes', 'jouâtes', 'jouèrent'] },
  { inf: 'finir', present: ['finis', 'finis', 'finit', 'finissons', 'finissez', 'finissent'], futur: ['finirai', 'finiras', 'finira', 'finirons', 'finirez', 'finiront'], imparfait: ['finissais', 'finissais', 'finissait', 'finissions', 'finissiez', 'finissaient'], passeSimple: ['finis', 'finis', 'finit', 'finîmes', 'finîtes', 'finirent'] },
  { inf: 'grandir', present: ['grandis', 'grandis', 'grandit', 'grandissons', 'grandissez', 'grandissent'], futur: ['grandirai', 'grandiras', 'grandira', 'grandirons', 'grandirez', 'grandiront'], imparfait: ['grandissais', 'grandissais', 'grandissait', 'grandissions', 'grandissiez', 'grandissaient'], passeSimple: ['grandis', 'grandis', 'grandit', 'grandîmes', 'grandîtes', 'grandirent'] },
  { inf: 'manger', present: ['mange', 'manges', 'mange', 'mangeons', 'mangez', 'mangent'], futur: ['mangerai', 'mangeras', 'mangera', 'mangerons', 'mangerez', 'mangeront'], imparfait: ['mangeais', 'mangeais', 'mangeait', 'mangions', 'mangiez', 'mangeaient'], passeSimple: ['mangeai', 'mangeas', 'mangea', 'mangeâmes', 'mangeâtes', 'mangèrent'] },
  { inf: 'être', present: ['suis', 'es', 'est', 'sommes', 'êtes', 'sont'], futur: ['serai', 'seras', 'sera', 'serons', 'serez', 'seront'], imparfait: ['étais', 'étais', 'était', 'étions', 'étiez', 'étaient'], passeSimple: ['fus', 'fus', 'fut', 'fûmes', 'fûtes', 'furent'] },
  { inf: 'avoir', present: ['ai', 'as', 'a', 'avons', 'avez', 'ont'], futur: ['aurai', 'auras', 'aura', 'aurons', 'aurez', 'auront'], imparfait: ['avais', 'avais', 'avait', 'avions', 'aviez', 'avaient'], passeSimple: ['eus', 'eus', 'eut', 'eûmes', 'eûtes', 'eurent'] },
  { inf: 'aller', present: ['vais', 'vas', 'va', 'allons', 'allez', 'vont'], futur: ['irai', 'iras', 'ira', 'irons', 'irez', 'iront'], imparfait: ['allais', 'allais', 'allait', 'allions', 'alliez', 'allaient'], passeSimple: ['allai', 'allas', 'alla', 'allâmes', 'allâtes', 'allèrent'] },
  { inf: 'faire', present: ['fais', 'fais', 'fait', 'faisons', 'faites', 'font'], futur: ['ferai', 'feras', 'fera', 'ferons', 'ferez', 'feront'], imparfait: ['faisais', 'faisais', 'faisait', 'faisions', 'faisiez', 'faisaient'], passeSimple: ['fis', 'fis', 'fit', 'fîmes', 'fîtes', 'firent'] },
  { inf: 'prendre', present: ['prends', 'prends', 'prend', 'prenons', 'prenez', 'prennent'], futur: ['prendrai', 'prendras', 'prendra', 'prendrons', 'prendrez', 'prendront'], imparfait: ['prenais', 'prenais', 'prenait', 'prenions', 'preniez', 'prenaient'], passeSimple: ['pris', 'pris', 'prit', 'prîmes', 'prîtes', 'prirent'] },
  { inf: 'venir', present: ['viens', 'viens', 'vient', 'venons', 'venez', 'viennent'], futur: ['viendrai', 'viendras', 'viendra', 'viendrons', 'viendrez', 'viendront'], imparfait: ['venais', 'venais', 'venait', 'venions', 'veniez', 'venaient'], passeSimple: ['vins', 'vins', 'vint', 'vînmes', 'vîntes', 'vinrent'] },
  { inf: 'voir', present: ['vois', 'vois', 'voit', 'voyons', 'voyez', 'voient'], futur: ['verrai', 'verras', 'verra', 'verrons', 'verrez', 'verront'], imparfait: ['voyais', 'voyais', 'voyait', 'voyions', 'voyiez', 'voyaient'], passeSimple: ['vis', 'vis', 'vit', 'vîmes', 'vîtes', 'virent'] },
  { inf: 'dire', present: ['dis', 'dis', 'dit', 'disons', 'dites', 'disent'], futur: ['dirai', 'diras', 'dira', 'dirons', 'direz', 'diront'], imparfait: ['disais', 'disais', 'disait', 'disions', 'disiez', 'disaient'], passeSimple: ['dis', 'dis', 'dit', 'dîmes', 'dîtes', 'dirent'] },
  { inf: 'pouvoir', present: ['peux', 'peux', 'peut', 'pouvons', 'pouvez', 'peuvent'], futur: ['pourrai', 'pourras', 'pourra', 'pourrons', 'pourrez', 'pourront'], imparfait: ['pouvais', 'pouvais', 'pouvait', 'pouvions', 'pouviez', 'pouvaient'], passeSimple: ['pus', 'pus', 'put', 'pûmes', 'pûtes', 'purent'] },
  { inf: 'partir', present: ['pars', 'pars', 'part', 'partons', 'partez', 'partent'], futur: ['partirai', 'partiras', 'partira', 'partirons', 'partirez', 'partiront'], imparfait: ['partais', 'partais', 'partait', 'partions', 'partiez', 'partaient'], passeSimple: ['partis', 'partis', 'partit', 'partîmes', 'partîtes', 'partirent'] }
];

const HOMOPHONES: { phrase: string; good: string; bad: string[]; expl: string }[] = [
  { phrase: 'Il ___ un nouveau cartable.', good: 'a', bad: ['à', 'as', 'ha'], expl: '« a » = verbe avoir.' },
  { phrase: 'Je vais ___ Paris.', good: 'à', bad: ['a', 'as', 'ah'], expl: '« à » avec accent = préposition de lieu.' },
  { phrase: 'Il est grand ___ gentil.', good: 'et', bad: ['est', 'es', 'ai'], expl: '« et » relie deux mots.' },
  { phrase: 'Elle ___ très contente.', good: 'est', bad: ['et', 'es', 'ait'], expl: '« est » = verbe être.' },
  { phrase: 'Ils ___ déjà partis.', good: 'sont', bad: ['son', 'sons', 'sonts'], expl: '« sont » = verbe être au pluriel.' },
  { phrase: 'Il a perdu ___ ballon.', good: 'son', bad: ['sont', 'sons', 'son’t'], expl: '« son » = déterminant possessif.' },
  { phrase: '___ tu veux, on y va.', good: 'Si', bad: ['S’il', 'Ci', 'Sil'], expl: '« Si » exprime la condition.' },
  { phrase: 'Je ne sais pas ___ il habite.', good: 'où', bad: ['ou', 'hou', 'oux'], expl: '« où » avec accent = lieu.' },
  { phrase: 'Tu préfères le chocolat ___ la vanille ?', good: 'ou', bad: ['où', 'houx', 'hou'], expl: '« ou » sans accent = choix.' },
  { phrase: 'Il range ___ affaires.', good: 'ses', bad: ['ces', 'c’est', 's’est'], expl: '« ses » marque la possession.' },
  { phrase: 'Regarde ___ oiseaux !', good: 'ces', bad: ['ses', 'c’est', 's’est'], expl: '« ces » = démonstratif (montrer).' },
  { phrase: 'Elle ___ déguisée en ninja.', good: 's’est', bad: ['c’est', 'ses', 'ces'], expl: '« s’est » = verbe pronominal.' },
  { phrase: '___ la fête du village.', good: 'C’est', bad: ['S’est', 'Ces', 'Ses'], expl: '« C’est » = cela est.' },
  { phrase: 'Ils parlent à ___ professeur.', good: 'leur', bad: ['leurs', 'leures', 'leur’s'], expl: '« leur » singulier devant un nom singulier.' },
  { phrase: 'Elles rangent ___ cahiers.', good: 'leurs', bad: ['leur', 'leures', 'leurres'], expl: '« leurs » devant un nom pluriel.' },
  { phrase: 'Il ___ son manteau.', good: 'met', bad: ['mais', 'mes', 'm’est'], expl: '« met » = verbe mettre.' }
];

export const genFrancaisProc = (grade: GradeId, levels: (1 | 2 | 3)[]): RawQ => {
  const order = ['MS', 'GS', 'CP', 'CE1', 'CE2', 'CM1', 'CM2', '6E', '5E', '4E', '3E'];
  const idx = order.indexOf(grade);
  const lv = pickOne(levels);

  // En maternelle, pas de conjugaison ni d'homophones : on pioche dans la liste.
  if (idx <= 1) return pickOne(FR_BY_GRADE[grade]);

  const kind = Math.random();
  if (kind < 0.5) {
    const v = pickOne(VERBS);
    const p = rint(0, 5);
    const tenses: { key: 'present' | 'futur' | 'imparfait' | 'passeSimple'; label: string; min: number }[] = [
      { key: 'present', label: 'au présent', min: 2 },
      { key: 'futur', label: 'au futur simple', min: 3 },
      { key: 'imparfait', label: 'à l’imparfait', min: 4 },
      { key: 'passeSimple', label: 'au passé simple', min: 8 }
    ];
    const usable = tenses.filter((t) => idx >= t.min);
    const t = pickOne(usable);
    const good = v[t.key][p];
    const wrongs = Array.from(
      new Set(
        (['present', 'futur', 'imparfait', 'passeSimple'] as const)
          .filter((k) => k !== t.key)
          .map((k) => v[k][p])
          .filter((w) => w !== good)
      )
    );
    const subject = PRONOUNS[p];
    const prompt = `Conjugue ${t.label} : « ${subject} (${v.inf}) » →`;
    const correct = `${subject.toLowerCase()} ${good}`;
    return q(prompt, correct, wrongs.map((w) => `${subject.toLowerCase()} ${w}`), `${subject} ${good} (${v.inf} ${t.label}).`, lv);
  }

  const h = pickOne(HOMOPHONES);
  const prompt = `Complète : « ${h.phrase.replace('___', ' ___ ')} »`;
  return q(prompt, h.good, h.bad, h.expl, lv);
};

export const genFrancais = (grade: GradeId, levels: (1 | 2 | 3)[]): RawQ => {
  if (Math.random() < 0.35) {
    try {
      return genFrancaisProc(grade, levels);
    } catch {
      /* retomber sur la liste */
    }
  }
  const list = FR_BY_GRADE[grade] || CP;
  const filtered = list.filter((x) => levels.includes(x.level as 1 | 2 | 3));
  return pickOne(filtered.length ? filtered : list);
};

export const genFrancaisBatch = (grade: GradeId, levels: (1 | 2 | 3)[], count: number): RawQ[] => {
  const out: RawQ[] = [];
  const seen = new Set<string>();
  let guard = 0;
  while (out.length < count && guard++ < count * 40) {
    const item = genFrancais(grade, levels);
    const key = item.prompt.slice(0, 45);
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(item);
  }
  return out;
};
