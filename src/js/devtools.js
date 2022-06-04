(function() 
    {
        chrome.devtools.panels.elements.createSidebarPane
        (
            "Hiff-Sidebar-Panel",
            function (sidebar) 
            {
                "use strict";
                sidebar.setPage("sidebarPanel.html");
                sidebar.setHeight("350px");
            }
        );
    }
)();