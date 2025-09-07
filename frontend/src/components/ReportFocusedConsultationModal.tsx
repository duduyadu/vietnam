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
  Typography,
  FormControlLabel,
  RadioGroup,
  Radio,
  Divider,
  Tabs,
  Tab
} from '@mui/material';
import { Grid } from './GridCompat';
import { consultationsAPI } from '../services/api';
import { extractErrorMessage } from '../utils/errorHandler';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 2 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

interface ReportFocusedConsultationModalProps {
  open: boolean;
  onClose: () => void;
  studentId: string;
  studentName: string;
  onSuccess: () => void;
  consultation?: any;
}

// 베트남 유학원 실제 상담 주기에 맞춘 평가 유형 (총 3-5개월 과정)
const REPORT_CONSULTATION_TYPES = [
  {
    type_code: 'first_evaluation',
    type_name_ko: '1차 평가 (입학 초기)',
    type_name_vi: 'Đánh giá lần 1',
    description: '입학 후 2-3주차 초기 적응 평가'
  },
  {
    type_code: 'second_evaluation',
    type_name_ko: '2차 평가 (중간)',
    type_name_vi: 'Đánh giá lần 2',
    description: '2개월차 중간 평가'
  },
  {
    type_code: 'third_evaluation',
    type_name_ko: '3차 평가 (후반)',
    type_name_vi: 'Đánh giá lần 3',
    description: '3-4개월차 평가'
  },
  {
    type_code: 'final_evaluation',
    type_name_ko: '최종 평가 (한국 출국 전)',
    type_name_vi: 'Đánh giá cuối cùng',
    description: '한국 대학 진학 전 최종 종합 평가'
  }
];

export const ReportFocusedConsultationModal: React.FC<ReportFocusedConsultationModalProps> = ({
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
  
  // 초기 폼 데이터를 함수로 정의하여 재사용 가능하게 함
  const getInitialFormData = (currentStudentId: string) => ({
    student_id: currentStudentId,
    consultation_date: new Date().toISOString().split('T')[0],
    consultation_type: 'first_evaluation',
    evaluation_category: 'report',
    
    // Tab 1: 학업 평가 (보고서 Page 2)
    attendance_rate: 95,
    participation_grade: 'B',
    vocabulary_known: 500,
    strength_areas: '',
    weakness_areas: '',
    learning_strategy: '',
    academic_evaluation: '',
    korean_evaluation: '',
    
    // Tab 2: 생활 평가 (보고서 Page 4)
    social_rating: 'good',
    social_relationship: '',
    attitude_rating: 'good',
    class_attitude: '',
    adaptation_rating: 'good',
    adaptation_level: '',
    growth_rating: 'good',
    growth_potential: '',
    
    // Tab 3: 특별활동 (보고서 Page 3)
    club_activities: '',
    volunteer_activities: '',
    awards: '',
    portfolio_status: '준비중',
    
    // Tab 4: TOPIK 성적
    topik_test_number: 0,
    topik_reading: 0,
    topik_listening: 0,
    topik_writing: 0,
    topik_total: 0,
    
    // Tab 5: 종합 평가 (보고서 Page 4)
    counselor_evaluation: '',
    student_opinion: '',
    final_recommendation: '',
    next_consultation_date: ''
  });
  
  const [formData, setFormData] = useState<any>(() => getInitialFormData(studentId));

  // 모달이 열릴 때 또는 학생이 변경될 때 폼 초기화
  useEffect(() => {
    if (open) {
      if (consultation) {
        // 기존 상담 데이터 로드
        const initialData = getInitialFormData(studentId);
        setFormData({
          ...initialData,
          ...consultation,
          student_id: studentId, // studentId가 확실히 설정되도록 함
          // action_items에서 평가 데이터 파싱
          ...(consultation.action_items ? JSON.parse(consultation.action_items) : {})
        });
      } else {
        // 새 상담 기록인 경우 완전히 초기화
        setFormData(getInitialFormData(studentId));
      }
      setTabValue(0); // 탭도 초기화
      setError(''); // 에러 메시지 초기화
    }
  }, [open, consultation, studentId]);

  const handleSubmit = async () => {
    setLoading(true);
    setError('');

    try {
      // action_items에 평가 데이터 저장 (보고서 생성 시 사용)
      const actionItems = JSON.stringify({
        // 학업 평가
        academic_evaluation: formData.academic_evaluation,
        korean_evaluation: formData.korean_evaluation,
        strength_areas: formData.strength_areas,
        weakness_areas: formData.weakness_areas,
        learning_strategy: formData.learning_strategy,
        
        // 생활 평가
        social_relationship: formData.social_relationship,
        class_attitude: formData.class_attitude,
        adaptation_level: formData.adaptation_level,
        growth_potential: formData.growth_potential,
        
        // 특별활동
        club_activities: formData.club_activities,
        volunteer_activities: formData.volunteer_activities,
        awards: formData.awards,
        portfolio_status: formData.portfolio_status,
        
        // 종합
        counselor_evaluation: formData.counselor_evaluation,
        student_opinion: formData.student_opinion,
        final_recommendation: formData.final_recommendation
      });

      const evaluationData = {
        // 학업 데이터
        attendance_rate: formData.attendance_rate,
        participation_grade: formData.participation_grade,
        vocabulary_known: formData.vocabulary_known,
        
        // 생활 평가 레이팅
        social_rating: formData.social_rating,
        attitude_rating: formData.attitude_rating,
        adaptation_rating: formData.adaptation_rating,
        growth_rating: formData.growth_rating,
        
        // TOPIK
        topik_test_number: formData.topik_test_number,
        topik_reading: formData.topik_reading,
        topik_listening: formData.topik_listening,
        topik_writing: formData.topik_writing,
        topik_total: formData.topik_total
      };

      const payload = {
        student_id: studentId,
        consultation_date: formData.consultation_date,
        consultation_type: formData.consultation_type,
        evaluation_category: 'report',
        content_ko: `${formData.consultation_type} - 보고서용 종합 평가`,
        action_items: actionItems,
        evaluation_data: evaluationData,
        next_consultation_date: formData.next_consultation_date
      };

      if (consultation?.consultation_id) {
        await consultationsAPI.update(consultation.consultation_id, payload);
      } else {
        await consultationsAPI.create(payload);
      }

      onSuccess();
      // 모달 닫을 때 상태 초기화
      setFormData(getInitialFormData(studentId));
      setTabValue(0);
      setError('');
      onClose();
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        보고서용 종합 평가 - {studentName}
        <Typography variant="caption" display="block" sx={{ mt: 1 }}>
          생활기록부 보고서 생성에 필요한 데이터만 입력합니다
        </Typography>
      </DialogTitle>
      
      <DialogContent>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        
        <Grid container spacing={2} sx={{ mb: 2 }}>
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
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>평가 유형</InputLabel>
              <Select
                value={formData.consultation_type}
                onChange={(e) => setFormData({...formData, consultation_type: e.target.value})}
                label="평가 유형"
              >
                {REPORT_CONSULTATION_TYPES.map(type => (
                  <MenuItem key={type.type_code} value={type.type_code}>
                    {type.type_name_ko}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)}>
          <Tab label="학업 평가" />
          <Tab label="생활 평가" />
          <Tab label="특별활동" />
          <Tab label="TOPIK" />
          <Tab label="종합 평가" />
        </Tabs>

        {/* Tab 1: 학업 평가 */}
        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="출석률 (%)"
                type="number"
                value={formData.attendance_rate}
                onChange={(e) => setFormData({...formData, attendance_rate: Number(e.target.value)})}
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
                  <MenuItem value="A">A (매우 적극적)</MenuItem>
                  <MenuItem value="B">B (적극적)</MenuItem>
                  <MenuItem value="C">C (보통)</MenuItem>
                  <MenuItem value="D">D (소극적)</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="알고 있는 어휘 수"
                type="number"
                value={formData.vocabulary_known}
                onChange={(e) => setFormData({...formData, vocabulary_known: Number(e.target.value)})}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="강점 영역"
                value={formData.strength_areas}
                onChange={(e) => setFormData({...formData, strength_areas: e.target.value})}
                placeholder="듣기, 말하기 등 잘하는 영역"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="보완 필요 영역"
                value={formData.weakness_areas}
                onChange={(e) => setFormData({...formData, weakness_areas: e.target.value})}
                placeholder="쓰기, 문법 등 보완이 필요한 영역"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="학습 전략"
                value={formData.learning_strategy}
                onChange={(e) => setFormData({...formData, learning_strategy: e.target.value})}
                placeholder="추천하는 학습 방법"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="학업 평가"
                value={formData.academic_evaluation}
                onChange={(e) => setFormData({...formData, academic_evaluation: e.target.value})}
                placeholder="전반적인 학업 성취도 평가"
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="한국어 능력 평가"
                value={formData.korean_evaluation}
                onChange={(e) => setFormData({...formData, korean_evaluation: e.target.value})}
                placeholder="한국어 실력에 대한 종합 평가"
                required
              />
            </Grid>
          </Grid>
        </TabPanel>

        {/* Tab 2: 생활 평가 */}
        <TabPanel value={tabValue} index={1}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" gutterBottom>교우 관계</Typography>
              <RadioGroup
                value={formData.social_rating}
                onChange={(e) => setFormData({...formData, social_rating: e.target.value})}
              >
                <FormControlLabel value="excellent" control={<Radio />} label="매우 우수" />
                <FormControlLabel value="good" control={<Radio />} label="우수" />
                <FormControlLabel value="average" control={<Radio />} label="보통" />
                <FormControlLabel value="poor" control={<Radio />} label="미흡" />
              </RadioGroup>
              <TextField
                fullWidth
                multiline
                rows={2}
                label="교우 관계 상세"
                value={formData.social_relationship}
                onChange={(e) => setFormData({...formData, social_relationship: e.target.value})}
                sx={{ mt: 2 }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" gutterBottom>수업 태도</Typography>
              <RadioGroup
                value={formData.attitude_rating}
                onChange={(e) => setFormData({...formData, attitude_rating: e.target.value})}
              >
                <FormControlLabel value="excellent" control={<Radio />} label="매우 우수" />
                <FormControlLabel value="good" control={<Radio />} label="우수" />
                <FormControlLabel value="average" control={<Radio />} label="보통" />
                <FormControlLabel value="poor" control={<Radio />} label="미흡" />
              </RadioGroup>
              <TextField
                fullWidth
                multiline
                rows={2}
                label="수업 태도 상세"
                value={formData.class_attitude}
                onChange={(e) => setFormData({...formData, class_attitude: e.target.value})}
                sx={{ mt: 2 }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" gutterBottom>한국 생활 적응도</Typography>
              <RadioGroup
                value={formData.adaptation_rating}
                onChange={(e) => setFormData({...formData, adaptation_rating: e.target.value})}
              >
                <FormControlLabel value="excellent" control={<Radio />} label="매우 우수" />
                <FormControlLabel value="good" control={<Radio />} label="우수" />
                <FormControlLabel value="average" control={<Radio />} label="보통" />
                <FormControlLabel value="poor" control={<Radio />} label="미흡" />
              </RadioGroup>
              <TextField
                fullWidth
                multiline
                rows={2}
                label="적응도 상세"
                value={formData.adaptation_level}
                onChange={(e) => setFormData({...formData, adaptation_level: e.target.value})}
                sx={{ mt: 2 }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" gutterBottom>성장 가능성</Typography>
              <RadioGroup
                value={formData.growth_rating}
                onChange={(e) => setFormData({...formData, growth_rating: e.target.value})}
              >
                <FormControlLabel value="excellent" control={<Radio />} label="매우 우수" />
                <FormControlLabel value="good" control={<Radio />} label="우수" />
                <FormControlLabel value="average" control={<Radio />} label="보통" />
                <FormControlLabel value="poor" control={<Radio />} label="미흡" />
              </RadioGroup>
              <TextField
                fullWidth
                multiline
                rows={2}
                label="성장 가능성 평가"
                value={formData.growth_potential}
                onChange={(e) => setFormData({...formData, growth_potential: e.target.value})}
                sx={{ mt: 2 }}
              />
            </Grid>
          </Grid>
        </TabPanel>

        {/* Tab 3: 특별활동 */}
        <TabPanel value={tabValue} index={2}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="동아리 활동"
                value={formData.club_activities}
                onChange={(e) => setFormData({...formData, club_activities: e.target.value})}
                placeholder="참여한 동아리 활동 내역"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="봉사 활동"
                value={formData.volunteer_activities}
                onChange={(e) => setFormData({...formData, volunteer_activities: e.target.value})}
                placeholder="참여한 봉사 활동 내역"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="수상 내역"
                value={formData.awards}
                onChange={(e) => setFormData({...formData, awards: e.target.value})}
                placeholder="받은 상이나 표창 내역"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>포트폴리오 상태</InputLabel>
                <Select
                  value={formData.portfolio_status}
                  onChange={(e) => setFormData({...formData, portfolio_status: e.target.value})}
                  label="포트폴리오 상태"
                >
                  <MenuItem value="준비중">준비중</MenuItem>
                  <MenuItem value="작성중">작성중</MenuItem>
                  <MenuItem value="완료">완료</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Tab 4: TOPIK 성적 */}
        <TabPanel value={tabValue} index={3}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="시험 회차"
                type="number"
                value={formData.topik_test_number}
                onChange={(e) => setFormData({...formData, topik_test_number: Number(e.target.value)})}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="읽기 점수"
                type="number"
                value={formData.topik_reading}
                onChange={(e) => setFormData({...formData, topik_reading: Number(e.target.value)})}
                InputProps={{ inputProps: { min: 0, max: 100 } }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="듣기 점수"
                type="number"
                value={formData.topik_listening}
                onChange={(e) => setFormData({...formData, topik_listening: Number(e.target.value)})}
                InputProps={{ inputProps: { min: 0, max: 100 } }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="쓰기 점수"
                type="number"
                value={formData.topik_writing}
                onChange={(e) => setFormData({...formData, topik_writing: Number(e.target.value)})}
                InputProps={{ inputProps: { min: 0, max: 100 } }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="총점"
                type="number"
                value={formData.topik_total}
                onChange={(e) => setFormData({...formData, topik_total: Number(e.target.value)})}
                InputProps={{ inputProps: { min: 0, max: 300 } }}
              />
            </Grid>
          </Grid>
        </TabPanel>

        {/* Tab 5: 종합 평가 */}
        <TabPanel value={tabValue} index={4}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="상담사 종합 평가"
                value={formData.counselor_evaluation}
                onChange={(e) => setFormData({...formData, counselor_evaluation: e.target.value})}
                placeholder="학생에 대한 종합적인 평가"
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="학생 의견"
                value={formData.student_opinion}
                onChange={(e) => setFormData({...formData, student_opinion: e.target.value})}
                placeholder="학생이 전달한 의견이나 포부"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="최종 추천사항"
                value={formData.final_recommendation}
                onChange={(e) => setFormData({...formData, final_recommendation: e.target.value})}
                placeholder="대학 진학 추천 등 최종 의견"
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="다음 상담 예정일"
                type="date"
                value={formData.next_consultation_date}
                onChange={(e) => setFormData({...formData, next_consultation_date: e.target.value})}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          </Grid>
        </TabPanel>
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