import fs from 'fs';

let code = fs.readFileSync('c:/Users/SOURAV/Hackathon/frontend/src/pages/VehicleDetail.jsx', 'utf8');

// Normalize to \n for easier regex
code = code.replace(/\r\n/g, '\n');

code = code.replace(
  /<header className="vd-header glass">[\s\n]+<div className="header-brand">/,
  `<header className="vd-header glass">\n          <div className="vd-header-left">\n            <button className="btn-back" onClick={() => navigate('/vehicles')} aria-label="Back to Vehicles">\n              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>\n            </button>\n          <div className="header-brand">`
);

code = code.replace(
  /<\/div>[\s\n]+<div className="header-actions">/,
  `</div>\n          </div>\n          <div className="header-actions">`
);

code = code.replace(
  /\.vd-header \{[\s\n]+height: 70px;[\s\n]+display: flex;[\s\n]+justify-content: space-between;[\s\n]+align-items: center;[\s\n]+padding: 0 2rem;[\s\n]+border-bottom: 1px solid rgba\(255,255,255,0\.05\);[\s\n]+padding-left: 80px;[\s\n]+\}/,
  `.vd-header {\n          height: 70px;\n          display: flex;\n          justify-content: space-between;\n          align-items: center;\n          padding: 0 2rem;\n          border-bottom: 1px solid rgba(255,255,255,0.05);\n        }\n\n        .vd-header-left {\n          display: flex;\n          align-items: center;\n          gap: 1.5rem;\n        }\n\n        .btn-back {\n          background: transparent;\n          border: none;\n          color: var(--text-muted);\n          cursor: pointer;\n          display: flex;\n          align-items: center;\n          justify-content: center;\n          padding: 0.5rem;\n          border-radius: 8px;\n          transition: background 0.2s;\n        }\n        .btn-back:hover {\n          background: rgba(255, 255, 255, 0.05);\n          color: var(--text);\n        }`
);

code = code.replace(
  /\.toggle-group \{[\s\n]+display: flex;[\s\n]+align-items: center;[\s\n]+gap: 1rem;[\s\n]+margin-bottom: 0\.5rem;[\s\n]+\}[\s\n]+\.price-input \{[\s\n]+width: 150px;[\s\n]+padding: 0\.4rem 0\.8rem;[\s\n]+\}/,
  `.toggle-group {\n          display: flex;\n          align-items: center;\n          gap: 1rem;\n          margin-bottom: 0.5rem;\n        }\n        .toggle-group.rent-group {\n          flex-direction: column;\n          align-items: flex-start;\n          background: rgba(255, 255, 255, 0.02);\n          padding: 1rem;\n          border-radius: 12px;\n          border: 1px solid var(--border);\n        }\n        .rent-inputs {\n          display: grid;\n          grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));\n          gap: 0.75rem;\n          width: 100%;\n          margin-top: 0.5rem;\n        }\n        .toggle-group.sell-group {\n          background: rgba(255, 255, 255, 0.02);\n          padding: 1rem;\n          border-radius: 12px;\n          border: 1px solid var(--border);\n          justify-content: space-between;\n        }\n        .price-input {\n          width: 100%;\n          padding: 0.6rem 0.8rem;\n          font-size: 0.85rem;\n        }`
);

fs.writeFileSync('c:/Users/SOURAV/Hackathon/frontend/src/pages/VehicleDetail.jsx', code);
console.log("Patch applied correctly.");
