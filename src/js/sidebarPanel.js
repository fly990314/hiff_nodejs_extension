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
                                message: 'Hello, in sidebarPanel. we need to perpare compare.',
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
                                message: 'Hello, in sidebarPanel. we need to end compare.',
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
                                message: 'Hello, in sidebarPanel. we need to reset.',
                            },
                },
                response => 
                {
                    console.log(response.msg);  //unstable
                }
            );
          }
);