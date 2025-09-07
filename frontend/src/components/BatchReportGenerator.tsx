import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Alert,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  TextField,
  Divider,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  CheckCircle,
  Error as ErrorIcon,
  HourglassEmpty,
  Schedule,
  Refresh,
  GetApp,
  Description
} from '@mui/icons-material';

interface Student {
  student_id: number;
  student_code: string;
  student_name: string;
}

interface ReportProgress {
  student_id: number;
  student_name: string;
  student_code: string;
  status: 'waiting' | 'processing' | 'completed' | 'failed';
  error?: string;
  reportId?: number;
}

interface BatchReportGeneratorProps {
  open: boolean;
  onClose: () => void;
  selectedStudents: Student[];
  onComplete: () => void;
}

const BatchReportGenerator: React.FC<BatchReportGeneratorProps> = ({
  open,
  onClose,
  selectedStudents,
  onComplete
}) => {
  const [language, setLanguage] = useState<'ko' | 'vi'>('ko');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState<ReportProgress[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (open && selectedStudents.length > 0) {
      // 선택된 학생들로 진행 상황 초기화
      setProgress(
        selectedStudents.map(student => ({
          student_id: student.student_id,
          student_name: student.student_name,
          student_code: student.student_code,
          status: 'waiting'
        }))
      );
    }
  }, [open, selectedStudents]);

  const startBatchGeneration = async () => {
    setIsGenerating(true);
    
    // 순차적으로 보고서 생성
    for (let i = 0; i < selectedStudents.length; i++) {
      setCurrentIndex(i);
      
      // 현재 학생 처리 중으로 표시
      setProgress(prev => prev.map((p, idx) => 
        idx === i ? { ...p, status: 'processing' } : p
      ));

      try {
        // TODO: 실제 API 호출
        await generateReportForStudent(selectedStudents[i], language, dateRange);
        
        // 성공 시 완료로 표시
        setProgress(prev => prev.map((p, idx) => 
          idx === i ? { ...p, status: 'completed' } : p
        ));
      } catch (error) {
        // 실패 시 에러로 표시
        setProgress(prev => prev.map((p, idx) => 
          idx === i ? { ...p, status: 'failed', error: '생성 실패' } : p
        ));
      }

      // 서버 부하 방지를 위한 딜레이
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    setIsGenerating(false);
    onComplete();
  };

  const generateReportForStudent = async (
    student: Student, 
    lang: 'ko' | 'vi', 
    dates: { start: string; end: string }
  ) => {
    // 실제 API 호출 구현
    const response = await fetch('/api/reports/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({
        student_id: student.student_id,
        template_code: 'consultation_comprehensive',
        language: lang,
        date_range: dates.start || dates.end ? dates : undefined
      })
    });

    if (!response.ok) {
      throw new Error('Failed to generate report');
    }

    return response.json();
  };

  const retryFailed = async () => {
    const failedStudents = progress
      .filter(p => p.status === 'failed')
      .map(p => selectedStudents.find(s => s.student_id === p.student_id)!)
      .filter(Boolean);

    if (failedStudents.length > 0) {
      // 실패한 학생들만 다시 시도
      for (const student of failedStudents) {
        const idx = progress.findIndex(p => p.student_id === student.student_id);
        setProgress(prev => prev.map((p, i) => 
          i === idx ? { ...p, status: 'processing' } : p
        ));

        try {
          await generateReportForStudent(student, language, dateRange);
          setProgress(prev => prev.map((p, i) => 
            i === idx ? { ...p, status: 'completed' } : p
          ));
        } catch (error) {
          // 여전히 실패
        }
      }
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'waiting':
        return <Schedule color="action" />;
      case 'processing':
        return <HourglassEmpty color="primary" />;
      case 'completed':
        return <CheckCircle color="success" />;
      case 'failed':
        return <ErrorIcon color="error" />;
      default:
        return <Schedule />;
    }
  };

  const completedCount = progress.filter(p => p.status === 'completed').length;
  const failedCount = progress.filter(p => p.status === 'failed').length;
  const progressPercentage = (completedCount / selectedStudents.length) * 100;

  return (
    <Dialog 
      open={open} 
      onClose={!isGenerating ? onClose : undefined}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        일괄 보고서 생성
        {selectedStudents.length > 0 && (
          <Chip 
            label={`${selectedStudents.length}명 선택됨`}
            color="primary"
            size="small"
            sx={{ ml: 2 }}
          />
        )}
      </DialogTitle>

      <DialogContent>
        {!isGenerating ? (
          // 설정 화면
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 2 }}>
            <Alert severity="info">
              선택된 {selectedStudents.length}명의 학생에 대한 보고서를 일괄 생성합니다.
            </Alert>

            <Box>
              <Typography variant="subtitle2" gutterBottom>
                선택된 학생
              </Typography>
              <Box sx={{ 
                maxHeight: 150, 
                overflowY: 'auto', 
                border: '1px solid #e0e0e0',
                borderRadius: 1,
                p: 1
              }}>
                {selectedStudents.map((student, idx) => (
                  <Chip 
                    key={student.student_id}
                    label={`${student.student_name} (${student.student_code})`}
                    size="small"
                    sx={{ m: 0.5 }}
                  />
                ))}
              </Box>
            </Box>

            <FormControl component="fieldset">
              <FormLabel component="legend">보고서 언어</FormLabel>
              <RadioGroup
                row
                value={language}
                onChange={(e) => setLanguage(e.target.value as 'ko' | 'vi')}
              >
                <FormControlLabel value="ko" control={<Radio />} label="한국어" />
                <FormControlLabel value="vi" control={<Radio />} label="베트남어" />
              </RadioGroup>
            </FormControl>

            <Box>
              <Typography variant="subtitle2" gutterBottom>
                보고서 대상 기간 (선택사항)
              </Typography>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  type="date"
                  label="시작일"
                  value={dateRange.start}
                  onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                />
                <TextField
                  type="date"
                  label="종료일"
                  value={dateRange.end}
                  onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                />
              </Box>
            </Box>
          </Box>
        ) : (
          // 진행 상황 화면
          <Box sx={{ mt: 2 }}>
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                생성 진행 중...
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={progressPercentage}
                sx={{ height: 10, borderRadius: 5 }}
              />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  {completedCount} / {selectedStudents.length} 완료
                </Typography>
                {failedCount > 0 && (
                  <Typography variant="body2" color="error">
                    {failedCount}개 실패
                  </Typography>
                )}
              </Box>
            </Box>

            <Divider sx={{ my: 2 }} />

            <List sx={{ maxHeight: 300, overflowY: 'auto' }}>
              {progress.map((item, idx) => (
                <ListItem key={item.student_id}>
                  <ListItemIcon>
                    {getStatusIcon(item.status)}
                  </ListItemIcon>
                  <ListItemText
                    primary={`${item.student_name} (${item.student_code})`}
                    secondary={
                      item.status === 'processing' ? '생성 중...' :
                      item.status === 'completed' ? '완료' :
                      item.status === 'failed' ? item.error || '실패' :
                      '대기 중'
                    }
                  />
                  {item.status === 'failed' && (
                    <Tooltip title="재시도">
                      <IconButton size="small" onClick={() => retryFailed()}>
                        <Refresh />
                      </IconButton>
                    </Tooltip>
                  )}
                </ListItem>
              ))}
            </List>
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        {!isGenerating ? (
          <>
            <Button onClick={onClose}>취소</Button>
            <Button 
              onClick={startBatchGeneration}
              variant="contained"
              startIcon={<Description />}
            >
              일괄 생성 시작
            </Button>
          </>
        ) : (
          <>
            {completedCount === selectedStudents.length ? (
              <>
                <Button 
                  startIcon={<GetApp />}
                  variant="contained"
                  color="success"
                >
                  전체 다운로드 (ZIP)
                </Button>
                <Button onClick={onClose}>닫기</Button>
              </>
            ) : (
              <Button disabled>
                생성 중... ({completedCount}/{selectedStudents.length})
              </Button>
            )}
          </>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default BatchReportGenerator;