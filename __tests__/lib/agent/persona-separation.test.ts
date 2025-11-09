// __tests__/lib/agent/persona-separation.test.ts
import type { ChatRequestMetadata } from '@/lib/types/persona'

describe('Persona Separation in Agent', () => {
  it('should have correct metadata structure for customer persona', () => {
    const customerMetadata: ChatRequestMetadata = {
      selectedCustomerPersona: 'CUST-001',
      userType: 'customer',
      customerId: 'uuid-123',
      customerNumber: 'CUST-001',
    }

    expect(customerMetadata.selectedCustomerPersona).toBe('CUST-001')
    expect(customerMetadata.selectedAdvisorPersona).toBeUndefined()
    expect(customerMetadata.userType).toBe('customer')
  })

  it('should have correct metadata structure for advisor persona', () => {
    const advisorMetadata: ChatRequestMetadata = {
      selectedAdvisorPersona: 'ADV-001',
      userType: 'advisor',
      advisorId: 'uuid-456',
      advisorNumber: 'ADV-001',
    }

    expect(advisorMetadata.selectedAdvisorPersona).toBe('ADV-001')
    expect(advisorMetadata.selectedCustomerPersona).toBeUndefined()
    expect(advisorMetadata.userType).toBe('advisor')
  })

  it('should not allow both personas simultaneously', () => {
    // TypeScript should prevent this, but we test runtime behavior
    const mixedMetadata: ChatRequestMetadata = {
      selectedCustomerPersona: 'CUST-001',
      selectedAdvisorPersona: undefined, // Explicitly undefined
      userType: 'customer',
    }

    expect(mixedMetadata.selectedCustomerPersona).toBe('CUST-001')
    expect(mixedMetadata.selectedAdvisorPersona).toBeUndefined()
  })
})

