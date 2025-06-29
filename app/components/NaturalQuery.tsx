'use client';

import React, { useState } from 'react';
import { Box, TextField, Button, Typography, CircularProgress } from '@mui/material';
import axios from 'axios';

interface Props {
  parsedData: {
    clients: any[];
    workers: any[];
    tasks: any[];
  };
}

export default function NaturalQuery({ parsedData }: Props) {
  const [query, setQuery] = useState('');
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleQuery = async () => {
    if (!query) return;

    setLoading(true);
    setError(null);
    setAiResponse(null);

    try {
      const response = await axios.post('/api/convert-rule', {
        query,
        data: parsedData,
      });

      if (response.data?.result) {
        setAiResponse(response.data.result);
      } else if (response.data?.error) {
        setError('❌ Error: ' + response.data.error);
      } else {
        setError('❌ Unknown response format');
      }
    } catch (err: any) {
      setError('❌ Error contacting server: ' + err.message);
    }

    setLoading(false);
  };

  const handleValidation = async () => {
    setLoading(true);
    setError(null);
    setAiResponse(null);

    try {
      const response = await axios.post('/api/validate-dataset', {
        data: parsedData,
      });

      if (response.data?.issues) {
        setAiResponse(JSON.stringify(response.data.issues, null, 2));
      } else if (response.data?.error) {
        setError('❌ ' + response.data.error);
      } else {
        setError('❌ Unknown response format');
      }
    } catch (err: any) {
      setError('❌ Error: ' + err.message);
    }

    setLoading(false);
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>🤖 Ask in Plain English</Typography>

      <TextField
        fullWidth
        multiline
        rows={2}
        label="Ask a question about your data..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      <Box mt={2} display="flex" gap={2}>
        <Button variant="contained" onClick={handleQuery} disabled={loading}>
          {loading ? <CircularProgress size={24} /> : 'Submit'}
        </Button>

        <Button variant="outlined" color="secondary" onClick={handleValidation} disabled={loading}>
          {loading ? <CircularProgress size={24} /> : '🛡️ Validate Data (AI)'}
        </Button>
      </Box>

      {error && (
        <Box mt={3}>
          <Typography color="error">{error}</Typography>
        </Box>
      )}

      {aiResponse && (
        <Box mt={4}>
          <Typography variant="subtitle1">💡 AI Response:</Typography>
          <Box p={2} bgcolor="#f5f5f5" borderRadius={2}>
            <pre>{aiResponse}</pre>
          </Box>
        </Box>
      )}
    </Box>
  );
}
