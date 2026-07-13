import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import insightRoutes from './routes/insightRoutes.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/insights', insightRoutes);

app.get('/', (req, res) => res.send('Serene Cycle backend running'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Backend running on http://localhost:${PORT}`));