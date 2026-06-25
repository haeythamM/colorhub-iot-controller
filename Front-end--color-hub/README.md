# ColorHub Frontend

This folder contains the browser interface for ColorHub. It is built with React and Vite, with Tailwind CSS used for styling.

## Overview

The frontend provides the user-facing dashboard for the ColorHub project. It includes interactive color tools, saved color management, a memory challenge, a color knowledge quiz, and a message form that can connect to the Flask backend to control Raspberry Pi hardware.

The interface is designed to demonstrate how a browser-based UI can control and visualize hardware behavior through a local API.

## Current Experience

* Introductory RGB cards with color facts
* Interactive color picker
* Saved colors stored in browser local storage
* Four-color memory challenge with similarity scoring
* Color knowledge quiz
* Responsive header, content sections, accordion controls, and footer
* Optional backend-connected message form for sending text to the LCD and color output to the RGB LED

The playground, saved colors, memory challenge, and quiz currently work locally in the browser.

The project also includes a `SendMessagePage` component that can call the backend endpoint for sending text to the 16x2 LCD and a color value to the RGB LED.

## Code Structure

* `src/main.jsx`: Creates the React application.
* `src/App.jsx`: Assembles the main page and its sections.
* `src/components/`: Contains the header, footer, RGB cards, accordion activities, buttons, and message form.
* `src/index.css`: Defines global styles and Tailwind layers.
* `tailwind.config.js`: Defines project colors, animation, and Tailwind configuration.
* `vite.config.js`: Defines Vite and React plugin configuration.

Most of the interactive activity logic is handled inside:

```text
src/components/InfoAccordion.jsx
```

This component manages the quiz, local color storage, random challenge sequences, selected colors, and similarity scoring.

## Setup

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

The development server normally runs at:

```text
http://localhost:5173
```

## Available Commands

```bash
npm run dev
npm run build
npm run lint
npm run preview
```

## Backend Connection

Components that call the Flask API use this environment variable:

```env
VITE_API_BASE_URL=http://localhost:5000
```

If the variable is not set, the frontend uses this default API address:

```text
http://localhost:5000
```

The Flask backend must allow the frontend origin through its `CORS_ORIGINS` configuration.

For local development, the backend should allow:

```text
http://localhost:5173
```

## Notes

The frontend is designed to work independently for UI development and demos, while also supporting backend-connected hardware control when the Flask API is running.

This makes it possible to develop the UI on a regular computer and later connect it to the Raspberry Pi hardware layer.
