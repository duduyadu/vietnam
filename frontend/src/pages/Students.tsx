import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
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
  Card,
  CardContent,
  CircularProgress,
  Skeleton,
  Checkbox,
  Fab,
  Badge,
  Slide,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Visibility,
  Search,
  Description,
  FilterList,
  School,
  DateRange,
  CheckBox,
  CheckBoxOutlineBlank,
  FormatListNumbered,
  PictureAsPdf
} from '@mui/icons-material';
import Layout from '../components/Layout';
import StudentAddModal from '../components/StudentAddModal';
import ExcelManager from '../components/ExcelManager';
import BatchReportGenerator from '../components/BatchReportGenerator';
import SimplePDFButton from '../components/SimplePDFButton';
import { studentsAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { extractErrorMessage } from '../utils/errorHandler';

interface Student {
  student_id: number;
  student_code: string;
  status: string;
  agency_name?: string;
  created_at?: string;
  // 백엔드 API 응답 형식에 맞게 수정
  name?: string;
  phone?: string;
  email?: string;
  birth_date?: string;
  // 구버전 호환성을 위해 attributes도 옵셔널로 유지
  attributes?: {
    name?: string;
    birth_date?: string;
    phone?: string;
    email?: string;
  };
}

const Students: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [studentByCode, setStudentByCode] = useState<Student | null>(null);
  const [searchCode, setSearchCode] = useState('');
  const [searchError, setSearchError] = useState('');
  
  // 체크박스 선택 관련 상태
  const [selectedStudents, setSelectedStudents] = useState<Set<number>>(new Set());
  const [isBatchReportOpen, setIsBatchReportOpen] = useState(false);
  const [smartFilter, setSmartFilter] = useState<string | null>(null);
  
  // ID 범위 필터 상태
  const [idRangeFilter, setIdRangeFilter] = useState({ from: '', to: '' });
  const [showIdRangeDialog, setShowIdRangeDialog] = useState(false);

  useEffect(() => {
    // 한국 지점은 학생 목록을 로드하지 않음
    if (user?.role !== 'korean_branch') {
      loadStudents();
    } else {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, rowsPerPage, user]);

  const loadStudents = async () => {
    try {
      setLoading(true);
      const response = await studentsAPI.getAll({
        page: page + 1,
        limit: rowsPerPage
      });
      setStudents(response.data.data);
      setTotalCount(response.data.pagination.total_items);
    } catch (error: any) {
      console.error('Failed to load students:', error);
      // 한국 지점이 접근하면 에러 메시지 표시
      if (error.response?.status === 403) {
        setSearchError(extractErrorMessage(error, '접근이 거부되었습니다.'));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSearchByCode = async () => {
    if (!searchCode.trim()) {
      setSearchError('학생 ID를 입력해주세요.');
      return;
    }

    try {
      setLoading(true);
      setSearchError('');
      const response = await studentsAPI.getByCode(searchCode);
      setStudentByCode(response.data.data);
    } catch (error: any) {
      console.error('Failed to search student:', error);
      if (error.response?.status === 404) {
        setSearchError('해당 학생 ID를 찾을 수 없습니다.');
      } else {
        setSearchError('학생 조회 중 오류가 발생했습니다.');
      }
      setStudentByCode(null);
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

  const handleView = (studentId: number) => {
    navigate(`/students/${studentId}`);
  };

  const handleEdit = (studentId: number) => {
    navigate(`/students/${studentId}/edit`);
  };

  // 체크박스 관련 함수들
  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const allIds = new Set(students.map(s => s.student_id));
      setSelectedStudents(allIds);
    } else {
      setSelectedStudents(new Set());
    }
  };

  const handleSelectStudent = (studentId: number) => {
    const newSelected = new Set(selectedStudents);
    if (newSelected.has(studentId)) {
      newSelected.delete(studentId);
    } else {
      newSelected.add(studentId);
    }
    setSelectedStudents(newSelected);
  };

  const isSelected = (studentId: number) => selectedStudents.has(studentId);
  const isAllSelected = students.length > 0 && selectedStudents.size === students.length;
  const isIndeterminate = selectedStudents.size > 0 && selectedStudents.size < students.length;

  // 스마트 필터 함수
  const applySmartFilter = (filterType: string | null) => {
    setSmartFilter(filterType);
    setSelectedStudents(new Set());
    
    if (!filterType) return;
    
    const filtered = new Set<number>();
    const today = new Date();
    const thisMonth = today.getMonth();
    const thisYear = today.getFullYear();
    
    students.forEach(student => {
      switch (filterType) {
        case 'studying':
          if (student.status === 'studying') {
            filtered.add(student.student_id);
          }
          break;
        case 'this_month':
          const createdDate = new Date(student.created_at || '');
          if (createdDate.getMonth() === thisMonth && createdDate.getFullYear() === thisYear) {
            filtered.add(student.student_id);
          }
          break;
        case 'graduated':
          if (student.status === 'graduated') {
            filtered.add(student.student_id);
          }
          break;
      }
    });
    
    setSelectedStudents(filtered);
  };

  // ID 범위 필터 적용
  const applyIdRangeFilter = () => {
    const from = parseInt(idRangeFilter.from);
    const to = parseInt(idRangeFilter.to);
    
    if (isNaN(from) || isNaN(to)) {
      alert('올바른 ID 번호를 입력해주세요.');
      return;
    }
    
    if (from > to) {
      alert('시작 ID가 종료 ID보다 클 수 없습니다.');
      return;
    }
    
    const filtered = new Set<number>();
    students.forEach(student => {
      if (student.student_id >= from && student.student_id <= to) {
        filtered.add(student.student_id);
      }
    });
    
    setSelectedStudents(filtered);
    setShowIdRangeDialog(false);
    setSmartFilter('id_range'); // 다른 필터와 구분하기 위한 표시
  };

  // 선택된 학생 정보 가져오기
  const getSelectedStudentsData = () => {
    return students.filter(s => selectedStudents.has(s.student_id)).map(s => ({
      student_id: s.student_id,
      student_code: s.student_code,
      student_name: s.name || s.attributes?.name || '이름 없음'
    }));
  };

  const handleBatchReportComplete = () => {
    setIsBatchReportOpen(false);
    setSelectedStudents(new Set());
    setSmartFilter(null);
  };

  const handleDelete = async (studentId: number, studentName: string) => {
    if (window.confirm(`정말로 "${studentName}" 학생을 삭제하시겠습니까?`)) {
      try {
        // 먼저 일반 삭제 시도
        const response = await studentsAPI.delete(studentId);
        
        // 서버 응답에 따른 메시지 표시
        if (response.data.soft_delete) {
          // 보관 처리됨 (archived)
          const forceDelete = window.confirm(
            `"${studentName}" 학생이 보관 처리되었습니다.\n` +
            `(상담 기록 ${response.data.consultation_count || 0}개 보존됨)\n\n` +
            `완전히 삭제하시겠습니까?`
          );
          
          if (forceDelete) {
            // 강제 삭제 실행
            const forceResponse = await studentsAPI.delete(studentId, { params: { force: 'true' } });
            alert('학생과 모든 관련 데이터가 완전히 삭제되었습니다.');
          } else {
            alert('학생이 보관 처리되었습니다.');
          }
        } else if (response.data.hard_delete) {
          // 완전 삭제됨
          alert('학생이 완전히 삭제되었습니다.');
        }
        
        loadStudents();
      } catch (error: any) {
        console.error('Failed to delete student:', error);
        alert(extractErrorMessage(error, '학생 삭제 중 오류가 발생했습니다.'));
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'studying':
        return 'success';
      case 'graduated':
        return 'primary';
      case 'withdrawn':
        return 'warning';
      case 'archived':
        return 'default';
      case 'deleted':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    return t(`student.statusOptions.${status}`);
  };

  const handleAddStudent = async (studentData: any) => {
    try {
      console.log('Adding student:', studentData);

      // FormData 처리를 위한 API 호출
      let response;
      if (studentData instanceof FormData) {
        // FormData인 경우 multipart/form-data로 전송
        response = await studentsAPI.createWithFile(studentData);
      } else {
        // 일반 JSON 데이터
        response = await studentsAPI.create(studentData);
      }
      console.log('Student created:', response.data);

      alert('학생이 성공적으로 추가되었습니다!');
      setIsAddModalOpen(false);

      // 관리자와 교사는 목록 새로고침 - await 추가
      if (user?.role !== 'korean_branch') {
        await loadStudents();
      }
      
      // Promise가 성공적으로 완료됨을 명시적으로 반환
      return response.data;
    } catch (error: any) {
      console.error('Failed to add student - Full error:', error);
      console.error('Error response:', error.response);
      console.error('Error data:', error.response?.data);
      console.error('Error status:', error.response?.status);
      
      // 더 구체적인 에러 메시지
      const errorMsg = error.response?.data?.message_ko || 
                      error.response?.data?.error || 
                      error.message || 
                      '학생 추가 중 오류가 발생했습니다.';
      
      alert(`학생 추가 실패: ${errorMsg}`);
      // 에러를 다시 던져서 모달에서 catch할 수 있도록 함
      throw error;
    }
  };

  // 한국 지점 전용 UI
  if (user?.role === 'korean_branch') {
    return (
      <Layout>
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h4">
              학생 관리
            </Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => setIsAddModalOpen(true)}
            >
              {t('student.addStudent')}
            </Button>
          </Box>
          
          <Alert severity="info" sx={{ mb: 3 }}>
            학생 ID를 입력하여 개별 학생 정보를 조회하거나 새로운 학생을 등록할 수 있습니다.
          </Alert>

          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                학생 ID로 검색
              </Typography>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  fullWidth
                  label="학생 ID"
                  placeholder="예: 20240001"
                  value={searchCode}
                  onChange={(e) => setSearchCode(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleSearchByCode();
                    }
                  }}
                />
                <Button
                  variant="contained"
                  onClick={handleSearchByCode}
                  disabled={loading}
                  sx={{ minWidth: 120 }}
                >
                  검색
                </Button>
              </Box>
              {searchError && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  {searchError}
                </Alert>
              )}
            </CardContent>
          </Card>

          {studentByCode && (
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  학생 정보
                </Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 3 }}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      학생 ID
                    </Typography>
                    <Typography variant="body1">
                      {studentByCode.student_code}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      이름
                    </Typography>
                    <Typography variant="body1">
                      {studentByCode.name || studentByCode.attributes?.name || '-'}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      유학원
                    </Typography>
                    <Typography variant="body1">
                      {studentByCode.agency_name || '-'}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      연락처
                    </Typography>
                    <Typography variant="body1">
                      {studentByCode.phone || studentByCode.attributes?.phone || '-'}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      이메일
                    </Typography>
                    <Typography variant="body1">
                      {studentByCode.email || studentByCode.attributes?.email || '-'}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      상태
                    </Typography>
                    <Chip
                      label={getStatusLabel(studentByCode.status)}
                      color={getStatusColor(studentByCode.status) as any}
                      size="small"
                    />
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
                  <Button variant="contained" startIcon={<Edit />}>
                    수정
                  </Button>
                  <Button variant="outlined" startIcon={<Visibility />}>
                    상세보기
                  </Button>
                </Box>
              </CardContent>
            </Card>
          )}
        </Container>
        
        <StudentAddModal
          open={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onSubmit={handleAddStudent}
        />
      </Layout>
    );
  }

  // 기존 UI (관리자, 교사용)
  return (
    <Layout>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        {/* 엑셀 관리 섹션 */}
        <Box sx={{ mb: 4 }}>
          <ExcelManager />
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4">
            {t('student.title')}
          </Typography>
          {user && (user.role === 'admin' || user.role === 'teacher') && (
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => setIsAddModalOpen(true)}
            >
              {t('student.addStudent')}
            </Button>
          )}
        </Box>

        <Paper sx={{ p: 2, mb: 2 }}>
          <Box sx={{ display: 'flex', gap: 2, flexDirection: 'column' }}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder={t('common.search')}
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
            
            {/* 스마트 필터 버튼 */}
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', mr: 1 }}>
                <FilterList sx={{ mr: 0.5 }} /> 빠른 선택:
              </Typography>
              <ToggleButtonGroup
                value={smartFilter === 'id_range' ? null : smartFilter}
                exclusive
                onChange={(e, value) => applySmartFilter(value)}
                size="small"
              >
                <ToggleButton value="studying">
                  <School sx={{ mr: 0.5 }} /> 현재 재학중
                </ToggleButton>
                <ToggleButton value="this_month">
                  <DateRange sx={{ mr: 0.5 }} /> 이번달 등록
                </ToggleButton>
                <ToggleButton value="graduated">
                  <CheckBox sx={{ mr: 0.5 }} /> 졸업생
                </ToggleButton>
              </ToggleButtonGroup>
              
              <Button
                size="small"
                variant={smartFilter === 'id_range' ? 'contained' : 'outlined'}
                startIcon={<FormatListNumbered />}
                onClick={() => setShowIdRangeDialog(true)}
              >
                ID 범위
              </Button>
              
              {smartFilter && (
                <Button
                  size="small"
                  onClick={() => {
                    setSmartFilter(null);
                    setSelectedStudents(new Set());
                    setIdRangeFilter({ from: '', to: '' });
                  }}
                >
                  필터 해제
                </Button>
              )}
            </Box>
            
            {selectedStudents.size > 0 && (
              <Alert severity="info">
                {selectedStudents.size}명의 학생이 선택되었습니다.
              </Alert>
            )}
          </Box>
        </Paper>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox">
                  <Checkbox
                    indeterminate={isIndeterminate}
                    checked={isAllSelected}
                    onChange={handleSelectAll}
                  />
                </TableCell>
                <TableCell>{t('student.studentCode')}</TableCell>
                <TableCell>{t('student.name')}</TableCell>
                <TableCell>유학원</TableCell>
                <TableCell>{t('student.phone')}</TableCell>
                <TableCell>{t('student.email')}</TableCell>
                <TableCell>{t('student.status')}</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                // 스켈레톤 로더로 개선
                [...Array(5)].map((_, index) => (
                  <TableRow key={`skeleton-${index}`}>
                    <TableCell><Skeleton width={100} /></TableCell>
                    <TableCell><Skeleton width={120} /></TableCell>
                    <TableCell><Skeleton width={100} /></TableCell>
                    <TableCell><Skeleton width={130} /></TableCell>
                    <TableCell><Skeleton width={150} /></TableCell>
                    <TableCell><Skeleton width={80} /></TableCell>
                    <TableCell align="center"><Skeleton width={100} /></TableCell>
                  </TableRow>
                ))
              ) : students.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    No students found
                  </TableCell>
                </TableRow>
              ) : (
                students.map((student) => {
                  const isItemSelected = isSelected(student.student_id);
                  return (
                  <TableRow 
                    key={student.student_id}
                    hover
                    selected={isItemSelected}
                  >
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={isItemSelected}
                        onChange={() => handleSelectStudent(student.student_id)}
                      />
                    </TableCell>
                    <TableCell>{student.student_code}</TableCell>
                    <TableCell>{student.name || student.attributes?.name || '-'}</TableCell>
                    <TableCell>{student.agency_name || '-'}</TableCell>
                    <TableCell>{student.phone || student.attributes?.phone || '-'}</TableCell>
                    <TableCell>{student.email || student.attributes?.email || '-'}</TableCell>
                    <TableCell>
                      <Chip
                        label={getStatusLabel(student.status)}
                        color={getStatusColor(student.status) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <IconButton 
                        size="small" 
                        color="primary"
                        onClick={() => handleView(student.student_id)}
                        title="보기"
                      >
                        <Visibility />
                      </IconButton>
                      <SimplePDFButton
                        studentId={student.student_id}
                        studentName={student.name || student.attributes?.name}
                      />
                      <IconButton 
                        size="small" 
                        color="primary"
                        onClick={() => handleEdit(student.student_id)}
                        title="편집"
                      >
                        <Edit />
                      </IconButton>
                      <IconButton 
                        size="small" 
                        color="error"
                        onClick={() => handleDelete(student.student_id, student.name || student.attributes?.name || '이름 없음')}
                        title="삭제"
                      >
                        <Delete />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
                })
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
        
        <StudentAddModal
          open={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onSubmit={handleAddStudent}
        />
        
        {/* 일괄 보고서 생성 모달 */}
        {selectedStudents.size > 0 && (
          <BatchReportGenerator
            open={isBatchReportOpen}
            onClose={() => setIsBatchReportOpen(false)}
            selectedStudents={getSelectedStudentsData()}
            onComplete={handleBatchReportComplete}
          />
        )}
        
        {/* 플로팅 액션 바 */}
        <Slide direction="up" in={selectedStudents.size > 0} mountOnEnter unmountOnExit>
          <Box
            sx={{
              position: 'fixed',
              bottom: 24,
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 1000,
              display: 'flex',
              gap: 2,
              padding: 2,
              backgroundColor: 'background.paper',
              borderRadius: 2,
              boxShadow: 3
            }}
          >
            <Chip
              label={`${selectedStudents.size}명 선택됨`}
              color="primary"
              sx={{ fontWeight: 'bold' }}
            />
            <Tooltip title="일괄 보고서 생성">
              <Fab
                color="primary"
                size="medium"
                onClick={() => setIsBatchReportOpen(true)}
              >
                <Badge badgeContent={selectedStudents.size} color="error">
                  <Description />
                </Badge>
              </Fab>
            </Tooltip>
            <Button
              variant="text"
              size="small"
              onClick={() => {
                setSelectedStudents(new Set());
                setSmartFilter(null);
              }}
            >
              선택 해제
            </Button>
          </Box>
        </Slide>
        
        {/* ID 범위 필터 다이얼로그 */}
        <Dialog open={showIdRangeDialog} onClose={() => setShowIdRangeDialog(false)}>
          <DialogTitle>ID 범위로 선택</DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
              <TextField
                label="시작 ID"
                type="number"
                value={idRangeFilter.from}
                onChange={(e) => setIdRangeFilter({ ...idRangeFilter, from: e.target.value })}
                placeholder="예: 1"
                fullWidth
              />
              <TextField
                label="종료 ID"
                type="number"
                value={idRangeFilter.to}
                onChange={(e) => setIdRangeFilter({ ...idRangeFilter, to: e.target.value })}
                placeholder="예: 50"
                fullWidth
              />
            </Box>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
              * 학생 ID 번호를 기준으로 범위 내의 모든 학생을 선택합니다.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowIdRangeDialog(false)}>취소</Button>
            <Button onClick={applyIdRangeFilter} variant="contained">적용</Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Layout>
  );
};

export default Students;