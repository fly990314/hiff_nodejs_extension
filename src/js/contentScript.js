'use strict';

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

  else if (sender_package.type === 'need_to_get_current_html_and_save_in_background') {
    let compare_before_html = document.body.innerHTML;
    console.log("finish to get to current HTML.");
    return_sender_response( { compare_before_content: compare_before_html } );
  }

  else if (sender_package.type === 'need_to_get_current_html_and_compare HTML') {
    let compare_after_html = document.body.innerHTML;
    console.log("finish to get to second current HTML.");
    return_sender_response( { compare_after_content: compare_after_html } );
  }

  return true;
});