# Reaktor Pre-assignment

The author of the project is Jiehong Mo.

## Project Requirement

Build and deploy a web application which lists all the pilots who recently violated the NDZ perimeter.

What it looks like is up to you, but this list should

- Persist the pilot information for 10 minutes since their drone was last seen by the equipment
- Display the closest confirmed distance to the nest
- Contain the pilot name, email address and phone number
- Immediately show the information from the last 10 minutes to anyone opening the application
- Not require the user to manually refresh the view to see up-to-date information

## Data

### Drone positions

    GET assignments.reaktor.com/birdnest/drones

The monitoring equipment endpoint above provides a snapshot of all the drones within a 500 by 500 meter square and is updated about once every 2 seconds. The equipment is set up right next to the nest.

This snapshot is in XML format and contains, among other things, the position and serial number of each drone in the area.

- The position of the drones are reported as X and Y coordinates, both floating point numbers between 0-500000
- The no-fly zone is a circle with a 100 meter radius, origin at position 250000,250000

### Pilot information

    GET assignments.reaktor.com/birdnest/pilots/:serialNumber

The national drone registry endpoint above will provide you the name, contact information and other details for a drone's registered owner in JSON format, based on the given serial number. Please note on a rare occasion pilot information may not be found, indicated by a 404 status code.

In order to protect the privacy of well behaved pilots keeping appropriate distance, you may only query this information for the drones violating the NDZ.

## Build

The project will run on port 3001, please sure the port is available. And please sure the Mongo DB address is availabe, set it with environment vaiable **MONGODB_URI**. Example is followed.

    Export MONGODB_URI = 'address_here'

### Frontend

    cd front-end
    npm install
    npm run build
    cp ./build ../

### Backend

    npm install
    npm run dev
    
## Deployment

This project is deployed on the fly.io platform and can be accessed through the following link.[https://pre-assignment.fly.dev/]

## TODO

This project will cause the problem of simultaneous generation of the same data when multiple clients interact with the same server at the same time, which requires the use of exclusion locks to solve the problem of simultaneous writing of data