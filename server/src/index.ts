import './pre-start'; // Must be the first import
import app from '@server';
import logger from '@shared/Logger';
import { schedule } from './utils/retry';

// start retry cron job
logger.info('Schedule retry cron job...');
schedule();

// Start the server
/* DEVELOPER NOTE:
* Default values are hard coded here, but you may choose to store these values in a
* config file or other mechanism
*/
const port = Number(process.env.PORT || 3001);
app.listen(port, () => {
    logger.info('Express server started on port: ' + port);
});
