export enum target {
  BLANK = "_blank",
  SELF = "_self",
  PARENT = "_parent",
  TOP = "top"
}


export interface MenuItem {
  id?: string; // l'id du menu item, utilisée aux li
  title?: string; // Texte affiché à côté de l'icône
  infoBulle?: string; // Texte de l'infoBulle
  link?: string;
  icon?: string;
  children?: Array<MenuItem>;
  action?: Function;  // est utilisée que si isAction est à True, indique la fonction utilisée
  isAction?: boolean; // La valeur par défaut est false
  // Si isAction est à True  ajoutera un évènement (click) à la balse <A ...> qui déclanchera la fonction indiqué dans action (champ au-dessus)
  // Si isAction est à False ajoutera une propriété à la balise <A ...> target avec comme contenu la valeur du champ target (champ au-dessous) et :
  //     Si isRouterLink à True  la propriété routerLink avec le champ link
  //     Si isRouterLink à False la propriété href avec le champ link
  target?: target;

  isActive?: boolean; // Si a True affiche le texte de l'item en blanc sur fond noir. Dans la balise li ajout de la classe CSS active
  // S'applique uniquement au menu de gauche
  addBadge?: boolean; // Si a True affiche à la droite de l'icône une pastille (badge) avec un numéro
  // S'applique uniquement au menu de droite
  idBadge?: string;   // Permet d'indiquer l'identifiant du badge, pour utiliser ce champ il faut que addBadge soit à True sinon il ne sera pas utilisée
  // S'applique uniquement au menu de droite
  addToolWarning?: boolean; // Si a True affiche en exposant un triangle avec un point d'exclamation
  // S'applique uniquement au menu de droite
  disabled?: boolean;  // Si à True, l'item est non sélectionnable (non cliquable).
  visible?: boolean;  // Si à True, l'item est visible.
  isAideEnLigne?: boolean; // Permet d'indiquer si l'item est l'aide en ligne afin d'indiquer au traitement qu'il devra mettre à jour le lien (link)
  // à chaque changement d'URL
  isUserItem?: boolean; // Permet d'indiquer si l'item est celui du user, utile pour la gestion de l'expiration du mot de passe
  isRouterLink?: boolean; // Cette propriété est utilisée quand isAction est à false
  // Si elle est à True  on utilisera routerLink, link doit commencer par / sinon dans le HTML le contenu de link sera entre parenthèse
  // Si elle est à False on utilisera href,
  isColorHighlited?: boolean;     // si a True on change la couleur de l'icone en orange , si false on change la couleur de l'icone en bleu
  [key: string]: any;

  isChildrenAction?: boolean; // Si a True contient des enfants avec des actions. Utilisé surtout dans le top right menu qui n'en disposait pas.

  isSystemeConnexe?: boolean; // Si a True Système connexe
  permission?: string;  //Si informée, c'est la permission pour visualizer l'item du menu. Utiliser une virgule pour séparer plusieurs permissions.

}
