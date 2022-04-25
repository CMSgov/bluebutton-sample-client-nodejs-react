import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import helmet from 'helmet';

import express, { Request, Response } from 'express';
import StatusCodes from 'http-status-codes';
import 'express-async-errors';

import BaseRouter from './routes';
import logger from './shared/Logger';
import BlueButton from 'cms-bluebutton';

import db from './utils/db';
import config from './configs/config';


const app = express();
const { BAD_REQUEST } = StatusCodes;

console.log("--------Server--------------")
console.log("DB Settings: ", db.settings)
console.log("-------------")
console.log("-------------")
console.log("-------------")

const envConfig = config[db.settings.env];
console.log("-------------")
console.log("---------app config:  " + JSON.stringify(envConfig))
console.log("-------------")

const versionNum = db.settings.version.slice(-1);

console.log("-------------");
console.log("------------VERSION NUM: ", versionNum);
console.log("-------------");

const blueButtonConfig = {
    baseUrl: envConfig.bb2BaseUrl,
    clientId: envConfig.bb2ClientId,
    clientSecret: envConfig.bb2ClientSecret,
    callbackUrl: envConfig.bb2CallbackUrl,
    version: versionNum
};
console.log("-------------")
console.log("---------blueButtonConifg: " + JSON.stringify(blueButtonConfig))
console.log("-------------")

const bb = new BlueButton(blueButtonConfig);


/** **********************************************************************************
 *                              Set basic express settings
 ********************************************************************************** */

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Show routes called in console during development
if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'sandbox') {
  app.use(morgan('dev'));
}

// Security
if (process.env.NODE_ENV === 'production') {
  app.use(helmet());
}

app.use((req, res, next) => {
  req.bb = bb;
  next();
})

// Add APIs
app.use('/api', BaseRouter);

// Print API errors
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: Error, _req: Request, res: Response) => {
  logger.err(err, true);
  return res.status(BAD_REQUEST).json({
    error: err.message,
  });
});

// Export express instance
export default app;
