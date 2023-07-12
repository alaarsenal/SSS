import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppModule } from './app/app.module';

async function fetchConfigAndLaunchApp() {
  let portailHostUrl: string = "./portail-host"
  if (window.location.hostname == "localhost") {
    portailHostUrl = "http://localhost:8080/usager/portail-host";
  }
  // Récupère l'url du portail
  let response: Response = await fetch(portailHostUrl);
  const portailHost: string = await response.text();

  // Récupère du Portail les variables d'environnement Angular
  const envUrl: string = (portailHost?.endsWith("/") ? portailHost : portailHost + "/") + "variables-environnement-angular?appName=usager"
  response = await fetch(envUrl);
  const environnement: any = await response.json();

  let script = document.createElement("script");
  script.type = "text/javascript";
  // Ajoute les variables d'environnement à l'objet window afin qu'elles soient accessibles partout
  script.innerHTML = `window.env = ${JSON.stringify(environnement)};`;
  // Insère le javascript dans le header de la page html
  document.getElementsByTagName('head')[0].appendChild(script);

  if (environnement.production) {
    enableProdMode();
  }

  platformBrowserDynamic().bootstrapModule(AppModule).catch(err => console.error(err));
}

fetchConfigAndLaunchApp();
