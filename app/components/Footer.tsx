"use client";

import Link from "next/link";

const footerLinks = {
  Product: ["Features", "Adaptive AI", "Case Studies", "Integrations"],
  Company: ["About Us", "Careers", "Blog", "Security"],
  Legal: ["Privacy", "Terms", "Cookie Policy"],
  Support: ["Help Center", "Community", "Status"],
};

export default function Footer() {
  return (
    <footer
      style={{
        background: "#0c0e14",
        borderTop: "1px solid rgba(74, 68, 82, 0.2)",
        padding: "80px 0",
      }}
    >
      <div style={{ padding: "0 32px", maxWidth: "1440px", margin: "0 auto", width: "100%" }}>
        <div className="footer-grid">
          {/* Brand */}
          <div style={{ gridColumn: "span 2", display: "flex", flexDirection: "column", gap: "24px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span
                className="material-symbols-outlined"
                style={{
                  color: "#d6baff",
                  fontSize: "30px",
                  fontVariationSettings: "'FILL' 1",
                }}
              >
                auto_awesome
              </span>
              <span style={{ fontSize: "1.5rem", fontWeight: 700, color: "#e2e1eb", letterSpacing: "-0.02em" }}>
                MindHub AI
              </span>
            </div>
            <p style={{ color: "#ccc3d4", fontSize: "0.875rem", maxWidth: "20rem", lineHeight: 1.6, margin: 0 }}>
              Intelligence Optimized. The definitive platform for modern classrooms
              and adaptive learning experiences.
            </p>
            <div style={{ display: "flex", gap: "16px" }}>
              {["public", "share"].map((icon) => (
                <Link
                  key={icon}
                  href="#"
                  className="glass-card"
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#e2e1eb",
                    textDecoration: "none",
                    transition: "color 0.2s, background-color 0.2s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "#d6baff")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "#e2e1eb")}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>
                    {icon}
                  </span>
                </Link>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 style={{ fontSize: "11px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "#e2e1eb", marginBottom: "24px", margin: "0 0 24px 0" }}>
                {category}
              </h4>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "16px" }}>
                {links.map((link) => (
                  <li key={link}>
                    <Link
                      href="#"
                      style={{
                        color: "#ccc3d4",
                        fontSize: "0.875rem",
                        textDecoration: "none",
                        transition: "color 0.2s",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = "#d6baff")}
                      onMouseLeave={(e) => (e.currentTarget.style.color = "#ccc3d4")}
                    >
                      {link}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div
          style={{
            marginTop: "80px",
            paddingTop: "32px",
            borderTop: "1px solid rgba(255, 255, 255, 0.05)",
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "16px",
          }}
        >
          <p style={{ color: "#ccc3d4", fontSize: "0.75rem", margin: 0 }}>
            © {new Date().getFullYear()} MindHub AI. Intelligence Optimized.
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: "16px", fontSize: "0.75rem", color: "#ccc3d4" }}>
            <span>All rights reserved.</span>
            <span style={{ width: "4px", height: "4px", borderRadius: "50%", background: "rgba(255, 255, 255, 0.2)" }} />
            <span>ISO 27001 Certified</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
