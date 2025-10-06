import {useState} from 'react';
import "./App.css";

function Counter(){

  const [count , setcount]=useState(0);
  const [firstName, setFirstName] = useState("");
  const [surName, setSurName] = useState("");


  const increment = () =>{
    setcount(count + 1);
  }
  
  const decrement = () =>{
    setcount(count - 1);
  }

  const reset=()=>{
    setcount(0);
  }

  const incrementbyfive=() =>{
    setcount(count + 5);
  }

  const handlefirstnameChange = (event) => {
    setFirstName(event.target.value);
  }

  const handlesurnameChange = (event) => {
    setSurName(event.target.value);
  } 

  return(

    <div class="Counter">
      <h1>Count : {count}</h1>

      <button onClick={reset}>Reset</button>
      <button onClick={increment}>Increment</button>
      <button onClick={decrement}>decrement</button>
      <button onClick={incrementbyfive}>Increment 5 </button>

      <br></br>
      <br></br>
      
      <h1>Welcome to CHARUSAT!!!</h1>

      <lable>
      First Name:
      <input type="text" placeholder="First Name" value={firstName} onChange={handlefirstnameChange}/>
       </lable>

       <lable>
       Last Name:
      <input type="text"  placeholder="Last Name" value={surName} onChange={handlesurnameChange}/>
      </lable>
      

      <h3>First Name: {firstName}</h3>
      <h3>Last Name: {surName}</h3>
      <h3>Full Name: {firstName + " " + surName}</h3>
     
      </div>
  )

}
export default Counter; 


