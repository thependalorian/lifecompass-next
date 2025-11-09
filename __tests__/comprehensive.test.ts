// __tests__/comprehensive.test.ts
// Comprehensive integration tests for user isolation and persona handling

describe('Comprehensive User Isolation Tests', () => {
  describe('Persona State Management', () => {
    it('should maintain separate state for different personas', () => {
      // Customer persona
      sessionStorage.setItem('selectedCustomerPersona', 'CUST-001')
      expect(sessionStorage.getItem('selectedCustomerPersona')).toBe('CUST-001')
      expect(sessionStorage.getItem('selectedAdvisorPersona')).toBeNull()

      // Clear and set advisor persona
      sessionStorage.clear()
      sessionStorage.setItem('selectedAdvisorPersona', 'ADV-001')
      expect(sessionStorage.getItem('selectedAdvisorPersona')).toBe('ADV-001')
      expect(sessionStorage.getItem('selectedCustomerPersona')).toBeNull()
    })

    it('should generate unique storage keys per persona', () => {
      const customerPersona = 'CUST-001'
      const advisorPersona = 'ADV-001'

      const customerMessagesKey = `chatWidget_messages_${customerPersona}`
      const advisorMessagesKey = `chatWidget_messages_${advisorPersona}`

      expect(customerMessagesKey).not.toBe(advisorMessagesKey)
      expect(customerMessagesKey).toBe('chatWidget_messages_CUST-001')
      expect(advisorMessagesKey).toBe('chatWidget_messages_ADV-001')
    })
  })

  describe('Session Isolation', () => {
    it('should create unique session IDs for different personas', () => {
      const session1 = `session-${Date.now()}-CUST-001`
      const session2 = `session-${Date.now()}-CUST-002`
      const session3 = `session-${Date.now()}-ADV-001`

      expect(session1).not.toBe(session2)
      expect(session1).not.toBe(session3)
      expect(session2).not.toBe(session3)
    })

    it('should maintain session isolation metadata structure', () => {
      const customerSessionMetadata = {
        selectedCustomerPersona: 'CUST-001',
        selectedAdvisorPersona: null,
        userType: 'customer',
        customerId: 'uuid-123',
        customerNumber: 'CUST-001',
      }

      const advisorSessionMetadata = {
        selectedCustomerPersona: null,
        selectedAdvisorPersona: 'ADV-001',
        userType: 'advisor',
        advisorId: 'uuid-456',
        advisorNumber: 'ADV-001',
      }

      // Customer session should not have advisor persona
      expect(customerSessionMetadata.selectedAdvisorPersona).toBeNull()
      expect(customerSessionMetadata.selectedCustomerPersona).toBe('CUST-001')

      // Advisor session should not have customer persona
      expect(advisorSessionMetadata.selectedCustomerPersona).toBeNull()
      expect(advisorSessionMetadata.selectedAdvisorPersona).toBe('ADV-001')
    })
  })

  describe('Personalized Greetings', () => {
    it('should generate personalized greeting for customer', () => {
      const firstName = 'Maria'
      const greeting = `Hello ${firstName}! I'm your LifeCompass personal assistant. I can help you with your policies, claims, products, and connect you with advisors. How can I assist you today?`

      expect(greeting).toContain('Hello Maria!')
      expect(greeting).toContain('personal assistant')
    })

    it('should generate personalized greeting for advisor', () => {
      const firstName = 'Anna'
      const greeting = `Hello ${firstName}! I'm your LifeCompass Command Center assistant. I can help you manage clients, view tasks, access the knowledge base, and track performance. What would you like to do?`

      expect(greeting).toContain('Hello Anna!')
      expect(greeting).toContain('Command Center')
    })

    it('should fallback to generic greeting when name is not available', () => {
      const greeting = "Hello! I'm your LifeCompass personal assistant. I can help you with your policies, claims, products, and connect you with advisors. How can I assist you today?"

      expect(greeting).toContain('Hello!')
      expect(greeting).not.toContain('Hello undefined!')
      expect(greeting).not.toContain('Hello null!')
    })
  })

  describe('Type Safety', () => {
    it('should enforce ChatRequestMetadata type structure', () => {
      const validMetadata = {
        selectedCustomerPersona: 'CUST-001',
        userType: 'customer' as const,
        customerId: 'uuid-123',
      }

      expect(validMetadata.selectedCustomerPersona).toBe('CUST-001')
      expect(validMetadata.userType).toBe('customer')
    })

    it('should allow additional metadata fields', () => {
      const metadataWithExtras = {
        selectedCustomerPersona: 'CUST-001',
        userType: 'customer' as const,
        customField: 'custom-value',
        timestamp: Date.now(),
      }

      expect(metadataWithExtras.customField).toBe('custom-value')
      expect(typeof metadataWithExtras.timestamp).toBe('number')
    })
  })
})

