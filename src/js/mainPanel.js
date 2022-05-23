// 'use strict';

// const startCompare_btn_listener = document.getElementById("startCompare");
// const endCompare_btn_listener = document.getElementById("endCompare");
// const reset_btn_listener = document.getElementById("reset");




// chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
//     if (request.type === 'GREETINGS') {
//       const message = `Hi ${
//         sender.tab ? 'Con' : 'Pop'
//       }, my name is Bac. I am from Background. It's great to hear from you.`;
  
//       // Log message coming from the `request` parameter
//       console.log(request.payload.message);
//       // Send a response message
//       sendResponse({
//         message,
//       });
//     }
//   });

//   chrome.runtime.sendMessage(
//     {
//       type: 'GREETINGS',
//       payload: {
//         message: 'Hello, my name is Pop. I am from Popup.',
//       },
//     },
//     response => {
//       console.log(response.message);
//     }
//   );
// })();