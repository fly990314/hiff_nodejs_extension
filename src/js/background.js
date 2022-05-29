'use strict';

var hiff = require('../lib/index.js');
var content_in_background = "";

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

    else if (sender_package.type === 'GREETINGS') {
      var return_greeting_msg = `Hi, in background, try to send message.`;

      console.log(sender_package.payload.message);
      return_sender_response( { msg: return_greeting_msg } );
    }

    else if (sender_package.type === 'Prepare_Get_CurrentHTML_In_MainPanel') {
      var return_greeting_msg = `return sender: Hi, in background, prepare to get current HTML..`;

      chrome.tabs.query({ active: true }, tabs => {
        const tabID = tabs[0].id
        console.log(tabs)
        chrome.tabs.sendMessage(
          tabID,
          {
            type: 'Get_CurrentHTML_In_Background',
            payload:{ message: 'sender in backgroound: want to get current html.' }
          },
          return_sender_tab_response => {
            content_in_background = return_sender_tab_response.content;
            console.log(content_in_background);
            // console.log("Finish current html:" +  return_sender_tab_response.content);
          }
        );
      });

      console.log(sender_package.payload.message);
      //return 'return_sender_response' object to sender.
      return_sender_response( { msg: return_greeting_msg } );
    }

    else if (sender_package.type === 'Get_HTML_In_Contentjs') {
      console.log("to background.js.")
      chrome.runtime.sendMessage(
        {
            type: 'Finish_Content_In_Background',
            payload:{ message: 'Finish Content In Background', result:"Finish"}
        },
        response => { console.log(response.msg)}
      );

      return_sender_response( { msg: "msg" } );
    }

    
    
});