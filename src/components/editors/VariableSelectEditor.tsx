import React, { useMemo } from 'react';
import { Select } from '@grafana/ui';
import { StandardEditorProps } from '@grafana/data';
import { getTemplateSrv } from '@grafana/runtime';

export const VariableSelectEditor = ({ value, onChange }: StandardEditorProps<string>) => {
    const templateService = getTemplateSrv();
    const variableOptions = useMemo(() => {
    return templateService.getVariables().map((variable) => ({
            value: variable.name,
            label: variable.label || variable.name,
        }));
    }, [templateService]);
    return (
        <Select
            options={variableOptions}
            value={value}
            onChange={(selected) => onChange(selected?.value || '')}
            placeholder="Select variable"
            isClearable={true}
        />
    )
};