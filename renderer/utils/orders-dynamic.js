// Dynamic order rendering for Warframe Market Price Monitor
// Fetches real orders from warframe.market and renders buy/sell columns
// Now also fetches the global item list and shows it for selection/autocomplete.

document.addEventListener('DOMContentLoaded', () => {
  const sellContainer = document.getElementById('orders-sell');
  const buyContainer = document.getElementById('orders-buy');
  const form = document.getElementById('item-form');
  const itemInput = document.getElementById('item-name');
  const itemListContainer = document.getElementById('item-list');

  if (!form || !itemInput || !sellContainer || !buyContainer) return;

  // Holds full warframe.market item list
  let allItems = [];

  // -----------------------------
  // Item list fetching + rendering
  // -----------------------------

  // Fetch entire item list from warframe.market
  async function fetchAllItems() {
    const url = 'https://api.warframe.market/v1/items';

    const res = await fetch(url, {
      headers: {
        Platform: 'pc',
        Language: 'en',
        Accept: 'application/json',
      },
    });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }

    const data = await res.json();
    // Payload structure: { payload: { items: { en: [...] } } }
    return data.payload?.items?.en || [];
  }

  // Render a simple list of items (limited for readability)
  function renderItemList(items) {
    if (!itemListContainer) return;

    if (!items || items.length === 0) {
      itemListContainer.innerHTML = `
        <p style="color:#9fbacc;font-size:0.85rem;">
          No items loaded.
        </p>`;
      return;
    }

    const limited = items.slice(0, 50); // avoid dumping hundreds at once
    const html = `
      <ul class="item-list">
        ${limited
          .map(
            (it) => `
          <li class="item-list-entry" data-url-name="${it.url_name}">
            <span class="item-list-name">${it.item_name}</span>
            <span class="item-list-url">${it.url_name}</span>
          </li>`
          )
          .join('')}
      </ul>
    `;
    itemListContainer.innerHTML = html;
  }

  // -----------------------------
  // Helpers for orders
  // -----------------------------

  function niceItemName(urlName) {
    // rubico_prime_set -> Rubico Prime Set
    return urlName
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase());
  }

  function renderOrders(type, orders, itemUrlName) {
    const container = type === 'sell' ? sellContainer : buyContainer;
    const prettyName = niceItemName(itemUrlName);
    if (!container) return;

    // No orders: show a simple message
    if (!orders || orders.length === 0) {
      container.innerHTML = `
        <div class="orders-column">
          <div class="column-tag ${type}">
            Want to ${type.charAt(0).toUpperCase() + type.slice(1)}
          </div>
          <p style="font-size: 0.85rem; color: #9fbacc; margin-top: 8px;">
            No ${type} orders found for <strong>${prettyName}</strong>.
          </p>
        </div>
      `;
      return;
    }

    let html = `<div class="orders-column">`;
    html += `<div class="column-tag ${type}">
      Want to ${type.charAt(0).toUpperCase() + type.slice(1)}
    </div>`;


    // Get the orders per column setting (default to 10 if not set)
    function getOrdersPerColumn() {
      const saved = localStorage.getItem('warframe-monitor-settings');
      const defaultSettings = { ordersPerColumn: 10 };
      const settings = saved ? { ...defaultSettings, ...JSON.parse(saved) } : defaultSettings;
      return settings.ordersPerColumn || 10;
    }
    
    const maxOrders = getOrdersPerColumn();
    // Limit orders based on user setting
    orders.slice(0, maxOrders).forEach((order, idx) => {
      const price = order.platinum;
      const quantity = order.quantity;
      const user = order.user?.ingame_name || order.user?.name || 'Unknown';
      // Button text: if type is 'sell', button says 'Buy'; if 'buy', button says 'Sell'
      const buttonText = type === 'sell' ? 'Buy' : 'Sell';
      html += `
        <article class="order-card">
          <header class="order-header">
            <a href="#" class="order-item-name">${prettyName}</a>
            <span class="order-price">${price}p</span>
          </header>
          <div class="order-meta">
            <span>${quantity}x</span>
            <span class="order-user">by <strong>${user}</strong></span>
          </div>
          <button class="order-btn ${type}" data-user="${user}" data-type="${type}" data-item="${prettyName}" data-price="${price}">
            ${buttonText}
          </button>
        </article>
      `;
    });

    html += `</div>`;
    container.innerHTML = html;

    // Add click event listeners to copy user name to clipboard
    container.querySelectorAll('.order-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const user = btn.getAttribute('data-user');
        const type = btn.getAttribute('data-type');
        const item = btn.getAttribute('data-item');
        const price = btn.getAttribute('data-price');
        // Format message for clipboard
        let msg = '';
        if (type === 'sell') {
          msg = `/w ${user} Hi! I want to buy: "${item}" for ${price} platinum. (warframe.market)`;
        } else {
          msg = `/w ${user} Hi! I want to sell: "${item}" for ${price} platinum. (warframe.market)`;
        }
        // Copy to clipboard
        if (navigator.clipboard) {
          navigator.clipboard.writeText(msg).then(() => {
            showCopyFeedback(btn, 'Copied!');
          });
        } else {
          // fallback
          const temp = document.createElement('input');
          temp.value = msg;
          document.body.appendChild(temp);
          temp.select();
          document.execCommand('copy');
          document.body.removeChild(temp);
          showCopyFeedback(btn, 'Copied!');
        }
      });
    });
  }

  // Show a quick feedback message near the button
  function showCopyFeedback(btn, text) {
    const feedback = document.createElement('span');
    feedback.textContent = text;
    feedback.style.position = 'absolute';
    feedback.style.background = '#222';
    feedback.style.color = '#2fe7ff';
    feedback.style.fontSize = '0.85rem';
    feedback.style.padding = '2px 8px';
    feedback.style.borderRadius = '6px';
    feedback.style.top = '-28px';
    feedback.style.right = '0';
    feedback.style.zIndex = '999';
    feedback.style.pointerEvents = 'none';
    btn.parentElement.style.position = 'relative';
    btn.parentElement.appendChild(feedback);
    setTimeout(() => {
      feedback.remove();
    }, 1200);
  }

  async function fetchOrdersForItem(itemUrlName) {
    const url = `https://api.warframe.market/v1/items/${itemUrlName}/orders`;

    const res = await fetch(url, {
      headers: {
        Platform: 'pc',
        Language: 'en',
        Accept: 'application/json',
      },
    });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }

    const data = await res.json();
    return data.payload?.orders || [];
  }

  // -----------------------------
  // Load item list on startup
  // -----------------------------
  (async () => {
    try {
      allItems = await fetchAllItems();
      renderItemList(allItems);
    } catch (err) {
      console.error('Failed to fetch items:', err);
      if (itemListContainer) {
        itemListContainer.innerHTML = `
          <p style="color:#ff9c9c;font-size:0.85rem;">
            Failed to load item list.
          </p>`;
      }
    }
  })();

  // -----------------------------
  // Autocomplete filtering by input
  // -----------------------------
  itemInput.addEventListener('input', () => {
    if (!allItems || allItems.length === 0) return;

    const q = itemInput.value.toLowerCase().trim();

    if (!q) {
      renderItemList(allItems);
      return;
    }

    const filtered = allItems.filter((it) =>
      it.item_name.toLowerCase().includes(q)
    );

    renderItemList(filtered);
  });

  // Click item from list to fill input
  if (itemListContainer) {
    itemListContainer.addEventListener('click', (e) => {
      const li = e.target.closest('.item-list-entry');
      if (!li) return;

      const nameSpan = li.querySelector('.item-list-name');
      if (nameSpan) {
        itemInput.value = nameSpan.textContent;
        itemInput.focus();
      }
    });
  }

  // -----------------------------
  // Handle form submit (existing logic)
  // -----------------------------

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const raw = itemInput.value.trim();
    if (!raw) return;

    const itemUrlName = raw.toLowerCase().replace(/\s+/g, '_');

    // Get min/max price values
    const minInput = document.getElementById('min-price');
    const maxInput = document.getElementById('max-price');
    const minPrice = minInput && minInput.value ? parseFloat(minInput.value) : null;
    const maxPrice = maxInput && maxInput.value ? parseFloat(maxInput.value) : null;

    // Show loading state
    sellContainer.innerHTML = `
      <div class="orders-column">
        <div class="column-tag sell">Want to Sell</div>
        <p style="font-size: 0.85rem; color: #9fbacc; margin-top: 8px;">
          Loading sell orders…
        </p>
      </div>`;
    buyContainer.innerHTML = `
      <div class="orders-column">
        <div class="column-tag buy">Want to Buy</div>
        <p style="font-size: 0.85rem; color: #9fbacc; margin-top: 8px;">
          Loading buy orders…
        </p>
      </div>`;

    try {
      const allOrders = await fetchOrdersForItem(itemUrlName);

      // Only visible, online/ingame orders
      const visible = allOrders.filter((o) => {
        const status = o.user?.status;
        return (
          o.visible === true &&
          (status === 'ingame' || status === 'online')
        );
      });

      // Split into buy / sell
      let buyOrders = visible.filter((o) => o.order_type === 'buy');
      let sellOrders = visible.filter((o) => o.order_type === 'sell');

      // Filter by min/max price if set
      if (minPrice !== null) {
        buyOrders = buyOrders.filter((o) => o.platinum >= minPrice);
        sellOrders = sellOrders.filter((o) => o.platinum >= minPrice);
      }
      if (maxPrice !== null) {
        buyOrders = buyOrders.filter((o) => o.platinum <= maxPrice);
        sellOrders = sellOrders.filter((o) => o.platinum <= maxPrice);
      }

      // Sort: lowest price first for both buy and sell
      sellOrders.sort((a, b) => a.platinum - b.platinum);
      buyOrders.sort((a, b) => a.platinum - b.platinum);

      // Check for price alerts if notification manager is available
      if (window.notificationManager) {
        const prettyName = niceItemName(itemUrlName);
        
        // Check sell orders for good buying opportunities
        if (sellOrders.length > 0) {
          window.notificationManager.checkPriceAlerts(sellOrders, prettyName, minPrice, maxPrice);
        }
        
        // Check buy orders for good selling opportunities  
        if (buyOrders.length > 0) {
          window.notificationManager.checkPriceAlerts(buyOrders, prettyName, minPrice, maxPrice);
        }
      }

      renderOrders('sell', sellOrders, itemUrlName);
      renderOrders('buy', buyOrders, itemUrlName);
    } catch (err) {
      console.error('Order fetch error:', err);
      sellContainer.innerHTML = `
        <div class="orders-column">
          <div class="column-tag sell">Want to Sell</div>
          <p style="font-size: 0.85rem; color: #ff9c9c; margin-top: 8px;">
            Failed to load orders.
          </p>
        </div>`;
      buyContainer.innerHTML = `
        <div class="orders-column">
          <div class="column-tag buy">Want to Buy</div>
          <p style="font-size: 0.85rem; color: #ff9c9c; margin-top: 8px;">
            Failed to load orders.
          </p>
        </div>`;
    }
  });

  // Initial empty state
  renderOrders('sell', [], 'rubico_prime_set');
  renderOrders('buy', [], 'rubico_prime_set');
});

function toUrlName(raw) {
  return raw
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '_');
}


// Note: module.exports is not needed in browser context
