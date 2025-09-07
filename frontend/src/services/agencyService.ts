// 유학원 데이터 캐싱 서비스
interface Agency {
  agency_id: number;
  agency_name: string;
  agency_code: string;
  contact_person?: string;
  phone?: string;
  email?: string;
}

class AgencyService {
  private static instance: AgencyService;
  private agencies: Agency[] = [];
  private lastFetch: number = 0;
  private cacheTimeout: number = 30 * 60 * 1000; // 30분
  private loading: boolean = false;
  private subscribers: Set<(agencies: Agency[]) => void> = new Set();

  private constructor() {}

  static getInstance(): AgencyService {
    if (!AgencyService.instance) {
      AgencyService.instance = new AgencyService();
    }
    return AgencyService.instance;
  }

  // 유학원 목록 가져오기 (캐싱 적용)
  async getAgencies(forceRefresh: boolean = false): Promise<Agency[]> {
    const now = Date.now();
    
    // 캐시가 유효하고 강제 새로고침이 아닌 경우
    if (!forceRefresh && this.agencies.length > 0 && 
        (now - this.lastFetch) < this.cacheTimeout) {
      return this.agencies;
    }

    // 이미 로딩 중이면 기다림
    if (this.loading) {
      return new Promise((resolve) => {
        const unsubscribe = this.subscribe((agencies) => {
          unsubscribe();
          resolve(agencies);
        });
      });
    }

    try {
      this.loading = true;
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/agencies', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        this.agencies = data.data || [];
        this.lastFetch = now;
        this.notifySubscribers();
        return this.agencies;
      }
      
      throw new Error(data.error || 'Failed to fetch agencies');
    } catch (error) {
      console.error('Failed to fetch agencies:', error);
      // 에러가 발생해도 이전 캐시 데이터를 반환
      return this.agencies;
    } finally {
      this.loading = false;
    }
  }

  // 캐시 무효화
  invalidateCache(): void {
    this.lastFetch = 0;
  }

  // 구독 관리
  subscribe(callback: (agencies: Agency[]) => void): () => void {
    this.subscribers.add(callback);
    return () => {
      this.subscribers.delete(callback);
    };
  }

  private notifySubscribers(): void {
    this.subscribers.forEach(callback => callback(this.agencies));
  }

  // 유학원 이름으로 검색
  findAgencyByName(name: string): Agency | undefined {
    return this.agencies.find(agency => 
      agency.agency_name.toLowerCase().includes(name.toLowerCase())
    );
  }

  // 유학원 코드로 검색
  findAgencyByCode(code: string): Agency | undefined {
    return this.agencies.find(agency => agency.agency_code === code);
  }
}

export default AgencyService.getInstance();