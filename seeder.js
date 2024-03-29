const fs = require('fs');
const mongoose = require('mongoose');
const colors = require('colors');
const dotenv = require('dotenv');

// Env Vars
dotenv.config({ path: './config/config.env' });

// load models
const Bootcamp = require('./models/Bootcamp');
const Course = require('./models/Course');

mongoose.connect(process.env.MONGO_URI, {});

// Read JOSN files
const bootcamps = JSON.parse(
	fs.readFileSync(`${__dirname}/_data/bootcamps.json`, 'utf-8')
);

const courses = JSON.parse(
	fs.readFileSync(`${__dirname}/_data/courses.json`, 'utf-8')
);

// Import into db
const importData = async () => {
	try {
		await Bootcamp.create(bootcamps);
		await Course.create(courses);

		console.log('Data Imported....'.green.inverse);
		process.exit();
	} catch (error) {
		console.log(error);
	}
};

// Delete Data
const deleteData = async () => {
	try {
		await Bootcamp.deleteMany();
		await Course.deleteMany();

		console.log('Data Deleted....'.red.inverse);
		process.exit();
	} catch (error) {
		console.log(error);
	}
};

if (process.argv[2] === '-i') {
	importData();
} else if (process.argv[2] === '-d') {
	deleteData();
}
