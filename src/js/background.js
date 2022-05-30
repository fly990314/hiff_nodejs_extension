'use strict';

var hiff = require('../lib/index.js');
var content_start_in_background = "";
var content_end_in_background = "";

chrome.runtime.onMessage.addListener( 
  (sender_package, sender, return_sender_response) => 
{
  if (sender_package.type === 'GREETINGS') {
    let return_greeting_msg = `Hi, in background, try to send message.`;

    console.log(sender_package.payload.message);
    return_sender_response( { msg: return_greeting_msg } );
  }

  else if (sender_package.type === 'need_to_save_current_html in background') 
  {
    let return_sender_startCompare_msg = 'Hi, in background, we finished compared html with start.';
    content_start_in_background = "";
    content_end_in_background = "";

    console.log( sender_package.payload.message );
    
    chrome.tabs.query
    (
      { active: true }, 
      tabs => 
        {
          const tabID = tabs[0].id;
          chrome.tabs.sendMessage
          (
            tabID,
            {
              type: 'need_to_get_current_html_and_save_in_background',
              payload:{ senderLocation: 'background', message: 'we need to get current html, save in background and wait to end compare.' }
            },
            return_sender_tab_response => { 
              content_start_in_background = return_sender_tab_response.content; 
              console.log(content_start_in_background);
            }
          );
        }
    );
    return_sender_response( { } );
  }

  else if ( sender_package.type === 'need_to_save_current_html in background and start to compare' ) 
  {
    console.log("start to save second html.")

    var return_result = function checkFlag() {
      if( content_end_in_background === "" ) 
      {
          setTimeout(() => { checkFlag(); }, 1000); 
      } 
      else 
      {
        chrome.runtime.sendMessage
        (
          {
            type: 'return_compare_result_to_mainPanel',
            payload:{ senderLocation: 'background', message: 'we compare over and return result to mainPanel.' }
          },
          response => { }
          );
      }
    }

    chrome.tabs.query
    (
      { active: true }, 
      tabs => 
        {
          const tabID = tabs[0].id;
          chrome.tabs.sendMessage
          (
            tabID,
            {
              type: 'need_to_get_current_html_and_compare HTML',
              payload:{ senderLocation: 'background', message: 'we need to get current html, and compate with HTML of before and after.' }
            },
            return_sender_tab_response => 
            { 
              content_end_in_background = return_sender_tab_response.content;
              console.log(content_end_in_background);
            }
          );
        }
    );

    return_result();

    return_sender_response( { } );
  }
});