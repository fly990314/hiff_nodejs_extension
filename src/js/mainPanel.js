// 'use strict';
(function(){
const startCompare_btn_listener = document.getElementById("startCompare");
const endCompare_btn_listener = document.getElementById("endCompare");
const reset_btn_listener = document.getElementById("reset");
const timer_text = document.getElementById("timermsg");

var countInterval;

var add_text_node = function(element, text)
{
    //清除所有element裡面所有節點
    while (element.firstChild) {
        element.removeChild(element.firstChild);
    }
    //開始建立的文字節點
    var element_tag = document.createElement("p");
    var text_tag = document.createTextNode(text); 

    element_tag.appendChild(text_tag);
    element.appendChild(element_tag);
};

startCompare_btn_listener.addEventListener('click', 
    () => 
    {
        var time_showing_function = function(actualTime){
    
            let timer_setting_and_start = function(time)
            {
                let secondsRemaining = time;
                let min = 0;
                let sec = 0;
                countInterval = setInterval
                (
                    function ()
                    {
                        let paddedFormat = function(num) {return num < 10 ? "0" + num : num; };
                        min = parseInt(secondsRemaining / 60);
                        sec = parseInt(secondsRemaining % 60);
                        add_text_node(timer_text, `${paddedFormat(min)}:${paddedFormat(sec)}`);
                        secondsRemaining = secondsRemaining - 1;
                        if (secondsRemaining < 0) 
                        { 
                            clearInterval(countInterval);
                            add_text_node(timer_text, "End")
                         };
                    }, 1000
                );
            };
            timer_setting_and_start(actualTime);
        };

        time_showing_function(3);

        chrome.runtime.sendMessage
        (
            {
                type: 'START_COMPARE',
                payload:{ message: 'Hello, in mainPanel. we need to perpare compare.' }
            },
            response => { console.log(response.msg); }
        );
    }
);

endCompare_btn_listener.addEventListener('click', 
    () => {
            clearInterval(countInterval);
            add_text_node(timer_text, "End");
    
            chrome.runtime.sendMessage
            (
                {
                    type: 'END_COMPARE',
                    payload:{ message: 'Hello, in mainPanel. we need to end compare.' },
                },
                response => { console.log(response.msg); }
            );
          }
);

reset_btn_listener.addEventListener('click', 
    () => {
            chrome.runtime.sendMessage
            (
                {
                    type: 'RESET',
                    payload:{ message: 'Hello, in mainPanel. we need to reset.' }
                },
                response => { console.log(response.msg); } //unstable
            );
          }
);

})();
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

