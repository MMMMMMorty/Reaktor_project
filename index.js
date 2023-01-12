require('dotenv').config()
const express = require('express')
const cors = require('cors')
const Note = require('./models/note')
const axios = require('axios')
const url = "http://assignments.reaktor.com/birdnest/drones"
const url2 = "http://assignments.reaktor.com/birdnest/pilots/"
const app = express()

var xml2js = require('xml2js')

var parser = new xml2js.Parser()

app.use(cors())
app.use(express.static('build'))
app.use(function(req, res, next) {
    //Allow cross-site requests
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});


app.get('/notes', (request, response) => {
    //Get the data from url
    axios.get(url).then(res=>{
        //Parse the xml data
        parser.parseString(res.data, function (err, result) {
            //Get the info
            // var deviceInformation = result['report']['deviceInformation']
            var snapshotTimestamp = result['report']['capture'][0]['$']['snapshotTimestamp']
            snapshotTimestamp = new Date(snapshotTimestamp)
            var drones = result['report']['capture'][0]['drone']
            //Filter the drones inside the circle
            drones = drones.filter(element => {
                return ((Math.pow(element['positionX'] - 250000, 2) + Math.pow(element['positionY'] - 250000, 2)) <= Math.pow(100000, 2))
            })
            if(drones.length!=0){
                drones.forEach(element => {
                    //Check if the drone is added to notes(list)
                    //Tf it is not in the list, add it to the list
                    Note.find({ serialNumber: element['serialNumber'][0] }).then(notes => {
                        if(notes.length == 0){
                            let wholeUrl = url2 + element['serialNumber'][0]
                            //get the owner info from url2
                            axios.get(wholeUrl).then(res=>{
                                //successfully find the owner data
                                if(res.status==200){
                                    const note = new Note({
                                        serialNumber: element['serialNumber'][0],
                                        snapshotTimestamp : snapshotTimestamp,
                                        closestDistance: (Math.sqrt(Math.pow(element['positionX'] - 250000, 2) + Math.pow(element['positionY'] - 250000, 2))).toString(),
                                        owner: res.data.firstName + " " + res.data.lastName,
                                        ownerEmail: res.data.email,
                                        phone: res.data.phoneNumber
                                    })
                                    note.save().then(result => {
                                        // console.log('note saved!')
                                    })
                                }else {
                                    response.send('<h1>Receive unknown status</h1>')
                                }
                            }).catch(function (error) {
                                //Fail to find the owner data
                                if(error.response.status == 429){
                                    console.log("Too many requests for website")
                                    setTimeout(function() {
                                        console.log("Take a rest for 30s!");
                                    }, 30000);
                        
                                }
                                if(error.response.status == 404){
                                    console.log("Canot find the owner")
                                    const note = new Note({
                                        serialNumber: element['serialNumber'][0],
                                        snapshotTimestamp : snapshotTimestamp,
                                        closestDistance: (Math.sqrt(Math.pow(element['positionX'] - 250000, 2) + Math.pow(element['positionY'] - 250000, 2))).toString(),
                                        owner: "unknown",
                                        ownerEmail: "unknown",
                                        phone: "unknown"
                                    })
                                    note.save().then(result => {
                                        // console.log('note saved!')
                                    })
                                }
                            })

                        }else{
                            //If it is in the list, update the info
                            notes[0].snapshotTimestamp = snapshotTimestamp
                            var distance = Math.sqrt(Math.pow(element['positionX'] - 250000, 2) + Math.pow(element['positionY'] - 250000, 2))
                            //Check if the closestDistance should be updated
                            if(distance < parseFloat(notes[0].closestDistance)){
                                notes[0].closestDistance = distance.toString()
                            }
                            notes[0].save().then(result => {
                                // console.log("data updated")
                            })

                        }
                    })
                });
            }
        });
    }).catch(error=>{
        //Too many requests, take a rest for 30s
        if(error.response.status == 429){
            console.log("Too many requests for website")
            setTimeout(function() {
                console.log("Take a rest for 30s!");
            }, 30000);

        }
    })
    Note.find({}).then(notes => {
        //Make sure it will just show 10 mins data
        notes = notes.filter(function(element, index, self){
            return self.indexOf(element) === index && ((Date.now() - element.snapshotTimestamp.getTime()) < 600000)
        })
            // note=>{return((Date.now() - note.snapshotTimestamp.getTime()) < 600000)})
        response.json(notes)
    })
    // response.json(notes)
})


  
const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
  })