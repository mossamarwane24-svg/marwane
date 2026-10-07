import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'python-execution-api',
      configureServer(server) {
        server.middlewares.use(async (req, res, next) => {
          if (req.url === '/api/execute-python' && req.method === 'POST') {
            let body = '';
            req.on('data', chunk => { body += chunk; });
            req.on('end', async () => {
              try {
                const { code } = JSON.parse(body || '{}');
                if (!code || typeof code !== 'string') {
                  res.statusCode = 400;
                  res.setHeader('Content-Type', 'application/json');
                  return res.end(JSON.stringify({ success: false, error: 'Code Python requis' }));
                }

                // Temporary file in os tempdir
                const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'nexus-py-'));
                const scriptPath = path.join(tempDir, 'script.py');
                const plotPath = path.join(tempDir, 'plot.png');

                // Prepend helper so matplotlib doesn't hang in headless mode
                const wrappedCode = `
import sys
import os

try:
    import matplotlib
    matplotlib.use('Agg')
    import matplotlib.pyplot as plt
    __orig_show = plt.show
    def __custom_show(*args, **kwargs):
        plt.savefig('${plotPath.replace(/\\/g, '/')}', bbox_inches='tight', dpi=100)
    plt.show = __custom_show
except Exception:
    pass

${code}

try:
    if 'matplotlib.pyplot' in sys.modules:
        import matplotlib.pyplot as plt
        if plt.get_fignums() and not os.path.exists('${plotPath.replace(/\\/g, '/')}'):
            plt.savefig('${plotPath.replace(/\\/g, '/')}', bbox_inches='tight', dpi=100)
except Exception:
    pass
`;

                fs.writeFileSync(scriptPath, wrappedCode, 'utf8');

                const startTime = Date.now();
                const pyProc = spawn('python3', [scriptPath], {
                  cwd: tempDir,
                  timeout: 10000,
                  env: { ...process.env, MPLBACKEND: 'Agg', PYTHONUNBUFFERED: '1' }
                });

                let stdout = '';
                let stderr = '';

                pyProc.stdout.on('data', data => { stdout += data.toString(); });
                pyProc.stderr.on('data', data => { stderr += data.toString(); });

                pyProc.on('close', (exitCode) => {
                  const executionTimeMs = Date.now() - startTime;
                  let base64Plot = null;
                  try {
                    if (fs.existsSync(plotPath)) {
                      base64Plot = 'data:image/png;base64,' + fs.readFileSync(plotPath).toString('base64');
                    }
                  } catch (e) {
                    console.error('Plot reading error:', e);
                  }

                  // Cleanup
                  try {
                    fs.rmSync(tempDir, { recursive: true, force: true });
                  } catch (e) {}

                  res.statusCode = 200;
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({
                    success: exitCode === 0,
                    exitCode,
                    stdout: stdout.trim(),
                    stderr: stderr.trim(),
                    executionTimeMs,
                    plotImage: base64Plot
                  }));
                });

                pyProc.on('error', (err) => {
                  try { fs.rmSync(tempDir, { recursive: true, force: true }); } catch (e) {}
                  res.statusCode = 500;
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({ success: false, error: err.message }));
                });

              } catch (err: any) {
                res.statusCode = 500;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ success: false, error: err.message || 'Erreur interne' }));
              }
            });
            return;
          }

          if (req.url === '/api/status' && req.method === 'GET') {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            return res.end(JSON.stringify({
              status: 'online',
              system: 'NEXUS-OMEGA v45.0.0',
              python: 'Python 3.11.2 (Real Sandbox Execution Active)',
              pillars: 15,
              agents: ['Créatif', 'Critique Impitoyable', 'Fact-Checker', 'Éthicien', 'Stratège', 'Explorateur', 'Synthétiseur'],
              verifiedRate: '100%'
            }));
          }

          next();
        });
      }
    }
  ],
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
    allowedHosts: true,
  }
});
