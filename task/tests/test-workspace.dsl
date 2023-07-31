workspace "ADO Extension Test Workspace" {

    model {
        system1 = softwareSystem "Test System" {
            
        }

        system2 = softwareSystem "Test System 2" {
            -> system1 "Uses"
        }

        person = person "Users" {
            -> system1 "Uses"
        }
    
    }

    views {
        styles {
            element "Person" {
                shape Person
                background darkblue
                color white
            }
            
            element "Software System" {
                background darkblue
                color white
                shape roundedBox
            }
                        
            element "Container" {
                background lightblue
                color white
                shape roundedBox
            }
            
            element "Database" {
                shape cylinder
            }

            element "ThirdParty" {
                background darkgray
            }
        }
    
        systemLandscape "system1" {
            include *
        }
    
        systemContext system1 "Context" {
            include *
            autoLayout lr
        }            
    }
    
}
