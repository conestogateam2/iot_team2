import express from 'express';
import robotsRouter from './routes/robots';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import path from 'path';
import dotenv from 'dotenv';


dotenv.config();
const PORT = parseInt(process.env.OUTPUT_PORT || '4000', 10);

const app = express();


app.use(express.json());
app.use('/robots', robotsRouter);

// Swagger UI setup
const swaggerDocument = YAML.load(path.join(process.cwd(), 'src', 'swagger', 'swagger.yaml'));

// Inserta dinámicamente la URL del servidor
swaggerDocument.servers = [
  {
    url: `http://localhost:${PORT}`, // o usa process.env.HOST si lo tienes
  },
];

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.listen(PORT, () => {
  console.log(`Robot service listening on port ${PORT}`);
  console.log(`Swagger docs available at http://localhost:${PORT}/api-docs`);
});
