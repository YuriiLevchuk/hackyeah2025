import { NavLink } from "react-router-dom"
import styles from "./Navbar.module.css"
const Navbar = () => {
  return (
    <nav className={styles.navbar}>
      <img src="../../../public/icons/points.svg" alt="" />
      <NavLink to="/">Home</NavLink>
      <NavLink to="/maps">Maps</NavLink>
    </nav>
  )
}

export default Navbar
