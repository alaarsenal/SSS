import { MenuItem, target } from 'projects/sigct-ui-ng-lib/src/lib/components/menus/menu-interface';

const leftMenuItems: MenuItem[] = [
    {
      id: "menuItemUsagerLeftMenuItemsConstantRechercherId",
      title: "usager.menuvert.btnrechercher",
      link: "/recherche",
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
    },
    {
      id: "menuItemUsagerLeftMenuItemsConstantRootId",
      title: "usager.menuvert.btnconsultappel",
      icon: "fa fa-file-text",
      link: "",
      disabled: true,
      visible: false
    },
    {
      id: "menuItemUsagerLeftMenuItemsConstantEditerId",
      title: "usager.menuvert.btnmodifier",
      link: "/editer",
      icon: "fa fa-edit",
      disabled: true,
      visible: false
    },
    {
      id: "menuItemUsagerLeftMenuItemsConstantEnregistrementId",
      title: "usager.menuvert.btnenregistrement",
      link: "/enregistrements",
      icon: "fa icon-address-card-o",
      disabled: true,
      visible: false
    },
    {
      id: "menuItemUsagerLeftMenuItemsConstantGenererId",
      title: "usager.menuvert.btnajouterenregistrement",
      link: "/enregistrement/generer",
      icon: "fa fa-plus",
      disabled: true,
      visible: false
    }
  ];

  export const leftMenu={"leftMenuItems":leftMenuItems};

