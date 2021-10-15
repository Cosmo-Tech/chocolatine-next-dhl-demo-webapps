// Copyright (c) Cosmo Tech.
// Licensed under the MIT license.

export const SELECTORS = {
  login: {
    microsoftLoginButton: '[data-cy=sign-in-with-microsoft-button]',
  },
  userProfileMenu: {
    menu: '[data-cy=user-profile-menu]',
    logout: '[data-cy=logout]',
    language: {
      change: '[data-cy=change-language]',
      en: '[data-cy=set-lang-en]',
      fr: '[data-cy=set-lang-fr]',
    },
  },
  scenario: {
    view: '[data-cy=scenario-view]',
    dashboard: {
      placeholder: '[data-cy=dashboard-placeholder]',
    },
    selectInput: '[data-cy=scenario-select-input]',
    parameters: {
      tabs: '[data-cy=scenario-parameters-tabs]',
      editButton: '[data-cy=edit-parameters-button]',
      updateAndLaunchButton: '[data-cy=update-and-launch-scenario]',
      discardButton: '[data-cy=discard-button]',
      dialogDiscardButton: '[data-cy=discard-changes-button2]',
      brewery: {
        stockInput: '[data-cy=stock-input]',
        restockInput: '[data-cy=restock-input]',
        waitersInput: '[data-cy=waiters-input]',
      },
      basicTypes: {
        tabName: '[data-cy=basic_types_tab]',
        textInput: 'input[id=currency_name]',
        numberInput: 'input[id=currency_value]',
        enumInput: 'div[id=currency]',
        exampleDatasetPart1: '[data-cy=example_dataset_part_1]',
        exampleDatasetPart2: '[data-cy=example_dataset_part_2]',
      },
      datasetParts: {
        tabName: '[data-cy=dataset_parts_tab]',
        exampleDatasetPart1: '[data-cy=example_dataset_part_1]',
        exampleDatasetPart2: '[data-cy=example_dataset_part_2]',
      },
      extraDatasetPart: {
        tabName: '[data-cy=extra_dataset_part_tab]',
        exampleDatasetPart3: '[data-cy=example_dataset_part_3]',
      },
    },
    createButton: '[data-cy=create-scenario-button]',
    createDialog: {
      dialog: '[data-cy=create-scenario-dialog]',
      masterCheckbox: 'input[id=isScenarioMaster]',
      nameTextfield: '[data-cy=create-scenario-dialog-name-textfield]',
      datasetSelect: '[data-cy=create-scenario-dialog-dataset-select]',
      typeSelect: '[data-cy=create-scenario-dialog-type-select]',
      submitButton: '[data-cy=create-scenario-dialog-submit-button]',
    },
    manager: {
      tabName: '[data-cy="tabs.scenariomanager.key"]',
      confirmDeleteDialog: '[data-cy=confirm-scenario-delete-dialog]',
      search: '[data-cy=scenario-manager-search-field]',
      button: {
        delete: '[data-cy=scenario-delete-button]',
      },
    },
  },
  genericComponents: {
    uploadFile: {
      browseButtonInput: 'input[type=file]',
      downloadButton: '[data-cy=download-button]',
      deleteButton: '[data-cy=delete-button]',
    },
  },
};
