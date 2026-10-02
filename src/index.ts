import { page } from "./layout";
import { registrationPage } from "./pages/registration";
import {
  checkoutPage,
  chooserPage,
  completePage,
  confirmPage,
  holdingPage,
  queuePage,
} from "./pages/flow";
import { coachDayPage, readCoachSelection } from "./pages/coach";
import { challengePage } from "./pages/challenge";
import { lookupPage, lookupResult } from "./pages/lookup";
import {
  checkRegistration,
  clearedCookie,
  DEFAULT_STATE,
  nameFor,
  readState,
  stateCookie,
  type MockState,
  type Registration,
} from "./state";

function withCookie(response: Response, cookie: string): Response {
  const headers = new Headers(response.headers);
  headers.append("Set-Cookie", cookie);
  return new Response(response.body, { status: response.status, headers });
}

function redirect(to: string, cookie?: string): Response {
  const headers = new Headers({ Location: to });
  if (cookie) headers.append("Set-Cookie", cookie);
  return new Response(null, { status: 302, headers });
}

/**
 * `?slots=4&coach=1` sets up a resale rehearsal without touching any config.
 *
 * Picking a sale starts a new run, so everything the last run chose goes: the
 * cookie lasts a day, and a general-sale run that kept the previous coach run's
 * coach ticket put it in the basket.
 */
function applyScenario(url: URL, state: MockState): MockState {
  const slots = Number(url.searchParams.get("slots"));
  const coach = url.searchParams.get("coach");
  if (!url.searchParams.has("slots") && coach === null) return state;
  return {
    ...DEFAULT_STATE,
    slots: [2, 4, 6].includes(slots) ? slots : state.slots,
    coach: coach === null ? state.coach : coach === "1",
  };
}

/**
 * The guide videos, without a sign-in, for sharing a link with anyone. Only
 * the `tips/` prefix and only video and image types, so nothing
 * else that lands in the bucket becomes public by accident.
 */
async function publicVideo(request: Request, env: Env, name: string): Promise<Response> {
  // Dots are allowed inside the name — `basics.en.vtt` has two — but never a
  // `..`, so the key cannot be steered outside the `tips/` prefix.
  if (name.includes("..") || !/^[\w.-]+\.(mp4|webm|jpg|jpeg|png|webp|vtt)$/.test(name)) {
    return new Response("Not found", { status: 404 });
  }
  const range = /^bytes=(\d+)-(\d*)$/.exec(request.headers.get("Range") ?? "");
  // Conditional headers are honoured only on a whole-file request. A browser
  // revisiting a page it has cached sends `If-None-Match` alongside its byte
  // ranges, and answering that with a 304 where a 206 was expected stops mobile
  // Safari dead with no error of any kind.
  const object = await env.MEDIA.get(`tips/${name}`, {
    range: range
      ? range[2] === ""
        ? { offset: Number(range[1]) }
        : { offset: Number(range[1]), length: Number(range[2]) - Number(range[1]) + 1 }
      : undefined,
    onlyIf: range ? undefined : request.headers,
  });
  if (!object) return new Response("Not found", { status: 404 });

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set("ETag", object.httpEtag);
  headers.set("Accept-Ranges", "bytes");
  headers.set("Cache-Control", "public, max-age=3600");
  if (!("body" in object) || !object.body) return new Response(null, { status: 304, headers });

  if (range && object.range && "offset" in object.range) {
    const offset = object.range.offset ?? 0;
    const length = object.range.length ?? object.size - offset;
    headers.set("Content-Range", `bytes ${offset}-${offset + length - 1}/${object.size}`);
    headers.set("Content-Length", String(length));
    return new Response(object.body, { status: 206, headers });
  }
  headers.set("Content-Length", String(object.size));
  return new Response(object.body, { status: 200, headers });
}

function videoTestPage(): Response {
  // Round two. A, C and D played and B did not, so the subtitle track is the
  // thing that stops it. These narrow down which part of having a track is the
  // problem: the CORS attribute Safari has historically wanted, the contents of
  // the file, or simply having a track in the markup before playback starts.
  const VIDEO = "/video/glastonbury-basics.mp4";
  const players = [
    ["B", "track in the markup — the one that failed last time", VIDEO, "/video/glastonbury-basics.en.vtt", ""],
    ["E", "same, plus crossorigin=anonymous on the video", VIDEO, "/video/glastonbury-basics.en.vtt", "anonymous"],
    ["F", "track in the markup, but a two-line subtitle file", VIDEO, "/video/tiny.en.vtt", ""],
    ["G", "no track in the markup; added by script once it is playing", VIDEO, "", ""],
  ] as const;

  const blocks = players
    .map(
      ([id, label, src, vtt, cors]) => `
    <section>
      <h2>${id} &middot; ${label}</h2>
      <video id="v${id}" controls playsinline preload="metadata"${cors ? ` crossorigin="${cors}"` : ""}>
        <source src="${src}" type="video/mp4">
        ${vtt ? `<track kind="captions" label="English" srclang="en" src="${vtt}">` : ""}
      </video>
      <pre id="log${id}">not touched yet</pre>
    </section>`,
    )
    .join("");

  const body = `<!doctype html>
<html lang="en-GB"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Video test</title>
<style>
  body{font:15px/1.5 -apple-system,system-ui,sans-serif;margin:0;padding:16px;background:#111;color:#eee}
  h1{font-size:19px} h2{font-size:15px;font-weight:600;margin:0 0 6px}
  section{margin:0 0 26px;padding:0 0 18px;border-bottom:1px solid #333}
  video{width:100%;background:#000;border-radius:4px}
  pre{white-space:pre-wrap;word-break:break-word;background:#1c1c1c;padding:8px;border-radius:4px;
      font:12px/1.5 ui-monospace,monospace;margin:8px 0 0;color:#9fd}
  pre.bad{color:#f99}
  p{color:#aaa;font-size:13px}
</style></head><body>
<h1>Round two: which of these plays?</h1>
<p>Last time A, C and D played and B did not, so it is the subtitle track. Each of
these differs from B by one thing. Tap play on each. Nothing here needs signing in.</p>
${blocks}
<script>
  var ids = ${JSON.stringify(players.map((p) => p[0]))};
  ids.forEach(function (id) {
    var v = document.getElementById("v" + id);
    var log = document.getElementById("log" + id);
    function say(what) {
      var e = v.error;
      var bits = [
        what,
        "size " + v.videoWidth + "x" + v.videoHeight,
        "readyState " + v.readyState,
        "network " + v.networkState,
        "t " + v.currentTime.toFixed(1),
        "tracks " + v.textTracks.length,
      ];
      if (v.textTracks.length) bits.push("trackMode " + v.textTracks[0].mode);
      if (e) bits.push("ERROR code " + e.code + " " + (e.message || "(no message)"));
      log.className = e ? "bad" : "";
      log.textContent = bits.join("  |  ");
    }
    if (id === "G") {
      v.addEventListener("playing", function once() {
        v.removeEventListener("playing", once);
        var t = document.createElement("track");
        t.kind = "captions"; t.label = "English"; t.srclang = "en";
        t.src = "/video/glastonbury-basics.en.vtt";
        t.addEventListener("error", function () { say("the added track failed to load"); });
        v.appendChild(t);
        say("track added while playing");
      });
    }
    ["loadedmetadata", "canplay", "playing", "waiting", "stalled", "error", "abort", "emptied"].forEach(
      function (type) { v.addEventListener(type, function () { say(type); }); }
    );
    v.addEventListener("timeupdate", function () { if (v.currentTime > 0.4) say("playing fine"); });
    say("ready to try");
  });
</script>
</body></html>`;

  return new Response(body, { headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" } });
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    const video = /^\/video\/([^/]+)$/.exec(url.pathname);
    if (video) return publicVideo(request, env, video[1]);

    // On the live site a sign-in sits here, in front of
    // everything below (the videos above stay open, being the copies for
    // sharing). It isn't published; see the README. It decides who gets in, and
    // never sees anything typed into the pages that follow.

    // A scratch page for working out why a video will not play on a particular
    // device. Each player differs from the next by exactly one thing, and each
    // reports its own state, so one visit on the troublesome phone says which
    // variable is the problem. Delete once that question is settled.
    if (url.pathname === "/videotest") return videoTestPage();

    const state = applyScenario(url, readState(request));

    if (url.pathname === "/reset") {
      return redirect("/", clearedCookie());
    }

    // Round again on the same sale, straight to an empty registration form:
    // everything this run entered goes, the sale and its departure day stay.
    // Reached by the hidden Ctrl-B Ctrl-B on the complete page.
    if (url.pathname === "/again") {
      const next: MockState = {
        ...DEFAULT_STATE,
        slots: state.slots,
        coach: state.coach,
        coachDay: state.coachDay,
      };
      return redirect("/registration", stateCookie(next));
    }

    // The run starts by choosing which sale to emulate.
    if (url.pathname === "/" && request.method === "GET") {
      return withCookie(chooserPage(), stateCookie(state));
    }

    // Queue-it's security check, before the waiting room's countdown.
    if (url.pathname === "/challenge") {
      return withCookie(challengePage(state), stateCookie(state));
    }

    if (url.pathname === "/queue") {
      const seconds = Number(url.searchParams.get("seconds")) || 17;
      return withCookie(queuePage(state, seconds), stateCookie(state));
    }

    // The registration lookup, which is a separate thing from the sale flow.
    if (url.pathname === "/registration/lookup") {
      if (request.method === "GET") return withCookie(lookupPage(), stateCookie(state));

      const form = await request.formData().catch(() => new FormData());
      return withCookie(
        lookupResult(String(form.get("RegistrationId") ?? ""), String(form.get("PostCode") ?? "")),
        stateCookie(state),
      );
    }

    if (url.pathname === "/holding") {
      return withCookie(holdingPage(state), stateCookie(state));
    }

    // On the coach sale you pick a departure day before you reach the form.
    if (url.pathname === "/coach-day") {
      return withCookie(coachDayPage(state), stateCookie(state));
    }

    if (url.pathname === "/registration") {
      if (request.method === "GET") {
        const day = url.searchParams.get("day");
        const next: MockState =
          day === "wed" || day === "thu" ? { ...state, coachDay: day } : state;
        return withCookie(registrationPage(next), stateCookie(next));
      }

      const form = await request.formData();
      const errors: Record<number, string> = {};
      const values: Record<string, string> = {};
      const registrations: Registration[] = [];

      for (let index = 0; index < state.slots; index++) {
        const registrationNumber = String(form.get(`registrations[${index}].RegistrationId`) ?? "").trim();
        const postcode = String(form.get(`registrations[${index}].PostCode`) ?? "")
          .trim()
          .toUpperCase();

        values[`registrations[${index}].RegistrationId`] = registrationNumber;
        values[`registrations[${index}].PostCode`] = postcode;

        // A blank row is fine — you need not fill all six.
        if (registrationNumber === "" && postcode === "") continue;

        const problem = checkRegistration(registrationNumber, postcode);
        if (problem) errors[index] = problem;
        else registrations.push({ registrationNumber, postcode, name: nameFor(registrationNumber) });
      }

      if (registrations.length === 0 && Object.keys(errors).length === 0) {
        errors[0] = "Please enter at least the lead booker's registration.";
      }

      if (Object.keys(errors).length > 0) {
        return withCookie(registrationPage(state, errors, values), stateCookie(state));
      }

      return redirect("/confirm", stateCookie({ ...state, registrations }));
    }

    if (url.pathname === "/confirm") {
      if (request.method === "GET") {
        return withCookie(confirmPage(state), stateCookie(state));
      }

      // The coach block lives at the foot of this page, so it is validated here.
      if (!state.coach) return redirect("/checkout", stateCookie(state));

      // A submit with no body at all should read as "nothing chosen", not a crash.
      const form = await request.formData().catch(() => new FormData());
      const selection = readCoachSelection(form, state);
      if ("error" in selection) {
        return withCookie(confirmPage(state, selection.error), stateCookie(state));
      }

      const next = { ...state, town: selection.town, coachTicket: selection.ticket };
      return redirect("/checkout", stateCookie(next));
    }

    if (url.pathname === "/checkout") {
      return withCookie(checkoutPage(state), stateCookie(state));
    }

    if (url.pathname === "/complete") {
      // Nine digits, the way See Tickets prints them.
      const reference =
        state.reference ??
        String(
          100000000 +
            ([...state.registrations.map((r) => r.registrationNumber).join("")].reduce(
              (hash, character) => (hash * 31 + character.charCodeAt(0)) >>> 0,
              7,
            ) %
              899999999),
        );
      const next = { ...state, reference };
      return withCookie(completePage(next), stateCookie(next));
    }

    const notFound = page({
      title: "Not found",
      body: `<div class="g-ui-box"><p>No such page in the practice site.</p>
             <p><a href="/">Start the practice run</a></p></div>`,
    });
    return withCookie(
      new Response(notFound.body, { status: 404, headers: notFound.headers }),
      stateCookie(state),
    );
  },
} satisfies ExportedHandler<Env>;
