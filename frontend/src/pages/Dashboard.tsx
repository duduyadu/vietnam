import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Container,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  Chip,
  Divider
} from '@mui/material';
import {
  School,
  People,
  Assignment,
  TrendingUp,
  Event,
  Person
} from '@mui/icons-material';
import Layout from '../components/Layout';
import api from '../services/api';

interface DashboardStats {
  totalStudents: number;
  activeStudents: number;
  graduatedStudents: number;
  monthlyConsultations: number;
}

interface Activity {
  consultation_id: number;
  consultation_date: string;
  consultation_type: string;
  summary: string;
  student_id: number;
  student_code: string;
  student_name: string;
}

interface DashboardData {
  stats: DashboardStats;
  recentActivities: Activity[];
  upcomingConsultations: Activity[];
}

const Dashboard: React.FC = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const response = await api.get('/dashboard/stats');
      setDashboardData(response.data.data);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const stats = dashboardData ? [
    {
      title: '전체 학생 수',
      value: dashboardData.stats.totalStudents.toString(),
      icon: <School />,
      color: '#1976d2'
    },
    {
      title: '재학 중',
      value: dashboardData.stats.activeStudents.toString(),
      icon: <People />,
      color: '#4caf50'
    },
    {
      title: '이번 달 상담',
      value: dashboardData.stats.monthlyConsultations.toString(),
      icon: <Assignment />,
      color: '#ff9800'
    },
    {
      title: '졸업생',
      value: dashboardData.stats.graduatedStudents.toString(),
      icon: <TrendingUp />,
      color: '#9c27b0'
    }
  ] : [];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getConsultationType = (type: string) => {
    switch(type) {
      case 'regular': return '정기상담';
      case 'special': return '특별상담';
      case 'academic': return '학업상담';
      case 'career': return '진로상담';
      default: return type;
    }
  };

  if (loading) {
    return (
      <Layout>
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
            <CircularProgress />
          </Box>
        </Container>
      </Layout>
    );
  }

  return (
    <Layout>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          {t('menu.dashboard')}
        </Typography>
        
        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: { 
            xs: '1fr', 
            sm: '1fr 1fr', 
            md: '1fr 1fr 1fr 1fr' 
          }, 
          gap: 3 
        }}>
          {stats.map((stat, index) => (
            <Card key={index}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 48,
                      height: 48,
                      borderRadius: '50%',
                      backgroundColor: `${stat.color}20`,
                      color: stat.color,
                      mr: 2
                    }}
                  >
                    {stat.icon}
                  </Box>
                  <Box>
                    <Typography color="textSecondary" variant="body2">
                      {stat.title}
                    </Typography>
                    <Typography variant="h4">
                      {stat.value}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>

        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: { 
            xs: '1fr', 
            md: '2fr 1fr' 
          }, 
          gap: 3,
          mt: 3
        }}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <Event sx={{ mr: 1 }} />
              최근 활동
            </Typography>
            <Divider sx={{ mb: 2 }} />
            {dashboardData?.recentActivities.length === 0 ? (
              <Typography color="textSecondary">
                최근 활동 내역이 없습니다.
              </Typography>
            ) : (
              <List>
                {dashboardData?.recentActivities.map((activity, index) => (
                  <ListItem key={activity.consultation_id} divider={index < dashboardData.recentActivities.length - 1}>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Person fontSize="small" />
                          <Typography variant="body1">
                            {activity.student_name || '이름 없음'} ({activity.student_code})
                          </Typography>
                          <Chip 
                            label={getConsultationType(activity.consultation_type)} 
                            size="small" 
                            color="primary"
                            variant="outlined"
                          />
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" color="textSecondary">
                            {formatDate(activity.consultation_date)}
                          </Typography>
                          {activity.summary && (
                            <Typography variant="body2" sx={{ mt: 0.5 }}>
                              {activity.summary}
                            </Typography>
                          )}
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </Paper>
          
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <Assignment sx={{ mr: 1 }} />
              다가오는 일정
            </Typography>
            <Divider sx={{ mb: 2 }} />
            {dashboardData?.upcomingConsultations.length === 0 ? (
              <Typography color="textSecondary">
                예정된 상담 일정이 없습니다.
              </Typography>
            ) : (
              <List>
                {dashboardData?.upcomingConsultations.map((consultation, index) => (
                  <ListItem key={consultation.consultation_id} divider={index < dashboardData.upcomingConsultations.length - 1}>
                    <ListItemText
                      primary={
                        <Typography variant="body2">
                          {consultation.student_name || '이름 없음'}
                        </Typography>
                      }
                      secondary={
                        <Box>
                          <Typography variant="caption" color="textSecondary">
                            {formatDate(consultation.consultation_date)}
                          </Typography>
                          <Typography variant="caption" display="block">
                            {getConsultationType(consultation.consultation_type)}
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </Paper>
        </Box>
      </Container>
    </Layout>
  );
};

export default Dashboard;