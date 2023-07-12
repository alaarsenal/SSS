
import { MenuItem, target } from 'projects/sigct-ui-ng-lib/src/lib/components/menus/menu-interface';

export function getMenus(env: any) {
  const topRightMenuItems: MenuItem[] = [
    {
      link: "/relances-a-realiser",
      infoBulle: "sigct.ss.f_bandeau.listerelanceinfobulle",
      icon: "fa-bell",
      addBadge: true,
      idBadge: "relances-a-realiser-counter",
      isRouterLink: true,
      target: target.SELF,
      permission: 'ROLE_SO_APPEL_RELANCE, ROLE_SO_APPEL_RELANCE_TOUS',
    },
    {
      link: "/fichesAppel-non-terminees",
      //Comme l'infobulle peut changer selon le nombre d'appel c'est top-menu.component.ts qui renseignera la propriété infoBulle avec une des deux valeurs
      //si dessous selon le nombre de fiche non terminées
      infoBulleFiche: "sigct.so.f_bandeau.appelnonterminfobulle",
      infoBulleAucuneFiche: "sigct.so.f_bandeau.aucunefichenonterminfobulle",
      icon: "fa-phone",
      addBadge: true,
      idBadge: "doc-recent-counter",
      isRouterLink: true,
      target: target.SELF,
    },
    /* 5695: Masquer les outils dans le bandeau des modules SA et SO
    {
      link: "#",
      infoBulle: "sigct.so.f_bandeau.outilinfobulle",
      icon: "fa-cog",
      addToolWarning: true,
    },
    */
    {
      title: "",
      infoBulle: "sigct.so.f_bandeau.infopers",
      link: env.urlPortail + 'sigct/cnf/moncompte',
      icon: "fa-user",
      isUserItem: true,
    },
    {
      link: "#",
      infoBulle: "sigct.so.f_bandeau.aideinfobulle",
      icon: "fa-question-circle",
      isAideEnLigne: true,
      target: target.BLANK,
    },
    {
      icon: "fa-power-off",
      infoBulle: "sigct.so.f_bandeau.deconnexioninfobulle",
      action: () => { },
      isAction: true,
      isLogoutLink: true,
    },
    {
      link: "/a-propos",
      isActive: true,
      infoBulle: "sigct.so.f_bandeau.informationinfobulle",
      icon: "fa-info-circle",
      isAction: false,
      isRouterLink: true,
      target: target.SELF
    }
  ];

  const topLeftMenuItems: MenuItem[] = [
    {
      title: "sigct.so.f_bandeau.portail",
      infoBulle: "sigct.so.f_bandeau.portailinfobulle",
      isSystemeConnexe: false,
      link: env.urlPortail,
      icon: "fa-tty"
    },
    {
      title: "sigct.so.f_bandeau.accueil",
      infoBulle: "sigct.so.f_bandeau.accueilinfobulle",
      link: "/accueil",
      isActive: true,
      isSystemeConnexe: false,
      icon: "fa-home",
      isRouterLink: true,
    }
    ,
    {
      title: "sigct.so.f_bandeau.pilotage",
      permission: 'ROLE_SO_APPEL_PILOTAGE',
      infoBulle: "sigct.so.f_bandeau.pilotageinfobulle",
      icon: "fa-wrench",
      isSystemeConnexe: false,
      children: [
        {
          title: "À propos de",
          link: "#",
          icon: "fa-building",
        },
        {
          title: "sigct.so.pilotage.tableref.titre",
          link: "/piloter-tables-references",
          icon: "fa-wrench",
          permission: 'ROLE_SO_APPEL_PILOTAGE',
          isRouterLink: true,
        },
        {
          title: "sigct.so.pilotage.parametresys.titre",
          link: "/piloter-params-systeme",
          icon: "fa-wrench",
          permission: 'ROLE_SO_APPEL_PILOTAGE',
          isRouterLink: true,
        },
        {
          title: "sigct.ss.pilotage.info_utile.liste.titre",
          link: "/piloter-info-utile-page",
          icon: "fa-wrench",
          permission: 'ROLE_SO_APPEL_PILOTAGE',
          isRouterLink: true,
        }
      ]
    }, 
     {
      title: "sigct.so.f_bandeau.rapport",
      infoBulle: "sigct.so.f_bandeau.rapportinfobulle",
      icon: "fa-bar-chart",
      isSystemeConnexe: false,
      permission: 'ROLE_SO_RAPPORT_AUD,ROLE_US_RAPPORT_FUSION,ROLE_US_RAPPORT_FUSION_PROV',
      children: [
        {
          title: "sigct.ss.f_rapport_journ.titre",
          link: "/journal",
          icon: "fa-newspaper-o",
          permission: 'ROLE_SO_RAPPORT_AUD',
          isRouterLink: true,
        },
        {
          title: "sigct.rapport.fusionusager.menu",
          link: "/rapport-fusion",
          icon: "fa-compress",
          permission: "ROLE_US_RAPPORT_FUSION,ROLE_US_RAPPORT_FUSION_PROV",
          isRouterLink: true,
        }
      ],
    },
     {
      title: "sigct.config.autre.systeme.label",
      infoBulle: "sigct.sa.f_bandeau.systemeinfobulle",
      icon: "fa-laptop",
      children: [],
      isChildrenAction: true,
      isSystemeConnexe: true
    }
  ];

  return { "topRightMenuItems": topRightMenuItems, "topLeftMenuItems": topLeftMenuItems };
}
