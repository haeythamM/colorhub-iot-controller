# hardware.py
"""
Hardware abstraction layer for ColorHub.

Goal:
- Run on Raspberry Pi with real GPIO + I2C LCD + buzzer.
- Run on cloud (e.g., Render) without crashing (no GPIO available), using MOCK mode.

How it works:
- HARDWARE_MODE env var:
  - "auto" (default): try real hardware; if imports fail -> mock
  - "pi": force real hardware (will error if libs are missing)
  - "mock": force mock mode (safe on Render)
"""

import os
import time
import threading

HARDWARE_MODE = os.getenv("HARDWARE_MODE", "auto").strip().lower()

GPIO = None
CharLCD = None
HARDWARE_AVAILABLE = False
IMPORT_ERROR = None

if HARDWARE_MODE in ("auto", "pi"):
    try:
        import RPi.GPIO as _GPIO
        from RPLCD.i2c import CharLCD as _CharLCD
        GPIO = _GPIO
        CharLCD = _CharLCD
        HARDWARE_AVAILABLE = True
    except Exception as e:
        HARDWARE_AVAILABLE = False
        IMPORT_ERROR = str(e)

if HARDWARE_MODE == "pi" and not HARDWARE_AVAILABLE:
    # Force mode requested, but hardware libs are missing.
    raise RuntimeError(
        f"HARDWARE_MODE=pi but hardware libraries are not available. Error: {IMPORT_ERROR}"
    )


def _log(msg: str) -> None:
    print(f"[HARDWARE] {msg}")


# ==========================
# MOCK MODE IMPLEMENTATION
# ==========================
if not HARDWARE_AVAILABLE:
    _log("Running in MOCK mode (no GPIO/LCD available).")

    def lcd_show_welcome():
        _log("LCD welcome: Welcome to | ColorHub")

    def lcd_show_message(text: str):
        text = (text or "").strip()
        _log(f"LCD message: {text}")

    def set_led_from_hex(hex_color: str):
        _log(f"LED set from hex: {hex_color}")

    def set_color(r, g, b):
        _log(f"LED set RGB: r={r}, g={g}, b={b}")

    def white_default():
        _log("LED default -> white")

    def green_success():
        _log("LED success -> green")

    def red_fail():
        _log("LED fail -> red")

    def stop_sound():
        _log("Stop sound")

    def play_success():
        _log("Play success melody (mock)")

    def play_fail():
        _log("Play fail melody (mock)")

    def cleanup():
        _log("Cleanup (mock)")

# ==========================
# REAL HARDWARE IMPLEMENTATION (Raspberry Pi)
# ==========================
else:
    # -------- GPIO PINS (BCM numbering) --------
    BUZZER_PIN = 23
    RED_PIN = 26
    GREEN_PIN = 19
    BLUE_PIN = 13

    GPIO.setwarnings(False)
    GPIO.setmode(GPIO.BCM)

    GPIO.setup(BUZZER_PIN, GPIO.OUT)
    GPIO.setup(RED_PIN, GPIO.OUT)
    GPIO.setup(GREEN_PIN, GPIO.OUT)
    GPIO.setup(BLUE_PIN, GPIO.OUT)

    # -------- BUZZER PWM --------
    pwm = GPIO.PWM(BUZZER_PIN, 440)
    pwm.start(0)  # start silent

    # -------- RGB LED PWM --------
    red_pwm = GPIO.PWM(RED_PIN, 1000)
    green_pwm = GPIO.PWM(GREEN_PIN, 1000)
    blue_pwm = GPIO.PWM(BLUE_PIN, 1000)

    red_pwm.start(0)
    green_pwm.start(0)
    blue_pwm.start(0)

    RED_SCALE = 1.0
    GREEN_SCALE = 1.0
    BLUE_SCALE = 1.0

    # -------- LCD (I2C) --------
    lcd = None
    lcd_lock = threading.Lock()

    def _init_lcd():
        """Initialize the I2C LCD once."""
        global lcd
        if lcd is not None:
            return

        try:
            lcd_local = CharLCD(
                i2c_expander="PCF8574",
                address=0x27,  # change if your i2cdetect shows different address
                port=1,
                cols=16,
                rows=2,
                charmap="A02",
                auto_linebreaks=True,
            )
            lcd = lcd_local
            _log("I2C LCD initialized at address 0x27")
        except Exception as e:
            lcd = None
            _log(f"Failed to initialize I2C LCD: {e}")

    def lcd_write_lines(line1: str, line2: str = ""):
        """Write two lines to LCD safely."""
        _init_lcd()
        if lcd is None:
            _log(f"(LCD not available) {line1} | {line2}")
            return

        l1 = (line1[:16]).ljust(16)
        l2 = (line2[:16]).ljust(16)

        with lcd_lock:
            try:
                lcd.clear()
                time.sleep(0.05)
                lcd.home()
                time.sleep(0.02)
                lcd.write_string(l1)
                lcd.crlf()
                lcd.write_string(l2)
            except Exception as e:
                _log(f"LCD write error: {e}")

    def lcd_show_welcome():
        """Default welcome message."""
        lcd_write_lines("Welcome to", "ColorHub")

    def lcd_show_message(text: str):
        """Show a custom message on LCD (1 or 2 lines)."""
        text = (text or "").strip()
        if len(text) <= 16:
            lcd_write_lines(text, "")
        else:
            lcd_write_lines(text[:16], text[16:32])

    # -------- RGB helpers --------
    def _clamp_percent(x: float) -> float:
        """Clamp a value into 0..100 duty cycle."""
        if x < 0:
            return 0
        if x > 100:
            return 100
        return x

    def _set_color_percent(r_percent: float, g_percent: float, b_percent: float):
        """Core PWM write."""
        r_duty = _clamp_percent(r_percent * RED_SCALE)
        g_duty = _clamp_percent(g_percent * GREEN_SCALE)
        b_duty = _clamp_percent(b_percent * BLUE_SCALE)

        red_pwm.ChangeDutyCycle(r_duty)
        green_pwm.ChangeDutyCycle(g_duty)
        blue_pwm.ChangeDutyCycle(b_duty)

    def set_color(r, g, b):
        """
        Public function:
        Accepts 0..255 (RGB) or 0..100 values.
        Converts to duty cycle percent and applies PWM.
        """
        def normalize(value):
            try:
                v = int(value)
            except Exception:
                v = 0

            if v < 0:
                v = 0
            if v > 255:
                v = 255

            # If user already gave percent (0..100), keep it.
            if v <= 100:
                return float(v)

            return (v / 255.0) * 100.0

        _set_color_percent(normalize(r), normalize(g), normalize(b))

    def set_led_from_hex(hex_color: str):
        """Accept '#RRGGBB' or 'RRGGBB'."""
        if not isinstance(hex_color, str):
            return

        s = hex_color.strip()
        if s.startswith("#"):
            s = s[1:]

        if len(s) != 6:
            return

        try:
            r = int(s[0:2], 16)
            g = int(s[2:4], 16)
            b = int(s[4:6], 16)
        except ValueError:
            return

        set_color(r, g, b)

    def white_default():
        """Default idle LED state (soft white)."""
        _set_color_percent(100, 100, 100)

    def green_success():
        """Success LED color."""
        _set_color_percent(0, 100, 0)

    def red_fail():
        """Fail LED color."""
        _set_color_percent(100, 0, 0)

    # -------- Notes and melodies --------
    NOTES = {
        "G3": 196,
        "A3": 220,
        "C4": 262,
        "D4": 294,
        "E4": 330,
        "F4": 349,
        "G4": 392,
        "A4": 440,
        "B4": 494,
        "C5": 523,
        "D5": 587,
        "E5": 659,
        "F5": 698,
        "G5": 784,
        "REST": 0,
    }

    BPM = 120
    BEAT_DURATION = 60.0 / BPM

    ODE_TO_JOY = [
        ("E4", 1), ("E4", 1), ("F4", 1), ("G4", 1),
        ("G4", 1), ("F4", 1), ("E4", 1), ("D4", 1),
        ("C4", 1), ("C4", 1), ("D4", 1), ("E4", 1),
        ("E4", 1.5), ("D4", 0.5), ("D4", 2),
        ("REST", 0.2),
        ("E4", 1), ("E4", 1), ("F4", 1), ("G4", 1),
        ("G4", 1), ("F4", 1), ("E4", 1), ("D4", 1),
        ("C4", 1), ("C4", 1), ("D4", 1), ("E4", 1),
        ("D4", 1.5), ("C4", 0.5), ("C4", 2),
        ("REST", 0.1),
        ("D4", 1), ("D4", 1), ("E4", 1), ("C4", 1),
        ("D4", 1), ("E4", 0.5), ("F4", 0.5), ("E4", 1), ("C4", 1),
        ("D4", 1), ("E4", 0.5), ("F4", 0.5), ("E4", 1), ("D4", 1),
        ("C4", 1), ("D4", 1), ("G3", 2),
        ("REST", 0.3),
        ("E4", 1), ("E4", 1), ("F4", 1), ("G4", 1),
        ("G4", 1), ("F4", 1), ("E4", 1), ("D4", 1),
        ("C4", 1), ("C4", 1), ("D4", 1), ("E4", 1),
        ("D4", 1.5), ("C4", 0.5), ("C4", 3),
    ]

    FAIL_MELODY = [
        ("E4", 0.5), ("D4", 0.5), ("C4", 1.0),
        ("REST", 0.2),
        ("C4", 0.5), ("D4", 0.5), ("C4", 1.5),
    ]

    current_thread = None
    stop_flag = False
    lock = threading.Lock()

    def play_note(note: str, beats: float):
        """Play a single note for a given number of beats."""
        global stop_flag

        duration = beats * BEAT_DURATION
        freq = NOTES.get(note, 0)

        if freq == 0:
            pwm.ChangeDutyCycle(0)
            time.sleep(duration)
            return

        pwm.ChangeFrequency(freq)
        pwm.ChangeDutyCycle(50)

        elapsed = 0.0
        step = 0.02
        while elapsed < duration * 0.9:
            if stop_flag:
                break
            time.sleep(step)
            elapsed += step

        pwm.ChangeDutyCycle(0)
        time.sleep(duration * 0.1)

    def run_melody(melody):
        """Background thread worker to play a melody."""
        global stop_flag
        stop_flag = False
        try:
            for note, beats in melody:
                if stop_flag:
                    break
                play_note(note, beats)
        finally:
            pwm.ChangeDutyCycle(0)
            white_default()
            lcd_show_welcome()

    def stop_sound():
        """Stop any playing melody and reset buzzer, LED and LCD."""
        global stop_flag
        stop_flag = True
        pwm.ChangeDutyCycle(0)
        white_default()
        lcd_show_welcome()

    def play_success():
        """Play success melody + success LED + LCD message."""
        global current_thread
        with lock:
            stop_sound()
            green_success()
            lcd_write_lines("Congrats!", "All correct")
            current_thread = threading.Thread(target=run_melody, args=(ODE_TO_JOY,), daemon=True)
            current_thread.start()

    def play_fail():
        """Play fail melody + fail LED + LCD message."""
        global current_thread
        with lock:
            stop_sound()
            red_fail()
            lcd_write_lines("Try again", "You can do it")
            current_thread = threading.Thread(target=run_melody, args=(FAIL_MELODY,), daemon=True)
            current_thread.start()

    def cleanup():
        """Clean up GPIO on shutdown."""
        stop_sound()
        pwm.stop()
        red_pwm.stop()
        green_pwm.stop()
        blue_pwm.stop()
        GPIO.cleanup()
