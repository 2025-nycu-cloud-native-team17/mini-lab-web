import Header from './Components/Header.js'
import ListPanel from './Components/ListPanel.js'

let fake_title = "Lab Member"
let fake_columns = [
  "ID", "Name", "Skill(s)", "Operable Machines(s)"
]
let fake_data = [
  ["035468", "Alice",	"Thermal Shock Testing", "Thermal Shock Chamber"],
  ["543287", "Bob",	"Electrical Compliance Test", "Multimeters, Clamp Meters"],
  ["913584", "Cathy",	"Physical Testing",	"Universal Testing Machine"]
]

function App() {
  return (
    <div className="App">
      <Header />
      <ListPanel title={fake_title} columns={fake_columns} data={fake_data} />
    </div>
  );
}

export default App;
