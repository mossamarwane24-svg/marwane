import type { Band } from '../../types';
import { mk, type RawQ } from './maths';

const q = mk;

// ---------------------------------------------------------------------------
// HISTOIRE-GEOGRAPHIE, SCIENCES et ANGLAIS — banques par cycle
// ---------------------------------------------------------------------------

export const CULTURE: Record<'histoire' | 'sciences' | 'anglais', Record<Band, RawQ[]>> = {
  // ======================= SCIENCES =======================================
  sciences: {
    maternelle: [
      q('Quel animal fait « miaou » ?', 'le chat', ['le chien', 'la vache', 'le cheval'], 'Le chat miaule.', 1),
      q('Combien de pattes a un chien ?', '4', ['2', '6', '8'], 'Un chien a 4 pattes.', 1),
      q('Avec quoi voit-on ?', 'les yeux', ['les oreilles', 'le nez', 'les pieds'], 'On voit avec les yeux.', 1),
      q('Où vit le poisson ?', 'dans l’eau', ['dans un arbre', 'dans une grotte', 'dans le sable'], 'Le poisson vit dans l’eau.', 1),
      q('Quelle saison est la plus froide ?', 'l’hiver', ['l’été', 'le printemps', 'l’automne'], 'En hiver il fait froid, parfois il neige.', 1),
      q('Que boit-on pour être en bonne santé ?', 'de l’eau', ['du soda', 'du sirop', 'du chocolat'], 'L’eau est la meilleure boisson pour la santé.', 1),
      q('Combien de doigts a une main ?', '5', ['4', '6', '10'], 'Une main a 5 doigts.', 2),
      q('Quel animal vole ?', 'l’oiseau', ['le poisson', 'le chien', 'le lapin'], 'L’oiseau vole grâce à ses ailes.', 1),
      q('Que mange surtout le lapin ?', 'des carottes', ['de la viande', 'du poisson', 'des bonbons'], 'Le lapin mange des légumes comme les carottes.', 2),
      q('Dans quel pays parle-t-on français ?', 'la France', ['l’Italie', 'l’Espagne', 'l’Allemagne'], 'En France, on parle français.', 1),
      q('Quel monument est une grande tour à Paris ?', 'la tour Eiffel', ['le pont Neuf', 'la tour de Pise', 'Big Ben'], 'La tour Eiffel se trouve à Paris.', 1),
      q('Où habite le roi dans un conte ?', 'dans un château', ['dans une ferme', 'dans une grotte', 'dans une cabane'], 'Dans les contes, le roi habite un château.', 1),
      q('Quel moyen de transport roule sur des rails ?', 'le train', ['le bateau', 'l’avion', 'le vélo'], 'Le train roule sur des rails.', 1)
    ],
    elementaire: [
      q('Combien de pattes a une araignée ?', '8', ['6', '4', '10'], 'Une araignée a 8 pattes, un insecte en a 6.', 2),
      q('De quoi une plante a-t-elle besoin pour grandir ?', 'd’eau et de lumière', ['de sucre', 'de sel', 'de vent'], 'Une plante a besoin d’eau, de lumière et de terre.', 2),
      q('Quel organe pompe le sang dans le corps ?', 'le cœur', ['le foie', 'l’estomac', 'les poumons'], 'Le cœur est la pompe du sang.', 2),
      q('Combien de jours y a-t-il dans une année ?', '365', ['300', '400', '250'], 'Une année compte 365 jours (366 les années bissextiles).', 2),
      q('Que devient l’eau quand elle gèle ?', 'de la glace', ['de la vapeur', 'du sel', 'de la neige seulement'], 'À 0 °C, l’eau devient de la glace.', 2),
      q('Quel animal est un mammifère ?', 'la baleine', ['le requin', 'la truite', 'le python'], 'La baleine allaite ses petits : c’est un mammifère marin.', 3),
      q('Quelle énergie vient du soleil ?', 'l’énergie solaire', ['l’énergie éolienne', 'l’énergie hydraulique', 'le charbon'], 'Les panneaux solaires captent l’énergie du soleil.', 2),
      q('Quel est le plus grand animal du monde ?', 'la baleine bleue', ['l’éléphant', 'la girafe', 'le requin blanc'], 'La baleine bleue peut mesurer plus de 30 m.', 3),
      q('Que faut-il pour faire fondre un glaçon ?', 'de la chaleur', ['du froid', 'du vent', 'de l’ombre'], 'La chaleur fait fondre la glace.', 1),
      q('Combien de saisons y a-t-il dans une année ?', '4', ['2', '3', '6'], 'Printemps, été, automne, hiver : 4 saisons.', 1),
      q('Qui est devenu empereur des Français en 1804 ?', 'Napoléon Bonaparte', ['Louis XIV', 'Charlemagne', 'Jules César'], 'Napoléon devient empereur en 1804.', 2),
      q('Quel fleuve traverse Paris ?', 'la Seine', ['la Loire', 'le Rhône', 'la Garonne'], 'La Seine traverse Paris.', 2),
      q('Qui arrive en Amérique en 1492 ?', 'Christophe Colomb', ['Vasco de Gama', 'Magellan', 'Marco Polo'], 'Christophe Colomb arrive en Amérique en 1492.', 2)
    ],
    college: [
      q('Quelle est l’unité de la force ?', 'le newton', ['le joule', 'le watt', 'le volt'], 'La force se mesure en newtons (N).', 3),
      q('Quelle est l’unité de l’énergie ?', 'le joule', ['le newton', 'le watt', 'le volt'], 'L’énergie se mesure en joules (J).', 3),
      q('Quel organe filtre le sang ?', 'le rein', ['le cœur', 'le poumon', 'le foie'], 'Les reins filtrent le sang et produisent l’urine.', 3),
      q('Quel gaz est le plus abondant dans l’air ?', 'l’azote', ['le dioxygène', 'le dioxyde de carbone', 'l’hélium'], 'L’air contient environ 78 % d’azote.', 3),
      q('Quelle est la formule chimique de l’eau ?', 'H₂O', ['CO₂', 'O₂', 'H₂O₂'], 'L’eau est composée de 2 atomes d’hydrogène et 1 d’oxygène.', 2),
      q('Quel gaz est produit par la combustion du carbone ?', 'le dioxyde de carbone', ['le dioxygène', 'l’azote', 'l’hélium'], 'Carbone + dioxygène → dioxyde de carbone (CO₂).', 3),
      q('Quel organe produit l’insuline ?', 'le pancréas', ['le foie', 'le rein', 'l’estomac'], 'L’insuline est produite par le pancréas.', 3),
      q('Quelle couche de l’atmosphère nous protège des rayons UV ?', 'la couche d’ozone', ['la stratosphère', 'la troposphère', 'la ionosphère'], 'La couche d’ozone absorbe une grande partie des UV.', 3),
      q('Dans quel sens circule le courant électrique conventionnel ?', 'du + vers le −', ['du − vers le +', 'des deux côtés', 'dans un seul fil'], 'Par convention, le courant va de la borne + vers la borne −.', 3),
      q('Quel est le rôle des globules rouges ?', 'transporter l’oxygène', ['digérer les aliments', 'combattre les virus', 'produire l’énergie'], 'Les globules rouges transportent le dioxygène grâce à l’hémoglobine.', 3),
      q('Une année-lumière est une unité de :', 'distance', ['temps', 'vitesse', 'masse'], 'C’est la distance parcourue par la lumière en un an.', 3),
      q('Combien de chromosomes possède une cellule humaine ?', '46', ['23', '48', '22'], '46 chromosomes, soit 23 paires.', 3),
      q('Quel est le symbole chimique du fer ?', 'Fe', ['Fr', 'F', 'Ir'], 'Fe vient du latin ferrum.', 2)
    ]
  },

  // ======================= HISTOIRE - GEOGRAPHIE ===========================
  histoire: {
    maternelle: [
      q('De quelles couleurs est le drapeau français ?', 'bleu, blanc, rouge', ['rouge, jaune, vert', 'bleu, blanc, vert', 'noir, blanc, rouge'], 'Le drapeau français est bleu, blanc, rouge.', 1),
      q('Dans quoi habitons-nous ?', 'une maison', ['un bateau', 'une grotte', 'un avion'], 'On habite dans une maison ou un appartement.', 1),
      q('La tour Eiffel se trouve en :', 'France', ['Italie', 'Espagne', 'Allemagne'], 'La tour Eiffel est à Paris, en France.', 1),
      q('Quel animal vit au pôle Nord ?', 'l’ours blanc', ['le lion', 'le kangourou', 'le perroquet'], 'L’ours blanc vit dans l’Arctique.', 2),
      q('Comment appelle-t-on la ville où l’on habite ?', 'notre ville', ['un désert', 'une forêt', 'une île'], 'On habite dans une ville ou un village.', 1),
      q('Quel astre brille le jour ?', 'le soleil', ['la lune', 'les étoiles', 'Mars'], 'Le soleil brille pendant la journée.', 1),
      q('Comment s’appelle notre pays ?', 'la France', ['l’Italie', 'le Brésil', 'le Canada'], 'Nous vivons en France.', 1),
      q('Qui nous apprend des choses à l’école ?', 'la maîtresse ou le maître', ['le facteur', 'le boulanger', 'le policier'], 'À l’école, le maître ou la maîtresse nous apprend beaucoup.', 1),
      q('Que voit-on dans le ciel la nuit ?', 'les étoiles', ['le soleil', 'un arc-en-ciel', 'des nuages blancs seulement'], 'La nuit, on voit la lune et les étoiles.', 1),
      q('Quel moyen de transport roule sur des rails ?', 'le train', ['le bateau', 'l’avion', 'le vélo'], 'Le train roule sur des rails.', 1),
      q('Où habite le roi dans un conte ?', 'dans un château', ['dans une ferme', 'dans une grotte', 'dans une cabane'], 'Dans les contes, le roi habite un château.', 1),
      q('Comment appelle-t-on la personne qui soigne les malades ?', 'le médecin', ['le boulanger', 'le facteur', 'le pompier'], 'Le médecin soigne les malades.', 1),
      q('Quel bâtiment abrite la classe à l’école ?', 'l’école', ['la boulangerie', 'la gare', 'le stade'], 'On va en classe à l’école.', 1)
    ],
    elementaire: [
      q('En quelle année a commencé la Révolution française ?', '1789', ['1492', '1914', '1848'], 'La Révolution française débute en 1789.', 3),
      q('Quel roi a fait construire le château de Versailles ?', 'Louis XIV', ['Louis XVI', 'Napoléon', 'François Ier'], 'Louis XIV a transformé Versailles en palais royal.', 3),
      q('Quel fleuve traverse Paris ?', 'la Seine', ['la Loire', 'le Rhône', 'la Garonne'], 'La Seine traverse Paris.', 2),
      q('Quelle est la capitale de l’Italie ?', 'Rome', ['Milan', 'Venise', 'Naples'], 'La capitale de l’Italie est Rome.', 2),
      q('Qui a conquis la Gaule ?', 'Jules César', ['Charlemagne', 'Clovis', 'Vercingétorix'], 'Jules César a conquis la Gaule en 52 av. J.-C.', 3),
      q('Quel océan borde la France à l’ouest ?', 'l’Atlantique', ['le Pacifique', 'l’océan Indien', 'l’océan Arctique'], 'La façade ouest de la France donne sur l’Atlantique.', 2),
      q('Quel événement s’est déroulé de 1914 à 1918 ?', 'la Première Guerre mondiale', ['la Seconde Guerre mondiale', 'la Révolution', 'les Jeux olympiques'], 'La Première Guerre mondiale (la Grande Guerre) : 1914-1918.', 3),
      q('Quel est le plus grand océan du monde ?', 'le Pacifique', ['l’Atlantique', 'l’océan Indien', 'l’Arctique'], 'Le Pacifique est le plus vaste océan.', 2),
      q('Combien y a-t-il de continents ?', '6', ['3', '4', '8'], 'Afrique, Amérique, Antarctique, Asie, Europe, Océanie.', 2),
      q('Quelle est la capitale de la France ?', 'Paris', ['Lyon', 'Marseille', 'Bordeaux'], 'Paris est la capitale de la France.', 1),
      q('Qui est devenu empereur des Français en 1804 ?', 'Napoléon Bonaparte', ['Louis XIV', 'Charlemagne', 'Jules César'], 'Napoléon devient empereur des Français en 1804.', 3),
      q('Qui arrive en Amérique en 1492 ?', 'Christophe Colomb', ['Vasco de Gama', 'Magellan', 'Marco Polo'], 'Christophe Colomb arrive en Amérique en 1492.', 2),
      q('Quelle est la capitale de l’Espagne ?', 'Madrid', ['Barcelone', 'Séville', 'Lisbonne'], 'La capitale de l’Espagne est Madrid.', 2),
      q('Quelle mer borde la France au sud ?', 'la Méditerranée', ['la mer du Nord', 'la mer Noire', 'la Baltique'], 'La France est bordée au sud par la Méditerranée.', 2)
    ],
    college: [
      q('En quelle année la Seconde Guerre mondiale s’est-elle terminée ?', '1945', ['1939', '1918', '1950'], 'La Seconde Guerre mondiale se termine en 1945.', 2),
      q('En quelle année le mur de Berlin est-il tombé ?', '1989', ['1961', '1991', '1975'], 'Le mur de Berlin tombe le 9 novembre 1989.', 3),
      q('Quelle est la date de la prise de la Bastille ?', 'le 14 juillet 1789', ['le 14 juillet 1790', 'le 4 août 1789', 'le 21 janvier 1793'], 'Le 14 juillet 1789 marque le début de la Révolution.', 3),
      q('Quel est le plus long fleuve de France ?', 'la Loire', ['la Seine', 'le Rhône', 'la Garonne'], 'La Loire mesure environ 1 000 km.', 3),
      q('Quelle civilisation a construit les pyramides de Gizeh ?', 'les Égyptiens', ['les Romains', 'les Grecs', 'les Mayas'], 'Les pyramides ont été bâties par les Égyptiens de l’Antiquité.', 2),
      q('Qui était Clovis ?', 'le roi des Francs', ['un empereur romain', 'un pharaon', 'un roi anglais'], 'Clovis, roi des Francs, se fait baptiser vers 496.', 3),
      q('Le traité de Rome (1957) crée :', 'la Communauté économique européenne', ['l’ONU', 'l’euro', 'l’OTAN'], 'Le traité de Rome fonde la CEE, ancêtre de l’Union européenne.', 3),
      q('Quel pays est le plus peuplé du monde ?', 'l’Inde', ['la Chine', 'les États-Unis', 'le Brésil'], 'Depuis 2023, l’Inde est le pays le plus peuplé.', 3),
      q('Quel est le plus grand désert chaud du monde ?', 'le Sahara', ['le Gobi', 'le Kalahari', 'l’Atacama'], 'Le Sahara, en Afrique du Nord, est le plus grand désert chaud.', 2),
      q('Que commémore le 11 novembre ?', 'l’armistice de 1918', ['la fête nationale', 'la fin de 1945', 'la Révolution'], 'Le 11 novembre 1918 marque l’armistice de la Grande Guerre.', 3),
      q('En quelle année la Première Guerre mondiale a-t-elle commencé ?', '1914', ['1918', '1939', '1900'], 'La Première Guerre mondiale commence en 1914.', 2),
      q('Qui a écrit la Déclaration des droits de l’homme et du citoyen ?', 'les révolutionnaires de 1789', ['Napoléon', 'Louis XIV', 'Robespierre seul'], 'Elle est rédigée en 1789, pendant la Révolution.', 3),
      q('Quel est le nom donné à la période qui suit la Seconde Guerre mondiale en France ?', 'les Trente Glorieuses', ['les Années folles', 'la Belle Époque', 'le Moyen Âge'], 'Les Trente Glorieuses désignent la forte croissance de 1945 à 1975.', 3)
    ]
  },

  // ============================= ANGLAIS ==================================
  anglais: {
    maternelle: [
      q('Comment dit-on « chat » en anglais ?', 'cat', ['dog', 'car', 'cup'], 'Cat = chat.', 1),
      q('Que veut dire « blue » ?', 'bleu', ['rouge', 'vert', 'noir'], 'Blue = bleu.', 1),
      q('Comment dit-on « bonjour » en anglais ?', 'Hello', ['Goodbye', 'Sorry', 'Please'], 'Hello = bonjour.', 1),
      q('Que veut dire « apple » ?', 'pomme', ['orange', 'banane', 'fraise'], 'Apple = pomme.', 1),
      q('Que veut dire « two » ?', '2', ['1', '3', '4'], 'Two = 2.', 1),
      q('Que veut dire « red » ?', 'rouge', ['bleu', 'jaune', 'rose'], 'Red = rouge.', 2),
      q('Comment dit-on « merci » ?', 'Thank you', ['Hello', 'Bye', 'Yes'], 'Thank you = merci.', 1),
      q('Que veut dire « one » ?', '1', ['2', '3', '4'], 'One = 1.', 1),
      q('Comment dit-on « au revoir » ?', 'Goodbye', ['Hello', 'Please', 'Sorry'], 'Goodbye = au revoir.', 1),
      q('Comment dit-on « chien » en anglais ?', 'dog', ['cat', 'bird', 'fish'], 'Dog = chien.', 1),
      q('Que veut dire « book » ?', 'un livre', ['un stylo', 'une table', 'un sac'], 'Book = livre.', 2),
      q('Que veut dire « three » ?', '3', ['2', '4', '5'], 'Three = 3.', 1),
      q('Que veut dire « green » ?', 'vert', ['gris', 'jaune', 'marron'], 'Green = vert.', 1)
    ],
    elementaire: [
      q('Quel est le pluriel de « child » ?', 'children', ['childs', 'childes', 'childrens'], 'Child → children (pluriel irrégulier).', 3),
      q('Que veut dire « dog » ?', 'chien', ['chat', 'cheval', 'oiseau'], 'Dog = chien.', 1),
      q('Comment dit-on « J’ai dix ans » ?', 'I am ten years old', ['I have ten years', 'I am ten year', 'I has ten years'], 'En anglais on utilise « to be » pour l’âge : I am ten years old.', 3),
      q('Que veut dire « Monday » ?', 'lundi', ['mardi', 'dimanche', 'samedi'], 'Monday = lundi.', 2),
      q('Quel est le contraire de « big » ?', 'small', ['tall', 'large', 'fat'], 'Big ↔ small.', 2),
      q('Que signifie « Where do you live ? »', 'Où habites-tu ?', ['Comment vas-tu ?', 'Quel âge as-tu ?', 'Que fais-tu ?'], 'Where = où, live = habiter.', 3),
      q('Que veut dire « It is raining » ?', 'il pleut', ['il neige', 'il fait chaud', 'il vente'], 'Rain = pluie → il pleut.', 2),
      q('Que veut dire « I have got a bike » ?', 'J’ai un vélo', ['Je monte à vélo', 'Je veux un vélo', 'J’ai un ballon'], 'Have got = avoir ; bike = vélo.', 2),
      q('Comment dit-on « une école » ?', 'a school', ['a schule', 'an school', 'a szkool'], 'School = école.', 2),
      q('Que veut dire « I like pizza » ?', 'J’aime la pizza', ['Je déteste la pizza', 'Je mange la pizza', 'Je fais la pizza'], 'Like = aimer.', 1),
      q('Comment dit-on « manger » en anglais ?', 'to eat', ['to drink', 'to run', 'to sleep'], 'Eat = manger.', 2),
      q('Que veut dire « school » dans « a school » ?', 'une école', ['une classe', 'un cartable', 'un élève'], 'School = école.', 2),
      q('Que veut dire « Friday » ?', 'vendredi', ['jeudi', 'samedi', 'dimanche'], 'Friday = vendredi.', 2),
      q('Comment dit-on « je suis » en anglais ?', 'I am', ['I is', 'I are', 'I be'], 'Avec I, on utilise am : I am.', 2)
    ],
    college: [
      q('Quel est le passé simple (past simple) de « go » ?', 'went', ['goed', 'gone', 'going'], 'Go → went (irrégulier).', 3),
      q('Quel est le comparatif de « good » ?', 'better', ['gooder', 'more good', 'best'], 'Good → better → the best.', 2),
      q('« I have lived here for 3 years » signifie :', 'Je vis ici depuis 3 ans', ['Je vivais ici 3 ans', 'J’ai vécu ici 3 ans', 'Je vivrai ici 3 ans'], 'Le present perfect exprime une action commencée dans le passé et continuée.', 3),
      q('Complète : « I ... call you tomorrow. »', 'will', ['am', 'do', 'did'], 'Le futur se forme avec will + verbe.', 2),
      q('Quel est le participe passé de « eat » ?', 'eaten', ['ate', 'eated', 'eating'], 'Eat / ate / eaten.', 3),
      q('Comment dit-on « bibliothèque » en anglais ?', 'library', ['bookshop', 'librairy', 'librery'], 'Library = bibliothèque (attention : bookshop = librairie).', 3),
      q('Quelle phrase est correcte ?', 'She doesn’t like football.', ['She don’t like football.', 'She doesn’t likes football.', 'She not like football.'], 'À la 3e personne du singulier : doesn’t + base verbale.', 3),
      q('« If it rains, I will stay home » est un conditionnel de type :', '1', ['2', '3', '0'], 'Type 1 : if + présent, will + verbe.', 3),
      q('Que veut dire « although » ?', 'bien que', ['parce que', 'donc', 'ensuite'], 'Although introduit une opposition.', 3),
      q('Complète : « They ... playing football now. »', 'are', ['is', 'am', 'be'], 'Présent en BE + -ing avec they : they are playing.', 2),
      q('Comment dit-on poliment « Je voudrais » ?', 'I would like', ['I want', 'I like', 'I am'], '« I would like » est plus poli que « I want ».', 3),
      q('Que veut dire « a job » ?', 'un travail', ['un voyage', 'un jeu', 'un cadeau'], 'Job = travail, emploi.', 2),
      q('Complète : « She has ... in Paris since 2010. »', 'lived', ['live', 'living', 'lives'], 'Avec since, on utilise le present perfect : has + participe passé.', 3)
    ]
  }
};
