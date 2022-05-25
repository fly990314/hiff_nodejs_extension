// 'use strict';
import { isNumber } from 'lodash';
import '../css/mainPanel.css';

(function()
{
    const startCompare_btn = document.getElementById("startCompare");
    const endCompare_btn = document.getElementById("endCompare");
    const reset_btn = document.getElementById("reset");
    const setting_timer_btn = document.getElementById("timer-setting-btn");
    const timer_input_field = document.getElementById("timer-input");
    const timer_box = document.getElementById("timerPrintBox");

    var timer_time = 3;
    var countInterval;

    var add_text_node_in_element = function(element, text)
    {
        //清除所有element裡面所有節點
        while (element.firstChild) {
            element.removeChild(element.firstChild);
        }
        //開始建立的文字節點
        var text_tag = document.createTextNode(text); 
        element.appendChild(text_tag);
    };

    startCompare_btn.addEventListener('click', 
        () => 
        {
            var time_showing_function = function(actualTime){
        
                let timer_setting_and_start = function(time)
                {
                    let secondsRemaining = time;
                    // let min = 0;
                    // let sec = 0;
                    countInterval = setInterval
                    (
                        function ()
                        {
                            let paddedFormat = function(num) {return num < 10 ? "0" + num : num; };
                            // min = parseInt(secondsRemaining / 60);
                            // sec = parseInt(secondsRemaining % 60);
                            // add_text_node_in_element(timer_box, `${paddedFormat(min)}:${paddedFormat(sec)}`);
                            add_text_node_in_element(timer_box, `剩下 ${secondsRemaining} sec`);
                            secondsRemaining = secondsRemaining - 1;
                            if (secondsRemaining < 0) 
                            { 
                                clearInterval(countInterval);
                                add_text_node_in_element(timer_box, "Compare End");
                            };
                        }, 1000
                    );
                };
                timer_setting_and_start(actualTime);
            };

            time_showing_function(timer_time);

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

    endCompare_btn.addEventListener('click', 
        () => {
                clearInterval(countInterval);
                add_text_node_in_element(timer_box, `強制End timer=${timer_time}秒`);
        
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

    reset_btn.addEventListener('click', 
        () => {
                timer_time = 3;
                clearInterval(countInterval);
                add_text_node_in_element(timer_box, `回復預設設定timer=${timer_time}秒`);

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

    setting_timer_btn.addEventListener('click', 
    () => {
            // console.log(timer_input_field.value)
            clearInterval(countInterval);
            if( Number(timer_input_field.value) != NaN && timer_input_field.value > 0)
            {
                timer_time = timer_input_field.value; 
                add_text_node_in_element(timer_box, `Timer Setting is ${timer_time}sec`);
            }
            else
            {
                add_text_node_in_element(timer_box, `Should be input valid value`);
            }

            timer_input_field.value = "";
            
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

