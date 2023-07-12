export class SigctModuleEnum {
    static readonly SANTE = new SigctModuleEnum("SA", "SANTE", "infosante", "sigct.sa.f_accueil.titre");
    static readonly SOCIAL = new SigctModuleEnum("SO", "SOCIAL", "infosocial", "sigct.so.f_accueil.titre");
    static readonly USAGER = new SigctModuleEnum("US", "USAGER", "usager", "sigct.us.f_accueil.titre");
    static readonly M10 = new SigctModuleEnum("M10", "M10", "m10", "sigct.m10.titre");

    // private to disallow creating other instances of this type
    private constructor(private readonly acronyme: string, private readonly key: string, private readonly appName: string, private readonly libelle: string) {
    }

    getAcronyme(): string {
        return this.acronyme;
    }

    getKey(): string {
        return this.key;
    }

    getAppName(): string {
        return this.appName;
    }

    getLibelle(): string {
        return this.libelle;
    }

    toString(): string {
        return this.key;
    }

    static getByAppName(appName: string): SigctModuleEnum {
        if (!appName) {
            return null;
        }
        if (appName === SigctModuleEnum.SANTE.appName) {
            return SigctModuleEnum.SANTE;
        }
        if (appName === SigctModuleEnum.SOCIAL.appName) {
            return SigctModuleEnum.SOCIAL;
        }
        if (appName === SigctModuleEnum.USAGER.appName) {
            return SigctModuleEnum.USAGER;
        }
        if (appName === SigctModuleEnum.M10.appName) {
            return SigctModuleEnum.M10;
        }
        return null;
    }

    static getByAcronyme(acronyme: string): SigctModuleEnum {
        if (!acronyme) {
            return null;
        }
        if (acronyme === SigctModuleEnum.SANTE.acronyme) {
            return SigctModuleEnum.SANTE;
        }
        if (acronyme === SigctModuleEnum.SOCIAL.acronyme) {
            return SigctModuleEnum.SOCIAL;
        }
        if (acronyme === SigctModuleEnum.USAGER.acronyme) {
            return SigctModuleEnum.USAGER;
        }
        if (acronyme === SigctModuleEnum.M10.acronyme) {
            return SigctModuleEnum.M10;
        }
        return null;
    }
}

