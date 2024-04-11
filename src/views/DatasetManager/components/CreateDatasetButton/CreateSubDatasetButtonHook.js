// Copyright (c) Cosmo Tech.
// Licensed under the MIT license.
import { useCallback, useMemo } from 'react';
import { useOrganizationData } from '../../../../state/hooks/OrganizationHooks';
import { useCreateRunner } from '../../../../state/hooks/RunnerHooks';
import { useSubDataSourceRunTemplates, useSolutionData } from '../../../../state/hooks/SolutionHooks';
import { ArrayDictUtils, SolutionsUtils } from '../../../../utils';

export const useSubDatasetCreationParameters = () => {
  const createRunner = useCreateRunner();
  const solutionData = useSolutionData();
  const customSubDataSourceRunTemplates = useSubDataSourceRunTemplates();

  const userPermissionsInCurrentOrganization = useOrganizationData()?.security?.currentUserPermissions ?? [];

  const dataSourceRunTemplates = useMemo(() => {
    const parameters = solutionData.parameters;
    const runTemplatesParameters = solutionData.runTemplatesParametersIdsDict;
    const dataSourcesWithParameters = customSubDataSourceRunTemplates.map((dataSource) => ({
      ...dataSource,
      parameters: parameters.filter((parameter) => runTemplatesParameters[dataSource.id].includes(parameter.id)),
    }));

    const runTemplates = {};
    dataSourcesWithParameters.forEach((runTemplate) => (runTemplates[runTemplate.id] = runTemplate));
    return runTemplates;
  }, [customSubDataSourceRunTemplates, solutionData.parameters, solutionData.runTemplatesParametersIdsDict]);

  const createSubDatasetRunner = useCallback(
    (parentDatasetId, values) => {
      ArrayDictUtils.removeUndefinedValuesFromDict(values);

      const sourceType = values.sourceType;
      const runner = {
        name: values.name,
        tags: values.tags,
        description: values.description,
        sourceType,
        datasetList: [parentDatasetId],
      };
      runner.parametersValues = SolutionsUtils.forgeRunnerParameters(solutionData, values[sourceType]);
      createRunner(runner);
    },
    [createRunner, solutionData]
  );

  return {
    dataSourceRunTemplates,
    createSubDatasetRunner,
    userPermissionsInCurrentOrganization,
  };
};
