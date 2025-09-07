import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Box,
  Button,
  Typography,
  Avatar,
  Alert,
  CircularProgress,
  IconButton
} from '@mui/material';
import {
  PhotoCamera as PhotoCameraIcon,
  Delete as DeleteIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import axios from 'axios';
import { API_URL } from '../config';

interface StudentPhotoUploadProps {
  studentId: number;
  studentName: string;
  currentPhotoUrl?: string;
  onPhotoUpdate?: (photoUrl: string | null) => void;
}

const StudentPhotoUpload: React.FC<StudentPhotoUploadProps> = ({
  studentId,
  studentName,
  currentPhotoUrl,
  onPhotoUpdate
}) => {
  const [photoUrl, setPhotoUrl] = useState<string | null>(currentPhotoUrl || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // 파일 크기 체크 (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('파일 크기는 5MB 이하여야 합니다');
      return;
    }

    // 파일 타입 체크
    if (!['image/jpeg', 'image/jpg', 'image/png', 'image/gif'].includes(file.type)) {
      setError('JPG, PNG, GIF 파일만 업로드 가능합니다');
      return;
    }

    // 미리보기 생성
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // 업로드 실행
    uploadPhoto(file);
  };

  const uploadPhoto = async (file: File) => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');

      const formData = new FormData();
      formData.append('photo', file);

      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_URL}/api/students/${studentId}/photo`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      setPhotoUrl(response.data.photo_url);
      setPreviewUrl(null);
      setSuccess('사진이 업로드되었습니다');
      
      if (onPhotoUpdate) {
        onPhotoUpdate(response.data.photo_url);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || '사진 업로드 실패');
      setPreviewUrl(null);
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePhoto = async () => {
    if (!window.confirm('사진을 삭제하시겠습니까?')) return;

    try {
      setLoading(true);
      setError('');
      setSuccess('');

      const token = localStorage.getItem('token');
      await axios.delete(
        `${API_URL}/api/students/${studentId}/photo`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setPhotoUrl(null);
      setSuccess('사진이 삭제되었습니다');
      
      if (onPhotoUpdate) {
        onPhotoUpdate(null);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || '사진 삭제 실패');
    } finally {
      setLoading(false);
    }
  };

  const getPhotoUrl = () => {
    if (previewUrl) return previewUrl;
    if (photoUrl) {
      // 상대 경로인 경우 전체 URL로 변환
      if (photoUrl.startsWith('/')) {
        return `${API_URL}${photoUrl}`;
      }
      return photoUrl;
    }
    return null;
  };

  return (
    <Card sx={{ mt: 2 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          <PhotoCameraIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          학생 사진
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

        <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
          <Avatar
            src={getPhotoUrl() || undefined}
            sx={{
              width: 200,
              height: 200,
              bgcolor: 'grey.300',
              fontSize: 80
            }}
          >
            {!getPhotoUrl() && <PersonIcon sx={{ fontSize: 100 }} />}
          </Avatar>

          <Typography variant="body2" color="text.secondary">
            {studentName}
          </Typography>

          <Box display="flex" gap={2}>
            <input
              accept="image/jpeg,image/jpg,image/png,image/gif"
              style={{ display: 'none' }}
              id="photo-upload-input"
              type="file"
              onChange={handleFileSelect}
              disabled={loading}
            />
            <label htmlFor="photo-upload-input">
              <Button
                variant="contained"
                component="span"
                startIcon={<PhotoCameraIcon />}
                disabled={loading}
              >
                {photoUrl ? '사진 변경' : '사진 업로드'}
              </Button>
            </label>
            
            {photoUrl && !loading && (
              <IconButton 
                onClick={handleDeletePhoto} 
                color="error"
                disabled={loading}
              >
                <DeleteIcon />
              </IconButton>
            )}
          </Box>

          {loading && <CircularProgress size={24} />}

          <Typography variant="caption" color="text.secondary" textAlign="center">
            JPG, PNG, GIF 형식 (최대 5MB)
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default StudentPhotoUpload;