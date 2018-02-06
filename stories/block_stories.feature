# Note: alternative name for "UI block" could be "Block"

Feature: UI blocks
    UI blocks represent distinct hardware functionality
    UI blocks can be associated with one or more hardware elements
    UI blocks do not have to be associated with hardware elements
    UI blocks can be associated with dummy elements
    UI blocks can be associated with simulation elements
    UI blocks can change their association
    UI blocks should match user expectation of having 
    UI blocks can be a grouping of other UI blocks
    UI blocks have a unique identifier independent of association
    UI blocks are grouped in one or more processes

Scenario: Add UI block from UI blockbox
    Given there is an active process
    When I add a new UI block from the UI blockbox
    Then a new UI block is added to the process
    And the new UI block is associated with a dummy element
    And the new UI block has a unique identifier

Scenario: Import a process
    Given there is a importable process definition file
    When I select the Import Process button
    Then I can select the process definition file
    And the process is added to the dashboard
    And all UI blocks in the definition file are added to the process

Scenario: UI block wizard
    Given there is an active process
    And the process contains a UI block with a dummy association
    When I press the UI block Wizard button
    Then I can select an association for the UI block

Scenario: Autodeploy UI block configuration
    Given there are unassociated UI blocks
    And I have plugged corresponding physical objects into the controller
    And I have not configured the controller
    When I press the Autodeploy Blocks button
    Then the application configures all new objects on the controller
    And the application attempts to associate all UI blocks

Scenario: Assign UI block hardware association
    Given there is an active process
    And the process contains a UI block
    When I press the Associate Hardware button
    Then I am asked to plug in the associated hardware component
    And the UI block is associated with the hardware component

Scenario: Assign UI block simulator association
    Given there is an active process
    And the process contains a UI block
    When I press the Associate Simulator button
    Then the UI block is associated with a simulator component

Scenario: Assign UI block-to-UI block association
    Given there is an active process
    And the process contains a UI block that groups other UI blocks
    When I press the Associate UI blocks button
    Then I am asked to select the associated UI block
    And the UI block is associated with the selected UI block

Scenario: Unassign UI block association
    Given there is an active process
    And the process contains an associated UI block
    When I press the Clear Association button
    Then the UI block is associated with a dummy element
