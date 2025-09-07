import React, { useState, useRef } from 'react';
import {
  Box,
  Button,
  Typography,
  Alert,
  Paper,
  Grid,
  CircularProgress,
  Divider,
  Chip
} from '@mui/material';
import {
  Download,
  Upload,
  Description,
  People,
  Assignment
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { extractErrorMessage } from '../utils/errorHandler';

const ExcelManager: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 권한 체크
  const canDownload = user?.role === 'admin' || user?.role === 'teacher';
  const canUpload = user?.role === 'admin' || user?.role === 'teacher';
  const downloadScope = user?.role === 'admin' ? '전체 학생' : '소속 유학원 학생';

  const handleExcelDownload = async (type: 'students' | 'consultations') => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `http://localhost:5000/api/excel/${type}/download`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          },
          responseType: 'blob'
        }
      );

      // 파일 다운로드
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      
      // 파일명 생성
      const date = new Date().toISOString().split('T')[0];
      const filename = type === 'students' 
        ? `학생목록_${date}.xlsx`
        : `상담기록_${date}.xlsx`;
      
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      setSuccess(`${type === 'students' ? '학생 목록' : '상담 기록'}을 다운로드했습니다.`);
    } catch (error: any) {
      console.error('Download error:', error);
      if (error.response?.status === 403) {
        setError('엑셀 다운로드 권한이 없습니다.');
      } else if (error.response?.status === 404) {
        setError('다운로드할 데이터가 없습니다.');
      } else {
        setError(extractErrorMessage(error, '다운로드 중 오류가 발생했습니다.'));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleTemplateDownload = async () => {
    if (user?.role !== 'admin' && user?.role !== 'teacher') {
      setError('템플릿 다운로드 권한이 없습니다.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        'http://localhost:5000/api/excel/template/download',
        {
          headers: {
            'Authorization': `Bearer ${token}`
          },
          responseType: 'blob'
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'student_template.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      setSuccess('템플릿을 다운로드했습니다.');
    } catch (error: any) {
      console.error('Template download error:', error);
      setError(extractErrorMessage(error, '템플릿 다운로드 중 오류가 발생했습니다.'));
    } finally {
      setLoading(false);
    }
  };

  const handleExcelUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // 파일 형식 체크
    const validTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel'
    ];
    
    if (!validTypes.includes(file.type)) {
      setError('엑셀 파일(.xlsx, .xls)만 업로드 가능합니다.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        'http://localhost:5000/api/excel/students/upload',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`
          }
        }
      );

      setSuccess(`${response.data.imported}명의 학생 정보가 성공적으로 업로드되었습니다.`);
      
      // 파일 입력 초기화
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error: any) {
      console.error('Upload error:', error);
      if (error.response?.status === 403) {
        setError('엑셀 업로드 권한이 없습니다.');
      } else if (error.response?.data?.errors) {
        const errors = error.response.data.errors;
        setError(`업로드 실패:\n${errors.join('\n')}`);
      } else {
        setError(extractErrorMessage(error, '업로드 중 오류가 발생했습니다.'));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper elevation={2} sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        엑셀 관리
      </Typography>

      <Box sx={{ mb: 2 }}>
        <Chip 
          label={`권한: ${user?.role === 'admin' ? '관리자' : user?.role === 'teacher' ? '선생님' : '한국 지점'}`}
          color="primary"
          size="small"
        />
        <Chip 
          label={`다운로드 범위: ${downloadScope}`}
          color="info"
          size="small"
          sx={{ ml: 1 }}
        />
      </Box>

      <Divider sx={{ my: 2 }} />

      {/* 다운로드 섹션 */}
      <Typography variant="h6" gutterBottom>
        데이터 다운로드
      </Typography>
      
      {canDownload ? (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Button
              variant="contained"
              color="primary"
              startIcon={loading ? <CircularProgress size={20} /> : <People />}
              onClick={() => handleExcelDownload('students')}
              disabled={loading}
              fullWidth
            >
              학생 목록 다운로드
            </Button>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Button
              variant="contained"
              color="secondary"
              startIcon={loading ? <CircularProgress size={20} /> : <Assignment />}
              onClick={() => handleExcelDownload('consultations')}
              disabled={loading}
              fullWidth
            >
              상담 기록 다운로드
            </Button>
          </Grid>
        </Grid>
      ) : (
        <Alert severity="warning" sx={{ mb: 3 }}>
          엑셀 다운로드 권한이 없습니다.
        </Alert>
      )}

      <Divider sx={{ my: 2 }} />

      {/* 업로드 섹션 */}
      <Typography variant="h6" gutterBottom>
        데이터 업로드
      </Typography>

      {canUpload ? (
        <Box>
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Button
                variant="outlined"
                startIcon={<Description />}
                onClick={handleTemplateDownload}
                disabled={loading}
                fullWidth
              >
                템플릿 다운로드
              </Button>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls"
                onChange={handleExcelUpload}
                style={{ display: 'none' }}
              />
              <Button
                variant="contained"
                color="success"
                startIcon={loading ? <CircularProgress size={20} /> : <Upload />}
                onClick={() => fileInputRef.current?.click()}
                disabled={loading}
                fullWidth
              >
                학생 정보 업로드
              </Button>
            </Grid>
          </Grid>

          <Alert severity="info" icon={false}>
            <Typography variant="body2">
              <strong>업로드 순서:</strong>
            </Typography>
            <ol style={{ margin: '8px 0', paddingLeft: '20px' }}>
              <li>템플릿 다운로드</li>
              <li>엑셀 파일에 학생 정보 입력</li>
              <li>작성된 파일 업로드</li>
            </ol>
            {user?.role === 'teacher' && (
              <Typography variant="body2" color="primary">
                * 업로드된 학생은 자동으로 귀하의 유학원 소속으로 등록됩니다.
              </Typography>
            )}
          </Alert>
        </Box>
      ) : (
        <Alert severity="warning">
          엑셀 업로드 권한이 없습니다.
        </Alert>
      )}

      {/* 알림 메시지 */}
      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error.split('\n').map((line, index) => (
            <div key={index}>{line}</div>
          ))}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mt: 2 }}>
          {success}
        </Alert>
      )}
    </Paper>
  );
};

export default ExcelManager;