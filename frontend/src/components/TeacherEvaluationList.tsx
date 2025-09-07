import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Chip,
  Button,
  Tooltip,
  Typography,
  Card,
  CardContent,
  LinearProgress
} from '@mui/material';
import {
  Add,
  Edit,
  Visibility,
  Delete,
  Assessment,
  TrendingUp,
  School,
  CheckCircle
} from '@mui/icons-material';
import Grid from './GridCompat';
import api from '../services/api';
import TeacherEvaluationModal from './TeacherEvaluationModal';

interface TeacherEvaluationListProps {
  studentId: number;
  studentName: string;
}

interface Evaluation {
  evaluation_id: number;
  evaluation_date: string;
  evaluation_type: string;
  evaluation_period: string;
  teacher_name: string;
  teacher_agency: string;
  overall_rating: string;
  status: string;
  attendance_rate: number;
  growth_potential: string;
}

const TeacherEvaluationList: React.FC<TeacherEvaluationListProps> = ({
  studentId,
  studentName
}) => {
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedEvaluation, setSelectedEvaluation] = useState<number | undefined>();
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create');
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    loadEvaluations();
    loadStats();
  }, [studentId, page, rowsPerPage]);

  const loadEvaluations = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/teacher-evaluations/student/${studentId}`, {
        params: {
          limit: rowsPerPage,
          offset: page * rowsPerPage
        }
      });
      
      if (response.data.success) {
        setEvaluations(response.data.data);
        setTotal(response.data.pagination.total);
      }
    } catch (error) {
      console.error('Failed to load evaluations:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await api.get(`/teacher-evaluations/stats/${studentId}`);
      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const handleCreate = () => {
    setSelectedEvaluation(undefined);
    setModalMode('create');
    setModalOpen(true);
  };

  const handleView = (evaluationId: number) => {
    setSelectedEvaluation(evaluationId);
    setModalMode('view');
    setModalOpen(true);
  };

  const handleEdit = (evaluationId: number) => {
    setSelectedEvaluation(evaluationId);
    setModalMode('edit');
    setModalOpen(true);
  };

  const handleDelete = async (evaluationId: number) => {
    if (!window.confirm('정말 이 평가를 삭제하시겠습니까?')) return;
    
    try {
      await api.delete(`/teacher-evaluations/${evaluationId}`);
      loadEvaluations();
      loadStats();
    } catch (error) {
      console.error('Failed to delete evaluation:', error);
      alert('삭제에 실패했습니다.');
    }
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setSelectedEvaluation(undefined);
  };

  const handleModalSave = () => {
    loadEvaluations();
    loadStats();
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

  const getGrowthPotentialColor = (potential: string) => {
    switch(potential) {
      case 'very_high': return 'success';
      case 'high': return 'primary';
      case 'medium': return 'warning';
      case 'low': return 'error';
      default: return 'default';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR');
  };

  const getTypeLabel = (type: string) => {
    switch(type) {
      case 'monthly': return '월간';
      case 'quarterly': return '분기';
      case 'semester': return '학기';
      case 'special': return '특별';
      default: return type;
    }
  };

  const getRatingLabel = (rating: string) => {
    switch(rating) {
      case 'excellent': return '매우 우수';
      case 'good': return '우수';
      case 'average': return '보통';
      case 'poor': return '미흡';
      default: return rating;
    }
  };

  const getGrowthLabel = (growth: string) => {
    switch(growth) {
      case 'very_high': return '매우 높음';
      case 'high': return '높음';
      case 'medium': return '보통';
      case 'low': return '낮음';
      default: return growth;
    }
  };

  return (
    <Box>
      {/* 통계 카드 */}
      {stats && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center">
                  <Assessment color="primary" sx={{ mr: 2 }} />
                  <Box>
                    <Typography variant="h4">{stats.total || 0}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      총 평가 수
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center">
                  <School color="success" sx={{ mr: 2 }} />
                  <Box>
                    <Typography variant="h4">
                      {stats.recentAverage ? stats.recentAverage.toFixed(1) : '-'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      최근 평균
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center">
                  <TrendingUp color="info" sx={{ mr: 2 }} />
                  <Box>
                    <Typography variant="h4">
                      {evaluations[0]?.attendance_rate || '-'}%
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      최근 출석률
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center">
                  <CheckCircle color="warning" sx={{ mr: 2 }} />
                  <Box>
                    <Typography variant="h4">
                      {evaluations[0]?.growth_potential ? getGrowthLabel(evaluations[0].growth_potential) : '-'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      성장 가능성
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* 평가 목록 테이블 */}
      <Paper elevation={2}>
        <Box p={2} display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">선생님 평가 이력</Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<Add />}
            onClick={handleCreate}
          >
            새 평가 작성
          </Button>
        </Box>
        
        {loading && <LinearProgress />}
        
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>평가일</TableCell>
                <TableCell>유형</TableCell>
                <TableCell>기간</TableCell>
                <TableCell>평가 교사</TableCell>
                <TableCell>소속</TableCell>
                <TableCell align="center">종합 평가</TableCell>
                <TableCell align="center">출석률</TableCell>
                <TableCell align="center">성장 가능성</TableCell>
                <TableCell align="center">상태</TableCell>
                <TableCell align="center">작업</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {evaluations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} align="center">
                    <Typography color="text.secondary" sx={{ py: 3 }}>
                      평가 기록이 없습니다.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                evaluations.map((evaluation) => (
                  <TableRow key={evaluation.evaluation_id} hover>
                    <TableCell>{formatDate(evaluation.evaluation_date)}</TableCell>
                    <TableCell>
                      <Chip 
                        label={getTypeLabel(evaluation.evaluation_type)}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>{evaluation.evaluation_period || '-'}</TableCell>
                    <TableCell>{evaluation.teacher_name || '-'}</TableCell>
                    <TableCell>{evaluation.teacher_agency || '-'}</TableCell>
                    <TableCell align="center">
                      <Chip
                        label={getRatingLabel(evaluation.overall_rating)}
                        color={getRatingColor(evaluation.overall_rating) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Box display="flex" alignItems="center" justifyContent="center">
                        <Typography variant="body2">
                          {evaluation.attendance_rate}%
                        </Typography>
                        <Box sx={{ width: 60, ml: 1 }}>
                          <LinearProgress 
                            variant="determinate" 
                            value={evaluation.attendance_rate} 
                            color={evaluation.attendance_rate >= 90 ? 'success' : evaluation.attendance_rate >= 70 ? 'warning' : 'error'}
                          />
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={getGrowthLabel(evaluation.growth_potential)}
                        color={getGrowthPotentialColor(evaluation.growth_potential) as any}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={evaluation.status}
                        color={getStatusColor(evaluation.status) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="조회">
                        <IconButton
                          size="small"
                          onClick={() => handleView(evaluation.evaluation_id)}
                        >
                          <Visibility />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="수정">
                        <IconButton
                          size="small"
                          onClick={() => handleEdit(evaluation.evaluation_id)}
                          disabled={evaluation.status === 'approved'}
                        >
                          <Edit />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="삭제">
                        <IconButton
                          size="small"
                          onClick={() => handleDelete(evaluation.evaluation_id)}
                          disabled={evaluation.status === 'approved'}
                        >
                          <Delete />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        
        <TablePagination
          component="div"
          count={total}
          page={page}
          onPageChange={(e, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          labelRowsPerPage="페이지당 행:"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} / 전체 ${count}`}
        />
      </Paper>

      {/* 평가 모달 */}
      <TeacherEvaluationModal
        open={modalOpen}
        onClose={handleModalClose}
        studentId={studentId}
        studentName={studentName}
        evaluationId={selectedEvaluation}
        mode={modalMode}
        onSave={handleModalSave}
      />
    </Box>
  );
};

export default TeacherEvaluationList;