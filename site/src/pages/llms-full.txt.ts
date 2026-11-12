import type { APIRoute } from 'astro'
import { fullSummary } from '../components/landing/atlas/summary'

// Full landing content, served next to the app’s /llms.txt.
export const GET: APIRoute = () =>
  new Response(fullSummary(), { headers: { 'Content-Type': 'text/plain; charset=utf-8' } })
