import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import dotenv from 'dotenv'

dotenv.config()

function apiDevMiddleware() {
  return {
    name: 'api-dev-middleware',
    configureServer(server: any) {
      server.middlewares.use(async (req: any, res: any, next: any) => {
        if (req.url === '/api/create-order' && req.method === 'POST') {
          try {
            let body = ''
            for await (const chunk of req) body += chunk
            const parsed = JSON.parse(body || '{}')
            const handler = (await import('./api/create-order.ts')).default
            const mockReq = { method: 'POST', body: parsed }
            const mockRes = {
              status(code: number) {
                res.statusCode = code
                return this
              },
              json(data: any) {
                res.setHeader('Content-Type', 'application/json')
                res.end(JSON.stringify(data))
                return this
              }
            }
            await handler(mockReq as any, mockRes as any)
          } catch (err: any) {
            res.statusCode = 500
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ error: err.message }))
          }
          return
        }

        if (req.url === '/api/verify-payment' && req.method === 'POST') {
          try {
            let body = ''
            for await (const chunk of req) body += chunk
            const parsed = JSON.parse(body || '{}')
            const handler = (await import('./api/verify-payment.ts')).default
            const mockReq = { method: 'POST', body: parsed }
            const mockRes = {
              status(code: number) {
                res.statusCode = code
                return this
              },
              json(data: any) {
                res.setHeader('Content-Type', 'application/json')
                res.end(JSON.stringify(data))
                return this
              }
            }
            await handler(mockReq as any, mockRes as any)
          } catch (err: any) {
            res.statusCode = 500
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ error: err.message }))
          }
          return
        }

        next()
      })
    }
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), apiDevMiddleware()],
})
