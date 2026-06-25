# ColorHub

ColorHub is a full-stack IoT project that connects a React web interface to a Flask API and Raspberry Pi hardware.

The project explores color through an interactive browser experience, including a color playground, saved colors, a memory challenge, a quiz, and physical feedback from an RGB LED, a 16x2 I2C LCD, and a speaker.

## Overview

ColorHub demonstrates a complete hardware-to-UI workflow:

* A React frontend provides the user interface.
* A Flask backend exposes REST API endpoints.
* A Raspberry Pi hardware layer controls physical outputs.
* Mock mode allows development without Raspberry Pi GPIO access.

This makes the project useful both as an interactive web experience and as a practical IoT hardware control demo.

## Project Structure

```text
ColorHub/
├── Front-end--color-hub/
│   └── React + Vite user interface
│
├── Back-end--color-hub/
│   └── Flask API + Raspberry Pi hardware control
│
└── README.md
```

Each folder contains its own README with setup instructions and a short explanation of its code.

## How It Works

1. The user interacts with colors, challenges, and quiz controls in the browser.
2. The React frontend manages the UI experience and can send requests to the Flask API.
3. The Flask backend validates requests and calls the hardware abstraction layer.
4. On a Raspberry Pi, the hardware layer controls the RGB LED, 16x2 I2C LCD, and speaker.
5. On a regular computer or cloud server without GPIO support, the hardware layer uses mock mode and logs hardware actions instead.

## Technology

* Frontend: React, Vite, Tailwind CSS
* Backend: Python, Flask, Flask-CORS
* Hardware: Raspberry Pi GPIO, PWM, RGB LED, 16x2 I2C LCD, speaker
* Communication: JSON REST API

## Main Features

* Interactive RGB color playground
* Saved colors using browser local storage
* Four-color memory challenge
* Color knowledge quiz
* Backend endpoint for sending text to the LCD and color output to the RGB LED
* Hardware abstraction layer with Raspberry Pi and mock modes
* Local-first architecture for development and demos

## Run Locally

Start the backend:

```bash
cd Back-end--color-hub
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python app.py
```

On Windows PowerShell, activate the environment with:

```powershell
.\venv\Scripts\Activate.ps1
```

Start the frontend in a second terminal:

```bash
cd Front-end--color-hub
npm install
npm run dev
```

The frontend runs on:

```text
http://localhost:5173
```

The backend runs on:

```text
http://localhost:5000
```

## Configuration

### Frontend

```env
VITE_API_BASE_URL=http://localhost:5000
```

If `VITE_API_BASE_URL` is not set, the frontend uses:

```text
http://localhost:5000
```

### Backend

```env
PORT=5000
CORS_ORIGINS=http://localhost:5173
HARDWARE_MODE=auto
```

Available `HARDWARE_MODE` values:

* `auto`: Try Raspberry Pi hardware first, then fall back to mock mode.
* `pi`: Require Raspberry Pi GPIO and LCD libraries.
* `mock`: Run without physical hardware and print actions to the console.

## Documentation

See the README inside each folder for more details:

* `Front-end--color-hub/README.md`
* `Back-end--color-hub/README.md`

## Notes

ColorHub is designed as a local-first IoT demo. It can be extended later with persistent storage, authentication, MQTT, WebSocket updates, or secure remote access.

The current structure keeps the frontend, backend, and hardware layer separated so each part can be developed and tested independently.
