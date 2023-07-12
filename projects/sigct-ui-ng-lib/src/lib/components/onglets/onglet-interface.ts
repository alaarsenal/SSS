export interface OngletItem {
    id: any; // Identifiant de l'onglet
    libelle: string; // Texte affiché su l'onglet
    isUsagerLinked: boolean; // Indique si un usager est relié
    urlSuffixeOnglet: string; // Le suffixe de l'url de l'onglet
    isSelected: boolean; // Indique si l'onglet est sélectionné
    url?: string; // Url appelé lors d'un clic sur l'onglet. Si absent, un événement onClick est levé.
}