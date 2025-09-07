import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import {
  Container,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Typography,
  Button,
  Box,
  Chip,
  IconButton,
  TextField,
  InputAdornment,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Checkbox,
  Fab,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  ListItemButton
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Visibility,
  Search,
  FileDownload,
  PictureAsPdf
} from '@mui/icons-material';
import Layout from '../components/Layout';
import ConsultationModal from '../components/ConsultationModal';
// import { PDFDownloadIcon } from '../components/PDFExportButton'; // 중복 기능 제거
import SimplePDFButton from '../components/SimplePDFButton';
import { consultationsAPI, studentsAPI } from '../services/api';
import reportService from '../services/reportService';
import { useAuth } from '../contexts/AuthContext';
import { extractErrorMessage } from '../utils/errorHandler';

interface ActionItems {
  improvements?: string;
  next_goals?: string;
  student_opinion?: string;
  counselor_evaluation?: string;
}

interface Consultation {
  consultation_id: number;
  student_id: number;
  teacher_id: number;
  consultation_date: string;
  consultation_type: string;
  content_ko: string;
  content_vi?: string;
  action_items?: string;
  next_consultation_date?: string;
  student_name_ko?: string;
  student_name_vi?: string;
  student_code?: string;
  teacher_name?: string;
}

const Consultations: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // 모달 관련 상태
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedConsultation, setSelectedConsultation] = useState<Consultation | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewConsultation, setViewConsultation] = useState<Consultation | null>(null);
  const [modalStudentId, setModalStudentId] = useState<number | undefined>(undefined);
  const [modalStudentName, setModalStudentName] = useState<string>('');
  const [isStudentSelectOpen, setIsStudentSelectOpen] = useState(false);
  const [students, setStudents] = useState<any[]>([]);
  const [studentSearchTerm, setStudentSearchTerm] = useState('');
  
  // 일괄 다운로드를 위한 상태
  const [selectedConsultations, setSelectedConsultations] = useState<number[]>([]);
  const [batchDownloading, setBatchDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);

  useEffect(() => {
    loadConsultations();
  }, [page, rowsPerPage, searchTerm]);

  // URL 파라미터 처리
  useEffect(() => {
    const newConsultation = searchParams.get('newConsultation');
    const studentId = searchParams.get('studentId');
    
    if (newConsultation === 'true' && studentId) {
      setModalStudentId(parseInt(studentId));
      setIsModalOpen(true);
    }
  }, [searchParams]);

  const loadConsultations = async () => {
    try {
      setLoading(true);
      const response = await consultationsAPI.getAll({
        page: page + 1,
        limit: rowsPerPage,
        search: searchTerm
      });
      
      console.log('Consultations API Response:', response.data); // 디버깅용
      
      if (response.data.success) {
        setConsultations(response.data.data || []);
        setTotalCount(response.data.pagination?.total || 0);
        console.log('Loaded consultations:', response.data.data?.length || 0); // 디버깅용
      }
    } catch (error: any) {
      console.error('Failed to load consultations:', error);
      setError(extractErrorMessage(error, '상담 기록을 불러오는데 실패했습니다.'));
    } finally {
      setLoading(false);
    }
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleAddConsultation = () => {
    // 모든 상태를 초기화하여 이전 데이터가 남아있지 않도록 함
    setSelectedConsultation(null);
    setModalStudentId(undefined);
    setModalStudentName('');
    setIsStudentSelectOpen(true);
    loadStudents();
  };

  const loadStudents = async () => {
    try {
      const response = await studentsAPI.getAll({ limit: 100 });
      setStudents(response.data.data || []);
    } catch (error) {
      console.error('Failed to load students:', error);
    }
  };

  const handleStudentSelect = (student: any) => {
    // 새 학생 선택 시 이전 상담 데이터 초기화
    setSelectedConsultation(null);
    setModalStudentId(student.student_id);
    setModalStudentName(student.name_ko || student.name_vi || '');
    setIsStudentSelectOpen(false);
    setIsModalOpen(true); // 바로 상담 모달 열기
  };


  const handleEditConsultation = (consultation: Consultation) => {
    setSelectedConsultation(consultation);
    setIsModalOpen(true);
  };

  const handleViewConsultation = (consultation: Consultation) => {
    setViewConsultation(consultation);
    setIsViewModalOpen(true);
  };

  const handleDeleteConsultation = async (consultation: Consultation) => {
    if (!window.confirm(`정말로 이 상담 기록을 삭제하시겠습니까?\n학생: ${consultation.student_name_ko || consultation.student_name_vi}\n날짜: ${consultation.consultation_date}`)) {
      return;
    }

    try {
      await consultationsAPI.delete(consultation.consultation_id);
      setSuccess('상담 기록이 삭제되었습니다.');
      loadConsultations();
    } catch (error: any) {
      console.error('Failed to delete consultation:', error);
      setError(extractErrorMessage(error, '상담 기록 삭제에 실패했습니다.'));
    }
  };

  const handleModalSuccess = () => {
    setSuccess('상담 기록이 저장되었습니다.');
    // 성공 후 모든 상태 초기화
    setSelectedConsultation(null);
    setModalStudentId(undefined);
    setModalStudentName('');
    loadConsultations();
  };

  const getConsultationTypeLabel = (type: string) => {
    const types: { [key: string]: string } = {
      in_person: '대면 상담',
      phone: '전화 상담',
      video: '화상 상담',
      email: '이메일 상담'
    };
    return types[type] || type;
  };

  const getConsultationTypeColor = (type: string): any => {
    const colors: { [key: string]: any } = {
      in_person: 'primary',
      phone: 'success',
      video: 'info',
      email: 'warning'
    };
    return colors[type] || 'default';
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR');
  };

  // 체크박스 핸들러
  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const allIds = consultations.map(c => c.consultation_id);
      setSelectedConsultations(allIds);
    } else {
      setSelectedConsultations([]);
    }
  };

  const handleSelectOne = (consultationId: number) => {
    const selectedIndex = selectedConsultations.indexOf(consultationId);
    let newSelected: number[] = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selectedConsultations, consultationId);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selectedConsultations.slice(1));
    } else if (selectedIndex === selectedConsultations.length - 1) {
      newSelected = newSelected.concat(selectedConsultations.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selectedConsultations.slice(0, selectedIndex),
        selectedConsultations.slice(selectedIndex + 1)
      );
    }

    setSelectedConsultations(newSelected);
  };

  // 일괄 PDF 다운로드
  const handleBatchDownload = async () => {
    if (selectedConsultations.length === 0) {
      setError('다운로드할 상담 기록을 선택해주세요.');
      return;
    }

    setBatchDownloading(true);
    setDownloadProgress(0);

    try {
      const selectedRecords = consultations.filter(c => 
        selectedConsultations.includes(c.consultation_id)
      );

      let completed = 0;
      const total = selectedRecords.length;

      for (const consultation of selectedRecords) {
        try {
          // PDF 생성
          const generateResult = await reportService.generateReport({
            student_id: consultation.student_id,
            template_code: 'consultation_comprehensive',
            language: 'ko'
          });

          // PDF 다운로드
          if (generateResult?.report_id) {
            await reportService.downloadAndSaveReport(
              generateResult.report_id,
              `${consultation.student_name_ko || consultation.student_name_vi}_${consultation.consultation_id}_report.pdf`
            );
          }

          completed++;
          setDownloadProgress((completed / total) * 100);
        } catch (error) {
          console.error(`Failed to download PDF for consultation ${consultation.consultation_id}:`, error);
        }
      }

      setSuccess(`${completed}개의 PDF 파일이 다운로드되었습니다.`);
      setSelectedConsultations([]);
    } catch (error: any) {
      console.error('Batch download error:', error);
      setError('일괄 다운로드 중 오류가 발생했습니다.');
    } finally {
      setBatchDownloading(false);
      setDownloadProgress(0);
    }
  };

  return (
    <Layout>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4">
            상담 기록 관리
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<Add />}
              onClick={handleAddConsultation}
            >
              새 상담 기록
            </Button>
          </Box>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
            {success}
          </Alert>
        )}

        <Paper sx={{ p: 2, mb: 2 }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="학생 이름, 학생 코드, 상담 내용으로 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
          />
        </Paper>

        {batchDownloading && (
          <Box sx={{ width: '100%', mb: 2 }}>
            <LinearProgress variant="determinate" value={downloadProgress} />
            <Typography variant="caption" sx={{ mt: 1 }}>
              다운로드 진행 중... {Math.round(downloadProgress)}%
            </Typography>
          </Box>
        )}

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox">
                  <Checkbox
                    indeterminate={selectedConsultations.length > 0 && selectedConsultations.length < consultations.length}
                    checked={consultations.length > 0 && selectedConsultations.length === consultations.length}
                    onChange={handleSelectAll}
                  />
                </TableCell>
                <TableCell>상담 날짜</TableCell>
                <TableCell>학생명</TableCell>
                <TableCell>학생 코드</TableCell>
                <TableCell>상담 유형</TableCell>
                <TableCell>담당 교사</TableCell>
                <TableCell>다음 상담</TableCell>
                <TableCell align="center">작업</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    로딩 중...
                  </TableCell>
                </TableRow>
              ) : consultations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    상담 기록이 없습니다. 상담을 추가해주세요.
                  </TableCell>
                </TableRow>
              ) : (
                consultations.map((consultation) => (
                  <TableRow key={consultation.consultation_id}>
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={selectedConsultations.indexOf(consultation.consultation_id) !== -1}
                        onChange={() => handleSelectOne(consultation.consultation_id)}
                      />
                    </TableCell>
                    <TableCell>{formatDate(consultation.consultation_date)}</TableCell>
                    <TableCell>
                      {consultation.student_name_ko || consultation.student_name_vi || '-'}
                    </TableCell>
                    <TableCell>{consultation.student_code || '-'}</TableCell>
                    <TableCell>
                      <Chip
                        label={getConsultationTypeLabel(consultation.consultation_type)}
                        color={getConsultationTypeColor(consultation.consultation_type)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{consultation.teacher_name || '-'}</TableCell>
                    <TableCell>
                      {consultation.next_consultation_date ? 
                        formatDate(consultation.next_consultation_date) : 
                        '-'}
                    </TableCell>
                    <TableCell align="center">
                      <IconButton
                        size="small"
                        color="info"
                        onClick={() => handleViewConsultation(consultation)}
                        title="보기"
                      >
                        <Visibility />
                      </IconButton>
                      <SimplePDFButton
                        consultationId={consultation.consultation_id}
                        studentId={consultation.student_id}
                        studentName={consultation.student_name_ko || consultation.student_name_vi}
                      />
                      {(user?.role === 'admin' || user?.user_id === consultation.teacher_id) && (
                        <>
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => handleEditConsultation(consultation)}
                            title="수정"
                          >
                            <Edit />
                          </IconButton>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDeleteConsultation(consultation)}
                            title="삭제"
                          >
                            <Delete />
                          </IconButton>
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={totalCount}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </TableContainer>

        {/* 일괄 다운로드 플로팅 버튼 */}
        {selectedConsultations.length > 0 && (
          <Fab
            color="primary"
            aria-label="batch download"
            onClick={handleBatchDownload}
            disabled={batchDownloading}
            sx={{
              position: 'fixed',
              bottom: 80,
              right: 24,
            }}
          >
            <FileDownload />
          </Fab>
        )}

        {/* 선택된 항목 수 표시 */}
        {selectedConsultations.length > 0 && (
          <Box
            sx={{
              position: 'fixed',
              bottom: 140,
              right: 24,
              bgcolor: 'primary.main',
              color: 'white',
              borderRadius: 2,
              padding: '8px 16px',
              boxShadow: 3,
            }}
          >
            <Typography variant="body2">
              {selectedConsultations.length}개 선택됨
            </Typography>
          </Box>
        )}

        {/* 상담 기록 추가/수정 모달 */}
        <ConsultationModal
          open={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setModalStudentId(undefined);
            setModalStudentName('');
            setSelectedConsultation(null);
          }}
          onSuccess={handleModalSuccess}
          consultation={selectedConsultation}
          studentId={modalStudentId}
        />

        {/* 상담 기록 상세 보기 모달 */}
        <Dialog
          open={isViewModalOpen}
          onClose={() => setIsViewModalOpen(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>상담 기록 상세</DialogTitle>
          <DialogContent>
            {viewConsultation && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">학생 정보</Typography>
                  <Typography variant="body1">
                    {viewConsultation.student_name_ko || viewConsultation.student_name_vi} 
                    ({viewConsultation.student_code})
                  </Typography>
                </Box>
                
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">상담 날짜</Typography>
                  <Typography variant="body1">
                    {formatDate(viewConsultation.consultation_date)}
                  </Typography>
                </Box>
                
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">상담 유형</Typography>
                  <Chip
                    label={getConsultationTypeLabel(viewConsultation.consultation_type)}
                    color={getConsultationTypeColor(viewConsultation.consultation_type)}
                    size="small"
                  />
                </Box>
                
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">담당 교사</Typography>
                  <Typography variant="body1">
                    {viewConsultation.teacher_name}
                  </Typography>
                </Box>
                
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">상담 내용 (한국어)</Typography>
                  <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                    <Typography variant="body1" style={{ whiteSpace: 'pre-wrap' }}>
                      {viewConsultation.content_ko || '내용 없음'}
                    </Typography>
                  </Paper>
                </Box>
                
                {viewConsultation.content_vi && (
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">상담 내용 (베트남어)</Typography>
                    <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                      <Typography variant="body1" style={{ whiteSpace: 'pre-wrap' }}>
                        {viewConsultation.content_vi}
                      </Typography>
                    </Paper>
                  </Box>
                )}
                
                {viewConsultation.action_items && (() => {
                  let actionItemsData: string | ActionItems = viewConsultation.action_items;
                  
                  // JSON 문자열인 경우 파싱
                  if (typeof actionItemsData === 'string') {
                    try {
                      actionItemsData = JSON.parse(actionItemsData) as ActionItems;
                    } catch (e) {
                      // 파싱 실패시 원본 문자열 사용
                    }
                  }
                  
                  // 객체인 경우 구조화된 표시
                  if (typeof actionItemsData === 'object' && actionItemsData !== null) {
                    const items = actionItemsData as ActionItems;
                    return (
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary">평가 및 목표</Typography>
                        {items.improvements && (
                          <Paper sx={{ p: 2, mb: 2, bgcolor: 'grey.50' }}>
                            <Typography variant="subtitle2" gutterBottom>개선 필요사항</Typography>
                            <Typography variant="body2">{items.improvements}</Typography>
                          </Paper>
                        )}
                        {items.next_goals && (
                          <Paper sx={{ p: 2, mb: 2, bgcolor: 'grey.50' }}>
                            <Typography variant="subtitle2" gutterBottom>다음 목표</Typography>
                            <Typography variant="body2">{items.next_goals}</Typography>
                          </Paper>
                        )}
                        {items.student_opinion && (
                          <Paper sx={{ p: 2, mb: 2, bgcolor: 'grey.50' }}>
                            <Typography variant="subtitle2" gutterBottom>학생 의견</Typography>
                            <Typography variant="body2">{items.student_opinion}</Typography>
                          </Paper>
                        )}
                        {items.counselor_evaluation && (
                          <Paper sx={{ p: 2, mb: 2, bgcolor: 'info.50' }}>
                            <Typography variant="subtitle2" gutterBottom>상담사 평가</Typography>
                            <Typography variant="body2">{items.counselor_evaluation}</Typography>
                          </Paper>
                        )}
                      </Box>
                    );
                  }
                  
                  // 그 외의 경우 원본 표시
                  return (
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">후속 조치 사항</Typography>
                      <Paper sx={{ p: 2, bgcolor: 'warning.50' }}>
                        <Typography variant="body1" style={{ whiteSpace: 'pre-wrap' }}>
                          {String(actionItemsData)}
                        </Typography>
                      </Paper>
                    </Box>
                  );
                })()}
                
                {viewConsultation.next_consultation_date && (
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">다음 상담 예정일</Typography>
                    <Typography variant="body1" color="primary">
                      {formatDate(viewConsultation.next_consultation_date)}
                    </Typography>
                  </Box>
                )}
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setIsViewModalOpen(false)}>닫기</Button>
          </DialogActions>
        </Dialog>

        {/* 학생 선택 다이얼로그 */}
        <Dialog
          open={isStudentSelectOpen}
          onClose={() => setIsStudentSelectOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>학생 선택</DialogTitle>
          <DialogContent>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="학생 이름으로 검색..."
              value={studentSearchTerm}
              onChange={(e) => setStudentSearchTerm(e.target.value)}
              sx={{ mb: 2 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
            />
            <List>
              {students
                .filter(student => 
                  !studentSearchTerm || 
                  (student.name_ko && student.name_ko.toLowerCase().includes(studentSearchTerm.toLowerCase())) ||
                  (student.name_vi && student.name_vi.toLowerCase().includes(studentSearchTerm.toLowerCase())) ||
                  (student.student_code && student.student_code.toLowerCase().includes(studentSearchTerm.toLowerCase()))
                )
                .map(student => (
                  <ListItemButton
                    key={student.student_id}
                    onClick={() => handleStudentSelect(student)}
                  >
                    <ListItemText
                      primary={`${student.name_ko || student.name_vi} (${student.student_code})`}
                      secondary={`생년월일: ${student.birth_date || 'N/A'}`}
                    />
                  </ListItemButton>
                ))
              }
            </List>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setIsStudentSelectOpen(false)}>취소</Button>
          </DialogActions>
        </Dialog>

      </Container>
    </Layout>
  );
};

export default Consultations;