import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Box,
  TextField,
  Button,
  Card,
  CardContent,
  Alert,
  Slider,
  Chip,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import Grid from '../components/GridCompat';
import {
  Add,
  Edit,
  Delete,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  Warning,
  School
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import Layout from '../components/Layout';
import axios from 'axios';
import { API_URL } from '../config';

interface TopikScore {
  reading: number;
  listening: number;
  writing: number;
  total: number;
}

interface TopikExam {
  exam_id: number;
  test_number: number;
  exam_date: string;
  score: number;
  grade: string;
  detailed_scores: {
    reading: number;
    listening: number;
    writing: number;
    total: number;
    achieved_level: number;
    test_number: number;
    improvement?: number;
    goal_distance?: number;
  };
  notes?: string;
}

const TopikMockExam: React.FC = () => {
  const { studentId } = useParams<{ studentId: string }>();
  const navigate = useNavigate();
  const [student, setStudent] = useState<any>(null);
  const [exams, setExams] = useState<TopikExam[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingExam, setEditingExam] = useState<TopikExam | null>(null);
  
  // 점수 입력 상태
  const [formData, setFormData] = useState({
    test_number: 1,
    test_date: new Date().toISOString().split('T')[0],
    reading: 0,
    listening: 0,
    writing: 0,
    teacher_comment: ''
  });

  useEffect(() => {
    if (studentId) {
      loadExams();
    }
  }, [studentId]);

  const loadExams = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // 학생 정보 및 TOPIK 시험 결과 로드
      const response = await axios.get(
        `${API_URL}/api/topik/student/${studentId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setStudent(response.data.data.student);
      setExams(response.data.data.exams);
      
      // 다음 시험 번호 자동 설정
      const nextTestNumber = response.data.data.exams.length + 1;
      if (nextTestNumber <= 8) {
        setFormData(prev => ({ ...prev, test_number: nextTestNumber }));
      }
    } catch (error) {
      console.error('Failed to load TOPIK exams:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      const token = localStorage.getItem('token');
      const data = {
        student_id: studentId,
        ...formData
      };
      
      if (editingExam) {
        // 수정
        await axios.put(
          `${API_URL}/api/topik/${editingExam.exam_id}`,
          data,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        // 생성
        await axios.post(
          `${API_URL}/api/topik`,
          data,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
      
      setOpenDialog(false);
      setEditingExam(null);
      resetForm();
      loadExams();
    } catch (error) {
      console.error('Failed to save TOPIK exam:', error);
    }
  };

  const handleEdit = (exam: TopikExam) => {
    setEditingExam(exam);
    setFormData({
      test_number: exam.detailed_scores.test_number,
      test_date: exam.exam_date.split('T')[0],
      reading: exam.detailed_scores.reading,
      listening: exam.detailed_scores.listening,
      writing: exam.detailed_scores.writing,
      teacher_comment: exam.notes || ''
    });
    setOpenDialog(true);
  };

  const handleDelete = async (examId: number) => {
    if (window.confirm('정말로 이 시험 기록을 삭제하시겠습니까?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(
          `${API_URL}/api/topik/${examId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        loadExams();
      } catch (error) {
        console.error('Failed to delete exam:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      test_number: exams.length + 1,
      test_date: new Date().toISOString().split('T')[0],
      reading: 0,
      listening: 0,
      writing: 0,
      teacher_comment: ''
    });
  };

  const calculateTotal = () => {
    return formData.reading + formData.listening + formData.writing;
  };

  const calculateLevel = (total: number) => {
    if (total >= 140) return { level: 2, color: 'success', text: '2급 달성!' };
    if (total >= 80) return { level: 1, color: 'warning', text: '1급' };
    return { level: 0, color: 'error', text: '미달' };
  };

  // 차트 데이터 생성 (Recharts 형식)
  const getChartData = () => {
    const sortedExams = [...exams].sort((a, b) => a.detailed_scores.test_number - b.detailed_scores.test_number);
    
    return sortedExams.map(e => ({
      name: `${e.detailed_scores.test_number}회차`,
      총점: e.score,
      목표: 140
    }));
  };

  if (loading) {
    return (
      <Layout>
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
          <LinearProgress />
        </Container>
      </Layout>
    );
  }

  return (
    <Layout>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        {/* 헤더 */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" gutterBottom>
            TOPIK 모의고사 관리
          </Typography>
          {student && (
            <Typography variant="h6" color="text.secondary">
              {student.name} ({student.student_code})
            </Typography>
          )}
        </Box>

        {/* 진전도 차트 */}
        {exams.length > 0 && (
          <Card sx={{ mb: 4 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                TOPIK 모의고사 진전도
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={getChartData()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis domain={[0, 170]} ticks={[0, 40, 80, 120, 140, 170]} />
                  <Tooltip />
                  <Legend />
                  <ReferenceLine y={140} stroke="red" strokeDasharray="5 5" label="목표 (2급)" />
                  <Line 
                    type="monotone" 
                    dataKey="총점" 
                    stroke="#4BC0C0" 
                    strokeWidth={2}
                    dot={{ fill: '#4BC0C0', r: 6 }}
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* 통계 카드 */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  응시 횟수
                </Typography>
                <Typography variant="h4">
                  {exams.length} / 8
                </Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={(exams.length / 8) * 100} 
                  sx={{ mt: 2 }}
                />
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  최고 점수
                </Typography>
                <Typography variant="h4">
                  {exams.length > 0 ? Math.max(...exams.map(e => e.score)) : 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  / 170점
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  평균 점수
                </Typography>
                <Typography variant="h4">
                  {exams.length > 0 
                    ? Math.round(exams.reduce((a, b) => a + b.score, 0) / exams.length)
                    : 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  목표: 140점
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  목표 달성
                </Typography>
                {exams.some(e => e.score >= 140) ? (
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <CheckCircle color="success" sx={{ fontSize: 40, mr: 1 }} />
                    <Typography variant="h5" color="success.main">
                      2급 달성!
                    </Typography>
                  </Box>
                ) : (
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <School color="primary" sx={{ fontSize: 40, mr: 1 }} />
                    <Typography variant="h5" color="primary">
                      학습 중
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* 시험 목록 */}
        <Paper sx={{ mb: 4 }}>
          <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">시험 기록</Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => {
                resetForm();
                setEditingExam(null);
                setOpenDialog(true);
              }}
              disabled={exams.length >= 8}
            >
              시험 추가
            </Button>
          </Box>
          
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>회차</TableCell>
                  <TableCell>시험일</TableCell>
                  <TableCell align="center">읽기</TableCell>
                  <TableCell align="center">듣기</TableCell>
                  <TableCell align="center">쓰기</TableCell>
                  <TableCell align="center">총점</TableCell>
                  <TableCell align="center">등급</TableCell>
                  <TableCell align="center">진전도</TableCell>
                  <TableCell align="center">작업</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {exams
                  .sort((a, b) => a.detailed_scores.test_number - b.detailed_scores.test_number)
                  .map((exam) => (
                    <TableRow key={exam.exam_id}>
                      <TableCell>{exam.detailed_scores.test_number}회차</TableCell>
                      <TableCell>{new Date(exam.exam_date).toLocaleDateString('ko-KR')}</TableCell>
                      <TableCell align="center">{exam.detailed_scores.reading}</TableCell>
                      <TableCell align="center">{exam.detailed_scores.listening}</TableCell>
                      <TableCell align="center">{exam.detailed_scores.writing}</TableCell>
                      <TableCell align="center">
                        <strong>{exam.score}</strong>
                      </TableCell>
                      <TableCell align="center">
                        <Chip 
                          label={exam.grade}
                          color={exam.score >= 140 ? 'success' : (exam.score >= 80 ? 'warning' : 'default')}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="center">
                        {exam.detailed_scores.improvement !== undefined && (
                          exam.detailed_scores.improvement > 0 ? (
                            <Chip
                              icon={<TrendingUp />}
                              label={`+${exam.detailed_scores.improvement}`}
                              color="success"
                              size="small"
                            />
                          ) : exam.detailed_scores.improvement < 0 ? (
                            <Chip
                              icon={<TrendingDown />}
                              label={exam.detailed_scores.improvement}
                              color="error"
                              size="small"
                            />
                          ) : (
                            <Chip label="변동없음" size="small" />
                          )
                        )}
                      </TableCell>
                      <TableCell align="center">
                        <IconButton size="small" onClick={() => handleEdit(exam)}>
                          <Edit />
                        </IconButton>
                        <IconButton size="small" color="error" onClick={() => handleDelete(exam.exam_id)}>
                          <Delete />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>

        {/* 입력 다이얼로그 */}
        <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>
            {editingExam ? 'TOPIK 모의고사 수정' : 'TOPIK 모의고사 추가'}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ mt: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <TextField
                    label="회차"
                    type="number"
                    value={formData.test_number}
                    onChange={(e) => setFormData({ ...formData, test_number: parseInt(e.target.value) })}
                    fullWidth
                    InputProps={{ inputProps: { min: 1, max: 8 } }}
                    disabled={editingExam !== null}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    label="시험일"
                    type="date"
                    value={formData.test_date}
                    onChange={(e) => setFormData({ ...formData, test_date: e.target.value })}
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <Typography gutterBottom>읽기 (0-60)</Typography>
                  <Slider
                    value={formData.reading}
                    onChange={(_, value) => setFormData({ ...formData, reading: value as number })}
                    max={60}
                    valueLabelDisplay="on"
                    marks={[
                      { value: 0, label: '0' },
                      { value: 30, label: '30' },
                      { value: 60, label: '60' }
                    ]}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <Typography gutterBottom>듣기 (0-60)</Typography>
                  <Slider
                    value={formData.listening}
                    onChange={(_, value) => setFormData({ ...formData, listening: value as number })}
                    max={60}
                    valueLabelDisplay="on"
                    marks={[
                      { value: 0, label: '0' },
                      { value: 30, label: '30' },
                      { value: 60, label: '60' }
                    ]}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <Typography gutterBottom>쓰기 (0-50)</Typography>
                  <Slider
                    value={formData.writing}
                    onChange={(_, value) => setFormData({ ...formData, writing: value as number })}
                    max={50}
                    valueLabelDisplay="on"
                    marks={[
                      { value: 0, label: '0' },
                      { value: 25, label: '25' },
                      { value: 50, label: '50' }
                    ]}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <Alert severity={calculateLevel(calculateTotal()).color as any}>
                    총점: {calculateTotal()}점 - {calculateLevel(calculateTotal()).text}
                  </Alert>
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    label="교사 코멘트"
                    multiline
                    rows={3}
                    value={formData.teacher_comment}
                    onChange={(e) => setFormData({ ...formData, teacher_comment: e.target.value })}
                    fullWidth
                    placeholder="학생의 강점과 개선점을 기록하세요"
                  />
                </Grid>
              </Grid>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>취소</Button>
            <Button onClick={handleSubmit} variant="contained">
              {editingExam ? '수정' : '저장'}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Layout>
  );
};

export default TopikMockExam;