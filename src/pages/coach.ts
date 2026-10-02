import { escapeHtml, page } from "../layout";
import type { MockState } from "../state";

/** What See Tickets shows in brackets as the face value, under the cost. */
const BOOKING_FEE = 4;

/**
 * Return fares for the 2027 sale, from See Tickets' published table.
 *
 * Every town the sale offers sells a return, so this doubles as the town list and
 * `COACH_TOWNS` is derived from it rather than kept by hand. The two had already
 * drifted once: the hand-written list still offered Portsmouth, which the sale had
 * dropped, and was missing Stoke and Swindon, which it had added.
 */
const RETURN_FARES: Record<string, number> = {
  Bath: 53,
  Birmingham: 63,
  Brighton: 79,
  Bristol: 53,
  Cambridge: 114,
  Cardiff: 57,
  Edinburgh: 185,
  Glasgow: 184,
  Leeds: 133,
  Leicester: 68,
  Lincoln: 119,
  Liverpool: 126,
  London: 89,
  Manchester: 122,
  Newcastle: 158,
  Norwich: 116,
  Nottingham: 73,
  Oxford: 63,
  Plymouth: 65,
  Reading: 57,
  Sheffield: 130,
  Southampton: 63,
  Stoke: 82,
  Swansea: 60,
  Swindon: 57,
  Taunton: 53,
  Truro: 85,
  York: 142,
};

/**
 * Singles are sold from five towns only — the ones close enough to do the run and
 * come back the same day. A town's absence here is what makes `optionsFor` offer it
 * a return and nothing else, so there is no separate list of who gets one.
 */
const SINGLE_FARES: Record<string, number> = {
  Bath: 27,
  Bristol: 26,
  London: 44,
  Reading: 39,
  Taunton: 32,
};

/** The towns the real coach sale offers. */
export const COACH_TOWNS = Object.keys(RETURN_FARES).sort();

export type CoachOption = {
  /** Their id shape: DF-<event>_<n>. */
  priceGlobalId: string;
  priceType: number;
  label: string;
  price: number;
  unavailable: boolean;
};

function hash(value: string): number {
  let result = 7;
  for (const character of value) result = (result * 31 + character.charCodeAt(0)) >>> 0;
  return result;
}

/** The towns that offer a choice of departure time. Everywhere else gets one of each. */
const TIMED_TOWNS = new Set(["Bristol", "London"]);

/**
 * A timed town gets an hourly coach; everywhere else gets one of each. Thursday's
 * last coach leaves earlier than Wednesday's. Only the five towns in
 * `SINGLE_FARES` offer a single at all, so most towns get returns and nothing else.
 *
 * A town with no return fare is not one the sale runs to, and gets no coaches
 * rather than coaches priced from a missing fare — the town arrives from a form
 * field, so it cannot be assumed to be one of ours.
 *
 * Unavailable coaches are picked by hashing the label, so a given town always
 * loses the same ones and a rehearsal is repeatable.
 */
export function optionsFor(town: string, day: "wed" | "thu"): CoachOption[] {
  const returnFare = RETURN_FARES[town];
  if (returnFare === undefined) return [];
  const singleFare = SINGLE_FARES[town];

  const place = town.toUpperCase();
  const labels: [string, number][] = [];

  if (TIMED_TOWNS.has(town)) {
    const lastHour = day === "wed" ? 20 : 17;
    for (let hour = 5; hour <= lastHour; hour++) {
      const time = `${String(hour).padStart(2, "0")}:00`;
      if (singleFare !== undefined) {
        labels.push([`${place} SINGLE TRAVEL (DEP ${time})`, singleFare]);
      }
      labels.push([`${place} RETURN TRAVEL (DEP ${time})`, returnFare]);
    }
  } else {
    if (singleFare !== undefined) labels.push([`${place} SINGLE TRAVEL`, singleFare]);
    labels.push([`${place} RETURN TRAVEL`, returnFare]);
  }

  return labels.map(([label, price], index) => ({
    priceGlobalId: `DF-2700000_${index + 1}`,
    priceType: index + 1,
    label,
    price,
    unavailable: hash(`${label}|${day}`) % 7 === 0,
  }));
}

/** The two big panels you pick between before you even reach the form. */
export function coachDayPage(state: MockState): Response {
  const panel = (day: "wed" | "thu", date: string) => `
    <a class="coach-day" href="/registration?day=${day}">
      <span>Tickets plus coach travel</span>
      <strong>${escapeHtml(date)} departure</strong>
    </a>`;

  const body = `
    <h1 class="coach-day__heading">Glastonbury Festival</h1>
    <p>For more information please see <a href="#"><strong>here</strong></a></p>
    <div class="coach-day__grid">
      ${panel("wed", "Wednesday 23rd June")}
      ${panel("thu", "Thursday 24th June")}
    </div>`;

  return page({
    title: "Coach departures",
    body,
    bodyClass: "coach-choice",
    sale: { coach: true, slots: state.slots },
    practiceNote: "pick a departure day",
  });
}

/**
 * The coach block that sits at the foot of the confirmation page. The town
 * dropdown does nothing until you pick one, and then that town's coaches appear
 * beneath it.
 *
 * The table is See Tickets' own `.price-list`: a `t-head` row inside the tbody,
 * `price-info-cell` with the cost and the face value in brackets, and a
 * `qty-sel` per row carrying the hidden `Selection.TicketSelections[...]` fields.
 * Rows that have gone say "Currently unavailable" where the dropdown would be.
 */
export function coachSection(state: MockState): string {
  const day = state.coachDay ?? "wed";
  const wanted = state.registrations.length;

  const row = (option: CoachOption) => {
    const id = option.priceGlobalId;
    const fieldId = `Selection_TicketSelections_[${id}]__Quantity`;
    const cost = option.price.toFixed(2);
    const faceValue = (option.price - BOOKING_FEE).toFixed(2);

    return `
      <tr class=" ticket" data-pricetype="${option.priceType}" data-priceglobalid="${id}"
          data-currency-code="GBP" id="PriceType${option.priceType}_Price">
        <td class=" ">
          ${escapeHtml(option.label)}
          <a name="${option.priceType}"></a>
        </td>
        <td class="price-info-cell" rowspan="1" data-cost="${cost}">
          <span class="">£${cost}</span>
          <em class="fees">(£${faceValue})</em>
        </td>
        ${
          option.unavailable
            ? `<td rowspan="1" class="note quantity" colspan="1">Currently unavailable</td>`
            : `<td rowspan="1" class="quantity">
                 <input type="hidden" name="Selection.TicketSelections.Index" value="${id}">
                 <input type="hidden" name="Selection.TicketSelections[${id}].PriceGlobalId" value="${id}">
                 <label class="sr-only" for="${fieldId}">Quantity selection for ticket type ${escapeHtml(
                   option.label,
                 )}</label>
                 <select id="${fieldId}" name="Selection.TicketSelections[${id}].Quantity"
                         class="qty-sel" data-quantity-select="true" data-max-quantity="${wanted}"
                         data-max-sell="${wanted}" data-item-type="Coach" data-ticket-price="${cost}">
                   <option value="0">0</option>
                   <option value="${wanted}">${wanted}</option>
                 </select>
                 <span class="field-validation-valid"
                       data-valmsg-for="Selection.TicketSelections[${id}].Quantity"
                       data-valmsg-replace="true"></span>
               </td>`
        }
      </tr>`;
  };

  const groups = COACH_TOWNS.map(
    (town) => `<div class="ticket-group" data-town="${escapeHtml(town)}" hidden>
      <table class="price-list">
        <tbody>
          <tr class="t-head">
            <th class="ticket-type">Ticket type</th>
            <th class="ticket-value">
              Cost
              <a href="#" title="Booking Fee Information"><em class="fees">(face value)<sup>?</sup></em></a>
            </th>
            <th class="quantity">Quantity</th>
          </tr>
          ${optionsFor(town, day).map(row).join("")}
        </tbody>
      </table>
    </div>`,
  ).join("");

  return `
    <p class="lead-guest-header coach-heading">Tickets for coaches departing on
      ${day === "wed" ? "Wednesday (event day)" : "Thursday"}</p>

    <div class="info-note">
      <p>For Festival ticket + coach travel you must select a coach for all registrations you have
      entered and it is <strong>mandatory that all passengers travel on this coach</strong>.</p>
      <p>Coach E-Tickets will be sent in advance. The Festival entry tickets will be handed out to
      each individual passenger during the journey.</p>
      <p>The coach tickets you select for your group must all be from the same location. Mixing of
      'SINGLE' and 'RETURN' tickets is not allowed.</p>
    </div>

    <div class="town-picker">
      <select id="town" name="town" aria-label="Departing from">
        <option value="">-- Select a town --</option>
        ${COACH_TOWNS.map(
          (town) =>
            `<option value="${escapeHtml(town)}"${
              state.town === town ? " selected" : ""
            }>${escapeHtml(town)}</option>`,
        ).join("")}
      </select>
    </div>

    <div id="ticket-groups">${groups}</div>

    <script>
      const townSelect = document.getElementById("town");
      const ticketGroups = [...document.querySelectorAll(".ticket-group")];
      const revealTown = () => {
        for (const group of ticketGroups) {
          const showing = group.dataset.town === townSelect.value;
          group.hidden = !showing;
          // Only the visible town's quantities should reach the server.
          for (const field of group.querySelectorAll("select")) field.disabled = !showing;
        }
      };
      townSelect.addEventListener("change", revealTown);
      revealTown();
    </script>`;
}

/** Reads the quantity dropdowns back, enforcing one coach for the whole group. */
export function readCoachSelection(
  form: FormData,
  state: MockState,
): { town: string; ticket: MockState["coachTicket"] } | { error: string } {
  const town = String(form.get("town") ?? "");
  if (!town) return { error: "Please select a town to depart from." };

  const options = optionsFor(town, state.coachDay ?? "wed");
  const chosen: { option: CoachOption; quantity: number }[] = [];

  for (const [key, value] of form.entries()) {
    const match = /^Selection\.TicketSelections\[(.+)\]\.Quantity$/.exec(key);
    if (!match) continue;
    const quantity = Number(value);
    if (quantity <= 0) continue;
    const option = options.find((item) => item.priceGlobalId === match[1]);
    if (option) chosen.push({ option, quantity });
  }

  if (chosen.length === 0) return { error: "Please select coach tickets for your group." };
  if (chosen.length > 1) {
    return { error: "All passengers must travel on the same coach. Please choose one option only." };
  }

  const [only] = chosen;
  return {
    town,
    ticket: { label: only.option.label, price: only.option.price, quantity: only.quantity },
  };
}
