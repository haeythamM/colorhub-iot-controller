function Header() {
  return (
    <header className="w-full sticky top-0 z-50 bg-background/80 backdrop-blur-sm border-b border-secondary/10">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
        
        {/* Logo / Title */}
        <p className="text-secondary font-bold text-xl tracking-wide hover:text-primary transition-colors duration-300 cursor-pointer">
          <a href="#top">
          <span className="text-primary">ColorHub</span>
          </a>
        </p>

        {/* Navigation */}
        <nav className="flex items-center gap-6">
          <a
            href="https://haeytham.dev/" target="_blank" rel="noopener noreferrer"
            className="text-secondary/80 hover:text-primary transition-colors duration-300 text-sm"
          >
            Portfolio 
          </a>

          <a
            href="https://hackaday.io/Haeytham" target="_blank" rel="noopener noreferrer"
            className="text-secondary/80 hover:text-primary transition-colors duration-300 text-sm"
          >
            Hackaday
          </a>

          <a
            href="https://www.linkedin.com/in/haeytham/"  target="_blank" rel="noopener noreferrer"
            className="text-secondary/80 hover:text-primary transition-colors duration-300 text-sm"
          >
          Linkenin
          </a>
        </nav>

      </div>
    </header>
  );
}

export default Header;
