import { NavLink } from "react-router-dom"
import styles from "./Navbar.module.css"
const Navbar = () => {
  return (
    <nav className={styles.navbar}>
      <img src="../../../public/icons/points.svg" alt="" />
      <NavLink className={styles.navbarLink} to="/">Home</NavLink>
      <NavLink className={styles.navbarLink} to="/maps">Maps</NavLink>
    </nav>
  )
}

export default Navbar
