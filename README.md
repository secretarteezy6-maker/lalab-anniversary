# Anniversary Surprise Website

A small romantic website with a multi-step surprise flow:

- Welcome screen
- Lock screen and date code
- Sliding photo puzzle
- Voice message playback
- Envelope letter reveal
- Jackpot slot machine
- Claim jackpot button that emails the owner through FormSubmit

## How to run locally

From this folder, run:

python -m http.server 8000

Then open:

http://localhost:8000

## Customize it

Edit these values in `script.js`:

- `correctCode` = the date you first started dating (format: `DDMMYYYY`)
- `email` inside the `claimJackpotBtn` click handler = your email address

Example:

const correctCode = "25062023";

You can also replace the placeholder message text in the script and the letter text in `index.html` with your own words.

## Add your voice recording

The tape deck uses `Lalab.mp3` in this folder. If you replace the recording or change its filename, update the `src` on the `voice-recording` audio element in `index.html`.

## Claim notifications

The claim button sends an email through FormSubmit to `bjonkeith@gmail.com`. FormSubmit requires confirming its first activation email before claim alerts will be delivered. The recipient address is included in this public site's JavaScript.

## Deploy it for sharing

You can upload the folder to:

- GitHub Pages
- Netlify
- Vercel

Then share the public URL with her.
