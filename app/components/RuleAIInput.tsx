'use client';

import React, { useState } from 'react';
import {
  Box, Button, CircularProgress, TextField, Typography
} from '@mui/material';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true, // WARNING: Exposes key in frontend
});

interface Props {
  onRuleGenerated: (rule: any) => void;
}

export default function RuleAIInput({ onRuleGenerated }: Props) {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);

  const generateRule = async () => {
    setLoading(true);
    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
      });
      const result = completion.choices[0]?.message?.content;
      onRuleGenerated(result);
    } catch (err) {
      console.error('Error generating rule:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box mt={2}>
      <Typography variant="h6">🤖 AI Rule Generator</Typography>
      <TextField
        fullWidth
        label="Enter prompt"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        multiline
        margin="normal"
      />
      <Button
        variant="contained"
        onClick={generateRule}
        disabled={loading}
      >
        {loading ? <CircularProgress size={20} /> : 'Generate Rule'}
      </Button>
    </Box>
  );
}
