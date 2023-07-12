/**
 * Cette interface est à l'image de ce que retourne le backend avec l'URL /angular/about
 * Pour avoir les informations techiques du backend
 */

export interface SigctAbout {
    serverHostName?: string;  // Nom du serveur
    serverIpAddress?: string;  // Adresse IP du serveur
    serverType?: string;  // Type de serveur avec sa version
    servletVersion?: string;
    javaVersion?: string;
    clientIpAddress?: string;
    clientNameHost?: string;
    navigatorName?: string;
    navigatorVersion?: string;
    permissions?: Array<any>;
    localeDisplayName?: string;
    localeDisplayCountry?: string;
    localeDisplayLanguage?: string;
    appLocale?: string;
}
