import { pixelBasedPreset } from "@react-email/components";
import type { Config } from "tailwindcss";

const config: Config = {
	presets: [pixelBasedPreset],
	theme: {
		extend: {
			colors: {
				// Tokens aligned with src/styles.css
				background: "#23272d",
				foreground: "#e8e9eb",
				card: "#23272d",
				"card-foreground": "#e8e9eb",
				popover: "#23272d",
				"popover-foreground": "#e8e9eb",
				primary: "#f1fe06",
				"primary-foreground": "#23272d",
				secondary: "#5d6166",
				"secondary-foreground": "#e8e9eb",
				muted: "#323741",
				"muted-foreground": "#8b8f94",
				accent: "#f1fe06",
				"accent-foreground": "#23272d",
				destructive: "#ef4444",
				"destructive-foreground": "#f8fafc",
				border: "#5d6166",
				input: "#5d6166",
				ring: "#f1fe06",
				"brand-primary": "#f1fe06",
				"brand-secondary": "#e2d4ff",
				"brand-bg": "#23272d",
				"brand-surface": "#23272d",
				"brand-dark": "#5d6166",
				"brand-gray": "#8b8f94",
				"brand-light": "#e8e9eb",
			},
			fontFamily: {
				sans: [
					'"DM Sans"',
					"ui-sans-serif",
					"system-ui",
					"-apple-system",
					"BlinkMacSystemFont",
					'"Segoe UI"',
					"Roboto",
					'"Helvetica Neue"',
					"Arial",
					"sans-serif",
				],
				serif: [
					'"DR"',
					"ui-serif",
					"Georgia",
					"Cambria",
					'"Times New Roman"',
					"Times",
					"serif",
				],
				mono: [
					"ui-monospace",
					"SFMono-Regular",
					"Menlo",
					"Monaco",
					"Consolas",
					'"Liberation Mono"',
					'"Courier New"',
					"monospace",
				],
			},
			borderRadius: {
				sm: "0rem",
				md: "0rem",
				lg: "0rem",
				xl: "0rem",
				DEFAULT: "0rem",
			},
		},
	},
};

export default config;
