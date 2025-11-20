// Dynamic order rendering for Warframe Market Price Monitor
// Fetches real orders from warframe.market and renders buy/sell columns

const rawName = document.getElementById('item-name').value;
const urlName = toUrlName(rawName); // "loki_prime_set"
const apiUrl = `https://api.warframe.market/v1/items/${urlName}/orders`;



document.addEventListener('DOMContentLoaded', () => {
  const sellContainer = document.getElementById('orders-sell');
  const buyContainer = document.getElementById('orders-buy');
  const form = document.getElementById('item-form');
  const itemInput = document.getElementById('item-name');

  if (!form || !itemInput || !sellContainer || !buyContainer) return;

  // Helpers
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

    // Limit to first 10 to keep it tidy
    orders.slice(0, 10).forEach((order) => {
      const price = order.platinum;
      const quantity = order.quantity;
      const user = order.user?.ingame_name || order.user?.name || 'Unknown';

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
          <button class="order-btn ${type}">
            ${type.charAt(0).toUpperCase() + type.slice(1)}
          </button>
        </article>
      `;
    });

    html += `</div>`;
    container.innerHTML = html;
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

  // Handle form submit
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const raw = itemInput.value.trim();
    if (!raw) return;

    const itemUrlName = raw.toLowerCase().replace(/\s+/g, '_');

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

      // Sort: cheapest sell first, highest buy first
      sellOrders.sort((a, b) => a.platinum - b.platinum);
      buyOrders.sort((a, b) => b.platinum - a.platinum);

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
module.exports = { toUrlName };