'use strict';
import { isNumber } from 'lodash';
import '../css/sidebarPanel.css';
const {parse, stringify} = require('flatted/cjs');

const startCompare_btn = document.getElementById("startCompare");
const stopCompare_btn = document.getElementById("stopCompare");
const reset_btn = document.getElementById("reset");
const setting_timer_btn = document.getElementById("timer-setting-btn");
const timer_input_field = document.getElementById("timer-input");
const timer_box = document.getElementById("timerPrintBox");
const compare_control_box = document.getElementById("compareResult");

const get_html_msgbox = document.getElementById("html_msg");

var timer_time = 3;
var countInterval;

// tool function
var add_text_node_in_element = function(element, text) {
    //clean nodes of element.
    while (element.firstChild) {
        element.removeChild(element.firstChild);
    }
    //start to create child in the element.
    var text_tag = document.createTextNode(text); 
    element.appendChild(text_tag);
};

const communicate_with_start_compare = function() {
    chrome.runtime.sendMessage
    (
        {
            type: 'need_to_save_current_html in background',
            payload:{ senderLocation: 'mainPanel', message: 'we need to save current html and wait end of compare.' }
        },
        response => { }
    );
}

const communicate_with_end_compare = function() {
    chrome.runtime.sendMessage
    (
        {
            type: 'need_to_save_current_html in background and start to compare',
            payload:{ senderLocation: 'mainPanel', message: 'need to save current html and start to compare HTML of before and after.' }
        },
        response => { }
    );
}

var time_showing_function = function(actualTime) {
    let secondsRemaining = actualTime;
    countInterval = setInterval
    (
        function ()
        {
            add_text_node_in_element(compare_control_box, `剩下 ${secondsRemaining} sec`);
            secondsRemaining = secondsRemaining - 1;
            if (secondsRemaining < 0) 
            { 
                clearInterval(countInterval);
                communicate_with_end_compare();
                add_text_node_in_element(compare_control_box, "Compare End");
            };
        }, 1000
    );
};

// listener
startCompare_btn.addEventListener('click', 
    () => 
    {
        time_showing_function(timer_time);
        communicate_with_start_compare();
    }
);

stopCompare_btn.addEventListener('click', 
    () => 
    {
        clearInterval(countInterval);
        add_text_node_in_element(timer_box, `強制End timer=${timer_time}秒`);
    }
);

reset_btn.addEventListener('click', 
    () => 
    {
        timer_time = 3;
        clearInterval(countInterval);
        add_text_node_in_element(timer_box, `回復預設設定timer=${timer_time}秒`);
    }
);

setting_timer_btn.addEventListener('click', 
    () => 
    {
        clearInterval(countInterval);
        if( Number(timer_input_field.value) != NaN && timer_input_field.value > 0) {
            timer_time = timer_input_field.value; 
            add_text_node_in_element(timer_box, `Timer Setting is ${timer_time}sec`);
        }

        else {
            add_text_node_in_element(timer_box, `Should be input valid value`);
        }

        timer_input_field.value = "";
    }
);

chrome.runtime.onMessage.addListener( 
    (sender_package, sender, return_sender_response) => 
    {
        if (sender_package.type === 'return_compare_result_to_mainPanel') {
            let parse_result = parse(sender_package.compareResult);

            if(parse_result.different === false){
                add_text_node_in_element( get_html_msgbox, "No change in this web.");
            }
            else {
                add_text_node_in_element( get_html_msgbox, parse_result.changes[0].message);
            }
            return_sender_response( { } );
            }
    }
);