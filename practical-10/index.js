import express from 'express';
import fs from 'fs/promises';


const app = express();
const PORT = 3000;
const LOG_FILE = 'app.log';  

app.get('/', async (req, res) => {
    try {
        const data = await fs.readFile(LOG_FILE, 'utf8');
        res.send(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Log Viewer</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; }
                    pre { 
                        background: #f5f5f5; 
                        padding: 15px; 
                        border: 1px solid #ddd;
                        border-radius: 4px;
                        max-width: 100%;
                        overflow-x: auto;
                    }
                </style>
            </head>
            <body>
                <h1>Log File: ${LOG_FILE}</h1>
                <pre>${data.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>
            </body>
            </html>
        `);
    } catch (error) {
      
        if (error.code === 'ENOENT') {
            res.status(404).send(`Log file '${LOG_FILE}' not found.`);
        } else {
            res.status(500).send('<h1>Unable to read log file</h1>');
        }
    }
});


app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log(`Viewing log file: ${LOG_FILE}`);
});
