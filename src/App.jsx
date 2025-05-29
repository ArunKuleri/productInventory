import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import ProductInventory from './assets/components/productinventory'
import axios from "axios";

function App() {
  const [count, setCount] = useState(0)
  axios.defaults.baseURL = 'https://localhost:7252/'
  return (
    <>
      <ProductInventory />
    </>)
}

export default App
