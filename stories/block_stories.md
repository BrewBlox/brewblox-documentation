```gherkin
# Note: alternative name for "UI block" could be "Block"

Feature: UI blocks
UI blocks are a subcategory of widgets
UI blocks represent distinct hardware functionality
UI blocks can be associated with one or more hardware elements
UI blocks do not have to be associated with hardware elements
UI blocks can be associated with dummy elements
UI blocks can be associated with simulation elements
UI blocks can change their association
UI blocks have a unique identifier independent of association
UI blocks are grouped in one or more processes

    Scenario: Add UI block from UI catalogue
        Given there is an active process
        When I add a new UI block from the UI catalogue
        Then a new UI block is added to the process
        And the new UI block is associated with a dummy element
        And the new UI block has a unique identifier

    Scenario: Import a view
        Given there is a importable view definition file
        When I select the Import View button
        Then I can select the view definition file
        And the view is added to the control center
        And all UI blocks in the definition file are added to the view

    Scenario: UI block wizard
        Given there is an active view
        And the view contains a UI block with a dummy association
        When I press the UI block Wizard button
        Then I can select an association for the UI block

    Scenario: Autodeploy UI block configuration
        Given there are unassociated UI blocks
        And I have plugged corresponding physical objects into the controller
        And I have not configured the controller
        When I press the Autodeploy Blocks button
        Then the application configures all new objects on the controller
        And the application attempts to associate all UI blocks
        And the application displays which blocks could not be automatically associated

    Scenario: Assign UI block hardware association
        Given there is an active view
        And the view contains a UI block
        When I press the Associate Hardware button
        Then I am asked to identify the associated hardware component
        And the UI block is associated with the hardware component

    Scenario: Unassign UI block association
        Given there is an active process
        And the process contains an associated UI block
        When I press the Clear Association button
        Then the UI block is associated with a dummy element

    Scenario: Identify UI block hardware association
        Given I chose to identify a hardware association
        Then I am shown information about the desired hardware association
        And I am asked to plug in a matching hardware component
        And a display of available hardware components is shown
        When I make a selection
        Then the hardware association is identified
```