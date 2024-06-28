/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ["./src/**/*.{js,jsx,ts,tsx}"],
	theme: {
		extend: {
			colors: {
				"aqua-100": "#07ECFF",
				"aqua-200": "#00BBCC",
				"aqua-300": "#007F9C",
				"dark-blue-500": "#161D26",
				"dark-blue-600": "#0F141A",
			},
		},
	},
	plugins: [],
};
