# Tampermonkey Zenn - Hide GitHub Card Stats

A tampermonkey script that hides the star count and fork count on GitHub repository cards embedded in Zenn articles.

## Behavior

- The ☆ star count and the fork count are hidden
- Everything else on the card (the repository name, the description, the language) stays as it is

Zenn renders a GitHub card inside an iframe served from `embed.zenn.studio`, so the script runs inside that iframe.
The card's class names are generated and not stable, so the script does not depend on them.
Instead, it hides each item that consists of only an icon (`<svg>`) and a count (`515`, `4,100`, `4.1k`, ...).
The language item (e.g. `Lua`) is not a count, so it is kept.

A `MutationObserver` re-applies this whenever the DOM changes, so client-side rendering and SPA navigation are covered.

## Installation

1. Install [Tampermonkey](https://www.tampermonkey.net/) in your browser
2. Install [zenn-hide-github-card-stats.user.js](https://raw.githubusercontent.com/aiya000/tampermonkey-zenn-hide-github-card-stats/refs/heads/main/zenn-hide-github-card-stats.user.js) into Tampermonkey

## Supported URLs

- `https://embed.zenn.studio/github*` (the iframe of a GitHub card)
- `https://zenn.dev/*` (only inside `.zenn-embedded-github`, in case a card is rendered inline)

## Development

```console
$ bun install
$ bun run typecheck
$ bun run lint
$ bun run fix
```
