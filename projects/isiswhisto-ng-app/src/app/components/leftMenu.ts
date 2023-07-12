import { MenuItem } from 'projects/sigct-ui-ng-lib/src/lib/components/menus/menu-interface';

const leftMenuItems: MenuItem[] = [
  {
    id: "menuItemUsagerLeftMenuItemsConstantRechercherId",
    title: "usager.menuvert.btnrechercher",
    link: "/rechercher",
    icon: "fa fa-search",
    disabled: false,
    visible: true
  },
  {
    id: "menuItemUsagerLeftMenuItemsConstantConsulterId",
    title: "usager.menuvert.btnconsulter",
    link: "/consulter",
    icon: "fa fa-user",
    disabled: true,
    visible: false
  }
];

export const leftMenu = { "leftMenuItems": leftMenuItems };

