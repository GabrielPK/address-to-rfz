const addressRegex = /\b(\d+\s+[A-Za-z]{2}\s+\d+(?:st|ST|nd|ND|rd|RD|th|TH)?\s+(?:way|WAY|street|st|avenue|ave|road|rd|boulevard|blvd|lane|ln|drive|dr|court|ct|circle|cir|place|pl))\s*(?:[,.]?\s*([A-Za-z\s]+)[,.]?\s*([A-Z]{2})\s*(\d{5}(?:-\d{4})?))?\b/gi;

function createSearchLinks(address) {
  const encodedAddress = encodeURIComponent(address.trim());

  const linksDiv = document.createElement('div');
  linksDiv.style.marginTop = '5px';
  linksDiv.style.marginBottom = '5px';

  const zillowLink = document.createElement('a');
  zillowLink.href = `https://www.zillow.com/homes/${encodedAddress}_rb/`;
  zillowLink.textContent = 'Search Zillow';
  zillowLink.target = '_blank';
  zillowLink.style.marginRight = '10px';
  zillowLink.style.color = '#006AFF';

  const redfinLink = document.createElement('a');
  redfinLink.href = `https://www.redfin.com/city/search?q=${encodedAddress}`;
  redfinLink.textContent = 'Search Redfin';
  redfinLink.target = '_blank';
  redfinLink.style.color = '#A52B2B';

  linksDiv.appendChild(zillowLink);
  linksDiv.appendChild(redfinLink);

  return linksDiv;
}

function processAddresses() {
  const walker = document.createTreeWalker(
    document.body,
    NodeFilter.SHOW_TEXT,
    null,
    false
  );

  const nodesToProcess = [];
  let node;
  while (node = walker.nextNode()) {
    if (addressRegex.test(node.textContent)) {
      nodesToProcess.push(node);
    }
  }

  nodesToProcess.reverse().forEach(node => {
    const container = document.createElement('div');
    container.style.display = 'inline-block';

    const textSpan = document.createElement('span');
    textSpan.innerHTML = node.textContent.replace(addressRegex, (match) => {
      const highlightSpan = document.createElement('span');
      highlightSpan.style.color = '#2E7D32';
      highlightSpan.style.fontWeight = 'bold';
      highlightSpan.textContent = match;

      const addressContainer = document.createElement('div');
      addressContainer.appendChild(highlightSpan);
      addressContainer.appendChild(createSearchLinks(match));

      return addressContainer.outerHTML;
    });

    container.appendChild(textSpan);
    node.parentNode.replaceChild(container, node);
  });
}

// Run when the page loads
processAddresses();

// Also run when dynamic content is added to the page
const observer = new MutationObserver((mutations) => {
  processAddresses();
});

observer.observe(document.body, {
  childList: true,
  subtree: true
});