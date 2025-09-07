import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Alert,
  CircularProgress
} from '@mui/material';
import { ArrowBack, School } from '@mui/icons-material';
import Layout from '../components/Layout';
import { studentsAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

interface TopikScore {
  exam_id: number;
  exam_name: string;
  exam_date: string;
  score: number;
  max_score: number;
  percentage: number;
  notes?: string;
}

const TopikScores: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [student, setStudent] = useState<any>(null);
  const [scores, setScores] = useState<TopikScore[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // 학생 정보 로드
      const studentResponse = await studentsAPI.getById(Number(id));
      setStudent(studentResponse.data.data);
      
      // TOPIK 점수 로드
      const token = localStorage.getItem('token');
      const scoresResponse = await axios.get(
        `${process.env.REACT_APP_API_URL}/reports/exam-results/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      // TOPIK 점수만 필터링
      const topikScores = scoresResponse.data.data.filter(
        (exam: any) => exam.exam_type === 'TOPIK_MOCK' || exam.subject === 'TOPIK'
      );
      
      setScores(topikScores);
    } catch (error: any) {
      console.error('Failed to load data:', error);
      setError('데이터를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const getGradeFromScore = (score: number) => {
    if (score >= 140) return { grade: '2급', color: 'success' as const };
    if (score >= 80) return { grade: '1급', color: 'warning' as const };
    return { grade: '미달', color: 'default' as const };
  };

  const parseScoreDetails = (notes: string) => {
    // TOPIK I 형식 (읽기, 듣기만)
    const match = notes?.match(/읽기: (\d+)점, 듣기: (\d+)점/);
    if (match) {
      return {
        reading: parseInt(match[1]),
        listening: parseInt(match[2]),
        writing: 0  // TOPIK I에는 쓰기 없음
      };
    }
    return null;
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR');
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
          <Button startIcon={<ArrowBack />} onClick={() => navigate(-1)} sx={{ mt: 2 }}>
            돌아가기
          </Button>
        </Container>
      </Layout>
    );
  }

  return (
    <Layout>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box>
            <Typography variant="h4" gutterBottom>
              TOPIK 모의고사 성적
            </Typography>
            <Typography variant="h6" color="text.secondary">
              {student?.name_ko || student?.name_vi || '-'} ({student?.student_code})
            </Typography>
          </Box>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate(`/students/${id}`)}
          >
            학생 정보로 돌아가기
          </Button>
        </Box>

        {scores.length === 0 ? (
          <Paper sx={{ p: 3 }}>
            <Alert severity="info">
              아직 TOPIK 모의고사 성적이 없습니다.
            </Alert>
          </Paper>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: 'primary.light' }}>
                  <TableCell><strong>회차</strong></TableCell>
                  <TableCell><strong>시험 날짜</strong></TableCell>
                  <TableCell align="center"><strong>읽기</strong></TableCell>
                  <TableCell align="center"><strong>듣기</strong></TableCell>
                  <TableCell align="center"><strong>총점</strong></TableCell>
                  <TableCell align="center"><strong>등급</strong></TableCell>
                  <TableCell align="center"><strong>목표 달성률</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {scores.map((score) => {
                  const details = parseScoreDetails(score.notes || '');
                  const grade = getGradeFromScore(score.score);
                  const targetPercentage = Math.round((score.score / 140) * 100); // 2급 목표 대비 달성률
                  
                  return (
                    <TableRow key={score.exam_id}>
                      <TableCell>{score.exam_name}</TableCell>
                      <TableCell>{formatDate(score.exam_date)}</TableCell>
                      <TableCell align="center">
                        {details ? `${details.reading}/100` : '-'}
                      </TableCell>
                      <TableCell align="center">
                        {details ? `${details.listening}/100` : '-'}
                      </TableCell>
                      <TableCell align="center">
                        <Typography variant="h6" color="primary">
                          {score.score}/200
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Chip 
                          label={grade.grade} 
                          color={grade.color}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Typography 
                          variant="body2" 
                          color={targetPercentage >= 100 ? 'success.main' : 'text.secondary'}
                        >
                          {targetPercentage}%
                        </Typography>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* 성적 요약 */}
        {scores.length > 0 && (
          <Box sx={{ mt: 3, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2 }}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle2" color="text.secondary">최고 점수</Typography>
              <Typography variant="h5" color="success.main">
                {Math.max(...scores.map(s => s.score))}점
              </Typography>
            </Paper>
            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle2" color="text.secondary">평균 점수</Typography>
              <Typography variant="h5" color="primary">
                {Math.round(scores.reduce((sum, s) => sum + s.score, 0) / scores.length)}점
              </Typography>
            </Paper>
            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle2" color="text.secondary">시험 횟수</Typography>
              <Typography variant="h5">
                {scores.length}회
              </Typography>
            </Paper>
          </Box>
        )}
      </Container>
    </Layout>
  );
};

export default TopikScores;