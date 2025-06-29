'use client';

import { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  CircularProgress
} from '@mui/material';
import { Configuration, OpenAIApi } from 'openai';

interface Props {
  onRuleGenerated: (rule: any) => void;
}

export default function RuleAIInput({ onRuleGenerated }: Props) {
  const [nlRule, setNlRule] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState('');

  const handleGenerate = async () => {
    setLoading(true);
    setError('');
    setResult('');

    try {
      const configuration = new Configuration({
        apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY, // ✅ Use env variable
      });

      const openai = new OpenAIApi(configuration);

      const prompt = `
You are a helpful assistant that converts plain English task allocation rules into JSON format.
Example conversions:
"Tasks T2 and T3 must run together" → { "type": "coRun", "tasks": ["T2", "T3"] }
"Task T1 should only run in phase 1 and 2" → { "type": "phaseWindow", "tasks": ["T1"], "allowedPhases": [1, 2] }

Now convert this rule:
"${nlRule}"
Return ONLY the JSON.`;

      const response = await openai.createChatCompletion({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
      });

      const output = response.data.choices[0].message?.content || '';
      setResult(output);

      // Try parsing JSON (safe)
      try {
        const parsed = JSON.parse(output);
        onRuleGenerated(parsed); // Pass to parent (RuleBuilder)
      } catch {
        setError('OpenAI returned an invalid JSON. Please retry.');
      }
    } catch (err: any) {
      setError('Error from OpenAI API: ' + err.message);
    }

    setLoading(false);
  };

  return (
    <Box mt={4}>
      <Typography variant="subtitle1">🤖 Natural Language to Rule (AI)</Typography>
      <Paper sx={{ p: 2, mt: 1 }}>
        <TextField
          label="Describe the rule in plain English"
          fullWidth
          value={nlRule}
          onChange={(e) => setNlRule(e.target.value)}
          multiline
          rows={2}
          sx={{ mb: 2 }}
        />

        <Button variant="contained" onClick={handleGenerate} disabled={loading}>
          {loading ? <CircularProgress size={24} /> : 'Generate Rule'}
        </Button>

        {error && <Typography color="error" mt={2}>{error}</Typography>}
        {result && (
          <Box mt={2}>
            <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
              <strong>Generated Rule:</strong><br />{result}
            </Typography>
          </Box>
        )}
      </Paper>
    </Box>
  );
}
