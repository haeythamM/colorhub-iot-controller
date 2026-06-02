function RGBCards() {
  return (
    <div className="flex flex-col gap-1 w-full max-w-sm mx-auto pb-10 pt-10">

      {/* RED CARD */}
      <div className="p-1 rounded-lg shadow bg-cardpaper hover:translate-x-24 hover:scale-[1.02] hover:animate-sonic transition-all duration-500 cursor-default flex items-center group">
        <div
          className="w-full h-28 rounded flex items-center justify-center relative overflow-hidden px-6 shadow-lg font-semibold"
          style={{ backgroundColor: "rgb(255, 80, 80)" }}
        >
          {/* Big letter when not hovered */}
          <span className="text-secondary font-extrabold  drop-shadow-[0_0_4px_rgba(3,3,3,0.4)] text-2xl tracking-wide transition-opacity duration-300 group-hover:opacity-0">
            R
          </span>

          {/* Fun fact text on hover */}
          <p className={
            "absolute inset-x-3 top-1/2 -translate-y-1/2 " +
            "text-background text-[0.75rem] leading-relaxed " +
            "opacity-0 group-hover:opacity-100 transition-opacity duration-500 " +
            "text-center font-semibold drop-shadow-[0_0_4px_rgba(0,0,1,0.3)] text-full"
          }>
            Red is the first color the human eye notices from a distance, which is why warnings
            and alerts love using it.
          </p>
        </div>
      </div>

      {/* GREEN CARD – HARDWARE EXPLANATION */}
      <div className="p-1 rounded-lg shadow bg-cardpaper hover:-translate-x-24 hover:scale-[1.02] hover:animate-sonic transition-all duration-500 cursor-default flex items-center group">
        <div
          className="w-full h-28 rounded flex items-center justify-center relative overflow-hidden px-6 shadow-lg font-semibold bg-primary"
        >
          {/* Big letter when not hovered */}
          <span className="text-secondary  drop-shadow-[0_0_4px_rgba(3,3,3,0.4)] font-extrabold text-2xl tracking-wide transition-opacity duration-300 group-hover:opacity-0">
            G
          </span>

          {/* Hardware description text on hover */}
          <p className={
            "absolute inset-x-3 top-1/2 -translate-y-1/2 " +
            "text-background text-[0.75rem] leading-relaxed " +
            "opacity-0 group-hover:opacity-100 transition-opacity duration-500 " +
            "text-center font-semibold drop-shadow-[0_0_4px_rgba(0,0,1,0.3)] text-full"
          }>
            This section allows you to select any color from the interface, and the Raspberry Pi
            instantly displays it using real RGB LEDs. It shows how front-end interactions on the web
            can directly control physical hardware — a real example of full-stack hardware–software
            integration.
          </p>
        </div>
      </div>

      {/* BLUE CARD */}
      <div className="p-1 rounded-lg shadow bg-cardpaper hover:translate-x-24 hover:scale-[1.02] hover:animate-sonic transition-all duration-500 cursor-default flex items-center group">
        <div
          className="w-full h-28 rounded flex items-center justify-center relative overflow-hidden px-6 shadow-lg font-semibold bg-link"
        >
          {/* Big letter when not hovered */}
          <span className="text-secondary  drop-shadow-[0_0_4px_rgba(3,3,3,0.4)] font-extrabold text-2xl tracking-wide transition-opacity duration-300 group-hover:opacity-0">
            B
          </span>

          {/* Fun fact text on hover */}
          <p className={
            "absolute inset-x-3 top-1/2 -translate-y-1/2 " +
            "text-background text-[0.75rem] leading-relaxed " +
            "opacity-0 group-hover:opacity-100 transition-opacity duration-500 " +
            "text-center font-semibold drop-shadow-[0_0_4px_rgba(0,0,1,0.3)] text-full"
          }>
            Blue feels trustworthy and calm, which is why tech companies and banks choose it so
            often for their branding.
          </p>
        </div>
      </div>

    </div>
  );
}

export default RGBCards;
