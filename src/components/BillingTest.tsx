import React, { useState } from 'react';
import { billingService } from '../services/billingService';

const BillingTest: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string>('');

  const testBillingAPI = async () => {
    setLoading(true);
    setResult('테스트 중...');
    
    try {
      // 1. 요금제 목록 조회 테스트
      const plansResponse = await billingService.getAvailablePlans();
      console.log('Plans Response:', plansResponse);
      
      if (plansResponse.success) {
        setResult(`✅ 요금제 목록 조회 성공: ${plansResponse.data.length}개 요금제`);
      } else {
        setResult(`❌ 요금제 목록 조회 실패: ${plansResponse.error}`);
      }
      
      // 2. 현재 요금제 조회 테스트
      const currentPlanResponse = await billingService.getCurrentPlan();
      console.log('Current Plan Response:', currentPlanResponse);
      
      if (currentPlanResponse.success) {
        setResult(prev => prev + `\n✅ 현재 요금제 조회 성공: ${currentPlanResponse.data.plan.name}`);
      } else {
        setResult(prev => prev + `\n❌ 현재 요금제 조회 실패: ${currentPlanResponse.error}`);
      }
      
    } catch (error) {
      console.error('Billing API Test Error:', error);
      setResult(`❌ 예상치 못한 오류: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', border: '1px solid #ccc', margin: '20px' }}>
      <h3>Billing API 테스트</h3>
      <button 
        onClick={testBillingAPI} 
        disabled={loading}
        style={{ 
          padding: '10px 20px', 
          backgroundColor: loading ? '#ccc' : '#007bff', 
          color: 'white', 
          border: 'none', 
          borderRadius: '4px',
          cursor: loading ? 'not-allowed' : 'pointer'
        }}
      >
        {loading ? '테스트 중...' : 'Billing API 테스트'}
      </button>
      
      <div style={{ marginTop: '20px' }}>
        <h4>결과:</h4>
        <pre style={{ 
          backgroundColor: '#f5f5f5', 
          padding: '10px', 
          borderRadius: '4px',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word'
        }}>
          {result}
        </pre>
      </div>
    </div>
  );
};

export default BillingTest;
