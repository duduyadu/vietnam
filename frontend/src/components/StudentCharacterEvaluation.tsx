import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Box,
  Rating,
  Alert,
  CircularProgress,
  IconButton,
  Tabs,
  Tab,
  Chip,
  LinearProgress
} from '@mui/material';
import { Grid } from './GridCompat';
import {
  Save as SaveIcon,
  Edit as EditIcon,
  Psychology as PsychologyIcon,
  Groups as GroupsIcon,
  School as SchoolIcon,
  TrendingUp as GrowthIcon,
  EmojiPeople as PeopleIcon,
  StarBorder as StarBorderIcon
} from '@mui/icons-material';
import axios from 'axios';
import { API_URL } from '../config';

interface CharacterEvaluation {
  id?: number;
  student_id: number;
  evaluation_date: string;
  evaluation_period: string;
  social_relationship: number;
  social_notes: string;
  class_attitude: number;
  attitude_notes: string;
  korea_adaptation: number;
  adaptation_notes: string;
  growth_potential: number;
  growth_notes: string;
  leadership: number;
  responsibility: number;
  creativity: number;
  communication: number;
  overall_character_score?: number;
  strengths: string;
  improvement_areas: string;
  counselor_opinion: string;
  teacher_opinion: string;
}

interface StudentCharacterEvaluationProps {
  studentId: number;
  studentName: string;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div hidden={value !== index} {...other}>
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

const evaluationCriteria = [
  { 
    key: 'social_relationship', 
    label: '교우 관계', 
    icon: <GroupsIcon />,
    description: '친구들과의 관계, 협력, 배려'
  },
  { 
    key: 'class_attitude', 
    label: '수업 태도', 
    icon: <SchoolIcon />,
    description: '집중력, 참여도, 학습 의욕'
  },
  { 
    key: 'korea_adaptation', 
    label: '한국 생활 적응도', 
    icon: <PeopleIcon />,
    description: '문화 적응, 언어 소통, 생활 적응'
  },
  { 
    key: 'growth_potential', 
    label: '성장 가능성', 
    icon: <GrowthIcon />,
    description: '발전 가능성, 목표 의식, 자기 개발'
  },
  { 
    key: 'leadership', 
    label: '리더십', 
    icon: <PsychologyIcon />,
    description: '주도성, 책임감, 영향력'
  },
  { 
    key: 'responsibility', 
    label: '책임감', 
    icon: <StarBorderIcon />,
    description: '약속 이행, 과제 수행, 신뢰성'
  },
  { 
    key: 'creativity', 
    label: '창의성', 
    icon: <PsychologyIcon />,
    description: '독창적 사고, 문제 해결, 새로운 시도'
  },
  { 
    key: 'communication', 
    label: '의사소통', 
    icon: <GroupsIcon />,
    description: '표현력, 경청, 소통 능력'
  }
];

const StudentCharacterEvaluation: React.FC<StudentCharacterEvaluationProps> = ({
  studentId,
  studentName
}) => {
  const [evaluation, setEvaluation] = useState<CharacterEvaluation>({
    student_id: studentId,
    evaluation_date: new Date().toISOString().split('T')[0],
    evaluation_period: `${new Date().getFullYear()}-${Math.ceil((new Date().getMonth() + 1) / 6)}학기`,
    social_relationship: 3,
    social_notes: '',
    class_attitude: 3,
    attitude_notes: '',
    korea_adaptation: 3,
    adaptation_notes: '',
    growth_potential: 3,
    growth_notes: '',
    leadership: 3,
    responsibility: 3,
    creativity: 3,
    communication: 3,
    strengths: '',
    improvement_areas: '',
    counselor_opinion: '',
    teacher_opinion: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    fetchLatestEvaluation();
  }, [studentId]);

  const fetchLatestEvaluation = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${API_URL}/api/character-evaluations/student/${studentId}/latest`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data && response.data.id) {
        setEvaluation(response.data);
        setIsEditing(false);
      } else {
        setIsEditing(true);
      }
    } catch (err) {
      console.error('Error fetching evaluation:', err);
      setIsEditing(true);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      
      const token = localStorage.getItem('token');
      
      if (evaluation.id) {
        // 수정
        await axios.put(
          `${API_URL}/api/character-evaluations/${evaluation.id}`,
          evaluation,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setSuccess('인성평가가 업데이트되었습니다');
      } else {
        // 생성
        await axios.post(
          `${API_URL}/api/character-evaluations`,
          evaluation,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setSuccess('인성평가가 저장되었습니다');
      }
      
      setIsEditing(false);
      fetchLatestEvaluation();
    } catch (err: any) {
      setError(err.response?.data?.error || '저장 실패');
    } finally {
      setLoading(false);
    }
  };

  const handleRatingChange = (key: string, value: number | null) => {
    setEvaluation({
      ...evaluation,
      [key]: value || 3
    });
  };

  const handleNotesChange = (key: string, value: string) => {
    setEvaluation({
      ...evaluation,
      [key]: value
    });
  };

  const getScoreLabel = (score: number) => {
    const labels = ['매우부족', '부족', '보통', '우수', '매우우수'];
    return labels[score - 1] || '보통';
  };

  const getScoreColor = (score: number) => {
    if (score >= 4) return 'success';
    if (score >= 3) return 'primary';
    return 'warning';
  };

  return (
    <Card sx={{ mt: 2 }}>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6">
            <PsychologyIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            생활 및 인성 평가
          </Typography>
          <Box>
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

        {evaluation.overall_character_score !== undefined && (
          <Box mb={3}>
            <Typography variant="subtitle1" gutterBottom>
              종합 인성 점수
            </Typography>
            <Box display="flex" alignItems="center" gap={2}>
              <LinearProgress 
                variant="determinate" 
                value={evaluation.overall_character_score} 
                sx={{ flexGrow: 1, height: 10, borderRadius: 5 }}
              />
              <Typography variant="h6" color="primary">
                {evaluation.overall_character_score.toFixed(1)}점
              </Typography>
            </Box>
          </Box>
        )}

        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12} md={6}>
            <TextField
              label="평가 날짜"
              type="date"
              value={evaluation.evaluation_date}
              onChange={(e) => setEvaluation({ ...evaluation, evaluation_date: e.target.value })}
              fullWidth
              disabled={!isEditing}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              label="평가 기간"
              value={evaluation.evaluation_period}
              onChange={(e) => setEvaluation({ ...evaluation, evaluation_period: e.target.value })}
              fullWidth
              disabled={!isEditing}
              placeholder="예: 2024-1학기"
            />
          </Grid>
        </Grid>

        <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)}>
          <Tab label="기본 평가" />
          <Tab label="세부 평가" />
          <Tab label="종합 의견" />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            {evaluationCriteria.slice(0, 4).map((criteria) => (
              <Grid item xs={12} md={6} key={criteria.key}>
                <Card variant="outlined">
                  <CardContent>
                    <Box display="flex" alignItems="center" mb={1}>
                      {criteria.icon}
                      <Typography variant="subtitle1" sx={{ ml: 1 }}>
                        {criteria.label}
                      </Typography>
                      <Chip 
                        label={getScoreLabel(evaluation[criteria.key as keyof CharacterEvaluation] as number)}
                        size="small"
                        color={getScoreColor(evaluation[criteria.key as keyof CharacterEvaluation] as number) as any}
                        sx={{ ml: 'auto' }}
                      />
                    </Box>
                    <Typography variant="caption" color="text.secondary" display="block" mb={1}>
                      {criteria.description}
                    </Typography>
                    <Rating
                      value={evaluation[criteria.key as keyof CharacterEvaluation] as number}
                      onChange={(_, value) => handleRatingChange(criteria.key, value)}
                      disabled={!isEditing}
                    />
                    <TextField
                      placeholder="평가 메모"
                      value={evaluation[`${criteria.key.split('_')[1]}_notes` as keyof CharacterEvaluation] || ''}
                      onChange={(e) => handleNotesChange(`${criteria.key.split('_')[1]}_notes`, e.target.value)}
                      disabled={!isEditing}
                      fullWidth
                      multiline
                      rows={2}
                      size="small"
                      sx={{ mt: 1 }}
                    />
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Grid container spacing={3}>
            {evaluationCriteria.slice(4).map((criteria) => (
              <Grid item xs={12} md={6} key={criteria.key}>
                <Card variant="outlined">
                  <CardContent>
                    <Box display="flex" alignItems="center" mb={1}>
                      {criteria.icon}
                      <Typography variant="subtitle1" sx={{ ml: 1 }}>
                        {criteria.label}
                      </Typography>
                      <Chip 
                        label={getScoreLabel(evaluation[criteria.key as keyof CharacterEvaluation] as number)}
                        size="small"
                        color={getScoreColor(evaluation[criteria.key as keyof CharacterEvaluation] as number) as any}
                        sx={{ ml: 'auto' }}
                      />
                    </Box>
                    <Typography variant="caption" color="text.secondary" display="block" mb={1}>
                      {criteria.description}
                    </Typography>
                    <Rating
                      value={evaluation[criteria.key as keyof CharacterEvaluation] as number}
                      onChange={(_, value) => handleRatingChange(criteria.key, value)}
                      disabled={!isEditing}
                    />
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                label="강점"
                value={evaluation.strengths}
                onChange={(e) => setEvaluation({ ...evaluation, strengths: e.target.value })}
                disabled={!isEditing}
                fullWidth
                multiline
                rows={4}
                placeholder="학생의 강점과 우수한 점을 작성해주세요"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="개선점"
                value={evaluation.improvement_areas}
                onChange={(e) => setEvaluation({ ...evaluation, improvement_areas: e.target.value })}
                disabled={!isEditing}
                fullWidth
                multiline
                rows={4}
                placeholder="개선이 필요한 부분을 작성해주세요"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="상담사 의견"
                value={evaluation.counselor_opinion}
                onChange={(e) => setEvaluation({ ...evaluation, counselor_opinion: e.target.value })}
                disabled={!isEditing}
                fullWidth
                multiline
                rows={3}
                placeholder="상담사의 종합 의견을 작성해주세요"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="교사 의견"
                value={evaluation.teacher_opinion}
                onChange={(e) => setEvaluation({ ...evaluation, teacher_opinion: e.target.value })}
                disabled={!isEditing}
                fullWidth
                multiline
                rows={3}
                placeholder="교사의 종합 의견을 작성해주세요"
              />
            </Grid>
          </Grid>
        </TabPanel>

        {isEditing && (
          <Box display="flex" justifyContent="flex-end" mt={3} gap={2}>
            <Button 
              onClick={() => {
                setIsEditing(false);
                fetchLatestEvaluation();
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
  );
};

export default StudentCharacterEvaluation;