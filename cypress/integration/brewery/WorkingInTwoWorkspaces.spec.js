// Copyright (c) Cosmo Tech.
// Licensed under the MIT license.

import {
  ErrorBanner,
  Login,
  ScenarioManager,
  ScenarioParameters,
  Scenarios,
  Workspaces,
  ScenarioSelector,
} from '../../commons/actions';
import { setup } from '../../commons/utils/setup';
import {
  BREWERY_WORKSPACE_ID,
  REAL_BREWERY_WORKSPACE_ID,
  SCENARIO_RUN_IN_PROGRESS,
} from '../../commons/constants/generic/TestConstants';
import utils from '../../commons/TestUtils';
import { DATASET, RUN_TEMPLATE } from '../../commons/constants/brewery/TestConstants';
import { BreweryParameters } from '../../commons/actions/brewery';
import { routeUtils as route } from '../../commons/utils';
const CSV_VALID_WITH_EMPTY_FIELDS = 'customers_empty_authorized_fields.csv';
const FILE_PATH_1 = 'dummy_dataset_1.csv';

describe('Switching between workspaces and running four scenarios at the same time', () => {
  const randomString = utils.randomStr(7);
  const firstWorkspaceParentScenarioName = 'Parent Scenario First Workspace - ' + randomString;
  const firstWorkspaceChildScenarioName = 'Child Scenario First Workspace - ' + randomString;
  const secondWorkspaceParentScenarioName = 'Parent Scenario Second Workspace - ' + randomString;
  const secondWorkspaceChildScenarioName = 'Child Scenario Second Workspace - ' + randomString;
  const sharedNameScenario = 'Shared Name Scenario - ' + randomString;
  const newSharedNameScenario = 'New Shared Name Scenario - ' + randomString;
  let firstWorkspaceParentScenarioId,
    secondWorkspaceParentScenarioId,
    firstWorkspaceChildScenarioId,
    secondWorkspaceChildScenarioId,
    firstWorkspaceSharedScenarioId,
    secondWorkspaceSharedScenarioId;

  before(() => {
    setup.setCypressKeystrokeDelay();
  });

  it('can create, edit, upload files, create children and run four scenarios at the same time', () => {
    Login.loginWithoutWorkspace();
    Workspaces.getWorkspacesView(10000).should('exist');
    Workspaces.selectWorkspace(REAL_BREWERY_WORKSPACE_ID);

    // create first parent scenario, edit and launch it
    Scenarios.createScenario(
      firstWorkspaceParentScenarioName,
      true,
      DATASET.BREWERY_ADT,
      RUN_TEMPLATE.BREWERY_PARAMETERS
    ).then((value) => {
      firstWorkspaceParentScenarioId = value.scenarioCreatedId;
      ScenarioParameters.getParametersTabs().should('be.visible');
      ScenarioParameters.edit();
      BreweryParameters.getStockInput().clear().type('40');
      BreweryParameters.getRestockInput().clear().type('10');
      BreweryParameters.getWaitersInput().clear().type('1');
      ScenarioParameters.updateAndLaunch();
      Workspaces.getHomeButton().should('be.visible').click();
      cy.go('back');
      Scenarios.getDashboardPlaceholder().should('have.text', SCENARIO_RUN_IN_PROGRESS);
      ScenarioParameters.getLaunchButton().should('be.disabled');

      Workspaces.getHomeButton().should('be.visible').click();
      Workspaces.selectWorkspace(BREWERY_WORKSPACE_ID);

      // create second parent scenario, edit it without launching, return to workspace selector,
      // check that scenario parameters haven't been updated, reedit scenario and launch it
      Scenarios.createScenario(
        secondWorkspaceParentScenarioName,
        true,
        DATASET.BREWERY_ADT,
        RUN_TEMPLATE.BREWERY_PARAMETERS
      ).then((value) => {
        secondWorkspaceParentScenarioId = value.scenarioCreatedId;
        ScenarioParameters.edit();
        BreweryParameters.getStockInput().clear().type('400');
        BreweryParameters.getRestockInput().clear().type('10');
        BreweryParameters.getWaitersInput().clear().type('15');
        Workspaces.getHomeButton().should('be.visible').click();
        cy.go('back');
        BreweryParameters.getStockValueInDisabledMode().should('not.have.text', '400');
        BreweryParameters.getRestockValueInDisabledMode().should('not.have.text', '10');
        BreweryParameters.getWaitersValueInDisabledMode().should('not.have.text', '15');
        ScenarioParameters.getParametersEditButton().should('not.be.disabled');
        ScenarioParameters.edit();
        BreweryParameters.getStockInput().clear().type('400');
        BreweryParameters.getRestockInput().clear().type('10');
        BreweryParameters.getWaitersInput().clear().type('15');
        ScenarioParameters.updateAndLaunch();

        Workspaces.getHomeButton().should('be.visible').click();

        // check the first parent scenario is still running
        Workspaces.selectWorkspace(REAL_BREWERY_WORKSPACE_ID);
        ScenarioSelector.selectScenario(firstWorkspaceParentScenarioName, firstWorkspaceParentScenarioId);
        Scenarios.getDashboardPlaceholder().should('have.text', SCENARIO_RUN_IN_PROGRESS);
        ScenarioParameters.getLaunchButton().should('be.disabled');

        // browse to the second parent scenario and check it still running with right values
        route.browse(`${BREWERY_WORKSPACE_ID}/scenario/${secondWorkspaceParentScenarioId}`);
        Scenarios.getDashboardPlaceholder().should('have.text', SCENARIO_RUN_IN_PROGRESS);
        ScenarioParameters.getLaunchButton().should('be.disabled');
        BreweryParameters.getStockValueInDisabledMode().should('have.text', '400');
        BreweryParameters.getRestockValueInDisabledMode().should('have.text', '10');
        BreweryParameters.getWaitersValueInDisabledMode().should('have.text', '15');

        Workspaces.getHomeButton().should('be.visible').click();
        Workspaces.selectWorkspace(REAL_BREWERY_WORKSPACE_ID);

        // create first child scenario, edit it without launching
        Scenarios.createScenario(
          firstWorkspaceChildScenarioName,
          false,
          firstWorkspaceParentScenarioName,
          RUN_TEMPLATE.BASIC_TYPES
        ).then((value) => {
          firstWorkspaceChildScenarioId = value.scenarioCreatedId;
          ScenarioParameters.edit();
          BreweryParameters.switchToCustomersTab();
          BreweryParameters.importCustomersTableData(CSV_VALID_WITH_EMPTY_FIELDS);

          Workspaces.getHomeButton().should('be.visible').click();
          Workspaces.selectWorkspace(BREWERY_WORKSPACE_ID);

          // create second child scenario, edit it without launching
          Scenarios.createScenario(
            secondWorkspaceChildScenarioName,
            false,
            secondWorkspaceParentScenarioName,
            RUN_TEMPLATE.BASIC_TYPES
          ).then((value) => {
            secondWorkspaceChildScenarioId = value.scenarioCreatedId;
            ScenarioParameters.edit();
            BreweryParameters.switchToDatasetPartsTab();
            BreweryParameters.uploadExampleDatasetPart1(FILE_PATH_1);

            // check the first child scenario hasn't been edited, edit it and launch
            route.browse(`${REAL_BREWERY_WORKSPACE_ID}/scenario/${firstWorkspaceChildScenarioId}`);
            ScenarioParameters.edit();
            BreweryParameters.switchToCustomersTab();
            BreweryParameters.getCustomersTableGrid().should('be.empty');
            BreweryParameters.importCustomersTableData(CSV_VALID_WITH_EMPTY_FIELDS);
            ScenarioParameters.updateAndLaunch();

            // browse to second child scenario, check its parameters haven't been edited, edit and launch it
            route.browse(`${BREWERY_WORKSPACE_ID}/scenario/${secondWorkspaceChildScenarioId}`);
            ScenarioParameters.edit();
            BreweryParameters.switchToDatasetPartsTab();
            BreweryParameters.getExampleDatasetPart1DownloadButton().should('not.exist');
            BreweryParameters.uploadExampleDatasetPart1(FILE_PATH_1);
            ScenarioParameters.updateAndLaunch();

            // check the first child scenario is running with right parameters
            route.browse(`${REAL_BREWERY_WORKSPACE_ID}/scenario/${firstWorkspaceChildScenarioId}`);
            Scenarios.getDashboardPlaceholder().should('exist');
            ScenarioParameters.getLaunchButton().should('be.disabled');
            BreweryParameters.switchToCustomersTab();
            BreweryParameters.getCustomersTableGrid().should('not.be.empty');

            // launch first parent scenario
            ScenarioSelector.selectScenario(firstWorkspaceParentScenarioName, firstWorkspaceParentScenarioId);
            ScenarioParameters.launch();

            // check second child scenario is running with right parameters
            route.browse(`${BREWERY_WORKSPACE_ID}/scenario/${secondWorkspaceChildScenarioId}`);
            Scenarios.getDashboardPlaceholder().should('exist');
            ScenarioParameters.getLaunchButton().should('be.disabled');
            BreweryParameters.switchToDatasetPartsTab();
            BreweryParameters.getExampleDatasetPart1FileName().should('have.text', FILE_PATH_1);

            // launch second parent scenario
            ScenarioSelector.selectScenario(secondWorkspaceParentScenarioName, secondWorkspaceParentScenarioId);
            ScenarioParameters.launch();

            // check the first parent scenario is running
            route.browse(`${REAL_BREWERY_WORKSPACE_ID}/scenario/${firstWorkspaceParentScenarioId}`);
            Scenarios.getDashboardPlaceholder().should('exist');
            ScenarioParameters.getLaunchButton().should('be.disabled');

            // check the second parent scenario is running
            route.browse(`${BREWERY_WORKSPACE_ID}/scenario/${secondWorkspaceParentScenarioId}`);
            Scenarios.getDashboardPlaceholder().should('exist');
            ScenarioParameters.getLaunchButton().should('be.disabled');

            // check scenario can't be found with wrong workspaceId in url N1
            cy.visit(`${REAL_BREWERY_WORKSPACE_ID}/scenario/${secondWorkspaceChildScenarioId}`);
            ErrorBanner.checkAnDismissErrorBanner();

            // check scenario can't be found with wrong workspaceId in url N2
            cy.visit(`${BREWERY_WORKSPACE_ID}/scenario/${firstWorkspaceChildScenarioId}`);
            ErrorBanner.checkAnDismissErrorBanner();

            // delete all scenarios and check they don't exist anymore
            Workspaces.getHomeButton().should('be.visible').click();
            Workspaces.selectWorkspace(REAL_BREWERY_WORKSPACE_ID);
            ScenarioManager.switchToScenarioManager();
            ScenarioManager.deleteScenario(firstWorkspaceParentScenarioName);
            ScenarioManager.deleteScenario(firstWorkspaceChildScenarioName);
            cy.visit(`${REAL_BREWERY_WORKSPACE_ID}/scenario/${firstWorkspaceParentScenarioId}`);
            ErrorBanner.checkAnDismissErrorBanner();
            cy.visit(`${REAL_BREWERY_WORKSPACE_ID}/scenario/${firstWorkspaceChildScenarioId}`);
            ErrorBanner.checkAnDismissErrorBanner();
            Workspaces.getHomeButton().should('be.visible').click();
            Workspaces.selectWorkspace(BREWERY_WORKSPACE_ID);
            ScenarioManager.switchToScenarioManager();
            ScenarioManager.deleteScenario(secondWorkspaceParentScenarioName);
            ScenarioManager.deleteScenario(secondWorkspaceChildScenarioName);
            cy.visit(`${BREWERY_WORKSPACE_ID}/scenario/${secondWorkspaceParentScenarioId}`);
            ErrorBanner.checkAnDismissErrorBanner();
            cy.visit(`${BREWERY_WORKSPACE_ID}/scenario/${secondWorkspaceChildScenarioId}`);
            ErrorBanner.checkAnDismissErrorBanner();
          });
        });
      });
    });
  });
  it('checks that two identical scenarios can exist in two workspaces', () => {
    Login.loginWithoutWorkspace();
    Workspaces.getWorkspacesView(10000).should('exist');
    Workspaces.selectWorkspace(REAL_BREWERY_WORKSPACE_ID);

    // create first scenario, update its parameters and launch
    Scenarios.createScenario(sharedNameScenario, true, DATASET.BREWERY_ADT, RUN_TEMPLATE.BREWERY_PARAMETERS).then(
      (value) => {
        firstWorkspaceSharedScenarioId = value.scenarioCreatedId;
        ScenarioParameters.edit();
        BreweryParameters.getStockInput().clear().type('400');
        BreweryParameters.getRestockInput().clear().type('10');
        BreweryParameters.getWaitersInput().clear().type('15');
        ScenarioParameters.updateAndLaunch();

        Workspaces.getHomeButton().should('be.visible').click();
        Workspaces.selectWorkspace(BREWERY_WORKSPACE_ID);

        // create second scenario, update its parameters (same as for the first one) and launch
        Scenarios.createScenario(sharedNameScenario, true, DATASET.BREWERY_ADT, RUN_TEMPLATE.BREWERY_PARAMETERS).then(
          (value) => {
            secondWorkspaceSharedScenarioId = value.scenarioCreatedId;
            ScenarioParameters.edit();
            BreweryParameters.getStockInput().clear().type('400');
            BreweryParameters.getRestockInput().clear().type('10');
            BreweryParameters.getWaitersInput().clear().type('15');
            ScenarioParameters.updateAndLaunch();

            // browse to the first scenario and check its parameters
            route.browse(`${REAL_BREWERY_WORKSPACE_ID}/scenario/${firstWorkspaceSharedScenarioId}`);
            BreweryParameters.getStockValueInDisabledMode().should('have.text', '400');
            BreweryParameters.getRestockValueInDisabledMode().should('have.text', '10');
            BreweryParameters.getWaitersValueInDisabledMode().should('have.text', '15');

            // browse to the second scenario and check its parameters
            route.browse(`${BREWERY_WORKSPACE_ID}/scenario/${secondWorkspaceSharedScenarioId}`);
            BreweryParameters.getStockValueInDisabledMode().should('have.text', '400');
            BreweryParameters.getRestockValueInDisabledMode().should('have.text', '10');
            BreweryParameters.getWaitersValueInDisabledMode().should('have.text', '15');

            // trying to access second scenario in first workspace -> error
            cy.visit(`${REAL_BREWERY_WORKSPACE_ID}/scenario/${secondWorkspaceSharedScenarioId}`);
            ErrorBanner.checkAnDismissErrorBanner();

            // trying to access first scenario in second workspace -> error
            cy.visit(`${BREWERY_WORKSPACE_ID}/scenario/${firstWorkspaceSharedScenarioId}`);
            ErrorBanner.checkAnDismissErrorBanner();

            // finding second scenario in scenarios' list and checking its url
            ScenarioSelector.selectScenario(sharedNameScenario, secondWorkspaceSharedScenarioId);
            cy.url({ timeout: 3000 }).should('include', secondWorkspaceSharedScenarioId);

            Workspaces.getHomeButton().should('be.visible').click();
            Workspaces.selectWorkspace(REAL_BREWERY_WORKSPACE_ID);

            // finding first scenario in scenarios' list and checking its url
            ScenarioSelector.selectScenario(sharedNameScenario, firstWorkspaceSharedScenarioId);
            cy.url({ timeout: 3000 }).should('include', firstWorkspaceSharedScenarioId);

            // validate first scenario
            Scenarios.getScenarioValidateButton().should('be.visible').should('not.be.disabled');
            Scenarios.validateScenario(firstWorkspaceSharedScenarioId);

            // reject second scenario
            route.browse(`${BREWERY_WORKSPACE_ID}/scenario/${secondWorkspaceSharedScenarioId}`);
            Scenarios.getScenarioRejectButton().should('be.visible').should('not.be.disabled');
            Scenarios.rejectScenario(secondWorkspaceSharedScenarioId);

            // browse to the first workspace scenario manager, check first scenario validation status and rename it
            route.browse(`${REAL_BREWERY_WORKSPACE_ID}/scenariomanager`);
            ScenarioManager.checkValidationStatus(sharedNameScenario, firstWorkspaceSharedScenarioId, 'Validated');
            ScenarioManager.renameScenario(firstWorkspaceSharedScenarioId, newSharedNameScenario);
            Scenarios.switchToScenarioView();
            ScenarioSelector.selectScenario(newSharedNameScenario, firstWorkspaceSharedScenarioId);

            Workspaces.getHomeButton().should('be.visible').click();
            Workspaces.selectWorkspace(BREWERY_WORKSPACE_ID);

            // go to the second workspace, switch to the scenario manager,
            // check second scenario validation status, rename it and check its name
            ScenarioManager.switchToScenarioManager();
            ScenarioManager.checkValidationStatus(sharedNameScenario, secondWorkspaceSharedScenarioId, 'Rejected');
            ScenarioManager.renameScenario(secondWorkspaceSharedScenarioId, newSharedNameScenario);
            Scenarios.switchToScenarioView();
            ScenarioSelector.selectScenario(newSharedNameScenario, secondWorkspaceSharedScenarioId);

            // browse to the first scenario, check its name and delete it
            route.browse(`${REAL_BREWERY_WORKSPACE_ID}/scenario/${firstWorkspaceSharedScenarioId}`);
            ScenarioSelector.getScenarioSelectorInput(10000).should('have.value', newSharedNameScenario);
            ScenarioManager.switchToScenarioManager();
            ScenarioManager.deleteScenario(newSharedNameScenario);
            Workspaces.getHomeButton().should('be.visible').click();
            Workspaces.selectWorkspace(BREWERY_WORKSPACE_ID);
            // select second scenario, check its name and delete it
            ScenarioSelector.selectScenario(newSharedNameScenario, secondWorkspaceSharedScenarioId);
            ScenarioSelector.getScenarioSelectorInput(10000).should('have.value', newSharedNameScenario);
            ScenarioManager.switchToScenarioManager();
            ScenarioManager.deleteScenario(newSharedNameScenario);
          }
        );
      }
    );
  });
});
