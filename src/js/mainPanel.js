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
    const get_html_msgbox = document.getElementById("html_msg");
    const get_extension_html_btn = document.getElementById("get_extension_html");
    const get_current_html_btn = document.getElementById("get_current_html");

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
                            // let paddedFormat = function(num) {return num < 10 ? "0" + num : num; };
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

    get_extension_html_btn.addEventListener('click', 
        () => {
                console.log("click extension html btn!!")

                var start_num = "\x3Cscript".length;
                var end_num = "\x3C/script>".length;
                add_text_node_in_element(get_html_msgbox, "");
                var current_html_content = document.body.innerHTML;
                var html_content = current_html_content.replace(/\n/g, "").replace(/    /g, "");

                while(html_content.indexOf("\x3Cscript") != -1 )
                {
                    var index_start = html_content.indexOf("\x3Cscript");
                    var index_end = html_content.indexOf("\x3C/script>");
                    html_content = html_content.slice( 0, index_start-1 ) + html_content.slice( index_end + end_num, html_content.length - 1 );
                }
                add_text_node_in_element(get_html_msgbox, html_content);
            }
    );

    get_current_html_btn.addEventListener('click', 
    () => {
            console.log("click current html btn!!");
            chrome.runtime.sendMessage(
                {
                    type: 'Prepare_Get_CurrentHTML_In_MainPanel',
                    payload:{ message: 'sender: prepare to get current html.' }
                },
                response => { console.log(response.msg);}
            )
        }
    );

})();