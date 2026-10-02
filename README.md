# Glasto practice site

A practice copy of the Glastonbury ticket sale, for rehearsing the queue, the
registration form and checkout before the real thing. No tickets exist here and
no payment can be taken.

It's public so that anybody can check one thing for themselves: **nothing you
type into the practice ticket forms is kept.**

## What happens to what you type

Registration numbers, postcodes and the (fake) card details on the practice
pages are never written to a database, a file or a log. While you work through
a run they live in a cookie in **your own browser** (`mock_state`, see
[`src/state.ts`](src/state.ts)), which lasts a day and is cleared by "start
again". The server reads it back on each page to know where you've got to, and
that's all.

You can check this for yourself: **this code has no database at all.** The
only thing it's connected to is the bucket the guide videos stream from
([`wrangler.jsonc`](wrangler.jsonc)).

## Who can get in

The live site isn't open to everyone, so there's a sign-in in front of these
pages. That part isn't published. It decides who gets in and keeps a record of
sign-ins, and nothing else: it never sees what you type on the practice pages.

Cloudflare, which hosts the site, keeps its own standard request logs (page
addresses, response codes, timings) for a few days. Those don't include what
you type into forms.

## Not included

The Glastonbury Festival banner, See Tickets' font and the favicon aren't in
this repository: they're theirs, not ours to republish. The deployed site
serves them from `public/`.

## Running it

A Cloudflare Worker. Fill in the placeholders in `wrangler.jsonc` (account,
hostname and video bucket) before it will deploy.

```sh
npm install
npx wrangler types
npx wrangler dev
```
