import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormLabel,
  Typography,
  Box,
  Tabs,
  Tab,
  Paper,
  Chip,
  Alert,
  Divider,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  School,
  Psychology,
  TrendingUp,
  Assignment,
  Save,
  Close,
  Edit,
  Visibility,
  Check,
  Schedule
} from '@mui/icons-material';
import Grid from './GridCompat';
import api from '../services/api';

interface TeacherEvaluationModalProps {
  open: boolean;
  onClose: () => void;
  studentId: number;
  studentName: string;
  evaluationId?: number;
  mode?: 'create' | 'edit' | 'view';
  onSave?: () => void;
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
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const TeacherEvaluationModal: React.FC<TeacherEvaluationModalProps> = ({
  open,
  onClose,
  studentId,
  studentName,
  evaluationId,
  mode = 'create',
  onSave
}) => {
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isReadOnly, setIsReadOnly] = useState(mode === 'view');
  
  // 평가 데이터 상태
  const [evaluation, setEvaluation] = useState({
    student_id: studentId,
    evaluation_type: 'monthly',
    evaluation_period: '',
    evaluation_date: new Date().toISOString().split('T')[0],
    
    // 학업 평가
    attendance_rate: 95,
    participation_grade: 'B',
    academic_progress: '',
    strength_areas: '',
    weakness_areas: '',
    
    // 태도 및 생활
    attitude_rating: 'good',
    attitude_detail: '',
    social_rating: 'good',
    social_detail: '',
    responsibility_rating: 'good',
    responsibility_detail: '',
    
    // 한국 생활 적응
    adaptation_rating: 'good',
    adaptation_detail: '',
    cultural_understanding: '',
    
    // 한국어 능력
    korean_speaking: 'good',
    korean_listening: 'good',
    korean_reading: 'good',
    korean_writing: 'average',
    korean_detail: '',
    
    // 성장 가능성
    growth_potential: 'high',
    growth_detail: '',
    improvement_areas: '',
    
    // 특별 사항
    special_notes: '',
    parent_communication: '',
    next_goals: '',
    
    // 종합 평가
    overall_rating: 'good',
    comprehensive_evaluation: '',
    recommendation: '',
    
    // 상태
    status: 'draft',
    is_visible_to_student: false,
    is_visible_to_parent: false
  });

  // 평가 데이터 로드
  useEffect(() => {
    if (evaluationId && open) {
      loadEvaluation();
    }
  }, [evaluationId, open]);

  const loadEvaluation = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/teacher-evaluations/${evaluationId}`);
      if (response.data.success) {
        setEvaluation(response.data.data);
      }
    } catch (error) {
      console.error('Failed to load evaluation:', error);
      alert('평가 데이터를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      if (mode === 'create') {
        await api.post('/teacher-evaluations', evaluation);
        alert('평가가 생성되었습니다.');
      } else if (mode === 'edit') {
        await api.put(`/teacher-evaluations/${evaluationId}`, evaluation);
        alert('평가가 수정되었습니다.');
      }
      
      if (onSave) onSave();
      onClose();
    } catch (error) {
      console.error('Failed to save evaluation:', error);
      alert('저장에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    try {
      setSaving(true);
      await api.patch(`/teacher-evaluations/${evaluationId}/status`, {
        status: newStatus
      });
      setEvaluation({ ...evaluation, status: newStatus });
      alert(`평가 상태가 ${newStatus}로 변경되었습니다.`);
    } catch (error) {
      console.error('Failed to change status:', error);
      alert('상태 변경에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  };

  const getRatingColor = (rating: string) => {
    switch(rating) {
      case 'excellent': return 'success';
      case 'good': return 'primary';
      case 'average': return 'warning';
      case 'poor': return 'error';
      default: return 'default';
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'draft': return 'default';
      case 'submitted': return 'primary';
      case 'approved': return 'success';
      case 'shared': return 'info';
      default: return 'default';
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{ sx: { height: '90vh' } }}
    >
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">
            {mode === 'create' ? '새 평가 작성' : mode === 'edit' ? '평가 수정' : '평가 조회'}
            - {studentName}
          </Typography>
          <Box>
            {evaluation.status && (
              <Chip 
                label={evaluation.status}
                color={getStatusColor(evaluation.status) as any}
                size="small"
                sx={{ mr: 1 }}
              />
            )}
            {mode === 'view' && (
              <Tooltip title="수정 모드">
                <IconButton onClick={() => setIsReadOnly(false)} size="small">
                  <Edit />
                </IconButton>
              </Tooltip>
            )}
            <IconButton onClick={onClose} size="small">
              <Close />
            </IconButton>
          </Box>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        {/* 기본 정보 */}
        <Paper elevation={2} sx={{ p: 2, mb: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>평가 유형</InputLabel>
                <Select
                  value={evaluation.evaluation_type}
                  onChange={(e) => setEvaluation({...evaluation, evaluation_type: e.target.value})}
                  disabled={isReadOnly}
                >
                  <MenuItem value="monthly">월간 평가</MenuItem>
                  <MenuItem value="quarterly">분기 평가</MenuItem>
                  <MenuItem value="semester">학기 평가</MenuItem>
                  <MenuItem value="special">특별 평가</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                size="small"
                label="평가 기간"
                value={evaluation.evaluation_period}
                onChange={(e) => setEvaluation({...evaluation, evaluation_period: e.target.value})}
                placeholder="예: 2024년 8월"
                disabled={isReadOnly}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                size="small"
                type="date"
                label="평가일"
                value={evaluation.evaluation_date}
                onChange={(e) => setEvaluation({...evaluation, evaluation_date: e.target.value})}
                InputLabelProps={{ shrink: true }}
                disabled={isReadOnly}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>종합 평가</InputLabel>
                <Select
                  value={evaluation.overall_rating}
                  onChange={(e) => setEvaluation({...evaluation, overall_rating: e.target.value})}
                  disabled={isReadOnly}
                >
                  <MenuItem value="excellent">매우 우수</MenuItem>
                  <MenuItem value="good">우수</MenuItem>
                  <MenuItem value="average">보통</MenuItem>
                  <MenuItem value="poor">미흡</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Paper>

        {/* 탭 네비게이션 */}
        <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
          <Tab icon={<School />} label="학업 평가" />
          <Tab icon={<Psychology />} label="생활 태도" />
          <Tab icon={<TrendingUp />} label="성장 가능성" />
          <Tab icon={<Assignment />} label="종합 의견" />
        </Tabs>

        {/* 학업 평가 탭 */}
        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="number"
                label="출석률 (%)"
                value={evaluation.attendance_rate}
                onChange={(e) => setEvaluation({...evaluation, attendance_rate: parseFloat(e.target.value)})}
                InputProps={{ inputProps: { min: 0, max: 100 } }}
                disabled={isReadOnly}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>수업 참여도</InputLabel>
                <Select
                  value={evaluation.participation_grade}
                  onChange={(e) => setEvaluation({...evaluation, participation_grade: e.target.value})}
                  disabled={isReadOnly}
                >
                  <MenuItem value="A">A (매우 적극적)</MenuItem>
                  <MenuItem value="B">B (적극적)</MenuItem>
                  <MenuItem value="C">C (보통)</MenuItem>
                  <MenuItem value="D">D (소극적)</MenuItem>
                  <MenuItem value="F">F (매우 소극적)</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="학업 진척도"
                value={evaluation.academic_progress}
                onChange={(e) => setEvaluation({...evaluation, academic_progress: e.target.value})}
                disabled={isReadOnly}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="강점 영역"
                value={evaluation.strength_areas}
                onChange={(e) => setEvaluation({...evaluation, strength_areas: e.target.value})}
                placeholder="예: 읽기 이해력, 문법 활용"
                disabled={isReadOnly}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="개선 필요 영역"
                value={evaluation.weakness_areas}
                onChange={(e) => setEvaluation({...evaluation, weakness_areas: e.target.value})}
                placeholder="예: 쓰기 표현력, 어휘력"
                disabled={isReadOnly}
              />
            </Grid>

            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom>한국어 능력 평가</Typography>
            </Grid>

            <Grid item xs={12} md={3}>
              <FormControl component="fieldset">
                <FormLabel>말하기</FormLabel>
                <RadioGroup
                  value={evaluation.korean_speaking}
                  onChange={(e) => setEvaluation({...evaluation, korean_speaking: e.target.value})}
                  row
                >
                  <FormControlLabel value="excellent" control={<Radio />} label="매우우수" disabled={isReadOnly} />
                  <FormControlLabel value="good" control={<Radio />} label="우수" disabled={isReadOnly} />
                  <FormControlLabel value="average" control={<Radio />} label="보통" disabled={isReadOnly} />
                  <FormControlLabel value="poor" control={<Radio />} label="미흡" disabled={isReadOnly} />
                </RadioGroup>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={3}>
              <FormControl component="fieldset">
                <FormLabel>듣기</FormLabel>
                <RadioGroup
                  value={evaluation.korean_listening}
                  onChange={(e) => setEvaluation({...evaluation, korean_listening: e.target.value})}
                  row
                >
                  <FormControlLabel value="excellent" control={<Radio />} label="매우우수" disabled={isReadOnly} />
                  <FormControlLabel value="good" control={<Radio />} label="우수" disabled={isReadOnly} />
                  <FormControlLabel value="average" control={<Radio />} label="보통" disabled={isReadOnly} />
                  <FormControlLabel value="poor" control={<Radio />} label="미흡" disabled={isReadOnly} />
                </RadioGroup>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={3}>
              <FormControl component="fieldset">
                <FormLabel>읽기</FormLabel>
                <RadioGroup
                  value={evaluation.korean_reading}
                  onChange={(e) => setEvaluation({...evaluation, korean_reading: e.target.value})}
                  row
                >
                  <FormControlLabel value="excellent" control={<Radio />} label="매우우수" disabled={isReadOnly} />
                  <FormControlLabel value="good" control={<Radio />} label="우수" disabled={isReadOnly} />
                  <FormControlLabel value="average" control={<Radio />} label="보통" disabled={isReadOnly} />
                  <FormControlLabel value="poor" control={<Radio />} label="미흡" disabled={isReadOnly} />
                </RadioGroup>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={3}>
              <FormControl component="fieldset">
                <FormLabel>쓰기</FormLabel>
                <RadioGroup
                  value={evaluation.korean_writing}
                  onChange={(e) => setEvaluation({...evaluation, korean_writing: e.target.value})}
                  row
                >
                  <FormControlLabel value="excellent" control={<Radio />} label="매우우수" disabled={isReadOnly} />
                  <FormControlLabel value="good" control={<Radio />} label="우수" disabled={isReadOnly} />
                  <FormControlLabel value="average" control={<Radio />} label="보통" disabled={isReadOnly} />
                  <FormControlLabel value="poor" control={<Radio />} label="미흡" disabled={isReadOnly} />
                </RadioGroup>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="한국어 능력 종합 평가"
                value={evaluation.korean_detail}
                onChange={(e) => setEvaluation({...evaluation, korean_detail: e.target.value})}
                disabled={isReadOnly}
              />
            </Grid>
          </Grid>
        </TabPanel>

        {/* 생활 태도 탭 */}
        <TabPanel value={tabValue} index={1}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <FormControl component="fieldset">
                <FormLabel>수업 태도</FormLabel>
                <RadioGroup
                  value={evaluation.attitude_rating}
                  onChange={(e) => setEvaluation({...evaluation, attitude_rating: e.target.value})}
                >
                  <FormControlLabel value="excellent" control={<Radio />} label="매우 우수" disabled={isReadOnly} />
                  <FormControlLabel value="good" control={<Radio />} label="우수" disabled={isReadOnly} />
                  <FormControlLabel value="average" control={<Radio />} label="보통" disabled={isReadOnly} />
                  <FormControlLabel value="poor" control={<Radio />} label="미흡" disabled={isReadOnly} />
                </RadioGroup>
              </FormControl>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="수업 태도 상세"
                value={evaluation.attitude_detail}
                onChange={(e) => setEvaluation({...evaluation, attitude_detail: e.target.value})}
                sx={{ mt: 2 }}
                disabled={isReadOnly}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <FormControl component="fieldset">
                <FormLabel>교우 관계</FormLabel>
                <RadioGroup
                  value={evaluation.social_rating}
                  onChange={(e) => setEvaluation({...evaluation, social_rating: e.target.value})}
                >
                  <FormControlLabel value="excellent" control={<Radio />} label="매우 우수" disabled={isReadOnly} />
                  <FormControlLabel value="good" control={<Radio />} label="우수" disabled={isReadOnly} />
                  <FormControlLabel value="average" control={<Radio />} label="보통" disabled={isReadOnly} />
                  <FormControlLabel value="poor" control={<Radio />} label="미흡" disabled={isReadOnly} />
                </RadioGroup>
              </FormControl>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="교우 관계 상세"
                value={evaluation.social_detail}
                onChange={(e) => setEvaluation({...evaluation, social_detail: e.target.value})}
                sx={{ mt: 2 }}
                disabled={isReadOnly}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <FormControl component="fieldset">
                <FormLabel>책임감</FormLabel>
                <RadioGroup
                  value={evaluation.responsibility_rating}
                  onChange={(e) => setEvaluation({...evaluation, responsibility_rating: e.target.value})}
                >
                  <FormControlLabel value="excellent" control={<Radio />} label="매우 우수" disabled={isReadOnly} />
                  <FormControlLabel value="good" control={<Radio />} label="우수" disabled={isReadOnly} />
                  <FormControlLabel value="average" control={<Radio />} label="보통" disabled={isReadOnly} />
                  <FormControlLabel value="poor" control={<Radio />} label="미흡" disabled={isReadOnly} />
                </RadioGroup>
              </FormControl>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="책임감 상세"
                value={evaluation.responsibility_detail}
                onChange={(e) => setEvaluation({...evaluation, responsibility_detail: e.target.value})}
                sx={{ mt: 2 }}
                disabled={isReadOnly}
              />
            </Grid>

            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom>한국 생활 적응</Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl component="fieldset">
                <FormLabel>적응도</FormLabel>
                <RadioGroup
                  value={evaluation.adaptation_rating}
                  onChange={(e) => setEvaluation({...evaluation, adaptation_rating: e.target.value})}
                  row
                >
                  <FormControlLabel value="excellent" control={<Radio />} label="매우 우수" disabled={isReadOnly} />
                  <FormControlLabel value="good" control={<Radio />} label="우수" disabled={isReadOnly} />
                  <FormControlLabel value="average" control={<Radio />} label="보통" disabled={isReadOnly} />
                  <FormControlLabel value="poor" control={<Radio />} label="미흡" disabled={isReadOnly} />
                </RadioGroup>
              </FormControl>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="적응도 상세"
                value={evaluation.adaptation_detail}
                onChange={(e) => setEvaluation({...evaluation, adaptation_detail: e.target.value})}
                sx={{ mt: 2 }}
                disabled={isReadOnly}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                multiline
                rows={5}
                label="한국 문화 이해도"
                value={evaluation.cultural_understanding}
                onChange={(e) => setEvaluation({...evaluation, cultural_understanding: e.target.value})}
                disabled={isReadOnly}
              />
            </Grid>
          </Grid>
        </TabPanel>

        {/* 성장 가능성 탭 */}
        <TabPanel value={tabValue} index={2}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <FormControl component="fieldset">
                <FormLabel>성장 가능성</FormLabel>
                <RadioGroup
                  value={evaluation.growth_potential}
                  onChange={(e) => setEvaluation({...evaluation, growth_potential: e.target.value})}
                  row
                >
                  <FormControlLabel value="very_high" control={<Radio />} label="매우 높음" disabled={isReadOnly} />
                  <FormControlLabel value="high" control={<Radio />} label="높음" disabled={isReadOnly} />
                  <FormControlLabel value="medium" control={<Radio />} label="보통" disabled={isReadOnly} />
                  <FormControlLabel value="low" control={<Radio />} label="낮음" disabled={isReadOnly} />
                </RadioGroup>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="성장 가능성 상세 평가"
                value={evaluation.growth_detail}
                onChange={(e) => setEvaluation({...evaluation, growth_detail: e.target.value})}
                disabled={isReadOnly}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="개선 권장 사항"
                value={evaluation.improvement_areas}
                onChange={(e) => setEvaluation({...evaluation, improvement_areas: e.target.value})}
                placeholder="학생이 더 성장하기 위해 필요한 구체적인 개선 사항을 작성하세요"
                disabled={isReadOnly}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="다음 목표"
                value={evaluation.next_goals}
                onChange={(e) => setEvaluation({...evaluation, next_goals: e.target.value})}
                placeholder="다음 평가 기간까지 달성해야 할 목표를 작성하세요"
                disabled={isReadOnly}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="특이사항"
                value={evaluation.special_notes}
                onChange={(e) => setEvaluation({...evaluation, special_notes: e.target.value})}
                placeholder="특별히 기록해야 할 사항이 있으면 작성하세요"
                disabled={isReadOnly}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="학부모 전달 사항"
                value={evaluation.parent_communication}
                onChange={(e) => setEvaluation({...evaluation, parent_communication: e.target.value})}
                placeholder="학부모님께 전달할 내용을 작성하세요"
                disabled={isReadOnly}
              />
            </Grid>
          </Grid>
        </TabPanel>

        {/* 종합 의견 탭 */}
        <TabPanel value={tabValue} index={3}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={6}
                label="종합 평가 의견"
                value={evaluation.comprehensive_evaluation}
                onChange={(e) => setEvaluation({...evaluation, comprehensive_evaluation: e.target.value})}
                placeholder="학생에 대한 종합적인 평가 의견을 작성하세요"
                disabled={isReadOnly}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={6}
                label="추천사 / 조언"
                value={evaluation.recommendation}
                onChange={(e) => setEvaluation({...evaluation, recommendation: e.target.value})}
                placeholder="학생의 진로나 학습에 대한 추천사나 조언을 작성하세요"
                disabled={isReadOnly}
              />
            </Grid>

            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom>공개 설정</Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Radio
                    checked={evaluation.is_visible_to_student}
                    onChange={(e) => setEvaluation({...evaluation, is_visible_to_student: e.target.checked})}
                    disabled={isReadOnly}
                  />
                }
                label="학생에게 공개"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Radio
                    checked={evaluation.is_visible_to_parent}
                    onChange={(e) => setEvaluation({...evaluation, is_visible_to_parent: e.target.checked})}
                    disabled={isReadOnly}
                  />
                }
                label="학부모에게 공개"
              />
            </Grid>
          </Grid>
        </TabPanel>
      </DialogContent>

      <DialogActions>
        <Box display="flex" justifyContent="space-between" width="100%" px={2}>
          <Box>
            {mode !== 'create' && evaluation.status === 'draft' && (
              <Button
                variant="outlined"
                color="primary"
                onClick={() => handleStatusChange('submitted')}
                startIcon={<Check />}
              >
                제출
              </Button>
            )}
            {mode !== 'create' && evaluation.status === 'submitted' && (
              <Button
                variant="outlined"
                color="success"
                onClick={() => handleStatusChange('approved')}
                startIcon={<Check />}
                disabled={!['admin'].includes('admin')} // 관리자 권한 체크 필요
              >
                승인
              </Button>
            )}
          </Box>
          <Box>
            <Button onClick={onClose} color="inherit">
              취소
            </Button>
            {!isReadOnly && (
              <Button
                onClick={handleSave}
                variant="contained"
                color="primary"
                disabled={saving}
                startIcon={<Save />}
                sx={{ ml: 1 }}
              >
                {mode === 'create' ? '생성' : '저장'}
              </Button>
            )}
          </Box>
        </Box>
      </DialogActions>
    </Dialog>
  );
};

export default TeacherEvaluationModal;