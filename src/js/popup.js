'use strict';

import '../css/popup.css';

(function() {
  // We will make use of Storage API to get and store `count` value
  // More information on Storage API can we found at
  // https://developer.chrome.com/extensions/storage

  // To get storage access, we have to mention it in `permissions` property of manifest.json file
  // More information on Permissions can we found at
  // https://developer.chrome.com/extensions/declare_permissions
  const counterStorage = {
    get: cb => {
      chrome.storage.sync.get(['count'], result => {
        cb(result.count);
      });
    },
    set: (value, cb) => {
      chrome.storage.sync.set(
        {
          count: value,
        },
        () => {
          cb();
        }
      );
    },
  };

  function setupCounter(initialValue = 0) {
    document.getElementById('counter').innerHTML = initialValue;

    document.getElementById('incrementBtn').addEventListener('click', () => {
      updateCounter({
        type: 'INCREMENT',
      });
    });

    document.getElementById('decrementBtn').addEventListener('click', () => {
      updateCounter({
        type: 'DECREMENT',
      });
    });
  }

  function updateCounter({ type }) {
    counterStorage.get(count => {
      let newCount;

      if (type === 'INCREMENT') {
        newCount = count + 1;
      } else if (type === 'DECREMENT') {
        newCount = count - 1;
      } else {
        newCount = count;
      }

      counterStorage.set(newCount, () => {
        document.getElementById('counter').innerHTML = newCount;

        // Communicate with content script of
        // active tab by sending a message
        chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
          const tab = tabs[0];
          console.log(tab)
          chrome.tabs.sendMessage(
            tab.id,
            {
              type: 'COUNT',
              payload: {
                count: newCount,
              },
            },
            response => {
              console.log('Current count value passed to contentScript file');
            }
          );
        });
      });
    });
  }

  function restoreCounter() {
    // Restore count value
    
    // example
    // var html1 = "<button id='123'>test</button>";
    // var html2 = "<button id='123'>test-change</button>";
    // console.log(hiff.compare(html1, html2));

    counterStorage.get(count => {
      if (typeof count === 'undefined') {
        // Set counter value as 0
        counterStorage.set(0, () => {
          setupCounter(0);
        });
      } else {
        setupCounter(count);
      }
    });
  }

  document.addEventListener('DOMContentLoaded', restoreCounter);

  // Communicate with background file by sending a message
  chrome.runtime.sendMessage(
    {
      type: 'GREETINGS',
      payload: {
        message: 'Hello, my name is Pop. I am from Popup.',
      },
    },
    response => {
      console.log(response.msg);
    }
  );

  var startCompare_btn_listener = document.getElementById("startCompare");
  var endCompare_btn_listener = document.getElementById("endCompare");
  var reset_btn_listener = document.getElementById("reset");
  
  
  startCompare_btn_listener.addEventListener('click', 
      () => {
              chrome.runtime.sendMessage
              (
                  {
                      type: 'START_COMPARE',
                      payload:{
                                  message: 'Hello, in popup. we need to perpare compare.',
                              },
                  },
                  response => 
                  {
                      console.log(response.msg);  //unstable
                  }
              );
            }
  );
  
  endCompare_btn_listener.addEventListener('click', 
      () => {
              chrome.runtime.sendMessage
              (
                  {
                      type: 'END_COMPARE',
                      payload:{
                                  message: 'Hello, in popup. we need to end compare.',
                              },
                  },
                  response => 
                  {
                      console.log(response.msg);  //unstable
                  }
              );
            }
  );
  
  reset_btn_listener.addEventListener('click', 
      () => {
              chrome.runtime.sendMessage
              (
                  {
                      type: 'RESET',
                      payload:{
                                  message: 'Hello, in popup. we need to reset.',
                              },
                  },
                  response => 
                  {
                      console.log(response.msg);  //unstable
                  }
              );
            }
  );

  var get_current_html_btn = document.getElementById("get_current_html");
  get_current_html_btn.addEventListener('click', 
  () => 
    {
      chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
        const tab = tabs[0];
        console.log(tab)
        chrome.tabs.sendMessage(
          tab.id,
          {
            type: 'GetCurrentHTMLInPopup',
            message:"Click Get current html btn."
          },
          response => {
            console.log("Finish current html:" +  response.content);
          }
        );
      });
    }
  );
})();