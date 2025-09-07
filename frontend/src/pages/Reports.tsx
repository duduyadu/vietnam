import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Alert,
  Snackbar,
  CircularProgress,
  IconButton,
  Tooltip,
  Autocomplete,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormLabel,
  FormControl
} from '@mui/material';
import {
  PictureAsPdf,
  Add,
  Refresh,
  FileDownload,
  Schedule,
  CheckCircle,
  Error,
  Archive
} from '@mui/icons-material';
import Layout from '../components/Layout';
import reportService, { 
  GeneratedReport, 
  GenerateReportRequest 
} from '../services/reportService';
import api from '../services/api';

interface Student {
  student_id: number;
  student_code: string;
  student_name: string;
}

const Reports: React.FC = () => {
  const { t } = useTranslation();
  
  // States
  const [reports, setReports] = useState<GeneratedReport[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  const [reportsLoading, setReportsLoading] = useState(true);
  
  // Dialog states
  const [generateDialogOpen, setGenerateDialogOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [selectedLanguage, setSelectedLanguage] = useState<'ko' | 'vi'>('ko');
  
  // Pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalReports, setTotalReports] = useState(0);
  
  // Notification
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'warning' | 'info'
  });

  // Load initial data
  useEffect(() => {
    loadReports();
    loadStudents();
  }, []);

  // Reload reports when page changes
  useEffect(() => {
    loadReports();
  }, [page, rowsPerPage]);

  const loadReports = async () => {
    try {
      setReportsLoading(true);
      const result = await reportService.getReports({
        page: page + 1,
        limit: rowsPerPage
      });
      setReports(result.data);
      setTotalReports(result.pagination.total);
    } catch (error) {
      console.error('Failed to load reports:', error);
      showSnackbar('보고서 목록 로드에 실패했습니다.', 'error');
    } finally {
      setReportsLoading(false);
    }
  };

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
    }
  };

  const showSnackbar = (message: string, severity: 'success' | 'error' | 'warning' | 'info') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const handleGenerateReport = async () => {
    if (!selectedStudent) {
      showSnackbar('학생을 선택해주세요.', 'warning');
      return;
    }
    
    // PDF 종합 보고서 템플릿 코드 고정
    const pdfTemplateCode = 'consultation_comprehensive';

    const validation = reportService.validateDateRange(dateRange.start, dateRange.end);
    if (!validation.isValid) {
      showSnackbar(validation.error!, 'error');
      return;
    }

    try {
      setLoading(true);
      
      const request: GenerateReportRequest = {
        student_id: selectedStudent.student_id,
        template_code: pdfTemplateCode,
        date_range: dateRange.start || dateRange.end ? {
          start: dateRange.start || undefined,
          end: dateRange.end || undefined
        } : undefined,
        language: selectedLanguage
      };

      const result = await reportService.generateReport(request);
      
      showSnackbar(
        `보고서가 성공적으로 생성되었습니다. (${reportService.formatGenerationTime(result.generation_time)})`,
        'success'
      );
      
      // Reset form and close dialog
      setGenerateDialogOpen(false);
      setSelectedStudent(null);
      setDateRange({ start: '', end: '' });
      setSelectedLanguage('ko');
      
      // Reload reports
      loadReports();
      
    } catch (error: any) {
      console.error('Failed to generate report:', error);
      const errorMessage = error.response?.data?.message_ko || 
                          error.response?.data?.message || 
                          '보고서 생성에 실패했습니다.';
      showSnackbar(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadReport = async (report: GeneratedReport) => {
    try {
      setLoading(true);
      console.log('Starting download for report:', report.report_id);
      console.log('Report details:', {
        id: report.report_id,
        status: report.status,
        pdf_path: report.pdf_path,
        file_size: report.file_size
      });
      
      await reportService.downloadAndSaveReport(
        report.report_id,
        `${report.report_title}_${report.student_code}.pdf`
      );
      showSnackbar('보고서가 다운로드되었습니다.', 'success');
    } catch (error: any) {
      console.error('❌ Download failed!');
      console.error('Error details:', error);
      console.error('Error response:', error.response);
      console.error('Error message:', error.message);
      
      // 더 자세한 에러 메시지 표시
      const errorMessage = error.response?.data?.message_ko || 
                          error.response?.data?.message || 
                          error.response?.data?.error ||
                          error.message ||
                          '보고서 다운로드에 실패했습니다.';
      
      showSnackbar(`다운로드 오류: ${errorMessage}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'generating':
        return <Schedule color="info" />;
      case 'completed':
        return <CheckCircle color="success" />;
      case 'failed':
        return <Error color="error" />;
      case 'archived':
        return <Archive color="warning" />;
      default:
        return <Schedule />;
    }
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <Layout>
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          {t('menu.reports')}
        </Typography>

        {/* 상단 액션 영역 */}
        <Box sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'center' }}>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setGenerateDialogOpen(true)}
            disabled={loading}
          >
            보고서 생성
          </Button>
          
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={loadReports}
            disabled={loading}
          >
            새로고침
          </Button>
        </Box>

        {/* PDF 보고서 생성 안내 */}
        <Paper sx={{ p: 3, mb: 4, backgroundColor: '#f5f5f5' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <PictureAsPdf sx={{ mr: 2, color: 'primary.main', fontSize: 32 }} />
            <Typography variant="h6">
              학생 종합 보고서 (PDF)
            </Typography>
          </Box>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
            학생의 모든 정보와 상담 기록을 종합한 상세 보고서를 PDF 형식으로 생성합니다.
            보고서는 한국어 또는 베트남어로 생성 가능하며, 필요한 기간을 선택하여 생성할 수 있습니다.
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setGenerateDialogOpen(true)}
            disabled={loading}
            size="large"
          >
            PDF 보고서 생성
          </Button>
        </Paper>

        {/* 생성된 보고서 목록 */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            생성된 보고서
          </Typography>
          
          {reportsLoading ? (
            <Box display="flex" justifyContent="center" p={3}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>상태</TableCell>
                      <TableCell>제목</TableCell>
                      <TableCell>학생</TableCell>
                      <TableCell>템플릿</TableCell>
                      <TableCell>생성일</TableCell>
                      <TableCell>크기</TableCell>
                      <TableCell>액션</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {reports.map((report) => (
                      <TableRow key={report.report_id}>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            {getStatusIcon(report.status)}
                            <Chip
                              label={reportService.getStatusText(report.status)}
                              size="small"
                              color={reportService.getStatusColor(report.status)}
                              sx={{ ml: 1 }}
                            />
                          </Box>
                        </TableCell>
                        
                        <TableCell>
                          <Typography variant="body2" fontWeight="medium">
                            {report.report_title}
                          </Typography>
                          {report.error_message && (
                            <Typography variant="caption" color="error">
                              {report.error_message}
                            </Typography>
                          )}
                        </TableCell>
                        
                        <TableCell>
                          <Typography variant="body2">
                            {report.student_name}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            {report.student_code}
                          </Typography>
                        </TableCell>
                        
                        <TableCell>
                          <Typography variant="body2">
                            {report.template_name}
                          </Typography>
                        </TableCell>
                        
                        <TableCell>
                          <Typography variant="body2">
                            {new Date(report.generated_at).toLocaleDateString('ko-KR')}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            {new Date(report.generated_at).toLocaleTimeString('ko-KR')}
                          </Typography>
                        </TableCell>
                        
                        <TableCell>
                          <Typography variant="body2">
                            {reportService.formatFileSize(report.file_size)}
                          </Typography>
                          {report.generation_time_ms && (
                            <Typography variant="caption" color="textSecondary">
                              {reportService.formatGenerationTime(report.generation_time_ms)}
                            </Typography>
                          )}
                        </TableCell>
                        
                        <TableCell>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            {report.status === 'completed' && (
                              <Tooltip title="다운로드">
                                <IconButton
                                  size="small"
                                  onClick={() => handleDownloadReport(report)}
                                  disabled={loading}
                                >
                                  <FileDownload />
                                </IconButton>
                              </Tooltip>
                            )}
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              
              <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={totalReports}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                labelRowsPerPage="페이지당 행 수:"
                labelDisplayedRows={({ from, to, count }) => 
                  `${from}-${to} / ${count !== -1 ? count : `${to} 이상`}`
                }
              />
            </>
          )}
        </Paper>

        {/* 보고서 생성 다이얼로그 */}
        <Dialog 
          open={generateDialogOpen} 
          onClose={() => setGenerateDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>보고서 생성</DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 2 }}>
              
              {/* 학생 선택 */}
              <Autocomplete
                options={students}
                getOptionLabel={(option) => `${option.student_name} (${option.student_code})`}
                value={selectedStudent}
                onChange={(event, newValue) => setSelectedStudent(newValue)}
                renderInput={(params) => (
                  <TextField {...params} label="학생 선택" required />
                )}
                disabled={loading}
              />

              {/* 보고서 유형 - PDF 종합 보고서만 */}
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  보고서 유형
                </Typography>
                <Paper sx={{ p: 2, backgroundColor: '#f0f7ff' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <PictureAsPdf sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="body1">
                      학생 종합 보고서 (PDF)
                    </Typography>
                  </Box>
                </Paper>
              </Box>

              {/* 날짜 범위 */}
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  보고서 대상 기간 (선택사항)
                </Typography>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <TextField
                    type="date"
                    label="시작일"
                    value={dateRange.start}
                    onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                    InputLabelProps={{ shrink: true }}
                    disabled={loading}
                  />
                  <TextField
                    type="date"
                    label="종료일"
                    value={dateRange.end}
                    onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                    InputLabelProps={{ shrink: true }}
                    disabled={loading}
                  />
                </Box>
              </Box>

              {/* 언어 선택 */}
              <FormControl component="fieldset">
                <FormLabel component="legend">보고서 언어</FormLabel>
                <RadioGroup
                  row
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value as 'ko' | 'vi')}
                >
                  <FormControlLabel 
                    value="ko" 
                    control={<Radio />} 
                    label="한국어" 
                    disabled={loading}
                  />
                  <FormControlLabel 
                    value="vi" 
                    control={<Radio />} 
                    label="베트남어 (Tiếng Việt)" 
                    disabled={loading}
                  />
                </RadioGroup>
              </FormControl>

            </Box>
          </DialogContent>
          <DialogActions>
            <Button 
              onClick={() => setGenerateDialogOpen(false)}
              disabled={loading}
            >
              취소
            </Button>
            <Button 
              onClick={handleGenerateReport}
              variant="contained"
              disabled={loading}
            >
              {loading ? <CircularProgress size={20} /> : '생성'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* 스낵바 */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert 
            onClose={handleCloseSnackbar} 
            severity={snackbar.severity}
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Container>
    </Layout>
  );
};

export default Reports;