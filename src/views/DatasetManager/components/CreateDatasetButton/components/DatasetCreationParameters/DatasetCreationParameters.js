// Copyright (c) Cosmo Tech.
// Licensed under the MIT license.
import React, { useEffect, useMemo, useState } from 'react';
import { Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import { Grid, Typography } from '@mui/material';
import { BasicTextInput, UploadFile, BasicEnumInput } from '@cosmotech/ui';
import { TranslationUtils } from '../../../../../../utils';
import { FileManagementUtils } from '../../../../../../utils/FileManagementUtils';
import { useDatasetCreationParameters } from './DatasetCreationParametersHook';

export const DatasetCreationParameters = ({ dataSourceRunTemplates }) => {
  const { t } = useTranslation();
  const { getParameterEnumValues, getDataSourceTypeEnumValues, getUploadFileLabels, getDefaultFileTypeFilter } =
    useDatasetCreationParameters();

  const [dataSourceType, setDataSourceType] = useState(null);
  const dataSourceTypeEnumValues = useMemo(
    () => getDataSourceTypeEnumValues(dataSourceRunTemplates),
    [getDataSourceTypeEnumValues, dataSourceRunTemplates]
  );
  const defaultDataSourceTypeKey = useMemo(() => dataSourceTypeEnumValues?.[0]?.key ?? '', [dataSourceTypeEnumValues]);

  useEffect(() => {
    if (dataSourceType == null) setDataSourceType(defaultDataSourceTypeKey);
  }, [dataSourceType, setDataSourceType, defaultDataSourceTypeKey]);

  const sourceParameters = useMemo(() => {
    const forgeParameterInput = (parameter) => {
      const parameterId = parameter.id;
      const parameterTranslationKey = TranslationUtils.getParameterTranslationKey(
        parameter.idForTranslationKey ?? parameterId
      );
      const fieldPath = `${dataSourceType}.${parameterId}`;
      const inputType = parameter.varType;

      return (
        <Controller
          key={parameterId}
          name={fieldPath}
          rules={{ required: true }}
          render={({ field }) => {
            const { value, onChange } = field;
            if (inputType === 'string') {
              return (
                <Grid item xs={12} sx={{ pt: 1 }}>
                  <BasicTextInput
                    id={parameterId}
                    key={parameterId}
                    label={t(parameterTranslationKey, parameterId)}
                    tooltipText={t(TranslationUtils.getParameterTooltipTranslationKey(parameterId), '')}
                    size="medium"
                    value={value ?? ''}
                    changeTextField={(newValue) => onChange(newValue)}
                  />
                </Grid>
              );
            } else if (inputType === 'enum') {
              const enumValues = getParameterEnumValues(dataSourceRunTemplates, parameterId);
              return (
                <Grid item xs={6} sx={{ pt: 2 }}>
                  <BasicEnumInput
                    id={parameterId}
                    key={parameterId}
                    label={t(parameterTranslationKey, parameterId)}
                    tooltipText={t(TranslationUtils.getParameterTooltipTranslationKey(parameterId), '')}
                    value={value ?? enumValues?.[0]?.key ?? ''}
                    changeEnumField={onChange}
                    textFieldProps={{ disabled: false, id: `enum-input-${parameterId}` }}
                    enumValues={enumValues}
                  />
                </Grid>
              );
            } else if (inputType === '%DATASETID%') {
              return (
                <Grid item xs={12} sx={{ pt: 1 }}>
                  <UploadFile
                    id={parameterId}
                    key={parameterId}
                    labels={getUploadFileLabels(parameterId, parameter.idForTranslationKey)}
                    tooltipText={t(TranslationUtils.getParameterTooltipTranslationKey(parameterId), '')}
                    handleUploadFile={(event) => FileManagementUtils.prepareToUpload(event, onChange)}
                    editMode={true}
                    handleDeleteFile={() => onChange({})}
                    file={value ?? {}}
                    acceptedFileTypes={getDefaultFileTypeFilter(parameterId)}
                  />
                </Grid>
              );
            } else {
              console.error('DataSource parameter vartype unknown');
              return null;
            }
          }}
        />
      );
    };

    const runTemplate = dataSourceRunTemplates[dataSourceType];
    return runTemplate?.parameters?.map((parameter) => forgeParameterInput(parameter));
  }, [
    t,
    getParameterEnumValues,
    getUploadFileLabels,
    getDefaultFileTypeFilter,
    dataSourceRunTemplates,
    dataSourceType,
  ]);

  return (
    <>
      <Grid item xs={12}>
        <Typography sx={{ py: 2 }}>
          {t('commoncomponents.datasetmanager.wizard.secondScreen.subtitle', 'Please provide your data source')}
        </Typography>
      </Grid>
      <Grid item xs={7}>
        <Controller
          name="sourceType"
          key="sourceType"
          defaultValue={dataSourceType ?? defaultDataSourceTypeKey}
          shouldUnregister={true}
          render={({ field }) => {
            const { value, onChange } = field;
            const setDatasetSource = (newValue) => {
              onChange(newValue);
              setDataSourceType(newValue);
            };
            return (
              <BasicEnumInput
                id="new-dataset-sourceType"
                label={t('commoncomponents.datasetmanager.wizard.secondScreen.dataSourceType.label', 'Source')}
                size="medium"
                value={value ?? defaultDataSourceTypeKey}
                changeEnumField={setDatasetSource}
                enumValues={dataSourceTypeEnumValues}
              />
            );
          }}
        />
      </Grid>
      <Grid item container xs={12} sx={{ px: 2, pt: 3 }}>
        {sourceParameters}
      </Grid>
    </>
  );
};

DatasetCreationParameters.propTypes = {
  dataSourceRunTemplates: PropTypes.object.isRequired,
};