import { escapeHtml } from "../layout";
import type { MockState } from "../state";

/** What you pay per admission ticket up front, the balance following in April. */
export const DEPOSIT = 100;

/**
 * The Your Responsibility block, transcribed from the real deposits page and
 * moved on to 2027 dates. "23:59pm" is theirs, not a typo of mine.
 */
export function responsibilityNote(): string {
  return `
    <div class="info-note">
      <h3>Your Responsibility</h3>
      <p>You are booking a general admission ticket deposit. This means that you will pay just
      £${DEPOSIT}.00 per admission ticket now.</p>
      <p>All ticket balances will be payable in the first week of April 2027 from
      <strong>9:00am BST Saturday 3rd April - 23:59pm BST Friday 9th April 2027</strong>, when you
      will also be able to book car parking and Booking Refund Protection. (Tipis and campervan
      tickets will be available in the accommodation sale along with Worthy View accommodation.
      Details will be released later in the Autumn).</p>
      <p>If you have not paid your balance by the end of the balance payment window, or you decide to
      cancel your deposit, you will be charged an administration fee of £25.00 per ticket and
      refunded £25.00 per ticket. You will be sent a reminder email when the deadline is approaching,
      however, ultimately you are responsible for paying your ticket balance.</p>
    </div>`;
}

/** The order summary block, shared by the checkout and the completed booking. */
export function orderSummary(state: MockState): string {
  const deposits = state.registrations.length * DEPOSIT;
  // Only on a coach run, whatever the cookie still holds.
  const travel = state.coach ? state.coachTicket : undefined;
  const coach = travel ? travel.price * travel.quantity : 0;
  const money = (amount: number) => `£${amount.toFixed(2)}`;

  return `
    <div class="g-order-summary">
      <div class="g-order-summary-top">
        <span class="g-order-summary-top-title">Glastonbury 2027 ${
          travel ? "Ticket &amp; Coach Travel" : "Deposits"
        }</span>
        <p class="when">${
          travel
            ? `${
                state.coachDay === "thu" ? "Thursday 24th" : "Wednesday 23rd"
              } June 2027 - Various Departures | Worthy Farm`
            : "23rd - 27th June 2027 | Worthy Farm"
        }</p>
      </div>

      <div class="g-order-summary-item">
        <div class="lines">
          ${state.registrations.length}x DEPOSIT
          <div class="names">
            ${state.registrations
              .map(
                (person, index) =>
                  `<div>${escapeHtml(person.name)} (#${escapeHtml(person.registrationNumber)})${
                    index === 0 ? " - <strong>LEAD BOOKER</strong>" : ""
                  }</div>`,
              )
              .join("")}
          </div>
        </div>
        <div>${money(deposits)}</div>
      </div>

      ${
        travel
          ? `<div class="g-order-summary-item">
               <div class="lines">${travel.quantity}x ${escapeHtml(travel.label)}</div>
               <div>${money(coach)}</div>
             </div>`
          : ""
      }

      <div class="g-order-summary-total">
        <span class="label">Total</span><span class="amount">${money(deposits + coach)}</span>
      </div>
    </div>`;
}
