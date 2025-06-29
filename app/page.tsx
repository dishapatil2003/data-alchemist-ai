'use client';

import { useState } from 'react';
import { Box, Typography, Container } from '@mui/material';
import DataUploader from './components/DataUploader';
import NaturalQuery from './components/NaturalQuery';
import DataGridEditor from './components/DataGridEditor';
import RuleBuilder from './components/RuleBuilder'; // ✅ New import

export default function Home() {
  const [parsedData, setParsedData] = useState<any>({
    clients: [],
    workers: [],
    tasks: [],
  });

  return (
    <Container maxWidth="lg">
      <Box py={4}>
        <Typography variant="h4" gutterBottom>
          🧪 Data Alchemist AI
        </Typography>

        {/* ✅ Step 1: Upload Section */}
        <DataUploader onDataParsed={setParsedData} />

        {/* ✅ Step 2: Natural Language Query */}
        <Box mt={4}>
          <NaturalQuery parsedData={parsedData} />
        </Box>

        {/* ✅ Step 3: Data Grid with Validation */}
        <Box mt={6}>
          <DataGridEditor parsedData={parsedData} />
        </Box>

        {/* ✅ Step 4: Rule Builder UI (Milestone 2) */}
        <Box mt={6}>
          <RuleBuilder parsedData={parsedData} />
        </Box>
      </Box>
    </Container>
  );
}
