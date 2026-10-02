import { escapeHtml, page, queueShell } from "../layout";
import { addressFor, emailFor, telephoneFor, type MockState } from "../state";
import { coachSection } from "./coach";
import { DEPOSIT, orderSummary, responsibilityNote } from "./parts";

function nowTime(): string {
  const now = new Date();
  return [now.getHours(), now.getMinutes(), now.getSeconds()]
    .map((part) => String(part).padStart(2, "0"))
    .join(":");
}

/**
 * The practice run starts by picking which sale to emulate, because the coach and
 * general sales differ in ways that matter: how many people you can put in one
 * transaction, and whether you have to choose a departure town before paying.
 */
export function chooserPage(): Response {
  const option = (
    href: string,
    title: string,
    detail: string,
  ) => `<a class="chooser__option" href="${href}"><span><strong>${title}</strong>
    <span>${detail}</span></span><span class="g-button primary small">Start</span></a>`;

  const body = `
    <div class="chooser">
      <div class="g-ui-box">
        <h1>Practice run</h1>
        <p class="chooser__lead">Pick the sale you want to rehearse. Everything after this looks and
        behaves like the real thing — the queue, the form, the errors — but no tickets exist and no
        payment can be taken.</p>

        <h2 style="margin-top:26px">Main sale — November</h2>
        ${option("/challenge?slots=6&coach=0", "General Sale", "Six per transaction. Sunday morning.")}
        ${option("/challenge?slots=6&coach=1", "Ticket + Coach Sale", "Six per transaction, and you pick a departure town before paying. Thursday evening.")}

        <h2 style="margin-top:26px">April resales</h2>
        ${option("/challenge?slots=4&coach=0", "General Admission Resale", "Four per transaction.")}
        ${option("/challenge?slots=2&coach=1", "Coach Resale", "Two per transaction, limited by coach seats.")}

        <p style="margin-top:26px;font-size:13px;color:#707070">
          A registration number starting <strong>99</strong> does not exist, and one starting
          <strong>98</strong> already has a ticket, so you can rehearse both failures.
          <a href="/reset">Start again</a> at any point.
        </p>
      </div>
    </div>`;

  return page({ title: "Practice run", body, practiceNote: "choose a sale" });
}

/**
 * What the queue calls the sale you are rehearsing, and when it opens. These
 * used to be the coach sale's for every run, so a general-sale rehearsal sat
 * in a queue for the Ticket and Coach Option sale.
 */
function saleCopy(state: MockState): { name: string; opens: string } {
  const resale = state.slots < 6;
  if (state.coach) {
    return resale
      ? { name: "Glastonbury 2027 Coach Resale", opens: "18:00 (15/04/2027)" }
      : { name: "Glastonbury 2027 Ticket and Coach Option sale", opens: "18:00 (05/11/2026)" };
  }
  return resale
    ? { name: "Glastonbury 2027 General Admission Resale", opens: "09:00 (18/04/2027)" }
    : { name: "Glastonbury 2027 General Ticket sale", opens: "09:00 (08/11/2026)" };
}

export function queuePage(state: MockState, seconds: number) {
  const sale = saleCopy(state);
  const body = `
    <p>The ${sale.name} has not yet begun. When it begins, you will
    be assigned a random place in the queue. There is no need to manually refresh this page.</p>
    <p><a href="#"><u>What is this?</u></a></p>
    <p>The event will begin at: ${sale.opens}</p>
    <p class="countdown" id="countdown">${String(Math.floor(seconds / 60)).padStart(2, "0")} Minutes ${String(seconds % 60).padStart(2, "0")} Seconds</p>
    <script>
      let left = ${seconds};
      const el = document.getElementById("countdown");
      setInterval(() => {
        left = Math.max(0, left - 1);
        el.textContent =
          String(Math.floor(left / 60)).padStart(2, "0") + " Minutes " +
          String(left % 60).padStart(2, "0") + " Seconds";
        if (left === 0) location.href = "/holding";
      }, 1000);
    </script>`;

  return queueShell({
    title: "Queue",
    body,
    practiceNote: "waiting room",
    statusTime: nowTime(),
    sale: { coach: state.coach, slots: state.slots },
    skipTo: "/holding",
  });
}

export function holdingPage(state: MockState) {
  const body = `
    <h1>You are now in the queue!</h1>
    <p>You are in the queue for the ${saleCopy(state).name}.</p>
    <ul>
      <li>Please do <strong><u>not</u></strong> refresh this page or use multiple devices or tabs
      as you may lose your place in the queue.</li>
      <li>When it is your turn, you will have 10 minutes to enter the ticket booking site. You will
      then be asked to enter the registration number and registered postcode for the lead booker and
      up to ${state.slots - 1} other ${state.slots === 2 ? "person" : "people"} for whom you are attempting to book tickets.</li>
      <li>Tickets are not allocated until your payment has been processed.</li>
    </ul>
    <div class="warning-box">
      <p>The event will begin at: <span id="event-start"></span></p>
      <div class="progress-bar-container"><span class="progress-bar" id="bar" style="width:6%"></span></div>
    </div>
    <script>
      // The real queue sits on a couple of segments for ages, then lurches. A
      // smooth crawl would teach people to expect the wrong thing.
      let width = 6;
      const bar = document.getElementById("bar");

      // The real page shows the doors time, not a countdown, once you are in
      // the queue proper.
      const doors = new Date(Date.now() + 9 * 60000);
      document.getElementById("event-start").textContent =
        String(doors.getHours()).padStart(2, "0") + ":" + String(doors.getMinutes()).padStart(2, "0");

      const step = () => {
        if (width >= 100) { location.href = "${state.coach ? "/coach-day" : "/registration"}"; return; }
        const jump = Math.random() < 0.55 ? 0 : Math.ceil(Math.random() * 22);
        width = Math.min(100, width + jump);
        bar.style.width = width + "%";
        setTimeout(step, 1200 + Math.random() * 3500);
      };
      setTimeout(step, 2500);
    </script>`;

  return queueShell({
    title: "In the queue",
    body,
    practiceNote: "queue",
    statusTime: nowTime(),
    sale: { coach: state.coach, slots: state.slots },
    queued: true,
    skipTo: state.coach ? "/coach-day" : "/registration",
  });
}

export function confirmPage(state: MockState, error?: string) {
  const [lead, ...others] = state.registrations;
  if (!lead) return page({ title: "Registration", body: `<div class="g-ui-box"><p>Nothing entered. <a href="/registration">Start again</a>.</p></div>` });

  const ticketSelect = `
    <label style="font-weight:normal;margin-top:8px">Ticket type:</label>
    <select><option>Deposit (£${DEPOSIT}.00)</option></select>`;

  const body = `
    <div class="g-ui-box">
      <p><a class="g-button secondary small" href="/registration">Clear Registrations</a></p>
      <h1 style="font-size:28px">Registration</h1>
      <p>Thanks for entering your registration details. You can
      <strong>buy ${state.registrations.length} admission ticket deposit${state.registrations.length === 1 ? "" : "s"}</strong>
      with these registrations. Please confirm that the information we have is correct.</p>

      <p class="lead-guest-header">Lead booker (you)</p>
      <div class="registered-user">
        <p><strong><u>${escapeHtml(lead.name)}</u></strong> (${escapeHtml(lead.registrationNumber)})</p>
        <p>${escapeHtml(addressFor(lead.registrationNumber).line1)}<br>${escapeHtml(lead.postcode)}</p>
        ${ticketSelect}
      </div>

      ${
        others.length > 0
          ? `<p class="lead-guest-header">Other registrations added to this order (${others.length})</p>
             ${others
               .map(
                 (person, index) => `
             <div class="registered-user">
               <p>${index + 1}. <strong><u>${escapeHtml(person.name)}</u></strong></p>
               <p>Registration No: ${escapeHtml(person.registrationNumber)}<br>
                  Postcode: ${escapeHtml(person.postcode)}</p>
               ${ticketSelect}
             </div>`,
               )
               .join("")}`
          : ""
      }

      <form method="post" action="/confirm">
        ${state.coach ? coachSection(state) : ""}
        ${
          error
            ? `<p class="field-validation-error" style="margin-left:0">${escapeHtml(error)}</p>`
            : ""
        }
        <button class="g-button primary" type="submit">Confirm &nbsp;→</button>
      </form>
    </div>`;

  return page({
    title: "Confirm registrations",
    heading: "Glastonbury 2027 Deposits",
    subheading: "Worthy Farm, Pilton, Somerset. 23rd - 27th June 2027",
    body,
    sale: { coach: state.coach, slots: state.slots },
    practiceNote: "confirm",
  });
}

export function checkoutPage(state: MockState) {
  const total = state.registrations.length * DEPOSIT;
  const money = (amount: number) => `£${amount.toFixed(2)}`;

  /**
   * The real checkout arrives pre-filled with whatever it holds for the lead
   * booker, which is the point worth making here: it is the first registration
   * on the previous page, not necessarily the person paying, so it has to be
   * checked against the card before you press Buy.
   */
  const lead = state.registrations[0];
  const [firstName, ...restOfName] = (lead?.name ?? "").split(" ");
  const address = lead ? addressFor(lead.registrationNumber) : { line1: "", town: "" };
  const prefilled: Record<string, string> = lead
    ? {
        firstName,
        lastName: restOfName.join(" "),
        email: emailFor(lead.name),
        confirmEmail: emailFor(lead.name),
        telephone: telephoneFor(lead.registrationNumber),
        line1: address.line1,
        townCity: address.town,
        billingPostcode: lead.postcode,
      }
    : {};

  const textField = (id: string, label: string, required = false, type = "text") => `
    <div class="form-field">
      <label for="${id}">${label}${required ? ' <span class="required">*</span>' : ""}</label>
      <input type="${type}" id="${id}" name="${id}" value="${escapeHtml(prefilled[id] ?? "")}"${
        required ? " required" : ""
      }>
    </div>`;

  const agreement = (id: string, html: string, required = true) => `
    <div class="form-field">
      <input type="checkbox" id="${id}" name="${id}"${required ? " required" : ""}>
      <label class="g-faux-input" for="${id}"></label>
      <label for="${id}">${html}</label>
    </div>`;

  const body = `
    <div class="gfl-checkout">
      <div class="g-ui-box">
        <p>Your order details are displayed below. If you are happy with your order, please fill in
        the purchase form and click Buy Tickets.</p>
        ${responsibilityNote()}
      </div>

      <div class="g-ui-box">
        ${orderSummary(state)}
      </div>

      <form method="post" action="/complete">
        <div class="g-ui-box">
          <h2>Your Billing Contact and Delivery Address Details</h2>
          <p style="font-size:13px">Please check and/or update your billing contact and delivery
          address details below:</p>
          ${
            lead
              ? `<div class="info-note" style="margin-bottom:14px"><p style="margin:0">These are
                 <strong>${escapeHtml(lead.name)}</strong>'s details, taken from the lead booker's
                 registration. If someone else is paying, change them to match that card.</p></div>`
              : ""
          }

          <div class="yourdetails">
            <div>
              ${textField("title", "Title")}
              ${textField("firstName", "First Name")}
              ${textField("lastName", "Last Name")}
              ${textField("email", "Email Address", false, "email")}
              ${textField("confirmEmail", "Confirm Email", false, "email")}
              ${textField("telephone", "Telephone", false, "tel")}
            </div>
            <div>
              <div class="form-field">
                <label for="country">Country</label>
                <select id="country" name="country">
                  <option>UNITED KINGDOM</option>
                  <option>IRELAND</option>
                  <option>FRANCE</option>
                </select>
              </div>
              ${textField("line1", "Line 1", true)}
              ${textField("line2", "Line 2")}
              ${textField("line3", "Line 3")}
              ${textField("townCity", "Town / City", true)}
              ${textField("billingPostcode", "Postcode / Zip Code", true)}
            </div>
          </div>
        </div>

        <div class="g-ui-box">
          <h2 class="payment-sec">Payment Details</h2>
          <div class="card-row">
            <span class="card-icon"></span>
            <span class="grow">Card number</span>
            <span>MM / YY</span>
            <span>CVC</span>
          </div>
          <div class="info-note" style="border-left-color:#d71837;background:#fdecef;margin-top:18px">
            <p style="margin:0"><strong>No card is taken here.</strong> This is a practice page, so
            the card row above is a picture rather than a field. On the real site this is where you
            would type your card details.</p>
          </div>
        </div>

        <div class="g-ui-box agreements">
          ${agreement(
            "agreeTerms",
            `Please tick here to confirm you have read, understood and agreed to the Festival's
             <a href="#">Terms and Conditions of Entry</a>`,
          )}
          ${agreement(
            "agreeData",
            `Please tick here to confirm that everyone on this booking has consented for their
             registration data to be processed for the purpose of issuing their Glastonbury Festival
             ticket, as outlined in the Festival's <a href="#">Privacy Policy</a> (and that for anyone
             aged 15 or under, a parent, carer or legal guardian has consented on their behalf)`,
          )}
          <p class="note">Under 16s must be accompanied to the Festival by a responsible adult (who
          must be aged 18 or over, who would usually be the parent, carer or legal guardian).</p>
          ${agreement("agreeAges", `<strong>Please tick here to confirm either</strong>`)}
          <ul class="bullets">
            <li>everyone on this booking is aged 16 or over<br>
              <em>or if you are booking tickets for children aged 13, 14 or 15, and/or bringing
              children aged 12 or under with you to the Festival</em></li>
            <li>the lead booker is aged 18 or over (usually the parent, carer or legal guardian) and
            accepts full responsibility for all under 16s attending in this group.</li>
          </ul>

          <p><button class="g-button primary" type="submit">Buy Tickets</button></p>
        </div>
      </form>
    </div>
    <div class="page-countdown"><p>Your tickets are held for</p><p class="timer" id="held">06:22</p></div>
    <script>
      let left = 382;
      setInterval(() => {
        left = Math.max(0, left - 1);
        document.getElementById("held").textContent =
          String(Math.floor(left / 60)).padStart(2, "0") + ":" + String(left % 60).padStart(2, "0");
      }, 1000);
    </script>`;

  return page({
    title: "Checkout",
    heading: "Checkout",
    body,
    sale: { coach: state.coach, slots: state.slots },
    practiceNote: "checkout",
  });
}

export function completePage(state: MockState) {
  const body = `
    <div class="g-ui-box">
      <p class="info-heading">Information</p>
      ${orderSummary(state)}
      <div class="info-note" style="margin-top:22px">
        <p style="margin:0"><strong>No payment has been taken.</strong> This was a practice run — on
        the real site your card would have been charged by now and this page would be your receipt.</p>
      </div>
      <p><a class="g-button primary small" href="/reset">Practise again</a></p>
    </div>
    <script>
      // Hidden, for demos: Ctrl-B twice, quickly, goes back to an empty
      // registration form on the same sale rather than all the way to the
      // start. Ctrl rather than Cmd; nothing on the page mentions it.
      (() => {
        let last = 0;
        document.addEventListener("keydown", (event) => {
          if (!event.ctrlKey || event.metaKey || event.altKey || event.key.toLowerCase() !== "b") return;
          event.preventDefault();
          const now = performance.now();
          if (now - last > 450) { last = now; return; }
          location.href = "/again";
        });
      })();
    </script>`;

  return page({
    title: "Booking complete",
    heading: "Booking complete",
    orderReference: state.reference ?? "000000000",
    body,
    sale: { coach: state.coach, slots: state.slots },
    practiceNote: "complete",
  });
}
