const addressRegex = /\b(\d+\s+[A-Za-z]{2}\s+\d+(?:st|ST|nd|ND|rd|RD|th|TH)?\s+(?:way|WAY|street|st|avenue|ave|road|rd|boulevard|blvd|lane|ln|drive|dr|court|ct|circle|cir|place|pl))\s*(?:[,.]?\s*([A-Za-z\s]+)[,.]?\s*([A-Z]{2})\s*(\d{5}(?:-\d{4})?))?\b/gi;

// Debounce function to limit how often we process mutations
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

function createSearchLinks(address) {
  // Cache the div creation to avoid repeated DOM operations
  const linksDiv = document.createElement('div');
  linksDiv.style.cssText = 'margin: 5px 0;';

  const zillowLink = document.createElement('a');
  zillowLink.href = `https://www.zillow.com/homes/${encodeURIComponent(address.trim())}_rb/`;
  zillowLink.textContent = 'Search Zillow';
  zillowLink.target = '_blank';
  zillowLink.style.cssText = 'margin-right: 10px; color: #006AFF;';

  const redfinLink = document.createElement('a');
  redfinLink.href = `https://www.redfin.com/city/search?q=${encodeURIComponent(address.trim())}`;
  redfinLink.textContent = 'Search Redfin';
  redfinLink.target = '_blank';
  redfinLink.style.cssText = 'color: #A52B2B;';

  linksDiv.appendChild(zillowLink);
  linksDiv.appendChild(redfinLink);

  return linksDiv;
}

// Keep track of processed nodes to avoid reprocessing
const processedNodes = new WeakSet();

function processNode(node) {
  if (processedNodes.has(node) || !node.textContent.match(addressRegex)) {
    return;
  }

  const container = document.createElement('div');
  container.style.display = 'inline-block';

  const textSpan = document.createElement('span');
  textSpan.innerHTML = node.textContent.replace(addressRegex, (match) => {
    const highlightSpan = document.createElement('span');
    highlightSpan.style.cssText = 'color: #2E7D32; font-weight: bold;';
    highlightSpan.textContent = match;

    const addressContainer = document.createElement('div');
    addressContainer.appendChild(highlightSpan);
    addressContainer.appendChild(createSearchLinks(match));

    return addressContainer.outerHTML;
  });

  container.appendChild(textSpan);
  node.parentNode.replaceChild(container, node);
  processedNodes.add(container);
}

function processAddresses(root = document.body) {
  const walker = document.createTreeWalker(
    root,
    NodeFilter.SHOW_TEXT,
    {
      acceptNode: (node) => {
        // Skip nodes that are in scripts, styles, or have already been processed
        if (node.parentElement?.tagName?.match(/^(SCRIPT|STYLE)$/i) ||
          processedNodes.has(node.parentElement)) {
          return NodeFilter.FILTER_REJECT;
        }
        return NodeFilter.FILTER_ACCEPT;
      }
    },
    false
  );

  const nodesToProcess = [];
  let node;
  while (node = walker.nextNode()) {
    nodesToProcess.push(node);
  }

  // Process nodes in reverse order
  nodesToProcess.reverse().forEach(processNode);
}

// Initial processing
processAddresses();

// Debounced observer callback
const debouncedProcess = debounce((mutations) => {
  mutations.forEach(mutation => {
    mutation.addedNodes.forEach(node => {
      if (node.nodeType === Node.ELEMENT_NODE) {
        processAddresses(node);
      }
    });
  });
}, 250);

// Set up the observer with more specific options
const observer = new MutationObserver(debouncedProcess);

observer.observe(document.body, {
  childList: true,
  subtree: true,
  characterData: false,
  attributes: false
});