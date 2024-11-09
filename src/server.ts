import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import https from 'https';
import http from 'http';
import fs from 'fs';
import siteRoutes from './routes/site';
import adminRoutes from './routes/admin'
import { requestIntercepter } from './utils/requestIntercepter';

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.all('*', requestIntercepter);

app.use('/admin', adminRoutes);
app.use('/', siteRoutes);

const runServe = (port: number, server: http.Server) => {
    server.listen(port, () => {
        console.log(` 🚀 Runnig at PORT ${port}`)
    });
}
const regularServe = http.createServer(app);
if (process.env.NODE_ENV === 'production') {
    const options = {
        key: fs.readFileSync(process.env.SSL_KEY as string),
        cert: fs.readFileSync(process.env.SSL_CERT as string)
    }
    const secServer = https.createServer(options, app);
    runServe(80, regularServe);
    runServe(443, secServer);

} else {
    const serverPort: number = process.env.PORT ? parseInt(process.env.PORT) : 9000;
    runServe(serverPort, regularServe);
}