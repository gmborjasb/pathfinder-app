const fs = require('fs');

const config = {
  darkMode: "class",
  theme: {
      extend: {
          "colors": {
              "on-surface-variant": "#434653",
              "inverse-surface": "#263143",
              "surface": "#FFFFFF",
              "on-background": "#111c2d",
              "surface-container-low": "#f0f3ff",
              "surface-bright": "#f9f9ff",
              "on-primary": "#ffffff",
              "surface-tint": "#1d59c1",
              "on-error-container": "#93000a",
              "border-subtle": "#E2E8F0",
              "on-surface": "#111c2d",
              "muted-slate": "#64748B",
              "on-secondary-container": "#6e5400",
              "on-primary-container": "#bcceff",
              "error-container": "#ffdad6",
              "on-tertiary-fixed-variant": "#005236",
              "on-tertiary-container": "#58e7ab",
              "tertiary-fixed-dim": "#4edea3",
              "inverse-on-surface": "#ecf1ff",
              "outline": "#737784",
              "surface-dim": "#cfdaf2",
              "outline-variant": "#c3c6d5",
              "tertiary-container": "#006544",
              "on-tertiary": "#ffffff",
              "surface-container-lowest": "#ffffff",
              "tertiary": "#004b31",
              "on-secondary-fixed-variant": "#594400",
              "primary-fixed": "#d9e2ff",
              "on-primary-fixed": "#001945",
              "error-red": "#EF4444",
              "secondary": "#765b00",
              "on-tertiary-fixed": "#002113",
              "on-secondary-fixed": "#251a00",
              "surface-variant": "#d8e3fb",
              "surface-container-high": "#dee8ff",
              "on-primary-fixed-variant": "#00419c",
              "secondary-fixed": "#ffdf94",
              "primary-fixed-dim": "#b0c6ff",
              "secondary-fixed-dim": "#f5bf00",
              "primary": "#003c90",
              "secondary-container": "#ffc703",
              "error": "#ba1a1a",
              "tertiary-fixed": "#6ffbbe",
              "primary-container": "#0f52ba",
              "surface-container-highest": "#d8e3fb",
              "surface-container": "#e7eeff",
              "background": "#F1F5F9",
              "on-error": "#ffffff",
              "inverse-primary": "#b0c6ff",
              "on-secondary": "#ffffff"
          },
          "borderRadius": {
              "DEFAULT": "0.25rem",
              "lg": "0.5rem",
              "xl": "0.75rem",
              "full": "9999px"
          },
          "spacing": {
              "margin-mobile": "20px",
              "xl": "32px",
              "gutter": "16px",
              "xs": "4px",
              "margin-desktop": "40px",
              "lg": "24px",
              "base": "4px",
              "md": "16px",
              "sm": "8px"
          },
          "fontFamily": {
              "stat-lg": ["Plus Jakarta Sans"],
              "body-bold": ["Plus Jakarta Sans"],
              "body-sm": ["Plus Jakarta Sans"],
              "headline-md": ["Plus Jakarta Sans"],
              "headline-md-mobile": ["Plus Jakarta Sans"],
              "display-lg": ["Plus Jakarta Sans"],
              "body-base": ["Plus Jakarta Sans"],
              "label-caps": ["Plus Jakarta Sans"]
          },
          "fontSize": {
              "stat-lg": ["32px", {"lineHeight": "40px", "letterSpacing": "-0.02em", "fontWeight": "600"}],
              "body-bold": ["16px", {"lineHeight": "24px", "letterSpacing": "0", "fontWeight": "600"}],
              "body-sm": ["14px", {"lineHeight": "20px", "letterSpacing": "0", "fontWeight": "400"}],
              "headline-md": ["24px", {"lineHeight": "32px", "letterSpacing": "-0.01em", "fontWeight": "700"}],
              "headline-md-mobile": ["20px", {"lineHeight": "28px", "letterSpacing": "-0.01em", "fontWeight": "700"}],
              "display-lg": ["48px", {"lineHeight": "56px", "letterSpacing": "-0.02em", "fontWeight": "800"}],
              "body-base": ["16px", {"lineHeight": "24px", "letterSpacing": "0", "fontWeight": "400"}],
              "label-caps": ["12px", {"lineHeight": "16px", "letterSpacing": "0.05em", "fontWeight": "700"}]
          }
      },
  },
};

let css = `@import "tailwindcss";\n\n@theme {\n`;
for (const [k, v] of Object.entries(config.theme.extend.colors)) {
  css += `  --color-${k}: ${v};\n`;
}
for (const [k, v] of Object.entries(config.theme.extend.spacing)) {
  css += `  --spacing-${k}: ${v};\n`;
}
for (const [k, v] of Object.entries(config.theme.extend.fontFamily)) {
  css += `  --font-${k}: "${v[0]}", sans-serif;\n`;
}
for (const [k, v] of Object.entries(config.theme.extend.fontSize)) {
  const size = v[0];
  const props = v[1];
  css += `  --text-${k}: ${size};\n`;
  if (props.lineHeight) css += `  --text-${k}--line-height: ${props.lineHeight};\n`;
  if (props.letterSpacing) css += `  --text-${k}--letter-spacing: ${props.letterSpacing};\n`;
  if (props.fontWeight) css += `  --text-${k}--font-weight: ${props.fontWeight};\n`;
}
css += `}\n`;
css += `
@keyframes pulse-ring {
    0% { transform: scale(.33); opacity: 1; }
    80%, 100% { transform: scale(1.5); opacity: 0; }
}
@utility pulse-active {
    &::before {
        content: '';
        position: absolute;
        left: 50%; top: 50%;
        transform: translate(-50%, -50%);
        width: 100%; height: 100%;
        background-color: #0F52BA;
        border-radius: 9999px;
        z-index: -1;
        animation: pulse-ring 1.5s cubic-bezier(0.455, 0.03, 0.515, 0.955) infinite;
    }
}
`;
fs.writeFileSync('src/index.css', css);
