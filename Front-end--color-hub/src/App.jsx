import { useRef } from "react";
import RGBCards from "./components/RGBCards";
import InfoAccordion from "./components/InfoAccordion";
import Footer from "./components/Footer";
import Header from "./components/Header";

function App() {
  const lowerSectionRef = useRef(null);

  const handleScrollToLower = () => {
    lowerSectionRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  return (
    <div className="bg-background text-secondary min-h-screen flex flex-col">
      <Header />

      {/* ----------Hero Section---------- */}
      <section className="min-h-[calc(100vh-64px)] flex flex-col items-center justify-center px-4">
        <div className="max-w-xl text-center space-y-6 mt-4">
          <h2 className="text-3xl md:text-5xl font-bold tracking-wide">
            Welcome to <span className="text-primary">ColorHub</span>
          </h2>

          <p className="text-md md:text-base text-secondary">
             <i style={{ color: "#fd7272" }}>(UI-only version)</i>{" "} Discover how colors shape emotions, attract attention, and build better designs.
            Choose any color card to learn fun facts, psychology insights, and real-world design uses.
            This project is also a showcase that connects Raspberry Pi full-stack hardware with a
            modern web interface, demonstrating how software and hardware interact seamlessly in real time.
          </p>

          <div className="mt-6">
            <RGBCards />
          </div>

          <button
            type="button"
            onClick={handleScrollToLower}
            className="mt-6 px-6 py-2 rounded-lg bg-primary text-background font-semibold hover:bg-primary/80 transition-colors duration-200"
          >
            Start Exploring
          </button>
        </div>
      </section>

      {/* ----------Lower Section---------- */}
      <section
        ref={lowerSectionRef}
        className="min-h-fit px-4 py-16 flex flex-col items-center"
      >
        <div className="pt-16 w-full">
          <hr className="bg-secondary h-[2px] w-[60%] mx-auto rounded-full opacity-60" />
        </div>

        <div className="pt-12 w-full" />

        <h2 className="text-secondary text-center text-4xl font-semibold">
          Practice <span className="text-primary">ColorHub</span>
        </h2>

<p className="text-md md:text-lg text-secondary text-center max-w-3xl mx-auto p-9">
  Welcome to <span className="text-primary font-semibold">ColorHub</span> - a fun way to train your eye and memory using real LEDs.
  <br /><br />
  <span className="font-semibold">Memory Challenge:</span> Watch a fast sequence of 4 colors (1 second each), then recreate them in the same order using the live color picker.
  Submit your picks and get an instant score.
  <br /><br />
  <span className="font-semibold">Color Quiz:</span> Test your general knowledge with quick questions and fun facts about colors.
</p>


        <InfoAccordion />
      </section>

      <Footer />
    </div>
  );
}

export default App;
