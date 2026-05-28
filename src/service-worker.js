async function configureGlobalPanel() {
  await chrome.sidePanel.setOptions({
    path: "sidepanel.html",
    enabled: true,
  });
}

chrome.runtime.onInstalled.addListener(() => {
  configureGlobalPanel();
});

chrome.runtime.onStartup.addListener(() => {
  configureGlobalPanel();
});

chrome.action.onClicked.addListener(async (tab) => {
  await configureGlobalPanel();
  await chrome.sidePanel.open({ windowId: tab.windowId });
});

configureGlobalPanel();
