import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  LinearProgress,
  Alert,
  Chip,
  Divider,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Tooltip
} from '@mui/material';
import Grid from './GridCompat';
import {
  TrendingUp,
  TrendingDown,
  TrendingFlat,
  School,
  Psychology,
  AutoAwesome,
  GetApp,
  Refresh,
  Timeline,
  EmojiEvents
} from '@mui/icons-material';
import api from '../services/api';

interface StudentRecordAutoProps {
  studentId: number;
  studentName?: string;
}

interface RecordData {
  student_info: any;
  attitude_evaluation: string;
  growth_story: string;
  learning_strategy: string;
  vocabulary_progress: {
    known_words: number;
    total_words: number;
    percentage: number;
    level_description: string;
  };
  topik_analysis: {
    pattern: {
      trend: string;
      pattern: string;
      description: string;
    };
    strengths_weaknesses: {
      strengths: string[];
      weaknesses: string[];
      balanced: boolean;
    };
    latest_score: any;
    total_tests: number;
    average_score: number;
  };
  consultation_summary: any;
  recommendation: string;
  special_achievements: any[];
}

interface PredictionData {
  current_score: number;
  current_level: string;
  trend_slope: string;
  next_prediction: number;
  tests_to_target: number;
  target_score: number;
  confidence: string;
  recommendation: string;
}

const StudentRecordAuto: React.FC<StudentRecordAutoProps> = ({ studentId, studentName }) => {
  const [loading, setLoading] = useState(false);
  const [recordData, setRecordData] = useState<RecordData | null>(null);
  const [prediction, setPrediction] = useState<PredictionData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (studentId) {
      loadRecordData();
      loadPrediction();
    }
  }, [studentId]);

  const loadRecordData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`/auto-record/generate/${studentId}`);
      setRecordData(response.data.data);
    } catch (err: any) {
      setError(err.response?.data?.error || '데이터를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const loadPrediction = async () => {
    try {
      const response = await api.get(`/auto-record/predict/${studentId}`);
      if (response.data.success) {
        setPrediction(response.data.analysis);
      }
    } catch (err) {
      console.error('Prediction load error:', err);
    }
  };

  const downloadPDF = async () => {
    try {
      const response = await api.post(`/auto-record/generate-pdf/${studentId}`, 
        { consultationId: null },
        { responseType: 'blob' }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `AI_생활기록부_${studentName || studentId}_${new Date().toISOString().split('T')[0]}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError('PDF 생성 중 오류가 발생했습니다.');
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'rapid_improvement':
      case 'steady_improvement':
      case 'gradual_improvement':
        return <TrendingUp color="success" />;
      case 'stable':
        return <TrendingFlat color="info" />;
      case 'needs_support':
        return <TrendingDown color="warning" />;
      default:
        return <TrendingFlat />;
    }
  };

  const getConfidenceColor = (confidence: string) => {
    switch (confidence) {
      case 'high': return 'success';
      case 'medium': return 'warning';
      default: return 'error';
    }
  };

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <LinearProgress />
        <Typography sx={{ mt: 2, textAlign: 'center' }}>
          AI가 생활기록부를 자동 생성 중입니다...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 3 }}>
        {error}
      </Alert>
    );
  }

  if (!recordData) {
    return null;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">
          <AutoAwesome sx={{ mr: 1, verticalAlign: 'middle' }} />
          AI 자동 생성 생활기록부
        </Typography>
        <Box>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={loadRecordData}
            sx={{ mr: 2 }}
          >
            새로고침
          </Button>
          <Button
            variant="contained"
            startIcon={<GetApp />}
            onClick={downloadPDF}
          >
            PDF 다운로드
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* 단어 학습 진도 - 새로 추가 */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                📚 단어 학습 진도
              </Typography>
              
              {recordData.vocabulary_progress && (
                <>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      필수 1000단어 중 {recordData.vocabulary_progress.known_words}단어 학습 완료
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                      <Box sx={{ width: '100%', mr: 1 }}>
                        <LinearProgress 
                          variant="determinate" 
                          value={recordData.vocabulary_progress.percentage} 
                          sx={{ height: 10, borderRadius: 5 }}
                        />
                      </Box>
                      <Box sx={{ minWidth: 35 }}>
                        <Typography variant="body2" color="text.secondary">
                          {recordData.vocabulary_progress.percentage}%
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                  <Typography variant="body2" sx={{ color: 'primary.main' }}>
                    {recordData.vocabulary_progress.level_description}
                  </Typography>
                </>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* TOPIK 성장 분석 */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <Timeline sx={{ mr: 1, verticalAlign: 'middle' }} />
                TOPIK 성장 분석
              </Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                {getTrendIcon(recordData.topik_analysis.pattern.trend)}
                <Box sx={{ ml: 2 }}>
                  <Typography variant="subtitle1" fontWeight="bold">
                    {recordData.topik_analysis.pattern.pattern}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {recordData.topik_analysis.pattern.description}
                  </Typography>
                </Box>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'primary.light', color: 'white' }}>
                    <Typography variant="h4">
                      {recordData.topik_analysis.average_score}
                    </Typography>
                    <Typography variant="caption">평균 점수</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={6}>
                  <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'secondary.light', color: 'white' }}>
                    <Typography variant="h4">
                      {recordData.topik_analysis.total_tests}
                    </Typography>
                    <Typography variant="caption">응시 횟수</Typography>
                  </Paper>
                </Grid>
              </Grid>

              {recordData.topik_analysis.strengths_weaknesses && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>강점 영역</Typography>
                  <Box sx={{ mb: 1 }}>
                    {recordData.topik_analysis.strengths_weaknesses.strengths.map((strength, idx) => (
                      <Chip
                        key={idx}
                        label={strength}
                        color="success"
                        size="small"
                        sx={{ mr: 1 }}
                      />
                    ))}
                  </Box>
                  
                  {recordData.topik_analysis.strengths_weaknesses.weaknesses[0] !== '특별한 약점 없음' && (
                    <>
                      <Typography variant="subtitle2" gutterBottom>보완 필요</Typography>
                      <Box>
                        {recordData.topik_analysis.strengths_weaknesses.weaknesses.map((weakness, idx) => (
                          <Chip
                            key={idx}
                            label={weakness}
                            color="warning"
                            size="small"
                            sx={{ mr: 1 }}
                          />
                        ))}
                      </Box>
                    </>
                  )}
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* AI 예측 분석 */}
        {prediction && (
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  <Psychology sx={{ mr: 1, verticalAlign: 'middle' }} />
                  AI 예측 분석
                </Typography>

                <Alert severity={getConfidenceColor(prediction.confidence)} sx={{ mb: 2 }}>
                  신뢰도: {prediction.confidence === 'high' ? '높음' : prediction.confidence === 'medium' ? '보통' : '낮음'}
                </Alert>

                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    현재 점수
                  </Typography>
                  <Typography variant="h5">
                    {prediction.current_score}점 ({prediction.current_level})
                  </Typography>
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    다음 회차 예상 점수
                  </Typography>
                  <Typography variant="h5" color="primary">
                    {prediction.next_prediction}점
                  </Typography>
                </Box>

                {prediction.tests_to_target > 0 && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      목표 달성 예상 시기
                    </Typography>
                    <Typography variant="body1">
                      약 <strong>{prediction.tests_to_target}회</strong> 더 응시 필요
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      (목표: {prediction.target_score}점)
                    </Typography>
                  </Box>
                )}

                <Alert severity="info" icon={<School />}>
                  {prediction.recommendation}
                </Alert>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* 학습 태도 평가 */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                학습 태도 평가
              </Typography>
              <Typography variant="body1" paragraph sx={{ lineHeight: 1.8 }}>
                {recordData.attitude_evaluation}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* 성장 스토리 */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                성장 스토리
              </Typography>
              <Typography variant="body1" sx={{ lineHeight: 1.8 }}>
                {recordData.growth_story}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* 학습 전략 */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                맞춤형 학습 전략
              </Typography>
              <Typography variant="body1" sx={{ lineHeight: 1.8 }}>
                {recordData.learning_strategy}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* 특별 성과 */}
        {recordData.special_achievements && recordData.special_achievements.length > 0 && (
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  <EmojiEvents sx={{ mr: 1, verticalAlign: 'middle' }} />
                  특별 성과
                </Typography>
                <List>
                  {recordData.special_achievements.map((achievement, idx) => (
                    <ListItem key={idx}>
                      <ListItemIcon>
                        <EmojiEvents color="warning" />
                      </ListItemIcon>
                      <ListItemText
                        primary={achievement.achievement}
                        secondary={achievement.date}
                      />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>
        )}

      </Grid>

      {/* 교육기관 추천사 - 맨 마지막으로 이동 */}
      <Card sx={{ bgcolor: 'info.light', mt: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            🏫 교육기관 종합 평가
          </Typography>
          <Typography variant="body1" sx={{ lineHeight: 1.8, fontStyle: 'italic' }}>
            "{recordData.recommendation}"
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default StudentRecordAuto;