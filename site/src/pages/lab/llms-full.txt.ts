import type { APIRoute } from 'astro'
import { fullSummary } from '../../lab/atlas/summary'

// Goes to /llms-full.txt, next to the app's /llms.txt, if direction B ships.
export const GET: APIRoute = () =>
  new Response(fullSummary(), { headers: { 'Content-Type': 'text/plain; charset=utf-8' } })
