import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Box,
  Alert,
  Tabs,
  Tab,
  Typography,
  FormControlLabel,
  RadioGroup,
  Radio,
  Chip
} from '@mui/material';
import { Grid } from './GridCompat';
import { consultationsAPI } from '../services/api';
import { extractErrorMessage } from '../utils/errorHandler';

interface ConsultationType {
  type_code: string;
  type_name_ko: string;
  type_name_vi: string;
  category: string;
  required_fields: string[];
}

interface EnhancedConsultationModalProps {
  open: boolean;
  onClose: () => void;
  studentId: string;
  studentName: string;
  onSuccess: () => void;
  consultation?: any;
}

const CONSULTATION_TYPES: ConsultationType[] = [
  // 일반 상담 (일상적인 상담 기록용)
  {
    type_code: 'general_consultation',
    type_name_ko: '일반 상담',
    type_name_vi: 'Tư vấn chung',
    category: 'consultation',
    required_fields: ['content_ko', 'counselor_evaluation']
  },
  {
    type_code: 'career_consultation',
    type_name_ko: '진로/진학 상담',
    type_name_vi: 'Tư vấn nghề nghiệp',
    category: 'consultation',
    required_fields: ['content_ko', 'next_goals', 'counselor_evaluation']
  },
  {
    type_code: 'adaptation_consultation',
    type_name_ko: '적응 상담',
    type_name_vi: 'Tư vấn thích ứng',
    category: 'consultation',
    required_fields: ['content_ko', 'counselor_evaluation']
  },
  {
    type_code: 'visa_consultation',
    type_name_ko: '비자/서류 상담',
    type_name_vi: 'Tư vấn visa',
    category: 'consultation',
    required_fields: ['content_ko', 'action_items', 'counselor_evaluation']
  },
  
  // TOPIK 모의고사 기록
  {
    type_code: 'topik_mock',
    type_name_ko: 'TOPIK 모의고사 결과',
    type_name_vi: 'Kết quả thi thử TOPIK',
    category: 'evaluation',
    required_fields: ['topik_test_number', 'topik_reading', 'topik_listening', 'topik_writing', 'topik_total']
  },
  
  // 특별활동 기록 (일상 기록용)
  {
    type_code: 'special_activity',
    type_name_ko: '특별활동 참여 기록',
    type_name_vi: 'Hoạt động ngoại khóa',
    category: 'activity',
    required_fields: ['club_activities', 'volunteer_activities']
  }
];

export const EnhancedConsultationModal: React.FC<EnhancedConsultationModalProps> = ({
  open,
  onClose,
  studentId,
  studentName,
  onSuccess,
  consultation
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [selectedType, setSelectedType] = useState<ConsultationType>(CONSULTATION_TYPES[0]);
  
  const [formData, setFormData] = useState<any>({
    student_id: studentId,
    consultation_date: new Date().toISOString().split('T')[0],
    consultation_type: 'general_consultation',
    evaluation_category: '',
    evaluation_period: '',
    
    // 상담 내용
    content_ko: '',
    content_vi: '',
    counselor_evaluation: '',
    improvements: '',
    next_goals: '',
    student_opinion: '',
    action_items: '',
    
    // 학업 평가
    attendance_rate: 0,
    participation_grade: 'C',
    vocabulary_known: 0,
    strength_areas: '',
    weakness_areas: '',
    learning_strategy: '',
    academic_evaluation: '',
    
    // 생활 평가
    social_rating: 'average',
    social_relationship: '',
    attitude_rating: 'average',
    class_attitude: '',
    adaptation_rating: 'average',
    adaptation_level: '',
    growth_rating: 'average',
    growth_potential: '',
    
    // 특별활동
    club_activities: '',
    volunteer_activities: '',
    awards: '',
    portfolio_status: '',
    
    // TOPIK
    topik_test_number: 0,
    topik_reading: 0,
    topik_listening: 0,
    topik_writing: 0,
    topik_total: 0,
    
    // 종합
    korean_evaluation: '',
    final_recommendation: '',
    overall_score: 0,
    
    next_consultation_date: ''
  });

  useEffect(() => {
    if (consultation) {
      setFormData({
        ...formData,
        ...consultation
      });
    }
  }, [consultation]);

  const handleTypeChange = (typeCode: string) => {
    const type = CONSULTATION_TYPES.find(t => t.type_code === typeCode);
    if (type) {
      setSelectedType(type);
      setFormData({
        ...formData,
        consultation_type: typeCode,
        evaluation_category: type.category
      });
    }
  };

  const renderFieldsByType = () => {
    const { required_fields } = selectedType;
    
    return (
      <Box>
        {/* 기본 정보 */}
        <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
          기본 정보
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="평가 날짜"
              type="date"
              value={formData.consultation_date}
              onChange={(e) => setFormData({...formData, consultation_date: e.target.value})}
              InputLabelProps={{ shrink: true }}
              required
            />
          </Grid>
          {selectedType.category === 'evaluation' && (
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>평가 주기</InputLabel>
                <Select
                  value={formData.evaluation_period || ''}
                  onChange={(e) => setFormData({...formData, evaluation_period: e.target.value})}
                  label="평가 주기"
                >
                  <MenuItem value="monthly">월간</MenuItem>
                  <MenuItem value="quarterly">분기별</MenuItem>
                  <MenuItem value="semester">학기별</MenuItem>
                  <MenuItem value="annual">연간</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          )}
        </Grid>

        {/* 상담 내용 필드 */}
        {required_fields.includes('content_ko') && (
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              multiline
              rows={4}
              label="상담 내용 (한국어)"
              value={formData.content_ko}
              onChange={(e) => setFormData({...formData, content_ko: e.target.value})}
              required
            />
          </Box>
        )}

        {/* 학업 평가 필드 */}
        {required_fields.includes('attendance_rate') && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              학업 평가
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="출석률 (%)"
                  type="number"
                  value={formData.attendance_rate}
                  onChange={(e) => setFormData({...formData, attendance_rate: parseFloat(e.target.value) || 0})}
                  InputProps={{ inputProps: { min: 0, max: 100 } }}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel>수업 참여도</InputLabel>
                  <Select
                    value={formData.participation_grade}
                    onChange={(e) => setFormData({...formData, participation_grade: e.target.value})}
                    label="수업 참여도"
                  >
                    <MenuItem value="A">A (매우 우수)</MenuItem>
                    <MenuItem value="B">B (우수)</MenuItem>
                    <MenuItem value="C">C (보통)</MenuItem>
                    <MenuItem value="D">D (미흡)</MenuItem>
                    <MenuItem value="F">F (매우 미흡)</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="학습한 단어 수"
                  type="number"
                  value={formData.vocabulary_known}
                  onChange={(e) => setFormData({...formData, vocabulary_known: parseInt(e.target.value) || 0})}
                  InputProps={{ inputProps: { min: 0 } }}
                />
              </Grid>
            </Grid>
          </Box>
        )}

        {/* 생활 평가 필드 */}
        {required_fields.includes('social_rating') && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              생활 평가
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={3}>
                <FormControl fullWidth>
                  <InputLabel>사회성</InputLabel>
                  <Select
                    value={formData.social_rating}
                    onChange={(e) => setFormData({...formData, social_rating: e.target.value})}
                    label="사회성"
                  >
                    <MenuItem value="excellent">매우 우수</MenuItem>
                    <MenuItem value="good">우수</MenuItem>
                    <MenuItem value="average">보통</MenuItem>
                    <MenuItem value="poor">미흡</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={3}>
                <FormControl fullWidth>
                  <InputLabel>수업 태도</InputLabel>
                  <Select
                    value={formData.attitude_rating}
                    onChange={(e) => setFormData({...formData, attitude_rating: e.target.value})}
                    label="수업 태도"
                  >
                    <MenuItem value="excellent">매우 우수</MenuItem>
                    <MenuItem value="good">우수</MenuItem>
                    <MenuItem value="average">보통</MenuItem>
                    <MenuItem value="poor">미흡</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={3}>
                <FormControl fullWidth>
                  <InputLabel>적응도</InputLabel>
                  <Select
                    value={formData.adaptation_rating}
                    onChange={(e) => setFormData({...formData, adaptation_rating: e.target.value})}
                    label="적응도"
                  >
                    <MenuItem value="excellent">매우 우수</MenuItem>
                    <MenuItem value="good">우수</MenuItem>
                    <MenuItem value="average">보통</MenuItem>
                    <MenuItem value="poor">미흡</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={3}>
                <FormControl fullWidth>
                  <InputLabel>성장 가능성</InputLabel>
                  <Select
                    value={formData.growth_rating}
                    onChange={(e) => setFormData({...formData, growth_rating: e.target.value})}
                    label="성장 가능성"
                  >
                    <MenuItem value="excellent">매우 높음</MenuItem>
                    <MenuItem value="good">높음</MenuItem>
                    <MenuItem value="average">보통</MenuItem>
                    <MenuItem value="poor">낮음</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Box>
        )}

        {/* TOPIK 점수 필드 */}
        {required_fields.includes('topik_total') && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              TOPIK 점수
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={2}>
                <TextField
                  fullWidth
                  label="회차"
                  type="number"
                  value={formData.topik_test_number}
                  onChange={(e) => setFormData({...formData, topik_test_number: parseInt(e.target.value) || 0})}
                />
              </Grid>
              <Grid item xs={12} md={2}>
                <TextField
                  fullWidth
                  label="읽기"
                  type="number"
                  value={formData.topik_reading}
                  onChange={(e) => setFormData({...formData, topik_reading: parseInt(e.target.value) || 0})}
                  InputProps={{ inputProps: { min: 0, max: 100 } }}
                />
              </Grid>
              <Grid item xs={12} md={2}>
                <TextField
                  fullWidth
                  label="듣기"
                  type="number"
                  value={formData.topik_listening}
                  onChange={(e) => setFormData({...formData, topik_listening: parseInt(e.target.value) || 0})}
                  InputProps={{ inputProps: { min: 0, max: 100 } }}
                />
              </Grid>
              <Grid item xs={12} md={2}>
                <TextField
                  fullWidth
                  label="쓰기"
                  type="number"
                  value={formData.topik_writing}
                  onChange={(e) => setFormData({...formData, topik_writing: parseInt(e.target.value) || 0})}
                  InputProps={{ inputProps: { min: 0, max: 100 } }}
                />
              </Grid>
              <Grid item xs={12} md={2}>
                <TextField
                  fullWidth
                  label="총점"
                  type="number"
                  value={formData.topik_total}
                  onChange={(e) => setFormData({...formData, topik_total: parseInt(e.target.value) || 0})}
                  InputProps={{ inputProps: { min: 0, max: 300 } }}
                />
              </Grid>
            </Grid>
          </Box>
        )}

        {/* 평가 내용 필드 */}
        {required_fields.includes('counselor_evaluation') && (
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              multiline
              rows={3}
              label="상담사 평가"
              value={formData.counselor_evaluation}
              onChange={(e) => setFormData({...formData, counselor_evaluation: e.target.value})}
              required
            />
          </Box>
        )}
      </Box>
    );
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError('');

      // 필수 필드 검증
      const { required_fields } = selectedType;
      for (const field of required_fields) {
        if (!formData[field] && formData[field] !== 0) {
          setError(`필수 항목을 입력해주세요: ${field}`);
          return;
        }
      }

      // evaluation_data에 관련 데이터 저장
      const evaluationData: any = {};
      if (selectedType.category === 'evaluation') {
        required_fields.forEach(field => {
          evaluationData[field] = formData[field];
        });
      }

      const submitData = {
        student_id: studentId,
        consultation_date: formData.consultation_date,
        consultation_type: selectedType.type_code,
        evaluation_category: selectedType.category,
        evaluation_period: formData.evaluation_period,
        content_ko: formData.content_ko || `${selectedType.type_name_ko} - ${formData.consultation_date}`,
        content_vi: formData.content_vi || '',
        action_items: JSON.stringify({
          improvements: formData.improvements,
          next_goals: formData.next_goals,
          student_opinion: formData.student_opinion,
          counselor_evaluation: formData.counselor_evaluation
        }),
        evaluation_data: evaluationData,
        next_consultation_date: formData.next_consultation_date
      };

      if (consultation) {
        await consultationsAPI.update(consultation.consultation_id, submitData);
      } else {
        await consultationsAPI.create(submitData);
      }

      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Failed to save consultation:', error);
      setError(extractErrorMessage(error, '저장에 실패했습니다.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        {consultation ? '기록 수정' : '새 기록 추가'} - {studentName}
      </DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" onClose={() => setError('')} sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* 기록 유형 선택 */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" gutterBottom>
            기록 유형 선택
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {CONSULTATION_TYPES.map(type => (
              <Chip
                key={type.type_code}
                label={type.type_name_ko}
                color={selectedType.type_code === type.type_code ? 'primary' : 'default'}
                onClick={() => handleTypeChange(type.type_code)}
                sx={{ 
                  bgcolor: type.category === 'consultation' ? 'info.light' : 
                          type.category === 'evaluation' ? 'success.light' : 
                          'warning.light',
                  color: 'white'
                }}
              />
            ))}
          </Box>
        </Box>

        {/* 선택된 유형에 따른 필드 렌더링 */}
        {renderFieldsByType()}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>취소</Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          disabled={loading}
        >
          {loading ? '저장 중...' : '저장'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};