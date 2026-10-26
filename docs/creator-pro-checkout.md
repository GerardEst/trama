# Creator i Pro: landing i checkout

## Model actual

- Basic deixa d’aparèixer a la landing, el registre i la comparació de plans del compte.
- Creator conserva els Payment Links existents: 5,95 €/mes o 49,95 €/any. Inclou les funcions actuals de l’editor, seguiment, analítiques, personalització i descàrrega JSON.
- Pro és una proposta de pagament únic amb exportació, amb referència orientativa d’uns 200 €. No hi ha preu final, data, format ni abast definitius. No hi ha checkout ni exportador implementats.
- El selector mensual/anual només afecta Creator. No canvia la referència de Pro.
- Les subscripcions Pro antigues es mostren com a subscripcions heretades, no com a compres del nou Pro. No es migren ni es cancel·len automàticament.

## Flux de Creator

1. La landing passa `plan=creator&period=monthly|yearly` al registre.
2. El registre i el login mantenen la selecció i mostren el preu abans de continuar.
3. Un error d’autenticació o un registre sense sessió no obre Stripe. Si cal confirmar el correu, s’informa l’usuari.
4. OAuth i la confirmació del correu tornen a una URL interna `/login?mode=login&plan=creator&period=…&checkout=continue`.
5. El retorn verifica l’usuari amb Supabase i elimina el marcador d’un sol ús abans d’obrir Stripe, per evitar bucles en tornar enrere.
6. `CheckoutService` només accepta Creator i períodes coneguts. Preomple l’email retornat pel servidor amb `URLSearchParams` i navega a Stripe a la mateixa pestanya.
7. El client no dona cap pla per adquirit a partir dels paràmetres de la URL. Els webhooks existents continuen sent responsables de reflectir el pagament.

Els enllaços recurrents de Pro s’han retirat de la configuració del client. Les URL antigues amb `plan=pro` mostren un avís i no s’interpreten com una compra de Creator.

## Comprovacions abans de publicar

No s’han desplegat canvis ni s’ha modificat Stripe o la configuració remota de Supabase.

- **Supabase Auth:** permetre els retorns de Creator sota `/login` (mensual i anual) a l’allowlist de Redirect URLs, tant al domini de producció com a l’entorn de desenvolupament. No s’ha d’afegir Stripe com a retorn OAuth. Referència: https://supabase.com/docs/guides/auth/redirect-urls
- **Stripe:** verificar manualment que els Payment Links de Creator de cada entorn corresponen als imports i períodes anunciats, i que el webhook real reflecteix un pagament completat. Les proves locals intercepten totes les peticions de pagament.
- **Cancel·lació:** es conserva l’endpoint existent, que cancel·la immediatament. Els textos no prometen accés fins al final del període. Qualsevol canvi d’aquesta política requereix revisar backend i condicions.
- **Pro:** abans de vendre’l cal decidir el preu final, l’exportador i les condicions, i implementar un cobrament únic separat. No es poden reutilitzar els enllaços recurrents antics.

## Proves

- Unitats: `checkout.service.spec.ts`, `pricing.component.spec.ts`, `login.component.spec.ts`, `landingpage.component.spec.ts` i `profile-modal.component.spec.ts`.
- Navegador: `tests/checkout/checkout.test.ts` simula autenticació, retorns i Stripe; no crea comptes ni cobraments.
- `tests/landing/` cobreix el model comercial en CA/ES/EN, el tema, l’adaptació mòbil i les crides a Creator.

Aquestes proves no substitueixen una verificació real del pagament, dels webhooks o de Google OAuth abans del desplegament.
