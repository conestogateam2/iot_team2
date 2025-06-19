import express from 'express';
import robotsRouter from './routes/robots';

const app = express();
const PORT = 3000;

app.use(express.json());
app.use('/robots', robotsRouter);

app.listen(PORT, () => {
  console.log(`Robot service listening on port ${PORT}`);
});
