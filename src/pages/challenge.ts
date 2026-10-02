import { queueShell } from "../layout";
import type { MockState } from "../state";

/**
 * The security check in front of the waiting room (seen 29 Sep 2026).
 *
 * Queue-it's "Botdeflector": before the countdown there is a page asking you
 * to "complete the security check below", with an "I'm not a robot" box.
 * Ticking it opens an icon challenge: three small black icons in a strip, "Select
 * in this order", over a 300×200 picture of coloured shapes with the same icons
 * scattered on it in magenta. The headphones beside the box open the audio
 * challenge instead: a clip that says "Type the letters you will hear in a
 * moment", then "Type the letter B…" and so on, and a box for the letters.
 * Close and Refresh on both; Submit on the audio one.
 *
 * The markup, ids and inline styles below are copied from the real page. The
 * picture is drawn here in the browser rather than served as an image, a new
 * one each time, and the audio is the browser's own speech: the real clip is an
 * MP3 on Queue-it's servers. Neither is a faithful copy of the art, only of the
 * task, which is what there is to practise.
 */
export function challengePage(state: MockState) {
  const body = `
    <p class="challenge-lead">To begin, please complete the security check below:</p>
    <div id="divChallenge">
      <div id="divChallenge_Content">
        <div id="challenge-widget-container">
          <div id="challenge-container">${widget()}</div>
          <div class="hidden" id="three-bar-loader-container">
            <div class="three-bar-loader"></div>
            <div class="three-bar-loader"></div>
            <div class="three-bar-loader"></div>
          </div>
        </div>
      </div>
    </div>
    ${iconModal()}
    ${audioModal()}
    <style>${STYLES}</style>
    <script>${SCRIPT}</script>`;

  return queueShell({
    title: "Security check",
    body,
    practiceNote: "security check",
    statusTime: "",
    sale: { coach: state.coach, slots: state.slots },
    skipTo: "/queue",
  });
}

function widget(): string {
  return `<div class="botdeflector-widget" role="group" aria-label="Botdeflector human verification" style="border: 1px solid rgb(211, 211, 211); border-radius: 3px; padding: 10px; display: inline-block; background-color: rgb(249, 249, 249); font-family: &quot;Helvetica Neue&quot;, Helvetica, Arial, sans-serif;">
  <div style="display: flex; align-items: center; gap: 10px;">
    <input type="checkbox" class="botdeflector-checkbox" aria-label="Verify that you are human" style="width: 20px; height: 20px; cursor: pointer;">
    <span class="botdeflector-tick" aria-hidden="true">✓</span>
    <div style="display: flex; align-items: center; gap: 8px; flex: 1 1 0%;">
      <span role="button" tabindex="0" class="botdeflector-label" aria-label="Toggle verification" style="font-size: 14px; color: rgb(85, 85, 85); user-select: none; cursor: pointer;">I'm not a robot</span>
      <div style="cursor: pointer; flex-shrink: 0; display: flex; align-items: center; justify-content: center; margin: 0px 8px; height: 34px; width: 34px;">
        <svg class="botdeflector-headphone" width="24" height="24" viewBox="0 0 24 24" aria-label="Switch to audio challenge" role="button" tabindex="0" style="display: block;"><path fill="#666" d="M12 3C7.03 3 3 7.03 3 12v7c0 1.1.9 2 2 2h2c1.1 0 2-.9 2-2v-4c0-1.1-.9-2-2-2H5v-1c0-3.87 3.13-7 7-7s7 3.13 7 7v1h-2c-1.1 0-2 .9-2 2v4c0 1.1.9 2 2 2h2c1.1 0 2-.9 2-2v-7c0-4.97-4.03-9-9-9z"></path></svg>
      </div>
    </div>
  </div>
</div>`;
}

const MODAL_BOX =
  "background-color: white; border-radius: 8px; padding: 20px; box-shadow: rgba(0, 0, 0, 0.1) 0px 4px 6px; max-width: 500px; max-height: 80vh; overflow-y: auto;";
// The real backdrop has no padding; the 16px keeps the box off a phone's edges.
const MODAL_BACKDROP =
  "position: fixed; top: 0px; left: 0px; width: 100%; height: 100%; background-color: rgba(0, 0, 0, 0.7); align-items: center; justify-content: center; z-index: 10000; padding: 16px; box-sizing: border-box;";
const BLUE_BUTTON =
  "padding: 10px 16px; background-color: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 14px;";
const WHITE_BUTTON =
  "padding: 10px 16px; background-color: #ffffff; border: 1px solid #007bff; color: #007bff; border-radius: 4px; cursor: pointer; font-size: 14px;";

function iconModal(): string {
  return `<div id="botdeflector-modal" class="bd-modal" role="dialog" aria-modal="true" aria-labelledby="botdeflector-icon-title" style="${MODAL_BACKDROP} display: none;">
  <div style="${MODAL_BOX}">
    <div id="iconChallenge">
      <h2 id="botdeflector-icon-title" style="margin: 0 0 12px; font-size: 18px; color: #000;">Icon challenge</h2>
      <div style="display: flex; align-items: center; margin-bottom: 15px;">
        <div id="help-text" style="flex: 1; color: #000;">Select in this order:</div>
        <div id="icons" style="width: 86px; height: 27px; flex: 0 0 86px;">
          <canvas id="icons-strip" width="172" height="54" aria-label="challenge icons" style="display: block; width: 86px; height: 27px; background: #f0f0f0; border-radius: 4px;"></canvas>
        </div>
      </div>
      <div id="image-wrap" style="position: relative; display: inline-block; width: 300px; height: 200px; cursor: pointer;">
        <canvas id="image" width="600" height="400" aria-label="challenge image" style="display: block; width: 300px; height: 200px; background: #f0f0f0; border-radius: 4px;"></canvas>
        <canvas id="canvas" width="600" height="400" style="position: absolute; top: 0; left: 0; width: 300px; height: 200px; pointer-events: none;"></canvas>
      </div>
      <div id="bf-footer-left" style="margin-top: 15px; gap: 10px; display: flex;">
        <button class="bf_close" aria-label="Close" type="button" style="${BLUE_BUTTON}">Close</button>
        <button class="bf_refresh" aria-label="Refresh" type="button" style="${WHITE_BUTTON}">Refresh</button>
      </div>
    </div>
  </div>
</div>`;
}

function audioModal(): string {
  return `<div id="botdeflector-audio-modal" class="bd-modal" role="dialog" aria-modal="true" aria-labelledby="botdeflector-audio-title" style="${MODAL_BACKDROP} display: none;">
  <div style="${MODAL_BOX} width: 100%;">
    <div id="audioChallenge">
      <h2 id="botdeflector-audio-title" style="margin: 0 0 12px; font-size: 18px; color: #000;">Audio challenge</h2>
      <div id="audio-status" role="status" style="margin-bottom: 15px; font-size: 16px; font-weight: 500; color: #000;">
        Listen to the audio and enter the letters you hear
      </div>
      <div class="bd-player" style="margin-bottom: 20px;" aria-label="Audio challenge">
        <button type="button" class="bd-play" aria-label="Play">▶</button>
        <span class="bd-time"><span id="bd-now">0:00</span> / <span id="bd-length">0:17</span></span>
        <span class="bd-track"><span class="bd-fill" id="bd-fill"></span></span>
        <span aria-hidden="true" class="bd-volume">🔊</span>
      </div>
      <div style="margin-bottom: 15px;">
        <label for="audio-answer-input" style="display: block; margin-bottom: 8px; font-size: 14px; color: #000;">Enter the letters you hear</label>
        <input id="audio-answer-input" type="text" inputmode="text" maxlength="10" autocomplete="off" autocapitalize="characters" spellcheck="false" placeholder="Enter letters" style="width: 100%; padding: 12px; font-size: 18px; border: 2px solid #d3d3d3; border-radius: 4px; box-sizing: border-box; text-transform: uppercase; background: #fff; max-width: none;">
        <div id="audio-input-error" role="alert" style="margin-top: 8px; color: #b00020; font-size: 13px; min-height: 18px;"></div>
      </div>
      <div style="display: flex; gap: 10px;">
        <button type="button" class="close-button" style="flex: 1; ${WHITE_BUTTON}">Close</button>
        <button type="button" class="refresh-button" style="flex: 1; ${WHITE_BUTTON}">Refresh</button>
        <button type="button" class="submit-button" disabled style="flex: 1; ${BLUE_BUTTON}">Submit</button>
      </div>
    </div>
  </div>
</div>`;
}

const STYLES = `
  .queue-panel p.challenge-lead { text-align: center; margin: 30px 0 22px; }
  #divChallenge { text-align: center; margin-bottom: 30px; }
  #challenge-widget-container { display: inline-block; }
  .bd-modal .bd-player, .bd-modal button, .bd-modal input, .bd-modal h2, .bd-modal div {
    font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
  }
  .botdeflector-tick { display: none; width: 20px; height: 20px; color: #19be81; font-size: 22px; line-height: 20px; font-weight: 700; }
  .botdeflector-widget.passed .botdeflector-checkbox { display: none; }
  .botdeflector-widget.passed .botdeflector-tick { display: inline-block; }
  .submit-button:disabled { opacity: .5; cursor: default !important; }
  /* A stand-in for the browser's own audio control, which is what the real
     page shows: the clip here is spoken by the browser, not a file. */
  .bd-player { display: flex; align-items: center; gap: 12px; background: #f1f3f4; border-radius: 28px; padding: 12px 18px; }
  .bd-play { border: 0; background: none; font-size: 18px; cursor: pointer; width: 22px; padding: 0; color: #000; }
  .bd-time { font-size: 14px; color: #000; font-variant-numeric: tabular-nums; white-space: nowrap; }
  .bd-track { flex: 1; height: 4px; background: #c8c8c8; border-radius: 2px; overflow: hidden; }
  .bd-fill { display: block; height: 100%; width: 0; background: #000; }
  .bd-volume { font-size: 16px; }
  #three-bar-loader-container { display: flex; gap: 5px; justify-content: center; margin-top: 16px; }
  #three-bar-loader-container.hidden { display: none; }
  .three-bar-loader { width: 6px; height: 22px; background: #1a1449; animation: bd-bar 0.9s infinite ease-in-out; }
  .three-bar-loader:nth-child(2) { animation-delay: .15s; }
  .three-bar-loader:nth-child(3) { animation-delay: .3s; }
  @keyframes bd-bar { 0%, 100% { transform: scaleY(.4); } 50% { transform: scaleY(1); } }
  @media (max-width: 380px) {
    #image-wrap { transform: scale(.9); transform-origin: left top; }
  }
`;

/**
 * Plain JavaScript for the page. Written without template literals so it can
 * sit inside this file's own template string.
 */
const SCRIPT = String.raw`
(function () {
  // Icons on a 24-unit grid, as SVG paths, drawn with Path2D.
  var ICONS = {
    cap: "M12 3L1 9l11 6 9-4.9V17h2V9L12 3zm-7 10.2v4L12 21l7-3.8v-4L12 17l-7-3.8z",
    trophy: "M19 5h-2V3H7v2H5c-1.1 0-2 .9-2 2v1c0 2.55 1.92 4.63 4.39 4.94.63 1.5 1.98 2.63 3.61 2.96V19H7v2h10v-2h-4v-3.1c1.63-.33 2.98-1.46 3.61-2.96C19.08 12.63 21 10.55 21 8V7c0-1.1-.9-2-2-2zM5 8V7h2v3.82C5.84 10.4 5 9.3 5 8zm14 0c0 1.3-.84 2.4-2 2.82V7h2v1z",
    frame: "M3 3h7v2H5v5H3V3zm11 0h7v7h-2V5h-5V3zM3 14h2v5h5v2H3v-7zm16 5v-5h2v7h-7v-2h5zM8 8h8v8H8z",
    star: "M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z",
    heart: "M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z",
    note: "M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z",
    bell: "M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"
  };
  var NAMES = Object.keys(ICONS);
  // Drawn at twice the size shown, so it stays sharp on a phone.
  var W = 600, H = 400, SIZE = 80;

  function rand(min, max) { return min + Math.random() * (max - min); }
  function pick(list) { return list[Math.floor(Math.random() * list.length)]; }
  function shuffle(list) {
    var copy = list.slice();
    for (var i = copy.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = copy[i]; copy[i] = copy[j]; copy[j] = t;
    }
    return copy;
  }

  var widgetEl = document.querySelector(".botdeflector-widget");
  var checkbox = document.querySelector(".botdeflector-checkbox");
  var loader = document.getElementById("three-bar-loader-container");
  var iconModal = document.getElementById("botdeflector-modal");
  var audioModal = document.getElementById("botdeflector-audio-modal");

  function open(modal) { modal.style.display = "flex"; }
  function close(modal) { modal.style.display = "none"; checkbox.checked = false; stopAudio(); }

  function passed() {
    iconModal.style.display = "none";
    audioModal.style.display = "none";
    stopAudio();
    widgetEl.classList.add("passed");
    loader.classList.remove("hidden");
    setTimeout(function () { location.href = "/queue"; }, 1400);
  }

  /* ---------------- the icon challenge ---------------- */
  var targets = [];  // [{ name, x, y }] in the order to click
  var clicks = [];
  var helpText = document.getElementById("help-text");
  var image = document.getElementById("image");
  var overlay = document.getElementById("canvas");
  var strip = document.getElementById("icons-strip");

  function drawIcon(ctx, name, x, y, size, colour, angle) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle || 0);
    ctx.scale(size / 24, size / 24);
    ctx.translate(-12, -12);
    ctx.fillStyle = colour;
    ctx.fill(new Path2D(ICONS[name]));
    ctx.restore();
  }

  function newIconChallenge() {
    clicks = [];
    helpText.textContent = "Select in this order:";
    helpText.style.color = "#000";
    var chosen = shuffle(NAMES).slice(0, 4);  // three to find and one that isn't asked for
    var ctx = image.getContext("2d");
    ctx.filter = "none";
    ctx.fillStyle = pick(["#3d8b3d", "#2f7f5f", "#4a8a3a"]);
    ctx.fillRect(0, 0, W, H);
    // Muddy shapes, a little blurred, for the icons to hide among.
    ctx.filter = "blur(1.5px)";
    var colours = ["#8f9a2e", "#9aa336", "#3b8fd0", "#5a1aa0", "#7c1f7c", "#a01f1f", "#2f6fb0"];
    for (var i = 0; i < 12; i++) {
      ctx.fillStyle = pick(colours);
      ctx.beginPath();
      var kind = Math.random();
      if (kind < 0.35) {
        ctx.ellipse(rand(0, W), rand(0, H), rand(30, 110), rand(20, 70), rand(0, 3), 0, Math.PI * 2);
      } else if (kind < 0.6) {
        ctx.rect(rand(-40, W), rand(-40, H), rand(60, 200), rand(40, 140));
      } else {
        ctx.moveTo(rand(0, W), rand(0, H));
        ctx.lineTo(rand(0, W), rand(0, H));
        ctx.lineTo(rand(0, W), rand(0, H));
      }
      ctx.fill();
    }
    // The icons, magenta, somewhere they don't overlap.
    var placed = [];
    chosen.forEach(function (name) {
      var x, y, tries = 0;
      do {
        x = rand(SIZE, W - SIZE);
        y = rand(SIZE * 0.8, H - SIZE * 0.8);
        tries++;
      } while (tries < 200 && placed.some(function (p) { return Math.hypot(p.x - x, p.y - y) < SIZE * 1.6; }));
      placed.push({ name: name, x: x, y: y });
      ctx.filter = "blur(1px)";
      drawIcon(ctx, name, x, y, SIZE * rand(0.85, 1.1), pick(["#d23fd2", "#c93ad8", "#e04ad0"]), rand(-0.5, 0.5));
    });
    ctx.filter = "none";
    targets = placed.slice(0, 3);

    var s = strip.getContext("2d");
    s.clearRect(0, 0, strip.width, strip.height);
    targets.forEach(function (t, index) {
      drawIcon(s, t.name, 30 + index * 56, 27, 44, "#000", 0);
    });
    overlay.getContext("2d").clearRect(0, 0, W, H);
  }

  document.getElementById("image-wrap").addEventListener("click", function (event) {
    if (clicks.length >= 3) return;
    var box = image.getBoundingClientRect();
    var x = ((event.clientX - box.left) / box.width) * W;
    var y = ((event.clientY - box.top) / box.height) * H;
    clicks.push({ x: x, y: y });
    var o = overlay.getContext("2d");
    o.fillStyle = "rgba(0, 123, 255, 0.9)";
    o.beginPath(); o.arc(x, y, 18, 0, Math.PI * 2); o.fill();
    o.fillStyle = "#fff"; o.font = "bold 22px Helvetica, Arial, sans-serif";
    o.textAlign = "center"; o.textBaseline = "middle";
    o.fillText(String(clicks.length), x, y + 1);
    if (clicks.length < 3) return;
    var right = clicks.every(function (c, index) {
      return Math.hypot(c.x - targets[index].x, c.y - targets[index].y) < SIZE * 0.7;
    });
    setTimeout(function () {
      if (right) return passed();
      newIconChallenge();
      helpText.textContent = "Please try again. Select in this order:";
      helpText.style.color = "#b00020";
    }, 500);
  });

  iconModal.querySelector(".bf_close").addEventListener("click", function () { close(iconModal); });
  iconModal.querySelector(".bf_refresh").addEventListener("click", newIconChallenge);

  function startIcons() {
    if (widgetEl.classList.contains("passed")) return;
    checkbox.checked = false;
    newIconChallenge();
    open(iconModal);
  }
  checkbox.addEventListener("click", function (event) { event.preventDefault(); startIcons(); });
  document.querySelector(".botdeflector-label").addEventListener("click", startIcons);

  /* ---------------- the audio challenge ---------------- */
  var LETTERS = "ABCDEFGHJKLMNPRSTUVWXYZ";
  var answer = "";
  var playing = false, started = 0, timer = null, LENGTH = 17;
  var playButton = audioModal.querySelector(".bd-play");
  var input = document.getElementById("audio-answer-input");
  var submit = audioModal.querySelector(".submit-button");
  var error = document.getElementById("audio-input-error");

  function clock(seconds) {
    var s = Math.floor(seconds);
    return Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0");
  }
  function newAudioChallenge() {
    stopAudio();
    answer = "";
    var count = 4 + Math.floor(Math.random() * 3);
    for (var i = 0; i < count; i++) answer += pick(LETTERS.split(""));
    LENGTH = 5 + count * 2.5;
    document.getElementById("bd-length").textContent = clock(LENGTH);
    input.value = "";
    submit.disabled = true;
  }
  function stopAudio() {
    playing = false;
    clearInterval(timer);
    if (window.speechSynthesis) speechSynthesis.cancel();
    playButton.textContent = "▶";
    playButton.setAttribute("aria-label", "Play");
    document.getElementById("bd-now").textContent = "0:00";
    document.getElementById("bd-fill").style.width = "0";
  }
  function say(text, rate) {
    var line = new SpeechSynthesisUtterance(text);
    line.lang = "en-GB";
    line.rate = rate || 0.85;
    speechSynthesis.speak(line);
    return line;
  }
  function playAudio() {
    if (!window.speechSynthesis) {
      error.textContent = "This browser can't play the practice audio. The letters were: " + answer;
      return;
    }
    playing = true;
    playButton.textContent = "❚❚";
    playButton.setAttribute("aria-label", "Pause");
    started = Date.now();
    say("Type the letters you will hear in a moment.");
    var last;
    answer.split("").forEach(function (letter) {
      last = say("Type the letter... " + letter + ".", 0.8);
    });
    last.onend = function () { if (playing) stopAudio(); };
    timer = setInterval(function () {
      var at = Math.min(LENGTH, (Date.now() - started) / 1000);
      document.getElementById("bd-now").textContent = clock(at);
      document.getElementById("bd-fill").style.width = (at / LENGTH) * 100 + "%";
    }, 200);
  }
  playButton.addEventListener("click", function () { if (playing) stopAudio(); else playAudio(); });
  input.addEventListener("input", function () {
    error.textContent = "";
    submit.disabled = input.value.trim() === "";
  });
  submit.addEventListener("click", function () {
    if (input.value.replace(/\s/g, "").toUpperCase() === answer) return passed();
    newAudioChallenge();
    error.textContent = "Incorrect. Please listen to the new audio and try again.";
  });
  input.addEventListener("keydown", function (event) {
    if (event.key === "Enter" && !submit.disabled) submit.click();
  });
  audioModal.querySelector(".close-button").addEventListener("click", function () { close(audioModal); });
  audioModal.querySelector(".refresh-button").addEventListener("click", function () {
    error.textContent = "";
    newAudioChallenge();
  });
  document.querySelector(".botdeflector-headphone").addEventListener("click", function () {
    if (widgetEl.classList.contains("passed")) return;
    newAudioChallenge();
    error.textContent = "";
    open(audioModal);
  });

  document.addEventListener("keydown", function (event) {
    if (event.key !== "Escape") return;
    if (iconModal.style.display !== "none") close(iconModal);
    if (audioModal.style.display !== "none") close(audioModal);
  });
})();
`;
