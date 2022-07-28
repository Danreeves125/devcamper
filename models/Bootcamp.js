const mongoose = require('mongoose');
const slugify = require('slugify');
const geocoder = require('../utils/geocoer');

const BootcampSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a name'],
        unique: true,
        trim: true,
        maxlength: [50, 'Name can not be more than 50 characters']
    },
    slug: String,
    description: {
        type: String,
        required: [true, 'Please add a description'],
        maxlength: [500, 'Description can not be more than 500 characters']
    },
    website: {
        type: String,
        match: [
            /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/,
            'Please use a valid URL with HTTP or HTTPS'
        ]
    },
    phone: {
        type: String,
        maxlength: [20, 'Phone number can not be longer than 20 characters']
    },
    email: {
        type: String,
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            'Please add a valid email'
        ]
    },
    address: {
        type: String,
        required: [true, 'Please add an address']
    },
    location: {
        // GeoJSON Point
        type: {
            type: String,
            enum: ['Point']
        },
        coordinates: {
            type: [Number],
            index: '2dsphere'
        },
        formattedAddress: String,
        street: String,
        city: String,
        state: String,
        zipcode: String,
        country: String
    },
    careers: {
        // Array of strings
        type: [String],
        required: true,
        enum: [
            'Web Development',
            'Mobile Development',
            'UI/UX',
            'Data Science',
            'Business',
            'Other'
        ]
    },
    averageRating: {
        type: Number,
        min: [1, 'Rating must be at least 1'],
        max: [10, 'Rating must can not be more than 10']
    },
    averageCost: Number,
    photo: {
        type: String,
        default: 'no-photo.jpg'
    },
    housing: {
        type: Boolean,
        default: false
    },
    jobAssistance: {
        type: Boolean,
        default: false
    },
    jobGuarantee: {
        type: Boolean,
        default: false
    },
    acceptGi: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
}, {
    toJSON : {
        virtuals: true
    },
    toObject: {
        virtuals: true
    }
});

// Create Bootcamp Slug from the name - Don't use arrow function as it handles the this keyword differently

BootcampSchema.pre('save', function(next) {
    // console.log('Slugify Ran', this.name);

    this.slug = slugify(this.name,{
        lower: true,
    });

    next();
});

// Geocode & create location field
BootcampSchema.pre('save', async function(next){

    const location = await geocoder.geocode(this.address);

    this.location = {
        type: 'Point',
        coordinates: [
            location[0].longitude, location[0].latitude
        ],
        formattedAddress: location[0].formattedAddress,
        street: location[0].streetName,
        city: location[0].city,
        state: location[0].extra.neighborhood,
        zipcode: location[0].zipcode,
        country: location[0].countryCode
    }

    // Don't save address in DB
    this.address = undefined;

    next();
});

// Cascade delete courses when a bootcamp is deleted

BootcampSchema.pre('remove', async function(next) {
    await this.model('Course').deleteMany({
        bootcamp: this._id,
    });
    next();
})

// Reverse Populate with virtuals
BootcampSchema.virtual('courses', {
    ref: 'Course',
    localField: '_id',
    foreignField: 'bootcamp',
    justOne: false


});

module.exports = mongoose.model('Bootcamp', BootcampSchema);
