'use client';

import React, { useState } from 'react';
import {
  Tabs,
  Tab,
  Box,
  Typography,
  Paper,
  Alert,
} from '@mui/material';
import {
  DataGrid,
  GridColDef,
  GridCellParams,
  GridRenderCellParams,
} from '@mui/x-data-grid';

interface Props {
  parsedData: {
    clients: any[];
    workers: any[];
    tasks: any[];
  };
}

function validateCell(field: string, value: any): string | null {
  if (value === '' || value === undefined) return 'Required';
  if (field === 'PriorityLevel' && (value < 1 || value > 5)) return 'Out of range (1-5)';
  if (field === 'Duration' && value < 1) return 'Must be ≥ 1';
  if (field === 'AttributesJSON') {
    try {
      JSON.parse(value);
    } catch {
      return 'Invalid JSON';
    }
  }
  return null;
}

function generateColumns(data: any[]): GridColDef[] {
  if (!data.length) return [];
  return Object.keys(data[0]).map((key) => ({
    field: key,
    headerName: key,
    flex: 1,
    editable: true,
    renderCell: (params: GridRenderCellParams) => {
      const error = validateCell(params.field, params.value);
      return (
        <Box color={error ? 'red' : 'inherit'}>
          {params.value}
        </Box>
      );
    },
  }));
}

function TabPanel({ children, value, index }: any) {
  return value === index ? <Box mt={2}>{children}</Box> : null;
}

export default function DataGridEditor({ parsedData }: Props) {
  const [tabIndex, setTabIndex] = useState(0);

  const datasets = ['clients', 'workers', 'tasks'] as const;
  const currentData = parsedData[datasets[tabIndex]];
  const columns = generateColumns(currentData);
  const rows = currentData.map((row, idx) => ({ id: idx, ...row }));

  const validationSummary = rows.flatMap((row: any) =>
    Object.keys(row)
      .map((field) => validateCell(field, row[field]))
      .filter(Boolean)
  );

  return (
    <Box mt={6}>
      <Typography variant="h6" gutterBottom>📝 Data Editor & Validator</Typography>
      <Paper>
        <Tabs
          value={tabIndex}
          onChange={(_, newIndex) => setTabIndex(newIndex)}
          indicatorColor="primary"
          textColor="primary"
          centered
        >
          <Tab label="Clients" />
          <Tab label="Workers" />
          <Tab label="Tasks" />
        </Tabs>

        <TabPanel value={tabIndex} index={tabIndex}>
          <Box height={400}>
            <DataGrid
              rows={rows}
              columns={columns}
              disableSelectionOnClick
              processRowUpdate={(newRow) => {
                parsedData[datasets[tabIndex]][newRow.id] = { ...newRow };
                return newRow;
              }}
            />
          </Box>
        </TabPanel>
      </Paper>

      {validationSummary.length > 0 && (
        <Alert severity="warning" sx={{ mt: 2 }}>
          Found {validationSummary.length} validation issues. Hover over red cells for details.
        </Alert>
      )}
    </Box>
  );
}
