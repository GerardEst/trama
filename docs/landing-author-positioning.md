# Landing orientada a autors

> Nota: aquest document descriu la iteració anterior. El model Basic/Creator i la recerca sense preu han estat substituïts per [Creator i Pro: landing i checkout](creator-pro-checkout.md). Els detalls històrics següents no són l’oferta actual.

## Abast

Canvis de missatge i presentació en CA, ES i EN. No canvia el motor narratiu, la subscripció, la base de dades ni la infraestructura. La segmentació és una hipòtesi comercial; aquests canvis no demostren demanda ni disposició a pagar.

Recorregut: **hero i demo → escriure/connectar/provar/compartir → possibilitats narratives → confiança → Basic/Creator → preguntes → crida final**.

- Es manté la demo «El darrer llindar» i la identitat paper/bosc/ambre.
- El recorregut mostra captures de l’editor real amb una història fictícia, no funcionalitats futures. La vista lineal permet editar passatges i respostes; la creació estructural continua al mapa.
- Es retira la llicència proposada de 299 €. L’exportació jugable només apareix com una exploració, sense preu ni data.
- El JSON es presenta com a dades: text, estructura i configuració. No és un joc HTML independent, no empaqueta les imatges i encara no hi ha importació/restauració per a l’usuari.
- Es distingeix desfer/refer durant la sessió d’un historial permanent de versions.
- La metadescripció deixa d’insinuar analítiques disponibles.
- No s’han afegit garanties jurídiques de propietat: no s’han trobat condicions del servei que permetin verificar-les.

## Cancel·lació: verificació i límit

La inspecció del codi troba:

1. `supabase/functions/cancel-subscription-request/index.ts` crida `stripe.subscriptions.cancel()`, no una cancel·lació programada al final del període.
2. `DatabaseService.userPlanIs()` pot mantenir permisos per a un estat `canceled` amb `next_payment` futura.
3. El menú del panell i la landing identifiquen la subscripció només amb l’estat `active`; la creació gratuïta es bloqueja quan ja hi ha 3 històries.
4. El webhook actualitza l’estat, el pla i el final del període. No s’ha verificat el comportament complet amb Stripe/Supabase reals ni les polítiques del backend.

Per això la FAQ no promet que tots els permisos i enllaços sobrevisquin durant tot el període pagat, ni que s’eliminin històries en cancel·lar. Ofereix els límits coneguts, la descàrrega JSON i un contacte per confirmar cada cas. **Cal resoldre la inconsistència i validar el flux real abans de publicar una garantia més específica.** No s’ha modificat ni desplegat el backend.

## Captures

Assets: `src/assets/images/landing/authoring/`.

Generació reproduïble: `scripts/capture-landing-authoring/README.md`. El script intercepta totes les peticions de Supabase i no utilitza cap compte real. Les imatges visibles s’han capturat amb una compilació de producció servida localment.

## Verificació

Proves unitàries específiques:

```bash
npm test -- --watch=false --browsers=ChromeHeadlessNoSandbox \
  --include='src/app/features/landing-page/**/*.spec.ts' \
  --include='src/app/core/i18n/i18n.service.spec.ts'
```

Les proves a `tests/landing/` cobreixen la demo, el carregament diferit, els idiomes, el tema, la guia, els plans i el nou recorregut. La comprovació local usa Chromium i WebKit, sense estat autenticat i sense una sessió real de pagament. El runner temporal és `/tmp/trama-author-landing/playwright.config.cjs`:

```bash
npx playwright test --config=/tmp/trama-author-landing/playwright.config.cjs
npm run lint
npm run build -- --output-path=/tmp/trama-author-landing/build
```

La sortida de build es manté fora del repositori. També s’ha fet una comprovació automàtica amb axe-core en clar/fosc a 1440 i 390 px; això no substitueix una auditoria completa amb tecnologia assistiva.

## Fora d’aquest canvi

- Validació comercial amb autors i comparativa amb Twine/Moiki.
- Exportació jugable, importació, versions durables i separació esborrany/publicació.
- HTML públic prerenderitzat i sitemap real: no queden resolts per una metadescripció nova.
- Condicions de propietat intel·lectual i comportament contractual de la cancel·lació.
- Desplegament, commit o push.
