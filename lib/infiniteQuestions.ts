// Banque de questions bibliques pour le mode "Quiz Infini" de l'Espace
// TEST CONNAISSANCE BIBLIQUE. Ce fichier ne doit etre importe QUE par du code serveur
// (routes app/api/quiz/infinite/*) car il contient les bonnes
// reponses : s'il etait importe par un composant client, les reponses
// se retrouveraient dans le bundle envoye au navigateur.
//
// Toutes les questions sont issues de faits bibliques largement admis,
// avec reference de verset (Bible Segond) a titre indicatif.

export type InfiniteDifficulty = "facile" | "moyen" | "difficile" | "expert";

export interface InfiniteQuestion {
  id: string;
  difficulty: InfiniteDifficulty;
  theme: string;
  text: string;
  options: string[];
  correctOption: number;
  verseReference: string;
  explanation: string;
}

// Ordre des niveaux de difficulte, du plus accessible au plus pointu.
export const DIFFICULTY_ORDER: InfiniteDifficulty[] = [
  "facile",
  "moyen",
  "difficile",
  "expert",
];

// Nombre de questions par palier ("niveau") avant de passer au suivant.
export const QUESTIONS_PER_LEVEL = 8;

// A partir de quel niveau chaque difficulte commence. Au-dela du dernier
// palier defini, la difficulte reste "expert" indefiniment : le quiz est
// donc bien sans fin, avec un plafond de difficulte.
export function difficultyForLevel(level: number): InfiniteDifficulty {
  if (level <= 3) return "facile";
  if (level <= 6) return "moyen";
  if (level <= 9) return "difficile";
  return "expert";
}

type Row = [
  string,
  InfiniteDifficulty,
  string,
  string,
  string[],
  number,
  string,
  string
];

const ROWS: Row[] = [
  // ---------------------------------------------------------------
  // FACILE
  // ---------------------------------------------------------------
  ["f1", "facile", "Genèse", "Qui a construit l'arche pour survivre au déluge ?", ["Abraham", "Noé", "Moïse", "David"], 1, "Genèse 6:14-22", "Dieu demanda à Noé de construire une arche pour sauver sa famille et les animaux du déluge."],
  ["f2", "facile", "Genèse", "Quel est le premier livre de la Bible ?", ["Exode", "Genèse", "Lévitique", "Matthieu"], 1, "Genèse 1:1", "La Genèse raconte la création du monde et les origines du peuple de Dieu."],
  ["f3", "facile", "Apocalypse", "Quel est le dernier livre de la Bible ?", ["Actes", "Apocalypse", "Jude", "Romains"], 1, "Apocalypse 1:1", "L'Apocalypse, écrite par Jean, clôt le Nouveau Testament."],
  ["f4", "facile", "Exode", "Qui a reçu les dix commandements sur le mont Sinaï ?", ["Moïse", "Aaron", "Josué", "Samuel"], 0, "Exode 20:1-17", "Dieu donna la loi à Moïse sur le mont Sinaï."],
  ["f5", "facile", "Vie de Jésus", "Combien de disciples Jésus a-t-il choisis comme apôtres ?", ["10", "12", "14", "7"], 1, "Marc 3:14", "Jésus choisit douze hommes pour être ses apôtres."],
  ["f6", "facile", "Vie de Jésus", "Dans quelle ville Jésus est-il né ?", ["Nazareth", "Jérusalem", "Bethléem", "Capernaüm"], 2, "Luc 2:4-7", "Jésus naquit à Bethléem, ville de David, selon la prophétie."],
  ["f7", "facile", "Vie de Jésus", "Qui a trahi Jésus pour trente pièces d'argent ?", ["Pierre", "Thomas", "Judas Iscariot", "Jean"], 2, "Matthieu 26:14-16", "Judas Iscariot livra Jésus aux autorités religieuses pour trente pièces d'argent."],
  ["f8", "facile", "Rois & Héros", "Qui a vaincu le géant Goliath avec une fronde ?", ["Saül", "David", "Salomon", "Samson"], 1, "1 Samuel 17:49-50", "Le jeune berger David terrassa Goliath avec une fronde et une pierre."],
  ["f9", "facile", "Genèse", "En combien de jours Dieu a-t-il créé le monde, selon la Genèse ?", ["5 jours", "6 jours", "7 jours", "8 jours"], 1, "Genèse 1:31-2:2", "Dieu créa le monde en six jours et se reposa le septième."],
  ["f10", "facile", "Prophètes", "Qui a été avalé par un grand poisson ?", ["Élie", "Jonas", "Daniel", "Job"], 1, "Jonas 1:17", "Jonas fut englouti par un grand poisson après avoir fui la mission que Dieu lui avait confiée."],
  ["f11", "facile", "Vie de Jésus", "Qui est la mère de Jésus ?", ["Élisabeth", "Anne", "Marie", "Marthe"], 2, "Luc 1:26-31", "L'ange Gabriel annonça à Marie qu'elle enfanterait Jésus."],
  ["f12", "facile", "Vie de Jésus", "Qui a renié Jésus trois fois avant le chant du coq ?", ["Pierre", "Jean", "André", "Jacques"], 0, "Matthieu 26:69-75", "Pierre nia connaître Jésus trois fois, comme Jésus l'avait annoncé."],
  ["f13", "facile", "Genèse", "Qui est le premier homme créé par Dieu ?", ["Abel", "Adam", "Caïn", "Seth"], 1, "Genèse 2:7", "Dieu forma Adam à partir de la poussière de la terre."],
  ["f14", "facile", "Genèse", "Qui est la première femme créée par Dieu ?", ["Ève", "Sara", "Rebecca", "Rachel"], 0, "Genèse 2:22", "Dieu forma Ève à partir d'une côte d'Adam."],
  ["f15", "facile", "Exode", "Combien de plaies Dieu a-t-il envoyées sur l'Égypte ?", ["7", "10", "12", "5"], 1, "Exode 7-11", "Dix plaies frappèrent l'Égypte avant que Pharaon ne laisse partir le peuple."],
  ["f16", "facile", "Exode", "Qui a conduit le peuple d'Israël hors d'Égypte ?", ["Josué", "Aaron", "Moïse", "Samuel"], 2, "Exode 3:10", "Dieu envoya Moïse délivrer son peuple de l'esclavage en Égypte."],
  ["f17", "facile", "Vie de Jésus", "Qui a baptisé Jésus dans le Jourdain ?", ["Pierre", "Jean-Baptiste", "André", "Philippe"], 1, "Matthieu 3:13-17", "Jean-Baptiste baptisa Jésus dans les eaux du Jourdain."],
  ["f18", "facile", "Genèse", "Qui a été vendu comme esclave par ses propres frères ?", ["Benjamin", "Ruben", "Joseph", "Juda"], 2, "Genèse 37:28", "Par jalousie, les frères de Joseph le vendirent comme esclave."],
  ["f19", "facile", "Vie de Jésus", "Combien de jours et de nuits Jésus a-t-il jeûné dans le désert ?", ["30", "40", "7", "12"], 1, "Matthieu 4:1-2", "Jésus jeûna quarante jours avant d'être tenté par le diable."],
  ["f20", "facile", "Sagesse", "Qui a écrit la plupart des Psaumes ?", ["Salomon", "David", "Moïse", "Ésaïe"], 1, "Psaumes (titres)", "David est l'auteur traditionnel de la majorité des psaumes."],
  ["f21", "facile", "Exode", "Sur quelle montagne Moïse a-t-il reçu les commandements ?", ["Sinaï", "Ararat", "Carmel", "Nébo"], 0, "Exode 19:20", "C'est sur le mont Sinaï que Dieu remit la loi à Moïse."],
  ["f22", "facile", "Vie de Jésus", "Quel est le premier miracle de Jésus, lors d'un mariage à Cana ?", ["Guérir un aveugle", "Changer l'eau en vin", "Marcher sur l'eau", "Nourrir 5000 personnes"], 1, "Jean 2:1-11", "Lors d'un mariage à Cana, Jésus changea l'eau en vin."],
  ["f23", "facile", "Vie de Jésus", "Combien d'apôtres Jésus a-t-il choisis ?", ["10", "12", "14", "16"], 1, "Luc 6:13", "Jésus choisit douze apôtres parmi ses disciples."],
  ["f24", "facile", "Rois & Héros", "Quel roi d'Israël est reconnu comme le plus sage ?", ["David", "Salomon", "Saül", "Ézéchias"], 1, "1 Rois 3:12", "Dieu accorda à Salomon une sagesse extraordinaire."],
  ["f25", "facile", "Rois & Héros", "Qui a fait construire le premier temple de Jérusalem ?", ["David", "Salomon", "Josias", "Esdras"], 1, "1 Rois 6:1", "Salomon fit construire le temple de Jérusalem."],
  ["f26", "facile", "Genèse", "Quel jour Dieu s'est-il reposé après la création ?", ["Le 5e jour", "Le 6e jour", "Le 7e jour", "Le 8e jour"], 2, "Genèse 2:2", "Dieu se reposa le septième jour de toute son œuvre."],
  ["f27", "facile", "Prophètes", "Qui a été jeté dans la fosse aux lions ?", ["Daniel", "Ézéchiel", "Jérémie", "Ésaïe"], 0, "Daniel 6:16", "Daniel fut jeté dans la fosse aux lions pour avoir prié son Dieu."],
  ["f28", "facile", "Genèse", "Combien de jours et de nuits a duré la pluie du déluge ?", ["10", "40", "70", "100"], 1, "Genèse 7:12", "Il plut quarante jours et quarante nuits durant le déluge."],
  ["f29", "facile", "Genèse", "Qui a été changée en statue de sel ?", ["La femme de Lot", "Sara", "Agar", "La fille de Jephté"], 0, "Genèse 19:26", "En se retournant pour regarder Sodome, la femme de Lot devint une statue de sel."],
  ["f30", "facile", "Vie de Jésus", "Quel verset commence par « Car Dieu a tant aimé le monde... » ?", ["Genèse 1:1", "Jean 3:16", "Psaume 23:1", "Matthieu 5:3"], 1, "Jean 3:16", "C'est l'un des versets les plus connus de la Bible, résumant l'amour de Dieu pour l'humanité."],

  // ---------------------------------------------------------------
  // MOYEN
  // ---------------------------------------------------------------
  ["m1", "moyen", "Culture générale", "Combien de livres compte l'Ancien Testament (Bible protestante) ?", ["27", "39", "46", "66"], 1, "", "L'Ancien Testament protestant compte 39 livres."],
  ["m2", "moyen", "Culture générale", "Combien de livres compte le Nouveau Testament ?", ["21", "24", "27", "30"], 2, "", "Le Nouveau Testament compte 27 livres."],
  ["m3", "moyen", "Genèse", "Qui était le père d'Abraham ?", ["Nachor", "Térach", "Haran", "Laban"], 1, "Genèse 11:26", "Abraham était fils de Térach."],
  ["m4", "moyen", "Exode", "Combien d'années les Israélites ont-ils erré dans le désert ?", ["10 ans", "40 ans", "70 ans", "100 ans"], 1, "Nombres 14:33-34", "À cause de leur incrédulité, les Israélites errèrent quarante ans dans le désert."],
  ["m5", "moyen", "Exode", "Qui a succédé à Moïse à la tête du peuple d'Israël ?", ["Caleb", "Josué", "Aaron", "Samuel"], 1, "Josué 1:1-2", "Josué prit la relève de Moïse pour conduire le peuple en Canaan."],
  ["m6", "moyen", "Exode", "Quel est le nom de la femme de Moïse ?", ["Séphora", "Miriam", "Rebecca", "Orpa"], 0, "Exode 2:21", "Moïse épousa Séphora, fille de Jéthro."],
  ["m7", "moyen", "Genèse", "Qui a interprété les rêves de Pharaon en Égypte ?", ["Joseph", "Benjamin", "Ruben", "Juda"], 0, "Genèse 41:25-36", "Joseph interpréta les songes de Pharaon annonçant sept années d'abondance puis de famine."],
  ["m8", "moyen", "Genèse", "Combien de fils Jacob a-t-il eus, à l'origine des douze tribus d'Israël ?", ["10", "12", "13", "14"], 1, "Genèse 35:22-26", "Jacob eut douze fils, ancêtres des douze tribus d'Israël."],
  ["m9", "moyen", "Vie de Jésus", "Quel apôtre a marché sur l'eau en allant vers Jésus ?", ["Jean", "Pierre", "André", "Jacques"], 1, "Matthieu 14:28-29", "Pierre sortit de la barque et marcha sur l'eau vers Jésus."],
  ["m10", "moyen", "Vie de Jésus", "Quel roi a fait décapiter Jean-Baptiste ?", ["Hérode le Grand", "Hérode Antipas", "Ponce Pilate", "César Auguste"], 1, "Marc 6:27", "Hérode Antipas fit décapiter Jean-Baptiste à la demande de sa belle-fille."],
  ["m11", "moyen", "Apocalypse", "Qui a écrit le livre de l'Apocalypse ?", ["Pierre", "Jean", "Paul", "Jacques"], 1, "Apocalypse 1:1", "L'apôtre Jean reçut cette révélation alors qu'il était exilé sur l'île de Patmos."],
  ["m12", "moyen", "Vie de Jésus", "Quelle ville Jésus a-t-il pleurée peu avant sa mort ?", ["Bethléem", "Jérusalem", "Nazareth", "Jéricho"], 1, "Luc 19:41", "Jésus pleura sur Jérusalem en voyant son sort futur."],
  ["m13", "moyen", "Église primitive", "Qui fut le premier martyr chrétien ?", ["Jacques", "Étienne", "Pierre", "Barnabas"], 1, "Actes 7:59-60", "Étienne fut lapidé pour sa foi, devenant le premier martyr de l'Église."],
  ["m14", "moyen", "Église primitive", "Sur le chemin de quelle ville Paul a-t-il été converti ?", ["Jérusalem", "Damas", "Antioche", "Éphèse"], 1, "Actes 9:3-6", "Paul rencontra Jésus ressuscité sur le chemin de Damas."],
  ["m15", "moyen", "Église primitive", "Quel était le nom de Paul avant sa conversion ?", ["Simon", "Saul", "Silas", "Barnabas"], 1, "Actes 13:9", "Paul se nommait Saul avant sa conversion au christianisme."],
  ["m16", "moyen", "Vie de Jésus", "Combien de pains et de poissons Jésus a-t-il utilisés pour nourrir 5000 personnes ?", ["5 pains et 2 poissons", "7 pains et 2 poissons", "2 pains et 5 poissons", "12 pains et 3 poissons"], 0, "Jean 6:9-13", "Un jeune garçon apporta cinq pains et deux poissons que Jésus multiplia."],
  ["m17", "moyen", "Juges & Rois", "Qui a révélé aux ennemis de Samson le secret de sa force ?", ["Dalila", "Rahab", "Jézabel", "Athalie"], 0, "Juges 16:15-19", "Dalila persuada Samson de lui révéler le secret de sa force."],
  ["m18", "moyen", "Juges & Rois", "Quelle était la source de la force surnaturelle de Samson ?", ["Son épée", "Ses cheveux jamais coupés", "Son bouclier", "Sa taille"], 1, "Juges 16:17", "Samson était naziréen depuis sa naissance et ne devait jamais se couper les cheveux."],
  ["m19", "moyen", "Juges & Rois", "Qui fut le premier roi d'Israël ?", ["David", "Saül", "Salomon", "Samuel"], 1, "1 Samuel 10:1", "Saül fut oint premier roi d'Israël par le prophète Samuel."],
  ["m20", "moyen", "Juges & Rois", "Quel prophète a oint David comme futur roi ?", ["Nathan", "Samuel", "Élie", "Gad"], 1, "1 Samuel 16:13", "Samuel oignit David d'huile en présence de ses frères."],
  ["m21", "moyen", "Prophètes", "Combien de temps Jonas est-il resté dans le ventre du poisson ?", ["1 jour", "3 jours et 3 nuits", "7 jours", "40 jours"], 1, "Jonas 1:17", "Jonas passa trois jours et trois nuits dans le ventre du grand poisson."],
  ["m22", "moyen", "Culture générale", "Quel est le livre le plus long de la Bible en nombre de chapitres ?", ["Ésaïe", "Psaumes", "Genèse", "Jérémie"], 1, "", "Le livre des Psaumes compte 150 chapitres, ce qui en fait le plus long de la Bible."],
  ["m23", "moyen", "Culture générale", "Quel est le verset le plus court de la Bible ?", ["« Dieu est amour »", "« Jésus pleura »", "« Priez sans cesse »", "« Réjouissez-vous toujours »"], 1, "Jean 11:35", "« Jésus pleura » est considéré comme le verset le plus court de la Bible."],
  ["m24", "moyen", "Église primitive", "Qui a écrit la majorité des épîtres du Nouveau Testament ?", ["Pierre", "Paul", "Jean", "Jacques"], 1, "", "L'apôtre Paul est l'auteur de la plupart des épîtres du Nouveau Testament."],
  ["m25", "moyen", "Vie de Jésus", "Sur quel lieu Jésus a-t-il été crucifié ?", ["Le mont des Oliviers", "Golgotha", "Le mont Sinaï", "Gethsémané"], 1, "Jean 19:17-18", "Jésus fut crucifié à Golgotha, appelé aussi lieu du crâne."],
  ["m26", "moyen", "Vie de Jésus", "Quel disciple est appelé « le disciple que Jésus aimait » ?", ["Pierre", "Jean", "André", "Thomas"], 1, "Jean 13:23", "Jean se désigne ainsi à plusieurs reprises dans son évangile."],
  ["m27", "moyen", "Exode", "Combien de plaies frappèrent l'Égypte avant la sortie d'Israël ?", ["7", "10", "12", "5"], 1, "Exode 7-12", "Dix plaies successives convainquirent Pharaon de libérer le peuple hébreu."],
  ["m28", "moyen", "Juges & Rois", "Qui a demandé à Dieu un signe grâce à une toison de laine ?", ["Gédéon", "Barak", "Otniel", "Jephté"], 0, "Juges 6:36-40", "Gédéon demanda à Dieu deux signes successifs avec une toison de laine."],
  ["m29", "moyen", "Exode", "Qui a poursuivi les Israélites jusqu'à la mer Rouge avec son armée ?", ["Pharaon", "Nabuchodonosor", "Sennachérib", "Darius"], 0, "Exode 14:8", "Pharaon changea d'avis et poursuivit les Israélites avec son armée."],
  ["m30", "moyen", "Juges & Rois", "Sur quel mont Élie a-t-il affronté les prophètes de Baal ?", ["Sinaï", "Carmel", "Nébo", "Thabor"], 1, "1 Rois 18:19-40", "Sur le mont Carmel, Élie défia et vainquit les prophètes de Baal."],

  // ---------------------------------------------------------------
  // DIFFICILE
  // ---------------------------------------------------------------
  ["d1", "difficile", "Genèse", "Comment s'appelle le jardin où Adam et Ève ont été placés ?", ["Éden", "Canaan", "Guérar", "Sichem"], 0, "Genèse 2:8", "Dieu plaça l'homme dans le jardin d'Éden."],
  ["d2", "difficile", "Genèse", "Quel est le nom du frère qu'a tué Caïn ?", ["Seth", "Abel", "Hénoc", "Lémec"], 1, "Genèse 4:8", "Caïn tua son frère Abel par jalousie."],
  ["d3", "difficile", "Genèse", "Sur quel mont l'arche de Noé s'est-elle posée après le déluge ?", ["Sinaï", "Ararat", "Carmel", "Nébo"], 1, "Genèse 8:4", "L'arche s'échoua sur les montagnes d'Ararat."],
  ["d4", "difficile", "Genèse", "Quel serviteur d'Abraham fut envoyé chercher une femme pour Isaac ?", ["Éliézer", "Laban", "Onan", "Balaam"], 0, "Genèse 24:2-4", "Abraham envoya son serviteur Éliézer chercher une épouse pour Isaac."],
  ["d5", "difficile", "Genèse", "Quel fils Abraham a-t-il failli sacrifier sur ordre de Dieu ?", ["Ismaël", "Isaac", "Jacob", "Ésaü"], 1, "Genèse 22:1-2", "Dieu éprouva Abraham en lui demandant de sacrifier Isaac, avant d'arrêter son geste."],
  ["d6", "difficile", "Genèse", "Qui a lutté toute une nuit avec un ange et reçu le nom d'Israël ?", ["Ésaü", "Jacob", "Joseph", "Ruben"], 1, "Genèse 32:24-28", "Après ce combat, Jacob reçut le nom d'Israël, signifiant « celui qui lutte avec Dieu »."],
  ["d7", "difficile", "Genèse", "Quel est le nom du frère jumeau de Jacob ?", ["Laban", "Ésaü", "Lot", "Nachor"], 1, "Genèse 25:24-26", "Ésaü et Jacob étaient frères jumeaux, fils d'Isaac et Rebecca."],
  ["d8", "difficile", "Exode", "Quel est le nom de la sœur de Moïse qui surveilla le panier sur le Nil ?", ["Miriam", "Séphora", "Débora", "Houlda"], 0, "Exode 2:4-7", "Miriam veilla sur son petit frère Moïse déposé dans un panier sur le Nil."],
  ["d9", "difficile", "Exode", "Comment est appelé le buisson que Moïse a vu brûler sans se consumer ?", ["L'arbre de vie", "Le buisson ardent", "L'olivier sacré", "Le figuier maudit"], 1, "Exode 3:2", "Dieu apparut à Moïse dans un buisson en feu qui ne se consumait pas."],
  ["d10", "difficile", "Exode", "Quel est le nom du beau-père de Moïse, prêtre de Madian ?", ["Jéthro", "Balaam", "Coré", "Nadab"], 0, "Exode 3:1", "Jéthro, prêtre de Madian, était le beau-père de Moïse."],
  ["d11", "difficile", "Juges & Rois", "Qui a fait tomber les murailles de Jéricho grâce à des trompettes ?", ["Josué", "Gédéon", "Samuel", "Caleb"], 0, "Josué 6:20", "Sur l'ordre de Dieu, Josué fit sonner des trompettes et les murailles de Jéricho s'écroulèrent."],
  ["d12", "difficile", "Juges & Rois", "Quelle prophétesse a jugé Israël aux côtés de Baraq ?", ["Débora", "Houlda", "Miriam", "Anne"], 0, "Juges 4:4-6", "Débora était juge et prophétesse en Israël."],
  ["d13", "difficile", "Juges & Rois", "Quel roi a demandé à Dieu la sagesse plutôt que la richesse ?", ["David", "Salomon", "Ézéchias", "Josias"], 1, "1 Rois 3:9-12", "Dieu accorda à Salomon une sagesse sans pareille parce qu'il l'avait demandée avant la richesse."],
  ["d14", "difficile", "Prophètes", "Qui fut enlevé au ciel dans un char de feu, sans connaître la mort ?", ["Hénoc", "Élie", "Moïse", "Élisée"], 1, "2 Rois 2:11", "Élie fut enlevé au ciel dans un tourbillon, avec un char et des chevaux de feu."],
  ["d15", "difficile", "Prophètes", "Quel prophète a hérité de l'esprit d'Élie après son départ ?", ["Élisée", "Ésaïe", "Amos", "Michée"], 0, "2 Rois 2:9-15", "Élisée reçut une double portion de l'esprit d'Élie."],
  ["d16", "difficile", "Prophètes", "Quel roi vit apparaître une écriture mystérieuse sur le mur de son palais ?", ["Nabuchodonosor", "Belschatsar", "Cyrus", "Darius"], 1, "Daniel 5:1-6", "Belschatsar vit une main écrire « Mené, Mené, Tekel, Parsin » lors d'un festin."],
  ["d17", "difficile", "Prophètes", "Quels sont les trois compagnons de Daniel jetés dans la fournaise ardente ?", ["Schadrac, Méschac et Abed-Nego", "Anania, Misaël et Azaria", "Gad, Aser et Nephtali", "Simon, André et Philippe"], 0, "Daniel 3:19-27", "Ces trois hommes furent sauvés par Dieu au milieu des flammes."],
  ["d18", "difficile", "Culture générale", "Quel livre biblique raconte l'histoire d'une reine juive qui sauve son peuple en Perse ?", ["Ruth", "Esther", "Judith", "Suzanne"], 1, "Livre d'Esther", "Esther devint reine de Perse et sauva son peuple d'un massacre planifié."],
  ["d19", "difficile", "Vie de Jésus", "Qui a baptisé Jésus, étant aussi un proche parent de sa famille ?", ["Pierre", "Jean-Baptiste", "André", "Philippe"], 1, "Luc 1:36, Matthieu 3:13", "Jean-Baptiste, apparenté à Marie par Élisabeth, baptisa Jésus dans le Jourdain."],
  ["d20", "difficile", "Vie de Jésus", "Combien de temps Jésus est-il resté dans le tombeau avant sa résurrection ?", ["1 jour", "3 jours", "7 jours", "40 jours"], 1, "Matthieu 12:40", "Jésus ressuscita le troisième jour, comme il l'avait annoncé."],
  ["d21", "difficile", "Vie de Jésus", "Quel apôtre est surnommé « l'incrédule » pour avoir douté de la résurrection ?", ["Thomas", "Philippe", "Barthélemy", "Matthieu"], 0, "Jean 20:24-29", "Thomas exigea de voir les plaies de Jésus avant de croire à sa résurrection."],
  ["d22", "difficile", "Vie de Jésus", "Quel collecteur d'impôts est monté sur un sycomore pour voir Jésus ?", ["Matthieu", "Zachée", "Lévi", "Barthélemy"], 1, "Luc 19:1-4", "Zachée, petit de taille, grimpa sur un sycomore pour apercevoir Jésus."],
  ["d23", "difficile", "Vie de Jésus", "Sur quel chemin deux disciples ont-ils reconnu Jésus ressuscité en rompant le pain ?", ["Le chemin de Jéricho", "Le chemin d'Emmaüs", "Le chemin de Damas", "Le chemin de Bethléem"], 1, "Luc 24:13-31", "Les deux disciples reconnurent Jésus à la fraction du pain, sur le chemin d'Emmaüs."],
  ["d24", "difficile", "Église primitive", "Sur quelle île Paul a-t-il affronté le magicien Élymas (Bar-Jésus) ?", ["Chypre", "Malte", "Crète", "Patmos"], 0, "Actes 13:6-11", "À Paphos, sur l'île de Chypre, Paul confondit le magicien Élymas."],
  ["d25", "difficile", "Église primitive", "Dans quelle ville Paul a-t-il prêché devant l'Aréopage ?", ["Corinthe", "Athènes", "Éphèse", "Rome"], 1, "Actes 17:22", "Paul s'adressa aux philosophes grecs sur la colline de l'Aréopage, à Athènes."],
  ["d26", "difficile", "Église primitive", "Quel évènement a permis à Paul et Silas de s'échapper de prison à Philippes ?", ["Une tempête", "Un tremblement de terre", "Une éclipse", "Un incendie"], 1, "Actes 16:25-26", "Un tremblement de terre soudain ouvrit les portes de la prison, menant à la conversion du geôlier."],
  ["d27", "difficile", "Genèse", "Quelles sont les deux villes détruites par le feu et le soufre venus du ciel ?", ["Sodome et Gomorrhe", "Ninive et Babylone", "Tyr et Sidon", "Sichem et Guérar"], 0, "Genèse 19:24-25", "À cause de leur méchanceté, Sodome et Gomorrhe furent détruites par le feu du ciel."],
  ["d28", "difficile", "Apocalypse", "Quel est le nombre symbolique appelé « le nombre de la bête » dans l'Apocalypse ?", ["777", "666", "144", "12"], 1, "Apocalypse 13:18", "L'Apocalypse mentionne 666 comme le nombre de la bête."],
  ["d29", "difficile", "Juges & Rois", "Quel prophète a affronté seul les 450 prophètes de Baal ?", ["Élisée", "Élie", "Michée", "Amos"], 1, "1 Rois 18:22", "Élie, seul prophète de l'Éternel présent, défia les 450 prophètes de Baal."],
  ["d30", "difficile", "Prophètes", "Qui a interprété le songe de la statue aux pieds d'argile devant Nabuchodonosor ?", ["Daniel", "Ézéchiel", "Joseph", "Néhémie"], 0, "Daniel 2:31-45", "Daniel expliqua au roi le sens de son rêve, annonçant la succession des royaumes."],

  // ---------------------------------------------------------------
  // EXPERT
  // ---------------------------------------------------------------
  ["e1", "expert", "Genèse", "Pour combien de pièces d'argent Joseph fut-il vendu par ses frères ?", ["10", "20", "30", "40"], 1, "Genèse 37:28", "Les frères de Joseph le vendirent pour vingt pièces d'argent à des marchands madianites."],
  ["e2", "expert", "Vie de Jésus", "Combien de pains furent utilisés lors de la multiplication pour nourrir 4000 personnes ?", ["5 pains", "7 pains", "2 pains", "12 pains"], 1, "Matthieu 15:34-38", "Jésus multiplia sept pains et quelques poissons pour nourrir 4000 personnes."],
  ["e3", "expert", "Vie de Jésus", "Dans quelle ville Jésus a-t-il ressuscité Lazare ?", ["Béthanie", "Bethléem", "Béthel", "Bethsaïda"], 0, "Jean 11:1", "Lazare vivait à Béthanie avec ses sœurs Marthe et Marie."],
  ["e4", "expert", "Vie de Jésus", "Depuis combien de jours Lazare était-il mort quand Jésus le ressuscita ?", ["1 jour", "2 jours", "4 jours", "7 jours"], 2, "Jean 11:17,39", "Lazare était déjà au tombeau depuis quatre jours."],
  ["e5", "expert", "Vie de Jésus", "Quel grand prêtre a interrogé Jésus avant sa crucifixion ?", ["Anne", "Caïphe", "Zacharie", "Éléazar"], 1, "Matthieu 26:57", "Caïphe, le grand prêtre, présida l'interrogatoire de Jésus."],
  ["e6", "expert", "Vie de Jésus", "Quel gouverneur romain a condamné Jésus à la crucifixion ?", ["Hérode Antipas", "Ponce Pilate", "Félix", "Festus"], 1, "Matthieu 27:24-26", "Ponce Pilate, préfet romain de Judée, condamna Jésus malgré ses doutes."],
  ["e7", "expert", "Juges & Rois", "Combien de fois Naaman devait-il se plonger dans le Jourdain pour être guéri de la lèpre ?", ["3 fois", "5 fois", "7 fois", "10 fois"], 2, "2 Rois 5:10-14", "Sur la parole d'Élisée, Naaman se plongea sept fois dans le Jourdain et fut guéri."],
  ["e8", "expert", "Prophètes", "Quel prophète gardait des troupeaux et cultivait des sycomores avant son appel ?", ["Osée", "Amos", "Michée", "Joël"], 1, "Amos 7:14", "Amos se présente comme un simple berger et cultivateur avant d'être appelé prophète."],
  ["e9", "expert", "Culture générale", "Quel est le livre le plus court de l'Ancien Testament ?", ["Abdias", "Aggée", "Joël", "Nahum"], 0, "Livre d'Abdias", "Le livre d'Abdias ne compte qu'un seul chapitre de 21 versets."],
  ["e10", "expert", "Culture générale", "Quel livre du Nouveau Testament compte le moins de versets ?", ["Jude", "2 Jean", "3 Jean", "Philémon"], 1, "2 Jean", "L'épître de 2 Jean ne compte que 13 versets, ce qui en fait le livre le plus court du Nouveau Testament."],
  ["e11", "expert", "Vie de Jésus", "Qui sont apparus aux côtés de Jésus lors de la Transfiguration ?", ["Abraham et Isaac", "Moïse et Élie", "David et Salomon", "Pierre et Jean"], 1, "Matthieu 17:3", "Moïse et Élie apparurent en gloire, s'entretenant avec Jésus transfiguré."],
  ["e12", "expert", "Vie de Jésus", "Combien de disciples ont assisté à la Transfiguration de Jésus ?", ["1", "3", "7", "12"], 1, "Matthieu 17:1", "Jésus prit avec lui Pierre, Jacques et Jean sur la montagne."],
  ["e13", "expert", "Vie de Jésus", "Quelle prophétesse âgée a reconnu Jésus bébé comme le Messie au temple ?", ["Anne", "Débora", "Houlda", "Élisabeth"], 0, "Luc 2:36-38", "La prophétesse Anne rendit grâce à Dieu en voyant l'enfant Jésus au temple."],
  ["e14", "expert", "Vie de Jésus", "Quel vieillard a reconnu Jésus comme le Messie au temple et loué Dieu ?", ["Zacharie", "Siméon", "Nicodème", "Joseph d'Arimathée"], 1, "Luc 2:25-32", "Siméon, guidé par l'Esprit, reconnut en Jésus le salut promis par Dieu."],
  ["e15", "expert", "Vie de Jésus", "Quel roi a ordonné le massacre des enfants de Bethléem ?", ["Hérode Antipas", "Hérode le Grand", "Archélaüs", "Hérode Agrippa"], 1, "Matthieu 2:16", "Hérode le Grand, craignant pour son trône, fit tuer les enfants de Bethléem."],
  ["e16", "expert", "Vie de Jésus", "Quel est le nom du serviteur du grand prêtre dont Pierre a coupé l'oreille ?", ["Malchus", "Barabbas", "Alexandre", "Ananias"], 0, "Jean 18:10", "Pierre trancha l'oreille de Malchus, que Jésus guérit aussitôt."],
  ["e17", "expert", "Prophètes", "Sur quelle montagne Élie a-t-il entendu Dieu dans « un léger murmure » ?", ["Sinaï/Horeb", "Carmel", "Thabor", "Nébo"], 0, "1 Rois 19:11-12", "Sur le mont Horeb, Dieu se manifesta à Élie non dans la tempête mais dans un doux murmure."],
  ["e18", "expert", "Juges & Rois", "Qui a succédé à Salomon, sous le règne duquel le royaume d'Israël s'est divisé ?", ["Roboam", "Jéroboam", "Achab", "Josaphat"], 0, "1 Rois 12:1-17", "Le royaume se divisa sous le règne de Roboam, fils et successeur de Salomon."],
  ["e19", "expert", "Juges & Rois", "Comment se nomment les deux royaumes issus de la division d'Israël ?", ["Juda et Benjamin", "Israël et Juda", "Éphraïm et Manassé", "Samarie et Galilée"], 1, "1 Rois 12:19-20", "Le royaume se scinda entre le royaume du Nord (Israël) et celui du Sud (Juda)."],
  ["e20", "expert", "Prophètes", "Quel prophète fut jeté dans une citerne boueuse par les officiers du roi de Juda ?", ["Ésaïe", "Jérémie", "Ézéchiel", "Daniel"], 1, "Jérémie 38:6", "Jérémie fut jeté dans une citerne pour avoir prophétisé la défaite de Jérusalem."],
  ["e21", "expert", "Église primitive", "D'où venait l'eunuque converti par Philippe sur le chemin de Gaza ?", ["D'Égypte", "D'Éthiopie", "De Perse", "De Babylone"], 1, "Actes 8:26-27", "Cet eunuque était trésorier de Candace, reine d'Éthiopie."],
  ["e22", "expert", "Église primitive", "Dans quelle ville les disciples furent-ils appelés « chrétiens » pour la première fois ?", ["Jérusalem", "Antioche", "Rome", "Corinthe"], 1, "Actes 11:26", "C'est à Antioche que le nom de « chrétiens » fut donné pour la première fois aux disciples."],
  ["e23", "expert", "Église primitive", "Qui accompagna Paul lors de son deuxième voyage missionnaire, après sa séparation d'avec Barnabas ?", ["Timothée", "Silas", "Tite", "Marc"], 1, "Actes 15:39-40", "Paul choisit Silas comme compagnon après son différend avec Barnabas au sujet de Marc."],
  ["e24", "expert", "Église primitive", "Quel médecin a écrit un évangile ainsi que le livre des Actes ?", ["Marc", "Luc", "Jean", "Barnabas"], 1, "Colossiens 4:14", "Luc, médecin et compagnon de Paul, est traditionnellement l'auteur de son évangile et des Actes."],
  ["e25", "expert", "Apocalypse", "Sur quelle île Jean a-t-il reçu la vision de l'Apocalypse ?", ["Chypre", "Malte", "Patmos", "Crète"], 2, "Apocalypse 1:9", "Jean était exilé sur l'île de Patmos lorsqu'il reçut cette révélation."],
  ["e26", "expert", "Vie de Jésus", "Quel est le nom du frère de Marthe et Marie que Jésus a ressuscité ?", ["Lazare", "Simon", "Nicodème", "Zachée"], 0, "Jean 11:1-44", "Lazare, frère de Marthe et Marie, fut ramené à la vie par Jésus après quatre jours."],
  ["e27", "expert", "Juges & Rois", "Combien d'années le règne de Salomon a-t-il duré ?", ["20 ans", "40 ans", "70 ans", "25 ans"], 1, "1 Rois 11:42", "Salomon régna quarante ans sur Israël, à Jérusalem."],
  ["e28", "expert", "Genèse", "Quel personnage biblique est l'homme le plus âgé mentionné, avec 969 ans ?", ["Adam", "Noé", "Mathusalem", "Hénoc"], 2, "Genèse 5:27", "Mathusalem, grand-père de Noé, vécut 969 ans."],
  ["e29", "expert", "Genèse", "Combien de personnes furent sauvées dans l'arche de Noé lors du déluge ?", ["4", "6", "8", "10"], 2, "1 Pierre 3:20", "Noé, sa femme, ses trois fils et leurs épouses, soit huit personnes, furent sauvés dans l'arche."],
  ["e30", "expert", "Genèse", "À qui Dieu a-t-il promis un fils malgré son âge avancé et celui de sa femme Sara ?", ["Isaac", "Abraham", "Jacob", "Loth"], 1, "Genèse 18:10-14", "Dieu promit à Abraham et Sara la naissance d'Isaac malgré leur grand âge."],
];

export const INFINITE_QUESTIONS: InfiniteQuestion[] = ROWS.map((r) => ({
  id: r[0],
  difficulty: r[1],
  theme: r[2],
  text: r[3],
  options: r[4],
  correctOption: r[5],
  verseReference: r[6],
  explanation: r[7],
}));

