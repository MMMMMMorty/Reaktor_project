
const express = require('express')
const cors = require('cors')
const axios = require('axios')
const url = "http://assignments.reaktor.com/birdnest/drones"
const url2 = "http://assignments.reaktor.com/birdnest/pilots/"
const app = express()

var xml2js = require('xml2js')

var parser = new xml2js.Parser()

app.use(cors())

app.use(function(req, res, next) {
    //Allow cross-site requests
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});

let notes = []
let serialNumber = []

app.get('/notes', (request, response) => {
    //Get the data from url
    axios.get(url).then(res=>{
        //Parse the xml data
        parser.parseString(res.data, function (err, result) {
            //Get the info
            // var deviceInformation = result['report']['deviceInformation']
            var snapshotTimestamp = result['report']['capture'][0]['$']['snapshotTimestamp']
            var drones = result['report']['capture'][0]['drone']
            //Filter the drones inside the circle
            drones = drones.filter(element => {
                return ((Math.pow(element['positionX'] - 250000, 2) + Math.pow(element['positionY'] - 250000, 2)) <= Math.pow(100000, 2))
            })
            if(drones.length!=0){
                drones.forEach(element => {
                    //Check if the drone is added to notes(list)
                    //Tf it is not in the list, add it to the list
                    if(serialNumber.includes(element['serialNumber'][0]) == false ){
                        let wholeUrl = url2 + element['serialNumber'][0]
                        //get the owner info from url2
                        axios.get(wholeUrl).then(res=>{
                            //successfully find the owner data
                            if(res.status==200){
                                var note = new Object();
                                // note.id = notes.length + 1
                                note.serialNumber = element['serialNumber'][0]
                                note.snapshotTimestamp = snapshotTimestamp
                                note.closestDistance = Math.sqrt(Math.pow(element['positionX'] - 250000, 2) + Math.pow(element['positionY'] - 250000, 2))
                                note.owner = res.data.firstName + " " + res.data.lastName
                                note.ownerEmail = res.data.email
                                note.phone = res.data.phoneNumber
                                serialNumber.unshift(element['serialNumber'][0])
                                notes.unshift(note)
                            }else {
                                response.send('<h1>Receive unknown status</h1>')
                            }
                        }).catch(function (error) {
                            //Fail to find the owner data
                            if(error.response.status == 404){
                                console.log("Canot find the owner")
                                var note = new Object();
                                // note.id = notes.length + 1
                                note.serialNumber = element['serialNumber'][0]
                                note.snapshotTimestamp = snapshotTimestamp
                                note.closestDistance = Math.sqrt(Math.pow(element['positionX'] - 250000, 2) + Math.pow(element['positionY'] - 250000, 2))
                                note.owner =  "unknown"
                                notes.phone = "unknown"
                                notes.ownerEmail = "unknown"
                                notes.unshift(note)
                                serialNumber.unshift(element['serialNumber'][0])
                            }
                        });
                    }else{
                        //If it is in the list, update the info
                        console.log("update the snapshotTimestamp")
                        var index = serialNumber.indexOf(element['serialNumber'][0])
                        notes[index].snapshotTimestamp = snapshotTimestamp
                        var distance = Math.sqrt(Math.pow(element['positionX'] - 250000, 2) + Math.pow(element['positionY'] - 250000, 2))
                        //Check if the closestDistance should be updated
                        if(distance < notes[index].closestDistance){
                            notes[index].closestDistance = distance
                        }
                    }
            
                });
                // console.log(serialNumber)
                // console.log(JSON.stringify(notes))
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
    //Delete information about drones whose last appearance was 10 minutes ago
    notes = notes.filter(note=>{return((Date.now() - Date.parse(note.snapshotTimestamp)) < 600000)})
    response.json(notes)
})


  
const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
  })