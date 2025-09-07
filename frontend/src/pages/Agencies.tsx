import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Button,
  Box,
  IconButton,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Stack
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Business
} from '@mui/icons-material';
import Layout from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';
import { extractErrorMessage } from '../utils/errorHandler';

interface Agency {
  agency_id: number;
  agency_name: string;
  agency_code: string;
  contact_person?: string;
  phone?: string;
  email?: string;
  address?: string;
  created_at: string;
}

const Agencies: React.FC = () => {
  const { user } = useAuth();
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // 모달 관련 상태
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingAgency, setEditingAgency] = useState<Agency | null>(null);
  const [formData, setFormData] = useState({
    agency_name: '',
    agency_code: '',
    contact_person: '',
    phone: '',
    email: '',
    address: ''
  });

  useEffect(() => {
    loadAgencies();
  }, []);

  const loadAgencies = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/agencies', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      
      if (data.success) {
        setAgencies(data.data || []);
      }
    } catch (error: any) {
      console.error('Failed to load agencies:', error);
      setError(extractErrorMessage(error, '유학원 목록을 불러오는데 실패했습니다.'));
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAddModal = () => {
    setEditingAgency(null);
    setFormData({
      agency_name: '',
      agency_code: '',
      contact_person: '',
      phone: '',
      email: '',
      address: ''
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (agency: Agency) => {
    setEditingAgency(agency);
    setFormData({
      agency_name: agency.agency_name,
      agency_code: agency.agency_code,
      contact_person: agency.contact_person || '',
      phone: agency.phone || '',
      email: agency.email || '',
      address: agency.address || ''
    });
    setIsAddModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsAddModalOpen(false);
    setEditingAgency(null);
    setFormData({
      agency_name: '',
      agency_code: '',
      contact_person: '',
      phone: '',
      email: '',
      address: ''
    });
  };

  const handleChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const handleSubmit = async () => {
    if (!formData.agency_name || !formData.agency_code) {
      setError('유학원명과 코드는 필수입니다.');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const url = editingAgency 
        ? `http://localhost:5000/api/agencies/${editingAgency.agency_id}`
        : 'http://localhost:5000/api/agencies';
      
      const response = await fetch(url, {
        method: editingAgency ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      
      if (response.ok && data.success) {
        setSuccess(data.message_ko || '유학원이 저장되었습니다.');
        handleCloseModal();
        loadAgencies();
      } else {
        setError(extractErrorMessage(data, '유학원 저장에 실패했습니다.'));
      }
    } catch (error: any) {
      console.error('Failed to save agency:', error);
      setError(extractErrorMessage(error, '유학원 저장 중 오류가 발생했습니다.'));
    }
  };

  const handleDelete = async (agencyId: number) => {
    if (!window.confirm('정말로 이 유학원을 삭제하시겠습니까?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/agencies/${agencyId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      
      if (response.ok && data.success) {
        setSuccess(data.message_ko || '유학원이 삭제되었습니다.');
        loadAgencies();
      } else {
        setError(extractErrorMessage(data, '유학원 삭제에 실패했습니다.'));
      }
    } catch (error: any) {
      console.error('Failed to delete agency:', error);
      setError(extractErrorMessage(error, '유학원 삭제 중 오류가 발생했습니다.'));
    }
  };

  // 관리자가 아닌 경우 접근 제한
  if (user?.role !== 'admin') {
    return (
      <Layout>
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
          <Alert severity="warning">
            관리자만 접근할 수 있는 페이지입니다.
          </Alert>
        </Container>
      </Layout>
    );
  }

  return (
    <Layout>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Business color="primary" fontSize="large" />
            <Typography variant="h4">
              유학원 관리
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleOpenAddModal}
          >
            유학원 추가
          </Button>
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

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>유학원 코드</TableCell>
                <TableCell>유학원명</TableCell>
                <TableCell>담당자</TableCell>
                <TableCell>연락처</TableCell>
                <TableCell>이메일</TableCell>
                <TableCell>주소</TableCell>
                <TableCell align="center">작업</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    로딩 중...
                  </TableCell>
                </TableRow>
              ) : agencies.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    등록된 유학원이 없습니다.
                  </TableCell>
                </TableRow>
              ) : (
                agencies.map((agency) => (
                  <TableRow key={agency.agency_id}>
                    <TableCell>{agency.agency_code}</TableCell>
                    <TableCell>{agency.agency_name}</TableCell>
                    <TableCell>{agency.contact_person || '-'}</TableCell>
                    <TableCell>{agency.phone || '-'}</TableCell>
                    <TableCell>{agency.email || '-'}</TableCell>
                    <TableCell>{agency.address || '-'}</TableCell>
                    <TableCell align="center">
                      <IconButton
                        size="small"
                        onClick={() => handleOpenEditModal(agency)}
                        color="primary"
                      >
                        <Edit />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDelete(agency.agency_id)}
                        color="error"
                      >
                        <Delete />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* 유학원 추가/수정 모달 */}
        <Dialog open={isAddModalOpen} onClose={handleCloseModal} maxWidth="sm" fullWidth>
          <DialogTitle>
            {editingAgency ? '유학원 수정' : '유학원 추가'}
          </DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ mt: 2 }}>
              <TextField
                fullWidth
                label="유학원 코드 *"
                value={formData.agency_code}
                onChange={handleChange('agency_code')}
                disabled={!!editingAgency}
                helperText="예: HANOI001 (수정 불가)"
                required
              />
              <TextField
                fullWidth
                label="유학원명 *"
                value={formData.agency_name}
                onChange={handleChange('agency_name')}
                required
              />
              <TextField
                fullWidth
                label="담당자"
                value={formData.contact_person}
                onChange={handleChange('contact_person')}
              />
              <TextField
                fullWidth
                label="연락처"
                value={formData.phone}
                onChange={handleChange('phone')}
              />
              <TextField
                fullWidth
                label="이메일"
                type="email"
                value={formData.email}
                onChange={handleChange('email')}
              />
              <TextField
                fullWidth
                label="주소"
                value={formData.address}
                onChange={handleChange('address')}
                multiline
                rows={2}
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseModal}>취소</Button>
            <Button onClick={handleSubmit} variant="contained">
              {editingAgency ? '수정' : '추가'}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Layout>
  );
};

export default Agencies;