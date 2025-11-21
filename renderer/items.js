console.log('[items.js] Script loaded');
// Display item and sub-item images/names in #item-display after search
window.displayItemAndSubItems = function (
  formId = "item-form",
  inputId = "item-name",
  displayId = "item-display"
) {
  function attach() {
    console.log('[displayItemAndSubItems] Attaching event listener');
    const form = document.getElementById(formId);
    const itemInput = document.getElementById(inputId);
    const displayDiv = document.getElementById(displayId);
    if (!form || !itemInput || !displayDiv) return;

    form.addEventListener("submit", async (e) => {
      console.log('[displayItemAndSubItems] Form submit event');
      // stop form from reloading the window
      e.preventDefault();

      const raw = itemInput.value.trim();
      if (!raw) return;

      const itemUrlName = raw.toLowerCase().replace(/\s+/g, "_");
      const data = await window.getItemDetailsWithImages(itemUrlName);

      // Do not display anything in #item-display
      displayDiv.innerHTML = "";
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', attach);
  } else {
    attach();
  }
};
        displayDiv.innerHTML = html;

// --------------------------------------------------
// Helper: normalize icon URLs from warframe.market API
// --------------------------------------------------
function makeIconUrl(path) {
  if (!path) return null;

  // If API already gave a full URL, just use it
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  // If it starts with "/", it's already rooted
  // (usually "/static/assets/…") -> just add domain
  if (path.startsWith("/")) {
    return `https://warframe.market${path}`;
  }

  // Otherwise assume it's a relative like "icons/en/…"
  // -> prefix the static assets root
  return `https://warframe.market/static/assets/${path}`;
}

// --------------------------------------------------
// Fetch item details (main + sub-items) from API
// --------------------------------------------------
async function getItemDetailsWithImages(itemUrlName) {
  const apiUrl = `https://api.warframe.market/v1/items/${itemUrlName}`;
  const result = { main: null, subs: [] };

  try {
    const res = await fetch(apiUrl);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const data = await res.json();
    const item = data.payload?.item;
    console.log('[getItemDetailsWithImages] API item:', item);
    if (!item) return result;

    // main item (set object itself)
    const iconUrl = makeIconUrl(item.icon);
    console.log('[getItemDetailsWithImages] main icon:', item.icon, '->', iconUrl);
    result.main = {
      name: item.item_name,
      icon: iconUrl,
    };

    // components / sub-items
    if (item.items_in_set && Array.isArray(item.items_in_set)) {
      result.subs = item.items_in_set.map((sub) => ({
        name: sub.en?.item_name || sub.item_name,
        icon: makeIconUrl(sub.icon),
      }));
    }

    return result;
  } catch (err) {
    console.error("Item fetch error:", err);
    return result;
  }
}

window.getItemDetailsWithImages = getItemDetailsWithImages;
