async function updateStorage({ format, issueUrl, message, pages, $button }) {
  await chrome.storage.sync.set({ format, issueUrl, message, pages });
  const previousLabel = $button.textContent;

  $button.textContent = messages.SAVED;
  $button?.classList.add("success");

  setTimeout(() => {
    $button.textContent = previousLabel;
    $button?.classList.remove("success");
  }, 2000);
}

async function main() {
  const $format = /** @type {HTMLInputElement} */ ($("#format"));
  const $issueUrl = /** @type {HTMLInputElement} */ ($("#issueUrl"));
  const $message = /** @type {HTMLTextAreaElement} */ ($("#message"));
  const $pages = /** @type {HTMLTextAreaElement} */ ($("#pages"));
  const $settingsForm = /** @type {HTMLFormElement} */ ($("#settingsForm"));
  const $saveButton = /** @type {HTMLButtonElement} */ ($("#save"));
  const $restoreButton = /** @type {HTMLButtonElement} */ ($("#restore"));

  function updateFormControls(data) {
    if (data.format) {
      $format.value = data.format;
    }
    if (data.issueUrl) {
      $issueUrl.value = data.issueUrl;
    }
    if (data.message) {
      $message.value = data.message;
    }
    if (data.pages) {
      $pages.value = data.pages.join("\n");
    }
  }

  $settingsForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const format = $format.value.trim();
    const issueUrl = $issueUrl.value.trim();
    const message = $message.value.trim();
    const pages = $pages.value
      .split("\n")
      .map((page) => page.trim())
      .filter((page) => page);

    await updateStorage({
      format,
      issueUrl,
      message,
      pages,
      $button: $saveButton,
    });
  });

  $restoreButton.addEventListener("click", async (event) => {
    event.preventDefault();
    updateFormControls(defaultSettings);
    await updateStorage({ ...defaultSettings, $button: $restoreButton });
  });

  const data = await chrome.storage.sync.get(["loaded"]);
  if (data.loaded) {
    const data = await chrome.storage.sync.get([
      "format",
      "issueUrl",
      "message",
      "pages",
    ]);
    updateFormControls(data);
  } else {
    await chrome.storage.sync.set({ ...defaultSettings, loaded: true });
    updateFormControls(defaultSettings);
  }
}

document.addEventListener("DOMContentLoaded", main);
