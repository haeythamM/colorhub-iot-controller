function Footer() {
  return (
    <footer className="bg-background border-t border-secondary/20 mt-10 py-6">
      <div className="w-full px-16 flex flex-col md:flex-row items-center justify-between gap-4">

        {/* Left Text */}
        <p className="text-secondary text-sm tracking-wide">
          © {new Date().getFullYear()} Haeytham Almalak -<a href="#" className="text-primary">ColorHub</a> - Crafted with calm colors.
        </p>

        {/* Social Icons */}
        <div className="flex items-center gap-4">
          <a
            href="https://www.instagram.com/haeytham_almalak/reels/" target="_blank" rel="noopener noreferrer"
            className="text-secondary hover:text-primary transition-colors duration-300"
          >
            {/* Instagram Icon */}
            <svg width="30" height="30" fill="none" stroke="currentColor" strokeWidth="2"
              strokeLinecap="round" strokeLinejoin="round"
              className="hover:scale-110 transition-transform duration-300">
              <rect x="2" y="2" width="16" height="16" rx="4"></rect>
              <circle cx="12" cy="12" r="3"></circle>
            </svg>
          </a>

          <a
            href="https://github.com/haeythamM" target="_blank" rel="noopener noreferrer"
            className="text-secondary hover:text-primary transition-colors duration-300"
          >
            {/* GitHub Icon */}
            <svg width="30" height="30" fill="currentColor" className="hover:scale-110 transition-transform duration-300">
              <path d="M12 .5C5.648.5.5 5.648.5 12c0 5.086 3.292 9.393 7.863 10.92.575.106.787-.25.787-.556 0-.275-.012-1.177-.018-2.137-3.2.695-3.878-1.545-3.878-1.545-.523-1.33-1.278-1.684-1.278-1.684-1.044-.713.079-.698.079-.698 1.155.081 1.764 1.187 1.764 1.187 1.028 1.762 2.694 1.253 3.35.957.104-.744.402-1.254.73-1.543-2.555-.291-5.242-1.278-5.242-5.69 0-1.257.447-2.285 1.182-3.09-.118-.292-.512-1.467.112-3.06 0 0 .964-.309 3.16 1.18a11.03 11.03 0 0 1 2.878-.386c.976.005 1.96.133 2.878.386 2.196-1.49 3.158-1.18 3.158-1.18.626 1.593.232 2.768.114 3.06.735.805 1.178 1.833 1.178 3.09 0 4.423-2.693 5.395-5.256 5.68.413.355.78 1.07.78 2.157 0 1.56-.014 2.817-.014 3.2 0 .31.21.67.794.556C20.21 21.39 23.5 17.085 23.5 12 23.5 5.648 18.352.5 12 .5z" />
            </svg>
          </a>

        </div>
      </div>
    </footer>
  );
}

export default Footer;
