import { escapeHtml, page } from "../layout";
import { responsibilityNote } from "./parts";
import type { MockState } from "../state";

/**
 * A hidden shortcut for demonstrating the practice run: Ctrl-R twice, quickly.
 * Ctrl, not Cmd, so it never collides with reloading on a Mac. Nothing on the
 * page mentions it.
 *
 * With no error showing, it types a made-up registration and postcode into the
 * next empty row, quickly but visibly, a character at a time. The second one
 * entered on the page starts 98, which the practice site refuses as "already
 * has a ticket", so there is an error to show. With an error showing, it
 * repairs that row instead: selects and wipes the registration in one go and
 * types a good one, then the same for the postcode.
 */
const PRESENTER_SCRIPT = `
(() => {
  const DOUBLE_PRESS_MS = 450;
  const POSTCODES = ["BA4 4BY", "BS6 5AA", "SE5 8RS", "M20 2WX", "LS6 2QL", "EH7 5QB",
    "CF11 9LJ", "N4 2DE", "OX4 1JP", "NG7 1BE", "BN1 6TT", "YO31 7EF", "EX2 4LS", "RG30 2BA"];
  const digits = (n) => Array.from({ length: n }, () => Math.floor(Math.random() * 10)).join("");
  // First digit 1-8, so a good one can never start 98 or 99 by chance.
  const good = () => String(1 + Math.floor(Math.random() * 8)) + digits(9);
  const refused = () => "98" + digits(8);
  const postcode = () => POSTCODES[Math.floor(Math.random() * POSTCODES.length)];
  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  const setValue = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set;
  const put = (field, value) => {
    setValue.call(field, value);
    field.dispatchEvent(new Event("input", { bubbles: true }));
  };
  const type = async (field, text) => {
    field.focus();
    for (const character of text) {
      put(field, field.value + character);
      await sleep(12 + Math.random() * 18);
    }
    field.dispatchEvent(new Event("change", { bubbles: true }));
  };
  const wipe = async (field) => {
    field.focus();
    field.select();
    await sleep(140);
    put(field, "");
    await sleep(100);
  };
  const registration = (slot) => document.getElementById("registrations_" + slot + "__RegistrationId");
  const postcodeField = (slot) => document.getElementById("registrations_" + slot + "__PostCode");
  const slots = [...Array(document.querySelectorAll('[id$="__RegistrationId"]').length).keys()];

  const next = async () => {
    const broken = document.querySelector(".field-validation-error[data-slot]:not([data-repaired])");
    if (broken) {
      const slot = Number(broken.dataset.slot);
      // Marked rather than removed: the message stays until the form is sent
      // again, as the real one would, but the next press moves on.
      broken.dataset.repaired = "1";
      await wipe(registration(slot));
      await type(registration(slot), good());
      await sleep(150);
      await wipe(postcodeField(slot));
      await type(postcodeField(slot), postcode());
      return;
    }
    const slot = slots.find((index) => !registration(index).value && !postcodeField(index).value);
    if (slot === undefined) return;
    const entered = slots.filter((index) => registration(index).value).length;
    await type(registration(slot), entered === 1 ? refused() : good());
    await sleep(150);
    await type(postcodeField(slot), postcode());
  };

  let lastPress = 0;
  let running = false;
  document.addEventListener("keydown", (event) => {
    if (!event.ctrlKey || event.metaKey || event.altKey || event.key.toLowerCase() !== "r") return;
    event.preventDefault();
    const now = performance.now();
    if (now - lastPress > DOUBLE_PRESS_MS || running) {
      lastPress = now;
      return;
    }
    lastPress = 0;
    running = true;
    next().finally(() => { running = false; });
  });
})();
`;

/**
 * The registration form, reproducing the real one's field names and ids exactly
 * — `registrations[N].RegistrationId` / `registrations_N__RegistrationId` — so
 * that anything which fills this will fill the real thing.
 *
 * Slot 0 is the lead booker; the rest are additional tickets.
 */
export function registrationPage(state: MockState, errors: Record<number, string> = {}, values: Record<string, string> = {}) {
  const extra = state.slots - 1;
  const value = (name: string) => escapeHtml(values[name] ?? "");

  const field = (index: number, kind: "RegistrationId" | "PostCode") => {
    const name = `registrations[${index}].${kind}`;
    const id = `registrations_${index}__${kind}`;
    const isPostcode = kind === "PostCode";
    return `
      <label for="${id}">${isPostcode ? "Postcode:" : "Registration Number:"}</label>
      <input class="${isPostcode ? "postcode" : "numeric"}" id="${id}" maxlength="30"
             name="${name}" type="text" value="${value(name)}"
             ${isPostcode ? 'style="text-transform: uppercase"' : ""}>
      <br>`;
  };

  const person = (index: number, label: string) => `
    ${label ? `<span class="guest-count">${label}</span>` : ""}
    ${field(index, "RegistrationId")}
    ${field(index, "PostCode")}
    ${errors[index] ? `<span class="field-validation-error" data-slot="${index}">${escapeHtml(errors[index])}</span>` : ""}`;

  const body = `
    <div class="g-ui-box">
      <h1 style="font-size:28px">Registration</h1>
      <p>
        Please enter the registration number and postcode for each person (aged 13 or over) for
        whom you are placing a deposit. You may enter up to ${state.slots} people's registration
        details, but can only purchase 1 ticket per registration.
      </p>

      ${responsibilityNote()}

      <form method="post" action="/registration" id="mainRegForm" novalidate>
        <input id="GlastonburyEventId" name="GlastonburyEventId" type="hidden" value="DF-2700000">

        <h3 class="reg-header">Your Details</h3>
        <div class="add-registration lead-reg-marg">${person(0, "")}</div>

        ${
          extra > 0
            ? `<h3 class="reg-header">Add up to ${extra} additional ticket${extra === 1 ? "" : "s"}</h3>
               <div class="add-registration">
                 ${Array.from({ length: extra }, (_, offset) => {
                   const index = offset + 1;
                   return `${offset > 0 ? '<div class="reg-divider"></div>' : ""}${person(index, `#${index}`)}`;
                 }).join("")}
               </div>`
            : ""
        }

        <p style="margin-top:24px"><button class="g-button primary" type="submit">Proceed</button></p>
        <p><a href="/registration">Clear registration form</a></p>
      </form>
    </div>
    <script>${PRESENTER_SCRIPT}</script>`;

  return page({
    title: "Registration",
    heading: "Glastonbury 2027 Deposits",
    subheading: "Worthy Farm, Pilton, Somerset. 23rd - 27th June 2027",
    sale: { coach: state.coach, slots: state.slots },
    practiceNote: `${state.slots} slots · ${state.coach ? "coach" : "general"}`,
    body,
  });
}
