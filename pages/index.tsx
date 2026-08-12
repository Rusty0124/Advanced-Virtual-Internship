import Head from "next/head";
import Nav from "../components/home/Nav";
import Landing from "../components/home/Landing";
import Features from "../components/home/Features";
import Statistics from "../components/home/Statistics";
import Reviews from "../components/home/Reviews";
import Numbers from "../components/home/Numbers";
import Footer from "../components/home/Footer";

export default function Home() {
  return (
    <>
      <Nav />
      <Landing />
      <section id="features">
        <div className="container">
          <div className="row">
            <Features />
            <Statistics />
          </div>
        </div>
      </section>
      <Reviews />
      <Numbers />
      <Footer />
    </>
  );
}