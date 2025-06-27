import express, { Request, Response, NextFunction } from 'express';

const PORT: number = 4000; // listen to port 4000 for web requests

function convertDataToInteger(data: any, def: number): number {
    let n: number = def;
    if (data !== undefined) {
        n = parseInt(data.toString(), 10);
        if (Number.isNaN(n)) {
            n = def;
        }
    }
    return n;
}

function main() {
    console.log("Starting REST API: rest01");

    const app: express.Application = express();

    app.use((req: Request, res: Response, next: NextFunction) => {
        console.log(`${req.method} ${req.path}`);
        next();
    });

    app.get('/', (req: Request, res: Response) => {
        res.send("Welcome to our first TypeScript REST API App!");
    });

    const apiRouter = express.Router();

    apiRouter.use((req: Request, res: Response, next: NextFunction) => {
        console.log("API router specific middleware!");
        next();
    });

    apiRouter.get('/timestable/:table', (req: Request, res: Response) => {
        console.log("In our timestable API handler");

        console.log("table: ", req.params.table);
        console.log("query: ", req.query);
        console.log("start: ", req.query.start);
        console.log("end: ", req.query.end);

        let ttable: number = convertDataToInteger(req.params.table, 1);
        let start: number = convertDataToInteger(req.query.start, 1);
        let end: number = convertDataToInteger(req.query.end, 10);

        console.log(`ttable: ${ttable} start: ${start} end: ${end}`);

        if (start > end) {
            console.log("Invalid range. Reverting to default values.");
            start = 1;
            end = 10;
        }

        const results = [];
        for (let i = start; i <= end; i++) {
            results.push({
                multiplier: i,
                result: ttable * i
            });
        }

        res.json({
            table: ttable,
            start: start,
            end: end,
            data: results
        });
    });

    app.use(apiRouter);

    app.listen(PORT, () => {
        console.log(`Hello Seattle, I’m listening! (on port ${PORT})`);
    });
}

main();
