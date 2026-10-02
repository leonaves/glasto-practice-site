export type Registration = { registrationNumber: string; postcode: string; name: string };

/** A coach ticket as chosen on the travel page. */
export type CoachTicket = { label: string; price: number; quantity: number };

export type MockState = {
  /** 6 for a main sale, 4 or 2 for the April resales. */
  slots: number;
  coach: boolean;
  registrations: Registration[];
  /** Which departure day was chosen, on the page before registration. */
  coachDay?: "wed" | "thu";
  town?: string;
  coachTicket?: CoachTicket;
  reference?: string;
};

const COOKIE = "mock_state";

export const DEFAULT_STATE: MockState = { slots: 6, coach: false, registrations: [] };

export function readState(request: Request): MockState {
  const raw = /(?:^|;\s*)mock_state=([^;]+)/.exec(request.headers.get("Cookie") ?? "")?.[1];
  if (!raw) return { ...DEFAULT_STATE };
  try {
    return { ...DEFAULT_STATE, ...(JSON.parse(decodeURIComponent(raw)) as Partial<MockState>) };
  } catch {
    return { ...DEFAULT_STATE };
  }
}

export function stateCookie(state: MockState): string {
  const value = encodeURIComponent(JSON.stringify(state));
  return `${COOKIE}=${value}; Path=/; SameSite=Lax; Max-Age=86400`;
}

export function clearedCookie(): string {
  return `${COOKIE}=; Path=/; Max-Age=0`;
}

/**
 * The real site looks a name up from the registration number. This invents a
 * stable one so the confirmation screen has something to show, and so the same
 * number always produces the same person.
 */
const FIRST = ["Alex", "Sam", "Jo", "Chris", "Robin", "Frankie", "Nic", "Charlie", "Jess", "Morgan"];
const LAST = ["Bailey", "Fletcher", "Okafor", "Nolan", "Rahman", "Vaughn", "Doyle", "Ashworth"];

/**
 * An address and an email to go with the invented name, so the checkout can
 * arrive pre-filled the way the real one does. Same hash as `nameFor`, so a
 * registration number always produces the same person at the same address.
 */
const HOUSES = ["12", "4", "88", "31", "7", "146", "23", "59"];
const ROADS = ["Orchard Road", "Mill Lane", "Bramble Way", "Victoria Street",
               "Chapel Hill", "The Green", "Wellington Road", "Fern Close"];
const TOWNS = ["Wells", "Frome", "Shepton Mallet", "Street", "Glastonbury",
               "Castle Cary", "Bruton", "Somerton"];

function hashOf(value: string): number {
  let hash = 0;
  for (const character of value) hash = (hash * 31 + character.charCodeAt(0)) >>> 0;
  return hash;
}

export function addressFor(registrationNumber: string): { line1: string; town: string } {
  const hash = hashOf(registrationNumber);
  return {
    line1: `${HOUSES[hash % HOUSES.length]} ${ROADS[(hash >>> 3) % ROADS.length]}`,
    town: TOWNS[(hash >>> 7) % TOWNS.length],
  };
}

export function emailFor(name: string): string {
  const [first, last] = name.toLowerCase().split(" ");
  return `${first}.${last}@example.com`;
}

export function telephoneFor(registrationNumber: string): string {
  const hash = hashOf(registrationNumber);
  return `07${String(100000000 + (hash % 899999999)).slice(0, 9)}`;
}

export function nameFor(registrationNumber: string): string {
  let hash = 0;
  for (const character of registrationNumber) {
    hash = (hash * 31 + character.charCodeAt(0)) >>> 0;
  }
  // >>> not >>: hash is unsigned, and a signed shift turns anything past
  // 2^31 negative, which indexes off the end of the list.
  return `${FIRST[hash % FIRST.length]} ${LAST[(hash >>> 5) % LAST.length]}`;
}

/**
 * Practice failures, so people can see what each kind of wrong looks like
 * before it matters: a registration starting 99 does not exist, and one
 * starting 98 exists but already has a ticket against it — the error you get
 * when somebody else in the group got through first.
 */
export function checkRegistration(
  registrationNumber: string,
  postcode: string,
): string | null {
  const registration = registrationNumber.replace(/\s+/g, "");
  if (!/^\d{6,12}$/.test(registration)) return "Please enter a valid registration number.";
  if (postcode.trim() === "") return "Please enter the registered postcode.";
  if (registration.startsWith("99")) {
    return "Sorry, we couldn't find a valid registration with those details. Please check and try again.";
  }
  if (registration.startsWith("98")) {
    return "This registration already has a ticket assigned to it.";
  }
  return null;
}
