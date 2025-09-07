import React, { useState, useRef } from 'react';
import {
  Box,
  Button,
  Typography,
  LinearProgress,
  Alert,
  Paper,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Chip
} from '@mui/material';
import {
  CloudUpload,
  Delete,
  InsertDriveFile,
  Image,
  PictureAsPdf
} from '@mui/icons-material';
import axios from 'axios';
import { extractErrorMessage } from '../utils/errorHandler';

interface FileUploadProps {
  studentId?: number;
  fileType?: 'transcript' | 'certificate' | 'photo' | 'document';
  onUploadSuccess?: (file: any) => void;
  multiple?: boolean;
  maxSize?: number; // MB
}

const FileUpload: React.FC<FileUploadProps> = ({
  studentId,
  fileType = 'document',
  onUploadSuccess,
  multiple = false,
  maxSize = 10
}) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) return <Image color="primary" />;
    if (file.type === 'application/pdf') return <PictureAsPdf color="error" />;
    return <InsertDriveFile color="action" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = event.target.files;
    if (!selectedFiles) return;

    const fileArray = Array.from(selectedFiles);
    
    // 파일 크기 검증
    const oversizedFiles = fileArray.filter(file => file.size > maxSize * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      setError(`다음 파일이 ${maxSize}MB를 초과합니다: ${oversizedFiles.map(f => f.name).join(', ')}`);
      return;
    }

    // 파일 형식 검증 (이미지 타입인 경우)
    if (fileType === 'photo') {
      const nonImageFiles = fileArray.filter(file => !file.type.startsWith('image/'));
      if (nonImageFiles.length > 0) {
        setError('사진 업로드는 이미지 파일만 가능합니다.');
        return;
      }
    }

    setFiles(fileArray);
    setError('');
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      setError('업로드할 파일을 선택해주세요.');
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    setError('');
    setSuccess('');

    const formData = new FormData();
    
    if (multiple) {
      files.forEach(file => {
        formData.append('files', file);
      });
    } else {
      formData.append('file', files[0]);
    }

    if (studentId) {
      formData.append('student_id', studentId.toString());
    }
    formData.append('fileType', fileType);

    try {
      const token = localStorage.getItem('token');
      const endpoint = fileType === 'photo' && studentId
        ? `/api/files/upload/photo/${studentId}`
        : multiple
        ? '/api/files/upload/multiple'
        : '/api/files/upload/single';

      const response = await axios.post(
        `http://localhost:5000${endpoint}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`
          },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / (progressEvent.total || 1)
            );
            setUploadProgress(percentCompleted);
          }
        }
      );

      setSuccess('파일이 성공적으로 업로드되었습니다!');
      setFiles([]);
      setUploadProgress(100);
      
      if (onUploadSuccess) {
        onUploadSuccess(response.data);
      }

      // 파일 입력 초기화
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      setTimeout(() => {
        setUploadProgress(0);
        setSuccess('');
      }, 3000);

    } catch (error: any) {
      console.error('Upload error:', error);
      setError(extractErrorMessage(error, '파일 업로드 중 오류가 발생했습니다.'));
      setUploadProgress(0);
    } finally {
      setUploading(false);
    }
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const getFileTypeLabel = () => {
    switch (fileType) {
      case 'transcript': return '성적표';
      case 'certificate': return '증명서';
      case 'photo': return '사진';
      default: return '문서';
    }
  };

  return (
    <Paper elevation={2} sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        {getFileTypeLabel()} 업로드
      </Typography>

      <input
        ref={fileInputRef}
        type="file"
        multiple={multiple}
        onChange={handleFileSelect}
        style={{ display: 'none' }}
        accept={fileType === 'photo' ? 'image/*' : '*'}
      />

      <Box sx={{ mb: 2 }}>
        <Button
          variant="outlined"
          startIcon={<CloudUpload />}
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          fullWidth
        >
          파일 선택 {multiple && '(여러 개 가능)'}
        </Button>
      </Box>

      {files.length > 0 && (
        <List dense>
          {files.map((file, index) => (
            <ListItem key={index}>
              {getFileIcon(file)}
              <ListItemText
                primary={file.name}
                secondary={formatFileSize(file.size)}
                sx={{ ml: 1 }}
              />
              <ListItemSecondaryAction>
                <IconButton
                  edge="end"
                  onClick={() => removeFile(index)}
                  disabled={uploading}
                >
                  <Delete />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
      )}

      {uploadProgress > 0 && (
        <Box sx={{ mt: 2 }}>
          <LinearProgress variant="determinate" value={uploadProgress} />
          <Typography variant="caption" sx={{ mt: 1 }}>
            업로드 중... {uploadProgress}%
          </Typography>
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mt: 2 }}>
          {success}
        </Alert>
      )}

      {files.length > 0 && (
        <Box sx={{ mt: 2 }}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleUpload}
            disabled={uploading}
            fullWidth
          >
            업로드
          </Button>
        </Box>
      )}

      <Box sx={{ mt: 2 }}>
        <Chip
          size="small"
          label={`최대 ${maxSize}MB`}
          variant="outlined"
        />
        <Chip
          size="small"
          label={fileType === 'photo' ? '이미지 파일만' : '모든 파일 가능'}
          variant="outlined"
          sx={{ ml: 1 }}
        />
      </Box>
    </Paper>
  );
};

export default FileUpload;