'use client';

import { useState } from 'react';
import {
  Box, Typography, Paper, Button, TextField, MenuItem, Select, InputLabel,
  FormControl, Chip, List, ListItem, CircularProgress
} from '@mui/material';
import { Save } from '@mui/icons-material';

interface Rule {
  type: string;
  tasks?: string[];
  group?: string;
  minCommonSlots?: number;
  allowedPhases?: number[];
}

interface Props {
  parsedData: {
    clients: any[];
    workers: any[];
    tasks: any[];
  };
}

export default function RuleBuilder({ parsedData }: Props) {
  const [ruleType, setRuleType] = useState<string>('coRun');
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const [allowedPhases, setAllowedPhases] = useState<string>('');
  const [rules, setRules] = useState<Rule[]>([]);

  const [nlInput, setNlInput] = useState('');
  const [aiResult, setAiResult] = useState('');
  const [aiError, setAiError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAddRule = () => {
    if (ruleType === 'coRun' && selectedTasks.length >= 2) {
      setRules([...rules, { type: 'coRun', tasks: selectedTasks }]);
    }
    if (ruleType === 'phaseWindow' && selectedTasks.length === 1 && allowedPhases) {
      const phaseList = allowedPhases.split(',').map((p) => parseInt(p.trim()));
      setRules([...rules, { type: 'phaseWindow', tasks: selectedTasks, allowedPhases: phaseList }]);
    }
    setSelectedTasks([]);
    setAllowedPhases('');
  };

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(rules, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'rules.json';
    a.click();
  };

  const handleNaturalRule = async () => {
    setLoading(true);
    setAiError('');
    setAiResult('');

    try {
      const res = await fetch('/api/convert-rule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: nlInput,
          data: parsedData,
        }),
      });

      const data = await res.json();
      if (res.ok && data.result) {
        setAiResult(data.result);
        try {
          const parsed = JSON.parse(data.result);
          if (Array.isArray(parsed)) {
            setRules([...rules, ...parsed]);
          } else {
            setRules([...rules, parsed]);
          }
        } catch {
          setAiError('⚠️ Could not parse AI output as valid JSON.');
        }
      } else {
        setAiError(data.error || 'Something went wrong.');
      }
    } catch (err: any) {
      setAiError('Error: ' + err.message);
    }

    setLoading(false);
  };

  const handleAIRecommendations = async () => {
    setLoading(true);
    setAiError('');
    setAiResult('');
    try {
      const res = await fetch('/api/recommend-rules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: parsedData }),
      });
      const json = await res.json();
      if (res.ok) {
        setRules([...rules, ...json.rules]);
        setAiResult('✅ AI Recommendations added!');
      } else {
        setAiError(json.error || 'Error generating recommendations');
      }
    } catch (err: any) {
      setAiError(err.message);
    }
    setLoading(false);
  };

  const handleAIErrorCheck = async () => {
    setLoading(true);
    setAiError('');
    setAiResult('');
    try {
      const res = await fetch('/api/check-rule-errors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rules }),
      });
      const data = await res.json();
      if (res.ok && data.issues) {
        setAiResult(JSON.stringify(data.issues, null, 2));
      } else {
        setAiError(data.error || 'No issues detected.');
      }
    } catch (err: any) {
      setAiError('❌ ' + err.message);
    }
    setLoading(false);
  };

  return (
    <Box mt={6}>
      <Typography variant="h6">📐 Rule Builder</Typography>
      <Paper sx={{ p: 2, mt: 2 }}>
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Rule Type</InputLabel>
          <Select value={ruleType} label="Rule Type" onChange={(e) => setRuleType(e.target.value)}>
            <MenuItem value="coRun">Co-run</MenuItem>
            <MenuItem value="phaseWindow">Phase Window</MenuItem>
          </Select>
        </FormControl>

        <TextField
          label="Select Task IDs (comma separated)"
          value={selectedTasks.join(',')}
          onChange={(e) =>
            setSelectedTasks(
              e.target.value.split(',').map((t) => t.trim()).filter((t) => t)
            )
          }
          fullWidth
          sx={{ mb: 2 }}
        />

        {ruleType === 'phaseWindow' && (
          <TextField
            label="Allowed Phases (e.g., 1,2,3)"
            value={allowedPhases}
            onChange={(e) => setAllowedPhases(e.target.value)}
            fullWidth
            sx={{ mb: 2 }}
          />
        )}

        <Button variant="contained" onClick={handleAddRule}>➕ Add Rule</Button>

        <Box mt={4}>
          <Typography variant="subtitle1">🤖 Natural Language Rule Converter</Typography>
          <TextField
            label="Type a rule in plain English"
            fullWidth
            multiline
            rows={2}
            value={nlInput}
            onChange={(e) => setNlInput(e.target.value)}
            sx={{ mt: 1 }}
          />
          <Button
            variant="outlined"
            onClick={handleNaturalRule}
            sx={{ mt: 2, mr: 2 }}
            disabled={loading}
          >
            {loading ? <CircularProgress size={20} /> : 'Convert & Add Rule'}
          </Button>

          <Button
            variant="contained"
            color="secondary"
            onClick={handleAIRecommendations}
            disabled={loading}
          >
            {loading ? <CircularProgress size={20} /> : '✨ Recommend Rules (AI)'}
          </Button>

          <Button
            variant="outlined"
            color="error"
            sx={{ ml: 2 }}
            onClick={handleAIErrorCheck}
            disabled={loading}
          >
            {loading ? <CircularProgress size={20} /> : '🛠️ Check Rule Errors (AI)'}
          </Button>

          {aiError && <Typography color="error" mt={2}>{aiError}</Typography>}
          {aiResult && (
            <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', mt: 2 }}>
              <strong>🧠 AI Result:</strong><br />{aiResult}
            </Typography>
          )}
        </Box>

        <Box mt={4}>
          <Typography variant="subtitle1">🧾 Current Rules</Typography>
          <List dense>
            {rules.map((rule, idx) => (
              <ListItem key={idx}>
                <Chip label={`${rule.type}: ${rule.tasks?.join(', ')}`} sx={{ mr: 1 }} />
                {rule.allowedPhases && (
                  <Chip label={`Phases: ${rule.allowedPhases.join(',')}`} />
                )}
                {rule.group && <Chip label={`Group: ${rule.group}`} />}
              </ListItem>
            ))}
          </List>
        </Box>

        <Box mt={2}>
          <Button variant="outlined" startIcon={<Save />} onClick={handleExport}>
            Export rules.json
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}
