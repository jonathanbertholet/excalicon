async function configureGlobalPanel() {
  await chrome.sidePanel.setOptions({ path: "sidepanel.html", enabled: true });
  await chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });
}

function reportError(error) {
  console.error("Excalicon side panel error", error);
}

function configureGlobalPanelSafely() {
  configureGlobalPanel().catch(reportError);
}

chrome.runtime.onInstalled.addListener(() => {
  configureGlobalPanelSafely();
});

chrome.runtime.onStartup.addListener(() => {
  configureGlobalPanelSafely();
});

chrome.action.onClicked.addListener(async (tab) => {
  try {
    await configureGlobalPanel();

    if (tab.windowId !== undefined) {
      await chrome.sidePanel.open({ windowId: tab.windowId });
    } else if (tab.id !== undefined) {
      await chrome.sidePanel.open({ tabId: tab.id });
    } else {
      await chrome.sidePanel.open({});
    }
  } catch (error) {
    reportError(error);
  }
});

configureGlobalPanelSafely();
