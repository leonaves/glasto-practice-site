/**
 * A practice copy of the See Tickets Glastonbury flow, for rehearsing the sale
 * against something that looks and behaves like the real form.
 *
 * The measurements below are the real ones, read out of the site's own
 * stylesheets: `glastonbury.min.css` and `base.min.css` from a saved copy of the
 * 2023 deposits page, and `busypages/css/base.css` from their CDN. Class names
 * match too (`g-ui-box`, `g-button primary small`, `reg-header`,
 * `add-registration`), so this is the same furniture, not a lookalike.
 *
 * The festival's own wordmark is used deliberately, so the practice run
 * looks like the real thing on a screen recording. What keeps this a rehearsal
 * rather than a convincing fake is the banner fixed to the top of every page and
 * the fact that the card fields are inert — nothing here can take a payment.
 */

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/*
 * Real values from glastonbury.min.css / base.min.css, brought up to date in
 * September 2026 from the live /content/extras page: the ticket pages moved to
 * Be Vietnam Pro at weight 300, and their accent from teal to blue (#3969a9)
 * for headings and buttons, with 3px corners on buttons and 6px on the boxes.
 * Secondary buttons kept a teal label inside a blue border, which is theirs.
 * The queue pages are Queue-it's and did not change.
 */
const CHEVRON = "data:image/svg+xml;charset=utf-8;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZlcnNpb249IjEuMSIgeD0iMTBweCIgeT0iMTBweCIgdmlld0JveD0iMCAwIDExLjUgNi40Ij48cGF0aCBmaWxsPSIjMzMzIiBkPSJNMTEuMiAwLjJjMC4xIDAuMSAwLjIgMC4zIDAuMiAwLjUgMCAwLjItMC4xIDAuNC0wLjIgMC41bC01IDVDNi4xIDYuNCA1LjkgNi40IDUuNyA2LjRjLTAuMiAwLTAuNC0wLjEtMC41LTAuMmwtNS01QzAuMSAxLjEgMCAwLjkgMCAwLjdjMC0wLjIgMC4xLTAuNCAwLjItMC41QzAuNCAwLjEgMC41IDAgMC43IDBoMTBDMTAuOSAwIDExLjEgMC4xIDExLjIgMC4yeiIvPjwvc3ZnPg==";

const STYLES = `
  @font-face {
    font-family: leaguegothicregular;
    src: url("/fonts/leaguegothic-regular-webfont.woff") format("woff");
    font-weight: 400; font-style: normal; font-display: swap;
  }

  * { box-sizing: border-box; }

  body, li {
    font-family: "Be Vietnam Pro", "Helvetica Neue", Helvetica, Arial, sans-serif;
    font-weight: 300;
  }
  body { margin: 0; background: #7e7e7e; color: #232323; font-size: 15px; }
  li, p { color: #404040; font-size: 14px; line-height: 1.5; margin: 1em 0; }
  strong { font-weight: 700; }
  a { color: #0c9a9a; }

  h1 {
    font-family: leaguegothicregular, "Helvetica Neue", sans-serif;
    color: #3969a9;
    font-size: 2.5rem;
    line-height: 3.125rem;
    text-transform: uppercase;
    margin: 0;
  }
  h2 { line-height: normal; font-size: 16px; font-weight: 700; color: #3969a9; }

  /* The navy band the 2027 banner sits in, on every page (seen on the 2026
     hospitality sale): the wordmark on a transparent ground, full width on a
     phone and its own 600px on anything wider. */
  .header_block {
    background-color: #1a1449;
    width: 100%;
    padding: 22px 16px;
    text-align: center;
  }
  .header_block img { display: block; margin: 0 auto; width: 100%; max-width: 600px; height: auto; }

  /* The white band carrying the event title. The line under it is the site's
     blue, and bold, not the body's grey. */
  .event-title { background: #fff; padding: 26px 24px 30px; }
  .event-title h1 { font-size: 34px; line-height: 40px; }
  .event-title p { margin: 6px 0 0; font-weight: 600; font-size: 16px; line-height: 1.35; color: #3969a9; }

  main { max-width: 1000px; margin: 0 auto; padding: 26px 12px; }

  /* .g-ui-box — the white card everything sits in. */
  .g-ui-box {
    padding: 1.875rem 1.5625rem;
    background: #fff;
    margin-bottom: 1rem;
    border-radius: 6px;
    box-shadow: 0 0 10px rgba(0,0,0,.1);
  }

  /* The rainbow rule, redrawn rather than hotlinked. */
  hr.primary {
    border: 0; height: 13px; margin-bottom: 10px;
    background: repeating-linear-gradient(90deg,
      #e94b3c 0 25px, #f2a93b 25px 50px, #f2e14c 50px 75px,
      #43b04a 75px 100px, #4fa3d9 100px 125px, #e56ca6 125px 150px);
  }

  /* Rounded all round, so the blue edge on the left curves at its ends like a
     fingernail rather than running square. */
  .info-note {
    background-color: #eef3f8;
    border-left: 5px solid #4a90d9;
    border-radius: 8px;
    line-height: 1.6;
    overflow: hidden;
    padding: 16px 20px;
  }
  .info-note h3 { margin: 0 0 8px; font-size: 18px; font-weight: 400; color: #333; }

  /* Buttons: .g-button + .primary / .secondary / .small */
  .g-button {
    appearance: none; display: inline-block;
    padding: .78125rem .9375rem;
    border: 0 solid transparent; border-radius: 3px;
    color: #232323; background: #fff;
    font-family: "Be Vietnam Pro", "Helvetica Neue", Arial, sans-serif;
    font-size: .9375rem; line-height: 1.5625rem; font-weight: 400;
    cursor: pointer; text-decoration: none;
  }
  .g-button.primary { background: #3969a9; color: #fff; }
  .g-button.primary:hover { background: #33609b; }
  .g-button.primary:active { background: #2d558a; }
  .g-button.small { padding: .40625rem 1.25rem; }
  .g-button.large { font-size: 1.125rem; line-height: 1.4375rem; padding: 1.15625rem 1.25rem; }
  .g-button.secondary {
    background: #fff; border: 1px solid #3969a9; color: #0c9a9a;
    padding: .71875rem .875rem; margin: 0 .625rem .625rem 0;
  }

  /* The registration form proper. */
  h3.reg-header {
    border-bottom: 2px solid #d71837;
    margin: 1.25rem 0 0; padding: 3px 0;
    max-width: 568px; text-transform: uppercase;
    font-size: 15px; color: #404040; font-weight: lighter; text-align: left;
  }
  .add-registration { margin: 0 0 15px; padding: 10px 0; max-width: 568px; }
  .add-registration div.reg-divider {
    border-top: 1px solid #dcdcdc; height: 1px; margin: 10px auto; width: 97%;
  }
  .add-registration .guest-count {
    float: right; margin-right: 8px; font-size: 14px; color: #707070;
  }
  /* base.min.css gives every control this height; glastonbury.min.css then
     shrinks the ones on the registration pages (see .add-registration below).
     button,input get a 3px radius from the Glastonbury skin. */
  input[type=text], input[type=email], input[type=tel] {
    appearance: none;
    padding: .71875rem .625rem;
    border: 1px solid #bababa;
    border-radius: 3px;
    margin: 0;
    background: #f8f8f8;
    width: 100%;
    max-width: 18.75rem;
    font-family: "Be Vietnam Pro", "Helvetica Neue", Arial, sans-serif;
    font-size: .9375rem;
    line-height: 1.725rem;
    font-weight: 300;
  }
  select {
    appearance: none;
    padding: .71875rem 2.5rem .71875rem .71875rem;
    border: 1px solid #bababa; border-radius: 3px;
    background-color: #f8f8f8;
    background-image: url(${CHEVRON});
    background-position: center right .9375rem;
    background-repeat: no-repeat;
    background-size: 1rem auto;
    font-family: "Be Vietnam Pro", "Helvetica Neue", Arial, sans-serif; font-size: .9375rem; line-height: 1.725rem; font-weight: 300;
    width: 100%; max-width: 18.75rem;
  }
  /* glastonbury.min.css: .gfl-reg-details inputs — the registration and lookup
     pages sit between the site default and nothing, at 7px. */
  .add-registration input[type=text] {
    display: inline-block; margin-bottom: 10px; max-width: 18.75rem;
    padding: 7px; line-height: 1.6; font-size: 14px; font-weight: 400;
  }
  /* A fixed width, not the original min-width: in Be Vietnam Pro bold
     "Registration Number:" is wider than the 123px that fitted it in Helvetica,
     so a minimum let it push its own box out of line with the postcode's. The
     error's indent is label margin + width + gap, so it lines up with the boxes. */
  .add-registration label {
    margin-right: 15px; display: inline-block; font-size: 12px;
    width: 140px; margin-left: 9px; font-weight: 700;
  }
  .field-validation-error {
    color: red; display: block; font-size: 13px; margin: -5px 0 10px 164px; line-height: 1.5em;
  }

  /* The coach town picker sits on a registration page, so it matches those —
     centred, with a little more height than the form boxes above it. */
  .gfl-register select { padding: 7px 2.5rem 7px 7px; font-size: 14px; line-height: 1.4; }
  .town-picker { text-align: center; margin: 18px 0 4px; }
  .town-picker select {
    padding: 10px 2.5rem 10px 10px; font-size: 14px; line-height: 1.5;
    max-width: 18.75rem; text-align: left;
  }

  .lead-guest-header {
    font-size: 12px; text-transform: uppercase; letter-spacing: 1px;
    color: #3969a9; margin: 25px 0 0; font-weight: 600;
  }
  /* The coach heading sits between the registration boxes and the travel table,
     so it needs more room around it than the two above it. */
  .lead-guest-header.coach-heading { margin: 42px 0 18px; }

  .registered-user {
    border: 2px solid #cecece; border-radius: 3px;
    margin: 10px 10px 10px 0; overflow: hidden; padding: 10px;
    max-width: 320px;
  }
  .registered-user p { margin: .3em 0; }

  /* Checkout. */
  .gfl-checkout h2 { font-size: 16px; margin: 0 0 4px; }
  .gfl-checkout label { font-size: 12px; font-weight: 700; color: #6b6b6b; display: block; margin-bottom: 4px; }
  .gfl-checkout .form-field { margin-bottom: 14px; }
  .gfl-checkout .required { color: #e5285a; }

  /* Two columns: contact on the left, address on the right. */
  .yourdetails { display: grid; gap: 0 3rem; grid-template-columns: 1fr 1fr; }
  @media (max-width: 720px) { .yourdetails { grid-template-columns: 1fr; } }

  /* The order summary is a list with rules, not a table with a header. */
  .g-order-summary { margin: 0; }
  .g-order-summary-top { border-bottom: 1px solid #e6e6e6; padding: .8rem 0; margin: 0; }
  .g-order-summary-top-title {
    display: block; margin: 0 0 .3em; font-size: 1.125rem; line-height: 1.4375rem;
    font-weight: 400; color: #fa4f6e;
  }
  .g-order-summary-top .when { font-size: 12px; color: #404040; margin: 0; }
  .g-order-summary-item {
    border-bottom: 1px solid #e6e6e6; padding: .8rem 0; margin: 0;
    display: flex; justify-content: space-between; gap: 1rem;
  }
  .g-order-summary-item .lines { font-size: 14px; line-height: 1.45; }
  /* Names sit indented and italic under the line they belong to. */
  .g-order-summary-item .names { margin: 4px 0 0; padding-left: 26px; font-style: italic; color: #404040; }
  .g-order-summary-item .names div { line-height: 1.6; font-size: 14px; }
  .g-order-summary-item .lead-tag {
    font-style: italic; font-weight: 700; font-size: 11px; text-transform: uppercase;
    letter-spacing: .04em; margin-left: 10px;
  }
  .g-order-summary-total { text-align: right; padding: .9rem 0 .2rem; }
  .g-order-summary-total .label { font-size: 12px; color: #666; margin-right: 8px; }
  .g-order-summary-total .amount { font-size: 26px; font-weight: 400; }

  /* "Information", with the short blue rule under it. */
  .info-heading { font-size: 15px; font-weight: 700; color: #333; margin: 0 0 6px; }
  .info-heading:after {
    content: ""; display: block; width: 78px; height: 3px;
    background: #3969a9; margin-top: 12px;
  }

  /* The order reference under BOOKING COMPLETE. */
  .event-title p.order-reference {
    font-weight: 400; font-size: 22px; color: #4a4a4a; margin-top: 6px;
  }

  /* Stripe's card row: no box, just a rule under it. */
  .card-row {
    display: flex; align-items: center; gap: 14px;
    border-bottom: 1px solid #d9d9d9; max-width: 40rem;
    padding: 10px 0 12px; color: #b3b3b3; font-size: 15px;
  }
  .card-row .card-icon {
    width: 26px; height: 17px; border-radius: 2px; background: #e3e3e3; flex: 0 0 auto;
  }
  .card-row .grow { flex: 1 1 auto; }

  /* The agreements box: teal-outlined faux checkboxes. */
  .agreements .form-field { display: flex; gap: 14px; margin-bottom: 18px; }
  .g-faux-input {
    display: inline-block; height: 1.125rem; width: 1.125rem; margin-top: .125rem;
    border: 1px solid #0c9a9a; line-height: .875rem; flex: 0 0 auto; cursor: pointer;
  }
  .agreements input[type=checkbox] { display: none; }
  .agreements input[type=checkbox]:checked ~ .g-faux-input { background: #0c9a9a; }
  .agreements label { font-size: 13px; color: #7a7a7a; font-weight: 400; line-height: 1.5; }
  .agreements label a { color: #0c9a9a; font-weight: 700; text-decoration: underline; }
  .agreements .note { font-size: 13px; color: #7a7a7a; }
  .agreements .bullets { font-size: 13px; color: #7a7a7a; padding-left: 18px; }
  .agreements .bullets li { list-style: disc; margin: .4em 0; color: #7a7a7a; font-size: 13px; }

  table.g-table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 14px; }
  table.g-table thead th { background: #4fb3d9; color: #fff; text-align: left; padding: 8px; font-size: 14px; }
  table.g-table td { padding: 8px; border-bottom: 1px solid #dcdcdc; }

  /* The "tickets held for" widget, bottom right. */
  .page-countdown {
    text-align: center; font-weight: bold; z-index: 99999; position: fixed;
    right: 3%; bottom: 5%; width: 120px; background-color: #f5f5f5;
    border: 1px solid #ccc; padding: 5px;
  }
  .page-countdown p { font-size: 12px; color: #555; margin: 0; }
  .page-countdown .timer { font-size: 30px; color: #df405e; }

  /* ------------------------------------------------------------------
     Queue pages. Queue-it's waiting room, not See Tickets — no event
     header, no teal, none of the festival chrome until you are through it.

     Measured from a capture of the real thing taken 8 Sep 2026
     (glastonbury.seetickets.com/queue/view, event 20260908glasto247). Two
     stylesheets are in play there and both matter: Queue-it's own
     style_*.css sets the structure, and glastonbury-queue.css overrides
     it for this customer. Where they disagree the Glastonbury one wins, and
     several of the values below only make sense as the pair — the progress
     bar's 5px border is the same colour as its track, so it reads as an
     inset rather than a border at all.
     ------------------------------------------------------------------ */
  body.queue {
    background: #e2e2e3;
    font-family: Roboto, Helvetica, Arial, sans-serif;
    font-size: 12px;
    color: #4D4D4D;
  }
  /* #main in the real markup. 550px and 15px/25px are the Glastonbury
     override; Queue-it's own default is a narrower 514px with a background
     image, which is switched off there and here. No shadow. */
  .queue-panel {
    background: #fff; max-width: 550px; margin: 15px auto 0; padding: 15px 25px;
    box-sizing: border-box; border-radius: .3em;
  }
  /* The plate is the container, not padding around the image: the banner
     fills it edge to edge and the navy only shows through the PNG's own
     transparency. */
  .queue-plate { background: #1a1449; border-radius: .3rem; }
  .queue-plate { padding: 14px 18px; }
  .queue-plate img { display: block; width: 100%; max-width: 600px; height: auto; margin: 0 auto; }
  /* Roboto, not the festival display face — the waiting room is Queue-it's
     furniture and none of See Tickets' type reaches it. Stated explicitly
     because the global h1 rule sets leaguegothic. */
  .queue-panel h1 {
    font-family: Roboto, Helvetica, Arial, sans-serif;
    color: #4D4D4D; font-size: 20px; font-weight: 500; line-height: normal;
    text-transform: none; margin: 20px 0 15px;
  }
  /* Named again here because the ticket pages set Be Vietnam Pro on every li,
     and the waiting room is Queue-it's page, in Queue-it's Roboto. */
  .queue-panel p, .queue-panel li {
    color: #4D4D4D; font-size: 15px; font-family: Roboto, Helvetica, Arial, sans-serif; font-weight: 400;
  }
  .queue-panel ul { padding-left: 22px; margin: 0; }
  .queue-panel li { list-style: disc; margin-bottom: 15px; }
  .queue-panel a { color: #4D4D4D; }

  /* Left-aligned, no background, no border — all of Queue-it's box styling
     is turned off for Glastonbury. */
  .warning-box { padding: 10px 0; font-size: 15px; text-align: left; }
  .warning-box p { margin: 0; }

  /* The pre-sale countdown. Coral (#fb7c52 off a real screenshot; the capture uses the coral keyword), big and centred. Dropped when the queue page
     was rebuilt, which left it rendering in the body's dark grey. */
  .queue-panel p.countdown, .countdown {
    color: #fb7c52;
    font-size: 38px;
    line-height: 1.25; font-weight: 700;
    text-align: center; margin: 28px 0; white-space: nowrap;
  }
  @media (max-width: 560px) {
    .queue-panel p.countdown, .countdown { font-size: 27px; }
  }

  /* 22px tall with a 5px border in the track's own colour. The fill is
     #19be81 and carries a tiled texture on the real site; that PNG lives on
     Queue-it's CDN and did not come down with the capture, so this is flat.
     min-width keeps a sliver visible at 0%. */
  .progress-bar-container {
    background: #4D4D4D; border: 5px solid #4D4D4D; border-radius: 0;
    height: 22px; box-sizing: content-box; margin: 0;
  }
  .progress-bar {
    display: block; height: 100%; min-width: 20px;
    background-color: #19be81;
    /* Thin track-coloured gaps every 12px, so the fill reads as segments rather
       than one solid block — the real bar carries a tiled texture, and this is
       the same fake the page used before the rebuild flattened it. */
    background-image: repeating-linear-gradient(90deg, transparent 0 12px, #4D4D4D 12px 14px);
    transition: width .9s ease-in-out;
  }


  /* The dot and the status text on one line, centred on each other. The dot
     is a 21px sprite on the real site; here it pulses green while the status
     is live, which is the thing to glance at to know the page is still going. */
  .queue-panel p.queue-status {
    display: flex; align-items: center; gap: 6px;
    font-style: italic; font-size: 13px; line-height: 1; margin: 6px 0 0;
  }
  .queue-dot {
    flex: none; width: 21px; height: 21px; margin-left: -4px; border-radius: 50%;
    background: radial-gradient(circle at 38% 32%, #b8f5d7 0 22%, #19be81 58%, #10915f 100%);
    box-shadow: inset 0 0 0 1px rgba(0,0,0,.10);
    animation: queue-pulse 1s ease-in-out infinite;
  }
  @keyframes queue-pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: .35; }
  }
  @media (prefers-reduced-motion: reduce) { .queue-dot { animation: none; } }

  /* Queue ID at the bottom left of the box, under the status line, with its
     label a shade darker than the id itself (an inline style on the real
     page, not a class). */
  .queue-footer { font-size: 12px; color: #8a8b8f; text-align: left; margin-top: 8px; word-break: break-all; }
  .queue-footer .label { color: #595959; }

  .skip-hint { text-align: center; margin: 14px 0 28px; font-size: 12px; }
  .skip-hint a { color: #9a9a9e; text-decoration: none; }
  .skip-hint a:hover { color: #6e6e72; text-decoration: underline; }

  /* ------------------------------------------------------------------
     Coach departure day. Two teal slabs, side by side on a desktop and
     stacked on a phone, on the textured near-white ground. #57989a and
     #ededee are sampled off a screenshot of the real page.
     ------------------------------------------------------------------ */
  body.coach-choice { background: #ededee; }
  body.coach-choice main { max-width: 860px; }
  .coach-day__heading { font-size: 2.5rem; margin-bottom: 1rem; }
  .coach-day__grid { display: grid; gap: 18px; grid-template-columns: 1fr 1fr; margin-top: 20px; }
  @media (max-width: 700px) { .coach-day__grid { grid-template-columns: 1fr; } }
  .coach-day {
    display: block; background: #57989a; color: #fff; text-decoration: none;
    padding: 34px 22px; text-align: center; text-transform: uppercase;
    font-size: 20px; line-height: 1.35;
  }
  .coach-day:hover { background: #4a8688; }
  .coach-day span { display: block; }
  .coach-day strong { display: block; font-weight: 400; }

  /* The coach list a town reveals — base.min.css's .price-list: grey cells with
     10px of white between the rows, and a header that keeps no background. */
  .price-list { width: 100%; margin: 0 0 1.25rem; border-collapse: collapse; }
  .price-list td, .price-list th { padding: .625rem .9375rem; text-align: left; }
  .price-list th, .price-list tr td { background: #f4f4f4; border-top: .625rem solid #fff; }
  .price-list .t-head th {
    font-weight: 400; font-size: 1.125rem; line-height: 1.4375rem; background: none;
  }
  .price-list .quantity { font-weight: 300; text-align: right; }
  .price-list .note.quantity, .price-list .t-head .quantity { text-align: left; }
  .price-list .fees { font-size: .775rem; }
  .price-list td { font-size: 14px; }
  .ticket-value { white-space: nowrap; }
  .price-list select.qty-sel {
    min-width: 5rem; width: auto; padding: 5px 2rem 5px 7px; font-size: 14px;
  }
  .price-list .note { color: #404040; }
  .sr-only { position: absolute; left: -10000px; top: auto; width: 1px; height: 1px; overflow: hidden; }

  /* The practice chooser — ours, not theirs. */
  .chooser { max-width: 660px; margin: 30px auto; }
  .chooser h1 { color: #3969a9; font-size: 2.5rem; }
  .chooser h2 { color: #404040; }
  .chooser__lead { color: #404040; }
  /* Faintly filled so each choice reads as a button against the white box. */
  .chooser__option {
    display: flex; align-items: center; justify-content: space-between; gap: 1rem;
    border: 1px solid #dcdcdc; border-radius: 3px; padding: 14px 16px; margin-bottom: 10px;
    text-decoration: none; color: inherit; background: #fafafa;
  }
  .chooser__option:hover { border-color: #0c9a9a; background: #fff; }
  .chooser__option strong { display: block; font-size: 15px; color: #333; }
  .chooser__option span { font-size: 13px; color: #707070; }

  /* Ours, not theirs. */
  .practice-bar {
    position: sticky; top: 0; z-index: 100000;
    background: repeating-linear-gradient(45deg, #ffd400 0 12px, #1a1a1a 12px 24px);
    padding: 3px;
  }
  .practice-bar__inner {
    background: #1a1a1a; color: #ffd400; text-align: center;
    padding: 6px 10px; font-weight: bold; letter-spacing: .05em; font-size: 12px;
    font-family: Arial, sans-serif;
  }
  .practice-bar a { color: #fff; margin-left: 10px; font-weight: normal; }
  /* Hidden for presenting: see practiceBar. The skip hint stays. */
  html.practice-bar-hidden .practice-bar { display: none; }
  .inert { background: #eee !important; color: #999; }
`;

/**
 * The practice site says which sale it is emulating, in two meta tags, so a
 * tool helping someone rehearse knows which sale this run is without guessing
 * from the form.
 */
function saleMeta(sale?: { coach: boolean; slots: number }): string {
  if (!sale) return "";
  return `<meta name="glasto-sale-type" content="${sale.coach ? "coach" : "general"}">
<meta name="glasto-group-size" content="${sale.slots}">`;
}

function head(title: string, sale?: { coach: boolean; slots: number }): string {
  return `${saleMeta(sale)}
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<script>try { if (localStorage.getItem("practice-bar-hidden") === "1") document.documentElement.classList.add("practice-bar-hidden"); } catch {}</script>
<title>${escapeHtml(title)} — PRACTICE</title>
<link rel="icon" href="/favicon.ico">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<!-- The real queue page imports Roboto 500,400,300 with 300/400 italics:
     500 carries its heading and 400 italic the status line. The ticket pages
     are Be Vietnam Pro now, at the weights the live site loads. -->
<link href="https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,300;0,400;0,500;0,700;1,300;1,400&family=Be+Vietnam+Pro:wght@300;400;500;700&display=swap" rel="stylesheet">
<style>${STYLES}</style>`;
}

/**
 * The banner, and a hidden way to take it away for a presentation: Ctrl-H
 * twice, quickly, toggles it. The same listener takes Ctrl-C twice to jump
 * to the coach sale's waiting room. Remembered in this browser, so every page after
 * stays clean until it is toggled back; `head` re-applies it before the page
 * draws, so a reload never flashes the banner. Ctrl rather than Cmd, and
 * nothing on the page mentions it.
 */
function practiceBar(note?: string): string {
  return `<div class="practice-bar"><div class="practice-bar__inner">
  PRACTICE COPY — NOT THE REAL TICKET SITE. NO TICKETS, NO PAYMENTS.
  ${note ? `<span style="font-weight:normal">${escapeHtml(note)}</span>` : ""}
  <a href="/reset">start again</a>
</div></div>
<script>
  (() => {
    // Ctrl-H twice: the banner. Ctrl-C twice: straight to the coach sale's
    // security check and waiting room, as a fresh run, from wherever you are.
    const last = {};
    const actions = {
      h: () => {
        const hidden = document.documentElement.classList.toggle("practice-bar-hidden");
        try { localStorage.setItem("practice-bar-hidden", hidden ? "1" : "0"); } catch {}
      },
      c: () => { location.href = "/challenge?slots=6&coach=1"; },
    };
    document.addEventListener("keydown", (event) => {
      const key = event.key.toLowerCase();
      if (!event.ctrlKey || event.metaKey || event.altKey || !actions[key]) return;
      event.preventDefault();
      const now = performance.now();
      if (now - (last[key] || 0) > 450) { last[key] = now; return; }
      last[key] = 0;
      actions[key]();
    });
  })();
</script>`;
}

/**
 * The waiting room is Queue-it's, not See Tickets' — a grey page with a single
 * white panel and the wide wordmark on a navy plate. None of the event chrome
 * appears until you are through it.
 *
 * The status line and the queue id are both real, and both easy to mistake for
 * decoration. The disc is a 21px sprite on the real page; here it pulses green
 * while the status is live. The id sits at the bottom left of the panel with
 * its label a shade darker than the value.
 */
export function queueShell({
  title,
  body,
  practiceNote,
  statusTime,
  sale,
  queued = false,
  skipTo,
}: {
  title: string;
  body: string;
  practiceNote?: string;
  statusTime: string;
  sale?: { coach: boolean; slots: number };
  /** In the queue proper, not the pre-sale countdown. The queue id and the
   *  "status last updated" line belong to an active queue: before the sale
   *  opens there is no queue to have an id or a status. */
  queued?: boolean;
  /**
   * Where the practice run goes next, for not sitting through the wait. Offered
   * as a line of small print under the box and the S key, rather than a button
   * in it: the real page has no such button, and the practice one should look
   * as much like it as possible. The line is a link too, since a phone has no
   * S key to press.
   */
  skipTo?: string;
}): Response {
  const queueId = crypto.randomUUID();

  const html = `<!doctype html>
<html lang="en-GB">
<head>${head(title, sale)}</head>
<body class="queue">
${practiceBar(practiceNote)}
<div class="queue-panel">
  <div class="queue-plate">
    <img src="/glastonbury-banner-2027.png" alt="Glastonbury Festival" width="600" height="209">
  </div>
  ${body}
  ${queued ? `<p class="queue-status"><span class="queue-dot"></span>Status last updated:
    <span id="status-time">${escapeHtml(statusTime)}</span></p>
  <div class="queue-footer"><span class="label">Queue ID: </span>${queueId}</div>` : ""}
</div>
${skipTo ? `<p class="skip-hint"><a href="${skipTo}">(press S to skip to the next page)</a></p>
<script>
  document.addEventListener("keydown", (event) => {
    if (event.key !== "s" && event.key !== "S") return;
    if (event.metaKey || event.ctrlKey || event.altKey) return;
    if (event.target.closest && event.target.closest("input, textarea, select")) return;
    location.href = ${JSON.stringify(skipTo)};
  });
</script>` : ""}
${queued ? `<script>
  setInterval(() => {
    const now = new Date();
    document.getElementById("status-time").textContent =
      [now.getHours(), now.getMinutes(), now.getSeconds()]
        .map((part) => String(part).padStart(2, "0")).join(":");
  }, 1000);
</script>` : ""}
</body>
</html>`;

  return new Response(html, { headers: { "Content-Type": "text/html; charset=utf-8" } });
}

export function page({
  title,
  heading,
  subheading,
  orderReference,
  bodyClass,
  sale,
  body,
  practiceNote,
}: {
  title: string;
  heading?: string;
  subheading?: string;
  /** Shown under the heading on the completed booking, in place of the dates. */
  orderReference?: string;
  /** Extra class on <body>, for pages with their own ground. */
  bodyClass?: string;
  /** Declared in a meta tag; see saleMeta. */
  sale?: { coach: boolean; slots: number };
  body: string;
  practiceNote?: string;
}): Response {
  const html = `<!doctype html>
<html lang="en-GB">
<head>${head(title, sale)}</head>
<body class="l-layout${bodyClass ? ` ${bodyClass}` : ""}">
${practiceBar(practiceNote)}

<div class="header_block">
  <img src="/glastonbury-banner-2027.png" alt="Glastonbury Festival" width="600" height="209">
</div>

${
  heading
    ? `<div class="event-title"><h1>${escapeHtml(heading)}</h1>${
        subheading ? `<p>${escapeHtml(subheading)}</p>` : ""
      }${
        orderReference
          ? `<p class="order-reference">Order Reference: ${escapeHtml(orderReference)}</p>`
          : ""
      }</div>`
    : ""
}

<main class="l-content">${body}</main>
</body>
</html>`;

  return new Response(html, { headers: { "Content-Type": "text/html; charset=utf-8" } });
}
