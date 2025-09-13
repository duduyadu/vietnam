import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Typography,
  Tabs,
  Tab,
  Autocomplete,
  Divider,
  Chip,
  Slider,
  Paper,
  IconButton
} from '@mui/material';
import { consultationsAPI, studentsAPI } from '../services/api';
import { extractErrorMessage } from '../utils/errorHandler';

interface ConsultationModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  consultation?: any;
  studentId?: number;
}

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
      id={`consultation-tabpanel-${index}`}
      aria-labelledby={`consultation-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const ConsultationModal: React.FC<ConsultationModalProps> = ({ 
  open, 
  onClose, 
  onSuccess, 
  consultation, 
  studentId
}) => {
  const initialFormData = {
    student_id: studentId || '',
    consultation_date: new Date().toISOString().split('T')[0],
    evaluation_category: 'unified',
    counselor: '',
    counselor_name: '',  // 담당 상담사 이름
    summary: '',
    improvements: '',
    next_goals: '',
    student_opinion: '',
    counselor_evaluation: '',
    next_consultation_date: '',
    topik_test_number: 0,
    topik_reading: 0,
    topik_listening: 0,
    topik_total: 0,
    // 학업 평가 필드들
    academic_evaluation: '',
    strength_areas: '',
    weakness_areas: '',
    learning_strategy: '',
    // 한국어 평가 필드들
    korean_evaluation: '',
    major_evaluation: '',
    // 생활 및 활동 필드들
    social_relationship: '',
    class_attitude: '',
    adaptation_level: '',
    growth_potential: '',
    club_activities: '',
    volunteer_activities: '',
    awards: '',
    // 희망 대학 및 전공 (누적 기록)
    university_preferences: [],  // [{date: '2025-01-01', university: '서울대학교', major: '기계공학과'}]
    // 종합 의견 필드
    counselor_comprehensive_opinion: '',  // 상담사 종합 의견 (구 최종 추천사항)
    summary_vi: ''
  };

  const [formData, setFormData] = useState<any>(initialFormData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [students, setStudents] = useState<any[]>([]);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await studentsAPI.getAll();
        if (response.data.data && Array.isArray(response.data.data)) {
          setStudents(response.data.data);
        }
      } catch (error) {
        console.error('Failed to fetch students:', error);
      }
    };

    if (open && !consultation && !studentId) {
      fetchStudents();
    }
  }, [open, consultation, studentId]);

  useEffect(() => {
    if (open) {
      if (consultation) {
        const actionItems = consultation.action_items && typeof consultation.action_items === 'object'
          ? consultation.action_items 
          : {};
        
        setFormData({
          ...initialFormData,
          student_id: consultation.student_id,
          consultation_date: consultation.consultation_date?.split('T')[0] || '',
          consultation_type: consultation.consultation_type || '',
          evaluation_category: 'unified',
          counselor: consultation.counselor || '',
          summary: consultation.summary || '',
          summary_vi: consultation.summary_vi || '',
          ...actionItems
        });
      } else if (studentId) {
        setFormData({
          ...initialFormData,
          student_id: studentId,
          evaluation_category: 'unified'
        });
      } else {
        setFormData({
          ...initialFormData,
          evaluation_category: 'unified'
        });
      }
      setTabValue(0);
      setError('');
    }
  }, [open, consultation, studentId]);

  const handleClose = () => {
    setFormData(initialFormData);
    setTabValue(0);
    setError('');
    onClose();
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError('');

      if (!formData.student_id) {
        setError('학생을 선택해주세요.');
        setLoading(false);
        return;
      }

      const actionItems = {
        improvements: formData.improvements || '',
        next_goals: formData.next_goals || '',
        student_opinion: formData.student_opinion || '',
        counselor_evaluation: formData.counselor_evaluation || '',
        next_consultation_date: formData.next_consultation_date || '',
        topik_test_number: formData.topik_test_number || 0,
        topik_reading: formData.topik_reading || 0,
        topik_listening: formData.topik_listening || 0,
        topik_total: formData.topik_total || 0,
        // 학업 평가
        academic_evaluation: formData.academic_evaluation || '',
        strength_areas: formData.strength_areas || '',
        weakness_areas: formData.weakness_areas || '',
        learning_strategy: formData.learning_strategy || '',
        // 한국어 평가
        korean_evaluation: formData.korean_evaluation || '',
        major_evaluation: formData.major_evaluation || '',
        // 생활 및 활동
        social_relationship: formData.social_relationship || '',
        class_attitude: formData.class_attitude || '',
        adaptation_level: formData.adaptation_level || '',
        growth_potential: formData.growth_potential || '',
        club_activities: formData.club_activities || '',
        volunteer_activities: formData.volunteer_activities || '',
        awards: formData.awards || '',
        // 종합 의견
        counselor_comprehensive_opinion: formData.counselor_comprehensive_opinion || '',
        // 담당 상담사 이름
        counselor_name: formData.counselor_name || '',
        // 희망 대학 및 전공
        university_preferences: formData.university_preferences || []
      };

      const dataToSend = {
        student_id: formData.student_id,
        consultation_date: formData.consultation_date,
        consultation_type: '정기 상담',
        evaluation_category: 'unified',
        counselor: formData.counselor || '',
        summary: formData.summary || '',
        summary_vi: formData.summary_vi || '',
        action_items: JSON.stringify(actionItems)
      };

      if (consultation) {
        await consultationsAPI.update(consultation.consultation_id, dataToSend);
      } else {
        await consultationsAPI.create(dataToSend);
      }

      onSuccess();
      handleClose();
    } catch (err) {
      const errorMsg = extractErrorMessage(err);
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {consultation ? '상담 기록 수정' : '새 상담 기록'}
      </DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Tabs value={tabValue} onChange={(_, newValue) => setTabValue(newValue)}>
          <Tab label="기본 정보" />
          <Tab label="학업 평가" />
          <Tab label="한국어 평가" />
          <Tab label="생활 및 활동" />
          <Tab label="희망 대학 및 전공" />
          <Tab label="평가 및 목표" />
          <Tab label="TOPIK 모의고사" />
          <Tab label="종합 의견" />
        </Tabs>

        {/* 기본 정보 탭 */}
        <TabPanel value={tabValue} index={0}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {!consultation && (
              <Autocomplete
                options={students}
                getOptionLabel={(option) => 
                  `${option.name || option.student_code} (${option.student_code})`
                }
                value={students.find(s => s.student_id === formData.student_id) || null}
                onChange={(_, newValue) => {
                  setFormData((prev: any) => ({
                    ...prev,
                    student_id: newValue?.student_id || ''
                  }));
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="학생 선택"
                    required
                    fullWidth
                  />
                )}
                disabled={!!studentId}
              />
            )}

            <TextField
              label="상담 날짜"
              type="date"
              value={formData.consultation_date}
              onChange={(e) => setFormData({ ...formData, consultation_date: e.target.value })}
              InputLabelProps={{ shrink: true }}
              required
              fullWidth
            />

            <TextField
              label="상담사 ID"
              value={formData.counselor}
              onChange={(e) => setFormData({ ...formData, counselor: e.target.value })}
              fullWidth
              required
            />

            <TextField
              label="담당 상담사 이름"
              value={formData.counselor_name}
              onChange={(e) => setFormData({ ...formData, counselor_name: e.target.value })}
              fullWidth
              sx={{ mb: 1 }}
              helperText="PDF 보고서에 표시될 상담사 이름"
            />

            <TextField
              label="상담 요약"
              multiline
              rows={3}
              value={formData.summary}
              onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
              fullWidth
              required
              helperText="상담 내용을 간략히 요약해주세요"
            />

            <TextField
              label="상담 요약 (베트남어)"
              multiline
              rows={3}
              value={formData.summary_vi}
              onChange={(e) => setFormData({ ...formData, summary_vi: e.target.value })}
              fullWidth
              helperText="선택사항 - 베트남어 번역"
            />
          </Box>
        </TabPanel>

        {/* 학업 평가 탭 */}
        <TabPanel value={tabValue} index={1}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography variant="h6" gutterBottom>
              학업 평가
            </Typography>
            
            <TextField
              label="학업 성취도 평가"
              multiline
              rows={4}
              value={formData.academic_evaluation}
              onChange={(e) => setFormData({ ...formData, academic_evaluation: e.target.value })}
              fullWidth
              helperText="학생의 전반적인 학업 성취도를 평가해주세요"
            />

            <TextField
              label="강점 영역"
              multiline
              rows={2}
              value={formData.strength_areas}
              onChange={(e) => setFormData({ ...formData, strength_areas: e.target.value })}
              fullWidth
            />

            <TextField
              label="보완 필요 영역"
              multiline
              rows={2}
              value={formData.weakness_areas}
              onChange={(e) => setFormData({ ...formData, weakness_areas: e.target.value })}
              fullWidth
            />

            <TextField
              label="학습 전략"
              multiline
              rows={3}
              value={formData.learning_strategy}
              onChange={(e) => setFormData({ ...formData, learning_strategy: e.target.value })}
              fullWidth
            />
          </Box>
        </TabPanel>

        {/* 한국어 평가 탭 */}
        <TabPanel value={tabValue} index={2}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography variant="h6" gutterBottom>
              한국어 능력 평가
            </Typography>
            
            <TextField
              label="한국어 능력 평가"
              multiline
              rows={4}
              value={formData.korean_evaluation}
              onChange={(e) => setFormData({ ...formData, korean_evaluation: e.target.value })}
              fullWidth
              helperText="학생의 한국어 능력을 종합적으로 평가해주세요"
            />

            <TextField
              label="전공 학습 준비도"
              multiline
              rows={3}
              value={formData.major_evaluation}
              onChange={(e) => setFormData({ ...formData, major_evaluation: e.target.value })}
              fullWidth
            />
          </Box>
        </TabPanel>

        {/* 생활 및 활동 탭 */}
        <TabPanel value={tabValue} index={3}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography variant="h6" gutterBottom>
              생활 및 활동
            </Typography>
            
            <TextField
              label="교우 관계"
              multiline
              rows={2}
              value={formData.social_relationship}
              onChange={(e) => setFormData({ ...formData, social_relationship: e.target.value })}
              fullWidth
            />

            <TextField
              label="수업 태도"
              multiline
              rows={2}
              value={formData.class_attitude}
              onChange={(e) => setFormData({ ...formData, class_attitude: e.target.value })}
              fullWidth
            />

            <TextField
              label="한국 생활 적응도"
              multiline
              rows={2}
              value={formData.adaptation_level}
              onChange={(e) => setFormData({ ...formData, adaptation_level: e.target.value })}
              fullWidth
            />

            <TextField
              label="성장 가능성"
              multiline
              rows={2}
              value={formData.growth_potential}
              onChange={(e) => setFormData({ ...formData, growth_potential: e.target.value })}
              fullWidth
            />
          </Box>
        </TabPanel>

        {/* 희망 대학 및 전공 탭 */}
        <TabPanel value={tabValue} index={4}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>희망 대학 및 전공 추가</Typography>
            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <TextField
                label="날짜"
                type="date"
                value={formData.new_preference_date || ''}
                onChange={(e) => setFormData({ ...formData, new_preference_date: e.target.value })}
                sx={{ width: '25%' }}
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                label="희망 대학"
                value={formData.new_preference_university || ''}
                onChange={(e) => setFormData({ ...formData, new_preference_university: e.target.value })}
                sx={{ width: '35%' }}
              />
              <TextField
                label="희망 전공"
                value={formData.new_preference_major || ''}
                onChange={(e) => setFormData({ ...formData, new_preference_major: e.target.value })}
                sx={{ width: '35%' }}
              />
              <Button
                variant="contained"
                onClick={() => {
                  if (formData.new_preference_date && formData.new_preference_university && formData.new_preference_major) {
                    const newPreference = {
                      date: formData.new_preference_date,
                      university: formData.new_preference_university,
                      major: formData.new_preference_major
                    };
                    setFormData({
                      ...formData,
                      university_preferences: [...(formData.university_preferences || []), newPreference],
                      new_preference_date: '',
                      new_preference_university: '',
                      new_preference_major: ''
                    });
                  }
                }}
                sx={{ width: '10%', minWidth: '80px' }}
              >
                추가
              </Button>
            </Box>

            <Typography variant="subtitle1" sx={{ mb: 1 }}>희망 대학 및 전공 이력</Typography>
            {formData.university_preferences && formData.university_preferences.length > 0 ? (
              <Box sx={{ mb: 2 }}>
                {formData.university_preferences.map((pref: any, index: number) => (
                  <Box key={index} sx={{ mb: 1, p: 1, bgcolor: 'grey.100', borderRadius: 1 }}>
                    <Typography variant="body2">
                      {pref.date} - {pref.university} {pref.major}
                      <IconButton
                        size="small"
                        onClick={() => {
                          const newPreferences = formData.university_preferences.filter((_: any, i: number) => i !== index);
                          setFormData({ ...formData, university_preferences: newPreferences });
                        }}
                        sx={{ ml: 1 }}
                      >
                        ❌
                      </IconButton>
                    </Typography>
                  </Box>
                ))}
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                아직 추가된 희망 대학 및 전공이 없습니다.
              </Typography>
            )}
          </Box>
        </TabPanel>

        {/* 평가 및 목표 탭 */}
        <TabPanel value={tabValue} index={5}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography variant="subtitle2" color="primary">
              아래 항목들은 PDF 보고서에 포함됩니다
            </Typography>
            
            <Divider />

            <TextField
              label="개선 필요사항"
              multiline
              rows={3}
              value={formData.improvements}
              onChange={(e) => setFormData({ ...formData, improvements: e.target.value })}
              fullWidth
              helperText="학생이 개선해야 할 점을 구체적으로 기록"
            />

            <TextField
              label="다음 목표"
              multiline
              rows={3}
              value={formData.next_goals}
              onChange={(e) => setFormData({ ...formData, next_goals: e.target.value })}
              fullWidth
              helperText="다음 상담까지 달성할 목표"
            />

            <TextField
              label="학생 의견"
              multiline
              rows={3}
              value={formData.student_opinion}
              onChange={(e) => setFormData({ ...formData, student_opinion: e.target.value })}
              fullWidth
              helperText="학생의 생각과 다짐"
            />

            <TextField
              label="다음 상담 예정일"
              type="date"
              value={formData.next_consultation_date}
              onChange={(e) => setFormData({ ...formData, next_consultation_date: e.target.value })}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
          </Box>
        </TabPanel>

        {/* TOPIK 모의고사 탭 */}
        <TabPanel value={tabValue} index={6}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography variant="h6" gutterBottom>
              TOPIK 모의고사 점수 입력
            </Typography>
            
            <FormControl fullWidth>
              <TextField
                label="회차"
                type="number"
                value={formData.topik_test_number}
                onChange={(e) => setFormData({ ...formData, topik_test_number: parseInt(e.target.value) || 0 })}
                InputProps={{ inputProps: { min: 0, max: 8 } }}
                helperText="0회차는 입력 안함을 의미합니다"
              />
            </FormControl>

            {formData.topik_test_number > 0 && (
              <>
                <Box>
                  <Typography gutterBottom>읽기 (0-100점)</Typography>
                  <Slider
                    value={formData.topik_reading}
                    onChange={(_, value) => {
                      const newReading = value as number;
                      setFormData({ 
                        ...formData, 
                        topik_reading: newReading,
                        topik_total: newReading + formData.topik_listening
                      });
                    }}
                    max={100}
                    valueLabelDisplay="on"
                    marks={[
                      { value: 0, label: '0' },
                      { value: 50, label: '50' },
                      { value: 100, label: '100' }
                    ]}
                  />
                </Box>

                <Box>
                  <Typography gutterBottom>듣기 (0-100점)</Typography>
                  <Slider
                    value={formData.topik_listening}
                    onChange={(_, value) => {
                      const newListening = value as number;
                      setFormData({ 
                        ...formData, 
                        topik_listening: newListening,
                        topik_total: formData.topik_reading + newListening
                      });
                    }}
                    max={100}
                    valueLabelDisplay="on"
                    marks={[
                      { value: 0, label: '0' },
                      { value: 50, label: '50' },
                      { value: 100, label: '100' }
                    ]}
                  />
                </Box>

                <Paper sx={{ p: 2, bgcolor: formData.topik_total >= 140 ? 'success.light' : formData.topik_total >= 80 ? 'warning.light' : 'grey.100' }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="h6">
                        총점: {formData.topik_total}/200점
                      </Typography>
                      {formData.topik_total >= 140 && (
                        <Chip label="TOPIK 2급 달성!" color="success" />
                      )}
                      {formData.topik_total >= 80 && formData.topik_total < 140 && (
                        <Chip label="TOPIK 1급" color="warning" />
                      )}
                      {formData.topik_total < 80 && formData.topik_total > 0 && (
                        <Chip label="미달" color="default" />
                      )}
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        • TOPIK 1급: 80점 이상
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        • TOPIK 2급: 140점 이상 (목표)
                      </Typography>
                    </Box>
                  </Box>
                </Paper>
              </>
            )}
          </Box>
        </TabPanel>

        {/* 종합 의견 탭 */}
        <TabPanel value={tabValue} index={7}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography variant="h6" gutterBottom>
              종합 의견
            </Typography>
            
            <TextField
              label="상담사 종합 평가"
              multiline
              rows={4}
              value={formData.counselor_evaluation}
              onChange={(e) => setFormData({ ...formData, counselor_evaluation: e.target.value })}
              fullWidth
              helperText="상담사의 종합적인 평가를 작성해주세요"
            />

            <TextField
              label="상담사 종합 의견"
              multiline
              rows={4}
              value={formData.counselor_comprehensive_opinion}
              onChange={(e) => setFormData({ ...formData, counselor_comprehensive_opinion: e.target.value })}
              fullWidth
              helperText="학생과 학부모를 위한 종합적인 의견을 작성해주세요"
            />
          </Box>
        </TabPanel>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          취소
        </Button>
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

export default ConsultationModal;