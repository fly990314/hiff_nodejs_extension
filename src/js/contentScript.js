'use strict';

// const pageTitle = document.head.getElementsByTagName('title')[0].innerHTML;
// console.log(
//   `Page title is: '${pageTitle}' - evaluated by Chrome extension's 'contentScript.js' file`
// );

// Communicate with background file by sending a message
chrome.runtime.sendMessage(
  {
    type: 'GREETINGS',
    payload: {
      message: 'Hello, my name is Con. I am from ContentScript.',
    },
  },
  response => {
    console.log(response.msg);
  }
);

// Listen for message
chrome.runtime.onMessage.addListener((sender_package, sender, return_sender_response) => {
  if (sender_package.type === 'COUNT') {
    console.log(`Current count is ${request.payload.count}`);
    return_sender_response({});
  }

  else if (sender_package.type === 'GetCurrentHTMLInPopup') {
    let html = document.body.innerHTML;
    console.log("in background click pop element.");
    return_sender_response( {content: html} );
  }

  else if (sender_package.type === 'Get_CurrentHTML_In_Background') {
    let html = document.body.innerHTML;
    console.log("in background click pop element.");
    return_sender_response( {content: html} );
  }

});