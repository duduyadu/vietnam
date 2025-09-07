import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Alert,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  Divider
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  GetApp as DownloadIcon,
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import Grid from './GridCompat'; // Grid 호환성 래퍼 사용
import api from '../services/api';

interface UploadResult {
  total: number;
  success: number;
  failed: number;
  errors: string[];
  processed: Array<{
    student_code: string;
    student_name: string;
    scores_updated: boolean;
  }>;
}

const TopikScoresUpload: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<UploadResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const selectedFile = event.target.files[0];
      
      // 파일 타입 확인
      if (!selectedFile.name.endsWith('.xlsx') && !selectedFile.name.endsWith('.xls')) {
        setError('엑셀 파일(.xlsx, .xls)만 업로드 가능합니다.');
        return;
      }
      
      setFile(selectedFile);
      setError(null);
      setResult(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('파일을 선택해주세요.');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await api.post('/topik-scores/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setResult(response.data.results);
      setFile(null);
      
      // 파일 입력 초기화
      const fileInput = document.getElementById('file-input') as HTMLInputElement;
      if (fileInput) {
        fileInput.value = '';
      }
    } catch (err: any) {
      setError(err.response?.data?.error || '업로드 중 오류가 발생했습니다.');
    } finally {
      setUploading(false);
    }
  };

  const downloadTemplate = async () => {
    try {
      const response = await api.get('/topik-scores/template', {
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'topik_scores_template.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError('템플릿 다운로드 중 오류가 발생했습니다.');
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        TOPIK 점수 일괄 업로드
      </Typography>

      {/* 안내 메시지 */}
      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2">
          엑셀 파일을 통해 여러 학생의 TOPIK 모의고사 점수를 한 번에 업로드할 수 있습니다.
          템플릿을 다운로드하여 양식에 맞게 작성 후 업로드해주세요.
        </Typography>
      </Alert>

      <Grid container spacing={3}>
        {/* 업로드 섹션 */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                1. 템플릿 다운로드
              </Typography>
              <Button
                variant="outlined"
                startIcon={<DownloadIcon />}
                onClick={downloadTemplate}
                fullWidth
                sx={{ mb: 3 }}
              >
                TOPIK 점수 템플릿 다운로드
              </Button>

              <Divider sx={{ my: 2 }} />

              <Typography variant="h6" gutterBottom>
                2. 파일 업로드
              </Typography>
              
              <input
                accept=".xlsx,.xls"
                style={{ display: 'none' }}
                id="file-input"
                type="file"
                onChange={handleFileSelect}
              />
              <label htmlFor="file-input">
                <Button
                  variant="outlined"
                  component="span"
                  startIcon={<UploadIcon />}
                  fullWidth
                  sx={{ mb: 2 }}
                >
                  파일 선택
                </Button>
              </label>

              {file && (
                <Alert severity="success" sx={{ mb: 2 }}>
                  선택된 파일: {file.name}
                </Alert>
              )}

              <Button
                variant="contained"
                color="primary"
                onClick={handleUpload}
                disabled={!file || uploading}
                fullWidth
                startIcon={uploading ? <CircularProgress size={20} color="inherit" /> : <UploadIcon />}
              >
                {uploading ? '업로드 중...' : '업로드'}
              </Button>

              {error && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  {error}
                </Alert>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* 결과 섹션 */}
        <Grid item xs={12} md={6}>
          {result && (
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  업로드 결과
                </Typography>

                <Box sx={{ mb: 2 }}>
                  <Grid container spacing={2}>
                    <Grid item xs={4}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h4" color="primary">
                          {result.total}
                        </Typography>
                        <Typography variant="caption">전체</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={4}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h4" color="success.main">
                          {result.success}
                        </Typography>
                        <Typography variant="caption">성공</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={4}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h4" color="error.main">
                          {result.failed}
                        </Typography>
                        <Typography variant="caption">실패</Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </Box>

                {result.processed.length > 0 && (
                  <>
                    <Typography variant="subtitle2" gutterBottom>
                      처리된 학생 목록:
                    </Typography>
                    <List dense sx={{ maxHeight: 200, overflow: 'auto' }}>
                      {result.processed.map((item, index) => (
                        <ListItem key={index}>
                          <SuccessIcon color="success" sx={{ mr: 1 }} />
                          <ListItemText
                            primary={`${item.student_code} - ${item.student_name}`}
                            secondary="점수 업데이트 완료"
                          />
                        </ListItem>
                      ))}
                    </List>
                  </>
                )}

                {result.errors.length > 0 && (
                  <>
                    <Typography variant="subtitle2" color="error" gutterBottom sx={{ mt: 2 }}>
                      오류 목록:
                    </Typography>
                    <List dense>
                      {result.errors.map((error, index) => (
                        <ListItem key={index}>
                          <ErrorIcon color="error" sx={{ mr: 1 }} />
                          <ListItemText primary={error} />
                        </ListItem>
                      ))}
                    </List>
                  </>
                )}
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>

      {/* 사용 안내 */}
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            <InfoIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            사용 안내
          </Typography>
          <List>
            <ListItem>
              <ListItemText
                primary="1. 템플릿 다운로드"
                secondary="제공된 템플릿을 다운로드하여 양식을 확인하세요."
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary="2. 데이터 입력"
                secondary="학생ID, 회차별 점수(듣기, 읽기, 총점, 급수)를 입력하세요."
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary="3. 파일 업로드"
                secondary="작성 완료된 엑셀 파일을 선택 후 업로드 버튼을 클릭하세요."
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary="4. 결과 확인"
                secondary="업로드 결과를 확인하고, 오류가 있다면 수정 후 다시 업로드하세요."
              />
            </ListItem>
          </List>
        </CardContent>
      </Card>
    </Box>
  );
};

export default TopikScoresUpload;