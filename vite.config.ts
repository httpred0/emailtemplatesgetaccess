import { defineConfig, Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'node:fs'
import path from 'node:path'

/**
 * Dev-only helper: POST the current template library to /__save-seeds and it is
 * written to src/data/seed-templates.json — the "make my templates permanent" flow.
 */
function seedSaver(): Plugin {
  return {
    name: 'seed-saver',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use('/__save-seeds', (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405
          res.end('POST only')
          return
        }
        let body = ''
        req.on('data', (chunk) => (body += chunk))
        req.on('end', () => {
          try {
            const data = JSON.parse(body)
            const file = path.resolve(__dirname, 'src/data/seed-templates.json')
            fs.mkdirSync(path.dirname(file), { recursive: true })
            fs.writeFileSync(file, JSON.stringify(data, null, 2) + '\n', 'utf8')
            res.statusCode = 200
            res.end(`saved ${Array.isArray(data) ? data.length : 0} templates`)
          } catch (e) {
            res.statusCode = 400
            res.end(`invalid JSON: ${e}`)
          }
        })
      })
    },
  }
}

export default defineConfig({
  plugins: [react(), seedSaver()],
  server: { port: 5173 },
})
