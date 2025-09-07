import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Divider,
  Chip,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextareaAutosize,
  Card,
  CardContent,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Rating
} from '@mui/material';
import Grid from '../components/GridCompat';
import { 
  ArrowBack, 
  Edit, 
  School, 
  Assignment, 
  Save,
  Person,
  MenuBook,
  Star,
  EmojiEvents,
  RateReview
} from '@mui/icons-material';
import Layout from '../components/Layout';
import TeacherEvaluationList from '../components/TeacherEvaluationList';
import { studentsAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

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
      id={`student-tabpanel-${index}`}
      aria-labelledby={`student-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const StudentDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [student, setStudent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [tabValue, setTabValue] = useState(0);
  const [saving, setSaving] = useState(false);
  
  // 학업 데이터 상태
  const [academicData, setAcademicData] = useState({
    attendance_rate: 0,
    participation_grade: 'C',
    vocabulary_known: 0,
    strength_areas: '',
    weakness_areas: '',
    learning_strategy: ''
  });
  
  // 포트폴리오 데이터 상태
  const [portfolioData, setPortfolioData] = useState({
    club_activities: '',
    volunteer_activities: '',
    awards: '',
    portfolio_status: '',
    student_opinion: ''
  });
  
  // 생활 평가 데이터 상태
  const [evaluationData, setEvaluationData] = useState({
    social_rating: 'average',
    social_relationship: '',
    attitude_rating: 'average',
    class_attitude: '',
    adaptation_rating: 'average',
    adaptation_level: '',
    growth_rating: 'average',
    growth_potential: '',
    academic_evaluation: '',
    korean_evaluation: '',
    final_recommendation: ''
  });

  useEffect(() => {
    loadStudent();
    loadAdditionalData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const loadStudent = async () => {
    try {
      setLoading(true);
      const response = await studentsAPI.getById(Number(id));
      setStudent(response.data.data);
    } catch (error: any) {
      console.error('Failed to load student:', error);
      setError('학생 정보를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const loadAdditionalData = async () => {
    try {
      // 학업 데이터 로드
      const academicRes = await api.get(`/student-evaluation/${id}/academic-data`);
      if (academicRes.data.data) {
        setAcademicData(academicRes.data.data);
      }
      
      // 포트폴리오 데이터 로드
      const portfolioRes = await api.get(`/student-evaluation/${id}/portfolio`);
      if (portfolioRes.data.data) {
        setPortfolioData(portfolioRes.data.data);
      }
      
      // 생활 평가 데이터 로드
      const evaluationRes = await api.get(`/student-evaluation/${id}/evaluation`);
      if (evaluationRes.data.data) {
        setEvaluationData(evaluationRes.data.data);
      }
    } catch (error) {
      console.error('Failed to load additional data:', error);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const saveAcademicData = async () => {
    try {
      setSaving(true);
      await api.post(`/student-evaluation/${id}/academic-data`, academicData);
      alert('학업 데이터가 저장되었습니다.');
    } catch (error) {
      console.error('Failed to save academic data:', error);
      alert('저장에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  };

  const savePortfolioData = async () => {
    try {
      setSaving(true);
      await api.post(`/student-evaluation/${id}/portfolio`, portfolioData);
      alert('포트폴리오가 저장되었습니다.');
    } catch (error) {
      console.error('Failed to save portfolio:', error);
      alert('저장에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  };

  const saveEvaluationData = async () => {
    try {
      setSaving(true);
      await api.post(`/student-evaluation/${id}/evaluation`, evaluationData);
      alert('생활 평가가 저장되었습니다.');
    } catch (error) {
      console.error('Failed to save evaluation:', error);
      alert('저장에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'studying':
        return 'primary';
      case 'graduated':
        return 'success';
      case 'withdrawn':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'studying':
        return '재학중';
      case 'graduated':
        return '졸업';
      case 'withdrawn':
        return '휴학/중퇴';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <Layout>
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
            <CircularProgress />
          </Box>
        </Container>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
          <Alert severity="error">{error}</Alert>
          <Button startIcon={<ArrowBack />} onClick={() => navigate('/students')} sx={{ mt: 2 }}>
            목록으로 돌아가기
          </Button>
        </Container>
      </Layout>
    );
  }

  if (!student) {
    return (
      <Layout>
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
          <Alert severity="warning">학생 정보를 찾을 수 없습니다.</Alert>
          <Button startIcon={<ArrowBack />} onClick={() => navigate('/students')} sx={{ mt: 2 }}>
            목록으로 돌아가기
          </Button>
        </Container>
      </Layout>
    );
  }

  return (
    <Layout>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h4" gutterBottom>
            학생 상세 정보
          </Typography>
          <Box>
            <Button
              startIcon={<ArrowBack />}
              onClick={() => navigate('/students')}
              sx={{ mr: 2 }}
            >
              목록으로
            </Button>
            {(user?.role === 'admin' || user?.role === 'teacher') && (
              <Button
                variant="contained"
                startIcon={<Edit />}
                onClick={() => navigate(`/students/edit/${id}`)}
              >
                수정
              </Button>
            )}
          </Box>
        </Box>

        <Paper sx={{ p: 3, mb: 3 }}>
          <Box sx={{ mb: 2 }}>
            <Typography variant="h5" gutterBottom>
              {student.name_korean || student.name} 
              {student.name_vietnamese && ` (${student.name_vietnamese})`}
            </Typography>
            <Chip 
              label={getStatusLabel(student.status || 'studying')} 
              color={getStatusColor(student.status || 'studying') as any}
              sx={{ mr: 1 }}
            />
            <Chip label={`학생 코드: ${student.student_code}`} variant="outlined" />
          </Box>

          <Tabs value={tabValue} onChange={handleTabChange} aria-label="student details tabs">
            <Tab label="기본 정보" icon={<Person />} />
            <Tab label="학업 데이터" icon={<MenuBook />} />
            <Tab label="포트폴리오" icon={<EmojiEvents />} />
            <Tab label="생활 평가" icon={<Star />} />
            <Tab label="선생님 평가" icon={<RateReview />} />
          </Tabs>

          <TabPanel value={tabValue} index={0}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={3}>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <Box
                    sx={{
                      width: 150,
                      height: 190,
                      border: '2px solid #e0e0e0',
                      borderRadius: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mb: 2,
                      bgcolor: '#f5f5f5',
                      overflow: 'hidden'
                    }}
                  >
                    {student.profile_image ? (
                      <img
                        src={`/uploads/${student.profile_image}`}
                        alt="학생 사진"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      <Typography color="text.secondary">사진 없음</Typography>
                    )}
                  </Box>
                  <input
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    id="profile-image-upload"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const formData = new FormData();
                        formData.append('image', file);
                        formData.append('studentId', id || '');
                        
                        try {
                          const response = await fetch('/api/students/upload-image', {
                            method: 'POST',
                            body: formData,
                            headers: {
                              'Authorization': `Bearer ${localStorage.getItem('token')}`
                            }
                          });
                          
                          if (response.ok) {
                            const data = await response.json();
                            setStudent({ ...student, profile_image: data.filename });
                            alert('사진이 업로드되었습니다.');
                          } else {
                            alert('사진 업로드에 실패했습니다.');
                          }
                        } catch (error) {
                          console.error('Upload error:', error);
                          alert('사진 업로드 중 오류가 발생했습니다.');
                        }
                      }
                    }}
                  />
                  <label htmlFor="profile-image-upload">
                    <Button variant="outlined" component="span" size="small">
                      사진 업로드
                    </Button>
                  </label>
                </Box>
              </Grid>
              <Grid item xs={12} md={9}>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="text.secondary">생년월일</Typography>
                    <Typography variant="body1" gutterBottom>{student.date_of_birth}</Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="text.secondary">이메일</Typography>
                    <Typography variant="body1" gutterBottom>{student.email || '-'}</Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="text.secondary">전화번호</Typography>
                    <Typography variant="body1" gutterBottom>{student.phone_number || '-'}</Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="text.secondary">주소</Typography>
                    <Typography variant="body1" gutterBottom>{student.address || '-'}</Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="text.secondary">소속 유학원</Typography>
                    <Typography variant="body1" gutterBottom>{student.agency || '-'}</Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="text.secondary">목표 대학</Typography>
                    <Typography variant="body1" gutterBottom>{student.target_university || '-'}</Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="text.secondary">목표 학과</Typography>
                    <Typography variant="body1" gutterBottom>{student.target_major || '-'}</Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="text.secondary">TOPIK 등급</Typography>
                    <Typography variant="body1" gutterBottom>{student.topik_level || '-'}</Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary">비고</Typography>
                    <Typography variant="body1" gutterBottom>{student.notes || '-'}</Typography>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="출석률 (%)"
                  type="number"
                  value={academicData.attendance_rate}
                  disabled
                  InputProps={{ inputProps: { min: 0, max: 100 } }}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel>수업 참여도</InputLabel>
                  <Select
                    value={academicData.participation_grade}
                    disabled
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
                  value={academicData.vocabulary_known}
                  disabled
                  InputProps={{ inputProps: { min: 0 } }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="강점 영역"
                  value={academicData.strength_areas}
                  disabled
                  placeholder="예: 듣기 능력이 우수함, 문법 이해도가 높음"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="보완 필요 영역"
                  value={academicData.weakness_areas}
                  disabled
                  placeholder="예: 쓰기 연습이 필요함, 어휘력 확장 필요"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="학습 전략"
                  value={academicData.learning_strategy}
                  disabled
                  placeholder="학생에게 권장되는 학습 전략을 입력하세요"
                />
              </Grid>
              <Grid item xs={12}>
                <Typography variant="caption" color="text.secondary">
                  * 학업 데이터는 상담 기록 메뉴에서 입력하세요
                </Typography>
              </Grid>
            </Grid>
          </TabPanel>

          <TabPanel value={tabValue} index={2}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="동아리 활동"
                  value={portfolioData.club_activities}
                  disabled
                  placeholder="참여한 동아리와 활동 내용을 입력하세요"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="봉사 활동"
                  value={portfolioData.volunteer_activities}
                  disabled
                  placeholder="봉사 활동 내역을 입력하세요"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="수상 경력"
                  value={portfolioData.awards}
                  disabled
                  placeholder="수상 경력을 입력하세요"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="포트폴리오 상태"
                  value={portfolioData.portfolio_status}
                  disabled
                  placeholder="포트폴리오 준비 상태를 입력하세요"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="학생 의견 및 포부"
                  value={portfolioData.student_opinion}
                  disabled
                  placeholder="학생의 의견이나 포부를 입력하세요"
                />
              </Grid>
              <Grid item xs={12}>
                <Typography variant="caption" color="text.secondary">
                  * 포트폴리오 데이터는 상담 기록 메뉴에서 입력하세요
                </Typography>
              </Grid>
            </Grid>
          </TabPanel>

          <TabPanel value={tabValue} index={3}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>생활 평가</Typography>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <FormControl component="fieldset">
                      <FormLabel component="legend">교우 관계</FormLabel>
                      <RadioGroup
                        value={evaluationData.social_rating}
                      >
                        <FormControlLabel value="excellent" control={<Radio />} label="매우 우수" disabled />
                        <FormControlLabel value="good" control={<Radio />} label="우수" disabled />
                        <FormControlLabel value="average" control={<Radio />} label="보통" disabled />
                        <FormControlLabel value="poor" control={<Radio />} label="미흡" disabled />
                      </RadioGroup>
                    </FormControl>
                    <TextField
                      fullWidth
                      multiline
                      rows={2}
                      label="교우 관계 상세"
                      value={evaluationData.social_relationship}
                      disabled
                      sx={{ mt: 2 }}
                    />
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <FormControl component="fieldset">
                      <FormLabel component="legend">수업 태도</FormLabel>
                      <RadioGroup
                        value={evaluationData.attitude_rating}
                      >
                        <FormControlLabel value="excellent" control={<Radio />} label="매우 우수" disabled />
                        <FormControlLabel value="good" control={<Radio />} label="우수" disabled />
                        <FormControlLabel value="average" control={<Radio />} label="보통" disabled />
                        <FormControlLabel value="poor" control={<Radio />} label="미흡" disabled />
                      </RadioGroup>
                    </FormControl>
                    <TextField
                      fullWidth
                      multiline
                      rows={2}
                      label="수업 태도 상세"
                      value={evaluationData.class_attitude}
                      disabled
                      sx={{ mt: 2 }}
                    />
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <FormControl component="fieldset">
                      <FormLabel component="legend">한국 생활 적응도</FormLabel>
                      <RadioGroup
                        value={evaluationData.adaptation_rating}
                      >
                        <FormControlLabel value="excellent" control={<Radio />} label="매우 우수" disabled />
                        <FormControlLabel value="good" control={<Radio />} label="우수" disabled />
                        <FormControlLabel value="average" control={<Radio />} label="보통" disabled />
                        <FormControlLabel value="poor" control={<Radio />} label="미흡" disabled />
                      </RadioGroup>
                    </FormControl>
                    <TextField
                      fullWidth
                      multiline
                      rows={2}
                      label="적응도 상세"
                      value={evaluationData.adaptation_level}
                      disabled
                      sx={{ mt: 2 }}
                    />
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <FormControl component="fieldset">
                      <FormLabel component="legend">성장 가능성</FormLabel>
                      <RadioGroup
                        value={evaluationData.growth_rating}
                      >
                        <FormControlLabel value="excellent" control={<Radio />} label="매우 우수" disabled />
                        <FormControlLabel value="good" control={<Radio />} label="우수" disabled />
                        <FormControlLabel value="average" control={<Radio />} label="보통" disabled />
                        <FormControlLabel value="poor" control={<Radio />} label="미흡" disabled />
                      </RadioGroup>
                    </FormControl>
                    <TextField
                      fullWidth
                      multiline
                      rows={2}
                      label="성장 가능성 상세"
                      value={evaluationData.growth_potential}
                      disabled
                      sx={{ mt: 2 }}
                    />
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>종합 평가</Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="학업 성취도 평가"
                  value={evaluationData.academic_evaluation}
                  disabled
                  placeholder="학생의 학업 성취도에 대한 종합 평가를 입력하세요"
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="한국어 능력 평가"
                  value={evaluationData.korean_evaluation}
                  disabled
                  placeholder="학생의 한국어 능력에 대한 종합 평가를 입력하세요"
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="최종 추천사"
                  value={evaluationData.final_recommendation}
                  disabled
                  placeholder="학생에 대한 최종 추천사를 입력하세요"
                />
              </Grid>

              <Grid item xs={12}>
                <Typography variant="caption" color="text.secondary">
                  * 생활 평가는 상담 기록 메뉴에서 입력하세요
                </Typography>
              </Grid>
            </Grid>
          </TabPanel>
          
          {/* 선생님 평가 탭 */}
          <TabPanel value={tabValue} index={4}>
            <TeacherEvaluationList 
              studentId={parseInt(id || '0')}
              studentName={student?.name_korean || student?.name || ''}
            />
          </TabPanel>
        </Paper>
      </Container>
    </Layout>
  );
};

export default StudentDetail;