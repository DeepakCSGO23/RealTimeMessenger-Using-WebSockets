import { defineConfig } from 'vite';
import basicSsl from '@vitejs/plugin-basic-ssl';

export default defineConfig({
  plugins: [basicSsl()],
  server: {
    https: {
      key: 'C:\\Certificate\\localhost.pem',
      cert: 'C:\\Certificate\\localhost-key.pem'
    }
  }
});
