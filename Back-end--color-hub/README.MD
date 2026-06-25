# ColorHub Backend

This folder contains the Flask API and Raspberry Pi hardware abstraction layer for ColorHub.

## Overview

The backend connects the web dashboard to the Raspberry Pi hardware layer. It exposes REST API endpoints for controlling RGB LED colors, updating the 16x2 I2C LCD, triggering speaker feedback, storing temporary colors, and running a four-color memory challenge.

The API can run in real Raspberry Pi hardware mode or in mock mode for development on a regular computer.

## Main Files

* `app.py`: Defines the REST API, CORS configuration, in-memory color storage, and challenge state.
* `hardware.py`: Controls the RGB LED, 16x2 I2C LCD, and speaker feedback, or provides mock behavior when hardware is unavailable.
* `requirements.txt`: Lists the Python packages required by the Flask API.

## API Features

* Health check with `GET /api/ping`
* Set or reset the RGB LED color
* Send text to the LCD and color output to the LED
* Play success or failure feedback through the speaker and LED
* Store and delete colors in memory
* Start and submit a four-color memory challenge

Saved colors and active challenges are stored in memory, so they are cleared whenever the server restarts.

## Hardware Modes

The `HARDWARE_MODE` environment variable controls how `hardware.py` starts:

* `auto`: Tries Raspberry Pi hardware first and falls back to mock mode.
* `pi`: Requires Raspberry Pi GPIO and LCD libraries.
* `mock`: Runs without physical hardware and prints actions to the console.

Mock mode makes it possible to develop or test the API on a regular computer without GPIO support.

## Setup

Create and activate a virtual environment:

```bash
python -m venv venv
source venv/bin/activate
```

On Windows PowerShell:

```powershell
.\venv\Scripts\Activate.ps1
```

Install the API dependencies:

```bash
pip install -r requirements.txt
```

When running on a Raspberry Pi in real hardware mode, also install the packages that provide `RPi.GPIO` and `RPLCD`.

## Run

```bash
python app.py
```

The API listens on port `5000` by default. Set the `PORT` environment variable to use another port.

To force mock mode:

```bash
HARDWARE_MODE=mock python app.py
```

On Windows PowerShell:

```powershell
$env:HARDWARE_MODE = "mock"
python app.py
```

## Configuration

* `PORT`: Flask server port
* `CORS_ORIGINS`: Comma-separated list of allowed frontend origins
* `HARDWARE_MODE`: Hardware selection mode

The default allowed origins include the local Vite development server at:

```text
http://localhost:5173
```

## Notes

This backend is designed as a local-first Raspberry Pi API. It can be extended later with persistence, authentication, MQTT, WebSocket updates, or secure remote access without changing the core hardware control layer.
