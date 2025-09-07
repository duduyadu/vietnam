import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
  TextField, 
  Button, 
  Box,
  Slider,
  Alert,
  CircularProgress,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { Grid } from './GridCompat';
import { 
  Save as SaveIcon, 
  Edit as EditIcon,
  TrendingUp as TrendingUpIcon,
  School as SchoolIcon,
  EventNote as EventNoteIcon
} from '@mui/icons-material';
import axios from 'axios';
import { API_URL } from '../config';

interface LearningMetrics {
  id?: number;
  student_id: number;
  metric_date: string;
  attendance_rate: number;
  total_class_days: number;
  attended_days: number;
  class_participation: number;
  participation_notes: string;
  vocabulary_progress: number;
  target_words: number;
  learned_words: number;
  vocabulary_test_score: number;
  teacher_comment: string;
  overall_score?: number;
}

interface StudentLearningMetricsProps {
  studentId: number;
  studentName: string;
}

const StudentLearningMetrics: React.FC<StudentLearningMetricsProps> = ({ 
  studentId, 
  studentName 
}) => {
  const [metrics, setMetrics] = useState<LearningMetrics>({
    student_id: studentId,
    metric_date: new Date().toISOString().split('T')[0],
    attendance_rate: 0,
    total_class_days: 20,
    attended_days: 0,
    class_participation: 3,
    participation_notes: '',
    vocabulary_progress: 0,
    target_words: 100,
    learned_words: 0,
    vocabulary_test_score: 0,
    teacher_comment: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [history, setHistory] = useState<LearningMetrics[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    fetchLatestMetrics();
  }, [studentId]);

  const fetchLatestMetrics = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${API_URL}/api/learning-metrics/student/${studentId}/latest`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data && response.data.id) {
        setMetrics(response.data);
        setIsEditing(false);
      } else {
        setIsEditing(true);
      }
    } catch (err) {
      console.error('Error fetching metrics:', err);
      setIsEditing(true);
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${API_URL}/api/learning-metrics`,
        { 
          headers: { Authorization: `Bearer ${token}` },
          params: { student_id: studentId }
        }
      );
      setHistory(response.data);
      setShowHistory(true);
    } catch (err) {
      console.error('Error fetching history:', err);
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      
      const token = localStorage.getItem('token');
      
      // 출석률 자동 계산
      const calculatedMetrics = {
        ...metrics,
        attendance_rate: metrics.total_class_days > 0 
          ? (metrics.attended_days / metrics.total_class_days) * 100 
          : 0,
        vocabulary_progress: metrics.target_words > 0
          ? (metrics.learned_words / metrics.target_words) * 100
          : 0
      };
      
      if (metrics.id) {
        // 수정
        await axios.put(
          `${API_URL}/api/learning-metrics/${metrics.id}`,
          calculatedMetrics,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setSuccess('학습 메트릭스가 업데이트되었습니다');
      } else {
        // 생성
        await axios.post(
          `${API_URL}/api/learning-metrics`,
          calculatedMetrics,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setSuccess('학습 메트릭스가 저장되었습니다');
      }
      
      setIsEditing(false);
      fetchLatestMetrics();
    } catch (err: any) {
      setError(err.response?.data?.error || '저장 실패');
    } finally {
      setLoading(false);
    }
  };

  const participationLabels = ['매우부족', '부족', '보통', '우수', '매우우수'];

  return (
    <>
      <Card sx={{ mt: 2 }}>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6">
              <SchoolIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              학습 메트릭스
            </Typography>
            <Box>
              <Button
                size="small"
                onClick={fetchHistory}
                startIcon={<EventNoteIcon />}
                sx={{ mr: 1 }}
              >
                이력 보기
              </Button>
              {!isEditing && (
                <IconButton onClick={() => setIsEditing(true)} color="primary">
                  <EditIcon />
                </IconButton>
              )}
            </Box>
          </Box>

          {loading && <CircularProgress />}
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                label="평가 날짜"
                type="date"
                value={metrics.metric_date}
                onChange={(e) => setMetrics({ ...metrics, metric_date: e.target.value })}
                fullWidth
                disabled={!isEditing}
                InputLabelProps={{ shrink: true }}
                sx={{ mb: 2 }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Box>
                <Typography gutterBottom>
                  출석률: {metrics.attendance_rate?.toFixed(1)}%
                </Typography>
                <Box display="flex" gap={2}>
                  <TextField
                    label="전체 수업일"
                    type="number"
                    value={metrics.total_class_days}
                    onChange={(e) => setMetrics({ 
                      ...metrics, 
                      total_class_days: parseInt(e.target.value) || 0 
                    })}
                    disabled={!isEditing}
                    size="small"
                    sx={{ width: 120 }}
                  />
                  <TextField
                    label="출석일"
                    type="number"
                    value={metrics.attended_days}
                    onChange={(e) => setMetrics({ 
                      ...metrics, 
                      attended_days: parseInt(e.target.value) || 0 
                    })}
                    disabled={!isEditing}
                    size="small"
                    sx={{ width: 120 }}
                  />
                </Box>
              </Box>
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography gutterBottom>
                수업 참여도: {participationLabels[metrics.class_participation - 1]}
              </Typography>
              <Slider
                value={metrics.class_participation}
                onChange={(_, value) => setMetrics({ 
                  ...metrics, 
                  class_participation: value as number 
                })}
                disabled={!isEditing}
                min={1}
                max={5}
                marks
                step={1}
                valueLabelDisplay="auto"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Box>
                <Typography gutterBottom>
                  단어 학습도: {metrics.vocabulary_progress?.toFixed(1)}%
                </Typography>
                <Box display="flex" gap={2}>
                  <TextField
                    label="목표 단어"
                    type="number"
                    value={metrics.target_words}
                    onChange={(e) => setMetrics({ 
                      ...metrics, 
                      target_words: parseInt(e.target.value) || 0 
                    })}
                    disabled={!isEditing}
                    size="small"
                    sx={{ width: 120 }}
                  />
                  <TextField
                    label="학습 단어"
                    type="number"
                    value={metrics.learned_words}
                    onChange={(e) => setMetrics({ 
                      ...metrics, 
                      learned_words: parseInt(e.target.value) || 0 
                    })}
                    disabled={!isEditing}
                    size="small"
                    sx={{ width: 120 }}
                  />
                </Box>
              </Box>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                label="단어 시험 점수"
                type="number"
                value={metrics.vocabulary_test_score}
                onChange={(e) => setMetrics({ 
                  ...metrics, 
                  vocabulary_test_score: parseFloat(e.target.value) || 0 
                })}
                disabled={!isEditing}
                fullWidth
                inputProps={{ min: 0, max: 100, step: 0.1 }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                label="참여도 메모"
                value={metrics.participation_notes}
                onChange={(e) => setMetrics({ ...metrics, participation_notes: e.target.value })}
                disabled={!isEditing}
                fullWidth
                multiline
                rows={2}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="교사 코멘트"
                value={metrics.teacher_comment}
                onChange={(e) => setMetrics({ ...metrics, teacher_comment: e.target.value })}
                disabled={!isEditing}
                fullWidth
                multiline
                rows={3}
              />
            </Grid>

            {metrics.overall_score !== undefined && (
              <Grid item xs={12}>
                <Box display="flex" alignItems="center" gap={1}>
                  <TrendingUpIcon color="primary" />
                  <Typography variant="h6">
                    종합 점수: {metrics.overall_score.toFixed(1)}점
                  </Typography>
                </Box>
              </Grid>
            )}
          </Grid>

          {isEditing && (
            <Box display="flex" justifyContent="flex-end" mt={3} gap={2}>
              <Button 
                onClick={() => {
                  setIsEditing(false);
                  fetchLatestMetrics();
                }}
                disabled={loading}
              >
                취소
              </Button>
              <Button 
                variant="contained" 
                onClick={handleSubmit}
                startIcon={<SaveIcon />}
                disabled={loading}
              >
                저장
              </Button>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* 이력 다이얼로그 */}
      <Dialog open={showHistory} onClose={() => setShowHistory(false)} maxWidth="md" fullWidth>
        <DialogTitle>학습 메트릭스 이력</DialogTitle>
        <DialogContent>
          {history.map((item) => (
            <Card key={item.id} sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="subtitle2">
                  {item.metric_date} - 종합점수: {item.overall_score?.toFixed(1)}점
                </Typography>
                <Typography variant="body2">
                  출석률: {item.attendance_rate?.toFixed(1)}% | 
                  참여도: {participationLabels[item.class_participation - 1]} | 
                  단어학습: {item.vocabulary_progress?.toFixed(1)}%
                </Typography>
                {item.teacher_comment && (
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    {item.teacher_comment}
                  </Typography>
                )}
              </CardContent>
            </Card>
          ))}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowHistory(false)}>닫기</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default StudentLearningMetrics;