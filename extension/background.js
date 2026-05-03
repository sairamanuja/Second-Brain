// create right-click menu when extension is installed
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "save-to-brain",
    title: "Save to Second Brain",
    contexts: ["page", "link"]
  });
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId !== "save-to-brain") return;

  const data = await chrome.storage.local.get("token");
  if (!data.token) {
    // TODO: show notification that user needs to login
    console.log("not logged in");
    return;
  }

  const url = info.linkUrl || tab.url;
  const title = tab.title || "Untitled";

  let type = "article";
  if (url.includes("twitter.com") || url.includes("x.com")) {
    type = "twitter";
  } else if (url.includes("youtube.com") || url.includes("youtu.be")) {
    type = "youtube";
  }

  try {
    const res = await fetch("http://localhost:3000/api/v1/content", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${data.token}`
      },
      body: JSON.stringify({ link: url, title, type, content: "" })
    });

    if (res.ok) {
      console.log("saved to brain!");
      // TODO: show a success badge on the icon
    } else {
      console.log("failed to save:", res.status);
    }
  } catch (err) {
    console.log("error saving:", err);
  }
});
