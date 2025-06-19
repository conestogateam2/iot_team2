"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const db_js_1 = require("../functions/db.js");
const router = express_1.default.Router();
router.get('/', async (_req, res) => {
    try {
        const result = await db_js_1.pool.query('SELECT * FROM robot_data_team2 ORDER BY id ASC');
        res.json(result.rows);
    }
    catch (err) {
        res.status(500).json({ error: 'Error al obtener robots' });
    }
});
router.get('/latest/:robot_name', async (req, res) => {
    const { robot_name } = req.params;
    try {
        const result = await db_js_1.pool.query('SELECT * FROM robot_data_team2 WHERE robot_name = $1 ORDER BY timestamp DESC LIMIT 1', [robot_name]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Robot no encontrado' });
        }
        res.json(result.rows[0]);
    }
    catch (err) {
        res.status(500).json({ error: 'Error al obtener el último estado' });
    }
});
exports.default = router;
