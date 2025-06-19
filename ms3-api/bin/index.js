"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const robots_1 = __importDefault(require("./routes/robots"));
const app = (0, express_1.default)();
const PORT = 3000;
app.use(express_1.default.json());
app.use('/robots', robots_1.default);
app.listen(PORT, () => {
    console.log(`Robot service listening on port ${PORT}`);
});
