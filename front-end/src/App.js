import { useState,  useEffect} from 'react'
import './App.css'
import axios from 'axios'
const baseUrl = '/notes'

const App = () => {
  useEffect(() => {
    const intervalId = setInterval(() => {  
      axios
      .get(baseUrl)
      .then(response => {
        // console.log('render new data')
        // var tmp = response.data
        // tmp = tmp.filter(note=>{return((Date.now() - Date.parse(note.snapshotTimestamp)) < 600000)})
        setNotes(response.data)
      })
      .catch(error=>{
        //Too many requests, take a rest for 30s
        if(error){
          setTimeout(function() {
            console.log("Take a rest for 30s!");
          }, 30000);
        }
      })
    }, 2000)

    //Clear the interval
    return () => clearInterval(intervalId);

  }, [])

  const [notes, setNotes] = useState([
    { serialNumber:'', snapshotTimestamp:'', closestDistance: 0, owner: '', ownerEmail: '' , phone:''}
  ])


  const showNotes = notes.map(note=> {return(<tr>
                                        <td key = "owner">{note.owner}</td >
                                        <td key = "phone">{note.phone}</td>
                                        <td key = "email">{note.ownerEmail}</td>
                                        <td key = "serialNumber">{note.serialNumber}</td>
                                        <td key ="snapshotTimestamp"> {note.snapshotTimestamp}</td>
                                        <td key = "closestDistance"> {note.closestDistance}</td></tr>)})



  return (
    <div >
      <h1 class="header">INFO</h1>
      <div >
      <table cellPadding="10" class='info' ><caption><b>The pilots who recently violated the NDZ perimeter</b></caption><tbody><tr><td>Owner</td><td>Phone</td><td>Email</td><td>serialNumber</td><td>Last observed time</td><td>closestDistance (mm)</td></tr>{showNotes}</tbody></table>
      </div>
    </div>

  )
}
export default App