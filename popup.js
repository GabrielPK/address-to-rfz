document.getElementById('actionButton').addEventListener('click', async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    function: () => {
      const addressRegex = /\b(\d+\s+[A-Za-z]{2}\s+\d+(?:st|ST|nd|ND|rd|RD|th|TH)?\s+(?:way|WAY|street|st|avenue|ave|road|rd|boulevard|blvd|lane|ln|drive|dr|court|ct|circle|cir|place|pl))\s*(?:[,.]?\s*([A-Za-z\s]+)[,.]?\s*([A-Z]{2})\s*(\d{5}(?:-\d{4})?))?\b/gi;

      function createSearchLinks(address) {
        // Format address for URL encoding
        const encodedAddress = encodeURIComponent(address.trim());

        // Create links container
        const linksDiv = document.createElement('div');
        linksDiv.style.marginTop = '5px';
        linksDiv.style.marginBottom = '5px';

        // Zillow link
        const zillowLink = document.createElement('a');
        zillowLink.href = `https://www.zillow.com/homes/${encodedAddress}_rb/`;
        zillowLink.textContent = 'Search Zillow';
        zillowLink.target = '_blank';
        zillowLink.style.marginRight = '10px';
        zillowLink.style.color = '#006AFF';

        // Redfin link
        const redfinLink = document.createElement('a');
        redfinLink.href = `https://www.redfin.com/search?q=${encodedAddress}`;
        redfinLink.textContent = 'Search Redfin';
        redfinLink.target = '_blank';
        redfinLink.style.color = '#A52B2B';

        linksDiv.appendChild(zillowLink);
        linksDiv.appendChild(redfinLink);

        return linksDiv;
      }

      // Walk through all text nodes in the document
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

      // Process nodes in reverse order to not affect the positions of other matches
      nodesToProcess.reverse().forEach(node => {
        const container = document.createElement('div');
        container.style.display = 'inline-block';

        // Create text content with highlighted address
        const textSpan = document.createElement('span');
        textSpan.innerHTML = node.textContent.replace(addressRegex, (match) => {
          const highlightSpan = document.createElement('span');
          highlightSpan.style.color = '#2E7D32';
          highlightSpan.style.fontWeight = 'bold';
          highlightSpan.textContent = match;

          // Create container for address and links
          const addressContainer = document.createElement('div');
          addressContainer.appendChild(highlightSpan);
          addressContainer.appendChild(createSearchLinks(match));

          return addressContainer.outerHTML;
        });

        container.appendChild(textSpan);
        node.parentNode.replaceChild(container, node);
      });

      // Add a small notification
      const notification = document.createElement('div');
      notification.style.position = 'fixed';
      notification.style.bottom = '20px';
      notification.style.right = '20px';
      notification.style.padding = '10px';
      notification.style.backgroundColor = '#4CAF50';
      notification.style.color = 'white';
      notification.style.borderRadius = '5px';
      notification.style.zIndex = '10000';
      notification.textContent = 'Addresses detected and linked to real estate sites!';

      document.body.appendChild(notification);
      setTimeout(() => notification.remove(), 3000);
    }
  });
});