import { escapeHtml, page } from "../layout";
import { nameFor } from "../state";

/**
 * A practice copy of the registration lookup page, for trying it out. The
 * practice rules are:
 *
 *   - a registration starting `99` is not found
 *   - a postcode starting `ZZ` does not match the registration
 *   - anything else passes, including `98`, which exists but already holds a
 *     ticket — that is a purchase-form error, not a lookup one
 */

export const LOOKUP_FAILURE =
  "Sorry, we couldn't find a valid registration with those details. Please check and try again.";

function form(values: { registration: string; postcode: string }, error?: string): string {
  return `
    <div class="g-ui-box gfl-register">
      <h1 style="font-size:28px">Registration Lookup</h1>
      <p>Enter a registration number and its registered postcode to check they match.</p>

      ${error ? `<p class="field-validation-error" style="margin-left:0">${escapeHtml(error)}</p>` : ""}

      <form action="/registration/lookup" method="post">
        <input name="__RequestVerificationToken" type="hidden" value="PRACTICE-TOKEN">
        <input id="GlastonburyEventId" name="GlastonburyEventId" type="hidden" value="DF-2700000">

        <div class="add-registration">
          <label for="RegistrationId">Registration Number:</label>
          <input class="numeric" id="RegistrationId" maxlength="30" name="RegistrationId"
                 type="text" value="${escapeHtml(values.registration)}">
          <br>
          <label for="PostCode">Postcode:</label>
          <input class="postcode" id="PostCode" maxlength="30" name="PostCode"
                 style="text-transform: uppercase" type="text" value="${escapeHtml(values.postcode)}">
        </div>

        <p><button class="g-button primary" type="submit">Look up</button></p>
      </form>
    </div>`;
}

export function lookupPage(): Response {
  return page({
    title: "Registration lookup",
    heading: "Glastonbury Registration",
    body: form({ registration: "", postcode: "" }),
    practiceNote: "registration lookup",
  });
}

export function lookupResult(registration: string, postcode: string): Response {
  const cleanRegistration = registration.replace(/\s+/g, "");
  const cleanPostcode = postcode.trim().toUpperCase();

  const malformed = !/^\d{6,12}$/.test(cleanRegistration) || cleanPostcode === "";
  const notFound = cleanRegistration.startsWith("99");
  const mismatch = cleanPostcode.startsWith("ZZ");

  if (malformed || notFound || mismatch) {
    return page({
      title: "Registration lookup",
      heading: "Glastonbury Registration",
      body: form({ registration, postcode }, LOOKUP_FAILURE),
      practiceNote: "registration lookup · not found",
    });
  }

  const body = `
    <div class="g-ui-box">
      <h1 style="font-size:28px">Registration Found</h1>
      <p class="lead-guest-header">Registered to</p>
      <div class="registered-user">
        <p><strong>${escapeHtml(nameFor(cleanRegistration))}</strong></p>
        <p>Registration No: ${escapeHtml(cleanRegistration)}<br>
           Postcode: ${escapeHtml(cleanPostcode)}</p>
      </div>
      <p><a class="g-button secondary small" href="/registration/lookup">Check another</a></p>
    </div>`;

  return page({
    title: "Registration lookup",
    heading: "Glastonbury Registration",
    body,
    practiceNote: "registration lookup · found",
  });
}
