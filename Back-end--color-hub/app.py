import os
import time
import random
from flask import Flask, request, jsonify
from flask_cors import CORS
import hardware

app = Flask(__name__)

# -------------------------
# CORS configuration
# -------------------------

cors_env = os.getenv("CORS_ORIGINS", "").strip()
if cors_env:
    allowed_origins = [o.strip() for o in cors_env.split(",") if o.strip()]
else:
    allowed_origins = [
        "http://localhost:5173",
        "https://fill-stack-asperity-color-hub.vercel.app",
    ]

CORS(app, origins=allowed_origins)


# =========================
# Health Check
# =========================
@app.route("/api/ping", methods=["GET"])
def api_ping():
    return jsonify({"status": "ok", "message": "backend alive"})


# =========================
# Quiz Result (Success / Fail)
# =========================
@app.route("/api/play-result", methods=["POST"])
def api_play_result():
    data = request.get_json() or {}
    score = data.get("score")
    total = data.get("total")

    if score is None or total is None:
        return jsonify({"status": "error", "error": "score and total are required"}), 400

    try:
        if score == total:
            hardware.play_success()
            return jsonify({"status": "ok", "played": "success"})
        else:
            hardware.play_fail()
            return jsonify({"status": "ok", "played": "fail"})
    except Exception as e:
        return jsonify({"status": "error", "error": str(e)}), 500


@app.route("/api/stop-sound", methods=["POST"])
def api_stop_sound():
    try:
        hardware.stop_sound()
        return jsonify({"status": "ok", "stopped": True})
    except Exception as e:
        return jsonify({"status": "error", "error": str(e)}), 500


# =========================
# LED Color (Playground)
# =========================
@app.route("/api/set-color", methods=["POST"])
def api_set_color():
    data = request.get_json() or {}

    try:
        hex_color = data.get("hex")
        if hex_color:
            hardware.set_led_from_hex(hex_color)
            return jsonify({"status": "ok", "mode": "hex", "color": hex_color})

        # Fallback: RGB values
        r = int(data.get("r", 255))
        g = int(data.get("g", 255))
        b = int(data.get("b", 255))

        hardware.set_color(r, g, b)
        return jsonify({"status": "ok", "mode": "rgb", "color": {"r": r, "g": g, "b": b}})

    except Exception as e:
        return jsonify({"status": "error", "error": str(e)}), 500


@app.route("/api/reset-color", methods=["POST"])
def api_reset_color():
    try:
        hardware.white_default()
        return jsonify({"status": "ok", "color": "white"})
    except Exception as e:
        return jsonify({"status": "error", "error": str(e)}), 500


# =========================
# Saved Colors (In-Memory)
# =========================
# NOTE: This is in-memory storage. It will reset when the server restarts.
stored_colors = []
next_color_id = 1


@app.route("/api/colors", methods=["GET"])
def api_list_colors():
    return jsonify({"status": "ok", "colors": stored_colors})


@app.route("/api/colors", methods=["POST"])
def api_add_color():
    global next_color_id, stored_colors

    data = request.get_json() or {}
    hex_color = data.get("hex")
    label = data.get("label", "")

    if not hex_color:
        return jsonify({"status": "error", "error": "hex is required"}), 400

    color_obj = {"id": next_color_id, "hex": hex_color, "label": label}
    next_color_id += 1
    stored_colors.append(color_obj)

    return jsonify({"status": "ok", "color": color_obj})


@app.route("/api/colors/<int:color_id>", methods=["DELETE"])
def api_delete_color(color_id):
    global stored_colors
    stored_colors = [c for c in stored_colors if c["id"] != color_id]
    return jsonify({"status": "ok", "deleted": color_id})


# =========================
# Send Message to LCD + LED
# =========================
@app.route("/api/send-message", methods=["POST"])
def api_send_message():
    data = request.get_json() or {}

    text = (data.get("text") or "").strip()
    color = data.get("color", "#ffffff")

    if not text:
        return jsonify({"status": "error", "error": "text is required"}), 400

    try:
        if color:
            hardware.set_led_from_hex(color)

        hardware.lcd_show_message(text)
        return jsonify({"status": "ok", "text": text, "color": color})
    except Exception as e:
        return jsonify({"status": "error", "error": str(e)}), 500


# =========================
# Color Memory Challenge (4 colors)
# =========================

challenges = {}


def _random_hex_color():
    """Generate a random #RRGGBB color string."""
    return "#{:02x}{:02x}{:02x}".format(
        random.randint(0, 255),
        random.randint(0, 255),
        random.randint(0, 255),
    )


@app.route("/api/color-challenge/start", methods=["POST"])
def api_color_challenge_start():
    data = request.get_json() or {}
    seconds_per_color = float(data.get("secondsPerColor", 1))

    count = 4

    challenge_id = f"ch_{int(time.time() * 1000)}_{random.randint(1000, 9999)}"
    colors = [_random_hex_color() for _ in range(count)]

    challenges[challenge_id] = {
        "colors": colors,
        "created_at": time.time(),
        "seconds_per_color": seconds_per_color,
    }

    return jsonify({
        "status": "ok",
        "challengeId": challenge_id,
        "colors": colors,
    })


@app.route("/api/color-challenge/submit", methods=["POST"])
def api_color_challenge_submit():
    data = request.get_json() or {}
    challenge_id = data.get("challengeId")
    attempt = data.get("attempt")

    if not challenge_id or challenge_id not in challenges:
        return jsonify({"status": "error", "error": "invalid challengeId"}), 400

    if not isinstance(attempt, list) or len(attempt) != 4:
        return jsonify({"status": "error", "error": "attempt must be an array of 4 hex colors"}), 400

    truth = challenges[challenge_id]["colors"]

    per_color = []
    for i in range(4):
        a = (attempt[i] or "").strip().lower()
        t = (truth[i] or "").strip().lower()
        per_color.append(100 if a == t else 0)

    percent = int(sum(per_color) / 4)

    return jsonify({
        "status": "ok",
        "percent": percent,
        "perColor": per_color,
    })


# =========================
# Local dev entry point
# =========================
if __name__ == "__main__":
    try:
        hardware.white_default()
        hardware.lcd_show_welcome()
    except Exception:
        pass

    port = int(os.environ.get("PORT", "5000"))
    app.run(host="0.0.0.0", port=port, debug=False, use_reloader=False)
