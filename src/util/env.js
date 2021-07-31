const path = require('path');
// Load the .env file
require('dotenv').config({
    path: path.resolve(process.cwd(), '..', '.env')
});
