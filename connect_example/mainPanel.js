const mainPanel_port = chrome.runtime.connect( {name: "Main Panel Communication"} );
const inspectedWindowId = chrome.devtools.inspectedWindow.tabId;
const startCompare_btn_listener = document.getElementById("startCompare");
const endCompare_btn_listener = document.getElementById("endCompare");
const reset_btn_listener = document.getElementById("reset");

mainPanel_port.onMessage.addListener(function(response) 
    {
        if(response.button === "start compare"){
            console.log("Finish start compare msg in mainPanel: ", response.msg);
            changePanelMsg(response.msg);
        }
        else if (response.button === "end compare")
        {
            console.log("Finish end compare msg in mainPanel: ", response.msg);
            changePanelMsg(response.msg);
        }
        else if (response.button === "reset")
        {
            console.log("Finish reset msg in mainPanel: ", response.msg);
            changePanelMsg(response.msg);
        }
    }
);


startCompare_btn_listener.onclick = function(){
    var message = { button: "start compare", msg: "click startCompare btn and send msg from mainPanel."};
    mainPanel_port.postMessage(message);
    console.log(message.msg);
  }

endCompare_btn_listener.onclick = function(){
var message = { button: "end compare" , msg: "click endCompared btn and send msg from mainPanel."};
mainPanel_port.postMessage(message);
console.log(message.msg);
}

reset_btn_listener.onclick = function(){
    var message = { button: "reset" , msg: "click reset btn and send msg from mainPanel."};
    mainPanel_port.postMessage(message);
    console.log(message.msg);
  }

console.log("panel start~")

function changePanelMsg(msg)
{
            var msgNode = document.getElementsByClassName('msg')[0];
            var msgContainer = document.createElement("p");
            var msgChildNode = document.createTextNode(msg); 
            while (msgNode.firstChild) {
                msgNode.removeChild(msgNode.firstChild);
            }
            msgContainer.appendChild(msgChildNode);
            msgNode.appendChild(msgContainer);
}