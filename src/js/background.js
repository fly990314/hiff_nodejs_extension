'use strict';

const hiff = require('../hiff/lib/index.js');
const {parse, stringify} = require('flatted/cjs');
var content_start_in_background = "";
var content_end_in_background = "";

var is_display_option_buffer = false;

var get_after_compare_html = function (){
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
            content_end_in_background = return_sender_tab_response.compare_after_content;
            // console.log(content_end_in_background);
          }
        );
      }
  );
};

var wait_after_compare_data_and_finish_compare_and_return = function () {
  if( content_end_in_background === "" ) 
  {
      setTimeout(() => { wait_after_compare_data_and_finish_compare_and_return(); }, 1000); 
  } 
  else
  {
    // hiff比較時，會把script類型刪除, 並看使用者需不需要用到style屬性
    let start_string =  content_start_in_background.replace(/\n/g, "").replace(/    /g, "");
    let end_string =  content_end_in_background.replace(/\n/g, "").replace(/    /g, "");
    let result = hiff.compare(start_string, end_string, {ignoreStyleAttribute: is_display_option_buffer});

    chrome.runtime.sendMessage
    (
      {
        type: 'return_compare_result_to_mainPanel',
        payload:{ senderLocation: 'background', message: 'we compare over and return result to mainPanel.' },
        compareResult: stringify(result)
      },
      response => { }
      );
  }
}

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
    is_display_option_buffer = sender_package.payload.hiffOption

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
              content_start_in_background = return_sender_tab_response.compare_before_content; 
              // console.log(content_start_in_background);
            }
          );
        }
    );
    return_sender_response( { } );
  }

  else if ( sender_package.type === 'need_to_save_current_html in background and start to compare' ) 
  {
    console.log("start to save second html.")

    get_after_compare_html();

    wait_after_compare_data_and_finish_compare_and_return();

    return_sender_response( { } );
  }
});

// window.onerror = function(message, source, lineno, colno, error) {
//   console.log(message);
// }