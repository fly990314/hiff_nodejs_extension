'use strict';

// With background scripts you can communicate with popup
// and contentScript files.
// For more information on background script,
// See https://developer.chrome.com/extensions/background_pages

var hiff = require('../lib/index.js');


chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'START_COMPARE') {
    const message = `Hi, in background, we need to prepare to comparedI am from Background. It's great to hear from you.`;

    // Log message coming from the `request` parameter
    console.log(request.payload.message);
    // Send a response message
    sendResponse({
      message,
    });
  }
});

// var hiff = require('../lib/index.js');


// chrome.runtime.onMessage.addListener( (sender_package, sender, runturn_sender_response) => {
//   if (sender_package.type === 'START_COMPARE') {
//     const runturn_sender_msg = 'Hi, in background, we finished compared html.';
//     // Log message coming from the `request` parameter
//     console.log( "Background recieve msg: " + sender_package.payload.message );
//     // Send a response message
//     sendResponse({
//       runturn_sender_msg,
//     });
//   }
// });

// // chrome.runtime.onMessage.addListener(
// //   callback: function,
// // )
// // callback -> (message: any, sender: MessageSender, sendResponse: function) => boolean | undefined

