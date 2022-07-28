const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const colors = require('colors');
const errorHandler = require('./middleware/error');
const connectDB = require('./config/db');

// Load env vars
dotenv.config({path: './config/config.env'});

// Route Files
const bootcamps = require('./routes/bootcamp');
const courses = require('./routes/courses');

// connect to DB
connectDB();

const app = express();

// Body parser
app.use(express.json());

// Dev Logging Middleware
if(process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// Mount Routers
app.use('/api/v1/bootcamps', bootcamps);
app.use('/api/v1/courses', courses);

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} and listening on port ${PORT}!` .yellow.bold);
});


// Handle unhandled promise rejections

process.on('unhandledRejection', (err, promise) => {
    console.log(`Error: ${err.message}`.red);

    // Close server
    server.close(() => {
        process.exit(1);
    });
});