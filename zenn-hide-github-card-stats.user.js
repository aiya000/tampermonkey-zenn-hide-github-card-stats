// ==UserScript==
// @name         Zenn - Hide GitHub Card Stats
// @namespace    https://github.com/aiya000/tampermonkey-zenn-hide-github-card-stats
// @version      1.0.1
// @description  Hides the star count and fork count on GitHub repository cards embedded in Zenn articles.
// @author       aiya000
// @match        https://embed.zenn.studio/card*
// @grant        none
// @run-at       document-idle
// ==/UserScript==

;(function () {
  'use strict'

  const styleElementId = 'zhgcs-styles'
  const hiddenAttributeName = 'data-zhgcs-hidden'

  /**
   * Matches a text that consists only of a count, such as `515`, `4,100` or `4.1k`.
   */
  const countTextPattern = /^[\d,.]+\s*[kKmM]?$/

  /**
   * Zenn renders a GitHub repository card inside an iframe served from `embed.zenn.studio/card`.
   * That iframe is shared with the link cards of any other site, so only the link to
   * `github.com` is treated as a card.
   * (`embed.zenn.studio/github` is the embed of a GitHub file, which has no stats.)
   * @returns {Element[]}
   */
  function findCardRoots() {
    return Array.from(document.querySelectorAll('a[href^="https://github.com/"]'))
  }

  function injectStyles() {
    if (document.getElementById(styleElementId) !== null) {
      return
    }

    const style = document.createElement('style')
    style.id = styleElementId
    style.textContent = `
      [${hiddenAttributeName}] {
        display: none !important;
      }
    `

    const parent = document.head ?? document.documentElement
    parent.appendChild(style)
  }

  /**
   * @param {Element} el
   * @returns {boolean}
   */
  function isCountOnly(el) {
    return countTextPattern.test((el.textContent ?? '').trim())
  }

  /**
   * Finds the stat item (an icon and its count, e.g. "☆ 515") that a count text belongs to.
   *
   * The card's class names are generated and unstable, so this relies on the structure only:
   * walk up from the count while the ancestor still holds nothing but the count, and pick the
   * first one that also holds an icon (`<svg>`).
   * The language item (e.g. "</> Lua") is not a count, so it is never picked.
   * @param {Text} countText
   * @param {Element} cardRoot
   * @returns {Element | null}
   */
  function findStatItem(countText, cardRoot) {
    let el = countText.parentElement
    while (el !== null && el !== cardRoot && isCountOnly(el)) {
      if (el.querySelector('svg') !== null) {
        return el
      }
      el = el.parentElement
    }
    return null
  }

  /**
   * @param {Element} cardRoot
   */
  function hideStats(cardRoot) {
    const walker = document.createTreeWalker(cardRoot, NodeFilter.SHOW_TEXT)
    /** @type {Text[]} */
    const countTexts = []
    for (let node = walker.nextNode(); node !== null; node = walker.nextNode()) {
      if (node instanceof Text && countTextPattern.test((node.textContent ?? '').trim())) {
        countTexts.push(node)
      }
    }

    countTexts.forEach(countText => {
      findStatItem(countText, cardRoot)?.setAttribute(hiddenAttributeName, '')
    })
  }

  function hideAllStats() {
    findCardRoots().forEach(hideStats)
  }

  /**
   * The card is rendered client-side after the iframe receives its URL from the article,
   * so the stats are hidden again whenever the DOM changes.
   * `hideAllStats` is idempotent, so redundant calls are harmless.
   */
  function watchDom() {
    const observer = new MutationObserver(hideAllStats)
    observer.observe(document.documentElement, { childList: true, subtree: true })
  }

  injectStyles()
  hideAllStats()
  watchDom()
})()
