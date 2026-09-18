// Ce fichier ne contient aucune reponse de quiz : il peut etre importe
// sans risque par des composants client (contrairement a
// infiniteQuestions.ts, reserve au serveur).

export const LEVEL_UP_MESSAGES: string[] = [
  "Bravo, tu progresses de foi en foi ! 🙌",
  "Excellent ! « Que ta lumière brille » (Matthieu 5:16) — continue ainsi !",
  "Superbe ! Ta connaissance de la Parole grandit, niveau après niveau.",
  "Bien joué ! « L'entrée de tes paroles éclaire » (Psaume 119:130).",
  "Magnifique parcours jusqu'ici, prêt(e) pour la suite ?",
  "Tu avances comme un bon et fidèle serviteur, continue !",
  "Quelle belle persévérance ! Un niveau de plus dans ta besace.",
  "Bravo ! Chaque question te rapproche un peu plus des Écritures.",
];

export function pickRandomLevelUpMessage(): string {
  return LEVEL_UP_MESSAGES[Math.floor(Math.random() * LEVEL_UP_MESSAGES.length)];
}
