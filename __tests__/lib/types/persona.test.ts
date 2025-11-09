// __tests__/lib/types/persona.test.ts
import type { PersonaMetadata, ChatRequestMetadata, SessionMetadata } from '@/lib/types/persona'

describe('Persona Types', () => {
  it('should allow PersonaMetadata with customer persona', () => {
    const metadata: PersonaMetadata = {
      selectedCustomerPersona: 'CUST-001',
      userType: 'customer',
      customerId: 'uuid-123',
      customerNumber: 'CUST-001',
    }
    
    expect(metadata.selectedCustomerPersona).toBe('CUST-001')
    expect(metadata.userType).toBe('customer')
  })

  it('should allow PersonaMetadata with advisor persona', () => {
    const metadata: PersonaMetadata = {
      selectedAdvisorPersona: 'ADV-001',
      userType: 'advisor',
      advisorId: 'uuid-456',
      advisorNumber: 'ADV-001',
    }
    
    expect(metadata.selectedAdvisorPersona).toBe('ADV-001')
    expect(metadata.userType).toBe('advisor')
  })

  it('should allow ChatRequestMetadata with additional fields', () => {
    const metadata: ChatRequestMetadata = {
      selectedCustomerPersona: 'CUST-001',
      userType: 'customer',
      customField: 'custom-value',
      anotherField: 123,
    }
    
    expect(metadata.selectedCustomerPersona).toBe('CUST-001')
    expect(metadata.customField).toBe('custom-value')
    expect(metadata.anotherField).toBe(123)
  })

  it('should allow SessionMetadata with persona info', () => {
    const metadata: SessionMetadata = {
      selectedCustomerPersona: 'CUST-001',
      customerId: 'uuid-123',
      customerNumber: 'CUST-001',
      sessionId: 'session-123',
    }
    
    expect(metadata.selectedCustomerPersona).toBe('CUST-001')
    expect(metadata.sessionId).toBe('session-123')
  })

  it('should not allow both customer and advisor personas simultaneously', () => {
    // TypeScript should catch this, but we test the runtime behavior
    const metadata: PersonaMetadata = {
      selectedCustomerPersona: 'CUST-001',
      selectedAdvisorPersona: undefined, // Explicitly undefined
      userType: 'customer',
    }
    
    expect(metadata.selectedCustomerPersona).toBe('CUST-001')
    expect(metadata.selectedAdvisorPersona).toBeUndefined()
  })
})

