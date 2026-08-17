// Cada panel exporta: { id, label, needsKey (nombre de env var o null), fetchData() }
// fetchData() debe manejar sus propios errores y nunca tirar — si algo falla,
// retorna { error: '...' } para que el panel se muestre como "no disponible"
// en vez de romper el resto del dashboard.

import * as earthquakes from './earthquakes.js';
import * as weather from './weather.js';
import * as crypto from './crypto.js';
import * as predictions from './predictions.js';
import * as redalert from './redalert.js';
import * as flights from './flights.js';
import * as gdacs from './gdacs.js';
import * as fema from './fema.js';
import * as nina from './nina.js';
import * as acled from './acled.js';
import * as firms from './firms.js';
import * as cloudflareRadar from './cloudflare.js';
import * as threatfox from './threatfox.js';
import * as ukrainealerts from './ukrainealerts.js';
import * as iss from './iss.js';
import * as nws from './nws.js';
import * as forex from './forex.js';
import * as fred from './fred.js';
import * as maritime from './maritime.js';

export const PANELS = [
  earthquakes,
  weather,
  crypto,
  forex,
  predictions,
  redalert,
  flights,
  iss,
  gdacs,
  fema,
  nina,
  nws,
  acled,
  firms,
  cloudflareRadar,
  threatfox,
  ukrainealerts,
  fred,
  maritime,
];

export function panelStatus(panel) {
  const configured = !panel.needsKey || Boolean(process.env[panel.needsKey]);
  return {
    id: panel.id,
    label: panel.label,
    configured,
    needsKey: panel.needsKey || null,
    setupUrl: panel.setupUrl || null,
  };
}
