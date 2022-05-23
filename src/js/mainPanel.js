// 'use strict';

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
                                message: 'Hello, in mainPanel. we need to perpare compare.',
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
                                message: 'Hello, in mainPanel. we need to end compare.',
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
                                message: 'Hello, in mainPanel. we need to reset.',
                            },
                },
                response => 
                {
                    console.log(response.msg);  //unstable
                }
            );
          }
);

// example code

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

// chrome.runtime.sendMessage(
//   callback: function,
// )
// callback -> (extensionId?: string, message: any, options?: object, callback?: function,)) => boolean | undefined

