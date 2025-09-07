import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  TextField,
  MenuItem,
  CircularProgress,
  Alert
} from '@mui/material';
import { ArrowBack, Save } from '@mui/icons-material';
import Layout from '../components/Layout';
import { studentsAPI, agenciesAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const StudentEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string>('');
  const [agencies, setAgencies] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    name_ko: '',
    name_vi: '',
    birth_date: '',
    gender: '',
    phone: '',
    email: '',
    address_korea: '',
    address_vietnam: '',
    parent_name: '',
    parent_phone: '',
    parent_income: '',
    high_school: '',
    gpa: '',
    desired_major: '',
    desired_university: '',
    visa_type: '',
    visa_expiry: '',
    alien_registration: '',
    agency_id: '',
    status: 'studying'
  });

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const loadData = async () => {
    try {
      setLoading(true);
      // Load agencies
      const agenciesResponse = await agenciesAPI.getAll();
      setAgencies(agenciesResponse.data.data);
      
      // Load student data
      const studentResponse = await studentsAPI.getById(Number(id));
      const student = studentResponse.data.data;
      
      setFormData({
        name_ko: student.name_ko || '',
        name_vi: student.name_vi || '',
        birth_date: student.birth_date || '',
        gender: student.gender || '',
        phone: student.phone || '',
        email: student.email || '',
        address_korea: student.address_korea || '',
        address_vietnam: student.address_vietnam || '',
        parent_name: student.parent_name || '',
        parent_phone: student.parent_phone || '',
        parent_income: student.parent_income || '',
        high_school: student.high_school || '',
        gpa: student.gpa || '',
        desired_major: student.desired_major || '',
        desired_university: student.desired_university || '',
        visa_type: student.visa_type || '',
        visa_expiry: student.visa_expiry || '',
        alien_registration: student.alien_registration || '',
        agency_id: student.agency_id || '',
        status: student.status || 'studying'
      });
    } catch (error: any) {
      console.error('Failed to load data:', error);
      setError('데이터를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name_ko) {
      alert('한국 이름은 필수 입력 항목입니다.');
      return;
    }

    try {
      setSaving(true);
      await studentsAPI.update(Number(id), formData);
      alert('학생 정보가 수정되었습니다.');
      navigate(`/students/${id}`);
    } catch (error: any) {
      console.error('Failed to update student:', error);
      alert('학생 정보 수정에 실패했습니다.');
    } finally {
      setSaving(false);
    }
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
          <Button startIcon={<ArrowBack />} onClick={() => navigate('/students')} sx={{ mt: 2 }}>
            목록으로 돌아가기
          </Button>
        </Container>
      </Layout>
    );
  }

  // Check permissions
  if (user && user.role !== 'admin' && user.role !== 'teacher') {
    return (
      <Layout>
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
          <Alert severity="error">학생 정보를 수정할 권한이 없습니다.</Alert>
          <Button startIcon={<ArrowBack />} onClick={() => navigate('/students')} sx={{ mt: 2 }}>
            목록으로 돌아가기
          </Button>
        </Container>
      </Layout>
    );
  }

  return (
    <Layout>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4">학생 정보 수정</Typography>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate(`/students/${id}`)}
          >
            취소
          </Button>
        </Box>

        <Paper sx={{ p: 3 }}>
          <form onSubmit={handleSubmit}>
            <Box>
              <Typography variant="h6" gutterBottom>기본 정보</Typography>
              
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2, mb: 3 }}>
                <TextField
                  fullWidth
                  label="한국 이름 *"
                  name="name_ko"
                  value={formData.name_ko}
                  onChange={handleChange}
                  required
                />
                
                <TextField
                  fullWidth
                  label="베트남 이름"
                  name="name_vi"
                  value={formData.name_vi}
                  onChange={handleChange}
                />
              </Box>
              
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 2, mb: 3 }}>
                <TextField
                  fullWidth
                  label="생년월일"
                  name="birth_date"
                  type="date"
                  value={formData.birth_date}
                  onChange={handleChange}
                  InputLabelProps={{ shrink: true }}
                />
                
                <TextField
                  fullWidth
                  select
                  label="성별"
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                >
                  <MenuItem value="">선택</MenuItem>
                  <MenuItem value="남성">남성</MenuItem>
                  <MenuItem value="여성">여성</MenuItem>
                </TextField>
                
                <TextField
                  fullWidth
                  select
                  label="상태"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                >
                  <MenuItem value="studying">재학중</MenuItem>
                  <MenuItem value="graduated">졸업</MenuItem>
                  <MenuItem value="withdrawn">휴학/중퇴</MenuItem>
                </TextField>
              </Box>

              <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>연락처 정보</Typography>
              
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2, mb: 3 }}>
                <TextField
                  fullWidth
                  label="전화번호"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                />
                
                <TextField
                  fullWidth
                  label="이메일"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                />
                
                <TextField
                  fullWidth
                  label="한국 주소"
                  name="address_korea"
                  value={formData.address_korea}
                  onChange={handleChange}
                />
                
                <TextField
                  fullWidth
                  label="베트남 주소"
                  name="address_vietnam"
                  value={formData.address_vietnam}
                  onChange={handleChange}
                />
              </Box>

              <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>학부모 정보</Typography>
              
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 2, mb: 3 }}>
                <TextField
                  fullWidth
                  label="학부모 이름"
                  name="parent_name"
                  value={formData.parent_name}
                  onChange={handleChange}
                />
                
                <TextField
                  fullWidth
                  label="학부모 연락처"
                  name="parent_phone"
                  value={formData.parent_phone}
                  onChange={handleChange}
                />
                
                <TextField
                  fullWidth
                  label="학부모 소득"
                  name="parent_income"
                  value={formData.parent_income}
                  onChange={handleChange}
                />
              </Box>

              <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>학업 정보</Typography>
              
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2, mb: 3 }}>
                <TextField
                  fullWidth
                  select
                  label="소속 유학원"
                  name="agency_id"
                  value={formData.agency_id}
                  onChange={handleChange}
                >
                  <MenuItem value="">선택</MenuItem>
                  {agencies.map(agency => (
                    <MenuItem key={agency.agency_id} value={agency.agency_id}>
                      {agency.agency_name}
                    </MenuItem>
                  ))}
                </TextField>
                
                <TextField
                  fullWidth
                  label="고등학교"
                  name="high_school"
                  value={formData.high_school}
                  onChange={handleChange}
                />
              </Box>
              
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 2, mb: 3 }}>
                <TextField
                  fullWidth
                  label="GPA"
                  name="gpa"
                  value={formData.gpa}
                  onChange={handleChange}
                />
                
                <TextField
                  fullWidth
                  label="희망 전공"
                  name="desired_major"
                  value={formData.desired_major}
                  onChange={handleChange}
                />
                
                <TextField
                  fullWidth
                  label="희망 대학"
                  name="desired_university"
                  value={formData.desired_university}
                  onChange={handleChange}
                />
              </Box>

              <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>비자 정보</Typography>
              
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 2, mb: 3 }}>
                <TextField
                  fullWidth
                  label="비자 종류"
                  name="visa_type"
                  value={formData.visa_type}
                  onChange={handleChange}
                />
                
                <TextField
                  fullWidth
                  label="비자 만료일"
                  name="visa_expiry"
                  type="date"
                  value={formData.visa_expiry}
                  onChange={handleChange}
                  InputLabelProps={{ shrink: true }}
                />
                
                <TextField
                  fullWidth
                  label="외국인 등록번호"
                  name="alien_registration"
                  value={formData.alien_registration}
                  onChange={handleChange}
                />
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 3 }}>
                <Button
                  variant="outlined"
                  onClick={() => navigate(`/students/${id}`)}
                >
                  취소
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={<Save />}
                  disabled={saving}
                >
                  {saving ? '저장 중...' : '저장'}
                </Button>
              </Box>
            </Box>
          </form>
        </Paper>
      </Container>
    </Layout>
  );
};

export default StudentEdit;