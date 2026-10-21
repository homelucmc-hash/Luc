import { expect, test } from '@playwright/test'

test('hero navigation, imagery and page have no browser errors or overflow', async ({ page }) => {
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  await page.goto('/')
  await expect(page.getByRole('heading', { level: 1 })).toContainText('DES SOMMETS')
  await page.getByRole('button', { name: 'Image suivante', exact: true }).click()
  await expect(page.getByRole('heading', { level: 1 })).toContainText('PLEIN CADRE')
  await page.getByRole('button', { name: 'Image précédente', exact: true }).click()
  await expect(page.getByRole('heading', { level: 1 })).toContainText('DES SOMMETS')
  await expect.poll(() => page.locator('.hero-images img').first().evaluate((image: HTMLImageElement) => image.complete && image.naturalWidth > 0)).toBeTruthy()
  await expect(page.locator('body')).toHaveJSProperty('scrollWidth', await page.evaluate(() => innerWidth))
  expect(errors).toEqual([])
})

test('all exploration chapters activate and the 3D renderer loads', async ({ page }) => {
  await page.goto('/')
  await page.locator('#domaine').scrollIntoViewIfNeeded()
  await expect(page.locator('.mountain-scene')).toHaveAttribute('data-renderer', 'webgl')
  for (const name of ['Prendre de la hauteur', 'Suivre son instinct', 'Revenir à l’essentiel']) {
    const chapter = page.getByRole('button', { name: new RegExp(name) })
    await chapter.click()
    await expect(chapter).toHaveAttribute('aria-pressed', 'true')
  }
})

test('experience ideas persist and Escape returns focus to the opener', async ({ page }) => {
  await page.goto('/')
  const opener = page.getByRole('button', { name: 'Découvrir : Tracer sa liberté.' })
  await opener.click()
  await expect(page.getByRole('dialog')).toBeVisible()
  await page.getByRole('button', { name: 'Garder cette idée' }).click()
  await expect(page.getByRole('button', { name: 'Idée enregistrée' })).toHaveAttribute('aria-pressed', 'true')
  await page.keyboard.press('Escape')
  await expect(page.getByRole('dialog')).toHaveCount(0)
  await expect(opener).toBeFocused()
  await page.reload()
  await opener.click()
  await expect(page.getByRole('button', { name: 'Idée enregistrée' })).toHaveAttribute('aria-pressed', 'true')
})

test('trip planner validates dates, tailors suggestions and supports editing', async ({ page }) => {
  await page.goto('/')
  const opener = page.getByRole('button', { name: 'Imaginer mon séjour', exact: true }).first()
  await opener.click()
  await expect(page.getByRole('dialog')).toBeVisible()
  const arrival = page.getByLabel('Votre arrivée')
  await arrival.fill('2020-01-01')
  await page.getByRole('button', { name: 'Dessiner mon séjour' }).click()
  expect(await arrival.evaluate((input: HTMLInputElement) => input.validity.valid)).toBe(false)
  const future = new Date(); future.setDate(future.getDate() + 50)
  const date = [future.getFullYear(), String(future.getMonth() + 1).padStart(2, '0'), String(future.getDate()).padStart(2, '0')].join('-')
  await arrival.fill(date)
  await page.getByLabel('Slow altitude', { exact: false }).check()
  await page.getByRole('button', { name: 'Dessiner mon séjour' }).click()
  await expect(page.getByRole('heading', { name: 'Votre envie de là-haut.' })).toBeVisible()
  await expect(page.getByText('Une parenthèse au chaud.', { exact: true })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Consulter le site officiel' })).toHaveAttribute('href', 'https://www.valthorens.com/')
  await page.getByRole('button', { name: 'Modifier mes envies' }).click()
  await expect(arrival).toHaveValue(date)
  await page.keyboard.press('Escape')
  await expect(opener).toBeFocused()
})

test('reduced motion retains a usable page and accessible mobile navigation', async ({ page, isMobile }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/')
  if (isMobile) {
    const menu = page.getByRole('button', { name: 'Ouvrir le menu' })
    await menu.click()
    await page.getByRole('dialog').getByRole('link', { name: 'À vivre' }).click()
    await expect(page.getByRole('dialog')).toHaveCount(0)
  } else {
    await page.getByRole('navigation', { name: 'Navigation principale' }).getByRole('link', { name: 'À vivre' }).click()
  }
  await expect(page).toHaveURL(/#experiences$/)
  await expect(page.getByRole('heading', { name: 'À chacun son altitude.' })).toBeVisible()
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBeTruthy()
})

test('mountain lighting changes without losing the selected exploration chapter', async ({ page }) => {
  await page.goto('/')
  await page.locator('#domaine').scrollIntoViewIfNeeded()
  const mountain = page.locator('.mountain-scene')
  await expect(mountain).toHaveAttribute('data-renderer', 'webgl')
  for (const [label, value] of [['Nuit', 'night'], ['Doré', 'golden'], ['Matin', 'day']]) {
    const mode = page.getByRole('button', { name: `Lumière : ${label}`, exact: true })
    await mode.click()
    await expect(mode).toHaveAttribute('aria-pressed', 'true')
    await expect(mountain).toHaveAttribute('data-light-mode', value)
    await expect(page.locator('.route-tabs [aria-pressed="true"]')).toHaveCount(1)
  }
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBeTruthy()
})

test('day journey changes photography and narrative and cycles through all moments', async ({ page }) => {
  await page.goto('/')
  const day = page.locator('#une-journee')
  await day.scrollIntoViewIfNeeded()
  const moments = [
    ['08:30', 'Le premier souffle.', 'alpine-hero.jpg'],
    ['11:00', 'Le monde est à vous.', 'ski.jpg'],
    ['16:30', 'Retenir la lumière.', 'alpine-hero.jpg'],
    ['20:00', 'La nuit nous appartient.', 'night-summit.jpg'],
  ]
  for (const [time, title, photo] of moments) {
    const moment = day.getByRole('button', { name: new RegExp(time) })
    await moment.click()
    await expect(moment).toHaveAttribute('aria-pressed', 'true')
    await expect(day.getByRole('heading', { name: title, exact: true })).toBeVisible()
    await expect(day.locator('.day-photos img.is-active')).toHaveAttribute('src', `/images/${photo}`)
    await expect.poll(() => day.locator('.day-photos img.is-active').evaluate((image: HTMLImageElement) => image.complete && image.naturalWidth > 0)).toBeTruthy()
  }
  await day.getByRole('button', { name: 'Découvrir le moment suivant' }).click()
  await expect(day.getByRole('heading', { name: 'Le premier souffle.', exact: true })).toBeVisible()
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBeTruthy()
})
