'use client';

import React, { useState } from 'react';
import { Box, Button, Typography, Grid } from '@mui/material';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';

type ParsedData = {
  clients: any[];
  workers: any[];
  tasks: any[];
};

interface Props {
  onDataParsed: (data: ParsedData) => void;
}

export default function DataUploader({ onDataParsed }: Props) {
  const [status, setStatus] = useState<string>('');
  const [allData, setAllData] = useState<ParsedData>({
    clients: [],
    workers: [],
    tasks: [],
  });

  const handleFile = (file: File, type: keyof ParsedData) => {
    const extension = file.name.split('.').pop()?.toLowerCase();

    if (extension === 'csv') {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results: any) => {
          setStatus(`${type} loaded successfully`);
          const updatedData = { ...allData, [type]: results.data };
          setAllData(updatedData);
          onDataParsed(updatedData);
        },
        error: () => {
          setStatus(`Error parsing ${type} CSV`);
        },
      });
    } else if (extension === 'xlsx') {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const parsed = XLSX.utils.sheet_to_json(sheet);
        setStatus(`${type} loaded successfully`);
        const updatedData = { ...allData, [type]: parsed };
        setAllData(updatedData);
        onDataParsed(updatedData);
      };
      reader.readAsArrayBuffer(file);
    } else {
      setStatus('Unsupported file format');
    }
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>📤 Upload Data Files</Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={4}>
          <Button variant="outlined" component="label">
            Upload Clients
            <input hidden type="file" accept=".csv,.xlsx" onChange={(e) => {
              if (e.target.files?.[0]) handleFile(e.target.files[0], 'clients');
            }} />
          </Button>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Button variant="outlined" component="label">
            Upload Workers
            <input hidden type="file" accept=".csv,.xlsx" onChange={(e) => {
              if (e.target.files?.[0]) handleFile(e.target.files[0], 'workers');
            }} />
          </Button>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Button variant="outlined" component="label">
            Upload Tasks
            <input hidden type="file" accept=".csv,.xlsx" onChange={(e) => {
              if (e.target.files?.[0]) handleFile(e.target.files[0], 'tasks');
            }} />
          </Button>
        </Grid>
      </Grid>

      {status && (
        <Typography mt={2} color="green">{status}</Typography>
      )}
    </Box>
  );
}
