import { MenuItem, target } from 'projects/sigct-ui-ng-lib/src/lib/components/menus/menu-interface';

export function getMenus(env: any) {
  const topLeftMenuItems: MenuItem[] = [
    {
      title: "sigct.us.f_bandeau.portail",
      infoBulle: "sigct.us.f_bandeau.portailinfobulle",
      link: env.urlPortail,
      isSystemeConnexe: false,
      icon: "fa-tty"
    },
    {
      title: "sigct.us.f_bandeau.accueil",
      infoBulle: "sigct.us.f_bandeau.accueilinfobulle",
      link: "/accueil",
      isActive: true,
      icon: "fa-home",
      isSystemeConnexe: false,
      isRouterLink: true,
      // },
      // {
      //   title: "sigct.us.f_bandeau.rechercher_usager",
      //   link: "recherche",
      //   icon: "fa-stethoscope",
      //   infoBulle: "sigct.us.f_bandeau.rechercher_usager",
    },
    {
      title: "sigct.us.f_bandeau.pilotage",
      infoBulle: "sigct.us.f_bandeau.pilotageinfobulle",
      permission: 'ROLE_US_PILOTAGE',
      isSystemeConnexe: false,
      icon: "fa-wrench",
      children: [
        {
          title: "sigct.ss.pilotage.tableref.titre",
          link: "/piloter-tables-references",
          icon: "fa-wrench",
          permission: 'ROLE_US_PILOTAGE',
          isRouterLink: true,
        },
        {
          title: "sigct.ss.pilotage.info_utile.liste.titre",
          link: "/piloter-info-utile-page",
          icon: "fa-wrench",
          permission: 'ROLE_US_PILOTAGE',
          isRouterLink: true,
        }
      ]
    },
    {
      title: "sigct.us.f_bandeau.rapport",
      infoBulle: "sigct.us.f_bandeau.rapportinfobulle",
      icon: "fa-bar-chart",
      isSystemeConnexe: false,
      permission: 'ROLE_US_RAPPORT_AUD,ROLE_US_RAPPORT_FUSION,ROLE_US_RAPPORT_FUSION_PROV',
      children: [
        {
          title: "sigct.ss.f_rapport_journ.titre",
          link: "/journal",
          icon: "fa-newspaper-o",
          permission: 'ROLE_US_RAPPORT_AUD',
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
    }
  ];

  const topRightMenuItems: MenuItem[] = [
    {
      title: "",
      infoBulle: "sigct.us.f_bandeau.infopers",
      link: env.urlPortail + '/sigct/cnf/moncompte',
      icon: "fa-user",
      isUserItem: true,
    },
    {
      link: "#",
      infoBulle: "sigct.us.f_bandeau.aideinfobulle",
      icon: "fa-question-circle",
      isAideEnLigne: true,
      target: target.BLANK,
    },
    {
      icon: "fa-power-off",
      infoBulle: "sigct.us.f_bandeau.deconnexioninfobulle",
      action: () => { },
      isAction: true,
      isLogoutLink: true,
    },
    {
      link: "/a-propos",
      isActive: true,
      infoBulle: "sigct.us.f_bandeau.informationinfobulle",
      icon: "fa-info-circle",
      isAction: false,
      isRouterLink: true,
      target: target.SELF,
    }
  ];

  return { "topRightMenuItems": topRightMenuItems, "topLeftMenuItems": topLeftMenuItems };
}
