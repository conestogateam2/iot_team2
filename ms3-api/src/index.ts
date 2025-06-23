import express from 'express';
import robotsRouter from './routes/robots';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import path from 'path';

const app = express();
const PORT = 3000;

app.use(express.json());
app.use('/robots', robotsRouter);

// Swagger UI setup
const swaggerDocument = YAML.load(path.join(process.cwd(), 'src', 'swagger', 'swagger.yaml'));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.listen(PORT, () => {
  console.log(`Robot service listening on port ${PORT}`);
  console.log(`Swagger docs available at http://localhost:${PORT}/api-docs`);
});
