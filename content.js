function generateMessage({ format, issueUrl, message, prLink }) {
  try {
    const $prTitle = $(".js-issue-title");
    const prTitle = $prTitle?.textContent ?? "";
    const issueId = prTitle?.match(new RegExp(format, "i"))?.[1] ?? "";
    return message
      .replace(/<prTitle>/g, prTitle.trim())
      .replace(/<prLink>/g, prLink.trim())
      .replace(/<issueUrl>/g, issueUrl.trim())
      .replace(/<issueId>/g, issueId.trim());
  } catch (error) {
    return "Code review message could not be generated";
  }
}

function createAskButton({ format, issueUrl, message }) {
  const $askButton = document.createElement("button");
  $askButton.textContent = messages.TITLE;
  $askButton.classList.add(
    "ask-for-code-review-button",
    "flex-md-order-2",
    "Button--secondary",
    "Button--small",
    "Button",
    "m-0",
    "mr-md-0",
  );
  $askButton.addEventListener("click", () => {
    const prLink = window.location.href;
    const reviewRequest = generateMessage({
      format,
      issueUrl,
      message,
      prLink,
    });

    navigator.clipboard.writeText(reviewRequest).then(() => {
      $askButton.textContent = messages.COPIED;
      $askButton.classList.remove("Button--secondary");
      $askButton.classList.add("Button--primary");

      setTimeout(() => {
        $askButton.textContent = messages.TITLE;
        $askButton.classList.add("Button--secondary");
        $askButton.classList.remove("Button--primary");
      }, 2000);
    });
  });
  return $askButton;
}

function isPullRequestProfile(url) {
  return url.includes("/pull/");
}

function isAskForReviewButtonVisible() {
  return $(".ask-for-code-review-button") !== null;
}

function isPullRequestTitleVisible() {
  return $(".js-issue-title") !== null;
}

function isPullRequestIsOpen() {
  const $prState = $(".State");
  return $prState && $prState.textContent.trim() === "Open";
}

function addButton($button) {
  const $header = $(".gh-header-actions");
  if ($header) {
    $header.insertBefore($button, $header.children[1].nextSibling);
  }
}

function setup(data) {
  const format = data.format;
  const issueUrl = data.issueUrl;
  const message = data.message;
  const pages = data.pages || [];
  const currentPage = window.location.href;
  const areValidDomain = pages.some((page) => currentPage.includes(page));
  const isOnPullRequestUrl = isPullRequestProfile(window.location.pathname);
  const isButtonAlreadyPresent = isAskForReviewButtonVisible();
  const isOpen = isPullRequestIsOpen();
  const shouldAttach =
    areValidDomain && isOnPullRequestUrl && isOpen && !isButtonAlreadyPresent;

  if (shouldAttach) {
    const $askButton = createAskButton({ format, issueUrl, message });
    addButton($askButton);
  }
}

async function loadData() {
  const data = await chrome.storage.sync.get([
    "loaded",
    "format",
    "issueUrl",
    "message",
    "pages",
  ]);
  if (data.loaded) {
    return data;
  } else {
    const newData = { loaded: true, ...defaultSettings };
    await chrome.storage.sync.set(newData);
    return newData;
  }
}

async function main() {
  const data = await loadData();
  setup(data);
}

let currentUrl = window.location.href;

function handleNavigation() {
  if (window.location.href !== currentUrl) {
    currentUrl = window.location.href;
    const isOnPullRequestUrl = isPullRequestProfile(currentUrl);

    if (!isOnPullRequestUrl) {
      return;
    }

    const waitForDOM = () => {
      if (isPullRequestTitleVisible()) {
        main();
      } else {
        setTimeout(waitForDOM, 50);
      }
    };

    setTimeout(waitForDOM, 100);
  }
}

const observer = new MutationObserver(() => handleNavigation());
observer.observe(document, {
  childList: true,
  subtree: true,
});

main();
