import { defineConfig, loadEnv } from 'vite'
import dotenv from 'dotenv';


// Load environment variables from .env file
dotenv.config();

let host = process.env.HOST;
let port= parseInt(process.env.BACKEND_PORT || '3000', 10);

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  const backendUrl = `http://${host}:${port}`
  console.log(backendUrl)

  return {
    server: {
      proxy: {
        '/robots': {
          target: backendUrl,
          changeOrigin: true
        }
      }
    }
  }
})
