let initialized = false;
let enhancedNodes = [];
const observerConfig = { attributes: false, childList: true, subtree: true };
let toast = document.createElement('div');
toast.setAttribute('id', 'momane_toast');
toast.setAttribute(
  'style',
  'color: white;z-index:65536;display:none;position: fixed;top: 5px;right: 10px;width: 400px;padding: 10px;background-color: gray;border: 1px solid gray;box-shadow: black 1px 1px 10px 1px;font-size: 13px;'
);
document.body.appendChild(toast);

window.addEventListener(
  'message',
  function (message) {
    if (self === top) {
      let detail = message.data;
      if (detail.cmd === 'showToast') {
        showToast(' ');
      }
    } else {
      sendMessageToTop(message.data);
    }
  },
  false
);

window.addEventListener('click', (event) => {
  if (!event.target.classList.contains('fasterlaw-icon')) {
    document
      .querySelectorAll('.fasterlaw-actions-container')
      .forEach((container) => container.classList.remove('open'));
  }
});

window.addEventListener('wheel', (event) => {
  document
    .querySelectorAll('.fasterlaw-actions-container')
    .forEach((container) => container.classList.remove('open'));
});

const observerCallback = function (mutationsList, observer) {
  if (observer) {
    observer.disconnect();
  }

  let isNewUI = false;
  let isSearchResult = false;

  const ifRewrite =
    document.querySelector('#momane_enhance').getAttribute('data-value') ===
    'true';
  if (!ifRewrite) {
    return;
  }

  // Checks old UI selector
  let nodes = document.querySelectorAll("a[e-form='documentNameForm']");

  // Checks new UI selector
  if (nodes.length < 1) {
    nodes = document.querySelectorAll('tr a[href*="/download"]');

    if (nodes.length > 0) {
      isNewUI = true;
    }
  }

  // Checks new UI search results selector
  if (nodes.length < 1 && !isNewUI) {
    nodes = document.querySelectorAll('tr a[href*="/details"]');

    if (nodes.length > 0) {
      isSearchResult = true;
    }
  }

  // Parse old UI
  if (nodes.length > 0 && !isNewUI && !isSearchResult) {
    nodes.forEach((node) => {
      if (enhancedNodes.includes(node)) {
        return;
      }

      let scope = window.angular.element(node).scope();
      let p = node.parentNode;
      const docID = getDocID(node);
      const link = p.querySelector('.external-application-links');

      if (!p.querySelector('.momane_out')) {
        let fasterLawIcon = createFasterLawIcon(docID, link, false);
        p.prepend(fasterLawIcon);
      }
      scope.itemClicked = newDownloadItem(scope.itemClicked);
    });
  }

  // Parse new UI
  if (nodes.length > 0 && isNewUI) {
    nodes.forEach((node) => {
      if (enhancedNodes.includes(node)) {
        return;
      }

      const p = node.parentNode;
      const siblingNode = p.parentNode.querySelector('.launcher-icon');
      const pTd = node.closest('td');
      const pTr = pTd.closest('tr');
      const targetViewElement = pTr.querySelector('cc-document-actions')
        .parentNode;
      const docID = p.getAttribute('id');
      const link = p.parentNode.querySelector('.fa-external-link-square');

      targetViewElement.style.display = 'flex';
      targetViewElement.style.alignItems = 'center';
      targetViewElement.style.overflow = 'visible';
      targetViewElement.style.position = 'relative';

      if (!p.querySelector('.momane_out')) {
        let fasterLawIcon = createFasterLawIcon(docID, link, true);
        fasterLawIcon.classList.add('new-ui');
        targetViewElement.append(fasterLawIcon);
      }

      node.addEventListener('click', (event) => {
        let IsDisabled =
          document
            .querySelector('#momane_ifOpen')
            .getAttribute('data-value') === 'true';
        if (!IsDisabled) {
          event.preventDefault();
          event.stopPropagation();
          window.location = `alphadrive://localhost/Remoting/custom_actions/documents/edit?subject_url=/api/v4/documents/${docID}`;
        }
      });

      if (siblingNode) {
        siblingNode.addEventListener('click', (event) => {
          let IsDisabled =
            document
              .querySelector('#momane_ifOpen')
              .getAttribute('data-value') === 'true';
          if (!IsDisabled) {
            event.preventDefault();
            event.stopPropagation();
            window.location = `alphadrive://localhost/Remoting/custom_actions/documents/edit?subject_url=/api/v4/documents/${docID}`;
          }
        });
        if (siblingNode.childNodes.length > 0) {
          siblingNode.childNodes.forEach((siblingChild) => {
            siblingChild.addEventListener('click', (event) => {
              let IsDisabled =
                document
                  .querySelector('#momane_ifOpen')
                  .getAttribute('data-value') === 'true';
              if (!IsDisabled) {
                event.preventDefault();
                event.stopPropagation();
                window.location = `alphadrive://localhost/Remoting/custom_actions/documents/edit?subject_url=/api/v4/documents/${docID}`;
              }
            });
          });
        }
      }
    });
  }

  // Parse new ui search results
  if (nodes.length > 0 && isSearchResult) {    

    nodes.forEach((node) => {      
      const isAlreadyEnhanced = enhancedNodes.includes(node);

      if (isAlreadyEnhanced) {
        return;
      }

      console.log(node);

      const parentNode = node.parentNode;
      const docIdRegEx = /{\s?id:\s?(\d+)\s?}/gm;
      const docIdAttr = node.getAttribute('ui-sref');
      const docIdMatch = docIdRegEx.exec(docIdAttr);
      const docId = docIdMatch[1];
      const fasterLawIcon = createFasterLawIcon(docId, node, true);
      
      node.addEventListener('mousedown', (event) => {
        let IsDisabled =
          document
            .querySelector('#momane_ifOpen')
            .getAttribute('data-value') === 'true';
        if (!IsDisabled) {
          event.preventDefault();
          event.stopPropagation();
          window.location = `alphadrive://localhost/Remoting/custom_actions/documents/edit?subject_url=/api/v4/documents/${docId}`;
        }
      });

      parentNode.style.display = 'flex';
      parentNode.style.alignItems = 'center';
      fasterLawIcon.style.margin = 0;
      fasterLawIcon.style.marginLeft = '8px';
      parentNode.append(fasterLawIcon);
    });
  }

  if (nodes.length > 0) {
    initialized = true;
    nodes.forEach((node) => enhancedNodes.push(node));
  }

  if (observer) {
    observer.observe(document.body, observerConfig);
  }
};

const initInterval = setInterval(initialize, 1500);

function initialize() {
  observerCallback();

  if (initialized) {
    const observer = new MutationObserver(observerCallback);
    observer.observe(document.body, observerConfig);
    clearInterval(initInterval);
  }
}

function createFasterLawIcon(docID, link, isNewUi) {
  const fasterLawIcon = document.createElement('div');
  fasterLawIcon.classList.add('fasterlaw-icon');

  const actionsContainer = document.createElement('div');
  actionsContainer.classList.add('fasterlaw-actions-container', 'new-ui');

  /**
   * OPEN WITH FASTER SUITE ACTION
   */
  const openWithFasterLawAction = document.createElement('div');
  openWithFasterLawAction.classList.add('action');
  openWithFasterLawAction.setAttribute(
    'title',
    `Open this document with Faster Suite`
  );
  openWithFasterLawAction.innerHTML =
    '<div class="action-icon faster-suite"></div> Open with Faster Suite';
  openWithFasterLawAction.addEventListener('click', function () {
    window.location = `alphadrive://localhost/Remoting/custom_actions/documents/edit?subject_url=/api/v4/documents/${docID}`;
  });

  /**
   * OPEN WITH CLIO ACTION
   */
  const openWithClioAction = document.createElement('div');
  openWithClioAction.classList.add('action');
  openWithClioAction.setAttribute(
    'title',
    'Open this document with Clio Launcher'
  );
  openWithClioAction.innerHTML =
    '<div class="action-icon clio"></div> Open with Clio Launcher';
  openWithClioAction.addEventListener('click', function () {
    link.click();
  });

  /**
   * DOWNLOAD ACTION
   */
  const downloadAction = document.createElement('div');
  downloadAction.classList.add('action', 'separator');
  downloadAction.setAttribute('title', 'Download this document');
  downloadAction.innerHTML =
    '<div class="action-icon download"></div> Download';
  downloadAction.addEventListener('click', function () {
    window.open(`https://app.clio.com/iris/documents/${docID}/download`);
  });

  /**
   * LOCATE ACTION
   */
  const LocateAction = document.createElement('div');
  LocateAction.classList.add('action');
  LocateAction.setAttribute(
    'title',
    `Open this document's folder using Faster Suite`
  );
  LocateAction.innerHTML = `<div class="action-icon locate"></div> Locate`;
  LocateAction.addEventListener('click', function () {
    window.location = `alphadrive://localhost/Remoting/custom_actions/documents/locate?subject_url=/api/v4/documents/${docID}`;
  });

  /**
   * COPY LINK WITH FASTER SUITE ACTION
   */
  const copyLinkAction = document.createElement('div');
  copyLinkAction.classList.add('action', 'separator');
  copyLinkAction.setAttribute(
    'title',
    'Copy a link to this document using Faster Suite'
  );
  copyLinkAction.innerHTML = '<div class="action-icon link"></div> Copy Link';
  copyLinkAction.addEventListener('click', function () {
    window.location = `alphadrive://localhost/Remoting/custom_actions/documents/share/link?subject_url=/api/v4/documents/${docID}`;
  });

  /**
   * COMPARE/HISTORY ACTION
   */
  const compareAction = document.createElement('div');
  compareAction.classList.add('action');
  compareAction.setAttribute(
    'title',
    'Compare this document using Faster Suite'
  );
  compareAction.innerHTML =
    '<div class="action-icon compare"></div> Compare / History';
  compareAction.addEventListener('click', function () {
    window.location = `alphadrive://localhost/Remoting/custom_actions/documents/compare?subject_url=/api/v4/documents/${docID}`;
  });

  actionsContainer.appendChild(openWithFasterLawAction);
  actionsContainer.appendChild(openWithClioAction);
  actionsContainer.appendChild(downloadAction);
  actionsContainer.appendChild(LocateAction);
  actionsContainer.appendChild(copyLinkAction);
  actionsContainer.appendChild(compareAction);

  const body = document.body;

  // fasterLawIcon.appendChild(actionsContainer);
  body.appendChild(actionsContainer);

  fasterLawIcon.addEventListener('click', function () {
    document
      .querySelectorAll('.fasterlaw-actions-container')
      .forEach((container) => {
        if (container !== actionsContainer) {
          container.classList.remove('open');
        }
      });
    actionsContainer.classList.toggle('open');
    const rect = fasterLawIcon.getBoundingClientRect();
    const win = fasterLawIcon.ownerDocument.defaultView;
    const extendUp = win.innerHeight - rect.top < 300;

    actionsContainer.style.top = extendUp
      ? rect.top + win.pageYOffset - 200 + 'px'
      : rect.top + win.pageYOffset + 20 + 'px';
    actionsContainer.style.left = rect.left + win.pageXOffset + 'px';
  });

  return fasterLawIcon;
}

function createIcon(name, icon, title, url) {
  let dom = document.createElement('a');
  dom.setAttribute('class', `${name} fa ${icon}`);
  dom.style.cursor = 'pointer';
  dom.style.color = '#2A579A';
  dom.title = title;
  dom.href = url;
  return dom;
}

function newDownloadItem(oldDownloadItem) {
  return function (child) {
    const docId = child.id;
    let IsDisabled =
      document.querySelector('#momane_ifOpen').getAttribute('data-value') ===
      'true';
    if (IsDisabled) {
      window.location = `clio://launcher/edit/${child.id}`;
    } else {
      window.location = `alphadrive://localhost/Remoting/custom_actions/documents/edit?subject_url=/api/v4/documents/${docId}`;
    }
  };
}

function showToast(text) {}

function sendMessageToTop(detail) {
  window.parent.postMessage(detail, '*');
}

function getOutLink(link) {
  try {
    return link.match(/\d+$/)[0];
  } catch (e) {
    return 0;
  }
}

function getDocID(node) {
  try {
    const tr = node.closest('tr');
    const id = tr.getAttribute('id');

    return id.match(/\d+$/)[0];
  } catch (e) {
    return 0;
  }
}
