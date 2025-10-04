import styles from "./Maps.module.css"

const Maps = () => {
  return (
    <div>
      <div className={styles.mapWrapper}>
        <iframe
          src={`https://maps.google.com/maps?q=Krakow&t=&z=13&ie=UTF8&iwloc=&output=embed`}
          frameborder="0"
          style={{ border: 0 }}
          allowfullscreen=""
          aria-hidden="false"
          tabIndex="-1"
        />
      </div>
    </div>
  )
}

export default Maps;