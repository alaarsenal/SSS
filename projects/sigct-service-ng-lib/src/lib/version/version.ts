/**
 * Cette interface est à l'image de ce que retourne le backend avec l'URL reference/system/config
 * Pour avoir les informations sur les différentes versions
 */

export interface Version {
    versionGlobal?: string;  // Version de l'application globale SIGCT
    appVersion?: string; // Version du projet (info-santé, social, ...)
    buildnumber?: string; 
}