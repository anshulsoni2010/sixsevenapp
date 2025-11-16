import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      // Read the generated swagger spec
      const swaggerPath = path.join(process.cwd(), 'public', 'swagger.json');
      const swaggerSpec = JSON.parse(fs.readFileSync(swaggerPath, 'utf8'));

      // Serve Swagger UI
      res.setHeader('Content-Type', 'text/html');
      res.send(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Six Seven API Documentation</title>
            <link rel="stylesheet" type="text/css" href="https://unpkg.com/swagger-ui-dist@3.25.0/swagger-ui.css" />
            <style>
              html { box-sizing: border-box; overflow: -moz-scrollbars-vertical; overflow-y: scroll; }
              *, *:before, *:after { box-sizing: inherit; }
              body { margin: 0; background: #fafafa; }
            </style>
          </head>
          <body>
            <div id="swagger-ui"></div>
            <script src="https://unpkg.com/swagger-ui-dist@3.25.0/swagger-ui-bundle.js"></script>
            <script src="https://unpkg.com/swagger-ui-dist@3.25.0/swagger-ui-standalone-preset.js"></script>
            <script>
              window.onload = function() {
                const ui = SwaggerUIBundle({
                  spec: ${JSON.stringify(swaggerSpec)},
                  dom_id: '#swagger-ui',
                  deepLinking: true,
                  presets: [
                    SwaggerUIBundle.presets.apis,
                    SwaggerUIStandalonePreset
                  ],
                  plugins: [
                    SwaggerUIBundle.plugins.DownloadUrl
                  ],
                  layout: "StandaloneLayout"
                });
              };
            </script>
          </body>
        </html>
      `);
    } catch (error) {
      res.status(500).json({ error: 'Failed to load API documentation' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}