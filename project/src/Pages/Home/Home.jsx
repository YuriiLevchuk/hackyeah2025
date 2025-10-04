import styles from "./Home.module.css"

const Home = () => {
  return (
    <div className={styles.homeWrapper}>
      {/* <img src="../../../public/assets/train.jpg" alt="" /> */}
      <h1 className={styles.title}>Hello, let's travel together!</h1>
      <p>
        A system for managing passenger delay notifications currently presents a complex challenge,
        particularly due to the multitude of interconnected elements that determine when and how
        messages are published. In public transport, such as rail and bus services, there is a lack of
        integrated information exchange, which makes communication ineffective and often fails to
        meet the real-time needs of passengers
      </p>
      <p>
        Our proposal is to create a community-driven system where users can share information about
        delays and disruptions. These data will be supplemented in real time by the system itself and
        distributed to other users to help them better organize their journeys
      </p>
    </div>
  )
}

export default Home;