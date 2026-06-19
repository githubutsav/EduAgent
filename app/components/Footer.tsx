export default function Footer() {
  const footerLinks = {
    Product: ["Vision", "Features", "Pricing"],
    India: ["Language Support", "Rural Education", "Impact Stories"],
    Company: ["Privacy Policy", "Terms of Service", "Contact Support"],
  };

  return (
    <footer className="bg-[#090A0F] border-t border-white/10 py-16 px-6">
      <div className="max-w-[1280px] mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
        {/* Brand */}
        <div className="md:col-span-1">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-lg gradient-button flex items-center justify-center">
              <span
                className="material-symbols-outlined text-[#090A0F] text-sm"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                school
              </span>
            </div>
            <span className="text-xl font-bold tracking-tight text-on-surface">EduAgent</span>
          </div>
          <p className="text-on-surface-variant text-sm leading-relaxed mb-6 pr-4">
            Empowering the next generation of educators with delightfully smart AI.
          </p>
        </div>

        {/* Links */}
        {Object.entries(footerLinks).map(([section, links]) => (
          <div key={section}>
            <h4 className="text-on-surface font-bold mb-6 text-sm">{section}</h4>
            <ul className="flex flex-col gap-4">
              {links.map((link) => (
                <li key={link}>
                  <a
                    href="#"
                    className="text-on-surface-variant hover:text-white transition-colors text-sm"
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Bottom bar */}
      <div className="max-w-[1280px] mx-auto mt-20 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
        <span className="text-xs text-on-surface-variant opacity-80">
          © 2026 EduAgent AI. Empowering the next generation of educators.
        </span>
        <div className="flex gap-6">
          <a href="#" className="text-on-surface-variant hover:text-primary transition-colors">
            <span className="material-symbols-outlined text-xl">public</span>
          </a>
          <a href="#" className="text-on-surface-variant hover:text-primary transition-colors">
            <span className="material-symbols-outlined text-xl">alternate_email</span>
          </a>
          <a href="#" className="text-on-surface-variant hover:text-primary transition-colors">
            <span className="material-symbols-outlined text-xl">share</span>
          </a>
        </div>
      </div>
    </footer>
  );
}
