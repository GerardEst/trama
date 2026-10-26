import { test, expect } from '@playwright/test'
import { mkdir } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import type { tree } from '../../src/app/core/interfaces/interfaces'
import { environment } from '../../src/environments/environment'

// Real UI, fictional author/story. Every backend request is intercepted.
const captureDirectory = join(tmpdir(), 'trama-landing-captures')
test.beforeAll(() => mkdir(captureDirectory, { recursive: true }).then(() => undefined))

const stories = {
  ca: { title: 'La clau de l’arxiu', opening: 'Davant de l’arxiu', passage: '<p>Arribes a l’arxiu quan es fa fosc. A l’altra banda de la porta, una llum encara tremola.</p><p>El guardià et reconeix, però no diu res. A la mà duus la carta que et va confiar la teva germana.</p><p>Si la hi ensenyes, potser et deixarà entrar. També pots provar el camí del jardí.</p>', answer1: 'Ensenya la carta al guardià', answer2: 'Busca una entrada al jardí', room: 'La sala dels mapes', roomText: '<p>El guardià somriu i t’obre la porta. La carta ha fet la seva feina.</p><p>Sobre la taula hi ha un mapa amb el nom de la teva germana. Ara ja saps on començar a buscar.</p>', garden: 'El camí del jardí', gardenText: '<p>Una finestra mig oberta dona a la sala dels mapes. Travesses el jardí en silenci.</p>', finish: 'Segueix el mapa', ending: 'Una nova pista', endText: '<p>Plegues el mapa. La història de la teva germana acaba de començar.</p>', preview: 'Previsualitza', edit: 'Edita', close: 'Tanca la previsualització', share: 'Comparteix' },
  es: { title: 'La llave del archivo', opening: 'Ante el archivo', passage: '<p>Llegas al archivo al anochecer. Al otro lado de la puerta, una luz todavía tiembla.</p><p>El guardián te reconoce, pero no dice nada. Llevas en la mano la carta que te confió tu hermana.</p><p>Si se la enseñas, quizá te deje entrar. También puedes probar el camino del jardín.</p>', answer1: 'Enseña la carta al guardián', answer2: 'Busca una entrada en el jardín', room: 'La sala de los mapas', roomText: '<p>El guardián sonríe y te abre la puerta. La carta ha cumplido su cometido.</p><p>Sobre la mesa hay un mapa con el nombre de tu hermana. Ahora ya sabes dónde empezar a buscar.</p>', garden: 'El camino del jardín', gardenText: '<p>Una ventana entreabierta da a la sala de los mapas. Cruzas el jardín en silencio.</p>', finish: 'Sigue el mapa', ending: 'Una nueva pista', endText: '<p>Pliegas el mapa. La historia de tu hermana acaba de empezar.</p>', preview: 'Previsualizar', edit: 'Editar', close: 'Cerrar vista previa', share: 'Compartir' },
  en: { title: 'The archive key', opening: 'Outside the archive', passage: '<p>You reach the archive at dusk. Beyond the door, a light still flickers.</p><p>The keeper recognises you, but says nothing. In your hand is the letter your sister entrusted to you.</p><p>If you show it to him, he might let you in. You could also try the garden path.</p>', answer1: 'Show the keeper the letter', answer2: 'Find a way in through the garden', room: 'The map room', roomText: '<p>The keeper smiles and opens the door. The letter has done its work.</p><p>On the table lies a map with your sister’s name. Now you know where to start looking.</p>', garden: 'The garden path', gardenText: '<p>A half-open window leads into the map room. You cross the garden in silence.</p>', finish: 'Follow the map', ending: 'A new lead', endText: '<p>You fold the map. Your sister’s story has only just begun.</p>', preview: 'Preview', edit: 'Edit', close: 'Close preview', share: 'Share' },
}

for (const lang of ['ca', 'es', 'en'] as const) {
  test(`capture ${lang}`, async ({ page }) => {
    const s = stories[lang]
    const authorId = '00000000-0000-4000-8000-000000000021'
    const storyId = '00000000-0000-4000-8000-000000000022'
    const user = { id: authorId, email: 'author@example.invalid', aud: 'authenticated', role: 'authenticated' }
    const storyTree: tree = {
      entryPoint: { left: 4780, top: 5000, targetNodeId: 'node_0' },
      nodes: [
        { id: 'node_0', name: s.opening, type: 'content', top: 5000, left: 5000, text: s.passage, answers: [
          { id: 'answer_0_0', text: s.answer1, join: [{ node: 'node_1' }] },
          { id: 'answer_0_1', text: s.answer2, join: [{ node: 'node_2' }] },
        ] },
        { id: 'node_1', name: s.room, type: 'content', top: 4840, left: 5470, text: s.roomText,
          answers: [{ id: 'answer_1_0', text: s.finish, join: [{ node: 'node_3' }] }] },
        { id: 'node_2', name: s.garden, type: 'content', top: 5480, left: 5470, text: s.gardenText,
          answers: [{ id: 'answer_2_0', text: s.finish, join: [{ node: 'node_3' }] }] },
        { id: 'node_3', name: s.ending, type: 'end', top: 5180, left: 5940, text: s.endText },
      ], refs: {}, categories: [],
    }
    const authKey = `sb-${new URL(environment.apiUrl).hostname.split('.')[0]}-auth-token`
    await page.addInitScript(({ authKey, user, storyId, lang }) => {
      const expiresAt = Math.floor(Date.now() / 1000) + 3600
      const token = `${btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))}.${btoa(JSON.stringify({ sub: user.id, exp: expiresAt, role: 'authenticated' }))}.invalid-test-signature`
      localStorage.setItem(authKey, JSON.stringify({ access_token: token, refresh_token: 'invalid-test-refresh', token_type: 'bearer', expires_at: expiresAt, expires_in: 3600, user }))
      localStorage.setItem('polo-id', storyId)
      localStorage.setItem('polo-lang', lang)
    }, { authKey, user, storyId, lang })
    await page.route(`${environment.apiUrl}/**`, async route => {
      const path = new URL(route.request().url()).pathname
      if (path === '/auth/v1/user') await route.fulfill({ json: user })
      else if (path === '/rest/v1/profiles') await route.fulfill({ json: [{ subscription_status: 'active', plan: 'creator', user_name: s.title }] })
      else if (path === '/rest/v1/stories' && route.request().method() === 'GET') await route.fulfill({ json: [{ id: storyId, name: s.title, tree: storyTree, tracking: false, sharing: false, tapLink: false, cumulativeMode: false, footer: {}, custom_id: null }] })
      else await route.abort()
    })
    page.on('pageerror', error => process.stderr.write(`PAGE ERROR: ${error.message}\n`))
    await page.goto('/dashboard')
    const legend = page.locator('polo-menu-tree-legend')
    await expect(page.locator('polo-node')).toHaveCount(4)
    await page.evaluate(() => document.fonts.ready)
    await page.mouse.move(820, 480)
    await page.keyboard.down('Alt')
    await page.mouse.wheel(0, 350)
    await page.keyboard.up('Alt')
    await page.waitForTimeout(600)
    await page.mouse.move(710, 780)
    await page.mouse.down()
    await page.mouse.move(440, 705, { steps: 12 })
    await page.mouse.up()
    await page.mouse.move(0, 0)
    await page.screenshot({ path: join(captureDirectory, `${lang}-map.png`), animations: 'disabled' })
    await page.locator('polo-menu .menuToggler button').click()
    await page.mouse.move(1550, 600)
    await legend.getByRole('button', { name: s.preview, exact: true }).click()
    const divider = page.getByRole('separator')
    await divider.focus()
    for (let i = 0; i < 4; i++) await divider.press('ArrowLeft')
    const linear = page.locator('polo-linear-editor')
    await page.waitForTimeout(500)
    await linear.locator('.linearContext > button').click()
    const edit = linear.getByRole('button', { name: s.edit, exact: true })
    await edit.focus()
    await edit.press('Enter')
    await expect(linear.getByRole('textbox')).toHaveCount(3)
    await page.mouse.move(1550, 600)
    await page.screenshot({ path: join(captureDirectory, `${lang}-write.png`), animations: 'disabled' })
    await linear.getByRole('button', { name: s.preview, exact: true }).click()
    await expect(linear.getByRole('button', { name: s.answer1, exact: true })).toBeVisible()
    await page.screenshot({ path: join(captureDirectory, `${lang}-preview.png`), animations: 'disabled' })
    await linear.getByRole('button', { name: s.close, exact: true }).click()
    await legend.getByRole('button', { name: s.share, exact: true }).click()
    await expect(page.locator('polo-share-story .modal')).toBeVisible()
    await page.waitForTimeout(300)
    await page.screenshot({ path: join(captureDirectory, `${lang}-share.png`), animations: 'disabled' })
  })
}
