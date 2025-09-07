import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Container,
  Paper,
  Typography,
  Box,
  Tabs,
  Tab,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Chip,
  Alert,
  Snackbar,
  Card,
  CardContent,
  CardActions,
  Autocomplete,
  Rating,
  LinearProgress,
  Slider
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Save,
  Cancel,
  School,
  TrendingUp,
  Flag,
  Assessment,
  DateRange,
  Grade
} from '@mui/icons-material';
import Layout from '../components/Layout';
import api from '../services/api';
import reportService, { ExamResult, LearningProgress } from '../services/reportService';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

interface Student {
  student_id: number;
  student_code: string;
  student_name: string;
}

interface AcademicGoal {
  goal_id?: number;
  student_id: number;
  goal_date: string;
  preferred_major: string;
  preferred_university?: string;
  career_goal?: string;
  notes?: string;
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
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const ReportDataEntry: React.FC = () => {
  const { t } = useTranslation();
  const [tabValue, setTabValue] = useState(0);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(false);
  
  // 시험 성적 관련 상태
  const [examResults, setExamResults] = useState<ExamResult[]>([]);
  const [examDialog, setExamDialog] = useState(false);
  const [currentExam, setCurrentExam] = useState<ExamResult>({
    student_id: 0,
    exam_name: '',
    exam_type: 'midterm',
    exam_date: new Date().toISOString().split('T')[0],
    score: 0,
    max_score: 100,
    subject: '',
    semester: ''
  });

  // 학습 진도 관련 상태
  const [learningProgress, setLearningProgress] = useState<LearningProgress[]>([]);
  const [progressDialog, setProgressDialog] = useState(false);
  const [currentProgress, setCurrentProgress] = useState<LearningProgress>({
    student_id: 0,
    subject: '',
    record_date: new Date().toISOString().split('T')[0],
    completion_percentage: 0,
    attendance_rate: 0,
    overall_performance: 'average'
  });

  // 학업 목표 관련 상태
  const [academicGoals, setAcademicGoals] = useState<AcademicGoal[]>([]);
  const [goalDialog, setGoalDialog] = useState(false);
  const [currentGoal, setCurrentGoal] = useState<AcademicGoal>({
    student_id: 0,
    goal_date: new Date().toISOString().split('T')[0],
    preferred_major: '',
    preferred_university: '',
    career_goal: ''
  });

  // 스낵바
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'warning' | 'info'
  });

  // 초기 데이터 로드
  useEffect(() => {
    loadStudents();
  }, []);

  // 학생 변경 시 데이터 로드
  useEffect(() => {
    if (selectedStudent) {
      loadStudentData();
    }
  }, [selectedStudent]);

  const loadStudents = async () => {
    try {
      const response = await api.get('/students');
      const studentsData = response.data.data.map((student: any) => ({
        student_id: student.student_id,
        student_code: student.student_code,
        student_name: student.attributes?.name || '이름 없음'
      }));
      setStudents(studentsData);
    } catch (error) {
      console.error('Failed to load students:', error);
      showSnackbar('학생 목록 로드에 실패했습니다.', 'error');
    }
  };

  const loadStudentData = async () => {
    if (!selectedStudent) return;
    
    setLoading(true);
    try {
      // 시험 성적 로드
      const examsResponse = await api.get(`/reports/exam-results/${selectedStudent.student_id}`);
      setExamResults(examsResponse.data.data || []);

      // 학습 진도 로드
      const progressResponse = await api.get(`/reports/learning-progress/${selectedStudent.student_id}`);
      setLearningProgress(progressResponse.data.data || []);

      // 학업 목표 로드
      const goalsResponse = await api.get(`/reports/academic-goals/${selectedStudent.student_id}`);
      setAcademicGoals(goalsResponse.data.data || []);
    } catch (error) {
      console.error('Failed to load student data:', error);
    } finally {
      setLoading(false);
    }
  };

  const showSnackbar = (message: string, severity: 'success' | 'error' | 'warning' | 'info') => {
    setSnackbar({ open: true, message, severity });
  };

  // ========== 시험 성적 관리 ==========
  const handleAddExam = () => {
    if (!selectedStudent) {
      showSnackbar('먼저 학생을 선택해주세요.', 'warning');
      return;
    }
    setCurrentExam({
      student_id: selectedStudent.student_id,
      exam_name: '',
      exam_type: 'midterm',
      exam_date: new Date().toISOString().split('T')[0],
      score: 0,
      max_score: 100,
      subject: '',
      semester: ''
    });
    setExamDialog(true);
  };

  const handleSaveExam = async () => {
    try {
      setLoading(true);
      
      const examData = {
        ...currentExam,
        percentage: (currentExam.score / currentExam.max_score) * 100
      };

      if (currentExam.exam_id) {
        // 수정
        await api.put(`/reports/exam-results/${currentExam.exam_id}`, examData);
        showSnackbar('시험 성적이 수정되었습니다.', 'success');
      } else {
        // 추가
        await reportService.addExamResult(examData);
        showSnackbar('시험 성적이 추가되었습니다.', 'success');
      }
      
      setExamDialog(false);
      loadStudentData();
    } catch (error) {
      console.error('Failed to save exam result:', error);
      showSnackbar('시험 성적 저장에 실패했습니다.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleEditExam = (exam: ExamResult) => {
    setCurrentExam(exam);
    setExamDialog(true);
  };

  const handleDeleteExam = async (examId: number) => {
    if (!window.confirm('정말 삭제하시겠습니까?')) return;
    
    try {
      await api.delete(`/reports/exam-results/${examId}`);
      showSnackbar('시험 성적이 삭제되었습니다.', 'success');
      loadStudentData();
    } catch (error) {
      console.error('Failed to delete exam:', error);
      showSnackbar('삭제에 실패했습니다.', 'error');
    }
  };

  // ========== 학습 진도 관리 ==========
  const handleAddProgress = () => {
    if (!selectedStudent) {
      showSnackbar('먼저 학생을 선택해주세요.', 'warning');
      return;
    }
    setCurrentProgress({
      student_id: selectedStudent.student_id,
      subject: '',
      record_date: new Date().toISOString().split('T')[0],
      completion_percentage: 0,
      attendance_rate: 0,
      overall_performance: 'average'
    });
    setProgressDialog(true);
  };

  const handleSaveProgress = async () => {
    try {
      setLoading(true);
      
      if (currentProgress.progress_id) {
        // 수정
        await api.put(`/reports/learning-progress/${currentProgress.progress_id}`, currentProgress);
        showSnackbar('학습 진도가 수정되었습니다.', 'success');
      } else {
        // 추가
        await reportService.addLearningProgress(currentProgress);
        showSnackbar('학습 진도가 추가되었습니다.', 'success');
      }
      
      setProgressDialog(false);
      loadStudentData();
    } catch (error) {
      console.error('Failed to save progress:', error);
      showSnackbar('학습 진도 저장에 실패했습니다.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleEditProgress = (progress: LearningProgress) => {
    setCurrentProgress(progress);
    setProgressDialog(true);
  };

  const handleDeleteProgress = async (progressId: number) => {
    if (!window.confirm('정말 삭제하시겠습니까?')) return;
    
    try {
      await api.delete(`/reports/learning-progress/${progressId}`);
      showSnackbar('학습 진도가 삭제되었습니다.', 'success');
      loadStudentData();
    } catch (error) {
      console.error('Failed to delete progress:', error);
      showSnackbar('삭제에 실패했습니다.', 'error');
    }
  };

  // ========== 학업 목표 관리 ==========
  const handleAddGoal = () => {
    if (!selectedStudent) {
      showSnackbar('먼저 학생을 선택해주세요.', 'warning');
      return;
    }
    setCurrentGoal({
      student_id: selectedStudent.student_id,
      goal_date: new Date().toISOString().split('T')[0],
      preferred_major: '',
      preferred_university: '',
      career_goal: ''
    });
    setGoalDialog(true);
  };

  const handleSaveGoal = async () => {
    try {
      setLoading(true);
      
      if (currentGoal.goal_id) {
        // 수정
        await api.put(`/reports/academic-goals/${currentGoal.goal_id}`, currentGoal);
        showSnackbar('학업 목표가 수정되었습니다.', 'success');
      } else {
        // 추가
        await api.post('/reports/academic-goals', currentGoal);
        showSnackbar('학업 목표가 추가되었습니다.', 'success');
      }
      
      setGoalDialog(false);
      loadStudentData();
    } catch (error) {
      console.error('Failed to save goal:', error);
      showSnackbar('학업 목표 저장에 실패했습니다.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleEditGoal = (goal: AcademicGoal) => {
    setCurrentGoal(goal);
    setGoalDialog(true);
  };

  const handleDeleteGoal = async (goalId: number) => {
    if (!window.confirm('정말 삭제하시겠습니까?')) return;
    
    try {
      await api.delete(`/reports/academic-goals/${goalId}`);
      showSnackbar('학업 목표가 삭제되었습니다.', 'success');
      loadStudentData();
    } catch (error) {
      console.error('Failed to delete goal:', error);
      showSnackbar('삭제에 실패했습니다.', 'error');
    }
  };

  const getPerformanceColor = (performance: string) => {
    switch (performance) {
      case 'excellent': return 'success';
      case 'good': return 'primary';
      case 'average': return 'warning';
      case 'below_average': return 'error';
      default: return 'default';
    }
  };

  const getPerformanceText = (performance: string) => {
    switch (performance) {
      case 'excellent': return '우수';
      case 'good': return '양호';
      case 'average': return '보통';
      case 'below_average': return '미흡';
      case 'poor': return '부진';
      default: return performance;
    }
  };

  return (
    <Layout>
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          보고서 데이터 관리
        </Typography>

        {/* 학생 선택 */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Autocomplete
            options={students}
            getOptionLabel={(option) => `${option.student_name} (${option.student_code})`}
            value={selectedStudent}
            onChange={(event, newValue) => setSelectedStudent(newValue)}
            renderInput={(params) => (
              <TextField {...params} label="학생 선택" />
            )}
            sx={{ mb: 2 }}
          />
          
          {selectedStudent && (
            <Alert severity="info">
              선택된 학생: {selectedStudent.student_name} ({selectedStudent.student_code})
            </Alert>
          )}
        </Paper>

        {selectedStudent && (
          <Paper sx={{ width: '100%' }}>
            <Tabs
              value={tabValue}
              onChange={(e, newValue) => setTabValue(newValue)}
              variant="fullWidth"
            >
              <Tab icon={<Grade />} label="시험 성적" />
              <Tab icon={<TrendingUp />} label="학습 진도" />
              <Tab icon={<Flag />} label="학업 목표" />
            </Tabs>

            {/* 시험 성적 탭 */}
            <TabPanel value={tabValue} index={0}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6">시험 성적 관리</Typography>
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={handleAddExam}
                >
                  성적 추가
                </Button>
              </Box>

              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>시험명</TableCell>
                      <TableCell>과목</TableCell>
                      <TableCell>유형</TableCell>
                      <TableCell>날짜</TableCell>
                      <TableCell>점수</TableCell>
                      <TableCell>백분율</TableCell>
                      <TableCell>학기</TableCell>
                      <TableCell>액션</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {examResults.map((exam) => (
                      <TableRow key={exam.exam_id}>
                        <TableCell>{exam.exam_name}</TableCell>
                        <TableCell>{exam.subject}</TableCell>
                        <TableCell>{exam.exam_type}</TableCell>
                        <TableCell>{new Date(exam.exam_date).toLocaleDateString('ko-KR')}</TableCell>
                        <TableCell>{exam.score}/{exam.max_score}</TableCell>
                        <TableCell>
                          <Chip 
                            label={`${exam.percentage?.toFixed(1)}%`}
                            color={exam.percentage! >= 80 ? 'success' : exam.percentage! >= 60 ? 'warning' : 'error'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>{exam.semester}</TableCell>
                        <TableCell>
                          <IconButton size="small" onClick={() => handleEditExam(exam)}>
                            <Edit />
                          </IconButton>
                          <IconButton size="small" onClick={() => handleDeleteExam(exam.exam_id!)}>
                            <Delete />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                    {examResults.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={8} align="center">
                          등록된 시험 성적이 없습니다.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </TabPanel>

            {/* 학습 진도 탭 */}
            <TabPanel value={tabValue} index={1}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6">학습 진도 관리</Typography>
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={handleAddProgress}
                >
                  진도 추가
                </Button>
              </Box>

              {learningProgress.map((progress) => (
                <Card key={progress.progress_id} sx={{ mb: 2 }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="h6">{progress.subject}</Typography>
                      <Chip 
                        label={getPerformanceText(progress.overall_performance!)}
                        color={getPerformanceColor(progress.overall_performance!) as any}
                      />
                    </Box>
                    <Typography color="textSecondary" gutterBottom>
                      {new Date(progress.record_date).toLocaleDateString('ko-KR')} 기록
                    </Typography>
                    
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="body2">완료율</Typography>
                      <LinearProgress 
                        variant="determinate" 
                        value={progress.completion_percentage} 
                        sx={{ height: 10, borderRadius: 5 }}
                      />
                      <Typography variant="caption">{progress.completion_percentage}%</Typography>
                    </Box>

                    <Box sx={{ mt: 2 }}>
                      <Typography variant="body2">출석률</Typography>
                      <LinearProgress 
                        variant="determinate" 
                        value={progress.attendance_rate} 
                        sx={{ height: 10, borderRadius: 5 }}
                        color="secondary"
                      />
                      <Typography variant="caption">{progress.attendance_rate}%</Typography>
                    </Box>

                    {progress.teacher_comments && (
                      <Typography variant="body2" sx={{ mt: 2 }}>
                        교사 코멘트: {progress.teacher_comments}
                      </Typography>
                    )}
                  </CardContent>
                  <CardActions>
                    <Button size="small" onClick={() => handleEditProgress(progress)}>
                      수정
                    </Button>
                    <Button size="small" color="error" onClick={() => handleDeleteProgress(progress.progress_id!)}>
                      삭제
                    </Button>
                  </CardActions>
                </Card>
              ))}

              {learningProgress.length === 0 && (
                <Alert severity="info">등록된 학습 진도가 없습니다.</Alert>
              )}
            </TabPanel>

            {/* 학업 목표 탭 */}
            <TabPanel value={tabValue} index={2}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6">학업 목표 시계열 관리</Typography>
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={handleAddGoal}
                >
                  목표 추가
                </Button>
              </Box>

              <Box sx={{ position: 'relative', pl: 4 }}>
                {/* 시계열 라인 */}
                <Box sx={{
                  position: 'absolute',
                  left: 20,
                  top: 0,
                  bottom: 0,
                  width: 2,
                  bgcolor: 'primary.main'
                }} />

                {academicGoals.sort((a, b) => new Date(b.goal_date).getTime() - new Date(a.goal_date).getTime()).map((goal, index) => (
                  <Box key={goal.goal_id} sx={{ position: 'relative', mb: 3 }}>
                    {/* 시계열 점 */}
                    <Box sx={{
                      position: 'absolute',
                      left: -24,
                      top: 20,
                      width: 12,
                      height: 12,
                      borderRadius: '50%',
                      bgcolor: 'primary.main',
                      border: '2px solid #fff',
                      boxShadow: 1
                    }} />

                    <Card>
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="h6">
                            {new Date(goal.goal_date).toLocaleDateString('ko-KR')}
                          </Typography>
                          <Box>
                            <IconButton size="small" onClick={() => handleEditGoal(goal)}>
                              <Edit />
                            </IconButton>
                            <IconButton size="small" onClick={() => handleDeleteGoal(goal.goal_id!)}>
                              <Delete />
                            </IconButton>
                          </Box>
                        </Box>
                        
                        <Box sx={{ display: 'grid', gap: 1 }}>
                          <Box>
                            <Chip label="희망 전공" size="small" sx={{ mr: 1 }} />
                            <Typography variant="body2" component="span">
                              {goal.preferred_major}
                            </Typography>
                          </Box>
                          
                          {goal.preferred_university && (
                            <Box>
                              <Chip label="희망 대학" size="small" sx={{ mr: 1 }} />
                              <Typography variant="body2" component="span">
                                {goal.preferred_university}
                              </Typography>
                            </Box>
                          )}
                          
                          {goal.career_goal && (
                            <Box>
                              <Chip label="진로 목표" size="small" sx={{ mr: 1 }} />
                              <Typography variant="body2" component="span">
                                {goal.career_goal}
                              </Typography>
                            </Box>
                          )}
                          
                          {goal.notes && (
                            <Typography variant="body2" color="textSecondary">
                              메모: {goal.notes}
                            </Typography>
                          )}
                        </Box>
                      </CardContent>
                    </Card>
                  </Box>
                ))}

                {academicGoals.length === 0 && (
                  <Alert severity="info">등록된 학업 목표가 없습니다.</Alert>
                )}
              </Box>
            </TabPanel>
          </Paper>
        )}

        {/* 시험 성적 입력 다이얼로그 */}
        <Dialog open={examDialog} onClose={() => setExamDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>
            {currentExam.exam_id ? '시험 성적 수정' : '시험 성적 추가'}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
              <TextField
                label="시험명"
                value={currentExam.exam_name}
                onChange={(e) => setCurrentExam({ ...currentExam, exam_name: e.target.value })}
                required
              />
              
              <TextField
                label="과목"
                value={currentExam.subject}
                onChange={(e) => setCurrentExam({ ...currentExam, subject: e.target.value })}
              />
              
              <FormControl>
                <InputLabel>시험 유형</InputLabel>
                <Select
                  value={currentExam.exam_type}
                  label="시험 유형"
                  onChange={(e) => setCurrentExam({ ...currentExam, exam_type: e.target.value })}
                >
                  <MenuItem value="midterm">중간고사</MenuItem>
                  <MenuItem value="final">기말고사</MenuItem>
                  <MenuItem value="quiz">퀴즈</MenuItem>
                  <MenuItem value="assignment">과제</MenuItem>
                  <MenuItem value="other">기타</MenuItem>
                </Select>
              </FormControl>
              
              <TextField
                type="date"
                label="시험 날짜"
                value={currentExam.exam_date}
                onChange={(e) => setCurrentExam({ ...currentExam, exam_date: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
              
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  type="number"
                  label="점수"
                  value={currentExam.score}
                  onChange={(e) => setCurrentExam({ ...currentExam, score: Number(e.target.value) })}
                  fullWidth
                />
                <TextField
                  type="number"
                  label="만점"
                  value={currentExam.max_score}
                  onChange={(e) => setCurrentExam({ ...currentExam, max_score: Number(e.target.value) })}
                  fullWidth
                />
              </Box>
              
              <TextField
                label="학기"
                value={currentExam.semester}
                onChange={(e) => setCurrentExam({ ...currentExam, semester: e.target.value })}
                placeholder="예: 2024-1"
              />
              
              <TextField
                label="비고"
                value={currentExam.notes}
                onChange={(e) => setCurrentExam({ ...currentExam, notes: e.target.value })}
                multiline
                rows={2}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setExamDialog(false)}>취소</Button>
            <Button onClick={handleSaveExam} variant="contained" disabled={loading}>
              저장
            </Button>
          </DialogActions>
        </Dialog>

        {/* 학습 진도 입력 다이얼로그 */}
        <Dialog open={progressDialog} onClose={() => setProgressDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>
            {currentProgress.progress_id ? '학습 진도 수정' : '학습 진도 추가'}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
              <TextField
                label="과목"
                value={currentProgress.subject}
                onChange={(e) => setCurrentProgress({ ...currentProgress, subject: e.target.value })}
                required
              />
              
              <TextField
                type="date"
                label="기록 날짜"
                value={currentProgress.record_date}
                onChange={(e) => setCurrentProgress({ ...currentProgress, record_date: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
              
              <Box>
                <Typography gutterBottom>완료율: {currentProgress.completion_percentage}%</Typography>
                <Slider
                  value={currentProgress.completion_percentage}
                  onChange={(e, value) => setCurrentProgress({ ...currentProgress, completion_percentage: value as number })}
                  valueLabelDisplay="auto"
                  min={0}
                  max={100}
                />
              </Box>
              
              <Box>
                <Typography gutterBottom>출석률: {currentProgress.attendance_rate}%</Typography>
                <Slider
                  value={currentProgress.attendance_rate}
                  onChange={(e, value) => setCurrentProgress({ ...currentProgress, attendance_rate: value as number })}
                  valueLabelDisplay="auto"
                  min={0}
                  max={100}
                  color="secondary"
                />
              </Box>
              
              <FormControl>
                <InputLabel>전반적 성과</InputLabel>
                <Select
                  value={currentProgress.overall_performance}
                  label="전반적 성과"
                  onChange={(e) => setCurrentProgress({ ...currentProgress, overall_performance: e.target.value as any })}
                >
                  <MenuItem value="excellent">우수</MenuItem>
                  <MenuItem value="good">양호</MenuItem>
                  <MenuItem value="average">보통</MenuItem>
                  <MenuItem value="below_average">미흡</MenuItem>
                  <MenuItem value="poor">부진</MenuItem>
                </Select>
              </FormControl>
              
              <TextField
                label="교사 코멘트"
                value={currentProgress.teacher_comments}
                onChange={(e) => setCurrentProgress({ ...currentProgress, teacher_comments: e.target.value })}
                multiline
                rows={3}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setProgressDialog(false)}>취소</Button>
            <Button onClick={handleSaveProgress} variant="contained" disabled={loading}>
              저장
            </Button>
          </DialogActions>
        </Dialog>

        {/* 학업 목표 입력 다이얼로그 */}
        <Dialog open={goalDialog} onClose={() => setGoalDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>
            {currentGoal.goal_id ? '학업 목표 수정' : '학업 목표 추가'}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
              <TextField
                type="date"
                label="목표 설정 날짜"
                value={currentGoal.goal_date}
                onChange={(e) => setCurrentGoal({ ...currentGoal, goal_date: e.target.value })}
                InputLabelProps={{ shrink: true }}
                required
              />
              
              <TextField
                label="희망 전공"
                value={currentGoal.preferred_major}
                onChange={(e) => setCurrentGoal({ ...currentGoal, preferred_major: e.target.value })}
                required
              />
              
              <TextField
                label="희망 대학"
                value={currentGoal.preferred_university}
                onChange={(e) => setCurrentGoal({ ...currentGoal, preferred_university: e.target.value })}
              />
              
              <TextField
                label="진로 목표"
                value={currentGoal.career_goal}
                onChange={(e) => setCurrentGoal({ ...currentGoal, career_goal: e.target.value })}
              />
              
              <TextField
                label="메모"
                value={currentGoal.notes}
                onChange={(e) => setCurrentGoal({ ...currentGoal, notes: e.target.value })}
                multiline
                rows={3}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setGoalDialog(false)}>취소</Button>
            <Button onClick={handleSaveGoal} variant="contained" disabled={loading}>
              저장
            </Button>
          </DialogActions>
        </Dialog>

        {/* 스낵바 */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        >
          <Alert 
            onClose={() => setSnackbar(prev => ({ ...prev, open: false }))} 
            severity={snackbar.severity}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Container>
    </Layout>
  );
};

export default ReportDataEntry;