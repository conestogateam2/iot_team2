import express, { Request, Response, NextFunction } from 'express';

const PORT: number = 4000; // Listen to port 4000 for web requests

// 🔧 Converts input data (query or param) to a number or returns a default
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

// 🔢 Generates the times table as an array of strings
function generateTimesTable(ttable: number, start: number, end: number): string[] {
    let output: string[] = [];
    let offset: number = 0;
    let p: number = 0;
    let x: number = 0;
    for (x = start; x <= end; x++) {
        p = x * ttable;
        output[offset] = `${x} x ${ttable} = ${p}`;
        offset++;
    }
    return output;
}

function main() {
    console.log("Starting REST API: rest02");

    const app: express.Application = express();

    // Middleware: Logs every request
    app.use((req: Request, res: Response, next: NextFunction) => {
        console.log(`${req.method} ${req.path}`);
        next();
    });

    // Root route
    app.get('/', (req: Request, res: Response) => {
        res.send("Welcome to our second TypeScript REST API App!");
    });

    const apiRouter = express.Router();

    // Middleware for API routes
    apiRouter.use((req: Request, res: Response, next: NextFunction) => {
        console.log("API router specific middleware!");
        next();
    });

    // Times table endpoint
    apiRouter.get('/timestable/:table', (req: Request, res: Response) => {
        console.log("In our timestable API handler");

        let ttable: number = convertDataToInteger(req.params.table, 1);
        let start: number = convertDataToInteger(req.query.start, 1);
        let end: number = convertDataToInteger(req.query.end, 10);

        console.log(`ttable: ${ttable} start: ${start} end: ${end}`);

        if (start > end) {
            console.log("Invalid range. Reverting to default values.");
            start = 1;
            end = 10;
        }

        let tableoutput: string[] = generateTimesTable(ttable, start, end);
        res.json(tableoutput);
    });

    // Mount the router
    app.use(apiRouter);

    // Start the server
    app.listen(PORT, () => {
        console.log(`Hello Seattle, I’m listening! (on port ${PORT})`);
    });
}

main();
