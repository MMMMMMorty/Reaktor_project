const mongoose = require('mongoose')

const databaseUrl = process.env.MONGODB_URI

mongoose.connect(databaseUrl)
  .then(result => {    
    console.log('connected to MongoDB')  
    })
  .catch((error) => {    
    console.log('error connecting to MongoDB:', error.message)  
    })

const noteSchema = new mongoose.Schema({
    serialNumber: String,
    // { type: String, unique: true }
    //Delete information automatically per 10 mins
    snapshotTimestamp: { type: Date, index:{expires: '10m'}},
    closestDistance: String,
    owner: String,
    ownerEmail: String,
    phone: String
})


noteSchema.set('toJSON', {
    transform: (document, returnedObject) => {
      returnedObject.id = returnedObject._id.toString()
      delete returnedObject._id
      delete returnedObject.__v
    }
  })
  
  module.exports = mongoose.model('Note', noteSchema)