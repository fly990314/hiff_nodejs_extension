'use strict';

// With background scripts you can communicate with popup
// and contentScript files.
// For more information on background script,
// See https://developer.chrome.com/extensions/background_pages

var hiff = require('../lib/index.js');


// chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
//   if (request.type === 'GREETINGS') {
//     const message = `Hi, in background, we need to prepare to comparedI am from Background. It's great to hear from you.`;

//     // Log message coming from the `request` parameter
//     console.log(request.payload.message);
//     // Send a response message
//     sendResponse({
//       message,
//     });
//   }
// });

chrome.runtime.onMessage.addListener( 
  (sender_package, sender, return_sender_response) => 
  {
    if (sender_package.type === 'START_COMPARE') {
      var return_sender_startCompare_msg = 'Hi, in background, we finished compared html with start.';
      console.log( sender_package.payload.message );

      return_sender_response( { msg: return_sender_startCompare_msg } );
    }
  
    else if (sender_package.type === 'END_COMPARE') {
      var return_sender_endCompare_msg = 'Hi, in background, we finished compared html with end.';
      console.log( sender_package.payload.message );

      return_sender_response( { msg: return_sender_endCompare_msg } );
    }

    else if (sender_package.type === 'RESET') {
      var return_sender_reset_msg = 'Hi, in background, we reset compared result.';
      console.log( sender_package.payload.message );

      return_sender_response( { msg: return_sender_reset_msg } );
    }

    if (sender_package.type === 'GREETINGS') {
      var return_greeting_msg = `Hi, in background, try to send message.`;

      console.log(sender_package.payload.message);
      return_sender_response( { msg: return_greeting_msg } );
    }
  }
);

// chrome.runtime.onMessage.addListener(
//   callback: function,
// )
// callback -> (message: any, sender: MessageSender, sendResponse: function) => boolean | undefined

